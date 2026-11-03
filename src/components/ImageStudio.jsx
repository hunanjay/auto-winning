import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  Plus,
  Trash2,
  BookOpen,
  Copy,
  ChevronRight,
  HelpCircle,
  Eye,
  Check,
  X,
  RefreshCw,
  LayoutGrid,
  List as ListIcon,
  Calendar,
  Film,
  Download,
  Wand2,
  Layers,
  Image as ImageIcon,
  FileText,
  SlidersHorizontal,
  ArrowUpRight
} from 'lucide-react';
import { IMAGE_FEED } from '../data/mockData';
import ProductArtwork from './ProductArtwork';
import ImageDetailModal from './ImageDetailModal';

// 内置高保真示例商品图生成器 (生成 600x600 标准 PNG DataURL，开箱即用直连阿里百炼 qwen-image-3.0)
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
    // 3-layer diamond icon
    ctx.beginPath();
    ctx.moveTo(300, 130);
    ctx.lineTo(160, 200);
    ctx.lineTo(300, 270);
    ctx.lineTo(440, 200);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(160, 260);
    ctx.lineTo(300, 330);
    ctx.lineTo(440, 260);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(160, 320);
    ctx.lineTo(300, 390);
    ctx.lineTo(440, 320);
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.font = '900 44px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NEXUS TECH', 300, 475);
  } else if (type === 'serum') {
    ctx.fillStyle = '#FAF5FF';
    ctx.fillRect(0, 0, 600, 600);
    // Dropper cap
    ctx.fillStyle = '#1E1B4B';
    ctx.beginPath();
    ctx.roundRect(272, 95, 56, 75, 24);
    ctx.fill();
    // Gold collar
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.roundRect(250, 165, 100, 34, 8);
    ctx.fill();
    // Bottle body
    const grad = ctx.createLinearGradient(190, 200, 410, 500);
    grad.addColorStop(0, '#8B5CF6');
    grad.addColorStop(1, '#4F46E5');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(190, 198, 220, 300, 42);
    ctx.fill();
    // Label
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
    // Vintage Canvas Bag
    ctx.fillStyle = '#FDF8F3';
    ctx.fillRect(0, 0, 600, 600);
    ctx.fillStyle = '#C29B61';
    ctx.beginPath();
    ctx.roundRect(140, 190, 320, 260, 24);
    ctx.fill();
    ctx.strokeStyle = '#8C6239';
    ctx.lineWidth = 4;
    ctx.stroke();
    // Flap
    ctx.fillStyle = '#D4AF7A';
    ctx.beginPath();
    ctx.roundRect(145, 190, 310, 120, 20);
    ctx.fill();
    ctx.stroke();
    // Straps
    ctx.fillStyle = '#78350F';
    ctx.fillRect(200, 270, 26, 95);
    ctx.fillRect(374, 270, 26, 95);
  }
  return cvs.toDataURL('image/png');
};

// 预设示例组 (点击即可一键载入多视角/双图商品组)
const EXAMPLE_GROUPS = [
  {
    id: '3c_gift',
    name: '3C 充电宝 + 品牌 Logo',
    types: ['powerbank', 'logo_nexus'],
    info: '商品名称：磁吸无线快充移动电源（企业定制版）\n商品卖点：10000mAh大容量、15W磁吸无线快充、航空级阳极氧化铝磨砂外壳、支持表面金属激光镭雕定制企业Logo\n适用场景：高管胡桃木办公桌、商务伴手礼盒、科技极简展台',
    extra: '请将图2的品牌Logo以金属激光镭雕工艺自然印制在图1充电宝正面中上方位置，生成包含主图与桌面场景图的电商套图'
  },
  {
    id: 'beauty_serum',
    name: '高奢护肤精华瓶',
    types: ['serum'],
    info: '商品名称：LUMIÈRE 极光紫抗氧修护精华液 30ml\n商品卖点：高浓度花青素抗氧、水感轻盈秒吸收、法国天然植萃配方、熬夜急救焕亮肌肤\n目标受众：22-40岁都市精致护肤人群',
    extra: '放置在天然白色洞石展台上，清晨柔和阳光水波纹投影，微距水珠与薰衣草花瓣点缀，高级感美妆商拍套图'
  },
  {
    id: 'canvas_bag',
    name: '复古帆布通勤包',
    types: ['bag'],
    info: '商品名称：Vintage 复古重磅油蜡帆布斜挎邮差包\n商品卖点：16安士防泼水加密帆布、头层牛皮皮扣、加宽减压肩带、多隔层大容量可放14寸笔记本\n目标受众：复古穿搭爱好者、城市通勤青年',
    extra: '生成复古美拉德色调电商主图与皮质五金细节特写图，突出帆布纹理与耐磨五金质感'
  }
];

// 词库快捷标签
const PROMPT_DICTIONARY = [
  '高奢北美黑胡桃木桌面',
  '天然米白侘寂洞石展台',
  '金属激光镭雕品牌Logo',
  '午后百叶窗暖调侧逆光',
  '微距材质纹理高光特写',
  '黑金丝绒伴手礼盒内衬',
  '清晨柔和自然漫反射光',
  '极光蓝紫科技感几何展台'
];

// 更多设置选项
const COUNTRIES = ['中国', '美国', '英国', '德国', '日本', '巴西', '沙特阿拉伯', '越南', '韩国'];
const LANGUAGES = ['中文', '英语', '德语', '西班牙语', '日语', '法语', '韩语', '纯视觉无文字'];
const PLATFORMS = ['淘宝', '亚马逊', '拼多多', '抖音', '小红书', '京东', 'Temu', 'Shopee', 'Shopify'];
const THEME_COLORS = [
  { id: 'smart', label: '智能主题色', gradient: 'from-pink-500 via-amber-400 to-indigo-500' },
  { id: 'warm', label: '美拉德暖棕', gradient: 'from-amber-700 to-yellow-600' },
  { id: 'silver', label: '极简科技银', gradient: 'from-slate-500 to-slate-300' },
  { id: 'festive', label: '东方国潮红', gradient: 'from-red-600 to-amber-500' }
];
const FONT_STYLES = ['智能字体风格', '极简无衬线体', '优雅衬线体', '力量粗体/营销体', '手写/书法体'];

// 图像比例选项 (带微缩框比例尺寸)
const ASPECT_RATIOS = [
  { id: '1:1', w: 14, h: 14 },
  { id: '4:3', w: 16, h: 12 },
  { id: '3:4', w: 12, h: 16 },
  { id: '4:5', w: 13, h: 16 },
  { id: '9:16', w: 10, h: 17 },
  { id: '16:9', w: 17, h: 10 },
  { id: '3:2', w: 16, h: 11 },
  { id: '2:3', w: 11, h: 16 }
];

