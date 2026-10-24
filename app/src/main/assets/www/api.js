/* RoomMitra – Supabase से बात करने वाला छोटा क्लाइंट (बिना किसी बाहरी लाइब्रेरी के) */
(function(){
'use strict';
const URL_ = window.RM_SUPABASE_URL, KEY = window.RM_SUPABASE_KEY;
const SKEY = 'rm_session';

let session = null;
try { session = JSON.parse(localStorage.getItem(SKEY) || 'null'); } catch(e) { session = null; }
const saveSession = s => { session = s; try { s ? localStorage.setItem(SKEY, JSON.stringify(s)) : localStorage.removeItem(SKEY); } catch(e) {} };

class ApiError extends Error { constructor(msg, status, code){ super(msg); this.status = status; this.code = code; } }

/* सर्वर के अंग्रेज़ी errors को आसान हिंदी में बदलें */
function friendly(msg, status){
  const m = String(msg || '');
  if (/[ऀ-ॿ]/.test(m)) return m;                       // database से पहले से हिंदी संदेश
  if (/rate limit|too many|over_email_send_rate_limit|429/i.test(m) || status === 429) return 'बहुत ज़्यादा कोशिशें हुईं। थोड़ी देर बाद फिर कोशिश करें।';
  if (/otp.*(expired|invalid)|token.*(expired|invalid)|invalid.*(otp|token)/i.test(m)) return 'OTP गलत है या उसका समय खत्म हो गया।';
  if (/email.*invalid|invalid.*email|validate email/i.test(m)) return 'सही ईमेल पता डालें।';
  if (/signups not allowed/i.test(m)) return 'नए अकाउंट अभी बंद हैं।';
  if (/JWT expired|invalid JWT|not authenticated/i.test(m)) return 'दोबारा लॉगिन करें।';
  if (/violates check constraint/i.test(m)) return 'कुछ जानकारी सही नहीं है — फॉर्म जांचें।';
  if (/row-level security|permission denied/i.test(m)) return 'यह काम करने की अनुमति नहीं है।';
  if (/payload too large|exceeded the maximum/i.test(m)) return 'फोटो बहुत बड़ी है।';
  return 'कुछ गड़बड़ हुई। फिर कोशिश करें।';
}

async function raw(path, opt = {}){
  const headers = Object.assign({ apikey: KEY }, opt.headers || {});
  if (opt.auth !== false && session){ await ensureFresh(); if (session) headers.Authorization = 'Bearer ' + session.access_token; }
  if (opt.json !== undefined){ headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(opt.json); }
  let res;
  try { res = await fetch(URL_ + path, { method: opt.method || 'GET', headers, body: opt.body }); }
  catch(e){ throw new ApiError('इंटरनेट कनेक्शन नहीं है। नेट चालू करके फिर कोशिश करें।', 0, 'offline'); }
  const text = await res.text();
  let data = null; try { data = text ? JSON.parse(text) : null; } catch(e) { data = text; }
  if (!res.ok){
    const msg = data && (data.message || data.msg || data.error_description || data.error) || res.statusText;
    if (res.status === 401 && session && opt.auth !== false && !opt._retried){
      // टोकन खराब — एक बार refresh करके फिर से
      try { await refresh(); return raw(path, Object.assign({}, opt, { _retried: true })); } catch(e) {}
    }
    throw new ApiError(friendly(msg, res.status), res.status, data && (data.code || data.error_code));
  }
  return data;
}

/* ---------------- auth ---------------- */
let refreshing = null;
async function refresh(){
  if (!session || !session.refresh_token) throw new ApiError('दोबारा लॉगिन करें।', 401);
  if (!refreshing){
    refreshing = (async () => {
      try {
        const d = await raw('/auth/v1/token?grant_type=refresh_token', { method:'POST', auth:false, json:{ refresh_token: session.refresh_token } });
        setSession(d);
      } catch(e){
        if (e.code !== 'offline') { saveSession(null); window.dispatchEvent(new Event('rm-logout')); }
        throw e;
      } finally { refreshing = null; }
    })();
  }
  return refreshing;
}
async function ensureFresh(){
  if (session && session.expires_at && Date.now()/1000 > session.expires_at - 60) await refresh();
}
function setSession(d){
  saveSession({ access_token: d.access_token, refresh_token: d.refresh_token,
    expires_at: d.expires_at || Math.floor(Date.now()/1000) + (d.expires_in || 3600),
    user: { id: d.user.id, email: d.user.email } });
}

const auth = {
  get user(){ return session && session.user; },
  sendOtp: email => raw('/auth/v1/otp', { method:'POST', auth:false, json:{ email, create_user:true } }),
  async verifyOtp(email, token){
    const d = await raw('/auth/v1/verify', { method:'POST', auth:false, json:{ type:'email', email, token } });
    setSession(d); return d.user;
  },
  async signOut(){ try { await raw('/auth/v1/logout', { method:'POST' }); } catch(e) {} saveSession(null); }
};

/* ---------------- database ---------------- */
const enc = encodeURIComponent;
const db = {
  select: (table, q='') => raw(`/rest/v1/${table}?${q}`),
  insert: (table, row, q='', minimal) => raw(`/rest/v1/${table}?${q}`, { method:'POST', json:row, headers:{ Prefer: minimal ? 'return=minimal' : 'return=representation' } }),
  update: (table, filter, patch, minimal) => raw(`/rest/v1/${table}?${filter}`, { method:'PATCH', json:patch, headers:{ Prefer: minimal ? 'return=minimal' : 'return=representation' } }),
  remove: (table, filter) => raw(`/rest/v1/${table}?${filter}`, { method:'DELETE' }),
  rpc: (fn, args={}) => raw(`/rest/v1/rpc/${fn}`, { method:'POST', json:args })
};

/* ---------------- storage ---------------- */
const storage = {
  publicUrl: (bucket, path) => `${URL_}/storage/v1/object/public/${bucket}/${path}`,
  async upload(bucket, path, blob){
    await raw(`/storage/v1/object/${bucket}/${path}`, { method:'POST', body: blob, headers:{ 'Content-Type': blob.type || 'image/jpeg', 'x-upsert':'true', 'cache-control':'31536000' } });
    return storage.publicUrl(bucket, path);
  },
  pathFromUrl(bucket, url){
    const p = `/storage/v1/object/public/${bucket}/`; const i = String(url).indexOf(p);
    return i < 0 ? null : decodeURIComponent(String(url).slice(i + p.length));
  },
  remove: (bucket, paths) => paths && paths.length ? raw(`/storage/v1/object/${bucket}`, { method:'DELETE', json:{ prefixes: paths } }) : Promise.resolve([]),
  list: (bucket, prefix) => raw(`/storage/v1/object/list/${bucket}`, { method:'POST', json:{ prefix, limit:1000 } })
};

window.RM_API = { auth, db, storage, enc, ApiError };
})();
