/* TRAUMA_LAB_MAIN */
/* ===== ui/pip.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
/* =========================================================
   SIDE CAM: in front or back view, a small picture-in-picture window shows him from the side at the same moment,
   so you can see how deep a wound goes, what it hit inside and where a bullet went.
   It re-uses the side-view renderer: for one draw it swaps the canvas, size and camera, then puts everything back.
   ========================================================= */
const PIP={cv:null,cx:null,skin:null,sx:null,cam:{z:1,px:0,py:0},t:0,w:0,h:0};
(()=>{const d=document.createElement('div');d.id='pip';d.hidden=true;d.innerHTML='<span>SIDE</span><button id="pipX" aria-label="Close side cam">×</button><canvas id="pipC" aria-label="Side view of the body"></canvas>';document.body.appendChild(d);
  PIP.cv=$('pipC');PIP.cx=PIP.cv.getContext('2d');PIP.skin=document.createElement('canvas');PIP.sx=PIP.skin.getContext('2d');
  $('pipX').onclick=()=>{OPT.pip=false;saveOpt();pipShow();};
  // tap the mini view to jump to the side view
  PIP.cv.onclick=()=>setView('side');
  const b=document.createElement('button');b.id='bPip';b.className='zb mapb';b.textContent='Side cam';b.title='Small live side view while you work in front or back view';b.setAttribute('aria-pressed','false');
  const vc=$('viewctl');vc.insertBefore(b,$('bMap'));b.onclick=()=>{OPT.pip=!OPT.pip;saveOpt();pipShow();if(OPT.pip)log('Side cam on · tap it to switch to the side view','info');};})();
function pipShow(){const on=!!OPT.pip&&view!=='side';$('pip').hidden=!on;$('bPip').hidden=view==='side';$('bPip').setAttribute('aria-pressed',!!OPT.pip);
  if(on){const d=$('pip'),narrow=innerWidth<600,w=narrow?132:200,h=narrow?190:290;d.style.width=w+'px';d.style.height=h+'px';
    const nw=$('now');d.style.bottom=((nw?nw.getBoundingClientRect().height:0)+(document.body.classList.contains('land')?8:$('tools').offsetHeight+8))+'px';d.style.left=(document.body.classList.contains('land')?$('tools').offsetWidth+8:10)+'px';
    const dpr=Math.min(2,window.devicePixelRatio||1);if(PIP.w!==w||PIP.h!==h){PIP.w=w;PIP.h=h;PIP.cv.width=w*dpr;PIP.cv.height=(h-18)*dpr;PIP.cv.style.width=w+'px';PIP.cv.style.height=(h-18)+'px';PIP.skin.width=PIP.cv.width;PIP.skin.height=PIP.cv.height;}}}
function pipStep(){if(!OPT.pip||view==='side'||$('pip').hidden){if(OPT.pip&&view!=='side'&&$('pip').hidden)pipShow();return;}
  const now=performance.now();if(now-PIP.t<1000/15)return;PIP.t=now;
  const pw=PIP.w,ph=PIP.h-18,dpr=PIP.cv.width/pw;
  // frame the whole body: find its bounds and fit them
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const p of P){if(p.gone)continue;x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);y0=Math.min(y0,p.y);y1=Math.max(y1,p.y);}
  if(!(x1>x0))return;const bw=x1-x0+40,bh=y1-y0+40,s=Math.min(pw/bw,ph/bh);
  // what you are doing with the mouse or finger belongs to the front/back view (aim lines, throw arcs, bow draw, held
  // weapons): the side cam must not draw it at the same coordinates in its own world
  const save={view,ctx,skinC,sctx,W,H,DPR,S,OX,OY,VX,VY,VS,cam:CAM.side,skinR:render.skinR,bd:drawBackdrop,shake,drag,pointerW};
  try{drag=null;pointerW=null;view='side';ctx=PIP.cx;skinC=PIP.skin;sctx=PIP.sx;W=pw;H=ph;DPR=dpr;S=s;OX=pw/2-(x0+x1)/2*s;OY=ph/2-(y0+y1)/2*s;shake=0;
    CAM.side={z:1,px:0,py:0};render.skinR=null;
    drawBackdrop=function(){ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#1b2126';ctx.fillRect(0,0,PIP.cv.width,PIP.cv.height);setWorld(ctx);ctx.fillStyle='#2b2722';ctx.fillRect(-2000,0,4000,400);};
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,PIP.cv.width,PIP.cv.height);render(0);}
  catch(e){}
  finally{view=save.view;ctx=save.ctx;skinC=save.skinC;sctx=save.sctx;W=save.W;H=save.H;DPR=save.DPR;S=save.S;OX=save.OX;OY=save.OY;VX=save.VX;VY=save.VY;VS=save.VS;CAM.side=save.cam;render.skinR=save.skinR;drawBackdrop=save.bd;shake=save.shake;drag=save.drag;pointerW=save.pointerW;}}
