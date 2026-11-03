import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';
import { streamText } from 'hono/streaming';
import { serve } from '@hono/node-server';
import { Context } from '@deepseek-ai/cordis';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { AliyunWanxService } from './plugins/aliyun-wanx.js';
import { AliyunChatService } from './plugins/aliyun-chat.js';
import * as MoneyPrinterSlicerPlugin from './plugins/moneyprinter-slicer.js';
import * as GptImageStylePlugin from './plugins/gpt-image-style.js';
import {
  runFullASRWorkflow,
  cutVideoClip,
  probeVideo,
} from './services/video-asr-cutter.js';
import { TemplateDao, ProductDao, SlicerCaseDao } from './db.js';

// 1. 双重环境配置加载：优先读取项目根目录的 .env.local，其次读取 backend/.env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const apiKey = process.env.DASHSCOPE_API_KEY || '';
const baseUrl = process.env.DASHSCOPE_BASE_URL || '';
const port = parseInt(process.env.PORT || '3001', 10);
const defaultModel = process.env.DEFAULT_MODEL || 'qwen3.6-flash';
const moneyprinterServerUrl = process.env.MONEYPRINTER_SERVER_URL || 'http://127.0.0.1:8085';
const moneyprinterWebuiUrl = process.env.MONEYPRINTER_WEBUI_URL || 'http://127.0.0.1:8501';

// 2. 初始化 DeepSeek Harness 微内核上下文 (基于 Cordis)
const cordisCtx = new Context();
const wanxService = new AliyunWanxService(cordisCtx, { apiKey });
const chatService = new AliyunChatService(cordisCtx, { apiKey, baseUrl, defaultModel });

cordisCtx.provide('aliyunWanx', wanxService);
cordisCtx.provide('aliyunChat', chatService);

// 以 DeepSeek Harness 标准规范装配智能切片插件
cordisCtx.plugin(MoneyPrinterSlicerPlugin, {
  serverUrl: moneyprinterServerUrl,
  webuiUrl: moneyprinterWebuiUrl,
});

// 以 DeepSeek Harness 标准规范装配 GPT-Image-2 风格库与提示词插件
cordisCtx.plugin(GptImageStylePlugin, {});

console.log('🚀 [DSH Runtime] DeepSeek Harness 微内核及插件体系 (包含切片 & GPT-Image-2风格库) 已就绪');

// 3. 初始化 Hono OpenAPI 应用
const app = new OpenAPIHono();

// 启用跨域支持 (允许前端 5173 调用)
app.use('*', cors());

// -------------------------------------------------------------
// Schema 定义 (类似于 FastAPI 的 Pydantic 模型)
// -------------------------------------------------------------

const HealthResponseSchema = z
  .object({
    status: z.string().openapi({ example: 'ok' }),
    plugins: z.array(z.string()).openapi({ example: ['aliyun-wanx', 'aliyun-chat'] }),
    apiKeyConfigured: z.boolean().openapi({ example: true }),
    defaultModel: z.string().openapi({ example: 'qwen3.6-flash' }),
    baseUrl: z.string().openapi({ example: 'https://dashscope.aliyuncs.com/compatible-mode/v1' }),
  })
  .openapi('HealthResponse');

const GenerateSceneRequestSchema = z
  .object({
    baseImageUrl: z
      .string()
      .optional()
      .openapi({
        description: '产品原型图 URL 或 Base64 DataURL (可选，不传则为纯文生图)',
        example: 'https://dashscope.oss-cn-beijing.aliyuncs.com/samples/image/wanx/powerbank_white.png',
      }),
    logoImageUrl: z
      .string()
      .optional()
      .openapi({
        description: '企业品牌 Logo 图 URL 或 Base64 DataURL (传入时自动启用 Qwen-Image-3.0 双图 3D 智能贴合模式)',
      }),
    craftPrompt: z
      .string()
      .optional()
      .openapi({
        description: '定制工艺材质描述 (如金属激光镭雕、UV 3D 微浮雕、香槟烫金等)',
      }),
    prompt: z
      .string()
      .optional()
      .default('高奢极简展台，高级轮廓光，柔和阴影，4k画质')
      .openapi({
        description: '电商场景提示词 (如高奢办公桌、年会礼盒等)',
        example: '放在高档胡桃木办公桌上，柔和侧光，旁边有机械键盘和热咖啡，4k画质',
      }),
    n: z
      .number()
      .optional()
      .default(4)
      .openapi({ description: '出图数量 (1~4 张)', example: 4 }),
    noiseLevel: z
      .number()
      .optional()
      .default(300)
      .openapi({ description: '光影渗透程度 (推荐 300，严格保护 Logo 和主体)', example: 300 }),
  })
  .openapi('GenerateSceneRequest');

