# Auto 开投 (auto-winning) 研发与高频 Contribution 工作流规范

本规范旨在建立**高密度、原子化、可追溯**的 Git 研发工作流。无论是人工开发还是 AI Agent 协同编码，均须严格遵守本规范，以确保每一次功能迭代、样式微调、数据扩充与文档完善都能转化为高质量的 GitHub Contributions（绿格计数）。

---

## 一、 GitHub Contribution 计分核心机制（必读）

GitHub 个人主页的绿格（Contributions）统计包含以下 **4 大计分源**（须确保本地 `git config user.email` 与 GitHub 绑定邮箱一致）：

1. **Commits（提交）**：合入默认分支（`main`）的每一个独立 Commit 计 **+1**。
2. **Issues（议题）**：每创建一个新 Issue 计 **+1**。
3. **Pull Requests（合并请求）**：每发起一个新 PR 计 **+1**。
4. **Code Reviews（代码审查）**：对 PR 提交一次 Review 计 **+1**。

> ⚠️ **防吞次数铁律（严禁 Squash Merge）**：
> 在合并 PR 时，**严禁使用 `Squash and merge`**（会把 10 个 Commit 压缩成 1 个，瞬间少算 9 次贡献！）。
> 必须使用 **`Create a merge commit`**（不仅完整保留分支上的所有原子 Commit，还会额外多生成 1 个 Merge Commit，实现 **`N + 1` 贡献加成**）。

---

## 二、 原子化提交（Atomic Commits）拆分规范

**核心原则：绝不一锅炖（No Monolithic Commits）！**
任何一次需求开发或 AI 代码生成，必须按以下颗粒度拆分为 **多个独立 Commit** 依次提交：

### 1. 标准单功能 5 步拆分法（1 个小需求 = 5+ Contributions）
每当开发或修改一个功能模块时，禁止使用 `git add .` 一次性提交所有文件，应按以下顺序逐个文件/逐层提交：

1. **`chore / data`（数据层）**：新增或修改 Mock 数据、常量配置（如 `src/data/mockData.js`）
   ```bash
   git add src/data/mockData.js
   git commit -m "feat(data): add new viral video templates for beauty category"
   ```
2. **`feat(ui)`（基础子组件）**：单独提交矢量插画或子组件（如 `src/components/ProductArtwork.jsx`）
   ```bash
   git add src/components/ProductArtwork.jsx
   git commit -m "feat(artwork): refine SVG lighting gradients for product preview"
   ```
3. **`feat(module)`（核心业务模块）**：每个核心页面单独一次 Commit（不要把 `ImageStudio` 和 `VideoStudio` 混在同一个 Commit）
   ```bash
   git add src/components/ImageStudio.jsx
   git commit -m "feat(image-studio): support batch ratio switching and prompt tags"
   ```
4. **`style / perf`（样式与交互打磨）**：微调间距、动画过渡、悬浮态阴影或响应式布局
   ```bash
   git add src/index.css src/App.jsx
   git commit -m "style(layout): polish top navigation bar backdrop blur and spacing"
   ```
5. **`docs`（文档与变更记录）**：更新 `README.md`、`CHANGELOG.md` 或组件注释
   ```bash
   git add README.md
   git commit -m "docs(readme): update feature matrix and local setup guide"
   ```

---

## 三、 Issue + PR + Merge 满配流（单次迭代 = 8~15 Contributions）

想要以最正规、最像明星开源项目的方式快速拉满绿格，推荐使用 **`gh` CLI 自动化流水线**：

### Step 1：先开 Issue（+1 Contribution）
每次准备写新功能、修 Bug 或调 UI 前，先用命令行秒开一个 Issue：
```bash
gh issue create --title "feat: 支持爆款库按转化率与行业多维筛选" --body "增加美妆、3C、服饰类目筛选胶囊与同款提示词一键复用。"
```

### Step 2：切特性分支并按“原子化规范”多次 Commit（+N Contributions）
```bash
git checkout -b feat/knowledge-filter
# 拆分成 3~5 个小 commit 逐步提交...
git commit -m "feat(data): add category tags and CTR metrics to knowledge items"
git commit -m "feat(knowledge): implement category filter pills in KnowledgeBaseStudio"
git commit -m "style(knowledge): add hover action bar transition on cards"
git push -u origin feat/knowledge-filter
```

### Step 3：命令行一键创建 PR（+1 Contribution）
```bash
gh pr create --title "feat: 支持爆款库按转化率与行业多维筛选" --body "Closes #1" --base main
```

### Step 4：命令行一键 Merge Commit 合并（+1 Merge Commit Contribution）
```bash
gh pr merge --merge --delete-branch
git checkout main && git pull
```
> 💡 **算账**：仅仅是一个小功能迭代，通过 `1 Issue + 4 Atomic Commits + 1 PR + 1 Merge Commit`，就能稳稳拿到 **7 个 GitHub Contributions**！

---

## 四、 Commit Message 命名规范（Conventional Commits）

所有提交信息遵循 `<type>(<scope>): <subject>` 格式，保持 Git 历史专业美观：

| Type | 适用场景（皆可独立拆分 Commit） | 示例 |
| :--- | :--- | :--- |
| `feat` | 新增功能、新增业务组件、新增交互按钮 | `feat(slicer): add audio peak highlight timeline` |
| `style` | 颜色微调、圆角/边距调整、Tailwind 类名优化 | `style(video): adjust timeline card border radius` |
| `refactor` | 状态抽离、函数重命名、组件结构解耦 | `refactor(app): decouple toast notification helper` |
| `perf` | 渲染优化、精简 SVG 节点、减少冗余状态 | `perf(artwork): optimize SVG path rendering` |
| `docs` | 更新 README、架构说明、规范文档、代码注释 | `docs(contributing): add atomic commit workflow guide` |
| `chore` | 依赖更新、构建配置、`.gitignore`、脚本工具 | `chore(config): update package metadata and title` |
| `fix` | 修复交互状态、默认值、样式错位等小问题 | `fix(image): reset prompt input on product switch` |

---

## 五、 AI 结对编程（Agent）强制执行指令

当让 AI 助手（如 Antigravity）在本仓库执行任务时，AI 默认遵循以下工作准则：
1. **每次修改完代码后，主动按文件/职责拆分为多个原子 Commit**，而不是只做一次大提交。
2. **需要推送到远程时**，优先协助用户通过 `原子化 Commit -> Push` 或 `gh issue -> Branch -> Atomic Commits -> gh pr create -> gh pr merge --merge` 流程执行。
3. **检查邮箱配置**：始终确保本地提交邮箱与 GitHub 主账号邮箱一致。
