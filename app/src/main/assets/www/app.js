/* RoomMitra – app logic (Supabase backend के साथ) */
(function(){
'use strict';
const { auth, db, storage, enc } = window.RM_API;
const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.karan.roommitra';

/* ================= local storage ================= */
const LS = {
  get(k, d){ try{ const v = localStorage.getItem('rm_'+k); return v==null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem('rm_'+k, JSON.stringify(v)); }catch(e){} },
  del(k){ try{ localStorage.removeItem('rm_'+k); }catch(e){} }
};
// पुराने डेमो वर्ज़न का लोकल डेटा साफ करें
if (LS.get('ver', 0) !== RM_DATA_VERSION){ ['user','mine','favs','chats','prefs'].forEach(LS.del); LS.set('ver', RM_DATA_VERSION); }

/* ================= state ================= */
const S = {
  city: LS.get('city', RM_CITIES[0].id),
  me: LS.get('me', null),          // मेरी प्रोफाइल (rpc me)
  favs: new Set(),
  cityList: {},                    // city -> [listings]
  byId: new Map(),
  mine: null, favList: null, convs: null, adminList: null, reports: null, adminStats: null,
  msgs: {},                        // conversation -> [messages]
  unread: 0,
  config: { premium_enabled:false, free_listing_limit:3, support_email: RM_SUPPORT_EMAIL },
  plans: null,
  q:'', chip:'all', sort:'feat', cat:null, f: freshFilter(),
  draft: null, busy:false, viewed: new Set(), msgTab:'all', adminTab:'pending'
};
if (!RM_CITIES.some(c => c.id === S.city)) S.city = RM_CITIES[0].id;
function freshFilter(){ return {min:1000, max:25000, loc:'', rooms:0, type:'', amen:[], verified:false, women:false, girls:false, now:false}; }
const loggedIn = () => !!auth.user;
const uid = () => auth.user && auth.user.id;

/* ================= helpers ================= */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rs = n => '₹' + Number(n||0).toLocaleString('en-IN');
const areaHi = a => RM_AREA_HI[a] || a;
const cityHi = c => (RM_CITIES.find(x => x.id === c) || {}).hi || c;
const placeHi = l => `${esc(areaHi(l.area))}, ${esc(cityHi(l.city))}`;
const placeEn = l => `${esc(l.area)}, ${esc(l.city)}`;
const amenity = id => RM_AMENITIES.find(x => x.id === id);
const isFeatured = l => l.featured_until && new Date(l.featured_until) > new Date();
const isPremium = p => p && p.premium_until && new Date(p.premium_until) > new Date();
function toast(t){ const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('show'), 2600); }
const Native = window.RMNative || null;
function openUrl(u){ if (Native && Native.openExternal) Native.openExternal(u); else window.open(u, '_blank'); }
function mapsUrl(q){ return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q + ', ' + RM_REGION); }
function since(d){
  if (!d) return '';
  const days = Math.floor((Date.now() - new Date(d)) / 864e5);
  if (days < 1) return 'आज से सदस्य'; if (days < 31) return days + ' दिन से सदस्य';
  if (days < 365) return Math.floor(days/30) + ' महीने से सदस्य'; return Math.floor(days/365) + ' साल से सदस्य';
}
function ago(d){
  const t = new Date(d), now = new Date(), m = Math.floor((now - t)/6e4);
  if (m < 1) return 'अभी'; if (m < 60) return m + ' मिनट पहले';
  const hm = t.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true}).toUpperCase();
  if (t.toDateString() === now.toDateString()) return 'आज ' + hm;
  const y = new Date(now); y.setDate(now.getDate()-1);
  if (t.toDateString() === y.toDateString()) return 'कल ' + hm;
  return t.toLocaleDateString('hi-IN', {day:'numeric', month:'short'});
}
const timeOf = d => new Date(d).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true}).toUpperCase();

/* ================= data loading ================= */
const LIST_SELECT = 'select=*,owner:profiles!listings_owner_id_fkey(name,avatar_url,created_at,premium_until)';
const fresh = {}, busy = {}, errs = {};
function remember(rows){ (rows||[]).forEach(l => S.byId.set(l.id, l)); return rows || []; }
/* key: क्या लोड करना है, ttl: कितनी देर तक दोबारा न लाएँ */
function want(key, ttl, fn){
  if (busy[key]) return;
  if (fresh[key] && Date.now() - fresh[key] < ttl) return;
  busy[key] = true;
  Promise.resolve().then(fn).then(() => { delete errs[key]; }, e => { errs[key] = e.message || 'त्रुटि'; })
    .finally(() => { fresh[key] = Date.now(); busy[key] = false; rerender(); });
}
function refetch(...keys){ keys.forEach(k => { delete fresh[k]; }); }
const L = {
  config: async () => {
    const [cfg, plans] = await Promise.all([db.select('app_config','select=key,value'), db.select('plans','select=*&order=sort')]);
    cfg.forEach(r => { S.config[r.key] = r.value; });
    S.plans = plans;
  },
  city: c => async () => {
    S.cityList[c] = remember(await db.select('listings',
      `${LIST_SELECT}&city=eq.${enc(c)}&status=eq.active&order=featured_until.desc.nullslast,created_at.desc&limit=300`));
  },
  listing: id => async () => { remember(await db.select('listings', `${LIST_SELECT}&id=eq.${enc(id)}`)); },
  favIds: async () => { S.favs = new Set((await db.select('favorites','select=listing_id')).map(r => r.listing_id)); },
  favList: async () => {
    await L.favIds();
    const ids = [...S.favs];
    S.favList = ids.length ? remember(await db.select('listings', `${LIST_SELECT}&id=in.(${ids.map(enc).join(',')})`)) : [];
  },
  mine: async () => { S.mine = remember(await db.select('listings', `${LIST_SELECT}&owner_id=eq.${uid()}&order=created_at.desc`)); },
  me: async () => { S.me = await db.rpc('me'); LS.set('me', S.me); },
  convs: async () => { S.convs = await db.rpc('my_conversations'); S.unread = S.convs.reduce((a,c) => a + Number(c.unread||0), 0); },
  unread: async () => { S.unread = Number(await db.rpc('unread_count')) || 0; },
  admin: async () => {
    const [list, reps, stats] = await Promise.all([
      db.select('listings', `${LIST_SELECT}&order=created_at.desc&limit=300`),
      db.select('reports', 'select=id,reason,created_at,status,listing:listings(id,title,city,area,status)&status=eq.open&order=created_at.desc'),
      db.rpc('admin_stats')]);
    S.adminList = remember(list); S.reports = reps; S.adminStats = stats;
  }
};

/* ================= router ================= */
let depth = 0;
function go(h){ depth++; location.hash = h; }
function back(){ if (closeSheet()) return true; if (depth > 0){ depth--; history.back(); return true; } if (route().name !== 'home'){ location.replace('#home'); return true; } return false; }
window.rmBack = () => back();
function route(){ const h = decodeURIComponent(location.hash.slice(1)) || 'home'; const i = h.indexOf('/'); return i < 0 ? {name:h, arg:''} : {name:h.slice(0,i), arg:h.slice(i+1)}; }
const NEED_LOGIN = ['post','dash','msgs','chat','profile','fav','admin'];
function needLogin(next){ go('login/' + encodeURIComponent(next || location.hash.slice(1) || 'home')); }
let lastRoute = '';
function render(keepScroll){
  const r = route(), key = r.name + '/' + r.arg;
  if (NEED_LOGIN.includes(r.name) && !loggedIn()){ location.replace('#login/' + encodeURIComponent(location.hash.slice(1))); return; }
  if (Native && Native.setLightStatus) Native.setLightStatus(r.name === 'login');
  const y = window.scrollY;
  const fn = SCREENS[r.name] || SCREENS.home;
  $('#app').innerHTML = fn(r.arg);
  if (keepScroll && key === lastRoute) window.scrollTo(0, y); else { window.scrollTo(0, 0); setTimeout(() => window.scrollTo(0, 0), 0); }
  lastRoute = key;
  (AFTER[r.name] || (()=>{}))(r.arg);
}
/* data आने पर स्क्रीन दोबारा बनाएँ — पर फॉर्म भरते समय नहीं */
function rerender(){
  const n = route().name;
  if (n === 'login' || (n === 'post' && S.draft && S.draft._ready)) { updateBadges(); return; }
  if (n === 'chat'){ updateChat(); return; }
  if (n === 'filter'){ updRange(); return; }
  render(true);
}
window.addEventListener('hashchange', () => render(false));
window.addEventListener('rm-logout', () => { resetUser(); toast('सेशन खत्म हुआ — दोबारा लॉगिन करें'); location.replace('#home'); });
function resetUser(){ S.me = null; LS.del('me'); S.favs = new Set(); S.mine = S.favList = S.convs = S.adminList = null; S.unread = 0; S.msgs = {}; refetch('favIds','favList','mine','convs','unread','me','admin'); }

/* ================= shared UI pieces ================= */
function nav(active){
  const it = (id, h, label, icon) => `<button class="${active===id?'on':''}" data-go="${h}">${ic(icon, 'fillable')}<span>${label}</span></button>`;
  return `<nav class="nav">
    ${it('home','home','होम','home')}${it('search','search','खोज','search')}
    <button data-go="post" class="${active==='post'?'on':''}"><span class="plus">${ic('plus')}</span><span>लिस्ट करें</span></button>
    ${it('fav','fav','पसंदीदा','heart')}
    <button class="${active==='msgs'?'on':''}" data-go="msgs"><span class="bdg" id="navbdg" ${S.unread?'':'hidden'}>${S.unread}</span>${ic('chat')}<span>संदेश</span></button>
  </nav>`;
}
function updateBadges(){ const b = $('#navbdg'); if (b){ b.textContent = S.unread; b.hidden = !S.unread; } }
function brand(sub){ return `<div class="brand">${LOGO()}<div><div class="name">Room<b>Mitra</b></div><div class="slogan">${sub||'कमरा ढूँढना हुआ आसान।'}</div></div></div>`; }
function topbar(title, right=''){ return `<header class="hdr"><div class="row backrow"><button class="ibtn" data-act="back">${ic('back')}</button>${brand(title)}${right}</div></header>`; }
function meBtn(){ const a = S.me && S.me.avatar_url; return `<button class="ibtn solid av-btn" data-act="me">${a ? `<img src="${esc(a)}" alt="">` : ic('user')}</button>`; }
function heartBtn(l, cls='heart'){ const on = S.favs.has(l.id); return `<button class="${cls} ${on?'on':''}" data-fav="${l.id}" aria-label="पसंदीदा">${ic('heart')}</button>`; }
const loader = (t='लोड हो रहा है...') => `<div class="empty"><div class="spin"></div>${t}</div>`;
const errBox = (key) => `<div class="empty">${ic('info')}<b>लोड नहीं हो सका</b>${esc(errs[key])}<br><br><button class="btn pri sm" data-retry="${esc(key)}">${ic('refresh')} फिर कोशिश करें</button></div>`;
function specLine(l){
  const flat = l.ptype === 'flat' || l.ptype === 'house';
  const first = flat ? `${ic('home')}${esc(l.kind)}` : `${ic('bed')}${l.ptype==='pg' ? 'PG' : esc(l.kind==='Room'?'1 Room':l.kind)}`;
  return `<div class="meta"><span>${first}</span><span>${ic('bath')}${l.baths} Bathroom</span>${l.sqft?`<span>${ic('size')}${l.sqft} sq ft</span>`:''}${l.floor?`<span>${ic('building')}${esc(l.floor)}</span>`:''}</div>`;
}
const featTag = l => isFeatured(l) ? `<span class="feat">${ic('star','f')} फीचर्ड</span>` : '';
function roomCard(l){
  return `<div class="rc" data-open="${l.id}">
    <div class="ph"><img src="${esc(l.images[0])}" alt="" loading="lazy"><span class="price">${rs(l.price)}/माह</span>${heartBtn(l)}${featTag(l)}</div>
    <div class="bd"><h4>${esc(l.title)}</h4><div class="loc">${ic('pin')}${placeHi(l)}</div>
      <div class="meta"><span>${ic('bed')}${l.rooms} Room</span><span>${ic('bath')}${l.baths} Bathroom</span>${l.verified?`<span class="vtxt">${ic('checkc')}सत्यापित</span>`:''}</div>
    </div></div>`;
}
function listCard(l, mode='search'){
  const amen = (l.amenities||[]).slice(0,5).map(a => (amenity(a)||{}).hi).filter(Boolean).join(', ');
  const st = l.status === 'active' ? ['सक्रिय',''] : l.status === 'paused' ? ['रुकी हुई','off'] : ['छिपाई गई (एडमिन)','off'];
  return `<div class="lc" data-open="${l.id}">
    <div class="ph"><img src="${esc(l.images[0])}" alt="" loading="lazy">
      ${mode==='dash'||mode==='admin' ? `<span class="status ${st[1]}">${st[0]}</span>` : heartBtn(l)}
      <span class="cnt">${ic('camera')}${l.images.length}</span></div>
    <div class="bd">
      <div class="top"><h4>${esc(l.title)}</h4><span class="pill">${rs(l.price)}/माह</span></div>
      <div class="loc">${ic('pin')}${placeHi(l)}</div>
      ${specLine(l)}
      <div>${featTag(l)}${l.verified?`<span class="tag">${ic('checkc')} सत्यापित</span>`:''}${mode!=='search'&&mode!=='admin'?'':''}</div>
      ${mode==='search' ? `<div class="desc">${esc(l.description)}</div>
        <div class="acts"><button class="btn pri" data-call="${l.id}">${ic('phone')}कॉल करें</button><button class="btn out wa" data-wa="${l.id}">${WA}WhatsApp</button></div>` : ''}
      ${mode==='fav' ? `<div class="desc">${esc(amen)}</div>` : ''}
      ${mode==='dash' ? `<div class="meta"><span>${ic('eye')}${l.views} व्यूज़</span>${l.verified?'':`<span>${ic('clock')}सत्यापन बाकी</span>`}</div>
        <div class="oacts">${l.status==='hidden' ? '' : `<button data-toggle="${l.id}">${ic(l.status==='paused'?'eye':'lock')}${l.status==='paused'?'चालू करें':'रोकें'}</button>`}
        <button data-edit="${l.id}">${ic('edit')}बदलें</button><button class="del" data-del="${l.id}">${ic('trash')}हटाएं</button></div>` : ''}
      ${mode==='admin' ? `<div class="meta"><span>${ic('user')}${esc(l.contact_name)}</span><span>${ic('phone')}${esc(l.contact_phone)}</span><span>${ic('eye')}${l.views}</span></div>
        <div class="oacts wrapacts">
          <button data-adm="verify:${l.id}">${ic('checkc')}${l.verified?'सत्यापन हटाएं':'सत्यापित करें'}</button>
          <button data-adm="feature:${l.id}">${ic('star')}${isFeatured(l)?'फीचर हटाएं':'7 दिन फीचर'}</button>
          <button data-adm="hide:${l.id}">${ic(l.status==='hidden'?'eye':'lock')}${l.status==='hidden'?'दिखाएं':'छिपाएं'}</button>
          <button class="del" data-del="${l.id}">${ic('trash')}हटाएं</button></div>` : ''}
    </div></div>`;
}

