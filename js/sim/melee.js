/* TRAUMA_LAB_MAIN */
/* ===== sim/melee.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
function bladeStroke(x0,y0,x1,y1,kind,speed){
  if(ROPES.length)ropeCut(x0,y0,x1,y1);if(GUTS.length)gutCut(x0,y0,x1,y1);
  const L=Math.hypot(x1-x0,y1-y0);if(L<0.6)return;
  const n=Math.ceil(L/0.5);const rep=[];let any=false;const saber=kind==='saber',laser=kind==='laser'||saber,mach=kind==='machete'||kind==='axe'||laser;const nearHit=new Set();
  const vb0=saber?new Map(VESSELS.map(v=>[v,v.cut])):null,wb0=saber?new Map(segs.map(g=>[g,g.wounds.length])):null;
  for(const s of [...ORDER].reverse()){
    if(LIMBK.includes(s.kind)&&s.side==='far'&&nearHit.has(s.kind))continue;
    let first=null,last=null;
    for(let i=0;i<=n;i++){const x=lerp(x0,x1,i/n),y=lerp(y0,y1,i/n);if(insideSeg(s,x,y)){if(!first)first=[x,y];last=[x,y];}}
    if(!first)continue;
    const a=toLocal(s,first[0],first[1]),b=toLocal(s,last[0],last[1]);const cl=Math.hypot(a.s-b.s,a.w-b.w);if(cl<0.4)continue;
    {const bb=anyWear()&&bladeBlock(s,(a.s+b.s)/2,(a.w+b.w)/2,kind,false);if(bb){if(s.side==='near')nearHit.add(s.kind);(s.amarks||(s.amarks=[])).push({s:(a.s+b.s)/2,w:(a.w+b.w)/2,z:0.85,it:bb,cut:true});if(s.amarks.length>30)s.amarks.shift();rep.push('blade turned by '+WEARDEF[bb].name.toLowerCase());any=true;continue;}}
    any=true;if(s.side==='near')nearHit.add(s.kind);
    const prev=s.wounds[s.wounds.length-1];
    if(prev&&prev.type==='cut'&&prev.live&&Math.hypot(prev.s2-a.s,prev.w2-a.w)<1.5&&prev.len<16&&sameWay(prev.s2-prev.s,prev.w2-prev.w,b.s-a.s,b.w-a.w)){prev.s2=b.s;prev.w2=b.w;prev.len+=cl;prev.bleed+=(mach?0.2:0.1)*cl;}
    else{for(const w of s.wounds)w.live=false;addWound(s,{type:'cut',s:a.s,w:a.w,s2:b.s,w2:b.w,r:mach?0.6:0.35,len:cl,bleed:(laser?0.015:mach?0.2:0.1)*cl,live:true,dw:0,ds:0,laser});}
    if(laser){const lw_=s.wounds[s.wounds.length-1];if(lw_&&lw_.type==='cut')lw_.bleed=Math.min(lw_.bleed,0.05*lw_.len);burnHit(s,(a.s+b.s)/2,(a.w+b.w)/2,1.6,null,true);const pp=toWorld(s,b.s,b.w);mist(pp.x,pp.y,0,-1,2,40,1.4,0.5);}
    const deep=saber||(mach&&speed>250);if(laser&&Math.random()<0.6){for(const v of s.vessels)if(!v.deep&&v.cut>0&&v.cut<1&&!v.lig&&v.width<0.9)v.lig=true;}
    for(const v of s.vessels){if((v.deep&&!deep)||v.cut>=1)continue;if(polyHit(v.pts,a,b,v.width/2+(mach?0.5:0.2))&&Math.random()<(mach?0.9:0.75))cutVessel(v,mach?0.7:0.45,{s:(a.s+b.s)/2,w:(a.w+b.w)/2,dw:a.w>0?1:-1,ds:0.3},rep);}
    for(const o of s.organs){if((o.shallow||deep)&&ellHit(o,a,b,0)){dmgOrgan(o,cl*(mach?10:6),rep,'cut');orgMark(o,'cut',a.w,a.s,b.w,b.s);}}
    if(mach){
      if(LIMBK.includes(s.kind)&&s.bones.some(bo=>bo.shape==='line'&&polyHit(bo.pts,a,b,bo.width/2+0.4))){s.chop=(s.chop||0)+(saber?1.2:speed*(s.bones.some(x=>x.broken)?0.0032:0.0011));const ms=(a.s+b.s)/2;s.chopS=s.chopS==null?ms:lerp(s.chopS,ms,0.4);if(s.chop>1){s.chop=0;const cs=s.chopS;s.chopS=null;if(cutLimbAt(s,cs,rep))continue;}}
      for(const bo of s.bones){if(bo.shape==='line'&&polyHit(bo.pts,a,b,bo.width/2)){const lc=boneHitAt(bo,a,b,0);if(lc)boneMark(bo,lc,'cut');hitBone(bo,speed*0.04,rep,lc);}if(bo.shape==='ribs'&&speed>300&&Math.random()<0.3){s.ribsBroken++;rep.push('rib cut');}}
      const ends=[[s.joint,s.joint&&s.joint.end==='a'?0:s.len],...joints.filter(q=>q.p===s.idx&&q.t>0.9).map(q=>[q,s.len])];
      for(const [j,es] of ends){if(!j||j.broken||!LIMBK.includes(segs[j.c].kind)&&false)continue;if(Math.min(Math.abs(a.s-es),Math.abs(b.s-es))<6&&!LIMBK.includes(s.kind)){j.chop+=saber?1.2:speed*(s.bones.some(x=>x.broken)?0.0035:0.0012);if(j.chop>1&&(saber||segs[j.c].kind!=='abd'))sever(j,rep);}}
      const d=dirWorld(s,b.w-a.w,b.s-a.s);const dl=Math.hypot(d.x,d.y)||1;impulse(s,0.5,d.x/dl,d.y/dl,speed*0.004);
      if(speed>300&&Math.random()<0.35){const p=toWorld(s,b.s,b.w);spawnGibs(p.x,p.y,d.x/dl,d.y/dl,1,'flesh',200);}
    }
    if(saber){for(const v of s.vessels)if(v.cut>0&&!v.lig&&v.width<1.6&&Math.random()<0.85)v.lig=true;}
    hurt(s,(a.s+b.s)/2,(a.w+b.w)/2,cl*(mach?2.4:1.6));
    {const cw=s.wounds[s.wounds.length-1];if(cw&&cw.type==='cut'&&!cw.laser&&(cw.flaps||0)<2&&cw.len>=(mach?4:8)){cw.flaps=(cw.flaps||0)+1;addFlaps(s,cw,1);}}
  }
  if(saber&&any){for(const v of VESSELS){const c0=vb0.get(v);if((c0==null||v.cut>c0)&&v.cut>0&&!v.lig&&v.width<1.6&&Math.random()<0.9)v.lig=true;}
    for(const g of segs){const n0=wb0.get(g)||0;for(let i=n0;i<g.wounds.length;i++){const w=g.wounds[i];if(w.type==='stump'){w.bleed*=0.08;w.seared=true;}}}}
  if(any){if(T-(bladeStroke.t||0)>0.12){emitSound(saber?'saberhit':laser?'sizzle':'slice');bladeStroke.t=T;}if(rep.length)emitLog((saber?'Plasma sword':laser?'Laser':kind==='axe'?'Axe':mach?'Machete':'Knife')+' · '+[...new Set(rep)].join(', '),'bad');}
}
function stab(x,y){
  const rep=[];
  for(const s of [...ORDER].reverse()){
    if(!insideSeg(s,x,y))continue;const L=toLocal(s,x,y);
    stabAt(s,L.s,L.w,rnd(-1,1),rep);
    emitLog('Stab · '+s.label.toLowerCase()+(rep.length?': '+[...new Set(rep)].join(', '):''),'bad');emitSound('slice');
    return true;
  }
  return false;
}
function stabAt(s,ls,lw,z,rep){
  {const bb=anyWear()&&bladeBlock(s,ls,lw,'knife',true);if(bb){(s.amarks||(s.amarks=[])).push({s:ls,w:lw,z,it:bb,cut:true});rep.push('stab stopped by '+WEARDEF[bb].name.toLowerCase());return false;}}
  addWound(s,{type:'hole',slit:true,s:ls,w:lw,r:1.1,bleed:0.6,dw:0,ds:0,z});
  for(const o of s.organs){if(zIn(z,o)&&(Math.hypot((lw-o.w)/o.rw,(ls-o.s)/o.rs)<1.15||(o.rs>4&&Math.abs(ls-o.s)<o.rs))){dmgOrgan(o,rnd(30,55)*o.vuln,rep,'stabbed');orgMark(o,'stab',clamp(lw,o.w-o.rw*0.8,o.w+o.rw*0.8),clamp(ls,o.s-o.rs*0.8,o.s+o.rs*0.8),null,null,z);}}
  for(const v of s.vessels){if(zIn(z,v)&&polyNear(v.pts,{s:ls,w:lw},v.width/2+1.3))cutVessel(v,0.7,{s:ls,w:lw,dw:0,ds:0},rep);}
  hurt(s,ls,lw,22);
  s.tracks.push({s1:ls,w1:lw,s2:ls+rnd(-1,1),w2:lw-Math.sign(lw||1)*3,r:0.6});
  return true;
}
function batStroke(x0,y0,x1,y1,speed){
  if(speed<150)return;const nearHit=new Set();
  for(const s of [...ORDER].reverse()){
    if(LIMBK.includes(s.kind)&&s.side==='far'&&nearHit.has(s.kind))continue;
    let hit=null;const L=Math.hypot(x1-x0,y1-y0),n=Math.max(1,Math.ceil(L/1));
    for(let i=0;i<=n;i++){const x=lerp(x0,x1,i/n),y=lerp(y0,y1,i/n);if(insideSeg(s,x,y)){hit=[x,y];break;}}
    if(!hit||T-(s.batT||0)<0.3)continue;s.batT=T;if(s.side==='near')nearHit.add(s.kind);
    const v=Math.min(speed,2600)/100;const E=0.5*1.0*v*v*1.8;
    const Lc=toLocal(s,hit[0],hit[1]);blunt(s,Lc.s,Lc.w,E,'Bat');
    const dx=(x1-x0)/(L||1),dy=(y1-y0)/(L||1);impulse(s,0.5,dx,dy,v*0.9);emitSound('thud',1);
  }
}
function hammer(x,y){
  for(const s of [...ORDER].reverse()){if(!insideSeg(s,x,y))continue;const L=toLocal(s,x,y);blunt(s,L.s,L.w,rnd(120,150),'Hammer',2.2);FX.push({k:'ring',x,y,t:0,life:0.3});emitSound('thud',1);return true;}
  return false;
}
/* =========================================================
   PHYSICAL MELEE WEAPONS (side view)
   Each weapon is a rigid body with real length, mass, centre of mass and moment of inertia.
   You hold it by the grip: the grip follows your finger and the rest swings like a real
   swung object (pendulum driven by the grip's acceleration and gravity), so the head lags
   and then whips through. Let go and it flies as a thrown object.
   What it does depends on the part that hits and how: the edge slices along its motion,
   the point stabs on a thrust, blunt parts transfer ½·m·v² into the body.
   ========================================================= */
