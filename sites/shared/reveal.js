/* Shared progressive-enhancement: fade sections in as they scroll into view.
   Safe to include anywhere. Does nothing if the browser lacks IntersectionObserver
   or the user prefers reduced motion (CSS already shows .reveal in that case). */
(function () {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
})();
