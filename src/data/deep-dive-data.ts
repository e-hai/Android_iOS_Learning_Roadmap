import { PlatformDeepDive } from '../models/types';

export const deepDivesData: Record<string, PlatformDeepDive> = {
  env: {
    android: [
      {
        tag: '构建底层',
        title: 'Gradle 构建生命周期与 Configuration Cache 调优',
        explanation: 'Gradle 构建分为 Initialization（评估 settings.gradle）、Configuration（配置所有 Task 依赖图与参数）与 Execution（按 DAG 执行任务）。在现代大型工程中，配置阶段往往占据 40% 以上时间。开启 Configuration Cache 后，Gradle 会将配置阶段产物序列化持久化至磁盘，后续增量构建直接跳过 Configuration 阶段直奔 Execution。',
        codeSnippet: `# gradle.properties 性能提速关键配置
org.gradle.caching=true
org.gradle.configuration-cache=true
org.gradle.parallel=true
org.gradle.jvmargs=-Xmx4096m -XX:+UseParallelGC`,
      },
      {
        tag: '依赖决议',
        title: 'AAR 依赖冲突与强制版本决议 (Resolution Strategy)',
        explanation: 'Android 通过 Gradle 递归下载传递依赖。当不同第三方库引入了冲突的库版本时，默认遵循最高版本（Newest）原则，但这容易导致运行时 NoSuchMethodError。可通过 resolutionStrategy 强制锁定全局依赖版本，或使用 dependencyInsight 排查冲突来源。',
        codeSnippet: `// build.gradle.kts 强制统一依赖版本与排查
configurations.all {
    resolutionStrategy {
        force("androidx.core:core-ktx:1.13.1")
        failOnVersionConflict()
    }
}
// 命令行排查具体依赖链:
// ./gradlew :app:dependencyInsight --dependency core-ktx`,
      },
      {
        tag: '调试利器',
        title: 'ADB 核心诊断命令清单 (Activity 栈 / 内存 / 冷启动)',
        explanation: '在日常性能优化与疑难排查中，熟练运用 ADB 底层命令能瞬间洞察系统内部状态，无需依赖繁重的 IDE 性能分析面板。',
        codeSnippet: `# 1. 打印当前顶层 Activity 任务栈
adb shell dumpsys activity top | grep ACTIVITY

# 2. 测量冷启动精准耗时 (ThisTime / TotalTime)
adb shell am start -W -n com.example.app/.MainActivity

# 3. 查看应用真实内存占用详情 (PSS / Native / Dalvik)
adb shell dumpsys meminfo com.example.app`,
      },
    ],
    ios: [
      {
        tag: '工程底层',
        title: 'Xcode 构建系统解构 (PBXProj / XCConfig / DerivedData)',
        explanation: 'Xcode 工程由 .xcodeproj（内含 project.pbxproj 文本哈希配置）定义。多团队协作时 pbxproj 极易产生合并冲突。业界最佳实践是将编译参数（Bundle ID, 签名, 优化级别）外置到 .xcconfig 纯文本配置文件中。编译中间产物集中存放在 ~/Library/Developer/Xcode/DerivedData 中，编译异常时清理该目录通常能解决大多数神秘符号缺失。',
        codeSnippet: `// Configurations/Release.xcconfig
#include "Base.xcconfig"
SWIFT_OPTIMIZATION_LEVEL = -O
PRODUCT_BUNDLE_IDENTIFIER = com.example.app.release
ENABLE_BITCODE = NO
OTHER_SWIFT_FLAGS = $(inherited) -DRELEASE`,
      },
      {
        tag: '包管理机制',
        title: 'SPM (Swift Package Manager) 与 XCFramework 二进制分发',
        explanation: 'SPM 是 Apple 官方的一体化包管理工具，深度集成进 Xcode 构建依赖图中，无需生成额外的 Pods 工程。对于闭源商业 SDK，Apple 推荐打包为 XCFramework，它在一个包内封装了针对真机（arm64）与模拟器（arm64/x86_64）的独立 Slice，并通过代码签名校验防止二进制篡改。',
        codeSnippet: `// Package.swift 声明二进制与源码依赖
// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CoreNetworking",
    platforms: [.iOS(.v16)],
    products: [.library(name: "CoreNetworking", targets: ["CoreNetworking"])],
    dependencies: [
        .package(url: "https://github.com/Alamofire/Alamofire.git", from: "5.8.0")
    ],
    targets: [
        .target(name: "CoreNetworking", dependencies: ["Alamofire"]),
        .binaryTarget(name: "VendorSDK", path: "Artifacts/VendorSDK.xcframework")
    ]
)`,
      },
      {
        tag: '调试利器',
        title: 'LLDB 进阶控制台调试指令 (动态注入 / 格式化求值)',
        explanation: '在断点暂停时，LLDB 提供了比简单打印强大得多的即时调试能力，可在运行时直接修改内存变量或调用私有方法。',
        codeSnippet: `(lldb) v user.name         # 极速读取变量内存 (不编译表达式，速度最快)
(lldb) po user.debugDesc   # 打印对象调试描述 (动态调用 CustomDebugStringConvertible)
(lldb) expr self.view.backgroundColor = .red # 运行时动态修改 UI 颜色
(lldb) thread backtrace    # 打印当前线程完整调用栈`,
      },
    ],
  },
  language: {
    android: [
      {
        tag: '内存机制',
        title: 'JVM / ART 垃圾回收机制与 GC Root 引用链',
        explanation: 'Android 采用基于追踪（Tracing）的垃圾回收器（分代回收：Young Gen 存放新生命周期短的对象，Old Gen 存放多次存活的长生命周期对象）。GC 会从 GC Root（当前执行栈帧局部变量、运行中线程、JNI 全局引用、类静态变量）出发遍历所有可达对象，不可达对象在 GC 周期被标记并清理。',
        codeSnippet: `// 典型 GC Root 泄漏模式：静态单例持有 Context
object ToastHelper {
    private var context: Context? = null // 危险：若传入 Activity，导致整棵 Activity 树无法被 GC
    fun init(ctx: Context) {
        context = ctx.applicationContext // 正解：强制使用 Application Context
    }
}`,
      },
      {
        tag: '内存泄漏排查',
        title: 'LeakCanary 底层实现原理 (WeakReference + Shark)',
        explanation: 'LeakCanary 在 Activity.onDestroy() 被调用时，将其实例包装进带有 ReferenceQueue 的 WeakReference 中。5 秒后触发一次检查并主动调用一次 System.gc()；若该弱引用仍未出现在 ReferenceQueue 中，说明存在强引用链；此时自动 dump 堆内存为 Hprof 文件，并利用内置的 Shark 分析库分析从 GC Root 到该对象的最短强引用路径。',
        codeSnippet: `// LeakCanary 核心探测伪代码
val referenceQueue = ReferenceQueue<Any>()
val watchedObject = WeakReference(activityInstance, referenceQueue)

delay(5_000)
Runtime.getRuntime().gc() // 促使 GC 回收
if (referenceQueue.poll() == null) {
    // 弱引用未入队列 -> 判定对象泄漏 -> Dump Hprof 触发分析
    SharkHprofAnalyzer.analyze(heapDumpFile)
}`,
      },
      {
        tag: '编译器特性',
        title: 'Kotlin 内联优化与 Value Class 零开销类型包装',
        explanation: 'Kotlin 的 inline 函数在编译期直接将函数体代码展开到调用处，消除高阶函数 Lambda 对象的创建开销。value class（值类）在编译后直接被当做原生底层基本类型处理，只在泛型或接口转型时发生装箱，实现了类型安全与零内存分配开销。',
        codeSnippet: `@JvmInline
value class UserId(val raw: String) // 运行时纯粹表现为 String，无对象封装开销

inline fun <T> measureTime(block: () => T): T {
    val start = System.currentTimeMillis()
    return block().also { println("Elapsed: \${System.currentTimeMillis() - start}ms") }
}`,
      },
    ],
    ios: [
      {
        tag: '内存模型',
        title: 'Swift 内存布局：Struct 栈分配 vs Class 堆分配与 COW',
        explanation: 'Struct 是值类型（Value Type），默认分配在栈（Stack）上，内存连续且随函数返回自动出栈，创建销毁开销极低。Class 是引用类型（Reference Type），必须在堆（Heap）上分配内存，自带 16 字节头部元数据与引用计数指针。Swift 标准库的 Array/Dictionary 等集合内部实现了 Copy-on-Write（写时复制）：多个变量共享同一块底层堆内存，直到发生实际写入修改时才触发深拷贝。',
        codeSnippet: `struct Position { var x: Double; var y: Double } // 16 字节，纯栈内存
class Node { var next: Node? } // 堆分配，自带 16 字节 Class Metadata Header

var arr1 = [1, 2, 3]
var arr2 = arr1 // 共享同一内存缓冲区 (COW)
arr2.append(4)  // 此时触发复制，arr1 与 arr2 分离`,
      },
      {
        tag: 'ARC 核心机制',
        title: 'ARC 引用计数底层与 Side Table 散列表',
        explanation: 'Swift 引用计数存储在对象的 Inline Header 内部。当强引用计数超出头部存储上限，或该对象被 weak 弱引用持有时，Swift 运行时会为该对象在全局 Side Table（散列表）中分配一个 Weak Reference Table 项。弱引用读取时先查询 Side Table；当对象强引用归 0 释放后，运行时自动将所有指向它的 weak 变量安全置为 nil。',
        codeSnippet: `class NetworkService {
    var onComplete: (() -> Void)?
    func start() {
        // [weak self] 将强引用转为弱引用，查 Side Table，释放时自动置 nil
        onComplete = { [weak self] in
            guard let self = self else { return } // 临时强引用保证执行期间不被释放
            self.updateUI()
        }
    }
}`,
      },
      {
        tag: '调试利器',
        title: 'Xcode Memory Graph 强引用环与 Leaks 静态分析',
        explanation: '在 Xcode 调试运行时点击 Debug Memory Graph 按钮，Xcode 会暂停进程并扫描当前堆上所有 malloc 区域，以可视化有向图的形式展示对象间的指针持有关系。若出现紫色的“Memory Leak”标记，直接点击节点即可查看导致 Retain Cycle 的闭包或属性链路。',
        codeSnippet: `// 命令行配合 Instruments 分析内存泄漏
xcrun xctrace record --template 'Leaks' --launch -- /path/to/MyApp.app`,
      },
    ],
  },
  lifecycle: {
    android: [
      {
        tag: '状态恢复',
        title: 'Activity 异常杀死重建与 SavedStateHandle 状态管道',
        explanation: '当系统在后台因低内存回收 Activity 进程时，会自动回调 onSaveInstanceState(Bundle)。重建时 ViewModel 会通过 SavedStateHandle 接收之前持久化的 Parcelable 数据。在现代 Jetpack 架构中，推荐使用 SavedStateHandle.getStateFlow() 直接将持久化状态转换为响应式流。',
        codeSnippet: `class DetailViewModel(
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {
    // 进程杀死重建时自动恢复，且与 Compose 双向响应
    val userId: StateFlow<String> = savedStateHandle.getStateFlow("userId", "")
    
    fun setUserId(id: String) {
        savedStateHandle["userId"] = id
    }
}`,
      },
      {
        tag: '前后台监控',
        title: 'ProcessLifecycleOwner 与 ComponentCallbacks2 内存降级',
        explanation: 'ProcessLifecycleOwner 提供了针对整个 App 维度的生命周期分发。当所有 Activity 均不可见时派发 ON_STOP，进入后台；当任意 Activity 回到前台时派发 ON_START。结合 Application 实现 ComponentCallbacks2，可以在系统发送 TRIM_MEMORY_UI_HIDDEN 或 TRIM_MEMORY_COMPLETE 时主动释放图片与内存缓存。',
        codeSnippet: `class App : Application(), ComponentCallbacks2 {
    override fun onCreate() {
        super.onCreate()
        ProcessLifecycleOwner.get().lifecycle.addObserver(AppLifecycleObserver())
        registerComponentCallbacks(this)
    }

    override fun onTrimMemory(level: Int) {
        if (level >= ComponentCallbacks2.TRIM_MEMORY_MODERATE) {
            ImageLoader.clearMemoryCache() // 系统吃紧，主动释放内存
        }
    }
}`,
      },
    ],
    ios: [
      {
        tag: '应用模型',
        title: 'SwiftUI App / Scene / View 树形生命周期流转',
        explanation: 'SwiftUI 应用以 `@main struct MyApp: App` 为顶层入口，内部包含一个或多个 `Scene`（如 `WindowGroup`），Scene 负责承载整个界面的 View 层次。iOS 14 引入的 `@Environment(\\.scenePhase)` 环境变量提供了跨 iPad 多窗口的独立生命周期状态感知（`.active` / `.inactive` / `.background`）。',
        codeSnippet: `@main
struct MyApp: App {
    @Environment(\\.scenePhase) private var scenePhase

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .onChange(of: scenePhase) { newPhase in
            switch newPhase {
            case .active:
                print("App 进入活跃前台")
            case .inactive:
                print("App 进入非活跃状态 (如拉下控制中心)")
            case .background:
                print("App 已退到后台，需保存未完成数据")
            @unknown default: break
            }
        }
    }
}`,
      },
      {
        tag: '状态保活',
        title: '`@StateObject` 的底层节点生命周期绑定机制',
        explanation: 'SwiftUI 的 View 结构体在状态改变时会频繁销毁并重新初始化 `init()`。使用 `@StateObject` 声明的 ObservableObject 实例，由 SwiftUI 底层的 Graph 节点负责持久持有，无论结构体重绘多少次，其对应的 `@StateObject` 实例在整个视图生命周期内只被创建一次；而 `@ObservedObject` 则仅仅是外部传入的指针引用。',
        codeSnippet: `struct ProductView: View {
    // 即使 ProductView 被父视图重新求值 100 次，vm 也只会实例化一次
    @StateObject private var vm = ProductViewModel()

    var body: some View {
        Text(vm.title)
            .task {
                // .task 会在视图 onAppear 时启动，并在 onDisappear 时自动协作式取消
                await vm.loadDetails()
            }
    }
}`,
      },
    ],
  },
  ui: {
    android: [
      {
        tag: '渲染原理',
        title: 'Compose 渲染三阶段与 Slot Table 插槽表架构',
        explanation: 'Compose 将界面绘制划分为三个明确阶段：1. 组合 (Composition，执行 Composable 树确定 UI 结构) ➔ 2. 布局 (Layout，测量与放置 Measure & Place) ➔ 3. 绘制 (Draw，向 Canvas 发送绘图指令)。Compose 底层采用 Slot Table（类似间隙缓冲区 Gap Buffer）来存储组合过程中的参数、状态与对象。每次重组时，通过对比 Slot Table 中的旧值与新参数，决定是否跳过重组。',
        codeSnippet: `// 编译前:
@Composable fun Greeting(name: String) { Text("Hello $name") }

// 编译器插件生成的字节码伪代码:
fun Greeting(name: String, $composer: Composer, $changed: Int) {
    $composer.startRestartGroup(...)
    if ($changed and 0b0001 == 0 && $composer.skipping) {
        $composer.skipToGroupEnd() // 参数未变，直接跳过整个 Composable!
    } else {
        Text("Hello $name", $composer, ...)
    }
    $composer.endRestartGroup()
}`,
      },
      {
        tag: '重组调优',
        title: 'Smart Recomposition 与参数稳定性 (Stability 推导)',
        explanation: 'Compose 编译器会对 Composable 的参数进行稳定性分析。基本类型、String、不可变数据类（所有字段为 val 且均为稳定类型）被标记为 `@Stable`；而标准库 `List<T>`（因为实现类可能是可变的 ArrayList）或跨模块未开启 Compose 编译器的类会被推导为 `Unstable`。当参数为 Unstable 时，父级一旦重组，该组件就无法跳过。',
        codeSnippet: `// 方案 1: 使用 kotlinx.collections.immutable 保持稳定
@Composable
fun UserList(users: ImmutableList<User>) { ... }

// 方案 2: 使用 @Immutable 或 @Stable 强制声明
@Immutable
data class UiUserData(val items: List<String>)`,
      },
    ],
    ios: [
      {
        tag: '渲染原理',
        title: 'SwiftUI AttributeGraph 属性依赖图与视图求值机制',
        explanation: 'SwiftUI 不直接操作 UIKit 视图，而是由内部 C++ 引擎维护一棵名为 AttributeGraph 的动态依赖关系图。每个 `@State`、`@Binding` 或 `@Environment` 都是图中的输入节点（Source），View 的 `body` 则是派生计算节点。当输入节点值改变时，AttributeGraph 将对应派生节点标记为 Dirty，并在下一个屏幕刷新周期只对脏节点调用 `body` 重新求值，最后将差异提交给 CoreAnimation 硬件合成。',
        codeSnippet: `// SwiftUI 视图更新的核心不是 diff 虚拟 DOM，而是属性依赖图定向重算:
// Source Node (@State count) ──(Dirty)──▶ Derived Node (body) ──▶ Render Tree (CALayer)`,
      },
      {
        tag: '调试利器',
        title: '视图重绘调试秘籍：`Self._printChanges()`',
        explanation: '当遇到 SwiftUI 视图出现意料之外的高频重绘时，只需在 View 的 `body` 内部最顶端加入 `let _ = Self._printChanges()`。Xcode 控制台将实时打印出到底是因为哪个 `@State`、`@Environment` 或哪个属性发生改变从而触发了当前视图的重绘。',
        codeSnippet: `struct FeedView: View {
    @State private var items: [String] = []

    var body: some View {
        #if DEBUG
        let _ = Self._printChanges() // 控制台输出: FeedView: _items changed.
        #endif
        List(items, id: \\.self) { item in
            Text(item)
        }
    }
}`,
      },
    ],
  },
  state: {
    android: [
      {
        tag: '数据流内核',
        title: 'StateFlow vs SharedFlow 背压、重放与防抖机制',
        explanation: 'StateFlow 必须提供初始值，且固定 `replay=1`，内置 `distinctUntilChanged()` 防抖逻辑（新值与旧值 `equals` 相等时不发射），天生为单一 UI 状态（UiState）设计。SharedFlow 是更通用的事件总线，支持配置 `replay` 数量与 `extraBufferCapacity` 缓冲区，支持设置 `BufferOverflow` 丢弃策略（`SUSPEND` / `DROP_OLDEST` / `DROP_LATEST`），非常适合一次性弹窗/导航事件。',
        codeSnippet: `class NewsViewModel : ViewModel() {
    // 状态流 (State): 专供 UI 渲染，自动防抖
    private val _uiState = MutableStateFlow<NewsUiState>(NewsUiState.Loading)
    val uiState = _uiState.asStateFlow()

    // 事件流 (Event): 专供单次行为，无防抖，不丢事件
    private val _eventFlow = MutableSharedFlow<UiEffect>(extraBufferCapacity = 1)
    val eventFlow = _eventFlow.asSharedFlow()
}`,
      },
      {
        tag: '快照底层',
        title: 'Compose 快照系统 (Snapshot) 与多线程读写隔离',
        explanation: 'Compose 的 `mutableStateOf` 背后是由 Snapshot（快照）系统支持的（受 MVCC 多版本并发控制启发）。主线程读取状态时记录在当前读取快照中；后台线程写入状态时必须在独立写快照中进行，写入完成后通过 `Snapshot.sendApplyNotifications()` 统一向订阅者分发变更通知。',
        codeSnippet: `// 手动触发快照事务
Snapshot.withMutableSnapshot {
    stateA.value = "New A"
    stateB.value = "New B"
} // 原子性批量应用，合并为一次重组通知`,
      },
    ],
    ios: [
      {
        tag: '响应式框架',
        title: 'Observation 框架底层追踪机制 (iOS 17+ / Swift 5.9+)',
        explanation: 'iOS 17 引入的 `@Observable` 宏彻底取代了繁重的 `ObservableObject + Combine`。编译器在编译期为该类自动生成 `withObservationTracking` 属性访问拦截器。当 SwiftUI View 读取某个 `@Observable` 类的属性时，SwiftUI 会将该 View 与该具体字段建立细粒度一对一绑定。如果该类中有 10 个属性，View 只读了 1 个，那么其他 9 个属性修改时该 View 绝对不会发生多余重绘！',
        codeSnippet: `@Observable
class UserStore {
    var name: String = "Alex"
    var avatarUrl: String = "https://..."
}

struct UserNameOnlyView: View {
    var store: UserStore
    var body: some View {
        // 仅订阅 name 属性变化！avatarUrl 修改不会触发此 View 重绘！
        Text(store.name)
    }
}`,
      },
      {
        tag: '双向绑定',
        title: '`@Binding` 引用投影与状态借用模型',
        explanation: '`@Binding` 并不拥有数据本身，其内部包含一个读取器 `() -> Value` 和一个写入器 `(Value) -> Void` 闭包对。通过前缀 `$` 符号从父组件的 `@State` 产生投影，将状态的“修改权”借用给子组件，数据流依然遵循自顶向下的单向流动原则。',
        codeSnippet: `struct ToggleSwitch: View {
    @Binding var isOn: Bool // 借用父状态

    var body: some View {
        Button(isOn ? "ON" : "OFF") {
            isOn.toggle() // 直接通过 Setter 闭包修改父状态源头
        }
    }
}`,
      },
    ],
  },
  navigation: {
    android: [
      {
        tag: '路由栈管理',
        title: 'NavBackStackEntry 独立生命周期与作用域绑定',
        explanation: 'Jetpack Navigation 内部由 NavController 维护一个 NavBackStackEntry 队列。每个页面 Entry 都是一个独立的 `LifecycleOwner`、`ViewModelStoreOwner` 与 `SavedStateRegistryOwner`。这意味着可以利用 `hiltViewModel(navController.getBackStackEntry("parent_graph"))` 让一个嵌套子图内的多个界面共享同一个 ViewModel 实例。',
        codeSnippet: `// 嵌套图跨界面共享 ViewModel 模式
@Composable
fun Step2Screen(navController: NavController) {
    val parentEntry = remember(navController) {
        navController.getBackStackEntry("checkout_flow")
    }
    // 作用域限定在整个结账子流程中，流程结束自动销毁
    val checkoutViewModel: CheckoutViewModel = hiltViewModel(parentEntry)
}`,
      },
    ],
    ios: [
      {
        tag: '现代路由栈',
        title: '`NavigationStack` + `NavigationPath` 类型擦除与序列化',
        explanation: 'SwiftUI 放弃了旧版 NavigationView，引入了 `NavigationStack(path: $path)`。`NavigationPath` 是一个类型擦除的异构数据集合，支持将任何符合 `Hashable` 的模型对象推入路由栈，并通过 `.navigationDestination(for: Type.self)` 集中分发视图。此外，`NavigationPath.CodableRepresentation` 支持直接将整条路由栈序列化为 JSON 持久化。',
        codeSnippet: `enum Route: Hashable, Codable {
    case detail(id: String)
    case profile(username: String)
}

struct AppRootView: View {
    @State private var path: [Route] = [] // 强类型路由栈

    var body: some View {
        NavigationStack(path: $path) {
            HomeView()
                .navigationDestination(for: Route.self) { route in
                    switch route {
                    case .detail(let id): DetailView(id: id)
                    case .profile(let name): ProfileView(name: name)
                    }
                }
        }
    }
}`,
      },
    ],
  },
  async: {
    android: [
      {
        tag: '协程内核',
        title: 'Kotlin 协程 CPS 变换与 Continuation 状态机',
        explanation: 'Kotlin 编译器在编译 `suspend` 函数时，会将其签名末尾隐式增加一个 `Continuation<T>` 参数（CPS: Continuation Passing Style）。函数体内部被编译为一个状态机类（包含 `label` 标签与局部变量字段）。当执行到挂起点时，函数返回 `COROUTINE_SUSPENDED` 标记并立即释放当前线程；底层异步 I/O 完成后，回调 `continuation.resumeWith()` 驱动状态机进入下一个 label 执行。',
        codeSnippet: `// 编译前源码:
suspend fun fetchUser(): User {
    val token = getToken() // 挂起点 1
    return api.getUser(token) // 挂起点 2
}

// 编译器生成的字节码逻辑伪代码:
fun fetchUser(continuation: Continuation<User>): Any {
    val stateMachine = continuation as? FetchUserState ?: FetchUserState(continuation)
    when (stateMachine.label) {
        0 -> { stateMachine.label = 1; getToken(stateMachine) }
        1 -> { val token = stateMachine.result; stateMachine.label = 2; api.getUser(token, stateMachine) }
        2 -> return stateMachine.result as User
    }
}`,
      },
      {
        tag: '线程调度',
        title: 'Dispatchers 调度器线程池与结构化异常传播',
        explanation: '`Dispatchers.Default` 基于工作窃取算法（Work-Stealing），线程池容量等于 CPU 核心数，专为 CPU 密集型计算设计；`Dispatchers.IO` 线程池采用弹性扩张模式，最大允许 64 个活动线程（适合阻塞 I/O）。协程体系中，普通 `Job` 只要有一个子协程崩溃就会级联取消所有兄弟协程，而 `SupervisorJob` 则阻断异常向上传播，保证兄弟协程独立运行。',
        codeSnippet: `val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
scope.launch {
    // 独立子协程 1 失败不会影响子协程 2
    launch { fetchTask1() }
    launch { fetchTask2() }
}`,
      },
    ],
    ios: [
      {
        tag: '并发模型',
        title: 'Swift Actor 隔离模型与数据竞争静态消除',
        explanation: 'Swift Concurrency 采用 Actor 保证并发安全。Actor 是引用类型，但其内部所有可变状态受到严格隔离保护，内部拥有一个独立的串行执行邮箱（Serial Mailbox）。所有外部对 Actor 属性或方法的调用都必须加上 `await` 关键字排队执行。`@MainActor` 是一个全局 Actor，确保所有被其修饰的代码严格在主线程 DispatchQueue.main 上执行。',
        codeSnippet: `actor BankAccount {
    private var balance: Double = 0.0

    func deposit(amount: Double) {
        balance += amount // Actor 内部直接读写，无竞争
    }
}

// 外部调用强制异步排队:
let account = BankAccount()
await account.deposit(amount: 100.0)`,
      },
      {
        tag: '严格并发',
        title: '`Sendable` 协议与编译期严格数据竞争检查',
        explanation: '在 Swift 6 / 严格并发模式（`SWIFT_STRICT_CONCURRENCY=complete`）下，所有跨线程/跨 Task/跨 Actor 传递的数据必须遵循 `Sendable` 协议。值类型（Struct, Enum）、不可变类（`final class` 且所有成员为不可变 `let`）天然符合 `Sendable`；可变引用类型若传递会直接触发编译器报错，从源头彻底根绝多线程 Data Race。',
        codeSnippet: `// 编译通过：不可变线程安全模型
struct UserPayload: Sendable {
    let id: String
    let name: String
}

// 编译报错：非 Sendable 可变类跨并发边界传递
class MutableAccount { var balance: Double = 0 } // Error: Cannot pass across actors`,
      },
    ],
  },
  network: {
    android: [
      {
        tag: '拦截器链',
        title: 'OkHttp 责任链模式与 ConnectionPool 连接池复用',
        explanation: 'OkHttp 核心是 `RealInterceptorChain` 驱动的递归拦截器链：RetryAndFollowUpInterceptor ➔ BridgeInterceptor ➔ CacheInterceptor ➔ ConnectInterceptor ➔ CallServerInterceptor。ConnectInterceptor 通过 `ConnectionPool`（默认最多保持 5 个空闲 Socket 存活 5 分钟）实现 TCP 握手复用与 HTTP/2 多路复用，极大降低握手延迟。',
        codeSnippet: `class AuthInterceptor(private val tokenProvider: () -> String) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        val modified = original.newBuilder()
            .header("Authorization", "Bearer \${tokenProvider()}")
            .build()
        return chain.proceed(modified) // 责任链向下传递
    }
}`,
      },
    ],
    ios: [
      {
        tag: '后台传输',
        title: '`URLSession` 后台上传/下载与进程外守护系统',
        explanation: '当配置为 `URLSessionConfiguration.background(withIdentifier: "bg_down")` 时，网络传输将完全移交由 iOS 系统的守护进程（nsurlsessiond）全权托管。即便 App 被用户划掉或被系统因低内存杀死，系统依然在后台继续完成网络下载，并在全部传输完成后重新唤醒 App，回调 `application(_:handleEventsForBackgroundURLSession:)`。',
        codeSnippet: `class DownloadManager: NSObject, URLSessionDownloadDelegate {
    lazy var session: URLSession = {
        let config = URLSessionConfiguration.background(withIdentifier: "com.app.download")
        config.isDiscretionary = true // 允许系统在充电且连上 Wi-Fi 时再智能调度下载
        return URLSession(configuration: config, delegate: self, delegateQueue: nil)
    }()
    
    func startDownload(url: URL) {
        let task = session.downloadTask(with: url)
        task.resume()
    }
}`,
      },
    ],
  },
  storage: {
    android: [
      {
        tag: '数据库底层',
        title: 'Room SQLite WAL 模式与 InvalidationTracker 响应式监听',
        explanation: 'Room 默认开启 SQLite WAL (Write-Ahead Logging 预写日志) 模式，使得读操作和写操作可以真正并发执行，读不阻塞写，写不阻塞读。Room 的 `Flow<List<User>>` 响应式查询基于 `InvalidationTracker` 实现：Room 会在 SQLite 中为每张表自动建立触发器（Trigger），当表数据被增删改时向辅助表写入变更标记，InvalidationTracker 轮询感知后自动通知 Flow 重新执行查询。',
        codeSnippet: `// 查看 Room 编译期生成的 InvalidationTracker 代码片段
// 每次执行 insert/update/delete 时触发表级通知:
// mDatabase.getInvalidationTracker().notifyObserversByTableNames("User");`,
      },
    ],
    ios: [
      {
        tag: '现代存储引擎',
        title: 'SwiftData 架构内核与多线程 ModelContext 隔离',
        explanation: 'SwiftData (iOS 17+) 是基于 Swift 宏构建的高级声明式持久化框架。`@Model` 宏为数据类注入模式元数据（Schema）。`ModelContainer` 相当于整个存储库底座，负责与底层 SQLite/CoreData 交互；`ModelContext` 是操作数据的内存工作区。为了防止多线程死锁，每个异步后台任务必须创建自己独立的 `ModelContext`，写入完成后调用 `context.save()` 触发合并。',
        codeSnippet: `@Model
final class TaskItem {
    var title: String
    var isDone: Bool
    init(title: String, isDone: Bool = false) {
        self.title = title
        self.isDone = isDone
    }
}

// 后台异步安全写入:
Task.detached {
    let backgroundContext = ModelContext(sharedContainer)
    let item = TaskItem(title: "后台批量导入")
    backgroundContext.insert(item)
    try backgroundContext.save()
}`,
      },
    ],
  },
  architecture: {
    android: [
      {
        tag: '架构范式',
        title: 'MVI / UDF 单向数据流架构与 Side Effect 隔离通道',
        explanation: '现代 Android 推荐 MVI 架构：视图层（View）只做两件事：1. 发射用户意图 `UiIntent` 到 ViewModel；2. 纯函数式渲染 `UiState`。对于一次性短暂副作用（如弹出 Toast、导航跳转、打开相机），绝对不能混在持续性的 UiState 状态流中，必须通过 `Channel` 或 `SharedFlow` 开辟独立的 `UiEffect` 通道。',
        codeSnippet: `sealed interface LoginIntent { data class Submit(val user: String) : LoginIntent }
data class LoginUiState(val isLoading: Boolean = false, val error: String? = null)
sealed interface LoginEffect { data class ShowToast(val msg: String) : LoginEffect }

class LoginViewModel : ViewModel() {
    val state = MutableStateFlow(LoginUiState())
    val effect = Channel<LoginEffect>(Channel.BUFFERED)
}`,
      },
    ],
    ios: [
      {
        tag: '函数式架构',
        title: 'TCA (The Composable Architecture) 纯函数状态机',
        explanation: 'TCA 是 iOS 社区最著名的单向数据流框架。整个业务由四部分组成：1. `State`（单一数据模型）；2. `Action`（所有可能发生的行为枚举）；3. `Reducer`（纯函数，接收当前 State 与 Action，返回修改后的新 State 以及可选的 `Effect` 异步副作用）；4. `Store`（驱动状态分发的 runtime）。这种纯函数架构使得业务逻辑的单元测试极其简单，无需任何复杂的 Mock 即可 100% 覆盖状态流转。',
        codeSnippet: `@Reducer
struct CounterFeature {
    struct State: Equatable { var count = 0 }
    enum Action { case incrementButtonTapped; case decrementButtonTapped }
    
    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .incrementButtonTapped:
                state.count += 1
                return .none // 无副作用
            case .decrementButtonTapped:
                state.count -= 1
                return .none
            }
        }
    }
}`,
      },
    ],
  },
  di: {
    android: [
      {
        tag: '编译期注入',
        title: 'Hilt 编译期代码生成与字节码插桩 (Bytecode Weaving)',
        explanation: 'Hilt 基于 Dagger2，在编译期利用注解处理器（APT/KSP）静态分析所有 `@Inject`、`@Module` 与 `@Provides`，生成完整的对象创建工厂类（Factory）与依赖有向无环图（DAG），在编译期校验所有依赖是否可解析，杜绝运行时 ClassNotFoundException。随后通过 Gradle 字节码插桩，自动让 `@AndroidEntryPoint` 修饰的 Activity/Fragment 继承 Hilt 生成的注入基类。',
        codeSnippet: `@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient = OkHttpClient.Builder().build()
}`,
      },
    ],
    ios: [
      {
        tag: '轻量依赖注入',
        title: '基于 Swift 协议与 Property Wrapper 的轻量容器注入',
        explanation: 'iOS 开发中并不推崇重型编译期注入框架。主流模式是手写依赖注入（Protocol + 构造函数默认参数），或者借助 Swift 现代 Property Wrapper (`@Injected`) 实现轻量级的服务定位器（Service Locator）容器。',
        codeSnippet: `protocol NetworkServiceProtocol { func fetch() }

final class DependencyContainer {
    static let shared = DependencyContainer()
    var networkService: NetworkServiceProtocol = RealNetworkService()
}

@propertyWrapper
struct Injected<T> {
    var wrappedValue: T {
        // 从全局容器解析服务实例
        DependencyContainer.shared.resolve(T.self)
    }
}`,
      },
    ],
  },
  images: {
    android: [
      {
        tag: '内存复用',
        title: 'Coil / Glide 内存三级缓存与 InBitmap 内存复用池',
        explanation: '图片加载框架核心是三级缓存：内存缓存（LruCache）➔ 磁盘缓存（DiskLruCache）➔ 网络下载。在 Android 中频繁创建与回收大尺寸 Bitmap 会引发频繁的 GC 内存抖动与卡顿。框架通过 `BitmapPool` 配合 `BitmapFactory.Options.inBitmap` 选项，将废弃的 Bitmap 内存空间直接复用给新解码的同尺寸图片，实现零内存申请加载。',
        codeSnippet: `val options = BitmapFactory.Options().apply {
    inBitmap = bitmapPool.get(width, height, inPreferredConfig) // 复用既有内存
    inSampleSize = calculateInSampleSize(options, reqWidth, reqHeight) // 采样缩放
}`,
      },
    ],
    ios: [
      {
        tag: '矢量资产',
        title: 'SF Symbols 矢量体系、分层着色与 Dynamic Type 缩放',
        explanation: 'SF Symbols 是 Apple 为 iOS 生态深度定制的矢量图标库（超过 5000+ 原生图标）。其核心优势包括：1. 矢量无损，零包体积消耗；2. 天然与系统字体（San Francisco）的 Weight（Light, Regular, Bold）与 Dynamic Type 大小对齐；3. 支持多色渲染分层（Hierarchical, Palette, Multicolor）以及系统级可变进度（Variable Color）微动画。',
        codeSnippet: `Image(systemName: "wifi", variableValue: 0.6) // 根据信号强度点亮 60% 弧线
    .symbolRenderingMode(.hierarchical)
    .foregroundStyle(.blue)
    .font(.system(size: 24, weight: .bold))`,
      },
    ],
  },
  animation: {
    android: [
      {
        tag: '物理动画',
        title: 'Compose Spring 弹簧动画与 graphicsLayer 硬件加速',
        explanation: '物理动画（`spring`）基于现实物理规律中的阻尼比（`dampingRatio`，控制回弹阻尼）与刚度（`stiffness`，控制回弹速度）。物理动画最大的优势在于“支持连续中断”：当动画在飞行途中目标值突然改变时，弹簧系统会继承当前瞬间的物理速度（Velocity）平滑过渡到新目标，而传统时间插值动画则会产生生硬的速度截断与闪烁。',
        codeSnippet: `val scale by animateFloatAsState(
    targetValue = if (isPressed) 0.95f else 1.0f,
    animationSpec = spring(
        dampingRatio = Spring.DampingRatioMediumBouncy,
        stiffness = Spring.StiffnessLow
    )
)
Box(Modifier.graphicsLayer { scaleX = scale; scaleY = scale }) // 硬件层合成，不触发重组`,
      },
    ],
    ios: [
      {
        tag: '事务插值',
        title: 'SwiftUI `withAnimation` 事务 (Transaction) 与图层合成',
        explanation: 'SwiftUI 的 `withAnimation` 会在内部创建一个 `Transaction`（事务）。当状态改变时，该事务被附加到当前求值周期中的所有 View 上。SwiftUI 计算新旧视图之间的树形属性差异（Frame, Opacity, Offset），并通过符合 `Animatable` 协议的 `animatableData` 插值属性，在每个屏幕垂直同步刷新周期（CADisplayLink 120Hz）提交给 Core Animation 硬件图层平滑合成。',
        codeSnippet: `withAnimation(.spring(response: 0.4, dampingFraction: 0.6)) {
    isExpanded.toggle() // 事务自动捕获 isExpanded 引发的所有视图树属性形变
}`,
      },
    ],
  },
  platform: {
    android: [
      {
        tag: '后台调度',
        title: 'WorkManager 约束执行驱动与跨进程重启持久化',
        explanation: 'WorkManager 是 Android 推荐的保证式后台任务管理器。它会根据系统版本智能选择底层调度实现（优先使用 JobScheduler）。开发者可配置网络类型、充电状态、电量等约束条件；任务参数与执行状态由 Room 自动写入本地数据库。即便 App 进程被杀死甚至手机重启，系统也会在满足约束条件时自动拉起 Worker 执行，并支持指数退避重试机制。',
        codeSnippet: `val uploadWorkRequest = OneTimeWorkRequestBuilder<UploadWorker>()
    .setConstraints(
        Constraints.Builder()
            .setRequiredNetworkType(NetworkType.UNMETERED) // 仅在 Wi-Fi 下执行
            .setRequiresCharging(true) // 仅在充电时执行
            .build()
    )
    .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 10, TimeUnit.SECONDS)
    .build()

WorkManager.getInstance(context).enqueue(uploadWorkRequest)`,
      },
    ],
    ios: [
      {
        tag: '系统后台',
        title: 'Background Tasks 框架调度机制与 30 秒执行超时约束',
        explanation: 'iOS 对后台执行有极其严格的功耗与资源控制。App 需在 Info.plist 中注册 `BGAppRefreshTask`（定期数据轻量刷新）或 `BGProcessingTask`（夜间充电大数据处理）。App 只能向系统提交任务请求，实际触发时机完全由 iOS 系统的智能电源算法决策。当系统唤醒 App 时，任务必须在约 30 秒内执行完毕并调用 `task.setTaskCompleted(success:)`，否则会被系统强行杀死。',
        codeSnippet: `func scheduleAppRefresh() {
    let request = BGAppRefreshTaskRequest(identifier: "com.app.refresh")
    request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60) // 最早 15 分钟后
    try? BGTaskScheduler.shared.submit(request)
}`,
      },
    ],
  },
  testing: {
    android: [
      {
        tag: '测试机制',
        title: 'Turbine 异步数据流测试与 Compose 语义树 (Semantics)',
        explanation: '测试异步 `StateFlow` 或复杂操作符时，直接用标准断言容易受到协程调度延迟影响。Turbine 提供了 `test` 挂起扩展，能够在虚拟时钟下按顺序捕获并断言 Flow 的每一次数据发射。Compose UI 测试则依赖 `ComposeTestRule`，通过查找虚拟辅助功能语义树（Semantics Tree）中的节点（如 `onNodeWithText`）触发点击并验证状态。',
        codeSnippet: `@Test
fun testViewModelFlow() = runTest {
    viewModel.uiState.test {
        assertEquals(UiState.Loading, awaitItem())
        viewModel.loadSuccess()
        assertEquals(UiState.Success(listOf("Item 1")), awaitItem())
        cancelAndIgnoreRemainingEvents()
    }
}`,
      },
    ],
    ios: [
      {
        tag: '现代测试',
        title: 'Swift Testing 框架演进 (iOS 18+ / Swift 6) 与宏断言',
        explanation: 'Apple 在 Xcode 16 中推出了全新的 Swift Testing 测试体系，全面革新了陈旧的 XCTest。使用 `@Test` 与 `@Suite` 替代传统的类继承模式；使用 `#expect(a == b)` 宏替代繁杂的 `XCTAssertEqual`；宏在断言失败时能智能展开并打印出表达式两边子变量的实时值；原生支持对并发 Task 的测试，并提供 `@Test(arguments: [...])` 参数化测试能力。',
        codeSnippet: `import Testing

@Suite("购物车业务逻辑测试")
struct CartTests {
    @Test("计算折扣总价", arguments: [
        (100.0, 0.8, 80.0),
        (200.0, 0.5, 100.0)
    ])
    func testDiscount(price: Double, discount: Double, expected: Double) async throws {
        let calculator = DiscountCalculator()
        let result = try await calculator.apply(price: price, discount: discount)
        #expect(result == expected) // 宏展开精准打印调试信息
    }
}`,
      },
    ],
  },
  release: {
    android: [
      {
        tag: '打包机制',
        title: 'AAB (Android App Bundle) 动态模块分发与 R8 混淆规则',
        explanation: 'AAB 是 Google Play 强制的标准发布格式。开发者上传一个统一的 `.aab` 归档包，Google Play 的 Bundletool 会在云端根据下载用户的具体设备规格（屏幕密度 dpi、CPU 架构 abi、语言 locale）动态拆分并生成最小化的 Split APK 发送到用户手机，平均减少 35% 以上的下载体积。同时配合 R8 编译期的代码压缩、无用资源剔除、类内联与名称混淆。',
        codeSnippet: `# proguard-rules.pro 核心防混淆规则
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod
-keepclassmembers enum * { *; }

# 保持数据传输对象 DTO 字段名不被混淆
-keepclassmembers class com.example.model.** {
    <fields>;
}`,
      },
    ],
    ios: [
      {
        tag: '安全与签名',
        title: 'iOS 签名证书体系：Certificate / Provisioning Profile / Entitlements',
        explanation: 'iOS 的安全签名体系由四部分组成：1. **Certificate（开发者证书）**：由 Apple CA 签发的公私钥对，证明安装包由合法的开发者签名；2. **App ID**：Bundle Identifier 唯一标识；3. **Entitlements**：声明应用具备的高级系统权限（如推送、Associated Domains、钥匙串共享）；4. **Provisioning Profile（描述文件）**：将上述证书、App ID、权限清单以及允许安装的设备 UDID 列表绑定加密打包，iOS 设备在安装前会使用 Apple 根公钥严格校验完整性。',
        codeSnippet: `# 查看签名信息与 Entitlements 权限清单
codesign -d --entitlements :- /path/to/MyApp.app

# 检查可执行文件的 UUID 与 dSYM 符号表匹配情况 (用于崩溃日志符号化)
dwarfdump --uuid MyApp.app/MyApp
dwarfdump --uuid MyApp.app.dSYM`,
      },
    ],
  },
};
