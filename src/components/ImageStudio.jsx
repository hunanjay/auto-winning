import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowUp,
  Video,
  Download,
  RefreshCw,
  Layers,
  Maximize2,
  Palette,
  Plus,
  Eye
} from 'lucide-react';
import { PRODUCTS, IMAGE_FEED } from '../data/mockData';
import ProductArtwork from './ProductArtwork';

export default function ImageStudio({
  selectedProduct,
  onSelectProduct,
  externalPrompt,
  onSendToVideo,
  onAddToast
}) {
  const [batches, setBatches] = useState(IMAGE_FEED);
  const [prompt, setPrompt] = useState(selectedProduct.prompt);
  const [ratio, setRatio] = useState('3:4');
  const [palette, setPalette] = useState(selectedProduct.palette);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [compareCutoutId, setCompareCutoutId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setPrompt(selectedProduct.prompt);
    setPalette(selectedProduct.palette);
  }, [selectedProduct]);

  useEffect(() => {
    if (externalPrompt) {
      setPrompt(externalPrompt);
    }
  }, [externalPrompt]);

  const ratios = ['1:1', '3:4', '9:16', '16:9'];
  const paletteOptions = [
    { id: 'lavender', label: '极光紫韵', dot: 'bg-violet-400' },
    { id: 'cream', label: '奶油侘寂', dot: 'bg-amber-200' },
    { id: 'botanical', label: '森系晨露', dot: 'bg-emerald-300' },
    { id: 'glacier', label: '冰川冷调', dot: 'bg-sky-300' },
    { id: 'rose', label: '南法玫瑰', dot: 'bg-rose-300' }
  ];

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      const newBatch = {
        id: `batch-${Date.now()}`,
        prompt,
        model: 'Seedream 3.0 电商版',
        ratio,
        time: '刚刚',
        svgType: selectedProduct.svgType,
        items: [
          { id: `g-${Date.now()}-1`, palette, tag: '主视觉' },
          { id: `g-${Date.now()}-2`, palette: 'cream', tag: '洞石光影' },
          { id: `g-${Date.now()}-3`, palette: 'botanical', tag: '自然水雾' },
          { id: `g-${Date.now()}-4`, palette: 'rose', tag: '柔光微距' }
        ]
      };
      setBatches((prev) => [newBatch, ...prev]);
      setIsGenerating(false);
      onAddToast('已生成 4 张商品图');
    }, 700);
  };

  return (
    <div className="relative min-h-full pb-44 space-y-8">
      {/* Generated Batches Stream (Jimeng Creation Feed Style) */}
      <div className="space-y-8">
        {batches.map((batch) => (
          <div key={batch.id} className="space-y-3">
            {/* Minimal Prompt Header Line */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2 min-w-0 max-w-3xl">
                <p className="text-xs font-medium text-slate-700 truncate">{batch.prompt}</p>
                <span className="px-2 py-0.5 rounded-md bg-slate-200/70 text-[11px] text-slate-500 shrink-0">
                  {batch.model}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-200/70 text-[11px] text-slate-500 shrink-0">
                  {batch.ratio}
                </span>
              </div>

              <button
                onClick={() => setPrompt(batch.prompt)}
                className="text-xs text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                复用提示词
              </button>
            </div>

            {/* 4-Image Clean Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              {batch.items.map((img) => {
                const isCutout = compareCutoutId === img.id;
                return (
                  <div
                    key={img.id}
                    className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-all"
                  >
                    <ProductArtwork
                      svgType={batch.svgType}
                      palette={img.palette}
                      isCutout={isCutout}
                      badge={isCutout ? '白底原图' : ''}
                      className="w-full h-full"
                    />

                    {/* Hover Floating Action Bar (Only appears on hover) */}
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between gap-1.5 z-20">
                      <button
                        onClick={() =>
                          onSendToVideo({
                            svgType: batch.svgType,
                            palette: img.palette,
                            prompt: batch.prompt
                          })
                        }
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-semibold text-[11px] flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <Video className="w-3 h-3 text-indigo-600" />
                        <span>图生视频</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            setCompareCutoutId(isCutout ? null : img.id)
                          }
                          title="对比白底原图"
                          className="w-7 h-7 rounded-lg bg-white/85 hover:bg-white text-slate-700 flex items-center justify-center shadow-sm cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onAddToast('已下载高清大图')}
                          title="下载高清图"
                          className="w-7 h-7 rounded-lg bg-white/85 hover:bg-white text-slate-700 flex items-center justify-center shadow-sm cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Jimeng Signature Floating Bottom Omnibox (即梦底部悬浮输入舱) */}
      <div className="fixed bottom-5 left-[84px] right-4 z-30 flex justify-center pointer-events-none">
        <div className="w-full max-w-4xl bg-white/92 backdrop-blur-2xl border border-slate-200/90 rounded-3xl shadow-[0_16px_48px_rgba(15,23,42,0.1)] p-3.5 pointer-events-auto">
          {/* Product Picker Popover */}
          {showProductPicker && (
            <div className="mb-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-2 overflow-x-auto">
              <span className="text-[11px] text-slate-400 px-2 shrink-0">切换商品主体：</span>
              {PRODUCTS.map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => {
                    onSelectProduct(prod);
                    setShowProductPicker(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                    prod.id === selectedProduct.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200/70 hover:bg-slate-100'
                  }`}
                >
                  <span>{prod.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Top Row: Reference Product Slot + Prompt Input */}
          <div className="flex items-start gap-3">
            {/* Reference Image Thumbnail Slot (+ 参考商品图) */}
            <button
              onClick={() => setShowProductPicker(!showProductPicker)}
              className="group relative w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0 flex flex-col items-center justify-center hover:border-indigo-400 transition-colors cursor-pointer"
              title="点击切换商品白底图"
            >
              <ProductArtwork
                svgType={selectedProduct.svgType}
                isCutout={true}
                className="w-full h-full"
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/55 text-[9px] text-white text-center py-0.5">
                参考图
              </div>
            </button>

            {/* Clean Prompt Input */}
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              placeholder="描述你想要的商品场景与光影，例如：清晨阳光洞石展台、微距水珠..."
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none py-1 leading-relaxed"
            />
          </div>

          {/* Bottom Row: Compact Capsule Parameter Pills + Send Button */}
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Model Pill */}
              <div className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>图片 3.0 电商版</span>
              </div>

              {/* Aspect Ratio Selector Pills */}
              <div className="flex items-center bg-slate-100 rounded-full p-0.5">
                {ratios.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRatio(r)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      ratio === r
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Palette Tone Pills */}
              <div className="hidden sm:flex items-center gap-1 bg-slate-100 rounded-full px-2 py-1">
                <Palette className="w-3.5 h-3.5 text-slate-400 mr-0.5" />
                {paletteOptions.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPalette(p.id)}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                      palette === p.id
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${p.dot}`} />
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Jimeng Circular/Capsule Send Button */}
            <button
              onClick={handleGenerate}
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
                  <span>生成</span>
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
