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
 * 阿里云百炼 Qwen-Image-3.0 / Wan2.7-Image - 电商商品背景生成与光影融合服务
 * 支持直接传入前端 Fabric.js 导出的 data:image/png;base64,... 或公网图片 URL，
 * 保持商品主体与企业 Logo 零畸变，生成 2K 高奢背景与真实接触阴影。
 */
export class AliyunWanxService {
  private ctx: Context;
  private apiKey: string;

  constructor(ctx: Context, config: AliyunWanxConfig) {
    this.ctx = ctx;
    this.apiKey = config.apiKey;
    this.ctx.logger('aliyun-wanx').info('⚡ 阿里云百炼 Qwen-Image-3.0 商品光影插件已就绪');
  }

  public async generateEcommerceScene({
    baseImageUrl,
    prompt,
    n = 1,
  }: EcommerceSceneParams): Promise<string[]> {
    if (!this.apiKey) {
      throw new Error('DASHSCOPE_API_KEY 未配置，请在 .env.local 中配置阿里云百炼 API Key');
    }

    this.ctx.logger('aliyun-wanx').info(`🎨 调用 qwen-image-3.0 生成商拍大图: prompt="${prompt}"`);

    const instruction = `请严格保持参考图中的产品外观轮廓与表面定制Logo文字/图形100%不变形、不改字，将产品自然融合进以下商业摄影场景中，并为产品边缘添加真实的环境漫反射高光与底部接触阴影：${prompt}`;

    const count = Math.min(Math.max(n, 1), 4);
    const generateSingle = async (variantIdx: number): Promise<string> => {
      const lightingAngles = [
        '主视觉柔光棚拍视角',
        '午后暖调侧逆光微距质感',
        '高奢轮廓光景深特写',
        '自然漫反射呼吸感构图'
      ];
      const fullPrompt = `${instruction}（光影风格：${lightingAngles[variantIdx % lightingAngles.length]}）`;

      const res = await fetch(
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'qwen-image-3.0',
            input: {
              messages: [
                {
                  role: 'user',
                  content: [
                    { image: baseImageUrl },
                    { text: fullPrompt },
                  ],
                },
              ],
            },
          }),
        }
      );

      const data = (await res.json()) as any;
      if (!res.ok) {
        throw new Error(`百炼 Qwen-Image-3.0 请求失败 (${res.status}): ${JSON.stringify(data)}`);
      }

      const contentList = data.output?.choices?.[0]?.message?.content || [];
      const imgItem = contentList.find((item: any) => item.image);
      if (!imgItem?.image) {
        throw new Error(`未返回有效图片 URL: ${JSON.stringify(data)}`);
      }

      return imgItem.image;
    };

    // 并行请求生成多张不同光影变体 (默认可生成 1~2 张极速返回或按需并发)
    const targetCount = Math.min(count, 2);
    const urls = await Promise.all(
      Array.from({ length: targetCount }, (_, idx) => generateSingle(idx))
    );

    this.ctx.logger('aliyun-wanx').info(`🎉 成功通过 Qwen-Image-3.0 生成 ${urls.length} 张 2K 商拍大图！`);
    return urls;
  }
}

export function apply(ctx: Context, config: AliyunWanxConfig) {
  const service = new AliyunWanxService(ctx, config);
  ctx.provide('aliyunWanx', service);
}
