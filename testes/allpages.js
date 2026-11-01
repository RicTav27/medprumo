const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM('<!doctype html><body>'+fs.readFileSync('medcalc.html','utf8')+'</body>',{runScripts:'dangerously',url:'https://x.test/'});
const w=dom.window;w.scrollTo=()=>{};w.matchMedia=()=>({matches:false});w.requestAnimationFrame=f=>f();const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(async()=>{const d=w.document,L=w.eval('LIM'),D=w.eval('DISC');const bad=[];
 const pages=w.eval('TOOLS.map(t=>t.id)').concat(['','calc','esc','esp','med','med-0','med-973','med-1764','cid10','cid10-c0','cid10-c21','cid10-A00','cron','sobre','fav','instalar']);
 for(const h of pages){w.location.hash='#'+h;w.eval('route()');const app=d.getElementById('app');
  const isTool=w.eval(`TOOLS.some(t=>t.id==='${h}')`);
  if(isTool){app.querySelectorAll('input.num').forEach(i=>{const l=L[i.id]||[0,1];i.value=String((l[0]+l[1])/2*0.3+l[0]*0.7)});
   app.querySelectorAll('input[type=date]').forEach(i=>{if(!i.value)i.value='2026-03-01'});
   app.querySelectorAll('.po').forEach(po=>{const bs=po.querySelectorAll('button');bs[Math.min(1,bs.length-1)].click()});
   const nm=new Set();app.querySelectorAll('input[type=radio]').forEach(r=>{if(!nm.has(r.name)){nm.add(r.name);r.checked=true}});
   app.querySelectorAll('.seg').forEach(s=>s.querySelector('button').click());
   const n=app.querySelector('input,select');n&&n.dispatchEvent(new w.Event(n.tagName=='SELECT'||n.type!='text'?'change':'input'));}
  await new Promise(r=>setTimeout(r,0)); // aviso de rodapé entra por MutationObserver (assíncrono)
  const t=app.textContent+' '+d.getElementById('bar').textContent;
  const p=[];if(/undefined|NaN|\[object|null\b/.test(t))p.push('texto inválido: '+t.match(/.{0,30}(undefined|NaN|\[object|null\b).{0,20}/)[0]);
  if(!t.includes(D))p.push('sem aviso');
  if(h&&!d.querySelector('#bar h1'))p.push('sem título');
  if(isTool&&/Faltam|Não foi possível/.test(d.getElementById('out').textContent))p.push('resultado: '+d.getElementById('out').textContent.slice(0,60));
  if(/—|–/.test(t))p.push('travessão');
  if(p.length)bad.push([h||'home',p]);}
 console.log('páginas',pages.length,'problemas',JSON.stringify(bad,null,0));console.log('erros',errs);process.exit(0)},300);
