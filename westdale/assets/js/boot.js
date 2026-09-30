// Runs before first paint: flags JS support and decides whether the short intro plays.
(function () {
  var d = document.documentElement;
  d.classList.add('js');
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var seen = false;
  try { seen = sessionStorage.getItem('wd-intro') === '1'; } catch (e) {}
  if (reduced || seen) d.classList.add('no-loader');
})();
