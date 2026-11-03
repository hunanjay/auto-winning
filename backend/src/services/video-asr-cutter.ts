import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import OSS from 'ali-oss';
import dotenv from 'dotenv';
import { Context } from '@deepseek-ai/cordis';

dotenv.config();

const execFileAsync = promisify(execFile);

const FFMPEG_PATH = fs.existsSync('/opt/homebrew/bin/ffmpeg')
  ? '/opt/homebrew/bin/ffmpeg'
  : 'ffmpeg';

const FFPROBE_PATH = fs.existsSync('/opt/homebrew/bin/ffprobe')
  ? '/opt/homebrew/bin/ffprobe'
  : 'ffprobe';

export interface SentenceItem {
  sentence_id?: number;
  begin_time: number; // 毫秒
  end_time: number;   // 毫秒
  text: string;
}

export interface HighlightClip {
  id: string;
  title: string;
  startSeconds: number;
  endSeconds: number;
  durationSeconds: number;
  timeRange: string;
  score: number;
  startPct: number;
  widthPct: number;
  tag: string;
  caption: string;
  transcriptSnippet: string;
  productName: string;
  productIndex: number;
  stage: string;
}

export interface ProductSegment {
  index: number;
  name: string;
  sellingPoints: string;
  startSeconds: number;
  endSeconds: number;
  startPct: number;
  widthPct: number;
}

export interface VideoAnalysisResult {
  videoId: string;
  filename: string;
  videoUrl: string;
  durationSeconds: number;
  width: number;
  height: number;
  transcripts: {
    fullText: string;
    sentences: SentenceItem[];
  };
  products: ProductSegment[];
  clips: HighlightClip[];
}

/**
 * 阿里云 OSS 客户端单例
 */
function getOSSClient() {
  const accessKeyId = process.env.OSS_ACCESS_KEY_ID || '';
  const accessKeySecret = process.env.OSS_ACCESS_KEY_SECRET || '';
  const bucket = process.env.OSS_BUCKET || 'bucket-jiashop';
  const region = 'oss-cn-hangzhou';

  if (!accessKeyId || !accessKeySecret) {
    return null;
  }

  return new OSS({
    region,
    accessKeyId,
    accessKeySecret,
    bucket,
    secure: true,
  });
}

/**
 * 1. 探测长视频物理元数据
 */
export async function probeVideo(videoPath: string): Promise<{ duration: number; width: number; height: number }> {
  try {
    const { stdout } = await execFileAsync(FFPROBE_PATH, [
      '-v', 'error',
      '-show_entries', 'format=duration:stream=width,height',
      '-of', 'json',
      videoPath,
    ]);
    const info = JSON.parse(stdout);
    const duration = parseFloat(info.format?.duration || '60');
    const stream = info.streams?.find((s: any) => s.width && s.height) || {};
    return {
      duration: Math.round(duration),
      width: stream.width || 1080,
      height: stream.height || 1920,
    };
  } catch (err) {
    console.warn('ffprobe 探测警告, 使用默认参数:', err);
    return { duration: 60, width: 1080, height: 1920 };
  }
}

/**
 * 2. 从长视频中极速抽取 16kHz 单声道音频 (mp3)
 */
