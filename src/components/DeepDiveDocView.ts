import { deepDiveDomains } from '../data/deep-dive-data';
import { DeepDiveDomain, DeepDiveModule, PipelineStep, StepperStep } from '../models/types';
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
  let chapterIndex: number = 0;

  if (currentStageId.includes(':')) {
    const parts = currentStageId.split(':');
    domainId = parts[0];
    const parsedIdx = parseInt(parts[1], 10);
    if (!isNaN(parsedIdx)) {
      chapterIndex = parsedIdx;
    }
  }

  const domain = deepDiveDomains.find((d) => d.id === domainId);
  if (!domain) {
    container.innerHTML = `<div class="error-msg">${i18n.t('error.domainNotFound')}</div>`;
    return container;
  }

  const modules = platform === 'android' ? domain.deepDive.android : domain.deepDive.ios;
  if (!modules || modules.length === 0 || chapterIndex >= modules.length) {
    container.innerHTML = `<div class="error-msg">${i18n.t('error.chapterNotFound')}</div>`;
    return container;
  }

  // Render Single Chapter
  renderSingleChapterView(container, domain, modules, chapterIndex, platform, onSelectStage);

  return container;
}

/**
 * Renders a single, focused Knowledge Point (Chapter) page.
 */
function renderSingleChapterView(
  container: HTMLElement,
  domain: DeepDiveDomain,
  modules: DeepDiveModule[],
  chapterIndex: number,
  platform: 'android' | 'ios',
  onSelectStage: (stageId: string) => void
) {
  const mod = modules[chapterIndex];
  const domainIndex = deepDiveDomains.findIndex((d) => d.id === domain.id);
  const totalChapters = modules.length;

  // Chapter Header (Clean title only)
  const header = document.createElement('div');
  header.className = 'stage-detail-header chapter-page-header';
  header.innerHTML = `
    <h1 class="stage-detail-title">${mod.title}</h1>
  `;
  container.appendChild(header);

  // Pipeline & Explanation (Unified Principle Flow)
  if (mod.pipeline && mod.pipeline.length > 0) {
    const principleSection = document.createElement('section');
    principleSection.className = 'chapter-content-section pipeline-stage-section';
    const hasTheory = mod.pipeline.some((step) => step.category === 'theory');
    const sectionTitle = hasTheory ? '一、核心理论与工程演进全景' : '一、核心机制与工程演进全景';
    principleSection.innerHTML = `
      <div class="section-header">
        <div class="section-header-bar ${platform === 'ios' ? 'ios-bar' : ''}"></div>
        <h2 class="section-header-title">${sectionTitle}</h2>
      </div>
    `;
    principleSection.appendChild(renderPipelineFlowCard(mod.pipeline, platform));
    principleSection.appendChild(renderTimelineExplanation(mod.explanation || '', platform, mod.pipeline));
    container.appendChild(principleSection);
  } else {
    // Cognitive Metaphor & Formula Card (if present on traditional modules)
    if (mod.metaphor) {
      const metaphorCard = document.createElement('div');
      metaphorCard.className = `chapter-metaphor-card ${platform === 'ios' ? 'metaphor-ios' : ''}`;
      metaphorCard.innerHTML = `
        <div class="metaphor-header">
          <div class="metaphor-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            <span>心智模型隐喻</span>
          </div>
          <span class="metaphor-title">${escapeHtml(mod.metaphor.title)}</span>
        </div>
        <div class="metaphor-formula-wrap">
          <span class="metaphor-formula-label">⚡ 黄金记忆公式:</span>
          <code class="metaphor-formula-code">${escapeHtml(mod.metaphor.formula)}</code>
        </div>
        <p class="metaphor-desc">${formatInlineText(mod.metaphor.metaphorDesc)}</p>
      `;
      container.appendChild(metaphorCard);
    }

    // Traditional Module Principle Section
    if (mod.explanation && mod.explanation.trim()) {
      const principleSection = document.createElement('section');
      principleSection.className = 'chapter-content-section';
      principleSection.innerHTML = `
        <div class="section-header">
          <div class="section-header-bar ${platform === 'ios' ? 'ios-bar' : ''}"></div>
          <h2 class="section-header-title">一、核心原理解析与底层机制</h2>
        </div>
        <div class="chapter-card-box">
          ${formatExplanationHtml(mod.explanation)}
        </div>
      `;
      container.appendChild(principleSection);
    }
  }

  let nextSectionNumber = 2;
  const numToChinese = ['一', '二', '三', '四', '五', '六'];

  // Section: Interactive Step-by-Step State Stepper (if present)
  if (mod.stepper && mod.stepper.length > 0) {
    const stepperSection = document.createElement('section');
    stepperSection.className = 'chapter-content-section';
    const sectionNumStr = numToChinese[nextSectionNumber - 1] || `${nextSectionNumber}`;
    nextSectionNumber++;

    stepperSection.innerHTML = `
      <div class="section-header" style="margin-top:24px;">
        <div class="section-header-bar ${platform === 'ios' ? 'ios-bar' : ''}"></div>
        <h2 class="section-header-title">${sectionNumStr}、执行时序与状态机动态演进 (交互式步进)</h2>
      </div>
    `;
    stepperSection.appendChild(renderStepperComponent(mod.stepper, platform));
    container.appendChild(stepperSection);
  }

  // Section: Architecture / Sequence Diagram (if present)
  if (mod.diagram) {
    const diagramSection = document.createElement('section');
    diagramSection.className = 'chapter-content-section';
    const sectionNumStr = numToChinese[nextSectionNumber - 1] || `${nextSectionNumber}`;
    nextSectionNumber++;

    diagramSection.innerHTML = `
      <div class="section-header" style="margin-top:24px;">
        <div class="section-header-bar ${platform === 'ios' ? 'ios-bar' : ''}"></div>
        <h2 class="section-header-title">${sectionNumStr}、架构与执行时序图解</h2>
      </div>
      <div class="box-diagram-card">
        <div class="box-diagram-header">
          <div class="box-diagram-dots">
            <span class="box-dot dot-red"></span>
            <span class="box-dot dot-yellow"></span>
            <span class="box-dot dot-green"></span>
          </div>
          <span class="box-diagram-title">时序与状态转换 · 盒线全景图</span>
          <button class="box-copy-btn btn-ghost" id="btn-copy-chapter-diag" title="复制图示">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span>复制</span>
          </button>
        </div>
        <div class="box-diagram-body">
          <pre class="box-diagram-code"><code>${escapeHtml(mod.diagram)}</code></pre>
        </div>
      </div>
    `;

    const copyDiagBtn = diagramSection.querySelector('#btn-copy-chapter-diag') as HTMLButtonElement;
    copyDiagBtn?.addEventListener('click', () => {
      navigator.clipboard.writeText(mod.diagram || '');
      const span = copyDiagBtn.querySelector('span');
      if (span) {
        const original = span.textContent;
        span.textContent = i18n.t('detail.deepdive.copied');
        setTimeout(() => { span.textContent = original; }, 2000);
      }
    });

    container.appendChild(diagramSection);
  }

  // Extended Top-Down Deep Dive Section (if present)
  if (mod.extendedDeepDive) {
    const extSection = document.createElement('section');
    extSection.className = 'chapter-content-section extended-deep-dive-section';
    const sectionTitle = platform === 'ios'
      ? 'Swift 并发 4 级全景透视'
      : (mod.title === 'Kotlin 协程' ? 'Kotlin 协程 5 层垂直架构透视' : '分层架构透视');
    extSection.innerHTML = `
      <div class="section-header">
        <div class="section-header-bar ${platform === 'ios' ? 'ios-bar' : ''}"></div>
        <h2 class="section-header-title">${sectionTitle}</h2>
      </div>
      <div class="extended-deep-dive-box ${platform === 'ios' ? 'deepdive-ios' : ''}">
        ${formatExtendedDeepDiveHtml(mod.extendedDeepDive)}
      </div>
    `;
    container.appendChild(extSection);
  }

  // Section: Production Code / Implementation
  if (mod.codeSnippet) {
    const codeSection = document.createElement('section');
    codeSection.className = 'chapter-content-section';
    const sectionNumStr = numToChinese[nextSectionNumber - 1] || `${nextSectionNumber}`;

    const langLabel = mod.codeSnippet.startsWith('#') || mod.codeSnippet.startsWith('adb')
      ? 'SHELL / CLI'
      : (platform === 'android' ? 'KOTLIN / GRADLE' : 'SWIFT / XCODE');

    codeSection.innerHTML = `
      <div class="section-header" style="margin-top:24px;">
        <div class="section-header-bar ${platform === 'ios' ? 'ios-bar' : ''}"></div>
        <h2 class="section-header-title">${sectionNumStr}、工业级源码实现与实战规范</h2>
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

  // Section: In-Depth Case Study & Architectural Reflection (if present)
  if (mod.caseStudy) {
    const caseSection = document.createElement('section');
    caseSection.className = 'chapter-content-section case-study-section';
    caseSection.innerHTML = `
      <div class="section-header" style="margin-top:24px;">
        <div class="section-header-bar ${platform === 'ios' ? 'ios-bar' : ''}"></div>
        <h2 class="section-header-title">深度实战思考</h2>
      </div>
      <div class="case-study-list ${platform === 'ios' ? 'deepdive-ios' : ''}">
        ${formatCaseStudyHtml(mod.caseStudy, platform)}
      </div>
    `;

    container.appendChild(caseSection);
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
    prevBtnHtml = `<button class="btn btn-secondary btn-sm" id="btn-prev-chap">← ${i18n.t('deepdive.prev_chapter')}：${prevChapter.tag} · ${truncateText(prevChapter.title, 14)}</button>`;
  } else if (prevDomain) {
    prevBtnHtml = `<button class="btn btn-secondary btn-sm" id="btn-prev-chap">← ${i18n.t('deepdive.prev_domain')}：${i18n.t(prevDomain.titleKey)}</button>`;
  }

  let nextBtnHtml = '<div></div>';
  if (nextChapter) {
    nextBtnHtml = `<button class="btn btn-primary btn-sm" id="btn-next-chap">${i18n.t('deepdive.next_chapter')}：${nextChapter.tag} · ${truncateText(nextChapter.title, 14)} →</button>`;
  } else if (nextDomain) {
    nextBtnHtml = `<button class="btn btn-primary btn-sm" id="btn-next-chap">${i18n.t('deepdive.next_domain')}：${i18n.t(nextDomain.titleKey)} →</button>`;
  } else {
    nextBtnHtml = `<button class="btn btn-primary btn-sm" id="btn-finish-all">🎉 ${i18n.t('deepdive.finish')} ➔</button>`;
  }

  navFooter.innerHTML = `
    <div class="stage-nav-buttons">
      ${prevBtnHtml}
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

  const platformIconSvg = platform === 'android'
    ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style="color:var(--color-android);flex-shrink:0;"><path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.996-3.4572c.1576-.273.0641-.6214-.2089-.7789-.273-.1575-.6214-.0641-.7789.2089l-2.0234 3.5046C15.3414 8.2435 13.7226 7.95 12 7.95c-1.7226 0-3.3414.2935-4.8723.8488L5.1043 5.2942c-.1575-.273-.5059-.3664-.7789-.2089-.273.1575-.3665.5059-.2089.7789l1.996 3.4572C2.6845 11.233 0 14.887 0 19.1414h24c0-4.2544-2.6845-7.9084-6.1185-9.82"/></svg>`
    : `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style="color:var(--color-ios);flex-shrink:0;"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.92.04-2.02.62-2.66 1.37-.56.65-.99 1.7-0.86 2.72 1.02.08 2.02-.54 2.6-1.24z"/></svg>`;

  // Count total chapters
  let totalModules = 0;
  deepDiveDomains.forEach((d) => {
    const mods = platform === 'android' ? d.deepDive.android : d.deepDive.ios;
    totalModules += mods.length;
  });

  // Modern Hero Section
  const hero = document.createElement('div');
  hero.className = 'deep-dive-portal-hero compact-portal-hero';
  hero.innerHTML = `
    <div class="portal-badge-wrap">
      <span class="portal-hero-badge" style="color:${platform === 'android' ? 'var(--color-android)' : 'var(--color-ios)'};background:${platform === 'android' ? 'rgba(16,185,129,0.1)' : 'rgba(14,165,233,0.1)'};border-color:${platform === 'android' ? 'rgba(16,185,129,0.25)' : 'rgba(14,165,233,0.25)'};display:inline-flex;align-items:center;gap:6px;">
        ${platformIconSvg}
        <span>${platformName} 深度进阶</span>
      </span>
      <span class="portal-hero-subtag">共 ${totalModules} 个专题精讲</span>
    </div>
    <h1 class="portal-hero-title" style="font-size:23px;margin:8px 0 6px;">${platformName} 底层运行机制与实操手册</h1>
    <p class="portal-hero-desc" style="font-size:13.5px;color:var(--color-ink-muted);line-height:1.6;margin:0;">
      直击核心底层原理、编译器优化、工业级架构治理与出海商业化，点击任意专题卡片独立研读。
    </p>
  `;
  container.appendChild(hero);

  // Modern Overview Modules Grid
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
        <h2 class="portal-stage-title" style="font-size:16px;font-weight:700;">${i18n.t(domain.titleKey)}</h2>
        <span class="portal-stage-badge">${modules.length} 节</span>
      </div>
    `;
    domainGroup.appendChild(groupHeader);

    // Modern compact chapter cards
    const modulesGrid = document.createElement('div');
    modulesGrid.className = 'portal-compact-grid';

    modules.forEach((mod, mIdx) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'portal-compact-card';
      card.setAttribute('aria-label', `${mod.title}，${mod.tag}，研读章节`);

      card.innerHTML = `
        <div class="compact-card-header">
          <span class="compact-card-idx">${String(mIdx + 1).padStart(2, '0')}</span>
          <span class="compact-card-tag" style="color:${platformColor};">${mod.tag}</span>
        </div>
        <div class="compact-card-title">${mod.title}</div>
        <div class="compact-card-desc">${truncateText(mod.explanation || mod.metaphor?.metaphorDesc || '', 52)}</div>
        <div class="compact-card-footer">
          <span class="compact-card-action">研读章节</span>
          <span class="compact-card-arrow">→</span>
        </div>
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
  // Clean markdown tags for short summaries
  const clean = text.replace(/#+\s*/g, '').replace(/[-*]\s*/g, '').replace(/`+/g, '');
  if (clean.length <= maxLen) return clean;
  return clean.substring(0, maxLen) + '…';
}

function formatExplanationHtml(rawText: string): string {
  if (!rawText) return '';
  const paragraphs = rawText.split(/\n\n+/);
  return paragraphs.map((p) => {
    const trimmed = p.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('### ') || trimmed.startsWith('#### ')) {
      const title = trimmed.replace(/^#+\s*/, '');
      return `<h3 class="chapter-subheading">${escapeHtml(title)}</h3>`;
    }
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const items = trimmed.split(/\n/).map((line) => {
        const itemText = line.replace(/^[-*]\s*/, '').trim();
        return `<li>${formatInlineText(itemText)}</li>`;
      }).join('');
      return `<ul class="chapter-bullet-list">${items}</ul>`;
    }
    if (/^\d+\.\s/.test(trimmed) && trimmed.includes('\n')) {
      const items = trimmed.split(/\n/).map((line) => {
        const itemText = line.replace(/^\d+\.\s*/, '').trim();
        return `<li>${formatInlineText(itemText)}</li>`;
      }).join('');
      return `<ol class="chapter-numbered-list">${items}</ol>`;
    }
    return `<p class="chapter-explanation-p">${formatInlineText(trimmed)}</p>`;
  }).join('');
}

function formatInlineText(text: string): string {
  let res = escapeHtml(text);
  // Support bold: **text**
  res = res.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  // Support inline code: `code`
  res = res.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  return res;
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

function renderStepperComponent(stepper: StepperStep[], platform: 'android' | 'ios'): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = `chapter-stepper-card ${platform === 'ios' ? 'stepper-card-ios' : ''}`;

  let currentStep = 0;

  function updateView() {
    const step = stepper[currentStep];
    wrapper.innerHTML = `
      <div class="stepper-nav-bar">
        ${stepper.map((s, idx) => `
          <button class="stepper-tab-btn ${idx === currentStep ? 'active' : ''}" data-step="${idx}">
            <span class="stepper-num">${idx + 1}</span>
            <span class="stepper-label">${escapeHtml(s.title)}</span>
          </button>
        `).join('')}
      </div>
      <div class="stepper-content-body">
        <div class="stepper-step-header">
          ${step.tag ? `<span class="stepper-step-tag">${escapeHtml(step.tag)}</span>` : ''}
          <p class="stepper-step-desc">${formatInlineText(step.desc)}</p>
        </div>
        <div class="stepper-diagram-box">
          <pre class="stepper-code"><code>${escapeHtml(step.diagram)}</code></pre>
        </div>
        ${step.stateSnapshot ? `
          <div class="stepper-snapshot-box">
            <div class="snapshot-header">⚡ 此时底层运行时快照 (Runtime State Snapshot):</div>
            <div class="snapshot-grid">
              ${Object.entries(step.stateSnapshot).map(([k, v]) => `
                <div class="snapshot-item">
                  <span class="snapshot-key">${escapeHtml(k)}:</span>
                  <span class="snapshot-val">${escapeHtml(v)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        <div class="stepper-controls">
          <button class="stepper-btn-prev" ${currentStep === 0 ? 'disabled' : ''}>← 上一步</button>
          <div class="stepper-dots">
            ${stepper.map((_, i) => `<span class="stepper-dot ${i === currentStep ? 'active' : ''}"></span>`).join('')}
          </div>
          <button class="stepper-btn-next" ${currentStep === stepper.length - 1 ? 'disabled' : ''}>下一步 →</button>
        </div>
      </div>
    `;

    // Bind Tab clicks
    wrapper.querySelectorAll('.stepper-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const stepIdx = parseInt((btn as HTMLElement).dataset.step || '0', 10);
        if (stepIdx !== currentStep) {
          currentStep = stepIdx;
          updateView();
        }
      });
    });

    // Bind Prev/Next
    const prevBtn = wrapper.querySelector('.stepper-btn-prev') as HTMLButtonElement;
    prevBtn?.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep--;
        updateView();
      }
    });

    const nextBtn = wrapper.querySelector('.stepper-btn-next') as HTMLButtonElement;
    nextBtn?.addEventListener('click', () => {
      if (currentStep < stepper.length - 1) {
        currentStep++;
        updateView();
      }
    });
  }

  updateView();
  return wrapper;
}

