/**
 * KotlinFeaturesVisual Component
 *
 * 渲染 Kotlin 现代语法糖与工程提效全景图（六大核心特性速查与映射链路）。
 * 彻底替换传统 ASCII 盒线图在不同字体与浏览器中中文字符错位的问题，
 * 采用原生响应式 HTML + CSS 设计，支持素雅的低饱和色调、代码高亮语义、痛点对比与底层字节码解析。
 */

export const KOTLIN_FEATURES_MARKDOWN = `| 特性类别 | 核心语法 | 什么时候用它 (解决什么痛点) | 底层实现与字节码机制 |
| :--- | :--- | :--- | :--- |
| **1. 泛型型变 (out / in)** | \`interface Source<out T>\`<br>\`interface Sink<in T>\`<br>\`Array<out Any>\` | 解决泛型容器赋值类型不匹配；编译期保障 PECS 生产/消费类型安全 | 声明处类型推导，编译期强类型检查，字节码层面映射为 Java Wildcard 通配符 (\`? extends\` / \`? super\`) |
| **2. 委托机制 (by)** | \`val x by lazy { ... }\`<br>\`var name by Delegates.observable\`<br>\`class D(i: I) : I by i\` | 消除大量重复 get/set 样板；解耦延迟初始化、状态观察、属性持久化与类装饰代理 | 编译器自动合成 \`\$\$delegate_x\` 隐藏实例，对属性或方法的访问全部自动路由到代理实例上 |
| **3. 扩展 (fun / val)** | \`fun View.visibleOrGone()\`<br>\`val String.lastChar: Char\` | 在不修改原类源码、不搞继承与装饰器模式下为已有类注入领域专属语义；终结各类 \`XxxUtils\` 静态工具类堆砌 | 编译期静态语法糖，转化为静态方法 \`public static final void visibleOrGone(View \$this)\`，首个入参即为接收者 |
| **4. 带接收者 Lambda** | \`block: Config.() -> Unit\`<br>\`inline fun <T> T.apply(b: T.() -> Unit)\` | 消除多余的中间临时变量与重复配置前缀；在闭包作用域内隐式持有 \`this\`，用于构建自然流动的树形类型安全 DSL | 编译为接受 Receiver 实例作为首参的函数接口 (\`Function1/Function2\`)，闭包内无需显式写前缀 |
| **5. 内联优化 (inline)** | \`inline fun measure(b: () -> Unit)\`<br>\`noinline\` / \`crossinline\` | 消除高阶函数 Lambda 匿名内部类创建带来的频繁堆内存分配与 GC 抖动压力；打破限制支持非局部返回 (\`return\`) | 编译期直接将高阶函数体和 Lambda 闭包字节码展开平铺内嵌到调用点，实现零对象开销抽象 |
| **6. 泛型具现化 (reified)** | \`inline fun <reified T> startActivity()\`<br>\`list.filterIsInstance<T>()\` | 突破 JVM 泛型在运行时被擦除为 Object 的铁律限制；免传繁琐且丑陋的 \`Class<T>\` / \`T::class.java\` | 依托 \`inline\` 将函数展开到调用点，编译器将调用处传入的真实具体类型直接硬编码写入字节码指令 |`;

