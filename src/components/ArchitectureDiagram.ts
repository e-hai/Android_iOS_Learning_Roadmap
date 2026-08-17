import { i18n } from '../services/i18n';

/**
 * Stage-specific Unicode Box-drawing architecture and hierarchy diagrams.
 */
const DIAGRAMS: Record<string, string> = {
  env: `┌──────────────────────────────────────────────┐       ┌──────────────────────────────────────────────┐
│ 🤖 Android (Gradle 多模块工程)                │       │ 🍎 iOS (Xcode Project / Target 体系)         │
├──────────────────────────────────────────────┤  映射  ├──────────────────────────────────────────────┤
│ 📁 Root Project/                             │ ◄───► │ 📁 MyApp.xcodeproj / .xcworkspace           │
│  ├── ⚙️ settings.gradle.kts (模块清单声明)    │       │  ├── 📦 Package.swift / SPM (原生依赖管理)   │
│  └── 📁 app/ (主 Application 模块)           │       │  └── 🎯 MyApp Target (主构建产物目标)        │
│       ├── 📜 build.gradle.kts (依赖与编译)    │       │       ├── 🚀 @main App.swift (程序声明入口)   │
│       ├── 📄 AndroidManifest.xml (组件清单)   │       │       ├── ⚙️ Info.plist (系统权限与配置)      │
│       ├── 📁 res/ (drawable, values)         │       │       ├── 🎨 Assets.xcassets (矢量图与色板)   │
│       └── 📁 kotlin/ (业务源码)              │       │       └── 📁 Preview Content/ (SwiftUI 预览)  │
└──────────────────────────────────────────────┘       └──────────────────────────────────────────────┘`,

  language: `┌─────────────────────────────┬───────────────────────────────────┬────────────────────────────────────┐
│ 核心维度                    │ 🤖 Kotlin (Android)               │ 🍎 Swift (iOS)                     │
├─────────────────────────────┼───────────────────────────────────┼────────────────────────────────────┤
│ 1. 数据模型与内存语义        │ data class User(...) [引用类型]   │ struct User(...) [值类型 · 深拷贝] │
│ 2. 抽象与多态机制            │ open class Base ➔ Child [单继承]  │ protocol + extension [面向协议 POP]│
│ 3. 状态机与枚举建模          │ sealed class UiState [密封类分层] │ enum UiState { case ... } [关联值] │
│ 4. 内存回收与闭包防漏        │ JVM GC [垃圾收集器自动回收]       │ ARC [引用计数 · 闭包须 weak self]  │
└─────────────────────────────┴───────────────────────────────────┴────────────────────────────────────┘`,

  lifecycle: `【传统时代 · 命令式 UI 体系】
 🤖 Android: Application ──▶ Activity ──▶ Fragment ──▶ View
 🍎 iOS:     UIApplication ──▶ UIWindow ──▶ UIViewController ──▶ UIView
                     ▲                             ▲
                     └────── 页面级生命周期容器 ───┘

【现代时代 · 声明式 UI 体系】
 🤖 Android: Single Activity ──▶ @Composable fun Screen() ──▶ LaunchedEffect / onDispose
 🍎 iOS:     @main App ──▶ WindowGroup (Scene) ──▶ SwiftUI struct View (.task / .onAppear)`,

  ui: `【1. 核心容器映射】
 ┌─────────────────┬─────────────────┬───────────────────────────────────────────┐
 │ 维度            │ 🤖 Compose      │ 🍎 SwiftUI                                │
 ├─────────────────┼─────────────────┼───────────────────────────────────────────┤
 │ 一维线性        │ Column / Row    │ VStack / HStack                           │
 │ 二维层叠        │ Box             │ ZStack                                    │
 │ 惰性复用列表    │ LazyColumn      │ List (系统样式) / LazyVStack (自定义瀑布流)│
 │ 惰性复用网格    │ LazyVerticalGrid│ LazyVGrid(columns:)                       │
 └─────────────────┴─────────────────┴───────────────────────────────────────────┘

【2. Modifier 逐层包装机制 (洋葱模型)】
 Text("Hello")
   │
   ├──▶ .padding(16)        ──▶ [生成外层 PaddingView]
   ├──▶ .background(.blue)  ──▶ [生成更外层 BackgroundView]
   └──▶ .cornerRadius(8)    ──▶ [生成最外层 ClipShapeView]
   (注：从上至下依次向外嵌套，顺序不同视觉结果截然不同！)`,

  state: `【声明式 UI 单向数据流向图】

 🤖 Android (Compose):
   remember / mutableStateOf ──▶ StateFlow (ViewModel) ──▶ collectAsState() ──▶ UI 触发重组
         [ 视图私有状态 ]             [ 业务状态流 ]             [ 状态消费 ]

 🍎 iOS (SwiftUI):
   @State / @Binding ─────────▶ @Observable (@MainActor) ──▶ @Environment ────▶ 自动按需刷新
      [ 私有与双向指针 ]            [ 业务数据模型 ]             [ 全局依赖注入 ]`,

  async: `【并发与异步演进路线】

 🤖 Android:  Thread ──▶ Coroutine (launch/async) ──▶ Flow (冷流) ──▶ Channel (热流) ──▶ Mutex (互斥锁)
 🍎 iOS:      Thread ──▶ Task (async/await)      ──▶ AsyncSequence ──▶ AsyncStream  ──▶ actor (线程隔离)`,

  storage: `【存储场景分级金字塔】

 ┌───────────────────────────────────┬──────────────────────────────────┬─────────────────────────────────┐
 │ 存储层级 / 安全场景               │ 🤖 Android                       │ 🍎 iOS                          │
 ├───────────────────────────────────┼──────────────────────────────────┼─────────────────────────────────┤
 │ 🟢 层级 1：轻量键值与用户偏好     │ SharedPreferences / DataStore    │ UserDefaults / @AppStorage      │
 │ 🔐 层级 2：敏感 Token / 密码凭据  │ EncryptedPrefs / AndroidKeyStore │ Keychain (硬件加密安全芯片)     │
 │ 🗄️ 层级 3：结构化数据与本地数据库 │ Room (SQLite ORM)                │ SwiftData (宏 ORM) / GRDB       │
 └───────────────────────────────────┴──────────────────────────────────┴─────────────────────────────────┘`,

  architecture: `【MVVM + Repository 单向数据流全景架构】

   ┌──────────────────────────────────────────────────────────────┐
   │ 🖥️ UI Layer (视图层)                                         │
   │    Android: Compose @Composable   │  iOS: SwiftUI View       │
   └──────────────────────────────┬───────────────────────────────┘
                                  │ ⬇️ 用户意图 / 操作事件 (User Action)
   ┌──────────────────────────────▼───────────────────────────────┐
   │ 🧠 ViewModel Layer (状态与业务层)                            │
   │    Android: ViewModel + StateFlow │  iOS: @Observable ViewModel
   └──────────────────────────────┬───────────────────────────────┘
                                  │ ⬇️ 调用异步数据接口 (suspend / async)
   ┌──────────────────────────────▼───────────────────────────────┐
   │ 🏛️ Repository Layer (数据仓储层 · 单向数据源仲裁)             │
   │    Repository Interface / Protocol (内存缓存策略与数据规整)   │
   └──────────────┬───────────────────────────────┬───────────────┘
                  │                               │
                  ▼ 分发至远端网络                 ▼ 分发至本地存储
   ┌──────────────────────────────┐ ┌──────────────────────────────┐
   │ 🌐 Remote Data Source        │ │ 💾 Local Data Source         │
   │    Retrofit ↔ URLSession     │ │    Room ↔ SwiftData/Keychain │
   └──────────────────────────────┘ └──────────────────────────────┘`,
};

