/**
 * KotlinFeaturesVisual Component
 *
 * 以“问题驱动与语言设计哲学”为核心的六大特性深度卡片流。
 * 聚焦：历史问题 ➔ 设计思路 ➔ 代码实现 ➔ 底层实现与典型场景。
 * 纯文字排版，无多余图标修饰。
 */

export const KOTLIN_FEATURES_MARKDOWN = `### Kotlin 六大现代特性的语言设计哲学全景图

1. **泛型 (Generics)**
   - 本质定义：参数化类型（Parameterized Types），将数据类型本身作为参数传递，写一套通用模板适配万物。
   - 根源动机：在泛型诞生前，容器全存 Object，取值全靠手工强转，运行时极易突发 ClassCastException 崩溃；若求类型安全就必须为每种类型复制一套 IntArrayList 等冗余模板。泛型最初的使命就是将类型崩溃提前到编译期静态拦截，并用一套模板消除重复样板。
   - 现代突破（自助餐厅顾客视角看型变）：
     - 调料台·调料罐（可放可舀，两头通 \<T\>）：死守标签绝不串用（不变 Invariant），防止白糖混进盐罐引起崩溃；
     - 饮料岛·自动饮料机（单向取饮料，只出不进 \<out T\>）：贴可乐直接当通用饮料喝（协变 Covariant），放行子类赋给父类；
     - 回收处·餐盘垃圾桶（吃完只能往里扔，只进不出 \<in T\>）：通用大垃圾桶通吃具体小垃圾（逆变 Contravariant），放行父类赋给子类。
   - 核心语法矩阵：<T>（读写不变）、<out T>（只读协变）、<in T>（只写逆变）、<*>（星号无差别安全只读）、where（多重上界复合约束）。

2. **委托机制 (by)**
   - 核心隐喻：专业的事交给专门的代理人跑腿，主类只挂名。
   - 历史问题：到处充斥着大量毫无营养的 if (_cache == null) 懒加载重复逻辑，或为了增强 1 个方法不得不为装饰器手写 30 个转发方法的胶水代码。
   - 设计思路：将“存取访问”与“接口转发”抽象为通用的协议约定（Convention），用 by 让编译器自动合成隐藏代理字段并转交调用。
   - 典型场景：by lazy 延迟初始化、by viewModels() 跨配置生命周期感知、by Delegates.observable。

3. **扩展 (fun / val)**
   - 核心隐喻：不破坏人家的原装封装，也能随手在人家口袋里塞个好用的小工具。
   - 历史问题：无法修改系统或第三方库源码，导致项目堆满主谓颠倒的垃圾桶类 ViewUtils.setGone(view)，且彻底摧毁了 IDE 的智能联想提示。
   - 设计思路：允许在类名前缀声明方法，以主谓自然的点语法调用；编译期静态降级为普通静态方法，首个参数即为接收者对象。
   - 典型场景：Android KTX 核心库（如 View.visibleOrGone()、Context.toast()）。

4. **带接收者 Lambda (T.() -> R)**
   - 核心隐喻：闭门造车——直接把屋子借给你，进门后你就是当前的屋主。
   - 历史问题：多层级树形配置或构建器模式充斥着 builder.xxx 或 it.xxx 等无意义前缀，视觉凌乱且缺乏直观嵌套层级。
   - 设计思路：在闭包执行时隐式借调目标对象的 this 上下文，无需任何中间变量前缀，奠定声明式 UI（Compose）与类型安全 DSL 根基。
   - 典型场景：T.apply { ... }、Jetpack Compose 视图层级声明、Gradle KTS 脚本。

5. **内联优化 (inline / noinline / crossinline)**
   - 核心隐喻：替身代打与就地拆包装——高级抽象不给运行时交“中介费”。
   - 历史问题：高阶函数在 JVM 底层每次都会偷偷创建匿名内部类对象，高频循环或高帧率绘制时频繁引发内存抖动与 GC 掉帧。
   - 设计思路：零成本抽象（Zero-cost Abstraction）。编译期直接将高阶函数体与 Lambda 字节码平铺展开到调用点，抹平对象分配与调用栈开销。
   - 典型场景：高频集合操作符（map / filter / forEach）、锁守卫 synchronized、耗时测量。

6. **泛型具现化 (reified)**
   - 核心隐喻：借东风——让内联展开把调用现场的真实类型直接“焊死”在字节码里。
   - 历史问题：JVM 泛型运行时擦除导致无法执行 is T 检查和 T::class.java，被迫在每个函数额外传一个难看的 Class<T> clazz。
   - 设计思路：借力 inline 将代码展开至调用现场，利用调用处已明确知晓具体类型的时机，直接将具体类型字节码指令硬编码写入。
   - 典型场景：startActivity<DetailActivity>() 页面跳转、filterIsInstance<T>()、JSON 泛型反序列化。`;

