import { DeepDiveDomain, PlatformDeepDive } from '../models/types';

export const deepDivesData: Record<string, PlatformDeepDive> = {
  domain_01_basics: {
    android: [
      {
        tag: '现代语言',
        title: 'Kotlin 核心特性：委托、扩展与内联具现化',
        sectionTitles: {
          explanation: '这一章只回答三个问题',
          diagram: '一图速查：怎么写 ➔ 什么时候用',
          diagramCaption: '五大特性用法速查图',
          stepper: '逐个看用法（交互式速查卡）',
          caseStudy: '核心实战与用法指南',
        },
        explanation: `这五个特性都是**为了少写样板、让调用点更干净**而存在的语法工具。本章只关注三件事：**是什么**（一句话定义）、**为什么用**（替你省掉什么麻烦）、**怎么用**（最小写法与适用场景），不涉及编译器与字节码层面的实现原理。

拿不准该用哪个时，先看下面的速查图对号入座，再翻对应的速查卡。`,
        stepper: [
          {
            title: '委托 by',
            tag: '少写样板',
            desc: '**是什么**：用 `by` 把属性的读写、或整个接口的实现，交给另一个对象去完成。',
            diagram: `// 1. 用现成的委托：用到时才初始化，之后缓存复用
val database by lazy { DatabaseHelper() }

// 2. 自己写一个：多个属性共用同一套读写逻辑（只需提供 getValue / setValue）
class Prefs(sp: SharedPreferences) {
    var token: String by StringPref(sp, "token")
    var userId: String by StringPref(sp, "user_id")
}

// 3. 类委托：想增强一个集合，但只关心其中两个方法
class TrackedList<T>(private val inner: MutableList<T>) : MutableList<T> by inner {
    override fun add(element: T): Boolean {
        report(element)                 // 只写你要拦截的
        return inner.add(element)
    }
}                                       // 其余方法自动交给 inner，一行都不用写`,
            stateSnapshot: {
              '为什么用': '省掉重复的 get / set 样板，逻辑收在一处',
              '怎么用': '属性：val / var x by 委托对象；类：: 接口 by 内部实例',
              '常见场景': 'by lazy · by viewModels() · SharedPreferences 读写',
            },
          },
          {
            title: '扩展 fun / val',
            tag: '补 API',
            desc: '**是什么**：不改源码、不写子类，直接给现成的类补上你想要的方法或属性。',
            diagram: `// 1. 扩展函数：语义化控制显隐，不用到处写 VISIBLE / GONE
fun View.visibleOrGone(visible: Boolean) {
    visibility = if (visible) View.VISIBLE else View.GONE
}

// 2. 扩展函数：把冗长构造包成一行
fun Context.toast(message: CharSequence) {
    Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
}

// 3. 扩展属性：必须自己写 get()，不能带初始值
val Context.screenWidth: Int
    get() = resources.displayMetrics.widthPixels

// 调用起来和类自带的 API 没有区别：
loginButton.visibleOrGone(user.isLoggedIn)
context.toast("屏幕宽 \${context.screenWidth}px")`,
            stateSnapshot: {
              '为什么用': '取代 XxxUtils 静态工具类，调用点更自然',
              '怎么用': 'fun 类型.方法名() / val 类型.属性名 get() = ...',
              '注意': '与已有同名成员方法冲突时成员优先；扩展属性必须写 get()',
            },
          },
          {
            title: '带接收者 Lambda',
            tag: '写 DSL',
            desc: '**是什么**：参数写成 `T.() -> Unit`，花括号里就能直接以那个对象为 `this` 写代码。',
            diagram: `// 1. 定义一个配置类
class HttpClientConfig {
    var baseUrl: String = ""
    var timeoutMs: Long = 3000
    fun header(key: String, value: String) { /* ... */ }
}

// 2. 关键就是这个参数类型：HttpClientConfig.() -> Unit
fun setupHttpClient(block: HttpClientConfig.() -> Unit): HttpClientConfig {
    val config = HttpClientConfig()
    config.block()
    return config
}

// 3. 调用处：花括号里的 this 就是 config，属性名直接写，不用前缀
val client = setupHttpClient {
    baseUrl = "https://api.example.com"
    timeoutMs = 5000
    header("Authorization", "Bearer token_xyz")
}`,
            stateSnapshot: {
              '为什么用': '配置类 API 写起来像 DSL，省掉一堆 config. 前缀',
              '怎么用': '参数声明为 T.() -> Unit，函数体内调用 实例.block()',
              '常见场景': 'apply · buildString · Gradle KTS · Compose 组件树',
            },
          },
          {
            title: 'inline 家族',
            tag: '省开销',
            desc: '**是什么**：给「参数是 Lambda」的函数加的性能修饰；`noinline` 与 `crossinline` 是它的两条补充规则。',
            diagram: `// 1. inline：高频调用的小工具函数，加上它更省
inline fun <T> measureDuration(tag: String, block: () -> T): T {
    val start = System.currentTimeMillis()
    val result = block()
    Log.d(tag, "耗时: \${System.currentTimeMillis() - start} ms")
    return result
}

// 2. 两条补充规则，按 Lambda 的用法二选一
inline fun runAsyncTask(
    noinline onLog: () -> Unit,        // 要把它当对象存起来 / 传给别人 ──▶ noinline
    crossinline onExecute: () -> Unit  // 它会异步、跨线程执行     ──▶ crossinline
) {
    Handler(Looper.getMainLooper()).post(onLog)
    Thread { onExecute() }.start()
}

// 用法：
val user = measureDuration("loadUser") { repository.loadUser() }`,
            stateSnapshot: {
              '为什么用': '高阶函数被高频调用时减少额外开销',
              '怎么用': '函数体小、调用点多时加 inline；大函数别加',
              '两条规则': 'Lambda 要存起来 ──▶ noinline；会异步执行 ──▶ crossinline',
            },
          },
          {
            title: 'reified',
            tag: '认出 T',
            desc: '**是什么**：加在 `inline` 函数的泛型上，让函数体里能把 `T` 当成真实类型用（`T::class.java`、`is T`）。',
            diagram: `// 1. 页面跳转：调用处再也不用写 DetailActivity::class.java
inline fun <reified T : Activity> Context.startActivity(block: Intent.() -> Unit = {}) {
    val intent = Intent(this, T::class.java)
    intent.block()
    startActivity(intent)
}

context.startActivity<DetailActivity> {
    putExtra("order_id", "20260903")
}

// 2. 从混合集合里挑出某种类型
inline fun <reified T> List<Any>.firstInstanceOrNull(): T? {
    for (item in this) if (item is T) return item
    return null
}

// ⚠️ reified 只能写在 inline 函数上，单独用会编译失败`,
            stateSnapshot: {
              '为什么用': '免去到处传 Class 参数，调用点更干净',
              '怎么用': '固定搭配写成 inline fun <reified T> ...',
              '常见场景': 'startActivity<T>() · filterIsInstance<T>() · fromJson<T>()',
            },
          },
        ],
        diagram: `   每组左边是怎么写，右边是什么时候用它。

   ① 委托 by ── 把重复的读写逻辑交给别人做
      val db by lazy { DatabaseHelper() } ──▶  重量级对象，首次用到才初始化
      var token: String by StringPref(sp) ──▶  多个属性共用同一套读写逻辑
      class L : MutableList<T> by inner   ──▶  只想改集合的几个方法，其余照转
      by viewModels() / by autoCleared()  ──▶  Android 里现成好用的委托

   ② 扩展 fun / val ── 给现成的类补上你想要的 API
      fun View.visibleOrGone(visible)     ──▶  取代 ViewUtils 这类静态工具类
      fun Context.toast(msg)              ──▶  把冗长的构造调用包成一行
      val Context.screenWidth get() = ... ──▶  常用计算值做成属性（必须写 get()）
      注意：和类里已有的同名成员方法冲突时，成员优先，扩展不会覆盖它

   ③ 带接收者 Lambda ── 让配置代码写起来像 DSL
      fun setup(block: Config.() -> Unit) ──▶  自己写配置式 API
      setup { baseUrl = "..." }           ──▶  调用处省掉所有 config. 前缀
      apply / buildString / Gradle KTS    ──▶  你早就在用的同一套写法

   ④ inline 家族 ── 高频调用的高阶函数用它更省
      inline fun measure(block: () -> T)  ──▶  小函数 + 调用点多，减少额外开销
      noinline block                      ──▶  这个 Lambda 要存起来、传给别人
      crossinline block                   ──▶  这个 Lambda 会异步 / 跨线程执行
      注意：函数体很大的函数别加 inline，调用点多了反而变胖

   ⑤ reified ── 让泛型 T 在函数体里能被认出来
      inline fun <reified T> ...          ──▶  reified 必须和 inline 一起写
      startActivity<DetailActivity>()     ──▶  页面跳转免写 ::class.java
      list.filterIsInstance<T>()          ──▶  从混合集合里挑出某种类型
      gson.fromJson<T>(json)              ──▶  泛型 JSON 解析`,
        caseStudy: `### 一、委托：属性委托与类委托（状态托管与无样板装饰器）

> **一句话**：把属性的读写、或整个接口的实现交给另一个对象去做，省掉重复样板。最常用的是现成委托 \`by lazy\` 与 \`by viewModels()\`。

- **1. 属性委托（Property Delegation）演进三步曲**：
  - **核心本质**：通过 \`by delegate\` 将属性的 \`get()\` 和 \`set()\` 转发给托管对象，省去重复的样板代码。其演进与使用分为清晰的三步：
  - **第一步：官方开箱即用（\`by lazy\` 延迟加载）**：
    - 最经典的日常用法。默认采用 \`LazyThreadSafetyMode.SYNCHRONIZED\` 双重检查锁（DCL），仅在首次被访问时才执行代码块并缓存结果，非常适合重量级实例（数据库/网络客户端）的按需初始化：

\`\`\`kotlin
// ⚡ 第一步：官方开箱即用，首次访问才初始化，线程安全单例
val databaseHelper: DatabaseHelper by lazy(LazyThreadSafetyMode.SYNCHRONIZED) {
    DatabaseHelper().apply { initTables() }
}
\`\`\`

  - **第二步：自己写一个委托（不需要实现任何接口）**：
    - 任何普通类只要提供约定名称的 \`operator\` 函数就能直接当委托用：\`getValue\`（读）、\`setValue\`（写，只读属性不需要）；
    - 函数名是固定的，不能自己改；参数签名照抄下面的写法即可；

\`\`\`kotlin
// ⚡ 第二步：不实现任何接口的普通类，函数名必须是 getValue / setValue
class CustomStringDelegate {
    private var internalText = "默认值"

    operator fun getValue(thisRef: Any?, property: KProperty<*>): String = internalText
    operator fun setValue(thisRef: Any?, property: KProperty<*>, value: String) {
        println("属性 \${property.name} 变更为: \$value")
        internalText = value
    }
}

// 业务直接使用：
var myName: String by CustomStringDelegate()
\`\`\`

  - **第三步：官方辅助工具接口（\`ReadOnlyProperty\` 与 \`ReadWriteProperty\`）**：
    - 既然不强制实现接口，官方为何提供这两个接口？它们是**选修的开发提效工具**：① 免手写很长的参数签名（IDE 自动补全）；② 提供泛型安全约束，方便结合生命周期打造工业级工具：

\`\`\`kotlin
// ⚡ 第三步：基于官方 ReadWriteProperty 接口封装生命周期感知委托，离开页面自动置空防泄漏
class AutoClearedValue<T : Any>(fragment: Fragment) : ReadWriteProperty<Fragment, T> {
    private var value: T? = null
    init {
        fragment.viewLifecycleOwnerLiveData.observe(fragment) { owner ->
            owner?.lifecycle?.addObserver(object : DefaultLifecycleObserver {
                override fun onDestroy(owner: LifecycleOwner) {
                    value = null // ⚡ onDestroyView 时自动将引用置空，彻底杜绝 ViewBinding 内存泄漏
                }
            })
        }
    }
    override fun getValue(thisRef: Fragment, property: KProperty<*>): T =
        value ?: throw IllegalStateException("不能在 onDestroyView 之后访问 Binding")

    // ⚡ 必须是 override 的三参签名，才能被 var ... by 识别为可写委托
    override fun setValue(thisRef: Fragment, property: KProperty<*>, value: T) {
        this.value = value
    }
}

// 声明用法：一行代码搞定 Fragment 内存安全
// private var binding: FragmentHomeBinding by autoCleared()
\`\`\`

- **2. 类委托（Class Delegation）**：
  - **为什么用**：想给一个既有类型加点行为时，继承受限于单继承又容易破坏封装；自己写装饰器则要手写几十个只做转发的空方法。用 \`class Xxx : Interface by inner\` 就不用写这些转发方法了，是"组合优于继承"最省事的落地方式。
  - **怎么用**：把内部实例声明为 \`by\` 的对象，只覆写你要拦截增强的成员，其余全部自动交给它。

\`\`\`kotlin
// ⚡ 只覆写要拦截的方法，其余数十个集合方法自动交给 inner，一行都不用写
class TrackedList<T>(
    private val inner: MutableList<T>
) : MutableList<T> by inner {

    override fun add(element: T): Boolean {
        Log.d("TrackedList", "数据埋点上报：新增元素 \$element")
        return inner.add(element)
    }

    override fun removeAt(index: Int): T {
        Log.d("TrackedList", "数据埋点上报：移除索引 \$index")
        return inner.removeAt(index)
    }
}
\`\`\`

### 二、扩展函数与属性：对既有类的非侵入式能力装配

> **一句话**：不改源码给现成的类补上你要的 API，取代 \`XxxUtils\` 静态工具类；注意与同名成员方法冲突时成员优先。

- **为什么用**：不用再写 \`ViewUtils.setVisibility(view, ...)\` 这种别扭的工具类。在不改源码、不继承子类的前提下，就能给 Android 原生控件或第三方类型补上贴合业务语义的方法与计算属性，调用起来和自带 API 一样自然。
- **高频场景与工程实战**：
  1. 常用视图显隐切换扩展；
  2. 上下文极简 Toast；
  3. 屏幕宽高计算属性。

\`\`\`kotlin
// 1. 扩展函数：语义化控制 View 显隐，消除到处手写的 View.VISIBLE / View.GONE
fun View.visibleOrGone(visible: Boolean) {
    visibility = if (visible) View.VISIBLE else View.GONE
}

// 2. 扩展函数：Context 极简提示，免去 Toast.makeText 冗长构造
fun Context.toast(message: CharSequence) {
    Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
}

// 3. 扩展计算属性：随手获取屏幕像素宽度（注意：必须提供 get()，无幕后字段）
val Context.screenWidth: Int
    get() = resources.displayMetrics.widthPixels

// 业务调用体验：清爽直观
// loginButton.visibleOrGone(user.isLoggedIn)
// context.toast("操作成功，当前屏幕宽: \${context.screenWidth}px")
\`\`\`

- **使用时的三条约束**（写之前先记住，避免踩坑）：
  1. **成员优先**：若目标类中已有同名同参的成员方法，调用时永远走成员方法，扩展不会覆盖它；
  2. **扩展属性必须写 \`get()\`**：它没有存储空间，不能带初始值，只能是计算属性；
  3. **只能访问公开成员**：扩展写在类外部，拿不到目标类的 \`private\` / \`protected\` 内容。

### 三、带接收者的 Lambda：打造类型安全的流畅领域 DSL

> **一句话**：参数写成 \`T.() -> Unit\`，调用处的花括号里就能直接写属性名、省掉对象前缀，配置式 API 都靠它。

- **为什么用**：参数写成普通闭包 \`() -> Unit\` 时，调用者在花括号里访问配置对象必须处处带前缀；写成 \`T.() -> Unit\` 后，花括号里的 \`this\` 就是那个对象，属性名、方法名都能直接写。Compose 的组件树、Gradle 脚本、\`apply\` / \`buildString\` 用的都是这个写法。
- **怎么用**：下面用一个网络客户端配置器演示完整三步。

\`\`\`kotlin
// 1. 领域配置实体
class HttpClientConfig {
    var baseUrl: String = ""
    var timeoutMs: Long = 3000
    private val headers = mutableMapOf<String, String>()

    fun header(key: String, value: String) {
        headers[key] = value
    }
}

// 2. 核心语法：入参为 block: HttpClientConfig.() -> Unit
fun setupHttpClient(block: HttpClientConfig.() -> Unit): HttpClientConfig {
    val config = HttpClientConfig()
    config.block() // ⚡ 在 config 作用域内执行用户代码，此时闭包内部的 this 就是 config
    return config
}

// 3. 业务调用：极简、无冗余前缀的声明式 DSL 风格
val client = setupHttpClient {
    baseUrl = "https://api.example.com"
    timeoutMs = 5000
    header("Authorization", "Bearer token_xyz")
    header("Accept", "application/json")
}
\`\`\`

### 四、内联函数生态：inline / noinline / crossinline 的性能优化与安全避坑

> **一句话**：高频调用的高阶函数加 \`inline\` 更省开销；Lambda 要存起来就标 \`noinline\`，会异步执行就标 \`crossinline\`。

- **为什么用**：参数是 Lambda 的函数被高频调用时会产生额外开销，给函数加上 \`inline\` 就能省掉这部分开销，适合体积小、调用点多的工具函数。
- **两条补充规则（怎么选）**：
  - \`noinline\`：这个 Lambda 需要被**保存下来或传给别人**（例如交给 \`Handler.post\`），就给它加 \`noinline\`；
  - \`crossinline\`：这个 Lambda 会在**子线程、协程或异步回调里执行**，就给它加 \`crossinline\`——否则调用方在 Lambda 里直接写 \`return\` 会引发崩溃。
- **工程实战**：高频执行耗时监控工具，与跨线程异步安全调度。

\`\`\`kotlin
// 1. inline 消除高阶闭包分配开销（耗时性能打点）
inline fun <T> measureDuration(tag: String, block: () -> T): T {
    val start = System.currentTimeMillis()
    val result = block()
    Log.d(tag, "执行耗时: \${System.currentTimeMillis() - start} ms")
    return result
}

// 2. 会异步执行的 Lambda 标 crossinline；要当对象传给别人的标 noinline
inline fun runAsyncTask(
    noinline onLog: () -> Unit,       // 不需要内联，作为对象引用传给 Handler
    crossinline onExecute: () -> Unit // 跨线程执行，使用 crossinline 限制闭包不能在此直接 return 逃逸
) {
    Handler(Looper.getMainLooper()).post(onLog)
    Thread {
        onExecute() // ⚡ 安全在子线程中跑完自身闭包
    }.start()
}
\`\`\`

### 五、reified：让泛型 T 在函数体里能被认出来

> **一句话**：让泛型 \`T\` 在函数体里能被认出来（可写 \`T::class.java\`、\`is T\`），固定搭配 \`inline\` 使用。

- **为什么用**：普通泛型函数的函数体里写不了 \`T::class.java\` 与 \`item is T\`，只能额外传一个 \`Class<T>\` 参数；把泛型标成 \`reified\`（必须同时是 \`inline\` 函数）之后，这两种写法都可以直接用，调用点也不必再传 Class。
- **工程实战**：页面极简跳转语法糖，以及异构数据集合安全类型过滤。

\`\`\`kotlin
// 1. 页面跳转免传 TargetActivity::class.java 冗长语法
inline fun <reified T : Activity> Context.startActivity(block: Intent.() -> Unit = {}) {
    val intent = Intent(this, T::class.java) // ⚡ 运行时精准获取真实 Class 对象
    intent.block()
    startActivity(intent)
}

// 业务调用：优雅干净
// context.startActivity<DetailActivity> {
//     putExtra("order_id", "20260903")
// }

// 2. 异构集合安全类型过滤与提取
inline fun <reified T> List<Any>.findFirstInstance(): T? {
    for (item in this) {
        if (item is T) { // ⚡ 运行时精准执行 is 类型判定
            return item
        }
    }
    return null
}
\`\`\``,
      },
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
- **核心机制**：普通函数是“主从关系”（调用后死等返回，单向压栈）；协程是“对等伙伴”（双方平起平坐，可以随时暂停让出执行权，稍后从暂停处恢复）。
- **工程价值**：避免传统线程阻塞（\`Thread.sleep\` / 同步 I/O）带来的 1MB+ 内存常驻与内核态 CPU 切换损耗。

### 2. 续延理论 CPS（Reynolds / Scheme）：形式化续体
- **核心机制**：函数不再通过隐式硬件寄存器 \`return\`，而是把“接下来要做的所有剩余计算”打包成一个显式参数——**续体（Continuation）**。
- **编译器改写**：\`suspend fun fetch(): User\` 编译期被重写为 \`fun fetch(cont: Continuation<User>): Any?\`。

### 3. 无栈实现策略（Stackless）：栈帧堆化
- **为什么选无栈？** JVM 虚拟机不允许直接操控底层 CPU 栈指针（无法像 Go 语言那样为每个协程分配独立运行栈）。
- **核心策略**：当协程挂起时，将函数在栈上的局部变量“搬移（Spill）”到堆内存对象中保存，函数立即弹栈退出释放线程；恢复时再从堆对象读回变量。

### 4. Continuation 接口 + 状态机：代码切片分发
- **状态机合成**：编译器为挂起函数生成一个内部类（继承 \`ContinuationImpl\`），内含 \`label\` 状态标记。
- **Switch-Case 切片**：以挂起点切分代码。挂起时返回 \`COROUTINE_SUSPENDED\` 释放线程栈；异步完成后通过 \`resumeWith()\` 推进 \`label\` 恢复执行。

### 5. Completion 链：堆上单向链表替代调用栈
- **核心机制**：当函数 A 调用挂起函数 B，B 调用挂起函数 C 时，在堆上自动形成 \`C ➔ B ➔ A\` 的 \`completion\` 单向引用链表。
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
        metaphor: {
          title: '纯函数视图映射与插槽表记忆',
          formula: 'UI = f(State) + SlotTable.GapBuffer',
          metaphorDesc: 'Compose 彻底摒弃了传统昂贵的命令式 View 树。Composable 函数每一次被执行，都是在平铺的插槽表（Slot Table）中存取参数与状态缓存。状态是自变量，UI 是因变量，状态变化时框架通过快照系统自动计算最小重组范围。',
        },

        caseStudy: `### 一、状态提升：单一数据源与深层事件流转

- **场景解释**：普通局部变量重组即丢；组件私有状态难以被外部联动控制。通过**状态提升（State Hoisting）**，将状态收拢到父级或 ViewModel 的 \`StateFlow\`，子组件降级为无状态（Stateless）纯展示组件，遵循声明式 UI 核心宪法：**「状态向下传递（数据参数），事件向上传递（Lambda 回调）」**。

\`\`\`kotlin
@Composable
fun CounterScreen(viewModel: CounterViewModel = viewModel()) {
    // 1. 顶层收集唯一数据源
    val count by viewModel.count.collectAsStateWithLifecycle()

    // 2. 状态向下流 (count)，事件向上抛 (onIncrement)
    CounterCard(
        count = count,
        onIncrement = { viewModel.increment() }
    )
}

// ⚡ 纯粹的无状态组件（复用性极高，易于单测与 Preview）
@Composable
fun CounterCard(
    count: Int,
    onIncrement: () -> Unit
) {
    Log.d("Compose", "CounterCard 重组: count=\$count")
    Column {
        Text("当前计数: \$count")
        Button(onClick = onIncrement) {
            Text("增加计数")
        }
    }
}
\`\`\`

#### 深层嵌套场景与两大解法对比

- **深层痛点**：当页面嵌套极深（\`页面 ➔ 垂直流 ➔ 横向列表 ➔ 卡片 ➔ 按钮\`）时，若每层都手动声明并逐层透传 \`onClick\`，会导致严重的回调地狱（Callback Drilling）。为此业界演进出两大经典方案：

##### 方案 ①：FeedAction 统一事件流（⭐ 80% 业务首选）

\`\`\`kotlin
// 1. 密封接口收拢整模块交互
sealed interface FeedAction {
    data class Like(val itemId: String) : FeedAction
    data class Bookmark(val itemId: String) : FeedAction
}

// 2. 中间所有层级：只占一个参数位，透明向下透传 onAction
@Composable
fun SectionList(
    items: List<ProductItem>,
    onAction: (FeedAction) -> Unit
) {
    LazyRow {
        items(items) { item ->
            LeafItemCard(item = item, onAction = onAction)
        }
    }
}

// 3. 最深层子组件：只有一个通道，无脑发 Action（显式契约，完美支持 Preview）
@Composable
fun LeafItemCard(
    item: ProductItem,
    onAction: (FeedAction) -> Unit
) {
    Row {
        Button(onClick = { onAction(FeedAction.Like(item.id)) }) {
            Text("点赞")
        }
        Button(onClick = { onAction(FeedAction.Bookmark(item.id)) }) {
            Text("收藏")
        }
    }
}
\`\`\`

##### 方案 ②：CompositionLocal 穿透（超深层级 / 全局基建）

\`\`\`kotlin
// 1. 定义局部事件穿透器（提供默认空实现，方便 Preview 预览）
val LocalFeedActionHandler = staticCompositionLocalOf<(FeedAction) -> Unit> {
    { /* 默认空操作 */ }
}

// 2. 根页面：通过 Provider 向整棵子树下发事件调度器
@Composable
fun FeedScreen(viewModel: FeedViewModel = viewModel()) {
    CompositionLocalProvider(LocalFeedActionHandler provides viewModel::dispatch) {
        // ⚡ 中间所有层级彻底解放，参数列表干净，无需逐层透传 lambda
        DeepVerticalFeedList()
    }
}

// 3. 最深处的叶子节点：隔空穿透获取调度器
@Composable
fun DeepProductCard(itemId: String) {
    val onAction = LocalFeedActionHandler.current

    Button(onClick = { onAction(FeedAction.Like(itemId)) }) {
        Text("隔空直连 ViewModel")
    }
}
\`\`\`

### 二、衍生状态：derivedStateOf 终结滚动重组风暴

- **场景解释**：列表滑动时像素索引每几像素都会频繁改变。若直接在重组阶段计算布尔值，会导致组件在整个滑动过程中每秒疯狂重组 60~120 次。
- **核心机制**：使用 \`derivedStateOf\` 建立衍生计算缓存，将**高频滚动的像素索引**收敛为**低频翻转的布尔状态**，只有布尔值真正发生状态翻转时，才触发下游重组！

\`\`\`kotlin
@Composable
fun ScrollTopBar(listState: LazyListState) {
    // ⚡ 核心避坑：将高频滚动的像素索引，收敛为低频翻转的布尔状态
    val showScrollToTop by remember {
        derivedStateOf {
            listState.firstVisibleItemIndex > 0
        }
    }

    Log.d("Compose", "ScrollTopBar 重组, showScrollToTop=\$showScrollToTop")

    if (showScrollToTop) {
        FloatingActionButton(onClick = { /* 滚动到顶部 */ }) {
            Text("Top")
        }
    }
}
\`\`\`

### 三、稳定性避坑：不可变契约与 @Immutable 拯救重组

- **核心陷阱**：Kotlin 标准库 \`List<T>\` 属于接口，Compose 编译器悲观判定其为 **Unstable（不稳定）**，导致子组件入参即使完全未变，也无法享受跳过重组。
- **破局关键**：在数据类上标注 \`@Immutable\`（或使用 \`PersistentList\`），向编译器立下绝对不可变契约，即可恢复 **Smart Recomposition（智能跳过）** 能力！

\`\`\`kotlin
// ❌ 陷阱：直接使用标准 List 会被判定为 Unstable，导致 UserListCard 每次被动重组
// data class UserGroup(val name: String, val users: List<String>)

// ✅ 破局：显式标注 @Immutable，向 Compose 编译器立下“绝对不可变”契约
@Immutable
data class UserGroup(
    val name: String,
    val users: List<String>
)

@Composable
fun UserGroupScreen(group: UserGroup) {
    Log.d("Compose", "UserGroupScreen 根重组")
    UserListCard(group = group)
}

@Composable
fun UserListCard(group: UserGroup) {
    // ⚡ 命中 Smart Recomposition：当 group 引用或 equals 未变时，此 Log 绝不会重复触发！
    Log.d("Compose", "UserListCard 重组: \${group.name}")
    Text("分组名称: \${group.name}, 成员数: \${group.users.size}")
}
\`\`\`

### 四、副作用边界：LaunchedEffect 与 DisposableEffect

- **核心使命**：副作用安全隔离仓。解决 Composable 函数因反复执行而导致的网络请求重发、数据死循环或监听重复注册。
- **生命周期契约**：
  1. **启动 / 重启**：初次渲染进入界面、或绑定的 \`key\` 发生变化时执行（若有未完成的旧任务，先清理旧任务再启动新任务）；
  2. **跳过**：界面重组时，只要 \`key\` 保持不变，直接跳过不执行；
  3. **释放 / 取消**：组件从界面移除（销毁）时触发（\`LaunchedEffect\` 自动取消协程，\`DisposableEffect\` 执行 \`onDispose\`）。
- **选型与避坑**：
  1. **选型标准**：异步挂起任务选 \`LaunchedEffect\`；成对借还的资源（注册/注销）选 \`DisposableEffect\`；
  2. **高频避坑**：页面跳转返回（A ➔ B ➔ A）会经历组件的销毁与重建，Effect 会重新执行；全生命周期只执行一次的初始化，应放在 \`ViewModel.init\` 中。

\`\`\`kotlin
@Composable
fun UserProfileRoute(userId: String, repository: UserRepository) {
    // ⚡ 1. 异步副作用：进树/Key变拉取；离树(切页)协程自动 Cancel；重组不重复执行
    LaunchedEffect(userId) {
        Log.d("Compose", "LaunchedEffect 启动: 加载用户 \$userId")
        repository.loadUser(userId)
    }

    // ⚡ 2. 资源配对：进树注册；离树(切页)触发 onDispose 安全注销
    DisposableEffect(userId) {
        Log.d("Compose", "DisposableEffect: 注册 \$userId 监听")
        val listener = repository.registerUserListener(userId) { data ->
            Log.d("Compose", "收到推送: \$data")
        }

        onDispose {
            Log.d("Compose", "onDispose: 离开组合树，安全注销 \$userId 监听")
            repository.unregisterUserListener(listener)
        }
    }
}
\`\`\`

### 五、生命周期：可见才收集与前台独占

- **场景解释**：组合在树上不等于页面在前台。按 Home 切后台或全屏跳转时，组合树仍常驻内存，若盲目跑任务会空耗 CPU 与电量。三大官方生命周期 API 各司其职，精准对齐 \`LocalLifecycleOwner\`（当前导航页的 \`NavBackStackEntry\`）：
  1. \`collectAsStateWithLifecycle\`：Flow 转界面状态，低于 \`STARTED\` 自动停止收集省电；
  2. \`LifecycleStartEffect\`：**可见即可**（轻量轮询/未读数同步），跟 \`onStart / onStop\`，有 Dialog 盖在上面时仍在运行；
  3. \`LifecycleResumeEffect\`：**必须在前台**（高精度定位/相机/停留曝光），跟 \`onResume / onPause\`，有 Dialog 盖在上面失焦时立即暂停。

\`\`\`kotlin
@Composable
fun OrderTrackingRoute(
    orderId: String,
    viewModel: OrderViewModel = viewModel()
) {
    // ⚡ 1. 界面状态：低于 STARTED 停止收集 Flow，回到前台自动恢复
    val orderStatus by viewModel.orderStatus.collectAsStateWithLifecycle()

    // ⚡ 2. 可见即可（跟 onStart / onStop）：
    // • 只要页面看得见就跑（轻量未读数/订单状态长轮询）
    // • 即使上方盖了半透明 Dialog，依然保持 STARTED 活跃！
    // • 只有全屏跳转或退后台（onStop）时，才触发 onStopOrDispose 停止
    LifecycleStartEffect(orderId) {
        Log.d("Lifecycle", "进入 STARTED (可见): 启动订单轻量轮询")
        val pollingJob = viewModel.startOrderPolling(orderId)

        onStopOrDispose {
            Log.d("Lifecycle", "离开 STARTED (不可见): 停止订单轮询")
            pollingJob.cancel()
        }
    }

    // ⚡ 3. 必须在前台（跟 onResume / onPause）：
    // • 强前台独占业务（骑手高精定位、相机预览、停留曝光）
    // • 一旦有 Dialog 弹窗遮挡导致失焦（onPause），立刻停止以极致省电！
    LifecycleResumeEffect(orderId) {
        Log.d("Lifecycle", "进入 RESUMED (前台获焦): 开启高精定位")
        viewModel.startHighAccuracyLocation()

        onPauseOrDispose {
            Log.d("Lifecycle", "离开 RESUMED (失焦/遮挡): 暂停高精定位")
            viewModel.stopLocation()
        }
    }

    Text("订单状态: \$orderStatus")
}
\`\`\`

### 六、高性能列表：LazyColumn 稳定 key 的复用防串位

- **场景解释**：\`LazyColumn\` 只渲染可视区域。若未指定稳定 \`key\`，Compose 默认按**位置索引**复用状态——增删项时，新项的数据虽然更新了，但旧项残留的 \`remember\` 状态（展开、勾选等）仍被原地继承，产生“张冠李戴”的严重串位。
- **底层机制**：指定 \`key = { it.id }\` 后，数据被删时其对应的 UI 节点与内部 \`remember\` 状态会被**一同连根销毁（Dispose）**，后续项各自携带独立状态位移，数据与状态永远精准对齐。

\`\`\`kotlin
data class MessageItem(val id: String, val text: String)

@Composable
fun MessageFeed(messages: List<MessageItem>) {
    LazyColumn {
        // ⚡ 核心避坑：必须绑定全局唯一稳定 key，严禁使用 index 索引！
        items(
            items = messages,
            key = { item -> item.id }
        ) { item ->
            MessageRow(
                item = item,
                modifier = Modifier.animateItem() // 配合 key 自动获得丝滑位移与淡出动画
            )
        }
    }
}

@Composable
fun MessageRow(item: MessageItem, modifier: Modifier = Modifier) {
    var isExpanded by remember { mutableStateOf(false) }

    Log.d("Compose", "MessageRow 绘制: \${item.id}, isExpanded=\$isExpanded")

    Column(
        modifier = modifier
            .fillMaxWidth()
            .clickable { isExpanded = !isExpanded }
    ) {
        Text("消息: \${item.text}")
        if (isExpanded) {
            Text("详情: 展开完整消息内容...", color = Color.Gray)
        }
    }
}
\`\`\`

### 七、手势与嵌套滚动：PointerInput 传递链与 NestedScroll 冲突解决

- **场景解释**：Compose 摒弃了传统 View 繁琐的 \`dispatchTouchEvent\` / \`onInterceptTouchEvent\`。通过 \`pointerInput\` 的三阶段传递（\`Initial\` 优先拦截 ➔ \`Main\` 正常消费 ➔ \`Final\` 兜底结果），配合 \`Modifier.nestedScroll\` 解决内外层滑动冲突（如可折叠吸顶标题、横向轮播与纵向列表手势争夺）。
- **嵌套滚动核心机制**：
  1. \`onPreScroll\`：父级抢在子列表滑动**前**预先消费（如：向上滑时父级优先收起折叠 Header，Header 收拢后剩余距离才交由子列表滚动）；
  2. \`onPostScroll\`：子列表滚到边界**后**父级消费剩余距离（如：列表滚到底部后触发外层的弹性阻尼或加载更多）。
- **多指操作与防冲突**：双指缩放/平移使用高层 \`detectTransformGestures\`，配合 \`graphicsLayer\` 走 GPU 硬件变换（零重组、零重新测量）；在图片放大状态下拦截手势消费，防止误滑外层列表。

\`\`\`kotlin
// 1. 嵌套滚动：父级抢先消费 (PreScroll) 实现折叠 Header
@Composable
fun CollapsibleHeaderList() {
    val headerHeightPx = with(LocalDensity.current) { 200.dp.toPx() }
    var headerOffsetPx by remember { mutableFloatStateOf(0f) }

    // ⚡ 核心机制：定义嵌套滑动连接器，处理父子协同与冲突
    val nestedScrollConnection = remember {
        object : NestedScrollConnection {
            override fun onPreScroll(available: Offset, source: NestedScrollSource): Offset {
                // 向上滑 (delta < 0)：父组件优先吃掉滑动距离，折叠 Header
                val delta = available.y
                val newOffset = headerOffsetPx + delta
                val consumedY = newOffset.coerceIn(-headerHeightPx, 0f) - headerOffsetPx
                headerOffsetPx += consumedY
                Log.d("NestedScroll", "onPreScroll 父级消费: \$consumedY, 剩余给子列表: \${available.y - consumedY}")
                return Offset(0f, consumedY) // 返回父级已消费的偏移量
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .nestedScroll(nestedScrollConnection)
    ) {
        // 子列表正常滚动，剩余未被父级消费的距离由 LazyColumn 消化
        LazyColumn(contentPadding = PaddingValues(top = 200.dp)) {
            items(50) { index ->
                Text("列表项 #\$index", modifier = Modifier.padding(16.dp))
            }
        }

        // Header 随 headerOffsetPx 平移折叠
        TopHeader(
            modifier = Modifier
                .height(200.dp)
                .offset { IntOffset(x = 0, y = headerOffsetPx.roundToInt()) }
        )
    }
}

// 2. 多指操作：双指缩放/平移（配合 graphicsLayer 走 GPU 变换，零重组、零重测）
@Composable
fun ZoomableBox() {
    var scale by remember { mutableFloatStateOf(1f) }
    var offset by remember { mutableStateOf(Offset.Zero) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
                translationX = offset.x
                translationY = offset.y
            }
            .pointerInput(Unit) {
                // ⚡ 官方多指检测器：自动计算双指中心点、缩放倍率与平移向量
                detectTransformGestures { _, pan, zoom, _ ->
                    scale = (scale * zoom).coerceIn(1f, 5f)
                    offset += pan
                }
            }
    )
}
\`\`\`

### 八、自定义组件：Canvas 免重组重绘与 Layout 测量管线

- **场景解释**：传统自定义 View 需重写 \`onMeasure\` / \`onLayout\` / \`onDraw\`。在 Compose 中，轻量图形绘制使用 \`Canvas\` / \`drawBehind\`；复杂的规则排版使用自定义 \`Layout\`。
- **免重组重绘（60/120fps 性能神技）**：在 \`Canvas\` 或 \`graphicsLayer\` 内部直接读取手势状态时，Compose **只会触发 Draw（重绘）阶段，完全跳过 Recomposition（重组）与 Layout（测量布局）阶段**，实现极致丝滑的高频动画！

\`\`\`kotlin
// 1. 归一化槽位定义：0f~1f 相对坐标系（确保手机预览与 4K 导出分辨率 1:1 等比复用）
data class WallpaperSlot(val left: Float, val top: Float, val width: Float, val height: Float)

enum class DiyTemplate(val slots: List<WallpaperSlot>) {
    // 经典拍立得/主副图模版：上方 1 张海报主图，下方 2 张细节图
    Poster(listOf(
        WallpaperSlot(0.0f, 0.00f, 1.0f, 0.62f),
        WallpaperSlot(0.0f, 0.62f, 0.5f, 0.38f),
        WallpaperSlot(0.5f, 0.62f, 0.5f, 0.38f)
    )),
    // 电影台词胶片条：纵向三等分
    FilmStrip(listOf(
        WallpaperSlot(0f, 0.000f, 1f, 0.333f),
        WallpaperSlot(0f, 0.333f, 1f, 0.333f),
        WallpaperSlot(0f, 0.666f, 1f, 0.334f)
    ))
}

// 2. 自定义 DIY 壁纸测量管线（单次测量，切换模版与间隙时零重新加载）
@Composable
fun DiyWallpaperCollage(
    template: DiyTemplate,
    gap: Dp = 4.dp,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    Layout(
        content = content,
        modifier = modifier.aspectRatio(9f / 16f) // 锁定手机壁纸黄金画幅
    ) { measurables, constraints ->
        val totalW = constraints.maxWidth
        val totalH = constraints.maxHeight
        val gapPx = gap.roundToPx()

        // ⚡ 单次测量管线：依据模版比例，毫秒级为各槽位派发固定像素约束
        val placeables = measurables.mapIndexed { index, measurable ->
            val slot = template.slots.getOrNull(index) ?: WallpaperSlot(0f, 0f, 1f, 1f)
            val w = (totalW * slot.width).toInt() - gapPx
            val h = (totalH * slot.height).toInt() - gapPx
            measurable.measure(Constraints.fixed(w.coerceAtLeast(0), h.coerceAtLeast(0)))
        }

        // ⚡ 精准定位摆放
        layout(totalW, totalH) {
            placeables.forEachIndexed { index, placeable ->
                val slot = template.slots.getOrNull(index) ?: return@forEachIndexed
                val x = (totalW * slot.left).toInt() + gapPx / 2
                val y = (totalH * slot.top).toInt() + gapPx / 2
                placeable.placeRelative(x, y)
            }
        }
    }
}

// 3. 单槽位独立交互与裁切（双指缩放/平移，手势在 draw 阶段硬件加速，绝不触发全屏重组）
@Composable
fun WallpaperSlotImage(bitmap: ImageBitmap) {
    var scale by remember { mutableFloatStateOf(1f) }
    var offset by remember { mutableStateOf(Offset.Zero) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .clipToBounds() // 裁切在各自格子里
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
                translationX = offset.x
                translationY = offset.y
            }
            .pointerInput(Unit) {
                detectTransformGestures { _, pan, zoom, _ ->
                    scale = (scale * zoom).coerceIn(1f, 4f)
                    offset += pan
                }
            }
    ) {
        Image(bitmap = bitmap, contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
    }
}
\`\`\`

### 九、新旧混编互操作：AndroidView 生命周期与资源防泄漏

- **场景解释**：现实项目中不可避免要嵌入原生复杂控件（如高德/Google 地图 \`MapView\`、\`WebView\`、ExoPlayer \`PlayerView\`）。
- **核心规约**：
  1. \`factory\`：仅在**初次进树**执行一次，用于创建原生 View 实例；
  2. \`update\`：状态更新导致重组时反复调用，负责将 Compose 最新状态同步赋给原生 View；
  3. \`onRelease\`：**离开组合树时触发**，在此必须安全注销与销毁底层重资源（如 \`player.release()\`），彻底杜绝内存泄漏！

\`\`\`kotlin
@Composable
fun NativeVideoPlayer(
    videoUrl: String,
    isPlaying: Boolean,
    modifier: Modifier = Modifier
) {
    AndroidView(
        modifier = modifier,
        // ⚡ 1. 创建工厂：仅在进树初次执行一次，创建原生 View 并初始化资源
        factory = { ctx ->
            Log.d("AndroidView", "factory: 创建原生 PlayerView")
            CustomVideoView(ctx).apply {
                initPlayer()
            }
        },
        // ⚡ 2. 状态更新通道：外部状态 (videoUrl/isPlaying) 变动时触发，同步原生控件
        update = { playerView ->
            Log.d("AndroidView", "update: 同步状态 isPlaying=\$isPlaying")
            if (isPlaying) playerView.play(videoUrl) else playerView.pause()
        },
        // ⚡ 3. 释放通道：离开组合树时自动回调，必须彻底释放原生内核资源，防止内存泄漏！
        onRelease = { playerView ->
            Log.d("AndroidView", "onRelease: 离开组合树，释放播放器内核")
            playerView.releasePlayer()
        }
    )
}
\`\`\`

### 十、现代类型安全路由：Navigation 3 (1.2.0-alpha06 最新演进规范)

- **版本定位**：基于官方最新发布的 \`androidx.navigation3:1.2.0-alpha06\`，彻底摒弃旧版 Navigation 2.x 的字符串路径拼接（\`"detail/{id}"\`）与沉重黑盒 \`NavController\`，转向**纯数据驱动（State as SSOT）**与**声明式场景投影（NavDisplay）**。
- **1.2.0-alpha06 核心突破与设计哲学**：
  1. **强类型路由契约（NavKey）**：所有页面路由均声明为实现 \`NavKey\` 的 Kotlin \`@Serializable\` 数据类/对象，参数空安全与类型系统由编译器强制约束；
  2. **entryProvider 泛型 DSL 架构**：从初期的 \`when(route)\` 表达式升级为现代 \`entryProvider { entry<T> { ... } }\` 模式，支持按路由 Class 模块化独立注册，杜绝巨型单文件路由表；
  3. **纯数据驱动状态栈**：回退栈退化为由 \`rememberNavBackStack(initialKey)\` 托管的响应式列表，跳转即 \`add()\`，返回即 \`pop()\`，清栈即直接切片，与 iOS SwiftUI \`NavigationStack(path: \$path)\` 架构完全对齐；
  4. **原生多层 Overlay 与预测性返回手势**：1.2.0 重点重构了 \`SceneState\` 与 \`OverlayScene\`，彻底修复了模态底部弹窗（\`ModalBottomSheet\`）在多层嵌套快速返回时动画残留与状态复用异常，无缝契合 Android 14/15 预测性返回；
  5. **最新官方结果回传体系（ResultEventBus）**：彻底废弃旧版 \`previousBackStackEntry.savedStateHandle\`，通过 \`rememberResultEventBusNavEntryDecorator()\` 挂载装饰器，发送端调用 \`LocalResultEventBus.current.sendResult(data)\`，接收端通过 \`ResultEffect<T>\` 声明式单次安全消费。

\`\`\`kotlin
// 1. Gradle 依赖配置 (模块级 build.gradle.kts)
dependencies {
    implementation("androidx.navigation3:navigation3-runtime:1.2.0-alpha06")
    implementation("androidx.navigation3:navigation3-ui:1.2.0-alpha06")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.1")
}

// 2. 强类型路由与回传领域实体 (纯数据契约，严格不可变)
@Serializable
sealed interface AppRoute : NavKey {
    @Serializable
    data object ProductList : AppRoute

    @Serializable
    data class ProductDetail(val productId: String, val fromSearch: Boolean = false) : AppRoute

    // 模态弹窗面板统一纳管为路由节点
    @Serializable
    data class CouponPicker(val currentCouponId: String?) : AppRoute
}

// 跨页面返回的数据载体（强类型且支持序列化）
@Serializable
data class SelectedCoupon(val id: String, val name: String, val discountPrice: Double)

// 3. 现代纯数据驱动导航架构与最新结果回传闭环 (1.2.0-alpha06 官方最新范式)
@Composable
fun Nav3ModernApp() {
    // ⚡ 状态即路由栈：可持久化可观测，初始节点为商品列表
    val backStack = rememberNavBackStack<AppRoute>(AppRoute.ProductList)

    // ⚡ NavDisplay：将当前数据栈投影为 UI，内置预测性返回手势监听
    NavDisplay(
        backstack = backStack,
        onBack = { backStack.removeLastOrNull() },
        // ⚡ 核心机制 ①：挂载官方装饰器链（状态恢复 + 跨页结果总线）
        entryDecorators = listOf(
            rememberSaveableStateHolderNavEntryDecorator(),
            rememberResultEventBusNavEntryDecorator()
        ),
        entryProvider = entryProvider {
            // 模块 A：商品列表主入口（结果接收端）
            entry<AppRoute.ProductList> {
                var activeCoupon by remember { mutableStateOf<SelectedCoupon?>(null) }

                // ⚡ 核心机制 ②：官方 ResultEffect 单次安全监听，精准消费一次，重组/旋转绝不重复触发！
                ResultEffect<SelectedCoupon> { coupon ->
                    activeCoupon = coupon
                    Log.d("Nav3", "已接收到跨页回传优惠券: \${coupon.name}")
                }

                ProductListScreen(
                    selectedCoupon = activeCoupon,
                    onNavigateToDetail = { id ->
                        backStack.add(AppRoute.ProductDetail(productId = id))
                    },
                    onOpenCouponPicker = {
                        backStack.add(AppRoute.CouponPicker(currentCouponId = activeCoupon?.id))
                    }
                )
            }

            // 模块 B：商品详情页 (泛型推导自动解包 route 参数)
            entry<AppRoute.ProductDetail> { detailRoute ->
                ProductDetailScreen(
                    productId = detailRoute.productId,
                    fromSearch = detailRoute.fromSearch,
                    onBack = { backStack.removeLastOrNull() },
                    onPopToRoot = {
                        // 一键清栈回首页：直接操作列表切片，告别晦涩的 popUpTo 语法
                        while (backStack.size > 1) backStack.removeLastOrNull()
                    }
                )
            }

            // 模块 C：优惠券选择模态面板 (结果生产端)
            entry<AppRoute.CouponPicker> { pickerRoute ->
                // ⚡ 核心机制 ③：获取当前 NavEntry 作用域内的 LocalResultEventBus
                val resultBus = LocalResultEventBus.current

                CouponPickerBottomSheet(
                    currentCouponId = pickerRoute.currentCouponId,
                    onCouponSelected = { coupon ->
                        // ⚡ 核心机制 ④：直接向总线发送强类型对象并即刻出栈，彻底告别 savedStateHandle！
                        resultBus.sendResult<SelectedCoupon>(result = coupon)
                        backStack.removeLastOrNull()
                    },
                    onDismiss = { backStack.removeLastOrNull() }
                )
            }
        }
    )
}
\`\`\`

#### 多页面并发监听陷阱与定向 RequestKey 避坑防冒领

- **底层陷阱（Channel 抢占与幽灵冒领）**：
  \`LocalResultEventBus\` 底层是带缓冲的 \`Channel(capacity = BUFFERED)\`。\`Channel\` 遵循点对点队列语义，多个页面同时监听同一种数据类型时，属于**竞争消费者（Fan-out 抢占模型）**。
  - **典型事故场景**：A、B、C 页面均监听图片返回。C 页面打开相册后，因某些原因（如用户按返回、业务重置或后台内存清理）导致 C 页面在相册返回前被移出回退栈；相册选择完毕后派发结果，回退栈露出的顶层页面为 B；**B 页面将直接从 Channel 缓冲区冒领本属于 C 的图片**，导致 B 页面的数据被错误篡改！
- **破局法则：定向 RequestKey（Targeted Request Key）**：
  路由节点中显式携带发起方的专属 \`requestKey\`，派发与监听均按此 Key 精准寻址，杜绝任何页面冒领。
- **RequestKey 的 3 种正确生成方式**：
  1. **业务确定性派生（⭐⭐⭐⭐⭐ 零开销首选）**：若页面有业务主键，直接结合业务特征拼接：\`val reqKey = "req_order_image_\${route.orderId}"\`，天然抗屏幕旋转与进程被杀；
  2. **rememberSaveable 托管随机凭证（⭐⭐⭐⭐ 无主键推荐）**：严禁裸写 \`UUID.randomUUID()\`（重组会导致 Key 频繁变动而失配），必须使用 \`val reqKey = rememberSaveable { "req_gallery_\${UUID.randomUUID()}" }\`，确保屏幕旋转和进程被杀后依然从 Bundle 还原同一凭证；
  3. **ViewModel / SavedStateHandle 托管（⭐⭐⭐⭐ MVVM 规范）**：由 ViewModel 状态机在 \`savedStateHandle.getOrPut("req_key") { UUID.randomUUID().toString() }\` 中暂存管理。

\`\`\`kotlin
// 4. 定向 RequestKey 生产级实战：杜绝多页面冒领
@Serializable
data class TargetedGalleryRoute(val requestKey: String) : NavKey

@Composable
fun OrderAuditScreen(orderId: String, backStack: MutableList<Any>) {
    // ⚡ 做法 1：基于业务主键生成绝对幂等稳定的定向 Key
    val requestKey = "req_audit_order_\$orderId"

    // ⚡ 严格只监听本业务的专属通道，即便其他页面也在选图，也绝不会发生竞争冒领！
    ResultEffect<SelectedCoupon>(resultKey = requestKey) { result ->
        viewModel.onOrderReceiptUploaded(orderId, result)
    }

    Button(onClick = {
        // 将专属凭证随路由注入目标页面
        backStack.add(TargetedGalleryRoute(requestKey = requestKey))
    }) {
        Text("选择凭据")
    }
}

// 做法 2：无主键场景使用 rememberSaveable 保证抗重组与抗旋转恢复
@Composable
fun CreatePostScreen(backStack: MutableList<Any>) {
    // ⚡ 严禁裸写 UUID.randomUUID()；必须用 rememberSaveable 封锁在 Bundle 快照中
    val postPhotoKey = rememberSaveable { "req_post_\${UUID.randomUUID()}" }

    ResultEffect<SelectedCoupon>(resultKey = postPhotoKey) { result ->
        viewModel.addPostAttachment(result)
    }

    Button(onClick = {
        backStack.add(TargetedGalleryRoute(requestKey = postPhotoKey))
    }) {
        Text("添加动态配图")
    }
}
\`\`\``,
      },
      {
        tag: '表现逻辑',
        title: '逻辑层：ViewModel 机制与状态基座',
        explanation: `\`\`\`viewmodel-diagram
========================================================================================
     ViewModel 跨配置变更存活、进程被杀恢复与树状导航生命周期全景图解
========================================================================================

【图解 1】跨配置变更存活时序（NonConfigurationInstances 零拷贝复用）
       【屏幕旋转 / 配置变更事件发生】
                     │
                     ▼
  ┌────────────────────────────────────────────────────────┐
  │ 1. 旧 Activity 实例销毁阶段 (onDestroy)                  │
  │    • 触发: onRetainNonConfigurationInstance()          │
  └──────────────────────────┬─────────────────────────────┘
                             │ 将 ViewModelStore 指针存入宿主记录
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 2. 进程级常驻缓存 (ActivityThread 内存驻留)             │
  │    ActivityClientRecord.lastNonConfigurationInstances  │
  │    └── 持有: ViewModelStore (内部为 Map<Key, ViewModel>)│
  │    ⚡ 进程未死，JVM 堆内存中的 ViewModel 与协程任务完好如初 │
  └──────────────────────────┬─────────────────────────────┘
                             │ 新 Activity 实例生成并执行 onCreate()
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 3. 新 Activity 实例恢复阶段 (onCreate)                  │
  │    • 调用: getLastNonConfigurationInstance()           │
  │    • 零拷贝提取旧 ViewModelStore，完美接管已有数据流与任务     │
  └──────────────────────────┬─────────────────────────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼ 再次配置变更 (继续旋转)          ▼ 用户主动退出 / finish()
      循环走步骤 1 ~ 3 零开销复用             调用 viewModelStore.clear()
                                              └── 触发 viewModel.onCleared()
                                              └── 取消 viewModelScope 协程栈

【图解 2】进程被杀（LMK）vs 屏幕旋转恢复全景对比
┌──────────────────────────────────────┬──────────────────────────────────────┐
│       场景 A：屏幕旋转 / 配置变更     │        场景 B：切后台系统杀死进程 (LMK) │
├──────────────────────────────────────┼──────────────────────────────────────┤
│  • 触发条件：旋转屏幕、切换深色模式    │  • 触发条件：后台内存吃紧，系统杀死应用进程 │
│  • 进程状态：应用进程持续存活        │  • 进程状态：Linux 进程彻底消亡，堆内存清空 │
│  • 数据存活载体：ViewModelStore       │  • 数据存活载体：SavedStateHandle     │
└──────────────────┬───────────────────┴──────────────────┬───────────────────┘
                   │                                      │
                   ▼ 内存指针复用 (零拷贝微秒级)            ▼ 系统进程托管 (跨进程 Bundle 快照)
  ┌─────────────────────────────────┐   ┌─────────────────────────────────┐
  │ 新 Activity 直接接管原 ViewModel │   │ 重新生成全新 ViewModel 实例      │
  │ 大对象、缓存列表、进行中任务零损失│   │ 通过 SavedStateViewModelFactory │
  │                                 │   │ 自动从 Bundle 回填恢复状态       │
  └─────────────────────────────────┘   └─────────────────────────────────┘

【图解 3】现代 Compose / Navigation 树状作用域与生命周期
                       【宿主 Activity】
                (持根 ViewModelStore，抗屏幕旋转)
                                │
                                ▼
                   【NavControllerViewModel】
                (随 Activity 常驻，管理整棵导航栈)
                                │
          ┌─────────────────────┴─────────────────────┐
          ▼ 页面 A 入栈                                ▼ 嵌套流程子图 (NavGraph Scope)
 ┌─────────────────────────────┐             ┌─────────────────────────────┐
 │ NavBackStackEntry (Page A)  │             │ NavBackStackEntry (SubGraph)│
 │ • 拥有独立局部 ViewModelStore │             │ • 跨步骤共享登录/下单流程状态 │
 └──────────────┬──────────────┘             └─────────────────────────────┘
                │ 用户点击返回 (Pop 出栈)
                ▼
   调用 entry.viewModelStore.clear() ➔ 触发 onCleared() 释放内存
\`\`\`

### 核心架构：为什么 ViewModel 能在屏幕旋转中存活，却不能抗进程杀死？

- **本质差异**：**组件生命周期**（Activity 销毁）与 **进程生命周期**（Linux 进程终止）的分离设计。

1. **屏幕旋转（NonConfigurationInstances）**：Activity 实例虽被销毁重建，但 Linux 宿主进程持续存活。系统通过宿主 \`ActivityClientRecord.lastNonConfigurationInstances\` 完整保留了包含 \`ViewModelStore\` 的 JVM 堆内存指针。新 Activity 启动后零拷贝取回，数据流与协程栈完好无损。
2. **进程被杀（SavedStateHandle）**：当系统后台内存吃紧（LMK）或配置“不保留活动”时，宿主 Linux 进程被彻底杀死，JVM 堆内存被操作系统全部清空。此时必须依赖 \`SavedStateHandle\` 经由系统 \`ActivityTaskManager\` 跨进程托管的 Bundle 快照，在进程冷启动重建时自动回填。
3. **导航作用域（NavGraph Scope）**：Compose / Navigation 树状作用域中，单页 Entry 出栈立即调用 \`clear()\` 释放协程；跨多页业务流（如购物车➔结算➔支付）通过 \`NavGraph Scope\` 共享同一个 ViewModel，业务流结束整个 Graph 出栈时统一释放。`,
        caseStudy: `### 一、SavedStateHandle 复杂对象持久化与进程被杀热恢复

- **场景解释**：电商搜索页中，用户输入了关键词并勾选了复杂的筛选器。当用户切去微信聊天导致 App 被系统后台杀死后，重新返回时必须无感恢复原有的搜索状态，绝不能白屏回滚。

\`\`\`kotlin
class SearchViewModel(
    private val savedStateHandle: SavedStateHandle,
    private val repository: ProductRepository
) : ViewModel() {
    companion object {
        private const val KEY_QUERY = "saved_search_query"
    }

    // ⚡ 核心机制：将状态绑定到 SavedStateHandle，跨进程杀死依然存活
    val queryState: StateFlow<String> = savedStateHandle.getStateFlow(KEY_QUERY, "")

    // 结合 WhileSubscribed(5000) 构筑防抖搜索流
    val searchResults: StateFlow<List<Product>> = queryState
        .debounce(300.milliseconds)
        .filter { it.isNotBlank() }
        .flatMapLatest { query -> repository.searchProducts(query) }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000), // ⚡ 旋转不重查，切后台省电
            initialValue = emptyList()
        )

    fun onQueryChange(newQuery: String) {
        // 自动序列化进 Bundle
        savedStateHandle[KEY_QUERY] = newQuery
    }
}
\`\`\`

### 二、UseCase 领域层封装与并发共享调度实战

- **场景解释**：用户下单一刻，需校验账户余额、扣减库存并上报风控埋点。若直接写在 ViewModel 中会导致逻辑与 UI 框架强耦合。将用例封装为独立的纯逻辑 \`CheckoutUseCase\`，支持高并发线程调度与无依赖单元测试。

\`\`\`kotlin
class CheckoutUseCase(
    private val orderRepo: OrderRepository,
    private val userRepo: UserRepository,
    private val dispatcher: CoroutineDispatcher = Dispatchers.IO
) {
    // ⚡ 重载 invoke 操作符，使得 UseCase 可以像函数一样直接调用
    suspend operator fun invoke(orderId: String, couponId: String?): Result<OrderReceipt> = withContext(dispatcher) {
        runCatching {
            val user = userRepo.getCurrentUser() ?: throw IllegalStateException("用户未登录")
            // 并行执行校验与库存预占
            orderRepo.submitOrder(orderId = orderId, userId = user.id, couponId = couponId)
        }
    }
}

class CheckoutViewModel(
    private val checkoutUseCase: CheckoutUseCase
) : ViewModel() {
    fun submit(orderId: String) {
        viewModelScope.launch {
            // 像普通函数一样调用 UseCase
            val result = checkoutUseCase(orderId, couponId = null)
            result.onSuccess { receipt ->
                Log.d("Checkout", "下单成功: \${receipt.number}")
            }.onFailure { err ->
                Log.e("Checkout", "下单失败: \${err.message}")
            }
        }
    }
}
\`\`\``,
      },
      {
        tag: '数据层',
        title: '数据层',
        sectionTitles: {
          explanation: '网络通信（OkHttp）：核心原理与实战管线',
          caseStudy: '二、本地存储（Room 与 DataStore）：核心实战与离线流水线',
        },
        explanation: `\`\`\`okhttp-pipeline
                      okHttpClient.newCall(request)
                                   │
                ┌──────────────────┴──────────────────┐
                ▼                                     ▼
    【异步轨道】call.enqueue(callback)       【同步轨道】call.execute()
                │                                     │
╭───────────────┴────────────────────────╮   ╭────────┴────────────────────────╮
│ 阶段 ①-A：Dispatcher 异步并发门闸判定   │   │ 阶段 ①-B：Dispatcher 同步登记   │
│                                        │   │                                 │
│ [门闸条件]: runningAsyncCalls.size < 64│   │  synchronized {                 │
│             && callsPerHost(host) < 5  │   │    runningSyncCalls.add(call)   │
│                   │                    │   │  }                              │
│          ┌────────┴────────┐           │   │                                 │
│       NO │                 │ YES       │   │  • 不进线程池，当前线程阻塞执行  │
│          ▼                 ▼           │   │  • 不受 64/5 阈值限流           │
│  [ readyAsyncCalls ] [runningAsyncCalls│   │  • 登记用于 cancelAll() 全局取消│
│  (就绪排队双向队列)   (运行中异步队列)  │   ╰────────────────┬────────────────╯
│    • 零任务丢弃            │           │                    │
│    • 等待配额释放          ▼           │                    │
│          ▲         提交无界线程池      │                    │
│          │         (0核心+手递手Queue) │                    │
│          │                 │           │                    │
│          │                 ▼           │                    │
│          │         子线程并发执行      │                    │
╰──────────┼─────────────────┬───────────╯                    │
           │                 │                                │
           │                 └────────────────┬───────────────┘
           │                                  ▼
           │                     【双轨殊途同归：直入责任链】
           │                   getResponseWithInterceptorChain$okhttp()
           │                                  │
╭──────────┴──────────────────────────────────┴───────────────────────────────╮
│  阶段 ②：RealInterceptorChain 责任链执行管线（递归拦截切面）                  │
╰─────────────────────────────────────────────────────────────────────────────╯
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼ 请求前置加工 (Request)                                          ▲ 响应后置包装 (Response)
   ┌───────────────────────────────┐                             ┌────────┴──────────────────────┐
   │ 1. Application Interceptor    │ ──▶ chain.proceed(req) ──▶  │ 业务切面：Token 自动刷新 / 统计│
   └───────────────┬───────────────┘                             └───────────────────────────────┘
                   ▼
   ┌───────────────────────────────┐                             ┌───────────────────────────────┐
   │ 2. RetryAndFollowUpInterceptor│ ──▶ chain.proceed(req) ──▶  │ 容灾切面：3xx 自动重定向 / 重试│
   └───────────────┬───────────────┘                             └───────────────────────────────┘
                   ▼
   ┌───────────────────────────────┐                             ┌───────────────────────────────┐
   │ 3. BridgeInterceptor          │ ──▶ chain.proceed(req) ──▶  │ 协议切面：补全 Header / Gzip  │
   └───────────────┬───────────────┘                             └───────────────────────────────┘
                   ▼
   ┌───────────────────────────────┐                             ┌───────────────────────────────┐
   │ 4. CacheInterceptor           │ ──▶ chain.proceed(req) ──▶  │ 缓存切面：RFC 7234 磁盘缓存写入│
   └───────────────┬───────────────┘                             └───────────────────────────────┘
                   ▼ (未命中缓存，穿透至物理网络)
   ╭───────────────────────────────────────────────────────────────────────────╮
   │  阶段 ③：ConnectionPool 连接池寻址与 Socket 多路复用                       │
   ╰───────────────────────────────────────────────────────────────────────────╯
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
          【连接池命中已存活 Socket】                 【无空闲连接：全新建连】
        • 命中相同 Host:Port 管道                   • 发起 TCP 三次握手
        • HTTP/2 多路复用共享物理管道               • TLS 1.3 密钥协商握手
        • 规避 100~300ms 建连物理延迟               • 建连完成后加入 ConnectionPool
                   │                                           │
                   └─────────────────────┬─────────────────────┘
                                         ▼
   ┌───────────────────────────────┐                             ┌───────────────────────────────┐
   │ 6. Network Interceptor        │ ──▶ chain.proceed(req) ──▶  │ 监控切面：抓包打点 / 真实传输耗时│
   └───────────────┬───────────────┘                             └───────────────────────────────┘
                   ▼
   ┌───────────────────────────────┐
   │ 7. CallServerInterceptor      │ ──▶ 真正向 Socket 写入 Request 报文 (头+体)
   │    (责任链终点终端)           │ ◀── 从 Socket 字节流读取 Response 报文 (状态+体)
   └───────────────┬───────────────┘
                   │
                   ▼ (沿责任链向上反向回溯加工，见右侧各层响应切面)
   ╭───────────────────────────────────────────────────────────────────────────╮
   │  阶段 ④：响应回传与队列推进（释放配额 ➔ 唤醒等待任务）                       │
   ╰───────────────────────────────────────────────────────────────────────────╯
         ① callback.onResponse(call, response) 回调通知业务层
         ② 异步任务完成 ──▶ 触发 Dispatcher.finished(this)
         ③ runningAsyncCalls 移除该请求，当前域名与总并发配额计数 -1
         ④ promoteAndExecute() 自动从 readyAsyncCalls 头部捞取下一请求提升执行！
\`\`\`

### 核心架构：为什么默认线程池是零核心无界的 SynchronousQueue 设计？

- **核心原则**：\`Dispatcher\` 负责“任务队列”，线程池只负责“并发”。

1. **无需二次排队**：进入线程池的任务已获准执行（\`size < 64 && perHost < 5\`），无需在线程池队列中二次滞留。
2. **手递手零延迟**：\`SynchronousQueue\` 容量为 0，有空闲线程秒复用，无空闲线程秒建新线程（\`max = MAX_VALUE\`）。
3. **零常驻节能**：\`core = 0 + 60s 存活\`，移动端请求呈突发性，闲置 60 秒后线程全部销毁，常驻内存为 0。
4. **Dispatcher 护城河**：总并发硬顶由上游卡死在 64，彻底规避传统 \`CachedThreadPool\` 无限膨胀导致的 OOM。

### 核心架构：为什么 OkHttpClient 必须全局单例？

- **核心原则**：\`ConnectionPool\`（连接池）与 \`Dispatcher\`（分发器）是**实例级字段**，非单例会导致性能与稳定性双重雪崩。

1. **连接复用彻底瘫痪**：每次 \`new\` 都生成独立连接池，相同 Host 无法共享存活 Socket，每次请求白白重走 100~300ms TCP/TLS 握手。
2. **并发限流全面失控**：64/5 阈值仅在单个实例内生效，频繁 \`new\` 会瞬间产生海量物理线程击穿系统限制，极易导致 IP 被封。
3. **线程堆积诱发 OOM**：每个实例独占线程池与守护线程，短时间内未及时回收的大量线程堆积极易诱发内存溢出。
4. **正确姿势（client.newBuilder）**：特殊场景（如大文件 60s 超时、不同业务线配置不同拦截器）用 \`client.newBuilder()\` 派生，**强行共享底层同一个连接池与分发器**。

\`\`\`kotlin
// 1. 全局底座 Client（纯净无业务拦截器，仅持有共享连接池与分发器）
val baseClient = OkHttpClient.Builder()
    .connectionPool(ConnectionPool(5, 5, TimeUnit.MINUTES))
    .dispatcher(Dispatcher())
    .connectTimeout(10, TimeUnit.SECONDS)
    .build()

// 2. 用户中心 Client（浅拷贝共享连接池，按需注入 AES 加密）
val userClient = baseClient.newBuilder()
    .addInterceptor(AesCryptoInterceptor(secretKey = "USER_KEY"))
    .build()

// 3. 支付中心 Client（浅拷贝共享连接池，按需注入 SM4 国密加密）
val payClient = baseClient.newBuilder()
    .addInterceptor(Sm4CryptoInterceptor(secretKey = "PAY_KEY"))
    .build()

// 4. 大文件上传 Client（浅拷贝共享连接池，仅定制 60s 长超时）
val uploadClient = baseClient.newBuilder()
    .readTimeout(60, TimeUnit.SECONDS)
    .writeTimeout(60, TimeUnit.SECONDS)
    .build()
\`\`\`

### OkHttp Token 无感自动刷新拦截器实战

- **场景解释**：API 采用双 Token 机制（短期 AccessToken + 长期 RefreshToken）。当多个并发网络请求同时遇到 401 Unauthorized 时，必须确保**只发起一次 RefreshToken 换票请求**，换到新 Token 后唤醒所有等待的请求重新发起，避免并发换票死锁或重复失效。

\`\`\`kotlin
class TokenAuthenticator(
    private val tokenRepo: TokenRepository
) : Authenticator {
    private val lock = Any()

    override fun authenticate(route: Route?, response: Response): Request? {
        // ⚡ 1. 超过 3 次重试判定彻底失败，跳出死循环
        if (responseCount(response) >= 3) return null

        synchronized(lock) {
            val currentToken = tokenRepo.getAccessToken()
            val requestToken = response.request.header("Authorization")?.removePrefix("Bearer ")

            // ⚡ 2. 双重检查：如果其他并发请求已经先刷新了 Token，直接用新 Token 重试
            if (currentToken != requestToken && currentToken != null) {
                return response.request.newBuilder()
                    .header("Authorization", "Bearer $currentToken")
                    .build()
            }

            // ⚡ 3. 阻塞式执行刷新 Token（仅第 1 个 401 请求发起刷新）
            val refreshSuccess = tokenRepo.refreshAccessTokenSync()
            if (!refreshSuccess) {
                tokenRepo.logout() // 刷新失败，强制登出
                return null
            }

            // ⚡ 4. 拿到最新 Token，带新 Header 重新发起该请求
            val newToken = tokenRepo.getAccessToken()
            return response.request.newBuilder()
                .header("Authorization", "Bearer $newToken")
                .build()
        }
    }

    private fun responseCount(response: Response): Int {
        var count = 1
        var prior = response.priorResponse
        while (prior != null) {
            count++
            prior = prior.priorResponse
        }
        return count
    }
}
\`\`\`

### 接口请求加密与响应解密一体化拦截器实战

- **场景解释**：金融与高安全级接口要求全链路报文密文传输。在单个拦截器中，以 \`chain.proceed(request)\` 为分水岭：**前置**读取请求明文并加密重构 \`RequestBody\`，**后置**读取服务端密文流并解密重构 \`ResponseBody\`。无需复杂条件判断，直接完成端到端透明加解密，下游业务层与 Retrofit 保持纯明文对象交互。

\`\`\`kotlin
// 全链路报文加解密一体化拦截器（Application Interceptor）
class CryptoInterceptor(private val secretKey: String) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()

        // ═══════════════════════════════════════════════════════
        // 1. 【去程 / 请求阶段】加密 RequestBody
        // ═══════════════════════════════════════════════════════
        val encryptedRequest = if (request.body != null) {
            // (1) 将原请求体写入内存 Buffer 读取明文
            val buffer = Buffer()
            request.body!!.writeTo(buffer)
            val plainText = buffer.readUtf8()

            // (2) 执行加密，并用密文字符串重构 RequestBody
            val cipherText = encrypt(plainText, secretKey)
            val newBody = cipherText.toRequestBody(request.body!!.contentType())

            // (3) 重构 Request，替换原 Body
            request.newBuilder()
                .method(request.method, newBody)
                .build()
        } else {
            request // GET 请求等无 Body 场景直接放行
        }

        // ═══════════════════════════════════════════════════════
        // 2. 【分水岭】同步阻塞等待网络 IO 完毕并拿到服务端响应
        // ═══════════════════════════════════════════════════════
        val response = chain.proceed(encryptedRequest)

        // ═══════════════════════════════════════════════════════
        // 3. 【返程 / 返回阶段】解密 ResponseBody
        // ═══════════════════════════════════════════════════════
        val responseBody = response.body
        if (responseBody != null) {
            // (1) 读取服务端返回的密文字符串（此时底层流已消费完毕）
            val cipherText = responseBody.string()

            // (2) 执行解密，还原为明文字符串
            val plainText = decrypt(cipherText, secretKey)

            // (3) ⚡ 核心避坑点：用明文重构全新的 ResponseBody，避免 stream closed 崩溃
            val newResponseBody = plainText.toResponseBody(responseBody.contentType())

            // (4) 返回包含明文 Body 的全新 Response 供下游 Retrofit/Gson 解析
            return response.newBuilder()
                .body(newResponseBody)
                .build()
        }

        return response
    }

    private fun encrypt(plainText: String, key: String): String {
        // 对称加密算法实现（如 AES-GCM / SM4）
        return plainText // 生产环境替换为真实加密逻辑
    }

    private fun decrypt(cipherText: String, key: String): String {
        // 对称解密算法实现（如 AES-GCM / SM4）
        return cipherText // 生产环境替换为真实解密逻辑
    }
}
\`\`\``,
        caseStudy: `### 数据库平滑迁移：选型决策与四大避坑红线

- **核心原则**：改表结构骨架（加表/加列/改名/删列）用**自动迁移（@AutoMigration）**；改数据内容（清洗/类型转换/主键重构）用**手动迁移（Migration）**。

| 场景分类 | 适用场景 | 迁移方案 | 关键实现 |
| :--- | :--- | :---: | :--- |
| **结构变更** | 加表、加列、改名、删列 | **自动迁移** | 实体类直接修改，改名/删列需配 \`AutoMigrationSpec\` |
| **数据重构** | 数据清洗、类型演进、修改主键 | **手动迁移** | 手写 \`Migration(from, to)\` 执行 SQL 或临时表三步法 |

- **四大生产避坑红线**：
  1. **加非空列必配默认值**：声明 \`@ColumnInfo(defaultValue = "...")\`，否则存量老数据无处安放，直接抛 \`SQLiteException\` 闪退。
  2. **严禁线上调用破坏性降级**：绝不可开 \`fallbackToDestructiveMigration()\`，迁移失败会直接 DROP 清空用户全部离线数据！
  3. **改名与删列必须配 Spec**：Room 无法凭空猜测意图，必须通过 \`@RenameColumn\` 或 \`@DeleteColumn\` 显式消除歧义。
  4. **复杂重构用临时表三步法**：SQLite 不支持直接修改列，改类型或改主键必须遵循：“①建临时表 ➔ ②拷数据 ➔ ③删旧表更名”。

### 数据库安全迁移落地实战（AutoMigration 注解与复杂临时表三步法）

- **实战场景演示**：涵盖自动迁移（加列默认值、改列名、删列）与手动迁移（复杂临时表三步法）。

\`\`\`kotlin
// 1. Entity 新增字段规范：可空字段或显式配置 defaultValue
@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val id: String,
    val displayName: String,
    // ⚡ 加列场景 1：新增可空列，老记录自动填 NULL，全自动处理无需配置 Spec
    val avatarUrl: String? = null,
    // ⚡ 加列场景 2：新增非空列，必须声明 defaultValue，否则老数据无法兼容直接编译报错！
    @ColumnInfo(defaultValue = "0") val score: Int = 0
)

// 2. Database 自动迁移声明与歧义消除 Spec
@Database(
    entities = [UserEntity::class],
    version = 3,
    autoMigrations = [
        // 版本 1 ➔ 2：通过 Spec 显式声明改名与删列（消除“删旧建新”歧义并防误删）
        AutoMigration(from = 1, to = 2, spec = AppDatabase.Migration1To2Spec::class)
    ]
)
abstract class AppDatabase : RoomDatabase() {
    @RenameColumn(tableName = "users", fromColumnName = "fullName", toColumnName = "displayName")
    @DeleteColumn(tableName = "users", columnName = "oldTempToken")
    class Migration1To2Spec : AutoMigrationSpec

    companion object {
        // ⚡ 版本 2 ➔ 3：手动复杂表重构三步法（深度重构或老数据清洗）
        val MIGRATION_2_3 = object : Migration(2, 3) {
            override fun migrate(db: SupportSQLiteDatabase) {
                // 第一步：创建包含新字段与新约束的全新临时表
                db.execSQL("CREATE TABLE users_temp (id TEXT PRIMARY KEY NOT NULL, displayName TEXT NOT NULL, score INTEGER NOT NULL DEFAULT 0)")
                // 第二步：将需要保留的旧表数据复制进临时表
                db.execSQL("INSERT INTO users_temp (id, displayName) SELECT id, displayName FROM users")
                // 第三步：删除旧表并将临时表更名为正式表
                db.execSQL("DROP TABLE users")
                db.execSQL("ALTER TABLE users_temp RENAME TO users")
            }
        }
    }
}
\`\`\`

### 一对多与多对多声明式关系建模（@Embedded、@Relation 与交叉表 Junction）

#### 1. 一对多关系（One-to-Many）：用户与名下多个订单

- **实现要点**：主表用 \`@Embedded\` 嵌套，子表列表用 \`@Relation(parentColumn, entityColumn)\` 绑定外键。

\`\`\`kotlin
@Entity(tableName = "users")
data class UserEntity(@PrimaryKey val userId: String, val name: String)

@Entity(tableName = "orders")
data class OrderEntity(@PrimaryKey val orderId: String, val ownerId: String, val amount: Long)

// ⚡ 一对多关系模型：无需中间表，直接外键绑定
data class UserWithOrders(
    @Embedded val user: UserEntity,
    @Relation(
        parentColumn = "userId",
        entityColumn = "ownerId"
    )
    val orders: List<OrderEntity>
)

@Dao
interface UserDao {
    @Transaction // ⚡ 声明式关联查询必须加 @Transaction 保证原子性
    @Query("SELECT * FROM users WHERE userId = :userId")
    fun getUserWithOrders(userId: String): Flow<UserWithOrders>
}
\`\`\`

#### 2. 多对多关系（Many-to-Many）：订单与多种商品

- **实现要点**：引入中间交叉表（Junction Table）存储双主键映射，并在 \`@Relation\` 中声明 \`associateBy = Junction(...)\`。

\`\`\`kotlin
@Entity(tableName = "orders")
data class OrderEntity(@PrimaryKey val orderId: String, val createTime: Long)

@Entity(tableName = "products")
data class ProductEntity(@PrimaryKey val productId: String, val title: String, val price: Long)

// ⚡ 中间交叉表：声明复合主键
@Entity(tableName = "order_product_cross_ref", primaryKeys = ["orderId", "productId"])
data class OrderProductCrossRef(val orderId: String, val productId: String)

// ⚡ 多对多关系模型：通过 associateBy 关联交叉表
data class OrderWithProducts(
    @Embedded val order: OrderEntity,
    @Relation(
        parentColumn = "orderId",
        entityColumn = "productId",
        associateBy = Junction(OrderProductCrossRef::class)
    )
    val products: List<ProductEntity>
)

@Dao
interface OrderDao {
    @Transaction
    @Query("SELECT * FROM orders WHERE orderId = :orderId")
    fun getOrderWithProducts(orderId: String): Flow<OrderWithProducts>
}
\`\`\`

### 强一致性事务管理（@Transaction 声明式与 withTransaction 编程式）

- **解决痛点与实战规范**：在多表批量读写、或者“先清空旧数据后插入新数据”场景下，必须保证原子性（Atomicity）。中间任何一步失败，全量数据自动回滚，杜绝脏数据。
- **两种事务控制手段**：
  1. **DAO 声明式（@Transaction）**：适用于 DAO 方法内部的多步查询或复合写入；
  2. **Repository 编程式挂起事务（roomDb.withTransaction）**：适用于跨多个 DAO、或结合协程异步编排的复杂业务事务。

\`\`\`kotlin
@Dao
interface ProductDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProducts(items: List<ProductEntity>)

    @Query("DELETE FROM products WHERE category = :category")
    suspend fun clearCategory(category: String)

    // ⚡ 1. 声明式事务：确保清空旧分类与插入新列表在单个 SQLite 事务中完成
    @Transaction
    suspend fun replaceCategory(category: String, newItems: List<ProductEntity>) {
        clearCategory(category)
        insertProducts(newItems)
    }
}

// ⚡ 2. 编程式挂起事务：跨多 DAO 协同事务
class InventoryRepository(private val db: AppDatabase) {
    suspend fun updateStockAndOrder(order: OrderEntity, products: List<ProductEntity>) = db.withTransaction {
        db.orderDao().insertOrder(order)
        db.productDao().insertProducts(products)
        // 块内任何一步抛出异常，整个操作自动全量原子回滚！
    }
}
\`\`\`

### 离线优先单一真实数据源（SOT）架构协同流水线（OkHttp + Room）

- **解决痛点与实战规范**：现代移动端极致体验原则——“UI 永远只观察本地数据库（秒开且无网络时可读），后台静默发起网络拉取，利用事务写入数据库，自动触发上层 Flow 刷新”，构建不可破败的单一可信数据源（SOT）。

\`\`\`kotlin
class FeedRepository(
    private val db: AppDatabase,
    private val api: FeedApiService
) {
    // ⚡ 1. 单一事实源：向 UI 暴露本地数据库 Flow，上层完全与网络请求解耦
    fun getFeedStream(): Flow<List<FeedItem>> = db.feedDao().observeFeeds()

    // ⚡ 2. 后台静默刷新：网络数据原子写入数据库，自动触发上方的 Flow 刷新！
    suspend fun refreshFeed(): Result<Unit> = runCatching {
        val remoteData = api.fetchLatestFeeds()

        // 编程式挂起事务：多表原子清空与替换，失败自动全量回滚
        db.withTransaction {
            db.feedDao().clearAll()
            db.feedDao().insertAll(remoteData.map { it.toEntity() })
            db.syncLogDao().recordSyncTime(System.currentTimeMillis())
        }
    }
}
\`\`\`

### 轻量键值存储：Preferences DataStore 快速上手指南

- **定位与场景**：Jetpack DataStore 是 Google 官方推荐替代传统 \`SharedPreferences\` 的现代轻量键值存储方案。适用于存储用户偏好设置（如深色模式开关、引导页展示标记）、简单鉴权凭证（如 Token）等非关系型配置数据。
- **核心操作三步法**：
  1. **属性委托单例声明**：通过 \`preferencesDataStore\` 在顶级作用域单例创建；
  2. **读取数据（响应式 Flow）**：通过 \`dataStore.data\` 返回只读 \`Flow<T>\`，天然支持异步响应式观测与默认值回退；
  3. **写入数据（挂起事务）**：通过挂起函数 \`dataStore.edit { ... }\` 进行事务性写入。

\`\`\`kotlin
// 1. 在 Context 上通过属性委托声明全局单例（建议放在顶级文件）
private val Context.userPreferencesDataStore: DataStore<Preferences> by preferencesDataStore(
    name = "user_settings"
)

// 2. 封装简单的偏好设置存储仓库
class UserPreferencesRepository(private val context: Context) {
    companion object {
        // 定义强类型 Key
        val KEY_IS_DARK_MODE = booleanPreferencesKey("is_dark_mode")
        val KEY_USER_TOKEN = stringPreferencesKey("user_token")
    }

    // ⚡ 3. 响应式读取：通过 Flow 暴露配置流（提供初始默认值）
    val isDarkModeFlow: Flow<Boolean> = context.userPreferencesDataStore.data
        .map { preferences ->
            preferences[KEY_IS_DARK_MODE] ?: false // 默认浅色
        }

    val userTokenFlow: Flow<String?> = context.userPreferencesDataStore.data
        .map { preferences ->
            preferences[KEY_USER_TOKEN]
        }

    // ⚡ 4. 异步写入：通过挂起函数 edit 进行写入修改
    suspend fun setDarkMode(enabled: Boolean) {
        context.userPreferencesDataStore.edit { preferences ->
            preferences[KEY_IS_DARK_MODE] = enabled
        }
    }

    suspend fun saveToken(token: String) {
        context.userPreferencesDataStore.edit { preferences ->
            preferences[KEY_USER_TOKEN] = token
        }
    }

    // ⚡ 5. 清理配置（例如用户退出登录）
    suspend fun clearSettings() {
        context.userPreferencesDataStore.edit { preferences ->
            preferences.clear()
        }
    }
}
\`\`\``,
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
- **核心机制**：消除传统 GCD (\`DispatchQueue.global().async\`) 无节制创建线程导致的“线程爆炸”；协程在遇到 I/O 时主动让出执行线程。

### 2. 续延语义 async/await（Lattner 2021）：挂起点改写
- **核心机制**：\`await\` 标注了潜在的挂起点。当遇到挂起时，当前 Task 的后续逻辑被封装为续体，底层 Worker 线程立即去执行其他就绪任务。

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
        tag: '架构演进',
        title: '移动端架构演进',
        sectionTitles: {
          explanation: '声明式 UI 与单向数据流核心机制',
          diagram: 'MVC ➔ MVP ➔ MVVM ➔ MVI 核心数据流拓扑对比',
          diagramCaption: '四大架构演进数据流图',
          caseStudy: 'MVVM 与 MVI 的理论源流与演进史',
        },
        explanation: `现代声明式 UI（Jetpack Compose / SwiftUI）从根本上重塑了客户端表现层的驱动模型：UI 彻底成为状态的纯函数投影（\`UI = f(State)\`）。传统命令式时代的控制器臃肿与接口爆炸已随历史退场，当前工业界架构设计的核心矛盾，已全面转向**在单向数据流（UDF）闭环中，如何平衡全局单一状态的原子一致性与高频复杂交互下的局部重组性能**。`,
        diagram: `arch-evolution`,
        caseStudy: `### MVVM 与 MVI 的理论源流与演进史

理解 MVVM 与 MVI 的演进，本质是理解图形界面（GUI）软件工程在过去二十年间如何解决两个终极矛盾：
> **1. 视图与状态的同步成本**（如何避免大量编写易漏、易错的命令式 UI 刷新逻辑）；
> **2. 状态变迁的可预测性与因果确定性**（如何避免复杂异步、多线程与事件竞态下的“幽灵中间态”）。

#### 1. MVVM 的理论诞生与演进（2005 ～ 2017）
- **理论原型**：2004 年，Martin Fowler 提出 Presentation Model (PM) 模式，核心构想是将 View 的视觉状态（如置灰、显隐、文本）抽象为脱离具体 GUI 控件的纯粹状态模型类。
- **微软 WPF 正式确立 (2005)**：微软架构师 John Gossman 与 Ken Cooper 为 WPF / Silverlight 设计架构时正式确立 **MVVM**，依托 XAML 与数据绑定引擎实现双向绑定（Two-way DataBinding），使设计与开发真正分离。
- **Web 前端浪潮与双向绑定困局 (2010 ~ 2015)**：Knockout.js 与 AngularJS 将双向绑定推向高潮，但在复杂业务中，隐式反向修改引发了不可控的“网状数据流风暴”与性能灾难。
- **移动端架构转型 (2017)**：Google 推出 AAC 架构组件（ViewModel + LiveData，后演化为 StateFlow）。移动端主动剥离了危险的双向绑定，演化为**“观察者驱动的响应式单向流 MVVM”**。

#### 2. MVI 的理论确立与函数式闭环（2014 ～ 2020）
- **思想源头：Flux 与 Redux (2014 ~ 2015)**：Facebook 提出单向数据流（UDF），Dan Abramov 创立 Redux，确立“单一不可变状态树”与“纯函数 Reducer 状态转移”两大基石。
- **Cycle.js 与 MVI 命名确立 (2015)**：Andre Staltz 在 Cycle.js 中正式命名 **MVI（Model-View-Intent）**，抽象为数学上的闭环流：User ➔ Intent ➔ Model ➔ View ➔ User。
- **移动端布道 (2017)**：Hannes Dorfmann 发表《Reactive Apps with MVI》，将响应式状态机模型正式引入 Android 领域，根治多流竞争导致的撕裂态。
- **声明式 UI 时代的现代收敛 (2019 至今)**：Jetpack Compose 与 SwiftUI 确立了 \`UI = f(State)\` 范式。Android 官方推行 UDF 标准，iOS 社区涌现出最严谨的状态机框架 TCA (The Composable Architecture)。

#### 3. 两种架构哲学的本质对照

| 对比维度 | 现代响应式 MVVM | 现代 MVI / UDF 状态机 |
| :--- | :--- | :--- |
| **理论出发点** | 面向对象（OO）+ 观察者模式（Observer） | 函数式编程（FP）+ 有限状态机（FSM） |
| **输入通道** | **离散的方法调用**（如 \`vm.onSearch(key)\`、\`vm.refresh()\`） | **单一的意图分发通道**（\`vm.dispatch(Intent.Search(key))\`） |
| **状态载体** | **多个细粒度可观察流**（各个流独立发射、独立变化） | **全局单一不可变快照**（每次变更通过 \`copy()\` 原子推进） |
| **时序一致性** | 弱（多流异步联动时存在纳秒级数据不一致） | 强（任意时间切片下状态均具有原子一致性） |
| **因果可溯性** | 难以拦截全局动作并回溯执行链路 | 意图数据化，天然支持埋点拦截、动作录制与时间旅行 |

#### 4. 工业级 MVI 代码实战规范
在声明式 UI（Compose / SwiftUI）中，一个工业级生产可用的 MVI 架构应包含：**单一聚合根不可变状态（UiState）**、**受限意图事件（Intent）**、**业务状态机（ViewModel）**与**细粒度局部切片监听（避免非必要重组）**：

\`\`\`kotlin
// 1. 【聚合根状态】全局单一不可变状态快照
@Immutable
data class ProfileUiState(
    val header: HeaderState = HeaderState(),
    val composer: ComposerState = ComposerState(),
    val posts: ImmutableList<PostItem> = persistentListOf(),
    val error: String? = null
)

@Immutable
data class HeaderState(val username: String = "", val avatarUrl: String = "", val isFollowing: Boolean = false)

@Immutable
data class ComposerState(val draftText: String = "", val isPosting: Boolean = false)

@Immutable
data class PostItem(val id: String, val title: String, val likes: Int)

// 2. 【类型化意图】将用户与系统的交互完全数据化
sealed interface ProfileIntent {
    data class UpdateDraft(val text: String) : ProfileIntent
    data object SubmitPost : ProfileIntent
    data class ToggleFollow(val userId: String) : ProfileIntent
}

// 3. 【状态机 ViewModel】：读侧状态切片 + 写侧跨切片原子事务
class ProfileViewModel(
    private val repo: ProfileRepository
) : ViewModel() {

    // ⚡ 内部唯一可变聚合状态源
    private val _state = MutableStateFlow(ProfileUiState())
    val state: StateFlow<ProfileUiState> = _state.asStateFlow()

    // ⚡ 【读侧切片 (State Slicing)】：
    // 通过 distinctUntilChanged() 导出细粒度局部流，彻底切断子组件对全局状态的非必要重组依赖！
    val headerState: StateFlow<HeaderState> = _state
        .map { it.header }
        .distinctUntilChanged()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), _state.value.header)

    val composerState: StateFlow<ComposerState> = _state
        .map { it.composer }
        .distinctUntilChanged()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), _state.value.composer)

    val postsState: StateFlow<ImmutableList<PostItem>> = _state
        .map { it.posts }
        .distinctUntilChanged()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), _state.value.posts)

    // 统一意图分发入口
    fun dispatch(intent: ProfileIntent) {
        when (intent) {
            is ProfileIntent.UpdateDraft -> {
                _state.update { it.copy(composer = it.composer.copy(draftText = intent.text)) }
            }
            is ProfileIntent.SubmitPost -> handleSubmitPost()
            is ProfileIntent.ToggleFollow -> handleToggleFollow(intent.userId)
        }
    }

    // ⚡ 【并发防御】：跨 suspend 挂起点防御性校验，杜绝盲写冲掉用户输入
    private fun handleSubmitPost() {
        val draft = _state.value.composer.draftText
        if (draft.isBlank()) return

        viewModelScope.launch {
            _state.update { it.copy(composer = it.composer.copy(isPosting = true)) }
            val newPost = repo.createPost(draft)

            // 恢复后的【跨切片原子事务】：草稿清空与列表追加在一次 CAS 中完成
            _state.update { current ->
                current.copy(
                    composer = current.composer.copy(
                        isPosting = false,
                        draftText = if (current.composer.draftText == draft) "" else current.composer.draftText
                    ),
                    posts = (persistentListOf(newPost) + current.posts).toPersistentList()
                )
            }
        }
    }

    private fun handleToggleFollow(userId: String) {
        viewModelScope.launch {
            val nextFollow = !_state.value.header.isFollowing
            _state.update { it.copy(header = it.header.copy(isFollowing = nextFollow)) }
            repo.toggleFollow(userId, nextFollow).onFailure {
                _state.update { it.copy(header = it.header.copy(isFollowing = !nextFollow)) }
            }
        }
    }
}

// 4. 【Compose View 订阅端】：子组件仅订阅自身切片，跳过无关重组
@Composable
fun ProfileScreen(viewModel: ProfileViewModel) {
    val header by viewModel.headerState.collectAsStateWithLifecycle()
    val composer by viewModel.composerState.collectAsStateWithLifecycle()
    val posts by viewModel.postsState.collectAsStateWithLifecycle()

    Column(modifier = Modifier.fillMaxSize()) {
        ProfileHeaderSection(header = header, onToggleFollow = { viewModel.dispatch(ProfileIntent.ToggleFollow("user_1")) })
        PostComposerSection(composer = composer, onDraftChange = { viewModel.dispatch(ProfileIntent.UpdateDraft(it)) }, onSubmit = { viewModel.dispatch(ProfileIntent.SubmitPost) })
        PostListSection(posts = posts)
    }
}
\`\`\`

#### 5. 实战进阶：复杂长流程协同架构的演进之路

##### 5.1 真实场景
点击列表项 ➔ 隐私协议 ➔ 系统相册 ➔ 激励广告 ➔ 上传推理 ➔ 结果刷新。

##### 5.2 方案演进
- **V1（散装布尔值）**：
  - *思路*：堆叠 \`showPrivacy\`、\`showAd\`、\`isUploading\` 等状态，用全屏 Loading 阻断。
  - *问题*：状态爆炸与 \`if-else\` 地狱；全屏遮罩卡死列表浏览。
- **V2（管线编排 + 就地 Loading）**：
  - *思路*：抽象原子步骤 \`PipelineStep\`，由 \`ActivePipeline\` 推进；上传时仅目标项就地转圈。
  - *问题*：持久状态导致屏幕旋转重放（二次拉起相册/广告）；第三方 SDK 吞回调导致全屏永久卡死。
- **V3（终局架构）**：
  - *解法*：**动作归 Channel（消费即焚防重放）** + **可重入性支持（随时重置防死锁）** + **富模型内聚推进**。

##### 5.3 终极代码实现

\`\`\`kotlin
// ==========================================
// 1. 领域模型：原子步骤、富管线模型与单次消费 Effect
// ==========================================
sealed interface PipelineStep {
    data object Privacy : PipelineStep                      // 纯 UI 对话框
    data object PickPhoto : PipelineStep                    // 外部系统相册
    data class Ad(val adUnitId: String) : PipelineStep      // 第三方广告 SDK
    data object UploadAndGenerate : PipelineStep            // 纯后台异步任务
}

data class ActivePipeline(
    val steps: List<PipelineStep>,
    val currentIndex: Int = 0,
    val targetItemId: String
) {
    val currentStep: PipelineStep get() = steps[currentIndex]
    val isLastStep: Boolean get() = currentIndex >= steps.lastIndex
    fun next(): ActivePipeline = copy(currentIndex = currentIndex + 1)
}

// 外部不可逆副作用（单次消费即焚，彻底防御屏幕旋转重放）
sealed interface PipelineEffect {
    data class LaunchPhotoPicker(val targetItemId: String) : PipelineEffect
    data class ShowAd(val adUnitId: String) : PipelineEffect
}

data class ItemUiModel(val id: String, val title: String, val imageUrl: String, val isGenerating: Boolean = false)

// ==========================================
// 2. ViewModel：编排驱动、外部副作用发射与异步任务解耦
// ==========================================
class TemplateListViewModel(
    private val repository: ImageRecognitionRepository
) : ViewModel() {
    private val _items = MutableStateFlow<List<ItemUiModel>>(emptyList())
    val items: StateFlow<List<ItemUiModel>> = _items.asStateFlow()

    // 模态状态：仅维护当前 UI 树需要渲染的弹层
    private val _activePipeline = MutableStateFlow<ActivePipeline?>(null)
    val activePipeline: StateFlow<ActivePipeline?> = _activePipeline.asStateFlow()

    // 一次性事件通道：消费即焚
    private val _effectChannel = Channel<PipelineEffect>(Channel.BUFFERED)
    val effectFlow = _effectChannel.receiveAsFlow()

    // 步骤配方支持任意组合，且支持可重入（若前次流程异常卡死，再次点击直接覆盖重置）
    fun onItemClick(itemId: String) {
        cancelPipeline() // ⚡ 可重入支持：重置可能滞留的旧流程，杜绝状态死锁
        val steps = listOf(PipelineStep.Privacy, PipelineStep.PickPhoto, PipelineStep.Ad("ad_01"), PipelineStep.UploadAndGenerate)
        startPipeline(ActivePipeline(steps, currentIndex = 0, targetItemId = itemId))
    }

    private fun startPipeline(pipeline: ActivePipeline) {
        _activePipeline.value = pipeline
        executeStep(pipeline)
    }

    fun onStepCompleted() {
        val pipeline = _activePipeline.value ?: return
        if (pipeline.isLastStep) {
            _activePipeline.value = null // 所有步骤闭环退出
        } else {
            executeNextStep(pipeline)
        }
    }

    private fun executeNextStep(pipeline: ActivePipeline) {
        val nextPipeline = pipeline.next()
        _activePipeline.value = nextPipeline
        executeStep(nextPipeline)
    }

    // ⚡ 核心分发器：严格区分 UI 渲染、后台异步与外部副作用
    private fun executeStep(pipeline: ActivePipeline) {
        when (val step = pipeline.currentStep) {
            is PipelineStep.Privacy -> Unit // 纯 UI 弹窗，由 Compose 监听 activePipeline 渲染
            is PipelineStep.UploadAndGenerate -> executeUploadStep(pipeline.targetItemId)
            is PipelineStep.PickPhoto -> {
                viewModelScope.launch { _effectChannel.send(PipelineEffect.LaunchPhotoPicker(pipeline.targetItemId)) }
            }
            is PipelineStep.Ad -> {
                viewModelScope.launch { _effectChannel.send(PipelineEffect.ShowAd(step.adUnitId)) }
            }
        }
    }

    // 后台异步任务：目标列表项就地转圈，完成后自动推进下一步
    private fun executeUploadStep(targetItemId: String) {
        updateItem(targetItemId) { it.copy(isGenerating = true) }
        viewModelScope.launch {
            repository.uploadAndGenerate(targetItemId)
                .onSuccess { url -> updateItem(targetItemId) { it.copy(imageUrl = url, isGenerating = false) } }
                .onFailure { updateItem(targetItemId) { it.copy(isGenerating = false) } }
            onStepCompleted() // 无论生成位于管线第几步，完成即推进下一步
        }
    }

    // 逃生通道：支持用户主动取消或超时强行释放
    fun cancelPipeline() {
        _activePipeline.value = null
    }

    private fun updateItem(id: String, transform: (ItemUiModel) -> ItemUiModel) {
        _items.update { list -> list.map { if (it.id == id) transform(it) else it } }
    }
}

// ==========================================
// 3. Compose UI：单次消费监听与就地 Loading
// ==========================================
@Composable
fun TemplateListScreen(viewModel: TemplateListViewModel) {
    val context = LocalContext.current
    val items by viewModel.items.collectAsStateWithLifecycle()
    val activePipeline by viewModel.activePipeline.collectAsStateWithLifecycle()

    // 1. 系统相册 Launcher（取消则调用 cancelPipeline 释放）
    val photoPickerLauncher = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
        if (uri != null) viewModel.onStepCompleted() else viewModel.cancelPipeline()
    }

    // 2. ⚡ 消费副作用流：旋转屏幕重建时旧事件已消费完毕，绝不重放相册与广告！
    LaunchedEffect(Unit) {
        viewModel.effectFlow.collect { effect ->
            when (effect) {
                is PipelineEffect.LaunchPhotoPicker -> {
                    photoPickerLauncher.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
                }
                is PipelineEffect.ShowAd -> {
                    AdSdk.show(context, effect.adUnitId, onDismiss = viewModel::onStepCompleted)
                }
            }
        }
    }

    // 4. 界面渲染：列表常驻 + 步骤驱动 UI 弹层
    Box(modifier = Modifier.fillMaxSize()) {
        LazyColumn(modifier = Modifier.fillMaxSize()) {
            items(items, key = { it.id }) { item ->
                ListItemRow(item = item, onClick = { viewModel.onItemClick(item.id) })
            }
        }

        // 纯 UI 弹层由持久 State 驱动，旋转重建后自动还原不丢失
        if (activePipeline?.currentStep is PipelineStep.Privacy) {
            PrivacyDialog(
                onAgree = viewModel::onStepCompleted,
                onDismiss = viewModel::cancelPipeline // 逃生通道
            )
        }
    }
}

@Composable
fun ListItemRow(item: ItemUiModel, onClick: () -> Unit) {
    Row(modifier = Modifier.fillMaxWidth().clickable(onClick = onClick).padding(16.dp)) {
        Text(text = item.title, modifier = Modifier.weight(1f))
        if (item.isGenerating) {
            CircularProgressIndicator(modifier = Modifier.size(24.dp)) // ⚡ 就地转圈，不卡列表交互
        }
    }
}
\`\`\``,
      },
      {
        tag: '组件治理',
        title: '组件化方案',
        sectionTitles: {
          explanation: '组件化落地核心结构与全局拓扑',
          caseStudy: '生产落地指南（build-logic、Koin 与综合实战）',
        },
        explanation: `> **核心治理目标**：彻底根治大型工程的“网状依赖死锁”与“编译脚本分散爆炸”，实现**单向树状依赖**与**全局编译秒级管控**。

#### 1. 现代组件化四层依赖拓扑图

\`\`\`text
┌────────────────────────────────────────────────────────────────────────┐
│                        :app (宿主壳模块，全量装配层)                       │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │ implementation (聚合所有实现)   │ implementation
                    ▼                                ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│          :feature:home:impl          │  │      :feature:user:impl      │
│       (首页业务实现，对外完全黑盒)       │  │     (用户业务实现、具体逻辑)    │
└───────────────────┬──────────────────┘  └──────────────┬───────────────┘
                    │ 仅依赖契约                         │ 实现契约
                    ▼                                    ▼
                    ┌────────────────────────────────────┐
                    │         :feature:user:api          │
                    │      (轻量契约：接口与数据实体)       │
                    └─────────────────┬──────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│            :core (公共下沉基建：network 网络 / designsystem UI)          │
└────────────────────────────────────────────────────────────────────────┘
       ▲                              ▲                              ▲
       └──────────────────────────────┴──────────────────────────────┘
               全工程横向插桩: build-logic (统一 Gradle 约定插件)
\`\`\`

#### 2. 组件治理两大落地铁律
- **铁律一（依赖倒置 DIP）**：
  - 模块间严禁直接依赖实现代码（即 \`:home\` 绝对不能依赖 \`:user:impl\`）；
  - 跨模块只允许依赖对方轻量的 \`:api\` 契约模块，由 \`:app\` 宿主在启动期统一装配。
- **铁律二（插件集中化 Convention Plugins）**：
  - 各个业务模块 \`build.gradle.kts\` 禁止自行配置 SDK 版本、Kotlin 编译参数或重复引入核心库；
  - 统一通过 \`build-logic\` 复合构建集中收敛，业务模块只需声明 1 行插件 ID。

#### 3. 模块依赖权限与红线对照表

| 模块分层 | 典型定位 | 允许依赖的方向 | 绝对禁止的依赖行为（红线） |
| :--- | :--- | :--- | :--- |
| **壳工程 (\`:app\`)** | 顶层聚合与启动打包 | 所有 \`:feature:*:impl\`、\`:core:*\` | ❌ 禁止编写具体业务逻辑代码 |
| **业务实现 (\`:feature:*:impl\`)** | 私有业务逻辑闭环 | 自身的 \`:api\`、其他模块的 \`:api\`、\`:core:*\` | ❌ 严禁依赖其他 Feature 的 \`:impl\` |
| **业务契约 (\`:feature:*:api\`)** | 对外暴露的标准接口与 Model | 最底层基础工具类型（尽量保持极简零依赖） | ❌ 严禁依赖任何业务 \`:impl\`，严禁依赖重型 \`:core\` |
| **公共基建 (\`:core:*\`)** | 通用基础设施（网络、设计系统） | 更底层的纯工具类库 | ❌ 严禁依赖任何 \`:feature\` 业务层 |`,
        caseStudy: `### 1. build-logic 统一插件工程：最简单使用

build-logic 本质是一个独立的 Gradle 子工程（Composite Build），核心目标是**把几十个业务模块中重复复制的数十行 Gradle 脚本，收敛为 1 行自定义插件**。

#### 极简 4 步落地：

- **第 1 步（根目录引入）**：在工程根目录 \`settings.gradle.kts\` 声明引入：
\`\`\`kotlin
// settings.gradle.kts (工程根目录)
pluginManagement {
    includeBuild("build-logic") // 纳入 Composite Build，优先于所有业务模块编译
}
\`\`\`

- **第 2 步（配置插件子工程）**：在 \`build-logic/convention/build.gradle.kts\` 启用 \`kotlin-dsl\` 并注册插件 ID：
\`\`\`kotlin
// build-logic/convention/build.gradle.kts
plugins {
    \`kotlin-dsl\` // 启用 Kotlin 编写插件
}

dependencies {
    compileOnly(libs.android.gradlePlugin)
    compileOnly(libs.kotlin.gradlePlugin)
}

gradlePlugin {
    plugins {
        register("androidFeature") {
            id = "demo.android.feature" // 对外暴露的插件 ID
            implementationClass = "com.demo.buildlogic.AndroidFeatureConventionPlugin"
        }
    }
}
\`\`\`

- **第 3 步（编写统一约定插件）**：创建 \`build-logic/convention/src/main/kotlin/AndroidFeatureConventionPlugin.kt\`：
\`\`\`kotlin
package com.demo.buildlogic

import com.android.build.gradle.LibraryExtension
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.kotlin.dsl.configure
import org.gradle.kotlin.dsl.dependencies
import org.gradle.kotlin.dsl.project

/**
 * 业务 Feature 模块统一约定插件：
 * 自动应用 Android Library、Kotlin、序列化插件，配置统一 SDK 版本，并注入公共下层核心库。
 */
class AndroidFeatureConventionPlugin : Plugin<Project> {
    override fun apply(target: Project) = with(target) {
        // 1. 自动挂载公共编译插件
        pluginManager.apply("com.android.library")
        pluginManager.apply("org.jetbrains.kotlin.android")
        pluginManager.apply("org.jetbrains.kotlin.plugin.serialization")

        // 2. 统一配置 Android 编译选项
        extensions.configure<LibraryExtension> {
            compileSdk = 35
            defaultConfig {
                minSdk = 24
                testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
            }
            compileOptions {
                sourceCompatibility = JavaVersion.VERSION_17
                targetCompatibility = JavaVersion.VERSION_17
            }
        }

        // 3. 统一装配每个 Feature 必备的基础设施库
        dependencies {
            add("implementation", project(":core:designsystem"))
            add("implementation", project(":core:network"))
        }
    }
}
\`\`\`

- **第 4 步（业务模块开箱即用）**：在任何业务模块 \`build.gradle.kts\` 中只需 1 行：
\`\`\`kotlin
// feature/user/impl/build.gradle.kts
plugins {
    id("demo.android.feature") // ⚡ 1 行继承全部编译规范与核心库依赖，告别样板代码
}
\`\`\`

### 2. Koin 依赖注入：最简单使用与 3 种写法对比

Koin 是轻量纯 Kotlin 依赖注入框架，普通业务类无需任何注解侵入。

#### 核心使用三部曲：
1. **类本身保持纯粹**：通过构造函数正常声明需要的参数，不写任何 DI 代码；
2. **在 Module 中声明生命周期**：
   - \`single<T>()\`：全局单例（如 Repository、网络引擎）；
   - \`factory<T>()\`：每次获取创建全新实例；
   - \`viewModel<T>()\`：绑定到页面生命周期的 ViewModel；
   - \`bind TargetInterface::class\`：将具体实现绑定到抽象契约接口；
3. **在界面处取出**：Compose 中用 \`koinViewModel()\`，Activity 中用 \`by viewModel()\`。

#### Koin 3 种写法极简对照表：

| 核心目标 | ① 编译器插件风格 (4.x 主推) | ② 经典推导风格 (Classic DSL) | ③ 注解驱动风格 (Annotations) |
| :--- | :--- | :--- | :--- |
| **单例定义** | \`single<UserApiImpl>()\` | \`singleOf(::UserApiImpl)\` | \`@Singleton class UserApiImpl\` |
| **绑定接口** | \`single<UserApiImpl>() bind UserApi::class\` | \`singleOf(::UserApiImpl) bind UserApi::class\` | \`@Single(binds = [UserApi::class])\` |
| **注册 ViewModel** | \`viewModel<HomeViewModel>()\` | \`viewModelOf(::HomeViewModel)\` | \`@KoinViewModel class HomeViewModel\` |
| **底层实现机制** | **Kotlin K2 Compiler Plugin**（编译期自动连线） | **Kotlin 构造器函数引用**（运行时推导） | **KSP 代码生成**（类注解驱动） |
| **安全性** | **编译期直接拦截未绑定错误** | 运行时报错（或配合 \`verify()\` 单测） | **编译期直接拦截未绑定错误** |

### 3. 两者结合的组件化完整例子（build-logic + Koin Repository 实战）

在现代化大型工程中，**build-logic 治理构建依赖与插件规范**，**Koin 治理业务对象的依赖倒置（DIP）**。本例以实际项目中最为经典的 **\`Repository（仓储模式）\`** 为核心，贯穿展示“数据源 ➔ 仓储契约 ➔ 仓储实现 ➔ 跨模块 ViewModel 消费 ➔ 壳工程装配”的全链路设计：

\`\`\`text
┌──────────────────────────────┐              ┌──────────────────────────────┐
│       :feature:home          │              │      :feature:user:api       │
│  HomeViewModel               │──(依赖注入)──➔│  UserRepository (接口契约)   │
│       │                      │   (DIP解耦)  │  data class UserProfile      │
│  Compose UI (koinViewModel)  │              └──────────────────────────────┘
└──────────────────────────────┘                             ▲
               │ (模块隔离，无编译依赖)                         │ (实现契约)
               ▼                                             │
┌────────────────────────────────────────────────────────────┴─────────────────┐
│                             :feature:user:impl                               │
│  UserRepositoryImpl (双数据源协调器)                                           │
│    ├── UserRemoteDataSource (网络请求 / Retrofit / Ktor)                     │
│    └── UserLocalDataSource (本地持久化 / Room / DataStore)                    │
│                                                                              │
│  val userModule = module {                                                   │
│      single<UserRepositoryImpl>() bind UserRepository::class // 依赖倒置     │
│      viewModel<UserViewModel>()                              // 模块内自身UI  │
│  }                                                                           │
└──────────────────────────────────────────────────────────────────────────────┘
                                       ▲
                                       │ (聚合依赖)
┌──────────────────────────────────────┴───────────────────────────────────────┐
│                                    :app                                      │
│  MyApplication: startKoin { modules(userModule, homeModule) }                │
└──────────────────────────────────────────────────────────────────────────────┘
\`\`\`

#### 1. 契约定义层（\`:feature:user:api\`）
仅声明数据结构与仓储抽象接口契约，没有任何具体业务与库依赖：
\`\`\`kotlin
// feature/user/api/build.gradle.kts
plugins {
    id("demo.android.feature") // 由 build-logic 统一提供编译与基础库规范
}

// feature/user/api/src/main/kotlin/com/demo/user/api/UserRepository.kt
package com.demo.user.api

import kotlinx.coroutines.flow.Flow

// 核心数据模型
data class UserProfile(
    val id: String,
    val username: String,
    val avatarUrl: String
)

// 仓储接口契约（DIP 核心：高层业务与底层实现均依赖此抽象）
interface UserRepository {
    fun getUserStream(userId: String): Flow<UserProfile>
    suspend fun refreshUser(userId: String): Result<Unit>
}
\`\`\`

#### 2. 业务实现层（\`:feature:user:impl\`）
包含本地与网络双数据源，实现 \`UserRepository\` 接口，并通过 Koin 绑定契约对外暴露：
\`\`\`kotlin
// feature/user/impl/build.gradle.kts
plugins {
    id("demo.android.feature")
}
dependencies {
    implementation(projects.feature.user.api) // 实现契约
}

// feature/user/impl/src/main/kotlin/com/demo/user/impl/data/UserDataSource.kt
package com.demo.user.impl.data

import com.demo.user.api.UserProfile
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.map

// 1. 远程网络数据源（内部实现细节，对外隐蔽）
class UserRemoteDataSource {
    suspend fun fetchUser(userId: String): UserProfile {
        return UserProfile(id = userId, username = "User_\${userId.take(4)}", avatarUrl = "https://...")
    }
}

// 2. 本地缓存/数据库数据源
class UserLocalDataSource {
    private val cache = MutableStateFlow<Map<String, UserProfile>>(emptyMap())

    fun observeUser(userId: String): Flow<UserProfile?> = cache.map { it[userId] }

    suspend fun saveUser(user: UserProfile) {
        cache.value = cache.value + (user.id to user)
    }
}

// feature/user/impl/src/main/kotlin/com/demo/user/impl/data/UserRepositoryImpl.kt
package com.demo.user.impl.data

import com.demo.user.api.UserProfile
import com.demo.user.api.UserRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.filterNotNull

// 3. Repository 实现类：协调 Local 与 Remote 数据源
class UserRepositoryImpl(
    private val remoteDataSource: UserRemoteDataSource,
    private val localDataSource: UserLocalDataSource
) : UserRepository {

    override fun getUserStream(userId: String): Flow<UserProfile> =
        localDataSource.observeUser(userId).filterNotNull()

    override suspend fun refreshUser(userId: String): Result<Unit> = runCatching {
        val user = remoteDataSource.fetchUser(userId)
        localDataSource.saveUser(user)
    }
}

// 4. 用户模块内部自身使用的 ViewModel（例如个人主页）
class UserViewModel(
    private val repository: UserRepository
) : androidx.lifecycle.ViewModel()

// ⚡ 5. Koin 模块装配：对外暴露统一依赖图
val userModule = module {
    // 注册双数据源单例
    single<UserRemoteDataSource>()
    single<UserLocalDataSource>()
    // ⚡ 核心依赖倒置：注册 UserRepositoryImpl 并向上转型绑定为接口 UserRepository
    single<UserRepositoryImpl>() bind UserRepository::class
    // 模块内部 ViewModel
    viewModel<UserViewModel>()
}
\`\`\`

#### 3. 业务消费层（\`:feature:home\`）
首页模块**仅依赖 \`:feature:user:api\`**。ViewModel 直接声明依赖 \`UserRepository\` 接口，无需了解实现细节：
\`\`\`kotlin
// feature/home/build.gradle.kts
plugins {
    id("demo.android.feature")
}
dependencies {
    implementation(projects.feature.user.api) // ⚡ 仅依赖接口契约，编译期物理隔离实现
}

// feature/home/src/main/kotlin/com/demo/home/HomeViewModel.kt
package com.demo.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.demo.user.api.UserProfile
import com.demo.user.api.UserRepository
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import org.koin.dsl.module

// ViewModel 仅面向契约编程，单元测试时极易注入 FakeUserRepository
class HomeViewModel(
    private val userRepository: UserRepository
) : ViewModel() {

    val currentUser: StateFlow<UserProfile?> = userRepository
        .getUserStream("current_user")
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    fun refresh() {
        viewModelScope.launch {
            userRepository.refreshUser("current_user")
        }
    }
}

// 声明 Home 模块的 Koin 依赖
val homeModule = module {
    viewModel<HomeViewModel>() // Koin 自动在全局依赖树中匹配并注入 UserRepository 单例
}

// Compose UI 消费端（零冗余样板代码）
@Composable
fun HomeScreen(viewModel: HomeViewModel = koinViewModel()) {
    val user by viewModel.currentUser.collectAsStateWithLifecycle()
    Text(text = "欢迎回来: \${user?.username ?: \"加载中...\"}")
}
\`\`\`

#### 4. 壳工程装配层（\`:app\`）
在 \`app/build.gradle.kts\` 聚合所有业务实现，并在 \`Application\` 中统一启动整图：
\`\`\`kotlin
// app/build.gradle.kts
dependencies {
    implementation(projects.feature.user.impl)
    implementation(projects.feature.home.impl)
}

// app/src/main/kotlin/com/demo/MyApplication.kt
package com.demo

import android.app.Application
import com.demo.home.homeModule
import com.demo.user.impl.data.userModule
import org.koin.android.ext.koin.androidContext
import org.koin.core.context.startKoin

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidContext(this@MyApplication)
            // 组装所有业务 Module，运行时动态解析依赖
            modules(userModule, homeModule)
        }
    }
}
\`\`\`

### 4. 架构治理收益对照

| 场景 | 传统直连组件化（易出错写法） | 现代 build-logic + Koin DIP（推荐用法） |
| :--- | :--- | :--- |
| **模块构建脚本** | 每个模块重复复制 40+ 行 gradle，升级 compileSdk 需修改数十个文件 | 每个模块仅需 1 行插件 id，修改 \`build-logic\` 全局 1 处立即生效 |
| **跨模块依赖** | \`:home\` 直接 \`implementation(project(":user"))\`，强耦合内部实现 | \`:home\` 仅依赖 \`projects.feature.user.api\`，内部改动对外完全隐蔽 |
| **增量编译耗时** | 修改 \`UserActivity\` 触发依赖它的所有模块全量重新编译 | 修改 \`UserActivity\` 仅增量重编 \`user:impl\`，其他模块秒级跳过（UP-TO-DATE） |
| **循环依赖风险** | 模块多时极易出现 \`A ➔ B ➔ A\` 循环依赖，项目无法编译 | 严格遵循 \`api\` 单向树状依赖，物理目录层彻底杜绝循环依赖 |`,
      },
    ],
    ios: [
      {
        tag: '架构演进',
        title: 'iOS 架构演进史（MVC ➔ VIPER ➔ MVVM）与 TCA 状态机实战',
        explanation: 'iOS 开发同样经历了深度的架构范式转移：从最早 Apple 官方推崇的传统 MVC（被戏称为 Massive View Controller，即控制器兼管网络、布局与代理从而导致单个 VC 膨胀至数千行），到重度拆分 Router/Interactor 的 VIPER，再到引入 Combine / @Observable 驱动的响应式 MVVM。而在声明式 SwiftUI 时代，面对复杂业务与全局状态同步，TCA (The Composable Architecture) 成为了业界最严谨的单向数据流与状态机框架，从根本上保证了状态的可回溯与测试确定性。',
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
        tag: '性能工程',
        title: '移动端性能工程闭环与调优攻坚',
        sectionTitles: {
          explanation: '性能工程全链路与自动化预编译原理',
          diagram: '性能工程主流程与核心工具链闭环映射',
          diagramCaption: '性能调优闭环流向全景图',
        },
        diagram: 'perf-loop',
        explanation: '性能优化绝非零散的技巧堆砌，而是一套严谨的闭环工程（目标 ➔ 测量 ➔ 定位 ➔ 优化 ➔ 验证 ➔ 线上观察 ➔ 持续提升）。Perfetto 作为 Android 官方系统级性能剖析基石，通过 ftrace 抓取内核调度、Choreographer 渲染与主线程 Lock 锁争用；配合 Baseline Profiles 预录制 ART 热点代码实现安装期 AOT 机器码预编译，使应用启动免除 JIT 解释开销，形成从度量到落地的工业级优化闭环。',
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
- **核心机制**：垃圾回收不问「你还想不想要」，只问「从根出发还能不能摸到你」。摸不到的对象才是垃圾。
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
        sectionTitles: {
          explanation: 'ANR 信号捕获原理与 Native 内存度量基石',
          caseStudy: '二、生产级疑难攻坚实战案例（ANR 破案与 Native 泄漏定位）',
        },
        pipeline: [
          { title: 'ANR 触发底座', subtitle: 'AMS 延时超时 ➔ 内核发信号 SIGQUIT (3)', category: 'theory' },
          { title: 'SIGQUIT 信号捕获', subtitle: 'Signal Catcher 机制 ➔ sigaction 链路回传', category: 'engineering' },
          { title: 'Watchdog 双轨检测', subtitle: '主线程退火打点 ➔ 规避误报与假死判定', category: 'engineering' },
          { title: 'Native 内存四维指标', subtitle: 'VSS / RSS / PSS / USS ➔ 虚拟与物理解耦', category: 'theory' },
          { title: 'ASan 与 Profiler 诊断', subtitle: '编译期插桩 ➔ Malloc/Free 调用栈差值追踪', category: 'engineering' },
          { title: 'JNI / 显存缓冲区治理', subtitle: 'HardwareBuffer 泄漏 ➔ RAII 与 Cleaner 保障', category: 'engineering' },
        ],
        explanation: `### 1. ANR 触发底座与超时阈值
- **超时判定矩阵**：InputEvent（按键/触屏输入 5s 未消费完毕）；BroadcastReceiver（前台广播 10s，后台广播 60s）；Service（前台服务 20s，后台服务 200s）；ContentProvider（publish 超时 10s）。
- **AMS 检测原理**：AMS 在向应用主线程分发任务前，在 \`ActivityManagerService\` 的消息队列中投递带延迟的超时检测 \`Message\`；若主线程在限时内处理完毕并通知 AMS，则取消该消息；若超时消息被处理，则确认发生 ANR。

### 2. SIGQUIT 信号与 Signal Catcher 线程
- **系统处理链路**：AMS 确认超时后，向目标应用进程发送 \`SIGQUIT (信号 3)\`。
- **ART 运行时响应**：应用进程初始化时，ART 虚拟机会拉起名为 \`Signal Catcher\` 的守护线程，通过 \`sigwait()\` 阻塞等待 \`SIGQUIT\`。收到信号后，调用 \`ThreadList::Dump()\` 暂停所有 Java 线程（Suspend All），遍历调用栈并生成 \`/data/anr/traces.txt\`（Android 10+ 统一写入系统 DropBox）。

### 3. 工业级线上 ANR 监控 SDK 核心架构
- **非 Java 异常捕获**：\`Thread.setDefaultUncaughtExceptionHandler\` 无法捕获 ANR，必须在 Native 层通过 \`sigaction\` 注册并接管 \`SIGQUIT\` 信号。
- **信号链回传（Signal Chaining）**：SDK 在 Native 抓取完自身堆栈、CPU 负载、Looper 消息历史后，**必须将信号重新递交给系统原有的 Signal Catcher 处理**，否则系统无法生成完整的系统级 ANR 堆栈，破坏系统级排查链路。
- **主线程退火与 Watchdog 心跳双保底**：由于接收到 \`SIGQUIT\` 不一定是本进程 ANR（系统可能向后台多个候选进程广播 Dump 信号），必须结合主线程消息队列心跳（Looper 探针）验证主线程是否卡死，彻底规避假 ANR 告警。

### 4. Native 内存四维指标与隐秘杀手
- **四维内存指标**：\`VSS\`（虚拟耗用内存）➔ \`RSS\`（实际物理占用，含共享库）➔ \`PSS\`（按比例分摊物理内存，核心考量指标）➔ \`USS\`（进程独占物理内存）。
- **Java 堆与 Native 堆脱节**：Android 8.0+ 后 Bitmap 像素内存全面移入 Native 堆。Java 堆即使只占 30MB，如果 Native/显存达到 1GB+，设备依然会遭遇 Linux 内核 LowMemoryKiller (LMK) 瞬间强杀，或者抛出看似由于 Java 无法分配几百字节引发的虚假 OOM。

### 5. Native 内存排查工具矩阵
- **线下诊断首选**：
  - \`AddressSanitizer (ASan / HWASan)\`：Google 官方推荐的编译期插桩工具，毫秒级检测 Native 堆越界（Heap buffer overflow）、野指针访问（Use after free）和内存泄漏。
  - \`Android Studio Profiler (Native Memory)\`：记录每个 \`malloc\` / \`free\` 的调用栈与对象分配时间戳，计算 Allocated - Deallocated 净增长。
- **系统级指标分析**：\`dumpsys meminfo <pkg>\` 重点盯防 \`Native Heap\`、\`Gfx dev\`（显存设备分配）、\`EGL mtrack\`。

### 6. 线上 Native 内存监控：PLT Hook 与 Malloc 追踪
- **线上治理方案**：线上无法使用 ASan（CPU 与内存开销过高），通常采用 Hook 底层 C 库的分配接口（如 \`malloc\`、\`calloc\`、\`mmap\`、\`free\`）。
- **聚合与防爆**：利用 PLT/GOT Hook（如开源的 ByteDance Raphaelite、Tencent Matrix）拦截分配调用，对分配未释放的调用栈进行哈希聚合与内存大头排序，定期回传高危调用链。`,
        caseStudy: `### 疑难案例一：【ANR 破案】主线程“被锁死”——跨线程锁争用与 Binder 穿透背锅

- **现场还原与表象误导**：
  线上 APM 频繁报警，主线程 ANR 调用栈永远指向 \`SharedPreferencesImpl.getString()\` 或一个轻量数据库读取：
  \`\`\`text
  "main" prio=5 tid=1 Blocked
    at android.app.SharedPreferencesImpl.getString(SharedPreferencesImpl.java:240)
    - waiting to lock <0x04f5e718> (a java.lang.Object) held by thread 16
    at com.demo.ui.HomeActivity.onResume(HomeActivity.kt:42)
  \`\`\`
  很多工程师第一反应是“主线程读 SP 导致磁盘 I/O 慢”，甚至将 \`getString()\` 盲目改写到后台协程，但依然频繁触发 ANR。

- **Trace 深度破案**：
  顺藤摸瓜寻找持有互斥锁的 \`thread 16\` 调用栈：
  \`\`\`text
  "Sync-Worker-Thread" prio=5 tid=16 Native
    at android.os.BinderProxy.transactNative(Native Method)
    at android.os.BinderProxy.transact(BinderProxy.java:540)
    at com.demo.account.IAuthService$Stub$Proxy.getRemoteToken(...)
    at com.demo.storage.AccountCache.syncToken(AccountCache.kt:88)
    - locked <0x04f5e718> (a java.lang.Object)
  \`\`\`
  **真相大白**：后台线程 \`tid=16\` 持有了全局锁 \`<0x04f5e718>\`，但在临界区内部，竟然发起了一个跨进程 Binder 调用 \`getRemoteToken()\`！当服务端进程挂起或高负载（响应超过 5 秒）时，该锁长期无法释放；主线程在 \`onResume\` 请求该锁瞬间被阻塞，无辜沦为 ANR“背锅受害者”。

- **工程治理方案**：
  1. **临界区最小化**：严禁在持锁期间（\`synchronized\` / \`ReentrantLock\`）执行任何阻塞式 I/O、网络请求或跨进程 IPC 调用。
  2. **读写分离锁**：改用 \`ReentrantReadWriteLock\`，读操作彼此不互斥，写操作仅在内存赋值微秒级时间内持锁。
  3. **长持锁告警监控**：通过字节码插桩监控主线程持锁等待耗时，超过 500ms 自动抓取持锁线程堆栈上报。

### 疑难案例二：【ANR 破案】CPU 饥饿型假死——主线程处于 RUNNABLE 却超时

- **现场还原与表象误导**：
  ANR trace 中主线程状态赫然显示为 \`RUNNABLE\`，调用栈停留在一个极简单的内存遍历中：
  \`\`\`text
  "main" prio=5 tid=1 Runnable
    at java.util.HashMap.getNode(HashMap.java:572)
    at java.util.HashMap.get(HashMap.java:557)
    at com.demo.feed.FeedAdapter.onBindViewHolder(FeedAdapter.kt:65)
  \`\`\`
  单测运行这段代码只需 0.03ms，排查人员十分困惑：“主线程没死锁、没 I/O、状态还是正在运行，为什么会报 ANR？”

- **Trace 深度破案**：
  翻阅 ANR 日志头部的系统总体 CPU 开销与进程负载：
  \`\`\`text
  CPU usage from 0ms to 5420ms later:
  99% TOTAL: 62% kswapd0 + 22% app_image_decoder + 10% kcompactd0
  CPU usage 400ms to 920ms later:
  100% TOTAL: 70% kswapd0 + 25% app_image_decoder
  \`\`\`
  **真相大白**：
  1. 页面快速滑动时，后台协程池并发发起了 30+ 张高分辨率图片异步解码，多核 CPU 被瞬间压满；
  2. 大量大对象分配使系统可用物理内存瞬间跌破水位线，Linux 内核守护进程 \`kswapd0\` 和 \`kcompactd0\` 疯狂抢占 70% CPU 进行内存压缩（zRAM）与页置换；
  3. 主线程虽然处于 \`RUNNABLE\`（就绪态），但因 CPU 资源完全枯竭，操作系统 Linux 调度器分配给主线程的时间片极度匮乏，导致主线程 5 秒内无法消化完当前 Looper 队列。

- **工程治理方案**：
  1. **线程调度优先级降权**：所有后台并发解码协程/线程池必须显式设置为 \`Process.THREAD_PRIORITY_BACKGROUND\`（nice 值 10），确保 CFS 调度器绝对优先保障主线程。
  2. **并发度与队列限流**：后台计算线程池最大核心线程数严禁超过 \`availableProcessors()\`，拒绝无节制并发。
  3. **复用内存池规避 kswapd**：开启 Bitmap 复用（\`BitmapFactory.Options.inBitmap\`），杜绝瞬时内存大震荡。

### 疑难案例三：【Native 内存泄漏】JNI 跨层图像处理 HardwareBuffer 与 GlobalRef 显存吞噬

- **现场还原与表象误导**：
  App 上线人脸识别滤镜功能后，低端与中端机型频繁发生静默闪退（应用突然消失回到桌面）。Firebase 后台仅记录 \`Application terminated by OS\`（被系统 LMK 强杀）。
  本地使用 LeakCanary 监控，Java 堆始终平稳（稳定在 45MB 左右），没有产生任何 Java 对象的泄漏报警。

- **深度排查与定位路径**：
  1. 执行 \`adb shell dumpsys meminfo <pkg>\` 进行进出页面多轮测试对比：
     \`\`\`text
     测试前（冷启动进入首页）:
     Native Heap:   42,100 KB
     Gfx dev:       11,200 KB
     TOTAL PSS:    108,050 KB

     反复进出人脸滤镜页 10 次后:
     Native Heap:  210,400 KB  (增长 5 倍)
     Gfx dev:      880,300 KB  (激增 80 倍，显存严重爆炸！)
     TOTAL PSS:  1,350,200 KB  (突破 1.3GB，触达整机 LMK 阈值)
     \`\`\`
  2. 启用 Android Studio 的 Native Memory Profiler 抓取 C++ 堆栈，聚焦在 \`libnative_face.so\` 中的 \`processFrame\`。

- **根因剖析与问题代码**：
  在 Native C++ 层，每一帧相机数据回调均通过 \`AHardwareBuffer_allocate()\` 分配了图形缓冲区，并通过 \`env->NewGlobalRef(callback)\` 持有了 Java 回调对象：
  \`\`\`cpp
  // ❌ 存在严重 Native 显存与引用泄漏的代码
  JNIEXPORT void JNICALL Java_com_demo_face_NativeFilter_processFrame(
      JNIEnv* env, jobject thiz, jobject jBitmap, jobject callback) {
      
      AHardwareBuffer* buffer = nullptr;
      AHardwareBuffer_Desc desc = { /* 1080x1920 RGBA_8888 规格 */ };
      AHardwareBuffer_allocate(&desc, &buffer); // ⚡ 分配物理显存约 8.3MB
      
      jobject gCallback = env->NewGlobalRef(callback); // ⚡ 全局强引用未释放
      
      if (checkFaceValid(buffer) != SUCCESS) {
          // 致命缺陷：校验失败提前 return，完全未执行释放！
          // 每秒 30 帧 * 8.3MB = 250MB/s 显存泄漏，极速挤爆 PSS！
          return; 
      }
      
      // 即使正常流程，也缺少 AHardwareBuffer_release(buffer);
  }
  \`\`\`

- **工程治理方案与最佳实践**：
  1. **现代 C++ RAII 智能指针**：使用 \`std::unique_ptr\` 结合自定义 Deleter，保证任何分支退出或异常抛出时显存百分之百自动回收：
     \`\`\`cpp
     // ✅ 使用 RAII 确保显存自动释放
     struct AHardwareBufferDeleter {
         void operator()(AHardwareBuffer* buf) const {
             if (buf) AHardwareBuffer_release(buf);
         }
     };
     using ScopedHardwareBuffer = std::unique_ptr<AHardwareBuffer, AHardwareBufferDeleter>;

     // 使用时：
     ScopedHardwareBuffer bufferWrapper(rawBuffer);
     // 作用域结束时自动调用 AHardwareBuffer_release，坚不可摧
     \`\`\`
  2. **JNI 全局引用配对防御**：严禁随意创建全局引用，必须在生命周期对等的销毁函数中调用 \`env->DeleteGlobalRef(gCallback)\`；或改用 \`NewWeakGlobalRef\` 弱全局引用配合空值判定。
  3. **Java 包装层挂载 Cleaner 兜底**：使用 \`java.lang.ref.Cleaner\`（或低版本 FinalizerDaemon）注册 Native 指针，当 Java 包装壳被 GC 时，在后台线程自动执行底层释放。
  4. **CI 开启 HWASan 门禁**：在 CI 自动化流水线集成 \`AddressSanitizer\`，单元测试与 UI 自动化运行中若发生 Native 泄漏直接阻断合并。`,
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
        title: 'OpenGL ES',
        sectionTitles: {
          pipeline: '渲染管线',
          explanation: 'OpenGL ES 管线与 EGL 底层架构详述',
          caseStudy: '二、实战场景下的疑难问题与破局方案',
        },
        pipeline: [
          { title: '顶点数据 (CPU)', subtitle: 'VBO · VAO · EBO 显存数据绑定', category: 'fixed' },
          { title: '顶点着色器', subtitle: '可编程 ➔ 坐标变换 · MVP 矩阵 · 逐顶点运算', category: 'programmable' },
          { title: '曲面细分 (可选)', subtitle: '可编程 ➔ 控制着色器 · 细分 · 求值着色器', category: 'optional' },
          { title: '几何着色器 (可选)', subtitle: '可编程 ➔ 生成 / 删减图元 · 粒子系统', category: 'optional' },
          { title: '图元装配与裁剪', subtitle: '固定功能 ➔ 点 / 线 / 三角形装配 · 视锥裁剪 · 背面剔除', category: 'fixed' },
          { title: '光栅化', subtitle: '固定功能 ➔ 图元转换为片段 · 属性重心插值', category: 'fixed' },
          { title: '片段着色器', subtitle: '可编程 ➔ 纹理采样 · 光照计算 · 颜色输出', category: 'programmable' },
          { title: '逐片段测试 & 混合', subtitle: '固定功能 ➔ 深度测试 · 模板测试 · Alpha 混合', category: 'fixed' },
          { title: '帧缓冲输出', subtitle: '颜色缓冲 · 深度缓冲 · 呈现与显示', category: 'fixed' },
        ],
        explanation: `### 1. OpenGL ES 现代标准渲染管线（Pipeline）全阶详述
根据现代图形学标准渲染流水线规范，从 CPU 顶点提交到最终帧缓冲输出经历以下核心阶段：

- **阶段一：顶点数据输入（Vertex Data / CPU ➔ GPU）**
  - **核心机制**：通过 **VAO**（顶点数组对象）记录顶点属性指针状态，配合 **VBO**（顶点缓冲对象）将顶点位置、法线、纹理坐标驻留显存，通过 **EBO**（索引缓冲对象）实现索引绘制（\`glDrawElements\`），消减重复顶点传输开销。
- **阶段二：顶点着色器（Vertex Shader，【可编程阶段】）**
  - **核心机制**：接收逐顶点属性，执行坐标空间线性变换：\`gl_Position = Projection * View * Model * vec4(position, 1.0)\`，完成从局部坐标到裁剪空间（Clip Space）的映射。
- **阶段三：曲面细分（Tessellation，【可选 · 可编程阶段】）**
  - **核心机制**：包含细分控制着色器（TCS）与细分求值着色器（TES）。在 OpenGL ES 3.2+ 或扩展支持下，由 GPU 硬件级将粗糙图元动态细分成致密网格，实现高精度地形与平滑位移贴图。
- **阶段四：几何着色器（Geometry Shader，【可选 · 可编程阶段】）**
  - **核心机制**：以整个图元为单位进行操作，能够动态生成新的顶点或删减图元（如点扩充为广告牌面片、实时毛发生成、粒子爆炸系统）。
- **阶段五：图元装配与裁剪·背面剔除（Primitive Assembly & Culling，【固定功能阶段】）**
  - **核心机制**：将顶点组装成点、线或三角形；执行视锥体裁剪（Frustum Clipping），抛弃完全落在视锥体外的图元；执行透视除法（Normalized Device Coordinates，NDC）与面剔除（\`glCullFace\`，剔除背面顺时针/逆时针不可见图元）。
- **阶段六：光栅化（Rasterization，【固定功能阶段】）**
  - **核心机制**：屏幕映射（Viewport 变换）将连续的矢量图元离散化为屏幕像素栅格，生成海量“片元（Fragments）”；在此阶段，顶点属性（颜色、UV 纹理坐标、法线）经过透视校正的**重心坐标线性插值**，生成片元输入属性。
- **阶段七：片段着色器（Fragment / Pixel Shader，【可编程阶段】）**
  - **核心机制**：现代图形渲染最核心的计算工场。执行多级纹理采样（\`texture()\`）、PBR 物理光照计算、LUT 调色、YUV ➔ RGB 转换与美颜磨皮算法，最终输出片元的矢量颜色值（RGBA）。
- **阶段八：逐片段操作与测试混合（Per-Fragment Operations & Blending，【固定功能阶段】）**
  - **核心机制**：
    - **模板测试（Stencil Test）**：根据模板缓冲区掩码决定片元去留（用于轮廓描边、镜像反射）；
    - **深度测试（Depth Test）**：比对当前片元与深度缓冲区的 Z-Buffer 值，遮挡关系判定（Early-Z 硬件可前置加速）；
    - **Alpha 混合（Blending）**：调用 \`glBlendFunc\` 执行透明通道混合计算，将前景片元与帧缓冲已有颜色融合。
- **阶段九：帧缓冲输出（Framebuffer Output）**
  - **核心机制**：写入最终的默认窗口缓冲或自定义 **FBO**（颜色缓冲、深度缓冲、模板缓冲），完成离屏级联渲染或调用 \`eglSwapBuffers\` 呈现给显示设备。

### 2. EGL 状态机核心机制与多线程上下文共享（ShareContext）
- **EGL 纽带角色与线程独占性**：EGL 是 OpenGL ES 与 Android 本地窗口系统（Native Window System）之间的接口桥梁。**OpenGL 本质是强状态机，其执行上下文（EGLContext）在同一时刻只能被单个线程独占绑定**，严禁跨线程并发调用。
- **主从双线程与 ShareContext 架构**：
  - **预览主线程**：持有主 \`EGLContext\` 与 \`EGLWindowSurface\`，专门负责消费最终画面并调用 \`eglSwapBuffers\` 呈现给用户；
  - **后台工作线程**：调用 \`eglCreateContext\` 并传入主 \`EGLContext\` 作为 \`share_context\` 参数，派生出共享上下文。共享上下文允许后台线程自由访问主线程创建的所有纹理、着色器程序与缓冲对象，在后台完成耗时的解码帧上传或离屏滤镜处理，实现主渲染回路 0 掉帧。
- **EGLSurface 三大形态**：
  - \`EGLWindowSurface\`：绑定底层 \`ANativeWindow\`（来自 SurfaceView / SurfaceTexture），用于上屏硬件显示；
  - \`EGLPbufferSurface\`：纯内存离屏像素缓冲区（Pixel Buffer），不绑定任何显示设备，专用于后台离屏静默计算；
  - \`EGLPixmapSurface\`：绑定本地位图的离屏表面（Android 平台极少使用）。

### 3. SurfaceView vs TextureView 硬件加速与图层合成揭秘（兼析 Surface 与 SurfaceTexture 底层机制）
- **Surface 底层本质：跨进程 BufferQueue 的生产者包装句柄**：
  - **跨进程共享内存（GraphicBuffer / AHardwareBuffer）**：\`Surface\` 并不是一块直接存放像素的内存，而是 Native 层 \`ANativeWindow\` 的 Java 包装。它的核心是持有指向 \`BufferQueue\` 的客户端 Binder 句柄。
  - **生产-消费模型**：开发者通过 \`Surface\` 作为**生产者（Producer）**调用 \`lockCanvas\` 或绑定 EGL 作为渲染目标，写入图元后提交；而系统服务端 \`SurfaceFlinger\` 作为**消费者（Consumer）**，在 VSYNC 信号到来时通过硬件合成器（HWC）将各个图层合成送往显示屏。
- **SurfaceTexture 底层本质：将 BufferQueue 输出转换为 OpenGL 外部采样纹理**：
  - **进程内流转闭环**：\`SurfaceTexture\`（配合相机或解码器）将 \`BufferQueue\` 的**消费者（Consumer）端直接收敛在应用进程内部**。
  - **OES 外部纹理映射（GL_TEXTURE_EXTERNAL_OES）**：当相机 CameraX 或硬解码器向其投递帧数据时，\`SurfaceTexture\` 触发 \`onFrameAvailable\` 回调；开发者调用 \`updateTexImage()\`，底层直接通过 EGL 将 GraphicBuffer 零拷贝绑定为当前 OpenGL 上下文中的一张 OES 纹理，并可通过 \`getTransformMatrix()\` 获取坐标矩阵自动校正画面的翻转与旋转。
- **SurfaceView 架构实现（独立 Layer · 极致吞吐）**：
  - **双图层独立挂载**：\`SurfaceView\` 在 View 树里本质上只是一个“镂空的透明占位穿孔（Punch Hole）”。真正的显示是通过 WindowManagerService 在底层创建了一个独立的硬件 \`Surface\`（Layer），Z-Order 默认位于应用主窗口下方（\`Z-below\`）。
  - **SurfaceFlinger 直通合成**：渲染循环完全在后台 GL 线程独立运行，画面直接写入独立 BufferQueue 并由 \`SurfaceFlinger\` 硬件合成，**彻底绕过 View 树的重绘与渲染管线**。
  - **优劣势权衡**：零 View 树 CPU 开销、吞吐率极高、绝不掉帧；但无法跟随父容器做 View 属性动画（平移、缩放、Alpha 渐变），无法与其他普通 View 灵活层叠。
- **TextureView 架构实现（纹理内嵌 · 灵活动画）**：
  - **基于 SurfaceTexture 驱动**：\`TextureView\` 内部持有 \`SurfaceTexture\`，将其生成的 OES 纹理作为该 View 的绘制内容。
  - **RenderThread 统一调度**：应用主线程触发绘制时，\`HardwareRenderer\`（RenderThread）将该 OES 纹理当作一块普通的四边形材质，与其他普通 View 统一参与基于 DisplayList 的渲染树绘制。
  - **优劣势权衡**：天然支持旋转、缩放、透明度混合与复杂层叠；但画面需要经历额外的内存纹理绑定与 View 树合成，延迟额外增加 1~2 帧，且内存占用和发热量明显高于 SurfaceView。`,
        caseStudy: `### 实战问题一：后台子线程处理滤镜，主线程渲染报 EGL_BAD_ACCESS 崩溃或纹理纯黑

**业务场景痛点**：
在相机多级美颜滤镜或短视频导出流水线中，开发者常尝试开辟子线程执行复杂 Shader 渲染以避免阻塞主预览。若子线程直接操作主线程的 \`EGLContext\`，EGL 驱动会立即抛出 \`EGL_BAD_ACCESS\` 甚至导致底层崩溃。部分开发者虽然通过 \`share_context\` 创建了共享上下文，但在子线程刚执行完 \`glDrawArrays\` 的瞬间，主线程就立即在屏幕上使用该纹理，由于 GPU 内部指令执行具有异步乱序特性，主线程读取到未着色完毕的残缺数据，导致画面频繁闪烁绿屏或黑屏。

**破局解决方案（EGL 共享上下文 + 硬件级 GPU 同步栅栏 FenceSync）**：
1. **严格派生 ShareContext**：子线程初始化 EGL 时，通过 \`eglCreateContext(display, config, mainEglContext, attribs, 0)\` 构建与主渲染上下文共享的子 Context，且各自在专属线程调用 \`eglMakeCurrent\`；
2. **GPU 硬件同步栅栏（glFenceSync）替代低效 CPU 线程锁**：
   - 子线程完成 FBO 滤镜渲染后，向 GPU 指令流插入一条硬件栅栏：\`val sync = glFenceSync(GL_SYNC_GPU_COMMANDS_COMPLETE, 0)\`，并调用 \`glFlush()\` 强行推入驱动；
   - 将该 \`sync\` 句柄传递给主线程，主线程在绑定该纹理渲染前调用 \`glWaitSync(sync, 0, GL_TIMEOUT_IGNORED)\`；
   - 核心优势：**等待动作完全由 GPU 内部调度器硬件级执行，CPU 线程零卡顿、无需阻塞等待**，纹理渲染完毕瞬间 GPU 自动放行下一道工序，彻底消除时序竞争闪烁。

### 实战问题二：Activity 旋转或切后台瞬间，SurfaceView 抛 EGL_BAD_SURFACE 崩溃

**业务场景痛点**：
当用户旋转屏幕、锁屏或按下 Home 键退入后台时，系统会迅速回调 \`SurfaceHolder.Callback.surfaceDestroyed()\` 销毁底层的 WindowSurface。如果后台 GL 渲染线程仍在独立死循环执行 \`eglSwapBuffers\`，向一个已被系统底层释放的 \`ANativeWindow\` 写入缓冲，EGL 会立即抛出 \`EGL_BAD_SURFACE\` 或触发底层 SIGSEGV 致命信号闪退。

**破局解决方案（基于 Surface 生命周期同步屏障的状态机）**：
1. **解绑同步屏障**：在 \`surfaceDestroyed()\` 触发时，**主线程必须通过同步锁或协程通道阻塞等待渲染线程执行解绑**；
2. **优雅销毁 Surface**：渲染线程接收到销毁信号后，立即调用 \`EGL14.eglMakeCurrent(display, EGL_NO_SURFACE, EGL_NO_SURFACE, EGL_NO_CONTEXT)\` 解除所有关联，并调用 \`eglDestroySurface\` 释放原有的 WindowSurface；
3. **保留 Context 热备**：销毁过程中**切勿销毁 EGLContext**，保留编译好的 Shader、加载好的纹理与 FBO 显存数据；
4. **重建迅速恢复**：当 Activity 重新可见并触发 \`surfaceCreated()\` 时，传入全新的 \`SurfaceHolder.surface\` 快速重建 \`eglCreateWindowSurface\`，以 0 毫秒重建延迟瞬间恢复上一帧画面，避免白屏与闪烁。

### 实战问题三：高帧率视频录制/人脸检测时 glReadPixels 导致主线程断崖式掉帧（20ms+ 阻塞）

**业务场景痛点**：
在实时视频录制、直播推流或 AI 人脸关键点检测中，需要将 GPU 渲染出的美颜纹理提取到 CPU 内存（\`byte[]\` 或 \`ByteBuffer\`）供 MediaCodec 编码或 AI 推理。传统做法是调用 \`glReadPixels\`，该 API 具有强制同步屏障特性，会强制 CPU 等待 GPU 管线中的所有渲染任务执行完毕并阻塞搬运内存，在 1080P 分辨率下耗时高达 20~40ms，导致画面帧率直接从 60fps 暴跌至 15fps 严重卡顿。

**破局解决方案（双 PBO 异步乒乓 DMA 回读 + HardwareBuffer 零拷贝）**：
1. **双 PBO（Pixel Buffer Object）异步乒乓回读**：
   - 创建两块 PBO（\`pboA\` 与 \`pboB\`），利用 GPU 的 DMA（直接内存存取）机制异步传输；
   - 第 N 帧：绑定 \`pboA\` 执行 \`glReadPixels\`，由于目标是 GPU 内部缓冲，函数立即返回（耗时 < 0.2ms），GPU 在后台默默搬运；
   - 此时 CPU 绑定 \`pboB\`，调用 \`glMapBufferRange\` 映射提取第 N-1 帧已搬运好的像素数据；
   - 下一帧交换两者角色（Ping-Pong），CPU 与 GPU 彻底实现并行流水线，将阻塞耗时降至近乎零感知。
2. **Android 8.0+ 终极利器：HardwareBuffer / AHardwareBuffer 零拷贝**：
   - 直接通过 \`AHardwareBuffer_allocate\` 申请图形内存，将其映射为 EGLClientBuffer 绑定到纹理；
   - 编码器与 AI 模型直接共享同一块物理内存句柄，彻底杜绝数据在 CPU 与 GPU 之间的冗余拷贝。

### 实战问题四：反复进出相机或滤镜页面导致显存爆炸（Native GL 资源泄漏）

**业务场景痛点**：
Java 层的垃圾收集器（GC）只能监控 Java 包装对象的内存引用，对 GPU 显存（VRAM）内部占用的纹理材质、FBO、VBO 及着色器程序（Program）完全不可见。开发者在 Activity 销毁时若仅将 Java 对象置空，GPU 内部显存并不会自动释放。高频反复打开关闭页面 5~10 次后，系统显存被占满，再次调用 \`glGenTextures\` 或 \`glTexImage2D\` 时抛出 \`GL_OUT_OF_MEMORY\`，导致新画面黑屏或触发 OOM 杀进程。

**破局解决方案（显存生命周期引用计数与线程级严苛回收中台）**：
1. **显存回收的严苛线程限制**：必须牢记：**所有 \`glDeleteXxx\` 函数必须在拥有该资源的 EGLContext 绑定线程中执行**。若在普通主线程直接异步调用 \`glDeleteTextures\`，指令由于没有上下文上下文而静默丢失，显存依然处于泄漏状态；
2. **显存资源包装器（AutoCloseable + 引用计数）**：
   - 将每个 Texture、FBO、VBO 封装为显存句柄类，记录引用计数器与分配时的时间戳；
   - 页面销毁时，向 GL 渲染线程排入显式清理事务：按序调用 \`glDeleteTextures\`、\`glDeleteFramebuffers\`、\`glDeleteBuffers\`、\`glDeleteProgram\`；
   - 最后解绑并调用 \`eglDestroyContext\` 与 \`eglTerminate\` 彻底归还 EGL 驱动资源，确保显存水位在进出页面后恢复平稳基线。

### 实战问题五：带透明通道的水印/贴纸贴图渲染出现发暗、毛刺或黑边（Alpha 混合混乱）

**业务场景痛点**：
在美颜贴纸、视频文字水印叠加渲染时，经常发现包含半透明边缘（羽化效果、阴影渐变）的 PNG 贴图贴在视频背景上后，边缘出现一圈明显的黑色脏边，或者整体半透明区域颜色变灰发暗，视觉质感极为粗糙。

**破局解决方案（预乘透明度 Premultiplied Alpha 统一校正）**：
1. **问题成因深度剖析**：
   - 传统默认混合模式为：\`glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA)\`；
   - 若加载解码 PNG 位图时，BitmapFactory 默认输出了已经过预乘的像素数据（即 RGB 分量已经预先乘过了 Alpha）：\`RGB = OriginalRGB * Alpha\`；
   - 当再次应用默认混合公式时，源颜色被连续乘了两次 Alpha，导致边缘亮度过度衰减，呈现出一圈黑边。
2. **标准破局落地**：
   - **方案 A（预乘管线，推荐最高效）**：图片解码保持预乘格式，将混合模式配置为：\`glBlendFunc(GL_ONE, GL_ONE_MINUS_SRC_ALPHA)\`，源颜色直接累加，混合边缘平滑通透无瑕疵；
   - **方案 B（Shader 动态校正）**：在 Fragment Shader 纹理采样后，显式校验贴图格式并解耦 Alpha 计算：\`color.rgb = textureColor.rgb * textureColor.a\`，统一整套特效管线的色彩空间与数学模型。`,
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
        sectionTitles: {
          pipeline: '支付流程',
          explanation: '支付流转全生命周期详述',
          caseStudy: '二、实战场景下的疑难问题与破局方案',
        },
        pipeline: [
          { title: '控制台配置', subtitle: 'Console 登记 Product ID、BasePlan 与全球价格体系', category: 'engineering' },
          { title: '中台动态下发', subtitle: '中台下发售卖矩阵与商品类型 (SUBS / 消耗 / 非消耗)', category: 'engineering' },
          { title: '连接与查价', subtitle: 'startConnection ➔ 通过商品 ID 查询真实价格与 OfferToken', category: 'engineering' },
          { title: '调起支付', subtitle: '抢占原子互斥锁 ➔ launchBillingFlow 唤起收银台', category: 'engineering' },
          { title: '支付结果', subtitle: 'PurchasesUpdatedListener ➔ PENDING 挂起 / PURCHASED 成功', category: 'engineering' },
          { title: '验单与记账', subtitle: '服务端 Developer API 验签 ➔ 写入 ConsumableLedger 账本', category: 'engineering' },
          { title: '发货与终态闭环', subtitle: '业务履约发货 ➔ acknowledge / consume 闭环擦除账本', category: 'engineering' },
        ],
        explanation: `### 1. 官方配置源头：Google Play Console 配置商品与价格体系
- **商品注册与分类**：在 Google Play Console 登记商品 ID，明确划分为订阅（SUBS）、单次消耗型商品（Consumable）以及永久非消耗型商品（Non-Consumable）。
- **三级定价结构**：订阅体系基于 \`BasePlan\`（月度/年度等计费周期）与 \`Offer\`（新客折扣/免费试用）组织，生成唯一合法且具备生命周期的 \`offerToken\`。
- **全球价格托管**：Google 托管全球 170+ 国家本地化基准汇率、税费换算与多币种价格矩阵，作为所有端侧与中台价格计算的权威官方源头。

### 2. 商业化中台动态下发：对应配置的商品信息（商品 ID、商品类型）
- **商品配置矩阵下发**：商业化中台服务端结合当前用户画像、国家地域、AB 实验策略，动态下发当前场景售卖的商品 ID 列表与促销角标标签。
- **三分法商品类型注入**：中台明确返回每个商品 ID 对应的类型字典（订阅 / 消耗品 / 非消耗品），供客户端 PayKit 在后续确认链路中精准路由执行 \`acknowledge\` 还是 \`consume\`。
- **离线网络防御机制**：若用户处于无网、弱网或商业化接口报错，PayKit 自动退避降级读取本地预置的 JSON/Assets 兜底配置，确保页面收银台高可用。

### 3. 客户端连接与查价：连接设备 Google Play 并通过商品 ID 获取详细信息（价格体系）
- **建立底层服务通信**：PayKit 调用 \`startConnection\` 绑定用户设备底层的 Google Play 商店系统级进程（通过 AIDL IPC 通信），连接成功方可发起通信。
- **动态拉取设备端价格**：调用 \`queryProductDetailsAsync\` 传入中台下发的商品 ID 列表，实时查询用户设备当前绑定的 Google 账号在对应国家地区的真实购买价格。
- **提取格式化货币与 OfferToken**：解析返回的 \`ProductDetails\` 实体，提取格式化价格字符串（如 \`$4.99\`、\`¥30.00\`）直接用于 UI 展示，并缓存当前生效方案的合法 \`offerToken\`。

### 4. 发起支付与防重调起：Client PayKit 抢占原子互斥锁 ➔ launchBillingFlow
- **全局原子购买互斥锁**：调用 \`purchase()\` 前必须先抢占原子互斥锁（\`PURCHASE_IN_PROGRESS\`），严防用户快速双击或狂点按钮导致并发唤起两次官方收银台。
- **构建调起参数**：从缓存的 \`ProductDetails\` 中装配选中的 \`offerToken\`，并注入基于用户账户生成的防混淆 ID（\`obfuscatedAccountId\`）用于防作弊防刷。
- **唤起系统半屏收银台**：调用 \`BillingClient.launchBillingFlow\` 拉起系统级半屏支付界面，用户在该界面选卡、输入密码或进行生物识别扣款。

### 5. 支付结果监听与状态分流：Google Play IPC 回调 ➔ PurchasesUpdatedListener
- **系统级结果监听**：通过 \`PurchasesUpdatedListener\` 接收 Google Play 进程异步派发回应用的 \`Purchase\` 结果实体。
- **状态精准三向分流**：
  - \`PENDING\`（延迟付款）：用户选择了便利店现金支付或触发了家长审批，**铁律守则：绝对禁止提前发货**，进入挂起等待态；
  - \`PURCHASED\`（扣款成功）：款项已真实扣除，提取订单核心凭证 \`purchaseToken\` 与 \`orderId\` 进入下一阶段验单；
  - \`USER_CANCELED\` / 支付异常：立即释放全局互斥锁，向用户展示友好提示并安全终止支付状态机。

### 6. 服务端安全验签与账本落盘：Client ➔ Developer API 核验真实性 ➔ ConsumableLedger
- **服务端安全验签**：客户端将 \`purchaseToken\`、\`orderId\` 及用户凭据上传至自建业务后端，后端直接请求 Google Play Developer API 进行官方双向核验，彻底拦截客户端本地作弊与重放伪造。
- **消耗品入账落盘**：对于消耗型商品，在执行任何发货与充值操作前，**客户端/服务端必须先将订单持久化写入 \`ConsumableLedger\` 履约账本**（标记为“已发货待 Consume”），彻底杜绝两阶段提交中的掉单死结。

### 7. 业务发货与终态确认闭环：Fulfillment 发货 ➔ Acknowledge / Consume 擦除账本
- **业务履约与权益快照**：业务系统为用户充值虚拟币或发放会员特权，并同步刷新持久化到本地的 \`DeviceCache\`，保障用户在后续离线断网环境下依然享有 0 毫秒 VIP 秒开体验。
- **订阅与非消耗品确认**：调用 \`acknowledgePurchase\` 标记订单最终完成。Google 规定 3 天内未确认的订单将被官方强制退款并废除。
- **消耗品核销出库**：调用 \`consumePurchase\` 释放该商品拥有权，使得用户能够立即再次购买；消费成功回调后，立即从 \`ConsumableLedger\` 履约账本中擦除记录，最后释放全局购买互斥锁。`,
        caseStudy: `### 实战问题一：用户扣款成功但发货瞬间断网/闪退，导致“掉单投诉”或“重复发货被薅羊毛”

**业务场景痛点**：
用户在 Google 收银台完成信用卡付款后，App 成功收到了 \`PURCHASED\` 回调。但当业务系统刚给用户充值了 100 钻石，正准备向 Google Play 发起 \`consumePurchase\` 的几百毫秒内，用户手机突然进电梯断网，或者进程被系统 OOM 强杀。
- **两难死结**：当用户重新打开 App 时，Google Play 依然记录该订单为“未消费（Unconsumed）”：
  - 如果 App 无脑补发货：用户就白嫖到了 200 钻石，遭遇黑产利用飞行模式或断网脚本恶意卡单刷币；
  - 如果 App 不发货直接调用 consume：万一上次因为网络超时或服务端数据库死锁根本没发货成功，用户就会发生“扣了钱却没给货”，引发 Play 商店一星差评与官方争议退款。

**破局解决方案（ConsumableLedger 本地持久化履约账本）**：
将本地“业务发货”与 Google“消费确认”拆解为带持久化状态机的两阶段事务：
1. **记账优先**：收到支付成功且服务端验签通过后，**必须先在本地数据库写入 \`ConsumableLedger\` 账本**，状态置为 \`DELIVERED_PENDING_CONSUME\`（已发货待核销），主键为 \`purchaseToken\`；
2. **执行业务发货**：服务端发货成功后，立即向 Google Play 发起 \`consumePurchase\`；
3. **消费成功出账**：收到 Google 消费成功回调后，从 \`ConsumableLedger\` 中彻底物理擦除该笔记录；
4. **自愈补单分流**：下次冷启动或网络恢复扫单时：
   - 若未消费订单**已存在于账本中**：判定为“已成功发过货，仅当时断网未消费成功”，**严禁重复发货，仅补偿重试 \`consumePurchase\`**；
   - 若未消费订单**不存在于账本中**：判定为全新掉单，走完整发货流程并写入账本。

### 实战问题二：弱网与异步环境下丢单，用户付款后长时间无法获取权益

**业务场景痛点**：
现实网络环境中，用户经常在弱网（地下车库、高铁信号切换）或开启了系统多任务切换的情况下完成支付。系统广播或 IPC 回调可能会延迟甚至由于进程短暂死亡而未能送达当前界面的监听器，造成用户在购买成功后界面一直停留在转圈加载状态。

**破局解决方案（多切面主动自愈与全方位兜底扫描矩阵）**：
不能仅依赖单次支付时的 \`PurchasesUpdatedListener\`，必须在应用的核心生命周期节点构建自动化自愈扫描网络：
1. **冷启动首屏恢复**：在 Application 初始化或进入主页时，\`startConnection\` 成功后立即静默并行触发 \`queryPurchasesAsync(SUBS)\` 和 \`queryPurchasesAsync(INAPP)\`，排查所有滞留历史订单；
2. **前后台切换对齐**：监听 \`ProcessLifecycleOwner.onResume\`，当用户由后台切回前台时，加设 30 秒防抖间隔，静默核验是否有在系统商店后台续费或挂起成功的订单；
3. **网络连通性广播监听**：通过 \`ConnectivityManager\` 注册网络状态回调，当监听到从 \`DISCONNECTED\` 恢复为 \`CONNECTED\` 时，自动唤醒账本重试队列，向 Google 发送未核销消费请求；
4. **UI 显式恢复入口**：在会员中心或设置页常驻“恢复购买（Restore Purchases）”按钮，为用户提供显式主动同步的交互兜底。

### 实战问题三：用户设备上 Google Play 商店后台被杀或自更新，调起支付报断连崩溃

**业务场景痛点**：
Google Play 商店是系统级独立 App，客户端通过 AIDL Binder IPC 与之通信。在低端机或部分深度定制 ROM 上，Play 服务经常被系统省电策略后台强杀，或者 Play 商店正在后台自我静默升级。此时客户端会突发收到 \`onBillingServiceDisconnected\`。若开发者处理不当，直接在断开回调中无脑递归调用 \`startConnection\`，会导致死循环打满 CPU；若不作处理，用户点击购买按钮时就会直接抛出 \`IllegalStateException: BillingClient is not ready\` 导致购买失败或 App 闪退。

**破局解决方案（IPC 连接状态机与指数退避断线重连）**：
1. **指数退避重连机制**：在收到 \`onBillingServiceDisconnected\` 时，严禁立即重连，采用带抖动的指数退避算法：1s ➔ 2s ➔ 4s ➔ 8s ... 最大封顶 32s 尝试静默重新绑定服务；
2. **前台业务强制打断**：如果用户在前台主动点击了购买按钮，直接打断后台的退避等待计时器，立即执行高优先级重新连接，并在连接成功的回调中无缝继续拉起收银台；
3. **连接保护层封装**：在调用所有 Billing API（如查询详情、拉起购买）前统一经过 \`executeServiceRequest\` 包装，若检测到尚未连接则自动排入挂起队列，待连接建立后自动按序消费。

### 实战问题四：用户快速狂点购买按钮，触发重复拉起收银台与状态机异常

**业务场景痛点**：
在收银台弹窗拉起存在几十到几百毫秒 IPC 耗时的空隙，着急的用户或按键脚本会快速狂点支付按钮。如果客户端没有做严格的防重控制，多次向 BillingClient 连续发起 \`launchBillingFlow\`，会导致底层 AIDL 事务通道冲突，控制台抛出 \`DEVELOPER_ERROR\`，甚至在某些版本上引发双重弹窗与二次扣款，严重影响品牌体验。

**破局解决方案（全局原子购买互斥锁 Purchase In Progress Lock）**：
1. **全局原子锁抢占**：在支付门面单例层维护全局原子状态（如 \`AtomicBoolean\` 或协程互斥锁 \`Mutex\`）。用户点击购买按钮后，首个请求先原子 CAS 抢占锁（置为 \`PURCHASE_IN_PROGRESS\`），后续并发点击全部直接拦截并返回“支付正在处理中，请勿重复操作”；
2. **终态安全释放释放保证**：购买锁的释放必须覆盖全部分支出口：
   - 收到 \`onPurchasesUpdated\` 并且所有订单完成分流后释放；
   - 用户在系统收银台按返回键取消（\`USER_CANCELED\`）时立即释放；
   - 发生网络断开、超时或底层报错时安全释放，避免锁死导致后续无法再次购买。

### 实战问题五：黑产逆向客户端篡改签名伪造购买，遭遇盗刷白嫖风险

**业务场景痛点**：
Android 客户端属于不可信环境。黑产攻击者常利用 Frida 动态 Hook、Xposed 框架或注入二次打包工具（如 LuckyPatcher），在客户端内存中篡改 \`PurchasesUpdatedListener\` 回调参数，伪造带有有效公钥签名的虚假 \`Purchase\` 实体。如果客户端仅在本地校验公钥签名（Base64 RSA Verify）就直接在端侧执行发货和给用户充值，业务将遭受严重的无成本虚假充值白嫖。

**破局解决方案（服务端双向验签与全链路风控防御）**：
1. **废弃纯本地发货模式**：客户端在收到 \`PURCHASED\` 回调后，**绝对不直接在本地做最终发货决策**；
2. **上报关键凭证**：客户端仅将 \`purchaseToken\`、\`orderId\` 以及发起购买时绑定的防篡改用户混淆 ID（\`obfuscatedAccountId\`）安全上传到自建业务后端；
3. **服务端对接官方权威 API**：后端使用 Google Cloud IAM 服务账号凭据，调用官方 REST API：\`Google Play Developer API\`（\`purchases.subscriptionsv2.get\` 或 \`purchases.products.get\`）；
4. **深度核验三项关键数据**：
   - **真实扣款状态**：确认 \`paymentState\` 为已扣款；
   - **商品与账号归属**：比对返回的 \`obfuscatedExternalAccountId\` 是否与当前请求发货的登录用户一致，防止黑产拿别人真实的 purchaseToken 跨账号重复兑换；
   - **防重放防并发**：数据库记录该 \`purchaseToken\` 是否已完成过核销发货，严防重放攻击。验证全部通过后，由服务端执行业务发货并调用官方接口完成确认。`,
      },
      {
        tag: '变现与合规',
        title: 'AdMob / MAX 广告聚合竞价与 GDPR CMP 隐私合规弹窗',
        sectionTitles: {
          pipeline: '广告链路',
          explanation: '聚合变现与合规全生命周期详述',
          caseStudy: '二、实战场景下的疑难问题与破局方案',
        },
        pipeline: [
          { title: 'UMP合规检测', subtitle: 'requestConsentInfoUpdate ➔ 判断地理围栏与授权状态', category: 'engineering' },
          { title: 'CMP授权收集', subtitle: 'loadAndShowConsentForm ➔ 用户授权/拒绝 ➔ 写入 TCF 字符串', category: 'engineering' },
          { title: '门禁安全初始化', subtitle: 'canRequestAds() 校验通过 ➔ 延迟并发初始化 MobileAds / MAX', category: 'engineering' },
          { title: '实时竞价与分发', subtitle: 'Header Bidding 并行暗标出价 ➔ 瀑布流 Waterfall 兜底兜底', category: 'engineering' },
          { title: '双缓冲预加载', subtitle: '提前预载高价值广告位 ➔ 频控与场景展示门禁校验', category: 'engineering' },
          { title: '收益归因回传', subtitle: 'ILRD 纳秒级收益捕获 ➔ 联动 AppsFlyer / Adjust 精算 ROAS', category: 'engineering' },
        ],
        explanation: `### 1. 官方合规门禁：Google UMP 与 IAB TCF v2.2 规范
- **全球隐私法规约束**：针对欧盟与欧洲经济区（EEA）、英国及瑞士用户，Google 强制推行 IAB Europe 透明度与知情同意框架（TCF v2.2）。未通过 Google 认证的 CMP 收集用户同意的流量将被限制广告请求，直接导致 eCPM 暴跌或 App 下架。
- **动态地理围栏识别**：通过 \`UserMessagingPlatform.getConsentInformation(context)\` 发起 \`requestConsentInfoUpdate\`，底层自动结合 IP 和蜂窝网络判断当前用户是否处于受监管区域（EEA/UK）。处于监管区返回 \`REQUIRED\`，非监管区则返回 \`NOT_REQUIRED\` 并静默放行。
- **TCF 规范与本地持久化**：用户做出选择后，UMP SDK 自动将合规数据解析为 TCF v2.2 标准键值（如 \`IABTCF_TCString\`、\`IABTCF_PurposeConsents\`）直接落盘到应用的 \`SharedPreferences\` 中，所有遵守 IAB 协议的第三方广告 SDK 均可跨库直接读取。

### 2. 现代聚合竞价机制：从传统 Waterfall 演进至 Header Bidding
- **传统瀑布流（Waterfall）痛点**：由服务端预先配置阶梯底价（Floor Price），客户端自顶向下串行询问 Ad Network。存在网络延迟累加、高价广告无法实时竞争、“首位胜出但并非最高价”的严重收益漏损。
- **实时头部竞价（In-App Header Bidding）**：
  - 当触发广告加载时，聚合中台（AdMob Mediation / AppLovin MAX）同时向所有支持 Bidding 的买方（Meta Audience Network, Mintegral, Unity, Pangle, Google 等）并发广播询价请求；
  - 各广告网络在限定时间内（通常 300~500ms）返回实时加密竞价暗标（Bid Token 与 Price）；
  - 聚合器以最高出价者（Highest Bidder）作为基准，若存在传统 Waterfall 节点，则仅当 Waterfall 出价高于最高 Bidding 时才尝试加载，确保每次曝光均实现 eCPM 最大化。

### 3. 精细化商业化闭环：ILRD 收益捕获与 LTV/ROAS 动态归因
- **展示级收益数据（Impression-Level Revenue Data）**：
  - 现代聚合平台提供纳秒级粒度的展示收益回调（MAX 的 \`onAdRevenuePaid\`、AdMob 的 \`OnPaidEventListener\`）；
  - 每次广告完整曝光时，客户端捕获到精确的微美元收益（\`valueMicros / 10^6\`）、货币代码（如 \`USD\`）、网络来源（NetworkName）及广告位 ID。
- **全链路商业化闭环**：
  - 客户端将 ILRD 数据实时打包，通过 SDK 回传至第三方归因平台（AppsFlyer / Adjust / Singular）；
  - 归因中台实时计算每批次买量用户产生的广告变现价值，实现按渠道、按素材级别的 **D0/D7 ROAS 精准回传**，为买量算法提供精准调优反馈。`,
        caseStudy: `### 实战问题一：未获取 Consent 提前初始化广告 SDK，导致触发 Google Play 严重违规与限流

**业务场景痛点**：
许多开发者习惯在 \`Application.onCreate\` 中直接调用 \`MobileAds.initialize()\` 或 \`AppLovinSdk.initializeSdk()\`。欧洲新用户首次安装打开 App 时，广告 SDK 已在后台悄悄采集了 Android 广告 ID（AAID）并向服务器发送了设备追踪信令。Google 自动化合规探测器一旦检测到在用户点击 Consent 弹窗前就存在网络跟踪行为，会直接下发“违反用户隐私与家族政策”的红线警告，轻则欧洲全区流量填充率归零（No Fill），重则面临下架下架或被欧盟 GDPR 监管调查。

**破局解决方案（门禁拦截器 AdInitGatekeeper）**：
严格建立基于响应式状态机的“广告门禁中控器”：
1. **启动强行拦截**：在 Application 阶段，**绝对禁止直接初始化任何广告与买量归因 SDK**；
2. **UMP 异步收集**：首屏 Activity 启动时调用 \`requestConsentInfoUpdate\`，若需要弹窗则调用 \`loadAndShowConsentFormIfRequired\`；
3. **状态严密校验**：在弹窗回调结束后，严密校验 \`consentInformation.canRequestAds()\`：
   - **允许广告**：门禁放行，并发异步拉起 \`MobileAds\` 与 \`AppLovinSdk\` 初始化线程；
   - **用户拒绝授权**：严禁加载个性化广告，配置 AdRequest 参数携带 \`npa=1\`（Non-personalized ads）或降级为完全受限的有限广告（Limited Ads），避免采集任何用户设备唯一标识符。

### 实战问题二：首屏拉取 CMP 弹窗耗时过长，导致开屏/首页广告曝光率断崖式缩水

**业务场景痛点**：
UMP 首次网络请求检测需要与 Google 服务器握手，在欧洲网络较差或用户使用跨国漫游时，弹窗准备耗时可能长达 2~4 秒。如果首屏必须等 CMP 弹窗关掉后再去加载开屏广告（App Open Ad），极高比例的用户会直接滑过启动页进入内容，导致首屏开屏广告展示率（Impression Rate）暴跌 40% 以上，严重影响首屏这一 eCPM 最高价值位的收益。

**破局解决方案（TCF 本地快照预判 + 双轨异步预热）**：
1. **次日留存用户零延迟**：由于 UMP 会将 TCF 字符串写入本地 SharedPreferences，对于非首次安装的用户，在冷启动第一行代码直接通过静态工具类快速核验本地是否有历史合法授权（非初次用户直接放行并并行预加载广告，完全省去网络握手等待）；
2. **首屏首次启动容忍限时策略**：针对初次安装的用户，为开屏广告设置带超时的等待屏障（如最多等待 2.5 秒）。若 UMP 成功返回并在限时内获取到广告则直接展示；若超时则果断放弃首屏展示并进入主页面，坚决不让合规弹窗劣化 App 的首屏冷启动体验（Cold Start Time）。

### 实战问题三：开屏广告（App Open Ad）在前后台切换时误弹，打断收银台付款等敏感流程

**业务场景痛点**：
开屏广告通常依托 \`ProcessLifecycleOwner\` 监听 \`ON_START\`。当用户在前台使用 App 时，因接收短信验证码、跳转 Google Play 官方收银台输入银行卡密码、或使用三方授权登录等场景短暂切出应用再切回时，开屏广告突然弹窗霸屏阻断了用户视线，不仅破坏用户正在进行的支付动作导致弃购掉单，更容易触发 Google 关于“干扰正常交互意图 / 欺骗点击”的违规警告。

**破局解决方案（场景黑名单 + 智能冷却时间窗口）**：
1. **敏感页面黑名单机制**：维护全局当前前台 Activity 观察者。凡在支付收银台（CheckoutActivity）、视频播放器全屏态（PlayerActivity）、或登录注册引导流中，开屏广告管理器坚决拦截展示；
2. **展示频控与冷却时间戳（Show Throttle）**：
   - 为开屏广告增加全局冷却时钟（如单次成功展示后，至少 4 小时内禁止再次通过前后台切换触发）；
   - 记录每次切出时间：若用户切出后台不足 15 秒（明显属于看验证码或系统授权），判定为瞬态切回，不触发开屏广告。

### 实战问题四：用户点击“激励视频翻倍”时现场拉取网络，导致展示失败或弹窗卡死

**业务场景痛点**：
部分业务逻辑在用户通关并点击“观看视频获得 2 倍奖励”按钮时，才现场调用 \`rewardedAd.load()\`。由于出海跨国网络波动，激励视频包含大体积 MP4 素材，现场缓冲往往耗时 3~5 秒甚至超时，用户等得不耐烦直接点击跳过，白白浪费了高转化意向的高价值曝光机会。

**破局解决方案（双缓冲预加载池 Dual-Buffer Preload）**：
1. **常驻单例就绪态**：建立全局 \`RewardedAdPool\`，在应用启动完成初始化后立即静默后台预加载 1 支最优竞价激励视频；
2. **展示与加载闭环解耦**：用户点击按钮时直接调用 \`isReady()\`：
   - 若已就绪：0 毫秒瞬间拉起全屏视频，保证用户极致流畅体验；
   - 若未就绪：降级展示轻量进度条，并限定 1.5 秒兜底超时；
3. **关闭后自动补位**：在激励视频关闭回调 \`onAdDismissedFullScreenContent\` 或加载失败回调中，立即异步触发下一条的预拉取，保证池中始终有可随时调起的鲜活物料。

### 实战问题五：不同聚合网络（MAX vs AdMob）依赖冲突导致崩溃与包体积失控

**业务场景痛点**：
在集成 MAX 或 AdMob 时，需要引入数十家三方广告网络的 Adapter（如 Meta, Mintegral, Vungle, Unity, InMobi 等）。各家 SDK 内部依赖的 Google Play Services、Kotlin 协程库版本参差不齐，容易引发编译期 DexMerge 冲突或运行时 \`NoSuchMethodError\` 崩溃。同时，引入过多非 Bidding 的低效 Waterfall Adapter 会导致包体积（AAB）徒增 30MB+，导致商店转化率严重下滑。

**破局解决方案（Bidding 优先精简法则 + Gradle 依赖防冲突约束）**：
1. **淘汰纯 Waterfall Adapter**：全面切断仅支持旧版瀑布流的边缘网络，只保留头部支持实时 In-App Bidding 的主流 Network（如 Meta, AppLovin, Google, Mintegral），不仅竞价效率更高，还能瞬间将广告 SDK 体积缩减 60% 以上；
2. **Gradle 强制全局依赖锁定**：在根目录 \`build.gradle\` 中利用 \`configurations.all\` 统一对齐底层共有库（如统一锁定 \`play-services-ads-identifier\` 与 \`androidx.annotation\`），杜绝版本碎片化引起的底层 Runtime 异常；
3. **引入 AppLovin Quality Service / Google Ad Inspector**：在 Debug 构建中集成测试套件，在手机端摇一摇即可呼出所有 Adapter 的实时竞价状态、初始化成功率与合规测试结果，实现所见即所得的调优。`,
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
