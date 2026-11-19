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
