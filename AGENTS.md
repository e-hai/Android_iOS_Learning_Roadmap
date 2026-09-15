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

## 核心概念与特性编排准则（第一性原理）

在解释任何核心语言特性、架构机制或底层概念（如泛型、委托、协程、响应式流、组件生命周期等）时，必须严格遵循“溯源第一性原理”的三层递进结构，严禁跳过起源直接陷入次级语法糖对比：

1. **第一层：是什么（本质定义）**：
   - 用最凝练的语言给出本质定义与一句话心智隐喻（例如：泛型本质是“参数化类型 Parameterized Types”，把数据类型本身作为参数传递）。
2. **第二层：最初为了解决什么问题（根源动机与原始痛点）**：
   - 必须先回答该机制在计算机科学或该语言史中“最初诞生的根本动力”：在没有它之前，老旧代码面临何种不可调和的矛盾（例如：泛型诞生前集合全存 Object，取值全靠强制类型转换，将生产环境隐蔽的 `ClassCastException` 运行时崩溃前移到编译期静态拦截，同时消除为不同类型重复写专用容器的代码冗余）。
3. **第三层：现代演进与工程突破（高级抽象与语法糖折中）**：
   - 在确立了前两层之后，才展开探讨该特性在后续工程演进中的痛点与现代解决方案（例如：Kotlin 的声明处型变 `out`/`in` 解决使用处通配符困扰、具现化 `reified` 突破 JVM 类型擦除）。
   - **型变（Variance）编排必须采用“自助餐厅顾客视角”统一隐喻**：
     - **调料罐（可舀可放，两头通 `<T>`）** ➔ **死守标签不串用（不变性 Invariant）**，防止白糖混进盐罐导致业务崩溃；
     - **自动饮料机（只能按键接取，只出不进 `<out T>`）** ➔ **贴可乐直接当饮料喝（协变 Covariant）**，单向只读放行子类赋给父类；必须向读者阐明数据来源心智（数据在出厂构造时一次性灌装或内部生产，对外封闭写接口以杜绝中途篡改）；
     - **餐盘垃圾桶（吃完只能往里扔，只进不出 `<in T>`）** ➔ **大垃圾桶通吃具体小垃圾（逆变 Contravariant）**，单向只写放行父类赋给子类。
   - **Kotlin 协程（Coroutines）编排准则**：
     - **破除神话**：严禁开篇以“轻量级线程”一笔带过。第一性原理定义：**Kotlin 协程 = 编译器生成的状态机 + Continuation 回调链 + 一棵管理取消/调度的 Job 树**。没有魔法，全部是编译期代码生成（CPS 转换与状态机拆分）加一套精心设计的运行时库（`kotlinx.coroutines`）。
     - **五大核心支柱与递进逻辑**：
       1. **CPS 变换（Continuation-Passing Style）**：`suspend` 是编译期标记而非运行时魔法。编译器给函数末尾注入 `continuation: Continuation<T>` 参数，返回值变为 `Any?`，以返回 `COROUTINE_SUSPENDED` 哨兵值表示挂起。
       2. **状态机切片（State Machine）**：编译器以每个挂起点为界将顺序代码切分成包含 `when (label)` 的 `ContinuationImpl` 状态机。遇到挂起点时 `label++`，传 `this` 给下一个挂起函数，直接退出（return `COROUTINE_SUSPENDED`）。
       3. **挂起与恢复（Non-blocking Suspension）**：“挂起不阻塞线程”的本质是**提前 return 释放物理线程**；“恢复”的本质是**底层异步就绪后回调通知 `Continuation.resumeWith(...)`**，驱动状态机依 `label` 跳转到下一个分支。
       4. **上下文与调度（CoroutineContext & Dispatchers）**：调度器本质是 `ContinuationInterceptor` 拦截器。拦截 `resumeWith` 并包装成 `Runnable` 投递至目标线程队列（如 Android `Handler`/线程池），消除线程切换的神秘感。
       5. **结构化并发（Structured Concurrency）**：基于 `CoroutineScope` 的树状生命周期（父子 Job 树），规范级联向下取消、自动等待子任务完成与异常向上熔断传播。

## 导航与资源生命周期

- 路线阶段使用 `#<stage-id>`，深潜使用 `#deepdive-<domain>:<chapter>`，3D 模式使用 `#3d`。
- 文档模式保持 Header 与 Sidebar 常驻，只替换主要内容，避免丢失侧栏滚动和焦点状态。
- 3D 模块必须动态导入；离开 3D 模式时必须停止动画帧、移除观察器并释放 WebGL 资源。

## 验证命令

改动代码后，请运行以下命令验证构建：

```bash
npm run build
```
