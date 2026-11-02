import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';
import { streamText } from 'hono/streaming';
import { serve } from '@hono/node-server';
import { Context } from '@deepseek-ai/cordis';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AliyunWanxService } from './plugins/aliyun-wanx.js';
import { AliyunChatService } from './plugins/aliyun-chat.js';

// 1. 双重环境配置加载：优先读取项目根目录的 .env.local，其次读取 backend/.env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const apiKey = process.env.DASHSCOPE_API_KEY || '';
const baseUrl = process.env.DASHSCOPE_BASE_URL || '';
const port = parseInt(process.env.PORT || '3001', 10);
const defaultModel = process.env.DEFAULT_MODEL || 'qwen3.6-flash';

// 2. 初始化 Cordis 微内核上下文 (DSH 底座)
const cordisCtx = new Context();
const wanxService = new AliyunWanxService(cordisCtx, { apiKey });
const chatService = new AliyunChatService(cordisCtx, { apiKey, baseUrl, defaultModel });

cordisCtx.provide('aliyunWanx', wanxService);
cordisCtx.provide('aliyunChat', chatService);

console.log('🚀 [DSH Runtime] Cordis 微内核及插件体系已就绪');

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
      .openapi({
        description: '前端 Canvas 导出的透明底或白色底产品图 URL (包含企业Logo)',
        example: 'https://dashscope.oss-cn-beijing.aliyuncs.com/samples/image/wanx/powerbank_white.png',
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
    plugins: ['aliyun-wanx', 'aliyun-chat'],
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
    const { baseImageUrl, prompt, n, noiseLevel } = c.req.valid('json');

    const images = await cordisCtx.aliyunWanx.generateEcommerceScene({
      baseImageUrl,
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
    console.log(`🔌 已挂载插件:   阿里云通义万相 (生图/换光)、阿里云百炼 Chat`);
    console.log(`🔑 认证状态:     ${apiKey ? '百炼 API Key 已就绪 ✅' : '未检测到 API Key ⚠️'}`);
    console.log(`======================================================\n`);
  }
);
