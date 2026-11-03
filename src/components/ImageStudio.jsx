import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  X,
  RefreshCw,
  Film,
  Download,
  Eye
} from 'lucide-react';
import { IMAGE_FEED } from '../data/mockData';
import ProductArtwork from './ProductArtwork';
import ImageDetailModal from './ImageDetailModal';

// 内置示例图生成器 (600x600 标准 PNG DataURL，开箱即用直连阿里百炼 qwen-image-3.0)
const createSamplePng = (type) => {
  const cvs = document.createElement('canvas');
  cvs.width = 600;
  cvs.height = 600;
  const ctx = cvs.getContext('2d');
  if (!ctx) return '';

  if (type === 'powerbank') {
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, 600, 600);
    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.15)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 14;
    ctx.beginPath();
    ctx.roundRect(140, 80, 320, 440, 36);
    ctx.fillStyle = '#E2E8F0';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#94A3B8';
    ctx.stroke();
    ctx.restore();

    ctx.beginPath();
    ctx.roundRect(150, 90, 300, 420, 30);
    ctx.fillStyle = '#F1F5F9';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(300, 275, 76, 0, Math.PI * 2);
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 9;
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(295, 368, 10, 32, 5);
    ctx.fillStyle = '#CBD5E1';
    ctx.fill();

    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('10000mAh · MagSafe Fast Charge', 300, 475);
  } else if (type === 'logo_nexus') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 600, 600);
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 14;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(300, 140);
    ctx.lineTo(160, 210);
    ctx.lineTo(300, 280);
    ctx.lineTo(440, 210);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(160, 270);
    ctx.lineTo(300, 340);
    ctx.lineTo(440, 270);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(160, 330);
    ctx.lineTo(300, 400);
    ctx.lineTo(440, 330);
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.font = '900 42px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NEXUS', 300, 480);
  } else if (type === 'serum') {
    ctx.fillStyle = '#FAF5FF';
    ctx.fillRect(0, 0, 600, 600);
    ctx.fillStyle = '#1E1B4B';
    ctx.beginPath();
    ctx.roundRect(272, 95, 56, 75, 24);
    ctx.fill();
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.roundRect(250, 165, 100, 34, 8);
    ctx.fill();
    const grad = ctx.createLinearGradient(190, 200, 410, 500);
    grad.addColorStop(0, '#8B5CF6');
    grad.addColorStop(1, '#4F46E5');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(190, 198, 220, 300, 42);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.beginPath();
    ctx.roundRect(225, 285, 150, 130, 12);
    ctx.fill();
    ctx.fillStyle = '#1E1B4B';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LUMIÈRE', 300, 345);
    ctx.font = '600 12px system-ui, sans-serif';
    ctx.fillStyle = '#6366F1';
    ctx.fillText('ESSENCE SERUM', 300, 375);
  } else {
    ctx.fillStyle = '#FDF8F3';
    ctx.fillRect(0, 0, 600, 600);
    ctx.fillStyle = '#C29B61';
    ctx.beginPath();
    ctx.roundRect(140, 190, 320, 260, 24);
    ctx.fill();
    ctx.strokeStyle = '#8C6239';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = '#D4AF7A';
    ctx.beginPath();
    ctx.roundRect(145, 190, 310, 120, 20);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#78350F';
    ctx.fillRect(200, 270, 26, 95);
    ctx.fillRect(374, 270, 26, 95);
  }
  return cvs.toDataURL('image/png');
};

const QUICK_EXAMPLES = [
  {
    id: '3c_gift',
    name: '充电宝 + Logo',
    types: ['powerbank', 'logo_nexus'],
    prompt: '将图2的Logo以金属激光镭雕工艺印制在图1充电宝正面中上方位置，放置在北美黑胡桃木办公桌上，午后百叶窗柔和暖光，旁边有咖啡杯与金属钢笔，真实接触阴影，4K商业摄影'
  },
  {
    id: 'beauty_serum',
    name: '护肤精华瓶',
    types: ['serum'],
    prompt: '极光紫玻璃精华瓶放置在天然米白色洞石展台上，清晨阳光水波纹投影，微距水珠点缀，高奢护肤品商业摄影'
  },
  {
    id: 'canvas_bag',
    name: '复古帆布包',
    types: ['bag'],
    prompt: '复古油蜡帆布斜挎包放置在原木桌面上，柔和自然侧逆光，展现帆布肌理与牛皮五金细节，温暖美拉德色调商拍'
  }
];

