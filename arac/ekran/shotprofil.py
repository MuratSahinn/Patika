# Gezgin profili ekranları (sahte Supabase). kullanım: shotprofil.py <html> <etiket> mob|desk light|dark off|mail|kod|yeni|profil|sil
import sys, asyncio, json
from playwright.async_api import async_playwright
import os; SP=os.environ.get('CIKTI','./cikti/')
src,tag,dev,theme,state=sys.argv[1:6]
skin=sys.argv[6] if len(sys.argv)>6 else 'cam'
U='https://proje.supabase.co'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    vp={'width':390,'height':844} if dev=='mob' else {'width':1280,'height':860}
    pg=await b.new_page(viewport=vp, device_scale_factor=2)
    prof={}
    async def sb(route):
      r=route.request; h={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'}
      if r.method=='OPTIONS': await route.fulfill(status=204, headers=h); return
      path=r.url[len(U):]
      if path.startswith('/auth/v1/verify'): body={'access_token':'at','refresh_token':'rt','expires_in':3600,'user':{'id':'u1','email':'murat@ornek.com'}}
      elif path.startswith('/rest/v1/profiles') and r.method=='GET': body=[prof] if prof else []
      elif path.startswith('/rest/v1/profiles'): prof.update(json.loads(r.post_data)); body=[prof]
      else: body={}
      await route.fulfill(status=200, headers=h, content_type='application/json', body=json.dumps(body))
    await pg.route(U+'/**', sb)
    await pg.route('**/*', lambda r: r.abort() if 'open-meteo' in r.request.url else r.fallback())
    if state!='off': await pg.add_init_script("localStorage.setItem('patika:sosyal', JSON.stringify({url:'%s',key:'k'}))" % U)
    await pg.goto("file://"+src); await pg.wait_for_timeout(1800)
    await pg.evaluate("""document.querySelector('.country-card[data-country="tr"]').click()"""); await pg.wait_for_timeout(900)
    await pg.evaluate("""(()=>{ const pick={tr:['istanbul','kapadokya','mardin'], it:['roma','floransa'], gr:['atina']};
      for(const [cc,ids] of Object.entries(pick)) ids.forEach(id=>{ const c=COUNTRY_CITIES[cc].find(x=>x.id===id); if(!c) return;
        const o=doneCache[id]=doneCache[id]||{}; c.days.forEach((d,di)=>d.stops.forEach((s,i)=>{ if(di<2) o[d.day+'-'+i]=true; })); }); })()""")
    await pg.evaluate("localStorage.setItem('patika:kunye', '%s'); kunyeSkin='%s'" % (skin, skin))
    if theme=='dark': await pg.evaluate("document.getElementById('menuBtn').click(); document.getElementById('themeToggle').click()"); await pg.wait_for_timeout(300)
    await pg.evaluate("document.getElementById('menuBtn').click()"); await pg.wait_for_timeout(250)
    if state=='mail' or state=='off':
      await pg.screenshot(path=SP+tag+'-menu.png')
    await pg.evaluate("document.getElementById('profilBtn').click()"); await pg.wait_for_timeout(500)
    if state in ('kod','yeni','profil','sil'):
      await pg.fill('#spMail','murat@ornek.com'); await pg.click('#spMailForm .sp-btn'); await pg.wait_for_selector('#spKod')
    if state in ('yeni','profil','sil'):
      await pg.fill('#spKod','123456'); await pg.click('#spKodForm .sp-btn'); await pg.wait_for_selector('#spAd')
    if state in ('profil','sil'):
      await pg.fill('#spAd','Gezgin Murat'); await pg.click('#spProfilForm .sp-btn'); await pg.wait_for_selector('#spCikis'); await pg.wait_for_timeout(300)
    if state=='sil': await pg.click('#spSil'); await pg.wait_for_timeout(200)
    await pg.wait_for_timeout(300)
    await pg.screenshot(path=SP+tag+'.png')
    await b.close()
asyncio.run(main())
