import { Context, Service } from '@deepseek-ai/cordis';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface GptImageStyleConfig {
  cdnBaseUrl?: string;
  dataDir?: string;
}

export interface StyleCategory {
  id: string;
  value: string;
  anchor: string;
  templateAnchor: string;
  cover: string;
  title: { en: string; zh: string };
  description: { en: string; zh: string };
}

export interface StyleTagItem {
  id: string;
  value: string;
  title: { en: string; zh: string };
  keywords?: string[];
}

export interface IndustrialTemplate {
  id: string;
  anchor: string;
  cover: string;
  title: { en: string; zh: string };
  description: { en: string; zh: string };
  category: string;
  styles: string[];
  scenes: string[];
  tags: string[];
  useWhen: { en: string; zh: string };
  guidance: { en: string[]; zh: string[] };
  pitfalls: { en: string[]; zh: string[] };
  exampleCases: number[];
}

export interface PromptCaseItem {
  id: number;
  title: string;
  image: string;
  imageUrl: string;
  imageAlt?: string;
  sourceLabel?: string;
  sourceUrl?: string;
  prompt: string;
  promptPreview?: string;
  category: string;
  styles: string[];
  scenes: string[];
  featured?: boolean;
  githubUrl?: string;
}

export interface ComposePromptParams {
  templateId?: string;
  subject: string;
  category?: string;
  visualStyle?: string;
  composition?: string;
  materialsAndLighting?: string;
  textRequirements?: string;
  aspectRatio?: string;
  negativeConstraints?: string;
  language?: 'zh' | 'en';
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    gptImageStyle: GptImageStyleService;
  }
}

/**
 * -------------------------------------------------------------
 * DeepSeek Harness (DSH) 插件：GPT-Image-2 工业级风格库与提示词引擎
 * -------------------------------------------------------------
 * 整合 awesome-gpt-image-2 仓库中 540+ 真实案例、22+ 工业级模板与 Prompt as Code 引擎，
 * 挂载至 DSH (Cordis) 微内核中，向 Agent 提供标准的 Function Calling 工具，
 * 并向前端创作工作台（生图工坊、爆款灵感库）提供模板与案例支持。
 */
export class GptImageStyleService extends Service {
  public cdnBaseUrl: string;
  private styleLibraryData: any = null;
  private casesData: any = null;
  private casesList: PromptCaseItem[] = [];

  constructor(ctx: Context, config: GptImageStyleConfig = {}) {
    super(ctx, 'gptImageStyle');
    this.cdnBaseUrl = (config.cdnBaseUrl || 'https://gpt-image2.canghe.ai').replace(/\/+$/, '');
    this.loadData(config.dataDir);
    this.ctx.logger('dsh:gpt-image-style').info(
      `🎨 [DeepSeek Harness] GPT-Image-2 风格库插件已装配 (模板: ${this.getTemplates().length}个, 案例: ${this.casesList.length}个)`
    );
  }

  private loadData(customDir?: string) {
    try {
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      // 兼容开发环境(src/plugins)与构建后环境(dist/plugins)
      const possibleDirs = [
        customDir,
        path.resolve(__dirname, '../assets/style-library'),
        path.resolve(__dirname, '../../src/assets/style-library'),
        path.resolve(process.cwd(), 'backend/src/assets/style-library'),
        path.resolve(process.cwd(), 'src/assets/style-library'),
      ].filter(Boolean) as string[];

      let styleLibPath = '';
      let casesPath = '';

      for (const dir of possibleDirs) {
        const sPath = path.join(dir, 'style-library.json');
        const cPath = path.join(dir, 'cases.json');
        if (fs.existsSync(sPath) && fs.existsSync(cPath)) {
          styleLibPath = sPath;
          casesPath = cPath;
          break;
        }
      }

      if (!styleLibPath || !casesPath) {
        this.ctx.logger('dsh:gpt-image-style').warn('⚠️ 未找到 style-library.json 或 cases.json 数据文件，启用空兜底');
        this.styleLibraryData = { categories: [], templates: [], styles: [], scenes: [] };
        this.casesList = [];
        return;
      }

      const styleLibRaw = fs.readFileSync(styleLibPath, 'utf-8');
      const casesRaw = fs.readFileSync(casesPath, 'utf-8');

      this.styleLibraryData = JSON.parse(styleLibRaw);
      this.casesData = JSON.parse(casesRaw);

      const rawCases = this.casesData.cases || [];
      this.casesList = rawCases.map((c: any) => ({
        ...c,
        imageUrl: c.image?.startsWith('http')
          ? c.image
          : `${this.cdnBaseUrl}${c.image?.startsWith('/') ? '' : '/'}${c.image}`,
      }));
    } catch (err: any) {
      this.ctx.logger('dsh:gpt-image-style').error(`❌ 加载 GPT-Image-2 数据失败: ${err.message}`);
      this.styleLibraryData = { categories: [], templates: [], styles: [], scenes: [] };
      this.casesList = [];
    }
  }

