import React, { useState, useRef, useEffect } from 'react';
import {
  Scissors,
  Upload,
  Play,
  Pause,
  Download,
  Flame,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Volume2,
  VolumeX,
  Clock,
  Layers,
  FileText,
  Activity,
  Mic,
  Cpu,
  Loader2,
  Check,
  FolderOpen,
  Trash2
} from 'lucide-react';

export default function VideoSlicerStudio({ onAddToast }) {
  const [videoData, setVideoData] = useState({
    id: 'sample_livestream',
    fileName: '20261102_淘宝双11大促带货直播回放.mp4',
    videoUrl: 'http://localhost:3001/uploads/videos/sample_livestream.mp4',
    duration: 51,
    durationFormatted: '00:51',
    width: 1080,
    height: 1920
  });

  const [transcripts, setTranscripts] = useState({
    fullText: '欢迎来到团团直播间，今天大家有福了，给家人们带来的是我们的镇店爆款第一种福利。平时一瓶要299，今天直播间直接破价只要99，并且买正装，多送一份正装体验装拆开用，不满意包退。大家仔细看镜头前的微距特写，这个细腻的质感和边缘处理真的是顶奢品质。很多姐妹经常熬夜加班，脸色暗沉，用它一抹提亮，三分钟就能清爽出门。现在直播间还有最后10秒钟大促倒计时，前100名加购下单的宝子，我们再加赠一份精美伴手礼盒，手慢无。32一直接上链接，赶紧加购。',
    sentences: [
      { sentence_id: 1, begin_time: 0, end_time: 8926, text: '欢迎来到团团直播间，今天大家有福了，给家人们带来的是我们的镇店爆款第一种福利。' },
      { sentence_id: 2, begin_time: 8926, end_time: 20333, text: '平时一瓶要299，今天直播间直接破价只要99，并且买正装，多送一份正装体验装拆开用，不满意包退。' },
      { sentence_id: 3, begin_time: 20333, end_time: 28268, text: '大家仔细看镜头前的微距特写，这个细腻的质感和边缘处理真的是顶奢品质。' },
      { sentence_id: 4, begin_time: 28268, end_time: 35720, text: '很多姐妹经常熬夜加班，脸色暗沉，用它一抹提亮，三分钟就能清爽出门。' },
      { sentence_id: 5, begin_time: 35720, end_time: 47395, text: '现在直播间还有最后10秒钟大促倒计时，前100名加购下单的宝子，我们再加赠一份精美伴手礼盒，手慢无。' },
      { sentence_id: 6, begin_time: 47395, end_time: 50580, text: '32一直接上链接，赶紧加购。' }
    ]
  });

  const [clips, setClips] = useState([
    {
      id: 'asr-clip-1',
      title: '黄金破价锚点片段',
      startSeconds: 8,
      endSeconds: 21,
      durationSeconds: 13,
      timeRange: '00:08 - 00:21',
      score: 98,
      startPct: 16,
      widthPct: 25,
      tag: '价格锚点峰值',
      caption: '“平时299一瓶，今天破价只要99！”',
      transcriptSnippet: '平时一瓶要299，今天直播间直接破价只要99，并且买正装，多送一份正装体验装拆开用，不满意包退。'
    },
    {
      id: 'asr-clip-2',
      title: '微距质感与痛点反杀片段',
      startSeconds: 20,
      endSeconds: 36,
      durationSeconds: 16,
      timeRange: '00:20 - 00:36',
      score: 95,
      startPct: 39,
      widthPct: 31,
      tag: '特写高光帧',
      caption: '“熬夜暗沉脸？看这微距质感，一抹就提亮！”',
      transcriptSnippet: '大家仔细看镜头前的微距特写，这个细腻的质感和边缘处理真的是顶奢品质。很多姐妹经常熬夜加班，脸色暗沉，用它一抹提亮，三分钟就能清爽出门。'
    },
    {
      id: 'asr-clip-3',
      title: '限时逼单加购波峰片段',
      startSeconds: 35,
      endSeconds: 48,
      durationSeconds: 13,
      timeRange: '00:35 - 00:48',
      score: 97,
      startPct: 69,
      widthPct: 25,
      tag: '加购波峰',
      caption: '“最后10秒！前100名加购再送精美礼盒！”',
      transcriptSnippet: '现在直播间还有最后10秒钟大促倒计时，前100名加购下单的宝子，我们再加赠一份精美伴手礼盒，手慢无。'
    }
  ]);

  const [cases, setCases] = useState([]);
  const [casesOpen, setCasesOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [productFilter, setProductFilter] = useState(-1); // -1 = 全部产品
  const [activeClip, setActiveClip] = useState(clips[0]);
  const [activeTab, setActiveTab] = useState('clips'); // 'clips' | 'transcripts'
  const [activeRules, setActiveRules] = useState(['语音破价锚点', '微距特写帧', '加购波峰']);
  const [isUploading, setIsUploading] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const ANALYZE_STEPS = ['探测视频信息', '提取音频', '上传音频', '语音转文字', '识别产品并规划切片'];
  const [isCutting, setIsCutting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(-1);
  const [serverStatus, setServerStatus] = useState({
    status: 'connected',
    serverUrl: 'http://127.0.0.1:8085',
    webuiUrl: 'http://127.0.0.1:8501'
  });

  const fileInputRef = useRef(null);
  const progressTimerRef = useRef(null);
  const videoRef = useRef(null);

  // 1. 初始化时向后端拉取真实 ASR + Qwen 高光分析数据
  useEffect(() => {
    fetch('http://localhost:3001/api/slicer/upload-and-analyze', { method: 'POST' })
      .then((r) => r.json())
      .then((res) => {
        if (res.code === 0 && res.data) {
          setVideoData(res.data.video);
          if (res.data.transcripts) {
            setTranscripts(res.data.transcripts);
          }
          setProducts(res.data.products || []);
          setProductFilter(-1);
          if (res.data.clips?.length) {
            setClips(res.data.clips);
            setActiveClip(res.data.clips[0]);
          }
        }
      })
      .catch(() => {});

    loadCases();

    // 检查 MoneyPrinter 引擎状态
    fetch('http://localhost:3001/api/slicer/status')
      .then((r) => r.json())
      .then((data) => {
        if (data.code === 0) {
          setServerStatus(data);
        }
      })
      .catch(() => {});
  }, []);

  // 案例库：拉取 / 载入 / 删除
  const loadCases = () =>
    fetch('http://localhost:3001/api/slicer/cases')
      .then((r) => r.json())
      .then((res) => res.code === 0 && setCases(res.data))
      .catch(() => {});

  const applyAnalysis = (data) => {
    setVideoData(data.video);
    if (data.transcripts) setTranscripts(data.transcripts);
    setProducts(data.products || []);
    setProductFilter(-1);
    if (data.clips?.length) {
      setClips(data.clips);
      setActiveClip(data.clips[0]);
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleOpenCase = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/api/slicer/cases/${encodeURIComponent(id)}`).then((r) => r.json());
      if (res.code === 0) {
        applyAnalysis(res.data);
        setCasesOpen(false);
      }
    } catch (err) {
      onAddToast && onAddToast(`载入案例失败: ${err.message}`);
    }
  };

  const handleDeleteCase = async (id) => {
    await fetch(`http://localhost:3001/api/slicer/cases/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
    loadCases();
  };

  // 2. 选择切片时，播放器立即精确定位到该切片的起始时间点并播放
  const handleSelectClip = (clip) => {
    setActiveClip(clip);
    if (videoRef.current) {
      videoRef.current.currentTime = clip.startSeconds;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // 3. 点击某句台词时，播放器跳到该句开始时间
  const handleSelectSentence = (sentence) => {
    if (videoRef.current) {
      const targetSec = sentence.begin_time / 1000;
      videoRef.current.currentTime = targetSec;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // 4. 视频播放时间更新：保持在当前切片区间循环试看，并高亮实时台词
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);

    // 计算当前口播的台词
    const currMs = curr * 1000;
    const activeIdx = transcripts.sentences.findIndex(
      (s) => currMs >= s.begin_time && currMs <= s.end_time
    );
    setActiveSentenceIndex(activeIdx);

    if (activeClip && curr >= activeClip.endSeconds) {
      // 循环回切片起点
      videoRef.current.currentTime = activeClip.startSeconds;
    }
  };

  // 5. 播放 / 暂停切换
  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // 6. 真实上传本地长视频并执行 ASR + Qwen 分析
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const jobId = `job-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setProgressStep(0);
      setElapsed(0);
      const startedAt = Date.now();
      const timer = setInterval(async () => {
        setElapsed(Math.floor((Date.now() - startedAt) / 1000));
        try {
          const pr = await fetch(`http://localhost:3001/api/slicer/progress/${jobId}`).then((r) => r.json());
          if (pr.code === 0) setProgressStep(pr.data.step);
        } catch {}
      }, 1000);
      progressTimerRef.current = timer;

      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('video', file);

      const res = await fetch('http://localhost:3001/api/slicer/upload-and-analyze', {
        method: 'POST',
        body: formData
      });

      const json = await res.json();
      if (json.code === 0 && json.data) {
        setVideoData(json.data.video);
        if (json.data.transcripts) {
          setTranscripts(json.data.transcripts);
        }
        setProducts(json.data.products || []);
        setProductFilter(-1);
        if (json.data.clips?.length) {
          setClips(json.data.clips);
          setActiveClip(json.data.clips[0]);
        }
        loadCases();
        onAddToast && onAddToast(`已完成语音转文字及 Qwen 智能高光拆条分析，探测到 ${json.data.clips.length} 个转化高光段`);
      } else {
        throw new Error(json.error || '视频解析失败');
      }
    } catch (err) {
      console.error('上传视频解析错误:', err);
      onAddToast && onAddToast(`视频解析失败: ${err.message}`);
    } finally {
      clearInterval(progressTimerRef.current);
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 7. 真实物理切片 (调用后端 FFmpeg 裁剪并触发下载)
  const handleExportSingle = async (clip) => {
    setIsCutting(true);
    try {
      const res = await fetch('http://localhost:3001/api/slicer/cut-clip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: videoData.id,
          startSeconds: clip.startSeconds,
          durationSeconds: clip.durationSeconds,
          clipId: clip.id,
          clipTitle: clip.title
        })
      });

      const json = await res.json();
      if (json.code === 0 && json.data?.downloadUrl) {
        const downloadUrl = json.data.downloadUrl;
        // 自动触发浏览器真实下载 (使用 Blob 避免离开当前页面)
        try {
          const blobRes = await fetch(downloadUrl);
          const blob = await blobRes.blob();
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = `${clip.title}_${clip.timeRange.replace(/\s+/g, '')}.mp4`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
        } catch {
          window.open(downloadUrl, '_blank');
        }

        onAddToast && onAddToast(`切片导出成功，已自动下载真实 MP4 文件 (${(json.data.sizeBytes / 1024 / 1024).toFixed(2)} MB)`);
      } else {
        throw new Error(json.error || '切片失败');
      }
    } catch (err) {
      console.error('物理切片异常:', err);
      onAddToast && onAddToast(`切片导出失败: ${err.message}`);
    } finally {
      setIsCutting(false);
    }
  };

  // 8. 一键物理批量导出所有切片
  const handleExportAll = async () => {
    setIsCutting(true);
    try {
      const res = await fetch('http://localhost:3001/api/slicer/cut-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: videoData.id,
          clips: visibleClips
        })
      });

      const json = await res.json();
      if (json.code === 0 && json.data?.clips) {
        for (let idx = 0; idx < json.data.clips.length; idx++) {
          const c = json.data.clips[idx];
          try {
            const blobRes = await fetch(c.downloadUrl);
            const blob = await blobRes.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `${c.title}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
          } catch {
            window.open(c.downloadUrl, '_blank');
          }
          await new Promise((resolve) => setTimeout(resolve, 300));
        }

        onAddToast && onAddToast(`已通过后端 FFmpeg 物理裁剪出全部 ${json.data.clips.length} 条真实带货 MP4 切片并开始下载`);
      } else {
        throw new Error(json.error || '批量导出失败');
      }
    } catch (err) {
      console.error('批量导出异常:', err);
      onAddToast && onAddToast(`批量切片失败: ${err.message}`);
    } finally {
      setIsCutting(false);
    }
  };

  const PALETTE = ['#2563eb', '#db2777', '#059669', '#d97706', '#7c3aed', '#0891b2', '#dc2626', '#65a30d'];
  const colorOf = (i) => PALETTE[(i ?? 0) % PALETTE.length];
  const visibleClips = productFilter < 0 ? clips : clips.filter((c) => c.productIndex === productFilter);

  const toggleRule = (rule) => {
    setActiveRules((prev) =>
      prev.includes(rule) ? prev.filter((r) => r !== rule) : [...prev, rule]
    );
  };

  return (
    <div className="relative flex-1 flex flex-col h-full bg-[#fcfcfd] overflow-hidden text-neutral-800">
      {/* 导入分析 Loading 浮层 */}
      {isUploading && (
        <div className="absolute inset-0 z-50 flex items-start justify-center pt-40 bg-white/70 backdrop-blur-sm">
          <div className="w-[380px] rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <Loader2 className="w-5 h-5 animate-spin text-neutral-900" />
              <div>
                <div className="text-sm font-semibold text-neutral-900">正在分析视频</div>
                <div className="text-xs text-neutral-400">已用时 {elapsed}s，长视频可能需要几分钟，请勿关闭页面</div>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden mb-5">
              <div
                className="h-full bg-neutral-900 transition-all duration-700"
                style={{ width: `${Math.min(95, ((progressStep + 0.5) / ANALYZE_STEPS.length) * 100)}%` }}
              />
            </div>
            <ul className="space-y-2.5">
              {ANALYZE_STEPS.map((label, i) => {
                const done = i < progressStep;
                const current = i === progressStep;
                return (
                  <li key={label} className={`flex items-center gap-2.5 text-xs ${done || current ? 'text-neutral-900' : 'text-neutral-300'}`}>
                    {done ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : current ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-neutral-200" />
                    )}
                    <span className={current ? 'font-medium' : ''}>{label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* 顶部工具栏与架构指示 */}
      <header className="min-h-14 py-2 gap-y-2 flex-wrap border-b border-neutral-200/80 bg-white/90 backdrop-blur px-6 flex items-center justify-between shrink-0 z-10 [&_button]:whitespace-nowrap [&_a]:whitespace-nowrap [&_span]:whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
            <span>识别模式：</span>
            {['语音破价锚点', '微距特写帧', '加购波峰', '矩阵自动去重'].map((rule) => {
              const active = activeRules.includes(rule);
              return (
                <button
                  key={rule}
                  onClick={() => toggleRule(rule)}
                  className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                    active
                      ? 'bg-neutral-900 text-white font-medium shadow-sm'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {rule}
                </button>
              );
            })}
          </div>

          <div className="h-4 w-px bg-neutral-200" />

          {/* 架构就绪状态药丸 */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <Mic className="w-3.5 h-3.5 text-emerald-600" />
              Paraformer ASR 就绪
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              Qwen 语义高光挖掘
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
              <Scissors className="w-3.5 h-3.5 text-neutral-600" />
              FFmpeg 物理裁剪
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => { setCasesOpen(!casesOpen); loadCases(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs text-neutral-600 hover:text-neutral-900 hover:border-neutral-300 transition-colors bg-white"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>案例库 ({cases.length})</span>
            </button>
            {casesOpen && (
              <div className="absolute right-0 top-full mt-2 w-[360px] max-h-[420px] overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-xl z-40 p-2">
                {cases.length === 0 && (
                  <div className="p-4 text-xs text-neutral-400 text-center">暂无案例，导入视频分析后会自动保存</div>
                )}
                {cases.map((cs) => (
                  <div
                    key={cs.id}
                    onClick={() => handleOpenCase(cs.id)}
                    className={`group flex items-start justify-between gap-2 p-3 rounded-lg cursor-pointer hover:bg-neutral-50 ${videoData.id === cs.id ? 'bg-neutral-50 ring-1 ring-neutral-200' : ''}`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-neutral-900 truncate">{cs.name}</div>
                      <div className="mt-1 text-[11px] text-neutral-400">
                        {cs.product_count} 个产品 / {cs.clip_count} 条切片 / {Math.floor(cs.duration / 60)}分{cs.duration % 60}秒
                      </div>
                      <div className="text-[11px] text-neutral-300">{new Date(cs.created_at).toLocaleString()}</div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteCase(cs.id); }}
                      className="p-1 rounded text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="删除案例"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <a
            href={serverStatus.webuiUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs text-neutral-600 hover:text-neutral-900 hover:border-neutral-300 transition-colors bg-white shadow-xs"
            title="在新标签页打开 MoneyPrinterTurbo 专属可视化剪辑工作台"
          >
            <span>切片工作台 WebUI</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="video/*"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? '正在转写解析...' : '导入长视频/回放'}</span>
          </button>

          <button
            onClick={handleExportAll}
            disabled={isCutting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isCutting ? '正在物理裁剪...' : `一键导出${productFilter >= 0 ? '该产品' : '全部'} ${visibleClips.length} 条切片`}</span>
          </button>
        </div>
      </header>

      {/* 主体工作区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：原生视频流媒体预览与时间轴联动 */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
          {/* 视频信息栏 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">当前解析素材：</span>
              <span className="text-sm font-semibold text-neutral-800">{videoData.fileName}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 font-mono">
                {videoData.durationFormatted} ({videoData.width}x{videoData.height})
              </span>
            </div>
            <div className="text-xs text-neutral-500">
              已通过 ASR 语音识别并规划 <span className="font-semibold text-neutral-900">{clips.length}</span> 个高光带货峰值区间
            </div>
          </div>

          {/* 真实原生视频播放器视窗 */}
          <div className="relative w-full aspect-video bg-neutral-950 rounded-2xl overflow-hidden shadow-md flex items-center justify-center border border-neutral-800 group">
            <video
              ref={videoRef}
              src={videoData.videoUrl}
              onTimeUpdate={handleTimeUpdate}
              muted={isMuted}
              playsInline
              className="w-full h-full object-contain"
              onClick={handleTogglePlay}
            />

            {/* 正在口播的字幕浮层 (卡拉OK式实时字幕) */}
            {activeSentenceIndex >= 0 && transcripts.sentences[activeSentenceIndex] && (
              <div className="absolute bottom-16 left-6 right-6 flex justify-center pointer-events-none">
                <div className="max-w-xl px-4 py-2 rounded-xl bg-black/75 backdrop-blur text-white text-sm font-medium text-center shadow-lg border border-white/10 animate-fade-in">
                  <span className="text-neutral-400 mr-2 text-xs font-mono">
                    {(transcripts.sentences[activeSentenceIndex].begin_time / 1000).toFixed(1)}s
                  </span>
                  {transcripts.sentences[activeSentenceIndex].text}
                </div>
              </div>
            )}

            {/* 悬浮切片金句提示 */}
            {activeClip && (
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur border border-white/10 text-white text-xs">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-medium">{activeClip.caption}</span>
              </div>
            )}

            {/* 画面内播放控制器 */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between px-4 py-2 rounded-xl bg-black/50 backdrop-blur border border-white/10 text-white opacity-90 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleTogglePlay}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-neutral-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>
                <span className="text-xs font-mono text-neutral-300">
                  {Math.floor(currentTime / 60).toString().padStart(2, '0')}:
                  {Math.floor(currentTime % 60).toString().padStart(2, '0')} / {videoData.durationFormatted}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {activeClip?.tag || '切片试看中'}
                </span>
              </div>
            </div>
          </div>

          {/* 实时时间轨与切片峰值分布 */}
          <div className="mt-5 p-4 rounded-xl bg-white border border-neutral-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-medium text-neutral-700 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-neutral-500" />
                AI 爆款转化热度轨 (ASR 语义 + 口播破价关键词)
              </span>
              <span className="text-neutral-400 font-mono">
                当前: {Math.floor(currentTime)}s / 总长: {videoData.durationFormatted}
              </span>
            </div>

            {/* 产品分段色带 */}
            {products.length > 0 && (
              <div className="relative h-6 mb-2 bg-neutral-50 rounded-md overflow-hidden border border-neutral-200">
                {products.map((p) => (
                  <button
                    key={p.index}
                    onClick={() => setProductFilter(productFilter === p.index ? -1 : p.index)}
                    className="absolute top-0 bottom-0 text-[11px] text-white font-medium truncate px-2 text-left"
                    style={{
                      left: `${p.startPct}%`,
                      width: `${p.widthPct}%`,
                      background: colorOf(p.index),
                      opacity: productFilter < 0 || productFilter === p.index ? 1 : 0.3
                    }}
                    title={`${p.name}: ${p.sellingPoints}`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}

            {/* 时间轴标尺与切片区间 */}
            <div className="relative h-10 bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200 flex items-center">
              {/* 播放头游标 */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-neutral-900 z-20 pointer-events-none transition-all duration-100"
                style={{
                  left: `${videoData.duration > 0 ? (currentTime / videoData.duration) * 100 : 0}%`
                }}
              />

              {/* 切片区间色块 */}
              {visibleClips.map((clip) => {
                const isActive = activeClip?.id === clip.id;
                return (
                  <button
                    key={clip.id}
                    onClick={() => handleSelectClip(clip)}
                    className={`absolute top-1 bottom-1 rounded-md text-xs font-medium flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-neutral-900 text-white shadow-sm ring-2 ring-neutral-900/30 z-10'
                        : 'bg-white/90 text-neutral-700 hover:bg-neutral-200/80 border border-neutral-300/60'
                    }`}
                    style={{
                      left: `${clip.startPct}%`,
                      width: `${clip.widthPct}%`
                    }}
                    title={`${clip.title} (${clip.timeRange})`}
                  >
                    <span className="truncate px-2 text-[11px]">
                      {clip.title} {clip.durationSeconds}s
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 右侧：Tab 选项卡 (高光切片 vs ASR 逐字稿) */}
        <div className="w-[440px] border-l border-neutral-200/80 bg-white flex flex-col shrink-0">
          {/* Tab 切换栏 */}
          <div className="p-4 border-b border-neutral-200/80 flex items-center justify-between">
            <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg">
              <button
                onClick={() => setActiveTab('clips')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === 'clips'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>智能高光切片 ({clips.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('transcripts')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === 'transcripts'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>ASR 口播逐字稿</span>
              </button>
            </div>

            <span className="text-[11px] text-neutral-400">
              {activeTab === 'clips' ? '点击定位并试看' : '点击台词跳转'}
            </span>
          </div>

          {/* Tab 1: 智能高光切片列表 */}
          {activeTab === 'clips' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {products.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pb-1">
                  <button
                    onClick={() => setProductFilter(-1)}
                    className={`px-2.5 py-1 rounded-full text-xs ${productFilter < 0 ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'}`}
                  >
                    全部产品 ({products.length})
                  </button>
                  {products.map((p) => (
                    <button
                      key={p.index}
                      onClick={() => setProductFilter(p.index)}
                      className="px-2.5 py-1 rounded-full text-xs text-white"
                      style={{ background: colorOf(p.index), opacity: productFilter === p.index || productFilter < 0 ? 1 : 0.4 }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
              {visibleClips.map((clip, ci) => {
                const showHeader = clip.productName && (ci === 0 || visibleClips[ci - 1].productIndex !== clip.productIndex);
                const isSelected = activeClip?.id === clip.id;
                return (
                  <React.Fragment key={clip.id}>
                  {showHeader && (
                    <div className="flex items-center gap-2 pt-2 text-xs font-semibold text-neutral-800">
                      <span className="w-2 h-2 rounded-full" style={{ background: colorOf(clip.productIndex) }} />
                      {clip.productName}
                      <span className="font-normal text-neutral-400">
                        {products.find((p) => p.index === clip.productIndex)?.sellingPoints}
                      </span>
                    </div>
                  )}
                  <div
                    onClick={() => handleSelectClip(clip)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-50/50 shadow-xs ring-1 ring-neutral-900'
                        : 'border-neutral-200/80 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 font-medium text-neutral-700">
                          {clip.tag}
                        </span>
                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          分值 {clip.score}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-neutral-400">
                        {clip.timeRange} ({clip.durationSeconds}s)
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-neutral-900 mb-1.5">
                      {clip.title}
                    </h4>

                    {/* 大模型提炼的钩子金句 */}
                    <div className="p-2.5 rounded-lg bg-neutral-100/70 border border-neutral-200/60 text-xs text-neutral-700 mb-2 font-medium">
                      {clip.caption}
                    </div>

                    {/* 对应的台词摘录 */}
                    {clip.transcriptSnippet && (
                      <p className="text-xs text-neutral-500 line-clamp-2 mb-3 leading-relaxed">
                        台词：{clip.transcriptSnippet}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                      <span className="text-neutral-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {clip.timeRange}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportSingle(clip);
                        }}
                        disabled={isCutting}
                        className="flex items-center gap-1 px-3 py-1 rounded-md bg-neutral-900 hover:bg-black text-white text-xs font-medium transition-all shadow-2xs active:scale-95 disabled:opacity-50"
                      >
                        <Download className="w-3 h-3" />
                        <span>{isCutting ? '裁剪中...' : '物理裁剪导出 (MP4)'}</span>
                      </button>
                    </div>
                  </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* Tab 2: ASR 口播逐字稿与时间戳 */}
          {activeTab === 'transcripts' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200/70 text-xs text-neutral-600 mb-3 leading-relaxed">
                <span className="font-semibold text-neutral-800 block mb-1">
                  DashScope Paraformer 识别全文：
                </span>
                {transcripts.fullText || '暂无识别全文'}
              </div>

              <div className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">
                句级时间戳明细 (点击快速定位跳转)
              </div>

              {transcripts.sentences?.map((sentence, idx) => {
                const isActive = activeSentenceIndex === idx;
                const beginSec = (sentence.begin_time / 1000).toFixed(1);
                const endSec = (sentence.end_time / 1000).toFixed(1);

                return (
                  <div
                    key={sentence.sentence_id || idx}
                    onClick={() => handleSelectSentence(sentence)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-[11px] font-mono font-medium ${
                          isActive ? 'text-neutral-300' : 'text-neutral-400'
                        }`}
                      >
                        {beginSec}s - {endSec}s
                      </span>
                      {isActive && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">
                          正在播放
                        </span>
                      )}
                    </div>
                    <p className={`text-xs leading-relaxed ${isActive ? 'text-white' : 'text-neutral-800'}`}>
                      {sentence.text}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
