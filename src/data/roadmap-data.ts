import { LearningStage } from '../models/types';
import { deepDivesData } from './deep-dive-data';

export const cheatSheetKeys: { android: string; ios: string }[] = Array.from({ length: 9 }, (_, i) => ({
  android: `cheat.${i}.a`,
  ios: `cheat.${i}.i`,
}));

export const practiceWeekKeys: string[] = Array.from({ length: 5 }, (_, i) => `week.${i}`);

export const stages: LearningStage[] = [
  {
    id: 'domain_01_basics',
    number: 1,
    titleKey: 'stage.domain_01_basics.title',
    isAdvanced: false,
    goalKey: 'stage.domain_01_basics.goal',
    noteKeys: [
      'stage.domain_01_basics.note.0',
      'stage.domain_01_basics.note.1',
      'stage.domain_01_basics.note.2',
      'stage.domain_01_basics.note.3',
    ],
    practiceKey: 'stage.domain_01_basics.practice',
    extraHintKey: 'stage.domain_01_basics.hint',
    deepDive: deepDivesData.domain_01_basics,
    rows: [
      { id: 'coroutine', android: 'Kotlin 协程 (suspend / Flow / Channel)', ios: 'Swift Concurrency (async/await / Actor)', note: 'row.note.plat_bg' },
      { id: 'lang_val', android: 'val / var / data class', ios: 'let / var / struct', note: 'row.note.value' },
      { id: 'lang_mem', android: 'JVM GC (年轻代/老年代 CMC)', ios: 'ARC 引用计数 (Side Table / weak)', note: 'row.note.mem' },
      { id: 'ui_state', android: 'remember / rememberSaveable / derivedStateOf', ios: '@State / @Binding / @Observable', note: 'row.note.state_private' },
      { id: 'ui_effect', android: 'LaunchedEffect / DisposableEffect / SideEffect', ios: '.task / .onAppear / .onChange', note: 'row.note.task_mod' },
      { id: 'ui_list', android: 'LazyColumn (key / contentType / prefetch)', ios: 'List / LazyVStack (id / Cell 复用)', note: 'row.note.list_container' },
      { id: 'ui_canvas', android: 'Canvas (DrawScope) / Layout 测量放置', ios: 'Canvas (GraphicsContext) / Layout 协议', note: 'row.note.clip' },
      { id: 'ui_gesture', android: 'pointerInput (detectDrag / NestedScroll)', ios: '.gesture(DragGesture / Simultaneous)', note: 'row.note.click' },
      { id: 'net_core', android: 'Retrofit + OkHttp (连接池/拦截器/重试)', ios: 'URLSession (URLProtocol / Background)', note: 'row.note.net_http' },
      { id: 'net_parse', android: 'Kotlinx.Serialization / Moshi', ios: 'Codable 协议 (JSONDecoder / Encoder)', note: 'row.note.net_codable' },
      { id: 'db_orm', android: 'Room (Entity, DAO, InvalidationTracker)', ios: 'SwiftData / CoreData (@Model, Context)', note: 'row.note.storage_room' },
      { id: 'nav_stack', android: 'Navigation3 (NavHost / 类型安全栈)', ios: 'NavigationStack (NavigationPath / Destination)', note: 'row.note.nav_container' },
      { id: 'di_dsl', android: 'Koin (module { single / factory })', ios: 'Swift Macro DI / Factory 容器', note: 'row.note.di_koin' },
    ],
    sections: [
      {
        id: 'sec_async',
        titleKey: '阶段 1.1：协程与并发调度',
        rows: [
          { id: 'async_func', android: 'suspend fun fetch(): Result<T>', ios: 'func fetch() async throws -> T', note: 'row.note.func' },
          { id: 'async_launch', android: 'viewModelScope.launch { }', ios: 'Task { } / Task.detached { }', note: 'row.note.task_mod' },
          { id: 'async_main', android: 'withContext(Dispatchers.Main)', ios: '@MainActor / MainActor.run { }', note: 'row.note.resume_trad' },
          { id: 'async_stream', android: 'Flow<T> / StateFlow<T>', ios: 'AsyncSequence / @Observable 属性', note: 'row.note.state_derived' },
          { id: 'async_safety', android: 'Mutex.withLock { }', ios: 'actor SafeCounter { }', note: 'row.note.ref' },
        ],
      },
      {
        id: 'sec_lang',
        titleKey: '阶段 1.2：现代语言语法与内存模型',
        rows: [
          { id: 'lang_null', android: 'Nullable ? / Elvis ?: / !!', ios: 'Optional ? / ?? / guard let / !', note: 'row.note.null' },
          { id: 'lang_hof', android: 'inline / noinline / crossinline', ios: '@escaping / non-escaping / 尾随闭包', note: 'row.note.hof' },
          { id: 'lang_receiver', android: 'apply / with / let / run / also', ios: '链式闭包 / mutating 方法 / 扩展', note: 'row.note.ext' },
          { id: 'lang_poly', android: 'interface Clickable (默认方法)', ios: 'protocol Clickable + extension 默认实现', note: 'row.note.iface' },
        ],
      },
      {
        id: 'sec_ui',
        titleKey: '阶段 1.3：声明式 UI、列表与手势系统',
        rows: [
          { id: 'ui_compose', android: '@Composable fun Screen() { }', ios: 'struct Screen: View { var body: some View }', note: 'row.note.view_mod' },
          { id: 'ui_list_opt', android: 'items(list, key = { it.id }, contentType = { ... })', ios: 'ForEach(list, id: \\.id) { item in ... }', note: 'row.note.list_container' },
          { id: 'ui_draw', android: 'Modifier.drawBehind { drawCircle(...) }', ios: 'Canvas { context, size in context.fill(...) }', note: 'row.note.clip' },
          { id: 'ui_touch', android: 'Modifier.pointerInput { detectTapGestures() }', ios: '.onTapGesture { } / .gesture(DragGesture())', note: 'row.note.click' },
        ],
      },
      {
        id: 'sec_net',
        titleKey: '阶段 1.4：网络访问与数据通信',
        rows: [
          { id: 'net_client', android: 'OkHttpClient (ConnectionPool / Interceptor)', ios: 'URLSession (URLSessionConfiguration)', note: 'row.note.net_http' },
          { id: 'net_req', android: '@GET("api/user") suspend fun getUser(): User', ios: 'var request = URLRequest(url: ...)', note: 'row.note.net_api' },
          { id: 'net_serial', android: '@Serializable data class User(val id: String)', ios: 'struct User: Codable { let id: String }', note: 'row.note.net_codable' },
        ],
      },
      {
        id: 'sec_db',
        titleKey: '阶段 1.5：本地持久化与数据库',
        rows: [
          { id: 'db_entity', android: '@Entity(tableName = "users") data class User', ios: '@Model final class User (SwiftData)', note: 'row.note.storage_entity' },
          { id: 'db_query', android: '@Query("SELECT * FROM users") fun list(): Flow<List<User>>', ios: '@Query(sort: \\.name) var users: [User]', note: 'row.note.storage_query' },
          { id: 'db_pref', android: 'DataStore (Preferences DataStore)', ios: 'UserDefaults / @AppStorage', note: 'row.note.storage_ds' },
        ],
      },
    ],
  },
  {
    id: 'domain_02_arch',
    number: 2,
    titleKey: 'stage.domain_02_arch.title',
    isAdvanced: false,
    goalKey: 'stage.domain_02_arch.goal',
    noteKeys: [
      'stage.domain_02_arch.note.0',
      'stage.domain_02_arch.note.1',
      'stage.domain_02_arch.note.2',
      'stage.domain_02_arch.note.3',
    ],
    practiceKey: 'stage.domain_02_arch.practice',
    extraHintKey: 'stage.domain_02_arch.hint',
    deepDive: deepDivesData.domain_02_arch,
    rows: [
      { id: 'arch_state', android: 'StateFlow<UiState> (单一不可变数据源)', ios: '@Observable class ViewModel (真实状态源)', note: 'row.note.state_vm' },
      { id: 'arch_effect', android: 'Channel<UiEffect>(Channel.BUFFERED)', ios: 'AsyncStream<UiEffect> / PassthroughSubject', note: 'row.note.state_derived' },
      { id: 'arch_restore', android: 'SavedStateHandle (进程重建状态恢复)', ios: '@SceneStorage / NSUserActivity', note: 'row.note.state_scene' },
      { id: 'arch_dip', android: '依赖倒置: :feature:api ⟷ :feature:impl', ios: 'SPM Target: DomainContracts ⟷ FeatureHome', note: 'row.note.module' },
      { id: 'arch_build', android: 'build-logic (Gradle Convention Plugins)', ios: 'XCConfig 统一编译参数配置', note: 'row.note.workspace' },
      { id: 'arch_pattern', android: 'Modifier 链式模式 / Flow 响应式观察者', ios: 'ViewModifier 链式模式 / AsyncSequence', note: 'row.note.mod_order' },
    ],
    sections: [
      {
        id: 'sec_mvi',
        titleKey: '阶段 2.1：MVVM / MVI 单向数据流',
        rows: [
          { id: 'mvi_state', android: 'data class UiState(val loading: Boolean, val list: List<T>)', ios: 'struct UiState: Equatable { var list: [T] }', note: 'row.note.value' },
          { id: 'mvi_intent', android: 'sealed interface UiIntent { object Refresh : UiIntent }', ios: 'enum Action { case refresh } (TCA Action)', note: 'row.note.sealed' },
          { id: 'mvi_consume', android: 'val state by vm.uiState.collectAsStateWithLifecycle()', ios: 'Text(vm.state.title) (自动按需订阅)', note: 'row.note.state_consume' },
        ],
      },
      {
        id: 'sec_modular',
        titleKey: '阶段 2.2：大型应用组件化与模块治理',
        rows: [
          { id: 'mod_dip', android: 'DIP 原则: 模块间通过 Interface 协议解耦', ios: '面向 Protocol 抽象契约与依赖倒置', note: 'row.note.iface' },
          { id: 'mod_sandbox', android: '模块沙箱: 仅暴露 Api 库，隐藏 Impl 实现细节', ios: 'Target 访问控制: public 协议 + internal 实现', note: 'row.note.module' },
        ],
      },
    ],
  },
  {
    id: 'domain_03_perf',
    number: 3,
    titleKey: 'stage.domain_03_perf.title',
    isAdvanced: false,
    goalKey: 'stage.domain_03_perf.goal',
    noteKeys: [
      'stage.domain_03_perf.note.0',
      'stage.domain_03_perf.note.1',
      'stage.domain_03_perf.note.2',
      'stage.domain_03_perf.note.3',
    ],
    practiceKey: 'stage.domain_03_perf.practice',
    extraHintKey: 'stage.domain_03_perf.hint',
    deepDive: deepDivesData.domain_03_perf,
    rows: [
      { id: 'perf_trace', android: 'Perfetto / Systrace 系统级事件追踪', ios: 'Instruments Time Profiler / os_signpost', note: 'row.note.test_ui' },
      { id: 'perf_aot', android: 'Baseline Profiles (AOT 预热字节码)', ios: 'Profile-Guided Optimization (PGO)', note: 'row.note.rel_obfuscation' },
      { id: 'perf_benchmark', android: 'Macrobenchmark (冷启动 / 列表滑动门禁)', ios: 'XCTest Metric (XCTClockMetric / Memory)', note: 'row.note.test_unit' },
      { id: 'perf_anr', android: 'ANR 分析 (/data/anr/traces.txt 信号抓取)', ios: 'Watchdog (0x8badf00d 线程卡死报告)', note: 'row.note.test_async' },
      { id: 'perf_leak', android: 'LeakCanary (引用队列自动堆转储探测)', ios: 'Xcode Memory Graph / Allocations Leaks', note: 'row.note.mem' },
      { id: 'perf_native', android: 'Native 内存 (ASan / Malloc Debug / JNI)', ios: 'Malloc Stack Logging / Address Sanitizer', note: 'row.note.storage_io' },
    ],
    sections: [
      {
        id: 'sec_pipeline',
        titleKey: '阶段 3.1：体系化性能调优闭环',
        rows: [
          { id: 'pipe_monitor', android: 'TTID (首帧上屏) / TTFD (全量展示) 耗时度量', ios: 'MetricKit launchMetrics 真实用户统计', note: 'row.note.resume_trad' },
          { id: 'pipe_scroll', android: 'Compose Compiler Metrics (跳过重组率检查)', ios: 'CoreAnimation 60/120fps 丢帧检测', note: 'row.note.progress' },
        ],
      },
      {
        id: 'sec_trouble',
        titleKey: '阶段 3.2：线上重大疑难故障攻坚',
        rows: [
          { id: 'trouble_hang', android: '主线程锁争用 / 协程异常级联取消假死', ios: 'GCD 线程死锁 / 主队列阻塞排查', note: 'row.note.ref' },
          { id: 'trouble_oom', android: 'Bitmap 硬件缓存 / Native 全局引用泄漏', ios: '循环引用 (Delegate / Timer / 闭包强引用)', note: 'row.note.mem' },
        ],
      },
    ],
  },
  {
    id: 'domain_04_media',
    number: 4,
    titleKey: 'stage.domain_04_media.title',
    isAdvanced: false,
    goalKey: 'stage.domain_04_media.goal',
    noteKeys: [
      'stage.domain_04_media.note.0',
      'stage.domain_04_media.note.1',
      'stage.domain_04_media.note.2',
      'stage.domain_04_media.note.3',
    ],
    practiceKey: 'stage.domain_04_media.practice',
    extraHintKey: 'stage.domain_04_media.hint',
    deepDive: deepDivesData.domain_04_media,
    rows: [
      { id: 'media_gl', android: 'OpenGL ES 3.0 / EGL 多线程共享上下文', ios: 'Metal 图形管线 / MTLCommandQueue', note: 'row.note.img_render' },
      { id: 'media_surface', android: 'SurfaceView (独立图层) vs TextureView', ios: 'CAMetalLayer (CoreAnimation 直通图层)', note: 'row.note.view_mod' },
      { id: 'media_cam', android: 'Camera2 / CameraX (ImageReader 帧捕获)', ios: 'AVFoundation (AVCaptureVideoDataOutput)', note: 'row.note.plat_perm' },
      { id: 'media_codec', android: 'MediaCodec (Surface 输入硬编码 H.264/HEVC)', ios: 'VideoToolbox (VTCompressionSession 硬编)', note: 'row.note.img_crop_scale' },
      { id: 'media_pts', android: 'PTS / DTS 纳秒对齐 + MediaMuxer 封装', ios: 'CMTime 纳秒对齐 + AVAssetWriter 封装', note: 'row.note.storage_io' },
    ],
    sections: [
      {
        id: 'sec_graphics',
        titleKey: '阶段 4.1：底层图形渲染管线',
        rows: [
          { id: 'gfx_shader', android: 'GLSL 顶点/片元着色器 (Vertex/Fragment)', ios: 'Metal Shading Language (MSL 预编译 Shader)', note: 'row.note.img_blur_tint' },
          { id: 'gfx_fbo', android: 'FBO (FrameBuffer Object) 离屏渲染', ios: 'MTLRenderPassDescriptor 离屏纹理渲染', note: 'row.note.img_bmp' },
        ],
      },
      {
        id: 'sec_video',
        titleKey: '阶段 4.2：音视频采集编解码全链路',
        rows: [
          { id: 'vid_record', android: 'CameraX 预览 ➔ OpenGL 实时滤镜 ➔ 硬编码', ios: 'AVCaptureSession ➔ Metal 滤镜 ➔ 硬编码', note: 'row.note.img_async' },
          { id: 'vid_sync', android: '音画时间戳对齐 (System.nanoTime() / 1000)', ios: 'CMTimeCompare 纳秒级音视频帧同步', note: 'row.note.task_mod' },
        ],
      },
    ],
  },
  {
    id: 'domain_05_global',
    number: 5,
    titleKey: 'stage.domain_05_global.title',
    isAdvanced: false,
    goalKey: 'stage.domain_05_global.goal',
    noteKeys: [
      'stage.domain_05_global.note.0',
      'stage.domain_05_global.note.1',
      'stage.domain_05_global.note.2',
      'stage.domain_05_global.note.3',
    ],
    practiceKey: 'stage.domain_05_global.practice',
    extraHintKey: 'stage.domain_05_global.hint',
    deepDive: deepDivesData.domain_05_global,
    rows: [
      { id: 'glob_billing', android: 'Google Play Billing v6+ (queryPurchases)', ios: 'Apple StoreKit 2 (Transaction.updates)', note: 'row.note.signing' },
      { id: 'glob_receipt', android: '服务端 Developer API 验签 (防刷单/补单)', ios: 'JWS 官方加密签名校验 (Server Notifications)', note: 'row.note.net_status' },
      { id: 'glob_ad', android: 'AdMob / AppLovin MAX 聚合与实时竞价', ios: 'AdMob / MAX 聚合 (ATT 权限门槛)', note: 'row.note.plat_link' },
      { id: 'glob_mmp', android: 'AppsFlyer / Adjust (Deferred Deep Link)', ios: 'SKAdNetwork 4.0 (SKAN 差分隐私归因)', note: 'row.note.plat_link_scheme' },
      { id: 'glob_ab', android: 'Firebase Remote Config (实验互斥与灰度)', ios: 'Firebase / Apple Config 动态参数实验', note: 'row.note.rel_config' },
      { id: 'glob_gdpr', android: 'GDPR / CCPA / CMP 合规授权弹窗', ios: 'PrivacyInfo.xcprivacy (Privacy Manifest)', note: 'row.note.plat_perm_declare' },
    ],
    sections: [
      {
        id: 'sec_sub',
        titleKey: '阶段 5.1：全球化订阅与内购体系',
        rows: [
          { id: 'sub_flow', android: 'billingClient.launchBillingFlow() 调起支付', ios: 'Product.purchase() 现代异步购买', note: 'row.note.net_request' },
          { id: 'sub_ack', android: 'acknowledgePurchase() 确认发货 (防自动退款)', ios: 'transaction.finish() 显式关闭事务', note: 'row.note.net_status' },
        ],
      },
      {
        id: 'sec_compliance',
        titleKey: '阶段 5.2：渠道归因、实验与数据隐私合规',
        rows: [
          { id: 'comp_cmp', android: 'Google UMP (User Messaging Platform) 弹窗', ios: 'ATT (AppTrackingTransparency) 授权申请', note: 'row.note.plat_perm_status' },
          { id: 'comp_del', android: '用户被遗忘权: 本地数据库与云端彻底销毁', ios: 'GDPR Data Erasure 隐私合规销毁', note: 'row.note.storage_manage' },
        ],
      },
    ],
  },
];
