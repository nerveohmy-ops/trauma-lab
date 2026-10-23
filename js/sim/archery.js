/* TRAUMA_LAB_MAIN */
/* ===== sim/archery.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
/* =========================================================
   BOW AND CROSSBOW
   Arrows are slow, heavy and sharp: a 70 lb compound bow throws a 28 g arrow at up to 90 m/s (~110 J),
   a crossbow a 26 g bolt at ~110 m/s (~160 J). They drop under real gravity, so they fly in a visible arc.
   A broadhead does not punch a cavity like a bullet: it slices, so it keeps going on little energy
   (≈1.5 J per cm of muscle, a few J for skin, ~12 J to cut a rib, 60–90 J to get through a skull or femur)
   and cuts every vessel in its path. Killing is by bleeding. When it runs out of energy it stays in,
   plugging its own wound until it is pulled out.
   ========================================================= */
const ARDEF={
  bow:{n:'Compound bow',m:0.028,v:9000,len:72,dia:0.85,shaft:'#2b2f33',flet:'#e0583c',head:'broadhead',draw:0.8},
  crossbow:{n:'Crossbow',m:0.026,v:11000,len:42,dia:0.9,shaft:'#3a3a2c',flet:'#e8e2d0',head:'broadhead',reload:2.5},
};
let ARROWS=[],ARSTUCK=[],FARROWS=[],FGLANCE=[];
// air drag on an arrow: dv/dt = -k v^2 (per cm); a target arrow sheds ~5% of its speed over 25 m
const AR_DRAG=2e-5,FRDIST={bow:2500,crossbow:2200};
function arrowE(a){return 0.5*a.m*Math.pow(Math.hypot(a.vx,a.vy)/100,2);}
function shootArrow(kind,x,y,dx,dy,draw=1){const d=ARDEF[kind];const l=Math.hypot(dx,dy)||1,v=d.v*Math.sqrt(clamp(draw,0.15,1))*rnd(0.98,1.02);
  {const ja=rnd(-1,1)*(kind==='bow'?0.005:0.0025)*(1.6-clamp(draw,0.15,1)),c_=Math.cos(ja),s_=Math.sin(ja),ux=dx/l,uy=dy/l;ARROWS.push({k:kind,x,y,vx:(ux*c_-uy*s_)*v,vy:(ux*s_+uy*c_)*v,m:d.m,z:rnd(-0.9,0.9),done:new Set(),t:0,rep:[],flex:(kind==='bow'?1:0.35)*rnd(0.8,1.2),ph:rnd(0,6.28),hist:[]});}emitSound('whoosh',0.5);if(V&&!V.dead){V.fear=Math.min(1,V.fear+0.2);V.thx=x;}}
