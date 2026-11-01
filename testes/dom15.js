const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM('<!doctype html><body>'+fs.readFileSync('medcalc.html','utf8')+'</body>',{runScripts:'dangerously',url:'https://x.test/'});
const w=dom.window;w.scrollTo=()=>{};w.matchMedia=()=>({matches:false});w.requestAnimationFrame=f=>f();const errs=[];w.addEventListener('error',e=>errs.push(e.message));
let fail=0;
setTimeout(()=>{const d=w.document;const txt=()=>d.getElementById('out').textContent.replace(/\s+/g,' ');
 const run=(id,fn,ex)=>{w.location.hash='#'+id;w.eval('route()');fn(d.getElementById('app'));const t=txt();const ok=ex.every(e=>t.includes(e));if(!ok)fail++;console.log((ok?'OK  ':'FAIL')+' '+id.padEnd(10),t.slice(0,150))};
 const pick=(a,idx)=>a.querySelectorAll('.po').forEach((po,i)=>{const k=Array.isArray(idx)?idx[i]:idx;if(k!=null)po.querySelectorAll('button')[k].click()});
 const ck=ids=>ids.forEach(i=>{const c=d.getElementById(i);c.checked=true;c.dispatchEvent(new w.Event('change'))});
 const fl=o=>Object.entries(o).forEach(([k,v])=>{const i=d.getElementById(k);i.value=v;i.dispatchEvent(new w.Event('input'))});
 const rd=(n,v)=>{const r=d.getElementById(n+v);r.checked=true;r.dispatchEvent(new w.Event('change'))};
 run('sgarbossa',a=>ck(['sg2']),['3','positivo']);
 run('sgarbossa',a=>ck(['sg3']),['2','negativo']);
 run('sgarbossa',a=>ck(['sg1','sg2','sg3']),['10']);
 run('quatrots',a=>pick(a,0),['8','alta']);
 run('quatrots',a=>pick(a,[1,1,1,1]),['4','intermediária']);
 run('quatrots',a=>pick(a,[2,2,2,1]),['1','baixa']);
 run('genebra',a=>{pick(a,[2]);ck(['gb2','gb7'])},['12','alta','74%']);
 run('genebra',a=>{pick(a,[1]);ck(['gb1'])},['4','intermediária','28%']);
 run('genebra',a=>{pick(a,[0]);ck(['gb3'])},['2','baixa','8%']);
 run('ecog',a=>rd('ec','2'),['2','incapaz de trabalhar']);
 run('karnofsky',a=>pick(a,[4]),['60','vive em casa']);
 run('karnofsky',a=>pick(a,[0]),['100','Atividade normal']);
 // GDS: todos "Sim" -> pontos dos itens positivos = 10
 run('gds15',a=>pick(a,0),['10','Sugere']);
 run('gds15',a=>pick(a,1),['5','Abaixo']);
 // EPDS: primeira opção em todos: itens 1,2,4 = 0; demais = 3 -> 21, item 10 positivo
 run('epds',a=>pick(a,0),['21','positivo','Item 10']);
 run('epds',a=>pick(a,3),['9','negativo']);
 // ROX: 95/(0,5)/25 = 7,6
 run('rox',a=>{fl({rxs:95,rxf:50,rxr:25});pick(a,[0])},['7,60','Menor risco']);
 run('rox',a=>{fl({rxs:88,rxf:80,rxr:40});pick(a,[2])},['2,75','Maior risco']);
 run('rox',a=>{fl({rxs:92,rxf:60,rxr:35});pick(a,[0])},['4,38','intermediária']);
 run('gcsped',a=>{rd('po','4');rd('pv','4');rd('pm','6')},['14','leve','O4 V4 M6']);
 run('gcsped',a=>{rd('po','1');rd('pv','2');rd('pm','3')},['6','grave']);
 console.log('errors',errs,'fail',fail);process.exit(0)},300);
