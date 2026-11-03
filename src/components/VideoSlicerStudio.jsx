import React, { useState, useRef, useEffect } from 'react';
import {
  Scissors,
  Upload,
  Play,
  Pause,
  Download,
  Flame,
  CheckCircle2,
  Lock,
  ExternalLink,
  Volume2,
  VolumeX,
  Clock,
  Activity,
  Loader2,
  FolderOpen,
  Trash2,
  Terminal,
  X,
  ChevronRight,
  ChevronDown,
  Copy,
  RotateCcw,
  FileText,
  Layers,
  Film
} from 'lucide-react';

const PALETTE = ['#2563eb', '#db2777', '#059669', '#d97706', '#7c3aed', '#0891b2', '#dc2626', '#65a30d'];
const colorOf = (i) => PALETTE[(i ?? 0) % PALETTE.length];

export default function VideoSlicerStudio({ onAddToast }) {
  // 基础数据态
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
    fullText: '欢迎来到团团直播间，今天大家有福了，给家人们带来的是我们的镇店爆款第一种福利...',
    sentences: []
  });

  const [products, setProducts] = useState([]);
  const [clips, setClips] = useState([]);
  const [productFilter, setProductFilter] = useState(-1);
  const [activeClip, setActiveClip] = useState(null);
  const [activeTab, setActiveTab] = useState('clips'); // 'clips' | 'transcripts'

  // 流水线流式加载与安全锁定状态
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPipelineLocked, setIsPipelineLocked] = useState(false);
  const [pipelineProgress, setPipelineProgress] = useState(100);
  const [pipelineStatusText, setPipelineStatusText] = useState('已就绪：自由试看与导出');
  const [pipelineStageBadge, setPipelineStageBadge] = useState('已完成全链路分析');
  const [elapsed, setElapsed] = useState(0);
  const [karaokeText, setKaraokeText] = useState('');

  // 播放器与切片导出控制
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(-1);
  const [isCutting, setIsCutting] = useState(false);
  const [exportingJianyingId, setExportingJianyingId] = useState(null);

  // 抽屉与外部状态
  const [cases, setCases] = useState([]);
  const [casesOpen, setCasesOpen] = useState(false);
  const [traces, setTraces] = useState([]);
  const [tracesOpen, setTracesOpen] = useState(false);
  const [expandedTraceId, setExpandedTraceId] = useState(null);
  const [serverStatus, setServerStatus] = useState({
    status: 'connected',
    serverUrl: 'http://127.0.0.1:8085',
    webuiUrl: 'http://127.0.0.1:8501'
  });

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const cardsContainerRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const eventSourceRef = useRef(null);

  // 初始化加载
  useEffect(() => {
    // 首次拉取已有切片案例
    fetch('http://localhost:3001/api/slicer/upload-and-analyze', { method: 'POST' })
      .then((r) => r.json())
      .then((res) => {
        if (res.code === 0 && res.data) {
          applyAnalysisResult(res.data);
        }
      })
      .catch(() => {});

    loadCases();
    loadTraces();

    fetch('http://localhost:3001/api/slicer/status')
      .then((r) => r.json())
      .then((data) => {
        if (data.code === 0) setServerStatus(data);
      })
      .catch(() => {});

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, []);

  const loadTraces = () => {
    fetch('http://localhost:3001/api/dsh/traces')
      .then((r) => r.json())
      .then((res) => {
        if (res.code === 0 && res.data) {
          setTraces(res.data);
          if (res.data.length > 0 && !expandedTraceId) {
            setExpandedTraceId(res.data[0].traceId);
          }
        }
      })
      .catch(() => {});
  };

  const loadCases = () =>
    fetch('http://localhost:3001/api/slicer/cases')
      .then((r) => r.json())
      .then((res) => res.code === 0 && setCases(res.data))
      .catch(() => {});

  const applyAnalysisResult = (data) => {
    if (data.video) setVideoData(data.video);
    if (data.transcripts) {
      setTranscripts(data.transcripts);
      if (data.transcripts.sentences?.length > 0) {
        setKaraokeText(data.transcripts.sentences[0].text);
      }
    }
    const prods = data.products || [];
    setProducts(prods);
    setProductFilter(-1);
    if (data.clips?.length) {
      setClips(data.clips);
      setActiveClip(data.clips[0]);
    }
    setIsPipelineLocked(false);
    setIsStreaming(false);
    setPipelineProgress(100);
    setPipelineStageBadge('Step 4: 规划完成');
    setPipelineStatusText('全链路切片完成！已自动存入案例库');
  };

  const handleOpenCase = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/api/slicer/cases/${encodeURIComponent(id)}`).then((r) => r.json());
      if (res.code === 0) {
        applyAnalysisResult(res.data);
        setCasesOpen(false);
        onAddToast && onAddToast(`已成功载入案例: ${res.data.video?.fileName || id}`);
      }
    } catch (err) {
      onAddToast && onAddToast(`载入案例失败: ${err.message}`);
    }
  };

  const handleDeleteCase = async (id) => {
    await fetch(`http://localhost:3001/api/slicer/cases/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
    loadCases();
  };

  // 核心：启动流式处理（支持重新演示或上传真实长视频）
  const startStreamingJob = async (file = null) => {
    // 1. 初始化重置
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (eventSourceRef.current) eventSourceRef.current.close();

    setIsStreaming(true);
    setIsPipelineLocked(true);
    setPipelineProgress(5);
    setPipelineStageBadge('Step 1: 探测与抽取音频');
    setPipelineStatusText('正在通过 FFmpeg 提取 16kHz 单声道音频...');
    setProducts([]);
    setClips([]);
    setActiveClip(null);
    setProductFilter(-1);
    setElapsed(0);

    const startedAt = Date.now();
    timerIntervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    const jobId = `job-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    // 2. 建立原生 SSE 长连接监听
    const sse = new EventSource(`http://localhost:3001/api/slicer/stream/${jobId}`);
    eventSourceRef.current = sse;

    sse.addEventListener('progress', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.percent) setPipelineProgress(data.percent);
        if (data.label) setPipelineStatusText(data.label);
      } catch {}
    });

    sse.addEventListener('asr_ready', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.transcripts) {
          setTranscripts(data.transcripts);
          if (data.transcripts.sentences?.length > 0) {
            setKaraokeText(data.transcripts.sentences[0].text);
          }
        }
        setPipelineStageBadge('Step 2: ASR 识别完成');
        if (data.percent) setPipelineProgress(data.percent);
        if (data.label) setPipelineStatusText(data.label);
      } catch {}
    });

    sse.addEventListener('products_ready', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.products) {
          setProducts(data.products);
          setPipelineStageBadge(`Step 3: 划分 ${data.products.length} 个单品区间`);
        }
        if (data.percent) setPipelineProgress(data.percent);
        if (data.label) setPipelineStatusText(data.label);
      } catch {}
    });

    sse.addEventListener('clips_batch', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.clips && data.clips.length > 0) {
          setClips((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const newClips = data.clips.filter((c) => !existingIds.has(c.id));
            return [...prev, ...newClips];
          });
          if (data.clips[0]?.caption) {
            setKaraokeText(data.clips[0].caption);
          }
          if (cardsContainerRef.current) {
            setTimeout(() => {
              cardsContainerRef.current.scrollTop = cardsContainerRef.current.scrollHeight;
            }, 100);
          }
        }
        if (data.percent) setPipelineProgress(data.percent);
        if (data.label) setPipelineStatusText(data.label);
      } catch {}
    });

    sse.addEventListener('complete', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.video) setVideoData(data.video);
        if (data.products) setProducts(data.products);
        if (data.clips) {
          setClips(data.clips);
          setActiveClip(data.clips[0]);
        }
      } catch {}

      // 解冻
      setIsPipelineLocked(false);
      setIsStreaming(false);
      setPipelineProgress(100);
      setPipelineStageBadge('Step 4: 规划完成');
      setPipelineStatusText('全链路切片完成！已自动存入案例库');
      clearInterval(timerIntervalRef.current);
      sse.close();
      eventSourceRef.current = null;
      loadTraces();
      loadCases();
      onAddToast && onAddToast('切片流水线规划完成！卡片已全部解锁，可自由点击试看与下载。');
    });

    sse.onerror = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };

    // 3. 触发后端执行
    try {
      const formData = new FormData();
      formData.append('jobId', jobId);
      if (file) {
        formData.append('video', file);
      }

      const res = await fetch('http://localhost:3001/api/slicer/upload-and-analyze', {
        method: 'POST',
        body: formData
      });
      const json = await res.json();
      // 若此时 SSE 已经断开或未收到 complete，才使用 POST 结果进行保底
      if (!eventSourceRef.current && json.code === 0 && json.data) {
        if (json.data.video) setVideoData(json.data.video);
        if (json.data.transcripts) setTranscripts(json.data.transcripts);
        if (json.data.products) setProducts(json.data.products);
        if (json.data.clips?.length) {
          setClips(json.data.clips);
          setActiveClip(json.data.clips[0]);
        }
        setIsPipelineLocked(false);
        setIsStreaming(false);
        setPipelineProgress(100);
        setPipelineStageBadge('Step 4: 规划完成');
        setPipelineStatusText('全链路切片完成！已自动存入案例库');
        clearInterval(timerIntervalRef.current);
        loadTraces();
        loadCases();
      }
    } catch (err) {
      console.warn('流式分析异常或已由 SSE 消费:', err);
      if (isStreaming && !eventSourceRef.current) {
        setIsPipelineLocked(false);
        setIsStreaming(false);
        clearInterval(timerIntervalRef.current);
      }
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 点击卡片安全防打断处理
  const handleCardClick = (clip) => {
    if (isPipelineLocked) {
      onAddToast && onAddToast('切片流水线处理中，暂时冻结交互以避免打断任务...');
      return;
    }
    setActiveClip(clip);
    if (videoRef.current) {
      videoRef.current.currentTime = clip.startSeconds;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // 播放器时间更新
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);

    const currMs = curr * 1000;
    const activeIdx = transcripts.sentences?.findIndex(
      (s) => currMs >= s.begin_time && currMs <= s.end_time
    );
    if (activeIdx !== undefined && activeIdx !== -1) {
      setActiveSentenceIndex(activeIdx);
      setKaraokeText(transcripts.sentences[activeIdx].text);
    }

    if (activeClip && curr >= activeClip.endSeconds) {
      videoRef.current.currentTime = activeClip.startSeconds;
    }
  };

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

  // 物理单条导出
  const handleExportSingle = async (clip) => {
    if (isPipelineLocked) return;
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
        const blobRes = await fetch(json.data.downloadUrl);
        const blob = await blobRes.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${clip.title}_${clip.timeRange.replace(/\s+/g, '')}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
        onAddToast && onAddToast(`切片导出成功，已自动下载真实 MP4 (${(json.data.sizeBytes / 1024 / 1024).toFixed(2)} MB)`);
      } else {
        throw new Error(json.error || '切片失败');
      }
    } catch (err) {
      onAddToast && onAddToast(`切片导出失败: ${err.message}`);
    } finally {
      setIsCutting(false);
    }
  };

  // 物理批量导出
  const handleExportAll = async () => {
    if (isPipelineLocked) return;
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
        onAddToast && onAddToast(`已通过后端 FFmpeg 裁剪出全部 ${json.data.clips.length} 条带货 MP4 切片并开始下载`);
      } else {
        throw new Error(json.error || '批量导出失败');
      }
    } catch (err) {
      onAddToast && onAddToast(`批量切片失败: ${err.message}`);
    } finally {
      setIsCutting(false);
    }
  };

  // 9. 导出剪映原生工程 (走 DSH 微内核 jianying 服务)
  const handleExportJianying = async (targetClips, customDraftName) => {
    if (isPipelineLocked) return;
    const isBatch = targetClips.length > 1;
    setExportingJianyingId(isBatch ? 'all' : targetClips[0]?.id);
    try {
      const draftName =
        customDraftName ||
        (isBatch
          ? `剪映全套_${videoData.fileName.replace(/\.mp4$/i, '')}_${targetClips.length}段高光`
          : `剪映_${targetClips[0]?.productName || '单品'}_${targetClips[0]?.tag}_${targetClips[0]?.timeRange?.replace(/\s+/g, '')}`);

      const res = await fetch('http://localhost:3001/api/slicer/export-jianying', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: videoData.id,
          draftName,
          clips: targetClips,
          sentences: transcripts.sentences || [],
          width: videoData.width,
          height: videoData.height,
          openApp: true
        })
      });
      const json = await res.json();
      if (json.code === 0 && json.data) {
        loadTraces();

        // 尝试通过浏览器原生协议辅助唤起
        try {
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = 'videocut://';
          document.body.appendChild(iframe);
          setTimeout(() => iframe.remove(), 1000);
        } catch {
          // ignore
        }

        const msg = json.data.appLaunched
          ? `已成功导出工程【${json.data.draftName}】并为您唤起剪映！在剪映草稿箱双击首项即可编辑。`
          : `已成功导出剪映工程【${json.data.draftName}】！打开剪映App草稿箱首位即可直接精剪。`;

        onAddToast && onAddToast(msg);
      } else {
        throw new Error(json.error || '导出剪映失败');
      }
    } catch (err) {
      onAddToast && onAddToast(`导出剪映失败: ${err.message}`);
    } finally {
      setExportingJianyingId(null);
    }
  };

  const visibleClips = productFilter < 0 ? clips : clips.filter((c) => c.productIndex === productFilter);

  return (
    <div className="relative flex-1 flex flex-col h-full bg-[#f8f9fb] text-neutral-800 antialiased overflow-hidden select-none">
      {/* 顶部流光细进度条 */}
      <div className="h-0.5 w-full bg-neutral-100 overflow-hidden relative shrink-0">
        <div
          className={`h-full transition-all duration-500 ${isStreaming ? 'bg-blue-600' : 'bg-emerald-600'}`}
          style={{ width: `${pipelineProgress}%` }}
        />
        {isStreaming && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-full animate-shimmer" />
        )}
      </div>

      {/* 顶部导航与控制器 */}
      <header className="h-16 border-b border-neutral-200 bg-white/95 backdrop-blur px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 tracking-tight">
            <Scissors className="w-5 h-5 text-neutral-900" />
            <span>智能切片流水线</span>
          </div>

          <div className="h-4 w-px bg-neutral-200 mx-1" />

          {/* 核心流光进度胶囊 (Progress Pill) */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
              isStreaming
                ? 'bg-blue-50 border border-blue-200/80 text-blue-900 shadow-2xs'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isStreaming ? 'bg-blue-600 animate-ping' : 'bg-emerald-600'
              }`}
            />
            <span className="font-sans">{pipelineStatusText}</span>
            {isStreaming && (
              <span className="font-mono text-blue-600/80 text-[11px]">({elapsed}s)</span>
            )}
            {!isStreaming && elapsed > 0 && (
              <span className="font-mono text-emerald-700 text-[11px]">(用时 {elapsed}s)</span>
            )}
          </div>
        </div>

        {/* 顶部右侧控制器 */}
        <div className="flex items-center gap-3">
          {/* DSH Trace 抽屉按钮 */}
          <button
            onClick={() => {
              setTracesOpen(!tracesOpen);
              loadTraces();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs text-neutral-600 hover:text-neutral-900 hover:border-neutral-300 transition-colors bg-white shadow-2xs"
            title="查看 DeepSeek Harness (DSH) 底层大模型调用 Trace 链"
          >
            <Terminal className="w-3.5 h-3.5 text-blue-600" />
            <span>DSH Trace ({traces.length})</span>
          </button>

          {/* 案例库下拉 */}
          <div className="relative">
            <button
              onClick={() => {
                setCasesOpen(!casesOpen);
                loadCases();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs text-neutral-600 hover:text-neutral-900 hover:border-neutral-300 transition-colors bg-white shadow-2xs"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>案例库 ({cases.length})</span>
            </button>
            {casesOpen && (
              <div className="absolute right-0 top-full mt-2 w-[340px] max-h-[380px] overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-xl z-40 p-2">
                {cases.length === 0 && (
                  <div className="p-4 text-xs text-neutral-400 text-center">暂无案例，导入视频分析后会自动保存</div>
                )}
                {cases.map((cs) => (
                  <div
                    key={cs.id}
                    onClick={() => handleOpenCase(cs.id)}
                    className={`group flex items-start justify-between gap-2 p-3 rounded-lg cursor-pointer hover:bg-neutral-50 ${
                      videoData.id === cs.id ? 'bg-neutral-50 ring-1 ring-neutral-200' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-neutral-900 truncate">{cs.name}</div>
                      <div className="mt-1 text-[11px] text-neutral-400">
                        {cs.product_count} 个产品 / {cs.clip_count} 条切片 / {Math.floor(cs.duration / 60)}分{cs.duration % 60}秒
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCase(cs.id);
                      }}
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs text-neutral-600 hover:text-neutral-900 hover:border-neutral-300 transition-colors bg-white shadow-2xs"
            title="在新标签页打开 MoneyPrinterTurbo 专属可视化剪辑工作台"
          >
            <span>工作台 WebUI</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* 导入长视频文件上传 */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) startStreamingJob(file);
            }}
            accept="video/*"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isStreaming}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>导入长视频/回放</span>
          </button>

          {/* 重新演示流式模拟处理 */}
          <button
            onClick={() => startStreamingJob(null)}
            disabled={isStreaming}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-medium transition shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isStreaming ? 'animate-spin' : ''}`} />
            <span>{isStreaming ? '正在流式处理...' : '重新演示流式处理'}</span>
          </button>
        </div>
      </header>

      {/* 主体工作台区域 */}
      <main className="flex-1 flex overflow-hidden p-6 gap-6 max-w-[1600px] w-full mx-auto">
        {/* 左侧：长视频预览与渐进式时空轨道 */}
        <section className="flex-1 flex flex-col bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6 overflow-hidden">
          {/* 视频信息栏 */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 font-mono">
                  {videoData.width}x{videoData.height}
                </span>
                <h2 className="text-sm font-semibold text-neutral-900 truncate max-w-xl">
                  {videoData.fileName}
                </h2>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                视频总时长: {videoData.durationFormatted} · {products.length > 0 ? `包含 ${products.length} 个带货单品` : '正在解析带货单品...'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/60 font-medium">
                {pipelineStageBadge}
              </span>
            </div>
          </div>

          {/* 视频播放视窗与卡拉OK实时字幕浮层 */}
          <div className="relative w-full aspect-video bg-neutral-950 rounded-xl overflow-hidden flex flex-col items-center justify-center border border-neutral-800 text-white select-none group">
            <video
              ref={videoRef}
              src={videoData.videoUrl}
              onTimeUpdate={handleTimeUpdate}
              muted={isMuted}
              playsInline
              className="w-full h-full object-contain"
              onClick={handleTogglePlay}
            />

            {/* 画面中心状态提示 (未播放时显示) */}
            {!isPlaying && (
              <div
                onClick={handleTogglePlay}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xs cursor-pointer"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur mb-3 transition-transform active:scale-95">
                  <Play className="w-6 h-6 text-white ml-0.5" />
                </div>
                <p className="text-sm font-medium text-neutral-200">
                  {isStreaming ? '正在实时监听分析流水线...' : '点击播放当前切片'}
                </p>
              </div>
            )}

            {/* 卡拉OK实时口播台词浮层 */}
            {karaokeText && (
              <div className="absolute bottom-14 left-6 right-6 flex justify-center pointer-events-none z-10">
                <div className="max-w-xl px-4 py-2 rounded-xl bg-black/80 backdrop-blur text-white text-xs font-medium text-center shadow-lg border border-white/10">
                  <span className="text-neutral-400 mr-2 font-mono">当前口播:</span>
                  <span>{karaokeText}</span>
                </div>
              </div>
            )}

            {/* 画面内播放控制器 */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between px-4 py-2 rounded-xl bg-black/60 backdrop-blur border border-white/10 text-white opacity-80 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-3">
                <button onClick={handleTogglePlay} className="p-1 rounded hover:bg-white/20 transition-colors">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsMuted(!isMuted)} className="p-1 rounded hover:bg-white/20 transition-colors">
                  {isMuted ? <VolumeX className="w-4 h-4 text-neutral-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>
                <span className="text-xs font-mono text-neutral-300">
                  {Math.floor(currentTime / 60).toString().padStart(2, '0')}:
                  {Math.floor(currentTime % 60).toString().padStart(2, '0')} / {videoData.durationFormatted}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {activeClip?.tag || (isStreaming ? '流水线解析中' : '切片试看就绪')}
                </span>
              </div>
            </div>
          </div>

          {/* 渐进式多产品与切片时间轴轨 */}
          <div className="mt-6 p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="font-medium text-neutral-700 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-neutral-500" />
                多产品时空热度分布轨
              </span>
              <span className="text-neutral-400 text-[11px]">
                {products.length > 0 ? `已划分 ${products.length} 个商品区间` : '等待识别商品'}
              </span>
            </div>

            {/* 轨 1: 产品分段色带 (阶段 1 实时挂载) */}
            <div className="relative h-6 bg-neutral-200/70 rounded-md overflow-hidden mb-2 border border-neutral-300/40">
              {products.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-[11px] text-neutral-400 italic">
                  等待第一阶段产品识别分段...
                </div>
              ) : (
                <div className="absolute inset-0">
                  {products.map((p) => (
                    <button
                      key={p.index}
                      onClick={() => setProductFilter(productFilter === p.index ? -1 : p.index)}
                      className="absolute top-0 bottom-0 text-[11px] text-white font-medium truncate px-2 flex items-center transition-all duration-300 hover:brightness-110"
                      style={{
                        left: `${p.startPct}%`,
                        width: `${p.widthPct}%`,
                        backgroundColor: colorOf(p.index),
                        opacity: productFilter < 0 || productFilter === p.index ? 1 : 0.35
                      }}
                      title={`${p.name} (${p.sellingPoints})`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 轨 2: 细分环节切片色块 (阶段 2 实时挂载) */}
            <div className="relative h-8 bg-neutral-100 rounded-md overflow-hidden border border-neutral-200 flex items-center">
              {clips.length === 0 ? (
                <div className="w-full text-center text-[11px] text-neutral-400 italic">
                  等待第二阶段逐产品切片规划...
                </div>
              ) : (
                <div className="absolute inset-0">
                  {visibleClips.map((clip) => {
                    const isSelected = activeClip?.id === clip.id;
                    return (
                      <div
                        key={clip.id}
                        onClick={() => handleCardClick(clip)}
                        className={`absolute top-1 bottom-1 rounded text-[10px] text-neutral-800 bg-white/90 border font-mono flex items-center justify-center overflow-hidden fade-in-up cursor-pointer transition-all ${
                          isSelected ? 'border-neutral-900 bg-neutral-900 text-white font-bold' : 'border-neutral-300 hover:border-neutral-500'
                        }`}
                        style={{
                          left: `${clip.startPct}%`,
                          width: `${clip.widthPct}%`
                        }}
                        title={`${clip.productName || ''} · ${clip.tag} (${clip.timeRange})`}
                      >
                        {clip.tag}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 商品筛选快速胶囊 */}
            {products.length > 0 && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-neutral-400">商品筛选:</span>
                <button
                  onClick={() => setProductFilter(-1)}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium transition ${
                    productFilter === -1 ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  全部 ({clips.length})
                </button>
                {products.map((p) => {
                  const pClipsCount = clips.filter((c) => c.productIndex === p.index).length;
                  const isSel = productFilter === p.index;
                  return (
                    <button
                      key={p.index}
                      onClick={() => setProductFilter(isSel ? -1 : p.index)}
                      className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition ${
                        isSel ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorOf(p.index) }} />
                      <span>{p.name}</span>
                      <span className="text-[10px] opacity-70 font-mono">({pClipsCount})</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* 右侧：渐进式生成列表与安全冻结展示区 */}
        <aside className="w-[460px] flex flex-col bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden shrink-0">
          {/* 列表标题栏 */}
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">实时产出切片卡片</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-200/70 text-neutral-700 font-semibold">
                {visibleClips.length} 条
              </span>
            </div>

            {/* 安全锁定状态标签 */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                isPipelineLocked
                  ? 'bg-amber-50 border border-amber-200 text-amber-800'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              }`}
            >
              {isPipelineLocked ? (
                <>
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span>安全冻结：处理中禁止操作</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>已解锁：自由试看与导出</span>
                </>
              )}
            </div>
          </div>

          {/* 选项卡切换: 切片列表 / ASR 逐字稿 */}
          <div className="flex border-b border-neutral-200 bg-white px-4 text-xs font-medium">
            <button
              onClick={() => setActiveTab('clips')}
              className={`flex items-center gap-1.5 py-2.5 border-b-2 mr-4 transition-colors ${
                activeTab === 'clips' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400 hover:text-neutral-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>切片列表 ({visibleClips.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('transcripts')}
              className={`flex items-center gap-1.5 py-2.5 border-b-2 transition-colors ${
                activeTab === 'transcripts' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400 hover:text-neutral-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>ASR 逐字稿 ({transcripts.sentences?.length || 0})</span>
            </button>
          </div>

          {/* 实时流式切片容器 */}
          {activeTab === 'clips' && (
            <div ref={cardsContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 relative">
              {clips.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-400">
                  <div className="w-10 h-10 rounded-full border-2 border-neutral-200 border-t-blue-600 animate-spin mb-3" />
                  <p className="text-xs font-medium text-neutral-600">正在与后台 AI 流水线建立连接</p>
                  <p className="text-[11px] text-neutral-400 mt-1">处理完毕的片段将实时在此处逐步浮现</p>
                </div>
              ) : (
                visibleClips.map((clip, ci) => {
                  const isSelected = activeClip?.id === clip.id;
                  const showHeader =
                    clip.productName &&
                    (ci === 0 || visibleClips[ci - 1].productIndex !== clip.productIndex);

                  return (
                    <React.Fragment key={clip.id || ci}>
                      {showHeader && (
                        <div className="flex items-center gap-2 pt-1 text-xs font-semibold text-neutral-800">
                          <span className="w-2 h-2 rounded-full" style={{ background: colorOf(clip.productIndex) }} />
                          <span>{clip.productName}</span>
                          <span className="font-normal text-neutral-400 text-[11px]">
                            {products.find((p) => p.index === clip.productIndex)?.sellingPoints}
                          </span>
                        </div>
                      )}

                      <div
                        onClick={() => handleCardClick(clip)}
                        className={`clip-card fade-in-up p-3.5 rounded-xl border bg-white shadow-2xs relative overflow-hidden transition-all duration-300 cursor-pointer ${
                          isPipelineLocked
                            ? 'pulse-card border-blue-300'
                            : isSelected
                            ? 'border-neutral-900 ring-1 ring-neutral-900 bg-neutral-50/50'
                            : 'border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        {/* 冻结只读遮罩指示 */}
                        {isPipelineLocked && (
                          <div className="card-lock-badge absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] text-blue-700 font-medium">
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            <span>规划中 (只读)</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ background: colorOf(clip.productIndex) }} />
                          <span className="text-xs font-semibold text-neutral-900">{clip.productName || '单品'}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 font-medium text-neutral-700">
                            {clip.tag}
                          </span>
                          <span className="text-xs font-mono text-emerald-600 font-semibold ml-auto">
                            分值 {clip.score}
                          </span>
                        </div>

                        {/* 钩子金句气泡 */}
                        <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-200/60 text-xs font-medium text-neutral-800 mb-2">
                          {clip.caption}
                        </div>

                        {/* 台词摘录 */}
                        {clip.transcriptSnippet && (
                          <p className="text-[11px] text-neutral-500 line-clamp-1 mb-2.5 leading-relaxed">
                            台词：{clip.transcriptSnippet}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-[11px] text-neutral-400">
                          <span className="font-mono">
                            {clip.timeRange} ({clip.durationSeconds}s)
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              disabled={isPipelineLocked || exportingJianyingId === clip.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExportJianying([clip]);
                              }}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                                isPipelineLocked || exportingJianyingId === clip.id
                                  ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer active:scale-95'
                              }`}
                              title="一键将该片段与字幕打包存入剪映草稿箱"
                            >
                              <Film className="w-3 h-3 text-blue-600" />
                              <span>{exportingJianyingId === clip.id ? '写入中...' : '导入剪映'}</span>
                            </button>

                            <button
                              disabled={isPipelineLocked || isCutting}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExportSingle(clip);
                              }}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                                isPipelineLocked || isCutting
                                  ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                                  : 'bg-neutral-900 hover:bg-black text-white cursor-pointer active:scale-95'
                              }`}
                            >
                              <Download className="w-3 h-3" />
                              <span>{isPipelineLocked ? '处理中...' : isCutting ? '裁剪中...' : '导出 MP4'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
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
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = sentence.begin_time / 1000;
                        videoRef.current.play().catch(() => {});
                        setIsPlaying(true);
                      }
                    }}
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

          {/* 底部批量导出栏 */}
          <div className="p-4 border-t border-neutral-200 bg-neutral-50/70 flex items-center justify-between">
            <div className="text-xs text-neutral-500">
              <span>
                {isPipelineLocked
                  ? '等待所有产品切片生成完成...'
                  : `全部 ${products.length} 个商品切片已准备完毕`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btnBatchExportJianying"
                disabled={isPipelineLocked || exportingJianyingId === 'all' || visibleClips.length === 0}
                onClick={() => handleExportJianying(visibleClips)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition shadow-2xs ${
                  isPipelineLocked || exportingJianyingId === 'all' || visibleClips.length === 0
                    ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-95 shadow-sm'
                }`}
                title="将当前全部高光切片打包为一个剪映多轨时间轴工程"
              >
                <Film className="w-3.5 h-3.5" />
                <span>
                  {exportingJianyingId === 'all'
                    ? '写入剪映中...'
                    : `导出剪映工程 (${visibleClips.length}段)`}
                </span>
              </button>

              <button
                id="btnBatchExport"
                disabled={isPipelineLocked || isCutting || visibleClips.length === 0}
                onClick={handleExportAll}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition shadow-2xs ${
                  isPipelineLocked || isCutting || visibleClips.length === 0
                    ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    : 'bg-neutral-900 hover:bg-black text-white cursor-pointer active:scale-95 shadow-sm'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>
                  {isPipelineLocked
                    ? '流水线锁定中'
                    : isCutting
                    ? '正在裁剪...'
                    : `批量下载 MP4`}
                </span>
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* DSH 全局调用 Trace 追踪抽屉 */}
      {tracesOpen && (
        <div className="fixed inset-y-0 right-0 w-[520px] bg-white border-l border-neutral-200 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
          <div className="h-14 border-b border-neutral-200 px-5 flex items-center justify-between bg-neutral-50/70 shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-neutral-900">DeepSeek Harness · AI Trace 追踪</h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-mono">
                {traces.length} 条记录
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadTraces}
                className="px-2 py-1 rounded text-xs text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200/60"
              >
                刷新
              </button>
              <button
                onClick={() => setTracesOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-800 hover:bg-neutral-200/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fafafa]">
            {traces.length === 0 ? (
              <div className="py-16 text-center text-xs text-neutral-400">
                暂无 DSH Trace 记录，导入视频或执行分析后将实时记录每一笔 LLM 输入与输出。
              </div>
            ) : (
              traces.map((tr) => {
                const isExpanded = expandedTraceId === tr.traceId;
                const sec = (tr.latencyMs / 1000).toFixed(2);
                return (
                  <div
                    key={tr.traceId}
                    className="border border-neutral-200 rounded-xl bg-white shadow-2xs overflow-hidden transition-all text-xs"
                  >
                    <div
                      onClick={() => setExpandedTraceId(isExpanded ? null : tr.traceId)}
                      className="p-3.5 flex items-start justify-between gap-3 cursor-pointer hover:bg-neutral-50/80"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${tr.status === 'success' ? 'bg-emerald-500' : tr.status === 'retry' ? 'bg-amber-500' : 'bg-red-500'}`} />
                          <span className="font-semibold text-neutral-900 font-mono">{tr.action}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 font-mono">
                            {tr.model}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-neutral-400 truncate">
                          {tr.traceId} · {new Date(tr.createdAt).toLocaleTimeString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-neutral-500 text-[11px]">{sec}s</span>
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-neutral-400" /> : <ChevronRight className="w-4 h-4 text-neutral-400" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-neutral-100 p-3.5 bg-neutral-50/50 space-y-3 font-mono text-[11px]">
                        <div>
                          <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>Messages (Prompt)</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(tr.messages, null, 2));
                                onAddToast && onAddToast('已复制 Prompt');
                              }}
                              className="text-neutral-400 hover:text-neutral-700 flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" />
                              <span>复制</span>
                            </button>
                          </div>
                          <div className="max-h-48 overflow-y-auto p-2.5 rounded bg-neutral-900 text-neutral-200 whitespace-pre-wrap leading-relaxed text-[11px]">
                            {tr.messages?.map((m, mi) => (
                              <div key={mi} className="mb-2">
                                <span className="text-blue-400 font-bold">[{m.role.toUpperCase()}]: </span>
                                <span>{m.content}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>Raw Model Output</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(tr.rawOutput || '');
                                onAddToast && onAddToast('已复制输出内容');
                              }}
                              className="text-neutral-400 hover:text-neutral-700 flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" />
                              <span>复制</span>
                            </button>
                          </div>
                          <div className="max-h-40 overflow-y-auto p-2.5 rounded bg-neutral-900 text-emerald-400 whitespace-pre-wrap leading-relaxed text-[11px]">
                            {tr.rawOutput || '无原始文本'}
                          </div>
                        </div>

                        {tr.error && (
                          <div className="p-2 rounded bg-red-50 border border-red-200 text-red-700 text-[11px]">
                            错误: {tr.error}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
