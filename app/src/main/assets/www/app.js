/* RoomMitra – app logic */
(function(){
'use strict';

/* ================= icons ================= */
const P = {
  home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9v11h5v-6h4v6h5V9"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  heart:'<path d="M12 20s-7.5-4.6-9.2-9.3C1.6 7.4 3.7 4 7.2 4c2 0 3.6 1.1 4.8 2.8C13.2 5.1 14.8 4 16.8 4c3.5 0 5.6 3.4 4.4 6.7C19.5 15.4 12 20 12 20z"/>',
  chat:'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
  bell:'<path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
  pin:'<path d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12z"/><circle cx="12" cy="10" r="2.6"/>',
  sliders:'<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  down:'<path d="m6 9 6 6 6-6"/>', right:'<path d="m9 6 6 6-6 6"/>', back:'<path d="M19 12H5M11 6l-6 6 6 6"/>', left:'<path d="m15 6-6 6 6 6"/>',
  bed:'<path d="M3 18V7M3 13h18v5M21 13v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="10.5" r="1.8"/>',
  bath:'<path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM6 12V5a2 2 0 0 1 4 0"/><path d="M7 19l-1 2M17 19l1 2"/>',
  size:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 15 15 9M10 9h5v5"/>',
  building:'<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M11 21v-3h2v3"/>',
  phone:'<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
  share:'<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/>',
  more:'<circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/>',
  camera:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  check:'<path d="m5 12 5 5 9-10"/>',
  checkc:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  shield:'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  wifi:'<path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r=".8"/>',
  ac:'<rect x="3" y="5" width="18" height="8" rx="2"/><path d="M7 10h10M8 16v3M12 16v4M16 16v3"/>',
  wardrobe:'<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M12 3v18M10 11v2M14 11v2"/>',
  drop:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  car:'<path d="M5 16V11l2-5h10l2 5v5"/><path d="M3 16h18v3H3zM6 11h12"/><circle cx="7.5" cy="16" r="1"/><circle cx="16.5" cy="16" r="1"/>',
  bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  balcony:'<path d="M4 10h16M4 21h16M6 10v11M10 10v11M14 10v11M18 10v11M7 10V4h10v6"/>',
  food:'<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M16 3c-2 1-3 4-3 7h3v11"/>',
  tv:'<rect x="3" y="6" width="18" height="12" rx="2"/><path d="m9 2 3 4 3-4M8 21h8"/>',
  lift:'<rect x="5" y="3" width="14" height="18" rx="1"/><path d="m9 9 3-3 3 3M9 15l3 3 3-3"/>',
  kitchen:'<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M4 9h16M8 6h0M12 6h0M8 13v4"/>',
  star:'<path d="m12 3 2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4 6.5 20.3l1-6.2L3 9.7l6.2-.9z"/>',
  cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13 7 4 4"/>',
  trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  send:'<path d="m3 11 18-8-6 18-3-8z"/><path d="m12 13 9-10"/>',
  smile:'<circle cx="12" cy="12" r="9"/><path d="M8.5 14a4.5 4.5 0 0 0 7 0M9 9.5h0M15 9.5h0"/>',
  clip:'<path d="m20 11-8.5 8.5a5 5 0 0 1-7-7L13 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L14 7"/>',
  image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
  file:'<path d="M6 2h8l5 5v15H6z"/><path d="M14 2v5h5M9 13h7M9 17h5"/>',
  sort:'<path d="M7 4v16M3 8l4-4 4 4M17 20V4M13 16l4 4 4-4"/>',
  map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/>',
  grid:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  list:'<path d="M9 6h11M9 12h11M9 18h11M4 6h0M4 12h0M4 18h0"/>',
  refresh:'<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
  target:'<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.3 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.3l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1A2 2 0 1 1 19.7 7l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h0"/>',
  logout:'<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c3 0 5 2 5 5"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  video:'<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
  houseplus:'<path d="M3 10.5 12 3l9 7.5M5 9v11h14V9"/><path d="M12 11v6M9 14h6"/>',
  girl:'<circle cx="12" cy="9" r="4"/><path d="M8 9c0-5 8-5 8 0v4c0 1-1 2-2 2M8 9v4c0 1 1 2 2 2M5 21c0-3 3-5 7-5s7 2 7 5"/>',
  store:'<path d="M4 9 5 4h14l1 5M4 9v11h16V9M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0A2.7 2.7 0 0 0 20 9"/><path d="M10 20v-5h4v5"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  door:'<path d="M5 21V3h11v18M16 5h3v16"/><path d="M13 12h0"/>',
  funnel:'<path d="M3 4h18l-7 9v6l-4 2v-8z"/>',
  bookmark:'<path d="M6 3h12v18l-6-4-6 4z"/>',
  ddcheck:'<path d="m2 12 5 5 9-10M12 15l2 2 9-10"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h0"/>',
  doc:'<path d="M6 2h8l5 5v15H6z"/><path d="M9 12h7M9 16h7M9 8h3"/>',
  geyser:'<rect x="6" y="2" width="12" height="15" rx="5"/><path d="M10 17v3M14 17v3M9 7h6M12 10.5c-1 1.2-1.5 2-1.5 2.7a1.5 1.5 0 0 0 3 0c0-.7-.5-1.5-1.5-2.7z"/>',
  flame:'<path d="M12 22a7 7 0 0 0 7-7c0-4-3-6.5-4-10-2 2-2.5 4-2.5 5.5C11 9 10 8 9.5 6.5 7 9 5 11.5 5 15a7 7 0 0 0 7 7z"/><path d="M12 22a3 3 0 0 1-3-3c0-2 1.5-3 3-5 1.5 2 3 3 3 5a3 3 0 0 1-3 3z"/>',
  mountain:'<path d="m2 20 7-12 4 6 3-4 6 10z"/><path d="m7.5 10.5 1.5 1.5 1.5-1.5"/><circle cx="18" cy="5" r="2"/>',
  rupee:'<path d="M6 4h12M6 9h12M9 4c6 0 6 9 0 9H6l8 8"/>',
  sparkle:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  h24:'<path d="M20 11a8 8 0 1 0-2 5.3"/><path d="M20 4v5h-5"/><path d="M8 10.5a1.6 1.6 0 1 1 2.7 1.2L8 14.5h3M13.5 10v2.5h2.5M15.5 10v4.5"/>'
};
const ic = (n, cls='') => `<svg class="i ${cls}" viewBox="0 0 24 24">${P[n]||''}</svg>`;
const WA = `<svg class="i f" viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>`;
const GOOGLE = `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.6a4.8 4.8 0 0 1-2.1 3.1v2.6h3.4c2-1.8 3.1-4.5 3.1-7.5z"/><path fill="#34A853" d="M12 22.5c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.7A10.5 10.5 0 0 0 12 22.5z"/><path fill="#FBBC05" d="M6.2 14.1a6.3 6.3 0 0 1 0-4.1V7.3H2.7a10.5 10.5 0 0 0 0 9.5z"/><path fill="#EA4335" d="M12 5.7c1.5 0 2.9.5 4 1.6l3-3A10.5 10.5 0 0 0 2.7 7.3L6.2 10C7 7.5 9.3 5.7 12 5.7z"/></svg>`;

/* brand logo: house outline + window + leaf */
const LOGO = (c='#fff') => `<svg class="mark" viewBox="0 0 64 64" fill="none">
  <path d="M8 30 32 9l24 21" stroke="${c}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M44 15v-4h6v10" stroke="${c}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M14 27v26h36V27" stroke="${c}" stroke-width="5" stroke-linejoin="round"/>
  <rect x="25" y="22" width="6" height="6" rx="1" fill="#7ED957"/><rect x="33" y="22" width="6" height="6" rx="1" fill="#7ED957"/>
  <rect x="25" y="30" width="6" height="6" rx="1" fill="#7ED957"/><rect x="33" y="30" width="6" height="6" rx="1" fill="#7ED957"/>
  <path d="M32 50c-9 0-12-7-12-11 7 0 12 4 12 11zM32 50c9 0 12-7 12-11-7 0-12 4-12 11z" fill="#7ED957"/>
  <path d="M32 50V42" stroke="${c==='#fff'?'#0B4D33':'#fff'}" stroke-width="1.6" stroke-linecap="round"/>
</svg>`;
const HOUSE_ILL = `<svg class="house" viewBox="0 0 160 120"><ellipse cx="88" cy="112" rx="70" ry="7" fill="#cfe8d6"/>
 <circle cx="28" cy="88" r="16" fill="#9fd4a8"/><rect x="26" y="96" width="4" height="16" fill="#6b8f72"/>
 <circle cx="146" cy="84" r="13" fill="#9fd4a8"/><rect x="144" y="92" width="4" height="20" fill="#6b8f72"/>
 <path d="M44 62 92 22l48 40" fill="#0F5E3F"/><rect x="54" y="58" width="76" height="54" fill="#F6EEDC"/>
 <path d="M40 64 92 20l52 44" stroke="#0B4D33" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
 <rect x="112" y="26" width="9" height="18" fill="#0B4D33"/>
 <rect x="64" y="76" width="18" height="36" rx="2" fill="#0F5E3F"/><rect x="96" y="72" width="22" height="20" rx="2" fill="#FFC857"/>
 <path d="M107 72v20M96 82h22" stroke="#F6EEDC" stroke-width="2"/><rect x="84" y="40" width="16" height="14" rx="2" fill="#A8D8B9"/></svg>`;
const PLANT = `<svg class="plant" viewBox="0 0 120 120"><path d="M60 118V60" stroke="#7ED957" stroke-width="3"/>
 <path d="M60 80C40 80 28 64 30 48c18 2 30 14 30 32zM60 70c20 0 32-16 30-32-18 2-30 14-30 32zM60 96c-16 0-26-12-24-26 14 1 24 12 24 26zM60 92c16 0 26-12 24-26-14 1-24 12-24 26z" fill="#2E8B57"/></svg>`;
const CITY = `<svg class="city" viewBox="0 0 260 90" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round">
 <path d="M4 88h252"/><path d="M2 70 34 40 58 58 96 20 120 44M166 36 200 12 226 34 258 58" opacity=".55"/><circle cx="22" cy="68" r="8"/><path d="M22 76v12"/><circle cx="238" cy="68" r="8"/><path d="M238 76v12"/>
 <path d="M44 88V62l22-20 22 20v26M55 88V74h10v14M58 58h8"/><path d="M82 62l26-24 26 24v26H82zM100 88V72h16v16M100 54h16v8h-16z"/>
 <path d="M126 88V6h36v82M134 16h4M146 16h4M134 28h4M146 28h4M134 40h4M146 40h4M134 52h4M146 52h4M140 88V74h10v14"/>
 <path d="M170 88V36h40v52M178 46h8M194 46h8M178 58h8M194 58h8M182 72h24v8h-24z"/></svg>`;

/* ================= state ================= */
const LS = {
  get(k, d){ try{ const v = localStorage.getItem('rm_'+k); return v==null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem('rm_'+k, JSON.stringify(v)); return true; }catch(e){ toast('फोन में जगह कम है — कुछ फोटो हटाएँ'); return false; } }
};
const S = {
  user: LS.get('user', null),
  city: LS.get('city', 'Nahan'),
  favs: new Set(LS.get('favs', ['L1','L3','L10','L16'])),
  mine: LS.get('mine', []),
  chats: LS.get('chats', null) || JSON.parse(JSON.stringify(RM_CHATS)),
  prefs: LS.get('prefs', {msg:true, newroom:true, offer:false}),
  q: '', chip: 'all', sort: 'low', view: 'list',
  f: freshFilter(),
  draft: null
};
function freshFilter(){ return {min:1000, max:25000, loc:'', dist:'5', rooms:0, type:'', amen:[], verified:false, women:false, direct:false, girls:false, now:false, commercial:false}; }
/* पुराना डेमो डेटा (पिछले वर्ज़न का) हो तो रीसेट करें */
if (LS.get('ver', 0) !== RM_DATA_VERSION){
  S.chats = JSON.parse(JSON.stringify(RM_CHATS)); S.favs = new Set(['L1','L3','L10','L16']);
  LS.set('chats', S.chats); LS.set('favs', [...S.favs]); LS.set('ver', RM_DATA_VERSION);
}
if (!RM_CITIES.some(c => c.id === S.city)){ S.city = RM_CITIES[0].id; LS.set('city', S.city); }
const saveFavs = () => LS.set('favs', [...S.favs]);
const saveChats = () => LS.set('chats', S.chats);

const allListings = () => [...S.mine.filter(l => l.status !== 'draft'), ...RM_SEED];
const byId = id => S.mine.find(l => l.id === id) || RM_SEED.find(l => l.id === id);

/* ================= helpers ================= */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rs = n => '₹' + Number(n||0).toLocaleString('en-IN');
const areaHi = a => RM_AREA_HI[a] || a;
const cityHi = c => (RM_CITIES.find(x => x.id === c) || {}).hi || c;
const placeHi = l => `${esc(areaHi(l.area))}, ${esc(cityHi(l.city))}`;
const placeEn = l => `${esc(l.area)}, ${esc(l.city)}`;
function toast(t){ const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('show'), 2200); }
const Native = window.RMNative || null;

function openUrl(u){ if (Native && Native.openExternal) Native.openExternal(u); else window.open(u, '_blank'); }
function call(phone){ openUrl('tel:+91' + phone); }
function whatsapp(phone, l){
  const msg = l ? `नमस्ते! मैंने RoomMitra पर आपकी लिस्टिंग "${l.title}" (${l.area}, ${l.city} – ${rs(l.price)}/माह) देखी। क्या यह अभी उपलब्ध है?` : 'नमस्ते!';
  openUrl('https://wa.me/91' + phone + '?text=' + encodeURIComponent(msg));
}
function share(l){
  const t = `${l.title} – ${rs(l.price)}/माह\n📍 ${l.area}, ${l.city}\nRoomMitra ऐप पर देखें!`;
  if (Native && Native.share) Native.share(t);
  else if (navigator.share) navigator.share({title:'RoomMitra', text:t}).catch(()=>{});
  else { navigator.clipboard && navigator.clipboard.writeText(t); toast('लिंक कॉपी हो गया'); }
}
function mapsUrl(q){ return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q + ', ' + RM_REGION); }

