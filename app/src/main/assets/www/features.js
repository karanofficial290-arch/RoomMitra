/* RoomMitra – नई फीचर्स: लिस्टिंग विज़ार्ड, मैप, आस-पास के कमरे, ऑनबोर्डिंग, मालिक प्रोफाइल,
   रिपोर्ट, सहायता, नियम, दोस्तों को बुलाएं, नोटिफिकेशन, विज़िट बुकिंग */
(function(){
'use strict';
const X = window.RMX;
const { S, L, db, storage, enc, esc, ic, rs, toast, go, back, render, want, refetch, fresh, errs, sheet, closeSheet,
  topbar, nav, listCard, remember, LIST_SELECT, loggedIn, uid, needUser, openUrl, share, shrink, dataToBlob, rid,
  cityHi, areaHi, placeHi, amenity, since, ago, isPremium, loader, errBox, SCREENS, AFTER, ACT, LS } = X;
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.karan.roommitra';
const CENTER = { 'Nahan':[30.5596,77.2950], 'Paonta Sahib':[30.4384,77.6201], 'Shimla':[31.1048,77.1734], 'Solan':[30.9045,77.0967] };
const SUPPORT_PHONE = () => String(S.config.support_phone || RM_SUPPORT_PHONE);
const SUPPORT_EMAIL = () => String(S.config.support_email || RM_SUPPORT_EMAIL);

/* ================= Leaflet (मैप) – ज़रूरत पड़ने पर ही लोड ================= */
let leafletP = null;
function loadLeaflet(){
  if (window.L && window.L.map) return Promise.resolve(window.L);
  if (leafletP) return leafletP;
  leafletP = new Promise((res, rej) => {
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'vendor/leaflet/leaflet.css'; document.head.appendChild(css);
    const js = document.createElement('script'); js.src = 'vendor/leaflet/leaflet.js';
    js.onload = () => res(window.L); js.onerror = () => { leafletP = null; rej(new Error('मैप लोड नहीं हो सका')); };
    document.head.appendChild(js);
  });
  return leafletP;
}
const TILES = {
  map: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19, attribution:'© OpenStreetMap'}],
  sat: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {maxZoom:19, attribution:'© Esri'}]
};
const pinIcon = (Lf, html, cls='') => Lf.divIcon({ className:'rmpin '+cls, html, iconSize:null, iconAnchor:[0,0] });
window.RMMap = {
  /* डिटेल पेज: लगभग जगह (गोला) */
  async show(id, lat, lng){
    try {
      const Lf = await loadLeaflet(); const el = document.getElementById(id); if (!el || el._map) return;
      const m = Lf.map(el, { zoomControl:false, attributionControl:true, dragging:false, scrollWheelZoom:false, doubleClickZoom:false, touchZoom:false, keyboard:false }).setView([lat, lng], 15);
      Lf.tileLayer(...TILES.map).addTo(m);
      Lf.circle([lat, lng], { radius:350, color:'#0F5E3F', fillColor:'#13704B', fillOpacity:.18, weight:2 }).addTo(m);
      el._map = m; setTimeout(() => m.invalidateSize(), 200);
    } catch(e){ const el = document.getElementById(id); if (el) el.innerHTML = `<div class="empty" style="padding:20px">${ic('map')} मैप के लिए इंटरनेट चाहिए</div>`; }
  }
};

