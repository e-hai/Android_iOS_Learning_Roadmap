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

## ① 开发环境与项目结构 ★★★★☆

**目标：** 认识 App 怎么组织。本阶段不用写业务代码。

| Android | iOS | 学习重点 |
| --- | --- | --- |
| Android Studio | Xcode | IDE、模拟器、调试 |
| Gradle | Xcode Project + SPM | 依赖与构建 |
| `AndroidManifest.xml` | `Info.plist` | 应用配置 / 权限声明入口 |
| `app/build.gradle(.kts)` | Xcode Target 设置 | 项目配置（非 Package.swift） |
| Module | Target / Framework | 工程拆分 |
| APK / AAB | IPA | 产物形态 |

> `Package.swift` 主要用于 SPM 库工程；普通 App 以 Xcode Project / Target 为准。

**项目结构对照：**

```
Android                         iOS
Project                         Project
 ├── app                         ├── App
 ├── AndroidManifest              ├── Assets.xcassets
 ├── res                          ├── Preview Content
 └── java/kotlin                 ├── Info.plist
                                 └── Sources / 各 Target
```

**练手：** 各建一个空工程，弄清入口文件、资源目录、Run 到模拟器。

---

## ② 语言与类型系统 ★★★★★

先按同一主题顺序过一遍 Kotlin，再对照 Swift。  
**迁移最大坑：** Swift 以 **值类型（struct）+ ARC** 为主，不是 Java/Kotlin 那套「万物皆引用 + GC」。

| 主题 | Kotlin | Swift |
| --- | --- | --- |
| 变量 | `val` / `var` | `let` / `var` |
| 函数 | `fun` | `func` |
| 引用类型 | `class` / `object` | `class` / `actor` |
| 值类型 | `data class`（仍是引用语义的类） | **`struct`（拷贝语义）** |
| 空安全 | Nullable `?` | Optional `?` / `!` |
| 集合 | `List` / `Map` / `Set` | `Array` / `Dictionary` / `Set` |
| 高阶函数 | Lambda | Closure |
| 扩展 | 扩展函数 | Extension |
| 泛型 | Generics | Generics |
| 接口 | `interface` | `protocol` |
| 密封类型 | `sealed class` | `enum`（可关联值） |
| 分支 | `when` | `switch`（须穷尽） |
| 错误 | 异常 / `Result` | `throws` / `Result` |
| 内存 | GC | **ARC（注意循环引用 / `[weak self]`）** |

**面向对象风格差异：**

| Android 常见写法 | iOS 更常见写法 |
| --- | --- |
| 继承 + 抽象类 | Protocol + Extension |
| `interface` | `protocol` |
| 类委托 `by` | 无直接等价；组合 / 包装类型 |
| `object` 单例 | `static` / 共享实例 |

```
Android:  open class Animal → class Dog : Animal()
iOS:      protocol Animal { ... } → struct/class Dog: Animal
```

**迁移注意**

- 优先用 `struct` 建模 UI State / Model；需要共享可变状态再用 `class` / `@Observable`
- 闭包捕获 `self` 时警惕循环引用
- `enum` 关联值 ≈ 很多 `sealed class` 场景

**练手：** 用 Swift 写一套 User / Result / Repository 协议，刻意对比 `struct` 与 `class` 的拷贝行为。

---

## ③ 生命周期 ★★★★★

Android 生命周期更细；SwiftUI 没有同等粒度的 `onStart` / `onResume` 拆分，多用 **`onAppear` / `onDisappear` + `scenePhase`**。

| Android | iOS（更贴近的理解） |
| --- | --- |
| Application | `@main` App |
| Activity | Scene + 根 View（不是简单等于 Window） |
| Fragment | Navigation 中的一页 View |
| View | View |
| `onCreate` | `init` / 首次 `onAppear` |
| `onStart` / `onResume` | `onAppear` + `scenePhase == .active` |
| `onPause` / `onStop` | `onDisappear` + `scenePhase`（`.inactive` / `.background`） |
| `onDestroy` | `deinit`（仅 class；struct View 无此概念） |

层级对照：

```
Android: Application → Activity → Fragment → View
iOS:     App → Scene → View 层级（Window 由系统管理）
```

**迁移注意：** 不要把 Activity 回调一对一硬套到 SwiftUI；先问「页面可见？App 前后台？」再选 `onAppear` 或 `scenePhase`。

**练手：** 打印 `onAppear` / `onDisappear` / `scenePhase`，对比 Activity 日志，建立体感。

---

## ④ UI（Compose ↔ SwiftUI）★★★★★

建议直接学 **Compose → SwiftUI**，不必先深挖 XML / UIKit（维护老项目时再补 UIKit）。

| Compose | SwiftUI |
| --- | --- |
| Column | VStack |
| Row | HStack |
| Box | ZStack |
| Text | Text |
| Image | Image |
| Button | Button |
| Spacer | Spacer |
| LazyColumn | **LazyVStack**（自定义列表）/ **List**（系统列表） |
| LazyRow | LazyHStack |
| Modifier | modifier 链式调用 |
| `padding` / `fillMaxSize` | `.padding()` / `.frame(maxWidth: .infinity)` |

**练手：** 同一张列表页两端各写一版（标题 + 列表 + 点击）。

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

## ⑥ 页面导航 ★★★★☆

| Android | iOS |
| --- | --- |
| Navigation Compose | NavigationStack |
| NavHost | NavigationStack 的根 |
| NavController / 路由 | NavigationPath / 可 Hashable 路由 |
| `navigate()` | `path.append()` |
| `popBackStack()` | `path.removeLast()` |
| 参数传递 | 路由关联值 / 初始化参数 |
| BottomNav | `TabView` |

**练手：** 列表 → 详情 → 返回，带一个简单参数。

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
