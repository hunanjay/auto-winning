import React, { useState, useRef } from 'react';
import {
  Scissors,
  Sparkles,
  Download,
  Play,
  Flame,
  Check,
  Upload,
  RefreshCw,
  Video,
  FileCheck,
  Share2
} from 'lucide-react';
import { AUTO_SLICER_CLIPS } from '../data/mockData';
import ProductArtwork from './ProductArtwork';

export default function VideoSlicerStudio({ selectedProduct, onAddToast }) {
  const [activeClip, setActiveClip] = useState(AUTO_SLICER_CLIPS[0]);
  const [activeRules, setActiveRules] = useState(['语音破价锚点', '微距特写帧', '加购波峰']);
  const [sourceVideoName, setSourceVideoName] = useState('20261102_淘宝双11直播回放_03h42m.mp4');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  const toggleRule = (rule) => {
    setActiveRules((prev) => {
      const next = prev.includes(rule) ? prev.filter((r) => r !== rule) : [...prev, rule];
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        onAddToast(`已根据「${rule}」规则重新提炼高光带货片段`);
      }, 500);
      return next;
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSourceVideoName(file.name);
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      onAddToast(`已完成对长视频「${file.name}」的 AI 智能切片`);
    }, 1200);
  };

  const handleExportSingle = (clip) => {
    onAddToast(`已导出带货短视频切片「${clip.title}」`);
  };

  return (
    <div className="space-y-6 pb-20">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Top Minimal Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Rules Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-400 mr-1">AI 识别规则：</span>
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

        {/* Source Video & Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            <span>导入长视频/回放</span>
          </button>
          <button
            onClick={() => onAddToast('已打包导出全部 4 条竖屏高光切片 (ZIP压缩包)')}
            className="px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>一键导出全部 4 条切片</span>
          </button>
        </div>
      </div>

      {/* Current File Banner */}
      <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs">
        <div className="flex items-center gap-2 text-indigo-900">
          <Video className="w-4 h-4 text-indigo-600" />
          <span>当前解析素材：<strong className="font-mono">{sourceVideoName}</strong></span>
        </div>
        <span className="text-[11px] text-indigo-600 font-medium">
          已自动定位 4 个高光带货峰值区间
        </span>
      </div>

      {/* Center Visual Stage + Clean Filmstrip Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative overflow-hidden">
        {/* Analyzing Overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-30 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
            <span className="text-xs font-bold text-slate-800">
              AI 正在识别语音价格锚点与高光特写...
            </span>
          </div>
        )}

        {/* Left: 9:16 Vertical Preview */}
        <div className="lg:col-span-4 flex justify-center">
          <div className="relative w-60 aspect-[9/16] rounded-3xl overflow-hidden border border-slate-200 shadow-lg">
            <ProductArtwork
              svgType={activeClip.svgType}
              palette={activeClip.palette}
              animate={true}
              className="w-full h-full"
            />

            {/* Top Score Pill */}
            <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-white/85 backdrop-blur-md text-[11px] font-semibold text-slate-800 flex items-center gap-1 shadow-2xs">
              <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
              <span>AI 评分 {activeClip.score}</span>
            </div>

            {/* Bottom Auto-Subtitle Pill */}
            <div className="absolute inset-x-3 bottom-5 z-20 text-center">
              <div className="inline-block px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md text-white text-xs font-semibold">
                {activeClip.caption}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Minimalist Visual Waveform & Filmstrip Track */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-indigo-600 font-semibold">{activeClip.tag}</span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {activeClip.title} · <span className="font-mono text-sm text-slate-400">{activeClip.timeRange}</span>
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                时长 {activeClip.duration}
              </span>
              <button
                onClick={() => handleExportSingle(activeClip)}
                className="px-3 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>导出此片段</span>
              </button>
            </div>
          </div>

          {/* Visual Highlight Waveform Bar */}
          <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-slate-200/60 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>AI 爆款转化热度轨 (声压 + 价格关键词)</span>
              <span className="font-mono">00:00 ──────── 03:00</span>
            </div>

            {/* Waveform Bars */}
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

            {/* Slicer Blocks on Timeline */}
            <div className="relative h-10 rounded-xl bg-white border border-slate-200/80 overflow-hidden">
              {AUTO_SLICER_CLIPS.map((clip) => {
                const isSelected = clip.id === activeClip.id;
                return (
                  <button
                    key={clip.id}
                    onClick={() => setActiveClip(clip)}
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
                    <span className="text-[10px] opacity-75 shrink-0">{clip.duration}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4 Sliced Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {AUTO_SLICER_CLIPS.map((clip) => {
              const isSelected = clip.id === activeClip.id;
              return (
                <div
                  key={clip.id}
                  onClick={() => setActiveClip(clip)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/50 border-indigo-500 shadow-xs'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-indigo-600">{clip.tag}</span>
                    <span className="text-[10px] text-orange-500 font-bold">★ {clip.score}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 truncate">{clip.title}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{clip.duration}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
