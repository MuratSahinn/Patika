# Patika

Türkiye, İtalya ve Yunanistan'ı şehir şehir gezdiren rota uygulaması. Tek HTML dosyası, çevrimdışı çalışır (PWA).

## Dosyalar
- `index.html` — uygulamanın tamamı (v2 premium)
- `sw.js` — çevrimdışı önbellek; her sürümde `CACHE` adı artırılır
- `fiyatlar.json` — "Cebin rahat" bütçe verisi. Uygulama açılışta bu dosyayı okur; içindeki şehrin `checked` tarihi gömülü veriden yeniyse onu kullanır
- `surumler/v1/` — eski klasik sürüm

## fiyatlar.json kuralları
- Her şehir: `checked` (YYYY-AA-GG), `tiers` (tam 3 seviye), `spend`, `tips`, `traps`, `sources`
- `spend[].t`: `"r"` resmi tarife, `"e"` tahmini aralık
- `spend[].p` turist/yabancı fiyatı, `spend[].y` yerli/yerel fiyatı (varsa), `pl`/`yl` kısa etiketler
- Sadece doğrulanmış resmi fiyatlar `"r"` olarak işaretlenir; emin olunamayan değer değiştirilmez