function arrowStep(h){
  for(let i=ARROWS.length-1;i>=0;i--){const a=ARROWS[i];a.t+=h;a.vy+=G*h;{const s_=Math.hypot(a.vx,a.vy),f_=1/(1+AR_DRAG*(a.defl?25:1)*s_*h);a.vx*=f_;a.vy*=f_;}if(a.defl&&a.spin!=null)a.ang+=a.spin*h;const sp=Math.hypot(a.vx,a.vy),dx=a.vx/sp,dy=a.vy/sp,step=sp*h;let gone=false;
    if(PROPS.length)propBullet({E:arrowE(a),doneP:a.doneP||(a.doneP=new Set())},a.x,a.y,dx,dy,step);
    const hits=a.defl?[]:traceRay(a.x,a.y,dx,dy,step);
    for(const ht of hits){if(ht.tin>step)break;if(a.done.has(ht.seg.idx))continue;a.done.add(ht.seg.idx);const zr=ht.seg.zr;if(zr&&(a.z<zr[0]||a.z>zr[1]))continue;
      const seg=ht.seg,Li=toLocal(seg,a.x+dx*ht.tin,a.y+dy*ht.tin),Lo=toLocal(seg,a.x+dx*ht.tout,a.y+dy*ht.tout),dl=dirLocal(seg,dx,dy);
      const r=arrowHit(a,seg,Li,Lo,Math.max(0.3,ht.tout-ht.tin),dl,null);
      if(r.stuck){gone=true;break;}if(r.deflect)break;}
    if(gone){ARROWS.splice(i,1);continue;}
    if(a.hist){a.hist.push(a.x,a.y);if(a.hist.length>6)a.hist.splice(0,2);}
    a.x+=dx*step;a.y+=dy*step;
    if(a.defl&&a.y<=-0.3&&a.y>=TOP&&Math.abs(a.x)>ROOM){a.x=clamp(a.x,-ROOM+0.1,ROOM-0.1);a.vx*=-0.3;a.spin=(a.spin||0)*-0.6;emitSound('tink',0.2);}
    else if(a.defl&&a.y>-0.3){ARSTUCK.push({k:a.k,x:clamp(a.x,-ROOM,ROOM),y:-0.45,ang:Math.cos(a.ang||0)>=0?0.02:Math.PI-0.02,depth:0,t:T,flat:true});emitSound('thud',0.15);ARROWS.splice(i,1);continue;}
    else if(a.y>-0.3||Math.abs(a.x)>ROOM||a.y<TOP){a.x=clamp(a.x,-ROOM,ROOM);a.y=clamp(a.y,TOP,-0.3);ARSTUCK.push({k:a.k,x:a.x,y:a.y,ang:Math.atan2(dy,dx),depth:Math.min(ARDEF[a.k].len*0.3,arrowE(a)/8),t:T});emitSound('thud',0.3);ARROWS.splice(i,1);
      if(a.rep.length)emitLog(ARDEF[a.k].n+' · '+[...new Set(a.rep)].slice(0,5).join(', '),'bad');}}
  for(let i=ARSTUCK.length-1;i>=0;i--){const q=ARSTUCK[i];if(!q.seg&&T-q.t>90)ARSTUCK.splice(i,1);else if(q.seg&&q.seg.gone)ARSTUCK.splice(i,1);}
  if(ARSTUCK.length>40)ARSTUCK.splice(0,ARSTUCK.length-40);
  // front/back shots in the air: they land when their flight time is up
  for(let i=FARROWS.length-1;i>=0;i--){const f=FARROWS[i];f.t+=h;if(f.t<f.tf)continue;FARROWS.splice(i,1);const pv=view;view=f.v;try{frontArrow(f.k,f.x+f.ex,f.y+f.ey,f.v0*Math.exp(-AR_DRAG*f.D));}finally{view=pv;}}
  for(let i=FGLANCE.length-1;i>=0;i--){const g=FGLANCE[i];g.t+=h;g.vy+=G*h;g.x+=g.vx*h;g.y+=g.vy*h;g.ang+=g.spin*h;if(g.y>-0.5){g.y=-0.5;g.vy*=-0.25;g.vx*=0.5;g.spin*=0.4;}if(g.t>2.5)FGLANCE.splice(i,1);}
}
// resistance of what the broadhead meets (J per cm, or J to get through a bone)
const AR_SOFT=1.5,AR_SKIN=3;
function arBoneCost(bo){if(bo.shape==='ribs')return 12;if(bo.id==='skull')return 70;if(bo.spine)return 45;if(bo.id==='pelvis')return 55;if(bo.limb&&!bo.minor)return /Fem/.test(bo.id)?90:55;return 25;}
function arrowHit(a,seg,Li,Lo,len,dl,front){const d=ARDEF[a.k],rep=a.rep;let E=arrowE(a);const E0=E;
  // armour
  if(anyWear()){const b={E,k:a.k,m:a.m,knock:1,z:a.z};const st_=armorStop(seg,Li,b,dl,rep,false);if(b.mark){b.mark.arrow=1;if(front){b.mark.fx=front.x;b.mark.fy=front.y;b.mark.v=view;}}if(st_){{const sp0=Math.hypot(a.vx,a.vy),an0=Math.atan2(a.vy,a.vx),ra_=an0+Math.PI+rnd(-1,1);a.ang=an0;a.vx=Math.cos(ra_)*sp0*0.12;a.vy=Math.sin(ra_)*sp0*0.12-rnd(100,250);a.spin=rnd(-40,40);}a.defl=1;emitSound('tink',0.6);const p=toWorld(seg,Li.s,Li.w);FX.push({k:'spark',x:p.x,y:p.y,t:0,life:0.15});return{stuck:false,deflect:true};}if(b.E<E){E=b.E;}}
  E-=AR_SKIN;if(E<=0){bounce(a);a.defl=1;return{stuck:false};}
  const N=Math.max(8,Math.ceil(len/0.35)),ds=len/N,inside=new Map(),soft=seg.organs.filter(o=>o.kind==='lung');let stopT=null,stopBone=null;const hitB=[];
  for(let i=0;i<=N;i++){const t=i/N,q={s:lerp(Li.s,Lo.s,t),w:lerp(Li.w,Lo.w,t)};
    for(const bo of seg.bones){if(!zIn(a.z,bo))continue;const now=boneInside(bo,q),was=inside.get(bo)||false;inside.set(bo,now);const enter=now&&!was,leave=!now&&was&&bo.shape==='ell';if(!enter&&!leave)continue;
      const c=arBoneCost(bo)*(leave?0.8:1);hitB.push(bo);if(E<c){stopT=t;stopBone=bo;E=0;break;}E-=c;}
    if(stopT!=null)break;
    let f=AR_SOFT;for(const o of soft){if(Math.hypot((q.w-o.w)/o.rw,(q.s-o.s)/o.rs)<1){f=0.4;break;}}E-=f*ds;if(E<=0){stopT=t;E=0;break;}}
  let exited=stopT==null;if(exited){E-=AR_SKIN;if(E<=0){exited=false;stopT=0.97;E=0;}}
  const Le=exited?Lo:{s:lerp(Li.s,Lo.s,stopT),w:lerp(Li.w,Lo.w,stopT)};
  // what it cut on the way
  for(const bo of hitB)hitBone(bo,stopBone===bo?20:12,rep,boneHitAt(bo,Li,Le,a.z));
  if(stopBone)rep.push('arrow stuck in the '+stopBone.name.toLowerCase());
  for(const o of seg.organs){if(zIn(a.z,o)&&ellHit(o,Li,Le,0.3)){if(o.id==='brain'){if(o.stem==null)o.stem=100;if(Math.abs(a.z)<0.4&&ellHit(STEM,Li,Le,0.3))stemDmg(o,90,rep);}dmgOrgan(o,(30+25*Math.random())*o.vuln,rep,'cut through',o.id==='brain');orgMark(o,'stab',(Li.w+Le.w)/2,(Li.s+Le.s)/2,null,null,a.z);}}
  for(const v of seg.vessels){if(!zIn(a.z,v))continue;if(polyHit(v.pts,Li,Le,v.width/2+0.65))cutVessel(v,0.8,exited?{s:Lo.s,w:Lo.w,dw:dl.w,ds:dl.s}:{s:Li.s,w:Li.w,dw:-dl.w,ds:-dl.s},rep);}
  const en=addWound(seg,{type:'hole',slit:true,arrow:true,s:Li.s,w:Li.w,r:1.05,bleed:0.3,dw:-dl.w,ds:-dl.s,z:a.z});
  if(front){if(view==='back'){en.bx1=front.x;en.by1=front.y;en.bx2=null;en.by2=null;}else{en.fx1=front.x;en.fy1=front.y;en.ff=true;FW.push({seg,x:front.x,y:front.y,r:1.05,type:'arrow',band:false,ref:en,age:0,blood:0,rot:rnd(0,6.28)});if(FW.length>160){const i=FW.findIndex(f=>!f.ref||!f.seg.wounds.includes(f.ref));FW.splice(i>=0?i:0,1);}}}
  let ex=null;if(exited){ex=addWound(seg,{type:'hole',slit:true,arrow:true,exit:true,s:Lo.s,w:Lo.w,r:1.25,bleed:0.4,dw:dl.w,ds:dl.s,z:a.z});en.pair=ex;ex.pair=en;if(front){if(view==='back'){ex.fx1=front.x;ex.fy1=front.y;}else{ex.bx1=front.x;ex.by1=front.y;ex.bx2=null;ex.by2=null;}}}
  seg.tracks.push({s1:Li.s,w1:Li.w,s2:Le.s,w2:Le.w,r:0.45});if(seg.tracks.length>30)seg.tracks.shift();
  hurt(seg,Li.s,Li.w,seg.kind==='head'?30:22);
  {const p=toWorld(seg,Li.s,Li.w),dd=dirWorld(seg,dl.w,dl.s);mist(p.x,p.y,-dd.x,-dd.y,3,120,0.6,0.4);}
  const dp=a.m*(Math.sqrt(2*E0/a.m)-Math.sqrt(2*Math.max(0,E)/a.m));const wd=dirWorld(seg,dl.w,dl.s);impulse(seg,clamp(((Li.s+Le.s)/2)/seg.len,0,1),wd.x,wd.y,dp*1.2);
  if(!exited){
    // it stays in: the shaft sticks out of the entry, the depth is how far it got
    const depth=Math.hypot(Le.s-Li.s,Le.w-Li.w),S={k:a.k,seg,s:Li.s,w:Li.w,ds:dl.s,dw:dl.w,depth,z:a.z,wd:en,front:front?{v:view,x:front.x,y:front.y}:null,t:T};ARSTUCK.push(S);
    en.plug=true;en.bleed*=0.5;rep.push((d.n==='Crossbow'?'bolt':'arrow')+' lodged '+Math.round(depth)+' cm deep in the '+seg.label.toLowerCase().replace(' (cut off)',''));
    if(!front){emitLog(d.n+' · '+[...new Set(rep)].slice(0,5).join(', '),'bad');a.rep=[];}
    return{stuck:true};}
  // the head is out the far side, but the shaft still has to slide through the channel it cut and the vanes have to
  // squeeze through the skin. Shaft friction ≈ 0.15 J/cm plus ≈ 0.006 J/cm for every cm of tissue gripping it; vanes ≈ 3 J
  // (≈ 1.5 J for short bolt vanes). If what is left is not enough, it stops part-way: head out the back, fletching out the front.
  const fr=0.15+0.006*len,vane=a.k==='crossbow'?1.5:3,Epass=fr*d.len+vane;
  if(E<Epass){const out=clamp(E/fr,0.5,d.len-len-0.5>1?d.len-len-0.5:d.len*0.6);
    const S={k:a.k,seg,s:Li.s,w:Li.w,ds:dl.s,dw:dl.w,depth:len+out,thick:len,out,z:a.z,wd:en,wx:ex,front:front?{v:view,x:front.x,y:front.y}:null,t:T};ARSTUCK.push(S);
    en.plug=true;ex.plug=true;en.bleed*=0.6;ex.bleed*=0.6;
    rep.push((d.n==='Crossbow'?'bolt':'arrow')+' went through the '+seg.label.toLowerCase().replace(' (cut off)','')+' and stuck: head '+Math.round(out)+' cm out the far side');
    if(!front){emitLog(d.n+' · '+[...new Set(rep)].slice(0,5).join(', '),'bad');a.rep=[];}
    return{stuck:true};}
  E-=Epass;
  // through and through: it keeps flying with what is left
  const v=Math.sqrt(2*E/a.m)*100,sp=Math.hypot(a.vx,a.vy)||1;a.vx*=v/sp;a.vy*=v/sp;rep.push('passed straight through the '+seg.label.toLowerCase().replace(' (cut off)',''));
  return{stuck:false};}
