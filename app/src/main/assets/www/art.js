/* RoomMitra – icons और illustrations (सभी स्क्रीन इन्हें इस्तेमाल करती हैं) */
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

