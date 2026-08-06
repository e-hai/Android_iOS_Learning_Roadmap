import Foundation

/// 静态学习路线内容源（文案 key 对应 Localizable.xcstrings）。
/// 仅应由 `LocalRoadmapRepository` 读取，界面层不要直接调用。
enum RoadmapData {
    /// 首页速查对照。
    static var cheatSheet: [ComparisonRow] {
        (0..<9).map { i in
            ComparisonRow(
                android: L10n.tr("cheat.\(i).a"),
                ios: L10n.tr("cheat.\(i).i")
            )
        }
    }

    /// 建议练习周节奏。
    static var practiceWeeks: [String] {
        (0..<5).map { L10n.tr("week.\($0)") }
    }

    /// 全部阶段定义。
    static var stages: [LearningStage] {
        [
            stageEnv, stageLanguage, stageLifecycle, stageUI, stageState,
            stageNavigation, stageAsync, stageNetwork, stageStorage, stageArchitecture,
            stageDI, stageImages, stageAnimation, stagePlatform, stageTesting, stageRelease,
        ]
    }

    static var mainPathStages: [LearningStage] {
        stages.filter { !$0.isAdvanced }
    }

    static var advancedStages: [LearningStage] {
        stages.filter(\.isAdvanced)
    }

    static func stage(id: String) -> LearningStage? {
        stages.first { $0.id == id }
    }

    // MARK: - 各阶段内容

    private static var stageEnv: LearningStage {
        LearningStage(
            id: "env", number: 1,
            title: L10n.tr("stage.env.title"), stars: "★★★★☆", isAdvanced: false,
            goal: L10n.tr("stage.env.goal"),
            notes: [L10n.tr("stage.env.note.0")],
            practice: L10n.tr("stage.env.practice"),
            rows: [
                .init(android: "Android Studio", ios: "Xcode", note: L10n.tr("row.note.ide")),
                .init(android: "Gradle", ios: "Xcode Project + SPM", note: L10n.tr("row.note.build")),
                .init(android: "AndroidManifest.xml", ios: "Info.plist", note: L10n.tr("row.note.config")),
                .init(android: "app/build.gradle(.kts)", ios: "Xcode Target", note: L10n.tr("row.note.target")),
                .init(android: "Module", ios: "Target / Framework", note: L10n.tr("row.note.module")),
                .init(android: "APK / AAB", ios: "IPA", note: L10n.tr("row.note.artifact")),
            ],
            extraHint: L10n.tr("stage.env.hint")
        )
    }

    private static var stageLanguage: LearningStage {
        LearningStage(
            id: "language", number: 2,
            title: L10n.tr("stage.language.title"), stars: "★★★★★", isAdvanced: false,
            goal: L10n.tr("stage.language.goal"),
            notes: (0..<4).map { L10n.tr("stage.language.note.\($0)") },
            practice: L10n.tr("stage.language.practice"),
            rows: [
                .init(android: "val / var", ios: "let / var", note: L10n.tr("row.note.var")),
                .init(android: "fun", ios: "func", note: L10n.tr("row.note.func")),
                .init(android: "class / object", ios: "class / actor", note: L10n.tr("row.note.ref")),
                .init(android: L10n.tr("row.cell.data_class"), ios: L10n.tr("row.cell.struct_copy"), note: L10n.tr("row.note.value")),
                .init(android: "Nullable ?", ios: "Optional ? / !", note: L10n.tr("row.note.null")),
                .init(android: "List / Map / Set", ios: "Array / Dictionary / Set", note: L10n.tr("row.note.collection")),
                .init(android: "Lambda", ios: "Closure", note: L10n.tr("row.note.hof")),
                .init(android: L10n.tr("row.cell.ext_fun"), ios: "Extension", note: L10n.tr("row.note.ext")),
                .init(android: "interface", ios: "protocol", note: L10n.tr("row.note.iface")),
                .init(android: "sealed class", ios: L10n.tr("row.cell.enum_assoc"), note: L10n.tr("row.note.sealed")),
                .init(android: "when", ios: L10n.tr("row.cell.switch"), note: L10n.tr("row.note.branch")),
                .init(android: L10n.tr("row.cell.exception"), ios: "throws / Result", note: L10n.tr("row.note.error")),
                .init(android: "GC", ios: L10n.tr("row.cell.arc"), note: L10n.tr("row.note.mem")),
                .init(android: L10n.tr("row.cell.class_delegate"), ios: L10n.tr("row.cell.no_delegate"), note: L10n.tr("row.note.delegate")),
            ],
            extraHint: nil
        )
    }

