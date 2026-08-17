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
- ★ 为主路径（建议按序学完）；☆ 为进阶（可后补）

---

## 推荐学习顺序总览

```
【主路径 ★】
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

【进阶 ☆】
⑪ 依赖注入 · ⑫ 图片资源 · ⑬ 动画 · ⑭ 权限/后台/推送 · ⑮ 测试 · ⑯ 发布
```

---

## ① 开发环境与工程结构 ★★★★☆

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

## ② 语言与类型系统 ★★★★★

**阶段目标：** 深入掌握 Kotlin ↔ Swift 语法映射，透彻理解 `struct` 值语义、ARC 引用计数弱引用、POP 面向协议编程与 `enum` 关联值。  
**迁移最大坑：** Swift 以 **值类型（struct）+ ARC** 为主，不是 Java/Kotlin 那套「万物皆引用 + JVM GC」。

### 模块一：变量、函数与空安全（基础语法）

| 维度 | Android 体系 (Kotlin) | iOS 体系 (Swift) | 核心学习重点 |
| --- | --- | --- | --- |
| 常量与变量 | `val` (只读) / `var` (可变) | `let` (常量绑定) / `var` (可变变量) | 变量可变性控制（Swift 推荐优先使用 `let`） |
| 函数声明 | `fun foo(x: Int): String` | `func foo(x: Int) -> String` | 函数签名语法与 Swift 外部参数标签支持 |
| 空安全体系 | Nullable `?` / Elvis `?:` / `!!` | Optional `?` / `??` / `if let` / `guard let` / `!` | 可选类型安全解包（**强烈推崇 `guard let` 卫语句**） |
| 集合与可变性 | `List` / `MutableList` / `Map` / `Set` | `Array` / `Dictionary` / `Set` | Swift 通过 `let` / `var` 统一控制集合可变性 |
| 分支模式匹配 | `when (x) { is Int -> ... }` | `switch x { case ... }` | Swift `switch` 必须穷尽匹配，原生支持复杂模式解构 |

### 模块二：面向对象与值语义（核心心智差异）

| 维度 | Android 体系 (Kotlin) | iOS 体系 (Swift) | 核心学习重点 |
| --- | --- | --- | --- |
| 核心值类型 | `data class`（仍是引用语义/堆分配） | **`struct`（值类型/栈分配/自动深拷贝）** | **Swift 核心基石**：UI State、Model 与 View 全是 struct |
| 引用与并发类 | `class` / `object` (单例) | `class` (引用类型) / `actor` (并发隔离类) | 跨组件共享可变状态用 class，线程安全状态用 actor |
| 接口与协议 | `interface` (接口多继承) | `protocol` (面向协议编程 POP) | 协议组合与基于协议的抽象设计 |
| 扩展能力 | `fun String.foo()` (扩展函数) | `extension String { ... }` | Swift 扩展支持扩展方法、计算属性与协议实现 |
| 委托机制 | 类委托 `by delegate` | 协议扩展默认实现 / 组合包装 | 优先通过 `protocol extension` 提供默认实现 |

### 模块三：高级类型、枚举与泛型

| 维度 | Android 体系 (Kotlin) | iOS 体系 (Swift) | 核心学习重点 |
| --- | --- | --- | --- |
| 密封/代数类型 | `sealed class` / `sealed interface` | **`enum`（支持携带关联值 Associated Values）** | Swift 枚举可为每个 case 携带不同类型元组数据 |
| 泛型与约束 | `fun <T> foo()` / `out` / `in` 协变逆变 | `<T: Constraint>` / `some View` (不透明) / `any` (存在) | Swift `some` 隐藏具体类型，`any` 运行时装箱 |
| 属性访问器 | `val prop get() = ...` (自定义 getter) | `var prop: Type { get { ... } }` (计算属性) | 计算属性与只读属性声明语法 |
| 访问控制 | `private` / `protected` / `internal` / `public` | `private` / `fileprivate` / `internal` / `public` / `open` | Swift 模块内外可见性与可继承权限控制 |

### 模块四：闭包、错误处理与内存模型（避坑重点）

