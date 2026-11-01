const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM('<!doctype html><body>'+fs.readFileSync('medcalc.html','utf8')+'</body>',{runScripts:'dangerously',url:'https://x.test/'});
const w=dom.window;w.scrollTo=()=>{};w.matchMedia=()=>({matches:false});const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{const d=w.document;const o=()=>d.getElementById('out').textContent.replace(/\s+/g,' ').trim();const go=id=>{w.location.hash='#'+id;w.eval('route()')};
 const val=(id,v)=>{const i=d.getElementById(id);i.value=v;i.dispatchEvent(new w.Event('input',{bubbles:true}));i.dispatchEvent(new w.Event('change',{bubbles:true}))};
 const ck=id=>{const i=d.getElementById(id);i.checked=true;i.dispatchEvent(new w.Event('change',{bubbles:true}))};
 const seg=(id,v)=>d.querySelector(`#${id} [data-v="${v}"]`).click();
 const pick=(id,v)=>d.querySelector(`.po button[data-for="${id}"][data-v="${v}"]`).click();
 // IG: DUM 2026-01-01, USG 2026-08-01 (IG DUM 30s1d) com IG USG 33s → discrepância 20 d (manter) / 34s → 27 d (redatar)
 go('ig');val('dum','2026-01-01');val('dref','2026-08-10');val('dus','2026-08-01');val('usw','33');val('usd','0');console.log('IG 33s:',o().slice(0,160));
 val('usw','34');console.log('IG 34s:',o().slice(0,160));
 // gaso alcalose metabólica pH 7,50 HCO3 34 pCO2 47 → esperado 43,8 (38,8 a 48,8) → compensada
 go('gaso');val('gph','7.5');val('gpc','47');val('ghc','34');console.log('gaso:',o().slice(0,140));
 // PSI ≤50 com só exame laboratorial alterado → classe I
 go('psi');val('psa','40');seg('pss','M');ck('ps13');console.log('psi lab:',o());ck('ps9');console.log('psi PAS:',o());
 // Capurro máximo
 go('capurro');[['cpu1','24'],['cpu2','15'],['cpu3','15'],['cpu4','20'],['cpu5','20']].forEach(([k,v])=>pick(k,v));console.log('capurro max:',o());
 // Lund 20% adulto
 go('lund');val('lwa','30');seg('lty','T');val('lta','1');val('lad','1');val('lae','1');console.log('lund 21%:',o().slice(0,120));
 go('lund');val('lwa','30');seg('lty','T');val('lta','1');val('lfd','1');val('lfe','1');val('lg','1');console.log('lund 20%:',o().slice(0,120));
 go('mottling');console.log('mott how ok:',/12% quando/.test(d.getElementById('app').textContent));
 go('ims');d.querySelector('input[name="im"][value="5"]').click();console.log('ims:',o());
 console.log('erros',errs);process.exit(0)},300);
