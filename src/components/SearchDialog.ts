import { deepDiveDomains } from '../data/deep-dive-data';
import { stages } from '../data/roadmap-data';
import { i18n } from '../services/i18n';

export interface SearchTarget {
  mode: 'roadmap' | 'deepdive';
  targetId: string;
  platform?: 'android' | 'ios';
}

interface SearchEntry extends SearchTarget {
  title: string;
  context: string;
  searchText: string;
}

function buildSearchEntries(): SearchEntry[] {
  const entries: SearchEntry[] = [];

  stages.forEach((stage) => {
    const title = i18n.t(stage.titleKey);
    const content = [
      i18n.t(stage.goalKey),
      ...stage.rows.flatMap((row) => [row.android, row.ios, row.note ? i18n.t(row.note) : '']),
      ...stage.noteKeys.map((key) => i18n.t(key)),
      i18n.t(stage.practiceKey),
    ].join(' ');

    entries.push({
      mode: 'roadmap',
      targetId: stage.id,
      title: `${String(stage.number).padStart(2, '0')} · ${title}`,
      context: content,
      searchText: `${title} ${content}`.toLocaleLowerCase('zh-Hans'),
    });
  });

  deepDiveDomains.forEach((domain) => {
    (['android', 'ios'] as const).forEach((platform) => {
      domain.deepDive[platform].forEach((module, index) => {
        const domainTitle = i18n.t(domain.titleKey);
        const content = [
          module.tag,
          module.title,
          module.explanation,
          module.extendedDeepDive,
          module.caseStudy,
          module.codeSnippet,
        ].filter(Boolean).join(' ');

        entries.push({
          mode: 'deepdive',
          targetId: `${domain.id}:${index}`,
          platform,
          title: module.title,
          context: `${platform === 'android' ? 'Android' : 'iOS'} · ${domainTitle} · ${module.tag}`,
          searchText: `${domainTitle} ${content}`.toLocaleLowerCase('zh-Hans'),
        });
      });
    });
  });

  return entries;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[character] ?? character);
}

export function openSearchDialog(onSelect: (target: SearchTarget) => void): void {
  document.querySelector('.search-dialog-backdrop')?.remove();

  const entries = buildSearchEntries();
  const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const backdrop = document.createElement('div');
  backdrop.className = 'search-dialog-backdrop';
  backdrop.innerHTML = `
    <section class="search-dialog" role="dialog" aria-modal="true" aria-labelledby="search-dialog-title">
      <h2 class="sr-only" id="search-dialog-title">${i18n.t('search.title')}</h2>
      <div class="search-dialog-input-wrap">
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input class="search-dialog-input" type="search" autocomplete="off"
          placeholder="${escapeHtml(i18n.t('search.placeholder'))}"
          aria-controls="search-results" aria-describedby="search-dialog-hint" />
        <kbd>Esc</kbd>
      </div>
      <p class="search-dialog-hint" id="search-dialog-hint">${i18n.t('search.hint')}</p>
      <div class="search-results" id="search-results" role="listbox"></div>
    </section>
  `;

  const dialog = backdrop.querySelector<HTMLElement>('.search-dialog');
  const input = backdrop.querySelector<HTMLInputElement>('.search-dialog-input');
  const results = backdrop.querySelector<HTMLElement>('.search-results');
  if (!dialog || !input || !results) return;

  let resultEntries: SearchEntry[] = [];
  let activeIndex = -1;

  const close = () => {
    backdrop.remove();
    previouslyFocused?.focus();
  };

  const select = (index: number) => {
    const entry = resultEntries[index];
    if (!entry) return;
    close();
    onSelect(entry);
  };

  const setActive = (index: number) => {
    const buttons = Array.from(results.querySelectorAll<HTMLButtonElement>('.search-result'));
    if (buttons.length === 0) {
      activeIndex = -1;
      return;
    }
    activeIndex = Math.max(0, Math.min(index, buttons.length - 1));
    buttons.forEach((button, buttonIndex) => {
      const isActive = buttonIndex === activeIndex;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', String(isActive));
    });
    buttons[activeIndex]?.scrollIntoView({ block: 'nearest' });
  };

  const renderResults = () => {
    const query = input.value.trim().toLocaleLowerCase('zh-Hans');
    if (!query) {
      resultEntries = [];
      activeIndex = -1;
      results.innerHTML = `<p class="search-empty">${i18n.t('search.start_typing')}</p>`;
      return;
    }

    const terms = query.split(/\s+/);
    resultEntries = entries
      .filter((entry) => terms.every((term) => entry.searchText.includes(term)))
      .sort((a, b) => {
        const aTitleMatch = a.title.toLocaleLowerCase('zh-Hans').includes(query) ? 1 : 0;
        const bTitleMatch = b.title.toLocaleLowerCase('zh-Hans').includes(query) ? 1 : 0;
        return bTitleMatch - aTitleMatch;
      })
      .slice(0, 24);

    if (resultEntries.length === 0) {
      activeIndex = -1;
      results.innerHTML = `<p class="search-empty">${i18n.t('search.no_results')}</p>`;
      return;
    }

    results.innerHTML = resultEntries.map((entry, index) => `
      <button class="search-result" role="option" aria-selected="false" data-result-index="${index}">
        <span class="search-result-title">${escapeHtml(entry.title)}</span>
        <span class="search-result-context">${escapeHtml(entry.mode === 'roadmap' ? i18n.t('search.roadmap') : entry.context)}</span>
      </button>
    `).join('');

    results.querySelectorAll<HTMLButtonElement>('.search-result').forEach((button) => {
      button.addEventListener('click', () => select(Number(button.dataset.resultIndex)));
    });
    setActive(0);
  };

  input.addEventListener('input', renderResults);
  backdrop.addEventListener('mousedown', (event) => {
    if (event.target === backdrop) close();
  });
  backdrop.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive(activeIndex + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive(activeIndex - 1);
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      select(activeIndex);
    } else if (event.key === 'Tab') {
      event.preventDefault();
      input.focus();
    }
  });

  document.body.appendChild(backdrop);
  renderResults();
  input.focus();
}
