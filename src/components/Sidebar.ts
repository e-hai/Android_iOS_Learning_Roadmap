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
    const iconSvg = deepDivePlatform === 'android'
      ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style="color:var(--color-android);flex-shrink:0;"><path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.996-3.4572c.1576-.273.0641-.6214-.2089-.7789-.273-.1575-.6214-.0641-.7789.2089l-2.0234 3.5046C15.3414 8.2435 13.7226 7.95 12 7.95c-1.7226 0-3.3414.2935-4.8723.8488L5.1043 5.2942c-.1575-.273-.5059-.3664-.7789-.2089-.273.1575-.3665.5059-.2089.7789l1.996 3.4572C2.6845 11.233 0 14.887 0 19.1414h24c0-4.2544-2.6845-7.9084-6.1185-9.82"/></svg>`
      : `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style="color:var(--color-ios);flex-shrink:0;"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.92.04-2.02.62-2.66 1.37-.56.65-.99 1.7-0.86 2.72 1.02.08 2.02-.54 2.6-1.24z"/></svg>`;

    topItem.innerHTML = `
      ${iconSvg}
      <span class="sidebar-item-title" style="font-weight:700;">${deepDivePlatform === 'android' ? 'Android' : 'iOS'} 进阶总览</span>
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
    // 2. Single-Platform Deep Dive: Flat Grouped Domains & Knowledge Points
    const domainsSection = document.createElement('div');
    domainsSection.className = 'sidebar-section';
    domainsSection.innerHTML = `<span class="sidebar-section-title main-title">${deepDivePlatform === 'android' ? 'Android' : 'iOS'} 进阶知识树</span>`;

    deepDiveDomains.forEach((domain) => {
      const mods = deepDivePlatform === 'android' ? domain.deepDive.android : domain.deepDive.ios;
      const displayTitle = i18n.t(domain.titleKey);

      // Domain Group Container
      const domainGroup = document.createElement('div');
      domainGroup.className = 'sidebar-domain-group';

      // Domain Section Header (Static divider label, not clickable)
      const domainHeader = document.createElement('div');
      domainHeader.className = 'sidebar-domain-header';
      domainHeader.innerHTML = `
        <span class="sidebar-domain-num">${String(domain.number).padStart(2, '0')}</span>
        <span class="sidebar-domain-title">${displayTitle}</span>
        <span class="sidebar-domain-count">${mods ? mods.length : 0} 节</span>
      `;
      domainGroup.appendChild(domainHeader);

      // Flat Knowledge Point List
      if (mods && mods.length > 0) {
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'sidebar-domain-items';

        mods.forEach((mod, modIdx) => {
          const isChildActive = currentStageId === `${domain.id}:${modIdx}`;
          const modItem = document.createElement('button');
          modItem.className = `sidebar-item sidebar-child-item ${isChildActive ? 'active' : ''}`;
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

          itemsContainer.appendChild(modItem);
        });

        domainGroup.appendChild(itemsContainer);
      }

      domainsSection.appendChild(domainGroup);
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
          <div style="font-size:11px;color:var(--color-ink-muted);margin-top:2px;">单端底层运行机制与进阶实战 ➔</div>
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
