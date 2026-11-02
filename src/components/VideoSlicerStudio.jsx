import React, { useState } from 'react';
import {
  Scissors,
  Sparkles,
  Download,
  Play,
  Flame,
  Check,
  Upload
} from 'lucide-react';
import { AUTO_SLICER_CLIPS } from '../data/mockData';
import ProductArtwork from './ProductArtwork';

export default function VideoSlicerStudio({ selectedProduct, onAddToast }) {
  const [activeClip, setActiveClip] = useState(AUTO_SLICER_CLIPS[0]);
  const [activeRules, setActiveRules] = useState(['语音破价锚点', '微距特写帧', '加购波峰']);

  const toggleRule = (rule) => {
    setActiveRules((prev) =>
      prev.includes(rule) ? prev.filter((r) => r !== rule) : [...prev, rule]
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Minimal Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {['语音破价锚点', '微距特写帧', '加购波峰', '矩阵自动去重'].map((rule) => {
            const active = activeRules.includes(rule);
            return (
              <button
                key={rule}
                onClick={() => toggleRule(rule)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-500 border border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                {active && <Check className="w-3 h-3 text-indigo-400" />}
                <span>{rule}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddToast('支持拖拽本地 MP4 直播回放自动拆条')}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>导入长视频</span>
          </button>
          <button
            onClick={() => onAddToast('已打包导出全部 4 条竖屏高光切片')}
            className="px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>一键导出 4 条切片</span>
          </button>
        </div>
      </div>

      {/* Center Visual Stage + Clean Filmstrip Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
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
              <div className="inline-block px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-white text-xs font-semibold">
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
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
              时长 {activeClip.duration}
            </span>
          </div>

          {/* Visual Highlight Waveform Bar */}
          <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-slate-200/60 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>AI 高光热度轨</span>
              <span className="font-mono">00:00 ──────── 03:00</span>
            </div>

            {/* Clean Waveform Bars */}
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

            {/* Interactive Slicer Blocks on Timeline */}
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
                        ? 'bg-slate-900 text-white shadow-sm z-10'
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
                  className={`group cursor-pointer rounded-2xl overflow-hidden border transition-all bg-white ${
                    isSelected
                      ? 'border-slate-900 ring-2 ring-slate-900/10'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="aspect-[4/5] relative">
                    <ProductArtwork
                      svgType={clip.svgType}
                      palette={clip.palette}
                      className="w-full h-full"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/85 backdrop-blur-md text-[10px] font-semibold text-slate-800">
                      {clip.score}分
                    </div>
                  </div>
                  <div className="p-2.5 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-800 truncate">{clip.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{clip.duration}</span>
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
