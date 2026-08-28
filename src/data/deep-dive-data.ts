import { DeepDiveDomain, PlatformDeepDive } from '../models/types';

export const deepDivesData: Record<string, PlatformDeepDive> = {
  domain_01_basics: {
    android: [
      {
        tag: '并发底层',
        title: 'Kotlin 协程',
        pipeline: [
          { title: '协程概念', subtitle: 'Conway 1963 · 对称地互相让出控制权', category: 'theory' },
          { title: '续延理论 CPS', subtitle: 'Reynolds · Scheme call/cc', category: 'theory' },
          { title: '无栈实现策略', subtitle: '挂起状态存于堆对象，而非独立调用栈', category: 'theory' },
          { title: 'Continuation 接口 + 状态机', subtitle: 'ContinuationImpl / SuspendLambda', category: 'engineering' },
          { title: 'Completion 链', subtitle: '多个状态机互相引用，替代调用栈', category: 'engineering' },
          { title: 'Job + Dispatcher', subtitle: '协程身份与调度，两条独立的轴', category: 'engineering' },
        ],
        explanation: `### 1. 协程概念（Conway 1963）：对称让出控制权
- **通俗心智**：普通函数是“主从关系”（调用后死等返回，单向压栈）；协程是“对等伙伴”（双方平起平坐，可以随时暂停让出执行权，稍后从暂停处恢复）。
- **工程价值**：避免传统线程阻塞（\`Thread.sleep\` / 同步 I/O）带来的 1MB+ 内存常驻与内核态 CPU 切换损耗。

### 2. 续延理论 CPS（Reynolds / Scheme）：形式化续体
- **通俗心智**：函数不再通过隐式硬件寄存器 \`return\`，而是把“接下来要做的所有剩余计算”打包成一个显式参数——**续体（Continuation）**。
- **编译器改写**：\`suspend fun fetch(): User\` 编译期被重写为 \`fun fetch(cont: Continuation<User>): Any?\`。

### 3. 无栈实现策略（Stackless）：栈帧堆化
- **为什么选无栈？** JVM 虚拟机不允许直接操控底层 CPU 栈指针（无法像 Go 语言那样为每个协程分配独立运行栈）。
- **核心策略**：当协程挂起时，将函数在栈上的局部变量“搬移（Spill）”到堆内存对象中保存，函数立即弹栈退出释放线程；恢复时再从堆对象读回变量。

### 4. Continuation 接口 + 状态机：代码切片分发
- **状态机合成**：编译器为挂起函数生成一个内部类（继承 \`ContinuationImpl\`），内含 \`label\` 状态标记。
- **Switch-Case 切片**：以挂起点切分代码。挂起时返回 \`COROUTINE_SUSPENDED\` 释放线程栈；异步完成后通过 \`resumeWith()\` 推进 \`label\` 恢复执行。

### 5. Completion 链：堆上单向链表替代调用栈
- **通俗心智**：当函数 A 调用挂起函数 B，B 调用挂起函数 C 时，在堆上自动形成 \`C ➔ B ➔ A\` 的 \`completion\` 单向引用链表。
- **堆上调用栈**：最底层的 C 完成后，通过 \`completion.resumeWith()\` 逐层向上回溯唤醒 B 和 A，用堆内存完美复刻了函数调用栈。

### 6. Job + Dispatcher：身份与调度的两条正交轴
- **Job（身份与拓扑树）**：负责管理生命周期、父子协程树取消级联与异常隔离（\`SupervisorJob\` 保护兄弟任务）。
- **Dispatcher（物理调度载体）**：负责把恢复任务分发到具体的线程队列（\`Main\` 绑定主线程 Looper，\`Default\` 运行 CPU 密集型工作窃取线程池，\`IO\` 弹性扩张阻塞线程池）。两者完全正交解耦。`,
        extendedDeepDive: `### 第一层：编译器层（不可见，自动生成）
\`\`\`diagram
suspend 函数
    │ 编译时 CPS 转换
    ▼
Continuation + 状态机（每个挂起点对应一个状态）
\`\`\`

### 第二层：基础接口层（协程的地基）
\`\`\`diagram
Continuation<T>（续体，挂起/恢复的核心）
    ├── val context: CoroutineContext
    └── fun resumeWith(result: Result<T>)

CoroutineContext（上下文容器，存储配置元素）
    └── Element（内部接口，上下文的元素）
            ├── Job（接口）                          ← 协程生命周期
            ├── CoroutineDispatcher（抽象类）        ← 线程调度
            └── CoroutineExceptionHandler（接口）     ← 异常兜底
\`\`\`

### 第三层：Job 实现层（两个独立分支）
\`\`\`diagram
Job（接口）
    │
    ├── CompletableJob（接口）              ← 分支 1：纯句柄，无协程体
    │       └── JobImpl（类）               ← Job() 工厂函数创建
    │               └── SupervisorJobImpl   ← SupervisorJob() 工厂函数创建
    │
    └── AbstractCoroutine<T>（抽象类）      ← 分支 2：真正的协程
            ├── 实现 Job                    ← 生命周期管理
            ├── 实现 Continuation           ← 挂起/恢复
            ├── 实现 CoroutineScope         ← 启动子协程
            │
            ├── StandaloneCoroutine         ← launch 创建
            ├── DeferredCoroutine           ← async 创建
            ├── BlockingCoroutine           ← runBlocking 创建
            └── ScopeCoroutine              ← coroutineScope 创建
                    └── SupervisorCoroutine ← supervisorScope 创建
\`\`\`

### 第四层：构建器层（日常开发使用的 API）
\`\`\`diagram
CoroutineScope（接口，提供运行环境）
    ├── fun launch(...): Job                ← 创建协程
    ├── fun <T> async(...): Deferred<T>     ← 创建协程并返回结果
    └── 扩展函数

挂起函数构建器
    ├── runBlocking { }                     ← 阻塞式，创建 BlockingCoroutine
    ├── coroutineScope { }                  ← 临时作用域，等待所有子协程，创建 ScopeCoroutine
    └── supervisorScope { }                 ← 临时作用域，隔离异常，创建 SupervisorCoroutine

Job 工厂函数
    ├── Job(parent: Job? = null): CompletableJob
    └── SupervisorJob(parent: Job? = null): CompletableJob

调度器
    ├── Dispatchers.Main                    ← Android 主线程
    ├── Dispatchers.IO                      ← IO 线程池
    ├── Dispatchers.Default                 ← CPU 线程池
    └── Dispatchers.Unconfined              ← 不切换线程
\`\`\`

### 第五层：应用层（Android 开发直接使用）
\`\`\`diagram
生命周期感知作用域
    ├── viewModelScope                     ← ViewModel 存活期间
    ├── lifecycleScope                     ← Activity/Fragment 存活期间
    └── rememberCoroutineScope             ← Composable 存活期间

响应式 API
    ├── Flow<T>                            ← 冷流
    ├── StateFlow<T>                       ← 状态流
    ├── SharedFlow<T>                      ← 共享流
    └── Channel<E>                         ← 通道
\`\`\``,
        caseStudy: `### 一、viewModelScope 场景下 Job 与 SupervisorJob 的行为差异

\`viewModelScope\` 内部实际的 Context 是 \`SupervisorJob() + Dispatchers.Main.immediate\`。为了搞清楚这个选择背后的原因，用 \`Job()\` 和 \`SupervisorJob()\` 各写一组对照代码，分两轮实验：先看不装异常处理器时的差异，再看装了 \`CoroutineExceptionHandler\` 之后差异是否还成立。

#### 实验一：不安装 CoroutineExceptionHandler

\`\`\`kotlin
fun testJob() {
    val scope = CoroutineScope(Job() + Dispatchers.Main.immediate)

    scope.launch {
        throw RuntimeException("任务 A 致命错误")
    }

    scope.launch {
        delay(500.milliseconds)
        println("[任务 B] 完成")
    }
}

fun testSupervisorJob() {
    val supervisorScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    supervisorScope.launch {
        throw RuntimeException("任务 A 致命错误")
    }
    supervisorScope.launch {
        delay(500.milliseconds)
        println("[任务 B] 完成")
    }
}
\`\`\`

- **Job() 结果**：控制台只看到 A 的异常堆栈，\`[任务 B] 完成\` **不会被打印**；应用**崩溃**。
- **testSupervisorJob() 结果**：控制台只看到 A 的异常堆栈，\`[任务 B] 完成\` **大概率不会被打印**（协程未杀 B，但因 A 未捕获导致进程崩溃陪葬）；应用**崩溃**。

#### 实验二：安装 CoroutineExceptionHandler

\`\`\`kotlin
fun testJob() {
    val scope = CoroutineScope(Job() + Dispatchers.Main.immediate)

    scope.launch(CoroutineExceptionHandler { _, e ->
        println("[任务 A] handler 捕获: \${e.message}")
    }) {
        throw RuntimeException("任务 A 致命错误")
    }

    scope.launch {
        delay(500.milliseconds)
        println("[任务 B] 完成")
    }
}

fun testSupervisorJob() {
    val supervisorScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    supervisorScope.launch(CoroutineExceptionHandler { _, e ->
        println("[任务 A] handler 捕获: \${e.message}")
    }) {
        throw RuntimeException("任务 A 致命错误")
    }
    supervisorScope.launch {
        delay(500.milliseconds)
        println("[任务 B] 完成")
    }
}
\`\`\`

- **Job() 结果**：控制台看到 A 的异常堆栈，\`[任务 B] 完成\` **不会被打印**；应用**正常**。
- **testSupervisorJob() 结果**：控制台看到 A 的异常堆栈，\`[任务 B] 完成\` **被打印**；应用**正常**。

### 二、协程安全版 runSuspendCatching

\`\`\`kotlin
/**
 * 协程安全版 runCatching：自动放行 CancellationException，保证生命周期正常取消！
 */
inline fun <T> runSuspendCatching(block: () -> T): Result<T> {
    return try {
        Result.success(block())
    } catch (e: CancellationException) {
        throw e // ⚡ 核心：遇到取消异常必须重新抛出，绝不当成业务异常吞掉！
    } catch (e: Throwable) {
        Result.failure(e)
    }
}
\`\`\`

- **为什么要单独封装？**：Kotlin 标准库的 \`runCatching\` 内部无脑捕获了 \`Throwable\`，会把用户退出页面时的正常取消信号（\`CancellationException\`）当成普通业务错误吞掉，导致协程无法及时终止、继续违规刷新已销毁的 UI。

- **重新抛出 CancellationException 为什么不会导致崩溃？**：当你在 \`runSuspendCatching\` 内部 \`throw e\`（重新抛出取消异常）时，这个异常会一路冒泡到 \`launch\` 的最顶层。

让我们看一下 Kotlin 协程底层在顶层收拢异常时的真实源码处理逻辑（精简示意）：

\`\`\`kotlin
// kotlinx.coroutines 官方底层异常分发逻辑
internal fun handleCoroutineException(context: CoroutineContext, exception: Throwable) {
    // ⚡ 协程框架的特权判断：
    if (exception is CancellationException) {
        // 1. 如果是取消异常，直接标记协程为 CANCELLED 正常退出
        // 2. 绝不调用 CoroutineExceptionHandler！
        // 3. 绝不上报给操作系统的 UncaughtExceptionHandler！
        return // 👈 静默安全退出，0 崩溃！
    }
    // 只有非 CancellationException 的真正严重错误，才会去激活 CEH 或触发崩溃
    val handler = context[CoroutineExceptionHandler]
    if (handler != null) {
        handler.handleException(context, exception)
    } else {
        // 没装 CEH，交给 Java 线程默认处理器，App 闪退
        Thread.currentThread().uncaughtExceptionHandler.uncaughtException(...)
    }
}
\`\`\`

也就是说，协程框架在最顶层会对 \`CancellationException\` 进行特殊拦截与静默放行，它是受框架官方保护的！

### 三、顺序执行

\`\`\`kotlin
class ProfileViewModel : ViewModel() {
    private val _uiState = MutableStateFlow("初始状态")
    val uiState: StateFlow<String> = _uiState.asStateFlow()

    fun loadUserData() {
        viewModelScope.launch {
            _uiState.value = "加载中..."
            runSuspendCatching {
                val token = fetchToken()
                fetchUserInfo(token)
            }.onSuccess { user ->
                _uiState.value = "获取成功：$user"
            }.onFailure { error ->
                _uiState.value = "加载失败: \${error.message}"
            }
        }
    }

    private suspend fun fetchToken(): String = withContext(Dispatchers.IO) {
        delay(300.milliseconds)
        "token_888888"
    }

    private suspend fun fetchUserInfo(token: String): String = withContext(Dispatchers.IO) {
        delay(300.milliseconds)
        "用户 [张三]，使用凭据: $token"
    }
}
\`\`\`

### 四、嵌套 launch

\`\`\`kotlin
class OrderViewModel : ViewModel() {
    private val _uiState = MutableStateFlow("初始状态")
    val uiState: StateFlow<String> = _uiState.asStateFlow()

    fun buyProduct(productId: String) {
        viewModelScope.launch {
            _uiState.value = "提交中..."

            launch {
                runSuspendCatching {
                    trackBuyEvent(productId)
                }
            }

            runSuspendCatching {
                payOrder(productId)
            }.onSuccess {
                _uiState.value = "支付成功"
            }.onFailure { error ->
                _uiState.value = "支付失败: \${error.message}"
            }
        }
    }

    private suspend fun payOrder(productId: String) = withContext(Dispatchers.IO) {
        delay(500.milliseconds)
    }

    private suspend fun trackBuyEvent(productId: String) = withContext(Dispatchers.IO) {
        delay(200.milliseconds)
    }
}
\`\`\`

- **场景解释**：用户点击购买时，主流程需要按部就班完成扣款支付，同时在后台异步上报一条购买埋点（旁路任务），主流程无需死等打点完成。旁路子协程内部通过 \`runSuspendCatching\` 就地消化异常，防止打点失败连坐误杀父协程的支付主流程。`,
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
        title: 'Swift 并发',
        pipeline: [
          { title: '协程概念', subtitle: 'Conway 1963 · 协作式让出控制权', category: 'theory' },
          { title: '续延语义 async/await', subtitle: 'Lattner 2021 · 编译期挂起点改写', category: 'theory' },
          { title: '无栈异步栈帧', subtitle: 'Async Frame 分配于堆，释放 Worker 线程', category: 'theory' },
          { title: 'UnsafeContinuation 接口', subtitle: '桥接异步回调与 Swift 协程状态机', category: 'engineering' },
          { title: '结构化 Task 树', subtitle: 'withTaskGroup 级联取消与优先级继承', category: 'engineering' },
          { title: 'Actor + 协作线程池', subtitle: '数据隔离与 CPU 核心数绑定调度', category: 'engineering' },
        ],
        explanation: `### 1. 协程概念（Conway 1963）：协作式让权
- **通俗心智**：消除传统 GCD (\`DispatchQueue.global().async\`) 无节制创建线程导致的“线程爆炸”；协程在遇到 I/O 时主动让出执行线程。

### 2. 续延语义 async/await（Lattner 2021）：挂起点改写
- **通俗心智**：\`await\` 标注了潜在的挂起点。当遇到挂起时，当前 Task 的后续逻辑被封装为续体，底层 Worker 线程立即去执行其他就绪任务。

### 3. 无栈异步栈帧（Async Frame）：堆上生命周期
- **核心策略**：Swift 编译器将跨挂起点的局部变量打包存入堆上的 **Async Frame**，当前线程立即返回；异步 I/O 完成后，调度器分配空闲 Worker 从 Async Frame 恢复执行。

### 4. UnsafeContinuation 接口：桥接异步回调
- **工程实现**：通过 \`withCheckedContinuation\` / \`withUnsafeContinuation\` 将传统 Callback 回调包装为挂起函数，手动调用 \`continuation.resume(returning:)\` 推进状态。

### 5. 结构化 Task 树：生命周期与级联取消
- **Task 树拓扑**：父 Task 自动等待子 Task 结束；父 Task 被取消时（如 SwiftUI \`.task\` 随视图销毁），自动向下广播 \`isCancelled\` 信号。

### 6. Actor + 协作线程池：数据隔离与定额调度
- **Actor 隔离域**：同一时刻严格保证仅 1 个 Task 访问内部可变状态，编译期彻底消除数据竞态；
- **Cooperative Pool**：全局线程池数量严格等于 CPU 物理核心数，杜绝高并发下的线程无限膨胀。`,
        extendedDeepDive: `### 第 1 级：顶层语法与调用边界（Application & API Layer）
- **心智图解：Task 树构建 vs async 挂起步骤**
\`\`\`diagram
 [ SwiftUI 视图 / 主 RunLoop ]
    │
    ├─ 1. Task { ... } ────────▶ 创建根 Task (绑定 @MainActor，主线程不等待立即返回)
    │
    ▼
 [ Task 内部时间线 ]
    │
    ├─ 2. val balance = await store.getBalance() ──▶ 遇到 await 挂起让权 (释放当前 Worker 线程)
    │                                                 
    └─ 3. self.balance = balance ──────────────────▶ 拿到结果切回 @MainActor 驱动 UI 刷新
\`\`\`
- **极简代码流程印证**
\`\`\`swift
// 顶层入口：Task 创建新并发任务实例
Task { @MainActor in
    // 协程内部：await 显式标注挂起点，顺序等待数据返回
    let user = try await api.fetchUser()
    let stats = try await api.fetchStats()
    self.uiState = .success(UserProfile(user: user, stats: stats))
}
\`\`\`

### 第 2 级：编译期 Async Frame 堆化（Compiler & Bytecode Layer）
- **心智图解：异步调用栈帧与挂起点切分**
\`\`\`diagram
 [ 编译器为 async 函数分配堆上的 Async Frame ]
   ├── 局部变量 (user, token) 提升为 Async Frame 堆字段
   ├── 遇到 await 挂起点 ──▶ 将当前续体记录到当前 Task，Worker 线程立即弹栈退出！
   └── 底层 I/O 完成 ──▶ 调度器从 Async Frame 读取局部变量恢复执行
\`\`\`
- **极简代码流程印证（UnsafeContinuation 桥接）**
\`\`\`swift
// 桥接传统 Callback 到 Swift Concurrency
func fetchToken() async -> String {
    await withCheckedContinuation { continuation in
        legacySdk.fetchToken { token in
            continuation.resume(returning: token) // 恢复挂起的 Task
        }
    }
}
\`\`\`

### 第 3 级：结构化 Task 树与生命周期（Structured Concurrency Layer）
- **心智图解：父子 Task 树状拓扑与取消传播**
\`\`\`diagram
 SwiftUI View (.task 根节点)
      │
      ├──▶ withTaskGroup (动态派离子任务)
      │        ├── Task 1: fetchAvatar() ──▶ 继承父级优先级 (UserInitiated)
      │        └── Task 2: fetchFriends() ──▶ 父级销毁时自动广播 isCancelled 取消
      └── 统一在 group 退出前收敛等待全部子任务完成
\`\`\`
- **极简代码流程印证**
\`\`\`swift
// TaskGroup 结构化并发：父 Task 自动等待全部子 Task 结束
await withTaskGroup(of: String.self) { group in
    group.addTask { await fetchPartA() }
    group.addTask { await fetchPartB() }
    for await result in group { process(result) }
}
\`\`\`

### 第 4 级：Actor 数据隔离与协作线程池（Runtime & Threading Layer）
- **心智图解：Mailbox 邮箱串行队列与定额协作线程池**
\`\`\`diagram
 [ Task 1 (Worker-1) ] ──(跨隔离域调用 await)──┐
                                                ▼
 [ Task 2 (Worker-2) ] ──(跨隔离域调用 await)──▶ [ Actor 独立隔离域 (Mailbox 队列) ]
                                                   │
                                                   ▼ (同一物理时刻严格仅 1 个 Task 执行)
                                                [ 访问 private var balance (0 竞态!) ]
 [ 协作线程池 (Cooperative Thread Pool) ] ──▶ 全局 Worker 线程数严格 = CPU 物理核心数 (杜绝线程爆炸)
\`\`\`
- **极简代码流程印证**
\`\`\`swift
actor SafeStore {
    private var balance: Double = 0.0
    // Actor 内部独占访问，编译期彻底消除多线程数据竞态
    func deposit(_ amount: Double) { balance += amount }
}
\`\`\``,
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
