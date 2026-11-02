# AGENT.md — Auto 开投 (auto-winning) AI Agent 协作指南

欢迎进入 **Auto 开投 (`auto-winning`)** 代码仓库。本文件是面向所有 AI Coding Agent（Antigravity、Claude、Cursor 等）的核心上下文与最高执行准则。在进行任何代码读取、修改或 Git 操作前，请完整阅读并严格遵循本文件。

---

## 1. 项目定位与业务全景

- **项目名称**：Auto 开投 (`auto-winning`)
- **产品定位**：面向电商投手、品牌商家与内容团队的 **AI 电商创作与智能投流工作台**。
- **核心业务闭环（4 大核心工作台）**：
  1. **爆款库 (`KnowledgeBaseStudio.jsx`)**：全网高转化爆款图文/短视频灵感瀑布流，支持按商品筛选、提示词复制、**「做同款图」**与**「做同款视频」**一键跨模块流转。
  2. **AI 生图 (`ImageStudio.jsx`)**：极简底部悬浮 Prompt Dock + 多尺寸比例（`3:4` 电商主图、`9:16` 详情竖图、`1:1` 方形橱窗）+ 4 宫格高精商品光影渲染画布 + **「一键转视频」**。
  3. **AI 视频 (`VideoStudio.jsx`)**：支持首帧图锁定（接收自爆款库或 AI 生图）、运镜控制（环绕推进、微距光影、水波慢镜等）、时长切换（5s / 10s）与动态预览播放器，支持一键送入**「智能切片」**。
  4. **智能切片 (`VideoSlicerStudio.jsx`)**：针对长视频/直播回放的 AI 黄金前 3 秒钩子识别、双轨波峰时间轴拆条、高光切片转化率（CTR）评分与批量导出开投。

---

## 2. 技术栈与目录结构

### 技术栈
- **前端框架**：React 19 (`react`, `react-dom`)
- **构建工具**：Vite 8 (`@vitejs/plugin-react`)
- **样式引擎**：Tailwind CSS v4 (`@tailwindcss/vite`)
- **2D 贴花与礼品定制引擎**：`Fabric.js` / `Konva.js` + HTML5 Canvas Blend Modes / SVG Filter（聚焦充电宝、机械键盘等 3C 科技礼品的 2D Print Area 裁剪、自由缩放旋转、磁吸对齐与镭雕/UV浮雕工艺渲染，**明确暂不引入 3D 方案**）
- **图标库**：`lucide-react`

### 目录结构
```text
auto-winning/
├── index.html                        # 页面入口（标题：Auto 开投 · AI 电商创作与智能投流工作台）
├── package.json                      # 依赖与脚本配置
├── vite.config.js                    # Vite + Tailwind v4 插件配置
├── AGENT.md                          # AI Agent 核心协作指南（本文件）
├── CONTRIBUTING.md                   # 高频原子化 Git Contribution 工作流规范
├── README.md                         # 项目说明文档
└── src/
    ├── main.jsx                      # React 挂载入口
    ├── index.css                     # 全局样式与自定义滚动条/动画
    ├── App.jsx                       # 顶层布局（72px 极简左侧图标导航栏 + 顶栏商品胶囊切换 + 跨模块状态流转）
    ├── data/
    │   └── mockData.js               # 核心商品数据、爆款灵感库、预设生成任务与黄金切片脚本数据
    └── components/
        ├── ProductArtwork.jsx        # 高精矢量产品渲染引擎（精华液、耳机、咖啡机、跑鞋等）
        ├── KnowledgeBaseStudio.jsx   # 爆款库：双模（图片/视频）瀑布流与“做同款”路由触发
        ├── ImageStudio.jsx           # AI 生图工作台：历史画布流 + 底部悬浮输入舱
        ├── VideoStudio.jsx           # AI 视频工作台：动态预览器 + 首帧/运镜悬浮控制舱
        └── VideoSlicerStudio.jsx     # 智能切片工作台：主播放器 + 音画时间轴 + AI 拆条列表
```

---

## 3. UI / UX 设计规范（即梦 Jimeng 极简浅色创作者风格）

Agent 在新增或修改任何界面组件时，必须保持以下视觉一致性：
1. **清爽浅色画布**：
   - 全局背景采用 `#F6F7F9`，卡片与导航容器采用纯白 `bg-white` 搭配细腻边框 `border-slate-200/80`。
   - 严禁使用厚重杂乱的工业级表格或刺眼高饱和背景，确保商品视觉素材成为绝对焦点。
2. **悬浮式创作舱（Floating Prompt Dock）**：
   - 生图与生视频模块均采用底部居中的毛玻璃悬浮输入栏（`bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl`）。
3. **跨模块无缝接力**：
   - 保持 `App.jsx` 中的状态流转链路畅通：`爆款库 -> AI生图 -> AI视频 -> 智能切片`，任何跨模块跳转均通过 `showToast` 提供轻量级胶囊反馈。
4. **自包含矢量视觉 (`ProductArtwork`)**：
   - 所有商品主图与视频画面均通过 `ProductArtwork.jsx` 结合 `palette`（色彩方案）与 `svgType`（器型）实时渲染，禁止引入可能失效的外部图片死链。

---

## 4. Git 与提交流程准则（高效优先）

1. **开发阶段极速迭代**：日常编码与功能修改以**最快响应速度**完成，优先保障本地预览体验，**不要**在每次改代码时自动跑繁琐的拆分支、建 Issue、提 PR 等耗时网络操作。
2. **按需提交 / 批量刷绿格**：仅当用户明确要求提交/推送，或在阶段性里程碑时，再根据需求快速执行本地多个小 Commit 直推 `main`（最快、最少等待），无需每次走完整 Issue/PR 流程。

---

## 5. 常用开发命令

- **启动本地开发服**：`npm run dev`（默认运行于 `http://localhost:5173/`）
- **生产环境构建验证**：`npm run build`
- **预览构建产物**：`npm run preview`
