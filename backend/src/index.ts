import { Context } from '@deepseek-ai/cordis';
import http from 'node:http';
import dotenv from 'dotenv';
import { AliyunWanxService } from './plugins/aliyun-wanx.js';
import { AliyunChatService } from './plugins/aliyun-chat.js';

dotenv.config();

const apiKey = process.env.DASHSCOPE_API_KEY || '';
const baseUrl = process.env.DASHSCOPE_BASE_URL || '';
const port = parseInt(process.env.PORT || '3001', 10);
const defaultModel = process.env.DEFAULT_MODEL || 'qwen3.6-flash';

// 1. 初始化 Cordis 微内核上下文 (DSH 底座)
const ctx = new Context();

// 2. 装配并注册核心能力插件
const wanxService = new AliyunWanxService(ctx, { apiKey });
const chatService = new AliyunChatService(ctx, { apiKey, baseUrl, defaultModel });

ctx.provide('aliyunWanx', wanxService);
ctx.provide('aliyunChat', chatService);

console.log('🚀 [DSH Runtime] Cordis 微内核及阿里云插件服务注册成功');

// 3. 启动对前端提供服务的 HTTP / SSE 接口
const server = http.createServer(async (req, res) => {
  // 跨域处理
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 健康检查
  if (req.url === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'ok',
        plugins: ['aliyun-wanx', 'aliyun-chat'],
        apiKeyConfigured: Boolean(apiKey),
        defaultModel,
        baseUrl: baseUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      })
    );
    return;
  }

  // 接口 1: 电商商品背景生成与光影融合 (调用百炼通义万相)
  if (req.url === '/api/generate-scene' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const { baseImageUrl, prompt, n, noiseLevel } = JSON.parse(body || '{}');

        if (!baseImageUrl) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ code: 400, message: 'baseImageUrl 不能为空' }));
          return;
        }

        const images = await ctx.aliyunWanx.generateEcommerceScene({
          baseImageUrl,
          prompt: prompt || '高奢极简展台，高级轮廓光，柔和阴影，4k画质',
          n: n || 4,
          noiseLevel: noiseLevel || 300,
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 0, data: { images } }));
      } catch (err: any) {
        console.error('生图异常:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 500, message: err.message || '内部服务错误' }));
      }
    });
    return;
  }

  // 接口 2: AI 营销策划与对话 (SSE 流式输出)
  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const { messages, model } = JSON.parse(body || '{}');

        res.writeHead(200, {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
        });

        const stream = ctx.aliyunChat.streamChat(
          messages || [{ role: 'user', content: '你好' }],
          model
        );

        for await (const chunk of stream) {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }

        res.write('data: [DONE]\n\n');
        res.end();
      } catch (err: any) {
        console.error('Chat 异常:', err);
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ code: 404, message: 'Route Not Found' }));
});

server.listen(port, () => {
  console.log(`\n======================================================`);
  console.log(`🌟 Auto-Winning AI Harness 后端启动成功！`);
  console.log(`📡 服务地址: http://localhost:${port}`);
  console.log(`🔌 已挂载插件: 阿里云通义万相 (生图/换光)、阿里云百炼 Chat`);
  console.log(`🔑 认证状态: ${apiKey ? '百炼 API Key 已就绪 ✅' : '未检测到 API Key ⚠️'}`);
  console.log(`======================================================\n`);
});
