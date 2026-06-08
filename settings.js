/* ===================================================
   FLIGHTLINE — settings.js
   Settings, import/export, themes, DB management
=================================================== */

const Settings = (() => {

  async function exportAll() {
    const data = await DB.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const filename = `flightline_backup_${datestamp()}.json`;
    downloadBlob(blob, filename);
    UI.toast('Backup exported.', 'success');
  }

  async function importBackup(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await DB.importAll(data);
      UI.toast('Import complete. Reloading...', 'success');
      setTimeout(() => location.reload(), 1500);
    } catch (e) {
      UI.toast('Import failed. Invalid file.', 'error');
    }
  }

  async function clearAllData() {
    await DB.clearAll();
    UI.toast('All data cleared.', 'success');
    setTimeout(() => location.reload(), 1500);
  }

  // Theme
  async function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme === 'default' ? '' : theme);
    await DB.put('settings', { key: 'theme', value: theme });
    document.querySelectorAll('.theme-swatch').forEach(s => {
      s.classList.toggle('active', s.dataset.theme === theme);
    });
  }

  async function loadTheme() {
    const rec = await DB.get('settings', 'theme');
    if (rec?.value) {
      document.documentElement.setAttribute('data-theme', rec.value === 'default' ? '' : rec.value);
      document.querySelectorAll('.theme-swatch').forEach(s => {
        s.classList.toggle('active', s.dataset.theme === rec.value);
      });
    }
  }

  // DB record counts
  async function updateCounts() {
    const icao = await DB.getAll('icao');
    const go81 = await DB.getAll('go81');
    const el1 = document.getElementById('icao-count');
    const el2 = document.getElementById('go81-count');
    if (el1) el1.textContent = `${icao.length} records`;
    if (el2) el2.textContent = `${go81.length} records`;
  }

  // Add ICAO record
  async function saveICAO() {
    const code    = document.getElementById('icao-add-code')?.value.trim().toUpperCase();
    const name    = document.getElementById('icao-add-name')?.value.trim();
    const city    = document.getElementById('icao-add-city')?.value.trim();
    const country = document.getElementById('icao-add-country')?.value.trim();
    if (!code || !name) { UI.toast('Code and name required.', 'error'); return; }
    await DB.put('icao', { code, name, city, country });
    UI.toast(`ICAO ${code} saved.`, 'success');
    updateCounts();
    document.getElementById('icao-add-form')?.classList.add('hidden');
    ['icao-add-code','icao-add-name','icao-add-city','icao-add-country'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  }

  // Add GO81 record
  async function saveGO81() {
    const code    = document.getElementById('go81-add-code')?.value.trim().toUpperCase();
    const name    = document.getElementById('go81-add-name')?.value.trim();
    const unit    = document.getElementById('go81-add-unit')?.value.trim();
    const address = document.getElementById('go81-add-address')?.value.trim();
    if (!code || !name) { UI.toast('Code and name required.', 'error'); return; }
    await DB.put('go81', { code, name, unit, address });
    UI.toast(`GO81 ${code} saved.`, 'success');
    updateCounts();
    document.getElementById('go81-add-form')?.classList.add('hidden');
    ['go81-add-code','go81-add-name','go81-add-unit','go81-add-address'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function datestamp() {
    return new Date().toISOString().slice(0,10).replace(/-/g,'');
  }

  function init() {
    loadTheme();

    // Export
    document.getElementById('settings-export-btn')?.addEventListener('click', exportAll);

    // Import
    const importBtn = document.getElementById('settings-import-btn');
    const fileInput = document.getElementById('import-file-input');
    importBtn?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) importBackup(file);
    });

    // Clear data
    document.getElementById('clear-data-btn')?.addEventListener('click', () => {
      UI.confirm('Clear ALL Data?', 'This will delete all tracker entries, notes, ICAO/GO81 records, and settings. This cannot be undone.', clearAllData);
    });

    // Theme swatches
    document.querySelectorAll('.theme-swatch').forEach(s => {
      s.addEventListener('click', () => setTheme(s.dataset.theme));
    });

    // ICAO add toggle
    document.getElementById('icao-add-btn')?.addEventListener('click', () => {
      document.getElementById('icao-add-form')?.classList.toggle('hidden');
    });
    document.getElementById('icao-save-btn')?.addEventListener('click', saveICAO);

    // GO81 add toggle
    document.getElementById('go81-add-btn')?.addEventListener('click', () => {
      document.getElementById('go81-add-form')?.classList.toggle('hidden');
    });
    document.getElementById('go81-save-btn')?.addEventListener('click', saveGO81);

    // About build date
    const buildEl = document.getElementById('about-build');
    if (buildEl) buildEl.textContent = new Date().toISOString().slice(0,10);

    updateCounts();
  }

  return { init, exportAll, importBackup, clearAllData, setTheme, loadTheme, updateCounts };
})();
