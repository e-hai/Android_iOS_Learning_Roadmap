import './styles/theme.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/visuals.css';

import { stages } from './data/roadmap-data';
import { renderHeader } from './components/Header';
import { renderSidebar } from './components/Sidebar';
import { renderHomeView } from './components/HomeView';
import { renderStageDetail } from './components/StageDetailView';
import { renderDeepDiveDocView } from './components/DeepDiveDocView';
import { renderNeuralConstellationView } from './visuals/macro/NeuralConstellationView';

class AppController {
  private is3DMode: boolean = false;
  private docMode: 'roadmap' | 'deepdive' = 'roadmap';
  private deepDivePlatform: 'android' | 'ios' = 'android';
  private currentStageId: string = 'home';
  private sidebarOpen = false;
  private desktopSidebarCollapsed = false;

  constructor() {
    this.desktopSidebarCollapsed = localStorage.getItem('learning_sidebar_collapsed') === 'true';
    if (this.desktopSidebarCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    }
    this.docMode = (localStorage.getItem('learning_cockpit_doc_mode') as 'roadmap' | 'deepdive') || 'roadmap';
    this.deepDivePlatform = (localStorage.getItem('learning_deepdive_platform') as 'android' | 'ios') || 'android';
    this.is3DMode = localStorage.getItem('learning_cockpit_view_mode') === '3d';

    this.initTheme();
    this.initRouting();
    this.initGlobalShortcuts();
    this.render();
  }

  private initTheme() {
    const savedTheme = localStorage.getItem('learning_cockpit_theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  }

  private initRouting() {
    const parseHash = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash === '3d') {
        this.is3DMode = true;
      } else if (hash === 'deepdive') {
        this.is3DMode = false;
        this.docMode = 'deepdive';
        this.currentStageId = 'all';
      } else if (hash.startsWith('deepdive-')) {
        this.is3DMode = false;
        this.docMode = 'deepdive';
        this.currentStageId = hash.replace('deepdive-', '');
      } else if (hash && stages.some((s) => s.id === hash)) {
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
      this.render();
    });

    parseHash();
  }

  private toggle3DDoc(mode: '3d' | 'doc') {
    this.is3DMode = mode === '3d';
    localStorage.setItem('learning_cockpit_view_mode', mode);
    if (this.is3DMode) {
      window.location.hash = '3d';
    } else {
      this.updateHash();
    }
    this.render();
  }

