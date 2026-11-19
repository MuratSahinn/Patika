const CR_IC = { ticket:'ticket', car:'car', boat:'boat', fork:'fork', bed:'bed', walk:'walk' };
const CR_STALE_DAYS = 60;
const CR_PROFILE = { tr:['Yabancı turist','T.C. vatandaşı'], it:['Turist gibi','Yerel gibi'], gr:['Turist gibi','Yerel gibi'] };
const CR_YLAB = { tr:'Yerli', it:'Yerel', gr:'Yerel' };
const CR_PLAB = { tr:'Yabancı', it:'Turist', gr:'Turist' };
let crTier = 1;
function crCountryOf(cid){ for(const [cc,list] of Object.entries(COUNTRY_CITIES)) if(list.some(c=>c.id===cid)) return cc; return activeCountry || 'tr'; }
const crProfMem = {};
function crProfile(cc){
  if(crProfMem[cc]!==undefined) return crProfMem[cc];
  try{ const v = localStorage.getItem('patika:crp:'+cc); if(v==='0'||v==='1') return +v; }catch(e){}
  return cc==='tr' ? 1 : 0;   /* Türkiye'de varsayılan T.C. vatandaşı, yurt dışında turist */
}
function crSetProfile(cc, v){ crProfMem[cc] = v; try{ localStorage.setItem('patika:crp:'+cc, String(v)); }catch(e){} }
function crAgeDays(iso){ const t = Date.parse(iso); return isNaN(t) ? 9999 : Math.floor((Date.now() - t)/86400000); }
function crDateTR(iso){ try{ return new Date(iso+'T12:00:00').toLocaleDateString('tr-TR', { day:'numeric', month:'long', year:'numeric' }); }catch(e){ return iso; } }
function crSafeUrl(u){ return /^https:\/\//.test(String(u||'')) ? escH(u) : '#'; }
function crRowHTML(s, prof, cc){
  const hasY = s.y != null && s.y !== '' && s.y !== s.p;
  const showY = hasY && prof===1;
  const main = showY ? s.y : s.p, mainL = showY ? s.yl : s.pl;
  const alt = hasY ? (showY ? [CR_PLAB[cc], s.p, s.pl] : [CR_YLAB[cc], s.y, s.yl]) : null;
  const tag = s.t==='r' ? `<span class="cr-tag r" title="Resmi tarife">${ic('check')}Resmi</span>` : `<span class="cr-tag e" title="Tahmini aralık">≈ Tahmini</span>`;
  return `<div class="cr-row ${showY?'is-y':''}"><span class="cr-ic">${ic(CR_IC[s.c]||'spark')}</span>
    <span class="cr-n">${escH(s.n)} ${tag}
      ${s.s?`<small>${escH(s.s)}</small>`:''}
      ${alt?`<span class="cr-alt"><b>${escH(alt[0])}:</b> ${escH(alt[1])}${alt[2]?` · ${escH(alt[2])}`:''}</span>`:''}
    </span>
    <span class="cr-p">${escH(main)}${mainL?`<small>${escH(mainL)}</small>`:''}</span></div>`;
}
function cebinRahatHTML(city){
  const B = BUTCE[city.id];
  if(!B) return '';
  const cc = crCountryOf(city.id), prof = crProfile(cc);
  const t = B.tiers[crTier] || B.tiers[1];
  const age = crAgeDays(B.checked), stale = age > CR_STALE_DAYS;
  const hasY = B.spend.some(s=>s.y!=null && s.y!=='');
  const nR = B.spend.filter(s=>s.t==='r').length, nE = B.spend.length - nR;
  const labs = CR_PROFILE[cc] || CR_PROFILE.it;
  return `<section class="cr ${stale?'stale':''}" id="cebinRahat" aria-label="Cebin rahat — bütçe">
    <div class="cr-top"><span class="cr-lab">${ic('wallet')}Cebin rahat</span>
      <span class="cr-upd ${stale?'old':''}">${ic(stale?'alert':'check')}Son kontrol · ${crDateTR(B.checked)}</span></div>
    <h3 class="cr-h">${escH(trEk(city.city.replace(/ \(.*\)$/,''),'acc'))} kaça gezersin?</h3>
    <p class="cr-intro">${escH(B.intro)}</p>
    ${stale ? `<div class="cr-stale">${ic('alert')}<span>Bu fiyatlar ${Math.floor(age/30)} aydan eski. Güncelleme yolda; gitmeden biletleri resmi siteden teyit et.</span></div>` : ''}
    ${hasY ? `<div class="cr-who" role="radiogroup" aria-label="Kim olarak gidiyorsun">
      <span class="cr-who-l">${cc==='tr' ? 'Kim olarak gidiyorsun?' : 'Nasıl gezeceksin?'}</span>
      <div class="cr-seg">${labs.map((l,i)=>`<button role="radio" data-p="${i}" class="${i===prof?'on':''}" aria-checked="${i===prof}">${l}</button>`).join('')}</div>
    </div>` : ''}
    <div class="cr-tiers" role="tablist" aria-label="Bütçe seviyesi">
      ${B.tiers.map((x,i)=>`<button role="tab" data-t="${i}" class="${i===crTier?'on':''}" aria-selected="${i===crTier}"><i class="cr-dots">${'<b></b>'.repeat(i+1)}</i>${escH(x.k)}</button>`).join('')}
    </div>
    <div class="cr-card" id="crCard">
      <div class="cr-amt">${escH(t.v)}</div>
      <div class="cr-per">${escH(B.tierNote)}</div>
      <p class="cr-inc">${escH(t.inc)}</p>
      ${hasY && prof===1 && B.tierNoteY ? `<p class="cr-yn">${ic('spark')}${escH(B.tierNoteY)}</p>` : ''}
    </div>
    ${B.spend.length ? `<div class="cr-k-row"><span class="cr-k">Paran nereye gider</span>
      <span class="cr-legend">${nR ? `<span class="cr-tag r">${ic('check')}Resmi</span> ${nR}` : ''} ${nE ? `<span class="cr-tag e">≈ Tahmini</span> ${nE}` : ''}</span></div>
    <div class="cr-spend" id="crSpend">${B.spend.map(s=>crRowHTML(s, prof, cc)).join('')}</div>` : ''}
    <span class="cr-k">Yerelin bildiği</span>
    <div class="cr-tips">
      ${B.tips.map(x=>`<div class="cr-tip"><span class="cr-tip-ic">${ic('bulb')}</span><div><b>${escH(x.h)}</b><p>${escH(x.t)}</p></div></div>`).join('')}
    </div>
    ${B.traps && B.traps.length ? `<div class="cr-trap">${ic('alert')}<div><strong>Dikkat</strong>${B.traps.map(x=>`<p>${escH(x)}</p>`).join('')}</div></div>` : ''}
    <div class="cr-actions"><button class="cr-btn" id="crBook">${ic('wallet')}Kendi harcamanı yaz · Bütçe Defteri</button></div>
    <details class="pt-src cr-src"><summary>${ic('info')}Bu fiyatlar nereden geliyor · ${B.sources.length} kaynak</summary>
      <p><b>Resmi</b> etiketli kalemler müze, ulaşım ve belediye tarifelerinden gelir ve düzenli olarak yeniden kontrol edilir. <b>Tahmini</b> kalemler (yemek, konaklama, taksi, tur) güncel gezgin kaynaklarından derlenmiş aralıklardır; sezona ve mekâna göre oynar. Son kontrol: ${crDateTR(B.checked)}.</p>
      <ul>${B.sources.map(([n,u])=>`<li><a href="${crSafeUrl(u)}" target="_blank" rel="noopener">${escH(n)}</a></li>`).join('')}</ul>
    </details>
  </section>`;
}
function bindCebinRahat(city){
  const sec = document.getElementById('cebinRahat');
  if(!sec) return;
  const B = BUTCE[city.id], cc = crCountryOf(city.id);
  sec.querySelectorAll('.cr-tiers button').forEach(b=>b.addEventListener('click', ()=>{
    crTier = +b.dataset.t;
    sec.querySelectorAll('.cr-tiers button').forEach(x=>{ const on = x===b; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); });
    const t = B.tiers[crTier], card = document.getElementById('crCard');
    card.querySelector('.cr-amt').textContent = t.v;
    card.querySelector('.cr-inc').textContent = t.inc;
    card.classList.remove('swap'); void card.offsetWidth; card.classList.add('swap');
    buzz(6);
  }));
  sec.querySelectorAll('.cr-seg button').forEach(b=>b.addEventListener('click', ()=>{
    crSetProfile(cc, +b.dataset.p);
    rerenderCebinRahat(city, true);
    buzz(6);
  }));
  const bk = document.getElementById('crBook');
  if(bk) bk.addEventListener('click', ()=> openBudget(city));
  const hc = document.getElementById('heroCr');
  if(hc && !hc.dataset.bound){ hc.dataset.bound = '1'; hc.addEventListener('click', ()=>{
    requestAnimationFrame(()=>{ const el = document.getElementById('cebinRahat'); if(el && el.scrollIntoView) el.scrollIntoView({behavior:'smooth', block:'start'}); });
  }); }
}
function rerenderCebinRahat(city, anim){
  const old = document.getElementById('cebinRahat');
  if(!old) return;
  const wrap = document.createElement('div'); wrap.innerHTML = cebinRahatHTML(city);
  const fresh = wrap.firstElementChild; if(!fresh) return;
  old.replaceWith(fresh);
  if(anim){ const sp = document.getElementById('crSpend'); if(sp) sp.classList.add('swap'); }
  bindCebinRahat(city);
}
/* --- fiyatlar uzaktan güncellenir: uygulamanın yanındaki fiyatlar.json, yoksa son kayıtlı kopya, o da yoksa gömülü veri --- */
function crValid(o){ return o && typeof o==='object' && typeof o.checked==='string' && Array.isArray(o.tiers) && o.tiers.length===3 && Array.isArray(o.spend) && Array.isArray(o.tips) && Array.isArray(o.sources); }
function crMerge(data){
  let changed = [];
  if(!data || typeof data!=='object' || !data.cities) return changed;
  for(const [id, o] of Object.entries(data.cities)){
    if(!crValid(o)) continue;
    if(!BUTCE[id] || o.checked > BUTCE[id].checked){ BUTCE[id] = o; changed.push(id); }
  }
  return changed;
}
async function loadRemotePrices(){
  try{ const r = await window.storage.get('patika:prices', false); if(r) crMerge(JSON.parse(r.value)); }catch(e){}
  if(typeof fetch!=='function' || location.protocol==='file:') return;
  try{
    const res = await fetch('fiyatlar.json', { cache:'no-cache' });
    if(!res.ok) return;
    const data = await res.json();
    const changed = crMerge(data);
    if(changed.length){
      try{ await window.storage.set('patika:prices', JSON.stringify(data), false); }catch(e){}
      const cur = changed.find(id=>id===activeCityId);
      if(cur){ const city = (COUNTRY_CITIES[crCountryOf(cur)]||[]).find(c=>c.id===cur); if(city) rerenderCebinRahat(city); }
    }
  }catch(e){}
}
