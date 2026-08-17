import { i18n } from '../services/i18n';

export function renderHeader(
  onToggleSidebar: () => void,
  onOpenSearch: () => void,
  onOpenFocusMode: () => void,
  onNavigateHome: () => void
): HTMLElement {
  const header = document.createElement('header');
  header.className = 'app-header';

  header.innerHTML = `
    <div class="header-left">
      <button class="sidebar-toggle-btn" id="btn-sidebar-toggle" aria-label="Toggle Sidebar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      <div class="header-logo" id="header-logo-btn">
        <div class="brand-icon">LC</div>
        <div class="brand-text">
          <span class="brand-title">${i18n.t('app.display_name')}</span>
          <span class="brand-badge">Android ➔ iOS</span>
        </div>
      </div>
    </div>

    <div class="header-right">
      <button class="search-trigger-btn" id="btn-search-trigger">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <span class="search-trigger-label" style="font-size:12.5px;">${i18n.t('search.placeholder').split('(')[0].trim() || '搜索...'}</span>
        <span class="kbd-shortcut">⌘K</span>
      </button>

      <button class="btn btn-secondary btn-sm" id="btn-header-focus">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
        <span>${i18n.t('web.focus_mode')}</span>
      </button>

      <button class="btn btn-ghost btn-sm" id="btn-lang-toggle" title="${i18n.t('web.switch_lang')}">
        🌐 ${i18n.getLanguage() === 'zh-Hans' ? 'EN' : '中'}
      </button>

      <button class="btn btn-ghost btn-icon" id="btn-theme-toggle" title="${i18n.t('web.theme_toggle')}">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="theme-sun-icon"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
      </button>
    </div>
  `;

  // Events
  header.querySelector('#btn-sidebar-toggle')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleSidebar();
  });
  header.querySelector('#header-logo-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    onNavigateHome();
  });
  header.querySelector('#btn-search-trigger')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenSearch();
  });
  header.querySelector('#btn-header-focus')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenFocusMode();
  });

  const langBtn = header.querySelector('#btn-lang-toggle') as HTMLButtonElement;
  langBtn.addEventListener('click', () => {
    i18n.toggleLanguage();
  });

  const themeBtn = header.querySelector('#btn-theme-toggle') as HTMLButtonElement;
  themeBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('learning_cockpit_theme', nextTheme);
  });

  return header;
}