  private switchDocMode(nextDocMode: 'roadmap' | 'deepdive') {
    this.docMode = nextDocMode;
    localStorage.setItem('learning_cockpit_doc_mode', nextDocMode);
    this.is3DMode = false;
    localStorage.setItem('learning_cockpit_view_mode', 'doc');

    if (nextDocMode === 'roadmap') {
      this.currentStageId = 'home';
    } else {
      this.currentStageId = 'all';
    }
    this.updateHash();
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private switchPlatform(platform: 'android' | 'ios') {
    this.deepDivePlatform = platform;
    localStorage.setItem('learning_deepdive_platform', platform);
    this.render();
  }

  private updateHash() {
    if (this.is3DMode) {
      window.location.hash = '3d';
    } else if (this.docMode === 'deepdive') {
      window.location.hash = this.currentStageId === 'all' ? 'deepdive' : `deepdive-${this.currentStageId}`;
    } else {
      window.location.hash = this.currentStageId === 'home' ? '' : this.currentStageId;
    }
  }

  private navigateStage(stageId: string) {
    this.currentStageId = stageId;
    this.updateHash();
    this.closeSidebar();
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private initGlobalShortcuts() {
    window.addEventListener('keydown', (e) => {
      // ⌘B or Ctrl+B for sidebar toggle
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        this.toggleSidebar();
      }
      // ⌘D or Ctrl+D for Home Overview
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        this.switchDocMode('roadmap');
      }
      // ⌘M for 3D/Doc toggle
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        this.toggle3DDoc(this.is3DMode ? 'doc' : '3d');
      }
    });
  }

  private toggleSidebar() {
    if (window.innerWidth <= 960) {
      this.sidebarOpen = !this.sidebarOpen;
      const sidebar = document.getElementById('app-sidebar');
      const backdrop = document.getElementById('sidebar-backdrop');
      if (sidebar) sidebar.classList.toggle('open', this.sidebarOpen);
      if (backdrop) backdrop.classList.toggle('open', this.sidebarOpen);
    } else {
      this.desktopSidebarCollapsed = !this.desktopSidebarCollapsed;
      document.body.classList.toggle('sidebar-collapsed', this.desktopSidebarCollapsed);
      localStorage.setItem('learning_sidebar_collapsed', String(this.desktopSidebarCollapsed));
    }
  }

  private closeSidebar() {
    if (window.innerWidth <= 960) {
      this.sidebarOpen = false;
      const sidebar = document.getElementById('app-sidebar');
      const backdrop = document.getElementById('sidebar-backdrop');
      if (sidebar) sidebar.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
    }
  }

  private render() {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = '';

    // Atmosphere Background
    const bg = document.createElement('div');
    bg.className = 'atmosphere-bg';
    app.appendChild(bg);

    // 1. If in 3D Constellation Mode:
    if (this.is3DMode) {
      const constellationView = renderNeuralConstellationView(
        (mode) => this.toggle3DDoc(mode),
        this.docMode,
        this.deepDivePlatform,
        (platform) => this.switchPlatform(platform)
      );
      app.appendChild(constellationView);
      return;
    }

    // 2. Header (Document Mode)
    const header = renderHeader(
      () => this.toggleSidebar(),
      () => {
        if (this.docMode === 'roadmap') this.navigateStage('home');
        else this.navigateStage('all');
      },
      this.is3DMode,
      this.docMode,
      this.deepDivePlatform,
      (mode) => this.toggle3DDoc(mode),
      (platform) => this.switchPlatform(platform)
    );
    app.appendChild(header);

    // 3. Body Layout
    const body = document.createElement('div');
    body.className = 'app-body';

    // Sidebar
    const sidebar = renderSidebar(
      this.currentStageId,
      (id) => this.navigateStage(id),
      this.docMode,
      this.deepDivePlatform,
      (nextMode) => this.switchDocMode(nextMode)
    );
    body.appendChild(sidebar);

    // Sidebar Mobile Backdrop
    const sidebarBackdrop = document.createElement('div');
    sidebarBackdrop.className = `sidebar-backdrop ${this.sidebarOpen ? 'open' : ''}`;
    sidebarBackdrop.id = 'sidebar-backdrop';
    sidebarBackdrop.addEventListener('click', () => this.closeSidebar());
    body.appendChild(sidebarBackdrop);

    // Main Content
    const content = document.createElement('main');
    content.className = 'app-content';

    if (this.docMode === 'deepdive') {
      content.appendChild(
        renderDeepDiveDocView(
          this.currentStageId,
          this.deepDivePlatform,
          (stageId) => this.navigateStage(stageId),
          (stageId) => {
            this.docMode = 'roadmap';
            this.navigateStage(stageId);
          }
        )
      );
    } else {
      // Roadmap Mode
      if (this.currentStageId === 'home' || this.currentStageId === 'all') {
        content.appendChild(
          renderHomeView((id) => this.navigateStage(id))
        );
      } else {
        const stage = stages.find((s) => s.id === this.currentStageId);
        if (stage) {
          content.appendChild(
            renderStageDetail(stage, (id) => this.navigateStage(id))
          );
        } else {
          content.appendChild(
            renderHomeView((id) => this.navigateStage(id))
          );
        }
      }
    }

    body.appendChild(content);
    app.appendChild(body);
  }
}

// Start App
new AppController();
