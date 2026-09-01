import './styles/theme.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/visuals.css';

import { renderHeader } from './components/Header';
import { renderHomeView } from './components/HomeView';
import { openSearchDialog, SearchTarget } from './components/SearchDialog';
import { renderSidebar } from './components/Sidebar';
import { renderStageDetail } from './components/StageDetailView';
import { renderDeepDiveDocView } from './components/DeepDiveDocView';
import { stages } from './data/roadmap-data';
import { i18n } from './services/i18n';

type DocMode = 'roadmap' | 'deepdive';
type Platform = 'android' | 'ios';

class AppController {
  private is3DMode = false;
  private docMode: DocMode = 'roadmap';
  private deepDivePlatform: Platform = 'android';
  private currentStageId = 'home';
  private sidebarOpen = false;
  private desktopSidebarCollapsed = false;
  private documentShellKey = '';
  private renderVersion = 0;
  private dispose3DView: (() => void) | null = null;

  constructor() {
    this.desktopSidebarCollapsed = localStorage.getItem('learning_sidebar_collapsed') === 'true';
    document.body.classList.toggle('sidebar-collapsed', this.desktopSidebarCollapsed);
    this.docMode = (localStorage.getItem('learning_cockpit_doc_mode') as DocMode) || 'roadmap';
    this.deepDivePlatform = (localStorage.getItem('learning_deepdive_platform') as Platform) || 'android';
    this.is3DMode = localStorage.getItem('learning_cockpit_view_mode') === '3d';

    this.initTheme();
    this.initRouting();
    this.initGlobalShortcuts();
    void this.render();
  }

  private initTheme(): void {
    const savedTheme = localStorage.getItem('learning_cockpit_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', savedTheme || (prefersDark ? 'dark' : 'light'));
  }

  private initRouting(): void {
    const parseHash = () => {
      const hash = window.location.hash.slice(1).trim();
      if (hash === '3d') {
        this.is3DMode = true;
      } else if (hash === 'deepdive') {
        this.is3DMode = false;
        this.docMode = 'deepdive';
        this.currentStageId = 'all';
      } else if (hash.startsWith('deepdive-')) {
        this.is3DMode = false;
        this.docMode = 'deepdive';
        this.currentStageId = hash.slice('deepdive-'.length);
      } else if (hash && stages.some((stage) => stage.id === hash)) {
        this.is3DMode = false;
        this.docMode = 'roadmap';
        this.currentStageId = hash;
      } else {
        this.is3DMode = false;
        this.currentStageId = this.docMode === 'roadmap' ? 'home' : 'all';
      }
    };

    window.addEventListener('hashchange', () => {
      parseHash();
      this.closeSidebar();
      void this.render(true);
    });
    parseHash();
  }