export async function extractAudioFromVideo(videoPath: string, outputAudioPath: string): Promise<string> {
  const outputDir = path.dirname(outputAudioPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  await execFileAsync(FFMPEG_PATH, [
    '-y',
    '-i', videoPath,
    '-vn',
    '-ar', '16000',
    '-ac', '1',
    '-b:a', '64k',
    outputAudioPath,
  ]);

  return outputAudioPath;
}

/**
 * 3. 将抽取的音频上传至阿里云 OSS 并获取带有效签名的公开 HTTP URL
 */
export async function uploadAudioToOSS(localFilePath: string): Promise<string> {
  const client = getOSSClient();
  if (!client) {
    throw new Error('未配置阿里云 OSS 秘钥');
  }

  const fileName = `slicer_audios/${Date.now()}_${path.basename(localFilePath)}`;
  await client.put(fileName, localFilePath, {
    headers: { 'x-oss-object-acl': 'public-read' },
  }).catch(async () => {
    // 若 bucket 禁止 object-acl，使用普通上传
    await client.put(fileName, localFilePath);
  });

  // 获取带鉴权有效期的签名访问 URL，确保私有 bucket 也能直接被 DashScope 读取
  const signedUrl = client.signatureUrl(fileName, { expires: 3600 });
  return signedUrl;
}

/**
 * 4. 调用 DashScope Paraformer-v2 录音文件识别 API 获取字句级时间戳
 */
export async function transcribeWithParaformer(audioUrl: string): Promise<{ fullText: string; sentences: SentenceItem[] }> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    throw new Error('未配置 DASHSCOPE_API_KEY');
  }

  // 4.1 提交异步识别任务
  const submitRes = await fetch('https://dashscope.aliyuncs.com/api/v1/services/audio/asr/transcription', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model: 'paraformer-v2',
      input: {
        file_urls: [audioUrl],
      },
      parameters: {
        language_hints: ['zh'],
      },
    }),
  });

  const submitJson = await submitRes.json();
  const taskId = submitJson.output?.task_id;
  if (!taskId) {
    throw new Error(`提交 Paraformer 转写任务失败: ${JSON.stringify(submitJson)}`);
  }

  // 4.2 轮询任务状态直至完成 (长直播最长等待约 10 分钟)
  const maxAttempts = 200;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const pollRes = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const pollJson = await pollRes.json();
    const taskStatus = pollJson.output?.task_status;

    if (taskStatus === 'SUCCEEDED') {
      const resultObj = pollJson.output?.results?.[0];
      const transcriptionUrl = resultObj?.transcription_url || resultObj?.output?.results?.[0]?.transcription_url;

      if (!transcriptionUrl) {
        throw new Error('Paraformer 任务已完成但未返回转录结果 URL');
      }

      // 下载详细的转录 JSON
      const transRes = await fetch(transcriptionUrl);
      const transJson = await transRes.json();

      const transcripts = transJson.transcripts?.[0];
      const fullText = transcripts?.text || '';
      const rawSentences = transcripts?.sentences || [];

      const sentences: SentenceItem[] = rawSentences.map((s: any, idx: number) => ({
        sentence_id: idx + 1,
        begin_time: s.begin_time,
        end_time: s.end_time,
        text: s.text,
      }));

      return { fullText, sentences };
    }

    if (taskStatus === 'FAILED') {
      throw new Error(`Paraformer 转写任务失败: ${JSON.stringify(pollJson.output)}`);
    }
  }

  throw new Error('Paraformer 转写轮询超时');
}

const STAGES = ['开场引入', '卖点讲解', '效果演示', '价格逼单'] as const;

const fmtTime = (s: number) => {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
};

/**
 * 通过 DeepSeek Harness (DSH) 插件微内核调用 LLM 并自动记录 Trace
 */
async function callDshJSON(
  ctx: Context,
  action: string,
  systemPrompt: string,
  userPrompt: string,
  jobId?: string
): Promise<any> {
  if (!ctx.aliyunChat) {
    throw new Error('DeepSeek Harness 未装配 aliyunChat 插件');
  }

  return await ctx.aliyunChat.chatJSON(
    [
      {
        role: 'system',
        content: `${systemPrompt}\n注意：JSON 字符串值内部不得出现英文双引号，需要引用请用中文引号“”。`,
      },
      { role: 'user', content: userPrompt },
    ],
    {
      plugin: 'dsh:slicer:llm',
      action,
      jobId,
      temperature: 0.1,
      maxAttempts: 3,
    }
  );
}

/**
 * 将任意时间 (秒) 吸附到句子边界，避免切断半句话
 */
function snapToSentences(
  sentences: SentenceItem[],
  start: number,
  end: number
): { start: number; end: number } {
  const startMs = start * 1000;
  const endMs = end * 1000;
  const first = sentences.find((s) => s.end_time > startMs) || sentences[0];
  const lastCandidates = sentences.filter((s) => s.begin_time < endMs);
  const last = lastCandidates[lastCandidates.length - 1] || sentences[sentences.length - 1];
  return {
    start: Math.max(0, Math.floor(first.begin_time / 1000)),
    end: Math.ceil(last.end_time / 1000),
  };
}

