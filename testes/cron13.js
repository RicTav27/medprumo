// checagem de ritmo: 10 s após os 2 min, depois aviso para Novo ciclo
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.__vib=0;navigator.vibrate=()=>{window.__vib++;return true}});
await p.clock.install();await p.goto('file://'+process.argv[2]+'#cron');await p.clock.runFor(300);await p.click('.modes [data-m="rcp"]');const go=ms=>p.clock.runFor(ms);
const st=async()=>`${await p.innerText('#cl')} | ${await p.innerText('#cr')} | Novo ciclo vermelho: ${await p.evaluate(()=>document.getElementById('b2').classList.contains('due'))} | alertas: ${await p.evaluate(()=>__vib)}`;
await p.click('#b1');await go(119000);console.log('1:59 ',await st());
await go(1200);console.log('2:00 ',await st());await p.screenshot({path:'chk10a.png'});
await go(5000);console.log('2:05 ',await st());
await go(5500);console.log('2:11 ',await st());await p.screenshot({path:'chk10b.png'});
await p.click('#b2');await go(200);console.log('Novo ciclo',await st());
console.log('registro:',(await p.innerText('#log')).replace(/\s+/g,' ').slice(0,120));
await go(130500);console.log('2º ciclo 2:10',await st());
console.log('erros',errs);await b.close()})();
