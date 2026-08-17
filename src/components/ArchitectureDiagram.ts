import { i18n } from '../services/i18n';

/**
 * Renders a rich visual architecture / hierarchy diagram for a stage.
 */
export function renderArchitectureDiagram(stageId: string, hintKey?: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'arch-diagram-card';

  switch (stageId) {
    case 'env':
      container.appendChild(renderEnvDiagram());
      break;
    case 'language':
      container.appendChild(renderLanguageDiagram());
      break;
    case 'lifecycle':
      container.appendChild(renderLifecycleDiagram());
      break;
    case 'ui':
      container.appendChild(renderUiDiagram());
      break;
    case 'state':
      container.appendChild(renderStateDiagram());
      break;
    case 'async':
      container.appendChild(renderAsyncDiagram());
      break;
    case 'storage':
      container.appendChild(renderStorageDiagram());
      break;
    case 'architecture':
      container.appendChild(renderArchitectureFlowDiagram());
      break;
    default:
      if (hintKey) {
        container.appendChild(renderUniversalDiagram(i18n.t(hintKey)));
      } else {
        container.style.display = 'none';
      }
      break;
  }

  return container;
}

/** Stage 1: Environment & Project Structure */
function renderEnvDiagram(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'diagram-split-grid';
  el.innerHTML = `
    <!-- Android Project Tree -->
    <div class="diagram-tree-card android-card">
      <div class="diagram-tree-header">
        <span class="diagram-platform-badge android">🤖 Android</span>
        <span class="diagram-tree-title">Gradle 多模块工程结构</span>
      </div>
      <div class="diagram-tree-body">
        <div class="tree-node root">📁 Root Project /</div>
        <div class="tree-children">
          <div class="tree-node config">⚙️ settings.gradle.kts <span class="tree-tag">模块索引</span></div>
          <div class="tree-node module">
            📁 app/ <span class="tree-tag">主 Application 模块</span>
            <div class="tree-sub-children">
              <div class="tree-node file">📜 build.gradle.kts <span class="tree-tag">依赖声明</span></div>
              <div class="tree-node file">📄 AndroidManifest.xml <span class="tree-tag">组件清单与权限</span></div>
              <div class="tree-node dir">📁 src/main/res/ <span class="tree-tag">资源 (drawable/values)</span></div>
              <div class="tree-node dir">📁 src/main/kotlin/ <span class="tree-tag">业务源码</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mapping Indicator -->
    <div class="diagram-mapping-divider">
      <div class="mapping-badge">⚡ 体系映射</div>
    </div>

    <!-- iOS Project Tree -->
    <div class="diagram-tree-card ios-card">
      <div class="diagram-tree-header">
        <span class="diagram-platform-badge ios">🍎 iOS</span>
        <span class="diagram-tree-title">Xcode Project / Workspace 结构</span>
      </div>
      <div class="diagram-tree-body">
        <div class="tree-node root">📁 Xcode Project (.xcodeproj / .xcworkspace)</div>
        <div class="tree-children">
          <div class="tree-node config">📦 Package.swift / SPM <span class="tree-tag">原生包依赖</span></div>
          <div class="tree-node module">
            🎯 App Target <span class="tree-tag">主 App 构建产物目标</span>
            <div class="tree-sub-children">
              <div class="tree-node file">🚀 @main App.swift <span class="tree-tag">程序声明入口</span></div>
              <div class="tree-node file">⚙️ Info.plist <span class="tree-tag">系统配置与权限描述</span></div>
              <div class="tree-node dir">🎨 Assets.xcassets <span class="tree-tag">自适应矢量图与色板</span></div>
              <div class="tree-node dir">📁 Preview Content/ <span class="tree-tag">SwiftUI 预览 Mock 数据</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  return el;
}

/** Stage 2: Language & Mental Models Matrix */
function renderLanguageDiagram(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'diagram-matrix-grid';
  el.innerHTML = `
    <!-- Card 1 -->
    <div class="matrix-card">
      <div class="matrix-card-title">📦 数据模型与内存语义</div>
      <div class="matrix-compare-row">
        <div class="matrix-platform android">
          <span class="p-badge">Kotlin</span>
          <code>data class User(...)</code>
          <span class="p-desc">引用语义（指针传递）</span>
        </div>
        <div class="matrix-vs">↔</div>
        <div class="matrix-platform ios">
          <span class="p-badge">Swift</span>
          <code>struct User(...)</code>
          <span class="p-desc">值语义（自动深拷贝 · 线程安全）</span>
        </div>
      </div>
    </div>

    <!-- Card 2 -->
    <div class="matrix-card">
      <div class="matrix-card-title">🧬 抽象与多态机制</div>
      <div class="matrix-compare-row">
        <div class="matrix-platform android">
          <span class="p-badge">Kotlin</span>
          <code>open class Base ➔ Child</code>
          <span class="p-desc">单根基类继承 (OOP)</span>
        </div>
        <div class="matrix-vs">↔</div>
        <div class="matrix-platform ios">
          <span class="p-badge">Swift</span>
          <code>protocol + extension</code>
          <span class="p-desc">面向协议组合扩展 (POP)</span>
        </div>
      </div>
    </div>

    <!-- Card 3 -->
    <div class="matrix-card">
      <div class="matrix-card-title">💎 状态机与枚举建模</div>
      <div class="matrix-compare-row">
        <div class="matrix-platform android">
          <span class="p-badge">Kotlin</span>
          <code>sealed class UiState</code>
          <span class="p-desc">密封类分层继承</span>
        </div>
        <div class="matrix-vs">↔</div>
        <div class="matrix-platform ios">
          <span class="p-badge">Swift</span>
          <code>enum UiState { case ... }</code>
          <span class="p-desc">带关联值枚举 (Associated Values)</span>
        </div>
      </div>
    </div>

    <!-- Card 4 -->
    <div class="matrix-card">
      <div class="matrix-card-title">♻️ 内存回收与闭包泄漏防范</div>
      <div class="matrix-compare-row">
        <div class="matrix-platform android">
          <span class="p-badge">Kotlin</span>
          <code>JVM GC</code>
          <span class="p-desc">垃圾收集器自动回收</span>
        </div>
        <div class="matrix-vs">↔</div>
        <div class="matrix-platform ios">
          <span class="p-badge">Swift</span>
          <code>ARC (引用计数)</code>
          <span class="p-desc">闭包须显式 <code>[weak self]</code></span>
        </div>
      </div>
    </div>
  `;
  return el;
}

/** Stage 3: Lifecycle Generational Dual Track */
function renderLifecycleDiagram(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'diagram-dual-generation';
  el.innerHTML = `
    <!-- Imperative Era -->
    <div class="generation-card imperative">
      <div class="generation-header">
        <span class="gen-badge classic">🏛️ 传统时代（命令式 UI）</span>
        <span class="gen-desc">生命周期重度依附于系统控制器</span>
      </div>
      <div class="track-row">
        <span class="track-tag android">🤖 Android</span>
        <div class="pipeline-track">
          <div class="pipe-node">Application</div>
          <div class="pipe-arrow">➔</div>
          <div class="pipe-node highlight">Activity</div>
          <div class="pipe-arrow">➔</div>
          <div class="pipe-node">Fragment</div>
          <div class="pipe-arrow">➔</div>
          <div class="pipe-node">View</div>
        </div>
      </div>
      <div class="track-row">
        <span class="track-tag ios">🍎 iOS</span>
        <div class="pipeline-track">
          <div class="pipe-node">UIApplication</div>
          <div class="pipe-arrow">➔</div>
          <div class="pipe-node highlight">UIWindow</div>
          <div class="pipe-arrow">➔</div>
          <div class="pipe-node">UIViewController</div>
          <div class="pipe-arrow">➔</div>
          <div class="pipe-node">UIView</div>
        </div>
      </div>
    </div>

    <!-- Declarative Era -->
    <div class="generation-card declarative">
      <div class="generation-header">
        <span class="gen-badge modern">⚡ 现代时代（声明式 UI）</span>
        <span class="gen-desc">UI 是状态的函数，生命周期极简解耦</span>
      </div>
      <div class="track-row">
        <span class="track-tag android">🤖 Android</span>
        <div class="pipeline-track">
          <div class="pipe-node">Single Activity</div>
          <div class="pipe-arrow">➔</div>
          <div class="pipe-node highlight">@Composable fun Screen()</div>
          <div class="pipe-arrow">➔</div>
          <div class="pipe-node">LaunchedEffect / onDispose</div>
        </div>
      </div>
      <div class="track-row">
        <span class="track-tag ios">🍎 iOS</span>
        <div class="pipeline-track">
          <div class="pipe-node">@main App</div>
          <div class="pipe-arrow">➔</div>
          <div class="pipe-node highlight">WindowGroup (Scene)</div>
          <div class="pipe-arrow">➔</div>
          <div class="pipe-node">SwiftUI View (.task / .onAppear)</div>
        </div>
      </div>
    </div>
  `;
  return el;
}

/** Stage 4: UI Layout & Modifier Pipeline */
function renderUiDiagram(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'diagram-ui-flow';
  el.innerHTML = `
    <!-- Layout Containers Matrix -->
    <div class="ui-dimension-grid">
      <div class="ui-box">
        <div class="ui-box-title">📐 一维线性布局</div>
        <div class="ui-box-body">
          <div class="ui-pair"><code>Column</code> ➔ <code>VStack</code> (纵向排列)</div>
          <div class="ui-pair"><code>Row</code> ➔ <code>HStack</code> (横向排列)</div>
        </div>
      </div>
      <div class="ui-box">
        <div class="ui-box-title">🗂️ 二维层叠与惰性列表</div>
        <div class="ui-box-body">
          <div class="ui-pair"><code>Box</code> ➔ <code>ZStack</code> (Z 轴深度层叠)</div>
          <div class="ui-pair"><code>LazyColumn</code> ➔ <code>List / LazyVStack</code> (复用流)</div>
        </div>
      </div>
    </div>

    <!-- Modifier Onion Model -->
    <div class="modifier-onion-card">
      <div class="modifier-onion-header">
        <span class="onion-title">⛓️ SwiftUI Modifier 逐层包装机制（洋葱模型）</span>
      </div>
      <div class="onion-flow">
        <div class="onion-step base">
          <span class="step-lbl">① 核心视图</span>
          <code>Text("Hello")</code>
        </div>
        <div class="onion-arrow">➔ .padding(16) ➔</div>
        <div class="onion-step layer1">
          <span class="step-lbl">② 包装边距层</span>
          <code>PaddingView</code>
        </div>
        <div class="onion-arrow">➔ .background(.blue) ➔</div>
        <div class="onion-step layer2">
          <span class="step-lbl">③ 包装背景层</span>
          <code>BackgroundView</code>
        </div>
        <div class="onion-arrow">➔ .cornerRadius(8) ➔</div>
        <div class="onion-step final">
          <span class="step-lbl">④ 最终呈现场景</span>
          <code>ClipShapeView</code>
        </div>
      </div>
    </div>
  `;
  return el;
}

/** Stage 5: State Flow */
function renderStateDiagram(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'diagram-flow-card';
  el.innerHTML = `
    <div class="flow-track-group">
      <div class="track-row">
        <span class="track-tag android">🤖 Android</span>
        <div class="pipeline-track">
          <div class="pipe-node">remember / mutableStateOf <span class="sub-lbl">视图私有</span></div>
          <div class="pipe-arrow">➔</div>
          <div class="pipe-node">StateFlow <span class="sub-lbl">流式状态</span></div>
          <div class="pipe-arrow">➔</div>
          <div class="pipe-node highlight">ViewModel <span class="sub-lbl">业务状态源</span></div>
          <div class="pipe-arrow">➔</div>
          <div class="pipe-node">collectAsState() <span class="sub-lbl">UI 消费</span></div>
        </div>
      </div>
      <div class="flow-track-divider"></div>
      <div class="track-row">
        <span class="track-tag ios">🍎 iOS</span>
        <div class="pipeline-track">
          <div class="pipe-node">@State / @Binding <span class="sub-lbl">私有与双向指针</span></div>
          <div class="pipe-arrow">➔</div>
          <div class="pipe-node">@Observable <span class="sub-lbl">宏驱动属性感知</span></div>
          <div class="pipe-arrow">➔</div>
          <div class="pipe-node highlight">@MainActor ViewModel <span class="sub-lbl">主线程容器</span></div>
          <div class="pipe-arrow">➔</div>
          <div class="pipe-node">@Environment <span class="sub-lbl">跨层环境注入</span></div>
        </div>
      </div>
    </div>
  `;
  return el;
}

/** Stage 7: Concurrency Pipeline */
function renderAsyncDiagram(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'diagram-flow-card';
  el.innerHTML = `
    <div class="flow-track-group">
      <div class="track-row">
        <span class="track-tag android">🤖 Android</span>
        <div class="pipeline-track">
          <div class="pipe-node">Thread <span class="sub-lbl">原生线程</span></div>
          <div class="pipe-arrow">➔</div>
          <div class="pipe-node">Coroutine <span class="sub-lbl">轻量协程</span></div>
          <div class="pipe-arrow">➔</div>
          <div class="pipe-node">Flow <span class="sub-lbl">冷数据流</span></div>
          <div class="pipe-arrow">➔</div>
          <div class="pipe-node">Channel <span class="sub-lbl">热管道</span></div>
          <div class="pipe-arrow">➔</div>
          <div class="pipe-node highlight">Mutex <span class="sub-lbl">互斥锁</span></div>
        </div>
      </div>
      <div class="flow-track-divider"></div>
      <div class="track-row">
        <span class="track-tag ios">🍎 iOS</span>
        <div class="pipeline-track">
          <div class="pipe-node">Thread <span class="sub-lbl">底层 GCD</span></div>
          <div class="pipe-arrow">➔</div>
          <div class="pipe-node">Task (async/await) <span class="sub-lbl">原生任务</span></div>
          <div class="pipe-arrow">➔</div>
          <div class="pipe-node">AsyncSequence <span class="sub-lbl">异步流序列</span></div>
          <div class="pipe-arrow">➔</div>
          <div class="pipe-node">AsyncStream <span class="sub-lbl">生产消费管道</span></div>
          <div class="pipe-arrow">➔</div>
          <div class="pipe-node highlight">actor <span class="sub-lbl">编译器线程隔离</span></div>
        </div>
      </div>
    </div>
  `;
  return el;
}

/** Stage 9: Storage Hierarchy */
function renderStorageDiagram(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'diagram-matrix-grid';
  el.innerHTML = `
    <div class="matrix-card">
      <div class="matrix-card-title">🟢 场景 1：轻量键值与偏好设置</div>
      <div class="matrix-compare-row">
        <div class="matrix-platform android">
          <span class="p-badge">Android</span>
          <code>SharedPreferences / DataStore</code>
          <span class="p-desc">XML / Proto 磁盘序列化</span>
        </div>
        <div class="matrix-vs">↔</div>
        <div class="matrix-platform ios">
          <span class="p-badge">iOS</span>
          <code>UserDefaults / @AppStorage</code>
          <span class="p-desc">plist 偏好持久化</span>
        </div>
      </div>
    </div>

    <div class="matrix-card">
      <div class="matrix-card-title">🔐 场景 2：敏感凭据与 Token（硬件加密）</div>
      <div class="matrix-compare-row">
        <div class="matrix-platform android">
          <span class="p-badge">Android</span>
          <code>EncryptedPrefs / AndroidKeyStore</code>
          <span class="p-desc">硬件安全芯片 TEE 隔离</span>
        </div>
        <div class="matrix-vs">↔</div>
        <div class="matrix-platform ios">
          <span class="p-badge">iOS</span>
          <code>Keychain Services</code>
          <span class="p-desc">Secure Enclave 硬件加密</span>
        </div>
      </div>
    </div>

    <div class="matrix-card" style="grid-column: 1 / -1;">
      <div class="matrix-card-title">🗄️ 场景 3：结构化数据与关系型数据库</div>
      <div class="matrix-compare-row">
        <div class="matrix-platform android">
          <span class="p-badge">Android</span>
          <code>Room (SQLite ORM)</code>
          <span class="p-desc">注解驱动 + Flow 响应式查询</span>
        </div>
        <div class="matrix-vs">↔</div>
        <div class="matrix-platform ios">
          <span class="p-badge">iOS</span>
          <code>SwiftData / GRDB</code>
          <span class="p-desc">iOS 17+ Swift 宏声明式 ORM / SQLite</span>
        </div>
      </div>
    </div>
  `;
  return el;
}

/** Stage 10: Full MVVM + Repository Architecture Flow */
function renderArchitectureFlowDiagram(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'diagram-arch-vertical';
  el.innerHTML = `
    <!-- UI Layer -->
    <div class="arch-layer ui-layer">
      <div class="layer-tag">🖥️ 视图层 (View Layer)</div>
      <div class="layer-boxes">
        <div class="arch-box android">🤖 Compose @Composable View</div>
        <div class="arch-box ios">🍎 SwiftUI struct View</div>
      </div>
    </div>

    <div class="arch-flow-connector">
      <span class="connector-line"></span>
      <span class="connector-label">⬇️ 用户操作意图 (User Action / Intent)</span>
      <span class="connector-line"></span>
    </div>

    <!-- ViewModel Layer -->
    <div class="arch-layer vm-layer">
      <div class="layer-tag">🧠 状态与业务层 (ViewModel Layer)</div>
      <div class="layer-boxes">
        <div class="arch-box android">Android ViewModel + StateFlow</div>
        <div class="arch-box ios">@Observable @MainActor class ViewModel</div>
      </div>
    </div>

    <div class="arch-flow-connector">
      <span class="connector-line"></span>
      <span class="connector-label">⬇️ 调用挂起接口 (suspend / async)</span>
      <span class="connector-line"></span>
    </div>

    <!-- Repository Layer -->
    <div class="arch-layer repo-layer">
      <div class="layer-tag">🏛️ 数据仓储层 (Repository Layer)</div>
      <div class="layer-box-single">
        <strong>Repository 抽象接口 (Protocol / Interface)</strong>
        <span class="sub-text">单向数据源仲裁 · 内存与本地缓存策略 · 业务数据清洗</span>
      </div>
    </div>

    <div class="arch-flow-connector">
      <span class="connector-line"></span>
      <span class="connector-label">⬇️ 分发到数据源 (Dispatch)</span>
      <span class="connector-line"></span>
    </div>

    <!-- DataSource Layer -->
    <div class="arch-layer ds-layer">
      <div class="layer-tag">💾 数据源层 (Data Sources)</div>
      <div class="layer-boxes">
        <div class="arch-box">
          <strong>🌐 远端网络 (Remote)</strong>
          <span>Retrofit ↔ URLSession</span>
        </div>
        <div class="arch-box">
          <strong>💿 本地存储 (Local)</strong>
          <span>Room ↔ SwiftData / Keychain</span>
        </div>
      </div>
    </div>
  `;
  return el;
}

/** Universal Fallback Diagram for stages with custom text hints */
function renderUniversalDiagram(text: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'diagram-universal';

  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  lines.forEach((line) => {
    const row = document.createElement('div');
    row.className = 'universal-line-row';

    if (line.includes('➔') || line.includes('→')) {
      const parts = line.split(/[➔→]/).map((p) => p.trim());
      const pipeline = document.createElement('div');
      pipeline.className = 'pipeline-track';
      parts.forEach((p, idx) => {
        const node = document.createElement('div');
        node.className = 'pipe-node';
        node.textContent = p;
        pipeline.appendChild(node);
        if (idx < parts.length - 1) {
          const arrow = document.createElement('div');
          arrow.className = 'pipe-arrow';
          arrow.textContent = '➔';
          pipeline.appendChild(arrow);
        }
      });
      row.appendChild(pipeline);
    } else {
      row.innerHTML = `<span class="universal-raw-text">${line}</span>`;
    }
    el.appendChild(row);
  });

  return el;
}
