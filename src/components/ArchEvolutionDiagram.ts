/**
 * ArchEvolutionDiagram Component
 *
 * 渲染四代移动端架构演进数据流对比图（MVC → MVP → MVVM → MVI）。
 * 遵循 Vanilla CSS 与响应式设计规范，使用柔和素雅的低饱和浅色区分各代架构拓扑。
 */

export function renderArchEvolutionDiagram(): string {
  // SVG arrow helpers with crisp coordinates
  const downArrow = `
    <div class="arch-arrow-block">
      <svg class="arch-svg-arrow" viewBox="0 0 24 24" width="16" height="20">
        <line x1="12" y1="2" x2="12" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <polyline points="7,13 12,19 17,13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  `;

  return `
    <div class="arch-evo-container">

      <!-- Legend -->
      <div class="arch-evo-legend">
        <div class="arch-evo-legend-item">
          <span class="arch-evo-dot dot-mvc"></span><span>第一代 MVC：命令式直调 / 双向强耦合</span>
        </div>
        <div class="arch-evo-legend-item">
          <span class="arch-evo-dot dot-mvp"></span><span>第二代 MVP：接口契约解耦 / 双向生命周期绑定</span>
        </div>
        <div class="arch-evo-legend-item">
          <span class="arch-evo-dot dot-mvvm"></span><span>第三代 MVVM：单向调用 + 多流观察（易时序竞争）</span>
        </div>
        <div class="arch-evo-legend-item">
          <span class="arch-evo-dot dot-mvi"></span><span>第四代 MVI / UDF：单一意图输入 ➔ 单一不可变状态闭环</span>
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

              ${downArrow}

              <!-- View + Controller (coupled) -->
              <div class="arch-node node-mvc-view">
                <div class="arch-node-label">View (界面渲染)</div>
                <div class="arch-node-coupled-badge">强耦合于 Activity</div>
                <div class="arch-node-label node-mvc-ctrl">Controller (控制逻辑)</div>
                <div class="arch-node-caption">同一类内兼任，职责混乱</div>
              </div>

              <!-- View/Controller <-> Model (Dual arrows) -->
              <div class="arch-dual-channel">
                <div class="arch-channel-track track-left">
                  <span class="channel-label">① 查询/变更数据</span>
                  <svg class="arch-svg-arrow" viewBox="0 0 24 24" width="14" height="18">
                    <line x1="12" y1="2" x2="12" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <polyline points="7,13 12,19 17,13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="arch-channel-divider"></div>
                <div class="arch-channel-track track-right">
                  <svg class="arch-svg-arrow" viewBox="0 0 24 24" width="14" height="18">
                    <line x1="12" y1="22" x2="12" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <polyline points="7,11 12,5 17,11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span class="channel-label">② 数据回调/反向更新</span>
                </div>
              </div>

              <!-- Model -->
              <div class="arch-node node-model">
                <div class="arch-node-label">Model (数据模型)</div>
                <div class="arch-node-caption">POJO / 本地数据库 / 网络</div>
              </div>
            </div>

            <div class="arch-gen-pain">上帝类膨胀 · 极难编写纯 JVM 单测</div>
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
                <div class="arch-node-caption">Activity / Fragment (实现 IView)</div>
              </div>

              <!-- View <-> Presenter interface contract -->
              <div class="arch-dual-channel">
                <div class="arch-channel-track track-left">
                  <span class="channel-label">① 调用 Presenter 业务</span>
                  <svg class="arch-svg-arrow" viewBox="0 0 24 24" width="14" height="18">
                    <line x1="12" y1="2" x2="12" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <polyline points="7,13 12,19 17,13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="arch-channel-divider"></div>
                <div class="arch-channel-track track-right">
                  <svg class="arch-svg-arrow" viewBox="0 0 24 24" width="14" height="18">
                    <line x1="12" y1="22" x2="12" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <polyline points="7,11 12,5 17,11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span class="channel-label">② IView 接口反向回调</span>
                </div>
              </div>

              <!-- Presenter -->
              <div class="arch-node node-mvp-presenter">
                <div class="arch-node-label">Presenter</div>
                <div class="arch-node-caption">纯 Java/Kotlin · 持有 IView 接口</div>
              </div>

              ${downArrow}

              <!-- Model -->
              <div class="arch-node node-model">
                <div class="arch-node-label">Model (数据层)</div>
                <div class="arch-node-caption">数据仓储 / 网络 / 缓存</div>
              </div>
            </div>

            <div class="arch-gen-pain">契约接口爆炸 · 易内存泄漏 / NPE 闪退</div>
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
                <div class="arch-node-caption">Compose / XML (不持有 VM 引用)</div>
              </div>

              <!-- Dual channel: Down (Call function) vs Up (Observe multiple flows) -->
              <div class="arch-dual-channel channel-mvvm">
                <div class="arch-channel-track track-left">
                  <span class="channel-label">① 调用 vm.func()</span>
                  <svg class="arch-svg-arrow" viewBox="0 0 24 24" width="14" height="18">
                    <line x1="12" y1="2" x2="12" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <polyline points="7,13 12,19 17,13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="arch-channel-divider"></div>
                <div class="arch-channel-track track-right channel-warn">
                  <svg class="arch-svg-arrow" viewBox="0 0 24 24" width="14" height="18">
                    <line x1="12" y1="22" x2="12" y2="6" stroke="currentColor" stroke-width="2" stroke-dasharray="3 2" stroke-linecap="round"/>
                    <polyline points="7,11 12,5 17,11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span class="channel-label">② 观察多分散流 (竞争)</span>
                </div>
              </div>

              <!-- ViewModel -->
              <div class="arch-node node-mvvm-vm">
                <div class="arch-node-label">ViewModel</div>
                <div class="arch-node-chips">
                  <span class="vm-chip">StateFlow&lt;User&gt;</span>
                  <span class="vm-chip">StateFlow&lt;Feed&gt;</span>
                  <span class="vm-chip vm-chip-warn">StateFlow&lt;UI&gt;...</span>
                </div>
                <div class="arch-node-caption">状态分散管理 · 无单一真理源</div>
              </div>

              ${downArrow}

              <!-- Repository -->
              <div class="arch-node node-model">
                <div class="arch-node-label">Repository (仓储层)</div>
                <div class="arch-node-caption">领域用例 / 数据接口</div>
              </div>
            </div>

            <div class="arch-gen-pain">多流并发易撕裂 · 缺乏全局因果追溯</div>
          </div>
        </div>

        <!-- Gen 4: MVI -->
        <div class="arch-gen-card gen-mvi">
          <div class="arch-gen-header">
            <span class="arch-gen-badge badge-mvi">第四代</span>
            <span class="arch-gen-name">MVI / UDF</span>
            <span class="arch-gen-sub">单向数据流 · 不可变闭环</span>
          </div>
          <div class="arch-gen-body">
            <div class="arch-flow-col">
              <!-- View -->
              <div class="arch-node node-mvi-view">
                <div class="arch-node-label">View (Compose / SwiftUI)</div>
                <div class="arch-node-caption">纯函数渲染：UI = f(UiState)</div>
              </div>

              <!-- Dual channel: Down (dispatch Intent) vs Up (collect immutable UiState) -->
              <div class="arch-dual-channel channel-mvi">
                <div class="arch-channel-track track-left channel-mvi-track">
                  <span class="channel-label">① dispatch(Intent)</span>
                  <svg class="arch-svg-arrow" viewBox="0 0 24 24" width="14" height="18">
                    <line x1="12" y1="2" x2="12" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <polyline points="7,13 12,19 17,13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="arch-channel-divider"></div>
                <div class="arch-channel-track track-right channel-mvi-track">
                  <svg class="arch-svg-arrow" viewBox="0 0 24 24" width="14" height="18">
                    <line x1="12" y1="22" x2="12" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <polyline points="7,11 12,5 17,11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span class="channel-label">② 单向原子状态 StateFlow</span>
                </div>
              </div>

              <!-- ViewModel State Machine -->
              <div class="arch-node node-mvi-vm">
                <div class="arch-node-label">ViewModel (业务状态机)</div>
                <div class="arch-node-chips">
                  <span class="vm-chip chip-mvi">StateFlow&lt;UiState&gt;</span>
                  <span class="vm-chip chip-effect">Channel&lt;UiEffect&gt;</span>
                </div>
                <div class="arch-node-caption">不可变 copy() · 原子 CAS 更新</div>
              </div>

              ${downArrow}

              <!-- Repository -->
              <div class="arch-node node-model">
                <div class="arch-node-label">Repository (领域层)</div>
                <div class="arch-node-caption">领域模型 / 挂起数据流</div>
              </div>
            </div>

            <div class="arch-gen-gain">原子一致 · 确定性高 · 完美可测可回溯</div>
          </div>
        </div>

      </div><!-- end grid -->
    </div><!-- end container -->
  `;
}
