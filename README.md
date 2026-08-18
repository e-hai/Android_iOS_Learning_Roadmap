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

**架构与层级结构全景对照：**

```
[ 阶段 01: 开发环境与工程结构全景对照 ]

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
    iOS:               Assets.xcassets (矢量图/颜色集) + @main App.swift 入口
```

**迁移避坑指南：**
1. **【白工程 vs 蓝工程】**：维护 CocoaPods 老项目时，`pod install` 后**必须打开白色图标的 `.xcworkspace`**，切勿打开蓝色 `.xcodeproj`，否则第三方头文件无法找到报错。
2. **【Finder 文件拖拽索引】**：Xcode 采用索引制而非物理目录监听，Finder 中新建的文件必须拖入 Xcode 并勾选 `Copy items if needed` 与 `Add to targets`。
3. **【敏感权限先入 Plist】**：相机、相册、定位等敏感权限必须在 `Info.plist` 中配置用途描述（如 `NSCameraUsageDescription`），缺少描述调用时系统直接崩溃闪退 (SIGABRT)。
4. **【依赖优先选原生 SPM】**：现代 iOS 优先使用 Xcode 内置的 Swift Package Manager (SPM)，直接粘贴 GitHub URL，告别第三方包管理工具配置损耗。

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

**架构与层级结构全景对照：**

```
[ 阶段 02: 语言基础与类型系统全景对照 ]

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
    Swift:             Automatic Reference Counting(ARC) ──▶ [编译期计数即时释放 / 闭包须 weak self]
```

**迁移避坑指南：**
1. **【默认 Struct 引用选 Class】**：UI State、数据 Model、SwiftUI View 默认全用 `struct`（值拷贝/天然线程安全）；只有跨组件共享可变状态时才使用 `class`。
2. **【闭包必加 weak self】**：Swift 采用引用计数 (ARC) 而非 JVM GC；闭包捕获 `self` 时必须声明 `[weak self]` 并用 `guard let self else { return }` 解包，防止循环引用导致内存泄漏。
3. **【避免强制解包感叹号】**：严禁在生产代码滥用 `!` 强解 Optional；优先使用 `guard let` 卫语句提前退出或 `if let` 可选绑定安全解包。
4. **【POP 组合优于 Class 继承】**：摒弃 Android 的抽象基类继承思维，拥抱 Swift 的 Protocol + `extension` 默认实现，通过面向协议拼装实现多态解耦。

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

**架构与层级结构全景对照：**

```
[ 阶段 03: 传统与现代生命周期解耦对照 ]

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
    iOS:               @Environment(\.scenePhase) (.active / .inactive / .background)

 4. 【业务模型生命周期】
    Android:           ViewModel (在 onCleared 销毁释放)
    iOS:               @Observable class ViewModel (在 deinit 析构释放)
```

**迁移避坑指南：**
1. **【切勿硬套 Activity 概念】**：SwiftUI View 是短命不可变的轻量结构体，对应 Compose 函数；切勿用 Activity 或 UIViewController 思维硬套 SwiftUI View。
2. **【异步启动用 .task】**：进入页面发起异步请求使用 `.task` 修饰符，当视图离开屏幕时系统会自动协作式取消 Task，无需手动管理 Job 生命周期。
3. **【前后台监听 scenePhase】**：监听系统切前后台使用 `@Environment(\.scenePhase)`；监听页面可见性使用 `.onAppear` 与 `.onDisappear`。
4. **【业务生命周期在 ViewModel】**：真正的业务与数据生命周期属于 `@Observable ViewModel` 类（在 `deinit` 释放），而不是依附在随时可能重新构建的 UI View 树上。

**练手实战任务：** 分别用 `.task` 加载异步数据、用 `.onAppear/.onDisappear` 监听视图出现、用 `scenePhase` 监听应用切前后台，对比 Compose 的 `LaunchedEffect` / `DisposableEffect` 日志。

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