export function renderKotlinFeaturesVisual(): string {
  return `
    <div class="kt-visual-container" id="kt-features-card">
      
      <!-- Top Action Toolbar -->
      <div class="kt-visual-toolbar">
        <button class="box-copy-btn btn-ghost" id="btn-copy-kt-features" title="复制全景设计笔记">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <span>复制设计笔记</span>
        </button>
      </div>

      <!-- Philosophy Story Cards Flow -->
      <div class="kt-story-cards-flow">
        
        <!-- CARD 01 -->
        <article class="kt-story-card border-purple">
          <div class="kt-sc-header">
            <div class="kt-sc-title-wrap">
              <span class="kt-sc-badge num-purple">01</span>
              <div class="kt-sc-headings">
                <h4 class="kt-sc-title">泛型 (Generics)</h4>
                <span class="kt-sc-metaphor">“参数化类型：一套模板适配万物；自助餐厅顾客视角看懂型变”</span>
              </div>
            </div>
          </div>

          <div class="kt-sc-body-grid">
            <div class="kt-sc-box box-pain">
              <div class="kt-box-label label-pain">本质与历史痛点</div>
              <p class="kt-box-text">
                <strong>1. 本质定义</strong>：泛型本质是<strong>参数化类型（Parameterized Types）</strong>，将数据类型本身作为参数传递，实现“写一套通用模板适配万物”。
              </p>
              <p class="kt-box-text">
                <strong>2. 最初痛点</strong>：在泛型诞生前，所有集合容器全存 <code>Object</code>，取值全靠手工强转，线上极易突发致命的 <code>ClassCastException</code> 崩溃；若为求类型安全，就必须为每种类型复制一套 <code>IntArrayList</code>、<code>StringArrayList</code> 等冗余模板。泛型最初的根本使命就是<strong>将类型崩溃提前到编译期静态拦截，并用一套模板消除重复样板</strong>。
              </p>
              <p class="kt-box-text">
                <strong>3. 型变矛盾（为什么不能随意赋值？）</strong>：引入泛型后，现实中“可乐是一种饮料”，但为什么类型系统里 <code>MutableList&lt;Cola&gt;</code> 绝不能赋给 <code>MutableList&lt;Beverage&gt;</code>？因为一旦放行，别人就能往你的可乐列表里塞进热咖啡，导致你取回时爆发类型污染崩溃！
              </p>
            </div>

            <div class="kt-sc-box box-idea">
              <div class="kt-box-label label-idea">现代设计思路：自助餐厅就餐全景</div>
              <pre class="kt-ascii-diagram"><code>                【自助餐厅就餐全景】
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
     调料台·调料罐       饮料岛·自动饮料机     回收台·餐盘垃圾桶
      (能放又能取)         (只能按键接饮料)       (吃完只能往里扔)
      必须贴死标签         贴可乐直接当饮料用     大垃圾桶吃一切小垃圾
     【不变性 &lt;T&gt;】       【协变 &lt;out T&gt;】     【逆变 &lt;in T&gt;】</code></pre>
              <p class="kt-box-text" style="margin-top: 6px;">
                <strong>核心思考（既然“只出不进”，数据从哪来？）</strong>：数据在<strong>构造时一次性灌装（如 <code>listOf</code>）</strong>，或由容器<strong>在内部自行生产（如网络数据流 <code>Flow</code>）</strong>。“只出不进”是指<strong>对外封闭写接口（无 <code>add</code>/<code>set</code>）</strong>，彻底杜绝外部调用方中途塞入异物破坏类型安全。
              </p>
            </div>
          </div>

          <div class="kt-sc-code-box">
            <div class="kt-code-header">
              <span class="kt-code-tab">代码实现（五大核心用法）</span>
            </div>
            <pre class="kt-code-pre"><code><span class="kt-c-m">// 1. &lt;T&gt; 不变（调料罐：能放能取，类型锁死不能串用）</span>
<span class="kt-c-k">class</span> <span class="kt-c-t">Jar</span>&lt;<span class="kt-c-t">T</span>&gt;(<span class="kt-c-k">var</span> item: <span class="kt-c-t">T</span>)
<span class="kt-c-k">val</span> saltJar: <span class="kt-c-t">Jar</span>&lt;<span class="kt-c-t">Salt</span>&gt; = <span class="kt-c-t">Jar</span>(<span class="kt-c-t">Salt</span>())
<span class="kt-c-m">// val seasonJar: Jar&lt;Seasoning&gt; = saltJar // ❌ 编译报错！禁止赋值，防止被混入白糖</span>

<span class="kt-c-m">// 2. &lt;out T&gt; 协变（饮料机：构造时一次性灌装，对外只出不进，子类自然赋给父类）</span>
<span class="kt-c-k">class</span> <span class="kt-c-t">DrinkMachine</span>&lt;<span class="kt-c-k">out</span> <span class="kt-c-t">T</span>&gt;(<span class="kt-c-k">private val</span> drink: <span class="kt-c-t">T</span>) { <span class="kt-c-m">// ✅ 数据在出厂/构造时灌装</span>
  <span class="kt-c-k">fun</span> <span class="kt-c-f">getDrink</span>(): <span class="kt-c-t">T</span> = drink                        <span class="kt-c-m">// ✅ 对外只读，绝无 put/set 入口</span>
}
<span class="kt-c-k">val</span> colaMachine = <span class="kt-c-t">DrinkMachine</span>(<span class="kt-c-t">Cola</span>())
<span class="kt-c-k">val</span> drinkMachine: <span class="kt-c-t">DrinkMachine</span>&lt;<span class="kt-c-t">Beverage</span>&gt; = colaMachine <span class="kt-c-m">// ✅ 安全协变！贴可乐直接当饮料喝</span>

<span class="kt-c-m">// 3. &lt;in T&gt; 逆变（垃圾桶：只能扔进只进不出，父类消费者通吃子类）</span>
<span class="kt-c-k">interface</span> <span class="kt-c-t">TrashBin</span>&lt;<span class="kt-c-k">in</span> <span class="kt-c-t">T</span>&gt; { <span class="kt-c-k">fun</span> <span class="kt-c-f">throwIn</span>(item: <span class="kt-c-t">T</span>) }
<span class="kt-c-k">val</span> universalBin: <span class="kt-c-t">TrashBin</span>&lt;<span class="kt-c-t">Trash</span>&gt; = ...
<span class="kt-c-k">val</span> colaCupBin: <span class="kt-c-t">TrashBin</span>&lt;<span class="kt-c-t">ColaCup</span>&gt; = universalBin <span class="kt-c-m">// ✅ 安全逆变！大垃圾桶通吃可乐杯</span>

<span class="kt-c-m">// 4. &lt;*&gt; 星号投影（只关心容器通用属性，安全只读 Any?，严禁写入）</span>
<span class="kt-c-k">fun</span> <span class="kt-c-f">printListInfo</span>(list: <span class="kt-c-t">List</span>&lt;*&gt;) {
  <span class="kt-c-f">println</span>(list.size)                   <span class="kt-c-m">// ✅ 安全读取元素个数</span>
  <span class="kt-c-k">val</span> first: <span class="kt-c-t">Any</span>? = list.firstOrNull() <span class="kt-c-m">// ✅ 只能作为 Any? 安全读取，类型完全抹平</span>
}

<span class="kt-c-m">// 5. where 多重上界约束（T 必须同时满足多个接口/类条件）</span>
<span class="kt-c-k">fun</span> &lt;<span class="kt-c-t">T</span>&gt; <span class="kt-c-f">closeAndSort</span>(item: <span class="kt-c-t">T</span>) <span class="kt-c-k">where</span> <span class="kt-c-t">T</span> : <span class="kt-c-t">AutoCloseable</span>, <span class="kt-c-t">T</span> : <span class="kt-c-t">Comparable</span>&lt;<span class="kt-c-t">T</span>&gt; {
  item.<span class="kt-c-f">close</span>()                         <span class="kt-c-m">// ✅ T 既拥有可关闭能力，又拥有可比较能力</span>
}</code></pre>
          </div>
        </article>

        <!-- CARD 02 -->
        <article class="kt-story-card border-green">
          <div class="kt-sc-header">
            <div class="kt-sc-title-wrap">
              <span class="kt-sc-badge num-green">02</span>
              <div class="kt-sc-headings">
                <h4 class="kt-sc-title">委托机制 (by)</h4>
                <span class="kt-sc-metaphor">“专业的事交给专门的代理人跑腿，主类只挂名”</span>
              </div>
            </div>
          </div>

          <div class="kt-sc-body-grid">
            <div class="kt-sc-box box-pain">
              <div class="kt-box-label label-pain">历史问题</div>
              <p class="kt-box-text">
                我们在每个工程里都写过成百上千次同样的冗余样板代码：<br>
                1. 懒加载：必须自己写 <code>_cache</code> 私有变量，再在 getter 里加双重检查锁 <code>if (_cache == null) synchronized</code>；<br>
                2. 装饰器模式：只想给已有列表加上某一个埋点，为了实现接口，不得不手动在类里抄写 30 多个无辜的转发方法（<code>override fun size() = inner.size()</code>）。
              </p>
            </div>

            <div class="kt-sc-box box-idea">
              <div class="kt-box-label label-idea">设计思路</div>
              <p class="kt-box-text">
                “属性的读写存取、接口的方法转发，本质上全是一种<strong>‘转交代理’</strong>。既然逻辑完全相同，能不能在语言级设计一个通用的代办契约？开发者只要声明 <code>by 某对象</code>，编译器就自动帮他把繁重的跑腿样板全干了，让设计模式退化为一个普通关键字！”
              </p>
            </div>
          </div>

          <div class="kt-sc-code-box">
            <div class="kt-code-header">
              <span class="kt-code-tab">代码实现</span>
            </div>
            <pre class="kt-code-pre"><code><span class="kt-c-k">val</span> database <span class="kt-c-k">by</span> <span class="kt-c-f">lazy</span> { <span class="kt-c-t">DatabaseHelper</span>() } <span class="kt-c-m">// 线程安全双检锁，一行解决</span>

<span class="kt-c-k">class</span> <span class="kt-c-t">LoggedList</span>&lt;<span class="kt-c-t">T</span>&gt;(<span class="kt-c-k">private val</span> inner: <span class="kt-c-t">MutableList</span>&lt;<span class="kt-c-t">T</span>&gt;) : <span class="kt-c-t">MutableList</span>&lt;<span class="kt-c-t">T</span>&gt; <span class="kt-c-k">by</span> inner {
  <span class="kt-c-k">override fun</span> <span class="kt-c-f">add</span>(element: <span class="kt-c-t">T</span>): <span class="kt-c-t">Boolean</span> { <span class="kt-c-f">log</span>(element); <span class="kt-c-k">return</span> inner.<span class="kt-c-f">add</span>(element) }
} <span class="kt-c-m">// 仅拦截 1 个关心的函数，其余数十个方法全部由编译器自动转发代理！</span></code></pre>
          </div>

          <div class="kt-sc-footer-grid">
            <div class="kt-sc-foot-item">
              <span class="kt-foot-badge">底层实现</span>
              <span>编译器在背后自动生成隐藏属性 <code>$$delegate_0</code>，对属性或方法的访问在编译期全部改写为代理调用。</span>
            </div>
            <div class="kt-sc-foot-item">
              <span class="kt-foot-badge">典型场景</span>
              <span><code>by lazy</code> 单例懒加载、<code>by viewModels()</code> 跨配置存活、<code>by viewBinding()</code> 自动绑定解绑。</span>
            </div>
          </div>
        </article>

        <!-- CARD 03 -->
        <article class="kt-story-card border-blue">
          <div class="kt-sc-header">
            <div class="kt-sc-title-wrap">
              <span class="kt-sc-badge num-blue">03</span>
              <div class="kt-sc-headings">
                <h4 class="kt-sc-title">扩展 (fun / val)</h4>
                <span class="kt-sc-metaphor">“不破坏人家的封装，也能随手在人家口袋里塞个好用的小工具”</span>
              </div>
            </div>
          </div>

          <div class="kt-sc-body-grid">
            <div class="kt-sc-box box-pain">
              <div class="kt-box-label label-pain">历史问题</div>
              <p class="kt-box-text">
                Android 系统的 <code>View</code> 很多年都没有 <code>gone()</code> 方法，每次都得写长长的 <code>view.setVisibility(View.GONE)</code>。<br>
                为了省事，老项目充斥着大量工具类：<code>ViewUtils.gone(view)</code>、<code>StringUtils.isEmpty(str)</code>。这极为难受：<br>
                1. <strong>主谓倒置</strong>：本应是“让按钮隐藏”，写出来成了“工具类操作按钮”；<br>
                2. <strong>IDE 联想全废</strong>：输入 <code>button.</code> 时，根本搜不到你在工具类里藏了什么好方法。
              </p>
            </div>

            <div class="kt-sc-box box-idea">
              <div class="kt-box-label label-idea">设计思路</div>
              <p class="kt-box-text">
                “我们不可能给系统 SDK 每一个类提 PR，继承又会带来恶性的子类膨胀。能不能允许我们在类的外部定义方法，但调用的时候‘看起来’就像是该类原生自带的方法一样，既有 IDE 提示，又有链式主谓美感？”
              </p>
            </div>
          </div>

          <div class="kt-sc-code-box">
            <div class="kt-code-header">
              <span class="kt-code-tab">代码实现</span>
            </div>
            <pre class="kt-code-pre"><code><span class="kt-c-k">fun</span> <span class="kt-c-t">View</span>.<span class="kt-c-f">gone</span>() { visibility = <span class="kt-c-t">View</span>.<span class="kt-c-c">GONE</span> } <span class="kt-c-m">// 直接给 View 注入语义</span>
<span class="kt-c-k">val</span> <span class="kt-c-t">Context</span>.screenW: <span class="kt-c-t">Int</span> <span class="kt-c-k">get</span>() = resources.displayMetrics.widthPixels

<span class="kt-c-m">// 业务调用体验：如同原生 API</span>
submitBtn.<span class="kt-c-f">gone</span>()
context.<span class="kt-c-f">toast</span>(<span class="kt-c-s">"屏幕宽度: \${context.screenW}px"</span>)</code></pre>
          </div>

          <div class="kt-sc-footer-grid">
            <div class="kt-sc-foot-item">
              <span class="kt-foot-badge">底层实现</span>
              <span>编译器静态编译为 <code>public static final void gone(View $this)</code>，首参即为宿主实例。<strong>无反射、无侵入、零开销</strong>。</span>
            </div>
            <div class="kt-sc-foot-item">
              <span class="kt-foot-badge">典型场景</span>
              <span>官方 Android KTX（例如 <code>view.doOnPreDraw</code>、<code>lifecycleScope</code>）、各类流式业务操作符。</span>
            </div>
          </div>
        </article>

        <!-- CARD 04 -->
        <article class="kt-story-card border-amber">
          <div class="kt-sc-header">
            <div class="kt-sc-title-wrap">
              <span class="kt-sc-badge num-amber">04</span>
              <div class="kt-sc-headings">
                <h4 class="kt-sc-title">带接收者 Lambda (T.() -> R)</h4>
                <span class="kt-sc-metaphor">“闭门造车——直接把屋子借给你，进门后你就是当前的屋主”</span>
              </div>
            </div>
          </div>

          <div class="kt-sc-body-grid">
            <div class="kt-sc-box box-pain">
              <div class="kt-box-label label-pain">历史问题</div>
              <p class="kt-box-text">
                配置一个复杂对象（比如网络请求或 UI 树）时，传统 Builder 模式极其冗长：<br>
                必须手写 <code>val b = Builder()</code>，接着每行都是 <code>b.setUrl(...)</code>、<code>b.addHeader(...)</code>、<code>b.setTimeout(...)</code>；<br>
                或者在回调里充斥着 <code>it.setUrl(...)</code>。前缀满天飞，视觉杂乱，完全看不出树状层级关系。
              </p>
            </div>

            <div class="kt-sc-box box-idea">
              <div class="kt-box-label label-idea">设计思路</div>
              <p class="kt-box-text">
                “既然闭包代码的目的就是为了配置这个对象，能不能在进入大括号的瞬间，<strong>直接把当前的执政权（<code>this</code>）借调给目标对象</strong>？让开发者在括号里感觉就在对象内部写代码，任何属性直接赋值，彻底扔掉所有前缀！”
              </p>
            </div>
          </div>

          <div class="kt-sc-code-box">
            <div class="kt-code-header">
              <span class="kt-code-tab">代码实现</span>
            </div>
            <pre class="kt-code-pre"><code><span class="kt-c-k">fun</span> <span class="kt-c-f">setupClient</span>(block: <span class="kt-c-t">Config</span>.() -&gt; <span class="kt-c-t">Unit</span>): <span class="kt-c-t">Config</span> = <span class="kt-c-t">Config</span>().<span class="kt-c-f">apply</span>(block)

<span class="kt-c-m">// 调用端：清晰的声明式树形结构，0 个多余前缀</span>
<span class="kt-c-k">val</span> client = <span class="kt-c-f">setupClient</span> {
  baseUrl = <span class="kt-c-s">"https://api.domain.com"</span>
  timeoutMs = <span class="kt-c-n">5000</span>
  <span class="kt-c-f">header</span>(<span class="kt-c-s">"Token"</span>, <span class="kt-c-s">"xyz"</span>)
}</code></pre>
          </div>

          <div class="kt-sc-footer-grid">
            <div class="kt-sc-foot-item">
              <span class="kt-foot-badge">底层实现</span>
              <span>编译器将闭包编译为接收目标实例作为首个入参的函数，并在字节码级别将其绑定为方法体内的 <code>this</code>。</span>
            </div>
            <div class="kt-sc-foot-item">
              <span class="kt-foot-badge">典型场景</span>
              <span>Jetpack Compose 组件树声明、标准库 <code>.apply { ... }</code>、Gradle KTS 脚本、Ktor 路由配置。</span>
            </div>
          </div>
        </article>

        <!-- CARD 05 -->
        <article class="kt-story-card border-rose">
          <div class="kt-sc-header">
            <div class="kt-sc-title-wrap">
              <span class="kt-sc-badge num-rose">05</span>
              <div class="kt-sc-headings">
                <h4 class="kt-sc-title">内联优化 (inline)</h4>
                <span class="kt-sc-metaphor">“替身代打与就地拆包装——高级抽象不给运行时交‘中介费’”</span>
              </div>
            </div>
          </div>

          <div class="kt-sc-body-grid">
            <div class="kt-sc-box box-pain">
              <div class="kt-box-label label-pain">历史问题</div>
              <p class="kt-box-text">
                把函数当作参数传递（高阶函数）非常优雅，但 JVM 底层根本没有“函数对象”。每次你传一个 Lambda，底层都会在堆内存里偷偷 <code>new</code> 一个匿名内部类对象（如 <code>Function1</code>）。<br>
                若在渲染帧循环或高频循环中调用高阶函数，一瞬间就会生成上万个短命的小对象，把 JVM 垃圾回收器（GC）累瘫，直接导致应用卡顿掉帧。
              </p>
            </div>

            <div class="kt-sc-box box-idea">
              <div class="kt-box-label label-idea">设计思路</div>
              <p class="kt-box-text">
                “我们追求高级语言的整洁优雅，但绝不能为它支付运行时的内存与 GC 罚单。既然函数体很短小，能不能**在编译期间直接把函数体和 Lambda 代码拆开，原封不动复制粘贴到调用的现场**？这样字节码里完全没有函数调用栈，也没有任何对象分配！”
              </p>
            </div>
          </div>

          <div class="kt-sc-code-box">
            <div class="kt-code-header">
              <span class="kt-code-tab">代码实现</span>
            </div>
            <pre class="kt-code-pre"><code><span class="kt-c-k">inline fun</span> &lt;<span class="kt-c-t">T</span>&gt; <span class="kt-c-f">measureTime</span>(block: () -&gt; <span class="kt-c-t">T</span>): <span class="kt-c-t">T</span> {
  <span class="kt-c-k">val</span> t0 = <span class="kt-c-t">System</span>.<span class="kt-c-f">nanoTime</span>(); <span class="kt-c-k">val</span> res = <span class="kt-c-f">block</span>()
  <span class="kt-c-t">Log</span>.<span class="kt-c-f">d</span>(<span class="kt-c-s">"PERF"</span>, <span class="kt-c-s">"耗时: \${System.nanoTime() - t0}"</span>); <span class="kt-c-k">return</span> res
}
<span class="kt-c-m">// 调用处编译后：代码就地平铺展开，0 对象分配，并支持从闭包中直接 return 外层函数</span></code></pre>
          </div>

          <div class="kt-sc-footer-grid">
            <div class="kt-sc-foot-item">
              <span class="kt-foot-badge">底层实现</span>
              <span>编译期字节码就地内嵌展开。若参数需保存/延迟执行则标 <code>noinline</code>；若跨线程执行则标 <code>crossinline</code>。</span>
            </div>
            <div class="kt-sc-foot-item">
              <span class="kt-foot-badge">典型场景</span>
              <span>集合全量操作符（<code>forEach</code>、<code>map</code>、<code>filter</code>）、并发锁 <code>synchronized(lock) { }</code>。</span>
            </div>
          </div>
        </article>

        <!-- CARD 06 -->
        <article class="kt-story-card border-cyan">
          <div class="kt-sc-header">
            <div class="kt-sc-title-wrap">
              <span class="kt-sc-badge num-cyan">06</span>
              <div class="kt-sc-headings">
                <h4 class="kt-sc-title">泛型具现化 (reified)</h4>
                <span class="kt-sc-metaphor">“借东风——让内联展开把调用现场的真实类型直接‘焊死’在代码里”</span>
              </div>
            </div>
          </div>

          <div class="kt-sc-body-grid">
            <div class="kt-sc-box box-pain">
              <div class="kt-box-label label-pain">历史问题</div>
              <p class="kt-box-text">
                Java 为了向后兼容搞了“类型擦除”，代码里的 <code>List&lt;String&gt;</code> 到了运行时全变成了 <code>Object</code>。<br>
                这导致通用泛型函数寸步难行：想判断类型写 <code>if (item is T)</code> ➔ 编译报错；想拿类型做反序列化写 <code>T::class.java</code> ➔ 编译报错。<br>
                大家不得不逼着每次调用时都额外传一个难看且多余的参数 <code>clazz: Class&lt;T&gt;</code>。
              </p>
            </div>

            <div class="kt-sc-box box-idea">
              <div class="kt-box-label label-idea">设计思路</div>
              <p class="kt-box-text">
                “既然第 5 点里我们已经有了 <code>inline</code>（函数会直接被拆开复制到调用的那一行代码），那么在调用发生的瞬间，<strong>调用方传进来的是什么具体类型，编译器在编译那一刻看得一清二楚！</strong> 既然看得清，编译器顺手把真实类型的 Class 指令焊死写入展开的代码里不就行了？”
              </p>
            </div>
          </div>

          <div class="kt-sc-code-box">
            <div class="kt-code-header">
              <span class="kt-code-tab">代码实现</span>
            </div>
            <pre class="kt-code-pre"><code><span class="kt-c-k">inline fun</span> &lt;<span class="kt-c-k">reified</span> <span class="kt-c-t">T</span> : <span class="kt-c-t">Activity</span>&gt; <span class="kt-c-t">Context</span>.<span class="kt-c-f">start</span>() {
  <span class="kt-c-f">startActivity</span>(<span class="kt-c-t">Intent</span>(<span class="kt-c-k">this</span>, <span class="kt-c-t">T</span>::<span class="kt-c-k">class</span>.java)) <span class="kt-c-m">// 直接用 T::class.java</span>
}

<span class="kt-c-m">// 调用端优雅至极，免传任何 Class&lt;T&gt; 参数：</span>
context.<span class="kt-c-f">start</span>&lt;<span class="kt-c-t">DetailActivity</span>&gt;()
<span class="kt-c-k">val</span> dogs: <span class="kt-c-t">List</span>&lt;<span class="kt-c-t">Dog</span>&gt; = mixedList.<span class="kt-c-f">filterIsInstance</span>&lt;<span class="kt-c-t">Dog</span>&gt;()</code></pre>
          </div>

          <div class="kt-sc-footer-grid">
            <div class="kt-sc-foot-item">
              <span class="kt-foot-badge">底层实现</span>
              <span>代码展开到调用点时，编译器直接生成具体类型的字节码指令（如 <code>Ldc [DetailActivity.class]</code>），突破运行时擦除。</span>
            </div>
            <div class="kt-sc-foot-item">
              <span class="kt-foot-badge">典型场景</span>
              <span>页面跳转路由 <code>startActivity&lt;T&gt;()</code>、Gson 泛型解析 <code>fromJson&lt;T&gt;()</code>、<code>filterIsInstance&lt;T&gt;()</code>。</span>
            </div>
          </div>
        </article>

      </div>

    </div>
  `;
}
