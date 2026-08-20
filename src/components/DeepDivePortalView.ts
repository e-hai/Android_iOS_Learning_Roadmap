import { stages } from '../data/roadmap-data';
import { deepDivesData } from '../data/deep-dive-data';
import { DeepDiveModule } from '../models/types';
import { i18n } from '../services/i18n';

const STORAGE_PLATFORM_KEY = 'learning_deepdive_portal_platform';

export function renderDeepDivePortalView(
  onNavigateRoadmapStage: (stageId: string) => void,
  selectedStageId: string = 'all',
  onSelectStage?: (stageId: string) => void
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'deep-dive-portal-container';

  let currentPlatform: 'android' | 'ios' =
    (localStorage.getItem(STORAGE_PLATFORM_KEY) as 'android' | 'ios') || 'android';
  let currentStageFilter: string = selectedStageId || 'all';

  // 1. Hero Header
  const hero = document.createElement('div');
  hero.className = 'deep-dive-portal-hero';
  hero.innerHTML = `
    <div class="portal-badge-wrap">
      <span class="portal-hero-badge">🌊 深度进阶专区</span>
      <span class="portal-hero-subtag">Under the Hood & Performance</span>
    </div>
    <h1 class="portal-hero-title">Android 与 iOS 单端底层内幕与高级调优</h1>
    <p class="portal-hero-desc">
      独立深挖移动端底层运行机制。拒绝生硬强行对齐，立足各端最核心的真实内幕：从 JVM/ART 垃圾回收、Swift 内存布局、Compose 插槽表与重组稳定性，到 SwiftUI 属性依赖图、Kotlin 协程状态机、Swift Actor 隔离与系统签名体系。
    </p>
  `;
  container.appendChild(hero);

  // 2. Platform Switcher Tabs
  const totalAndroid = Object.values(deepDivesData).reduce((acc, cur) => acc + cur.android.length, 0);
  const totalIos = Object.values(deepDivesData).reduce((acc, cur) => acc + cur.ios.length, 0);

  const tabContainer = document.createElement('div');
  tabContainer.className = 'portal-platform-tabs';
  tabContainer.innerHTML = `
    <button class="portal-tab-btn btn-android ${currentPlatform === 'android' ? 'active' : ''}" id="portal-btn-android">
      <span class="platform-dot dot-android"></span>
      <span class="portal-tab-text">🟢 Android 平台深度进阶</span>
      <span class="tab-count-badge">${totalAndroid} 项内幕</span>
    </button>
    <button class="portal-tab-btn btn-ios ${currentPlatform === 'ios' ? 'active' : ''}" id="portal-btn-ios">
      <span class="platform-dot dot-ios"></span>
      <span class="portal-tab-text">🔵 iOS 平台深度进阶</span>
      <span class="tab-count-badge">${totalIos} 项内幕</span>
    </button>
  `;
  container.appendChild(tabContainer);

  // 3. Stage Quick Filter Bar
  const filterBar = document.createElement('div');
  filterBar.className = 'portal-filter-bar';
  container.appendChild(filterBar);

  function renderFilterPills() {
    filterBar.innerHTML = '';
    const allBtn = document.createElement('button');
    allBtn.className = `portal-filter-pill ${currentStageFilter === 'all' ? 'active' : ''}`;
    allBtn.textContent = `全部阶段 (16)`;
    allBtn.addEventListener('click', () => {
      currentStageFilter = 'all';
      if (onSelectStage) onSelectStage('all');
      renderFilterPills();
      renderContent();
    });
    filterBar.appendChild(allBtn);

    stages.forEach((stage) => {
      const data = deepDivesData[stage.id];
      const count = data ? (currentPlatform === 'android' ? data.android.length : data.ios.length) : 0;
      if (count === 0) return;

      const pill = document.createElement('button');
      pill.className = `portal-filter-pill ${currentStageFilter === stage.id ? 'active' : ''}`;
      pill.textContent = `${String(stage.number).padStart(2, '0')}. ${i18n.t(stage.titleKey)}`;
      pill.addEventListener('click', () => {
        currentStageFilter = stage.id;
        if (onSelectStage) onSelectStage(stage.id);
        renderFilterPills();
        renderContent();
      });
      filterBar.appendChild(pill);
    });
  }

  // 4. Modules List Container
  const listContainer = document.createElement('div');
  listContainer.className = 'portal-modules-list';
  container.appendChild(listContainer);

  function renderContent() {
    listContainer.innerHTML = '';

    const targetStages = currentStageFilter === 'all'
      ? stages
      : stages.filter((s) => s.id === currentStageFilter);

    targetStages.forEach((stage) => {
      const data = deepDivesData[stage.id];
      if (!data) return;

      const modules: DeepDiveModule[] = currentPlatform === 'android' ? data.android : data.ios;
      if (!modules || modules.length === 0) return;

      const stageGroup = document.createElement('section');
      stageGroup.className = 'portal-stage-group';

      // Group Header
      const groupHeader = document.createElement('div');
      groupHeader.className = 'portal-stage-header';
      groupHeader.innerHTML = `
        <div class="portal-stage-title-wrap">
          <span class="portal-stage-num">${String(stage.number).padStart(2, '0')}</span>
          <h2 class="portal-stage-title">${i18n.t(stage.titleKey)}</h2>
        </div>
        <button class="portal-jump-roadmap-btn" data-stage-id="${stage.id}" title="在双端路线图中查看对比">
          <span>查看对应双端对照 ➔</span>
        </button>
      `;

      groupHeader.querySelector('.portal-jump-roadmap-btn')?.addEventListener('click', () => {
        onNavigateRoadmapStage(stage.id);
      });

      stageGroup.appendChild(groupHeader);

      // Cards
      const cardsGrid = document.createElement('div');
      cardsGrid.className = 'deep-dive-cards-grid';

      modules.forEach((mod) => {
        const card = document.createElement('div');
        card.className = `deep-dive-card card-${currentPlatform}`;

        let codeHtml = '';
        if (mod.codeSnippet) {
          codeHtml = `
            <div class="deep-dive-code-block">
              <div class="code-block-header">
                <span class="code-block-lang">${currentPlatform === 'android' ? (mod.codeSnippet.startsWith('#') ? 'TERMINAL' : 'KOTLIN / GRADLE') : (mod.codeSnippet.startsWith('(') || mod.codeSnippet.startsWith('xcrun') || mod.codeSnippet.startsWith('codesign') ? 'TERMINAL / LLDB' : 'SWIFT')}</span>
                <button class="code-copy-btn" title="复制代码">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  <span>复制</span>
                </button>
              </div>
              <pre class="deep-dive-pre"><code>${escapeHtml(mod.codeSnippet)}</code></pre>
            </div>
          `;
        }

        card.innerHTML = `
          <div class="deep-dive-card-header">
            <span class="deep-dive-tag tag-${currentPlatform}">【${escapeHtml(mod.tag)}】</span>
            <h3 class="deep-dive-card-title">${escapeHtml(mod.title)}</h3>
          </div>
          <p class="deep-dive-card-desc">${escapeHtml(mod.explanation)}</p>
          ${codeHtml}
        `;

        if (mod.codeSnippet) {
          const copyBtn = card.querySelector('.code-copy-btn');
          if (copyBtn) {
            copyBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(mod.codeSnippet || '');
              const span = copyBtn.querySelector('span');
              if (span) {
                const original = span.textContent;
                span.textContent = '已复制 ✓';
                setTimeout(() => {
                  span.textContent = original;
                }, 2000);
              }
            });
          }
        }

        cardsGrid.appendChild(card);
      });

      stageGroup.appendChild(cardsGrid);
      listContainer.appendChild(stageGroup);
    });
  }

  // Initial render
  renderFilterPills();
  renderContent();

  // Tab Events
  const btnAndroid = tabContainer.querySelector('#portal-btn-android') as HTMLButtonElement;
  const btnIos = tabContainer.querySelector('#portal-btn-ios') as HTMLButtonElement;

  btnAndroid.addEventListener('click', () => {
    if (currentPlatform === 'android') return;
    currentPlatform = 'android';
    localStorage.setItem(STORAGE_PLATFORM_KEY, 'android');
    btnAndroid.classList.add('active');
    btnIos.classList.remove('active');
    renderFilterPills();
    renderContent();
  });

  btnIos.addEventListener('click', () => {
    if (currentPlatform === 'ios') return;
    currentPlatform = 'ios';
    localStorage.setItem(STORAGE_PLATFORM_KEY, 'ios');
    btnIos.classList.add('active');
    btnAndroid.classList.remove('active');
    renderFilterPills();
    renderContent();
  });

  return container;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
