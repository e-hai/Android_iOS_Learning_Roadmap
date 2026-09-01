# AGENTS.md — LearningCockpit (Web)

本文件约束在本仓库中协作的 AI / Agent。改代码前先读 [README.md](./README.md) 与本文件。

## 项目身份

- **平台**：现代浏览器 Web 应用（纯静态 SPA）
- **技术栈**：Vite + TypeScript + Vanilla CSS
- **目标**：Android ⟷ iOS 双端开发者互相迁移、架构对齐与概念速查路线图手册

## 架构准则

1. **分层清晰**：
   - `src/models/`：纯类型定义（`LearningStage`, `ComparisonRow`）。
   - `src/data/`：16 个阶段结构化路线数据与中文文案字典（`zh-Hans.ts`）。
   - `src/services/`：文案字典服务（`i18n.ts`）。
   - `src/components/`：轻量、无框架绑定的原生 DOM 组件。
   - `src/styles/`：Vanilla CSS 设计系统与主题令牌。
   - `src/visuals/`：按需加载的 Three.js 场景、主题与 3D 认知星云。
2. **零第三方重型 UI 依赖**：保持轻量、极简与高响应性能，避免引入重型 UI 组件库。
3. **响应式与无障碍**：兼容移动端、平板与桌面宽屏，支持深色/浅色主题。
4. **零服务器部署**：保证 `base: './'` 相对路径打包，产物直接支持 GitHub Pages、Cloudflare Pages、Vercel 等静态托管。

## 文案规范

- 通用界面文案统一录入 `src/data/locales/zh-Hans.ts`。
- 大段路线与深潜正文分别保留在 `roadmap-data.ts` 和 `deep-dive-data.ts`，不要复制到 README。README 只保留安装与运行说明。
- 代码中调用 `i18n.t("key")` 获取文案。

## 导航与资源生命周期

- 路线阶段使用 `#<stage-id>`，深潜使用 `#deepdive-<domain>:<chapter>`，3D 模式使用 `#3d`。
- 文档模式保持 Header 与 Sidebar 常驻，只替换主要内容，避免丢失侧栏滚动和焦点状态。
- 3D 模块必须动态导入；离开 3D 模式时必须停止动画帧、移除观察器并释放 WebGL 资源。

## 验证命令

改动代码后，请运行以下命令验证构建：

```bash
npm run build
```
