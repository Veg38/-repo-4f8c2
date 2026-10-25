(function () {
  function initAnalyticsConsent() {
    var measurementId = 'G-Z0X5FF64JF';
    var storageKey = 'agboard-analytics-consent-v1';
    var lifetime = 180 * 24 * 60 * 60 * 1000;
    var french = document.documentElement.lang.indexOf('fr') === 0;
    var choice = null;
    var loaded = false;
    var previousFocus;
    try {
      var saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved && (saved.value === 'accepted' || saved.value === 'refused') && saved.expires > Date.now()) {
        choice = saved.value;
      }
    } catch (error) {}

    function loadAnalytics() {
      if (loaded) { return; }
      loaded = true;
      window['ga-disable-' + measurementId] = false;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('consent', 'default', {
        analytics_storage: 'denied', ad_storage: 'denied',
        ad_user_data: 'denied', ad_personalization: 'denied'
      });
      window.gtag('consent', 'update', { analytics_storage: 'granted' });
      window.gtag('js', new Date());
      window.gtag('config', measurementId, {
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        cookie_expires: 15552000,
        cookie_update: false,
        page_location: window.location.origin + window.location.pathname,
        page_referrer: document.referrer.split('?')[0].split('#')[0]
      });
      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
      document.head.appendChild(script);
    }

    function clearAnalyticsCookies() {
      document.cookie.split(';').forEach(function (cookie) {
        var name = cookie.split('=')[0].trim();
        if (!/^_ga(?:_|$)/.test(name)) { return; }
        var expiry = name + '=; Max-Age=0; path=/';
        document.cookie = expiry;
        var parts = window.location.hostname.split('.');
        while (parts.length > 1) {
          document.cookie = expiry + '; domain=' + parts.join('.');
          parts.shift();
        }
      });
    }

    var banner = document.createElement('section');
    banner.className = 'cookie-banner';
    banner.setAttribute('aria-labelledby', 'cookie-title');
    banner.hidden = true;
    var title = document.createElement('h2');
    title.id = 'cookie-title';
    title.textContent = french ? 'Statistiques du site' : 'Website analytics';
    var description = document.createElement('p');
    description.textContent = french
      ? 'Avec votre accord, Google Analytics utilise des cookies pour mesurer les visites, leur provenance et les pages consultées. Aucun suivi Google avant acceptation. Refuser ne change pas le fonctionnement du site.'
      : 'With your permission, Google Analytics uses cookies to measure visits, their sources and pages viewed. No Google tracking loads before acceptance. Refusing does not affect the website.';
    var policy = document.createElement('a');
    policy.href = 'privacy.html#website-analytics';
    policy.textContent = french ? 'Politique de confidentialité' : 'Privacy policy';
    var actions = document.createElement('div');
    actions.className = 'cookie-actions';

    function saveChoice(value) {
      var wasLoaded = loaded;
      choice = value;
      window['ga-disable-' + measurementId] = value !== 'accepted';
      try {
        localStorage.setItem(storageKey, JSON.stringify({ value: value, expires: Date.now() + lifetime }));
      } catch (error) {}
      banner.hidden = true;
      if (value === 'accepted') { loadAnalytics(); }
      else {
        clearAnalyticsCookies();
        if (wasLoaded) { window.location.reload(); }
      }
      if (previousFocus) { previousFocus.focus(); }
    }

    ['refused', 'accepted'].forEach(function (value) {
      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = value === 'accepted' ? (french ? 'Accepter' : 'Accept') : (french ? 'Refuser' : 'Refuse');
      button.addEventListener('click', function () { saveChoice(value); });
      actions.appendChild(button);
    });
    banner.appendChild(title);
    banner.appendChild(description);
    banner.appendChild(policy);
    banner.appendChild(actions);
    document.body.appendChild(banner);

    var settings = document.createElement('button');
    settings.type = 'button';
    settings.className = 'cookie-settings';
    settings.textContent = french ? 'Gestion des cookies' : 'Cookie settings';
    settings.addEventListener('click', function () {
      previousFocus = settings;
      banner.hidden = false;
      actions.querySelector('button').focus();
    });
    (document.querySelector('.site-footer nav') || document.body).appendChild(settings);
    window.addEventListener('storage', function (event) {
      if (event.key === storageKey || event.key === null) {
        window['ga-disable-' + measurementId] = true;
        window.location.reload();
      }
    });
    if (choice === 'accepted') { loadAnalytics(); }
    else {
      window['ga-disable-' + measurementId] = true;
      clearAnalyticsCookies();
      banner.hidden = choice === 'refused';
    }
  }

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
    initAnalyticsConsent();
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
