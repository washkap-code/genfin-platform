/* GENFIN preview review countdown — Jonomi Digital Studios
   Counts down to the review deadline. After the deadline, visitors are
   sent to the hold page (client-side fallback; edge middleware is the
   authoritative lock). */
(function () {
  'use strict';

  // Mon 13 Jul 2026, 12:00 CAT (UTC+2) => 10:00 UTC
  var DEADLINE = Date.UTC(2026, 6, 13, 10, 0, 0);
  var HOLD_PATH = '/hold.html';

  function hasUnlockCookie() {
    return /(?:^|;\s*)gf_unlocked=1(?:;|$)/.test(document.cookie);
  }

  function onHoldPage() {
    return /\/hold(?:\.html)?$/.test(location.pathname);
  }

  // --- Past deadline: lock (fallback for cached/offline pages) ----------
  if (Date.now() >= DEADLINE) {
    if (!onHoldPage() && !hasUnlockCookie() && location.protocol !== 'file:') {
      location.replace(HOLD_PATH);
    }
    return; // no banner after deadline
  }

  // --- Before deadline: render countdown pill ---------------------------
  var COLLAPSE_KEY = 'gf_cd_collapsed';
  var collapsed = false;
  try { collapsed = localStorage.getItem(COLLAPSE_KEY) === '1'; } catch (e) {}

  var style = document.createElement('style');
  style.textContent =
    '#gf-cd{position:fixed;right:16px;bottom:16px;z-index:2147483000;' +
    'font-family:Inter,-apple-system,"Segoe UI",Roboto,sans-serif;' +
    'background:#14141A;color:#FFF;border:1px solid #33323A;' +
    'border-left:4px solid #FBBD3E;border-radius:12px;' +
    'box-shadow:0 8px 28px rgba(20,20,26,.35);padding:10px 14px;' +
    'max-width:290px;line-height:1.35;font-size:12.5px;cursor:default}' +
    '#gf-cd .gf-cd-t{color:#FBBD3E;font-weight:700;font-size:11px;' +
    'letter-spacing:.06em;text-transform:uppercase;margin-bottom:2px}' +
    '#gf-cd .gf-cd-n{font-variant-numeric:tabular-nums;font-weight:700;' +
    'font-size:16px;color:#FFF;margin:2px 0}' +
    '#gf-cd .gf-cd-s{color:#A6A5AF;font-size:11.5px}' +
    '#gf-cd .gf-cd-x{position:absolute;top:6px;right:8px;background:none;' +
    'border:none;color:#A6A5AF;font-size:14px;cursor:pointer;padding:2px}' +
    '#gf-cd .gf-cd-x:hover{color:#FFF}' +
    '#gf-cd.gf-min{padding:8px 12px;max-width:none;cursor:pointer}' +
    '#gf-cd.gf-min .gf-cd-t,#gf-cd.gf-min .gf-cd-s,#gf-cd.gf-min .gf-cd-x{display:none}' +
    '#gf-cd.gf-min .gf-cd-n{font-size:13px;margin:0}' +
    '@media (max-width:640px){#gf-cd{right:10px;bottom:10px;max-width:240px}}';
  document.head.appendChild(style);

  var box = document.createElement('div');
  box.id = 'gf-cd';
  box.setAttribute('role', 'status');
  box.innerHTML =
    '<button class="gf-cd-x" aria-label="Minimise" title="Minimise">&#8722;</button>' +
    '<div class="gf-cd-t">Preview review period</div>' +
    '<div class="gf-cd-n">&nbsp;</div>' +
    '<div class="gf-cd-s">Site goes on hold Mon 13 Jul 2026, 12:00 (CAT)</div>';
  if (collapsed) box.className = 'gf-min';

  function mount() { document.body.appendChild(box); }
  if (document.body) { mount(); } else {
    document.addEventListener('DOMContentLoaded', mount);
  }

  var numEl = box.querySelector('.gf-cd-n');

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function tick() {
    var ms = DEADLINE - Date.now();
    if (ms <= 0) {
      if (!onHoldPage() && !hasUnlockCookie() && location.protocol !== 'file:') {
        location.replace(HOLD_PATH);
      }
      return;
    }
    var s = Math.floor(ms / 1000);
    var d = Math.floor(s / 86400);
    var h = Math.floor((s % 86400) / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    numEl.textContent = (box.className === 'gf-min' ? '⏳ ' : '') +
      d + 'd ' + pad(h) + 'h ' + pad(m) + 'm ' + pad(sec) + 's';
    setTimeout(tick, 1000);
  }
  tick();

  box.querySelector('.gf-cd-x').addEventListener('click', function (e) {
    e.stopPropagation();
    box.className = 'gf-min';
    try { localStorage.setItem(COLLAPSE_KEY, '1'); } catch (err) {}
  });
  box.addEventListener('click', function () {
    if (box.className === 'gf-min') {
      box.className = '';
      try { localStorage.setItem(COLLAPSE_KEY, '0'); } catch (err) {}
    }
  });
})();
