/* ===================================================
   FLIGHTLINE — convert.js
   Maintenance unit conversions
=================================================== */

const Convert = (() => {

  const LENGTH = [
    { key: 'cm',   label: 'Centimeters',   fn: v => v * 2.54 },
    { key: 'ft',   label: 'Feet',          fn: v => v / 12 },
    { key: 'mm',   label: 'Millimeters',   fn: v => v * 25.4 },
    { key: 'm',    label: 'Meters',        fn: v => v * 0.0254 },
  ];

  const WEIGHT = [
    { key: 'kg',   label: 'Kilograms',     fn: v => v * 0.453592 },
    { key: 'oz',   label: 'Ounces',        fn: v => v * 16 },
    { key: 'g',    label: 'Grams',         fn: v => v * 453.592 },
    { key: 'ton',  label: 'Short Tons',    fn: v => v / 2000 },
  ];

  const FUEL = [
    { key: 'l',    label: 'Liters',        fn: v => v * 3.78541 },
    { key: 'lbs',  label: 'Lbs (JP-8)',    fn: v => v * 6.7 },   // approx JP-8
    { key: 'imp',  label: 'Imp. Gallons',  fn: v => v * 0.832674 },
    { key: 'm3',   label: 'Cubic Meters',  fn: v => v * 0.00378541 },
  ];

  const PRESSURE = [
    { key: 'kpa',  label: 'Kilopascals',   fn: v => v * 6.89476 },
    { key: 'bar',  label: 'Bar',           fn: v => v * 0.0689476 },
    { key: 'inhg', label: 'In/Hg',         fn: v => v * 2.03602 },
    { key: 'atm',  label: 'Atmospheres',   fn: v => v * 0.068046 },
  ];

  const TORQUE = [
    { key: 'nm',   label: 'Newton-Meters', fn: v => v * 1.35582 },
    { key: 'inlb', label: 'In-Lbs',        fn: v => v * 12 },
    { key: 'kgm',  label: 'Kgf-Meters',    fn: v => v * 0.138255 },
    { key: 'ozin', label: 'Oz-In',         fn: v => v * 192 },
  ];

  function fmt(n) {
    if (n === null || isNaN(n)) return '—';
    if (Math.abs(n) < 0.001 && n !== 0) return n.toExponential(3);
    if (Math.abs(n) >= 10000) return n.toFixed(1);
    return parseFloat(n.toPrecision(5)).toString();
  }

  function lengthFromIn(inches) {
    return LENGTH.map(u => ({ label: u.label, val: fmt(u.fn(inches)), unit: u.key }));
  }

  function weightFromLbs(lbs) {
    return WEIGHT.map(u => ({ label: u.label, val: fmt(u.fn(lbs)), unit: u.key }));
  }

  function tempFromF(f) {
    const c = (f - 32) * 5 / 9;
    const k = c + 273.15;
    return [
      { label: 'Celsius',  val: fmt(c), unit: '°C' },
      { label: 'Kelvin',   val: fmt(k), unit: 'K' },
      { label: 'Rankine',  val: fmt(f + 459.67), unit: '°R' },
    ];
  }

  function fuelFromGal(gal) {
    return FUEL.map(u => ({ label: u.label, val: fmt(u.fn(gal)), unit: u.key }));
  }

  function pressureFromPsi(psi) {
    return PRESSURE.map(u => ({ label: u.label, val: fmt(u.fn(psi)), unit: u.key }));
  }

  function torqueFromFtLb(ftlb) {
    return TORQUE.map(u => ({ label: u.label, val: fmt(u.fn(ftlb)), unit: u.key }));
  }

  function renderConversions(results, container) {
    if (!results || !results.length) return;
    container.innerHTML = results.map(r =>
      `<div class="conv-line">
        <span class="conv-lbl">${r.label}</span>
        <span class="conv-num">${r.val} <small>${r.unit}</small></span>
      </div>`
    ).join('');
  }

  return { lengthFromIn, weightFromLbs, tempFromF, fuelFromGal, pressureFromPsi, torqueFromFtLb, renderConversions };
})();