/* ================= router ================= */
let depth = 0;
function go(h){ depth++; location.hash = h; }
function back(){ if (closeSheet()) return true; if (depth > 0){ depth--; history.back(); return true; } if (route().name !== 'home'){ location.replace('#home'); return true; } return false; }
window.rmBack = () => back();
function route(){
  const h = decodeURIComponent(location.hash.slice(1)) || 'home';
  const [name, arg] = h.split('/');
  return {name, arg};
}
const NEED_LOGIN = ['post','dash','msgs','chat','profile'];
function render(){
  const r = route();
  if (NEED_LOGIN.includes(r.name) && !S.user){ location.replace('#login/' + encodeURIComponent(r.name + (r.arg ? '|' + r.arg : ''))); return; }
  if (Native && Native.setLightStatus) Native.setLightStatus(r.name === 'login');
  const fn = SCREENS[r.name] || SCREENS.home;
  const app = $('#app');
  app.innerHTML = fn(r.arg);
  window.scrollTo(0, 0); setTimeout(() => window.scrollTo(0, 0), 0);
  (AFTER[r.name] || (()=>{}))(r.arg);
}
window.addEventListener('hashchange', render);

/* ================= shared pieces ================= */
function unreadCount(){ return S.chats.reduce((a, c) => a + (c.unread||0), 0); }
function nav(active){
  const it = (id, h, label, icon) => `<button class="${active===id?'on':''}" data-go="${h}">${ic(icon, 'fillable')}<span>${label}</span></button>`;
  const u = unreadCount();
  return `<nav class="nav">
    ${it('home','home','होम','home')}
    ${it('search','search','खोज','search')}
    <button data-go="post" class="${active==='post'?'on':''}"><span class="plus">${ic('plus')}</span><span>लिस्ट करें</span></button>
    ${it('fav','fav','पसंदीदा','heart')}
    <button class="${active==='msgs'?'on':''}" data-go="msgs">${u?`<span class="bdg">${u}</span>`:''}${ic('chat')}<span>संदेश</span></button>
  </nav>`;
}
function topbar(title, right=''){
  return `<header class="hdr"><div class="row backrow">
    <button class="ibtn" data-act="back">${ic('back')}</button>
    <div class="brand">${LOGO()}<div><div class="name">Room<b>Mitra</b></div><div class="slogan">${title||'कमरा ढूँढना हुआ आसान।'}</div></div></div>
    ${right}</div></header>`;
}
function heartBtn(l, cls='heart'){ const on = S.favs.has(l.id); return `<button class="${cls} ${on?'on':''}" data-fav="${l.id}" aria-label="पसंदीदा">${ic('heart')}</button>`; }
function specLine(l){
  const first = l.ptype === 'flat' || /BHK/.test(l.kind) ? `${ic('home')}${esc(l.kind)}` : (l.sharing ? `${ic('bed')}Bed (Sharing)` : `${ic('bed')}${l.kind==='1RK'?'1RK':'1 Room'}`);
  return `<div class="meta"><span>${first}</span><span>${ic('bath')}${l.baths} Bathroom</span>${l.sqft?`<span>${ic('size')}${l.sqft} sq ft</span>`:''}${l.floor?`<span>${ic('building')}${esc(l.floor)}</span>`:''}</div>`;
}
function roomCard(l){
  return `<div class="rc" data-open="${l.id}">
    <div class="ph"><img src="${esc(l.imgs[0])}" alt="" loading="lazy"><span class="price">${rs(l.price)}/माह</span>${heartBtn(l)}</div>
    <div class="bd"><h4>${esc(l.title)}</h4><div class="loc">${ic('pin')}${placeEn(l)}</div>
      <div class="meta"><span>${ic('bed')}${l.rooms} Room</span><span>${ic('bath')}${l.baths} Washroom</span>${l.sqft?`<span>${ic('size')}${l.sqft} sq ft</span>`:''}</div>
      ${l.tags && l.tags[0] ? `<span class="tag">${esc(l.tags[0])}</span>` : ''}
    </div></div>`;
}
function listCard(l, mode='search'){
  const tags = (l.tags||[]).slice(0, 2).map(t => `<span class="tag">${esc(t)}</span>`).join('');
  return `<div class="lc" data-open="${l.id}">
    <div class="ph"><img src="${esc(l.imgs[0])}" alt="" loading="lazy">
      ${mode==='dash' ? `<span class="status ${l.status==='paused'?'off':''}">${l.status==='paused'?'अप्रकाशित':'सक्रिय'}</span>` : heartBtn(l)}
      <span class="cnt">${ic('camera')}1/${l.imgs.length}</span></div>
    <div class="bd">
      <div class="top"><h4>${esc(l.title)}</h4><span class="pill">${rs(l.price)}/माह</span></div>
      <div class="loc">${ic('pin')}${placeHi(l)}</div>
      ${specLine(l)}
      ${mode==='search' ? `<div class="desc">${esc(l.desc)}</div>
        <div class="acts"><button class="btn pri" data-call="${l.id}">${ic('phone')}कॉल करें</button><button class="btn out wa" data-wa="${l.id}">${WA}WhatsApp</button></div>` : ''}
      ${mode==='fav' ? `<div class="desc">${esc((l.amen||[]).map(a => (RM_AMENITIES.find(x=>x.id===a)||{}).hi).filter(Boolean).join(', '))}</div>${tags}` : ''}
      ${mode==='dash' ? `${tags}<div class="oacts">
        <button data-toggle="${l.id}">${ic(l.status==='paused'?'eye':'lock')}${l.status==='paused'?'प्रकाशित करें':'रोकें'}</button>
        <button data-edit="${l.id}">${ic('edit')}बदलें</button><button class="del" data-del="${l.id}">${ic('trash')}हटाएं</button></div>` : ''}
    </div></div>`;
}

/* ================= screens ================= */
const SCREENS = {};
const AFTER = {};

/* ---------- HOME ---------- */
const CATS = [
  {id:'single', hi:'सिंगल रूम', ic:'bed'}, {id:'double', hi:'डबल रूम', ic:'bed'}, {id:'pg', hi:'पीजी', ic:'home'},
  {id:'flat', hi:'फ्लैट', ic:'building'}, {id:'boys', hi:'बॉयज़ हॉस्टल', ic:'user'}, {id:'girls', hi:'गर्ल्स हॉस्टल', ic:'girl'}
];
function catMatch(l, c){
  switch(c){
    case 'single': return l.rooms === 1 && !l.sharing && l.ptype !== 'flat';
    case 'double': return l.sharing || l.rooms >= 2;
    case 'pg': return l.ptype === 'pg';
    case 'flat': return l.ptype === 'flat';
    case 'boys': return l.ptype === 'pg' && l.gender !== 'girls';
    case 'girls': return l.gender === 'girls' || l.safeWomen;
    default: return true;
  }
}
SCREENS.home = () => {
  const inCity = allListings().filter(l => l.city === S.city);
  const featured = (inCity.filter(l => l.featured).length ? inCity.filter(l => l.featured) : inCity).slice(0, 6);
  const near = inCity.filter(l => !featured.includes(l)).slice(0, 8);
  return `<div class="screen">
  <header class="hdr tall">
    ${PLANT}
    <div class="row">
      <div class="brand">${LOGO()}<div><div class="name">Room<b>Mitra</b></div><div class="slogan">कमरा ढूँढना हुआ आसान।</div></div></div>
      <button class="citybtn" data-act="city">${ic('pin')}<span>${esc(cityHi(S.city))}</span>${ic('down')}</button>
      <button class="ibtn solid" data-act="me">${ic('user')}</button>
    </div>
    <h2>अपना नया कमरा खोजें</h2><div class="lead">नाहन • पांवटा साहिब • शिमला • सोलन</div>
  </header>
  <div class="wrap pull"><form class="search" data-form="homesearch">${ic('search')}
    <input name="q" placeholder="किसी क्षेत्र, लोकेशन या प्रॉपर्टी का नाम खोजें..." autocomplete="off">
    <button type="button" class="fbtn" data-go="filter">${ic('sliders')}</button></form></div>
  <div class="cats">${CATS.map(c => `<button class="cat" data-cat="${c.id}"><span class="ic">${ic(c.ic)}</span>${c.hi}</button>`).join('')}</div>
  <div class="wrap sec"><h3>Featured Rooms</h3><a data-go="search">सभी देखें ${ic('right')}</a></div>
  ${featured.length ? `<div class="hs">${featured.map(roomCard).join('')}</div>` : `<div class="empty">${ic('home')}<b>${esc(S.city)} में अभी कोई लिस्टिंग नहीं</b>पहली प्रॉपर्टी आप लिस्ट करें!</div>`}
  <div class="promo"><div class="t"><h4>${ic('houseplus')} अपना कमरा लिस्ट करें</h4><p>मालिक बनें और अपनी प्रॉपर्टी लाखों लोगों तक पहुंचाएं</p>
    <button class="btn pri sm" data-go="post">अब लिस्ट करें ${ic('right')}</button></div>${HOUSE_ILL}</div>
  ${near.length ? `<div class="wrap sec"><h3>Nearby Suggestions</h3><a data-go="search">सभी देखें ${ic('right')}</a></div><div class="hs">${near.map(roomCard).join('')}</div>` : ''}
  <div class="wrap sec"><h3>लोकप्रिय शहर</h3></div>
  <div class="cities">${RM_CITIES.map(c => `<button class="city" data-city="${c.id}"><div class="ci" style="background-image:linear-gradient(transparent 40%,rgba(0,0,0,.55)),url(${c.img})">${ic('pin')} ${c.hi}</div></button>`).join('')}</div>
  <div style="height:16px"></div>
  ${nav('home')}</div>`;
};

