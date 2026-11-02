# Auto 开投 (auto-winning)

> **AI 电商创作与智能投流工作台** —— 从「爆款灵感洞察 → AI 商拍生图 → 动态带货视频 → 黄金前 3 秒智能切片」的一站式电商 AIGC 生产力平台。

---

## ✨ 核心功能模块

### 1. 🧭 爆款库 (`KnowledgeBaseStudio`)
- **双模灵感瀑布流**：支持切换浏览全网高转化「爆款商品图」与「带货短视频」。
- **一键做同款**：支持一键复制高转化 Prompt，或点击 **「做同款图」** / **「做同款视频」** 自动将参考商品、色彩光影方案与提示词注入创作台。

### 2. 🖼️ AI 生图 (`ImageStudio`)
- **悬浮式创作舱**：支持底部快捷切换参考商品、画面比例（`3:4 电商主图`、`9:16 竖屏详情`、`1:1 方形橱窗`）与风格胶囊。
- **4 宫格光影直出**：批量渲染多组高奢光影商拍方案，支持高清大图预览与 **「一键转视频首帧」**。

### 3. 🎬 AI 视频 (`VideoStudio`)
- **图生视频无缝接力**：可直接锁定 AI 生图产出的主图作为视频首帧。
- **多维运镜控制**：支持环绕推进、微距光影、水波慢镜等电商黄金运镜及 5s / 10s 时长切换，生成后可一键送入智能切片轨道。

### 4. ✂️ 智能切片 (`VideoSlicerStudio`)
- **黄金 3 秒与高光识别**：内置音画双轨波峰时间轴，自动识别「痛点暴击」、「成分微距」、「价格锚点逼单」等高转化片段。
- **CTR 预估与批量导出**：为每条切片提供预估点击率（CTR）评分与时间码定位，支持一键批量导出直接用于千川/TikTok 开投。

---

## 🎁 核心垂直场景：3C 科技礼品定制（纯 2D 贴花 + AI 模板生图架构）

针对**企业科技礼品定制**（如磁吸无线充电宝、客制化机械键盘、氮化镓快充、数码伴手礼盒等）场景，本项目采用 **纯 2D 交互贴花（暂不引入重型 3D 建模）+ 2D 工艺滤镜仿真 + AI 场景模板重绘** 的高 ROI 技术路线，确保客户企业 Logo **100% 绝对保真、零变形**。

### 1. 2D 贴花与安全区交互（[Fabric.js](https://github.com/fabricjs/fabric.js) / [Konva.js](https://github.com/konvajs/konva)）
- **可印刷安全区（Print Area Clipping）**：
  - 在充电宝铝合金外壳、键盘键帽/铭牌或礼盒表面定义矢量虚线安全区（基于 Fabric `clipPath` 或 Konva `clipFunc`）。
  - 企业 Logo 超出安全区部分自动裁剪隐藏，但八角缩放手柄与旋转控制点保持完整可见，避免交互卡死。
- **自由变换与磁吸对齐（Magnetic Snapping）**：
  - 支持用户上传本地透明 PNG / 矢量 SVG 企业 Logo，在安全区内自由拖拽、等比缩放、任意角度旋转。
  - 内置水平/垂直中心线与边缘磁吸对齐（距离 `< 4px` 自动吸附并显示十字对齐参考线）。
  - 实时物理尺寸换算与工艺极限预警（如激光雕刻最小线宽预警、低分辨率图片放大失真预警）。

### 2. 2D 定制工艺质感仿真（消除“贴纸感”）
无需 3D 渲染管线，直接通过 **2D Canvas 混合模式（Blend Mode）+ SVG 硬件加速滤镜管线** 实时还原 4 种核心定制工艺：
- **金属激光镭雕（Laser Engraving）**：通过 `ColorMatrix` 自动将任意彩色 Logo 转为单色金属漫反射银白/浅灰，叠加 `1px` 顶部深色烧蚀内阴影与 `overlay` 混合模式，透出底层阳极氧化铝磨砂颗粒。
- **UV 3D 微浮雕彩印（UV Embossing）**：保留企业 Logo 标准色，叠加左上高光与右下微投影（或 `<feSpecularLighting>` 镜面光照），模拟 `0.2mm` 油墨凸起与清漆反光。
- **高精丝网印（Silk Screen）**：高遮盖力哑光纯色墨层贴合机身暗部光影。
- **香槟烫金 / 烫银（Foil Stamping）**：以 Logo 作为 Alpha 蒙版（`source-in`），覆上金属拉丝线性光泽渐变。

### 3. 与 AI 模板生图无缝衔接（Logo 零畸变管线）
1. **前端刀版合成**：在 Fabric.js / Konva.js 画布中完成充电宝/键盘与企业 Logo 的精准排版及工艺渲染，一键导出高清透明合成图（`product_with_logo.png`）与前景保护遮罩（`mask.png`）。
2. **AI 场景模板套版（IC-Light / Inpainting）**：锁定商品本体与企业 Logo 像素 100% 不变，仅根据预设场景模板（如：`高管胡桃木办公桌`、`黑金尊享企业年会礼盒`、`极光科技展台`）生成真实的环境漫反射、边缘轮廓光与接触阴影。

---

## 🚀 快速开始

### 环境要求
- Node.js >= 18

### 安装与运行
```bash
# 1. 安装依赖
npm install

# 2. 启动本地开发服务器 (http://localhost:5173/)
npm run dev

# 3. 生产环境构建
npm run build
```

---

## 🛠️ 技术栈

- **框架**：React 19 + Vite 8
- **样式**：Tailwind CSS v4 (`@tailwindcss/vite`)
- **2D 贴花与定制画布**：[Fabric.js](https://github.com/fabricjs/fabric.js) / [Konva.js](https://github.com/konvajs/konva)（专注纯 2D Print Area 裁剪、缩放旋转、磁吸对齐，暂不引入重型 3D 渲染）
- **工艺质感仿真**：HTML5 Canvas Blend Modes + SVG Filter 滤镜管线（镭雕、UV 浮雕、丝印、烫金）
- **图标**：Lucide React

---

## 🤝 研发与协作规范

- **AI Agent 指南**：详见 [AGENT.md](./AGENT.md)
- **原子化 Commit 与 PR 贡献规范**：详见 [CONTRIBUTING.md](./CONTRIBUTING.md)
