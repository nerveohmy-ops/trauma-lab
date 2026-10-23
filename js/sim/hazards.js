/* TRAUMA_LAB_MAIN */
/* ===== sim/hazards.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
function spurt(seg,at,n,speed,spread){
  const p=toWorld(seg,at.s,at.w);let d=dirWorld(seg,at.dw||0,at.ds||0);let dl=Math.hypot(d.x,d.y);
  if(dl<0.1){const c=toWorld(seg,at.s,0);d={x:p.x-c.x,y:p.y-c.y};dl=Math.hypot(d.x,d.y);if(dl<0.1){d={x:rnd(-1,1),y:-0.5};dl=Math.hypot(d.x,d.y);}}
  d.x/=dl;d.y/=dl;
  for(let i=0;i<n&&BLOOD.length<GQ().b;i++){const a=Math.atan2(d.y,d.x)+rnd(-spread,spread),sp=speed*rnd(0.6,1.1);BLOOD.push({x:p.x,y:p.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:rnd(0.35,0.75),life:4});}
}
/* ---------- fire & burns ---------- */
function flameBurst(x0,y0,dx,dy){
  const a0=Math.atan2(dy,dx);
  for(let i=0;i<5;i++){const a=a0+rnd(-0.085,0.085),sp=rnd(720,950);FLAMES.push({x:x0+dx*6,y:y0+dy*6,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,t:0,life:rnd(0.42,0.6),r:rnd(1.4,2.4),hot:1});}
  if(++flameN%4===0)emitSound('flame');
  if(FLAMES.length>520)FLAMES.splice(0,FLAMES.length-520);
}
function frontFlame(fx,fy){
  for(let i=0;i<6;i++)FLAMES.push({front:view,x:fx+rnd(-3,3),y:fy+rnd(-3,3),vx:rnd(-30,30),vy:rnd(-160,-60),t:0,life:rnd(0.35,0.6),r:rnd(1.5,2.8),hot:1});
  const hit=frontHit(fx,fy);
  if(hit){const {s:ls,r}=frontLocal(hit);burnHit(hit.seg,ls,(view==='back'?-1:1)*r*0.95,0.9,hit.zx);}
  if(++flameN%4===0)emitSound('flame');
  if(V&&!V.dead){V.fear=Math.min(1,V.fear+0.05);const bx=(P[SEG.chest.a].x+P[SEG.abd.b].x)/2;V.thx=bx+(view==='back'?-150:150);}
}
function burnHit(seg,ls,lw,q,z,noFire){
  const rr=radS(seg,clamp(ls,0,seg.len))||seg.ra;const sg=Math.sign(lw)||1;
  const sw=seg.kind==='head'?lw:sg*Math.max(Math.abs(lw),rr*0.85);
  let wd=null,bd=1e9;for(const w of seg.wounds){if(w.type!=='burn'||w.graft)continue;if(z!=null&&w.z!=null&&Math.abs(w.z-z)*rr>Math.max(2.5,w.r*0.75))continue;const d=Math.hypot(w.s-ls,w.w-sw);if(d<Math.max(2.5,w.r*0.75)&&d<bd){bd=d;wd=w;}}
  if(!wd){if(seg.wounds.filter(w=>w.type==='burn').length>14){wd=seg.wounds.filter(w=>w.type==='burn').sort((a,b)=>Math.hypot(a.s-ls,a.w-sw)-Math.hypot(b.s-ls,b.w-sw))[0];}
    else wd=addWound(seg,{type:'burn',s:ls,w:sw,r:1.3,bleed:0,heat:0,deg:1,z:z==null?(seg.side==='far'?-0.8:0.8):z});}
  wd.heat=(wd.heat||0)+q;wd.r=Math.min(seg.kind==='head'?6:8,1.3+Math.sqrt(wd.heat)*0.85);wd.deg=wd.heat<6?1:wd.heat<18?2:3;wd.band=false;
  meltStep(seg,wd,q);
  const clothed=anyWear()&&WORDER.some(it=>covers(it,seg,ls,sw));
  if(!noFire&&(wd.heat>9||clothed)){if(!(seg.fireT>0))seg.ext=0;seg.fireT=Math.max(seg.fireT||0,clothed?5:2.5);}
  seg.burnAcc=(seg.burnAcc||0)+q;
  if(T-(seg.burnHurtT||-9)>0.3&&!V.dead){seg.burnHurtT=T;const a=seg.burnAcc*(wd.deg===3?1.2:2.2);seg.burnAcc=0;hurt(seg,ls,sw,Math.min(14,a));}
  if(seg.kind==='head'&&wd.deg===3&&wd.heat>25&&ORG.eye.hp>0&&Math.abs(ls-2.7)<6&&sw>3)dmgOrgan(ORG.eye,8,[],'burned');
  return wd;
}
function flameStep(dt){
  // extinguisher spray
  if(drag&&tool==='extinguisher'&&pointerW){
    const w=pointerW;
    for(let i=0;i<4;i++)FLAMES.push({co2:true,front:view==='side'?undefined:view,x:w.x+rnd(-2,2),y:w.y+rnd(-2,2),vx:rnd(-60,60),vy:rnd(-60,40),t:0,life:rnd(0.5,0.9),r:rnd(2,3.5),hot:0});
    if(view==='side'){for(const g of segs){const A=P[g.a],B=P[g.b];if(dps(w.x,w.y,A.x,A.y,B.x,B.y).d<30&&g.fireT>0){g.fireT=0;g.ext=T;}}for(const f of FLAMES)if(!f.co2&&!f.front&&Math.hypot(f.x-w.x,f.y-w.y)<30)f.t=f.life;}
    else{if(frontHit(w.x,w.y)||segs.some(g=>g.fireT>0))for(const g of segs)if(g.fireT>0){g.fireT=0;g.ext=T;}for(const f of FLAMES)if(f.front&&!f.co2&&Math.hypot(f.x-w.x,f.y-w.y)<25)f.t=f.life;}
    if(T-(flameStep.ext||-9)>0.25){flameStep.ext=T;emitNoise(0.25,5000,0.12,'highpass');}
  }
  // burning body parts keep burning and shed flames
  let anyFire=false;
  for(const g of segs){if(!(g.fireT>0))continue;anyFire=true;
    const lying=V.rise<0.2&&g.connected;g.fireT-=dt*(lying?2.2:1);
    if(Math.random()<dt*40){const t=Math.random(),A=P[g.a],B=P[g.b],x=lerp(A.x,B.x,t),y=lerp(A.y,B.y,t),r=rad(g,t);
      FLAMES.push({self:g.idx,x:x+rnd(-r,r)*0.7,y:y+rnd(-r,r)*0.7-r*0.5,vx:rnd(-25,25),vy:rnd(-140,-60),t:0,life:rnd(0.35,0.6),r:rnd(1.2,2.2),hot:0.35});
      if(view!=='side'&&g.connected){const p=frontPos(g,rnd(0,g.len),rnd(-0.9,0.9));if(p)FLAMES.push({front:view,x:p.x,y:p.y,vx:rnd(-20,20),vy:rnd(-130,-50),t:0,life:rnd(0.35,0.55),r:rnd(1.2,2.2),hot:0});}}
    if(Math.random()<dt*6){const ls=rnd(0,g.len),lw=rnd(-1,1)*(radS(g,ls)||g.ra);burnHit(g,ls,lw,0.35);}
    if(g.fireT<=0&&!g.ext)emitLog('Flames on '+g.label.toLowerCase()+' went out','info');
  }
  if(anyFire&&T-(flameStep.crack||-9)>0.4){flameStep.crack=T;emitNoise(0.18,1200,0.08);}
  for(let i=FLAMES.length-1;i>=0;i--){const f=FLAMES[i];f.t+=dt;if(f.t>=f.life){FLAMES.splice(i,1);continue;}
    const drag_=f.puke?0.3:f.co2?2.5:1.6;f.vx*=1-Math.min(1,drag_*dt);f.vy=f.vy*(1-Math.min(1,drag_*dt))+(f.puke?900:f.co2?-60:-420)*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.r+=dt*(f.co2?7:5);
    if(f.front||f.co2)continue;
    if(f.y>-0.5){f.y=-0.5;f.vy=-Math.abs(f.vy)*0.2;f.vx*=1.1;}
    if(f.x<-ROOM){f.x=-ROOM;f.vx=Math.abs(f.vx)*0.2;}if(f.x>ROOM){f.x=ROOM;f.vx=-Math.abs(f.vx)*0.2;}
    if(f.hot<0.05||f.t>f.life*0.85)continue;
    for(const g of segs){if(f.self===g.idx)continue;const A=P[g.a],B=P[g.b];const q=dps(f.x,f.y,A.x,A.y,B.x,B.y);const R_=rad(g,q.t)+f.r*0.4;if(q.d>R_)continue;
      const nx=(f.x-q.qx)/(q.d||1),ny=(f.y-q.qy)/(q.d||1),rr=rad(g,q.t);const L=toLocal(g,q.qx+nx*rr,q.qy+ny*rr);
      burnHit(g,L.s,L.w,f.hot*(f.self!=null?0.5:0.45));f.hot*=0.35;f.vx*=0.25;f.vy=f.vy*0.25-60;break;}
  }
}
function burnStep(dt){
  let area=0,pain=0;
  for(const g of segs){if(!g.connected)continue;for(let i=g.wounds.length-1;i>=0;i--){const w=g.wounds[i];if(w.type!=='burn'||w.graft||w.heat==null)continue;
    if(w.gel&&!V.dead){const hr=(w.deg||1)>=3?0:(w.deg===2?0.12:0.35);w.heat=Math.max(0,w.heat-hr*dt*(w.heat<6?1:0.6));w.deg=w.heat<6?1:w.heat<18?2:3;if(w.deg===1&&w.heat<0.6){w.r-=0.4*dt;if(w.r<0.4){g.wounds.splice(i,1);continue;}}}
    const a=w.r*w.r,d=w.deg||1,bk=(w.band?0.4:1)*(w.gel?0.45:1);if(d>=2)area+=a*bk;pain+=(d===3?0.25:d===2?0.7:0.35)*a*bk*(w.gel?0.6:1);}}
  if(V.dead)return;
  V.blood=Math.max(0,V.blood-area*0.0035*dt);
  const tgt=Math.min(85,pain*0.07);if(V.pain<tgt)V.pain+=(tgt-V.pain)*Math.min(1,dt*0.6);
  V.burnArea=area;
}
/* ---------- radiation: the core ---------- */
const CTOP=-76,CY=CTOP-7.8;
function coreTap(w){
  if(CORE&&Math.abs(w.x-CORE.x)<18&&w.y>CTOP-30&&w.y<CTOP+8){
    if(CORE.open){criticality();}
    else{CORE.open=true;emitLog('Screwdriver back in the gap · the core is subcritical again','info');}
    return;}
  CORE={x:clamp(w.x,-ROOM+25,ROOM-25),open:true,flash:-9};emitLog('Core placed on the lab table · the top half rests on a screwdriver. Tap the core to let it slip','info');
}
function criticality(){
  CORE.open=false;CORE.flash=T;emitSound('crit');FX.push({k:'blue',x:CORE.x,y:CY,t:0,life:0.9});shake=reduceMotion?0:0.4;
  const bx=(P[SEG.chest.a].x+P[SEG.abd.b].x)/2,by=(P[SEG.chest.a].y+P[SEG.abd.b].y)/2;
  const d=Math.hypot(bx-CORE.x,by-CY);const dose=45*Math.pow(30/(d+20),2);
  const shield=1-0.75*Math.min(1,DR.rdx?DR.rdx.l:0);V.rad+=dose*shield;V.radT=T;V.naus=dose>6?rnd(1,3):rnd(8,15);
  for(const g of segs){const A=P[g.a],B=P[g.b];const q=dps(CORE.x,CY,A.x,A.y,B.x,B.y);const sd=45*Math.pow(30/(Math.max(0,q.d-rad(g,q.t))+20),2);
    if(sd>4){g.radSkin=(g.radSkin||0)+sd;const L=toLocal(g,q.qx,q.qy);const rr=radS(g,clamp(L.s,0,g.len))||g.ra;const dl=toLocal(g,CORE.x,CY);g.radPt={s:clamp(L.s,0,g.len),w:(Math.sign(dl.w)||1)*rr*0.9};}}
  if(!V.dead){V.fear=1;V.flinch=0.8;V.thx=CORE.x;}
  const sev=V.rad<1?'probably harmless':V.rad<4?'radiation sickness likely':V.rad<8?'severe: needs a bone marrow transplant':V.rad<15?'lethal without treatment':'fatal dose: nervous system failure';
  emitLog('Criticality! Blue flash · '+dose.toFixed(1)+' Gy absorbed ('+V.rad.toFixed(1)+' Gy total) · '+sev,'bad');
}
function radInb(){if(!(V.rad>6)||V.marrow||V.dead)return 0;const since=T-V.radT;return since>35?Math.min(4,(V.rad-6)*0.05*Math.min(1,(since-35)/30)):0;}
function sourceStep(dt){
  if(!SOURCE)return;const sx=SOURCE.x,sy=-3;
  const bx=(P[SEG.chest.a].x+P[SEG.abd.b].x)/2,by=(P[SEG.chest.a].y+P[SEG.abd.b].y)/2;const d=Math.hypot(bx-sx,by-sy);
  const rate=0.9*Math.pow(30/(d+20),2);SOURCE.rate=rate;
  if(!V.dead){if(!(V.rad>0.05))V.radT=T;V.rad+=rate*dt*(1-0.75*Math.min(1,DR.rdx?DR.rdx.l:0));}
  for(const g of segs){if(!g.connected)continue;const A=P[g.a],B=P[g.b];const q=dps(sx,sy,A.x,A.y,B.x,B.y);const gd=Math.max(0,q.d-rad(g,q.t));const sr=1.8*Math.pow(15/(gd+10),2);
    if(sr>0.02){g.radSkin=(g.radSkin||0)+sr*dt;if(!g.radPt||sr*dt>0.001){const L=toLocal(g,q.qx,q.qy);const rr=radS(g,clamp(L.s,0,g.len))||g.ra;const dl=toLocal(g,sx,sy);g.radPt=g.radPt&&g.radPt.fixed?g.radPt:{s:clamp(L.s,0,g.len),w:(Math.sign(dl.w)||1)*rr*0.9};if(g.radSkin>5)g.radPt.fixed=true;}}}
  const cps=Math.min(60,2+rate*400);SOURCE.click=(SOURCE.click||0)+cps*dt;
  while(SOURCE.click>=1){SOURCE.click-=1;if(soundOn&&Math.random()<0.9)emitNoise(0.012,3500,0.08*Math.min(1,0.3+rate*6),'highpass');}
}
function radStep(dt){
  sourceStep(dt);
  const ax=DR.rdx?DR.rdx.l:0;
  if(ax>0.05&&!V.dead){const a=Math.min(1.5,ax);
    if(V.rad>0){V.rad=Math.max(0,V.rad-(0.25+V.rad*0.05)*a*dt);if(V.rad<0.05&&!radStep.done){radStep.done=1;emitLog('Rad antidote · radiation cleared from the body','good');}}
    V.rbc=Math.min(5000,V.rbc+25*a*dt);if(a>0.4&&V.rad>2)V.marrow=true;V.naus=Math.max(V.naus||0,4);
    for(const g of segs){if(g.radSkin>0)g.radSkin=Math.max(0,g.radSkin-g.radSkin*0.12*a*dt-0.3*a*dt);
      for(let i=g.wounds.length-1;i>=0;i--){const w=g.wounds[i];if(!w.radBurn||w.graft)continue;w.rh=(w.rh||0)+a*dt;if(w.rh>6){w.rh=0;if((w.deg||1)>1){w.deg--;w.heat=w.deg===2?8:2;}else{g.wounds.splice(i,1);}}}}}
  else radStep.done=0;
  if(!(V.rad>0.3)||V.dead)return;const R_=V.rad,since=T-V.radT;
  if(R_>1){V.naus-=dt;if(V.naus<=0){V.naus=rnd(7,15)*clamp(6/R_,0.35,2);vomit();}}
  if(R_>2&&!V.marrow&&since>20){V.rbc=Math.max(1300,V.rbc-V.rbc*(R_-2)*0.0006*dt);}
  if(R_>12&&since>15){ORG.brain.hp=Math.max(0,ORG.brain.hp-(R_-12)*0.06*dt);V.ko=Math.max(V.ko,ORG.brain.hp<50?2:0);if(ORG.brain.hp<=0)die('Acute radiation syndrome');}
  for(const g of segs){if(!(g.radSkin>5)||!g.radPt)continue;if(!(g.radSkin>6))continue;const st=g.radSkin>25?3:g.radSkin>12?2:1;const want=since>90?st:since>45?Math.min(st,2):since>15?1:0;
    if(want>0){let w=g.wounds.find(q=>q.radBurn&&!q.graft);if(!w){w=addWound(g,{type:'burn',s:g.radPt.s,w:g.radPt.w,r:1.5,bleed:0,heat:0,deg:1,radBurn:true});emitLog('Radiation burn appearing on '+g.label.toLowerCase(),'bad');}
      if((w.deg||1)<want&&!w.graft){w.heat=want===2?8:want===3?20:2;w.deg=want;w.r=Math.min(6,1.5+Math.sqrt(g.radSkin)*0.6);}}}
}

