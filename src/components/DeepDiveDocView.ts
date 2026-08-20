import { deepDiveDomains } from '../data/deep-dive-data';
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

  // If "all" or "home" is selected: Render the Full Platform Overview (5 Domains)
  if (currentStageId === 'all' || currentStageId === 'home') {
    renderPlatformOverview(container, platform, onSelectStage, onNavigateRoadmapStage);
    return container;
  }

  // Otherwise: Render the specific domain deep dive documentation
  const domain = deepDiveDomains.find((d) => d.id === currentStageId) || deepDiveDomains[0];
  const domainIndex = deepDiveDomains.findIndex((d) => d.id === domain.id);
  const modules: DeepDiveModule[] = platform === 'android' ? domain.deepDive.android : domain.deepDive.ios;

  const platformName = platform === 'android' ? 'Android' : 'iOS';
  const platformColor = platform === 'android' ? 'var(--color-android)' : 'var(--color-ios)';

  // 1. Domain Detail Header
  const header = document.createElement('div');
  header.className = 'stage-detail-header';
  header.innerHTML = `
    <div class="stage-detail-meta">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        <span class="chip chip-main" style="background:${platform === 'android' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(14, 165, 233, 0.15)'};color:${platformColor};font-weight:700;border:1px solid ${platformColor};">
          ${platform === 'android' ? '🟢 Android 单端深度进阶' : '🔵 iOS 单端深度进阶'}
        </span>
        <span class="chip chip-main">
          领域 ${String(domain.number).padStart(2, '0')}
        </span>
      </div>
      <span class="stage-number-large">${String(domain.number).padStart(2, '0')}</span>
    </div>

    <h1 class="stage-title">${String(domain.number).padStart(2, '0')}. ${i18n.t(domain.titleKey)} · ${platformName} 底层内幕</h1>
    <p class="stage-goal">
      聚焦 ${platformName} 平台在该领域最核心的底层运行机制、编译器优化、架构模式与实战生产规范。
    </p>
  `;
  container.appendChild(header);

  // 2. Deep Dive Modules List
  const modulesSection = document.createElement('div');
  modulesSection.className = 'deep-dive-stage-section';

  if (modules.length === 0) {
    modulesSection.innerHTML = `
      <div class="empty-state">
        <p>暂无该领域 ${platformName} 深度进阶内容</p>
      </div>
    `;
  } else {
    const cardsGrid = document.createElement('div');
    cardsGrid.className = 'deep-dive-cards-grid';

    modules.forEach((mod, mIdx) => {
      const card = document.createElement('div');
      card.className = 'deep-dive-card';

      let snippetHtml = '';
      if (mod.codeSnippet) {
        const langLabel = mod.codeSnippet.includes('//') ? 'Swift / Kotlin' : 'Config / CLI';
        snippetHtml = `
          <div class="deep-dive-code-block">
            <div class="code-block-header">
              <span class="code-block-lang">${langLabel}</span>
              <button class="code-copy-btn" id="btn-copy-${mIdx}" title="复制代码">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                <span>${i18n.t('detail.deepdive.copy')}</span>
              </button>
            </div>
            <pre class="deep-dive-pre"><code>${escapeHtml(mod.codeSnippet)}</code></pre>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="deep-dive-card-header">
          <span class="deep-dive-tag" style="background:${platform === 'android' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(14, 165, 233, 0.12)'};color:${platformColor};border-color:${platform === 'android' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(14, 165, 233, 0.3)'};">
            ${mod.tag}
          </span>
          <h3 class="deep-dive-card-title">${mod.title}</h3>
        </div>
        <p class="deep-dive-explanation">${mod.explanation}</p>
        ${snippetHtml}
      `;

      if (mod.codeSnippet) {
        const copyBtn = card.querySelector(`#btn-copy-${mIdx}`) as HTMLButtonElement;
        copyBtn?.addEventListener('click', () => {
          navigator.clipboard.writeText(mod.codeSnippet || '');
          const span = copyBtn.querySelector('span');
          if (span) {
            const original = span.textContent;
            span.textContent = i18n.t('detail.deepdive.copied');
            setTimeout(() => { span.textContent = original; }, 2000);
          }
        });
      }

      cardsGrid.appendChild(card);
    });

    modulesSection.appendChild(cardsGrid);
  }
  container.appendChild(modulesSection);

  // 3. Domain Bottom Navigator & Roadmap Cross-Reference
  const navFooter = document.createElement('div');
  navFooter.className = 'stage-nav-footer';

  const prevDomain = domainIndex > 0 ? deepDiveDomains[domainIndex - 1] : null;
  const nextDomain = domainIndex < deepDiveDomains.length - 1 ? deepDiveDomains[domainIndex + 1] : null;

  navFooter.innerHTML = `
    <div class="stage-nav-buttons">
      ${prevDomain ? `<button class="btn btn-secondary btn-sm" id="btn-prev-stage">← ${String(prevDomain.number).padStart(2, '0')}. ${i18n.t(prevDomain.titleKey)}</button>` : '<div></div>'}
      <button class="btn btn-primary btn-sm" id="btn-jump-roadmap" style="background:var(--color-surface);color:var(--color-accent);border:1px solid var(--color-accent);">
        🗺️ 查看双端 16 阶段路线图 ➔
      </button>
      ${nextDomain ? `<button class="btn btn-secondary btn-sm" id="btn-next-stage">${String(nextDomain.number).padStart(2, '0')}. ${i18n.t(nextDomain.titleKey)} →</button>` : '<div></div>'}
    </div>
  `;

  if (prevDomain) {
    navFooter.querySelector('#btn-prev-stage')?.addEventListener('click', () => {
      onSelectStage(prevDomain.id);
    });
  }
  if (nextDomain) {
    navFooter.querySelector('#btn-next-stage')?.addEventListener('click', () => {
      onSelectStage(nextDomain.id);
    });
  }
  navFooter.querySelector('#btn-jump-roadmap')?.addEventListener('click', () => {
    onNavigateRoadmapStage('home');
  });

  container.appendChild(navFooter);

  return container;
}

