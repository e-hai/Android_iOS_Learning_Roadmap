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

| 维度 | Android 体系 | iOS 体系 | 核心学习重点 |
| --- | --- | --- | --- |
| 核心 IDE | Android Studio (IntelliJ 体系) | Xcode (macOS 原生) | 开发环境、模拟器管理与代码调试 |
| 构建与依赖 | Gradle (Groovy / Kotlin DSL) | SPM (官方推荐) / CocoaPods | 依赖管理与编译构建系统（**现代优先原生 SPM**） |
| 工程与工作区 | 根工程 (`settings.gradle`) | `.xcodeproj` (单工程) / `.xcworkspace` (工作区) | 工程索引体系与多模块/Pods 容器 |
| 应用清单 | `AndroidManifest.xml` | `Info.plist` + Target Capabilities | 应用元数据、权限声明与系统能力开关 |
| 编译配置 | `app/build.gradle(.kts)` | Xcode Target Build Settings | Bundle ID、版本号、签名与编译选项 |
| 模块化拆分 | Module (`app` / `library`) | Target / Framework / SPM Package | 子模块拆分与工程组件化架构 |
| 资源管理 | `res/` (`drawable`, `values/strings.xml`) | `Assets.xcassets` (`Images`, `Color Sets`) | 图片资源、自适应色彩集与多语言本地化 |
| 代码签名 | Keystore (`.jks`) / Play App Signing | Apple Certificate + Provisioning Profile | 开发者证书、描述文件与代码签名流程 |
| 打包产物 | APK / AAB | IPA / Xcode Archive | 产物形态与归档分发结构 |

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

| 语言特性 / 场景 | Kotlin (Android) | Swift (iOS) | 核心心智与特性说明 |
| --- | --- | --- | --- |
| **不可变常量** | `val x = 1` | `let x = 1` | 一旦赋值不可重新绑定 |
| **可变变量** | `var y = 2` | `var y = 2` | 可变本地变量 / 属性 |
| **基础数据类型** | `Int`, `Double`, `Boolean`, `String` | `Int`, `Double`, `Bool`, `String` | 强类型，基本命名一致 |
| **函数声明** | `fun calculate(a: Int): Int` | `func calculate(a: Int) -> Int` | `fun` ➔ `func`，返回值使用 `->` |
| **参数外部标签** | 命名参数 `calculate(a = 1)` | `func sum(_ a: Int, for count: Int)` | 外部标签（`_` 忽略，自定义介词） |
| **空安全类型** | `String?` | `String?` | 显式 Optional 包装类型 |
| **安全调用** | `user?.name` | `user?.name` | 链路安全访问可空属性 |
| **Elvis / 空合并** | `user?.name ?: "默认值"` | `user?.name ?? "默认值"` | `?:` (Elvis) ➔ `??` (Nil-Coalescing) |
| **强制解包** | `user!!.name` (慎用) | `user!.name` (慎用) | 断言非空，若为 nil 立即崩溃 |
| **可选绑定解包** | `user?.let { u -> ... }` | `if let user = user { ... }` | 作用域安全绑定非空值 |
| **卫语句提前返回** | `if (user == null) return` | `guard let user = user else { return }` | **Swift 核心习惯**：卫语句提前退出 |

### 模块二：面向对象与值语义（核心心智差异）

| 维度 / 机制 | Kotlin (Android) | Swift (iOS) | 核心心智差异 |
| --- | --- | --- | --- |
| **数据模型** | `data class User(val id: String)` | `struct User { let id: String }` | **值类型 vs 引用类型**：Swift `struct` 赋值为自动深拷贝，天然线程安全 |
| **共享类声明** | `class Manager` | `class Manager` | 跨组件共享可变状态与需要生命周期时才用 `class` |
| **抽象协议 / 接口** | `interface OnClickListener` | `protocol Clickable` | **POP (面向协议编程)**：iOS 极其推崇协议组合 |
| **默认实现扩展** | 接口内写默认函数 | `extension Clickable { func onClick() }` | 用 `extension` 无侵入为协议提供通用默认实现 |
| **继承 vs 组合** | `open class Base` ➔ `class Child : Base()` | 推荐 `protocol + extension` 拼装 | Android 偏好抽象基类继承；iOS 体系首选协议拼装 |
| **单例模式** | `object AppConfig` | `class AppConfig { static let shared = ... }` | Swift 常用 `static let shared` 静态属性单例 |

