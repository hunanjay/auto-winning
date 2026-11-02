import React, { useEffect, useRef, useState } from 'react';
import {
  Canvas,
  Rect,
  Circle,
  FabricImage,
  Shadow,
  Line,
  FabricText
} from 'fabric';
import {
  Upload,
  Sparkles,
  Layers,
  CheckCircle2,
  Sliders,
  RefreshCw,
  Image as ImageIcon,
  Lock,
  Unlock,
  Wand2,
  Plus
} from 'lucide-react';

// 3C 科技礼品底模配置
const PRODUCT_MOLDS = [
  {
    id: 'powerbank',
    name: '磁吸无线充电宝',
    desc: '阳极氧化铝机身，磨砂质感',
    width: 300,
    height: 430,
    radius: 32,
    bodyColor: '#E2E8F0',
    borderColor: '#94A3B8',
    innerColor: '#F1F5F9',
    safeArea: { x: 40, y: 85, width: 220, height: 235, radius: 14 }
  },
  {
    id: 'keyboard',
    name: '客制化机械键盘铭牌',
    desc: 'CNC 铝合金阳极氧化底壳配重块',
    width: 420,
    height: 260,
    radius: 18,
    bodyColor: '#CBD5E1',
    borderColor: '#64748B',
    innerColor: '#E2E8F0',
    safeArea: { x: 60, y: 55, width: 300, height: 150, radius: 10 }
  },
  {
    id: 'charger',
    name: '氮化镓 65W 快充',
    desc: '高阻燃 PC 钛灰微砂外壳',
    width: 280,
    height: 360,
    radius: 22,
    bodyColor: '#E2E8F0',
    borderColor: '#94A3B8',
    innerColor: '#F8FAFC',
    safeArea: { x: 45, y: 70, width: 190, height: 195, radius: 12 }
  }
];

// 4 大定制工艺
const CRAFT_MODES = [
  {
    id: 'laser',
    name: '金属激光镭雕',
    badge: '推荐',
    desc: '阳极氧化铝轻微烧蚀，透出金属漫反射银白质感',
    logoColor: '#475569',
    opacity: 0.72,
    shadow: { color: 'rgba(255, 255, 255, 0.9)', blur: 0, offsetX: 1, offsetY: 1.2 }
  },
  {
    id: 'uv_emboss',
    name: 'UV 3D 微浮雕',
    badge: '高奢',
    desc: '0.2mm 环保油墨凸起，清漆覆膜反光与微投影',
    logoColor: '#0F172A',
    opacity: 0.98,
    shadow: { color: 'rgba(15, 23, 42, 0.38)', blur: 3, offsetX: 2, offsetY: 2.5 }
  },
  {
    id: 'silk_screen',
    name: '高精丝网印',
    badge: '经典',
    desc: '高遮盖力纯色哑光墨层，与机身自然贴合',
    logoColor: '#1E293B',
    opacity: 0.9,
    shadow: { color: 'rgba(15, 23, 42, 0.12)', blur: 1, offsetX: 0, offsetY: 0.5 }
  },
  {
    id: 'gold_foil',
    name: '香槟烫金/烫银',
    badge: '尊贵',
    desc: '金属真空镀铝渐变反光，高奢伴手礼首选',
    logoColor: '#B45309',
    opacity: 0.95,
    shadow: { color: 'rgba(217, 119, 6, 0.45)', blur: 2, offsetX: 1, offsetY: 1.5 }
  }
];

// 预设 AI 商拍背景光影模版
const SCENE_TEMPLATES = [
  {
    id: 'walnut',
    name: '高管胡桃木办公桌',
    prompt: '放在高档北美黑胡桃木高管办公桌上，午后百叶窗暖色柔和侧逆光，旁边有金属钢笔与咖啡杯，真实接触阴影，4K商业摄影大片'
  },
  {
    id: 'giftbox',
    name: '黑金尊享年会礼盒',
    prompt: '放置在定制黑色丝绒内衬的高奢企业伴手礼盒中，金色丝带点缀，顶部聚光灯勾勒高级金属轮廓光，奢华商务质感'
  },
  {
    id: 'tech_stage',
    name: '极光科技几何展台',
    prompt: '放置在磨砂亚克力与深灰岩石几何展台上，冷调蓝紫边缘轮廓光，未来科技数码旗舰产品发布会棚拍大片'
  },
  {
    id: 'travertine',
    name: '侘寂洞石自然晨光',
    prompt: '放置在米白色天然洞石展台上，清晨柔和自然漫反射光，背景微距绿植光斑虚化，极简生活美学商拍'
  }
];

// 根据工艺颜色动态生成高保真矢量示例 Logo
const buildPresetLogoUrl = (type, colorHex) => {
  const c = encodeURIComponent(colorHex);
  if (type === 'tech') {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`;
  }
  if (type === 'nexus') {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="90" viewBox="0 0 240 90"><text x="120" y="54" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="900" fill="${c}" letter-spacing="5">NEXUS</text><text x="120" y="76" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="${c}" letter-spacing="6">TECH GIFT</text></svg>`;
  }
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 24 24" fill="${c}"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`;
};

const PRESET_LOGOS = [
  { id: 'tech', name: '极简科技标' },
  { id: 'nexus', name: '英文字母标' },
  { id: 'bolt', name: '极速闪电标' }
];

