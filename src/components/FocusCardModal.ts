import { LearningStage } from '../models/types';
import { i18n } from '../services/i18n';
import { stages } from '../data/roadmap-data';
import { renderComparisonTable } from './ComparisonTable';

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

  const card = document.createElement('div');
  card.className = 'focus-card';
  card.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  backdrop.appendChild(card);

  // 1. Top color strip (created once)
  const topStrip = document.createElement('div');
  topStrip.className = 'focus-card-top-strip';
  card.appendChild(topStrip);

  // 2. Header (created once, updated dynamically)
  const header = document.createElement('div');
  header.className = 'focus-card-header';
  header.innerHTML = `
    <div class="focus-card-header-left">
      <div class="focus-card-num-badge" id="focus-num-badge">01</div>
      <div class="focus-card-meta">
        <div class="focus-card-chips" id="focus-chips"></div>
        <h2 class="focus-card-title" id="focus-title"></h2>
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
  card.appendChild(header);

  // 3. Scrollable Body (created once, populated dynamically)
  const body = document.createElement('div');
  body.className = 'focus-card-body';
  card.appendChild(body);

  // 4. Footer (created once, buttons updated dynamically)
  const footer = document.createElement('div');
  footer.className = 'focus-card-footer';
  footer.innerHTML = `
    <div class="focus-shortcut-hint">
      <kbd>←</kbd> <kbd>→</kbd> ${i18n.t('web.prev_stage')} / ${i18n.t('web.next_stage')}
    </div>
    <div class="focus-footer-nav" id="focus-footer-nav">
      <button class="btn btn-secondary btn-sm" id="btn-focus-prev">
        ← ${i18n.t('web.prev_stage')}
      </button>
      <button class="btn btn-primary btn-sm" id="btn-focus-next">
        ${i18n.t('web.next_stage')} →
      </button>
    </div>
  `;
  card.appendChild(footer);

  const prevBtn = footer.querySelector('#btn-focus-prev') as HTMLButtonElement;
  const nextBtn = footer.querySelector('#btn-focus-next') as HTMLButtonElement;

  prevBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const idx = stages.findIndex((s) => s.id === currentStage.id);
    if (idx > 0) {
      setStage(stages[idx - 1]);
    }
  });

  nextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const idx = stages.findIndex((s) => s.id === currentStage.id);
    if (idx < stages.length - 1) {
      setStage(stages[idx + 1]);
    }
  });

  // Function to smoothly update card content without flashing
  const setStage = (stage: LearningStage) => {
    currentStage = stage;

    // Update Header
    const numBadge = header.querySelector('#focus-num-badge') as HTMLElement;
    const chipsContainer = header.querySelector('#focus-chips') as HTMLElement;
    const titleEl = header.querySelector('#focus-title') as HTMLElement;

    if (numBadge) numBadge.textContent = String(stage.number).padStart(2, '0');
    if (chipsContainer) {
      chipsContainer.innerHTML = `
        <span class="chip ${stage.isAdvanced ? 'chip-advanced' : 'chip-main'}">
          ${stage.isAdvanced ? i18n.t('badge.advanced') : i18n.t('badge.main')}
        </span>
        <span style="color:var(--color-ink-muted);font-size:10px;">${stage.stars}</span>
        <span style="color:var(--color-ink-faint);">·</span>
        <span style="font-family:var(--font-mono);font-size:11px;color:var(--color-ink-muted);">
          ${stage.number}/${stages.length}
        </span>
      `;
    }
    if (titleEl) titleEl.textContent = i18n.t(stage.titleKey);

    // Update Body smoothly
    body.innerHTML = '';
    body.scrollTop = 0;

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

    // Update Footer Buttons
    const currentIndex = stages.findIndex((s) => s.id === stage.id);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < stages.length - 1;

    prevBtn.style.visibility = hasPrev ? 'visible' : 'hidden';
    nextBtn.style.visibility = hasNext ? 'visible' : 'hidden';

    // Notify stage change to main controller
    onStageChange(stage.id);
  };

  // Initial populate
  setStage(currentStage);

  // Close on backdrop click
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      onClose();
    }
  });

  // Keyboard navigation (← / → / Escape)
  const keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft') {
      const idx = stages.findIndex((s) => s.id === currentStage.id);
      if (idx > 0) {
        setStage(stages[idx - 1]);
      }
    } else if (e.key === 'ArrowRight') {
      const idx = stages.findIndex((s) => s.id === currentStage.id);
      if (idx < stages.length - 1) {
        setStage(stages[idx + 1]);
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