| 维度 | Android 体系 (Kotlin) | iOS 体系 (Swift) | 核心学习重点 |
| --- | --- | --- | --- |
| 高阶函数闭包 | Lambda: `{ a -> ... }` (尾随闭包) | Closure: `{ a in ... }` (尾随闭包 / `$0` 简写) | Swift 闭包语法与参数隐式简写 |
| 错误处理 | `try-catch` / `runCatching` / `Result` | `do-try-catch` / `throws` / `try?` / `Result<T, Error>` | Swift 显式错误抛出与 `try?` 可选值转换 |
| 内存管理 | JVM GC (垃圾回收器，无强引用循环断裂) | **ARC (自动引用计数，闭包必须 `[weak self]`)** | **最大内存泄漏坑**：循环引用与弱引用破环 |

**语言特性与心智体系全景对照：**

```
【数据模型】Kotlin: data class User(...) (引用语义) ↔ Swift: struct User(...) (值类型/自动深拷贝)
【多态机制】Kotlin: open class Base → class Child : Base() ↔ Swift: protocol Identifiable → extension Identifiable
【状态枚举】Kotlin: sealed class UiState ↔ Swift: enum UiState { case loading, success(Data), error(Error) }
【内存回收】Kotlin: JVM GC (无循环引用强断裂) ↔ Swift: ARC (闭包必须 [weak self] 避免循环引用)
```

**迁移避坑指南：**
1. **值类型主导 vs 引用类型**：Swift 中 `struct` 是第一等公民（UI State、数据模型、SwiftUI View 均为 struct），传参与赋值为自动深拷贝，天生线程安全；只有需要跨组件共享可变状态时才使用 `class`。
2. **ARC 内存管理与闭包循环引用**：Swift 采用自动引用计数 (ARC) 而非 JVM GC！当闭包持有 `self` 且 `self` 也持有该闭包时，必须使用 `[weak self]` 弱引用打破循环引用，否则将导致严重内存泄漏。
3. **Optional 可空性最佳实践**：优先使用 `guard let ... else { return }` 卫语句提前返回，或 `if let` 可选绑定；严禁在生产代码滥用强行解包运算符 `!`。
4. **面向协议编程 (POP) vs 类继承**：Android 习惯用抽象基类继承；iOS 体系强烈推崇 `protocol` + `extension` 默认实现，通过协议拼装与组合实现多态与解耦。
5. **强大的 Enum 关联值**：Swift 的 `enum` 支持为每个分支绑定不同类型的关联值 (Associated Values)，能原生替代 Kotlin 中绝大多数 `sealed class` 状态机建模场景。

**练手实战任务：** 用 Swift 实现一套带关联值的 Result 枚举与 User Model（对比 struct 与 class 拷贝行为），定义一个 Repository 协议并用 extension 提供默认实现，最后在异步闭包中使用 `[weak self]` 模拟网络回调解包数据。

---

## ③ 生命周期（分代横向对齐）★★★★★

不要拿 Activity 去硬套 SwiftUI！必须**分代横向对齐**：传统时代对标 UIKit，现代时代对标 Compose。

### 3.1 模块一：传统时代（命令式 UI：Activity / Fragment ↔ UIKit）

| 职责 / 阶段 | Android (传统 View 体系) | iOS (传统 UIKit 体系) |
| --- | --- | --- |
| 全局应用 | `Application` | `UIApplicationDelegate` / `AppDelegate` |
| 页面级控制器 | **`Activity`** | **`UIViewController`** |
| 子页面/片段 | **`Fragment`** | **`Child UIViewController`** |
| 视图初始化 | `onCreate()` / `setContentView()` | `viewDidLoad()` / `loadView()` |
| 页面即将/已经可见 | `onStart()` ➔ `onResume()` | `viewWillAppear()` ➔ `viewDidAppear()` |
| 页面离开/不可见 | `onPause()` ➔ `onStop()` | `viewWillDisappear()` ➔ `viewDidDisappear()` |
| 销毁与释放 | `onDestroy()` | `deinit` |

### 3.2 模块二：现代时代（声明式 UI：Jetpack Compose ↔ SwiftUI）