// Logo 印制位置预设 (支持一键切换或直接在图1上点击任意坐标)
const LOGO_POSITIONS = [
  { id: 'center', name: '正中央居中', x: 50, y: 50, desc: '产品正面正中央醒目位置' },
  { id: 'upper_center', name: '中上方黄金位', x: 50, y: 32, desc: '产品正面中上方黄金视觉位置' },
  { id: 'lower_center', name: '下半部居中', x: 50, y: 70, desc: '产品正面下半部居中位置' },
  { id: 'top_left', name: '左上角角标', x: 30, y: 28, desc: '产品正面左上角精致角标位置' },
  { id: 'bottom_right', name: '右下角铭牌', x: 70, y: 74, desc: '产品正面右下角铭牌位置' }
];

// Logo 尺寸比例预设
const LOGO_SIZES = [
  { id: 'small', name: '精致小标 (16%)', scalePct: 16, desc: '精致小巧尺寸（约占产品正面宽度16%）' },
  { id: 'medium', name: '标准适中 (28%)', scalePct: 28, desc: '标准适中尺寸（约占产品正面宽度28%）' },
  { id: 'large', name: '醒目大标 (42%)', scalePct: 42, desc: '醒目主视觉大尺寸（约占产品正面宽度42%）' }
];

// 将内置模具渲染为不含任何 Logo 和虚线框的纯净产品原型 PNG DataURL (供双图 AI 模式使用)
const buildCleanMoldPng = (mold) => {
  const cvs = document.createElement('canvas');
  cvs.width = 600;
  cvs.height = 600;
  const ctx = cvs.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 0, 600, 600);

  const w = mold.width * 1.1;
  const h = mold.height * 1.1;
  const x = (600 - w) / 2;
  const y = (600 - h) / 2;
  const r = mold.radius * 1.1;

  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.16)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 16;

  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = mold.bodyColor;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = mold.borderColor;
  ctx.stroke();
  ctx.restore();

  ctx.beginPath();
  ctx.roundRect(x + 8, y + 8, w - 16, h - 16, Math.max(r - 4, 8));
  ctx.fillStyle = mold.innerColor;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#FFFFFF';
  ctx.stroke();

  if (mold.id === 'powerbank') {
    ctx.beginPath();
    ctx.arc(300, 275, 76, 0, Math.PI * 2);
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 9;
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(295, 368, 10, 32, 5);
    ctx.fillStyle = '#CBD5E1';
    ctx.fill();

    ctx.fillStyle = '#94A3B8';
    ctx.font = '600 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('10000mAh · MagSafe Fast Charge', 300, y + h - 32);
  } else if (mold.id === 'keyboard') {
    const screws = [
      [x + 28, y + 28],
      [x + w - 28, y + 28],
      [x + 28, y + h - 28],
      [x + w - 28, y + h - 28]
    ];
    screws.forEach(([sx, sy]) => {
      ctx.beginPath();
      ctx.arc(sx, sy, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#CBD5E1';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#94A3B8';
      ctx.stroke();
    });
  } else if (mold.id === 'charger') {
    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('65W GaN Ultra-Fast Charger', 300, y + h - 36);
  }

  return cvs.toDataURL('image/png');
};

// 将任意图片或 SVG DataURL 光栅化为 600x600 标准白底 PNG DataURL (确保百炼 API 100% 兼容识别)
const rasterizeImageToPng = (srcUrl, bgColor = '#FFFFFF') =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const cvs = document.createElement('canvas');
      cvs.width = 600;
      cvs.height = 600;
      const ctx = cvs.getContext('2d');
      if (!ctx) {
        resolve(srcUrl);
        return;
      }
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, 600, 600);

      const maxDim = 420;
      const scale = Math.min(maxDim / (img.width || 300), maxDim / (img.height || 300));
      const drawW = (img.width || 300) * scale;
      const drawH = (img.height || 300) * scale;
      ctx.drawImage(img, (600 - drawW) / 2, (600 - drawH) / 2, drawW, drawH);
      resolve(cvs.toDataURL('image/png'));
    };
    img.onerror = () => resolve(srcUrl);
    img.src = srcUrl;
  });

