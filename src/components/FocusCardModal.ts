import { LearningStage } from '../models/types';
import { i18n } from '../services/i18n';
import { progressStorage } from '../services/storage';
import { stages } from '../data/roadmap-data';
import { renderComparisonTable } from './ComparisonTable';
import { showToast } from './Toast';

export function renderFocusCardModal(
  currentStageId: string,
  onClose: () => void,
  onStageChange: (newStageId: string) => void
): HTMLElement {
  const backdrop = document.createElement('div');
  backdrop.className = 'focus-modal-backdrop';
  backdrop.id = 'focus-card-backdrop';

  let currentStage: LearningStage =
    stages.find((s) => s.id === currentStageId) || stages[0];

  const updateCardContent = (stage: LearningStage) => {
    currentStage = stage;
    card.innerHTML = '';
    buildCard(card, stage);
  };

  const card = document.createElement('div');
  card.className = 'focus-card';
  card.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  backdrop.appendChild(card);

  const buildCard = (container: HTMLElement, stage: LearningStage) => {
    const isRead = progressStorage.isReadComplete(stage.id);
    const isPracticed = progressStorage.isPracticeComplete(stage.id);
    const isFullyDone = progressStorage.isStageFullyComplete(stage.id);
    const isAllDone = progressStorage.getNextIncompleteStage(stages) === null && isFullyDone;

    const currentIndex = stages.findIndex((s) => s.id === stage.id);
    const prevStage = currentIndex > 0 ? stages[currentIndex - 1] : null;
    const nextStage = currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;

    // Top color strip
    const topStrip = document.createElement('div');
    topStrip.className = 'focus-card-top-strip';
    container.appendChild(topStrip);

    // Header
    const header = document.createElement('div');
    header.className = 'focus-card-header';
    header.innerHTML = `
      <div class="focus-card-header-left">
        <div class="focus-card-num-badge">${String(stage.number).padStart(2, '0')}</div>
        <div class="focus-card-meta">
          <div class="focus-card-chips">
            <span class="chip ${stage.isAdvanced ? 'chip-advanced' : 'chip-main'}">
              ${stage.isAdvanced ? i18n.t('badge.advanced') : i18n.t('badge.main')}
            </span>
            <span style="color:var(--color-ink-muted);font-size:10px;">${stage.stars}</span>
            <span style="color:var(--color-ink-faint);">·</span>
            <span style="font-family:var(--font-mono);font-size:11px;color:var(--color-ink-muted);">
              ${stage.number}/${stages.length}
            </span>
          </div>
          <h2 class="focus-card-title">${i18n.t(stage.titleKey)}</h2>
        </div>
      </div>
      <button class="focus-card-close-btn" id="btn-close-focus" title="${i18n.t('web.close')}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;
    header.querySelector('#btn-close-focus')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    });
    container.appendChild(header);

    // Body
    const body = document.createElement('div');
    body.className = 'focus-card-body';

    if (isAllDone) {
      const banner = document.createElement('div');
      banner.className = 'focus-all-done-banner';
      banner.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        <span>${i18n.t('web.all_completed')}</span>
      `;
      body.appendChild(banner);
    }

    // Goal
    const goalBox = document.createElement('div');
    goalBox.className = 'callout-box goal-box';
    goalBox.innerHTML = `<strong>${i18n.t('detail.section.goal')}:</strong> ${i18n.t(stage.goalKey)}`;
    body.appendChild(goalBox);

    // Comparison Table
    const compHeader = document.createElement('div');
    compHeader.innerHTML = `
      <div class="section-header">
        <div class="section-header-bar ios-bar"></div>
        <span class="section-header-title">${i18n.t('detail.section.comparison')}</span>
      </div>
    `;
    body.appendChild(compHeader);
    body.appendChild(
      renderComparisonTable(stage.rows, i18n.t('detail.col.android'), i18n.t('detail.col.ios'))
    );

    // Notes
    if (stage.noteKeys && stage.noteKeys.length > 0) {
      const notesBox = document.createElement('div');
      notesBox.className = 'callout-box';
      notesBox.innerHTML = `
        <strong style="display:block;margin-bottom:6px;">${i18n.t('detail.section.notes')}:</strong>
        <ul class="notes-list">
          ${stage.noteKeys.map((k) => `<li>${i18n.t(k)}</li>`).join('')}
        </ul>
      `;
      body.appendChild(notesBox);
    }

    // Extra Hint
    if (stage.extraHintKey) {
      const hintBox = document.createElement('div');
      hintBox.className = 'callout-box hint-box';
      hintBox.innerHTML = `<strong>${i18n.t('detail.section.hint')}:</strong> ${i18n.t(stage.extraHintKey)}`;
      body.appendChild(hintBox);
    }

    // Practice
    const practiceBox = document.createElement('div');
    practiceBox.className = 'callout-box practice-box';
    practiceBox.innerHTML = `<strong>${i18n.t('detail.section.practice')}:</strong> ${i18n.t(stage.practiceKey)}`;
    body.appendChild(practiceBox);

    container.appendChild(body);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'focus-card-footer';
    footer.innerHTML = `
      <div class="focus-footer-checks">
        <label class="toggle-label" style="font-size:12.5px;">
          <input type="checkbox" class="toggle-checkbox" id="focus-read-check" ${isRead ? 'checked' : ''}>
          <span>${i18n.t('card.check.read')}</span>
        </label>
        <label class="toggle-label" style="font-size:12.5px;">
          <input type="checkbox" class="toggle-checkbox" id="focus-practice-check" ${isPracticed ? 'checked' : ''}>
          <span>${i18n.t('card.check.practice')}</span>
        </label>
      </div>

      <div class="focus-footer-nav">
        ${
          prevStage
            ? `<button class="btn btn-secondary btn-sm" id="btn-focus-prev" title="←">
                ← ${i18n.t('web.prev_stage')}
              </button>`
            : ''
        }
        <button class="btn btn-primary btn-sm" id="btn-focus-next">
          ${isAllDone ? i18n.t('card.next.done') : i18n.t('card.next.stage')} →
        </button>
      </div>
    `;

    // Checkbox events
    const readBox = footer.querySelector('#focus-read-check') as HTMLInputElement;
    const practiceBoxInput = footer.querySelector('#focus-practice-check') as HTMLInputElement;

    readBox.addEventListener('change', () => {
      progressStorage.setReadComplete(stage.id, readBox.checked);
      if (readBox.checked) showToast(`✓ ${i18n.t('card.check.read')}`);
    });

    practiceBoxInput.addEventListener('change', () => {
      progressStorage.setPracticeComplete(stage.id, practiceBoxInput.checked);
      if (practiceBoxInput.checked) showToast(`✓ ${i18n.t('card.check.practice')}`);
    });

    footer.querySelector('#btn-focus-prev')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (prevStage) {
        updateCardContent(prevStage);
        onStageChange(prevStage.id);
      }
    });

    footer.querySelector('#btn-focus-next')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Advance to next incomplete stage or next index
      const laterIncomplete = stages.find(
        (s) => s.number > stage.number && !progressStorage.isStageFullyComplete(s.id)
      );
      const next = laterIncomplete || progressStorage.getNextIncompleteStage(stages) || nextStage;

      if (next && next.id !== stage.id) {
        updateCardContent(next);
        onStageChange(next.id);
      } else {
        showToast(i18n.t('web.all_completed'));
      }
    });

    container.appendChild(footer);
  };

  buildCard(card, currentStage);

  // Close on backdrop click
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      onClose();
    }
  });

  // Keyboard navigation
  const keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft') {
      const idx = stages.findIndex((s) => s.id === currentStage.id);
      if (idx > 0) {
        updateCardContent(stages[idx - 1]);
        onStageChange(stages[idx - 1].id);
      }
    } else if (e.key === 'ArrowRight') {
      const idx = stages.findIndex((s) => s.id === currentStage.id);
      if (idx < stages.length - 1) {
        updateCardContent(stages[idx + 1]);
        onStageChange(stages[idx + 1].id);
      }
    }
  };

  window.addEventListener('keydown', keyHandler);

  // Cleanup key handler when removed
  const originalRemove = backdrop.remove.bind(backdrop);
  backdrop.remove = () => {
    window.removeEventListener('keydown', keyHandler);
    originalRemove();
  };

  return backdrop;
}