| 职责 / 概念 | Android (Jetpack Compose) | iOS (SwiftUI) |
| --- | --- | --- |
| 应用根入口 | `Single Activity` + `setContent { App() }` | `@main struct App: App` (`WindowGroup`) |
| UI 基本单元 | **`@Composable fun Screen()`**（函数） | **`struct ScreenView: View`**（值类型结构体） |
| 挂载异步任务 | `LaunchedEffect(key) { ... }` | **`.task { ... }`**（进入启动协程，离开自动取消） |
| 视图出现 / 消失 | `DisposableEffect` 的 `onDispose` | **`.onAppear { }`** / **`.onDisappear { }`** |
| 系统前后台状态 | `LifecycleEventObserver` (ON_RESUME / ON_PAUSE) | **`@Environment(\.scenePhase)`** (`.active` / `.background`) |
| 业务状态持有者 | `ViewModel` (`onCleared`) | **`@Observable class ViewModel`** (`deinit`) |

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

## ④ UI 布局（Compose ↔ SwiftUI）★★★★★

**阶段目标：** 直接从 Jetpack Compose 迁移到 SwiftUI：掌握核心容器布局、基础控件与 Modifier 链式调用。  
**核心认知：** 两者皆为现代声明式 UI，思想高度一致；最大区别在于 **SwiftUI Modifier 的包装顺序**与**容器闭包子视图数量约束**。

### 模块一：核心容器与流式列表（布局骨架）

| 布局类型 | Android (Compose) | iOS (SwiftUI) | 核心特性说明 |
| --- | --- | --- | --- |
| 垂直排列 | `Column` (垂直线性) | `VStack` (垂直堆叠) | 主轴纵向排列，默认包裹内容高度 |
| 水平排列 | `Row` (水平线性) | `HStack` (水平堆叠) | 主轴横向排列，默认包裹内容宽度 |
| 层叠覆盖 | `Box` (层叠覆盖) | `ZStack` (层叠堆叠) | Z 轴深度层叠，后声明的 View 在最上层 |
| 惰性纵向列表 | `LazyColumn` | `List` (系统样式) / `LazyVStack` (自定义) | 列表复用（`List` 自带原生分割线与滑动删除） |
| 惰性网格布局 | `LazyVerticalGrid` | `LazyVGrid(columns:)` | 响应式多列瀑布流与宫格布局 |
| 基础滚动容器 | `Modifier.verticalScroll()` | `ScrollView` | 非复用型滚动视图容器 |
| 弹性占位扩展 | `Spacer()` / `.weight(1f)` | `Spacer()` | 自动挤开剩余空间（两端弹簧效果） |
| 分割线 | `HorizontalDivider()` | `Divider()` | 系统自适应 1px/0.5px 分割线 |

### 模块二：常用基础控件（原子组件）

| 控件类型 | Android (Compose) | iOS (SwiftUI) | 核心特性说明 |
| --- | --- | --- | --- |
| 文本显示 | `Text("...")` | `Text("...")` | 支持字号、加粗、颜色与行数截断 |
| 文本输入 | `TextField` / `BasicTextField` | `TextField` / `SecureField` (密码框) | 绑定双向字符串状态 `$text` |
| 交互按钮 | `Button(onClick = { })` | `Button("...", action: { })` | 原生交互与点击波纹/透明度反馈 |
| 图标与图片 | `Image` / `Icon` | `Image("...")` / `Image(systemName:)` | iOS 原生支持 **SF Symbols 系统矢量图标** |
| 开关与选择 | `Switch` / `Checkbox` | `Toggle(isOn: $isOn)` | 绑定 Boolean 状态并触发动画切换 |
| 进度指示器 | `CircularProgressIndicator` | `ProgressView()` | 自适应环形/条形加载指示器 |

### 模块三：Modifier 链式修饰与尺寸（样式机制）

