import { deepDiveDomains } from '../data/deep-dive-data';
import { DeepDiveDomain, DeepDiveModule } from '../models/types';
import { i18n } from '../services/i18n';

export function renderDeepDiveDocView(
  currentStageId: string,
  platform: 'android' | 'ios',
  onSelectStage: (stageId: string) => void
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'content-container deep-dive-doc-container';

  // 1. Full Platform Overview (All 5 Domains)
  if (currentStageId === 'all' || currentStageId === 'home') {
    renderPlatformOverview(container, platform, onSelectStage);
    return container;
  }

  // 2. Parse Domain ID and Chapter Index
  let domainId = currentStageId;
  let chapterIndex: number | null = null;

  if (currentStageId.includes(':')) {
    const parts = currentStageId.split(':');
    domainId = parts[0];
    const parsedIdx = parseInt(parts[1], 10);
    if (!isNaN(parsedIdx)) {
      chapterIndex = parsedIdx;
    }
  }

  const domain = deepDiveDomains.find((d) => d.id === domainId) || deepDiveDomains[0];
  const modules: DeepDiveModule[] = platform === 'android' ? domain.deepDive.android : domain.deepDive.ios;

  // 3. If a specific chapter index is specified, render the Single Chapter Page
  if (chapterIndex !== null && chapterIndex >= 0 && chapterIndex < modules.length) {
    renderSingleChapterView(container, domain, chapterIndex, modules, platform, onSelectStage);
    return container;
  }

  // 4. Otherwise, render the Domain Table of Contents (大纲概览页)
  renderDomainTocView(container, domain, modules, platform, onSelectStage);
  return container;
}

/**
 * Renders a single, focused Knowledge Point (Chapter) page.
 */