// 右侧「做同款」瀑布流营销海报数据 (复刻潮际好麦 5 列瀑布流卡片风格)
const WATERFALL_SHOWCASES = [
  {
    id: 'wf-1',
    title: 'Vintage Canvas Design',
    subtitle: '复古重磅油蜡帆布通勤包 · 卖点总览主图',
    badges: ['多隔层大容量', '头层牛皮五金', '减压宽肩带'],
    category: '箱包皮具 · 主图',
    aspect: 'aspect-[3/4]',
    bg: 'from-[#D7C4A8] via-[#B89F7D] to-[#8C7051]',
    textColor: 'text-[#2B1E11]',
    sampleGroup: 'canvas_bag',
    ratio: '3:4',
    prompt: '复古重磅油蜡帆布斜挎包，放置在复古木质工作台上，暖调电影感布光，展示多重收纳口袋与黄铜五金细节，高级电商主图海报'
  },
  {
    id: 'wf-2',
    title: '6-in-1 Tactical Tool',
    subtitle: '多功能精密折叠工具 · 结构分解尺寸图',
    badges: ['航空钛合金', '人体工学防滑柄', '便携背夹'],
    category: '3C数码五金 · 辅图',
    aspect: 'aspect-[4/3]',
    bg: 'from-[#F0F7FF] via-[#E0EFFC] to-[#D1E6FA]',
    textColor: 'text-slate-900',
    sampleGroup: '3c_gift',
    ratio: '4:3',
    prompt: '极简白底工业设计产品结构展示图，清晰展示金属倒角与阳极氧化铝表面工艺，蓝白科技感标注视觉风格'
  },
  {
    id: 'wf-3',
    title: '喜乐东方 · 国风伴手礼盒',
    subtitle: '红金撞色东方美学 · 节日大促首屏海报',
    badges: ['皮质手提', '烫金镂空花窗', '佳节臻礼'],
    category: '节庆礼盒 · 首屏海报',
    aspect: 'aspect-square',
    bg: 'from-[#8B1E1E] via-[#A92626] to-[#6E1212]',
    textColor: 'text-amber-100',
    sampleGroup: '3c_gift',
    ratio: '1:1',
    prompt: '高奢东方红金撞色礼盒场景，金色中式屏风与暖色灯笼光斑背景，丝绸纹理台面，尊贵企业年会伴手礼商业摄影'
  },
  {
    id: 'wf-4',
    title: 'LUMIÈRE 水光焕亮精华',
    subtitle: '法国植萃抗氧配方 · 28天焕亮水光肌',
    badges: ['微距水珠', '花青素抗氧', '0酒精温和'],
    category: '美妆护肤 · 种草图',
    aspect: 'aspect-[3/4]',
    bg: 'from-[#F3E8FF] via-[#E9D5FF] to-[#DDD6FE]',
    textColor: 'text-indigo-950',
    sampleGroup: 'beauty_serum',
    ratio: '3:4',
    prompt: '极光紫色玻璃精华瓶立于天然白色洞石展台，清晨阳光透过水面形成波光投影，微距水珠晶莹剔透，高奢护肤品广告大片'
  },
  {
    id: 'wf-5',
    title: 'EXQUISITE CRAFTSMANSHIP',
    subtitle: '航空铝CNC精雕 + 金属激光镭雕工艺特写',
    badges: ['0.02mm精雕', '耐磨防汗涂层', '定制企业标'],
    category: '3C科技礼品 · 细节图',
    aspect: 'aspect-[4/3]',
    bg: 'from-[#1E293B] via-[#0F172A] to-[#020617]',
    textColor: 'text-white',
    sampleGroup: '3c_gift',
    ratio: '4:3',
    prompt: '暗调高奢黑金商业摄影，微距特写阳极氧化铝磁吸充电宝表面激光镭雕Logo细节，冷调蓝白边缘轮廓光勾勒金属质感'
  },
  {
    id: 'wf-6',
    title: '传承经典 · 城市户外冲锋衣',
    subtitle: '三防科技面料 · 专为青年群体定制版型',
    badges: ['轻盈锁温', '防风拒水', '自在出行'],
    category: '服饰穿搭 · 详情长图',
    aspect: 'aspect-[9/16]',
    bg: 'from-[#CBD5E1] via-[#94A3B8] to-[#475569]',
    textColor: 'text-slate-900',
    sampleGroup: 'canvas_bag',
    ratio: '9:16',
    prompt: '户外松林晨雾自然光场景，展现机能防风面料挺括版型与防水水珠细节，杂志感Lookbook电商详情页海报'
  },
  {
    id: 'wf-7',
    title: '甄选头层牛皮 · 软糯细腻触感',
    subtitle: '双金属搭扣厚底防滑 · 5.0cm 隐形增高',
    badges: ['微弹乳胶垫', 'PU中底+TPU外底', '久走不累'],
    category: '鞋靴箱包 · 材质图',
    aspect: 'aspect-[3/4]',
    bg: 'from-[#F5F2EB] via-[#E8E2D5] to-[#D6CFC2]',
    textColor: 'text-stone-900',
    sampleGroup: 'canvas_bag',
    ratio: '3:4',
    prompt: '极简奶油侘寂风展台，近距离展示头层牛皮细腻毛孔光泽与金属搭扣反光，柔和顶光与自然阴影，高转化详情页材质图'
  },
  {
    id: 'wf-8',
    title: '高管桌面 · 磁吸快充伴手礼',
    subtitle: '15W 极速磁吸 · 商务出行全天候续航',
    badges: ['企业Logo定制', 'N52强力磁芯', '低温快充'],
    category: '3C数码 · 场景主图',
    aspect: 'aspect-square',
    bg: 'from-[#452B1F] via-[#2E1C14] to-[#1A0F0A]',
    textColor: 'text-amber-50',
    sampleGroup: '3c_gift',
    ratio: '1:1',
    prompt: '放在高档北美黑胡桃木高管办公桌上，午后百叶窗暖色柔和侧逆光，旁边有金属钢笔与咖啡杯，真实接触阴影，4K商业摄影大片'
  }
];