/**
 * Renders a clean, copyable Unicode Box-drawing architecture diagram.
 */
export function renderArchitectureDiagram(stageId: string, hintKey?: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'box-diagram-card';

  const diagramContent = DIAGRAMS[stageId] || (hintKey ? i18n.t(hintKey) : '');

  if (!diagramContent.trim()) {
    container.style.display = 'none';
    return container;
  }

  container.innerHTML = `
    <div class="box-diagram-header">
      <div class="box-diagram-dots">
        <span class="box-dot dot-red"></span>
        <span class="box-dot dot-yellow"></span>
        <span class="box-dot dot-green"></span>
      </div>
      <span class="box-diagram-title">架构与层级结构 · 盒线全景图</span>
      <button class="box-copy-btn btn-ghost" title="复制图示">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span>复制</span>
      </button>
    </div>
    <div class="box-diagram-body">
      <pre class="box-diagram-code"><code>${escapeHtml(diagramContent)}</code></pre>
    </div>
  `;

  // Copy button logic
  const copyBtn = container.querySelector('.box-copy-btn') as HTMLButtonElement;
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(diagramContent);
        const span = copyBtn.querySelector('span');
        if (span) {
          const original = span.textContent;
          span.textContent = '已复制!';
          copyBtn.style.color = 'var(--color-done)';
          setTimeout(() => {
            span.textContent = original;
            copyBtn.style.color = '';
          }, 2000);
        }
      } catch {
        // Fallback or ignore
      }
    });
  }

  return container;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
