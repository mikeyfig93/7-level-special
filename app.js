/* ===================================================
   FLIGHTLINE — app.js
   Main entry point — boots all modules
=================================================== */

(async function init() {
  try {
    // Open DB first
    await DB.open();

    // Init modules in dependency order
    Settings.init();   // theme + import/export
    Ops.init();        // ICAO, GO81, tz
    Notes.init();      // notes, ref, acronyms
    Tracker.init();    // flight/event/EPB log
    UI.init();         // navigation, clock, timers

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').then(reg => {
        console.log('[SW] Registered:', reg.scope);
      }).catch(err => {
        console.warn('[SW] Registration failed:', err);
      });
    }

    // Online/offline status indicator
    function updateConnStatus() {
      const dot = document.getElementById('conn-status');
      if (dot) {
        dot.className = navigator.onLine ? 'status-dot online' : 'status-dot offline';
        dot.title = navigator.onLine ? 'Online' : 'Offline';
      }
    }
    window.addEventListener('online', updateConnStatus);
    window.addEventListener('offline', updateConnStatus);
    updateConnStatus();

  } catch (err) {
    console.error('[FLIGHTLINE] Init error:', err);
    document.body.innerHTML = `
      <div style="padding:40px;color:#e8a020;font-family:monospace;font-size:14px;">
        <div>⚠ FLIGHTLINE INIT ERROR</div>
        <div style="color:#8b949e;margin-top:10px;">${err.message}</div>
        <div style="margin-top:20px;color:#484f58;">Try refreshing. If error persists, clear browser data.</div>
      </div>`;
  }
})();
