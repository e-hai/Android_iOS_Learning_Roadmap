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
  const mainTitle = isRoadmap ? 'Android ⟷ iOS · 双端路线图' : '单端深度进阶';
  const badgeTitle = isRoadmap ? '双端对照 (16 阶段)' : (deepDivePlatform === 'android' ? 'Android 内幕 (5 领域)' : 'iOS 内幕 (5 领域)');

  let centerPlatformSwitchHtml = '';
  if (!isRoadmap) {
    centerPlatformSwitchHtml = `
      <div class="header-platform-toggle">
        <button class="platform-toggle-btn btn-android ${deepDivePlatform === 'android' ? 'active' : ''}" id="hdr-btn-android" title="切换为 Android 单端深度进阶">
          <span class="platform-dot dot-android"></span>
          <span>Android</span>
        </button>
        <button class="platform-toggle-btn btn-ios ${deepDivePlatform === 'ios' ? 'active' : ''}" id="hdr-btn-ios" title="切换为 iOS 单端深度进阶">
          <span class="platform-dot dot-ios"></span>
          <span>iOS</span>
        </button>
      </div>
    `;
  }

  header.innerHTML = `
    <div class="header-left">
      <button class="sidebar-toggle-btn" id="btn-sidebar-toggle" aria-label="Toggle Sidebar" title="展开/收起目录">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
      </button>
      <div class="header-logo" id="header-logo-btn">
        <div class="brand-icon" style="${!isRoadmap ? (deepDivePlatform === 'android' ? 'background:linear-gradient(135deg, #10b981, #047857);' : 'background:linear-gradient(135deg, #0ea5e9, #0369a1);') : ''}">AR</div>
        <div class="brand-text">
          <span class="brand-title">${mainTitle}</span>
          <span class="brand-badge" style="${!isRoadmap ? (deepDivePlatform === 'android' ? 'color:#10b981;' : 'color:#0ea5e9;') : ''}">${badgeTitle}</span>
        </div>
      </div>
    </div>

    <!-- Center: Platform Switcher (only in deepdive mode) -->
    <div class="header-center">
      ${centerPlatformSwitchHtml}
    </div>

    <div class="header-right">
      <!-- 3D Constellation vs Document Switcher -->
      <div class="view-mode-toggle">
        <button class="view-mode-btn ${is3DMode ? 'active' : ''}" id="btn-mode-3d" title="切换为 3D 认知星云模式">
          🌌 3D 星云
        </button>
        <button class="view-mode-btn ${!is3DMode ? 'active' : ''}" id="btn-mode-doc" title="切换为文档模式">
          📄 文档
        </button>
      </div>

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

  header.querySelector('#hdr-btn-android')?.addEventListener('click', () => {
    if (onTogglePlatform) onTogglePlatform('android');
  });
  header.querySelector('#hdr-btn-ios')?.addEventListener('click', () => {
    if (onTogglePlatform) onTogglePlatform('ios');
  });

  header.querySelector('#btn-mode-3d')?.addEventListener('click', () => {
    if (onToggle3DDoc) onToggle3DDoc('3d');
  });
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