const GenerateSceneResponseSchema = z
  .object({
    code: z.number().openapi({ example: 0 }),
    data: z
      .object({
        images: z.array(z.string()).openapi({
          description: '生成的商拍照图片 URL 列表',
          example: [
            'https://dashscope-result-sh.oss-cn-shanghai.aliyuncs.com/sample1.png',
            'https://dashscope-result-sh.oss-cn-shanghai.aliyuncs.com/sample2.png',
          ],
        }),
      })
      .openapi('GenerateSceneData'),
  })
  .openapi('GenerateSceneResponse');

const ChatRequestSchema = z
  .object({
    messages: z
      .array(
        z.object({
          role: z.enum(['system', 'user', 'assistant']).openapi({ example: 'user' }),
          content: z.string().openapi({ example: '请写一段带货文案' }),
        })
      )
      .openapi({ description: '历史上下文对话消息列表' }),
    model: z
      .string()
      .optional()
      .openapi({ description: '指定的模型覆盖 (如 deepseek-r1 / qwen-max)', example: 'qwen3.6-flash' }),
  })
  .openapi('ChatRequest');

// -------------------------------------------------------------
// 路由定义与文档元数据声明 (类似于 FastAPI 的 @app.get / @app.post)
// -------------------------------------------------------------

// 1. 健康检查路由
const healthRoute = createRoute({
  method: 'get',
  path: '/api/health',
  tags: ['系统状态'],
  summary: '健康检查与服务插件状态',
  description: '检查 DSH 内核状态、已装配插件及 API Key 是否就绪',
  responses: {
    200: {
      content: { 'application/json': { schema: HealthResponseSchema } },
      description: '服务运行正常',
    },
  },
});

app.openapi(healthRoute, (c) => {
  return c.json({
    status: 'ok',
    plugins: ['aliyun-wanx', 'aliyun-chat', 'moneyprinter-slicer', 'gpt-image-style'],
    apiKeyConfigured: Boolean(apiKey),
    defaultModel,
    baseUrl: baseUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  });
});

// 2. 通义万相电商背景生成与光影融合路由
const generateSceneRoute = createRoute({
  method: 'post',
  path: '/api/generate-scene',
  tags: ['AI 商拍生图'],
  summary: '商品背景生成与光影融合 (通义万相)',
  description: '将 2D 贴花产品图融入高奢场景，自动打上环境光、轮廓光并生成物理接触阴影，严格保护 Logo 零畸变',
  request: {
    body: {
      content: {
        'application/json': { schema: GenerateSceneRequestSchema },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: GenerateSceneResponseSchema } },
      description: '生成成功，返回商拍图 URL 数组',
    },
    400: {
      description: '请求参数有误',
    },
    500: {
      description: '百炼生成异常',
    },
  },
});

app.openapi(generateSceneRoute, async (c) => {
  try {
    const { baseImageUrl, logoImageUrl, craftPrompt, prompt, n, noiseLevel } = c.req.valid('json');

    const images = await cordisCtx.aliyunWanx.generateEcommerceScene({
      baseImageUrl,
      logoImageUrl,
      craftPrompt,
      prompt: prompt || '高奢极简展台，高级轮廓光，柔和阴影，4k画质',
      n: n || 4,
      noiseLevel: noiseLevel || 300,
    });

    return c.json({ code: 0, data: { images } }, 200);
  } catch (err: any) {
    console.error('生图错误:', err);
    return c.json({ code: 500, message: err.message || '内部服务错误' }, 500);
  }
});