function bounce(a){a.ang=Math.atan2(a.vy,a.vx);a.vx*=-0.2;a.vy*=-0.2;a.spin=rnd(-30,30);}
// front/back view: you are the archer, 25 m out. The arrow leaves your bow below your eye, climbs, and drops into the spot you aimed at
// (the sight already allows for the drop), shedding speed to drag; it swims for the first metres and spins from the helical fletching.
function frontLaunch(kind,fx,fy){const d=ARDEF[kind],D=FRDIST[kind],v0=d.v*rnd(0.985,1.015),tf=(Math.exp(AR_DRAG*D)-1)/(AR_DRAG*v0);
  const er=kind==='bow'?1.5:0.9,ex=(rnd(-1,1)+rnd(-1,1))*0.5*er,ey=(rnd(-1,1)+rnd(-1,1))*0.5*er,hb=-7,xb=kind==='bow'?-3:0;
  const vy0=(-ey-hb+0.5*G*tf*tf)/tf;
  FARROWS.push({k:kind,x:fx,y:fy,ex,ey,D,v0,tf,t:0,vy0,hb,xb,v:view,rot:rnd(0,6.28),ph:rnd(0,6.28)});emitSound('whoosh',0.5);
  if(V&&!V.dead){V.fear=Math.min(1,V.fear+0.2);}}
