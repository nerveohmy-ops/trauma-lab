/* TRAUMA_LAB_MAIN */
/* ===== sim/physics.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
/* =========================================================
   PHYSICS
   ========================================================= */
// signed, momentum-conserving angle constraint (P0 parent far end, P1 joint, P2 child far end)
function angC(j,target,k,prevFrac){
  const p=segs[j.p],c=segs[j.c];
  const P0=P[j.t<0.5?p.b:p.a],P1=P[j.end==='b'?c.b:c.a],P2=P[j.end==='b'?c.a:c.b];
  let C=wrap(jointRel(j)-target);if(Math.abs(C)<1e-4)return;C=clamp(C,-0.6,0.6);
  const ex=P0.x-P1.x,ey=P0.y-P1.y,e2=ex*ex+ey*ey||1e-6,vx=P2.x-P1.x,vy=P2.y-P1.y,v2=vx*vx+vy*vy||1e-6;
  const g0x=ey/e2,g0y=-ex/e2,g2x=-vy/v2,g2y=vx/v2,g1x=-g0x-g2x,g1y=-g0y-g2y;
  const den=P0.im*(g0x*g0x+g0y*g0y)+P1.im*(g1x*g1x+g1y*g1y)+P2.im*(g2x*g2x+g2y*g2y);if(den<1e-9)return;
  const lam=-C*k/den*FACE;   // (a body facing left measures its joint angles mirrored)
  const a0=lam*P0.im,a1=lam*P1.im,a2=lam*P2.im;
  P0.x+=a0*g0x;P0.y+=a0*g0y;P1.x+=a1*g1x;P1.y+=a1*g1y;P2.x+=a2*g2x;P2.y+=a2*g2y;
  if(prevFrac){P0.px+=a0*g0x*prevFrac;P0.py+=a0*g0y*prevFrac;P1.px+=a1*g1x*prevFrac;P1.py+=a1*g1y*prevFrac;P2.px+=a2*g2x*prevFrac;P2.py+=a2*g2y*prevFrac;}
}
function pin(j){
  const p=segs[j.p],c=segs[j.c],A=P[p.a],B=P[p.b],C=P[j.end==='a'?c.a:c.b],t=j.t;
  const qx=A.x+(B.x-A.x)*t,qy=A.y+(B.y-A.y)*t,dx=C.x-qx,dy=C.y-qy;
  const w=C.im+(1-t)*(1-t)*A.im+t*t*B.im,k=1/w;
  C.x-=dx*C.im*k;C.y-=dy*C.im*k;A.x+=dx*A.im*(1-t)*k;A.y+=dy*A.im*(1-t)*k;B.x+=dx*B.im*t*k;B.y+=dy*B.im*t*k;
}
// ropes: each end is a body part, an object or a fixed hook point; they only pull when stretched
let ROPES=[],ROPESEL=null;
function ropePos(E){if(E.k==='seg'){const A=P[E.seg.a],B=P[E.seg.b];return{x:lerp(A.x,B.x,E.t),y:lerp(A.y,B.y,E.t)};}if(E.k==='obj')return{x:E.o.x,y:E.o.y};return{x:E.x,y:E.y};}
function ropeW(E){if(E.k==='seg'){const A=P[E.seg.a],B=P[E.seg.b];return(1-E.t)*(1-E.t)*A.im+E.t*E.t*B.im;}if(E.k==='obj')return E.o.att?0:E.o.im;return 0;}
function ropeMove(E,dx,dy,c){if(E.k==='seg'){const A=P[E.seg.a],B=P[E.seg.b];A.x+=dx*c*(1-E.t)*A.im;A.y+=dy*c*(1-E.t)*A.im;B.x+=dx*c*E.t*B.im;B.y+=dy*c*E.t*B.im;}else if(E.k==='obj'&&!E.o.att){E.o.stuck=false;E.o.x+=dx*c*E.o.im;E.o.y+=dy*c*E.o.im;}}
function ropeSolve(){for(let i=ROPES.length-1;i>=0;i--){const r=ROPES[i];
  for(const E of [r.a,r.b]){if(E.k==='seg'&&E.seg.gone){ROPES.splice(i,1);break;}if(E.k==='obj'&&!OBJ.includes(E.o)){ROPES.splice(i,1);break;}}if(!ROPES.includes(r))continue;
  const p=ropePos(r.a),q=ropePos(r.b),dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy)||1e-6;if(d<=r.L)continue;
  const wa=ropeW(r.a),wb=ropeW(r.b),ws=wa+wb;if(ws<=0)continue;const c=(d-r.L)/ws,nx=dx/d,ny=dy/d;ropeMove(r.a,nx,ny,c);ropeMove(r.b,-nx,-ny,c);}}
function ropeEnd(w,first){const o=OBJ.find(o=>Math.hypot(o.x-w.x,o.y-w.y)<o.r+3);if(o)return{k:'obj',o};const p=pickSeg(w,Math.max(3,14/VS));if(p)return{k:'seg',seg:p.seg,t:clamp(p.t,0.05,0.95)};
  return{k:'pt',x:clamp(w.x,-ROOM,ROOM),y:clamp(w.y,TOP,0)};}
function ropeName(E){return E.k==='seg'?E.seg.label.toLowerCase().replace(' (cut off)',''):E.k==='obj'?({anvil:'the anvil',ball:'the bowling ball',brick:'a brick',grenade:'a grenade',c4:'a charge',mine:'a mine'}[E.o.type]||'an object'):E.y>-2?'the floor':E.y<TOP+3?'the ceiling':Math.abs(E.x)>ROOM-3?'the wall':'a hook';}
function makeRope(a,b){if(a.k==='pt'&&b.k==='pt'){emitLog('Rope · start or end it on his body or an object','info');return;}
  const p=ropePos(a),q=ropePos(b),L=Math.hypot(q.x-p.x,q.y-p.y);if(L<2){emitLog('Rope · drag further to tie it somewhere','info');return;}
  ROPES.push({a,b,L,L0:L});emitSound('whoosh');emitLog('Rope tied · '+ropeName(a)+' → '+ropeName(b),'info');}
function ropeCut(x0,y0,x1,y1){let n=0;for(let i=ROPES.length-1;i>=0;i--){const r=ROPES[i],p=ropePos(r.a),q=ropePos(r.b);if(segX(x0,y0,x1,y1,p.x,p.y,q.x,q.y)){ROPES.splice(i,1);n++;}}if(n)emitLog(n>1?n+' ropes cut':'Rope cut','info');}
function ropePanel(r,sx,sy){let el=$('ropeP');if(!el){el=document.createElement('div');el.id='ropeP';document.body.appendChild(el);
    el.addEventListener('pointerdown',e=>e.stopPropagation());document.addEventListener('pointerdown',e=>{if(!el.hidden&&!el.contains(e.target)){el.hidden=true;ROPESEL=null;}},true);}
  const p=ropePos(r.a),q=ropePos(r.b),cur=Math.hypot(q.x-p.x,q.y-p.y),mx=Math.max(300,Math.ceil(Math.max(r.L,cur)*1.6));
  if(r.L0==null)r.L0=r.L;const L0=Math.max(4,r.L0),pv=()=>Math.round((1-(r.L-3)/(L0-3))*100),txt=()=>{const v=pv();return (v<0?'slack '+(-v):'pull '+v)+'% · '+(r.L/100).toFixed(2)+' m';};
  el.innerHTML=`<div class="rh"><b>Rope</b><span>${ropeName(r.a)} → ${ropeName(r.b)}</span></div><label>Pull <output>${txt()}</output></label><input type="range" min="-100" max="100" step="1" value="${pv()}"><div class="rh2"><span>slack</span><span>tied length</span><span>tight</span></div><div class="rb"><button data-k="un">Untie</button><button data-k="ok">Done</button></div>`;
  ROPESEL=r;
  el.hidden=false;const W_=el.offsetWidth||230,H_=el.offsetHeight||120;el.style.left=clamp(sx-W_/2,8,innerWidth-W_-8)+'px';el.style.top=clamp(sy-H_-18,8,innerHeight-H_-8)+'px';
  const inp=el.querySelector('input'),out=el.querySelector('output');inp.oninput=()=>{if(!ROPES.includes(r)){el.hidden=true;return;}r.L=Math.max(3,3+(L0-3)*(1-(+inp.value)/100));out.textContent=txt();};
  el.querySelector('[data-k=un]').onclick=()=>{const i=ROPES.indexOf(r);if(i>=0)ROPES.splice(i,1);emitLog('Rope untied','info');el.hidden=true;ROPESEL=null;};el.querySelector('[data-k=ok]').onclick=()=>{el.hidden=true;ROPESEL=null;};}