### 模块三：高级类型、枚举与泛型

| 语言特性 / 场景 | Kotlin (Android) | Swift (iOS) | 核心心智与特性说明 |
| --- | --- | --- | --- |
| **带关联值枚举** | `sealed class UiState` | `enum UiState { case loading, success(Data) }` | **Swift 核心利器**：枚举每个分支可绑定独立关联值数据 |
| **模式匹配** | `when (state) { is Loading -> ... }` | `switch state { case .success(let data): ... }` | `switch` 必须穷尽所有分支（Exhaustive） |
| **泛型约束** | `class Repo<T : Comparable>` | `class Repo<T: Comparable>` | 泛型占位符与类型上界约束 |
| **类型别名** | `typealias UserId = String` | `typealias UserId = String` | 为复杂闭包或长类型起别名 |
| **类型判断与强转** | `is String` / `as? String` | `is String` / `as? String` | 安全下转型运算符一致 |

### 模块四：闭包、错误处理与内存模型（避坑重点）

| 机制 / 场景 | Kotlin (Android) | Swift (iOS) | 核心避坑点 |
| --- | --- | --- | --- |
| **闭包 / Lambda** | `{ item -> item.id }` / `it.id` | `{ item in item.id }` / `{ $0.id }` | `in` 关键字分隔参数列表；`$0`, `$1` 为匿名参数索引 |
| **尾随闭包** | `Button { println() }` | `Button { print() }` | 最后一个闭包参数可写在括号外 |
| **内存回收模型** | **JVM GC** (垃圾收集器后台回收) | **ARC** (自动引用计数) | **核心差异**：Swift 无 GC，对象引用计数清零立即释放 |
| **闭包循环引用防漏** | GC 自动处理多数引用环 | **`[weak self]` 捕获列表** | **必记**：闭包持有 self 且 self 持有闭包时必须用 `[weak self]` |
| **抛出与捕获错误** | `@Throws fun load()` / `try-catch` | `func load() throws` / `do-catch` | 显式抛出与捕获异常 |
| **可选执行** | 无原生直接对应 | `try? load()` (失败返回 nil) | 将抛错函数转换为 Optional 返回值 |

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

| 职责 / 阶段 | Android (传统 View 体系) | iOS (传统 UIKit 体系) | 核心特性说明 |
| --- | --- | --- | --- |
| 全局应用 | `Application` | `UIApplicationDelegate` / `AppDelegate` | 应用级全局入口与生命周期分发 |
| 页面级控制器 | `Activity` | `UIViewController` | 经典屏幕级视图控制器与上下文容器 |
| 子页面/片段 | `Fragment` | `Child UIViewController` | 可复用子页面模块与多窗容器 |
| 视图初始化 | `onCreate()` / `setContentView()` | `viewDidLoad()` / `loadView()` | 视图层级首次加载与内存初始化 |
| 页面即将/已经可见 | `onStart()` ➔ `onResume()` | `viewWillAppear()` ➔ `viewDidAppear()` | 视图进入视口并获取交互焦点 |
| 页面离开/不可见 | `onPause()` ➔ `onStop()` | `viewWillDisappear()` ➔ `viewDidDisappear()` | 视图失去焦点与退出屏幕视口 |
| 销毁与释放 | `onDestroy()` | `deinit` | 控制器实例销毁与资源彻底回收 |

### 3.2 模块二：现代时代（声明式 UI：Jetpack Compose ↔ SwiftUI）

| 职责 / 概念 | Android (Jetpack Compose) | iOS (SwiftUI) | 核心特性说明 |
| --- | --- | --- | --- |
| 应用根入口 | `Single Activity + setContent` | `@main struct App: App` (`WindowGroup`) | 声明式应用主窗口与场景根节点 |
| UI 基本单元 | `@Composable fun Screen()` | `struct ScreenView: View` | 纯无状态函数 vs 不可变值类型结构体 |
| 挂载异步任务 | `LaunchedEffect(key) { }` | `.task(id:) { }` | 挂载并发任务，进入启动，离开自动取消 |
| 视图出现 / 消失 | `DisposableEffect / onDispose` | `.onAppear` / `.onDisappear` | 视图挂载与脱离渲染树生命周期钩子 |
| 系统前后台状态 | `LifecycleEventObserver` | `@Environment(\.scenePhase)` | 监听 `.active` / `.background` 场景状态 |
| 业务状态持有者 | `ViewModel` (`onCleared`) | `@Observable class ViewModel` (`deinit`) | 独立于视图树的业务模型生命周期 |

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

