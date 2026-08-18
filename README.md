# Android → iOS 学习路线图（LearningCockpit）

> 💡 **在线互动版与本地 Web 驾驶舱**：本项目已配套提供现代化静态 Web 单页应用，支持即时搜索、聚焦学习卡、中英双语与本地打卡进度持久化。
> - **本地运行**：`npm install && npm run dev`（访问 `http://localhost:3000`）
> - **静态构建**：`npm run build`（纯静态产物输出至 `dist/`）
> - **自动部署**：支持 GitHub Pages、Cloudflare Pages、Vercel 等零服务器免费托管。

---

# Android → iOS 学习路线图

目标：从 **Android（Kotlin）** 迁移到 **iOS（Swift）**。

按**移动端开发知识体系**学，而不是按语法逐条背。Kotlin / Swift 只是工具；真正要迁移的是 App 开发能力。

**怎么用这份资料**

- 已会 Android：每阶段重点看 **iOS 列** 和「迁移注意」
- 两端都在学：先 Android 模块，再立刻学 iOS 对应模块，形成映射
- 路线分为 10 个核心主路径阶段与 6 个进阶扩展阶段

---

## 推荐学习顺序总览

```
【核心主路径】
① 开发环境          Android Studio     ↔  Xcode
② 语言与类型系统    Kotlin             ↔  Swift（含 struct / ARC）
③ 生命周期          Activity/Fragment  ↔  App / Scene / scenePhase
④ UI                Compose            ↔  SwiftUI
⑤ 状态管理          StateFlow/VM       ↔  @State / @Observable
⑥ 导航              NavHost            ↔  NavigationStack
⑦ 异步              Coroutine          ↔  Swift Concurrency
⑧ 网络              Retrofit + OkHttp  ↔  URLSession + Codable
⑨ 数据存储          DataStore / Room   ↔  UserDefaults / SwiftData
⑩ 架构              MVVM + Repository（两端基本一致）

【进阶扩展】
⑪ 依赖注入 · ⑫ 图片资源 · ⑬ 动画 · ⑭ 权限/后台/推送 · ⑮ 测试 · ⑯ 发布
```

---

## ① 开发环境与工程结构

**阶段目标：** 掌握 Xcode 与 Android Studio 的工程映射体系，理解 Project、Target、SPM/CocoaPods 依赖、Info.plist 与 Assets 资产管理。

| 维度 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 核心 IDE | Android Studio | Xcode | 官方开发工具与模拟器 |
| 构建与依赖 | Gradle | SPM / CocoaPods | 编译与依赖管理（iOS 优先 SPM） |
| 工程与工作区 | settings.gradle.kts | .xcodeproj / .xcworkspace | 单工程与工作区文件 |
| 应用清单 | AndroidManifest.xml | Info.plist + Capabilities | 应用信息与权限配置 |
| 编译配置 | app/build.gradle.kts | Target Build Settings | 打包目标与签名配置 |
| 模块化拆分 | Module (app / library) | Target / Framework / SPM Package | 子模块与组件化拆分 |
| 资源管理 | res/ (drawable, values) | Assets.xcassets | 图片、颜色与多语言资源 |
| 代码签名 | Keystore (.jks) / Play Signing | Certificate + Provisioning Profile | 证书、描述文件与签名 |
| 打包产物 | APK / AAB | IPA / Xcode Archive | 安装包产物与归档格式 |

**目录与工程结构全景对照：**

```
【Android 工程结构】                【iOS Xcode 工程结构】
MyApplication/                      MyApplication.xcodeproj/ (或 .xcworkspace)
 ├── build.gradle.kts                ├── MyApplication/
 ├── settings.gradle.kts             │    ├── MyApplicationApp.swift (@main 入口)
 └── app/                            │    ├── ContentView.swift (首屏 View)
      ├── build.gradle.kts           │    ├── Info.plist (权限与配置元数据)
      └── src/main/                  │    ├── Assets.xcassets (图标/颜色/图片)
           ├── AndroidManifest.xml   │    └── Preview Content/ (预览 Mock 资产)
           ├── java/ or kotlin/      └── MyApplicationTests/ (单元测试 Target)
           └── res/
```

**迁移避坑指南：**
1. **依赖管理（SPM vs CocoaPods）**：现代 iOS 优先使用 Xcode 原生内置的 **Swift Package Manager (SPM)**（直接在 Xcode 粘贴 GitHub 仓库 URL，免装命令行与 Ruby 环境）；若维护包含 CocoaPods (`Podfile`) 的老项目，运行 `pod install` 后**必须打开白色图标的 `.xcworkspace`**，切勿打开蓝色 `.xcodeproj`，否则会报找不到依赖库的编译错误！
2. **Gradle DSL 语法说明**：Android 老项目常见 `build.gradle` (Groovy 语法)，现代新项目默认采用 `build.gradle.kts` (Kotlin DSL，具代码补全与强类型检查)，其 `dependencies { ... }` 对应 iOS 的 SPM Package 依赖声明。
3. **文件索引机制**：Xcode 是**索引制**（Project-based），在 Finder 中直接拷入文件不会自动出现在工程中；必须拖入 Xcode 并勾选 `Add to targets` 与 `Copy items if needed`。
4. **多 Target 体系**：一个 Xcode Project 可挂载多个 Target（主 App、Widget 小组件、Notification Extension、测试 Target），类似 Android 根工程下的多 Module。
5. **权限必填描述**：所有敏感权限（相机、相册、定位、通知等）必须在 `Info.plist` 中配置明确的 Privacy Usage Description（如 `NSCameraUsageDescription`），否则调用时系统会**直接崩溃闪退**。

**练手实战任务：** 在 Xcode 中新建一个 SwiftUI App 工程，观察 Target 设置与 Signing 签名，体验 SPM 引入一个开源库（如 Alamofire），并将代码 Run 到 iOS 模拟器。

---

## ② 语言基础与类型系统

**阶段目标：** 深入掌握 Kotlin ↔ Swift 语法映射，透彻理解 struct 值语义、ARC 弱引用、POP 面向协议编程与 Enum 关联值。  
**核心认知：** Swift 中 `struct` 是第一等公民（值类型 / 自动深拷贝 / 线程安全）；内存管理采用 ARC 计数制，闭包强引用必须显式使用 `[weak self]`。

### 模块一：变量、函数与空安全（基础语法）

| 语言特性 / 场景 | Kotlin (Android) | Swift (iOS) | 核心说明 |
| --- | --- | --- | --- |
| 不可变常量 | `val x = 1` | `let x = 1` | 常量（只读）不可重新赋值 |
| 可变变量 | `var y = 2` | `var y = 2` | 可变变量 |
| 基础数据类型 | `Int`, `Double`, `Boolean`, `String` | `Int`, `Double`, `Bool`, `String` | 强类型，基本命名一致 |
| 函数声明 | `fun foo(x: Int): String` | `func foo(x: Int) -> String` | 函数声明与返回值 |
| 参数外部标签 | 命名参数 `foo(x = 1)` | `func sum(_ a: Int, for b: Int)` | 函数参数标签 |
| 空安全类型 | `String?` | `String?` | 可空包装类型 |
| 安全调用 | `user?.name` | `user?.name` | 安全链式调用 |
| 空合并 / 默认值 | `user?.name ?: "默认"` | `user?.name ?? "默认"` | `?:` 对应 `??` |
| 强制解包 | `user!!.name` | `user!.name` | 强行解包（空则闪退） |
| 可选绑定解包 | `user?.let { ... }` | `if let user = user { ... }` | 安全解包作用域 |
| 卫语句提前返回 | `if (user == null) return` | `guard let user = user else { return }` | 卫语句提前退出 |

### 模块二：面向对象与值语义（核心心智差异）

| 维度 / 机制 | Kotlin (Android) | Swift (iOS) | 核心说明 |
| --- | --- | --- | --- |
| 数据模型 | `data class User(val id: String)` | `struct User { let id: String }` | 结构体（值拷贝）vs 类（引用） |
| 共享类声明 | `class Manager` | `class Manager` | 跨组件共享引用才用 class |
| 抽象协议 / 接口 | `interface Clickable` | `protocol Clickable` | 接口与面向协议编程 (POP) |
| 默认实现扩展 | 接口内写默认函数 | `extension Clickable { func onClick() }` | 扩展方法与默认实现 |
| 继承 vs 组合 | `open class Base` ➔ `class Child` | `protocol + extension` 组合 | 协议拼装组合优先 |
| 单例模式 | `object AppConfig` | `class AppConfig { static let shared = ... }` | 静态属性单例 |

### 模块三：高级类型、枚举与泛型

| 语言特性 / 场景 | Kotlin (Android) | Swift (iOS) | 核心说明 |
| --- | --- | --- | --- |
| 带关联值枚举 | `sealed class UiState` | `enum UiState { case success(Data) }` | 密封类与带值枚举（状态机） |
| 模式匹配 | `when (state) { is Loading -> ... }` | `switch state { case .success(let data): ... }` | 条件分支与穷尽匹配 |
| 泛型约束 | `class Repo<T : Comparable>` | `class Repo<T: Comparable>` | 泛型占位与类型约束 |
| 类型别名 | `typealias UserId = String` | `typealias UserId = String` | 类型别名定义 |
| 类型判断与强转 | `is String` / `as? String` | `is String` / `as? String` | 类型判断与安全强转 |

### 模块四：闭包、错误处理与内存模型（避坑重点）

| 机制 / 场景 | Kotlin (Android) | Swift (iOS) | 核心说明 |
| --- | --- | --- | --- |
| 闭包 / Lambda | `{ item -> item.id }` / `it.id` | `{ item in item.id }` / `{ $0.id }` | 闭包与尾随简写 |
| 尾随闭包 | `Button { println() }` | `Button { print() }` | 尾随闭包直接放末尾 |
| 内存回收模型 | JVM GC | ARC | 垃圾回收 (GC) vs 引用计数 (ARC) |
| 闭包循环引用 | GC 自动处理 | `[weak self]` 捕获列表 | 闭包持有 self 须用 weak |
| 抛出与捕获错误 | `@Throws` / `try-catch` | `throws` / `do-catch` | 异常抛出与捕获 |
| 可选执行 | 无原生直接对应 | `try? load()` | 抛错转为可空 nil |

**语言特性与心智体系全景对照：**

```
[ 语言基础与心智模型对照 ]

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
   iOS:     ARC                       [引用计数即时释放 / 闭包须 weak self]
```

