import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowUp,
  Video,
  Download,
  RefreshCw,
  Palette,
  Eye,
  Link2,
  Plus,
  Flame,
  Maximize2
} from 'lucide-react';
import { PRODUCTS, IMAGE_FEED, VIRAL_INSPIRATIONS } from '../data/mockData';
import ProductArtwork from './ProductArtwork';
import ImageDetailModal from './ImageDetailModal';

const ECOMMERCE_SCENES = [
  {
    name: '侘寂洞石',
    palette: 'cream',
    promptSnippet: '极简米白洞石天然展台，午后百叶窗柔和侧逆光，高级护肤静物大片'
  },
  {
    name: '法式阳光',
    palette: 'rose',
    promptSnippet: '法式复古阳光露台，微风光斑，香槟暖调，高级生活美学电商图'
  },
  {
    name: '森系水雾',
    palette: 'botanical',
    promptSnippet: '翠绿清凉晨露溪流，苔藓原木微距水雾，天然纯净成分主图'
  },
  {
    name: '冰川冷调',
    palette: 'glacier',
    promptSnippet: '冰川蓝透明亚克力几何展台，冷调轮廓光，未来科技数码棚拍'
  },
  {
    name: '节日大促',
    palette: 'festive',
    promptSnippet: '双11红色金色大促喜庆展台，柔和暖金光环，高转化爆款主图'
  }
];