| 布局类型 | Android (Compose) | iOS (SwiftUI) | 核心特性说明 |
| --- | --- | --- | --- |
| 垂直排列 | `Column` | `VStack` | 主轴纵向排列，默认包裹内容高度 |
| 水平排列 | `Row` | `HStack` | 主轴横向排列，默认包裹内容宽度 |
| 层叠覆盖 | `Box` | `ZStack` | Z 轴深度层叠，后声明的 View 在最上层 |
| 惰性纵向列表 | `LazyColumn` | `List` / `LazyVStack` | 列表复用（`List` 自带原生分割线与系统样式，`LazyVStack` 纯自定义） |
| 惰性网格布局 | `LazyVerticalGrid` | `LazyVGrid(columns:)` | 响应式多列瀑布流与宫格布局 |
| 基础滚动容器 | `Modifier.verticalScroll()` | `ScrollView` | 非复用型滚动视图容器 |
| 弹性占位扩展 | `Spacer()` / `Modifier.weight(1f)` | `Spacer()` | 自动挤开剩余空间（两端弹簧效果） |
| 分割线 | `HorizontalDivider()` | `Divider()` | 系统自适应分割线 |

### 模块二：常用基础控件（原子组件）

| 控件类型 | Android (Compose) | iOS (SwiftUI) | 核心特性说明 |
| --- | --- | --- | --- |
| 文本显示 | `Text("...")` | `Text("...")` | 支持字号、加粗、颜色与行数截断 |
| 文本输入 | `TextField` / `BasicTextField` | `TextField` / `SecureField` | 绑定双向字符串状态 `$text`，支持密码框 |
| 交互按钮 | `Button(onClick = { })` | `Button("...", action: { })` | 原生交互与点击波纹/透明度反馈 |
| 图标与图片 | `Image` / `Icon` | `Image("...")` / `Image(systemName:)` | 本地资源图片与 SF Symbols 系统矢量图标 |
| 开关与选择 | `Switch` / `Checkbox` | `Toggle(isOn: $isOn)` | 绑定 Boolean 状态并触发动画切换 |
| 进度指示器 | `CircularProgressIndicator` | `ProgressView()` | 自适应环形/条形加载指示器 |

### 模块三：Modifier 链式修饰与尺寸（样式机制）

| 修饰类型 | Android (Compose) | iOS (SwiftUI) | 核心特性说明 |
| --- | --- | --- | --- |
| 链式包装 | `Modifier.padding().background()` | `.padding().background()` | 洋葱模型：从上至下依次向外包装新 View |
| 尺寸撑满 | `fillMaxWidth()` / `fillMaxSize()` | `.frame(maxWidth: .infinity)` | 声明式弹性尺寸与最大空间拉伸 |
| 点击手势 | `Modifier.clickable { }` | `.onTapGesture { }` | 任意 View 挂载点击手势与交互识别 |
| 圆角裁剪 | `Modifier.clip(RoundedCornerShape(8.dp))` | `.clipShape(RoundedRectangle(cornerRadius: 8))` | 视图边框与几何形状裁剪 |
| 投影阴影 | `Modifier.shadow(4.dp)` | `.shadow(radius: 4)` | 深度与高斯模糊投影效果 |
| 安全区域 | `Modifier.systemBarsPadding()` | `.ignoresSafeArea()` | 默认遵循系统安全区，按需忽略安全区 |

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

| 应用场景 | Android (Compose) | iOS (SwiftUI) | 核心特性说明 |
| --- | --- | --- | --- |
| 视图内部私有状态 | `remember { mutableStateOf(x) }` | `@State private var x` | 仅限本组件内部使用（展开/开关/计数/临时输入） |
| 父子双向绑定传递 | `(value, onValueChange)` | `@Binding var value` | 状态提升，向子组件传递引用指针 `$value` |
| 派生计算与缓存 | `remember { derivedStateOf { } }` | `var prop: Type { ... }` | 依赖其他状态自动重算，SwiftUI 具备自动依赖追踪 |

### 模块二：业务状态流与 ViewModel 响应式模型（页面级状态）

