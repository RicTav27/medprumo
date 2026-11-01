const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM('<!doctype html><body>'+fs.readFileSync('medcalc.html','utf8')+'</body>',{runScripts:'dangerously',url:'https://x.test/'});
const w=dom.window;w.scrollTo=()=>{};w.matchMedia=()=>({matches:false});
const C=[
['tfg',{cr:1,age:50},{sex:'M'},'≈92'],
['tfg',{cr:1,age:50},{sex:'F'},'≈69 (F: κ0,7 α-0,241 ×1,012)'],
['cg',{cga:60,cgw:70,cgc:1.2},{cgs:'M'},'64,8'],
['imc',{wt:82,ht:170},{},'28,4'],
['ag',{na:140,cl:104,hco3:24,alb:2},{},'12 / corrigido 17'],
['ca',{cat:8,alb2:2},{},'9,6'],
['nac',{na2:130,gli:600},{},'Katz 138 / Hillier 142'],
['ldl',{ct:200,hdl:50,tg:150},{},'Friedewald 120'],
['qtc',{qt:400,fc:75},{sex2:'M'},'Bazett 447 / Fridericia 431'],
['meld',{bil:2,crm:1.5,inr:1.5},{sexm:'M'},'MELD ≈17'],
['osm',{osn:140,osg:90,osu:30},{},'≈290'],
['sc',{scw:70,sch:170},{},'Mosteller 1,82'],
['vm',{vmh:170},{vms:'M'},'66,0'],
['fib4',{fba:50,fbs:40,fbl:25,fbp:200},{},'2,00'],
['ttkg',{tku:40,tkp:4,tkuo:600,tkpo:300},{},'5'],
['gaso',{gph:7.25,gpc:30,ghc:13},{},'acidose metab, Winter 27,5±2'],
['lra',{lrb:1,lra:2.1},{},'KDIGO 2'],
];
setTimeout(()=>{const d=w.document;
 for(const [id,f,sg,exp] of C){w.location.hash='#'+id;w.eval('route()');
  for(const [k,v] of Object.entries(f)){const i=d.getElementById(k);i.value=String(v);i.dispatchEvent(new w.Event('input'))}
  for(const [k,v] of Object.entries(sg)){d.querySelector(`#${k} [data-v="${v}"]`).click()}
  console.log(id.padEnd(6),'| esperado:',exp.padEnd(32),'| app:',d.getElementById('out').textContent.replace(/\s+/g,' ').slice(0,150))}
 process.exit(0)},300);
