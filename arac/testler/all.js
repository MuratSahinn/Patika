const __x0 = async (d)=>{
  const {w,wait,ok}=global.__ctx;
  // güneş
  const t = w.sunTimes(new Date('2026-11-19T09:00:00Z'), 41.0086, 28.9802);
  const f = x=> x.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Istanbul'});
  ok('güneş hesabı İstanbul 19 Kasım', /^07:5[5-9]$/.test(f(t.rise)) && /^17:4[0-9]$/.test(f(t.set)), f(t.rise)+' / '+f(t.set));
  const r = w.sunTimes(new Date('2026-06-21T09:00:00Z'), 41.9, 12.49); 
  ok('güneş hesabı Roma 21 Haziran', /05:3\d/.test(r.rise.toLocaleTimeString('tr-TR',{timeZone:'Europe/Rome'})) && /20:4\d/.test(r.set.toLocaleTimeString('tr-TR',{timeZone:'Europe/Rome'})), r.rise.toLocaleTimeString('tr-TR',{timeZone:'Europe/Rome'})+' / '+r.set.toLocaleTimeString('tr-TR',{timeZone:'Europe/Rome'}));
  ok('kapakta güneş çipi', !!d.querySelector('.sun-chip'), d.querySelector('.sun-chip') && d.querySelector('.sun-chip').textContent.trim());
  ok('küratör notu', !!d.querySelector('.curator p'), d.querySelector('.curator p') && d.querySelector('.curator p').textContent.slice(0,90));
  // sesli rehber: gün
  w.__spoken=[];
  d.getElementById('dpMoreBtn').click(); d.getElementById('listenBtn').click(); await wait(900);
  const bar=d.getElementById('guideBar');
  ok('rehber çubuğu açıldı', bar && bar.classList.contains('show'), d.getElementById('gbSub').textContent+' | '+d.getElementById('gbTitle').textContent);
  ok('konuşma başladı + metin temiz', w.__spoken.length>=1 && !w.__spoken.join(' ').match(/\p{Extended_Pictographic}/u), w.__spoken.slice(0,3).join(' ¦ ').slice(0,160));
  ok('çalan durak vurgulanıyor', !!d.querySelector('.station.speaking'), d.querySelector('.station.speaking') && d.querySelector('.station.speaking').dataset.key);
  d.getElementById('gbPlay').click(); await wait(30);
  const n1=w.__spoken.length; await wait(80);
  ok('duraklat', w.__spoken.length===n1 && d.getElementById('gbPlay').getAttribute('aria-label')==='Devam et');
  d.getElementById('gbPlay').click(); await wait(60);
  ok('devam et', w.__spoken.length>n1);
  d.getElementById('gbClose').click(); await wait(20);
  ok('kapat', !bar.classList.contains('show') && !d.querySelector('.station.speaking'));
  // tek durak dinle
  w.__spoken=[]; d.querySelectorAll('.listen-stop')[1].click(); await wait(200);
  ok('tek durak dinle', w.__spoken.length>0 && w.__spoken[0].includes(d.querySelectorAll('.station')[1].querySelector('.st-name').textContent.split(' ')[0]), w.__spoken[0]);
  // yoldayım dinle
  w.__spoken=[]; d.getElementById('journeyBtn').click(); await wait(60); d.getElementById('jListenBtn').click(); await wait(150);
  ok('yoldayım dinle', w.__spoken.length>0); d.getElementById('jClose').click(); 
  // ışık ipucu: sahte saat → gün batımından 1 saat önce, gün batımı duraklı şehir (Kaş antik tiyatro)
  const real=Date.now; const kas = w.COUNTRY_CITIES ? null : null;
};

