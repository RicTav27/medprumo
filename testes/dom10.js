const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM('<!doctype html><body>'+fs.readFileSync('medcalc.html','utf8')+'</body>',{runScripts:'dangerously',url:'https://x.test/'});
const w=dom.window;w.scrollTo=()=>{};w.matchMedia=()=>({matches:false});const errs=[];w.addEventListener('error',e=>errs.push(e.message));
const C={got:{gtv:500,gtt:8},holl:{hsw:25},cort:{cdd:40,_s:{cod:1}},pam:{pms:120,pmd:80},pid:{pih:175,piw:110,_g:1},cl24:{cuc:100,cuv:1440,cpc:1},rac:{raa:60,rac2:100},homa:{hog:100,hoi:10},ganz:{gzw:70,gza:9,gzt:15},
phq9:{_all:3},gad7:{_all:2},fager:{_all:0},findrisc:{fda:60,fdw:90,fdh:170,fdc:100,_g:1,_all:1},meem:{_r:{mesc:4}}};
setTimeout(()=>{const d=w.document;
 for(const [id,v] of Object.entries(C)){w.location.hash='#'+id;w.eval('route()');const app=d.getElementById('app');
  for(const [k,x] of Object.entries(v)){if(k[0]!=='_'){const i=d.getElementById(k);i.value=String(x);i.dispatchEvent(new w.Event('input'))}}
  if(v._g)app.querySelectorAll('.seg').forEach(s=>s.querySelectorAll('button')[v._g].click());
  app.querySelectorAll('.po').forEach(po=>{const sid=po.querySelector('button').dataset.for;const idx=v._s&&v._s[sid]!=null?v._s[sid]:v._all;if(idx!=null){const bs=po.querySelectorAll('button');bs[Math.min(idx,bs.length-1)].click()}});
  if(v._r)Object.entries(v._r).forEach(([n,i])=>{const r=app.querySelectorAll(`input[name="${n}"]`)[i];r.checked=true;r.dispatchEvent(new w.Event('change',{bubbles:true}))});
  console.log(id.padEnd(9),d.getElementById('out').textContent.replace(/\s+/g,' ').slice(0,140));
  console.log('   pts:',[...app.querySelectorAll('.po button b')].slice(0,3).map(b=>b.textContent).join('|'))}
 console.log('errors',errs);process.exit(0)},300);