/* ================= screens ================= */
const SCREENS = {}, AFTER = {};

/* ---------- HOME ---------- */
const CATS = [
  {id:'single', hi:'सिंगल रूम', ic:'bed'}, {id:'double', hi:'शेयरिंग', ic:'users'}, {id:'pg', hi:'पीजी', ic:'home'},
  {id:'flat', hi:'फ्लैट', ic:'building'}, {id:'boys', hi:'लड़कों के लिए', ic:'user'}, {id:'girls', hi:'लड़कियों के लिए', ic:'girl'}
];
function catMatch(l, c){
  switch(c){
    case 'single': return l.rooms === 1 && l.ptype !== 'flat' && l.ptype !== 'pg';
    case 'double': return l.ptype === 'pg' || l.rooms >= 2;
    case 'pg': return l.ptype === 'pg';
    case 'flat': return l.ptype === 'flat' || l.ptype === 'house';
    case 'boys': return l.gender === 'boys';
    case 'girls': return l.gender === 'girls';
    default: return true;
  }
}
SCREENS.home = () => {
  const list = S.cityList[S.city];
  const featured = list ? (list.filter(isFeatured).length ? list.filter(isFeatured) : list).slice(0, 8) : [];
  const latest = list ? list.filter(l => !featured.includes(l)).slice(0, 10) : [];
  const ckey = 'city:' + S.city;
  return `<div class="screen">
  <header class="hdr tall">${PLANT}
    <div class="row">${brand()}
      <button class="citybtn" data-act="city">${ic('pin')}<span>${esc(cityHi(S.city))}</span>${ic('down')}</button>${meBtn()}</div>
    <h2>अपना नया कमरा खोजें</h2><div class="lead">नाहन • पांवटा साहिब • शिमला • सोलन</div>
  </header>
  <div class="wrap pull"><form class="search" data-form="homesearch">${ic('search')}
    <input name="q" placeholder="इलाका, कॉलेज या प्रॉपर्टी का नाम खोजें..." autocomplete="off">
    <button type="button" class="fbtn" data-go="filter">${ic('sliders')}</button></form></div>
  <div class="cats">${CATS.map(c => `<button class="cat" data-cat="${c.id}"><span class="ic">${ic(c.ic)}</span>${c.hi}</button>`).join('')}</div>
  ${!list ? (errs[ckey] ? errBox(ckey) : `<div class="wrap sec"><h3>${esc(cityHi(S.city))} में कमरे</h3></div><div class="hs">${'<div class="rc skel"></div>'.repeat(2)}</div>`) :
    list.length === 0 ? `<div class="emptybig">${ic('houseplus')}<b>${esc(cityHi(S.city))} में अभी कोई लिस्टिंग नहीं है</b>
       <p>RoomMitra अभी शुरू हुआ है। अगर आपके पास किराए का कमरा है, तो सबसे पहले फ्री में लिस्ट करें!</p>
       <button class="btn pri" data-go="post">${ic('plus')} फ्री में लिस्ट करें</button>
       <button class="btn out" data-act="shareapp" style="margin-top:10px">${ic('share')} दोस्तों को बताएं</button></div>` :
    `<div class="wrap sec"><h3>${featured.some(isFeatured)?'⭐ फीचर्ड कमरे':'नए कमरे'}</h3><a data-go="search">सभी (${list.length}) ${ic('right')}</a></div>
     <div class="hs">${featured.map(roomCard).join('')}</div>`}
  <div class="promo"><div class="t"><h4>${ic('houseplus')} अपना कमरा लिस्ट करें</h4><p>100% फ्री। सीधे किरायेदारों से कॉल और WhatsApp पाएं।</p>
    <button class="btn pri sm" data-go="post">अब लिस्ट करें ${ic('right')}</button></div>${HOUSE_ILL}</div>
  ${latest.length ? `<div class="wrap sec"><h3>और कमरे</h3><a data-go="search">सभी देखें ${ic('right')}</a></div><div class="hs">${latest.map(roomCard).join('')}</div>` : ''}
  <div class="wrap sec"><h3>शहर चुनें</h3></div>
  <div class="cities">${RM_CITIES.map(c => `<button class="city ${c.id===S.city?'on':''}" data-city="${c.id}"><div class="ci" style="background-image:linear-gradient(transparent 40%,rgba(0,0,0,.55)),url(${c.img})">${ic('pin')} ${c.hi}</div></button>`).join('')}</div>
  <div style="height:16px"></div>
  ${nav('home')}</div>`;
};
AFTER.home = () => { want('city:'+S.city, 60e3, L.city(S.city)); };

/* ---------- SEARCH ---------- */
const CHIPS = [{id:'all',t:'सभी',ic:'bed'},{id:'Room',t:'रूम',ic:'bed'},{id:'PG',t:'PG',ic:'user'},{id:'1RK',t:'1RK',ic:'home'},{id:'1BHK',t:'1BHK',ic:'home'},{id:'2BHK',t:'2BHK',ic:'home'},{id:'3BHK',t:'3BHK+',ic:'home'}];
function activeFilterCount(){
  const f = S.f, d = freshFilter(); let n = 0;
  for (const k in d){ if (k==='amen'){ if (f.amen.length) n++; } else if (f[k] !== d[k]) n++; }
  return n + (S.cat ? 1 : 0);
}
function results(){
  const q = S.q.trim().toLowerCase(), f = S.f;
  let r = (S.cityList[S.city] || []).slice();
  if (q) r = r.filter(l => [l.title, l.area, areaHi(l.area), l.kind, l.description].join(' ').toLowerCase().includes(q));
  if (S.chip !== 'all') r = r.filter(l => S.chip === '3BHK' ? /^[3-9]BHK/.test(l.kind) : l.kind === S.chip);
  if (S.cat) r = r.filter(l => catMatch(l, S.cat));
  r = r.filter(l => l.price >= f.min && (f.max >= 25000 || l.price <= f.max));
  if (f.loc.trim()){ const s = f.loc.trim().toLowerCase(); r = r.filter(l => (l.area + ' ' + areaHi(l.area)).toLowerCase().includes(s)); }
  if (f.rooms) r = r.filter(l => f.rooms === 4 ? l.rooms >= 4 : l.rooms === f.rooms);
  if (f.type) r = r.filter(l => f.type === 'flat' ? (l.ptype === 'flat' || l.ptype === 'house') : l.ptype === f.type);
  if (f.amen.length) r = r.filter(l => f.amen.every(a => (l.amenities||[]).includes(a)));
  if (f.verified) r = r.filter(l => l.verified);
  if (f.women || f.girls) r = r.filter(l => l.gender === 'girls');
  if (f.now) r = r.filter(l => l.available_now);
  const s = S.sort;
  r.sort((a,b) => s==='low' ? a.price-b.price : s==='high' ? b.price-a.price : s==='new' ? new Date(b.created_at)-new Date(a.created_at)
    : (isFeatured(b)-isFeatured(a)) || (b.verified-a.verified) || (new Date(b.created_at)-new Date(a.created_at)));
  return r;
}
SCREENS.search = () => {
  const loaded = !!S.cityList[S.city], r = results(), n = activeFilterCount(), ckey = 'city:'+S.city;
  const catName = S.cat ? (CATS.find(c => c.id === S.cat)||{}).hi : '';
  return `<div class="screen">
  <header class="hdr" style="padding-bottom:14px"><div class="row">${brand()}<button class="ibtn glass" data-go="fav">${ic('heart')}</button></div></header>
  <div class="wrap" style="margin-top:14px"><form class="sbar" data-form="search">${ic('search')}
    <input name="q" value="${esc(S.q)}" placeholder="${esc(cityHi(S.city))} में कमरा खोजें" autocomplete="off">
    <label class="cty">${ic('pin')}<select data-change="city">${RM_CITIES.map(c => `<option value="${c.id}" ${c.id===S.city?'selected':''}>${c.hi}</option>`).join('')}</select>${ic('down')}</label></form></div>
  <div class="chips">${CHIPS.map(c => `<button class="${S.chip===c.id?'on':''}" data-chip="${c.id}">${ic(c.ic)}${c.t}</button>`).join('')}</div>
  <div class="tools">
    <button class="tb" data-go="filter">${ic('sliders')}फ़िल्टर ${n?`<span class="n">${n}</span>`:''}</button>
    <label class="tb">${ic('sort')}<select class="tb" style="border:0;padding:0" data-change="sort">
      <option value="feat" ${S.sort==='feat'?'selected':''}>सबसे अच्छे पहले</option>
      <option value="low" ${S.sort==='low'?'selected':''}>किराया (कम से ज्यादा)</option>
      <option value="high" ${S.sort==='high'?'selected':''}>किराया (ज्यादा से कम)</option>
      <option value="new" ${S.sort==='new'?'selected':''}>सबसे नए</option></select></label>
    <button class="tb" data-act="mapview">${ic('map')}मैप</button>
  </div>
  <div class="rcount"><span>${loaded ? `कुल ${r.length} परिणाम${catName?' · '+esc(catName):''}` : 'लोड हो रहा है...'}</span>${n ? `<button class="more" data-act="clearf">${ic('refresh')} फ़िल्टर हटाएं</button>` : ''}</div>
  <div class="wrap">${!loaded ? (errs[ckey] ? errBox(ckey) : '<div class="lc skel"></div>'.repeat(3)) : r.length ? r.map(l => listCard(l)).join('') :
    `<div class="empty">${ic('search')}<b>कोई कमरा नहीं मिला</b>फ़िल्टर बदलें या दूसरा शहर चुनें।</div>`}</div>
  ${nav('search')}</div>`;
};
AFTER.search = () => { want('city:'+S.city, 60e3, L.city(S.city)); };