**架构与层级结构全景对照：**

```
[ 阶段 04: UI 布局与修饰符体系全景对照 ]

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
    尺寸自适应撑满:    Modifier.fillMaxSize()   <──▶  .frame(maxWidth: .infinity, maxHeight: .infinity)
```

**迁移避坑指南：**
1. **【修饰符洋葱包装模型】**：SwiftUI Modifier 是从上至下依次向外包装新 View；例如 `.padding().background(Color.blue)` 与 `.background(Color.blue).padding()` 视觉结果截然不同。
2. **【同级视图 10 个限制】**：ViewBuilder 闭包内同级直接子视图默认不能超过 10 个（TupleView 限制），超出时需用 `Group { ... }` 包装或拆分子组件。
3. **【List vs LazyVStack 选型】**：`List` 自带 iOS 原生系统分组、分割线与侧滑删除行为；若需完全自定义瀑布流或流式布局，使用 `ScrollView { LazyVStack { ... } }`。
4. **【善用 SF Symbols 矢量图标】**：iOS 内置数千款原生矢量图标，直接调用 `Image(systemName: "heart.fill")`，无需切图且自动跟随文字大小与颜色缩放。

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

**架构与层级结构全景对照：**

```
[ 阶段 05: 状态管理与数据流选型矩阵 ]

 1. 【视图私有状态 (组件内临时可变数据)】
    Android:           remember { mutableStateOf(x) }  ──▶ 组件内部私有状态
    iOS:               @State private var x            ──▶ 视图私有真实数据源 (修改触发重绘)

 2. 【父子双向绑定 (开放数据修改权限)】
    Android:           (value, onValueChange) 状态提升 ──▶ 通知父组件修改
    iOS:               @Binding var value              ──▶ 传递 $value 引用指针 (原地读写数据源)

 3. 【派生状态计算 (自动缓存与依赖追踪)】
    Android:           remember(key) { derivedStateOf { ... } }
    iOS:               计算属性 var isReady: Bool { ... } (Swift 自动追踪响应式依赖)

 4. 【页面级业务状态持有者 (ViewModel 状态机)】
    Android:           class MyVM : ViewModel() + StateFlow
    iOS:               @Observable @MainActor class MyVM (iOS 17+ 属性级精准追踪)

 5. 【持久化偏好与场景暂存】
    场景恢复暂存:      rememberSaveable { ... }        <──▶  @SceneStorage("draft_id")
    磁盘持久化偏好:    DataStore (Flow 键值存储)        <──▶  @AppStorage("is_dark_mode") (UserDefaults)
```

**迁移避坑指南：**
1. **【状态作用域选型法则】**：视图内部私有用 `@State`；子组件读写父状态用 `@Binding`；页面级复杂业务进 `@Observable ViewModel`；跨多层级全局配置用 `@Environment`。
2. **【@Binding 为双向指针】**：Compose 习惯状态提升（传入 `value` 与 `onValueChange` 回调）；SwiftUI 传入 `$state` 绑定指针，子组件修改直接同步至父组件数据源。
3. **【持久化存储选型区分】**：`@AppStorage` 是磁盘持久化（底层 `UserDefaults`，App 重启仍保留）；`@SceneStorage` 是场景/窗口级暂存（退出应用可能丢失）。
4. **【@Observable 属性级重绘】**：iOS 17+ 的 `@Observable` 具备属性级精准追踪，仅被 View 实际读取的字段变动才会触发重绘，对应 Compose 的细粒度 Recomposition 机制。

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

**架构与层级结构全景对照：**

