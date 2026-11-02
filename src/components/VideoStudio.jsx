import React, { useState, useEffect } from 'react';
import {
  Video,
  Play,
  ArrowUp,
  Scissors,
  Download,
  RefreshCw,
  Camera,
  Clock,
  Plus,
  ArrowLeftRight
} from 'lucide-react';
import { VIDEO_FEED } from '../data/mockData';
import ProductArtwork from './ProductArtwork';

export default function VideoStudio({
  selectedProduct,
  incomingFrame,
  onSendToSlicer,
  onAddToast
}) {
  const [videos, setVideos] = useState(VIDEO_FEED);
  const [prompt, setPrompt] = useState(
    incomingFrame?.prompt || '镜头缓慢360度环绕商品，清晨柔和光斑流动，水波纹轻柔荡漾'
  );
  const [motion, setMotion] = useState('环绕运镜');
  const [duration, setDuration] = useState('5s');
  const [ratio, setRatio] = useState('9:16');
  const [hasEndFrame, setHasEndFrame] = useState(false);
  const [playingId, setPlayingId] = useState('vid-1');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (incomingFrame?.prompt) {
      setPrompt(incomingFrame.prompt);
    }
  }, [incomingFrame]);

  const motions = ['环绕运镜', '推镜头', '拉镜头', '手持跟随', '慢动作'];

  const handleGenerateVideo = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      const newVid = {
        id: `vid-${Date.now()}`,
        title: `${selectedProduct.name} · ${motion}`,
        prompt,
        duration: duration === '5s' ? '00:05' : '00:10',
        ratio,
        motion,
        model: 'Video 3.0 Pro',
        svgType: incomingFrame?.svgType || selectedProduct.svgType,
        palette: incomingFrame?.palette || selectedProduct.palette,
        hook: '首帧特征锁定生成'
      };
      setVideos((prev) => [newVid, ...prev]);
      setPlayingId(newVid.id);
      setIsGenerating(false);
      onAddToast('已生成带货视频');
    }, 800);
  };

  return (
    <div className="relative min-h-full pb-48 space-y-6">
      {/* Clean Video Grid (Jimeng Video Gallery Style) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {videos.map((vid) => {
          const isPlaying = playingId === vid.id;
          return (
            <div
              key={vid.id}
              onClick={() => setPlayingId(vid.id)}
              className={`group relative rounded-2xl overflow-hidden bg-white border transition-all cursor-pointer ${
                isPlaying
                  ? 'border-indigo-400 shadow-[0_12px_32px_rgba(79,70,229,0.12)]'
                  : 'border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]'
              }`}
            >
              <div className="aspect-[3/4] w-full relative">
                <ProductArtwork
                  svgType={vid.svgType}
                  palette={vid.palette}
                  animate={isPlaying}
                  className="w-full h-full"
                />

                {/* Top Status Pill */}
                <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/85 backdrop-blur-md text-[11px] font-medium text-slate-700 shadow-2xs">
                  <Play className={`w-3 h-3 ${isPlaying ? 'text-indigo-600 fill-indigo-600' : 'text-slate-600'}`} />
                  <span>{vid.duration}</span>
                  <span className="text-slate-300">|</span>
                  <span>{vid.motion}</span>
                </div>

                {/* Hover Overlay Actions */}
                <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-black/70 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end gap-2.5 z-20">
                  <p className="text-[11px] text-white/95 line-clamp-2 leading-relaxed">
                    {vid.prompt}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSendToSlicer(vid);
                      }}
                      className="flex-1 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-semibold text-[11px] flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                    >
                      <Scissors className="w-3 h-3 text-indigo-600" />
                      <span>智能切片</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToast('已下载 MP4 视频');
                      }}
                      className="w-8 h-8 rounded-xl bg-white/25 hover:bg-white/35 backdrop-blur-md text-white flex items-center justify-center cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-3.5 py-2.5 flex items-center justify-between bg-white">
                <span className="text-xs font-medium text-slate-800 truncate">{vid.title}</span>
                <span className="text-[11px] text-slate-400">{vid.ratio}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Jimeng Video Signature Floating Omnibox: [首帧 ⇌ 尾帧] + Prompt + Camera Pills */}
      <div className="fixed bottom-5 left-[84px] right-4 z-30 flex justify-center pointer-events-none">
        <div className="w-full max-w-4xl bg-white/92 backdrop-blur-2xl border border-slate-200/90 rounded-3xl shadow-[0_16px_48px_rgba(15,23,42,0.1)] p-3.5 pointer-events-auto">
          <div className="flex items-start gap-3">
            {/* Jimeng Dual Frame Slots: 首帧 ⇌ 尾帧 */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                <ProductArtwork
                  svgType={incomingFrame?.svgType || selectedProduct.svgType}
                  palette={incomingFrame?.palette || selectedProduct.palette}
                  className="w-full h-full"
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/55 text-[9px] text-white text-center py-0.5">
                  首帧图
                </div>
              </div>

              <ArrowLeftRight className="w-3.5 h-3.5 text-slate-300" />

              <button
                onClick={() => setHasEndFrame(!hasEndFrame)}
                className="relative w-14 h-14 rounded-2xl overflow-hidden border border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/70 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                {hasEndFrame ? (
                  <>
                    <ProductArtwork
                      svgType={selectedProduct.svgType}
                      palette="cream"
                      className="w-full h-full"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/55 text-[9px] text-white text-center py-0.5">
                      尾帧图
                    </div>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span className="text-[10px] mt-0.5">尾帧</span>
                  </>
                )}
              </button>
            </div>

            {/* Motion Prompt Input */}
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerateVideo();
                }
              }}
              placeholder="输入运镜与画面动态描述，如：镜头360度环绕商品，微距水珠飞溅慢动作..."
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none py-1 leading-relaxed"
            />
          </div>

          {/* Bottom Parameter Capsule Bar */}
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-indigo-600" />
                <span>视频 3.0 Pro</span>
              </div>

              {/* Camera Motion Pills */}
              <div className="flex items-center bg-slate-100 rounded-full p-0.5">
                <Camera className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
                {motions.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMotion(m)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      motion === m
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Duration Pills */}
              <div className="flex items-center bg-slate-100 rounded-full p-0.5">
                <Clock className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
                {['5s', '10s'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      duration === d
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateVideo}
              disabled={isGenerating}
              className="px-5 py-2 rounded-full bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>生成中</span>
                </>
              ) : (
                <>
                  <span>生成视频</span>
                  <ArrowUp className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
