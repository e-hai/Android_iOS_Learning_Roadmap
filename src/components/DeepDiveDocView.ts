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
        <span class="chip chip-main" style="background:${platform === 'android' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(14, 165, 233, 0.15)'};color:${platformColor};font-weight:700;border:1px solid ${platformColor};">
          ${platform === 'android' ? '🟢 Android 单端深度进阶' : '🔵 iOS 单端深度进阶'}
        </span>
        <span class="chip chip-main">
          阶段 ${String(stage.number).padStart(2, '0')}
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
  _onNavigateRoadmapStage: (stageId: string) => void
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
      <span class="portal-hero-subtag">${totalModules} 项底层专题 · 点击知识点直接探索</span>
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

    // Simplified Stage Header: No extra action buttons
    const groupHeader = document.createElement('div');
    groupHeader.className = 'portal-stage-header';
    groupHeader.innerHTML = `
      <div class="portal-stage-title-wrap">
        <span class="portal-stage-num">${String(stage.number).padStart(2, '0')}</span>
        <h2 class="portal-stage-title">${i18n.t(stage.titleKey)}</h2>
      </div>
      <span class="portal-stage-count-badge" style="font-size:11.5px;color:var(--color-ink-muted);background:var(--color-surface-sunken);padding:2px 8px;border-radius:10px;border:1px solid var(--color-border);">${modules.length} 项进阶</span>
    `;
    stageGroup.appendChild(groupHeader);

    // Topics Grid
    const topicsGrid = document.createElement('div');
    topicsGrid.className = 'overview-topics-grid';

    modules.forEach((mod, idx) => {
      // First 1-2 modules in each stage are core/critical principles
      const isCore = idx === 0 || (idx === 1 && !mod.tag.includes('工具') && !mod.tag.includes('利器'));

      const topicCard = document.createElement('div');
      topicCard.className = `overview-topic-card card-${platform} ${isCore ? 'is-core' : 'is-ext'}`;
      topicCard.title = `点击探索：${mod.title}`;

      topicCard.innerHTML = `
        <div class="overview-topic-top">
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="topic-priority-badge ${isCore ? 'priority-core' : 'priority-ext'}">
              ${isCore ? '⭐ 核心必会' : '💡 进阶拓展'}
            </span>
            <span class="deep-dive-tag tag-${platform}">【${escapeHtml(mod.tag)}】</span>
          </div>
          <span class="overview-topic-arrow">➔</span>
        </div>
        <h3 class="overview-topic-title">${escapeHtml(mod.title)}</h3>
        <p class="overview-topic-desc">${escapeHtml(getShortSummary(mod.explanation))}</p>
      `;

      // Direct Click Navigation to Stage Detail
      topicCard.addEventListener('click', () => {
        onSelectStage(stage.id);
      });

      topicsGrid.appendChild(topicCard);
    });

    stageGroup.appendChild(topicsGrid);
    gridSection.appendChild(stageGroup);
  });

  container.appendChild(gridSection);
}

function getShortSummary(text: string): string {
  if (!text) return '';
  // Extract first 1~2 sentences
  const match = text.match(/^([^。！？\n]+[。！？])/);
  if (match && match[1].length >= 25 && match[1].length <= 110) {
    return match[1];
  }
  return text.length > 90 ? text.substring(0, 90) + '...' : text;
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