```
[ 阶段 06: 现代数据驱动导航全景对照 ]

 1. 【强类型路由节点】
    Android (Nav3):    @Serializable data class DetailRoute(val id: String)
    iOS (SwiftUI):     enum AppRoute: Hashable { case detail(id: String) }

 2. 【状态栈数据源 (纯 List 驱动)】
    Android (Nav3):    val backStack = rememberNavBackStack(HomeRoute)
    iOS (SwiftUI):     @State var path: [AppRoute] = []

 3. 【核心栈操作映射】
    跳转压栈:          backStack.add(DetailRoute("1"))  <──▶  path.append(.detail(id: "1"))
    返回出栈:          backStack.pop()                  <──▶  path.removeLast()
    一键回首页:        backStack.clear()                <──▶  path.removeAll()

 4. 【结果回传闭环 (Pop with Result)】
    Android (Nav3):    LocalResultEventBus.current.sendResult(data) ──▶ ResultEffect<T> { }
    iOS (SwiftUI):     @Binding var selectedItem: Item (直接指针回写) / 回调闭包
```

**迁移避坑指南：**
1. **【纯 List 驱动核心心智】**：现代声明式路由本质是「可观察的状态列表」；页面跳转即 `path.append`，返回即 `path.removeLast`，彻底告别 URL 字符串拼接。
2. **【强类型枚举替代字符串】**：路由目标使用 `enum AppRoute: Hashable` 建模，配合 `.navigationDestination(for: AppRoute.self)` 实现编译期类型安全与视图按需懒加载。
3. **【双向绑定回传页面结果】**：相较于字符串广播总线，SwiftUI 首选 `@Binding` 双向指针（在关闭前直接回写父状态源并 `dismiss()`），简洁且零侵入。
4. **【多栏分屏自适应 iPad】**：手机单栏使用 `NavigationStack`，iPad/折叠屏双栏分屏使用 `NavigationSplitView(sidebar:detail:)`，对标 Nav3 的多窗 `NavDisplay`。

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

**架构与层级结构全景对照：**

```
[ 阶段 07: 异步并发与响应式流全景对照 ]

 1. 【任务启动与线程调度】
    异步挂起函数:      suspend fun fetch()             <──▶  func fetch() async throws
    启动并发任务:      CoroutineScope.launch { }       <──▶  Task { }
    主线程 UI 调度:    withContext(Dispatchers.Main)   <──▶  @MainActor / MainActor.run { }
    后台 IO 调度:      withContext(Dispatchers.IO)     <──▶  Task.detached { }

 2. 【响应式数据流对标】
    冷数据流 (按需拉取):Flow<T> / flow { emit(x) }       <──▶  AsyncSequence / AsyncStream<T>
    状态热流 (UI 状态): StateFlow (有默认值/防抖)       <──▶  @Observable 属性 / CurrentValueSubject
    事件热流 (单次事件):SharedFlow / Channel (队列分发) <──▶  AsyncStream<T> / PassthroughSubject

 3. 【并发安全与状态隔离】
    Android:           val mutex = Mutex(); mutex.withLock { ... }
    iOS:               actor SafeCounter { var count = 0; func inc() { count += 1 } }
                       (注: Swift 编译器强制跨 actor 调用必须使用 await)
```

**迁移避坑指南：**
1. **【UI 状态刷新切主线程】**：Android 使用 `withContext(Dispatchers.Main)`；iOS 在 UI 类或 ViewModel 前加 `@MainActor`，确保所有状态修改均在主线程执行。
2. **【StateFlow 映射 @Observable】**：`StateFlow`（保持最新值/防抖）对应 iOS 17+ 的 `@Observable` 属性；一次性事件广播通道对应 Swift 的 `AsyncStream`。
3. **【Actor 彻底消除数据竞争】**：Swift 编译器对 `actor` 实施严格的隔离检查，跨 actor 访问必须 `await`，从编译期杜绝多线程竞争。
4. **【协作式任务取消机制】**：Swift Task 具备结构化并发能力，长循环内部应定期检查 `Task.isCancelled` 或调用 `try Task.checkCancellation()` 响应取消。

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

**架构与层级结构全景对照：**

