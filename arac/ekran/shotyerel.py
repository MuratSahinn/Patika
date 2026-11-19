# Yayın ortamı görünümü (window.storage yok): gezgin notları + bütçe "yakında"
# kullanım: shotyerel.py <html> <etiket> light|dark
import sys, asyncio
from playwright.async_api import async_playwright
import os; SP=os.environ.get('CIKTI','./cikti/')
src,tag,theme=sys.argv[1:4]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    pg=await b.new_page(viewport={'width':390,'height':844}, device_scale_factor=2)
    await pg.route('**/*', lambda r: r.abort() if 'open-meteo' in r.request.url else r.fallback())
    await pg.goto("file://"+src); await pg.wait_for_timeout(1800)
    await pg.evaluate("""document.querySelector('.country-card[data-country="tr"]').click()"""); await pg.wait_for_timeout(900)
    if theme=='dark': await pg.evaluate("document.getElementById('menuBtn').click(); document.getElementById('themeToggle').click(); document.querySelector('.am-backdrop, #menuBackdrop')&&0"); await pg.wait_for_timeout(300)
    await pg.keyboard.press('Escape'); await pg.wait_for_timeout(200)
    await pg.evaluate("document.getElementById('communityNotes').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(400)
    await pg.screenshot(path=SP+tag+'-notlar.png')
    await pg.evaluate("openBudget(COUNTRY_CITIES.tr.find(c=>c.id===activeCityId))"); await pg.wait_for_timeout(600)
    await pg.evaluate("document.getElementById('cbList').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(300)
    await pg.screenshot(path=SP+tag+'-butce.png')
    await b.close()
asyncio.run(main())
