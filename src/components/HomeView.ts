import { i18n } from '../services/i18n';
import { cheatSheetKeys, practiceWeekKeys, stages } from '../data/roadmap-data';
import { renderComparisonTable } from './ComparisonTable';

export function renderHomeView(
  onNavigate: (targetId: string) => void
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'content-container';

  // 1. Hero Section
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

    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:20px;">
      <button class="btn btn-primary btn-lg" id="home-start-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        ${i18n.t('home.start')}
      </button>
      <button class="btn btn-secondary btn-lg" id="home-matrix-jump-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
        ${i18n.t('home.matrix.title')}
      </button>
    </div>
  `;
  container.appendChild(hero);

  hero.querySelector('#home-start-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    onNavigate(stages[0].id);
  });

  hero.querySelector('#home-matrix-jump-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const matrixEl = document.getElementById('home-roadmap-matrix');
    matrixEl?.scrollIntoView({ behavior: 'smooth' });
  });

  // 2. Core Mindset Shifts Section
  const mindsetSection = document.createElement('div');
  mindsetSection.innerHTML = `
    <div class="section-header">
      <div class="section-header-bar"></div>
      <span class="section-header-title">${i18n.t('home.mindset.title')}</span>
    </div>
    <div class="mindset-cards">
      <div class="mindset-card">
        <div class="mindset-card-header">
          <span class="mindset-card-tag">${i18n.t('home.mindset.01.tag')}</span>
          <span style="font-size:12px;color:var(--color-ink-faint);">01</span>
        </div>
        <h3 class="mindset-card-title">${i18n.t('home.mindset.01.title')}</h3>
        <p class="mindset-card-desc">${i18n.t('home.mindset.01.desc')}</p>
      </div>

      <div class="mindset-card">
        <div class="mindset-card-header">
          <span class="mindset-card-tag" style="background:var(--color-ios-soft);color:var(--color-ios);">${i18n.t('home.mindset.02.tag')}</span>
          <span style="font-size:12px;color:var(--color-ink-faint);">02</span>
        </div>
        <h3 class="mindset-card-title">${i18n.t('home.mindset.02.title')}</h3>
        <p class="mindset-card-desc">${i18n.t('home.mindset.02.desc')}</p>
      </div>

      <div class="mindset-card">
        <div class="mindset-card-header">
          <span class="mindset-card-tag" style="background:var(--color-warn-soft);color:var(--color-warn);">${i18n.t('home.mindset.03.tag')}</span>
          <span style="font-size:12px;color:var(--color-ink-faint);">03</span>
        </div>
        <h3 class="mindset-card-title">${i18n.t('home.mindset.03.title')}</h3>
        <p class="mindset-card-desc">${i18n.t('home.mindset.03.desc')}</p>
      </div>
    </div>
  `;
  container.appendChild(mindsetSection);

  // 3. Smart Starting Pathways (Personas)
  const personasSection = document.createElement('div');
  personasSection.innerHTML = `
    <div class="section-header">
      <div class="section-header-bar ios-bar"></div>
      <span class="section-header-title">${i18n.t('home.personas.title')}</span>
    </div>
    <div class="personas-grid">
      <div class="persona-card">
        <div>
          <h3 class="persona-card-title">${i18n.t('home.personas.compose.title')}</h3>
          <p class="persona-card-desc" style="margin-top:6px;">${i18n.t('home.personas.compose.desc')}</p>
        </div>
        <button class="persona-card-btn" id="btn-persona-compose">
          <span>${i18n.t('home.personas.jump')}：④ UI (Compose ↔ SwiftUI)</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      <div class="persona-card">
        <div>
          <h3 class="persona-card-title">${i18n.t('home.personas.xml.title')}</h3>
          <p class="persona-card-desc" style="margin-top:6px;">${i18n.t('home.personas.xml.desc')}</p>
        </div>
        <button class="persona-card-btn" id="btn-persona-xml">
          <span>${i18n.t('home.personas.jump')}：① 开发环境与工程</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      <div class="persona-card">
        <div>
          <h3 class="persona-card-title">${i18n.t('home.personas.arch.title')}</h3>
          <p class="persona-card-desc" style="margin-top:6px;">${i18n.t('home.personas.arch.desc')}</p>
        </div>
        <button class="persona-card-btn" id="btn-persona-arch">
          <span>${i18n.t('home.personas.jump')}：⑩ 跨端架构对齐</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
  `;
  container.appendChild(personasSection);

  personasSection.querySelector('#btn-persona-compose')?.addEventListener('click', () => onNavigate('ui'));
  personasSection.querySelector('#btn-persona-xml')?.addEventListener('click', () => onNavigate('env'));
  personasSection.querySelector('#btn-persona-arch')?.addEventListener('click', () => onNavigate('arch'));

  // 4. 16-Stage Full Roadmap Matrix
  const matrixSection = document.createElement('div');
  matrixSection.id = 'home-roadmap-matrix';
  matrixSection.innerHTML = `
    <div class="section-header" style="margin-top:20px;">
      <div class="section-header-bar" style="background:linear-gradient(90deg, var(--color-android), var(--color-ios));"></div>
      <span class="section-header-title">${i18n.t('home.matrix.title')}</span>
    </div>
    <p style="font-size:13.5px;color:var(--color-ink-muted);margin-bottom:16px;">${i18n.t('home.matrix.desc')}</p>

    <div class="matrix-group-title">
      <span class="chip chip-main" style="font-size:10px;padding:2px 6px;">★ MAIN</span>
      <span>${i18n.t('home.matrix.main')}</span>
    </div>
    <div class="matrix-grid" id="matrix-grid-main"></div>

    <div class="matrix-group-title" style="margin-top:28px;">
      <span class="chip chip-advanced" style="font-size:10px;padding:2px 6px;">☆ ADVANCED</span>
      <span>${i18n.t('home.matrix.adv')}</span>
    </div>
    <div class="matrix-grid" id="matrix-grid-adv"></div>
  `;
  container.appendChild(matrixSection);

  const mainGrid = matrixSection.querySelector('#matrix-grid-main') as HTMLElement;
  const advGrid = matrixSection.querySelector('#matrix-grid-adv') as HTMLElement;

  const mainStages = stages.filter((s) => !s.isAdvanced);
  const advStages = stages.filter((s) => s.isAdvanced);

  mainStages.forEach((stage) => {
    const card = document.createElement('div');
    card.className = 'matrix-card main';
    card.innerHTML = `
      <div class="matrix-card-num">${String(stage.number).padStart(2, '0')}</div>
      <div class="matrix-card-info">
        <span class="matrix-card-title">${stage.number}. ${i18n.t(stage.titleKey)}</span>
        <div class="matrix-card-meta">
          <span style="letter-spacing:1px;">${stage.stars}</span>
          <span>${stage.rows.length} 对比项</span>
        </div>
      </div>
    `;
    card.addEventListener('click', () => onNavigate(stage.id));
    mainGrid.appendChild(card);
  });

  advStages.forEach((stage) => {
    const card = document.createElement('div');
    card.className = 'matrix-card adv';
    card.innerHTML = `
      <div class="matrix-card-num">${String(stage.number).padStart(2, '0')}</div>
      <div class="matrix-card-info">
        <span class="matrix-card-title">${stage.number}. ${i18n.t(stage.titleKey)}</span>
        <div class="matrix-card-meta">
          <span style="letter-spacing:1px;">${stage.stars}</span>
          <span>${stage.rows.length} 对比项</span>
        </div>
      </div>
    `;
    card.addEventListener('click', () => onNavigate(stage.id));
    advGrid.appendChild(card);
  });

  // 5. Cheat Sheet Section
  const cheatSection = document.createElement('div');
  cheatSection.innerHTML = `
    <div class="section-header" style="margin-top:36px;">
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

  // 6. 5-Week Pace Section
  const weeksSection = document.createElement('div');
  weeksSection.innerHTML = `
    <div class="section-header" style="margin-top:36px;">
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
