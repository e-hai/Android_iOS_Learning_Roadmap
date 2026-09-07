/**
 * OkHttp Pipeline Visual Component
 * 
 * 渲染 OkHttp 同步/异步双轨分流与七层责任链的高保真可视化原生组件。
 * 遵循 Vanilla CSS 与响应式设计规范，使用柔和素雅的低饱和浅色区分拓扑。
 */

export function renderOkHttpPipelineVisual(asciiFallback?: string): string {
  return `
    <div class="okhttp-pipeline-container" id="okhttp-pipeline-card">
      <!-- Header -->
      <div class="okhttp-pipeline-header">
        <div class="okhttp-pipeline-badges">
          <span class="pipeline-badge-primary">架构原理图</span>
          <span class="pipeline-badge-muted">OkHttp 4.x / 5.x 核心流转管线</span>
        </div>
        <h3 class="okhttp-pipeline-title">
          OkHttp 同步 / 异步双轨与责任链管线全景图
        </h3>
        <p class="okhttp-pipeline-subtitle">
          采用优雅低饱和浅色区分核心拓扑：异步并发限流、同步阻塞直达、双队列分流决策与七层责任链双向传递。
        </p>
      </div>

      <!-- Legend Bar: Pastel Accents -->
      <div class="okhttp-legend-grid">
        <div class="okhttp-legend-item legend-blue">
          <span class="legend-dot dot-blue"></span>
          <span>异步并发调度轨道</span>
        </div>
        <div class="okhttp-legend-item legend-amber">
          <span class="legend-dot dot-amber"></span>
          <span>同步阻塞直达轨道</span>
        </div>
        <div class="okhttp-legend-item legend-rose">
          <span class="legend-dot dot-rose"></span>
          <span>就绪排队等待区</span>
        </div>
        <div class="okhttp-legend-item legend-emerald">
          <span class="legend-dot dot-emerald"></span>
          <span>活跃运行与连接池</span>
        </div>
      </div>

      <!-- Main Pipeline Canvas -->
      <div class="okhttp-canvas">
        
        <!-- Stage 0: Client Request Entry -->
        <div class="okhttp-stage-entry">
          <div class="pipeline-node-card entry-box">
            <div class="entry-eyebrow">客户端调用发起点</div>
            <div class="entry-code">val call = okHttpClient.newCall(request)</div>
          </div>

          <!-- Split Branch Arrows -->
          <div class="okhttp-split-grid">
            <!-- Left: Async (Soft Blue Tint) -->
            <div class="okhttp-branch-col branch-left">
              <span class="branch-pill pill-blue">call.enqueue(callback) 异步调用</span>
              <div class="branch-caption">进入 Dispatcher 并发调度</div>
              <div class="branch-line line-blue"></div>
              <div class="branch-arrow arrow-blue"></div>
            </div>

            <!-- Right: Sync (Soft Amber Tint) -->
            <div class="okhttp-branch-col branch-right">
              <span class="branch-pill pill-amber">call.execute() 同步调用</span>
              <div class="branch-caption">当前线程阻塞直达</div>
              <div class="branch-line line-amber"></div>
              <div class="branch-arrow arrow-amber"></div>
            </div>
          </div>
        </div>

        <!-- Stage 1: Dual Parallel Tracks in Dispatcher -->
        <div class="pipeline-outer-stage stage-1-box">
          <div class="stage-section-header">
            <div class="stage-title-wrap">
              <span class="stage-num-badge">1</span>
              <span class="stage-title">阶段 1：Dispatcher 分发器内部流转（异步并发限流门闸 vs 同步直接登记追踪）</span>
            </div>
            <span class="stage-meta-tag">三大 Deque 调度核心</span>
          </div>

          <div class="stage-1-grid">
            <!-- Track A: Async Dispatcher (8 Cols - Pale Blue Container) -->
            <div class="dispatcher-track track-async">
              <div class="track-header header-async">
                <span class="track-title">【异步轨道】Dispatcher 动态流量控制</span>
                <span class="track-func">promoteAndExecute()</span>
              </div>

              <!-- Decision Diamond Box -->
              <div class="pipeline-node-card gate-decision-box">
                <div class="gate-header">
                  <span class="gate-title">门闸准入判定条件</span>
                  <span class="gate-limits">maxRequests=64 | maxRequestsPerHost=5</span>
                </div>
                <div class="gate-condition-code">
                  if (runningAsyncCalls.size &lt; 64 &amp;&amp; callsPerHost(host) &lt; 5)
                </div>

                <!-- Two Branches Out -->
                <div class="gate-branches-grid">
                  <div class="gate-branch-no">
                    <span class="branch-label-no">否（超额限流）</span>
                    <div class="gate-stem stem-rose"></div>
                  </div>
                  <div class="gate-branch-yes">
                    <span class="branch-label-yes">是（放行执行）</span>
                    <div class="gate-stem stem-emerald"></div>
                  </div>
                </div>
              </div>

              <!-- Ready & Running Queues -->
              <div class="dispatcher-queues-grid">
                <!-- readyAsyncCalls (Pale Rose Tint) -->
                <div class="pipeline-node-card queue-card queue-rose">
                  <div class="queue-card-top">
                    <div class="queue-card-title-row">
                      <span class="queue-name name-rose">readyAsyncCalls</span>
                      <span class="queue-tag tag-rose">排队等待</span>
                    </div>
                    <p class="queue-desc">
                      暂存超额请求，<strong>不丢弃任务</strong>。等待活跃任务结束并腾出配额。
                    </p>
                  </div>
                  <div class="queue-card-foot foot-rose">
                    <span>等待动态提升</span>
                    <span class="code-pill">ArrayDeque</span>
                  </div>
                </div>

                <!-- runningAsyncCalls (Pale Emerald Tint) -->
                <div class="pipeline-node-card queue-card queue-emerald">
                  <div class="queue-card-top">
                    <div class="queue-card-title-row">
                      <span class="queue-name name-emerald">runningAsyncCalls</span>
                      <span class="queue-tag tag-emerald">正在运行</span>
                    </div>
                    <p class="queue-desc">
                      准入通过，移入此队列并立即投递给底层线程池并发调度。
                    </p>
                  </div>
                  <div class="queue-card-foot foot-emerald">
                    <span>立即派发执行</span>
                    <span class="code-pill">ArrayDeque</span>
                  </div>
                </div>
              </div>

              <!-- Thread Pool (Subtle Tint) -->
              <div class="pipeline-node-card threadpool-card">
                <div>
                  <div class="tp-title">executorService: 零核心无界线程池</div>
                  <div class="tp-desc">core=0, max=MAX_VALUE, 60s 存活, SynchronousQueue</div>
                </div>
                <span class="tp-badge">按需手递手建线程</span>
              </div>

              <div class="track-foot-note note-async">
                子线程执行: AsyncCall.execute() ↓
              </div>
            </div>

            <!-- Track B: Sync Track (4 Cols - Pale Amber Container) -->
            <div class="dispatcher-track track-sync">
              <div class="track-header header-sync">
                <span class="track-title">【同步轨道】当前线程直通</span>
                <span class="track-func">client.execute()</span>
              </div>

              <!-- runningSyncCalls Box -->
              <div class="pipeline-node-card sync-box">
                <div class="queue-card-title-row">
                  <span class="queue-name name-amber">runningSyncCalls</span>
                  <span class="queue-tag tag-amber">登记追踪</span>
                </div>
                <div class="code-snippet-box">
                  synchronized {<br>
                  &nbsp;&nbsp;runningSyncCalls.add(call)<br>
                  }
                </div>
                <ul class="sync-principles-list">
                  <li>• <strong>不走线程池</strong>（调用方当前线程直接阻塞执行）</li>
                  <li>• <strong>不受 64 / 5 限流约束</strong>（不进门闸排队）</li>
                  <li>• 仅用于支持 <code>cancelAll()</code> 与全局监控</li>
                </ul>
              </div>

              <div class="sync-foot-box">
                <div class="sync-foot-desc">当前调用线程直接推进</div>
                <div class="sync-foot-target">直入责任链 ↓</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Junction -->
        <div class="okhttp-junction">
          <div class="junction-badge">
            <span>双轨汇合执行</span>
            <code class="junction-code">getResponseWithInterceptorChain$okhttp()</code>
          </div>
          <div class="junction-line"></div>
          <div class="junction-arrow"></div>
        </div>

        <!-- Stage 2: RealInterceptorChain Pipeline -->
        <div class="pipeline-outer-stage stage-2-box">
          <div class="stage-section-header">
            <span class="stage-title">阶段 2：RealInterceptorChain 七层责任链管线（前置递推 ➔ 后置包装）</span>
            <span class="stage-meta-tag">递归切面调用</span>
          </div>

          <div class="interceptors-list">
            <!-- Interceptor 1 -->
            <div class="pipeline-node-card interceptor-row">
              <div class="interceptor-main">
                <span class="interceptor-idx">1</span>
                <div>
                  <div class="interceptor-name">Application Interceptors (应用拦截器)</div>
                  <div class="interceptor-desc">前置：防篡改 HMAC-SHA256 加签、追加公参 | 后置：双 Token 无感并发刷新</div>
                </div>
              </div>
              <span class="interceptor-next">chain.proceed() ➔</span>
            </div>

            <!-- Interceptor 2 -->
            <div class="pipeline-node-card interceptor-row">
              <div class="interceptor-main">
                <span class="interceptor-idx">2</span>
                <div>
                  <div class="interceptor-name">RetryAndFollowUpInterceptor (重试与重定向)</div>
                  <div class="interceptor-desc">前置：创建 StreamAllocation/ExchangeFinder | 后置：捕获 RouteException 容灾重试、3xx 重定向</div>
                </div>
              </div>
              <span class="interceptor-next">chain.proceed() ➔</span>
            </div>

            <!-- Interceptor 3 -->
            <div class="pipeline-node-card interceptor-row">
              <div class="interceptor-main">
                <span class="interceptor-idx">3</span>
                <div>
                  <div class="interceptor-name">BridgeInterceptor (协议桥接)</div>
                  <div class="interceptor-desc">前置：补齐 Host, Keep-Alive, Accept-Encoding: gzip | 后置：透明解压 Gzip 还原 Body 流</div>
                </div>
              </div>
              <span class="interceptor-next">chain.proceed() ➔</span>
            </div>

            <!-- Interceptor 4 -->
            <div class="pipeline-node-card interceptor-row">
              <div class="interceptor-main">
                <span class="interceptor-idx">4</span>
                <div>
                  <div class="interceptor-name">CacheInterceptor (HTTP 规范缓存)</div>
                  <div class="interceptor-desc">前置：CacheStrategy 查本地磁盘缓存，有效则短路返回 | 后置：写入更新缓存、处理 304</div>
                </div>
              </div>
              <span class="interceptor-next text-warn">未命中 ➔ 穿透</span>
            </div>

            <!-- Interceptor 5: ConnectInterceptor (Soft Amber/Orange Highlight) -->
            <div class="pipeline-node-card interceptor-row-highlight">
              <div class="highlight-header">
                <div class="interceptor-main">
                  <span class="interceptor-idx idx-amber">5</span>
                  <span class="interceptor-name-highlight">ConnectInterceptor (寻址建连与 ConnectionPool 连接池)</span>
                </div>
                <span class="highlight-tag">底层物理 Socket</span>
              </div>

              <div class="pool-branches-grid">
                <div class="pool-card pool-hit">
                  <div class="pool-card-title text-emerald">命中可用连接：零握手耗时</div>
                  <p class="pool-card-desc">
                    直接提取相同 Host 的存活 Socket（HTTP/2 多路复用），规避 100~300ms TLS 握手。
                  </p>
                </div>
                <div class="pool-card pool-miss">
                  <div class="pool-card-title text-amber">未命中：全新建连</div>
                  <p class="pool-card-desc">
                    发起 TCP 三次握手 + TLS 1.3 协商，完成后存入全局 ConnectionPool 供后续共享。
                  </p>
                </div>
              </div>
            </div>

            <!-- Interceptor 6 -->
            <div class="pipeline-node-card interceptor-row">
              <div class="interceptor-main">
                <span class="interceptor-idx">6</span>
                <div>
                  <div class="interceptor-name">Network Interceptors (网络拦截器)</div>
                  <div class="interceptor-desc">前置：观察物理发送前的真实报文（含自动追加的标头） | 后置：测量真实网络传输耗时</div>
                </div>
              </div>
              <span class="interceptor-next">chain.proceed() ➔</span>
            </div>

            <!-- Interceptor 7 -->
            <div class="pipeline-node-card interceptor-row terminal-row">
              <div class="interceptor-main">
                <span class="interceptor-idx idx-terminal">7</span>
                <div>
                  <div class="interceptor-name font-bold">CallServerInterceptor (责任链终端)</div>
                  <div class="interceptor-desc">向底层 Okio Source / Sink 写入 Request 报文，并读取远程服务端的原始 Response。</div>
                </div>
              </div>
              <span class="terminal-badge">
                终点：逆序回传 ↺
              </span>
            </div>
          </div>
        </div>

        <!-- Stage 3: Life Cycle Finish (Soft Emerald Tint) -->
        <div class="pipeline-outer-stage stage-3-box">
          <div class="stage-section-header header-emerald">
            <span class="stage-title text-emerald-dark">阶段 3：请求结束与 Dispatcher 动态提升（promoteAndExecute）</span>
            <span class="stage-meta-tag tag-emerald-dark">finally { dispatcher.finished(call) }</span>
          </div>

          <div class="stage-3-grid">
            <div class="finish-card">
              <div class="finish-card-title">同步请求（.execute）:</div>
              <p class="finish-card-desc">
                从 <code>runningSyncCalls</code> 中移除；若全部调用完成且有 <code>idleCallback</code> 则触发闲置通知。
              </p>
            </div>

            <div class="finish-card card-emerald">
              <div class="finish-card-title text-emerald-dark">异步请求（.enqueue）:</div>
              <p class="finish-card-desc">
                从 <code>runningAsyncCalls</code> 移除。立即遍历 <code>readyAsyncCalls</code>，将符合条件的任务<strong>提升</strong>至线程池并发执行！
              </p>
            </div>
          </div>
        </div>

      </div>

      ${asciiFallback ? `
      <!-- ASCII Text Drawer (Collapsible) -->
      <details class="okhttp-ascii-drawer">
        <summary class="okhttp-ascii-summary">
          <span>📐 查看 / 复制纯文本 ASCII 拓扑字符画</span>
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
