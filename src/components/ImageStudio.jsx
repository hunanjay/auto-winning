import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  X,
  RefreshCw,
  Film,
  Download,
  ArrowUpRight
} from 'lucide-react';
import { IMAGE_FEED } from '../data/mockData';
import ProductArtwork from './ProductArtwork';
import ImageDetailModal from './ImageDetailModal';

// 内置示例图生成器 (600x600 标准 PNG DataURL，直连阿里百炼 qwen-image-3.0)
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
    ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 12;
    ctx.beginPath();
    ctx.roundRect(140, 80, 320, 440, 36);
    ctx.fillStyle = '#E2E8F0';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#CBD5E1';
    ctx.stroke();
    ctx.restore();

    ctx.beginPath();
    ctx.roundRect(150, 90, 300, 420, 30);
    ctx.fillStyle = '#F1F5F9';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(300, 275, 76, 0, Math.PI * 2);
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 8;
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(295, 368, 10, 32, 5);
    ctx.fillStyle = '#CBD5E1';
    ctx.fill();

    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('10000mAh · MagSafe', 300, 475);
  } else if (type === 'logo_nexus') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 600, 600);
    ctx.strokeStyle = '#0F172A';
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
    name: '充电宝+Logo',
    types: ['powerbank', 'logo_nexus'],
    prompt:
      '将图2的Logo以金属激光镭雕工艺印制在图1充电宝正面中上方位置，放置在北美黑胡桃木办公桌上，午后百叶窗柔和暖光，旁边有咖啡杯与金属钢笔，真实接触阴影，4K商业摄影'
  },
  {
    id: 'beauty_serum',
    name: '精华瓶',
    types: ['serum'],
    prompt:
      '极光紫玻璃精华瓶放置在天然米白色洞石展台上，清晨阳光水波纹投影，微距水珠点缀，高奢护肤品商业摄影'
  },
  {
    id: 'canvas_bag',
    name: '帆布包',
    types: ['bag'],
    prompt:
      '复古油蜡帆布斜挎包放置在原木桌面上，柔和自然侧逆光，展现帆布肌理与牛皮五金细节，温暖美拉德色调商拍'
  }
];

const QUICK_SCENES = [
  { label: '胡桃木桌面', text: '放置在北美黑胡桃木办公桌上，午后百叶窗暖色侧逆光，真实接触阴影' },
  { label: '侘寂洞石', text: '放置在天然米白色侘寂洞石展台上，清晨柔和自然漫反射光，绿植光斑虚化' },
  { label: '黑金礼盒', text: '放置在黑色丝绒内衬的高奢伴手礼盒中，顶部轮廓聚光灯，尊贵商务质感' },
  { label: '极简展台', text: '放置在磨砂亚克力几何展台上，干净高级棚拍柔光，极简电商主图风格' }
];

const RATIOS = ['1:1', '3:4', '4:3', '9:16', '16:9'];

