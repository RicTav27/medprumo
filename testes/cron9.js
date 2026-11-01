// pré-hospitalar: inicia sem ritmo, DEA dá choque
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:900},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.clock.install();await p.goto('file://'+process.argv[2]+'#cron');await p.clock.runFor(300);await p.click('.modes [data-m="rcp"]');
const T=async s=>(await p.innerText(s)).replace(/\n+/g,' | ');const go=ms=>p.clock.runFor(ms);
await p.click('#b1');await go(1000);console.log('sem ritmo, botões ativos:',await p.getAttribute('#dS','data-off'));
await p.screenshot({path:'semritmo.png'});
await go(60000);await p.click('#dS');await go(100);console.log('DEA chocou, chocável marcado:',await p.getAttribute('#rit [data-k="c"]','aria-pressed'));
console.log('log:',(await T('#log')).slice(0,140));console.log('erros',errs);await b.close()})();