/* ---------- SEARCH ---------- */
const CHIPS = [{id:'all',t:'सभी',ic:'bed'},{id:'PG',t:'PG',ic:'user'},{id:'1RK',t:'1RK',ic:'home'},{id:'1BHK',t:'1BHK',ic:'home'},{id:'2BHK',t:'2BHK',ic:'home'},{id:'3BHK',t:'3BHK+',ic:'home'}];
function activeFilterCount(){
  const f = S.f, d = freshFilter(); let n = 0;
  for (const k in d){ if (k==='amen'){ if (f.amen.length) n++; } else if (k!=='dist' && f[k] !== d[k]) n++; }
  if (S.cat) n++;
  return n;
}
function results(){
  const q = S.q.trim().toLowerCase(), f = S.f;
  let r = allListings().filter(l => l.city === S.city);
  if (q) r = r.filter(l => [l.title, l.area, areaHi(l.area), l.kind, l.desc, l.city].join(' ').toLowerCase().includes(q));
  if (S.chip !== 'all') r = r.filter(l => S.chip === '3BHK' ? /^[3-9]BHK/.test(l.kind) : l.kind === S.chip);
  if (S.cat) r = r.filter(l => catMatch(l, S.cat));
  r = r.filter(l => l.price >= f.min && (f.max >= 25000 || l.price <= f.max));
  if (f.loc.trim()){ const s = f.loc.trim().toLowerCase(); r = r.filter(l => (l.area + ' ' + areaHi(l.area)).toLowerCase().includes(s)); }
  if (f.rooms) r = r.filter(l => f.rooms === 4 ? l.rooms >= 4 : l.rooms === f.rooms);
  if (f.type) r = r.filter(l => f.type === 'hostel' ? (l.ptype === 'pg' && (l.gender || l.sharing)) : l.ptype === f.type);
  if (f.amen.length) r = r.filter(l => f.amen.every(a => (l.amen||[]).includes(a)));
  if (f.verified) r = r.filter(l => l.verified);
  if (f.women) r = r.filter(l => l.safeWomen || l.gender === 'girls');
  if (f.direct) r = r.filter(l => l.direct);
  if (f.girls) r = r.filter(l => l.gender === 'girls');
  if (f.now) r = r.filter(l => l.now);
  if (f.commercial) r = r.filter(l => l.ptype === 'shop');
  const s = S.sort;
  r.sort((a,b) => s==='low' ? a.price-b.price : s==='high' ? b.price-a.price : (b.created||0)-(a.created||0) || b.views-a.views);
  return r;
}
SCREENS.search = () => {
  const r = results(); const n = activeFilterCount();
  return `<div class="screen">
  <header class="hdr" style="padding-bottom:14px"><div class="row">
    <div class="brand">${LOGO()}<div><div class="name">Room<b>Mitra</b></div><div class="slogan">कमरा ढूँढना हुआ आसान।</div></div></div>
    <button class="ibtn glass" data-go="fav">${ic('heart')}</button></div></header>
  <div class="wrap" style="margin-top:14px"><form class="sbar" data-form="search">${ic('search')}
    <input name="q" value="${esc(S.q)}" placeholder="${esc(cityHi(S.city))} में कमरा खोजें" autocomplete="off">
    <label class="cty">${ic('pin')}<select data-change="city">${RM_CITIES.map(c => `<option value="${c.id}" ${c.id===S.city?'selected':''}>${c.hi}</option>`).join('')}</select>${ic('down')}</label></form></div>
  <div class="chips">${CHIPS.map(c => `<button class="${S.chip===c.id?'on':''}" data-chip="${c.id}">${ic(c.ic)}${c.t}</button>`).join('')}</div>
  <div class="tools">
    <button class="tb" data-go="filter">${ic('sliders')}फ़िल्टर ${n?`<span class="n">${n}</span>`:''}</button>
    <label class="tb">${ic('sort')}<select class="tb" style="border:0;padding:0" data-change="sort">
      <option value="low" ${S.sort==='low'?'selected':''}>किराया (कम से ज्यादा)</option>
      <option value="high" ${S.sort==='high'?'selected':''}>किराया (ज्यादा से कम)</option>
      <option value="new" ${S.sort==='new'?'selected':''}>नई / लोकप्रिय</option></select></label>
    <button class="tb" data-act="mapview" style="margin-left:auto">${ic('map')}मैप</button>
  </div>
  <div class="rcount"><span>कुल ${r.length} परिणाम</span>${n ? `<button class="more" data-act="clearf">${ic('refresh')} फ़िल्टर हटाएं</button>` : ''}</div>
  <div class="wrap">${r.length ? r.map(l => listCard(l)).join('') : `<div class="empty">${ic('search')}<b>कोई कमरा नहीं मिला</b>फ़िल्टर बदलकर या दूसरा शहर चुनकर देखें।</div>`}</div>
  ${nav('search')}</div>`;
};

/* ---------- FILTER ---------- */
SCREENS.filter = () => {
  const f = S.f;
  const amen = ['wifi','geyser','heater','bed','wardrobe','water','parking','view','food','power'];
  const tg = (k, t) => `<div class="tg"><span>${t}</span><button class="sw ${f[k]?'on':''}" data-sw="${k}"></button></div>`;
  return `<div class="screen nonav">
  ${topbar('', `<button class="ibtn" data-go="search">${ic('search')}</button><button class="ibtn" data-go="fav">${ic('heart')}</button>`)}
  <div class="fhead"><div class="c">${ic('funnel')}</div><div><h2>फ़िल्टर</h2><p>अपनी जरूरत के अनुसार कमरे को फ़िल्टर करें</p></div>
    <button class="btn out" data-act="resetf">${ic('refresh')} सभी हटाएं</button></div>
  <div class="card"><h3><span class="ibtn" style="width:26px;height:26px;background:var(--g8);color:#fff">₹</span> किराया रेंज (प्रति माह)</h3>
    <div class="rvals"><span id="rmin">${rs(f.min)}</span><span id="rmax">${f.max>=25000?'₹25,000+':rs(f.max)}</span></div>
    <div class="range"><div class="tr"></div><div class="fl" id="rfill"></div>
      <input type="range" min="1000" max="25000" step="500" value="${f.min}" data-range="min">
      <input type="range" min="1000" max="25000" step="500" value="${f.max}" data-range="max"></div></div>
  <div class="card"><div class="grid2">
    <div class="fld" style="margin:0"><label>${ic('pin')} स्थान</label><div class="inp"><input data-in="loc" value="${esc(f.loc)}" placeholder="कॉलोनी, एरिया या इलाके का नाम" list="areas"></div>
      <datalist id="areas">${((RM_CITIES.find(c=>c.id===S.city)||{}).areas||[]).map(a=>`<option value="${esc(a)}">`).join('')}</datalist></div>
    <div class="fld" style="margin:0"><label>${ic('target')} दूरी</label><div class="inp"><select data-in="dist">${['1','3','5','10','20'].map(d=>`<option value="${d}" ${f.dist===d?'selected':''}>${d} km तक</option>`).join('')}</select>${ic('down')}</div></div>
  </div></div>
  <div class="card"><h3>${ic('bed')} कमरों की संख्या</h3><div class="opts">${[1,2,3,4].map(n=>`<button class="${f.rooms===n?'on':''}" data-rooms="${n}">${n===4?'4+':n}</button>`).join('')}</div>
    <h3 style="margin-top:16px">${ic('home')} प्रकार</h3><div class="opts">${[['pg','PG'],['flat','फ्लैट'],['room','रूम'],['hostel','बॉयज/गर्ल्स हॉस्टल']].map(([k,t])=>`<button class="${f.type===k?'on':''}" data-type="${k}">${t}</button>`).join('')}</div></div>
  <div class="card"><h3>${ic('star')} सुविधाएं (एक या अधिक चुनें)</h3><div class="chk" style="grid-template-columns:repeat(5,1fr)">
    ${amen.map(a => { const m = RM_AMENITIES.find(x=>x.id===a); const on = f.amen.includes(a); return `<button class="${on?'on':''}" data-famen="${a}"><span class="tk">${ic('check')}</span>${ic(m.ic)}${m.hi}</button>`; }).join('')}</div></div>
  <div class="card"><h3>${ic('gear')} अन्य विकल्प</h3>
    ${tg('verified','केवल सत्यापित प्रॉपर्टी')}${tg('women','सुरक्षित महिला प्रॉपर्टी')}${tg('direct','केवल मालिक से सीधे')}${tg('girls','लड़कियों के लिए')}${tg('now','तुरंत उपलब्ध')}${tg('commercial','कमर्शियल प्रॉपर्टी')}</div>
  <div class="cta"><button class="btn pri" data-act="applyf">${ic('search')} फ़िल्टर लागू करें (<span id="fcount">${results().length}</span> परिणाम)</button></div>
  </div>`;
};
AFTER.filter = () => updRange();
function updRange(){
  const f = S.f, a = (f.min-1000)/24000*100, b = (f.max-1000)/24000*100;
  const fl = $('#rfill'); if (fl){ fl.style.left = a+'%'; fl.style.width = (b-a)+'%'; }
  const mn = $('#rmin'), mx = $('#rmax'); if (mn){ mn.textContent = rs(f.min); mx.textContent = f.max>=25000 ? '₹25,000+' : rs(f.max); }
  const c = $('#fcount'); if (c) c.textContent = results().length;
}

