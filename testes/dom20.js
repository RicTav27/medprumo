/* Índices de busca montados em fatias: busca antes do fim dá o mesmo resultado, e as fatias terminam sozinhas.
   Uso: node dom20.js (depois de ./preparar.sh) */
const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM('<!doctype html><body>'+fs.readFileSync(__dirname+'/medcalc.html','utf8')+'</body>',{runScripts:'dangerously',url:'https://x.test/',pretendToBeVisual:true});
const w=dom.window;w.scrollTo=()=>{};w.matchMedia=()=>({matches:false});const errs=[];w.addEventListener('error',e=>errs.push(e.message));
let fail=0;const ok=(c,m)=>{if(!c)fail++;console.log((c?'OK    ':'FALHA ')+m)};
const CQ=['pneumonia','diabetes','A00','iam','infarto agudo','j18','dengue','has','zzzz'],MQ=['dipirona','amoxicilina','losartana','novalgina','aas','zzzz'];
const busca=()=>w.eval(`JSON.stringify([${JSON.stringify(CQ)}.map(q=>cidSearch(q,norm(q),50)),${JSON.stringify(MQ)}.map(q=>medSearch(norm(q)))])`);
setTimeout(()=>{
 ok(w.eval('CIDX&&CIDX.length===CID10.length&&MEDX&&MEDX.length===MED.d.length'),'índices completos sozinhos depois da primeira tela');
 const cheio=busca();
 ok(JSON.parse(cheio)[0][0].length>0&&JSON.parse(cheio)[1][0].length>0,'busca acha pneumonia e dipirona');
 // índice pela metade: a busca completa o resto na hora
 w.eval('CIDX=null;CIDP.length=0;MEDX=null;MEDP.length=0;for(let i=0;i<5000;i++)CIDP.push(cidIRow(CID10[i]));for(let i=0;i<700;i++)MEDP.push(medRow(MED.d[i]))');
 ok(busca()===cheio,'busca com índice pela metade igual à do índice completo');
 ok(w.eval('CIDX.length===CID10.length&&MEDX.length===MED.d.length'),'índice completado pela busca, sem linha repetida');
 // do zero, sem fatias
 w.eval('CIDX=null;CIDP.length=0;MEDX=null;MEDP.length=0');
 ok(busca()===cheio,'busca com índice vazio igual à do índice completo');
 // fatias: nenhuma passa muito de 8 ms de trabalho seguido e o índice fica igual
 w.eval('CIDX=null;CIDP.length=0;MEDX=null;MEDP.length=0;idxWarm()');
 ok(w.eval('!CIDX&&CIDP.length>0&&CIDP.length<CID10.length'),'primeira fatia monta só uma parte');
 setTimeout(()=>{ok(w.eval('!!CIDX&&!!MEDX')&&busca()===cheio,'fatias terminam e a busca continua igual');
  console.log('errors',errs,'fail',fail);process.exit(fail||errs.length?1:0)},3000);
},3000);
