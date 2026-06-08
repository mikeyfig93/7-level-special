/* ===================================================
   FLIGHTLINE — julian.js
   Julian date conversion utilities
=================================================== */

const Julian = (() => {

  // Get today's Julian day-of-year (1-365/366)
  function todayDOY(date = new Date()) {
    const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
    const diff = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start;
    return Math.floor(diff / 86400000);
  }

  // Format as YYDDD (AF Julian: 2-digit year + 3-digit day)
  function toAFJulian(date = new Date()) {
    const yy = String(date.getUTCFullYear()).slice(-2);
    const doy = String(todayDOY(date)).padStart(3, '0');
    return `${yy}${doy}`;
  }

  // Full Julian string: YYYY-DDD
  function toLongJulian(date = new Date()) {
    const yyyy = date.getUTCFullYear();
    const doy = String(todayDOY(date)).padStart(3, '0');
    return `${yyyy}-${doy}`;
  }

  // Day of year from a specific Date object
  function dayOfYear(date) {
    return todayDOY(date);
  }

  // Week number (ISO-ish)
  function weekNumber(date = new Date()) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  // Convert a Date to all Julian formats
  function fromDate(date) {
    const doy = dayOfYear(date);
    const yy = String(date.getUTCFullYear()).slice(-2);
    const yyyy = date.getUTCFullYear();
    return {
      afJulian: `${yy}${String(doy).padStart(3, '0')}`,
      longJulian: `${yyyy}-${String(doy).padStart(3, '0')}`,
      dayOfYear: doy,
      weekNumber: weekNumber(date),
      year: yyyy,
      dateStr: date.toUTCString().slice(0, 16),
      iso: date.toISOString().slice(0, 10),
    };
  }

  // Convert year + day-of-year to a Date
  function fromDOY(year, doy) {
    const date = new Date(Date.UTC(year, 0, doy));
    return date;
  }

  // Format date nicely
  function formatDate(date) {
    const days = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    return `${days[date.getUTCDay()]} ${String(date.getUTCDate()).padStart(2,'0')} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  }

  // Is leap year
  function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  return { toAFJulian, toLongJulian, dayOfYear, weekNumber, fromDate, fromDOY, formatDate, isLeapYear };
})();
