# AGENTS.md — LearningCockpit (Web)

本文件约束在本仓库中协作的 AI / Agent。改代码前先读 [README.md](./README.md) 与本文件。

## 项目身份

- **平台**：现代浏览器 Web 应用（纯静态 SPA）
- **技术栈**：Vite + TypeScript + Vanilla CSS
- **目标**：Android ⟷ iOS 双端开发者互相迁移、架构对齐与概念速查路线图手册

## 架构准则

1. **分层清晰**：
   - `src/models/`：纯类型定义（`LearningStage`, `ComparisonRow`）。
   - `src/data/`：16 个阶段结构化路线数据与多语言字典（`zh-Hans.ts`, `en.ts`）。
   - `src/services/`：多语言国际化服务（`i18n.ts`）。
   - `src/components/`：轻量、无框架绑定的原生 DOM 组件。
   - `src/styles/`：Vanilla CSS 设计系统与主题令牌。
2. **零第三方重型 UI 依赖**：保持轻量、极简与高响应性能，避免引入重型 UI 组件库。
3. **响应式与无障碍**：兼容移动端、平板与桌面宽屏，支持深色/浅色主题。
4. **零服务器部署**：保证 `base: './'` 相对路径打包，产物直接支持 GitHub Pages、Cloudflare Pages、Vercel 等静态托管。

## 文案与国际化

- 用户可见文案全部进 `src/data/locales/`（`zh-Hans.ts` 和 `en.ts`）。
- 代码中调用 `i18n.t("key")` 获取翻译。

## 验证命令

改动代码后，请运行以下命令验证构建：

```bash
npm run build
```
