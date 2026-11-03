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
  Film,
  List,
  LayoutGrid
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
  const [viewMode, setViewMode] = useState('compact'); // 'compact' 紧凑行模式 | 'detail' 详细卡片模式
  const [collapsedProducts, setCollapsedProducts] = useState({}); // { [productIndex]: boolean }

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
          ? `已成功导出工程【${json.data.draftName}】并为您唤起剪映！若剪映此前已打开，请在剪映中切换一下左侧标签刷新草稿列表，双击首项即可编辑。`
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

  // 按商品分组聚合切片，支持折叠手风琴与紧凑管理
  const groupedClips = React.useMemo(() => {
    const groups = [];
    const map = new Map();
    visibleClips.forEach((clip) => {
      const pIdx = clip.productIndex ?? -1;
      if (!map.has(pIdx)) {
        const prod = products.find((p) => p.index === pIdx);
        const group = {
          productIndex: pIdx,
          productName: clip.productName || prod?.name || '通用切片',
          sellingPoints: prod?.sellingPoints || '',
          clips: []
        };
        map.set(pIdx, group);
        groups.push(group);
      }
      map.get(pIdx).clips.push(clip);
    });
    return groups;
  }, [visibleClips, products]);

  const toggleProductCollapse = (pIdx) => {
    setCollapsedProducts((prev) => ({
      ...prev,
      [pIdx]: !prev[pIdx]
    }));
  };

  const toggleAllCollapse = () => {
    const anyExpanded = groupedClips.some((g) => !collapsedProducts[g.productIndex]);
    const next = {};
    groupedClips.forEach((g) => {
      next[g.productIndex] = anyExpanded;
    });
    setCollapsedProducts(next);
  };

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

      {/* 主体工作台区域：上下专业布局 + 水平自适应伸缩 */}
      <main className="flex-1 flex flex-col overflow-hidden p-4 lg:p-5 gap-4 max-w-[1900px] w-full mx-auto select-none">
        {/* 上半部分：紧凑监看控制台 (左侧视窗 + 右侧时空热度时序中枢) */}
        <section className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-4 shrink-0 flex flex-col lg:flex-row gap-5 items-stretch">
          {/* 左侧：视频监视视窗 (放大至 560px~680px，正下方配备独立时间戳与播放控制条) */}
          <div className="w-full lg:w-[540px] xl:w-[600px] 2xl:w-[660px] shrink-0 flex flex-col gap-2.5">
            <div className="relative w-full aspect-video bg-neutral-950 rounded-xl overflow-hidden flex flex-col items-center justify-center border border-neutral-800 text-white select-none group shadow-inner">
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
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur mb-2 transition-transform active:scale-95">
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </div>
                  <p className="text-xs font-medium text-neutral-200">
                    {isStreaming ? '正在实时分析流水线...' : '点击播放当前高光切片'}
                  </p>
                </div>
              )}

              {/* 卡拉OK实时口播台词浮层 (悬浮于画面底部) */}
              {karaokeText && (
                <div className="absolute bottom-3 left-4 right-4 flex justify-center pointer-events-none z-10">
                  <div className="max-w-lg px-3.5 py-1.5 rounded-lg bg-black/85 backdrop-blur text-white text-xs font-medium text-center shadow-lg border border-white/10 truncate">
                    <span className="text-neutral-400 mr-1.5 font-mono">当前口播:</span>
                    <span>{karaokeText}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 独立放置在视频窗口正下方的时间戳与时空热度时序控制条 */}
            <div className="flex flex-col gap-2 px-3.5 py-2.5 rounded-xl bg-neutral-900 text-white shadow-xs">
              {/* 多产品时空热度分段时序轨 (嵌入时间戳进度条中，纯净无亮块，上方以利落倒三角箭头指示当前位置) */}
              <div
                className="relative pt-2 pb-0.5 w-full cursor-pointer group/timeline select-none"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  if (videoRef.current && videoData.duration) {
                    const target = pct * videoData.duration;
                    videoRef.current.currentTime = target;
                    setCurrentTime(target);
                  }
                }}
                title="时空热度时序轨：点击跳转播放"
              >
                {/* 倒三角箭头指示器 ▼ (直观指示当前播放/切片位置) */}
                <div
                  className="absolute top-0 -ml-[5px] z-30 pointer-events-none transition-all duration-75 flex flex-col items-center"
                  style={{
                    left: `${videoData.duration ? (currentTime / videoData.duration) * 100 : 0}%`
                  }}
                >
                  <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-white drop-shadow-md" />
                </div>

                {/* 纯净多产品分段色带 (无任何亮块遮挡，纯净通透) */}
                <div className="relative h-2.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                  {products.length === 0 ? (
                    <div className="absolute inset-0 bg-neutral-700/60" />
                  ) : (
                    products.map((p) => (
                      <div
                        key={p.index}
                        className="absolute top-0 bottom-0 transition-opacity hover:brightness-125"
                        style={{
                          left: `${p.startPct}%`,
                          width: `${p.widthPct}%`,
                          backgroundColor: colorOf(p.index),
                          opacity: productFilter < 0 || productFilter === p.index ? 0.9 : 0.3
                        }}
                        title={`单品：${p.name} (${p.sellingPoints || '热卖中'})`}
                      />
                    ))
                  )}

                  {/* 垂直白细游标贯穿色带内部 */}
                  <div
                    className="absolute top-0 bottom-0 bg-white w-[1.5px] -ml-[0.75px] z-20 pointer-events-none"
                    style={{
                      left: `${videoData.duration ? (currentTime / videoData.duration) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              {/* 控制按钮与时间戳详细信息 */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleTogglePlay}
                    className="p-1 rounded hover:bg-white/20 transition-colors cursor-pointer text-white"
                    title={isPlaying ? '暂停' : '播放'}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1 rounded hover:bg-white/20 transition-colors cursor-pointer text-white"
                    title={isMuted ? '开启声音' : '静音'}
                  >
                    {isMuted ? (
                      <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </button>

                  {/* 核心时间戳：当前播放时间 / 视频总时长 */}
                  <div className="flex items-center gap-1 font-mono text-[11px] text-neutral-300 ml-1">
                    <span className="text-white font-semibold">
                      {Math.floor(currentTime / 60).toString().padStart(2, '0')}:
                      {Math.floor(currentTime % 60).toString().padStart(2, '0')}
                    </span>
                    <span className="text-neutral-500">/</span>
                    <span className="text-neutral-400">{videoData.durationFormatted}</span>
                  </div>
                </div>

                {/* 当前选中的切片高光区间时间戳与标签 */}
                <div className="flex items-center gap-2 text-[11px]">
                  {activeClip ? (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                      <Clock className="w-3 h-3 text-blue-400" />
                      <span>切片区间: {activeClip.timeRange} ({activeClip.durationSeconds}s)</span>
                    </span>
                  ) : (
                    <span className="text-neutral-400 font-mono text-[10px]">
                      {isStreaming ? '流水线解析中...' : '点击进度条或下方切片可直接试看'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：流水线中枢与单品筛选控制台 (精简纯净) */}
          <div className="flex-1 flex flex-col justify-between min-w-0 gap-3 py-1">
            {/* 顶栏：视频信息与阶段锁定状态 */}
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 font-mono shrink-0">
                    {videoData.width}x{videoData.height}
                  </span>
                  <h2 className="text-sm font-semibold text-neutral-900 truncate" title={videoData.fileName}>
                    {videoData.fileName}
                  </h2>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  总时长: {videoData.durationFormatted} · {products.length > 0 ? `已识别 ${products.length} 个带货单品 · 规划 ${clips.length} 条黄金切片` : '正在解析带货单品...'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/60 font-medium">
                  {pipelineStageBadge}
                </span>

                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    isPipelineLocked
                      ? 'bg-amber-50 border border-amber-200 text-amber-800'
                      : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  }`}
                >
                  {isPipelineLocked ? (
                    <>
                      <Lock className="w-3 h-3 text-amber-600" />
                      <span>流水线处理中 (防打断锁定)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>已就绪：自由试看与导出</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 中部：商品筛选快速胶囊 (带色标与切片统计) */}
            <div className="p-3.5 rounded-xl bg-neutral-50/80 border border-neutral-200/70">
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="font-semibold text-neutral-700 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-neutral-500" />
                  带货单品快速筛选
                </span>
                <span className="text-neutral-400 text-[11px]">
                  点击下方胶囊可单独过滤商品矩阵
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setProductFilter(-1)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                    productFilter === -1
                      ? 'bg-neutral-900 text-white shadow-2xs'
                      : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  全部单品 ({clips.length})
                </button>
                {products.map((p) => {
                  const pCount = clips.filter((c) => c.productIndex === p.index).length;
                  const isSel = productFilter === p.index;
                  return (
                    <button
                      key={p.index}
                      onClick={() => setProductFilter(isSel ? -1 : p.index)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                        isSel
                          ? 'bg-neutral-900 text-white shadow-2xs'
                          : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                      }`}
                      title={p.sellingPoints}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorOf(p.index) }} />
                      <span className="font-semibold">{p.name}</span>
                      <span className="text-[10px] opacity-70 font-mono">({pCount}段)</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 底栏：一键导出剪映与批量下载核心操作条 */}
            <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
              <div className="text-xs text-neutral-400">
                <span>
                  {isPipelineLocked
                    ? '流水线锁定中，完毕后即可一键导出...'
                    : `当前就绪 ${visibleClips.length} 段高光切片，可随时一键生成工程`}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  id="btnBatchExportJianying"
                  disabled={isPipelineLocked || exportingJianyingId === 'all' || visibleClips.length === 0}
                  onClick={() => handleExportJianying(visibleClips)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition shadow-2xs cursor-pointer active:scale-95 ${
                    isPipelineLocked || exportingJianyingId === 'all' || visibleClips.length === 0
                      ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                  }`}
                  title="将当前全部切片打包为一个剪映多轨时间轴工程并自动置顶唤起剪映"
                >
                  <Film className="w-4 h-4" />
                  <span>
                    {exportingJianyingId === 'all'
                      ? '写入剪映中...'
                      : `一键导出剪映工程 (${visibleClips.length}段)`}
                  </span>
                </button>

                <button
                  id="btnBatchExport"
                  disabled={isPipelineLocked || isCutting || visibleClips.length === 0}
                  onClick={handleExportAll}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition shadow-2xs cursor-pointer active:scale-95 ${
                    isPipelineLocked || isCutting || visibleClips.length === 0
                      ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                      : 'bg-neutral-900 hover:bg-black text-white shadow-sm'
                  }`}
                  title="调用本地 FFmpeg 物理分割生成独立 MP4 短视频"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isPipelineLocked
                      ? '处理中'
                      : isCutting
                      ? '正在裁剪...'
                      : `批量下载 MP4 (${visibleClips.length})`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 下半部分：切片资产看板与矩阵池 (自动水平伸缩多列网格) */}
        <section className="flex-1 flex flex-col bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden min-h-0">
          {/* 下半部分顶部导航与视图控制器 */}
          <div className="px-5 py-2.5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70 shrink-0">
            {/* 左侧：Tab 切换 (切片矩阵 vs ASR 逐字稿) */}
            <div className="flex items-center gap-4 text-xs font-medium">
              <button
                onClick={() => setActiveTab('clips')}
                className={`flex items-center gap-1.5 py-1.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'clips'
                    ? 'border-neutral-900 text-neutral-900 font-bold'
                    : 'border-transparent text-neutral-400 hover:text-neutral-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>切片矩阵池 ({visibleClips.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('transcripts')}
                className={`flex items-center gap-1.5 py-1.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'transcripts'
                    ? 'border-neutral-900 text-neutral-900 font-bold'
                    : 'border-transparent text-neutral-400 hover:text-neutral-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>ASR 逐字稿 ({transcripts.sentences?.length || 0} 句)</span>
              </button>
            </div>

            {/* 右侧：水平伸缩模式切换 & 一键折叠 */}
            {activeTab === 'clips' && (
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleAllCollapse}
                  className="px-2.5 py-1 rounded text-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70 transition font-medium cursor-pointer"
                  title="展开或折叠全部商品分组"
                >
                  {groupedClips.some((g) => !collapsedProducts[g.productIndex]) ? '全部折叠' : '全部展开'}
                </button>

                <div className="h-3.5 w-px bg-neutral-200" />

                <div className="flex items-center bg-neutral-200/70 p-0.5 rounded-md">
                  <button
                    onClick={() => setViewMode('compact')}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition cursor-pointer ${
                      viewMode === 'compact'
                        ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                    title="紧凑胶囊网格 (高密度水平排列)"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>紧凑矩阵</span>
                  </button>
                  <button
                    onClick={() => setViewMode('detail')}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition cursor-pointer ${
                      viewMode === 'detail'
                        ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                    title="详细卡片网格 (包含金句与台词摘录)"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>详细卡片</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 切片矩阵滚动容器 (水平自适应多列 Grid) */}
          {activeTab === 'clips' && (
            <div ref={cardsContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {clips.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 text-neutral-400">
                  <div className="w-10 h-10 rounded-full border-2 border-neutral-200 border-t-blue-600 animate-spin mb-3" />
                  <p className="text-sm font-medium text-neutral-600">正在与后台 AI 流水线建立连接</p>
                  <p className="text-xs text-neutral-400 mt-1">识别完毕的切片将在此处自动水平排列展开</p>
                </div>
              ) : (
                groupedClips.map((group) => {
                  const isCollapsed = !!collapsedProducts[group.productIndex];
                  const groupDuration = group.clips.reduce((acc, c) => acc + (c.durationSeconds || 0), 0);

                  return (
                    <div
                      key={group.productIndex}
                      className="border border-neutral-200/90 rounded-xl overflow-hidden bg-white shadow-2xs transition-all"
                    >
                      {/* 商品分组手风琴头部卡条 */}
                      <div
                        onClick={() => toggleProductCollapse(group.productIndex)}
                        className="px-4 py-2.5 bg-neutral-50/90 hover:bg-neutral-100/80 border-b border-neutral-100 flex items-center justify-between cursor-pointer transition select-none"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-neutral-400 transition-transform duration-200">
                            {isCollapsed ? (
                              <ChevronRight className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </span>
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ background: colorOf(group.productIndex) }}
                          />
                          <span className="text-xs font-bold text-neutral-900 truncate">
                            {group.productName}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-200/70 text-neutral-600 font-medium">
                            {group.clips.length} 条高光 · {groupDuration}s
                          </span>
                          {group.sellingPoints && (
                            <span className="text-xs text-neutral-400 font-normal hidden sm:inline truncate max-w-md">
                              ({group.sellingPoints})
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            disabled={isPipelineLocked || exportingJianyingId === `prod_${group.productIndex}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportJianying(
                                group.clips,
                                `剪映单品_${group.productName}_${group.clips.length}段高光`
                              );
                            }}
                            className="flex items-center gap-1 px-3 py-1 rounded bg-white hover:bg-blue-50 text-blue-700 hover:text-blue-800 border border-blue-200 text-xs font-medium transition active:scale-95 shadow-2xs cursor-pointer"
                            title="仅将该单品切片打包导出剪映工程"
                          >
                            <Film className="w-3 h-3 text-blue-600" />
                            <span>导本品剪映工程</span>
                          </button>
                        </div>
                      </div>

                      {/* 展开内容列表：水平伸缩网格 (根据 viewMode 自适应 1~5 列) */}
                      {!isCollapsed && (
                        <div className="p-3 bg-neutral-50/30">
                          {viewMode === 'compact' ? (
                            /* 紧凑矩阵模式：高密度横向伸缩网格 (3~6 列自适应) */
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5">
                              {group.clips.map((clip) => {
                                const isSelected = activeClip?.id === clip.id;
                                return (
                                  <div
                                    key={clip.id}
                                    onClick={() => handleCardClick(clip)}
                                    className={`group flex flex-col justify-between p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                                      isPipelineLocked
                                        ? 'opacity-70 border-blue-200 bg-white'
                                        : isSelected
                                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                                        : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/90'
                                    }`}
                                  >
                                    {/* 标签与时间 */}
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                      <span
                                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${
                                          isSelected
                                            ? 'bg-white/20 text-white'
                                            : 'bg-neutral-100 text-neutral-700'
                                        }`}
                                      >
                                        {clip.tag}
                                      </span>
                                      <span
                                        className={`text-[11px] font-mono shrink-0 ${
                                          isSelected ? 'text-white/70' : 'text-neutral-400'
                                        }`}
                                      >
                                        {clip.timeRange} ({clip.durationSeconds}s)
                                      </span>
                                    </div>

                                    {/* Hook 金句 */}
                                    <p
                                      className={`text-xs font-semibold line-clamp-1 mb-2 ${
                                        isSelected ? 'text-white' : 'text-neutral-800'
                                      }`}
                                      title={clip.caption}
                                    >
                                      {clip.caption}
                                    </p>

                                    {/* 底部操作行 */}
                                    <div
                                      className={`flex items-center justify-between pt-1.5 border-t text-[11px] ${
                                        isSelected ? 'border-white/10' : 'border-neutral-100'
                                      }`}
                                    >
                                      <span
                                        className={`font-mono ${
                                          isSelected ? 'text-emerald-300' : 'text-emerald-600 font-medium'
                                        }`}
                                      >
                                        分值 {clip.score}
                                      </span>

                                      <div className="flex items-center gap-1.5">
                                        <button
                                          disabled={isPipelineLocked || exportingJianyingId === clip.id}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleExportJianying([clip]);
                                          }}
                                          className={`p-1 rounded text-xs transition cursor-pointer ${
                                            isSelected
                                              ? 'hover:bg-white/20 text-blue-200'
                                              : 'text-neutral-400 hover:text-blue-600 hover:bg-blue-50'
                                          }`}
                                          title="导入单条到剪映"
                                        >
                                          <Film className="w-3.5 h-3.5" />
                                        </button>

                                        <button
                                          disabled={isPipelineLocked || isCutting}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleExportSingle(clip);
                                          }}
                                          className={`p-1 rounded text-xs transition cursor-pointer ${
                                            isSelected
                                              ? 'hover:bg-white/20 text-white'
                                              : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100'
                                          }`}
                                          title="下载 MP4 切片"
                                        >
                                          <Download className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            /* 详细大卡片模式：水平多列伸缩卡片网格 (2~5 列自适应) */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5">
                              {group.clips.map((clip) => {
                                const isSelected = activeClip?.id === clip.id;
                                return (
                                  <div
                                    key={clip.id}
                                    onClick={() => handleCardClick(clip)}
                                    className={`clip-card fade-in-up p-3.5 rounded-xl border bg-white shadow-2xs relative flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                                      isPipelineLocked
                                        ? 'pulse-card border-blue-300'
                                        : isSelected
                                        ? 'border-neutral-900 ring-1 ring-neutral-900 bg-neutral-50/50'
                                        : 'border-neutral-200 hover:border-neutral-400'
                                    }`}
                                  >
                                    <div>
                                      {/* 卡片头部 */}
                                      <div className="flex items-center gap-2 mb-2">
                                        <span
                                          className="w-2 h-2 rounded-full shrink-0"
                                          style={{ background: colorOf(clip.productIndex) }}
                                        />
                                        <span className="text-xs font-semibold text-neutral-900 truncate">
                                          {clip.productName || '单品'}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 font-medium text-neutral-700 shrink-0">
                                          {clip.tag}
                                        </span>
                                        <span className="text-xs font-mono text-emerald-600 font-semibold ml-auto shrink-0">
                                          分值 {clip.score}
                                        </span>
                                      </div>

                                      {/* 钩子金句气泡 */}
                                      <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-200/60 text-xs font-medium text-neutral-800 mb-2 line-clamp-2">
                                        {clip.caption}
                                      </div>

                                      {/* 台词摘录 */}
                                      {clip.transcriptSnippet && (
                                        <p className="text-[11px] text-neutral-500 line-clamp-2 mb-3 leading-relaxed">
                                          台词：{clip.transcriptSnippet}
                                        </p>
                                      )}
                                    </div>

                                    {/* 卡片底部操作栏 */}
                                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-[11px] text-neutral-400 mt-auto">
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
                                          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                                            isPipelineLocked || exportingJianyingId === clip.id
                                              ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                                              : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 active:scale-95'
                                          }`}
                                          title="一键将该片段与字幕打包存入剪映草稿箱"
                                        >
                                          <Film className="w-3 h-3 text-blue-600" />
                                          <span>
                                            {exportingJianyingId === clip.id ? '写入中' : '导入剪映'}
                                          </span>
                                        </button>

                                        <button
                                          disabled={isPipelineLocked || isCutting}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleExportSingle(clip);
                                          }}
                                          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                                            isPipelineLocked || isCutting
                                              ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                                              : 'bg-neutral-900 hover:bg-black text-white active:scale-95'
                                          }`}
                                        >
                                          <Download className="w-3 h-3" />
                                          <span>导出</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab 2: ASR 口播逐字稿与时间戳 */}
          {activeTab === 'transcripts' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/70 text-xs text-neutral-600 leading-relaxed">
                <span className="font-semibold text-neutral-800 block mb-1">
                  DashScope Paraformer 识别全文：
                </span>
                {transcripts.fullText || '暂无识别全文'}
              </div>

              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                句级时间戳明细 (点击任一句跳转试看)
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
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
            </div>
          )}
        </section>
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