export function renderKotlinFeaturesVisual(): string {
  return `
    <div class="kt-visual-container" id="kt-features-card">
      
      <!-- Top Overview Header -->
      <div class="kt-visual-header">
        <div class="kt-visual-header-left">
          <div class="kt-badge-row">
            <span class="kt-badge kt-badge-accent">语言设计哲学</span>
            <span class="kt-badge kt-badge-subtle">Kotlin 1.9 / 2.0 现代特性</span>
            <span class="kt-badge kt-badge-outline">零开销抽象 · 编译期抹平样板</span>
          </div>
          <h3 class="kt-visual-title">Kotlin 现代语法糖与工程提效全景图</h3>
          <p class="kt-visual-subtitle">
            六大核心特性的语法范式、设计哲学、底层字节码机制与工程痛点映射链路（自适应响应式架构）
          </p>
        </div>
        <div class="kt-visual-header-actions">
          <button class="box-copy-btn btn-ghost" id="btn-copy-kt-features" title="复制全景速查 Markdown 表格">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span>复制表格</span>
          </button>
        </div>
      </div>

      <!-- Dimension Legend Bar -->
      <div class="kt-legend-grid">
        <div class="kt-legend-item kt-legend-purple">
          <span class="kt-dot kt-dot-purple"></span>
          <span class="kt-legend-text"><strong>01. 泛型型变</strong> · 编译期类型约束 (PECS)</span>
        </div>
        <div class="kt-legend-item kt-legend-green">
          <span class="kt-dot kt-dot-green"></span>
          <span class="kt-legend-text"><strong>02. 委托机制</strong> · 约定胜于配置与状态转发</span>
        </div>
        <div class="kt-legend-item kt-legend-blue">
          <span class="kt-dot kt-dot-blue"></span>
          <span class="kt-legend-text"><strong>03. 扩展函数/属性</strong> · 零侵入领域语义增强</span>
        </div>
        <div class="kt-legend-item kt-legend-amber">
          <span class="kt-dot kt-dot-amber"></span>
          <span class="kt-legend-text"><strong>04. 带接收者 Lambda</strong> · 隐式 this 与树形 DSL</span>
        </div>
        <div class="kt-legend-item kt-legend-rose">
          <span class="kt-dot kt-dot-rose"></span>
          <span class="kt-legend-text"><strong>05. 内联优化</strong> · 零对象开销与消除 GC</span>
        </div>
        <div class="kt-legend-item kt-legend-cyan">
          <span class="kt-dot kt-dot-cyan"></span>
          <span class="kt-legend-text"><strong>06. 泛型具现化</strong> · 突破运行时类型擦除</span>
        </div>
      </div>

      <!-- Section 1: Responsive Comparison Matrix Table -->
      <div class="kt-matrix-table-wrap">
        <table class="kt-matrix-table">
          <thead>
            <tr>
              <th style="width: 20%;">特性类别</th>
              <th style="width: 25%;">语法关键范式</th>
              <th style="width: 30%;">什么时候用它（解决什么痛点）</th>
              <th style="width: 25%;">底层实现与字节码机制</th>
            </tr>
          </thead>
          <tbody>
            <!-- 01 泛型型变 -->
            <tr class="kt-row-purple">
              <td class="kt-cell-feature">
                <div class="kt-feat-badge kt-feat-purple">01</div>
                <div class="kt-feat-info">
                  <div class="kt-feat-name">泛型型变</div>
                  <div class="kt-feat-tag">out 协变 / in 逆变</div>
                </div>
              </td>
              <td class="kt-cell-syntax">
                <code class="kt-code-block">interface Source&lt;out T&gt; {
  fun produce(): T
}
interface Sink&lt;in T&gt; {
  fun consume(item: T)
}</code>
              </td>
              <td class="kt-cell-pain">
                <div class="kt-pain-item">
                  <span class="kt-tag-pain">💥 历史痛点</span>
                  <span>容器赋值类型不匹配（<code>List&lt;Dog&gt;</code> 无法赋给 <code>List&lt;Animal&gt;</code>），Java 调用点到处堆砌晦涩通配符。</span>
                </div>
                <div class="kt-benefit-item">
                  <span class="kt-tag-benefit">⚡ 破局收益</span>
                  <span>声明处一次定义，全工程调用点自然转换；严格保障生产只出不进、消费只进不出。</span>
                </div>
              </td>
              <td class="kt-cell-mech">
                <div class="kt-mech-text">
                  <strong>编译期类型擦除与推导</strong>：前端编译期严格校验读写边界，字节码层面映射为 Java Wildcard 通配符（<code>? extends</code> / <code>? super</code>）。
                </div>
              </td>
            </tr>

            <!-- 02 委托机制 -->
            <tr class="kt-row-green">
              <td class="kt-cell-feature">
                <div class="kt-feat-badge kt-feat-green">02</div>
                <div class="kt-feat-info">
                  <div class="kt-feat-name">委托机制</div>
                  <div class="kt-feat-tag">by 属性 / 类委托</div>
                </div>
              </td>
              <td class="kt-cell-syntax">
                <code class="kt-code-block">val x by lazy { init() }
var name by Delegates.observable(...)
class Repo(api: Api) : Api by api</code>
              </td>
              <td class="kt-cell-pain">
                <div class="kt-pain-item">
                  <span class="kt-tag-pain">💥 历史痛点</span>
                  <span>重复的 getter/setter 冗余样板代码，或手动手写接口转发的大量 Decorator 胶水代码。</span>
                </div>
                <div class="kt-benefit-item">
                  <span class="kt-tag-benefit">⚡ 破局收益</span>
                  <span>以约定模式（Convention）统一抽离延迟加载、生命周期监听、状态感知，解耦无侵入。</span>
                </div>
              </td>
              <td class="kt-cell-mech">
                <div class="kt-mech-text">
                  <strong>合成代理字段</strong>：编译器自动生成隐藏字段 <code>\$\$delegate_0</code>，将 <code>getValue()</code> / <code>setValue()</code> 访问全部路由到该代理实例上。
                </div>
              </td>
            </tr>

            <!-- 03 扩展 -->
            <tr class="kt-row-blue">
              <td class="kt-cell-feature">
                <div class="kt-feat-badge kt-feat-blue">03</div>
                <div class="kt-feat-info">
                  <div class="kt-feat-name">扩展机制</div>
                  <div class="kt-feat-tag">fun / val 扩展</div>
                </div>
              </td>
              <td class="kt-cell-syntax">
                <code class="kt-code-block">fun View.visibleOrGone(v: Boolean) {
  visibility = if (v) VISIBLE else GONE
}
val String.lastChar: Char get() = ...</code>
              </td>
              <td class="kt-cell-pain">
                <div class="kt-pain-item">
                  <span class="kt-tag-pain">💥 历史痛点</span>
                  <span>无法修改第三方 SDK 类或系统源码，项目充斥着各种 <code>XxxUtils.doSomething(view, ...)</code> 过程式垃圾。</span>
                </div>
                <div class="kt-benefit-item">
                  <span class="kt-tag-benefit">⚡ 破局收益</span>
                  <span>无需继承，点语法优雅调用，精准注入领域业务语义，提升 IDE 智能提示体验。</span>
                </div>
              </td>
              <td class="kt-cell-mech">
                <div class="kt-mech-text">
                  <strong>静态方法语法糖</strong>：编译为 <code>public static final void visibleOrGone(View \$this, boolean v)</code>，首个参数即为目标接收者，零运行时额外开销。
                </div>
              </td>
            </tr>

            <!-- 04 带接收者 Lambda -->
            <tr class="kt-row-amber">
              <td class="kt-cell-feature">
                <div class="kt-feat-badge kt-feat-amber">04</div>
                <div class="kt-feat-info">
                  <div class="kt-feat-name">带接收者 Lambda</div>
                  <div class="kt-feat-tag">T.() -> R 上下文闭包</div>
                </div>
              </td>
              <td class="kt-cell-syntax">
                <code class="kt-code-block">fun buildHttp(
  block: Request.Builder.() -> Unit
): Request = Request.Builder().apply(block).build()</code>
              </td>
              <td class="kt-cell-pain">
                <div class="kt-pain-item">
                  <span class="kt-tag-pain">💥 历史痛点</span>
                  <span>配置链条冗长，每次都要手写 <code>builder.addHeader(...)</code> 等无意义前缀，无法构建清晰的声明式树形结构。</span>
                </div>
                <div class="kt-benefit-item">
                  <span class="kt-tag-benefit">⚡ 破局收益</span>
                  <span>闭包作用域内隐式持有 <code>this</code>，是 Compose、Gradle KTS、HTML DSL 等声明式 UI 的基石。</span>
                </div>
              </td>
              <td class="kt-cell-mech">
                <div class="kt-mech-text">
                  <strong>接收者参数映射</strong>：转换为接收 Receiver 实例作为首个入参的函数对象 <code>Function1&lt;T, R&gt;</code>，调用点直接作为 <code>this</code> 绑定。
                </div>
              </td>
            </tr>

            <!-- 05 内联优化 -->
            <tr class="kt-row-rose">
              <td class="kt-cell-feature">
                <div class="kt-feat-badge kt-feat-rose">05</div>
                <div class="kt-feat-info">
                  <div class="kt-feat-name">内联优化</div>
                  <div class="kt-feat-tag">inline / noinline / crossinline</div>
                </div>
              </td>
              <td class="kt-cell-syntax">
                <code class="kt-code-block">inline fun measureTime(
  block: () -> Unit
): Long {
  val t0 = System.nanoTime()
  block()
  return System.nanoTime() - t0
}</code>
              </td>
              <td class="kt-cell-pain">
                <div class="kt-pain-item">
                  <span class="kt-tag-pain">💥 历史痛点</span>
                  <span>高阶函数入参在底层被编译为匿名内部类，高频循环或列表变换时引发灾难性对象分配与 GC 暂停。</span>
                </div>
                <div class="kt-benefit-item">
                  <span class="kt-tag-benefit">⚡ 破局收益</span>
                  <span>消除闭包对象分配；支持非局部控制流（在闭包内直接退出外层函数 <code>return</code>）。</span>
                </div>
              </td>
              <td class="kt-cell-mech">
                <div class="kt-mech-text">
                  <strong>编译期代码平铺展开</strong>：字节码层面直接将函数体和 Lambda 代码内联拷贝到调用现场，完全抹平高阶函数与 Lambda 的调用栈开销。
                </div>
              </td>
            </tr>

            <!-- 06 泛型具现化 -->
            <tr class="kt-row-cyan">
              <td class="kt-cell-feature">
                <div class="kt-feat-badge kt-feat-cyan">06</div>
                <div class="kt-feat-info">
                  <div class="kt-feat-name">泛型具现化</div>
                  <div class="kt-feat-tag">inline &lt;reified T&gt;</div>
                </div>
              </td>
              <td class="kt-cell-syntax">
                <code class="kt-code-block">inline fun &lt;reified T&gt; Context.start() {
  startActivity(Intent(this, T::class.java))
}
inline fun &lt;reified T&gt; List&lt;*&gt;.filterType(): List&lt;T&gt; =
  filterIsInstance&lt;T&gt;()</code>
              </td>
              <td class="kt-cell-pain">
                <div class="kt-pain-item">
                  <span class="kt-tag-pain">💥 历史痛点</span>
                  <span>JVM 运行时泛型被擦除为 <code>Object</code>，无法写 <code>is T</code>、无法写 <code>T::class.java</code>，不得不处处传 <code>Class&lt;T&gt; clazz</code>。</span>
                </div>
                <div class="kt-benefit-item">
                  <span class="kt-tag-benefit">⚡ 破局收益</span>
                  <span>调用端代码极简干净；原生支持精确的运行时类型匹配、JSON 泛型反序列化与安全强转。</span>
                </div>
              </td>
              <td class="kt-cell-mech">
                <div class="kt-mech-text">
                  <strong>静态调用点硬编码</strong>：依赖 <code>inline</code> 将代码展开至调用处，此时调用方已知真实类型，编译器直接生成具体类型的字节码指令（如 <code>Ldc [String.class]</code>）。
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Section 2: Structured Visual Feature Cards (Mobile & Deep Inspection) -->
      <div class="kt-cards-grid">
        
        <!-- Card 1 -->
        <div class="kt-card border-purple">
          <div class="kt-card-head">
            <span class="kt-card-num num-purple">01</span>
            <div class="kt-card-title-group">
              <span class="kt-card-title">泛型型变 (Variance)</span>
              <span class="kt-card-sub">out 协变 · in 逆变 · PECS 原则</span>
            </div>
          </div>
          <div class="kt-card-code">
            <div class="kt-code-tag">核心声明形式</div>
            <code>interface Producer&lt;out T&gt; { fun get(): T }<br>interface Consumer&lt;in T&gt; { fun set(v: T) }</code>
          </div>
          <div class="kt-card-points">
            <div class="kt-point-row">
              <span class="kt-point-icon">🎯</span>
              <span><strong>本质定位</strong>：编译期静态类型推导契约，解决泛型容器的“非协变性”阻碍。</span>
            </div>
            <div class="kt-point-row">
              <span class="kt-point-icon">⚡</span>
              <span><strong>典型应用</strong>：<code>List&lt;out E&gt;</code>、<code>Comparable&lt;in T&gt;</code>、<code>Array&lt;out Any&gt;</code> 类型投影。</span>
            </div>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="kt-card border-green">
          <div class="kt-card-head">
            <span class="kt-card-num num-green">02</span>
            <div class="kt-card-title-group">
              <span class="kt-card-title">委托机制 (Delegation)</span>
              <span class="kt-card-sub">by 关键字 · 属性与类委托</span>
            </div>
          </div>
          <div class="kt-card-code">
            <div class="kt-code-tag">核心声明形式</div>
            <code>val vm by viewModels&lt;MyVM&gt;()<br>class Window(b: Bounds) : Bounds by b</code>
          </div>
          <div class="kt-card-points">
            <div class="kt-point-row">
              <span class="kt-point-icon">🎯</span>
              <span><strong>本质定位</strong>：以“组合优于继承”为原则，将访问器逻辑全权移交独立状态机。</span>
            </div>
            <div class="kt-point-row">
              <span class="kt-point-icon">⚡</span>
              <span><strong>典型应用</strong>：<code>lazy</code> 延迟初始化、<code>viewBinding</code> 生命周期自动清空、首选项委托。</span>
            </div>
          </div>
        </div>

        <!-- Card 3 -->
        <div class="kt-card border-blue">
          <div class="kt-card-head">
            <span class="kt-card-num num-blue">03</span>
            <div class="kt-card-title-group">
              <span class="kt-card-title">扩展 (Extensions)</span>
              <span class="kt-card-sub">fun / val · 零侵入语义增强</span>
            </div>
          </div>
          <div class="kt-card-code">
            <div class="kt-code-tag">核心声明形式</div>
            <code>fun &lt;T&gt; Flow&lt;T&gt;.throttleFirst(ms: Long): Flow&lt;T&gt;<br>val Context.statusBarHeight: Int get() = ...</code>
          </div>
          <div class="kt-card-points">
            <div class="kt-point-row">
              <span class="kt-point-icon">🎯</span>
              <span><strong>本质定位</strong>：开放封闭原则的最佳实践，不破坏封装性即可为既有类注入领域能力。</span>
            </div>
            <div class="kt-point-row">
              <span class="kt-point-icon">⚡</span>
              <span><strong>典型应用</strong>：Android KTX 核心架构、Rx/Flow 操作符封装、View 快捷扩展。</span>
            </div>
          </div>
        </div>

        <!-- Card 4 -->
        <div class="kt-card border-amber">
          <div class="kt-card-head">
            <span class="kt-card-num num-amber">04</span>
            <div class="kt-card-title-group">
              <span class="kt-card-title">带接收者 Lambda</span>
              <span class="kt-card-sub">Receiver.() -> Unit · 声明式 DSL</span>
            </div>
          </div>
          <div class="kt-card-code">
            <div class="kt-code-tag">核心声明形式</div>
            <code>fun html(init: HTML.() -> Unit): HTML<br>inline fun &lt;T&gt; T.apply(block: T.() -> Unit): T</code>
          </div>
          <div class="kt-card-points">
            <div class="kt-point-row">
              <span class="kt-point-icon">🎯</span>
              <span><strong>本质定位</strong>：在指定的作用域上下文内执行逻辑，隐式注入当前 Receiver 上下文。</span>
            </div>
            <div class="kt-point-row">
              <span class="kt-point-icon">⚡</span>
              <span><strong>典型应用</strong>：Jetpack Compose 视图层级、Gradle 脚本 DSL、Ktor 路由树形配置。</span>
            </div>
          </div>
        </div>

        <!-- Card 5 -->
        <div class="kt-card border-rose">
          <div class="kt-card-head">
            <span class="kt-card-num num-rose">05</span>
            <div class="kt-card-title-group">
              <span class="kt-card-title">内联优化 (Inline)</span>
              <span class="kt-card-sub">inline · noinline · crossinline</span>
            </div>
          </div>
          <div class="kt-card-code">
            <div class="kt-code-tag">核心声明形式</div>
            <code>inline fun lock(l: Lock, body: () -> Unit)<br>inline fun foo(b1: () -> Unit, noinline b2: () -> Unit)</code>
          </div>
          <div class="kt-card-points">
            <div class="kt-point-row">
              <span class="kt-point-icon">🎯</span>
              <span><strong>本质定位</strong>：以编译期代码体积轻微膨胀换取零堆对象创建的高性能运行时优化。</span>
            </div>
            <div class="kt-point-row">
              <span class="kt-point-icon">⚡</span>
              <span><strong>典型应用</strong>：集合高频操作（<code>map/filter/forEach</code>）、并发锁守卫、非局部返回。</span>
            </div>
          </div>
        </div>

        <!-- Card 6 -->
        <div class="kt-card border-cyan">
          <div class="kt-card-head">
            <span class="kt-card-num num-cyan">06</span>
            <div class="kt-card-title-group">
              <span class="kt-card-title">泛型具现化 (Reified)</span>
              <span class="kt-card-sub">inline &lt;reified T&gt; · 突破类型擦除</span>
            </div>
          </div>
          <div class="kt-card-code">
            <div class="kt-code-tag">核心声明形式</div>
            <code>inline fun &lt;reified T&gt; Gson.fromJson(json: String): T<br>inline fun &lt;reified T&gt; Any.isType(): Boolean = this is T</code>
          </div>
          <div class="kt-card-points">
            <div class="kt-point-row">
              <span class="kt-point-icon">🎯</span>
              <span><strong>本质定位</strong>：突破 JVM 泛型在运行时被抹平为 Object 的铁律，保留具体类型元数据。</span>
            </div>
            <div class="kt-point-row">
              <span class="kt-point-icon">⚡</span>
              <span><strong>典型应用</strong>：<code>filterIsInstance&lt;T&gt;()</code>、动态路由跨页面跳转、依赖注入容器查找。</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  `;
}