function formatSentences(sentences: SentenceItem[]): string {
  return sentences
    .map((s, i) => `#${i} [${(s.begin_time / 1000).toFixed(1)}s-${(s.end_time / 1000).toFixed(1)}s] ${s.text}`)
    .join('\n');
}

/**
 * 阶段 1：产品分段。识别整场直播中依次讲解的各个产品及其起止句子编号 (走 DSH 微内核)
 */
export async function segmentProducts(
  ctx: Context,
  sentences: SentenceItem[],
  jobId?: string
): Promise<{ productName: string; sellingPoints: string; startIdx: number; endIdx: number }[]> {
  const systemPrompt = `你是直播带货内容分析师。输入是一场直播的带时间戳逐句口播 (每句有 #编号)。
任务：识别主播依次讲解了哪几个不同的产品，并给出每个产品对应的起止句子编号。
规则：
1. 只按"产品"划分，同一产品的开场、讲解、演示、逼单都属于同一段；
2. 以下情况视为产品切换：出现新的产品名/品类、"下一款/接下来/再来看/上链接"后讲新东西、话题明显转换；
3. 开场寒暄、福利预告、与具体产品无关的闲聊，不单独成为产品，并入相邻产品段或忽略；
4. 各产品段按时间顺序排列，句子编号不重叠，startIdx<=endIdx；
5. 若整场只有一个产品，就只输出一段；
6. 只输出 JSON 数组，不要任何解释。
格式：[{"productName":"产品名","sellingPoints":"一句话核心卖点","startIdx":0,"endIdx":12}]`;

  const result = await callDshJSON(ctx, 'segmentProducts', systemPrompt, formatSentences(sentences), jobId);
  const maxIdx = sentences.length - 1;
  const segs = (result as any[])
    .map((r) => ({
      productName: String(r.productName || '未命名产品'),
      sellingPoints: String(r.sellingPoints || ''),
      startIdx: Math.max(0, Math.min(maxIdx, Number(r.startIdx))),
      endIdx: Math.max(0, Math.min(maxIdx, Number(r.endIdx))),
    }))
    .filter((r) => Number.isFinite(r.startIdx) && Number.isFinite(r.endIdx) && r.startIdx <= r.endIdx)
    .sort((a, b) => a.startIdx - b.startIdx);

  if (!segs.length) throw new Error('产品分段结果为空');
  return segs;
}

/**
 * 阶段 2：在单个产品段内，按带货环节各切出一条切片 (走 DSH 微内核)
 */