| 应用场景 | Android (Compose) | iOS (SwiftUI) | 核心特性说明 |
| --- | --- | --- | --- |
| 现代响应式 ViewModel | `class MyVM : ViewModel() + StateFlow` | `@Observable @MainActor class MyVM` | iOS 17+ 宏驱动，页面级复杂业务与异步数据持有者 |
| UI 订阅与消费流 | `collectAsStateWithLifecycle()` | `vm.prop` / `@Bindable` | 属性级精准追踪，仅读取的字段变动才触发重绘 |

### 模块三：持久化偏好、场景暂存与环境注入（全局与系统级）

| 应用场景 | Android (Compose) | iOS (SwiftUI) | 核心特性说明 |
| --- | --- | --- | --- |
| 场景/多窗口草稿暂存 | `rememberSaveable { ... }` | `@SceneStorage("draft_id")` | 屏幕旋转/多窗口暂存恢复（退出应用可能重置） |
| 磁盘持久化用户偏好 | `DataStore` | `@AppStorage("setting_key")` | 直接绑定系统 `UserDefaults`，App 重启仍保留 |
| 树级全局环境注入 | `CompositionLocalProvider / LocalContext` | `@Environment(\.colorScheme)` | 无需层层传递 Props，深层子组件直接获取环境属性 |

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

| 导航操作 / 维度 | Android (Nav3 纯声明式) | iOS (SwiftUI 16+ NavigationStack) | 核心特性说明 |
| --- | --- | --- | --- |
| 强类型路由节点 | `@Serializable data class Detail(id: String)` | `enum AppRoute: Hashable { case detail(id: String) }` | 编译期强类型，告别字符串拼写错误 |
| 状态栈数据源 | `val backStack = rememberNavBackStack()` | `@State var path: [AppRoute] = []` | 纯状态驱动（数组列表） |
| 页面跳转 (压栈) | `backStack.add(Detail(...))` | `path.append(.detail(...))` | 状态驱动压入目标路由 |
| 页面返回 (出栈) | `backStack.pop()` / `backStack.removeLast()` | `path.removeLast()` / `dismiss()` | 弹出顶层路由返回上一级 |
| 一键回首页 | `backStack.clear()` | `path.removeAll()` | Pop to Root 一键清栈回首页 |

### 模块二：参数传递与页面结果回传

| 数据传递场景 | Android (Nav3 体系) | iOS (SwiftUI 体系) | 核心特性说明 |
| --- | --- | --- | --- |
| 正向参数传递 | `Detail(id: String)` | `case detail(id: String)` | 强类型入参，随路由节点直接下发 |
| Nav3 官方结果总线 | `LocalResultEventBus.current.sendResult(data)` | `@Binding var selected: Item` | Nav3 结果总线 vs SwiftUI 原生 @Binding 双向绑定指针 |
| 结果监听响应 | `ResultEffect<T> { result -> ... }` | `@Binding` 自动同步 / 闭包响应 | 声明式响应回传数据，自动处理生命周期 |
| 函数式状态提升回调 | `NavDisplay` 注入 `onResult: (T) -> Unit` | `navigationDestination` 注入 `onResult` 闭包 | 经典状态提升模式，在路由容器层完成出栈 |
| 共享域模型写入 | 共享 ViewModel `StateFlow` | 共享 `@Observable` ViewModel | 跨页面共享域模型，写入单一真实数据源 |
| 模态弹窗选择回传 | `ModalBottomSheet` | `.sheet(isPresented:)` | 弹层选择器闭环，关闭弹窗自动同步状态 |

### 模块三：页面呈现容器与多端适配

| 容器类型 / 场景 | Android (Nav3) | iOS (SwiftUI) | 核心特性说明 |
| --- | --- | --- | --- |
| 路由呈现容器 | `NavDisplay(backStack) { route -> when(route) }` | `NavigationStack(path: $path) + .navigationDestination` | 惰性解耦构建目标 View |
| 大屏/分屏支持 | `NavDisplay` | `NavigationSplitView(sidebar:detail:)` | iPad / 折叠屏双栏及三栏分屏布局 |
| 底部导航选项卡 | `NavigationBar + NavDisplay` | `TabView(selection: $tab)` | 根级多分支页面容器 |
| 模态弹窗/抽屉 | `ModalBottomSheet / Dialog` | `.sheet(isPresented:) / .fullScreenCover` | 独立弹层与全屏模态呈现容器 |

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