```
[ 阶段 08: 现代网络请求与数据解析全景对照 ]

 1. 【HTTP 引擎与请求构建】
    底层会话引擎:      OkHttpClient                    <──▶  URLSession(configuration:)
    异步 GET 请求:     client.newCall(req).await()     <──▶  let (data, res) = try await URLSession.shared.data(from: url)
    请求头与请求体:    Request.Builder().post(body)    <──▶  var req = URLRequest(url:); req.httpMethod = "POST"

 2. 【JSON 序列化与 Codable】
    数据模型协议契约:  @Serializable                   <──▶  Codable (Decodable & Encodable)
    反序列化解析:      Json.decodeFromString<T>(json)  <──▶  JSONDecoder().decode(T.self, from: data)
    字段别名映射:      @SerialName("user_id")          <──▶  enum CodingKeys: String, CodingKey { case userId = "user_id" }
    蛇形转驼峰策略:    namingStrategy = SnakeCase      <──▶  decoder.keyDecodingStrategy = .convertFromSnakeCase

 3. 【管道拦截与全双工流】
    管道拦截器中间件:  OkHttp Interceptor              <──▶  URLProtocol / 自定义 API Client 管道
    全双工 WebSocket:  WebSocketListener               <──▶  URLSessionWebSocketTask (原生异步消息流)
```

**迁移避坑指南：**
1. **【原生 URLSession 极简轻量】**：iOS 首选原生 `URLSession`，配合 `async/await` 与 `Codable` 即可兼具性能与类型安全，无需强行引入 Retrofit 式重型封装。
2. **【Codable 零反射极速编解码】**：只需为数据模型遵循 `Codable` 协议，编译器自动生成极速编解码代码；配合 `keyDecodingStrategy = .convertFromSnakeCase` 自动转换蛇形下划线。
3. **【状态码校验不可省略】**：`URLSession` 返回 `(Data, URLResponse)` 元组，即使返回 404/500 也不会抛出异常；必须将 response 强转为 `HTTPURLResponse` 校验状态码 (200...299)。
4. **【网络请求绑定视图生命周期】**：网络任务置于 `.task { }` 修饰符中，当 View 离开视图树时，SwiftUI 会自动协作式取消底层的 `URLSession` 异步任务。

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

**架构与层级结构全景对照：**

```
[ 阶段 09: 本地持久化与数据库选型矩阵 ]

 1. 【轻量键值偏好存储】
    简单设置项:        SharedPreferences / DataStore   <──▶  UserDefaults.standard / @AppStorage
    跨 App / 扩展共享: ContentProvider                 <──▶  UserDefaults(suiteName: "group.com.app")

 2. 【凭据与敏感令牌 (硬件级安全)】
    Android:           EncryptedSharedPreferences / KeyStore (TEE 安全芯片)
    iOS:               Keychain Services (Secure Enclave / 生物识别 Face ID / 卸载仍保留)

 3. 【结构化对象关系数据库】
    实体注解模型:      Room (@Entity / @Dao)           <──▶  SwiftData (@Model 原生 Swift 宏)
    响应式数据查询:    dao.getUsersFlow() (Flow 监听)   <──▶  @Query var users: [User] (声明式自动重绘)

 4. 【沙盒文件系统与目录】
    用户文档目录:      context.filesDir                <──▶  FileManager (.documentDirectory / iCloud 自动备份)
    临时缓存目录:      context.cacheDir                <──▶  FileManager (.cachesDirectory / 系统内存吃紧自动清理)
```

**迁移避坑指南：**
1. **【持久化选型四大象限】**：UI 设置项用 `@AppStorage`；敏感 Token 必须存 `Keychain`；结构化大表数据用 `SwiftData`；大体积文件/图片放沙盒 `Documents`。
2. **【SwiftData 现代 ORM 模型】**：iOS 17+ 废弃复杂的 CoreData 模型文件，直接在普通 class 上标记 `@Model`，View 内部直接写 `@Query` 即可实现响应式零样板代码监听。
3. **【Keychain 硬件级加密防护】**：Keychain 独立于 App 沙盒，应用卸载重装凭据仍会保留，且原生支持 Touch ID / Face ID 生物识别授权。
4. **【Documents 与 Caches 严格分工】**：`.documentDirectory` 会被 iCloud 自动备份；`.cachesDirectory` 在系统存储空间吃紧时会被随时清理，切勿存放核心不可再生数据。

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