// 3. AI 对话流式接口 (SSE)
app.post('/api/chat', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { messages, model } = body;

    const stream = cordisCtx.aliyunChat.streamChat(
      messages || [{ role: 'user', content: '你好' }],
      model
    );

    return streamText(c, async (streamWriter) => {
      c.header('Content-Type', 'text/event-stream; charset=utf-8');
      c.header('Cache-Control', 'no-cache, no-transform');
      c.header('Connection', 'keep-alive');

      for await (const chunk of stream) {
        await streamWriter.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      }
      await streamWriter.write('data: [DONE]\n\n');
    });
  } catch (err: any) {
    console.error('Chat 错误:', err);
    return c.json({ code: 500, error: err.message }, 500);
  }
});

// -------------------------------------------------------------
// 4. 智能切片微服务 (真实视频物理裁剪 + MoneyPrinterTurbo)
// -------------------------------------------------------------

// (0) 静态视频流媒体分发 (支持 HTTP Range 断点续播与快速 Seek)
app.get('/uploads/*', async (c) => {
  const reqSubPath = decodeURIComponent(c.req.path.replace(/^\/uploads\//, ''));
  const filePath = path.resolve(__dirname, '../uploads', reqSubPath);

  if (!filePath.startsWith(path.resolve(__dirname, '../uploads') + path.sep)) {
    return c.text('非法路径', 403);
  }
  if (!fs.existsSync(filePath)) {
    return c.text('视频文件未找到', 404);
  }

  const stat = fs.statSync(filePath);
  const range = c.req.header('range');
  const isDownload = c.req.query('download') === '1';
  const baseName = path.basename(filePath);
  const downloadHeader: Record<string, string> = isDownload
    ? { 'Content-Disposition': `attachment; filename="${encodeURIComponent(baseName)}"` }
    : {};

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    const chunkSize = end - start + 1;
    const fileStream = fs.createReadStream(filePath, { start, end });
    return new Response(fileStream as any, {
      status: 206,
      headers: {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(chunkSize),
        'Content-Type': 'video/mp4',
        ...downloadHeader,
      },
    });
  }

  const fileStream = fs.createReadStream(filePath);
  return new Response(fileStream as any, {
    status: 200,
    headers: {
      'Content-Length': String(stat.size),
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
      ...downloadHeader,
    },
  });
});

// 将分析结果整理为前端所需的响应结构
function buildSlicerResponse(fileId: string, originalName: string, savedFilePath: string, videoUrl: string, r: any) {
  const fmt = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };
  return {
    video: {
      id: fileId,
      fileName: originalName,
      filePath: savedFilePath,
      videoUrl,
      duration: r.durationSeconds,
      durationFormatted: fmt(r.durationSeconds),
      width: r.width,
      height: r.height,
      ratio: `${r.width}:${r.height}`,
    },
    transcripts: r.transcripts,
    products: r.products || [],
    clips: r.clips,
  };
}

// 案例库：列表 / 读取 / 删除
app.get('/api/slicer/cases', (c) => c.json({ code: 0, data: SlicerCaseDao.list() }));

app.get('/api/slicer/cases/:id', (c) => {
  const row = SlicerCaseDao.get(c.req.param('id'));
  if (!row) return c.json({ code: 404, error: '案例不存在' }, 404);
  const r = JSON.parse(row.result_json);
  const videoPath = path.resolve(__dirname, '../uploads/videos', row.video_file);
  const videoUrl = `http://localhost:${port}/uploads/videos/${encodeURIComponent(row.video_file)}`;
  return c.json({ code: 0, data: buildSlicerResponse(row.id, row.name, videoPath, videoUrl, r) });
});

app.delete('/api/slicer/cases/:id', (c) => {
  SlicerCaseDao.remove(c.req.param('id'));
  return c.json({ code: 0 });
});

// 分析进度 (内存态，供前端轮询展示 Loading 步骤)
const slicerProgress = new Map<string, { step: number; label: string; done: boolean }>();
app.get('/api/slicer/progress/:jobId', (c) => {
  const p = slicerProgress.get(c.req.param('jobId'));
  return c.json({ code: 0, data: p || { step: 0, label: '排队中', done: false } });
});