会 Kotlin 协程的话，Swift Concurrency 上手很快，但要习惯 **async 函数染色** 与 **Actor 隔离**。

| 概念 / API | Android (Kotlin 协程) | iOS (Swift Concurrency) | 核心特性说明 |
| --- | --- | --- | --- |
| 异步挂起函数 | `suspend fun load()` | `func load() async` | 异步挂起函数标记与非阻塞执行 |
| 启动并发任务 | `CoroutineScope.launch { }` | `Task { }` | 启动不受调用处阻塞的异步任务 |
| 并发合并等待 | `async { } / await()` | `async let / await` | 并发异步绑定与合并等待结果 |
| 主线程调度 | `withContext(Dispatchers.Main)` | `@MainActor / MainActor.run` | 主线程调度与 UI 线程隔离 |
| 异步数据流 | `Flow<T>` | `AsyncSequence<T>` | 冷异步数据流与按需拉取 |
| 异步事件管道 | `Channel<T>` | `AsyncStream<T>` | 热事件流与异步通道 |
| 并发数据保护 | `Mutex` | `actor` | 状态隔离与无锁数据竞争安全 |
| 回调转异步流 | `callbackFlow { }` | `AsyncStream { continuation in }` | 将传统监听器包装转换为异步流 |

学习路径：

```
Android: Thread → Coroutine → Flow → Channel
iOS:     Thread → Task → AsyncSequence → Actor
```

**迁移注意：** UI 更新必须上主线程——Android 用 Main dispatcher，iOS 用 `@MainActor`。

**练手：** 用 `Task` + `URLSession` 拉 JSON，再改成可取消的 `task` 修饰符版本。

---

## ⑧ 网络请求与数据解析

| 层次 / 功能 | Android 体系 | iOS 体系 | 核心特性说明 |
| --- | --- | --- | --- |
| 底层 HTTP 引擎 | `OkHttp` | `URLSession` | 底层网络会话管理与拦截器 |
| 声明式 API 客户端 | `Retrofit` | `URLSession + API Client` | 接口声明与 RESTful 请求封装 |
| 现代纯异步客户端 | `Ktor Client` | `Async/Await 原生客户端` | 纯异步非阻塞轻量网络库 |
| JSON 序列化解析 | `Gson / kotlinx.serialization` | `Codable + JSONDecoder` | 高性能模型自动编解码 |

建议顺序：

```
Android: OkHttp → Retrofit → Serialization（Ktor 可选）
iOS:     URLSession → Codable/JSONDecoder → 封装 API Client
```

**练手：** 同一个 REST 接口两端请求并解码成模型。

---

## ⑨ 本地数据存储

| 存储维度 | Android 体系 | iOS 体系 | 核心特性说明 |
| --- | --- | --- | --- |
| 轻量偏好存储 | `SharedPreferences` | `UserDefaults / @AppStorage` | 简单键值偏好持久化 |
| 响应式数据存储 | `DataStore` | `UserDefaults / 文件缓存` | 类型安全与响应式数据持久化 |
| 敏感安全加密 | `EncryptedSharedPreferences / Keystore` | `Keychain` | 安全加密存储 Token 与敏感凭据 |
| 对象关系数据库 | `Room` | `SwiftData / CoreData` | 原生 ORM 数据库与对象关系映射 |
| 底层 SQL 操作 | `SQLDelight / SQLite` | `GRDB / SQLite.swift` | 灵活执行原生 SQL 查询 |
| 沙盒文件读写 | `Context.filesDir / cacheDir` | `FileManager` | 应用专属沙盒与缓存目录管理 |

学习路径：

```
Android: SharedPreferences → DataStore → Room
iOS:     UserDefaults → Keychain → SwiftData（需要时再补 CoreData）
```

**练手：** 登录 token 存 Keychain + 用户设置存 UserDefaults + 一个简单本地列表用 SwiftData。

---

## ⑩ 应用架构

两端几乎同一套：**MVVM + Repository**。

