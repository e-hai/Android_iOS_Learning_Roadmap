import Foundation

enum RoadmapData {
    static let cheatSheet: [ComparisonRow] = [
        .init(android: "Kotlin 语法", ios: "struct / protocol / Optional / ARC"),
        .init(android: "Activity 生命周期", ios: "scenePhase + onAppear（勿硬套）"),
        .init(android: "Compose", ios: "SwiftUI 布局与 modifier"),
        .init(android: "ViewModel + StateFlow", ios: "@Observable + @MainActor"),
        .init(android: "Navigation Compose", ios: "NavigationStack + Path"),
        .init(android: "协程 + Flow", ios: "async/await + Task + AsyncSequence + Actor"),
        .init(android: "Retrofit", ios: "URLSession + Codable"),
        .init(android: "Room", ios: "SwiftData"),
        .init(android: "Hilt", ios: "先手写注入，再视项目选框架"),
    ]

    static let practiceWeeks: [String] = [
        "第 1 周：①②③ — 空工程 + 语言差异 + 生命周期体感",
        "第 2–3 周：④⑤⑥ — 用 SwiftUI 做一个多页 Demo",
        "第 4 周：⑦⑧⑨ — 接真实 API + 本地缓存",
        "第 5 周：⑩ — 按 MVVM 重整，再挑 ⑭⑮ 补权限与测试",
        "之后：按需补 ⑪–⑬、⑯，准备上架",
    ]

