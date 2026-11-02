import React, { useEffect, useRef, useState } from 'react';
import {
  Canvas,
  Rect,
  Circle,
  FabricImage,
  Shadow,
  Line,
  util
} from 'fabric';
import {
  Upload,
  Maximize2,
  RotateCw,
  Sparkles,
  Layers,
  HelpCircle,
  CheckCircle2,
  Sliders,
  Trash2,
  RefreshCw,
  Eye
} from 'lucide-react';

// 3C 科技礼品底模配置
const PRODUCT_MOLDS = [
  {
    id: 'powerbank',
    name: '磁吸无线充电宝',
    desc: '阳极氧化铝机身，磨砂质感',
    width: 320,
    height: 480,
    radius: 28,
    bodyColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    // 激光印刷安全区 (居中)
    safeArea: { x: 40, y: 120, width: 240, height: 240, radius: 12 }
  },
  {
    id: 'keyboard',
    name: '客制化机械键盘铭牌',
    desc: 'PBT 键帽与铝合金上盖',
    width: 440,
    height: 280,
    radius: 16,
    bodyColor: '#E2E8F0',
    borderColor: '#CBD5E1',
    // 铭牌印刷安全区
    safeArea: { x: 70, y: 70, width: 300, height: 140, radius: 8 }
  },
  {
    id: 'charger',
    name: '氮化镓 65W 快充',
    desc: '高阻燃 PC 哑光磨砂外壳',
    width: 300,
    height: 380,
    radius: 20,
    bodyColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    safeArea: { x: 50, y: 90, width: 200, height: 200, radius: 10 }
  }
];

// 4 大 2D 仿真定制工艺
const CRAFT_MODES = [
  {
    id: 'laser',
    name: '金属激光镭雕',
    badge: '推荐',
    desc: '阳极氧化铝轻微烧蚀，透出金属漫反射银白质感',
    style: {
      filter: 'grayscale(100%) brightness(1.15) contrast(1.1)',
      shadow: '0 1px 1px rgba(0,0,0,0.35) inset, 0 1px 0 rgba(255,255,255,0.7)',
      mixBlendMode: 'luminosity'
    }
  },
  {
    id: 'uv_emboss',
    name: 'UV 3D 微浮雕',
    badge: '高奢',
    desc: '0.2mm 环保油墨凸起，清漆覆膜反光与微投影',
    style: {
      filter: 'drop-shadow(-1px -1px 0.5px rgba(255,255,255,0.9)) drop-shadow(1.5px 2px 2px rgba(0,0,0,0.28))',
      mixBlendMode: 'normal'
    }
  },
  {
    id: 'silk_screen',
    name: '高精丝网印',
    badge: '经典',
    desc: '高遮盖力纯色哑光墨层，与机身自然贴合',
    style: {
      filter: 'contrast(1.05)',
      mixBlendMode: 'multiply'
    }
  },
  {
    id: 'gold_foil',
    name: '香槟烫金/烫银',
    badge: '尊贵',
    desc: '金属真空镀铝渐变反光，高奢伴手礼首选',
    style: {
      filter: 'sepia(80%) saturate(300%) brightness(1.1) drop-shadow(0 1px 1px rgba(0,0,0,0.25))',
      mixBlendMode: 'hard-light'
    }
  }
];

// 预设高频商业企业 Logo
const PRESET_LOGOS = [
  {
    name: '极简科技标',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="%230F172A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>'
  },
  {
    name: '英文字母标',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="80" viewBox="0 0 220 80"><text x="10" y="55" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" fill="%230F172A" letter-spacing="4">NEXUS</text></svg>'
  },
  {
    name: '极速闪电标',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 24 24" fill="%230F172A"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>'
  }
];

