# Patika — proje notu (Claude için)

Bu dosya yeni bir sohbetin kaldığı yerden devam edebilmesi için yazıldı. Önce bunu oku.

## Kullanıcı ve çalışma kuralları
- Kullanıcı: Murat. Türkçe konuşur; kısa, net cevap ister.
- "Hata yapma, vakit alsın ama iyi olsun." Her değişiklikten sonra testleri çalıştır, ekran görüntüsüyle bak, sonra raporla.
- Gerçek ve güncel araştırma yap; **asla uydurma** (fiyat, saat, mesafe, yer). Doğrulayamadığını yazma ya da "tahmini" diye işaretle.
- Adım adım ilerle; büyük işleri gruplar halinde teslim et.
- Uygulamanın tonu sıcak, sade ama premium. Zorlama içerik yok: kaliteli öneri yoksa boş bırak.

## Uygulama
- Tek dosya: `index.html` (v2 premium). İki `<script>` bloğu: ilki gömülü qrcode kütüphanesi, ikincisi uygulama.
- PWA: `sw.js` — **her yayında `CACHE` adını artır** (şu an `patika-v2-16`).
- Yayın: GitHub Pages, `main` dalı kökü → https://muratsahinn.github.io/Patika/
- Eski sürüm: `surumler/v1/`.
- Depolama: `window.storage.get/set(k, v, shared)` (paylaşımlı anahtarlar: `cnotes:`, `cbudget:`, `cvotes:`), küçük tercihler için try/catch'li localStorage.
  - **Dikkat:** `window.storage` yalnızca Claude ortamında var; yayında (GitHub Pages) yok. Uygulama betiğinin başındaki yedek, kişisel veriyi localStorage'a yazar. Paylaşımlı veri `SHARED_ON=false` iken kapalıdır: gezgin notları ve bütçeleri "yakında" (`SHARED_SOON`) gösterir, paylaş düğmeleri gizlenir. Sosyal akışın sunucusu (Supabase) gelince paylaşımlı katman ona bağlanacak.
  - Yayın ortamı testi: `testler/kalici-test.js` (window.storage olmadan, yenileme sonrası veri kalıyor mu). Ekran: `ekran/shotyerel.py <html> <etiket> light|dark`.

