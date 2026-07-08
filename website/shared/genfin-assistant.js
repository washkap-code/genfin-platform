/* GENFIN Assistant — conversational help for visitors, members and staff.
   Knowledge-base driven (no external AI calls: private, instant, works offline-ish).
   Trilingual for the most common questions; falls back to English elsewhere. */
(function () {
  const L = () => (window.GFI18N && GFI18N.lang) || 'en';
  const pick = (o) => (typeof o === 'string' ? o : (o[L()] || o.en));

  const KB = [
    { k: ['hello', 'hi ', 'hie', 'hey', 'mhoro', 'makadii', 'salibonani', 'sawubona', 'good morning', 'good afternoon'],
      a: { en: "Hello! I'm the GENFIN Assistant. I can help you choose a plan, sign up, use the member portal, or find your way around any staff module. What would you like to do?",
           sn: "Mhoro! Ndini Mubatsiri weGENFIN. Ndinogona kukubatsira kusarudza chirongwa, kunyoresa, kushandisa portal yenhengo, kana kukuratidza mabasa ese. Ungada kuitei?",
           nd: "Salibonani! NginguMsizi weGENFIN. Ngingakusiza ukukhetha uhlelo, ukubhalisa, ukusebenzisa iportal yelunga, kumbe ukukukhombisa yonke imisebenzi. Ufuna ukwenzani?" },
      c: ['How do I join GENFIN?', 'What do plans cost?', 'Help me order medication', 'Staff guides'] },

    { k: ['join', 'sign up', 'signup', 'become a member', 'register', 'kunyoresa', 'ukubhalisa', 'how do i get cover', 'get cover'],
      a: { en: "Joining is simple. Choose a general scheme — Vital ($20/month), Gold ($30/month) or Diamond ($50/month), each covering 2 people — and request a quote from the plans page. If you're a civil servant (teacher, ZPCS officer, government nurse, doctor or pensioner) you can join by SSB payroll deduction instead: Pioneer $16, Premium $21 or Prestige $26 per month. Shall I take you to the plans?",
           sn: "Kujoina kuri nyore. Sarudza chirongwa — Vital ($20 pamwedzi), Gold ($30) kana Diamond ($50), chimwe nechimwe chinofukidza vanhu 2. Kana uri mushandi wehurumende unogona kubhadhara neSSB: Pioneer $16, Premium $21 kana Prestige $26 pamwedzi. Ndokuendesa kuzvirongwa here?",
           nd: "Ukujoyina kulula. Khetha uhlelo — iVital ($20 ngenyanga), iGold ($30) kumbe iDiamond ($50), lunye ngalunye lugoqela abantu 2. Nxa uyisisebenzi sikahulumende ungabhadala ngeSSB: iPioneer $16, iPremium $21 kumbe iPrestige $26 ngenyanga. Ngikuse ezinhlelweni?" },
      links: [['See plans & get a quote', 'plans.html']], c: ['What do plans cost?', 'What benefits do I get?', 'Talk to support'] },

    { k: ['cost', 'price', 'how much', 'marii', 'yimalini', 'plan', 'scheme', 'package'],
      a: { en: "General schemes (each covers 2 people): Vital $20/month (+$5 per extra dependant), Gold $30/month (+$10), Diamond $50/month (+$15) — all government-hospital based. For civil servants on SSB payroll deduction: Pioneer $16/month (+$1.00 per dependant), Premium $21 (+$1.50), Prestige $26 (+$2.00), with private hospital treatment and no waiting period at GENFIN's private clinics.",
           sn: "Zvirongwa (chimwe nechimwe chinofukidza vanhu 2): Vital $20 pamwedzi (+$5 pamunhu wekuwedzera), Gold $30 (+$10), Diamond $50 (+$15). Vashandi vehurumende paSSB: Pioneer $16 (+$1.00), Premium $21 (+$1.50), Prestige $26 (+$2.00) — vanorapwa kuzvipatara zvedu private pasina kumirira.",
           nd: "Izinhlelo (lunye ngalunye lugoqela abantu 2): iVital $20 ngenyanga (+$5 ngomunye ondliwayo), iGold $30 (+$10), iDiamond $50 (+$15). Izisebenzi zikahulumende ngeSSB: iPioneer $16 (+$1.00), iPremium $21 (+$1.50), iPrestige $26 (+$2.00) — kwelatshwa emitholampilo yethu eyimfihlo kungela kulinda." },
      links: [['Compare every benefit', 'plans.html']], c: ['How do I join GENFIN?', 'What benefits do I get?'] },

    { k: ['ssb', 'civil servant', 'government employee', 'teacher', 'zpcs', 'pensioner', 'payroll deduction', 'government worker', 'pioneer', 'prestige scheme', 'premium scheme'],
      a: { en: "GENFIN for SSB is built for government teachers, ZPCS officers, government nurses, doctors and pensioners — your premium comes straight off your salary through SSB, no hassle. Three schemes, each covering 2 people: Pioneer $16/month (+$1.00 per extra dependant), Premium $21 (+$1.50) and Prestige $26 (+$2.00). All three cover consultations, treatment, hospitalisation and medication deliveries across the country, include private hospital treatment, and there's no waiting period at GENFIN's private clinics.",
           sn: "GENFIN yeSSB yakagadzirirwa vadzidzisi vehurumende, maZPCS officers, manesi, vanachiremba nevakapedza basa — mari inobviswa pamuhoro wako neSSB. Zvirongwa zvitatu, chimwe nechimwe chinofukidza vanhu 2: Pioneer $16 pamwedzi (+$1.00), Premium $21 (+$1.50), Prestige $26 (+$2.00). Zvose zvinofukidza kuonekwa nachiremba, kurapwa, kuvata muchipatara, nekutumirwa kwemishonga munyika yose — pasina kumirira pazvipatara zvedu private.",
           nd: "IGENFIN yeSSB yenzelwe abafundisi bakahulumende, ama-ZPCS officers, abongikazi, odokotela labasebenzi asebathatha umhlalaphansi — imali ikhutshwa eholweni lakho ngeSSB. Izinhlelo ezintathu, lunye ngalunye lugoqela abantu 2: iPioneer $16 ngenyanga (+$1.00), iPremium $21 (+$1.50), iPrestige $26 (+$2.00). Zonke zigoqela ukubonana lodokotela, ukwelatshwa, ukulala esibhedlela, lokulethelwa imithi elizweni lonke — kungela kulinda emitholampilo yethu." },
      links: [['See all schemes', 'plans.html']], c: ['What do plans cost?', 'How do I join GENFIN?'] },

    { k: ['benefit', 'what do i get', 'cover', 'zvibatsiro', 'inzuzo', 'limit'],
      a: "Gold Plan members, for example, get an overall $6,000 annual limit with unlimited network GP visits, a $120 wellness checkup, $1,200 specialist cover, $3,500 hospitalisation, $400 dental, optical with in-house eyewear, and chronic medication delivered nationwide. Every member sees their live benefit usage on the portal dashboard, and the full breakdown is in their Benefit Schedule document.",
      links: [['Benefits overview', 'benefits.html'], ['Member guide', 'guides.html#member']], c: ['How do I order medication?', 'What is pre-authorisation?'] },

    { k: ['log in', 'login', 'sign in', 'pinda', 'ngena', 'password', 'forgot'],
      a: { en: "Members, staff and administrators all sign in from the same page — you're routed to your own portal automatically based on your role. If your staff account says 'awaiting HR approval', the Head of HR hasn't approved it yet. In this demo, all accounts use the password demo2026.",
           sn: "Nhengo, vashandi nevatungamiri vese vanopinda papeji rimwe — unoendeswa kuportal yako zvichienderana nebasa rako. Mudemo ino, maakaunti ese anoshandisa pasiwedhi demo2026.",
           nd: "Amalunga, abasebenzi labaphathi bonke bangena ekhasini elilodwa — usiwa kuportal yakho ngokwesikhundla sakho. Kule demo, wonke ama-akhawunti asebenzisa iphasiwedi demo2026." },
      links: [['Sign in', 'login.html'], ['All portals on one page', 'login-select.html']], c: ['I am new staff — how do I get an account?'] },

    { k: ['order', 'medication', 'meds', 'glasses', 'optical', 'pharmacy', 'odha', 'mishonga', 'imithi', 'oda'],
      a: { en: "From your member portal, open 'Order meds & optical'. Every item shows live stock. Add what you need and place the order — the platform instantly confirms availability, raises your invoice, books a delivery driver and confirms your delivery date. Then pay from your dashboard with Pay now, and your receipt lands in your Messages with an email copy.",
           sn: "Kubva paportal yako, vhura 'Odha mishonga nemagirazi'. Chinhu chimwe nechimwe chinoratidza stock iripo. Isa zvaunoda wotumira odha — invoice inobva yagadzirwa, mutyairi obhukwa, uye zuva rekusvitsa rinosimbiswa. Wobhadhara ne'Pay now', risiti youya muMashoko ako.",
           nd: "Kuportal yakho, vula i-'Oda imithi lamangilazi'. Yonke into itshengisa impahla ekhona. Faka okudingayo uthumele i-oda — i-invoice iyenziwa, umtshayeli abhukwe, usuku lokulethwa luqinisekiswe. Ubusubhadala nge-'Bhadala khathesi', irisidi ifika kuMilayezo yakho." },
      links: [['Step-by-step ordering guide', 'guides.html#member']], c: ['How do I pay?', 'Where is my delivery?'] },

    { k: ['pay', 'payment', 'invoice', 'bhadhara', 'bhadala', 'ecocash', 'receipt'],
      a: "Unpaid invoices appear in a banner on your portal dashboard — press 'Pay now' and the payment posts instantly: your receipt arrives in Messages (portal alert plus email copy), your benefit usage updates, and on the finance side the ledger, cash position and stock all reconcile automatically. Staff can also record direct bank payments from the Accounts module.",
      links: [['Member guide', 'guides.html#member']], c: ['How do I order medication?', 'What is pre-authorisation?'] },

    { k: ['pre-auth', 'preauth', 'authorisation', 'authorization', 'mvumo', 'imvumo', 'specialist', 'hospital', 'mri', 'procedure approval'],
      a: "Pre-authorisation gets specialist care approved before you incur the cost. On your portal, open 'Pre-authorisation', choose the category, enter the provider, procedure and estimated cost — your remaining benefit shows right there. You receive a PA reference immediately, and the decision (with the assessor's note) arrives in your Messages and email. Administrators decide requests from the dashboard queue in real time.",
      links: [['Pre-auth guide', 'guides.html#member']], c: ['How long does approval take?', 'What benefits do I get?'] },

    { k: ['how long', 'approval take', 'when will i hear'],
      a: "In the live demo, decisions happen as soon as an assessor actions the dashboard queue — often within minutes. In production, GENFIN's service standard is same-day decisions for routine requests and immediate escalation for emergencies (for emergencies, call +263 867 700 4422, available 24/7).",
      c: ['What is pre-authorisation?', 'Talk to support'] },

    { k: ['certificate', 'chitupa', 'isitifiketi', 'policy document', 'schedule', 'documents'],
      a: "Your official documents live on your portal: the Membership Certificate (with a QR code anyone can scan to verify it's genuine) and your Schedule of Benefits with every 2026 limit. Both print beautifully or save to PDF. Staff have their own documents — a proof-of-employment letter and payslips — under My profile.",
      links: [['Member documents', 'guides.html#member']], c: ['How do I verify a certificate?'] },

    { k: ['verify a certificate', 'qr', 'scan'],
      a: "Point any phone camera at the QR code on a membership certificate — it opens GENFIN's verification page showing whether the certificate is valid, for which member number and benefit year. It's how providers and employers confirm cover in seconds.",
      c: ['Tell me about BioVerify'] },

    { k: ['bioverify', 'biometric', 'fingerprint', 'face', 'facial', 'camera'],
      a: "BioVerify stops card sharing: before dispensing, the person at the counter proves they're the enrolled member by face or fingerprint. You can try it now — enrolment at /bioverify-enrol (4 steps; the face capture uses your device camera, just allow access) and the counter terminal at /biometric/verify.html. Fingerprints are simulated in the demo; production adds certified USB scanners. Templates are encrypted and consent is recorded.",
      links: [['BioVerify guide', 'guides.html#bioverify'], ['Try enrolment', 'bioverify-enrol.html']], c: ['What device do I need for BioVerify?'] },

    { k: ['device do i need', 'what device', 'scanner', 'hardware'],
      a: "For the demo: any laptop, phone or tablet with a camera and a modern browser — nothing else. When the browser asks to use the camera, choose Allow. For production counters, each verification point adds one USB fingerprint scanner (SecuGen Hamster Pro 20, DigitalPersona U.are.U 4500 or Futronic FS88H class, roughly $60–120), while face verification keeps using the standard camera.",
      c: ['Tell me about BioVerify'] },

    { k: ['new staff', 'staff account', 'work here', 'employment', 'onboard', 'application'],
      a: "Welcome aboard! Choose 'Create your staff account' on the sign-in page and enter your personal details, position and proposed start date. Your account activates once the Head of HR approves you and assigns your role — the role decides exactly which modules you can open. You'll find your employment letter and payslips under My profile once approved.",
      links: [['Apply now', 'staff-signup.html'], ['Staff guide', 'guides.html#staff-start']], c: ['How do HR approvals work?', 'Where are my payslips?'] },

    { k: ['hr approval', 'approve staff', 'hr module', 'how do hr'],
      a: "HR sees every pending application at the top of the HR & Payroll module with the applicant's full details. Approving means assigning a role and confirming the employment date — and the HR log permanently records who approved and when. Rejections are logged the same way. This audit trail is what keeps onboarding accountable.",
      links: [['HR guide', 'guides.html#hr']], c: ['How does offboarding work?', 'How do I run payroll?'] },

    { k: ['payroll', 'payslip', 'salary', 'mihoro', 'iholo', 'wages'],
      a: "HR presses 'Run payroll' for the month: payslips are issued to every approved staff member and the payroll journal posts straight to the ledger. Each staff member downloads their own payslips — on official GENFIN letterhead — from My profile. Former staff keep access to their payslips through the restricted portal.",
      links: [['Payroll guide', 'guides.html#hr']], c: ['How does offboarding work?'] },

    { k: ['offboard', 'terminate', 'dismiss', 'fired', 'let go', 'leave the company', 'resignation'],
      a: "Offboarding is built to be lawful and kind. HR selects a reason from a fixed list aligned to Zimbabwe's Labour Act — each option names the due process it presumes, which must be completed first. The moment someone is offboarded their access is restricted to a former-staff portal where they can still download payslips and a Work Reference Letter that states only their dates of service and role — never the reason.",
      links: [['Offboarding guide', 'guides.html#hr']], c: ['How do HR approvals work?'] },

    { k: ['delivery', 'driver', 'where is my order', 'track', 'dispatch', 'kusvitsa', 'ukulethwa'],
      a: "When you place an order, the next available registered driver is booked automatically and you're given a delivery date right away. Logistics staff dispatch the run, and the driver confirms delivery from the Driver app — you get a portal message the moment it's done. If all drivers are out, your order queues for the next available slot.",
      links: [['Logistics guide', 'guides.html#logistics']], c: ['How do I order medication?'] },

    { k: ['finance', 'ledger', 'accounts module', 'trial balance', 'accounting', 'books', 'journal', 'clerk', 'make an entry', 'entries'],
      a: "The Accounts module is a true double-entry ledger. Click any account to open its full ledger with a running balance and who posted each entry. Accounts clerks post manual journal entries with '+ New journal entry' — quick templates fill in every related line automatically (rent, premiums received, supplier payments, bank charges and more), and an entry only posts when debits equal credits. System events (orders, payments, payroll) post themselves. Everything is tagged manual or auto with the poster's name, and the trial balance must always read 'Balanced'.",
      links: [['Finance guide', 'guides.html#finance']], c: ['How does inventory stay accurate?'] },

    { k: ['inventory', 'stock', 'impahla', 'reorder'],
      a: "Inventory shows live quantities, reorder alerts and values for pharmacy and optical stock — and the total always matches ledger account 1200. Stock only deducts when an order is actually paid, and every movement carries the invoice reference, so any auditor can trace any quantity change to its source.",
      links: [['Inventory guide', 'guides.html#inventory']], c: ['Tell me about the finance module'] },

    { k: ['who is online', 'monitor', 'presence', 'logged in', 'dashboard'],
      a: "The Enterprise Dashboard gives administrators a realtime activity feed of every event across all modules, KPI cards (cash, unpaid invoices, stock alerts, staff online), the pre-authorisation decision queue, and 'Who is logged in' — every session with role and last-seen, a green dot meaning active in the last two minutes. That's your staff monitoring view.",
      links: [['Dashboard guide', 'guides.html#dashboard']], c: ['What is pre-authorisation?'] },

    { k: ['language', 'shona', 'ndebele', 'mutauro', 'ulimi', 'translate'],
      a: { en: "You can switch the platform between English, chiShona and isiNdebele using the EN / SN / ND buttons at the bottom-left of any page. Your choice is remembered. I'll answer common questions in your chosen language too.",
           sn: "Unogona kuchinja mutauro pakati peChirungu, chiShona neisiNdebele uchishandisa mabhatani EN / SN / ND ari pasi kuruboshwe. Sarudzo yako inochengetwa.",
           nd: "Ungantshintsha ulimi phakathi kwesiNgisi, isiShona lesiNdebele usebenzisa izinkinobho EN / SN / ND ezingezansi kwesokunxele. Ukukhetha kwakho kuyagcinwa." },
      c: ['How do I join GENFIN?'] },

    { k: ['support', 'contact', 'phone', 'talk to', 'human', 'help me', 'rubatsiro', 'usizo', 'emergency'],
      a: { en: "You can reach the GENFIN team on +263 867 700 4400, email info@genfin.health, or the Support page. For medical emergencies call +263 867 700 4422 — that line is answered 24/7.",
           sn: "Batai timu yeGENFIN pa +263 867 700 4400, imeyili info@genfin.health, kana peji reRubatsiro. Pane njodzi yekurwara batai +263 867 700 4422 — inodairwa awa 24 pazuva.",
           nd: "Thinta ithimu yeGENFIN ku +263 867 700 4400, i-imeyili info@genfin.health, kumbe ikhasi loSizo. Nxa kuyisimo esiphuthumayo shayela +263 867 700 4422 — iphendulwa amahora angu-24." },
      links: [['Support page', 'support.html']], c: ['How do I join GENFIN?'] },

    { k: ['guide', 'guides', 'manual', 'how to use', 'documentation', 'instructions'],
      a: "There's a full set of user guides built into the platform — one section for every module, for visitors, members and staff alike, with step-by-step instructions and troubleshooting. I can also answer specific questions right here.",
      links: [['Open the user guides', 'guides.html']], c: ['Member portal guide', 'Staff guides'] },

    { k: ['member portal guide'], a: "The member guide covers signing in, reading your dashboard, ordering meds and optical with live stock, paying and receipts, pre-authorisation, and your official documents.", links: [['Open member guide', 'guides.html#member']], c: ['How do I order medication?'] },
    { k: ['staff guides', 'staff guide'], a: "Staff guides cover getting your account, plus a section per module: HR & payroll (approvals, payroll runs, lawful offboarding), Finance, Inventory, Logistics & the Driver app, and the Enterprise Dashboard with presence monitoring.", links: [['Open staff guides', 'guides.html#staff-start']], c: ['How do HR approvals work?', 'Tell me about the finance module'] },

    { k: ['demo', 'test account', 'credentials'],
      a: "Demo accounts (password demo2026): member@genfin.demo (member), admin@genfin.demo (super administrator), hr@genfin.demo, finance@genfin.demo, pharmacy@genfin.demo, and tarisai.former@genfin.demo to see the restricted former-staff portal. The portal hub page shows every portal side by side.",
      links: [['Portal access hub', 'login-select.html']], c: ['Staff guides', 'Member portal guide'] },

    { k: ['thank', 'thanks', 'ndatenda', 'ngiyabonga', 'great', 'awesome'],
      a: { en: "You're very welcome! I'm here whenever you need me — just tap the gold button. Is there anything else I can help you with?",
           sn: "Munotendwa! Ndiripano nguva dzose — dzvanya bhatani regoridhe. Pane chimwe chandingakubatsira nacho here?",
           nd: "Wamukelekile! Ngilapha ngaso sonke isikhathi — cindezela inkinobho yegolide. Kukhona okunye engingakusiza ngakho?" },
      c: ['How do I join GENFIN?', 'Open the user guides'] }
  ];

  const FALLBACK = {
    en: "I want to make sure you get exactly the right answer. Could you tell me a little more — or pick one of the topics below? You can also browse the full user guides, or reach our team on +263 867 700 4400.",
    sn: "Ndinoda kuve nechokwadi chekuti wawana mhinduro chaiyo. Ungatsanangura zvishoma here — kana kusarudza imwe yenyaya dziri pasi apa? Unogonawo kuverenga magwaro erubatsiro, kana kubata timu yedu pa +263 867 700 4400.",
    nd: "Ngifuna ukuqiniseka ukuthi uthola impendulo eqondileyo. Ungachaza kancane — kumbe ukhethe esinye sezihloko ezingezansi? Ungakhangela lezikhokelo ezigcweleyo, kumbe uthinte ithimu yethu ku +263 867 700 4400."
  };
  const FALLBACK_CHIPS = ['How do I join GENFIN?', 'Help me order medication', 'Staff guides', 'Talk to support'];

  function answer(q) {
    const s = ' ' + q.toLowerCase() + ' ';
    let best = null, score = 0;
    for (const e of KB) {
      let sc = 0;
      for (const k of e.k) if (s.includes(k.toLowerCase())) sc += k.length > 4 ? 2 : 1;
      if (sc > score) { score = sc; best = e; }
    }
    if (!best || score === 0) return { text: pick(FALLBACK), links: [['Open the user guides', 'guides.html']], chips: FALLBACK_CHIPS };
    return { text: pick(best.a), links: best.links || [], chips: best.c || [] };
  }

  /* ---- UI ---- */
  function el(tag, css, html) { const e = document.createElement(tag); if (css) e.style.cssText = css; if (html != null) e.innerHTML = html; return e; }

  function boot() {
    if (document.getElementById('gfAsstBtn')) return;
    const FONT = "font-family:Manrope,'Segoe UI',system-ui,sans-serif;";
    const btn = el('button', 'position:fixed;bottom:18px;right:18px;z-index:9999;width:56px;height:56px;border-radius:50%;border:2px solid #FBBD3E;background:#14141A;cursor:pointer;box-shadow:0 6px 20px rgba(20,20,26,0.35);display:flex;align-items:center;justify-content:center',
      '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#FBBD3E" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>');
    btn.id = 'gfAsstBtn'; btn.title = 'GENFIN Assistant';
    const panel = el('div', FONT + 'position:fixed;bottom:84px;right:18px;z-index:9999;width:min(370px,calc(100vw - 36px));height:min(540px,calc(100vh - 120px));background:#fff;border-radius:16px;box-shadow:0 18px 50px rgba(20,20,26,0.3);display:none;flex-direction:column;overflow:hidden;border:1px solid #E1E0E5');
    panel.id = 'gfAsstPanel';
    panel.innerHTML =
      '<div style="background:#14141A;padding:12px 16px;display:flex;align-items:center;gap:10px;border-bottom:2px solid #FBBD3E">' +
      '<img src="assets/genfin-logo.png" alt="" style="height:26px" onerror="this.style.display=\'none\'">' +
      '<div><div style="color:#fff;font-weight:800;font-size:13px">GENFIN Assistant</div>' +
      '<div style="color:#A6A5AF;font-size:10px">Answers in EN · SN · ND — here to help</div></div>' +
      '<button id="gfAsstClose" style="margin-left:auto;background:none;border:none;color:#A6A5AF;font-size:18px;cursor:pointer">×</button></div>' +
      '<div id="gfAsstMsgs" style="flex:1;overflow-y:auto;padding:14px;background:#F7F7F9"></div>' +
      '<div id="gfAsstChips" style="padding:0 12px 8px;background:#F7F7F9;display:flex;flex-wrap:wrap;gap:6px"></div>' +
      '<form id="gfAsstForm" style="display:flex;gap:8px;padding:10px;border-top:1px solid #E1E0E5;background:#fff">' +
      '<input id="gfAsstIn" placeholder="Ask me anything…" style="' + FONT + 'flex:1;border:1px solid #CAC9D1;border-radius:10px;padding:9px 12px;font-size:13px;outline-color:#FBBD3E">' +
      '<button style="background:#FBBD3E;border:none;border-radius:10px;padding:9px 14px;font-weight:800;font-size:13px;color:#14141A;cursor:pointer">➤</button></form>';
    document.body.appendChild(btn); document.body.appendChild(panel);

    const msgs = panel.querySelector('#gfAsstMsgs');
    const chipsBox = panel.querySelector('#gfAsstChips');

    function bubble(text, mine, links) {
      const b = el('div', 'max-width:85%;margin-bottom:10px;padding:10px 13px;border-radius:14px;font-size:12.5px;line-height:1.55;white-space:pre-wrap;' +
        (mine ? 'background:#14141A;color:#fff;margin-left:auto;border-bottom-right-radius:4px' : 'background:#fff;color:#33323A;border:1px solid #E1E0E5;border-bottom-left-radius:4px'));
      b.textContent = text;
      if (!mine && links && links.length) {
        links.forEach(([label, href]) => {
          const a = document.createElement('a');
          a.href = href; a.textContent = label + ' →';
          a.style.cssText = 'display:block;margin-top:8px;color:#A6650A;font-weight:800;font-size:12px;text-decoration:none';
          b.appendChild(a);
        });
      }
      msgs.appendChild(b); msgs.scrollTop = msgs.scrollHeight;
    }
    function setChips(chips) {
      chipsBox.innerHTML = '';
      (chips || []).slice(0, 4).forEach(c => {
        const b = el('button', 'border:1px solid #CAC9D1;background:#fff;border-radius:999px;padding:5px 11px;font-size:11px;font-weight:700;color:#33323A;cursor:pointer', c);
        b.onclick = () => ask(c);
        chipsBox.appendChild(b);
      });
    }
    function ask(q) {
      bubble(q, true);
      setChips([]);
      setTimeout(() => { const r = answer(q); bubble(r.text, false, r.links); setChips(r.chips); }, 350);
    }

    let opened = false;
    btn.onclick = () => {
      const open = panel.style.display !== 'flex';
      panel.style.display = open ? 'flex' : 'none';
      if (open && !opened) {
        opened = true;
        const r = answer('hello');
        bubble(r.text, false, r.links); setChips(r.chips);
      }
    };
    panel.querySelector('#gfAsstClose').onclick = () => { panel.style.display = 'none'; };
    panel.querySelector('#gfAsstForm').onsubmit = (e) => {
      e.preventDefault();
      const v = panel.querySelector('#gfAsstIn').value.trim();
      if (!v) return;
      panel.querySelector('#gfAsstIn').value = '';
      ask(v);
    };
  }
  document.addEventListener('DOMContentLoaded', boot);
})();
