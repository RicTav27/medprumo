/* Dosagem: Dose por peso, Gotas, Diluição e Ampolas de eletrólitos contra valores calculados à mão.
   Uso: node dom19.js (depois de ./preparar.sh) */
const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM('<!doctype html><body>'+fs.readFileSync(__dirname+'/medcalc.html','utf8')+'</body>',{runScripts:'dangerously',url:'https://x.test/'});
const w=dom.window;w.scrollTo=()=>{};w.matchMedia=()=>({matches:false});w.requestAnimationFrame=f=>f();const errs=[];w.addEventListener('error',e=>errs.push(e.message));
let fail=0;
setTimeout(()=>{const d=w.document;const txt=()=>d.getElementById('out').textContent.replace(/\s+/g,' ');
 // id: sel = {idDoSelect:'_valor'} (na ordem), campos = {idDoCampo:'texto'}, ex = trechos que o resultado precisa ter
 const run=(id,sel,campos,ex)=>{w.location.hash='#'+id;w.eval('route()');
  Object.entries(sel).forEach(([k,v])=>{const b=d.querySelector(`[data-for="${k}"][data-v="${v}"]`);if(b)b.click();else{const s=d.getElementById(k);s.value=v;s.dispatchEvent(new w.Event('change',{bubbles:true}))}});
  Object.entries(campos).forEach(([k,v])=>{const i=d.getElementById(k);i.value=v;i.dispatchEvent(new w.Event('input',{bubbles:true}))});
  const t=txt(),falta=ex.filter(e=>!t.includes(e));if(falta.length)fail++;console.log(falta.length?'FALHA '+id+' faltou '+JSON.stringify(falta)+' em: ':'OK   ',t.slice(0,200))};
 // Dose por peso: 20 kg x 15 mg/kg = 300 mg; 300 / 50 mg/mL = 6 mL
 run('dosekg',{dkb:'_d'},{dkw:'20',dkd:'15',dkc:'50'},['300','Dose total','6,00 mL']);
 // 12 kg x 50 mg/kg/dia = 600 mg/dia; em 3 doses = 200 mg de 8 em 8 h; 200 / 40 mg/mL = 5 mL
 run('dosekg',{dkb:'_p',dkf:'_3'},{dkw:'12',dkd:'50',dkc:'40'},['200','Por dose','600','8 em 8 h','5,00 mL']);
 run('dosekg',{dkb:'_p',dkf:'_1'},{dkw:'70',dkd:'5'},['350','24 em 24 h']);
 run('dosekg',{},{dkw:'20',dkd:'15'},['Faltam itens']);
 // Gotas: 200 mg/mL e 20 gotas/mL = 10 mg por gota; 500 mg = 50 gotas = 2,5 mL
 run('gotas',{gou:'_mg',gob:'_c'},{goc:'200',gon:'20',god:'500'},['50','gotas','10,0 mg','2,50 mL']);
 // 25 mg por gota; 510 mg = 20,4 -> 20 gotas = 500 mg
 run('gotas',{gou:'_mg',gob:'_g'},{gog:'25',god:'510'},['20','20,4 gotas','Dose com 20 gotas','500 mg']);
 // 200 UI por gota; 1000 UI = 5 gotas
 run('gotas',{gou:'_ui',gob:'_g'},{gog:'200',god:'1000'},['5','gotas','200 UI']);
 run('gotas',{gou:'_mg',gob:'_g'},{gog:'25',god:'10'},['Menos de 1 gota','0,40']);
 // Diluição: 4 mg em 250 mL = 0,016 mg/mL = 16 µg/mL = 1,6 mg por 100 mL
 run('dil',{},{dlq:'4',dlv:'250'},['16','µg/mL','0,016','1,60 mg']);
 // 500 mg em 100 mL = 5 mg/mL; 125 mg = 25 mL
 run('dil',{},{dlq:'500',dlv:'100',dld:'125'},['5,00','mg/mL','25,00 mL']);
 run('dil',{},{dlq:'500',dlv:'100',dld:'600'},['Maior que o total diluído']);
 // Ampolas: mEq/mL = % x 10 x valência / massa molar
 // KCl 19,1%: 191 / 74,55 = 2,562 mEq/mL; 40 mEq = 15,6 mL
 run('meq',{mqs:'_0',mqp0:'_2',mqd:'_e'},{mqv:'40'},['15,6','mL','2,56 mEq/mL']);
 // KCl 10%: 100 / 74,55 = 1,341 mEq/mL; 10 mL = 13,4 mEq = 1000 mg
 run('meq',{mqs:'_0',mqp0:'_0',mqd:'_v'},{mqv:'10'},['13,4','mEq','1,34 mEq/mL','1.000 mg']);
 // NaCl 20%: 200 / 58,44 = 3,422 mEq/mL; 20 mEq = 5,84 mL
 run('meq',{mqs:'_1',mqp1:'_5',mqd:'_e'},{mqv:'20'},['5,84','3,42 mEq/mL']);
 // MgSO4 50%: 500 x 2 / 246,47 = 4,057 mEq/mL; 10 mL = 40,6 mEq
 run('meq',{mqs:'_3',mqp3:'_9',mqd:'_v'},{mqv:'10'},['40,6','4,06 mEq/mL']);
 // CaCl2 10%: 100 x 2 / 147,01 = 1,360 mEq/mL; 10 mL = 13,6 mEq
 run('meq',{mqs:'_4',mqd:'_v'},{mqv:'10'},['13,6','1,36 mEq/mL']);
 // Gliconato de cálcio 10% (rótulo 0,465 mEq/mL): 10 mL = 4,65 mEq
 run('meq',{mqs:'_5',mqd:'_v'},{mqv:'10'},['4,65','0,465 mEq/mL']);
 // Fosfato de potássio 2 mEq/mL: massa do sal bloqueada
 run('meq',{mqs:'_7',mqd:'_m'},{mqv:'100'},['Sem massa no rótulo']);
 // Outra concentração: 1,5 mEq/mL; 30 mEq = 20 mL
 run('meq',{mqs:'_9',mqd:'_e'},{mqc:'1,5',mqv:'30'},['20,0','mL']);
 console.log('errors',errs,'fail',fail);process.exit(fail||errs.length?1:0)},300);
