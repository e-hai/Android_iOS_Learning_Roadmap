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

  // Theory-to-Engineering Pipeline Flow Card (if present)
  if (mod.pipeline && mod.pipeline.length > 0) {
    container.appendChild(renderPipelineFlowCard(mod.pipeline, platform));
  }

  // Cognitive Metaphor & Formula Card (if present)
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

  // Section 1: Core Mechanism & Principle Analysis
  const hasMultipleSections = !!(mod.stepper?.length || mod.diagram || mod.codeSnippet);
  const principleSection = document.createElement('section');
  principleSection.className = 'chapter-content-section';
  principleSection.innerHTML = `
    <div class="section-header">
      <div class="section-header-bar ${platform === 'ios' ? 'ios-bar' : ''}"></div>
      <h2 class="section-header-title">${hasMultipleSections ? '一、底层运行机制与核心原理' : '核心原理解析与技术推演'}</h2>
    </div>
    <div class="chapter-card-box">
      ${formatExplanationHtml(mod.explanation)}
    </div>
  `;
  container.appendChild(principleSection);

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
      const card = document.createElement('div');
      card.className = 'portal-compact-card';
      card.style.cursor = 'pointer';

      card.innerHTML = `
        <div class="compact-card-header">
          <span class="compact-card-idx">${String(mIdx + 1).padStart(2, '0')}</span>
          <span class="compact-card-tag" style="color:${platformColor};">${mod.tag}</span>
        </div>
        <div class="compact-card-title">${mod.title}</div>
        <div class="compact-card-desc">${truncateText(mod.explanation, 52)}</div>
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
    const isTheory = step.category === 'theory' || idx < 3;
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

  card.innerHTML = `
    <div class="pipeline-flow-header">
      <div class="pipeline-flow-title-wrap">
        <span class="pipeline-flow-badge">Roadmap</span>
        <h3 class="pipeline-flow-title">理论 ➔ 工程演进全景链路</h3>
      </div>
      <div class="pipeline-flow-legend">
        <div class="legend-item">
          <span class="legend-dot theory-dot"></span>
          <span>理论与策略层</span>
        </div>
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