function renderSingleChapterView(
  container: HTMLElement,
  domain: DeepDiveDomain,
  chapterIndex: number,
  modules: DeepDiveModule[],
  platform: 'android' | 'ios',
  onSelectStage: (stageId: string) => void
) {
  const mod = modules[chapterIndex];
  const domainIndex = deepDiveDomains.findIndex((d) => d.id === domain.id);
  const totalChapters = modules.length;
  const chapterNumberStr = String(chapterIndex + 1).padStart(2, '0');
  const totalChaptersStr = String(totalChapters).padStart(2, '0');

  // Chapter Header (Clean title only)
  const header = document.createElement('div');
  header.className = 'stage-detail-header chapter-page-header';
  header.innerHTML = `
    <h1 class="stage-title" style="font-size:26px;margin-top:4px;">${mod.title}</h1>
  `;
  container.appendChild(header);

  // Section 1: Core Mechanism & Principle Analysis
  const principleSection = document.createElement('section');
  principleSection.className = 'chapter-content-section';
  principleSection.innerHTML = `
    <div class="section-header">
      <div class="section-header-bar ${platform === 'ios' ? 'ios-bar' : ''}"></div>
      <h2 class="section-header-title">一、底层运行机制与核心原理</h2>
    </div>
    <div class="chapter-card-box">
      <p class="chapter-explanation-p">${mod.explanation}</p>
    </div>
  `;
  container.appendChild(principleSection);

  // Section 2: Production Code / Implementation
  if (mod.codeSnippet) {
    const codeSection = document.createElement('section');
    codeSection.className = 'chapter-content-section';
    const langLabel = mod.codeSnippet.startsWith('#') || mod.codeSnippet.startsWith('adb')
      ? 'SHELL / CLI'
      : (platform === 'android' ? 'KOTLIN / GRADLE' : 'SWIFT / XCODE');

    codeSection.innerHTML = `
      <div class="section-header" style="margin-top:24px;">
        <div class="section-header-bar ${platform === 'ios' ? 'ios-bar' : ''}"></div>
        <h2 class="section-header-title">二、工业级源码实现与实战规范</h2>
      </div>
      <div class="deep-dive-code-block">
        <div class="code-block-header">
          <span class="code-block-lang">${langLabel}</span>
          <button class="code-copy-btn" id="btn-copy-chapter-code" title="复制代码">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span>${i18n.t('detail.deepdive.copy')}</span>
          </button>
        </div>
        <pre class="deep-dive-pre"><code>${escapeHtml(mod.codeSnippet)}</code></pre>
      </div>
    `;

    const copyBtn = codeSection.querySelector('#btn-copy-chapter-code') as HTMLButtonElement;
    copyBtn?.addEventListener('click', () => {
      navigator.clipboard.writeText(mod.codeSnippet || '');
      const span = copyBtn.querySelector('span');
      if (span) {
        const original = span.textContent;
        span.textContent = i18n.t('detail.deepdive.copied');
        setTimeout(() => { span.textContent = original; }, 2000);
      }
    });

    container.appendChild(codeSection);
  }

  // Chapter Navigation Footer (Prev / Next Chapter)
  const navFooter = document.createElement('div');
  navFooter.className = 'stage-nav-footer chapter-nav-footer';

  const prevChapter = chapterIndex > 0 ? modules[chapterIndex - 1] : null;
  const nextChapter = chapterIndex < totalChapters - 1 ? modules[chapterIndex + 1] : null;

  const prevDomain = domainIndex > 0 ? deepDiveDomains[domainIndex - 1] : null;
  const nextDomain = domainIndex < deepDiveDomains.length - 1 ? deepDiveDomains[domainIndex + 1] : null;

  let prevBtnHtml = '<div></div>';
  if (prevChapter) {
    prevBtnHtml = `<button class="btn btn-secondary btn-sm" id="btn-prev-chap">← 上一节: ${prevChapter.tag} · ${truncateText(prevChapter.title, 14)}</button>`;
  } else if (prevDomain) {
    prevBtnHtml = `<button class="btn btn-secondary btn-sm" id="btn-prev-chap">← 上一领域: ${i18n.t(prevDomain.titleKey)}</button>`;
  }

  let nextBtnHtml = '<div></div>';
  if (nextChapter) {
    nextBtnHtml = `<button class="btn btn-primary btn-sm" id="btn-next-chap">下一节: ${nextChapter.tag} · ${truncateText(nextChapter.title, 14)} →</button>`;
  } else if (nextDomain) {
    nextBtnHtml = `<button class="btn btn-primary btn-sm" id="btn-next-chap">下一领域: ${i18n.t(nextDomain.titleKey)} →</button>`;
  } else {
    nextBtnHtml = `<button class="btn btn-primary btn-sm" id="btn-finish-all">🎉 完成全部领域学习 ➔</button>`;
  }

  navFooter.innerHTML = `
    <div class="stage-nav-buttons">
      ${prevBtnHtml}
      <button class="btn btn-secondary btn-sm" id="btn-toc-jump" style="background:var(--color-surface);border:1px solid var(--color-border);">
        📋 本领域大纲 (${chapterNumberStr}/${totalChaptersStr})
      </button>
      ${nextBtnHtml}
    </div>
  `;

  // Attach navigation listeners
  if (prevChapter) {
    navFooter.querySelector('#btn-prev-chap')?.addEventListener('click', () => onSelectStage(`${domain.id}:${chapterIndex - 1}`));
  } else if (prevDomain) {
    const prevDomainMods = platform === 'android' ? prevDomain.deepDive.android : prevDomain.deepDive.ios;
    navFooter.querySelector('#btn-prev-chap')?.addEventListener('click', () => onSelectStage(`${prevDomain.id}:${prevDomainMods.length - 1}`));
  }

  navFooter.querySelector('#btn-toc-jump')?.addEventListener('click', () => onSelectStage(domain.id));

  if (nextChapter) {
    navFooter.querySelector('#btn-next-chap')?.addEventListener('click', () => onSelectStage(`${domain.id}:${chapterIndex + 1}`));
  } else if (nextDomain) {
    navFooter.querySelector('#btn-next-chap')?.addEventListener('click', () => onSelectStage(`${nextDomain.id}:0`));
  } else {
    navFooter.querySelector('#btn-finish-all')?.addEventListener('click', () => onSelectStage('all'));
  }

  container.appendChild(navFooter);
}

