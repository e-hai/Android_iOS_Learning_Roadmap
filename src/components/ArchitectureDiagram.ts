import { i18n } from '../services/i18n';

/**
 * Stage-specific Unicode Box-drawing architecture and hierarchy diagrams.
 */
const DIAGRAMS: Record<string, string> = {
  env: `[ Android: Gradle 多模块工程 ]
 Root Project/
  |-- settings.gradle.kts      (模块清单声明)
  \\-- app/                     (主 Application 模块)
       |-- build.gradle.kts    (依赖与编译配置)
       |-- AndroidManifest.xml (组件清单与权限)
       |-- res/                (资源目录: drawable/values)
       \\-- kotlin/             (业务源码)

[ iOS: Xcode Workspace / Target 体系 ]
 MyApp.xcodeproj / .xcworkspace (工程文件)
  |-- Package.swift / SPM      (原生依赖管理)
  \\-- MyApp Target             (主构建产物目标)
       |-- App.swift           (@main 程序声明入口)
       |-- Info.plist          (系统权限与配置)
       |-- Assets.xcassets     (矢量图与色彩集)
       \\-- Preview Content/    (SwiftUI 预览数据)`,

  language: `[ 语言基础与心智模型对照 ]

1. 数据模型与内存语义
   Android: data class User(...)  [引用类型 / 指针传递]
   iOS:     struct User(...)      [值类型 / 自动深拷贝 / 线程安全]

2. 抽象与多态机制
   Android: open class Base -> Child  [单根基类继承 OOP]
   iOS:     protocol + extension      [面向协议组合 POP]

3. 状态机与枚举建模
   Android: sealed class UiState      [密封类分层继承]
   iOS:     enum UiState { case ... } [带关联值枚举]

4. 内存回收模型
   Android: JVM GC                    [垃圾收集器后台自动回收]
   iOS:     ARC                       [引用计数即时释放 / 闭包须 weak self]`,

  lifecycle: `[ 传统时代: 命令式 UI 体系 ]
 Android: Application -> Activity -> Fragment -> View
 iOS:     UIApplication -> UIWindow -> UIViewController -> UIView
                             ^
                             |-- 页面级生命周期容器

[ 现代时代: 声明式 UI 体系 ]
 Android: Single Activity -> Compose @Composable 函数 -> LaunchedEffect / onDispose
 iOS:     @main App       -> WindowGroup (Scene)       -> SwiftUI struct View (.task / .onAppear)`,

  ui: `[ 1. 核心容器对照 ]
 一维线性排列:  Column / Row     <->  VStack / HStack
 二维层叠覆盖:  Box              <->  ZStack
 惰性复用列表:  LazyColumn       <->  List (系统样式) / LazyVStack (自定义流)
 惰性复用网格:  LazyVerticalGrid <->  LazyVGrid(columns:)

[ 2. Modifier 逐层包装机制 (洋葱模型) ]
 Text("Hello")
   |-- .padding(16)        -> [包装外层 PaddingView]
   |-- .background(.blue)  -> [包装更外层 BackgroundView]
   \\-- .cornerRadius(8)    -> [包装最外层 ClipShapeView]
 (注: 从上至下依次向外嵌套，修饰符顺序不同会导致截然不同的视觉结果)`,

  state: `[ 声明式 UI 状态与数据流向 ]

 Android (Compose):
   remember / mutableStateOf -> StateFlow (ViewModel) -> collectAsState() -> UI 重组刷新
         [ 视图私有状态 ]              [ 业务状态流 ]             [ 状态消费 ]

 iOS (SwiftUI):
   @State / @Binding         -> @Observable Class     -> @Environment     -> 自动按需刷新
      [ 私有与双向指针 ]            [ 业务数据模型 ]           [ 全局环境注入 ]`,

  navigation: `[ 现代第三代纯数据驱动路由: Android Nav3 <-> iOS 16+ NavigationStack ]

 1. 路由节点定义 (强类型模型):
    Android: @Serializable data class DetailRoute(val id: String)
    iOS:     enum AppRoute: Hashable { case detail(id: String) }

 2. 状态栈管理 (纯 List 数据源):
    Android (Nav3):  val backStack = rememberNavBackStack(HomeRoute)
    iOS (SwiftUI):   @State var path: [AppRoute] = []

 3. 核心栈操作映射 (压栈 / 出栈 / 回首页):
    跳转压栈:   backStack.add(DetailRoute("101"))   <->  path.append(.detail("101"))
    返回出栈:   backStack.pop()                     <->  path.removeLast()
    一键回首页: backStack.clear()                   <->  path.removeAll()

 4. 路由呈现容器:
    Android (Nav3):
      NavDisplay(backStack) { route ->
          when (route) {
              is HomeRoute   -> HomeScreen(...)
              is DetailRoute -> DetailScreen(route.id)
          }
      }

    iOS (SwiftUI):
      NavigationStack(path: $path) {
          HomeView()
              .navigationDestination(for: AppRoute.self) { route in
                  switch route {
                  case .detail(let id): DetailView(id: id)
                  }
              }
      }`,

  async: `[ 异步与并发演进路线 ]

 Android: Thread -> Coroutine (launch/async) -> Flow (冷流) -> Channel (热流) -> Mutex (互斥锁)
 iOS:     Thread -> Task (async/await)      -> AsyncSequence -> AsyncStream  -> actor (编译器隔离)`,

  storage: `[ 本地存储场景与安全分级 ]

 1. 轻量键值与用户偏好
    Android: SharedPreferences / DataStore
    iOS:     UserDefaults / @AppStorage

 2. 敏感凭据与 Token (硬件级加密)
    Android: EncryptedSharedPreferences / AndroidKeyStore (TEE 安全芯片)
    iOS:     Keychain Services (Secure Enclave 硬件加密)

 3. 结构化数据与关系型数据库
    Android: Room (SQLite ORM)
    iOS:     SwiftData (宏声明式 ORM) / GRDB`,

  architecture: `[ MVVM + Repository 单向数据流全景架构 ]

 +----------------------------------------------------------------+
 | 视图层 (View Layer)                                            |
 |   Android: Compose @Composable   |  iOS: SwiftUI struct View   |
 +----------------------------------------------------------------+
                                |
                                | 用户意图 / 操作事件 (User Action)
                                v
 +----------------------------------------------------------------+
 | 状态与业务层 (ViewModel Layer)                                 |
 |   Android: ViewModel + StateFlow |  iOS: @Observable ViewModel |
 +----------------------------------------------------------------+
                                |
                                | 调用异步接口 (suspend / async)
                                v
 +----------------------------------------------------------------+
 | 数据仓储层 (Repository Layer)                                  |
 |   Repository Interface / Protocol (内存缓存策略与单向数据源仲裁)|
 +----------------------------------------------------------------+
                |                               |
                | 分发至网络接口                 | 分发至本地存储
                v                               v
 +------------------------------+ +-------------------------------+
 | 远端数据源 (Remote API)      | | 本地数据源 (Local Storage)    |
 |   Retrofit <-> URLSession    | |   Room <-> SwiftData/Keychain |
 +------------------------------+ +-------------------------------+`,
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
