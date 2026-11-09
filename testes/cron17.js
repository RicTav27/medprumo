// cronômetros: casos fora dos testes antigos (dados salvos corrompidos, relógio que pula, DU contra cálculo independente, layout, toques seguidos)
const {chromium}=require('playwright');
const F='file://'+process.argv[2];
const T0=new Date('2026-10-25T10:00:00').getTime();
const out=(ok,msg)=>console.log((ok?'OK   ':'ERRO ')+msg);
(async()=>{const b=await chromium.launch();
const nova=async(save,{w=390,h=844,time=T0}={})=>{const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:true});const p=await ctx.newPage();const errs=[];p.errs=errs;p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/vibrate/.test(m.text()))errs.push(m.text())});
  await p.clock.install({time});
  if(save!==undefined)await p.addInitScript(s=>localStorage.setItem('cron',s),typeof save==='string'?save:JSON.stringify(save));
  await p.goto(F+'#cron');await p.clock.runFor(300);return p};
const T=async(p,s)=>(await p.innerText(s)).replace(/\s+/g,' ');

// A) relógio pula (aba em segundo plano / tela bloqueada): o que o registro mostra
{const p=await nova();await p.click('.modes [data-m="rcp"]');await p.click('#b1');await p.clock.fastForward(5*60000);await p.clock.runFor(100);
 const log=await T(p,'#log');console.log('A) 5 min num salto só, registro:',log);
 out(/02:00 2 min/.test(log),'alerta de 2 min registrado com o horário devido (02:00)');out(/02:10 10 s/.test(log),'alerta de 10 s registrado com o horário devido (02:10)');await p.context().close()}

// B) dados salvos corrompidos
const lixo={
 'JSON quebrado':'{',
 'null':'null','array':'[]',
 'versão errada':{v:2,mode:'rcp'},
 'modo inválido':{v:1,mode:'xx'},
 'tipos trocados':{v:1,mode:'rcp',s:{acc:'a',run:'sim',laps:'x',beep:1},r:{adr:[1,'a',null,-5,1e999],ami:'x',log:[{t:1,txt:'<img src=x onerror=window.__xss=1>'},{t:'a'},null,{t:5,txt:5}],rit:'zzz',cyc:-3,shock:'3'},u:{list:[{s:5,e:1},{s:1,e:2},null,'x'],cur:'x'}},
 'run sem t0':{v:1,mode:'rcp',r:{run:true}},
 'run com t0 no futuro':{v:1,mode:'rcp',r:{run:true,t0:T0+3600000,acc:0}},
 'números enormes':{v:1,mode:'simples',s:{run:true,t0:1,acc:1e300}},
 'du com cur antigo':{v:1,mode:'du',u:{list:[],cur:1}},
};
for(const [k,v] of Object.entries(lixo)){const p=await nova(v);const txt=await p.evaluate(()=>document.getElementById('app').innerText.replace(/\s+/g,' ').slice(0,200));
 const w=await p.evaluate(()=>document.querySelector('#w')?.innerText.replace(/\s+/g,' ')||'(sem #w)');
 const xss=await p.evaluate(()=>!!window.__xss||!!document.querySelector('#app img'));const ov=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
 console.log(`B) ${k}: tempo "${w}"${xss?' | XSS!':''}${ov?' | vaza na horizontal':''}${p.errs.length?' | erros '+JSON.stringify(p.errs):''}`);
 out(!p.errs.length&&!xss&&txt.length>20,'B) '+k+' abre sem erro');await p.context().close()}

// C) DU contra cálculo independente (listas aleatórias, relógio fixo)
{let seed=7;const rnd=()=>(seed=(seed*1664525+1013904223)%4294967296)/4294967296;let bad=0,n=0;
 for(let k=0;k<40;k++){const now=T0,list=[];let t=now-(rnd()<.5?35:12)*60000-rnd()*600000;
  const cnt=Math.floor(rnd()*40);for(let i=0;i<cnt;i++){const d=(20+rnd()*70)*1000;t+=(30+rnd()*240)*1000;if(t+d>now-1000)break;list.push({s:Math.round(t),e:Math.round(t+d)})}
  // casos de borda: contração exatamente a 10 e a 30 min
  if(k%5===0&&list.length)list[list.length-1].s=now-600000,list[list.length-1].e=now-600000+40000;
  const cur=k%3===0?now-20000:null;
  const p=await nova({v:1,mode:'du',u:{list,cur}});
  const R=list.filter(c=>c.s>=now+0-1800000),L=list;const e10=L.filter(c=>c.s>=now-600000).length+(cur?1:0);
  const tNow=await p.evaluate(()=>Date.now());
  const in10=L.filter(c=>c.s>=tNow-600000).length+(cur?1:0);
  const r30=L.filter(c=>c.s>=tNow-1800000);
  const dur=r30.length?Math.round(r30.reduce((a,c)=>a+(c.e-c.s),0)/r30.length/1000):null;
  const ints=L.slice(1).map((c,i)=>[c.s,c.s-L[i].s]).filter(x=>x[0]>=tNow-1800000).map(x=>x[1]);const int=ints.length?ints.reduce((a,c)=>a+c,0)/ints.length:null;
  const txt=await T(p,'#du');const m=txt.match(/^(\d+)contrações \/ 10 min/);const dm=txt.match(/Duração média (\d+) s|Duração média (sem dados)/);const im=txt.match(/Intervalo médio (\d\d):(\d\d)|Intervalo médio (sem dados)/);
  const gotIn10=m&&+m[1],gotDur=dm&&(dm[1]!==undefined?+dm[1]:null),gotInt=im&&(im[1]!==undefined?(+im[1]*60+ +im[2]):null);
  const expInt=int==null?null:Math.floor(int/1000);
  n++;if(gotIn10!==in10||gotDur!==dur||gotInt!==expInt){bad++;console.log('   difere k='+k,{in10,gotIn10,dur,gotDur,expInt,gotInt,txt:txt.slice(0,150)})}
  await p.context().close()}
 out(!bad,`C) DU: ${n-bad}/${n} listas aleatórias batem com o cálculo independente`)}
