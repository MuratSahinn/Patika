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
- PWA: `sw.js` — **her yayında `CACHE` adını artır** (şu an `patika-v2-7`).
- Yayın: GitHub Pages, `main` dalı kökü → https://muratsahinn.github.io/Patika/
- Eski sürüm: `surumler/v1/`.
- Depolama: `window.storage.get/set(k, v, shared)` (paylaşımlı anahtarlar: `cnotes:`, `cbudget:`, `cvotes:`), küçük tercihler için try/catch'li localStorage.

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
5. ⏭ Yapay zekâ: çok şehirli planlama ve sohbetle rota düzenleme. Murat'ın taslak promptu: `docs/ai-prompt-v3.md`.
   Değerlendirme özeti: ilkeler iyi; ama olmayan arka uca (place_id, rota motoru, rezervasyon) atıf yapıyor, uzun ve tekrarlı, JSON şeması tanımsız, asıl iki işi (çok şehir planı, rota düzenleme) merkeze almıyor. Plan: Patika'ya uyarlanmış kısa prompt + gerçek araçlar (şehir getir, durak çıkar/ekle/sırala, gezi planına ekle, patika ve bütçe getir); değişiklikler "Uygula / Vazgeç" kartıyla onaylanır. API anahtarı HTML'e konmaz: Cloudflare Worker gibi bir ara katman. Gerekenler: Anthropic API hesabı + Cloudflare hesabı.
   ✅ Uyarlanmış prompt + araç şeması: `docs/ai-prompt-patika.md` (v4). Yeni yer ekleme v1'de yok (sadece çıkar/geri al/sırala).
   ✅ Uygulama tarafı (index.html): menüde "Patika Asistan" → `#aiModal`. `AI_CFG.endpoint` boşsa "yakında" durumu. Okuma araçları `AI_TOOLS`, değişiklik doğrulama `aiSimulate` (toplu, sanal kopya), uygulama `aiCommit` + "Geri al" (`aiRestore`, model bir sonraki mesajda notla haberdar edilir). Sohbet geçmişi sadece oturumda (`aiState`). Model metni `escH` + sınırlı biçim (`aiFormat`).
   ✅ Worker: `worker/` (prompt+araçlar+model Worker'da sabit; `node arac/ai/build-worker.js` docs'tan gömer). Kurulum: `worker/README.md`.
   ⏭ Sıradaki: Murat Anthropic + Cloudflare hesabı açıp `wrangler deploy` yapar → Worker adresi `AI_CFG.endpoint`'e yazılır → gerçek modelle uçtan uca deneme. Yayından önce deneme: localStorage `patika:ai:endpoint`.
   Test: `testler/ai-test.js` (npm test içinde). Ekran: `python3 ekran/shotai.py <html> <etiket> mob|desk light|dark off|card|applied` (sahte model yanıtıyla).

## Bekleyen küçük fikirler
Eski rota kartı stilinin yenilenmesi, hava durumu ikonu, günlükte fotoğraflar, topluluk notları için "şikâyet et" düğmesi (yayına açmadan önce önemli), daha fazla el çizimi siluet.