**架构与层级结构全景对照：**

```
[ 阶段 10: 现代移动端 Clean MVVM + UDF 单向数据流架构全景 ]

 +-----------------------------------------------------------------------------------+
 | 表现层 View Layer (声明式 UI)                                                     |
 |   Android: Jetpack Compose @Composable    │  iOS: SwiftUI struct View             |
 +-----------------------------------------------------------------------------------+
                                         │
                                         │ 用户意图分发 (User Action / UiIntent)
                                         ▼
 +-----------------------------------------------------------------------------------+
 | 业务模型层 ViewModel Layer (状态机驱动)                                           |
 |   Android: ViewModel + StateFlow<UiState> │  iOS: @Observable ViewModel (UiState) |
 +-----------------------------------------------------------------------------------+
                                         │
                                         │ 异步调度领域用例 (Invoke Domain / Repo Use Cases)
                                         ▼
 +-----------------------------------------------------------------------------------+
 | 数据仓库层 Repository Layer (单一可信数据源 Single Source of Truth)               |
 |   Repository 抽象协议契约 (统管内存缓存、远程 API 与本地数据库)                   |
 +-----------------------------------------------------------------------------------+
                   │                                             │
                   │ 远程网络请求分发                            │ 本地持久化数据分发
                   ▼                                             ▼
 +-----------------------------------+         +-------------------------------------+
 | 远程数据源 Remote DataSource      |         | 本地数据源 Local DataSource         |
 |   Retrofit / Ktor ──▶ URLSession  |         |   Room ──▶ SwiftData / Keychain     |
 +-----------------------------------+         +-------------------------------------+
```

**迁移避坑指南：**
1. **【MVVM + UDF 核心心智】**：View 保持极简纯净（只绑 State、发 Intent）；ViewModel 拥有唯一的真实状态源；禁止在 View 内部直接发起数据库或网络请求。
2. **【Repository 单一数据源】**：Repository 统管内存缓存、本地数据库 (`Room`/`SwiftData`) 与网络请求 (`URLSession`)，暴露统一的 async 方法，屏蔽数据来源细节。
3. **【MVI 不可变状态建模】**：将用户动作建模为严格的 Intent 枚举，状态建模为不可变 UiState 结构体，彻底消除多线程竞态条件与状态错乱。
4. **【SPM 多 Target 组件化解耦】**：对标 Android Gradle 多模块，iOS 推荐采用 SPM Package 拆分多个 Target（Domain / Data / Feature），通过 Protocol 依赖倒置实现并行编译加速。

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

**架构与层级结构全景对照：**

```
[ 阶段 11: 依赖注入与服务解耦选型矩阵 ]

 1. 【原生构造注入 (iOS 80% 推荐范式)】
    抽象协议契约:      interface UserRepository        <──▶  protocol UserRepositoryProtocol
    构造函数默认注入:  class VM(val repo: Repo)        <──▶  init(repo: UserRepositoryProtocol = LiveRepo())
    Preview / 单测替换:VM(FakeRepo())                  <──▶  #Preview { UserView(vm: VM(repo: MockRepo())) }

 2. 【视图树级环境注入】
    Android:           CompositionLocalProvider(LocalService provides service) { ... }
    iOS (SwiftUI):     View.environment(\.apiClient, client) ──▶ @Environment(\.apiClient) var client

 3. 【现代轻量 DI 容器 (Factory)】
    模块容器定义:      val appModule = module { ... }  <──▶  Container.shared.repo = Factory { LiveRepo() }
    属性包装器注入:    val vm: VM by viewModel()       <──▶  @Injected(\.repo) private var repo
    生命周期作用域:    single { } / factory { }        <──▶  .singleton / .unique / .shared
```