/**
 * Renders the high-level platform deep dive overview matrix (5 Domains).
 */
function renderPlatformOverview(
  container: HTMLElement,
  platform: 'android' | 'ios',
  onSelectStage: (stageId: string) => void,
  onNavigateRoadmapStage: (stageId: string) => void
) {
  const platformName = platform === 'android' ? 'Android' : 'iOS';

  // Count total deep dive modules across the 5 domains
  let totalModules = 0;
  deepDiveDomains.forEach((d) => {
    const mods = platform === 'android' ? d.deepDive.android : d.deepDive.ios;
    totalModules += mods.length;
  });

  // Hero Section
  const hero = document.createElement('div');
  hero.className = 'deep-dive-portal-hero';
  hero.innerHTML = `
    <div class="portal-badge-wrap">
      <span class="portal-hero-badge" style="${platform === 'android' ? 'color:#059669;background:#10b98115;border-color:#10b98133;' : 'color:#0284c7;background:#0ea5e915;border-color:#0ea5e933;'}">
        ${platform === 'android' ? '🟢 Android 平台深度进阶' : '🔵 iOS 平台深度进阶'}
      </span>
      <span class="portal-hero-subtag">${totalModules} 项底层专题 · 5 大工业级领域</span>
    </div>
    <h1 class="portal-hero-title">${platformName} 单端底层运行内幕与高级调优</h1>
    <p class="portal-hero-desc">
      ${platform === 'android'
        ? '深挖 Android 底层运行原理：从 Kotlin 协程 K1/K2 状态机、JVM/ART 垃圾回收、Compose Slot Table 插槽表与重组优化，到 MVI 单向数据流、Perfetto 链路分析、Baseline Profiles 预编译、OpenGL ES/MediaCodec 管线与 Google Play Billing v6+ 出海订阅。'
        : '深挖 iOS 底层运行原理：从 Swift 并发 Actor 隔离与 Task 树、Swift 内存布局与 COW、SwiftUI AttributeGraph 属性图，到 TCA 状态机、MetricKit 性能度量、Metal 图形渲染、VideoToolbox 硬编解码与 Apple StoreKit 2 全球订阅。'
      }
    </p>
  `;
  container.appendChild(hero);

  // Overview Domains Grid
  const gridSection = document.createElement('div');
  gridSection.className = 'portal-modules-list';

  deepDiveDomains.forEach((domain) => {
    const modules = platform === 'android' ? domain.deepDive.android : domain.deepDive.ios;
    if (modules.length === 0) return;

    const domainGroup = document.createElement('section');
    domainGroup.className = 'portal-stage-group';

    const groupHeader = document.createElement('div');
    groupHeader.className = 'portal-stage-header';
    groupHeader.innerHTML = `
      <div class="portal-stage-title-wrap">
        <span class="portal-stage-num">${String(domain.number).padStart(2, '0')}</span>
        <h2 class="portal-stage-title">${i18n.t(domain.titleKey)}</h2>
      </div>
      <span class="portal-stage-count-badge" style="font-size:11.5px;color:var(--color-ink-muted);background:var(--color-surface-sunken);padding:2px 8px;border-radius:10px;border:1px solid var(--color-border);">${modules.length} 项进阶</span>
    `;
    domainGroup.appendChild(groupHeader);

    // List of module cards within this domain
    const modulesGrid = document.createElement('div');
    modulesGrid.className = 'portal-stage-grid';

    modules.forEach((mod, mIdx) => {
      const isKeyImportant = mIdx < 2; // Top topics highlighted as core
      const card = document.createElement('div');
      card.className = 'portal-card';
      card.style.cursor = 'pointer';

      card.innerHTML = `
        <div class="portal-card-top">
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="portal-card-tag">${mod.tag}</span>
            <span class="portal-card-badge ${isKeyImportant ? 'badge-key' : 'badge-adv'}">
              ${isKeyImportant ? '⭐ 核心必会' : '💡 进阶拓展'}
            </span>
          </div>
          <span style="font-size:12px;color:var(--color-accent);font-weight:600;">进入 ➔</span>
        </div>
        <h3 class="portal-card-title">${mod.title}</h3>
        <p class="portal-card-desc">${mod.explanation}</p>
      `;

      card.addEventListener('click', () => {
        onSelectStage(domain.id);
      });

      modulesGrid.appendChild(card);
    });

    domainGroup.appendChild(modulesGrid);
    gridSection.appendChild(domainGroup);
  });

  container.appendChild(gridSection);

  // Bottom Navigator: Return to Roadmap
  const bottomFooter = document.createElement('div');
  bottomFooter.className = 'portal-bottom-footer';
  bottomFooter.style.marginTop = '40px';
  bottomFooter.style.paddingTop = '24px';
  bottomFooter.style.borderTop = '1px solid var(--color-border)';
  bottomFooter.style.textAlign = 'center';

  const returnBtn = document.createElement('button');
  returnBtn.className = 'btn btn-secondary';
  returnBtn.innerHTML = `🗺️ 返回 Android ⟷ iOS 双端 16 阶段路线图`;
  returnBtn.addEventListener('click', () => {
    onNavigateRoadmapStage('home');
  });

  bottomFooter.appendChild(returnBtn);
  container.appendChild(bottomFooter);
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