/* ---------- FILTER ---------- */
SCREENS.filter = () => {
  const f = S.f;
  const amen = ['wifi','geyser','heater','bed','wardrobe','water','parking','view','food','kitchen'];
  const tg = (k, t) => `<div class="tg"><span>${t}</span><button class="sw ${f[k]?'on':''}" data-sw="${k}"></button></div>`;
  return `<div class="screen nonav">
  ${topbar('', `<button class="ibtn" data-go="fav">${ic('heart')}</button>`)}
  <div class="fhead"><div class="c">${ic('funnel')}</div><div><h2>फ़िल्टर</h2><p>अपनी जरूरत के अनुसार कमरे चुनें</p></div>
    <button class="btn out" data-act="resetf">${ic('refresh')} सभी हटाएं</button></div>
  <div class="card"><h3><span class="ibtn" style="width:26px;height:26px;background:var(--g8);color:#fff">₹</span> किराया रेंज (प्रति माह)</h3>
    <div class="rvals"><span id="rmin">${rs(f.min)}</span><span id="rmax">${f.max>=25000?'₹25,000+':rs(f.max)}</span></div>
    <div class="range"><div class="tr"></div><div class="fl" id="rfill"></div>
      <input type="range" min="1000" max="25000" step="500" value="${f.min}" data-range="min">
      <input type="range" min="1000" max="25000" step="500" value="${f.max}" data-range="max"></div></div>
  <div class="card"><div class="fld" style="margin:0"><label>${ic('pin')} इलाका (${esc(cityHi(S.city))})</label><div class="inp"><input data-in="loc" value="${esc(f.loc)}" placeholder="जैसे - ${esc(((RM_CITIES.find(c=>c.id===S.city)||{}).areas||[''])[0])}" list="areas"></div>
      <datalist id="areas">${((RM_CITIES.find(c=>c.id===S.city)||{}).areas||[]).map(a=>`<option value="${esc(a)}">`).join('')}</datalist></div></div>
  <div class="card"><h3>${ic('bed')} कमरों की संख्या</h3><div class="opts">${[1,2,3,4].map(n=>`<button class="${f.rooms===n?'on':''}" data-rooms="${n}">${n===4?'4+':n}</button>`).join('')}</div>
    <h3 style="margin-top:16px">${ic('home')} प्रकार</h3><div class="opts">${[['room','रूम'],['pg','PG / हॉस्टल'],['flat','फ्लैट / मकान'],['shop','दुकान/ऑफिस']].map(([k,t])=>`<button class="${f.type===k?'on':''}" data-type="${k}">${t}</button>`).join('')}</div></div>
  <div class="card"><h3>${ic('star')} सुविधाएं (एक या अधिक चुनें)</h3><div class="chk" style="grid-template-columns:repeat(5,1fr)">
    ${amen.map(a => { const m = amenity(a); const on = f.amen.includes(a); return `<button class="${on?'on':''}" data-famen="${a}"><span class="tk">${ic('check')}</span>${ic(m.ic)}${m.hi}</button>`; }).join('')}</div></div>
  <div class="card"><h3>${ic('gear')} अन्य विकल्प</h3>
    ${tg('verified','केवल सत्यापित प्रॉपर्टी')}${tg('girls','लड़कियों के लिए')}${tg('now','तुरंत उपलब्ध')}</div>
  <div class="cta"><button class="btn pri" data-act="applyf">${ic('search')} फ़िल्टर लागू करें (<span id="fcount">${results().length}</span> परिणाम)</button></div>
  </div>`;
};
AFTER.filter = () => { updRange(); want('city:'+S.city, 60e3, L.city(S.city)); };
function updRange(){
  const f = S.f, a = (f.min-1000)/24000*100, b = (f.max-1000)/24000*100;
  const fl = $('#rfill'); if (fl){ fl.style.left = a+'%'; fl.style.width = (b-a)+'%'; }
  const mn = $('#rmin'), mx = $('#rmax'); if (mn){ mn.textContent = rs(f.min); mx.textContent = f.max>=25000 ? '₹25,000+' : rs(f.max); }
  const c = $('#fcount'); if (c) c.textContent = results().length;
}

/* ---------- DETAIL ---------- */
SCREENS.p = (id) => {
  const l = S.byId.get(id);
  if (!l) return `<div class="screen nonav">${topbar()}${errs['l:'+id] ? errBox('l:'+id) : fresh['l:'+id] ? `<div class="empty">${ic('home')}<b>यह लिस्टिंग अब उपलब्ध नहीं है</b></div>` : loader()}</div>`;
  const amen = (l.amenities||[]).map(amenity).filter(Boolean);
  const flat = l.ptype === 'flat' || l.ptype === 'house', mine = l.owner_id === uid(), o = l.owner || {};
  const g = {boys:'लड़कों के लिए', girls:'लड़कियों के लिए', family:'परिवार के लिए'}[l.gender];
  return `<div class="screen nonav">
  <div class="gal"><div class="track" id="track">${l.images.map(s => `<img src="${esc(s)}" alt="">`).join('')}</div>
    <div class="bar"><button class="ibtn" data-act="back">${ic('back')}</button>
      <div class="r">${heartBtn(l, 'ibtn')}<button class="ibtn" data-share="${l.id}">${ic('share')}</button><button class="ibtn" data-more="${l.id}">${ic('more')}</button></div></div>
    <span class="cnt" id="gcount">${ic('camera')}1/${l.images.length}</span>
    ${l.verified ? `<span class="vbadge">${ic('checkc')}सत्यापित</span>` : ''}</div>
  ${l.images.length > 1 ? `<div class="thumbs">${l.images.map((s,i) => `<img src="${esc(s)}" data-thumb="${i}" class="${i?'':'on'}" alt="">`).join('')}</div>` : ''}
  <div class="dt">
    <div class="head"><h1>${esc(l.title)}</h1><span class="pill">${rs(l.price)}/माह</span></div>
    <div class="loc" style="font-size:14px;margin-top:6px">${ic('pin')}${placeHi(l)}</div>
    <div class="specs">
      <div>${ic(flat?'home':'bed')}${flat ? esc(l.kind) : l.ptype==='pg' ? 'PG' : l.rooms+' Room'}<small>प्रकार</small></div>
      <div>${ic('bath')}${l.baths} Bathroom<small>बाथरूम</small></div>
      <div>${ic('size')}${l.sqft ? l.sqft+' sq ft' : '—'}<small>एरिया</small></div>
      <div>${ic('building')}${esc(l.floor || '—')}<small>मंजिल</small></div>
    </div>
    <div class="blk"><h3>${ic('doc')} विवरण</h3><p class="clamp" id="desc">${esc(l.description)}</p>
      ${l.description.length > 120 ? `<button class="more" data-act="readmore">और पढ़ें ${ic('down')}</button>` : ''}
      ${featTag(l)}${l.furnish ? `<span class="tag">${esc(l.furnish)}</span>` : ''}${l.available_now ? `<span class="tag">तुरंत उपलब्ध</span>` : ''}${g ? `<span class="tag">${g}</span>` : ''}</div>
    ${amen.length ? `<div class="blk"><h3>${ic('star')} सुविधाएँ</h3><div class="amen">${amen.map(a => `<div><span class="ac">${ic(a.ic)}</span>${a.hi}</div>`).join('')}</div></div>` : ''}
    <div class="blk"><h3>${ic('user')} मालिक की जानकारी</h3>
      <div class="owner"><div class="av">${o.avatar_url ? `<img src="${esc(o.avatar_url)}" style="width:100%;height:100%;object-fit:cover">` : ic('user')}</div>
        <div style="flex:1;min-width:0"><div class="nm">${esc(l.contact_name)}</div>
          ${l.verified ? `<span class="vchip">${ic('shield')}सत्यापित लिस्टिंग</span>` : ''}${isPremium(o) ? `<span class="vchip prem">${ic('star','f')}प्रीमियम</span>` : ''}</div>
        <div class="rt"><span>${ic('cal')}${esc(since(o.created_at))}</span><span>${ic('eye')}${l.views} व्यूज़</span></div></div></div>
    <div class="blk"><h3>${ic('pin')} लोकेशन</h3>
      <div class="mapbox"><div class="map">${miniMap(areaHi(l.area))}</div>
        <div><div class="loc" style="margin:0 0 8px;color:var(--ink)">${ic('pin')}${placeHi(l)}</div>
        <button class="btn out sm" data-maps="${l.id}">${GOOGLE} Google Maps</button></div></div></div>
    <div class="safe">${ic('shield')}<div><b>सुरक्षित रहें</b><p>कमरा खुद जाकर देखे बिना कोई एडवांस या टोकन पैसा न भेजें। कुछ गलत लगे तो ⋮ से रिपोर्ट करें।</p></div></div>
    <div style="height:10px"></div>
  </div>
  ${mine ? `<div class="cta"><button class="btn out" data-go="dash">${ic('home')} डैशबोर्ड</button><button class="btn pri" data-edit="${l.id}">${ic('edit')} लिस्टिंग बदलें</button></div>`
    : `<div class="cta"><button class="btn out sq" data-chatwith="${l.id}" aria-label="चैट">${ic('chat')}</button><button class="btn out wa" data-wa="${l.id}">${WA} WhatsApp</button><button class="btn pri" data-call="${l.id}">${ic('phone')} कॉल करें</button></div>`}
  </div>`;
};
AFTER.p = (id) => {
  if (!S.byId.has(id)) want('l:'+id, 30e3, L.listing(id));
  else if (!S.viewed.has(id) && S.byId.get(id).owner_id !== uid()){ S.viewed.add(id); db.rpc('increment_view', {lid:id}).catch(()=>{}); }
  const tr = $('#track'); if (!tr) return;
  tr.addEventListener('scroll', () => {
    const i = Math.round(tr.scrollLeft / tr.clientWidth);
    const c = $('#gcount'); if (c) c.innerHTML = ic('camera') + (i+1) + '/' + tr.children.length;
    $$('[data-thumb]').forEach((t, k) => t.classList.toggle('on', k === i));
  }, {passive:true});
};
function miniMap(label){
  return `<svg viewBox="0 0 200 110" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="200" height="110" fill="#EEF2EF"/>
  <path d="M0 80 40 50 70 66 110 34 150 52 200 30V110H0z" fill="#DCEADF"/>
  <path d="M0 30h200M50 0v110M128 0v110M0 100 200 8" stroke="#fff" stroke-width="6"/>
  <path d="M100 52s-10-9.5-10-17a10 10 0 0 1 20 0c0 7.5-10 17-10 17z" fill="#E5484D"/><circle cx="100" cy="35" r="3.6" fill="#fff"/>
  <text x="100" y="72" text-anchor="middle" font-size="11" font-weight="700" fill="#14251C" font-family="sans-serif">${esc(label)}</text></svg>`;
}

/* ---------- FAVOURITES ---------- */
SCREENS.fav = () => {
  const r = S.favList;
  return `<div class="screen">
  ${topbar('', `<button class="ibtn" data-go="search">${ic('search')}</button>${meBtn()}`)}
  <div class="hello"><div class="av" style="background:var(--g8);color:#fff">${ic('heart','f')}</div><div style="flex:1"><b>मेरे पसंदीदा कमरे</b><p>आपके सेव किए गए कमरे यहां दिखेंगे।</p></div>
    ${r ? `<span class="btn out sm">${ic('bookmark')} ${r.length}</span>` : ''}</div>
  <div class="wrap" style="margin-top:14px">${!r ? (errs.favList ? errBox('favList') : '<div class="lc skel"></div>'.repeat(2)) : r.length ? r.map(l => listCard(l, 'fav')).join('') :
    `<div class="empty">${ic('heart')}<b>अभी कोई पसंदीदा कमरा नहीं</b>कमरे पर ♡ दबाकर सेव करें।<br><br><button class="btn pri sm" data-go="search">कमरे खोजें</button></div>`}</div>
  ${nav('fav')}</div>`;
};
AFTER.fav = () => want('favList', 20e3, L.favList);

