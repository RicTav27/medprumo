// sem caixa de conduta; ritmo, drogas e registro seguem funcionando
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.clock.install();await p.goto('file://'+process.argv[2]+'#cron');await p.clock.runFor(300);await p.click('.modes [data-m="rcp"]');const go=ms=>p.clock.runFor(ms);
await p.click('#b1');await p.click('#rit [data-k="c"]');await p.click('#dS');await go(1000);console.log('caixa existe:',await p.locator('#nx,.next').count());
await go(120000);await p.click('#b2');await p.click('#rit [data-k="n"]');await go(100);console.log('não chocável, choque apagado:',await p.getAttribute('#dS','data-off'));
await p.click('#dA');await go(100);console.log('registro:',(await p.innerText('#log')).replace(/\s+/g,' ').slice(0,150));
await p.screenshot({path:'semcaixa.png'});console.log('erros',errs);await b.close()})();
