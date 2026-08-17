import { i18n } from '../services/i18n';
import { cheatSheetKeys, practiceWeekKeys, stages } from '../data/roadmap-data';
import { renderComparisonTable } from './ComparisonTable';

export function renderHomeView(
  onNavigate: (targetId: string) => void
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'content-container';

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
    </div>
  `;
  container.appendChild(hero);

  const startBtn = hero.querySelector('#home-start-btn') as HTMLButtonElement;
  startBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    onNavigate(stages[0].id);
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

  return container;
}
