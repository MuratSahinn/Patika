/* Cebin rahat — İtalya (pilotlar dışındaki 18 şehir) */
const C = '2026-11-19';
const S_IT = ['Is Italy Expensive? 2026 — The World Was Here First','https://www.theworldwasherefirst.com/italy-trip-cost/'];
const S_MIC = ['Cost of museum tickets in Italy 2026 — Italy Planner','https://italyplanner.com/cost-of-museum-tickets-italy-2026.html'];
const PAHALI = { venedik:1, como:1, amalfi:1, cinqueterre:1, capri:1 };
function base(id){
  const pah = PAHALI[id], guney = ['napoli','palermo','taormina','matera','alberobello'].includes(id);
  return {
    checked: C,
    tierNote: 'Kişi başı · günlük · İtalya geneli kaynak aralığının alt ucu, ortası ve üst ucu' + (pah ? '; bu bölge ortalamadan pahalı' : guney ? '; güney ve Sicilya genelde daha uygun' : ''),
    tierNoteY: 'Barda ayakta kahve, öğle menüsü ve toplu taşımayla alt uca yaklaşırsın.',
    tiers: [
      { k:'Hesaplı', v:'~70 €', inc:'Hostel yatağı, sokak yemeği ve öğle menüsü, toplu taşıma.' },
      { k:'Orta', v:'~185 €', inc:'Orta sınıf otel ya da daire, oturarak yemekler, günde bir müze.' },
      { k:'Rahat', v:'~305 €+', inc:'İyi otel, rehberli turlar, restoran akşamları.' }
    ]
  };
}
const TIP_MIC = { h:'Ayın ilk pazarı devlet müzeleri ücretsiz', t:'Devlete bağlı (MiC) müze ve ören yerleri her ayın ilk pazarı herkese ücretsiz; 18 yaş altı her milletten ziyaretçi de her gün ücretsiz giriyor.' };
const TIP_AB = { h:'AB indirimi bize geçmiyor', t:'Devlet müzelerindeki 2 €’luk 18–25 yaş indirimi sadece AB vatandaşlarına; T.C. pasaportuyla tam bilet ödenir.' };
const TIP_KAHVE = { h:'Kahve barda, su çeşmeden', t:'Barda ayakta içilen kahve masadakinden ucuz; ana meydandan birkaç sokak içeride menü fiyatları %10–15 düşüyor.' };
function city(id, o){
  return Object.assign(base(id), o.tierOverride || {}, {
    intro:o.intro, spend:o.spend||[], tips:(o.tips||[]).concat(o.mic === false ? [TIP_KAHVE] : [TIP_MIC, TIP_AB]), traps:o.traps||[],
    sources:(o.src||[]).concat([S_IT].concat(o.mic === false ? [] : [S_MIC]))
  });
}
module.exports = {
  venedik: city('venedik', {
    intro:"Venedik'te en büyük iki kalem konaklama ve vaporetto. Yürüyerek gezmek ve traghetto ile kanalı 2 €'ya geçmek bütçeyi rahatlatır.",
    tierOverride:{ tierNote:'Kişi başı · günlük · ara sezon · kaynak USD veriyor', tiers:[
      { k:'Hesaplı', v:'130–235 $', inc:'Ekonomik otel ya da Mestre, cicchetti, yürüyerek gezme.' },
      { k:'Orta', v:'250–500 $', inc:'Merkezde otel, vaporetto kartı, birkaç müze.' },
      { k:'Rahat', v:'675–1.750+ $', inc:'Kanal manzaralı otel, özel turlar, restoranlar.' } ] },
    spend:[
      { c:'ticket', t:'r', n:'Dükler Sarayı (San Marco müzeleri)', p:'35 €', pl:'gişede', y:'30 €', yl:'1 ay önceden online', s:'1 Ocak 2026’dan beri' },
      { c:'ticket', t:'e', n:'San Marco Bazilikası', p:'~12 €', s:'Çan kulesi ~18 €' },
      { c:'boat', t:'r', n:'Vaporetto tek biniş (75 dk)', p:'9,50 €', s:'24 saat 25 € · 48 saat 35 € · 72 saat 45 €' },
      { c:'boat', t:'r', n:'Büyük Kanal’ı geçmek', p:'9,50 €', pl:'vaporetto', y:'2 €', yl:'traghetto gondolu' },
      { c:'ticket', t:'r', n:'Murano Cam · Burano Dantel müzeleri', p:'20 €', s:'Ocak 2026’da 12 €’dan çıktı' }
    ],
    tips:[ { h:'Cicchetti ile ye', t:'San Marco çevresinde fiyatlar en hızlı yükseliyor; bacari denilen barlarda cicchetti ile yemek bütçeyi kurtarır.' },
      { h:'Kartı hesapla', t:'Günde 3’ten fazla vaporetto binişin yoksa tek bilet daha mantıklı; merkez zaten yürünür.' } ],
    traps:[ 'Erişim ücreti (günübirlikçi) 2026 deneme dönemi 27 Temmuz’da bitti; 2027 tarihleri açıklanmadı, gitmeden kontrol et.' ],
    mic:false,
    src:[ ['Venice museum tickets rise — Finestre sull’Arte','https://www.finestresullarte.info/en/museums/venice-museum-tickets-rise-doge-s-palace-becomes-a-35-euro-bloodletting'],
      ['Venice travel budget 2026 — Jetsetter Alerts','https://www.jetsetteralerts.com/venice-italy-travel-budget-guide/'],
      ['Italy travel costs 2026 — First Step to Adventure','https://firststeptoadventure.com/italy-travel-costs-2026/'] ] }),
  milano: city('milano', {
    intro:"Milano'da Son Akşam Yemeği'nin bileti ucuz ama bulması zor; Duomo çatısı ise şehrin en çok ödenen manzarası.",
    spend:[
      { c:'ticket', t:'r', n:'Son Akşam Yemeği (Cenacolo)', p:'15 €', s:'15 dakikalık giriş · rehberli 25 € · satışlar 3 ayda bir açılıyor' },
      { c:'ticket', t:'e', n:'Duomo çatı terası', p:'22 €', pl:'merdivenle', y:'26 €', yl:'asansörle' },
      { c:'ticket', t:'e', n:'Castello Sforzesco müzeleri', p:'5 €' }
    ],
    tips:[ { h:'Cenacolo biletini alarmla yakala', t:'Biletler İtalya saatiyle 12:00’de satışa çıkıyor ve dakikalar içinde bitiyor; hesabını bir gün önce aç.' } ],
    src:[ ['Last Supper Milan Tickets 2026 — Art Visit Guide','https://www.artvisitguide.com/last-supper-milan-tickets-guide/'],
      ['Milan Duomo Tickets 2026 — Art Visit Guide','https://www.artvisitguide.com/milan-duomo-tickets-guide/'] ] }),
  como: city('como', {
    intro:"Como Gölü İtalya'nın pahalı köşelerinden. Greenway yürüyüşü ücretsiz; para vapur, villa ve konaklamaya gider.",
    tips:[ { h:'Greenway bedava', t:'Colonno’dan Griante’ye 10 köyü bağlayan Greenway yürüyüşü ücretsiz; dönüşü C110 otobüsü ya da vapurla yap.' } ],
    mic:false,
    src:[ ['Greenway del Lago di Como — in-Lombardia','https://www.in-lombardia.it/en/tours/greenway-lago-di-como'] ] }),
  napoli: city('napoli', {
    intro:"Napoli'de tarihi merkezin sokakları ücretsiz; büyük biletler Pompei ve Sansevero.",
    spend:[
      { c:'ticket', t:'r', n:'Pompei Arkeoloji Parkı', p:'20 €', s:'Pompei+ 25 € (banliyö villaları dahil) · 3 günlük 30 € · 12 Ocak 2026’dan beri' },
      { c:'ticket', t:'e', n:'Cappella Sansevero (Örtülü İsa)', p:'12 €', s:'Özel müze, sadece rezervasyonla · 18–26 yaş 8 €' },
      { c:'ticket', t:'e', n:'Campania Artecard Napoli (3 gün)', p:'27 €' }
    ],
    tips:[ { h:'Pompei ayın ilk pazarı ücretsiz', t:'Pompei her ayın ilk pazarı herkese ücretsiz; 18 yaş altı her gün ücretsiz.' },
      { h:'Sansevero’ya ilk seansta', t:'Şapel küçük ve kalabalık; günün ilk saatini al.' } ],
    src:[ ['New admission fees from 12 January 2026 — Pompeii Archaeological Park','https://pompeiisites.org/en/?p=65795'],
      ['Cappella Sansevero Tickets 2026 — Art Visit Guide','https://www.artvisitguide.com/cappella-sansevero-veiled-christ-tickets-guide/'] ] }),
  amalfi: city('amalfi', {
    intro:"Amalfi kıyısı pahalı bir bölge; ama Tanrıların Yolu ve vadiler ücretsiz yürünür.",
    spend:[ { c:'walk', t:'r', n:'Valle delle Ferriere koruma alanı (FAI)', p:'5 €', s:'12 yaş altı ve 65 yaş üstü ücretsiz' } ],
    tips:[ { h:'Patikalar bedava', t:'Tanrıların Yolu ve Valle delle Ferriere’nin patika kısmı ücretsiz; en pahalı kıyıda en ucuz deneyim yürüyüş.' } ],
    mic:false,
    src:[ ['Valle delle Ferriere — Viaggiapiccoli','https://www.viaggiapiccoli.com/?p=90322'] ] }),
  capri: city('capri', {
    intro:"Capri pahalı bir ada; Mavi Mağara'ya giriş ücretleri ayrı ayrı ödenir ve tekne de ayrıca.",
    spend:[ { c:'boat', t:'e', n:'Mavi Mağara (giriş + kayık)', p:'18 €', s:'6 € giriş + 12 € kürekçi · Marina Grande’den motorlu tekne ayrıca' } ],
    tips:[ { h:'09:30’dan önce', t:'İlk tekneler 08:30–09:00 arası kalkıyor; erken gidince kayık sırası kısa. Bozuk para taşı.' } ],
    traps:[ 'Mağara hava yüzünden kapanırsa motorlu teknenin ücreti iade edilmiyor; kalkmadan iskelede “aperta?” diye sor.' ],
    mic:false,
    src:[ ['How to book the Blue Grotto — Italy Planner','https://italyplanner.com/how-to-book-blue-grotto-capri.html'] ] }),
  pisa: city('pisa', {
    intro:"Pisa'da kuleye çıkmak tek büyük bilet; Duomo girişi herhangi bir biletle ücretsiz.",
    spend:[ { c:'ticket', t:'r', n:'Eğik Kule’ye tırmanış', p:'~20 €', s:'Saatli bilet · 8 yaş altı çıkamıyor · aracı sitede 24 €' } ],
    tips:[ { h:'Resmi siteden al', t:'Resmi site (opapisa.it) aracı sitelerden daha ucuz; satış 90 gün önceden açılıyor.' },
      { h:'Günübirlik yeter', t:'Floransa’dan bölgesel trenle yaklaşık bir saat; Piazza dei Miracoli için 2–3 saat yeterli.' } ],
    mic:false,
    src:[ ['Leaning Tower of Pisa Tickets 2026 — Art Visit Guide','https://www.artvisitguide.com/leaning-tower-of-pisa-tickets-guide/'] ] }),
  siena: city('siena', {
    intro:"Siena'da Piazza del Campo ücretsiz; Belediye Sarayı müzesi ve Torre del Mangia ayrı biletli.",
    spend:[ { c:'ticket', t:'e', n:'Museo Civico (Palazzo Pubblico)', p:'10 €', s:'Torre del Mangia ile kombine alınabiliyor · kule 503 basamak' } ],
    tips:[ { h:'Kuleye erken', t:'Yüksek sezonda Torre del Mangia kuyruğu 30–60 dakika; sabah erken ya da öğleden sonra geç git.' } ],
    mic:false,
    src:[ ['Museo Civico Siena — Italy Planner','https://italyplanner.com/museo-civico-siena.html'] ] }),
  verona: city('verona', {
    intro:"Verona'da birkaç müze gezeceksen Verona Card hesaplı; Arena ve Juliet'in Evi karta dahil.",
    spend:[ { c:'ticket', t:'r', n:'Verona Card', p:'33 €', pl:'24 saat', y:'38 €', yl:'48 saat', s:'1 Eylül 2026’dan beri · şehir otobüsleri dahil · Juliet’in Evi için saat rezervasyonu şart' } ],
    tips:[ { h:'Kartı resmi kanaldan al', t:'Aracı sitelerden alınan kuponlar turizm ofisinde fiziki karta çevrilmeli; resmi uygulama ya da Piazza Bra ofisi daha pratik.' } ],
    mic:false,
    src:[ ['Is the Verona Card worth it — Italy Planner','https://italyplanner.com/verona-card-worth-it.html'] ] }),
  bologna: city('bologna', {
    intro:"Bologna'da portikolar ve San Luca yürüyüşü ücretsiz; Anatomi Tiyatrosu küçük bir bilet. Para çoğunlukla sofraya gider.",
    spend:[ { c:'ticket', t:'r', n:'Archiginnasio · Anatomi Tiyatrosu', p:'10 €', pl:'sesli rehberle', y:'12 €', yl:'rehberli tur', s:'Online rezervasyon zorunlu · 12 yaş altı ücretsiz' } ],
    tips:[ { h:'San Luca’ya portikoyla', t:'San Luca’ya giden yaklaşık 4 km’lik portikolu yol ücretsiz; şehrin en güzel yürüyüşü.' } ],
    mic:false,
    src:[ ['Palazzo dell’Archiginnasio — Bologna Welcome','https://www.bolognawelcome.com/en/experiences/331861/Palazzo-dell-Archiginnasio-and-Teatro-Anatomico'] ] }),
  cinqueterre: city('cinqueterre', {
    intro:"Cinque Terre'de para patika ve tren kartlarına gider. Kartın fiyatı güne göre değişiyor: kalabalık günler en pahalısı.",
    spend:[
      { c:'walk', t:'r', n:'Trekking Card (1 gün)', p:'15 €', pl:'yoğun günlerde', y:'10 €', yl:'normal günlerde', s:'2 gün 17 € (yoğun 26,70 €)' },
      { c:'car', t:'r', n:'Tren Kartı (1 gün, patikalar dahil)', p:'35 €', pl:'yüksek yoğunluk', y:'22 €', yl:'düşük yoğunluk', s:'14 Mart–1 Kasım 2026 · orta yoğunluk 29,50 €' }
    ],
    tips:[ { h:'Takvime bak, yeşil güne denk getir', t:'Tren kartı fiyatı yoğunluk takvimine göre üç kademede; aynı kart sakin günde 13 € daha ucuz.' },
      { h:'Konaklayana indirim', t:'Bölgede konaklayan yetişkinler için Trekking Card 5 €.' } ],
    mic:false,
    src:[ ['Cinque Terre Card 2026 — lecinqueterre.org','https://www.lecinqueterre.org/cinqueterrecard.php'] ] }),
  palermo: city('palermo', {
    intro:"Palermo'da pazarlar ve katedral bedava; büyük bilet Norman Sarayı ve Cappella Palatina.",
    spend:[
      { c:'ticket', t:'e', n:'Norman Sarayı + Cappella Palatina', p:'19 €', s:'65 yaş üstü 15,50 € · 14–17 yaş 11 €' },
      { c:'ticket', t:'e', n:'Katedral çatısı', p:'7 €', s:'Katedralin kendisi ücretsiz' },
      { c:'ticket', t:'e', n:'Monreale manastır avlusu', p:'8 €', s:'Monreale Katedrali ücretsiz · avlu ayın ilk pazarı ücretsiz' }
    ],
    tips:[ { h:'Sokak yemeğinde kuyruk iyi işaret', t:'Ballarò pazarı 07:30–20:00 açık; yerlilerin sıraya girdiği tezgâhı seç.' } ],
    traps:[ 'Norman Sarayı haber vermeden kapanabiliyor; Cappella Palatina’da restorasyon var, gitmeden kontrol et.' ],
    src:[ ['Things to do in Palermo — Blue Keys','https://bluekeys.it/blog/things-to-do-in-palermo'] ] }),
  taormina: city('taormina', {
    intro:"Taormina pahalı bir kasaba; ama aynı kanyonu yarı fiyatına görmenin yolu da burada.",
    spend:[ { c:'walk', t:'r', n:'Alcantara Kanyonu', p:'7–13 €', pl:'özel park, asansörlü', y:'~1,50 €', yl:'belediye girişi, merdivenli', s:'İkisi de aynı kanyona çıkıyor' } ],
    tips:[ { h:'Su ayakkabısını kirala', t:'Alcantara’da su yazın bile 8–10 °C; ayakkabıyı belediye girişindeki büfeden kirala.' } ],
    mic:false,
    src:[ ['Alcantara Gorge — The Crowded Planet','https://www.thecrowdedplanet.com/gole-alcantara-gorge-sicily/'] ] }),
  matera: city('matera', {
    intro:"Matera'nın en güzel manzaraları ücretsiz; mağara evler ve kaya kiliseleri birkaç euroluk biletlerle gezilir.",
    spend:[
      { c:'ticket', t:'e', n:'Casa Grotta di Vico Solitario', p:'3–5 €' },
      { c:'ticket', t:'e', n:'Kaya kiliseleri kombine', p:'10–12 €', s:'Tek kilise ~3 €' },
      { c:'ticket', t:'e', n:'Palombaro Lungo sarnıcı', p:'5 €' }
    ],
    tips:[ { h:'Bedava seyir noktaları', t:'Piazza San Pietro Caveoso, Katedral terası ve Piazza Pascoli şehrin en güzel ücretsiz manzaraları.' } ],
    mic:false,
    src:[ ['Matera old town guide 2026 — Euro City Guide','https://eurocityguide.com/italy/matera-old-town-guide'] ] }),
  alberobello: city('alberobello', {
    intro:"Alberobello küçük bir kasaba; trullo sokaklarında dolaşmak ücretsiz. Para trulloda konaklamaya gider.",
    tips:[ { h:'Aia Piccola sakin taraf', t:'Rione Monti kalabalık ve dükkânlarla dolu; Aia Piccola’da yerel yaşam daha sakin ve ücretsiz.' } ],
    mic:false }),
  dolomitler: city('dolomitler', {
    intro:"Dolomitler'de yürüyüş ücretsiz, oraya ulaşmak değil: teleferikler ve paralı yollar bütçenin büyük kalemi.",
    spend:[ { c:'car', t:'r', n:'Tre Cime paralı yol + otopark', p:'40 €', s:'Araç başı · motosiklet 26 € · karavan 60 € · online rezervasyon zorunlu' } ],
    tips:[ { h:'Rezervasyonsuz giriş yok', t:'Tre Cime yolu için saat dilimi seçip önceden ödeme şart; plaka rezervasyonla eşleşmeli.' },
      { h:'Seceda’ya Col Raiser’den', t:'Ortisei teleferiği yerine Santa Cristina’dan Col Raiser ile çıkıp 1–2 saat yürümek daha keyifli ve daha az kalabalık.' } ],
    mic:false,
    src:[ ['Tre Cime parking rules 2026 — In Moments','https://www.in-moments.com/dolomites/tre-cime-parking-rules'],
      ['The way to the Seceda — Val Gardena','https://www.valgardena.it/en/summer-holidays-dolomites/trekking/seceda/the-way-to-the-seceda/'] ] }),
  torino: city('torino', {
    intro:"Torino'da meydanlar ve arkadlar ücretsiz; büyük bilet Mısır Müzesi.",
    spend:[ { c:'ticket', t:'e', n:'Museo Egizio', p:'18 €', s:'15–18 yaş ve öğrenci 3 € · 6–14 yaş 1 €' } ],
    tips:[ { h:'Arkadlar ve kahve', t:'Piazza Castello ve arkadlar ücretsiz; bicerin’i tarihi kafelerde barda iç.' } ],
    mic:false,
    src:[ ['Museo Egizio di Torino — Avygeo','https://www.avygeo.com/it/guida/attivita/26776-museo-egizio-di-torino'] ] }),
  ravenna: city('ravenna', {
    intro:"Ravenna'nın mozaikleri tek bir kombine biletle gezilir; şehir küçük ve yürünür.",
    spend:[ { c:'ticket', t:'e', n:'Kombine bilet (San Vitale, Galla Placidia, Sant’Apollinare Nuovo, Neon Vaftizhanesi, Başpiskoposluk Müzesi)', p:'10,50 €', s:'Galla Placidia ve Neon Vaftizhanesi için saat rezervasyonu şart' },
      { c:'ticket', t:'e', n:'Sant’Apollinare in Classe', p:'5 €' } ],
    tips:[ { h:'Tek bilet, beş anıt', t:'Beş anıtı ayrı ayrı değil kombine biletle gez; Galla Placidia için saati önceden ayır.' } ],
    mic:false,
    src:[ ['Ravenna’s 8 UNESCO mosaic sites — Nomads Travel Guide','https://www.nomads-travel-guide.com/self-guided-walking-tour-of-ravenna-eight-unesco-sites'] ] })
};
