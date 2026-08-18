import confetti from 'canvas-confetti';
import { stages } from '../../data/roadmap-data';
import { i18n } from '../../services/i18n';

interface FlashcardItem {
  stageId: string;
  stageNum: number;
  stageTitle: string;
  noteKey: string;
  tag: string;
  body: string;
}

export function openMemoryFlashcardsModal(initialStageId?: string): HTMLElement {
  // Collect all 64 flashcards
  const allCards: FlashcardItem[] = [];

  stages.forEach((stage) => {
    stage.noteKeys?.forEach((nk) => {
      const fullText = i18n.t(nk);
      const tagMatch = fullText.match(/^【([^】]+)】\s*(.*)$/) || fullText.match(/^\[([^\]]+)\]\s*(.*)$/);
      let tag = '避坑法则';
      let body = fullText;
      if (tagMatch) {
        tag = tagMatch[1];
        body = tagMatch[2];
      }
      allCards.push({
        stageId: stage.id,
        stageNum: stage.number,
        stageTitle: i18n.t(stage.titleKey),
        noteKey: nk,
        tag,
        body,
      });
    });
  });

  // Filter state
  let currentStageFilter = initialStageId ?? 'all';
  let filteredCards = currentStageFilter === 'all' ? allCards : allCards.filter((c) => c.stageId === currentStageFilter);
  let currentIndex = 0;
  let isFlipped = false;

  const backdrop = document.createElement('div');
  backdrop.className = 'flashcard-modal-backdrop';

  const modal = document.createElement('div');
  modal.className = 'flashcard-modal';
  backdrop.appendChild(modal);

  const renderModalContent = () => {
    if (currentIndex >= filteredCards.length) currentIndex = 0;
    if (currentIndex < 0) currentIndex = filteredCards.length - 1;

    const curCard = filteredCards[currentIndex] || allCards[0];

    modal.innerHTML = `
      <div class="flashcard-header">
        <div class="flashcard-header-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          <span>3D 避坑记忆闪卡</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <span class="flashcard-progress">${currentIndex + 1} / ${filteredCards.length}</span>
          <button class="btn-ghost" id="btn-close-flashcard" style="padding:4px;" title="关闭">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      <div class="flashcard-stage-filter">
        <button class="stage-pill ${currentStageFilter === 'all' ? 'active' : ''}" data-filter="all">全部阶段 (64)</button>
        ${stages
          .map(
            (s) => `
          <button class="stage-pill ${currentStageFilter === s.id ? 'active' : ''}" data-filter="${s.id}">
            ${String(s.number).padStart(2, '0')}. ${i18n.t(s.titleKey)}
          </button>
        `
          )
          .join('')}
      </div>

      <div class="flashcard-scene">
        <div class="flashcard-3d ${isFlipped ? 'flipped' : ''}" id="flashcard-cube">
          <!-- Front Face -->
          <div class="flashcard-face flashcard-face-front">
            <div>
              <div class="flashcard-tag">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
                <span>STAGE ${String(curCard.stageNum).padStart(2, '0')} · ${curCard.stageTitle}</span>
              </div>
              <div class="flashcard-question">
                🤔 在【${curCard.stageTitle}】中，关于「${curCard.tag}」的 iOS 核心机制与避坑要点是什么？
              </div>
            </div>
            <div class="flashcard-hint-text">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              <span>点击卡片 3D 翻转揭晓答案 ➔</span>
            </div>
          </div>

          <!-- Back Face -->
          <div class="flashcard-face flashcard-face-back">
            <div>
              <div class="flashcard-tag" style="color:var(--color-ios);">
                <span>✨ 黄金避坑法则</span>
              </div>
              <div class="flashcard-answer-badge">【${curCard.tag}】</div>
              <div class="flashcard-answer-body">${curCard.body}</div>
            </div>
            <div class="flashcard-hint-text" style="color:var(--color-ios);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 15l-6-6-6 6"/></svg>
              <span>再次点击翻回正面</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flashcard-actions">
        <button class="btn btn-secondary btn-sm" id="btn-flashcard-shuffle">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
          <span>随机抽卡</span>
        </button>

        <div class="flashcard-btn-group">
          <button class="btn btn-secondary btn-sm" id="btn-flashcard-prev">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            <span>上一个</span>
          </button>
          <button class="btn btn-primary btn-sm" id="btn-flashcard-master">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span>已掌握!</span>
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-flashcard-next">
            <span>下一个</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    `;

    // Flip Card Click
    const cardCube = modal.querySelector('#flashcard-cube');
    cardCube?.addEventListener('click', () => {
      isFlipped = !isFlipped;
      cardCube.classList.toggle('flipped', isFlipped);
    });

    // Close Button
    modal.querySelector('#btn-close-flashcard')?.addEventListener('click', () => closeModal());

    // Filter Pills
    modal.querySelectorAll('.stage-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        const filter = pill.getAttribute('data-filter') || 'all';
        currentStageFilter = filter;
        filteredCards = filter === 'all' ? allCards : allCards.filter((c) => c.stageId === filter);
        currentIndex = 0;
        isFlipped = false;
        renderModalContent();
      });
    });

    // Navigation Buttons
    modal.querySelector('#btn-flashcard-prev')?.addEventListener('click', () => {
      currentIndex--;
      isFlipped = false;
      renderModalContent();
    });

    modal.querySelector('#btn-flashcard-next')?.addEventListener('click', () => {
      currentIndex++;
      isFlipped = false;
      renderModalContent();
    });

    // Shuffle Button
    modal.querySelector('#btn-flashcard-shuffle')?.addEventListener('click', () => {
      currentIndex = Math.floor(Math.random() * filteredCards.length);
      isFlipped = false;
      renderModalContent();
    });

    // Mastered Celebration Button
    modal.querySelector('#btn-flashcard-master')?.addEventListener('click', (e) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: rect.top / window.innerHeight,
        },
      });

      setTimeout(() => {
        currentIndex++;
        isFlipped = false;
        renderModalContent();
      }, 400);
    });
  };

  const closeModal = () => {
    backdrop.remove();
    window.removeEventListener('keydown', onKeyDown);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
    } else if (e.key === 'ArrowRight') {
      currentIndex++;
      isFlipped = false;
      renderModalContent();
    } else if (e.key === 'ArrowLeft') {
      currentIndex--;
      isFlipped = false;
      renderModalContent();
    } else if (e.key === ' ') {
      e.preventDefault();
      const cardCube = modal.querySelector('#flashcard-cube');
      if (cardCube) {
        isFlipped = !isFlipped;
        cardCube.classList.toggle('flipped', isFlipped);
      }
    }
  };

  window.addEventListener('keydown', onKeyDown);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  renderModalContent();
  document.body.appendChild(backdrop);
  return backdrop;
}