export default function CustomDecalCanvas({
  onGenerateScene,
  isGenerating = false,
  className = ''
}) {
  const canvasElRef = useRef(null);
  const fabricRef = useRef(null);
  const logoObjectRef = useRef(null);

  const [activeMold, setActiveMold] = useState(PRODUCT_MOLDS[0]);
  const [activeCraft, setActiveCraft] = useState(CRAFT_MODES[0]);
  const [isSnapping, setIsSnapping] = useState(false);
  const [logoScale, setLogoScale] = useState(1);
  const [logoRotation, setLogoRotation] = useState(0);

  // 初始化 Fabric 画布
  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = new Canvas(canvasElRef.current, {
      width: activeMold.width + 120,
      height: activeMold.height + 120,
      backgroundColor: '#F8FAFC',
      selection: true,
      preserveObjectStacking: true
    });

    fabricRef.current = canvas;

    // 绘制产品机身与安全印刷区
    renderMoldAndSafeArea(canvas, activeMold);

    // 载入默认第一个 Logo
    loadLogo(PRESET_LOGOS[0].url);

    // 监听拖拽对齐磁吸事件
    canvas.on('object:moving', (e) => {
      handleObjectMoving(e, canvas, activeMold);
    });

    canvas.on('object:modified', (e) => {
      setIsSnapping(false);
      if (e.target) {
        setLogoScale(Math.round((e.target.scaleX || 1) * 100));
        setLogoRotation(Math.round(e.target.angle || 0));
      }
    });

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [activeMold]);

  // 渲染产品底模与可印刷安全区
  const renderMoldAndSafeArea = (canvas, mold) => {
    // 1. 产品外壳底模 (背景白卡阴影)
    const offsetX = 60;
    const offsetY = 60;

    const productBody = new Rect({
      left: offsetX,
      top: offsetY,
      width: mold.width,
      height: mold.height,
      rx: mold.radius,
      ry: mold.radius,
      fill: mold.bodyColor,
      stroke: mold.borderColor,
      strokeWidth: 1.5,
      selectable: false,
      evented: false,
      shadow: new Shadow({
        color: 'rgba(15, 23, 42, 0.08)',
        blur: 24,
        offsetX: 0,
        offsetY: 12
      })
    });

    // 2. 磁吸充电圈示意 (针对充电宝微装饰)
    const magCircle = new Circle({
      left: offsetX + mold.width / 2,
      top: offsetY + mold.height / 2,
      radius: 65,
      originX: 'center',
      originY: 'center',
      fill: 'transparent',
      stroke: '#E2E8F0',
      strokeWidth: 2,
      strokeDashArray: [6, 6],
      selectable: false,
      evented: false
    });

    // 3. 矢量虚线安全印刷区 (Print Area Outline)
    const safeRect = new Rect({
      left: offsetX + mold.safeArea.x,
      top: offsetY + mold.safeArea.y,
      width: mold.safeArea.width,
      height: mold.safeArea.height,
      rx: mold.safeArea.radius,
      ry: mold.safeArea.radius,
      fill: 'rgba(59, 130, 246, 0.03)',
      stroke: '#3B82F6',
      strokeWidth: 1.5,
      strokeDashArray: [5, 4],
      selectable: false,
      evented: false
    });

    canvas.add(productBody, magCircle, safeRect);
    canvas.sendObjectToBack(magCircle);
    canvas.sendObjectToBack(productBody);
  };

  // 载入企业 Logo
  const loadLogo = async (imgUrl) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // 清理旧 Logo
    if (logoObjectRef.current) {
      canvas.remove(logoObjectRef.current);
    }

    try {
      const img = await FabricImage.fromURL(imgUrl, { crossOrigin: 'anonymous' });
      
      const offsetX = 60;
      const offsetY = 60;
      const targetArea = activeMold.safeArea;

      // 缩放适应安全区
      const maxW = targetArea.width * 0.7;
      const maxH = targetArea.height * 0.7;
      const scale = Math.min(maxW / (img.width || 1), maxH / (img.height || 1), 1);

      img.set({
        left: offsetX + targetArea.x + targetArea.width / 2,
        top: offsetY + targetArea.y + targetArea.height / 2,
        originX: 'center',
        originY: 'center',
        scaleX: scale,
        scaleY: scale,
        cornerColor: '#2563EB',
        cornerStrokeColor: '#FFFFFF',
        cornerSize: 10,
        cornerStyle: 'circle',
        transparentCorners: false,
        padding: 6,
        borderColor: '#3B82F6',
        borderDashArray: [3, 3]
      });

      // 配置安全区裁剪 (超出虚线框自动隐藏)
      const clipRect = new Rect({
        left: offsetX + targetArea.x,
        top: offsetY + targetArea.y,
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
      canvas.renderAll();

      setLogoScale(Math.round(scale * 100));
      setLogoRotation(0);
    } catch (err) {
      console.error('Logo 载入失败:', err);
    }
  };

  // 磁吸对齐逻辑 (中心线吸附)
  const handleObjectMoving = (e, canvas, mold) => {
    const obj = e.target;
    if (!obj) return;

    const offsetX = 60;
    const offsetY = 60;
    const centerX = offsetX + mold.width / 2;
    const centerY = offsetY + mold.height / 2;
    const snapDistance = 6;

    let snapped = false;

    // 水平居中磁吸
    if (Math.abs(obj.left - centerX) < snapDistance) {
      obj.left = centerX;
      snapped = true;
    }

    // 垂直居中磁吸
    if (Math.abs(obj.top - centerY) < snapDistance) {
      obj.top = centerY;
      snapped = true;
    }

    setIsSnapping(snapped);
  };

  // 用户本地上传企业 Logo
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        loadLogo(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // 居中复位
  const handleResetCenter = () => {
    if (!logoObjectRef.current || !fabricRef.current) return;
    const offsetX = 60;
    const offsetY = 60;
    const targetArea = activeMold.safeArea;
    logoObjectRef.current.set({
      left: offsetX + targetArea.x + targetArea.width / 2,
      top: offsetY + targetArea.y + targetArea.height / 2,
      angle: 0
    });
    logoObjectRef.current.setCoords();
    fabricRef.current.renderAll();
    setLogoRotation(0);
  };

  // 导出 AI 渲染三件套
  const handleExportForAI = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // 取消选中高亮边框以获得干净底图
    canvas.discardActiveObject();
    canvas.renderAll();

    // 1. 导出带工艺的前景合成图 Base64
    const foregroundDataUrl = canvas.toDataURL({
      format: 'png',
      multiplier: 2 // 高清 2x 导出
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
        <div className="w-full flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              2D 矢量贴花画板 (Logo 100% 绝对保真)
            </span>
            {isSnapping && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 磁吸中心线已对齐
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetCenter}
              title="一键居中"
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1 transition"
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

        {/* 核心画布区 (带有工艺滤镜预览) */}
        <div
          className="relative rounded-2xl overflow-hidden border border-slate-200/60 shadow-inner flex items-center justify-center p-4 bg-slate-50/50"
          style={activeCraft.style}
        >
          <canvas ref={canvasElRef} />
        </div>

        {/* 底部微调手柄状态 */}
        <div className="w-full mt-4 flex items-center justify-between text-xs text-slate-500 px-2">
          <div className="flex items-center gap-4">
            <span>缩放: <strong>{logoScale}%</strong></span>
            <span>旋转: <strong>{logoRotation}°</strong></span>
            <span className="text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 矢量安全区保护中
            </span>
          </div>
          <span className="text-slate-400">💡 提示：按住手柄缩放旋转，靠近中心自动磁吸</span>
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
                className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
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
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
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
            {PRESET_LOGOS.map((logo, idx) => (
              <button
                key={idx}
                onClick={() => loadLogo(logo.url)}
                className="flex-1 py-1.5 px-2 rounded-lg border border-slate-200 hover:border-blue-400 text-[11px] font-medium text-slate-600 hover:text-blue-600 transition"
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
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition"
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