/* ---------- DETAIL ---------- */
SCREENS.p = (id) => {
  const l = byId(id);
  if (!l) return `<div class="screen nonav">${topbar()}<div class="empty">${ic('home')}<b>यह लिस्टिंग अब उपलब्ध नहीं है</b></div></div>`;
  l.views = (l.views||0) + 1; if (l.mine) LS.set('mine', S.mine);
  const amen = (l.amen||[]).map(a => RM_AMENITIES.find(x => x.id === a)).filter(Boolean);
  const isFlat = l.ptype === 'flat';
  const o = l.owner || {};
  return `<div class="screen nonav">
  <div class="gal"><div class="track" id="track">${l.imgs.map(s => `<img src="${esc(s)}" alt="">`).join('')}</div>
    <div class="bar"><button class="ibtn" data-act="back">${ic('back')}</button>
      <div class="r">${heartBtn(l, 'ibtn')}<button class="ibtn" data-share="${l.id}">${ic('share')}</button><button class="ibtn" data-more="${l.id}">${ic('more')}</button></div></div>
    <span class="cnt" id="gcount">${ic('camera')}1/${l.imgs.length}</span>
    ${l.verified ? `<span class="vbadge">${ic('checkc')}Verified</span>` : ''}</div>
  <div class="thumbs">${l.imgs.map((s,i) => `<img src="${esc(s)}" data-thumb="${i}" class="${i?'':'on'}" alt="">`).join('')}</div>
  <div class="dt">
    <div class="head"><h1>${esc(l.title)}</h1><span class="pill">${rs(l.price)}/माह</span></div>
    <div class="loc" style="font-size:14px;margin-top:6px">${ic('pin')}${placeHi(l)}</div>
    <div class="specs">
      <div>${ic(isFlat?'home':'bed')}${isFlat ? esc(l.kind) : (l.sharing?'Sharing':l.rooms+' Room')}<small>कमरे</small></div>
      <div>${ic('bath')}${l.baths} Bathroom<small>बाथरूम</small></div>
      <div>${ic('size')}${l.sqft ? l.sqft + ' sq ft' : '—'}<small>एरिया</small></div>
      <div>${ic(isFlat?'building':'user')}${isFlat ? esc(l.floor) : (l.ptype==='pg'?'PG':esc(l.floor||l.kind))}<small>${(!isFlat && l.ptype==='pg')?'प्रकार':'मंजिल'}</small></div>
    </div>
    <div class="blk"><h3>${ic('doc')} विवरण</h3><p class="clamp" id="desc">${esc(l.desc)}</p>
      ${l.desc.length > 120 ? `<button class="more" data-act="readmore">और पढ़ें ${ic('down')}</button>` : ''}
      ${l.furnish ? `<span class="tag">${esc(l.furnish)}</span>` : ''}${l.now ? `<span class="tag">तुरंत उपलब्ध</span>` : ''}${l.gender==='girls' ? `<span class="tag">लड़कियों के लिए</span>` : l.gender==='boys' ? `<span class="tag">लड़कों के लिए</span>` : ''}</div>
    ${amen.length ? `<div class="blk"><h3>${ic('star')} सुविधाएँ</h3><div class="amen">${amen.map(a => `<div><span class="ac">${ic(a.ic)}</span>${a.en}</div>`).join('')}</div></div>` : ''}
    <div class="blk"><h3>${ic('user')} मालिक की जानकारी</h3>
      <div class="owner" data-owner="${l.id}"><div class="av">${o.photo ? `<img src="${esc(o.photo)}" style="width:100%;height:100%;object-fit:cover">` : ic('user')}</div>
        <div style="flex:1;min-width:0"><div class="nm">${esc(o.name)}</div>${l.verified ? `<span class="vchip">${ic('shield')}Verified Owner</span>` : `<small>नया मालिक</small>`}</div>
        <div class="rt">${o.reviews ? `<span>${ic('star','f')}${o.rating} (${o.reviews} reviews)</span>` : ''}<span>${ic('cal')}${esc(o.since||'नया')}</span></div>${ic('right')}</div></div>
    <div class="blk"><h3>${ic('pin')} लोकेशन</h3>
      <div class="mapbox"><div class="map">${miniMap(l.area)}</div>
        <div><div class="loc" style="margin:0 0 8px;color:var(--ink)">${ic('pin')}${placeHi(l)}</div>
        <button class="btn out sm" data-maps="${l.id}">${GOOGLE} Google Maps पर देखें</button></div></div></div>
    <div class="safe">${ic('shield')}<div><b>सुरक्षित किराया अनुभव</b><p>मिलने से पहले कोई एडवांस पैसा न भेजें। प्रॉपर्टी खुद जाकर देखें।</p></div></div>
    <div style="height:10px"></div>
  </div>
  <div class="cta"><button class="btn out wa" data-wa="${l.id}">${WA} WhatsApp करें</button><button class="btn pri" data-call="${l.id}">${ic('phone')} कॉल करें</button></div>
  </div>`;
};
AFTER.p = () => {
  const tr = $('#track'); if (!tr) return;
  tr.addEventListener('scroll', () => {
    const i = Math.round(tr.scrollLeft / tr.clientWidth);
    const c = $('#gcount'); if (c) c.innerHTML = ic('camera') + (i+1) + '/' + tr.children.length;
    $$('[data-thumb]').forEach((t, k) => t.classList.toggle('on', k === i));
  }, {passive:true});
};
function miniMap(label){
  return `<svg viewBox="0 0 200 110" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="200" height="110" fill="#EEF2EF"/>
  <path d="M0 30h200M0 78h200M50 0v110M128 0v110M0 100 200 8" stroke="#fff" stroke-width="7"/><path d="M0 30h200M0 78h200M50 0v110M128 0v110" stroke="#dde4df" stroke-width="1"/>
  <rect x="62" y="40" width="54" height="28" rx="4" fill="#D7EBDC"/><rect x="140" y="44" width="50" height="26" rx="4" fill="#D7EBDC"/><path d="M160 0c-4 30 20 50 40 60" stroke="#BFDDF2" stroke-width="6" fill="none"/>
  <path d="M100 52s-10-9.5-10-17a10 10 0 0 1 20 0c0 7.5-10 17-10 17z" fill="#E5484D"/><circle cx="100" cy="35" r="3.6" fill="#fff"/>
  <text x="100" y="72" text-anchor="middle" font-size="11" font-weight="700" fill="#14251C" font-family="sans-serif">${esc(label)}</text></svg>`;
}

/* ---------- FAVOURITES ---------- */
SCREENS.fav = () => {
  const r = [...S.favs].map(byId).filter(Boolean);
  return `<div class="screen">
  ${topbar('', `<button class="ibtn" data-go="search">${ic('search')}</button><button class="ibtn solid" data-act="me">${ic('user')}</button>`)}
  <div class="hello"><div class="av" style="background:var(--g8);color:#fff">${ic('heart','f')}</div><div style="flex:1"><b>मेरे पसंदीदा कमरे</b><p>आपके द्वारा सेव किए गए सभी कमरे यहां दिखाई देंगे।</p></div>
    <span class="btn out sm">${ic('bookmark')} कुल ${r.length}</span></div>
  <div class="wrap" style="margin-top:14px">${r.length ? r.map(l => listCard(l, 'fav')).join('') : `<div class="empty">${ic('heart')}<b>अभी कोई पसंदीदा कमरा नहीं</b>कमरे पर ♡ दबाकर सेव करें।<br><br><button class="btn pri sm" data-go="search">कमरे खोजें</button></div>`}</div>
  ${nav('fav')}</div>`;
};