function physStep(h){
  const ratio=hPrev?h/hPrev:1;hPrev=h;
  // every person's body (sim/bodies), then the world they share
  bodyStep(h,ratio,true);
  if(BODIES.length){for(const b of BODIES)withBody(b,()=>bodyStep(h,ratio,false));bodyContacts();}
  objStep(h);
  propStep(h);propGrabStep(h);if(PROPS.length)poolForces(h);
  bulletStep(h);arrowStep(h);
}
// one body's step; `main` is the subject, who alone carries the sandbox's thrown objects, knives, grab and ropes
function bodyStep(h,ratio,main){
  // velocity kept per step: air drag on a falling person is tiny (½ρC_dA v² ≈ 10 N at 5 m/s against 770 N of weight); the old 0.9994
  // bled ≈ 19 %/s and made him float. 0.99985 (≈ 5 %/s) keeps the solver calm without the moon-gravity feel.
  for(const p of P){if(p.gone)continue;let vx=(p.x-p.px)*ratio*0.99985,vy=(p.y-p.py)*ratio*0.99985;const m=Math.hypot(vx,vy);if(m>20){vx*=20/m;vy*=20/m;}p.px=p.x;p.py=p.y;p.x+=vx;p.y+=vy+G*h*h;}
  if(main)for(const o of OBJ){if(o.stuck||o.att)continue;let vx=(o.x-o.px)*ratio*0.9995,vy=(o.y-o.py)*ratio*0.9995;o.px=o.x;o.py=o.y;o.x+=vx;o.y+=vy+G*h*h;if(o.type==='anvil')o.ang*=0.9;else o.ang+=vx/o.r;}
  {const sd=V.rise>0.5?0.004:0.012;for(const s of segs){const A=P[s.a],B=P[s.b];const ax=A.x-A.px,ay=A.y-A.py,bx=B.x-B.px,by=B.y-B.py,mt=A.m+B.m;const mx=(ax*A.m+bx*B.m)/mt,my=(ay*A.m+by*B.m)/mt;A.px+=(ax-mx)*sd;A.py+=(ay-my)*sd;B.px+=(bx-mx)*sd;B.py+=(by-my)*sd;}}
  for(const p of P)collideP(p,h,true);
  for(const j of joints){
    if(j.broken)continue;const m=muscleBase(j);if(m<0.02)continue;
    const [tg,str]=poseTarget(j.key,j,h);
    angC(j,tg*D2R,Math.min(0.6,JK[j.key]*m*str),0.75);
  }
  behaviours(h);
  if(main)knifeStep(h);
  if(main&&grab&&pointerW){
    if(grab.prop){}
    else if(grab.obj){const o=grab.obj;o.stuck=false;o.x+=(pointerW.x-o.x)*0.35;o.y+=(pointerW.y-o.y)*0.35;}
    else{const s=grab.seg,A=P[s.a],B=P[s.b],t=grab.t;const qx=lerp(A.x,B.x,t),qy=lerp(A.y,B.y,t);
      // the hand carries the grabbed point toward the finger. Up to v100 it closed 12 % of the gap per step and moved up to
      // 2.6 cm per 1/360 s, so he weighed nothing; 9 % and 1.8 cm give him a little more heft (≈ 30 % slower to follow,
      // fast drags ≈ 6.5 m/s) while lifting him by any limb still works without tearing it off.
      let dx=(pointerW.x-qx)*0.09,dy=(pointerW.y-qy)*0.09;const m=Math.hypot(dx,dy),mx=1.8;if(m>mx){dx*=mx/m;dy*=mx/m;}
      const w=(1-t)*(1-t)*A.im+t*t*B.im,ka=A.im*(1-t)/w,kb=B.im*t/w;
      A.x+=dx*ka;A.y+=dy*ka;B.x+=dx*kb;B.y+=dy*kb;
      A.px=lerp(A.px,A.x,0.06*Math.min(1,ka));A.py=lerp(A.py,A.y,0.06*Math.min(1,ka));B.px=lerp(B.px,B.x,0.06*Math.min(1,kb));B.py=lerp(B.py,B.y,0.06*Math.min(1,kb));
      V.grabT=T;if(V.rise>0){V.rise=0;V.riseCD=T+1.5;}}
  }
  for(const j of joints)if(!j.broken)j.g0=jGap(j);
  for(let it=0;it<ITER;it++){
    for(const s of segs){const a=P[s.a],b=P[s.b];const dx=b.x-a.x,dy=b.y-a.y;const d=Math.hypot(dx,dy)||1e-6;const diff=(d-s.len)/d/(a.im+b.im);a.x+=dx*diff*a.im;a.y+=dy*diff*a.im;b.x-=dx*diff*b.im;b.y-=dy*diff*b.im;}
    for(const j of joints)if(!j.broken)pin(j);
    if(main&&ROPES.length)ropeSolve();
    if(V.frozenT>0)for(const j of joints)if(!j.broken&&j.frz!=null)angC(j,j.frz,0.6,0);
    for(const j of joints){if(j.broken)continue;const rel=jointRel(j);if(rel>=j.min&&rel<=j.max)continue;const a=wrap(j.min-rel),b=wrap(j.max-rel);angC(j,Math.abs(a)<Math.abs(b)?j.min:j.max,0.5,0);}
    for(const p of P)collideP(p,h,false);
  }
  for(const j of joints)if(!j.broken)j.g1=jGap(j);
  jointStress(h);
  friction();
}
function jGap(j){const p=segs[j.p],c=segs[j.c],A=P[p.a],B=P[p.b],C=P[j.end==='a'?c.a:c.b];return Math.hypot(C.x-(A.x+(B.x-A.x)*j.t),C.y-(A.y+(B.y-A.y)*j.t));}
const JN={uarm:'shoulder',farm:'elbow',hand:'wrist',thigh:'hip',shin:'knee',foot:'ankle',head:'neck',neck:'neck',abd:'waist'};
function jointName(j){const c=segs[j.c];if(j.key==='frac')return c.label.toLowerCase().replace(' (cut off)','')+' at the fracture';const sd=/^Left/.test(c.label)?'left ':/^Right/.test(c.label)?'right ':'';return sd+(JN[c.kind]||'joint');}
function jointStress(h){
  if(OPT.tear===false){for(const j of joints)j.st=0;return;}
  // a hand grab pulling against the rest of the body loads every joint between the grip and the torso
  let gx=0,gset=null;
  if(!BID&&grab&&grab.seg&&pointerW){const s=grab.seg,A=P[s.a],B=P[s.b];const d=Math.hypot(pointerW.x-lerp(A.x,B.x,grab.t),pointerW.y-lerp(A.y,B.y,grab.t));const gpx=lerp(A.x,B.x,grab.t),gpy=lerp(A.y,B.y,grab.t),gvx=(lerp(A.x-A.px,B.x-B.px,grab.t))/h,gvy=(lerp(A.y-A.py,B.y-B.py,grab.t))/h,tw=(gvx*(pointerW.x-gpx)+gvy*(pointerW.y-gpy))/(d||1);V.gtw=(V.gtw||0)+(tw-(V.gtw||0))*Math.min(1,h/0.3);gx=Math.max(0,d-26)/5*clamp(1.2-V.gtw/50,0,1);   // the grip follows a little slower than before (see physStep), so allow a slightly bigger gap before it counts as a yank
    if(gx>0){gset=new Set();let g=s;for(let k=0;k<6&&g;k++){const j=g.joint;if(!j||j.broken)break;gset.add(j);g=segs[j.p];if(g.kind==='chest')break;}}}
  const a=Math.min(1,h/0.25);
  for(const j of joints){if(j.broken)continue;let raw=Math.max(j.g1||0,(j.g0||0)*0.5);if(gset&&gset.has(j))raw=Math.max(raw,gx);
    j.st=(j.st||0)+(raw-(j.st||0))*a;const st=j.st,c=segs[j.c],spine=c.kind==='abd';
    const k1=spine?3:1.6,k2=spine?5:3,k3=spine?7.5:4.6;
    j.t1=st>k1?(j.t1||0)+h:0;j.t2=j.disloc&&st>k2?(j.t2||0)+h:0;j.t3=j.torn&&(st>k3||st>k2+0.6)?(j.t3||0)+h:0;
    if(!j.disloc&&j.t1>0.35){j.disloc=true;j.min-=0.5;j.max+=0.5;const rr=radS(c,j.end==='a'?0:c.len)||c.ra;addWound(c,{type:'bruise',s:j.end==='a'?1:c.len-1,w:rr*0.5,r:rr*1.4});hurt(c,0,0,30);emitSound('thud',0.6);emitLog(cap1(jointName(j))+' dislocated · the bones pop out of the joint','bad');}
    if(!j.torn&&j.t2>0.45){j.torn=true;const se=j.end==='a'?1.2:c.len-1.2,rr=radS(c,se)||c.ra;const wd=addWound(c,{type:'cut',s:se-1.2,w:rr*0.8,s2:se+1.2,w2:-rr*0.6,r:0.8,len:4,bleed:0.9,dw:1,ds:0});if(wd&&OPT.strands)addStrands(c,wd,3,2.5);
      for(const v of c.vessels)if(!v.deep&&Math.random()<0.5)cutVessel(v,0.4,{s:se,w:rr*0.8,dw:1,ds:0},[]);hurt(c,0,0,45);emitSound('slice');emitLog('Muscles tearing at the '+jointName(j)+' · skin splitting','bad');}
    if(j.t3>0.4){const rep=[];const nm=jointName(j);sever(j,rep);const p=toWorld(c,j.end==='a'?0:c.len,0);spawnGibs(p.x,p.y,0,-1,4,'flesh',180);emitSound('slice');emitLog(cap1(c.label.toLowerCase().replace(' (cut off)',''))+' ripped off at the '+nm,'bad');j.st=0;}
  }
}
function cap1(s){return s.charAt(0).toUpperCase()+s.slice(1);}
function collideP(p,h,detect){
  if(p.gone)return;
  if(!detect){if(p.y>-p.r)p.y=-p.r;if(p.x<-ROOM+p.r)p.x=-ROOM+p.r;if(p.x>ROOM-p.r)p.x=ROOM-p.r;if(p.y<TOP+p.r)p.y=TOP+p.r;return;}
  if(p.y>-p.r){const vy=(p.y-p.py)/h;if(vy>850)impact(p,vy);const d=p.y-p.py;p.y=-p.r;p.py=p.y+Math.max(0,d)*0.15;}
  if(p.x<-ROOM+p.r){const vx=(p.px-p.x)/h;if(vx>850)impact(p,vx);const d=p.px-p.x;p.x=-ROOM+p.r;p.px=p.x-Math.max(0,d)*0.25;}
  if(p.x>ROOM-p.r){const vx=(p.x-p.px)/h;if(vx>850)impact(p,vx);const d=p.x-p.px;p.x=ROOM-p.r;p.px=p.x+Math.max(0,d)*0.25;}
  if(p.y<TOP+p.r){p.y=TOP+p.r;p.py=p.y;}
}
function friction(){for(const p of P){if(!p.gone&&p.y>=-p.r-0.45){const vx=p.x-p.px,sp=Math.abs(vx);p.px=sp<0.06?p.x:p.x-vx*0.78;const vy=p.y-p.py;if(vy>0)p.py=p.y;}}}
function impact(p,v){
  if(V.frozenT>0&&v>1000){const g=segs[p.seg];if(g&&g.connected&&(LIMBK.includes(g.kind)||g.kind==='head')&&Math.random()<0.5){const r=[];shatter(g,g.len*rnd(0.3,0.7),r);if(r.length)emitLog('Frozen body hit the ground · '+r.join(', '),'bad');}}
  if(T-(V.grabT||-9)<0.25&&v<1500)return;
  const seg=segs[p.seg];if(T-seg.lastImpact<0.35)return;seg.lastImpact=T;
  const E=0.5*(p.m+seg.mass*0.3)*(v/100)**2;
  if(E>40)blunt(seg,p.end==='a'?0:seg.len,0,E,'Hard impact');
}
function aware(h){
  if(ACT.on){V.fear=0;V.cow=0;
    // down and unable to stand: if the arms still work and he is awake, the walk keys make him crawl (≈10 cm/s)
    const crawl=V.rise<=0.001&&!ACT.prone&&ACT.dir!==0&&!ACT.busy&&!V.dead&&V.consc>0.5&&(armOK('near')||armOK('far'));
    if(crawl){V.act='crawl';V.crawlDir=ACT.dir;V.armP='crawl';V.armW=Math.min(1,V.armW+h*2);}else{V.act='player';V.armP=null;V.armW=Math.max(0,V.armW-h*2);}return;}
  if(!OPT.react){V.fear=0;return;}
  V.fear=Math.max(0,V.fear-h*(0.045+0.12*Math.min(1,DR.sed.l)));
  const alert=!V.dead&&V.consc>0.6&&V.ko<=0&&DR.ket.l<1.1&&DR.sed.l<0.9&&SEG.head.connected&&!BN('cervical').broken&&ORG.brain.hp>25;
  const relax=()=>{V.armW=Math.max(0,V.armW-h*2);V.cow=Math.max(0,V.cow-h*1.5);V.walk=0;};
  if(!alert){V.act=V.dead?'':'none';relax();return;}
  const bx=(P[SEG.chest.a].x+P[SEG.abd.b].x)/2,by=(P[SEG.chest.a].y+P[SEG.abd.b].y)/2;
  let aim=false,incoming=false,blast=false,blade=false;
  const t=drag&&pointerW&&!drag.probe?TOOL[tool]:null;
  if(t&&t.gun){aim=true;if(view==='side'){if(drag.moved)V.thx=drag.sw.x;else{const w=pointerW;V.thx=w.x>-ROOM+30?Math.max(-ROOM+3,w.x-260):Math.min(ROOM-3,w.x+260);}}else V.thx=bx+(view==='back'?-150:150);}
  else if(t&&view==='side'&&['knife','machete','bat','hammer'].includes(tool)&&Math.hypot(pointerW.x-bx,pointerW.y-by)<75){blade=true;V.thx=pointerW.x;}
  for(const o of OBJ){
    if(o.att){if(o.fuse!=null&&o.att.seg.connected){blast=true;V.thx=bx+(o.att.seg.side==='far'?-1:1)*5;}continue;}
    if(o.fuse!=null&&Math.abs(o.x-bx)<170){blast=true;V.thx=o.x;}
    if(o.stuck)continue;const vx=(o.x-o.px)/h,vy=(o.y-o.py)/h,v2=vx*vx+vy*vy;if(v2<250*250)continue;
    const rx=bx-o.x,ry=by-o.y,tc=(rx*vx+ry*vy)/v2;if(tc<=0||tc>0.7)continue;
    if(Math.hypot(rx-vx*tc,ry-vy*tc)<55){incoming=true;V.thx=o.x;}
  }
  if(aim)V.fear=Math.min(1,Math.max(V.fear,0.3)+h*0.05);
  if(blade)V.fear=Math.min(1,V.fear+h*0.4);
  if(incoming)V.fear=Math.min(1,V.fear+h*2);
  if(blast)V.fear=Math.max(V.fear,0.85);
  const dir=V.thx==null?(bx>0?-1:1):(Math.sign(bx-V.thx)||1);
  const ax=V.anchorX??bx,mg=(V.act==='cower'?46:38);const wall=dir>0?ax>ROOM-mg:ax<-ROOM+mg;
  const standing=V.rise>=0.999,lying=V.rise<=0.001;
  let act=V.fear>0.08?'alert':'calm',armP=null,walk=0,cow=0;
  if(standing){
    if(incoming){act='cover';armP='cover';}
    else if(blast){if(wall){act='cower';armP='cover';cow=1;}else{act='flee';walk=dir;}}
    else if(aim){if(V.fear>0.62&&!wall){act='backoff';armP='handsup';walk=dir*0.55;}else if(V.fear>0.62){act='cower';armP='cover';cow=1;}else{act='handsup';armP='handsup';}}
    else if(blade){act='backoff';armP='cover';if(!wall)walk=dir*0.6;}
    else if(V.fear>0.55){if(!wall){act='flee';walk=dir;}else{act='cower';armP='cover';cow=1;}}
  } else if(lying&&V.consc>0.7){
    if(incoming||aim||blade||blast){act='cover';armP='cover';}
    if((V.fear>0.35||blast)&&!legsOK()&&!wall&&!incoming&&V.painEff<88&&(armOK('near')||armOK('far'))){act='crawl';armP='crawl';V.crawlDir=dir;}
  }
  for(const f of FLAMES){if(f.front||f.self||f.co2)continue;if(Math.abs(f.x-bx)<70&&Math.abs(f.y-by)<110){V.fear=Math.max(V.fear,0.8);if(standing&&!wall&&act!=='cover'){act='flee';walk=dir;}break;}}
  if(segs.some(g=>g.connected&&g.fireT>0)){V.fear=1;act='burning';armP=(armOK('near')||armOK('far'))?'flail':armP;if(standing&&!wall)walk=dir*0.8;}
  V.act=act;
  if(armP){if(V.armP!==armP&&V.armW>0.5)V.armW=0.5;V.armP=armP;V.armW=Math.min(1,V.armW+h*3);}else V.armW=Math.max(0,V.armW-h*1.6);
  V.cow+=(cow-V.cow)*Math.min(1,h*2.2);
  V.walk+=(walk-V.walk)*Math.min(1,h*3);
}
function zombieAct(h){
  const bx=P[SEG.abd.a].x,tx=ZTGT!=null?ZTGT:clamp(bx,-ROOM+40,ROOM-40)+(Math.sin(T*0.15)*40);const d=tx-bx,dir=Math.sign(d)||1;
  const standing=V.rise>=0.999;let walk=0,act='zombie';
  if(standing&&Math.abs(d)>14)walk=dir*0.42*(0.8+0.2*Math.sin(T*2.3));
  if(V.rise<=0.001&&!legsOK()&&(armOK('near')||armOK('far'))){act='crawl';V.crawlDir=dir;V.armP='crawl';}else V.armP='zombie';
  V.act=act;V.armW=Math.min(1,V.armW+h*2);V.fear=0;V.cow=0;V.walk+=(walk-V.walk)*Math.min(1,h*2);V.thx=bx+dir*60;
}
function behaviours(h){
  aware(h);
  if(V.zombie)zombieAct(h);
  const frac=V.blood/5000;
  const ok=!V.dead&&legsOK()&&DR.sed.l<1&&opi()<2.8&&DR.ket.l<1.4;
  // getting up needs gravity, the floor under him, a still body and time to recover after a fall
  const gf=G/981;let still=true,low=0,airFeet=true;
  for(const g of [SEG.chest,SEG.abd,SEG.nearThigh,SEG.farThigh,SEG.head]){if(!g||!g.connected)continue;for(const i of [g.a,g.b]){const q=P[i];if(Math.hypot(q.x-q.px,q.y-q.py)/h>45)still=false;if(q.y>-q.r-4)low++;}}
  for(const f of [SEG.nearFoot,SEG.farFoot])if(f&&f.connected&&P[f.a].y>-12)airFeet=false;
  V.stillT=still&&low>=2?(V.stillT||0)+h:0;V.lowT=low>=2?(V.lowT||0)+h:0;
  if(V.rise>0.999&&airFeet&&G>0&&!(ACT.on&&(ACT.jy<0||ACT.vault||ACT.landT>0))){V.airT=(V.airT||0)+h;if(V.airT>0.25){V.rise=0;V.airT=0;}}else V.airT=0;
  if(V.rise>0.5)V.wasUp=true;
  if(V.wasUp&&V.rise<=0.001){V.wasUp=false;V.riseCD=Math.max(V.riseCD||0,T+(V.zombie?rnd(1,2):rnd(3,5)+V.painEff*0.05+(V.ko>0?4:0)));}
  if(V.rise>0.2&&gf>1.9)V.heavyT=(V.heavyT||0)+h;else if(V.rise<=0.001)V.heavyT=Math.max(0,(V.heavyT||0)-h*0.5);
  const legsHold=G>0&&(gf<=1.9||(V.heavyT||0)<2.5);
  const canStay=V.zombie?legsOK()&&legsHold:ok&&legsHold&&V.consc>0.5&&V.painEff<95&&frac>0.55;
  const canStart=V.zombie?legsOK()&&G>0&&gf<=1.9&&V.lowT>0.6&&T>(V.riseCD||0):ok&&G>0&&gf<=1.9&&(V.stillT>1.2||(ACT.on&&!ACT.prone&&V.lowT>0.4))&&V.consc>0.75&&V.painEff<75&&frac>0.62&&T>(V.riseCD||0)&&!V.patient;
  if(V.rise>0.999){const ca=segAng(SEG.chest,false);if(Math.abs(wrap(ca-Math.PI/2))>1.0){V.tipT=(V.tipT||0)+h;if(V.tipT>0.35){V.rise=0;V.tipT=0;V.riseCD=T+2.5;}}else V.tipT=0;}
  if(V.rise>0){
    // (story: ≈0.7 s to stand from the floor, as a fit person springs up; the sandbox subject takes ≈2.4 s)
    if(canStay){if(V.rise<1)V.rise=Math.min(1,V.rise+h*(ACT.on?1.4:0.42)/Math.max(0.6,Math.sqrt(gf)));}
    else{if(V.rise<1||!V.riseFail){V.riseCD=T+4;}V.rise=Math.max(0,V.rise-h*4);}
  } else if(canStart)V.rise=h*(ACT.on?1.4:0.42)/Math.max(0.6,Math.sqrt(gf));
  const r=V.rise;
  // story mode (the subject and the guards) has its own controller for standing, walking, jumping and sitting (sim/story)
  if(r>0.001&&ACT.on)storyLoco(h,r);
  else if(r>0.001){
    const feet=[SEG.farFoot,SEG.nearFoot];
    if(r<0.999||feet.some(s=>P[s.a].y>-16)||(ACT.on&&ACT.vault)){
      if(V.anchorX==null||r<0.02)V.anchorX=clamp((P[SEG.abd.b].x+P[SEG.farFoot.a].x+P[SEG.nearFoot.a].x)/3,-ROOM+25,ROOM-25);
      const e=ease(r)*(1-(ACT.on?0.72*ACT.duckK:0.62*V.cow)),fa=(P[SEG.farFoot.a].x+P[SEG.nearFoot.a].x)/2,jy=ACT.on?ACT.jy:0;
      const walking=r>=0.999&&Math.abs(V.walk)>0.06&&V.cow<0.3;V.walkOn=walking;
      if(walking){const sp=ACT.on?storyWalkSpeed():Math.abs(V.walk)*(V.walk>0?60:34)*clamp(1.1-V.painEff/110,0.35,1);const nx=clamp(V.anchorX+Math.sign(V.walk)*sp*h,-ROOM+30,ROOM-30);V.gait+=Math.abs(nx-V.anchorX)/(ACT.on?storyStride(sp):50)*6.283;V.anchorX=nx;V.wsp=sp;}
      else if(r>=0.999&&Math.abs(fa-V.anchorX)>5&&T>(V.plantT||0)&&V.cow<0.05&&!(ACT.on&&ACT.duckK>0.05))V.anchorX=fa;if(walking)V.plantT=T+1.2;const fx=V.anchorX;
      const hipY=lerp(-38,-91,e)+jy,chestY=lerp(-78,-136,e)+jy,headY=lerp(-102,-166,e)+jy;
      const pull=(p,tx,ty,k,mx)=>{let dx=(tx-p.x)*k,dy=(ty-p.y)*k;const m=Math.hypot(dx,dy);if(m>mx){dx*=mx/m;dy*=mx/m;}p.x+=dx;p.y+=dy;p.px=lerp(p.px,p.x,0.08);p.py=lerp(p.py,p.y,0.08);};
      const bres=clamp(1-(V.bhAcc||0)/480,0.05,1);if((V.bhAcc||0)>60&&V.bhX!=null&&r>=0.999){V.anchorX+=Math.sign(V.bhX-V.anchorX)*(V.bhAcc/420)*26*h;}
      // running: the trunk has to keep up with the feet (≈3 m/s), so the balance pull may move it further per step
      const k=(r<0.999?0.07:0.05)*bres*(ACT.on&&ACT.jy<0?(ACT.vault?4:2):1),mx=(r<0.999?0.22:Math.max(0.3,ACT.on?(V.wsp||0)/360*1.5+(ACT.jy<0?1.2:0):0))*bres,fmx=ACT.on?Math.max(0.6,(V.wsp||0)/360*2.6):0.6;
      if(walking){const ds=Math.sign(V.walk);for(const ft of feet){const ph=V.gait+(ft.side==='near'?0:Math.PI),ox=ds*(ACT.on?clamp(8+(V.wsp||0)*0.14,8,40):8)*Math.sin(ph),lift=Math.max(0,Math.cos(ph))*(ACT.on?clamp(6+(V.wsp||0)*0.035,6,17):6);pull(P[ft.a],fx+ox,-4-lift+jy,0.14,fmx);pull(P[ft.b],fx+ox+15,-2.2-lift*0.7+jy,0.1,fmx);}}
      else for(const ft of feet){const kk=(r<0.999||T<(V.plantT||0)||V.cow>0.05)?1:0.25;const cx_=fx+20*V.cow;const vt=ACT.on&&ACT.vault,fy=vt?hipY+16:-4+jy*0.6;pull(P[ft.a],cx_+(ft.side==='near'?1:-1)-(vt?6:0),fy,0.12*kk*(vt?3:1),0.4+(jy<0?1.5:0));pull(P[ft.b],cx_+15-(vt?6:0),fy+1.8,0.08*kk*(vt?3:1),0.4+(jy<0?1.5:0));}
      pull(P[SEG.abd.b],fx+lerp(-9,0.3,e),hipY,k,mx);
      const ln=storyLean();pull(P[SEG.chest.a],fx+lerp(12,0.3,e)+ln,chestY,k*1.2,mx);
      pull(P[SEG.head.a],fx+lerp(20,-0.2,e)+ln*1.4,headY,k*0.8,mx);
    }
  } else {V.anchorX=null;V.walkOn=false;}
  if(V.act==='crawl'&&r<=0.001){const d=V.crawlDir||1,pulse=Math.max(0,Math.sin(T*5));for(const s of [SEG.chest,SEG.abd,SEG.head])for(const i of [s.a,s.b]){const p=P[i];if(p.y>-p.r-3.5){const dx=d*(ACT.on?0.24:0.075)*pulse;p.x+=dx;p.px+=dx;}}}
  if(BID){if(typeof guardArms==='function')guardArms(h);}else storyArms(h);
  V.flinch=Math.max(0,V.flinch-h*2.5);
  const c=V.clutch;
  if(c&&!V.dead&&V.consc>0.5&&V.painEff>18&&c.seg.connected&&T-c.t<35){
    const side=c.hand;const hd=SEG[side+'Hand'];
    if(armOK(side)&&hd.connected){const wp=toWorld(c.seg,c.s,c.w);const q=P[hd.b];const k=0.03*V.consc*clamp(V.painEff/60,0.3,1);
      let dx=(wp.x-q.x)*k,dy=(wp.y-q.y)*k;const m=Math.hypot(dx,dy);if(m>0.2){dx*=0.2/m;dy*=0.2/m;}q.x+=dx;q.y+=dy;q.px=lerp(q.px,q.x,0.1);q.py=lerp(q.py,q.y,0.1);}
  }
  {const gh=typeof gutHolder==='function'?gutHolder():null;if(gh){const A=toWorld(gh.anchor.seg,gh.anchor.s,gh.anchor.w);const k1=Math.min(gh.pts.length-1,8),L=gh.pts[k1];
    for(const [sd,tx,ty] of [['near',A.x,A.y],['far',L.x,L.y]]){const hd=SEG[sd+'Hand'];if(!hd||!hd.connected||!armOK(sd))continue;const q=P[hd.b];let dx=(tx-q.x)*0.05,dy=(ty-q.y)*0.05;const m=Math.hypot(dx,dy);if(m>0.3){dx*=0.3/m;dy*=0.3/m;}q.x+=dx;q.y+=dy;q.px=lerp(q.px,q.x,0.1);q.py=lerp(q.py,q.y,0.1);}
    V.pain=Math.max(V.pain,70);V.fear=1;if(V.rise>0.6)V.rise=Math.max(0.6,V.rise-h*0.15);}}
  if(V.seizeT>0&&!V.dead){for(const g of segs){if(!g.connected)continue;for(const i of [g.a,g.b]){const q=P[i];q.x+=rnd(-1,1)*0.12;q.y+=rnd(-1,1)*0.12;}}}
  if(DR.alc.l>1.2&&V.rise>0.9&&!V.dead){const sw=Math.sin(T*1.3)*0.02*(DR.alc.l-1.2);const q=P[SEG.chest.a];q.x+=sw;}
  const trem=(V.consc>0.4&&!V.dead)?(DR.caf.l>1.5||DR.coc.l>0.8?0.25:0)+clamp((0.78-frac)*3,0,1)*0.6+clamp(DR.adr.l-0.8,0,2)*0.4+clamp((V.painEff-60)/40,0,1)*0.3:0;
  if(trem>0.02)for(const s of [SEG.farHand,SEG.nearHand,SEG.head]){if(!s.connected)continue;const q=P[s.b];q.x+=rnd(-1,1)*0.022*trem;q.y+=rnd(-1,1)*0.022*trem;}
}
/* ---------- loose objects ---------- */
function spawnObj(type,x,y,vx,vy){
  const spec={brick:{r:6,m:2.5},ball:{r:10.5,m:7},anvil:{r:11,m:100},grenade:{r:3.4,m:0.4,fuse:2.5},c4:{r:3.5,m:0.6,fuse:3.2},mine:{r:7,m:3,arm:1.4}}[type];
  const o=Object.assign({type,x,y,px:x-vx/240,py:y-vy/240,ang:0,cd:{}},spec);o.im=1/o.m;
  OBJ.push(o);
  if(OBJ.length>600)OBJ.splice(OBJ.findIndex(q=>!q.att),1);
  return o;
}
/* =========================================================
   PROPS: rigid furniture and lab glass
   Each prop is a rigid body (position, angle, velocity, spin) whose shape is a set of circles
   in its own frame. Circles collide with the floor, walls, the body, thrown objects and other props.
   ========================================================= */
