from playwright.sync_api import sync_playwright
import json,collections
import os;f='file://'+os.path.join(os.path.dirname(os.path.abspath(__file__)),'medcalc.html')
JS="""()=>{const r=getComputedStyle(document.documentElement);const tok={};for(const s of document.styleSheets){try{for(const ru of s.cssRules){const st=ru.style;if(!st)continue;for(let i=0;i<st.length;i++){const p=st[i];if(p.startsWith('--'))tok[p]=1}}}catch(e){}}
const c=document.createElement('div');document.body.appendChild(c);const val={};for(const t in tok){c.style.color='var('+t+')';const v=getComputedStyle(c).color;val[v]=(val[v]||[]).concat(t)}c.remove();
const out={};for(const e of document.querySelectorAll('body *')){const s=getComputedStyle(e);if(s.display==='none'||!e.getClientRects().length)continue;for(const p of ['color','backgroundColor','borderTopColor','fill','stroke']){let v=s[p];if(!v||v==='none'||v==='rgba(0, 0, 0, 0)')continue;if(p==='borderTopColor'&&s.borderTopWidth==='0px')continue;if((p==='fill'||p==='stroke')&&e.tagName!=='svg'&&!(e instanceof SVGElement))continue;const k=v;(out[k]=out[k]||new Set()).add((e.className&&e.className.baseVal===undefined?e.tagName+'.'+String(e.className).split(' ')[0]:e.tagName)+':'+p)}}
const o={};for(const k in out)o[k]=[...out[k]].slice(0,6);return {tok:val,used:o}}"""
pages=['','calc','esc','esp','med','med-0','med-973','cid10','cid10-c0','cid10-A00','cron','sobre','fav','instalar','gold','centor','saps3','mrc','audit','imc','glasgow','chadsvasc','tfg','hasbled','qsofa']
with sync_playwright() as p:
  b=p.chromium.launch()
  for th in ['light','dark']:
    ctx=b.new_context(viewport={'width':390,'height':844},color_scheme=th,is_mobile=True,has_touch=True);pg=ctx.new_page();pg.goto(f);pg.wait_for_timeout(300)
    allused=collections.defaultdict(set);tok=None
    for h in pages:
      pg.evaluate(f"location.hash='#{h}'");pg.wait_for_timeout(120)
      # open all details and click first options to show results
      pg.evaluate("document.querySelectorAll('details').forEach(d=>d.open=true)")
      r=pg.evaluate(JS);tok=r['tok']
      for k,v in r['used'].items():
        for x in v: allused[k].add(h+'|'+x)
    print('=====',th,pg.evaluate("document.documentElement.dataset.theme||getComputedStyle(document.body).backgroundColor"))
    for k,v in sorted(allused.items(),key=lambda kv:-len(kv[1])):
      if k not in tok and (' / ' in k or all(x.endswith(('fill','stroke')) for x in v)): continue  # mistura com transparência dos tokens e desenhos (logo, SVG)
      print(k,'TOKEN '+','.join(tok.get(k,[]))[:60] if k in tok else 'NAO-TOKEN',len(v),sorted(v)[:4])
    ctx.close()
  b.close()