export default function ImageStudio({
  selectedProduct,
  allProducts = [],
  onSelectProduct,
  externalPrompt,
  externalRatio,
  customTemplates = [],
  onOpenCreateTemplate,
  onOpenAddProduct,
  onSendToVideo,
  onAddToast
}) {
  const [batches, setBatches] = useState(IMAGE_FEED);
  const [prompt, setPrompt] = useState(selectedProduct.prompt);
  const [ratio, setRatio] = useState('3:4');
  const [palette, setPalette] = useState(selectedProduct.palette);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [tplSizeFilter, setTplSizeFilter] = useState('全部');
  const [compareCutoutId, setCompareCutoutId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDetailImage, setActiveDetailImage] = useState(null);

  useEffect(() => {
    setPrompt(selectedProduct.prompt);
    setPalette(selectedProduct.palette);
  }, [selectedProduct]);

  useEffect(() => {
    if (externalPrompt) {
      setPrompt(externalPrompt);
    }
  }, [externalPrompt]);

  useEffect(() => {
    if (externalRatio) {
      setRatio(externalRatio);
    }
  }, [externalRatio]);

  const ratios = ['1:1', '3:4', '9:16', '16:9'];
  const paletteOptions = [
    { id: 'lavender', label: '极光紫韵', dot: 'bg-violet-400' },
    { id: 'cream', label: '奶油侘寂', dot: 'bg-amber-200' },
    { id: 'botanical', label: '森系晨露', dot: 'bg-emerald-300' },
    { id: 'glacier', label: '冰川冷调', dot: 'bg-sky-300' },
    { id: 'rose', label: '南法玫瑰', dot: 'bg-rose-300' },
    { id: 'festive', label: '大促红金', dot: 'bg-red-400' }
  ];

  const allAvailableTemplates = [...customTemplates, ...VIRAL_INSPIRATIONS];
  const filteredPopupTemplates = allAvailableTemplates.filter(
    (t) => tplSizeFilter === '全部' || (t.ratio || '3:4') === tplSizeFilter
  );

  const getCardAspect = (r) => {
    if (r === '1:1') return 'aspect-square';
    if (r === '9:16') return 'aspect-[9/14]';
    if (r === '16:9') return 'aspect-[16/10]';
    return 'aspect-[3/4]';
  };

  const handleApplyScene = (scene) => {
    setPalette(scene.palette);
    setPrompt(`${selectedProduct.name}，${scene.promptSnippet}`);
    onAddToast && onAddToast(`已应用「${scene.name}」电商高光场景`);
  };

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
        customImageUrl: selectedProduct.customImageUrl,
        items: [
          { id: `g-${Date.now()}-1`, palette, tag: '主视觉精修' },
          { id: `g-${Date.now()}-2`, palette: 'cream', tag: '洞石光影' },
          { id: `g-${Date.now()}-3`, palette: 'botanical', tag: '自然水雾' },
          { id: `g-${Date.now()}-4`, palette: 'rose', tag: '柔光微距' }
        ]
      };
      setBatches((prev) => [newBatch, ...prev]);
      setIsGenerating(false);
      onAddToast(`已生成 4 张 (${ratio}) 电商精修主图`);
    }, 700);
  };

  return (
    <div className="relative min-h-full pb-52 space-y-8">
      {/* Generated Batches Stream */}
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
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-[11px] text-indigo-600 font-mono font-semibold shrink-0">
                  {batch.ratio}
                </span>
              </div>

              <button
                onClick={() => {
                  setPrompt(batch.prompt);
                  setRatio(batch.ratio);
                }}
                className="text-xs text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                复用提示词与尺寸
              </button>
            </div>

            {/* 4-Image Clean Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              {batch.items.map((img) => {
                const isCutout = compareCutoutId === img.id;
                const fullItemData = {
                  ...img,
                  prompt: batch.prompt,
                  ratio: batch.ratio,
                  svgType: batch.svgType,
                  customImageUrl: batch.customImageUrl
                };

                return (
                  <div
                    key={img.id}
                    onClick={() => setActiveDetailImage(fullItemData)}
                    className={`group relative ${getCardAspect(batch.ratio)} rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-all cursor-pointer`}
                  >
                    <ProductArtwork
                      svgType={batch.svgType}
                      customImageUrl={batch.customImageUrl}
                      palette={img.palette}
                      isCutout={isCutout}
                      badge={isCutout ? '白底原图' : ''}
                      className="w-full h-full"
                    />

                    {/* Top Right Zoom Pill */}
                    <div className="absolute top-2.5 right-2.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="px-2 py-1 rounded-lg bg-black/50 backdrop-blur-md text-white text-[10px] font-semibold flex items-center gap-1 shadow-sm">
                        <Maximize2 className="w-3 h-3" />
                        <span>高清对比</span>
                      </div>
                    </div>

                    {/* Hover Floating Action Bar */}
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between gap-1.5 z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSendToVideo({
                            svgType: batch.svgType,
                            customImageUrl: batch.customImageUrl,
                            palette: img.palette,
                            prompt: batch.prompt
                          });
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-semibold text-[11px] flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <Video className="w-3 h-3 text-indigo-600" />
                        <span>图生视频</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCompareCutoutId(isCutout ? null : img.id);
                          }}
                          title="对比白底原图"
                          className="w-7 h-7 rounded-lg bg-white/85 hover:bg-white text-slate-700 flex items-center justify-center shadow-sm cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDetailImage(fullItemData);
                          }}
                          title="大图详情与下载"
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

      {/* Floating Bottom Omnibox with E-Commerce Scene Quick Bar */}
      <div className="fixed bottom-5 left-[196px] right-4 z-30 flex flex-col items-center pointer-events-none gap-2">
        {/* Top Quick Scene Presets Pill Bar for E-Commerce Sellers */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-full px-3 py-1.5 shadow-md flex items-center gap-1.5 pointer-events-auto overflow-x-auto max-w-4xl">
          <span className="text-[11px] font-bold text-slate-400 px-1 shrink-0 flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-500" />
            <span>爆款电商场景：</span>
          </span>
          {ECOMMERCE_SCENES.map((scene) => (
            <button
              key={scene.name}
              onClick={() => handleApplyScene(scene)}
              className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 transition-colors shrink-0 cursor-pointer"
            >
              {scene.name}
            </button>
          ))}
        </div>

        {/* Main Floating Omnibox */}
        <div className="w-full max-w-4xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl shadow-[0_16px_48px_rgba(15,23,42,0.1)] p-3.5 pointer-events-auto">
          {/* Product Picker Popover */}
          {showProductPicker && (
            <div className="mb-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-2 overflow-x-auto">
              <span className="text-[11px] text-slate-400 px-2 shrink-0">切换商品主体：</span>
              {(allProducts.length ? allProducts : PRODUCTS).map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => {
                    onSelectProduct(prod);
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
                <span>+ 上传我的商品</span>
              </button>
            </div>
          )}

          {/* Reference Template Picker Popover with Dimension Filter */}
          {showTemplatePicker && (
            <div className="mb-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-400 mr-1">按尺寸筛选模版：</span>
                  {['全部', '1:1', '3:4', '9:16', '16:9'].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setTplSizeFilter(sz)}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium cursor-pointer ${
                        tplSizeFilter === sz
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-600 border border-slate-200/70 hover:bg-slate-100'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setShowTemplatePicker(false);
                    onOpenCreateTemplate && onOpenCreateTemplate();
                  }}
                  className="px-3 py-1 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>粘贴链接新建模版</span>
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {filteredPopupTemplates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => {
                      setPrompt(tpl.prompt);
                      if (tpl.palette) setPalette(tpl.palette);
                      if (tpl.ratio) setRatio(tpl.ratio);
                      setShowTemplatePicker(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200/80 text-xs font-medium text-slate-700 shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 font-mono text-[10px] text-indigo-600">
                      {tpl.ratio || '3:4'}
                    </span>
                    <span>{tpl.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Top Row: Reference Product Slot + Prompt Input */}
          <div className="flex items-start gap-3">
            <button
              onClick={() => {
                setShowProductPicker(!showProductPicker);
                setShowTemplatePicker(false);
              }}
              className="group relative w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0 flex flex-col items-center justify-center hover:border-indigo-400 transition-colors cursor-pointer"
              title="点击切换商品主体或添加新商品"
            >
              <ProductArtwork
                svgType={selectedProduct.svgType}
                customImageUrl={selectedProduct.customImageUrl}
                isCutout={true}
                className="w-full h-full"
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[9px] text-white text-center py-0.5">
                切商品
              </div>
            </button>

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
              placeholder="描述商品场景与光影，或点击下方「参考模版」按尺寸筛选或粘贴链接自动生成..."
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none py-1 leading-relaxed"
            />
          </div>

          {/* Bottom Row: Compact Capsule Parameter Pills + Send Button */}
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => {
                  setShowTemplatePicker(!showTemplatePicker);
                  setShowProductPicker(false);
                }}
                className="px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>爆款模版 ({allAvailableTemplates.length})</span>
              </button>

              <div className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>图片 3.0 电商版</span>
              </div>

              {/* Ratios */}
              <div className="flex items-center bg-slate-100 rounded-full p-0.5">
                {ratios.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRatio(r)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      ratio === r
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Palette */}
              <div className="hidden lg:flex items-center gap-1 bg-slate-100 rounded-full px-2 py-1">
                <Palette className="w-3.5 h-3.5 text-slate-400 mr-0.5" />
                {paletteOptions.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPalette(p.id)}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                      palette === p.id
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${p.dot}`} />
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

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

      {/* Image Detail & Before/After Slider Modal */}
      <ImageDetailModal
        isOpen={Boolean(activeDetailImage)}
        imageData={activeDetailImage}
        onClose={() => setActiveDetailImage(null)}
        onSendToVideo={onSendToVideo}
        onAddToast={onAddToast}
      />
    </div>
  );
}