**迁移避坑指南：**
1. **值类型主导 vs 引用类型**：Swift 中 `struct` 是第一等公民（UI State、数据模型、SwiftUI View 均为 struct），传参与赋值为自动深拷贝，天生线程安全；只有需要跨组件共享可变状态时才使用 `class`。
2. **ARC 内存管理与闭包循环引用**：Swift 采用自动引用计数 (ARC) 而非 JVM GC！当闭包持有 `self` 且 `self` 也持有该闭包时，必须使用 `[weak self]` 弱引用打破循环引用，否则将导致严重内存泄漏。
3. **Optional 可空性最佳实践**：优先使用 `guard let ... else { return }` 卫语句提前返回，或 `if let` 可选绑定；严禁在生产代码滥用强行解包运算符 `!`。
4. **面向协议编程 (POP) vs 类继承**：Android 习惯用抽象基类继承；iOS 体系强烈推崇 `protocol` + `extension` 默认实现，通过协议拼装与组合实现多态与解耦。
5. **强大的 Enum 关联值**：Swift 的 `enum` 支持为每个分支绑定不同类型的关联值 (Associated Values)，能原生替代 Kotlin 中绝大多数 `sealed class` 状态机建模场景。

**练手实战任务：** 用 Swift 实现一套带关联值的 Result 枚举与 User Model（对比 struct 与 class 拷贝行为），定义一个 Repository 协议并用 extension 提供默认实现，最后在异步闭包中使用 `[weak self]` 模拟网络回调解包数据。

---

## ③ 生命周期

不要拿 Activity 去硬套 SwiftUI！必须**分代横向对齐**：传统时代对标 UIKit，现代时代对标 Compose。

### 3.1 模块一：传统时代（命令式 UI：Activity / Fragment ↔ UIKit）

| 职责 / 阶段 | Android (传统 View 体系) | iOS (传统 UIKit 体系) | 核心说明 |
| --- | --- | --- | --- |
| 全局应用 | `Application` | `UIApplicationDelegate` / `AppDelegate` | 全局应用入口与代理 |
| 页面级控制器 | `Activity` | `UIViewController` | 经典页面级控制器 |
| 子页面/片段 | `Fragment` | `Child UIViewController` | 子页面与局部视图 |
| 视图初始化 | `onCreate()` / `setContentView()` | `viewDidLoad()` / `loadView()` | 页面初次加载与初始化 |
| 页面即将/已经可见 | `onStart()` ➔ `onResume()` | `viewWillAppear()` ➔ `viewDidAppear()` | 页面出现与获取焦点 |
| 页面离开/不可见 | `onPause()` ➔ `onStop()` | `viewWillDisappear()` ➔ `viewDidDisappear()` | 页面离开与失去焦点 |
| 销毁与释放 | `onDestroy()` | `deinit` | 实例销毁与资源释放 |

### 3.2 模块二：现代时代（声明式 UI：Jetpack Compose ↔ SwiftUI）

| 职责 / 概念 | Android (Jetpack Compose) | iOS (SwiftUI) | 核心说明 |
| --- | --- | --- | --- |
| 应用根入口 | `Single Activity + setContent` | `@main struct App: App` (`WindowGroup`) | 声明式应用主入口 |
| UI 基本单元 | `@Composable fun Screen()` | `struct ScreenView: View` | UI 纯函数 vs View 结构体 |
| 挂载异步任务 | `LaunchedEffect(key) { }` | `.task(id:) { }` | 异步任务（离开视图自动取消） |
| 视图出现 / 消失 | `DisposableEffect / onDispose` | `.onAppear` / `.onDisappear` | 视图出现与消失监听 |
| 系统前后台状态 | `LifecycleEventObserver` | `@Environment(\.scenePhase)` | 监听 App 前后台切换 |
| 业务状态持有者 | `ViewModel` (`onCleared`) | `@Observable class ViewModel` (`deinit`) | 业务模型生命周期 |

**代际与层级对照：**

```
【传统命令式】
Android: Application → Activity → Fragment → View
iOS:     UIApplication → UIWindow → UIViewController → UIView

【现代声明式】
Android: Single Activity → Compose @Composable 函数
iOS:     @main App → WindowGroup (Scene) → SwiftUI View 结构体
```

**迁移注意：**
- **分代对齐**：Activity 对应的是传统 UIKit 的 UIViewController，绝不要拿 Activity 概念硬套 SwiftUI View！
- SwiftUI `View` 是短命结构体（如 Compose 函数），没有 `onCreate` 回调；进入异步任务用 `.task`，离开自动取消。
- 页面可见性看 `.onAppear` / `.onDisappear`；系统前后台看 `@Environment(\.scenePhase)`。
- 真正的业务与数据生命周期属于 `@Observable ViewModel` 类，而不是依附在 UI 视图树上。

**练手：** 分别用 `.task` 加载异步数据、用 `.onAppear/.onDisappear` 监听视图出现、用 `scenePhase` 监听应用切前后台，对比 Compose 的 `LaunchedEffect` / `DisposableEffect` 日志。

---

## ④ UI 布局与核心控件

**阶段目标：** 直接从 Jetpack Compose 迁移到 SwiftUI：掌握核心容器布局、基础控件与 Modifier 链式调用。  
**核心认知：** 两者皆为现代声明式 UI，思想高度一致；最大区别在于 **SwiftUI Modifier 的包装顺序**与**容器闭包子视图数量约束**。

### 模块一：核心容器与流式列表（布局骨架）

| 布局类型 | Android (Compose) | iOS (SwiftUI) | 核心说明 |
| --- | --- | --- | --- |
| 垂直排列 | `Column` | `VStack` | 垂直线性排布 |
| 水平排列 | `Row` | `HStack` | 水平线性排布 |
| 层叠覆盖 | `Box` | `ZStack` | 层叠覆盖排布 |
| 惰性纵向列表 | `LazyColumn` | `List` / `LazyVStack` | 滚动列表（系统样式 vs 自定义） |
| 惰性网格布局 | `LazyVerticalGrid` | `LazyVGrid(columns:)` | 网格多列布局 |
| 基础滚动容器 | `Modifier.verticalScroll()` | `ScrollView` | 内容滚动视图 |
| 弹性占位扩展 | `Spacer()` / `Modifier.weight(1f)` | `Spacer()` | 弹性弹簧占位 |
| 分割线 | `HorizontalDivider()` | `Divider()` | 横向细分割线 |

### 模块二：常用基础控件（原子组件）

| 控件类型 | Android (Compose) | iOS (SwiftUI) | 核心说明 |
| --- | --- | --- | --- |
| 文本显示 | `Text("...")` | `Text("...")` | 文本内容展示 |
| 文本输入 | `TextField` / `BasicTextField` | `TextField` / `SecureField` | 文本与密码输入框 |
| 交互按钮 | `Button(onClick = { })` | `Button("...", action: { })` | 点击交互按钮 |
| 图标与图片 | `Image` / `Icon` | `Image("...")` / `Image(systemName:)` | 本地图片与系统矢量图标 |
| 开关与选择 | `Switch` / `Checkbox` | `Toggle(isOn: $isOn)` | 开关与多选组件 |
| 进度指示器 | `CircularProgressIndicator` | `ProgressView()` | 环形/条形加载进度 |

### 模块三：Modifier 链式修饰与尺寸（样式机制）

| 修饰类型 | Android (Compose) | iOS (SwiftUI) | 核心说明 |
| --- | --- | --- | --- |
| 链式包装 | `Modifier.padding().background()` | `.padding().background()` | 修饰符从上至下依次包装 |
| 尺寸撑满 | `fillMaxWidth()` / `fillMaxSize()` | `.frame(maxWidth: .infinity)` | 尺寸撑满与外框限制 |
| 点击手势 | `Modifier.clickable { }` | `.onTapGesture { }` | 点击与手势识别 |
| 圆角裁剪 | `Modifier.clip(RoundedCornerShape(8.dp))` | `.clipShape(RoundedRectangle(cornerRadius: 8))` | 圆角与形状裁剪 |
| 投影阴影 | `Modifier.shadow(4.dp)` | `.shadow(radius: 4)` | 阴影投影效果 |
| 安全区域 | `Modifier.systemBarsPadding()` | `.ignoresSafeArea()` | 屏幕安全区适配 |

**布局容器与修饰符思维映射：**

```
【核心容器】Column ➔ VStack | Row ➔ HStack | Box ➔ ZStack | LazyColumn ➔ List / LazyVStack
【尺寸撑满】fillMaxWidth() ➔ .frame(maxWidth: .infinity) | fillMaxSize() ➔ .frame(maxWidth: .infinity, maxHeight: .infinity)
【修饰机制】Modifier.padding().background() ➔ .padding().background() (从上至下依次包装 View)
【系统图标】Icon(Icons.Default.Star) ➔ Image(systemName: "star.fill") (内置 SF Symbols)
```

**迁移避坑指南：**
1. **Modifier 链式包装机制**：SwiftUI Modifier 是从上至下依次向外包装新 View（如 `.padding().background(Color.blue)` 是外层垫边距后加背景，而 `.background(Color.blue).padding()` 是先加背景再垫外边距，视觉效果截然不同）。
2. **ViewBuilder 容器限制**：SwiftUI 容器闭包内同级直接子视图默认不能超过 10 个（TupleView 限制），超出需用 `Group` 或抽取独立子 View。
3. **List vs LazyVStack 选型**：`List` 内置了 iOS 原生分组、分割线、侧滑操作等系统行为；若需要完全自定义流式瀑布流，使用 `ScrollView { LazyVStack { ... } }`。
4. **SF Symbols 原生图标库**：iOS 系统内置数千款矢量图标，直接写 `Image(systemName: "heart.fill")` 即可，免除手动切图适配。

**练手实战任务：** 分别用 Compose 与 SwiftUI 编写同款商品卡片（包含图片、标题、价格、SF Symbols 图标与点击按钮），体会 Modifier 链式调用差异。

---

## ⑤ 状态管理与数据流

**阶段目标：** 精准掌握 Compose 与 SwiftUI 各状态 API 的应用场景：视图私有状态、父子双向绑定、ViewModel 业务模型、场景暂存恢复、磁盘偏好与全局环境。  
**核心认知：** 声明式 UI 的核心是**状态所有权与单向数据流**：谁拥有真实数据源（Source of Truth），谁向下分发，子组件通过引用或事件反向修改。

### 模块一：视图私有状态与父子双向绑定（局部 UI 交互）

