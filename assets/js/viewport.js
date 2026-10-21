/* Altura fixa da tela: o teclado não reajusta o layout */
(function(){let w=0;function set(f){const W=innerWidth,H=innerHeight;if(!f&&W===w)return;w=W;const r=document.documentElement.style;r.setProperty('--hpx',H+'px');r.setProperty('--h1',(H/100)+'px');document.documentElement.classList.toggle('vshort',H<=600);document.documentElement.classList.toggle('vxshort',H<=500)}
set(true);addEventListener('resize',()=>set(false));addEventListener('orientationchange',()=>setTimeout(()=>set(true),300))})();

/* Tema: o salvo pelo usuário. Sem escolha salva, computador abre no claro; celular segue o sistema */
(function(){const d=document.documentElement;let t=null;try{t=localStorage.getItem('theme')}catch(e){}
if(t)d.dataset.theme=t;else if(window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches)d.dataset.theme='light'})();
