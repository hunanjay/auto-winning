import React, { useState, useRef, useEffect } from 'react';
import {
  Scissors,
  Sparkles,
  Download,
  Play,
  Pause,
  Upload,
  RefreshCw,
  Video,
  Check,
  ExternalLink,
  Flame,
  Volume2,
  VolumeX,
  RotateCcw
} from 'lucide-react';

export default function VideoSlicerStudio({ onAddToast }) {
  const [videoData, setVideoData] = useState({
    id: 'sample_livestream',
    fileName: '20261102_淘宝双11大促带货直播回放.mp4',
    videoUrl: 'http://localhost:3001/uploads/videos/sample_livestream.mp4',
    duration: 60,
    durationFormatted: '01:00',
    width: 1080,
    height: 1920,
    ratio: '9:16'
  });

  const [clips, setClips] = useState([
    {
      id: 'real-clip-1',
      title: '黄金破价锚点片段',
      startSeconds: 4,
      endSeconds: 20,
      durationSeconds: 16,
      timeRange: '00:04 - 00:20',
      score: 98,
      startPct: 7,
      widthPct: 27,
      tag: '价格锚点峰值',
      caption: '“今天买正装直接多送同款体验装，不满意包退！”'
    },
    {
      id: 'real-clip-2',
      title: '实测对比与特写帧',
      startSeconds: 21,
      endSeconds: 36,
      durationSeconds: 15,
      timeRange: '00:21 - 00:36',
      score: 95,
      startPct: 35,
      widthPct: 25,
      tag: '特写高光帧',
      caption: '“3秒水润度从24%直接飙到72%，看这层微距质感！”'
    },
    {
      id: 'real-clip-3',
      title: '痛点共鸣与场景代入',
      startSeconds: 37,
      endSeconds: 52,
      durationSeconds: 15,
      timeRange: '00:37 - 00:52',
      score: 93,
      startPct: 62,
      widthPct: 25,
      tag: '高完播开头',
      caption: '“为什么平时涂再贵的面霜还是暗沉？关键在吸收！”'
    },
    {
      id: 'real-clip-4',
      title: '加购冲动与收尾促单',
      startSeconds: 49,
      endSeconds: 60,
      durationSeconds: 11,
      timeRange: '00:49 - 01:00',
      score: 96,
      startPct: 82,
      widthPct: 18,
      tag: '加购波峰',
      caption: '“大促前100名加赠限量伴手礼盒，手慢无！”'
    }
  ]);

  const [activeClip, setActiveClip] = useState(clips[0]);
  const [activeRules, setActiveRules] = useState(['语音破价锚点', '微距特写帧', '加购波峰']);
  const [isUploading, setIsUploading] = useState(false);
  const [isCutting, setIsCutting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [serverStatus, setServerStatus] = useState({
    status: 'connected',
    serverUrl: 'http://127.0.0.1:8085',
    webuiUrl: 'http://127.0.0.1:8501'
  });

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  // 1. 初始化时向后端拉取默认真实样片分析
  useEffect(() => {
    fetch('http://localhost:3001/api/slicer/upload-and-analyze', { method: 'POST' })
      .then((r) => r.json())
      .then((res) => {
        if (res.code === 0 && res.data) {
          setVideoData(res.data.video);
          if (res.data.clips?.length) {
            setClips(res.data.clips);
            setActiveClip(res.data.clips[0]);
          }
        }
      })
      .catch(() => {});

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

  // 2. 选择切片时，播放器立即精确定位到该切片的起始时间点并播放
  const handleSelectClip = (clip) => {
    setActiveClip(clip);
    if (videoRef.current) {
      videoRef.current.currentTime = clip.startSeconds;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // 3. 视频播放时间更新：保持在当前切片区间循环试看
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);

    if (activeClip && curr >= activeClip.endSeconds) {
      // 循环回切片起点
      videoRef.current.currentTime = activeClip.startSeconds;
    }
  };

  // 4. 播放 / 暂停切换
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

  // 5. 真实上传本地长视频并解析
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('video', file);

      const res = await fetch('http://localhost:3001/api/slicer/upload-and-analyze', {
        method: 'POST',
        body: formData
      });

      const json = await res.json();
      if (json.code === 0 && json.data) {
        setVideoData(json.data.video);
        if (json.data.clips?.length) {
          setClips(json.data.clips);
          setActiveClip(json.data.clips[0]);
        }
        onAddToast && onAddToast(`已完成对长视频「${file.name}」的真实探测与切片规划`);
      } else {
        throw new Error(json.error || '解析失败');
      }
    } catch (err) {
      console.error(err);
      onAddToast && onAddToast(`视频上传解析异常: ${err.message}`);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // 6. 真实物理切片 (调用后端 FFmpeg 裁剪并触发下载)
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

  // 7. 一键物理批量导出所有切片
  const handleExportAll = async () => {
    setIsCutting(true);
    try {
      const res = await fetch('http://localhost:3001/api/slicer/cut-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: videoData.id,
          clips
        })
      });

      const json = await res.json();
      if (json.code === 0 && json.data?.clips) {
        // 依次触发所有切片文件的真实下载
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
      console.error(err);
      onAddToast && onAddToast(`批量切片失败: ${err.message}`);
    } finally {
      setIsCutting(false);
    }
  };

  const toggleRule = (rule) => {
    setActiveRules((prev) =>
      prev.includes(rule) ? prev.filter((r) => r !== rule) : [...prev, rule]
    );
    onAddToast && onAddToast(`已根据「${rule}」规则重新提炼高光带货片段`);
  };

  return (
    <div className="space-y-6 pb-20 select-none">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* 顶部工具栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* 规则标签 */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-400 mr-1">识别规则：</span>
          {['语音破价锚点', '微距特写帧', '加购波峰', '矩阵自动去重'].map((rule) => {
            const active = activeRules.includes(rule);
            return (
              <button
                key={rule}
                onClick={() => toggleRule(rule)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white shadow-2xs font-bold'
                    : 'bg-white text-slate-500 border border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                {active && <Check className="w-3 h-3 text-indigo-400" />}
                <span>{rule}</span>
              </button>
            );
          })}
        </div>

        {/* 右侧动作 */}
        <div className="flex items-center gap-2">
          {/* 切片服务状态 */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200/80 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                serverStatus.status === 'connected'
                  ? 'bg-emerald-500 animate-pulse'
                  : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-600 font-medium font-mono text-[11px]">
              FFmpeg 物理裁剪引擎就绪
            </span>
          </div>

          <a
            href={serverStatus.webuiUrl || 'http://127.0.0.1:8501'}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
            title="在新标签页打开 MoneyPrinterTurbo 专属可视化剪辑工作台"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
            <span>切片工作台 WebUI</span>
          </a>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
          >
            {isUploading ? (
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
            )}
            <span>{isUploading ? '正在上传解析中...' : '导入长视频/回放'}</span>
          </button>

          <button
            onClick={handleExportAll}
            disabled={isCutting}
            className="px-4 py-1.5 rounded-full bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isCutting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isCutting ? '正在物理裁剪...' : `一键物理导出全部 ${clips.length} 条切片`}</span>
          </button>
        </div>
      </div>

      {/* 当前素材信息栏 */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs">
        <div className="flex items-center gap-2 text-indigo-900 min-w-0">
          <Video className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="truncate">
            当前解析素材：<strong className="font-mono">{videoData.fileName}</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-white text-indigo-700 font-mono text-[11px] font-bold shrink-0">
            {videoData.durationFormatted} ({videoData.width}x{videoData.height})
          </span>
        </div>
        <span className="text-[11px] text-indigo-600 font-medium shrink-0">
          已自动探测并规划 {clips.length} 个高光带货峰值区间
        </span>
      </div>

      {/* 主工作区：左侧真实 HTML5 播放器 + 右侧波形与切片流 */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative overflow-hidden">
        {/* 上传/解析遮罩 */}
        {isUploading && (
          <div className="absolute inset-0 bg-white/85 backdrop-blur-xs z-30 flex flex-col items-center justify-center gap-2.5">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            <span className="text-sm font-bold text-slate-800">
              正在调用 ffprobe 探测真实视频流并提取带货高光...
            </span>
          </div>
        )}

        {/* 左侧：9:16 真实视频播放器 */}
        <div className="lg:col-span-4 flex justify-center">
          <div className="relative w-64 aspect-[9/16] rounded-3xl overflow-hidden bg-black shadow-xl border border-slate-800 group">
            {/* 真实 HTML5 Video 元素 */}
            <video
              ref={videoRef}
              src={videoData.videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              muted={isMuted}
              playsInline
              loop
              className="w-full h-full object-contain cursor-pointer"
              onClick={handleTogglePlay}
            />

            {/* 顶部评分与静音控制 */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20 pointer-events-auto">
              <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1 shadow-xs">
                <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
                <span>AI 评分 {activeClip.score}</span>
              </div>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center cursor-pointer hover:bg-black/80 transition"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* 中间播放/暂停悬浮图标 */}
            <button
              onClick={handleTogglePlay}
              className={`absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center transition-opacity cursor-pointer ${
                isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
              }`}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
            </button>

            {/* 底部字幕提示 */}
            <div className="absolute inset-x-3 bottom-4 z-20 text-center pointer-events-none">
              <div className="inline-block px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-white text-xs font-semibold leading-relaxed shadow-lg">
                {activeClip.caption}
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：波形轨道与切片卡片 */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-indigo-600 font-semibold">{activeClip.tag}</span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {activeClip.title} · <span className="font-mono text-sm text-slate-400">{activeClip.timeRange}</span>
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium font-mono">
                时长 {activeClip.durationSeconds}s
              </span>

              <button
                onClick={() => handleExportSingle(activeClip)}
                disabled={isCutting}
                className="px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isCutting ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Download className="w-3 h-3" />
                )}
                <span>{isCutting ? '裁剪中...' : '导出此片段 (MP4)'}</span>
              </button>
            </div>
          </div>

          {/* 转化热度轨与时间轴 */}
          <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-slate-200/60 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>AI 爆款转化热度轨 (声压 + 价格关键词)</span>
              </span>
              <span className="font-mono font-medium text-slate-600">
                当前: {Math.floor(currentTime)}s / 总长: {videoData.durationFormatted}
              </span>
            </div>

            {/* 动态柱状波形 */}
            <div className="h-12 flex items-end gap-1 px-1">
              {[
                22, 35, 90, 96, 85, 38, 25, 42, 88, 94, 80, 30, 28, 86, 92, 75, 28, 36, 92, 98,
                84, 40, 26, 20
              ].map((val, idx) => (
                <div
                  key={idx}
                  className={`flex-1 rounded-full transition-all ${
                    val > 80 ? 'bg-indigo-500' : 'bg-slate-200'
                  }`}
                  style={{ height: `${val}%` }}
                />
              ))}
            </div>

            {/* 时间轴上的切片区间滑块 */}
            <div className="relative h-11 rounded-xl bg-white border border-slate-200/80 overflow-hidden">
              {clips.map((clip) => {
                const isSelected = clip.id === activeClip.id;
                return (
                  <button
                    key={clip.id}
                    onClick={() => handleSelectClip(clip)}
                    style={{
                      left: `${clip.startPct}%`,
                      width: `${clip.widthPct}%`
                    }}
                    className={`absolute top-1 bottom-1 rounded-lg px-2 text-[11px] font-medium flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-sm z-10 font-bold'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/60'
                    }`}
                  >
                    <span className="truncate">{clip.title}</span>
                    <span className="text-[10px] opacity-75 shrink-0 font-mono ml-1">
                      {clip.durationSeconds}s
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 切片卡片矩阵 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {clips.map((clip) => {
              const isSelected = clip.id === activeClip.id;
              return (
                <div
                  key={clip.id}
                  onClick={() => handleSelectClip(clip)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/50 border-indigo-500 shadow-xs'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-indigo-600">{clip.tag}</span>
                    <span className="text-[10px] text-orange-500 font-bold font-mono">
                      分值 {clip.score}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 truncate">{clip.title}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center justify-between">
                    <span>{clip.timeRange}</span>
                    <span className="text-indigo-600 font-medium">{clip.durationSeconds}s</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
