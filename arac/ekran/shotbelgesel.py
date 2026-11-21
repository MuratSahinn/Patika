# Uğur böceği belgeseli kareleri: python3 ekran/shotbelgesel.py <html> <etiket>   (TS=1,2,3 ile anlar; BOS=1 örnek film)
import asyncio, sys, os
from playwright.async_api import async_playwright
SP = os.path.join(os.path.dirname(__file__), '..', 'cikti') + '/'
async def main():
  src, tag = sys.argv[1:3]; bos = os.environ.get('BOS')
  ts = [float(x) for x in os.environ.get('TS','1,3.6,5.2,6.0,6.6,7.3,8.3,10,20,52,55').split(',')]
  async with async_playwright() as p:
    b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox','--allow-file-access-from-files'])
    pg = await b.new_page(viewport={'width':390,'height':844}, device_scale_factor=1)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.route('**/*', lambda r: r.abort() if 'open-meteo' in r.request.url else r.fallback())
    await pg.goto('file://' + os.path.abspath(src)); await pg.wait_for_timeout(1500)
    await pg.evaluate("localStorage.setItem('patika:sosyal','kapali')")
    if not bos:
      await pg.evaluate("""(()=>{ const pick={tr:[['istanbul',2],['kapadokya',1]], it:[['roma',1]], gr:[['atina',1]]};
        for(const [cc,ids] of Object.entries(pick)) ids.forEach(([id,g])=>{ const c=COUNTRY_CITIES[cc].find(x=>x.id===id); const o=doneCache[id]=doneCache[id]||{}; c.days.forEach((d,di)=>d.stops.forEach((s,i)=>{ if(di<g) o[d.day+'-'+i]=true; })); }); })()""")
    info = await pg.evaluate("""(async()=>{ filmDurum.stil='belgesel'; const V=fbVeri(); window.__V=V; await fbHazirla(V);
      return { sure:V.sure, n:V.n, duraklar:V.duraklar.map(d=>d.ad), hazir:Object.entries(FB_GORSEL).filter(([k,g])=>!g.hazir).map(([k])=>k) }; })()""")
    print(info)
    for t in ts:
      await pg.evaluate("""(t)=>{ let c=document.getElementById('__c'); if(!c){ c=document.createElement('canvas'); c.id='__c'; c.width=1080; c.height=1920; document.body.appendChild(c);} fbKare(c.getContext('2d'), window.__V, t); }""", t)
      d = await pg.evaluate("document.getElementById('__c').toDataURL('image/jpeg',.85)")
      import base64; open(SP + f'{tag}-{t:05.2f}.jpg','wb').write(base64.b64decode(d.split(',')[1]))
    print('hatalar:', errs); await b.close()
asyncio.run(main())
