/**
 * DiagramZoomModal.ts
 * High-performance modal popup with smooth zoom, pan, and fit-to-window
 * capabilities for Mermaid SVGs and ASCII box diagrams.
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
let viewportEl: HTMLElement | null = null;

// Natural dimensions of the active diagram
let naturalWidth = 1100;
let naturalHeight = 750;

// Transform state
let currentScale = 1.0;
let translateX = 0;
let translateY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;
let activePointerId: number | null = null;

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
          <button class="zoom-btn zoom-btn-reset" type="button" title="重置为 100%" aria-label="重置缩放">
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
  viewportEl = dialog.querySelector('#diagram-zoom-viewport');

  const viewport = viewportEl!;
  const btnIn = dialog.querySelector('.zoom-btn-in') as HTMLButtonElement;
  const btnOut = dialog.querySelector('.zoom-btn-out') as HTMLButtonElement;
  const btnReset = dialog.querySelector('.zoom-btn-reset') as HTMLButtonElement;
  const btnFit = dialog.querySelector('.zoom-btn-fit') as HTMLButtonElement;
  const btnClose = dialog.querySelector('.zoom-btn-close') as HTMLButtonElement;

  btnIn.addEventListener('click', (e) => {
    e.stopPropagation();
    adjustZoom(1.25);
  });

  btnOut.addEventListener('click', (e) => {
    e.stopPropagation();
    adjustZoom(0.8);
  });

  btnReset.addEventListener('click', (e) => {
    e.stopPropagation();
    resetTransform(1.0);
  });

  btnFit.addEventListener('click', (e) => {
    e.stopPropagation();
    fitToViewport();
  });

  btnClose.addEventListener('click', (e) => {
    e.stopPropagation();
    dialog.close();
  });

  // Light dismiss on backdrop click
  let isBackdropDown = false;
  dialog.addEventListener('pointerdown', (e) => {
    const rect = dialog.getBoundingClientRect();
    isBackdropDown = (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    );
  });

  dialog.addEventListener('click', (e) => {
    if (isBackdropDown && e.target === dialog) {
      dialog.close();
    }
    isBackdropDown = false;
  });

  // Keyboard navigation
  dialog.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      adjustZoom(1.25);
    } else if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      adjustZoom(0.8);
    } else if (e.key === '0') {
      e.preventDefault();
      resetTransform(1.0);
    }
  });

  // Smooth wheel zoom centered on cursor
  viewport.addEventListener(
    'wheel',
    (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      zoomAtPoint(e.clientX, e.clientY, zoomFactor);
    },
    { passive: false }
  );

  // Pointer drag to pan (supports mouse, trackpad, touch)
  viewport.addEventListener('pointerdown', (e: PointerEvent) => {
    // Only primary button or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    isDragging = true;
    activePointerId = e.pointerId;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    viewport.classList.add('is-dragging');
    try {
      viewport.setPointerCapture(e.pointerId);
    } catch {
      // fallback
    }
  });

  viewport.addEventListener('pointermove', (e: PointerEvent) => {
    if (!isDragging || !canvasEl) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    applyTransform();
  });

  const stopDragging = (e: PointerEvent) => {
    if (!isDragging) return;
    isDragging = false;
    viewport.classList.remove('is-dragging');
    if (activePointerId !== null) {
      try {
        viewport.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      activePointerId = null;
    }
  };

  viewport.addEventListener('pointerup', stopDragging);
  viewport.addEventListener('pointercancel', stopDragging);

  // Double click toggles between fit and 1.5x zoom
  viewport.addEventListener('dblclick', (e) => {
    e.preventDefault();
    if (Math.abs(currentScale - 1.0) > 0.2) {
      fitToViewport();
    } else {
      zoomAtPoint(e.clientX, e.clientY, 1.6);
    }
  });

  dialog.addEventListener('close', () => {
    if (canvasEl) canvasEl.innerHTML = '';
    currentScale = 1.0;
    translateX = 0;
    translateY = 0;
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
  const newScale = Math.min(Math.max(currentScale * factor, 0.3), 5.0);
  currentScale = newScale;
  applyTransform();
}

function zoomAtPoint(clientX: number, clientY: number, factor: number) {
  if (!viewportEl) return;
  const newScale = Math.min(Math.max(currentScale * factor, 0.3), 5.0);
  if (newScale === currentScale) return;

  const vpRect = viewportEl.getBoundingClientRect();
  const mouseX = clientX - vpRect.left - vpRect.width / 2;
  const mouseY = clientY - vpRect.top - vpRect.height / 2;

  const ratio = newScale / currentScale;
  translateX = mouseX - (mouseX - translateX) * ratio;
  translateY = mouseY - (mouseY - translateY) * ratio;

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
  if (!viewportEl) return;

  const vpW = viewportEl.clientWidth;
  const vpH = viewportEl.clientHeight;

  const paddingW = 80;
  const paddingH = 60;
  const availW = Math.max(vpW - paddingW, 280);
  const availH = Math.max(vpH - paddingH, 200);

  if (naturalWidth > 0 && naturalHeight > 0) {
    const scaleX = availW / naturalWidth;
    const scaleY = availH / naturalHeight;
    const fitScale = Math.min(scaleX, scaleY);
    // Sensible fit scale between 0.45 and 1.6
    const targetScale = Math.min(Math.max(fitScale, 0.45), 1.6);
    resetTransform(targetScale);
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
      const svg = canvasEl.querySelector('svg');
      if (svg) {
        // Extract true natural dimensions from viewBox
        const viewBox = svg.getAttribute('viewBox');
        naturalWidth = 1120;
        naturalHeight = 780;

        if (viewBox) {
          const parts = viewBox.trim().split(/[\s,]+/).map(Number);
          if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
            naturalWidth = Math.round(parts[2]);
            naturalHeight = Math.round(parts[3]);
          }
        }

        // Apply physical unconstrained dimensions to SVG
        svg.setAttribute('width', `${naturalWidth}`);
        svg.setAttribute('height', `${naturalHeight}`);
        svg.style.width = `${naturalWidth}px`;
        svg.style.height = `${naturalHeight}px`;
        svg.style.minWidth = `${naturalWidth}px`;
        svg.style.maxWidth = 'none';
        svg.style.maxHeight = 'none';
        svg.style.display = 'block';
      }
    } else if (options.type === 'text') {
      const pre = document.createElement('pre');
      pre.className = 'diagram-zoom-ascii-content';
      pre.innerHTML = `<code>${options.content}</code>`;
      canvasEl.appendChild(pre);

      naturalWidth = 960;
      naturalHeight = 620;
    } else {
      canvasEl.innerHTML = options.content;
      naturalWidth = 1000;
      naturalHeight = 700;
    }
  }

  // Open modal natively
  dialog.showModal();

  // Double requestAnimationFrame ensures modal layout is fully painted before measuring
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      fitToViewport();
    });
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
    let zoomBtn = node.querySelector<HTMLButtonElement>('.diagram-zoom-trigger-btn');
    if (!zoomBtn) {
      zoomBtn = document.createElement('button');
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

    const openForNode = () => {
      const svg = node.querySelector('svg');
      if (!svg) return;

      const title = node.closest('.extended-layer-card')?.querySelector('.layer-title')?.textContent?.trim()
        || node.previousElementSibling?.textContent?.trim()
        || '时序与架构全景图 · 放大视图';

      openDiagramZoomModal({
        type: 'svg',
        title,
        content: svg.outerHTML,
      });
    };

    zoomBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openForNode();
    });

    // Tap/Click on container opens modal (distinguish from horizontal scroll drag)
    let pointerStartX = 0;
    let pointerStartY = 0;
    let isScrollMove = false;

    node.addEventListener('pointerdown', (e) => {
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;
      isScrollMove = false;
    });

    node.addEventListener('pointermove', (e) => {
      const dx = Math.abs(e.clientX - pointerStartX);
      const dy = Math.abs(e.clientY - pointerStartY);
      if (dx > 8 || dy > 8) {
        isScrollMove = true;
      }
    });

    node.addEventListener('click', (e) => {
      if (isScrollMove) return;
      // Don't duplicate if clicked directly on the button (which already stopped propagation)
      if ((e.target as HTMLElement).closest('.diagram-zoom-trigger-btn')) return;
      openForNode();
    });
  });

  // 2. Layer diagram boxes (ASCII box diagrams)
  const diagramBoxes = root.querySelectorAll<HTMLElement>('.layer-diagram-box:not([data-zoom-ready])');
  diagramBoxes.forEach((box) => {
    box.setAttribute('data-zoom-ready', 'true');

    // Wrap in interactive container if needed
    let wrapper = box.parentElement;
    if (!wrapper?.classList.contains('layer-diagram-wrapper')) {
      wrapper = document.createElement('div');
      wrapper.className = 'layer-diagram-wrapper';
      box.parentNode?.insertBefore(wrapper, box);
      wrapper.appendChild(box);
    }

    let zoomBtn = wrapper.querySelector<HTMLButtonElement>('.diagram-zoom-trigger-btn');
    if (!zoomBtn) {
      zoomBtn = document.createElement('button');
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

    const openForBox = () => {
      const code = box.querySelector('code')?.innerHTML || box.innerHTML || '';
      const title = wrapper?.closest('.extended-layer-card')?.querySelector('.layer-title')?.textContent?.trim()
        || '架构盒线图解 · 放大视图';

      openDiagramZoomModal({
        type: 'text',
        title,
        content: code,
      });
    };

    zoomBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openForBox();
    });

    wrapper.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('.diagram-zoom-trigger-btn')) return;
      openForBox();
    });
  });
}
