import './styles/theme.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/search.css';
import './styles/visuals.css';

import { stages } from './data/roadmap-data';
import { i18n } from './services/i18n';
import { renderHeader } from './components/Header';
import { renderSidebar } from './components/Sidebar';
import { renderHomeView } from './components/HomeView';
import { renderStageDetail } from './components/StageDetailView';
import { renderGlobalSearch } from './components/GlobalSearch';
import { renderNeuralConstellationView } from './visuals/macro/NeuralConstellationView';

class AppController {
  private currentTarget: string = 'home';
  private currentViewMode: '3d' | 'doc' = (localStorage.getItem('learning_cockpit_view_mode') as '3d' | 'doc') || 'doc';
  private sidebarOpen = false;
  private desktopSidebarCollapsed = false;
  private searchModalElement: HTMLElement | null = null;

  constructor() {
    this.desktopSidebarCollapsed = localStorage.getItem('learning_sidebar_collapsed') === 'true';
    if (this.desktopSidebarCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    }
    this.initTheme();
    this.initRouting();
    this.initGlobalShortcuts();
    this.setupSubscribers();
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
      if (hash && stages.some((s) => s.id === hash)) {
        this.currentTarget = hash;
      } else {
        this.currentTarget = 'home';
      }
    };

    window.addEventListener('hashchange', () => {
      parseHash();
      this.closeSidebar();
      this.render();
    });

    parseHash();
  }

  private switchViewMode(mode: '3d' | 'doc') {
    this.currentViewMode = mode;
    localStorage.setItem('learning_cockpit_view_mode', mode);
    this.render();
  }

  private navigate(targetId: string) {
    this.currentTarget = targetId;
    window.location.hash = targetId === 'home' ? '' : targetId;
    this.closeSidebar();
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private setupSubscribers() {
    // When language updates, re-render the view
    i18n.subscribe(() => {
      document.title = i18n.t('app.display_name');
      this.render();
    });
  }

  private initGlobalShortcuts() {
    window.addEventListener('keydown', (e) => {
      // ⌘K or Ctrl+K for search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.openSearchModal();
      }
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
      // ⌘M for 3D/Doc mode toggle
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        this.switchViewMode(this.currentViewMode === '3d' ? 'doc' : '3d');
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

  private openSearchModal() {
    document.querySelectorAll('.search-modal-backdrop, #search-modal-backdrop').forEach((el) => {
      if (typeof el.remove === 'function') el.remove();
      else el.parentNode?.removeChild(el);
    });
    this.searchModalElement = null;

    this.searchModalElement = renderGlobalSearch(
      (stageId) => {
        this.switchViewMode('doc');
        this.navigate(stageId);
      },
      () => {
        if (this.searchModalElement) {
          this.searchModalElement.remove();
          this.searchModalElement = null;
        }
        document.querySelectorAll('.search-modal-backdrop, #search-modal-backdrop').forEach((el) => {
          if (typeof el.remove === 'function') el.remove();
          else el.parentNode?.removeChild(el);
        });
      }
    );
    document.body.appendChild(this.searchModalElement);
  }

  private render() {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = '';

    // Atmosphere Background
    const bg = document.createElement('div');
    bg.className = 'atmosphere-bg';
    app.appendChild(bg);

    // If in 3D Constellation Mode:
    if (this.currentViewMode === '3d') {
      const constellationView = renderNeuralConstellationView((mode) => this.switchViewMode(mode));
      app.appendChild(constellationView);
      return;
    }

    // Header in Document Mode
    const header = renderHeader(
      () => this.toggleSidebar(),
      () => this.openSearchModal(),
      () => {
        this.navigate('home');
      },
      this.currentViewMode,
      (mode) => this.switchViewMode(mode)
    );
    app.appendChild(header);

    // Body in Document Mode
    const body = document.createElement('div');
    body.className = 'app-body';

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