function renderPipelineFlowCard(pipeline: PipelineStep[], platform: 'android' | 'ios'): HTMLElement {
  const card = document.createElement('div');
  card.className = `pipeline-flow-card ${platform === 'ios' ? 'pipeline-ios' : ''}`;

  const nodesHtml = pipeline.map((step, idx) => {
    const isTheory = step.category === 'theory';
    const nodeClass = isTheory ? 'node-theory' : 'node-engineering';
    const connector = idx < pipeline.length - 1 ? `
      <div class="pipeline-connector">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <polyline points="19 12 12 19 5 12"></polyline>
        </svg>
      </div>
    ` : '';

    return `
      <div class="pipeline-node ${nodeClass}">
        <h4 class="pipeline-node-title">${escapeHtml(step.title)}</h4>
        <p class="pipeline-node-subtitle">${escapeHtml(step.subtitle)}</p>
      </div>
      ${connector}
    `;
  }).join('');

  const hasTheory = pipeline.some((step) => step.category === 'theory');
  const legendTheoryHtml = hasTheory ? `
        <div class="legend-item">
          <span class="legend-dot theory-dot"></span>
          <span>理论与策略层</span>
        </div>` : '';

  card.innerHTML = `
    <div class="pipeline-flow-header">
      <div class="pipeline-flow-title-wrap">
        <span class="pipeline-flow-badge">Roadmap</span>
        <h3 class="pipeline-flow-title">${hasTheory ? '理论 ➔ 工程演进全景链路' : '工程演进全景链路'}</h3>
      </div>
      <div class="pipeline-flow-legend">
        ${legendTheoryHtml}
        <div class="legend-item">
          <span class="legend-dot eng-dot"></span>
          <span>工程与运行时层</span>
        </div>
      </div>
    </div>
    <div class="pipeline-flow-container">
      ${nodesHtml}
    </div>
  `;

  return card;
}

