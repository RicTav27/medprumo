/* Altura fixa da tela: o teclado não reajusta o layout */
(function(){let w=0;function set(f){const W=innerWidth,H=innerHeight;if(!f&&W===w)return;w=W;const r=document.documentElement.style;r.setProperty('--hpx',H+'px');r.setProperty('--h1',(H/100)+'px')}
set(true);addEventListener('resize',()=>set(false));addEventListener('orientationchange',()=>setTimeout(()=>set(true),300))})();