// x: distance along the weapon from the butt (cm), y: across it (+ = edge / face side), r: radius
const MWDEF={
  knife:  {n:'Knife',L:30,m:0.15,xg:5,com:10,kind:'knife',parts:[[0,11,0,1.1,'handle'],[11.5,28.5,0.2,0.5,'edge'],[30,30,0,0.4,'tip']]},
  machete:{n:'Machete',L:62,m:0.6,xg:6,com:24,kind:'machete',parts:[[0,14,0,1.2,'handle'],[15,60,0.5,0.7,'edge'],[62,62,0,0.5,'tip']]},
  axe:    {n:'Axe',L:72,m:1.6,xg:8,com:52,kind:'axe',parts:[[0,60,0,1.4,'rod'],[63,71,7,0.9,'edge'],[64,70,-3.2,1.4,'face']]},
  saber:  {n:'Plasma sword',L:110,m:1.0,xg:12,com:14,kind:'saber',parts:[[0,28,0,1.4,'handle'],[29,110,0,0.6,'edge']]},
  bat:    {n:'Baseball bat',L:84,m:0.9,xg:8,com:55,parts:[[0,30,0,1.4,'handle'],[32,84,0,3.2,'rod']],rodR:3.3},
  hammer: {n:'Hammer',L:34,m:0.6,xg:6,com:27,parts:[[0,29,0,1.1,'handle'],[32,32,4.6,1.5,'face'],[32,32,-6,0.7,'claw']]},
  pipe:   {n:'Steel pipe',L:60,m:1.2,xg:6,com:30,parts:[[0,60,0,1.7,'rod']],rough:1,rodR:1.7},
  crowbar:{n:'Crowbar',L:76,m:1.6,xg:8,com:40,parts:[[0,72,0,1.1,'rod'],[76,76,4,0.8,'claw']],rough:0.6,rodR:1.1},
};
let MW=[];
   // weapons in the world
