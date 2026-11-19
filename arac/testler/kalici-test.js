// Yayın ortamı testi: window.storage YOK (GitHub Pages gibi).
// Kişisel veriler localStorage'da kalıcı mı, paylaşımlı özellikler dürüst "yakında" durumunda mı?
// Kullanım: node kalici-test.js <html>
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync(process.argv[2],'utf8');
const wait = ms=>new Promise(r=>setTimeout(r,ms));
let fails=0; const ok=(name,c,extra='')=>{ if(!c) fails++; console.log((c?'✓ ':'✗ ')+name+(extra?' — '+extra:'')); };

function open(seed){
  const errs=[];
  const dom = new JSDOM(html, { url:'https://muratsahinn.github.io/Patika/', runScripts:'dangerously', pretendToBeVisual:true, beforeParse(w){
    if(seed) for(const [k,v] of Object.entries(seed)) w.localStorage.setItem(k,v); /* "yenileme": önceki oturumun verisi */
    w.fetch = async u => String(u).includes('open-meteo') ? {ok:true, json:async()=>({current:{temperature_2m:21,weather_code:2}})} : {ok:false};
    w.speechSynthesis = { speaking:false, cancel(){}, speak(){}, getVoices(){ return []; } };
    w.SpeechSynthesisUtterance = function(t){ this.text=t; };
    w.prompt = ()=>{ errs.push('prompt açıldı'); return null; };
  }});
  dom.window.addEventListener('error', e=>errs.push(e.message));
  return { dom, w:dom.window, d:dom.window.document, errs };
}
const dump = w => { const o={}; for(let i=0;i<w.localStorage.length;i++){ const k=w.localStorage.key(i); o[k]=w.localStorage.getItem(k); } return o; };

(async ()=>{
  try{
  // --- 1. oturum ---
  let A = open(); await wait(450);
  ok('window.storage yerel yedeğe düştü', A.w.storage && A.w.storage.__yerel===true && A.w.eval('SHARED_ON')===false);
  A.d.querySelector('.country-card[data-country="tr"]').click(); await wait(400);
  const city = A.w.eval('activeCityId');
  A.d.querySelector('#dayPanel .station .node').click(); await wait(250);
  A.w.eval("tripPlan=[{country:'tr',id:'istanbul'},{country:'it',id:'roma'}]; saveTrip()"); await wait(80);
  const st0 = A.w.getEdit(A.w.eval('COUNTRY_CITIES').tr.find(c=>c.id==='istanbul'));
  st0.skip['2-1'] = true; await A.w.saveEditForCity('istanbul');
  A.d.getElementById('menuBtn').click(); await wait(20); A.d.getElementById('themeToggle').click(); await wait(120);
  const theme1 = A.d.body.dataset.theme;
  const saved = dump(A.w);
  ok('veriler localStorage\'a yazıldı', Object.keys(saved).length>=4, Object.keys(saved).join(', '));

  // paylaşımlı özellikler
  const cn = A.d.getElementById('communityNotes');
  ok('gezgin notları: "yakında"', !!cn && /yakında/.test(cn.textContent) && !cn.querySelector('.c-vote'));
  ok('not paylaş düğmesi yok', A.d.querySelectorAll('.note-share').length===0);
  ok('istek yokken ad sorulmadı', !A.errs.includes('prompt açıldı'));
  ok('1. oturumda JS hatası yok', A.errs.length===0, A.errs.join(' | '));
  A.w.close();

  // --- 2. oturum: sayfa yenilendi ---
  const B = open(saved); await wait(500);
  ok('yenileme: gezi planı kaldı', JSON.stringify(B.w.eval('tripPlan').map(e=>e.id))==='["istanbul","roma"]');
  ok('yenileme: çıkarılan durak kaldı', B.w.getEdit(B.w.eval('COUNTRY_CITIES').tr.find(c=>c.id==='istanbul')).skip['2-1']===true);
  ok('yenileme: tema kaldı', B.d.body.dataset.theme===theme1 && theme1==='dark', theme1);
  if(!B.d.getElementById('appScreen').classList.contains('visible')){ B.d.querySelector('.country-card[data-country="tr"]').click(); await wait(400); }
  ok('yenileme: son şehir açıldı', B.w.eval('activeCityId')===city, B.w.eval('activeCityId'));
  ok('yenileme: tamamlanan durak kaldı', B.d.querySelector('#dayPanel .station').classList.contains('done'));

  // bütçe paneli
  await B.w.openBudget(B.w.eval('COUNTRY_CITIES').tr.find(c=>c.id===city)); await wait(150);
  ok('bütçe: paylaş düğmesi gizli', B.d.getElementById('bdShareBtn').hidden===true);
  ok('bütçe: gezgin bütçeleri "yakında"', /yakında/.test(B.d.getElementById('cbList').textContent));
  ok('2. oturumda JS hatası yok', B.errs.length===0, B.errs.join(' | '));
  }catch(e){ ok('TEST İSTİSNASI', false, e.stack); }
  console.log(fails? `\n${fails} BAŞARISIZ` : '\nTÜMÜ GEÇTİ');
  process.exit(fails?1:0);
})();
