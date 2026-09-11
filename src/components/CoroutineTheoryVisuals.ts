/**
 * CoroutineTheoryVisuals Component
 * 
 * 为 Kotlin 协程 6 大核心阶段提供高保真原生动效图解（Vanilla CSS Keyframes + 响应式 SVG/HTML）。
 * 遵循轻量、零依赖与 60fps GPU 硬件加速原则，自适应深色/浅色模式，悬停暂停。
 */

export function renderCoroutineStageAnimation(stageIndex: number): string {
  switch (stageIndex) {
    case 0:
      return renderTaskDecoupleAnimation();
    case 1:
      return renderCpsBatonAnimation();
    case 2:
      return renderStackSpillAnimation();
    case 3:
      return renderStateMachineAnimation();
    case 4:
      return renderCallChainAnimation();
    case 5:
      return renderStructuredConcurrencyAnimation();
    default:
      return '';
  }
}

/**
 * 阶段 01 动画：任务与载体解耦（协作式出让物理执行权）
 * 双线同频对照：顶部步进器统一驱动【传统线程死锁】vs【协程协作让权】在 4 个阶段的鲜明命运反差
 */
function renderTaskDecoupleAnimation(): string {
  return `
    <div class="coroutine-anim-card decouple-card" data-active-mode="coop">
      <!-- Top Segmented Switcher Controls -->
      <div class="decouple-switch-toolbar">
        <div class="decouple-segmented-control" role="tablist">
          <button type="button" class="decouple-tab-btn active" data-target="coop" role="tab" aria-selected="true">
            <span class="tab-icon">⚡</span>
            <span class="tab-label">协程协作解耦</span>
            <span class="tab-badge badge-coop">推荐 · 零阻塞</span>
          </button>
          <button type="button" class="decouple-tab-btn" data-target="trad" role="tab" aria-selected="false">
            <span class="tab-icon">🛑</span>
            <span class="tab-label">传统线程阻塞</span>
            <span class="tab-badge badge-trad">对照组 · 死锁缺陷</span>
          </button>
        </div>
      </div>

      <!-- Panel 1: Coroutine Cooperative Decoupling (Default Active) -->
      <div class="decouple-panel decouple-panel-coop active" role="tabpanel">
        <!-- Coroutine 4-Phase Stepper Tracker -->
        <div class="decouple-stepper-bar coop-stepper-bar">
          <div class="stepper-item step-p1">
            <div class="step-head">
              <span class="step-circle">1</span>
              <span class="step-title">① 初始计算</span>
            </div>
            <span class="step-sub">Task A 占用线程执行</span>
          </div>
          <div class="stepper-arrow">➔</div>
          <div class="stepper-item step-p2">
            <div class="step-head">
              <span class="step-circle">2</span>
              <span class="step-title">② 遇 I/O 挂起</span>
            </div>
            <span class="step-sub">脱钩让权，腾出工位</span>
          </div>
          <div class="stepper-arrow">➔</div>
          <div class="stepper-item step-p3">
            <div class="step-head">
              <span class="step-circle">3</span>
              <span class="step-title">③ Task B 接力</span>
            </div>
            <span class="step-sub">工人无缝接手，100% 运转</span>
          </div>
          <div class="stepper-arrow">➔</div>
          <div class="stepper-item step-p4">
            <div class="step-head">
              <span class="step-circle">4</span>
              <span class="step-title">④ 数据就绪唤醒</span>
            </div>
            <span class="step-sub">Task A 回落收尾，双任务完成</span>
          </div>
        </div>

        <!-- Coroutine Single-Stage Canvas -->
        <div class="coop-stage-canvas single-stage">
          <!-- Top: Suspended Floating Pool -->
          <div class="coop-pool-zone">
            <div class="pool-zone-header">
              <span class="pool-zone-dot"></span>
              <span>待续挂起池 (仅占堆内存轻量对象，0 物理线程消耗)</span>
            </div>
            <div class="pool-floating-area">
              <div class="coop-pool-pill coop-pool-task-a">
                <div class="pool-pill-row">
                  <span class="task-title text-blue">Task A (挂起脱钩)</span>
                  <span class="pool-tag">等待底层数据通知</span>
                </div>
                <span class="pool-desc">已主动让出物理工人，不占任何 CPU 资源</span>
              </div>
            </div>
          </div>

          <!-- Trajectory Arrows -->
          <div class="coop-trajectory-row">
            <div class="traj-arrow traj-up">
              <span>② 挂起脱钩出让 (Yield)</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
            </div>
            <div class="traj-arrow traj-down">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
              <span>④ 数据就绪唤醒 (Resume)</span>
            </div>
          </div>

          <!-- Worker Thread Execution Lane -->
          <div class="coop-worker-lane">
            <div class="worker-tag tag-success">
              <span class="worker-dot dot-live"></span>
              <span>Worker Thread #1 (物理工人)</span>
            </div>
            <div class="coop-lane-slot">
              <!-- P1: Task A running -->
              <div class="coop-task-pill coop-p1-task-a">
                <div class="pill-title-row">
                  <span class="task-title">Task A 正在执行</span>
                  <span class="pill-state-tag state-run">阶段 ① 运行</span>
                </div>
                <div class="pill-detail">执行到挂起点准备出让...</div>
              </div>

              <!-- P3: Task B seamlessly takes over -->
              <div class="coop-task-pill coop-p3-task-b">
                <div class="pill-title-row">
                  <span class="task-title text-success">⚡ Task B 无缝接力执行！</span>
                  <span class="pill-state-tag state-full">阶段 ③ 100% 满负荷</span>
                </div>
                <div class="pill-detail">工人零卡顿，无缝处理新任务（零阻塞）</div>
              </div>

              <!-- P4: Task A resumes -->
              <div class="coop-task-pill coop-p4-task-a">
                <div class="pill-title-row">
                  <span class="task-title text-accent">Task A 接力恢复！</span>
                  <span class="pill-state-tag state-resume">阶段 ④ 双任务完成</span>
                </div>
                <div class="pill-detail">Task B 已提前完成，Task A 回落线程继续后续逻辑</div>
              </div>
            </div>
          </div>
        </div>

        <div class="model-verdict verdict-success">
          <strong>协程破局</strong>：任务遇到 I/O 主动让出工人，工人立即接力处理 Task B，两项任务重叠高效完成，吞吐量翻倍！
        </div>
      </div>

      <!-- Panel 2: Traditional Blocking Model (Comparison Pane) -->
      <div class="decouple-panel decouple-panel-trad" role="tabpanel" style="display: none;">
        <!-- Traditional 4-Phase Stepper Tracker -->
        <div class="decouple-stepper-bar trad-stepper-bar">
          <div class="stepper-item step-p1">
            <div class="step-head">
              <span class="step-circle circle-danger">1</span>
              <span class="step-title">① 初始计算</span>
            </div>
            <span class="step-sub">Task A 占用线程执行</span>
          </div>
          <div class="stepper-arrow">➔</div>
          <div class="stepper-item step-p2">
            <div class="step-head">
              <span class="step-circle circle-danger">2</span>
              <span class="step-title">② 遇 I/O 等待</span>
            </div>
            <span class="step-sub">Thread.sleep 死锁阻塞</span>
          </div>
          <div class="stepper-arrow">➔</div>
          <div class="stepper-item step-p3">
            <div class="step-head">
              <span class="step-circle circle-danger">3</span>
              <span class="step-title">③ Task B 到来</span>
            </div>
            <span class="step-sub">进不去！排队严重饥饿</span>
          </div>
          <div class="stepper-arrow">➔</div>
          <div class="stepper-item step-p4">
            <div class="step-head">
              <span class="step-circle circle-danger">4</span>
              <span class="step-title">④ 数据就绪唤醒</span>
            </div>
            <span class="step-sub">Task A 延误释放，Task B 滞后</span>
          </div>
        </div>

        <!-- Traditional Single-Stage Canvas -->
        <div class="trad-stage-canvas single-stage">
          <div class="model-content-row">
            <!-- Worker Lane -->
            <div class="trad-lane">
              <div class="worker-tag tag-danger">
                <span class="worker-dot"></span>
                <span>OS Thread #1 (物理工人)</span>
              </div>
              <div class="trad-lane-slot">
                <!-- P1: Task A running normally -->
                <div class="trad-task-pill trad-p1-run">
                  <span class="t-title">Task A 正在执行</span>
                  <span class="t-state">CPU 正常运转中...</span>
                </div>
                <!-- P2 & P3: Task A blocked -->
                <div class="trad-task-pill trad-p2-blocked">
                  <div class="t-row">
                    <span class="t-title text-danger">Task A 发起网络 I/O</span>
                    <span class="badge-lock">⛔ Thread.sleep 锁死！</span>
                  </div>
                  <span class="t-state text-danger">物理工人被迫停工，1MB 内存被死锁，CPU 空耗</span>
                </div>
                <!-- P4: Task A unblocks late -->
                <div class="trad-task-pill trad-p4-finish">
                  <span class="t-title text-amber">Task A 终于唤醒</span>
                  <span class="t-state text-danger">耗时翻倍！Task B 此时才刚准备排队进入...</span>
                </div>
              </div>
            </div>

            <!-- Outside Waiting Queue -->
            <div class="trad-queue-cell">
              <div class="queue-header">就绪队列 (排队情况)</div>
              <div class="trad-queue-slot">
                <!-- P1 & P2: Task B standby -->
                <div class="queue-task-pill q-standby">
                  <span class="b-name">Task B</span>
                  <span class="b-state">排队待命中</span>
                </div>
                <!-- P3: Task B locked out -->
                <div class="queue-task-pill q-blocked">
                  <span class="b-name text-danger">Task B</span>
                  <span class="b-state text-danger">🛑 进不去！工人被占用</span>
                </div>
                <!-- P4: Task B finally entering late -->
                <div class="queue-task-pill q-late">
                  <span class="b-name text-amber">Task B</span>
                  <span class="b-state text-amber">⚠️ 延误已久，刚轮到它</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="model-verdict verdict-danger">
          <strong>传统弊端</strong>：I/O 等待期间物理线程死锁，后续任务全部被堵在门外无法执行，吞吐量暴跌！
        </div>
      </div>
    </div>
  `;
}

