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

| 层次 / 功能 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 底层 HTTP 引擎 | `OkHttp` | `URLSession` | 底层 HTTP 请求与会话 |
| 声明式 API 客户端 | `Retrofit` | `URLSession + API Client` | RESTful 接口封装 |
| 现代纯异步客户端 | `Ktor Client` | `Async/Await 原生客户端` | 原生纯异步网络客户端 |
| JSON 序列化解析 | `Gson / kotlinx.serialization` | `Codable + JSONDecoder` | JSON 解析与模型编解码 |

建议顺序：

```
Android: OkHttp → Retrofit → Serialization（Ktor 可选）
iOS:     URLSession → Codable/JSONDecoder → 封装 API Client
```

**练手：** 同一个 REST 接口两端请求并解码成模型。

---

## ⑨ 本地数据存储

| 存储维度 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 轻量偏好存储 | `SharedPreferences` | `UserDefaults / @AppStorage` | 轻量键值偏好存储 |
| 响应式数据存储 | `DataStore` | `UserDefaults / 文件缓存` | 响应式偏好存储 |
| 敏感安全加密 | `EncryptedSharedPreferences / Keystore` | `Keychain` | 安全加密存储（存 Token） |
| 对象关系数据库 | `Room` | `SwiftData / CoreData` | 数据库 ORM（存大表） |
| 底层 SQL 操作 | `SQLDelight / SQLite` | `GRDB / SQLite.swift` | 原生 SQL 操作 |
| 沙盒文件读写 | `Context.filesDir / cacheDir` | `FileManager` | 沙盒文件与缓存目录 |

学习路径：

```
Android: SharedPreferences → DataStore → Room
iOS:     UserDefaults → Keychain → SwiftData（需要时再补 CoreData）
```

**练手：** 登录 token 存 Keychain + 用户设置存 UserDefaults + 一个简单本地列表用 SwiftData。

---

## ⑩ 应用架构

两端几乎同一套：**MVVM + Repository**。

| 架构分层 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 声明式 UI 层 | `Compose (@Composable)` | `SwiftUI (View)` | 声明式 UI 渲染层 |
| 业务状态层 | `ViewModel + StateFlow` | `ViewModel (@Observable)` | 业务逻辑与状态层 |
| 数据仓库层 | `Repository` | `Repository` | 数据仓库层（统管本地/网络） |
| 数据源接口 | `DataSource` | `Service / Client` | 数据源接口 |
| 基础设施层 | `Retrofit / Room` | `URLSession / SwiftData` | 底层网络与数据库 |

```
Android: UI(Compose) → ViewModel → Repository → DataSource → Network/DB
iOS:     View(SwiftUI) → ViewModel → Repository → Service → API/Store
```

**迁移注意**

- View 保持瘦：只绑状态、发意图
- 网络/数据库细节进 Repository，不要堆在 View
- iOS 的 ViewModel 常用 `@Observable` + `@MainActor`，不一定继承某个基类

**练手：** 用同一架构完成「列表 + 详情 + 收藏（本地）+ 网络刷新」。

---

## 进阶扩展

主路径跑通一个小 App 后再补。

### ⑪ 依赖注入

| 模式 / 框架 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 轻量服务定位容器 | `Koin` | `Factory` | 轻量依赖注入容器 |
| 大型编译期生成框架 | `Hilt / Dagger` | `Swinject / Resolver` | 大型依赖注入框架 |
| 原生构造解耦 | 构造函数手动注入 | `protocol + init 构造注入` | 构造函数直接传参注入（推荐） |

很多 iOS 项目直接：**protocol + 构造函数注入**，未必上框架。

### ⑫ 图片与静态资源

| 资产类型 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 资源目录 | `res/drawable / mipmap` | `Assets.xcassets` | 静态图片资产目录 |
| 内存位图 | `Bitmap` | `UIImage` | 内存位图对象 |
| 网络图片异步加载 | `Coil / Glide` | `AsyncImage / Kingfisher` | 网络图片异步加载与缓存 |
| 界面渲染绘制 | `Painter / ImageBitmap` | `Image / UIImage` | 视图图片渲染组件 |

### ⑬ 动画与转场动效

| 动画类型 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 状态驱动属性动画 | `animate*AsState / updateTransition` | `withAnimation / .animation` | 状态驱动平滑动画 |
| 元素转场进出 | `AnimatedVisibility` | `.transition` | 元素显隐与进退场转场 |
| 跨层级共享元素 | `MotionLayout / SharedElement` | `matchedGeometryEffect` | 跨页面共享元素形变动效 |

### ⑭ 系统能力

实战高频，主路径未展开，迁移时优先补：

| 系统能力 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 敏感权限申请 | `Manifest + runtime permission` | `Info.plist + 系统授权弹窗` | 动态敏感权限申请 |
| 后台任务调度 | `WorkManager` | `BackgroundTasks (BGTaskScheduler)` | 系统受控后台任务调度 |
| 远程消息推送 | `FCM (Firebase Cloud Messaging)` | `APNs` | 远程消息推送通道 |
| 外部深链直达 | `App Links / Intent Filter` | `Universal Links / URL Scheme` | 外部链接直达页面 (Deep Link) |

### ⑮ 单元测试与 UI 测试

| 测试类型 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 单元测试框架 | `JUnit` | `XCTest` | 单元测试与逻辑断言 |
| 自动化 UI 测试 | `Espresso / Compose UI Test` | `XCUITest` | 自动化 UI 界面测试 |
| 异步数据流测试 | `runTest / Turbine` | `async/await XCTest / expectation` | 异步并发与数据流测试 |

### ⑯ 打包构建与应用发布

| 发布阶段 | Android 体系 | iOS 体系 | 核心说明 |
| --- | --- | --- | --- |
| 构建多环境配置 | `Build Variants / Flavors` | `Build Schemes / Configurations` | 开发/测试/正式多环境配置 |
| 打包产物格式 | `APK / AAB` | `IPA / Xcode Archive` | 打包分发安装包产物 |
| 应用管理后台 | `Google Play Console` | `App Store Connect` | 开发者发布管理后台 |
| 代码签名与安全 | `Keystore / Play App Signing` | `Certificates / Provisioning Profiles` | 证书签名与描述文件校验 |

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

