import './styles/theme.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/focus-card.css';
import './styles/search.css';

import { stages } from './data/roadmap-data';
import { i18n } from './services/i18n';
import { renderHeader } from './components/Header';
import { renderSidebar } from './components/Sidebar';
import { renderHomeView } from './components/HomeView';
import { renderStageDetail } from './components/StageDetailView';
import { renderFocusCardModal } from './components/FocusCardModal';
import { renderGlobalSearch } from './components/GlobalSearch';

class AppController {
  private currentTarget: string = 'home';
  private sidebarOpen = false;
  private focusModalElement: HTMLElement | null = null;
  private searchModalElement: HTMLElement | null = null;

  constructor() {
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
      // If modal is open, don't flash background re-render on hashchange
      if (this.focusModalElement) return;

      parseHash();
      this.closeSidebar();
      this.render();
    });

    parseHash();
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
      // ⌘L or Ctrl+L for Focus Card
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        const stageId = this.currentTarget === 'home' ? (stages[0]?.id || 'env') : this.currentTarget;
        this.openFocusModal(stageId);
      }
      // ⌘D or Ctrl+D for Cockpit Overview
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        this.navigate('home');
      }
    });
  }

  private toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.toggle('open', this.sidebarOpen);
    if (backdrop) backdrop.classList.toggle('open', this.sidebarOpen);
  }

  private closeSidebar() {
    this.sidebarOpen = false;
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
  }

  private openFocusModal(stageId?: string) {
    // Remove any existing modal without flash
    document.querySelectorAll('.focus-modal-backdrop, #focus-card-backdrop').forEach((el) => {
      if (typeof el.remove === 'function') el.remove();
      else el.parentNode?.removeChild(el);
    });
    this.focusModalElement = null;

    const targetStageId = stageId || (this.currentTarget === 'home' ? (stages[0]?.id || 'env') : this.currentTarget);
    this.focusModalElement = renderFocusCardModal(
      targetStageId,
      () => {
        if (this.focusModalElement) {
          this.focusModalElement.remove();
          this.focusModalElement = null;
        }
        document.querySelectorAll('.focus-modal-backdrop, #focus-card-backdrop').forEach((el) => {
          if (typeof el.remove === 'function') el.remove();
          else el.parentNode?.removeChild(el);
        });
        // Sync background content smoothly when modal is closed
        this.render();
      },
      (newStageId) => {
        this.currentTarget = newStageId;
        // Use replaceState to update URL bar smoothly without triggering hashchange event or background flash
        history.replaceState(null, '', '#' + newStageId);
        this.updateSidebarActive(newStageId);
      }
    );
    document.body.appendChild(this.focusModalElement);
  }

  private updateSidebarActive(stageId: string) {
    const sidebar = document.getElementById('app-sidebar');
    if (!sidebar) return;
    sidebar.querySelectorAll('.sidebar-item').forEach((item) => {
      item.classList.remove('active');
    });
    // Find the item matching this stage and highlight it
    const activeIndex = stages.findIndex((s) => s.id === stageId);
    if (activeIndex !== -1) {
      const items = sidebar.querySelectorAll('.sidebar-item');
      // items[0] is home, items[1..] are stages
      if (items[activeIndex + 1]) {
        items[activeIndex + 1].classList.add('active');
      }
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

    // Header
    const header = renderHeader(
      () => this.toggleSidebar(),
      () => this.openSearchModal(),
      () => this.openFocusModal(),
      () => this.navigate('home')
    );
    app.appendChild(header);

    // Body
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
        renderHomeView(
          (id) => this.navigate(id),
          (id) => this.openFocusModal(id)
        )
      );
    } else {
      const stage = stages.find((s) => s.id === this.currentTarget);
      if (stage) {
        content.appendChild(
          renderStageDetail(stage, (id) => this.navigate(id))
        );
      } else {
        content.appendChild(
          renderHomeView(
            (id) => this.navigate(id),
            (id) => this.openFocusModal(id)
          )
        );
      }
    }

    body.appendChild(content);
    app.appendChild(body);
  }
}

// Start App
new AppController();