  /**
   * 检查插件健康与数据统计
   */
  public checkHealth() {
    return {
      status: 'active',
      engine: 'GPT-Image-2 Style Engine (DSH Plugin)',
      version: '1.0.0',
      templatesCount: this.getTemplates().length,
      casesCount: this.casesList.length,
      categoriesCount: this.getCategories().length,
      stylesCount: this.getStyles().length,
      scenesCount: this.getScenes().length,
      cdnBaseUrl: this.cdnBaseUrl,
    };
  }

  /**
   * 获取所有分类
   */
  public getCategories(): StyleCategory[] {
    const list = this.styleLibraryData?.categories || [];
    return list.map((item: any) => ({
      ...item,
      cover: item.cover?.startsWith('http') ? item.cover : `${this.cdnBaseUrl}${item.cover}`,
    }));
  }

  /**
   * 获取工业级提示词模板
   */
  public getTemplates(filter?: {
    category?: string;
    style?: string;
    scene?: string;
    search?: string;
  }): IndustrialTemplate[] {
    let list: IndustrialTemplate[] = this.styleLibraryData?.templates || [];

    if (!filter) return list;

    if (filter.category) {
      const catLower = filter.category.toLowerCase();
      list = list.filter((t) => t.category?.toLowerCase() === catLower);
    }
    if (filter.style) {
      const styleLower = filter.style.toLowerCase();
      list = list.filter((t) => t.styles?.some((s) => s.toLowerCase() === styleLower));
    }
    if (filter.scene) {
      const sceneLower = filter.scene.toLowerCase();
      list = list.filter((t) => t.scenes?.some((s) => s.toLowerCase() === sceneLower));
    }
    if (filter.search) {
      const kw = filter.search.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.zh?.toLowerCase().includes(kw) ||
          t.title.en?.toLowerCase().includes(kw) ||
          t.description.zh?.toLowerCase().includes(kw) ||
          t.description.en?.toLowerCase().includes(kw) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(kw))
      );
    }

    return list.map((t) => ({
      ...t,
      cover: t.cover?.startsWith('http') ? t.cover : `${this.cdnBaseUrl}${t.cover}`,
    }));
  }

  /**
   * 根据 ID 获取模板详情
   */
  public getTemplateById(id: string): IndustrialTemplate | null {
    const templates = this.getTemplates();
    const found = templates.find((t) => t.id === id || t.anchor === id);
    return found || null;
  }

  /**
   * 获取风格列表
   */
  public getStyles(): StyleTagItem[] {
    return this.styleLibraryData?.styles || [];
  }

  /**
   * 获取场景列表
   */
  public getScenes(): StyleTagItem[] {
    return this.styleLibraryData?.scenes || [];
  }

  /**
   * 分页与条件检索真实案例库（541+ 案例）
   */
  public getCases(params: {
    query?: string;
    category?: string;
    style?: string;
    scene?: string;
    page?: number;
    pageSize?: number;
  } = {}) {
    let list = this.casesList;
    const { query, category, style, scene, page = 1, pageSize = 20 } = params;

    if (category) {
      const cLower = category.toLowerCase();
      list = list.filter((c) => c.category?.toLowerCase() === cLower);
    }
    if (style) {
      const sLower = style.toLowerCase();
      list = list.filter((c) => c.styles?.some((s) => s.toLowerCase() === sLower));
    }
    if (scene) {
      const scLower = scene.toLowerCase();
      list = list.filter((c) => c.scenes?.some((s) => s.toLowerCase() === scLower));
    }
    if (query) {
      const qLower = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.title?.toLowerCase().includes(qLower) ||
          c.prompt?.toLowerCase().includes(qLower) ||
          c.sourceLabel?.toLowerCase().includes(qLower)
      );
    }

    const total = list.length;
    const startIndex = (page - 1) * pageSize;
    const items = list.slice(startIndex, startIndex + pageSize);

    return {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      cases: items,
    };
  }

  /**
   * 根据案例 ID 获取案例
   */
  public getCaseById(id: number): PromptCaseItem | null {
    return this.casesList.find((c) => c.id === id) || null;
  }

  /**
   * Prompt as Code 工业级提示词装配引擎
   * 根据 6 步工业标准结构组装保真提示词
   */
  public composePrompt(params: ComposePromptParams): {
    prompt: string;
    templateUsed?: IndustrialTemplate | null;
    blocks: Record<string, string>;
  } {
    const isZh = params.language !== 'en';
    const template = params.templateId ? this.getTemplateById(params.templateId) : null;

    // 1. 主体与任务 (Subject & Task)
    const subjectBlock = params.subject.trim();

    // 2. 构图与画幅 (Composition & Ratio)
    const ratio = params.aspectRatio || '3:4';
    const ratioDesc = isZh ? `画幅比例 ${ratio}` : `Aspect ratio: ${ratio}`;
    const compDesc = params.composition ? `${params.composition}, ${ratioDesc}` : ratioDesc;

    // 3. 视觉风格与光影材质 (Style, Lighting & Materials)
    let styleDesc = params.visualStyle || (template ? template.title[isZh ? 'zh' : 'en'] : '商拍大片质感');
    if (params.materialsAndLighting) {
      styleDesc += `, ${params.materialsAndLighting}`;
    }

    // 4. 文字排版要求 (Text & Layout)
    const textBlock = params.textRequirements
      ? isZh
        ? `画面文案与排版要求：${params.textRequirements}。文字清晰无错乱。`
        : `Text & Typography: ${params.textRequirements}. Clear and legible.`
      : '';

    // 5. 模板黄金指引注入 (Guidance)
    let guidanceBlock = '';
    if (template && template.guidance) {
      const items = template.guidance[isZh ? 'zh' : 'en'] || [];
      if (items.length > 0) {
        guidanceBlock = isZh
          ? `遵循工业排版规范：${items.join('；')}`
          : `Industrial layout rules: ${items.join('; ')}`;
      }
    }

    // 6. 避坑与负向约束 (Constraints & Pitfalls)
    const defaultNegative = isZh
      ? '避免低分辨率、画面杂乱、畸变变形、无意义水印与残缺文字'
      : 'avoid low resolution, clutter, distortion, artifacts, blurry text';
    let negativeBlock = params.negativeConstraints || defaultNegative;
    if (template && template.pitfalls) {
      const pitfalls = template.pitfalls[isZh ? 'zh' : 'en'] || [];
      if (pitfalls.length > 0) {
        negativeBlock += `，约束：${pitfalls.join('，')}`;
      }
    }

    // 格式化输出最终 Prompt
    const promptParts = [
      subjectBlock,
      compDesc,
      styleDesc,
      textBlock,
      guidanceBlock,
      isZh ? `画面约束：${negativeBlock}` : `Constraints: ${negativeBlock}`,
    ].filter(Boolean);

    const finalPrompt = promptParts.join('。\n') + (isZh ? '。' : '');

    return {
      prompt: finalPrompt,
      templateUsed: template,
      blocks: {
        subject: subjectBlock,
        composition: compDesc,
        style: styleDesc,
        text: textBlock,
        guidance: guidanceBlock,
        constraints: negativeBlock,
      },
    };
  }

  /**
   * 暴露给 DeepSeek Harness Agent 的标准 Function Calling 工具列表
   */
  public getAgentTools() {
    return [
      {
        type: 'function',
        function: {
          name: 'search_image_styles',
          description:
            '在 GPT-Image-2 工业级风格库中检索匹配的风格模板、视觉风格标签与适用场景。可用于电商商品图、海报、3C科技礼品、UI设计等生图意图匹配。',
          parameters: {
            type: 'object',
            properties: {
              search: {
                type: 'string',
                description: '搜索关键词，如“3C数码”、“极简包装”、“3D贴花”、“胡桃木办公桌”',
              },
              category: {
                type: 'string',
                description: '分类筛选，如“Products & E-commerce”、“Brand & Logos”、“UI & Interfaces”',
              },
              style: {
                type: 'string',
                description: '视觉风格，如“3D”、“Realistic”、“Cyberpunk”、“Minimalist”',
              },
            },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_style_template_details',
          description: '获取指定工业级生图模板的详细排版指引（guidance）、避坑原则（pitfalls）及参考案例编号。',
          parameters: {
            type: 'object',
            properties: {
              template_id: {
                type: 'string',
                description: '模板唯一标识，如“ui-screenshot-system”、“product-commerce”、“brand-identity”',
              },
            },
            required: ['template_id'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'compose_industrial_image_prompt',
          description:
            '按照 Prompt-as-Code 工业级规范，将用户的基础描述编译组装为结构完整、零歧义、包含光影材质与负向约束的高保真生图提示词。',
          parameters: {
            type: 'object',
            properties: {
              subject: {
                type: 'string',
                description: '核心画面主体与任务目标，例如“磁吸无线充电宝放置在极简黑色磨砂铝合金展台上”',
              },
              template_id: {
                type: 'string',
                description: '可选的模板ID，如传入则自动应用该模板的排版指引与避坑约束',
              },
              visual_style: {
                type: 'string',
                description: '视觉风格与光影，例如“高端科技感工业商拍、冷白边缘轮廓光、微距景深”',
              },
              aspect_ratio: {
                type: 'string',
                enum: ['3:4', '9:16', '1:1', '16:9'],
                description: '画幅比例，电商主图通常推荐 3:4，视频首帧推荐 9:16',
              },
              text_requirements: {
                type: 'string',
                description: '画面中需要呈现的文字文案（如商品标语或Logo文字）',
              },
            },
            required: ['subject'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_style_cases',
          description: '在 540+ 真实生成案例画廊中推荐符合当前场景的优秀爆款案例及完整提示词。',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: '查询关键词，例如“果汁海报”、“充电宝”、“咖啡”',
              },
              category: {
                type: 'string',
                description: '分类过滤',
              },
              limit: {
                type: 'number',
                description: '返回数量上限，默认为 5 条',
              },
            },
          },
        },
      },
    ];
  }

  /**
   * 执行 DeepSeek Harness Agent 派发的工具调用
   */
  public async executeTool(toolName: string, args: any): Promise<any> {
    this.ctx.logger('dsh:gpt-image-style').info(`🤖 [DSH Agent Tool Call] 执行工具: ${toolName}`);
    switch (toolName) {
      case 'search_image_styles':
        return this.getTemplates({
          search: args.search,
          category: args.category,
          style: args.style,
        });
      case 'get_style_template_details':
        return this.getTemplateById(args.template_id);
      case 'compose_industrial_image_prompt':
        return this.composePrompt({
          subject: args.subject,
          templateId: args.template_id,
          visualStyle: args.visual_style,
          aspectRatio: args.aspect_ratio || '3:4',
          textRequirements: args.text_requirements,
        });
      case 'get_style_cases':
        return this.getCases({
          query: args.query,
          category: args.category,
          pageSize: args.limit || 5,
        });
      default:
        throw new Error(`未知的 DSH 工具名称: ${toolName}`);
    }
  }
}

/**
 * 符合 DeepSeek Harness 官方插件模块规范导出
 */
export const name = 'dsh-plugin-gpt-image-style';

export function apply(ctx: Context, config: GptImageStyleConfig = {}) {
  // 采用标准 Cordis 插件安装方式装配该服务
  ctx.plugin(GptImageStyleService, config);
}
