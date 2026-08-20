import './styles/theme.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/visuals.css';

import { stages } from './data/roadmap-data';
import { renderHeader, AppViewMode } from './components/Header';
import { renderSidebar } from './components/Sidebar';
import { renderHomeView } from './components/HomeView';
import { renderStageDetail } from './components/StageDetailView';
import { renderDeepDivePortalView } from './components/DeepDivePortalView';
import { renderNeuralConstellationView } from './visuals/macro/NeuralConstellationView';

class AppController {
  private currentTarget: string = 'home';
  private currentViewMode: AppViewMode = (localStorage.getItem('learning_cockpit_view_mode') as AppViewMode) || 'roadmap';
  private sidebarOpen = false;
  private desktopSidebarCollapsed = false;

  constructor() {
    this.desktopSidebarCollapsed = localStorage.getItem('learning_sidebar_collapsed') === 'true';
    if (this.desktopSidebarCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    }
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
      if (hash === 'deepdive') {
        this.currentViewMode = 'deepdive';
      } else if (hash === '3d') {
        this.currentViewMode = '3d';
      } else if (hash && stages.some((s) => s.id === hash)) {
        this.currentTarget = hash;
        this.currentViewMode = 'roadmap';
      } else {
        this.currentTarget = 'home';
        if (this.currentViewMode !== 'deepdive' && this.currentViewMode !== '3d') {
          this.currentViewMode = 'roadmap';
        }
      }
    };

    window.addEventListener('hashchange', () => {
      parseHash();
      this.closeSidebar();
      this.render();
    });

    parseHash();
  }

  private switchViewMode(mode: AppViewMode) {
    this.currentViewMode = mode;
    localStorage.setItem('learning_cockpit_view_mode', mode);
    if (mode === 'deepdive') {
      window.location.hash = 'deepdive';
    } else if (mode === '3d') {
      window.location.hash = '3d';
    } else {
      window.location.hash = this.currentTarget === 'home' ? '' : this.currentTarget;
    }
    this.render();
  }

  private navigate(targetId: string) {
    this.currentTarget = targetId;
    this.currentViewMode = 'roadmap';
    window.location.hash = targetId === 'home' ? '' : targetId;
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
        this.navigate('home');
      }
      // ⌘M for 3D/Roadmap toggle
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        this.switchViewMode(this.currentViewMode === '3d' ? 'roadmap' : '3d');
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
    if (this.currentViewMode === '3d') {
      const constellationView = renderNeuralConstellationView((mode) => this.switchViewMode(mode));
      app.appendChild(constellationView);
      return;
    }

    // 2. Header (Shared between Roadmap and DeepDive modes)
    const header = renderHeader(
      () => this.toggleSidebar(),
      () => this.navigate('home'),
      this.currentViewMode,
      (mode) => this.switchViewMode(mode)
    );
    app.appendChild(header);

    // 3. Body
    const body = document.createElement('div');
    body.className = `app-body ${this.currentViewMode === 'deepdive' ? 'deepdive-body-mode' : ''}`;

    // If in DeepDive Portal Mode:
    if (this.currentViewMode === 'deepdive') {
      const content = document.createElement('main');
      content.className = 'app-content portal-fullwidth-content';
      content.appendChild(
        renderDeepDivePortalView((stageId) => this.navigate(stageId))
      );
      body.appendChild(content);
      app.appendChild(body);
      return;
    }

    // Otherwise in Dual-Platform Roadmap Mode:
    // Sidebar
    const sidebar = renderSidebar(this.currentTarget, (id) => this.navigate(id));
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

    if (this.currentTarget === 'home') {
      content.appendChild(
        renderHomeView((id) => this.navigate(id))
      );
    } else {
      const stage = stages.find((s) => s.id === this.currentTarget);
      if (stage) {
        content.appendChild(
          renderStageDetail(stage, (id) => this.navigate(id))
        );
      } else {
        content.appendChild(
          renderHomeView((id) => this.navigate(id))
        );
      }
    }

    body.appendChild(content);
    app.appendChild(body);
  }
}

// Start App
new AppController();
