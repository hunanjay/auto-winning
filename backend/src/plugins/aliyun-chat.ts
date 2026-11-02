import { Context } from '@deepseek-ai/cordis';

export interface AliyunChatConfig {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    aliyunChat: AliyunChatService;
  }
}

/**
 * 阿里云百炼 LLM 对话服务 (支持 Qwen / DeepSeek，兼容 OpenAI 规范)
 */
export class AliyunChatService {
  private ctx: Context;
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor(ctx: Context, config: AliyunChatConfig) {
    this.ctx = ctx;
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1').replace(/\/+$/, '');
    this.defaultModel = config.defaultModel || 'qwen3.6-flash';
    this.ctx.logger('aliyun-chat').info(`⚡ 阿里云百炼对话插件就绪 (模型: ${this.defaultModel})`);
  }

  public async *streamChat(messages: ChatMessage[], modelOverride?: string) {
    if (!this.apiKey) {
      throw new Error('DASHSCOPE_API_KEY 未配置，请在 backend/.env 中配置');
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
            // 忽略 ping 或非 json 行
          }
        }
      }
    }
  }
}

export function apply(ctx: Context, config: AliyunChatConfig) {
  const service = new AliyunChatService(ctx, config);
  ctx.provide('aliyunChat', service);
}
