import React, { useState, useRef } from 'react';
import {
  Link2,
  Sparkles,
  Upload,
  X,
  Check,
  Image as ImageIcon,
  Video,
  Wand2,
  RefreshCw,
  BookmarkPlus
} from 'lucide-react';
import ProductArtwork from './ProductArtwork';

const SAMPLE_LINKS = [
  {
    label: '小红书万赞·木质香薰笔记',
    url: 'https://www.xiaohongshu.com/explore/6729a1b8000000001e03f91a',
    parsed: {
      title: '法式阳光洞石 · 极简木质香薰模版',
      category: '家居美妆',
      svgType: 'serum',
      palette: 'cream',
      ratio: '3:4',
      hook: '“一进屋就被闺蜜追着问链接！把五星级酒店大堂香搬回家✨”',
      sellingPoints: ['天然植物精油', '留香90天', '侘寂风高颜值瓶身'],
      prompt: '琥珀色玻璃香薰瓶置于天然米白洞石托盘上，旁边摆放干枯尤加利叶，午后百叶窗温暖阳光斜射，柔和阴影，小红书高赞极简静物摄影'
    }
  },
  {
    label: '抖音爆款·冰川降噪耳机商品链',
    url: 'https://v.douyin.com/iY8kLm2p/',
    parsed: {
      title: '赛博冰川悬浮 · 数码3C高点击模版',
      category: '数码',
      svgType: 'headphone',
      palette: 'glacier',
      ratio: '9:16',
      hook: '“戴上它的一瞬间，整个地铁车厢的噪音直接消失了！”',
      sellingPoints: ['-52dB深海降噪', '钛金属轻量化', '65h超长续航'],
      prompt: '银白钛金属头戴降噪耳机悬浮于冰川蓝透明亚克力晶体上方，周围环绕柔和声波光环，冷调高级商业棚拍光影，8K超清细节'
    }
  },
  {
    label: '天猫旗舰·早八便携咖啡机链接',
    url: 'https://detail.tmall.com/item.htm?id=8291048291',
    parsed: {
      title: '原木暖阳油脂 · 小家电种草模版',
      category: '家电',
      svgType: 'coffee',
      palette: 'apricot',
      ratio: '3:4',
      hook: '“打工人早八续命神器！30秒鲜萃出比咖啡店还厚的黄金油脂☕️”',
      sellingPoints: ['20Bar高压萃取', '胶囊/咖啡粉通用', '无线车载露营'],
      prompt: '奶油白意式便携咖啡机放在胡桃木桌面上，正在萃取出金黄浓稠咖啡液流入冰块牛奶杯中，清晨阳光洒满桌面，温暖治愈系主图'
    }
  }
];

