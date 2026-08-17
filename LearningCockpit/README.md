# 学习驾驶舱（LearningCockpit Web）

**LearningCockpit** 是一个为 **Android 开发者量身定制的 iOS / SwiftUI 伴学路线图与概念速查应用**。

涵盖 16 个核心阶段（11 个主线阶段 + 5 个进阶阶段），提供全量 Android ↔ iOS 概念/语法对照表、阶段目标、避坑注意与实战练手任务，支持中英双语切换与本地学习进度打卡。

---

## 🌟 核心功能

1. **学习驾驶舱（Cockpit Overview & Detail）**：
   - 侧栏导航：全量 16 个知识阶段概览与主线完成度统计。
   - 首页速查表：Android ↔ iOS 核心组件映射与 5 周建议学习节奏。
   - 阶段深度详情：阶段目标、关键注意事项、概念语法对照表、实操练手挑战。
2. **沉浸式聚焦学习卡（Focus Card Modal）**：
   - 弹窗卡片模式（快捷键 `⌘L` 或 `Ctrl+L`），支持单阶段深度学习打卡，通过「上一阶段」「下一阶段」顺畅推导。
3. **全局即时搜索（Instant Global Search）**：
   - 快捷键 `⌘K` 或 `Ctrl+K`，支持秒级检索 Android API、iOS API、语法关键字或阶段名称。
4. **进度打卡与多语言**：
   - 「已读完」「已练完」双项打卡，基于浏览器 `localStorage` 自动持久化存储。
   - 支持进度 JSON 一键导出与导入备份、进度重置。
   - 完整支持 **简体中文 / English** 无刷新实时切换。
   - 支持深色 / 浅色模式（Dark / Light Theme）切换。

---

## 🚀 本地运行与构建

### 1. 环境要求
- Node.js 18+
- npm / yarn / pnpm

### 2. 安装依赖并启动本地开发环境

```bash
# 安装依赖
npm install

# 启动本地开发服务器（默认 http://localhost:3000）
npm run dev
```

### 3. 构建静态生产产物

```bash
npm run build
```
构建产物将输出至 `dist/` 目录，为纯静态 HTML/CSS/JS 文件。

### 4. 本地预览生产构建产物

```bash
npm run preview
```

---

## ☁️ 零服务器免费发布方案（Zero-Server Hosting）

本项目为纯前端静态 Web 应用，**不需要购买任何云服务器**，可通过以下任意免费平台进行全球部署与托管：

### 方案 1：GitHub Pages（已内置自动化工作流 ⭐⭐⭐⭐⭐）

本项目已预置好 [`.github/workflows/deploy.yml`](file:///.github/workflows/deploy.yml)。

1. 将代码推送到你的 GitHub 仓库（`main` 或 `master` 分支）。
2. 在 GitHub 仓库页面进入 **Settings** ➔ **Pages**。
3. 在 **Build and deployment** 下方的 **Source** 选择 **GitHub Actions**。
4. 每次 `git push` 时，GitHub Actions 会自动编译并上线到 `https://<你的用户名>.github.io/<仓库名>/`。

### 方案 2：Cloudflare Pages（全球 CDN 极速访问 ⭐⭐⭐⭐⭐）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) ➔ 进入 **Workers & Pages**。
2. 点击 **Create application** ➔ **Pages** ➔ **Connect to Git**。
3. 选择该 GitHub 仓库，构建命令填写 `npm run build`，输出目录填写 `dist`。
4. 点击 **Save and Deploy** 即可获得极速的全球 CDN 访问地址，支持一键绑定自定义域名与免费 HTTPS。

### 方案 3：Vercel / Netlify（极简一键导入 ⭐⭐⭐⭐）

1. 登录 [Vercel](https://vercel.com/)，点击 **Add New Project** ➔ 导入 GitHub 仓库。
2. Vercel 会自动识别 Vite 框架配置，直接点击 **Deploy**。
3. 30 秒内完成全球部署，每次提交代码均会自动更新并生成预览环境。

---

## 📁 目录结构

```
LearningCockpit/
├── index.html                     # 单页 HTML 根入口
├── package.json                   # 依赖与打包脚本
├── tsconfig.json                  # TypeScript 编译配置
├── vite.config.ts                 # Vite 打包配置
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Pages 自动部署脚本
└── src/
    ├── main.ts                    # 应用入口控制器与路由调度
    ├── models/
    │   └── types.ts               # 阶段模型与进度数据类型
    ├── data/
    │   ├── roadmap-data.ts        # 16 个阶段结构化对照数据
    │   └── locales/
    │       ├── zh-Hans.ts         # 简体中文文案字典
    │       └── en.ts              # English 文案字典
    ├── services/
    │   ├── storage.ts             # 本地存储持久化与导入/导出服务
    │   └── i18n.ts                # 国际化语言调度引擎
    ├── components/
    │   ├── Header.ts              # 顶部应用栏组件
    │   ├── Sidebar.ts             # 侧边栏导航组件
    │   ├── HomeView.ts            # 首页总览与速查组件
    │   ├── StageDetailView.ts     # 阶段详情与对照表视图
    │   ├── ComparisonTable.ts     # 核心概念对比表格组件
    │   ├── FocusCardModal.ts      # 沉浸式学习卡弹窗组件
    │   ├── GlobalSearch.ts        # 全局即时模糊检索弹窗
    │   └── Toast.ts               # 提示消息轻量组件
    └── styles/
        ├── theme.css              # 色彩、字体、令牌与深色模式
        ├── layout.css             # 响应式布局与点阵背景
        ├── components.css         # UI 基础组件样式
        ├── focus-card.css         # 聚焦学习卡样式
        └── search.css             # 搜索弹窗样式
```
