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
  ArrowLeftRight,
  Link2,
  Maximize2,
  Flame,
  Volume2
} from 'lucide-react';
import { VIDEO_FEED } from '../data/mockData';
import ProductArtwork from './ProductArtwork';
import VideoPlayerModal from './VideoPlayerModal';

const ECOMMERCE_HOOKS = [
  '“今天买正装直接多送同款体验装，不满意包退！”',
  '“早八人直接把星巴克省下来，30秒一杯浓缩油脂！”',
  '“同样是通勤挤地铁，戴上它直接静音到无人区！”',
  '“大促前100名加赠收纳礼盒，手慢无！”'
];

export default function VideoStudio({
  selectedProduct,
  allProducts = [],
  onSelectProduct,
  incomingFrame,
  onOpenCreateTemplate,
  onOpenAddProduct,
  onSendToSlicer,
  onAddToast
}) {
  const [videos, setVideos] = useState(VIDEO_FEED);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [prompt, setPrompt] = useState(
    incomingFrame?.prompt || '镜头缓慢360度环绕商品，清晨柔和光斑流动，水波纹轻柔荡漾'
  );
  const [motion, setMotion] = useState('环绕运镜');
  const [duration, setDuration] = useState('5s');
  const [ratio] = useState('9:16');
  const [hookText, setHookText] = useState(ECOMMERCE_HOOKS[0]);
  const [hasEndFrame, setHasEndFrame] = useState(false);
  const [playingId, setPlayingId] = useState('vid-1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePlayerVideo, setActivePlayerVideo] = useState(null);

  useEffect(() => {
    if (incomingFrame?.prompt) {
      setPrompt(incomingFrame.prompt);
    }
  }, [incomingFrame]);

  const motions = ['环绕运镜', '推镜头', '拉镜头', '手持跟随', '慢动作', '开箱微距'];

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
        model: 'Video 3.0 Pro 电商版',
        svgType: incomingFrame?.svgType || selectedProduct.svgType,
        customImageUrl: incomingFrame?.customImageUrl || selectedProduct.customImageUrl,
        palette: incomingFrame?.palette || selectedProduct.palette,
        hook: hookText
      };
      setVideos((prev) => [newVid, ...prev]);
      setPlayingId(newVid.id);
      setIsGenerating(false);
      onAddToast('已生成带货短视频 (9:16竖屏)');
    }, 800);
  };

  return (
    <div className="relative min-h-full pb-52 space-y-6">
      {/* Clean Video Grid */}
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
                  customImageUrl={vid.customImageUrl}
                  palette={vid.palette}
                  animate={isPlaying}
                  className="w-full h-full"
                />

                <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/85 backdrop-blur-md text-[11px] font-medium text-slate-700 shadow-2xs">
                  <Play className={`w-3 h-3 ${isPlaying ? 'text-indigo-600 fill-indigo-600' : 'text-slate-600'}`} />
                  <span>{vid.duration}</span>
                  <span className="text-slate-300">|</span>
                  <span>{vid.motion}</span>
                </div>

                {/* Top Right Zoom Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePlayerVideo(vid);
                  }}
                  className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-white/85 hover:bg-white backdrop-blur-md flex items-center justify-center text-slate-700 shadow-xs cursor-pointer"
                  title="全屏带货预览"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-black/75 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end gap-2 z-20">
                  <div className="text-[10px] text-amber-300 font-bold truncate">
                    💡 {vid.hook || '带货黄金前3秒'}
                  </div>
                  <p className="text-[11px] text-white/95 line-clamp-1 leading-relaxed">
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
                      <span>切片拆条</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePlayerVideo(vid);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-white/25 hover:bg-white/35 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>播放</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-3.5 py-2.5 flex items-center justify-between bg-white">
                <span className="text-xs font-medium text-slate-800 truncate">{vid.title}</span>
                <span className="text-[11px] text-slate-400 font-mono">{vid.ratio}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Omnibox */}
      <div className="fixed bottom-5 left-[84px] right-4 z-30 flex flex-col items-center pointer-events-none gap-2">
        {/* Quick E-commerce Hooks Pills */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-full px-3 py-1.5 shadow-md flex items-center gap-1.5 pointer-events-auto overflow-x-auto max-w-4xl">
          <span className="text-[11px] font-bold text-slate-400 px-1 shrink-0 flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-500" />
            <span>前3秒带货旁白：</span>
          </span>
          {ECOMMERCE_HOOKS.map((hk) => (
            <button
              key={hk}
              onClick={() => setHookText(hk)}
              className={`px-2.5 py-1 rounded-full text-xs transition-colors shrink-0 cursor-pointer ${
                hookText === hk
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700'
              }`}
            >
              {hk.slice(0, 16)}...
            </button>
          ))}
        </div>

        <div className="w-full max-w-4xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl shadow-[0_16px_48px_rgba(15,23,42,0.1)] p-3.5 pointer-events-auto">
          {/* Product Picker Popover */}
          {showProductPicker && (
            <div className="mb-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-2 overflow-x-auto">
              <span className="text-[11px] text-slate-400 px-2 shrink-0">切换视频主角：</span>
              {(allProducts.length ? allProducts : []).map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => {
                    onSelectProduct && onSelectProduct(prod);
                    setShowProductPicker(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                    prod.id === selectedProduct.id
                      ? 'bg-slate-900 text-white shadow-xs font-bold'
                      : 'bg-white text-slate-700 border border-slate-200/70 hover:bg-slate-100'
                  }`}
                >
                  <span>{prod.name}</span>
                </button>
              ))}

              <button
                onClick={() => {
                  setShowProductPicker(false);
                  onOpenAddProduct && onOpenAddProduct();
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ 传新商品</span>
              </button>
            </div>
          )}

          <div className="flex items-start gap-3">
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                onClick={() => setShowProductPicker(!showProductPicker)}
                className="relative w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer group hover:border-indigo-400 transition-colors"
                title="点击切换商品主体"
              >
                <ProductArtwork
                  svgType={incomingFrame?.svgType || selectedProduct.svgType}
                  customImageUrl={incomingFrame?.customImageUrl || selectedProduct.customImageUrl}
                  palette={incomingFrame?.palette || selectedProduct.palette}
                  className="w-full h-full"
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[9px] text-white text-center py-0.5">
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
                      customImageUrl={selectedProduct.customImageUrl}
                      palette="cream"
                      className="w-full h-full"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-indigo-600 text-[9px] text-white text-center py-0.5">
                      已锁尾帧
                    </div>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span className="text-[9px] mt-0.5 font-bold">加尾帧</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="输入带货运镜与光影描述，例如：镜头缓慢360度环绕商品，微距水珠折射..."
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none py-1 leading-relaxed"
            />
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-indigo-600" />
                <span>Video 3.0 电商版</span>
              </div>

              {/* Motion selector */}
              <div className="flex items-center gap-1 bg-slate-100 rounded-full p-0.5">
                {motions.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMotion(m)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      motion === m
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Duration selector */}
              <div className="flex items-center bg-slate-100 rounded-full p-0.5">
                {['5s', '10s'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      duration === d
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
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
                  <span>渲染视频中</span>
                </>
              ) : (
                <>
                  <span>生成带货视频</span>
                  <ArrowUp className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Video Fullscreen Player Modal */}
      <VideoPlayerModal
        isOpen={Boolean(activePlayerVideo)}
        videoData={activePlayerVideo}
        onClose={() => setActivePlayerVideo(null)}
        onSendToSlicer={onSendToSlicer}
        onAddToast={onAddToast}
      />
    </div>
  );
}