/**
 * Renders the Domain Table of Contents (TOC) Page.
 */
function renderDomainTocView(
  container: HTMLElement,
  domain: DeepDiveDomain,
  modules: DeepDiveModule[],
  platform: 'android' | 'ios',
  onSelectStage: (stageId: string) => void
) {
  const domainIndex = deepDiveDomains.findIndex((d) => d.id === domain.id);
  const platformName = platform === 'android' ? 'Android' : 'iOS';
  const platformColor = platform === 'android' ? 'var(--color-android)' : 'var(--color-ios)';

  // Domain Header (Clean title only)
  const header = document.createElement('div');
  header.className = 'stage-detail-header';
  header.innerHTML = `
    <h1 class="stage-title">${i18n.t(domain.titleKey)} · ${platformName} 进阶大纲</h1>
  `;
  container.appendChild(header);

  // Chapter Cards Grid
  const tocSection = document.createElement('section');
  tocSection.className = 'domain-toc-section';
  tocSection.innerHTML = `
    <div class="section-header">
      <div class="section-header-bar ${platform === 'ios' ? 'ios-bar' : ''}"></div>
      <h2 class="section-header-title">领域章节目录清单</h2>
    </div>
  `;

  const cardsGrid = document.createElement('div');
  cardsGrid.className = 'domain-toc-grid';

  modules.forEach((mod, mIdx) => {
    const card = document.createElement('div');
    card.className = 'domain-toc-card';
    card.style.cursor = 'pointer';

    card.innerHTML = `
      <div class="domain-toc-card-header">
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="domain-toc-chap-num">第 ${String(mIdx + 1).padStart(2, '0')} 节</span>
          <span class="deep-dive-tag" style="background:${platform === 'android' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(14, 165, 233, 0.12)'};color:${platformColor};border:1px solid ${platform === 'android' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(14, 165, 233, 0.3)'};">
            ${mod.tag}
          </span>
        </div>
        <span class="domain-toc-enter-link" style="color:var(--color-accent);font-size:12px;font-weight:600;">进入 ➔</span>
      </div>
      <h3 class="domain-toc-card-title">${mod.title}</h3>
      <p class="domain-toc-card-desc">${truncateText(mod.explanation, 95)}</p>
    `;

    card.addEventListener('click', () => {
      onSelectStage(`${domain.id}:${mIdx}`);
    });

    cardsGrid.appendChild(card);
  });

  tocSection.appendChild(cardsGrid);
  container.appendChild(tocSection);

  // Bottom Navigator: Prev / Next Domain only
  const navFooter = document.createElement('div');
  navFooter.className = 'stage-nav-footer';

  const prevDomain = domainIndex > 0 ? deepDiveDomains[domainIndex - 1] : null;
  const nextDomain = domainIndex < deepDiveDomains.length - 1 ? deepDiveDomains[domainIndex + 1] : null;

  navFooter.innerHTML = `
    <div class="stage-nav-buttons">
      ${prevDomain ? `<button class="btn btn-secondary btn-sm" id="btn-prev-domain">← 上一领域: ${i18n.t(prevDomain.titleKey)}</button>` : '<div></div>'}
      ${nextDomain ? `<button class="btn btn-secondary btn-sm" id="btn-next-domain">下一领域: ${i18n.t(nextDomain.titleKey)} →</button>` : '<div></div>'}
    </div>
  `;

  if (prevDomain) {
    navFooter.querySelector('#btn-prev-domain')?.addEventListener('click', () => onSelectStage(prevDomain.id));
  }
  if (nextDomain) {
    navFooter.querySelector('#btn-next-domain')?.addEventListener('click', () => onSelectStage(nextDomain.id));
  }

  container.appendChild(navFooter);
}

/**
 * Renders the streamlined platform deep dive overview.
 * Clean, compact, easy to scan with only essential info.
 */
