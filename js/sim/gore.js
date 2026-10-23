/* TRAUMA_LAB_MAIN */
/* ===== sim/gore.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
function bleedFX(dt){
  flameStep(dt);
  streamStep(dt);
  bleedBody(dt);
  bleedWorld(dt);
}
// the loaded body's wounds: what runs down the skin, what pools in each wound, the jets from cut vessels
function bleedBody(dt){
  for(const sg of segs)if(sg.tq!=null&&sg.tqV)for(const v of sg.tqV)v.clamp=true;
  for(const s of segs){
    const fade=s.connected?1:Math.exp(-s.detT/7);if(fade<0.03)continue;
    const perf=s.connected?(V.dead?0.12:0.35+0.65*V.co):1;
    for(const w of s.wounds){
      const vr=s.vessels.reduce((a,v)=>a+(v.at&&v.cut>0&&!v.clamp&&!v.lig&&!v.plug&&Math.hypot(v.at.s-woundCenter(w).s,v.at.w-woundCenter(w).w)<4?(s.connected?v.now:v.rate*v.cut*0.5)*v.ext:0),0);
      if(w.type==='hole'||w.type==='cut'||w.type==='stump')updateStreaks(s,w,(w.bleed+vr*0.4)*perf*fade*(w.band||w.pack?0:1)*(w.plug?0.35:1)*(1-(w.sut||0)),dt);
      if(!w.bleed||w.band||w.pack||w.sut>=1)continue;const rate=w.bleed*perf*fade*(1-(w.sut||0));
      w.blood=Math.min(w.type==='stump'?3:9,w.blood+rate*dt*0.9);
    }
    for(const v of s.vessels){
      if(v.cut<=0||!v.at||v.clamp||v.lig||v.ext<=0||v.plug||(s.connected&&(vCovered(v)||!vOpen(v))))continue;
      const r=(s.connected?v.now:v.rate*v.cut*0.6)*v.ext*fade;
      if(v.type==='a'?r>0.25:r>1.6){const jh=s.connected?vJetHole(v):null;if(s.connected&&!jh)continue;streamEmit(s,v,r,dt,s.connected,jh);}
    }
  }
  for(const w of FW){if(!w.band&&w.seg.connected&&!(w.ref&&(w.ref.sut>=1||w.ref.pack)))w.blood=Math.min(9,w.blood+dt*0.6*(w.ref?w.ref.bleed:0.3)*(0.35+0.65*V.co));}
}
// drops in the air (shared by everyone): they land in pools, on the walls, or on the subject's skin
function bleedWorld(dt){
  {const boxes=[];if(OPT.spatter&&BLOOD.length)for(const g of segs){if(!g.connected&&g.detT>30||g.gone)continue;const A=P[g.a],B=P[g.b],r=Math.max(g.ra,g.rb);boxes.push({g,x0:Math.min(A.x,B.x)-r,x1:Math.max(A.x,B.x)+r,y0:Math.min(A.y,B.y)-r,y1:Math.max(A.y,B.y)+r});}
  let j=0;for(const b of BLOOD){b.vy+=G*dt;b.vx*=1-0.6*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;b.a=(b.a||0)+dt;
    if(b.y>=-0.2){addPool(b.x,b.r);if(Math.random()<0.55)addDecal(b.x,b.r*rnd(1.1,2.4)*(1+Math.abs(b.vx)/500),b.vx);continue;}
    if(b.x<-ROOM||b.x>ROOM){if(WALLST.length<400&&Math.random()<0.35)WALLST.push({x:clamp(b.x,-ROOM,ROOM),y:b.y,r:b.r*rnd(0.8,1.6),c:'rgba(94,10,16,.8)'});continue;}
    if(b.life<=0)continue;
    if(boxes.length&&b.a>0.08&&spatHit(b,boxes))continue;
    BLOOD[j++]=b;}
  BLOOD.length=j;}
}
function streamEmit(seg,v,r,dt,live,jh){
  const key=BID+'_'+v.id+'_'+seg.idx;const st=STREAMS[key]||(STREAMS[key]={pts:[],acc:0});
  st.alive=T;st.w=clamp(0.16+Math.sqrt(r)*0.15,0.16,0.9);
  const jc=jh&&jh.type!=='stump'?woundCenter(jh):null,js=jc?jc.s:v.at.s,jw=jc?jc.w:v.at.w;
  const p=toWorld(seg,js,jw);
  const c0=toWorld(seg,clamp(js,0,seg.len),0);let nx=p.x-c0.x,ny=p.y-c0.y;const nl=Math.hypot(nx,ny);
  const d=dirWorld(seg,v.at.dw||0,v.at.ds||0),dl=Math.hypot(d.x,d.y);
  if(nl>0.3){nx/=nl;ny/=nl;}else if(dl>0.1){nx=d.x/dl;ny=d.y/dl;}else{nx=0;ny=1;}
  if(dl>0.1){nx=nx*0.7+d.x/dl*0.3;ny=ny*0.7+d.y/dl*0.3;const l=Math.hypot(nx,ny)||1;nx/=l;ny/=l;}
  // Torricelli/Bernoulli: exit speed v = Cd·sqrt(2·P/ρ). P follows the pulse wave between diastolic and systolic pressure.
  // A narrow bullet track through muscle chokes the jet: blood then wells up and runs down the skin instead of spurting.
  const wide=jh&&(jh.type==='stump'||jh.type==='cut'||isBite(jh)||(jh.r||0)>=1.1);
  const shallow=!v.deep&&v.width>=0.7;
  let sp=0;
  if(v.type==='a'&&live&&!V.arrest&&!V.dead&&(wide||shallow)){
    const sys=V.sys||0,dia=V.dia||sys*0.62,Pm=dia+(sys-dia)*Math.exp(-(T-V.lastBeat)*6);
    const Cd=(wide?0.55:0.3)*Math.min(1,0.5+v.width*0.5);
    sp=Cd*Math.sqrt(2*Math.max(0,Pm)*133.3/1060)*100;}
  if(sp<120){ // no jet: blood wells out of the hole and drips
    st.acc+=dt*Math.min(6,r*0.35);if(st.acc>1){st.acc=0;if(BLOOD.length<GQ().b)BLOOD.push({x:p.x+nx*0.4,y:p.y+ny*0.4,vx:nx*rnd(5,15),vy:ny*rnd(5,15),r:rnd(0.25,0.45),life:3});}
    return;}
  const A=P[seg.a],B=P[seg.b],h=hPrev||1/360,t=clamp(v.at.s/seg.len,0,1);
  const bvx=lerp(A.x-A.px,B.x-B.px,t)/h,bvy=lerp(A.y-A.py,B.y-B.py,t)/h;
  st.acc+=dt;const iv=1/90;
  while(st.acc>=iv){st.acc-=iv;const tau=st.acc,vx=nx*sp+bvx*0.8+rnd(-0.8,0.8),vy=ny*sp+bvy*0.8+rnd(-0.8,0.8);st.pts.push({x:p.x+vx*tau,y:p.y+vy*tau+0.5*G*tau*tau,vx,vy:vy+G*tau,age:tau});}
  if(st.pts.length>280)st.pts.splice(0,st.pts.length-280);
}
function streamStep(dt){
  for(const k in STREAMS){const st=STREAMS[k];
    for(const q of st.pts){if(q.dead)continue;q.age+=dt;if(q.age>0.06&&!q.br){q.br=1;q.vx+=rnd(-12,12);q.vy+=rnd(-12,12);}q.vy+=G*dt;q.vx*=1-0.35*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;
      if(q.y>=-0.15){q.y=-0.1;q.dead=true;if(Math.random()<0.4)addPool(q.x,0.45+st.w*0.6);if(Math.random()<0.1)addDecal(q.x,st.w*rnd(1,2.6),q.vx);
        if(q.vy>250&&Math.random()<0.08&&BLOOD.length<GQ().b)BLOOD.push({x:q.x,y:-0.3,vx:rnd(-60,60),vy:-rnd(40,110),r:0.25,life:1});}
      else if(q.x<-ROOM||q.x>ROOM){q.dead=true;if(WALLST.length<400&&Math.random()<0.15)WALLST.push({x:clamp(q.x,-ROOM,ROOM),y:q.y,r:st.w*rnd(0.8,1.6),c:'rgba(94,10,16,.8)'});}
      else if(q.age>4)q.dead=true;}
    while(st.pts.length&&st.pts[0].dead)st.pts.shift();
    if(!st.pts.length&&T-st.alive>0.3)delete STREAMS[k];
  }
}
function addPool(x,r){if(OPT.gore===0)return;
  for(const p of POOLS){if(Math.abs(p.x-x)<p.w*0.7+1){p.w=Math.min(70,p.w+r*0.08*(12/(p.w+6)));p.x=lerp(p.x,x,0.02);p.a=Math.min(1,p.a+0.02);return;}}
  if(POOLS.length>140)POOLS.shift();POOLS.push({x,w:r*1.6,a:0.65});
}
function addDecal(x,w,vx){if(OPT.gore===0)return;DECALS.push({x,w,sk:clamp(vx/500,-0.7,0.7),a:rnd(0.55,0.95),c:Math.random()<0.5?'#5a0a0f':'#701016',dots:Math.random()<0.5?[rnd(-2,2)*w,rnd(0.2,0.5)*w]:null});if(DECALS.length>700)DECALS.shift();}
let MIST=[],STRANDS=[],TEAR=0;
// fine blood mist: back-spatter at entries, forward cone at exits, clouds in blasts
function mist(x,y,dx,dy,n,sp,spread,size){if(OPT.gore===0)return;n=gn(n);const a0=Math.atan2(dy,dx);for(let i=0;i<n&&MIST.length<GQ().m;i++){const a=a0+rnd(-spread,spread),v=sp*Math.pow(Math.random(),0.6);MIST.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,r:size*rnd(0.35,1),t:0,life:rnd(0.3,0.95)});}}
function mistStep(dt){let j=0;const d=Math.exp(-7*dt);for(const m of MIST){m.t+=dt;if(m.t>m.life)continue;if(m.ash){m.x+=m.vx*dt;m.y+=m.vy*dt;m.vy-=dt*4;MIST[j++]=m;continue;}m.vx*=d;m.vy=m.vy*d+G*0.1*dt;m.x+=m.vx*dt;m.y+=m.vy*dt;m.r+=dt*1.1;if(m.y>-0.2){m.y=-0.2;m.vy=0;}MIST[j++]=m;}MIST.length=j;}
// blood drops landing on the body leave spatter on the skin
function spatHit(b,boxes){for(const q of boxes){if(b.x<q.x0||b.x>q.x1||b.y<q.y0||b.y>q.y1)continue;const g=q.g,A=P[g.a],B=P[g.b];const r=dps(b.x,b.y,A.x,A.y,B.x,B.y);if(r.d>rad(g,r.t)-0.1)continue;
  const L=toLocal(g,b.x,b.y),sp=Math.hypot(b.vx,b.vy)||1,dl=dirLocal(g,b.vx/sp,b.vy/sp);(g.spat||(g.spat=[])).push({s:L.s,w:L.w,r:b.r*rnd(0.7,1.3),e:clamp(sp/420,0,1.6),ang:Math.atan2(dl.s,dl.w),t:T});if(g.spat.length>70)g.spat.shift();return true;}return false;}
function addStrands(seg,wd,n,len){
  if(!OPT.strands||!seg||OPT.gore<2)return;n=Math.max(1,gn(n));const stump=wd.type==='stump',rr=radS(seg,clamp(wd.s,0,seg.len))||seg.ra;
  for(let i=0;i<n;i++){const u=Math.random(),k=u<0.55?'muscle':u<0.7?'tendon':u<0.85?'skin':'vessel';
    const s0=stump?wd.s:wd.s+rnd(-0.5,0.5)*wd.r,w0=stump?rnd(-0.8,0.8)*rr:wd.w+rnd(-0.6,0.6)*wd.r;
    const p0=toWorld(seg,s0,w0),od=dirWorld(seg,wd.dw||0,wd.ds||0),ol=Math.hypot(od.x,od.y)||1,N=6,L=len*rnd(0.45,1.15)/N,nodes=[];
    for(let q=0;q<N;q++){const x=p0.x+od.x/ol*L*q,y=p0.y+od.y/ol*L*q+q*q*0.05;nodes.push({x,y,px:x,py:y});}
    STRANDS.push({seg,wd,s:s0,w:w0,k,nodes,L,wid:k==='muscle'?rnd(0.35,0.75):k==='skin'?rnd(0.5,0.9):k==='tendon'?0.22:0.3,ph:rnd(0,6)});}
  if(STRANDS.length>260)STRANDS.splice(0,STRANDS.length-260);
  seg.mtear=Math.min(1,(seg.mtear||0)+(stump?0:0.12*n));
  if((stump||wd.r>=1.8)&&(wd.flaps||0)<3){const k=stump?2+(Math.random()<0.5?1:0):wd.r>3?2:1;wd.flaps=(wd.flaps||0)+k;addFlaps(seg,wd,k);}
}
function strandStep(dt){let j=0;
  for(const st of STRANDS){const g=st.seg,wd=st.wd;if(g.idx==null||segs[g.idx]!==g||g.gone||!g.wounds.includes(wd)||wd.sut>=1||wd.graft||g.growF!=null||(!g.connected&&g.detT>40))continue;
    {const sc=clamp(st.s,0,g.len),rr=radS(g,sc)||g.ra;st.s=sc;if(Math.abs(st.w)>rr*0.97)st.w=Math.sign(st.w)*rr*0.97;}
    const n=st.nodes,r=toWorld(g,st.s,st.w),od=dirWorld(g,wd.dw||0,wd.ds||0),ol=Math.hypot(od.x,od.y)||1;n[0].x=r.x;n[0].y=r.y;
    for(let i=1;i<n.length;i++){const q=n[i];const vx=(q.x-q.px)*0.97,vy=(q.y-q.py)*0.97;q.px=q.x;q.py=q.y;q.x+=vx;q.y+=vy+G*dt*dt;if(q.y>-0.12)q.y=-0.12;}
    if(!flapStep(st,dt))continue;
    const stiff=st.k==='tendon'||st.k==='skin'?0.35:st.k==='flap'?0.05:st.k==='mflap'?0.035:0.18;n[1].x=lerp(n[1].x,r.x+od.x/ol*st.L,stiff);n[1].y=lerp(n[1].y,r.y+od.y/ol*st.L,stiff);
    for(let it=0;it<3;it++)for(let i=1;i<n.length;i++){const a=n[i-1],b=n[i],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1e-6,df=(d-st.L)/d;if(i===1){b.x-=dx*df;b.y-=dy*df;}else{a.x+=dx*df*0.5;a.y+=dy*df*0.5;b.x-=dx*df*0.5;b.y-=dy*df*0.5;}}
    if(st.k!=='tendon'&&!wd.band&&Math.random()<dt*0.7*GQ().k&&BLOOD.length<GQ().b){const t=n[n.length-1];BLOOD.push({x:t.x,y:t.y,vx:(t.x-t.px)*30,vy:12,r:rnd(0.15,0.3),life:2,a:0});}
    STRANDS[j++]=st;}
  STRANDS.length=j;}
function spawnGibs(x,y,dx,dy,n,kind,speed){
  if(OPT.gore<3)return;
  n=Math.max(kind==='bone'?1:0,Math.round(n*(0.45+0.55*GQ().k)));
  mist(x,y,dx,dy,n*3,speed*0.5,1.1,0.6);
  for(let i=0;i<n;i++){
    const a=Math.atan2(dy,dx)+rnd(-0.75,0.75),sp=speed*rnd(0.35,1.1);
    const u=Math.random(),type=kind==='bone'?'bone':u<0.36?'muscle':u<0.64?'flesh':u<0.8?'fat':'skin';
    const r=type==='bone'?rnd(0.5,1.3):type==='fat'?rnd(0.3,0.7):type==='skin'?rnd(0.6,1.4):rnd(0.6,1.7);
    const m=type==='bone'?5:type==='muscle'?8:7,pts=[];const el=type==='muscle'?rnd(1.8,2.8):type==='skin'?1.4:type==='bone'?1.7:1;
    for(let q=0;q<m;q++){const an=q/m*6.283;const rr=type==='bone'?r*(q%2?rnd(0.25,0.45):rnd(0.9,1.3)):type==='skin'?r*rnd(0.45,1.2):r*rnd(0.6,1.15);pts.push([Math.cos(an)*rr*el,Math.sin(an)*rr*(type==='muscle'?0.55:1)]);}
    GIBS.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-rnd(0,120),ang:rnd(0,6.28),av:rnd(-14,14),r,type,pts,el,rest:false,bl:type==='flesh'||type==='muscle'?rnd(0.6,2.2):0});
  }
  if(GIBS.length>GQ().g)GIBS.splice(0,GIBS.length-GQ().g);
}
// both eyeballs burst out of the sockets and drop, trailing the optic nerve for a moment
let FEYE=[];
function popEyes(){const h=SEG.head;if(!h||!h.connected||V.eyesOut)return;V.eyesOut=true;ORG.eye.hp=0;
  const p=toWorld(h,2.7,6.25),d=dirWorld(h,1,0),dl=Math.hypot(d.x,d.y)||1;
  for(let i=0;i<2;i++){const sp=rnd(55,95);GIBS.push({x:p.x,y:p.y,vx:d.x/dl*sp+rnd(-15,15),vy:d.y/dl*sp-rnd(30,70),ang:rnd(0,6.28),av:rnd(-9,9),r:0.8,type:'eye',pts:[],el:1,rest:false,bl:1.2,sx:p.x,sy:p.y,t0:T,ih:i});}
  FEYE=[];for(const sg of [1,-1])FEYE.push({x:sg*3.1,y:-164,vx:sg*rnd(8,22),vy:-rnd(25,45),t:0,sx:sg*3.1,sy:-164,rest:false,ang:rnd(0,6.28)});
  for(const [s_,w_,fx] of [[2.7,6.25,3.1],[2.7,6.2,-3.1]])addWound(h,{type:'hole',s:s_,w:w_,r:0.75,bleed:1.1,dw:0.3,ds:1,fx1:fx,fy1:-164,z:fx/8});
  mist(p.x,p.y,d.x/dl,d.y/dl,10,160,1,0.6);V.pain=100;emitSound('slice');emitLog('Mind crush · his eyes burst out of their sockets','bad');}
function gibStep(dt){
  if(SHELLS.length||SHELLQ.length)caseStep(dt);
  for(const e of FEYE){if(e.rest)continue;e.t+=dt;e.vy+=G*dt;e.x+=e.vx*dt;e.y+=e.vy*dt;e.ang+=dt*6;if(e.y>-0.8){e.y=-0.8;if(Math.abs(e.vy)>40){e.vy*=-0.3;e.vx*=0.6;}else{e.rest=true;}}}
  mistStep(dt);strandStep(dt);fracStep();openFracStep(dt);evisStep(dt);gutStep(dt);dropStep(dt);chemStep(dt);meleeStep(dt);
  for(const g of GIBS){
    if(g.type==='organ'&&g.teth){const a=g.teth;if(T-g.t0>0.7||!a.seg||a.seg.gone)g.teth=null;else{const A=toWorld(a.seg,a.s,a.w),dx=A.x-g.x,dy=A.y-g.y,d=Math.hypot(dx,dy);if(d>9){g.teth=null;mist(g.x,g.y,0,-1,3,60,1,0.4);}else if(d>5){g.vx+=dx/d*(d-5)*45*dt;g.vy+=dy/d*(d-5)*45*dt;}}}
    if(g.rest)continue;
    if(g.stick>0){g.stick-=dt;continue;}
    if(g.slide){g.y+=dt*rnd(4,10);if(g.type!=='bone'&&g.type!=='fat'&&Math.random()<dt*5&&WALLST.length<400)WALLST.push({x:g.x,y:g.y-g.r*0.5,r:g.r*0.45,c:'rgba(94,10,16,.7)'});if(g.y>-g.r*0.45){g.slide=false;g.vx=0;g.vy=0;}continue;}
    g.vy+=G*dt;g.vx*=1-0.3*dt;g.x+=g.vx*dt;g.y+=g.vy*dt;g.ang+=g.av*dt;
    if(g.bl>0){g.bl-=dt;if(Math.random()<dt*14&&BLOOD.length<GQ().b)BLOOD.push({x:g.x,y:g.y,vx:g.vx*0.15,vy:g.vy*0.15,r:0.3,life:3});}
    const wet=g.type==='flesh'||g.type==='muscle'||g.type==='organ';if(g.type==='glass'&&g.y>-g.r*0.45&&Math.abs(g.vy)>70&&Math.random()<0.3)emitSound('tink',0.2);
    if(g.y>-g.r*0.45){g.y=-g.r*0.45;if(Math.abs(g.vy)>70){if(wet){addDecal(g.x,g.r*1.4,g.vx);mist(g.x,g.y,0,-1,2,60,1.2,0.4);}g.vy*=-0.28;g.vx*=0.55;g.av*=0.5;}else{g.vy=0;g.vx*=0.8;g.av*=0.7;if(wet&&Math.abs(g.vx)>12&&Math.random()<0.5)addDecal(g.x,g.r*0.9,g.vx*2);if(Math.abs(g.vx)<4){g.rest=true;g.av=0;if(wet)addPool(g.x,g.r*0.6);}}}
    for(const side of [-1,1]){if(side*g.x>ROOM){g.x=side*ROOM;const hard=Math.abs(g.vx)>160&&g.type!=='bone';if(wet&&WALLST.length<400)WALLST.push({x:side*ROOM,y:g.y,r:g.r*(hard?1.3:1),c:'rgba(94,10,16,.8)'});
      if(hard&&g.y<-4){g.stick=rnd(0.4,2.4);g.slide=true;g.vx=0;g.vy=0;g.av=0;}else g.vx*=-0.35;}}
    if(g.y<TOP){g.y=TOP;g.vy=Math.abs(g.vy)*0.2;}
  }
}
function updateStreaks(seg,wd,rate,dt){
  const f=frame(seg),gw=f.ny,gs=f.uy;
  let act=0;for(const k of wd.streaks)if(k.on)act++;
  const bleeding=rate>0.015&&!wd.band;
  if(bleeding&&wd.streaks.length<3&&(act===0||(act<3&&Math.random()<rate*dt*0.35))){
    const c=woundCenter(wd);const sp=wd.type==='cut'?Math.random():0;
    const w0=wd.type==='cut'?lerp(wd.w,wd.w2,sp):c.w+rnd(-0.5,0.5)*wd.r,s0=wd.type==='cut'?lerp(wd.s,wd.s2,sp):c.s+rnd(-0.5,0.5)*wd.r;
    wd.streaks.push({pts:[[w0,s0]],on:true,wid:clamp(0.22+rate*0.32,0.22,1.05),age:0,drip:false,ph:rnd(0,6)});
  }
  for(const k of wd.streaks){
    k.age+=dt;if(!k.on)continue;
    if(!bleeding){k.on=false;continue;}
    const tip=k.pts[k.pts.length-1];
    const sp=(0.9+Math.min(rate,6)*1.8)*dt;const wob=Math.sin(k.age*2.3+k.ph)*0.22;
    const nw=tip[0]+(gw-gs*wob)*sp,ns=tip[1]+(gs+gw*wob)*sp;
    const rr=radS(seg,ns);
    if(Math.abs(nw)>rr-0.15||ns<-seg.ra+0.3||ns>seg.len+seg.rb-0.3){k.on=false;k.drip=true;continue;}
    const prev=k.pts.length>1?k.pts[k.pts.length-2]:null;
    if(!prev||Math.hypot(tip[0]-prev[0],tip[1]-prev[1])>0.6){k.pts.push([nw,ns]);if(k.pts.length>30){k.on=false;k.drip=true;}}else{tip[0]=nw;tip[1]=ns;}
  }
  if(bleeding)for(const k of wd.streaks){if((k.drip||k.on&&k.pts.length>6)&&Math.random()<rate*dt*(k.drip?1.6:0.3)&&BLOOD.length<GQ().b){const t=k.pts[k.pts.length-1];const p=toWorld(seg,t[1],t[0]);BLOOD.push({x:p.x,y:p.y,vx:rnd(-6,6),vy:rnd(0,25),r:rnd(0.3,0.55),life:4});}}
}
// a deterministic coil of small bowel filling an ellipse
const COILS={};
/* ---------- organs spilling out of big torso wounds ---------- */
let GUTS=[];
const GUT_LINK=1.7,GUT_MAX=260;
function gutCount(){let n=0;for(const g of GUTS)n+=g.pts.length;return n;}
// open wound mouth on the trunk: centre (local), size, and the world direction it faces
function woundMouth(seg,w){
  if(w.sut>=1||w.pack||w.graft||w.band||w.wrapped)return null;
  let s,ww,size;
  if(w.type==='hole'){if(w.r<2.6)return null;s=w.s;ww=w.w;size=w.r;}
  else if(w.type==='cut'){const deep=(w.r||0)>=0.55||w.laser;if(!deep||(w.len||0)<6)return null;s=(w.s+w.s2)/2;ww=(w.w+w.w2)/2;size=Math.min(6,w.len*0.45);}
  else if(w.type==='stump'){s=w.s;ww=0;size=w.r;}
  else return null;
  let d;if(w.type==='stump')d=dirWorld(seg,0,w.ds||(s<seg.len/2?-1:1));else{const rr=radS(seg,clamp(s,0,seg.len))||seg.ra;d=Math.abs(ww)>rr*0.25?dirWorld(seg,Math.sign(ww),0):dirWorld(seg,w.dw||1,w.ds||0);}
  const dl=Math.hypot(d.x,d.y)||1;return{s,w:ww,size,dx:d.x/dl,dy:d.y/dl};
}
function spillGuts(seg,m,wd){
  if(OPT.gore<3)return;
  const o=ORG.intest;if(!o||(o.out||0)>=1||gutCount()>GUT_MAX-20)return;
  if(wd&&wd.gut&&GUTS.includes(wd.gut)&&wd.gut.anchor){wd.gut.grow=Math.min(70,wd.gut.grow+14);return;}
  const p=toWorld(seg,m.s,m.w);const pts=[];for(let i=0;i<3;i++){const x=p.x+m.dx*i*0.8,y=p.y+m.dy*i*0.8;pts.push({x,y,px:x,py:y,c:i%2?1:-1});}
  const g={pts,anchor:{seg,s:m.s,w:m.w,dx:m.dx,dy:m.dy},grow:18+Math.floor(Math.random()*10),addT:0,bl:4,seed:Math.random()*1000|0};
  GUTS.push(g);if(wd)wd.gut=g;
  o.out=Math.min(1,(o.out||0)+0.35);o.hp=Math.max(0,o.hp-30);o.rep=false;
  emitLog('Eviscerated · the intestines are sliding out of the '+seg.label.toLowerCase(),'bad');emitSound('slice');
}
function organOut(o,seg,m){
  if(OPT.gore<3)return;
  if(o.out||!o.seg)return;const c=toWorld(o.seg,o.s,o.w),p=toWorld(seg,m.s,m.w);
  const x=lerp(c.x,p.x,0.7),y=lerp(c.y,p.y,0.7);
  o.out=1;o.hp=0;o.rep=false;
  GIBS.push({x,y,vx:m.dx*rnd(40,90),vy:m.dy*rnd(40,90)-rnd(20,60),ang:rnd(-0.6,0.6),av:rnd(-3,3),r:Math.max(o.rw,o.rs)*0.75,type:'organ',org:o,pts:[],el:1,rest:false,bl:2.5,t0:T,teth:{seg,s:m.s,w:m.w},beat:o.id==='heart'&&!V.dead&&!V.arrest});
  mist(p.x,p.y,m.dx,m.dy,14,220,1.2,0.8);
  for(let i=0,n_=gn(18);i<n_;i++)if(BLOOD.length<GQ().b){const a=Math.atan2(m.dy,m.dx)+rnd(-0.8,0.8),sp=rnd(60,260);BLOOD.push({x:p.x,y:p.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:rnd(0.25,0.6),life:3});}
  emitLog(o.name+' fell out of the body','bad');emitSound('slice');
  if(o.id==='heart'&&!V.arrest&&!V.dead)arrest('Cardiac arrest · the heart was torn out of the chest');
  if(GIBS.length>GQ().g+20)GIBS.splice(0,GIBS.length-GQ().g-20);
}
const SPILL={heart:0.55,lungL:0.25,lungR:0.25,liver:0.12,stomach:0.25,spleen:0.2,kidneyL:0.08,kidneyR:0.08};
function evisStep(dt){
  if(OPT.gore<3)return;
  for(const seg of [SEG.chest,SEG.abd]){if(!seg||seg.gone)continue;
    for(const w of seg.wounds){const m=woundMouth(seg,w);if(!m)continue;
      // the more the opening faces down and the bigger it is, the sooner things fall out
      const down=Math.max(0,m.dy),pr=dt*clamp((m.size-2.2)*0.28,0,1.6)*(0.35+1.3*down)*(w.type==='stump'?2.2:1);
      if(seg.kind==='abd'&&ORG.intest&&(ORG.intest.out||0)<1&&Math.random()<pr)spillGuts(seg,m,w);
      if((m.size<3.6||w.type==='cut'&&seg.kind==='chest')&&w.type!=='stump')continue;
      for(const o of seg.organs){const k=SPILL[o.id];if(!k||o.out)continue;if(w.type==='stump'){if(Math.abs(o.s-m.s)>o.rs+1.5)continue;}else if(Math.hypot(o.s-m.s,o.w-m.w)-Math.max(o.rw,o.rs)*0.8>m.size+1)continue;if(Math.random()<pr*k*(o.id==='heart'&&o.hp>0?0.6:1))organOut(o,seg,m);}
    }}
}
// who is holding the bowel: a conscious victim presses one hand on the wound and cradles the loops with the other
function gutHolder(){if(V.dead||V.consc<0.45||V.zombie)return null;return GUTS.find(g=>g.anchor&&g.anchor.seg&&g.anchor.seg.connected)||null;}
function gutStep(dt){
  if(!GUTS.length)return;const h=dt,gg=G*h*h,held=gutHolder();
  for(let gi=GUTS.length-1;gi>=0;gi--){const g=GUTS[gi],P_=g.pts;
    let A=null;if(g.anchor){const a=g.anchor;if(!a.seg||a.seg.gone||segs[a.seg.idx]!==a.seg)g.anchor=null;else A=toWorld(a.seg,a.s,a.w);}
    // feed more bowel out of the wound, slowly while he holds it in
    const hold=held===g;
    if(A&&g.grow>0&&P_.length<70&&gutCount()<GUT_MAX){g.addT+=dt*(hold?0.25:1);if(g.addT>0.07){g.addT=0;g.grow--;const q=P_[0];P_.splice(1,0,{x:q.x+g.anchor.dx*0.5,y:q.y+g.anchor.dy*0.5,px:q.x+g.anchor.dx*0.5,py:q.y+g.anchor.dy*0.5,c:Math.random()<0.5?1:-1});if(ORG.intest)ORG.intest.out=Math.min(1,(ORG.intest.out||0)+0.012);}}
    // once nobody holds it, the whole loop can tear free and drop out
    if(A&&!hold&&!g.reeling&&P_.length>=16){g.freeT=(g.freeT||0)+dt;if(g.freeT>2&&Math.random()<dt*0.12){g.anchor=null;A=null;g.grow=0;if(ORG.intest)ORG.intest.out=1;emitLog('The intestines tore free and fell to the floor','bad');mist(P_[0].x,P_[0].y,0,1,6,80,1,0.5);}}
    for(let i=0;i<P_.length;i++){const q=P_[i];if(i===0&&A)continue;const vx=(q.x-q.px)*0.96,vy=(q.y-q.py)*0.96;q.px=q.x;q.py=q.y;q.x+=vx;q.y+=vy+gg;}
    // the hand that cradles the loops grips a point a little way out
    if(hold){const hd=['far','near'].map(sd=>SEG[sd+'Hand']).find(x=>x&&x.connected&&armOK(x.side));if(hd){const k=Math.min(P_.length-1,8),q=P_[k],hp=P[hd.b];if(Math.hypot(hp.x-q.x,hp.y-q.y)<7){q.x+=(hp.x-q.x)*0.35;q.y+=(hp.y-q.y)*0.35;q.px=lerp(q.px,q.x,0.5);q.py=lerp(q.py,q.y,0.5);}g.gripHand=hd;}}else g.gripHand=null;
    for(let it=0;it<5;it++){
      if(A){P_[0].x=A.x;P_[0].y=A.y;}
      for(let i=1;i<P_.length;i++){const a=P_[i-1],b=P_[i],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1e-6,df=(d-GUT_LINK)/d;const wa=(i-1===0&&A)?0:0.5,wb=1-wa;a.x+=dx*df*wa;a.y+=dy*df*wa;b.x-=dx*df*wb;b.y-=dy*df*wb;}
      // a gentle, fixed bend per link so the bowel coils instead of hanging like a rope (fixed per point: no wriggling)
      if(it===0)for(let i=1;i<P_.length-1;i++){const a=P_[i-1],b=P_[i],q=P_[i+1],ax=q.x-a.x,ay=q.y-a.y,al=Math.hypot(ax,ay)||1,sg=b.c||1;const tx=(a.x+q.x)/2-ay/al*GUT_LINK*0.45*sg,ty=(a.y+q.y)/2+ax/al*GUT_LINK*0.45*sg;b.x+=(tx-b.x)*0.04;b.y+=(ty-b.y)*0.04;}
      // loops pile up instead of passing through each other
      if(it===4)for(let i=0;i<P_.length;i+=2)for(let j=i+3;j<P_.length;j+=2){const a=P_[i],b=P_[j],dx=b.x-a.x,dy=b.y-a.y,d2=dx*dx+dy*dy;if(d2<1.6&&d2>1e-6){const d=Math.sqrt(d2),f=(1.27-d)/d*0.12;a.x-=dx*f;a.y-=dy*f;b.x+=dx*f;b.y+=dy*f;}}
      for(const q of P_){if(q.y>-1.15){q.y=-1.15;q.px=lerp(q.px,q.x,0.7);q.py=q.y;}if(q.x>ROOM-1)q.x=ROOM-1;else if(q.x<-ROOM+1)q.x=-ROOM+1;}
    }
    // settle: anything barely moving on the floor stops, so loops lie still
    for(const q of P_){if(q.y>-1.3&&Math.abs(q.x-q.px)<0.02&&Math.abs(q.y-q.py)<0.02){q.px=q.x;q.py=q.y;}}
    if(g.bl>0){g.bl-=dt*0.2;if(Math.random()<dt*6&&BLOOD.length<GQ().b){const q=P_[(Math.random()*P_.length)|0];BLOOD.push({x:q.x,y:q.y,vx:(q.x-q.px)*20,vy:5,r:rnd(0.15,0.3),life:2});}}
    if(P_.length<2)GUTS.splice(gi,1);
  }
}
// a blade through a loop of bowel cuts it free
function gutCut(x0,y0,x1,y1){
  for(let gi=GUTS.length-1;gi>=0;gi--){const g=GUTS[gi],P_=g.pts;
    for(let i=0;i<P_.length-1;i++){const a=P_[i],b=P_[i+1];if(segX(x0,y0,x1,y1,a.x,a.y,b.x,b.y)){
      const rest=P_.splice(i+1);if(rest.length>=2)GUTS.push({pts:rest,anchor:null,grow:0,addT:0,bl:2,seed:g.seed+7});
      if(!g.anchor&&P_.length<2)GUTS.splice(gi,1);mist(a.x,a.y,0,-1,6,90,1,0.5);if(g.anchor)g.grow=Math.max(g.grow,6);break;}}}
}
/* ---------- skin and muscle flaps hanging from big wounds ---------- */
function addFlaps(seg,wd,n){
  if(OPT.gore<3||!OPT.strands||!seg||!LIMBK.concat(['chest','abd','neck','head']).includes(seg.kind))return;
  const stump=wd.type==='stump',rr=radS(seg,clamp(wd.s,0,seg.len))||seg.ra,cut=wd.type==='cut';
  for(let i=0;i<n;i++){const muscle=Math.random()<0.4;
    let s0,w0;if(stump){s0=wd.s;w0=rnd(-0.85,0.85)*rr;}else if(cut){const t=Math.random();s0=lerp(wd.s,wd.s2,t);w0=lerp(wd.w,wd.w2,t)+rnd(-0.4,0.4);}else{const a=rnd(0,6.28);s0=wd.s+Math.sin(a)*wd.r*0.8;w0=wd.w+Math.cos(a)*wd.r*0.8;}
    s0=clamp(s0,0,seg.len);{const r2=radS(seg,s0)||rr;w0=clamp(w0,-r2*0.95,r2*0.95);}
    const size=stump?rr*rnd(0.5,0.9):cut?Math.min(4,(wd.len||3)*0.35):wd.r;
    const p0=toWorld(seg,s0,w0),N=5,L=Math.max(0.5,size*rnd(0.35,0.6)),nodes=[];
    for(let q=0;q<N;q++){const x=p0.x+rnd(-0.2,0.2)*q,y=p0.y+L*q;nodes.push({x,y,px:x,py:y});}
    STRANDS.push({seg,wd,s:s0,w:w0,k:muscle?'mflap':'flap',nodes,L,L0:L,wid:Math.max(0.9,size*rnd(0.55,0.9)),ph:rnd(0,6),t0:T});}
  if(STRANDS.length>260)STRANDS.splice(0,STRANDS.length-260);
}
// heavy flaps slowly tear further and sometimes peel off completely
function flapStep(st,dt){
  if(st.k!=='flap'&&st.k!=='mflap')return true;
  if(st.L<st.L0*1.7)st.L+=dt*0.012*st.wid;
  if(T-st.t0>2.5&&Math.random()<dt*0.012){const t=st.nodes[st.nodes.length-1],hd=st.nodes[1];
    GIBS.push({x:hd.x,y:hd.y,vx:(t.x-t.px)*60,vy:(t.y-t.py)*60,ang:rnd(0,6.28),av:rnd(-6,6),r:st.wid*0.6,type:st.k==='flap'?'skin':'muscle',pts:Array.from({length:7},(_,q)=>{const a=q/7*6.283;return[Math.cos(a)*st.wid*0.6*rnd(0.6,1.1)*1.5,Math.sin(a)*st.L*1.6*rnd(0.6,1.1)];}),el:1.4,rest:false,bl:1});
    return false;}
  return true;
}