| 应用场景 | Android (Compose) | iOS (SwiftUI) | 核心说明 |
| --- | --- | --- | --- |
| 视图内部私有状态 | `remember { mutableStateOf(x) }` | `@State private var x` | 视图私有状态（变了就刷新） |
| 父子双向绑定传递 | `(value, onValueChange)` | `@Binding var value` | 父子双向绑定（子改父也改） |
| 派生计算与缓存 | `remember { derivedStateOf { } }` | `var prop: Type { ... }` | 派生计算属性（自动缓存） |

### 模块二：业务状态流与 ViewModel 响应式模型（页面级状态）

| 应用场景 | Android (Compose) | iOS (SwiftUI) | 核心说明 |
| --- | --- | --- | --- |
| 现代响应式 ViewModel | `class MyVM : ViewModel() + StateFlow` | `@Observable @MainActor class MyVM` | 页面级模型（细粒度精准刷新） |
| UI 订阅与消费流 | `collectAsStateWithLifecycle()` | `vm.prop` / `@Bindable` | 读取状态（只刷用到的地方） |

### 模块三：持久化偏好、场景暂存与环境注入（全局与系统级）

| 应用场景 | Android (Compose) | iOS (SwiftUI) | 核心说明 |
| --- | --- | --- | --- |
| 场景/多窗口草稿暂存 | `rememberSaveable { ... }` | `@SceneStorage("draft_id")` | 旋转与切后台草稿暂存 |
| 磁盘持久化用户偏好 | `DataStore` | `@AppStorage("setting_key")` | 轻量设置持久化（重启还在） |
| 树级全局环境注入 | `CompositionLocalProvider / LocalContext` | `@Environment(\.colorScheme)` | 跨层级全局环境注入 |

**状态管理 API 核心应用场景选型矩阵：**

```
[ 状态管理 API 核心应用场景选型矩阵 ]

 1. 视图私有状态 (组件内临时变量/展开/计数)
    Android: remember { mutableStateOf(x) }
    iOS:     @State private var x

 2. 父子双向绑定 (向子组件开放数据读写权限)
    Android: (value, onValueChange) 状态提升下发
    iOS:     @Binding var value  <-- 父组件传递 $value 引用指针

 3. 派生状态计算 (基于其他状态自动缓存)
    Android: remember(key) { derivedStateOf { ... } }
    iOS:     计算属性 var isReady: Bool { ... } (自动追踪依赖)

 4. 页面级 ViewModel (跨组件业务模型与状态流)
    Android: class MyVM : ViewModel() + StateFlow
    iOS:     @Observable @MainActor class MyVM (iOS 17+ 属性级追踪)

 5. 场景与进程级暂存恢复 (屏幕旋转/切后台草稿恢复)
    Android: rememberSaveable { mutableStateOf(...) }
    iOS:     @SceneStorage("draft_text")

 6. 磁盘持久化偏好 (App 重启仍保留/设置项)
    Android: DataStore (Flow 键值响应式流)
    iOS:     @AppStorage("is_dark_mode") (声明式属性包装器)

 7. 树级全局环境注入 (无需层层传参获取系统属性)
    Android: CompositionLocalProvider / LocalContext.current
    iOS:     @Environment(\.colorScheme) / @Environment(UserSession.self)
```

**迁移避坑指南：**
1. **状态作用域选型黄金法则**：视图内部私有用 `@State`；子组件读写父状态用 `@Binding`；页面级复杂业务进 `@Observable ViewModel`；跨多层级全局配置用 `@Environment`。
2. **@AppStorage vs @SceneStorage 本质区别**：`@AppStorage` 是磁盘持久化（底层 `UserDefaults`，App 重启保留，适合设置项）；`@SceneStorage` 是场景/窗口级暂存（类似 `rememberSaveable`，退出应用可能丢失）。
3. **SwiftUI 响应式状态模型**：`@Observable` 具备「属性级精准追踪」，仅被 View 实际读取的字段变动才会触发重绘，对应 Compose 的细粒度 Recomposition 机制。
4. **@Binding 双向引用指针**：Compose 习惯状态提升（传入 `value` 与 `onValueChange` 回调）；SwiftUI 传入 `$state` 绑定指针，子组件修改直接同步至父组件数据源。

**练手实战任务：** 编写一个用户偏好设置与计数器页面：包含 `@State` 私有计数器、`@Binding` 双向开关子组件、`@AppStorage` 夜间模式持久化，并在 `@Observable` ViewModel 中管理网络用户列表。

---

## ⑥ 页面导航与路由

**阶段目标：** 掌握 Nav3 纯声明式强类型数据驱动路由、ResultEventBus 事件总线与跨页面结果回传闭环（Compose Navigation 3 ↔ SwiftUI NavigationStack）。  
**核心认知：** 现代声明式路由的本质是**「可观察的状态列表」**；页面跳转即 `List.add`，返回即 `List.removeLast`，彻底告别 URL 字符串拼接与视图级强绑定。

### 模块一：强类型路由定义与状态栈管理

| 导航操作 / 维度 | Android (Nav3 纯声明式) | iOS (SwiftUI 16+ NavigationStack) | 核心说明 |
| --- | --- | --- | --- |
| 强类型路由节点 | `@Serializable data class Detail(id: String)` | `enum AppRoute: Hashable { case detail(id: String) }` | 强类型路由目标（类型安全） |
| 状态栈数据源 | `val backStack = rememberNavBackStack()` | `@State var path: [AppRoute] = []` | 纯列表驱动的路由栈 |
| 页面跳转 (压栈) | `backStack.add(Detail(...))` | `path.append(.detail(...))` | 跳转新页面（压栈） |
| 页面返回 (出栈) | `backStack.pop()` / `backStack.removeLast()` | `path.removeLast()` / `dismiss()` | 返回上一页（出栈） |
| 一键回首页 | `backStack.clear()` | `path.removeAll()` | 一键清栈回首页 (Pop to Root) |

### 模块二：参数传递与页面结果回传

| 数据传递场景 | Android (Nav3 体系) | iOS (SwiftUI 体系) | 核心说明 |
| --- | --- | --- | --- |
| 正向参数传递 | `Detail(id: String)` | `case detail(id: String)` | 路由直接带参数跳转 |
| Nav3 官方结果总线 | `LocalResultEventBus.current.sendResult(data)` | `@Binding var selected: Item` | 返回结果（Nav3 事件总线 vs SwiftUI 绑定指针） |
| 结果监听响应 | `ResultEffect<T> { result -> ... }` | `@Binding` 自动同步 / 闭包响应 | 监听并接收返回结果 |
| 函数式状态提升回调 | `NavDisplay` 注入 `onResult: (T) -> Unit` | `navigationDestination` 注入 `onResult` 闭包 | 回调闭包传值并出栈 |
| 共享域模型写入 | 共享 ViewModel `StateFlow` | 共享 `@Observable` ViewModel | 共享 ViewModel 传值 |
| 模态弹窗选择回传 | `ModalBottomSheet` | `.sheet(isPresented:)` | 底部抽屉与模态弹窗 |

### 模块三：页面呈现容器与多端适配

| 容器类型 / 场景 | Android (Nav3) | iOS (SwiftUI) | 核心说明 |
| --- | --- | --- | --- |
| 路由呈现容器 | `NavDisplay(backStack) { route -> when(route) }` | `NavigationStack(path: $path) + .navigationDestination` | 页面路由容器 |
| 大屏/分屏支持 | `NavDisplay` | `NavigationSplitView(sidebar:detail:)` | 平板/折叠屏分栏布局 |
| 底部导航选项卡 | `NavigationBar + NavDisplay` | `TabView(selection: $tab)` | 底部选项卡多分支容器 |
| 模态弹窗/抽屉 | `ModalBottomSheet / Dialog` | `.sheet(isPresented:) / .fullScreenCover` | 底部抽屉与模态弹窗 |

**Nav3 ↔ SwiftUI 纯数据驱动路由与 ResultEventBus 结果回传闭环：**

```
[ Nav3 与 SwiftUI 现代纯数据驱动导航与数据回传闭环 ]

 1. 强类型路由节点定义:
    Android (Nav3):   @Serializable data class CityPickerRoute
    iOS (SwiftUI):    enum AppRoute: Hashable { case cityPicker }

 2. 状态栈管理 (纯 List 数据源):
    Android (Nav3):   val backStack = rememberNavBackStack(HomeRoute)
    iOS (SwiftUI):    @State var path: [AppRoute] = []

 3. 栈操作映射 (压栈 / 出栈 / 回首页):
    跳转压栈:   backStack.add(CityPickerRoute)      <->  path.append(.cityPicker)
    返回出栈:   backStack.pop()                     <->  path.removeLast() / dismiss()
    一键回首页: backStack.clear()                   <->  path.removeAll()

 4. 跨页面返回结果 (Nav3 ResultEventBus ↔ SwiftUI @Binding / 闭包):
    【Android Nav3 方式：ResultEventBus】
      // 1. 发送端 (CityPickerScreen)
      val resultBus = LocalResultEventBus.current
      Button(onClick = {
          resultBus.sendResult(City("Shanghai")) // 发送结果事件
          backStack.pop()                        // 出栈返回
      }) { Text("选择上海") }

      // 2. 接收端 (HomeScreen)
      ResultEffect<City> { selectedCity ->
          viewModel.onCitySelected(selectedCity) // 声明式监听回传事件
      }

    【iOS SwiftUI 方式：@Binding 指针双向绑定】
      // 1. 目标选择页 (CityPickerView)
      struct CityPickerView: View {
          @Binding var selectedCity: String
          @Environment(\.dismiss) private var dismiss
          var body: some View {
              Button("选择上海") {
                  selectedCity = "Shanghai" // 原地修改父状态
                  dismiss()                 // 关闭返回
              }
          }
      }

      // 2. 接收端 (HomeScreen)
      NavigationStack(path: $path) {
          HomeScreen(selectedCity: selectedCity)
              .navigationDestination(for: AppRoute.self) { route in
                  CityPickerView(selectedCity: $selectedCity)
              }
      }
```

**迁移避坑指南：**
1. **纯数据驱动核心心智**：现代声明式路由本质是「可观察的状态列表」；页面跳转即 `List.add`，返回即 `List.removeLast`，告别任何字符串硬编码与视图嵌套。
2. **强类型路由与解耦**：Android 借助 Kotlinx Serialization、iOS 借助 Hashable 枚举，实现编译期全类型安全与页面按需惰性构建。
3. **Nav3 官方 ResultEventBus 体系**：在 Navigation 3 中，Google 提供了专为 `NavEntry` 设计的 `ResultEventBus`（配合 `LocalResultEventBus` 与 `ResultEffect<T>` 监听），彻底抛弃了 Nav2 的 `savedStateHandle` 字符串黑盒；而在 SwiftUI 中，最地道优雅的做法正是与其同构的 `@Binding` 双向绑定指针（原地修改父状态源并 `dismiss()`），两端均告别了传统隐式黑盒通道。
4. **平板与多窗分栏适配**：单栏使用 `NavigationStack`，iPad/折叠屏双栏分屏使用 `NavigationSplitView(sidebar:detail:)`，对标 Nav3 的多窗 `NavDisplay`。