const __x1 = async (d)=>{
  const {w,wait,ok}=global.__ctx;
  d.getElementById('backGlobe').click(); d.querySelector('.country-card[data-country="tr"]').click(); await wait(300);
  const open = async id=>{ [...d.querySelectorAll('.city-row')].find(r=>r.dataset.city===id).click(); await wait(300); };
  const realNow = w.Date.now;
  await open('kas');
  const kas = w.cityList().find(c=>c.id==='kas');
  const t = w.citySun(kas);
  w.Date.now = ()=> t.set.getTime() - 60*60e3;
  d.querySelectorAll('.day-tab')[0].click(); await wait(250);
  const h = d.querySelector('.light-hint');
  ok('gün batımı ipucu (Kaş, 1 saat kala)', !!h && /gün batımı/.test(h.textContent) && /tiyatro/i.test(h.textContent), h && h.textContent.trim());
  w.Date.now = ()=> t.set.getTime() - 6*3600e3;
  d.querySelectorAll('.day-tab')[0].click(); await wait(250);
  ok('erken saatte ipucu yok', !d.querySelector('.light-hint:not(.dawn)'));
  await open('adiyaman');
  const ad = w.cityList().find(c=>c.id==='adiyaman'); const t2 = w.citySun(ad);
  w.Date.now = ()=> t2.rise.getTime() - 5*3600e3;
  d.querySelectorAll('.day-tab')[0].click(); await wait(250);
  const h2 = d.querySelector('.light-hint.dawn');
  ok('şafak ipucu (Nemrut)', !!h2, h2 && h2.textContent.trim());
  w.Date.now = realNow;
  ok('Kaş mesafe satırı emojisiz', ![...d.querySelectorAll('.walk-seg')].some(e=>/\p{Extended_Pictographic}/u.test(e.textContent)));
};

const __x2 = async (d)=>{
  const {w,wait,ok}=global.__ctx;
  d.getElementById('backGlobe').click(); d.querySelector('.country-card[data-country="tr"]').click(); await wait(300);
  ok('kaldığın yer hafızası (son açılan şehir)', d.querySelector('.city-hero h2').textContent.length>0, d.querySelector('.city-hero h2').textContent);
  [...d.querySelectorAll('.city-row')].find(r=>r.dataset.city==='istanbul').click(); await wait(300);
  d.querySelectorAll('.day-tab')[0].click(); await wait(200);
  d.getElementById('journeyBtn').click(); await wait(200);
  ok('yoldayım sahnesi + noktalar', !!d.querySelector('#jScene .cover-svg') && d.querySelectorAll('#jDots span').length>=4);
  ok('büyük mesafe göstergesi', /m|km/.test(d.getElementById('jBig').textContent), d.getElementById('jBig').textContent);
  w.approachCheck(w.nextStop(w.journeyCity || w.cityList()[0]), 150); await wait(20);
  ok('yaklaşma bildirimi (150 m)', d.getElementById('jToast').classList.contains('show') && /150 m/.test(d.getElementById('jToast').textContent), d.getElementById('jToast').textContent.trim());
  w.approachCheck(w.nextStop(w.journeyCity || w.cityList()[0]), 40); await wait(20);
  ok('vardın bildirimi (40 m) + nabız', /vardın/.test(d.getElementById('jToast').textContent) && d.getElementById('jDoneBtn').classList.contains('pulse'));
  // tüm günü bitir → bitiş ekranı + özet butonu
  for(let i=0;i<6;i++){ if(d.getElementById('jDoneBtn').style.display==='none') break; d.getElementById('jDoneBtn').click(); await wait(320); }
  ok('gün bitti ekranı', d.getElementById('journey').classList.contains('j-finished') && !!d.getElementById('jRecap'));
  d.getElementById('jRecap').click(); await wait(1100);
  ok('özet kartı penceresi', d.getElementById('recapModal').classList.contains('open'));
  d.querySelector('[data-close=recapModal]').click(); d.getElementById('jClose').click(); await wait(100);
  ok('gün tamamlandı bandı + kart düğmesi', d.getElementById('dayComplete').classList.contains('show') && !!d.getElementById('recapBtn'));
  d.getElementById('menuBtn').click(); d.getElementById('journalBtn').click(); await wait(400);
  const jp = d.getElementById('jrPage');
  ok('gezi defteri açıldı', d.getElementById('journal').classList.contains('open') && /Gezi Defterim/.test(jp.textContent));
  ok('defterde İstanbul bölümü + durak', /İstanbul/.test(jp.textContent) && d.querySelectorAll('.jr-stop').length>=5, d.querySelectorAll('.jr-stop').length+' durak');
  ok('defterde not', /test notu/.test(jp.textContent));
  d.getElementById('jrPrint').click(); await wait(50);
  ok('PDF yazdırma tetiklendi', w.__printed===true);
  d.getElementById('jrClose').click();
};