/* ---------- POST / EDIT ---------- */
const PTYPES = [['room','कमरा','bed'],['flat','फ्लैट','building'],['house','मकान','home'],['pg','PG','users'],['shop','दुकान/ऑफिस','store']];
const FORM_AMEN = ['wifi','geyser','heater','bed','wardrobe','water','parking','power','view','balcony','kitchen','food'];
function newDraft(){
  const u = S.user || {};
  return {ptype:'room', city:S.city, area:'', price:'', rooms:'1', baths:'1', sqft:'', floor:'', furnish:'सेमी फर्निश्ड', kind:'1RK', gender:'', desc:'', imgs:[], amen:['geyser','water','power'], name:u.name||'', phone:u.phone||'', wa:u.phone||''};
}
SCREENS.post = (editId) => {
  if (!S.draft || S.draft._for !== (editId||'new')){
    if (editId){ const l = S.mine.find(x => x.id === editId); S.draft = l ? {...l, price:String(l.price), rooms:String(l.rooms), baths:String(l.baths), sqft:String(l.sqft||''), floor:l.floor||'', imgs:[...l.imgs], amen:[...l.amen], name:l.owner.name, phone:l.owner.phone, wa:l.owner.wa||l.owner.phone} : newDraft(); }
    else S.draft = newDraft();
    S.draft._for = editId || 'new';
  }
  const d = S.draft, areas = (RM_CITIES.find(c=>c.id===d.city)||{}).areas || [];
  const sel = (k, opts) => `<select data-d="${k}">${opts.map(o => { const [v,t] = Array.isArray(o)?o:[o,o]; return `<option value="${esc(v)}" ${String(d[k])===String(v)?'selected':''}>${esc(t)}</option>`; }).join('')}</select>`;
  return `<div class="screen nonav">
  ${topbar(editId ? 'लिस्टिंग बदलें' : '', `<button class="ibtn glass" data-go="dash">${ic('home')}</button>`)}
  <div class="fhero"><div class="c">${ic('home')}</div><div><h2>${editId?'अपनी लिस्टिंग बदलें':'अपनी प्रॉपर्टी लिस्ट करें'}</h2><p>अपने मकान, फ्लैट या कमरे को किराए पर दें और सही किरायेदार पाएं।</p></div>${HOUSE_ILL}</div>
  <div class="perks"><span>${ic('sparkle')}100% फ्री लिस्टिंग</span><span>${ic('users')}सीधे किरायेदार से संपर्क</span><span>${ic('clock')}तेज़ और आसान</span></div>
  <form data-form="post">
  <div class="card"><h3>${ic('home')} प्रॉपर्टी का प्रकार</h3>
    <div class="seg">${PTYPES.map(([k,t,i]) => `<button type="button" class="${d.ptype===k?'on':''}" data-ptype="${k}">${ic(i)}${t}${d.ptype===k?ic('checkc'):''}</button>`).join('')}</div></div>
  <div class="card"><h3>${ic('pin')} मूल जानकारी</h3>
    <div class="grid2">
      <div class="fld"><label>शहर चुनें <i>*</i></label><div class="inp">${ic('pin')}${sel('city', RM_CITIES.map(c=>[c.id,c.hi]))}${ic('down')}</div></div>
      <div class="fld"><label>इलाका/एरिया <i>*</i></label><div class="inp">${ic('building')}<input data-d="area" value="${esc(d.area)}" placeholder="जैसे - Kacha Tank" list="pareas"></div>
        <datalist id="pareas">${areas.map(a=>`<option value="${esc(a)}">`).join('')}</datalist></div>
      <div class="fld"><label>किराया (₹ प्रति माह) <i>*</i></label><div class="inp"><b style="color:var(--g8)">₹</b><input data-d="price" inputmode="numeric" value="${esc(d.price)}" placeholder="जैसे - 5000"></div></div>
      <div class="fld"><label>कमरे की संख्या <i>*</i></label><div class="inp">${ic('bed')}${sel('rooms',['1','2','3','4','5'])}${ic('down')}</div></div>
      <div class="fld"><label>टाइप</label><div class="inp">${ic('home')}${sel('kind',['1RK','1BHK','2BHK','3BHK','4BHK','PG','Room','Shop'])}${ic('down')}</div></div>
      <div class="fld"><label>बाथरूम</label><div class="inp">${ic('bath')}${sel('baths',['1','2','3','4'])}${ic('down')}</div></div>
      <div class="fld"><label>एरिया (sq ft)</label><div class="inp">${ic('size')}<input data-d="sqft" inputmode="numeric" value="${esc(d.sqft)}" placeholder="जैसे - 450"></div></div>
      <div class="fld"><label>मंजिल</label><div class="inp">${ic('building')}${sel('floor',[['','चुनें'],'Ground Floor','1st Floor','2nd Floor','3rd Floor','4th Floor','5th Floor','6th Floor+'])}${ic('down')}</div></div>
      <div class="fld"><label>फर्निशिंग</label><div class="inp">${sel('furnish',['फर्निश्ड','सेमी फर्निश्ड','अनफर्निश्ड'])}${ic('down')}</div></div>
      <div class="fld"><label>किसके लिए</label><div class="inp">${sel('gender',[['','सभी के लिए'],['boys','लड़कों के लिए'],['girls','लड़कियों के लिए'],['family','परिवार के लिए']])}${ic('down')}</div></div>
    </div></div>
  <div class="card"><h3>${ic('doc')} विवरण <i style="color:var(--red);font-style:normal">*</i></h3>
    <textarea class="ta" data-d="desc" maxlength="500" placeholder="जैसे - कमरे में बेड, अलमारी, वाई-फाई, पानी, बिजली, पार्किंग आदि की सुविधा...">${esc(d.desc)}</textarea><div class="cc" id="dcount">${d.desc.length}/500</div></div>
  <div class="card"><h3>${ic('image')} फोटो अपलोड करें <i style="color:var(--red);font-style:normal">*</i></h3>
    <div class="photos" id="photos">${photoStrip()}</div>
    <input type="file" id="pfile" accept="image/*" multiple hidden></div>
  <div class="card"><h3>${ic('star')} सुविधाएं (चुनें)</h3><div class="chk">
    ${FORM_AMEN.map(a => { const m = RM_AMENITIES.find(x=>x.id===a); const on = d.amen.includes(a); return `<button type="button" class="${on?'on':''}" data-damen="${a}"><span class="tk">${ic('check')}</span>${ic(m.ic)}${m.hi}</button>`; }).join('')}</div></div>
  <div class="card"><h3>${ic('phone')} आपका संपर्क विवरण</h3>
    <div class="fld"><label>नाम <i>*</i></label><div class="inp">${ic('user')}<input data-d="name" value="${esc(d.name)}" placeholder="आपका नाम"></div></div>
    <div class="grid2">
      <div class="fld"><label>मोबाइल नंबर <i>*</i></label><div class="inp">${ic('phone')}<input data-d="phone" inputmode="tel" maxlength="10" value="${esc(d.phone)}" placeholder="10 अंकों का नंबर"></div></div>
      <div class="fld"><label>WhatsApp (वैकल्पिक)</label><div class="inp">${WA}<input data-d="wa" inputmode="tel" maxlength="10" value="${esc(d.wa)}" placeholder="WhatsApp नंबर"></div></div>
    </div></div>
  <div class="card"><h3>${ic('shield')} क्यों लिस्ट करें RoomMitra पर?</h3>
    <div class="why"><div>${ic('users')}ज़्यादा किरायेदार तक पहुंच</div><div>${ic('shield')}सुरक्षित और भरोसेमंद</div><div>${ic('phone')}सीधा संपर्क और बातचीत</div><div>${ic('h24')}24/7 सपोर्ट</div></div></div>
  <div class="note">${ic('lock')} आपकी जानकारी सुरक्षित है। हम इसे किसी तीसरे पक्ष के साथ साझा नहीं करेंगे।</div>
  <div class="cta"><button type="submit" class="btn pri">${ic('send')} ${editId?'बदलाव सेव करें':'प्रॉपर्टी लिस्ट करें'}</button></div>
  </form></div>`;
};
function photoStrip(){
  const d = S.draft;
  return `<button type="button" class="add" data-act="addphoto">${ic('camera')}फोटो जोड़ें<small>(अधिकतम 10)</small></button>` +
    d.imgs.map((s,i) => `<div class="p"><img src="${esc(s)}" alt=""><button type="button" data-rmphoto="${i}">${ic('x')}</button></div>`).join('');
}
AFTER.post = () => {
  const inp = $('#pfile'); if (!inp) return;
  inp.addEventListener('change', async () => {
    const files = [...inp.files].slice(0, 10 - S.draft.imgs.length);
    for (const f of files){ try{ S.draft.imgs.push(await shrink(f)); }catch(e){} }
    inp.value = ''; $('#photos').innerHTML = photoStrip();
  });
};
function shrink(file){
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => { const im = new Image(); im.onload = () => {
      const m = 900, k = Math.min(1, m / Math.max(im.width, im.height));
      const c = document.createElement('canvas'); c.width = Math.round(im.width*k); c.height = Math.round(im.height*k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .72)); };
      im.onerror = rej; im.src = fr.result; };
    fr.onerror = rej; fr.readAsDataURL(file);
  });
}
function submitPost(){
  const d = S.draft, err = m => { toast(m); return false; };
  if (!d.area.trim()) return err('इलाका/एरिया भरें');
  const price = parseInt(String(d.price).replace(/\D/g,''), 10); if (!price || price < 100) return err('सही किराया भरें');
  if (d.desc.trim().length < 15) return err('विवरण कम से कम 15 अक्षर का लिखें');
  if (!d.imgs.length) return err('कम से कम 1 फोटो जोड़ें');
  if (!d.name.trim()) return err('अपना नाम भरें');
  if (!/^[6-9]\d{9}$/.test(d.phone)) return err('सही 10 अंकों का मोबाइल नंबर भरें');
  const ptLabel = {room:'कमरा', flat:'फ्लैट', house:'मकान', pg:'PG', shop:'दुकान/ऑफिस'}[d.ptype];
  const title = d.ptype === 'pg' ? `PG${d.gender==='boys'?' (लड़कों के लिए)':d.gender==='girls'?' (लड़कियों के लिए)':''}` :
                /BHK|RK/.test(d.kind) ? `${d.kind} ${ptLabel} (${d.furnish})` : `${ptLabel} (${d.furnish})`;
  const tags = [d.furnish]; if (d.amen.includes('parking')) tags.push('पार्किंग'); else if (d.amen.includes('wifi')) tags.push('WiFi');
  const old = d._for !== 'new' ? S.mine.find(x => x.id === d._for) : null;
  const l = {
    id: old ? old.id : 'M' + Date.now(), mine:true, status: old ? old.status : 'active', created: old ? old.created : Date.now(),
    title, kind: d.ptype==='pg' ? 'PG' : d.kind, ptype: d.ptype==='house' ? 'flat' : d.ptype, city:d.city, area:d.area.trim(), price,
    rooms:+d.rooms, baths:+d.baths, sqft:+d.sqft || 0, floor:d.floor, furnish:d.furnish, gender: (d.gender==='boys'||d.gender==='girls') ? d.gender : undefined,
    desc:d.desc.trim(), amen:[...d.amen], tags, imgs:[...d.imgs],
    owner:{name:d.name.trim(), phone:d.phone, wa:d.wa||d.phone, since:'नया', rating:0, reviews:0, photo:(S.user||{}).photo},
    verified:false, direct:true, now:true, views: old ? old.views : 0
  };
  if (old) S.mine[S.mine.indexOf(old)] = l; else S.mine.unshift(l);
  if (!LS.set('mine', S.mine)){ if (!old) S.mine.shift(); return; }
  if (!S.user.name){ S.user.name = l.owner.name; LS.set('user', S.user); }
  S.draft = null; toast(old ? 'बदलाव सेव हो गए ✓' : 'आपकी प्रॉपर्टी लिस्ट हो गई! 🎉');
  location.replace('#p/' + l.id);
}

/* ---------- LOGIN ---------- */
let otpState = {phone:'', sent:false, timer:0, iv:null};
SCREENS.login = (next) => {
  const o = otpState;
  return `<div class="login screen nonav" style="padding-bottom:30px">
  <div class="brandrow"><button class="ibtn" data-act="back" style="color:var(--ink)">${ic('back')}</button>${LOGO('#0B4D33')}<div><div class="name">Room<b>Mitra</b></div><div class="slogan">कमरा ढूँढना हुआ आसान।</div></div></div>
  <div class="hero"><div style="flex:1"><h1>आपका स्वागत है</h1><div class="hr"></div><p>RoomMitra में लॉगिन करके अपने लिए सही कमरा खोजें।</p></div>
    <svg class="ill" viewBox="0 0 160 120">${HOUSE_ILL.replace(/<\/?svg[^>]*>/g,'')}<rect x="104" y="80" width="54" height="30" rx="4" fill="#0B4D33"/><text x="131" y="93" text-anchor="middle" font-size="8" fill="#fff" font-style="italic" font-family="sans-serif">Better Rooms</text><text x="131" y="104" text-anchor="middle" font-size="8" fill="#fff" font-style="italic" font-family="sans-serif">Better Life</text></svg></div>
  <div class="trust"><span>${ic('shield')}सुरक्षित लॉगिन</span><span>${ic('home')}सही और विश्वसनीय लिस्टिंग</span><span>${ic('bolt')}तेज़ और आसान</span></div>
  <div class="lcard"><div class="h"><div class="c">${ic('phone')}</div><div><b>मोबाइल नंबर से लॉगिन करें</b><p>अपना 10 अंकों का मोबाइल नंबर दर्ज करें।</p></div></div>
    <div class="phone"><span class="cc">🇮🇳 +91</span><input id="lphone" inputmode="numeric" maxlength="10" placeholder="मोबाइल नंबर दर्ज करें" value="${esc(o.phone)}"></div>
    <button class="btn pri block" data-act="sendotp">OTP भेजें ${ic('right')}</button></div>
  ${o.sent ? `<div class="or">और</div>
  <div class="lcard"><div class="h"><div class="c">${ic('shield')}</div><div><b>OTP दर्ज करें</b><p>आपके मोबाइल नंबर <b>+91 ${esc(o.phone.slice(0,5))} ${esc(o.phone.slice(5))}</b> पर भेजा गया 6 अंकों का OTP दर्ज करें।</p></div></div>
    <div class="otp">${[0,1,2,3,4,5].map(i => `<input inputmode="numeric" maxlength="1" data-otp="${i}">`).join('')}</div>
    <div class="fld"><label>आपका नाम</label><div class="inp">${ic('user')}<input id="lname" placeholder="जैसे - राजेश शर्मा"></div></div>
    <button class="btn pri block" data-act="verify" data-next="${esc(next||'')}">लॉगिन करें ${ic('check')}</button>
    <div class="resend" style="margin-top:12px" id="resend"></div>
    <div class="demo">⚠️ डेमो वर्ज़न: असली SMS अभी नहीं जाता। OTP <b>123456</b> डालें। (असली OTP के लिए बैकएंड जोड़ना होगा)</div></div>` : ''}
  <div class="or">या</div>
  <button class="btn out block" data-act="google" style="border-color:var(--line);color:var(--ink)">${GOOGLE} Google से जारी रखें</button>
  <div class="terms">लॉगिन करते समय आप हमारी <u data-act="terms">Terms &amp; Conditions</u> और <u data-act="terms">Privacy Policy</u> से सहमत होते हैं।</div>
  </div>`;
};
AFTER.login = () => {
  const p = $('#lphone'); if (p) p.addEventListener('input', () => { p.value = p.value.replace(/\D/g,''); otpState.phone = p.value; });
  const boxes = $$('[data-otp]');
  boxes.forEach((b, i) => {
    b.addEventListener('input', () => {
      const v = b.value.replace(/\D/g,'');
      if (v.length > 1){ v.split('').slice(0,6).forEach((ch,k) => { if (boxes[k]) boxes[k].value = ch; }); boxes[Math.min(5, v.length-1)].focus(); return; }
      b.value = v; if (v && boxes[i+1]) boxes[i+1].focus();
    });
    b.addEventListener('keydown', e => { if (e.key === 'Backspace' && !b.value && boxes[i-1]) boxes[i-1].focus(); });
  });
  if (otpState.sent){ boxes[0] && boxes[0].focus(); tickResend(); }
};
function tickResend(){
  clearInterval(otpState.iv);
  const el = () => $('#resend');
  const draw = () => { const e = el(); if (!e){ clearInterval(otpState.iv); return; }
    e.innerHTML = otpState.timer > 0 ? `${ic('refresh')} OTP दोबारा भेजें (00:${String(otpState.timer).padStart(2,'0')})` : `<button data-act="sendotp">${ic('refresh')} OTP दोबारा भेजें</button>`; };
  draw(); otpState.iv = setInterval(() => { otpState.timer--; draw(); if (otpState.timer <= 0) clearInterval(otpState.iv); }, 1000);
}

