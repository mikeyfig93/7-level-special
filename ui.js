/* ===================================================
   FLIGHTLINE — ui.js
   Navigation, toasts, modals, timers, time display
=================================================== */

const UI = (() => {

  // ===== NAVIGATION =====
  function navigate(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    const target = document.getElementById(`screen-${screen}`);
    if (target) target.classList.add('active');

    document.querySelectorAll(`[data-nav="${screen}"]`).forEach(b => b.classList.add('active'));

    // Lazy refresh data on screen show
    if (screen === 'notes') {
      Notes.renderNotes();
      Notes.renderReference();
      Notes.renderAcronyms();
    } else if (screen === 'tracker') {
      Tracker.renderLog();
      Tracker.renderSummary();
    } else if (screen === 'ops') {
      Ops.renderFavorites();
    } else if (screen === 'settings') {
      Settings.updateCounts();
    }
  }

  // ===== TOAST =====
  let _toastTimer = null;
  function toast(msg, type = '') {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'toast' + (type ? ` ${type}` : '');
    if (_toastTimer) clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => el.classList.add('hidden'), 2500);
  }

  // ===== CONFIRM MODAL =====
  let _confirmCallback = null;
  function confirm(title, msg, callback) {
    _confirmCallback = callback;
    const el = document.getElementById('confirm-modal');
    const titleEl = document.getElementById('confirm-title');
    const msgEl = document.getElementById('confirm-msg');
    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = msg;
    el?.classList.remove('hidden');
  }

  function initConfirmModal() {
    document.getElementById('confirm-ok')?.addEventListener('click', () => {
      if (_confirmCallback) _confirmCallback();
      _confirmCallback = null;
      document.getElementById('confirm-modal')?.classList.add('hidden');
    });
    document.getElementById('confirm-cancel')?.addEventListener('click', () => {
      _confirmCallback = null;
      document.getElementById('confirm-modal')?.classList.add('hidden');
    });
  }

  // ===== CLOCK =====
  function updateClock() {
    const now = new Date();

    // Zulu
    const zuluStr = now.toISOString().slice(11, 19) + ' Z';
    const zuluTop = document.getElementById('zulu-display');
    if (zuluTop) zuluTop.textContent = zuluStr;

    // Local
    const localStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Hero displays
    const localHero = document.getElementById('local-time-hero');
    if (localHero) localHero.textContent = localStr;

    const zuluHero = document.getElementById('zulu-time-hero');
    if (zuluHero) zuluHero.textContent = now.toISOString().slice(11, 19);

    // Julian
    const julianStr = Julian.toAFJulian(now);
    const julianHero = document.getElementById('julian-hero');
    if (julianHero) julianHero.textContent = julianStr;

    const dateHero = document.getElementById('date-hero');
    if (dateHero) dateHero.textContent = Julian.formatDate(now);

    // Tools julian panel
    updateJulianPanel(now);

    // Shift elapsed
    updateShiftElapsed();
  }

  function updateJulianPanel(now) {
    const j = Julian.fromDate(now);
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('jc-date', Julian.formatDate(now));
    set('jc-julian', j.afJulian);
    set('jc-doy', `${j.dayOfYear} / ${Julian.isLeapYear(j.year) ? 366 : 365}`);
    set('jc-week', `${j.weekNumber}`);
  }

  // ===== SHIFT TIMER =====
  let _shiftStart = null;
  function updateShiftElapsed() {
    const el = document.getElementById('shift-elapsed');
    if (!el || !_shiftStart) return;
    const diff = Date.now() - _shiftStart;
    el.textContent = formatDuration(diff);
  }

  function setShiftStart(timeStr) {
    if (!timeStr) { UI.toast('Select shift start time.', 'error'); return; }
    const [h, m] = timeStr.split(':').map(Number);
    const now = new Date();
    const start = new Date();
    start.setHours(h, m, 0, 0);
    if (start > now) start.setDate(start.getDate() - 1); // previous day
    _shiftStart = start.getTime();
    const endInfo = document.getElementById('shift-end-info');
    if (endInfo) {
      const end8 = new Date(start.getTime() + 8 * 3600000);
      const end12 = new Date(start.getTime() + 12 * 3600000);
      endInfo.textContent = `8-HR: ${fmt2(end8.getHours())}:${fmt2(end8.getMinutes())} · 12-HR: ${fmt2(end12.getHours())}:${fmt2(end12.getMinutes())}`;
    }
  }

  // ===== STOPWATCH =====
  let _swRunning = false, _swStart = 0, _swElapsed = 0, _swInterval = null, _lapCount = 0;

  function swStart() {
    if (_swRunning) {
      // Pause
      _swElapsed += Date.now() - _swStart;
      clearInterval(_swInterval);
      _swRunning = false;
      document.getElementById('sw-start').textContent = 'RESUME';
    } else {
      _swStart = Date.now();
      _swRunning = true;
      document.getElementById('sw-start').textContent = 'PAUSE';
      _swInterval = setInterval(() => {
        const total = _swElapsed + (Date.now() - _swStart);
        const el = document.getElementById('sw-display');
        if (el) el.textContent = formatDuration(total);
      }, 100);
    }
  }

  function swLap() {
    if (!_swRunning && _swElapsed === 0) return;
    const total = _swElapsed + (_swRunning ? Date.now() - _swStart : 0);
    _lapCount++;
    const el = document.getElementById('sw-laps');
    if (el) {
      const item = document.createElement('div');
      item.className = 'lap-item';
      item.innerHTML = `<span>LAP ${_lapCount}</span><span>${formatDuration(total)}</span>`;
      el.insertBefore(item, el.firstChild);
    }
  }

  function swReset() {
    clearInterval(_swInterval);
    _swRunning = false;
    _swElapsed = 0;
    _swStart = 0;
    _lapCount = 0;
    const el = document.getElementById('sw-display');
    if (el) el.textContent = '00:00:00';
    const startBtn = document.getElementById('sw-start');
    if (startBtn) startBtn.textContent = 'START';
    const laps = document.getElementById('sw-laps');
    if (laps) laps.innerHTML = '';
  }

  // ===== COUNTDOWN =====
  let _cdRunning = false, _cdRemaining = 0, _cdInterval = null;

  function cdStart() {
    if (_cdRunning) {
      clearInterval(_cdInterval);
      _cdRunning = false;
      document.getElementById('cd-start').textContent = 'RESUME';
      return;
    }
    if (_cdRemaining <= 0) {
      const h = parseInt(document.getElementById('cd-hours').value) || 0;
      const m = parseInt(document.getElementById('cd-minutes').value) || 0;
      const s = parseInt(document.getElementById('cd-seconds').value) || 0;
      _cdRemaining = (h * 3600 + m * 60 + s) * 1000;
    }
    if (_cdRemaining <= 0) { UI.toast('Set a duration.', 'error'); return; }

    _cdRunning = true;
    document.getElementById('cd-start').textContent = 'PAUSE';
    const tick = () => {
      _cdRemaining -= 500;
      if (_cdRemaining <= 0) {
        _cdRemaining = 0;
        clearInterval(_cdInterval);
        _cdRunning = false;
        document.getElementById('cd-start').textContent = 'START';
        UI.toast('⏰ TIMER EXPIRED', 'success');
      }
      const el = document.getElementById('cd-display');
      if (el) el.textContent = formatDuration(_cdRemaining);
    };
    _cdInterval = setInterval(tick, 500);
  }

  function cdReset() {
    clearInterval(_cdInterval);
    _cdRunning = false;
    _cdRemaining = 0;
    const el = document.getElementById('cd-display');
    if (el) el.textContent = '00:00:00';
    document.getElementById('cd-start').textContent = 'START';
  }

  // ===== JULIAN CONVERTERS =====
  function dateToJulian() {
    const input = document.getElementById('date-to-jul-input');
    const resultEl = document.getElementById('date-to-jul-result');
    if (!input.value) { UI.toast('Select a date.', 'error'); return; }
    const date = new Date(input.value + 'T00:00:00Z');
    const j = Julian.fromDate(date);
    resultEl.innerHTML = `
      <div class="result-row"><span class="result-key">AF JULIAN</span><span class="result-val">${j.afJulian}</span></div>
      <div class="result-row"><span class="result-key">LONG FORMAT</span><span class="result-val">${j.longJulian}</span></div>
      <div class="result-row"><span class="result-key">DAY OF YEAR</span><span class="result-val">${j.dayOfYear}</span></div>
      <div class="result-row"><span class="result-key">WEEK #</span><span class="result-val">${j.weekNumber}</span></div>`;
    resultEl.classList.remove('hidden');
  }

  function julianToDate() {
    const year = parseInt(document.getElementById('jul-to-date-year').value);
    const day  = parseInt(document.getElementById('jul-to-date-day').value);
    const resultEl = document.getElementById('jul-to-date-result');
    if (!year || !day || day < 1 || day > 366) { UI.toast('Enter valid year and day (1-366).', 'error'); return; }
    const date = Julian.fromDOY(year, day);
    resultEl.innerHTML = `
      <div class="result-row"><span class="result-key">DATE</span><span class="result-val">${Julian.formatDate(date)}</span></div>
      <div class="result-row"><span class="result-key">ISO</span><span class="result-val">${date.toISOString().slice(0,10)}</span></div>
      <div class="result-row"><span class="result-key">AF JULIAN</span><span class="result-val">${Julian.fromDate(date).afJulian}</span></div>`;
    resultEl.classList.remove('hidden');
  }

  // ===== CONVERSION LISTENERS =====
  function initConversions() {
    const listen = (id, fn, outId) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', () => {
        const val = parseFloat(el.value);
        const out = document.getElementById(outId);
        if (!out) return;
        if (isNaN(val)) { out.innerHTML = ''; return; }
        Convert.renderConversions(fn(val), out);
      });
    };
    listen('conv-inches',     Convert.lengthFromIn,      'out-length');
    listen('conv-lbs',        Convert.weightFromLbs,     'out-weight');
    listen('conv-fahrenheit', Convert.tempFromF,         'out-temp');
    listen('conv-gallons',    Convert.fuelFromGal,       'out-fuel');
    listen('conv-psi',        Convert.pressureFromPsi,   'out-pressure');
    listen('conv-ftlb',       Convert.torqueFromFtLb,    'out-torque');
  }

  function initConvTabs() {
    document.querySelectorAll('.conv-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const key = tab.dataset.conv;
        document.querySelectorAll('.conv-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.conv-panel').forEach(p => p.classList.remove('active'));
        document.getElementById(`conv-${key}`)?.classList.add('active');
      });
    });
  }

  // ===== TOOL TABS =====
  function initToolTabs() {
    document.querySelectorAll('#tool-tabs .tool-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const key = tab.dataset.tool;
        document.querySelectorAll('#tool-tabs .tool-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('#screen-tools .tool-panel').forEach(p => p.classList.remove('active'));
        document.getElementById(`tool-${key}`)?.classList.add('active');
      });
    });
  }

  // ===== HELPERS =====
  function formatDuration(ms) {
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${fmt2(h)}:${fmt2(m)}:${fmt2(s)}`;
  }

  function fmt2(n) { return String(n).padStart(2, '0'); }

  // ===== INIT =====
  function init() {
    // Nav buttons
    document.querySelectorAll('[data-nav]').forEach(btn => {
      btn.addEventListener('click', () => navigate(btn.dataset.nav));
    });

    // Settings FAB
    document.getElementById('settings-fab')?.addEventListener('click', () => navigate('settings'));

    // Confirm modal
    initConfirmModal();

    // Tool tabs
    initToolTabs();
    initConvTabs();
    initConversions();

    // Julian converters
    document.getElementById('date-to-jul-btn')?.addEventListener('click', dateToJulian);
    document.getElementById('jul-to-date-btn')?.addEventListener('click', julianToDate);

    // Stopwatch
    document.getElementById('sw-start')?.addEventListener('click', swStart);
    document.getElementById('sw-lap')?.addEventListener('click', swLap);
    document.getElementById('sw-reset')?.addEventListener('click', swReset);

    // Countdown
    document.getElementById('cd-start')?.addEventListener('click', cdStart);
    document.getElementById('cd-reset')?.addEventListener('click', cdReset);

    // Shift timer
    document.getElementById('shift-set-btn')?.addEventListener('click', () => {
      const input = document.getElementById('shift-start-input');
      setShiftStart(input?.value);
    });

    // Clock
    updateClock();
    setInterval(updateClock, 1000);

    // PWA install
    initInstallPrompt();
  }

  // ===== PWA Install =====
  let _deferredPrompt = null;
  function initInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      _deferredPrompt = e;
      showInstallBanner();
    });
  }

  function showInstallBanner() {
    // Only show if not already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const banner = document.createElement('div');
    banner.id = 'install-banner';
    banner.innerHTML = `
      <span class="install-text">⬡ Install FLIGHTLINE as app for offline use</span>
      <button class="mil-btn sm accent" id="install-yes">INSTALL</button>
      <button class="mil-btn sm" id="install-no">✕</button>`;
    document.getElementById('app')?.appendChild(banner);

    document.getElementById('install-yes')?.addEventListener('click', async () => {
      if (_deferredPrompt) {
        _deferredPrompt.prompt();
        const { outcome } = await _deferredPrompt.userChoice;
        _deferredPrompt = null;
      }
      banner.remove();
    });

    document.getElementById('install-no')?.addEventListener('click', () => banner.remove());
  }

  return { init, navigate, toast, confirm };
})();
