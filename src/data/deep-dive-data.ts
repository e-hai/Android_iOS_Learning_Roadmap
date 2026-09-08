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

#### 5. 实战进阶：复杂长流程管线编排与列表项解耦
- **场景痛点**：跨越“点击列表项 ➔ 隐私弹窗 ➔ 系统相册 ➔ 激励广告 ➔ 上传推理 ➔ 刷新结果”的长链路流程；如果直接在单一 Activity / Screen 中堆叠布尔变量（\`showPrivacy\`、\`showAd\` 等），极易引发状态爆炸与庞大的 \`if-else\` 回调地狱；同时，若上传过程使用全屏遮罩强锁界面，会严重阻断用户浏览列表的体验。
- **核心架构解法**：
  1. **管线配方架构（Pipeline Recipe）**：将流程中的弹窗、相册、广告抽象为原子卡片步骤（\`PipelineStep\`）。触发时组装一个顺序配方，ViewModel 仅需通用推进 \`currentIndex + 1\`，彻底消除硬编码与状态分散；
  2. **列表项上下文绑定与就地 Loading**：管线强绑定当前被点击项的 \`targetItemId\`；当流程推进到耗时的异步上传生成时，立即解除全屏模态管线（\`activePipeline = null\`），将状态转为该列表项“就地转圈”，用户无需等待可继续自由浏览列表。

\`\`\`kotlin
// 1. 原子步骤卡片与管线定义
sealed interface PipelineStep {
    data object Privacy : PipelineStep
    data object PickPhoto : PipelineStep
    data class Ad(val adUnitId: String) : PipelineStep
    data object UploadAndGenerate : PipelineStep
}

data class ActivePipeline(
    val steps: List<PipelineStep>,
    val currentIndex: Int = 0,
    val targetItemId: String
)

// 2. 列表项 UI 状态模型
data class ItemUiModel(
    val id: String,
    val title: String,
    val imageUrl: String,
    val isGenerating: Boolean = false
)

// 3. ViewModel 集中调度管线
class TemplateListViewModel(
    private val repository: ImageRecognitionRepository
) : ViewModel() {
    private val _items = MutableStateFlow<List<ItemUiModel>>(emptyList())
    val items: StateFlow<List<ItemUiModel>> = _items.asStateFlow()

    // 为 null 表示无模态流程；有值则全屏承接当前步骤
    private val _activePipeline = MutableStateFlow<ActivePipeline?>(null)
    val activePipeline: StateFlow<ActivePipeline?> = _activePipeline.asStateFlow()

    // 触发长流程：隐私 ➔ 选图 ➔ 广告 ➔ 上传
    fun onItemClick(itemId: String) {
        val steps = listOf(PipelineStep.Privacy, PipelineStep.PickPhoto, PipelineStep.Ad("ad_01"), PipelineStep.UploadAndGenerate)
        _activePipeline.value = ActivePipeline(steps, currentIndex = 0, targetItemId = itemId)
    }

    // 步骤完成统一推进回调
    fun onStepCompleted() {
        val p = _activePipeline.value ?: return
        val nextIdx = p.currentIndex + 1
        if (nextIdx < p.steps.size) {
            _activePipeline.value = p.copy(currentIndex = nextIdx)
            if (p.steps[nextIdx] is PipelineStep.UploadAndGenerate) executeUpload(p.targetItemId)
        } else {
            _activePipeline.value = null
        }
    }

    private fun executeUpload(targetId: String) {
        _activePipeline.value = null // ⚡ 模态立即退出，释放列表交互
        updateItem(targetId) { it.copy(isGenerating = true) } // 目标项就地转圈

        viewModelScope.launch {
            repository.uploadAndGenerate(targetId)
                .onSuccess { url -> updateItem(targetId) { it.copy(imageUrl = url, isGenerating = false) } }
                .onFailure { updateItem(targetId) { it.copy(isGenerating = false) } }
        }
    }

    private fun updateItem(id: String, transform: (ItemUiModel) -> ItemUiModel) {
        _items.update { list -> list.map { if (it.id == id) transform(it) else it } }
    }
}

// 4. Compose UI 界面层：列表常驻 + 管线弹层解耦
@Composable
fun TemplateListScreen(viewModel: TemplateListViewModel) {
    val items by viewModel.items.collectAsStateWithLifecycle()
    val activePipeline by viewModel.activePipeline.collectAsStateWithLifecycle()

    Box(modifier = Modifier.fillMaxSize()) {
        // ① 基础列表：始终可响应滑动与点击
        LazyColumn(modifier = Modifier.fillMaxSize()) {
            items(items, key = { it.id }) { item ->
                ListItemRow(item = item, onClick = { viewModel.onItemClick(item.id) })
            }
        }

        // ② 管线承接器：根据当前步骤渲染对应弹层，用户交互完毕仅回调 onStepCompleted
        activePipeline?.let { pipeline ->
            when (pipeline.steps[pipeline.currentIndex]) {
                is PipelineStep.Privacy -> PrivacyDialog(onAgree = viewModel::onStepCompleted)
                is PipelineStep.PickPhoto -> PhotoPickerSheet(onPicked = viewModel::onStepCompleted)
                is PipelineStep.Ad -> AdOverlay(onAdClosed = viewModel::onStepCompleted)
                is PipelineStep.UploadAndGenerate -> Unit // 已转入列表项局部转圈，无阻断弹层
            }
        }
    }
}

@Composable
fun ListItemRow(item: ItemUiModel, onClick: () -> Unit) {
    Row(modifier = Modifier.fillMaxWidth().clickable(onClick = onClick).padding(16.dp)) {
        Text(text = item.title, modifier = Modifier.weight(1f))
        if (item.isGenerating) {
            CircularProgressIndicator(modifier = Modifier.size(24.dp)) // ⚡ 就地转圈
        }
    }
}
\`\`\``,
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
