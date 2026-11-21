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
  if(path.split('?')[0]==='/auth/v1/otp'){ srv.lastOtpUrl = path; if(!/@/.test(body.email)) return res(400,{msg:'invalid email'}); if(srv.otp[body.email] && Date.now()-srv.otp[body.email].t<60e3) return res(429,{msg:'For security purposes, you can only request this once every 60 seconds'}); srv.otp[body.email]={code:'123456', t:Date.now()}; return res(200,{}); }
  if(path==='/auth/v1/verify'){ const r=srv.otp[body.email]; if(!r || r.code!==body.token) return res(403,{msg:'Token has expired or is invalid', error_code:'otp_expired'});
    let uid = Object.keys(srv.users).find(k=>srv.users[k].email===body.email); if(!uid){ uid='u'+(++srv.n); srv.users[uid]={email:body.email}; } delete srv.otp[body.email]; return res(200, issue(uid)); }
  if(path.startsWith('/auth/v1/token?grant_type=refresh_token')){ const uid=srv.refresh[body.refresh_token]; if(!uid) return res(400,{msg:'Invalid Refresh Token'}); delete srv.refresh[body.refresh_token]; return res(200, issue(uid)); }
  if(path==='/auth/v1/user'){ const uid=who(); if(!uid) return res(401,{msg:'invalid JWT'}); return res(200,{ id:uid, email:srv.users[uid].email }); }
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
function open(cfg, seed, hash){
  const errs=[];
  const dom = new JSDOM(html, { url:'https://muratsahinn.github.io/Patika/'+(hash||''), runScripts:'dangerously', pretendToBeVisual:true, beforeParse(w){
    w.localStorage.setItem('patika:sosyal', cfg ? JSON.stringify({ url:URL_, key:KEY }) : 'kapali');
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
  ok('matara kaldırıldı', !X.d.querySelector('.kn-skin, .kn-flask') && !/matara/i.test(X.d.getElementById('spKunye').textContent));
  X.d.getElementById('knFilm').click(); await wait(60);
  ok('künyeden yolculuk filmi açılır (varsayılan: uğur böceği belgeseli)', X.d.getElementById('filmModal').classList.contains('open') && X.d.querySelector('#filmStil [data-stil=belgesel]').getAttribute('aria-pressed')==='true' && X.d.getElementById('filmPets').hidden);
  ok('ünlü durak yokken örnek film + video kapalı + açıklama', X.d.getElementById('filmRec').disabled && /ünlü durakları/.test(X.d.getElementById('filmMsg').textContent) && X.w.filmDurum.veri.ornek && X.w.filmDurum.veri.n===3);
  X.d.querySelector('#filmStil [data-stil=harita]').click(); await wait(20);
  X.d.querySelector('#filmPets [data-pet=kaplumbaga]').click(); await wait(20);
  ok('haritada yol arkadaşı seçilir ve hatırlanır', !X.d.getElementById('filmPets').hidden && X.w.localStorage.getItem('patika:film-hayvan')==='kaplumbaga' && X.d.querySelector('#filmPets [data-pet=kaplumbaga]').getAttribute('aria-pressed')==='true');
  const V = X.w.filmVeriHazirla(); /* eski stil verisi (makro için korunuyor) */
  ok('film verisi: patika + durak noktaları', V.ornek.length>100 && V.duraklar.length>=3 && V.toplam>1000 && V.duraklar.every(d=>d.oran>0 && d.oran<1));
  ok('film verisi: aynı kullanıcı → aynı harita', JSON.stringify(X.w.filmVeriHazirla().duraklar.map(d=>[d.x,d.y]))===JSON.stringify(V.duraklar.map(d=>[d.x,d.y])));
  /* harita uçuşu: gerçek koordinatlar + zaman çizelgesi */
  ok('harita verisi gömülü (Natural Earth)', X.w.eval('FILM_HARITA.kara.length') > 50 && !!X.w.eval('FILM_HARITA.sinir.tr'));
  X.w.eval(`(()=>{ const c=COUNTRY_CITIES.tr.find(x=>x.id==='istanbul'); const o=doneCache.istanbul=doneCache.istanbul||{}; c.days[0].stops.forEach((s,i)=>o['1-'+i]=true);
    const r=COUNTRY_CITIES.it.find(x=>x.id==='roma'); const o2=doneCache.roma=doneCache.roma||{}; r.days[0].stops.forEach((s,i)=>o2['1-'+i]=true); })()`);
  const H = X.w.fhVeri();
  const ist = H.detay.find(s=>s.id==='istanbul');
  ok('harita: gerçek durak koordinatları (İstanbul)', !!ist && ist.duraklar.every(d=>d.x>28.8 && d.x<29.2) && ist.duraklar[0].ad===X.w.eval('COUNTRY_CITIES').tr.find(c=>c.id==='istanbul').days[0].stops[0].name);
  ok('harita: açılış → uçuş/şehir → dönüş → kapanış', H.seg[0].tip==='acilis' && H.seg.filter(s=>s.tip==='sehir').length===2 && H.seg[H.seg.length-1].tip==='kapanis' && H.sure>12 && H.sure<40);
  const K1 = X.w.fhKamera(H, H.seg.find(s=>s.tip==='sehir').t0+1), K0 = X.w.fhKamera(H, 0.5);
  ok('harita: şehirde kamera yakın ve eğik, açılışta uzak', K1.z > K0.z*50 && K1.p > K0.p);
  const U = H.seg.find(s=>s.tip==='ucus' && !s.ilk), KU = X.w.fhKamera(H, (U.t0+U.t1)/2);
  ok('harita: şehirler arası uçuşta kamera iki şehri gösterecek kadar uzaklaşır', KU.z < 200, KU.z|0);
  /* uğur böceği belgeseli (gerçek fotoğraflar) */
  const BV = X.w.fbVeri();
  const fotoAd = X.w.eval("Object.keys(FB_FOTO).filter(k=>/^(istanbul|roma)\\|/.test(k)).map(k=>k.split('|')[1])");
  const birinci = X.w.eval("[...COUNTRY_CITIES.tr.find(c=>c.id==='istanbul').days[0].stops, ...COUNTRY_CITIES.it.find(c=>c.id==='roma').days[0].stops].map(s=>s.name)").filter(n=>fotoAd.includes(n));
  ok('belgesel: sadece fotoğrafı olan tamamlanmış duraklar, rota sırasıyla', !BV.ornek && BV.n===birinci.length && BV.duraklar.every((d,i)=>birinci[i].startsWith(d.ad)), BV.duraklar.map(d=>d.ad).join(','));
  ok('belgesel: fotoğrafı olmayan durak filme girmez', !BV.duraklar.some(d=>/Hipodrom/.test(d.ad)));
  ok('belgesel: her fotoğrafın künyesi var (yazar + lisans)', X.w.eval("Object.values(FB_FOTO).every(f=>FB_KUNYE[f.f] && /^(CC0|CC BY [0-9.]+)$/.test(FB_KUNYE[f.f][1]))") && X.w.eval("['sap_ugur','ucus'].every(k=>FB_KUNYE[k])"));
  ok('belgesel: süre = açılış + durak başı 4,2 sn + kapanış; zamanlar sıralı', Math.abs(BV.sure - (BV.GIRIS + BV.n*BV.P + BV.CIKIS)) < 1e-6 && BV.duraklar.every((d,i)=>!i || d.t0>BV.duraklar[i-1].t0));
  X.w.eval(`(()=>{ for(const cc of ['tr','it','gr']) for(const c of COUNTRY_CITIES[cc]){ if(!c.days) continue; const o=doneCache[c.id]=doneCache[c.id]||{}; c.days.forEach(d=>d.stops.forEach((s,i)=>o[d.day+'-'+i]=true)); } })()`);
  const BT = X.w.fbVeri();
  ok('belgesel: en çok 10 durak, 10 durakta 45–51 sn', BT.n===10 && BT.sure>=45 && BT.sure<=51, BT.n+' / '+BT.sure.toFixed(1));
  ok('belgesel: görseller yüklenmeden çizim çökmez', (()=>{ try{ const c=X.d.createElement('canvas'); const g=c.getContext&&c.getContext('2d'); if(g) X.w.fbKare(g, BT, 10); return true; }catch(e){ return false; } })());
  X.d.querySelector('#filmStil [data-stil=belgesel]').click(); await wait(30);
  ok('stil seçimi: belgeselde yol arkadaşı gizli + hatırlanır', X.d.getElementById('filmPets').hidden && X.w.localStorage.getItem('patika:film-stil')==='belgesel');
  X.d.querySelector('#filmStil [data-stil=harita]').click(); await wait(30);
  ok('stil seçimi: haritada yol arkadaşı görünür', !X.d.getElementById('filmPets').hidden);
  X.d.querySelector('[data-close=filmModal]').click(); await wait(20);
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
  ok('kod ekranı (bağlantı ya da kod)', await until(()=>d.getElementById('spKod')) && /murat@ornek\.com/.test(d.getElementById('spBody').textContent) && /bağlantıya dokun/.test(d.getElementById('spBody').textContent));
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

  ok('kod isteğinde dönüş adresi gönderilir', /redirect_to=https%3A%2F%2Fmuratsahinn\.github\.io%2FPatika%2F/.test(srv.lastOtpUrl||''), srv.lastOtpUrl);
  /* --- e-postadaki bağlantıyla giriş --- */
  srv.users['u77'] = { email:'baglanti@ornek.com' }; srv.tokens['atL'] = { uid:'u77', exp:Date.now()+3600e3 }; srv.refresh['rtL']='u77';
  const L = open(true, null, '#access_token=atL&expires_in=3600&refresh_token=rtL&token_type=bearer&type=magiclink'); await wait(500);
  ok('bağlantıdan giriş: oturum + panel açık', await until(()=>L.d.getElementById('profilModal').classList.contains('open') && L.d.getElementById('spAd')) && JSON.parse(L.w.localStorage.getItem('patika:oturum')).user.email==='baglanti@ornek.com');
  ok('bağlantıdan giriş: adres çubuğundaki token temizlendi', !L.w.location.hash && /takma adını seç/.test(L.d.getElementById('spMsg').textContent));
  const E2 = open(true, null, '#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired'); await wait(500);
  ok('süresi geçmiş bağlantı: anlaşılır hata, oturum yok', await until(()=>/süresi geçmiş/.test((E2.d.getElementById('spMsg')||{}).textContent||'')) && !E2.w.localStorage.getItem('patika:oturum'));
  ok('bağlantı testlerinde JS hatası yok', L.errs.length===0 && E2.errs.length===0, L.errs.concat(E2.errs).join(' | '));
  /* --- geçersiz yenileme token'ı: oturum temizlenir --- */
  const C = open(true, { 'patika:oturum': JSON.stringify({ access_token:'yok', refresh_token:'yok', expires_at:1, user:{id:'u0',email:'x@y.z'} }) }); await wait(400);
  C.d.getElementById('profilBtn').click(); await wait(200);
  ok('bozuk oturum: sessizce temizlenir', !C.w.localStorage.getItem('patika:oturum') || C.d.getElementById('spMail'));
  ok('2.–3. oturumda JS hatası yok', B.errs.length===0 && C.errs.length===0, B.errs.concat(C.errs).join(' | '));
  }catch(e){ ok('TEST İSTİSNASI', false, e.stack); }
  console.log(fails? `\n${fails} BAŞARISIZ` : '\nTÜMÜ GEÇTİ');
  process.exit(fails?1:0);
})();
