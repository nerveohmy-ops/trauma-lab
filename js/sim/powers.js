/* TRAUMA_LAB_MAIN */
/* ===== sim/powers.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
/* ---------- powers ---------- */
let BHP=[],BHS=[];
let EXPL=null,BH=null,QUAKE=0,METEORS=[],FBALLS=[],POWFX=[],DUSTQ=[],DRAIN=0,TKH=null;
function park(g){if(g.gone)return;g.gone=true;g.dust=null;for(const p of [P[g.a],P[g.b]]){p.gone=true;p.y+=1e5;p.py=p.y;p.px=p.x;}}
function unpark(g){g.dust=null;if(!g.gone)return;g.gone=false;for(const p of [P[g.a],P[g.b]]){if(!p.gone)continue;p.gone=false;p.y-=1e5;p.py=p.y;p.px=p.x;}g.detT=0;}
function hitPoint(w){const b=bodyAt(w);if(!b)return null;return b;}
function acidStroke(x0,y0,x1,y1){const L=Math.hypot(x1-x0,y1-y0),n=Math.max(1,Math.ceil(L/1.4));
  for(let i=0;i<=n;i++){const w={x:lerp(x0,x1,i/n),y:lerp(y0,y1,i/n)};if(Math.random()<0.5)POWFX.push({k:'drop',x:w.x+rnd(-1,1),y:w.y-rnd(0,2),vx:rnd(-20,20),vy:rnd(-30,10),t:0,life:0.5});
    const b=bodyAt(w);if(!b)continue;const wd=burnHit(b.seg,b.s,b.w,1.2,null,true);if(wd){wd.acid=1;wd.acidT=6;}}
  if(T-(acidStroke.t||-9)>0.25){acidStroke.t=T;emitSound('sizzle');}
  if(T-(acidStroke.lt||-9)>2){const b=bodyAt({x:x1,y:y1});if(b){acidStroke.lt=T;emitLog('Acid · chemical burns on the '+b.seg.label.toLowerCase()+' · still eating in','bad');}}}