/* ---------- POST / EDIT ---------- */
const PTYPES = [['room','कमरा','bed'],['flat','फ्लैट','building'],['house','मकान','home'],['pg','PG / हॉस्टल','users'],['shop','दुकान/ऑफिस','store']];
const FORM_AMEN = ['wifi','geyser','heater','bed','wardrobe','water','parking','power','view','balcony','kitchen','food'];
function newDraft(){
  const m = S.me || {};
  return {_for:'new', _ready:true, ptype:'room', kind:'Room', city:S.city, area:'', price:'', rooms:'1', baths:'1', sqft:'', floor:'', furnish:'सेमी फर्निश्ड',
    gender:'', desc:'', imgs:[], amen:['geyser','water','power'], name:m.name||'', phone:m.phone||'', wa:m.phone||'', now:true};
}
function draftFrom(l){
  return {_for:l.id, _ready:true, ptype:l.ptype, kind:l.kind, city:l.city, area:l.area, price:String(l.price), rooms:String(l.rooms), baths:String(l.baths),
    sqft:l.sqft?String(l.sqft):'', floor:l.floor||'', furnish:l.furnish||'सेमी फर्निश्ड', gender:l.gender||'', desc:l.description,
    imgs:l.images.map(u => ({url:u})), amen:[...l.amenities], name:l.contact_name, phone:l.contact_phone, wa:l.whatsapp||'', now:l.available_now, _orig:[...l.images]};
}
SCREENS.post = (editId) => {
  if (editId){
    const l = S.byId.get(editId);
    if (!l){ return `<div class="screen nonav">${topbar('लिस्टिंग बदलें')}${errs['l:'+editId] ? errBox('l:'+editId) : loader()}</div>`; }
    if (l.owner_id !== uid() && !(S.me && S.me.role === 'admin')) return `<div class="screen nonav">${topbar()}<div class="empty"><b>यह आपकी लिस्टिंग नहीं है</b></div></div>`;
    if (!S.draft || S.draft._for !== editId) S.draft = draftFrom(l);
  } else if (!S.draft || S.draft._for !== 'new') S.draft = newDraft();
  const d = S.draft, areas = (RM_CITIES.find(c=>c.id===d.city)||{}).areas || [];
  const sel = (k, opts) => `<select data-d="${k}">${opts.map(o => { const [v,t] = Array.isArray(o)?o:[o,o]; return `<option value="${esc(v)}" ${String(d[k])===String(v)?'selected':''}>${esc(t)}</option>`; }).join('')}</select>`;
  const prem = S.config.premium_enabled === true;
  return `<div class="screen nonav">
  ${topbar(editId ? 'लिस्टिंग बदलें' : '', `<button class="ibtn glass" data-go="dash">${ic('home')}</button>`)}
  <div class="fhero"><div class="c">${ic('home')}</div><div><h2>${editId?'अपनी लिस्टिंग बदलें':'अपनी प्रॉपर्टी लिस्ट करें'}</h2><p>अपना कमरा, फ्लैट या PG किराए पर दें और सही किरायेदार पाएं।</p></div>${HOUSE_ILL}</div>
  <div class="perks"><span>${ic('sparkle')}${prem?'पहली '+S.config.free_listing_limit+' फ्री':'100% फ्री लिस्टिंग'}</span><span>${ic('users')}सीधे किरायेदार से संपर्क</span><span>${ic('clock')}2 मिनट में</span></div>
  <form data-form="post">
  <div class="card"><h3>${ic('home')} प्रॉपर्टी का प्रकार</h3>
    <div class="seg">${PTYPES.map(([k,t,i]) => `<button type="button" class="${d.ptype===k?'on':''}" data-ptype="${k}">${ic(i)}${t}</button>`).join('')}</div></div>
  <div class="card"><h3>${ic('pin')} मूल जानकारी</h3>
    <div class="grid2">
      <div class="fld"><label>शहर <i>*</i></label><div class="inp">${ic('pin')}${sel('city', RM_CITIES.map(c=>[c.id,c.hi]))}${ic('down')}</div></div>
      <div class="fld"><label>इलाका/मोहल्ला <i>*</i></label><div class="inp">${ic('building')}<input data-d="area" value="${esc(d.area)}" placeholder="जैसे - ${esc(areas[0]||'')}" list="pareas" maxlength="80"></div>
        <datalist id="pareas">${areas.map(a=>`<option value="${esc(a)}">`).join('')}</datalist></div>
      <div class="fld"><label>किराया (₹ प्रति माह) <i>*</i></label><div class="inp"><b style="color:var(--g8)">₹</b><input data-d="price" inputmode="numeric" value="${esc(d.price)}" placeholder="जैसे - 4500" maxlength="7"></div></div>
      <div class="fld"><label>टाइप <i>*</i></label><div class="inp">${ic('home')}${sel('kind',[['Room','रूम'],'1RK','1BHK','2BHK','3BHK','4BHK',['PG','PG'],['Shop','दुकान/ऑफिस']])}${ic('down')}</div></div>
      <div class="fld"><label>कमरे</label><div class="inp">${ic('bed')}${sel('rooms',['1','2','3','4','5','6'])}${ic('down')}</div></div>
      <div class="fld"><label>बाथरूम</label><div class="inp">${ic('bath')}${sel('baths',[['0','साझा'],'1','2','3','4'])}${ic('down')}</div></div>
      <div class="fld"><label>एरिया (sq ft)</label><div class="inp">${ic('size')}<input data-d="sqft" inputmode="numeric" value="${esc(d.sqft)}" placeholder="वैकल्पिक" maxlength="5"></div></div>
      <div class="fld"><label>मंजिल</label><div class="inp">${ic('building')}${sel('floor',[['','चुनें'],'Ground Floor','1st Floor','2nd Floor','3rd Floor','4th Floor','5th Floor+'])}${ic('down')}</div></div>
      <div class="fld"><label>फर्निशिंग</label><div class="inp">${sel('furnish',['फर्निश्ड','सेमी फर्निश्ड','अनफर्निश्ड'])}${ic('down')}</div></div>
      <div class="fld"><label>किसके लिए</label><div class="inp">${sel('gender',[['','सभी के लिए'],['boys','लड़कों के लिए'],['girls','लड़कियों के लिए'],['family','परिवार के लिए']])}${ic('down')}</div></div>
    </div>
    <div class="tg" style="border:0;padding-bottom:0"><span>अभी खाली है (तुरंत शिफ्ट हो सकते हैं)</span><button type="button" class="sw ${d.now?'on':''}" data-dnow="1"></button></div></div>
  <div class="card"><h3>${ic('doc')} विवरण <i style="color:var(--red);font-style:normal">*</i></h3>
    <textarea class="ta" data-d="desc" maxlength="1000" placeholder="जैसे - धूप वाला कमरा, गीज़र, 24x7 पानी, बस स्टैंड 5 मिनट, कॉलेज पास में...">${esc(d.desc)}</textarea><div class="cc" id="dcount">${d.desc.length}/1000</div></div>
  <div class="card"><h3>${ic('image')} फोटो <i style="color:var(--red);font-style:normal">*</i> <small style="font-weight:400;color:var(--ink3)">(पहली फोटो कवर बनेगी)</small></h3>
    <div class="photos" id="photos">${photoStrip()}</div>
    <input type="file" id="pfile" accept="image/*" multiple hidden></div>
  <div class="card"><h3>${ic('star')} सुविधाएं</h3><div class="chk">
    ${FORM_AMEN.map(a => { const m = amenity(a); const on = d.amen.includes(a); return `<button type="button" class="${on?'on':''}" data-damen="${a}"><span class="tk">${ic('check')}</span>${ic(m.ic)}${m.hi}</button>`; }).join('')}</div></div>
  <div class="card"><h3>${ic('phone')} संपर्क (किरायेदारों को दिखेगा)</h3>
    <div class="fld"><label>नाम <i>*</i></label><div class="inp">${ic('user')}<input data-d="name" value="${esc(d.name)}" placeholder="आपका नाम" maxlength="80"></div></div>
    <div class="grid2">
      <div class="fld"><label>मोबाइल नंबर <i>*</i></label><div class="inp">${ic('phone')}<input data-d="phone" inputmode="tel" maxlength="10" value="${esc(d.phone)}" placeholder="10 अंक"></div></div>
      <div class="fld"><label>WhatsApp (अगर अलग हो)</label><div class="inp">${WA}<input data-d="wa" inputmode="tel" maxlength="10" value="${esc(d.wa)}" placeholder="वैकल्पिक"></div></div>
    </div></div>
  <div class="note">${ic('shield')} लिस्टिंग तुरंत दिखेगी। हमारी टीम जाँच के बाद "सत्यापित" बैज लगाएगी।</div>
  <div class="note">${ic('lock')} गलत या धोखे वाली लिस्टिंग हटा दी जाएगी।</div>
  <div class="cta"><button type="submit" class="btn pri" id="postbtn">${ic('send')} ${editId?'बदलाव सेव करें':'प्रॉपर्टी लिस्ट करें'}</button></div>
  </form></div>`;
};
function photoStrip(){
  const d = S.draft;
  return `${d.imgs.length < 10 ? `<button type="button" class="add" data-act="addphoto">${ic('camera')}फोटो जोड़ें<small>(${d.imgs.length}/10)</small></button>` : ''}` +
    d.imgs.map((p,i) => `<div class="p"><img src="${esc(p.url || p.data)}" alt="">${i===0?'<span class="cover">कवर</span>':''}<button type="button" data-rmphoto="${i}">${ic('x')}</button></div>`).join('');
}
AFTER.post = (editId) => {
  if (editId && !S.byId.has(editId)) want('l:'+editId, 30e3, L.listing(editId));
  const inp = $('#pfile'); if (!inp) return;
  inp.addEventListener('change', async () => {
    const files = [...inp.files].slice(0, 10 - S.draft.imgs.length);
    for (const f of files){ try{ const data = await shrink(f, 1280, .78); S.draft.imgs.push({data}); }catch(e){ toast('यह फोटो नहीं खुल सकी'); } }
    inp.value = ''; $('#photos').innerHTML = photoStrip();
  });
};
function shrink(file, max, q){
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => { const im = new Image(); im.onload = () => {
      const k = Math.min(1, max / Math.max(im.width, im.height));
      const c = document.createElement('canvas'); c.width = Math.round(im.width*k); c.height = Math.round(im.height*k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', q)); };
      im.onerror = rej; im.src = fr.result; };
    fr.onerror = rej; fr.readAsDataURL(file);
  });
}
const dataToBlob = d => fetch(d).then(r => r.blob());
const rid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
async function submitPost(){
  if (S.busy) return;
  const d = S.draft, err = m => { toast(m); return false; };
  if (!d.area.trim() || d.area.trim().length < 2) return err('इलाका/मोहल्ला भरें');
  const price = parseInt(d.price, 10); if (!price || price < 100) return err('सही किराया भरें');
  if (d.desc.trim().length < 15) return err('विवरण कम से कम 15 अक्षर का लिखें');
  if (!d.imgs.length) return err('कम से कम 1 फोटो जोड़ें');
  if (d.name.trim().length < 2) return err('अपना नाम भरें');
  if (!/^[6-9]\d{9}$/.test(d.phone)) return err('सही 10 अंकों का मोबाइल नंबर भरें');
  if (d.wa && !/^[6-9]\d{9}$/.test(d.wa)) return err('WhatsApp नंबर सही नहीं है');
  const btn = $('#postbtn'); S.busy = true; if (btn) btn.disabled = true;
  const setBtn = t => { if (btn) btn.innerHTML = `<span class="spin sm"></span> ${t}`; };
  try {
    const urls = [];
    for (let i = 0; i < d.imgs.length; i++){
      const p = d.imgs[i];
      if (p.url){ urls.push(p.url); continue; }
      setBtn(`फोटो अपलोड (${i+1}/${d.imgs.length})...`);
      const blob = await dataToBlob(p.data);
      const url = await storage.upload('listing-photos', `${uid()}/${rid()}.jpg`, blob);
      p.url = url; delete p.data; urls.push(url);
    }
    setBtn('सेव हो रहा है...');
    const g = {room:'कमरा', flat:'फ्लैट', house:'मकान', pg:'PG', shop:'दुकान/ऑफिस'}[d.ptype];
    const gt = {boys:' (लड़कों के लिए)', girls:' (लड़कियों के लिए)', family:' (परिवार के लिए)'}[d.gender] || '';
    const title = d.ptype === 'pg' ? 'PG' + gt : (/BHK|RK/.test(d.kind) ? `${d.kind} ${g}` : g) + (d.ptype === 'shop' ? '' : ` (${d.furnish})`);
    const row = {
      title: title.slice(0, 90), kind: d.kind, ptype: d.ptype, city: d.city, area: d.area.trim(), price,
      rooms: +d.rooms, baths: +d.baths, sqft: d.sqft ? +d.sqft : null, floor: d.floor || null, furnish: d.furnish,
      gender: d.gender || null, description: d.desc.trim(), amenities: d.amen, images: urls,
      contact_name: d.name.trim(), contact_phone: d.phone, whatsapp: d.wa || null, available_now: !!d.now
    };
    let saved;
    if (d._for === 'new'){ row.owner_id = uid(); saved = (await db.insert('listings', row, LIST_SELECT))[0]; }
    else {
      saved = (await db.update('listings', `id=eq.${enc(d._for)}&${LIST_SELECT}`, row))[0];
      const gone = (d._orig||[]).filter(u => !urls.includes(u)).map(u => storage.pathFromUrl('listing-photos', u)).filter(Boolean);
      storage.remove('listing-photos', gone).catch(()=>{});
    }
    remember([saved]);
    // अगली बार के लिए नाम/नंबर प्रोफाइल में रखें
    if (S.me && (!S.me.name || !S.me.phone)){
      const patch = {}; if (!S.me.name) patch.name = row.contact_name; if (!S.me.phone) patch.phone = row.contact_phone;
      db.update('profiles', `id=eq.${uid()}`, patch, true).then(() => { Object.assign(S.me, patch); LS.set('me', S.me); }).catch(()=>{});
    }
    refetch('city:'+row.city, 'mine'); S.cityList[row.city] = null;
    toast(d._for === 'new' ? 'आपकी प्रॉपर्टी लिस्ट हो गई! 🎉' : 'बदलाव सेव हो गए ✓');
    S.draft = null; depth = Math.max(0, depth - 1);
    location.replace('#p/' + saved.id);
  } catch(e){
    toast(e.message);
    if (btn){ btn.disabled = false; btn.innerHTML = `${ic('send')} फिर कोशिश करें`; }
  } finally { S.busy = false; }
}