/**
 * 阶段 02 动画：控制权对象化（CPS 续体传递风格）
 * 动态演示：编译器参数注入 + 运行时 Continuation 接力棒传递
 */
function renderCpsBatonAnimation(): string {
  return `
    <div class="coroutine-anim-card">
      <div class="coroutine-anim-header">
        <div class="anim-badge-wrap">
          <span class="anim-badge anim-badge-blue">动态推演 02</span>
          <span class="anim-hint">CPS 续体接力棒流转 · 悬停可暂停观察</span>
        </div>
        <div class="anim-legend-row">
          <span class="legend-pill pill-cps">隐式 Continuation 参数</span>
          <span class="legend-pill pill-baton">运行权限接力棒</span>
        </div>
      </div>

      <div class="coroutine-anim-stage stage-cps">
        <!-- Transformation Bar -->
        <div class="cps-signature-banner">
          <div class="sig-row">
            <span class="sig-tag">源代码定义</span>
            <code class="sig-code">suspend fun fetchProfile(uid: Long): Profile</code>
          </div>
          <div class="sig-arrow-down">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
            <span>编译期展开（抹去返回值 · 尾部注入 Continuation 接力棒）</span>
          </div>
          <div class="sig-row sig-expanded">
            <span class="sig-tag sig-tag-cps">CPS 字节码</span>
            <code class="sig-code">fun fetchProfile(uid: Long, <span class="highlight-cps-param">continuation: Continuation&lt;Profile&gt;</span>): Any?</code>
          </div>
        </div>

        <!-- Runtime Baton Flow Sequence -->
        <div class="cps-runtime-flow">
          <div class="cps-node node-caller">
            <div class="node-title">Caller 调用端</div>
            <div class="node-body">封装后续处理逻辑</div>
          </div>

          <!-- Animated Baton Packet -->
          <div class="cps-baton-channel">
            <div class="cps-baton-packet">
              <span class="baton-icon">🪄</span>
              <span class="baton-text">Continuation</span>
            </div>
            <div class="channel-pulse-line"></div>
          </div>

          <div class="cps-node node-callee">
            <div class="node-title">挂起函数 fetchProfile</div>
            <div class="node-badge-ret">返回 COROUTINE_SUSPENDED</div>
          </div>

          <!-- Return Resume Channel -->
          <div class="cps-resume-channel">
            <div class="cps-resume-packet">
              <span class="resume-dot"></span>
              <span class="resume-text">resumeWith(Result.success)</span>
            </div>
            <div class="channel-pulse-line-back"></div>
          </div>
        </div>
      </div>

      <div class="coroutine-anim-footer">
        <span class="footer-step-chip">1. 尾部携带 Continuation</span>
        <span class="footer-arrow">➔</span>
        <span class="footer-step-chip">2. 挂起立即退出返回标记</span>
        <span class="footer-arrow">➔</span>
        <span class="footer-step-chip">3. resumeWith 注入结果唤醒</span>
      </div>
    </div>
  `;
}

