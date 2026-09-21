/**
 * CoroutineTopologyVisual Component
 * 
 * 渲染协程主干调用链、状态切片节点与并发分支拓扑的原生高保真 SVG 矢量图解组件。
 * 1:1 还原拓扑架构：主干节点（实线）、分支子协程（虚线分叉）、协同等待/聚合（点状曲线）。
 * 遵循 Vanilla CSS 与响应式规范，支持深色/浅色主题自适应。
 */

export function renderCoroutineTopologyVisual(): string {
  return `
    <div class="coroutine-topology-container" id="coroutine-topology-card">
      <div class="coroutine-topology-card">
        <div class="coroutine-topology-legend">
          <div class="legend-item">
            <span class="legend-badge badge-trunk"></span>
            <span>主干调用 / 状态切片节点（实线连接）</span>
          </div>
          <div class="legend-item">
            <span class="legend-badge badge-branch"></span>
            <span>分支并发子协程（虚线分叉）</span>
          </div>
          <div class="legend-item">
            <span class="legend-badge badge-rendezvous"></span>
            <span>协同等待 / 结果聚合（点状曲线）</span>
          </div>
        </div>
        <div class="coroutine-topology-svg-wrap">
          <svg viewBox="0 0 920 600" class="coroutine-topology-svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kotlin 协程状态节点与分支拓扑图">
            <defs>
              <!-- Arrow gray (Trunk solid lines) -->
              <marker id="arrow-gray" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#8c9ba5" class="marker-path-gray" />
              </marker>
              <!-- Arrow fork (Dashed branch fork lines) -->
              <marker id="arrow-fork" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#b0bec5" class="marker-path-fork" />
              </marker>
              <!-- Arrow blue (Dotted rendezvous curves) -->
              <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#124d8f" class="marker-path-blue" />
              </marker>
            </defs>

            <!-- 1. Root Trunk Node: CoroutineScope(context).launch{ } -->
            <g class="node-trunk" transform="translate(315, 24)">
              <rect width="290" height="48" rx="10" />
              <text x="145" y="24">CoroutineScope(context).launch{ }</text>
            </g>

            <!-- Fork dashed lines from bottom corners of root box -->
            <path d="M 330 72 L 250 110" stroke="#b0bec5" stroke-width="1.8" stroke-dasharray="4 4" fill="none" marker-end="url(#arrow-fork)" class="arrow-line-fork" />
            <path d="M 590 72 L 670 110" stroke="#b0bec5" stroke-width="1.8" stroke-dasharray="4 4" fill="none" marker-end="url(#arrow-fork)" class="arrow-line-fork" />

            <!-- Left Branch Node: async C -->
            <g class="node-async" transform="translate(75, 110)">
              <rect width="175" height="48" rx="10" />
              <text x="87.5" y="24">async C</text>
            </g>

            <!-- Right Branch Node: launch B -->
            <g class="node-launch" transform="translate(670, 110)">
              <rect width="175" height="48" rx="10" />
              <text x="87.5" y="24">launch B</text>
            </g>

            <!-- Trunk Arrow 1 -> 2 -->
            <line x1="460" y1="72" x2="460" y2="104" stroke="#8c9ba5" stroke-width="1.8" marker-end="url(#arrow-gray)" class="arrow-line-gray" />

            <!-- 2. coroutineScope S1 -->
            <g class="node-trunk" transform="translate(330, 110)">
              <rect width="260" height="48" rx="10" />
              <text x="130" y="24">coroutineScope S1</text>
            </g>

            <!-- Trunk Arrow 2 -> 3 -->
            <line x1="460" y1="158" x2="460" y2="190" stroke="#8c9ba5" stroke-width="1.8" marker-end="url(#arrow-gray)" class="arrow-line-gray" />

            <!-- 3. supervisorScope S2 -->
            <g class="node-trunk" transform="translate(330, 196)">
              <rect width="260" height="48" rx="10" />
              <text x="130" y="24">supervisorScope S2</text>
            </g>

            <!-- Trunk Arrow 3 -> 4 -->
            <line x1="460" y1="244" x2="460" y2="276" stroke="#8c9ba5" stroke-width="1.8" marker-end="url(#arrow-gray)" class="arrow-line-gray" />

            <!-- 4. withContext S3 -->
            <g class="node-trunk" transform="translate(330, 282)">
              <rect width="260" height="48" rx="10" />
              <text x="130" y="24">withContext S3</text>
            </g>

            <!-- Trunk Arrow 4 -> 5 -->
            <line x1="460" y1="330" x2="460" y2="362" stroke="#8c9ba5" stroke-width="1.8" marker-end="url(#arrow-gray)" class="arrow-line-gray" />

            <!-- 5. normal suspend fun() -->
            <g class="node-trunk" transform="translate(330, 368)">
              <rect width="260" height="48" rx="10" />
              <text x="130" y="24">normal suspend fun()</text>
            </g>

            <!-- Trunk Arrow 5 -> 6 -->
            <line x1="460" y1="416" x2="460" y2="448" stroke="#8c9ba5" stroke-width="1.8" marker-end="url(#arrow-gray)" class="arrow-line-gray" />

            <!-- 6. B.join() -->
            <g class="node-trunk" transform="translate(330, 454)">
              <rect width="260" height="48" rx="10" />
              <text x="130" y="24">B.join()</text>
            </g>

            <!-- Trunk Arrow 6 -> 7 -->
            <line x1="460" y1="502" x2="460" y2="534" stroke="#8c9ba5" stroke-width="1.8" marker-end="url(#arrow-gray)" class="arrow-line-gray" />

            <!-- 7. C.await() -->
            <g class="node-trunk" transform="translate(330, 540)">
              <rect width="260" height="48" rx="10" />
              <text x="130" y="24">C.await()</text>
            </g>

            <!-- Curved dotted blue arrow: async C -> C.await() -->
            <path d="M 162 158 C 162 380, 200 564, 322 564" stroke="#124d8f" stroke-width="2" stroke-dasharray="3 3" fill="none" marker-end="url(#arrow-blue)" class="arrow-line-blue" />

            <!-- Curved dotted blue arrow: launch B -> B.join() -->
            <path d="M 758 158 C 758 320, 720 478, 598 478" stroke="#124d8f" stroke-width="2" stroke-dasharray="3 3" fill="none" marker-end="url(#arrow-blue)" class="arrow-line-blue" />
          </svg>
        </div>
      </div>
    </div>
  `;
}
