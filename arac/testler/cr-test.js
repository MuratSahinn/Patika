global.__extra = async (d)=>{
  const {w,wait,ok}=global.__ctx;
  const B = w.eval('BUTCE'); const ids=Object.keys(B); let bad=[], curCC=null;
  const findRow=async id=>{ for(const cc of ['tr','it','gr']){ if(cc!==curCC){ d.getElementById('backGlobe').click(); d.querySelector('.country-card[data-country="'+cc+'"]').click(); await wait(300); curCC=cc; } const r=[...d.querySelectorAll('.city-row')].find(r=>r.dataset.city===id); if(r) return r; } return null; };
  for(const id of ids){
    const row=await findRow(id); if(!row){ bad.push(id+': yok'); continue; }
    row.click(); await wait(280);
    const sec=d.getElementById('cebinRahat'); if(!sec){ bad.push(id+': bölüm yok'); continue; }
    const b=B[id];
    if(/undefined|NaN|\[object/.test(sec.textContent)) bad.push(id+': bozuk metin');
    if(sec.querySelectorAll('.cr-row').length!==b.spend.length) bad.push(id+': kalem');
    if(sec.querySelectorAll('.cr-tip').length!==b.tips.length) bad.push(id+': tüyo');
    if(sec.querySelectorAll('.cr-src li').length!==b.sources.length) bad.push(id+': kaynak');
    if(sec.querySelector('.cr-amt').textContent!==b.tiers[1].v) bad.push(id+': varsayılan seviye');
    sec.querySelectorAll('.cr-tiers button')[2].click(); await wait(30);
    if(sec.querySelector('.cr-amt').textContent!==b.tiers[2].v || !sec.querySelectorAll('.cr-tiers button')[2].classList.contains('on')) bad.push(id+': seviye değişmedi');
    sec.querySelectorAll('.cr-tiers button')[1].click(); await wait(20);
    if(!/kaça gezersin/.test(sec.querySelector('.cr-h').textContent) || /\(/.test(sec.querySelector('.cr-h').textContent)) bad.push(id+': başlık '+sec.querySelector('.cr-h').textContent);
    if(!d.getElementById('heroCr')) bad.push(id+': hero çipi');
  }
  ok('Cebin rahat · tüm pilot şehirler', bad.length===0, ids.length+' şehir'+(bad.length?' | '+bad.join(' ; '):''));
  /* defter butonu modalı açar */
  d.getElementById('crBook').click(); await wait(80);
  ok('Cebin rahat → Bütçe Defteri', d.getElementById('budgetModal').classList.contains('open'));
  d.querySelector('[data-close="budgetModal"]').click(); await wait(30);
  /* bütçesi olmayan şehirde bölüm yok */
  const r2=[...d.querySelectorAll('.city-row')][3]; const keepB=w.eval('BUTCE')[r2.dataset.city]; w.eval(`delete BUTCE['${r2.dataset.city}']`); r2.click(); await wait(260);
  ok('bütçesiz şehirde bölüm yok', !d.getElementById('cebinRahat') && !d.getElementById('heroCr'));
  w.BUTCE_TMP = keepB; w.eval(`BUTCE['${r2.dataset.city}'] = window.BUTCE_TMP`);
  ok('her şehrin bütçesi var', [...Object.values(w.eval('COUNTRY_CITIES'))].flat().filter(c=>c.days).every(c=>w.eval('BUTCE')[c.id]));
  /* patika modundan hero çipi şehir rotasına döner */
  d.getElementById('backGlobe').click(); d.querySelector('.country-card[data-country="tr"]').click(); await wait(300);
  [...d.querySelectorAll('.city-row')].find(r=>r.dataset.city==='kapadokya').click(); await wait(280);
  const sw=d.querySelector('.mode-switch [data-mode="patika"]'); if(sw){ sw.click(); await wait(60); }
  d.getElementById('heroCr').click(); await wait(60);
  /* yerli/turist: İstanbul'da varsayılan T.C. vatandaşı */
  d.getElementById('backGlobe').click(); d.querySelector('.country-card[data-country="tr"]').click(); await wait(300);
  [...d.querySelectorAll('.city-row')].find(r=>r.dataset.city==='istanbul').click(); await wait(280);
  const topP = ()=> d.querySelector('#crSpend .cr-row .cr-p').textContent;
  ok('İstanbul varsayılan yerli fiyat', /500 TL/.test(topP()) && d.querySelector('.cr-seg button.on').dataset.p==='1', topP());
  d.querySelector('.cr-seg button[data-p="0"]').click(); await wait(40);
  ok('turiste geçince yabancı fiyat + yerli karşılaştırma', /2\.750 TL/.test(topP()) && /Yerli:\s*500 TL/.test(d.querySelector('#crSpend .cr-alt').textContent), topP()+' / '+(d.querySelector('#crSpend .cr-alt')||{}).textContent);
  d.querySelector('.cr-seg button[data-p="1"]').click(); await wait(40);
  ok('resmi/tahmini etiketleri', d.querySelectorAll('#crSpend .cr-tag.r').length>0 && d.querySelectorAll('#crSpend .cr-tag.e').length>0);
  ok('taze veride eski uyarısı yok', !d.querySelector('.cr-stale'));
  /* eski veri → uyarı */
  w.eval("BUTCE.istanbul = Object.assign({}, BUTCE.istanbul, {checked:'2026-01-01'})");
  w.eval("rerenderCebinRahat(COUNTRY_CITIES.tr.find(c=>c.id==='istanbul'))"); await wait(30);
  ok('60 günü geçince eski uyarısı', !!d.querySelector('.cr-stale') && d.getElementById('cebinRahat').classList.contains('stale'));
  /* uzaktan veri: daha yeni olan kazanır, bozuk olan reddedilir */
  const ch = w.eval(`crMerge({cities:{ istanbul:Object.assign({}, BUTCE.istanbul, {checked:'2027-01-05', intro:'YENİ'}), roma:{checked:'2099-01-01'} }})`);
  ok('uzak fiyat birleştirme', ch.length===1 && ch[0]==='istanbul' && w.eval('BUTCE.istanbul.intro')==='YENİ' && w.eval('BUTCE.roma.checked')!=='2099-01-01');
  /* XSS: uzak veride html kaçışlanır */
  w.eval(`BUTCE.istanbul.tips=[{h:'<img src=x onerror=alert(1)>',t:'x'}]`); w.eval("rerenderCebinRahat(COUNTRY_CITIES.tr.find(c=>c.id==='istanbul'))"); await wait(20);
  ok('uzak veri kaçışlanıyor', !d.querySelector('#cebinRahat img'));
  /* kart durumları */
  const st = w.eval(`(()=>{ const c=COUNTRY_CITIES.tr.find(x=>x.id==='istanbul'), d=c.days[0], keep=JSON.stringify(doneCache[c.id]||{}), e=getEdit(c), ks=JSON.stringify(e.skip||{}), r=[];
    doneCache[c.id]={}; e.skip={}; r.push(dayAchievement(c,d).state);
    doneCache[c.id]['1-0']=true; r.push(dayAchievement(c,d).state);
    orderedStops(c,d).forEach(o=>doneCache[c.id][o.key]=true); r.push(dayAchievement(c,d).state);
    e.skip['1-1']=true; delete doneCache[c.id]['1-1']; r.push(dayAchievement(c,d).state);
    doneCache[c.id]=JSON.parse(keep); e.skip=JSON.parse(ks); return r.join(','); })()`);
  ok('kart durumları: plan → yolda → kusursuz → kendi rotan', st==='plan,progress,perfect,own', st);
  ok('patika modunda da bütçe görünür', !!d.getElementById('cebinRahat') && !d.getElementById('patikaView').hidden && d.getElementById('cebinRahat').offsetParent!==undefined);
};
global.__extra2 = true;
require('./reg.js');
