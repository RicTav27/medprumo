from playwright.sync_api import sync_playwright
import os;f='file://'+os.path.join(os.path.dirname(os.path.abspath(__file__)),'medcalc.html')
with sync_playwright() as p:
  b=p.chromium.launch();q=b.new_page();q.goto(f);q.wait_for_timeout(300)
  for k in ['pré-operatório','perioperatório','Pré-op','cirurgia']:
    print(k,'→',q.evaluate("k=>searchTools(norm(k)).map(t=>t.id).join(',')",k))
  b.close()
