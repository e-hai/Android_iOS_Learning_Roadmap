import { LearningStage } from '../models/types';
import { i18n } from '../services/i18n';
import { progressStorage } from '../services/storage';
import { renderComparisonTable } from './ComparisonTable';
import { stages } from '../data/roadmap-data';
import { showToast } from './Toast';

export function renderStageDetail(
  stage: LearningStage,
  onNavigate: (targetId: string) => void
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'content-container';

  // Header
  const header = document.createElement('div');
  header.className = 'stage-detail-header';
  header.innerHTML = `
    <div class="stage-detail-meta">
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="chip ${stage.isAdvanced ? 'chip-advanced' : 'chip-main'}">
          ${stage.isAdvanced ? i18n.t('badge.advanced') : i18n.t('badge.main')}
        </span>
        <span style="font-size:12px;color:var(--color-ink-muted);letter-spacing:1px;">
          ${stage.stars}
        </span>
      </div>
      <span class="stage-number-large">${String(stage.number).padStart(2, '0')}</span>
    </div>
    <h1 class="stage-detail-title">${i18n.t(stage.titleKey)}</h1>
  `;
  container.appendChild(header);

  // Progress Toggles Card
  const togglesCard = document.createElement('div');
  togglesCard.className = 'progress-toggles-card';

  const isRead = progressStorage.isReadComplete(stage.id);
  const isPracticed = progressStorage.isPracticeComplete(stage.id);

  togglesCard.innerHTML = `
    <div class="toggle-group">
      <label class="toggle-label">
        <input type="checkbox" class="toggle-checkbox" id="read-toggle" ${isRead ? 'checked' : ''}>
        <span>${i18n.t('detail.read')}</span>
      </label>
      <label class="toggle-label">
        <input type="checkbox" class="toggle-checkbox" id="practice-toggle" ${isPracticed ? 'checked' : ''}>
        <span>${i18n.t('detail.practice')}</span>
      </label>
    </div>
    <div style="display:flex;align-items:center;gap:8px;">
      <span id="stage-status-badge" class="chip ${progressStorage.isStageFullyComplete(stage.id) ? 'chip-main' : ''}" style="${progressStorage.isStageFullyComplete(stage.id) ? '' : 'display:none;'}">
        ✓ ${i18n.t('badge.main')}
      </span>
    </div>
  `;

  const readCheckbox = togglesCard.querySelector('#read-toggle') as HTMLInputElement;
  const practiceCheckbox = togglesCard.querySelector('#practice-toggle') as HTMLInputElement;
  const statusBadge = togglesCard.querySelector('#stage-status-badge') as HTMLElement;

  const updateStatus = () => {
    const fullyDone = progressStorage.isStageFullyComplete(stage.id);
    if (statusBadge) {
      statusBadge.style.display = fullyDone ? 'inline-flex' : 'none';
      statusBadge.textContent = fullyDone ? '✓ ' + i18n.t('card.next.done') : '';
    }
  };

  readCheckbox.addEventListener('change', () => {
    progressStorage.setReadComplete(stage.id, readCheckbox.checked);
    updateStatus();
    if (readCheckbox.checked) showToast(`✓ ${i18n.t('detail.read')}`);
  });

  practiceCheckbox.addEventListener('change', () => {
    progressStorage.setPracticeComplete(stage.id, practiceCheckbox.checked);
    updateStatus();
    if (practiceCheckbox.checked) showToast(`✓ ${i18n.t('detail.practice')}`);
  });

  container.appendChild(togglesCard);

  // Goal Section
  const goalSection = document.createElement('div');
  goalSection.innerHTML = `
    <div class="section-header">
      <div class="section-header-bar"></div>
      <span class="section-header-title">${i18n.t('detail.section.goal')}</span>
    </div>
    <div class="callout-box goal-box">
      ${i18n.t(stage.goalKey)}
    </div>
  `;
  container.appendChild(goalSection);

  // Notes Section (if any)
  if (stage.noteKeys && stage.noteKeys.length > 0) {
    const notesSection = document.createElement('div');
    notesSection.innerHTML = `
      <div class="section-header">
        <div class="section-header-bar"></div>
        <span class="section-header-title">${i18n.t('detail.section.notes')}</span>
      </div>
      <div class="callout-box" style="margin-bottom:24px;">
        <ul class="notes-list">
          ${stage.noteKeys.map((k) => `<li>${i18n.t(k)}</li>`).join('')}
        </ul>
      </div>
    `;
    container.appendChild(notesSection);
  }

  // Comparison Table Section
  const tableSection = document.createElement('div');
  tableSection.innerHTML = `
    <div class="section-header">
      <div class="section-header-bar ios-bar"></div>
      <span class="section-header-title">${i18n.t('detail.section.comparison')}</span>
    </div>
  `;
  tableSection.appendChild(
    renderComparisonTable(stage.rows, i18n.t('detail.col.android'), i18n.t('detail.col.ios'))
  );
  container.appendChild(tableSection);

  // Extra Hint Section (if any)
  if (stage.extraHintKey) {
    const hintSection = document.createElement('div');
    hintSection.innerHTML = `
      <div class="section-header">
        <div class="section-header-bar" style="background:var(--color-warn);"></div>
        <span class="section-header-title">${i18n.t('detail.section.hint')}</span>
      </div>
      <div class="callout-box hint-box">
        ${i18n.t(stage.extraHintKey)}
      </div>
    `;
    container.appendChild(hintSection);
  }

  // Practice Section
  const practiceSection = document.createElement('div');
  practiceSection.innerHTML = `
    <div class="section-header">
      <div class="section-header-bar" style="background:var(--color-done);"></div>
      <span class="section-header-title">${i18n.t('detail.section.practice')}</span>
    </div>
    <div class="callout-box practice-box">
      ${i18n.t(stage.practiceKey)}
    </div>
  `;
  container.appendChild(practiceSection);

  // Bottom Navigation (Prev / Next)
  const currentIndex = stages.findIndex((s) => s.id === stage.id);
  const prevStage = currentIndex > 0 ? stages[currentIndex - 1] : null;
  const nextStage = currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;

  const navFooter = document.createElement('div');
  navFooter.style.display = 'flex';
  navFooter.style.justifyContent = 'space-between';
  navFooter.style.marginTop = '40px';
  navFooter.style.paddingTop = '20px';
  navFooter.style.borderTop = '1px solid var(--color-border)';

  if (prevStage) {
    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn btn-secondary';
    prevBtn.innerHTML = `← ${i18n.t('web.prev_stage')}: ${prevStage.number}. ${i18n.t(prevStage.titleKey)}`;
    prevBtn.addEventListener('click', () => onNavigate(prevStage.id));
    navFooter.appendChild(prevBtn);
  } else {
    navFooter.appendChild(document.createElement('div'));
  }

  if (nextStage) {
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-primary';
    nextBtn.innerHTML = `${i18n.t('web.next_stage')}: ${nextStage.number}. ${i18n.t(nextStage.titleKey)} →`;
    nextBtn.addEventListener('click', () => onNavigate(nextStage.id));
    navFooter.appendChild(nextBtn);
  }

  container.appendChild(navFooter);

  return container;
}