let PROPS=[];
// circles around the outline of a box (prop frame: x from x0 to x1, y from y0 (top, negative) to 0 at the floor)
function boxRing(x0,x1,y0,r,step){const C=[];for(let x=x0+r;x<=x1-r+0.01;x+=step){C.push([x,y0+r,r]);C.push([x,-r,r]);}for(let y=y0+r+step;y<-r-0.01;y+=step){C.push([x0+r,y,r]);C.push([x1-r,y,r]);}return C;}
const PROPDEF={
  // story-mode cover. A plywood shipping crate, 44 × 60 × 130 cm, 18 mm walls (≈3.2 m² × 18 mm × 600 kg/m³ ≈ 35 kg).
  // Two plywood walls take ≈35–40 % of a pistol round's energy; it goes through.
  crate:{name:'Wooden crate',m:35,e:0.1,mu:0.55,mat:'wood',box:[-22,22,-130,0],build(){return boxRing(-22,22,-130,2.2,4);}},
  // a four-drawer steel filing cabinet, 64 × 46 × 132 cm, ≈70 kg with its files. Thin steel sheet plus ≈40 cm of
  // packed paper stops a pistol round (paper this thick absorbs ≈500 J); rifle rounds go through, slowed.
  // story-mode low cover: a steel equipment crate, 64 × 60 × 95 cm, 2 mm sheet over a frame with gear inside (≈80 kg).
  // 95 cm hides a man sitting on the floor (the middle of his head is at ≈87 cm) but not one crouching (≈120 cm), and
  // is low enough for his arm to reach up over it from there; steel stops a 9 mm round
  lowbox:{name:'Steel crate',m:80,e:0.05,mu:0.5,mat:'steel',box:[-32,32,-95,0],build(){return boxRing(-32,32,-95,2.4,4.2);}},
  cabinet:{name:'Filing cabinet',m:70,e:0.05,mu:0.45,mat:'steel',box:[-32,32,-132,0],build(){return boxRing(-32,32,-132,2.4,4.2);}},
  table:{name:'Table',m:24,e:0.08,mu:0.6,build(){const C=[];for(let x=-45;x<=45.01;x+=3.6)C.push([x,-73,2.1]);for(const sx of [-41,41])for(let y=-69;y<=-1.5;y+=3.4)C.push([sx,y,1.7]);return C;}},
  chair:{name:'Chair',m:6,e:0.08,mu:0.6,build(){const C=[];for(let x=-20;x<=20.01;x+=3.3)C.push([x,-45,1.8]);for(let y=-49;y>=-92;y-=3.4)C.push([-20,y,1.5]);for(const sx of [-19,19])for(let y=-42;y<=-1.4;y+=3.4)C.push([sx,y,1.4]);return C;}},
  // hospital stretcher: 45 kg steel frame, 190 × 60 cm mattress at ≈86 cm, on four castors
  gurney:{name:'Gurney',m:45,e:0.08,mu:0.35,build(){const C=[];for(let x=-92;x<=92.01;x+=3.6)C.push([x,-86,2.4]);for(const sx of [-78,78])for(let y=-81;y<=-8;y+=3.4)C.push([sx,y,1.6]);for(const sx of [-78,78])C.push([sx,-3.2,3.2]);return C;}},
  // army canvas litter: two poles 210 cm long on short feet, canvas ≈20 cm off the ground
  stretcher:{name:'Stretcher',m:9,e:0.05,mu:0.6,build(){const C=[];for(let x=-100;x<=100.01;x+=3.6)C.push([x,-18,2]);for(const sx of [-86,86])for(let y=-15;y<=-1.5;y+=3)C.push([sx,y,1.4]);return C;}},
  // heavy wooden table long enough to lie on (castle infirmary), top at ≈80 cm
  slab:{name:'Long table',m:60,e:0.05,mu:0.7,build(){const C=[];for(let x=-96;x<=96.01;x+=3.6)C.push([x,-78,2.2]);for(const sx of [-84,84])for(let y=-74;y<=-1.5;y+=3.4)C.push([sx,y,1.9]);return C;}},
  // above-ground pool / chemical tank: 180 × 56 cm, 1 m front to back, 4 cm polyethylene walls on a steel frame · ≈ 890 L inside · 60 kg empty
  pool:{name:'Pool',m:60,e:0.03,mu:0.9,build(){const C=[];for(let x=-90;x<=90.01;x+=3.2)C.push([x,-2.1,2.1]);for(const sx of [-88,88])for(let y=-56;y<=-4;y+=3.2)C.push([sx,y,2]);return C;}},
  beaker:{name:'Beaker',m:0.12,e:0.15,mu:0.5,build(k=1){return[[-3.1,-1.3,1.25],[3.1,-1.3,1.25],[0,-1.3,1.3],[-3.3,-4.6,0.9],[3.3,-4.6,0.9],[-3.4,-7.8,0.75],[3.4,-7.8,0.75]].map(c=>[c[0]*k,c[1]*k,c[2]*k]);}},
};
function spawnProp(type,x,y,vx,vy,o){
  const d=PROPDEF[type],sc=(o&&o.sc)||1,mass=type==='beaker'?d.m*Math.pow(sc,2.6):d.m;let C=d.build(sc);
  // centre of mass from the circle areas, then express the shape around it
  let sx=0,sy=0,sa=0;for(const c of C){const a=c[2]*c[2];sx+=c[0]*a;sy+=c[1]*a;sa+=a;}const cx=sx/sa,cy=sy/sa;C=C.map(c=>[c[0]-cx,c[1]-cy,c[2]]);
  let I=0;for(const c of C){const a=c[2]*c[2]/sa;I+=a*(c[0]*c[0]+c[1]*c[1]+c[2]*c[2]*0.5);}I*=mass;
  let R=0;for(const c of C)R=Math.max(R,Math.hypot(c[0],c[1])+c[2]);
  const pr={type,x:x+cx,y:Math.min(y,0)+cy,ang:0,vx:vx||0,vy:vy||0,av:0,m:mass,im:1/mass,I,iI:1/I,C,R,e:d.e,mu:d.mu,ox:cx,oy:cy,hp:100,cd:0,born:T};
  if(type==='beaker'){pr.sc=sc;pr.cap=(o&&o.cap)||250;pr.mix=newMix();}
  if(type==='gurney')pr.brake=true;
  if(type==='pool'){pr.upright=true;pr.cap=POOLD.cap;pr.mix=newMix();pr.wv=new Float32Array(POOLN);pr.wvv=new Float32Array(POOLN);pr.pvx=0;}   // starts empty
  // keep it out of the floor on spawn
  let low=-1e9;for(const c of C)low=Math.max(low,c[1]+c[2]);if(pr.y+low>0)pr.y=-low;
  let hw=0;for(const c of C)hw=Math.max(hw,Math.abs(c[0])+c[2]);pr.x=clamp(pr.x,-ROOM+hw+0.5,ROOM-hw-0.5);
  // never spawn inside him or another prop: lift it until it is clear, then it drops
  const hits=()=>{for(const c of C){const p=propPt(pr,c);for(const s of segs){if(s.gone)continue;const A=P[s.a],B=P[s.b],r=dps(p.x,p.y,A.x,A.y,B.x,B.y);if(r.d<rad(s,r.t)+c[2]+0.5)return true;}for(const q of PROPS){if(q===pr)continue;for(const d of q.C){const o=propPt(q,d);if(Math.hypot(o.x-p.x,o.y-p.y)<c[2]+d[2])return true;}}}return false;};
  // slide it sideways to the nearest free spot; only lift it if there is no room at all
  if(hits()){const x0=pr.x;let ok=false;for(let d=6;d<=2*ROOM&&!ok;d+=6)for(const sg of [1,-1]){const x=x0+sg*d;if(x<-ROOM+hw+0.5||x>ROOM-hw-0.5)continue;pr.x=x;if(!hits()){ok=true;break;}}
    if(!ok&&type==='pool'){emitLog('No room for the pool · move him aside, or pick a bigger room (Map)','info');return null;}
    if(!ok){if(type!=='beaker'&&pr.y>-pr.R*1.2){emitLog('No room for the '+d.name.toLowerCase()+' there · drag him aside or tap higher to drop it','info');return null;}pr.x=x0;for(let k=0;k<80&&hits();k++)pr.y-=4;if(pr.y-pr.R<TOP)pr.y=TOP+pr.R;}}
  PROPS.push(pr);if(PROPS.length>40)PROPS.splice(0,1);return pr;
}
function propLocal(pr,x,y){const ca=Math.cos(-pr.ang),sa=Math.sin(-pr.ang),rx=x-pr.x,ry=y-pr.y;return [rx*ca-ry*sa+pr.ox,rx*sa+ry*ca+pr.oy];}
function propPt(pr,c){const ca=Math.cos(pr.ang),sa=Math.sin(pr.ang);return{x:pr.x+c[0]*ca-c[1]*sa,y:pr.y+c[0]*sa+c[1]*ca};}
function mixVol(pr){return pr.mix?pr.mix.vol:0;}
function propMass(pr){return pr.type==='beaker'?pr.m+mixVol(pr)*0.001:pr.type==='pool'?pr.m+mixVol(pr)*0.001*mixRho(pr.mix):pr.m;}
function rbVel(pr,rx,ry){return[pr.vx-pr.av*ry,pr.vy+pr.av*rx];}
function rbImp(pr,rx,ry,jx,jy){pr.vx+=jx*pr.im;pr.vy+=jy*pr.im;pr.av+=(rx*jy-ry*jx)*pr.iI;}
// one contact against something with velocity (ovx,ovy) and inverse mass oim; normal points towards the prop
function rbContact(pr,px,py,nx,ny,pen,ovx,ovy,oim,h){
  const rx=px-pr.x,ry=py-pr.y,[vx,vy]=rbVel(pr,rx,ry),rvx=vx-ovx,rvy=vy-ovy,vn=rvx*nx+rvy*ny;
  const share=pr.im/(pr.im+oim||1);pr.x+=nx*pen*share*0.8;pr.y+=ny*pen*share*0.8;
  const rn=rx*ny-ry*nx,kn=pr.im+rn*rn*pr.iI+oim;let jn=0;
  if(vn<0){jn=-(1+(vn<-60?pr.e:0))*vn/kn;rbImp(pr,rx,ry,nx*jn,ny*jn);}
  const tx=-ny,ty=nx,vt=rvx*tx+rvy*ty,rt=rx*ty-ry*tx,kt=pr.im+rt*rt*pr.iI+oim;let jt=-vt/kt;const lim=pr.mu*(jn+G*h/(kn*Math.max(1,pr.C.length*0.25)));jt=clamp(jt,-lim,lim);rbImp(pr,rx,ry,tx*jt,ty*jt);
  return{jn,jt,vn,tx,ty,share};
}
function propStep(h){
  if(!PROPS.length)return;
  for(const pr of PROPS){
    if(pr.fixed){if(pr.fx==null){pr.fx=pr.x;pr.fy=pr.y;}pr.x=pr.fx;pr.y=pr.fy;pr.vx=pr.vy=pr.av=0;pr.ang=0;pr.held=false;continue;}
    if(pr.held)continue;
    const m=propMass(pr);if(pr.type==='beaker'||pr.type==='pool'){pr.im=1/m;if(pr.type==='pool')pr.iI=1/(pr.I*m/pr.m);}
    if(pr.upright){pr.av=0;pr.ang=0;}
    pr.vy+=G*h;pr.vx*=1-0.04*h;pr.vy*=1-0.02*h;pr.av*=1-0.6*h;
    if(BH&&BHS.length){}
    // caster brakes: locked wheels skid like rubber on vinyl (μ ≈ 0.8) and static friction holds it still;
    // free casters roll (rolling resistance ≈ 0.03), so a push or a heavy patient moving on it sends it off
    if(pr.brake!=null){pr.mu=pr.brake?0.8:0.03;const grounded=Math.abs(pr.ang)<0.35&&pr.y-pr.oy>-1.5;
      if(pr.brake&&grounded){pr.vx*=Math.exp(-h*30);if(Math.abs(pr.vx)<6)pr.vx=0;if(Math.abs(pr.av)<0.3)pr.av*=Math.exp(-h*30);
        // static friction: small contact nudges (the patient shifting on the mattress) cannot creep it along the floor
        if(pr.bx==null||Math.abs(pr.x-pr.bx)>4)pr.bx=pr.x;else pr.x=pr.bx;}else pr.bx=null;}
    pr.x+=pr.vx*h;pr.y+=pr.vy*h;pr.ang+=pr.av*h;
  }
  const rest=new Map();
  for(const pr of PROPS){let gnd=false;
    for(const c of pr.C){const p=propPt(pr,c);
      // floor, walls, ceiling
      if(p.y+c[2]>0){const r=rbContact(pr,p.x,p.y+c[2],0,-1,p.y+c[2],0,0,0,h);propImpact(pr,-r.vn,null,p.x,p.y);gnd=true;}
      if(p.x-c[2]<-ROOM){const r=rbContact(pr,p.x-c[2],p.y,1,0,-ROOM-(p.x-c[2]),0,0,0,h);propImpact(pr,-r.vn,null,p.x,p.y);}
      if(p.x+c[2]>ROOM){const r=rbContact(pr,p.x+c[2],p.y,-1,0,p.x+c[2]-ROOM,0,0,0,h);propImpact(pr,-r.vn,null,p.x,p.y);}
      if(p.y-c[2]<TOP){rbContact(pr,p.x,p.y-c[2],0,1,TOP-(p.y-c[2]),0,0,0,h);}
    }
    // the body
    const bx0=pr.x;
    // climbing over a piece of story cover: hands and legs go over it, so the body does not collide with it meanwhile
    forBodies(()=>{if(!(ACT.on&&((ACT.vault&&ACT.vault.pr===pr)||(ACT.passT>0&&ACT.passPr===pr))))for(const s of segs){if(s.gone)continue;const A=P[s.a],B=P[s.b];
      const mx=(A.x+B.x)/2,my=(A.y+B.y)/2;if(Math.hypot(mx-pr.x,my-pr.y)>pr.R+s.len/2+12)continue;
      for(const c of pr.C){const p=propPt(pr,c);const r=dps(p.x,p.y,A.x,A.y,B.x,B.y);const RR=rad(s,r.t)+c[2];
        // resting on top (within 0.45 cm, the same margin as the floor): remember it for static friction below
        if(r.d<RR+0.45&&r.d>1e-4&&p.y-r.qy>0.5*r.d){const nx=(p.x-r.qx)/r.d,ny=(p.y-r.qy)/r.d,e=[pr,p.x-nx*c[2]-pr.x,p.y-ny*c[2]-pr.y,-ny,nx];if(r.t<0.75)rest.set(A,e);if(r.t>0.25)rest.set(B,e);}
        if(!(r.d<RR&&r.d>1e-4))continue;
        const nx=(p.x-r.qx)/r.d,ny=(p.y-r.qy)/r.d,t=r.t,pen=RR-r.d;
        const vsx=lerp((A.x-A.px)/h,(B.x-B.px)/h,t),vsy=lerp((A.y-A.py)/h,(B.y-B.py)/h,t);const oim=(1-t)*(1-t)*A.im+t*t*B.im;
        // story cover while he is on his feet: his contact can't shove it, and walking or kicking into it only carries
        // his limb's own momentum (a 1 kg foot at 4 m/s ≈ 8 J: no injury)
        // (cont.) story cover while he is on his feet: his contact can't shove it (a walking puppet has no force limit); he
        // pushes it on purpose with a real force instead (storyStep). Falling or limp, normal contact applies.
        const lk=pr.story&&V.rise>0.6;const svm=lk?[pr.im,pr.iI]:null;if(lk){pr.im=0;pr.iI=0;}
        const res=rbContact(pr,p.x-nx*c[2],p.y-ny*c[2],nx,ny,pen,vsx,vsy,oim,h);if(lk){pr.im=svm[0];pr.iI=svm[1];}
        const ka=A.im*(1-t),kb=B.im*t,sum=ka+kb||1,ps=Math.min(1.5,pen*(1-res.share)*0.8);A.x-=nx*ps*ka/sum;A.y-=ny*ps*ka/sum;B.x-=nx*ps*kb/sum;B.y-=ny*ps*kb/sum;A.px-=nx*ps*ka/sum;A.py-=ny*ps*ka/sum;B.px-=nx*ps*kb/sum;B.py-=ny*ps*kb/sum;
        const jx=-(nx*res.jn+res.tx*res.jt),jy=-(ny*res.jn+res.ty*res.jt);A.px-=jx*A.im*(1-t)*h;A.py-=jy*A.im*(1-t)*h;B.px-=jx*B.im*t*h;B.py-=jy*B.im*t*h;
        if(-res.vn>300&&pr.cd<T&&s.connected!==undefined){pr.cd=T+0.25;const E=0.5*(lk?s.mass:Math.min(propMass(pr),s.mass*5))*(res.vn/100)**2*1.4;if(E>20){const L=toLocal(s,r.qx+nx*rad(s,t),r.qy+ny*rad(s,t));blunt(s,L.s,L.w,E,PROPDEF[pr.type].name);emitSound('thud',Math.min(1,E/200));}}
        propImpact(pr,-res.vn,s,p.x,p.y);}}});
    // thrown objects
    for(const o of OBJ){if(o.att||o.stuck)continue;if(Math.hypot(o.x-pr.x,o.y-pr.y)>pr.R+o.r)continue;
      for(const c of pr.C){const p=propPt(pr,c);const dx=p.x-o.x,dy=p.y-o.y,d=Math.hypot(dx,dy),RR=c[2]+o.r;if(d>=RR||d<1e-4)continue;const nx=dx/d,ny=dy/d,pen=RR-d;
        const ovx=(o.x-o.px)/h,ovy=(o.y-o.py)/h;const res=rbContact(pr,p.x-nx*c[2],p.y-ny*c[2],nx,ny,pen,ovx,ovy,o.im,h);
        o.x-=nx*pen*(1-res.share)*0.8;o.y-=ny*pen*(1-res.share)*0.8;o.px+=(nx*res.jn+res.tx*res.jt)*o.im*h;o.py+=(ny*res.jn+res.ty*res.jt)*o.im*h;propImpact(pr,-res.vn,null,p.x,p.y);}}
    // floor friction with the real load. Resting contacts are solved by position, so the Coulomb limit in rbContact sees
    // almost no normal impulse, and the small kicks from the patient (breathing, heartbeat, relaxing muscles) plus the
    // solver's own rocking walked a stretcher or slab across the floor. Here the floor pushes back with μ·N, where N is
    // the weight of the prop plus the patient lying on it: a 9 kg stretcher carrying 70 kg on canvas feet (μ ≈ 0.6)
    // resists up to ≈ 470 N, a 40 kg stone slab with him on it ≈ 650 N. Free castors only roll (μ ≈ 0.03), so a push still
    // sends an unbraked gurney off. Static: if the floor can absorb the whole sideways momentum this step, it stops dead, and the sideways
    // nudge the contact solver gave it this step (separating him from it) is taken by the floor too, not by the prop.
    if(gnd&&!pr.held&&!(grab&&grab.prop===pr)&&Math.abs(pr.ang)<0.35){const m=propMass(pr);let load=m;for(const [q,e] of rest)if(e[0]===pr&&!q.gone)load+=q.m;
      const dv=(pr.mu||0.5)*G*h*load/m;if(Math.abs(pr.vx)<=dv){pr.vx=0;pr.x=bx0;}else pr.vx-=Math.sign(pr.vx)*dv;if(Math.abs(pr.av)<0.05)pr.av=0;}
  }
  // the patient lying on a bed, table or slab: skin and cloth on vinyl, canvas or stone grip with μs ≈ 0.5–0.7, so
  // breathing, the heartbeat and muscle tone (newtons) never slide a 70 kg body along it (≈ 400 N to start). Same rule
  // as friction() on the floor, measured relative to the surface underneath so he still rides along when it rolls.
  // The surface velocity is read after the floor rule above: a braked or resting bed has none, even though the contacts
  // just nudged it (its position is held), so it cannot drag him along with a phantom velocity.
  for(const [p,[pr,lx,ly,tx,ty]] of rest){if(p.gone)continue;const held=pr.brake&&pr.bx!=null,[svx,svy]=held?[0,0]:rbVel(pr,lx,ly);
    const rx=p.x-p.px-svx*h,ry=p.y-p.py-svy*h,vt=rx*tx+ry*ty;
    const k=Math.abs(vt)<0.06?1:0.78;p.px+=vt*k*tx;p.py+=vt*k*ty;}
  // props against each other
  for(let i=0;i<PROPS.length;i++)for(let j=i+1;j<PROPS.length;j++){const a=PROPS[i],b=PROPS[j];if(Math.hypot(a.x-b.x,a.y-b.y)>a.R+b.R)continue;
    for(const ca of a.C){const p=propPt(a,ca);if(Math.hypot(p.x-b.x,p.y-b.y)>b.R+ca[2])continue;for(const cb of b.C){const q=propPt(b,cb);const dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy),RR=ca[2]+cb[2];if(d>=RR||d<1e-4)continue;
      const nx=dx/d,ny=dy/d,pen=RR-d,cx=q.x+nx*cb[2],cy=q.y+ny*cb[2];
      const rax=cx-a.x,ray=cy-a.y,rbx=cx-b.x,rby=cy-b.y;const [avx,avy]=rbVel(a,rax,ray),[bvx,bvy]=rbVel(b,rbx,rby);const vn=(avx-bvx)*nx+(avy-bvy)*ny;
      const ra=rax*ny-ray*nx,rb=rbx*ny-rby*nx,k=a.im+b.im+ra*ra*a.iI+rb*rb*b.iI;const sa=a.im/(a.im+b.im);
      a.x+=nx*pen*sa*0.8;a.y+=ny*pen*sa*0.8;b.x-=nx*pen*(1-sa)*0.8;b.y-=ny*pen*(1-sa)*0.8;
      if(vn<0){const jn=-(1.1)*vn/k;rbImp(a,rax,ray,nx*jn,ny*jn);rbImp(b,rbx,rby,-nx*jn,-ny*jn);
        const tx=-ny,ty=nx,vt=(avx-bvx)*tx+(avy-bvy)*ty,rta=rax*ty-ray*tx,rtb=rbx*ty-rby*tx,kt=a.im+b.im+rta*rta*a.iI+rtb*rtb*b.iI;const jt=clamp(-vt/kt,-0.5*jn,0.5*jn);rbImp(a,rax,ray,tx*jt,ty*jt);rbImp(b,rbx,rby,-tx*jt,-ty*jt);
        propImpact(a,-vn,null,cx,cy);propImpact(b,-vn,null,cx,cy);}}}}
  for(let i=PROPS.length-1;i>=0;i--)if(PROPS[i].dead)PROPS.splice(i,1);
}
function propImpact(pr,v,seg,x,y){
  if(pr.type!=='beaker'||pr.dead||T-pr.born<0.15)return;
  if(v>230){shatterBeaker(pr,seg);}
}
// grab: a spring from the pointer to the point that was picked
function propGrabStep(h){if(!grab||!grab.prop||!pointerW)return;const pr=grab.prop;if(pr.dead){grab=null;return;}
  const ca=Math.cos(pr.ang),sa=Math.sin(pr.ang),rx=grab.lx*ca-grab.ly*sa,ry=grab.lx*sa+grab.ly*ca,px=pr.x+rx,py=pr.y+ry;const [vx,vy]=rbVel(pr,rx,ry);
  const k=Math.min(1,40/propMass(pr)),fx=((pointerW.x-px)*60-vx*6)*k,fy=((pointerW.y-py)*60-vy*6)*k;const m=propMass(pr);
  rbImp(pr,rx,ry,fx*m*h*0.9,fy*m*h*0.9);pr.vy-=G*h*0.9;pr.av*=1-3*h;}