/**
 * 阶段 03 动画：运行栈状态堆化（用堆内存对抗硬件栈限制）
 * 动态演示：物理栈帧瞬间弹栈释放，局部变量（Spill）沉淀入堆，恢复时重装
 */
function renderStackSpillAnimation(): string {
  return `
    <div class="coroutine-anim-card">
      <div class="coroutine-anim-header">
        <div class="anim-badge-wrap">
          <span class="anim-badge anim-badge-purple">动态推演 03</span>
          <span class="anim-hint">物理栈帧清空 vs 堆状态持久化 · 悬停可暂停观察</span>
        </div>
        <div class="anim-legend-row">
          <span class="legend-pill pill-stack">Thread Stack (硬件栈空间)</span>
          <span class="legend-pill pill-heap">JVM Heap (堆内存对象)</span>
        </div>
      </div>

      <div class="coroutine-anim-stage stage-stack-spill">
        <div class="spill-split-grid">
          <!-- Left: Hardware Stack -->
          <div class="spill-col col-stack">
            <div class="col-head head-stack">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              <span>物理线程调用栈 (Stack)</span>
            </div>
            <div class="stack-box-canvas">
              <div class="stack-frame-box frame-main">
                <span class="frame-tag">Caller Frame</span>
              </div>
              <div class="stack-frame-box frame-suspend">
                <div class="frame-suspend-header">
                  <span class="frame-title">fetchUser() 栈帧</span>
                  <span class="frame-action-tag">遇到挂起点 ➔ 弹栈清空！</span>
                </div>
                <!-- Local Variables in Stack -->
                <div class="frame-vars-group">
                  <div class="var-chip chip-var1">var token = "x89f"</div>
                  <div class="var-chip chip-var2">var cache = 1024</div>
                </div>
              </div>
            </div>
            <div class="stack-spill-note text-danger">⚡ 挂起时 return：栈帧瞬间弹出释放物理内存</div>
          </div>

          <!-- Center: Dynamic Spill Migration Beam -->
          <div class="spill-beam-center">
            <div class="beam-arrow arrow-spill">
              <span class="beam-label">挂起时搬移 (Spill)</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
            <div class="beam-arrow arrow-reload">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              <span class="beam-label">唤醒时重装现场</span>
            </div>
          </div>

          <!-- Right: Heap Object -->
          <div class="spill-col col-heap">
            <div class="col-head head-heap">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
              <span>JVM 堆内存 (Heap)</span>
            </div>
            <div class="heap-box-canvas">
              <div class="heap-continuation-box">
                <div class="heap-obj-header">
                  <span class="heap-obj-type">ContinuationImpl 堆对象</span>
                  <span class="heap-obj-id">@0x4f2a (持久常驻)</span>
                </div>
                <div class="heap-fields-list">
                  <div class="heap-field-row field-label">
                    <span class="f-key">label:</span>
                    <span class="f-val val-label">1</span>
                  </div>
                  <div class="heap-field-row field-token">
                    <span class="f-key">token:</span>
                    <span class="f-val">"x89f"</span>
                  </div>
                  <div class="heap-field-row field-cache">
                    <span class="f-key">cache:</span>
                    <span class="f-val">1024</span>
                  </div>
                  <div class="heap-field-row field-completion">
                    <span class="f-key">completion:</span>
                    <span class="f-val val-ptr">➔ ParentContinuation</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="stack-spill-note text-success">🛡️ 变量沉淀入堆：物理栈清空，状态完好保留</div>
          </div>
        </div>
      </div>

      <div class="coroutine-anim-footer">
        <span class="footer-step-chip">1. 栈帧变量打包写入堆</span>
        <span class="footer-arrow">➔</span>
        <span class="footer-step-chip">2. 物理栈弹出释放工人</span>
        <span class="footer-arrow">➔</span>
        <span class="footer-step-chip">3. 唤醒从堆读入新栈帧</span>
      </div>
    </div>
  `;
}