    private static var stageLifecycle: LearningStage {
        LearningStage(
            id: "lifecycle", number: 3,
            title: L10n.tr("stage.lifecycle.title"), stars: "★★★★★", isAdvanced: false,
            goal: L10n.tr("stage.lifecycle.goal"),
            notes: (0..<2).map { L10n.tr("stage.lifecycle.note.\($0)") },
            practice: L10n.tr("stage.lifecycle.practice"),
            rows: [
                .init(android: "Application", ios: "@main App"),
                .init(android: "Activity", ios: L10n.tr("row.cell.scene_root")),
                .init(android: "Fragment", ios: L10n.tr("row.cell.nav_page")),
                .init(android: "View", ios: "View"),
                .init(android: "onCreate", ios: L10n.tr("row.cell.oncreate")),
                .init(android: "onStart / onResume", ios: "onAppear + scenePhase == .active"),
                .init(android: "onPause / onStop", ios: "onDisappear + scenePhase"),
                .init(android: "onDestroy", ios: L10n.tr("row.cell.deinit")),
            ],
            extraHint: L10n.tr("stage.lifecycle.hint")
        )
    }

    private static var stageUI: LearningStage {
        LearningStage(
            id: "ui", number: 4,
            title: L10n.tr("stage.ui.title"), stars: "★★★★★", isAdvanced: false,
            goal: L10n.tr("stage.ui.goal"),
            notes: [L10n.tr("stage.ui.note.0")],
            practice: L10n.tr("stage.ui.practice"),
            rows: [
                .init(android: "Column", ios: "VStack"),
                .init(android: "Row", ios: "HStack"),
                .init(android: "Box", ios: "ZStack"),
                .init(android: "Text", ios: "Text"),
                .init(android: "Image", ios: "Image"),
                .init(android: "Button", ios: "Button"),
                .init(android: "Spacer", ios: "Spacer"),
                .init(android: "LazyColumn", ios: "LazyVStack / List", note: L10n.tr("row.note.list")),
                .init(android: "LazyRow", ios: "LazyHStack"),
                .init(android: "modifier", ios: L10n.tr("row.cell.modifier_chain")),
                .init(android: "padding / fillMaxSize", ios: ".padding() / .frame(maxWidth: .infinity)"),
            ],
            extraHint: nil
        )
    }

    private static var stageState: LearningStage {
        LearningStage(
            id: "state", number: 5,
            title: L10n.tr("stage.state.title"), stars: "★★★★★", isAdvanced: false,
            goal: L10n.tr("stage.state.goal"),
            notes: (0..<2).map { L10n.tr("stage.state.note.\($0)") },
            practice: L10n.tr("stage.state.practice"),
            rows: [
                .init(android: "remember + mutableStateOf", ios: "@State", note: L10n.tr("row.note.local_state")),
                .init(android: L10n.tr("row.cell.child_parent"), ios: "@Binding", note: L10n.tr("row.note.binding")),
                .init(android: "rememberSaveable", ios: "@SceneStorage", note: L10n.tr("row.note.scene")),
                .init(android: L10n.tr("row.cell.sp_rw"), ios: "@AppStorage", note: L10n.tr("row.note.prefs")),
                .init(android: "collectAsState()", ios: L10n.tr("row.cell.observe"), note: L10n.tr("row.note.async_ui")),
                .init(android: "ViewModel + StateFlow", ios: L10n.tr("row.cell.vm_hold"), note: L10n.tr("row.note.vm")),
                .init(android: L10n.tr("row.cell.global"), ios: "@Environment", note: L10n.tr("row.note.env")),
            ],
            extraHint: L10n.tr("stage.state.hint")
        )
    }