const QUICK_SCENES = [
  { label: '胡桃木办公桌', text: '放置在北美黑胡桃木办公桌上，午后百叶窗暖色侧逆光，真实接触阴影' },
  { label: '侘寂洞石晨光', text: '放置在天然米白色侘寂洞石展台上，清晨柔和自然漫反射光，绿植光斑虚化' },
  { label: '黑金丝绒礼盒', text: '放置在黑色丝绒内衬的高奢伴手礼盒中，顶部轮廓聚光灯，尊贵商务质感' },
  { label: '极简几何展台', text: '放置在磨砂亚克力几何展台上，干净高级棚拍柔光，极简电商主图风格' }
];

const RATIOS = [
  { id: '1:1', w: 14, h: 14 },
  { id: '3:4', w: 12, h: 16 },
  { id: '4:3', w: 16, h: 12 },
  { id: '9:16', w: 10, h: 17 },
  { id: '16:9', w: 17, h: 10 }
];

export default function ImageStudio({
  selectedProduct,
  externalPrompt,
  externalRatio,
  onSendToVideo,
  onAddToast
}) {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [ratio, setRatio] = useState('1:1');
  const [count, setCount] = useState(2);
  const [isAiWriting, setIsAiWriting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [batches, setBatches] = useState(IMAGE_FEED);
  const [activeDetailImage, setActiveDetailImage] = useState(null);

  // 默认载入第一组示例，开箱即可直接点“立即生成”
  useEffect(() => {
    setUploadedImages([
      { id: 'init-1', url: createSamplePng('powerbank'), label: '图1·商品' },
      { id: 'init-2', url: createSamplePng('logo_nexus'), label: '图2·Logo' }
    ]);
    setPrompt(QUICK_EXAMPLES[0].prompt);
  }, []);

  useEffect(() => {
    if (externalPrompt) setPrompt(externalPrompt);
    if (externalRatio) setRatio(externalRatio);
  }, [externalPrompt, externalRatio]);

  const handleSelectExample = (ex) => {
    const imgs = ex.types.map((t, idx) => ({
      id: `ex-${ex.id}-${idx}-${Date.now()}`,
      url: createSamplePng(t),
      label: idx === 0 ? '图1·商品' : `图${idx + 1}·Logo/参考`
    }));
    setUploadedImages(imgs);
    setPrompt(ex.prompt);
  };

  // 上传本地图片 (自动光栅化为 600x600 标准 PNG 确保百炼 API 100% 兼容)
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.slice(0, 4 - uploadedImages.length).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const rawUrl = ev.target?.result;
        if (!rawUrl) return;
        const img = new Image();
        img.onload = () => {
          const cvs = document.createElement('canvas');
          cvs.width = 600;
          cvs.height = 600;
          const ctx = cvs.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, 600, 600);
            const scale = Math.min(520 / (img.width || 300), 520 / (img.height || 300));
            const w = (img.width || 300) * scale;
            const h = (img.height || 300) * scale;
            ctx.drawImage(img, (600 - w) / 2, (600 - h) / 2, w, h);
          }
          const cleanPng = cvs.toDataURL('image/png');
          setUploadedImages((prev) => {
            if (prev.length >= 4) return prev;
            const nextIdx = prev.length;
            return [
              ...prev,
              {
                id: `up-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                url: cleanPng,
                label: nextIdx === 0 ? '图1·商品' : `图${nextIdx + 1}·Logo/参考`
              }
            ];
          });
        };
        img.src = rawUrl;
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  // AI 帮写提示词 (调用百炼 Qwen3.6-Flash)
  const handleAiPolishPrompt = async () => {
    setIsAiWriting(true);
    try {
      const seed = prompt.trim() || selectedProduct?.name || '高颜值电商商品静物摄影';
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content:
                '你是资深电商商业摄影提示词专家。请将用户的简短描述润色为一段画面感极强的商拍生图提示词（包含台面材质、环境光影、景深构图），只输出提示词正文，控制在90字以内。'
            },
            { role: 'user', content: seed }
          ]
        })
      });

      if (!res.ok || !res.body) throw new Error('AI 帮写暂不可用');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setPrompt(text.trim());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiWriting(false);
    }
  };

  // 核心生图：调用 /api/generate-scene (阿里百炼 Qwen-Image-3.0)
  const handleGenerate = async () => {
    if (!prompt.trim() && uploadedImages.length === 0) {
      onAddToast && onAddToast('⚠️ 请上传商品参考图或输入画面提示词');
      return;
    }

    setIsGenerating(true);
    const primaryImg = uploadedImages[0]?.url;
    const secondaryImg = uploadedImages[1]?.url;
    const finalPrompt = prompt.trim() || '放置在极简高奢展台上，柔和商业棚拍光影，真实接触阴影，4K超高清细节';

    try {
      const res = await fetch('http://localhost:3001/api/generate-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseImageUrl: primaryImg || undefined,
          logoImageUrl: secondaryImg || undefined,
          prompt: finalPrompt,
          n: count,
          noiseLevel: 300
        })
      });

      const result = await res.json();
      if (result.code === 0 && result.data?.images?.length) {
        const aiUrls = result.data.images;
        const newBatch = {
          id: `batch-gen-${Date.now()}`,
          prompt: finalPrompt,
          model: 'Qwen-Image-3.0 (2K直出)',
          ratio,
          time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
          customImageUrl: aiUrls[0],
          items: [
            ...aiUrls.map((url, idx) => ({
              id: `gen-img-${Date.now()}-${idx}`,
              customImageUrl: url,
              isFullScene: true,
              tag: `生成图 ${idx + 1}`,
              palette: 'cream'
            })),
            ...uploadedImages.map((u, idx) => ({
              id: `gen-in-${Date.now()}-${idx}`,
              customImageUrl: u.url,
              isFullScene: true,
              tag: `参考${u.label}`,
              palette: 'glacier'
            }))
          ]
        };

        setBatches((prev) => [newBatch, ...prev]);
        onAddToast && onAddToast(`🎉 成功生成 ${aiUrls.length} 张 2K 商拍大图`);
      } else {
        throw new Error(result.message || '生图失败');
      }
    } catch (err) {
      console.error('生图错误:', err);
      onAddToast && onAddToast(`⚠️ 生图异常: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-56px)] w-full bg-[#F5F6FA] overflow-hidden">
      {/* 左侧：极简生图操作面板 (仅保留 1.传图 2.提示词 3.比例与生成按钮) */}
      <div className="w-[340px] shrink-0 bg-white border-r border-slate-200/80 flex flex-col h-full">
        {/* 顶部标题 */}
        <div className="h-12 px-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-sm font-extrabold text-slate-900">AI 商拍生图</span>
          <button
            onClick={() => {
              setUploadedImages([]);
              setPrompt('');
            }}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-600 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
          >
            <Plus className="w-3 h-3" /> 清空重置
          </button>
        </div>

        {/* 核心表单区 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* 1. 商品参考图 (支持单张商品图，或商品图 + Logo 双图) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-slate-800 border-l-2 border-indigo-600 pl-2">
                1. 参考图（商品图 / Logo）
              </span>
              <span className="text-[11px] text-slate-400">{uploadedImages.length}/4 张</span>
            </div>

            <div className="rounded-2xl bg-[#F8F9FC] border border-dashed border-slate-300 p-3 space-y-2.5">
              {uploadedImages.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {uploadedImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative group aspect-square rounded-xl bg-white border border-slate-200 overflow-hidden"
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-contain p-1" />
                      <span className="absolute bottom-0 inset-x-0 bg-slate-900/70 text-white text-[9px] text-center py-0.5">
                        {img.label}
                      </span>
                      <button
                        onClick={() =>
                          setUploadedImages((prev) => prev.filter((item) => item.id !== img.id))
                        }
                        className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                  {uploadedImages.length < 4 && (
                    <label className="aspect-square rounded-xl border border-dashed border-indigo-300 bg-white hover:bg-indigo-50/40 flex flex-col items-center justify-center gap-1 text-indigo-600 cursor-pointer transition">
                      <Plus className="w-4 h-4" />
                      <span className="text-[10px] font-semibold">添加图片</span>
                      <input
                        type="file"
                        multiple
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  )}
                </div>
              ) : (
                <label className="py-5 flex flex-col items-center justify-center gap-1.5 cursor-pointer">
                  <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">点击上传商品图或 Logo</span>
                  <span className="text-[10px] text-slate-400">支持单图换背景，或「商品+Logo」双图融合</span>
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              )}

              {/* 3 个一键示例 */}
              <div className="pt-2 border-t border-slate-200/70 flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 shrink-0">示例:</span>
                {QUICK_EXAMPLES.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => handleSelectExample(ex)}
                    className="flex-1 py-1 px-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-[10px] font-semibold text-slate-600 hover:text-indigo-600 truncate transition cursor-pointer"
                  >
                    {ex.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. 画面提示词 (Prompt) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-slate-800 border-l-2 border-indigo-600 pl-2">
                2. 画面提示词
              </span>
              <button
                onClick={handleAiPolishPrompt}
                disabled={isAiWriting}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3 h-3 ${isAiWriting ? 'animate-spin' : ''}`} />
                {isAiWriting ? '润色中...' : 'AI帮写'}
              </button>
            </div>

            <div className="rounded-2xl bg-[#F8F9FC] border border-slate-200/90 p-2.5 focus-within:border-indigo-500 focus-within:bg-white transition">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="输入场景、光影或融合指令（例如：将图2的Logo印在图1产品正中央，放在胡桃木办公桌上，柔和侧逆光...）"
                className="w-full bg-transparent text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
              />
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-400">
                <span>支持直接描述 Logo 印制位置</span>
                {prompt && (
                  <button
                    onClick={() => setPrompt('')}
                    className="hover:text-slate-600 cursor-pointer"
                    title="清空提示词"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 4 个常用场景快捷词 */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {QUICK_SCENES.map((sc) => (
                <button
                  key={sc.label}
                  onClick={() => setPrompt(sc.text)}
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 text-[10px] font-medium transition cursor-pointer"
                >
                  + {sc.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. 图像比例与出图张数 */}
          <div>
            <div className="text-xs font-extrabold text-slate-800 border-l-2 border-indigo-600 pl-2 mb-2">
              3. 比例与数量
            </div>
            <div className="rounded-2xl bg-[#F8F9FC] border border-slate-200/90 p-3 space-y-3">
              <div className="grid grid-cols-5 gap-1.5">
                {RATIOS.map((r) => {
                  const active = ratio === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setRatio(r.id)}
                      className={`py-1.5 rounded-lg border flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                        active
                          ? 'border-indigo-600 bg-white text-indigo-600 font-bold shadow-2xs'
                          : 'border-slate-200/80 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <div
                        style={{ width: `${r.w}px`, height: `${r.h}px` }}
                        className={`rounded-[2px] border ${
                          active ? 'border-indigo-600 bg-indigo-100' : 'border-slate-400'
                        }`}
                      />
                      <span className="text-[10px] leading-none">{r.id}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-600 font-medium">生成张数</span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => setCount(num)}
                      className={`px-3 py-1 rounded-lg border text-xs font-bold transition cursor-pointer ${
                        count === num
                          ? 'border-indigo-600 bg-white text-indigo-600 shadow-2xs'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {num}张
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部悬浮生成按钮 */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3 rounded-full bg-gradient-to-r from-[#6366F1] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>正在生成 ({count} 张 2K 大图)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>立即生成</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 右侧：生成结果流画廊 */}
      <div className="flex-1 h-full overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6 pb-16">
          {/* 实时生成加载卡片 */}
          {isGenerating && (
            <div className="rounded-2xl bg-white border border-indigo-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-600">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>正在调用阿里云百炼 Qwen-Image-3.0 渲染 2K 商拍大图...</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: count }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl bg-slate-100 animate-pulse flex flex-col items-center justify-center gap-2 border border-slate-200"
                  >
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs text-slate-500 font-medium">
                      生成中 {i + 1}/{count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 历史与最新生成记录列表 */}
          {batches.map((batch) => (
            <div
              key={batch.id}
              className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-2xs space-y-3.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-bold text-slate-800 truncate max-w-xl">
                    {batch.prompt}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold shrink-0">
                    {batch.model}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-bold shrink-0">
                    {batch.ratio}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setPrompt(batch.prompt);
                    setRatio(batch.ratio || '1:1');
                  }}
                  className="text-xs text-indigo-600 hover:underline font-semibold shrink-0 cursor-pointer"
                >
                  复用提示词
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {batch.items.map((img) => (
                  <div
                    key={img.id}
                    onClick={() =>
                      setActiveDetailImage({
                        ...img,
                        prompt: batch.prompt,
                        ratio: batch.ratio,
                        model: batch.model
                      })
                    }
                    className="group relative aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-200/80 hover:shadow-md transition cursor-pointer"
                  >
                    {img.isFullScene && img.customImageUrl ? (
                      <img
                        src={img.customImageUrl}
                        alt={img.tag}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <ProductArtwork
                        svgType={batch.svgType}
                        customImageUrl={img.customImageUrl || batch.customImageUrl}
                        palette={img.palette}
                        className="w-full h-full"
                      />
                    )}

                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-semibold backdrop-blur-xs">
                      {img.tag}
                    </div>

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                      <span className="p-1.5 rounded-lg bg-white/90 text-slate-700 shadow flex items-center justify-center">
                        <Eye className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 transition flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSendToVideo &&
                            onSendToVideo({
                              prompt: batch.prompt,
                              tag: img.tag,
                              customImageUrl: img.customImageUrl
                            });
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-slate-900/90 text-white text-[11px] font-bold flex items-center justify-center gap-1 backdrop-blur-xs cursor-pointer"
                      >
                        <Film className="w-3 h-3" /> 转视频
                      </button>
                      {img.customImageUrl && (
                        <a
                          href={img.customImageUrl}
                          download={`auto-winning-${img.id}.png`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg bg-white/90 text-slate-800 hover:bg-white shadow"
                          title="下载图片"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 大图预览弹窗 */}
      <ImageDetailModal
        item={activeDetailImage}
        onClose={() => setActiveDetailImage(null)}
        onSendToVideo={(imgItem) => {
          setActiveDetailImage(null);
          onSendToVideo && onSendToVideo(imgItem);
        }}
      />
    </div>
  );
}