/* ---------- OWNER DASHBOARD ---------- */
SCREENS.dash = () => {
  const mine = S.mine, u = S.user;
  const views = mine.reduce((a,l) => a + (l.views||0), 0);
  return `<div class="screen">
  <header class="hdr"><div class="row">
    <div class="brand">${LOGO()}<div><div class="name">Room<b>Mitra</b></div><div class="slogan">कमरा ढूँढना हुआ आसान।</div></div></div>
    <button class="ibtn" data-act="notif">${ic('bell')}<span class="dot">3</span></button><button class="ibtn solid" data-go="profile">${ic('user')}</button></div></header>
  <div class="hello"><div class="av">${u.photo?`<img src="${esc(u.photo)}" style="width:100%;height:100%;object-fit:cover">`:ic('user')}</div><div style="flex:1;min-width:0"><b>नमस्ते, ${esc(u.name||'मालिक')}</b><p>आपका मालिक डैशबोर्ड में स्वागत है</p></div>
    <button class="btn out sm" data-go="profile">${ic('edit')}प्रोफाइल</button></div>
  <div class="stats">
    <div class="st"><div class="t"><span>${ic('home')}</span>मेरी लिस्टिंग</div><b>${mine.length}</b><small>कुल प्रॉपर्टी</small></div>
    <div class="st b"><div class="t"><span>${ic('eye')}</span>कुल व्यूज़</div><b>${views}</b><small>अब तक</small></div>
    <div class="st p" data-go="msgs"><div class="t"><span>${ic('chat')}</span>कुल मैसेज</div><b>${S.chats.length}</b><small>${unreadCount()} नए संदेश</small></div>
    <div class="st"><div class="t"><span>${ic('cal')}</span>सक्रिय लिस्टिंग</div><b>${mine.filter(l=>l.status!=='paused').length}</b><small>अभी दिख रही हैं</small></div>
  </div>
  <div class="dbtns"><button class="btn pri" data-act="newpost">${ic('plus')} नई प्रॉपर्टी जोड़ें</button><button class="btn out" data-go="search">${ic('list')} सभी लिस्टिंग</button></div>
  <div class="wrap sec"><h3>${ic('home')} मेरी लिस्टिंग</h3></div>
  <div class="wrap">${mine.length ? mine.map(l => listCard(l, 'dash')).join('') : `<div class="empty">${ic('houseplus')}<b>अभी आपकी कोई लिस्टिंग नहीं है</b>पहली प्रॉपर्टी 2 मिनट में फ्री लिस्ट करें।<br><br><button class="btn pri sm" data-act="newpost">अब लिस्ट करें</button></div>`}</div>
  ${nav('post')}</div>`;
};

/* ---------- MESSAGES ---------- */
let msgTab = 'all', msgQ = '';
SCREENS.msgs = () => {
  const list = S.chats.filter(c => (msgTab==='arch' ? c.arch : msgTab==='block' ? c.block : !c.arch && !c.block) && (!msgQ || c.name.includes(msgQ) || c.msgs[c.msgs.length-1].t.includes(msgQ)));
  return `<div class="screen">
  ${topbar('', `<button class="ibtn" data-act="notif">${ic('bell')}</button>`)}
  <div class="tabs3"><button class="${msgTab==='all'?'on':''}" data-mtab="all">${ic('chat')}मेसेज ${unreadCount()?`<span class="n">${unreadCount()}</span>`:''}</button>
    <button class="${msgTab==='arch'?'on':''}" data-mtab="arch">${ic('file')}आर्काइव</button><button class="${msgTab==='block'?'on':''}" data-mtab="block">${ic('x')}ब्लॉक्ड</button></div>
  <div class="wrap" style="margin-top:12px"><div class="search" style="box-shadow:none;padding:2px 14px">${ic('search')}<input id="mq" value="${esc(msgQ)}" placeholder="किसी से चैट खोजें..."></div></div>
  <div class="wrap" style="margin-top:12px">${list.length ? list.map(c => { const last = c.msgs[c.msgs.length-1]; return `<div class="mrow" data-chat="${c.id}">
    <div class="av"><img src="${esc(c.av)}" alt="">${c.role?'<span class="on-dot"></span>':''}</div>
    <div class="b"><div class="n1">${esc(c.name)}${c.role?`<span class="role">${esc(c.role)}</span>`:''}</div><div class="last">${last.me?'आप: ':''}${esc(last.loc?'📍 लोकेशन':last.pics?'📷 फोटो':last.t)}</div>
      <div class="tm">${ic('ddcheck')}${esc(c.time)}</div></div>
    ${c.unread ? `<span class="ub">${c.unread}</span>` : ''}${ic('right')}</div>`; }).join('') : `<div class="empty">${ic('chat')}<b>कोई चैट नहीं</b></div>`}</div>
  <button class="fab" data-go="search">${ic('plus')}</button>
  ${nav('msgs')}</div>`;
};
AFTER.msgs = () => { const q = $('#mq'); if (q) q.addEventListener('input', () => { msgQ = q.value; const pos = q.selectionStart; render(); const n = $('#mq'); n.focus(); n.setSelectionRange(pos,pos); }); };

function ensureChat(l){
  let c = S.chats.find(x => x.listing === l.id && x.fromListing);
  if (!c){ c = {id:'c'+Date.now(), name:l.owner.name, role:'मकान मालिक', av:l.imgs[0], listing:l.id, unread:0, time:'अभी', phone:l.owner.phone, fromListing:true, msgs:[{me:false, t:`नमस्ते! "${l.title}" के बारे में कुछ पूछना हो तो लिखें।`, at:nowT()}]}; S.chats.unshift(c); saveChats(); }
  return c;
}
const nowT = () => new Date().toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit', hour12:true}).toUpperCase();
SCREENS.chat = (id) => {
  const c = S.chats.find(x => x.id === id); if (!c) return SCREENS.msgs();
  if (c.unread){ c.unread = 0; saveChats(); }
  const l = byId(c.listing);
  return `<div class="chat">
  <header class="hdr" style="padding-bottom:12px"><div class="row">
    <button class="ibtn" data-act="back">${ic('back')}</button>
    <div class="who"><img src="${esc(c.av)}" alt=""><div style="min-width:0"><b>${esc(c.name)}</b><small>● ऑनलाइन${c.role?' · '+esc(c.role):''}${l?' · '+esc(l.kind):''}</small></div></div>
    <button class="ibtn solid" data-callp="${esc(c.phone)}">${ic('phone')}</button><button class="ibtn" data-chatmore="${c.id}">${ic('more')}</button></div></header>
  ${l ? `<div class="lp" data-open="${l.id}"><img src="${esc(l.imgs[0])}" alt=""><div><b>${esc(l.title)}</b><small>${ic('pin')} ${placeHi(l)}</small><small><b>${rs(l.price)}/माह</b></small></div><span class="btn">${ic('home')} विवरण</span></div>` : ''}
  <div class="msgs" id="msgs">${c.msgs.map(bubble).join('')}</div>
  <div class="quick"><button data-q="loc">${ic('pin')}लोकेशन शेयर करें</button><button data-callp="${esc(c.phone)}">${ic('phone')}कॉल करें</button><button data-q="pic">${ic('image')}फोटो भेजें</button><button data-q="visit">${ic('cal')}विज़िट का समय</button></div>
  <form class="composer" data-form="chat" data-id="${c.id}"><div class="box">${ic('smile')}<input name="m" placeholder="यहाँ संदेश लिखें..." autocomplete="off">${ic('clip')}</div><button class="send">${ic('send')}</button></form>
  <input type="file" id="cfile" accept="image/*" hidden>
  </div>`;
};
function bubble(m){
  const tick = m.me ? ic('ddcheck') : '';
  if (m.pics) return `<div class="bub ${m.me?'out':'in'}"><div class="pics">${m.pics.slice(0,3).map(p=>`<img src="${esc(p)}">`).join('')}</div>${ic('image')} ${esc(m.t)}<div class="t">${esc(m.at)}${tick}</div></div>`;
  if (m.loc) return `<div class="bub ${m.me?'out':'in'}"><div>📍 <b>लोकेशन</b></div><div>🗺️ <b>एड्रेस:</b> ${esc(m.t)}</div><div class="t">${esc(m.at)}${tick}</div></div>`;
  return `<div class="bub ${m.me?'out':'in'}">${esc(m.t)}<div class="t">${esc(m.at)}${tick}</div></div>`;
}
AFTER.chat = (id) => {
  const box = $('#msgs'); if (box) box.scrollTop = box.scrollHeight;
  const f = $('#cfile'); if (f) f.addEventListener('change', async () => { const file = f.files[0]; if (!file) return; const src = await shrink(file); pushMsg(id, {me:true, pics:[src], t:'1 फोटो'}); f.value=''; });
};
function pushMsg(id, m){
  const c = S.chats.find(x => x.id === id); if (!c) return;
  m.at = nowT(); c.msgs.push(m); c.time = 'आज ' + new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:false});
  S.chats.splice(S.chats.indexOf(c), 1); S.chats.unshift(c);
  saveChats();
  const box = $('#msgs'); if (box){ box.insertAdjacentHTML('beforeend', bubble(m)); box.scrollTop = box.scrollHeight; }
}