**练手实战任务：** 定义强类型路由，使用 Nav3 的 `ResultEventBus` / `NavDisplay` 回调与 SwiftUI 的 `NavigationStack(path:)` / `@Binding` 实现「列表压栈跳转 ➔ 详情选择并利用 `sendResult` / `@Binding` 回传结果并出栈 ➔ 一键回首页 (Pop to Root)」完整闭环。

---

## ⑦ 异步与并发

**阶段目标：** 深入掌握 Kotlin 协程与 Swift Concurrency 并发体系：Task、TaskGroup、Flow/StateFlow/SharedFlow 响应式流与 Actor 状态隔离。  
**核心认知：** 两端并发模型高度同构：挂起函数 (`suspend` ↔ `async`)、并发任务 (`launch` ↔ `Task`)、数据流 (`Flow` ↔ `AsyncSequence`)、线程安全 (`Mutex` ↔ `actor`)。

### 模块一：协程、任务与调度（任务并发）

| 概念 / API | Android (Kotlin 协程) | iOS (Swift Concurrency) | 核心说明 |
| --- | --- | --- | --- |
| 异步挂起函数 | `suspend fun load()` | `func load() async` | 异步函数标记（不卡线程） |
| 启动并发任务 | `CoroutineScope.launch { }` | `Task { }` | 启动异步并发任务 |
| 并发合并等待 | `async { } / await()` | `async let / await` | 并发执行并合并等待 |
| 任务组动态并发 | `coroutineScope { ... }` | `withTaskGroup { group in ... }` | 任务组动态并发 |
| 主线程 UI 调度 | `withContext(Dispatchers.Main)` | `@MainActor / MainActor.run` | 切主线程刷 UI |
| 后台 IO 调度 | `withContext(Dispatchers.IO)` | `Task.detached` | 切后台 IO 线程 |
| 非阻塞延时休眠 | `delay(1000)` | `try await Task.sleep(for: .seconds(1))` | 非阻塞延时休眠 |
| 任务协作式取消 | `job.cancel() / isActive` | `task.cancel() / Task.isCancelled` | 任务协作式取消 |

### 模块二：数据流、热流与事件通道（响应式流）

| 流类型 / 场景 | Android (Flow 体系) | iOS (Swift Concurrency / Combine) | 核心说明 |
| --- | --- | --- | --- |
| 异步冷数据流 | `Flow<T> / flow { emit(x) }` | `AsyncSequence<T>` | 异步冷数据流 |
| 状态热流 (UI 状态) | `StateFlow / MutableStateFlow(x)` | `@Observable 属性 / CurrentValueSubject` | 状态热流（防抖保底） |
| 事件广播热流 (单次事件) | `SharedFlow / MutableSharedFlow()` | `AsyncStream<T> / PassthroughSubject` | 事件广播热流（一次性事件） |
| 管道队列通道 (队列分发) | `Channel<T>()` | `AsyncStream<T> / AsyncChannel` | 管道队列通道（一对一消费） |
| 回调转异步流 | `callbackFlow { }` | `AsyncStream { continuation in }` | 旧回调转异步流 |
| 监听与消费流 | `flow.collect { item -> }` | `for await item in stream { }` | 监听并消费数据流 |
| 流操作符变换 | `.map { }.filter { }` | `.map { }.filter { }` | 流操作符变换处理 |

### 模块三：并发安全与状态隔离（线程安全）

| 同步机制 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 引用类型状态隔离 | `Mutex` | `actor` | 线程安全与并发隔离 |
| 原子变量与无锁操作 | `AtomicInteger / AtomicBoolean` | `OSAllocatedUnfairLock / Atomic` | 原子变量与无锁同步 |

**异步并发与数据流体系全景对照：**

```
[ 异步并发与响应式流全景对照 ]

 1. 基础任务启动与合并:
    Android: CoroutineScope.launch { } | async { } / await() | coroutineScope { }
    iOS:     Task { }                  | async let / await   | withTaskGroup { }

 2. 线程切换与调度:
    主线程 UI: Android: withContext(Dispatchers.Main) ↔ iOS: @MainActor / MainActor.run
    后台 IO:   Android: withContext(Dispatchers.IO)   ↔ iOS: Task.detached

 3. 响应式流对标 (冷流 vs 状态热流 vs 事件热流):
    【冷数据流 (按需拉取)】:
      Android: flow { emit(1) }
      iOS:     AsyncStream { continuation in continuation.yield(1) } / AsyncSequence
    【状态热流 (UI 状态 / 有默认值 / 防抖)】:
      Android: val uiState = MutableStateFlow(initialState)
      iOS:     @Observable class ViewModel (属性级追踪) 或 CurrentValueSubject
    【事件广播热流 (弹窗/Toast/单次事件)】:
      Android: val eventFlow = MutableSharedFlow<UiEvent>()
      iOS:     AsyncStream<UiEvent> 或 PassthroughSubject
    【管道队列 (生产者-消费者)】:
      Android: val channel = Channel<Task>()
      iOS:     AsyncChannel<Task> / AsyncStream

 4. 线程安全与并发锁:
    Android: val mutex = Mutex(); mutex.withLock { ... }
    iOS:     actor BankAccount { var balance = 0; func deposit() { ... } } (编译器强制数据隔离)
```

**迁移避坑指南：**
1. **UI 刷新切主线程**：Android 使用 `Dispatchers.Main`，iOS 在 UI 类（如 ViewModel）前加 `@MainActor`，或在需要时调用 `MainActor.run { ... }`。
2. **StateFlow vs SharedFlow 在 iOS 的映射**：
   - `StateFlow` 对应 iOS 17+ 的 `@Observable` 模型属性（或 Combine 的 `CurrentValueSubject`），具备最新状态保持与防抖机制；
   - `SharedFlow` / `Channel` 对应 Swift 的 `AsyncStream`（或 Combine 的 `PassthroughSubject`），适合一次性弹窗、导航跳转或事件总线。
3. **Actor 彻底消除数据竞争**：Swift 编译器对 `actor` 实施严格的隔离检查，跨 actor 访问必须 `await`，从编译期杜绝多线程竞争。

**练手实战任务：** 使用 `Task` + `withTaskGroup` 并发请求多个 API，并在 ViewModel 中分别使用 `StateFlow`/`@Observable` 驱动界面状态，用 `SharedFlow`/`AsyncStream` 广播一次性 Toast 提示，使用 `actor` 实现一个并发安全的自增计数器。

---

## ⑧ 网络请求与数据解析

**阶段目标：** 掌握现代网络请求与数据解析全流程：URLSession 异步请求、Codable 高性能编解码、拦截器封装与错误处理机制。  
**核心认知：** iOS 极度推崇原生内置哲学：无需引入 Retrofit 或复杂第三方库，原生 `URLSession` + `async/await` + `Codable` 即可优雅搞定类型安全、高性能的网络请求与 JSON 编解码。

### 模块一：HTTP 引擎与请求构建（网络传输）

| 场景 / 功能 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 底层会话引擎 | `OkHttpClient` | `URLSession(configuration:)` | 底层网络会话引擎 |
| 异步 GET 请求 | `client.newCall(request).execute()` | `URLSession.shared.data(from: url)` | 简单 GET 异步请求 |
| 构造请求体与 Header | `Request.Builder().url().post(body)` | `var request = URLRequest(url:)` | 构造请求头与请求体 |
| 声明式 REST 客户端 | `Retrofit (@GET / @POST)` | `URLSession + API Client` | 声明式 REST 接口封装 |
| 拦截器与中间件 | `OkHttp Interceptor` | `URLProtocol / URLSessionConfiguration` | Token 与日志拦截器 |

### 模块二：JSON 编解码与序列化（数据解析）

| 解析机制 / 策略 | Android (Kotlinx / Gson) | iOS (Swift Codable) | 核心说明 |
| --- | --- | --- | --- |
| 模型编解码协议 | `@Serializable` | `Codable (Decodable & Encodable)` | 模型编解码协议标记 |
| JSON 反序列化 | `Json.decodeFromString<T>(text)` | `JSONDecoder().decode(T.self, from: data)` | JSON 字节反序列化为模型 |
| 对象序列化为 JSON | `Json.encodeToString(model)` | `JSONEncoder().encode(model)` | 模型对象序列化为 JSON |
| 自定义字段映射 | `@SerialName("user_id")` | `enum CodingKeys: String, CodingKey` | 自定义字段键名映射 |
| 蛇形下划线转驼峰 | `Json { namingStrategy = SnakeCase }` | `decoder.keyDecodingStrategy = .convertFromSnakeCase` | 蛇形下划线自动转驼峰 |
| 日期时间解析策略 | `JsonBuilder { ... }` | `decoder.dateDecodingStrategy = .iso8601` | 日期时间自动解析策略 |

### 模块三：高级传输、异常与实时通信（健壮性与流）

| 高级场景 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 状态码与响应校验 | `response.isSuccessful / code` | `(response as? HTTPURLResponse)?.statusCode` | HTTP 状态码与响应校验 |
| 网络异常与超时 | `HttpException / IOException` | `URLError` | 网络异常与超时捕获 |
| 流式大文件下载 | `ResponseBody.byteStream()` | `URLSession.shared.bytes(from: url)` | 流式大文件下载与读取 |
| 多段文件表单上传 | `MultipartBody.Builder()` | `URLSession.shared.upload(for:from:)` | 多段文件表单上传 |
| SSL 证书锁定防抓包 | `CertificatePinner` | `URLSessionDelegate` | SSL 证书锁定防抓包 |
| 全双工实时通信 | `WebSocketListener` | `URLSessionWebSocketTask` | 全双工实时通信 |

**现代网络请求与数据编解码全景对照：**