| 修饰类型 | Android (Compose) | iOS (SwiftUI) | 核心特性说明 |
| --- | --- | --- | --- |
| 链式包装 | `Modifier.padding().background()` | `.padding().background()` | **从上至下依次包装**（顺序不同效果截然不同） |
| 尺寸撑满 | `fillMaxWidth()` / `fillMaxSize()` | `.frame(maxWidth: .infinity)` | 声明式弹性尺寸适配 |
| 点击手势 | `Modifier.clickable { }` | `.onTapGesture { }` | 任意 View 挂载点击手势 |
| 圆角裁剪 | `Modifier.clip(RoundedCornerShape(8.dp))` | `.clipShape(RoundedRectangle(cornerRadius: 8))` | 视图边框与裁剪控制 |
| 投影阴影 | `Modifier.shadow(4.dp)` | `.shadow(radius: 4)` | 深度与高斯模糊投影 |
| 安全区域 | `Modifier.systemBarsPadding()` | 默认遵循安全区 / `.ignoresSafeArea()` | 顶底安全区域避让机制 |

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

## ⑤ 状态管理 ★★★★★

本质是 **声明式 UI 的状态归属**：谁拥有状态、谁观察、谁双向绑定。

| Android (Compose) | iOS (SwiftUI) | 说明 |
| --- | --- | --- |
| `remember` + `mutableStateOf` | `@State` | 视图本地状态 |
| 子组件改父状态 | `@Binding` | 双向绑定向下传 |
| `rememberSaveable` | `@SceneStorage` | 进程/场景级轻量恢复（≠ 偏好存储） |
| SharedPreferences 读写 | `@AppStorage` | 键值偏好 |
| `collectAsState()` | 观察 `@Observable` / 用 `task` 消费 `AsyncSequence` | 把异步数据接到 UI |
| ViewModel + StateFlow | `@Observable` 类 / `@State` 持有模型 | 页面级状态容器 |
| 全局依赖 | `@Environment` / `@EnvironmentObject` | 环境注入 |

学习路径：

```
Android: remember → mutableStateOf → StateFlow → ViewModel
iOS:     @State → @Binding → @Observable → @Environment
```

**迁移注意：** `@AppStorage` 不是 `rememberSaveable`；`@Bindable` 也不是 `collectAsState`。

**练手：** 做一个计数器 + 可编辑文本框，再升级成带 ViewModel 的列表筛选。

---

## ⑥ 页面导航与路由（Nav3 & NavigationStack）★★★★☆

**阶段目标：** 掌握现代第三代「数据驱动/状态列表」路由架构（Android Nav3 / 2.8+ 强类型 ↔ iOS 16+ NavigationStack），并理解两端历史演进与向后兼容。  
**核心认知：** 两端现代路由的本质都是**「可观察的状态列表」**；页面跳转即 `List.add`，返回即 `List.removeLast`，彻底告别 URL 字符串拼接与视图级强绑定。

### 模块一：第三代标准（现代数据驱动 · 核心心智 · 重点）

| 导航操作 / 维度 | Android (Nav3 / 2.8+ 强类型) | iOS (SwiftUI 16+ NavigationStack) | 核心特性说明 |
| --- | --- | --- | --- |
| **状态栈数据源** | `val backStack = rememberNavBackStack()` (Nav3) | `@State var path: [AppRoute] = []` | 纯状态驱动（数组列表） |
| **强类型路由节点** | `@Serializable data class Detail(val id: String)` | `enum AppRoute: Hashable { case detail(id: String) }` | 编译期强类型，告别字符串拼写错误 |
| **页面跳转 (压栈)** | `backStack.add(Detail(...))` / `navigate(Detail)` | `path.append(.detail(...))` | 状态驱动压入目标路由 |
| **页面返回 (出栈)** | `backStack.pop()` / `popBackStack()` | `path.removeLast()` | 弹出顶层路由返回上一级 |
| **一键回首页** | `backStack.clear()` / `popBackStack(Home, false)` | `path.removeAll()` | **Pop to Root** 一键清栈回首页 |
| **路由呈现容器** | `NavDisplay(backStack) { route -> when(route) }` | `NavigationStack(path: $path) + .navigationDestination` | 惰性解耦构建目标 View |
| **大屏/分屏支持** | `NavDisplay` (多窗分栏支持) | `NavigationSplitView(sidebar:detail:)` | iPad / 折叠屏双栏分栏 |
| **底部导航选项卡** | `NavigationBar + NavDisplay` | `TabView(selection: $tab)` | 根级多分支页面容器 |

### 模块二：第一二代演进与跨版本兼容（避坑与老项目）

