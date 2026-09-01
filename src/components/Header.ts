import { i18n } from '../services/i18n';
import { preload3DConstellation } from '../visuals/preload3d';

export function renderHeader(
  onToggleSidebar: () => void,
  onNavigateHome: () => void,
  is3DMode: boolean = false,
  docMode: 'roadmap' | 'deepdive' = 'roadmap',
  deepDivePlatform: 'android' | 'ios' = 'android',
  onToggle3DDoc?: (mode: '3d' | 'doc') => void,
  onTogglePlatform?: (platform: 'android' | 'ios') => void
): HTMLElement {
  const header = document.createElement('header');
  header.className = 'app-header';

  const isRoadmap = docMode === 'roadmap';
  const mainTitle = i18n.t(isRoadmap ? 'header.roadmap.title' : 'header.deepdive.title');
  const badgeTitle = i18n.t(isRoadmap
    ? 'header.roadmap.badge'
    : deepDivePlatform === 'android' ? 'header.android.badge' : 'header.ios.badge');

  let centerPlatformSwitchHtml = '';
  if (!isRoadmap) {
    centerPlatformSwitchHtml = `
      <div class="header-platform-toggle">
        <button class="platform-toggle-btn btn-android ${deepDivePlatform === 'android' ? 'active' : ''}" id="hdr-btn-android" title="${i18n.t('header.switch_android')}" aria-pressed="${deepDivePlatform === 'android'}">
          <span class="platform-dot dot-android"></span>
          <span>Android</span>
        </button>
        <button class="platform-toggle-btn btn-ios ${deepDivePlatform === 'ios' ? 'active' : ''}" id="hdr-btn-ios" title="${i18n.t('header.switch_ios')}" aria-pressed="${deepDivePlatform === 'ios'}">
          <span class="platform-dot dot-ios"></span>
          <span>iOS</span>
        </button>
      </div>
    `;
  }

  header.innerHTML = `
    <div class="header-left">
      <button class="sidebar-toggle-btn" id="btn-sidebar-toggle" aria-label="${i18n.t('web.toggle_sidebar')}" title="${i18n.t('web.toggle_sidebar')}" aria-controls="app-sidebar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
      </button>
      <button class="header-logo" id="header-logo-btn" aria-label="${i18n.t('header.home')}">
        <div class="brand-icon" style="${!isRoadmap ? (deepDivePlatform === 'android' ? 'background:linear-gradient(135deg, #10b981, #047857);' : 'background:linear-gradient(135deg, #0ea5e9, #0369a1);') : ''}">AR</div>
        <div class="brand-text">
          <span class="brand-title">${mainTitle}</span>
          <span class="brand-badge" style="${!isRoadmap ? (deepDivePlatform === 'android' ? 'color:#10b981;' : 'color:#0ea5e9;') : ''}">${badgeTitle}</span>
        </div>
      </button>
    </div>

    <!-- Center: Platform Switcher (only in deepdive mode) -->
    <div class="header-center">
      ${centerPlatformSwitchHtml}
    </div>

    <div class="header-right">
      <!-- 3D Constellation vs Document Switcher -->
      <div class="view-mode-toggle" role="group" aria-label="${i18n.t('header.view_mode')}">
        <button class="view-mode-btn ${is3DMode ? 'active' : ''}" id="btn-mode-3d" title="${i18n.t('header.switch_3d')}" aria-pressed="${is3DMode}">
          🌌 ${i18n.t('header.3d')}
        </button>
        <button class="view-mode-btn ${!is3DMode ? 'active' : ''}" id="btn-mode-doc" title="${i18n.t('header.switch_doc')}" aria-pressed="${!is3DMode}">
          📄 ${i18n.t('header.doc')}
        </button>
      </div>

      <button class="btn btn-ghost btn-icon" id="btn-theme-toggle" aria-label="${i18n.t('web.theme_toggle')}" title="${i18n.t('web.theme_toggle')}">
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

  header.querySelector('#hdr-btn-android')?.addEventListener('click', () => {
    if (onTogglePlatform) onTogglePlatform('android');
  });
  header.querySelector('#hdr-btn-ios')?.addEventListener('click', () => {
    if (onTogglePlatform) onTogglePlatform('ios');
  });

  const btn3d = header.querySelector('#btn-mode-3d');
  btn3d?.addEventListener('click', () => {
    if (onToggle3DDoc) onToggle3DDoc('3d');
  });
  // Prefetch chunk when user intends to enter 3D
  btn3d?.addEventListener('pointerenter', () => void preload3DConstellation(), { once: true });
  btn3d?.addEventListener('focus', () => void preload3DConstellation(), { once: true });
  header.querySelector('#btn-mode-doc')?.addEventListener('click', () => {
    if (onToggle3DDoc) onToggle3DDoc('doc');
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