/* ---------- LOGIN (ईमेल OTP) ---------- */
let otp = {email:'', sent:false, timer:0, iv:null};
SCREENS.login = (next) => `<div class="login screen nonav" style="padding-bottom:30px">
  <div class="brandrow"><button class="ibtn" data-act="back" style="color:var(--ink)">${ic('back')}</button>${LOGO('#0B4D33')}<div><div class="name">Room<b>Mitra</b></div><div class="slogan">कमरा ढूँढना हुआ आसान।</div></div></div>
  <div class="hero"><div style="flex:1"><h1>आपका स्वागत है</h1><div class="hr"></div><p>लॉगिन करके कमरे सेव करें, मालिक से बात करें या अपनी प्रॉपर्टी लिस्ट करें।</p></div>
    <svg class="ill" viewBox="0 0 160 120">${HOUSE_ILL.replace(/<\/?svg[^>]*>/g,'')}</svg></div>
  <div class="trust"><span>${ic('shield')}सुरक्षित लॉगिन</span><span>${ic('lock')}कोई पासवर्ड नहीं</span><span>${ic('bolt')}10 सेकंड में</span></div>
  ${!otp.sent ? `<div class="lcard"><div class="h"><div class="c">${ic('mail')}</div><div><b>ईमेल से लॉगिन करें</b><p>आपके ईमेल पर 6 अंकों का कोड आएगा।</p></div></div>
    <form data-form="sendotp"><div class="phone"><span class="cc">${ic('mail')}</span><input id="lemail" type="email" inputmode="email" autocomplete="email" placeholder="aapka@gmail.com" value="${esc(otp.email)}"></div>
    <button class="btn pri block" id="otpbtn">कोड भेजें ${ic('right')}</button></form></div>` :
  `<div class="lcard"><div class="h"><div class="c">${ic('shield')}</div><div><b>कोड दर्ज करें</b><p><b>${esc(otp.email)}</b> पर भेजा गया कोड डालें। (Spam/Promotions फोल्डर भी देखें)</p></div></div>
    <form data-form="verify" data-next="${esc(next||'')}"><input id="lcode" class="codebox" inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="• • • • • •">
    <button class="btn pri block" id="verbtn">लॉगिन करें ${ic('check')}</button></form>
    <div class="resend" style="margin-top:12px" id="resend"></div>
    <div class="resend" style="margin-top:6px"><button data-act="changeemail">ईमेल बदलें</button></div></div>`}
  <div class="terms">लॉगिन करके आप हमारी <u data-act="terms">शर्तों और गोपनीयता नीति</u> से सहमत होते हैं।</div>
  </div>`;
AFTER.login = () => {
  const c = $('#lcode'); if (c){ c.focus(); c.addEventListener('input', () => { c.value = c.value.replace(/\D/g,''); }); tickResend(); }
  const e = $('#lemail'); if (e) e.focus();
};
function tickResend(){
  clearInterval(otp.iv);
  const draw = () => { const e = $('#resend'); if (!e){ clearInterval(otp.iv); return; }
    e.innerHTML = otp.timer > 0 ? `${ic('refresh')} दोबारा कोड भेजें (00:${String(otp.timer).padStart(2,'0')})` : `<button data-act="resend">${ic('refresh')} दोबारा कोड भेजें</button>`; };
  draw(); otp.iv = setInterval(() => { otp.timer--; draw(); if (otp.timer <= 0) clearInterval(otp.iv); }, 1000);
}
async function sendOtp(email){
  email = String(email||'').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return toast('सही ईमेल पता डालें');
  const b = $('#otpbtn'); if (b){ b.disabled = true; b.innerHTML = '<span class="spin sm"></span> भेज रहे हैं...'; }
  try { await auth.sendOtp(email); otp = {...otp, email, sent:true, timer:60}; render(true); toast('कोड भेज दिया गया ✉️'); }
  catch(e){ toast(e.message); if (b){ b.disabled = false; b.innerHTML = `कोड भेजें ${ic('right')}`; } }
}
async function verifyOtp(code, next){
  if (!/^\d{6,8}$/.test(code)) return toast('ईमेल में आया पूरा कोड डालें');
  const b = $('#verbtn'); if (b){ b.disabled = true; b.innerHTML = '<span class="spin sm"></span> जाँच रहे हैं...'; }
  try {
    await auth.verifyOtp(otp.email, code);
    clearInterval(otp.iv); otp = {email:'', sent:false, timer:0};
    resetUser(); await afterLogin();
    toast('लॉगिन सफल ✓');
    const target = next ? decodeURIComponent(next) : 'home';
    depth = Math.max(0, depth - 1);
    location.replace('#' + target);
    if (S.me && !S.me.name) setTimeout(() => ACT.editprofile(true), 400);
  } catch(e){ toast(e.message); if (b){ b.disabled = false; b.innerHTML = `लॉगिन करें ${ic('check')}`; } }
}
async function afterLogin(){
  try { await Promise.all([L.me(), L.favIds(), L.unread()]); fresh.favIds = fresh.me = Date.now(); } catch(e){}
}

/* ---------- OWNER DASHBOARD ---------- */
SCREENS.dash = () => {
  const mine = S.mine, m = S.me || {};
  const views = (mine||[]).reduce((a,l) => a + (l.views||0), 0);
  const prem = S.config.premium_enabled === true;
  return `<div class="screen">
  <header class="hdr"><div class="row">${brand()}${meBtn()}</div></header>
  <div class="hello"><div class="av">${m.avatar_url?`<img src="${esc(m.avatar_url)}" style="width:100%;height:100%;object-fit:cover">`:ic('user')}</div><div style="flex:1;min-width:0"><b>नमस्ते, ${esc(m.name||'मालिक')}</b><p>मालिक डैशबोर्ड</p></div>
    <button class="btn out sm" data-go="premium">${ic('star')}${isPremium(m)?'प्रीमियम':'प्लान'}</button></div>
  <div class="stats">
    <div class="st"><div class="t"><span>${ic('home')}</span>मेरी लिस्टिंग</div><b>${mine?mine.length:'–'}</b><small>${mine?mine.filter(l=>l.status==='active').length+' सक्रिय':''}</small></div>
    <div class="st b"><div class="t"><span>${ic('eye')}</span>कुल व्यूज़</div><b>${mine?views:'–'}</b><small>अब तक</small></div>
    <div class="st p" data-go="msgs"><div class="t"><span>${ic('chat')}</span>संदेश</div><b>${S.unread}</b><small>नए संदेश</small></div>
    <div class="st"><div class="t"><span>${ic('checkc')}</span>सत्यापित</div><b>${mine?mine.filter(l=>l.verified).length:'–'}</b><small>लिस्टिंग</small></div>
  </div>
  ${prem && !isPremium(m) ? `<div class="note" style="justify-content:flex-start">${ic('info')} फ्री प्लान: ${S.config.free_listing_limit} सक्रिय लिस्टिंग तक।</div>` : ''}
  <div class="dbtns"><button class="btn pri" data-act="newpost">${ic('plus')} नई प्रॉपर्टी</button><button class="btn out" data-act="reloadmine">${ic('refresh')} रिफ्रेश</button></div>
  <div class="wrap sec"><h3>${ic('home')} मेरी लिस्टिंग</h3></div>
  <div class="wrap">${!mine ? (errs.mine ? errBox('mine') : '<div class="lc skel"></div>'.repeat(2)) : mine.length ? mine.map(l => listCard(l, 'dash')).join('') :
    `<div class="empty">${ic('houseplus')}<b>अभी आपकी कोई लिस्टिंग नहीं है</b>पहली प्रॉपर्टी 2 मिनट में फ्री लिस्ट करें।<br><br><button class="btn pri sm" data-act="newpost">अब लिस्ट करें</button></div>`}</div>
  ${nav('post')}</div>`;
};
AFTER.dash = () => { want('mine', 15e3, L.mine); want('unread', 20e3, L.unread); };

/* ---------- MESSAGES ---------- */
SCREENS.msgs = () => {
  const all = S.convs, t = S.msgTab;
  const list = (all||[]).filter(c => t==='block' ? c.blocked_by : t==='arch' ? (c.archived && !c.blocked_by) : (!c.archived && !c.blocked_by));
  return `<div class="screen">
  ${topbar('', `<button class="ibtn" data-act="reloadconvs">${ic('refresh')}</button>`)}
  <div class="tabs3"><button class="${t==='all'?'on':''}" data-mtab="all">${ic('chat')}संदेश ${S.unread?`<span class="n">${S.unread}</span>`:''}</button>
    <button class="${t==='arch'?'on':''}" data-mtab="arch">${ic('file')}आर्काइव</button><button class="${t==='block'?'on':''}" data-mtab="block">${ic('x')}ब्लॉक्ड</button></div>
  <div class="wrap" style="margin-top:12px">${!all ? (errs.convs ? errBox('convs') : '<div class="mrow skel"></div>'.repeat(3)) : list.length ? list.map(c => `<div class="mrow" data-chat="${c.id}">
    <div class="av">${c.other_avatar ? `<img src="${esc(c.other_avatar)}" alt="">` : ic('user')}</div>
    <div class="b"><div class="n1">${esc(c.other_name)}<span class="role">${esc(c.other_role)}</span></div>
      <div class="last">${esc(c.listing_title || 'हटाई गई लिस्टिंग')}</div>
      <div class="last" style="color:var(--ink)">${esc(c.last_message || 'चैट शुरू करें')}</div>
      <div class="tm">${ic('clock')}${esc(ago(c.last_at))}</div></div>
    ${Number(c.unread) ? `<span class="ub">${c.unread}</span>` : ''}${ic('right')}</div>`).join('') :
    `<div class="empty">${ic('chat')}<b>${t==='all'?'अभी कोई चैट नहीं':'कुछ नहीं है'}</b>${t==='all'?'किसी कमरे पर 💬 बटन दबाकर मालिक से बात करें।':''}</div>`}</div>
  ${nav('msgs')}</div>`;
};
AFTER.msgs = () => want('convs', 10e3, L.convs);

let chatPoll = null;
SCREENS.chat = (id) => {
  const c = (S.convs||[]).find(x => x.id === id);
  if (!c) return `<div class="screen nonav">${topbar()}${errs.convs ? errBox('convs') : fresh.convs ? `<div class="empty"><b>चैट नहीं मिली</b></div>` : loader()}</div>`;
  const l = c.listing_id && S.byId.get(c.listing_id);
  const iAmTenant = c.other_role === 'मकान मालिक';
  return `<div class="chat">
  <header class="hdr" style="padding-bottom:12px"><div class="row">
    <button class="ibtn" data-act="back">${ic('back')}</button>
    <div class="who">${c.other_avatar ? `<img src="${esc(c.other_avatar)}" alt="">` : `<span class="av sm">${ic('user')}</span>`}<div style="min-width:0"><b>${esc(c.other_name)}</b><small>${esc(c.other_role)}</small></div></div>
    ${iAmTenant && c.listing_id ? `<button class="ibtn solid" data-call="${c.listing_id}">${ic('phone')}</button>` : ''}<button class="ibtn" data-chatmore="${c.id}">${ic('more')}</button></div></header>
  ${c.listing_id ? `<div class="lp" data-open="${c.listing_id}"><img src="${esc(c.listing_image||'')}" alt=""><div style="min-width:0"><b>${esc(c.listing_title||'')}</b><small>${ic('pin')} ${esc(areaHi(c.listing_area||''))}, ${esc(cityHi(c.listing_city||''))}</small><small><b>${rs(c.listing_price)}/माह</b></small></div><span class="btn">${ic('home')} देखें</span></div>` : ''}
  <div class="msgs" id="msgs">${msgsHtml(id)}</div>
  ${c.blocked_by ? `<div class="note" style="margin:8px 16px 14px">${ic('x')} यह चैट ब्लॉक है।</div>` : `
  <div class="quick">${iAmTenant ? `<button data-q="avail">${ic('home')}क्या कमरा खाली है?</button><button data-q="visit">${ic('cal')}देखने कब आऊँ?</button><button data-q="final">${ic('rupee')}आखिरी किराया?</button>`
      : `<button data-q="yes">${ic('checkc')}हाँ, उपलब्ध है</button><button data-q="come">${ic('cal')}कल शाम आ जाइए</button><button data-q="callme">${ic('phone')}मुझे कॉल करें</button>`}</div>
  <form class="composer" data-form="chat" data-id="${c.id}"><div class="box"><input name="m" placeholder="यहाँ संदेश लिखें..." autocomplete="off" maxlength="2000"></div><button class="send">${ic('send')}</button></form>`}
  </div>`;
};
function msgsHtml(id){
  const m = S.msgs[id];
  if (!m) return errs['m:'+id] ? errBox('m:'+id) : loader('संदेश लोड हो रहे हैं...');
  if (!m.length) return `<div class="empty" style="padding:30px">${ic('chat')}पहला संदेश भेजें 👋</div>`;
  return m.map(x => `<div class="bub ${x.sender_id===uid()?'out':'in'}">${esc(x.body)}<div class="t">${timeOf(x.created_at)}${x.sender_id===uid()?(x.read_at?`<span class="seen">${ic('ddcheck')}</span>`:ic('check')):''}</div></div>`).join('');
}
async function pollChat(id, first){
  const have = S.msgs[id] || [];
  const last = have.length ? have[have.length-1].id : 0;
  try {
    const rows = await db.select('messages', `select=id,sender_id,body,kind,read_at,created_at&conversation_id=eq.${enc(id)}&order=id.asc&limit=500${first?'':`&id=gt.${last}`}`);
    if (first) S.msgs[id] = rows; else if (rows.length) S.msgs[id] = have.concat(rows);
    // पढ़ा गया स्टेटस अपडेट (अपने भेजे संदेशों का)
    if (!first && have.some(x => x.sender_id === uid() && !x.read_at && typeof x.id === 'number')){
      const ids = have.filter(x => x.sender_id === uid() && !x.read_at && typeof x.id === 'number').map(x => x.id);
      const st = await db.select('messages', `select=id,read_at&id=in.(${ids.join(',')})`);
      st.forEach(s => { const m = S.msgs[id].find(x => x.id === s.id); if (m) m.read_at = s.read_at; });
    }
    if ((S.msgs[id]||[]).some(x => x.sender_id !== uid() && !x.read_at)){
      await db.rpc('mark_read', {conv:id}); S.msgs[id].forEach(x => { if (x.sender_id !== uid()) x.read_at = x.read_at || new Date().toISOString(); });
      const c = (S.convs||[]).find(x => x.id === id); if (c){ S.unread = Math.max(0, S.unread - Number(c.unread||0)); c.unread = 0; }
    }
    delete errs['m:'+id];
  } catch(e){ if (first) errs['m:'+id] = e.message; }
  updateChat();
}
let lastMsgHtml = '';
function updateChat(){
  const r = route(); if (r.name !== 'chat') return;
  if (!$('#msgs')){ render(true); return; }
  const box = $('#msgs'), html = msgsHtml(r.arg);
  if (html !== lastMsgHtml){ const atEnd = box.scrollHeight - box.scrollTop - box.clientHeight < 80; box.innerHTML = html; lastMsgHtml = html; if (atEnd || !box.dataset.init){ box.scrollTop = box.scrollHeight; box.dataset.init = 1; } }
}
AFTER.chat = (id) => {
  clearInterval(chatPoll); lastMsgHtml = '';
  if (!(S.convs||[]).some(x => x.id === id)){ want('convs', 5e3, L.convs); return; }
  const c = S.convs.find(x => x.id === id);
  if (c.listing_id && !S.byId.has(c.listing_id)) L.listing(c.listing_id)().catch(()=>{});
  pollChat(id, !S.msgs[id]);
  chatPoll = setInterval(() => { if (route().name === 'chat' && route().arg === id && !document.hidden) pollChat(id, false); else clearInterval(chatPoll); }, 4000);
  const box = $('#msgs'); if (box) box.scrollTop = box.scrollHeight;
};
async function sendMsg(id, body, input){
  body = String(body||'').trim(); if (!body) return;
  const tmp = {id: 'tmp'+Date.now(), sender_id: uid(), body, created_at: new Date().toISOString(), read_at:null};
  S.msgs[id] = (S.msgs[id]||[]).concat(tmp); updateChat(); const box = $('#msgs'); if (box) box.scrollTop = box.scrollHeight;
  if (input) input.value = '';
  try {
    const row = (await db.insert('messages', {conversation_id:id, sender_id:uid(), body}, 'select=id,sender_id,body,kind,read_at,created_at'))[0];
    S.msgs[id] = S.msgs[id].map(x => x === tmp ? row : x);
    const c = (S.convs||[]).find(x => x.id === id); if (c){ c.last_message = body; c.last_at = row.created_at; c.archived = false; }
  } catch(e){ S.msgs[id] = S.msgs[id].filter(x => x !== tmp); toast(e.message); if (input) input.value = body; }
  updateChat();
}
async function openChatFor(lid){
  if (!loggedIn()) return needLogin('p/' + lid);
  try { toast('चैट खुल रही है...'); const cid = await db.rpc('start_conversation', {lid}); await L.convs(); fresh.convs = Date.now(); go('chat/' + cid); }
  catch(e){ toast(e.message); }
}

