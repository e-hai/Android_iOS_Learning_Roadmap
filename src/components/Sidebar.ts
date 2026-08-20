import { LearningStage } from '../models/types';
import { i18n } from '../services/i18n';
import { stages } from '../data/roadmap-data';

export function renderSidebar(
  currentStageId: string,
  onSelect: (targetId: string) => void,
  docMode: 'roadmap' | 'deepdive' = 'roadmap',
  onSwitchDocMode?: (mode: 'roadmap' | 'deepdive') => void
): HTMLElement {
  const sidebar = document.createElement('aside');
  sidebar.className = 'app-sidebar';
  sidebar.id = 'app-sidebar';

  const mainStages = stages.filter((s) => !s.isAdvanced);
  const advancedStages = stages.filter((s) => s.isAdvanced);

  // 1. Home Item (in roadmap mode) or Deep Dive Home Item (in deepdive mode)
  const topSection = document.createElement('div');
  topSection.className = 'sidebar-section';

  const topItem = document.createElement('button');
  topItem.className = `sidebar-item ${currentStageId === 'home' || (docMode === 'deepdive' && currentStageId === 'all') ? 'active' : ''}`;
  
  if (docMode === 'roadmap') {
    topItem.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-accent);flex-shrink:0;"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      <span class="sidebar-item-title" style="font-weight:700;">${i18n.t('sidebar.start')}</span>
    `;
    topItem.addEventListener('click', () => onSelect('home'));
  } else {
    topItem.innerHTML = `
      <span style="font-size:15px;flex-shrink:0;">🌊</span>
      <span class="sidebar-item-title" style="font-weight:700;">全部深度进阶 (16 阶段)</span>
    `;
    topItem.addEventListener('click', () => onSelect('all'));
  }

  topSection.appendChild(topItem);
  sidebar.appendChild(topSection);

  // 2. Stage Rows
  const createStageRow = (stage: LearningStage) => {
    const isActive = currentStageId === stage.id;

    const row = document.createElement('button');
    row.className = `sidebar-item ${isActive ? 'active' : ''}`;
    row.innerHTML = `
      <span class="chip ${stage.isAdvanced ? 'chip-advanced' : 'chip-main'}" style="font-size:10px;padding:1px 5px;flex-shrink:0;">
        ${String(stage.number).padStart(2, '0')}
      </span>
      <div class="sidebar-item-info">
        <span class="sidebar-item-title">${i18n.t(stage.titleKey)}</span>
      </div>
    `;
    row.addEventListener('click', () => onSelect(stage.id));
    return row;
  };

  // Main Path Section
  const mainSection = document.createElement('div');
  mainSection.className = 'sidebar-section';
  mainSection.innerHTML = `<span class="sidebar-section-title main-title">${docMode === 'roadmap' ? i18n.t('sidebar.main') : '核心主线进阶'}</span>`;

  mainStages.forEach((stage) => {
    mainSection.appendChild(createStageRow(stage));
  });
  sidebar.appendChild(mainSection);

  // Advanced Section
  const advSection = document.createElement('div');
  advSection.className = 'sidebar-section';
  advSection.innerHTML = `<span class="sidebar-section-title adv-title">${docMode === 'roadmap' ? i18n.t('sidebar.advanced') : '扩展专题进阶'}</span>`;

  advancedStages.forEach((stage) => {
    advSection.appendChild(createStageRow(stage));
  });
  sidebar.appendChild(advSection);

  // 3. Bottom Mode Switcher Card
  const footerSwitch = document.createElement('div');
  footerSwitch.className = 'sidebar-footer-switch';

  if (docMode === 'roadmap') {
    footerSwitch.innerHTML = `
      <button class="sidebar-switch-card card-to-deepdive" id="btn-switch-mode">
        <div class="switch-card-icon">🌊</div>
        <div class="switch-card-body">
          <div class="switch-card-tag">进入专项</div>
          <div class="switch-card-title">单端深度进阶 ➔</div>
          <div class="switch-card-sub">JVM/ART · ARC · 渲染机制</div>
        </div>
      </button>
    `;
  } else {
    footerSwitch.innerHTML = `
      <button class="sidebar-switch-card card-to-roadmap" id="btn-switch-mode">
        <div class="switch-card-icon">🗺️</div>
        <div class="switch-card-body">
          <div class="switch-card-tag">返回主线</div>
          <div class="switch-card-title">双端对照路线图 ➔</div>
          <div class="switch-card-sub">16 阶段 Android ⟷ iOS 对标</div>
        </div>
      </button>
    `;
  }

  footerSwitch.querySelector('#btn-switch-mode')?.addEventListener('click', () => {
    if (onSwitchDocMode) {
      onSwitchDocMode(docMode === 'roadmap' ? 'deepdive' : 'roadmap');
    }
  });

  sidebar.appendChild(footerSwitch);

  return sidebar;
}
