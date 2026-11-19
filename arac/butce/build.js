/* BUTCE kaynaklarını birleştirir: index.html'e gömer + fiyatlar.json üretir
   kullanım (repo kökünden): node arac/butce/build.js index.html fiyatlar.json */
const fs = require('fs'), path = require('path');
const dir = __dirname;
const all = {};
fs.readdirSync(dir).filter(f=>/^src-.*\.js$/.test(f)).sort().forEach(f=>{ Object.assign(all, require(path.join(dir,f))); });
const html = process.argv[2], out = process.argv[3];
/* aylık görev fiyatlar.json'ı günceller: kaynak dosyalardan daha yeni olan şehir korunur */
if(out && fs.existsSync(out)){
  try{ const cur = JSON.parse(fs.readFileSync(out,'utf8')).cities || {};
    for(const [id,o] of Object.entries(cur)) if(!all[id] || (o.checked||'') > (all[id].checked||'')){ all[id] = o; console.log('fiyatlar.json daha yeni, korundu:', id, o.checked); }
  }catch(e){ console.log('fiyatlar.json okunamadı, kaynaklardan üretiliyor'); }
}
let s = fs.readFileSync(html,'utf8');
const A = s.indexOf('/* ==================== CEBİN RAHAT'), Bm = s.indexOf('let patikaMode = false;');
if(A<0 || Bm<0 || Bm<A) throw new Error('işaretler yok');
const block = "/* ==================== CEBİN RAHAT · şehir bütçeleri ==================== */\n/* fiyatlar.json ile aynı veri; uygulama açılınca daha yenisi varsa onu kullanır */\nconst BUTCE = " + JSON.stringify(all) + ";\n" + fs.readFileSync(path.join(dir,'ui.js'),'utf8') + "\n";
s = s.slice(0,A) + block + s.slice(Bm);
fs.writeFileSync(html, s);
if(out) fs.writeFileSync(out, JSON.stringify({ version:1, generated:new Date().toISOString().slice(0,10), cities:all }, null, 1));
console.log('şehir:', Object.keys(all).length, '· kalem:', Object.values(all).reduce((a,c)=>a+c.spend.length,0));