function frontFlightState(f,t){const d=Math.log(1+AR_DRAG*f.v0*t)/AR_DRAG,fr=Math.min(1,d/f.D),w=Math.exp(-t/0.1)*(1-fr);
  return{d,lat:f.xb*(1-fr)+f.ex*fr+2.4*w*Math.sin(2*Math.PI*8*t+f.ph),up:f.hb+f.vy0*t-0.5*G*t*t+1.1*w*Math.sin(2*Math.PI*7*t+f.ph*1.7)};}
function frontArrow(kind,fx,fy,v){const hit=frontHit(fx,fy);if(!hit){FX.push({k:'fspark',x:fx,y:fy,t:0,life:0.2});emitSound('thud',0.15);return;}
  const d=ARDEF[kind],a={k:kind,m:d.m,vx:v||d.v,vy:0,z:hit.zx,rep:[]};const {s,r}=frontLocal(hit),bk=view==='back';emitSound('thud',0.35);
  const res=arrowHit(a,hit.seg,{s,w:(bk?-1:1)*r*0.97},{s,w:(bk?1:-1)*r*0.97},2*r,{w:bk?1:-1,s:0},{x:fx,y:fy});
  if(res.deflect){FGLANCE.push({k:kind,x:fx,y:fy,vx:rnd(-90,90),vy:-rnd(60,170),ang:rnd(0,6.28),spin:rnd(-25,25),t:0});FX.push({k:'fspark',x:fx,y:fy,t:0,life:0.2});}
  if(res.stuck){const S=ARSTUCK[ARSTUCK.length-1];if(S&&S.front)S.tilt={x:rnd(-0.14,0.14),y:rnd(0.06,0.2)};}
  if(!res.stuck&&!res.deflect)a.rep.push('the '+(kind==='crossbow'?'bolt':'arrow')+' came out the other side');
  emitLog(d.n+' · '+[...new Set(a.rep)].slice(0,5).join(', '),'bad');}
