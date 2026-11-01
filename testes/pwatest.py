import subprocess,time
from playwright.sync_api import sync_playwright
import os;d=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
srv=subprocess.Popen(['python3','-m','http.server','8765','--bind','127.0.0.1'],cwd=d,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
try:
  with sync_playwright() as p:
    b=p.chromium.launch();ctx=b.new_context(viewport={'width':390,'height':844});pg=ctx.new_page()
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('http://127.0.0.1:8765/');pg.wait_for_timeout(2500)
    print('sw',pg.evaluate("navigator.serviceWorker.controller?'controlled':'nocontrol'"),pg.evaluate("navigator.serviceWorker.getRegistration().then(r=>r&&r.active&&r.active.state)"))
    pg.reload();pg.wait_for_timeout(1000);print('ctrl after reload',pg.evaluate("!!navigator.serviceWorker.controller"))
    ctx.set_offline(True);pg.goto('http://127.0.0.1:8765/#tfg');pg.wait_for_timeout(800)
    print('offline title',pg.title(),pg.inner_text('.bar h1') if pg.query_selector('.bar h1') else '')
    print('manifest',pg.evaluate("fetch('manifest.webmanifest').then(r=>r.json()).then(j=>j.name+' '+j.icons.length)"))
    print('errs',errs)
    b.close()
finally: srv.terminate()
