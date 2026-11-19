/* Cebin rahat — Türkiye (pilotlar dışındaki 33 şehir)
   Resmi biletler: Kültür ve Turizm Bakanlığı DÖSİMM ücret listesi (19 Kasım 2026'da okundu)
   Günlük aralık: Wego "Is Türkiye Cheap? 2026" (Türkiye geneli) */
const KTB = 'https://dosim.ktb.gov.tr/TR-218202/muze-ve-oren-yeri-ucretleri.html';
const WEGO = 'https://blog.wego.com/is-turkey-cheap/';
const C = '2026-11-19';
const S_KTB = ['Müze ve ören yeri ücretleri — Kültür ve Turizm Bakanlığı (DÖSİMM)', KTB];
const S_WEGO = ['Is Türkiye Cheap? 2026 — Wego', WEGO];
const S_MK = ['Müzekart ücretleri değişiyor — Alo Maliye','https://www.alomaliye.com/2026/11/11/muzekart-ucretleri-degisiyor/'];
function tiers(sahil){
  return {
    tierNote: 'Kişi başı · günlük · uçak hariç · Türkiye geneli için kaynak aralığı' + (sahil ? '; yaz sezonunda sahil kentleri üst uca yaklaşır' : ', şehre göre oynar'),
    tierNoteY: 'T.C. vatandaşı olarak ören yeri ve müzeleri Müzekart’la gezersen bilet payın neredeyse sıfırlanır.',
    tiers: [
      { k:'Hesaplı', v:'25–45 €', inc:'Pansiyon ya da hostel, lokanta, toplu taşıma, ücretsiz yerler.' },
      { k:'Orta', v:'55–90 €', inc:'Butik otel, oturarak yemekler, birkaç müze ve bir tur.' },
      { k:'Rahat', v:'120–300+ €', inc:'İyi otel, özel transfer ve turlar, restoran akşamları.' }
    ]
  };
}
const MK_TIP = { h:'Müzekart ilk günden kendini çıkarır', t:"Bakanlığa bağlı ören yeri ve müzelere T.C. vatandaşları Müzekart'la giriyor. 1 Aralık 2026'dan itibaren Müzekart+ 300 TL, bir yıl geçerli; her yere yılda iki giriş." };
const FREE_TIP = { h:'Ücretsiz girenler', t:'18 yaş altı ve 65 yaş üstü T.C. vatandaşları müze ve ören yerlerine ücretsiz giriyor.' };
const r = (n, p, s) => ({ c:'ticket', t:'r', n, p, y:'Müzekart', s, src:KTB });
function city(o){
  return Object.assign({ checked:C }, tiers(o.sahil), {
    intro:o.intro, spend:o.spend||[], tips:(o.tips||[]).concat(o.noMK ? [] : [MK_TIP]), traps:o.traps||[],
    sources:[S_KTB].concat(o.src||[], [S_WEGO, S_MK])
  });
}
module.exports = {
  antalya: city({ sahil:true,
    intro:"Antalya'da şehir merkezi büyük ölçüde ücretsiz gezilir: Kaleiçi, Hadrian Kapısı ve Düden. Para antik kentlere ve yaz sezonunda otele gider.",
    spend:[ r('Aspendos Tiyatrosu','15 €'), r('Perge','11 €'), r('Phaselis','10 €'), r('Termessos','3 €'),
      { c:'bed', t:'e', n:'4 yıldızlı otel (gecelik)', p:'80–120 €', s:'Sezon dışı; yaz zirvesinde 200 €’ya kadar çıkıyor' } ],
    tips:[ { h:'Kaleiçi ve Düden bedava', t:'Kaleiçi sokakları, Hadrian Kapısı, Karaalioğlu Parkı ve Düden Şelalesi için bilet gerekmiyor.' } ],
    traps:[ 'Antalya Müzesi Bakanlık listesinde KAPALI görünüyor; gitmeden durumunu kontrol et.' ] }),
  bodrum: city({ sahil:true,
    intro:"Bodrum'da asıl masraf yazın konaklama ve beach club'lardır. Kalenin içindeki Sualtı Arkeoloji Müzesi tek büyük bilet; antik tiyatro ücretsiz.",
    spend:[ r('Bodrum Sualtı Arkeoloji Müzesi (Kale)','20 €'),
      { c:'ticket', t:'r', n:'Antik Tiyatro', p:'ücretsiz', src:KTB } ],
    tips:[ { h:'Gün batımını Gümüşlük’te bedavaya izle', t:'Gümüşlük sahili ve Myndos Kapısı için ücret yok; yemek fiyatları ise koy kenarında yükseliyor.' }, FREE_TIP ] }),
  marmaris: city({ sahil:true,
    intro:"Marmaris'te bütçeyi tekne turları ve sahil sezonu belirler. Akyaka ve Azmak gibi doğal güzellikler için ise para gerekmez.",
    tips:[ { h:'Azmak’ı yürüyerek gez', t:'Akyaka sahili ve Azmak Nehri kıyısı ücretsiz yürünüyor; tekne turu tercih meselesi.' } ] }),
  fethiye: city({ sahil:true,
    intro:"Fethiye'de en büyük kalem Babadağ'dan yamaç paraşütü. Kayaköy ve kaya mezarları ise birkaç euroya ya da Müzekart'la gezilir.",
    spend:[ { c:'walk', t:'e', n:'Babadağ tandem yamaç paraşütü', p:'140–250 $', s:'25–45 dakika uçuş · Nisan–Ekim en iyi dönem' },
      r('Kayaköy Ören Yeri','3 €'), r('Tlos','3 €') ],
    tips:[ { h:'Amintas’ta gün batımı bedava', t:'Amintas Kaya Mezarları çevresinden Fethiye körfezine gün batımı izlemek ücretsiz.' } ],
    src:[ ['Ölüdeniz Paragliding 2026 — My Turkey Adventure','https://myturkeyadventure.com/s/oludeniz-paragliding-experience-2026'] ] }),
  kusadasi: city({ sahil:true,
    intro:"Kuşadası gezisinin kalbi Efes ve en büyük bilet de orası. Yamaçevler ayrı ücretli; Şirince'de dolaşmak ise ücretsiz.",
    spend:[ r('Efes Örenyeri','40 €','Efes Deneyim Müzesi dahil · 2027 tarifesinde 45 €'),
      { c:'ticket', t:'r', n:'Efes Yamaçevler', p:'15 €', y:'200 TL', s:'Müzekart burada geçmiyor; T.C. vatandaşına Müzekart’la indirimli bilet', src:KTB },
      { c:'ticket', t:'e', n:'Ege Müze Kartı (Museum Pass Aegean)', p:'95 €', s:'7 gün, Efes ve Pamukkale dahil 40’tan fazla yer · yabancılar için' } ],
    tips:[ { h:'Kruvaziyer saatlerinden kaç', t:'Efes’e sabah 08:00’de ya da 15:30’dan sonra gir; gemi grupları 10:00–15:00 arası geliyor.' } ],
    src:[ ['Ephesus 2026 — Loudavým krokem','https://loudavymkrokem.cz/en/ephesus-turkey-ancient-city/'] ] }),
  edirne: city({
    intro:"Edirne'de Selimiye ve büyük camiler ücretsiz; bütçenin keyifli kalemi tava ciğer masası.",
    tips:[ { h:'Camiler ücretsiz', t:'Selimiye, Eski Cami ve Üç Şerefeli Cami’ye giriş ücretsiz; namaz vakitlerine denk gelmemeye dikkat et.' } ], noMK:true }),
  izmir: city({ sahil:true,
    intro:"İzmir'i gezmek neredeyse bedava: Kemeraltı, Kordon ve Asansör. Karşıya vapurla geçmek şehrin en ucuz turu.",
    tips:[ { h:'Vapur en güzel tur', t:'Konak–Karşıyaka vapuru toplu taşıma bileti fiyatına körfez turu demek.' } ], noMK:true }),
  ankara: city({
    intro:"Ankara'da Anıtkabir ücretsiz; Anadolu Medeniyetleri Müzesi şehrin tek büyük bileti. Hamamönü ve kale çevresi yürüyerek gezilir.",
    spend:[ r('Anadolu Medeniyetleri Müzesi','12 €') ],
    tips:[ { h:'Anıtkabir ücretsiz', t:'Anıtkabir ve müzesi için bilet yok.' }, FREE_TIP ],
    traps:[ 'Anadolu Medeniyetleri Müzesi’nin salonları 14 Eylül 2026–2 Mart 2027 arası kapalı; gitmeden kontrol et.' ] }),
  mardin: city({
    intro:"Mardin'de taş sokaklar, medreseler ve çarşı ücretsiz dolaşılır. Dara ören yeri de ücretsiz; tek bilet Mardin Müzesi.",
    spend:[ r('Mardin Müzesi','7 €','Pazartesi kapalı'),
      { c:'ticket', t:'r', n:'Dara Ören Yeri', p:'ücretsiz', s:'Pazartesi kapalı', src:KTB } ],
    tips:[ { h:'Pazartesi’yi Dara’ya ayırma', t:'Dara ve Mardin Müzesi pazartesi kapalı; programı buna göre kur.' } ] }),
  trabzon: city({
    intro:"Trabzon'da bütçenin büyük kısmı ulaşıma gider: Sümela ve yaylalar şehir dışında. Ayasofya Camii ve Boztepe ücretsiz.",
    spend:[ r('Sümela Manastırı','20 €') ],
    tips:[ { h:'Boztepe bedava manzara', t:'Boztepe’den şehir ve deniz manzarası ücretsiz; çay bahçesinde otur.' } ] }),
  bursa: city({
    intro:"Bursa'da Ulu Cami, Koza Han ve Yeşil Türbe ücretsiz gezilir. Para, Cumalıkızık kahvaltısına ve hamam ritüeline gider.",
    tips:[ { h:'Camiler ve hanlar ücretsiz', t:'Ulu Cami, Koza Han ve Yeşil Türbe için bilet yok.' } ], noMK:true }),
  konya: city({
    intro:"Konya'nın en büyük durağı Mevlana Müzesi ücretsiz. Karatay Medresesi (Çini Eserleri Müzesi) küçük bir bilet.",
    spend:[ { c:'ticket', t:'r', n:'Mevlana Müzesi', p:'ücretsiz', src:KTB }, r('Karatay Medresesi (Çini Eserleri Müzesi)','3 €') ],
    tips:[ FREE_TIP ] }),
  sanliurfa: city({
    intro:"Şanlıurfa'da Balıklıgöl ve çarşı ücretsiz; büyük bilet Göbeklitepe. Halfeti tekne turu ayrıca ödenir.",
    spend:[ r('Göbeklitepe','20 €'), { c:'ticket', t:'r', n:'Harran', p:'ücretsiz', s:'Bakanlık listesinde KAPALI notu var', src:KTB } ],
    tips:[ FREE_TIP ],
    traps:[ 'Harran Bakanlık listesinde KAPALI görünüyor; gitmeden durumunu sor.' ] }),
  gaziantep: city({
    intro:"Gaziantep'te para müzeden çok sofraya gider. Zeugma Mozaik Müzesi tek büyük bilet; çarşılar ve Kültür Yolu ücretsiz.",
    spend:[ r('Zeugma Mozaik Müzesi','12 €') ],
    tips:[ { h:'Çarşılar bedava, sofra değil', t:'Bakırcılar Çarşısı ve Kültür Yolu ücretsiz dolaşılır; bütçeyi kahvaltı ve kebap durakları için ayır.' } ] }),
  alanya: city({ sahil:true,
    intro:"Alanya'da kale ve Kızılkule şehrin kalbi. Sahil sezonunda konaklama pahalanır; kale bileti ise küçük.",
    spend:[ r('Alanya Kalesi','12 €'),
      { c:'bed', t:'e', n:'4 yıldızlı otel (gecelik)', p:'80–120 €', s:'Sezon dışı; yaz zirvesinde 200 €’ya kadar çıkıyor' } ],
    tips:[ FREE_TIP ] }),
  pamukkale: city({
    intro:"Pamukkale'de tek bilet travertenleri ve Hierapolis'i birlikte açar. Antik havuz ayrı ücretli.",
    spend:[ r('Hierapolis + Pamukkale travertenleri','30 €','Tek biletle ikisi birden'),
      { c:'ticket', t:'e', n:'Kleopatra Antik Havuzu', p:'~15 $', s:'Su sürekli 36 °C · Müzekart geçmiyor, ayrı ödenir' } ],
    tips:[ { h:'Gün batımına kal', t:'Hierapolis bileti travertenleri de kapsıyor; gün batımına kadar kalmak ekstra ücret istemiyor.' } ],
    src:[ ['Cleopatra’s Pool 2026 — My Turkey Adventure','https://myturkeyadventure.com/blog/cleopatras-pool-pamukkale-worth-it-honest-review-2026'] ] }),
  canakkale: city({
    intro:"Çanakkale'de Gelibolu Tarihi Alanı ve Kordon ücretsiz. Truva tek büyük bilet ve müzesiyle birlikte gezilir.",
    spend:[ r('Truva Ören Yeri + Truva Müzesi','27 €','Tek biletle ikisi birden') ],
    tips:[ FREE_TIP ] }),
  safranbolu: city({
    intro:"Safranbolu'nun en güzel yanı sokakları ve Hıdırlık Tepesi; ikisi de ücretsiz. Konaklarda küçük giriş ücretleri olabilir.",
    tips:[ { h:'Kiremit denizi bedava', t:'Hıdırlık Tepesi’nden çarşı manzarası ücretsiz.' } ], noMK:true }),
  rize: city({
    intro:"Rize'de doğa ücretsiz: Fırtına Vadisi, taş köprüler ve çay bahçeleri. Bütçe ulaşım ve yayla konaklamasına gider.",
    tips:[ { h:'Araçla ya da minibüsle', t:'Fırtına Vadisi ve köprüler ücretsiz; para çoğunlukla ulaşıma gidiyor.' } ], noMK:true }),
  amasya: city({
    intro:"Amasya küçük ve yürünür: Yalıboyu, Kral Kaya Mezarları manzarası ve gece aydınlatması. Bütçe dostu bir şehir.",
    tips:[ { h:'Gece ışıkları bedava', t:'Yalıboyu evleri ve kaya mezarlarının gece aydınlatması nehir kıyısından ücretsiz izleniyor.' } ], noMK:true }),
  mersin: city({ sahil:true,
    intro:"Mersin'de Cennet ve Cehennem obrukları en bilinen bilet. Kızkalesi'ne denizden geçmek ayrıca ödenir.",
    spend:[ r('Cennet ve Cehennem Obrukları','12 €') ],
    tips:[ FREE_TIP ] }),
  adana: city({
    intro:"Adana'da Taşköprü, Büyük Saat ve çarşılar ücretsiz gezilir; bütçenin keyifli kalemi kebap sofrası.",
    tips:[ { h:'Tarihi merkez ücretsiz', t:'Taşköprü, Büyük Saat, Ulu Cami ve Kazancılar Çarşısı için bilet yok.' } ], noMK:true }),
  diyarbakir: city({
    intro:"Diyarbakır'da surlar, Ulu Cami ve hanlar ücretsiz gezilir. Dengbêj Evi ve On Gözlü Köprü de öyle.",
    tips:[ { h:'Sur içi ücretsiz', t:'Ulu Cami, Dört Ayaklı Minare ve Sülüklü Han’da bilet yok; surlar boyunca yürümek de ücretsiz.' } ], noMK:true }),
  kayseri: city({
    intro:"Kayseri'de kale, çarşı ve Kültepe ücretsiz. Para mantıya ve Erciyes'e gider.",
    spend:[ { c:'ticket', t:'r', n:'Kültepe (Kaniş) Höyüğü', p:'ücretsiz', src:KTB } ],
    tips:[ FREE_TIP ] }),
  eskisehir: city({
    intro:"Eskişehir'de Odunpazarı sokakları ve Porsuk kıyısı ücretsiz. OMM ve lületaşı atölyeleri ayrıca ödenir.",
    tips:[ { h:'Odunpazarı bedava', t:'Odunpazarı evleri ve Porsuk kıyısı ücretsiz dolaşılır.' } ], noMK:true }),
  bolu: city({
    intro:"Bolu'da göller ve orman yolları bütçenin değil, zamanın meselesi. Masraf çoğunlukla konaklama ve ulaşım.",
    tips:[ { h:'Hafta içi git', t:'Abant ve Yedigöller hafta sonları kalabalıklaşır; hafta içi çok daha sakin.' } ], noMK:true }),
  sivas: city({
    intro:"Sivas'ta Selçuklu medreseleri meydanın çevresinde, büyük kısmı ücretsiz gezilir. Divriği için ayrı bir gün ayır.",
    tips:[ { h:'Divriği Ulu Camii ibadete açık', t:'Divriği Ulu Camii ve Darüşşifası cami olarak ziyaret edilir; ulaşım için ayrı gün planla.' } ], noMK:true }),
  erzurum: city({
    intro:"Erzurum'da Çifte Minareli, Yakutiye ve kale yürüyerek gezilir. Kışın bütçeyi Palandöken belirler.",
    tips:[ { h:'Merkez yürünür', t:'Çifte Minareli Medrese, Yakutiye ve Taşhan birbirine yürüme mesafesinde.' } ], noMK:true }),
  van: city({
    intro:"Van'da kale ve Kahvaltı Sokağı şehrin içinde; Akdamar Adası için bilet ve tekne ayrıca ödenir.",
    spend:[ r('Akdamar Anıt Müzesi','12 €','Adaya tekne ayrıca ödenir (Gevaş ve Edremit iskeleleri)'), r('Van Kalesi','3 €') ],
    tips:[ FREE_TIP ] }),
  samsun: city({ sahil:true,
    intro:"Samsun'da sahil, Amisos Tepesi ve Kızılırmak Deltası'nda kuş gözlemi bütçeyi zorlamaz.",
    tips:[ { h:'Delta’da şafak', t:'Kızılırmak Deltası’nda kuş gözlemi için en iyi saat şafak; erken çık.' } ], noMK:true }),
  datca: city({ sahil:true,
    intro:"Datça'da koylar ve Eski Datça sokakları ücretsiz. Knidos küçük bir bilet; asıl masraf yazın konaklama.",
    spend:[ r('Knidos','5 €') ],
    tips:[ FREE_TIP ] }),
  ayvalik: city({ sahil:true,
    intro:"Ayvalık'ta çarşı, Cunda ve Şeytan Sofrası ücretsiz. Bütçe sahil sezonunda konaklamaya ve dalış gibi deneyimlere gider.",
    tips:[ { h:'Gün batımı Şeytan Sofrası’nda', t:'Şeytan Sofrası’ndan gün batımı ücretsiz; erken git, yer kalabalıklaşıyor.' } ], noMK:true }),
  assos: city({ sahil:true,
    intro:"Assos'ta Behramkale köyü ücretsiz; Athena Tapınağı ve antik kent tek bilet.",
    spend:[ r('Assos Örenyeri','11 €') ],
    tips:[ FREE_TIP ] }),
  kars: city({
    intro:"Kars'ta Ani tek büyük bilet. Kışın Çıldır'da atlı kızak ve yerel kaz yemeği bütçenin keyifli kalemleri.",
    spend:[ r('Ani Örenyeri','8 €') ],
    tips:[ FREE_TIP ] }),
  adiyaman: city({
    intro:"Adıyaman'da Nemrut zirvesi tek büyük bilet. Cendere Köprüsü ve Karakuş Tümülüsü yol üstünde.",
    spend:[ r('Nemrut Dağı','10 €') ],
    tips:[ { h:'Gün doğumu için sıcak giyin', t:'Zirvede şafak yazın bile soğuk olur; yanına mont al.' } ] }),
  hatay: city({
    intro:"Hatay'da Arkeoloji Müzesi ve St. Pierre Bakanlık listesinde kapalı görünüyor; Uzun Çarşı ve künefe durağı ise açık.",
    spend:[ r('Hatay Arkeoloji Müzesi','11 €','Bakanlık listesinde KAPALI'), r('St. Pierre Kilisesi','8 €','Bakanlık listesinde KAPALI') ],
    traps:[ 'Arkeoloji Müzesi ve St. Pierre Bakanlık listesinde KAPALI görünüyor; gitmeden kontrol et.' ] }),
  kas: city({ sahil:true,
    intro:"Kaş'ta antik tiyatroda gün batımı ve Kaputaş ücretsiz. Bütçe Kekova tekne turuna ve deniz kayağına gider.",
    spend:[ { c:'boat', t:'e', n:'Kekova Batık Şehir tekne turu', p:'~99 $', s:'Yaklaşık 4,5 saat · öğle yemeği dahil' }, r('Simena (Kaleköy) Örenyeri','4 €') ],
    tips:[ { h:'Antik tiyatro ücretsiz', t:'Kaş merkezdeki antik tiyatrodan gün batımı izlemek ücretsiz.' } ],
    src:[ ['Kekova tekne turu — Headout','https://www.headout.com/tr/sightseeing-cruises/from-kas-kekova-sunken-city-5-bays-and-kalekoy-boat-cruise-with-lunch-e-50682/'] ] })
};