/* ---------- deep burns: tissue destroyed layer by layer ----------
   melt 0→1 the skin is gone (raw dermis), 1→2 subcutaneous fat, 2→3 muscle, 3→4 down to the bone, 4→5 the bone itself goes.
   Heat-units accumulate from the burn dose: ≈ 1.2 per second for 98 % sulfuric acid on skin, up to ≈ 10/s when the liquid is near boiling,
   so a hand in hot concentrated acid reaches bone in about a minute. (Real dissolution of bone takes hours; this is sped up so it can be watched,
   and the order of the layers and what each one does — eroded vessels bleed, exposed bone weakens and breaks — follows real chemical burns.) */
const MELTH=[18,40,80,140,260,380];
function meltOf(h){if(h<MELTH[0])return 0;for(let i=0;i<5;i++)if(h<MELTH[i+1])return i+(h-MELTH[i])/(MELTH[i+1]-MELTH[i]);return 5;}
function meltStep(seg,wd,q){const m=meltOf(wd.heat),was=wd.melt||0;wd.melt=m;if(m<=0)return;const lv=Math.floor(m),pl=Math.floor(was),rr=radS(seg,clamp(wd.s,0,seg.len))||seg.ra,what=wd.chem?'the acid':'the fire';
  // the wound widens with depth
  wd.r=Math.min(seg.kind==='head'?7:rr*1.15+2,Math.max(wd.r,1.3+Math.sqrt(wd.heat)*0.85*(1+m*0.12)));
  if(lv>pl){const say=(t,c)=>{if(T-(meltStep.t||-9)>1.5||meltStep.k!==t+seg.id){meltStep.t=T;meltStep.k=t+seg.id;emitLog(t,c||'bad');}};
    if(lv===1)say('Full-thickness burn on the '+seg.label.toLowerCase()+' · the skin is gone, yellow fat showing');
    if(lv===2){say(what[4].toUpperCase()+what.slice(5)+' is eating into the muscle of the '+seg.label.toLowerCase()+' · vessels eroding');if(!V.dead)hurt(seg,wd.s,wd.w,12);}
    if(lv===3)say(seg.kind==='abd'?'The belly wall is eaten through · bowel exposed':seg.kind==='chest'?'Ribs exposed':seg.kind==='head'?'Skull exposed':'Bone exposed in the '+seg.label.toLowerCase());
    if(lv===4)say(seg.kind==='abd'?'The acid is in the abdomen · the bowel is being destroyed':seg.kind==='head'?'The skull is '+(wd.chem?'dissolving':'charring through')+' · the brain is exposed':'The bone of the '+seg.label.toLowerCase()+' is '+(wd.chem?'dissolving':'charring through'));}
  // muscle layer: vessels in the wound are eaten open (a chemical burn coagulates small vessels, so they ooze rather than spurt)
  if(m>=2)for(const v of seg.vessels){if(v.lig||v.cut>=0.6)continue;const pt=v.pts.find(p=>Math.hypot(p[0]-wd.s,p[1]-wd.w*0.5)<wd.r*0.8);if(!pt)continue;v.cut=Math.min(0.6,(v.cut||0)+q*0.004);if(!v.at)v.at={s:pt[0],w:pt[1],dw:Math.sign(wd.w)||1,ds:0};}
  // bone: weakens, then breaks
  if(m>=3)for(const b of seg.bones){b.hp=Math.max(0,(b.hp??b.hp0??60)-q*0.25);if(m>=4.4&&!b.broken&&b.shape!=='ribs'){b.broken=true;emitLog(b.name+' gave way · eaten through','bad');}}
  if(m>=3&&seg.kind==='chest'&&seg.ribsBroken<10&&Math.random()<q*0.01)seg.ribsBroken=(seg.ribsBroken||0)+1;
  // deeper than bone: organs under it, the skull, the spine, or the limb falls apart
  if(m>=4){for(const o of seg.organs){if(o.hp>0&&Math.abs(o.s-wd.s)<wd.r+o.rs)dmgOrgan(o,q*0.8,[],'burned');}
    if(seg.kind==='head'&&ORG.brain.hp>0){dmgOrgan(ORG.brain,q*0.6,[],'burned');}
    if(seg.kind==='neck'&&m>=4.6&&!BN('cervical').broken){BN('cervical').broken=true;emitLog('The neck is eaten through to the spine','bad');}
    if(LIMBK.includes(seg.kind)&&m>=4.8&&wd.r>=rr*0.85&&seg.connected&&!seg.gone){const rep=[];if(cutLimbAt(seg,clamp(wd.s,0,seg.len),rep))emitLog(seg.label+' fell apart · dissolved through','bad');}}
}
