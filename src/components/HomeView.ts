import { i18n } from '../services/i18n';
import { progressStorage } from '../services/storage';
import { cheatSheetKeys, practiceWeekKeys, stages } from '../data/roadmap-data';
import { renderComparisonTable } from './ComparisonTable';
import { showToast } from './Toast';

export function renderHomeView(
  onNavigate: (targetId: string) => void,
  onOpenFocusMode: (stageId?: string) => void
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'content-container';

  const completed = progressStorage.getMainPathCompletedCount(stages);
  const total = progressStorage.getMainPathTotalCount(stages);
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Hero Section
  const hero = document.createElement('div');
  hero.className = 'home-hero';
  hero.innerHTML = `
    <div class="home-bridge-badge">
      <span style="color:var(--color-android);font-weight:800;">ANDROID</span>
      <span style="color:var(--color-ink-muted);">→</span>
      <span style="color:var(--color-ios);font-weight:800;">iOS</span>
    </div>
    <h1 class="home-title">${i18n.t('home.brand')}</h1>
    <p class="home-subtitle">${i18n.t('home.subtitle')}</p>

    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:16px;">
      <button class="btn btn-primary btn-lg" id="home-start-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        ${i18n.t('home.start')}
      </button>
      <button class="btn btn-secondary btn-lg" id="home-focus-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
        ${i18n.t('web.focus_mode')}
      </button>
      <div class="progress-pill" style="padding:8px 16px;">
        <span>${i18n.t('web.progress_summary', completed, total, percent)}</span>
        <div class="progress-bar-bg" style="width:90px;height:8px;">
          <div class="progress-bar-fill" style="width:${percent}%;"></div>
        </div>
      </div>
    </div>
  `;
  container.appendChild(hero);

  const startBtn = hero.querySelector('#home-start-btn') as HTMLButtonElement;
  startBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const next = progressStorage.getNextIncompleteStage(stages) || stages[0];
    onNavigate(next.id);
  });

  const focusBtn = hero.querySelector('#home-focus-btn') as HTMLButtonElement;
  focusBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const next = progressStorage.getNextIncompleteStage(stages) || stages[0];
    onOpenFocusMode(next.id);
  });

  // How to use / Guide cards
  const guideSection = document.createElement('div');
  guideSection.innerHTML = `
    <div class="section-header">
      <div class="section-header-bar"></div>
      <span class="section-header-title">${i18n.t('home.how')}</span>
    </div>
    <div class="guide-cards">
      <div class="guide-card">
        <div class="guide-card-num">01</div>
        <div class="guide-card-text">${i18n.t('home.guide.01')}</div>
      </div>
      <div class="guide-card">
        <div class="guide-card-num">02</div>
        <div class="guide-card-text">${i18n.t('home.guide.02')}</div>
      </div>
      <div class="guide-card">
        <div class="guide-card-num">03</div>
        <div class="guide-card-text">${i18n.t('home.guide.03')}</div>
      </div>
    </div>
  `;
  container.appendChild(guideSection);

  // Cheat Sheet Section
  const cheatSection = document.createElement('div');
  cheatSection.innerHTML = `
    <div class="section-header">
      <div class="section-header-bar ios-bar"></div>
      <span class="section-header-title">${i18n.t('home.cheatsheet')}</span>
    </div>
    <p style="font-size:13.5px;color:var(--color-ink-muted);margin-bottom:12px;">${i18n.t('home.cheatsheet.hint')}</p>
  `;

  const cheatRows = cheatSheetKeys.map((k, i) => ({
    id: `cheat-${i}`,
    android: k.android,
    ios: k.ios,
  }));
  cheatSection.appendChild(
    renderComparisonTable(
      cheatRows,
      i18n.t('home.cheatsheet.android'),
      i18n.t('home.cheatsheet.ios'),
      false
    )
  );
  container.appendChild(cheatSection);

  // 5-Week Pace Section
  const weeksSection = document.createElement('div');
  weeksSection.innerHTML = `
    <div class="section-header" style="margin-top:32px;">
      <div class="section-header-bar" style="background:var(--color-done);"></div>
      <span class="section-header-title">${i18n.t('home.pace')}</span>
    </div>
    <div class="weeks-timeline">
      ${practiceWeekKeys
        .map(
          (k, idx) => `
        <div class="week-row">
          <span class="week-num">${String(idx + 1).padStart(2, '0')}</span>
          <span class="week-text">${i18n.t(k)}</span>
        </div>
      `
        )
        .join('')}
    </div>
  `;
  container.appendChild(weeksSection);

  // Progress Management Tools (Export / Import / Reset)
  const toolsSection = document.createElement('div');
  toolsSection.style.marginTop = '40px';
  toolsSection.style.padding = '20px';
  toolsSection.style.background = 'var(--color-surface)';
  toolsSection.style.border = '1px solid var(--color-border)';
  toolsSection.style.borderRadius = 'var(--radius-lg)';
  toolsSection.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
      <div>
        <h3 style="font-size:14px;font-weight:700;color:var(--color-ink);">${i18n.t('sidebar.cockpit')} · ${i18n.t('sidebar.main')}</h3>
        <p style="font-size:12px;color:var(--color-ink-muted);margin-top:2px;">
          ${i18n.t('web.progress_summary', completed, total, percent)}
        </p>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <button class="btn btn-secondary btn-sm" id="btn-export-progress">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          ${i18n.t('web.export_progress')}
        </button>
        <button class="btn btn-secondary btn-sm" id="btn-import-progress">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          ${i18n.t('web.import_progress')}
        </button>
        <input type="file" id="file-import-progress" accept=".json" style="display:none;" />
        <button class="btn btn-ghost btn-sm" id="btn-reset-progress" style="color:var(--color-warn);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          ${i18n.t('web.reset_progress')}
        </button>
      </div>
    </div>
  `;
  container.appendChild(toolsSection);

  // Tools event handlers
  const exportBtn = toolsSection.querySelector('#btn-export-progress') as HTMLButtonElement;
  exportBtn.addEventListener('click', () => {
    const jsonStr = progressStorage.exportProgressJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learning-cockpit-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(i18n.t('web.export_progress'));
  });

  const importBtn = toolsSection.querySelector('#btn-import-progress') as HTMLButtonElement;
  const fileInput = toolsSection.querySelector('#file-import-progress') as HTMLInputElement;

  importBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = progressStorage.importProgressJSON(content);
      if (success) {
        showToast(i18n.t('web.import_success'));
        onNavigate('home');
      } else {
        showToast(i18n.t('web.import_error'));
      }
    };
    reader.readAsText(file);
    fileInput.value = '';
  });

  const resetBtn = toolsSection.querySelector('#btn-reset-progress') as HTMLButtonElement;
  resetBtn.addEventListener('click', () => {
    if (confirm(i18n.t('web.reset_confirm'))) {
      progressStorage.resetProgress();
      showToast(i18n.t('web.reset_progress'));
      onNavigate('home');
    }
  });

  return container;
}
