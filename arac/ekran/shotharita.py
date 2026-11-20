# Harita uçuşu filminin kareleri. kullanım: shotharita.py <html> <etiket> [bos]
import sys, asyncio, base64, json
from playwright.async_api import async_playwright
import os; SP=os.environ.get('CIKTI','./cikti/')
src,tag=sys.argv[1:3]; bos=len(sys.argv)>3
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    pg=await b.new_page(viewport={'width':390,'height':844}, device_scale_factor=2)
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.route('**/*', lambda r: r.abort() if 'open-meteo' in r.request.url else r.fallback())
    await pg.goto("file://"+src); await pg.wait_for_timeout(1800)
    await pg.evaluate("""document.querySelector('.country-card[data-country="tr"]').click()"""); await pg.wait_for_timeout(800)
    if not bos:
      await pg.evaluate("""(()=>{ const pick={tr:[['istanbul',2],['kapadokya',1]], it:[['roma',1]], gr:[['atina',1]]};
        for(const [cc,ids] of Object.entries(pick)) ids.forEach(([id,g])=>{ const c=COUNTRY_CITIES[cc].find(x=>x.id===id); if(!c) return;
          const o=doneCache[id]=doneCache[id]||{}; c.days.forEach((d,di)=>d.stops.forEach((s,i)=>{ if(di<g) o[d.day+'-'+i]=true; })); });
        sosyal.profil={ takma_ad:'Gezgin Murat', ulke:'tr' }; })()""")
    await pg.evaluate("document.fonts.ready")
    info = await pg.evaluate("(()=>{ const V=fhVeri(); return { sure:V.sure, sehir:V.detay.map(s=>s.ad+':'+s.duraklar.length), seg:V.seg.map(s=>s.tip+' '+s.t0.toFixed(1)) }; })()")
    print(json.dumps(info, ensure_ascii=False))
    ts = [float(x) for x in os.environ.get('TS','').split(',')] if os.environ.get('TS') else [round(info['sure']*f,2) for f in (0.06,0.14,0.2,0.27,0.33,0.42,0.55,0.7,0.86,0.99)]
    import time
    for t in ts:
      t0=time.time()
      data = await pg.evaluate("""(t)=>{ const c=document.createElement('canvas'); c.width=1080; c.height=1920;
        const V=fhVeri(); const a=performance.now(); fhKare(c.getContext('2d'), V, t, 'karinca'); window.__ms=performance.now()-a; return c.toDataURL('image/png'); }""", t)
      ms = await pg.evaluate("window.__ms")
      open(SP+tag+'-%05.2f.png' % t,'wb').write(base64.b64decode(data.split(',')[1]))
      print('t=%.2f %.0f ms' % (t, ms))
    print('hatalar:', errs)
    await b.close()
asyncio.run(main())
