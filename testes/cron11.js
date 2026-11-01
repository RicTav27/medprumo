// ritmo começa desmarcado ao abrir o cronômetro; trocar de aba não desmarca
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'#cron');await p.waitForTimeout(300);await p.click('.modes [data-m="rcp"]');
const sel=async()=>p.$$eval('#rit button[aria-pressed="true"]',x=>x.map(y=>y.dataset.k).join()||'nenhum');
await p.click('#b1');await p.click('#rit [data-k="c"]');await p.waitForTimeout(100);console.log('marcado:',await sel());
await p.click('.modes [data-m="simples"]');await p.click('.modes [data-m="rcp"]');console.log('troca de aba, continua:',await sel());
await p.evaluate(()=>location.hash='#imc');await p.waitForTimeout(100);await p.evaluate(()=>location.hash='#cron');await p.waitForTimeout(200);console.log('saiu e voltou:',await sel(),'| conduta visível:',await p.isVisible('#nx'),'| RCP rodando:',await p.innerText('#b1'));
await p.click('#rit [data-k="c"]');await p.waitForTimeout(1200);await p.reload();await p.waitForTimeout(500);console.log('reabriu o app:',await sel(),'| RCP rodando:',await p.innerText('#b1'));
console.log('log mantido:',(await p.innerText('#log')).replace(/\s+/g,' ').slice(0,90));console.log('erros',errs);await b.close()})();