// (1) 上传长视频并进行真实 ASR 语音识别 + Qwen 语义高光切片
app.post('/api/slicer/upload-and-analyze', async (c) => {
  try {
    const uploadsDir = path.resolve(__dirname, '../uploads/videos');
    const cacheDir = path.resolve(__dirname, '../uploads/cache');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    let savedFilePath = '';
    let originalName = 'sample_livestream.mp4';
    let fileId = `vid-${Date.now()}`;
    let isUpload = false;
    let jobId = '';

    // 处理 multipart/form-data 或默认示例
    const contentType = c.req.header('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await c.req.parseBody();
      const videoFile = formData['video'] as any;
      jobId = String(formData['jobId'] || '');

      if (videoFile && typeof videoFile === 'object' && videoFile.name) {
        originalName = videoFile.name;
        const ext = path.extname(originalName) || '.mp4';
        fileId = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        savedFilePath = path.join(uploadsDir, `${fileId}${ext}`);

        // 将文件数据写入磁盘
        const arrayBuffer = await videoFile.arrayBuffer();
        fs.writeFileSync(savedFilePath, Buffer.from(arrayBuffer));
        isUpload = true;
      }
    }

    // 若未上传新文件，使用已就绪的 50s 真实直播口播带货样片
    if (!savedFilePath || !fs.existsSync(savedFilePath)) {
      savedFilePath = path.join(uploadsDir, 'sample_livestream.mp4');
      fileId = 'sample_livestream';
      originalName = '20261102_淘宝双11大促带货直播回放.mp4';
    }

    const savedFileName = path.basename(savedFilePath);
    const videoUrl = `http://localhost:${port}/uploads/videos/${savedFileName}`;

    // 检查是否有历史 ASR 分析缓存
    const cacheKey = `${path.basename(savedFilePath, path.extname(savedFilePath))}.json`;
    const cachePath = path.join(cacheDir, cacheKey);
    let analysisResult;

    if (!isUpload && fs.existsSync(cachePath)) {
      try {
        const cached = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
        // 旧版缓存 (无产品分段) 视为失效
        if (cached.products) {
          analysisResult = cached;
          if (!SlicerCaseDao.get(fileId)) {
            SlicerCaseDao.save({ id: fileId, name: originalName, videoFile: savedFileName, result: cached });
          }
        }
      } catch {
        // 缓存失效则重新执行
      }
    }

    if (!analysisResult) {
      // 执行真实 FFmpeg 抽音频 -> OSS 上传 -> DashScope Paraformer 转写 -> Qwen 语义高光挖掘
      analysisResult = await runFullASRWorkflow(
        savedFilePath,
        fileId,
        originalName,
        videoUrl,
        (step, label) => { if (jobId) slicerProgress.set(jobId, { step, label, done: false }); }
      );
      // 写入持久化缓存
      fs.writeFileSync(cachePath, JSON.stringify(analysisResult, null, 2), 'utf-8');
      // 存入数据库案例库，可作为 Demo 长期保留
      SlicerCaseDao.save({ id: fileId, name: originalName, videoFile: savedFileName, result: analysisResult });
    }

    if (jobId) {
      slicerProgress.set(jobId, { step: 5, label: '完成', done: true });
      setTimeout(() => slicerProgress.delete(jobId), 60000);
    }

    const fmt = (s: number) => {
      const m = Math.floor(s / 60).toString().padStart(2, '0');
      const sec = Math.floor(s % 60).toString().padStart(2, '0');
      return `${m}:${sec}`;
    };

    return c.json({
      code: 0,
      data: {
        video: {
          id: fileId,
          fileName: originalName,
          filePath: savedFilePath,
          videoUrl,
          duration: analysisResult.durationSeconds,
          durationFormatted: fmt(analysisResult.durationSeconds),
          width: analysisResult.width,
          height: analysisResult.height,
          ratio: `${analysisResult.width}:${analysisResult.height}`,
        },
        transcripts: analysisResult.transcripts,
        products: analysisResult.products || [],
        clips: analysisResult.clips,
      },
    });
  } catch (err: any) {
    console.error('视频全链路 ASR 分析失败:', err);
    return c.json({ code: 500, error: err.message }, 500);
  }
});

