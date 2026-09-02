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

### 三、链式流转

- **场景解释**：第二步查用户依赖第一步的 Token，顺序链式调用；若第一步失败，第二步自动跳过并由 \`runSuspendCatching\` 捕获错误。

\`\`\`kotlin
class ProfileViewModel : ViewModel() {
    fun loadUserData() {
        viewModelScope.launch {
            Log.d("Profile", "开始加载用户数据...")
            runSuspendCatching {
                val token = fetchToken()
                fetchUserInfo(token)
            }.onSuccess { user ->
                Log.d("Profile", "获取成功: $user")
            }.onFailure { error ->
                Log.e("Profile", "加载失败: \${error.message}")
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

### 四、旁路并发

- **场景解释**：主任务专心扣款，顺手丢个子任务去后台打点（不用等它）；打点即使报错自己吞掉，绝不能耽误主任务付钱。

\`\`\`kotlin
class OrderViewModel : ViewModel() {
    fun buyProduct(productId: String) {
        viewModelScope.launch {
            Log.d("Order", "开始提交订单...")

            launch {
                runSuspendCatching { trackBuyEvent(productId) }
            }

            runSuspendCatching {
                payOrder(productId)
            }.onSuccess {
                Log.d("Order", "支付成功")
            }.onFailure { error ->
                Log.e("Order", "支付失败: \${error.message}")
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

### 五、并行聚合

- **场景解释**：详情页要同时拉商品和优惠券，两路互不依赖，但都要返回值再拼成一屏，当作一次整体加载。第四点的内层 \`launch\` 只能拿到 \`Job\`，没有结果可合并，所以改用 \`async\`：先齐发拿到 \`Deferred\`，再统一 \`await\`。

\`\`\`kotlin
class ProductViewModel : ViewModel() {
    fun loadProductDetail(productId: String) {
        viewModelScope.launch {
            Log.d("Product", "开始加载商品与优惠券...")
            val goodsDeferred = async {
                runSuspendCatching { fetchGoods(productId) }
            }
            val couponDeferred = async {
                runSuspendCatching { fetchCoupons(productId) }
            }
            val goods = goodsDeferred.await().getOrElse {
                Log.d("Product", "加载商品失败")
                return@launch
            }
            val coupons = couponDeferred.await().getOrElse {
                Log.d("Product", "加载优惠券失败")
                return@launch
            }
            Log.d("Product", "合并结果: 商品=$goods, 优惠券=$coupons")
        }
    }

    private suspend fun fetchGoods(id: String): String = withContext(Dispatchers.IO) {
        delay(300.milliseconds)
        "iPhone 16"
    }

    private suspend fun fetchCoupons(id: String): String = withContext(Dispatchers.IO) {
        delay(200.milliseconds)
        "满 5000 减 400"
    }
}
\`\`\`

- **使用误区（假并发）**：避免刚 \`async\` 就立马 \`await\`，导致代码退化为串行阻塞。必须**先全部发起 \`async\`，最后再统一 \`await()\`**。

\`\`\`kotlin
// ❌ 错误写法（假并发：刚 async 就立马 await，退化为串行阻塞 500ms）
val goods = async { fetchGoods(productId) }.await()     // ⏳ 等待 300ms 完成后才发下一个
val coupons = async { fetchCoupons(productId) }.await() // ⏳ 再等待 200ms

// ✅ 正确写法（真并发：先同时发起，最后统一 await 合并，总耗时仅需 max(300ms, 200ms) = 300ms）
val goodsDeferred = async { fetchGoods(productId) }
val couponDeferred = async { fetchCoupons(productId) }

val goods = goodsDeferred.await()
val coupons = couponDeferred.await()
\`\`\`

### 六、黑盒并发

- **场景解释**：把第五点的并行从 ViewModel 收成 Repository 的一个挂起函数。\`suspend fun\` 不是 Scope，不能直接 \`async\`，所以用 \`coroutineScope\`：对内全成或全败，对外一次调用。

\`\`\`kotlin
data class ProductDetail(val goods: String, val coupons: String)

class ProductRepository {
    suspend fun getProductDetail(productId: String): ProductDetail = coroutineScope {
        val goodsDeferred = async { fetchGoods(productId) }
        val couponDeferred = async { fetchCoupons(productId) }

        ProductDetail(
            goods = goodsDeferred.await(),
            coupons = couponDeferred.await()
        )
    }

    private suspend fun fetchGoods(id: String): String = withContext(Dispatchers.IO) {
        delay(300.milliseconds)
        "iPhone 16"
    }

    private suspend fun fetchCoupons(id: String): String = withContext(Dispatchers.IO) {
        delay(200.milliseconds)
        "满 5000 减 400"
    }
}

class ProductViewModel(private val repository: ProductRepository) : ViewModel() {
    fun load(productId: String) {
        viewModelScope.launch {
            Log.d("Product", "开始加载商品详情...")
            runSuspendCatching {
                repository.getProductDetail(productId)
            }.onSuccess { detail ->
                Log.d("Product", "加载成功: $detail")
            }.onFailure { error ->
                Log.e("Product", "加载失败: \${error.message}")
            }
        }
    }
}
\`\`\`

- **使用误区**：要保住全成全败，异常必须漏出子 Job，交给 \`coroutineScope\` 抛给调用方。
  1. **不要在 \`async\` 里接异常**：子 Job 会变成成功，兄弟不会取消，仓库对外也像成功返回。
  2. **不要对 \`await\` 接异常**：子 Job 一失败，scope 已经在取消兄弟；catch 住 \`await\` 救不活这段 \`coroutineScope\`，也保不住另一路。

\`\`\`kotlin
// ❌ 在 async 里接住：子 Job 成功，没有熔断
val couponDeferred = async {
    runSuspendCatching { fetchCoupons(productId) }
}

// ❌ 对 await 接住：商品请求已被连坐取消，整段 scope 仍已失败
val coupons = runSuspendCatching { couponDeferred.await() }.getOrNull()

// ✅ 直接抛，让 coroutineScope 交到仓库外面
val goods = goodsDeferred.await()
val coupons = couponDeferred.await()
\`\`\`

### 七、局部容灾

- **场景解释**：优惠券是次要数据，失败应降级为 \`null\`，商品必须继续。第六点在 \`coroutineScope\` 里对 \`await\` 接异常救不了兄弟请求（子失败已经连坐取消）。换成 \`supervisorScope\` 后，子任务失败默认不取消兄弟，但块自己抛仍会整段取消，所以必须在次要路的 **\`couponDeferred.await()\`** 上接住。核心路 \`goodsDeferred.await()\` 仍直接抛，整页失败。

\`\`\`kotlin
data class ProductDetail(val goods: String, val coupons: String?)

class ProductRepository {
    suspend fun getProductDetail(productId: String): ProductDetail = supervisorScope {
        val goodsDeferred = async { fetchGoods(productId) }
        val couponDeferred = async { fetchCoupons(productId) }

        val goods = goodsDeferred.await() // 核心路：直接抛，整页失败
        val coupons = runSuspendCatching { couponDeferred.await() }.getOrNull() // 次要路：只在 await 上接
        ProductDetail(goods, coupons)
    }

    private suspend fun fetchGoods(id: String): String = withContext(Dispatchers.IO) {
        delay(300.milliseconds)
        "iPhone 16"
    }

    private suspend fun fetchCoupons(id: String): String = withContext(Dispatchers.IO) {
        delay(200.milliseconds)
        throw RuntimeException("优惠券接口 500 异常")
    }
}

class ProductViewModel(private val repository: ProductRepository) : ViewModel() {
    fun load(productId: String) {
        viewModelScope.launch {
            Log.d("Product", "开始加载商品详情...")
            runSuspendCatching {
                repository.getProductDetail(productId)
            }.onSuccess { detail ->
                Log.d("Product", "加载成功: $detail")
            }.onFailure { error ->
                Log.e("Product", "加载失败: \${error.message}")
            }
        }
    }
}
\`\`\`

- **使用误区**：不要在 \`async\` 里接异常。子 Job 会变成成功，\`supervisorScope\` 与 \`coroutineScope\` 对这条任务没有区别，监督白开。

\`\`\`kotlin
// ❌ 包进 async：子 Job 成功，两种 Scope 没区别
val couponDeferred = async {
    runSuspendCatching { fetchCoupons(productId) }
}

// ✅ 让 async 直接抛，只在次要路的 await 上接
val couponDeferred = async { fetchCoupons(productId) }
val coupons = runSuspendCatching { couponDeferred.await() }.getOrNull()
\`\`\`

### 八、对照收口

- **场景解释**：第四到七点分别解决旁路、要返回值、全成全败、部分降级。这里把 \`launch\` / \`async\` / \`coroutineScope\` / \`supervisorScope\` 放回同一套判断：子 Job 是否把异常漏出去，以及异常接到哪。

| 你要的 | 用什么 | 异常接到哪 |
|---|---|---|
| 不等结果、别耽误主任务 | 内层 \`launch\` | 写在这条 \`launch\` **体内** |
| 并行且要返回值，失败变成 \`Result\` | \`async\` + \`await\` | 可以接在 \`async\` **体内**；此时 Scope 看不见失败 |
| 并行、全成全败、对外一个 \`suspend\` | \`coroutineScope\` + \`async\` | 两边都不要接，让 scope 抛给调用方 |
| 并行、次要路可失败 | \`supervisorScope\` + \`async\` | 不要接在 \`async\` 里；只接次要路的 \`await\`；核心路继续抛 |

- 这四个看的都是 **lambda 有没有把异常漏出去**，不是 \`Result.success\`。
- 单次 \`suspend\` 调用仍走官方默认：\`launch\` 里 \`try/catch\`（或 \`runSuspendCatching\`）包住仓库调用，不必上 Scope。

- **使用误区**：
  - 用 \`launch\` 去拼返回值：只有 \`Job\`，合并不了，要返回值用 \`async\`。
  - 在 \`coroutineScope\` 里接 \`async\` 或 \`await\`：熔断没了，也救不活兄弟。
  - 开了 \`supervisorScope\` 却在 \`async\` 里接，或次要路裸 \`await\`：监督无效，或块失败又全灭。

### 九、冷流多次值

- **场景解释**：搜索联想会连续出结果，不是算完一次就返回。第八点的 \`launch\` / \`async\` / 两种 Scope 都是一次性 Job，所以改用 \`flow { }\` 多次 \`emit\`。

| 操作符 | 日常干什么 |
|---|---|
| \`map\` / \`filter\` | 变换、丢掉不需要的元素 |
| \`onEach\` | 不改变数据，旁路打日志 / 副作用；再配合 \`collect()\` 让后面的 \`catch\` 能接到消费异常 |
| \`catch\` | 只接它**上游**的失败，可 \`emit\` 降级 |
| \`flowOn\` | 只切换**上游**调度器（如 \`Dispatchers.IO\`） |
| \`debounce\` | 搜索框停一下再发，避免每个字打一次网 |
| \`flatMapLatest\` | 新查询来了就取消上一次请求 |
| \`combine\` | 搜索词 + Tab 等**持续状态**拼成一屏条件 |
| \`stateIn\` | 冷流在 ViewModel 里收成 \`StateFlow\` 给 UI |
| \`collect { }\` / \`collect()\` | 当前协程收到底；无参版给 \`onEach\` 链收尾 |
| \`launchIn\` | 另开协程收集，当前函数不等（\`init\` 里订长流） |

\`\`\`kotlin
class SearchViewModel : ViewModel() {
    private val queryFlow = MutableStateFlow("")
    private val tabFlow = MutableStateFlow("综合")

    val results: StateFlow<List<String>> = combine(queryFlow, tabFlow) { query, tab ->
        query.trim() to tab
    }
        .debounce(300.milliseconds)
        .filter { (query, _) -> query.isNotEmpty() }
        .flatMapLatest { (query, tab) ->
            flow {
                emit(search(query, tab))
            }.flowOn(Dispatchers.IO)
        }
        .map { list -> list.take(20) }
        .catch { error ->
            Log.e("Search", "搜索失败: \${error.message}")
            emit(emptyList())
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = emptyList(),
        )

    init {
        results
            .onEach { list -> Log.d("Search", "结果数: \${list.size}") }
            .launchIn(viewModelScope)
    }

    fun onQuery(text: String) {
        queryFlow.value = text
    }

    private suspend fun search(query: String, tab: String): List<String> {
        delay(200.milliseconds)
        return listOf("\$tab:\$query")
    }
}
\`\`\`

### 十、热流与队列

- **场景解释**：第九点的 \`flow { }\` 是冷的，有人收集才生产，且每个收集者各跑一遍。界面「现在长什么样」用 \`StateFlow<T>\`；多处同时听一件事用 \`SharedFlow<T>\`；导航 / Toast 这类**副作用**不是状态，用 \`Channel<E>\` 排队，只被拿走一次。

| | \`StateFlow<T>\` | \`SharedFlow<T>\` | \`Channel<E>\` |
|---|---|---|---|
| 是什么 | 带当前值的状态 | 广播事件 | 副作用队列 |
| 一条值给谁 | 所有订阅者看同一份最新状态 | 当时所有 collector 各收一份 | 只有一个 receiver 拿走 |
| 有没有「现在」 | 有，必须带初始值 | 默认没有；\`replay > 0\` 才补历史 | 没有当前值，只有还没被拿走的缓冲 |
| 晚到的订阅者 | 立刻拿到最新一条 | \`replay = 0\` 则错过 | 还能拿缓冲里剩下的 |
| 典型 | 整页 UiState、登录态 | 多处同时听「登录成功」 | 导航、Toast、支付结果（UiEffect） |

\`\`\`diagram
                    emit / send
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
   ┌───────────┐  ┌───────────┐  ┌───────────┐
   │ StateFlow │  │SharedFlow │  │  Channel  │
   │  当前状态  │  │   广播     │  │  副作用    │
   └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
    ┌────┴────┐     ┌────┴────┐          │
    ▼         ▼     ▼         ▼          ▼
  订阅者A   订阅者B  订阅者A   订阅者B    唯一消费者
\`\`\`

\`\`\`kotlin
class HomeViewModel : ViewModel() {
    private val _uiState = MutableStateFlow("未登录")
    val uiState: StateFlow<String> = _uiState.asStateFlow()

    private val _loginEvent = MutableSharedFlow<String>(replay = 0)
    val loginEvent: SharedFlow<String> = _loginEvent.asSharedFlow()

    private val _effects = Channel<String>(Channel.BUFFERED)

    fun login() {
        viewModelScope.launch {
            _uiState.value = "已登录"
            _loginEvent.emit("登录成功")
            _effects.send("去首页")
        }
    }

    init {
        uiState
            .onEach { state -> Log.d("Home", "状态: \${state}") }
            .launchIn(viewModelScope)
        loginEvent
            .onEach { event -> Log.d("Home", "广播: \${event}") }
            .launchIn(viewModelScope)
        _effects.receiveAsFlow()
            .onEach { effect -> Log.d("Home", "副作用: \${effect}") }
            .launchIn(viewModelScope)
    }
}
\`\`\`
`,
      },
      {
        tag: '声明式 UI',
        title: 'Jetpack Compose',
        pipeline: [
          { title: '界面状态', subtitle: 'remember / ViewModel；读到的 State 驱动重组', category: 'engineering' },
          { title: '副作用', subtitle: 'LaunchedEffect / DisposableEffect 对齐组合寿命', category: 'engineering' },
          { title: '生命周期', subtitle: '组合在树上 ≠ Activity RESUMED', category: 'engineering' },
          { title: 'Lazy 列表', subtitle: '只组合可见项；用稳定 key 保住行状态', category: 'engineering' },
          { title: '动画', subtitle: '动画打在 State 上，不要 delay 循环赋值', category: 'engineering' },
          { title: '指针事件', subtitle: 'clickable / pointerInput；修饰顺序决定谁先吃', category: 'engineering' },
          { title: '自定义绘制', subtitle: 'drawBehind / Canvas / Layout 拆开职责', category: 'engineering' },
          { title: 'AndroidView', subtitle: 'factory 建一次，update 里同步 Compose 状态', category: 'engineering' },
        ],
        explanation: `### 1. 界面状态
- **通俗心智**：\`@Composable\` 会被反复调用，局部变量每次都是新的。要跨重组保住的值，放进 \`remember\` / \`mutableStateOf\`；一屏业务状态放 ViewModel 的 \`StateFlow\`。
- **订阅规则**：组合时读到的 \`State\` 会把当前组合登记为观察者，值变了只重跑这些组合。没读到的不会重组。
- **提升**：多个子组件要共用同一份数，状态放到它们共同的父组合，通过参数往下传、事件往上抛。

### 2. 副作用
- **通俗心智**：函数体只描述「现在 UI 长什么样」。网络、监听、弹窗、写磁盘会在重组时被跑多次，必须放进 Effect。
- **LaunchedEffect(key)**：进入组合时启动协程，离开或 key 变化时取消再开。
- **DisposableEffect(key)**：需要成对的注册/注销（监听器、回调）时用 \`onDispose\`。

### 3. 生命周期
- **何时回调**：三个 API 跟当前页 Entry 的 \`onStart\` / \`onResume\` / \`onPause\` / \`onStop\`。A→B 时 Activity 仍 \`RESUMED\`，A 的 Entry 会 pause/stop；按 Home 才走 Activity 自己的 pause/stop，当前页跟着掉。

### 4. Lazy 列表
- **通俗心智**：\`Column { items.forEach { Row() } }\` 会把所有行都组合进去。\`LazyColumn\` 只组合可见窗口附近的项。
- **key**：同一行滑出再滑入，要靠稳定 \`key\` 把 \`remember\` 和滚动位置对回这一行，不能靠列表下标。

### 5. 动画
- **通俗心智**：目标值放进 State，用 \`animate*AsState\` / \`Animatable\` / \`AnimatedVisibility\` 让框架按帧插值。不要自己 \`delay\` + 改 State 冒充动画。

### 6. 指针事件
- **点击**：\`Modifier.clickable\` / \`Button(onClick)\`。需要拖、双击、长按再用 \`pointerInput { detectTapGestures / detectDragGestures }\`。
- **修饰顺序**：先写的 Modifier 更靠外；\`clickable\` 和 \`pointerInput\` 叠在一起时，谁先消费由顺序和 \`awaitPointerEventScope\` 的消费策略决定。

### 7. 自定义绘制
- **画**：已有节点上叠加用 \`Modifier.drawBehind\` / \`drawWithContent\`；独立画布用 \`Canvas { }\`。
- **量与摆**：自定义排布用 \`Layout { measurables, constraints -> }\` 或 \`Modifier.layout\`。绘制里不要做分配很重的对象。

### 8. AndroidView
- **用途**：地图、WebView、只有 View SDK 的控件。\`factory\` 里创建一次，\`update\` 里用当前 Compose 状态改 View。
- **列表**：\`Lazy\` 的 item 里塞 \`AndroidView\` 会按行持有真 View，只在没有 Compose 替代时用。`,
        caseStudy: `### 一、页面状态：remember 与提升

- **场景解释**：普通 \`var\` 重组即丢。\`remember\` 抗同槽重组（动画进度、瞬时偏移）；\`rememberSaveable\` 再扛转屏（输入框文字）。离开组合两者都丢；业务数据走 ViewModel。

\`\`\`kotlin
@Composable
fun CounterCard() {
    var count by remember { mutableStateOf(0) }
    Column {
        Text("点击次数: \$count")
        Button(onClick = { count++ }) { Text("加一") }
    }
}

@Composable
fun SearchBar(query: String, onQueryChange: (String) -> Unit) {
    TextField(value = query, onValueChange = onQueryChange)
}

@Composable
fun SearchScreen() {
    var query by rememberSaveable { mutableStateOf("") }
    SearchBar(query = query, onQueryChange = { query = it })
}
\`\`\`

多个子组件共用同一份数时，把状态放到父组合再往下传（\`SearchBar\` 自己不再 \`remember\` 一份）。

### 二、副作用：进页拉数、离开注销

- **场景解释**：\`@Composable\` 会反复执行，请求 / 监听不能写在函数体里。\`LaunchedEffect\` 与 \`DisposableEffect\` 都对齐 **组合进出**（离开树或 key 变 → 旧的结束、新的再来）；A→B→A 会重新进树，两者都会再跑。
- **怎么选**：能挂起、取消即停 → \`LaunchedEffect\`（详情按 id 拉数、会话 / 行情 \`collect\`、搜索防抖）。必须成对 add/remove → \`DisposableEffect\`（定位回调、返回键、传感器、三方 \`setListener\`）。
- **边界**：点按钮才请求 → ViewModel / \`rememberCoroutineScope\`。这个页面实例只做一次（首包、首次进入打点）→ ViewModel \`init\`。用户看见了 / 停留曝光 → 生命周期，不是这两种。

\`\`\`kotlin
@Composable
fun UserDetail(userId: String, repo: UserRepo) {
    var user by remember { mutableStateOf<User?>(null) }

    LaunchedEffect(userId) {
        user = repo.fetch(userId)
    }

    DisposableEffect(userId) {
        val listener = repo.observe(userId) { user = it }
        onDispose { repo.remove(listener) }
    }

    Text(user?.name ?: "加载中")
}
\`\`\`

\`userId\` 变了会取消旧协程、拆掉旧监听，再按新 id 来一遍。

### 三、生命周期：可见时才收集

#### collectAsStateWithLifecycle

- **场景解释**：信息流 / 详情的 \`StateFlow\` 要画在界面上。A→全屏 B 或按 Home：Owner 落到 \`STARTED\` 以下，停收；返回 A 或回到前台：\`onStart\` 后再收。默认跟 \`onStart\`/\`onStop\`；必须真正在前台才收时加 \`minActiveState = RESUMED\`（跟 \`onResume\`/\`onPause\`）。

\`\`\`kotlin
class FeedViewModel : ViewModel() {
    val items: StateFlow<List<FeedItem>> = repository.observeFeed()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())
}

@Composable
fun FeedRoute(vm: FeedViewModel = viewModel()) {
    val items by vm.items.collectAsStateWithLifecycle()
    FeedList(items)
}
\`\`\`

#### LifecycleStartEffect

- **场景解释**：页面还看得见就要干（轻量连接、可见时轮询），不必等完全在前台。A→全屏 B 或 Activity \`onStop\`：\`onStopOrDispose\` 停。Dialog 盖在 A 上时 A 往往仍 \`STARTED\`，这段还在跑。

\`\`\`kotlin
@Composable
fun InboxBadge(repo: InboxRepo) {
    LifecycleStartEffect(Unit) {
        val job = repo.startUnreadSync()
        onStopOrDispose { job.cancel() }
    }
}
\`\`\`

#### LifecycleResumeEffect

- **场景解释**：必须在前台：定位、相机、停留曝光。A→全屏 B（Activity 仍 \`RESUMED\`，A 的 Entry \`onPause\`）或 Activity 自己 \`onPause\`，都会 \`onPauseOrDispose\`；返回 A 或 Activity \`onResume\` 再开。Dialog 盖住时也会 \`onPause\`，定位应停。

\`\`\`kotlin
@Composable
fun MapRoute(vm: MapViewModel = viewModel()) {
    LifecycleResumeEffect(Unit) {
        vm.onVisible()
        onPauseOrDispose { vm.onHidden() }
    }
    MapScreen()
}
\`\`\`

### 四、列表：LazyColumn 与稳定 key

- **场景解释**：\`Column { list.forEach { Item(it) } }\` 会把所有行都组合进去，长列表卡顿。改用 \`LazyColumn\` 后，若不用稳定 \`key\`，滑出再滑入会把行内 \`remember\` 对错人。

\`\`\`kotlin
@Composable
fun FeedList(items: List<FeedItem>) {
    LazyColumn {
        items(items, key = { it.id }) { item ->
            FeedRow(item)
        }
    }
}

@Composable
fun FeedRow(item: FeedItem) {
    var expanded by remember { mutableStateOf(false) }
    Text(
        text = if (expanded) item.body else item.title,
        modifier = Modifier.clickable { expanded = !expanded },
    )
}
\`\`\`

\`key = { it.id }\` 让「展开」跟着这一条数据走，而不是跟着槽位下标走。

### 五、动画：目标值交给动画 API

- **场景解释**：列表和状态会瞬间切换。用 \`delay\` 循环改 State 会每帧重组。动画 API 按帧插值，打断时也对着新目标走。

\`\`\`kotlin
@Composable
fun FavoriteIcon(selected: Boolean) {
    val scale by animateFloatAsState(if (selected) 1.2f else 1f, label = "fav")
    Icon(
        imageVector = Icons.Filled.Favorite,
        contentDescription = null,
        modifier = Modifier.graphicsLayer { scaleX = scale; scaleY = scale },
    )
}

@Composable
fun Panel(open: Boolean) {
    AnimatedVisibility(visible = open) {
        Text("面板内容")
    }
}
\`\`\`

连续手势拖动再用 \`Animatable\` + \`pointerInput\` 里 \`snapTo\` / \`animateTo\`。

### 六、事件：点击与手势

- **场景解释**：动画和点击只要 \`clickable\` 就够。拖动、长按、自己决定谁消费事件时，要用 \`pointerInput\`。

\`\`\`kotlin
@Composable
fun CardActions(onOpen: () -> Unit, onOffset: (Float) -> Unit) {
    Box(
        Modifier
            .clickable(onClick = onOpen)
            .pointerInput(Unit) {
                detectHorizontalDragGestures { _, dragAmount ->
                    onOffset(dragAmount)
                }
            },
    ) {
        Text("左右拖，点按打开")
    }
}
\`\`\`

需要嵌套滚动（列表在 BottomSheet 里）时，用系统自带的 nested scroll，而不是自己在 \`pointerInput\` 里把 delta 吃光。

### 七、自定义绘制：画与布局分开

- **场景解释**：手势能拿到位移了，系统组件画不出进度环、刻度。在已有组件上叠加用 draw Modifier；完全自己量孩子用 \`Layout\`。

\`\`\`kotlin
@Composable
fun ProgressRing(progress: Float, modifier: Modifier = Modifier) {
    Canvas(modifier.size(48.dp)) {
        drawArc(
            color = Color.Gray,
            startAngle = -90f,
            sweepAngle = 360f * progress,
            useCenter = false,
            style = Stroke(width = 4.dp.toPx()),
        )
    }
}

@Composable
fun HorizontalSplit(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit,
) {
    Layout(content, modifier) { measurables, constraints ->
        val half = constraints.maxWidth / 2
        val placeables = measurables.map {
            it.measure(constraints.copy(minWidth = half, maxWidth = half))
        }
        layout(constraints.maxWidth, placeables.maxOf { it.height }) {
            var x = 0
            placeables.forEach {
                it.placeRelative(x, 0)
                x += half
            }
        }
    }
}
\`\`\`

### 八、AndroidView：包一层传统控件

- **场景解释**：绘制和 Lazy 解决不了 WebView、地图这类只有 View SDK 的控件。用 \`AndroidView\` 嵌进去，但不要每次重组都 \`factory\` 里 new。

\`\`\`kotlin
@Composable
fun WebPane(url: String, modifier: Modifier = Modifier) {
    AndroidView(
        modifier = modifier,
        factory = { context ->
            WebView(context).apply {
                settings.javaScriptEnabled = true
            }
        },
        update = { web ->
            if (web.url != url) web.loadUrl(url)
        },
    )
}
\`\`\`

Compose 状态当唯一数据源，只在 \`update\` 里写 View。Activity 的 \`onResume\`/\`onPause\`（地图）仍要在宿主里自己调。`,
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
        tag: '内存模型',
        title: '可达性、引用类型与泄漏排查',
        pipeline: [
          { title: 'GC Roots 与可达性', subtitle: '从根出发能碰到的对象才算活着', category: 'theory' },
          { title: '四种引用', subtitle: '强 / 软 / 弱 / 虚，泄漏几乎总是强引用', category: 'theory' },
          { title: 'ART 何时回收', subtitle: '分代堆上不可达对象才会被清掉', category: 'engineering' },
          { title: '常见泄漏形态', subtitle: '单例、回调、Handler 抓住短命对象', category: 'engineering' },
          { title: 'LeakCanary 探测', subtitle: '销毁后弱引用仍未入队即疑似泄漏', category: 'engineering' },
          { title: '读链与拆链', subtitle: '沿最短强引用链找到该松开的那一环', category: 'engineering' },
        ],
        explanation: `### 1. GC Roots 与可达性
- **通俗心智**：垃圾回收不问「你还想不想要」，只问「从根出发还能不能摸到你」。摸不到的对象才是垃圾。
- **常见根**：线程栈上的局部变量、静态字段、JNI 全局引用等。Activity 被静态字段抓住，对 GC 来说它仍然可达。

### 2. 四种引用
- **强引用**：普通 \`val a = obj\`，可达则不会因内存压力被回收。泄漏几乎都是短命对象被更长命的强引用抓住。
- **软引用** \`SoftReference\`：内存还宽裕时尽量留着，紧张时可以收掉，适合图片等缓存。
- **弱引用** \`WeakReference\`：不阻止回收，GC 后 \`get()\` 可能为 \`null\`。LeakCanary 用它盯销毁后的页面。
- **虚引用** \`PhantomReference\`：不能通过 \`get()\` 取回对象，只在回收后入 \`ReferenceQueue\`，用来做堆外 / 原生资源清理。业务页面泄漏很少直接用它。

### 3. ART 何时回收
- **分代直觉**：新对象多在年轻代，活得久的晋升到老年代；不可达对象在一次 GC 后被清掉。
- **不必死记算法名**：日常排查先确认「谁还握着强引用」，再考虑 GC 参数与版本差异。

### 4. 常见泄漏形态
- **单例 / 伴生对象** 持有 \`Activity\` / \`View\` / \`Context\`。
- **Listener / 回调** 注册后未按生命周期注销。
- **静态 \`Handler\` / 匿名内部类** 隐式持有外部 \`Activity\`，消息还在队列里时页面已销毁。

### 5. LeakCanary 探测
- **流程**：页面 \`onDestroy\` 后用弱引用盯住对象 → 等一段时间并触发 GC → 若弱引用仍未进入 \`ReferenceQueue\`，则导出 Hprof，算最短强引用链。
- **结论**：它证明的是「销毁后仍可达」，并指出链路上每一环，而不是替你改代码。

### 6. 读链与拆链
- **读链**：从 GC Root 走到泄漏对象，每一跳都是一个字段或集合元素。
- **拆链**：松开不该跨生命周期的那一环——\`null\` 掉引用、注销回调、改用 \`ApplicationContext\`、或让短命对象只被短命持有者引用。`,
        extendedDeepDive: `### 第一层：可达性判定
\`\`\`diagram
GC Roots（静态字段 / 栈帧 / JNI…）
    │ 强引用边
    ▼
可达对象图 ──▶ 存活
摸不到的对象 ──▶ 可被回收
\`\`\`

### 第二层：四种引用
\`\`\`diagram
强引用 Strong ──▶ 可达则保留（泄漏主因）
软引用 Soft   ──▶ 内存紧时才收（缓存）
弱引用 Weak   ──▶ 不阻止回收，get() 可能为 null
虚引用 Phantom ──▶ get() 恒为 null，回收后入队做清理
\`\`\`

### 第三层：LeakCanary 探测时序
\`\`\`diagram
Activity.onDestroy
    │
    ▼
KeyedWeakReference(activity) + ReferenceQueue
    │
    ▼
延迟一段时间 + 请求 GC
    │
    ├─ 弱引用已入队 ──▶ 对象已被回收，无泄漏
    └─ 仍未入队 ──▶ 导出 Hprof，解析最短强引用链
\`\`\``,
        caseStudy: `### 一、伴生对象抓住 Activity

- **场景解释**：工具类用伴生对象缓存「当前页面」，方便全局弹 Toast。页面销毁后静态字段仍握着 \`Activity\`，旋转或反复进出后旧页面无法回收。

\`\`\`kotlin
class LeakActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        CurrentPage.activity = this
        Log.d("Leak", "已把 Activity 交给伴生对象")
    }

    override fun onDestroy() {
        // 忘记 CurrentPage.activity = null
        super.onDestroy()
        Log.d("Leak", "onDestroy，但静态字段可能仍握着 this")
    }
}

object CurrentPage {
    var activity: Activity? = null
}
\`\`\`

\`\`\`kotlin
// ✅ 销毁时松开；或根本不要缓存 Activity，改传 ApplicationContext
override fun onDestroy() {
    if (CurrentPage.activity === this) {
        CurrentPage.activity = null
    }
    super.onDestroy()
}
\`\`\`

### 二、Listener 注册后未注销

- **场景解释**：仓库是长生命周期单例，\`addListener\` 把页面回调放进列表。页面销毁后列表里仍有该回调，回调若捕获了页面，页面就泄漏。

\`\`\`kotlin
object LocationRepo {
    private val listeners = mutableListOf<(String) -> Unit>()

    fun addListener(listener: (String) -> Unit) {
        listeners += listener
    }

    fun removeListener(listener: (String) -> Unit) {
        listeners -= listener
    }
}

class MapActivity : AppCompatActivity() {
    private val onLocation: (String) -> Unit = { loc ->
        Log.d("Leak", "页面还在收位置: \${loc}")
    }

    override fun onStart() {
        super.onStart()
        LocationRepo.addListener(onLocation)
    }

    override fun onStop() {
        // ❌ 若漏掉 remove，单例继续握着 onLocation → 握着 Activity
        LocationRepo.removeListener(onLocation)
        super.onStop()
    }
}
\`\`\`

### 三、读 LeakCanary 最短链并拆掉

- **场景解释**：报告给出从 GC Root 到 \`LeakActivity\` 的最短强引用链。要拆的是链上「跨生命周期」的那一环，而不是在业务里手动调 GC。

\`\`\`diagram
GcRoot: CurrentPage 的静态字段 activity
    │
    ▼
LeakActivity instance
\`\`\`

- 链上是 \`CurrentPage.activity\` → 在 \`onDestroy\` 置 \`null\`，或改为不持有 \`Activity\`。
- 链上是 \`LocationRepo.listeners\` → 在 \`onStop\` / \`onDestroy\` 对称 \`removeListener\`。
- 链上是 \`Handler\` / \`Message.obj\` → 销毁时 \`removeCallbacksAndMessages(null)\`，或使用静态 \`Handler\` + 弱引用（并确认消息里不再强引用页面）。
`,
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
