/* ==========================================================================
   GENFIN — shared site behaviour (multi-page)
   Adapted from the approved design-system reference. Interaction logic is
   preserved 1:1; the SPA hash-router is replaced by real page URLs.
   ========================================================================== */
(function () {
  'use strict';

  function init() {
    if (window.lucide) lucide.createIcons();

    /* ---- Sticky header state ---- */
    var header = document.getElementById('header');
    if (header) {
      addEventListener('scroll', function () {
        header.classList.toggle('scrolled', scrollY > 8);
      }, { passive: true });
    }

    /* ---- Mobile menu ---- */
    var burger = document.getElementById('burger');
    var menu = document.getElementById('mobileMenu');
    if (burger && menu) {
      burger.addEventListener('click', function () {
        var open = menu.classList.toggle('open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      menu.addEventListener('click', function (e) {
        if (e.target.closest('a')) menu.classList.remove('open');
      });
    }

    /* ---- Plan billing toggle (home) ---- */
    var toggle = document.getElementById('toggle');
    if (toggle) {
      toggle.querySelectorAll('button').forEach(function (btn) {
        btn.addEventListener('click', function () {
          toggle.querySelectorAll('button').forEach(function (b) { b.classList.remove('on'); });
          btn.classList.add('on');
          var annual = btn.dataset.mode === 'annual';
          document.querySelectorAll('#page-home .plan .amt[data-m]').forEach(function (el) {
            el.textContent = annual ? el.dataset.a : el.dataset.m;
          });
          document.querySelectorAll('#page-home .plan [data-per]').forEach(function (el) {
            el.textContent = annual ? '/ year' : '/ month';
          });
        });
      });
    }

    /* ---- FAQ accordion ---- */
    document.querySelectorAll('.faq-item .faq-q').forEach(function (q) {
      q.addEventListener('click', function () {
        q.parentElement.classList.toggle('open');
      });
    });

    /* ---- Reveal on scroll ---- */
    var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var reveals = document.querySelectorAll('.reveal');
    if (reduced || !('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.1 });
      reveals.forEach(function (el) { io.observe(el); });
    }

    /* ---- Quote modal ---- */
    var qm = document.getElementById('quoteModal');
    if (qm) {
      var qmPlan = document.getElementById('qmPlan');
      var lastFocus = null;
      function openQuote(plan) {
        lastFocus = document.activeElement;
        document.getElementById('qmForm').hidden = false;
        document.getElementById('qmSuccess').hidden = true;
        if (plan && qmPlan) {
          var o = Array.from(qmPlan.options).find(function (op) { return op.text === plan; });
          if (o) qmPlan.value = o.value;
        }
        qm.hidden = false;
        requestAnimationFrame(function () { qm.classList.add('show'); });
        var first = qm.querySelector('input, select, button');
        if (first) first.focus();
        if (window.lucide) lucide.createIcons();
      }
      function closeQuote() {
        qm.classList.remove('show');
        setTimeout(function () { qm.hidden = true; }, 220);
        if (lastFocus) lastFocus.focus();
      }
      document.getElementById('qmClose').addEventListener('click', closeQuote);
      document.getElementById('qmDone').addEventListener('click', closeQuote);
      qm.addEventListener('click', function (e) { if (e.target === qm) closeQuote(); });
      addEventListener('keydown', function (e) { if (e.key === 'Escape' && !qm.hidden) closeQuote(); });
      document.getElementById('quoteForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var form = e.target;
        var cfg = window.GENFIN_CONFIG || {};
        var showSuccess = function () {
          document.getElementById('qmPlanEcho').textContent = qmPlan.value;
          document.getElementById('qmForm').hidden = true;
          document.getElementById('qmSuccess').hidden = false;
          if (window.lucide) lucide.createIcons();
        };
        if (cfg.SUPABASE_URL && cfg.SUPABASE_PUBLISHABLE_KEY) {
          var btn = form.querySelector('button[type="submit"]');
          if (btn) { btn.disabled = true; btn.textContent = 'Sending\u2026'; }
          fetch(cfg.SUPABASE_URL + '/rest/v1/quote_requests', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': cfg.SUPABASE_PUBLISHABLE_KEY,
              'Authorization': 'Bearer ' + cfg.SUPABASE_PUBLISHABLE_KEY,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              name: form.elements.name.value.trim(),
              phone: form.elements.phone.value.trim(),
              email: form.elements.email.value.trim() || null,
              plan: form.elements.plan.value,
              people: form.elements.people.value,
              message: form.elements.msg.value.trim() || null,
              source: 'website'
            })
          }).then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            showSuccess();
          }).catch(function () {
            if (btn) { btn.disabled = false; btn.innerHTML = '<i data-lucide="send"></i>Request my quote'; if (window.lucide) lucide.createIcons(); }
            alert('Something went wrong sending your request. Please try again, or call +263 78 632 3131.');
          });
        } else {
          showSuccess();
        }
      });
      document.addEventListener('click', function (e) {
        var t = e.target.closest('[data-quote]');
        if (t) { e.preventDefault(); openQuote(t.dataset.quote); }
      });
    }


    /* ---- Connected ecosystem (home signature experience) ---- */
    var eco = document.querySelector('[data-eco]');
    if (eco) {
      var nodes = Array.from(eco.querySelectorAll('.eco-node'));
      var panel = eco.querySelector('.eco-panel');
      var stepEl = document.getElementById('ecoStep');
      var titleEl = document.getElementById('ecoTitle');
      var copyEl = document.getElementById('ecoCopy');
      var n = nodes.length;
      var current = 0;
      var timer = null;
      var userTouched = false;

      function pad(i) { return (i < 9 ? '0' : '') + (i + 1); }

      function select(i, focus) {
        current = (i + n) % n;
        nodes.forEach(function (node, k) {
          var on = k === current;
          node.setAttribute('aria-selected', on ? 'true' : 'false');
          node.tabIndex = on ? 0 : -1;
        });
        var node = nodes[current];
        eco.style.setProperty('--eco-progress', (n > 1 ? (current / (n - 1)) * 100 : 0) + '%');
        if (stepEl) stepEl.textContent = pad(current) + ' / ' + pad(n - 1);
        if (titleEl) titleEl.textContent = node.querySelector('.eco-label').textContent;
        if (copyEl) copyEl.textContent = node.querySelector('.eco-node-copy').textContent;
        if (panel) panel.setAttribute('aria-labelledby', node.id);
        if (focus) node.focus();
      }

      function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }

      nodes.forEach(function (node, i) {
        node.addEventListener('click', function () { userTouched = true; stopAuto(); select(i); });
        node.addEventListener('keydown', function (e) {
          var d = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 :
                  (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 0;
          if (d) { e.preventDefault(); userTouched = true; stopAuto(); select(current + d, true); }
          if (e.key === 'Home') { e.preventDefault(); select(0, true); }
          if (e.key === 'End') { e.preventDefault(); select(n - 1, true); }
        });
      });

      eco.addEventListener('pointerenter', stopAuto);
      eco.addEventListener('focusin', stopAuto);

      select(0);

      var autoOk = !reduced && matchMedia('(min-width: 901px)').matches;
      if (autoOk && 'IntersectionObserver' in window) {
        var ecoIo = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting && !userTouched && !timer) {
              timer = setInterval(function () { select(current + 1); }, 4000);
            } else if (!e.isIntersecting) { stopAuto(); }
          });
        }, { threshold: 0.4 });
        ecoIo.observe(eco);
      }
    }


    /* ---- Plan finder (plans page signature experience) ---- */
    var finder = document.querySelector('[data-finder]');
    if (finder) {
      var frName = document.getElementById('frName');
      var frPrice = document.getElementById('frPrice');
      var frWhy = document.getElementById('frWhy');
      var frCta = document.getElementById('frCta');
      var personalQs = finder.querySelectorAll('[data-fq="personal"]');

      var PLANS = {
        Vital: {
          price: '<span class="fr-cur">$</span>20<span class="fr-per">/ month \u00b7 covers 2 people</span>',
          cta: 'Choose Vital',
          why: ['Core GP & acute medication cover', 'Full provider network access', 'Member portal & WhatsApp support']
        },
        Gold: {
          price: '<span class="fr-cur">$</span>30<span class="fr-per">/ month \u00b7 covers 2 people</span>',
          cta: 'Choose Gold',
          why: []
        },
        Diamond: {
          price: '<span class="fr-cur">$</span>50<span class="fr-per">/ month \u00b7 covers 2 people</span>',
          cta: 'Choose Diamond',
          why: ['Our highest level of cover', 'Group billing & SSB payroll deduction available', 'On-site delivery to your premises']
        }
      };

      function val(name) {
        var el = finder.querySelector('input[name="' + name + '"]:checked');
        return el ? el.value : null;
      }

      function recommend() {
        var who = val('fWho'), chronic = val('fChronic'), optical = val('fOptical');
        var company = who === 'company';
        personalQs.forEach(function (fq) {
          fq.setAttribute('data-disabled', company ? 'true' : 'false');
          fq.querySelectorAll('input').forEach(function (inp) { inp.disabled = company; });
        });

        var plan, why;
        if (company) {
          plan = 'Diamond'; why = PLANS.Diamond.why.slice();
        } else if (chronic === 'yes' || optical === 'yes' || who === 'family') {
          plan = 'Gold';
          why = [];
          if (chronic === 'yes') why.push('Chronic medication delivered nationwide');
          if (optical === 'yes') why.push('In-house optical & spectacles included');
          if (who === 'family') why.push('Cover for your dependants included');
          why.push('Dental & specialist cover');
        } else {
          plan = 'Vital'; why = PLANS.Vital.why.slice();
        }

        frName.textContent = plan;
        frPrice.innerHTML = PLANS[plan].price;
        frWhy.innerHTML = why.map(function (w) {
          return '<li><i data-lucide="check"></i>' + w + '</li>';
        }).join('');
        frCta.textContent = PLANS[plan].cta;
        frCta.setAttribute('data-quote', plan);
        document.querySelectorAll('.plan[data-plan]').forEach(function (card) {
          card.classList.toggle('suggested', card.getAttribute('data-plan') === plan);
        });
        if (window.lucide) lucide.createIcons();
      }

      finder.addEventListener('change', recommend);
      recommend();
    }


    /* ---- Member portal prototype: view switching, toggles ---- */
    var dash = document.querySelector('.dash');
    if (dash) {
      var viewBtns = Array.from(dash.querySelectorAll('[data-view-btn]'));
      var pviews = Array.from(dash.querySelectorAll('.pview'));
      function showView(name) {
        pviews.forEach(function (v) { v.hidden = v.getAttribute('data-view') !== name; });
        viewBtns.forEach(function (b) {
          var on = b.getAttribute('data-view-btn') === name;
          b.classList.toggle('on', on);
          if (on) { b.setAttribute('aria-current', 'page'); } else { b.removeAttribute('aria-current'); }
        });
        if (window.lucide) lucide.createIcons();
      }
      viewBtns.forEach(function (b) {
        b.addEventListener('click', function () { showView(b.getAttribute('data-view-btn')); });
      });
      dash.addEventListener('click', function (e) {
        var g = e.target.closest('[data-goview]');
        if (g) { e.preventDefault(); showView(g.getAttribute('data-goview')); }
      });
      dash.querySelectorAll('.switch').forEach(function (sw) {
        sw.addEventListener('click', function () {
          var on = sw.classList.toggle('on');
          sw.setAttribute('aria-checked', on ? 'true' : 'false');
        });
      });
      var protoBtn = dash.querySelector('[data-proto-note]');
      if (protoBtn) {
        protoBtn.addEventListener('click', function () {
          protoBtn.innerHTML = 'Available in the live platform';
          protoBtn.disabled = true;
        });
      }
    }

    /* ---- Member login (concept demo) ---- */
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var pass = document.getElementById('loginPass').value;
        var err = document.getElementById('loginErr');
        if (pass === 'genfin2026') {
          err.classList.remove('show');
          window.location.href = 'portal.html';
        } else {
          err.classList.add('show');
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