function renderTimelineExplanation(rawText: string, platform: 'android' | 'ios', pipeline?: PipelineStep[]): HTMLElement {
  const container = document.createElement('div');
  container.className = `timeline-stream ${platform === 'ios' ? 'timeline-ios' : ''}`;
  const bridge = document.createElement('div');
  bridge.className = 'timeline-stream-bridge';
  bridge.innerHTML = `
    <div class="timeline-bridge-line"></div>
    <span class="timeline-bridge-tag">各阶段底层原理与代码演进分步详述</span>
    <div class="timeline-bridge-line"></div>
  `;
  container.appendChild(bridge);

  // Split by markdown H3 heading
  const sections = rawText.split(/(?=###\s+)/g).map((s) => s.trim()).filter(Boolean);

  sections.forEach((sec, idx) => {
    const lines = sec.split('\n').map((l) => l.trim()).filter(Boolean);
    const titleLine = lines[0] || '';
    const title = titleLine.replace(/^###\s+/, '');
    const bodyLines = lines.slice(1);

    const isTheory = pipeline?.[idx]?.category === 'theory' || (!pipeline && idx < 3);
    const badgeNumber = String(idx + 1).padStart(2, '0');
    const tagText = isTheory ? '理论与策略' : '工程与运行时';

    const item = document.createElement('div');
    item.className = 'timeline-item';

    // Format list items
    const listHtml = bodyLines.map((line) => {
      const cleanLine = line.replace(/^[-*]\s*/, '').trim();
      return `<li>${formatInlineText(cleanLine)}</li>`;
    }).join('');

    item.innerHTML = `
      <div class="timeline-axis">
        <span class="timeline-step-badge ${isTheory ? 'badge-theory' : 'badge-engineering'}">${badgeNumber}</span>
        <div class="timeline-track-line"></div>
      </div>
      <div class="timeline-card">
        <div class="timeline-card-header">
          <h3 class="timeline-card-title">${escapeHtml(title)}</h3>
          <span class="timeline-card-tag ${isTheory ? 'tag-theory' : 'tag-engineering'}">${tagText}</span>
        </div>
        <div class="timeline-card-content">
          <ul class="chapter-bullet-list">
            ${listHtml}
          </ul>
        </div>
      </div>
    `;

    container.appendChild(item);
  });

  return container;
}

function formatExtendedDeepDiveHtml(rawText: string): string {
  if (!rawText) return '';
  // Split by "### "
  const blocks = rawText.split(/(?=###\s+)/g).map((b) => b.trim()).filter(Boolean);

  return blocks.map((block, idx) => {
    const lines = block.split('\n');
    const headerLine = lines[0].replace(/^###\s+/, '').trim();
    
    // Parse tag if present: e.g. "第一层：编译器层（不可见，自动生成）" or "第 1 级：顶层语法与调用边界（Application & API）"
    let title = headerLine;
    let tag = '';
    const match = headerLine.match(/^(第\s*[\d一二三四五六七八九十]+\s*[层级][：:])\s*(.*?)(（(.*?)）|\((.*?)\))?$/);
    let levelBadge = `L${idx + 1}`;
    if (match) {
      levelBadge = match[1].replace(/[：:]/, '').trim();
      title = match[2].trim();
      tag = (match[4] || match[5] || '').trim();
    }

    const restText = lines.slice(1).join('\n').trim();

    // Parse sections within restText: diagrams (```diagram ... ```), code (```kotlin ... ```), text
    let contentHtml = '';
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let codeMatch: RegExpExecArray | null;

    while ((codeMatch = codeBlockRegex.exec(restText)) !== null) {
      const textBefore = restText.substring(lastIndex, codeMatch.index).trim();
      if (textBefore) {
        contentHtml += `<div class="layer-explanation-text">${formatExplanationHtml(textBefore)}</div>`;
      }

      const lang = (codeMatch[1] || '').toLowerCase();
      const code = codeMatch[2].trim();

      if (lang === 'diagram' || lang === 'ascii' || lang === 'text') {
        contentHtml += `<pre class="layer-diagram-box"><code>${escapeHtml(code)}</code></pre>`;
      } else {
        contentHtml += `<pre class="layer-code-box"><code>${escapeHtml(code)}</code></pre>`;
      }

      lastIndex = codeMatch.index + codeMatch[0].length;
    }

    const textAfter = restText.substring(lastIndex).trim();
    if (textAfter) {
      contentHtml += `<div class="layer-explanation-text">${formatExplanationHtml(textAfter)}</div>`;
    }

    return `
      <div class="extended-layer-card">
        <div class="extended-layer-header">
          <div class="layer-title-wrap">
            <span class="layer-number-badge">${escapeHtml(levelBadge)}</span>
            <h3 class="layer-title">${escapeHtml(title)}</h3>
          </div>
          ${tag ? `<span class="layer-tag">${escapeHtml(tag)}</span>` : ''}
        </div>
        ${contentHtml}
      </div>
    `;
  }).join('');
}

function formatCaseStudyHtml(rawText: string, platform: 'android' | 'ios' = 'android'): string {
  if (!rawText) return '';

  const hasH3 = rawText.includes('### ');
  if (!hasH3) {
    return `
      <div class="case-study-panel ${platform === 'ios' ? 'deepdive-ios' : ''}">
        <div class="case-study-panel-body">
          ${formatCaseStudyBody(rawText)}
        </div>
      </div>
    `;
  }

  const sections = rawText.split(/(?=###\s+)/g).map((s) => s.trim()).filter(Boolean);

  return sections.map((sec, idx) => {
    const lines = sec.split('\n');
    const firstLine = lines[0].trim();
    let title = '';
    let bodyText = '';

    if (firstLine.startsWith('### ')) {
      title = firstLine.replace(/^###\s+/, '').trim();
      bodyText = lines.slice(1).join('\n').trim();
    } else {
      bodyText = sec;
    }

    const badgeNumber = String(idx + 1).padStart(2, '0');

    return `
      <div class="case-study-panel ${platform === 'ios' ? 'deepdive-ios' : ''}">
        ${title ? `
          <div class="case-study-panel-header">
            <span class="case-study-panel-badge">${badgeNumber}</span>
            <h3 class="case-study-panel-title">${formatInlineText(title)}</h3>
          </div>
        ` : ''}
        <div class="case-study-panel-body">
          ${formatCaseStudyBody(bodyText)}
        </div>
      </div>
    `;
  }).join('');
}

function formatCaseStudyBody(rawText: string): string {
  if (!rawText) return '';

  const lines = rawText.split('\n');
  let html = '';
  let inCodeBlock = false;
  let codeContent = '';
  let inTable = false;
  let tableHeader: string[] = [];
  let tableRows: string[][] = [];

  const flushTable = () => {
    if (!inTable) return;
    html += '<div class="case-study-table-wrap"><table class="case-study-table">';
    if (tableHeader.length > 0) {
      html += '<thead><tr>' + tableHeader.map((h) => `<th>${formatInlineText(h.trim())}</th>`).join('') + '</tr></thead>';
    }
    html += '<tbody>';
    tableRows.forEach((row) => {
      html += '<tr>' + row.map((cell) => `<td>${formatInlineText(cell.trim())}</td>`).join('') + '</tr>';
    });
    html += '</tbody></table></div>';
    inTable = false;
    tableHeader = [];
    tableRows = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check code blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        html += `<pre class="layer-code-box case-code-box"><code>${escapeHtml(codeContent.trim())}</code></pre>`;
        inCodeBlock = false;
        codeContent = '';
      } else {
        flushTable();
        inCodeBlock = true;
        codeContent = '';
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += line + '\n';
      continue;
    }

    // Check table
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed.split('|').slice(1, -1);
      // Check if it's separator line |---|---|
      if (cells.every((c) => /^[\s\-:]+$/.test(c))) {
        continue;
      }
      if (!inTable) {
        inTable = true;
        tableHeader = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else {
      flushTable();
    }

    if (!trimmed) continue;

    // Headings & formatting
    if (trimmed.startsWith('#### ')) {
      html += `<h4 class="case-study-h4">${formatInlineText(trimmed.replace(/^####\s+/, ''))}</h4>`;
    } else if (trimmed.startsWith('##### ')) {
      html += `<h5 class="case-study-h5">${formatInlineText(trimmed.replace(/^#####\s+/, ''))}</h5>`;
    } else if (trimmed.startsWith('> ')) {
      html += `<div class="case-study-callout">${formatInlineText(trimmed.replace(/^>\s+/, ''))}</div>`;
    } else {
      // Match indentation (2 spaces or 1 tab counts as a sub-item)
      const indentMatch = line.match(/^(\s+)/);
      const isSub = !!indentMatch && indentMatch[1].replace(/\t/g, '  ').length >= 2;

      // Match ordered list item: "1. " or "2. "
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        const num = numMatch[1];
        const text = numMatch[2];
        html += `<div class="case-study-bullet ${isSub ? 'is-sub' : ''} is-num"><span class="case-bullet-num">${num}</span><span>${formatInlineText(text)}</span></div>`;
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const text = trimmed.replace(/^[-*]\s+/, '');
        html += `<div class="case-study-bullet ${isSub ? 'is-sub' : ''}"><span class="${isSub ? 'case-bullet-subdot' : 'case-bullet-dot'}"></span><span>${formatInlineText(text)}</span></div>`;
      } else {
        html += `<p class="case-study-p">${formatInlineText(trimmed)}</p>`;
      }
    }
  }

  flushTable();
  return html;
}






