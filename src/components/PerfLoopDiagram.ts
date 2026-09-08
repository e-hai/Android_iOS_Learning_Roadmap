/**
 * PerfLoopDiagram Component
 *
 * 渲染移动端性能工程与优化攻坚闭环流向图解（目标 ➔ 测量 ➔ 定位 ➔ 优化 ➔ 验证 ➔ 线上观察 ➔ 持续提升 ➔ 闭环回流）。
 * 遵循 Vanilla CSS 与响应式设计系统，呈现低饱和高质感的流程节点与工具匹配映射。
 */

export function renderPerfLoopDiagram(): string {
  const loopSteps = [
    {
      step: '①',
      name: '目标设定',
      desc: 'SLO / SLA 确定与启动/帧率基线拆解',
      toolName: 'Benchmark / ADB',
      toolDetail: 'Macrobenchmark 启动耗时冷启动门禁 · ADB 物理帧耗时采集',
      badgeClass: 'perf-badge-purple',
    },
    {
      step: '②',
      name: '宏观测量',
      desc: '系统级 Trace 与关键路径瓶颈初筛',
      toolName: 'Android Studio Profiler',
      toolDetail: 'CPU / Memory / Energy 宏观运行态热点与内存波形初筛',
      badgeClass: 'perf-badge-blue',
    },
    {
      step: '③',
      name: '深潜定位',
      desc: '微观线程级 / 内核调度 / 锁竞争定位',
      toolName: 'Profiler / Perfetto',
      toolDetail: 'ftrace 内核调度 · Choreographer 丢帧 · 主线程 Lock 争用',
      badgeClass: 'perf-badge-cyan',
    },
    {
      step: '④',
      name: '架构优化',
      desc: '治理阻塞与瓶颈：Code / 架构 / UI / GPU / IO',
      toolName: 'Code / 架构 / UI / GPU / IO',
      toolDetail: 'Baseline Profiles 预编译 · 异步并行化 · 布局扁平 · 离屏优化',
      badgeClass: 'perf-badge-amber',
    },
    {
      step: '⑤',
      name: '本地验证',
      desc: '防回归验证与差异对比分析',
      toolName: 'Benchmark / CI 门禁',
      toolDetail: '本地 A/B 对比测试 · CI 自动化流水线指标衰减拦截防回归',
      badgeClass: 'perf-badge-emerald',
    },
    {
      step: '⑥',
      name: '线上观察',
      desc: '真实海量用户多维度 APM 观测',
      toolName: 'Android Vitals / Firebase',
      toolDetail: '慢函数耗时 · 崩溃率 · ANR 率 (0.47%) · 坏帧率 (<8%) 监控',
      badgeClass: 'perf-badge-indigo',
    },
    {
      step: '⑦',
      name: '持续提升',
      desc: '长尾尾延迟治理与新性能基线确立',
      toolName: 'P95 / P99 长尾治理',
      toolDetail: '分析低端机长尾瓶颈 · 提高标准形成下一代迭代基线',
      badgeClass: 'perf-badge-rose',
    },
  ];

  return `
    <div class="perf-loop-container">
      <!-- Header / Legend Banner -->
      <div class="perf-loop-header">
        <div class="perf-loop-title-row">
          <span class="perf-loop-tag">工程闭环</span>
          <span class="perf-loop-title">性能工程主流程与工业级工具链路映射</span>
        </div>
        <div class="perf-loop-legend">
          <span class="perf-legend-item"><span class="perf-dot dot-loop"></span>单向驱动递进</span>
          <span class="perf-legend-item"><span class="perf-dot dot-feedback"></span>基线循环迭代 (⑦ ➔ ①)</span>
        </div>
      </div>

      <!-- Main Flow Steps Grid / Track -->
      <div class="perf-loop-track">
        ${loopSteps.map((item, index) => `
          <div class="perf-step-row">
            <!-- Left: Flow Step Node -->
            <div class="perf-flow-node">
              <div class="perf-node-circle ${item.badgeClass}">
                <span class="perf-node-step">${item.step}</span>
              </div>
              <div class="perf-node-info">
                <div class="perf-node-name">${item.name}</div>
                <div class="perf-node-desc">${item.desc}</div>
              </div>
            </div>

            <!-- Middle: Dynamic Connection Arrow -->
            <div class="perf-connector">
              <svg class="perf-connector-svg" viewBox="0 0 40 24" width="28" height="16">
                <line x1="2" y1="12" x2="32" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <polyline points="26,6 32,12 26,18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>

            <!-- Right: Tools / Method Card -->
            <div class="perf-tool-card">
              <div class="perf-tool-name">${item.toolName}</div>
              <div class="perf-tool-detail">${item.toolDetail}</div>
            </div>
          </div>

          ${index < loopSteps.length - 1 ? `
            <div class="perf-down-arrow-row">
              <svg class="perf-down-svg" viewBox="0 0 24 24" width="14" height="16">
                <line x1="12" y1="2" x2="12" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <polyline points="7,13 12,19 17,13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          ` : ''}
        `).join('')}

        <!-- Bottom Feedback Loop Return to Step ① -->
        <div class="perf-feedback-loop">
          <div class="perf-feedback-line"></div>
          <div class="perf-feedback-badge">
            <svg class="perf-feedback-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M8 16H3v5"/>
            </svg>
            <span>新性能基线确立 ➔ 闭环进入下一阶段：① 目标设定</span>
          </div>
        </div>
      </div>
    </div>
  `;
}
