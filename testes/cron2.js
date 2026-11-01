const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.__f=[];const O=window.AudioContext;window.AudioContext=class extends O{createOscillator(){const o=super.createOscillator();const self=this;const st=o.start.bind(o);o.start=t=>{window.__f.push([Math.round(o.frequency.value),+(t-self.__t0||0).toFixed(2)]);st(t)};return o}}});
await p.goto('file://'+process.argv[2]+'#cron');await p.waitForTimeout(300);
const T=async s=>(await p.innerText(s)).replace(/\s+/g,' ');
await p.click('.modes [data-m="rcp"]');
await p.click('#tm');await p.evaluate(()=>{AC.__t0=AC.currentTime;__f=[]});await p.waitForTimeout(6000);
let f=await p.evaluate(()=>__f);console.log('metrônomo 110: bipes em 6 s =',f.length,'intervalo médio',(f.length>1?((f[f.length-1][1]-f[0][1])/(f.length-1)).toFixed(3):'-'),'(esperado 0,545)');
await p.click('#bpm [data-b="120"]');await p.evaluate(()=>{__f=[]});await p.waitForTimeout(3000);f=await p.evaluate(()=>__f);console.log('120 bpm intervalo',((f[f.length-1][1]-f[0][1])/(f.length-1)).toFixed(3),'(esperado 0,5)');
await p.click('#tm');console.log('vent removido:',await p.locator('#tv').count()===0);
// DU: injeta contrações
await p.click('.modes [data-m="du"]');
await p.evaluate(()=>{const t=Date.now(),m=60000;CR.u.list=[];for(let i=0;i<7;i++)CR.u.list.push({s:t-(35-i*5)*m+ 1000,e:t-(34-i*5)*m});});await p.waitForTimeout(200);
console.log('DU 7 contr. a cada 5 min:',await T('#du'));
await p.evaluate(()=>{const t=Date.now(),m=60000;CR.u.list=[];for(let i=0;i<20;i++)CR.u.list.push({s:t-(30-i*1.5)*m+1000,e:t-(30-i*1.5)*m+46000});});await p.waitForTimeout(200);
console.log('DU 20 contr. a cada 1,5 min:',await T('#du'));
await p.click('#bc');await p.waitForTimeout(2100);console.log('contração em curso:',await T('#wl'),await T('#w'),await T('#bc'));await p.click('#bc');await p.waitForTimeout(100);console.log('log topo:',(await T('#log')).slice(0,60));
console.log('erros',errs);await b.close()})();
