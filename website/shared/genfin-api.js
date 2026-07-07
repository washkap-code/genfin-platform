/* GENFIN API layer — Supabase client, sessions, role routing.
   Requires: shared/config.js and the supabase-js CDN script loaded first. */
(function () {
  const cfg = window.GENFIN_CONFIG || {};
  const sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_PUBLISHABLE_KEY);

  const GF = {
    sb,
    money(n) { return '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); },
    dt(s) { return s ? new Date(s).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'; },
    d(s) { return s ? new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'; },
    esc(s) { const d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; },

    session() {
      try { return JSON.parse(localStorage.getItem('genfin_session') || 'null'); } catch (e) { return null; }
    },
    saveSession(s) { localStorage.setItem('genfin_session', JSON.stringify(s)); },
    clearSession() { localStorage.removeItem('genfin_session'); },

    async rpc(fn, args) {
      const { data, error } = await sb.rpc(fn, args || {});
      if (error) return { ok: false, error: error.message };
      return data;
    },

    async login(email, password) {
      const res = await GF.rpc('genfin_login', { p_email: email, p_password: password });
      if (res && res.ok) {
        GF.saveSession(res);
        GF._startHeartbeat();
      }
      return res;
    },
    async logout() {
      const s = GF.session();
      if (s && s.session) { try { await GF.rpc('genfin_logout', { p_session: s.session }); } catch (e) {} }
      GF.clearSession();
      location.href = 'login.html';
    },
    _hb: null,
    _startHeartbeat() {
      if (GF._hb) clearInterval(GF._hb);
      GF._hb = setInterval(async () => {
        const s = GF.session();
        if (s && s.session) await GF.rpc('genfin_heartbeat', { p_session: s.session });
      }, 45000);
    },

    homeFor(sess) {
      if (!sess) return 'login.html';
      if (sess.role === 'former_staff') return 'restricted-portal.html';
      if (sess.kind === 'member') return 'portal.html';
      if (sess.kind === 'admin' || sess.role === 'superadmin') return 'superadmin.html';
      const map = { hr_head: 'staff-hr.html', finance: 'staff-finance.html', pharmacy: 'staff-inventory.html', driver: 'driver-app.html', logistics: 'staff-logistics.html' };
      return map[sess.role] || 'superadmin.html';
    },

    /* Role-based access. Admin sees everything. */
    can(sess, moduleKey) {
      if (!sess) return false;
      if (sess.role === 'former_staff') return moduleKey === 'restricted';
      /* Member-context pages need a member profile — staff/admin have none to show */
      if (['portal', 'portal-pharmacy', 'member-profile', 'portal-preauth'].includes(moduleKey)) return sess.kind === 'member';
      if (sess.kind === 'admin' || sess.role === 'superadmin') return true;
      const grants = {
        member: ['portal', 'portal-pharmacy', 'member-profile', 'documents'],
        hr_head: ['staff-hr', 'staff-profile', 'dashboard'],
        finance: ['staff-finance', 'staff-profile', 'dashboard'],
        pharmacy: ['staff-inventory', 'staff-logistics', 'staff-profile', 'dashboard'],
        logistics: ['staff-logistics', 'driver-app', 'staff-profile', 'dashboard'],
        driver: ['driver-app', 'staff-profile']
      };
      const key = sess.kind === 'member' ? 'member' : (sess.role || '');
      return (grants[key] || ['staff-profile']).includes(moduleKey);
    },

    requireAuth(moduleKey) {
      const s = GF.session();
      if (!s) { location.href = 'login.html'; return null; }
      if (moduleKey && !GF.can(s, moduleKey)) { location.href = GF.homeFor(s); return null; }
      GF._startHeartbeat();
      GF.rpc('genfin_heartbeat', { p_session: s.session });
      return s;
    },

    async table(name, opts) {
      let q = sb.from(name).select(opts && opts.select || '*');
      if (opts && opts.eq) for (const [k, v] of Object.entries(opts.eq)) q = q.eq(k, v);
      if (opts && opts.order) q = q.order(opts.order, { ascending: opts.asc === true });
      if (opts && opts.limit) q = q.limit(opts.limit);
      const { data, error } = await q;
      if (error) { console.error(name, error); return []; }
      return data || [];
    },

    chip(text, kind) {
      const cls = { green: 's-chip-green', red: 's-chip-red', gold: 's-chip-gold', blue: 's-chip-blue', gray: 's-chip-gray' }[kind] || 's-chip-gray';
      return '<span class="s-chip ' + cls + '">' + GF.esc(text) + '</span>';
    },
    statusChip(st) {
      const m = {
        active: 'green', available: 'green', approved: 'green', paid: 'green', delivered: 'green',
        paid_scheduled: 'blue', out_for_delivery: 'blue', driver_booked: 'blue', invoiced: 'gold',
        booked: 'gold', unpaid: 'gold', pending: 'gold', on_delivery: 'blue',
        rejected: 'red', terminated: 'red', off_duty: 'gray', placed: 'gray'
      };
      return GF.chip(String(st || '').replace(/_/g, ' '), m[st] || 'gray');
    }
  };

  window.GF = GF;
})();