**迁移避坑指南：**
1. **【iOS 极简注入哲学】**：iOS 生态不依赖重型注解生成框架；80% 以上的项目仅靠 Protocol 协议抽象与 `init` 构造函数默认参数即可实现纯净解耦。
2. **【SwiftUI 善用 @Environment】**：全局通用服务（如 Auth 认证、全局网络 Client）通过自定义 EnvironmentKey 注入 SwiftUI 视图树，避免逐层传参。
3. **【业务扩大选用 Factory】**：当需要类似 Koin 的服务定位与属性注入时，首选 Factory 现代容器，具备编译期类型安全且无代码生成开销。
4. **【Mock 隔离单测与预览】**：所有外部依赖均面向 Protocol 抽象，在 Xcode Preview 与 XCTest 中一键注入 MockRepository，零网络与数据库副作用。

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

**架构与层级结构全景对照：**

```
[ 阶段 12: 图片与静态资源处理选型矩阵 ]

 1. 【静态资产与矢量适配】
    矢量图导入:        res/drawable/ic_logo.xml        <──▶  Assets.xcassets SVG/PDF 矢量图导入
    矢量自动栅格化:    VectorDrawable 动态缩放         <──▶  Attributes Inspector 勾选「Single Scale」
    深浅色主题适配:    res/values/colors.xml (night)   <──▶  Color Set (Any / Dark Appearance)

 2. 【异步网络图片加载与缓存】
    原生异步图片:      SubcomposeAsyncImage            <──▶  AsyncImage(url:) { phase in ... }
    第三方主流方案:    Coil / Glide                    <──▶  Kingfisher (KFImage) / Nuke
    多级缓存控制:      MemoryCache + DiskCache         <──▶  ImageCache.default (内存上限 + 磁盘过期)

 3. 【内存位图与图像处理】
    内存位图对象:      Bitmap / ImageBitmap            <──▶  UIImage / CGImage (CoreGraphics 管道)
    裁剪与缩放链:      ContentScale.Crop               <──▶  .resizable().aspectRatio(contentMode: .fill).frame(...)
```

**迁移避坑指南：**
1. **【Image 缩放必加 resizable】**：SwiftUI 中 `Image` 默认按原始像素尺寸绘制，撑满外框必须链式声明 `.resizable().aspectRatio(contentMode: .fill).frame(...)`。
2. **【矢量图勾选 Single Scale】**：Assets 导入 SVG/PDF 矢量图标时，在 Attributes Inspector 勾选「Single Scale」，Xcode 会在编译期自动生成全套多倍图。
3. **【深浅色自适应 Color Set】**：在 Assets 中创建 Color Set 并分别配置 Any 与 Dark 色值，代码中直接调用 `Color("BrandPrimary")` 即可自动响应深色模式。
4. **【AsyncImage 缓存局限】**：原生 `AsyncImage` 仅依赖系统 `URLCache`，不支持精细的磁盘过期策略与预加载；复杂长列表推荐使用 `Kingfisher`。

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

**架构与层级结构全景对照：**

```
[ 阶段 13: 声明式动画与转场动效全景对照 ]

 1. 【状态驱动属性插值】
    隐式属性动画:      val size by animateDpAsState()  <──▶  .animation(.spring(), value: targetState)
    显式闭包触发:      LaunchedEffect / Animatable     <──▶  withAnimation(.spring()) { isExpanded.toggle() }
    物理弹簧曲线:      spring(dampingRatio, stiffness) <──▶  .spring(response: 0.5, dampingFraction: 0.7)

 2. 【视图进退场转场过渡】
    条件进退场:        AnimatedVisibility(enter, exit) <──▶  if condition { View } + .transition(.slide)
    组合过渡动效:      fadeIn() + slideInVertically()  <──▶  .opacity.combined(with: .slide)
    内容形态平滑切换:  AnimatedContent                 <──▶  .contentTransition(.numericText())

 3. 【高级几何形变与手势】
    跨层级共享元素:    SharedTransitionLayout          <──▶  matchedGeometryEffect(id:in:namespace)
    交互式拖拽手势:    pointerInput + Modifier.offset  <──▶  DragGesture().onChanged { }.onEnded { }
```