| 架构分层 | Android 体系 | iOS 体系 | 核心职责说明 |
| --- | --- | --- | --- |
| 声明式 UI 层 | `Compose (@Composable)` | `SwiftUI (View)` | UI 渲染与捕获用户意图 |
| 业务状态层 | `ViewModel + StateFlow` | `ViewModel (@Observable)` | 持有业务状态与处理领域逻辑 |
| 数据仓库层 | `Repository` | `Repository` | 统一管理本地与远程数据源 |
| 数据源接口 | `DataSource` | `Service / Client` | 封装底层具体获取行为 |
| 基础设施层 | `Retrofit / Room` | `URLSession / SwiftData` | 网络传输与数据库底层持久化 |

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

| 模式 / 框架 | Android 体系 | iOS 体系 | 核心特性说明 |
| --- | --- | --- | --- |
| 轻量服务定位容器 | `Koin` | `Factory` | 模块化工厂注册与轻量解析 |
| 大型编译期生成框架 | `Hilt / Dagger` | `Swinject / Resolver` | 编译期强类型或运行时容器注入 |
| 原生构造解耦 | 构造函数手动注入 | `protocol + init 构造注入` | iOS 强烈推荐：纯协议 + 构造函数注入 |

很多 iOS 项目直接：**protocol + 构造函数注入**，未必上框架。

### ⑫ 图片与静态资源

| 资产类型 | Android 体系 | iOS 体系 | 核心特性说明 |
| --- | --- | --- | --- |
| 资源目录 | `res/drawable / mipmap` | `Assets.xcassets` | 静态图片、色彩集与矢量资产 |
| 内存位图 | `Bitmap` | `UIImage` | 内存中光栅化位图对象 |
| 网络图片异步加载 | `Coil / Glide` | `AsyncImage / Kingfisher` | 异步下载、多级缓存与过渡淡入 |
| 界面渲染绘制 | `Painter / ImageBitmap` | `Image / UIImage` | UI 视图绘制与展示 |

### ⑬ 动画与转场动效

| 动画类型 | Android 体系 | iOS 体系 | 核心特性说明 |
| --- | --- | --- | --- |
| 状态驱动属性动画 | `animate*AsState / updateTransition` | `withAnimation / .animation` | 状态触发平滑插值过渡 |
| 元素转场进出 | `AnimatedVisibility` | `.transition` | 视图插入与移除时的淡入/滑出动效 |
| 跨层级共享元素 | `MotionLayout / SharedElement` | `matchedGeometryEffect` | 跨视图平滑几何形变与位置转场 |

### ⑭ 系统能力

实战高频，主路径未展开，迁移时优先补：

| 系统能力 | Android 体系 | iOS 体系 | 核心特性说明 |
| --- | --- | --- | --- |
| 敏感权限申请 | `Manifest + runtime permission` | `Info.plist + 系统授权弹窗` | 动态向用户申请相机、相册、定位等权限 |
| 后台任务调度 | `WorkManager` | `BackgroundTasks (BGTaskScheduler)` | 满足系统约束条件下的延时后台作业 |
| 远程消息推送 | `FCM (Firebase Cloud Messaging)` | `APNs` | 系统级推送服务通道与消息唤醒 |
| 外部深链直达 | `App Links / Intent Filter` | `Universal Links / URL Scheme` | 浏览器或外部 App 唤醒直达指定页面 |

### ⑮ 单元测试与 UI 测试

| 测试类型 | Android 体系 | iOS 体系 | 核心特性说明 |
| --- | --- | --- | --- |
| 单元测试框架 | `JUnit` | `XCTest` | 业务逻辑测试与断言机制 |
| 自动化 UI 测试 | `Espresso / Compose UI Test` | `XCUITest` | 界面元素定位与自动化交互测试 |
| 异步数据流测试 | `runTest / Turbine` | `async/await XCTest / expectation` | 协程异步任务与 Flow 流时序验证 |

### ⑯ 打包构建与应用发布

| 发布阶段 | Android 体系 | iOS 体系 | 核心特性说明 |
| --- | --- | --- | --- |
| 构建多环境配置 | `Build Variants / Flavors` | `Build Schemes / Configurations` | Debug / Staging / Release 差异化编译 |
| 打包产物格式 | `APK / AAB` | `IPA / Xcode Archive` | 应用分发归档安装包 |
| 应用管理后台 | `Google Play Console` | `App Store Connect` | 版本发布、元数据审核与 TestFlight 分发 |
| 代码签名与安全 | `Keystore / Play App Signing` | `Certificates / Provisioning Profiles` | 开发者身份证书与设备描述文件校验 |

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

