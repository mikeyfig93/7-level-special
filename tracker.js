/* ===================================================
   FLIGHTLINE — tracker.js
   Flight, event, EPB accomplishment logging
=================================================== */

const Tracker = (() => {

  const TYPE_LABELS = {
    flight:     'FLIGHT',
    launch:     'LAUNCH',
    recovery:   'RECOVERY',
    event:      'EVENT',
    exercise:   'EXERCISE',
    inspection: 'INSPECT',
    volunteer:  'VOL HRS',
    epb:        'EPB',
    other:      'OTHER',
  };

  let _period = 'month';
  let _allEntries = [];

  async function loadEntries() {
    _allEntries = await DB.getAll('tracker');
    _allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    return _allEntries;
  }

  async function addEntry(entry) {
    await DB.put('tracker', { ...entry, createdAt: new Date().toISOString() });
    await loadEntries();
    renderLog();
    renderSummary();
    UI.toast('Entry logged.', 'success');
  }

  async function deleteEntry(id) {
    await DB.del('tracker', id);
    await loadEntries();
    renderLog();
    renderSummary();
    UI.toast('Entry removed.');
  }

  function filterByPeriod(entries, period) {
    const now = new Date();
    return entries.filter(e => {
      const d = new Date(e.date);
      if (period === 'month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      } else if (period === 'year') {
        return d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }

  function computeSummary(entries) {
    const summary = { flight:0, launch:0, recovery:0, event:0, exercise:0, inspection:0, volunteer:0, epb:0, other:0, volHours:0 };
    entries.forEach(e => {
      if (summary.hasOwnProperty(e.type)) summary[e.type]++;
      if (e.type === 'volunteer' && e.hours) summary.volHours += parseFloat(e.hours) || 0;
    });
    summary.total = entries.length;
    return summary;
  }

  function renderSummary() {
    const container = document.getElementById('tracker-summary');
    if (!container) return;
    const filtered = filterByPeriod(_allEntries, _period);
    const s = computeSummary(filtered);

    container.innerHTML = [
      { num: s.flight,     lbl: 'FLIGHTS' },
      { num: s.launch,     lbl: 'LAUNCHES' },
      { num: s.recovery,   lbl: 'RECOVERIES' },
      { num: s.event,      lbl: 'EVENTS' },
      { num: s.exercise,   lbl: 'EXERCISES' },
      { num: s.inspection, lbl: 'INSPECTIONS' },
      { num: s.volHours.toFixed(1), lbl: 'VOL HRS' },
      { num: s.epb,        lbl: 'EPB ITEMS' },
      { num: s.total,      lbl: 'TOTAL' },
    ].map(item => `
      <div class="sum-item">
        <div class="sum-item-num">${item.num}</div>
        <div class="sum-item-lbl">${item.lbl}</div>
      </div>`).join('');
  }

  function renderLog(searchTerm = '') {
    const container = document.getElementById('tracker-log');
    if (!container) return;
    const term = searchTerm.toLowerCase();
    const visible = _allEntries.filter(e =>
      !term || e.description?.toLowerCase().includes(term) ||
      e.type?.toLowerCase().includes(term) ||
      e.notes?.toLowerCase().includes(term)
    );

    if (!visible.length) {
      container.innerHTML = '<div class="empty-state">NO ENTRIES</div>';
      return;
    }

    container.innerHTML = visible.map(e => `
      <div class="entry-card">
        <div class="entry-card-header">
          <span class="entry-type-badge">${TYPE_LABELS[e.type] || e.type}</span>
          <span class="entry-date">${formatEntryDate(e.date)}</span>
        </div>
        <div class="entry-desc">${escHtml(e.description || '—')}</div>
        ${e.notes ? `<div class="entry-notes-text">${escHtml(e.notes)}</div>` : ''}
        ${e.hours ? `<div class="entry-notes-text">Hours: ${e.hours}</div>` : ''}
        <div class="entry-actions">
          <button class="entry-del-btn" onclick="Tracker.confirmDelete(${e.id})">DELETE</button>
        </div>
      </div>`).join('');
  }

  async function confirmDelete(id) {
    UI.confirm('Delete this entry?', 'This cannot be undone.', () => deleteEntry(id));
  }

  function formatEntryDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    return `${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  async function exportJSON() {
    await loadEntries();
    const blob = new Blob([JSON.stringify(_allEntries, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `flightline_tracker_${datestamp()}.json`);
  }

  async function exportCSV() {
    await loadEntries();
    const headers = ['id','type','date','description','notes','hours','createdAt'];
    const rows = _allEntries.map(e =>
      headers.map(h => `"${String(e[h] || '').replace(/"/g,'""')}"`).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadBlob(blob, `flightline_tracker_${datestamp()}.csv`);
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

  // Update home screen summary
  async function updateHomeSummary() {
    await loadEntries();
    const monthly = filterByPeriod(_allEntries, 'month');
    const s = computeSummary(monthly);
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('sum-flights', s.flight + s.launch + s.recovery);
    set('sum-events', s.event + s.exercise);
    set('sum-epb', s.epb);
    set('sum-hours', s.volHours.toFixed(1));
  }

  function setPeriod(p) {
    _period = p;
    document.querySelectorAll('.ptog').forEach(b => b.classList.toggle('active', b.dataset.period === p));
    renderSummary();
  }

  function init() {
    // Set today's date as default
    const dateInput = document.getElementById('entry-date');
    if (dateInput) dateInput.value = new Date().toISOString().slice(0,10);

    // Type change → show/hide hours
    const typeSelect = document.getElementById('entry-type');
    const hoursRow = document.getElementById('hours-row');
    if (typeSelect && hoursRow) {
      typeSelect.addEventListener('change', () => {
        hoursRow.style.display = typeSelect.value === 'volunteer' ? 'flex' : 'none';
      });
    }

    // Add entry
    const addBtn = document.getElementById('add-entry-btn');
    if (addBtn) {
      addBtn.addEventListener('click', async () => {
        const type = document.getElementById('entry-type').value;
        const date = document.getElementById('entry-date').value;
        const desc = document.getElementById('entry-desc').value.trim();
        const notes = document.getElementById('entry-notes').value.trim();
        const hours = document.getElementById('entry-hours')?.value || '';

        if (!date) { UI.toast('Select a date.', 'error'); return; }
        if (!desc) { UI.toast('Add a description.', 'error'); return; }

        await addEntry({ type, date, description: desc, notes, hours });

        // Reset form
        document.getElementById('entry-desc').value = '';
        document.getElementById('entry-notes').value = '';
        if (document.getElementById('entry-hours')) document.getElementById('entry-hours').value = '';
        document.getElementById('entry-date').value = new Date().toISOString().slice(0,10);
        await updateHomeSummary();
      });
    }

    // Period toggle
    document.querySelectorAll('.ptog').forEach(btn => {
      btn.addEventListener('click', () => setPeriod(btn.dataset.period));
    });

    // Search
    const searchInput = document.getElementById('tracker-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => renderLog(searchInput.value));
    }

    // Export buttons
    document.getElementById('export-json-btn')?.addEventListener('click', exportJSON);
    document.getElementById('export-csv-btn')?.addEventListener('click', exportCSV);

    loadEntries().then(() => { renderLog(); renderSummary(); updateHomeSummary(); });
  }

  return { init, loadEntries, renderLog, renderSummary, confirmDelete, updateHomeSummary, exportJSON, exportCSV };
})();
