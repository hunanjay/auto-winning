import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Download,
  Scissors,
  Flame,
  Volume2,
  VolumeX,
  Sparkles,
  Share2
} from 'lucide-react';
import ProductArtwork from './ProductArtwork';

export default function VideoPlayerModal({
  isOpen,
  onClose,
  videoData,
  onSendToSlicer,
  onAddToast
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isOpen, isPlaying]);

  if (!isOpen || !videoData) return null;

  const handleDownload = () => {
    onAddToast && onAddToast(`已导出带货短视频「${videoData.title}」`);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200/80 flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Left Vertical Player Screen (Simulating 9:16 TikTok / Video Feed) */}
        <div className="md:w-6/12 bg-black flex items-center justify-center relative overflow-hidden select-none p-4">
          <div className="relative w-full max-w-[280px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900">
            {/* Main Video Visual Canvas */}
            <ProductArtwork
              svgType={videoData.svgType}
              customImageUrl={videoData.customImageUrl}
              palette={videoData.palette}
              animate={isPlaying}
              className="w-full h-full"
            />

            {/* Simulated Live Ambient Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

            {/* Top Video Specs Bar */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between text-white text-[11px] font-medium z-20">
              <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
                <span>{videoData.motion}</span>
              </span>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Bottom Subtitle / Viral Hook Banner */}
            <div className="absolute inset-x-3 bottom-8 z-20 space-y-1.5">
              <div className="inline-block px-2.5 py-1 rounded-lg bg-red-600/90 backdrop-blur-md text-white text-[11px] font-bold shadow">
                💡 黄金前3秒转化 Hook
              </div>
              <p className="text-white text-xs font-semibold leading-relaxed drop-shadow">
                {videoData.hook || '“今天下单直接多送同款体验装，数量有限手慢无！”'}
              </p>
            </div>

            {/* Progress Bar Track */}
            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20">
              <div
                className="h-full bg-indigo-500 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Info & Actions Panel */}
        <div className="md:w-6/12 p-6 flex flex-col justify-between space-y-5 bg-white overflow-y-auto">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-600">{videoData.model || 'Video 3.0 Pro'}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{videoData.title}</h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Playback Controls Bar */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs cursor-pointer hover:bg-indigo-600 transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>
                <button
                  onClick={() => setProgress(0)}
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center cursor-pointer hover:bg-slate-100"
                  title="重新播放"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs font-mono text-slate-500">
                00:0{Math.floor((progress / 100) * 5)} / {videoData.duration || '00:05'}
              </div>
            </div>

            {/* Prompt details */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">运镜与场景描述</label>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 leading-relaxed font-mono">
                {videoData.prompt}
              </div>
            </div>

            {/* Video Parameters */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-400">画幅比例</div>
                <div className="font-bold text-slate-800 mt-0.5">9:16 抖音/视频号</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-400">运镜模式</div>
                <div className="font-bold text-slate-800 mt-0.5">{videoData.motion}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                onSendToSlicer && onSendToSlicer(videoData);
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Scissors className="w-4 h-4" />
              <span>载入智能切片台 · 提取高光带货片段</span>
            </button>

            <button
              onClick={handleDownload}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>导出高清带货视频 (MP4)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