const __x3 = async (d)=>{
  const {w,wait,ok,sh}=global.__ctx;
  d.getElementById('backGlobe').click(); d.querySelector('.country-card[data-country="tr"]').click(); await wait(300);
  const now=Date.now();
  sh['cnotes:istanbul']=JSON.stringify([
    {u:'Ayşe', k:'1-1', n:'Ayasofya için sabah 8 kuyruğu kısa.', ts:now-86400000*3},
    {u:'<img src=x onerror="window.__xss=1">', k:'1-2', n:'<script>window.__xss=2</script>kötü', ts:now-86400000},
    {u:'Murat', k:'1-0', n:'test notu', ts:now}
  ]);
  sh['cbudget:istanbul']=JSON.stringify([{u:'<b onmouseover=x>Z</b>', t:900, c:'<i>₺</i>', ts:now}]);
  [...d.querySelectorAll('.city-row')].find(r=>r.dataset.city==='ankara').click(); await wait(250);
  [...d.querySelectorAll('.city-row')].find(r=>r.dataset.city==='istanbul').click(); await wait(400);
  const cn=d.getElementById('communityNotes');
  ok('XSS: kullanıcı adı/not zararsız', !cn.querySelector('img') && !cn.querySelector('script') && !w.__xss && cn.textContent.includes('<img src=x'), 'img:'+!!cn.querySelector('img'));
  const first=()=>cn.querySelector('.c-note .c-head b').textContent;
  ok('oy yokken en yeni üstte', first()==='Murat', first());
  [...cn.querySelectorAll('.c-vote')].find(b=>b.dataset.id==='Ayşe|1-1').click(); await wait(300);
  ok('oy → Ayşe en üstte + En faydalı', first()==='Ayşe' && !!cn.querySelector('.c-top .c-best'), first());
  ok('oy kaydı paylaşımlı', JSON.parse(sh['cvotes:istanbul'])['Ayşe|1-1'].includes('Murat'));
  [...cn.querySelectorAll('.c-vote')].find(b=>b.dataset.id==='Ayşe|1-1').click(); await wait(300);
  ok('oy geri alınır', JSON.parse(sh['cvotes:istanbul'])['Ayşe|1-1'].length===0 && first()==='Murat');
  d.getElementById('dpMoreBtn').click(); d.getElementById('budgetBtn').click(); await wait(300);
  const cb=d.getElementById('cbList');
  ok('XSS: bütçe adı/para birimi zararsız', !cb.querySelector('b b') && !cb.querySelector('i') && cb.textContent.includes('<i>₺</i>'));
  d.querySelector('[data-close=budgetModal]').click();
  d.querySelector('.station .info-toggle').click(); await wait(200);
  ok('pratik bilgiler kutusu', !!d.querySelector('.insider-panel.open .prac .pr-i') && /Ayır/.test(d.querySelector('.insider-panel.open .prac').textContent));
  ok('güncelleme notu', /Kasım 2026/.test(d.querySelector('.insider-panel.open .ins-foot').textContent));
};

global.__extra = async (d)=>{ for(const f of [__x0,__x1,__x2,__x3]){ try{ await f(d); }catch(e){ console.log("✗ TEST İSTİSNASI", e.message); } } };