// (2) 真实物理切片 (调用 FFmpeg 裁切单个高光片段)
app.post('/api/slicer/cut-clip', async (c) => {
  try {
    const body = await c.req.json();
    const { videoId, startSeconds, durationSeconds, clipId, clipTitle } = body;

    const clipsDir = path.resolve(__dirname, '../uploads/clips');
    if (!fs.existsSync(clipsDir)) {
      fs.mkdirSync(clipsDir, { recursive: true });
    }

    // 查找原始视频路径
    const videosDir = path.resolve(__dirname, '../uploads/videos');
    let inputPath = path.join(videosDir, `${videoId}.mp4`);
    if (!fs.existsSync(inputPath)) {
      inputPath = path.join(videosDir, 'sample_livestream.mp4');
    }

    const outputFileName = `${clipId || `clip-${Date.now()}`}.mp4`;
    const outputPath = path.join(clipsDir, outputFileName);

    // 真正执行 FFmpeg 切片
    const result = await cutVideoClip(
      inputPath,
      outputPath,
      Math.max(0, parseFloat(startSeconds || 0)),
      Math.max(3, parseFloat(durationSeconds || 15))
    );

    return c.json({
      code: 0,
      message: '切片生成成功',
      data: {
        clipId,
        title: clipTitle,
        downloadUrl: `http://localhost:${port}/uploads/clips/${encodeURIComponent(outputFileName)}`,
        sizeBytes: result.sizeBytes,
        duration: result.duration,
      },
    });
  } catch (err: any) {
    console.error('物理切片失败:', err);
    return c.json({ code: 500, error: err.message }, 500);
  }
});

// (3) 一键批量真实物理裁切全部切片
app.post('/api/slicer/cut-all', async (c) => {
  try {
    const body = await c.req.json();
    const { videoId, clips = [] } = body;

    const videosDir = path.resolve(__dirname, '../uploads/videos');
    let inputPath = path.join(videosDir, `${videoId}.mp4`);
    if (!fs.existsSync(inputPath)) {
      inputPath = path.join(videosDir, 'sample_livestream.mp4');
    }

    const clipsDir = path.resolve(__dirname, '../uploads/clips');
    const results = [];

    for (const clip of clips) {
      const outputFileName = `${clip.id}.mp4`;
      const outputPath = path.join(clipsDir, outputFileName);
      await cutVideoClip(
        inputPath,
        outputPath,
        clip.startSeconds,
        clip.durationSeconds
      );
      results.push({
        id: clip.id,
        title: clip.title,
        downloadUrl: `http://localhost:${port}/uploads/clips/${encodeURIComponent(outputFileName)}`,
      });
    }

    return c.json({
      code: 0,
      message: `成功生成全部 ${results.length} 个带货短视频切片`,
      data: {
        clips: results,
      },
    });
  } catch (err: any) {
    console.error('批量切片失败:', err);
    return c.json({ code: 500, error: err.message }, 500);
  }
});

// (4) 检查切片引擎健康度
app.get('/api/slicer/status', async (c) => {
  const result = await cordisCtx.slicer.checkHealth();
  return c.json({
    code: result.status === 'connected' ? 0 : 1,
    ...result,
  });
});

// (2) 获取切片与短视频任务列表
app.get('/api/slicer/tasks', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1', 10);
    const pageSize = parseInt(c.req.query('page_size') || '10', 10);
    const data = await cordisCtx.slicer.listTasks(page, pageSize);
    return c.json(data);
  } catch (err: any) {
    return c.json({ code: 500, error: err.message }, 500);
  }
});

// (3) 获取单条切片任务详情
app.get('/api/slicer/tasks/:taskId', async (c) => {
  try {
    const taskId = c.req.param('taskId');
    const data = await cordisCtx.slicer.getTaskStatus(taskId);
    return c.json(data);
  } catch (err: any) {
    return c.json({ code: 500, error: err.message }, 500);
  }
});

// (4) 提交切片/短视频生成任务
app.post('/api/slicer/create', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const data = await cordisCtx.slicer.createVideoClip(body);
    return c.json(data);
  } catch (err: any) {
    return c.json({ code: 500, error: err.message }, 500);
  }
});

// (5) 提取视频语音字幕 (Whisper)
app.post('/api/slicer/subtitle', async (c) => {
  try {
    const { audioUrl, language } = await c.req.json().catch(() => ({}));
    const data = await cordisCtx.slicer.extractSubtitle(audioUrl, language || 'zh');
    return c.json(data);
  } catch (err: any) {
    return c.json({ code: 500, error: err.message }, 500);
  }
});

