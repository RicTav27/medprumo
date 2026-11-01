const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM('<!doctype html><body>'+fs.readFileSync('medcalc.html','utf8')+'</body>',{runScripts:'dangerously',url:'https://x.test/'});
const w=dom.window;w.scrollTo=()=>{};w.matchMedia=()=>({matches:false});const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{const d=w.document,L=w.eval('LIM'),miss=[];const res={};
 for(const id of w.eval('TOOLS.map(t=>t.id)')){w.location.hash='#'+id;w.eval('route()');const app=d.getElementById('app');
  app.querySelectorAll('input.num').forEach(i=>{if(!L[i.id])miss.push(id+':'+i.id);const l=L[i.id]||[0,1];i.value=String((l[0]+l[1])/2*0.3+l[0]*0.7)});
  app.querySelectorAll('input[type=date]').forEach(i=>{if(!i.value)i.value='2026-03-01'});
  app.querySelectorAll('select:not([data-cfg])').forEach(s=>{s.selectedIndex=2<s.options.length?2:1});
  const nm=new Set();app.querySelectorAll('input[type=radio]').forEach(r=>{if(!nm.has(r.name)){nm.add(r.name);r.checked=true}});
  app.querySelectorAll('input[type=checkbox]').forEach((c,i)=>{if(i%2==0)c.checked=true});
  app.querySelectorAll('.seg').forEach(s=>s.querySelector('button').click());
  const n=app.querySelector('input,select');n&&n.dispatchEvent(new w.Event(n.tagName=='SELECT'||n.type!='text'?'change':'input'));
  res[id]=d.getElementById('out').textContent.replace(/\s+/g,' ').slice(0,70)}
 for(const k of ['news2','blatch','abcd2','cchr','nexus','pecarn','rass','camicu','braden','morse','padua','caprini','ciwa','agualivre','silverman','capurro','rcri','asa','apfel','sofa2','vanco'])console.log(k.padEnd(10),res[k]);
 const bad=Object.entries(res).filter(([k,v])=>/Faltam|calcular\.|Não foi possível/.test(v));console.log('problems',bad);
 w.eval('toggleTheme()');console.log('theme',d.documentElement.dataset.theme,'nolimit',miss,'errors',errs);process.exit(0)},300);
