const {chromium,devices}=require('playwright');const fs=require('fs');
const FILL=fs.readFileSync(process.argv[3],'utf8').split('FILL="""')[1].split('"""')[0];
const DEV=['iPhone SE','iPhone 15','iPhone 15 Pro Max','Pixel 7','Galaxy S9+','Galaxy S5'];
(async()=>{const b=await chromium.launch();
for(const dn of DEV){const c=await b.newContext({...devices[dn]});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+process.argv[2]);await p.waitForTimeout(400);
 const ids=await p.evaluate(()=>['','calc','esc','esp','med','med-0','cid10','cid10-A00','cron','fav','sobre','instalar',...TOOLS.map(t=>t.id)]);
 const bad={over:[],brk:[],small:[],zoom:[]};
 for(const h of ids){await p.evaluate(h=>location.hash='#'+h,h);await p.waitForTimeout(25);await p.evaluate(FILL).catch(()=>{});await p.waitForTimeout(25);
  const r=await p.evaluate(()=>{const o={over:document.documentElement.scrollWidth>innerWidth+1,brk:[],zoom:0};
   const w=document.createTreeWalker(document.getElementById('app')||document.body,NodeFilter.SHOW_TEXT);let n;
   while(n=w.nextNode()){const t=n.textContent;const re=/(≥|≤|<|>) ?\d|\d[  ](mg|kg|mL|cm|mmHg|bpm|anos|dias|h|s|min|%)\b/g;let m;
    while(m=re.exec(t)){const rg=document.createRange();rg.setStart(n,m.index);rg.setEnd(n,m.index+m[0].length);const tops=new Set([...rg.getClientRects()].filter(x=>x.width>0).map(x=>Math.round(x.top)));if(tops.size>1)o.brk.push(m[0])}}
   document.querySelectorAll('#app input:not([type=checkbox]):not([type=radio]),#app select,#app textarea').forEach(i=>{if(i.offsetParent&&parseFloat(getComputedStyle(i).fontSize)<16)o.zoom++});
   return o});
  if(r.over)bad.over.push(h);if(r.brk.length)bad.brk.push(h+':'+r.brk.join('|'));if(r.zoom)bad.zoom.push(h)}
 // digitação com vírgula
 await p.evaluate(()=>location.hash='#imc');await p.waitForTimeout(100);const ins=await p.$$('#app input.num');
 await ins[0].tap();await p.keyboard.type('70,5');await ins[1].tap();await p.keyboard.type('175');await p.waitForTimeout(100);
 const imc=await p.evaluate(()=>document.getElementById('out').innerText.replace(/\s+/g,' ').slice(0,40));
 console.log(dn.padEnd(18),devices[dn].viewport.width+'x'+devices[dn].viewport.height,'| telas',ids.length,'| vazamento',bad.over.length,'| quebra ≥/unidade',bad.brk.length,bad.brk.slice(0,3).join(' ; '),'| zoom',bad.zoom.length,'| IMC 70,5 kg 175 cm:',imc,'| erros',errs.length);
 await c.close()}
await b.close()})();
