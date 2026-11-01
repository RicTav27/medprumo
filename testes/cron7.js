// persistência: recarregar a página e conferir que tudo continua
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844}});
await ctx.addInitScript(()=>{window.__wl=0;if(navigator.wakeLock){const o=navigator.wakeLock.request.bind(navigator.wakeLock);navigator.wakeLock.request=t=>{window.__wl++;return o(t)}}});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'#cron');await p.waitForTimeout(300);
const T=async s=>(await p.innerText(s)).replace(/\s+/g,' ');
await p.click('#b1');await p.waitForTimeout(2200);await p.click('#b2');
await p.click('.modes [data-m="rcp"]');await p.click('#b1');await p.click('#rit [data-k="c"]');await p.click('#dS');await p.waitForTimeout(1200);
await p.click('.modes [data-m="du"]');await p.click('#bc');await p.waitForTimeout(1500);
console.log('pedidos de tela acesa antes do reload:',await p.evaluate(()=>__wl));
await p.reload();await p.waitForTimeout(1500);
console.log('modo após reload:',await p.evaluate(()=>CR.mode),'| tela acesa pedida de novo:',await p.evaluate(()=>__wl)>0);
console.log('DU contração em curso:',await T('#wl'),await T('#w'));
await p.click('.modes [data-m="rcp"]');await p.waitForTimeout(200);console.log('RCP:',await T('#w'),await T('#b1'),'| ritmo marcado:',await p.getAttribute('#rit [data-k="c"]','aria-pressed'),'| choques',await T('#cS'));console.log('  log:',(await T('#log')).slice(0,110));
await p.click('.modes [data-m="simples"]');await p.waitForTimeout(200);console.log('Simples:',await T('#w'),await T('#b1'),'| voltas:',await T('#laps'));
await p.click('.modes [data-m="rcp"]');await p.click('#rz');await p.click('.dlg [data-a="y"]');await p.waitForTimeout(1200);await p.reload();await p.waitForTimeout(500);await p.click('.modes [data-m="rcp"]');await p.waitForTimeout(200);console.log('RCP zerada continua zerada após reload:',await T('#w'),await T('#b1'));
console.log('erros',errs);await b.close()})();
