import { PlatformDeepDive, DeepDiveModule } from '../models/types';
import { i18n } from '../services/i18n';

const STORAGE_KEY = 'learning_platform_tab';

export function renderDeepDiveSection(
  stageId: string,
  deepDive: PlatformDeepDive
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'deep-dive-section';
  container.id = `deep-dive-${stageId}`;

  // Read persisted preference ('android' | 'ios')
  let currentPlatform: 'android' | 'ios' =
    (localStorage.getItem(STORAGE_KEY) as 'android' | 'ios') || 'android';

  // Section Header
  const header = document.createElement('div');
  header.className = 'section-header';
  header.style.marginTop = '32px';
  header.innerHTML = `
    <div class="section-header-bar" style="background: linear-gradient(135deg, #10b981, #0ea5e9);"></div>
    <span class="section-header-title">${i18n.t('detail.section.deepdive')}</span>
  `;
  container.appendChild(header);

  // Tab Controls
  const tabContainer = document.createElement('div');
  tabContainer.className = 'deep-dive-tabs';

  const btnAndroid = document.createElement('button');
  btnAndroid.className = `deep-dive-tab-btn btn-android ${currentPlatform === 'android' ? 'active' : ''}`;
  btnAndroid.innerHTML = `
    <span class="platform-dot dot-android"></span>
    <span>${i18n.t('detail.deepdive.android')}</span>
    <span class="tab-count-badge">${deepDive.android.length}</span>
  `;

  const btnIos = document.createElement('button');
  btnIos.className = `deep-dive-tab-btn btn-ios ${currentPlatform === 'ios' ? 'active' : ''}`;
  btnIos.innerHTML = `
    <span class="platform-dot dot-ios"></span>
    <span>${i18n.t('detail.deepdive.ios')}</span>
    <span class="tab-count-badge">${deepDive.ios.length}</span>
  `;

  tabContainer.appendChild(btnAndroid);
  tabContainer.appendChild(btnIos);
  container.appendChild(tabContainer);

  // Cards Content Container
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'deep-dive-cards-grid';
  container.appendChild(cardsContainer);

  function renderCards(platform: 'android' | 'ios') {
    cardsContainer.innerHTML = '';
    const modules: DeepDiveModule[] = platform === 'android' ? deepDive.android : deepDive.ios;

    if (!modules || modules.length === 0) {
      cardsContainer.innerHTML = `
        <div class="empty-hint" style="padding: 24px; text-align: center; color: var(--color-ink-muted);">
          ${i18n.t('detail.deepdive.empty')}
        </div>
      `;
      return;
    }

    modules.forEach((mod) => {
      const card = document.createElement('div');
      card.className = `deep-dive-card card-${platform}`;

      let codeHtml = '';
      if (mod.codeSnippet) {
        codeHtml = `
          <div class="deep-dive-code-block">
            <div class="code-block-header">
              <span class="code-block-lang">${platform === 'android' ? (mod.codeSnippet.startsWith('#') ? 'TERMINAL' : 'KOTLIN / GRADLE') : (mod.codeSnippet.startsWith('(') || mod.codeSnippet.startsWith('xcrun') || mod.codeSnippet.startsWith('codesign') ? 'TERMINAL / LLDB' : 'SWIFT')}</span>
              <button class="code-copy-btn" title="${i18n.t('detail.deepdive.copy')}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                <span>${i18n.t('detail.deepdive.copy')}</span>
              </button>
            </div>
            <pre class="deep-dive-pre"><code>${escapeHtml(mod.codeSnippet)}</code></pre>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="deep-dive-card-header">
          <span class="deep-dive-tag tag-${platform}">【${escapeHtml(mod.tag)}】</span>
          <h3 class="deep-dive-card-title">${escapeHtml(mod.title)}</h3>
        </div>
        <p class="deep-dive-card-desc">${escapeHtml(mod.explanation)}</p>
        ${codeHtml}
      `;

      // Copy code snippet button
      if (mod.codeSnippet) {
        const copyBtn = card.querySelector('.code-copy-btn');
        if (copyBtn) {
          copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(mod.codeSnippet || '');
            const span = copyBtn.querySelector('span');
            if (span) {
              const original = span.textContent;
              span.textContent = i18n.t('detail.deepdive.copied');
              setTimeout(() => {
                span.textContent = original;
              }, 2000);
            }
          });
        }
      }

      cardsContainer.appendChild(card);
    });
  }

  // Initial render
  renderCards(currentPlatform);

  // Tab click listeners
  btnAndroid.addEventListener('click', () => {
    if (currentPlatform === 'android') return;
    currentPlatform = 'android';
    localStorage.setItem(STORAGE_KEY, 'android');
    btnAndroid.classList.add('active');
    btnIos.classList.remove('active');
    renderCards('android');
  });

  btnIos.addEventListener('click', () => {
    if (currentPlatform === 'ios') return;
    currentPlatform = 'ios';
    localStorage.setItem(STORAGE_KEY, 'ios');
    btnIos.classList.add('active');
    btnAndroid.classList.remove('active');
    renderCards('ios');
  });

  return container;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