  private initGlobalShortcuts(): void {
    window.addEventListener('keydown', (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        this.openSearch();
      } else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        this.toggleSidebar();
      } else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        this.switchDocMode('roadmap');
      } else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'm') {
        event.preventDefault();
        this.toggle3DDoc(this.is3DMode ? 'doc' : '3d');
      }
    });
  }

  private navigateToHash(hash: string): void {
    const nextHash = hash ? `#${hash}` : '';
    if (window.location.hash === nextHash) {
      void this.render(true);
    } else {
      window.location.hash = hash;
    }
  }

  private updateHash(): void {
    if (this.is3DMode) {
      this.navigateToHash('3d');
    } else if (this.docMode === 'deepdive') {
      this.navigateToHash(this.currentStageId === 'all' ? 'deepdive' : `deepdive-${this.currentStageId}`);
    } else {
      this.navigateToHash(this.currentStageId === 'home' ? '' : this.currentStageId);
    }
  }

  private toggle3DDoc(mode: '3d' | 'doc'): void {
    this.is3DMode = mode === '3d';
    localStorage.setItem('learning_cockpit_view_mode', mode);
    this.updateHash();
  }

  private switchDocMode(nextMode: DocMode): void {
    this.docMode = nextMode;
    this.currentStageId = nextMode === 'roadmap' ? 'home' : 'all';
    this.is3DMode = false;
    localStorage.setItem('learning_cockpit_doc_mode', nextMode);
    localStorage.setItem('learning_cockpit_view_mode', 'doc');
    this.updateHash();
  }

  private switchPlatform(platform: Platform): void {
    if (platform === this.deepDivePlatform) return;
    this.deepDivePlatform = platform;
    localStorage.setItem('learning_deepdive_platform', platform);
    void this.render();
  }

  private navigateStage(stageId: string): void {
    this.currentStageId = stageId;
    this.updateHash();
  }

  private openSearch(): void {
    openSearchDialog((target) => this.navigateSearchResult(target));
  }

  private navigateSearchResult(target: SearchTarget): void {
    this.is3DMode = false;
    this.docMode = target.mode;
    this.currentStageId = target.targetId;
    if (target.platform) {
      this.deepDivePlatform = target.platform;
      localStorage.setItem('learning_deepdive_platform', target.platform);
    }
    localStorage.setItem('learning_cockpit_doc_mode', target.mode);
    localStorage.setItem('learning_cockpit_view_mode', 'doc');
    this.updateHash();
  }

  private toggleSidebar(): void {
    if (window.innerWidth <= 960) {
      this.sidebarOpen = !this.sidebarOpen;
      document.getElementById('app-sidebar')?.classList.toggle('open', this.sidebarOpen);
      document.getElementById('sidebar-backdrop')?.classList.toggle('open', this.sidebarOpen);
      document.getElementById('btn-sidebar-toggle')?.setAttribute('aria-expanded', String(this.sidebarOpen));
      return;
    }

    this.desktopSidebarCollapsed = !this.desktopSidebarCollapsed;
    document.body.classList.toggle('sidebar-collapsed', this.desktopSidebarCollapsed);
    localStorage.setItem('learning_sidebar_collapsed', String(this.desktopSidebarCollapsed));
    document.getElementById('btn-sidebar-toggle')?.setAttribute('aria-expanded', String(!this.desktopSidebarCollapsed));
  }

  private closeSidebar(): void {
    if (window.innerWidth > 960) return;
    this.sidebarOpen = false;
    document.getElementById('app-sidebar')?.classList.remove('open');
    document.getElementById('sidebar-backdrop')?.classList.remove('open');
    document.getElementById('btn-sidebar-toggle')?.setAttribute('aria-expanded', 'false');
  }

  private createAtmosphere(): HTMLElement {
    const background = document.createElement('div');
    background.className = 'atmosphere-bg';
    background.setAttribute('aria-hidden', 'true');
    return background;
  }

  private disposeActive3D(): void {
    this.dispose3DView?.();
    this.dispose3DView = null;
  }

  private createDocumentShell(app: HTMLElement): HTMLElement {
    this.disposeActive3D();
    app.replaceChildren(this.createAtmosphere());

    const skipLink = document.createElement('a');
    skipLink.className = 'skip-link';
    skipLink.href = '#main-content';
    skipLink.textContent = '跳到主要内容';
    app.appendChild(skipLink);

    const header = renderHeader(
      () => this.toggleSidebar(),
      () => this.navigateStage(this.docMode === 'roadmap' ? 'home' : 'all'),
      false,
      this.docMode,
      this.deepDivePlatform,
      (mode) => this.toggle3DDoc(mode),
      (platform) => this.switchPlatform(platform),
      () => this.openSearch(),
    );
    header.querySelector('#btn-sidebar-toggle')?.setAttribute(
      'aria-expanded',
      String(window.innerWidth <= 960 ? this.sidebarOpen : !this.desktopSidebarCollapsed),
    );
    app.appendChild(header);

    const body = document.createElement('div');
    body.className = 'app-body';
    body.appendChild(renderSidebar(
      this.currentStageId,
      (id) => this.navigateStage(id),
      this.docMode,
      this.deepDivePlatform,
      (mode) => this.switchDocMode(mode),
    ));

    const backdrop = document.createElement('div');
    backdrop.className = `sidebar-backdrop ${this.sidebarOpen ? 'open' : ''}`;
    backdrop.id = 'sidebar-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.addEventListener('click', () => this.closeSidebar());
    body.appendChild(backdrop);

    const content = document.createElement('main');
    content.className = 'app-content';
    content.id = 'main-content';
    content.tabIndex = -1;
    body.appendChild(content);
    app.appendChild(body);
    return content;
  }

  private updateSidebarSelection(): void {
    document.querySelectorAll<HTMLElement>('[data-nav-target]').forEach((item) => {
      const isActive = item.dataset.navTarget === this.currentStageId;
      item.classList.toggle('active', isActive);
      item.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  }

  private renderDocumentContent(content: HTMLElement): void {
    if (this.docMode === 'deepdive') {
      content.replaceChildren(renderDeepDiveDocView(
        this.currentStageId,
        this.deepDivePlatform,
        (stageId) => this.navigateStage(stageId),
      ));
    } else if (this.currentStageId === 'home' || this.currentStageId === 'all') {
      content.replaceChildren(renderHomeView((id) => this.navigateStage(id)));
    } else {
      const stage = stages.find((candidate) => candidate.id === this.currentStageId);
      content.replaceChildren(stage
        ? renderStageDetail(stage, (id) => this.navigateStage(id))
        : renderHomeView((id) => this.navigateStage(id)));
    }
  }

  private async render(shouldFocusContent = false): Promise<void> {
    const app = document.getElementById('app');
    if (!app) return;
    const version = ++this.renderVersion;

    if (this.is3DMode) {
      this.documentShellKey = '';
      this.disposeActive3D();
      app.replaceChildren(this.createAtmosphere());

      const loading = document.createElement('p');
      loading.className = 'view-loading';
      loading.textContent = '正在加载 3D 认知星云…';
      app.appendChild(loading);

      try {
        const { renderNeuralConstellationView } = await import('./visuals/macro/NeuralConstellationView');
        if (version !== this.renderVersion || !this.is3DMode) return;

        const view = renderNeuralConstellationView(
          (mode) => this.toggle3DDoc(mode),
          this.docMode,
          this.deepDivePlatform,
          (platform) => this.switchPlatform(platform),
        );
        loading.remove();
        app.appendChild(view.element);
        this.dispose3DView = view.dispose;
      } catch (error) {
        if (version !== this.renderVersion || !this.is3DMode) return;
        console.error('Unable to initialize 3D view', error);
        loading.className = 'view-loading view-error';
        loading.innerHTML = `
          <strong>${i18n.t('view3d.unavailable')}</strong>
          <span>${i18n.t('view3d.unavailable_desc')}</span>
          <button class="btn btn-primary" type="button">${i18n.t('view3d.return_doc')}</button>
        `;
        loading.querySelector('button')?.addEventListener('click', () => this.toggle3DDoc('doc'));
      }
      return;
    }

    this.disposeActive3D();
    const shellKey = `${this.docMode}:${this.deepDivePlatform}`;
    let content = document.getElementById('main-content');
    if (this.documentShellKey !== shellKey || !(content instanceof HTMLElement)) {
      content = this.createDocumentShell(app);
      this.documentShellKey = shellKey;
    } else {
      this.updateSidebarSelection();
    }

    this.renderDocumentContent(content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (shouldFocusContent) content.focus({ preventScroll: true });
  }
}

new AppController();