```
[ 现代网络请求与数据编解码全景对照 ]

 1. 简单异步 GET 请求:
    Android (OkHttp + Coroutines):
      val request = Request.Builder().url("https://api.example.com/users").build()
      val response = okHttpClient.newCall(request).await()
      val jsonString = response.body?.string()

    iOS (Swift Concurrency + URLSession):
      let (data, response) = try await URLSession.shared.data(from: url)
      guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
          throw URLError(.badServerResponse)
      }

 2. 构造 POST 请求与请求头:
    Android:
      val body = jsonString.toRequestBody("application/json".toMediaType())
      val request = Request.Builder()
          .url("https://api.example.com/login")
          .header("Authorization", "Bearer $token")
          .post(body)
          .build()

    iOS:
      var request = URLRequest(url: url)
      request.httpMethod = "POST"
      request.setValue("application/json", forHTTPHeaderField: "Content-Type")
      request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
      request.httpBody = try JSONEncoder().encode(loginPayload)
      let (data, response) = try await URLSession.shared.data(for: request)

 3. Codable 极速编解码与蛇形转驼峰:
    【Swift Data Model】
      struct User: Identifiable, Codable {
          let id: Int
          let userName: String  // 自动从服务端的 user_name 映射
          let createdAt: Date   // 自动按照 ISO8601 解析
      }

    【解码配置】
      let decoder = JSONDecoder()
      decoder.keyDecodingStrategy = .convertFromSnakeCase
      decoder.dateDecodingStrategy = .iso8601
      let user = try decoder.decode(User.self, from: data)
```

**迁移避坑指南：**
1. **无需硬套 Retrofit**：iOS 原生 `URLSession` + `async/await` 极其轻巧，通常只需手写一个通用的 `APIClient` 结构体/类（包含 `baseURL`、`headers` 与 `request<T: Decodable>()` 方法），即可替代庞大的第三方网络库。
2. **校验 HTTP 状态码**：`URLSession.shared.data(for:)` 只要网络连通（即便返回 404 或 500）都不会抛出 Swift 异常；必须显式将 `response` 下转型为 `HTTPURLResponse` 并检查 `statusCode`。
3. **下划线命名首选 convertFromSnakeCase**：当服务端下发 `snake_case` 字段时，直接指定 `decoder.keyDecodingStrategy = .convertFromSnakeCase`，模型属性直接写驼峰 `userName`，无需编写繁琐的 `enum CodingKeys`。
4. **大文件下载用 bytes(from:)**：对应 Android 的 `ResponseBody.byteStream()`，iOS 使用 `URLSession.shared.bytes(from: url)` 异步流，边下边读，避免撑爆内存。

**练手实战任务：** 使用原生 `URLSession` + `async/await` + `Codable` 封装一个通用的 `APIClient`：支持自动附加 Bearer Token、全局开启蛇形转驼峰与 ISO8601 时间解析、并在 401 响应时统一拦截抛出业务错误。

---

## ⑨ 本地数据存储

**阶段目标：** 掌握本地存储与数据持久化全景：UserDefaults 偏好、Keychain 硬件级加密、SwiftData 声明式 ORM 与沙盒文件读写。  
**核心认知：** 持久化分层选型清晰：轻量配置用 `@AppStorage`，敏感凭据入 `Keychain`，大表数据用 `SwiftData`，大文件/图片存沙盒 `Documents`。

### 模块一：键值偏好与安全加密（偏好与安全）

| 存储维度 / 场景 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 传统键值偏好 | `SharedPreferences` | `UserDefaults.standard` | 轻量键值偏好存储 |
| 声明式偏好绑定 | `DataStore (Preferences)` | `@AppStorage("key")` | 轻量设置持久化（重启还在） |
| 跨扩展/App 共享 | `ContentProvider 跨进程` | `UserDefaults(suiteName:)` | 组件与多 App 共享数据 |
| 硬件加密凭据 | `EncryptedSharedPreferences / KeyStore` | `Keychain (SecItem)` | 安全加密存储（存 Token） |
| 生物识别解锁 | `BiometricPrompt + KeyStore` | `LocalAuthentication + Keychain` | 生物识别解锁凭据 |

### 模块二：对象关系数据库（ORM 与 SQL）

| 数据库特性 / 场景 | Android (Room 体系) | iOS (SwiftData / CoreData) | 核心说明 |
| --- | --- | --- | --- |
| 实体模型注解 | `@Entity data class Item` | `@Model class Item` | 数据库实体模型注解 |
| 主键与唯一约束 | `@PrimaryKey` | `@Attribute(.unique)` | 主键与唯一性约束 |
| 数据库容器注入 | `Room.databaseBuilder()` | `.modelContainer(for:)` | 数据库容器与上下文配置 |
| 响应式数据查询 | `@Dao @Query(...) Flow<List<T>>` | `@Query var items: [Item]` | 响应式自动刷新数据查询 |
| 增删改查操作 | `dao.insert(item) / dao.delete(item)` | `modelContext.insert() / delete()` | 增删改查实体操作 |
| 关系与级联删除 | `@Relation / foreignKeys` | `@Relationship(deleteRule:)` | 实体关联与级联删除 |
| 原生 SQL 查询 | `Room RawQuery / SQLDelight` | `GRDB.swift / SQLite.swift` | 原生 SQL 灵活查询 |

### 模块三：沙盒文件系统与缓存（文件与目录）

| 文件系统操作 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 用户专属文档目录 | `context.filesDir` | `FileManager (.documentDirectory)` | 用户专属持久化文档目录 |
| 系统可清缓存目录 | `context.cacheDir` | `FileManager (.cachesDirectory)` | 系统可清理临时缓存目录 |
| 磁盘文件直接读写 | `file.writeText() / file.readBytes()` | `data.write(to:) / Data(contentsOf:)` | 磁盘文件直接读写 |
| 文件与目录管理 | `file.mkdirs() / file.delete()` | `FileManager.createDirectory() / removeItem()` | 文件与文件夹增删管理 |

**本地持久化与数据库全景对照：**

```
[ 本地持久化与数据库全景选型对照 ]

 1. 声明式键值偏好 (@AppStorage ↔ DataStore):
    Android:
      val THEME_KEY = booleanPreferencesKey("is_dark_mode")
      val isDarkMode: Flow<Boolean> = context.dataStore.data.map { it[THEME_KEY] ?: false }

    iOS (SwiftUI 原生绑定，变动自动重绘):
      @AppStorage("is_dark_mode") private var isDarkMode: Bool = false

 2. Keychain 硬件安全加密存储 (存储 Token 与敏感凭据):
    【Keychain 写入与读取 (建议使用 KeychainAccess 等封装或原生 SecItem)】
      // 写入 Token
      let query: [String: Any] = [
          kSecClass as String: kSecClassGenericPassword,
          kSecAttrAccount as String: "authToken",
          kSecValueData as String: "token_abc123".data(using: .utf8)!
      ]
      SecItemAdd(query as CFDictionary, nil)

 3. SwiftData 现代声明式数据库 (iOS 17+ vs Android Room):
    【实体模型定义】
      @Model
      final class TodoItem {
          @Attribute(.unique) var id: String
          var title: String
          var isDone: Bool
          var createdAt: Date

          init(id: String = UUID().uuidString, title: String, isDone: Bool = false) {
              self.id = id
              self.title = title
              self.isDone = isDone
              self.createdAt = Date()
          }
      }

    【View 内部直接响应式查询与操作】
      struct TodoListView: View {
          @Environment(\.modelContext) private var modelContext
          @Query(sort: \TodoItem.createdAt, order: .reverse) private var todos: [TodoItem]

          var body: some View {
              List {
                  ForEach(todos) { todo in
                      Text(todo.title)
                  }
                  .onDelete { indexSet in
                      for index in indexSet {
                          modelContext.delete(todos[index])
                      }
                  }
              }
              Button("添加任务") {
                  modelContext.insert(TodoItem(title: "新任务"))
              }
          }
      }
```

**迁移避坑指南：**
1. **持久化选型黄金法则**：UI 设置项用 `@AppStorage` / `UserDefaults`；敏感 Token 必须入 `Keychain` 硬件加密；大表结构化数据用 `SwiftData` / `Room`；大体积文件/图片放沙盒 `Documents`/`Caches`。
2. **SwiftData 极简开发体验**：基于 Swift 宏直接在纯 class 上标记 `@Model`，View 内部直接写 `@Query` 声明式自动监听数据变化，无需编写任何 SQL、DAO 或编译期注解处理器 (KSP)。
3. **Keychain 独立于沙盒**：与 Android KeyStore 类似，Keychain 独立于 App 沙盒，即使卸载重装 App 凭据也不会丢失，并原生支持 Face ID / Touch ID 生物识别授权。
4. **沙盒目录分工**：`.documentDirectory` 用户生成数据会被 iCloud 自动备份；`.cachesDirectory` 系统可在空间不足时自动清空，切勿将核心不可再生数据存入缓存区。

**练手实战任务：** 使用 `Keychain` 存取用户 Token、使用 `@AppStorage` 保存夜间模式偏好、使用 SwiftData (`@Model` + `@Query`) 实现本地待办清单增删改查，并使用 `FileManager` 保存一张头像图片至 `Documents` 目录。

---

## ⑩ 应用架构

**阶段目标：** 深入掌握现代移动端架构全景：Clean Architecture 分层体系、UDF 单向数据流、MVI/TCA 状态建模与 SPM/Gradle 模块解耦。  
**核心认知：** 两端架构思想高度统一：View 声明式渲染 UI，ViewModel 单向流出不可变 `UiState`，领域用例与 `Repository` 统管数据源，通过 `Protocol` / `interface` 依赖倒置实现跨模块解耦。

### 模块一：架构分层与数据流向（Clean Architecture）

| 架构分层 / 职责 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 声明式 UI 表现层 | `Compose (@Composable)` | `SwiftUI (View)` | 声明式 UI 渲染层 |
| 业务状态管理层 | `class VM : ViewModel() + StateFlow` | `@Observable @MainActor class VM` | 业务逻辑与状态层 |
| 领域用例层 (Clean) | `class GetUserUseCase(repo)` | `struct GetUserUseCase` | 领域用例与业务规则 |
| 数据仓库抽象与实现 | `interface Repo / RepoImpl` | `protocol Repo / RepoImpl` | 数据仓库层（统管本地/网络） |
| 远程与本地底层数据源 | `RemoteDataSource / LocalDataSource` | `RemoteService / LocalStore` | 远程与本地底层数据源 |
| 统一结果与响应封包 | `Result<T> / UiState<T>` | `Result<T, Error> / AsyncPhase<T>` | 统一结果与状态封包 |

### 模块二：单向数据流与状态建模（UDF / MVI / TCA）

