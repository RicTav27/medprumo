const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM('<!doctype html><body>'+fs.readFileSync('medcalc.html','utf8')+'</body>',{runScripts:'dangerously',url:'https://x.test/'});
const w=dom.window;w.scrollTo=()=>{};w.matchMedia=()=>({matches:false});const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{const d=w.document;let bad=[];
 for(const id of w.eval('TOOLS.map(t=>t.id)')){w.location.hash='#'+id;w.eval('route()');
  const groups=d.querySelectorAll('#app .po');if(!groups.length)continue;
  groups.forEach(g=>g.querySelectorAll('button')[0].click());
  const nm=new Set();d.querySelectorAll('#app input[type=radio]').forEach(r=>{if(!nm.has(r.name)){nm.add(r.name);r.click()}});
  d.querySelectorAll('#app .seg').forEach(s=>s.querySelector('button').click());
  const o=d.getElementById('out').textContent;if(/Faltam|Preencha os dados/.test(o)&&!d.querySelector('#app input.num'))bad.push([id,o.slice(0,60)]);
  if(d.querySelector('#app .po button[aria-checked="true"]')==null)bad.push([id,'no checked']);
 }
 w.location.hash='#nihss';w.eval('route()');const b=d.querySelectorAll('#app .po')[0].querySelectorAll('button')[2];b.click();
 console.log('nihss sample',d.getElementById('out').textContent.slice(0,50),'| pts label:',b.querySelector('b').textContent);
 console.log('bad',JSON.stringify(bad),'errors',errs);process.exit(0)},300);
