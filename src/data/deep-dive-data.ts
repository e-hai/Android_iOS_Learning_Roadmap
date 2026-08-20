import { DeepDiveDomain, PlatformDeepDive } from '../models/types';

export const deepDivesData: Record<string, PlatformDeepDive> = {
  domain_01_basics: {
    android: [
      {
        tag: '并发底层',
        title: 'Kotlin 协程从浅入深：挂起心智模型、CPS 状态机与 Dispatcher 调度器',
        explanation: `### 1. 概念与心智模型（浅）：协程与线程的本质区别
- **协程的本质**：协程（Coroutine = Cooperative Routine 协作式例程）并不是“轻量级线程”，它在 JVM/ART 上本质是**运行在底层线程池之上的用户态计算任务与调度单元**。
- **非阻塞挂起（Non-blocking Suspend）的心智模型**：
  - **传统线程阻塞（Thread.sleep / 同步网络 I/O）**：操作系统强制暂停整个内核线程，该线程无法做任何其他工作，且每个线程常驻占用 1MB+ 内存栈空间，伴随昂贵的内核态 CPU 上下文切换。
  - **协程非阻塞挂起（delay / 挂起网络 I/O）**：当协程遇到挂起点时，**主动交出当前底层的执行线程**（例如主线程），主线程可以立即返回去处理 UI 渲染或触摸事件；底层异步 I/O 完成后，调度器分配一个空闲线程“恢复（Resume）”该协程从挂起点继续向下执行。

### 2. 结构化并发与生命周期（中）：作用域树与异常级联
- **结构化并发（Structured Concurrency）**：协程必须在明确的 \`CoroutineScope\` 中启动，父子协程构成一棵树状 Job 拓扑结构：
  - **完成等待**：父协程的作用域会等待其所有子协程执行完毕后才会真正结束。
  - **取消级联**：父协程调用 \`cancel()\` 时，会自动向下级联取消其所有子协程。
  - **异常隔离选型**：普通 \`Job\` 中任意子协程发生未捕获异常会导致整个作用域取消；而 \`SupervisorJob\`（如 \`viewModelScope\`）会隔离子协程异常，避免兄弟任务互相波及。
- **Android 生命周期绑定**：
  - \`viewModelScope\`：绑定 \`ViewModel.onCleared()\`，页面销毁时自动取消所有异步任务，彻底杜绝内存泄漏与空指针回调。
  - \`repeatOnLifecycle(Lifecycle.State.STARTED)\`：当 Activity/Fragment 退到后台（STOPPED）时自动挂起或取消流收集，进入前台时自动重启，杜绝在后台不可见时浪费 CPU 与电池。

### 3. 编译期底层核心机理（深）：CPS 变换与状态机续体
- **CPS (Continuation-Passing Style) 续体传递转换**：
  - Kotlin 编译器对所有 \`suspend\` 挂起函数进行字节码重写：在参数列表末尾追加一个 \`Continuation<T>\` 续体回调参数（如 \`suspend fun fetch(): String\` 转换为 \`fun fetch(cont: Continuation<String>): Any?\`）。
  - 函数返回值变更为 \`Any?\`：未挂起时直接返回真实数据；若发生真正挂起则返回内部特殊单例标记 \`COROUTINE_SUSPENDED\`。
- **状态机（State Machine）生成机制**：
  - 编译器为挂起函数内部生成一个继承自 \`ContinuationImpl\` 的内部匿名状态机类，维护一个 \`label\` 状态标记（初始为 0）。
  - 函数体内的挂起点将代码切分为若干个逻辑块，编译为一个 \`when(label)\` 或 \`switch(label)\`。
  - 遇到挂起点时更新 \`label\` 并将局部变量保存在状态机字段中；子函数若返回挂起标记，当前函数直接 \`return\` 释放线程栈；异步完成后通过 \`continuation.resumeWith()\` 重新进入状态机并跳转至下一 \`label\` 恢复执行。

### 4. 调度器与线程池底层（深）：Dispatchers 与工作窃取
- **\`Dispatchers.Main\`**：绑定 Android 主线程消息循环，底层通过 \`Handler(Looper.getMainLooper()).post(runnable)\` 将协程恢复包装为 Runnable 投递到主线程 MessageQueue。
- **\`Dispatchers.Default\`**：计算密集型任务调度器，线程池核心线程数等于 CPU 逻辑核心数，基于高性能 **Work-Stealing（工作窃取）算法**，每个 Worker 线程拥有独立的本地任务队列，空闲 Worker 会从其他繁忙 Worker 队列尾部窃取任务，最大化 CPU 吞吐。
- **\`Dispatchers.IO\`**：阻塞 I/O 调度器，共享 \`Dispatchers.Default\` 的底层线程池调度器，最大线程数可弹性扩展至 64 或 CPU 核心数较大值，在线程阻塞时动态创建新线程补充算力。`,
        diagram: `[ Kotlin 协程从浅入深：挂起心智模型、CPS 状态机与调度器全景图解 ]

 1. 【心智模型对比：线程阻塞 vs 协程非阻塞挂起】
    传统线程阻塞模型 (Thread.sleep / 同步 I/O):
    [ Thread-Main ] ──▶ [ I/O 同步阻塞 (500ms) ] ──▶ [ 恢复执行 ]
                         └── 线程被操作系统挂起卡死，无法处理 UI 绘制 ➔ 造成 ANR！

    协程非阻塞挂起模型 (delay / suspend I/O):
    [ Thread-Main ] ──▶ [ 遇到挂起点 ] ──▶ [ Thread-Main 立即释放，继续流畅处理 UI 绘制与触摸 ]
                               │ (底层 epoll / Netty 在后台等待 I/O 事件)
    [ Thread-Worker] ◀───────── [ I/O 完成，调度器分配空闲 Worker 线程调用 resumeWith 恢复协程 ]

 2. 【编译期 CPS 变换与 Continuation 状态机执行流】
    开发者编写的挂起源码:
    suspend fun loadUserData(): UserProfile {
        val token = fetchToken()     // 挂起点 ① (label = 0)
        val info  = fetchInfo(token)  // 挂起点 ② (label = 1)
        return combine(token, info)  // 结束点   (label = 2)
    }

    编译器生成的状态机字节码伪代码:
    fun loadUserData(cont: Continuation<UserProfile>): Any? {
        val sm = cont as? LoadUserDataSM ?: LoadUserDataSM(cont)
        when (sm.label) {
            0 -> {
                sm.label = 1
                val res = fetchToken(sm) // 传入状态机续体
                if (res == COROUTINE_SUSPENDED) return COROUTINE_SUSPENDED // 立即释放线程
                sm.token = res as String
            }
            1 -> {
                sm.label = 2
                val res = fetchInfo(sm.token, sm)
                if (res == COROUTINE_SUSPENDED) return COROUTINE_SUSPENDED // 立即释放线程
                sm.info = res as UserInfo
            }
            2 -> {
                return combine(sm.token, sm.info) // 最终计算并通知上层 Continuation
            }
        }
    }

 3. 【结构化并发作用域与 Job 树异常传播机制】
    viewModelScope (SupervisorJob: 隔离异常)
         │
         ├──▶ 子协程 A (launch: 拉取用户列表) ──▶ [网络超时抛出 SocketTimeoutException]
         │                                              │
         │                                              ▼ (被 SupervisorJob 拦截，不向上扩散)
         └──▶ 子协程 B (async: 加载广告推荐)  ──▶ [正常运行不受任何影响，继续完成渲染]`,
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
    // 当页面进入后台 STOPPED 状态时，自动暂停数据流收集
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
        explanation: `### 1. 概念与心智模型（浅）：async/await 与传统 GCD 的本质差异
- **消除回调地狱与线程爆炸**：传统 GCD (\`DispatchQueue.global().async\`) 在并发请求激增时会无节制地创建内核线程（线程爆炸 Thread Explosion），导致严重的 1MB+ 栈内存浪费与内核 CPU 上下文切换颠簸；
- **非阻塞挂起（Suspension Point）**：\`await\` 标注了潜在的挂起点。当遇到挂起时，当前 Task **主动让出底层的 Worker 线程**，该线程立即被调度器用于执行其他任务；当底层 I/O 完成后，系统自动在协作线程池中恢复 Task 继续执行。

### 2. 结构化并发与 Task 树（中）：生命周期与取消传播
- **Task 树形层次**：使用 \`withTaskGroup\` 或 \`async let\` 启动的子任务与父 Task 构成结构化并发树。
  - **自动等待**：父作用域必定等待所有子 Task 结束或抛出错误。
  - **取消级联传递**：当父 Task 被 cancel 时（例如 SwiftUI View 销毁触发 \`.task\` 取消），所有子 Task 的 \`Task.isCancelled\` 标志位自动置为 true。
- **协同式取消（Cooperative Cancellation）**：Swift Concurrency 不会强制杀掉线程，耗时循环中必须显式调用 \`try Task.checkCancellation()\` 响应取消。

### 3. 数据隔离与 Actor 模型（深）：编译期消除数据竞态
- **Actor 隔离域**：\`actor\` 是专门用于多线程环境的引用类型，保证其内部的可变状态在任意物理时刻严格只能由**单个 Task** 访问。
- **跨隔离域通信**：从外部访问 Actor 的成员必须标注 \`await\`，调用请求被放入 Actor 的串行邮箱队列（Mailbox）中排队执行。
- **\`@MainActor\`**：全局单例 Actor，将类、属性或方法严格绑定到主分发队列（Main RunLoop），专门用于驱动 UI 状态更新。

### 4. 协作式线程池调度器底层（深）：Cooperative Thread Pool
- Swift 运行时维护一个全局的 **协作式线程池（Cooperative Thread Pool）**，其最大线程数量严格受限于设备的 CPU 物理核心数（如 6 核心即最多 6 个并发 Worker 线程）。
- 调度器采用优先级队列（UserInteractive > UserInitiated > Utility > Background），杜绝高并发下的线程无限膨胀。`,
        diagram: `[ Swift Concurrency 从浅入深：async/await、Task 树与 Actor 调度全景图解 ]

 1. 【心智模型对比：GCD 线程爆炸 vs 协作式线程池】
    传统 GCD 并发模型 (DispatchQueue.global.async):
    [ Request 1..100 ] ──▶ 操作系统不断创建新线程 (Thread 1..100) ➔ 导致线程爆炸与严重 CPU 上下文切换！

    Swift Concurrency 协作式模型 (Cooperative Thread Pool):
    [ Task 1..100 ] ──▶ 严格受限于 CPU 核心数的固定线程池 (如 6 个线程)
                          └── Task 在 await 挂起时主动让出底层 Worker 线程，零线程爆炸！

 2. 【结构化并发 Task 树生命周期与取消传播】
    SwiftUI View (.task) ──▶ 创建根 Task (自动随 View 销毁而 cancel)
         │
         ├──▶ withTaskGroup { group in
         │        ├── group.addTask { fetchAvatar() }  ──▶ 自动继承优先级与 Actor 上下文
         │        └── group.addTask { fetchFriends() } ──▶ 页面退出时自动级联取消所有子 Task
         │    }

 3. 【Actor 数据隔离与编译期竞态消除】
    @MainActor ViewModel (主线程隔离域)
         │
         │ (跨隔离域数据交互必须标注 await)
         ▼
    actor DatabaseStore (独立隔离域)
         └── 内部维护私有可变状态，同一时刻严格保证仅有 1 个 Task 访问，编译期彻底杜绝数据竞态 (Data Race)`,
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

        // 并发拉取并自动安全切回主线程
        async let newBalance = store.getBalance()
        // await 挂起点，释放主线程给 UI 渲染
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
