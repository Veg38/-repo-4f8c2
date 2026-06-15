(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll progress bar (#2) — injected so no markup is needed on every page.
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';

  function onScroll() {
    var h = document.querySelector('.site-header');
    if (h) { h.classList.toggle('scrolled', window.scrollY > 8); }
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    bar.style.width = (max > 0 ? (doc.scrollTop / max) * 100 : 0) + '%';
  }
  document.addEventListener('scroll', onScroll, { passive: true });

  // Scroll-reveal: fade sections in as they enter the viewport (no-ops without .reveal).
  function initReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!els.length) { return; }
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (e) {
      if (e.getBoundingClientRect().top < window.innerHeight) { e.classList.add('visible'); }
      else { io.observe(e); }
    });
  }

  // 3D tilt on gallery shots (#6) — skipped when the user prefers reduced motion.
  function initTilt() {
    if (reduce) { return; }
    document.querySelectorAll('.shot').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(700px) rotateY(' + (px * 8).toFixed(2) + 'deg) rotateX(' + (-py * 8).toFixed(2) + 'deg)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
  }

  function init() {
    document.body.appendChild(bar);
    onScroll();
    initReveal();
    initTilt();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
