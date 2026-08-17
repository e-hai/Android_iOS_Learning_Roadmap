import { LearningStage } from '../models/types';
import { i18n } from '../services/i18n';
import { progressStorage } from '../services/storage';
import { stages } from '../data/roadmap-data';

export function renderSidebar(
  currentStageId: string,
  onSelect: (targetId: string) => void
): HTMLElement {
  const sidebar = document.createElement('aside');
  sidebar.className = 'app-sidebar';
  sidebar.id = 'app-sidebar';

  const mainStages = stages.filter((s) => !s.isAdvanced);
  const advancedStages = stages.filter((s) => s.isAdvanced);

  // Home Item
  const homeSection = document.createElement('div');
  homeSection.className = 'sidebar-section';

  const homeItem = document.createElement('button');
  homeItem.className = `sidebar-item ${currentStageId === 'home' ? 'active' : ''}`;
  homeItem.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-accent);flex-shrink:0;"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    <span class="sidebar-item-title" style="font-weight:600;">${i18n.t('sidebar.start')}</span>
  `;
  homeItem.addEventListener('click', () => onSelect('home'));
  homeSection.appendChild(homeItem);
  sidebar.appendChild(homeSection);

  const createStageRow = (stage: LearningStage) => {
    const isDone = progressStorage.isStageFullyComplete(stage.id);
    const isActive = currentStageId === stage.id;

    const row = document.createElement('button');
    row.className = `sidebar-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`;
    row.innerHTML = `
      <div class="sidebar-item-check">
        ${isDone ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
      </div>
      <div class="sidebar-item-info">
        <span class="sidebar-item-title">${stage.number}. ${i18n.t(stage.titleKey)}</span>
        <span class="sidebar-item-stars">${stage.stars}</span>
      </div>
    `;
    row.addEventListener('click', () => onSelect(stage.id));
    return row;
  };

  // Main Path Section
  const mainSection = document.createElement('div');
  mainSection.className = 'sidebar-section';
  mainSection.innerHTML = `<span class="sidebar-section-title main-title">${i18n.t('sidebar.main')} (${progressStorage.getMainPathCompletedCount(mainStages)}/${mainStages.length})</span>`;

  mainStages.forEach((stage) => {
    mainSection.appendChild(createStageRow(stage));
  });
  sidebar.appendChild(mainSection);

  // Advanced Section
  const advSection = document.createElement('div');
  advSection.className = 'sidebar-section';
  advSection.innerHTML = `<span class="sidebar-section-title adv-title">${i18n.t('sidebar.advanced')}</span>`;

  advancedStages.forEach((stage) => {
    advSection.appendChild(createStageRow(stage));
  });
  sidebar.appendChild(advSection);

  return sidebar;
}
