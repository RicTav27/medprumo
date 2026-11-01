const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM('<!doctype html><body>'+fs.readFileSync('medcalc.html','utf8')+'</body>',{runScripts:'dangerously',url:'https://x.test/'});
const w=dom.window;w.scrollTo=()=>{};const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{const d=w.document;let issues=[];
 for(const id of w.eval('TOOLS.map(t=>t.id)')){w.location.hash='#'+id;w.eval('route()');
  const app=d.getElementById('app');
  const filled=[...app.querySelectorAll('input.num')].filter(i=>i.value!=='').map(i=>i.id);
  const chk=[...app.querySelectorAll('input[type=checkbox]:checked,input[type=radio]:checked')].map(i=>i.id).filter(x=>x!=='pX');
  const sel=[...app.querySelectorAll('select:not([data-cfg])')].filter(s=>s.value!==''&&!s.id.match(/^q(h|ma|mb|ta|tp|ia|ib|p)$/)).map(s=>s.id);
  const segs=[...app.querySelectorAll('.seg [aria-pressed="true"]')].map(b=>b.parentElement.id).filter(x=>x!=='ifmode');
  const o=d.getElementById('out').textContent;
  if(filled.length||chk.length||sel.length||segs.length||!o.includes('Preencha os dados'))issues.push([id,filled,chk,sel,segs,o.slice(0,40)]);
  // interact: fill all selects/radios/segs/numbers with first valid and check result renders
  app.querySelectorAll('select:not([data-cfg])').forEach(s=>{s.selectedIndex=1});
  const nm=new Set();app.querySelectorAll('input[type=radio]').forEach(r=>{if(!nm.has(r.name)){nm.add(r.name);if(!d.querySelector(`input[name="${r.name}"]:checked`))r.checked=true}});
  app.querySelectorAll('.seg').forEach(s=>s.querySelector('button').click());
  const o2=d.getElementById('out').textContent;if(o2.includes('Faltam'))issues.push(['still missing',id,o2]);
 }
 console.log(JSON.stringify(issues,null,0));console.log('errors',errs);process.exit(0)},300);
