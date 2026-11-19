// Sosyal 1. adım testi: hesap + profil. Sahte Supabase (auth + rest) fetch üzerinden.
// Kullanım: node sosyal-test.js <html>
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync(process.argv[2],'utf8');
const wait = ms=>new Promise(r=>setTimeout(r,ms));
let fails=0; const ok=(name,c,extra='')=>{ if(!c) fails++; console.log((c?'✓ ':'✗ ')+name+(extra?' — '+extra:'')); };
const until = async (f, ms=1500)=>{ const t=Date.now(); while(Date.now()-t<ms){ if(f()) return true; await wait(15); } return false; };

/* ---------- sahte Supabase ---------- */
const URL_ = 'https://proje.supabase.co', KEY = 'sb_publishable_test';
const srv = { users:{}, tokens:{}, refresh:{}, profiles:{}, otp:{}, log:[], expireNext:false, n:0 };
function fakeFetch(u, o){
  u = String(u); o = o || {};
  const H = Object.fromEntries(Object.entries(o.headers||{}).map(([k,v])=>[k.toLowerCase(),v]));
  const body = o.body ? JSON.parse(o.body) : null;
  const res = (st, data)=>Promise.resolve({ ok: st>=200&&st<300, status:st, json:async()=>data });
  if(!u.startsWith(URL_)) return u.includes('open-meteo') ? res(200,{current:{temperature_2m:21,weather_code:2}}) : res(404,null);
  const path = u.slice(URL_.length); srv.log.push((o.method||'GET')+' '+path.split('?')[0]);
  if(H.apikey!==KEY) return res(401,{ message:'Invalid API key' });
  const who = ()=>{ const t=(H.authorization||'').replace('Bearer ',''); const r=srv.tokens[t]; return r && r.exp>Date.now() ? r.uid : null; };
  const issue = uid=>{ const at='at'+(++srv.n), rt='rt'+srv.n; srv.tokens[at]={uid, exp: srv.expireNext ? Date.now()-1 : Date.now()+3600e3}; srv.expireNext=false; srv.refresh[rt]=uid;
    return { access_token:at, refresh_token:rt, expires_in:3600, user:{ id:uid, email:srv.users[uid].email } }; };
  if(path==='/auth/v1/otp'){ if(!/@/.test(body.email)) return res(400,{msg:'invalid email'}); if(srv.otp[body.email] && Date.now()-srv.otp[body.email].t<60e3) return res(429,{msg:'For security purposes, you can only request this once every 60 seconds'}); srv.otp[body.email]={code:'123456', t:Date.now()}; return res(200,{}); }
  if(path==='/auth/v1/verify'){ const r=srv.otp[body.email]; if(!r || r.code!==body.token) return res(403,{msg:'Token has expired or is invalid', error_code:'otp_expired'});
    let uid = Object.keys(srv.users).find(k=>srv.users[k].email===body.email); if(!uid){ uid='u'+(++srv.n); srv.users[uid]={email:body.email}; } delete srv.otp[body.email]; return res(200, issue(uid)); }
  if(path.startsWith('/auth/v1/token?grant_type=refresh_token')){ const uid=srv.refresh[body.refresh_token]; if(!uid) return res(400,{msg:'Invalid Refresh Token'}); delete srv.refresh[body.refresh_token]; return res(200, issue(uid)); }
  if(path==='/auth/v1/logout'){ const t=(H.authorization||'').replace('Bearer ',''); delete srv.tokens[t]; return res(204,null); }
  if(path.startsWith('/rest/v1/profiles')){
    if((o.method||'GET')==='GET'){ const id=decodeURIComponent((path.match(/id=eq\.([^&]+)/)||[])[1]||''); return res(200, srv.profiles[id] ? [srv.profiles[id]] : []); }
    const uid = who(); if(!uid) return res(401,{ message:'JWT expired' });
    if(body.id!==uid) return res(403,{ code:'42501', message:'new row violates row-level security policy' });
    const ad = String(body.takma_ad||'').trim(); if(ad.length<2||ad.length>24) return res(400,{ code:'23514', message:'check' });
    const clash = Object.entries(srv.profiles).find(([k,p])=>k!==uid && p.takma_ad.trim().toLowerCase()===ad.toLowerCase());
    if(clash) return res(409,{ code:'23505', message:'duplicate key value violates unique constraint "profiles_takma_ad_tekil"' });
    srv.profiles[uid] = Object.assign({}, srv.profiles[uid]||{}, body); return res(201,[srv.profiles[uid]]);
  }
  if(path==='/rest/v1/rpc/hesabimi_sil'){ const uid=who(); if(!uid) return res(401,{message:'JWT'}); delete srv.profiles[uid]; delete srv.users[uid]; return res(204,null); }
  return res(404,{});
}
function open(cfg, seed){
  const errs=[];
  const dom = new JSDOM(html, { url:'https://muratsahinn.github.io/Patika/', runScripts:'dangerously', pretendToBeVisual:true, beforeParse(w){
    if(cfg) w.localStorage.setItem('patika:sosyal', JSON.stringify({ url:URL_, key:KEY }));
    if(seed) for(const [k,v] of Object.entries(seed)) w.localStorage.setItem(k,v);
    w.fetch = fakeFetch;
    w.speechSynthesis = { speaking:false, cancel(){}, speak(){}, getVoices(){ return []; } };
    w.SpeechSynthesisUtterance = function(t){ this.text=t; };
  }});
  dom.window.addEventListener('error', e=>errs.push(e.message));
  return { w:dom.window, d:dom.window.document, errs };
}
const submit = (d,w,id)=>d.getElementById(id).dispatchEvent(new w.Event('submit',{cancelable:true}));
const msg = d=>(d.getElementById('spMsg')||{}).textContent||'';

