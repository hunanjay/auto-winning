import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  Sparkles,
  Check,
  Tag,
  Package,
  Plus,
  ShoppingBag,
  Layers
} from 'lucide-react';
import ProductArtwork from './ProductArtwork';

const CATEGORIES = ['美妆护肤', '数码3C', '食品生鲜', '服饰穿搭', '家居小电', '个护家清'];

const PRESET_DEMO_PRODUCTS = [
  {
    name: '复古微单数码相机',
    category: '数码3C',
    svgType: 'headphone',
    palette: 'glacier',
    sellingPoints: ['4K超清录制', '复古旁轴外观', '轻量便携'],
    prompt: '银黑复古旁轴数码相机，置于深色胡桃木桌面，侧光勾勒金属机械机身质感，极简数码博主桌面摄影'
  },
  {
    name: '山茶花锁温保温杯',
    category: '家居小电',
    svgType: 'serum',
    palette: 'cream',
    sellingPoints: ['24h长效锁温', '316L医用不锈钢', '陶瓷内胆不挑饮品'],
    prompt: '奶油白极简保温杯置于浅色洞石展台，旁边放着新鲜山茶花枝，清晨柔和侧逆光，温暖治愈系电商主图'
  }
];

export default function AddProductModal({
  isOpen,
  onClose,
  onAddProduct
}) {
  const fileInputRef = useRef(null);
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('美妆护肤');
  const [customImage, setCustomImage] = useState(null);
  const [sellingPoints, setSellingPoints] = useState(['爆款现货', '品质保障']);
  const [newTagInput, setNewTagInput] = useState('');
  const [basePrompt, setBasePrompt] = useState(
    '放置在高级纯净米白展台上，柔和商业摄影棚光影，高清微距质感'
  );

  if (!isOpen) return null;

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setCustomImage(evt.target.result);
      if (!productName) {
        const autoName = file.name.replace(/\.[^/.]+$/, '').slice(0, 15);
        setProductName(autoName);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    if (!sellingPoints.includes(newTagInput.trim())) {
      setSellingPoints([...sellingPoints, newTagInput.trim()]);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tag) => {
    setSellingPoints(sellingPoints.filter((t) => t !== tag));
  };

  const handleApplyPreset = (preset) => {
    setProductName(preset.name);
    setCategory(preset.category);
    setSellingPoints(preset.sellingPoints);
    setBasePrompt(preset.prompt);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productName.trim()) return;

    const newProduct = {
      id: `prod-custom-${Date.now()}`,
      name: productName.trim(),
      category,
      svgType: 'serum', // fallback
      customImageUrl: customImage || null,
      palette: 'cream',
      sellingPoints,
      prompt: `${productName.trim()}，${basePrompt}`
    };

    onAddProduct(newProduct);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200/80 p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>添加店铺新商品</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-semibold">
                  全链路可用
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                上传您的商品实拍或白底图，工作台将自动为您生成场景主图与带货短视频
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
            {/* Left Image Upload Area */}
            <div className="sm:col-span-5 flex flex-col items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50/80 hover:bg-indigo-50/30 transition-all flex flex-col items-center justify-center p-3 relative cursor-pointer overflow-hidden group"
              >
                {customImage ? (
                  <>
                    <img
                      src={customImage}
                      alt="预览商品"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-medium gap-1">
                      <Upload className="w-4 h-4" />
                      <span>点击更换图片</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200/80 flex items-center justify-center text-indigo-600 mb-2 group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">上传商品实拍图</span>
                    <span className="text-[10px] text-slate-400 mt-1">
                      支持拖拽 PNG/JPG/WebP<br />AI 自动发丝级白底抠图
                    </span>
                  </div>
                )}
              </div>

              {/* Preset fill button */}
              <div className="mt-2 text-center">
                <span className="text-[10px] text-slate-400">没有商品图？可试用演示商品：</span>
                <div className="flex items-center gap-1.5 mt-1 justify-center">
                  {PRESET_DEMO_PRODUCTS.map((p) => (
                    <button
                      type="button"
                      key={p.name}
                      onClick={() => handleApplyPreset(p)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition-colors cursor-pointer"
                    >
                      {p.name.slice(0, 6)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Information Form */}
            <div className="sm:col-span-7 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  商品名称 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：极简磨砂保温杯 450ml"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">商品类目</label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        category === cat
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selling Points Tag Input */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  核心卖点标签 (用于自动提炼电商文案)
                </label>
                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                  {sellingPoints.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-medium"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-rose-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="输入卖点回车添加，如：留香72小时、防水防汗"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    添加
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  默认场景生成提示词 (可自定义)
                </label>
                <textarea
                  rows={2}
                  value={basePrompt}
                  onChange={(e) => setBasePrompt(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>保存并立即应用到工作台</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
