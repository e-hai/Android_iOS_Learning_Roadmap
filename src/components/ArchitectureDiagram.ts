import { i18n } from '../services/i18n';

/**
 * Stage-specific Unicode Box-drawing architecture and hierarchy diagrams (16 Stages).
 */
const DIAGRAMS: Record<string, string> = {
  env: `[ 阶段 01: 开发环境与工程结构全景对照 ]

 1. 【工程容器与构建体系】
    Android (Gradle):  Root Project ──▶ settings.gradle.kts ──▶ app/build.gradle.kts
    iOS (Xcode):       Workspace (.xcworkspace) ──▶ Project (.xcodeproj) ──▶ Target (主构建目标)

 2. 【配置文件与组件清单】
    Android:           AndroidManifest.xml (包名 / 四大组件声明 / 动态权限清单)
    iOS:               Info.plist (系统权限描述) + Target Capabilities (推送/后台等能力)

 3. 【依赖管理生态】
    Android:           Gradle 依赖声明 (MavenCentral / Google Maven)
    iOS:               Swift Package Manager (SPM 原生仓库直连) / CocoaPods (.xcworkspace)

 4. 【静态资源与代码入口】
    Android:           res/ (drawable/values/mipmap) + Application / MainActivity
    iOS:               Assets.xcassets (矢量图/颜色集) + @main App.swift 入口`,

  language: `[ 阶段 02: 语言基础与类型系统全景对照 ]

 1. 【数据模型与内存语义】
    Kotlin:            data class User(val id: String)  ──▶ [引用类型 / 指针传递 / 堆分配]
    Swift:             struct User { let id: String }   ──▶ [值类型 / 自动深拷贝 / 栈优化 / 线程安全]

 2. 【多态机制与抽象体系】
    Kotlin:            open class Base ──▶ class Child  ──▶ [单根基类继承 OOP]
    Swift:             protocol POP ──▶ extension 默认实现 ──▶ [面向协议组合 POP]

 3. 【状态机与枚举建模】
    Kotlin:            sealed class UiState              ──▶ [密封类多子类分发]
    Swift:             enum UiState { case success(T) }  ──▶ [强关联值枚举 / 模式匹配]

 4. 【内存管理与回收模型】
    Kotlin:            JVM Garbage Collector (GC)        ──▶ [后台定期扫描标记回收]
    Swift:             Automatic Reference Counting(ARC) ──▶ [编译期计数即时释放 / 闭包须 weak self]`,

  lifecycle: `[ 阶段 03: 传统与现代生命周期解耦对照 ]

 1. 【传统命令式 UI 层级 (MVC / MVP)】
    Android:           Application ──▶ Activity (页面) ──▶ Fragment ──▶ View
    iOS:               UIApplication ──▶ UIWindow ──▶ UIViewController (页面) ──▶ UIView
                                                       │
                                                       └──▶ 控制器独立管理视图生命周期

 2. 【现代声明式 UI 层级 (Compose / SwiftUI)】
    Android:           Single Activity ──▶ Compose @Composable 函数 ──▶ LaunchedEffect / onDispose
    iOS:               @main App ──▶ WindowGroup (Scene) ──▶ SwiftUI View (.task / .onAppear)
                                                                 │
                                                                 └──▶ View 为短命不可变结构体

 3. 【应用前后台监听】
    Android:           ProcessLifecycleOwner / LifecycleEventObserver (ON_START / ON_STOP)
    iOS:               @Environment(\\.scenePhase) (.active / .inactive / .background)

 4. 【业务模型生命周期】
    Android:           ViewModel (在 onCleared 销毁释放)
    iOS:               @Observable class ViewModel (在 deinit 析构释放)`,

  ui: `[ 阶段 04: UI 布局与修饰符体系全景对照 ]

 1. 【核心容器映射】
    一维线性排布:      Column / Row            <──▶  VStack / HStack
    二维层叠覆盖:      Box                     <──▶  ZStack
    惰性流式列表:      LazyColumn              <──▶  List (系统样式) / LazyVStack (自定义流)
    惰性多列网格:      LazyVerticalGrid        <──▶  LazyVGrid(columns: [GridItem(...)])

 2. 【Modifier 逐层嵌套包装 (洋葱模型)】
    SwiftUI:           Text("Hello")
                         │──▶ .padding(16)        [外层包裹 PaddingView]
                         │──▶ .background(.blue)  [更外层包裹 BackgroundView]
                         └──▶ .cornerRadius(8)    [最外层包裹 ClipShapeView]
    (注: 修饰符从上至下依次向外层包裹视图，顺序颠倒将导致完全不同的渲染结果)

 3. 【系统图标与尺寸扩展】
    系统矢量图标:      Icon(Icons.Default.Star) <──▶  Image(systemName: "star.fill") (内置 SF Symbols)
    尺寸自适应撑满:    Modifier.fillMaxSize()   <──▶  .frame(maxWidth: .infinity, maxHeight: .infinity)`,

  state: `[ 阶段 05: 状态管理与数据流选型矩阵 ]

 1. 【视图私有状态 (组件内局部变量)】
    Android:           remember { mutableStateOf(x) }  ──▶ 组件内部可变状态
    iOS:               @State private var x            ──▶ 视图私有状态源 (变动触发重绘)

 2. 【父子双向绑定 (下发修改权限)】
    Android:           (value, onValueChange) 状态提升 ──▶ 回调通知父组件修改
    iOS:               @Binding var value              ──▶ 传递 $value 引用指针 (原地回写)

 3. 【派生状态计算 (自动缓存与依赖追踪)】
    Android:           remember(key) { derivedStateOf { ... } }
    iOS:               计算属性 var isReady: Bool { ... } (Swift 自动精确追踪依赖)

 4. 【页面业务状态 (跨组件共享)】
    Android:           class MyVM : ViewModel() + StateFlow
    iOS:               @Observable @MainActor class MyVM (iOS 17+ 属性级细粒度重绘)

 5. 【持久偏好与场景恢复】
    场景暂存恢复:      rememberSaveable { ... }        <──▶  @SceneStorage("draft_id")
    磁盘偏好设置:      DataStore (Flow 响应式存储)     <──▶  @AppStorage("is_dark_mode") (UserDefaults)`,

  navigation: `[ 阶段 06: 现代纯数据驱动导航体系全景对照 ]

 1. 【强类型路由节点】
    Android (Nav3):    @Serializable data class DetailRoute(val id: String)
    iOS (SwiftUI):     enum AppRoute: Hashable { case detail(id: String) }

 2. 【状态栈数据源 (纯 List 驱动)】
    Android (Nav3):    val backStack = rememberNavBackStack(HomeRoute)
    iOS (SwiftUI):     @State var path: [AppRoute] = []

 3. 【核心路由操作映射】
    跳转压栈:          backStack.add(DetailRoute("1"))  <──▶  path.append(.detail(id: "1"))
    返回上一页:        backStack.pop()                  <──▶  path.removeLast()
    一键清栈回首页:    backStack.clear()                <──▶  path.removeAll()

 4. 【跨页面数据结果回传】
    Android (Nav3):    LocalResultEventBus.current.sendResult(data) ──▶ ResultEffect<T> { }
    iOS (SwiftUI):     @Binding var selectedItem: Item (双向指针原地赋值) / 闭包回调`,

  async: `[ 阶段 07: 异步并发与响应式流全景对照 ]

 1. 【基础任务与调度】
    异步挂起函数:      suspend fun fetch()             <──▶  func fetch() async throws
    并发任务启动:      CoroutineScope.launch { }       <──▶  Task { }
    主线程 UI 调度:    withContext(Dispatchers.Main)   <──▶  @MainActor / MainActor.run { }
    后台 IO 调度:      withContext(Dispatchers.IO)     <──▶  Task.detached { }

 2. 【响应式数据流对标】
    冷数据流 (按需拉取):Flow<T> / flow { emit(x) }       <──▶  AsyncSequence / AsyncStream<T>
    状态热流 (UI 状态): StateFlow (有初始值 / 自动防抖)   <──▶  @Observable 属性 / CurrentValueSubject
    事件热流 (单次广播):SharedFlow / Channel (队列)     <──▶  AsyncStream<T> / PassthroughSubject

 3. 【线程安全与状态隔离】
    Android:           val mutex = Mutex(); mutex.withLock { ... }
    iOS:               actor SafeCounter { var count = 0; func inc() { count += 1 } }
                       (注: Swift 编译器在编译期强制校验 Actor 跨隔离区访问必须 await)`,

  network: `[ 阶段 08: 现代网络请求与数据编解码全景对照 ]

 1. 【HTTP 引擎与请求构建】
    底层网络引擎:      OkHttpClient                    <──▶  URLSession(configuration:)
    异步 GET 请求:     client.newCall(req).await()     <──▶  let (data, res) = try await URLSession.shared.data(from: url)
    请求头与 Body:     Request.Builder().post(body)    <──▶  var req = URLRequest(url:); req.httpMethod = "POST"

 2. 【JSON 编解码体系】
    数据模型契约:      @Serializable                   <──▶  Codable (Decodable & Encodable)
    反序列化解码:      Json.decodeFromString<T>(json)  <──▶  JSONDecoder().decode(T.self, from: data)
    字段别名映射:      @SerialName("user_id")          <──▶  enum CodingKeys: String, CodingKey { case userId = "user_id" }
    下划线转驼峰:      namingStrategy = SnakeCase      <──▶  decoder.keyDecodingStrategy = .convertFromSnakeCase

 3. 【异常拦截与高级通信】
    拦截器中间件:      OkHttp Interceptor              <──▶  URLProtocol / 自定义 API Client 管道
    全双工实时通信:    WebSocketListener               <──▶  URLSessionWebSocketTask (原生收发消息)`,

  storage: `[ 阶段 09: 本地持久化与数据库全景选型对照 ]

 1. 【轻量键值偏好】
    简单设置项:        SharedPreferences / DataStore   <──▶  UserDefaults.standard / @AppStorage
    多 App / 扩展共享: ContentProvider                 <──▶  UserDefaults(suiteName: "group.com.app")

 2. 【敏感凭据与 Token (硬件级安全)】
    Android:           EncryptedSharedPreferences / AndroidKeyStore (TEE 安全芯片)
    iOS:               Keychain Services (Secure Enclave 硬件加密 / 生物识别解锁 / 卸载不丢失)

 3. 【结构化对象关系数据库】
    模型注解与契约:    Room (@Entity / @Dao)           <──▶  SwiftData (@Model 纯 Swift 宏)
    响应式数据查询:    dao.getUsersFlow() (Flow 查询)   <──▶  @Query var users: [User] (声明式自动刷新)

 4. 【沙盒文件系统】
    持久文档目录:      context.filesDir                <──▶  FileManager (.documentDirectory / iCloud 备份)
    临时缓存目录:      context.cacheDir                <──▶  FileManager (.cachesDirectory / 系统可自动清理)`,

  architecture: `[ 阶段 10: Clean MVVM + UDF 单向数据流全景架构 ]

 +-----------------------------------------------------------------------------------+
 | 视图呈现层 (View Layer)                                                           |
 |   Android: Jetpack Compose @Composable    │  iOS: SwiftUI struct View             |
 +-----------------------------------------------------------------------------------+
                                         │
                                         │ 用户意图与动作 (Intent / User Action)
                                         ▼
 +-----------------------------------------------------------------------------------+
 | 状态与业务机 (ViewModel Layer)                                                    |
 |   Android: ViewModel + StateFlow<UiState> │  iOS: @Observable ViewModel (UiState) |
 +-----------------------------------------------------------------------------------+
                                         │
                                         │ 调用异步用例 / 仓储契约 (suspend / async)
                                         ▼
 +-----------------------------------------------------------------------------------+
 | 数据仓储层 (Repository Layer)                                                     |
 |   Repository Interface / Protocol (单向真实数据源决策 / 内存缓存与持久化协调)       |
 +-----------------------------------------------------------------------------------+
                   │                                             │
                   │ 分发远程网络请求                              │ 分发本地数据库读写
                   ▼                                             ▼
 +-----------------------------------+         +-------------------------------------+
 | 远端数据源 (Remote DataSource)    |         | 本地数据源 (Local DataSource)       |
 |   Retrofit / Ktor ──▶ URLSession  |         |   Room ──▶ SwiftData / Keychain     |
 +-----------------------------------+         +-------------------------------------+`,

  di: `[ 阶段 11: 依赖注入与服务解耦全景对照 ]

 1. 【原生构造注入 (iOS 官方主流推荐 80% 场景)】
    契约协议:          interface UserRepository        <──▶  protocol UserRepositoryProtocol
    构造默认注入:      class VM(val repo: Repo)        <──▶  init(repo: UserRepositoryProtocol = LiveRepo())
    Preview / Mock:    VM(FakeRepo())                  <──▶  #Preview { UserView(vm: VM(repo: MockRepo())) }

 2. 【视图树级环境注入】
    Android:           CompositionLocalProvider(LocalService provides service) { ... }
    iOS (SwiftUI):     View.environment(\\.apiClient, client) ──▶ @Environment(\\.apiClient) var client

 3. 【现代轻量 DI 容器 (Factory)】
    服务容器定义:      val appModule = module { ... }  <──▶  Container.shared.repo = Factory { LiveRepo() }
    属性包装器注入:    val vm: VM by viewModel()       <──▶  @Injected(\\.repo) private var repo
    作用域管理:        single { } / factory { }        <──▶  .singleton / .unique / .shared`,

  images: `[ 阶段 12: 图片与静态资源处理全景对照 ]

 1. 【静态资产与矢量图适配】
    矢量图导入:        res/drawable/ic_logo.xml        <──▶  Assets.xcassets 导入 SVG/PDF
    免切图机制:        VectorDrawable 动态光栅化       <──▶  Attributes 勾选「Single Scale」
    深浅主题色:        res/values/colors.xml (night)   <──▶  Color Set (Any / Dark Appearance)

 2. 【异步网络图片加载与缓存】
    原生加载组件:      SubcomposeAsyncImage            <──▶  AsyncImage(url:) { phase in ... }
    第三方主流库:      Coil / Glide                    <──▶  Kingfisher (KFImage) / Nuke
    多级缓存控制:      MemoryCache + DiskCache         <──▶  ImageCache.default (内存上限 + 磁盘策略)

 3. 【位图与渲染修饰】
    内存位图对象:      Bitmap / ImageBitmap            <──▶  UIImage / CGImage (CoreGraphics 管道)
    UI 缩放三部曲:     ContentScale.Crop               <──▶  .resizable().aspectRatio(contentMode: .fill).frame(...)`,

  animation: `[ 阶段 13: 声明式动画与转场体系全景对照 ]

 1. 【状态驱动属性插值】
    隐式属性动画:      val size by animateDpAsState()  <──▶  .animation(.spring(), value: targetState)
    显式闭包动画:      LaunchedEffect / Animatable     <──▶  withAnimation(.spring()) { isExpanded.toggle() }
    物理弹簧曲线:      spring(dampingRatio, stiffness) <──▶  .spring(response: 0.5, dampingFraction: 0.7)

 2. 【视图进退场转场动效】
    条件转场:          AnimatedVisibility(enter, exit) <──▶  if condition { View } + .transition(.slide)
    组合转场效果:      fadeIn() + slideInVertically()  <──▶  .opacity.combined(with: .slide)
    内容平滑过渡:      AnimatedContent                 <──▶  .contentTransition(.numericText())

 3. 【高级形变与手势驱动】
    跨层级共享元素:    SharedTransitionLayout          <──▶  matchedGeometryEffect(id:in:namespace)
    拖拽实时跟手:      pointerInput + Modifier.offset  <──▶  DragGesture().onChanged { }.onEnded { }`,

  platform: `[ 阶段 14: 系统权限、后台与推送全景对照 ]

 1. 【隐私权限合规】
    静态声明:          AndroidManifest.xml 声明        <──▶  Info.plist (Privacy Usage Description 必填)
    运行时请求:        RequestPermission API           <──▶  AVCaptureDevice.requestAccess / UNUserNotificationCenter
    权限状态分支:      PermissionChecker               <──▶  .authorized / .denied / .notDetermined

 2. 【后台任务调度与保活】
    周期调度:          WorkManager (PeriodicRequest)   <──▶  BackgroundTasks (BGAppRefreshTask 系统受控唤醒)
    后台定位与音频:    Foreground Service              <──▶  CLLocationManager (background) / AVAudioSession (.playback)

 3. 【推送通知与外部深链】
    远程推送通道:      FCM (Firebase Cloud Messaging)  <──▶  APNs (Apple Push Notification 统一系统通道)
    本地定时通知:      NotificationCompat.Builder      <──▶  UNNotificationRequest + UNTimeIntervalNotificationTrigger
    域名深链直达:      App Links (assetlinks.json)     <──▶  Universal Links (apple-app-site-association)`,

  testing: `[ 阶段 15: 单元测试与 UI 测试全景对照 ]

 1. 【单元测试与现代断言】
    传统测试框架:      JUnit 4 / JUnit 5               <──▶  XCTest (XCTestCase) + XCTAssertEqual
    现代宏测试体系:    JUnit 5 (@Test)                 <──▶  Swift Testing (@Test + #expect(a == b))
    Mock 假对象:       MockK / Mockito (反射生成)      <──▶  Protocol Mock (手写 Mock 类，编译期零反射)

 2. 【异步并发与数据流测试】
    挂起函数测试:      runTest { val res = api() }     <──▶  func testAsync() async throws { let res = try await api() }
    超时等待机制:      CountDownLatch                  <──▶  XCTestExpectation (fulfillment / wait:for:timeout:)

 3. 【自动化 UI 界面测试】
    UI 驱动引擎:       Espresso / Compose UI Test      <──▶  XCUITest (XCUIApplication)
    唯一标识定位:      onNodeWithTag("login_btn")      <──▶  app.buttons["login_btn"] (.accessibilityIdentifier)
    模拟用户手势:      performClick() / performText()  <──▶  element.tap() / element.typeText("abc")`,

  release: `[ 阶段 16: 打包构建与签名发布全景对照 ]

 1. 【多环境与构建变体】
    多环境配置:        productFlavors / Build Variants <──▶  Build Schemes (Debug / Release / Staging)
    配置与常量注入:    buildConfigField / resValue     <──▶  xcconfig 文件 ──▶ 注入 Info.plist 宏定义
    编译优化裁剪:      R8 / ProGuard / minifyEnabled   <──▶  Swift Optimization (-Osize) / Strip Symbols

 2. 【签名证书与安全体系】
    开发者身份凭证:    Keystore (.jks 密钥库)          <──▶  Apple Developer Certificate (开发者公钥证书)
    权限与设备描述:    Play App Signing                <──▶  Provisioning Profile (绑定证书 + App ID + 设备 UDID)
    签名托管模式:      signingConfigs { }              <──▶  Xcode 勾选「Automatically manage signing」

 3. 【应用产物与分发渠道】
    安装包归档产物:    APK / AAB (Android App Bundle)  <──▶  IPA / Xcode Archive (.xcarchive 归档)
    开发者发布控制台:  Google Play Console             <──▶  App Store Connect (元数据 / 价格 / 提审)
    官方内测分发:      Google Play 内部测试            <──▶  TestFlight (邮件邀请 / 公开测试链接)`,
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