| 机制 / 模式 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 不可变状态数据模型 | `data class UiState(...)` | `struct UiState` | 不可变 UI 状态数据模型 |
| 交互意图事件定义 | `sealed interface UiIntent` | `enum UiIntent` | 用户交互意图事件定义 |
| 单向数据流闭环 | `Intent ➔ ViewModel ➔ State ➔ UI` | `Intent ➔ ViewModel ➔ State ➔ UI` | 单向数据流闭环 |
| 单次副作用（弹窗/导航） | `Channel<UiEffect> / SharedFlow` | `AsyncStream<UiEffect>` | 单次副作用事件（弹窗/跳转） |
| 主流架构模式选型 | `MVVM / MVI (Orbit)` | `MVVM / TCA (The Composable Architecture)` | 主流应用架构模式选型 |

### 模块三：工程组件化与模块解耦（Modularity & Decoupling）

| 组件化策略 | Android 体系 (Gradle) | iOS 体系 (SPM / Targets) | 核心说明 |
| --- | --- | --- | --- |
| 功能与核心分包 | `:app / :core / :feature:login` | `App Target / Core SPM / Feature SPM` | 功能与核心组件化分包 |
| 依赖倒置与接口下沉 | `interface 下沉 domain 模块` | `protocol 下沉 Core 模块` | 依赖倒置与接口下沉 |
| 依赖注入装配根节点 | `Hilt @Module / Koin module` | `AppContainer / Factory` | 依赖注入组装根节点 |

**现代移动端应用架构与单向数据流全景对照：**

```
[ 现代移动端应用架构与单向数据流全景对照 ]

 1. Clean Architecture + UDF 状态流向:
    【UI 层 (View)】
      用户点击 "刷新" ➔ 发送 Intent: .refresh
    【ViewModel 层】
      接收 Intent ➔ 将 uiState 置为 .loading ➔ 调用 GetNewsUseCase / Repository
    【Repository 仓库层】
      网络拉取 (URLSession) ➔ 本地缓存入库 (SwiftData) ➔ 返回领域模型
    【ViewModel 层】
      将 uiState 置为 .success(newsList)
    【UI 层 (View)】
      SwiftUI / Compose 监测到 State 变更 ➔ 细粒度精准重绘列表

 2. 现代 iOS Clean MVVM + UDF 代码实现范式:
    【State 与 Intent 状态建模】
      struct NewsUiState {
          var isLoading: Bool = false
          var items: [NewsItem] = []
          var errorMessage: String? = nil
      }

      enum NewsUiIntent {
          case loadInitial
          case refresh
          case toggleBookmark(id: String)
      }

    【ViewModel 业务状态机】
      @Observable
      @MainActor
      final class NewsViewModel {
          private(set) var uiState = NewsUiState()
          private let repository: NewsRepositoryProtocol

          init(repository: NewsRepositoryProtocol) {
              self.repository = repository
          }

          func send(_ intent: NewsUiIntent) async {
              switch intent {
              case .loadInitial, .refresh:
                  uiState.isLoading = true
                  do {
                      let items = try await repository.fetchLatestNews()
                      uiState.items = items
                      uiState.isLoading = false
                  } catch {
                      uiState.errorMessage = error.localizedDescription
                      uiState.isLoading = false
                  }
              case .toggleBookmark(let id):
                  try? await repository.toggleBookmark(id: id)
              }
          }
      }

    【声明式 View 消费】
      struct NewsListView: View {
          @State private var viewModel: NewsViewModel

          var body: some View {
              List(viewModel.uiState.items) { item in
                  NewsRow(item: item)
              }
              .overlay {
                  if viewModel.uiState.isLoading { ProgressView() }
              }
              .task {
                  await viewModel.send(.loadInitial)
              }
              .refreshable {
                  await viewModel.send(.refresh)
              }
          }
      }
```

**迁移避坑指南：**
1. **MVVM + UDF 核心心智**：View 保持极简纯净（只绑 State、发 Intent）；ViewModel 拥有唯一的真实状态源 (`StateFlow` / `@Observable`)；禁止在 View 内部直接发起数据库或网络请求。
2. **Repository 单一数据源**：Repository 统管内存缓存、本地数据库 (`Room` / `SwiftData`) 与网络请求 (`Retrofit` / `URLSession`)，向上层暴露统一的 Flow 或 async 方法，屏蔽数据来源细节。
3. **MVI 与 TCA 架构演进**：对于复杂交互流，使用 sealed class / enum 将用户动作建模为严格的 Intent，状态建模为不可变 State，彻底杜绝多线程状态不一致与 race condition。
4. **工程组件化最佳实践**：Android 依赖 Gradle 多模块，iOS 优先使用 SPM Package 多 Target 拆分（Domain / Data / Feature），通过 Protocol 依赖倒置实现跨模块完全解耦与独立编译加速。

**练手实战任务：** 按照 Clean Architecture + MVVM + UDF 架构重构一个完整的资讯阅读器 App：包含 `UiState` 不可变状态、`UiIntent` 意图驱动、`Repository` 统一拉取与本地收藏缓存、以及基于 Protocol 的 Mock 测试注入。

---

## 进阶扩展

主路径跑通一个小 App 后再补。

### ⑪ 依赖注入

**阶段目标：** 掌握 iOS 依赖注入最佳实践：原生 Protocol + 构造注入、SwiftUI `@Environment` 传递、Factory 现代容器与 Hilt/Koin 差异。  
**核心认知：** iOS 首选原生极简解耦：无需过早引入复杂注解框架，80% 以上的项目仅靠 `Protocol` + 构造函数默认参数即可优雅实现业务解耦与单测 Mock。

#### 模块一：原生解耦与构造注入（官方推荐）

| 模式 / 场景 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 依赖抽象契约 | `interface ApiService` | `protocol ApiServiceProtocol` | 面向协议抽象解耦 |
| 构造函数传参注入 | `class MyVM(val repo: Repo)` | `init(repo: RepoProtocol = LiveRepo())` | 构造函数直接传参注入 |
| 顶层依赖组装容器 | `object AppContainer { ... }` | `final class AppContainer` | 轻量静态依赖容器 |
| 视图树级环境注入 | `CompositionLocalProvider(...)` | `@Environment(\.apiClient)` | SwiftUI 环境级依赖注入 |
| 单元测试与预览替换 | `FakeRepo : Repo` | `MockRepo : RepoProtocol` | Mock 测试与预览无缝替换 |

#### 模块二：现代轻量 DI 容器 (Factory)

| 容器特性 / 语法 | Android (Koin) | iOS (Factory) | 核心说明 |
| --- | --- | --- | --- |
| 服务容器定义 | `val appModule = module { ... }` | `Container.shared.repo = Factory { ... }` | 编译期安全服务定义 |
| 属性包装器注入 | `val vm: MyVM by viewModel()` | `@Injected(\.repo) private var repo` | 属性包装器自动解析 |
| 生命周期与作用域 | `single { } / factory { }` | `.singleton / .unique / .shared` | 单例与多例作用域控制 |
| 测试与 Preview 覆盖 | `loadKoinModules(mockModule)` | `Container.shared.repo.register { ... }` | 环境覆盖与 Preview 注入 |

#### 模块三：大型运行时框架与选型哲学

| 维度 / 框架 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 大型编译期代码生成 | `Hilt (@AndroidEntryPoint)` | `Needle (Uber 编译期强类型 DI)` | 大型工程编译期生成 DI |
| 运行时服务定位与解析 | `Koin (get() / by inject())` | `Swinject / Resolver` | 运行时服务定位与解析 |
| 跨端选型哲学差异 | `Hilt 为官方必选标准` | `原生 Protocol + init 占 80%` | iOS 极简与轻量化哲学 |

**依赖注入与服务解耦全景对照：**

```
[ 依赖注入与服务解耦全景对照 ]

 1. 原生 Protocol + 构造函数注入 (iOS 官方最推荐范式):
    【契约定义】
      protocol NewsRepositoryProtocol: Sendable {
          func fetchNews() async throws -> [NewsItem]
      }

    【ViewModel 构造注入 (默认参数带线上实现，无需第三方框架)】
      @Observable
      @MainActor
      final class NewsViewModel {
          private let repository: NewsRepositoryProtocol

          init(repository: NewsRepositoryProtocol = LiveNewsRepository()) {
              self.repository = repository
          }
      }

    【Xcode Preview 与单测极速 Mock】
      #Preview {
          NewsView(viewModel: NewsViewModel(repository: MockNewsRepository()))
      }

 2. 现代轻量容器 Factory (类似 Koin 体验):
    【容器定义】
      import Factory

      extension Container {
          var newsRepository: Factory<NewsRepositoryProtocol> {
              self { LiveNewsRepository() }.singleton
          }
      }

    【类中直接属性注入】
      final class NewsViewModel: ObservableObject {
          @Injected(\.newsRepository) private var repository
      }
```

**迁移避坑指南：**
1. **切勿盲目引入复杂框架**：Android 习惯使用 Hilt（带反射/APT/KSP 生成），而 iOS 社区更推崇轻量无魔法。新工程优先使用 `Protocol + init` 构造注入，规模扩大后再考虑引入 `Factory`。
2. **SwiftUI 善用 @Environment**：跨多个视图层级共享的服务（如全局网络 Client、认证状态），直接使用 `@Environment` 注入，避免层层构造传递。
3. **Mock 隔离数据库与网络**：所有对外的 Repository 必须以 Protocol 暴露，单测只测 ViewModel 业务状态机，不产生真实 I/O 损耗。

**练手实战任务：** 定义 `UserRepositoryProtocol`，使用原生构造函数注入编写 `UserViewModel`，并在 SwiftUI Preview 中通过 Mock 实现离线预览，随后使用 Factory 体验容器化注入。

### ⑫ 图片与静态资源

**阶段目标：** 掌握 iOS 图像与资源体系全景：Assets 资产目录、PDF/SVG 矢量适配、AsyncImage/Kingfisher 网络缓存与 UIImage 内存位图处理。  
**核心认知：** `Assets.xcassets` 统管多倍图与深浅色模式，矢量图勾选 Single Scale 免切图；UI 图片缩放必加 `.resizable().aspectRatio(contentMode:)`。

#### 模块一：资产目录与多倍图适配

| 资产类型 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 资源目录 | `res/drawable / mipmap` | `Assets.xcassets` | 静态图片资产目录 |
| 矢量图适配 | `VectorDrawable (.xml)` | `PDF / SVG (Single Scale)` | 矢量图无损缩放 |
| 屏幕多倍图 | `hdpi / xhdpi / xxhdpi` | `1x / 2x / 3x` | 屏幕分辨率倍图适配 |
| 颜色与深浅模式 | `res/values/colors.xml (night)` | `Color Set (Any / Dark)` | 自适应深浅色颜色集 |