/**
 * 阶段 04 动画：状态机分支切片（依据 label 标签精准接力）
 */
function renderStateMachineAnimation(): string {
  return `
    <div class="coroutine-anim-card">
      <div class="coroutine-anim-header">
        <div class="anim-badge-wrap">
          <span class="anim-badge anim-badge-amber">动态推演 04</span>
          <span class="anim-hint">switch(label) 状态精准接力 · 悬停可暂停观察</span>
        </div>
        <div class="anim-legend-row">
          <span class="legend-pill pill-stage-0">Case 0 (初始阶段)</span>
          <span class="legend-pill pill-stage-1">Case 1 (接力恢复)</span>
          <span class="legend-pill pill-stage-2">Case 2 (最终收尾)</span>
        </div>
      </div>

      <div class="coroutine-anim-stage stage-sm">
        <div class="sm-timeline-track">
          <!-- State 0 -->
          <div class="sm-state-node node-case-0">
            <div class="sm-node-top">
              <span class="sm-badge">label == 0</span>
              <span class="sm-title">第 1 阶段：前置请求</span>
            </div>
            <div class="sm-code-line">uid = checkAuth()</div>
            <div class="sm-suspend-tag">➔ 遇到 suspend 挂起！(置 label = 1 并 return)</div>
          </div>

          <div class="sm-track-arrow">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            <span class="sm-arrow-tag">resumeWith() 唤醒</span>
          </div>

          <!-- State 1 -->
          <div class="sm-state-node node-case-1">
            <div class="sm-node-top">
              <span class="sm-badge sm-badge-active">label == 1</span>
              <span class="sm-title">第 2 阶段：精准直达</span>
            </div>
            <div class="sm-jump-hint">⚡ 自动跳过 Case 0，直接执行后续计算</div>
            <div class="sm-code-line">user = parseResult(res)</div>
          </div>

          <div class="sm-track-arrow">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>

          <!-- State 2 -->
          <div class="sm-state-node node-case-2">
            <div class="sm-node-top">
              <span class="sm-badge">label == 2</span>
              <span class="sm-title">第 3 阶段：最终返回</span>
            </div>
            <div class="sm-code-line">return Result.success</div>
          </div>
        </div>
      </div>

      <div class="coroutine-anim-footer">
        <span class="footer-step-chip">以 suspend 点切割代码块</span>
        <span class="footer-arrow">➔</span>
        <span class="footer-step-chip">修改 label 计数标记</span>
        <span class="footer-arrow">➔</span>
        <span class="footer-step-chip">唤醒时 switch(label) 精准跳转</span>
      </div>
    </div>
  `;
}

