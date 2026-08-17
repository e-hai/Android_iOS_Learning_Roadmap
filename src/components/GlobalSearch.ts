import { stages } from '../data/roadmap-data';
import { i18n } from '../services/i18n';

interface SearchResult {
  stageId: string;
  stageNumber: number;
  stageTitle: string;
  android: string;
  ios: string;
  note?: string;
  matchedField: 'title' | 'comparison' | 'goal';
}

export function renderGlobalSearch(
  onSelect: (stageId: string) => void,
  onClose: () => void
): HTMLElement {
  const backdrop = document.createElement('div');
  backdrop.className = 'search-modal-backdrop';
  backdrop.id = 'search-modal-backdrop';

  const modal = document.createElement('div');
  modal.className = 'search-modal';
  backdrop.appendChild(modal);

  // Header with Search input
  const inputHeader = document.createElement('div');
  inputHeader.className = 'search-input-header';
  inputHeader.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-input-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    <input type="text" class="search-input" id="global-search-input" placeholder="${i18n.t('web.search_placeholder')}" autofocus autocomplete="off" />
    <span class="kbd-shortcut" style="padding:2px 6px;font-size:10px;color:var(--color-ink-muted);">ESC</span>
  `;
  modal.appendChild(inputHeader);

  // Results list
  const resultsContainer = document.createElement('div');
  resultsContainer.className = 'search-results-list';
  modal.appendChild(resultsContainer);

  let selectedIndex = 0;
  let currentResults: SearchResult[] = [];

  const resolveText = (text: string) => {
    if (text.startsWith('row.cell.') || text.startsWith('row.note.') || text.startsWith('cheat.')) {
      return i18n.t(text);
    }
    return text;
  };

  const performSearch = (query: string) => {
    const q = query.trim().toLowerCase();
    resultsContainer.innerHTML = '';
    currentResults = [];
    selectedIndex = 0;

    if (!q) {
      // Default: show all 16 stage titles as quick picks
      stages.forEach((stage) => {
        currentResults.push({
          stageId: stage.id,
          stageNumber: stage.number,
          stageTitle: i18n.t(stage.titleKey),
          android: '',
          ios: '',
          matchedField: 'title',
        });
      });
    } else {
      stages.forEach((stage) => {
        const title = i18n.t(stage.titleKey);
        const goal = i18n.t(stage.goalKey);

        if (title.toLowerCase().includes(q) || goal.toLowerCase().includes(q)) {
          currentResults.push({
            stageId: stage.id,
            stageNumber: stage.number,
            stageTitle: title,
            android: '',
            ios: '',
            matchedField: 'title',
          });
        }

        stage.rows.forEach((row) => {
          const android = resolveText(row.android);
          const ios = resolveText(row.ios);
          const note = row.note ? resolveText(row.note) : '';

          if (
            android.toLowerCase().includes(q) ||
            ios.toLowerCase().includes(q) ||
            note.toLowerCase().includes(q)
          ) {
            currentResults.push({
              stageId: stage.id,
              stageNumber: stage.number,
              stageTitle: title,
              android,
              ios,
              note,
              matchedField: 'comparison',
            });
          }
        });
      });
    }

    if (currentResults.length === 0) {
      resultsContainer.innerHTML = `
        <div class="search-empty-state">
          ${i18n.t('web.search_no_results')} "${query}"
        </div>
      `;
      return;
    }

    renderResultItems();
  };

  const renderResultItems = () => {
    resultsContainer.innerHTML = '';
    currentResults.forEach((res, idx) => {
      const item = document.createElement('div');
      item.className = `search-result-item ${idx === selectedIndex ? 'selected' : ''}`;

      if (res.matchedField === 'title') {
        item.innerHTML = `
          <div class="search-result-left">
            <span class="chip chip-main">${String(res.stageNumber).padStart(2, '0')}</span>
            <span style="font-weight:600;font-size:13.5px;color:var(--color-ink);">${res.stageTitle}</span>
          </div>
          <span class="search-result-stage">➔</span>
        `;
      } else {
        item.innerHTML = `
          <div class="search-result-left">
            <div class="search-result-terms">
              <span class="search-term-android">${res.android}</span>
              <span class="search-term-arrow">→</span>
              <span class="search-term-ios">${res.ios}</span>
            </div>
            ${res.note ? `<span style="font-size:11px;color:var(--color-ink-muted);margin-left:6px;">(${res.note})</span>` : ''}
          </div>
          <span class="search-result-stage">${res.stageNumber}. ${res.stageTitle}</span>
        `;
      }

      item.addEventListener('click', () => {
        onSelect(res.stageId);
        onClose();
      });

      resultsContainer.appendChild(item);
    });
  };

  const searchInput = inputHeader.querySelector('#global-search-input') as HTMLInputElement;

  searchInput.addEventListener('input', () => {
    performSearch(searchInput.value);
  });

  // Keyboard navigation inside search
  const keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (currentResults.length > 0) {
        selectedIndex = (selectedIndex + 1) % currentResults.length;
        renderResultItems();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentResults.length > 0) {
        selectedIndex = (selectedIndex - 1 + currentResults.length) % currentResults.length;
        renderResultItems();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (currentResults[selectedIndex]) {
        onSelect(currentResults[selectedIndex].stageId);
        onClose();
      }
    }
  };

  window.addEventListener('keydown', keyHandler);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      onClose();
    }
  });

  // Cleanup handler
  const originalRemove = backdrop.remove.bind(backdrop);
  backdrop.remove = () => {
    window.removeEventListener('keydown', keyHandler);
    originalRemove();
  };

  // Trigger initial search
  performSearch('');
  setTimeout(() => searchInput.focus(), 50);

  return backdrop;
}
