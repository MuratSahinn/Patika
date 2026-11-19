import sys, asyncio
from playwright.async_api import async_playwright
import os; SP=os.environ.get('CIKTI','./cikti/')
src,tag,cc,cid,mode=sys.argv[1:6]; dark = len(sys.argv)>6 and sys.argv[6]=='dark'
STUB="""window.storage={_s:{},get:async function(k){if(!(k in this._s))throw 0;return {value:this._s[k]}},set:async function(k,v){this._s[k]=v;return {value:v}}};"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        vp={'width':1400,'height':900} if mode=='desk' else {'width':390,'height':844}
        pg=await b.new_page(viewport=vp, device_scale_factor=1 if mode=='desk' else 2)
        await pg.add_init_script(STUB)
        await pg.route('**/*', lambda r: r.abort() if 'open-meteo' in r.request.url else r.continue_())
        await pg.goto("file://"+src); await pg.wait_for_timeout(2400)
        await pg.evaluate(f"""document.querySelector('.country-card[data-country="{cc}"]').click()""")
        await pg.wait_for_timeout(800)
        await pg.evaluate(f"""(()=>{{ const r=[...document.querySelectorAll('.city-row')].find(x=>x.dataset.city==='{cid}'); r&&r.click(); }})()""")
        await pg.wait_for_timeout(900)
        if dark:
            await pg.evaluate("document.getElementById('themeToggle').click()"); await pg.wait_for_timeout(1400)
        extra = sys.argv[7] if len(sys.argv)>7 else ''
        if extra: await pg.evaluate(extra); await pg.wait_for_timeout(900)
        await pg.screenshot(path=SP+tag+'.png', full_page=False)
        await b.close()
asyncio.run(main())