/* ================= GPS ================= */
function getGPS(){
  const msg = { denied:'लोकेशन की इजाज़त नहीं मिली। सेटिंग में RoomMitra को लोकेशन की अनुमति दें।', off:'फोन की लोकेशन (GPS) बंद है। चालू करें',
    nofix:'GPS से जगह नहीं मिली। खुली जगह में जाकर फिर कोशिश करें', timeout:'GPS से जगह नहीं मिली। खुली जगह में जाकर फिर कोशिश करें' };
  if (window.RMNative && RMNative.requestLocation){
    return new Promise((res, rej) => {
      const t = setTimeout(() => { window.rmLocation = null; rej(new Error(msg.timeout)); }, 25000);
      window.rmLocation = (lat, lng, err) => { clearTimeout(t); window.rmLocation = null; err ? rej(new Error(msg[err] || msg.nofix)) : res([lat, lng]); };
      RMNative.requestLocation();
    });
  }
  return new Promise((res, rej) => {
    if (!navigator.geolocation) return rej(new Error('इस फोन में GPS नहीं मिला'));
    navigator.geolocation.getCurrentPosition(p => res([p.coords.latitude, p.coords.longitude]),
      e => rej(new Error(e.code === 1 ? msg.denied : e.code === 2 ? msg.off : msg.nofix)), { enableHighAccuracy:true, timeout:15000, maximumAge:60000 });
  });
}
function km(a, b){
  const R = 6371, r = x => x * Math.PI / 180, dLat = r(b[0]-a[0]), dLng = r(b[1]-a[1]);
  const h = Math.sin(dLat/2)**2 + Math.cos(r(a[0]))*Math.cos(r(b[0]))*Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
/* OpenStreetMap से पता खोजना (Nominatim) */
async function geoSearch(q){
  const u = 'https://nominatim.openstreetmap.org/search?format=json&limit=6&countrycodes=in&accept-language=hi,en&viewbox=76.6,31.6,78.0,30.2&q=' + encodeURIComponent(q);
  const r = await fetch(u); if (!r.ok) throw new Error('खोज अभी काम नहीं कर रही, थोड़ी देर बाद कोशिश करें'); return r.json();
}
async function geoReverse(lat, lng){
  try { const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&zoom=17&accept-language=hi,en&lat=${lat}&lon=${lng}`); const j = await r.json(); return j.display_name || ''; }
  catch(e){ return ''; }
}

/* ================= गाइड वीडियो ================= */
function guide(name, label){ return `<button type="button" class="guidebtn" data-x="guide:${name}"><span>▶</span>${esc(label || 'देखें कैसे भरें')}</button>`; }
X.click.guide = (name) => {
  sheet(`<h3>कैसे भरें?</h3><video class="guidevid" src="media/guide_${esc(name)}.mp4" controls autoplay playsinline></video>
    <button class="btn pri block" style="margin-top:12px" data-act="closesheet">समझ गया</button>`);
};

/* ================= ऑनबोर्डिंग ================= */
let wslide = 0;
const WSLIDES = [
  { media:`<video class="wvid" src="media/intro.mp4" autoplay muted loop playsinline></video>`, t:'कमरा ढूँढना हुआ आसान', p:'नाहन, पांवटा साहिब, शिमला और सोलन में कमरे, PG और फ्लैट — सीधे मकान मालिक से।' },
  { media:`<img class="wimg" src="img/onboard_art.png" alt="">`, t:'मकान मालिक हैं?', p:'7 आसान चरणों में अपना कमरा फ्री में लिस्ट करें और सीधे किरायेदार पाएं।' },
  { media:`<img class="wimg" src="img/login_art.png" alt="">`, t:'आपकी सुरक्षा, हमारी प्राथमिकता', p:'कोई दलाल नहीं, कोई ऑनलाइन पेमेंट नहीं। हर लिस्टिंग एडमिन जाँच के बाद दिखती है।' }
];
SCREENS.welcome = () => {
  const w = WSLIDES[wslide];
  return `<div class="welcome screen nonav">
    <div class="wtop"><span class="wbrand">${LOGO('#0B4D33')}<b>Room<i>Mitra</i></b></span><button class="more" data-x="wdone">छोड़ें</button></div>
    <div class="wmedia">${w.media}</div>
    <h1>${w.t}</h1><p>${w.p}</p>
    <div class="wdots">${WSLIDES.map((_, i) => `<span class="${i===wslide?'on':''}"></span>`).join('')}</div>
    <div class="cta"><button class="btn pri" data-x="${wslide < WSLIDES.length-1 ? 'wnext' : 'wdone'}">${wslide < WSLIDES.length-1 ? 'आगे' : 'शुरू करें'} ${ic('right')}</button></div>
  </div>`;
};
X.click.wnext = () => { wslide = Math.min(WSLIDES.length-1, wslide+1); render(true); };
X.click.wdone = () => { LS.set('seen_welcome', true); wslide = 0; location.replace('#home'); };

/* ================= लिस्टिंग विज़ार्ड (7 चरण) ================= */
const PTYPES = [['room','कमरा','bed'],['flat','फ्लैट','building'],['house','मकान','home'],['pg','PG / हॉस्टल','users'],['share','रूम पार्टनर','user'],['shop','दुकान/ऑफिस','store']];
const FORM_AMEN = ['wifi','geyser','heater','bed','wardrobe','water','parking','power','view','balcony','kitchen','food','ac','tv','lift'];
const STEPS = ['श्रेणी','जानकारी','किराया','फोटो','सुविधाएँ','पता','जाँचें'];
const MIN_PHOTOS = 3, MAX_PHOTOS = 12;
function newDraft(){
  const m = S.me || {};
  return { _for:'new', _ready:true, step:1, ptype:'', kind:'Room', title:'', city:S.city, area:'', address:'', lat:null, lng:null,
    price:'', deposit:'', rooms:'1', baths:'1', sqft:'', floor:'', furnish:'सेमी फर्निश्ड', gender:'', desc:'', imgs:[], video:null,
    amen:['geyser','water','power'], name:m.name||'', phone:m.phone||'', wa:'', now:true };
}
function saveDraft(){ const d = S.draft; if (d && d._for === 'new') LS.set('draft', Object.assign({}, d, { video:null })); }
function suggestTitle(d){
  const g = {boys:' (लड़कों के लिए)', girls:' (लड़कियों के लिए)', family:' (परिवार के लिए)'}[d.gender] || '';
  if (d.ptype === 'pg') return 'PG' + g + (d.amen.includes('food') ? ' – खाना सहित' : '');
  if (d.ptype === 'share') return `${d.kind === 'Room' ? 'कमरे' : d.kind} में रूम पार्टनर चाहिए`;
  if (d.ptype === 'shop') return `${areaHi(d.area) || ''} में दुकान/ऑफिस`.trim();
  const base = d.kind === 'Room' ? 'सिंगल रूम' : d.kind + (d.ptype === 'house' ? ' मकान' : d.ptype === 'flat' ? ' फ्लैट' : ' रूम');
  return `${base} (${d.furnish})${g}`;
}
function checkStep(n){
  const d = S.draft;
  if (n === 1 && !d.ptype) return 'कृपया पहले एक श्रेणी चुनें';
  if (n === 2){ if (d.title.trim().length < 5) return 'शीर्षक कम से कम 5 अक्षर का लिखें'; }
  if (n === 3){ const p = parseInt(d.price, 10); if (!p || p < 500) return 'सही किराया लिखें (कम से कम ₹500)'; if (d.deposit && +d.deposit > p * 24) return 'डिपॉजिट बहुत ज़्यादा लग रहा है'; }
  if (n === 4 && d.imgs.length < MIN_PHOTOS) return `कम से कम ${MIN_PHOTOS} फोटो जोड़ें (कमरा, बाथरूम, बाहर से)`;
  if (n === 5){
    if (d.desc.trim().length < 15) return 'विवरण कम से कम 15 अक्षर का लिखें';
    if (d.name.trim().length < 2) return 'अपना नाम लिखें';
    if (!/^[6-9]\d{9}$/.test(d.phone)) return 'कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें';
    if (d.wa && !/^[6-9]\d{9}$/.test(d.wa)) return 'WhatsApp नंबर 10 अंकों का होना चाहिए';
  }
  if (n === 6){ if (d.area.trim().length < 2) return 'इलाका/एरिया लिखें'; if (d.address.trim().length < 6) return 'सही जगह का पता लिखें ताकि किरायेदार सही जगह पहुँच सके'; }
  return null;
}
const sel = (d, k, opts) => `<select data-d="${k}">${opts.map(o => { const [v,t] = Array.isArray(o)?o:[o,o]; return `<option value="${esc(v)}" ${String(d[k])===String(v)?'selected':''}>${esc(t)}</option>`; }).join('')}</select>`;
function stepBody(d){
  const areas = (RM_CITIES.find(c=>c.id===d.city)||{}).areas || [];
  switch(d.step){
  case 1: return `<div class="card"><h3>${ic('home')} आप क्या किराये पर दे रहे हैं?</h3>${guide('category')}
      <div class="ptgrid">${PTYPES.map(([k,t,i]) => `<button type="button" class="${d.ptype===k?'on':''}" data-ptype2="${k}">${ic(i)}<b>${t}</b></button>`).join('')}</div></div>`;
  case 2: return `<div class="card"><h3>${ic('doc')} बुनियादी जानकारी</h3>
      <div class="fld"><label>लिस्टिंग का शीर्षक <i>*</i></label><div class="inp"><input data-d="title" maxlength="90" value="${esc(d.title)}" placeholder="जैसे - 2BHK फ्लैट (फर्निश्ड)"></div>
        <button type="button" class="more" data-x="autotitle">${ic('sparkle')} सुझाया गया शीर्षक: ${esc(suggestTitle(d))}</button></div>
      <div class="grid2">
        <div class="fld"><label>टाइप</label><div class="inp">${ic('home')}${sel(d,'kind',[['Room','सिंगल रूम'],'1RK','1BHK','2BHK','3BHK','4BHK',['PG','PG'],['Shop','दुकान/ऑफिस']])}${ic('down')}</div></div>
        <div class="fld"><label>कमरे</label><div class="inp">${ic('bed')}${sel(d,'rooms',['1','2','3','4','5','6'])}${ic('down')}</div></div>
        <div class="fld"><label>बाथरूम</label><div class="inp">${ic('bath')}${sel(d,'baths',[['0','साझा'],'1','2','3','4'])}${ic('down')}</div></div>
        <div class="fld"><label>मंजिल</label><div class="inp">${ic('building')}${sel(d,'floor',[['','चुनें'],'Ground Floor','1st Floor','2nd Floor','3rd Floor','4th Floor','5th Floor+'])}${ic('down')}</div></div>
        <div class="fld"><label>फर्निशिंग</label><div class="inp">${sel(d,'furnish',['फर्निश्ड','सेमी फर्निश्ड','अनफर्निश्ड'])}${ic('down')}</div></div>
        <div class="fld"><label>किनके लिए है</label><div class="inp">${sel(d,'gender',[['','सभी के लिए'],['boys','सिर्फ लड़कों के लिए'],['girls','सिर्फ लड़कियों के लिए'],['family','परिवार के लिए']])}${ic('down')}</div></div>
        <div class="fld"><label>एरिया (sq ft)</label><div class="inp">${ic('size')}<input data-d="sqft" inputmode="numeric" maxlength="5" value="${esc(d.sqft)}" placeholder="जैसे - 250 (वैकल्पिक)"></div></div>
      </div></div>`;
  case 3: return `<div class="card"><h3>${ic('rupee')} किराया और ज़रूरी जानकारी</h3>${guide('rent')}
      <div class="fld"><label>मासिक किराया (₹) <i>*</i></label><div class="inp"><b style="color:var(--g8)">₹</b><input data-d="price" inputmode="numeric" maxlength="7" value="${esc(d.price)}" placeholder="जैसे - 4500"></div></div>
      <div class="fld"><label>सिक्योरिटी डिपॉजिट (₹)</label><div class="inp"><b style="color:var(--g8)">₹</b><input data-d="deposit" inputmode="numeric" maxlength="8" value="${esc(d.deposit)}" placeholder="जैसे - 10000 (वैकल्पिक)"></div></div>
      <div class="tg"><span>अभी खाली है (तुरंत शिफ्ट हो सकते हैं)</span><button type="button" class="sw ${d.now?'on':''}" data-dnow="1"></button></div>
      <div class="note" style="margin:10px 0 0;justify-content:flex-start">${ic('info')} RoomMitra किराया या डिपॉजिट नहीं लेता — यह सीधे किरायेदार से तय होता है।</div></div>`;
  case 4: return `<div class="card"><h3>${ic('image')} फोटो और वीडियो</h3>${guide('photos')}
      <ul class="tips"><li>अच्छी रोशनी में फोटो लें (दिन में सबसे बेहतर)</li><li>अलग-अलग कोने की फोटो लें — कमरा, बाथरूम, किचन</li><li>दरवाज़ा, खिड़की, बालकनी भी दिखाएँ</li><li>फोटो साफ़ हो, धुंधली फोटो से बचें</li></ul>
      <div class="photos" id="photos">${photoStrip()}</div>
      <p class="phint">कम से कम ${MIN_PHOTOS}, अधिकतम ${MAX_PHOTOS} फोटो · पहली फोटो कवर बनेगी</p>
      <input type="file" id="pfile" accept="image/*" multiple hidden>
      <h3 style="margin-top:16px">${ic('video')} वीडियो टूर (वैकल्पिक)</h3>
      ${d.video || d.video_url ? `<div class="vidrow"><video src="${esc(d.video ? d.video.preview : d.video_url)}" controls playsinline></video><button type="button" class="btn out sm" data-x="rmvideo">${ic('trash')} हटाएं</button></div>`
        : `<button type="button" class="add wide" data-x="addvideo">${ic('video')} वीडियो जोड़ें<small>30 सेकंड से 1 मिनट · अधिकतम 30MB</small></button>`}
      <input type="file" id="vfile" accept="video/*" hidden></div>`;
  case 5: return `<div class="card"><h3>${ic('star')} सुविधाएँ (एक या अधिक चुनें)</h3>${guide('amenities')}
      <div class="chk">${FORM_AMEN.map(a => { const m = amenity(a); const on = d.amen.includes(a); return `<button type="button" class="${on?'on':''}" data-damen="${a}"><span class="tk">${ic('check')}</span>${ic(m.ic)}${m.hi}</button>`; }).join('')}</div></div>
    <div class="card"><h3>${ic('doc')} विवरण <i style="color:var(--red);font-style:normal">*</i></h3>
      <textarea class="ta" data-d="desc" maxlength="1000" placeholder="जैसे - धूप वाला कमरा, 24x7 पानी, बस स्टैंड 5 मिनट, कॉलेज पास में...">${esc(d.desc)}</textarea><div class="cc" id="dcount">${d.desc.length}/1000</div></div>
    <div class="card"><h3>${ic('phone')} आपका संपर्क विवरण</h3>
      <div class="fld"><label>नाम <i>*</i></label><div class="inp">${ic('user')}<input data-d="name" maxlength="80" value="${esc(d.name)}" placeholder="जैसे - राजेश शर्मा"></div></div>
      <div class="grid2"><div class="fld"><label>मोबाइल नंबर <i>*</i></label><div class="inp">${ic('phone')}<input data-d="phone" inputmode="tel" maxlength="10" value="${esc(d.phone)}" placeholder="10 अंक"></div></div>
      <div class="fld"><label>WhatsApp (वैकल्पिक)</label><div class="inp">${WA}<input data-d="wa" inputmode="tel" maxlength="10" value="${esc(d.wa)}" placeholder="अगर अलग हो"></div></div></div>
      <div class="note" style="margin:0;justify-content:flex-start">${ic('lock')} आपका नंबर सिर्फ लॉगिन किए हुए किरायेदारों को कॉल/WhatsApp बटन से मिलता है।</div></div>`;
  case 6: return `<div class="card"><h3>${ic('pin')} प्रॉपर्टी की लोकेशन</h3>${guide('address', 'पता कैसे भरें')}
      <div class="grid2">
        <div class="fld"><label>शहर <i>*</i></label><div class="inp">${ic('pin')}${sel(d,'city', RM_CITIES.map(c=>[c.id,c.hi]))}${ic('down')}</div></div>
        <div class="fld"><label>इलाका/एरिया <i>*</i></label><div class="inp">${ic('building')}<input data-d="area" maxlength="80" list="pareas" value="${esc(d.area)}" placeholder="जैसे - ${esc(areas[0]||'')}"></div>
          <datalist id="pareas">${areas.map(a=>`<option value="${esc(a)}">`).join('')}</datalist></div></div>
      <div class="fld"><label>पूरा पता <i>*</i> <small style="color:var(--ink3)">(किरायेदारों को नहीं दिखेगा)</small></label>
        <textarea class="ta" data-d="address" maxlength="300" style="min-height:70px" placeholder="मकान नंबर, गली, मोहल्ला... जैसे - रानी ताल के पास">${esc(d.address)}</textarea></div>
      <h3 style="margin-top:6px">${ic('map')} नक्शे पर पिन लगाएँ ${guide('map','मैप कैसे इस्तेमाल करें')}</h3>
      ${d.lat != null ? `<div class="dmap" id="wmap"></div><p class="mapnote">${ic('checkc')} पिन लग गया · ${(+d.lat).toFixed(5)}, ${(+d.lng).toFixed(5)}</p>
          <button type="button" class="btn out block" data-go="pick">${ic('edit')} पिन बदलें</button>`
        : `<button type="button" class="pinbtn" data-go="pick">${ic('pin')}<div><b>नक्शे पर पिन लगाएँ</b><small>ठीक वही जगह चुनें जहाँ आपकी प्रॉपर्टी है</small></div>${ic('right')}</button>`}
      <p class="mapnote">${ic('lock')} सुरक्षा के लिए किरायेदारों को सिर्फ लगभग जगह (≈350 m) दिखेगी।</p></div>`;
  case 7: {
    const p = PTYPES.find(x => x[0] === d.ptype) || ['','—'];
    const row = (k, v) => `<div class="rvrow"><span>${k}</span><b>${v}</b></div>`;
    return `<div class="card"><h3>${ic('checkc')} सब ठीक है? एक बार देख लें</h3>
      ${d.imgs[0] ? `<img class="rvcover" src="${esc(d.imgs[0].url || d.imgs[0].data)}" alt="">` : ''}
      ${row('शीर्षक', esc(d.title))}${row('श्रेणी', p[1] + ' · ' + esc(d.kind))}${row('किराया', rs(d.price) + '/माह')}${d.deposit ? row('डिपॉजिट', rs(d.deposit)) : ''}
      ${row('जगह', esc(areaHi(d.area)) + ', ' + esc(cityHi(d.city)))}${row('मैप पिन', d.lat != null ? '✅ लगा है' : '❌ नहीं लगा')}
      ${row('फोटो', d.imgs.length + (d.video || d.video_url ? ' + वीडियो' : ''))}${row('सुविधाएँ', d.amen.map(a => (amenity(a)||{}).hi).join(', ') || '—')}
      ${row('संपर्क', esc(d.name) + ' · ' + esc(d.phone))}
      <button type="button" class="more" data-x="gostep:1">${ic('edit')} कुछ बदलना है?</button></div>
      <div class="note">${ic('shield')} सबमिट करने के बाद लिस्टिंग <b>&nbsp;जाँच में&nbsp;</b> जाएगी। एडमिन मंज़ूर करते ही सबको दिखने लगेगी।</div>
      <label class="agree"><input type="checkbox" id="agree" ${d.agree?'checked':''}> मैं पुष्टि करता/करती हूँ कि जानकारी और फोटो सही हैं और मुझे यह प्रॉपर्टी लिस्ट करने का अधिकार है।</label>`;
  }}
}
function photoStrip(){
  const d = S.draft;
  return `${d.imgs.length < MAX_PHOTOS ? `<button type="button" class="add" data-act="addphoto">${ic('camera')}फोटो जोड़ें<small>(${d.imgs.length}/${MAX_PHOTOS})</small></button>` : ''}` +
    d.imgs.map((p,i) => `<div class="p"><img src="${esc(p.url || p.data)}" alt="">${i===0?'<span class="cover">कवर</span>':`<button type="button" class="mkcover" data-x="cover:${i}">कवर</button>`}<button type="button" data-rmphoto="${i}">${ic('x')}</button></div>`).join('');
}
SCREENS.post = (editId) => {
  if (editId){
    const l = S.byId.get(editId);
    if (!S.draft || S.draft._for !== editId){
      if (!l || !S.priv || S.priv.id !== editId){ wantEdit(editId); return `<div class="screen nonav">${topbar('लिस्टिंग बदलें')}${errs['edit:'+editId] ? errBox('edit:'+editId) : loader()}</div>`; }
      if (l.owner_id !== uid() && !(S.me && S.me.role === 'admin')) return `<div class="screen nonav">${topbar()}<div class="empty"><b>यह आपकी लिस्टिंग नहीं है</b></div></div>`;
      const p = S.priv;
      S.draft = { _for:l.id, _ready:true, step:1, ptype: l.roommate ? 'share' : l.ptype, kind:l.kind, title:l.title, city:l.city, area:l.area, address:p.address_full||'',
        lat:p.lat, lng:p.lng, price:String(l.price), deposit:l.deposit?String(l.deposit):'', rooms:String(l.rooms), baths:String(l.baths), sqft:l.sqft?String(l.sqft):'',
        floor:l.floor||'', furnish:l.furnish||'सेमी फर्निश्ड', gender:l.gender||'', desc:l.description, imgs:l.images.map(u => ({url:u})), video:null, video_url:l.video_url,
        amen:[...l.amenities], name:l.contact_name, phone:p.contact_phone||'', wa:p.whatsapp||'', now:l.available_now, _orig:[...l.images], _origVideo:l.video_url };
    }
  } else if (!S.draft || S.draft._for !== 'new'){
    const saved = LS.get('draft', null);
    S.draft = saved && saved._for === 'new' ? Object.assign(newDraft(), saved, {video:null}) : newDraft();
  }
  const d = S.draft;
  return `<div class="screen nonav">
  ${topbar(d._for === 'new' ? 'अपनी प्रॉपर्टी लिस्ट करें' : 'लिस्टिंग बदलें', `<button class="ibtn glass" data-x="wizclose">${ic('x')}</button>`)}
  <div class="wiz"><div class="wizbar"><span style="width:${(d.step/7*100).toFixed(0)}%"></span></div>
    <div class="wizsteps">${STEPS.map((t,i) => `<button type="button" class="${i+1===d.step?'on':i+1<d.step?'done':''}" data-x="gostep:${i+1}">${i+1<d.step?'✓':i+1}<small>${t}</small></button>`).join('')}</div></div>
  <form data-form="wiz" onsubmit="return false">${stepBody(d)}</form>
  <div class="cta">${d.step > 1 ? `<button class="btn out" data-x="prev">${ic('back')} पीछे</button>` : ''}
    ${d.step < 7 ? `<button class="btn pri" data-x="next">आगे (${d.step}/7) ${ic('right')}</button>` : `<button class="btn pri" id="postbtn" data-x="submit">${ic('send')} ${d._for==='new'?'लिस्टिंग सबमिट करें':'बदलाव सेव करें'}</button>`}</div>
  </div>`;
};
function wantEdit(id){
  want('edit:'+id, 30e3, async () => {
    if (!S.byId.has(id)) await L.listing(id)();
    const p = await db.rpc('listing_private', {lid:id});
    S.priv = Object.assign({id}, p || {});
  });
}
AFTER.post = () => {
  const d = S.draft; if (!d) return;
  const inp = $('#pfile');
  if (inp) inp.addEventListener('change', async () => {
    const files = [...inp.files], room = MAX_PHOTOS - d.imgs.length; let skipped = Math.max(0, files.length - room);
    for (const f of files.slice(0, room)){
      if (f.size > 15 * 1024 * 1024){ skipped++; continue; }
      try { d.imgs.push({ data: await shrink(f, 1280, .78) }); } catch(e){ skipped++; }
    }
    if (skipped) toast(`${skipped} फोटो छोड़ी गईं (बहुत बड़ी या सीमा पूरी)`);
    inp.value = ''; $('#photos').innerHTML = photoStrip(); saveDraft();
  });
  const vf = $('#vfile');
  if (vf) vf.addEventListener('change', () => {
    const f = vf.files[0]; if (!f) return;
    if (f.size > 30 * 1024 * 1024) return toast('वीडियो 30MB से छोटा होना चाहिए');
    d.video = { file:f, preview: URL.createObjectURL(f) }; render(true);
  });
  if (d.step === 6 && d.lat != null) miniPin('wmap', d.lat, d.lng);
};
async function miniPin(id, lat, lng){
  try { const Lf = await loadLeaflet(); const el = document.getElementById(id); if (!el || el._map) return;
    const m = Lf.map(el, { zoomControl:false, dragging:false, touchZoom:false, doubleClickZoom:false, scrollWheelZoom:false }).setView([lat, lng], 16);
    Lf.tileLayer(...TILES.map).addTo(m); Lf.marker([lat, lng], { icon: pinIcon(Lf, '<span class="pinhead"></span>') }).addTo(m); el._map = m;
  } catch(e){}
}
X.click.prev = () => { S.draft.step = Math.max(1, S.draft.step - 1); saveDraft(); render(false); };
X.click.next = () => {
  const d = S.draft, err = checkStep(d.step);
  if (err) return toast(err);
  if (d.step === 1 && d.ptype){ /* श्रेणी से टाइप भरें */
    if (d.ptype === 'pg') d.kind = 'PG'; else if (d.ptype === 'shop') d.kind = 'Shop';
    else if (d.ptype === 'room' || d.ptype === 'share'){ if (!/^(Room|1RK)$/.test(d.kind)) d.kind = 'Room'; }
    else if (!/BHK/.test(d.kind)) d.kind = '1BHK';
    if (!d.title) d.title = suggestTitle(d);
  }
  d.step++; saveDraft(); render(false);
};
X.click.gostep = (n) => {
  const d = S.draft; n = +n;
  for (let i = 1; i < n; i++){ const err = checkStep(i); if (err){ d.step = i; render(false); return toast(err); } }
  d.step = n; render(false);
};
X.click.autotitle = () => { S.draft.title = suggestTitle(S.draft); const t = $('[data-d="title"]'); if (t) t.value = S.draft.title; saveDraft(); };
X.click.cover = (i) => { const d = S.draft, p = d.imgs.splice(+i, 1)[0]; d.imgs.unshift(p); $('#photos').innerHTML = photoStrip(); saveDraft(); };
X.click.addvideo = () => $('#vfile').click();
X.click.rmvideo = () => { const d = S.draft; d.video = null; d.video_url = null; render(true); };
X.click.wizclose = () => {
  const d = S.draft;
  sheet(`<h3>बाहर निकलें?</h3><p>${d._for==='new' ? 'आपकी भरी हुई जानकारी ड्राफ्ट में सेव रहेगी (वीडियो को छोड़कर)।' : 'बदलाव सेव नहीं होंगे।'}</p>
    <div class="grid2"><button class="btn out" data-act="closesheet">भरते रहें</button><button class="btn pri" data-x="wizexit">बाहर जाएं</button></div>`);
};
X.click.wizexit = () => { saveDraft(); closeSheet(); if (S.draft && S.draft._for !== 'new') S.draft = null; back(); };
/* श्रेणी चुनना */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-ptype2]'); if (!b) return;
  S.draft.ptype = b.dataset.ptype2; $$('[data-ptype2]').forEach(x => x.classList.toggle('on', x === b)); saveDraft();
});
document.addEventListener('input', e => { if (e.target.dataset && e.target.dataset.d && S.draft) setTimeout(saveDraft, 0); });
document.addEventListener('change', e => { if (e.target.id === 'agree' && S.draft) S.draft.agree = e.target.checked; });

X.click.submit = async () => {
  const d = S.draft;
  for (let i = 1; i <= 6; i++){ const err = checkStep(i); if (err){ d.step = i; render(false); return toast(err); } }
  if (!$('#agree') || !$('#agree').checked) return toast('कृपया पुष्टि वाले बॉक्स पर टिक करें');
  if (S.busy) return; S.busy = true;
  const btn = $('#postbtn'); if (btn) btn.disabled = true;
  const setBtn = t => { if (btn) btn.innerHTML = `<span class="spin sm"></span> ${t}`; };
  try {
    const urls = [];
    for (let i = 0; i < d.imgs.length; i++){
      const p = d.imgs[i]; if (p.url){ urls.push(p.url); continue; }
      setBtn(`फोटो अपलोड (${i+1}/${d.imgs.length})...`);
      const url = await storage.upload('listing-photos', `${uid()}/${rid()}.jpg`, await dataToBlob(p.data));
      p.url = url; delete p.data; urls.push(url); saveDraft();
    }
    let video_url = d.video_url || null;
    if (d.video){
      setBtn('वीडियो अपलोड हो रहा है...');
      const ext = (d.video.file.name.split('.').pop() || 'mp4').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,4) || 'mp4';
      video_url = await storage.upload('listing-videos', `${uid()}/${rid()}.${ext}`, d.video.file);
      d.video_url = video_url; d.video = null;
    }
    setBtn('सेव हो रहा है...');
    const ptype = d.ptype === 'share' ? 'room' : d.ptype;
    const row = {
      title: d.title.trim().slice(0, 90), kind: d.kind, ptype, roommate: d.ptype === 'share', city: d.city, area: d.area.trim(),
      price: parseInt(d.price, 10), deposit: d.deposit ? parseInt(d.deposit, 10) : null,
      rooms: +d.rooms, baths: +d.baths, sqft: d.sqft ? +d.sqft : null, floor: d.floor || null, furnish: d.furnish, gender: d.gender || null,
      description: d.desc.trim(), amenities: d.amen, images: urls, video_url,
      contact_name: d.name.trim(), contact_phone: d.phone, whatsapp: d.wa || null, available_now: !!d.now,
      address_full: d.address.trim(), lat: d.lat, lng: d.lng
    };
    let saved;
    if (d._for === 'new'){ row.owner_id = uid(); saved = (await db.insert('listings', row, LIST_SELECT))[0]; }
    else {
      saved = (await db.update('listings', `id=eq.${enc(d._for)}&${LIST_SELECT}`, row))[0];
      const gone = (d._orig||[]).filter(u => !urls.includes(u)).map(u => storage.pathFromUrl('listing-photos', u)).filter(Boolean);
      storage.remove('listing-photos', gone).catch(()=>{});
      if (d._origVideo && d._origVideo !== video_url){ const vp = storage.pathFromUrl('listing-videos', d._origVideo); if (vp) storage.remove('listing-videos', [vp]).catch(()=>{}); }
    }
    remember([saved]);
    if (S.me && (!S.me.name || !S.me.phone)){
      const patch = {}; if (!S.me.name) patch.name = row.contact_name; if (!S.me.phone) patch.phone = row.contact_phone;
      db.update('profiles', `id=eq.${uid()}`, patch, true).then(() => { Object.assign(S.me, patch); LS.set('me', S.me); }).catch(()=>{});
    }
    refetch('city:' + row.city, 'mine'); S.cityList[row.city] = null; S.mine = null;
    if (d._for === 'new') LS.del('draft');
    S.draft = null; S.priv = null;
    location.replace('#done/' + saved.id);
  } catch(e){
    toast(e.message);
    if (btn){ btn.disabled = false; btn.innerHTML = `${ic('send')} फिर कोशिश करें`; }
  } finally { S.busy = false; }
};

/* ---------- सफलता स्क्रीन ---------- */
SCREENS.done = (id) => {
  const l = S.byId.get(id) || {};
  const live = l.review === 'approved';
  return `<div class="screen nonav done">
    <div class="donebox"><div class="tick">${ic('check')}</div>
      <h1>${live ? 'लिस्टिंग लाइव हो गई! 🎉' : 'लिस्टिंग भेज दी गई!'}</h1>
      <p>${live ? 'आपकी प्रॉपर्टी अब सबको दिख रही है।' : 'धन्यवाद! आपकी प्रॉपर्टी अब जाँच के लिए हमारे पास है। मंज़ूर होते ही सबको दिखने लगेगी और आपको सूचना मिलेगी।'}</p>
      <div class="steps3"><div><b>1</b>लिस्टिंग भेजी ✓</div><div class="${live?'':'cur'}"><b>2</b>एडमिन जाँच</div><div class="${live?'cur':''}"><b>3</b>सबको दिखेगी</div></div>
      <p class="small">"मेरी लिस्टिंग" में स्थिति देख सकते हैं।</p></div>
    <div class="wrap" style="display:grid;gap:10px">
      <button class="btn pri block" data-go="dash">${ic('home')} मेरी लिस्टिंग देखें</button>
      ${id ? `<button class="btn out block" data-open="${esc(id)}">${ic('eye')} लिस्टिंग का प्रीव्यू</button>` : ''}
      <button class="btn out block" data-go="home">होम पर जाएं</button></div>
  </div>`;
};

/* ================= मैप से जगह चुनना ================= */
let pickMap = null, pickLayer = 'map', pickTimer = null;
SCREENS.pick = () => {
  const d = S.draft;
  if (!d) return `<div class="screen nonav">${topbar()}<div class="empty"><b>पहले लिस्टिंग फॉर्म खोलें</b></div></div>`;
  return `<div class="pickscr">
    <div class="pickmap" id="pickmap"></div>
    <div class="pickcenter"><span class="pinhead big"></span></div>
    <div class="picktop">
      <button class="ibtn solidw" data-act="back">${ic('back')}</button>
      <form class="search" data-form="geosearch" style="flex:1;padding:2px 6px 2px 14px">${ic('search')}<input id="geoq" placeholder="पता या इलाका खोजें (जैसे Rani Tal Nahan)" autocomplete="off"></form>
    </div>
    <div class="georesults" id="georesults" hidden></div>
    <div class="pickside">
      <button class="ibtn solidw" data-x="gps" aria-label="GPS">${ic('target')}</button>
      <button class="ibtn solidw" data-x="layer" aria-label="सैटेलाइट">${ic('map')}</button>
    </div>
    <div class="pickcard"><b>${ic('pin')} नक्शे पर ठीक वही जगह चुनें जहाँ आपकी प्रॉपर्टी है</b>
      <p id="pickaddr">पहले जगह चुनें: पता खोजें, GPS दबाएँ या मैप खिसकाएँ</p>
      <button class="btn pri block" data-x="pickok">${ic('check')} यही लोकेशन पक्की करें</button></div>
  </div>`;
};
AFTER.pick = async () => {
  const d = S.draft; if (!d) return;
  try {
    const Lf = await loadLeaflet(), el = $('#pickmap'); if (!el) return;
    const start = d.lat != null ? [d.lat, d.lng] : (CENTER[d.city] || CENTER.Nahan);
    pickMap = Lf.map(el, { zoomControl:false }).setView(start, d.lat != null ? 17 : 14);
    pickMap._base = Lf.tileLayer(...TILES[pickLayer]).addTo(pickMap);
    const upd = () => { clearTimeout(pickTimer); pickTimer = setTimeout(async () => {
      const c = pickMap.getCenter(); const a = $('#pickaddr'); if (!a) return;
      a.textContent = 'पता ढूँढ रहे हैं...'; const t = await geoReverse(c.lat, c.lng); if ($('#pickaddr')) $('#pickaddr').textContent = t || 'पता अपने आप नहीं मिला, कृपया फॉर्म में पता खुद लिखें'; }, 700); };
    pickMap.on('moveend', upd); upd();
  } catch(e){ const el = $('#pickmap'); if (el) el.innerHTML = `<div class="empty">${ic('map')}<b>मैप लोड नहीं हो सका</b>इंटरनेट जाँचकर फिर कोशिश करें</div>`; }
};
X.click.layer = async () => {
  if (!pickMap) return; const Lf = await loadLeaflet();
  pickLayer = pickLayer === 'map' ? 'sat' : 'map'; pickMap.removeLayer(pickMap._base);
  pickMap._base = Lf.tileLayer(...TILES[pickLayer]).addTo(pickMap); toast(pickLayer === 'sat' ? 'सैटेलाइट व्यू' : 'मैप व्यू');
};
X.click.gps = async () => {
  toast('आपकी लोकेशन ढूँढ रहे हैं...');
  try { const p = await getGPS(); if (pickMap) pickMap.setView(p, 18); } catch(e){ toast(e.message); }
};
X.click.pickok = async () => {
  if (!pickMap) return; const c = pickMap.getCenter(), d = S.draft;
  d.lat = +c.lat.toFixed(6); d.lng = +c.lng.toFixed(6);
  const t = $('#pickaddr') ? $('#pickaddr').textContent : '';
  if (!d.address && t && !/^(पहले|पता)/.test(t)) d.address = t.split(',').slice(0, 4).join(',').trim();
  saveDraft(); toast('पिन लग गया ✓'); back();
};
X.click.georesult = (i) => {
  const r = (X._geo || [])[+i]; if (!r || !pickMap) return;
  pickMap.setView([+r.lat, +r.lon], 17); $('#georesults').hidden = true;
};
document.addEventListener('submit', async e => {
  if (e.target.dataset.form !== 'geosearch') return;
  e.preventDefault(); e.stopImmediatePropagation();
  const q = $('#geoq').value.trim(); if (q.length < 3) return toast('कम से कम 3 अक्षर लिखें');
  const box = $('#georesults'); box.hidden = false; box.innerHTML = `<div class="geor">खोज रहे हैं...</div>`;
  try { const r = await geoSearch(q); X._geo = r;
    box.innerHTML = r.length ? r.map((x,i) => `<button class="geor" data-x="georesult:${i}">${ic('pin')} ${esc(x.display_name)}</button>`).join('') : `<div class="geor">कोई जगह नहीं मिली। दूसरा नाम लिखकर देखें</div>`;
  } catch(err){ box.innerHTML = `<div class="geor">${esc(err.message)}</div>`; }
}, true);

/* ================= मेरे पास के कमरे ================= */
let near = { pos:null, err:null, list:null, radius:5, loading:false };
SCREENS.nearby = () => {
  const n = near;
  const inR = n.list && n.pos ? n.list.filter(l => l._km <= n.radius) : [];
  return `<div class="screen">${topbar('मेरे पास के कमरे', `<button class="ibtn" data-x="nearre">${ic('refresh')}</button>`)}
    <div class="chips">${[1,2,5,10,25].map(r => `<button class="${n.radius===r?'on':''}" data-x="radius:${r}">${r} km</button>`).join('')}</div>
    ${n.err ? `<div class="emptybig"><img src="img/empty_art.png" class="eart" alt=""><b>लोकेशन नहीं मिली</b><p>${esc(n.err)}</p>
        <button class="btn pri" data-x="nearre">${ic('target')} फिर कोशिश करें</button><button class="btn out" style="margin-top:10px" data-go="search">शहर से खोजें</button></div>`
      : !n.pos || !n.list ? `<div class="empty"><div class="spin"></div>अपने पास के कमरे देखने के लिए लोकेशन की इजाज़त दें</div>`
      : `<div class="dmap tall" id="nearmap"></div>
        <div class="rcount"><span>${n.radius} km के अंदर ${inR.length} कमरे</span></div>
        <div class="wrap">${inR.length ? inR.map(l => listCard(l, 'search')).join('') :
          `<div class="empty">${ic('search')}<b>${n.radius} km के अंदर अभी कोई उपलब्ध कमरा नहीं मिला</b>दूरी बढ़ाकर देखें या किसी दूसरे इलाके को चुनें।</div>`}</div>`}
    ${nav('search')}</div>`;
};
AFTER.nearby = async () => {
  if (!near.pos && !near.err && !near.loading){
    near.loading = true;
    try {
      const [pos, list] = await Promise.all([getGPS(), db.select('listings', `${LIST_SELECT}&status=eq.active&review=eq.approved&rented=is.false&lat_pub=not.is.null&limit=500`)]);
      near.pos = pos; near.list = remember(list).map(l => Object.assign(l, { _km: km(pos, [l.lat_pub, l.lng_pub]) })).sort((a,b) => a._km - b._km);
    } catch(e){ near.err = e.message; }
    near.loading = false; render(true); return;
  }
  if (near.pos && near.list && $('#nearmap')){
    try {
      const Lf = await loadLeaflet(), el = $('#nearmap'); if (!el || el._map) return;
      const m = Lf.map(el, { zoomControl:false }).setView(near.pos, near.radius <= 2 ? 15 : near.radius <= 5 ? 13 : near.radius <= 10 ? 12 : 10);
      Lf.tileLayer(...TILES.map).addTo(m);
      Lf.circle(near.pos, { radius: near.radius * 1000, color:'#13704B', weight:1, fillOpacity:.05 }).addTo(m);
      Lf.marker(near.pos, { icon: pinIcon(Lf, '<span class="medot"></span>') }).addTo(m);
      near.list.filter(l => l._km <= near.radius).forEach(l => {
        Lf.marker([l.lat_pub, l.lng_pub], { icon: pinIcon(Lf, `<span class="pricepin">${rs(l.price)}</span>`) }).addTo(m).on('click', () => go('p/' + l.id));
      });
      el._map = m;
    } catch(e){}
  }
};
X.click.radius = (r) => { near.radius = +r; render(true); };
X.click.nearre = () => { near = { pos:null, err:null, list:null, radius: near.radius, loading:false }; render(true); };

/* ================= मालिक की प्रोफाइल ================= */
SCREENS.owner = (id) => {
  const o = S.owners[id], me = id === uid();
  if (!o) return `<div class="screen nonav">${topbar('मालिक की प्रोफाइल')}${errs['owner:'+id] ? errBox('owner:'+id) : loader()}</div>`;
  const p = o.p || {};
  return `<div class="screen nonav">${topbar('मालिक की प्रोफाइल')}
    <div class="opcard"><div class="pa">${p.avatar_url ? `<img src="${esc(p.avatar_url)}" alt="">` : ic('user')}</div>
      <h2>${esc(p.name || 'RoomMitra यूज़र')}</h2>
      <div class="oprow">${isPremium(p) ? `<span class="vchip prem">${ic('star','f')}प्रीमियम</span>` : ''}${o.list.some(l => l.verified) ? `<span class="vchip">${ic('shield')}मकान मालिक (Verified)</span>` : `<span class="vchip">${ic('info')}यह मकान मालिक RoomMitra पर नया है</span>`}</div>
      <small>${ic('cal')} ${esc(since(p.created_at))}${p.city ? ' · ' + esc(cityHi(p.city)) : ''}</small>
      ${p.bio ? `<p class="bio">${esc(p.bio)}</p>` : me ? `<p class="bio muted">अपने बारे में कुछ लिखें ताकि किरायेदार भरोसा कर सकें।</p>` : ''}
      ${me ? `<button class="btn out sm" data-act="editprofile">${ic('edit')} प्रोफाइल बदलें</button>` : o.list.length ? `<button class="btn pri sm" data-chatwith="${o.list[0].id}">${ic('chat')} संदेश भेजें</button>` : ''}</div>
    <div class="wrap sec"><h3>इनके द्वारा दिए गए कमरे (${o.list.length})</h3></div>
    <div class="wrap">${o.list.length ? o.list.map(l => listCard(l, 'fav')).join('') : `<div class="empty">${ic('home')}<b>अभी कोई लिस्टिंग नहीं है</b></div>`}</div>
  </div>`;
};
AFTER.owner = (id) => want('owner:'+id, 30e3, L.owner(id));

/* ================= रिपोर्ट ================= */
const RCATS = ['गलत जानकारी / गलत फोटो','पहले ही किराये पर जा चुका','किराया लिस्टिंग से अलग है','नकली / फर्जी लिस्टिंग','धोखाधड़ी / पैसे की मांग','अनुचित / असुरक्षित / दुर्व्यवहार','दूसरा कारण'];
const RHELP = ['अगर कोई प्रॉपर्टी असली नहीं है या फोटो गलत हैं।','अगर यह कमरा पहले ही किराये पर दिया जा चुका है।','अगर लिस्टिंग में लिखा किराया असल किराये से अलग है।','अगर लिस्टिंग किसी और की प्रॉपर्टी की है।','अगर कोई एडवांस या ज्यादा पैसे की मांग कर रहा है।','अगर कुछ अनुचित लगे, खतरा महसूस हो या कोई बदतमीजी करे।',''];
let rep = { cat:null };
SCREENS.report = (id) => {
  const l = S.byId.get(id);
  return `<div class="screen nonav">${topbar('समस्या की रिपोर्ट करें')}
    ${l ? `<div class="lp" style="margin:12px 16px 0"><img src="${esc(l.images[0])}" alt=""><div style="min-width:0"><b>${esc(l.title)}</b><small>${placeHi(l)}</small></div></div>` : ''}
    <div class="card"><h3>${ic('info')} क्या समस्या है?</h3>
      ${RCATS.map((c,i) => `<button class="ropt ${rep.cat===c?'on':''}" data-x="rcat:${i}"><span class="radio"></span><div><b>${c}</b>${RHELP[i]?`<small>${RHELP[i]}</small>`:''}</div></button>`).join('')}
      <div class="fld" style="margin-top:12px"><label>समस्या के बारे में थोड़ा बताएं (वैकल्पिक)</label><textarea class="ta" id="rdetail" maxlength="400"></textarea></div></div>
    <div class="safe" style="margin:14px 16px 0">${ic('shield')}<div><b>हमारी टीम जाँच करती है</b><p>गलत/फर्जी लिस्टिंग हटाई जाती है। पैसे की धोखाधड़ी हो तो साइबर हेल्पलाइन <b>1930</b> पर भी कॉल करें।</p></div></div>
    <div class="cta"><button class="btn pri" id="repbtn" data-x="rsend:${esc(id)}">${ic('send')} रिपोर्ट सबमिट करें</button></div>
  </div>`;
};
X.click.rcat = (i) => { rep.cat = RCATS[+i]; $$('.ropt').forEach((b,k) => b.classList.toggle('on', k === +i)); };
X.click.rsend = async (id) => {
  if (!rep.cat) return toast('कृपया पहले एक श्रेणी चुनें');
  const detail = $('#rdetail').value.trim();
  try { await db.insert('reports', { listing_id:id, reporter_id:uid(), category:rep.cat, reason: detail || rep.cat }, '', true);
    rep.cat = null; toast('धन्यवाद! हमारी टीम आपकी रिपोर्ट की जाँच करेगी।'); back(); }
  catch(e){ toast(/duplicate|23505|unique/i.test(e.message + e.code) ? 'आप इस कमरे की रिपोर्ट पहले ही कर चुके हैं।' : e.message); }
};

/* ================= सहायता (FAQ) ================= */
const FAQ = [
  ['RoomMitra पर कमरा कैसे खोजें?','होम या खोजें टैब में अपना शहर चुनें, फिर कमरे का प्रकार (PG, 1RK, 1BHK आदि) और बजट के हिसाब से फ़िल्टर लगाएँ। "मेरे पास के कमरे" से GPS के ज़रिए आस-पास के कमरे दूरी के साथ देख सकते हैं।'],
  ['मकान मालिक से कैसे संपर्क करूँ?','कमरे की डिटेल स्क्रीन के नीचे "कॉल करें" और "WhatsApp" बटन हैं। 💬 बटन से ऐप में ही चैट कर सकते हैं, या "विज़िट बुक करें" से देखने का समय भेज सकते हैं। इसके लिए लॉगिन ज़रूरी है।'],
  ['विज़िट बुक करने का क्या मतलब है?','आप दिन और समय चुनकर मालिक को कमरा देखने की रिक्वेस्ट भेजते हैं। मालिक को सूचना मिलती है और वह चैट में जवाब देता है।'],
  ['अपना कमरा कैसे लिस्ट करूँ?','नीचे बीच के "लिस्ट करें" बटन को दबाएँ। 7 आसान चरणों में श्रेणी, जानकारी, किराया, फोटो (कम से कम 3), सुविधाएँ, पता और मैप पिन भरें। हर चरण पर ▶ वीडियो से समझें। लिस्टिंग बिल्कुल फ्री है।'],
  ['मेरी लिस्टिंग तुरंत क्यों नहीं दिखती?','नई लिस्टिंग पहले "जाँच में" रहती है। एडमिन उसे देखकर मंज़ूर करता है, उसके बाद ही वह सबको दिखती है। मालिक खुद अपनी लिस्टिंग मंज़ूर नहीं कर सकता। मंज़ूरी की सूचना आपको मिलती है।'],
  ['लिस्टिंग बदलना, हटाना या बंद करना कैसे होगा?','प्रोफाइल में "मेरी लिस्टिंग" खोलें। हर लिस्टिंग पर "बदलें" और "हटाएं" के बटन हैं। कमरा भर जाए तो "किराये पर चढ़ गया?" दबाएँ, तब वह खोज में नहीं दिखेगी। बाद में "फिर से लिस्ट करें" दबा सकते हैं।'],
  ['मेरा पूरा पता और फोन नंबर कौन देख सकता है?','पूरा पता और सटीक मैप पिन सुरक्षित रखे जाते हैं। किरायेदारों को सिर्फ इलाके का नाम और लगभग जगह दिखती है। फोन नंबर सिर्फ लॉगिन किए हुए यूज़र को कॉल/WhatsApp बटन से मिलता है।'],
  ['Verified बैज कैसे मिलता है?','Verified बैज एडमिन की जाँच के बाद ही मिलता है। सही फोटो, सही किराया और पूरी जानकारी देने से जल्दी सत्यापन होता है।'],
  ['क्या ऐप के ज़रिए किराया या डिपॉजिट देना होगा?','नहीं। RoomMitra पर कोई ऑनलाइन पेमेंट नहीं होता। किराया और सिक्योरिटी डिपॉजिट आप सीधे मकान मालिक से तय करें, और कमरा खुद देखने के बाद ही कोई लेन-देन करें।'],
  ['किराये का कमरा लेते समय किन बातों का ध्यान रखें?','कमरा खुद जाकर देखें। एडवांस या डिपॉजिट बात पक्की होने के बाद ही दें, और रसीद या लिखित सहमति ज़रूर लें। जो मालिक बिना कमरा दिखाए पैसे माँगे, उससे सावधान रहें।'],
  ['अगर कोई पैसे माँगे या धोखा दे तो क्या करूँ?','पैसे न दें और तुरंत उस लिस्टिंग की रिपोर्ट करें (⋮ → रिपोर्ट करें)। ज़रूरत लगे तो नज़दीकी पुलिस स्टेशन या साइबर हेल्पलाइन 1930 से संपर्क करें।'],
  ['पसंदीदा कमरे कैसे सेव करूँ?','किसी भी कमरे की फोटो पर दिल का निशान दबाएँ। सेव किए हुए सभी कमरे नीचे के "पसंदीदा" टैब में मिलेंगे।'],
  ['झूठी रिपोर्ट करने पर क्या होता है?','हर रिपोर्ट की जाँच होती है। जानबूझकर झूठी रिपोर्ट करने वाले अकाउंट को ब्लॉक किया जा सकता है।'],
  ['अपना अकाउंट कैसे हटाएं?','प्रोफाइल → "अकाउंट डिलीट करें"। आपकी लिस्टिंग, फोटो, पसंदीदा और चैट तुरंत हट जाते हैं।']
];
let faqQ = '', faqOpen = -1;
SCREENS.help = () => {
  const q = faqQ.trim().toLowerCase();
  const list = FAQ.map((f,i) => [f,i]).filter(([f]) => !q || (f[0] + f[1]).toLowerCase().includes(q));
  const ph = SUPPORT_PHONE(), em = SUPPORT_EMAIL();
  return `<div class="screen nonav">${topbar('सहायता और सपोर्ट')}
    <div class="hello"><img src="img/login_art.png" class="helpart" alt=""><div style="flex:1"><b>हम मदद के लिए हैं</b><p>अक्सर पूछे जाने वाले सवालों के जवाब यहाँ मिलेंगे।</p></div></div>
    <div class="wrap" style="margin-top:12px"><div class="search" style="box-shadow:none">${ic('search')}<input id="faqq" value="${esc(faqQ)}" placeholder="अपना सवाल खोजें..."></div></div>
    <div class="wrap faq">${list.length ? list.map(([f,i]) => `<div class="fq ${faqOpen===i?'open':''}"><button data-x="faq:${i}"><b>${esc(f[0])}</b>${ic('down')}</button>${faqOpen===i?`<p>${esc(f[1])}</p>`:''}</div>`).join('')
      : `<div class="empty">${ic('help')}<b>कोई सवाल नहीं मिला। दूसरा शब्द आज़माएँ।</b></div>`}</div>
    <div class="card"><h3>${ic('chat')} जवाब नहीं मिला? हमसे संपर्क करें</h3>
      <div class="grid2"><button class="btn out wa" data-x="supwa">${WA} WhatsApp</button><button class="btn out" data-tel="${esc(ph)}">${ic('phone')} कॉल करें</button></div>
      <button class="btn pri block" style="margin-top:10px" data-act="mailus">${ic('mail')} ईमेल: ${esc(em)}</button>
      <p class="mapnote">शिकायत के लिए संपर्क: ${esc(ph)} · स्थान: नाहन, हिमाचल प्रदेश, भारत</p></div>
    <div class="safe" style="margin:14px 16px 0">${ic('shield')}<div><b>साइबर धोखाधड़ी हेल्पलाइन: 1930</b><p>पैसे की धोखाधड़ी होने पर तुरंत कॉल करें।</p></div></div>
    <div style="height:20px"></div></div>`;
};
AFTER.help = () => { const q = $('#faqq'); if (q) q.addEventListener('input', () => { faqQ = q.value; const pos = q.selectionStart; render(true); const n = $('#faqq'); n.focus(); n.setSelectionRange(pos, pos); }); };
X.click.faq = (i) => { faqOpen = faqOpen === +i ? -1 : +i; render(true); };
X.click.supwa = () => openUrl('https://wa.me/91' + SUPPORT_PHONE() + '?text=' + encodeURIComponent('नमस्ते, मुझे RoomMitra ऐप में मदद चाहिए।'));
ACT.help = () => go('help');

/* ================= नियम और शर्तें ================= */
SCREENS.terms = () => {
  const sec = (t, items) => `<div class="card"><h3>${t}</h3>${items.map(x => `<p class="tp">• ${x}</p>`).join('')}</div>`;
  return `<div class="screen nonav">${topbar('नियम और शर्तें')}
    <div class="note" style="justify-content:flex-start">RoomMitra इस्तेमाल करने से पहले ये नियम पढ़ें। अंतिम अपडेट: अक्टूबर 2026</div>
    ${sec('RoomMitra के बारे में', ['RoomMitra एक डिजिटल प्लेटफॉर्म है जो कमरा देने वाले मकान मालिकों और कमरा ढूँढने वालों को आपस में जोड़ता है।','किराये का लेन-देन मकान मालिक और किरायेदार के बीच होता है। RoomMitra फिलहाल किराया या सिक्योरिटी डिपॉजिट नहीं लेता।','यह ऐप 18 साल से कम उम्र के लोगों के लिए नहीं है।'])}
    ${sec('प्रॉपर्टी लिस्ट करने वाले यूज़र को', ['प्रॉपर्टी लिस्ट करने का अधिकार होना चाहिए।','असली प्रॉपर्टी की फोटो और वीडियो अपलोड करने होंगे।','सही किराया, डिपॉजिट, लोकेशन और सुविधाएँ देनी होंगी।','उपलब्धता की जानकारी अपडेट रखनी होगी (किराये पर चढ़ने पर बताएं)।'])}
    ${sec('मना की गई गतिविधियाँ', ['नकली प्रॉपर्टी लिस्टिंग या भ्रामक फोटो अपलोड करना।','बिना अधिकार के किसी और की प्रॉपर्टी लिस्ट करना।','पैसे की धोखाधड़ी वाली माँग करना।','स्पैम करना या परेशान करना।','गैरकानूनी कामों के लिए प्लेटफॉर्म का इस्तेमाल करना।'])}
    ${sec('प्लेटफॉर्म की ज़िम्मेदारियाँ', ['RoomMitra एक किराये के मार्केटप्लेस के रूप में काम करता है। हर लिस्टिंग की सटीकता, प्रॉपर्टी की हालत, मालिकाना हक और उपलब्धता की स्वतंत्र जाँच की गारंटी नहीं दी जाती।','गलत/फर्जी लिस्टिंग और आपत्तिजनक यूज़र पर कार्रवाई की जाती है।','इसका मतलब यह नहीं है कि RoomMitra अपनी लागू कानूनी ज़िम्मेदारियों से मुक्त है।'])}
    ${sec('गोपनीयता — हम कौन सी जानकारी लेते हैं', ['आपका ईमेल (लॉगिन के लिए), नाम, मोबाइल नंबर, शहर, लिस्टिंग की जानकारी और फोटो/वीडियो, पसंदीदा कमरे, चैट संदेश और आपकी की हुई रिपोर्ट। मकान मालिक अपना पूरा पता और मैप पिन भी देते हैं।','पूरा पता और सटीक पिन सुरक्षित रखे जाते हैं; किरायेदारों को सिर्फ इलाका और लगभग जगह दिखती है।','डेटा सुरक्षित सर्वर (Supabase, मुंबई) पर रखा जाता है। हम आपकी जानकारी बेचते नहीं हैं; कानून के तहत माँगे जाने पर दी जा सकती है।','आप अपनी लिस्टिंग कभी भी बदल या हटा सकते हैं, और प्रोफाइल से अपना अकाउंट डिलीट कर सकते हैं।'])}
    <div class="card"><h3>संपर्क</h3><p class="tp">ईमेल: ${esc(SUPPORT_EMAIL())} · शिकायत: ${esc(SUPPORT_PHONE())}</p></div>
    <div style="height:20px"></div></div>`;
};
ACT.terms = () => go('terms');

/* ================= दोस्तों को बुलाएं ================= */
SCREENS.invite = () => {
  const msg = `नमस्ते! मैं RoomMitra ऐप इस्तेमाल कर रहा/रही हूँ। नाहन, पांवटा साहिब, शिमला और सोलन में कमरा, PG या फ्लैट — सीधे मकान मालिक से बात, कोई दलाल नहीं। क्या आप भी किराये के कमरे की तलाश में हैं? 👇\n${PLAY_URL}`;
  X._invite = msg;
  return `<div class="screen nonav">${topbar('दोस्तों को बुलाएं')}
    <div class="invhero"><img src="img/onboard_art.png" alt=""><h2>RoomMitra का लिंक WhatsApp पर शेयर करें</h2><p>सीधे मकान मालिक से बात करना अब आसान है।</p></div>
    <div class="card"><h3>${ic('help')} यह कैसे काम करता है?</h3>
      <div class="hsteps"><div><b>1</b>WhatsApp या किसी भी ऐप से दोस्त को भेजें।</div><div><b>2</b>दोस्त ऐप इंस्टॉल करे।</div><div><b>3</b>वह RoomMitra डाउनलोड करके लॉगिन करे और कमरा ढूँढे या लिस्ट करे।</div></div></div>
    <div class="card"><h3>भेजा जाने वाला मैसेज</h3><p class="msgprev">${esc(msg)}</p></div>
    <div class="cta"><button class="btn out" data-x="invcopy">${ic('file')} कॉपी</button><button class="btn pri wa2" data-x="invwa">${WA} WhatsApp पर भेजें</button></div>
  </div>`;
};
X.click.invwa = () => openUrl('https://wa.me/?text=' + encodeURIComponent(X._invite));
X.click.invcopy = () => { try { navigator.clipboard.writeText(X._invite); toast('मैसेज कॉपी हो गया, अब कहीं भी paste कर सकते हो'); } catch(e){ share(X._invite); } };
ACT.shareapp = () => go('invite');

/* ================= नोटिफिकेशन ================= */
SCREENS.notifs = () => {
  const n = S.notifList;
  return `<div class="screen">${topbar('नोटिफिकेशन')}
    <div class="wrap" style="margin-top:12px">${!n ? (errs.notifs ? errBox('notifs') : loader()) : n.length ? n.map(x => `<button class="nrow ${x.read_at?'':'new'}" data-x="nopen:${x.id}">
        <span class="nic">${ic(/संदेश|विज़िट/.test(x.title)?'chat':/मंज़ूर|सत्यापित/.test(x.title)?'checkc':/जाँच/.test(x.title)?'clock':'bell')}</span>
        <div><b>${esc(x.title)}</b>${x.body?`<p>${esc(x.body)}</p>`:''}<small>${esc(ago(x.created_at))}</small></div></button>`).join('')
      : `<div class="emptybig"><img src="img/empty_art.png" class="eart" alt=""><b>अभी कोई सूचना नहीं</b><p>लिस्टिंग की मंज़ूरी, नए संदेश और विज़िट रिक्वेस्ट की सूचना यहाँ आएगी।</p></div>`}</div>
    ${nav('')}</div>`;
};
AFTER.notifs = () => want('notifs', 10e3, async () => {
  S.notifList = await db.select('notifications', 'select=id,title,body,link,read_at,created_at&order=id.desc&limit=100');
  if (S.notifList.some(x => !x.read_at)){ await db.rpc('mark_notifs_read'); S.notifs = 0; X.updateBadges(); }
});
X.click.nopen = (id) => { const x = (S.notifList||[]).find(n => String(n.id) === String(id)); if (x && x.link){ if (/^chat\//.test(x.link)) refetch('convs'); go(x.link); } };

/* ================= विज़िट बुकिंग ================= */
X.visitSheet = (lid) => {
  if (!loggedIn()) return X.needLogin('p/' + lid);
  const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() + i);
    return { k: d.toISOString().slice(0,10), t: i === 0 ? 'आज' : i === 1 ? 'कल' : d.toLocaleDateString('hi-IN', {weekday:'short', day:'numeric', month:'short'}) }; });
  const times = ['सुबह 9 बजे','सुबह 11 बजे','दोपहर 1 बजे','दोपहर 3 बजे','शाम 5 बजे','शाम 6:30 बजे'];
  X._visit = { lid, day: days[1].t, time: times[4] };
  sheet(`<h3>${ic('cal')} विज़िट बुक करें</h3><p>कमरा देखने का दिन और समय चुनें। मालिक को सूचना मिलेगी और वह चैट में जवाब देगा।</p>
    <b class="vlabel">दिन</b><div class="vchips" id="vdays">${days.map(d => `<button class="${d.t===X._visit.day?'on':''}" data-x="vday:${d.t}">${d.t}</button>`).join('')}</div>
    <b class="vlabel">समय</b><div class="vchips" id="vtimes">${times.map(t => `<button class="${t===X._visit.time?'on':''}" data-x="vtime:${t}">${t}</button>`).join('')}</div>
    <textarea class="ta" id="vnote" maxlength="200" style="min-height:60px;margin-top:10px" placeholder="कोई नोट (वैकल्पिक) — जैसे, मेरे साथ परिवार भी आएगा"></textarea>
    <button class="btn pri block" style="margin-top:12px" data-x="vsend">${ic('send')} विज़िट रिक्वेस्ट भेजें</button>`);
};
X.click.vday = (t) => { X._visit.day = t; $$('#vdays button').forEach(b => b.classList.toggle('on', b.textContent === t)); };
X.click.vtime = (t) => { X._visit.time = t; $$('#vtimes button').forEach(b => b.classList.toggle('on', b.textContent === t)); };
X.click.vsend = async () => {
  const v = X._visit, note = ($('#vnote')||{value:''}).value.trim();
  try {
    const cid = await db.rpc('start_conversation', { lid: v.lid });
    const body = `📅 विज़िट रिक्वेस्ट: ${v.day}, ${v.time}${note ? '\n📝 ' + note : ''}\nक्या मैं इस समय कमरा देखने आ सकता/सकती हूँ?`;
    await db.insert('messages', { conversation_id: cid, sender_id: uid(), body, kind: 'visit' }, '', true);
    closeSheet(); toast('विज़िट रिक्वेस्ट भेज दी गई ✓'); refetch('convs'); delete S.msgs[cid];
    await L.convs(); fresh.convs = Date.now(); go('chat/' + cid);
  } catch(e){ toast(e.message); }
};

/* ================= छोटी चीज़ें ================= */
X.photoStrip = photoStrip;
X.click.ownerp = (id) => go('owner/' + id);
})();
