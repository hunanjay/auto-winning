import React, { useState } from 'react';
import {
  X,
  Download,
  Video,
  Eye,
  Sliders,
  Check,
  Sparkles,
  Share2,
  Copy,
  Layers,
  ArrowRight
} from 'lucide-react';
import ProductArtwork from './ProductArtwork';

const MARKETING_BADGES = [
  '无角标',
  '双11狂欢价',
  '爆款现货',
  '拍1发3',
  '限时立减 ¥50',
  '新客专享'
];

export default function ImageDetailModal({
  isOpen,
  onClose,
  imageData,
  onSendToVideo,
  onAddToast
}) {
  const [sliderPos, setSliderPos] = useState(50); // 0 to 100 for before/after slider
  const [activeBadge, setActiveBadge] = useState(null);

  if (!isOpen || !imageData) return null;

  const handleDownload = () => {
    // Perform simulated/real download
    const link = document.createElement('a');
    link.download = `OmniCommerce_${imageData.tag || '电商主图'}.png`;
    // Create simple data link or canvas fallback
    link.href = imageData.customImageUrl || 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><rect width="800" height="800" fill="#f1f5f9"/><text x="400" y="400" text-anchor="middle" font-size="24" fill="#334155">OmniCommerce AI 电商主图</text></svg>');
    link.click();
    onAddToast && onAddToast('已下载 2K 超清电商商业主图 (带商用授权)');
  };

  const handleCopyPrompt = () => {
    navigator.clipboard?.writeText(imageData.prompt || '');
    onAddToast && onAddToast('已复制提示词至剪贴板');
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200/80 flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Left Visual Interactive Canvas (Split Before/After Slider) */}
        <div className="md:w-7/12 bg-slate-100 flex flex-col justify-between relative p-4 sm:p-6 overflow-hidden select-none">
          {/* Top Floating Badge Toolbar */}
          <div className="flex items-center justify-between z-20 mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-800 text-xs font-semibold shadow-xs">
                {imageData.ratio || '3:4'} 电商标准画幅
              </span>
              <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                2K 超清渲染
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full">
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              <span>拖动滑块对比白底原图</span>
            </div>
          </div>

          {/* Interactive Split Compare Canvas */}
          <div className="relative aspect-[3/4] max-h-[500px] mx-auto w-full rounded-2xl overflow-hidden shadow-xl border border-slate-200/80">
            {/* Background Layer: Cutout White Background Original */}
            <div className="absolute inset-0 w-full h-full">
              <ProductArtwork
                svgType={imageData.svgType}
                customImageUrl={imageData.customImageUrl}
                isCutout={true}
                badge="白底原图"
                className="w-full h-full"
              />
            </div>

            {/* Foreground Layer: AI Scene Rendered (Clipped by sliderPos) */}
            <div
              className="absolute inset-0 w-full h-full overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              <ProductArtwork
                svgType={imageData.svgType}
                customImageUrl={imageData.customImageUrl}
                palette={imageData.palette}
                marketingBadge={activeBadge}
                className="w-full h-full"
              />
            </div>

            {/* Vertical Divider Line with Drag Handle */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-800 shadow-lg border border-slate-200 flex items-center justify-center">
                <Sliders className="w-4 h-4 text-indigo-600 rotate-90" />
              </div>
            </div>

            {/* Transparent Range Input for smooth slider interaction */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
              title="左右拖动对比"
            />
          </div>

          {/* Bottom Slider Hints */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 px-2 z-10">
            <span>◀ 白底实拍原图</span>
            <span>拖拽对比光影融合</span>
            <span>AI 场景精修大片 ▶</span>
          </div>
        </div>

        {/* Right Information & Action Panel */}
        <div className="md:w-5/12 p-6 flex flex-col justify-between space-y-6 overflow-y-auto bg-white">
          <div className="space-y-5">
            {/* Title & Close */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-indigo-600">
                  {imageData.tag || '主视觉精修'}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  商业级电商场景图
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* E-Commerce Marketing Badges Toggle */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>🔥 一键贴大促营销角标</span>
                <span className="text-[10px] text-rose-500 font-normal">提升点击转化率</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {MARKETING_BADGES.map((b) => {
                  const isNone = b === '无角标';
                  const isSelected = isNone ? activeBadge === null : activeBadge === b;
                  return (
                    <button
                      key={b}
                      onClick={() => setActiveBadge(isNone ? null : b)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-600 text-white shadow-xs font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                      }`}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prompt Display */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">生成提示词 (Prompt)</span>
                <button
                  onClick={handleCopyPrompt}
                  className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>复制</span>
                </button>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 leading-relaxed font-mono">
                {imageData.prompt || '高级自然光影，极简侘寂商业静物摄影'}
              </div>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-400">输出分辨率</div>
                <div className="font-bold text-slate-800 mt-0.5">2048 × 2730 (2K超清)</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-400">适用电商平台</div>
                <div className="font-bold text-slate-800 mt-0.5">天猫 / 淘宝 / 小红书</div>
              </div>
            </div>
          </div>

          {/* Actions Bottom Bar */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                onSendToVideo &&
                  onSendToVideo({
                    svgType: imageData.svgType,
                    customImageUrl: imageData.customImageUrl,
                    palette: imageData.palette,
                    prompt: imageData.prompt
                  });
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>以此图为首帧 · 生成带货视频</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleDownload}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>下载高清无水印主图 (PNG)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