**迁移避坑指南：**
1. **【.animation 必显式绑定 value】**：从 iOS 15 开始，无参数的 `.animation()` 已废弃；必须使用 `.animation(.spring(), value: targetState)` 绑定具体状态，避免无意触发意外重绘。
2. **【.transition 必须依赖条件分支】**：`.transition(...)` 必须挂载在由 `if/else` 或 `ForEach` 动态增删的视图上，并在外部通过 `withAnimation { ... }` 触发状态变更。
3. **【首选物理弹簧 Curves】**：iOS 极度推崇物理弹簧质感（`.spring(response:dampingFraction:)`），相比线性与贝塞尔曲线更具跟手感与可打断性。
4. **【matchedGeometryEffect 共用命名空间】**：跨层级形变的两个视图必须处于同一个 `@Namespace` 作用域内，且赋予完全相同的 `id` 标识。

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

**架构与层级结构全景对照：**

```
[ 阶段 14: 系统权限、后台任务与推送直达全景对照 ]

 1. 【隐私权限合规体系】
    权限静态声明:      AndroidManifest.xml             <──▶  Info.plist (Privacy Usage Descriptions 必填)
    运行时动态授权:    RequestPermission API           <──▶  AVCaptureDevice.requestAccess / UNUserNotificationCenter
    权限状态检测:      PermissionChecker               <──▶  .authorized / .denied / .notDetermined

 2. 【后台任务执行与保活】
    周期性后台调度:    WorkManager (PeriodicRequest)   <──▶  BackgroundTasks (BGAppRefreshTask 系统统筹)
    后台音频/定位保活: Foreground Service              <──▶  CLLocationManager (background) / AVAudioSession (.playback)

 3. 【消息推送与外部直达】
    远程推送通道:      FCM (Firebase Cloud Messaging)  <──▶  APNs (Apple Push Notification 系统统一通道)
    本地定时通知:      NotificationCompat.Builder      <──▶  UNNotificationRequest + UNTimeIntervalNotificationTrigger
    域名深度直达:      App Links (assetlinks.json)     <──▶  Universal Links (apple-app-site-association)
```

**迁移避坑指南：**
1. **【权限描述缺失必闪退】**：相机、相册、定位等敏感硬件权限必须在 `Info.plist` 中配置明确的用途描述文案；未配置调用时系统直接崩溃闪退 (SIGABRT)。
2. **【后台严禁自由常驻】**：iOS 不允许无限制后台常驻服务；所有后台定期任务必须注册 `BackgroundTasks`，由系统根据电量和网络统筹唤醒。
3. **【APNs 统一远程推送管道】**：所有 iOS 远程推送均经由 Apple APNs 下发；在 AppDelegate 中注册并获取 `deviceToken` 即可接收系统原生横幅。
4. **【Universal Links 双向域名校验】**：必须在 HTTPS 域名服务器根目录部署 `apple-app-site-association` 文件，并在 Xcode 的 Associated Domains 中配置对应域名。

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

**架构与层级结构全景对照：**

