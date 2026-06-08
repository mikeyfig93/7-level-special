/* ===================================================
   FLIGHTLINE — notes.js
   Notes, reference snippets, acronyms
=================================================== */

const Notes = (() => {

  // ===== SEED REFERENCES =====
  const SEED_REF = [
    { title: 'Technical Order (TO) Hierarchy', body: '1. AF-level TOs\n2. MDS-specific TOs\n3. Job Guide / WC\n4. Part I/II/III\n\nAlways use latest revision. Check ETIMS for currency.', tags: 'TO,ETIMS,maintenance' },
    { title: 'Red X Symbols', body: 'Red X — Aircraft grounded, DO NOT FLY\nRed Dash (/) — Limits flight, note conditions\nRed Diagonal — Removed/missing equipment\n\nOnly a Pro Super or higher can clear Red X.', tags: 'forms,781,red x' },
    { title: 'AFTO Form 781 Sections', body: 'Forms A: Maintenance Discrepancy\nForms B: Corrective Action\nForms C: Fuel Loading\nForms D: Engine Run\nForms F: Accessory Data\nForms G: Flight Schedule', tags: 'forms,781,documentation' },
    { title: 'EPB Bullet Format', body: 'Action—Impact—Result\n\nExample:\n"Executed 47 sorties in support of Red Flag 23-1; maintained 98% MC rate—ensured mission success for 200+ personnel"\n\nKeep bullets to 2 lines max on paper.', tags: 'EPB,performance,awards' },
    { title: 'Mandatory Inspection Intervals', body: 'Phase: Per MDS-specific TO (typically 200, 400, or 600 hrs)\nDocumentation: AFTO 781 + IMDS/G081\n\nAlways check aircraft forms before phase begins.', tags: 'inspection,phase,maintenance' },
    { title: 'IMDS/G081 Common Codes', body: 'WUC — Work Unit Code (system/subsystem ID)\nJCN — Job Control Number (tracks work)\nWO — Work Order\nCCN — Component Control Number\nTCTO — Time Compliance Tech Order', tags: 'G081,IMDS,codes' },
    { title: 'Hazmat Handling Notes', body: '- Always check SDS (Safety Data Sheet)\n- PPE requirements per SDS\n- Spill kits location: check with Bldg. Safety Rep\n- Hazmat pickup: Contact Environmental via work order\n- Never pour chemicals down drain', tags: 'hazmat,safety,environment' },
    { title: 'Ground Safety — FOD Walk', body: 'FOD Walk: conducted at shift start or before flight ops\n- Walk abreast, arm-length spacing\n- Check all surfaces, drains, engine inlets\n- Document finds in FOD log\n- FOD boss if available', tags: 'safety,FOD,flightline' },
    { title: 'Torque Wrench Care', body: '- NEVER use as pry bar or hammer\n- Store at lowest setting (zero out after use)\n- Calibrate per schedule (typically annually)\n- Check cal sticker before use\n- Document use in forms when required', tags: 'tools,torque,calibration' },
    { title: 'Lock/Tag/Try (LO/TO)', body: '1. NOTIFY supervisor and crew\n2. SHUT DOWN energy source\n3. ISOLATE all energy forms\n4. LOCK OUT with personal lock\n5. TAG OUT on lockout device\n6. TRY to activate — verify zero energy', tags: 'safety,LOTO,electrical' },
  ];

  const SEED_ACRONYMS = [
    { abbr: 'AFSC', def: 'Air Force Specialty Code' },
    { abbr: 'AMU', def: 'Aircraft Maintenance Unit' },
    { abbr: 'AMXS', def: 'Aircraft Maintenance Squadron' },
    { abbr: 'AOC', def: 'Air Operations Center' },
    { abbr: 'APU', def: 'Auxiliary Power Unit' },
    { abbr: 'AR', def: 'Air Refueling' },
    { abbr: 'ARMS', def: 'Aviation Resource Management System' },
    { abbr: 'ATO', def: 'Air Tasking Order' },
    { abbr: 'AWM', def: 'Awaiting Maintenance' },
    { abbr: 'AWP', def: 'Awaiting Parts' },
    { abbr: 'CCN', def: 'Component Control Number' },
    { abbr: 'CND', def: 'Could Not Duplicate' },
    { abbr: 'DIFM', def: 'Due-In From Maintenance' },
    { abbr: 'EPB', def: 'Enlisted Performance Brief' },
    { abbr: 'EPR', def: 'Enlisted Performance Report' },
    { abbr: 'ETIMS', def: 'Enhanced Technical Information Management System' },
    { abbr: 'FMC', def: 'Fully Mission Capable' },
    { abbr: 'FOD', def: 'Foreign Object Debris/Damage' },
    { abbr: 'FTD', def: 'Field Training Detachment' },
    { abbr: 'G081', def: 'IMDS Core Automated Maintenance System (CAMS)' },
    { abbr: 'HMI', def: 'Hazardous Material Information' },
    { abbr: 'IAW', def: 'In Accordance With' },
    { abbr: 'ICAO', def: 'International Civil Aviation Organization' },
    { abbr: 'IMDS', def: 'Integrated Maintenance Data System' },
    { abbr: 'JCN', def: 'Job Control Number' },
    { abbr: 'JST', def: 'Joint Service Transcript' },
    { abbr: 'LO/TO', def: 'Lockout/Tagout' },
    { abbr: 'MDS', def: 'Mission Design Series (aircraft type)' },
    { abbr: 'MOC', def: 'Maintenance Operations Center' },
    { abbr: 'MOS', def: 'Military Occupational Specialty (Army)' },
    { abbr: 'MXG', def: 'Maintenance Group' },
    { abbr: 'MXS', def: 'Maintenance Squadron' },
    { abbr: 'NMC', def: 'Not Mission Capable' },
    { abbr: 'NMCB', def: 'NMC — Both (supply and maintenance)' },
    { abbr: 'NMCM', def: 'NMC — Maintenance' },
    { abbr: 'NMCS', def: 'NMC — Supply (awaiting parts)' },
    { abbr: 'OCF', def: 'Out of Commission for Flight (older term)' },
    { abbr: 'OG', def: 'Operations Group' },
    { abbr: 'OI', def: 'Operating Instruction' },
    { abbr: 'OPR', def: 'Officer Performance Report / Office of Primary Responsibility' },
    { abbr: 'PACAF', def: 'Pacific Air Forces' },
    { abbr: 'PMC', def: 'Partially Mission Capable' },
    { abbr: 'PPE', def: 'Personal Protective Equipment' },
    { abbr: 'QA', def: 'Quality Assurance' },
    { abbr: 'RON', def: 'Remain Overnight' },
    { abbr: 'SDS', def: 'Safety Data Sheet' },
    { abbr: 'SIE', def: 'Shutdown in Emergency' },
    { abbr: 'SOF', def: 'Supervisor of Flying' },
    { abbr: 'SQ', def: 'Squadron' },
    { abbr: 'SUPT', def: 'Superintendent' },
    { abbr: 'TCTO', def: 'Time Compliance Technical Order' },
    { abbr: 'TDY', def: 'Temporary Duty' },
    { abbr: 'TO', def: 'Technical Order' },
    { abbr: 'UTA', def: 'Unit Training Assembly (Reserve/Guard drill weekend)' },
    { abbr: 'WO', def: 'Work Order' },
    { abbr: 'WUC', def: 'Work Unit Code' },
    { abbr: 'Zulu', def: 'Coordinated Universal Time (UTC)' },
  ];

  async function seedIfEmpty() {
    const existRef = await DB.getAll('reference');
    if (!existRef.length) await DB.bulkPut('reference', SEED_REF.map((r, i) => ({ ...r, id: i + 1 })));
    const existAcro = await DB.getAll('acronyms');
    if (!existAcro.length) await DB.bulkPut('acronyms', SEED_ACRONYMS.map((a, i) => ({ ...a, id: i + 1 })));
  }

  // ===== NOTES =====
  async function saveNote() {
    const title = document.getElementById('note-title').value.trim();
    const body  = document.getElementById('note-body').value.trim();
    if (!title && !body) { UI.toast('Note is empty.', 'error'); return; }
    await DB.put('notes', {
      title: title || 'Untitled',
      body,
      savedAt: new Date().toISOString(),
    });
    document.getElementById('note-title').value = '';
    document.getElementById('note-body').value = '';
    UI.toast('Note saved.', 'success');
    renderNotes();
  }

  async function deleteNote(id) {
    await DB.del('notes', id);
    renderNotes();
    UI.toast('Note deleted.');
  }

  async function renderNotes(term = '') {
    const all = await DB.getAll('notes');
    const t = term.toLowerCase();
    const el = document.getElementById('notes-list');
    if (!el) return;
    const filtered = all.filter(n =>
      !t || n.title?.toLowerCase().includes(t) || n.body?.toLowerCase().includes(t)
    ).sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

    if (!filtered.length) {
      el.innerHTML = '<div class="empty-state">NO NOTES</div>';
      return;
    }

    el.innerHTML = filtered.map(n => `
      <div class="note-card">
        <div class="note-title-row">
          <span class="note-title-text">${escHtml(n.title)}</span>
          <span class="note-date">${fmtDate(n.savedAt)}</span>
        </div>
        <div class="note-body-text">${escHtml(n.body)}</div>
        <div class="entry-actions">
          <button class="entry-del-btn" onclick="Notes.deleteNote(${n.id})">DELETE</button>
        </div>
      </div>`).join('');
  }

  // ===== REFERENCE =====
  async function saveReference() {
    const title = document.getElementById('ref-title').value.trim();
    const body  = document.getElementById('ref-body').value.trim();
    const tags  = document.getElementById('ref-tags').value.trim();
    if (!title) { UI.toast('Add a title.', 'error'); return; }
    await DB.put('reference', { title, body, tags, savedAt: new Date().toISOString() });
    document.getElementById('ref-title').value = '';
    document.getElementById('ref-body').value = '';
    document.getElementById('ref-tags').value = '';
    UI.toast('Reference saved.', 'success');
    renderReference();
  }

  async function deleteRef(id) {
    await DB.del('reference', id);
    renderReference();
  }

  async function renderReference(term = '') {
    const all = await DB.getAll('reference');
    const t = term.toLowerCase();
    const el = document.getElementById('ref-list');
    if (!el) return;
    const filtered = all.filter(r =>
      !t || r.title?.toLowerCase().includes(t) || r.body?.toLowerCase().includes(t) || r.tags?.toLowerCase().includes(t)
    );

    if (!filtered.length) {
      el.innerHTML = '<div class="empty-state">NO REFERENCES</div>';
      return;
    }

    el.innerHTML = filtered.map(r => `
      <div class="note-card">
        <div class="note-title-row">
          <span class="note-title-text">${escHtml(r.title)}</span>
          <button class="entry-del-btn" onclick="Notes.deleteRef(${r.id})">DEL</button>
        </div>
        ${r.tags ? `<div style="font-size:10px;color:var(--accent);letter-spacing:1px;margin-bottom:4px;">${escHtml(r.tags)}</div>` : ''}
        <div class="note-body-text">${escHtml(r.body)}</div>
      </div>`).join('');
  }

  // ===== ACRONYMS =====
  async function saveAcronym() {
    const abbr = document.getElementById('acro-abbr').value.trim().toUpperCase();
    const def  = document.getElementById('acro-def').value.trim();
    if (!abbr || !def) { UI.toast('Enter abbreviation and definition.', 'error'); return; }
    await DB.put('acronyms', { abbr, def });
    document.getElementById('acro-abbr').value = '';
    document.getElementById('acro-def').value = '';
    UI.toast('Acronym saved.', 'success');
    renderAcronyms();
  }

  async function deleteAcro(id) {
    await DB.del('acronyms', id);
    renderAcronyms();
  }

  async function renderAcronyms(term = '') {
    const all = await DB.getAll('acronyms');
    const t = term.toLowerCase();
    const el = document.getElementById('acro-list');
    if (!el) return;
    const filtered = all.filter(a =>
      !t || a.abbr?.toLowerCase().includes(t) || a.def?.toLowerCase().includes(t)
    ).sort((a, b) => a.abbr?.localeCompare(b.abbr));

    if (!filtered.length) {
      el.innerHTML = '<div class="empty-state">NO ACRONYMS</div>';
      return;
    }

    el.innerHTML = filtered.map(a => `
      <div class="acro-card">
        <span class="acro-abbr">${escHtml(a.abbr)}</span>
        <span class="acro-def">${escHtml(a.def)}</span>
        <button class="fav-del" onclick="Notes.deleteAcro(${a.id})">✕</button>
      </div>`).join('');
  }

  // ===== SHIFT NOTE =====
  async function loadShiftNote() {
    const rec = await DB.get('settings', 'shift_note');
    const el = document.getElementById('shift-note-display');
    if (el) el.textContent = rec?.value || 'Tap to add shift note...';
    const input = document.getElementById('shift-note-input');
    if (input) input.value = rec?.value || '';
  }

  async function saveShiftNote() {
    const val = document.getElementById('shift-note-input')?.value || '';
    await DB.put('settings', { key: 'shift_note', value: val });
    const el = document.getElementById('shift-note-display');
    if (el) el.textContent = val || 'Tap to add shift note...';
    document.getElementById('shift-note-modal')?.classList.add('hidden');
    UI.toast('Shift note saved.', 'success');
  }

  function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function fmtDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    return `${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]}`;
  }

  function init() {
    seedIfEmpty();

    // Note tabs
    document.querySelectorAll('[data-note-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        const key = tab.dataset.noteTab;
        document.querySelectorAll('[data-note-tab]').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('#screen-notes .tool-panel').forEach(p => p.classList.remove('active'));
        const panels = { notes: 'notes-panel', ref: 'ref-panel', acronyms: 'acronyms-panel' };
        document.getElementById(panels[key])?.classList.add('active');
      });
    });

    // Save note
    document.getElementById('save-note-btn')?.addEventListener('click', saveNote);

    // Note search
    document.getElementById('note-search')?.addEventListener('input', e => renderNotes(e.target.value));

    // Reference
    document.getElementById('save-ref-btn')?.addEventListener('click', saveReference);
    document.getElementById('ref-search')?.addEventListener('input', e => renderReference(e.target.value));

    // Acronyms
    document.getElementById('save-acro-btn')?.addEventListener('click', saveAcronym);
    document.getElementById('acro-search')?.addEventListener('input', e => renderAcronyms(e.target.value));

    // Shift note modal
    document.getElementById('shift-note-block')?.addEventListener('click', () => {
      document.getElementById('shift-note-modal')?.classList.remove('hidden');
    });
    document.getElementById('shift-note-cancel')?.addEventListener('click', () => {
      document.getElementById('shift-note-modal')?.classList.add('hidden');
    });
    document.getElementById('shift-note-save')?.addEventListener('click', saveShiftNote);

    loadShiftNote();
    renderNotes();
    renderReference();
    renderAcronyms();
  }

  return { init, deleteNote, deleteRef, deleteAcro, saveNote, saveReference, saveAcronym, saveShiftNote };
})();