// C2) média de 30 min e taquissistolia: limiar 5 por 10 min = 15 contrações em 30 min não é taqui, 16 é
for(const [n,exp] of [[15,false],[16,true]]){const nn=n+1;const now=T0,list=[];for(let i=0;i<nn;i++){const s=now-1790000+i*Math.floor(1700000/nn);list.push({s,e:s+45000})}
 // primeira contração precisa ter 30 min de histórico: coloca a 1ª a 30 min
 list[0].s=now-1800000-1000;list[0].e=list[0].s+45000;
 const p=await nova({v:1,mode:'du',u:{list,cur:null}});const t=await T(p,'#du');const taq=/Taquissistolia/i.test(t);const med=(t.match(/Média\/10 min \(30 min\) ([\d,]+)/)||[])[1];
 out(taq===exp,`C2) ${n} contrações em 30 min: média ${med}, taquissistolia ${taq} (esperado ${exp})`);await p.context().close()}

// D) layout e alvos de toque com valores grandes, telas pequenas
for(const [w,h] of [[320,568],[360,640],[390,844]]){
 const dados={v:1,mode:'rcp',r:{run:true,t0:T0-(1000*60+30)*1000,acc:0,cyc:0,adr:[1e6,2e6,3e6,4e6,5e6,6e6,7e6,8e6,9e6,1e7],ami:[1,2],shock:12,rit:'c',lastRit:'c',log:Array.from({length:60},(_,i)=>({t:i*1000,txt:i%3?'Choque '+i:'Adrenalina 1 mg ('+i+'ª)'}))},u:{list:[],cur:null}};
 for(const modo of ['rcp','simples','du']){const d={...dados,mode:modo,s:{t0:T0-(2000*60+1)*1000,acc:0,run:true,laps:Array.from({length:40},(_,i)=>i*1000),beep:true,lastMin:0},u:{list:Array.from({length:60},(_,i)=>({s:T0-3600000+i*60000,e:T0-3600000+i*60000+50000})),cur:T0-10000}};
  const p=await nova(d,{w,h});const r=await p.evaluate(()=>({ov:document.documentElement.scrollWidth-innerWidth,sm:[...document.querySelectorAll('#app button')].filter(e=>e.offsetParent&&!e.closest('details')&&e.getBoundingClientRect().height<36&&!e.classList.contains('mini')).map(e=>e.id||e.textContent.trim().slice(0,12)+':'+Math.round(e.getBoundingClientRect().height)),wt:(()=>{const e=document.querySelector('#w');return e&&e.scrollWidth>e.clientWidth})()}));
  out(r.ov<=0&&!r.wt&&!r.sm.length,`D) ${w}x${h} ${modo}: vaza ${r.ov}px | tempo cortado ${r.wt} | botões <40px ${JSON.stringify(r.sm)}${p.errs.length?' erros '+p.errs:''}`);await p.context().close()}}

// E) toque seguido no mesmo botão em menos de 1 s é ignorado; depois de 1 s conta
{const p=await nova();await p.click('.modes [data-m="rcp"]');await p.click('#b1');await p.clock.runFor(1000);
 for(const [id,c,nome] of [['#dA','#cA','adrenalina'],['#dM','#cM','amiodarona'],['#dS','#cS','choque']]){
  await p.click(id);await p.clock.runFor(150);await p.click(id);await p.clock.runFor(100);const a=await T(p,c);
  await p.clock.runFor(1000);await p.click(id);await p.clock.runFor(100);const b2=await T(p,c);
  out(a==='1'&&b2==='2',`E) ${nome}: 2 toques em 150 ms contam ${a} (esperado 1); novo toque após 1 s conta ${b2} (esperado 2)`)}
 await p.context().close()}
{const p=await nova();await p.click('.modes [data-m="rcp"]');await p.click('#b2');await p.clock.runFor(100);console.log('E2) Novo ciclo antes de iniciar → registro:',await T(p,'#log'),'| tempo',await T(p,'#w'));await p.context().close()}

// F) metrônomo ao pausar a RCP
{const p=await nova();await p.addInitScript(()=>{});await p.click('.modes [data-m="rcp"]');await p.click('#b1');await p.click('#tm');await p.clock.runFor(500);await p.click('#b1');await p.clock.runFor(500);
 console.log('F) RCP pausada, metrônomo ligado?',await p.getAttribute('#tm','aria-pressed'),'| intervalo ativo?',await p.evaluate(()=>!!MET.timer&&MET.on));await p.context().close()}

// G) relógio do aparelho volta 1 h com a RCP rodando
{const p=await nova();await p.click('.modes [data-m="rcp"]');await p.click('#b1');await p.clock.runFor(60000);const a=await T(p,'#w');await p.clock.setSystemTime(T0-3600000);await p.clock.runFor(1000);
 console.log('G) relógio -1 h: antes',a,'| depois',await T(p,'#w'));await p.context().close()}

// H) salvar ao ocultar a página
{const p=await nova();await p.click('#b1');await p.clock.runFor(2500);const s=await p.evaluate(()=>{Object.defineProperty(document,'visibilityState',{value:'hidden',configurable:true});document.dispatchEvent(new Event('visibilitychange'));return JSON.parse(localStorage.getItem('cron')).s.run});out(s===true,'H) estado salvo ao ocultar a página (simples rodando)');await p.context().close()}
await b.close()})();