/* ---------- PROFILE ---------- */
SCREENS.profile = () => {
  const m = S.me || {email: auth.user && auth.user.email};
  const item = (act, icn, t, s) => `<button data-act="${act}"><span class="mi">${ic(icn)}</span><div><b>${t}</b><small>${s}</small></div><span class="chev">${ic('right')}</span></button>`;
  return `<div class="screen">
  <header class="hdr"><div class="row">${brand()}<button class="ibtn" data-act="notifset">${ic('gear')}</button></div></header>
  <div class="pcard"><div class="pa" data-act="photo">${m.avatar_url ? `<img src="${esc(m.avatar_url)}">` : ic('user')}<span class="cam">${ic('camera')}</span></div>
    <div style="min-width:0"><b>${esc(m.name||'अपना नाम जोड़ें')}${isPremium(m)?` <span class="vchip prem">${ic('star','f')}प्रीमियम</span>`:''}</b>
    <div class="ln">${ic('mail')}${esc(m.email||'')}</div>${m.phone?`<div class="ln">${ic('phone')}+91 ${esc(m.phone)}</div>`:''}
    ${m.role==='admin'?`<span class="vchip" style="margin-top:6px">${ic('shield')}एडमिन</span>`:''}</div>
    <input type="file" id="avfile" accept="image/*" hidden></div>
  <div class="card"><div style="display:flex;justify-content:space-between;margin-bottom:12px"><b>मेरी जानकारी</b><button class="more" style="margin:0" data-act="editprofile">बदलें ${ic('right')}</button></div>
    <div class="info"><div><small>${ic('user')}पूरा नाम</small>${esc(m.name||'—')}</div><div><small>${ic('phone')}मोबाइल</small>${m.phone?'+91 '+esc(m.phone):'—'}</div>
    <div><small>${ic('mail')}ईमेल</small>${esc(m.email||'—')}</div><div><small>${ic('pin')}शहर</small>${esc(m.city?cityHi(m.city):'—')}</div></div></div>
  <div class="menu">
    ${m.role==='admin' ? item('admin','shield','एडमिन पैनल','लिस्टिंग जाँचें, रिपोर्ट, प्रीमियम सेटिंग') : ''}
    ${item('dash','home','मेरी लिस्टिंग (मालिक डैशबोर्ड)','अपनी प्रॉपर्टी देखें, बदलें या हटाएं')}
    ${item('premium','star','प्रीमियम प्लान','फीचर्ड लिस्टिंग और ज़्यादा किरायेदार')}
    ${item('editprofile','user','प्रोफाइल अपडेट करें','नाम, मोबाइल और शहर')}
    ${item('help','help','सहायता और सपोर्ट','FAQ और संपर्क करें')}
    ${item('terms','doc','नियम और गोपनीयता नीति','ऐप की शर्तें')}
    ${item('shareapp','share','ऐप शेयर करें','दोस्तों को RoomMitra के बारे में बताएं')}
    ${item('logout','logout','लॉगआउट','अपने खाते से बाहर जाएँ')}
    ${item('deleteacc','trash','अकाउंट डिलीट करें','अपना अकाउंट और सारा डेटा हटाएं')}
  </div>
  <div class="thanks">${ic('heart','f')}<div style="flex:1"><b style="color:var(--ink)">RoomMitra का उपयोग करने के लिए धन्यवाद!</b><br>सुरक्षित रहिए | अच्छे लोगों से जुड़िए</div><div style="text-align:right">वर्जन<br><b>${esc(window.RM_VERSION||'1.0')}</b></div></div>
  <div style="height:12px"></div>
  ${nav('')}</div>`;
};
AFTER.profile = () => {
  want('me', 30e3, L.me);
  const f = $('#avfile'); if (f) f.addEventListener('change', async () => {
    const file = f.files[0]; if (!file) return;
    try { toast('फोटो अपलोड हो रही है...');
      const blob = await dataToBlob(await shrink(file, 400, .8));
      const url = await storage.upload('avatars', `${uid()}/avatar-${rid()}.jpg`, blob);
      const old = S.me && S.me.avatar_url;
      await db.update('profiles', `id=eq.${uid()}`, {avatar_url:url}, true);
      S.me.avatar_url = url; LS.set('me', S.me);
      if (old){ const p = storage.pathFromUrl('avatars', old); if (p) storage.remove('avatars', [p]).catch(()=>{}); }
      toast('फोटो बदल गई ✓'); render(true);
    } catch(e){ toast(e.message); }
  });
};

/* ---------- PREMIUM ---------- */
SCREENS.premium = () => {
  const on = S.config.premium_enabled === true, m = S.me || {};
  return `<div class="screen nonav">${topbar('प्रीमियम')}
  <div class="premhero">${ic('star','f')}<h2>RoomMitra प्रीमियम</h2><p>अपनी प्रॉपर्टी को सबसे ऊपर दिखाएं और जल्दी किरायेदार पाएं।</p>
    ${isPremium(m) ? `<span class="vchip prem">आप प्रीमियम हैं — ${new Date(m.premium_until).toLocaleDateString('hi-IN')} तक</span>` : ''}</div>
  ${!on ? `<div class="freebanner">🎉 <b>अभी लॉन्च ऑफर:</b> सब कुछ बिल्कुल फ्री है! असीमित लिस्टिंग, चैट और कॉल। प्रीमियम प्लान जल्द शुरू होंगे।</div>` : ''}
  <div class="wrap">${!S.plans ? (errs.config ? errBox('config') : loader()) : S.plans.map(p => `<div class="plan">
    <div class="pt"><b>${esc(p.title)}</b><span class="pp">₹${p.price_inr}</span></div><p>${esc(p.description)}</p>
    <button class="btn ${on?'pri':'out'} block" data-buy="${esc(p.code)}" ${on?'':'disabled'}>${on ? 'खरीदें' : 'जल्द आ रहा है'}</button></div>`).join('')}</div>
  <div class="note">${ic('lock')} भुगतान Google Play से सुरक्षित तरीके से होगा।</div>
  </div>`;
};
AFTER.premium = () => want('config', 60e3, L.config);

/* ---------- ADMIN ---------- */
SCREENS.admin = () => {
  if (!S.me || S.me.role !== 'admin') return `<div class="screen nonav">${topbar()}<div class="empty"><b>यह पेज केवल एडमिन के लिए है</b></div></div>`;
  const t = S.adminTab, st = S.adminStats || {}, list = S.adminList;
  const rows = !list ? [] : t === 'pending' ? list.filter(l => l.status === 'active' && !l.verified) : t === 'hidden' ? list.filter(l => l.status !== 'active') : list;
  return `<div class="screen nonav">${topbar('एडमिन पैनल', `<button class="ibtn" data-act="reloadadmin">${ic('refresh')}</button>`)}
  <div class="stats">
    <div class="st"><div class="t"><span>${ic('users')}</span>यूज़र</div><b>${st.users??'–'}</b></div>
    <div class="st b"><div class="t"><span>${ic('home')}</span>सक्रिय लिस्टिंग</div><b>${st.active??'–'}</b><small>कुल ${st.listings??'–'}</small></div>
    <div class="st p"><div class="t"><span>${ic('clock')}</span>जाँच बाकी</div><b>${st.unverified??'–'}</b></div>
    <div class="st"><div class="t"><span>${ic('info')}</span>खुली रिपोर्ट</div><b>${st.reports??'–'}</b><small>${st.chats??'–'} चैट</small></div>
  </div>
  <div class="card"><div class="tg" style="border:0;padding:0"><span><b>प्रीमियम चालू</b><br><small style="color:var(--ink3)">चालू करने पर फ्री यूज़र ${S.config.free_listing_limit} सक्रिय लिस्टिंग तक सीमित होंगे</small></span>
    <button class="sw ${S.config.premium_enabled===true?'on':''}" data-act="togglepremium"></button></div></div>
  <div class="tabs3"><button class="${t==='pending'?'on':''}" data-atab="pending">जाँच बाकी</button><button class="${t==='reports'?'on':''}" data-atab="reports">रिपोर्ट</button>
    <button class="${t==='all'?'on':''}" data-atab="all">सभी</button><button class="${t==='hidden'?'on':''}" data-atab="hidden">छिपी</button></div>
  <div class="wrap" style="margin-top:12px">${!list ? (errs.admin ? errBox('admin') : loader()) :
    t === 'reports' ? ((S.reports||[]).length ? S.reports.map(r => `<div class="card" style="margin:0 0 10px">
      <b>${esc(r.listing ? r.listing.title : 'हटाई गई लिस्टिंग')}</b><div class="loc">${r.listing ? placeHi(r.listing) : ''}</div>
      <p style="margin:8px 0;color:var(--ink2)">“${esc(r.reason)}” · ${esc(ago(r.created_at))}</p>
      <div class="oacts">${r.listing ? `<button data-open="${r.listing.id}">${ic('eye')}देखें</button><button data-adm="hide:${r.listing.id}">${ic('lock')}छिपाएं</button>` : ''}<button data-adm="done:${r.id}">${ic('check')}निपटा दिया</button></div></div>`).join('')
      : `<div class="empty">${ic('checkc')}<b>कोई खुली रिपोर्ट नहीं</b></div>`) :
    rows.length ? rows.map(l => listCard(l, 'admin')).join('') : `<div class="empty">${ic('checkc')}<b>यहाँ कुछ नहीं है</b></div>`}</div>
  </div>`;
};
AFTER.admin = () => { want('admin', 20e3, L.admin); want('config', 60e3, L.config); };

