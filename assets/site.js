(function () {
  // Sticky header: add a subtle shadow once the page is scrolled (all pages).
  function onScroll() {
    var h = document.querySelector('.site-header');
    if (h) { h.classList.toggle('scrolled', window.scrollY > 8); }
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Scroll-reveal: fade sections in as they enter the viewport (homepages only;
  // no-ops where there are no .reveal elements).
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
      // Anything already on screen shows immediately (no first-paint blink).
      if (e.getBoundingClientRect().top < window.innerHeight) { e.classList.add('visible'); }
      else { io.observe(e); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }
})();
