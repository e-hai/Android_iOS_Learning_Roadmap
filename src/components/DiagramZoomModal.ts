/**
 * DiagramZoomModal.ts
 * Provides a lightweight, high-performance modal popup with smooth zoom, pan,
 * and fit-to-window capabilities for Mermaid SVGs and ASCII box diagrams.
 *
 * Adheres to AGENTS.md: zero external UI library dependencies, uses native HTML5 <dialog>.
 */

export interface DiagramZoomOptions {
  type: 'svg' | 'text' | 'html';
  title?: string;
  content: string;
}

let dialogEl: HTMLDialogElement | null = null;
let canvasEl: HTMLElement | null = null;
let titleEl: HTMLElement | null = null;
let scaleBadgeEl: HTMLElement | null = null;

// Transform state
let currentScale = 1.0;
let translateX = 0;
let translateY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;

/**
 * Ensures the singleton <dialog> element exists in the DOM.
 */
function ensureDialog(): HTMLDialogElement {
  if (dialogEl && document.body.contains(dialogEl)) {
    return dialogEl;
  }

  const dialog = document.createElement('dialog');
  dialog.id = 'diagram-zoom-dialog';
  dialog.className = 'diagram-zoom-dialog';
  dialog.setAttribute('aria-label', '图解放大查看');

  dialog.innerHTML = `
    <div class="diagram-zoom-shell">
      <div class="diagram-zoom-header">
        <div class="diagram-zoom-title-area">
          <svg class="diagram-zoom-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
          <span class="diagram-zoom-title" id="diagram-zoom-modal-title">架构与时序图 · 放大视图</span>
          <span class="diagram-zoom-hint">滚轮缩放 · 拖拽平移 · 双击重置</span>
        </div>
        <div class="diagram-zoom-toolbar">
          <button class="zoom-btn zoom-btn-out" type="button" title="缩小 (Alt + -)" aria-label="缩小">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <button class="zoom-btn zoom-btn-reset" type="button" title="重置缩放 (100%)" aria-label="重置缩放">
            <span class="zoom-scale-badge" id="diagram-zoom-scale-badge">100%</span>
          </button>
          <button class="zoom-btn zoom-btn-in" type="button" title="放大 (Alt + +)" aria-label="放大">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <button class="zoom-btn zoom-btn-fit" type="button" title="自适应窗口" aria-label="适应窗口">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            </svg>
          </button>
          <div class="zoom-divider"></div>
          <button class="zoom-btn zoom-btn-close" type="button" title="关闭 (Esc)" aria-label="关闭">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="18" x2="18" y2="6"></line>
            </svg>
          </button>
        </div>
      </div>
      <div class="diagram-zoom-viewport" id="diagram-zoom-viewport">
        <div class="diagram-zoom-canvas" id="diagram-zoom-canvas"></div>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);
  dialogEl = dialog;
  canvasEl = dialog.querySelector('#diagram-zoom-canvas');
  titleEl = dialog.querySelector('#diagram-zoom-modal-title');
  scaleBadgeEl = dialog.querySelector('#diagram-zoom-scale-badge');

  const viewport = dialog.querySelector('#diagram-zoom-viewport') as HTMLElement;
  const btnIn = dialog.querySelector('.zoom-btn-in') as HTMLButtonElement;
  const btnOut = dialog.querySelector('.zoom-btn-out') as HTMLButtonElement;
  const btnReset = dialog.querySelector('.zoom-btn-reset') as HTMLButtonElement;
  const btnFit = dialog.querySelector('.zoom-btn-fit') as HTMLButtonElement;
  const btnClose = dialog.querySelector('.zoom-btn-close') as HTMLButtonElement;

  // Zoom In / Out / Reset / Fit listeners
  btnIn.addEventListener('click', () => adjustZoom(1.25));
  btnOut.addEventListener('click', () => adjustZoom(0.8));
  btnReset.addEventListener('click', () => resetTransform(1.0));
  btnFit.addEventListener('click', () => fitToViewport());
  btnClose.addEventListener('click', () => dialog.close());

  // Backdrop click closes dialog
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      dialog.close();
    }
  });

  // Wheel zoom over viewport
  viewport.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      adjustZoom(zoomFactor);
    },
    { passive: false }
  );

  // Mouse drag to pan
  viewport.addEventListener('mousedown', (e) => {
    // Only left click drags
    if (e.button !== 0) return;
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    viewport.classList.add('is-dragging');
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging || !canvasEl) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    applyTransform();
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    viewport.classList.remove('is-dragging');
  });

  // Double click to zoom in or reset
  viewport.addEventListener('dblclick', () => {
    if (Math.abs(currentScale - 1.0) > 0.15) {
      resetTransform(1.0);
    } else {
      adjustZoom(1.5);
    }
  });

  return dialog;
}

function updateScaleBadge() {
  if (scaleBadgeEl) {
    scaleBadgeEl.textContent = `${Math.round(currentScale * 100)}%`;
  }
}

function applyTransform() {
  if (!canvasEl) return;
  canvasEl.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
  updateScaleBadge();
}

function adjustZoom(factor: number) {
  const newScale = Math.min(Math.max(currentScale * factor, 0.35), 4.5);
  currentScale = newScale;
  applyTransform();
}

function resetTransform(scale = 1.0) {
  currentScale = scale;
  translateX = 0;
  translateY = 0;
  applyTransform();
}

function fitToViewport() {
  if (!canvasEl || !dialogEl) return;
  const viewport = dialogEl.querySelector('#diagram-zoom-viewport') as HTMLElement;
  if (!viewport) return;

  const contentChild = canvasEl.firstElementChild as HTMLElement | SVGElement | null;
  if (!contentChild) {
    resetTransform(1.0);
    return;
  }

  const vpRect = viewport.getBoundingClientRect();
  const cRect = contentChild.getBoundingClientRect();

  // Natural unscaled size
  const naturalWidth = (cRect.width / currentScale) || 900;
  const naturalHeight = (cRect.height / currentScale) || 600;

  const padding = 60;
  const availW = vpRect.width - padding;
  const availH = vpRect.height - padding;

  if (availW > 0 && availH > 0 && naturalWidth > 0 && naturalHeight > 0) {
    const scaleX = availW / naturalWidth;
    const scaleY = availH / naturalHeight;
    const fitScale = Math.min(scaleX, scaleY, 1.3);
    resetTransform(Math.max(fitScale, 0.45));
  } else {
    resetTransform(1.0);
  }
}

/**
 * Open the modal with SVG, ASCII text, or HTML diagram content.
 */
export function openDiagramZoomModal(options: DiagramZoomOptions): void {
  const dialog = ensureDialog();

  if (titleEl) {
    titleEl.textContent = options.title || '架构与时序图 · 放大视图';
  }

  if (canvasEl) {
    canvasEl.innerHTML = '';
    if (options.type === 'svg') {
      canvasEl.innerHTML = options.content;
      // Ensure SVG is unconstrained inside modal canvas
      const svg = canvasEl.querySelector('svg');
      if (svg) {
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        svg.style.maxWidth = 'none';
        svg.style.height = 'auto';
      }
    } else if (options.type === 'text') {
      const pre = document.createElement('pre');
      pre.className = 'diagram-zoom-ascii-content';
      pre.innerHTML = `<code>${options.content}</code>`;
      canvasEl.appendChild(pre);
    } else {
      canvasEl.innerHTML = options.content;
    }
  }

  // Show modal
  dialog.showModal();

  // Reset transform and calculate optimal initial fit
  requestAnimationFrame(() => {
    fitToViewport();
  });
}

/**
 * Attaches interactive zoom trigger buttons to all rendered Mermaid containers
 * and ASCII diagram boxes within the given container root.
 */
export function setupDiagramZoomTriggers(root: HTMLElement): void {
  // 1. Mermaid containers
  const mermaidNodes = root.querySelectorAll<HTMLElement>('.mermaid-container[data-rendered="true"]:not([data-zoom-ready])');
  mermaidNodes.forEach((node) => {
    node.setAttribute('data-zoom-ready', 'true');
    node.classList.add('mermaid-interactive');

    // Add floating zoom button if not present
    if (!node.querySelector('.diagram-zoom-trigger-btn')) {
      const zoomBtn = document.createElement('button');
      zoomBtn.className = 'diagram-zoom-trigger-btn';
      zoomBtn.type = 'button';
      zoomBtn.title = '点击放大查看高清图解';
      zoomBtn.setAttribute('aria-label', '放大查看');
      zoomBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="11" y1="8" x2="11" y2="14"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
        <span>放大查看</span>
      `;
      node.appendChild(zoomBtn);
    }

    node.addEventListener('click', () => {
      // Find rendered SVG
      const svg = node.querySelector('svg');
      if (!svg) return;
      openDiagramZoomModal({
        type: 'svg',
        title: '时序与架构全景图 · 放大视图',
        content: svg.outerHTML,
      });
    });
  });

  // 2. Layer diagram boxes (ASCII box diagrams)
  const diagramBoxes = root.querySelectorAll<HTMLElement>('.layer-diagram-box:not([data-zoom-ready])');
  diagramBoxes.forEach((box) => {
    box.setAttribute('data-zoom-ready', 'true');

    // Check if wrapped
    let wrapper = box.parentElement;
    if (!wrapper?.classList.contains('layer-diagram-wrapper')) {
      wrapper = document.createElement('div');
      wrapper.className = 'layer-diagram-wrapper';
      box.parentNode?.insertBefore(wrapper, box);
      wrapper.appendChild(box);
    }

    if (!wrapper.querySelector('.diagram-zoom-trigger-btn')) {
      const zoomBtn = document.createElement('button');
      zoomBtn.className = 'diagram-zoom-trigger-btn';
      zoomBtn.type = 'button';
      zoomBtn.title = '点击放大查看盒线图解';
      zoomBtn.setAttribute('aria-label', '放大查看');
      zoomBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="11" y1="8" x2="11" y2="14"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
        <span>放大查看</span>
      `;
      wrapper.appendChild(zoomBtn);
    }

    wrapper.addEventListener('click', () => {
      const code = box.querySelector('code')?.innerHTML || box.innerHTML || '';
      openDiagramZoomModal({
        type: 'text',
        title: '架构盒线图解 · 放大视图',
        content: code,
      });
    });
  });
}
