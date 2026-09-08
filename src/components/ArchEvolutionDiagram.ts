/**
 * ArchEvolutionDiagram Component
 *
 * 渲染四代移动端架构演进数据流对比图（MVC → MVP → MVVM → MVI）。
 * 遵循 Vanilla CSS 与响应式设计规范，使用柔和素雅的低饱和浅色区分各代架构拓扑。
 */

export function renderArchEvolutionDiagram(): string {
  return `
    <div class="arch-evo-container">

      <!-- Legend -->
      <div class="arch-evo-legend">
        <div class="arch-evo-legend-item">
          <span class="arch-evo-dot dot-mvc"></span><span>MVC — 命令式 / 强耦合</span>
        </div>
        <div class="arch-evo-legend-item">
          <span class="arch-evo-dot dot-mvp"></span><span>MVP — 接口解耦</span>
        </div>
        <div class="arch-evo-legend-item">
          <span class="arch-evo-dot dot-mvvm"></span><span>MVVM — 响应式数据流</span>
        </div>
        <div class="arch-evo-legend-item">
          <span class="arch-evo-dot dot-mvi"></span><span>MVI/UDF — 单向不可变状态</span>
        </div>
      </div>

      <!-- Four Generation Grid -->
      <div class="arch-evo-grid">

        <!-- Gen 1: MVC -->
        <div class="arch-gen-card gen-mvc">
          <div class="arch-gen-header">
            <span class="arch-gen-badge badge-mvc">第一代</span>
            <span class="arch-gen-name">MVC</span>
            <span class="arch-gen-sub">Model · View · Controller</span>
          </div>
          <div class="arch-gen-body">
            <div class="arch-flow-col">
              <!-- User -->
              <div class="arch-node node-user">
                <span class="arch-node-icon">👤</span>
                <span>用户操作</span>
              </div>
              <div class="arch-arrow arrow-down">▼</div>
              <!-- View+Controller (coupled) -->
              <div class="arch-node node-mvc-view">
                <div class="arch-node-label">View</div>
                <div class="arch-node-coupled-badge">强耦合</div>
                <div class="arch-node-label node-mvc-ctrl">Controller</div>
                <div class="arch-node-caption">Activity / Fragment 兼任</div>
              </div>
              <div class="arch-arrow-double">
                <span class="arrow-left-right">◀──────▶</span>
                <span class="arch-arrow-label">双向直接引用</span>
              </div>
              <!-- Model -->
              <div class="arch-node node-model">
                <div class="arch-node-label">Model</div>
                <div class="arch-node-caption">数据层</div>
              </div>
            </div>
            <div class="arch-gen-pain">
              <span class="pain-icon">⚠️</span>
              <span>上帝类膨胀 · 极难单测</span>
            </div>
          </div>
        </div>

        <!-- Gen 2: MVP -->
        <div class="arch-gen-card gen-mvp">
          <div class="arch-gen-header">
            <span class="arch-gen-badge badge-mvp">第二代</span>
            <span class="arch-gen-name">MVP</span>
            <span class="arch-gen-sub">Model · View · Presenter</span>
          </div>
          <div class="arch-gen-body">
            <div class="arch-flow-col">
              <!-- View -->
              <div class="arch-node node-mvp-view">
                <div class="arch-node-label">View</div>
                <div class="arch-node-caption">Activity / Fragment</div>
              </div>
              <div class="arch-arrow-double">
                <span class="arrow-left-right">◀──────▶</span>
                <span class="arch-arrow-label">IView 接口契约（双向）</span>
              </div>
              <!-- Presenter -->
              <div class="arch-node node-mvp-presenter">
                <div class="arch-node-label">Presenter</div>
                <div class="arch-node-caption">纯 Kotlin 类 · 可单测</div>
              </div>
              <div class="arch-arrow arrow-down">▼</div>
              <!-- Model -->
              <div class="arch-node node-model">
                <div class="arch-node-label">Model</div>
                <div class="arch-node-caption">数据层</div>
              </div>
            </div>
            <div class="arch-gen-pain">
              <span class="pain-icon">⚠️</span>
              <span>接口爆炸 · 生命周期泄漏</span>
            </div>
          </div>
        </div>

        <!-- Gen 3: MVVM -->
        <div class="arch-gen-card gen-mvvm">
          <div class="arch-gen-header">
            <span class="arch-gen-badge badge-mvvm">第三代</span>
            <span class="arch-gen-name">MVVM</span>
            <span class="arch-gen-sub">Model · View · ViewModel</span>
          </div>
          <div class="arch-gen-body">
            <div class="arch-flow-col">
              <!-- View -->
              <div class="arch-node node-mvvm-view">
                <div class="arch-node-label">View</div>
                <div class="arch-node-caption">Compose / XML</div>
              </div>
              <div class="arch-arrow-row">
                <div class="arch-arrow-oneway">
                  <span class="arrow-right">──────▶</span>
                  <span class="arch-arrow-label">调用方法</span>
                </div>
                <div class="arch-arrow-observe">
                  <span class="arrow-left">◀ ─ ─ ─</span>
                  <span class="arch-arrow-label arch-observe-label">观察多个 StateFlow（易竞争）</span>
                </div>
              </div>
              <!-- ViewModel -->
              <div class="arch-node node-mvvm-vm">
                <div class="arch-node-label">ViewModel</div>
                <div class="arch-node-chips">
                  <span class="vm-chip">StateFlow A</span>
                  <span class="vm-chip">StateFlow B</span>
                  <span class="vm-chip vm-chip-warn">StateFlow C …</span>
                </div>
              </div>
              <div class="arch-arrow arrow-down">▼</div>
              <!-- Repository -->
              <div class="arch-node node-model">
                <div class="arch-node-label">Repository</div>
                <div class="arch-node-caption">数据层</div>
              </div>
            </div>
            <div class="arch-gen-pain">
              <span class="pain-icon">⚠️</span>
              <span>多流竞争 · 状态中间撕裂态</span>
            </div>
          </div>
        </div>

        <!-- Gen 4: MVI -->
        <div class="arch-gen-card gen-mvi">
          <div class="arch-gen-header">
            <span class="arch-gen-badge badge-mvi">第四代</span>
            <span class="arch-gen-name">MVI / UDF</span>
            <span class="arch-gen-sub">单向不可变状态闭环</span>
          </div>
          <div class="arch-gen-body">
            <div class="arch-flow-col">
              <!-- View -->
              <div class="arch-node node-mvi-view">
                <div class="arch-node-label">View (Compose)</div>
                <div class="arch-node-caption">UI = f(UiState) 纯函数渲染</div>
              </div>
              <div class="arch-arrow-oneway-mvi">
                <span class="arrow-right mvi-arrow-color">──────▶</span>
                <span class="arch-arrow-label mvi-label">① dispatch(UiIntent) 唯一入口</span>
              </div>
              <!-- ViewModel State Machine -->
              <div class="arch-node node-mvi-vm">
                <div class="arch-node-label">ViewModel 状态机</div>
                <div class="arch-node-chips">
                  <span class="vm-chip chip-mvi">StateFlow&lt;UiState&gt;</span>
                  <span class="vm-chip chip-effect">Channel&lt;UiEffect&gt;</span>
                </div>
                <div class="arch-node-caption">不可变 copy() · 原子 CAS 更新</div>
              </div>
              <div class="arch-arrow-oneway-mvi arch-arrow-left-side">
                <span class="arrow-left mvi-arrow-color">◀──────</span>
                <span class="arch-arrow-label mvi-label">② 单向推送全量不可变 UiState</span>
              </div>
            </div>
            <div class="arch-gen-gain">
              <span class="gain-icon">✅</span>
              <span>原子一致 · 可回溯 · 单测极佳</span>
            </div>
          </div>
        </div>

      </div><!-- end grid -->
    </div><!-- end container -->
  `;
}
