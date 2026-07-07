/* GENFIN i18n — English / Shona / isiNdebele.
   First-pass translations for client review by native speakers before production sign-off.
   Usage: GFI18N.t('key') in JS renderers; data-i18n="key" on static elements; selector auto-injects. */
(function () {
  const D = {
    /* Navigation & chrome */
    'nav.home':        { en: 'Home', sn: 'Kumba', nd: 'Ekhaya' },
    'nav.plans':       { en: 'Plans', sn: 'Zvirongwa', nd: 'Izinhlelo' },
    'nav.benefits':    { en: 'Benefits', sn: 'Zvibatsiro', nd: 'Inzuzo' },
    'nav.members':     { en: 'Members', sn: 'Nhengo', nd: 'Amalunga' },
    'nav.employers':   { en: 'Employers', sn: 'Vashandirwi', nd: 'Abaqhatshi' },
    'nav.providers':   { en: 'Providers', sn: 'Varapi', nd: 'Abelaphi' },
    'nav.support':     { en: 'Support', sn: 'Rubatsiro', nd: 'Usizo' },
    'nav.login':       { en: 'Portal login', sn: 'Pinda muportal', nd: 'Ngena kuportal' },
    'nav.dashboard':   { en: 'Dashboard', sn: 'Dhashibhodhi', nd: 'Ideshibhodi' },
    'nav.hr':          { en: 'HR & Payroll', sn: 'Vashandi neMihoro', nd: 'Abasebenzi leHolo' },
    'nav.accounts':    { en: 'Accounts', sn: 'Mari neAkaunzi', nd: 'Izimali' },
    'nav.inventory':   { en: 'Inventory', sn: 'Zvakachengetwa', nd: 'Impahla' },
    'nav.logistics':   { en: 'Logistics', sn: 'Zvekutakura', nd: 'Ezokuthutha' },
    'nav.driver':      { en: 'Driver app', sn: 'App yemutyairi', nd: 'I-app yomtshayeli' },
    'nav.profile':     { en: 'My profile', sn: 'Nezvangu', nd: 'Imininingwane yami' },
    'nav.guides':      { en: 'Help & guides', sn: 'Rubatsiro nemagwaro', nd: 'Usizo lezikhokelo' },
    /* Auth */
    'auth.signin':     { en: 'Sign in', sn: 'Pinda', nd: 'Ngena' },
    'auth.signout':    { en: 'Log out', sn: 'Buda', nd: 'Phuma' },
    'auth.email':      { en: 'Email', sn: 'Imeyili', nd: 'I-imeyili' },
    'auth.password':   { en: 'Password', sn: 'Pasiwedhi', nd: 'Iphasiwedi' },
    'auth.title':      { en: 'Sign in to GENFIN', sn: 'Pinda muGENFIN', nd: 'Ngena kuGENFIN' },
    'auth.sub':        { en: 'Members, staff and administrators', sn: 'Nhengo, vashandi nevatungamiri', nd: 'Amalunga, abasebenzi labaphathi' },
    'auth.newstaff':   { en: 'New staff member?', sn: 'Mushandi mutsva?', nd: 'Isisebenzi esitsha?' },
    'auth.create':     { en: 'Create your staff account', sn: 'Vhura akaunti yako yebasa', nd: 'Vula i-akhawunti yakho yomsebenzi' },
    /* Member portal */
    'portal.welcome':  { en: 'Welcome back', sn: 'Mauya zvakare', nd: 'Wamukelekile futhi' },
    'portal.benefit':  { en: 'Annual benefit used', sn: 'Zvibatsiro zvegore zvashandiswa', nd: 'Inzuzo yomnyaka esetshenzisiwe' },
    'portal.order':    { en: 'Order meds & optical', sn: 'Odha mishonga nemagirazi', nd: 'Oda imithi lamangilazi' },
    'portal.ordersub': { en: 'Pharmacy and eyewear delivered to your door', sn: 'Mishonga nemagirazi zvinosvitswa pamba pako', nd: 'Imithi lamangilazi kulethwa emnyango wakho' },
    'portal.preauth':  { en: 'Pre-authorisation', sn: 'Mvumo yekutanga', nd: 'Imvumo yangaphambili' },
    'portal.preauthsub': { en: 'Request approval for specialist care', sn: 'Kumbira mvumo yekurapwa kwenyanzvi', nd: 'Cela imvumo yokwelatshwa yingcitshi' },
    'portal.profile':  { en: 'My profile & family', sn: 'Nezvangu nemhuri', nd: 'Imininingwane yami lemuli' },
    'portal.profilesub': { en: 'Personal details and dependants', sn: 'Ruzivo rwako nevanhu vaunochengeta', nd: 'Imininingwane yakho labondliwayo' },
    'portal.cert':     { en: 'Membership certificate', sn: 'Chitupa chenhengo', nd: 'Isitifiketi sobulunga' },
    'portal.certsub':  { en: 'Official policy documents', sn: 'Magwaro epamutemo', nd: 'Amaphepha asemthethweni' },
    'portal.schedule': { en: 'Benefit schedule', sn: 'Rondedzero yezvibatsiro', nd: 'Uhlelo lwenzuzo' },
    'portal.schedulesub': { en: 'Your 2026 limits in detail', sn: 'Miganhu yako ya2026 izere', nd: 'Imikhawulo yakho ka2026 ngokugcweleyo' },
    'portal.orders':   { en: 'My orders', sn: 'Maodha angu', nd: 'Ama-oda ami' },
    'portal.messages': { en: 'Messages & email receipts', sn: 'Mashoko nemarisiti eimeyili', nd: 'Imilayezo lamarisidi e-imeyili' },
    'portal.paynow':   { en: 'Pay now (EcoCash)', sn: 'Bhadhara izvozvi (EcoCash)', nd: 'Bhadala khathesi (EcoCash)' },
    'portal.back':     { en: '← Back to my portal', sn: '← Dzokera kuportal yangu', nd: '← Buyela kuportal yami' },
    /* Common */
    'common.live':     { en: '● Live', sn: '● Zviripo', nd: '● Kuyaphila' },
    'common.status':   { en: 'Status', sn: 'Mamiriro', nd: 'Isimo' },
    'common.total':    { en: 'Total', sn: 'Zvose', nd: 'Isamba' },
    'common.placeorder': { en: 'Place order', sn: 'Tumira odha', nd: 'Faka i-oda' },
    'common.language': { en: 'Language', sn: 'Mutauro', nd: 'Ulimi' }
  };

  const GFI18N = {
    lang: localStorage.getItem('genfin_lang') || 'en',
    t(key) {
      const e = D[key];
      if (!e) return key;
      return e[GFI18N.lang] || e.en;
    },
    setLang(l) {
      localStorage.setItem('genfin_lang', l);
      GFI18N.lang = l;
      location.reload();
    },
    apply() {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const k = el.getAttribute('data-i18n');
        if (D[k]) el.textContent = GFI18N.t(k);
      });
    },
    injectSelector() {
      if (document.getElementById('gfLang')) return;
      const d = document.createElement('div');
      d.id = 'gfLang';
      d.style.cssText = 'position:fixed;bottom:18px;left:18px;z-index:9998;background:#14141A;border:1px solid rgba(251,189,62,0.45);border-radius:999px;padding:5px 8px;display:flex;gap:2px;box-shadow:0 4px 14px rgba(20,20,26,0.3);font-family:Manrope,system-ui,sans-serif';
      [['en', 'EN'], ['sn', 'SN'], ['nd', 'ND']].forEach(([code, label]) => {
        const b = document.createElement('button');
        b.textContent = label;
        b.title = { en: 'English', sn: 'chiShona', nd: 'isiNdebele' }[code];
        b.style.cssText = 'border:none;cursor:pointer;font-weight:800;font-size:11px;padding:4px 9px;border-radius:999px;background:' +
          (GFI18N.lang === code ? '#FBBD3E' : 'transparent') + ';color:' + (GFI18N.lang === code ? '#14141A' : '#A6A5AF');
        b.onclick = () => GFI18N.setLang(code);
        d.appendChild(b);
      });
      document.body.appendChild(d);
    }
  };
  window.GFI18N = GFI18N;
  window.GT = GFI18N.t;
  document.addEventListener('DOMContentLoaded', () => { GFI18N.apply(); GFI18N.injectSelector(); });
})();
