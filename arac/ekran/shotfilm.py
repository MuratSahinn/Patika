# Yolculuk filmi kareleri. kullanım: shotfilm.py <html> <etiket> <karinca|ugur|kaplumbaga> [bos]
# Belirli anlardaki kareleri PNG olarak yazar: <etiket>-t<sn>.png
import sys, asyncio, base64
from playwright.async_api import async_playwright
import os; SP=os.environ.get('CIKTI','./cikti/')
src,tag,pet=sys.argv[1:4]; bos=len(sys.argv)>4
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    pg=await b.new_page(viewport={'width':390,'height':844}, device_scale_factor=2)
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.route('**/*', lambda r: r.abort() if 'open-meteo' in r.request.url else r.fallback())
    await pg.goto("file://"+src); await pg.wait_for_timeout(1800)
    await pg.evaluate("""document.querySelector('.country-card[data-country="tr"]').click()"""); await pg.wait_for_timeout(800)
    if not bos:
      await pg.evaluate("""(()=>{ const pick={tr:['istanbul','kapadokya','mardin'], it:['roma','floransa'], gr:['atina']};
        for(const [cc,ids] of Object.entries(pick)) ids.forEach(id=>{ const c=COUNTRY_CITIES[cc].find(x=>x.id===id); if(!c) return;
          const o=doneCache[id]=doneCache[id]||{}; c.days.forEach((d,di)=>d.stops.forEach((s,i)=>{ if(di<2) o[d.day+'-'+i]=true; })); });
        sosyal.profil={ takma_ad:'Gezgin Murat', durum:"İstanbul'da · 1. gün", ulke:'tr' }; })()""")
    await pg.evaluate("document.fonts.ready")
    for t in [1.2, 3.6, 5.6, 8.0, 9.2, 10.9, 12.9]:
      data = await pg.evaluate("""(t)=>{ const c=document.createElement('canvas'); c.width=1080; c.height=1920;
        const V=filmVeriHazirla(); filmKare(c.getContext('2d'), V, t, '%s'); return c.toDataURL('image/png'); }""" % pet, t)
      open(SP+tag+'-t%s.png' % str(t).replace('.','_'),'wb').write(base64.b64decode(data.split(',')[1]))
    print('hatalar:', errs)
    await b.close()
asyncio.run(main())
