// docs/ai-prompt-patika.md içindeki sabit promptu ve araç şemasını worker/patika-ai.js'e gömer.
// Kullanım (repo kökünden): node arac/ai/build-worker.js [--check]
// --check: dosyayı değiştirmez, senkron değilse hata kodu döner (testlerde kullanılır).
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..', '..');
const md = fs.readFileSync(path.join(root, 'docs/ai-prompt-patika.md'), 'utf8');
const wp = path.join(root, 'worker/patika-ai.js');
const w = fs.readFileSync(wp, 'utf8');

const t = md.match(/```text\n([\s\S]*?)\n```/);
const j = md.match(/```json\n([\s\S]*?)\n```/);
if(!t || !j) { console.error('docs içinde ```text ya da ```json bloğu bulunamadı'); process.exit(1); }
const tools = JSON.parse(j[1]);
const block = '/* @@PROMPT_BASLA@@ */\n' +
  'const SYSTEM = ' + JSON.stringify(t[1]) + ';\n' +
  'const TOOLS = ' + JSON.stringify(tools, null, 2) + ';\n' +
  '/* @@PROMPT_BITIR@@ */';
const re = /\/\* @@PROMPT_BASLA@@ \*\/[\s\S]*?\/\* @@PROMPT_BITIR@@ \*\//;
if(!re.test(w)) { console.error('worker içinde işaretli blok yok'); process.exit(1); }
const out = w.replace(re, () => block);
if(process.argv.includes('--check')){
  if(out !== w){ console.error('✗ worker/patika-ai.js docs ile senkron değil: node arac/ai/build-worker.js'); process.exit(1); }
  console.log('✓ worker promptu docs ile senkron'); process.exit(0);
}
fs.writeFileSync(wp, out);
console.log('worker güncellendi: ' + tools.length + ' araç, prompt ' + t[1].length + ' karakter');
