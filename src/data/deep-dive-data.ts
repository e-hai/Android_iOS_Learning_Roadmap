import { DeepDiveDomain, PlatformDeepDive } from '../models/types';

export const deepDivesData: Record<string, PlatformDeepDive> = {
  domain_01_basics: {
    android: [
      {
        tag: '并发底层',
        title: 'Kotlin 协程从浅入深：挂起心智模型、CPS 状态机与 Dispatcher 调度器',
        explanation: `### 1. 概念（浅）：非阻塞挂起
- **本质**：协程是运行在线程之上的**用户态协作任务**。
- **挂起 vs 阻塞**：\`Thread.sleep\` 阻塞并卡死当前线程；\`delay\` **主动让出线程**给 UI 绘制，I/O 完成后调度空闲线程恢复执行。

### 2. 结构化并发（中）：作用域与生命周期
- **Job 树**：父协程 \`cancel()\` 级联取消所有子协程。
- **异常隔离**：\`SupervisorJob\`（如 \`viewModelScope\`）隔离子协程异常，防止单一崩溃波及全局。
- **生命周期**：配合 \`repeatOnLifecycle\` 在后台自动暂停流收集，杜绝 CPU 与电量浪费。

### 3. 编译底层（深）：CPS 状态机
- **CPS 转换**：\`suspend fun f(): T\` 编译为 \`fun f(cont: Continuation<T>): Any?\`。
- **状态机生成**：编译器生成 \`when(label)\` 状态机，挂起时返回 \`COROUTINE_SUSPENDED\` 并释放调用栈，完成后通过 \`resumeWith()\` 推进至下一状态。

### 4. 调度器（深）：Dispatchers
- **Main**：绑定 Android 主线程 Looper。
- **Default**：计算密集型，基于 CPU 核心数 Work-Stealing 线程池。
- **IO**：阻塞 I/O，最大可弹性扩展至 64 线程。`,
        diagram: `[ Kotlin 协程从浅入深：挂起心智模型、CPS 状态机与调度器全景图解 ]

 1. 【心智模型对比：线程阻塞 vs 协程非阻塞挂起】
    传统线程阻塞 (Thread.sleep):
    [ Thread-Main ] ──▶ [ I/O 同步阻塞 (500ms，线程卡死) ] ──▶ [ 恢复执行 ] ➔ 易引发 ANR！

    协程非阻塞挂起 (delay / suspend I/O):
    [ Thread-Main ] ──▶ [ 遇到挂起点，主线程立即释放处理 UI 绘制与触摸 ]
                               │ (后台 epoll / Netty 等待 I/O 事件)
    [ Thread-Worker] ◀───────── [ I/O 完成，调度器分配空闲 Worker 调用 resumeWith 恢复协程 ]

 2. 【编译期 CPS 变换与 Continuation 状态机执行流】
    开发者源码:                     编译器生成的伪代码:
    suspend fun loadData(): Data {  fun loadData(cont: Continuation<Data>): Any? {
        val t = fetchToken()            val sm = cont as? LoadSM ?: LoadSM(cont)
        val u = fetchUser(t)            when (sm.label) {
        return combine(t, u)                0 -> { sm.label = 1; fetchToken(sm) } // 挂起则 return COROUTINE_SUSPENDED
    }                                       1 -> { sm.label = 2; fetchUser(sm.t, sm) }
                                            2 -> { return combine(sm.t, sm.u) }
                                        }
                                    }

 3. 【结构化并发作用域与 Job 树异常传播机制】
    viewModelScope (SupervisorJob: 隔离异常)
         │
         ├──▶ 子协程 A (launch: 拉取用户) ──▶ [网络超时异常 ➔ 被 SupervisorJob 拦截]
         └──▶ 子协程 B (async: 预加载广告) ──▶ [不受任何影响，继续正常渲染]`,
        codeSnippet: `// 1. Android 工业级 ViewModel 结构化并发规范
class UserProfileViewModel(
    private val userRepository: UserRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<UiState<UserProfile>>(UiState.Loading)
    val uiState: StateFlow<UiState<UserProfile>> = _uiState.asStateFlow()

    fun loadProfile(userId: String) {
        // viewModelScope 默认采用 SupervisorJob + Dispatchers.Main.immediate
        viewModelScope.launch(CoroutineExceptionHandler { _, exception ->
            _uiState.value = UiState.Error(exception.message ?: "未知异常")
        }) {
            // 并行异步拉取基础信息与统计数据
            val userDeferred = async(Dispatchers.IO) { userRepository.fetchUser(userId) }
            val statsDeferred = async(Dispatchers.IO) { userRepository.fetchStats(userId) }

            // await 同时挂起等待双结果就绪并合并
            val profile = UserProfile(
                user = userDeferred.await(),
                stats = statsDeferred.await()
            )
            _uiState.value = UiState.Success(profile)
        }
    }
}

// 2. Compose UI 生命周期安全收集 (避免后台浪费 CPU)
@Composable
fun UserProfileScreen(viewModel: UserProfileViewModel) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    when (val s = state) {
        is UiState.Loading -> LoadingSpinner()
        is UiState.Success -> ProfileContent(s.data)
        is UiState.Error -> ErrorBanner(s.message)
    }
}`,
      },
      {
        tag: '内存模型',
        title: 'JVM / ART 垃圾回收与 LeakCanary 引用链探测原理',
        explanation: 'Android ART 运行时采用基于分代 (Generational) 与并发标记清除 (CMC) 算法。年轻代通过移动复制减少内存碎片，老年代采用 CMS 或 Region-based GC。LeakCanary 的核心原理是在 Activity/Fragment 销毁时 (onDestroy)，将目标对象包装为 KeyedWeakReference 并挂载到 ReferenceQueue 引用队列；延迟 5 秒触发 GC 后若该引用仍未进入队列，说明对象被静态单例或长生命周期后台线程强引用，LeakCanary 进而导出 Hprof 堆转储并解析最短 GC Roots 强引用链。',
        codeSnippet: `// 自定义核心对象泄漏监听
class ObjectWatcher {
    private val queue = ReferenceQueue<Any>()
    private val watchedObjects = ConcurrentHashMap<String, KeyedWeakReference>()

    fun watch(watchedObject: Any, description: String) {
        val key = UUID.randomUUID().toString()
        val ref = KeyedWeakReference(watchedObject, key, description, queue)
        watchedObjects[key] = ref
        // 5秒后检查 queue 是否出队...
    }
}`,
      },
      {
        tag: '渲染底层',
        title: 'Compose Slot Table 插槽表架构与重组跳过 (Skip) 条件',
        explanation: 'Jetpack Compose 不生成传统 View 树，而是维护一个平铺的 Slot Table 线性数组（内含 Gap Buffer 间隙缓冲区）。Composable 函数的每次调用，其参数、remember 缓存以及子组件均存储在 Slot Table 的插槽中。重组发生时，Compose 编译器通过 @Stable / @Immutable 标注检查输入参数的 Structural Equality (equals)。若所有参数均未改变且标记为稳定，Composer 直接跳过函数执行并将 Gap Buffer 游标移动至下一组件。',
        codeSnippet: `// 强制启用稳定类型，使 Compose 能够跳过重组
@Immutable
data class UserUiModel(
    val id: String,
    val name: String,
    val tags: ImmutableList<String> // 必须使用不可变集合，避免 List<T> 不稳定
)

@Composable
fun UserCard(user: UserUiModel) { // user 稳定且 equals 相同，重组被完全跳过
    Text(text = user.name)
}`,
      },
      {
        tag: '网络底层',
        title: 'OkHttp 连接池复用、Socket 保持与拦截器链分发',
        explanation: 'OkHttp 采用责任链模式 (RealInterceptorChain) 依次分发请求：RetryAndFollowUpInterceptor（重试重定向）➔ BridgeInterceptor（注入 Header 与 Cookie）➔ CacheInterceptor（HTTP 缓存）➔ ConnectInterceptor（从 ConnectionPool 查找复用 Socket 或建立 TCP/TLS 握手）➔ CallServerInterceptor（向 Socket 写入 HTTP/2 帧并读取 Response）。ConnectionPool 默认保持 5 个空闲连接且闲置 5 分钟后由后台线程自动清理。',
        codeSnippet: `// 全局单例 OkHttpClient 配置连接池与拦截器
val okHttpClient = OkHttpClient.Builder()
    .connectionPool(ConnectionPool(10, 5, TimeUnit.MINUTES))
    .addInterceptor(LoggingInterceptor()) // Application 拦截器: 拦截业务逻辑
    .addNetworkInterceptor(StethoInterceptor()) // Network 拦截器: 监控真实网络字节
    .retryOnConnectionFailure(true)
    .build()`,
      },
      {
        tag: '存储底层',
        title: 'Room InvalidationTracker 源码机制与 SQLite WAL 模式',
        explanation: 'Room 在开启 WAL (Write-Ahead Logging) 模式后，读写操作完全分离互不阻塞。当在 DAO 中声明返回 Flow<T> 时，Room 会通过 InvalidationTracker 在底层数据库建立 SQLite 触发器 (Trigger) 监听 target_table。每当发生 INSERT/UPDATE/DELETE，触发器向 room_table_modification_log 写入变更标记；InvalidationTracker 的后台观察者定时轮询该表，发现变动后重新执行查询并通过 Flow 发射最新数据集合。',
        codeSnippet: `// Room 数据库配置 WAL 与响应式 Flow
@Dao
interface UserDao {
    @Query("SELECT * FROM users WHERE status = 'active'")
    fun observeActiveUsers(): Flow<List<UserEntity>> // 自动绑定 InvalidationTracker
}

@Database(entities = [UserEntity::class], version = 2)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
}`,
      },
    ],
    ios: [
      {
        tag: '并发底层',
        title: 'Swift Concurrency 从浅入深：async/await、Task 树与 Actor 数据隔离',
        explanation: `### 1. 概念（浅）：async/await
- **协作式挂起**：\`await\` 标记挂起点，挂起时主动让出底层 Worker 线程，杜绝传统 GCD 的线程爆炸与上下文切换损耗。

### 2. 结构化并发（中）：Task 树
- **自动级联**：父 Task 取消时自动向下传播 \`isCancelled\` 信号；SwiftUI \`.task\` 随 View 销毁自动取消。
- **TaskGroup**：动态并行发包，统一等待全部子任务收敛。

### 3. 数据隔离（深）：Actor 模型
- **数据竞态消除**：\`actor\` 保证同一时刻仅有单个 Task 访问内部可变状态，外部访问必须 \`await\`。
- **@MainActor**：强制将 ViewModel 状态更新绑定至主 RunLoop。

### 4. 协作线程池（深）：Cooperative Pool
- 线程数量严格受限于 CPU 物理核心数，通过任务挂起让权实现高吞吐并发调度。`,
        diagram: `[ Swift Concurrency 从浅入深：async/await、Task 树与 Actor 调度全景图解 ]

 1. 【心智模型对比：GCD 线程爆炸 vs 协作式线程池】
    传统 GCD 并发 (DispatchQueue.global.async):
    [ Request 1..100 ] ──▶ 操作系统创建 100 个线程 ➔ 内存暴涨 + CPU 调度颠簸！

    Swift Concurrency 协作式模型 (Cooperative Pool):
    [ Task 1..100 ] ──▶ 固定核心数线程池 (如 6 个 Worker)
                          └── Task 在 await 挂起时让出线程，零线程爆炸！

 2. 【结构化并发 Task 树与生命周期】
    SwiftUI View (.task) ──▶ 创建根 Task (随 View 销毁自动 cancel)
         │
         ├──▶ withTaskGroup { group in
         │        ├── group.addTask { fetchAvatar() }  ──▶ 继承优先级
         │        └── group.addTask { fetchFriends() } ──▶ 级联响应取消
         │    }

 3. 【Actor 数据隔离与编译期竞态消除】
    @MainActor ViewModel (主线程) ──(await)──▶ actor DatabaseStore (独立隔离域)
                                                └── 保证同一物理时刻仅 1 个 Task 访问`,
        codeSnippet: `// 1. 数据隔离 Actor 模型
actor SafeAccountStore {
    private var balance: Double = 0.0

    func deposit(amount: Double) {
        balance += amount
    }

    func getBalance() -> Double {
        return balance
    }
}

// 2. @MainActor ViewModel 结构化并发实战
@Observable
@MainActor
final class AccountViewModel {
    var balance: Double = 0.0
    var isLoading: Bool = false
    private let store = SafeAccountStore()

    func refresh() async {
        isLoading = true
        defer { isLoading = false }

        async let newBalance = store.getBalance()
        // await 挂起点：释放主线程给 UI 渲染
        self.balance = await newBalance
    }
}`,
      },
      {
        tag: '内存模型',
        title: 'Swift 内存布局、Copy-On-Write (COW) 与 ARC Side Table',
        explanation: 'Swift 的 struct 值类型默认分配在栈 (Stack) 上，当赋值或传参时进行浅拷贝。Array/Dictionary/Set 等标准集合实现了 Copy-On-Write 机制：只有在发生写操作且 isKnownUniquelyReferenced(&buffer) 发现强引用计数大于 1 时，才在堆上真正执行深拷贝。class 引用对象使用 ARC 管理；当对象被 weak 弱引用引用或引用计数超过 255 时，Swift 会为该对象动态分配一个 Side Table（副表），将弱引用指针和溢出计数移入副表，防止僵尸对象野指针崩溃。',
        codeSnippet: `// 自定义实现 Copy-on-Write 包装器
final class RefBox<T> {
    var value: T
    init(_ value: T) { self.value = value }
}

struct COWWrapper<T> {
    private var box: RefBox<T>
    init(_ value: T) { self.box = RefBox(value) }

    var value: T {
        get { box.value }
        set {
            if !isKnownUniquelyReferenced(&box) {
                box = RefBox(newValue) // 仅在多强引用且写入时深拷贝
            } else {
                box.value = newValue
            }
        }
    }
}`,
      },
      {
        tag: '渲染底层',
        title: 'SwiftUI AttributeGraph 属性图与 @Observable 依赖追踪',
        explanation: 'SwiftUI 核心依赖由 C++ 编写的 AttributeGraph 属性依赖图。每个 SwiftUI View 结构体在评估 body 时，系统会自动订阅其读取的所有状态属性（如 @State, @Binding 或 Swift 5.9 的 @Observable）。AttributeGraph 将 View 与具体属性建立有向无环图 (DAG)。当某一属性值改变时，AttributeGraph 仅沿 DAG 拓扑路径精确定位并重绘受影响的子视图节点，完全避免了整棵视图树的无谓重新计算。',
        codeSnippet: `// Swift 5.9 宏 @Observable 精确订阅追踪
@Observable
final class ProfileViewModel {
    var name: String = "Alice" // 仅当 name 改变时刷新读取了 name 的组件
    var age: Int = 28          // 仅当 age 改变时刷新读取了 age 的组件
}

struct UserProfileView: View {
    @State private var vm = ProfileViewModel()
    var body: some View {
        Text(vm.name) // 仅订阅了 vm.name
    }
}`,
      },
      {
        tag: '网络底层',
        title: 'URLSession 后台守护、URLProtocol 拦截与并发控制',
        explanation: 'iOS 的 URLSession 支持 Default、Ephemeral（内存不存盘）与 Background 三种会话模式。Background URLSession 会将下载/上传任务托管给系统的 nsurlsessiond 独立守护进程；即使 App 被系统挂起或由于内存不足被杀死，下载任务仍在后台继续传输，传输完成后系统自动唤醒 App 并回调 AppDelegate 的 handleEventsForBackgroundURLSession。通过自定义 URLProtocol，可以拦截并重写全局 HTTP 请求进行 Mock、缓存与数据加解密。',
        codeSnippet: `// 自定义 URLProtocol 拦截全局网络请求
class CustomNetworkInterceptor: URLProtocol {
    override class func canInit(with request: URLRequest) -> Bool {
        return request.value(forHTTPHeaderField: "X-Intercepted") == nil
    }

    override class func canonicalRequest(for request: URLRequest) -> URLRequest {
        var req = request
        req.setValue("true", forHTTPHeaderField: "X-Intercepted")
        return req
    }

    override func startLoading() {
        // 自定义处理或 Mock 响应...
    }
}`,
      },
    ],
  },

  domain_02_arch: {
    android: [
      {
        tag: '状态流转',
        title: 'MVI 单向数据流建模与 UiEvent 一次性事件防重消费',
        explanation: '在 MVI (Model-View-Intent) 架构中，UI 状态由单一不可变的 UiState data class 表示，任何业务变更都通过 copy() 产生新状态并由 StateFlow 分发。然而，导航跳转、弹窗提示、支付拉起等属于“一次性事件 (UiEvent)”。如果将 UiEvent 放在 StateFlow 中，横竖屏旋转或重新订阅时会导致事件被重复消费；业界最佳实践是使用 Channel(Channel.BUFFERED) 或具有生命周期感知的单次消费事件封装器。',
        codeSnippet: `// ViewModel 中安全分发 State 与 一次性 Event
data class MainUiState(val isLoading: Boolean = false, val data: List<String> = emptyList())
sealed interface MainUiEffect {
    data class ShowToast(val message: String) : MainUiEffect
    data class NavigateToDetail(val id: String) : MainUiEffect
}

class MainViewModel : ViewModel() {
    val uiState: StateFlow<MainUiState> = ...
    private val _effect = Channel<MainUiEffect>(Channel.BUFFERED)
    val effect = _effect.receiveAsFlow() // View 侧在 repeatOnLifecycle 中 collect
}`,
      },
      {
        tag: '组件治理',
        title: '大型组件化依赖倒置 (DIP) 与 build-logic 统一插件工程',
        explanation: '在多 Module 大型工程中，Feature 模块间严禁直接相互依赖，必须通过依赖倒置原则 (DIP) 拆分为 :feature:user:api (仅包含接口契约与数据模型) 与 :feature:user:impl (具体业务实现)。全局依赖版本与公共编译脚本通过 Gradle Convention Plugins (build-logic 独立 Composite Build) 集中管控，杜绝各个 build.gradle.kts 中重复配置编译选项。',
        codeSnippet: `// build-logic/src/main/kotlin/AndroidFeatureConventionPlugin.kt
class AndroidFeatureConventionPlugin : Plugin<Project> {
    override fun apply(target: Project) = with(target) {
        pluginManager.apply("com.android.library")
        pluginManager.apply("org.jetbrains.kotlin.android")
        extensions.configure<LibraryExtension> {
            compileSdk = 35
            defaultConfig.minSdk = 24
        }
    }
}`,
      },
    ],
    ios: [
      {
        tag: '状态机架构',
        title: 'TCA (The Composable Architecture) 状态机与 Reducer 演进',
        explanation: 'TCA 是 iOS 生态中最严谨的单向数据流与状态机框架。它将业务严格拆解为 State（纯值类型状态树）、Action（所有可能发生的用户交互与系统事件枚举）、Reducer（无副作用的纯函数，接收 State 与 Action 并返回下一个 State）以及 Effect（处理网络、定时器等异步副作用并转换回 Action）。TCA 从根本上保证了业务逻辑的可测试性、可追溯性与确定性。',
        codeSnippet: `// TCA 核心结构示例
@Reducer
struct CounterFeature {
    struct State: Equatable {
        var count = 0
        var isLoading = false
    }

    enum Action {
        case incrementButtonTapped
        case fetchDataResponse(Result<Int, Error>)
    }

    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .incrementButtonTapped:
                state.count += 1
                return .none
            case .fetchDataResponse(.success(let val)):
                state.count = val
                return .none
            }
        }
    }
}`,
      },
      {
        tag: '模块化治理',
        title: 'SPM 多 Target 依赖注入与 XCConfig 环境隔离',
        explanation: '对标 Android 多模块，现代 iOS 工程通过单一 SPM Package 拆分多个 Target（Domain 纯逻辑层 / Data 数据实现层 / Feature UI 层）。Feature 仅依赖 Domain 中的 Protocol，App 主 Target 组装具体实现，从而大幅提升 Xcode 增量编译速度。通过 Debug.xcconfig 与 Release.xcconfig 注入不同的 API BaseURL 与编译标记，实现零代码侵入的多环境隔离。',
        codeSnippet: `// Package.swift 声明解耦的 Target 依赖图
let package = Package(
    name: "CoreModules",
    products: [
        .library(name: "FeatureHome", targets: ["FeatureHome"]),
    ],
    targets: [
        .target(name: "DomainContracts"), // 纯契约层
        .target(name: "DataLayer", dependencies: ["DomainContracts"]),
        .target(name: "FeatureHome", dependencies: ["DomainContracts"]) // 仅依赖契约
    ]
)`,
      },
    ],
  },

  domain_03_perf: {
    android: [
      {
        tag: '链路追踪',
        title: 'Perfetto 系统级追踪分析与 Baseline Profiles 预编译优化',
        explanation: 'Perfetto 是 Android 官方最强大的系统级性能剖析工具，通过 ftrace 捕获内核调度、 Choreographer 渲染帧、主线程 Lock 争用与 Binder IPC 调用耗时。Baseline Profiles（基准配置文件）允许开发者在 App 打包时预录制核心使用场景的 ART 字节码执行热点，在应用安装或空闲维护时直接由 dex2oat 预编译为机器码 (AOT)，免除冷启动运行时的解释执行与 JIT 编译开销，冷启动速度直接提升 30%~40%。',
        codeSnippet: `# 1. 抓取 Perfetto 性能 Trace (记录 10 秒)
adb shell perfetto -o /data/misc/perfetto-traces/trace.perfetto-trace \
    -t 10s sched freq idle am wm gfx view binder_driver

# 2. 生成 Baseline Profile 自动化模块配置
plugins {
    id("androidx.baselineprofile")
}
baselineProfile {
    saveInSrc = true
    automaticGenerationDuringBuild = false
}`,
      },
      {
        tag: '故障攻坚',
        title: '线上 ANR 信号捕获机制与 Native 内存泄漏定位',
        explanation: '当主线程在处理 Broadcast (10s/60s)、Service (20s) 或 InputEvent (5s) 超时未返回时，系统 ActivityManagerService 会向目标进程发送 SIGQUIT (3) 信号，由 ART 信号处理器在 /data/anr/traces.txt 生成线程堆栈快照。排查 Native/堆外内存暴涨时，使用 Android Studio Profiler 的 Native Memory Record 或 AddressSanitizer (ASan) 排查 C/C++ 指针未释放及 Bitmap Hardware Buffer 泄漏。',
        codeSnippet: `# 导出并分析最新 ANR 堆栈
adb shell ls -l /data/anr/
adb pull /data/anr/anr_* ./anr_trace.txt

# 查看进程 Native 与 Graphics 物理内存开销
adb shell dumpsys meminfo com.example.app | grep -E "Native Heap|Gfx dev|EGL mtrack"`,
      },
    ],
    ios: [
      {
        tag: '性能度量',
        title: 'MetricKit 线上真实用户数据回传与 Instruments Time Profiler',
        explanation: 'Apple 提供了原生的 MetricKit 框架，能够以极低功耗在后台收集设备 24 小时内的真实用户性能指标（包括 App 启动时间、挂起率、丢帧率、磁盘写入量与内存峰值）以及崩溃诊断日志 (MXCrashDiagnostic)。在开发阶段，使用 Instruments Time Profiler 开启 1ms 高频采样，结合 os_signpost 自定义埋点，能够毫秒级定位耗时瓶颈。',
        codeSnippet: `// 注册并接收 MetricKit 线上性能与崩溃指标
import MetricKit

final class PerformanceMetricsManager: NSObject, MXMetricManagerSubscriber {
    override init() {
        super.init()
        MXMetricManager.shared.add(self)
    }

    func didReceive(_ payloads: [MXMetricPayload]) {
        for payload in payloads {
            // 上报冷启动耗时与渲染丢帧指标到自建看板
            let launchTime = payload.applicationLaunchMetrics?.histogrammedTimeToFirstDraw
        }
    }
}`,
      },
      {
        tag: '故障攻坚',
        title: 'Watchdog (0x8badf00d) 卡死分析与内存 Leaks 循环引用排查',
        explanation: '当 iOS 主线程在启动阶段耗时超过 20 秒，或在运行中卡死超过 10 秒时，系统 Watchdog 会强制杀死 App 并抛出异常码 0x8badf00d ("ate bad food")。排查内存泄漏时，使用 Xcode Memory Graph 观察对象节点间的有向引用环，重点检查闭包捕获 self 未加 [weak self]、NSTimer/CADisplayLink 强引用 target 以及 Delegate 协议未声明为 AnyObject / weak。',
        codeSnippet: `// 预防闭包与 Delegate 循环引用标准模式
protocol TaskDelegate: AnyObject { // 必须继承 AnyObject 才能使用 weak
    func taskDidFinish()
}

final class TaskRunner {
    weak var delegate: TaskDelegate? // weak 防止循环引用

    func execute() {
        DispatchQueue.global().async { [weak self] in // 闭包弱引用
            guard let self = self else { return }
            self.delegate?.taskDidFinish()
        }
    }
}`,
      },
    ],
  },

  domain_04_media: {
    android: [
      {
        tag: '图形渲染',
        title: 'OpenGL ES 3.0 管线、EGL 多线程上下文与 SurfaceView 硬件加速',
        explanation: 'OpenGL ES 图形管线包含顶点着色器 (Vertex Shader) ➔ 图元装配 ➔ 光栅化 ➔ 片元着色器 (Fragment Shader) ➔ 帧缓冲 (FBO)。OpenGL 是状态机且严格与当前线程绑定。在后台线程进行滤镜处理或硬解码渲染时，必须调用 eglCreateContext 传入主 EGLContext 创建共享上下文 (ShareContext)。SurfaceView 拥有独立的 Surface 图层直接挂载在 WindowManagerService 上，不参与 View 树重绘，吞吐率远高于 TextureView。',
        codeSnippet: `// EGL 共享上下文创建与双缓冲绑定
val attribList = intArrayOf(EGL14.EGL_CONTEXT_CLIENT_VERSION, 3, EGL14.EGL_NONE)
val sharedEglContext = EGL14.eglCreateContext(
    eglDisplay, eglConfig, mainEglContext, attribList, 0
)
EGL14.eglMakeCurrent(eglDisplay, eglSurface, eglSurface, sharedEglContext)`,
      },
      {
        tag: '音视频管线',
        title: 'CameraX 帧采集 ➔ MediaCodec 硬件编码 ➔ PTS/DTS 音画同步',
        explanation: '工业级视频录制链路：CameraX 配置 ImageAnalysis 或直接输出 Surface 至 MediaCodec 硬件编码器；MediaCodec 从 Surface 提取 YUV 数据并由硬件 ASIC 芯片实时压缩为 H.264/H.265 NALU 单元；编码器输出端轮询 dequeueOutputBuffer，提取 ByteBuffer 与 BufferInfo；通过对齐系统纳秒时钟 (System.nanoTime() / 1000)，确保视频 PTS 与音频 AudioRecord PTS 严格单调递增，最后通过 MediaMuxer 封装为 MP4 容器。',
        codeSnippet: `// MediaCodec 配置 Surface 输入硬编码
val format = MediaFormat.createVideoFormat(MediaFormat.MIMETYPE_VIDEO_AVC, 1080, 1920).apply {
    setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface)
    setInteger(MediaFormat.KEY_BIT_RATE, 6_000_000)
    setInteger(MediaFormat.KEY_FRAME_RATE, 60)
    setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, 1)
}
val encoder = MediaCodec.createEncoderByType(MediaFormat.MIMETYPE_VIDEO_AVC)
encoder.configure(format, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
val inputSurface = encoder.createInputSurface() // 传递给 OpenGL / CameraX`,
      },
    ],
    ios: [
      {
        tag: '图形渲染',
        title: 'Metal 低开销图形管线、CAMetalLayer 与 Shader 编译',
        explanation: 'Metal 是 Apple 为替代 OpenGL ES 开发的原生底层图形 API，具备极低的 CPU 驱动开销与多线程渲染命令录制能力。Metal 渲染核心组件包括 MTLDevice（GPU 句柄）、MTLCommandQueue（命令队列）、MTLRenderPipelineState（着色器编译管线）与 CAMetalLayer（CoreAnimation 直通图层）。Metal Shading Language (MSL) 在 App 编译期即可预编译为 AIR 字节码，运行时无着色器编译卡顿。',
        codeSnippet: `// Metal 基础渲染管线配置
import MetalKit

guard let device = MTLCreateSystemDefaultDevice(),
      let commandQueue = device.makeCommandQueue() else { fatalError() }

let pipelineDescriptor = MTLRenderPipelineDescriptor()
pipelineDescriptor.vertexFunction = defaultLibrary.makeFunction(name: "vertexShader")
pipelineDescriptor.fragmentFunction = defaultLibrary.makeFunction(name: "fragmentShader")
pipelineDescriptor.colorAttachments[0].pixelFormat = .bgra8Unorm

let pipelineState = try device.makeRenderPipelineState(descriptor: pipelineDescriptor)`,
      },
      {
        tag: '音视频管线',
        title: 'AVFoundation 帧采集 ➔ VideoToolbox 硬编码 ➔ CMTime 纳秒对齐',
        explanation: 'iOS 音视频采集通过 AVCaptureSession 驱动 AVCaptureVideoDataOutput 输出 CVPixelBuffer 视频帧与 CMSampleBuffer 音频帧；利用 VideoToolbox 的 VTCompressionSession 开启硬件 H.264/HEVC 编码；音画同步核心依托 CoreMedia 的 CMTime 结构体（包含 value / timescale 精度表示），确保写入 AVAssetWriterInput 的时间戳连续无丢帧。',
        codeSnippet: `// VideoToolbox 硬编码会话创建
import VideoToolbox

var compressionSession: VTCompressionSession?
VTCompressionSessionCreate(
    allocator: kCFAllocatorDefault,
    width: 1080,
    height: 1920,
    codecType: kCMVideoCodecType_H264,
    encoderSpecification: nil,
    imageBufferAttributes: nil,
    compressedDataAllocator: nil,
    outputCallback: nil,
    refcon: nil,
    compressionSessionOut: &compressionSession
)`,
      },
    ],
  },

  domain_05_global: {
    android: [
      {
        tag: '出海订阅',
        title: 'Google Play Billing v6+ 订阅生命周期与断网掉单补单机制',
        explanation: 'Google Play Billing v6+ 引入了多 BasePlan 与 Offer 定价模型。订阅购买完整闭环：queryProductDetailsAsync ➔ launchBillingFlow ➔ PurchasesUpdatedListener 接收 Purchase 对象 ➔ 上传 purchaseToken 至自建服务端发起 Google Play Developer API 验证 ➔ 验证通过后必须调用 acknowledgePurchase() 确认订单完成发货。若 3 天内未 acknowledge，Google Play 会自动退款并撤销订阅。客户端在每次 App 启动和用户登录时必须调用 queryPurchasesAsync()，主动捞取未确认订单进行补发货。',
        codeSnippet: `// 启动检查未确认订单 (补单机制)
billingClient.queryPurchasesAsync(
    QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.SUBS).build()
) { billingResult, purchases ->
    if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
        purchases.forEach { purchase ->
            if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED && !purchase.isAcknowledged) {
                verifyWithServerAndAcknowledge(purchase) // 服务端验签并确认
            }
        }
    }
}`,
      },
      {
        tag: '变现与合规',
        title: 'AdMob / MAX 广告聚合竞价与 GDPR CMP 隐私合规弹窗',
        explanation: '现代出海 App 变现采用 Mediation（广告聚合）架构，通过 Header Bidding（实时客户端与服务端竞价）最大化 eCPM 填充率。针对欧洲用户，必须在初始化广告与归因 SDK 之前集成 Google UMP (User Messaging Platform) 或主流 CMP (Consent Management Platform) 弹出 GDPR 隐私授权协议；只有在用户明确同意 (Consent) 后，方可采集 AAID (Google Advertising ID) 并初始化广告网络，否则面临被 Google Play 下架与巨额罚款。',
        codeSnippet: `# 检查与拉取 Google UMP GDPR 授权
val params = ConsentRequestParameters.Builder().setTagForUnderAgeOfConsent(false).build()
val consentInformation = UserMessagingPlatform.getConsentInformation(context)
consentInformation.requestConsentInfoUpdate(activity, params, {
    UserMessagingPlatform.loadAndShowConsentFormIfRequired(activity) { formError ->
        if (consentInformation.canRequestAds()) {
            MobileAds.initialize(context) // 授权通过后初始化广告 SDK
        }
    }
}, { error -> })`,
      },
    ],
    ios: [
      {
        tag: '出海订阅',
        title: 'Apple StoreKit 2 订阅事务、JWS 验签与 Transaction.updates 监听',
        explanation: 'StoreKit 2 全面采用 Swift Concurrency 现代化 API。所有购买记录均返回经过 Apple 官方私钥加密签名的 JWS (JSON Web Signature) Transaction 对象。客户端通过 VerificationResult 安全验证签名合法性后，必须调用 transaction.finish() 明确标记事务完成。通过在 App 启动时全局监听 Transaction.updates 异步序列，能够自动捕获后台自动续费、家庭共享变更、退款撤销以及断网恢复后的补单事件。',
        codeSnippet: `// StoreKit 2 全局监听后台事务更新与自动补单
func listenForTransactions() -> Task<Void, Never> {
    return Task.detached {
        for await result in Transaction.updates {
            switch result {
            case .verified(let transaction):
                await self.deliverContent(for: transaction)
                await transaction.finish() // 必须显式 finish
            case .unverified(_, let error):
                print("JWS 验签失败: \\(error)")
            }
        }
    }
}`,
      },
      {
        tag: '归因与合规',
        title: 'SKAdNetwork 4.0 渠道归因、ATT 授权与 Privacy Manifest 声明',
        explanation: '自 iOS 14.5 起，采集 IDFA 必须通过 AppTrackingTransparency (ATT) 弹窗申请权限。对于拒绝授权的用户，Apple 采用 SKAdNetwork 4.0 (SKAN) 提供聚合与差分隐私归因。自 iOS 17 起，Apple 强制要求第三方 SDK 与 App 包含 PrivacyInfo.xcprivacy (Privacy Manifest) 文件，显式声明 API 使用理由（如 UserDefaults / File Timestamp 访问原因），在 Xcode 打包归档时自动生成隐私报告，未声明的 App 将直接被 App Store Connect 拒绝提交。',
        codeSnippet: `// 申请 ATT 广告追踪授权
import AppTrackingTransparency
import AdSupport

func requestTrackingAuthorization() {
    ATTrackingManager.requestTrackingAuthorization { status in
        switch status {
        case .authorized:
            let idfa = ASIdentifierManager.shared().advertisingIdentifier
            AppsFlyerLib.shared().waitForATTUserAuthorization(timeoutInterval: 60)
        default:
            // 降级至 SKAdNetwork 归因
            break
        }
    }
}`,
      },
      {
        tag: '归因深链',
        title: 'Universal Links 与 SceneDelegate 路由重定向',
        explanation: 'iOS 的 Universal Links 允许通过部署在服务器上的 apple-app-site-association (AASA) JSON 文件，将普通 HTTPS 链接直接映射至原生 App。配合 SwiftUI 的 onOpenURL 修饰符或 SceneDelegate 中的 delegate 方法，可以轻松解析跳转路径。针对新用户拉新，结合 AppsFlyer OneLink 处理延迟跳转，保障用户从社交媒体点击广告到商店下载并首次打开时，能精准承接到特定落地页。',
        codeSnippet: `// SwiftUI 处理 Universal Links 与深链跳转
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .onOpenURL { url in
                    // 解析 Universal Link 路由信息
                    if let components = URLComponents(url: url, resolvingAgainstBaseURL: true),
                       let queryItems = components.queryItems {
                        let campaign = queryItems.first(where: { $0.name == "campaign" })?.value
                        // 触发页面路由
                        Router.shared.navigate(to: url.path, with: campaign)
                    }
                }
        }
    }
}`,
      },
      {
        tag: 'AB实验',
        title: 'Remote Config 实验下发与 Activation 策略',
        explanation: '在 iOS 中使用 Firebase Remote Config 进行 A/B 实验时，需要处理好默认配置与云端数据的时序问题。最佳实践是打包携带一份 Default.plist 防止首屏空白。应用启动时异步执行 fetch flow 拉取最新的实验条件及百分比分流数据，拉取成功后再 activate 生效。同时利用 ExperimentalValue 动态配置 UI 参数，使得客户端可灵活参与各类多变量测试。',
        codeSnippet: `// iOS Firebase Remote Config 实验参数拉取
import FirebaseRemoteConfig

let remoteConfig = RemoteConfig.remoteConfig()
let settings = RemoteConfigSettings()
settings.minimumFetchInterval = 3600
remoteConfig.configSettings = settings

remoteConfig.fetchAndActivate { status, error in
    guard error == nil else { return }
    if status == .successFetchedFromRemote || status == .successUsingPreFetchedData {
        let featureFlag = remoteConfig.configValue(forKey: "enable_new_onboarding").boolValue
        DispatchQueue.main.async {
            // 根据 A/B 实验开关渲染新手指引
            self.updateUI(showNewOnboarding: featureFlag)
        }
    }
}`,
      },
    ],
  },
};

export const deepDiveDomains: DeepDiveDomain[] = [
  {
    id: 'domain_01_basics',
    number: 1,
    titleKey: 'stage.domain_01_basics.title',
    descKey: 'stage.domain_01_basics.goal',
    deepDive: deepDivesData.domain_01_basics,
  },
  {
    id: 'domain_02_arch',
    number: 2,
    titleKey: 'stage.domain_02_arch.title',
    descKey: 'stage.domain_02_arch.goal',
    deepDive: deepDivesData.domain_02_arch,
  },
  {
    id: 'domain_03_perf',
    number: 3,
    titleKey: 'stage.domain_03_perf.title',
    descKey: 'stage.domain_03_perf.goal',
    deepDive: deepDivesData.domain_03_perf,
  },
  {
    id: 'domain_04_media',
    number: 4,
    titleKey: 'stage.domain_04_media.title',
    descKey: 'stage.domain_04_media.goal',
    deepDive: deepDivesData.domain_04_media,
  },
  {
    id: 'domain_05_global',
    number: 5,
    titleKey: 'stage.domain_05_global.title',
    descKey: 'stage.domain_05_global.goal',
    deepDive: deepDivesData.domain_05_global,
  },
];
