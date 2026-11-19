/* Cebin rahat — Yunanistan (pilotlar dışındaki 12 şehir) */
const C = '2026-11-19';
const S_GR = ['Is Greece Expensive? 2026 — The World Was Here First','https://www.theworldwasherefirst.com/greece-trip-cost/'];
const S_HH = ['Greece’s price hike at tourist sites — DPA / Yahoo News','https://www.yahoo.com/news/greeces-price-hike-tourist-sites-134122672.html'];
const S_FREE = ['Acropolis tickets & free days 2026 — Athens Travel Guides','https://athenstravelguides.com/posts/acropolis-tickets-visiting-guide/'];
function base(ada){
  return {
    checked: C,
    tierNote: (ada ? 'Kişi başı · günlük · adalar için' : 'Kişi başı · günlük · ana kara için') + ' kaynak aralığının alt ucu, ortası ve üst ucu (2 kişi paylaşımlı)',
    tierNoteY: ada ? 'Taverna, KTEL otobüsü ve köy pansiyonuyla alt uca yaklaşırsın.' : 'Souvlaki, günün menüsü ve otobüsle alt uca yaklaşırsın.',
    tiers: ada ? [
      { k:'Hesaplı', v:'~80 €', inc:'Hostel ya da pansiyon, gyros ve taverna, KTEL otobüsü.' },
      { k:'Orta', v:'~250 €', inc:'Orta sınıf otel, oturarak yemekler, bir tekne turu.' },
      { k:'Rahat', v:'~420 €+', inc:'Manzaralı otel, özel tekne ve transferler.' }
    ] : [
      { k:'Hesaplı', v:'~55 €', inc:'Hostel ya da pansiyon, souvlaki, otobüs.' },
      { k:'Orta', v:'~130 €', inc:'Orta sınıf otel, taverna akşamları, birkaç antik alan.' },
      { k:'Rahat', v:'~210 €+', inc:'İyi otel, rehberli turlar, taksi.' }
    ]
  };
}
const TIP_FREE = { h:'Kışın ücretsiz pazarlar', t:'Kasım–Mart arası her ayın 1. ve 3. pazarı devlet antik alanları ücretsiz; ayrıca 6 Mart, 18 Nisan, 18 Mayıs, Eylül’ün son hafta sonu ve 28 Ekim.' };
const TIP_HH = { h:'Bileti resmi siteden al', t:'Antik alan biletleri gişede ve resmi Hellenic Heritage sitesinde (hhticket.gr) aynı fiyat; aracı siteler genelde daha pahalı. AB dışından 18 yaş altı ücretsiz.' };
function city(ada, o){
  return Object.assign(base(ada), {
    intro:o.intro, spend:o.spend||[], tips:(o.tips||[]).concat(o.state === false ? [] : [TIP_FREE, TIP_HH]), traps:o.traps||[],
    sources:(o.src||[]).concat([S_GR], o.state === false ? [] : [S_HH, S_FREE])
  });
}
module.exports = {
  mikonos: city(true, {
    intro:"Mikonos Yunan adalarının en pahalılarından. Delos ise adanın en değerli ve görece ucuz günü.",
    spend:[ { c:'ticket', t:'r', n:'Delos (ören yeri + müze)', p:'20 €', s:'İndirimli 10 € · Aralık–Mart kapalı · tekne ayrıca ödenir' } ],
    tips:[ { h:'Delos için su ve şapka', t:'Adada gölge az; su, atıştırmalık ve şapka yanında olsun. Önce müzeyi gez, sonra tekneye doğru yürü.' } ],
    src:[ ['Visiting Delos — Dave’s Travel Pages','https://www.davestravelpages.com/visiting-delos-island-greece-mykonos-to-delos-day-trip/'] ] }),
  girit: city(true, {
    intro:"Girit'te Hanya'nın eski şehri ücretsiz gezilir; Samaria Kanyonu küçük bir bilet ama ulaşım ve dönüş teknesi ayrıca ödenir.",
    spend:[ { c:'walk', t:'r', n:'Samaria Kanyonu', p:'10 €', s:'5 €’dan 10 €’ya çıktı' },
      { c:'ticket', t:'r', n:'Hanya Arkeoloji Müzesi', p:'15 €' } ],
    tips:[ { h:'Imbros alternatifi', t:'Samaria kalabalık ve uzunsa Imbros Kanyonu 2–3 saatte aynı dramı yaşatıyor.' } ],
    src:[ ['Entrance fee hikes in Crete — Crete Insider','https://creteinsider.com/entrance-fees-archaeological-and-natural-sites/'] ] }),
  rodos: city(true, {
    intro:"Rodos'un eski şehri surların içinde ücretsiz dolaşılır; Büyük Üstat Sarayı ve müze küçük biletler.",
    spend:[ { c:'ticket', t:'e', n:'Büyük Üstat Sarayı', p:'8 €', s:'Öğrenci ve AB’li 65+ için 4 €' },
      { c:'ticket', t:'e', n:'Arkeoloji Müzesi', p:'8 €' } ],
    tips:[ { h:'Şövalyeler Sokağı sabah 9’dan önce', t:'Kruvaziyer grupları 09:00–10:30 arası geliyor; sokak sabah erken bomboş.' },
      { h:'Su çeşmeden', t:'Hipokrat Meydanı ve hendek yürüyüşü girişindeki çeşmelerden şişeni doldur.' } ],
    src:[ ['Rhodes Old Town Guide 2026 — Euro City Guide','https://eurocityguide.com/greece/rhodes-old-town-guide'] ] }),
  selanik: city(false, {
    intro:"Selanik'te Bizans kiliseleri, surlar ve sahil yürüyüşü büyük ölçüde ücretsiz; para pazarlarda ve meyhanelerde harcanır.",
    tips:[ { h:'Ano Poli’de gün batımı', t:'Yukarı şehrin surlarından gün batımı ücretsiz.' } ] }),
  meteora: city(false, {
    intro:"Meteora'da her manastıra ayrı ve küçük bir ücret ödenir. Asıl masraf ulaşım ve Kalambaka'da konaklama.",
    spend:[ { c:'ticket', t:'e', n:'Manastır girişi (her biri)', p:'~3 €', s:'Her manastır ayrı ödenir · kapalı günleri farklı' } ],
    tips:[ { h:'Bozuk nakit ve kıyafet', t:'Ücretler manastır manastır nakit ödeniyor. Omuzlar kapalı olmalı; kadınlar için girişte ücretsiz etek veriliyor.' },
      { h:'Gün batımı yoldan bedava', t:'Manastırlar arasındaki yol üstündeki seyir noktaları gün batımında ücretsiz.' } ],
    state:false,
    src:[ ['Meteora monasteries 2026 — Loudavým krokem','https://loudavymkrokem.cz/en/meteora-greece-monasteries-guide/'] ] }),
  nafplio: city(false, {
    intro:"Nafplio'nun eski şehri ve sahil yürüyüşü ücretsiz; Palamidi kalesine çıkmak ise artık daha pahalı.",
    spend:[ { c:'ticket', t:'r', n:'Palamidi Kalesi', p:'20 €', s:'İndirimli 10 € · eskiden 8 €’ydu' } ],
    tips:[ { h:'Arvanitia yürüyüşü bedava', t:'Arvanitia sahil yolu ücretsiz; Bourtzi’yi karadan izlemek de öyle.' } ],
    src:[ ['Palamidi fortress — Roam At Dawn','https://www.roamatdawn.com/blog/how-many-steps-to-palamidi-fortress'] ] }),
  korfu: city(true, {
    intro:"Korfu'nun eski şehri ve Liston ücretsiz dolaşılır; Eski Kale küçük bir bilet.",
    spend:[ { c:'ticket', t:'e', n:'Eski Kale (Palaio Frourio)', p:'~6 €' } ],
    tips:[ { h:'Kışın erken kapanıyor', t:'Eski Kale Kasım–Mart arası 15:00’te kapanıyor; öğleden önce git.' } ],
    src:[ ['Old Fortress Corfu 2026 — Tourism Attractions','https://tourismattractions.net/greece/old-fortress-corfu-tickets'] ] }),
  milos: city(true, {
    intro:"Milos'ta Sarakiniko ve Plaka gün batımı ücretsiz; bütçenin büyük kalemi Kleftiko tekne turu.",
    spend:[ { c:'boat', t:'e', n:'Kleftiko tekne turu (yarım gün)', p:'135 €', pl:'şnorkel ve transferli lüks tur', y:'50–100 €', yl:'standart sürat teknesi' } ],
    tips:[ { h:'Rüzgâra göre rota', t:'Kuzey rüzgârı sertleşirse tekneler güney kıyıdan (Paleochori) kalkıyor; bir gün önce teyit et.' } ],
    state:false,
    src:[ ['Kleftiko boat tour review 2026 — Greek Trip Planner','https://greektriplanner.me/blog/kleftiko-milos-boat-tour-review'] ] }),
  naksos: city(true, {
    intro:"Naksos Kikladlar'ın sakin ve geniş adası: Portara, köyler ve Zas yürüyüşü ücretsiz.",
    tips:[ { h:'Portara gün batımı', t:'Portara’dan gün batımı ücretsiz; kalabalık olmadan önce git.' } ],
    state:false }),
  paros: city(true, {
    intro:"Paros'ta Bizans Yolu ve Naoussa limanı ücretsiz; Antiparos Mağarası küçük bir bilet.",
    spend:[ { c:'ticket', t:'r', n:'Antiparos Mağarası', p:'6 €', s:'Folklor müzesi dahil · 6–12 yaş 3 € · 2026’da Ekim sonuna kadar her gün 10:00–16:00' } ],
    tips:[ { h:'411 basamak', t:'Mağaraya inişte yaklaşık 411 basamak var; rahat ayakkabı giy.' } ],
    state:false,
    src:[ ['Antiparos Cave 2026 — antiparos.com','https://antiparos.com/explore/antiparos-cave/'] ] }),
  delfi: city(false, {
    intro:"Delfi'de tek büyük bilet ören yeri; akşamı yakındaki dağ köyü Arachova'da geçirmek rotanın parçası.",
    spend:[ { c:'ticket', t:'r', n:'Delfi Örenyeri', p:'20 €', s:'Nisan 2025’ten beri' } ],
    tips:[ { h:'Şafakta gir', t:'Kutsal Yol’u tur otobüsleri gelmeden, açılışta yürü.' } ] }),
  zakintos: city(true, {
    intro:"Zakintos'ta Navagio'yu görmenin ucuz ve pahalı yolu çok farklı: tekneyi limandan kendin bulursan fiyat yarıya iner.",
    spend:[ { c:'boat', t:'e', n:'Navagio (Gemi Enkazı) teknesi', p:'55–75 €', pl:'transferli rehberli tur', y:'15–35 €', yl:'Porto Vromi’den sadece tekne' },
      { c:'boat', t:'e', n:'Caretta caretta turu (Laganas)', p:'25–50 €', s:'3 saat · Mayıs–Ekim yuvalama sezonu' } ],
    tips:[ { h:'Seyir terası bedava', t:'Anafonitria üstündeki Navagio seyir terası ücretsiz ve açık.' } ],
    traps:[ 'Navagio plajına tekneyle çıkış kapalı (kaynak en az 31 Ekim 2026’ya kadar diyor); “plajda vakit” vaat eden ilanlara güvenme, güncel durumu sor.' ],
    state:false,
    src:[ ['Tours in Zakynthos — Greek Trip Planner','https://greektriplanner.me/blog/tours-in-zakynthos'] ] })
};