(async ()=>{
  try{
  /* --- yapılandırma yokken --- */
  let X = open(false); await wait(400);
  X.d.getElementById('profilBtn').click(); await wait(60);
  ok('kapalıyken: bilgi notu + form yok', /Hesaplar açılınca/.test(X.d.getElementById('spBody').textContent) && !X.d.getElementById('spMail') && /Yakında/.test(X.d.querySelector('#profilBtn small').textContent));
  ok('kapalıyken de künye görünür (yerel istatistik)', !!X.d.querySelector('#spKunye .kn-tag') && /Adın burada/.test(X.d.getElementById('spKunye').textContent));
  X.d.querySelector('.kn-skin [data-skin=matara]').click(); await wait(20);
  ok('matara görünümüne geçer + hatırlanır', !!X.d.querySelector('.kn-flask') && X.w.localStorage.getItem('patika:kunye')==='matara');
  X.d.querySelector('.kn-skin [data-skin=cam]').click(); await wait(20);
  ok('kapalıyken sunucuya istek yok', srv.log.length===0);
  X.w.close();

  /* --- giriş akışı --- */
  const A = open(true); const {d,w} = A; await wait(400);
  d.querySelector('.country-card[data-country="tr"]').click(); await wait(400);
  ok('menü: "Takma adla katıl"', /Takma adla katıl/.test(d.querySelector('#profilBtn small').textContent));
  d.getElementById('profilBtn').click(); await wait(60);
  d.getElementById('spMail').value = 'gecersiz'; submit(d,w,'spMailForm'); await wait(30);
  ok('geçersiz e-posta reddedilir (istek yok)', /Geçerli bir e-posta/.test(msg(d)) && srv.log.length===0);
  d.getElementById('spMail').value = 'murat@ornek.com'; submit(d,w,'spMailForm');
  ok('kod ekranı', await until(()=>d.getElementById('spKod')) && /murat@ornek\.com/.test(d.getElementById('spBody').textContent));
  ok('yeni kod düğmesi 60 sn kilitli', d.getElementById('spResend').disabled && /60 sn/.test(d.getElementById('spResend').textContent));
  d.getElementById('spKod').value = '12345'; submit(d,w,'spKodForm'); await wait(20);
  ok('5 hane reddedilir', /6 haneli/.test(msg(d)));
  d.getElementById('spKod').value = '000000'; submit(d,w,'spKodForm');
  ok('yanlış kod → anlaşılır hata', await until(()=>/hatalı ya da süresi/.test(msg(d))));
  d.getElementById('spKod').value = '123456'; submit(d,w,'spKodForm');
  ok('doğru kod → profil formu', await until(()=>d.getElementById('spAd')));
  const ses = JSON.parse(w.localStorage.getItem('patika:oturum'));
  ok('oturum kaydedildi (token + e-posta)', ses && /^at/.test(ses.access_token) && ses.user.email==='murat@ornek.com');
  ok('durum önerisi: şehir + gün', /^İstanbul'da · 1\. gün$/.test(d.getElementById('spDurum').value), d.getElementById('spDurum').value);
  ok('menü: "Takma adını seç"', /Takma adını seç/.test(d.querySelector('#profilBtn small').textContent));

  /* --- profil --- */
  d.getElementById('spAd').value = 'Canlı Önizleme'; d.getElementById('spAd').dispatchEvent(new w.Event('input'));
  ok('künye yazarken canlı güncellenir', /Canlı Önizleme/.test(d.querySelector('#spKunye .kn-name').textContent));
  d.getElementById('spAd').value = 'a'; submit(d,w,'spProfilForm'); await wait(20);
  ok('kısa takma ad reddedilir', /2–24/.test(msg(d)));
  d.getElementById('spAd').value = '<b>x</b>'; submit(d,w,'spProfilForm'); await wait(20);
  ok('izinsiz karakter reddedilir', /Sadece harf/.test(msg(d)));
  srv.profiles['baska'] = { id:'baska', takma_ad:'Kapadokya Kuşu' };
  d.getElementById('spAd').value = 'kapadokya kuşu'; submit(d,w,'spProfilForm');
  ok('alınmış takma ad (büyük/küçük harf farkı) → anlaşılır hata', await until(()=>/alınmış/.test(msg(d))));
  d.getElementById('spAd').value = '  Gezgin   Murat '; submit(d,w,'spProfilForm');
  ok('profil açıldı', await until(()=>/Hoş geldin/.test(msg(d))));
  const pr = srv.profiles[ses.user.id];
  ok('sunucuya giden profil: ad temiz, konum şehir+gün', pr.takma_ad==='Gezgin Murat' && pr.sehir_id==='istanbul' && pr.ulke==='tr' && pr.gun===1 && !('coord' in pr) && !('lat' in pr));
  ok('künye + menü adı', /Gezgin Murat/.test(d.querySelector('#spKunye .kn-name').textContent) && d.querySelector('#profilBtn small').textContent==='Gezgin Murat');

  /* elle durum → şehir bağı kalkar */
  d.getElementById('spDurum').value = 'Bugün sadece kahve'; d.getElementById('spDurum').dispatchEvent(new w.Event('input'));
  submit(d,w,'spProfilForm'); await until(()=>/Kaydedildi/.test(msg(d)));
  ok('elle durum: konum alanları boşaltılır', srv.profiles[ses.user.id].durum==='Bugün sadece kahve' && srv.profiles[ses.user.id].sehir_id===null);
  d.getElementById('spRota').click(); submit(d,w,'spProfilForm'); await until(()=>/Kaydedildi/.test(msg(d)));
  ok('"Rotamdan al" şehri geri bağlar', srv.profiles[ses.user.id].sehir_id==='istanbul');

  /* --- süresi dolmuş token → yenile ve tekrar dene --- */
  for(const t in srv.tokens) srv.tokens[t].exp = Date.now()-1;
  const before = srv.log.length;
  submit(d,w,'spProfilForm');
  ok('401 → yenile → başarılı', await until(()=>/Kaydedildi/.test(msg(d))) && srv.log.slice(before).some(x=>/token/.test(x)));
  ok('yeni token kaydedildi', JSON.parse(w.localStorage.getItem('patika:oturum')).access_token!==ses.access_token);
  ok('1. oturumda JS hatası yok', A.errs.length===0, A.errs.join(' | '));
  const saved = { 'patika:oturum': w.localStorage.getItem('patika:oturum') };
  w.close();

  /* --- yenileme: oturum ve profil geri gelir --- */
  const B = open(true, saved); await wait(400);
  ok('yenileme: menüde takma ad (panel açılmadan)', await until(()=>B.d.querySelector('#profilBtn small').textContent==='Gezgin Murat'), B.d.querySelector('#profilBtn small').textContent);
  B.d.getElementById('profilBtn').click();
  ok('yenileme: profil sunucudan yüklendi', await until(()=>B.d.getElementById('spCikis') && /Gezgin Murat/.test(B.d.querySelector('#spKunye .kn-name').textContent)));

  /* XSS: sunucudan gelen veri kaçışlanır */
  srv.profiles[JSON.parse(saved['patika:oturum']).user.id].durum = '<img src=x onerror="window.__x=1">';
  B.w.eval('sosyal.profilYuklendi=false'); B.d.querySelector('[data-close=profilModal]').click(); B.d.getElementById('profilBtn').click();
  await until(()=>B.d.querySelector('#spKunye .kn-durum') && /<img/.test(B.d.querySelector('#spKunye .kn-durum').textContent));
  ok('XSS: profil verisi zararsız', !B.d.querySelector('#spKunye img') && !B.w.__x);
  ok('künye: seri no kullanıcıya özel ve sabit', /^PT·\d{4}·\d{4}$/.test(B.d.querySelector('.kn-no').textContent) && B.w.kunyeSeri('u1')===B.w.kunyeSeri('u1') && B.w.kunyeSeri('u1')!==B.w.kunyeSeri('u2'));

  /* --- çıkış --- */
  B.d.getElementById('spCikis').click();
  ok('çıkış: oturum silindi, giriş ekranı', await until(()=>B.d.getElementById('spMail')) && !B.w.localStorage.getItem('patika:oturum'));
  ok('çıkışta sunucuya logout gitti', srv.log.includes('POST /auth/v1/logout'));

  /* --- tekrar giriş + hesap silme --- */
  delete srv.otp['murat@ornek.com'];
  B.d.getElementById('spMail').value = 'murat@ornek.com'; submit(B.d,B.w,'spMailForm'); await until(()=>B.d.getElementById('spKod'));
  B.d.getElementById('spKod').value = '123456'; submit(B.d,B.w,'spKodForm');
  ok('tekrar giriş: mevcut profil geldi', await until(()=>B.d.getElementById('spCikis') && /Gezgin Murat/.test(B.d.querySelector('#spKunye .kn-name').textContent)));
  B.d.getElementById('spSil').click(); await wait(20);
  ok('silme onay ister', !!B.d.getElementById('spSilEvet') && Object.keys(srv.users).length===1);
  B.d.getElementById('spSilHayir').click(); await wait(20);
  ok('vazgeç: hiçbir şey silinmez', !B.d.getElementById('spSilEvet') && Object.keys(srv.users).length===1);
  B.d.getElementById('spSil').click(); await wait(20); B.d.getElementById('spSilEvet').click();
  ok('hesap silindi: sunucuda kullanıcı ve profil yok', await until(()=>Object.keys(srv.users).length===0) && !srv.profiles[JSON.parse(saved['patika:oturum']).user.id]);
  ok('silme sonrası: oturum yok, giriş ekranı', await until(()=>B.d.getElementById('spMail')) && !B.w.localStorage.getItem('patika:oturum') && /Takma adla katıl/.test(B.d.querySelector('#profilBtn small').textContent));

  /* --- geçersiz yenileme token'ı: oturum temizlenir --- */
  const C = open(true, { 'patika:oturum': JSON.stringify({ access_token:'yok', refresh_token:'yok', expires_at:1, user:{id:'u0',email:'x@y.z'} }) }); await wait(400);
  C.d.getElementById('profilBtn').click(); await wait(200);
  ok('bozuk oturum: sessizce temizlenir', !C.w.localStorage.getItem('patika:oturum') || C.d.getElementById('spMail'));
  ok('2.–3. oturumda JS hatası yok', B.errs.length===0 && C.errs.length===0, B.errs.concat(C.errs).join(' | '));
  }catch(e){ ok('TEST İSTİSNASI', false, e.stack); }
  console.log(fails? `\n${fails} BAŞARISIZ` : '\nTÜMÜ GEÇTİ');
  process.exit(fails?1:0);
})();