async function clipsForProduct(
  ctx: Context,
  productIndex: number,
  seg: { productName: string; sellingPoints: string; startIdx: number; endIdx: number },
  sentences: SentenceItem[],
  totalDuration: number,
  jobId?: string
): Promise<HighlightClip[]> {
  const sub = sentences.slice(seg.startIdx, seg.endIdx + 1);
  if (!sub.length) return [];

  const systemPrompt = `你是电商短视频剪辑总监。输入是某一个产品的带时间戳口播 (每句有 #编号)。
请在这个产品范围内，按带货环节切出切片，供后期自由组合。环节固定为：
- 开场引入：引出产品、吸引注意
- 卖点讲解：成分/功能/参数/优势
- 效果演示：试用、对比、实测、展示
- 价格逼单：价格锚点、福利赠品、限时限量、催促下单
规则：
1. 每个环节最多一条；该产品里确实没有对应内容的环节就不要输出，不得编造；
2. 切片必须由连续的完整句子组成，用 startIdx/endIdx (句子编号，含) 表示；
3. 单条建议 8~40 秒，不要超出本产品编号范围；
4. score 为 80~99 的转化潜力分；hook 为该片段最有杀伤力的一句原话 (必须来自口播原文)；
5. 只输出 JSON 数组。
格式：[{"stage":"开场引入","startIdx":0,"endIdx":2,"score":90,"hook":"原话","summary":"一句话描述"}]`;

  const local = sub.map((s, i) => `#${i} [${(s.begin_time / 1000).toFixed(1)}s-${(s.end_time / 1000).toFixed(1)}s] ${s.text}`).join('\n');
  const raw = (await callDshJSON(
    ctx,
    `clipsForProduct:${seg.productName}`,
    systemPrompt,
    `产品：${seg.productName}\n核心卖点：${seg.sellingPoints}\n\n${local}`,
    jobId
  )) as any[];

  const seen = new Set<string>();
  const clips: HighlightClip[] = [];
  for (const c of raw) {
    const stage = String(c.stage || '');
    if (!(STAGES as readonly string[]).includes(stage) || seen.has(stage)) continue;
    const a = Math.max(0, Math.min(sub.length - 1, Number(c.startIdx)));
    const b = Math.max(0, Math.min(sub.length - 1, Number(c.endIdx)));
    if (!Number.isFinite(a) || !Number.isFinite(b) || a > b) continue;
    seen.add(stage);

    // 严格落在产品边界内，并按句子边界对齐
    const start = Math.max(0, Math.floor(sub[a].begin_time / 1000));
    const end = Math.min(totalDuration, Math.ceil(sub[b].end_time / 1000));
    const dur = Math.max(1, end - start);
    clips.push({
      id: `p${productIndex + 1}-${stage}-${start}`,
      title: `${seg.productName} · ${stage}`,
      productName: seg.productName,
      productIndex,
      stage,
      startSeconds: start,
      endSeconds: end,
      durationSeconds: dur,
      timeRange: `${fmtTime(start)} - ${fmtTime(end)}`,
      score: Math.max(80, Math.min(99, Number(c.score) || 90)),
      startPct: Math.round((start / totalDuration) * 100),
      widthPct: Math.max(2, Math.round((dur / totalDuration) * 100)),
      tag: stage,
      caption: String(c.hook || c.summary || ''),
      transcriptSnippet: sub.slice(a, b + 1).map((s) => s.text).join(''),
    });
  }
  return clips;
}

/**
 * 两阶段高光分析：先按产品分段，再逐产品按带货环节切片 (走 DSH 微内核，支持流式逐步推送)
 */
export async function analyzeProductsAndClips(
  ctx: Context,
  sentences: SentenceItem[],
  totalDuration: number,
  jobId?: string,
  onEvent?: (event: string, payload: any) => void
): Promise<{ products: ProductSegment[]; clips: HighlightClip[] }> {
  const segs = await segmentProducts(ctx, sentences, jobId);
  const products: ProductSegment[] = [];
  const clips: HighlightClip[] = [];

  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i];
    const range = snapToSentences(sentences, sentences[seg.startIdx].begin_time / 1000, sentences[seg.endIdx].end_time / 1000);
    products.push({
      index: i,
      name: seg.productName,
      sellingPoints: seg.sellingPoints,
      startSeconds: range.start,
      endSeconds: range.end,
      startPct: Math.round((range.start / totalDuration) * 100),
      widthPct: Math.max(2, Math.round(((range.end - range.start) / totalDuration) * 100)),
    });
  }

  // 立即推送产品分段就绪事件 (前端时间轴色带可瞬间点亮)
  if (onEvent) {
    onEvent('products_ready', {
      products,
      percent: 55,
      label: `成功划分 ${products.length} 个产品区间，正在逐产品规划切片...`,
    });
  }

  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i];
    const productClips = await clipsForProduct(ctx, i, seg, sentences, totalDuration, jobId).catch((err) => {
      console.warn(`产品 ${seg.productName} 切片分析失败:`, err);
      return [] as HighlightClip[];
    });

    clips.push(...productClips);

    // 关键点：每完成一个产品的切片，立即向前端流式吐出该批切片！
    if (onEvent) {
      const curPct = 55 + Math.round(((i + 1) / segs.length) * 40);
      onEvent('clips_batch', {
        productIndex: i,
        productName: seg.productName,
        clips: productClips,
        percent: curPct,
        label: `【${seg.productName}】切片规划就绪 (共 ${productClips.length} 条)...`,
      });
    }
  }

  return { products, clips };
}


/**
 * 6. 执行全链路 ASR + Qwen 高光拆条完整工作流 (支持渐进式流式事件推送)
 */