/* ================= sheets ================= */
function sheet(html){
  closeSheet();
  const bg = document.createElement('div'); bg.className = 'sheet-bg'; bg.id = 'sheet';
  bg.innerHTML = `<div class="sheet"><div class="grab"></div>${html}</div>`;
  bg.addEventListener('click', e => { if (e.target === bg) closeSheet(); });
  document.body.appendChild(bg);
  return bg;
}
function closeSheet(){ const s = $('#sheet'); if (s){ s.remove(); return true; } return false; }
const TERMS = () => `<h3>नियम, शर्तें और गोपनीयता नीति</h3>
<p><b>1. सेवा:</b> RoomMitra मकान मालिकों और किरायेदारों को सीधे जोड़ने वाला प्लेटफ़ॉर्म है। किराए का सौदा मालिक और किरायेदार के बीच होता है; RoomMitra उसका पक्ष नहीं है।</p>
<p><b>2. लिस्टिंग:</b> जानकारी और फोटो सही होनी चाहिए। गलत, डुप्लीकेट या धोखे वाली लिस्टिंग बिना सूचना हटाई जा सकती है।</p>
<p><b>3. सुरक्षा:</b> कमरा देखे बिना कोई एडवांस/टोकन राशि न भेजें।</p>
<p><b>4. हम क्या डेटा रखते हैं:</b> ईमेल (लॉगिन के लिए), नाम, मोबाइल नंबर, शहर, प्रोफाइल फोटो, आपकी लिस्टिंग, पसंदीदा और चैट संदेश। यह डेटा सुरक्षित सर्वर (Supabase, मुंबई) पर रखा जाता है और केवल ऐप चलाने के लिए इस्तेमाल होता है। हम आपका डेटा बेचते नहीं हैं। लिस्टिंग पर डाला गया नाम और नंबर उसे देखने वालों को दिखता है।</p>
<p><b>5. अकाउंट डिलीट:</b> प्रोफाइल → "अकाउंट डिलीट करें" से आपकी लिस्टिंग, फोटो, पसंदीदा और चैट तुरंत हट जाते हैं और लॉगिन 7 दिन में स्थायी रूप से मिटा दिया जाता है।</p>
<p><b>6. संपर्क:</b> ${esc(S.config.support_email || RM_SUPPORT_EMAIL)}</p>`;

/* ================= actions ================= */
function needUser(next){ if (loggedIn()) return true; toast('पहले लॉगिन करें'); needLogin(next); return false; }
async function toggleFav(id, btn){
  if (!needUser()) return;
  const on = S.favs.has(id);
  on ? S.favs.delete(id) : S.favs.add(id);
  $$(`[data-fav="${id}"]`).forEach(b => b.classList.toggle('on', !on));
  try {
    if (on) await db.remove('favorites', `user_id=eq.${uid()}&listing_id=eq.${enc(id)}`);
    else await db.insert('favorites', {user_id:uid(), listing_id:id}, '', true);
    toast(on ? 'पसंदीदा से हटाया' : 'पसंदीदा में जोड़ा ❤');
    if (S.favList){ S.favList = on ? S.favList.filter(l => l.id !== id) : S.favList.concat(S.byId.get(id) || []); if (route().name === 'fav') render(true); }
  } catch(e){ on ? S.favs.add(id) : S.favs.delete(id); $$(`[data-fav="${id}"]`).forEach(b => b.classList.toggle('on', on)); toast(e.message); }
}
function contact(id, how){
  const l = S.byId.get(id); if (!l) return;
  if (!needUser('p/' + id)) return;
  if (how === 'call') openUrl('tel:+91' + l.contact_phone);
  else openUrl('https://wa.me/91' + (l.whatsapp || l.contact_phone) + '?text=' + encodeURIComponent(`नमस्ते! मैंने RoomMitra पर आपकी लिस्टिंग "${l.title}" (${l.area}, ${l.city} – ${rs(l.price)}/माह) देखी। क्या यह अभी उपलब्ध है?`));
}
function share(text){
  if (Native && Native.share) Native.share(text);
  else if (navigator.share) navigator.share({title:'RoomMitra', text}).catch(()=>{});
  else { navigator.clipboard && navigator.clipboard.writeText(text); toast('कॉपी हो गया'); }
}
const shareListing = l => share(`${l.title} – ${rs(l.price)}/माह\n📍 ${l.area}, ${l.city}\n\nRoomMitra ऐप पर देखें 👇\n${PLAY_URL}`);
async function adminAct(kind, id){
  try {
    if (kind === 'done'){ await db.update('reports', `id=eq.${id}`, {status:'done'}, true); S.reports = S.reports.filter(r => String(r.id) !== String(id)); }
    else {
      const l = S.byId.get(id); let patch;
      if (kind === 'verify') patch = {verified: !(l && l.verified)};
      if (kind === 'feature') patch = {featured_until: l && isFeatured(l) ? null : new Date(Date.now() + 7*864e5).toISOString()};
      if (kind === 'hide') patch = {status: l && l.status === 'hidden' ? 'active' : 'hidden'};
      const row = (await db.update('listings', `id=eq.${enc(id)}&${LIST_SELECT}`, patch))[0];
      remember([row]); if (S.adminList) S.adminList = S.adminList.map(x => x.id === id ? row : x);
      refetch('city:' + row.city); S.cityList[row.city] = null;
    }
    toast('हो गया ✓'); refetch('admin'); render(true);
  } catch(e){ toast(e.message); }
}
async function deleteListing(id){
  const l = S.byId.get(id);
  try {
    await db.remove('listings', `id=eq.${enc(id)}`);
    if (l && l.owner_id === uid()){ const paths = l.images.map(u => storage.pathFromUrl('listing-photos', u)).filter(Boolean); storage.remove('listing-photos', paths).catch(()=>{}); }
    S.byId.delete(id); S.mine = S.mine && S.mine.filter(x => x.id !== id); S.adminList = S.adminList && S.adminList.filter(x => x.id !== id);
    if (l) S.cityList[l.city] = (S.cityList[l.city]||[]).filter(x => x.id !== id);
    closeSheet(); toast('लिस्टिंग हटा दी गई');
    if (route().name === 'p') back(); else render(true);
  } catch(e){ toast(e.message); }
}
async function deleteAccount(){
  const me = uid(); closeSheet(); toast('अकाउंट डिलीट हो रहा है...');
  try {
    for (const b of ['listing-photos','avatars']){
      const files = await storage.list(b, me).catch(() => []);
      await storage.remove(b, (files||[]).filter(f => f.name).map(f => `${me}/${f.name}`)).catch(()=>{});
    }
    await db.remove('listings', `owner_id=eq.${me}`);
    await db.remove('favorites', `user_id=eq.${me}`);
    await db.remove('conversations', `or=(tenant_id.eq.${me},owner_id.eq.${me})`);
    await db.update('profiles', `id=eq.${me}`, {name:'', phone:null, address:null, avatar_url:null, city:null, deletion_requested_at:new Date().toISOString()}, true);
    await auth.signOut(); resetUser(); depth = 0; S.cityList = {};
    location.replace('#home'); toast('आपका अकाउंट और डेटा हटा दिया गया');
  } catch(e){ toast(e.message); }
}

const ACT = {
  back: () => back(),
  city: () => sheet(`<h3>शहर चुनें</h3>${RM_CITIES.map(c => `<button class="opt ${c.id===S.city?'on':''}" data-city="${c.id}">${ic('pin')} ${c.hi} (${c.id}) ${c.id===S.city?ic('check'):''}</button>`).join('')}`),
  me: () => go(loggedIn() ? 'profile' : 'login/profile'),
  newpost: () => { S.draft = null; go('post'); },
  clearf: () => { S.f = freshFilter(); S.cat = null; S.chip = 'all'; S.q = ''; render(true); },
  resetf: () => { S.f = freshFilter(); S.cat = null; render(true); },
  applyf: () => { if (depth > 0){ depth--; history.back(); } else location.replace('#search'); },
  mapview: () => openUrl(mapsUrl(`room for rent ${S.city}`)),
  readmore: (t) => { $('#desc').classList.toggle('clamp'); t.innerHTML = $('#desc').classList.contains('clamp') ? `और पढ़ें ${ic('down')}` : `कम दिखाएं ${ic('down')}`; },
  addphoto: () => { if (S.draft.imgs.length >= 10) return toast('अधिकतम 10 फोटो'); $('#pfile').click(); },
  resend: () => sendOtp(otp.email),
  changeemail: () => { clearInterval(otp.iv); otp.sent = false; render(true); },
  terms: () => sheet(TERMS()),
  dash: () => go('dash'), premium: () => go('premium'), admin: () => go('admin'),
  reloadmine: () => { refetch('mine'); S.mine = null; render(true); },
  reloadconvs: () => { refetch('convs'); render(true); },
  reloadadmin: () => { refetch('admin'); render(true); },
  shareapp: () => share(`किराए का कमरा, PG या फ्लैट ढूँढ रहे हैं? नाहन, पांवटा साहिब, शिमला और सोलन में सीधे मालिक से बात करें — RoomMitra ऐप पर 👇\n${PLAY_URL}`),
  editprofile: (first) => { const m = S.me || {}; sheet(`<h3>${first===true?'अपनी प्रोफाइल पूरी करें':'प्रोफाइल अपडेट करें'}</h3>
    <div class="fld"><label>पूरा नाम <i>*</i></label><div class="inp">${ic('user')}<input id="pf_name" value="${esc(m.name||'')}" maxlength="80" placeholder="आपका नाम"></div></div>
    <div class="fld"><label>मोबाइल नंबर</label><div class="inp">${ic('phone')}<input id="pf_phone" inputmode="tel" maxlength="10" value="${esc(m.phone||'')}" placeholder="10 अंक"></div></div>
    <div class="fld"><label>शहर</label><div class="inp">${ic('pin')}<select id="pf_city"><option value="">चुनें</option>${RM_CITIES.map(c => `<option value="${c.id}" ${m.city===c.id?'selected':''}>${c.hi}</option>`).join('')}</select>${ic('down')}</div></div>
    <button class="btn pri block" data-act="saveprofile">सेव करें</button>`); },
  saveprofile: async () => {
    const name = $('#pf_name').value.trim(), phone = $('#pf_phone').value.replace(/\D/g,''), city = $('#pf_city').value;
    if (name.length < 2) return toast('अपना नाम भरें');
    if (phone && !/^[6-9]\d{9}$/.test(phone)) return toast('सही 10 अंकों का मोबाइल नंबर डालें');
    try { await db.update('profiles', `id=eq.${uid()}`, {name, phone: phone || null, city: city || null}, true);
      Object.assign(S.me = S.me || {}, {name, phone: phone || null, city: city || null}); LS.set('me', S.me);
      closeSheet(); toast('प्रोफाइल सेव हो गई ✓'); render(true);
    } catch(e){ toast(e.message); }
  },
  photo: () => $('#avfile').click(),
  notifset: () => sheet(`<h3>सेटिंग</h3><p>संदेश ऐप खोलने पर अपने-आप आते हैं। पुश नोटिफिकेशन अगले अपडेट में आएंगे।</p>
    <button class="opt" data-act="city">${ic('pin')} डिफ़ॉल्ट शहर: ${esc(cityHi(S.city))}</button>`),
  help: () => sheet(`<h3>सहायता और सपोर्ट</h3>
    <p><b>प्रॉपर्टी कैसे लिस्ट करूँ?</b><br>नीचे ➕ "लिस्ट करें" दबाएं, जानकारी और फोटो डालें, सबमिट करें।</p>
    <p><b>क्या लिस्टिंग फ्री है?</b><br>हाँ, अभी RoomMitra पर सब कुछ 100% फ्री है।</p>
    <p><b>"सत्यापित" बैज कैसे मिलेगा?</b><br>हमारी टीम लिस्टिंग की जाँच करके बैज लगाती है।</p>
    <p><b>मालिक से कैसे बात करूँ?</b><br>किसी भी कमरे पर कॉल, WhatsApp या 💬 चैट बटन दबाएं।</p>
    <p><b>धोखाधड़ी से कैसे बचें?</b><br>कमरा देखे बिना कोई पैसा न भेजें। संदिग्ध लिस्टिंग को ⋮ → रिपोर्ट करें।</p>
    <button class="btn pri block" data-act="mailus">${ic('mail')} हमें ईमेल करें</button>`),
  mailus: () => openUrl('mailto:' + (S.config.support_email || RM_SUPPORT_EMAIL) + '?subject=' + encodeURIComponent('RoomMitra सहायता')),
  logout: () => sheet(`<h3>लॉगआउट करें?</h3><p>आप दोबारा ईमेल से लॉगिन कर सकते हैं।</p><div class="grid2"><button class="btn out" data-act="closesheet">रद्द करें</button><button class="btn pri" data-act="dologout">लॉगआउट</button></div>`),
  dologout: async () => { closeSheet(); await auth.signOut(); resetUser(); depth = 0; location.replace('#home'); toast('लॉगआउट हो गया'); },
  deleteacc: () => sheet(`<h3>अकाउंट डिलीट करें?</h3><p>आपकी सारी लिस्टिंग, फोटो, पसंदीदा और चैट <b>हमेशा के लिए</b> हट जाएंगे। यह वापस नहीं हो सकता।</p>
    <div class="grid2"><button class="btn out" data-act="closesheet">रद्द करें</button><button class="btn pri" style="background:#9b2c2c" data-act="dodelete">हाँ, डिलीट करें</button></div>`),
  dodelete: () => deleteAccount(),
  closesheet: () => closeSheet(),
  togglepremium: async () => {
    const v = !(S.config.premium_enabled === true);
    try { await db.update('app_config', 'key=eq.premium_enabled', {value: v}, true); S.config.premium_enabled = v; toast(v ? 'प्रीमियम चालू' : 'प्रीमियम बंद — सब फ्री'); render(true); }
    catch(e){ toast(e.message); }
  }
};