export default function ImageStudio({
  selectedProduct,
  externalPrompt,
  externalRatio,
  onSendToVideo,
  onAddToast
}) {
  // 左侧最外层子工具导航：'product-set' (商品套图) | 'planting' (一键种草图) | 'scene' (百变场景) | 'record' (生成记录)
  const [subNav, setSubNav] = useState('product-set');

  // 上传的多视角商品图 / 品牌 Logo 列表 (最多 10 张)
  const [uploadedImages, setUploadedImages] = useState([]);
  // 商品信息 (名称、描述、卖点)
  const [productInfo, setProductInfo] = useState('');
  // 额外描述 (具体镜头、Logo融合位置、风格要求)
  const [extraPrompt, setExtraPrompt] = useState('');
  // 词库弹窗开关
  const [showDict, setShowDict] = useState(false);
  // AI 帮写加载状态
  const [isAiWriting, setIsAiWriting] = useState(false);

  // 更多设置抽屉开关与配置项
  const [showMoreSettings, setShowMoreSettings] = useState(false);
  const [country, setCountry] = useState('中国');
  const [language, setLanguage] = useState('中文');
  const [platform, setPlatform] = useState('淘宝');
  const [themeColor, setThemeColor] = useState(THEME_COLORS[0]);
  const [fontStyle, setFontStyle] = useState('智能字体风格');

  // 创作模式：'smart' (智能套图) | 'custom' (自定义套图)
  const [createMode, setCreateMode] = useState('smart');

  // 主图辅图配置
  const [mainCount, setMainCount] = useState(2);
  const [mainSmartCopy, setMainSmartCopy] = useState(true);
  const [mainQuality, setMainQuality] = useState('2K高清');
  const [mainRatio, setMainRatio] = useState('1:1');

  // A+/详情页图配置
  const [detailCount, setDetailCount] = useState(2);
  const [detailSmartCopy, setDetailSmartCopy] = useState(true);
  const [detailQuality, setDetailQuality] = useState('2K高清');
  const [detailRatio, setDetailRatio] = useState('3:4');

  // 非必填复选框
  const [useCustomModel, setUseCustomModel] = useState(false);
  const [useStyleRef, setUseStyleRef] = useState(false);

  // 生图状态与历史批次记录
  const [isGenerating, setIsGenerating] = useState(false);
  const [batches, setBatches] = useState(IMAGE_FEED);
  const [activeDetailImage, setActiveDetailImage] = useState(null);

  // 生成记录页视图模式：'list' | 'grid'
  const [recordViewMode, setRecordViewMode] = useState('list');
  const [recordFilterType, setRecordFilterType] = useState('all');

  // 初始化默认载入第一组示例图（方便用户直接点击“立即生成”体验）
  useEffect(() => {
    const prodPng = createSamplePng('powerbank');
    const logoPng = createSamplePng('logo_nexus');
    setUploadedImages([
      { id: 'init-1', url: prodPng, label: '主商品图' },
      { id: 'init-2', url: logoPng, label: '品牌Logo' }
    ]);
    setProductInfo(EXAMPLE_GROUPS[0].info);
    setExtraPrompt(EXAMPLE_GROUPS[0].extra);
  }, []);

  // 响应从爆款库/会话传来的外部同款指令
  useEffect(() => {
    if (externalPrompt) {
      setExtraPrompt(externalPrompt);
    }
    if (externalRatio) {
      setMainRatio(externalRatio);
    }
  }, [externalPrompt, externalRatio]);

  // 载入示例商品组
  const handleSelectExampleGroup = (group) => {
    const imgs = group.types.map((t, idx) => ({
      id: `sample-${group.id}-${idx}-${Date.now()}`,
      url: createSamplePng(t),
      label: idx === 0 ? '主商品图' : idx === 1 ? '品牌Logo/辅图' : `视角图${idx + 1}`
    }));
    setUploadedImages(imgs);
    setProductInfo(group.info);
    setExtraPrompt(group.extra);
    onAddToast && onAddToast(`已载入「${group.name}」示例商品图与卖点信息`);
  };

  // 上传本地多视角商品图或品牌 Logo (自动光栅化为 600x600 标准 PNG 确保百炼 100% 兼容)
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.slice(0, 10 - uploadedImages.length).forEach((file) => {
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
            if (prev.length >= 10) return prev;
            const nextIdx = prev.length;
            return [
              ...prev,
              {
                id: `upload-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                url: cleanPng,
                label: nextIdx === 0 ? '主商品图' : nextIdx === 1 ? 'Logo/辅图2' : `商品图${nextIdx + 1}`
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

  // 调用后端阿里百炼 Qwen3.6-Flash 进行「AI 帮写」商品卖点与套图构图描述
  const handleAiWriteInfo = async () => {
    setIsAiWriting(true);
    try {
      const seedText = productInfo.trim() || selectedProduct?.name || '高颜值电商爆款商品';
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content:
                '你是资深电商视觉总监。请根据用户的简短商品线索，输出结构化的【商品名称】、【核心卖点】、【目标受众】和【高转化套图场景建议】，控制在140字以内，精炼直接。'
            },
            {
              role: 'user',
              content: `请帮我扩写以下商品的电商套图信息（目标平台：${platform}，语种：${language}）：\n${seedText}`
            }
          ]
        })
      });

      if (!res.ok || !res.body) throw new Error('AI 帮写服务暂不可用');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setProductInfo(accumulated.trim());
      }
      onAddToast && onAddToast('✨ AI 帮写已完成商品卖点与视觉规划提炼');
    } catch (err) {
      console.error(err);
      setProductInfo(
        `商品名称：${selectedProduct?.name || '旗舰级定制爆款单品'}\n核心卖点：大师级工业设计质感、核心性能全面升级、高颜值礼盒包装\n目标受众：追求品质生活的都市白领与礼赠人群\n视觉建议：采用胡桃木/洞石自然光影展台，突出材质肌理与品牌高级感`
      );
    } finally {
      setIsAiWriting(false);
    }
  };

  // 核心生图：调用后端 /api/generate-scene (阿里百炼 Qwen-Image-3.0) 一键生成电商套图
  const handleGenerateProductSet = async () => {
    if (uploadedImages.length === 0) {
      onAddToast && onAddToast('⚠️ 请先上传至少 1 张商品图（或点击上方示例图一键载入）');
      return;
    }

    setIsGenerating(true);
    const primaryImg = uploadedImages[0].url;
    const secondaryLogoOrAngleImg = uploadedImages[1]?.url;

    const copyRule = mainSmartCopy
      ? `并在画面合适留白处融入符合【${platform}】平台高转化风格的【${language}】电商营销排版意境（字体风格：${fontStyle}，主题色调：${themeColor.label}）`
      : '纯商业摄影视觉呈现，画面不添加任何文字水印';

    const combinedPrompt = [
      productInfo.trim(),
      extraPrompt.trim(),
      `目标市场：${country}，适配平台：${platform}，主图比例：${mainRatio}，${copyRule}，4K超高清商业摄影大片`
    ]
      .filter(Boolean)
      .join('；');

    try {
      const res = await fetch('http://localhost:3001/api/generate-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseImageUrl: primaryImg,
          logoImageUrl: secondaryLogoOrAngleImg || undefined,
          craftPrompt:
            extraPrompt.trim() ||
            '请将图2的品牌Logo或细节特征自然融合印制到图1产品表面醒目位置，呈现真实物理材质高光与立体透视阴影',
          prompt: combinedPrompt,
          n: Math.min(Math.max(mainCount, 1), 4),
          noiseLevel: 300
        })
      });

      const result = await res.json();
      if (result.code === 0 && result.data?.images?.length) {
        const aiUrls = result.data.images;
        const roleLabels = ['主图 · 首屏高转化视觉', '详情页 · 首屏场景海报', '详情页 · 材质微距特写', '辅图 · 种草氛围图'];

        const newBatch = {
          id: `batch-set-${Date.now()}`,
          prompt: combinedPrompt,
          productInfo: productInfo.trim() || '电商商品套图任务',
          model: `Qwen-Image-3.0 (${mainQuality} · ${platform}套图)`,
          ratio: mainRatio,
          platform,
          language,
          time: new Date().toLocaleString('zh-CN', { hour12: false }),
          inputImages: uploadedImages.map((u) => u.url),
          customImageUrl: aiUrls[0],
          items: [
            ...aiUrls.map((url, idx) => ({
              id: `set-img-${Date.now()}-${idx}`,
              customImageUrl: url,
              isFullScene: true,
              tag: roleLabels[idx % roleLabels.length],
              palette: 'cream'
            })),
            ...uploadedImages.slice(0, 2).map((u, idx) => ({
              id: `set-input-${Date.now()}-${idx}`,
              customImageUrl: u.url,
              isFullScene: true,
              tag: `输入原图 ${idx + 1} (${u.label})`,
              palette: 'glacier'
            }))
          ]
        };

        setBatches((prev) => [newBatch, ...prev]);
        onAddToast && onAddToast(`🎉 商品套图生成成功！已直出 ${aiUrls.length} 张 ${mainQuality} 电商视觉大图`);
      } else {
        throw new Error(result.message || '套图生成失败');
      }
    } catch (err) {
      console.error('商品套图生成错误:', err);
      onAddToast && onAddToast(`⚠️ 生图异常: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 点击右侧「做同款」卡片一键填充左侧配置栏
  const handleMakeSameFromWaterfall = (card) => {
    const group = EXAMPLE_GROUPS.find((g) => g.id === card.sampleGroup) || EXAMPLE_GROUPS[0];
    handleSelectExampleGroup(group);
    setExtraPrompt(card.prompt);
    setMainRatio(card.ratio || '3:4');
    setSubNav('product-set');
  };

  // 新建任务重置
  const handleResetTask = () => {
    setUploadedImages([]);
    setProductInfo('');
    setExtraPrompt('');
  };

  return (
    <div className="relative flex h-[calc(100vh-56px)] w-full bg-[#F5F6FA] overflow-hidden select-none">
      {/* 1. 最左侧窄版图标导航栏 (复刻潮际好麦左侧四宫格工具条) */}
      <div className="w-[68px] shrink-0 bg-white border-r border-slate-200/80 flex flex-col items-center py-3 gap-2 z-20">
        {[
          { id: 'product-set', label: '商品套图', badge: '效果升级', icon: Layers },
          { id: 'planting', label: '一键种草图', icon: Sparkles },
          { id: 'scene', label: '百变场景图', icon: Wand2 },
          { id: 'record', label: '生成记录', icon: FileText }
        ].map((item) => {
          const Icon = item.icon;
          const active = subNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSubNav(item.id)}
              className={`relative w-14 py-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                active
                  ? 'bg-indigo-50/90 text-indigo-600 font-bold shadow-2xs'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              {item.badge && (
                <span className="absolute -top-1 right-0.5 px-1 py-0.2 rounded-full bg-slate-800 text-white text-[8px] font-bold leading-tight">
                  {item.badge}
                </span>
              )}
              <Icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-slate-500'}`} />
              <span className="text-[10px] tracking-tight leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. 中左核心配置侧边栏 (仅在非生成记录页展示，或常驻左侧) */}
      {subNav !== 'record' && (
        <div className="relative w-[365px] shrink-0 bg-white border-r border-slate-200/80 flex flex-col h-full z-10">
          {/* 顶部标题栏：商品套图 + 使用教程 + 新建任务 */}
          <div className="h-13 px-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-extrabold text-slate-900">
                {subNav === 'product-set' ? '商品套图' : subNav === 'planting' ? '一键种草图' : '百变场景图'}
              </h2>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[11px] font-semibold">
                使用教程
              </span>
            </div>
            <button
              onClick={handleResetTask}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> 新建任务
            </button>
          </div>

          {/* 中部可滚动表单区 */}
          <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-4">
            {/* 模块一：商品图上传 (支持多视角商品图 + 品牌 Logo) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-slate-800 border-l-2 border-indigo-600 pl-2">
                  商品图
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-semibold">
                  最多10张 ({uploadedImages.length}/10)
                </span>
              </div>

              <div className="rounded-2xl bg-[#F8F9FC] border border-dashed border-slate-300 hover:border-indigo-400 p-3 transition">
                {/* 已上传图片网格预览 */}
                {uploadedImages.length > 0 ? (
                  <div className="mb-2.5">
                    <div className="grid grid-cols-4 gap-2">
                      {uploadedImages.map((img, idx) => (
                        <div
                          key={img.id}
                          className="relative group aspect-square rounded-xl bg-white border border-slate-200 overflow-hidden shadow-2xs"
                        >
                          <img src={img.url} alt={img.label} className="w-full h-full object-contain p-1" />
                          <span className="absolute bottom-0 inset-x-0 bg-slate-900/70 text-white text-[9px] text-center py-0.5 truncate">
                            {idx === 0 ? '图1·商品' : idx === 1 ? '图2·Logo/辅' : img.label}
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

                      {uploadedImages.length < 10 && (
                        <label className="aspect-square rounded-xl border border-dashed border-indigo-300 bg-white hover:bg-indigo-50/40 flex flex-col items-center justify-center gap-0.5 text-indigo-600 cursor-pointer transition">
                          <Plus className="w-4 h-4" />
                          <span className="text-[9px] font-semibold">添加图片</span>
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
                  </div>
                ) : (
                  <label className="py-4 flex flex-col items-center justify-center cursor-pointer">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                      <Plus className="w-4 h-4 text-slate-700" />
                      <span>上传 / 或拖拽至此 / 粘贴【多视角商品图】</span>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-slate-200/80 text-slate-600 text-[11px] font-medium">
                      支持同时上传商品原图 + 品牌 Logo
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                )}

                {/* 示例快速载入栏 (复刻潮际好麦示例缩略图组) */}
                <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 shrink-0">
                    <span>示例</span>
                    <Eye className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                    {EXAMPLE_GROUPS.map((grp) => (
                      <button
                        key={grp.id}
                        onClick={() => handleSelectExampleGroup(grp)}
                        className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-[10px] font-semibold text-slate-700 hover:text-indigo-600 truncate transition cursor-pointer"
                      >
                        {grp.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 底部 Tips 提示语 */}
                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate">
                    <strong className="italic text-slate-700 mr-1">Tips.</strong>
                    可上传品牌 Logo，AI 会自动将 Logo 融入商品与排版
                  </span>
                </div>
              </div>
            </div>

            {/* 模块二：商品信息（非必填）+ AI帮写 + 词库 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold text-slate-800">商品信息（非必填）</span>
              </div>
              <div className="rounded-2xl bg-[#F8F9FC] border border-slate-200/90 p-2.5 focus-within:border-indigo-500 focus-within:bg-white transition">
                <textarea
                  value={productInfo}
                  onChange={(e) => setProductInfo(e.target.value.slice(0, 2000))}
                  rows={4}
                  placeholder="请输入商品信息包括:商品名称、商品描述、商品尺寸、目标受众、商品卖点。您也可以在上传多视角商品图后点击【AI帮写】一键分析"
                  className="w-full bg-transparent text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed select-text"
                />
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleAiWriteInfo}
                      disabled={isAiWriting}
                      className="px-2 py-1 rounded-md bg-white border border-slate-200/90 hover:border-indigo-400 text-[11px] font-semibold text-slate-700 hover:text-indigo-600 flex items-center gap-1 shadow-2xs transition cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className={`w-3 h-3 text-indigo-500 ${isAiWriting ? 'animate-spin' : ''}`} />
                      {isAiWriting ? 'AI分析中...' : 'AI帮写'}
                    </button>
                    <button
                      onClick={() => setShowDict((v) => !v)}
                      className="px-2 py-1 rounded-md bg-white border border-slate-200/90 hover:border-indigo-400 text-[11px] font-semibold text-slate-700 flex items-center gap-1 shadow-2xs transition cursor-pointer"
                    >
                      <BookOpen className="w-3 h-3 text-slate-500" /> 词库
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(productInfo);
                        onAddToast && onAddToast('已复制商品信息');
                      }}
                      title="复制内容"
                      className="p-1 rounded-md bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-500 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span>{productInfo.length} / 2000</span>
                    {productInfo && (
                      <button
                        onClick={() => setProductInfo('')}
                        className="hover:text-slate-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 快捷词库气泡展开 */}
                {showDict && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-wrap gap-1">
                    {PROMPT_DICTIONARY.map((word) => (
                      <button
                        key={word}
                        onClick={() =>
                          setProductInfo((prev) => (prev ? `${prev}，${word}` : word))
                        }
                        className="px-2 py-0.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-medium transition cursor-pointer"
                      >
                        + {word}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 模块三：更多设置 (点击弹出国家/语种/平台/主题色/字体抽屉) */}
            <div>
              <div className="text-xs font-extrabold text-slate-800 mb-1.5">更多设置</div>
              <button
                onClick={() => setShowMoreSettings((v) => !v)}
                className="w-full p-2.5 rounded-2xl bg-[#F8F9FC] hover:bg-indigo-50/40 border border-slate-200/90 hover:border-indigo-300 flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-serif font-bold text-slate-600 shrink-0">
                    Aa
                  </span>
                  <span className="text-xs font-medium text-slate-700 truncate">
                    {country} · {language} · {platform} · {themeColor.label} · {fontStyle}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            </div>

            {/* 模块四：创作模式 (智能套图 | 自定义套图) */}
            <div>
              <div className="text-xs font-extrabold text-slate-800 mb-2">创作模式</div>
              <div className="rounded-2xl bg-[#F8F9FC] border border-slate-200/90 p-2.5 space-y-3">
                {/* 顶部双 Tab */}
                <div className="grid grid-cols-2 border-b border-slate-200/80 pb-2">
                  <button
                    onClick={() => setCreateMode('smart')}
                    className={`pb-1.5 text-xs font-bold flex items-center justify-center gap-1 border-b-2 transition cursor-pointer ${
                      createMode === 'smart'
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>智能套图</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-white text-[9px]">
                      效果升级
                    </span>
                  </button>
                  <button
                    onClick={() => setCreateMode('custom')}
                    className={`pb-1.5 text-xs font-bold flex items-center justify-center border-b-2 transition cursor-pointer ${
                      createMode === 'custom'
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    自定义套图
                  </button>
                </div>

                {/* 主图辅图配置卡片 */}
                <div className="rounded-xl bg-white p-3 border border-slate-100 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800">主图辅图配置</span>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                        <button
                          onClick={() => setMainCount((c) => Math.max(1, c - 1))}
                          className="w-6 h-6 text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-slate-800">
                          {mainCount}
                        </span>
                        <button
                          onClick={() => setMainCount((c) => Math.min(4, c + 1))}
                          className="w-6 h-6 text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-slate-500">张</span>
                    </div>
                  </div>

                  {/* 智能文案开关 */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 flex items-center gap-1">
                      智能文案 <HelpCircle className="w-3 h-3 text-slate-400" />
                    </span>
                    <button
                      onClick={() => setMainSmartCopy((v) => !v)}
                      className={`w-9 h-5 rounded-full transition-colors p-0.5 cursor-pointer ${
                        mainSmartCopy ? 'bg-indigo-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          mainSmartCopy ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 清晰度选择 */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-600 shrink-0">清晰度</span>
                    <div className="flex-1 grid grid-cols-2 bg-slate-100 p-0.5 rounded-lg">
                      {['1K标清', '2K高清'].map((q) => (
                        <button
                          key={q}
                          onClick={() => setMainQuality(q)}
                          className={`relative py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                            mainQuality === q
                              ? 'bg-white text-slate-900 shadow-2xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {q}
                          {q === '2K高清' && (
                            <span className="ml-1 px-1 py-0.2 rounded bg-amber-900 text-amber-200 text-[8px]">
                              ✦会员
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 图像比例图标矩阵 */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-600">图像比例</span>
                      <span className="text-[10px] text-slate-400">当前: {mainRatio}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {ASPECT_RATIOS.map((r) => {
                        const active = mainRatio === r.id;
                        return (
                          <button
                            key={r.id}
                            onClick={() => setMainRatio(r.id)}
                            className={`py-1.5 rounded-lg border flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                              active
                                ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-bold'
                                : 'border-slate-200/80 text-slate-500 hover:border-slate-300'
                            }`}
                          >
                            <div
                              style={{ width: `${r.w}px`, height: `${r.h}px` }}
                              className={`rounded-[2px] border ${
                                active ? 'border-indigo-600 bg-indigo-200/50' : 'border-slate-400'
                              }`}
                            />
                            <span className="text-[10px] leading-none">{r.id}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* A+/详情页图配置卡片 */}
                <div className="rounded-xl bg-white p-3 border border-slate-100 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800">A+/详情页图配置</span>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                        <button
                          onClick={() => setDetailCount((c) => Math.max(0, c - 1))}
                          className="w-6 h-6 text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-slate-800">
                          {detailCount}
                        </span>
                        <button
                          onClick={() => setDetailCount((c) => Math.min(6, c + 1))}
                          className="w-6 h-6 text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-slate-500">张</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">详情页比例</span>
                    <div className="flex items-center gap-1">
                      {['3:4', '9:16', '1:1'].map((r) => (
                        <button
                          key={r}
                          onClick={() => setDetailRatio(r)}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold border cursor-pointer ${
                            detailRatio === r
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                              : 'border-slate-200 text-slate-500'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 指定模特 & 指定风格参考图复选栏 */}
                <div className="space-y-2 pt-1">
                  <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                    <span>指定模特（非必填，最多1张）</span>
                    <input
                      type="checkbox"
                      checked={useCustomModel}
                      onChange={(e) => setUseCustomModel(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                    <span>指定风格参考图（非必填，最多10张）</span>
                    <input
                      type="checkbox"
                      checked={useStyleRef}
                      onChange={(e) => setUseStyleRef(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                </div>

                {/* 额外描述（非必填）：控制具体镜头、Logo印制位置与场景光影 */}
                <div className="pt-1">
                  <div className="flex items-center gap-1 text-xs font-extrabold text-slate-800 mb-1.5">
                    <span>额外描述（非必填）</span>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="rounded-xl bg-white border border-slate-200/90 p-2.5 focus-within:border-indigo-500">
                    <textarea
                      value={extraPrompt}
                      onChange={(e) => setExtraPrompt(e.target.value.slice(0, 2000))}
                      rows={3}
                      placeholder="您可以在此处输入其它需求，例如：将图2的Logo以金属激光镭雕印在产品正面居中，生成胡桃木办公桌场景图与微距材质细节图..."
                      className="w-full bg-transparent text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed select-text"
                    />
                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[11px] text-slate-400">
                      <span>支持自定义 Logo 融合位置与镜头景别</span>
                      <span>{extraPrompt.length} / 2000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 底部常驻悬浮「立即生成」按钮栏 (1:1 复刻潮际好麦底部紫蓝胶囊按钮 + 右上角米豆角标) */}
          <div className="p-3.5 bg-white border-t border-slate-100 shrink-0">
            <div className="relative">
              <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-200 to-amber-300 text-amber-950 text-[10px] font-bold shadow-xs z-10">
                阿里百炼 2K 直出
              </span>
              <button
                onClick={handleGenerateProductSet}
                disabled={isGenerating}
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#6366F1] via-[#6D5DFB] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>正在生成商品套图 ({mainCount} 张 2K 大图)...</span>
                  </>
                ) : (
                  <>
                    <span>立即生成</span>
                    <span className="text-xs opacity-90 font-normal">⚡ 0 米豆</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 侧边弹出抽屉：更多设置 (复刻潮际好麦「更多设置」浮层) */}
          {showMoreSettings && (
            <div className="absolute top-0 left-full ml-1 w-[560px] max-w-[calc(100vw-460px)] h-full bg-white border-r border-slate-200 shadow-2xl z-30 p-6 overflow-y-auto animate-in fade-in slide-in-from-left-2 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <h3 className="text-base font-extrabold text-slate-900">更多设置</h3>
                <button
                  onClick={() => setShowMoreSettings(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-6">
                {/* 1. 目标销售国家/地区 */}
                <div>
                  <div className="text-xs font-bold text-slate-800 mb-2.5">目标销售国家/地区</div>
                  <div className="grid grid-cols-4 gap-2">
                    {COUNTRIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCountry(c)}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                          country === c
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-600'
                            : 'border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. 图片文案语言 */}
                <div>
                  <div className="text-xs font-bold text-slate-800 mb-2.5">图片文案语言</div>
                  <div className="grid grid-cols-4 gap-2">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l}
                        onClick={() => setLanguage(l)}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                          language === l
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-600'
                            : 'border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. 目标平台 */}
                <div>
                  <div className="text-xs font-bold text-slate-800 mb-2.5">目标平台</div>
                  <div className="grid grid-cols-4 gap-2">
                    {PLATFORMS.map((p) => (
                      <button
                        key={p}
                        onClick={() => setPlatform(p)}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                          platform === p
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-600'
                            : 'border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. 主题色 */}
                <div>
                  <div className="text-xs font-bold text-slate-800 mb-2.5">主题色</div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {THEME_COLORS.map((tc) => (
                      <button
                        key={tc.id}
                        onClick={() => setThemeColor(tc)}
                        className={`py-2.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                          themeColor.id === tc.id
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-600'
                            : 'border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded bg-gradient-to-tr ${tc.gradient}`} />
                        <span>{tc.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. 字体风格 */}
                <div>
                  <div className="text-xs font-bold text-slate-800 mb-2.5">字体风格</div>
                  <div className="grid grid-cols-3 gap-2">
                    {FONT_STYLES.map((f) => (
                      <button
                        key={f}
                        onClick={() => setFontStyle(f)}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                          fontStyle === f
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-600'
                            : 'border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. 右侧主工作画布区 (商品套图展示 + 实时生成流 + 做同款瀑布流 OR 生成记录视图) */}
      <div className="flex-1 h-full overflow-y-auto px-6 py-5 relative">
        {subNav === 'record' ? (
          /* 视图 B：复刻 /task-data/record 生成记录与离线任务管理视图 */
          <div className="max-w-6xl mx-auto bg-white rounded-3xl border border-slate-200/80 p-6 min-h-full shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-6">
                <button className="text-sm font-extrabold text-slate-900 border-b-2 border-slate-900 pb-2 cursor-pointer">
                  生成记录 ({batches.length})
                </button>
                <button className="text-sm font-semibold text-slate-400 hover:text-slate-700 pb-2 cursor-pointer">
                  离线任务
                </button>
              </div>
              <div className="text-xs text-slate-500">
                保留近 <strong className="text-slate-800">6个月</strong> 的生成记录，若需永久保存图片可「添加图片至资源仓库」或升级{' '}
                <span className="text-indigo-600 font-semibold">企业版</span>
              </div>
            </div>

            {/* 筛选工具栏 */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold">
                  <button
                    onClick={() => setRecordFilterType('all')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      recordFilterType === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    全部套图任务
                  </button>
                  <button
                    onClick={() => setRecordFilterType('single')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      recordFilterType === 'single' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    单点功能
                  </button>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-400">
                  <span>开始日期</span>
                  <span>→</span>
                  <span>结束日期</span>
                  <Calendar className="w-3.5 h-3.5 ml-2" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-slate-100 p-1 rounded-xl flex items-center">
                  <button
                    onClick={() => setRecordViewMode('list')}
                    className={`p-1.5 rounded-lg cursor-pointer ${
                      recordViewMode === 'list' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                    }`}
                    title="列表模式"
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setRecordViewMode('grid')}
                    className={`p-1.5 rounded-lg cursor-pointer ${
                      recordViewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                    }`}
                    title="平铺模式"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 任务记录列表 */}
            <div className="space-y-6">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className="rounded-2xl border border-slate-200/80 bg-[#F9FAFC] p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-[11px] font-bold">
                        商品套图
                      </span>
                      <span className="text-xs font-bold text-slate-800 truncate max-w-xl">
                        {batch.prompt}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-200/70 text-slate-600 text-[10px] font-semibold">
                        {batch.model}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                        {batch.ratio}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{batch.time || '刚刚'}</span>
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
                        className="group relative aspect-square rounded-xl overflow-hidden bg-white border border-slate-200 shadow-2xs hover:shadow-md transition cursor-pointer"
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
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/65 text-white text-[10px] font-semibold backdrop-blur-xs">
                          {img.tag}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* 视图 A：商品套图主工作台 (顶部最新生成结果 + 商品套图引导卡 + 做同款瀑布流) */
          <div className="max-w-5xl mx-auto space-y-8 pb-16">
            {/* 顶部提示栏 */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>阿里百炼 Qwen-Image-3.0 电商套图引擎已连接</span>
              </div>
              <div>
                💡 对生成结果不满意？可使用左侧 <strong className="text-indigo-600">额外描述</strong> 精细调整，或切换右侧{' '}
                <button
                  onClick={() => setSubNav('record')}
                  className="text-indigo-600 hover:underline font-semibold cursor-pointer"
                >
                  生成记录 ({batches.length})
                </button>
              </div>
            </div>

            {/* 如果正在生成或已有新生成的阿里百炼套图，在顶部醒目展示最新套图结果 */}
            {(isGenerating || batches[0]?.id?.startsWith('batch-set-')) && (
              <div className="rounded-3xl bg-white border border-indigo-200/90 p-5 shadow-md space-y-4 animate-in fade-in duration-300">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {isGenerating ? '正在直出 2K 商品套图...' : '最新生成商品套图'}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 truncate max-w-md">
                      {batches[0]?.prompt}
                    </span>
                  </div>
                  <button
                    onClick={() => setSubNav('record')}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    查看全部生成记录 <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isGenerating ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: mainCount }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-2xl bg-slate-100 animate-pulse flex flex-col items-center justify-center gap-2 border border-slate-200 p-4 text-center"
                      >
                        <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
                        <span className="text-xs font-bold text-slate-600">
                          正在渲染套图 {i + 1}/{mainCount}
                        </span>
                        <span className="text-[10px] text-slate-400">阿里百炼 Qwen-Image-3.0 2K</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {batches[0].items.map((img) => (
                      <div
                        key={img.id}
                        onClick={() =>
                          setActiveDetailImage({
                            ...img,
                            prompt: batches[0].prompt,
                            ratio: batches[0].ratio,
                            model: batches[0].model
                          })
                        }
                        className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/90 shadow-xs hover:shadow-lg transition cursor-pointer"
                      >
                        <img
                          src={img.customImageUrl}
                          alt={img.tag}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-black/65 text-white text-[10px] font-bold backdrop-blur-xs">
                          {img.tag}
                        </div>
                        <div className="absolute inset-x-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 transition flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSendToVideo &&
                                onSendToVideo({
                                  prompt: batches[0].prompt,
                                  tag: img.tag,
                                  customImageUrl: img.customImageUrl
                                });
                            }}
                            className="flex-1 py-1.5 rounded-lg bg-slate-900/90 text-white text-[11px] font-bold flex items-center justify-center gap-1 backdrop-blur-xs cursor-pointer"
                          >
                            <Film className="w-3 h-3" /> 转视频
                          </button>
                          <a
                            href={img.customImageUrl}
                            download={`auto-winning-${img.id}.png`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg bg-white/90 text-slate-800 hover:bg-white shadow"
                            title="下载原图"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 复刻潮际好麦中央「商品套图」大引导卡片 */}
            <div className="rounded-3xl bg-white border border-slate-200/80 p-8 shadow-2xs flex flex-col items-center text-center">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-6">商品套图</h1>

              <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* 左侧：输入单张商品图 + 电商平台图标 */}
                <div className="md:col-span-3 rounded-2xl bg-gradient-to-b from-indigo-50/80 to-slate-50 border border-indigo-100 p-4 flex flex-col items-center justify-between h-56 relative">
                  <div className="relative w-28 h-28 rounded-2xl bg-white border-2 border-indigo-400 shadow-md flex items-center justify-center p-2">
                    <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-white border border-slate-200 shadow text-[11px] font-black text-slate-900 flex items-center justify-center">
                      ✦AI+
                    </span>
                    {uploadedImages[0]?.url ? (
                      <img
                        src={uploadedImages[0].url}
                        alt="当前商品"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-indigo-300" />
                    )}
                  </div>

                  <div className="text-indigo-400 font-bold text-lg">⤵</div>

                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#FF5000] text-white text-xs font-extrabold flex items-center justify-center shadow-2xs">
                      淘
                    </span>
                    <span className="w-7 h-7 rounded-lg bg-[#E02E24] text-white text-xs font-extrabold flex items-center justify-center shadow-2xs">
                      拼
                    </span>
                    <span className="w-7 h-7 rounded-lg bg-[#FF9900] text-slate-900 text-xs font-extrabold flex items-center justify-center shadow-2xs">
                      a
                    </span>
                    <span className="w-7 h-7 rounded-lg bg-slate-900 text-white text-xs font-extrabold flex items-center justify-center shadow-2xs">
                      抖
                    </span>
                  </div>
                </div>

                {/* 右侧：一键裂变的主图+辅图+3张详情页海报示意 */}
                <div className="md:col-span-9 grid grid-cols-4 gap-3 h-56">
                  {/* 列1：主图 + 辅图上下叠放 */}
                  <div className="flex flex-col gap-3 h-full">
                    <div className="flex-1 rounded-xl bg-gradient-to-br from-amber-100 via-stone-200 to-stone-300 relative overflow-hidden border border-slate-200/80 flex items-center justify-center p-2">
                      <div className="text-center">
                        <div className="text-[11px] font-black text-stone-800">高转化主图</div>
                        <div className="text-[9px] text-stone-600 mt-0.5">立体光影棚拍</div>
                      </div>
                      <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold">
                        主图
                      </span>
                    </div>
                    <div className="flex-1 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden border border-slate-200/80 flex items-center justify-center p-2">
                      <div className="text-center">
                        <div className="text-[11px] font-black text-amber-200">场景辅图</div>
                        <div className="text-[9px] text-slate-300 mt-0.5">多视角上身/陈列</div>
                      </div>
                      <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold">
                        辅图
                      </span>
                    </div>
                  </div>

                  {/* 列2：详情页 | 首屏海报图 */}
                  <div className="rounded-xl bg-gradient-to-b from-[#E5DEC9] via-[#D5CCB4] to-[#B8AD93] relative overflow-hidden border border-slate-200/80 flex flex-col justify-between p-3 text-left">
                    <div>
                      <div className="text-xs font-black text-stone-900 tracking-wide">步履·重塑</div>
                      <div className="text-[9px] text-stone-700">首屏卖点视觉海报</div>
                    </div>
                    <div className="my-auto w-full aspect-square rounded-lg bg-white/50 backdrop-blur-xs flex items-center justify-center p-2">
                      {uploadedImages[0]?.url && (
                        <img src={uploadedImages[0].url} alt="" className="w-full h-full object-contain" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 bg-black/75 text-white rounded px-1.5 py-0.5 text-[9px] font-bold w-fit">
                      <span>详情页</span>
                      <span className="opacity-60">|</span>
                      <span className="text-amber-200">首屏海报图</span>
                    </div>
                  </div>

                  {/* 列3：详情页 | 静物场景图 */}
                  <div className="rounded-xl bg-gradient-to-b from-[#EDE6D6] via-[#DFD5C0] to-[#C7B99E] relative overflow-hidden border border-slate-200/80 flex flex-col justify-between p-3 text-left">
                    <div>
                      <div className="text-xs font-black text-stone-900">WEEKEND VIBES</div>
                      <div className="text-[9px] text-stone-700">适配多种生活场景</div>
                    </div>
                    <div className="my-auto w-full aspect-square rounded-lg bg-white/40 flex items-center justify-center p-2">
                      {uploadedImages[1]?.url ? (
                        <img src={uploadedImages[1].url} alt="" className="w-full h-full object-contain" />
                      ) : (
                        uploadedImages[0]?.url && (
                          <img src={uploadedImages[0].url} alt="" className="w-full h-full object-contain" />
                        )
                      )}
                    </div>
                    <div className="flex items-center gap-1 bg-black/75 text-white rounded px-1.5 py-0.5 text-[9px] font-bold w-fit">
                      <span>详情页</span>
                      <span className="opacity-60">|</span>
                      <span className="text-amber-200">静物场景图</span>
                    </div>
                  </div>

                  {/* 列4：详情页 | 材质细节图 */}
                  <div className="rounded-xl bg-gradient-to-b from-[#3E2723] via-[#4E342E] to-[#271815] relative overflow-hidden border border-slate-200/80 flex flex-col justify-between p-3 text-left">
                    <div>
                      <div className="text-xs font-black text-amber-100">甄选材质肌理</div>
                      <div className="text-[9px] text-amber-200/70">微距工艺特写</div>
                    </div>
                    <div className="my-auto w-16 h-16 mx-auto rounded-full border-2 border-amber-300/60 bg-white/10 flex items-center justify-center text-amber-100 text-[10px] font-bold">
                      微距高光
                    </div>
                    <div className="flex items-center gap-1 bg-black/75 text-white rounded px-1.5 py-0.5 text-[9px] font-bold w-fit">
                      <span>详情页</span>
                      <span className="opacity-60">|</span>
                      <span className="text-amber-200">材质细节图</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm font-medium text-slate-400 mt-6 tracking-wide">
                告别繁琐拍摄，一键生成全套电商视觉，适配多种电商平台
              </p>
            </div>

            {/* 下方「做同款」5列瀑布流营销海报区 (复刻潮际好麦底部瀑布流) */}
            <div>
              <div className="flex items-center justify-center gap-2 mb-5">
                <span className="text-indigo-400 font-black">||</span>
                <h2 className="text-base font-black text-slate-900 tracking-wide">做同款</h2>
                <span className="text-indigo-400 font-black">||</span>
              </div>

              <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {WATERFALL_SHOWCASES.map((card) => (
                  <div
                    key={card.id}
                    className={`break-inside-avoid group relative ${card.aspect} rounded-2xl overflow-hidden bg-gradient-to-br ${card.bg} border border-slate-200/80 p-4 flex flex-col justify-between shadow-xs hover:shadow-xl transition-all duration-300`}
                  >
                    {/* 顶部海报文案排版 */}
                    <div className={card.textColor}>
                      <span className="inline-block px-2 py-0.5 rounded bg-black/15 backdrop-blur-xs text-[9px] font-bold mb-1.5">
                        {card.category}
                      </span>
                      <h3 className="text-base font-black leading-tight tracking-tight">
                        {card.title}
                      </h3>
                      <p className="text-[11px] opacity-85 mt-1 font-medium leading-snug">
                        {card.subtitle}
                      </p>
                    </div>

                    {/* 中央卖点胶囊列表 */}
                    <div className="my-auto py-3 flex flex-wrap gap-1.5">
                      {card.badges.map((b) => (
                        <span
                          key={b}
                          className="px-2 py-0.5 rounded-full bg-white/85 text-slate-900 text-[10px] font-bold shadow-2xs"
                        >
                          ✓ {b}
                        </span>
                      ))}
                    </div>

                    {/* 底部比例与平台角标 */}
                    <div className={`flex items-center justify-between text-[10px] opacity-75 ${card.textColor}`}>
                      <span className="font-bold">AI 套图模版</span>
                      <span className="font-mono">{card.ratio}</span>
                    </div>

                    {/* 悬浮遮罩：一键做同款 + 预览 */}
                    <div className="absolute inset-0 bg-slate-900/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2.5 p-4 backdrop-blur-[2px]">
                      <button
                        onClick={() => handleMakeSameFromWaterfall(card)}
                        className="w-36 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-1.5 hover:scale-105 transition cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> 做同款套图
                      </button>
                      <button
                        onClick={() =>
                          setActiveDetailImage({
                            id: card.id,
                            prompt: card.prompt,
                            ratio: card.ratio,
                            tag: card.title,
                            palette: 'cream'
                          })
                        }
                        className="w-36 py-1.5 rounded-full bg-white/90 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1 hover:bg-white transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> 预览详情
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. 最右侧贴边悬浮切换条 (复刻潮际好麦右侧边「任务列表」快捷入口) */}
      <div className="fixed right-2 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2">
        <button
          onClick={() => setSubNav(subNav === 'record' ? 'product-set' : 'record')}
          className={`px-2 py-3 rounded-2xl border shadow-md flex flex-col items-center gap-1.5 transition cursor-pointer ${
            subNav === 'record'
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white/95 text-slate-700 border-slate-200 hover:border-indigo-400'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="text-[11px] font-bold [writing-mode:vertical-rl] tracking-widest">
            {subNav === 'record' ? '返回套图' : '任务列表'}
          </span>
          <span
            className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
              subNav === 'record' ? 'bg-white text-indigo-600' : 'bg-indigo-50 text-indigo-600'
            }`}
          >
            {batches.length}
          </span>
        </button>
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