export async function runFullASRWorkflow(
  ctx: Context,
  videoPath: string,
  videoId: string,
  fileName: string,
  videoUrl: string,
  onProgress: (step: number, label: string) => void = () => {},
  jobId?: string,
  onEvent?: (event: string, payload: any) => void
): Promise<VideoAnalysisResult> {
  // Step 1: probe 视频时长和分辨率
  onProgress(0, '探测视频信息');
  if (onEvent) {
    onEvent('progress', { step: 0, label: '正在探测视频信息与分辨率...', percent: 5 });
  }
  const { duration, width, height } = await probeVideo(videoPath);

  // Step 2: FFmpeg 提取音频
  onProgress(1, '提取音频');
  if (onEvent) {
    onEvent('progress', { step: 1, label: '正在通过 FFmpeg 提取 16kHz 单声道音频...', percent: 15 });
  }
  const audioDir = path.resolve(path.dirname(videoPath), '../audios');
  const audioPath = path.resolve(audioDir, `${path.basename(videoPath, path.extname(videoPath))}.mp3`);
  await extractAudioFromVideo(videoPath, audioPath);

  // Step 3: 上传音频至阿里云 OSS
  onProgress(2, '上传音频');
  if (onEvent) {
    onEvent('progress', { step: 2, label: '正在上传音频至阿里云 OSS (签名鉴权)...', percent: 25 });
  }
  const audioOssUrl = await uploadAudioToOSS(audioPath);

  // Step 4: DashScope Paraformer 语音识别
  onProgress(3, '语音转文字');
  if (onEvent) {
    onEvent('progress', { step: 3, label: 'DashScope Paraformer 正在转写并生成句级时间戳...', percent: 35 });
  }
  console.log(`音频已上传至 OSS: ${audioOssUrl}`);
  const transcripts = await transcribeWithParaformer(audioOssUrl);
  console.log(`Paraformer 语音识别完成，共识别出 ${transcripts.sentences.length} 句字幕`);
  if (!transcripts.sentences.length) {
    throw new Error('未识别到任何口播内容，无法按产品切片');
  }

  // 关键点：ASR 识别一完成，立即流式推送字幕数据 (前端右侧台词和卡拉OK字幕可瞬间展示！)
  if (onEvent) {
    onEvent('asr_ready', {
      transcripts,
      percent: 45,
      label: `语音识别完成 (共 ${transcripts.sentences.length} 句字幕)，正在进入 Qwen 产品语义分段...`,
    });
  }

  onProgress(4, '识别产品并规划切片');
  // Step 5: 两阶段分析 (走 DSH 微内核，自动记录 Trace，并流式推送各个产品的切片)
  const { products, clips } = await analyzeProductsAndClips(
    ctx,
    transcripts.sentences,
    duration,
    jobId,
    onEvent
  );

  const finalResult: VideoAnalysisResult = {
    videoId,
    filename: fileName,
    videoUrl,
    durationSeconds: duration,
    width,
    height,
    transcripts,
    products,
    clips,
  };

  if (onEvent) {
    onEvent('complete', {
      ...finalResult,
      percent: 100,
      label: `全链路切片完成！共规划 ${products.length} 个商品、${clips.length} 条切片`,
    });
  }

  return finalResult;
}

/**
 * 7. FFmpeg 真实物理裁剪导出 MP4 切片
 */
export async function cutVideoClip(
  sourceVideoPath: string,
  outputClipPath: string,
  startSeconds: number,
  durationSeconds: number
): Promise<{ outputPath: string; sizeBytes: number; duration: number }> {
  const outputDir = path.dirname(outputClipPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const startStr = String(startSeconds);
  const durStr = String(durationSeconds);

  await execFileAsync(FFMPEG_PATH, [
    '-y',
    '-ss', startStr,
    '-t', durStr,
    '-i', sourceVideoPath,
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-c:a', 'aac',
    '-avoid_negative_ts', '1',
    outputClipPath,
  ]);

  const stat = fs.existsSync(outputClipPath) ? fs.statSync(outputClipPath) : { size: 0 };

  return {
    outputPath: outputClipPath,
    sizeBytes: stat.size,
    duration: durationSeconds,
  };
}