```
[ 阶段 15: 单元测试与 UI 自动化测试全景对照 ]

 1. 【业务逻辑与单元测试】
    经典测试框架:      JUnit 4 / JUnit 5               <──▶  XCTest (XCTestCase) + XCTAssertEqual
    现代宏测试标准:    JUnit 5 (@Test)                 <──▶  Swift Testing (@Test + #expect(a == b))
    测试假对象构造:    MockK / Mockito (字节码反射)    <──▶  Protocol Mock (面向协议手写 Mock，零反射)

 2. 【异步并发与数据流测试】
    挂起函数测试:      runTest { val res = api() }     <──▶  func testAsync() async throws { let res = try await api() }
    回调超时等待:      CountDownLatch                  <──▶  XCTestExpectation (fulfillment / wait:for:timeout:)

 3. 【UI 界面自动化测试】
    UI 测试驱动引擎:   Espresso / Compose UI Test      <──▶  XCUITest (XCUIApplication)
    无障碍标识符查找:  onNodeWithTag("login_btn")      <──▶  app.buttons["login_btn"] (.accessibilityIdentifier)
    模拟用户手势交互:  performClick() / performText()  <──▶  element.tap() / element.typeText("abc")
```

**迁移避坑指南：**
1. **【面向 Protocol 手写 Mock 零反射】**：iOS 单测强烈推崇为 Protocol 编写轻量 Mock 类（如 `MockUserRepository`），零反射开销且编译期强类型安全。
2. **【全面拥抱 Swift Testing 新标准】**：Xcode 16+ 引入现代 Swift Testing，使用 `@Test` 宏与 `#expect(...)` 表达式，替代冗长的 XCTAssert 语法。
3. **【原生支持 async/await 测试函数】**：Swift 并发函数可直接在 async 测试方法中 `await` 调用，无需编写复杂的 `XCTestExpectation` 阻塞等待。
4. **【UI 自动化必设 Accessibility ID】**：XCUITest 自动化测试必须通过 `.accessibilityIdentifier("login_btn")` 定位元素，严禁通过 UI 本地化文案或标题查找。

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

**架构与层级结构全景对照：**

```
[ 阶段 16: 打包构建、证书签名与应用发布全景对照 ]

 1. 【构建配置与多环境变体】
    多环境配置:        productFlavors / Build Variants <──▶  Build Schemes (Debug / Release / Staging)
    环境变量与 BaseURL:buildConfigField / resValue     <──▶  xcconfig 配置文件 ──▶ 注入 Info.plist
    代码编译优化裁剪:  R8 / ProGuard / minifyEnabled   <──▶  Swift 编译器优化 (-Osize) / Strip Symbols

 2. 【签名安全与产物归档】
    签名证书体系:      Keystore (.jks 密钥库)          <──▶  Apple Developer Certificate (公钥证书)
    权限与设备绑定:    Play App Signing 托管           <──▶  Provisioning Profile (证书 + App ID + 设备 UDID)
    签名托管模式:      signingConfigs { }              <──▶  Xcode 勾选「Automatically manage signing」

 3. 【安装包产物与控制台分发】
    发布包产物格式:    APK / AAB (Android App Bundle)  <──▶  IPA / Xcode Archive (.xcarchive)
    开发者控制台:      Google Play Console             <──▶  App Store Connect (元数据 / 价格 / 提审)
    官方测试分发渠道:  Google Play 内部测试            <──▶  TestFlight (内部团队 / 公开测试链接)
```

**迁移避坑指南：**
1. **【优先开启自动签名管理】**：个人与中小型团队务必在 Xcode 中勾选「Automatically manage signing」，由系统自动管理证书生成与描述文件更新。
2. **【环境隔离首选 xcconfig】**：严禁在业务代码中硬编码测试与正式环境 API 地址；通过 `Debug.xcconfig` 与 `Release.xcconfig` 将配置安全注入 `Info.plist`。
3. **【TestFlight 极速内测分发】**：构建产物上传至 App Store Connect 后，可直接通过 TestFlight 分发给内部测试员或生成公开测试链接，无需单独收集设备 UDID。
4. **【严格遵守 App Store 审核准则】**：数字虚拟商品必须接入 StoreKit (IAP) 内购；必须提供真实有效的审核测试账号与操作演示视频，严禁残留占位内容。

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