#### 模块二：网络图片异步加载与缓存

| 加载机制 / 策略 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 原生异步图片 | `SubcomposeAsyncImage` | `AsyncImage(url:)` | 原生异步图片加载组件 |
| 第三方图片库 | `Coil / Glide` | `Kingfisher (KFImage) / Nuke` | 网络图片异步加载与缓存 |
| 占位与失败图 | `placeholder / error` | `placeholder / failure content` | 占位图与加载失败降级 |
| 多级缓存策略 | `MemoryCache + DiskCache` | `ImageCache.default (Kingfisher)` | 内存与磁盘多级缓存策略 |

#### 模块三：内存位图与图像处理

| 图像处理 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 内存位图对象 | `Bitmap` | `UIImage / CGImage` | 内存位图对象 |
| 视图图片渲染 | `Image(bitmap:)` | `Image(uiImage:)` | 视图图片渲染组件 |
| 裁剪与内容模式 | `ContentScale.Crop / Fit` | `.aspectRatio(contentMode: .fill / .fit)` | 裁剪缩放与宽高比控制 |
| 滤镜与着色效果 | `Modifier.blur() / tint` | `.blur(radius:) / .colorMultiply()` | 模糊滤镜与着色渲染 |

**图片与静态资源全景对照：**

```
[ 图片与静态资源处理全景对照 ]

 1. 矢量图导入与 Single Scale:
    Android: 导入 svg/xml ➔ res/drawable/ic_logo.xml (VectorDrawable)
    iOS:     拖入 Assets.xcassets ➔ 选中图片 ➔ Attributes Inspector ➔ Scales 选「Single Scale」 (免切 3 套图)

 2. 异步网络图片加载范式:
    【原生内置 AsyncImage (iOS 15+)】
      AsyncImage(url: URL(string: "https://example.com/avatar.png")) { phase in
          switch phase {
          case .empty:
              ProgressView()
          case .success(let image):
              image
                  .resizable()
                  .aspectRatio(contentMode: .fill)
                  .frame(width: 80, height: 80)
                  .clipShape(Circle())
          case .failure:
              Image(systemName: "person.crop.circle.badge.exclamationmark")
                  .foregroundStyle(.gray)
          @unknown default:
              EmptyView()
          }
      }

    【第三方 Kingfisher (对标 Coil / Glide)】
      KFImage(URL(string: "https://example.com/banner.jpg"))
          .placeholder { ProgressView() }
          .setProcessor(RoundCornerImageProcessor(cornerRadius: 12))
          .cacheMemoryOnly()
          .resizable()
          .aspectRatio(contentMode: .fit)
```

**迁移避坑指南：**
1. **Image 缩放链式规则**：SwiftUI 中 `Image` 默认按原始像素尺寸绘制，撑满外框必须链式声明 `.resizable().aspectRatio(contentMode: .fill).frame(...)`，遗漏 `.resizable()` 会导致图片无法缩放。
2. **矢量图 Single Scale 机制**：Assets 导入 SVG/PDF 时，必须勾选「Single Scale」与「Preserve Vector Data」，Xcode 才会自动生成全分辨率位图并在放大时保持矢量清晰度。
3. **AsyncImage 缓存局限**：原生 `AsyncImage` 仅依赖基础的 `URLCache`，不支持精细的磁盘过期策略与内存上限控制；对高性能瀑布流推荐使用成熟的 `Kingfisher`。

**练手实战任务：** 在 Assets 中配置一套自适应浅/深色模式的主题 Color Set 与 SVG 图标，使用 `AsyncImage` 实现带有加载骨架屏与失败重试占位图的网络商品图列表。

---

### ⑬ 动画与转场动效

**阶段目标：** 深入掌握声明式动效系统：状态驱动属性动画、物理弹簧曲线、转场过渡 (Transitions) 与跨层级共享元素 (matchedGeometryEffect)。  
**核心认知：** SwiftUI 动画与 Compose 同样基于状态插值；iOS 极度推崇物理弹簧 `.spring()` 质感；跨层级平滑变形使用 `matchedGeometryEffect`。

#### 模块一：声明式属性动画与弹簧曲线

| 动画类型 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 隐式属性动画 | `animate*AsState` | `.animation(.spring(), value: state)` | 状态驱动隐式属性动画 |
| 显式触发动画 | `Animatable / LaunchedEffect` | `withAnimation { state.toggle() }` | 闭包显式触发全局动画 |
| 物理弹簧曲线 | `spring(dampingRatio, stiffness)` | `.spring(response:dampingFraction:)` | 高品质弹簧物理曲线 |
| 缓动与贝塞尔 | `tween(duration, Easing)` | `.easeInOut(duration:) / .timingCurve` | 线性与贝塞尔缓动曲线 |

#### 模块二：视图进退场转场动效

| 转场场景 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 进退场转场 | `AnimatedVisibility(enter, exit)` | `if cond { View } + .transition(...)` | 元素显隐与进退场转场 |
| 组合转场动效 | `fadeIn() + slideInVertically()` | `.opacity.combined(with: .slide)` | 渐变与位移组合转场 |
| 内容形态切换 | `AnimatedContent` | `.contentTransition(.numericText())` | 数字与内容切换平滑过渡 |

#### 模块三：手势驱动与高级动效

| 高级动效 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 跨层级共享元素 | `SharedTransitionLayout` | `matchedGeometryEffect(id:in:namespace)` | 跨页面共享元素形变动效 |
| 拖拽手势交互 | `pointerInput + Modifier.offset` | `DragGesture() + .offset(...)` | 拖拽手势实时交互动画 |
| 关键帧与多阶段 | `KeyframesSpec` | `PhaseAnimator / KeyframeAnimator` | 多阶段序列与关键帧动画 |

**声明式动画与转场体系全景对照：**

```
[ 声明式动画与转场全景对照 ]

 1. 物理弹簧与显式动画:
    Android:
      val scale by animateFloatAsState(targetValue = if (isPressed) 0.95f else 1.0f, animationSpec = spring())
    iOS:
      Button("Tap Me") {
          withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
              isExpanded.toggle()
          }
      }
      .scaleEffect(isExpanded ? 1.1 : 1.0)

 2. matchedGeometryEffect 共享元素形变 (对标 Compose SharedTransition):
    struct SharedCardView: View {
        @Namespace private var animationNamespace
        @State private var isDetail = false

        var body: some View {
            if !isDetail {
                RoundedRectangle(cornerRadius: 16)
                    .fill(.blue)
                    .matchedGeometryEffect(id: "card_shape", in: animationNamespace)
                    .frame(width: 120, height: 120)
                    .onTapGesture {
                        withAnimation(.spring(response: 0.5, dampingFraction: 0.8)) { isDetail = true }
                    }
            } else {
                RoundedRectangle(cornerRadius: 28)
                    .fill(.blue)
                    .matchedGeometryEffect(id: "card_shape", in: animationNamespace)
                    .frame(maxWidth: .infinity, maxHeight: 300)
                    .onTapGesture {
                        withAnimation(.spring(response: 0.5, dampingFraction: 0.8)) { isDetail = false }
                    }
            }
        }
    }
```

**迁移避坑指南：**
1. **.animation(value:) 必须绑定状态**：从 iOS 15 开始，无参数的 `.animation()` 已被废弃；必须使用 `.animation(.spring(), value: targetState)` 明确监听状态，避免无意触发意外重绘动画。
2. **.transition 必须在条件分支内**：`.transition(...)` 必须挂载在由 `if/else` 或 `ForEach` 动态增删的视图上，并在外部通过 `withAnimation { ... }` 触发状态变更才会生效。
3. **matchedGeometryEffect 必须共用 Namespace**：两个变形视图必须处于同一个 `@Namespace` 作用域内，且赋予完全相同的 `id` 字符串。

**练手实战任务：** 实现一个高质感商品详情动效：包含列表卡片点击通过 `matchedGeometryEffect` 展开至全屏大图、弹簧物理阻尼按钮点击缩放反馈、以及下拉拖拽手势实时跟手缩放返回列表。

---

### ⑭ 系统能力

**阶段目标：** 掌握 iOS 核心系统能力与后台机制：Info.plist 隐私权限申请、BackgroundTasks 后台保活、APNs 远程推送与 Universal Links 外部直达。  
**核心认知：** 隐私权限必须先声明 Info.plist 描述文案；后台保活严格受控于 BackgroundTasks；远程推送统一由 APNs 分发。

#### 模块一：权限申请与隐私合规

| 权限机制 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 权限静态声明 | `AndroidManifest <uses-permission>` | `Info.plist (Privacy Usage Description)` | 隐私权限静态声明描述 |
| 运行时动态授权 | `ActivityResultContracts.RequestPermission` | `AVCaptureDevice / UNUserNotificationCenter` | 动态敏感权限申请 |
| 授权状态检测 | `ContextCompat.checkSelfPermission` | `authorizationStatus / openSettingsURL` | 授权状态检测与设置引导 |

#### 模块二：后台任务调度与常驻

| 后台机制 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 后台周期调度 | `WorkManager (PeriodicWorkRequest)` | `BGAppRefreshTask / BGProcessingTask` | 系统受控后台任务调度 |
| 后台定位追踪 | `FusedLocationProviderClient (Foreground Service)` | `CLLocationManager (allowsBackgroundLocationUpdates)` | 后台定位持续追踪 |
| 后台音频播放 | `MediaSessionService` | `AVAudioSession (category: .playback)` | 后台音频播放保活 |

#### 模块三：推送通知与外部直达

| 推送与直达 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 远程消息推送 | `FCM (Firebase Cloud Messaging)` | `APNs (Apple Push Notification service)` | 远程消息推送通道 |
| 本地定时通知 | `NotificationCompat.Builder` | `UNNotificationRequest + UNCalendarNotificationTrigger` | 本地定时与即时通知 |
| 域名深链直达 | `App Links (.well-known/assetlinks.json)` | `Universal Links (.well-known/apple-app-site-association)` | 外部链接直达页面 (Deep Link) |
| 自定义协议跳转 | `Custom Scheme (<data android:scheme>)` | `URL Schemes (CFBundleURLTypes)` | 自定义协议头跳转 |

**iOS 核心系统能力全景对照：**

