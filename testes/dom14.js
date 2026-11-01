const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM('<!doctype html><body>'+fs.readFileSync('medcalc.html','utf8')+'</body>',{runScripts:'dangerously',url:'https://x.test/'});
const w=dom.window;w.scrollTo=()=>{};w.matchMedia=()=>({matches:false});w.requestAnimationFrame=f=>f();const errs=[];w.addEventListener('error',e=>errs.push(e.message));
let fail=0;
setTimeout(()=>{const d=w.document;
 const txt=()=>d.getElementById('out').textContent.replace(/\s+/g,' ');
 const run=(id,fn,expect)=>{w.location.hash='#'+id;w.eval('route()');fn(d.getElementById('app'));const t=txt();const ok=expect.every(e=>t.includes(e));if(!ok)fail++;console.log((ok?'OK  ':'FAIL')+' '+id.padEnd(9),t.slice(0,170))};
 const pick=(a,idx)=>a.querySelectorAll('.po').forEach((po,i)=>{const k=Array.isArray(idx)?idx[i]:idx;if(k!=null)po.querySelectorAll('button')[k].click()});
 const ck=(ids)=>ids.forEach(i=>{const c=d.getElementById(i);c.checked=true;c.dispatchEvent(new w.Event('change'))});
 const fl=(o)=>Object.entries(o).forEach(([k,v])=>{const i=d.getElementById(k);i.value=v;i.dispatchEvent(new w.Event('input'))});
 const sg=(id,v)=>d.querySelector(`#${id} [data-v="${v}"]`).click();
 const rd=(n,v)=>{const r=d.getElementById(n+v);r.checked=true;r.dispatchEvent(new w.Event('change'))};
 // Ottawa
 run('ottawat',a=>ck(['ot4']),['Regra positiva: Pé','Tornozelo','negativa']);
 run('ottawat',a=>ck(['ot5']),['Tornozelo e pé']);
 run('ottawaj',a=>ck(['oj1']),['Regra positiva']);
 // C-spine
 run('cspine',a=>ck(['cs2']),['Regra positiva','alto risco']);
 run('cspine',a=>ck(['cs5']),['Avaliar rotação']);
 run('cspine',a=>{ck(['cs5']);rd('csr','1')},['Regra negativa']);
 run('cspine',a=>{ck(['cs5']);rd('csr','0')},['Regra positiva','Não consegue']);
 run('cspine',a=>{rd('csr','1')},['Nenhum fator de baixo risco']);
 // Rockall pre: 1+1+2 = 4 -> 24,6%
 run('rockall',a=>{sg('rkm','P');pick(a,[1,1,1])},['4','24,6%']);
 run('rockall',a=>{sg('rkm','C');pick(a,[1,1,1])},['Faltam itens']);
 run('rockall',a=>{sg('rkm','C');pick(a,[1,1,1,1,1])},['7','27%','43,8%']);
 run('rockall',a=>{sg('rkm','C');pick(a,[2,2,2,2,1])},['11','41,1%']);
 run('aims65',a=>{ck(['am1x']);const c=d.getElementById('am1x');c.checked=false;c.dispatchEvent(new w.Event('change'))},['0','0,3%']);
 run('aims65',a=>ck(['am1x','am2x','am3x','am4x','am5x']),['5','31,8%']);
 // Maddrey: 4.6*(20-12)+5 = 41.8
 run('maddrey',a=>fl({mdp:20,mdc:12,mdb:5}),['41,8','grave']);
 // Lille: expected from python
 run('lille',a=>fl({lia:50,lial:2.5,lib0:15,lib7:12,lipt:20}),['0,31']);
 run('lille',a=>{fl({lia:50,lial:2.5,lib0:15,lib7:12,lipt:20});ck(['lir'])},['0,36']);
 // FOUR
 run('four',a=>pick(a,[0,1,0,0]),['15','/ 16']);
 run('aspects',a=>ck(['as1','as5','as8']),['7','≤ 7']);
 run('aspects',a=>{ck(['as1']);const c=d.getElementById('as1');c.checked=false;c.dispatchEvent(new w.Event('change'))},['10','TC normal']);
 // CPIS 2+1+2+2+2+2 = 11
 run('cpis',a=>pick(a,[2,1,2,1,2,2]),['11','Sugere']);
 run('cpis',a=>pick(a,[1,1,1,0,1,1]),['5','Não sugere']);
 // SIC: INR >1.4 (2) + plt 100-149 (1) + SOFA 1 = 4, coag 3 -> positive
 run('sic',a=>pick(a,[2,1,1]),['4','SIC presente']);
 run('sic',a=>pick(a,[1,1,2]),['4','Não preenche']);
 run('candida',a=>ck(['cn1','cn4']),['3','Alto risco']);
 run('candida',a=>ck(['cn1','cn2']),['2','Baixo risco','2,3%']);
 // Rodwell: no mature (2)+ I:M + plaquetas = 4
 run('rodwell',a=>{pick(a,[2]);ck(['rw5','rw6'])},['4','possível']);
 run('rodwell',a=>{pick(a,[0])},['0','improvável']);
 // Finnegan: choro 2, sono <2h 2, moro 2, tremor man 1, sem man 0, temp 1, FR 1, fezes 2 = 11 + sudorese 1 = 12
 run('finnegan',a=>{pick(a,[1,2,1,1,0,1,1,1]);ck(['fn10'])},['12','≥ 8']);
 run('finnegan',a=>{pick(a,[0,0,0,0,0,0,0,0])},['0','&lt; 8'.replace('&lt;','<')]);
 // RN
 run('rnclass',a=>{fl({rcs:40,rcd:0,rcw:3380});sg('rcsx','M')},['AIG','Termo completo','2.880 a 3.940']);
 run('rnclass',a=>{fl({rcs:40,rcd:0,rcw:2800});sg('rcsx','M')},['PIG']);
 run('rnclass',a=>{fl({rcs:40,rcd:0,rcw:4100});sg('rcsx','F')},['GIG','Macrossomia']);
 run('rnclass',a=>{fl({rcs:30,rcd:3,rcw:1200});sg('rcsx','F')},['Muito pré-termo','Muito baixo peso']);
 run('rnclass',a=>{fl({rcs:23,rcd:0,rcw:500});sg('rcsx','F')},['fora da faixa']);
 run('aldrete',a=>pick(a,[0,0,1,0,0]),['9','Atinge']);
 run('aldrete',a=>pick(a,[1,1,1,0,0]),['7','Abaixo']);
 // PREVENT: preventr README example -> total 14,7, ascvd 9,2, hf 8,1
 run('prevent',a=>{fl({pva:50,pvtc:200,pvhd:45,pvsb:160,pvim:35,pvtf:90});sg('pvsx','F');ck(['pvdm','pvah'])},['9,2','14,7%','8,1%','intermediário']);
 // CRUSADE: 3+28+6+5+8+6 = 56
 run('crusade',a=>{fl({crh:35,crc:50,crf:95,crp:110});sg('crsx','F');ck(['cr3'])},['56','19,5%']);
 run('crusade',a=>{fl({crh:45,crc:130,crf:60,crp:130});sg('crsx','M')},['1','3,1%']);
 // 4PEPS: <50 (-2) + HR<80 (-1) = -3
 run('peps4',a=>{pick(a,[0]);ck(['pp2'])},['−3','muito baixa']);
 run('peps4',a=>{pick(a,[2]);ck(['pp4','pp9','pp11','pp6'])},['12','moderada']);
 run('peps4',a=>{pick(a,[2]);ck(['pp4','pp9','pp11','pp6','pp3'])},['13','alta']);
 run('hama',a=>pick(a,2),['28','grave']);
 run('hama',a=>pick(a,0),['0','Sem ansiedade']);
 run('hamd',a=>pick(a,1),['17','moderada']);
 run('hamd',a=>pick(a,0),['0','Sem depressão']);
 // MELD-Na: Cr 2, Bil 4, INR 2, Na 130 -> MELD-Na 29
 run('meld',a=>{fl({bil:4,crm:2,inr:2,nam:130});sg('sexm','M')},['MELD-Na (OPTN/EUA)29']);
 run('meld',a=>{fl({bil:1,crm:1,inr:1,nam:130});sg('sexm','M')},['MELD-Na (OPTN/EUA)6']);
 console.log('errors',errs,'fail',fail);process.exit(0)},300);
