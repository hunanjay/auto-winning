import { Context, Service } from '@deepseek-ai/cordis';

export interface MoneyPrinterConfig {
  serverUrl?: string;
  webuiUrl?: string;
}

export interface VideoClipCreationParams {
  video_subject: string;
  video_script?: string;
  video_aspect?: '9:16' | '16:9' | '1:1';
  video_clip_duration?: number;
  voice_name?: string;
  bgm_type?: string;
  bgm_volume?: number;
  video_source?: string;
  video_materials?: Array<{
    url: string;
    duration?: number;
  }>;
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    slicer: MoneyPrinterSlicerService;
  }
}

/**
 * -------------------------------------------------------------
 * DeepSeek Harness (DSH) 插件规范：MoneyPrinterTurbo 智能切片插件
 * -------------------------------------------------------------
 * 该插件挂载在 DSH (Cordis) 微内核中，不仅提供底层切片服务，
 * 还向 DeepSeek Harness Agent 暴露标准的 Function Calling Tools。
 */
export class MoneyPrinterSlicerService extends Service {
  public serverUrl: string;
  public webuiUrl: string;

  constructor(ctx: Context, config: MoneyPrinterConfig) {
    // 注册到 Cordis 上下文的 ctx.slicer 属性上
    super(ctx, 'slicer');
    this.serverUrl = (config.serverUrl || process.env.MONEYPRINTER_SERVER_URL || 'http://127.0.0.1:8085').replace(/\/+$/, '');
    this.webuiUrl = (config.webuiUrl || process.env.MONEYPRINTER_WEBUI_URL || 'http://127.0.0.1:8501').replace(/\/+$/, '');
    this.ctx.logger('dsh:slicer').info(`🎬 [DeepSeek Harness] 智能切片插件已装配 (Server: ${this.serverUrl})`);
  }

  /**
   * 检查服务连通性
   */
  public async checkHealth(): Promise<{
    status: string;
    engine: string;
    version: string;
    serverUrl: string;
    webuiUrl: string;
    docsUrl: string;
  }> {
    try {
      const res = await fetch(`${this.serverUrl}/ping`, { signal: AbortSignal.timeout(3000) });
      const ok = res.ok;
      return {
        status: ok ? 'connected' : 'unreachable',
        engine: 'MoneyPrinterTurbo (DSH Plugin)',
        version: 'v1.3.9',
        serverUrl: this.serverUrl,
        webuiUrl: this.webuiUrl,
        docsUrl: `${this.serverUrl}/docs`,
      };
    } catch (err: any) {
      return {
        status: 'offline',
        engine: 'MoneyPrinterTurbo (DSH Plugin)',
        version: 'v1.3.9',
        serverUrl: this.serverUrl,
        webuiUrl: this.webuiUrl,
        docsUrl: `${this.serverUrl}/docs`,
      };
    }
  }

  /**
   * 提交短视频或智能切片生成任务
   */
  public async createVideoClip(params: VideoClipCreationParams): Promise<any> {
    const payload = {
      video_script: '',
      video_aspect: '9:16',
      video_clip_duration: 5,
      voice_name: 'zh-CN-XiaoxiaoNeural',
      video_count: 1,
      ...params,
    };

    this.ctx.logger('dsh:slicer').info(`🚀 [DSH Tool] 提交智能切片任务: 主题="${params.video_subject}"`);

    const res = await fetch(`${this.serverUrl}/api/v1/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`MoneyPrinterTurbo 任务提交失败 (${res.status}): ${errorText}`);
    }

    return await res.json();
  }

  /**
   * 查询指定任务状态
   */
  public async getTaskStatus(taskId: string): Promise<any> {
    const res = await fetch(`${this.serverUrl}/api/v1/tasks/${taskId}`);
    if (!res.ok) {
      throw new Error(`查询任务 ${taskId} 失败: HTTP ${res.status}`);
    }
    return await res.json();
  }

  /**
   * 获取全部任务列表
   */
  public async listTasks(page: number = 1, pageSize: number = 10): Promise<any> {
    const res = await fetch(`${this.serverUrl}/api/v1/tasks?page=${page}&page_size=${pageSize}`);
    if (!res.ok) {
      throw new Error(`获取任务列表失败: HTTP ${res.status}`);
    }
    return await res.json();
  }

  /**
   * 提交语音/音频提取字幕任务 (Whisper 破价与台词提取)
   */
  public async extractSubtitle(audioUrl: string, language: string = 'zh'): Promise<any> {
    const res = await fetch(`${this.serverUrl}/api/v1/subtitle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audio_file: audioUrl,
        subtitle_language: language,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`字幕提取失败: ${err}`);
    }
    return await res.json();
  }

  /**
   * -------------------------------------------------------------
   * DeepSeek Harness Agent Tools 定义
   * 供大模型 (如 Qwen / DeepSeek) 进行 Function Calling / Intent Routing
   * -------------------------------------------------------------
   */
  public getAgentTools() {
    return [
      {
        type: 'function',
        function: {
          name: 'slice_video_highlight',
          description: '根据长视频或直播回放，依据破价口播话术、商品微距特写或爆款加购波峰，自动切出高转化带货短视频片段。',
          parameters: {
            type: 'object',
            properties: {
              video_subject: {
                type: 'string',
                description: '视频切片主题或核心卖点，如“破价限时直降”、“微距特写展示”',
              },
              video_script: {
                type: 'string',
                description: '切片对应的口播旁白或解说文案',
              },
              video_aspect: {
                type: 'string',
                enum: ['9:16', '16:9', '1:1'],
                description: '成片画幅比例，默认为 9:16 竖屏',
              },
            },
            required: ['video_subject'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'extract_speech_anchors',
          description: '从长视频中提取带时间轴的语音台词与字幕，用于精确定位主播价格爆点与商品介绍区间。',
          parameters: {
            type: 'object',
            properties: {
              audio_url: {
                type: 'string',
                description: '视频或音频素材地址',
              },
              language: {
                type: 'string',
                description: '识别语言，如 zh 或 en',
              },
            },
            required: ['audio_url'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'query_slice_status',
          description: '查询视频切片合成任务的实时处理进度与成片播放下载地址。',
          parameters: {
            type: 'object',
            properties: {
              task_id: {
                type: 'string',
                description: '任务唯一编号',
              },
            },
            required: ['task_id'],
          },
        },
      },
    ];
  }

  /**
   * 执行 DeepSeek Harness Agent 派发的工具调用
   */
  public async executeTool(toolName: string, args: any): Promise<any> {
    this.ctx.logger('dsh:slicer').info(`🤖 [DSH Agent Tool Call] 执行工具: ${toolName}`);
    switch (toolName) {
      case 'slice_video_highlight':
        return await this.createVideoClip({
          video_subject: args.video_subject,
          video_script: args.video_script,
          video_aspect: args.video_aspect || '9:16',
        });
      case 'extract_speech_anchors':
        return await this.extractSubtitle(args.audio_url, args.language || 'zh');
      case 'query_slice_status':
        return await this.getTaskStatus(args.task_id);
      default:
        throw new Error(`未知的 DSH 工具名称: ${toolName}`);
    }
  }
}

/**
 * 符合 DeepSeek Harness 官方插件模块规范导出
 */
export const name = 'dsh-plugin-moneyprinter-slicer';

export function apply(ctx: Context, config: MoneyPrinterConfig = {}) {
  // 采用标准 Cordis 插件安装方式装配该服务
  ctx.plugin(MoneyPrinterSlicerService, config);
}