// Patika regresyon testi — kullanım: node reg.js <html>
const { JSDOM } = require('jsdom');
const html = require('fs').readFileSync(process.argv[2],'utf8');
[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].forEach(b=>new Function(b[1]));
const per={}, sh={};
const dom = new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true, beforeParse(w){
  w.storage = { get: async(k,s)=>{ const st=s?sh:per; if(st[k]===undefined) throw 0; return {value:st[k]}; }, set: async(k,v,s)=>{ (s?sh:per)[k]=v; return {value:v}; } };
  w.fetch = async (u)=> String(u).includes('open-meteo') ? {ok:true, json:async()=>({current:{temperature_2m:21,weather_code:2}})} : {ok:false};
  w.prompt = ()=>'Murat';
  Object.defineProperty(w.navigator,'geolocation',{value:{ getCurrentPosition:(ok)=>setTimeout(()=>ok({coords:{latitude:41.0057,longitude:28.977}}),20),
    watchPosition:(ok)=>{ setTimeout(()=>ok({coords:{latitude:41.0057,longitude:28.977}}),20); return 1; }, clearWatch:()=>{} }, configurable:true});
  w.speechSynthesis = { speaking:false, cancel(){ this.speaking=false; }, speak(u){ this.speaking=true; w.__spoken=(w.__spoken||[]).concat(u.text); setTimeout(()=>{ this.speaking=false; u.onend&&u.onend(); },3); }, getVoices(){ return [{lang:'tr-TR',name:'TR'}]; } };
  w.SpeechSynthesisUtterance = function(t){ this.text=t; };
  w.print = ()=>{ w.__printed=true; };
}});
const w = dom.window;
let errs=[]; w.addEventListener('error', e=>errs.push(e.message));
const wait = ms=>new Promise(r=>setTimeout(r,ms));
let fails=0; const ok=(name,c,extra='')=>{ if(!c) fails++; console.log((c?'✓ ':'✗ ')+name+(extra?' — '+extra:'')); };
global.__ctx={w,per,sh,wait,ok};
setTimeout(async ()=>{
  const d=w.document;
  for(const cc of ['tr','it','gr']){
    if(d.getElementById('appScreen').classList.contains('visible')) d.getElementById('backGlobe').click();
    d.querySelector('.country-card[data-country="'+cc+'"]').click(); await wait(320);
    ok(cc+' açıldı + tema', d.body.dataset.country===cc && !!d.querySelector('.city-hero h2'));
    const n=d.querySelectorAll('.city-row').length, pend=d.querySelectorAll('.city-row.pending').length;
    ok(cc+' şehir listesi', n>0 && pend===0, n+' şehir');
  }
  d.getElementById('backGlobe').click(); d.querySelector('.country-card[data-country="tr"]').click(); await wait(320);
  const nodes=d.querySelectorAll('.station .node'); nodes[0].click(); await wait(80);
  ok('durak tiki', !!d.querySelector('.station.done'));
  ok('harita linki koordinatlı', /query=41\.0115/.test(d.querySelector('.map-link').href));
  d.querySelector('.info-toggle').click(); await wait(220);
  ok('hap bilgi açılır', d.querySelector('.insider-panel').classList.contains('open'));
  d.getElementById('journeyBtn').click(); await wait(150);
  ok('yoldayım + GPS mesafesi', d.getElementById('journey').classList.contains('open') && /\d/.test((d.getElementById('jBig')||d.getElementById('jDist')).textContent));
  d.getElementById('jClose').click();
  d.getElementById('dpMoreBtn').click();
  d.getElementById('packBtn').click(); await wait(80); ok('bavul', d.getElementById('packModal').classList.contains('open')); d.querySelector('[data-close=packModal]').click();
  d.getElementById('budgetBtn').click(); await wait(80); ok('bütçe', d.getElementById('budgetModal').classList.contains('open')); d.querySelector('[data-close=budgetModal]').click();
  d.getElementById('editBtn').click(); await wait(120); ok('düzenleme modu', !!d.querySelector('.day-panel.editing')); d.getElementById('editBtn').click(); await wait(120);
  d.getElementById('shareBtn').click(); await wait(80); ok('rota kartı', d.getElementById('shareModal').classList.contains('open')); d.querySelector('[data-close=shareModal]').click();
  for(const [id,m] of [['passportBtn','passportModal'],['tripBtn','tripModal'],['statsBtn','statsModal']]){
    d.getElementById('menuBtn').click(); await wait(10); d.getElementById(id).click(); await wait(120);
    ok('menü → '+m, d.getElementById(m).classList.contains('open')); d.querySelector('[data-close='+m+']').click();
  }
  const st=d.querySelector('.station'); st.querySelector('.note-toggle').click();
  const ta=st.querySelector('.note-area'); ta.value='test notu'; ta.dispatchEvent(new w.Event('input',{bubbles:true})); await wait(500);
  st.querySelector('.note-share').click(); await wait(200);
  ok('topluluk notu', (sh['cnotes:istanbul']||'').includes('test notu') && d.getElementById('communityNotes').textContent.includes('Murat'));
  d.getElementById('menuBtn').click(); d.getElementById('themeToggle').click(); await wait(30);
  ok('gece modu', d.body.dataset.theme==='dark');
  if(global.__extra) await global.__extra(d);
  ok('JS HATASI YOK', errs.length===0, errs.join(' | '));
  console.log(fails? `\n${fails} BAŞARISIZ` : '\nTÜMÜ GEÇTİ');
}, 400);
