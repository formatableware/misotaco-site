/* Miso Taco redesign loader
   Usage in a Squarespace Code Block:
   <script src="https://cdn.jsdelivr.net/gh/formatableware/misotaco-site@main/loader.js" data-page="index.html"></script>
   Renders the redesigned page (from this repo) full-screen, applies mobile.css,
   and routes the in-page nav to the matching Squarespace pages. */
(function () {
  var s = document.currentScript;
  var page = (s && s.dataset && s.dataset.page) || 'index.html';
  var B = 'https://cdn.jsdelivr.net/gh/formatableware/misotaco-site@main/';
  var MAP = { 'index.html': '/', 'menu.html': '/new-menu', 'catering.html': '/new-catering' };

  var root = document.createElement('div');
  root.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:2147483647;background:#F3E9D6';
  document.body.appendChild(root);

  var css = '';
  fetch(B + 'mobile.css').then(function (r) { return r.ok ? r.text() : ''; })
    .then(function (c) { css = c; }).catch(function () {});

  fetch(B + page).then(function (r) { return r.text(); }).then(function (html) {
    var frame = document.createElement('iframe');
    frame.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:0';
    root.appendChild(frame);
    frame.srcdoc = html;

    // Re-apply the mobile stylesheet a few times, since the page rebuilds
    // its own DOM after load and could drop an early injection.
    var tries = 0;
    var iv = setInterval(function () {
      try {
        var d = frame.contentDocument;
        if (d && css && !d.getElementById('miso-mobilefix')) {
          var st = d.createElement('style');
          st.id = 'miso-mobilefix';
          st.textContent = css;
          (d.head || d.documentElement).appendChild(st);
        }
      } catch (e) {}
      if (++tries > 20) clearInterval(iv);
    }, 300);

    // Route the redesign's own nav links to the matching Squarespace pages.
    frame.addEventListener('load', function () {
      try {
        var d = frame.contentDocument;
        d.addEventListener('click', function (e) {
          var a = e.target.closest ? e.target.closest('a[href]') : null;
          if (!a) return;
          var key = (a.getAttribute('href') || '').split('/').pop().split('?')[0].split('#')[0];
          if (MAP[key]) { e.preventDefault(); window.top.location.href = MAP[key]; }
        }, true);
      } catch (x) {}
    });
  }).catch(function (e) { root.textContent = 'Could not load the page. ' + e.message; });
})();
