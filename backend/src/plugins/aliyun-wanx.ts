import { Context } from '@deepseek-ai/cordis';

export interface AliyunWanxConfig {
  apiKey: string;
}

export interface EcommerceSceneParams {
  baseImageUrl: string;
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

    const isDualImage = Boolean(logoImageUrl);
    this.ctx
      .logger('aliyun-wanx')
      .info(
        `🎨 调用 qwen-image-3.0 (${isDualImage ? '双图: 产品原型图 + Logo' : '单图刀版'}) 生成商拍大图: prompt="${prompt}"`
      );

    const instruction = isDualImage
      ? `图1是产品原型图，图2是企业品牌Logo图形。请将图2中的Logo精准、自然地印制在图1产品正面居中的醒目区域，表面采用【${
          craftPrompt || '金属激光镭雕，阳极氧化铝微烧蚀漫反射银白质感'
        }】工艺，使Logo顺应产品表面的3D立体透视、曲率与材质高光阴影，且严格保持图1产品外观与图2 Logo图形不变形；同时将该定制好Logo的产品置于以下商业摄影场景中：${prompt}`
      : `请严格保持参考图中的产品外观轮廓与表面定制Logo文字/图形100%不变形、不改字，将产品自然融合进以下商业摄影场景中，并为产品边缘添加真实的环境漫反射高光与底部接触阴影：${prompt}`;

    const count = Math.min(Math.max(n, 1), 4);
    const generateSingle = async (variantIdx: number): Promise<string> => {
      const lightingAngles = [
        '主视觉柔光棚拍视角',
        '午后暖调侧逆光微距质感',
        '高奢轮廓光景深特写',
        '自然漫反射呼吸感构图',
      ];
      const fullPrompt = `${instruction}（光影风格：${lightingAngles[variantIdx % lightingAngles.length]}）`;

      const messageContent: Array<{ image?: string; text?: string }> = [{ image: baseImageUrl }];
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
