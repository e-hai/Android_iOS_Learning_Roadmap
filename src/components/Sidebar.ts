import { i18n } from '../services/i18n';
import { stages } from '../data/roadmap-data';

export function renderSidebar(
  currentStageId: string,
  onSelect: (targetId: string) => void,
  docMode: 'roadmap' | 'deepdive' = 'roadmap',
  deepDivePlatform: 'android' | 'ios' = 'android',
  onSwitchDocMode?: (mode: 'roadmap' | 'deepdive') => void
): HTMLElement {
  const sidebar = document.createElement('aside');
  sidebar.className = 'app-sidebar';
  sidebar.id = 'app-sidebar';

  // 1. Home Item (in roadmap mode) or Deep Dive Overview Item (in deepdive mode)
  const topSection = document.createElement('div');
  topSection.className = 'sidebar-section';

  const topItem = document.createElement('button');
  const isTopActive = currentStageId === 'home' || currentStageId === 'all';
  topItem.className = `sidebar-item ${isTopActive ? 'active' : ''}`;
  
  if (docMode === 'roadmap') {
    topItem.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-accent);flex-shrink:0;"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      <span class="sidebar-item-title" style="font-weight:700;">${i18n.t('sidebar.start')}</span>
    `;
    topItem.addEventListener('click', () => onSelect('home'));
  } else {
    topItem.innerHTML = `
      <span style="font-size:15px;flex-shrink:0;">${deepDivePlatform === 'android' ? '🟢' : '🔵'}</span>
      <span class="sidebar-item-title" style="font-weight:700;">${deepDivePlatform === 'android' ? 'Android' : 'iOS'} 进阶总览 (16 阶段)</span>
    `;
    topItem.addEventListener('click', () => onSelect('all'));
  }

  topSection.appendChild(topItem);
  sidebar.appendChild(topSection);

  // 2. Unified 16 Stages Section
  const stagesSection = document.createElement('div');
  stagesSection.className = 'sidebar-section';
  stagesSection.innerHTML = `<span class="sidebar-section-title main-title">${docMode === 'roadmap' ? '16 个学习阶段' : `${deepDivePlatform === 'android' ? 'Android' : 'iOS'} 16 阶段进阶`}</span>`;

  stages.forEach((stage) => {
    const isActive = currentStageId === stage.id;

    let subHtml = '';
    let displayTitle = i18n.t(stage.titleKey);

    if (docMode === 'deepdive') {
      const stageData = stages.find((s) => s.id === stage.id);
      if (stageData && stageData.deepDive) {
        const mods = deepDivePlatform === 'android' ? stageData.deepDive.android : stageData.deepDive.ios;
        if (mods && mods.length > 0) {
          const firstMod = mods[0];
          subHtml = `<span class="sidebar-item-sub" style="font-size:11px;color:var(--color-ink-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;max-width:170px;">${firstMod.tag}: ${firstMod.title.split('(')[0].trim()}</span>`;
        }
      }
      displayTitle = `${i18n.t(stage.titleKey)} · ${deepDivePlatform === 'android' ? 'Android' : 'iOS'}`;
    }

    const row = document.createElement('button');
    row.className = `sidebar-item ${isActive ? 'active' : ''}`;
    row.innerHTML = `
      <span class="chip chip-main" style="font-size:10.5px;padding:1px 6px;flex-shrink:0;">
        ${String(stage.number).padStart(2, '0')}
      </span>
      <div class="sidebar-item-info">
        <span class="sidebar-item-title">${displayTitle}</span>
        ${subHtml}
      </div>
    `;
    row.addEventListener('click', () => onSelect(stage.id));
    stagesSection.appendChild(row);
  });

  sidebar.appendChild(stagesSection);

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