    static let stages: [LearningStage] = [
        LearningStage(
            id: "env",
            number: 1,
            title: "开发环境与项目结构",
            stars: "★★★★☆",
            isAdvanced: false,
            goal: "认识 App 怎么组织。本阶段不用写业务代码。",
            notes: [
                "Package.swift 主要用于 SPM 库工程；普通 App 以 Xcode Project / Target 为准。",
            ],
            practice: "各建一个空工程，弄清入口文件、资源目录、Run 到模拟器。",
            rows: [
                .init(android: "Android Studio", ios: "Xcode", note: "IDE、模拟器、调试"),
                .init(android: "Gradle", ios: "Xcode Project + SPM", note: "依赖与构建"),
                .init(android: "AndroidManifest.xml", ios: "Info.plist", note: "应用配置 / 权限声明入口"),
                .init(android: "app/build.gradle(.kts)", ios: "Xcode Target 设置", note: "项目配置（非 Package.swift）"),
                .init(android: "Module", ios: "Target / Framework", note: "工程拆分"),
                .init(android: "APK / AAB", ios: "IPA", note: "产物形态"),
            ],
            extraHint: "Android: Project → app / manifest / res / kotlin\niOS: Project → App / Assets / Preview / Info.plist / Sources"
        ),
        LearningStage(
            id: "language",
            number: 2,
            title: "语言与类型系统",
            stars: "★★★★★",
            isAdvanced: false,
            goal: "按同一主题顺序过 Kotlin，再对照 Swift。迁移最大坑：Swift 以值类型（struct）+ ARC 为主。",
            notes: [
                "优先用 struct 建模 UI State / Model；需要共享可变状态再用 class / @Observable",
                "闭包捕获 self 时警惕循环引用",
                "enum 关联值 ≈ 很多 sealed class 场景",
                "Android 更常用继承；iOS 更常用 Protocol + Extension",
            ],
            practice: "用 Swift 写一套 User / Result / Repository 协议，刻意对比 struct 与 class 的拷贝行为。",
            rows: [
                .init(android: "val / var", ios: "let / var", note: "变量"),
                .init(android: "fun", ios: "func", note: "函数"),
                .init(android: "class / object", ios: "class / actor", note: "引用类型"),
                .init(android: "data class（引用语义）", ios: "struct（拷贝语义）", note: "值类型"),
                .init(android: "Nullable ?", ios: "Optional ? / !", note: "空安全"),
                .init(android: "List / Map / Set", ios: "Array / Dictionary / Set", note: "集合"),
                .init(android: "Lambda", ios: "Closure", note: "高阶函数"),
                .init(android: "扩展函数", ios: "Extension", note: "扩展"),
                .init(android: "interface", ios: "protocol", note: "接口"),
                .init(android: "sealed class", ios: "enum（可关联值）", note: "密封类型"),
                .init(android: "when", ios: "switch（须穷尽）", note: "分支"),
                .init(android: "异常 / Result", ios: "throws / Result", note: "错误"),
                .init(android: "GC", ios: "ARC（[weak self]）", note: "内存"),
                .init(android: "类委托 by", ios: "无直接等价；组合 / 包装", note: "委托"),
            ],
            extraHint: nil
        ),
        LearningStage(
            id: "lifecycle",
            number: 3,
            title: "生命周期",
            stars: "★★★★★",
            isAdvanced: false,
            goal: "Android 生命周期更细；SwiftUI 多用 onAppear / onDisappear + scenePhase。",
            notes: [
                "不要把 Activity 回调一对一硬套到 SwiftUI",
                "先问「页面可见？App 前后台？」再选 onAppear 或 scenePhase",
            ],
            practice: "打印 onAppear / onDisappear / scenePhase，对比 Activity 日志，建立体感。",
            rows: [
                .init(android: "Application", ios: "@main App"),
                .init(android: "Activity", ios: "Scene + 根 View"),
                .init(android: "Fragment", ios: "Navigation 中的一页 View"),
                .init(android: "View", ios: "View"),
                .init(android: "onCreate", ios: "init / 首次 onAppear"),
                .init(android: "onStart / onResume", ios: "onAppear + scenePhase == .active"),
                .init(android: "onPause / onStop", ios: "onDisappear + scenePhase"),
                .init(android: "onDestroy", ios: "deinit（仅 class）"),
            ],
            extraHint: "Android: Application → Activity → Fragment → View\niOS: App → Scene → View 层级（Window 由系统管理）"
        ),
        LearningStage(
            id: "ui",
            number: 4,
            title: "UI（Compose ↔ SwiftUI）",
            stars: "★★★★★",
            isAdvanced: false,
            goal: "直接学 Compose → SwiftUI，不必先深挖 XML / UIKit（维护老项目时再补）。",
            notes: [
                "声明式 UI 思想几乎一致，重点练布局组合与 modifier 链。",
            ],
            practice: "同一张列表页两端各写一版（标题 + 列表 + 点击）。",
            rows: [
                .init(android: "Column", ios: "VStack"),
                .init(android: "Row", ios: "HStack"),
                .init(android: "Box", ios: "ZStack"),
                .init(android: "Text", ios: "Text"),
                .init(android: "Image", ios: "Image"),
                .init(android: "Button", ios: "Button"),
                .init(android: "Spacer", ios: "Spacer"),
                .init(android: "LazyColumn", ios: "LazyVStack / List", note: "自定义列表 / 系统列表"),
                .init(android: "LazyRow", ios: "LazyHStack"),
                .init(android: "Modifier", ios: "modifier 链式调用"),
                .init(android: "padding / fillMaxSize", ios: ".padding() / .frame(maxWidth: .infinity)"),
            ],
            extraHint: nil
        ),
        LearningStage(
            id: "state",
            number: 5,
            title: "状态管理",
            stars: "★★★★★",
            isAdvanced: false,
            goal: "弄清声明式 UI 的状态归属：谁拥有状态、谁观察、谁双向绑定。",
            notes: [
                "@AppStorage 不是 rememberSaveable",
                "@Bindable 也不是 collectAsState",
            ],
            practice: "做一个计数器 + 可编辑文本框，再升级成带 ViewModel 的列表筛选。",
            rows: [
                .init(android: "remember + mutableStateOf", ios: "@State", note: "视图本地状态"),
                .init(android: "子组件改父状态", ios: "@Binding", note: "双向绑定向下传"),
                .init(android: "rememberSaveable", ios: "@SceneStorage", note: "场景级轻量恢复"),
                .init(android: "SharedPreferences 读写", ios: "@AppStorage", note: "键值偏好"),
                .init(android: "collectAsState()", ios: "观察 @Observable / task + AsyncSequence", note: "异步接到 UI"),
                .init(android: "ViewModel + StateFlow", ios: "@Observable / @State 持有模型", note: "页面级容器"),
                .init(android: "全局依赖", ios: "@Environment", note: "环境注入"),
            ],
            extraHint: "Android: remember → mutableStateOf → StateFlow → ViewModel\niOS: @State → @Binding → @Observable → @Environment"
        ),
        LearningStage(
            id: "navigation",
            number: 6,
            title: "页面导航",
            stars: "★★★★☆",
            isAdvanced: false,
            goal: "掌握 Navigation Compose 与 NavigationStack 的对应关系。",
            notes: [
                "路由用可 Hashable 类型或 NavigationPath 管理返回栈。",
            ],
            practice: "列表 → 详情 → 返回，带一个简单参数。",
            rows: [
                .init(android: "Navigation Compose", ios: "NavigationStack"),
                .init(android: "NavHost", ios: "NavigationStack 的根"),
                .init(android: "NavController / 路由", ios: "NavigationPath / Hashable 路由"),
                .init(android: "navigate()", ios: "path.append()"),
                .init(android: "popBackStack()", ios: "path.removeLast()"),
                .init(android: "参数传递", ios: "路由关联值 / 初始化参数"),
                .init(android: "BottomNav", ios: "TabView"),
            ],
            extraHint: nil
        ),
        LearningStage(
            id: "async",
            number: 7,
            title: "异步",
            stars: "★★★★★",
            isAdvanced: false,
            goal: "从协程迁移到 Swift Concurrency：async 染色与 Actor 隔离。",
            notes: [
                "UI 更新必须上主线程：Android 用 Main dispatcher，iOS 用 @MainActor",
            ],
            practice: "用 Task + URLSession 拉 JSON，再改成可取消的 task 修饰符版本。",
            rows: [
                .init(android: "suspend", ios: "async"),
                .init(android: "launch", ios: "Task { }"),
                .init(android: "async / await", ios: "async let / await"),
                .init(android: "withContext(Dispatchers.Main)", ios: "@MainActor / MainActor.run"),
                .init(android: "Flow", ios: "AsyncSequence / AsyncStream"),
                .init(android: "Channel", ios: "AsyncChannel 或 Actor 封装"),
                .init(android: "Mutex / 共享可变状态", ios: "Actor"),
                .init(android: "callbackFlow", ios: "AsyncStream"),
            ],
            extraHint: "Android: Thread → Coroutine → Flow → Channel\niOS: Thread → Task → AsyncSequence → Actor"
        ),
        LearningStage(
            id: "network",
            number: 8,
            title: "网络",
            stars: "★★★★☆",
            isAdvanced: false,
            goal: "用 URLSession + Codable 完成与 Retrofit 同等的 API 调用。",
            notes: [
                "建议顺序：OkHttp → Retrofit → Serialization；iOS：URLSession → Codable → API Client",
            ],
            practice: "同一个 REST 接口两端请求并解码成模型。",
            rows: [
                .init(android: "OkHttp", ios: "URLSession", note: "底层 HTTP"),
                .init(android: "Retrofit", ios: "URLSession + API Client", note: "API 层"),
                .init(android: "Ktor Client", ios: "URLSession / 第三方"),
                .init(android: "Gson / kotlinx.serialization", ios: "Codable + JSONDecoder"),
            ],
            extraHint: nil
        ),
        LearningStage(
            id: "storage",
            number: 9,
            title: "数据存储",
            stars: "★★★★☆",
            isAdvanced: false,
            goal: "区分偏好、敏感信息与本地数据库的对应方案。",
            notes: [
                "令牌等敏感信息用 Keychain；不要只放 UserDefaults",
            ],
            practice: "登录 token 存 Keychain + 用户设置存 UserDefaults + 简单本地列表用 SwiftData。",
            rows: [
                .init(android: "SharedPreferences", ios: "UserDefaults / @AppStorage", note: "轻量偏好"),
                .init(android: "DataStore", ios: "UserDefaults 或小文件"),
                .init(android: "EncryptedPrefs / Keystore", ios: "Keychain", note: "敏感信息"),
                .init(android: "Room", ios: "SwiftData / CoreData", note: "本地数据库"),
                .init(android: "SQLDelight / SQLite", ios: "SQLite / GRDB"),
                .init(android: "文件 / Cache", ios: "FileManager"),
            ],
            extraHint: "Android: SharedPreferences → DataStore → Room\niOS: UserDefaults → Keychain → SwiftData"
        ),
        LearningStage(
            id: "architecture",
            number: 10,
            title: "架构",
            stars: "★★★★★",
            isAdvanced: false,
            goal: "两端几乎同一套：MVVM + Repository。",
            notes: [
                "View 保持瘦：只绑状态、发意图",
                "网络/数据库细节进 Repository，不要堆在 View",
                "iOS ViewModel 常用 @Observable + @MainActor，不一定继承基类",
            ],
            practice: "用同一架构完成「列表 + 详情 + 收藏（本地）+ 网络刷新」。",
            rows: [
                .init(android: "UI (Compose)", ios: "View (SwiftUI)"),
                .init(android: "ViewModel", ios: "ViewModel (@Observable)"),
                .init(android: "Repository", ios: "Repository"),
                .init(android: "DataSource", ios: "Service"),
                .init(android: "Network / DB", ios: "API / Store"),
            ],
            extraHint: "Android: UI → ViewModel → Repository → DataSource → Network/DB\niOS: View → ViewModel → Repository → Service → API/Store"
        ),
        LearningStage(
            id: "di",
            number: 11,
            title: "依赖注入",
            stars: "★★★☆☆",
            isAdvanced: true,
            goal: "了解常见 DI 框架；很多 iOS 项目直接 protocol + 构造函数注入。",
            notes: [
                "主路径跑通小 App 后再补框架。",
            ],
            practice: "先用手写构造注入完成一个 Repository，再评估是否需要框架。",
            rows: [
                .init(android: "Koin", ios: "Factory"),
                .init(android: "Hilt / Dagger", ios: "Swinject / Resolver"),
                .init(android: "构造注入", ios: "protocol + 构造函数注入"),
            ],
            extraHint: nil
        ),
        LearningStage(
            id: "images",
            number: 12,
            title: "图片与资源",
            stars: "★★★☆☆",
            isAdvanced: true,
            goal: "掌握资源目录与网络图片加载对应方案。",
            notes: [],
            practice: "用 Assets 放本地图，再用 AsyncImage 加载一张网络图。",
            rows: [
                .init(android: "drawable / mipmap", ios: "Assets.xcassets"),
                .init(android: "Bitmap", ios: "UIImage"),
                .init(android: "Coil / Glide", ios: "AsyncImage / Kingfisher"),
                .init(android: "Painter / ImageBitmap", ios: "Image / UIImage"),
            ],
            extraHint: nil
        ),
        LearningStage(
            id: "animation",
            number: 13,
            title: "动画",
            stars: "★★★★☆",
            isAdvanced: true,
            goal: "对照 Compose Animation 与 SwiftUI 动画 API。",
            notes: [],
            practice: "给列表项加出现 transition，再做一个 matchedGeometryEffect 共享元素动画。",
            rows: [
                .init(android: "Compose Animation", ios: "withAnimation / animation"),
                .init(android: "AnimatedVisibility", ios: "transition"),
                .init(android: "MotionLayout / Shared Element", ios: "matchedGeometryEffect"),
            ],
            extraHint: nil
        ),
        LearningStage(
            id: "platform",
            number: 14,
            title: "权限 · 后台 · 推送",
            stars: "★★★★☆",
            isAdvanced: true,
            goal: "补齐实战高频能力：权限、后台任务、推送、深链。",
            notes: [
                "迁移时优先于动画/DI 补这一块。",
            ],
            practice: "申请一项权限（如通知），并阅读 Info.plist 用途说明写法。",
            rows: [
                .init(android: "Manifest + runtime permission", ios: "Info.plist + 系统弹窗", note: "权限"),
                .init(android: "WorkManager", ios: "BackgroundTasks", note: "后台任务"),
                .init(android: "FCM", ios: "APNs", note: "推送"),
                .init(android: "App Links / Intent", ios: "Universal Links / URL Scheme", note: "深链"),
            ],
            extraHint: nil
        ),
        LearningStage(
            id: "testing",
            number: 15,
            title: "测试",
            stars: "★★★☆☆",
            isAdvanced: true,
            goal: "建立单元测试与 UI 测试的对应工具链。",
            notes: [],
            practice: "给 ViewModel 写一个 XCTest，断言状态变化。",
            rows: [
                .init(android: "JUnit", ios: "XCTest"),
                .init(android: "Espresso / Compose UI Test", ios: "XCUITest"),
                .init(android: "协程测试", ios: "async 测试 / 期望值"),
            ],
            extraHint: nil
        ),
        LearningStage(
            id: "release",
            number: 16,
            title: "发布",
            stars: "★★★☆☆",
            isAdvanced: true,
            goal: "了解 Debug/Release、打包产物与商店上架流程。",
            notes: [],
            practice: "在 Xcode 里 Archive 一次，打开 Organizer 看产物结构。",
            rows: [
                .init(android: "Debug / Release", ios: "Debug / Release"),
                .init(android: "APK / AAB", ios: "IPA / Archive"),
                .init(android: "Google Play Console", ios: "App Store Connect"),
                .init(android: "签名 / Play App Signing", ios: "Certificates / Profiles"),
            ],
            extraHint: nil
        ),
    ]

    static var mainPathStages: [LearningStage] {
        stages.filter { !$0.isAdvanced }
    }

    static var advancedStages: [LearningStage] {
        stages.filter(\.isAdvanced)
    }

    static func stage(id: String) -> LearningStage? {
        stages.first { $0.id == id }
    }
}