function lightning(w){
  const b=bodyAt(w),rep=[];let x=w.x,y=w.y;
  const pts=[];let px=x+rnd(-30,30),py=view==='side'?TOP:y-260;pts.push([px,py]);const n=14;for(let i=1;i<n;i++){const t=i/n;pts.push([lerp(px,x,t)+rnd(-7,7)*(1-t*0.5),lerp(py,y,t)]);}pts.push([x,y]);
  POWFX.push({k:'bolt',pts,t:0,life:0.45});POWFX.push({k:'flash',t:0,life:0.25});shake=0.6;emitSound('zap');buzz(80);
  let seg=b?b.seg:null,amp=1;
  if(!b&&view==='side'){let best=null,bd=14;for(const g of segs){if(!g.connected)continue;for(const p of [P[g.a],P[g.b]]){const d=Math.hypot(p.x-w.x,p.y-w.y);if(d<bd){bd=d;best=g;}}}seg=best;amp=0.45;}
  if(!seg){emitLog('Lightning struck the floor','info');return;}
  const L=b&&b.seg===seg?b:{s:seg.len/2,w:0};
  const wd=burnHit(seg,L.s,L.w,14*amp,null,false);if(seg.connected)seg.lich={s:L.s,w:L.w,seed:Math.random()*1e6,t:T,r:6+8*amp};
  if(seg.connected){
    const feet=[SEG.nearFoot,SEG.farFoot].filter(f=>f&&f.connected);for(const f of feet)burnHit(f,f.len*0.6,0,6*amp,null,true);
    for(const g of segs)if(g.connected){const A=P[g.a],B=P[g.b];for(const p of [A,B]){p.px+=rnd(-1,1)*0.6;p.py+=rnd(-1,1)*0.6;}}
    hurt(seg,L.s,L.w,45*amp);V.ko=Math.max(V.ko,8*amp);V.seizeT=Math.max(V.seizeT||0,2.5*amp);V.rise=0;
    if(!V.dead&&Math.random()<0.6*amp+0.15){arrest('Lightning strike · his heart went into fibrillation');rep.push('cardiac arrest');}
    if(seg.kind==='head'){dmgOrgan(ORG.brain,30*amp,rep,'burned');}
    bulletTime();
  }
  emitLog('Lightning · '+seg.label.toLowerCase()+' · entry burn, exit burns on the feet'+(rep.length?' · '+rep.join(', '):''),'bad');
}
function freezeBody(){
  if(V.dead&&V.frozenT<=0){emitLog('Frozen solid','info');}
  for(const j of joints)j.frz=j.broken?null:jointRel(j);
  V.frozenT=14;V.thawT=0;V.ko=Math.max(V.ko,3);V.rise=0;emitSound('freeze');
  POWFX.push({k:'frost',t:0,life:0.6});
  emitLog('Flash-frozen · limbs are brittle, bleeding slowed · shoot or drop him to shatter','bad');
}
function shatter(seg,cs,rep){
  const p=toWorld(seg,clamp(cs,0,seg.len),0);
  for(let i=0;i<gn(10);i++)GIBS.push({x:p.x,y:p.y,vx:rnd(-300,300),vy:rnd(-400,50),ang:rnd(0,6.28),av:rnd(-20,20),r:rnd(0.4,1),type:'ice',pts:[[1,0],[0.2,0.7],[-0.9,0.3],[-0.5,-0.6],[0.4,-0.8]].map(q=>[q[0]*rnd(0.6,1.4),q[1]*rnd(0.6,1.4)]),rest:false,bl:0});
  emitSound('pop');
  if(seg.kind==='head'||seg.kind==='neck'){const j=SEG.head.joint;if(j&&!j.broken){sever(j,rep);rep.push('head shattered');}}
  else if(!cutLimbAt(seg,clamp(cs,4,seg.len-4),rep)&&seg.joint&&!seg.joint.broken)sever(seg.joint,rep);
  for(const g of segs)for(const w of g.wounds)if(w.type==='stump'&&w.age<0.1){w.bleed*=0.2;w.frost=1;}
  rep.push(seg.label.toLowerCase()+' shattered like glass');
}
function forcePush(w,pw){
  const h=hPrev||1/360,R=80;
  for(const p of P){if(p.gone)continue;const dx=p.x-w.x,dy=p.y-w.y,d=Math.hypot(dx,dy)||1;const f=clamp(1-d/R,0,1);if(f<=0)continue;const dv=(1300*f*f+250*f)*pw;p.px-=dx/d*dv*h;p.py-=(dy/d-0.35)*dv*h;}
  for(const g of GIBS){const dx=g.x-w.x,dy=g.y-w.y,d=Math.hypot(dx,dy)||1,f=clamp(1-d/R,0,1);if(f>0){g.rest=false;g.vx+=dx/d*900*f;g.vy+=(dy/d-0.4)*900*f;}}
  for(const o of OBJ){if(o.stuck||o.att)continue;const dx=o.x-w.x,dy=o.y-w.y,d=Math.hypot(dx,dy)||1,f=clamp(1-d/R,0,1);if(f>0){o.px-=dx/d*900*f*h;o.py-=dy/d*900*f*h;}}
  for(const pr of PROPS){const dx=pr.x-w.x,dy=pr.y-w.y,d=Math.hypot(dx,dy)||1,f=clamp(1-d/R,0,1);if(f>0){const k=900*f*pw*Math.min(1,10/propMass(pr));pr.vx+=dx/d*k;pr.vy+=(dy/d-0.3)*k;pr.av+=rnd(-4,4)*f;}}
  for(const b of BLOOD){const dx=b.x-w.x,dy=b.y-w.y,d=Math.hypot(dx,dy)||1,f=clamp(1-d/R,0,1);b.vx+=dx/d*600*f;b.vy+=dy/d*600*f;}
  let near=99;for(const g of segs)if(g.connected){const A=P[g.a];near=Math.min(near,Math.hypot(A.x-w.x,A.y-w.y));}
  if(near<R){hurt(null,0,0,8);V.rise=0;V.fear=1;}
  POWFX.push({k:'wave',x:w.x,y:w.y,t:0,life:0.45});emitSound('whoosh');buzz(40);emitLog(near<R?'Force push · he was thrown back':'Force push','bad');
}
function disintegrate(w){
  const b=bodyAt(w);if(!b){emitLog('Tap a body part to disintegrate it','info');return;}
  const g=b.seg,rep=[];let list;
  if(g.kind==='chest'||g.kind==='abd'){list=segs.filter(q=>!q.gone&&(q.connected||true));emitLog('He crumbles away to dust','bad');die('Disintegrated');}
  else if(!g.connected){list=distalOf(g);}
  else if(LIMBK.includes(g.kind)&&b.s>4.5&&b.s<g.len-4){const n0=segs.length;cutLimbAt(g,b.s,rep);for(const v of g.vessels)if(v.cut>0&&v.at&&Math.abs(v.at.s-g.len)<1.2)v.lig=true;list=segs.length>n0?distalOf(segs[segs.length-1]):[];}
  else{const j=g.joint;if(!j||j.broken)return;sever(j,rep);list=distalOf(g);}
  // no blood: the ash seals the stump
  for(const q of segs)for(const wd of q.wounds)if(wd.type==='stump'&&wd.age<0.1){wd.bleed=0.04;wd.dust=1;}
  for(const v of VESSELS)if(v.stump&&v.seg.connected&&!v.lig&&v.seg.wounds.some(wd=>wd.dust))v.lig=true;
  STREAMS={};
  for(const q of list){q.dust=0;}
  DUSTQ.push({list,t:0});emitSound('sizzle');if(g.kind==='head'&&!V.dead)brainDeath('Head turned to dust');
  if(list.length&&!(g.kind==='chest'||g.kind==='abd'))emitLog(list.map(q=>q.label.replace(' (cut off)','')).slice(0,2).join(' and ')+' crumbled to dust','bad');
}
function headPop(){
  const h=SEG.head;if(!h||h.gone)return;const rep=[];const p=toWorld(h,h.len*0.45,0);
  dmgOrgan(ORG.brain,200,rep,'burst');if(ORG.eye)dmgOrgan(ORG.eye,200,rep,'burst');
  for(let i=0,n_=gn(60);i<n_;i++)if(BLOOD.length<GQ().b){const a=rnd(0,6.28),sp=rnd(80,600);BLOOD.push({x:p.x,y:p.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-150,r:rnd(0.25,0.7),life:3});}
  mist(p.x,p.y,0,-1,40,500,3.1,1);spawnGibs(p.x,p.y,0,-1,10,'flesh',520);spawnGibs(p.x,p.y,0,-1,5,'bone',480);
  const j=h.joint;TEAR=1;if(j&&!j.broken)sever(j,rep);TEAR=0;park(h);updateConnected();
  for(const st of STRANDS)if(st.seg===SEG.neck)st.L*=1.3;
  shake=1;emitSound('pop');buzz(150);brainDeath('Head exploded');emitLog('Mind crush · his head burst','bad');
}
function powerStep(dt){
  if(dt<=0)return;
  // hold powers
  if(drag&&!drag.probe){
    const pw=drag.cw;
    if(drag.tk&&pointerW){const k=drag.tk,pts=k.pts;let cx=0,cy=0;for(const q of pts){cx+=q.x;cy+=q.y;}cx/=pts.length;cy/=pts.length;
      let dx=pw.x+k.ox-cx,dy=pw.y+k.oy-cy;const m=Math.hypot(dx,dy),mx=k.limb?3:4.5;if(m>mx){dx*=mx/m;dy*=mx/m;}
      const ka=k.limb?0.5:0.22;for(const q of pts){q.x+=dx*ka;q.y+=dy*ka;q.px=lerp(q.px,q.x,0.04);q.py=lerp(q.py,q.y,0.04);q.py+=G*dt*dt*0.9;}
      V.rise=0;if(Math.random()<dt*6)POWFX.push({k:'aura',x:cx+rnd(-6,6),y:cy+rnd(-6,6),t:0,life:0.6});
      if(k.limb){const g=k.limb,j=g.joint;if(j&&!j.broken){const st=m;
        if(st>9){k.strain+=dt*st/9;if(Math.random()<dt*4)hurt(g,0,0,8);if(Math.random()<dt*6){const e=P[j.end==='a'?g.a:g.b];mist(e.x,e.y,0,1,1,40,1.5,0.4);}}else k.strain=Math.max(0,k.strain-dt);
        if(k.strain>1.3){const rep=[];TEAR=1;sever(j,rep);TEAR=0;emitLog('Telekinesis ripped off the '+g.label.toLowerCase(),'bad');k.limb=null;k.list=distalOf(g);k.pts=bodyPts(k.list);let cx2=0,cy2=0;for(const q of k.pts){cx2+=q.x;cy2+=q.y;}k.ox=cx2/k.pts.length-pw.x;k.oy=cy2/k.pts.length-pw.y;}}}}
    if(tool==='mind'&&drag.mind!=null&&!V.dead&&SEG.head.connected&&!SEG.head.gone){drag.mind+=dt;const m=drag.mind;
      ORG.brain.hp=Math.max(0,ORG.brain.hp-9*dt);V.pain=Math.min(100,V.pain+25*dt);V.fear=1;V.seizeT=Math.max(V.seizeT||0,0.3);if(Math.random()<dt*3)hurt(SEG.head,0,0,8);
      const h=SEG.head,A=P[h.a],B=P[h.b];const sh=0.08+m*0.05;A.x+=rnd(-1,1)*sh;B.x+=rnd(-1,1)*sh;
      if(m>0.8&&!drag.bled){drag.bled=1;for(const [s_,w_,fx,fy,r_,bx] of [[2.7,6.25,3.1,-164,0.3],[2.7,6.2,-3.1,-164,0.3],[7.3,8.4,0.7,-159.3,0.16],[7.35,8.3,-0.7,-159.3,0.16],[4.2,-0.5,8.1,-162.4,0.18,8.1],[4.25,-0.55,-8.1,-162.4,0.18,-8.1]])addWound(h,{type:'hole',ooze:true,s:s_,w:w_,r:r_,bleed:0.6,dw:0.3,ds:1,fx1:fx,fy1:fy,bx1:bx,by1:bx!=null?-162.4:undefined,z:fx/8});emitLog('Mind crush · blood pouring from his eyes, both nostrils and his ears','bad');}
      if(m>1.8&&!drag.eyes){drag.eyes=1;popEyes();}
      if(Math.random()<dt*8)POWFX.push({k:'psi',x:pw.x,y:pw.y,t:0,life:0.7});
      if(m>4)headPop();}
    // a corpse has no heartbeat pushing blood: nothing left to pull, so the drain lets go
    if(tool==='drain'&&drag.drain&&(V.dead||V.zombie)){drag.drain=null;emitLog('Life drain · he is dead, there is no living blood to drain','info');}
    if(tool==='drain'&&drag.drain&&!V.dead){const d=drag.drain;V.blood=Math.max(0,V.blood-230*dt);DRAIN+=230*dt;V.pain=Math.min(100,V.pain+6*dt);
      for(let i=0;i<3;i++)POWFX.push({k:'dp',x:d.x+rnd(-3,3),y:d.y+rnd(-3,3),tx:pw.x,ty:pw.y-14,t:0,life:rnd(0.5,0.9)});
      if(V.blood<900)die('Drained of blood');}
  }
  // world powers
  if(QUAKE>0){QUAKE-=dt;shake=Math.max(shake,0.35);for(const p of P){if(p.gone)continue;if(p.y>-p.r-2.5&&Math.random()<0.5){p.py+=rnd(0.4,1.6)*0.6;p.px+=rnd(-1,1)*0.25;}}
    for(const g of GIBS){if(g.y>-g.r-1&&Math.random()<0.3){g.rest=false;g.vy=-rnd(40,160);g.vx+=rnd(-40,40);}}V.rise=0;if(Math.random()<dt*2)hurt(null,0,0,4);}
  V.bhAcc=0;
  for(const bh_ of BHS.slice()){BH=bh_;BH.P=BH.P||[];BH.t+=dt;const h=hPrev||1/360,tt=BH.t;
    // it never stops growing: pull and size keep rising for as long as it is open
    const str=Math.min(8,0.15+0.09*tt)*Math.min(1,tt/1.2);
    BH.R=7+0.9*Math.sqrt(BH.eaten*2+tt*2)+Math.pow(Math.max(0,tt-15),1.7)*0.12;BH.ang+=dt*(1.2+tt*0.08);const Rh=BH.R;
    const sz=BH.R/7,acc=d=>Math.min(20000*sz,str*(6e4*sz/(d+60)+7e5*sz*sz/(d*d+400)));
    const crumb=(x,y,col,n)=>{for(let i=0;i<n;i++){const dx=x-BH.x,dy=y-BH.y;BH.P.push({r:Math.hypot(dx,dy)+rnd(-1,1),a:Math.atan2(dy,dx)+rnd(-0.3,0.3),c:col,l:rnd(0.6,1.4),w:rnd(0.25,0.8)});}if(BH.P.length>600)BH.P.splice(0,BH.P.length-600);};
    for(const p of P){if(p.gone)continue;const dx=BH.x-p.x,dy=BH.y-p.y,d=Math.hypot(dx,dy)||1;const a=acc(d);p.px-=dx/d*a*dt*h;p.py-=dy/d*a*dt*h;}
    {const c=P[SEG.chest.a];if(!SEG.chest.gone){const ac=acc(Math.hypot(BH.x-c.x,BH.y-c.y));if(ac>(V.bhAcc||0)){V.bhAcc=ac;V.bhX=BH.x;}if(ac>420){if(V.rise>0){V.rise=0;emitLog('The black hole pulls him off his feet','bad');}V.riseCD=Math.max(V.riseCD||0,T+2);}}}
    for(let i=OBJ.length-1;i>=0;i--){const o=OBJ[i];if(o.att)continue;const dx=BH.x-o.x,dy=BH.y-o.y,d=Math.hypot(dx,dy)||1;const a=acc(d);o.stuck=false;o.px-=dx/d*a*dt*h;o.py-=dy/d*a*dt*h;
      if(d<Rh+o.r*0.5){crumb(o.x,o.y,o.type==='anvil'?'200,210,220':'230,140,90',16);OBJ.splice(i,1);BH.eaten+=o.type==='anvil'?6:1;emitSound('thud',0.6);emitLog('The black hole disintegrated '+({anvil:'the anvil',ball:'the bowling ball',brick:'a brick',grenade:'a grenade',c4:'a charge',mine:'a mine'}[o.type]||'an object'),'info');}}
    for(let i=PROPS.length-1;i>=0;i--){const pr=PROPS[i];const dx=BH.x-pr.x,dy=BH.y-pr.y,d=Math.hypot(dx,dy)||1;const a=acc(d);pr.vx+=dx/d*a*dt;pr.vy+=dy/d*a*dt;pr.av+=rnd(-1,1)*dt*a*0.002;
      if(d<Rh+pr.R*0.25){crumb(pr.x,pr.y,pr.type==='beaker'?'200,230,255':'170,110,60',14);PROPS.splice(i,1);BH.eaten+=pr.type==='table'?4:1;emitLog('The black hole disintegrated the '+PROPDEF[pr.type].name.toLowerCase(),'info');}}
    for(let gi=GUTS.length-1;gi>=0;gi--){const gg=GUTS[gi];for(const q of gg.pts){const dx=BH.x-q.x,dy=BH.y-q.y,d=Math.hypot(dx,dy)||1;const a=acc(d)*dt*dt;q.x+=dx/d*a;q.y+=dy/d*a;}gg.pts=gg.pts.filter(q=>Math.hypot(BH.x-q.x,BH.y-q.y)>Rh);if(gg.pts.length<2)GUTS.splice(gi,1);}
    for(const b of BLOOD){const dx=BH.x-b.x,dy=BH.y-b.y,d=Math.hypot(dx,dy)||1;const a=acc(d)*1.5;b.vx+=dx/d*a*dt;b.vy+=dy/d*a*dt;b.life=Math.max(b.life,0.5);if(d<Rh){b.life=0;if(Math.random()<0.3)crumb(b.x,b.y,'200,40,40',1);}}
    for(const g of GIBS){const dx=BH.x-g.x,dy=BH.y-g.y,d=Math.hypot(dx,dy)||1;g.rest=false;g.slide=false;g.stick=0;const a=acc(d);g.vx+=dx/d*a*dt;g.vy+=dy/d*a*dt;if(d<Rh+0.5){crumb(g.x,g.y,'210,90,80',3);g.y=1e4;}}
    for(const m of MIST){const dx=BH.x-m.x,dy=BH.y-m.y;m.vx+=dx*dt*20*str;m.vy+=dy*dt*20*str;}
    for(const k in STREAMS)for(const q of STREAMS[k].pts){if(q.dead)continue;const dx=BH.x-q.x,dy=BH.y-q.y,d=Math.hypot(dx,dy)||1;const a=acc(d)*1.5;q.vx+=dx/d*a*dt;q.vy+=dy/d*a*dt;if(d<Rh)q.dead=true;}
    for(const pl of POOLS){const d=Math.hypot(pl.x-BH.x,BH.y);if(acc(d)>700){pl.w=Math.max(0,pl.w-dt*4*str);pl.x+=(BH.x-pl.x)*dt*0.4;}}
    // spaghettification near the hole, disintegration at the horizon — connected or not
    let ate=false;
    for(const g of segs){if(g.gone)continue;const A=P[g.a],B=P[g.b],r=dps(BH.x,BH.y,A.x,A.y,B.x,B.y);
      if(r.d<Rh*3&&g.connected){g.bhS=(g.bhS||0)+dt*str;if(Math.random()<dt*4)hurt(g,0,0,10);if(g.bhS>1.2&&g.joint&&!g.joint.broken&&g.kind!=='abd'&&g.kind!=='chest'){TEAR=1;sever(g.joint,[]);TEAR=0;emitLog('The black hole tore off the '+g.label.toLowerCase(),'bad');}}
      if(r.d<Rh*1.15){if(g.connected||joints.some(jj=>!jj.broken&&(segs[jj.p]===g||segs[jj.c]===g))){for(const jj of joints){if(jj.broken)continue;if(segs[jj.p]===g||segs[jj.c]===g){TEAR=1;sever(jj,[]);TEAR=0;}}}
        const q=toWorld(g,g.len*0.5,0);crumb(q.x,q.y,'235,170,140',12);park(g);BH.eaten+=2;ate=true;}}
    if(ate){updateConnected();if(!V.dead&&!V.zombie&&(SEG.head.gone||SEG.chest.gone)){const gd=OPT.god;OPT.god=false;die('Swallowed by a black hole');OPT.god=gd;}else if(V.zombie&&(SEG.head.gone))die('Swallowed by a black hole');}
    if(!WORLD_GONE&&BH.R*1.3>Math.hypot(ROOM*2,-TOP)*0.62)worldGone();
    for(let i=BH.P.length-1;i>=0;i--){const q=BH.P[i];q.a+=dt*(40/(q.r+4))*(1+tt*0.05);q.r-=dt*(8+60/(q.r+2));q.l-=dt*0.3;if(q.r<Rh*0.9||q.l<=0)BH.P.splice(i,1);}
  }
  BH=null;
  for(let i=METEORS.length-1;i>=0;i--){const m=METEORS[i];m.vy+=G*0.4*dt;m.x+=m.vx*dt;m.y+=m.vy*dt;m.tr.push([m.x,m.y]);if(m.tr.length>16)m.tr.shift();
    let hit=m.y>=-m.r*0.5;if(!hit)for(const g of segs){if(!g.gone&&insideSeg(g,m.x,m.y)){hit=true;break;}}
    if(hit){METEORS.splice(i,1);const y=Math.min(m.y,-2);EXPL='Meteor';explode(m.x,y,2.6,true);EXPL=null;for(let k=0;k<26;k++)GIBS.push({x:m.x,y,vx:rnd(-500,500),vy:rnd(-700,-100),ang:rnd(0,6),av:rnd(-15,15),r:rnd(0.6,1.6),type:'rock',pts:[[1,0],[0.3,0.9],[-0.8,0.5],[-0.9,-0.4],[0.2,-1]].map(q=>[q[0]*rnd(0.7,1.3),q[1]*rnd(0.7,1.3)]),rest:false,bl:0});
      emitSound('rumble');shake=1.5;}}
  for(let i=FBALLS.length-1;i>=0;i--){const f=FBALLS[i];f.t+=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;if(Math.random()<0.8)FLAMES.push({x:f.x+rnd(-1,1),y:f.y+rnd(-1,1),vx:rnd(-20,20),vy:rnd(-60,-20),t:0,life:rnd(0.2,0.4),r:rnd(1,1.8),hot:0.1,co2:false,self:true});
    let hit=f.t>2.5||f.x<-ROOM||f.x>ROOM||f.y>-1,hs=null;for(const g of segs){if(!g.gone&&insideSeg(g,f.x,f.y)){hit=true;hs=g;break;}}
    if(hit){FBALLS.splice(i,1);EXPL='Fireball';explode(f.x,f.y,0.45);EXPL=null;for(const g of segs){if(g.gone)continue;const A=P[g.a],B=P[g.b],r=dps(f.x,f.y,A.x,A.y,B.x,B.y);const dd=r.d-rad(g,r.t);if(dd>10)continue;const L=toLocal(g,r.qx,r.qy);burnHit(g,L.s,L.w,(1-dd/10)*16+4);g.fireT=Math.max(g.fireT||0,6);}
      for(let k=0;k<30;k++)FLAMES.push({x:f.x+rnd(-4,4),y:f.y+rnd(-4,4),vx:rnd(-90,90),vy:rnd(-160,-20),t:0,life:rnd(0.4,0.9),r:rnd(1.4,2.6),hot:0.6});emitLog('Fireball'+(hs?' · '+hs.label.toLowerCase()+' set alight':''),'bad');}}
  for(let i=DUSTQ.length-1;i>=0;i--){const q=DUSTQ[i];q.t+=dt;const k=q.t/1.6;
    for(const g of q.list){if(g.gone)continue;g.dust=Math.min(1,k);if(Math.random()<dt*30*(1-k*0.5)){const t=Math.random(),A=P[g.a],B=P[g.b];MIST.push({x:lerp(A.x,B.x,t)+rnd(-1.5,1.5),y:lerp(A.y,B.y,t)+rnd(-1.5,1.5),vx:rnd(-20,20)+18,vy:rnd(-30,-5),r:rnd(0.3,0.7),t:0,life:rnd(0.8,1.6),ash:1});}}
    if(k>=1){for(const g of q.list)park(g);DUSTQ.splice(i,1);updateConnected();}}
  for(const g of segs)for(const w of g.wounds)if(w.acidT>0){w.acidT-=dt;w.heat=(w.heat||0)+dt*1.2;w.r=Math.min(7,1.3+Math.sqrt(w.heat)*0.85);w.deg=w.heat<6?1:w.heat<18?2:3;if(Math.random()<dt*2&&!V.dead)hurt(g,w.s,w.w,4);}
  if(V.frozenT>0){V.frozenT-=dt;V.coldT=(V.coldT||0)+dt;V.pain=Math.max(0,V.pain-20*dt);V.ko=Math.max(V.ko,1);if(V.coldT>40&&!V.dead)die('Froze to death');
    if(V.frozenT<=0){V.thawT=6;for(const j of joints)j.frz=null;const rep=[];for(const k of ['nearHand','farHand','nearFoot','farFoot','head'])if(SEG[k]&&SEG[k].connected&&!SEG[k].gone){const g=SEG[k];const wd=burnHit(g,g.len*0.6,(g.kind==='head'?3:0),5,null,true);if(wd)wd.frost=1;}emitLog('Thawed out · frostbite on the hands, feet and face','info');}}
  else{if(V.thawT>0)V.thawT-=dt;if(V.coldT>0)V.coldT=Math.max(0,V.coldT-dt*0.5);}
  if(DRAIN>0&&!(drag&&drag.drain))DRAIN=Math.max(0,DRAIN-dt*40);
}
// realistic look: dark shadow, thin photon ring, tilted accretion disk with the far side lensed over the top, Doppler-bright approaching side
let WORLD_GONE=false;
// the hole outgrew the room: everything goes black, even the monitor — only Reset is left
function worldGone(){WORLD_GONE=true;let el=$('voidOv');if(!el){el=document.createElement('div');el.id='voidOv';el.innerHTML='<p>The black hole swallowed everything</p><button id="voidReset">Reset</button>';document.body.appendChild(el);
    $('voidReset').onclick=()=>{el.classList.remove('on');setTimeout(()=>{el.hidden=true;},400);reset();};}
  const hole=BH||BHS[BHS.length-1];const sx=hole?clamp(hole.x*VS+VX,30,W-30):W/2,sy=hole?clamp(hole.y*VS+VY,60,H-60):H/2;
  const clear=()=>{for(const g of segs)if(!g.gone)park(g);OBJ=[];GIBS=[];GUTS=[];PROPS=[];MW=[];MWH=null;ARROWS=[];FARROWS=[];FGLANCE=[];ARSTUCK=[];DROPS=[];FILMS=[];CHFX=[];SOLIDS=[];FDROPS=[];STAINS=[];BLOOD.length=0;POOLS.length=0;DECALS.length=0;WALLST.length=0;STREAMS={};if(!V.dead){const gd=OPT.god;OPT.god=false;die('Swallowed by a black hole');OPT.god=gd;}};
  emitSound('rumble');
  if(reduceMotion||!document.body.animate){el.hidden=false;setTimeout(()=>el.classList.add('on'),30);clear();return;}
  emitUI('closeMenu');VOIDA.run=true;const G0=++VOIDA.g;
  const mk=(css)=>{const d=document.createElement('div');d.className='voidFx';d.style.cssText=css;document.body.appendChild(d);return d;};
  const A=(e,k,o)=>{const a=e.animate(k,o);VOIDA.list.push(a);return a;};
  const blk=mk('position:fixed;inset:0;z-index:99');                       // eats every tap until Reset shows
  const bg=mk(`position:fixed;inset:0;background:#000;clip-path:circle(0px at ${sx}px ${sy}px)`);cv.after(bg);
  const far=Math.hypot(Math.max(sx,W-sx),Math.max(sy,H-sy))+20;
  // 1 · the map spirals into the hole
  cv.style.transformOrigin=sx+'px '+sy+'px';
  A(cv,[{transform:'none',filter:'none'},{transform:'rotate(25deg) scale(.85)',filter:'brightness(.8)',offset:.35},{transform:'rotate(260deg) scale(.02)',filter:'brightness(.15) blur(2px)'}],{duration:2300,easing:'cubic-bezier(.5,0,.85,.35)',fill:'forwards'});
  A(bg,[{clipPath:`circle(0px at ${sx}px ${sy}px)`},{clipPath:`circle(${far*0.25}px at ${sx}px ${sy}px)`,offset:.55},{clipPath:`circle(${far}px at ${sx}px ${sy}px)`}],{duration:2300,easing:'ease-in',fill:'forwards'});
  const ring=mk(`position:fixed;z-index:8;left:${sx}px;top:${sy}px;width:90px;height:90px;margin:-45px 0 0 -45px;border-radius:50%;background:radial-gradient(circle,#000 0 52%,rgba(255,200,140,.95) 56%,rgba(255,120,50,.55) 62%,rgba(160,50,20,.18) 74%,transparent 76%);box-shadow:0 0 40px 8px rgba(255,140,60,.25);pointer-events:none;opacity:0`);
  A(ring,[{transform:'scale(.2) rotate(0deg)',opacity:0},{transform:'scale(1) rotate(180deg)',opacity:1,offset:.25},{transform:'scale(1.15) rotate(900deg)',opacity:1}],{duration:6000,delay:1500,fill:'forwards'});
  // the Reset button survives: a stand-in replaces it so the HUD can be torn away around it
  const rb=$('bReset'),rr=rb.getBoundingClientRect();const gh=rb.cloneNode(true);gh.removeAttribute('id');gh.className='voidFx';
  setTimeout(()=>{if(!VOIDA.run||VOIDA.g!==G0)return;clear();
    const rr2=rb.getBoundingClientRect();Object.assign(gh.style,{position:'fixed',left:rr2.left+'px',top:rr2.top+'px',width:rr2.width+'px',height:rr2.height+'px',margin:0,zIndex:101,pointerEvents:'none'});
    const cs=getComputedStyle(rb);for(const k of ['background','color','border','borderRadius','font','padding','letterSpacing','textTransform','boxShadow'])gh.style[k]=cs[k];
    document.body.appendChild(gh);rb.style.visibility='hidden';
    // 2 · then every piece of the UI, nearest first, spaghettified into the hole
    const vis=e=>{if(!e||e.hidden)return false;const r=e.getBoundingClientRect();return r.width>1&&r.height>1&&getComputedStyle(e).visibility!=='hidden';};
    const parts=[];const add=e=>{if(vis(e)&&e!==rb)parts.push(e);};
    $('hud').querySelectorAll('.ident,.btns>button,.vitals>.v,#ecg,#chips').forEach(add);
    $('viewctl').querySelectorAll(':scope>*').forEach(add);
    $('tools').querySelectorAll(':scope>*').forEach(add);
    for(const id of ['log','hint','probe','xbar','traj','modes','fps','chart','ropePanel'])add($(id));
    document.querySelectorAll('body>*').forEach(e=>{if(e.id==='voidOv'||e===cv||e.classList.contains('voidFx')||e.tagName==='SCRIPT'||e.tagName==='STYLE'||parts.includes(e)||['hud','viewctl','tools','splash','scrim','menu','opts'].includes(e.id))return;if(getComputedStyle(e).position==='fixed'||getComputedStyle(e).position==='absolute')add(e);});
    const pc=e=>{const r=e.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2];};
    parts.sort((a,b)=>{const p=pc(a),q=pc(b);return Math.hypot(p[0]-sx,p[1]-sy)-Math.hypot(q[0]-sx,q[1]-sy);});
    const step=Math.max(45,Math.min(110,2600/Math.max(1,parts.length)));
    const fly=(e,delay,dur)=>{const[cx,cy]=pc(e),dx=sx-cx,dy=sy-cy,sp=(dx>0?1:-1)*(540+Math.random()*360),st=Math.atan2(dy,dx)*180/Math.PI;
      const o={duration:dur,delay,easing:'cubic-bezier(.6,0,.95,.45)',fill:'forwards',composite:'add'};
      try{A(e,[{transform:'translate(0px,0px) rotate(0deg) scale(1)'},{transform:`translate(${dx*0.12}px,${dy*0.12}px) rotate(${sp*0.08}deg) scale(1.06,.9)`,offset:.3},{transform:`translate(${dx}px,${dy}px) rotate(${sp}deg) scale(.02)`}],o);}
      catch(_){delete o.composite;A(e,[{transform:'none'},{transform:`translate(${dx}px,${dy}px) rotate(${sp}deg) scale(.02)`}],o);}
      A(e,[{opacity:1,filter:'none'},{opacity:1,filter:'brightness(1.3)',offset:.7},{opacity:0,filter:'brightness(2) blur(1px)'}],{duration:dur,delay,easing:'ease-in',fill:'forwards'});};
    parts.forEach((e,i)=>fly(e,i*step,1100));
    let tEnd=parts.length*step+1100;
    // the panels themselves go last
    for(const id of ['hud','tools','viewctl']){const e=$(id);if(vis(e)){fly(e,tEnd-500,1000);tEnd+=280;}}
    tEnd+=750;
    // the Reset button gets tugged hard but holds on
    const[gx,gy]=pc(gh),tx=(sx-gx)*0.09,ty=(sy-gy)*0.09;
    A(gh,[{transform:'translate(0,0) rotate(0deg)'},{transform:`translate(${tx}px,${ty}px) rotate(-6deg)`,offset:.3},{transform:`translate(${tx*0.5}px,${ty*0.5}px) rotate(4deg)`,offset:.45},{transform:`translate(${tx*1.3}px,${ty*1.3}px) rotate(-9deg)`,offset:.7},{transform:`translate(${tx*0.7}px,${ty*0.7}px) rotate(5deg)`,offset:.85},{transform:`translate(${tx*1.6}px,${ty*1.6}px) rotate(-12deg)`}],{duration:tEnd,easing:'ease-in-out',fill:'forwards'});
    // 3 · the hole collapses; Reset floats to the middle of the void
    setTimeout(()=>{if(!VOIDA.run||VOIDA.g!==G0)return;
      A(ring,[{transform:'scale(1.15) rotate(900deg)',opacity:1},{transform:'scale(1.6) rotate(1000deg)',opacity:1,offset:.25},{transform:'scale(0) rotate(1400deg)',opacity:0}],{duration:900,easing:'ease-in',fill:'forwards'});
      el.hidden=false;el.style.transition='none';el.classList.remove('on');const vr=$('voidReset'),vb=vr.getBoundingClientRect(),g=gh.getBoundingClientRect();
      gh.getAnimations().forEach(a=>a.cancel());const gx0=g.left-rr2.left,gy0=g.top-rr2.top;
      A(gh,[{transform:`translate(${gx0}px,${gy0}px)`},{transform:`translate(${vb.left+vb.width/2-(rr2.left+rr2.width/2)}px,${vb.top+vb.height/2-(rr2.top+rr2.height/2)}px) scale(${vb.height/rr2.height})`}],{duration:1100,delay:500,easing:'cubic-bezier(.3,.7,.2,1)',fill:'forwards'});
      setTimeout(()=>{if(!VOIDA.run||VOIDA.g!==G0)return;el.style.transition='';void el.offsetWidth;el.classList.add('on');vr.style.opacity=0;
        setTimeout(()=>{if(!VOIDA.run||VOIDA.g!==G0)return;vr.style.opacity='';gh.remove();blk.remove();},1700);},1650);
    },tEnd);
  },2300);
}
const VOIDA={run:false,list:[],g:0};
function voidUndo(){VOIDA.run=false;for(const a of VOIDA.list)try{a.cancel();}catch(e){}VOIDA.list=[];document.querySelectorAll('.voidFx').forEach(e=>e.remove());cv.style.transformOrigin='';const rb=$('bReset');if(rb)rb.style.visibility='';const vr=$('voidReset');if(vr)vr.style.opacity='';}
function closeBH(b){if(!b)return;POWFX.push({k:'wave',x:b.x,y:b.y,t:0,life:0.5});POWFX.push({k:'flash',t:0,life:0.2});BHS.splice(BHS.indexOf(b),1);emitSound('pop');emitLog('Black hole closed','info');}
