import { deepDiveDomains } from '../data/deep-dive-data';
import { DeepDiveDomain, DeepDiveModule } from '../models/types';
import { i18n } from '../services/i18n';

export function renderDeepDiveDocView(
  currentStageId: string,
  platform: 'android' | 'ios',
  onSelectStage: (stageId: string) => void,
  onNavigateRoadmapStage: (stageId: string) => void
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'content-container deep-dive-doc-container';

  // 1. Full Platform Overview (All 5 Domains)
  if (currentStageId === 'all' || currentStageId === 'home') {
    renderPlatformOverview(container, platform, onSelectStage, onNavigateRoadmapStage);
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
    renderSingleChapterView(container, domain, chapterIndex, modules, platform, onSelectStage, onNavigateRoadmapStage);
    return container;
  }

  // 4. Otherwise, render the Domain Table of Contents (大纲概览页)
  renderDomainTocView(container, domain, modules, platform, onSelectStage, onNavigateRoadmapStage);
  return container;
}

/**
 * Renders a single, focused Knowledge Point (Chapter) page.
 * Keeps knowledge points on separate pages as requested.
 */
function renderSingleChapterView(
  container: HTMLElement,
  domain: DeepDiveDomain,
  chapterIndex: number,
  modules: DeepDiveModule[],
  platform: 'android' | 'ios',
  onSelectStage: (stageId: string) => void,
  _onNavigateRoadmapStage: (stageId: string) => void
) {
  const mod = modules[chapterIndex];
  const domainIndex = deepDiveDomains.findIndex((d) => d.id === domain.id);
  const platformName = platform === 'android' ? 'Android' : 'iOS';
  const platformColor = platform === 'android' ? 'var(--color-android)' : 'var(--color-ios)';
  const totalChapters = modules.length;
  const chapterNumberStr = String(chapterIndex + 1).padStart(2, '0');
  const totalChaptersStr = String(totalChapters).padStart(2, '0');

  // Breadcrumb Navigation
  const breadcrumb = document.createElement('nav');
  breadcrumb.className = 'chapter-breadcrumb';
  breadcrumb.innerHTML = `
    <button class="breadcrumb-btn" id="btn-crumb-overview">5 大领域进阶</button>
    <span class="breadcrumb-sep">/</span>
    <button class="breadcrumb-btn" id="btn-crumb-domain">${String(domain.number).padStart(2, '0')}. ${i18n.t(domain.titleKey)}</button>
    <span class="breadcrumb-sep">/</span>
    <span class="breadcrumb-current">第 ${chapterNumberStr} 节 · ${mod.tag}</span>
  `;
  breadcrumb.querySelector('#btn-crumb-overview')?.addEventListener('click', () => onSelectStage('all'));
  breadcrumb.querySelector('#btn-crumb-domain')?.addEventListener('click', () => onSelectStage(domain.id));
  container.appendChild(breadcrumb);

  // Chapter Header
  const header = document.createElement('div');
  header.className = 'stage-detail-header chapter-page-header';
  header.innerHTML = `
    <div class="stage-detail-meta">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        <span class="chip chip-main" style="background:${platform === 'android' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(14, 165, 233, 0.15)'};color:${platformColor};font-weight:700;border:1px solid ${platformColor};">
          ${platform === 'android' ? '🟢 Android' : '🔵 iOS'} 单端进阶
        </span>
        <span class="chip chip-main">
          领域 ${String(domain.number).padStart(2, '0')} · ${i18n.t(domain.titleKey)}
        </span>
        <span class="deep-dive-tag" style="background:${platform === 'android' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(14, 165, 233, 0.12)'};color:${platformColor};border:1px solid ${platform === 'android' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(14, 165, 233, 0.3)'};">
          ${mod.tag}
        </span>
      </div>
      <span class="stage-number-large">${chapterNumberStr} / ${totalChaptersStr}</span>
    </div>

    <h1 class="stage-title" style="font-size:26px;margin-top:4px;">${mod.title}</h1>
    <div class="chapter-quick-meta" style="display:flex;gap:16px;font-size:12.5px;color:var(--color-ink-muted);margin-top:6px;flex-wrap:wrap;">
      <span>📖 章节进度：<strong>第 ${chapterNumberStr} / ${totalChaptersStr} 节</strong></span>
      <span>🏷️ 核心标签：<strong>${mod.tag}</strong></span>
      <span>⚡ 深度层级：<strong>${platformName} 底层运行机制与源码实战</strong></span>
    </div>
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

  // Cross-domain transitions if at boundary
  const prevDomain = domainIndex > 0 ? deepDiveDomains[domainIndex - 1] : null;
  const nextDomain = domainIndex < deepDiveDomains.length - 1 ? deepDiveDomains[domainIndex + 1] : null;

  let prevBtnHtml = '<div></div>';
  if (prevChapter) {
    prevBtnHtml = `<button class="btn btn-secondary btn-sm" id="btn-prev-chap">← 上一节: ${prevChapter.tag} · ${truncateText(prevChapter.title, 14)}</button>`;
  } else if (prevDomain) {
    prevBtnHtml = `<button class="btn btn-secondary btn-sm" id="btn-prev-chap">← 上一领域: ${String(prevDomain.number).padStart(2, '0')}. ${i18n.t(prevDomain.titleKey)}</button>`;
  }

  let nextBtnHtml = '<div></div>';
  if (nextChapter) {
    nextBtnHtml = `<button class="btn btn-primary btn-sm" id="btn-next-chap">下一节: ${nextChapter.tag} · ${truncateText(nextChapter.title, 14)} →</button>`;
  } else if (nextDomain) {
    nextBtnHtml = `<button class="btn btn-primary btn-sm" id="btn-next-chap">下一领域: ${String(nextDomain.number).padStart(2, '0')}. ${i18n.t(nextDomain.titleKey)} →</button>`;
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
 * Renders the Domain Table of Contents (TOC / Outline) Page.
 * Lists all chapter links within this domain so user can select any chapter.
 */
function renderDomainTocView(
  container: HTMLElement,
  domain: DeepDiveDomain,
  modules: DeepDiveModule[],
  platform: 'android' | 'ios',
  onSelectStage: (stageId: string) => void,
  onNavigateRoadmapStage: (stageId: string) => void
) {
  const domainIndex = deepDiveDomains.findIndex((d) => d.id === domain.id);
  const platformName = platform === 'android' ? 'Android' : 'iOS';
  const platformColor = platform === 'android' ? 'var(--color-android)' : 'var(--color-ios)';

  // Breadcrumb
  const breadcrumb = document.createElement('nav');
  breadcrumb.className = 'chapter-breadcrumb';
  breadcrumb.innerHTML = `
    <button class="breadcrumb-btn" id="btn-crumb-overview">5 大领域进阶</button>
    <span class="breadcrumb-sep">/</span>
    <span class="breadcrumb-current">领域 ${String(domain.number).padStart(2, '0')} · ${i18n.t(domain.titleKey)}</span>
  `;
  breadcrumb.querySelector('#btn-crumb-overview')?.addEventListener('click', () => onSelectStage('all'));
  container.appendChild(breadcrumb);

  // Domain Header
  const header = document.createElement('div');
  header.className = 'stage-detail-header';
  header.innerHTML = `
    <div class="stage-detail-meta">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        <span class="chip chip-main" style="background:${platform === 'android' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(14, 165, 233, 0.15)'};color:${platformColor};font-weight:700;border:1px solid ${platformColor};">
          ${platform === 'android' ? '🟢 Android' : '🔵 iOS'} 单端进阶
        </span>
        <span class="chip chip-main">
          领域 ${String(domain.number).padStart(2, '0')} · 共 ${modules.length} 个独立章节
        </span>
      </div>
      <span class="stage-number-large">${String(domain.number).padStart(2, '0')}</span>
    </div>

    <h1 class="stage-title">${String(domain.number).padStart(2, '0')}. ${i18n.t(domain.titleKey)} · ${platformName} 进阶大纲</h1>
    <p class="stage-goal">
      本领域共拆分为 <strong>${modules.length} 个独立进阶章节</strong>。每个章节独立成页，深度剖析底层机制并提供工业级生产规范代码。
    </p>

    <div style="margin-top:12px;">
      <button class="btn btn-primary" id="btn-start-first-chapter" style="background:${platformColor};border:none;">
        🚀 从第 01 节开始学习 ➔
      </button>
    </div>
  `;
  header.querySelector('#btn-start-first-chapter')?.addEventListener('click', () => {
    onSelectStage(`${domain.id}:0`);
  });
  container.appendChild(header);

  // Chapter Cards Grid (Each card goes to its own separate chapter page)
  const tocSection = document.createElement('section');
  tocSection.className = 'domain-toc-section';
  tocSection.innerHTML = `
    <div class="section-header">
      <div class="section-header-bar ${platform === 'ios' ? 'ios-bar' : ''}"></div>
      <h2 class="section-header-title">领域章节目录清单 (点击进入独立学习页)</h2>
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
        <span class="domain-toc-enter-link" style="color:var(--color-accent);font-size:12px;font-weight:600;">进入章节 ➔</span>
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

  // Bottom Navigator: Prev / Next Domain & Roadmap
  const navFooter = document.createElement('div');
  navFooter.className = 'stage-nav-footer';

  const prevDomain = domainIndex > 0 ? deepDiveDomains[domainIndex - 1] : null;
  const nextDomain = domainIndex < deepDiveDomains.length - 1 ? deepDiveDomains[domainIndex + 1] : null;

  navFooter.innerHTML = `
    <div class="stage-nav-buttons">
      ${prevDomain ? `<button class="btn btn-secondary btn-sm" id="btn-prev-domain">← ${String(prevDomain.number).padStart(2, '0')}. ${i18n.t(prevDomain.titleKey)}</button>` : '<div></div>'}
      <button class="btn btn-secondary btn-sm" id="btn-jump-roadmap" style="background:var(--color-surface);color:var(--color-accent);border:1px solid var(--color-accent);">
        🗺️ 查看双端 16 阶段路线图 ➔
      </button>
      ${nextDomain ? `<button class="btn btn-secondary btn-sm" id="btn-next-domain">${String(nextDomain.number).padStart(2, '0')}. ${i18n.t(nextDomain.titleKey)} →</button>` : '<div></div>'}
    </div>
  `;

  if (prevDomain) {
    navFooter.querySelector('#btn-prev-domain')?.addEventListener('click', () => onSelectStage(prevDomain.id));
  }
  if (nextDomain) {
    navFooter.querySelector('#btn-next-domain')?.addEventListener('click', () => onSelectStage(nextDomain.id));
  }
  navFooter.querySelector('#btn-jump-roadmap')?.addEventListener('click', () => onNavigateRoadmapStage('home'));

  container.appendChild(navFooter);
}