/* ---------- PROFILE ---------- */
SCREENS.profile = () => {
  const u = S.user;
  const item = (act, icn, t, s) => `<button data-act="${act}"><span class="mi">${ic(icn)}</span><div><b>${t}</b><small>${s}</small></div><span class="chev">${ic('right')}</span></button>`;
  return `<div class="screen">
  <header class="hdr"><div class="row">
    <div class="brand">${LOGO()}<div><div class="name">Room<b>Mitra</b></div><div class="slogan">कमरा ढूँढना हुआ आसान।</div></div></div>
    <button class="ibtn" data-act="settings">${ic('gear')}</button></div></header>
  <div class="pcard"><div class="pa" data-act="photo">${u.photo ? `<img src="${esc(u.photo)}">` : ic('user')}<span class="cam">${ic('camera')}</span></div>
    <div style="min-width:0"><b>${esc(u.name||'आपका नाम')} ${ic('checkc')}</b><div class="ln">${ic('phone')}+91 ${esc(u.phone.slice(0,5))} ${esc(u.phone.slice(5))}</div>
    ${u.email?`<div class="ln">${ic('mail')}${esc(u.email)}</div>`:''}<span class="vchip" style="margin-top:6px">${ic('shield')}सत्यापित उपयोगकर्ता</span></div>
    <input type="file" id="avfile" accept="image/*" hidden></div>
  <div class="card"><div style="display:flex;justify-content:space-between;margin-bottom:12px"><b>मेरी जानकारी</b><button class="more" style="margin:0" data-act="editprofile">बदलें ${ic('right')}</button></div>
    <div class="info"><div><small>${ic('user')}पूरा नाम</small>${esc(u.name||'—')}</div><div><small>${ic('phone')}मोबाइल नंबर</small>+91 ${esc(u.phone)}</div>
    <div><small>${ic('mail')}ईमेल</small>${esc(u.email||'—')}</div><div><small>${ic('pin')}पता</small>${esc(u.addr||cityHi(S.city))}</div></div></div>
  <div class="menu">
    ${item('dash','home','मेरी लिस्टिंग (मालिक डैशबोर्ड)','अपनी प्रॉपर्टी देखें, बदलें या हटाएं')}
    ${item('editprofile','user','प्रोफाइल अपडेट करें','अपनी जानकारी और फोटो अपडेट करें')}
    ${item('privacy','shield','सुरक्षा और गोपनीयता','डेटा सुरक्षा और लोकल डेटा मिटाएं')}
    ${item('notifset','bell','नोटिफिकेशन सेटिंग','मैसेज, नए कमरे और ऑफर के नोटिफिकेशन')}
    ${item('help','help','सहायता और सपोर्ट','FAQ, हेल्प सेंटर और संपर्क करें')}
    ${item('terms','doc','नियम और शर्तें','ऐप की शर्तें और गोपनीयता नीति')}
    ${item('logout','logout','लॉगआउट','अपने खाते से बाहर जाएँ')}
  </div>
  <div class="thanks">${ic('heart','f')}<div style="flex:1"><b style="color:var(--ink)">RoomMitra का उपयोग करने के लिए धन्यवाद!</b><br>सुरक्षित रहिए | अच्छे लोगों से जुड़िए | बेहतर घर पाईए</div><div style="text-align:right">ऐप वर्जन<br><b>v1.0.0</b></div></div>
  <div style="height:12px"></div>
  ${nav('')}</div>`;
};
AFTER.profile = () => {
  const f = $('#avfile'); if (f) f.addEventListener('change', async () => { const file = f.files[0]; if (!file) return; S.user.photo = await shrink(file); LS.set('user', S.user); render(); });
};

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

const TERMS = `<h3>नियम, शर्तें और गोपनीयता नीति</h3>
<p><b>1. सेवा:</b> RoomMitra मकान मालिकों और किरायेदारों को सीधे जोड़ने वाला प्लेटफ़ॉर्म है। हम किसी भी सौदे में पक्ष नहीं हैं।</p>
<p><b>2. लिस्टिंग:</b> लिस्टिंग की जानकारी और फोटो सही होनी चाहिए। गलत या भ्रामक लिस्टिंग हटाई जा सकती है।</p>
<p><b>3. सुरक्षा:</b> प्रॉपर्टी देखे बिना कोई एडवांस/टोकन राशि न भेजें। मिलने के लिए सार्वजनिक समय चुनें।</p>
<p><b>4. डेटा:</b> आपका नाम, मोबाइल नंबर, ईमेल और लिस्टिंग की जानकारी केवल ऐप चलाने के लिए उपयोग होती है। हम इसे बेचते या किसी तीसरे पक्ष से साझा नहीं करते। लिस्टिंग में डाला गया संपर्क नंबर किरायेदारों को दिखता है।</p>
<p><b>5. डेटा हटाना:</b> प्रोफाइल → सुरक्षा और गोपनीयता → "मेरा डेटा मिटाएं" से आप अपना सारा डेटा हटा सकते हैं।</p>
<p><b>6. संपर्क:</b> ${window.RM_SUPPORT_EMAIL}</p>`;

/* ================= events ================= */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-go],[data-act],[data-open],[data-fav],[data-call],[data-wa],[data-cat],[data-city],[data-chip],[data-ptype],[data-damen],[data-famen],[data-sw],[data-rooms],[data-type],[data-thumb],[data-share],[data-more],[data-maps],[data-owner],[data-rmphoto],[data-edit],[data-del],[data-toggle],[data-mtab],[data-chat],[data-callp],[data-q],[data-chatmore],[data-pickcity],[data-sheetact]');
  if (!t) return;
  const d = t.dataset;
  if (d.fav){ e.stopPropagation(); if (S.favs.has(d.fav)){ S.favs.delete(d.fav); toast('पसंदीदा से हटाया'); } else { S.favs.add(d.fav); toast('पसंदीदा में जोड़ा ❤'); }
    saveFavs(); $$(`[data-fav="${d.fav}"]`).forEach(b => b.classList.toggle('on', S.favs.has(d.fav))); if (route().name==='fav') render(); return; }
  if (d.call){ e.stopPropagation(); const l = byId(d.call); call(l.owner.phone); return; }
  if (d.wa){ e.stopPropagation(); const l = byId(d.wa); whatsapp(l.owner.wa || l.owner.phone, l); return; }
  if (d.callp){ call(d.callp); return; }
  if (d.edit){ e.stopPropagation(); S.draft = null; go('post/' + d.edit); return; }
  if (d.del){ e.stopPropagation(); sheet(`<h3>लिस्टिंग हटाएं?</h3><p>यह लिस्टिंग हमेशा के लिए हट जाएगी।</p><div class="grid2"><button class="btn out" data-sheetact="close">रद्द करें</button><button class="btn pri" style="background:#9b2c2c" data-sheetact="del:${d.del}">हटाएं</button></div>`); return; }
  if (d.toggle){ e.stopPropagation(); const l = S.mine.find(x=>x.id===d.toggle); l.status = l.status==='paused' ? 'active' : 'paused'; LS.set('mine', S.mine); toast(l.status==='paused'?'लिस्टिंग रोकी गई':'लिस्टिंग फिर से प्रकाशित'); render(); return; }
  if (d.go){ if (d.go === 'post' && S.user){ S.draft = null; } go(d.go); return; }
  if (d.open){ go('p/' + d.open); return; }
  if (d.chat){ go('chat/' + d.chat); return; }
  if (d.cat){ S.cat = d.cat; S.chip = 'all'; S.q = ''; go('search'); return; }
  if (d.city){ S.city = d.city; LS.set('city', S.city); toast(cityHi(d.city) + ' चुना गया'); render(); return; }
  if (d.pickcity){ S.city = d.pickcity; LS.set('city', S.city); closeSheet(); render(); return; }
  if (d.chip){ S.chip = d.chip; render(); return; }
  if (d.mtab){ msgTab = d.mtab; render(); return; }
  if (d.ptype){ S.draft.ptype = d.ptype; if (d.ptype==='pg') S.draft.kind='PG'; else if (d.ptype==='shop') S.draft.kind='Shop'; else if (S.draft.kind==='PG'||S.draft.kind==='Shop') S.draft.kind = d.ptype==='flat'?'1BHK':'1RK';
    $$('[data-ptype]').forEach(b => { const on = b.dataset.ptype === d.ptype; b.classList.toggle('on', on); });
    const k = $('[data-d="kind"]'); if (k) k.value = S.draft.kind; return; }
  if (d.damen){ const a = S.draft.amen, i = a.indexOf(d.damen); i<0 ? a.push(d.damen) : a.splice(i,1); t.classList.toggle('on'); return; }
  if (d.famen){ const a = S.f.amen, i = a.indexOf(d.famen); i<0 ? a.push(d.famen) : a.splice(i,1); t.classList.toggle('on'); updRange(); return; }
  if (d.sw){ S.f[d.sw] = !S.f[d.sw]; t.classList.toggle('on'); updRange(); return; }
  if (d.rooms){ const n = +d.rooms; S.f.rooms = S.f.rooms===n ? 0 : n; $$('[data-rooms]').forEach(b => b.classList.toggle('on', +b.dataset.rooms===S.f.rooms)); updRange(); return; }
  if (d.type){ S.f.type = S.f.type===d.type ? '' : d.type; $$('[data-type]').forEach(b => b.classList.toggle('on', b.dataset.type===S.f.type)); updRange(); return; }
  if (d.thumb){ const tr = $('#track'); tr.scrollTo({left: tr.clientWidth * +d.thumb, behavior:'smooth'}); return; }
  if (d.share){ share(byId(d.share)); return; }
  if (d.maps){ const l = byId(d.maps); openUrl(mapsUrl(`${l.area}, ${l.city}`)); return; }
  if (d.rmphoto){ S.draft.imgs.splice(+d.rmphoto, 1); $('#photos').innerHTML = photoStrip(); return; }
  if (d.owner){ const l = byId(d.owner), o = l.owner; const others = allListings().filter(x => x.owner && x.owner.phone === o.phone);
    sheet(`<div class="owner" style="border:0;padding:0;margin-bottom:12px"><div class="av">${ic('user')}</div><div style="flex:1"><div class="nm">${esc(o.name)}</div>${l.verified?`<span class="vchip">${ic('shield')}Verified Owner</span>`:''}</div><div class="rt">${o.reviews?`<span>${ic('star','f')}${o.rating} (${o.reviews})</span>`:''}<span>${esc(o.since||'')}</span></div></div>
      <h3>इनकी लिस्टिंग (${others.length})</h3>${others.map(x => listCard(x,'fav')).join('')}
      <div class="grid2"><button class="btn out wa" data-wa="${l.id}">${WA} WhatsApp</button><button class="btn pri" data-call="${l.id}">${ic('phone')} कॉल करें</button></div>`); return; }
  if (d.more){ const l = byId(d.more);
    sheet(`<h3>विकल्प</h3><button class="opt" data-sheetact="msg:${l.id}">${ic('chat')} मालिक को संदेश भेजें</button><button class="opt" data-sheetact="share:${l.id}">${ic('share')} शेयर करें</button><button class="opt" data-sheetact="report:${l.id}">${ic('info')} रिपोर्ट करें</button>`); return; }
  if (d.chatmore){ const c = S.chats.find(x => x.id === d.chatmore);
    sheet(`<h3>${esc(c.name)}</h3><button class="opt" data-sheetact="arch:${c.id}">${ic('file')} ${c.arch?'आर्काइव से हटाएं':'आर्काइव करें'}</button><button class="opt" data-sheetact="block:${c.id}">${ic('x')} ${c.block?'अनब्लॉक करें':'ब्लॉक करें'}</button><button class="opt" data-sheetact="clear:${c.id}">${ic('trash')} चैट मिटाएं</button>`); return; }
  if (d.q){ const id = route().arg;
    if (d.q==='loc') pushMsg(id, {me:true, loc:true, t: `${cityHi(S.city)} – मेरी वर्तमान लोकेशन`});
    if (d.q==='pic') $('#cfile').click();
    if (d.q==='visit') pushMsg(id, {me:true, t:'क्या मैं कल शाम 5 बजे कमरा देखने आ सकता हूँ?'});
    return; }
  if (d.sheetact){ const [a, id] = d.sheetact.split(':');
    if (a==='close') closeSheet();
    if (a==='del'){ S.mine = S.mine.filter(x => x.id !== id); S.favs.delete(id); saveFavs(); LS.set('mine', S.mine); closeSheet(); toast('लिस्टिंग हटा दी गई'); render(); }
    if (a==='msg'){ closeSheet(); if (!S.user){ go('login/' + encodeURIComponent('p|'+id)); return; } const c = ensureChat(byId(id)); go('chat/' + c.id); }
    if (a==='share'){ closeSheet(); share(byId(id)); }
    if (a==='report'){ closeSheet(); toast('रिपोर्ट भेज दी गई। धन्यवाद!'); }
    if (a==='arch'||a==='block'){ const c = S.chats.find(x=>x.id===id); c[a] = !c[a]; saveChats(); closeSheet(); toast('हो गया'); if (c[a]) back(); else render(); }
    if (a==='clear'){ S.chats = S.chats.filter(x=>x.id!==id); saveChats(); closeSheet(); back(); }
    if (a==='wipe'){ ['user','mine','favs','chats','prefs','city'].forEach(k => localStorage.removeItem('rm_'+k)); location.replace('#home'); location.reload(); }
    if (a==='logout'){ S.user = null; localStorage.removeItem('rm_user'); closeSheet(); depth = 0; location.replace('#home'); toast('लॉगआउट हो गया'); }
    if (a==='pref'){ S.prefs[id] = !S.prefs[id]; LS.set('prefs', S.prefs); t.querySelector('.sw').classList.toggle('on', S.prefs[id]); }
    return; }
  if (d.act) ACT[d.act] && ACT[d.act](t, e);
});

