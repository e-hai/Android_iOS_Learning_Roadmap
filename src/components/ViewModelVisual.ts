/**
 * ViewModel Visual Component
 * 
 * 渲染 ViewModel 跨配置变更存活、进程被杀恢复与树状导航作用域的高保真原生图解组件。
 * 遵循 Vanilla CSS 与响应式设计规范，使用柔和素雅的低饱和浅色区分拓扑。
 */

export function renderViewModelVisual(asciiFallback?: string): string {
  return `
    <div class="vm-visual-container" id="vm-visual-card">
      
      <!-- Part 1: Configuration Change Sequence Flow -->
      <div class="vm-visual-card-wrapper">
        <div class="vm-card-header">
          <div class="vm-badge-row">
            <span class="vm-badge vm-badge-blue">核心时序图解</span>
            <span class="vm-badge-text">NonConfigurationInstances 零拷贝复用链路</span>
          </div>
          <h4 class="vm-card-title">跨配置变更存活机制（屏幕旋转时 ViewModel 如何活下来）</h4>
          <p class="vm-card-subtitle">Activity 实例虽被销毁重建，但宿主 ActivityClientRecord 内存驻留，实现底层零拷贝复用。</p>
        </div>

        <div class="vm-flow-canvas">
          <!-- Trigger -->
          <div class="vm-trigger-pill">
            <span class="vm-pulse-dot"></span>
            <span>触发源：屏幕旋转 / 深色模式 / 系统语言等配置变更</span>
          </div>
          <div class="vm-v-line line-blue"></div>

          <!-- Step 1: Old Activity Destroy -->
          <div class="vm-node-box node-step">
            <div class="vm-node-header">
              <span class="vm-step-num">1</span>
              <span class="vm-step-title">旧 Activity 实例销毁阶段 (onDestroy)</span>
            </div>
            <p class="vm-step-desc">系统标记当前为配置变更引发的销毁，触发核心转交回调：</p>
            <div class="vm-code-tag">onRetainNonConfigurationInstance() ➔ 提取当前 ViewModelStore</div>
          </div>
          <div class="vm-v-arrow arrow-blue"></div>

          <!-- Step 2: ActivityClientRecord (Highlight Center) -->
          <div class="vm-node-box node-highlight-blue">
            <div class="vm-node-header">
              <span class="vm-step-num num-blue">2</span>
              <div class="vm-highlight-title-wrap">
                <span class="vm-step-title text-blue">宿主进程常驻中转站 (ActivityThread 内存驻留)</span>
                <span class="vm-tag-pill pill-blue">进程未死 · JVM 堆内存完好</span>
              </div>
            </div>
            <div class="vm-memory-box">
              <div class="vm-mem-name">ActivityClientRecord.lastNonConfigurationInstances</div>
              <div class="vm-mem-contain">
                └── 持有: <strong>ViewModelStore</strong> (内部封装为 <code>HashMap&lt;String, ViewModel&gt;</code>)
              </div>
            </div>
            <p class="vm-step-desc mt-2">
              ⚡ <strong>关键本质</strong>：Activity 实例被回收，但应用进程持续运行，包含 ViewModel 实例及 <code>viewModelScope</code> 协程栈的堆内存指针稳稳保留在此处！
            </p>
          </div>
          <div class="vm-v-arrow arrow-blue"></div>

          <!-- Step 3: New Activity Recreate -->
          <div class="vm-node-box node-step">
            <div class="vm-node-header">
              <span class="vm-step-num">3</span>
              <span class="vm-step-title">新 Activity 实例恢复阶段 (onCreate)</span>
            </div>
            <p class="vm-step-desc">新实例创建后，从宿主记录中零拷贝无感取回旧 Store：</p>
            <div class="vm-code-tag">getLastNonConfigurationInstance() ➔ 取回原 ViewModelStore</div>
          </div>
          <div class="vm-v-line line-muted"></div>

          <!-- Step 4: Two Life Cycle Branches -->
          <div class="vm-branches-grid">
            <div class="vm-branch-card branch-loop">
              <div class="vm-branch-tag text-emerald">🔄 再次屏幕旋转</div>
              <div class="vm-branch-title">循环复用步骤 1 ~ 3</div>
              <p class="vm-branch-desc">无论旋转多少次，ViewModel 始终是同一个内存实例，网络请求与数据流无需重复触发。</p>
            </div>
            <div class="vm-branch-card branch-exit">
              <div class="vm-branch-tag text-rose">🛑 用户主动退出 / finish()</div>
              <div class="vm-branch-title">触发真正的销毁清理</div>
              <p class="vm-branch-desc">调用 <code>viewModelStore.clear()</code> ➔ 触发 <code>viewModel.onCleared()</code> ➔ 自动取消所有 <code>viewModelScope</code> 协程任务。</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Part 2: LMK vs Config Change Dual-Track Contrast -->
      <div class="vm-visual-card-wrapper mt-4">
        <div class="vm-card-header">
          <div class="vm-badge-row">
            <span class="vm-badge vm-badge-amber">双轨对比图解</span>
            <span class="vm-badge-text">进程被杀 vs 屏幕旋转的本质鸿沟</span>
          </div>
          <h4 class="vm-card-title">系统进程被杀（LMK）vs 屏幕旋转恢复全景对比</h4>
          <p class="vm-card-subtitle">理清“堆内存指针复用”与“系统跨进程 Bundle 序列化持久化”的不同边界与选型依据。</p>
        </div>

        <div class="vm-dual-track-grid">
          <!-- Left Track: Config Change -->
          <div class="vm-track-box track-left">
            <div class="vm-track-header header-emerald">
              <span class="vm-track-title">场景 A：屏幕旋转 / 配置变更</span>
              <span class="vm-track-status status-emerald">进程存活 · 堆内存完整</span>
            </div>

            <div class="vm-track-item">
              <span class="vm-track-label">数据存活载体</span>
              <div class="vm-track-val"><strong>ViewModelStore</strong> (普通内存堆引用)</div>
            </div>

            <div class="vm-track-item">
              <span class="vm-track-label">底层恢复机制</span>
              <div class="vm-track-val">通过 <code>NonConfigurationInstances</code> 传递指针</div>
            </div>

            <div class="vm-track-item">
              <span class="vm-track-label">性能与承载力</span>
              <div class="vm-track-val text-emerald"><strong>零拷贝微秒级</strong> · 支持大列表、复杂数据流、进行中协程</div>
            </div>

            <div class="vm-track-item last-item">
              <span class="vm-track-label">推荐承载数据</span>
              <p class="vm-track-desc">页面列表数据、网络加载状态、异步任务管理</p>
            </div>
          </div>

          <!-- Right Track: LMK Process Death -->
          <div class="vm-track-box track-right">
            <div class="vm-track-header header-amber">
              <span class="vm-track-title">场景 B：后台低内存被杀 (LMK)</span>
              <span class="vm-track-status status-amber">进程消亡 · 堆内存全清</span>
            </div>

            <div class="vm-track-item">
              <span class="vm-track-label">数据存活载体</span>
              <div class="vm-track-val"><strong>SavedStateHandle</strong> (跨进程 Bundle 快照)</div>
            </div>

            <div class="vm-track-item">
              <span class="vm-track-label">底层恢复机制</span>
              <div class="vm-track-val">系统 <code>onSaveInstanceState(Bundle)</code> 托管</div>
            </div>

            <div class="vm-track-item">
              <span class="vm-track-label">性能与承载力</span>
              <div class="vm-track-val text-amber"><strong>序列化毫秒级</strong> · 建议 &lt; 500KB (防 Binder 事务过大崩溃)</div>
            </div>

            <div class="vm-track-item last-item">
              <span class="vm-track-label">推荐承载数据</span>
              <p class="vm-track-desc">搜索关键词、用户草稿、选中 Tab ID、当前翻页索引</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Part 3: Navigation Tree Scope Hierarchy -->
      <div class="vm-visual-card-wrapper mt-4">
        <div class="vm-card-header">
          <div class="vm-badge-row">
            <span class="vm-badge vm-badge-purple">作用域层级图解</span>
            <span class="vm-badge-text">现代 Compose / Navigation 树状作用域</span>
          </div>
          <h4 class="vm-card-title">单 Activity 多页面架构下的树状生命周期拓扑</h4>
          <p class="vm-card-subtitle">从宿主根级 Store 到局部页面 Store，实现出栈即销毁的严格防泄漏模型。</p>
        </div>

        <div class="vm-tree-canvas">
          <!-- Root: Host Activity -->
          <div class="vm-tree-node node-root">
            <div class="vm-tree-node-head">
              <span class="vm-tree-badge badge-blue">根作用域 (Activity Scope)</span>
              <span class="vm-tree-code">Host ComponentActivity</span>
            </div>
            <p class="vm-tree-text">持有根级 <code>ViewModelStore</code>，负责在整个 Activity 旋转时托底整棵导航树。</p>
          </div>
          <div class="vm-tree-connector"></div>

          <!-- Middle: NavControllerViewModel -->
          <div class="vm-tree-node node-mid">
            <div class="vm-tree-node-head">
              <span class="vm-tree-badge badge-indigo">导航栈管理者</span>
              <span class="vm-tree-code">NavControllerViewModel</span>
            </div>
            <p class="vm-tree-text">在宿主 Store 中常驻，统一分配并调度各页面的 <code>NavBackStackEntry</code> 回退栈。</p>
          </div>
          <div class="vm-tree-fork">
            <div class="fork-line fork-left"></div>
            <div class="fork-line fork-right"></div>
          </div>

          <!-- Leaves Grid -->
          <div class="vm-tree-leaves-grid">
            <!-- Left: Page Scope -->
            <div class="vm-leaf-card">
              <div class="vm-leaf-header">
                <span class="vm-leaf-title text-emerald">页面级独立作用域</span>
                <span class="vm-leaf-sub">NavBackStackEntry (Page A)</span>
              </div>
              <ul class="vm-leaf-list">
                <li>• <code>viewModel()</code> 默认绑定当前 Entry 局部 Store</li>
                <li>• <strong>出栈即毁</strong>：用户按返回键时立即调用 <code>clear()</code> 触发 <code>onCleared()</code>，释放内存杜绝泄漏</li>
              </ul>
            </div>

            <!-- Right: SubGraph Scope -->
            <div class="vm-leaf-card">
              <div class="vm-leaf-header">
                <span class="vm-leaf-title text-amber">多页面流程共享作用域</span>
                <span class="vm-leaf-sub">NavGraph Scope (SubGraph)</span>
              </div>
              <ul class="vm-leaf-list">
                <li>• <code>navController.getBackStackEntry("checkout_flow")</code></li>
                <li>• <strong>多步共享</strong>：购物车 ➔ 填写地址 ➔ 支付结算之间无感共享同一个 ViewModel 实例</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      ${asciiFallback ? `
      <!-- ASCII Text Drawer (Collapsible) -->
      <details class="okhttp-ascii-drawer mt-4">
        <summary class="okhttp-ascii-summary">
          <span>📐 查看 / 复制纯文本字符流转图</span>
        </summary>
        <pre class="okhttp-ascii-content"><code>${escapeHtml(asciiFallback)}</code></pre>
      </details>
      ` : ''}

    </div>
  `;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m] || m);
}
