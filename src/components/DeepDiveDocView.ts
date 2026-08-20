import { stages } from '../data/roadmap-data';
import { deepDivesData } from '../data/deep-dive-data';
import { DeepDiveModule } from '../models/types';
import { i18n } from '../services/i18n';

export function renderDeepDiveDocView(
  currentStageId: string,
  platform: 'android' | 'ios',
  onSelectStage: (stageId: string) => void,
  onNavigateRoadmapStage: (stageId: string) => void
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'content-container deep-dive-doc-container';

  // If "all" or "home" is selected: Render the Full Platform Overview
  if (currentStageId === 'all' || currentStageId === 'home') {
    renderPlatformOverview(container, platform, onSelectStage, onNavigateRoadmapStage);
    return container;
  }

  // Otherwise: Render the specific stage deep dive documentation
  const stage = stages.find((s) => s.id === currentStageId) || stages[0];
  const stageIndex = stages.findIndex((s) => s.id === stage.id);
  const data = deepDivesData[stage.id];
  const modules: DeepDiveModule[] = data ? (platform === 'android' ? data.android : data.ios) : [];

  const platformName = platform === 'android' ? 'Android' : 'iOS';
  const platformColor = platform === 'android' ? 'var(--color-android)' : 'var(--color-ios)';

  // 1. Stage Detail Header
  const header = document.createElement('div');
  header.className = 'stage-detail-header';
  header.innerHTML = `
    <div class="stage-detail-meta">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        <span class="chip ${platform === 'android' ? 'chip-main' : 'chip-advanced'}" style="background:${platform === 'android' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(14, 165, 233, 0.15)'};color:${platformColor};font-weight:700;border:1px solid ${platformColor};">
          ${platform === 'android' ? '🟢 Android 单端深度进阶' : '🔵 iOS 单端深度进阶'}
        </span>
        <span class="chip ${stage.isAdvanced ? 'chip-advanced' : 'chip-main'}">
          ${stage.isAdvanced ? i18n.t('badge.advanced') : i18n.t('badge.main')}
        </span>
      </div>
      <span class="stage-number-large">${String(stage.number).padStart(2, '0')}</span>
    </div>

    <h1 class="stage-title">${String(stage.number).padStart(2, '0')}. ${i18n.t(stage.titleKey)} · ${platformName} 底层内幕</h1>
    <p class="stage-goal">
      聚焦 ${platformName} 平台在该阶段最关键的底层运行机制、编译器优化、内存与并发模型、以及实战性能调优利器。
    </p>
  `;
  container.appendChild(header);

  // 2. Deep Dive Modules List
  const modulesSection = document.createElement('div');
  modulesSection.className = 'deep-dive-stage-section';

  if (modules.length === 0) {
    modulesSection.innerHTML = `
      <div class="empty-state">
        <p>暂无该阶段 ${platformName} 深度进阶内容</p>
      </div>
    `;
  } else {
    const cardsGrid = document.createElement('div');
    cardsGrid.className = 'deep-dive-cards-grid';

    modules.forEach((mod) => {
      const card = document.createElement('div');
      card.className = `deep-dive-card card-${platform}`;

      let codeHtml = '';
      if (mod.codeSnippet) {
        const langLabel = platform === 'android'
          ? (mod.codeSnippet.startsWith('#') ? 'TERMINAL' : 'KOTLIN / GRADLE')
          : (mod.codeSnippet.startsWith('(') || mod.codeSnippet.startsWith('xcrun') || mod.codeSnippet.startsWith('codesign') ? 'TERMINAL / LLDB' : 'SWIFT');

        codeHtml = `
          <div class="deep-dive-code-block">
            <div class="code-block-header">
              <span class="code-block-lang">${langLabel}</span>
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
          <span class="deep-dive-tag tag-${platform}">【${escapeHtml(mod.tag)}】</span>
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

    modulesSection.appendChild(cardsGrid);
  }
  container.appendChild(modulesSection);

  // 3. Stage Bottom Navigator & Roadmap Cross-Reference
  const navFooter = document.createElement('div');
  navFooter.className = 'stage-nav-footer';

  const prevStage = stageIndex > 0 ? stages[stageIndex - 1] : null;
  const nextStage = stageIndex < stages.length - 1 ? stages[stageIndex + 1] : null;

  navFooter.innerHTML = `
    <div class="stage-nav-buttons">
      ${prevStage ? `<button class="btn btn-secondary btn-sm" id="btn-prev-stage">← ${String(prevStage.number).padStart(2, '0')}. ${i18n.t(prevStage.titleKey)}</button>` : '<div></div>'}
      <button class="btn btn-primary btn-sm" id="btn-jump-roadmap" style="background:var(--color-surface);color:var(--color-accent);border:1px solid var(--color-accent);">
        🗺️ 查看该阶段双端横向对照 ➔
      </button>
      ${nextStage ? `<button class="btn btn-secondary btn-sm" id="btn-next-stage">${String(nextStage.number).padStart(2, '0')}. ${i18n.t(nextStage.titleKey)} →</button>` : '<div></div>'}
    </div>
  `;

  if (prevStage) {
    navFooter.querySelector('#btn-prev-stage')?.addEventListener('click', () => {
      onSelectStage(prevStage.id);
    });
  }
  if (nextStage) {
    navFooter.querySelector('#btn-next-stage')?.addEventListener('click', () => {
      onSelectStage(nextStage.id);
    });
  }
  navFooter.querySelector('#btn-jump-roadmap')?.addEventListener('click', () => {
    onNavigateRoadmapStage(stage.id);
  });

  container.appendChild(navFooter);

  return container;
}

function renderPlatformOverview(
  container: HTMLElement,
  platform: 'android' | 'ios',
  onSelectStage: (stageId: string) => void,
  onNavigateRoadmapStage: (stageId: string) => void
) {
  const platformName = platform === 'android' ? 'Android' : 'iOS';
  const totalModules = Object.values(deepDivesData).reduce((acc, cur) => acc + (platform === 'android' ? cur.android.length : cur.ios.length), 0);

  const hero = document.createElement('div');
  hero.className = 'deep-dive-portal-hero';
  hero.innerHTML = `
    <div class="portal-badge-wrap">
      <span class="portal-hero-badge" style="${platform === 'android' ? 'color:#059669;background:#10b98115;border-color:#10b98133;' : 'color:#0284c7;background:#0ea5e915;border-color:#0ea5e933;'}">
        ${platform === 'android' ? '🟢 Android 平台深度进阶' : '🔵 iOS 平台深度进阶'}
      </span>
      <span class="portal-hero-subtag">${totalModules} 项底层内幕与高级调优</span>
    </div>
    <h1 class="portal-hero-title">${platformName} 单端底层运行内幕与高级调优</h1>
    <p class="portal-hero-desc">
      ${platform === 'android'
        ? '深挖 Android 移动端底层内幕：从 JVM/ART 垃圾回收、LeakCanary 内存探测、Compose Slot Table 插槽表与重组稳定性，到 Kotlin 协程 CPS 状态机、OkHttp 连接池复用、Room InvalidationTracker 源码原理与 R8/ProGuard 混淆优化。'
        : '深挖 iOS 移动端底层内幕：从 Swift 内存布局与 Copy-On-Write、ARC 引用计数与 Side Table、SwiftUI AttributeGraph 属性图与依赖追踪，到 Swift 严格并发 Actor 隔离、URLSession 后台守护进程、SwiftData 多线程 ModelContext 与 Apple 签名证书体系。'
      }
    </p>
  `;
  container.appendChild(hero);

  // Overview Stages Grid
  const gridSection = document.createElement('div');
  gridSection.className = 'portal-modules-list';

  stages.forEach((stage) => {
    const data = deepDivesData[stage.id];
    if (!data) return;
    const modules = platform === 'android' ? data.android : data.ios;
    if (modules.length === 0) return;

    const stageGroup = document.createElement('section');
    stageGroup.className = 'portal-stage-group';

    const groupHeader = document.createElement('div');
    groupHeader.className = 'portal-stage-header';
    groupHeader.innerHTML = `
      <div class="portal-stage-title-wrap">
        <span class="portal-stage-num">${String(stage.number).padStart(2, '0')}</span>
        <h2 class="portal-stage-title">${i18n.t(stage.titleKey)}</h2>
        <span style="font-size:12px;color:var(--color-ink-muted);margin-left:6px;">(${modules.length} 项进阶)</span>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <button class="portal-jump-stage-btn" data-stage-id="${stage.id}" style="font-size:12px;font-weight:600;color:var(--color-accent);background:var(--color-accent-soft);border:none;padding:3px 8px;border-radius:4px;cursor:pointer;">
          进入本阶段进阶 ➔
        </button>
        <button class="portal-jump-roadmap-btn" data-stage-id="${stage.id}" title="在双端路线图中查看对比">
          <span>查看双端对照 ➔</span>
        </button>
      </div>
    `;

    groupHeader.querySelector('.portal-jump-stage-btn')?.addEventListener('click', () => {
      onSelectStage(stage.id);
    });
    groupHeader.querySelector('.portal-jump-roadmap-btn')?.addEventListener('click', () => {
      onNavigateRoadmapStage(stage.id);
    });

    stageGroup.appendChild(groupHeader);

    // Cards Grid for Overview
    const cardsGrid = document.createElement('div');
    cardsGrid.className = 'deep-dive-cards-grid';

    modules.forEach((mod) => {
      const card = document.createElement('div');
      card.className = `deep-dive-card card-${platform}`;

      let codeHtml = '';
      if (mod.codeSnippet) {
        const langLabel = platform === 'android'
          ? (mod.codeSnippet.startsWith('#') ? 'TERMINAL' : 'KOTLIN / GRADLE')
          : (mod.codeSnippet.startsWith('(') || mod.codeSnippet.startsWith('xcrun') || mod.codeSnippet.startsWith('codesign') ? 'TERMINAL / LLDB' : 'SWIFT');

        codeHtml = `
          <div class="deep-dive-code-block">
            <div class="code-block-header">
              <span class="code-block-lang">${langLabel}</span>
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
          <span class="deep-dive-tag tag-${platform}">【${escapeHtml(mod.tag)}】</span>
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
    gridSection.appendChild(stageGroup);
  });

  container.appendChild(gridSection);
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