```
[ iOS 核心系统能力与权限后台对照 ]

 1. 运行时权限申请范式 (以相机权限为例):
    【Info.plist 配置必填文案】
      <key>NSCameraUsageDescription</key>
      <string>需要使用相机拍摄头像与扫描二维码</string>

    【代码中请求授权】
      switch AVCaptureDevice.authorizationStatus(for: .video) {
      case .authorized:
          openCamera()
      case .notDetermined:
          AVCaptureDevice.requestAccess(for: .video) { granted in
              if granted { openCamera() }
          }
      case .denied, .restricted:
          guideUserToSettings() // 引导跳系统设置页
      @unknown default:
          break
      }

 2. 本地定时通知调度 (UNUserNotificationCenter):
    let content = UNMutableNotificationContent()
    content.title = "学习提醒"
    content.body = "今天完成 SwiftUI 动画章节学习了吗？"
    content.sound = .default

    let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 5, repeats: false)
    let request = UNNotificationRequest(identifier: "study_reminder", content: content, trigger: trigger)
    try await UNUserNotificationCenter.current().add(request)
```

**迁移避坑指南：**
1. **权限描述缺失必闪退**：iOS 严禁未配置 Info.plist 描述文案调用相机、相册、定位 API，只要触发直接 SIGABRT 闪退。
2. **后台无自由 Service**：iOS 不允许无限制后台常驻，切勿尝试在后台自建 WebSocket 长连接；所有后台刷新必须注册 `BGAppRefreshTask` 由系统统筹调度。
3. **Universal Links 必须双向验证**：域名必须支持 HTTPS，服务器根目录必须部署 `apple-app-site-association`，且 Xcode 的 Associated Domains 必须配置 `applinks:yourdomain.com`。

**练手实战任务：** 在 Info.plist 配置相机权限文案并编写运行时请求逻辑，使用 `UNUserNotificationCenter` 调度一个 5 秒后触发的本地通知，并在 Xcode 关联 Universal Links 域名。

---

### ⑮ 单元测试与 UI 测试

**阶段目标：** 掌握 iOS 现代化测试全景体系：XCTest 单元测试、Swift Testing 新标准、异步数据流测试与 XCUITest 界面自动化测试。  
**核心认知：** 面向 Protocol 手写 Mock 零反射；Xcode 16+ 引入现代 Swift Testing (`@Test` / `#expect`)；UI 测试通过 `accessibilityIdentifier` 定位。

#### 模块一：业务逻辑与单元测试

| 测试体系 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 单元测试框架 | `JUnit 5 (@Test)` | `XCTest (XCTestCase) / Swift Testing (@Test)` | 单元测试与逻辑断言 |
| 逻辑断言机制 | `assertEquals / assertTrue` | `XCTAssertEqual / #expect(result == expected)` | 测试断言与预期校验 |
| 面向协议 Mock | `MockK / Mockito` | `Protocol Mock (手写 Mock 对象)` | 面向协议假对象构造 |

#### 模块二：异步并发与数据流测试

| 异步测试 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 异步挂起测试 | `runTest { }` | `func testAsync() async throws` | 异步并发与数据流测试 |
| 回调等待超时 | `CountDownLatch` | `XCTestExpectation (wait:for:timeout:)` | 异步回调预期等待超时 |

#### 模块三：自动化 UI 界面测试

| UI 测试 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| UI 自动化驱动 | `Espresso / Compose UI Test` | `XCUITest (XCUIApplication)` | 自动化 UI 界面测试 |
| 控件定位查找 | `onNodeWithTag("btn")` | `app.buttons["login_button"]` | 无障碍标识符查找 |
| 模拟用户交互 | `performClick() / performTextInput()` | `element.tap() / element.typeText()` | 模拟手势点击与文本输入 |

**iOS 单元测试与 UI 测试全景对照：**

```
[ iOS 单元测试与 UI 测试代码范式 ]

 1. 现代 Swift Testing 单元测试 (Xcode 16+ / 纯宏声明):
    import Testing
    @testable import MyApp

    struct UserViewModelTests {
        @Test("验证加载用户列表成功")
        func testLoadUsersSuccess() async throws {
            let mockRepo = MockUserRepository(stubbedUsers: [User(id: "1", name: "Alex")])
            let viewModel = UserViewModel(repository: mockRepo)

            await viewModel.loadUsers()

            #expect(viewModel.uiState.users.count == 1)
            #expect(viewModel.uiState.users.first?.name == "Alex")
            #expect(!viewModel.uiState.isLoading)
        }
    }

 2. XCUITest 自动化 UI 测试:
    import XCTest

    final class LoginUITests: XCTestCase {
        func testLoginSuccessFlow() throws {
            let app = XCUIApplication()
            app.launch()

            let emailField = app.textFields["email_input"]
            emailField.tap()
            emailField.typeText("test@example.com")

            let loginBtn = app.buttons["login_button"]
            loginBtn.tap()

            let welcomeText = app.staticTexts["welcome_label"]
            XCTAssertTrue(welcomeText.waitForExistence(timeout: 3))
        }
    }
```

**迁移避坑指南：**
1. **避免重型 Mock 框架**：Android 常用 MockK/Mockito 等字节码增强框架；iOS 优先面向 `Protocol` 手写内存 Mock，编译极速且类型安全。
2. **Swift Testing vs XCTest**：新写测试代码推荐使用 `@Test` 与 `#expect`（Swift Testing），断言报错信息更丰富、支持并发并行执行。
3. **UI 测试必须声明 Accessibility ID**：SwiftUI 视图必须添加 `.accessibilityIdentifier("my_id")`，切勿使用视图文案或标题来定位 UI 元素（否则多语言适配时直接断言失败）。

**练手实战任务：** 为 ViewModel 编写一套完整的 XCTest 异步单元测试（测试成功、失败与加载状态流），并通过 XCUITest 编写一个自动化登录流测试用例。

---

### ⑯ 打包构建与应用发布

**阶段目标：** 掌握 iOS 应用构建、签名体系与上架流程：Build Schemes 多环境、Certificates & Profiles 证书签名、IPA 归档与 App Store Connect 提审。  
**核心认知：** Scheme 组合 Configuration；签名绑定证书与描述文件（推荐自动签名）；TestFlight 快速内测分发。

#### 模块一：构建变体与环境配置

| 构建配置 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 多环境变体 | `productFlavors / Build Variants` | `Build Schemes / Configurations` | 开发/测试/正式多环境配置 |
| 环境变量注入 | `buildConfigField / resValue` | `xcconfig / Info.plist` | 环境变量与 BaseURL 注入 |
| 编译优化与裁剪 | `R8 / ProGuard / minifyEnabled` | `Swift Compiler Optimization (-Osize) / Strip Debug Symbols` | 代码编译优化与符号裁剪 |

#### 模块二：签名证书与产物归档

| 签名与打包 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 签名证书体系 | `Keystore (.jks) / Play App Signing` | `Apple Developer Certificate + Provisioning Profile` | 证书签名与描述文件校验 |
| 签名托管模式 | `signingConfigs { ... }` | `Xcode Automatically manage signing` | Xcode 自动签名托管 |
| 安装包产物 | `APK / AAB (Android App Bundle)` | `IPA / Xcode Archive (.xcarchive)` | 打包分发安装包产物 |

#### 模块三：商店控制台与灰度分发

| 平台与分发 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 开发者管理后台 | `Google Play Console` | `App Store Connect` | 开发者发布管理后台 |
| 测试分发渠道 | `Google Play Internal Testing` | `TestFlight` | 测试分发与内部体验渠道 |
| 应用审核准则 | `Google Play 开发者政策` | `App Store Review Guidelines` | 应用审核指南与上架准则 |

**打包构建与应用发布全景对照：**

```
[ 打包构建与应用发布全景对照 ]

 1. 签名体系核心心智:
    【Certificate (证书)】: 证明「你是合法的 Apple 开发者」
    【App ID (Bundle Identifier)】: 证明「App 的唯一身份 (如 com.company.app)」
    【Provisioning Profile (描述文件)】: 胶水文件，将「开发者证书 + App ID + 允许安装的测试机 UDID + 开启的 Entitlements 权限」绑定封包

 2. 发布全流程流水线:
    Xcode 切换 Release Scheme
      ➔ Product ➔ Archive (生成 .xcarchive 产物)
      ➔ Organizer 窗口点击「Distribute App」
      ➔ 自动签名校验上传至 App Store Connect
      ➔ TestFlight 内部/外部公开测试分发
      ➔ 填写 App 元数据、截屏、隐私问卷与审核备注
      ➔ 提交 App Review 审核 ➔ 通过后正式上架 App Store
```

**迁移避坑指南：**
1. **自动签名优先**：初学者和中小型团队务必在 Signing & Capabilities 中勾选「Automatically manage signing」，Xcode 自动管理证书与描述文件。
2. **xcconfig 环境变量注入**：不要在代码中硬编码 `https://api.dev.com` 与 `https://api.prod.com`；使用 `Debug.xcconfig` 与 `Release.xcconfig` 将 `API_BASE_URL` 注入到 `Info.plist`。
3. **App Store 审核红线**：所有数字虚拟服务必须走 Apple IAP 内购 (StoreKit)，不得引导至外部网页支付；必须提供有效的测试账号；隐私问卷必须与 App 实际收集的数据严格一致。

**练手实战任务：** 在 Xcode 中创建 Staging 与 Release 构建配置，开启 Automatically manage signing，执行 Product → Archive 导出 .xcarchive 产物并在 Organizer 中分析包体积构成。

---

## 迁移者速查：你会 X，重点学 Y

| 你已掌握 | iOS 优先补 |
| --- | --- |
| Kotlin 语法 | `struct` / `protocol` / Optional / ARC |
| Activity 生命周期 | `scenePhase` + `onAppear`（勿硬套） |
| Compose | SwiftUI 布局与 modifier |
| ViewModel + StateFlow | `@Observable` + `@MainActor` |
| Navigation Compose | NavigationStack + Path |
| 协程 + Flow | `async/await` + Task + AsyncSequence + Actor |
| Retrofit | URLSession + Codable |
| Room | SwiftData |
| Hilt | 先手写注入，再视项目选框架 |

---

## 建议实践节奏

1. **第 1 周：** ①②③ — 空工程 + 语言差异 + 生命周期体感  
2. **第 2–3 周：** ④⑤⑥ — 用 SwiftUI 做一个多页 Demo  
3. **第 4 周：** ⑦⑧⑨ — 接真实 API + 本地缓存  
4. **第 5 周：** ⑩ — 按 MVVM 重整，再挑 ⑭⑮ 补权限与测试  
5. **之后：** 按需补 ⑪–⑬、⑯，准备上架