    private static var stageNavigation: LearningStage {
        LearningStage(
            id: "navigation", number: 6,
            title: L10n.tr("stage.navigation.title"), stars: "★★★★☆", isAdvanced: false,
            goal: L10n.tr("stage.navigation.goal"),
            notes: [L10n.tr("stage.navigation.note.0")],
            practice: L10n.tr("stage.navigation.practice"),
            rows: [
                .init(android: "Navigation Compose", ios: "NavigationStack"),
                .init(android: "NavHost", ios: L10n.tr("row.cell.nav_root")),
                .init(android: L10n.tr("row.cell.nav_route"), ios: L10n.tr("row.cell.hash_route")),
                .init(android: "navigate()", ios: "path.append()"),
                .init(android: "popBackStack()", ios: "path.removeLast()"),
                .init(android: L10n.tr("row.cell.params"), ios: L10n.tr("row.cell.route_assoc")),
                .init(android: "BottomNav", ios: "TabView"),
            ],
            extraHint: nil
        )
    }

    private static var stageAsync: LearningStage {
        LearningStage(
            id: "async", number: 7,
            title: L10n.tr("stage.async.title"), stars: "★★★★★", isAdvanced: false,
            goal: L10n.tr("stage.async.goal"),
            notes: [L10n.tr("stage.async.note.0")],
            practice: L10n.tr("stage.async.practice"),
            rows: [
                .init(android: "suspend", ios: "async"),
                .init(android: "launch", ios: "Task { }"),
                .init(android: "async / await", ios: "async let / await"),
                .init(android: "withContext(Dispatchers.Main)", ios: "@MainActor / MainActor.run"),
                .init(android: "Flow", ios: "AsyncSequence / AsyncStream"),
                .init(android: "Channel", ios: L10n.tr("row.cell.channel")),
                .init(android: L10n.tr("row.cell.mutex"), ios: "Actor"),
                .init(android: "callbackFlow", ios: "AsyncStream"),
            ],
            extraHint: L10n.tr("stage.async.hint")
        )
    }

    private static var stageNetwork: LearningStage {
        LearningStage(
            id: "network", number: 8,
            title: L10n.tr("stage.network.title"), stars: "★★★★☆", isAdvanced: false,
            goal: L10n.tr("stage.network.goal"),
            notes: [L10n.tr("stage.network.note.0")],
            practice: L10n.tr("stage.network.practice"),
            rows: [
                .init(android: "OkHttp", ios: "URLSession", note: L10n.tr("row.note.http")),
                .init(android: "Retrofit", ios: "URLSession + API Client", note: L10n.tr("row.note.api")),
                .init(android: "Ktor Client", ios: L10n.tr("row.cell.third_party")),
                .init(android: "Gson / kotlinx.serialization", ios: "Codable + JSONDecoder"),
            ],
            extraHint: nil
        )
    }

    private static var stageStorage: LearningStage {
        LearningStage(
            id: "storage", number: 9,
            title: L10n.tr("stage.storage.title"), stars: "★★★★☆", isAdvanced: false,
            goal: L10n.tr("stage.storage.goal"),
            notes: [L10n.tr("stage.storage.note.0")],
            practice: L10n.tr("stage.storage.practice"),
            rows: [
                .init(android: "SharedPreferences", ios: "UserDefaults / @AppStorage", note: L10n.tr("row.note.light_prefs")),
                .init(android: "DataStore", ios: L10n.tr("row.cell.datastore")),
                .init(android: "EncryptedPrefs / Keystore", ios: "Keychain", note: L10n.tr("row.note.secrets")),
                .init(android: "Room", ios: "SwiftData / CoreData", note: L10n.tr("row.note.db")),
                .init(android: "SQLDelight / SQLite", ios: "SQLite / GRDB"),
                .init(android: L10n.tr("row.cell.files"), ios: "FileManager"),
            ],
            extraHint: L10n.tr("stage.storage.hint")
        )
    }

    private static var stageArchitecture: LearningStage {
        LearningStage(
            id: "architecture", number: 10,
            title: L10n.tr("stage.architecture.title"), stars: "★★★★★", isAdvanced: false,
            goal: L10n.tr("stage.architecture.goal"),
            notes: (0..<3).map { L10n.tr("stage.architecture.note.\($0)") },
            practice: L10n.tr("stage.architecture.practice"),
            rows: [
                .init(android: "UI (Compose)", ios: "View (SwiftUI)"),
                .init(android: "ViewModel", ios: "ViewModel (@Observable)"),
                .init(android: "Repository", ios: "Repository"),
                .init(android: "DataSource", ios: "Service"),
                .init(android: "Network / DB", ios: "API / Store"),
            ],
            extraHint: L10n.tr("stage.architecture.hint")
        )
    }