// (6) 视频流与产物反向代理 (支持 Node 后端单点透传)
app.get('/api/slicer/stream/*', async (c) => {
  const fullPath = c.req.path.replace(/^\/api\/slicer\/stream\//, '');
  const targetUrl = `${moneyprinterServerUrl}/api/v1/stream/${fullPath}`;
  try {
    const upstreamRes = await fetch(targetUrl);
    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers: upstreamRes.headers,
    });
  } catch (err: any) {
    return c.json({ code: 502, error: `代理流媒体失败: ${err.message}` }, 502);
  }
});

// (7) 获取 DeepSeek Harness Agent Tools (供大模型 Function Calling 与智能体编排)
app.get('/api/dsh/tools', (c) => {
  const tools = [
    ...(cordisCtx.slicer ? cordisCtx.slicer.getAgentTools() : []),
    ...(cordisCtx.gptImageStyle ? cordisCtx.gptImageStyle.getAgentTools() : []),
  ];
  return c.json({
    code: 0,
    engine: 'DeepSeek Harness (DSH)',
    pluginCount: 2,
    tools,
  });
});

// (8) 统一派发执行 DeepSeek Harness Agent 工具调用
app.post('/api/dsh/tools/call', async (c) => {
  try {
    const body = await c.req.json();
    const { toolName, args = {} } = body;
    if (!toolName) {
      return c.json({ code: 400, error: '缺少必需参数: toolName' }, 400);
    }

    const slicerTools = cordisCtx.slicer ? cordisCtx.slicer.getAgentTools() : [];
    if (slicerTools.some((t: any) => t.function?.name === toolName)) {
      const result = await cordisCtx.slicer.executeTool(toolName, args);
      return c.json({ code: 0, toolName, result });
    }

    const styleTools = cordisCtx.gptImageStyle ? cordisCtx.gptImageStyle.getAgentTools() : [];
    if (styleTools.some((t: any) => t.function?.name === toolName)) {
      const result = await cordisCtx.gptImageStyle.executeTool(toolName, args);
      return c.json({ code: 0, toolName, result });
    }

    return c.json({ code: 404, error: `未在 DSH 插件注册表中找到工具: ${toolName}` }, 404);
  } catch (err: any) {
    return c.json({ code: 500, error: err.message }, 500);
  }
});

// (9) GPT-Image-2 风格库与案例库 REST API
app.get('/api/style-library/health', (c) => {
  return c.json({
    code: 0,
    data: cordisCtx.gptImageStyle.checkHealth(),
  });
});

app.get('/api/style-library/categories', (c) => {
  return c.json({
    code: 0,
    data: cordisCtx.gptImageStyle.getCategories(),
  });
});

app.get('/api/style-library/templates', (c) => {
  const category = c.req.query('category');
  const style = c.req.query('style');
  const scene = c.req.query('scene');
  const search = c.req.query('search');
  return c.json({
    code: 0,
    data: cordisCtx.gptImageStyle.getTemplates({ category, style, scene, search }),
  });
});

app.get('/api/style-library/templates/:id', (c) => {
  const id = c.req.param('id');
  const template = cordisCtx.gptImageStyle.getTemplateById(id);
  if (!template) {
    return c.json({ code: 404, error: '模板未找到' }, 404);
  }
  return c.json({ code: 0, data: template });
});

app.get('/api/style-library/styles', (c) => {
  return c.json({
    code: 0,
    data: cordisCtx.gptImageStyle.getStyles(),
  });
});

app.get('/api/style-library/scenes', (c) => {
  return c.json({
    code: 0,
    data: cordisCtx.gptImageStyle.getScenes(),
  });
});

app.get('/api/style-library/cases', (c) => {
  const query = c.req.query('query');
  const category = c.req.query('category');
  const style = c.req.query('style');
  const scene = c.req.query('scene');
  const page = parseInt(c.req.query('page') || '1', 10);
  const pageSize = parseInt(c.req.query('pageSize') || '20', 10);
  return c.json({
    code: 0,
    data: cordisCtx.gptImageStyle.getCases({ query, category, style, scene, page, pageSize }),
  });
});

app.get('/api/style-library/cases/:id', (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const caseItem = cordisCtx.gptImageStyle.getCaseById(id);
  if (!caseItem) {
    return c.json({ code: 404, error: '案例未找到' }, 404);
  }
  return c.json({ code: 0, data: caseItem });
});