/**
 * Renders the platform deep dive overview matrix (5 Domains).
 * Clicking any topic card navigates directly to that topic's independent chapter page!
 */
function renderPlatformOverview(
  container: HTMLElement,
  platform: 'android' | 'ios',
  onSelectStage: (stageId: string) => void,
  onNavigateRoadmapStage: (stageId: string) => void
) {
  const platformName = platform === 'android' ? 'Android' : 'iOS';

  // Count total chapters across the 5 domains
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
      <span class="portal-hero-subtag">${totalModules} 个独立进阶章节 · 5 大工业级领域</span>
    </div>
    <h1 class="portal-hero-title">${platformName} 单端底层运行内幕与高级调优</h1>
    <p class="portal-hero-desc">
      ${platform === 'android'
        ? '深挖 Android 底层运行原理：从 Kotlin 协程挂起状态机、JVM/ART 垃圾回收、Compose Slot Table 插槽表，到 MVI 单向数据流、Perfetto 链路分析、Baseline Profiles 预编译、OpenGL ES/MediaCodec 管线与 Google Play Billing v6+ 出海订阅。点击任意章节独立深度研读。'
        : '深挖 iOS 底层运行原理：从 Swift 并发 Actor 隔离、ARC Side Table 与 COW、SwiftUI AttributeGraph 属性图，到 TCA 状态机、MetricKit 性能度量、Metal 图形渲染、VideoToolbox 硬编解码与 Apple StoreKit 2 全球订阅。点击任意章节独立深度研读。'
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
      <button class="btn btn-ghost btn-sm" id="btn-view-domain-toc-${domain.id}" style="color:var(--color-accent);font-weight:600;">
        查看领域大纲 (${modules.length} 节) ➔
      </button>
    `;
    groupHeader.querySelector(`#btn-view-domain-toc-${domain.id}`)?.addEventListener('click', () => {
      onSelectStage(domain.id);
    });
    domainGroup.appendChild(groupHeader);

    // List of module cards within this domain
    const modulesGrid = document.createElement('div');
    modulesGrid.className = 'portal-stage-grid';

    modules.forEach((mod, mIdx) => {
      const card = document.createElement('div');
      card.className = 'portal-card';
      card.style.cursor = 'pointer';

      card.innerHTML = `
        <div class="portal-card-top">
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="portal-card-tag">${mod.tag}</span>
            <span class="portal-card-badge badge-key">
              第 ${String(mIdx + 1).padStart(2, '0')} 节
            </span>
          </div>
          <span style="font-size:12px;color:var(--color-accent);font-weight:600;">进入章节 ➔</span>
        </div>
        <h3 class="portal-card-title">${mod.title}</h3>
        <p class="portal-card-desc">${truncateText(mod.explanation, 90)}</p>
      `;

      // Direct jump to this specific chapter's independent page!
      card.addEventListener('click', () => {
        onSelectStage(`${domain.id}:${mIdx}`);
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

