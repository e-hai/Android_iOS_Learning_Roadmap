import { i18n } from '../services/i18n';

/**
 * Domain-specific Unicode Box-drawing architecture and hierarchy diagrams (5 Domains).
 */
const DIAGRAMS: Record<string, string> = {
  domain_01_basics: `[ 模块 01: 平台基础与核心框架全景架构 ]

 1. 【并发核心】
    Android: 协程挂起状态机 (K1/K2) + Continuation + Dispatchers + repeatOnLifecycle
    iOS:     Swift Concurrency (async/await) + Task 树 + @MainActor + Actor 数据隔离

 2. 【声明式 UI、列表与手势】
    Android: Compose Slot Table + remember/LaunchedEffect + LazyColumn + pointerInput / NestedScroll
    iOS:     SwiftUI AttributeGraph + @State/.task + List / LazyVStack + DragGesture

 3. 【网络通信与本地持久化】
    Android: Retrofit + OkHttp (连接池/拦截器) ──▶ Room (Schema 迁移/Flow 响应式)
    iOS:     URLSession (后台守护/自定义协议) ──▶ SwiftData / CoreData (ModelContext)`,

  domain_02_arch: `[ 模块 02: 现代架构与组件化治理体系 ]

 +-----------------------------------------------------------------------------------+
 | 视图呈现层 (View Layer)                                                           |
 |   Android: Compose View (纯函数无状态)    │  iOS: SwiftUI View (短命不可变结构体) |
 +-----------------------------------------------------------------------------------+
                                         │
                                         │ 发送用户意图 (User Intent / Action)
                                         ▼
 +-----------------------------------------------------------------------------------+
 | 状态与业务机 (ViewModel Layer)                                                    |
 |   不可变全量状态: StateFlow<UiState>      │  单一真实状态源: @Observable UiState  |
 |   一次性业务副作用: Channel<UiEffect>      │  单次事件广播: AsyncStream<UiEffect>  |
 +-----------------------------------------------------------------------------------+
                                         │
                                         │ 依赖倒置契约调用 (DIP Protocol / Interface)
                                         ▼
 +-----------------------------------------------------------------------------------+
 | 领域与仓储层 (Domain & Repository Layer)                                          |
 |   多模块隔离沙箱 (build-logic / SPM Target) ──▶ 屏蔽网络与本地数据源细节           |
 +-----------------------------------------------------------------------------------+`,

  domain_03_perf: `[ 模块 03: 性能调优闭环与线上故障攻坚 ]

 1. 【性能优化闭环 (监控 ➔ 定位 ➔ 优化 ➔ 验证)】
    指标度量:          TTID / TTFD 启动耗时          <──▶  MetricKit / os_signpost
    微观追踪:          Perfetto / Systrace 追踪      <──▶  Instruments Time Profiler
    预编译优化:        Baseline Profiles 预热 AOT    <──▶  PGO (Profile-Guided Optimization)
    防回归门禁:        Macrobenchmark CI 门禁集成    <──▶  XCTest Performance Metrics

 2. 【线上重大疑难故障攻坚】
    主线程阻塞/假死:   ANR 机制 / 5s 阈值 / 信号抓取  <──▶  Watchdog 卡死 (0x8badf00d) 崩溃捕获
    内存恶性消耗:      LeakCanary 弱引用 / Native 暴涨<──▶  Instruments Allocations / Leaks / Malloc
    并发死锁与竞态:    线程锁争用 / 协程未捕获异常    <──▶  Thread Sanitizer (TSan) / 线程爆炸排查`,

  domain_04_media: `[ 模块 04: 多媒体采集 ➔ 渲染 ➔ 硬件编解码全链路 ]

 1. 【图像采集与同步】
    Android: Camera2 / CameraX (ImageReader 帧缓冲) ──▶ SurfaceTexture (OES 外部纹理)
    iOS:     AVCaptureSession (AVCaptureVideoDataOutput) ──▶ CVPixelBuffer

 2. 【底层图形渲染管线】
    Android: EGL 多线程上下文 ──▶ OpenGL ES 着色器管线 (Vertex/Fragment) ──▶ FBO 离屏渲染
    iOS:     MTLDevice / MTLCommandQueue ──▶ Metal 渲染管线 ──▶ CAMetalLayer 显示

 3. 【硬件编解码与音画对齐】
    Android: MediaCodec (Surface 输入硬编码 H.264/H.265) ──▶ PTS/DTS 单调递增对齐 ──▶ MediaMuxer 封装
    iOS:     VideoToolbox (VTCompressionSession 硬编码) ──▶ CMTime 纳秒对齐 ──▶ AVAssetWriter 封装`,

  domain_05_global: `[ 模块 05: 全球化出海与商业变现体系 ]

 1. 【全球化订阅与内购】
    Android: Play Billing v6+ (PurchasesUpdatedListener) ──▶ 服务端 Receipt 验签 ──▶ 掉单补单机制
    iOS:     StoreKit 2 (Transaction.currentEntitlements) ──▶ JWS 验签 ──▶ Server Notifications v2

 2. 【广告聚合与智能竞价】
    AdMob / AppLovin MAX 聚合 ──▶ 实时 Header Bidding 竞价 ──▶ 瀑布流 (Waterfall) 降级兜底

 3. 【渠道归因与深度链接】
    MMP (AppsFlyer / Adjust) ──▶ AAID / IDFA 采集 ──▶ Deferred Deep Link 首次安装落地页直达

 4. 【远程实验与数据合规】
    Firebase Remote Config 实验 ──▶ GDPR / CCPA 隐私合规 (CMP 弹窗) ──▶ 权限最小化与数据彻底销毁`,
};

export function renderArchitectureDiagram(stageId: string, extraHintKey?: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'arch-diagram-card';

  const rawDiagram = (extraHintKey ? i18n.t(extraHintKey) : '') || DIAGRAMS[stageId] || '';

  if (!rawDiagram) {
    container.innerHTML = `<div class="arch-empty">暂无该模块架构图</div>`;
    return container;
  }

  const pre = document.createElement('pre');
  pre.className = 'arch-diagram-pre';
  pre.textContent = rawDiagram;

  container.appendChild(pre);
  return container;
}
