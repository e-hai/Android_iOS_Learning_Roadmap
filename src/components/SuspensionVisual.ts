/**
 * SuspensionVisual Component
 * 
 * 渲染协程挂起点 (Suspension Point) 全景生命周期的原生高保真图解组件。
 * 彻底消除 ASCII 字符在不同系统字体下的等宽错位问题。
 * 遵循 Vanilla CSS 与响应式设计规范，使用柔和素雅的低饱和浅色区分拓扑。
 */

export function renderSuspensionVisual(): string {
  const downArrowSvg = `
    <div class="susp-v-arrow-wrap">
      <svg class="susp-v-arrow" viewBox="0 0 24 24" width="20" height="24">
        <line x1="12" y1="2" x2="12" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        <polyline points="6,13 12,19 18,13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  `;

  return `
    <div class="susp-visual-container" id="susp-visual-card">
      
      <!-- Top Overview Banner -->
      <div class="susp-header-banner">
        <div class="susp-badge-row">
          <span class="susp-badge susp-badge-blue">原理全景图解</span>
          <span class="susp-badge-text">编译期契约 ➔ 运行期分流 ➔ 异步断点接力</span>
        </div>
        <h4 class="susp-banner-title">挂起点 (Suspension Point) 真实机制全景透视</h4>
        <div class="susp-misconception-box">
          <div class="susp-misc-row misc-wrong">
            <span class="misc-icon">❌</span>
            <span class="misc-text"><strong>常见误区</strong>：以为挂起点是“耗时很长的代码”或“编译器读心预测耗时”。</span>
          </div>
          <div class="susp-misc-row misc-right">
            <span class="misc-icon">✔️</span>
            <span class="misc-text"><strong>真实本质</strong>：编译期严格认准 <code>suspend</code> 签名契约下刀切割；运行期根据是否返回 <code>COROUTINE_SUSPENDED</code> 决定是否让出物理工位。</span>
          </div>
        </div>
      </div>

      <!-- Phase 1: Compile Time -->
      <div class="susp-card-wrapper phase-compile">
        <div class="susp-card-header">
          <div class="susp-phase-tag tag-indigo">阶段一 · 编译期 (Compile-time)</div>
          <h5 class="susp-card-title">静态契约识别与状态机下刀切割</h5>
        </div>
        
        <div class="susp-two-col-grid">
          <!-- Col 1: Source Code -->
          <div class="susp-sub-card">
            <div class="susp-sub-header">
              <span class="susp-sub-dot dot-indigo"></span>
              <span class="susp-sub-title">开发者书写的源码</span>
            </div>
            <pre class="susp-code-snippet"><code>suspend fun loadData() {
    val a = step1()
    <span class="susp-highlight-line">val b = fetchRemote()</span> <span class="susp-badge-cut">✂️ 挂起点切刀</span>
    val c = step2(b)
}</code></pre>
            <p class="susp-sub-tip">编译器发现 <code>fetchRemote</code> 带有 <code>suspend</code> 签名修饰，直接在此处断开 BasicBlock。</p>
          </div>

          <!-- Col 2: Compiler IR Lowering -->
          <div class="susp-sub-card">
            <div class="susp-sub-header">
              <span class="susp-sub-dot dot-purple"></span>
              <span class="susp-sub-title">编译器生成的 Continuation 状态机</span>
            </div>
            <pre class="susp-code-snippet"><code>switch (this.label) {
  case 0:
    a = step1();
    this.label = 1; // 记录下一个断点
    Object res = fetchRemote(this);
    <span class="susp-highlight-line">if (res == COROUTINE_SUSPENDED) return;</span>
  case 1:
    b = (Data) res; // 恢复现场变量
    c = step2(b);
}</code></pre>
            <p class="susp-sub-tip">切成独立 case 分支，注入自身状态机参数，插入挂起让权检查。</p>
          </div>
        </div>
      </div>

      ${downArrowSvg}

      <!-- Phase 2: Runtime -->
      <div class="susp-card-wrapper phase-runtime">
        <div class="susp-card-header">
          <div class="susp-phase-tag tag-blue">阶段二 · 运行期 (Runtime)</div>
          <h5 class="susp-card-title">动态执行分流：真挂起 vs 同步快道</h5>
        </div>

        <div class="susp-runtime-trigger">
          <div class="trigger-pill">
            <span class="trigger-dot"></span>
            <span>物理线程执行到挂起点：<code>fetchRemote(continuation)</code></span>
          </div>
        </div>

        <div class="susp-branch-grid">
          <!-- Branch A: Fast Path -->
          <div class="susp-branch-card branch-fast">
            <div class="branch-header">
              <span class="branch-badge badge-green">分支 A · 内存缓存已就绪</span>
              <h6 class="branch-title">【同步快道 Fast Path】</h6>
            </div>
            <div class="branch-content">
              <div class="branch-point">
                <span class="point-label">执行现场：</span>
                <span>数据已在内存缓存，函数直接 <code>return cachedUser</code></span>
              </div>
              <div class="branch-point">
                <span class="point-label">返回值判定：</span>
                <code>res != COROUTINE_SUSPENDED</code>
              </div>
              <div class="branch-result result-green">
                <span class="result-icon">⚡</span>
                <div class="result-text">
                  <strong>绝不挂起！物理工位不让</strong>
                  <p>当前物理线程无需弹栈，直接进入 <code>case 1</code> 紧接着跑下一行，零线程切换开销！</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Branch B: True Suspension -->
          <div class="susp-branch-card branch-suspend">
            <div class="branch-header">
              <span class="branch-badge badge-orange">分支 B · 真正异步耗时</span>
              <h6 class="branch-title">【真挂起让权 True Suspension】</h6>
            </div>
            <div class="branch-content">
              <div class="branch-point">
                <span class="point-label">执行现场：</span>
                <span>发起非阻塞网络 I/O 或定时器，将 <code>continuation</code> 注册保存</span>
              </div>
              <div class="branch-point">
                <span class="point-label">返回值判定：</span>
                <code>res == COROUTINE_SUSPENDED</code>
              </div>
              <div class="branch-result result-orange">
                <span class="result-icon">🚪</span>
                <div class="result-text">
                  <strong>真弹栈退出！释放物理线程</strong>
                  <p>函数直接 return 弹栈，物理栈内存瞬间清空，线程立即回归线程池去执行其他任务！</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${downArrowSvg}

      <!-- Phase 3: Resume -->
      <div class="susp-card-wrapper phase-resume">
        <div class="susp-card-header">
          <div class="susp-phase-tag tag-green">阶段三 · 唤醒期 (Resume)</div>
          <h5 class="susp-card-title">异步完成与断点接力恢复</h5>
        </div>

        <div class="susp-resume-steps">
          <div class="resume-step-item">
            <span class="resume-num">1</span>
            <div class="resume-info">
              <strong>外部底层异步就绪</strong>
              <p>操作系统 epoll 网卡数据包到达、定时器到期或数据库回调返回</p>
            </div>
          </div>
          <div class="resume-h-arrow">➔</div>

          <div class="resume-step-item">
            <span class="resume-num">2</span>
            <div class="resume-info">
              <strong>触发续体接力棒</strong>
              <p>底层回调取出当初暂存的句柄，执行 <code>continuation.resume(data)</code></p>
            </div>
          </div>
          <div class="resume-h-arrow">➔</div>

          <div class="resume-step-item">
            <span class="resume-num">3</span>
            <div class="resume-info">
              <strong>线程池指派空闲工位</strong>
              <p>协程调度器（Dispatcher）唤醒并分配任意一个空闲 Worker 物理线程</p>
            </div>
          </div>
          <div class="resume-h-arrow">➔</div>

          <div class="resume-step-item highlight-resume">
            <span class="resume-num num-green">4</span>
            <div class="resume-info">
              <strong>按 label 断点精准复活</strong>
              <p>重新调用 <code>invokeSuspend(data)</code>，依据 <code>label=1</code> 瞬间直达目标分支继续跑！</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;
}