/**
 * 阶段 05 动画：层级调用链回溯（堆上链表模拟函数调用栈）
 */
function renderCallChainAnimation(): string {
  return `
    <div class="coroutine-anim-card">
      <div class="coroutine-anim-header">
        <div class="anim-badge-wrap">
          <span class="anim-badge anim-badge-cyan">动态推演 05</span>
          <span class="anim-hint">堆内存单向链表逐层回溯 · 悬停可暂停观察</span>
        </div>
        <div class="anim-legend-row">
          <span class="legend-pill pill-child">底层被调用者</span>
          <span class="legend-pill pill-parent">外层调用者</span>
        </div>
      </div>

      <div class="coroutine-anim-stage stage-chain">
        <div class="chain-nodes-container">
          <!-- Node 3: Deepest Child -->
          <div class="chain-node-card card-deep">
            <div class="chain-node-header">
              <span class="chain-badge">C: api.fetch()</span>
              <span class="chain-status status-deep">计算完成！</span>
            </div>
            <p class="chain-desc">产生数据 Profile(uid=9)</p>
            <div class="chain-ref-tag">completion 指向 B</div>
          </div>

          <!-- Pointer Arrow 1 -->
          <div class="chain-pulse-arrow arrow-c-to-b">
            <div class="pulse-data-packet">Result</div>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            <span class="arrow-caption">B.resumeWith(res)</span>
          </div>

          <!-- Node 2: Middle Caller -->
          <div class="chain-node-card card-mid">
            <div class="chain-node-header">
              <span class="chain-badge">B: repo.getUser()</span>
              <span class="chain-status status-mid">接收结果恢复</span>
            </div>
            <p class="chain-desc">写入本地缓存 Room</p>
            <div class="chain-ref-tag">completion 指向 A</div>
          </div>

          <!-- Pointer Arrow 2 -->
          <div class="chain-pulse-arrow arrow-b-to-a">
            <div class="pulse-data-packet">User</div>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            <span class="arrow-caption">A.resumeWith(user)</span>
          </div>

          <!-- Node 1: Root Caller -->
          <div class="chain-node-card card-root">
            <div class="chain-node-header">
              <span class="chain-badge">A: ViewModel.load()</span>
              <span class="chain-status status-root">最终消费数据</span>
            </div>
            <p class="chain-desc">更新 _uiState.value</p>
            <div class="chain-ref-tag">根作用域完成收网</div>
          </div>
        </div>
      </div>

      <div class="coroutine-anim-footer">
        <span class="footer-step-chip">每个 Continuation 持有 completion 引用</span>
        <span class="footer-arrow">➔</span>
        <span class="footer-step-chip">沿链表逐层触发 resumeWith()</span>
        <span class="footer-arrow">➔</span>
        <span class="footer-step-chip">纯堆内存完美模拟函数调用栈</span>
      </div>
    </div>
  `;
}

