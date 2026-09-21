/**
 * SwiftTopologyVisual Component
 * 
 * 渲染 Swift 并发主干调用链、切片挂起点节点与并发子任务拓扑的高保真原生 SVG 矢量图解组件。
 * 1:1 还原拓扑架构：主干节点（实线）、分支子任务（虚线分叉）、协同等待/结果聚合（点状曲线）。
 * 遵循 Vanilla CSS 与响应式规范，支持 iOS 风格天青/海蓝配色与深色/浅色主题自适应。
 */

export function renderSwiftTopologyVisual(): string {
  return `
    <div class="coroutine-topology-container swift-topology-container" id="swift-topology-card">
      <div class="coroutine-topology-card swift-topology-card">
        <div class="coroutine-topology-legend">
          <div class="legend-item">
            <span class="legend-badge badge-swift-trunk"></span>
            <span>主干调用 / 切片挂起点节点（实线连接）</span>
          </div>
          <div class="legend-item">
            <span class="legend-badge badge-branch"></span>
            <span>分支并发子任务（虚线分叉）</span>
          </div>
          <div class="legend-item">
            <span class="legend-badge badge-swift-rendezvous"></span>
            <span>协同等待 / 结果聚合（点状曲线）</span>
          </div>
        </div>
        <div class="coroutine-topology-svg-wrap">
          <svg viewBox="0 0 920 600" class="coroutine-topology-svg swift-topology-svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Swift 并发任务节点与分支拓扑图">
            <defs>
              <!-- Arrow gray (Trunk solid lines) -->
              <marker id="swift-arrow-gray" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#8c9ba5" class="marker-path-gray" />
              </marker>
              <!-- Arrow fork (Dashed branch fork lines) -->
              <marker id="swift-arrow-fork" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#b0bec5" class="marker-path-fork" />
              </marker>
              <!-- Arrow blue (Dotted rendezvous curves) -->
              <marker id="swift-arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0284c7" class="marker-path-swift-blue" />
              </marker>
            </defs>

            <!-- 1. Root Trunk Node: Task { @MainActor in } -->
            <g class="node-swift-trunk" transform="translate(315, 24)">
              <rect width="290" height="48" rx="10" />
              <text x="145" y="24">Task { @MainActor in }</text>
            </g>

            <!-- Fork dashed lines from bottom corners of root box -->
            <path d="M 330 72 L 250 110" stroke="#b0bec5" stroke-width="1.8" stroke-dasharray="4 4" fill="none" marker-end="url(#swift-arrow-fork)" class="arrow-line-fork" />
            <path d="M 590 72 L 670 110" stroke="#b0bec5" stroke-width="1.8" stroke-dasharray="4 4" fill="none" marker-end="url(#swift-arrow-fork)" class="arrow-line-fork" />

            <!-- Left Branch Node: async let c -->
            <g class="node-async" transform="translate(75, 110)">
              <rect width="175" height="48" rx="10" />
              <text x="87.5" y="24">async let c</text>
            </g>

            <!-- Right Branch Node: taskB = Task { } -->
            <g class="node-launch" transform="translate(670, 110)">
              <rect width="175" height="48" rx="10" />
              <text x="87.5" y="24">taskB = Task { }</text>
            </g>

            <!-- Trunk Arrow 1 -> 2 -->
            <line x1="460" y1="72" x2="460" y2="104" stroke="#8c9ba5" stroke-width="1.8" marker-end="url(#swift-arrow-gray)" class="arrow-line-gray" />

            <!-- 2. withTaskGroup { group in } -->
            <g class="node-swift-trunk" transform="translate(325, 110)">
              <rect width="270" height="48" rx="10" />
              <text x="135" y="24">withTaskGroup { group in }</text>
            </g>

            <!-- Trunk Arrow 2 -> 3 -->
            <line x1="460" y1="158" x2="460" y2="190" stroke="#8c9ba5" stroke-width="1.8" marker-end="url(#swift-arrow-gray)" class="arrow-line-gray" />

            <!-- 3. withThrowingTaskGroup -->
            <g class="node-swift-trunk" transform="translate(325, 196)">
              <rect width="270" height="48" rx="10" />
              <text x="135" y="24">withThrowingTaskGroup</text>
            </g>

            <!-- Trunk Arrow 3 -> 4 -->
            <line x1="460" y1="244" x2="460" y2="276" stroke="#8c9ba5" stroke-width="1.8" marker-end="url(#swift-arrow-gray)" class="arrow-line-gray" />

            <!-- 4. await actor.method() -->
            <g class="node-swift-trunk" transform="translate(325, 282)">
              <rect width="270" height="48" rx="10" />
              <text x="135" y="24">await actor.method()</text>
            </g>

            <!-- Trunk Arrow 4 -> 5 -->
            <line x1="460" y1="330" x2="460" y2="362" stroke="#8c9ba5" stroke-width="1.8" marker-end="url(#swift-arrow-gray)" class="arrow-line-gray" />

            <!-- 5. normal async fun() -->
            <g class="node-swift-trunk" transform="translate(325, 368)">
              <rect width="270" height="48" rx="10" />
              <text x="135" y="24">normal async fun()</text>
            </g>

            <!-- Trunk Arrow 5 -> 6 -->
            <line x1="460" y1="416" x2="460" y2="448" stroke="#8c9ba5" stroke-width="1.8" marker-end="url(#swift-arrow-gray)" class="arrow-line-gray" />

            <!-- 6. await taskB.value -->
            <g class="node-swift-trunk" transform="translate(325, 454)">
              <rect width="270" height="48" rx="10" />
              <text x="135" y="24">await taskB.value</text>
            </g>

            <!-- Trunk Arrow 6 -> 7 -->
            <line x1="460" y1="502" x2="460" y2="534" stroke="#8c9ba5" stroke-width="1.8" marker-end="url(#swift-arrow-gray)" class="arrow-line-gray" />

            <!-- 7. await c -->
            <g class="node-swift-trunk" transform="translate(325, 540)">
              <rect width="270" height="48" rx="10" />
              <text x="135" y="24">await c</text>
            </g>

            <!-- Curved dotted blue arrow: async let c -> await c -->
            <path d="M 162 158 C 162 380, 200 564, 317 564" stroke="#0284c7" stroke-width="2" stroke-dasharray="3 3" fill="none" marker-end="url(#swift-arrow-blue)" class="arrow-line-swift-blue" />

            <!-- Curved dotted blue arrow: taskB -> await taskB.value -->
            <path d="M 758 158 C 758 320, 720 478, 603 478" stroke="#0284c7" stroke-width="2" stroke-dasharray="3 3" fill="none" marker-end="url(#swift-arrow-blue)" class="arrow-line-swift-blue" />
          </svg>
        </div>
      </div>
    </div>
  `;
}