let MWH=null;
  // the one in your hand
function mwSamples(d){if(d.S)return d.S;const S=[];for(const [x0,x1,y,r,t] of d.parts){const n=Math.max(1,Math.ceil((x1-x0)/2));for(let i=0;i<=n;i++)S.push({x:x0+(x1-x0)*(n?i/n:0),y,r,t});}
  // moment of inertia about the centre of mass: a slender rod plus a concentrated head where there is one
  d.Ic=d.m*d.L*d.L/12*(d.parts.some(p=>p[4]==='face'||p[4]==='claw')?0.55:0.8)+d.m*Math.pow(d.com-d.L/2,2)*0.3;d.S=S;return S;}
function mwPt(o,x,y){const ca=Math.cos(o.ang),sa=Math.sin(o.ang),d=MWDEF[o.id],dx=x-d.com;return{x:o.cx+dx*ca-y*sa,y:o.cy+dx*sa+y*ca};}
function mwVel(o,p){return{x:o.vx-o.om*(p.y-o.cy),y:o.vy+o.om*(p.x-o.cx)};}
function meleeStep(dt){if(!MW.length)return;const N=6,h=dt/N;
  if(MWH&&pointerW&&view==='side'){MWH.px=MWH.tx;MWH.py=MWH.ty;MWH.tx=pointerW.x;MWH.ty=pointerW.y;}
  for(const o of MW){const d=MWDEF[o.id];mwSamples(d);
    if(o.stuck){mwStuckStep(o,d,dt);continue;}
    // where every sample was at the start of the frame (for blade sweeps)
    const S=d.S,prev=S.map(s=>mwPt(o,s.x,s.y));
    for(let k=1;k<=N;k++){if(o.stuck)break;
      if(MWH&&MWH.o===o&&view==='side'){
        // the hand drives the grip toward the finger, but an arm can only push so hard: ≈ 350 N at the hand, moving its own
        // ≈ 2 kg plus the weapon. A 150 g knife can reach 160 m/s², a 1.6 kg axe ≈ 97 m/s², so heavy weapons lag and carry
        // their momentum through the swing. Top hand speed ≈ 45 m/s (a full-effort swing).
        const gx=lerp(MWH.px,MWH.tx,k/N),gy=lerp(MWH.py,MWH.ty,k/N);const g0=mwPt(o,d.xg,0);
        let dvx=(gx-g0.x)/0.045-MWH.gvx,dvy=(gy-g0.y)/0.045-MWH.gvy;const dl=Math.hypot(dvx,dvy),amax=35000/(2+d.m)*h;if(dl>amax){dvx*=amax/dl;dvy*=amax/dl;}
        let gvx=MWH.gvx+dvx,gvy=MWH.gvy+dvy;const vl=Math.hypot(gvx,gvy);if(vl>4500){gvx*=4500/vl;gvy*=4500/vl;}
        const mx=gvx*h,my=gvy*h,gax=dvx/h,gay=dvy/h;MWH.gvx=gvx;MWH.gvy=gvy;
        // pendulum about the moving grip: I·α = r × m(g − a_grip)
        const dc=d.com-d.xg,ca=Math.cos(o.ang),sa=Math.sin(o.ang),rx=dc*ca,ry=dc*sa,fx=-gax,fy=G-gay,Ig=d.Ic+d.m*dc*dc;
        const al=d.m*(rx*fy-ry*fx)/Ig-3*o.om;o.om=clamp(o.om+al*h,-70,70);o.ang+=o.om*h;
        const gx1=g0.x+mx,gy1=g0.y+my,c2=Math.cos(o.ang),s2=Math.sin(o.ang);o.cx=gx1+dc*c2;o.cy=gy1+dc*s2;o.vx=gvx-o.om*dc*s2;o.vy=gvy+o.om*dc*c2;
        // a held weapon is solid against the floor and walls: it stops there (and rings if it hit hard) instead of passing through
        let fp=0,wp=0;for(const sm of S){const p=mwPt(o,sm.x,sm.y);fp=Math.max(fp,p.y+sm.r);if(p.x-sm.r<-ROOM)wp=Math.max(wp,-ROOM-(p.x-sm.r));if(p.x+sm.r>ROOM)wp=Math.min(wp,ROOM-(p.x+sm.r));}
        if(fp>0){o.cy-=fp;if(MWH.gvy>250)emitSound('tink',Math.min(0.6,MWH.gvy/2500));if(MWH.gvy>0){MWH.gvy*=-0.15;MWH.gvx*=0.6;}o.om*=0.5;}
        if(wp){o.cx+=wp;if(Math.sign(MWH.gvx)===-Math.sign(wp))MWH.gvx*=-0.15;}}
      else if(!o.rest){o.vy+=G*h;o.vx*=1-0.05*h;o.cx+=o.vx*h;o.cy+=o.vy*h;o.om*=1-0.4*h;o.ang+=o.om*h;
        // floor and walls: impulse at the contact point, with friction
        for(const s of S){const p=mwPt(o,s.x,s.y);let nx=0,ny=0,pen=0;if(p.y+s.r>0){ny=-1;pen=p.y+s.r;}else if(p.x-s.r<-ROOM){nx=1;pen=-ROOM-(p.x-s.r);}else if(p.x+s.r>ROOM){nx=-1;pen=p.x+s.r-ROOM;}else continue;
          const v=mwVel(o,p),vn=v.x*nx+v.y*ny;o.cx+=nx*pen;o.cy+=ny*pen;if(vn>=0)continue;const rx=p.x-o.cx,ry=p.y-o.cy,rn=rx*ny-ry*nx,j=-(1+(vn<-200?0.25:0))*vn/(1/d.m+rn*rn/d.Ic);
          o.vx+=nx*j/d.m;o.vy+=ny*j/d.m;o.om+=rn*j/d.Ic;const tx=-ny,ty=nx,vt=v.x*tx+v.y*ty,rt=rx*ty-ry*tx,jt=clamp(-vt/(1/d.m+rt*rt/d.Ic),-0.5*j,0.5*j);o.vx+=tx*jt/d.m;o.vy+=ty*jt/d.m;o.om+=rt*jt/d.Ic;
          if(vn<-250)emitSound('tink',Math.min(0.6,-vn/2000));}
        if(Math.hypot(o.vx,o.vy)<6&&Math.abs(o.om)<0.4&&o.cy>-8){o.rest=true;o.vx=o.vy=o.om=0;}}
      else continue;
      mwBody(o,d,h);
    }
    // blades slice along the path their edge travelled this frame
    const now=S.map(s=>mwPt(o,s.x,s.y));let best=null;
    for(let i=0;i<S.length;i++){if(S[i].t!=='edge')continue;const a=prev[i],b=now[i],L=Math.hypot(b.x-a.x,b.y-a.y),sp=L/dt;const thr=d.kind==='saber'?0:d.kind==='knife'?90:160;if(sp<thr||L<0.6)continue;if(!best||sp>best.sp)best={a,b,sp,i};}
    if(best){const ins=segs.some(g=>!g.gone&&(insideSeg(g,best.a.x,best.a.y)||insideSeg(g,best.b.x,best.b.y)));if(ins){
      // one stroke per edge region so a long blade cuts along its length
      const e0=S.findIndex(s=>s.t==='edge'),e1=S.length-1-[...S].reverse().findIndex(s=>s.t==='edge');
      for(const i of (d.L>50?[Math.round(e0*0.4+e1*0.6),e1]:[Math.round((e0+e1)/2)])){const a=prev[i],b=now[i];if(Math.hypot(b.x-a.x,b.y-a.y)<0.6)continue;bladeStroke(a.x,a.y,b.x,b.y,d.kind,d.kind==='saber'?Math.max(best.sp,900):best.sp);}
      if(d.kind==='axe'&&best.sp>300){const g=segs.find(g=>!g.gone&&insideSeg(g,best.b.x,best.b.y));if(g&&T-(o.cd.get(g)||-9)>0.3){o.cd.set(g,T);const L=toLocal(g,best.b.x,best.b.y),E=0.5*(d.m*0.75+(MWH&&MWH.o===o?0.8:0))*Math.pow(best.sp/100,2);blunt2(g,L.s,L.w,E*0.6,'Axe',{focus:2,chop:1});}}
      if(d.kind!=='saber'){o.om*=0.8;if(!MWH||MWH.o!==o){o.vx*=0.85;o.vy*=0.85;}}}}
    if(d.kind==='saber'&&MWH&&MWH.o===o){const tp=mwPt(o,d.L,0);SABT.push({x:tp.x,y:tp.y,t:performance.now()});if(SABT.length>40)SABT.shift();if(Math.abs(o.om)>4&&T-(SABT.snd||0)>0.28){emitSound('saber');SABT.snd=T;}}
  }
  if(MW.length>8)MW.splice(0,MW.length-8);
}
// contact with his body: response + damage by the part that hit
function mwBody(o,d,h){const held=MWH&&MWH.o===o;
  for(const g of segs){if(g.gone)continue;const A=P[g.a],B=P[g.b];const mx=(A.x+B.x)/2,my=(A.y+B.y)/2;if(Math.hypot(mx-o.cx,my-o.cy)>d.L+g.len/2+10)continue;
    let hit=null;const cuts=[];
    for(const s of d.S){if(s.t==='edge'&&d.kind==='saber')continue;const p=mwPt(o,s.x,s.y),r=dps(p.x,p.y,A.x,A.y,B.x,B.y),RR=rad(g,r.t)+s.r;if(r.d>=RR||r.d<1e-4)continue;
      const nx=(p.x-r.qx)/r.d,ny=(p.y-r.qy)/r.d,v=mwVel(o,p),hp=hPrev||1/360,svx=lerp((A.x-A.px)/hp,(B.x-B.px)/hp,r.t),svy=lerp((A.y-A.py)/hp,(B.y-B.py)/hp,r.t),rvx=v.x-svx,rvy=v.y-svy,vn=-(rvx*nx+rvy*ny);
      // the edge: moving edge-first fast enough it cuts (and the tissue drags on it); slower, flat or spine-first it is a solid bar
      if(s.t==='edge'){const ex=-Math.sin(o.ang),ey=Math.cos(o.ang),ve=rvx*ex+rvy*ey;if(ve>(MCUTV[d.kind]||90)){cuts.push({s,p,r,ve,ex,ey,pen:RR-r.d});continue;}}
      if(!hit||vn>hit.vn)hit={s,p,r,nx,ny,vn,rvx,rvy,pen:RR-r.d};}
    if(cuts.length&&!o.stuck)mwCutDrag(o,d,g,cuts,held,h);
    if(!hit||o.stuck)continue;const {s,p,r,nx,ny,vn}=hit;
    // tip thrust: velocity along the blade pointing into him
    if(s.t==='tip'){const ux=Math.cos(o.ang),uy=Math.sin(o.ang),ax=hit.rvx*ux+hit.rvy*uy;if(ax>220&&T-(o.cd.get('tip'+g.idx)||-9)>0.5){o.cd.set('tip'+g.idx,T);const L=toLocal(g,p.x,p.y),rep=[];if(stabAt(g,clamp(L.s,0,g.len),L.w,rnd(-0.6,0.6),rep)){emitSound('slice');emitLog(MWDEF[o.id].n+' · stabbed the '+g.label.toLowerCase()+(rep.length?': '+[...new Set(rep)].join(', '):''),'bad');}if(!held){o.vx*=0.2;o.vy*=0.2;o.om*=0.2;}}continue;}
    // solid contact: push the weapon back out of him so it never sinks through (a held one also loses its speed into him)
    if(hit.pen>0.05){o.cx+=nx*hit.pen*0.9;o.cy+=ny*hit.pen*0.9;if(held){const vi=-(MWH.gvx*nx+MWH.gvy*ny);if(vi>0){MWH.gvx+=nx*vi*0.9;MWH.gvy+=ny*vi*0.9;}}}
    if(vn<=0)continue;
    // momentum exchange: a held weapon brings the arm's mass with it
    const meff=d.m*0.75+(held?0.8:0),E=0.5*meff*Math.pow(vn/100,2),dp=meff*vn/100*1.2;
    impulse(g,r.t,-nx,-ny,Math.min(dp,40));
    if(held)o.om*=-0.25;else{const rx=p.x-o.cx,ry=p.y-o.cy,rn=rx*ny-ry*nx,j=1.25*vn/(1/d.m+rn*rn/d.Ic);o.vx+=nx*j/d.m;o.vy+=ny*j/d.m;o.om+=rn*j/d.Ic;o.cx+=nx*hit.pen*0.8;o.cy+=ny*hit.pen*0.8;}
    if(vn<120||T-(o.cd.get(g)||-9)<0.22)continue;o.cd.set(g,T);
    const L=toLocal(g,clamp(p.x-nx*s.r,-1e9,1e9),p.y-ny*s.r),tang=Math.min(1,Math.hypot(hit.rvx+nx*vn,hit.rvy+ny*vn)/Math.max(1,vn+Math.hypot(hit.rvx+nx*vn,hit.rvy+ny*vn)));
    const ax=dirLocal(g,Math.cos(o.ang),Math.sin(o.ang)),sl=dirLocal(g,hit.rvx,hit.rvy);
    emitSound('thud',Math.min(1,E/250));FX.push({k:'ring',x:p.x,y:p.y,t:0,life:0.25});
    if(s.t==='claw'){blunt2(g,clamp(L.s,0,g.len),L.w,E,d.n,{focus:3,punct:1,tang,slide:sl});continue;}
    blunt2(g,clamp(L.s,0,g.len),L.w,s.t==='edge'?E*0.6:E,d.n,{pat:s.t==='face'?'ring':s.t==='rod'?'tram':null,focus:s.t==='face'?2.2:s.t==='handle'?1.2:s.t==='edge'?1.4:1,tang,ax,slide:sl,rough:d.rough||0,rodR:d.rodR||1.4,z:null});
  }
}
// edge speed (cm/s) below which a blade stops cutting and just presses: a sharp knife slices at a slow draw, a heavy wedge needs a chop
const MCUTV={knife:45,machete:80,axe:140};
// tissue resistance on an edge cutting through him. Cutting force per cm of engaged edge: skin/muscle ≈ 8 N/cm for a thin
// blade (slicing), ≈ 25 N/cm for an axe's thick wedge; bone ≈ 15× more. Force × time comes off the blade's speed and pushes him.
function mwCutDrag(o,d,g,cuts,held,h){
  const wedge=d.kind==='axe'?25:d.kind==='machete'?12:8;let F=0,bone=false,pen=0,ve=0,best=cuts[0];
  for(const c of cuts){const L=toLocal(g,c.p.x,c.p.y);const onBone=g.bones.some(bo=>bo.shape==='line'?polyNear(bo.pts,{s:L.s,w:L.w},bo.width/2+0.3):bo.shape==='ell'?Math.hypot((L.w-bo.w)/bo.rw,(L.s-bo.s)/bo.rs)<1:bo.shape==='ribs'&&(q=>q<1.05&&q>0.72)(Math.hypot((L.w-bo.w)/bo.rw,(L.s-bo.s)/bo.rs)));
    bone=bone||onBone;F+=2*wedge*(onBone?15:1);pen=Math.max(pen,c.pen);if(c.ve>ve){ve=c.ve;best=c;}}
  const meff=held?d.m*0.75+0.8:d.m,J=F*h;                     // N·s
  const dv=Math.min(ve*0.9,J*100/meff);                       // cm/s taken off the edge speed
  if(held){const lev=Math.max(4,Math.abs(best.s.x-d.xg));o.om-=Math.sign(o.om||1)*Math.min(Math.abs(o.om),dv/lev);}
  else{o.vx-=best.ex*dv;o.vy-=best.ey*dv;o.om*=0.9;}
  impulse(g,best.r.t,best.ex,best.ey,Math.min(J,12));
  // a chop that buries the wedge lodges it: the axe always, a machete when it bites into bone
  if((d.kind==='axe'||(d.kind==='machete'&&bone&&Math.random()<0.35))&&ve>260&&g.connected&&!g.gone&&!(o.cd.get('stuckT')>T-0.6)){
    const KE=0.5*meff*Math.pow(ve/100,2),depth=Math.min(d.kind==='axe'?6.5:3.5,1.5+KE/(bone?60:35));
    const dz=Math.max(0,depth-pen);o.cx+=best.ex*dz;o.cy+=best.ey*dz;mwStick(o,d,g,best.p,depth,bone,KE);}
}
function segAngW(g){const A=P[g.a],B=P[g.b];return Math.atan2(B.y-A.y,B.x-A.x);}
function mwStick(o,d,g,p,depth,bone,KE){const L=toLocal(g,o.cx,o.cy),C=toLocal(g,p.x,p.y);
  o.stuck={g,s:L.s,w:L.w,da:o.ang-segAngW(g),cs:C.s,cw:C.w,depth,hold:150+40*depth+(bone?200:0),wd:null,t:T};o.vx=o.vy=o.om=0;o.rest=false;if(MWH&&MWH.o===o)MWH.anchor=null;
  emitSound('thud',1);emitLog(d.n+' lodged '+depth.toFixed(1)+' cm deep in the '+g.label.toLowerCase()+(bone?' (bitten into bone)':'')+' · grab the handle and pull hard to free it','bad');}
