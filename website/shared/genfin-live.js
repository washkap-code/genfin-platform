/* GENFIN live application engine.
   Each live page declares <body data-gf-page="..."> and includes an empty #gfApp mount.
   This engine enforces role access, renders the shell, and wires every module to Supabase. */
(function () {
  const GT = window.GT || (k => k);
  const PAGE = document.body.getAttribute('data-gf-page');
  const $ = (sel) => document.querySelector(sel);

  const NAV = [
    { key: 'dashboard', href: 'superadmin.html', label: GT('nav.dashboard'), icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>' },
    { key: 'staff-hr', href: 'staff-hr.html', label: GT('nav.hr'), icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' },
    { key: 'staff-finance', href: 'staff-finance.html', label: GT('nav.accounts'), icon: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>' },
    { key: 'staff-inventory', href: 'staff-inventory.html', label: GT('nav.inventory'), icon: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>' },
    { key: 'staff-logistics', href: 'staff-logistics.html', label: GT('nav.logistics'), icon: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>' },
    { key: 'driver-app', href: 'driver-app.html', label: GT('nav.driver'), icon: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>' },
    { key: 'staff-profile', href: 'staff-profile.html', label: GT('nav.profile'), icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>' },
    { key: 'guides', href: 'guides.html', label: GT('nav.guides'), icon: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>' }
  ];

  function staffShell(sess, title, active) {
    const items = NAV.filter(n => GF.can(sess, n.key)).map(n =>
      '<a href="' + n.href + '" class="s-nav-item' + (n.key === active ? ' active' : '') + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' + n.icon + '</svg>' + n.label + '</a>').join('');
    const initials = (sess.name || '??').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return '<div class="s-layout">' +
      '<aside class="s-sidebar">' +
      '<div class="s-sidebar-logo"><a href="' + GF.homeFor(sess) + '" style="display:block"><img class="s-logo-img" src="assets/genfin-logo.png" alt="GENFIN" width="158"></a></div>' +
      '<div class="s-nav-section">Navigation</div>' + items +
      '<div class="s-sidebar-foot"><div class="s-foot-av">' + initials + '</div>' +
      '<div><div class="s-foot-name">' + GF.esc(sess.name) + '</div><div class="s-foot-role">' + GF.esc((sess.role || sess.kind || '').replace(/_/g, ' ')) + '</div></div></div>' +
      '</aside>' +
      '<main class="s-main"><div class="s-topbar"><div class="s-topbar-title">' + GF.esc(title) + '</div>' +
      '<div class="s-topbar-actions"><span class="s-chip s-chip-green">' + GT('common.live') + '</span>' +
      '<button class="s-btn s-btn-ghost" id="gfLogout">' + GT('auth.signout') + '</button></div></div>' +
      '<div class="s-body" id="gfBody"></div></main></div>';
  }

  function portalShell(sess, title) {
    return '<div class="portal-topbar"><div class="portal-topbar-inner">' +
      '<a href="portal.html" class="portal-topbar-logo" style="text-decoration:none"><img src="assets/genfin-logo.png" alt="GENFIN" style="height:30px;width:auto;display:block"></a>' +
      '<div class="portal-topbar-user" style="display:flex;align-items:center;gap:12px">' +
      '<span>' + GF.esc(sess.name) + ' · ' + GF.esc(sess.profile && sess.profile.member_no || '') + '</span>' +
      '<button class="s-btn s-btn-ghost" id="gfLogout" style="padding:5px 12px;font-size:12px;cursor:pointer">' + GT('auth.signout') + '</button></div></div></div>' +
      '<div style="max-width:1080px;margin:0 auto;padding:28px 20px" id="gfBody">' +
      '<h1 class="portal-page-title">' + GF.esc(title) + '</h1></div>';
  }

  function wireLogout() { const b = $('#gfLogout'); if (b) b.onclick = () => GF.logout(); }

  function kpi(label, val, sub) {
    return '<div class="s-kpi"><div class="s-kpi-label">' + label + '</div><div class="s-kpi-val">' + val + '</div>' + (sub ? '<div class="s-kpi-sub">' + sub + '</div>' : '') + '</div>';
  }
  function card(title, bodyHtml, headExtra) {
    return '<div class="s-card" style="margin-bottom:1.25rem"><div class="s-card-head"><span>' + title + '</span>' + (headExtra || '') + '</div><div class="s-card-body">' + bodyHtml + '</div></div>';
  }
  function tbl(headers, rows) {
    if (!rows.length) return '<p style="color:var(--s-muted);font-size:0.85rem;padding:0.5rem 0">Nothing here yet.</p>';
    return '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:0.83rem">' +
      '<tr>' + headers.map(h => '<th style="text-align:left;padding:8px 10px;color:var(--s-muted);font-size:0.7rem;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid var(--s-border)">' + h + '</th>').join('') + '</tr>' +
      rows.map(r => '<tr>' + r.map(c => '<td style="padding:9px 10px;border-bottom:1px solid var(--s-border);vertical-align:top">' + c + '</td>').join('') + '</tr>').join('') + '</table></div>';
  }

  /* ============ LOGIN ============ */
  async function pageLogin() {
    const existing = GF.session();
    if (existing) { location.href = GF.homeFor(existing); return; }
    const portal = new URLSearchParams(location.search).get('portal') || '';
    const PORTALS = {
      member:   { title: 'Member sign in', sub: 'Your benefits, orders and documents', demos: ['member@genfin.demo'] },
      admin:    { title: 'Administrator sign in', sub: 'GENFIN enterprise administration — authorised personnel only', demos: ['admin@genfin.demo'] },
      hr:       { title: 'HR sign in', sub: 'Human resources & payroll', demos: ['hr@genfin.demo'] },
      finance:  { title: 'Finance sign in', sub: 'Accounts & general ledger', demos: ['finance@genfin.demo', 'clerk@genfin.demo'] },
      pharmacy: { title: 'Pharmacy sign in', sub: 'Inventory & logistics', demos: ['pharmacy@genfin.demo'] }
    };
    const cfg = PORTALS[portal] || { title: GT('auth.title'), sub: GT('auth.sub'),
      demos: ['member@genfin.demo', 'admin@genfin.demo', 'hr@genfin.demo', 'finance@genfin.demo', 'clerk@genfin.demo', 'pharmacy@genfin.demo'] };
    /* Discreet admin entry from the member/default login, per spec */
    const adminLink = portal === 'admin' ? '' :
      '<p style="text-align:center;margin-top:0.75rem"><a href="login.html?portal=admin" style="font-size:0.68rem;color:var(--s-muted);text-decoration:none;opacity:0.7">Admin login</a></p>';
    $('#gfApp').innerHTML =
      '<div class="s-login-page"><div class="s-login-card">' +
      '<div class="s-login-logo"><img src="assets/genfin-logo.png" alt="GENFIN" width="180"></div>' +
      '<div class="s-login-title">' + cfg.title + '</div>' +
      '<div class="s-login-sub">' + cfg.sub + '</div>' +
      '<div class="s-form-group"><label class="s-label">' + GT('auth.email') + '</label><input class="s-input" id="lgEmail" type="email" placeholder="you@example.com"></div>' +
      '<div class="s-form-group"><label class="s-label">' + GT('auth.password') + '</label><input class="s-input" id="lgPass" type="password" placeholder="••••••••"></div>' +
      '<div id="lgErr" style="color:#B93636;font-size:0.8rem;margin-bottom:0.75rem;display:none"></div>' +
      '<button class="s-btn s-btn-primary s-btn-lg" id="lgBtn" style="width:100%">' + GT('auth.signin') + '</button>' +
      (portal === 'admin' ? '' : '<p style="font-size:0.78rem;color:var(--s-muted);margin-top:1rem;text-align:center">New staff member? <a href="staff-signup.html" style="color:var(--s-ink);font-weight:700">Create your staff account</a> · <a href="login-select.html" style="color:var(--s-ink);font-weight:700">All portals</a></p>') +
      '<div style="margin-top:1.25rem;border-top:1px solid var(--s-border);padding-top:1rem">' +
      '<div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--s-muted);margin-bottom:0.5rem">Demo account' + (cfg.demos.length > 1 ? 's' : '') + ' (password: demo2026)</div>' +
      cfg.demos.map(e =>
        '<button class="s-btn s-btn-ghost s-btn-sm gf-demo" data-e="' + e + '" style="margin:2px">' + e + '</button>').join('') +
      '</div>' + adminLink + '</div></div>';
    async function doLogin(email, pass) {
      $('#lgErr').style.display = 'none';
      $('#lgBtn').textContent = 'Signing in…';
      const res = await GF.login(email, pass);
      if (res && res.ok) { location.href = GF.homeFor(res); }
      else { $('#lgBtn').textContent = 'Sign in'; $('#lgErr').textContent = (res && res.error) || 'Login failed'; $('#lgErr').style.display = 'block'; }
    }
    $('#lgBtn').onclick = () => doLogin($('#lgEmail').value.trim(), $('#lgPass').value);
    $('#lgPass').addEventListener('keydown', e => { if (e.key === 'Enter') $('#lgBtn').click(); });
    document.querySelectorAll('.gf-demo').forEach(b => b.onclick = () => { $('#lgEmail').value = b.dataset.e; $('#lgPass').value = 'demo2026'; doLogin(b.dataset.e, 'demo2026'); });
  }

  /* ============ STAFF SIGNUP ============ */
  async function pageSignup() {
    $('#gfApp').innerHTML =
      '<div class="s-login-page"><div class="s-login-card" style="max-width:560px">' +
      '<div class="s-login-logo"><img src="assets/genfin-logo.png" alt="GENFIN" width="160"></div>' +
      '<div class="s-login-title">Staff account application</div>' +
      '<div class="s-login-sub">Enter your personal details. Your account is activated once the Head of HR approves it and assigns your role.</div>' +
      '<div class="s-form-row"><div class="s-form-group"><label class="s-label">Full name *</label><input class="s-input" id="sgName"></div>' +
      '<div class="s-form-group"><label class="s-label">Email *</label><input class="s-input" id="sgEmail" type="email"></div></div>' +
      '<div class="s-form-row"><div class="s-form-group"><label class="s-label">Phone</label><input class="s-input" id="sgPhone"></div>' +
      '<div class="s-form-group"><label class="s-label">National ID</label><input class="s-input" id="sgNid" placeholder="63-0000000 X00"></div></div>' +
      '<div class="s-form-row"><div class="s-form-group"><label class="s-label">Date of birth</label><input class="s-input" id="sgDob" type="date"></div>' +
      '<div class="s-form-group"><label class="s-label">Proposed employment date</label><input class="s-input" id="sgEmp" type="date"></div></div>' +
      '<div class="s-form-group"><label class="s-label">Home address</label><input class="s-input" id="sgAddr"></div>' +
      '<div class="s-form-row"><div class="s-form-group"><label class="s-label">Position applied for *</label><input class="s-input" id="sgPos" placeholder="e.g. Claims Assessor"></div>' +
      '<div class="s-form-group"><label class="s-label">Choose a password *</label><input class="s-input" id="sgPass" type="password"></div></div>' +
      '<div id="sgErr" style="color:#B93636;font-size:0.8rem;margin-bottom:0.75rem;display:none"></div>' +
      '<div id="sgOk" style="display:none"></div>' +
      '<button class="s-btn s-btn-primary s-btn-lg" id="sgBtn" style="width:100%">Submit application</button>' +
      '<p style="font-size:0.78rem;color:var(--s-muted);margin-top:1rem;text-align:center"><a href="login.html" style="color:var(--s-ink);font-weight:700">← Back to sign in</a></p>' +
      '</div></div>';
    $('#sgBtn').onclick = async () => {
      const p = {
        full_name: $('#sgName').value.trim(), email: $('#sgEmail').value.trim(), phone: $('#sgPhone').value.trim(),
        national_id: $('#sgNid').value.trim(), dob: $('#sgDob').value, employment_date: $('#sgEmp').value,
        address: $('#sgAddr').value.trim(), position: $('#sgPos').value.trim(), password: $('#sgPass').value
      };
      if (!p.full_name || !p.email || !p.position || !p.password) {
        $('#sgErr').textContent = 'Name, email, position and password are required.'; $('#sgErr').style.display = 'block'; return;
      }
      $('#sgBtn').textContent = 'Submitting…';
      const res = await GF.rpc('genfin_staff_signup', { p: p });
      if (res && res.ok) {
        $('#sgOk').style.display = 'block';
        $('#sgOk').innerHTML = '<div class="s-alert s-alert-success" style="margin-bottom:0.75rem"><strong>Application received (' + GF.esc(res.staff_no) + ').</strong> The Head of HR will review it; you can sign in once approved.</div>';
        $('#sgBtn').style.display = 'none'; $('#sgErr').style.display = 'none';
      } else {
        $('#sgBtn').textContent = 'Submit application';
        $('#sgErr').textContent = (res && res.error) || 'Something went wrong'; $('#sgErr').style.display = 'block';
      }
    };
  }

  /* ============ SUPERADMIN DASHBOARD ============ */
  async function pageDashboard(sess) {
    $('#gfApp').innerHTML = staffShell(sess, 'Enterprise dashboard', 'dashboard'); wireLogout();
    async function render() {
      const [accts, invoices, inv, sessions, activity, members, orders, preauths] = await Promise.all([
        GF.table('genfin_gl_accounts'),
        GF.table('genfin_invoices', { eq: { status: 'unpaid' } }),
        GF.table('genfin_inventory'),
        GF.table('genfin_sessions', { eq: { active: true }, order: 'last_seen' }),
        GF.table('genfin_activity', { order: 'created_at', limit: 25 }),
        GF.table('genfin_members'),
        GF.table('genfin_orders', { order: 'created_at', limit: 8 }),
        GF.table('genfin_preauths', { eq: { status: 'pending' }, order: 'created_at' })
      ]);
      const memName = {}; members.forEach(mm => memName[mm.id] = mm.full_name);
      const cash = accts.find(a => a.code === '1000');
      const low = inv.filter(i => i.qty_on_hand <= i.reorder_level);
      const cutoff = Date.now() - 2 * 60 * 1000;
      const online = sessions.filter(s => new Date(s.last_seen).getTime() > cutoff);
      $('#gfBody').innerHTML =
        '<div class="s-kpi-grid">' +
        kpi('Cash at bank', GF.money(cash && cash.balance), 'General ledger 1000') +
        kpi('Unpaid invoices', invoices.length, GF.money(invoices.reduce((t, i) => t + Number(i.amount), 0)) + ' outstanding') +
        kpi('Stock alerts', low.length, low.length ? low.map(i => i.sku).slice(0, 2).join(', ') : 'All healthy') +
        kpi('Staff online now', online.filter(s => s.kind !== 'member').length, online.length + ' total sessions') +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1.4fr 1fr;gap:1.25rem;align-items:start">' +
        '<div>' + card('Realtime activity <span style="font-weight:400;color:var(--s-muted);font-size:0.72rem">(auto-refreshes)</span>',
          activity.map(a => '<div style="display:flex;gap:10px;padding:7px 0;border-bottom:1px solid var(--s-border);font-size:0.82rem">' +
            '<span style="min-width:82px">' + GF.chip(a.module, { hr: 'gold', finance: 'green', inventory: 'blue', logistics: 'blue', orders: 'gold', auth: 'gray', members: 'green', platform: 'gray' }[a.module] || 'gray') + '</span>' +
            '<span style="flex:1"><strong>' + GF.esc(a.actor) + '</strong> · ' + GF.esc(a.detail) + '</span>' +
            '<span style="color:var(--s-muted);font-size:0.72rem;white-space:nowrap">' + GF.dt(a.created_at) + '</span></div>').join('')) + '</div>' +
        '<div>' +
        card('Pre-authorisations awaiting decision', preauths.length ? preauths.map(p =>
          '<div style="padding:9px 0;border-bottom:1px solid var(--s-border)">' +
          '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:0.83rem"><strong>' + GF.esc(p.ref) + '</strong>' +
          '<span>' + GF.esc(memName[p.member_id] || '') + '</span><span style="color:var(--s-muted);font-size:0.72rem;margin-left:auto">' + GF.dt(p.created_at) + '</span></div>' +
          '<div style="font-size:0.78rem;color:var(--s-muted);margin:3px 0">' + GF.esc(p.procedure_desc) + ' · est. ' + GF.money(p.estimated_cost) + (p.provider ? ' · ' + GF.esc(p.provider) : '') + '</div>' +
          '<div style="display:flex;gap:6px"><button class="s-btn s-btn-success s-btn-sm gf-pa-yes" data-id="' + p.id + '">Approve</button>' +
          '<button class="s-btn s-btn-danger s-btn-sm gf-pa-no" data-id="' + p.id + '">Decline</button></div></div>').join('')
          : '<p style="color:var(--s-muted);font-size:0.85rem">Queue clear.</p>') +
        card('Who is logged in', tbl(['Name', 'Role', 'Last seen', 'Status'], sessions.slice(0, 12).map(s => {
          const on = new Date(s.last_seen).getTime() > cutoff;
          return [GF.esc(s.display_name), GF.esc((s.role || s.kind || '').replace(/_/g, ' ')), GF.dt(s.last_seen), on ? GF.chip('● online', 'green') : GF.chip('idle', 'gray')];
        }))) +
        card('Recent orders', tbl(['Order', 'Status', 'Total'], orders.map(o => [GF.esc(o.order_no), GF.statusChip(o.status), GF.money(o.total)]))) +
        card('Members', tbl(['Member', 'Plan', 'Benefit used'], members.map(m => [GF.esc(m.full_name) + '<br><span style="color:var(--s-muted);font-size:0.72rem">' + GF.esc(m.member_no) + '</span>', GF.esc(m.plan), GF.money(m.used_benefit) + ' / ' + GF.money(m.annual_limit)]))) +
        '</div></div>';
      wirePreauthButtons(sess, render);
    }
    await render();
    setInterval(render, 6000);
  }

  /* ============ INVENTORY ============ */
  async function pageInventory(sess) {
    $('#gfApp').innerHTML = staffShell(sess, 'Inventory management', 'staff-inventory'); wireLogout();
    async function render() {
      const [items, moves] = await Promise.all([
        GF.table('genfin_inventory', { order: 'sku', asc: true }),
        GF.table('genfin_stock_movements', { order: 'created_at', limit: 15 })
      ]);
      const byId = {}; items.forEach(i => byId[i.id] = i);
      const val = items.reduce((t, i) => t + i.qty_on_hand * Number(i.unit_cost), 0);
      const low = items.filter(i => i.qty_on_hand <= i.reorder_level);
      $('#gfBody').innerHTML =
        '<div class="s-kpi-grid">' +
        kpi('Total SKUs', items.length, 'Pharmacy & optical') +
        kpi('Stock value (cost)', GF.money(val), 'Matches GL account 1200') +
        kpi('Low stock', low.length, low.map(i => i.sku).slice(0, 3).join(', ') || 'None') +
        '</div>' +
        card('Stock on hand', tbl(['SKU', 'Item', 'Category', 'On hand', 'Reorder at', 'Unit price', 'Status'],
          items.map(i => [GF.esc(i.sku), GF.esc(i.name), GF.chip(i.category, i.category === 'pharmacy' ? 'blue' : 'gold'),
            '<strong>' + i.qty_on_hand + '</strong>', i.reorder_level, GF.money(i.unit_price),
            i.qty_on_hand <= i.reorder_level ? GF.chip('Reorder', 'red') : GF.chip('OK', 'green')]))) +
        card('Recent stock movements <span style="font-weight:400;color:var(--s-muted);font-size:0.72rem">(sales deduct automatically on payment)</span>',
          tbl(['When', 'Item', 'Change', 'Reason', 'Ref'], moves.map(m => [GF.dt(m.created_at),
            GF.esc(byId[m.item_id] ? byId[m.item_id].name : m.item_id), (m.delta > 0 ? '+' : '') + m.delta,
            GF.esc(m.reason), GF.esc(m.ref)])));
    }
    await render();
    setInterval(render, 8000);
  }

  /* ============ FINANCE ============ */
  async function pageFinance(sess) {
    $('#gfApp').innerHTML = staffShell(sess, 'Accounts & general ledger', 'staff-finance'); wireLogout();
    let view = { mode: 'overview', account: null };
    let jLines = [{ account: '', debit: '', credit: '' }, { account: '', debit: '', credit: '' }];
    let jMemo = '', jRef = '', showEntry = false;
    /* Quick templates: one manual action posts every related line automatically */
    const TEMPLATES = [
      { name: 'Premium received (cash)', memo: 'Member premium received', lines: (amt) => [{ account: '1000', debit: amt }, { account: '4300', credit: amt }] },
      { name: 'Supplier expense paid from bank', memo: 'Supplier expense', lines: (amt) => [{ account: '6200', debit: amt }, { account: '1000', credit: amt }] },
      { name: 'Rent / utilities paid', memo: 'Rent & utilities', lines: (amt) => [{ account: '6100', debit: amt }, { account: '1000', credit: amt }] },
      { name: 'Bank charges', memo: 'Bank charges', lines: (amt) => [{ account: '6300', debit: amt }, { account: '1000', credit: amt }] },
      { name: 'Expense on credit (payable)', memo: 'Expense incurred on credit', lines: (amt) => [{ account: '6200', debit: amt }, { account: '2000', credit: amt }] },
      { name: 'Pay a supplier (settle payable)', memo: 'Supplier payment', lines: (amt) => [{ account: '2000', debit: amt }, { account: '1000', credit: amt }] },
      { name: 'Capital injection', memo: 'Capital introduced', lines: (amt) => [{ account: '1000', debit: amt }, { account: '3000', credit: amt }] }
    ];
    async function render() {
      const [accts, invoices, payments, entries, lines] = await Promise.all([
        GF.table('genfin_gl_accounts', { order: 'code', asc: true }),
        GF.table('genfin_invoices', { order: 'issued_at', limit: 12 }),
        GF.table('genfin_payments', { order: 'received_at', limit: 8 }),
        GF.table('genfin_gl_entries', { order: 'created_at', limit: 12 }),
        GF.table('genfin_gl_lines', { limit: 400 })
      ]);
      const drTotal = accts.filter(a => ['asset', 'expense'].includes(a.type)).reduce((t, a) => t + Number(a.balance), 0);
      const crTotal = accts.filter(a => !['asset', 'expense'].includes(a.type)).reduce((t, a) => t + Number(a.balance), 0);
      const balanced = Math.abs(drTotal - crTotal) < 0.01;
      const linesByEntry = {}; lines.forEach(l => { (linesByEntry[l.entry_id] = linesByEntry[l.entry_id] || []).push(l); });
      const acctName = {}; accts.forEach(a => acctName[a.code] = a.name);
      const acctOpts = (sel) => '<option value="">Account…</option>' + accts.map(a => '<option value="' + a.code + '"' + (sel === a.code ? ' selected' : '') + '>' + a.code + ' — ' + GF.esc(a.name) + '</option>').join('');

      /* ---- Account drill-down ---- */
      let acctDetail = '';
      if (view.mode === 'account') {
        const a = accts.find(x => x.code === view.account);
        const entryById = {}; entries.forEach(e => entryById[e.id] = e);
        const allEntries = await GF.table('genfin_gl_entries', { order: 'created_at', asc: true, limit: 200 });
        allEntries.forEach(e => entryById[e.id] = e);
        const myLines = lines.filter(l => l.account_code === view.account)
          .map(l => ({ ...l, e: entryById[l.entry_id] || {} }))
          .sort((x, y) => new Date(x.e.created_at || 0) - new Date(y.e.created_at || 0));
        let run = 0;
        const rows = myLines.map(l => {
          const dr = Number(l.debit), cr = Number(l.credit);
          run += (['asset', 'expense'].includes(a.type) ? dr - cr : cr - dr);
          return ['#' + (l.e.entry_no || '—') + '<br><span style="color:var(--s-muted);font-size:0.7rem">' + GF.dt(l.e.created_at) + '</span>',
            GF.esc(l.e.memo || '') + '<br><span style="color:var(--s-muted);font-size:0.7rem">' + GF.esc(l.e.ref || '') + '</span>',
            GF.esc(l.e.posted_by || 'System'),
            dr > 0 ? GF.money(dr) : '', cr > 0 ? GF.money(cr) : '', '<strong>' + GF.money(run) + '</strong>'];
        }).reverse();
        acctDetail = card('Account ' + a.code + ' — ' + GF.esc(a.name) + ' ' + GF.chip(a.type, { asset: 'blue', liability: 'red', equity: 'gold', income: 'green', expense: 'gray' }[a.type]),
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px">' +
          '<div style="font-size:1.25rem;font-weight:800">Balance: ' + GF.money(a.balance) + '</div>' +
          '<div style="display:flex;gap:8px"><button class="s-btn s-btn-primary s-btn-sm" id="gfEntryFor">+ New entry to this account</button>' +
          '<button class="s-btn s-btn-ghost s-btn-sm" id="gfBackAccts">← All accounts</button></div></div>' +
          tbl(['Entry', 'Memo / ref', 'Posted by', 'Debit', 'Credit', 'Running balance'], rows));
      }

      /* ---- Manual journal entry form ---- */
      const dTot = jLines.reduce((t, l) => t + (parseFloat(l.debit) || 0), 0);
      const cTot = jLines.reduce((t, l) => t + (parseFloat(l.credit) || 0), 0);
      const jBal = Math.abs(dTot - cTot) < 0.005 && dTot > 0;
      const entryForm = !showEntry ? '' : card('New journal entry <span style="font-weight:400;color:var(--s-muted);font-size:0.72rem">— posted under your name: ' + GF.esc(sess.name) + '</span>',
        '<div class="s-form-row"><div class="s-form-group"><label class="s-label">Quick template (fills all related lines)</label>' +
        '<select class="s-input" id="jTpl"><option value="">Blank entry…</option>' + TEMPLATES.map((t, i) => '<option value="' + i + '">' + t.name + '</option>').join('') + '</select></div>' +
        '<div class="s-form-group"><label class="s-label">Amount for template</label><input class="s-input" id="jTplAmt" type="number" min="0.01" step="0.01" placeholder="100.00"></div></div>' +
        '<div class="s-form-row"><div class="s-form-group"><label class="s-label">Memo *</label><input class="s-input" id="jMemo" value="' + GF.esc(jMemo) + '" placeholder="What is this entry for?"></div>' +
        '<div class="s-form-group"><label class="s-label">Reference</label><input class="s-input" id="jRef" value="' + GF.esc(jRef) + '" placeholder="e.g. RENT-JUL26 (optional)"></div></div>' +
        '<table style="width:100%;border-collapse:collapse;font-size:0.83rem;margin:6px 0">' +
        '<tr><th style="text-align:left;padding:4px;color:var(--s-muted);font-size:0.7rem;text-transform:uppercase">Account</th><th style="text-align:right;padding:4px;color:var(--s-muted);font-size:0.7rem;text-transform:uppercase">Debit</th><th style="text-align:right;padding:4px;color:var(--s-muted);font-size:0.7rem;text-transform:uppercase">Credit</th><th></th></tr>' +
        jLines.map((l, i) =>
          '<tr><td style="padding:3px"><select class="s-input jl-acct" data-i="' + i + '">' + acctOpts(l.account) + '</select></td>' +
          '<td style="padding:3px;width:110px"><input class="s-input jl-dr" data-i="' + i + '" type="number" min="0" step="0.01" value="' + (l.debit || '') + '" style="text-align:right"></td>' +
          '<td style="padding:3px;width:110px"><input class="s-input jl-cr" data-i="' + i + '" type="number" min="0" step="0.01" value="' + (l.credit || '') + '" style="text-align:right"></td>' +
          '<td style="padding:3px;width:30px">' + (jLines.length > 2 ? '<button class="s-btn s-btn-ghost s-btn-sm jl-del" data-i="' + i + '">×</button>' : '') + '</td></tr>').join('') +
        '</table>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">' +
        '<button class="s-btn s-btn-ghost s-btn-sm" id="jAdd">+ Add line</button>' +
        '<div style="font-size:0.8rem;font-weight:700;color:' + (jBal ? '#178247' : '#B93636') + '">DR ' + GF.money(dTot) + ' / CR ' + GF.money(cTot) + (jBal ? ' — balanced ✓' : ' — must balance') + '</div>' +
        '<div style="display:flex;gap:8px"><button class="s-btn s-btn-ghost s-btn-sm" id="jCancel">Cancel</button>' +
        '<button class="s-btn s-btn-primary" id="jPost"' + (jBal ? '' : ' disabled') + '>Post entry</button></div></div>' +
        '<div id="jErr" style="color:#B93636;font-size:0.8rem;margin-top:6px"></div>');

      $('#gfBody').innerHTML =
        '<div class="s-kpi-grid">' +
        kpi('Cash at bank', GF.money((accts.find(a => a.code === '1000') || {}).balance)) +
        kpi('Accounts receivable', GF.money((accts.find(a => a.code === '1100') || {}).balance)) +
        kpi('Inventory (GL)', GF.money((accts.find(a => a.code === '1200') || {}).balance)) +
        kpi('Trial balance', balanced ? '<span style="color:#178247">Balanced ✓</span>' : '<span style="color:#B93636">Out!</span>', GF.money(drTotal) + ' DR = ' + GF.money(crTotal) + ' CR') +
        '</div>' +
        '<div style="margin-bottom:1rem;display:flex;gap:8px;flex-wrap:wrap">' +
        '<button class="s-btn s-btn-primary" id="gfNewEntry">+ New journal entry</button>' +
        '<button class="s-btn s-btn-ghost" id="gfAddAcct">+ Add ledger account</button></div>' +
        entryForm + acctDetail +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;align-items:start"><div>' +
        card('Chart of accounts <span style="font-weight:400;color:var(--s-muted);font-size:0.72rem">(click an account to open its ledger)</span>',
          tbl(['Code', 'Account', 'Type', 'Balance'],
          accts.map(a => ['<a href="#" class="gf-acct" data-code="' + a.code + '" style="color:var(--s-info);font-weight:800;text-decoration:none">' + a.code + '</a>',
            '<a href="#" class="gf-acct" data-code="' + a.code + '" style="color:inherit;text-decoration:none">' + GF.esc(a.name) + '</a>',
            GF.chip(a.type, { asset: 'blue', liability: 'red', equity: 'gold', income: 'green', expense: 'gray' }[a.type]), '<strong>' + GF.money(a.balance) + '</strong>']))) +
        card('Journal (latest entries)', entries.map(e =>
          '<div style="padding:8px 0;border-bottom:1px solid var(--s-border)"><div style="font-size:0.82rem"><strong>#' + e.entry_no + '</strong> ' + GF.esc(e.memo) +
          ' ' + GF.chip(e.source === 'manual' ? 'manual' : 'auto', e.source === 'manual' ? 'gold' : 'gray') +
          '<span style="color:var(--s-muted);font-size:0.72rem"> · by ' + GF.esc(e.posted_by || 'System') + ' · ' + GF.dt(e.created_at) + '</span></div>' +
          (linesByEntry[e.id] || []).map(l => '<div style="font-size:0.76rem;color:var(--s-muted);padding-left:14px">' + l.account_code + ' ' + GF.esc(acctName[l.account_code] || '') + ' — ' + (Number(l.debit) > 0 ? 'DR ' + GF.money(l.debit) : 'CR ' + GF.money(l.credit)) + '</div>').join('') + '</div>').join('')) +
        '</div><div>' +
        card('Invoices', tbl(['Invoice', 'Amount', 'Status', ''], invoices.map(i => [GF.esc(i.invoice_no) + '<br><span style="color:var(--s-muted);font-size:0.72rem">' + GF.dt(i.issued_at) + '</span>', GF.money(i.amount), GF.statusChip(i.status),
          i.status === 'unpaid' ? '<button class="s-btn s-btn-primary s-btn-sm gf-pay" data-id="' + i.id + '">Record payment</button>' : (i.paid_at ? '<span style="font-size:0.72rem;color:var(--s-muted)">paid ' + GF.dt(i.paid_at) + '</span>' : '')]))) +
        card('Payments received', tbl(['Ref', 'Amount', 'Method', 'When'], payments.map(p => [GF.esc(p.reference), GF.money(p.amount), GF.esc(p.method), GF.dt(p.received_at)]))) +
        '</div></div>';

      /* wiring */
      document.querySelectorAll('.gf-acct').forEach(el => el.onclick = (ev) => { ev.preventDefault(); view = { mode: 'account', account: el.dataset.code }; render(); });
      const back = $('#gfBackAccts'); if (back) back.onclick = () => { view = { mode: 'overview', account: null }; render(); };
      const efor = $('#gfEntryFor'); if (efor) efor.onclick = () => { showEntry = true; jLines = [{ account: view.account, debit: '', credit: '' }, { account: '', debit: '', credit: '' }]; render(); };
      $('#gfNewEntry').onclick = () => { showEntry = !showEntry; render(); };
      $('#gfAddAcct').onclick = async () => {
        const code = prompt('New account code (e.g. 6400):'); if (!code) return;
        const name = prompt('Account name:'); if (!name) return;
        const type = prompt('Type — asset, liability, equity, income or expense:', 'expense'); if (!type) return;
        const res = await GF.rpc('genfin_add_account', { p_actor: sess.name, p_code: code.trim(), p_name: name.trim(), p_type: type.trim().toLowerCase() });
        if (!(res && res.ok)) alert((res && res.error) || 'Failed');
        render();
      };
      if (showEntry) {
        const keep = () => {
          jMemo = $('#jMemo').value; jRef = $('#jRef').value;
          document.querySelectorAll('.jl-acct').forEach(s => jLines[s.dataset.i].account = s.value);
          document.querySelectorAll('.jl-dr').forEach(s => jLines[s.dataset.i].debit = s.value);
          document.querySelectorAll('.jl-cr').forEach(s => jLines[s.dataset.i].credit = s.value);
        };
        $('#jTpl').onchange = () => {
          const t = TEMPLATES[$('#jTpl').value];
          if (!t) return;
          const amt = parseFloat($('#jTplAmt').value) || 0;
          if (!(amt > 0)) { $('#jErr').textContent = 'Enter the template amount first — then pick the template and every related line is filled for you.'; $('#jTpl').value = ''; return; }
          jMemo = t.memo; jRef = '';
          jLines = t.lines(amt).map(l => ({ account: l.account, debit: l.debit || '', credit: l.credit || '' }));
          render();
        };
        document.querySelectorAll('.jl-dr, .jl-cr, .jl-acct').forEach(el => el.onchange = () => { keep(); render(); });
        $('#jAdd').onclick = () => { keep(); jLines.push({ account: '', debit: '', credit: '' }); render(); };
        document.querySelectorAll('.jl-del').forEach(b => b.onclick = () => { keep(); jLines.splice(b.dataset.i, 1); render(); });
        $('#jCancel').onclick = () => { showEntry = false; jMemo = ''; jRef = ''; jLines = [{ account: '', debit: '', credit: '' }, { account: '', debit: '', credit: '' }]; render(); };
        $('#jPost').onclick = async () => {
          keep();
          const payload = jLines.filter(l => l.account && ((parseFloat(l.debit) || 0) > 0 || (parseFloat(l.credit) || 0) > 0))
            .map(l => ({ account: l.account, debit: parseFloat(l.debit) || 0, credit: parseFloat(l.credit) || 0 }));
          $('#jPost').textContent = 'Posting…';
          const res = await GF.rpc('genfin_manual_entry', { p_actor: sess.name, p_memo: jMemo, p_ref: jRef, p_lines: payload });
          if (res && res.ok) { showEntry = false; jMemo = ''; jRef = ''; jLines = [{ account: '', debit: '', credit: '' }, { account: '', debit: '', credit: '' }]; render(); }
          else { $('#jErr').textContent = (res && res.error) || 'Failed to post'; $('#jPost').textContent = 'Post entry'; }
        };
      }
      document.querySelectorAll('.gf-pay').forEach(b => b.onclick = async () => {
        b.textContent = 'Posting…';
        const res = await GF.rpc('genfin_record_payment', { p_invoice: b.dataset.id, p_method: 'Bank transfer' });
        if (!(res && res.ok)) alert((res && res.error) || 'Failed');
        render();
      });
    }
    await render();
  }

  /* ============ HR — enterprise module ============ */
  async function pageHR(sess) {
    $('#gfApp').innerHTML = staffShell(sess, 'HR & payroll', 'staff-hr'); wireLogout();
    let hrView = { mode: 'roster', staffId: null };
    let showAdd = false, invite = null, docEdit = null, conductId = null;
    const TERM_REASONS = [
      'Retrenchment (redundancy) — s12C Labour Act, with works council/retrenchment board process',
      'Mutual separation agreement — signed by both parties',
      'Expiry of fixed-term contract — non-renewal',
      'Resignation — employee initiated, notice served',
      'Retirement — per contract/pension rules',
      'Dismissal for misconduct — after disciplinary hearing per registered Code of Conduct',
      'Termination on medical incapacity — after due process and medical evidence',
      'Termination for poor performance — after documented performance procedure'
    ];
    const ROLES = ['hr_head|Head of HR', 'finance|Finance', 'accounts_clerk|Accounts clerk', 'pharmacy|Pharmacy & Optical', 'logistics|Logistics', 'driver|Driver', 'claims|Claims', 'superadmin|Super admin'];
    const ETYPES = ['permanent', 'fixed-term contract', 'temporary', 'part-time', 'internship'];

    async function render() {
      const [staff, log, slips, apprs, warns, docs, amds] = await Promise.all([
        GF.table('genfin_staff', { order: 'created_at' }),
        GF.table('genfin_hr_log', { order: 'created_at', limit: 200 }),
        GF.table('genfin_payslips', { order: 'issued_at', limit: 200 }),
        GF.table('genfin_appraisals', { order: 'scheduled_for', asc: true, limit: 200 }),
        GF.table('genfin_warnings', { order: 'issued_at', limit: 100 }),
        GF.table('genfin_hr_docs', { order: 'created_at', limit: 100 }),
        GF.table('genfin_amendments', { order: 'created_at', limit: 100 })
      ]);
      const byId = {}; staff.forEach(s => byId[s.id] = s);
      const approved = staff.filter(s => s.status === 'approved');
      const awaiting = staff.filter(s => s.status === 'pending');
      const invited = staff.filter(s => s.status === 'invited');
      const totalSalaries = approved.reduce((t, s) => t + Number(s.salary || 0), 0);
      const in30 = new Date(Date.now() + 30 * 864e5);
      const dueSoon = apprs.filter(a => a.status === 'scheduled' && new Date(a.scheduled_for) <= in30);
      const period = new Date().toLocaleString('en-GB', { month: 'long', year: 'numeric' });

      const kpis = '<div class="s-kpi-grid">' +
        kpi('Headcount', approved.length, invited.length + ' invited · ' + awaiting.length + ' awaiting approval · ' + staff.filter(s => s.status === 'terminated').length + ' former') +
        kpi('Total monthly salaries', GF.money(totalSalaries), 'Approved staff, gross') +
        kpi('Appraisals due (30 days)', dueSoon.length, dueSoon.map(a => (byId[a.staff_id] || {}).full_name).slice(0, 2).join(', ') || 'None scheduled') +
        kpi('Awaiting HR action', awaiting.length + invited.length, 'Approvals & pending invitations') +
        '</div>';

      /* ---------- DETAIL VIEW ---------- */
      if (hrView.mode === 'detail') {
        const s = byId[hrView.staffId];
        if (!s) { hrView = { mode: 'roster' }; return render(); }
        const myLog = log.filter(l => l.staff_id === s.id);
        const mySlips = slips.filter(p => p.staff_id === s.id);
        const myApprs = apprs.filter(a => a.staff_id === s.id);
        const myWarns = warns.filter(w => w.staff_id === s.id);
        const myDocs = docs.filter(d => d.staff_id === s.id);
        const missing = ['national_id', 'dob', 'address', 'phone'].filter(k => !s[k]);

        const recordCard = card('Employment record — ' + GF.esc(s.full_name) + ' ' + GF.statusChip(s.status),
          '<div style="display:flex;justify-content:flex-end;margin-bottom:8px"><button class="s-btn s-btn-ghost s-btn-sm" id="hrBack">← Staff roster</button></div>' +
          (missing.length && s.status === 'invited' ? '<div class="s-alert s-alert-warn" style="margin-bottom:10px;font-size:0.8rem">Awaiting the employee: they must sign in with their temporary password to set their own password and complete ' + missing.join(', ').replace(/_/g, ' ') + '.</div>' : '') +
          tbl(['', ''], [
            ['Staff number', GF.esc(s.staff_no || '—')], ['Email', GF.esc(s.email)], ['WhatsApp', GF.esc(s.whatsapp || '—')],
            ['Phone', GF.esc(s.phone || '—')], ['National ID', GF.esc(s.national_id || '—')], ['Date of birth', GF.d(s.dob)],
            ['Address', GF.esc(s.address || '—')], ['Next of kin', GF.esc(s.next_of_kin || '—')],
            ['Role', GF.esc((s.role || s.position_applied || '—').replace(/_/g, ' '))], ['Department', GF.esc(s.department || '—')],
            ['Employment type', GF.esc(s.employment_type || '—')], ['Probation', s.probation_months ? s.probation_months + ' months' : '—'],
            ['Date of employment', GF.d(s.employment_date)], ['Next appraisal', GF.d(s.next_appraisal)],
            ['Salary (gross/mo)', GF.money(s.salary)], ['HR notes', GF.esc(s.hr_notes || '—')],
            ['Approved by', s.approved_by ? GF.esc(s.approved_by) + ' on ' + GF.dt(s.approved_at) : '—'],
            ['Payslips on file', mySlips.length]], false));

        const staffAmds = amds.filter(a => a.staff_id === s.id);
        const proposeCard = card('Propose a record amendment <span style="font-weight:400;color:var(--s-muted);font-size:0.72rem">— takes effect only after Head of HR approval; logged old → new</span>',
          '<div class="s-form-row"><div class="s-form-group"><label class="s-label">Field</label><select class="s-input" id="hamField">' +
          [['full_name','Full name'],['phone','Phone'],['whatsapp','WhatsApp'],['address','Home address'],['next_of_kin','Next of kin'],['national_id','National ID'],['dob','Date of birth'],['department','Department'],['salary','Salary (USD)'],['employment_type','Employment type'],['employment_date','Employment date'],['next_appraisal','Next appraisal'],['hr_notes','HR notes']].map(f => '<option value="' + f[0] + '">' + f[1] + '</option>').join('') + '</select></div>' +
          '<div class="s-form-group"><label class="s-label">New value *</label><input class="s-input" id="hamNew"></div>' +
          '<div class="s-form-group"><label class="s-label">Reason</label><input class="s-input" id="hamWhy"></div></div>' +
          '<button class="s-btn s-btn-primary s-btn-sm" id="hamGo">Submit for approval</button>' +
          '<div id="hamErr" style="color:#B93636;font-size:0.8rem;margin-top:6px"></div>' +
          (staffAmds.length ? '<div style="margin-top:10px">' + tbl(['Requested', 'Field', 'Change', 'Status', 'Decided by'],
            staffAmds.map(a => [GF.dt(a.created_at) + '<br><span style="color:var(--s-muted);font-size:0.7rem">by ' + GF.esc(a.requested_by) + '</span>', GF.esc(a.field.replace(/_/g, ' ')),
              '<span style="color:var(--s-muted)">' + GF.esc(a.old_value || '—') + '</span> → <strong>' + GF.esc(a.new_value) + '</strong>',
              GF.statusChip(a.status), a.decided_by ? GF.esc(a.decided_by) : '—'])) + '</div>' : ''));

        const approveCard = (s.status !== 'pending' && s.status !== 'invited') ? '' :
          card('Approve & set employment terms',
            '<div class="s-form-row"><div class="s-form-group"><label class="s-label">Role (decides portal access) *</label>' +
            '<select class="s-input" id="apRole"><option value="">Assign role…</option>' + ROLES.map(r => { const [v, l] = r.split('|'); return '<option value="' + v + '">' + l + '</option>'; }).join('') + '</select></div>' +
            '<div class="s-form-group"><label class="s-label">Department</label><input class="s-input" id="apDept" placeholder="e.g. Finance"></div></div>' +
            '<div class="s-form-row"><div class="s-form-group"><label class="s-label">Date of employment</label><input class="s-input" id="apDate" type="date" value="' + (s.employment_date || '') + '"></div>' +
            '<div class="s-form-group"><label class="s-label">Employment type</label><select class="s-input" id="apType">' + ETYPES.map(t => '<option>' + t + '</option>').join('') + '</select></div></div>' +
            '<div class="s-form-row"><div class="s-form-group"><label class="s-label">Probation (months, blank if none)</label><input class="s-input" id="apProb" type="number" min="0" max="12"></div>' +
            '<div class="s-form-group"><label class="s-label">Next appraisal date</label><input class="s-input" id="apNext" type="date"></div></div>' +
            '<div class="s-form-row"><div class="s-form-group"><label class="s-label">Salary (USD gross/month) *</label><input class="s-input" id="apSal" type="number" min="0" step="0.01" value="' + (s.salary || '') + '"></div>' +
            '<div class="s-form-group"><label class="s-label">Notes</label><input class="s-input" id="apNotes" placeholder="Any conditions or remarks"></div></div>' +
            '<div style="display:flex;gap:8px"><button class="s-btn s-btn-success" id="apGo">Approve staff member</button>' +
            '<button class="s-btn s-btn-danger" id="apReject">Reject</button></div>' +
            '<div id="apErr" style="color:#B93636;font-size:0.8rem;margin-top:6px"></div>');

        const apprCard = card('Appraisals',
          '<div class="s-form-row" style="align-items:flex-end"><div class="s-form-group"><label class="s-label">Schedule next appraisal</label><input class="s-input" id="scDate" type="date"></div>' +
          '<div class="s-form-group"><label class="s-label">Notes</label><input class="s-input" id="scNotes" placeholder="Focus areas (optional)"></div>' +
          '<div class="s-form-group"><button class="s-btn s-btn-primary" id="scGo">Schedule</button></div></div>' +
          (myApprs.length ? myApprs.map(a =>
            '<div style="border:1px solid var(--s-border);border-radius:10px;padding:10px;margin-bottom:8px">' +
            '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:0.83rem"><strong>' + GF.d(a.scheduled_for) + '</strong>' + GF.statusChip(a.status) +
            (a.status === 'completed' ? '<span>Rating <strong>' + a.rating + '/5</strong> · by ' + GF.esc(a.conducted_by) + '</span>' :
              '<button class="s-btn s-btn-primary s-btn-sm hr-conduct" data-id="' + a.id + '" style="margin-left:auto">Conduct appraisal</button>') + '</div>' +
            (a.status === 'completed' ? '<div style="font-size:0.76rem;color:var(--s-muted);margin-top:4px">Strengths: ' + GF.esc(a.strengths || '—') + ' · Improve: ' + GF.esc(a.improvements || '—') + (a.comments ? ' · ' + GF.esc(a.comments) : '') + '</div>' : (a.notes ? '<div style="font-size:0.76rem;color:var(--s-muted);margin-top:4px">' + GF.esc(a.notes) + '</div>' : '')) +
            (conductId === a.id ?
              '<div style="margin-top:8px;border-top:1px solid var(--s-border);padding-top:8px">' +
              '<div class="s-form-row"><div class="s-form-group"><label class="s-label">Rating</label><select class="s-input" id="cnRate">' + [5, 4, 3, 2, 1].map(r => '<option value="' + r + '">' + r + ' — ' + ['', 'unsatisfactory', 'needs improvement', 'meets expectations', 'exceeds expectations', 'outstanding'][r] + '</option>').join('') + '</select></div>' +
              '<div class="s-form-group"><label class="s-label">Next appraisal</label><input class="s-input" id="cnNext" type="date"></div></div>' +
              '<div class="s-form-group"><label class="s-label">Strengths</label><input class="s-input" id="cnStr"></div>' +
              '<div class="s-form-group"><label class="s-label">Areas to improve</label><input class="s-input" id="cnImp"></div>' +
              '<div class="s-form-group"><label class="s-label">Comments</label><input class="s-input" id="cnCom"></div>' +
              '<button class="s-btn s-btn-success s-btn-sm" id="cnSave">Save appraisal</button></div>' : '') +
            '</div>').join('') : '<p style="color:var(--s-muted);font-size:0.83rem">No appraisals yet.</p>'));

        const warnCard = card('Formal warnings',
          '<div class="s-form-row" style="align-items:flex-end"><div class="s-form-group"><label class="s-label">Severity</label><select class="s-input" id="wnSev"><option>verbal</option><option>written</option><option>final written</option></select></div>' +
          '<div class="s-form-group"><label class="s-label">Reason *</label><input class="s-input" id="wnReason" placeholder="e.g. Repeated late attendance"></div>' +
          '<div class="s-form-group"><button class="s-btn s-btn-danger" id="wnGo">Issue warning</button></div></div>' +
          '<div class="s-form-group"><label class="s-label">Details (appears in the letter)</label><input class="s-input" id="wnDet" placeholder="Dates, incidents, prior discussions…"></div>' +
          '<p style="font-size:0.72rem;color:var(--s-muted)">A branded warning letter is generated automatically, placed on the employment record, and sent to the staff member\'s portal and email.</p>' +
          (myWarns.length ? tbl(['When', 'Severity', 'Reason', 'Issued by'], myWarns.map(w => [GF.dt(w.issued_at), GF.chip(w.severity, w.severity === 'verbal' ? 'gold' : 'red'), GF.esc(w.reason), GF.esc(w.issued_by)])) : ''));

        const docRows = myDocs.map(d =>
          '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:7px 0;border-bottom:1px solid var(--s-border);font-size:0.83rem">' +
          '<strong>' + GF.esc(d.title) + '</strong>' + GF.chip(d.doc_type, 'blue') + GF.statusChip(d.status) +
          '<span style="color:var(--s-muted);font-size:0.72rem">' + GF.esc(d.ref) + ' · drafted by ' + GF.esc(d.drafted_by) + (d.approved_by ? ' · approved by ' + GF.esc(d.approved_by) : '') + '</span>' +
          '<span style="margin-left:auto;display:flex;gap:6px">' +
          (d.status === 'draft' ? '<button class="s-btn s-btn-ghost s-btn-sm hr-doc-edit" data-id="' + d.id + '">Review & edit</button><button class="s-btn s-btn-success s-btn-sm hr-doc-send" data-id="' + d.id + '">Approve & send</button>' : '') +
          '<a class="s-btn s-btn-ghost s-btn-sm" href="hr-doc.html?id=' + d.id + '" style="text-decoration:none">Open</a></span></div>').join('');
        const editing = docEdit ? myDocs.find(d => d.id === docEdit) : null;
        const docCard = card('Offer letters & contracts <span style="font-weight:400;color:var(--s-muted);font-size:0.72rem">— drafted by GENFIN AI from the role & terms; you review and approve before sending</span>',
          '<div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap">' +
          '<button class="s-btn s-btn-primary s-btn-sm" id="hrDraftOffer">✦ Draft offer letter (GENFIN AI)</button>' +
          '<button class="s-btn s-btn-primary s-btn-sm" id="hrDraftContract">✦ Draft employment contract (GENFIN AI)</button></div>' +
          (editing ? '<div style="border:1.5px solid var(--gold-400,#FBBD3E);border-radius:10px;padding:12px;margin-bottom:10px">' +
            '<div class="s-form-group"><label class="s-label">Title</label><input class="s-input" id="deTitle" value="' + GF.esc(editing.title) + '"></div>' +
            '<div class="s-form-group"><label class="s-label">Body (edit before approving)</label><textarea class="s-input" id="deBody" rows="12" style="font-family:inherit;line-height:1.5">' + GF.esc(editing.body) + '</textarea></div>' +
            '<div style="display:flex;gap:8px"><button class="s-btn s-btn-ghost s-btn-sm" id="deClose">Close</button>' +
            '<button class="s-btn s-btn-primary s-btn-sm" id="deSave">Save draft</button>' +
            '<button class="s-btn s-btn-success s-btn-sm" id="deSend">Approve & send</button></div></div>' : '') +
          (docRows || '<p style="color:var(--s-muted);font-size:0.83rem">No documents yet — draft one with GENFIN AI.</p>'));

        const offboardCard = s.status !== 'approved' ? '' : card('Offboarding',
          '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
          '<select class="s-input" id="obReason" style="width:300px;max-width:100%"><option value="">Reason for termination…</option>' + TERM_REASONS.map(r => '<option>' + r + '</option>').join('') + '</select>' +
          '<input class="s-input" type="date" id="obDate" style="width:auto" title="Last day of employment">' +
          '<button class="s-btn s-btn-danger s-btn-sm" id="obGo">Offboard</button></div>' +
          '<p style="font-size:0.72rem;color:var(--s-muted);margin-top:6px">Reasons align to the Labour Act [Chapter 28:01]; due process must be completed and documented first.</p>');

        const logCard = card('HR history', tbl(['When', 'Action', 'By', 'Note'], myLog.map(l => [GF.dt(l.created_at), GF.statusChip(l.action), GF.esc(l.actor), GF.esc(l.note || '')])));

        $('#gfBody').innerHTML = kpis + recordCard + approveCard + proposeCard +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;align-items:start"><div>' + apprCard + warnCard + '</div><div>' + docCard + offboardCard + '</div></div>' + logCard;

        $('#hrBack').onclick = () => { hrView = { mode: 'roster' }; docEdit = null; conductId = null; render(); };
        $('#hamGo').onclick = async () => {
          const nv = $('#hamNew').value.trim();
          if (!nv) { $('#hamErr').textContent = 'Enter the new value.'; return; }
          $('#hamGo').textContent = 'Submitting…';
          const res = await GF.rpc('genfin_request_amendment', { p_actor: sess.name, p_staff: s.id, p_field: $('#hamField').value, p_new: nv, p_reason: $('#hamWhy').value.trim() || null });
          if (!(res && res.ok)) { $('#hamErr').textContent = (res && res.error) || 'Failed'; $('#hamGo').textContent = 'Submit for approval'; return; }
          render();
        };
        if (approveCard) {
          const go = $('#apGo');
          if (go) go.onclick = async () => {
            const role = $('#apRole').value;
            if (!role) { $('#apErr').textContent = 'Assign a role — it decides which portal they can access.'; return; }
            go.textContent = 'Approving…';
            const res = await GF.rpc('genfin_approve_staff', { p_staff: s.id, p_approver: sess.name, p_role: role, p_department: $('#apDept').value || null,
              p_employment_date: $('#apDate').value || null, p_employment_type: $('#apType').value, p_probation_months: parseInt($('#apProb').value) || null,
              p_next_appraisal: $('#apNext').value || null, p_salary: parseFloat($('#apSal').value) || null, p_notes: $('#apNotes').value || null });
            if (!(res && res.ok)) { $('#apErr').textContent = (res && res.error) || 'Failed'; go.textContent = 'Approve staff member'; return; }
            render();
          };
          const rej = $('#apReject');
          if (rej) rej.onclick = async () => { await GF.rpc('genfin_reject_staff', { p_staff: s.id, p_approver: sess.name, p_note: 'Rejected at review' }); render(); };
        }
        $('#scGo').onclick = async () => {
          if (!$('#scDate').value) return alert('Pick a date');
          await GF.rpc('genfin_schedule_appraisal', { p_actor: sess.name, p_staff: s.id, p_date: $('#scDate').value, p_notes: $('#scNotes').value || null });
          render();
        };
        document.querySelectorAll('.hr-conduct').forEach(b => b.onclick = () => { conductId = b.dataset.id; render(); });
        const cn = $('#cnSave');
        if (cn) cn.onclick = async () => {
          await GF.rpc('genfin_complete_appraisal', { p_actor: sess.name, p_id: conductId, p_rating: parseInt($('#cnRate').value),
            p_strengths: $('#cnStr').value, p_improvements: $('#cnImp').value, p_comments: $('#cnCom').value, p_next: $('#cnNext').value || null });
          conductId = null; render();
        };
        $('#wnGo').onclick = async () => {
          const reason = $('#wnReason').value.trim();
          if (!reason) return alert('A reason is required');
          if (!confirm('Issue a formal ' + $('#wnSev').value + ' warning to ' + s.full_name + '?\n\nReason: ' + reason)) return;
          await GF.rpc('genfin_issue_warning', { p_actor: sess.name, p_staff: s.id, p_severity: $('#wnSev').value, p_reason: reason, p_details: $('#wnDet').value || null });
          render();
        };
        $('#hrDraftOffer').onclick = async () => { const r = await GF.rpc('genfin_draft_hr_doc', { p_actor: sess.name, p_staff: s.id, p_type: 'offer' }); if (r && r.ok) { docEdit = r.id; } render(); };
        $('#hrDraftContract').onclick = async () => { const r = await GF.rpc('genfin_draft_hr_doc', { p_actor: sess.name, p_staff: s.id, p_type: 'contract' }); if (r && r.ok) { docEdit = r.id; } render(); };
        document.querySelectorAll('.hr-doc-edit').forEach(b => b.onclick = () => { docEdit = b.dataset.id; render(); });
        document.querySelectorAll('.hr-doc-send').forEach(b => b.onclick = async () => {
          if (!confirm('Approve this document and send it to ' + s.full_name + '?')) return;
          await GF.rpc('genfin_send_hr_doc', { p_actor: sess.name, p_id: b.dataset.id }); docEdit = null; render();
        });
        if (editing) {
          $('#deClose').onclick = () => { docEdit = null; render(); };
          $('#deSave').onclick = async () => { await GF.rpc('genfin_update_hr_doc', { p_actor: sess.name, p_id: editing.id, p_title: $('#deTitle').value, p_body: $('#deBody').value }); render(); };
          $('#deSend').onclick = async () => {
            await GF.rpc('genfin_update_hr_doc', { p_actor: sess.name, p_id: editing.id, p_title: $('#deTitle').value, p_body: $('#deBody').value });
            if (!confirm('Approve this document and send it to ' + s.full_name + '?')) return;
            await GF.rpc('genfin_send_hr_doc', { p_actor: sess.name, p_id: editing.id }); docEdit = null; render();
          };
        }
        const ob = $('#obGo');
        if (ob) ob.onclick = async () => {
          const reason = $('#obReason').value;
          if (!reason) return alert('Select a lawful reason for termination — it is recorded in the HR log.');
          if (!confirm('Offboard ' + s.full_name + '?\n\nReason: ' + reason + '\n\nAccess is restricted immediately. Confirm due process is completed and documented.')) return;
          await GF.rpc('genfin_terminate_staff', { p_staff: s.id, p_actor: sess.name, p_reason: reason, p_date: $('#obDate').value || null, p_note: null });
          render();
        };
        return;
      }

      /* ---------- ROSTER VIEW ---------- */
      const addCard = !showAdd ? '' : card('Add a staff member',
        '<p style="font-size:0.78rem;color:var(--s-muted);margin-bottom:8px">Enter what you have — name, email and WhatsApp are enough. The system creates the record and sends an activation invitation; the staff member sets their own password and completes their National ID, address and other required details on first login.</p>' +
        '<div class="s-form-row"><div class="s-form-group"><label class="s-label">Full name *</label><input class="s-input" id="adName"></div>' +
        '<div class="s-form-group"><label class="s-label">Email *</label><input class="s-input" id="adEmail" type="email"></div>' +
        '<div class="s-form-group"><label class="s-label">WhatsApp</label><input class="s-input" id="adWa" placeholder="+263 …"></div></div>' +
        '<div style="display:flex;gap:8px"><button class="s-btn s-btn-primary" id="adGo">Create & send invitation</button>' +
        '<button class="s-btn s-btn-ghost" id="adCancel">Cancel</button></div>' +
        '<div id="adErr" style="color:#B93636;font-size:0.8rem;margin-top:6px"></div>' +
        (invite ? '<div class="s-alert s-alert-success" style="margin-top:10px;font-size:0.8rem"><strong>Invitation sent ✓</strong> Staff no. ' + GF.esc(invite.staff_no) + '. Temporary password: <code style="font-weight:800">' + GF.esc(invite.temp_password) + '</code><br>The activation email has been recorded (in production it is delivered via SendGrid, with the WhatsApp invite via the Business API). For this demo, share the temporary password with them directly — they sign in at /login and are guided through setup.</div>' : ''));

      const isHead = sess.role === 'hr_head' || sess.kind === 'admin' || sess.role === 'superadmin';
      const pendingAmds = amds.filter(a => a.status === 'pending');
      const amdQueue = !pendingAmds.length ? '' : card('Record amendments awaiting Head of HR approval',
        (isHead ? '' : '<p style="font-size:0.76rem;color:var(--s-muted)">Only the Head of HR can approve or decline these.</p>') +
        pendingAmds.map(a => '<div style="border:1px solid var(--s-border);border-radius:10px;padding:10px;margin-bottom:8px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;font-size:0.83rem">' +
          '<strong>' + GF.esc((byId[a.staff_id] || {}).full_name || '') + '</strong>' +
          '<span>' + GF.esc(a.field.replace(/_/g, ' ')) + ': <span style="color:var(--s-muted)">' + GF.esc(a.old_value || '—') + '</span> → <strong>' + GF.esc(a.new_value) + '</strong></span>' +
          '<span style="color:var(--s-muted);font-size:0.72rem">by ' + GF.esc(a.requested_by) + ' · ' + GF.dt(a.created_at) + (a.reason ? ' · ' + GF.esc(a.reason) : '') + '</span>' +
          (isHead ? '<span style="margin-left:auto;display:flex;gap:6px"><button class="s-btn s-btn-success s-btn-sm am-yes" data-id="' + a.id + '">Approve</button>' +
            '<button class="s-btn s-btn-danger s-btn-sm am-no" data-id="' + a.id + '">Decline</button></span>' : '') +
          '</div>').join(''));

      const roster = card('Staff roster <span style="font-weight:400;color:var(--s-muted);font-size:0.72rem">(click a staff member to open their full file)</span>',
        tbl(['Staff', 'Role / position', 'Type', 'Status', 'Salary', 'Next appraisal'],
          staff.map(s => ['<a href="#" class="hr-open" data-id="' + s.id + '" style="color:var(--s-info);font-weight:800;text-decoration:none">' + GF.esc(s.full_name) + '</a><br><span style="color:var(--s-muted);font-size:0.72rem">' + GF.esc(s.staff_no || '') + ' · ' + GF.esc(s.email) + '</span>',
            GF.esc((s.role || s.position_applied || '—').replace(/_/g, ' ')), GF.esc(s.employment_type || '—'), GF.statusChip(s.status),
            s.status === 'approved' ? GF.money(s.salary) : '—', GF.d(s.next_appraisal)])));

      const payrollCard = card('Payroll', '<button class="s-btn s-btn-primary" id="gfPayroll">Run payroll for ' + period + '</button><div id="gfPayrollMsg" style="font-size:0.8rem;color:var(--s-muted);margin:8px 0"></div>' +
        tbl(['Staff', 'Period', 'Gross', 'Net'], slips.slice(0, 10).map(p => [GF.esc((byId[p.staff_id] || {}).full_name || ''), GF.esc(p.period), GF.money(p.gross), '<strong>' + GF.money(p.net) + '</strong>'])));

      const logCard = card('HR audit log', tbl(['When', 'Action', 'Person', 'By', 'Note'], log.slice(0, 15).map(l => [GF.dt(l.created_at), GF.statusChip(l.action), GF.esc((byId[l.staff_id] || {}).full_name || ''), GF.esc(l.actor), GF.esc(l.note || '')])));

      $('#gfBody').innerHTML = kpis +
        '<div style="margin-bottom:1rem"><button class="s-btn s-btn-primary" id="hrAdd">+ Add staff member</button></div>' +
        addCard + amdQueue + roster +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;align-items:start"><div>' + payrollCard + '</div><div>' + logCard + '</div></div>';

      document.querySelectorAll('.am-yes').forEach(b => b.onclick = async () => {
        await GF.rpc('genfin_decide_amendment', { p_actor: sess.name, p_id: b.dataset.id, p_approve: true, p_note: null }); render();
      });
      document.querySelectorAll('.am-no').forEach(b => b.onclick = async () => {
        const note = prompt('Reason for declining (sent to the staff member):', '');
        if (note === null) return;
        await GF.rpc('genfin_decide_amendment', { p_actor: sess.name, p_id: b.dataset.id, p_approve: false, p_note: note || null }); render();
      });
      $('#hrAdd').onclick = () => { showAdd = !showAdd; invite = null; render(); };
      document.querySelectorAll('.hr-open').forEach(a => a.onclick = (ev) => { ev.preventDefault(); hrView = { mode: 'detail', staffId: a.dataset.id }; docEdit = null; conductId = null; render(); });
      if (showAdd) {
        $('#adCancel').onclick = () => { showAdd = false; invite = null; render(); };
        $('#adGo').onclick = async () => {
          const name = $('#adName').value.trim(), email = $('#adEmail').value.trim();
          if (!name || !email) { $('#adErr').textContent = 'Name and email are required.'; return; }
          $('#adGo').textContent = 'Creating…';
          const res = await GF.rpc('genfin_hr_add_staff', { p_actor: sess.name, p_name: name, p_email: email, p_whatsapp: $('#adWa').value.trim() || null });
          if (res && res.ok) { invite = res; render(); }
          else { $('#adErr').textContent = (res && res.error) || 'Failed'; $('#adGo').textContent = 'Create & send invitation'; }
        };
      }
      const pr = $('#gfPayroll');
      if (pr) pr.onclick = async () => {
        pr.textContent = 'Running…';
        const res = await GF.rpc('genfin_run_payroll', { p_period: period, p_actor: sess.name });
        $('#gfPayrollMsg').textContent = res && res.ok ? (res.payslips + ' payslip(s) generated; payroll posted to GL (DR 6000 / CR 1000).') : ((res && res.error) || 'Failed');
        setTimeout(render, 1200);
      };
    }
    await render();
  }

  /* ============ ONBOARDING (invited staff first login) ============ */
  async function pageOnboarding(sess) {
    const st = (await GF.table('genfin_staff', { eq: { id: sess.profile.id } }))[0] || sess.profile;
    $('#gfApp').innerHTML =
      '<div class="s-login-page"><div class="s-login-card" style="max-width:600px">' +
      '<div class="s-login-logo"><img src="assets/genfin-logo.png" alt="GENFIN" width="160"></div>' +
      '<div class="s-login-title">Welcome, ' + GF.esc((st.full_name || '').split(' ')[0]) + '</div>' +
      '<div class="s-login-sub">Set your own password and complete the details GENFIN is required to hold as your employer. HR will then approve your account.</div>' +
      '<div class="s-form-row"><div class="s-form-group"><label class="s-label">New password *</label><input class="s-input" id="obPass" type="password"></div>' +
      '<div class="s-form-group"><label class="s-label">Confirm password *</label><input class="s-input" id="obPass2" type="password"></div></div>' +
      '<div class="s-form-row"><div class="s-form-group"><label class="s-label">National ID *</label><input class="s-input" id="obNid" placeholder="63-0000000 X00" value="' + GF.esc(st.national_id || '') + '"></div>' +
      '<div class="s-form-group"><label class="s-label">Date of birth *</label><input class="s-input" id="obDob" type="date" value="' + (st.dob || '') + '"></div></div>' +
      '<div class="s-form-group"><label class="s-label">Home address *</label><input class="s-input" id="obAddr" value="' + GF.esc(st.address || '') + '"></div>' +
      '<div class="s-form-row"><div class="s-form-group"><label class="s-label">Phone *</label><input class="s-input" id="obPhone" value="' + GF.esc(st.phone || st.whatsapp || '') + '"></div>' +
      '<div class="s-form-group"><label class="s-label">Next of kin (name & phone) *</label><input class="s-input" id="obKin"></div></div>' +
      '<div class="s-form-group"><label class="s-label">Position (if agreed)</label><input class="s-input" id="obPos" value="' + GF.esc(st.position_applied || '') + '"></div>' +
      '<div id="obErr" style="color:#B93636;font-size:0.8rem;margin-bottom:8px;display:none"></div>' +
      '<div id="obOk"></div>' +
      '<button class="s-btn s-btn-primary s-btn-lg" id="obGo" style="width:100%">Save & submit for HR approval</button>' +
      '<button class="s-btn s-btn-ghost" id="gfLogout" style="width:100%;margin-top:8px">Log out</button>' +
      '</div></div>';
    wireLogout();
    $('#obGo').onclick = async () => {
      const p1 = $('#obPass').value, p2 = $('#obPass2').value;
      if (p1 !== p2) { $('#obErr').textContent = 'Passwords do not match.'; $('#obErr').style.display = 'block'; return; }
      $('#obGo').textContent = 'Saving…';
      const res = await GF.rpc('genfin_complete_profile', { p_staff: sess.profile.id, p: {
        password: p1, national_id: $('#obNid').value.trim(), dob: $('#obDob').value, address: $('#obAddr').value.trim(),
        phone: $('#obPhone').value.trim(), next_of_kin: $('#obKin').value.trim(), position: $('#obPos').value.trim() } });
      if (res && res.ok) {
        $('#obOk').innerHTML = '<div class="s-alert s-alert-success" style="margin-bottom:8px;font-size:0.82rem"><strong>All set.</strong> Your details are saved and your password is updated. HR has been notified — you will be able to sign in fully once they approve your account.</div>';
        $('#obGo').style.display = 'none'; $('#obErr').style.display = 'none';
        setTimeout(() => GF.logout(), 6000);
      } else {
        $('#obErr').textContent = (res && res.error) || 'Failed'; $('#obErr').style.display = 'block';
        $('#obGo').textContent = 'Save & submit for HR approval';
      }
    };
  }

  /* ============ LOGISTICS ============ */
  async function pageLogistics(sess) {
    $('#gfApp').innerHTML = staffShell(sess, 'Logistics & deliveries', 'staff-logistics'); wireLogout();
    async function render() {
      const [drivers, deliveries, orders] = await Promise.all([
        GF.table('genfin_drivers', { order: 'name', asc: true }),
        GF.table('genfin_deliveries', { order: 'created_at', limit: 15 }),
        GF.table('genfin_orders', { limit: 50 })
      ]);
      const orderNo = {}; orders.forEach(o => orderNo[o.id] = o.order_no);
      const dname = {}; drivers.forEach(d => dname[d.id] = d.name);
      $('#gfBody').innerHTML =
        '<div class="s-kpi-grid">' +
        kpi('Registered drivers', drivers.length, drivers.filter(d => d.status === 'available').length + ' available now') +
        kpi('Active deliveries', deliveries.filter(d => d.status !== 'delivered').length) +
        kpi('Completed', deliveries.filter(d => d.status === 'delivered').length) +
        '</div>' +
        card('Driver register & availability', tbl(['Driver', 'Phone', 'Vehicle', 'Reg', 'Status'],
          drivers.map(d => [GF.esc(d.name), GF.esc(d.phone), GF.esc(d.vehicle), GF.esc(d.reg_no), GF.statusChip(d.status)]))) +
        card('Deliveries', tbl(['Order', 'Driver', 'Scheduled', 'Status', ''], deliveries.map(dl => [
          GF.esc(orderNo[dl.order_id] || ''), GF.esc(dname[dl.driver_id] || 'Queued'), GF.d(dl.scheduled_date), GF.statusChip(dl.status),
          dl.status === 'booked' ? '<button class="s-btn s-btn-primary s-btn-sm gf-dispatch" data-id="' + dl.id + '">Dispatch</button>' :
          dl.status === 'out_for_delivery' ? '<button class="s-btn s-btn-success s-btn-sm gf-deliver" data-id="' + dl.id + '">Mark delivered</button>' :
          '<span style="font-size:0.72rem;color:var(--s-muted)">' + GF.dt(dl.delivered_at) + '</span>'])));
      document.querySelectorAll('.gf-dispatch').forEach(b => b.onclick = async () => { await GF.rpc('genfin_dispatch', { p_delivery: b.dataset.id }); render(); });
      document.querySelectorAll('.gf-deliver').forEach(b => b.onclick = async () => { await GF.rpc('genfin_mark_delivered', { p_delivery: b.dataset.id }); render(); });
    }
    await render();
    setInterval(render, 8000);
  }

  /* ============ MEMBER PORTAL HOME ============ */
  async function pagePortal(sess) {
    document.body.className = 'portal-body';
    $('#gfApp').innerHTML = portalShell(sess, GT('portal.welcome') + ', ' + (sess.name || '').split(' ')[0]);
    wireLogout();
    async function render() {
      const m = (await GF.table('genfin_members', { eq: { id: sess.profile.id } }))[0] || sess.profile;
      const [orders, notes, invoices] = await Promise.all([
        GF.table('genfin_orders', { eq: { member_id: m.id }, order: 'created_at', limit: 6 }),
        GF.table('genfin_notifications', { eq: { recipient_id: m.id }, order: 'created_at', limit: 12 }),
        GF.table('genfin_invoices', { eq: { member_id: m.id, status: 'unpaid' } })
      ]);
      const pct = Math.min(100, Math.round(Number(m.used_benefit) / Number(m.annual_limit) * 100));
      document.getElementById('gfBody').innerHTML = '<h1 class="portal-page-title">Welcome back, ' + GF.esc((sess.name || '').split(' ')[0]) + '</h1>' +
        '<p class="portal-page-sub">' + GF.esc(m.plan) + ' · ' + GF.esc(m.member_no) + ' · ' + GF.esc(m.employer || '') + '</p>' +
        '<div class="portal-card" style="margin-bottom:1rem"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:6px">' +
        '<strong>' + GT('portal.benefit') + '</strong><span>' + GF.money(m.used_benefit) + ' of ' + GF.money(m.annual_limit) + '</span></div>' +
        '<div style="height:10px;background:var(--slate-100,#EEEEF1);border-radius:6px"><div style="height:100%;width:' + pct + '%;background:#FBBD3E;border-radius:6px"></div></div></div>' +
        (invoices.length ? '<div class="portal-alert portal-alert-warn" style="margin-bottom:1rem"><strong>' + invoices.length + ' invoice(s) awaiting payment.</strong> ' +
          invoices.map(i => GF.esc(i.invoice_no) + ' (' + GF.money(i.amount) + ') <button class="s-btn s-btn-primary s-btn-sm gf-paynow" data-id="' + i.id + '" style="margin-left:6px;cursor:pointer">' + GT('portal.paynow') + '</button>').join('<br>') + '</div>' : '') +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-bottom:1.25rem">' +
        [['portal-pharmacy.html', GT('portal.order'), GT('portal.ordersub')],
         ['portal-preauth.html', GT('portal.preauth'), GT('portal.preauthsub')],
         ['member-profile.html', GT('portal.profile'), GT('portal.profilesub')],
         ['policy-certificate.html', GT('portal.cert'), GT('portal.certsub')],
         ['policy-benefit-schedule.html', GT('portal.schedule'), GT('portal.schedulesub')]].map(l =>
          '<a href="' + l[0] + '" class="portal-card" style="text-decoration:none;color:inherit;display:block"><strong>' + l[1] + '</strong><div style="font-size:0.8rem;color:#6A6870;margin-top:4px">' + l[2] + '</div></a>').join('') + '</div>' +
        '<h2 class="portal-section-title">' + GT('portal.orders') + '</h2>' +
        '<div class="portal-card">' + (orders.length ? orders.map(o =>
          '<div style="display:flex;justify-content:space-between;gap:8px;padding:8px 0;border-bottom:1px solid #EEEEF1;font-size:0.85rem;flex-wrap:wrap">' +
          '<span><strong>' + GF.esc(o.order_no) + '</strong> · ' + GF.esc(o.type) + '</span><span>' + GF.money(o.total) + '</span>' + GF.statusChip(o.status) +
          '<span style="color:#82818C;font-size:0.75rem">' + GF.dt(o.created_at) + '</span></div>').join('') : 'No orders yet — try ordering your meds or new glasses.') + '</div>' +
        '<h2 class="portal-section-title" style="margin-top:1.25rem">' + GT('portal.messages') + '</h2>' +
        '<div class="portal-card">' + (notes.length ? notes.map(n =>
          '<div style="padding:9px 0;border-bottom:1px solid #EEEEF1"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
          GF.chip(n.channel === 'email' ? '✉ email' : '🔔 portal', n.channel === 'email' ? 'blue' : 'gold') +
          '<strong style="font-size:0.85rem">' + GF.esc(n.subject) + '</strong>' +
          '<span style="color:#82818C;font-size:0.72rem;margin-left:auto">' + GF.dt(n.created_at) + '</span></div>' +
          '<div style="font-size:0.8rem;color:#4E4D55;margin-top:3px">' + GF.esc(n.body || '') + '</div></div>').join('') : 'No messages yet.') + '</div>';
      document.querySelectorAll('.gf-paynow').forEach(b => b.onclick = async () => {
        b.textContent = 'Processing…';
        const res = await GF.rpc('genfin_record_payment', { p_invoice: b.dataset.id, p_method: 'EcoCash' });
        if (!(res && res.ok)) alert((res && res.error) || 'Payment failed');
        render();
      });
    }
    await render();
    setInterval(render, 8000);
  }

  /* Dashboard pre-auth decisions */
  function wirePreauthButtons(sess, render) {
    document.querySelectorAll('.gf-pa-yes').forEach(b => b.onclick = async () => {
      b.textContent = '…';
      await GF.rpc('genfin_decide_preauth', { p_id: b.dataset.id, p_actor: sess.name, p_approve: true, p_note: 'Within benefit and tariff' });
      render();
    });
    document.querySelectorAll('.gf-pa-no').forEach(b => b.onclick = async () => {
      const note = prompt('Reason for declining (sent to the member):', 'Insufficient information — please resubmit with a referral letter');
      if (note === null) return;
      await GF.rpc('genfin_decide_preauth', { p_id: b.dataset.id, p_actor: sess.name, p_approve: false, p_note: note });
      render();
    });
  }

  /* ============ MEMBER SHOP (pharmacy + optical) ============ */
  async function pageShop(sess) {
    document.body.className = 'portal-body';
    $('#gfApp').innerHTML = portalShell(sess, 'Order medication & optical');
    wireLogout();
    const cart = {};
    async function render() {
      const items = await GF.table('genfin_inventory', { order: 'category', asc: true });
      const cartRows = Object.entries(cart).filter(([, q]) => q > 0);
      const byId = {}; items.forEach(i => byId[i.id] = i);
      const total = cartRows.reduce((t, [id, q]) => t + Number(byId[id] ? byId[id].unit_price : 0) * q, 0);
      document.getElementById('gfBody').innerHTML = '<h1 class="portal-page-title">Order medication & optical</h1>' +
        '<p class="portal-page-sub"><a href="portal.html" style="color:#14141A;font-weight:700">← Back to my portal</a> · Availability checked live against GENFIN inventory</p>' +
        '<div style="display:grid;grid-template-columns:1.5fr 1fr;gap:1.25rem;align-items:start"><div>' +
        ['pharmacy', 'optical'].map(cat =>
          '<h2 class="portal-section-title" style="margin-top:0.75rem">' + (cat === 'pharmacy' ? 'Pharmacy' : 'Optical & eyewear') + '</h2>' +
          items.filter(i => i.category === cat).map(i =>
            '<div class="portal-card" style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">' +
            '<div><strong style="font-size:0.9rem">' + GF.esc(i.name) + '</strong><div style="font-size:0.75rem;color:#82818C">' + GF.esc(i.sku) + ' · ' +
            (i.qty_on_hand > 0 ? i.qty_on_hand + ' in stock' : '<span style="color:#B93636">out of stock</span>') + '</div></div>' +
            '<div style="display:flex;align-items:center;gap:10px"><strong>' + GF.money(i.unit_price) + '</strong>' +
            '<button class="s-btn s-btn-ghost s-btn-sm gf-minus" data-id="' + i.id + '" style="cursor:pointer">−</button>' +
            '<span style="min-width:18px;text-align:center;font-weight:700">' + (cart[i.id] || 0) + '</span>' +
            '<button class="s-btn s-btn-primary s-btn-sm gf-plus" data-id="' + i.id + '" style="cursor:pointer"' + (i.qty_on_hand <= (cart[i.id] || 0) ? ' disabled' : '') + '>+</button></div></div>').join('')).join('') +
        '</div><div class="portal-card" style="position:sticky;top:90px">' +
        '<strong>Your order</strong>' +
        (cartRows.length ? cartRows.map(([id, q]) => '<div style="display:flex;justify-content:space-between;font-size:0.83rem;padding:6px 0;border-bottom:1px solid #EEEEF1"><span>' + GF.esc(byId[id].name) + ' × ' + q + '</span><span>' + GF.money(byId[id].unit_price * q) + '</span></div>').join('') +
          '<div style="display:flex;justify-content:space-between;font-weight:800;padding:10px 0">Total<span>' + GF.money(total) + '</span></div>' +
          '<button class="s-btn s-btn-primary" id="gfPlace" style="width:100%;cursor:pointer">Place order</button>' +
          '<p style="font-size:0.72rem;color:#82818C;margin-top:8px">Placing an order confirms stock, raises your invoice, books a delivery driver and updates your member record — instantly.</p>'
          : '<p style="font-size:0.83rem;color:#82818C;margin-top:6px">Add items to see your total.</p>') +
        '<div id="gfResult"></div></div></div>';
      document.querySelectorAll('.gf-plus').forEach(b => b.onclick = () => { cart[b.dataset.id] = (cart[b.dataset.id] || 0) + 1; render(); });
      document.querySelectorAll('.gf-minus').forEach(b => b.onclick = () => { cart[b.dataset.id] = Math.max(0, (cart[b.dataset.id] || 0) - 1); render(); });
      const pl = document.getElementById('gfPlace');
      if (pl) pl.onclick = async () => {
        pl.textContent = 'Placing order…';
        const type = cartRows.every(([id]) => byId[id].category === 'optical') ? 'optical' : 'pharmacy';
        const res = await GF.rpc('genfin_place_order', {
          p_member: sess.profile.id, p_type: type,
          p_items: cartRows.map(([id, q]) => ({ item_id: id, qty: q }))
        });
        if (res && res.ok) {
          Object.keys(cart).forEach(k => delete cart[k]);
          render();
          setTimeout(() => {
            const r = document.getElementById('gfResult');
            if (r) r.innerHTML = '<div class="s-alert s-alert-success" style="margin-top:10px;font-size:0.8rem">' +
              '<strong>Order ' + GF.esc(res.order_no) + ' confirmed ✓</strong><br>' +
              '✓ Stock confirmed in inventory<br>✓ Invoice ' + GF.esc(res.invoice_no) + ' raised (' + GF.money(res.total) + ')<br>' +
              '✓ Driver: ' + GF.esc(res.driver) + '<br>✓ Delivery: ' + GF.d(res.delivery_date) +
              '<br><a href="portal.html" style="font-weight:700;color:#14141A">Pay & track from your portal →</a></div>';
          }, 60);
        } else {
          alert((res && res.error) || 'Order failed');
          render();
        }
      };
    }
    await render();
  }

  /* ============ MEMBER PRE-AUTHORISATION ============ */
  async function pagePreauth(sess) {
    document.body.className = 'portal-body';
    $('#gfApp').innerHTML = portalShell(sess, 'Pre-authorisation');
    wireLogout();
    const CATS = ['Specialist consultation', 'Hospitalisation / procedure', 'Dental — specialised', 'Optical — beyond limit', 'Chronic condition registration', 'Other'];
    async function render() {
      const m = (await GF.table('genfin_members', { eq: { id: sess.profile.id } }))[0] || sess.profile;
      const reqs = await GF.table('genfin_preauths', { eq: { member_id: m.id }, order: 'created_at' });
      document.getElementById('gfBody').innerHTML = '<h1 class="portal-page-title">Pre-authorisation</h1>' +
        '<p class="portal-page-sub"><a href="portal.html" style="color:#14141A;font-weight:700">← Back to my portal</a> · Remaining benefit: <strong>' + GF.money(Number(m.annual_limit) - Number(m.used_benefit)) + '</strong></p>' +
        '<div style="display:grid;grid-template-columns:1fr 1.2fr;gap:1.25rem;align-items:start">' +
        '<div class="portal-card"><strong>New request</strong>' +
        '<div class="s-form-group" style="margin-top:10px"><label class="s-label">Category</label><select class="s-input" id="paCat">' + CATS.map(c => '<option>' + c + '</option>').join('') + '</select></div>' +
        '<div class="s-form-group"><label class="s-label">Provider / facility</label><input class="s-input" id="paProv" placeholder="e.g. Avenues Clinic, Harare"></div>' +
        '<div class="s-form-group"><label class="s-label">Procedure or service *</label><input class="s-input" id="paDesc" placeholder="e.g. MRI scan — lumbar spine"></div>' +
        '<div class="s-form-group"><label class="s-label">Estimated cost (USD) *</label><input class="s-input" id="paCost" type="number" min="1" step="0.01" placeholder="450.00"></div>' +
        '<div class="s-form-group"><label class="s-label">Notes for the assessor</label><input class="s-input" id="paNotes" placeholder="Referral details, urgency…"></div>' +
        '<div id="paErr" style="color:#B93636;font-size:0.8rem;margin-bottom:8px;display:none"></div>' +
        '<button class="s-btn s-btn-primary" id="paSend" style="width:100%;cursor:pointer">Submit for review</button>' +
        '<div id="paOk"></div></div>' +
        '<div><h2 class="portal-section-title" style="margin-top:0">My requests</h2><div class="portal-card">' +
        (reqs.length ? reqs.map(r => '<div style="padding:9px 0;border-bottom:1px solid #EEEEF1">' +
          '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><strong style="font-size:0.85rem">' + GF.esc(r.ref) + '</strong>' + GF.statusChip(r.status) +
          '<span style="color:#82818C;font-size:0.72rem;margin-left:auto">' + GF.dt(r.created_at) + '</span></div>' +
          '<div style="font-size:0.8rem;color:#4E4D55;margin-top:3px">' + GF.esc(r.procedure_desc) + ' · est. ' + GF.money(r.estimated_cost) + (r.provider ? ' · ' + GF.esc(r.provider) : '') + '</div>' +
          (r.decided_by ? '<div style="font-size:0.72rem;color:#82818C;margin-top:2px">Decision by ' + GF.esc(r.decided_by) + ' on ' + GF.dt(r.decided_at) + (r.decision_note ? ' — ' + GF.esc(r.decision_note) : '') + '</div>' : '') +
          '</div>').join('') : 'No pre-authorisation requests yet.') + '</div></div></div>';
      document.getElementById('paSend').onclick = async () => {
        const desc = $('#paDesc').value.trim(), cost = parseFloat($('#paCost').value);
        if (!desc || !(cost > 0)) { $('#paErr').textContent = 'Procedure and a valid estimated cost are required.'; $('#paErr').style.display = 'block'; return; }
        $('#paSend').textContent = 'Submitting…';
        const res = await GF.rpc('genfin_request_preauth', { p_member: sess.profile.id, p_category: $('#paCat').value, p_provider: $('#paProv').value.trim(), p_desc: desc, p_cost: cost, p_notes: $('#paNotes').value.trim() });
        if (res && res.ok) { render(); }
        else { $('#paSend').textContent = 'Submit for review'; $('#paErr').textContent = (res && res.error) || 'Failed'; $('#paErr').style.display = 'block'; }
      };
    }
    await render();
    setInterval(render, 10000);
  }

  /* ============ MEMBER PROFILE ============ */
  async function pageMemberProfile(sess) {
    document.body.className = 'portal-body';
    $('#gfApp').innerHTML = portalShell(sess, 'My profile');
    wireLogout();
    const m = (await GF.table('genfin_members', { eq: { id: sess.profile.id } }))[0] || sess.profile;
    const deps = await GF.table('genfin_dependants', { eq: { member_id: m.id } });
    document.getElementById('gfBody').innerHTML = '<h1 class="portal-page-title">My profile</h1>' +
      '<p class="portal-page-sub"><a href="portal.html" style="color:#14141A;font-weight:700">← Back to my portal</a></p>' +
      '<div class="portal-card" style="margin-bottom:1rem">' +
      [['Full name', m.full_name], ['Member number', m.member_no], ['Plan', m.plan], ['Employer', m.employer || '—'],
       ['Email', m.email || '—'], ['Phone', m.phone || '—'], ['Status', m.status],
       ['Annual limit', GF.money(m.annual_limit)], ['Benefit used', GF.money(m.used_benefit)]].map(r =>
        '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #EEEEF1;font-size:0.86rem"><span style="color:#6A6870">' + r[0] + '</span><strong>' + GF.esc(r[1]) + '</strong></div>').join('') + '</div>' +
      '<h2 class="portal-section-title">Registered dependants</h2><div class="portal-card" style="margin-bottom:1rem">' +
      (deps.length ? deps.map(d => '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #EEEEF1;font-size:0.86rem"><span><strong>' + GF.esc(d.full_name) + '</strong> · ' + GF.esc(d.relationship) + '</span><span style="color:#6A6870">' + GF.esc(d.member_no) + ' · DOB ' + GF.d(d.dob) + '</span></div>').join('') : 'None registered.') + '</div>' +
      '<h2 class="portal-section-title">My documents</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px">' +
      '<a href="policy-certificate.html" class="portal-card" style="text-decoration:none;color:inherit"><strong>Membership certificate</strong><div style="font-size:0.78rem;color:#6A6870">CERT-2026-' + GF.esc(m.member_no) + '</div></a>' +
      '<a href="policy-benefit-schedule.html" class="portal-card" style="text-decoration:none;color:inherit"><strong>Schedule of benefits</strong><div style="font-size:0.78rem;color:#6A6870">2026 benefit year</div></a></div>';
  }

  /* ============ STAFF PROFILE (letters + payslips) ============ */
  async function pageStaffProfile(sess) {
    $('#gfApp').innerHTML = staffShell(sess, 'My profile & documents', 'staff-profile'); wireLogout();
    const st = (await GF.table('genfin_staff', { eq: { id: sess.profile.id } }))[0] || sess.profile;
    const [slips, log, myDocs, myAmds] = await Promise.all([
      GF.table('genfin_payslips', { eq: { staff_id: st.id }, order: 'issued_at' }),
      GF.table('genfin_hr_log', { eq: { staff_id: st.id }, order: 'created_at' }),
      GF.table('genfin_hr_docs', { eq: { staff_id: st.id, status: 'sent' }, order: 'created_at' }),
      GF.table('genfin_amendments', { eq: { staff_id: st.id }, order: 'created_at' })
    ]);
    $('#gfBody').innerHTML =
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;align-items:start"><div>' +
      card('Personal record', tbl(['', ''], [['Staff number', GF.esc(st.staff_no || '—')], ['Full name', GF.esc(st.full_name)],
        ['Email', GF.esc(st.email)], ['Phone', GF.esc(st.phone || '—')], ['National ID', GF.esc(st.national_id || '—')],
        ['Address', GF.esc(st.address || '—')], ['Role', GF.esc((st.role || '—').replace(/_/g, ' '))],
        ['Department', GF.esc(st.department || '—')], ['Date of employment', GF.d(st.employment_date)],
        ['Status', GF.statusChip(st.status)], ['Approved by', st.approved_by ? GF.esc(st.approved_by) + ' on ' + GF.dt(st.approved_at) : '—']])) +
      card('HR history', tbl(['When', 'Action', 'By', 'Note'], log.map(l => [GF.dt(l.created_at), GF.statusChip(l.action), GF.esc(l.actor), GF.esc(l.note || '')]))) +
      '</div><div>' +
      card('My documents', '<a class="s-btn s-btn-primary" href="employment-letter.html" style="text-decoration:none">Download proof of employment letter</a>' +
        '<p style="font-size:0.76rem;color:var(--s-muted);margin-top:8px">Opens as an official GENFIN letter — print or save as PDF.</p>') +
      card('Request a record amendment <span style="font-weight:400;color:var(--s-muted);font-size:0.72rem">— applied only after Head of HR approval; every change is logged</span>',
        '<div class="s-form-row"><div class="s-form-group"><label class="s-label">Field</label><select class="s-input" id="amField">' +
        [['phone','Phone'],['whatsapp','WhatsApp'],['address','Home address'],['next_of_kin','Next of kin'],['national_id','National ID'],['dob','Date of birth']].map(f => '<option value="' + f[0] + '">' + f[1] + '</option>').join('') + '</select></div>' +
        '<div class="s-form-group"><label class="s-label">Current value</label><input class="s-input" id="amOld" disabled></div></div>' +
        '<div class="s-form-row"><div class="s-form-group"><label class="s-label">New value *</label><input class="s-input" id="amNew"></div>' +
        '<div class="s-form-group"><label class="s-label">Reason</label><input class="s-input" id="amWhy" placeholder="e.g. Moved house"></div></div>' +
        '<button class="s-btn s-btn-primary s-btn-sm" id="amGo">Submit for approval</button>' +
        '<div id="amErr" style="color:#B93636;font-size:0.8rem;margin-top:6px"></div>' +
        (myAmds.length ? '<div style="margin-top:10px">' + tbl(['Requested', 'Field', 'Change', 'Status', 'Decided by'],
          myAmds.map(a => [GF.dt(a.created_at), GF.esc(a.field.replace(/_/g, ' ')),
            '<span style="color:var(--s-muted)">' + GF.esc(a.old_value || '—') + '</span> → <strong>' + GF.esc(a.new_value) + '</strong>',
            GF.statusChip(a.status), a.decided_by ? GF.esc(a.decided_by) + '<br><span style="color:var(--s-muted);font-size:0.7rem">' + GF.dt(a.decided_at) + '</span>' : '—'])) + '</div>' : '')) +
      card('My payslips', tbl(['Period', 'Gross', 'Net', ''], slips.map(p => [GF.esc(p.period), GF.money(p.gross), '<strong>' + GF.money(p.net) + '</strong>',
        '<a class="s-btn s-btn-ghost s-btn-sm" href="payslip.html?id=' + p.id + '" style="text-decoration:none">Download</a>']))) +
      card('HR documents issued to me', myDocs.length ? tbl(['Document', 'Ref', 'Issued', ''], myDocs.map(d => [GF.esc(d.title), GF.esc(d.ref), GF.dt(d.sent_at), '<a class="s-btn s-btn-ghost s-btn-sm" href="hr-doc.html?id=' + d.id + '" style="text-decoration:none">Open</a>'])) : '<p style="color:var(--s-muted);font-size:0.83rem">None issued yet.</p>') +
      '</div></div>';
    const amCur = () => { const f = $('#amField').value; $('#amOld').value = (st[f] == null ? '' : String(st[f])); };
    amCur();
    $('#amField').onchange = amCur;
    $('#amGo').onclick = async () => {
      const nv = $('#amNew').value.trim();
      if (!nv) { $('#amErr').textContent = 'Enter the new value.'; return; }
      $('#amGo').textContent = 'Submitting…';
      const res = await GF.rpc('genfin_request_amendment', { p_actor: sess.name, p_staff: st.id, p_field: $('#amField').value, p_new: nv, p_reason: $('#amWhy').value.trim() || null });
      if (res && res.ok) location.reload();
      else { $('#amErr').textContent = (res && res.error) || 'Failed'; $('#amGo').textContent = 'Submit for approval'; }
    };
  }

  /* ============ RESTRICTED PORTAL (former staff) ============ */
  async function pageRestricted(sess) {
    const st = (await GF.table('genfin_staff', { eq: { id: sess.profile.id } }))[0] || sess.profile;
    const slips = await GF.table('genfin_payslips', { eq: { staff_id: st.id }, order: 'issued_at' });
    $('#gfApp').innerHTML =
      '<div class="s-login-page"><div class="s-login-card" style="max-width:640px">' +
      '<div class="s-login-logo"><img src="assets/genfin-logo.png" alt="GENFIN" width="160"></div>' +
      '<div class="s-login-title">Former staff portal</div>' +
      '<div class="s-alert s-alert-warn" style="margin:0.75rem 0;text-align:left">' +
      '<strong>' + GF.esc(st.full_name) + ', you are no longer employed by GENFIN Medical Aid Fund.</strong><br>' +
      '<span style="font-size:0.82rem">Employment: ' + GF.d(st.employment_date) + ' — ' + GF.d(st.termination_date) + '<br>' +
      'Reason recorded: <strong>' + GF.esc(st.termination_reason || '—') + '</strong></span></div>' +
      '<p style="font-size:0.82rem;color:var(--s-muted);text-align:left;margin-bottom:1rem">Your access is limited to the documents below. Your work reference letter confirms your role and dates of service only — it does not state the reason your employment ended. For queries contact hr@genfin.health.</p>' +
      '<div style="text-align:left;margin-bottom:1rem">' +
      '<a class="s-btn s-btn-primary" href="employment-letter.html" style="text-decoration:none">Download work reference letter</a></div>' +
      '<div style="text-align:left"><strong style="font-size:0.85rem">My payslips</strong>' +
      (slips.length ? slips.map(p => '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--s-border);font-size:0.83rem">' +
        '<span>' + GF.esc(p.period) + ' — net <strong>' + GF.money(p.net) + '</strong></span>' +
        '<a class="s-btn s-btn-ghost s-btn-sm" href="payslip.html?id=' + p.id + '" style="text-decoration:none">Download</a></div>').join('') :
        '<p style="font-size:0.8rem;color:var(--s-muted)">No payslips on record.</p>') + '</div>' +
      '<button class="s-btn s-btn-ghost" id="gfLogout" style="margin-top:1.25rem;width:100%">Log out</button>' +
      '</div></div>';
    wireLogout();
  }

  /* ============ DRIVER APP ============ */
  async function pageDriver(sess) {
    $('#gfApp').innerHTML = staffShell(sess, 'Driver app', 'driver-app'); wireLogout();
    return pageLogisticsBody(sess);
  }
  async function pageLogisticsBody(sess) {
    async function render() {
      const [deliveries, orders, drivers] = await Promise.all([
        GF.table('genfin_deliveries', { order: 'created_at', limit: 20 }),
        GF.table('genfin_orders', { limit: 50 }),
        GF.table('genfin_drivers')
      ]);
      const orderNo = {}; orders.forEach(o => orderNo[o.id] = o.order_no);
      const dname = {}; drivers.forEach(d => dname[d.id] = d.name);
      $('#gfBody').innerHTML = card('My delivery runs', tbl(['Order', 'Driver', 'Scheduled', 'Status', ''],
        deliveries.map(dl => [GF.esc(orderNo[dl.order_id] || ''), GF.esc(dname[dl.driver_id] || 'Unassigned'), GF.d(dl.scheduled_date), GF.statusChip(dl.status),
          dl.status === 'booked' ? '<button class="s-btn s-btn-primary s-btn-sm gf-dispatch" data-id="' + dl.id + '">Start run</button>' :
          dl.status === 'out_for_delivery' ? '<button class="s-btn s-btn-success s-btn-sm gf-deliver" data-id="' + dl.id + '">Delivered ✓</button>' : ''])));
      document.querySelectorAll('.gf-dispatch').forEach(b => b.onclick = async () => { await GF.rpc('genfin_dispatch', { p_delivery: b.dataset.id }); render(); });
      document.querySelectorAll('.gf-deliver').forEach(b => b.onclick = async () => { await GF.rpc('genfin_mark_delivered', { p_delivery: b.dataset.id }); render(); });
    }
    await render();
    setInterval(render, 8000);
  }

  /* ============ ROUTER ============ */
  document.addEventListener('DOMContentLoaded', async () => {
    if (PAGE === 'login') return pageLogin();
    if (PAGE === 'signup') return pageSignup();
    const guard = {
      dashboard: 'dashboard', inventory: 'staff-inventory', finance: 'staff-finance', hr: 'staff-hr',
      logistics: 'staff-logistics', driver: 'driver-app', portal: 'portal', shop: 'portal-pharmacy',
      'member-profile': 'member-profile', 'staff-profile': 'staff-profile', restricted: 'restricted', onboarding: 'onboarding',
      preauth: 'portal-preauth'
    }[PAGE];
    const sess = GF.requireAuth(guard);
    if (!sess) return;
    if (PAGE === 'dashboard') return pageDashboard(sess);
    if (PAGE === 'inventory') return pageInventory(sess);
    if (PAGE === 'finance') return pageFinance(sess);
    if (PAGE === 'hr') return pageHR(sess);
    if (PAGE === 'logistics') return pageLogistics(sess);
    if (PAGE === 'driver') return pageDriver(sess);
    if (PAGE === 'portal') return pagePortal(sess);
    if (PAGE === 'shop') return pageShop(sess);
    if (PAGE === 'member-profile') return pageMemberProfile(sess);
    if (PAGE === 'staff-profile') return pageStaffProfile(sess);
    if (PAGE === 'restricted') return pageRestricted(sess);
    if (PAGE === 'preauth') return pagePreauth(sess);
    if (PAGE === 'onboarding') return pageOnboarding(sess);
  });
})();