/* ================= events ================= */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-go],[data-act],[data-open],[data-fav],[data-call],[data-wa],[data-cat],[data-city],[data-chip],[data-ptype],[data-damen],[data-famen],[data-sw],[data-dnow],[data-rooms],[data-type],[data-thumb],[data-share],[data-more],[data-maps],[data-rmphoto],[data-edit],[data-del],[data-toggle],[data-mtab],[data-atab],[data-chat],[data-q],[data-chatmore],[data-chatwith],[data-retry],[data-adm],[data-buy],[data-sheetact]');
  if (!t) return;
  const d = t.dataset;
  if (d.fav){ e.stopPropagation(); toggleFav(d.fav, t); return; }
  if (d.call){ e.stopPropagation(); contact(d.call, 'call'); return; }
  if (d.wa){ e.stopPropagation(); contact(d.wa, 'wa'); return; }
  if (d.chatwith){ openChatFor(d.chatwith); return; }
  if (d.retry){ refetch(d.retry); delete errs[d.retry]; render(true); return; }
  if (d.edit){ e.stopPropagation(); S.draft = null; go('post/' + d.edit); return; }
  if (d.del){ e.stopPropagation(); sheet(`<h3>लिस्टिंग हटाएं?</h3><p>यह लिस्टिंग और इसकी फोटो हमेशा के लिए हट जाएंगी।</p><div class="grid2"><button class="btn out" data-act="closesheet">रद्द करें</button><button class="btn pri" style="background:#9b2c2c" data-sheetact="del:${d.del}">हटाएं</button></div>`); return; }
  if (d.toggle){ e.stopPropagation(); const l = S.byId.get(d.toggle); const status = l.status === 'paused' ? 'active' : 'paused';
    db.update('listings', `id=eq.${enc(l.id)}&${LIST_SELECT}`, {status}).then(r => { remember(r); S.mine = S.mine.map(x => x.id === l.id ? r[0] : x); S.cityList[l.city] = null; refetch('city:'+l.city); toast(status==='paused'?'लिस्टिंग रोकी गई':'लिस्टिंग फिर से चालू'); render(true); }).catch(er => toast(er.message)); return; }
  if (d.adm){ e.stopPropagation(); const [k, id] = d.adm.split(':'); adminAct(k, id); return; }
  if (d.go){ if (d.go === 'post') S.draft = null; go(d.go); return; }
  if (d.open){ go('p/' + d.open); return; }
  if (d.chat){ go('chat/' + d.chat); return; }
  if (d.cat){ S.cat = d.cat; S.chip = 'all'; S.q = ''; go('search'); return; }
  if (d.city){ S.city = d.city; LS.set('city', S.city); S.f.loc = ''; closeSheet(); toast(cityHi(d.city) + ' चुना गया'); render(true); return; }
  if (d.chip){ S.chip = d.chip; render(true); return; }
  if (d.mtab){ S.msgTab = d.mtab; render(true); return; }
  if (d.atab){ S.adminTab = d.atab; render(true); return; }
  if (d.ptype){ const dr = S.draft; dr.ptype = d.ptype;
    dr.kind = d.ptype==='pg' ? 'PG' : d.ptype==='shop' ? 'Shop' : d.ptype==='room' ? (/RK/.test(dr.kind)?dr.kind:'Room') : (/BHK/.test(dr.kind)?dr.kind:'1BHK');
    $$('[data-ptype]').forEach(b => b.classList.toggle('on', b.dataset.ptype === d.ptype));
    const k = $('[data-d="kind"]'); if (k) k.value = dr.kind; return; }
  if (d.damen){ const a = S.draft.amen, i = a.indexOf(d.damen); i<0 ? a.push(d.damen) : a.splice(i,1); t.classList.toggle('on'); return; }
  if (d.dnow){ S.draft.now = !S.draft.now; t.classList.toggle('on', S.draft.now); return; }
  if (d.famen){ const a = S.f.amen, i = a.indexOf(d.famen); i<0 ? a.push(d.famen) : a.splice(i,1); t.classList.toggle('on'); updRange(); return; }
  if (d.sw){ S.f[d.sw] = !S.f[d.sw]; t.classList.toggle('on'); updRange(); return; }
  if (d.rooms){ const n = +d.rooms; S.f.rooms = S.f.rooms===n ? 0 : n; $$('[data-rooms]').forEach(b => b.classList.toggle('on', +b.dataset.rooms===S.f.rooms)); updRange(); return; }
  if (d.type){ S.f.type = S.f.type===d.type ? '' : d.type; $$('[data-type]').forEach(b => b.classList.toggle('on', b.dataset.type===S.f.type)); updRange(); return; }
  if (d.thumb){ const tr = $('#track'); tr.scrollTo({left: tr.clientWidth * +d.thumb, behavior:'smooth'}); return; }
  if (d.share){ shareListing(S.byId.get(d.share)); return; }
  if (d.maps){ const l = S.byId.get(d.maps); openUrl(mapsUrl(`${l.area}, ${l.city}`)); return; }
  if (d.rmphoto){ S.draft.imgs.splice(+d.rmphoto, 1); $('#photos').innerHTML = photoStrip(); return; }
  if (d.buy){ toast('Google Play भुगतान जल्द जुड़ेगा'); return; }
  if (d.more){ const l = S.byId.get(d.more); const mine = l.owner_id === uid();
    sheet(`<h3>विकल्प</h3>${mine ? `<button class="opt" data-edit="${l.id}">${ic('edit')} लिस्टिंग बदलें</button>` : `<button class="opt" data-chatwith="${l.id}">${ic('chat')} मालिक से चैट करें</button>`}
      <button class="opt" data-share="${l.id}">${ic('share')} शेयर करें</button>${mine ? '' : `<button class="opt" data-sheetact="report:${l.id}">${ic('info')} रिपोर्ट करें</button>`}`); return; }
  if (d.chatmore){ const c = S.convs.find(x => x.id === d.chatmore);
    sheet(`<h3>${esc(c.other_name)}</h3><button class="opt" data-sheetact="arch:${c.id}">${ic('file')} ${c.archived?'आर्काइव से हटाएं':'आर्काइव करें'}</button>
      <button class="opt" data-sheetact="block:${c.id}">${ic('x')} ${c.blocked_by?'अनब्लॉक करें':'ब्लॉक करें'}</button><button class="opt" data-sheetact="clear:${c.id}">${ic('trash')} चैट मिटाएं</button>`); return; }
  if (d.q){ const id = route().arg; const txt = {avail:'नमस्ते! क्या यह कमरा अभी खाली है?', visit:'मैं कमरा देखने कब आ सकता/सकती हूँ?', final:'आखिरी किराया कितना रहेगा? बिजली-पानी शामिल है?',
      yes:'हाँ, कमरा अभी उपलब्ध है।', come:'आप कल शाम 5 बजे देखने आ सकते हैं।', callme:'मुझे कॉल कर लीजिए, नंबर लिस्टिंग पर है।'}[d.q]; sendMsg(id, txt); return; }
  if (d.sheetact){ const [a, id] = d.sheetact.split(':');
    if (a==='del') deleteListing(id);
    if (a==='report'){ if (!needUser('p/'+id)) return closeSheet();
      sheet(`<h3>रिपोर्ट करें</h3>${['गलत जानकारी / फोटो','कमरा अब उपलब्ध नहीं','एडवांस पैसे मांग रहा है','धोखाधड़ी / फर्जी लिस्टिंग','दूसरा कारण'].map(r => `<button class="opt" data-sheetact="rep:${id}:${r}">${esc(r)}</button>`).join('')}`); }
    if (a==='rep'){ const reason = d.sheetact.split(':').slice(2).join(':');
      db.insert('reports', {listing_id:id, reporter_id:uid(), reason}, '', true).then(() => toast('रिपोर्ट भेज दी गई। धन्यवाद!')).catch(e2 => toast(/duplicate|23505/.test(e2.message+e2.code) ? 'आप पहले ही रिपोर्ट कर चुके हैं' : e2.message)); closeSheet(); }
    if (a==='arch'||a==='block'){ const c = S.convs.find(x => x.id === id); const val = a==='arch' ? !c.archived : !c.blocked_by;
      db.rpc('set_conversation_flag', {conv:id, flag: a==='arch'?'archive':'block', val}).then(() => { if (a==='arch') c.archived = val; else c.blocked_by = val ? uid() : null; closeSheet(); toast('हो गया ✓'); if (route().name==='chat' && val) back(); else render(true); }).catch(e2 => toast(e2.message)); }
    if (a==='clear'){ db.remove('conversations', `id=eq.${enc(id)}`).then(() => { S.convs = S.convs.filter(x => x.id !== id); closeSheet(); toast('चैट मिटा दी गई'); back(); }).catch(e2 => toast(e2.message)); }
    return; }
  if (d.act) ACT[d.act] && ACT[d.act](t, e);
});
document.addEventListener('input', e => {
  const t = e.target, d = t.dataset;
  if (d.d && S.draft){ let v = t.value; if (['price','sqft','phone','wa'].includes(d.d)){ v = v.replace(/\D/g,''); t.value = v; } S.draft[d.d] = v;
    if (d.d === 'desc') $('#dcount').textContent = v.length + '/1000'; }
  if (d.range){ let v = +t.value; if (d.range==='min'){ v = Math.min(v, S.f.max - 500); S.f.min = v; } else { v = Math.max(v, S.f.min + 500); S.f.max = v; } t.value = v; updRange(); }
  if (d.in){ S.f[d.in] = t.value; updRange(); }
});
document.addEventListener('change', e => {
  const t = e.target, d = t.dataset;
  if (d.d && S.draft){ S.draft[d.d] = t.value; if (d.d === 'city'){ const dl = $('#pareas'); if (dl) dl.innerHTML = ((RM_CITIES.find(c=>c.id===t.value)||{}).areas||[]).map(a=>`<option value="${esc(a)}">`).join(''); } }
  if (d.change === 'city'){ S.city = t.value; LS.set('city', S.city); S.f.loc = ''; render(true); }
  if (d.change === 'sort'){ S.sort = t.value; render(true); }
});
document.addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target, k = f.dataset.form;
  if (k === 'homesearch'){ S.q = f.q.value; S.cat = null; S.chip = 'all'; go('search'); }
  if (k === 'search'){ S.q = f.q.value; render(true); }
  if (k === 'post') submitPost();
  if (k === 'sendotp') sendOtp($('#lemail').value);
  if (k === 'verify') verifyOtp($('#lcode').value.trim(), f.dataset.next);
  if (k === 'chat') sendMsg(f.dataset.id, f.m.value, f.m);
});

/* native wrapper से safe-area */
window.rmInsets = (top, bottom) => { const r = document.documentElement.style; r.setProperty('--sat', top + 'px'); r.setProperty('--sab', bottom + 'px'); };

/* हर 30 सेकंड नए संदेश गिनें */
setInterval(() => { if (loggedIn() && !document.hidden){ L.unread().then(() => { updateBadges(); if (route().name === 'msgs') { refetch('convs'); want('convs', 0, L.convs); } }).catch(()=>{}); } }, 30000);
document.addEventListener('visibilitychange', () => { if (!document.hidden && loggedIn()) L.unread().then(updateBadges).catch(()=>{}); });

/* ================= boot ================= */
function boot(){
  const sp = document.createElement('div'); sp.className = 'splash';
  sp.innerHTML = `${LOGO().replace('class="mark"','class="logo"')}<h1>Room<b>Mitra</b></h1><div class="slg">कमरा ढूँढना हुआ <span>आसान।</span></div>
    <div class="sub">मकान मालिक और किराएदार को<br>सीधे जोड़ने वाला प्लेटफ़ॉर्म<br><b style="color:var(--lime)">नाहन • पांवटा साहिब • शिमला • सोलन</b></div>${CITY}
    <svg class="wave" viewBox="0 0 400 130" preserveAspectRatio="none"><path d="M0 40C80 0 160 70 250 40S360 10 400 30V130H0z" fill="#1F8A5B"/><path d="M0 70c90-30 170 40 260 10s110-20 140-10V130H0z" fill="#0F5E3F"/><path d="M0 100c100-25 200 25 400-5V130H0z" fill="#0B4D33"/></svg>`;
  document.body.appendChild(sp);
  if (!location.hash) location.replace('#home');
  want('config', 60e3, L.config);
  if (loggedIn()) afterLogin().then(() => { updateBadges(); if (['home','search','p','fav'].includes(route().name)) render(true); });
  render(false);
  setTimeout(() => { sp.classList.add('hide'); setTimeout(() => sp.remove(), 500); }, 1400);
}
boot();
})();
