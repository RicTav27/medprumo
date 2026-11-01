const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.__al=0;window.__vib=0;navigator.vibrate=()=>{window.__vib++;return true}});
await p.clock.install();await p.goto('file://'+process.argv[2]+'#cron');await p.clock.runFor(300);
const T=async s=>(await p.innerText(s)).replace(/\s+/g,' ');const go=ms=>p.clock.runFor(ms);
// troca de modo mantém estado
await p.click('#b1');await go(5000);await p.click('.modes [data-m="rcp"]');await go(100);await p.click('.modes [data-m="simples"]');await go(100);console.log('simples segue rodando após trocar de aba:',await T('#w'),await T('#b1'));
// RCP: alerta de 2 min com o app em outra tela
await p.click('.modes [data-m="rcp"]');await go(100);await p.click('#dA');console.log('droga antes de iniciar:',(await T('#log')).slice(0,40));
await p.click('#b1');await go(1000);await p.evaluate(()=>location.hash='#imc');await go(121000);const v=await p.evaluate(()=>__vib);
await p.evaluate(()=>location.hash='#cron');await go(200);console.log('vibrou fora da tela:',v>0,'| log:',(await T('#log')).slice(0,70));
// novo ciclo e segundo alerta
await p.click('#b2');await go(119000);const v1=await p.evaluate(()=>__vib);await go(2000);console.log('2º alerta após novo ciclo:',(await p.evaluate(()=>__vib))>v1,'| ciclo:',await T('#cr'));
// pausa congela ciclo
await p.click('#b1');const c1=await T('#cr');await go(10000);console.log('pausado, ciclo congelado:',c1===await T('#cr'),await T('#b1'));
// zerar RCP
await p.click('#rz');await go(100);await p.click('.dlg [data-a="y"]');await go(100);console.log('zerado:',await T('#w'),await T('#b1'),'| adrenalina',await T('#cA'));
// metrônomo: liga, troca bpm, desliga ao zerar
await p.click('#tm');await p.click('#bpm [data-b="120"]');console.log('metrônomo on/120:',await p.getAttribute('#tm','aria-pressed'),await p.getAttribute('#bpm [data-b="120"]','aria-pressed'));
await p.click('#rz');await go(100);await p.click('.dlg [data-a="y"]');await go(100);console.log('metrônomo após zerar:',await p.getAttribute('#tm','aria-pressed'));
// DU: contração em curso, zerar
await p.click('.modes [data-m="du"]');await go(100);await p.click('#bc');await go(45000);await p.click('#bc');await go(1000);console.log('DU:',(await T('#du')).slice(0,80),'|',await T('#log'));
await p.click('#rz');await go(100);await p.click('.dlg [data-a="y"]');await go(100);console.log('DU zerado:',(await T('#du')).slice(0,40),'|',await T('#w'));
console.log('erros',errs);await b.close()})();
