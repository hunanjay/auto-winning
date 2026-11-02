import { Context } from '@deepseek-ai/cordis';

export interface AliyunWanxConfig {
  apiKey: string;
}

export interface EcommerceSceneParams {
  baseImageUrl: string;
  prompt: string;
  n?: number;
  noiseLevel?: number;
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    aliyunWanx: AliyunWanxService;
  }
}

/**
 * 阿里云百炼 通义万相 - 电商商品背景生成与光影融合服务
 */
export class AliyunWanxService {
  private ctx: Context;
  private apiKey: string;

  constructor(ctx: Context, config: AliyunWanxConfig) {
    this.ctx = ctx;
    this.apiKey = config.apiKey;
    this.ctx.logger('aliyun-wanx').info('⚡ 阿里云通义万相商品光影插件已就绪');
  }

  public async generateEcommerceScene({
    baseImageUrl,
    prompt,
    n = 4,
    noiseLevel = 300,
  }: EcommerceSceneParams): Promise<string[]> {
    if (!this.apiKey) {
      throw new Error('DASHSCOPE_API_KEY 未配置，请在 backend/.env 中配置阿里云百炼 API Key');
    }

    this.ctx.logger('aliyun-wanx').info(`🎨 提交商品背景生成任务: prompt="${prompt}"`);

    // 1. 提交异步生成任务给百炼
    const submitRes = await fetch(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/background-generation/generation',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-DashScope-Async': 'enable',
        },
        body: JSON.stringify({
          model: 'wanx-background-generation-v2',
          input: {
            base_image_url: baseImageUrl,
          },
          parameters: {
            prompt: prompt,
            n: n,
            noise_level: noiseLevel, // 保护前景Logo与商品本体边缘
          },
        }),
      }
    );

    const submitData = (await submitRes.json()) as any;
    if (!submitRes.ok || !submitData.output?.task_id) {
      throw new Error(`百炼任务创建失败: ${JSON.stringify(submitData)}`);
    }

    const taskId = submitData.output.task_id;
    this.ctx.logger('aliyun-wanx').info(`⏳ 任务已提交，TaskID: ${taskId}，等待生成结果...`);

    // 2. 轮询任务状态 (通常 3~6 秒)
    return await this.pollWanxTask(taskId);
  }

  private async pollWanxTask(taskId: string): Promise<string[]> {
    const url = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;
    const maxAttempts = 30;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      const data = (await res.json()) as any;

      const status = data.output?.task_status;
      if (status === 'SUCCEEDED') {
        const results: string[] = (data.output?.results || []).map((r: any) => r.url);
        this.ctx.logger('aliyun-wanx').info(`🎉 任务完成！成功生成 ${results.length} 张商拍方案`);
        return results;
      }

      if (status === 'FAILED') {
        throw new Error(`百炼生图任务执行失败: ${data.output?.message || '未知错误'}`);
      }
    }

    throw new Error('生图任务超时（超过 60 秒）');
  }
}

export function apply(ctx: Context, config: AliyunWanxConfig) {
  const service = new AliyunWanxService(ctx, config);
  ctx.provide('aliyunWanx', service);
}
