import { Context, Service } from '@deepseek-ai/cordis';
import type { DshTraceEntry } from './dsh-tracer.js';

export interface AliyunChatConfig {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatJSONOptions {
  action?: string;
  jobId?: string;
  plugin?: string;
  modelOverride?: string;
  temperature?: number;
  maxAttempts?: number;
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    aliyunChat: AliyunChatService;
  }
}

/**
 * 阿里云百炼 LLM 对话服务 (DeepSeek Harness 微内核插件)
 */
export class AliyunChatService extends Service {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor(ctx: Context, config: AliyunChatConfig) {
    super(ctx, 'aliyunChat');
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1').replace(/\/+$/, '');
    this.defaultModel = config.defaultModel || 'qwen3.6-flash';
    this.ctx.logger('dsh:chat').info(`DeepSeek Harness 阿里云对话服务已装配 (默认模型: ${this.defaultModel})`);
  }

  /**
   * 1. 结构化 JSON 调用 (带自动 Trace 记录与指数重试)
   */
  public async chatJSON<T = any>(
    messages: ChatMessage[],
    options: ChatJSONOptions = {}
  ): Promise<T> {
    const action = options.action || 'chatJSON';
    const plugin = options.plugin || 'dsh:llm';
    const maxAttempts = options.maxAttempts || 3;
    const model = options.modelOverride || this.defaultModel;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const traceId = `trace-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const startTime = Date.now();

      try {
        const url = `${this.baseUrl}/chat/completions`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: options.temperature ?? 0.1,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`百炼 HTTP ${response.status}: ${errText}`);
        }

        const data: any = await response.json();
        const rawContent: string = data.choices?.[0]?.message?.content || '';

        // 尝试从返回内容中提取 JSON
        const jsonMatch = rawContent.match(/\[\s*\{[\s\S]*\}\s*\]/) || rawContent.match(/\{\s*[\s\S]*\s*\}/);
        if (!jsonMatch) {
          throw new Error(`模型未返回有效 JSON 格式: ${rawContent.slice(0, 200)}...`);
        }

        const parsed = JSON.parse(jsonMatch[0]);
        const latencyMs = Date.now() - startTime;

        // 向 DSH Tracer 上报 Trace
        if (this.ctx.tracer) {
          this.ctx.tracer.record({
            traceId,
            jobId: options.jobId,
            plugin,
            action,
            model,
            latencyMs,
            status: 'success',
            messages,
            rawOutput: rawContent,
            parsedResult: parsed,
            attempt,
            createdAt: Date.now(),
          });
        }

        return parsed as T;
      } catch (err: any) {
        lastError = err;
        const latencyMs = Date.now() - startTime;

        if (this.ctx.tracer) {
          this.ctx.tracer.record({
            traceId,
            jobId: options.jobId,
            plugin,
            action,
            model,
            latencyMs,
            status: attempt < maxAttempts ? 'retry' : 'failed',
            messages,
            error: err.message,
            attempt,
            createdAt: Date.now(),
          });
        }

        this.ctx.logger('dsh:chat').warn(
          `[Trace] ${action} 第 ${attempt}/${maxAttempts} 轮失败: ${err.message}`
        );

        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        }
      }
    }

    throw lastError || new Error(`${action} 经 ${maxAttempts} 次重试后仍未成功`);
  }

  /**
   * 2. 流式对话 (原生 SSE)
   */
  public async *streamChat(messages: ChatMessage[], modelOverride?: string) {
    if (!this.apiKey) {
      throw new Error('DASHSCOPE_API_KEY 未配置');
    }

    const model = modelOverride || this.defaultModel;
    const url = `${this.baseUrl}/chat/completions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      const errText = await response.text();
      throw new Error(`百炼 Chat 请求失败 (${response.status}): ${errText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const dataStr = trimmed.slice(6);
          if (dataStr === '[DONE]') return;
          try {
            const parsed = JSON.parse(dataStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch {
            // 忽略非 json 行
          }
        }
      }
    }
  }
}

export function apply(ctx: Context, config: AliyunChatConfig) {
  ctx.provide('aliyunChat', new AliyunChatService(ctx, config));
}
