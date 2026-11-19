// Patika Asistan testi — kullanım: node ai-test.js <html>
// Araçlar, değişiklik doğrulama, Uygula/Vazgeç/Geri al akışı, XSS, hata durumu ve Worker.
const { JSDOM } = require('jsdom');
const fs = require('fs'), path = require('path'), cp = require('child_process');
const html = fs.readFileSync(process.argv[2],'utf8');
const per={}, sh={};
let script = [];          // sahte model yanıtları sırası
const sent = [];          // asistana giden istek gövdeleri
const dom = new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true, beforeParse(w){
  w.storage = { get: async(k,s)=>{ const st=s?sh:per; if(st[k]===undefined) throw 0; return {value:st[k]}; }, set: async(k,v,s)=>{ (s?sh:per)[k]=v; return {value:v}; } };
  w.fetch = async (u, o)=>{
    if(String(u).startsWith('https://ai.test')){
      sent.push(JSON.parse(o.body));
      const r = script.shift();
      if(!r) return { ok:false, status:500, json:async()=>({ hata:'senaryo bitti' }) };
      if(r.status) return { ok:false, status:r.status, json:async()=>r.body };
      return { ok:true, status:200, json:async()=>r };
    }
    return String(u).includes('open-meteo') ? {ok:true, json:async()=>({current:{temperature_2m:21,weather_code:2}})} : {ok:false};
  };
  w.speechSynthesis = { speaking:false, cancel(){}, speak(){}, getVoices(){ return []; } };
  w.SpeechSynthesisUtterance = function(t){ this.text=t; };
}});
const w = dom.window;
let errs=[]; w.addEventListener('error', e=>errs.push(e.message));
const wait = ms=>new Promise(r=>setTimeout(r,ms));
let fails=0; const ok=(name,c,extra='')=>{ if(!c) fails++; console.log((c?'✓ ':'✗ ')+name+(extra?' — '+extra:'')); };
const until = async (f, ms=1500)=>{ const t=Date.now(); while(Date.now()-t<ms){ if(f()) return true; await wait(20); } return false; };
const tu = (id,name,input)=>({ type:'tool_use', id, name, input });
const txt = t=>({ type:'text', text:t });

