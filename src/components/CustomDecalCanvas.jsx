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
  RefreshCw
} from 'lucide-react';

// 3C 科技礼品底模配置
const PRODUCT_MOLDS = [
  {
    id: 'powerbank',
    name: '磁吸无线充电宝',
    desc: '阳极氧化铝机身，磨砂质感',
    width: 300,
    height: 440,
    radius: 32,
    bodyColor: '#E2E8F0',
    borderColor: '#94A3B8',
    innerColor: '#F1F5F9',
    // 激光印刷安全区 (相对于机身左上角的偏移)
    safeArea: { x: 40, y: 90, width: 220, height: 240, radius: 14 }
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
    // 铭牌印刷安全区
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
  const guideLinesRef = useRef({ vLine: null, hLine: null });

  const [activeMold, setActiveMold] = useState(PRODUCT_MOLDS[0]);
  const [activeCraft, setActiveCraft] = useState(CRAFT_MODES[0]);
  const [activePresetId, setActivePresetId] = useState('tech');
  const [customUploadedUrl, setCustomUploadedUrl] = useState(null);
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

    // 1. 绘制产品机身、工业细节与安全印刷区
    renderMoldAndSafeArea(canvas, activeMold);

    // 2. 载入当前 Logo
    const targetUrl = customUploadedUrl || buildPresetLogoUrl(activePresetId, activeCraft.logoColor);
    loadLogo(targetUrl, activeCraft, activeMold);

    // 3. 监听拖拽磁吸对齐事件
    canvas.on('object:moving', (e) => {
      handleObjectMoving(e, canvas, activeMold);
    });

    canvas.on('object:scaling', (e) => {
      if (e.target) {
        setLogoScale(Math.round((e.target.scaleX || 1) * 100));
      }
    });

    canvas.on('object:rotating', (e) => {
      if (e.target) {
        setLogoRotation(Math.round(e.target.angle || 0));
      }
    });

    canvas.on('object:modified', (e) => {
      setIsSnapping(false);
      hideGuideLines(canvas);
      if (e.target) {
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
  }, [activeMold]);

  // 切换工艺时，实时更新 Logo 材质滤镜与光泽阴影
  useEffect(() => {
    if (!fabricRef.current) return;
    if (!customUploadedUrl) {
      const updatedUrl = buildPresetLogoUrl(activePresetId, activeCraft.logoColor);
      loadLogo(updatedUrl, activeCraft, activeMold, true);
    } else if (logoObjectRef.current) {
      applyCraftToLogo(logoObjectRef.current, activeCraft);
      fabricRef.current.renderAll();
    }
  }, [activeCraft, activePresetId]);

  // 渲染 3C 产品底模与可印刷安全区 (兼容 Fabric v7 originX/originY 规范)
  const renderMoldAndSafeArea = (canvas, mold) => {
    const offsetX = 60;
    const offsetY = 50;

    // 1. 产品外层金属机身
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

    // 2. 产品内层阳极氧化高光面板
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

    // 3. 根据不同 3C 产品绘制工业设计细节
    if (mold.id === 'powerbank') {
      // MagSafe 磁吸环
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
      // 底部电量指示灯
      const ledLabel = new FabricText('10000mAh · MagSafe Fast Charge', {
        left: offsetX + mold.width / 2,
        top: offsetY + mold.height - 32,
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
      // 四角精密内六角螺丝细节
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

    // 4. 矢量虚线安全印刷区 (Print Area Outline)
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

    // 5. 磁吸中心参考线 (默认隐藏，磁吸时高亮)
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

    guideLinesRef.current = { vLine, hLine };
    canvas.add(safeRect, safeLabel, vLine, hLine);
  };

  const hideGuideLines = (canvas) => {
    const { vLine, hLine } = guideLinesRef.current;
    if (vLine) vLine.set('visible', false);
    if (hLine) hLine.set('visible', false);
    canvas.requestRenderAll();
  };

  // 为 Logo 图层赋予工艺质感
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

      const offsetX = 60;
      const offsetY = 50;
      const targetArea = mold.safeArea;

      // 自适应安全区大小
      const maxW = targetArea.width * 0.58;
      const maxH = targetArea.height * 0.58;
      const scale = Math.min(maxW / (img.width || 1), maxH / (img.height || 1), 1.2);

      const centerX = offsetX + targetArea.x + targetArea.width / 2;
      const centerY = offsetY + targetArea.y + targetArea.height / 2;

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

      // 配置安全区裁剪 (兼容 Fabric v7 originX/originY)
      const clipRect = new Rect({
        left: offsetX + targetArea.x,
        top: offsetY + targetArea.y,
        originX: 'left',
        originY: 'top',
        width: targetArea.width,
        height: targetArea.height,
        rx: targetArea.radius,
        ry: targetArea.radius,
        absolutePositioned: true
      });

      img.clipPath = clipRect;

      logoObjectRef.current = img;
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.requestRenderAll();

      setLogoScale(Math.round(scale * 100));
      setLogoRotation(Math.round(preserveTransform ? prevAngle : 0));
    } catch (err) {
      console.error('Logo 载入失败:', err);
    }
  };

  // 磁吸对齐逻辑 (中心线吸附 + 绿色十字辅助线)
  const handleObjectMoving = (e, canvas, mold) => {
    const obj = e.target;
    if (!obj) return;

    const offsetX = 60;
    const offsetY = 50;
    const centerX = offsetX + mold.safeArea.x + mold.safeArea.width / 2;
    const centerY = offsetY + mold.safeArea.y + mold.safeArea.height / 2;
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

    if (vLine) vLine.set('visible', snappedX);
    if (hLine) hLine.set('visible', snappedY);

    setIsSnapping(snappedX || snappedY);
  };

  // 用户本地上传企业 Logo
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomUploadedUrl(event.target.result);
        loadLogo(event.target.result, activeCraft, activeMold, false);
      }
    };
    reader.readAsDataURL(file);
  };

  // 居中复位
  const handleResetCenter = () => {
    if (!logoObjectRef.current || !fabricRef.current) return;
    const offsetX = 60;
    const offsetY = 50;
    const targetArea = activeMold.safeArea;
    logoObjectRef.current.set({
      left: offsetX + targetArea.x + targetArea.width / 2,
      top: offsetY + targetArea.y + targetArea.height / 2,
      angle: 0
    });
    logoObjectRef.current.setCoords();
    fabricRef.current.requestRenderAll();
    setLogoRotation(0);
  };

  // 导出 AI 渲染三件套
  const handleExportForAI = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.discardActiveObject();
    hideGuideLines(canvas);
    canvas.renderAll();

    const foregroundDataUrl = canvas.toDataURL({
      format: 'png',
      multiplier: 2
    });

    if (onGenerateScene) {
      onGenerateScene({
        baseImageDataUrl: foregroundDataUrl,
        mold: activeMold,
        craft: activeCraft
      });
    }
  };

  return (
    <div className={`flex flex-col lg:flex-row gap-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm ${className}`}>
      {/* 左侧：Fabric.js 贴花交互主工作区 */}
      <div className="flex-1 flex flex-col items-center">
        {/* 顶部操作条 */}
        <div className="w-full flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              2D 矢量贴花画板 (Logo 100% 绝对保真)
            </span>
            {isSnapping && (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 磁吸中心线已对齐
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetCenter}
              title="一键居中"
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> 居中复位
            </button>
            <label className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer shadow-sm transition">
              <Upload className="w-3.5 h-3.5" /> 上传企业 Logo (PNG/SVG)
              <input
                type="file"
                accept="image/png, image/svg+xml, image/jpeg"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
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
              <CheckCircle2 className="w-3.5 h-3.5" /> 矢量安全区保护中
            </span>
          </div>
          <span className="text-slate-400">💡 提示：拖拽 Logo 靠近中心自动磁吸，超出蓝色虚线框自动裁剪</span>
        </div>
      </div>

      {/* 右侧：产品模具与工艺参数控制面板 */}
      <div className="w-full lg:w-80 flex flex-col gap-5 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6 pt-4 lg:pt-0">
        {/* 1. 模具切换 */}
        <div>
          <label className="text-xs font-bold text-slate-700 tracking-wider uppercase mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" /> 选择 3C 科技礼品底模
          </label>
          <div className="grid grid-cols-1 gap-2">
            {PRODUCT_MOLDS.map((mold) => (
              <button
                key={mold.id}
                onClick={() => setActiveMold(mold)}
                className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                  activeMold.id === mold.id
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold">{mold.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{mold.desc}</div>
                </div>
                {activeMold.id === mold.id && (
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 2. 工艺仿真切换 */}
        <div>
          <label className="text-xs font-bold text-slate-700 tracking-wider uppercase mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 选择定制工艺 (消除贴纸感)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CRAFT_MODES.map((craft) => (
              <button
                key={craft.id}
                onClick={() => setActiveCraft(craft)}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  activeCraft.id === craft.id
                    ? 'border-amber-500 bg-amber-50/40 text-amber-950 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold">{craft.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-medium">
                    {craft.badge}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                  {craft.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. 预设快速测试 Logo */}
        <div>
          <label className="text-xs font-bold text-slate-700 tracking-wider uppercase mb-2 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-slate-600" /> 快速体验企业示例 Logo
          </label>
          <div className="flex items-center gap-2">
            {PRESET_LOGOS.map((logo) => (
              <button
                key={logo.id}
                onClick={() => {
                  setCustomUploadedUrl(null);
                  setActivePresetId(logo.id);
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
                  !customUploadedUrl && activePresetId === logo.id
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:border-blue-400 text-slate-600 hover:text-blue-600'
                }`}
              >
                {logo.name}
              </button>
            ))}
          </div>
        </div>

        {/* 4. 提交 AI 场景融合生成按钮 */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-2">
          <button
            onClick={handleExportForAI}
            disabled={isGenerating}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                正在调用通义万相生成光影大图...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                一键生成高奢商拍大图 (Logo 零畸变)
              </>
            )}
          </button>
          <p className="text-[10px] text-slate-400 text-center">
            自动导出 100% 矢量保真图，仅由 AI 置换胡桃木/展台与边缘阴影
          </p>
        </div>
      </div>
    </div>
  );
}