| 演进代际 | Android (Jetpack Compose) | iOS (SwiftUI) | 核心缺陷与兼容方案 |
| --- | --- | --- | --- |
| **第一代 (早期探索)** | URL 字符串模板 `composable("detail/{id}")` | `NavigationView` + 嵌套 `NavigationLink(destination:)` | 缺陷：无强类型 / 子 View 提前初始化引发内存灾难 |
| **第二代 (过渡演进)** | Navigation Compose 2.8+ (Kotlinx Serialization 强类型) | `NavigationStack` (iOS 16+ 引入) | 解决：全类型安全路由与惰性构建 |
| **第三代 (现代标准)** | **Nav3 (纯 Compose 状态驱动)** | **`NavigationStack(path:)` (纯数据栈驱动)** | 终极：两端心智完全统一，状态列表即路由栈 |
| **跨版本兼容方案** | 生产首选 `Navigation 2.8+` 官方库；KMP 跨平台选 `Voyager` | iOS 14/15 推荐开源库 **`NavigationStackBackport`** | 零重构成本抹平低版本 API 差异 |

**现代第三代纯数据驱动路由架构：**

```
[ 现代第三代纯数据驱动路由: Android Nav3 <-> iOS 16+ NavigationStack ]

 1. 路由节点定义 (强类型模型):
    Android: @Serializable data class DetailRoute(val id: String)
    iOS:     enum AppRoute: Hashable { case detail(id: String) }

 2. 状态栈管理 (纯 List 数据源):
    Android (Nav3):  val backStack = rememberNavBackStack(HomeRoute)
    iOS (SwiftUI):   @State var path: [AppRoute] = []

 3. 核心栈操作映射 (压栈 / 出栈 / 回首页):
    跳转压栈:   backStack.add(DetailRoute("101"))   <->  path.append(.detail("101"))
    返回出栈:   backStack.pop()                     <->  path.removeLast()
    一键回首页: backStack.clear()                   <->  path.removeAll()

 4. 路由呈现容器:
    Android (Nav3):
      NavDisplay(backStack) { route ->
          when (route) {
              is HomeRoute   -> HomeScreen(...)
              is DetailRoute -> DetailScreen(route.id)
          }
      }

    iOS (SwiftUI):
      NavigationStack(path: $path) {
          HomeView()
              .navigationDestination(for: AppRoute.self) { route in
                  switch route {
                  case .detail(let id): DetailView(id: id)
                  }
              }
      }
```

**迁移避坑指南：**
1. **第三代核心心智（纯数据驱动）**：两端现代路由本质都是「可观察的状态列表」；页面跳转即 `List.add`，返回即 `List.removeLast`，彻底告别 URL 字符串与视图级嵌套。
2. **SwiftUI 早期提前初始化陷阱**：iOS 13~15 的 `NavigationLink(destination:)` 会在列表渲染时提前初始化所有目标 View；必须升级至 iOS 16+ `NavigationStack` 或使用 `NavigationStackBackport` 避免性能灾难。
3. **Android 路由演进路径**：老项目为字符串匹配；主流为 Navigation 2.8+ 官方 Kotlinx Serialization 强类型；下一代为纯 Compose 状态驱动的 **Nav3**。
4. **平板与分屏适配**：单栏使用 `NavigationStack`，iPad/折叠屏双栏分屏使用 `NavigationSplitView(sidebar:detail:)`，对标 Nav3 的多窗 `NavDisplay`。

**练手实战任务：** 定义强类型路由枚举/对象，使用 `NavigationStack(path:)` 与 `NavDisplay/NavHost` 实现「列表压栈跳转 ➔ 详情参数读取 ➔ 一键回首页 (Pop to Root)」完整闭环。

---

## ⑦ 异步 ★★★★★

会 Kotlin 协程的话，Swift Concurrency 上手很快，但要习惯 **async 函数染色** 与 **Actor 隔离**。

| Kotlin | Swift |
| --- | --- |
| `suspend` | `async` |
| `launch` | `Task { }` |
| `async` / `await` | `async let` / `await` |
| `withContext(Dispatchers.Main)` | `@MainActor` / `MainActor.run` |
| Flow | AsyncSequence / AsyncStream |
| Channel | `AsyncChannel`（swift-async-algorithms）或 Actor 封装 |
| Mutex / 共享可变状态 | **Actor** |
| `callbackFlow` | `AsyncStream` |