function renderPlatformOverview(
  container: HTMLElement,
  platform: 'android' | 'ios',
  onSelectStage: (stageId: string) => void
) {
  const platformName = platform === 'android' ? 'Android' : 'iOS';
  const platformColor = platform === 'android' ? '#10b981' : '#0ea5e9';

  // Count total chapters
  let totalModules = 0;
  deepDiveDomains.forEach((d) => {
    const mods = platform === 'android' ? d.deepDive.android : d.deepDive.ios;
    totalModules += mods.length;
  });

  // Concise Hero Section
  const hero = document.createElement('div');
  hero.className = 'deep-dive-portal-hero compact-portal-hero';
  hero.innerHTML = `
    <div class="portal-badge-wrap">
      <span class="portal-hero-badge" style="color:${platform === 'android' ? '#059669' : '#0284c7'};background:${platform === 'android' ? 'rgba(16,185,129,0.1)' : 'rgba(14,165,233,0.1)'};border-color:${platform === 'android' ? 'rgba(16,185,129,0.25)' : 'rgba(14,165,233,0.25)'};">
        ${platform === 'android' ? '🟢 Android' : '🔵 iOS'} 单端深度进阶
      </span>
      <span class="portal-hero-subtag">共 ${totalModules} 个独立进阶章节</span>
    </div>
    <h1 class="portal-hero-title" style="font-size:22px;">${platformName} 底层运行机制与实战手册</h1>
    <p class="portal-hero-desc" style="font-size:13.5px;">
      直击核心底层原理、编译器优化、工业级架构治理与出海商业化。点击任意章节独立研读。
    </p>
  `;
  container.appendChild(hero);

  // Compact Overview List
  const gridSection = document.createElement('div');
  gridSection.className = 'portal-modules-list compact-modules-list';

  deepDiveDomains.forEach((domain) => {
    const modules = platform === 'android' ? domain.deepDive.android : domain.deepDive.ios;
    if (modules.length === 0) return;

    const domainGroup = document.createElement('section');
    domainGroup.className = 'portal-stage-group';

    const groupHeader = document.createElement('div');
    groupHeader.className = 'portal-stage-header compact-stage-header';
    groupHeader.innerHTML = `
      <div class="portal-stage-title-wrap">
        <span class="portal-stage-num">${String(domain.number).padStart(2, '0')}</span>
        <h2 class="portal-stage-title" style="font-size:15.5px;">${i18n.t(domain.titleKey)}</h2>
        <span style="font-size:12px;color:var(--color-ink-muted);">(${modules.length} 节)</span>
      </div>
      <button class="btn btn-ghost btn-sm" id="btn-view-domain-toc-${domain.id}" style="color:var(--color-accent);font-weight:600;font-size:12px;padding:2px 8px;">
        大纲 ➔
      </button>
    `;
    groupHeader.querySelector(`#btn-view-domain-toc-${domain.id}`)?.addEventListener('click', () => {
      onSelectStage(domain.id);
    });
    domainGroup.appendChild(groupHeader);

    // Streamlined compact chapter cards
    const modulesGrid = document.createElement('div');
    modulesGrid.className = 'portal-compact-grid';

    modules.forEach((mod, mIdx) => {
      const card = document.createElement('div');
      card.className = 'portal-compact-card';
      card.style.cursor = 'pointer';

      card.innerHTML = `
        <div class="compact-card-meta">
          <span class="compact-card-idx">${String(mIdx + 1).padStart(2, '0')}</span>
          <span class="compact-card-tag" style="color:${platformColor};">${mod.tag}</span>
        </div>
        <div class="compact-card-title">${mod.title}</div>
        <div class="compact-card-arrow">➔</div>
      `;

      card.addEventListener('click', () => {
        onSelectStage(`${domain.id}:${mIdx}`);
      });

      modulesGrid.appendChild(card);
    });

    domainGroup.appendChild(modulesGrid);
    gridSection.appendChild(domainGroup);
  });

  container.appendChild(gridSection);
}

function truncateText(text: string, maxLen: number): string {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen) + '…';
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