/**
 * 阶段 06 动画：结构化并发约束（树状层级派发与责任收敛）
 */
function renderStructuredConcurrencyAnimation(): string {
  return `
    <div class="coroutine-anim-card">
      <div class="coroutine-anim-header">
        <div class="anim-badge-wrap">
          <span class="anim-badge anim-badge-rose">动态推演 06</span>
          <span class="anim-hint">树状作用域与级联取消广播 · 悬停可暂停观察</span>
        </div>
        <div class="anim-legend-row">
          <span class="legend-pill pill-scope">CoroutineScope 根节点</span>
          <span class="legend-pill pill-cancel">取消脉冲信号广播</span>
        </div>
      </div>

      <div class="coroutine-anim-stage stage-tree">
        <div class="tree-canvas">
          <!-- Root Scope -->
          <div class="tree-root-box">
            <div class="tree-root-header">
              <span class="tree-badge">Parent Scope / Job</span>
              <span class="tree-signal-tag">触发 cancel() 广播</span>
            </div>
            <div class="tree-root-desc">viewModelScope (生命周期约束)</div>
          </div>

          <!-- Tree Branch Connectors -->
          <div class="tree-branches-svg">
            <svg width="100%" height="48" viewBox="0 0 360 48" fill="none" preserveAspectRatio="none">
              <path d="M180 0 V24 H90 V48" stroke="currentColor" stroke-width="2" stroke-dasharray="4 3" class="branch-path-left" />
              <path d="M180 0 V24 H270 V48" stroke="currentColor" stroke-width="2" stroke-dasharray="4 3" class="branch-path-right" />
            </svg>
            <div class="cancel-wave-left"></div>
            <div class="cancel-wave-right"></div>
          </div>

          <!-- Children Jobs Grid -->
          <div class="tree-children-grid">
            <div class="tree-child-card child-left">
              <div class="child-header">
                <span class="child-title">Child Job 1</span>
                <span class="child-status status-cancelled">已级联取消</span>
              </div>
              <p class="child-desc">网络轮询任务即时终止</p>
            </div>

            <div class="tree-child-card child-right">
              <div class="child-header">
                <span class="child-title">Child Job 2</span>
                <span class="child-status status-cancelled">已级联取消</span>
              </div>
              <p class="child-desc">大型文件解压安全退出</p>
            </div>
          </div>
        </div>
      </div>

      <div class="coroutine-anim-footer">
        <span class="footer-step-chip">父 Job 统摄所有子任务</span>
        <span class="footer-arrow">➔</span>
        <span class="footer-step-chip">取消信号沿树状拓扑向下广播</span>
        <span class="footer-arrow">➔</span>
        <span class="footer-step-chip">父任务等待全部子任务收敛退出</span>
      </div>
    </div>
  `;
}