export default function CreateTemplateModal({
  isOpen,
  onClose,
  onSaveTemplate,
  onSaveAndUseImage,
  onSaveAndUseVideo
}) {
  const [inputUrl, setInputUrl] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [hasParsed, setHasParsed] = useState(false);

  const [title, setTitle] = useState('清晨柔光水波纹 · 爆款主图模版');
  const [category, setCategory] = useState('美妆');
  const [svgType, setSvgType] = useState('serum');
  const [palette, setPalette] = useState('lavender');
  const [ratio, setRatio] = useState('3:4');
  const [hook, setHook] = useState('“熬夜垮脸急救！一抹化水直接锁住整晚胶原感✨”');
  const [prompt, setPrompt] = useState(
    '极光紫色玻璃精华瓶，天然白色洞石展台，清晨阳光水波纹投影，微距水珠，极简高级护肤广告'
  );
  const [customImageUrl, setCustomImageUrl] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleSmartParse = (presetObj = null) => {
    const targetUrl = presetObj ? presetObj.url : inputUrl;
    if (!targetUrl.trim() && !presetObj) return;

    setIsParsing(true);
    if (presetObj) {
      setInputUrl(presetObj.url);
    }

    setTimeout(() => {
      const matched =
        presetObj?.parsed ||
        (targetUrl.includes('douyin')
          ? SAMPLE_LINKS[1].parsed
          : targetUrl.includes('tmall') || targetUrl.includes('taobao')
          ? SAMPLE_LINKS[2].parsed
          : SAMPLE_LINKS[0].parsed);

      setTitle(matched.title);
      setCategory(matched.category);
      setSvgType(matched.svgType);
      setPalette(matched.palette);
      setRatio(matched.ratio);
      setHook(matched.hook);
      setPrompt(matched.prompt);
      setIsParsing(false);
      setHasParsed(true);
    }, 550);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCustomImageUrl(reader.result);
      setHasParsed(true);
    };
    reader.readAsDataURL(file);
  };

  const buildTemplatePayload = () => ({
    id: `tpl-${Date.now()}`,
    type: 'video',
    isCustom: true,
    category,
    title: title || '自定义参考模版',
    likes: '我的模版',
    retention: '高转化',
    aspect: 'aspect-[3/4]',
    svgType,
    palette,
    ratio,
    hook,
    prompt,
    customImageUrl
  });

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200/80 p-6 sm:p-7 space-y-5 max-h-[92vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookmarkPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">新建我的参考模版</h2>
              <p className="text-xs text-slate-400">
                粘贴商品/小红书/抖音链接自动反推提示词，或上传参考图沉淀为专属模版
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

        {/* Step 1: One-Click Link Smart Parser Box */}
        <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="粘贴淘宝/抖音商品链接、或小红书爆文链接，AI 自动提取同款模版..."
                className="w-full bg-white border border-slate-200/90 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={() => handleSmartParse()}
              disabled={isParsing}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              {isParsing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>解析中...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>一键解析</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Demo Link Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400">试试一键解析示例：</span>
            {SAMPLE_LINKS.map((sample, i) => (
              <button
                key={i}
                onClick={() => handleSmartParse(sample)}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 text-[11px] text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Visual Reference Preview + Extracted Template Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Left Visual Card + Local Upload */}
          <div className="md:col-span-5 space-y-2.5">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group">
              {customImageUrl ? (
                <img
                  src={customImageUrl}
                  alt="Custom reference"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ProductArtwork
                  svgType={svgType}
                  palette={palette}
                  badge={hasParsed ? 'AI 已反推构图' : '模版预览'}
                  className="w-full h-full"
                />
              )}

              {/* Upload local image overlay button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-3 inset-x-3 z-20 py-2 rounded-xl bg-white/90 hover:bg-white backdrop-blur-md text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                <span>上传本地参考图</span>
              </button>
            </div>

            {/* Quick Palette Switcher */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] text-slate-400">模版光影色调</span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'lavender', color: 'bg-violet-400' },
                  { id: 'cream', color: 'bg-amber-200' },
                  { id: 'botanical', color: 'bg-emerald-300' },
                  { id: 'glacier', color: 'bg-sky-300' },
                  { id: 'rose', color: 'bg-rose-300' }
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setCustomImageUrl(null);
                      setPalette(p.id);
                    }}
                    className={`w-5 h-5 rounded-full ${p.color} border-2 transition-transform cursor-pointer ${
                      palette === p.id && !customImageUrl
                        ? 'border-slate-900 scale-110'
                        : 'border-white'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Extracted Form Fields */}
          <div className="md:col-span-7 space-y-3.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                模版名称
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                黄金前3秒痛点/种草文案 (AI 自动提炼)
              </label>
              <input
                type="text"
                value={hook}
                onChange={(e) => setHook(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-slate-400">
                  反推画面提示词 Prompt (生图/生视频通用)
                </label>
                <span className="text-[10px] text-indigo-600 font-medium">已自动优化光影词</span>
              </div>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-700 leading-relaxed focus:outline-none focus:bg-white focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Ratio Pills */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">默认画幅比例</span>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-full">
                {['1:1', '3:4', '9:16', '16:9'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRatio(r)}
                    className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${
                      ratio === r ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
          <button
            onClick={() => {
              const tpl = buildTemplatePayload();
              onSaveTemplate(tpl);
              onClose();
            }}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>仅保存至「我的模版」</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const tpl = buildTemplatePayload();
                onSaveAndUseImage(tpl);
                onClose();
              }}
              className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>保存并立即生图</span>
            </button>

            <button
              onClick={() => {
                const tpl = buildTemplatePayload();
                onSaveAndUseVideo(tpl);
                onClose();
              }}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Video className="w-3.5 h-3.5" />
              <span>保存并立即生视频</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