// pulling an arrow out (Remove tool): the broadhead cuts again on the way out and the wound opens
function pullArrow(S){const i=ARSTUCK.indexOf(S);if(i>=0)ARSTUCK.splice(i,1);if(S.wd){S.wd.plug=false;S.wd.bleed+=0.35;S.wd.r=Math.min(1.6,S.wd.r+0.3);}if(S.wx){S.wx.plug=false;S.wx.bleed+=0.2;}
  const rep=[];for(const v of S.seg.vessels){if(v.cut>0&&v.cut<1&&Math.random()<0.5)cutVessel(v,0.2,v.at,rep);}hurt(S.seg,S.s,S.w,25);emitSound('slice');
  emitLog((S.k==='crossbow'?'Bolt':'Arrow')+' pulled out of the '+S.seg.label.toLowerCase()+' · the broadhead cuts again on the way out, bleeding picks up','bad');}
function arrowWorld(S){if(S.seg){const e=toWorld(S.seg,S.s,S.w),u=dirWorld(S.seg,S.dw,S.ds),n=Math.hypot(u.x,u.y)||1;return{x:e.x,y:e.y,ux:u.x/n,uy:u.y/n};}return{x:S.x,y:S.y,ux:Math.cos(S.ang),uy:Math.sin(S.ang)};}
function shootCrossbow(x,y,dx,dy){if(T<(shootCrossbow.next||0)){emitLog('Crossbow · still cocking the string ('+(shootCrossbow.next-T).toFixed(1)+' s)','info');return false;}shootCrossbow.next=T+ARDEF.crossbow.reload;shootArrow('crossbow',x,y,dx,dy,1);emitSound('thud',0.4);return true;}
function arrowCam(ts){if(OPT.arrowcam===false)return ts;if(FARROWS.length)return Math.min(ts,0.3);for(const a of ARROWS)if(!a.defl)return Math.min(ts,0.07);return ts;}