const ACT = {
  back: () => back(),
  city: () => sheet(`<h3>शहर चुनें</h3>${RM_CITIES.map(c => `<button class="opt ${c.id===S.city?'on':''}" data-pickcity="${c.id}">${ic('pin')} ${c.hi} (${c.id}) ${c.id===S.city?ic('check'):''}</button>`).join('')}`),
  me: () => go(S.user ? 'profile' : 'login/profile'),
  newpost: () => { S.draft = null; go('post'); },
  clearf: () => { S.f = freshFilter(); S.cat = null; S.chip = 'all'; S.q = ''; render(); },
  resetf: () => { S.f = freshFilter(); S.cat = null; render(); },
  applyf: () => { if (depth > 0 && history.length > 1){ depth--; history.back(); } else location.replace('#search'); },
  mapview: () => openUrl(mapsUrl(`room for rent ${S.city}`)),
  readmore: (t) => { $('#desc').classList.toggle('clamp'); t.innerHTML = $('#desc').classList.contains('clamp') ? `और पढ़ें ${ic('down')}` : `कम दिखाएं ${ic('down')}`; },
  addphoto: () => { if (S.draft.imgs.length >= 10) return toast('अधिकतम 10 फोटो'); $('#pfile').click(); },
  sendotp: () => {
    const p = ($('#lphone')||{}).value || otpState.phone;
    if (!/^[6-9]\d{9}$/.test(p)) return toast('सही 10 अंकों का मोबाइल नंबर डालें');
    otpState = {...otpState, phone:p, sent:true, timer:45}; render(); toast('OTP भेजा गया (डेमो: 123456)');
  },
  verify: (t) => {
    const code = $$('[data-otp]').map(b => b.value).join('');
    if (code.length < 6) return toast('6 अंकों का OTP डालें');
    if (code !== '123456') return toast('गलत OTP। डेमो में 123456 डालें');
    const old = LS.get('user_'+otpState.phone, null);
    S.user = old || {phone:otpState.phone, name:'', email:''};
    const nm = ($('#lname')||{}).value; if (nm && nm.trim()) S.user.name = nm.trim();
    LS.set('user', S.user); LS.set('user_'+S.user.phone, S.user);
    clearInterval(otpState.iv); otpState = {phone:'', sent:false, timer:0};
    toast('लॉगिन सफल ✓');
    const nx = decodeURIComponent(t.dataset.next || ''); const [n, a] = nx.split('|');
    location.replace('#' + (n ? n + (a ? '/' + a : '') : 'home'));
  },
  google: () => toast('Google लॉगिन जल्द आ रहा है — अभी मोबाइल नंबर से लॉगिन करें'),
  terms: () => sheet(TERMS),
  notif: () => sheet(`<h3>नोटिफिकेशन</h3>
    <div class="mrow">${ic('chat')}<div class="b"><b>राहुल शर्मा</b> ने आपको संदेश भेजा<div class="tm">आज 09:15</div></div></div>
    <div class="mrow">${ic('eye')}<div class="b">आपकी लिस्टिंग को आज <b>12</b> लोगों ने देखा<div class="tm">आज 08:00</div></div></div>
    <div class="mrow">${ic('home')}<div class="b">${esc(cityHi(S.city))} में <b>3</b> नए कमरे आपकी पसंद के<div class="tm">कल</div></div></div>`),
  dash: () => go('dash'),
  editprofile: () => { const u = S.user; sheet(`<h3>प्रोफाइल अपडेट करें</h3>
    <div class="fld"><label>पूरा नाम</label><div class="inp">${ic('user')}<input id="pf_name" value="${esc(u.name)}"></div></div>
    <div class="fld"><label>ईमेल</label><div class="inp">${ic('mail')}<input id="pf_email" type="email" value="${esc(u.email||'')}" placeholder="name@gmail.com"></div></div>
    <div class="fld"><label>पता / शहर</label><div class="inp">${ic('pin')}<input id="pf_addr" value="${esc(u.addr||'')}" placeholder="जैसे - नाहन, हिमाचल प्रदेश"></div></div>
    <button class="btn pri block" data-act="saveprofile">सेव करें</button>`); },
  saveprofile: () => { const u = S.user; u.name = $('#pf_name').value.trim(); u.email = $('#pf_email').value.trim(); u.addr = $('#pf_addr').value.trim();
    if (u.email && !/^\S+@\S+\.\S+$/.test(u.email)) return toast('सही ईमेल डालें');
    LS.set('user', u); LS.set('user_'+u.phone, u); closeSheet(); toast('प्रोफाइल सेव हो गई ✓'); render(); },
  photo: () => $('#avfile').click(),
  settings: () => ACT.notifset(),
  privacy: () => sheet(`<h3>सुरक्षा और गोपनीयता</h3><p>आपका डेटा (प्रोफाइल, लिस्टिंग, पसंदीदा, चैट) इस फोन में सुरक्षित रखा जाता है। लॉगिन OTP से होता है, कोई पासवर्ड नहीं।</p>
    <button class="btn out block" style="border-color:#9b2c2c;color:#9b2c2c" data-sheetact="wipe">${ic('trash')} मेरा सारा डेटा मिटाएं</button>`),
  notifset: () => { const p = S.prefs; const row = (k,t) => `<button class="opt" data-sheetact="pref:${k}">${t}<span class="sw ${p[k]?'on':''}"></span></button>`;
    sheet(`<h3>नोटिफिकेशन सेटिंग</h3>${row('msg','नए मैसेज')}${row('newroom','नए कमरे (मेरे शहर में)')}${row('offer','ऑफर और अपडेट')}`); },
  help: () => sheet(`<h3>सहायता और सपोर्ट</h3>
    <p><b>प्रॉपर्टी कैसे लिस्ट करूँ?</b><br>नीचे ➕ "लिस्ट करें" दबाएं, जानकारी और फोटो डालें, सबमिट करें।</p>
    <p><b>क्या लिस्टिंग फ्री है?</b><br>हाँ, RoomMitra पर लिस्टिंग 100% फ्री है।</p>
    <p><b>मालिक से कैसे बात करूँ?</b><br>किसी भी कमरे पर "कॉल करें" या "WhatsApp करें" दबाएं।</p>
    <p><b>धोखाधड़ी से कैसे बचें?</b><br>कमरा देखे बिना कोई पैसा न भेजें।</p>
    <button class="btn pri block" data-act="mailus">${ic('mail')} हमें ईमेल करें</button>`),
  mailus: () => openUrl('mailto:' + window.RM_SUPPORT_EMAIL + '?subject=' + encodeURIComponent('RoomMitra सहायता')),
  logout: () => sheet(`<h3>लॉगआउट करें?</h3><p>आप दोबारा मोबाइल नंबर से लॉगिन कर सकते हैं।</p><div class="grid2"><button class="btn out" data-sheetact="close">रद्द करें</button><button class="btn pri" data-sheetact="logout">लॉगआउट</button></div>`)
};

/* inputs & forms */
document.addEventListener('input', e => {
  const t = e.target, d = t.dataset;
  if (d.d && S.draft){ let v = t.value; if (['price','sqft','phone','wa'].includes(d.d)){ v = v.replace(/\D/g,''); t.value = v; } S.draft[d.d] = v;
    if (d.d === 'desc') $('#dcount').textContent = v.length + '/500'; }
  if (d.range){ let v = +t.value; if (d.range==='min'){ v = Math.min(v, S.f.max - 500); S.f.min = v; } else { v = Math.max(v, S.f.min + 500); S.f.max = v; } t.value = v; updRange(); }
  if (d.in){ S.f[d.in] = t.value; updRange(); }
});
document.addEventListener('change', e => {
  const t = e.target, d = t.dataset;
  if (d.d && S.draft){ S.draft[d.d] = t.value; if (d.d === 'city') render(); }
  if (d.change === 'city'){ S.city = t.value; LS.set('city', S.city); render(); }
  if (d.change === 'sort'){ S.sort = t.value; render(); }
  if (d.in){ S.f[d.in] = t.value; updRange(); }
});
document.addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target, k = f.dataset.form;
  if (k === 'homesearch'){ S.q = f.q.value; S.cat = null; S.chip = 'all'; go('search'); }
  if (k === 'search'){ S.q = f.q.value; render(); }
  if (k === 'post') submitPost();
  if (k === 'chat'){ const v = f.m.value.trim(); if (!v) return; pushMsg(f.dataset.id, {me:true, t:v}); f.m.value = ''; }
});

/* insets from native wrapper */
window.rmInsets = (top, bottom) => { const r = document.documentElement.style; r.setProperty('--sat', top + 'px'); r.setProperty('--sab', bottom + 'px'); };

/* ================= boot ================= */
function boot(){
  const sp = document.createElement('div'); sp.className = 'splash';
  sp.innerHTML = `${LOGO().replace('class="mark"','class="logo"')}<h1>Room<b>Mitra</b></h1><div class="slg">कमरा ढूँढना हुआ <span>आसान।</span></div>
    <div class="sub">मकान मालिक और किराएदार को<br>सीधे जोड़ने वाला प्लेटफ़ॉर्म<br><b style="color:var(--lime)">नाहन • पांवटा साहिब • शिमला • सोलन</b></div>${CITY}
    <svg class="wave" viewBox="0 0 400 130" preserveAspectRatio="none"><path d="M0 40C80 0 160 70 250 40S360 10 400 30V130H0z" fill="#1F8A5B"/><path d="M0 70c90-30 170 40 260 10s110-20 140-10V130H0z" fill="#0F5E3F"/><path d="M0 100c100-25 200 25 400-5V130H0z" fill="#0B4D33"/></svg>`;
  document.body.appendChild(sp);
  if (!location.hash) location.replace('#home');
  render();
  setTimeout(() => { sp.classList.add('hide'); setTimeout(() => sp.remove(), 500); }, 1600);
}
boot();
})();
