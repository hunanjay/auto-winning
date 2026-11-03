import { Context, Service } from '@deepseek-ai/cordis';

export interface DshTraceEntry {
  traceId: string;
  jobId?: string;
  plugin: string;         // 如 'dsh:slicer:llm' | 'dsh:chat' | 'dsh:wanx'
  action: string;         // 如 'segmentProducts' | 'clipsForProduct'
  model: string;          // 如 'qwen3.6-flash'
  latencyMs: number;      // 毫秒
  status: 'success' | 'failed' | 'retry';
  messages: Array<{ role: string; content: string }>;
  rawOutput?: string;
  parsedResult?: any;
  error?: string;
  attempt?: number;
  createdAt: number;
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    tracer: DshTracerService;
  }
}

/**
 * -------------------------------------------------------------
 * DeepSeek Harness (DSH) 全局调用链路追踪服务 (Tracer)
 * -------------------------------------------------------------
 * 统一拦截并记录所有通过 DSH 微内核调用的 AI 任务 (LLM、生图、切片等)。
 */
export class DshTracerService extends Service {
  private traces: DshTraceEntry[] = [];
  private maxTraces: number = 200;

  constructor(ctx: Context) {
    super(ctx, 'tracer');
    this.ctx.logger('dsh:tracer').info('DeepSeek Harness Tracer 服务已就绪');
  }

  /**
   * 记录一笔 AI Trace
   */
  public record(entry: DshTraceEntry) {
    this.traces.unshift(entry);
    if (this.traces.length > this.maxTraces) {
      this.traces.pop();
    }
    const durationSec = (entry.latencyMs / 1000).toFixed(2);
    this.ctx.logger('dsh:trace').info(
      `[${entry.plugin}] ${entry.action} -> ${entry.status} (${durationSec}s, traceId: ${entry.traceId})`
    );
  }

  /**
   * 获取 Trace 列表
   */
  public list(filter?: { jobId?: string; action?: string; limit?: number }): DshTraceEntry[] {
    let result = this.traces;
    if (filter?.jobId) {
      result = result.filter((t) => t.jobId === filter.jobId);
    }
    if (filter?.action) {
      result = result.filter((t) => t.action === filter.action);
    }
    if (filter?.limit) {
      result = result.slice(0, filter.limit);
    }
    return result;
  }

  /**
   * 获取单笔 Trace 详情
   */
  public get(traceId: string): DshTraceEntry | undefined {
    return this.traces.find((t) => t.traceId === traceId);
  }

  /**
   * 清空 Trace
   */
  public clear() {
    this.traces = [];
  }
}

export function apply(ctx: Context) {
  ctx.provide('tracer', new DshTracerService(ctx));
}