    private static var stageDI: LearningStage {
        LearningStage(
            id: "di", number: 11,
            title: L10n.tr("stage.di.title"), stars: "★★★☆☆", isAdvanced: true,
            goal: L10n.tr("stage.di.goal"),
            notes: [L10n.tr("stage.di.note.0")],
            practice: L10n.tr("stage.di.practice"),
            rows: [
                .init(android: "Koin", ios: "Factory"),
                .init(android: "Hilt / Dagger", ios: "Swinject / Resolver"),
                .init(android: L10n.tr("row.cell.ctor"), ios: L10n.tr("row.cell.protocol_ctor")),
            ],
            extraHint: nil
        )
    }

    private static var stageImages: LearningStage {
        LearningStage(
            id: "images", number: 12,
            title: L10n.tr("stage.images.title"), stars: "★★★☆☆", isAdvanced: true,
            goal: L10n.tr("stage.images.goal"),
            notes: [],
            practice: L10n.tr("stage.images.practice"),
            rows: [
                .init(android: "drawable / mipmap", ios: "Assets.xcassets"),
                .init(android: "Bitmap", ios: "UIImage"),
                .init(android: "Coil / Glide", ios: "AsyncImage / Kingfisher"),
                .init(android: "Painter / ImageBitmap", ios: "Image / UIImage"),
            ],
            extraHint: nil
        )
    }

    private static var stageAnimation: LearningStage {
        LearningStage(
            id: "animation", number: 13,
            title: L10n.tr("stage.animation.title"), stars: "★★★★☆", isAdvanced: true,
            goal: L10n.tr("stage.animation.goal"),
            notes: [],
            practice: L10n.tr("stage.animation.practice"),
            rows: [
                .init(android: "Compose Animation", ios: "withAnimation / animation"),
                .init(android: "AnimatedVisibility", ios: "transition"),
                .init(android: "MotionLayout / Shared Element", ios: "matchedGeometryEffect"),
            ],
            extraHint: nil
        )
    }

    private static var stagePlatform: LearningStage {
        LearningStage(
            id: "platform", number: 14,
            title: L10n.tr("stage.platform.title"), stars: "★★★★☆", isAdvanced: true,
            goal: L10n.tr("stage.platform.goal"),
            notes: [L10n.tr("stage.platform.note.0")],
            practice: L10n.tr("stage.platform.practice"),
            rows: [
                .init(android: "Manifest + runtime permission", ios: L10n.tr("row.cell.plist_alert"), note: L10n.tr("row.note.perm")),
                .init(android: "WorkManager", ios: "BackgroundTasks", note: L10n.tr("row.note.bg")),
                .init(android: "FCM", ios: "APNs", note: L10n.tr("row.note.push")),
                .init(android: "App Links / Intent", ios: "Universal Links / URL Scheme", note: L10n.tr("row.note.deeplink")),
            ],
            extraHint: nil
        )
    }

    private static var stageTesting: LearningStage {
        LearningStage(
            id: "testing", number: 15,
            title: L10n.tr("stage.testing.title"), stars: "★★★☆☆", isAdvanced: true,
            goal: L10n.tr("stage.testing.goal"),
            notes: [],
            practice: L10n.tr("stage.testing.practice"),
            rows: [
                .init(android: "JUnit", ios: "XCTest"),
                .init(android: "Espresso / Compose UI Test", ios: "XCUITest"),
                .init(android: L10n.tr("row.cell.coroutine_test"), ios: L10n.tr("row.cell.async_test")),
            ],
            extraHint: nil
        )
    }

    private static var stageRelease: LearningStage {
        LearningStage(
            id: "release", number: 16,
            title: L10n.tr("stage.release.title"), stars: "★★★☆☆", isAdvanced: true,
            goal: L10n.tr("stage.release.goal"),
            notes: [],
            practice: L10n.tr("stage.release.practice"),
            rows: [
                .init(android: "Debug / Release", ios: "Debug / Release"),
                .init(android: "APK / AAB", ios: "IPA / Archive"),
                .init(android: "Google Play Console", ios: "App Store Connect"),
                .init(android: L10n.tr("row.cell.signing"), ios: "Certificates / Profiles"),
            ],
            extraHint: nil
        )
    }
}