function propAt(w){let best=null,bd=Math.max(3,12/VS);for(const pr of PROPS){if(Math.hypot(w.x-pr.x,w.y-pr.y)>pr.R+bd)continue;for(const c of pr.C){const p=propPt(pr,c);const d=Math.hypot(w.x-p.x,w.y-p.y)-c[2];if(d<bd){bd=d;best=pr;}}
  if(pr.type==='beaker'){const ca=Math.cos(-pr.ang),sa=Math.sin(-pr.ang),lx=(w.x-pr.x)*ca-(w.y-pr.y)*sa,ly=(w.x-pr.x)*sa+(w.y-pr.y)*ca,k=pr.sc||1;const by=(ly+pr.oy)/k,bx=(lx+pr.ox)/k;if(Math.abs(bx)<4.6+2/k&&by>-10-2/k&&by<1.5){best=pr;bd=-1;}}}return best;}
function propBullet(b,x,y,dx,dy,len){
  if(!b.doneP)b.doneP=new Set();
  for(const pr of PROPS){if(b.doneP.has(pr))continue;const r=dps(pr.x,pr.y,x,y,x+dx*len,y+dy*len);if(r.d>pr.R)continue;
    for(const c of pr.C){const p=propPt(pr,c);const q=dps(p.x,p.y,x,y,x+dx*len,y+dy*len);if(q.d>c[2]+0.4)continue;
      b.doneP.add(pr);const j=Math.min(b.E,3000)*0.004;rbImp(pr,p.x-pr.x,p.y-pr.y,dx*j,dy*j);
      if(pr.type==='beaker')shatterBeaker(pr,null);
      else if(PROPDEF[pr.type].mat==='steel'){const L=propLocal(pr,q.qx,q.qy);(pr.holes||(pr.holes=[])).push(L);if(pr.holes.length>30)pr.holes.shift();emitSound('tink',0.8);FX.push({k:'spark',x:q.qx,y:q.qy,t:0,life:0.2});
        if(b.E<1000){b.E=0;b.stopAt=Math.max(0,(q.qx-x)*dx+(q.qy-y)*dy);}else b.E*=0.5;}
      else{if(PROPDEF[pr.type].mat==='wood'){const L=propLocal(pr,q.qx,q.qy);(pr.holes||(pr.holes=[])).push(L);if(pr.holes.length>30)pr.holes.shift();b.E*=0.65;}else b.E*=0.75;for(let i=0;i<6;i++)GIBS.push({x:q.qx,y:q.qy,vx:dx*rnd(80,250)+rnd(-60,60),vy:dy*rnd(80,250)-rnd(20,120),ang:rnd(0,6),av:rnd(-20,20),r:rnd(0.3,0.7),type:'wood',pts:[[0.7,0],[0,0.25],[-0.7,0],[0,-0.25]].map(v=>[v[0]*rnd(0.6,1.6),v[1]*rnd(0.6,1.4)]),el:1,rest:false,bl:0});emitSound('thud',0.4);}
      break;}}
}
function shatterBeaker(pr,seg,quiet){if(pr.dead)return;pr.dead=true;const k=pr.sc||1;
  const b=propPt(pr,[-pr.ox,-4*k-pr.oy]);
  for(let i=0;i<Math.round(14*k);i++)GIBS.push({x:b.x+rnd(-3,3)*k,y:b.y+rnd(-4,2)*k,vx:rnd(-160,160),vy:-rnd(40,260),ang:rnd(0,6.28),av:rnd(-25,25),r:rnd(0.3,0.9)*Math.sqrt(k),type:'glass',pts:[[rnd(0.5,1),0],[rnd(-0.3,0.3),rnd(0.3,0.8)],[-rnd(0.4,1),rnd(-0.2,0.2)],[rnd(-0.3,0.3),-rnd(0.3,0.8)]],el:1,rest:false,bl:0});
  if(GIBS.length>GQ().g+30)GIBS.splice(0,GIBS.length-GQ().g-30);
  emitSound('glass');const v0=pr.mix.vol;if(v0>0.05){const{p,v}=takeFrac(pr.mix,1),n=Math.min(70,Math.max(3,Math.ceil(v/2)));for(let i=0;i<n;i++)DROPS.push({x:b.x+rnd(-2,2)*k,y:b.y+rnd(-2,2)*k,vx:pr.vx*0.5+rnd(-150,150),vy:pr.vy*0.3-rnd(30,220),t:0,vol:v/n,p});}
  if(!quiet)emitLog('Beaker shattered'+(v0>1?' · '+Math.round(v0)+' mL splashed out':''),'info');
}
function objStep(h){
  for(let i=OBJ.length-1;i>=0;i--){
    const o=OBJ[i];
    if(o.att){const s=o.att.seg;const p=toWorld(s,o.att.s,o.att.w);o.x=o.px=p.x;o.y=o.py=p.y;o.ang=segAng(s,false)-Math.PI/2;}
    else if(!o.stuck){
      if(o.y>-o.r){const d=o.y-o.py;o.y=-o.r;o.py=o.y+Math.max(0,d)*(o.type==='ball'?0.35:0.25);o.px=o.x-(o.x-o.px)*(o.type==='ball'?0.97:0.8);}
      if(o.x<-ROOM+o.r){const d=o.px-o.x;o.x=-ROOM+o.r;o.px=o.x-Math.max(0,d)*0.4;}
      if(o.x>ROOM-o.r){const d=o.x-o.px;o.x=ROOM-o.r;o.px=o.x+Math.max(0,d)*0.4;}
      if(o.y<TOP+o.r){o.y=TOP+o.r;o.py=o.y;}
      if(o.type!=='mine')for(const s of segs)objVsSeg(o,s,h);
    }
    if(o.fuse!=null){o.fuse-=h;if(o.fuse<=0){OBJ.splice(i,1);explode(o.x,o.y,o.type==='c4'?1.7:1);continue;}}
    if(o.type==='mine'){o.arm-=h;if(o.arm<=0){for(const p of P){if(Math.abs(p.x-o.x)<9&&p.y>-14){OBJ.splice(i,1);explode(o.x,-3,1.4,true);break;}}}}
  }
}
function objVsSeg(o,s,h){
  const A=P[s.a],B=P[s.b];const r=dps(o.x,o.y,A.x,A.y,B.x,B.y);const R=rad(s,r.t)+o.r;
  if(!(r.d<R&&r.d>1e-4))return;
  const nx=(o.x-r.qx)/r.d,ny=(o.y-r.qy)/r.d,t=r.t;
  const vox=(o.x-o.px)/h,voy=(o.y-o.py)/h;
  const vsx=lerp((A.x-A.px)/h,(B.x-B.px)/h,t),vsy=lerp((A.y-A.py)/h,(B.y-B.py)/h,t);
  const vrel=(vox-vsx)*nx+(voy-vsy)*ny;
  const wa=o.im,wb=(1-t)*(1-t)*A.im+t*t*B.im,sum=wa+wb,pen=R-r.d;
  o.x+=nx*pen*wa/sum;o.y+=ny*pen*wa/sum;
  const ka=A.im*(1-t)/sum,kb=B.im*t/sum;
  A.x-=nx*pen*ka;A.y-=ny*pen*ka;B.x-=nx*pen*kb;B.y-=ny*pen*kb;
  if(vrel<0){
    const j=-1.25*vrel/sum;
    o.px-=nx*j*wa*h;o.py-=ny*j*wa*h;
    A.px+=nx*j*A.im*(1-t)*h;A.py+=ny*j*A.im*(1-t)*h;B.px+=nx*j*B.im*t*h;B.py+=ny*j*B.im*t*h;
    if(vrel<-380&&(o.cd[s.idx]||0)<T){
      o.cd[s.idx]=T+0.3;
      const red=o.type==='anvil'?Math.min(o.m,s.mass*6):o.m*s.mass/(o.m+s.mass);const E=0.5*red*(vrel/100)**2*(o.type==='anvil'?1.2:1.6);
      const L=toLocal(s,r.qx+nx*rad(s,t),r.qy+ny*rad(s,t));
      blunt(s,L.s,L.w,E,{brick:'Brick',ball:'Bowling ball',anvil:'Anvil',grenade:'Grenade',c4:'Charge'}[o.type]||'Object');
      if(o.type==='anvil'&&E>220){const rr=radS(s,clamp(L.s,0,s.len))||s.ra;addDent(s,L.s,L.w,rr*Math.min(0.42,E/2400),Math.min(10,4+E/300));if(Math.random()<0.4)spawnGibs(r.qx,r.qy,nx,ny,Math.min(4,E/500),'flesh',160);
        {const rp=[];for(const og of s.organs)if(og.id!=='brain')dmgOrgan(og,E/55*rnd(0.5,1.2),rp,'crushed');if(s.kind==='chest'&&E>350){const nb=Math.min(8,Math.floor(E/320));for(let i=0;i<nb;i++){const rb=s.bones.find(b=>b.shape==='ribs');if(rb)hitBone(rb,50,rp,{s:rnd(2,s.len-2),w:L.w,z:rnd(-1,1)});}}if(rp.length)emitLog('Anvil · '+[...new Set(rp)].slice(0,4).join(', '),'bad');}
        if(s.kind==='head'&&E>500){dmgOrgan(ORG.brain,E/20,[],'crushed');if(E>900&&!V.eyesOut)popEyes();}if(E>700)for(const v of s.vessels)if(!v.deep&&Math.random()<0.4)cutVessel(v,0.6,{s:L.s,w:L.w,dw:L.w>0?1:-1,ds:0},[]);}
      emitSound('thud',Math.min(1,E/200));
    }
  }
}
function impulse(seg,t,dx,dy,dp){
  const h=hPrev||1/360;let dv=dp/seg.mass*100;dv=Math.min(dv,650);
  const A=P[seg.a],B=P[seg.b];
  A.px-=dx*dv*2*(1-t)*h;A.py-=dy*dv*2*(1-t)*h;B.px-=dx*dv*2*t*h;B.py-=dy*dv*2*t*h;
  if(dv>250&&V.rise>0.5)V.rise=Math.min(V.rise,0.5);
}
let ZTGT=null;
function throwVel(d){const dx=d.cw.x-d.sw.x,dy=d.cw.y-d.sw.y;let vx=dx*14,vy=dy*14;const m=Math.hypot(vx,vy);if(m>2300){vx*=2300/m;vy*=2300/m;}return{x:vx,y:vy};}

