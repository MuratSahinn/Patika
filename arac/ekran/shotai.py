# kullanım: shotai.py <html> <etiket> mob|desk light|dark off|card|applied
import sys, asyncio, json
from playwright.async_api import async_playwright
import os; SP=os.environ.get('CIKTI','./cikti/')
src,tag,dev,theme,state=sys.argv[1:6]
STUB="""window.storage={_s:{},get:async function(k){if(!(k in this._s))throw 0;return {value:this._s[k]}},set:async function(k,v){this._s[k]=v;return {value:v}}};"""
SCRIPT=[
 {"content":[{"type":"text","text":"İlk günün 5 durak ve yoğun. Kuyruğu en uzun olanı çıkarmayı ve Roma’yı plana eklemeyi öneriyorum."},
   {"type":"tool_use","id":"t1","name":"degisiklik_oner","input":{"baslik":"İstanbul 1. gün: daha hafif","islemler":[
     {"tur":"durak_cikar","ulke":"tr","sehir_id":"istanbul","gun":1,"durak_no":2,"gerekce":"Yerebatan'da kuyruk uzun; günün en kolay çıkarılan durağı."},
     {"tur":"plana_sehir_ekle","ulke":"it","sehir_id":"roma","gerekce":"İtalya ayağı için gezi planına."}]}}],"stop_reason":"tool_use"},
 {"content":[{"type":"text","text":"Tamam, **uygulandı**.\n- Yerebatan çıktı, gün 4 durağa indi\n- Roma gezi planında"}],"stop_reason":"end_turn"}]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    vp={'width':390,'height':844} if dev=='mob' else {'width':1280,'height':860}
    pg=await b.new_page(viewport=vp, device_scale_factor=2)
    await pg.add_init_script(STUB)
    q=list(SCRIPT)
    async def ai(route):
      if route.request.method=='OPTIONS': await route.fulfill(status=204, headers={'access-control-allow-origin':'*','access-control-allow-headers':'content-type'}); return
      await route.fulfill(status=200, content_type='application/json', headers={'access-control-allow-origin':'*'}, body=json.dumps(q.pop(0)))
    await pg.route('https://ai.test/**', ai)
    await pg.route('**/*', lambda r: r.abort() if 'open-meteo' in r.request.url else r.fallback())
    await pg.goto("file://"+src); await pg.wait_for_timeout(2200)
    await pg.evaluate("""document.querySelector('.country-card[data-country="tr"]').click()"""); await pg.wait_for_timeout(900)
    if theme=='dark':
      await pg.evaluate("document.getElementById('menuBtn').click(); document.getElementById('themeToggle').click()"); await pg.wait_for_timeout(300)
    if state!='off': await pg.evaluate("AI_CFG.endpoint='https://ai.test/x'")
    await pg.evaluate("document.getElementById('menuBtn').click()"); await pg.wait_for_timeout(200)
    await pg.evaluate("document.getElementById('aiBtn').click()"); await pg.wait_for_timeout(700)
    if state!='off':
      await pg.fill('#aiInput','İlk günü hafiflet, Roma\'yı da plana ekle')
      await pg.click('#aiSend'); await pg.wait_for_selector('.ai-apply'); await pg.wait_for_timeout(400)
      if state=='applied':
        await pg.click('.ai-apply'); await pg.wait_for_timeout(900)
    await pg.screenshot(path=SP+tag+'.png')
    if state=='applied':
      await pg.evaluate("document.querySelector('[data-close=aiModal]').click()"); await pg.wait_for_timeout(600)
      await pg.evaluate("document.querySelector('.station.skipped').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(400)
      await pg.screenshot(path=SP+tag+'-rota.png')
    await b.close()
asyncio.run(main())
