/* Miso Taco — enhancements injected into the redesigned pages (loaded fresh each visit).
   - responsive CSS + hamburger nav on phones
   - hides the "certifiably delicious" badge on phones
   - routes the design's Home/Menu/Catering links to the Squarespace pages
   - fixes in-page anchor links (Happy Hour / Locations / logo) inside the embedded frame,
     including jumping to the right section when arriving from another page */
(function () {
  if (window.__misoMobileLoaded) return; window.__misoMobileLoaded = true;

  var MAP = { 'index.html': '/', 'menu.html': '/new-menu', 'catering.html': '/new-catering' };

  var CSS =
    '#miso-burger{display:none;flex-direction:column;justify-content:center;gap:5px;width:46px;height:40px;background:transparent;border:0;cursor:pointer;padding:9px;box-sizing:border-box;}' +
    '#miso-burger span{display:block;height:2px;width:100%;background:#B8402A;border-radius:2px;}' +
    '@media(max-width:820px){' +
      'html,body{overflow-x:hidden !important;}' +
      'img,svg,video,picture,canvas{max-width:100% !important;height:auto !important;}' +
      'header{height:auto !important;min-height:0 !important;padding:12px 16px !important;position:relative !important;align-items:center !important;flex-wrap:wrap !important;}' +
      '[data-miso-badge]{display:none !important;}' +
      'header nav{display:none !important;position:absolute !important;top:100% !important;left:0 !important;right:0 !important;flex-direction:column !important;align-items:center !important;gap:18px !important;background:#1E1B17 !important;padding:22px 0 !important;margin:0 !important;width:100% !important;z-index:60 !important;font-size:15px !important;}' +
      'header nav.miso-open{display:flex !important;}' +
      '#miso-burger{display:inline-flex !important;margin-left:auto !important;}' +
    '}';

  function ensureStyle() {
    if (!document.getElementById('miso-mfix')) {
      var s = document.createElement('style'); s.id = 'miso-mfix'; s.textContent = CSS;
      (document.head || document.documentElement).appendChild(s);
    }
  }

  function ensureBadge() {
    if (document.querySelector('[data-miso-badge]')) return;
    var els = document.querySelectorAll('div,span,figure,p,a');
    for (var i = 0; i < els.length; i++) {
      var t = (els[i].textContent || '');
      if (/CERTIFIABLY|乾杯/.test(t) && els[i].offsetWidth > 0 && els[i].offsetWidth < 320) {
        var el = els[i];
        while (el.parentElement && el.parentElement.offsetWidth < 330 &&
               el.parentElement.tagName !== 'BODY' && el.parentElement.tagName !== 'HEADER') { el = el.parentElement; }
        el.setAttribute('data-miso-badge', '1'); return;
      }
    }
  }

  function ensureBurger() {
    var header = document.querySelector('header'); if (!header) return;
    var nav = header.querySelector('nav'); if (!nav || document.getElementById('miso-burger')) return;
    var b = document.createElement('button'); b.id = 'miso-burger'; b.setAttribute('aria-label', 'Toggle menu');
    b.innerHTML = '<span></span><span></span><span></span>';
    b.addEventListener('click', function (e) { e.stopPropagation(); nav.classList.toggle('miso-open'); });
    header.appendChild(b);
  }

  function rewriteLinks() {
    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href') || '';
      if (href.charAt(0) === '#') continue;
      var key = href.split('/').pop().split('?')[0].split('#')[0];
      if (MAP[key] && links[i].getAttribute('href') !== MAP[key]) {
        links[i].setAttribute('href', MAP[key]); links[i].setAttribute('target', '_top');
      }
    }
  }

  function topPath() { try { return window.top.location.pathname; } catch (e) { return location.pathname; } }
  function isHome() { var p = topPath(); return p === '/' || p === ''; }

  // in-page anchor links (Happy Hour / Locations / logo #top) — native anchors misbehave
  // inside a srcdoc frame, so intercept and scroll manually, or route home if the section
  // isn't on this page.
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.charAt(0) !== '#') return;
    var id = href.slice(1);
    e.preventDefault();
    var nav = document.querySelector('header nav'); if (nav) nav.classList.remove('miso-open');
    if (id === 'top' || id === '') {
      if (isHome()) { try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) { window.scrollTo(0, 0); } }
      else { try { window.top.location.href = '/'; } catch (_) {} }
      return;
    }
    var el = document.getElementById(id);
    if (el) { try { el.scrollIntoView({ behavior: 'smooth' }); } catch (_) { el.scrollIntoView(); } }
    else { try { window.top.location.href = '/#' + id; } catch (_) {} }
  }, true);

  // arriving from another page with a hash -> scroll to that section once it exists
  var hashDone = false;
  function handleHash() {
    if (hashDone) return;
    var h = ''; try { h = window.top.location.hash; } catch (e) { h = location.hash; }
    if (h && h.length > 1) {
      var el = document.getElementById(h.slice(1));
      if (el) { hashDone = true; setTimeout(function () { try { el.scrollIntoView(); } catch (_) {} }, 250); }
    }
  }

  function apply() { try { ensureStyle(); ensureBadge(); ensureBurger(); rewriteLinks(); handleHash(); } catch (e) {} }
  apply();
  var n = 0;
  var iv = setInterval(function () { apply(); if (++n > 30) clearInterval(iv); }, 300);
  document.addEventListener('DOMContentLoaded', apply);
})();
