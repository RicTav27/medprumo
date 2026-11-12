/* Altura fixa da tela: o teclado não reajusta o layout */
(function(){let w=0;function set(f){const W=innerWidth,H=innerHeight;if(!f&&W===w)return;w=W;const r=document.documentElement.style;r.setProperty('--hpx',H+'px');r.setProperty('--h1',(H/100)+'px');document.documentElement.classList.toggle('vshort',H<=600);document.documentElement.classList.toggle('vxshort',H<=500)}
set(true);addEventListener('resize',()=>set(false));addEventListener('orientationchange',()=>setTimeout(()=>set(true),300))})();

/* Tema: o salvo pelo usuário (só claro ou escuro). Sem escolha salva, computador abre no claro; celular segue o sistema */
(function(){const d=document.documentElement;let t=null;try{t=localStorage.getItem('theme')}catch(e){}
if(t==='light'||t==='dark')d.dataset.theme=t;else if(window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches)d.dataset.theme='light'})();
/* Cor da barra do sistema acompanha o tema escolhido no app (sem escolha, segue o sistema pelas duas meta do HTML) */
window.themeMeta=function(){const t=document.documentElement.dataset.theme;if(t!=='light'&&t!=='dark')return;
document.querySelectorAll('meta[name="theme-color"]').forEach(m=>{m.removeAttribute('media');m.setAttribute('content',t==='dark'?'#0e0f11':'#f2f4f8')})};
window.themeMeta();
