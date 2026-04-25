// ── Router + entry point ────────────────────────────────────────────────────
// Screens: home | sd | return | return-step2 | admin

let currentScreen = 'home';

function isAdminMode() {
  const u = new URL(window.location.href);
  return u.searchParams.get('view') === 'admin';
}

function goto(screen) {
  currentScreen = screen;
  // Stop admin polling unless we're on the admin screen
  if (screen !== 'admin') stopAdminPolling();
  render();
}

function render() {
  const root = document.getElementById('app-root');
  const banner = renderDemoBanner();

  // Admin route
  if (isAdminMode()) {
    if (!isAdminAuthorized()) {
      root.innerHTML = banner + renderAdminGate();
      const f = root.querySelector('#admin-gate-form');
      f.addEventListener('submit', (e) => { e.preventDefault(); handleAdminGateSubmit(f); });
      bindDemoBannerActions(root);
      return;
    }
    root.innerHTML = banner + renderAdmin();
    bindAdmin(root);
    bindDemoBannerActions(root);
    return;
  }

  // Team-lead routes
  if (currentScreen === 'sd') {
    root.innerHTML = banner + renderSDForm();
    const f = root.querySelector('#sd-form');
    f.addEventListener('submit', (e) => { e.preventDefault(); handleSDSubmit(f); });
    bindDemoBannerActions(root);
    return;
  }
  if (currentScreen === 'return') {
    root.innerHTML = banner + renderReturnFormStep1();
    bindReturnFormStep1(root);
    const f = root.querySelector('#ret-step1-form');
    f.addEventListener('submit', (e) => { e.preventDefault(); handleReturnStep1Submit(f); });
    bindDemoBannerActions(root);
    return;
  }
  if (currentScreen === 'return-step2') {
    root.innerHTML = banner + renderReturnFormStep2();
    bindReturnFormStep2(root);
    const f = root.querySelector('#ret-step2-form');
    f.addEventListener('submit', (e) => { e.preventDefault(); handleReturnStep2Submit(f); });
    bindDemoBannerActions(root);
    return;
  }

  // Default: home
  root.innerHTML = banner + renderHome();
  bindDemoBannerActions(root);
}

// ── Demo banner ─────────────────────────────────────────────────────────────
function renderDemoBanner() {
  if (!isMockMode()) return '';
  return `
    <div class="demo-banner">
      <div class="demo-banner-left">
        <span class="demo-banner-dot"></span>
        <span>${t('demoBanner')}</span>
      </div>
      <div class="demo-banner-actions">
        ${isAdminMode()
          ? `<a class="demo-link" href="?">← Team lead view</a>`
          : `<a class="demo-link" href="?view=admin">${t('demoOpenAdmin')} →</a>`}
        <button class="demo-link" data-action="reset-demo">${t('demoReset')}</button>
      </div>
    </div>
  `;
}

function bindDemoBannerActions(root) {
  const btn = root.querySelector('[data-action="reset-demo"]');
  if (btn) {
    btn.addEventListener('click', () => {
      if (confirm(t('demoResetConfirm'))) {
        mockReset();
        localStorage.removeItem(LS_HUB);
        localStorage.removeItem(LS_TEAM);
        localStorage.removeItem(LS_BUSINESS);
        location.reload();
      }
    });
  }
}

function renderHome() {
  return `
    <div class="screen home">
      <header class="brand">
        <h1>${t('appTitle')}</h1>
        <p class="subtitle">${t('appSubtitle')}</p>
      </header>
      <h2>${t('homeHeading')}</h2>
      <div class="card-grid">
        <button class="big-card" data-action="goto-sd">
          <div class="big-card-icon">📦</div>
          <div class="big-card-title">${t('sdCardCardTitle')}</div>
          <div class="big-card-desc">${t('sdCardCardDesc')}</div>
        </button>
        <button class="big-card" data-action="goto-return">
          <div class="big-card-icon">🔄</div>
          <div class="big-card-title">${t('deviceCardTitle')}</div>
          <div class="big-card-desc">${t('deviceCardDesc')}</div>
        </button>
      </div>
    </div>
  `;
}

// ── Global event delegation ─────────────────────────────────────────────────
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const a = btn.dataset.action;
  if (a === 'goto-home') goto('home');
  else if (a === 'goto-sd') goto('sd');
  else if (a === 'goto-return') { returnFormState = null; goto('return'); }
  else if (a === 'goto-return-step1') goto('return');
});

// ── Boot ────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  render();
});
