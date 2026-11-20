# Patika · Sosyal katman (Supabase) kurulumu

Uygulama Supabase'e doğrudan bağlanır (ek kütüphane yok). Güvenlik veritabanındaki satır kuralları (RLS) ile sağlanır. Uygulamaya konan "publishable/anon" anahtarı gizli değildir; **service_role / secret anahtarı asla uygulamaya konmaz.**

## Durum

Proje kuruldu (ref `udosqdvndjmllxinxunx`, AB/İrlanda, Free). Şema çalıştırıldı, Site URL ayarlandı, uygulama bağlı. Kalan: özel SMTP (Brevo) + şablona `{{ .Token }}`.

## Bir kez yapılacaklar (Murat)

1. https://supabase.com → hesap aç → **New project** (bölge: Avrupa, örn. Frankfurt).
2. **SQL Editor** → `schema.sql` dosyasının tamamını yapıştır → **Run**.
3. **Authentication → Sign In / Providers → Email:** açık olsun.
4. **(Özel SMTP bağlandıktan sonra)** **Authentication → Emails → Magic Link** şablonunu kodla değiştir (SMTP yokken Supabase şablonu düzenletmez; uygulama o zaman e-postadaki bağlantıyla girişi kullanır), örneğin:
   ```html
   <h2>Patika giriş kodun</h2>
   <p>Bu kodu uygulamaya yaz: <strong>{{ .Token }}</strong></p>
   <p>Kodu sen istemediysen bu e-postayı yok say.</p>
   ```
   (Gerekirse aynı içeriği **Confirm signup** şablonuna da koy; yeni kullanıcılar bazen o şablonu alır.)
5. **Project Settings → API:** *Project URL* ve *publishable (anon) key* değerlerini Claude'a ver. Claude bunları `index.html`'deki `SOSYAL_CFG` alanına yazar, test eder ve yayınlar.

## Gerçek kullanıcılardan önce şart

- **E-posta servisi (SMTP):** Supabase'in kendi e-posta servisi saatte yalnızca 2 e-posta gönderir ve sadece proje ekibine ulaşır. Herkese açmadan önce **Authentication → SMTP Settings** kısmından bir e-posta servisi bağla (Brevo, Resend vb.).
- **Ücretsiz plan:** Bir hafta işlem görmeyen ücretsiz projeler duraklatılır. Gerçek kullanıcılarla Pro plan gerekir.
- **Gizlilik metni (KVKK):** E-posta ve kullanıcı içeriği toplanıyor. Hukuki metin için bir uzmana danış.

## Yayından önce deneme

Sitede tarayıcı konsolunda çalıştır, sayfayı yenile:

```
localStorage.setItem('patika:sosyal', JSON.stringify({ url:'https://<proje>.supabase.co', key:'<publishable key>' }))
```

Kaldırmak için: `localStorage.removeItem('patika:sosyal')`

## Neler var (1. adım)

| Tablo / fonksiyon | Ne yapar |
|---|---|
| `profiles` | takma ad (2–24, büyük/küçük harf farkı gözetmeden tekil), durum (≤80), ülke/şehir/gün. Herkes okuyabilir; yalnızca sahibi ekler ve günceller. E-posta burada **yok**. |
| `hesabimi_sil()` | Kullanıcı kendi hesabını siler; profili de silinir. |

Kesin konum (koordinat) hiçbir tabloda yok: durum en fazla şehir ve gün düzeyindedir.
