import { i18n } from '../services/i18n';

export type AppViewMode = 'roadmap' | 'deepdive' | '3d';

export function renderHeader(
  onToggleSidebar: () => void,
  onNavigateHome: () => void,
  currentViewMode: AppViewMode = 'roadmap',
  onToggleViewMode?: (mode: AppViewMode) => void
): HTMLElement {
  const header = document.createElement('header');
  header.className = 'app-header';

  header.innerHTML = `
    <div class="header-left">
      <button class="sidebar-toggle-btn ${currentViewMode === 'deepdive' ? 'hidden' : ''}" id="btn-sidebar-toggle" aria-label="Toggle Sidebar" title="展开/收起目录">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
      </button>
      <div class="header-logo" id="header-logo-btn">
        <div class="brand-icon">AR</div>
        <div class="brand-text">
          <span class="brand-title">${i18n.t('app.display_name')}</span>
          <span class="brand-badge">Android ⟷ iOS</span>
        </div>
      </div>
    </div>

    <!-- Center Navigation: Roadmap vs DeepDive vs 3D -->
    <div class="header-center">
      <div class="view-mode-toggle">
        <button class="view-mode-btn ${currentViewMode === 'roadmap' ? 'active' : ''}" id="btn-mode-roadmap" title="双端 16 阶段对照路线图">
          🗺️ 双端路线图
        </button>
        <button class="view-mode-btn ${currentViewMode === 'deepdive' ? 'active' : ''}" id="btn-mode-deepdive" title="Android / iOS 单端底层内幕与高级调优">
          🌊 单端深度进阶
        </button>
        <button class="view-mode-btn ${currentViewMode === '3d' ? 'active' : ''}" id="btn-mode-3d" title="3D 认知星云 · 记忆宫殿">
          🌌 3D 星云
        </button>
      </div>
    </div>

    <div class="header-right">
      <button class="btn btn-ghost btn-icon" id="btn-theme-toggle" title="切换深色/浅色主题">
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

  header.querySelector('#btn-mode-roadmap')?.addEventListener('click', () => {
    if (onToggleViewMode) onToggleViewMode('roadmap');
  });
  header.querySelector('#btn-mode-deepdive')?.addEventListener('click', () => {
    if (onToggleViewMode) onToggleViewMode('deepdive');
  });
  header.querySelector('#btn-mode-3d')?.addEventListener('click', () => {
    if (onToggleViewMode) onToggleViewMode('3d');
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
