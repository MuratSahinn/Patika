# Patika Asistan — Worker kurulumu

Bu Worker, uygulama ile Anthropic API arasındaki ara katmandır. API anahtarı yalnızca burada durur; `index.html`'e asla konmaz.

## Bir kez yapılacaklar (Murat)

1. **Anthropic hesabı:** https://console.anthropic.com → API anahtarı oluştur. **Aylık harcama limiti** koy (Settings → Limits).
2. **Cloudflare hesabı:** https://dash.cloudflare.com (ücretsiz plan yeterli).
3. Bilgisayarda bu klasörde:
   ```
   npx wrangler login
   npx wrangler deploy
   npx wrangler secret put ANTHROPIC_API_KEY
   ```
   `deploy` sonunda `https://patika-ai.<hesabın>.workers.dev` gibi bir adres verir.
4. Bu adresi Claude'a ver. Claude adresi `index.html`'deki `AI_CFG.endpoint` alanına yazar, test eder ve yayınlar.

## Yayından önce deneme

Sitede tarayıcı konsolunda şunu çalıştır, sonra sayfayı yenile:

```
localStorage.setItem('patika:ai:endpoint', 'https://patika-ai.<hesabın>.workers.dev')
```

Bu ayarı silmek için: `localStorage.removeItem('patika:ai:endpoint')`

## Güvenlik

- Yalnızca `ALLOWED_ORIGIN` (https://muratsahinn.github.io) adresinden gelen istekler kabul edilir.
- IP başına dakikada 20 istek sınırı var (`wrangler.toml` → `ratelimits`).
- Sistem promptu, araçlar ve model Worker'da sabittir; istemci bunları değiştiremez.
- `Origin` başlığı tarayıcı dışından taklit edilebilir. Asıl koruma, Anthropic tarafındaki **harcama limiti**dir.

## Prompt değişikliği

Promptu ya da araçları değiştirmek için `docs/ai-prompt-patika.md`'yi düzenle, sonra repo kökünde şunları çalıştır:

```
node arac/ai/build-worker.js
npx wrangler deploy
```

`npm test`, Worker promptunun docs ile aynı olup olmadığını kontrol eder.
