import { Context } from '@deepseek-ai/cordis';

export interface AliyunWanxConfig {
  apiKey: string;
}

export interface EcommerceSceneParams {
  baseImageUrl?: string;
  logoImageUrl?: string;
  craftPrompt?: string;
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
 * 阿里云百炼 Qwen-Image-3.0 - 电商商品双图智能贴合 (产品原型图 + 企业 Logo) 与 2K 商拍光影生成服务
 * 支持两种模式：
 * 1. 双图 AI 原生融合 (推荐)：同时传入【图1 产品原型图】+【图2 企业 Logo 图】，由大模型自动完成 3D 透视贴合、激光镭雕/UV浮雕/烫金材质仿真与高奢场景布光。
 * 2. 单图刀版融合：传入前端 Fabric.js 合成好的 2D 贴花图，生成真实商业摄影背景。
 */
export class AliyunWanxService {
  private ctx: Context;
  private apiKey: string;

  constructor(ctx: Context, config: AliyunWanxConfig) {
    this.ctx = ctx;
    this.apiKey = config.apiKey;
    this.ctx.logger('aliyun-wanx').info('⚡ 阿里云百炼 Qwen-Image-3.0 双图智能贴合与商拍插件已就绪');
  }

  public async generateEcommerceScene({
    baseImageUrl,
    logoImageUrl,
    craftPrompt,
    prompt,
    n = 1,
  }: EcommerceSceneParams): Promise<string[]> {
    if (!this.apiKey) {
      throw new Error('DASHSCOPE_API_KEY 未配置，请在 .env.local 中配置阿里云百炼 API Key');
    }

    const isDualImage = Boolean(baseImageUrl && logoImageUrl);
    const hasBaseImage = Boolean(baseImageUrl);
    this.ctx
      .logger('aliyun-wanx')
      .info(
        `🎨 调用 qwen-image-3.0 (${isDualImage ? '双图融合' : hasBaseImage ? '参考图生图' : '纯文生图'}) 生成: prompt="${prompt}"`
      );

    const instruction = isDualImage
      ? `图1是商品原图，图2是参考图/Logo。请根据以下提示词将图1与图2自然融合并生成高质量商业摄影画面（严格保持商品结构与Logo特征不变形，画面不要生成多余促销文字水印）：${prompt}`
      : hasBaseImage
      ? `请严格保持参考图中的商品主体外观结构不变形，根据以下提示词生成高质量商业摄影画面（画面干净纯粹，不要生成多余促销文字水印）：${prompt}`
      : `${prompt}，大师级商业摄影质感，真实光影，超高清细节`;

    const count = Math.min(Math.max(n, 1), 4);
    const generateSingle = async (variantIdx: number): Promise<string> => {
      const shotAngles = [
        '主视觉棚拍视角，主体居中突出，柔和立体光影与真实接触阴影',
        '微距侧逆光质感视角，柔和景深，突出产品表面材质纹理与高光细节',
        '生活美学场景视角，自然晨光漫反射',
        '高级极简几何展台视角，轮廓光勾勒立体质感',
      ];
      const fullPrompt = count > 1 ? `${instruction}（镜头${variantIdx + 1}：${shotAngles[variantIdx % shotAngles.length]}）` : instruction;

      const messageContent: Array<{ image?: string; text?: string }> = [];
      if (baseImageUrl) {
        messageContent.push({ image: baseImageUrl });
      }
      if (logoImageUrl) {
        messageContent.push({ image: logoImageUrl });
      }
      messageContent.push({ text: fullPrompt });

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
                  content: messageContent,
                },
              ],
            },
            parameters: {
              size: '2048*2048',
              n: 1,
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