app.post('/api/style-library/prompt/compose', async (c) => {
  try {
    const body = await c.req.json();
    if (!body.subject) {
      return c.json({ code: 400, error: '缺少主体参数: subject' }, 400);
    }
    const result = cordisCtx.gptImageStyle.composePrompt(body);
    return c.json({ code: 0, data: result });
  } catch (err: any) {
    return c.json({ code: 500, error: err.message }, 500);
  }
});

// -------------------------------------------------------------
// (10) SQLite 持久化存储接口 (自定义模版与商品)
// -------------------------------------------------------------

// 自定义模版 CRUD
app.get('/api/templates', (c) => {
  const templates = TemplateDao.getAll();
  return c.json({ code: 0, data: templates });
});

app.post('/api/templates', async (c) => {
  try {
    const body = await c.req.json();
    if (Array.isArray(body)) {
      // 批量同步迁移
      const saved = body.map((item) => TemplateDao.upsert(item));
      return c.json({ code: 0, message: `成功同步 ${saved.length} 条模版`, data: saved });
    } else {
      if (!body.title || !body.prompt) {
        return c.json({ code: 400, error: '缺少标题或提示词参数' }, 400);
      }
      const saved = TemplateDao.upsert({
        id: body.id || `tpl-${Date.now()}`,
        ...body,
      });
      return c.json({ code: 0, data: saved });
    }
  } catch (err: any) {
    return c.json({ code: 500, error: err.message }, 500);
  }
});

app.delete('/api/templates/:id', (c) => {
  const id = c.req.param('id');
  TemplateDao.delete(id);
  return c.json({ code: 0, message: '删除成功', id });
});

// 自定义商品 CRUD
app.get('/api/products', (c) => {
  const products = ProductDao.getAll();
  return c.json({ code: 0, data: products });
});

app.post('/api/products', async (c) => {
  try {
    const body = await c.req.json();
    if (Array.isArray(body)) {
      const saved = body.map((item) => ProductDao.upsert(item));
      return c.json({ code: 0, message: `成功同步 ${saved.length} 个商品`, data: saved });
    } else {
      if (!body.name) {
        return c.json({ code: 400, error: '缺少商品名称' }, 400);
      }
      const saved = ProductDao.upsert({
        id: body.id || `prod-${Date.now()}`,
        ...body,
      });
      return c.json({ code: 0, data: saved });
    }
  } catch (err: any) {
    return c.json({ code: 500, error: err.message }, 500);
  }
});

app.delete('/api/products/:id', (c) => {
  const id = c.req.param('id');
  ProductDao.delete(id);
  return c.json({ code: 0, message: '删除成功', id });
});

// -------------------------------------------------------------
// 类似 FastAPI 的 Swagger UI 与 OpenAPI Specification
// -------------------------------------------------------------

// 1. 导出 OpenAPI 规范 JSON (相当于 FastAPI 的 /openapi.json)
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    title: 'Auto 开投 (Auto-Winning) AI Harness API',
    version: '1.0.0',
    description: '基于 Node.js + DeepSeek Harness (Cordis) + 阿里云百炼的电商 AIGC 生产力接口文档',
  },
  servers: [
    {
      url: `http://localhost:${port}`,
      description: '本地开发服务器',
    },
  ],
});

// 2. 挂载交互式 Swagger UI (相当于 FastAPI 的 /docs)
app.get(
  '/docs',
  swaggerUI({
    url: '/doc',
  })
);

// 启动服务
serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`\n======================================================`);
    console.log(`🌟 Auto-Winning AI Harness 后端启动成功 (Hono + OpenAPI)！`);
    console.log(`📡 服务地址:     http://localhost:${info.port}`);
    console.log(`📖 Swagger 文档:  http://localhost:${info.port}/docs   👈 (类似 FastAPI)`);
    console.log(`📄 OpenAPI 规范:  http://localhost:${info.port}/doc`);
    console.log(`🔌 已挂载插件:   阿里云通义万相 (生图/换光)、阿里云百炼 Chat、DSH 智能切片、DSH GPT-Image-2风格库`);
    console.log(`🎬 智能切片Server: MoneyPrinterTurbo API -> ${moneyprinterServerUrl} (WebUI: ${moneyprinterWebuiUrl})`);
    console.log(`🔑 认证状态:     ${apiKey ? '百炼 API Key 已就绪 ✅' : '未检测到 API Key ⚠️'}`);
    console.log(`======================================================\n`);
  }
);
