/* ===================================================
   FLIGHTLINE — db.js
   IndexedDB wrapper — all local persistent storage
=================================================== */

const DB = (() => {
  const DB_NAME = 'flightline_db';
  const DB_VERSION = 1;
  let _db = null;

  const STORES = {
    settings:  { keyPath: 'key' },
    icao:      { keyPath: 'code' },
    go81:      { keyPath: 'code' },
    favorites: { keyPath: 'id', autoIncrement: true },
    tracker:   { keyPath: 'id', autoIncrement: true },
    notes:     { keyPath: 'id', autoIncrement: true },
    reference: { keyPath: 'id', autoIncrement: true },
    acronyms:  { keyPath: 'id', autoIncrement: true },
  };

  function open() {
    return new Promise((resolve, reject) => {
      if (_db) return resolve(_db);
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        Object.entries(STORES).forEach(([name, opts]) => {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name, opts);
          }
        });
      };

      req.onsuccess = (e) => {
        _db = e.target.result;
        resolve(_db);
      };

      req.onerror = (e) => reject(e.target.error);
    });
  }

  function tx(storeName, mode = 'readonly') {
    return open().then(db => {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      return store;
    });
  }

  function get(store, key) {
    return open().then(db => new Promise((resolve, reject) => {
      const req = db.transaction(store, 'readonly').objectStore(store).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    }));
  }

  function getAll(store) {
    return open().then(db => new Promise((resolve, reject) => {
      const req = db.transaction(store, 'readonly').objectStore(store).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    }));
  }

  function put(store, value) {
    return open().then(db => new Promise((resolve, reject) => {
      const req = db.transaction(store, 'readwrite').objectStore(store).put(value);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    }));
  }

  function del(store, key) {
    return open().then(db => new Promise((resolve, reject) => {
      const req = db.transaction(store, 'readwrite').objectStore(store).delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    }));
  }

  function clear(store) {
    return open().then(db => new Promise((resolve, reject) => {
      const req = db.transaction(store, 'readwrite').objectStore(store).clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    }));
  }

  function bulkPut(store, items) {
    return open().then(db => new Promise((resolve, reject) => {
      const transaction = db.transaction(store, 'readwrite');
      const s = transaction.objectStore(store);
      items.forEach(item => s.put(item));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    }));
  }

  // Export all data as a JSON-serializable object
  async function exportAll() {
    const storeNames = Object.keys(STORES);
    const result = {};
    for (const name of storeNames) {
      result[name] = await getAll(name);
    }
    return result;
  }

  // Import all data from a backup object
  async function importAll(data) {
    for (const [name, items] of Object.entries(data)) {
      if (!STORES[name]) continue;
      await clear(name);
      if (items && items.length) {
        await bulkPut(name, items);
      }
    }
  }

  // Clear all stores
  async function clearAll() {
    for (const name of Object.keys(STORES)) {
      await clear(name);
    }
  }

  return { open, get, getAll, put, del, clear, bulkPut, exportAll, importAll, clearAll };
})();