学习路径：

```
Android: Thread → Coroutine → Flow → Channel
iOS:     Thread → Task → AsyncSequence → Actor
```

**迁移注意：** UI 更新必须上主线程——Android 用 Main dispatcher，iOS 用 `@MainActor`。

**练手：** 用 `Task` + `URLSession` 拉 JSON，再改成可取消的 `task` 修饰符版本。

---

## ⑧ 网络 ★★★★☆

| Android | iOS |
| --- | --- |
| OkHttp（底层 HTTP） | URLSession |
| Retrofit（API 层） | URLSession + 自己的 API Client（或 Alamofire） |
| Ktor Client | URLSession / 第三方 |
| Gson / kotlinx.serialization | **Codable** + `JSONDecoder` |

建议顺序：

```
Android: OkHttp → Retrofit → Serialization（Ktor 可选）
iOS:     URLSession → Codable/JSONDecoder → 封装 API Client
```

**练手：** 同一个 REST 接口两端请求并解码成模型。

---

## ⑨ 数据存储 ★★★★☆

| Android | iOS | 用途 |
| --- | --- | --- |
| SharedPreferences | UserDefaults / `@AppStorage` | 轻量偏好 |
| DataStore | UserDefaults 或小文件 | 稍规范的偏好/数据 |
| — | **Keychain** | 令牌等敏感信息（Android 侧多为 EncryptedSharedPreferences / Keystore） |
| Room | **SwiftData**（新）/ CoreData（存量） | 本地数据库 |
| SQLDelight / SQLite | SQLite / GRDB 等 | SQL 层 |
| 文件 / Cache | FileManager | 文件缓存 |

学习路径：

```
Android: SharedPreferences → DataStore → Room
iOS:     UserDefaults → Keychain → SwiftData（需要时再补 CoreData）
```

**练手：** 登录 token 存 Keychain + 用户设置存 UserDefaults + 一个简单本地列表用 SwiftData。

---

## ⑩ 架构 ★★★★★

两端几乎同一套：**MVVM + Repository**。

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

## 进阶部分 ☆

主路径跑通一个小 App 后再补。

### ⑪ 依赖注入 ★★★☆☆

| Android | iOS |
| --- | --- |
| Koin | Factory |
| Hilt / Dagger | Swinject / Resolver |

很多 iOS 项目直接：**protocol + 构造函数注入**，未必上框架。

### ⑫ 图片与资源 ★★★☆☆

| Android | iOS |
| --- | --- |
| drawable / mipmap | Assets.xcassets |
| Bitmap | UIImage |
| Coil / Glide | AsyncImage / Kingfisher 等 |
| Painter / ImageBitmap | Image / UIImage |

### ⑬ 动画 ★★★★☆

| Android | iOS |
| --- | --- |
| Compose Animation | SwiftUI `withAnimation` / `animation` |
| `AnimatedVisibility` | `transition` |
| MotionLayout / Shared Element | `matchedGeometryEffect` |

### ⑭ 权限 · 后台 · 推送 ★★★★☆

实战高频，主路径未展开，迁移时优先补：

| 能力 | Android | iOS |
| --- | --- | --- |
| 权限 | Manifest + runtime permission | Info.plist 用途说明 + 系统弹窗 |
| 后台任务 | WorkManager | BackgroundTasks |
| 推送 | FCM | APNs |
| 深链 | App Links / Intent | Universal Links / URL Scheme |

### ⑮ 测试 ★★★☆☆

| Android | iOS |
| --- | --- |
| JUnit | XCTest |
| Espresso / Compose UI Test | XCUITest |
| 协程测试 | async 测试 / 期望值 |

### ⑯ 发布 ★★★☆☆

| Android | iOS |
| --- | --- |
| Debug / Release | Debug / Release |
| APK / AAB | IPA / Archive |
| Google Play Console | App Store Connect |
| 签名 / Play App Signing | Certificates / Profiles / Notarization（Mac 相关另说） |

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
