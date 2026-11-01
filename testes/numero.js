// Leitura dos números digitados: vírgula e ponto decimais, ponto de milhar (1.000 = mil) e texto inválido
// Uso: node numero.js   (de dentro de testes/, depois de ./preparar.sh)
const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM('<!doctype html><body>'+fs.readFileSync('medcalc.html','utf8')+'</body>',{runScripts:'dangerously',url:'https://x.test/'});
const w=dom.window;w.scrollTo=()=>{};w.matchMedia=()=>({matches:false});const errs=[];w.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{const P=w.eval('pnum');let fail=0;
 // 1. Tabela: [texto, limite, campo ×10³, esperado]
 const A=[0,10000],B=[0.1,20],K=[1,2000];
 const casos=[['70',A,0,70],['7,5',A,0,7.5],['7.5',A,0,7.5],[' 70 ',A,0,70],['1 000',A,0,1000],['−5',[-50,50],0,-5],['-3,5',[-50,50],0,-3.5],['+5',A,0,5],
  ['1.000',A,0,1000],['15.000',[0,200000],0,15000],['5.200',[0,100000],0,5200],['1.000.000',[0,2e6],0,1e6],['1.000,5',A,0,1000.5],['1,000.5',A,0,1000.5],
  ['1.200',B,0,1.2],['7.350',[6.5,8],0,7.35],['0.250',A,0,0.25],['1000.000',A,0,1000],['2.5',A,0,2.5],['1.25',A,0,1.25],
  ['150.000',K,1,150],['1.500',K,1,1.5],['150',K,1,150],['12.500',[0,200],0,12.5],['-1.000',[-50,50],0,-1],
  ['1,',A,0,1],[',5',A,0,0.5],['1.',A,0,1],['',A,0,NaN],['-',A,0,NaN],[',',A,0,NaN],['.',A,0,NaN],['12,3,4',A,0,NaN],['1.2.3',A,0,NaN],
  ['70kg',A,0,NaN],['1e3',A,0,NaN],['1e309',A,0,NaN],['abc',A,0,NaN],['<b>1</b>',A,0,NaN],['1.0000',A,0,1],['12.34',A,0,12.34],['1.2,5',A,0,NaN]];
 for(const [t,L,k,e] of casos){const v=P(t,L,!!k),ok=Number.isNaN(e)?Number.isNaN(v):v===e;if(!ok)fail++;
  if(!ok)console.log('FALHA',JSON.stringify(t),'limite',L.join('..'),k?'×10³':'','esperado',e,'veio',v)}
 console.log('tabela:',casos.length,'casos,',fail,'falhas');
 // 2. Em todas as ferramentas: digitar com ponto de milhar dá o mesmo resultado que sem ponto
 const d=w.document,LIM=w.eval('LIM');let comp=0,f2=0;
 const preencher=app=>{app.querySelectorAll('input.num').forEach(i=>{const l=LIM[i.id]||[0,1];const v=(l[0]+l[1])/2*0.3+l[0]*0.7;i.value=String(+v.toFixed(2)).replace('.',',')});
  app.querySelectorAll('input[type=date]').forEach(i=>{if(!i.value)i.value='2026-03-01'});
  app.querySelectorAll('.po').forEach(po=>{const bs=po.querySelectorAll('button');bs[Math.min(1,bs.length-1)].click()});
  const nm=new Set();app.querySelectorAll('input[type=radio]').forEach(r=>{if(!nm.has(r.name)){nm.add(r.name);r.checked=true}});
  app.querySelectorAll('.seg').forEach(s=>s.querySelector('button').click())};
 const res=(app,i,txt)=>{i.value=txt;i.dispatchEvent(new w.Event('input'));return d.getElementById('out').textContent.replace(/\s+/g,' ')};
 const milhar=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
 for(const id of w.eval('TOOLS.map(t=>t.id)')){w.location.hash='#'+id;w.eval('route()');const app=d.getElementById('app');preencher(app);
  for(const i of app.querySelectorAll('input.num')){const [a,b]=LIM[i.id]||[0,100000],kilo=/×\s?10/.test(i.closest('label')?.textContent||'');const base=i.value;
   const pares=[];
   if(!kilo&&b>=1000){const n=Math.max(1000,Math.ceil(a));if(n<=b)pares.push([milhar(n),String(n)])}
   if(kilo&&a<=150&&b>=150)pares.push(['150.000','150']);
   if(b<1000&&a<=1.2&&b>=1.2)pares.push(['1.200','1,2']);
   for(const [x,y] of pares){comp++;const r1=res(app,i,x),r2=res(app,i,y);if(r1!==r2||/fora do limite/i.test(r1)){f2++;console.log('FALHA',id,i.id,`"${x}"`,'→',r1.slice(0,70),'| "'+y+'" →',r2.slice(0,70))}}
   res(app,i,base)}}
 console.log('ferramentas: ',comp,'comparações,',f2,'falhas');
 console.log('erros',errs);process.exit(fail+f2?1:0)},300);
