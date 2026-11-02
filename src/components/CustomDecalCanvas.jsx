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
  Wand2
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

// 4 大 2D 仿真定制工艺
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

export default function CustomDecalCanvas({
  onGenerateScene,
  isGenerating = false,
  className = ''
}) {
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
  const [isEditingSafeArea, setIsEditingSafeArea] = useState(false);
  const [selectedScene, setSelectedScene] = useState(SCENE_TEMPLATES[0]);
  const [scenePrompt, setScenePrompt] = useState(SCENE_TEMPLATES[0].prompt);
  const [isSnapping, setIsSnapping] = useState(false);
  const [logoScale, setLogoScale] = useState(100);
  const [logoRotation, setLogoRotation] = useState(0);

  // 初始化 Fabric.js v7 画布
  useEffect(() => {
    if (!canvasElRef.current) return;

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

    // 监听拖拽磁吸对齐与安全区同步
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
  }, [activeMold, customProductUrl]);

  // 同步安全区虚线框到裁剪蒙版
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

  // 切换“调整安全区范围”模式
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

  // 切换工艺时，实时更新 Logo 材质滤镜与光泽阴影
  useEffect(() => {
    if (!fabricRef.current) return;
    if (!customLogoUrl) {
      const updatedUrl = buildPresetLogoUrl(activePresetId, activeCraft.logoColor);
      loadLogo(updatedUrl, activeCraft, activeMold, true);
    } else if (logoObjectRef.current) {
      applyCraftToLogo(logoObjectRef.current, activeCraft);
      fabricRef.current.requestRenderAll();
    }
  }, [activeCraft, activePresetId]);

  // 渲染用户上传的自定义产品底图 + 可印刷安全区
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

  // 渲染预设 3C 产品底模
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

  // 绘制可印刷安全区虚线框与十字磁吸线
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

  // 载入企业 Logo
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

  // 磁吸对齐逻辑
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

  // 上传第 1 张图：自定义产品底图
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
        setCustomLogoUrl(event.target.result);
        loadLogo(event.target.result, activeCraft, activeMold, false);
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

  // 导出纯净的合成图给阿里云百炼 (自动隐藏蓝色虚线框和辅助文字！)
  const handleExportForAI = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.discardActiveObject();
    hideGuideLines(canvas);

    // 导出前隐藏蓝色安全区虚线框和文字，确保导出的产品图 100% 纯净无 UI 污染！
    if (safeRectRef.current) safeRectRef.current.set('visible', false);
    if (safeLabelRef.current) safeLabelRef.current.set('visible', false);
    canvas.renderAll();

    const foregroundDataUrl = canvas.toDataURL({
      format: 'png',
      multiplier: 2
    });

    // 导出后立即恢复安全区虚线框显示
    if (safeRectRef.current) safeRectRef.current.set('visible', true);
    if (safeLabelRef.current) safeLabelRef.current.set('visible', true);
    canvas.renderAll();

    if (onGenerateScene) {
      onGenerateScene({
        baseImageDataUrl: foregroundDataUrl,
        mold: customProductUrl
          ? { ...activeMold, name: customProductName || '自定义上传产品' }
          : activeMold,
        craft: activeCraft,
        scenePrompt: scenePrompt
      });
    }
  };

  return (
    <div className={`flex flex-col lg:flex-row gap-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm ${className}`}>
      {/* 左侧：Fabric.js 贴花交互主工作区 */}
      <div className="flex-1 flex flex-col items-center">
        {/* 顶部双图上传与安全区调节操作条 */}
        <div className="w-full flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              2D 贴花画板 (产品底图 + 企业 Logo)
            </span>
            {isSnapping && (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 磁吸中心线已对齐
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 按钮 1：上传自定义产品底图 */}
            <label className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 font-semibold flex items-center gap-1.5 cursor-pointer transition">
              <ImageIcon className="w-3.5 h-3.5" /> ① 上传产品底图
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleProductImageUpload}
              />
            </label>

            {/* 按钮 2：上传企业 Logo */}
            <label className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition">
              <Upload className="w-3.5 h-3.5" /> ② 上传企业 Logo
              <input
                type="file"
                accept="image/png, image/svg+xml, image/jpeg"
                className="hidden"
                onChange={handleLogoFileUpload}
              />
            </label>

            {/* 按钮 3：调整安全区虚线框位置 */}
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
              title="Logo 一键居中"
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> 居中
            </button>
          </div>
        </div>

        {/* 核心画布区 */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200/70 shadow-inner flex items-center justify-center p-3 bg-[#F8FAFC]">
          <canvas ref={canvasElRef} />
        </div>

        {/* 底部微调手柄状态 */}
        <div className="w-full mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 px-2">
          <div className="flex items-center gap-4">
            <span>缩放: <strong>{logoScale}%</strong></span>
            <span>旋转: <strong>{logoRotation}°</strong></span>
            <span className="text-indigo-600 font-medium">
              当前工艺: <strong>{activeCraft.name}</strong>
            </span>
            <span className="text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 导出时自动隐藏虚线框
            </span>
          </div>
          <span className="text-slate-400">
            {isEditingSafeArea
              ? '🔧 当前正在调整蓝色安全区范围，调整完请点击上方「完成安全区调整」'
              : '💡 支持上传您的任意商品白底图 + 企业 Logo，点击右侧一键生成真实商拍场景'}
          </span>
        </div>
      </div>

      {/* 右侧：产品模具、工艺、AI 场景模版与生成面板 */}
      <div className="w-full lg:w-96 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6 pt-4 lg:pt-0">
        {/* 1. 模具切换或自定义产品图状态 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 tracking-wider uppercase flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" /> 1. 产品底图 (内置模具或上传)
            </label>
            {customProductUrl && (
              <button
                onClick={() => setCustomProductUrl(null)}
                className="text-[11px] text-blue-600 hover:underline cursor-pointer"
              >
                恢复内置 3C 模具
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {PRODUCT_MOLDS.map((mold) => (
              <button
                key={mold.id}
                onClick={() => {
                  setCustomProductUrl(null);
                  setActiveMold(mold);
                }}
                className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                  !customProductUrl && activeMold.id === mold.id
                    ? 'border-blue-600 bg-blue-50/60 text-blue-900 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="text-[11px] font-bold truncate">{mold.name}</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{mold.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. 工艺仿真切换 */}
        <div>
          <label className="text-xs font-bold text-slate-700 tracking-wider uppercase mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 2. 选择 Logo 定制工艺
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CRAFT_MODES.map((craft) => (
              <button
                key={craft.id}
                onClick={() => setActiveCraft(craft)}
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

        {/* 3. 预设快速测试 Logo */}
        <div>
          <label className="text-xs font-bold text-slate-700 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-slate-600" /> 示例 Logo (或点击左上方上传)
          </label>
          <div className="flex items-center gap-2">
            {PRESET_LOGOS.map((logo) => (
              <button
                key={logo.id}
                onClick={() => {
                  setCustomLogoUrl(null);
                  setActivePresetId(logo.id);
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
                  !customLogoUrl && activePresetId === logo.id
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:border-blue-400 text-slate-600 hover:text-blue-600'
                }`}
              >
                {logo.name}
              </button>
            ))}
          </div>
        </div>

        {/* 4. AI 场景模板与提示词输入 */}
        <div>
          <label className="text-xs font-bold text-slate-700 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-indigo-600" /> 3. 选择 AI 商拍场景模版与光影
          </label>
          <div className="grid grid-cols-2 gap-1.5 mb-2">
            {SCENE_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => {
                  setSelectedScene(tpl);
                  setScenePrompt(tpl.prompt);
                }}
                className={`py-1.5 px-2.5 rounded-lg border text-[11px] font-semibold text-left truncate transition cursor-pointer ${
                  selectedScene.id === tpl.id
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
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
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        {/* 5. 提交 AI 场景融合生成按钮 */}
        <div className="mt-auto pt-2 border-t border-slate-100 flex flex-col gap-1.5">
          <button
            onClick={handleExportForAI}
            disabled={isGenerating}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                正在调用阿里云百炼生成真实商拍图...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                一键生成高奢商拍大图 (阿里百炼直出)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