### Ana veri yapıları (index.html içinde)
- `COUNTRY_CITIES` {tr, it, gr} → şehirler: `{ id, city, note, meta, days:[{day,title,tip,stops:[{name,duration,walk,coord,special,...}]}] }`. 73 şehir (TR 39, İT 20, GR 14).
- `PATIKA[cityId]` → doğa/yürüyüş rotaları: `{ updated, intro, trails:[{id,type,name,where,reach,walk,diff,months,fee,hours?,mapq,pitch,why,local,bring,safety,combine,special?}], days, sources }`. 26 şehir, 35 yer. Yeni veri `Object.assign(PATIKA, {...})` bloklarıyla `let patikaMode = false;` satırından önce eklenir.
- `BUTCE[cityId]` → "Cebin rahat" bütçesi. **Elle düzenleme**: `arac/butce/src-*.js` dosyalarını değiştir, sonra `node arac/butce/build.js index.html fiyatlar.json` çalıştır (BUTCE bloğunu index.html'e gömer ve fiyatlar.json'ı üretir; fiyatlar.json'daki daha yeni `checked` tarihli şehirleri korur).
  - Kalem: `{ c:ikon, t:'r' resmi | 'e' tahmini, n, p:turist fiyatı, pl?, y?:yerli/yerel fiyat, yl?, s?:not, src? }`
  - Uygulama açılışta `fiyatlar.json`'ı okur; daha yeni `checked` varsa onu kullanır. 60 günden eski veride uyarı çıkar.
  - Türkiye'de yerli fiyatı = T.C. vatandaşı (Bakanlık sitelerinde "Müzekart"). Kaynak: https://dosim.ktb.gov.tr/TR-218202/muze-ve-oren-yeri-ucretleri.html
- Kart motoru: `drawDayCard(canvas, city, dayIdx, 'post'|'story')`, durum `dayAchievement()`: `perfect` (hiç durak atlanmadan bitti, altın kart) · `own` (durak çıkarıldı, kalanlar bitti) · `progress` · `plan`.
- Yardımcılar: `ic(name)` SVG ikon, `trEk(isim,'acc'|'loc'|'locsin')` Türkçe ekler, `escH()` HTML kaçışı (paylaşımlı/uzak her veri kaçışlanır), `orderedStops(city, day)`, `getEdit(city)` (skip/order), `doneCache`.

## Araçlar (`arac/`)
- Kurulum: `cd arac && npm i`
- Testler: `npm test` (jsdom; hepsi "TÜMÜ GEÇTİ" demeli). Tek tek: `node testler/cr-test.js ../index.html` vb.
- Ekran görüntüsü (Playwright + Chrome): `python3 ekran/shotcr.py <html> <etiket> <tr|it|gr> <şehirId> mob|desk light|dark` → `./cikti/`. Kartlar: `ekran/shotcard.py <html> <etiket> <ülke> <şehir> full|skip|partial`.

## Otomasyon
- Zamanlanmış görev "Patika aylık fiyat güncellemesi": her ayın 1'i 10:17 (İstanbul). Sadece `fiyatlar.json`'daki resmi kalemleri kontrol eder, commit + push yapar, Murat'a özet gönderir. index.html'e dokunmaz.

## Yol haritası
1. ✅ Patika · doğa rotaları (TR, İT, GR)
2. ✅ Cebin rahat bütçe (73 şehir) + yerli/turist + resmi/tahmini + aylık güncelleme
3. ✅ Kart standardı (kusursuz gün / kendi rotan / yolda / plan)
4. ⏭ Sosyal akış (Strava benzeri): rotadaki insanların paylaşımları, profil durum güncellemesi, paylaşımı teşvik
   Sunucu: **Supabase** (auth + Postgres + RLS), kütüphanesiz doğrudan REST. Kurulum: `supabase/README.md`, şema: `supabase/schema.sql` (tekrar çalıştırılabilir).
   Plan: (1) hesap + profil → (2) gün kartını akışa paylaşma → (3) akış: "Bu rotada" + "Takip ettiklerin", alkış → (4) güvenlik: şikâyet/gizle/engelle (yayından önce şart) → (5) fotoğraflar en son. Kesin konum asla paylaşılmaz (şehir + gün). Herkese açık paylaşım yalnızca kalıcı hesapla. Yayından önce: özel SMTP, Pro plan, KVKK metni.
   ✅ (1) Hesap + profil: menüde "Gezgin Profilim" → `#profilModal`. `SOSYAL_CFG {url,key}` boşsa "yakında" (deneme için localStorage `patika:sosyal`). E-postaya 6 haneli kod (şifresiz), oturum `patika:oturum` (localStorage), 401'de token yenileme. `SOSYAL.kodGonder/kodDogrula/cikis/profilGetir/profilKaydet/hesapSil`, durum önerisi `sosyalDurumOnerisi()`. Test: `testler/sosyal-test.js` (sahte Supabase). Ekran: `ekran/shotprofil.py <html> <etiket> mob|desk light|dark off|mail|kod|yeni|profil|sil`.
   ✅ Gezgin Künyesi: profil panelinin üstünde `#spKunye` → buzlu cam asker künyesi (ülke manzarası, holografik parıltı, tamamlanan şehir mührü, kullanıcıya özel seri no `kunyeSeri(uid)`). `kunyeCiz(over)`, `kunyeVeri()` (computeStats + profil). Yazarken canlı önizleme. Sunucu yokken de yerel istatistikle görünür. (Çelik matara Murat beğenmediği için kaldırıldı.)
   ✅ Yolculuk Filmi (`#filmModal`, künyedeki "Yolculuk filmini oluştur"): 1080×1920, 13 sn. Sahneler `FILM_SAHNE`: harita kâğıdı + eş yükselti açılışı → seçilen gezgin (karınca/uğur böceği/kaplumbağa, `filmGezgin`) yılankavi patikada yürür, şehirlere mürekkep damgası (`filmDamgaGorsel`, ayrı katman), Strava benzeri CANLI sayaç → sayılar akar + mini rota → gün batımı + cam künye + patika logosu. `filmKare(ctx,V,t,tur)` saf çizim (test/ekran için), `filmVeriHazirla()` kullanıcıya göre tohumlu sabit harita. Video: `MediaRecorder` + `captureStream(30)`, MP4 öncelikli (Chrome 130+/Safari), yoksa WebM; Paylaş (Web Share, dosya) / İndir. Ekran: `ekran/shotfilm.py <html> <etiket> <hayvan> [bos]` (kareler).
   ✅ Film stili 1 — **Harita uçuşu** (`filmDurum.stil='harita'`, `fh*` fonksiyonları): Natural Earth kıyıları `FILM_HARITA` (`arac/film/harita-build.js` + world-atlas ile üretilir, ~82 KB; Murat'ın şehirleri için TR/IT/GR sınırları) + gezilen durakların gerçek `coord`'ları. `fhVeri()` (en çok gezilenden başlayıp en yakın komşu sırası, en çok 4 şehir ayrıntılı), `fhKamera(V,t)` (eğik perspektif `fhProj`, uçuşta önce uzaklaş-kay-yaklaş), `fhKare`. Yakında kaba sınır gizlenir; sokak verisi yok (uydurma yok).
   ✅ Film stili 2 — **Makro belgesel** (`filmDurum.stil='makro'`, `fm*`), **durak durak** (~45–50 sn, 10 durakta 48,8 sn): toprak zemin, çakıl/yaprak/dal, alan derinliği, benekli güneş, huzme, toz, gren, ön plan otları. Gezilen duraklardan en çok 10'u seçilir (her şehirden en az biri, kalan pay orantılı); **her durak bir yuva**, gezgin girer → içeride bekler → çıkar (`fmDurum(V,t)` evre: bekle/yuru/gir/ic/cik/bitti, `fmPoz` konum/ölçek/saydamlık). Şehirler bölüm başı: oyulmuş granit taş (`fmTas`) + üstte "N. BÖLÜM · şehir". Altta belgesel yazısı: "DURAK i/n", durak adı, şehir · süre · gün, yuva türü. Hayvana göre yuvalar `FM_YUVA` (duraktan durağa döner): karınca tümsek/taşaltı/çam iğnesi/kök arası · uğur böceği kıvrık yaprak (tüp, öbür uçtan çıkar)/papatya (konar, `FM_KONAK`)/ağaç kabuğu/yosun · kaplumbağa toprak in/kaya kovuğu/çalı dibi/kütük (tüp). `fmYuvaCiz(ctx,y,on)` arka + ön (gezginin üstüne binen) parça; yardımcılar `fmBlob`, `fmAO`, `fmTopak`, `fmTumsek`, `fmKayaGovde`, `fmDelik`, `fmToz`. Gezginler `fmGezgin` → `fmKarinca`, `fmUgurDetay`, `fmKaplumbagaDetay` (gerçek plak dizilimi). `fmVeri(tur)`, `fmKamera` (yuvada yakınlaşır, taşta genişler, sonda geri çekilip izi gösterir). Ekran: `ekran/shotmakro.py <html> <etiket> [karinca|ugur|kaplumbaga]` (TS=... ile anlar). Stil seçimi localStorage `patika:film-stil`; yol arkadaşı iki stilde de seçilir. Eski "kurgu patika" stili (`filmKare`/`filmVeriHazirla`) artık arayüzde yok, ölü kod — temizlenebilir.
   ✅ Video: önce **WebCodecs + mp4-muxer (MIT, gömülü)** ile kare kare 30 fps H.264 MP4 (`filmKodla`), yoksa `MediaRecorder` yedeği (`filmKaydetCanli`). Ekran: `ekran/shotharita.py <html> <etiket>` (TS=... ile belirli anlar).
   Önizleme linki (Murat telefondan bakar): artifact "Patika · Önizleme" https://claude.ai/artifact/GzHGaWeL4YoVhvT7nGbdAC (slug 8178802b-3ff3-4a77-bf77-98fd46b77105). Yeniden üret: `python3 arac/onizleme/build.py <çıktı>` (index.html + `arac/onizleme/demo.html` sahte sunucu, kod 123456) → publish_files ile aynı slug'a yayınla. **Her güncellemeden sonra önizlemeyi güncelle ve linki Murat'a kendiliğinden paylaş (Murat'ın kalıcı isteği).**
   ✅ Supabase projesi kuruldu (2026-11-20, Claude tarayıcıdan): org "MuratSahinn's OrgPatika" (Free), proje `patika`, ref `udosqdvndjmllxinxunx`, AB (eu-west-1 İrlanda). `schema.sql` çalıştırıldı. Auth → URL Configuration → Site URL = https://muratsahinn.github.io/Patika/ . `SOSYAL_CFG` gerçek URL + publishable key (gizli anahtar asla). Testler için `localStorage 'patika:sosyal'='kapali'` sunucuyu kapatır.
   Giriş: özel SMTP yokken Supabase şablonu düzenletmiyor → e-postada 6 haneli kod değil **giriş bağlantısı** gelir; uygulama ikisini de kabul eder (`SOSYAL.baglantidanGiris()`: `#access_token=…` okur, `/auth/v1/user`, adresi temizler, paneli açar). Varsayılan e-posta servisi saatte 2 e-posta ve yalnızca org üyelerine gider → herkese açmadan önce Brevo (300/gün ücretsiz) SMTP + şablona `{{ .Token }}`.
   ⏭ Sonra (2). Gezgin notları/bütçeleri (eski `window.storage` paylaşımlı katman) de Supabase'e taşınacak; topluluk adı (`ensureUserName`) profil takma adına bağlanacak.
5. ⏭ Yapay zekâ: çok şehirli planlama ve sohbetle rota düzenleme. Murat'ın taslak promptu: `docs/ai-prompt-v3.md`.
   Değerlendirme özeti: ilkeler iyi; ama olmayan arka uca (place_id, rota motoru, rezervasyon) atıf yapıyor, uzun ve tekrarlı, JSON şeması tanımsız, asıl iki işi (çok şehir planı, rota düzenleme) merkeze almıyor. Plan: Patika'ya uyarlanmış kısa prompt + gerçek araçlar (şehir getir, durak çıkar/ekle/sırala, gezi planına ekle, patika ve bütçe getir); değişiklikler "Uygula / Vazgeç" kartıyla onaylanır. API anahtarı HTML'e konmaz: Cloudflare Worker gibi bir ara katman. Gerekenler: Anthropic API hesabı + Cloudflare hesabı.
   ✅ Uyarlanmış prompt + araç şeması: `docs/ai-prompt-patika.md` (v4). Yeni yer ekleme v1'de yok (sadece çıkar/geri al/sırala).
   ✅ Uygulama tarafı (index.html): menüde "Patika Asistan" → `#aiModal`. `AI_CFG.endpoint` boşsa "yakında" durumu. Okuma araçları `AI_TOOLS`, değişiklik doğrulama `aiSimulate` (toplu, sanal kopya), uygulama `aiCommit` + "Geri al" (`aiRestore`, model bir sonraki mesajda notla haberdar edilir). Sohbet geçmişi sadece oturumda (`aiState`). Model metni `escH` + sınırlı biçim (`aiFormat`).
   ✅ Worker: `worker/` (prompt+araçlar+model Worker'da sabit; `node arac/ai/build-worker.js` docs'tan gömer). Kurulum: `worker/README.md`.
   ⏭ Sıradaki: Murat Anthropic + Cloudflare hesabı açıp `wrangler deploy` yapar → Worker adresi `AI_CFG.endpoint`'e yazılır → gerçek modelle uçtan uca deneme. Yayından önce deneme: localStorage `patika:ai:endpoint`.
   Test: `testler/ai-test.js` (npm test içinde). Ekran: `python3 ekran/shotai.py <html> <etiket> mob|desk light|dark off|card|applied` (sahte model yanıtıyla).

## Bekleyen küçük fikirler
Eski rota kartı stilinin yenilenmesi, hava durumu ikonu, günlükte fotoğraflar, topluluk notları için "şikâyet et" düğmesi (yayına açmadan önce önemli), daha fazla el çizimi siluet.
