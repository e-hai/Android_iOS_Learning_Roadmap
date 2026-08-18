import { LearningStage } from '../models/types';
import { i18n } from '../services/i18n';
import { renderComparisonTable } from './ComparisonTable';
import { renderArchitectureDiagram } from './ArchitectureDiagram';
import { stages } from '../data/roadmap-data';
import { openMemoryFlashcardsModal } from '../visuals/cards/MemoryFlashcardModal3D';

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
      </div>
      <span class="stage-number-large">${String(stage.number).padStart(2, '0')}</span>
    </div>
    <h1 class="stage-detail-title">${i18n.t(stage.titleKey)}</h1>
  `;
  container.appendChild(header);

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

  // Comparison Table Sections (Directly visible)
  if (stage.sections && stage.sections.length > 0) {
    stage.sections.forEach((section, idx) => {
      const sectionContainer = document.createElement('div');
      sectionContainer.style.marginBottom = '24px';
      sectionContainer.innerHTML = `
        <div class="section-header" style="margin-top:${idx === 0 ? '16px' : '24px'};">
          <div class="section-header-bar ${idx === 0 ? '' : 'ios-bar'}"></div>
          <span class="section-header-title">${i18n.t(section.titleKey)}</span>
        </div>
      `;
      sectionContainer.appendChild(
        renderComparisonTable(section.rows, i18n.t('detail.col.android'), i18n.t('detail.col.ios'))
      );
      container.appendChild(sectionContainer);
    });
  } else {
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
  }

  // Extra Architecture & Hierarchy Visual Diagram (if any)
  if (stage.extraHintKey) {
    const hintSection = document.createElement('div');
    hintSection.innerHTML = `
      <div class="section-header" style="margin-top:24px;">
        <div class="section-header-bar" style="background:var(--color-warn);"></div>
        <span class="section-header-title">${i18n.t('detail.section.hint')}</span>
      </div>
    `;
    hintSection.appendChild(renderArchitectureDiagram(stage.id, stage.extraHintKey));
    container.appendChild(hintSection);
  }

  // Notes Section (if any)
  if (stage.noteKeys && stage.noteKeys.length > 0) {
    const notesSection = document.createElement('div');
    const noteCardsHtml = stage.noteKeys
      .map((k) => {
        const text = i18n.t(k);
        const tagMatch = text.match(/^【([^】]+)】\s*(.*)$/) || text.match(/^\[([^\]]+)\]\s*(.*)$/);
        if (tagMatch) {
          const [, tag, body] = tagMatch;
          return `
            <li class="note-item-card">
              <div class="note-item-header">
                <span class="note-item-badge">【${escapeHtml(tag)}】</span>
              </div>
              <div class="note-item-text">${escapeHtml(body)}</div>
            </li>
          `;
        }
        return `
          <li class="note-item-card">
            <div class="note-item-text">${escapeHtml(text)}</div>
          </li>
        `;
      })
      .join('');

    notesSection.innerHTML = `
      <div class="section-header" style="margin-top:28px;display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:8px;">
          <div class="section-header-bar"></div>
          <span class="section-header-title">${i18n.t('detail.section.notes')}</span>
        </div>
        <button class="btn btn-secondary btn-sm" id="btn-stage-flashcards" style="color:var(--color-accent);font-weight:700;">
          ⚡ 本章 3D 闪卡速测
        </button>
      </div>
      <ul class="notes-grid" style="margin-bottom:28px;">
        ${noteCardsHtml}
      </ul>
    `;
    notesSection.querySelector('#btn-stage-flashcards')?.addEventListener('click', () => {
      openMemoryFlashcardsModal(stage.id);
    });
    container.appendChild(notesSection);
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

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
