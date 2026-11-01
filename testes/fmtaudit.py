import sys,re,json
from playwright.sync_api import sync_playwright
src=sys.argv[1];f='file://'+src
exec(open(sys.argv[2]).read().split('with sync_playwright')[0].split("f='file://'+src")[1]) # FILL
PAT=[('ponto decimal',r'(?<![\d.])\d+\.\d+(?!\.\d)(?![\d]*\s*(?:mm³|/mm³|mil))'),('NaN/undefined',r'NaN|undefined|Infinity|null\b|\[object'),('espaço duplo',r'\S  +\S'),('espaço antes de pontuação',r'\s[,.;:!?](?!\d)'),('travessão',r'—'),('hífen como menos',r'(?<![\w)])-\d'),('sem espaço após vírgula',r'[a-zà-ú],[a-zà-ú]'),('número colado na unidade',r'\d(?:mg|mL|kg|cm|mmHg|bpm|g/dL|mEq)\b'),('pontuação dupla',r'[.,]{2}(?!\.)|\.\s*\.'),('minúscula após ponto',r'[a-zà-ú]{3}\. [a-zà-ú]'),('≥/≤ colado',r'[≥≤](?=\d)'),('maior/menor sem espaço',r'(?<=\s)[<>](?=\d)')]
with sync_playwright() as p:
  b=p.chromium.launch();res={}
  for w in (320,390):
    c=b.new_context(viewport={'width':w,'height':800},is_mobile=True,has_touch=True);q=c.new_page();q.goto(f);q.wait_for_timeout(300)
    ids=q.evaluate("TOOLS.map(t=>t.id)")
    pages=['','esp','calc','esc','med','med-0','med-973','med-1764','cid10','cid10-c0','cid10-A00','cron','fav','sobre','instalar']+ids
    for h in pages:
      q.evaluate(f"location.hash='#{h}'");q.wait_for_timeout(30)
      if h in ids:q.evaluate(FILL);q.wait_for_timeout(30)
      r=q.evaluate("""()=>{const a=document.getElementById('app');const vw=document.documentElement.clientWidth;
        const ov=document.documentElement.scrollWidth>vw;
        const clip=[...a.querySelectorAll('*')].filter(e=>{const s=getComputedStyle(e);return e.children.length===0&&e.textContent.trim()&&e.scrollWidth>e.clientWidth+1&&(s.overflow==='hidden'||s.textOverflow==='ellipsis')}).map(e=>e.textContent.trim().slice(0,40));
        const out=[...a.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&(r.right>vw+1||r.left<-1)}).map(e=>e.tagName+'.'+e.className+':'+e.textContent.trim().slice(0,30)).slice(0,3);
        const small=[...a.querySelectorAll('button,a,input,select,label.opt')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&r.height<32}).map(e=>e.tagName+':'+(e.textContent||e.id).trim().slice(0,20)+':'+Math.round(e.getBoundingClientRect().height)).slice(0,4);
        const txt=a.innerText;return {ov,clip,out,small,txt}}""")
      k=h or 'home';e=res.setdefault(k,set())
      if r['ov']:e.add(f'{w}px vaza horizontal')
      for x in r['clip']:e.add(f'{w}px cortado: {x}')
      for x in r['out']:e.add(f'{w}px fora da tela: {x}')
      if w==390:
        for x in r['small']:e.add(f'alvo pequeno: {x}')
        for name,pt in PAT:
          for m in re.finditer(pt,r['txt']):
            s=r['txt'][max(0,m.start()-25):m.end()+25].replace('\n',' ⏎ ');e.add(f'{name}: …{s}…')
    c.close()
  b.close()
for k,v in res.items():
  for x in sorted(v):print(k,'|',x)