export default function ImageStudio({
  selectedProduct,
  externalPrompt,
  externalRatio,
  onSendToVideo,
  onAddToast
}) {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [ratio, setRatio] = useState('3:4');
  const [count, setCount] = useState(2);
  const [isAiWriting, setIsAiWriting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [batches, setBatches] = useState(IMAGE_FEED);
  const [activeDetailImage, setActiveDetailImage] = useState(null);

  // 默认参考图为空，用户可点击上传或点击右侧示例填入
  useEffect(() => {
    // 保持默认为空
  }, []);

  useEffect(() => {
    if (externalPrompt) setPrompt(externalPrompt);
    if (externalRatio) setRatio(externalRatio);
  }, [externalPrompt, externalRatio]);

  const handleSelectExample = (ex) => {
    const imgs = ex.types.map((t, idx) => ({
      id: `ex-${ex.id}-${idx}-${Date.now()}`,
      url: createSamplePng(t),
      label: idx === 0 ? '商品' : 'Logo'
    }));
    setUploadedImages(imgs);
    setPrompt(ex.prompt);
  };

  // 上传本地图片 (自动光栅化为 600x600 标准 PNG)
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
                label: nextIdx === 0 ? '商品' : 'Logo'
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

  // AI 润色提示词
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
      onAddToast && onAddToast('请上传参考图或输入画面描述');
      return;
    }

    setIsGenerating(true);
    const primaryImg = uploadedImages[0]?.url;
    const secondaryImg = uploadedImages[1]?.url;
    const finalPrompt =
      prompt.trim() || '放置在极简高奢展台上，柔和商业棚拍光影，真实接触阴影，4K超高清细节';

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
          model: 'Qwen-Image-3.0',
          ratio,
          time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
          customImageUrl: aiUrls[0],
          items: aiUrls.map((url, idx) => ({
            id: `gen-img-${Date.now()}-${idx}`,
            customImageUrl: url,
            isFullScene: true,
            tag: `2K #${idx + 1}`,
            palette: 'cream'
          }))
        };

        setBatches((prev) => [newBatch, ...prev]);
        onAddToast && onAddToast(`已生成 ${aiUrls.length} 张商拍图`);
      } else {
        throw new Error(result.message || '生图失败');
      }
    } catch (err) {
      console.error('生图错误:', err);
      onAddToast && onAddToast(`生图失败: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-56px)] w-full bg-[#FAFAFC] overflow-hidden">
      {/* 左侧：极简控制栏 */}
      <aside className="w-[350px] shrink-0 bg-white border-r border-slate-200/60 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* 1. 参考图 */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-slate-900 tracking-tight">
                参考图
              </span>
              <div className="flex items-center gap-1">
                {QUICK_EXAMPLES.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => handleSelectExample(ex)}
                    className="px-2 py-0.5 rounded-md text-[11px] text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                  >
                    {ex.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {uploadedImages.map((img, idx) => (
                <div
                  key={img.id}
                  onClick={() =>
                    setActiveDetailImage({
                      id: img.id,
                      customImageUrl: img.url,
                      tag: idx === 0 ? '图1·商品' : `图${idx + 1}·Logo`,
                      prompt: prompt || '参考图预览',
                      ratio: '1:1',
                      model: '参考原图'
                    })
                  }
                  className="relative group aspect-square rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 overflow-hidden cursor-pointer transition"
                >
                  <img
                    src={img.url}
                    alt={img.label}
                    className="w-full h-full object-contain p-2.5 transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-slate-700 text-[11px] font-medium shadow-2xs">
                    {idx === 0 ? '图1 · 商品' : `图${idx + 1} · Logo`}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedImages((prev) => prev.filter((item) => item.id !== img.id));
                    }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-900/75 hover:bg-slate-900 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {uploadedImages.length < 2 && (
                <label
                  className={`${
                    uploadedImages.length === 0 ? 'col-span-2 py-9' : 'aspect-square'
                  } rounded-2xl border border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-slate-700 cursor-pointer transition`}
                >
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-500 shadow-2xs">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-medium text-slate-700 block">
                      {uploadedImages.length === 0 ? '点击上传商品图或 Logo' : '添加 Logo / 参考图'}
                    </span>
                    {uploadedImages.length === 0 && (
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        支持 0~4 张，不传图则为纯文生图
                      </span>
                    )}
                  </div>
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

            {uploadedImages.length >= 2 && uploadedImages.length < 4 && (
              <label className="w-full py-2 rounded-xl border border-dashed border-slate-200 hover:border-slate-300 bg-slate-50/40 hover:bg-slate-50 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-800 cursor-pointer transition">
                <Plus className="w-3.5 h-3.5" />
                <span>继续添加参考图 ({uploadedImages.length}/4)</span>
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            )}
          </section>

          {/* 2. 画面描述 */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-slate-900 tracking-tight">
                画面描述
              </span>
              <button
                onClick={handleAiPolishPrompt}
                disabled={isAiWriting}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 text-indigo-500 ${isAiWriting ? 'animate-spin' : ''}`} />
                <span>{isAiWriting ? 'AI 润色中...' : 'AI 润色'}</span>
              </button>
            </div>

            <div className="relative rounded-2xl bg-slate-50/70 hover:bg-slate-50 focus-within:bg-white border border-slate-200/80 focus-within:border-slate-900 p-3.5 transition shadow-2xs">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                placeholder="详细描述想要的商拍场景、光影氛围或 Logo 印制位置（例如：放置在北美黑胡桃木办公桌上，午后百叶窗柔和暖光，旁边有咖啡杯，大师级商业摄影真实质感）..."
                className="w-full min-h-[130px] bg-transparent text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
              />
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-400">
                <span>{prompt.length ? `${prompt.length} 字` : '支持文字直接指定主体与场景'}</span>
                {prompt && (
                  <button
                    onClick={() => setPrompt('')}
                    className="hover:text-slate-700 cursor-pointer font-medium"
                  >
                    清空
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {QUICK_SCENES.map((sc) => (
                <button
                  key={sc.label}
                  onClick={() => setPrompt(sc.text)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 text-xs transition cursor-pointer"
                >
                  + {sc.label}
                </button>
              ))}
            </div>
          </section>

          {/* 3. 比例与数量 */}
          <section className="space-y-4">
            <div className="space-y-2">
              <span className="text-[13px] font-semibold text-slate-900 tracking-tight block">
                画面比例
              </span>
              <div className="grid grid-cols-5 gap-1 p-1 rounded-xl bg-slate-100/80">
                {RATIOS.map((r) => {
                  const active = ratio === r;
                  return (
                    <button
                      key={r}
                      onClick={() => setRatio(r)}
                      className={`py-1.5 rounded-lg text-[11px] transition cursor-pointer ${
                        active
                          ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-slate-900 tracking-tight">
                生成数量
              </span>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/80">
                {[1, 2, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setCount(num)}
                    className={`px-3 py-1 rounded-lg text-[11px] transition cursor-pointer ${
                      count === num
                        ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {num} 张
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* 底部生成按钮 */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-semibold text-[13px] flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>生成中 ({count} 张)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>立即生成</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* 右侧：极简画廊流 */}
      <div className="flex-1 h-full overflow-y-auto px-8 py-7">
        <div className="max-w-5xl mx-auto space-y-10 pb-16">
          {/* 生成中占位 */}
          {isGenerating && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-800" />
                <span>正在渲染 {count} 张 2K 商拍图...</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Array.from({ length: count }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-2xl bg-slate-100/90 animate-pulse flex items-center justify-center"
                  >
                    <span className="text-xs text-slate-400">{i + 1} / {count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 作品批次流 */}
          {batches.map((batch) => (
            <div key={batch.id} className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[13px] text-slate-700 font-medium truncate">
                  {batch.prompt}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {batch.ratio}
                  </span>
                  <button
                    onClick={() => {
                      setPrompt(batch.prompt);
                      setRatio(batch.ratio || '3:4');
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-0.5 transition cursor-pointer"
                  >
                    <span>复用</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                    className="group relative aspect-square rounded-2xl overflow-hidden bg-white ring-1 ring-slate-900/5 hover:ring-slate-900/15 hover:shadow-md transition-all cursor-pointer"
                  >
                    {img.isFullScene && img.customImageUrl ? (
                      <img
                        src={img.customImageUrl}
                        alt={img.tag}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <ProductArtwork
                        svgType={batch.svgType}
                        customImageUrl={img.customImageUrl || batch.customImageUrl}
                        palette={img.palette}
                        className="w-full h-full"
                      />
                    )}

                    {/* 悬浮极简操作栏 */}
                    <div className="absolute inset-x-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-between gap-1.5">
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
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900/85 hover:bg-slate-900 text-white text-[11px] font-medium flex items-center gap-1 backdrop-blur-xs cursor-pointer"
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
                          className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-800 shadow-xs backdrop-blur-xs"
                          title="下载原图"
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