/* ---------- gurney caster brakes: tap the red/green button by a wheel ---------- */
const BRAKEPT=[[-78,-15],[78,-15]];
function brakeAt(w,r){for(const pr of PROPS){if(pr.brake==null)continue;const ca=Math.cos(pr.ang),sa=Math.sin(pr.ang);
  for(const q of BRAKEPT){const x=pr.x+(q[0]-pr.ox)*ca-(q[1]-pr.oy)*sa,y=pr.y+(q[0]-pr.ox)*sa+(q[1]-pr.oy)*ca;
    if(Math.hypot(w.x-x,w.y-y)<r){pr.brake=!pr.brake;if(!pr.brake){pr.vx=0;}emitSound('tink',0.5);emitLog(PROPDEF[pr.type].name+(pr.brake?' · wheels locked':' · brakes off, it rolls freely'),'info');return true;}}}
  return false;}

/* ---------- in a pool: buoyancy, water drag ----------
   The body is close to the density of water (≈ 1.01 g/cm³; ≈ 0.98 with air in the lungs), so in water it is almost weightless;
   dense liquids (98 % sulfuric acid, 1.84 g/cm³) float it high, ethanol (0.8) lets it sink. Water drag damps every movement. */
function poolForces(h){for(const pr of PROPS){if(pr.upright){pr.av=0;pr.ang=0;}if(pr.type!=='pool'||!pr.mix||pr.mix.vol<1)continue;const rho=mixRho(pr.mix),k=Math.exp(-h*3.5);
  for(const p of P){if(p.gone||!inLiquid(pr,p.x,p.y))continue;p.y-=G*h*h*Math.min(1.3,rho/0.99);const vx=p.x-p.px,vy=p.y-p.py;p.px=p.x-vx*k;p.py=p.y-vy*k;}}}