setTimeout(async ()=>{
  const d=w.document;
  try{
  d.querySelector('.country-card[data-country="tr"]').click(); await wait(350);
  const T = w.AI_TOOLS;

  // --- bağlantı yokken ---
  d.getElementById('menuBtn').click(); await wait(10); d.getElementById('aiBtn').click(); await wait(80);
  ok('menü → asistan açılır', d.getElementById('aiModal').classList.contains('open'));
  ok('bağlantı yokken "yakında" + giriş kapalı + çip gizli', !d.getElementById('aiOff').hidden && d.getElementById('aiInput').disabled && d.getElementById('aiEmpty').hidden && d.getElementById('aiReset').hidden);
  d.querySelector('[data-close=aiModal]').click();

  // --- okuma araçları ---
  const L = T.sehirleri_listele({});
  ok('sehirleri_listele: 73 şehir', L.sehirler.length===73, L.sehirler.length+'');
  ok('sehirleri_listele: ülke filtresi', T.sehirleri_listele({ulke:'it'}).sehirler.length===20 && !!T.sehirleri_listele({ulke:'xx'}).hata);
  const S = T.sehir_getir({ulke:'tr', sehir_id:'istanbul', gun:1});
  ok('sehir_getir: gün + durak alanları', S.gunler.length===1 && S.gunler[0].duraklar[2].ad==='Yerebatan Sarnıcı' && S.gunler[0].duraklar[2].no===2 && !!S.gunler[0].duraklar[0].bilgi.neden);
  ok('sehir_getir: tüm günlerde bilgi yok (küçük yanıt)', !T.sehir_getir({ulke:'tr', sehir_id:'istanbul'}).gunler[0].duraklar[0].bilgi);
  ok('sehir_getir: geçersiz şehir/gün', !!T.sehir_getir({ulke:'tr', sehir_id:'yok'}).hata && !!T.sehir_getir({ulke:'tr', sehir_id:'istanbul', gun:99}).hata && !!T.sehir_getir({ulke:'it', sehir_id:'istanbul'}).hata);
  const P = T.patika_getir({sehir_id:'adana'});
  ok('patika_getir: Adana 7 yer + güvenlik', P.yerler.length===7 && P.yerler.some(y=>/sırta/.test(y.guvenlik)));
  ok('patika_getir: veri yok', T.patika_getir({sehir_id:'izmir'}).veri_yok===true);
  const B = T.butce_getir({sehir_id:'milano'});
  ok('butce_getir: resmi/tahmini + tarih', B.kalemler.some(k=>k.tur==='resmi') && B.kalemler.some(k=>k.tur==='tahmini') && Number.isInteger(B.kac_gun_once) && typeof B.eski_olabilir==='boolean');

  // --- doğrulama ---
  const sim = x=>w.aiSimulate({ baslik:'t', islemler:[Object.assign({gerekce:'g'},x)] });
  ok('red: durak no aralık dışı', !sim({tur:'durak_cikar', ulke:'tr', sehir_id:'istanbul', gun:1, durak_no:9}).ok);
  ok('red: eksik sıra', !sim({tur:'duraklari_sirala', ulke:'tr', sehir_id:'istanbul', gun:1, sira:[0,1,2]}).ok);
  ok('red: tekrarlı sıra', !sim({tur:'duraklari_sirala', ulke:'tr', sehir_id:'istanbul', gun:1, sira:[0,0,1,2,3]}).ok);
  ok('red: rotada olanı geri al', !sim({tur:'durak_geri_al', ulke:'tr', sehir_id:'istanbul', gun:1, durak_no:1}).ok);
  ok('red: bilinmeyen işlem', !sim({tur:'sil_hepsini'}).ok);
  const all = w.aiSimulate({ baslik:'t', islemler:[0,1,2,3,4].map(i=>({tur:'durak_cikar', ulke:'tr', sehir_id:'istanbul', gun:1, durak_no:i, gerekce:''})) });
  ok('red: günde en az bir durak kalmalı', !all.ok && /en az bir/.test(all.mesaj));
  const dup = w.aiSimulate({ baslik:'t', islemler:[{tur:'plana_sehir_ekle', ulke:'it', sehir_id:'roma', gerekce:''},{tur:'plana_sehir_ekle', ulke:'it', sehir_id:'roma', gerekce:''}] });
  ok('red: aynı şehri iki kez ekleme (toplu)', !dup.ok && /zaten planda/.test(dup.mesaj));
  ok('doğrulama hiçbir şeyi değiştirmez', !w.getEdit(w.eval('COUNTRY_CITIES').tr[0]).skip['1-0'] && w.eval('tripPlan').length===0);
  const okSort = sim({tur:'duraklari_sirala', ulke:'tr', sehir_id:'istanbul', gun:1, sira:[4,3,2,1,0]});
  ok('kabul: tam sıralama', okSort.ok && /1\. Hipodrom/.test(okSort.lines[0].t));

  // --- tam akış: oku → öner → Uygula → Geri al ---
  w.AI_CFG.endpoint = 'https://ai.test/x';
  script = [
    { content:[ txt('Bakıyorum.'), tu('t1','sehir_getir',{ulke:'tr', sehir_id:'istanbul', gun:1}) ], stop_reason:'tool_use' },
    { content:[ tu('t2','degisiklik_oner',{ baslik:'İstanbul 1. gün: daha hafif', islemler:[
        {tur:'durak_cikar', ulke:'tr', sehir_id:'istanbul', gun:1, durak_no:2, gerekce:'Sarnıç kuyruğu uzun.'},
        {tur:'plana_sehir_ekle', ulke:'it', sehir_id:'roma', gerekce:'İtalya ayağı için.'} ] }) ], stop_reason:'tool_use' },
    { content:[ txt('Tamam, **hazır**.\n- Yerebatan çıktı\n- Roma eklendi') ], stop_reason:'end_turn' }
  ];
  d.getElementById('aiBtn').click(); await wait(60);
  ok('bağlantı varken giriş açık', d.getElementById('aiOff').hidden && !d.getElementById('aiInput').disabled);
  d.getElementById('aiInput').value = 'İlk günü hafiflet, Roma ekle';
  d.getElementById('aiForm').dispatchEvent(new w.Event('submit',{cancelable:true}));
  ok('öneri kartı çıktı', await until(()=>d.querySelector('.ai-card .ai-apply')));
  ok('kart içeriği', /Yerebatan Sarnıcı çıkarılıyor/.test(d.querySelector('.ai-card').textContent) && /Roma 1\. sıraya/.test(d.querySelector('.ai-card').textContent) && /kuyruğu uzun/.test(d.querySelector('.ai-card').textContent));
  ok('sohbet başlayınca çipler gizlenir', d.getElementById('aiEmpty').hidden);
  ok('kart beklerken giriş kapalı', d.getElementById('aiInput').disabled);
  ok('bağlam gönderildi', /aktif_sehir: istanbul/.test(sent[0].baglam) && /gezi_plani: \[\]/.test(sent[0].baglam));
  const tr1 = sent[1].messages.at(-1).content[0];
  ok('okuma aracı sonucu modele gitti', tr1.type==='tool_result' && tr1.tool_use_id==='t1' && /Yerebatan/.test(tr1.content));
  ok('Uygula basılmadan değişiklik yok', !per['patika:edit:istanbul'] || !JSON.parse(per['patika:edit:istanbul']).skip['1-2']);
  d.querySelector('.ai-apply').click();
  ok('Uygula → son yanıt', await until(()=>/hazır/.test(d.getElementById('aiLog').textContent) && !d.getElementById('aiInput').disabled));
  ok('durak çıkarıldı + kaydedildi', JSON.parse(per['patika:edit:istanbul']).skip['1-2']===true);
  ok('gezi planına eklendi + kaydedildi', JSON.parse(per['patika:trip']).some(e=>e.id==='roma'));
  const tr2 = JSON.parse(sent[2].messages.at(-1).content[0].content);
  ok('modele "uygulandi" döndü', tr2.durum==='uygulandi');
  await wait(400);
  const stYer = [...d.querySelectorAll('#dayPanel .station')].find(s=>/Yerebatan/.test(s.textContent));
  ok('rota ekranı güncellendi (durak atlanmış)', !!stYer && /skip/.test(stYer.className), stYer && stYer.className);
  ok('biçim: kalın + madde', !!d.querySelector('.ai-bot strong') && d.querySelectorAll('.ai-bot li').length===2);
  d.querySelector('.ai-undo').click(); await wait(120);
  ok('Geri al → eski haline döndü', !JSON.parse(per['patika:edit:istanbul']).skip['1-2'] && JSON.parse(per['patika:trip']).length===0);

  // --- geri alma notu + Vazgeç ---
  script = [
    { content:[ tu('t3','degisiklik_oner',{ baslik:'Sıra', islemler:[{tur:'duraklari_sirala', ulke:'tr', sehir_id:'istanbul', gun:1, sira:[1,0,2,3,4], gerekce:'x'}] }) ], stop_reason:'tool_use' },
    { content:[ txt('Peki, böyle kalsın.') ], stop_reason:'end_turn' }
  ];
  d.getElementById('aiInput').value = 'sırayı değiştir';
  d.getElementById('aiForm').dispatchEvent(new w.Event('submit',{cancelable:true}));
  await until(()=>d.querySelectorAll('.ai-card').length===2);
  const lastUser = sent[3].messages.at(-1).content;
  ok('geri alma notu modele iletildi', lastUser.length===2 && /geri aldı/.test(lastUser[0].text));
  [...d.querySelectorAll('.ai-cancel')].at(-1).click();
  ok('Vazgeç → sohbet sürer', await until(()=>/böyle kalsın/.test(d.getElementById('aiLog').textContent)));
  ok('modele "vazgecildi" döndü + sıra değişmedi', JSON.parse(sent[4].messages.at(-1).content[0].content).durum==='vazgecildi' && !(JSON.parse(per['patika:edit:istanbul']).order||{})[1]);

  // --- geçersiz öneri: kart yok, modele hata ---
  script = [
    { content:[ tu('t4','degisiklik_oner',{ baslik:'x', islemler:[{tur:'durak_cikar', ulke:'tr', sehir_id:'istanbul', gun:7, durak_no:0, gerekce:''}] }) ], stop_reason:'tool_use' },
    { content:[ txt('O gün yokmuş, kusura bakma.') ], stop_reason:'end_turn' }
  ];
  d.getElementById('aiInput').value = '7. günü düzenle';
  d.getElementById('aiForm').dispatchEvent(new w.Event('submit',{cancelable:true}));
  await until(()=>/kusura bakma/.test(d.getElementById('aiLog').textContent));
  ok('geçersiz öneri → kart yok, modele hata', d.querySelectorAll('.ai-card').length===2 && JSON.parse(sent[6].messages.at(-1).content[0].content).durum==='hata');

  // --- XSS ---
  script = [ { content:[ txt('<img src=x onerror="window.__xss=1">**<script>window.__xss=2</script>**') ], stop_reason:'end_turn' } ];
  d.getElementById('aiInput').value = 'test';
  d.getElementById('aiForm').dispatchEvent(new w.Event('submit',{cancelable:true}));
  await until(()=>!d.getElementById('aiInput').disabled); await wait(30);
  const lastBot = [...d.querySelectorAll('.ai-bot')].at(-1);
  ok('XSS: model metni zararsız', !lastBot.querySelector('img') && !lastBot.querySelector('script') && !w.__xss && /<img/.test(lastBot.textContent));

  // --- hata: geçmiş bozulmaz ---
  const nBefore = w.aiState.messages.length;
  script = [ { status:503, body:{ hata:'Asistan şu an yoğun.' } } ];
  d.getElementById('aiInput').value = 'merhaba';
  d.getElementById('aiForm').dispatchEvent(new w.Event('submit',{cancelable:true}));
  await until(()=>!d.getElementById('aiInput').disabled); await wait(30);
  ok('hata mesajı + geçmiş geri sarıldı', /yoğun/.test([...d.querySelectorAll('.ai-err')].at(-1).textContent) && w.aiState.messages.length===nBefore);

  // --- yeni sohbet ---
  d.getElementById('aiReset').click();
  ok('yeni sohbet temizler', w.aiState.messages.length===0 && d.getElementById('aiLog').children.length===0 && !d.getElementById('aiEmpty').hidden);
  }catch(e){ ok('TEST İSTİSNASI', false, e.stack); }

  // --- Worker ---
  try{
    const root = path.resolve(__dirname,'..','..');
    let synced = true; try{ cp.execFileSync('node',[path.join(root,'arac/ai/build-worker.js'),'--check'],{stdio:'pipe'}); }catch(e){ synced=false; }
    ok('worker promptu docs ile senkron', synced);
    const tmp = path.join(require('os').tmpdir(),'patika-worker-test.mjs');
    fs.copyFileSync(path.join(root,'worker/patika-ai.js'), tmp);
    const W = (await import('file://'+tmp+'?'+Date.now())).default;
    const names = JSON.parse(fs.readFileSync(path.join(root,'docs/ai-prompt-patika.md'),'utf8').match(/```json\n([\s\S]*?)\n```/)[1]).map(t=>t.name).sort();
    ok('araç adları uygulamayla aynı', JSON.stringify(names)===JSON.stringify([...Object.keys(w.AI_TOOLS),'degisiklik_oner'].sort()), names.join(','));
    const O = 'https://muratsahinn.github.io';
    const req = (origin, body, method='POST')=>new Request('https://w.test/', { method, headers: Object.assign({'content-type':'application/json'}, origin?{origin}:{}), body: method==='POST'?JSON.stringify(body):undefined });
    const good = { baglam:'<baglam>\nbugun: x\n</baglam>', messages:[{role:'user', content:'merhaba'}] };
    let r = await W.fetch(req('https://kotu.example', good), { ANTHROPIC_API_KEY:'k' });
    ok('worker: yabancı kaynak 403', r.status===403);
    r = await W.fetch(req(O, good), {});
    ok('worker: anahtar yoksa 503', r.status===503);
    r = await W.fetch(req(O, { messages:[{role:'assistant', content:'x'}] }), { ANTHROPIC_API_KEY:'k' });
    ok('worker: geçersiz mesaj 400', r.status===400);
    r = await W.fetch(req(O, good), { ANTHROPIC_API_KEY:'k', RL:{ limit: async()=>({success:false}) } });
    ok('worker: hız sınırı 429', r.status===429);
    let up = null; const realFetch = globalThis.fetch;
    globalThis.fetch = async (u,o)=>{ up = { u, h:o.headers, b:JSON.parse(o.body) }; return new Response(JSON.stringify({ id:'m', content:[{type:'text',text:'selam'}], stop_reason:'end_turn', usage:{} }), {status:200}); };
    r = await W.fetch(req(O, good), { ANTHROPIC_API_KEY:'gizli', RL:{ limit: async()=>({success:true}) } });
    globalThis.fetch = realFetch;
    const out = await r.json();
    ok('worker: Anthropic isteği doğru', up.u==='https://api.anthropic.com/v1/messages' && up.h['x-api-key']==='gizli' && up.h['anthropic-version']==='2023-06-01' && up.b.tools.length===5 && up.b.system[0].cache_control.type==='ephemeral' && /Patika'nın gezi asistanısın/.test(up.b.system[0].text) && /<baglam>/.test(up.b.system[1].text), up.b.model);
    ok('worker: istemciye sade yanıt + CORS', out.content[0].text==='selam' && out.stop_reason==='end_turn' && !out.usage && r.headers.get('access-control-allow-origin')===O);
    r = await W.fetch(req(O, null, 'OPTIONS'), {});
    ok('worker: CORS ön isteği', r.status===204);
  }catch(e){ ok('WORKER İSTİSNASI', false, e.stack); }

  ok('JS HATASI YOK', errs.length===0, errs.join(' | '));
  console.log(fails? `\n${fails} BAŞARISIZ` : '\nTÜMÜ GEÇTİ');
  process.exit(fails?1:0);
}, 400);
