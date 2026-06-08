/* ===================================================
   FLIGHTLINE — ops.js
   ICAO lookup, GO81 lookup, time zones, favorites
=================================================== */

const Ops = (() => {

  // ===== SEED DATA =====
  const SEED_ICAO = [
    { code: 'KLSV', name: 'Nellis AFB', city: 'Las Vegas', country: 'NV, USA' },
    { code: 'KEDW', name: 'Edwards AFB', city: 'Edwards', country: 'CA, USA' },
    { code: 'KBAD', name: 'Barksdale AFB', city: 'Shreveport', country: 'LA, USA' },
    { code: 'KDYS', name: 'Dyess AFB', city: 'Abilene', country: 'TX, USA' },
    { code: 'KEND', name: 'Vance AFB', city: 'Enid', country: 'OK, USA' },
    { code: 'KFAF', name: 'Langley-Eustis', city: 'Hampton', country: 'VA, USA' },
    { code: 'KFFO', name: 'Wright-Patterson AFB', city: 'Dayton', country: 'OH, USA' },
    { code: 'KGUS', name: 'Grissom ARB', city: 'Peru', country: 'IN, USA' },
    { code: 'KHIF', name: 'Hill AFB', city: 'Ogden', country: 'UT, USA' },
    { code: 'KHOP', name: 'Campbell AAF', city: 'Fort Campbell', country: 'KY, USA' },
    { code: 'KLFI', name: 'Langley AFB', city: 'Hampton', country: 'VA, USA' },
    { code: 'KLRJ', name: 'Le Mars', city: 'Le Mars', country: 'IA, USA' },
    { code: 'KMCC', name: 'McClellan Air Park', city: 'Sacramento', country: 'CA, USA' },
    { code: 'KMTC', name: 'Selfridge ANGB', city: 'Harrison Twp', country: 'MI, USA' },
    { code: 'KNFW', name: 'NAS Fort Worth JRB', city: 'Fort Worth', country: 'TX, USA' },
    { code: 'KNGU', name: 'NAS Norfolk', city: 'Norfolk', country: 'VA, USA' },
    { code: 'KNPA', name: 'NAS Pensacola', city: 'Pensacola', country: 'FL, USA' },
    { code: 'KOFP', name: 'Quantico MCAS', city: 'Quantico', country: 'VA, USA' },
    { code: 'KOKC', name: 'Tinker AFB', city: 'Oklahoma City', country: 'OK, USA' },
    { code: 'KPMD', name: 'Palmdale Plant 42', city: 'Palmdale', country: 'CA, USA' },
    { code: 'KRCA', name: 'Ellsworth AFB', city: 'Box Elder', country: 'SD, USA' },
    { code: 'KRSN', name: 'Ruston Regional', city: 'Ruston', country: 'LA, USA' },
    { code: 'KSCK', name: 'Stockton Metro', city: 'Stockton', country: 'CA, USA' },
    { code: 'KSKA', name: 'Fairchild AFB', city: 'Spokane', country: 'WA, USA' },
    { code: 'KVAD', name: 'Moody AFB', city: 'Valdosta', country: 'GA, USA' },
    { code: 'KWRB', name: 'Robins AFB', city: 'Warner Robins', country: 'GA, USA' },
    { code: 'OBBI', name: 'Bahrain Intl Airport', city: 'Manama', country: 'Bahrain' },
    { code: 'OKBK', name: 'Kuwait Intl Airport', city: 'Kuwait City', country: 'Kuwait' },
    { code: 'ORBI', name: 'Baghdad Intl Airport', city: 'Baghdad', country: 'Iraq' },
    { code: 'RJTY', name: 'Yokota AB', city: 'Fussa', country: 'Japan' },
    { code: 'RKJK', name: 'Kunsan AB', city: 'Gunsan', country: 'S. Korea' },
    { code: 'RKNN', name: 'Gangneung AB', city: 'Gangneung', country: 'S. Korea' },
    { code: 'RKSO', name: 'Osan AB', city: 'Pyeongtaek', country: 'S. Korea' },
    { code: 'UAAA', name: 'Almaty Intl', city: 'Almaty', country: 'Kazakhstan' },
  ];

  const SEED_GO81 = [
    { code: 'HELN1', name: 'Nellis AFB', unit: '99th ABW', address: 'Nellis AFB, NV' },
    { code: 'HEDW1', name: 'Edwards AFB', unit: '412th TW', address: 'Edwards AFB, CA' },
    { code: 'HBAD1', name: 'Barksdale AFB', unit: '2nd BW', address: 'Barksdale AFB, LA' },
    { code: 'HDYS1', name: 'Dyess AFB', unit: '7th BW', address: 'Dyess AFB, TX' },
    { code: 'HHIF1', name: 'Hill AFB', unit: '75th ABW', address: 'Hill AFB, UT' },
    { code: 'HOAI1', name: 'Osan AB Korea', unit: '51st FW', address: 'Osan AB, Republic of Korea' },
    { code: 'HWRB1', name: 'Robins AFB', unit: '78th ABW', address: 'Robins AFB, GA' },
    { code: 'HVAD1', name: 'Moody AFB', unit: '23rd Wing', address: 'Moody AFB, GA' },
    { code: 'HSKA1', name: 'Fairchild AFB', unit: '92nd ARW', address: 'Fairchild AFB, WA' },
    { code: 'HLFI1', name: 'Langley AFB', unit: '1st FW', address: 'Langley AFB, VA' },
    { code: 'HRCA1', name: 'Ellsworth AFB', unit: '28th BW', address: 'Ellsworth AFB, SD' },
    { code: 'HFFO1', name: 'Wright-Patterson AFB', unit: 'AFMC HQ', address: 'WPAFB, OH' },
    { code: 'HLSV1', name: 'Nellis AFB / USAF WS', unit: 'USAF Warfare Center', address: 'Nellis AFB, NV' },
  ];

  async function seedIfEmpty() {
    const existing = await DB.getAll('icao');
    if (!existing.length) {
      await DB.bulkPut('icao', SEED_ICAO);
    }
    const existingGo81 = await DB.getAll('go81');
    if (!existingGo81.length) {
      await DB.bulkPut('go81', SEED_GO81);
    }
  }

  // ===== ICAO =====
  async function searchICAO(code) {
    const all = await DB.getAll('icao');
    const term = code.toUpperCase().trim();
    return all.filter(r => r.code.toUpperCase() === term);
  }

  function renderICAOResult(results) {
    const el = document.getElementById('icao-result');
    if (!results.length) {
      el.innerHTML = '<div class="result-row"><span class="result-key">NOT FOUND</span><span class="result-val">No record for this code</span></div>';
      el.classList.remove('hidden');
      return;
    }
    const r = results[0];
    el.innerHTML = `
      <div class="result-row"><span class="result-key">CODE</span><span class="result-val">${r.code}</span></div>
      <div class="result-row"><span class="result-key">NAME</span><span class="result-val">${r.name}</span></div>
      <div class="result-row"><span class="result-key">CITY</span><span class="result-val">${r.city || '—'}</span></div>
      <div class="result-row"><span class="result-key">LOCATION</span><span class="result-val">${r.country || '—'}</span></div>
      <div style="margin-top:8px;">
        <button class="mil-btn sm" onclick="Ops.saveFavorite('icao','${r.code}','${r.name.replace(/'/g,"\\'")}')">★ FAVORITE</button>
      </div>`;
    el.classList.remove('hidden');
  }

  // ===== GO81 =====
  async function searchGO81(term) {
    const all = await DB.getAll('go81');
    const t = term.toLowerCase().trim();
    return all.filter(r =>
      r.code.toLowerCase().includes(t) ||
      r.name.toLowerCase().includes(t) ||
      (r.unit && r.unit.toLowerCase().includes(t)) ||
      (r.address && r.address.toLowerCase().includes(t))
    );
  }

  function renderGO81Results(results) {
    const el = document.getElementById('go81-results');
    if (!results.length) {
      el.innerHTML = '<div class="empty-state">NO RESULTS</div>';
      return;
    }
    el.innerHTML = results.slice(0, 20).map(r => `
      <div class="result-item">
        <div>
          <div class="result-code">${r.code}</div>
          <div class="result-name">${r.name}</div>
          ${r.unit ? `<div style="font-size:11px;color:var(--text-dim);margin-top:2px;">${r.unit}</div>` : ''}
          ${r.address ? `<div style="font-size:11px;color:var(--text-dim);">${r.address}</div>` : ''}
        </div>
        <button class="result-star" onclick="Ops.saveFavorite('go81','${r.code}','${r.name.replace(/'/g,"\\'")}')">☆</button>
      </div>`).join('');
  }

  // ===== FAVORITES =====
  async function saveFavorite(type, code, name) {
    const existing = await DB.getAll('favorites');
    const dupe = existing.find(f => f.type === type && f.code === code);
    if (dupe) { UI.toast('Already in favorites.'); return; }
    await DB.put('favorites', { type, code, name, savedAt: new Date().toISOString() });
    UI.toast('★ Saved to favorites.', 'success');
    renderFavorites();
  }

  async function removeFavorite(id) {
    await DB.del('favorites', id);
    renderFavorites();
    UI.toast('Removed from favorites.');
  }

  async function renderFavorites() {
    const all = await DB.getAll('favorites');
    const el = document.getElementById('ops-favorites');
    if (!el) return;
    if (!all.length) {
      el.innerHTML = '<div class="empty-state">No favorites yet. Star a result to save it.</div>';
      return;
    }
    el.innerHTML = all.map(f => `
      <div class="fav-item">
        <span class="fav-type">${f.type.toUpperCase()}</span>
        <span class="fav-name"><strong>${f.code}</strong> — ${f.name}</span>
        <button class="fav-del" onclick="Ops.removeFavorite(${f.id})">✕</button>
      </div>`).join('');
  }

  // ===== TIME ZONES =====
  function updateTimeZones() {
    const now = new Date();
    const fmt = (tz) => {
      try {
        return now.toLocaleTimeString('en-US', { timeZone: tz, hour12: false, hour:'2-digit', minute:'2-digit' });
      } catch { return '--:--'; }
    };
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('tz-local', now.toLocaleTimeString('en-US', { hour12:false, hour:'2-digit', minute:'2-digit' }));
    set('tz-zulu', fmt('UTC'));
    set('tz-est', fmt('America/New_York'));
    set('tz-cst', fmt('America/Chicago'));
    set('tz-mst', fmt('America/Denver'));
    set('tz-pst', fmt('America/Los_Angeles'));
  }

  function init() {
    seedIfEmpty();

    // ICAO search
    const icaoBtn = document.getElementById('icao-search-btn');
    const icaoInput = document.getElementById('icao-input');
    if (icaoBtn) {
      icaoBtn.addEventListener('click', async () => {
        const code = icaoInput.value.trim();
        if (!code) { UI.toast('Enter an ICAO code.', 'error'); return; }
        const results = await searchICAO(code);
        renderICAOResult(results);
      });
    }
    if (icaoInput) {
      icaoInput.addEventListener('keydown', e => { if (e.key === 'Enter') icaoBtn.click(); });
    }

    // GO81 search
    const go81Btn = document.getElementById('go81-search-btn');
    const go81Input = document.getElementById('go81-input');
    if (go81Btn) {
      go81Btn.addEventListener('click', async () => {
        const term = go81Input.value.trim();
        if (!term) { UI.toast('Enter a code or keyword.', 'error'); return; }
        const results = await searchGO81(term);
        renderGO81Results(results);
      });
    }
    if (go81Input) {
      go81Input.addEventListener('keydown', e => { if (e.key === 'Enter') go81Btn.click(); });
      go81Input.addEventListener('input', async () => {
        if (go81Input.value.length >= 2) {
          const results = await searchGO81(go81Input.value);
          renderGO81Results(results);
        }
      });
    }

    renderFavorites();
    updateTimeZones();
    setInterval(updateTimeZones, 30000);
  }

  return { init, saveFavorite, removeFavorite, renderFavorites, searchICAO, searchGO81, seedIfEmpty };
})();