export default function CustomDecalCanvas({
  onGenerateScene,
  isGenerating = false,
  className = ''
}) {
  // 默认使用 'dual-ai'（产品原图 + Logo 直接喂给百炼大模型），可选切换 'canvas-2d'（Fabric.js 手动刀版）
  const [workMode, setWorkMode] = useState('dual-ai');

  const canvasElRef = useRef(null);
  const fabricRef = useRef(null);
  const logoObjectRef = useRef(null);
  const safeRectRef = useRef(null);
  const safeLabelRef = useRef(null);
  const clipRectRef = useRef(null);
  const guideLinesRef = useRef({ vLine: null, hLine: null });

  const [activeMold, setActiveMold] = useState(PRODUCT_MOLDS[0]);
  const [customProductUrl, setCustomProductUrl] = useState(null);
  const [customProductName, setCustomProductName] = useState('');
  const [activeCraft, setActiveCraft] = useState(CRAFT_MODES[0]);
  const [activePresetId, setActivePresetId] = useState('tech');
  const [customLogoUrl, setCustomLogoUrl] = useState(null);
  const [customLogoName, setCustomLogoName] = useState('');
  const [isEditingSafeArea, setIsEditingSafeArea] = useState(false);
  const [selectedScene, setSelectedScene] = useState(SCENE_TEMPLATES[0]);
  const [scenePrompt, setScenePrompt] = useState(SCENE_TEMPLATES[0].prompt);
  const [selectedPos, setSelectedPos] = useState(LOGO_POSITIONS[0]);
  const [logoPin, setLogoPin] = useState({ x: 50, y: 50, label: LOGO_POSITIONS[0].desc });
  const [selectedSize, setSelectedSize] = useState(LOGO_SIZES[1]);
  const [logoPrompt, setLogoPrompt] = useState(
    `请将图2中的Logo精准印制在图1产品的【${LOGO_POSITIONS[0].desc}】，Logo大小为【${LOGO_SIZES[1].desc}】，表面采用【${CRAFT_MODES[0].name}（${CRAFT_MODES[0].desc}）】工艺，顺应产品3D立体表面透视与高光阴影`
  );
  const [isSnapping, setIsSnapping] = useState(false);
  const [logoScale, setLogoScale] = useState(100);
  const [logoRotation, setLogoRotation] = useState(0);

  // 根据位置、尺寸与工艺自动同步默认 Logo 融合提示词
  const buildLogoFusionPrompt = (posLabel, sizeObj, craftObj) =>
    `请将图2中的Logo精准印制在图1产品的【${posLabel}】，Logo大小为【${sizeObj.desc}】，表面采用【${craftObj.name}（${craftObj.desc}）】工艺，顺应产品3D立体表面透视与高光阴影`;

  // 在图1产品图上直接点击任意位置设置 Logo 印制坐标
  const handleProductPinClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = Math.round(Math.min(Math.max(((e.clientX - rect.left) / rect.width) * 100, 15), 85));
    const yPct = Math.round(Math.min(Math.max(((e.clientY - rect.top) / rect.height) * 100, 15), 85));

    const hDesc = xPct < 38 ? '偏左' : xPct > 62 ? '偏右' : '水平居中';
    const vDesc = yPct < 38 ? '中上方' : yPct > 62 ? '下半部' : '垂直居中';
    const customLabel = `产品正面${vDesc}${hDesc}区域（坐标约 X:${xPct}%, Y:${yPct}%）`;

    setSelectedPos({ id: 'custom', name: '自定义点击定位', x: xPct, y: yPct, desc: customLabel });
    setLogoPin({ x: xPct, y: yPct, label: customLabel });
    setLogoPrompt(buildLogoFusionPrompt(customLabel, selectedSize, activeCraft));
  };

  // 双图直出模式下的标准 PNG DataURL
  const [pureProductPng, setPureProductPng] = useState('');
  const [pureLogoPng, setPureLogoPng] = useState('');

  // 当产品模具或自定义产品图变化时，生成纯净产品图 PNG
  useEffect(() => {
    let active = true;
    if (customProductUrl) {
      rasterizeImageToPng(customProductUrl, '#F8FAFC').then((png) => {
        if (active) setPureProductPng(png);
      });
    } else {
      setPureProductPng(buildCleanMoldPng(activeMold));
    }
    return () => {
      active = false;
    };
  }, [activeMold, customProductUrl]);

  // 当预设 Logo、工艺颜色或自定义 Logo 变化时，生成纯净白底 Logo PNG
  useEffect(() => {
    let active = true;
    const rawLogo = customLogoUrl || buildPresetLogoUrl(activePresetId, activeCraft.logoColor);
    rasterizeImageToPng(rawLogo, '#FFFFFF').then((png) => {
      if (active) setPureLogoPng(png);
    });
    return () => {
      active = false;
    };
  }, [activePresetId, activeCraft, customLogoUrl]);

  // 初始化 Fabric.js v7 画布 (仅在切换到 2D 刀版微调模式时挂载)
  useEffect(() => {
    if (workMode !== 'canvas-2d' || !canvasElRef.current) return;

    const canvasW = activeMold.width + 120;
    const canvasH = activeMold.height + 100;

    const canvas = new Canvas(canvasElRef.current, {
      width: canvasW,
      height: canvasH,
      backgroundColor: '#F8FAFC',
      selection: true,
      preserveObjectStacking: true
    });

    fabricRef.current = canvas;

    const initScene = async () => {
      if (customProductUrl) {
        await renderCustomProductAndSafeArea(canvas, customProductUrl, activeMold);
      } else {
        renderMoldAndSafeArea(canvas, activeMold);
      }

      const targetLogoUrl = customLogoUrl || buildPresetLogoUrl(activePresetId, activeCraft.logoColor);
      await loadLogo(targetLogoUrl, activeCraft, activeMold);
    };

    initScene();

    canvas.on('object:moving', (e) => {
      if (e.target === safeRectRef.current) {
        syncClipRectWithSafeRect();
      } else {
        handleObjectMoving(e, canvas);
      }
    });

    canvas.on('object:scaling', (e) => {
      if (e.target === safeRectRef.current) {
        syncClipRectWithSafeRect();
      } else if (e.target === logoObjectRef.current) {
        setLogoScale(Math.round((e.target.scaleX || 1) * 100));
      }
    });

    canvas.on('object:rotating', (e) => {
      if (e.target === logoObjectRef.current) {
        setLogoRotation(Math.round(e.target.angle || 0));
      }
    });

    canvas.on('object:modified', (e) => {
      setIsSnapping(false);
      hideGuideLines(canvas);
      if (e.target === safeRectRef.current) {
        syncClipRectWithSafeRect();
      } else if (e.target === logoObjectRef.current) {
        setLogoScale(Math.round((e.target.scaleX || 1) * 100));
        setLogoRotation(Math.round(e.target.angle || 0));
      }
    });

    canvas.on('mouse:up', () => {
      setIsSnapping(false);
      hideGuideLines(canvas);
    });

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [workMode, activeMold, customProductUrl]);

  const syncClipRectWithSafeRect = () => {
    const safeRect = safeRectRef.current;
    const clipRect = clipRectRef.current;
    const safeLabel = safeLabelRef.current;
    const canvas = fabricRef.current;
    if (!safeRect || !clipRect || !canvas) return;

    const scaledW = safeRect.getScaledWidth();
    const scaledH = safeRect.getScaledHeight();

    clipRect.set({
      left: safeRect.left,
      top: safeRect.top,
      width: scaledW,
      height: scaledH,
      scaleX: 1,
      scaleY: 1
    });

    if (safeLabel) {
      safeLabel.set({
        left: safeRect.left + scaledW / 2,
        top: safeRect.top - 10
      });
    }

    if (logoObjectRef.current) {
      logoObjectRef.current.dirty = true;
    }
    canvas.requestRenderAll();
  };

  const toggleSafeAreaEdit = () => {
    const canvas = fabricRef.current;
    const safeRect = safeRectRef.current;
    const logoObj = logoObjectRef.current;
    if (!canvas || !safeRect) return;

    const nextMode = !isEditingSafeArea;
    setIsEditingSafeArea(nextMode);

    safeRect.set({
      selectable: nextMode,
      evented: nextMode,
      stroke: nextMode ? '#F59E0B' : '#3B82F6',
      fill: nextMode ? 'rgba(245, 158, 11, 0.08)' : 'rgba(37, 99, 235, 0.02)',
      cornerColor: '#F59E0B',
      cornerStrokeColor: '#FFFFFF',
      cornerSize: 10,
      cornerStyle: 'circle',
      transparentCorners: false,
      lockRotation: true
    });

    if (logoObj) {
      logoObj.set({
        selectable: !nextMode,
        evented: !nextMode
      });
    }

    canvas.setActiveObject(nextMode ? safeRect : logoObj);
    canvas.requestRenderAll();
  };

  useEffect(() => {
    if (workMode !== 'canvas-2d' || !fabricRef.current) return;
    if (!customLogoUrl) {
      const updatedUrl = buildPresetLogoUrl(activePresetId, activeCraft.logoColor);
      loadLogo(updatedUrl, activeCraft, activeMold, true);
    } else if (logoObjectRef.current) {
      applyCraftToLogo(logoObjectRef.current, activeCraft);
      fabricRef.current.requestRenderAll();
    }
  }, [activeCraft, activePresetId, workMode]);

  const renderCustomProductAndSafeArea = async (canvas, imgUrl, mold) => {
    const canvasW = canvas.width;
    const canvasH = canvas.height;

    try {
      const prodImg = await FabricImage.fromURL(imgUrl, { crossOrigin: 'anonymous' });
      const maxW = canvasW - 60;
      const maxH = canvasH - 60;
      const scale = Math.min(maxW / (prodImg.width || 1), maxH / (prodImg.height || 1));

      prodImg.set({
        left: canvasW / 2,
        top: canvasH / 2,
        originX: 'center',
        originY: 'center',
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false,
        shadow: new Shadow({
          color: 'rgba(15, 23, 42, 0.12)',
          blur: 24,
          offsetX: 0,
          offsetY: 10
        })
      });

      canvas.add(prodImg);
      renderSafeAreaOverlay(canvas, mold);
    } catch (err) {
      console.error('自定义产品图载入失败:', err);
    }
  };

  const renderMoldAndSafeArea = (canvas, mold) => {
    const offsetX = 60;
    const offsetY = 50;

    const productBody = new Rect({
      left: offsetX,
      top: offsetY,
      originX: 'left',
      originY: 'top',
      width: mold.width,
      height: mold.height,
      rx: mold.radius,
      ry: mold.radius,
      fill: mold.bodyColor,
      stroke: mold.borderColor,
      strokeWidth: 2,
      selectable: false,
      evented: false,
      shadow: new Shadow({
        color: 'rgba(15, 23, 42, 0.14)',
        blur: 28,
        offsetX: 0,
        offsetY: 14
      })
    });

    const innerPanel = new Rect({
      left: offsetX + 6,
      top: offsetY + 6,
      originX: 'left',
      originY: 'top',
      width: mold.width - 12,
      height: mold.height - 12,
      rx: Math.max(mold.radius - 4, 8),
      ry: Math.max(mold.radius - 4, 8),
      fill: mold.innerColor,
      stroke: '#FFFFFF',
      strokeWidth: 1.5,
      selectable: false,
      evented: false
    });

    canvas.add(productBody, innerPanel);

    if (mold.id === 'powerbank') {
      const magOuter = new Circle({
        left: offsetX + mold.width / 2,
        top: offsetY + mold.safeArea.y + mold.safeArea.height / 2 - 12,
        originX: 'center',
        originY: 'center',
        radius: 68,
        fill: 'transparent',
        stroke: '#CBD5E1',
        strokeWidth: 8,
        selectable: false,
        evented: false
      });
      const magBar = new Rect({
        left: offsetX + mold.width / 2,
        top: offsetY + mold.safeArea.y + mold.safeArea.height / 2 + 78,
        originX: 'center',
        originY: 'center',
        width: 8,
        height: 28,
        rx: 4,
        ry: 4,
        fill: '#CBD5E1',
        selectable: false,
        evented: false
      });
      const ledLabel = new FabricText('10000mAh · MagSafe Fast Charge', {
        left: offsetX + mold.width / 2,
        top: offsetY + mold.height - 30,
        originX: 'center',
        originY: 'center',
        fontSize: 10,
        fontFamily: 'system-ui, sans-serif',
        fill: '#94A3B8',
        selectable: false,
        evented: false
      });
      canvas.add(magOuter, magBar, ledLabel);
    } else if (mold.id === 'keyboard') {
      const screwPositions = [
        [offsetX + 24, offsetY + 24],
        [offsetX + mold.width - 24, offsetY + 24],
        [offsetX + 24, offsetY + mold.height - 24],
        [offsetX + mold.width - 24, offsetY + mold.height - 24]
      ];
      screwPositions.forEach(([sx, sy]) => {
        canvas.add(
          new Circle({
            left: sx,
            top: sy,
            originX: 'center',
            originY: 'center',
            radius: 5,
            fill: '#CBD5E1',
            stroke: '#94A3B8',
            strokeWidth: 1.5,
            selectable: false,
            evented: false
          })
        );
      });
    } else if (mold.id === 'charger') {
      const specText = new FabricText('65W GaN Ultra-Fast Charger', {
        left: offsetX + mold.width / 2,
        top: offsetY + mold.height - 34,
        originX: 'center',
        originY: 'center',
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: 'system-ui, sans-serif',
        fill: '#94A3B8',
        selectable: false,
        evented: false
      });
      canvas.add(specText);
    }

    renderSafeAreaOverlay(canvas, mold);
  };

  const renderSafeAreaOverlay = (canvas, mold) => {
    const offsetX = 60;
    const offsetY = 50;

    const safeRect = new Rect({
      left: offsetX + mold.safeArea.x,
      top: offsetY + mold.safeArea.y,
      originX: 'left',
      originY: 'top',
      width: mold.safeArea.width,
      height: mold.safeArea.height,
      rx: mold.safeArea.radius,
      ry: mold.safeArea.radius,
      fill: 'rgba(37, 99, 235, 0.02)',
      stroke: '#3B82F6',
      strokeWidth: 1.5,
      strokeDashArray: [6, 4],
      selectable: false,
      evented: false
    });

    const safeLabel = new FabricText('可印刷安全区 (Print Area)', {
      left: offsetX + mold.safeArea.x + mold.safeArea.width / 2,
      top: offsetY + mold.safeArea.y - 10,
      originX: 'center',
      originY: 'center',
      fontSize: 10,
      fontFamily: 'system-ui, sans-serif',
      fill: '#3B82F6',
      selectable: false,
      evented: false
    });

    const centerX = offsetX + mold.safeArea.x + mold.safeArea.width / 2;
    const centerY = offsetY + mold.safeArea.y + mold.safeArea.height / 2;

    const vLine = new Line([centerX, offsetY + mold.safeArea.y, centerX, offsetY + mold.safeArea.y + mold.safeArea.height], {
      stroke: '#10B981',
      strokeWidth: 1.2,
      strokeDashArray: [4, 4],
      selectable: false,
      evented: false,
      visible: false
    });

    const hLine = new Line([offsetX + mold.safeArea.x, centerY, offsetX + mold.safeArea.x + mold.safeArea.width, centerY], {
      stroke: '#10B981',
      strokeWidth: 1.2,
      strokeDashArray: [4, 4],
      selectable: false,
      evented: false,
      visible: false
    });

    safeRectRef.current = safeRect;
    safeLabelRef.current = safeLabel;
    guideLinesRef.current = { vLine, hLine };
    canvas.add(safeRect, safeLabel, vLine, hLine);
  };

  const hideGuideLines = (canvas) => {
    const { vLine, hLine } = guideLinesRef.current;
    if (vLine) vLine.set('visible', false);
    if (hLine) hLine.set('visible', false);
    canvas.requestRenderAll();
  };

  const applyCraftToLogo = (imgObj, craft) => {
    imgObj.set({
      opacity: craft.opacity,
      shadow: new Shadow(craft.shadow)
    });
  };

  const loadLogo = async (imgUrl, craft = activeCraft, mold = activeMold, preserveTransform = false) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const prevLeft = logoObjectRef.current?.left;
    const prevTop = logoObjectRef.current?.top;
    const prevAngle = logoObjectRef.current?.angle || 0;

    if (logoObjectRef.current) {
      canvas.remove(logoObjectRef.current);
    }

    try {
      const img = await FabricImage.fromURL(imgUrl, { crossOrigin: 'anonymous' });

      const safeRect = safeRectRef.current;
      const areaLeft = safeRect ? safeRect.left : 60 + mold.safeArea.x;
      const areaTop = safeRect ? safeRect.top : 50 + mold.safeArea.y;
      const areaW = safeRect ? safeRect.getScaledWidth() : mold.safeArea.width;
      const areaH = safeRect ? safeRect.getScaledHeight() : mold.safeArea.height;

      const maxW = areaW * 0.58;
      const maxH = areaH * 0.58;
      const scale = Math.min(maxW / (img.width || 1), maxH / (img.height || 1), 1.2);

      const centerX = areaLeft + areaW / 2;
      const centerY = areaTop + areaH / 2;

      img.set({
        left: preserveTransform && prevLeft ? prevLeft : centerX,
        top: preserveTransform && prevTop ? prevTop : centerY,
        angle: preserveTransform ? prevAngle : 0,
        originX: 'center',
        originY: 'center',
        scaleX: scale,
        scaleY: scale,
        cornerColor: '#2563EB',
        cornerStrokeColor: '#FFFFFF',
        cornerSize: 10,
        cornerStyle: 'circle',
        transparentCorners: false,
        padding: 8,
        borderColor: '#2563EB',
        borderDashArray: [4, 3]
      });

      applyCraftToLogo(img, craft);

      const clipRect = new Rect({
        left: areaLeft,
        top: areaTop,
        originX: 'left',
        originY: 'top',
        width: areaW,
        height: areaH,
        rx: mold.safeArea.radius,
        ry: mold.safeArea.radius,
        absolutePositioned: true
      });

      clipRectRef.current = clipRect;
      img.clipPath = clipRect;

      logoObjectRef.current = img;
      canvas.add(img);
      if (!isEditingSafeArea) {
        canvas.setActiveObject(img);
      }
      canvas.requestRenderAll();

      setLogoScale(Math.round(scale * 100));
      setLogoRotation(Math.round(preserveTransform ? prevAngle : 0));
    } catch (err) {
      console.error('Logo 载入失败:', err);
    }
  };

  const handleObjectMoving = (e, canvas) => {
    const obj = e.target;
    const safeRect = safeRectRef.current;
    if (!obj || !safeRect) return;

    const areaLeft = safeRect.left;
    const areaTop = safeRect.top;
    const areaW = safeRect.getScaledWidth();
    const areaH = safeRect.getScaledHeight();

    const centerX = areaLeft + areaW / 2;
    const centerY = areaTop + areaH / 2;
    const snapDistance = 7;

    const { vLine, hLine } = guideLinesRef.current;
    let snappedX = false;
    let snappedY = false;

    if (Math.abs(obj.left - centerX) < snapDistance) {
      obj.left = centerX;
      snappedX = true;
    }

    if (Math.abs(obj.top - centerY) < snapDistance) {
      obj.top = centerY;
      snappedY = true;
    }

    if (vLine) {
      vLine.set({ x1: centerX, x2: centerX, y1: areaTop, y2: areaTop + areaH, visible: snappedX });
    }
    if (hLine) {
      hLine.set({ x1: areaLeft, x2: areaLeft + areaW, y1: centerY, y2: centerY, visible: snappedY });
    }

    setIsSnapping(snappedX || snappedY);
  };

  // 上传第 1 张图：自定义产品原型图
  const handleProductImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomProductName(file.name.replace(/\.[^.]+$/, ''));
        setCustomProductUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // 上传第 2 张图：企业 Logo
  const handleLogoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomLogoName(file.name.replace(/\.[^.]+$/, ''));
        setCustomLogoUrl(event.target.result);
        if (workMode === 'canvas-2d') {
          loadLogo(event.target.result, activeCraft, activeMold, false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // 居中复位
  const handleResetCenter = () => {
    const safeRect = safeRectRef.current;
    if (!logoObjectRef.current || !fabricRef.current || !safeRect) return;
    logoObjectRef.current.set({
      left: safeRect.left + safeRect.getScaledWidth() / 2,
      top: safeRect.top + safeRect.getScaledHeight() / 2,
      angle: 0
    });
    logoObjectRef.current.setCoords();
    fabricRef.current.requestRenderAll();
    setLogoRotation(0);
  };

  // 提交生成：
  // - 在 'dual-ai' 模式下，直接把【图1 纯净产品原型图】+【图2 纯净企业 Logo 图】发给阿里百炼 Qwen-Image-3.0
  // - 在 'canvas-2d' 模式下，导出 Fabric.js 合成图（自动隐藏安全区虚线框）发给阿里百炼
  const handleExportForAI = () => {
    const currentMoldInfo = customProductUrl
      ? { ...activeMold, name: customProductName || '自定义产品原型' }
      : activeMold;

    if (workMode === 'dual-ai') {
      if (onGenerateScene) {
        onGenerateScene({
          baseImageDataUrl: pureProductPng,
          logoImageDataUrl: pureLogoPng,
          mold: currentMoldInfo,
          craft: activeCraft,
          logoPrompt: logoPrompt,
          scenePrompt: scenePrompt
        });
      }
      return;
    }

    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.discardActiveObject();
    hideGuideLines(canvas);

    if (safeRectRef.current) safeRectRef.current.set('visible', false);
    if (safeLabelRef.current) safeLabelRef.current.set('visible', false);
    canvas.renderAll();

    const foregroundDataUrl = canvas.toDataURL({
      format: 'png',
      multiplier: 2
    });

    if (safeRectRef.current) safeRectRef.current.set('visible', true);
    if (safeLabelRef.current) safeLabelRef.current.set('visible', true);
    canvas.renderAll();

    if (onGenerateScene) {
      onGenerateScene({
        baseImageDataUrl: foregroundDataUrl,
        mold: currentMoldInfo,
        craft: activeCraft,
        scenePrompt: scenePrompt
      });
    }
  };

  const currentProductLabel = customProductUrl ? customProductName || '已上传产品图' : activeMold.name;
  const currentLogoLabel = customLogoUrl
    ? customLogoName || '已上传企业 Logo'
    : PRESET_LOGOS.find((l) => l.id === activePresetId)?.name || '极简科技标';

  return (
    <div className={`flex flex-col lg:flex-row gap-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm ${className}`}>
      {/* 左侧主工作区：默认双图 AI 智能贴合，可切换 2D 刀版微调 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部模式切换栏 */}
        <div className="w-full flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              {workMode === 'dual-ai'
                ? 'AI 双图智能融合 (图1 产品原型 + 图2 企业 Logo ➔ 百炼直出)'
                : '2D 贴花手动排版画板 (Fabric.js 引擎)'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setWorkMode('dual-ai')}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                workMode === 'dual-ai'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> AI 双图直出 (免排版·推荐)
            </button>
            <button
              onClick={() => setWorkMode('canvas-2d')}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                workMode === 'canvas-2d'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" /> 2D 手动刀版微调
            </button>
          </div>
        </div>

        {/* 模式一：AI 双图智能贴合 (左图1产品原型 + 右图2企业Logo) */}
        {workMode === 'dual-ai' ? (
          <div className="flex-1 flex flex-col justify-between gap-4">
            <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center my-auto">
              {/* 卡片 ①：产品原型图 */}
              <div className="md:col-span-5 rounded-2xl border-2 border-dashed border-indigo-200 bg-slate-50/70 p-4 flex flex-col items-center justify-between hover:border-indigo-400 transition">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-bold">
                      1
                    </span>
                    产品原型图
                  </span>
                  <label className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition">
                    <ImageIcon className="w-3.5 h-3.5" /> 上传产品图
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                      onChange={handleProductImageUpload}
                    />
                  </label>
                </div>

                {/* 产品图预览 + 点击任意位置直接设置 Logo 印制坐标 */}
                <div
                  onClick={handleProductPinClick}
                  title="点击产品图上任意位置，即可指定 Logo 合并印制点"
                  className="relative w-full aspect-square max-h-64 rounded-xl bg-white border border-slate-200/80 shadow-inner overflow-hidden flex items-center justify-center cursor-crosshair group select-none"
                >
                  {pureProductPng && (
                    <img
                      src={pureProductPng}
                      alt="产品原型图"
                      className="w-full h-full object-contain p-2 pointer-events-none"
                    />
                  )}

                  {/* 实时可视化 Logo 印制锚点与半透明大小示意 */}
                  <div
                    style={{
                      left: `${logoPin.x}%`,
                      top: `${logoPin.y}%`,
                      width: `${selectedSize.scalePct}%`
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200 flex flex-col items-center"
                  >
                    <div className="relative w-full aspect-square rounded-lg border-2 border-dashed border-blue-600 bg-blue-500/10 flex items-center justify-center p-1 shadow-sm">
                      {pureLogoPng && (
                        <img
                          src={pureLogoPng}
                          alt="Logo位置示意"
                          className="w-full h-full object-contain opacity-75 mix-blend-multiply"
                        />
                      )}
                      <span className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow">
                        🎯
                      </span>
                    </div>
                  </div>

                  <div className="absolute bottom-2 inset-x-2 py-1 px-2 rounded-lg bg-slate-900/75 text-white text-[10px] font-medium text-center pointer-events-none">
                    🎯 点击画面任意处设定 Logo 位置（当前: {selectedPos.name}）
                  </div>
                </div>

                {/* 内置 3C 模具快速切换 */}
                <div className="w-full mt-3">
                  <div className="text-[11px] text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>或选用内置 3C 原型模具：</span>
                    {customProductUrl && (
                      <button
                        onClick={() => setCustomProductUrl(null)}
                        className="text-indigo-600 hover:underline font-semibold cursor-pointer"
                      >
                        重置为内置模具
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {PRODUCT_MOLDS.map((mold) => (
                      <button
                        key={mold.id}
                        onClick={() => {
                          setCustomProductUrl(null);
                          setActiveMold(mold);
                        }}
                        className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold truncate transition cursor-pointer ${
                          !customProductUrl && activeMold.id === mold.id
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {mold.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 中间 + 号连接器 */}
              <div className="md:col-span-1 flex flex-col items-center justify-center gap-1 py-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 text-center leading-tight">
                  AI 自动
                  <br />
                  3D 贴合
                </span>
              </div>

              {/* 卡片 ②：企业品牌 Logo 图 */}
              <div className="md:col-span-5 rounded-2xl border-2 border-dashed border-blue-200 bg-slate-50/70 p-4 flex flex-col items-center justify-between hover:border-blue-400 transition">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">
                      2
                    </span>
                    企业品牌 Logo
                  </span>
                  <label className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition">
                    <Upload className="w-3.5 h-3.5" /> 上传 Logo 图
                    <input
                      type="file"
                      accept="image/png, image/svg+xml, image/jpeg, image/webp"
                      className="hidden"
                      onChange={handleLogoFileUpload}
                    />
                  </label>
                </div>

                {/* Logo 预览 */}
                <label className="relative w-full aspect-square max-h-64 rounded-xl bg-white border border-slate-200/80 shadow-inner overflow-hidden flex items-center justify-center cursor-pointer group">
                  {pureLogoPng && (
                    <img
                      src={pureLogoPng}
                      alt="企业品牌 Logo"
                      className="w-full h-full object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                    点击更换企业 Logo
                  </div>
                  <input
                    type="file"
                    accept="image/png, image/svg+xml, image/jpeg, image/webp"
                    className="hidden"
                    onChange={handleLogoFileUpload}
                  />
                </label>

                {/* 内置示例 Logo 快速切换 */}
                <div className="w-full mt-3">
                  <div className="text-[11px] text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>或选用内置示例 Logo：</span>
                    {customLogoUrl && (
                      <button
                        onClick={() => setCustomLogoUrl(null)}
                        className="text-blue-600 hover:underline font-semibold cursor-pointer"
                      >
                        重置为示例 Logo
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {PRESET_LOGOS.map((logo) => (
                      <button
                        key={logo.id}
                        onClick={() => {
                          setCustomLogoUrl(null);
                          setActivePresetId(logo.id);
                        }}
                        className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold truncate transition cursor-pointer ${
                          !customLogoUrl && activePresetId === logo.id
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {logo.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 底部双图融合管线状态说明 */}
            <div className="w-full rounded-2xl bg-gradient-to-r from-indigo-50/80 via-blue-50/80 to-slate-50 border border-indigo-100 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2 text-slate-700">
                <span className="px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-700 font-bold">
                  图1: {currentProductLabel}
                </span>
                <span className="text-slate-400 font-bold">+</span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-300 text-slate-800 font-bold">
                  图2: {currentLogoLabel}
                </span>
                <span className="text-slate-400 font-bold">+</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-bold">
                  工艺: {activeCraft.name}
                </span>
              </div>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 无需手动对齐，百炼 Qwen-Image-3.0 自动识别产品 3D 表面贴合
              </span>
            </div>
          </div>
        ) : (
          /* 模式二：Fabric.js 2D 刀版手动微调模式 */
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 font-semibold flex items-center gap-1.5 cursor-pointer transition">
                  <ImageIcon className="w-3.5 h-3.5" /> ① 上传产品底图
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    onChange={handleProductImageUpload}
                  />
                </label>

                <label className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition">
                  <Upload className="w-3.5 h-3.5" /> ② 上传企业 Logo
                  <input
                    type="file"
                    accept="image/png, image/svg+xml, image/jpeg"
                    className="hidden"
                    onChange={handleLogoFileUpload}
                  />
                </label>

                <button
                  onClick={toggleSafeAreaEdit}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium flex items-center gap-1 transition cursor-pointer ${
                    isEditingSafeArea
                      ? 'border-amber-500 bg-amber-50 text-amber-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {isEditingSafeArea ? (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-amber-600" /> 完成安全区调整
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" /> 调整安全区框
                    </>
                  )}
                </button>

                <button
                  onClick={handleResetCenter}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> 居中
                </button>
              </div>

              {isSnapping && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 磁吸中心线已对齐
                </span>
              )}
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-slate-200/70 shadow-inner flex items-center justify-center p-3 bg-[#F8FAFC]">
              <canvas ref={canvasElRef} />
            </div>

            <div className="w-full mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 px-2">
              <div className="flex items-center gap-4">
                <span>缩放: <strong>{logoScale}%</strong></span>
                <span>旋转: <strong>{logoRotation}°</strong></span>
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 导出时自动隐藏虚线框
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 右侧：工艺选择、Logo 合并位置/提示词、AI 场景提示词与一键双图直出按钮 */}
      <div className="w-full lg:w-[420px] flex flex-col gap-3.5 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6 pt-4 lg:pt-0">
        {/* 1. 工艺仿真切换 */}
        <div>
          <label className="text-xs font-bold text-slate-700 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 1. 选择 Logo 表面定制工艺
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {CRAFT_MODES.map((craft) => (
              <button
                key={craft.id}
                onClick={() => {
                  setActiveCraft(craft);
                  setLogoPrompt(buildLogoFusionPrompt(logoPin.label, selectedSize, craft));
                }}
                className={`p-2 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  activeCraft.id === craft.id
                    ? 'border-amber-500 bg-amber-50/40 text-amber-950 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-0.5">
                  <span className="text-xs font-bold">{craft.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-medium">
                    {craft.badge}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 line-clamp-1">
                  {craft.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Logo 合并位置、大小与自定义融合提示词 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 tracking-wider uppercase flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" /> 2. Logo 合并位置与融合提示词
            </label>
            <span className="text-[10px] text-blue-600 font-semibold">
              可点选下方预设、点击左图1定点，或直接改词
            </span>
          </div>

          {/* 快捷位置预设 */}
          <div className="flex flex-wrap gap-1 mb-1.5">
            {LOGO_POSITIONS.map((pos) => (
              <button
                key={pos.id}
                onClick={() => {
                  setSelectedPos(pos);
                  setLogoPin({ x: pos.x, y: pos.y, label: pos.desc });
                  setLogoPrompt(buildLogoFusionPrompt(pos.desc, selectedSize, activeCraft));
                }}
                className={`py-1 px-2 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
                  selectedPos.id === pos.id
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {pos.name}
              </button>
            ))}
          </div>

          {/* 快捷大小比例预设 */}
          <div className="grid grid-cols-3 gap-1.5 mb-1.5">
            {LOGO_SIZES.map((sz) => (
              <button
                key={sz.id}
                onClick={() => {
                  setSelectedSize(sz);
                  setLogoPrompt(buildLogoFusionPrompt(logoPin.label, sz, activeCraft));
                }}
                className={`py-1 px-2 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
                  selectedSize.id === sz.id
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {sz.name}
              </button>
            ))}
          </div>

          {/* 可自由编写的 Logo 合并位置与工艺提示词输入框 */}
          <textarea
            value={logoPrompt}
            onChange={(e) => setLogoPrompt(e.target.value)}
            rows={2}
            placeholder="编写 Logo 合并位置、大小、角度与工艺要求（例如：将图2的Logo印在图1产品正中央偏上位置...）"
            className="w-full rounded-xl border border-blue-200 bg-blue-50/20 p-2 text-xs text-slate-700 focus:outline-none focus:border-blue-600 resize-none"
          />
        </div>

        {/* 3. AI 场景模板与提示词输入 */}
        <div>
          <label className="text-xs font-bold text-slate-700 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-indigo-600" /> 3. AI 商拍背景与光影提示词
          </label>
          <div className="grid grid-cols-2 gap-1.5 mb-1.5">
            {SCENE_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => {
                  setSelectedScene(tpl);
                  setScenePrompt(tpl.prompt);
                }}
                className={`py-1.5 px-2.5 rounded-lg border text-[11px] font-semibold text-left truncate transition cursor-pointer ${
                  selectedScene.id === tpl.id
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {tpl.name}
              </button>
            ))}
          </div>
          <textarea
            value={scenePrompt}
            onChange={(e) => setScenePrompt(e.target.value)}
            rows={2}
            placeholder="输入你想生成的背景场景与光影描述..."
            className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        {/* 3. 提交 AI 双图直出按钮 */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex flex-col gap-2">
          <button
            onClick={handleExportForAI}
            disabled={isGenerating}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                正在将【产品图 + Logo】双图送入百炼生成...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {workMode === 'dual-ai'
                  ? '一键双图直出 2K 商拍大片 (阿里百炼 Qwen-Image-3.0)'
                  : '一键从 2D 刀版生成商拍大图'}
              </>
            )}
          </button>
          <p className="text-[11px] text-slate-400 text-center">
            底层直连阿里百炼 <code className="text-slate-600 font-semibold">qwen-image-3.0</code> (2048×2048 2K 多图融合)
          </p>
        </div>
      </div>
    </div>
  );
}