// a lodged weapon rides on the segment; held, pulling the handle drags him until the pull beats the grip of the wound
function mwStuckStep(o,d,dt){const st=o.stuck,g=st.g;
  if(!g||g.gone||!segs.includes(g)){o.stuck=null;o.rest=false;return;}
  if(!st.wd){let bd=6;for(const w of g.wounds)if(w.type==='cut'||w.type==='stump'){const c=woundCenter(w),dd=Math.hypot(c.s-st.cs,c.w-st.cw);if(dd<bd){bd=dd;st.wd=w;}}if(st.wd)st.wd.plug=true;}
  const p=toWorld(g,st.s,st.w);o.cx=p.x;o.cy=p.y;o.ang=segAngW(g)+st.da;o.vx=o.vy=o.om=0;
  if(MWH&&MWH.o===o&&pointerW&&view==='side'){
    // the swing's follow-through is stopped by the lodged blade: the pull is measured from where the hand is once it has stopped (≈0.25 s)
    if(T-st.t<0.25||!MWH.anchor){if(T-st.t>=0.25||!MWH.anchor)MWH.anchor={x:pointerW.x,y:pointerW.y};return;}
    const px=pointerW.x-MWH.anchor.x,py=pointerW.y-MWH.anchor.y,pl=Math.hypot(px,py);if(pl<3)return;
    // the arm pulls like a stiff spring: ≈ 40 N per cm of hand travel, up to ≈ 700 N (a hard two-handed yank)
    const F=Math.min(700,(pl-3)*40),ux=px/pl,uy=py/pl;impulse(g,clamp(st.cs/g.len,0,1),ux,uy,F*dt*0.6);
    if(F>st.hold){o.stuck=null;o.cd.set('stuckT',T);if(st.wd&&g.wounds.includes(st.wd)){st.wd.plug=false;st.wd.bleed*=1.35;}hurt(g,st.cs,st.cw,8+st.depth*2);
      o.vx=ux*300;o.vy=uy*300;MWH.anchor=null;MWH.tx=MWH.px=mwPt(o,d.xg,0).x;MWH.ty=MWH.py=mwPt(o,d.xg,0).y;MWH.gvx=MWH.gvy=0;
      emitSound('slice');emitLog(d.n+' wrenched out of the '+g.label.toLowerCase()+' · the wound opens up','bad');}}
}
/* ---------- hand-held knife ---------- */
let KNIVES=[],HK=null;
const KBL=15,KHL=10,KGRIP=KBL+KHL*0.55;
function knifeLog(I){if(I.logged)return;I.logged=true;emitLog('Stab · '+I.seg.label.toLowerCase()+(I.rep&&I.rep.length?': '+[...new Set(I.rep)].join(', '):''),'bad');}
function unplugKnife(K,quiet){const i=KNIVES.indexOf(K);if(i>=0)KNIVES.splice(i,1);K.wd.plug=false;for(const v of K.vs)v.plug=Math.max(0,(v.plug||1)-1)||0;if(!quiet){K.wd.bleed+=0.4;hurt(K.seg,K.s,K.w,10);}}
function knifeEnterInside(seg,x,y){
  const L=toLocal(seg,x,y);const sg=Math.sign(L.w)||1;const rr=radS(seg,L.s)||seg.ra;
  const E=toWorld(seg,L.s,sg*rr*0.98);const d=dirWorld(seg,-sg,0);knifeEnter(seg,E.x,E.y,d.x,d.y);
}
function knifeEnter(seg,x,y,dx,dy){
  const k=HK;const L=toLocal(seg,x,y);const dl=dirLocal(seg,dx,dy);const dn=Math.hypot(dl.w,dl.s)||1;dl.w/=dn;dl.s/=dn;
  const bb=anyWear()&&bladeBlock(seg,L.s,L.w,'knife',true);
  if(bb){k.blocked=seg;(seg.amarks||(seg.amarks=[])).push({s:L.s,w:L.w,z:0.8,it:bb,cut:true});FX.push({k:'spark',x,y,t:0,life:0.15});emitSound('thud',0.5);emitLog('Stab · stopped by '+WEARDEF[bb].name.toLowerCase(),'info');return;}
  const z=rnd(-0.85,0.85);
  const wd=addWound(seg,{type:'hole',slit:true,s:L.s,w:L.w,r:1.1,bleed:0.6,dw:-dl.w,ds:-dl.s,z});
  k.ang=Math.atan2(dy,dx);
  k.ins={seg,s:L.s,w:L.w,dw:dl.w,ds:dl.s,depth:0,max:KBL,z,wd,vs:[],hit:new Set(),rep:[]};
  hurt(seg,L.s,L.w,16);emitSound('slice');
  for(let i=0;i<5&&BLOOD.length<GQ().b;i++){const a=Math.atan2(-dy,-dx)+rnd(-0.7,0.7),sp=rnd(40,140);BLOOD.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:rnd(0.2,0.4),life:3});}
}
function knifeStep(h){
  const k=HK;if(!k||k.front||view!=='side')return;
  if(!k.ins){
    const ta=aimAtBody(k.x,k.y);k.ang=angLerp(k.ang,ta,Math.min(1,h*10));
    const nx=k.x+Math.cos(k.ang)*KGRIP,ny=k.y+Math.sin(k.ang)*KGRIP;
    const ox=k.tx,oy=k.ty,dx=nx-ox,dy=ny-oy,L=Math.hypot(dx,dy);
    k.tx=nx;k.ty=ny;
    if(L>0.01){const n=Math.max(1,Math.ceil(L/0.4));let found=null;
      for(let i=1;i<=n;i++){const x=ox+dx*i/n,y=oy+dy*i/n;const sg=topSegAt(x,y);if(sg){found=[sg,x,y];break;}}
      if(found){if(found[0]!==k.blocked){const ux=Math.cos(k.ang),uy=Math.sin(k.ang);knifeEnter(found[0],found[1],found[2],ux,uy);}}
      else k.blocked=null;}
    else if(!topSegAt(k.tx,k.ty))k.blocked=null;
    return;
  }
  const I=k.ins,seg=I.seg;
  const E=toWorld(seg,I.s,I.w),u0=dirWorld(seg,I.dw,I.ds),un=Math.hypot(u0.x,u0.y)||1,ux=u0.x/un,uy=u0.y/un;
  k.ang=Math.atan2(uy,ux);
  const tx=k.x+ux*KGRIP-E.x,ty=k.y+uy*KGRIP-E.y;const along=tx*ux+ty*uy,perp=-tx*uy+ty*ux;
  if(along<0.3||Math.abs(perp)>14){knifeLog(I);emitLog('Knife pulled out · '+seg.label.toLowerCase(),'info');k.ins=null;k.blocked=seg;k.tx=k.x+ux*KGRIP;k.ty=k.y+uy*KGRIP;return;}
  let d=Math.min(along,I.max);
  if(d>I.depth+0.05){
    for(let t=I.depth+0.4;t<=d+0.01;t+=0.4){
      const tip={s:I.s+I.ds*t,w:I.w+I.dw*t},a={s:I.s,w:I.w};let stop=false;
      for(const bo of seg.bones){if(I.hit.has(bo))continue;if(!zIn(I.z,bo))continue;
        if(bo.shape==='ribs'){if(Math.random()<0.012){I.hit.add(bo);seg.ribsBroken++;I.rep.push('rib nicked');}continue;}
        if(boneCross(bo,a,tip,0.1)){I.hit.add(bo);hitBone(bo,rnd(6,14),I.rep,boneHitAt(bo,a,tip,I.z));I.rep.push('blade struck the '+bo.name.toLowerCase());stop=true;break;}}
      if(stop){I.max=Math.max(0.5,t-0.4);d=I.max;emitSound('thud',0.3);break;}
      for(const o of seg.organs){if(I.hit.has(o)||!zIn(I.z,o))continue;if(Math.hypot((tip.w-o.w)/o.rw,(tip.s-o.s)/o.rs)<1){I.hit.add(o);dmgOrgan(o,rnd(30,55)*o.vuln,I.rep,'stabbed');orgMark(o,'stab',tip.w,tip.s,null,null,I.z);}}
      for(const v of seg.vessels){if(I.hit.has(v)||!zIn(I.z,v)||v.stump)continue;if(polyNear(v.pts,tip,v.width/2+0.6)){I.hit.add(v);I.vs.push(v);cutVessel(v,0.7,{s:I.s,w:I.w,dw:-I.dw,ds:-I.ds},I.rep);}}
    }
    if(d>I.depth)hurt(seg,I.s,I.w,(d-I.depth)*1.3);
  }
  I.depth=Math.max(0.3,d);
  // pushing past the hilt or sideways moves the body
  const A=P[seg.a],B=P[seg.b],t=clamp(I.s/seg.len,0,1),wa=(1-t)*(1-t)*A.im+t*t*B.im,ka=A.im*(1-t)/wa,kb=B.im*t/wa;
  let fx=0,fy=0;const over=along-I.max;if(over>0.3){const m=Math.min(over*0.03,0.12);fx+=ux*m;fy+=uy*m;}
  if(Math.abs(perp)>2){const m=clamp((perp-Math.sign(perp)*2)*0.012,-0.06,0.06);fx+=-uy*m;fy+=ux*m;}
  if(fx||fy){A.x+=fx*ka;A.y+=fy*ka;B.x+=fx*kb;B.y+=fy*kb;A.px=lerp(A.px,A.x,0.05);A.py=lerp(A.py,A.y,0.05);B.px=lerp(B.px,B.x,0.05);B.py=lerp(B.py,B.y,0.05);V.grabT=T;}
}
function knifeFrontXY(K){
  if(K.fv){if(K.fv!==view)return null;return{x:K.fx,y:K.fy};}
  if(view==='back'?K.w>0:K.w<0)return null;
  return frontPos(K.seg,K.s,clamp(K.z,-1,1));
}
function frontStab(fx,fy){
  const hit=frontHit(fx,fy);if(!hit)return false;const rep=[];const {s,r}=frontLocal(hit);
  if(!stabAt(hit.seg,s,r*0.6*(view==='back'?-1:1),hit.zx,rep)){const m=hit.seg.amarks[hit.seg.amarks.length-1];m.fx=fx;m.fy=fy;m.v=view;emitLog('Stab · '+rep.join(', '),'info');emitSound('thud',0.4);return true;}
  const wd=hit.seg.wounds[hit.seg.wounds.length-1];if(view==='back'){wd.bx1=fx;wd.by1=fy;}else{wd.ff=true;
  FW.push({seg:hit.seg,x:fx,y:fy,r:0.9,type:'hole',band:false,ref:wd,age:0,blood:0});}
  emitLog('Stab · '+hit.seg.label.toLowerCase()+(rep.length?': '+[...new Set(rep)].join(', '):''),'bad');emitSound('slice');return true;
}
function saberFront(x0,y0,x1,y1,speed){
  const before=new Map();for(const g of segs)before.set(g,g.wounds.length);const vb=new Map();for(const v of VESSELS)vb.set(v,v.cut);
  frontSlash(x0,y0,x1,y1,'machete',Math.max(speed,900));
  for(const g of segs){const n0=before.get(g);if(n0==null)continue;for(let i=0;i<g.wounds.length;i++){const w=g.wounds[i];if(i>=n0||w.bLive){if(w.type==='cut'){w.laser=true;w.bleed=Math.min(w.bleed,0.05*(w.len||1));}}}}
  for(const v of VESSELS)if(v.cut>(vb.get(v)||0)&&!v.lig&&v.width<1.6&&Math.random()<0.85)v.lig=true;
}
// a cut only grows forward: if the blade turns back (or swerves past ≈35°) the old cut is finished and a new one starts,
// so going back over the same spot never shrinks or closes an existing wound
function sameWay(ax,ay,bx,by){const la=Math.hypot(ax,ay),lb=Math.hypot(bx,by);if(la<1.2||lb<1e-6)return true;return (ax*bx+ay*by)/(la*lb)>0.82;}
function frontSlash(x0,y0,x1,y1,kind,speed){
  const L=Math.hypot(x1-x0,y1-y0);if(L<0.6)return;const n=Math.ceil(L/1.2);const rep=[];const mach=kind==='machete';let any=false;if(!frontSlash.on){for(const g of segs)for(const q of g.wounds)q.bLive=false;}frontSlash.on=true;clearTimeout(frontSlash.tm);frontSlash.tm=setTimeout(()=>{frontSlash.on=false;},250);
  let prev=null;
  for(let i=0;i<=n;i++){
    const x=lerp(x0,x1,i/n),y=lerp(y0,y1,i/n);const hit=frontHit(x,y);
    if(!hit){prev=null;continue;}
    any=true;const z=hit.zx;const seg=hit.seg;
    {const bb=anyWear()&&bladeBlock(seg,hit.s,radS(seg,hit.s)*(view==='back'?-0.85:0.85),kind,false);if(bb){if(!rep.includes('blade turned by '+WEARDEF[bb].name.toLowerCase()))rep.push('blade turned by '+WEARDEF[bb].name.toLowerCase());if(Math.random()<0.3){(seg.amarks||(seg.amarks=[])).push({s:hit.s,w:0,z,it:bb,cut:true,fx:x,fy:y,v:view});if(seg.amarks.length>30)seg.amarks.shift();}prev=null;continue;}}
    if(prev&&prev.seg===seg&&view==='back'){let lw=seg.wounds.find(q=>q.bLive);const rr=-radS(seg,hit.s)*0.85;if(lw&&!sameWay(lw.bx2-lw.bx1,lw.by2-lw.by1,x-lw.bx2,y-lw.by2))lw.bLive=false;
      if(lw&&lw.bLive){lw.bx2=x;lw.by2=y;lw.len+=0.6;lw.bleed+=mach?0.08:0.04;}else{for(const g of segs)for(const q of g.wounds)q.bLive=false;addWound(seg,{type:'cut',s:hit.s-0.5,w:rr,s2:hit.s+0.5,w2:rr,r:mach?0.6:0.35,len:1,bleed:mach?0.3:0.15,dw:-1,ds:0,z:hit.zx,bx1:prev.x,by1:prev.y,bx2:x,by2:y,bLive:true});}}
    else if(prev&&prev.seg===seg){const last=FW[FW.length-1];if(last&&last.type==='cut'&&last.seg===seg&&last.live&&!sameWay(last.x2-last.x,last.y2-last.y,x-last.x2,y-last.y2)){last.live=false;prev={x:last.x2,y:last.y2,seg};}
      if(last&&last.type==='cut'&&last.seg===seg&&last.live){last.x2=x;last.y2=y;if(last.ref){last.ref.len+=0.6;last.ref.bleed+=mach?0.08:0.04;}}else{for(const f of FW)f.live=false;const rr=radS(seg,hit.s)*0.85;const ref=addWound(seg,{type:'cut',s:hit.s-0.5,w:rr,s2:hit.s+0.5,w2:rr,r:mach?0.6:0.35,len:1,bleed:mach?0.3:0.15,live:false,dw:1,ds:0,ff:true});FW.push({seg,x:prev.x,y:prev.y,x2:x,y2:y,r:mach?0.6:0.35,type:'cut',band:false,ref,live:true,age:0,blood:0});}}
    for(const v of seg.vessels){if(v.deep&&!(mach&&speed>250))continue;if(!zIn(z,v)||v.cut>=1)continue;const [a,b]=vesselSpan(v);if(hit.s>=a-1&&hit.s<=b+1&&Math.random()<(mach?0.35:0.22))cutVessel(v,mach?0.6:0.4,{s:hit.s,w:radS(seg,hit.s)*0.9,dw:1,ds:0},rep);}
    for(const o of seg.organs){if((o.shallow||(mach&&speed>250))&&zIn(z,o)&&Math.abs(hit.s-o.s)<o.rs)dmgOrgan(o,mach?8:5,rep,'cut');}
    hurt(seg,hit.s,radS(seg,hit.s)*0.9,mach?2:1.2);
    prev={x,y,seg};
  }
  if(any){if(T-(bladeStroke.t||0)>0.12){emitSound('slice');bladeStroke.t=T;}if(rep.length)emitLog((mach?'Machete':'Knife')+' · '+[...new Set(rep)].join(', '),'bad');}
}
const SABT=[];
const SABC={blue:'80,170,255',red:'255,50,50',green:'90,255,110',purple:'200,90,255'};
