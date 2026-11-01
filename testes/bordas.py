from playwright.sync_api import sync_playwright
import sys
import os;f='file://'+os.path.join(os.path.dirname(os.path.abspath(__file__)),'medcalc.html')
JS=r"""(minGap)=>{
 const boxOf=e=>{let a=e.parentElement;while(a&&a!==document.body){const s=getComputedStyle(a);const bw=parseFloat(s.borderLeftWidth)+parseFloat(s.borderRightWidth);const bg=s.backgroundColor;if(bw>0||(bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent'&&a.id!=='app'&&!a.classList.contains('wrap')))return a;a=a.parentElement}return null};
 const out=[];const w=document.createTreeWalker(document.getElementById('app'),NodeFilter.SHOW_TEXT);let n;
 while(n=w.nextNode()){const t=n.textContent.trim();if(!t)continue;const el=n.parentElement;if(!el.offsetParent)continue;if(el.closest('svg,table,.vh,select,option'))continue;
  const r=document.createRange();r.selectNodeContents(n);const rs=[...r.getClientRects()].filter(x=>x.width>0);if(!rs.length)continue;
  const L=Math.min(...rs.map(x=>x.left)),R=Math.max(...rs.map(x=>x.right));const b=boxOf(el);if(!b)continue;const br=b.getBoundingClientRect(),s=getComputedStyle(b);
  const il=br.left+parseFloat(s.borderLeftWidth),ir=br.right-parseFloat(s.borderRightWidth);const gl=L-il,gr=ir-R;
  if(b.tagName==='INPUT'||b.tagName==='BUTTON'&&false)continue;
  if(gl<minGap||gr<minGap-2)out.push([Math.round(gl),Math.round(gr),(b.tagName+'.'+b.className).slice(0,40),(el.tagName+'.'+el.className).slice(0,30),t.slice(0,45)])}
 return out}"""
with sync_playwright() as p:
  b=p.chromium.launch();c=b.new_context(viewport={'width':int(sys.argv[2]) if len(sys.argv)>2 else 375,'height':800},is_mobile=True,has_touch=True);pg=c.new_page();pg.goto(f);pg.wait_for_timeout(300)
  pages=['']+pg.evaluate('TOOLS.map(t=>t.id)')+['calc','esc','esp','med','med-0','med-973','cid10','cid10-c0','cid10-A00','cron','sobre','fav','instalar']
  seen={}
  for h in pages:
    pg.evaluate(f"location.hash='#{h}'");pg.wait_for_timeout(30)
    pg.evaluate("document.querySelectorAll('#app details').forEach(d=>d.open=true)")
    for x in pg.evaluate(JS,int(sys.argv[1]) if len(sys.argv)>1 else 6):
      k=(x[2],x[3]);seen.setdefault(k,[]).append((h,x[0],x[1],x[4]))
  for k,v in sorted(seen.items(),key=lambda kv:-len(kv[1])):
    print(len(v),k,v[:3])
