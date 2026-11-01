from playwright.sync_api import sync_playwright
import os;f='file://'+os.path.join(os.path.dirname(os.path.abspath(__file__)),'medcalc.html')
with sync_playwright() as p:
  b=p.chromium.launch();pg=b.new_page(viewport={'width':390,'height':844});pg.goto(f);pg.wait_for_timeout(300)
  h=lambda:pg.evaluate("document.querySelector('.hcard').getBoundingClientRect().height")
  a=h();pg.set_viewport_size({'width':390,'height':500});pg.wait_for_timeout(300);print('card antes',a,'com teclado',h())
  b.close()
