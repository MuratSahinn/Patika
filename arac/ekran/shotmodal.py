# kullanım: shotcard.py html tag cc cid mode(full|skip|partial)
import sys, asyncio, base64
from playwright.async_api import async_playwright
import os; SP=os.environ.get('CIKTI','./cikti/')
src,tag,cc,cid,mode=sys.argv[1:6]
STUB="""window.storage={_s:{},get:async function(k){if(!(k in this._s))throw 0;return {value:this._s[k]}},set:async function(k,v){this._s[k]=v;return {value:v}}};"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    pg=await b.new_page(viewport={'width':390,'height':844}, device_scale_factor=2)
    await pg.add_init_script(STUB)
    await pg.route('**/*', lambda r: r.abort() if 'open-meteo' in r.request.url else r.continue_())
    await pg.goto("file://"+src); await pg.wait_for_timeout(2200)
    await pg.evaluate(f"""document.querySelector('.country-card[data-country="{cc}"]').click()"""); await pg.wait_for_timeout(700)
    await pg.evaluate(f"""[...document.querySelectorAll('.city-row')].find(x=>x.dataset.city==='{cid}').click()"""); await pg.wait_for_timeout(900)
    city = f"COUNTRY_CITIES.{cc}.find(c=>c.id==='{cid}')"
    if mode=='skip':
      await pg.evaluate(f"""(()=>{{ const c={city}; const e=getEdit(c); e.skip=e.skip||{{}}; e.skip['1-1']=true; }})()""")
    js = f"""(()=>{{ const c={city}; const d=c.days[0]; doneCache[c.id]=doneCache[c.id]||{{}};
      orderedStops(c,d).forEach((o,i)=>{{ if(!o.skipped && ('{mode}'!=='partial' || i<2)) doneCache[c.id][o.key]=true; }}); }})()"""
    await pg.evaluate(js)
    await pg.evaluate(f"openRecap({city},0)"); await pg.wait_for_timeout(1100); await pg.screenshot(path=SP+tag+'-modal.png')
    data=await pg.evaluate("document.getElementById('recapCanvas').toDataURL('image/png')")
    open(SP+tag+'-recap.png','wb').write(base64.b64decode(data.split(',')[1]))
    await pg.evaluate("document.getElementById('recapModal').classList.remove('open')")
    await pg.evaluate(f"(()=>{{ const c={city}; openShare(c, c.days[0], DAY_THEME[0]); }})()"); await pg.wait_for_timeout(800)
    data=await pg.evaluate("document.getElementById('shareCanvas').toDataURL('image/png')")
    open(SP+tag+'-share.png','wb').write(base64.b64decode(data.split(',')[1]))
    await b.close()
asyncio.run(main())
