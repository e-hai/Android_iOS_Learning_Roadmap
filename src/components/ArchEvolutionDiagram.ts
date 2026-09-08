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
                <span class="arch-node-label">用户操作</span>
              </div>
              <!-- Down arrow: User → View/Controller -->
              <div class="arch-arrow-block">
                <svg class="arch-svg-arrow" viewBox="0 0 24 28" width="14" height="18"><line x1="12" y1="0" x2="12" y2="22" stroke="currentColor" stroke-width="2"/><polyline points="6,16 12,24 18,16" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
              </div>
              <!-- View + Controller (coupled) -->
              <div class="arch-node node-mvc-view">
                <div class="arch-node-label">View</div>
                <div class="arch-node-coupled-badge">强耦合</div>
                <div class="arch-node-label node-mvc-ctrl">Controller</div>
                <div class="arch-node-caption">Activity / Fragment 兼任</div>
              </div>
              <!-- Bidirectional arrow: View/Controller ↔ Model -->
              <div class="arch-arrow-block">
                <svg class="arch-svg-arrow" viewBox="0 0 24 28" width="14" height="18"><line x1="12" y1="4" x2="12" y2="24" stroke="currentColor" stroke-width="2"/><polyline points="6,8 12,0 18,8" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><polyline points="6,20 12,28 18,20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
                <span class="arch-arrow-label">双向引用</span>
              </div>
              <!-- Model -->
              <div class="arch-node node-model">
                <div class="arch-node-label">Model</div>
                <div class="arch-node-caption">数据层</div>
              </div>
            </div>
            <div class="arch-gen-pain">上帝类膨胀 · 极难单测</div>
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
              <!-- Bidirectional arrow: View ↔ Presenter -->
              <div class="arch-arrow-block">
                <svg class="arch-svg-arrow" viewBox="0 0 24 28" width="14" height="18"><line x1="12" y1="4" x2="12" y2="24" stroke="currentColor" stroke-width="2"/><polyline points="6,8 12,0 18,8" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><polyline points="6,20 12,28 18,20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
                <span class="arch-arrow-label">IView 接口契约（双向）</span>
              </div>
              <!-- Presenter -->
              <div class="arch-node node-mvp-presenter">
                <div class="arch-node-label">Presenter</div>
                <div class="arch-node-caption">纯 Kotlin 类 · 可单测</div>
              </div>
              <!-- Down arrow: Presenter → Model -->
              <div class="arch-arrow-block">
                <svg class="arch-svg-arrow" viewBox="0 0 24 28" width="14" height="18"><line x1="12" y1="0" x2="12" y2="22" stroke="currentColor" stroke-width="2"/><polyline points="6,16 12,24 18,16" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
              </div>
              <!-- Model -->
              <div class="arch-node node-model">
                <div class="arch-node-label">Model</div>
                <div class="arch-node-caption">数据层</div>
              </div>
            </div>
            <div class="arch-gen-pain">接口爆炸 · 生命周期泄漏</div>
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
              <!-- View → ViewModel: oneway call -->
              <div class="arch-arrow-block arch-arrow-right-label">
                <svg class="arch-svg-arrow" viewBox="0 0 24 28" width="14" height="18"><line x1="12" y1="0" x2="12" y2="22" stroke="currentColor" stroke-width="2"/><polyline points="6,16 12,24 18,16" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
                <span class="arch-arrow-label">调用方法</span>
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
              <!-- ViewModel → View: observe (dashed, upward) -->
              <div class="arch-arrow-block arch-arrow-observe-block">
                <svg class="arch-svg-arrow" viewBox="0 0 24 28" width="14" height="18"><line x1="12" y1="4" x2="12" y2="28" stroke="currentColor" stroke-width="2" stroke-dasharray="3 2"/><polyline points="6,8 12,0 18,8" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
                <span class="arch-arrow-label arch-observe-label">观察 StateFlow（易竞争）</span>
              </div>
              <!-- Repository -->
              <div class="arch-node node-model">
                <div class="arch-node-label">Repository</div>
                <div class="arch-node-caption">数据层</div>
              </div>
            </div>
            <div class="arch-gen-pain">多流竞争 · 状态撕裂</div>
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
                <div class="arch-node-caption">UI = f(UiState)</div>
              </div>
              <!-- View → ViewModel: dispatch Intent (downward) -->
              <div class="arch-arrow-block arch-arrow-mvi">
                <svg class="arch-svg-arrow" viewBox="0 0 24 28" width="14" height="18"><line x1="12" y1="0" x2="12" y2="22" stroke="currentColor" stroke-width="2"/><polyline points="6,16 12,24 18,16" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
                <span class="arch-arrow-label mvi-label">① dispatch(UiIntent)</span>
              </div>
              <!-- ViewModel State Machine -->
              <div class="arch-node node-mvi-vm">
                <div class="arch-node-label">ViewModel 状态机</div>
                <div class="arch-node-chips">
                  <span class="vm-chip chip-mvi">StateFlow&lt;UiState&gt;</span>
                  <span class="vm-chip chip-effect">Channel&lt;UiEffect&gt;</span>
                </div>
                <div class="arch-node-caption">不可变 copy() · 原子 CAS</div>
              </div>
              <!-- ViewModel → View: push UiState (upward) -->
              <div class="arch-arrow-block arch-arrow-mvi arch-arrow-upward">
                <svg class="arch-svg-arrow" viewBox="0 0 24 28" width="14" height="18"><line x1="12" y1="4" x2="12" y2="28" stroke="currentColor" stroke-width="2"/><polyline points="6,8 12,0 18,8" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
                <span class="arch-arrow-label mvi-label">② 单向推送 UiState</span>
              </div>
            </div>
            <div class="arch-gen-gain">原子一致 · 可回溯 · 单测极佳</div>
          </div>
        </div>

      </div><!-- end grid -->
    </div><!-- end container -->
  `;
}
