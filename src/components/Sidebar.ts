import { i18n } from '../services/i18n';
import { stages } from '../data/roadmap-data';
import { deepDiveDomains } from '../data/deep-dive-data';

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
      <span class="sidebar-item-title" style="font-weight:700;">${i18n.t('sidebar.start')} (16 阶段)</span>
    `;
    topItem.addEventListener('click', () => onSelect('home'));
  } else {
    topItem.innerHTML = `
      <span style="font-size:15px;flex-shrink:0;">${deepDivePlatform === 'android' ? '🟢' : '🔵'}</span>
      <span class="sidebar-item-title" style="font-weight:700;">${deepDivePlatform === 'android' ? 'Android' : 'iOS'} 进阶总览 (5 大领域)</span>
    `;
    topItem.addEventListener('click', () => onSelect('all'));
  }

  topSection.appendChild(topItem);
  sidebar.appendChild(topSection);

  if (docMode === 'roadmap') {
    // 2. Dual-Platform Roadmap: 16 Stages Section
    const stagesSection = document.createElement('div');
    stagesSection.className = 'sidebar-section';
    stagesSection.innerHTML = `<span class="sidebar-section-title main-title">16 个学习阶段</span>`;

    stages.forEach((stage) => {
      const isActive = currentStageId === stage.id;
      const displayTitle = i18n.t(stage.titleKey);

      const item = document.createElement('button');
      item.className = `sidebar-item ${isActive ? 'active' : ''}`;
      item.innerHTML = `
        <span class="sidebar-item-num">${String(stage.number).padStart(2, '0')}</span>
        <div class="sidebar-item-text" style="display:flex;flex-direction:column;gap:2px;">
          <span class="sidebar-item-title">${displayTitle}</span>
        </div>
      `;

      item.addEventListener('click', () => onSelect(stage.id));
      stagesSection.appendChild(item);
    });

    sidebar.appendChild(stagesSection);
  } else {
    // 2. Single-Platform Deep Dive: 5 Industrial Domains Accordion
    const domainsSection = document.createElement('div');
    domainsSection.className = 'sidebar-section';
    domainsSection.innerHTML = `<span class="sidebar-section-title main-title">${deepDivePlatform === 'android' ? 'Android' : 'iOS'} 5 大领域进阶</span>`;

    deepDiveDomains.forEach((domain) => {
      const isDomainActive = currentStageId === domain.id;
      const isExpanded = isDomainActive || currentStageId.startsWith(`${domain.id}:`);
      const mods = deepDivePlatform === 'android' ? domain.deepDive.android : domain.deepDive.ios;
      const displayTitle = i18n.t(domain.titleKey);

      // Domain accordion group
      const accordionGroup = document.createElement('div');
      accordionGroup.className = 'sidebar-accordion-group';

      // Accordion header button (navigates to Domain TOC)
      const headerBtn = document.createElement('button');
      headerBtn.className = `sidebar-item sidebar-accordion-header ${isDomainActive ? 'active' : ''}`;
      headerBtn.innerHTML = `
        <span class="sidebar-item-num">${String(domain.number).padStart(2, '0')}</span>
        <div class="sidebar-item-text" style="display:flex;flex-direction:column;gap:2px;flex:1;min-width:0;">
          <span class="sidebar-item-title">${displayTitle}</span>
        </div>
        <span class="sidebar-accordion-count">${mods ? mods.length : 0} 节</span>
        <svg class="sidebar-accordion-chevron ${isExpanded ? 'expanded' : ''}" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      `;

      // Accordion body: knowledge point sub-items
      const body = document.createElement('div');
      body.className = `sidebar-accordion-body ${isExpanded ? 'expanded' : ''}`;

      const bodyInner = document.createElement('div');
      bodyInner.className = 'sidebar-accordion-body-inner';

      if (mods && mods.length > 0) {
        mods.forEach((mod, modIdx) => {
          const isChildActive = currentStageId === `${domain.id}:${modIdx}`;
          const modItem = document.createElement('button');
          modItem.className = `sidebar-item sidebar-accordion-child ${isChildActive ? 'active' : ''}`;
          const truncTitle = mod.title.length > 22 ? mod.title.substring(0, 22) + '…' : mod.title;
          modItem.innerHTML = `
            <span class="sidebar-child-dot" style="background:${deepDivePlatform === 'android' ? 'var(--color-android, #10b981)' : 'var(--color-ios, #0ea5e9)'};"></span>
            <div class="sidebar-item-text" style="display:flex;flex-direction:column;gap:1px;min-width:0;">
              <span class="sidebar-child-tag">${mod.tag}</span>
              <span class="sidebar-item-title sidebar-child-title">${truncTitle}</span>
            </div>
          `;

          modItem.addEventListener('click', (e) => {
            e.stopPropagation();
            onSelect(`${domain.id}:${modIdx}`);
          });

          bodyInner.appendChild(modItem);
        });
      }

      body.appendChild(bodyInner);

      headerBtn.addEventListener('click', () => onSelect(domain.id));

      accordionGroup.appendChild(headerBtn);
      accordionGroup.appendChild(body);
      domainsSection.appendChild(accordionGroup);
    });

    sidebar.appendChild(domainsSection);
  }

  // 3. Bottom Mode Switcher Card
  if (onSwitchDocMode) {
    const bottomSection = document.createElement('div');
    bottomSection.className = 'sidebar-bottom-switch';
    bottomSection.style.padding = '14px 12px 18px';
    bottomSection.style.borderTop = '1px solid var(--color-border)';
    bottomSection.style.marginTop = 'auto';

    const switchBtn = document.createElement('button');
    switchBtn.className = 'sidebar-mode-switch-card';
    switchBtn.style.width = '100%';
    switchBtn.style.textAlign = 'left';
    switchBtn.style.padding = '10px 12px';
    switchBtn.style.borderRadius = '10px';
    switchBtn.style.border = '1px solid var(--color-border)';
    switchBtn.style.background = 'var(--color-surface-sunken)';
    switchBtn.style.cursor = 'pointer';
    switchBtn.style.display = 'flex';
    switchBtn.style.alignItems = 'center';
    switchBtn.style.gap = '10px';
    switchBtn.style.transition = 'all 0.2s ease';

    if (docMode === 'roadmap') {
      switchBtn.innerHTML = `
        <span style="font-size:18px;">💡</span>
        <div style="flex:1;overflow:hidden;">
          <div style="font-size:12px;font-weight:700;color:var(--color-ink);line-height:1.2;">切换至：单端深度进阶</div>
          <div style="font-size:11px;color:var(--color-ink-muted);margin-top:2px;">5 大工业级领域底层内幕 ➔</div>
        </div>
      `;
      switchBtn.addEventListener('click', () => onSwitchDocMode('deepdive'));
    } else {
      switchBtn.innerHTML = `
        <span style="font-size:18px;">🗺️</span>
        <div style="flex:1;overflow:hidden;">
          <div style="font-size:12px;font-weight:700;color:var(--color-ink);line-height:1.2;">切换至：双端路线图</div>
          <div style="font-size:11px;color:var(--color-ink-muted);margin-top:2px;">16 阶段双端工程全景对照 ➔</div>
        </div>
      `;
      switchBtn.addEventListener('click', () => onSwitchDocMode('roadmap'));
    }

    bottomSection.appendChild(switchBtn);
    sidebar.appendChild(bottomSection);
  }

  return sidebar;
}
