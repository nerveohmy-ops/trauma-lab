/* TRAUMA_LAB_MAIN */
/* ===== sim/healing.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
/* ---------- super-soldier serum ---------- */
function regenLevel(){const inh=1;const ku=Math.min(2,DR.uls.l)*inh;return{k:Math.max(Math.min(1.5,DR.ser.l)*inh,ku*2.5),ku};}
function serumStep(dt){
  const RL=regenLevel(),k=RL.k,ku=RL.ku;
  if(ku>0.05)ultraStep(dt,ku);
  if(k<0.05||(V.dead&&ku<0.05))return;
  V.blood=Math.min(5000,V.blood+70*k*dt);V.rbc=Math.min(5000,V.rbc+70*k*dt);V.pain=Math.max(0,V.pain-5*k*dt);
  V.rad=Math.max(0,V.rad-0.25*k*dt);
  for(const id in ORG){const o=ORG[id];if(o.hp>=100&&!(id==='brain'&&o.stem<100))continue;if(id==='brain'&&o.hp<=0&&ku<0.05)continue;
    if(o.out&&ku<0.05){if(!serumStep.outSaid){serumStep.outSaid=1;emitLog('The serum heals what is inside him · organs lying outside the body need the ultra serum','info');}continue;}
    if(o.out)continue; // the ultra serum brings it back first
    o.hp=Math.min(100,o.hp+(o.hp<=0?2.5:7)*k*dt);if(id==='brain'&&o.stem!=null&&o.hp>0)o.stem=Math.min(100,o.stem+7*k*dt);if(o.hp>=100){o.hits=[];o.rep=false;}}
  // regenerating tissue pushes lodged arrows back out
  for(let i=ARSTUCK.length-1;i>=0;i--){const S=ARSTUCK[i];if(!S.seg||!S.seg.connected)continue;S.depth-=k*dt*4;if(S.depth<=0.5){ARSTUCK.splice(i,1);if(S.wd)S.wd.plug=false;emitLog((S.k==='crossbow'?'Bolt':'Arrow')+' pushed out of the '+S.seg.label.toLowerCase()+' by the healing tissue','good');}}
  // torn skin and muscle flaps settle back and knit to the wound edges
  for(let i=STRANDS.length-1;i>=0;i--){const st=STRANDS[i];if(!st.seg||!st.seg.connected)continue;st.heal=(st.heal||0)+k*dt;if(st.heal>(st.k==='flap'||st.k==='mflap'?4:3))STRANDS.splice(i,1);}
  // chemicals on the skin are neutralised and the marks fade as new skin grows
  for(const f of FILMS){for(const q of ['sa','hcl','oh','nh3','K','Na'])f[q]*=Math.exp(-k*dt*1.5);}
  for(const q of STAINS)q.a=Math.max(0,q.a-0.08*k*dt);
  for(const b of BONES){if(!b.broken)continue;b.heal=(b.heal||0)+k*dt;if(b.heal>5){b.broken=false;b.hp=Math.max(b.hp,50);b.heal=0;emitLog(b.name+' knitted back together','good');}}
  for(const g of segs){
    if(g.mtear)g.mtear=Math.max(0,g.mtear-0.06*k*dt);
    if(g.dents&&g.dents.length){for(const d of g.dents)d.d*=Math.exp(-0.25*k*dt);g.dents=g.dents.filter(d=>d.d>0.06);g.icache=null;}
    if(g.jawDrop){g.jawDrop*=Math.exp(-0.3*k*dt);if(g.jawDrop<0.02){g.jawDrop=0;g.jawBroken=false;}}
    if(g.ribsBroken>0){g.ribH=(g.ribH||0)+k*dt;if(g.ribH>2){g.ribH=0;g.ribsBroken--;}}
    if(!g.connected)continue;
    for(const v of g.vessels){if(!v.stump&&v.cut>0)v.cut=Math.max(0,v.cut-0.12*k*dt);}
    let removed=false;
    for(let i=g.wounds.length-1;i>=0;i--){const w=g.wounds[i];if(w.plug)continue;
      if(w.type==='stump'){if(ku>0.05)continue;if(!(w.sut>=1)){w.healS=(w.healS||0)+k*dt;if(w.healS>6){w.sutStart=true;w.sut=1;w.graft=true;w.bleed=0;for(const v of g.vessels)if(v.stump)v.lig=true;emitLog(g.label+' stump sealed over','good');}}continue;}
      w.bleed*=Math.pow(0.55,k*dt);
      if(w.type==='hole'){w.r-=0.3*k*dt;if(w.r<0.25){g.wounds.splice(i,1);removed=true;FW=FW.filter(f=>f.ref!==w);continue;}}
      else if(w.type==='cut'){const L=w.len||Math.hypot(w.s2-w.s,w.w2-w.w);const nl=L-1.4*k*dt;if(nl<0.4){g.wounds.splice(i,1);removed=true;FW=FW.filter(f=>f.ref!==w);continue;}const f=nl/L,ms=(w.s+w.s2)/2,mw=(w.w+w.w2)/2;w.s=ms+(w.s-ms)*f;w.s2=ms+(w.s2-ms)*f;w.w=mw+(w.w-mw)*f;w.w2=mw+(w.w2-mw)*f;w.len=nl;}
      else if(w.type==='burn'||w.type==='bruise'){w.r-=0.6*k*dt;if(w.heat!=null){w.heat=Math.max(0,w.heat-3*k*dt);w.deg=w.heat<6?1:w.heat<18?2:3;}if(w.r<0.3){g.wounds.splice(i,1);continue;}}
    }
    if(g.hasBite)g.hasBite=g.wounds.some(isBite);
    if(!g.wounds.some(w=>w.type==='hole'))g.tracks=g.tracks.filter(()=>Math.random()>k*dt*0.3);
    g.fireT=0;
  }
  for(let i=LODGED.length-1;i>=0;i--){const L=LODGED[i];L.push=(L.push||0)+k*dt;if(L.push>4){LODGED.splice(i,1);const p=toWorld(L.seg,L.s,L.w);FX.push({k:'spark',x:p.x,y:p.y,t:0,life:0.2});emitLog('The body pushed out a '+bulletName(L),'good');}}
  if(V.arrest&&!V.dead&&ORG.heart.hp>50&&V.blood>3000&&SEG.head.connected&&ORG.brain.hp>20){V.arrest=false;V.hr=110;V.phase=0;V.lowSpT=0;emitLog('Serum restarted the heart','good');}
}
let REGROW=null,CUTN=0,FRACQ=[];
// split limbs at fresh fractures so they bend there; join them again once the bone has healed
function fracStep(){
  while(FRACQ.length){const b=FRACQ.shift(),g=b.seg;if(!g||segs[g.idx]!==g||!g.connected||!b.broken||!b.pts)continue;
    const cs=lerp(b.pts[0][0],b.pts[b.pts.length-1][0],b.bp);
    if(cutLimbAt(g,cs,[],'frac'))emitLog(b.name.replace(/x\d+$/,'')+' snapped · the '+g.label.toLowerCase()+' now bends at the break','bad');}
  for(const j of joints){if(j.key!=='frac'||j.broken)continue;const p=segs[j.p],c=segs[j.c];if(!p||!c)continue;
    if(p.bones.some(b=>b.broken&&b.limb)||c.bones.some(b=>b.broken&&b.limb))continue;
    const i=joints.indexOf(j);joints.splice(i,1);weldPart(p,c);mergePart(p,c);emitLog('Bone set · the '+p.label.toLowerCase()+' is straight again','good');return;}
}
// ---------- open (compound) fractures ----------
// A broken limb that bends at the break forms a V; the jagged fragment ends sit at the apex and push out through the
// soft tissue on the convex side. Fragment tip travel δ = ℓ·sin θ (ℓ = spike length of the oblique break, θ = angulation).
// About half the soft tissue cover is pushed aside, the rest tents the skin over a ≈0.8 cm contact: tent strain
// ε = √(1+(h/a)²) − 1. Skin is J-shaped (Fung): σ = 0.05·(e^{10ε} − 1) MPa, ×1.5 stress concentration at the sharp tip,
// stiffer when loaded fast (viscoelastic). Skin tears at ≈20 MPa (human skin UTS 5–30 MPa). Soft tissue cover is
// anatomical: the front of the tibia and the back of the ulna are right under the skin (most open fractures happen
// there), the femur is wrapped in thick muscle and only breaks through at big angulation.
const SOFT={Tib:[0.5,4],Fem:[4.5,5.5],Hum:[2.5,2],Rad:[1.5,0.6]};
function fracInfo(j){const p=segs[j.p],c=segs[j.c];if(!p||!c||!p.connected||!c.connected)return null;
  const bo=p.bones.find(b=>b.limb&&!b.minor&&b.pts)||c.bones.find(b=>b.limb&&!b.minor&&b.pts);if(!bo)return null;
  const key=Object.keys(SOFT).find(k=>bo.id.includes(k));if(!key)return null;
  if(j.spike==null){j.spike=rnd(1,3)*(key==='Fem'?1.3:1);j.disp=rnd(0,0.5);}
  const A=P[p.a],B=P[p.b],C=P[c.a],D=P[c.b];const dl=dirLocal(p,D.x-C.x,D.y-C.y);const th=Math.atan2(dl.w,dl.s);
  const side=th>=0?-1:1,t=SOFT[key][side>0?0:1];const d=j.spike*Math.abs(Math.sin(th))+j.disp*Math.min(1,Math.abs(th)/0.2);
  const h=Math.max(0,d-0.5*t),a=0.8,eps=Math.sqrt(1+(h/a)*(h/a))-1;
  return{p,c,bo,key,th,side,t,d,h,eps,out:Math.max(0,d-t)};}
function openFracStep(dt){
  if(dt<=0)return;
  for(const j of joints){if(j.key!=='frac'||j.broken)continue;const f=fracInfo(j);if(!f)continue;
    const om=Math.abs(f.th-(j.th0??f.th))/dt;j.th0=f.th;j.om=lerp(j.om||0,om,0.3);
    const sig=1.5*0.05*(Math.exp(10*f.eps)-1)*(1+0.25*Math.min(1,j.om/6));j.sig=Math.min(sig,99);j.eps=f.eps;j.fi=f;
    if(j.openW)continue;
    if(sig>8&&!j.tentLog){j.tentLog=1;emitLog('Bone tenting the skin over the '+f.bo.name.replace(/^(Left|Right) /,m=>m.toLowerCase()).replace(/x\d+$/,'')+' · strain '+Math.round(f.eps*100)+'% · keep the limb straight','bad');}
    if(sig>=20){
      const p=f.p,s0=Math.max(0.5,p.len-0.6),R=radS(p,s0)||p.rb,rep=[];
      const w=addWound(p,{type:'hole',s:s0,w:f.side*R*0.78,r:0.5+0.22*j.spike,bleed:f.key==='Fem'?0.8:0.4,exit:true,dw:f.side,ds:0.2,z:p.side==='far'?-0.2:0.2,boneOut:j});
      j.openW=w;
      for(const g of [p,f.c])for(const v of g.vessels){if(v.cut>=0.95||v.stump)continue;const se=g===p?p.len:0;let best=null;for(const q of v.pts)if(best==null||Math.abs(q[0]-se)<Math.abs(best[0]-se))best=q;
        if(!best||Math.abs(best[0]-se)>6)continue;const bw=f.bo.pts[0][1];if(Math.sign(best[1]-bw)===f.side&&Math.abs(best[1]-bw)<f.d+0.4&&Math.random()<0.4)cutVessel(v,0.5,{s:best[0],w:best[1],dw:f.side,ds:0},rep);}
      hurt(p,s0,f.side*R*0.8,30);
      {const q=toWorld(p,s0,f.side*R);const dw=dirWorld(p,f.side,0.3);mist(q.x,q.y,dw.x,dw.y,6,90,1.2,0.5);}
      emitLog('Open fracture · the '+f.bo.name.toLowerCase().replace(/x\d+$/,'')+' broke through the skin ('+Math.round(Math.abs(f.th)*57.3)+'° bend · skin stretched '+Math.round(Math.min(f.eps,Math.log(20/(0.075*(1+0.25*Math.min(1,j.om/6)))+1)/10)*100)+'% and tore past its ≈20 MPa limit)'+(rep.length?' · '+rep.join(', '):''),'bad');}
  }
}
function endRegrow(){if(!REGROW)return;for(const g of REGROW.list){delete g.growF;delete g.gb;delete g.gm;delete g.gs;delete g.g0;}REGROW=null;}
// ultra serum: organs and intestines lying outside are drawn back into the body and reconnected
function ultraOrgans(dt,ku){const sp=Math.max(0.6,ku);
  for(let i=GIBS.length-1;i>=0;i--){const g=GIBS[i];if(g.type!=='organ'||!g.org)continue;const o=g.org;if(!o.seg||!o.seg.connected||o.seg.gone)continue;
    const tgt=toWorld(o.seg,o.s,o.w);if(!g.ret){g.ret=0.001;emitLog('Ultra serum · the '+o.name.toLowerCase()+' is being drawn back into the body','good');}
    g.ret+=dt*sp;g.teth=null;g.rest=false;g.stick=1;g.vx=g.vy=0;g.av=0;const kk=Math.min(1,dt*2.2*sp);g.x=lerp(g.x,tgt.x,kk);g.y=lerp(g.y,tgt.y,kk);g.ang*=1-kk;
    if(Math.random()<dt*20&&BLOOD.length<GQ().b)BLOOD.push({x:g.x+rnd(-1,1),y:g.y+rnd(-1,1),vx:(tgt.x-g.x)*2,vy:(tgt.y-g.y)*2,r:rnd(0.2,0.35),life:0.5});
    if(Math.hypot(g.x-tgt.x,g.y-tgt.y)<1.2||g.ret>3.5){GIBS.splice(i,1);o.out=0;o.hp=Math.max(o.hp,25);o.rep=false;o.seg.icache=null;
      if(o.id==='heart'&&V.arrest&&!V.dead&&V.blood>3000){V.arrest=false;V.hr=110;V.phase=0;}emitLog(o.name+' back in place · reconnecting and healing','good');}}
  for(let i=GUTS.length-1;i>=0;i--){const G_=GUTS[i],pts=G_.pts;G_.grow=0;G_.reeling=1;
    if(!G_.saidR){G_.saidR=1;emitLog('Ultra serum · the intestines are sliding back inside','good');}
    const A=G_.anchor&&G_.anchor.seg&&G_.anchor.seg.connected?toWorld(G_.anchor.seg,G_.anchor.s,G_.anchor.w):toWorld(SEG.abd,SEG.abd.len*0.6,0),kk=Math.min(1,dt*1.5*sp);
    for(const p of pts){p.x=lerp(p.x,A.x,kk*0.35);p.y=lerp(p.y,A.y,kk*0.35);p.px=lerp(p.px,p.x,0.5);p.py=lerp(p.py,p.y,0.5);}
    G_.reel=(G_.reel||0)+dt*sp*14;while(G_.reel>=1&&pts.length>1){G_.reel-=1;pts.splice(G_.anchor?1:0,1);}
    if(pts.length<=2){GUTS.splice(i,1);const o=ORG.intest;if(o){o.out=GUTS.length?Math.max(0,(o.out||0)-0.35):0;o.rep=false;if(!o.out){o.hp=Math.max(o.hp,25);emitLog('Intestines back inside · the belly wall closes over them','good');}}}}
  // an organ that was lost entirely (nothing left lying outside) regrows in place
  for(const id in ORG){const o=ORG[id];if(!o.out||!o.seg||!o.seg.connected)continue;if(id==='intest'?GUTS.length:GIBS.some(g=>g.org===o))continue;o.out=0;o.hp=Math.max(o.hp,10);o.rep=false;o.seg.icache=null;emitLog('Ultra serum · a new '+o.name.toLowerCase()+' is growing in place','good');}
  // films and stains wash out
  for(const f of FILMS){for(const q of ['sa','hcl','oh','nh3','K','Na','et'])f[q]=0;}
  for(const q of STAINS)q.a=Math.max(0,q.a-0.3*dt*sp);
}
function ultraStep(dt,ku){
  ultraOrgans(dt,ku);
  // bring the dead back once the body can hold life again
  if(V.dead){
    ORG.brain.hp=Math.min(100,ORG.brain.hp+10*ku*dt);ORG.brain.stem=Math.min(100,(ORG.brain.stem??0)+12*ku*dt);
    if(ORG.brain.hp>45&&(ORG.brain.stem??100)>50&&!ORG.heart.out&&ORG.heart.hp>50&&V.blood>3200&&SEG.head.connected&&SEG.neck.connected&&!BN('cervical').broken&&ORG.trachea.hp>40){
      V.dead=false;V.bd=false;V.stemHit=0;V.arrest=false;V.hr=90;V.phase=0;V.lowSpT=0;V.brainO2=0.5;V.spo2=Math.max(V.spo2,85);V.ko=3;V.fear=1;V.start=T;
      emitLog('He is alive again · the ultra serum restarted his heart and brain','good');FX.push({k:'shock',x:view!=='side'?0:P[SEG.chest.a].x,y:view!=='side'?-128:P[SEG.chest.a].y,t:0,life:0.6});}
  }
  if(!V.dead&&SEG.head.connected)V.ko=Math.min(V.ko,1);
  // regrow lost body parts one at a time
  if(REGROW){const G=REGROW;G.p=Math.min(1,G.p+dt*Math.max(0.6,ku)*0.17);
    for(const [k,key] of [[0,'gb'],[1,'gm'],[2,'gs']]){let acc=clamp(G.p*3-k,0,1)*G.total;for(const g of G.list){const gl=Math.max(0.01,g.len-(g.g0||0));g[key]=clamp(acc/gl,0,1);acc-=gl;}}
    for(const g of G.list)g.growF=g.gs;
    const ph=G.p<1/3?0:G.p<2/3?1:2;if(ph!==G.ph){G.ph=ph;if(ph===1)emitLog('Skeleton formed · muscle is wrapping the new bone','good');else if(ph===2)emitLog('Muscle complete · skin and fat closing over','good');}
    if(G.p>=1){emitLog(G.name+' fully regrown','good');for(const g of G.list)g.icache=null;endRegrow();}
    return;}
  if(T-(ultraStep.t||-9)<0.2)return;ultraStep.t=T;
  for(const j of joints){if(!j.broken)continue;const c=segs[j.c],p=segs[j.p];if(!p.connected||c.connected)continue;startRegrow(c,'joint',j);return;}
  {let best=null;for(const n of segs){if(!n.part||n.connected||n.from==null||n.from<0)continue;const o=segs[n.from];if(!o||!o.connected)continue;if(!best||(n.off||0)<(best.off||0))best=n;}
    if(best){startRegrow(best,'weld',segs[best.from]);return;}}
  for(const g of segs)if(BN&&g.bones)for(const b of g.bones)if(b.broken){b.broken=false;b.hp=Math.max(b.hp,60);}
}
function startRegrow(c,kind,x){
  const old=P[c.a];FX.push({k:'ring',x:old.x,y:old.y,t:0,life:0.6});
  for(let i=0;i<14&&BLOOD.length<GQ().b;i++){const a=rnd(0,6.28),sp=rnd(30,120);BLOOD.push({x:old.x,y:old.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-60,r:rnd(0.2,0.4),life:2});}
  for(const g of distalOf(c)){if(g.gone||g.dust!=null){unpark(g);}}
  const name=c.label.replace(' (cut off)','');let g0=0;
  if(kind==='joint'){reattachAlign(x);reattachFinish(x);}else{weldPart(x,c);g0=x.len;c=mergePart(x,c);}
  const list=distalOf(c);let total=0;for(const g of list){g.g0=g===c?g0:0;g.mtear=0;g.spat=[];g.dents=[];g.growF=0;g.gb=0;g.gm=0;g.gs=0;total+=g.len-g.g0;g.icache=null;for(const w of g.wounds)w.bleed=0;g.wounds=g.wounds.filter(w=>w.type!=='stump');for(const v of g.vessels)if(!v.stump){v.cut=0;v.lig=false;}}
  REGROW={list,total:Math.max(1,total),p:0,ph:0,name};
  emitLog('Regrowing the '+REGROW.name.toLowerCase()+' · bone first, then muscle, then skin','good');
}
function weldPart(o,n){
  const sub=distalOf(n);const A=P[o.a],B=P[o.b],na=P[n.a],nb=P[n.b];
  const rot=Math.atan2(B.y-A.y,B.x-A.x)-Math.atan2(nb.y-na.y,nb.x-na.x);const cs=Math.cos(rot),sn=Math.sin(rot),cx=na.x,cy=na.y;
  const ids=new Set();for(const g of sub){ids.add(g.a);ids.add(g.b);}
  for(const i of ids){const pp=P[i];const dx=pp.x-cx,dy=pp.y-cy;pp.x=B.x+dx*cs-dy*sn;pp.y=B.y+dx*sn+dy*cs;pp.px=pp.x;pp.py=pp.y;}
  const j={p:o.idx,c:n.idx,t:1,end:'a',key:'weld',rest:0,min:-0.06,max:0.06,broken:false,wf:3,wp:0,chop:0,stump:o.joint?o.joint.stump:6,arm:o.joint?o.joint.arm:undefined,leg:o.joint?o.joint.leg:undefined};
  joints.push(j);n.joint=j;n.label=o.label;n.part=false;n.detT=0;
  o.wounds=o.wounds.filter(w=>!(w.type==='stump'&&w.s>o.len-3));n.wounds=n.wounds.filter(w=>!(w.type==='stump'&&w.s<3));
  for(const v of o.vessels)if(!v.stump&&v.cut>0){v.cut=0;v.lig=false;v.clamp=false;}
  const fp=FP.find(q=>q.id===o.id);if(fp&&fp.o){fp.x2=fp.o.x2;fp.y2=fp.o.y2;fp.r2=fp.o.r2;fp.cut=false;}
  updateConnected();
}
// fold a welded cut piece back into the segment it came from, so repeated cuts never pile up extra parts
function mergePart(o,n){
  const L0=o.len,sh=s_=>s_+L0,oldB=o.b,na=n.a,k=n.idx;
  for(const r of ROPES)for(const E of [r.a,r.b]){if(E.k!=='seg')continue;if(E.seg===n){E.seg=o;E.t=(L0+E.t*n.len)/(L0+n.len);}else if(E.seg===o)E.t=E.t*L0/(L0+n.len);}
  o.len=L0+n.len;o.rb=n.rb;o.mass+=n.mass;o.b=n.b;if(o.fullL!=null&&o.len>=o.fullL-0.05)o.fullL=null;
  const A=P[o.a],B=P[o.b];A.m=o.mass/2;A.im=1/A.m;B.m=o.mass/2;B.im=1/B.m;B.seg=o.idx;B.end='b';
  for(let i=joints.length-1;i>=0;i--){const j=joints[i];if(j.c===k){joints.splice(i,1);continue;}if(j.p===k){j.p=o.idx;j.t=clamp((L0+j.t*n.len)/o.len,0,1);}}
  const baseOf=id=>id.replace(/x\d+$/,'');
  for(const v of n.vessels){const b=o.vessels.find(q=>q.id===baseOf(v.id)&&!q.stump);const pts=v.pts.map(p=>[sh(p[0]),p[1]]);
    if(b){const l=b.pts[b.pts.length-1];b.pts=b.pts.concat(Math.abs(l[0]-pts[0][0])<0.05?pts.slice(1):pts);b.cut=0;b.lig=false;b.clamp=false;const i=VESSELS.indexOf(v);if(i>=0)VESSELS.splice(i,1);}
    else{v.pts=pts;v.seg=o;v.cut=0;if(v.at)v.at.s=sh(v.at.s);o.vessels.push(v);}}
  for(const bo of n.bones){const b=o.bones.find(q=>q.id===baseOf(bo.id)&&q.shape==='line');const pts=bo.pts?bo.pts.map(p=>[sh(p[0]),p[1]]):null;
    if(b&&pts){const l=b.pts[b.pts.length-1];b.pts=b.pts.concat(Math.abs(l[0]-pts[0][0])<0.05?pts.slice(1):pts);if(bo.plates)b.plates=(b.plates||[]).concat(bo.plates.map(q=>({s:q.s+L0,w:q.w,t:q.t})));const i=BONES.indexOf(bo);if(i>=0)BONES.splice(i,1);}
    else{if(pts){bo.pts=pts;bo.off=(bo.off||0)-L0;}bo.seg=o;o.bones.push(bo);}}
  for(const wd of n.wounds){wd.s=sh(wd.s);if(wd.s2!=null)wd.s2=sh(wd.s2);wd.streaks=[];o.wounds.push(wd);}
  for(const fw of FW)if(fw.seg===n)fw.seg=o;
  for(const t of n.tracks){t.s1=sh(t.s1);t.s2=sh(t.s2);o.tracks.push(t);}
  for(const m of n.muscles){m.s=sh(m.s);o.muscles.push(m);}
  for(const q of n.capil){q.pts=q.pts.map(p=>[sh(p[0]),p[1]]);o.capil.push(q);}
  for(const q of n.nerves){o.nerves.push({pts:q.pts.map(p=>[sh(p[0]),p[1]]),w:q.w});}
  if(n.amarks)for(const q of n.amarks){q.s=sh(q.s);(o.amarks||(o.amarks=[])).push(q);}
  if(n.wraps)for(const q of n.wraps){q.s0=sh(q.s0);q.s1=sh(q.s1);(o.wraps||(o.wraps=[])).push(q);}
  if(n.tq!=null&&o.tq==null){o.tq=sh(n.tq);o.tqV=n.tqV||[];}
  if(n.radSkin)o.radSkin=Math.max(o.radSkin||0,n.radSkin);
  if(n.spat)for(const q of n.spat){q.s=sh(q.s);(o.spat||(o.spat=[])).push(q);}
  const mv=q=>{if(q&&q.seg===n){q.seg=o;if(q.s!=null)q.s=sh(q.s);}};
  for(const K of KNIVES){mv(K);if(K.ins)mv(K.ins);}if(V.clutch)mv(V.clutch);if(HK&&HK.ins)mv(HK.ins);for(const q of LODGED)mv(q);for(const t of TRAJ)for(const q of t.pts)mv(q);for(const b of BUL)if(b.trk)for(const q of b.trk.pts)mv(q);
  for(const ob of OBJ)if(ob.att&&ob.att.seg===n){ob.att.seg=o;ob.att.s=sh(ob.att.s);}
  if(OP&&(OP.seg===n))OP=null;if(grab&&grab.seg===n)grab=null;if(typeof drag!=='undefined'&&drag&&drag.seg===n)drag=null;if(HK&&HK.seg===n)HK.seg=o;
  o.icache=null;o.hasBite=o.hasBite||n.hasBite;
  removeSeg(n,o);compactP([na,oldB]);updateConnected();
  return o;
}
function removeSeg(n,o){if(!o)o={idx:-1};
  const k=segs.indexOf(n);if(k<0)return;segs.splice(k,1);segs.forEach((g,i)=>g.idx=i);
  for(let i=joints.length-1;i>=0;i--){const j=joints[i];if(j.p===k||j.c===k){joints.splice(i,1);continue;}if(j.p>k)j.p--;if(j.c>k)j.c--;}
  const fix=v=>v===k?o.idx:v>k?v-1:v;
  for(const p of P)p.seg=fix(p.seg);
  for(const g of segs)if(g.from!=null)g.from=g.from===k?o.idx:g.from>k?g.from-1:g.from;
  for(const f of FLAMES)if(f.self!=null&&f.self!==false&&f.self!==true)f.self=fix(f.self);
  const oi=ORDER.indexOf(n);if(oi>=0)ORDER.splice(oi,1);if(SEG[n.id]===n)delete SEG[n.id];
  for(const v of n.vessels){const i=VESSELS.indexOf(v);if(i>=0&&v.seg===n)VESSELS.splice(i,1);}
  for(const b of n.bones){const i=BONES.indexOf(b);if(i>=0&&b.seg===n)BONES.splice(i,1);}
}
function compactP(drop){
  const dr=new Set(drop),map=new Array(P.length),NP=[];
  for(let i=0;i<P.length;i++){if(dr.has(i)){map[i]=-1;continue;}map[i]=NP.length;NP.push(P[i]);}
  P.length=0;for(const p of NP)P.push(p);
  for(const g of segs){g.a=map[g.a];g.b=map[g.b];}
}
/* ---------- transplant ---------- */
function transplant(w){
  if(OP){emitLog('Surgery in progress','info');return;}
  if(V.dead){emitLog('Too late · there is no circulation to save','info');return;}
  // reattach a severed limb: tap the stump or the loose limb
  let best=null,bd=Math.max(14,40/VS);
  for(const j of joints){if(!j.broken)continue;const c=segs[j.c],p=segs[j.p];if(!p.connected||c.connected||c.part)continue;
    let pt;if(view==='side'){const A=P[p.a],B=P[p.b];pt={x:lerp(A.x,B.x,j.t),y:lerp(A.y,B.y,j.t)};const C=P[c.a],D=P[c.b];const q=dps(w.x,w.y,C.x,C.y,D.x,D.y);if(q.d-rad(c,q.t)<bd&&q.d-rad(c,q.t)<Math.hypot(pt.x-w.x,pt.y-w.y)){bd=Math.max(0,q.d-rad(c,q.t));best=j;continue;}}
    else{const f=FP.find(q=>q.id===c.id);if(!f)continue;pt=f.t==='cap'?{x:f.x1,y:f.y1}:{x:f.cx,y:f.cy};}
    const d=Math.hypot(pt.x-w.x,pt.y-w.y);if(d<bd){bd=d;best=j;}}
  if(best){const c=segs[best.c];
    if(c.detT>240){emitLog('The '+c.label.toLowerCase()+' has been off too long · the tissue is dead','info');return;}
    reattachAlign(best);const p=segs[best.p];
    OP={kind:'transplant',seg:p,tasks:[{k:'bone',d:2},{k:'reattach',j:best,d:3.5}],i:0,t:0,x:w.x,y:w.y,s:best.t*p.len,w:0,v:view};
    painCheck(p,'Reattaching the '+c.label.toLowerCase());return;}
  const b=bodyAtOrg(w);if(!b){emitLog('Tap a body part, a stump or a cut-off limb','info');return;}
  const seg=b.seg;if(!seg.connected){emitLog(seg.part?'That piece was cut through mid-limb and cannot be reattached':'That part cannot be reattached','info');return;}
  const org=seg.organs.filter(o=>o.hp<75&&o.id!=='eye').sort((a,c)=>a.hp-c.hp)[0];
  if(org&&org.id==='brain'){emitLog('A brain cannot be transplanted','info');return;}
  if(org){const site=opSite(seg,org.s,org.w,Math.min(7,Math.max(4,org.rs*0.9)),org.id==='kidneyL'||org.id==='kidneyR'?-1:1,org.id);
    OP={kind:'transplant',seg,tasks:[{k:'open',d:1.2},{k:'explant',o:org,d:2.2},{k:'implant',o:org,d:2.8},{k:'close',d:1.4,wd:site.inc}],i:0,t:0,x:site.x,y:site.y,s:site.s,w:site.w,v:view,inc:site.inc,hl:site.hl};
    painCheck(seg,'Transplant · replacing the '+org.name.toLowerCase()+' ('+Math.round(org.hp)+'%) with a donor organ');return;}
  if(V.rad>2&&!V.marrow){OP={kind:'transplant',seg,tasks:[{k:'marrow',d:3}],i:0,t:0,x:w.x,y:w.y,s:b.s,w:b.w,v:view};emitLog('Bone marrow transplant · infusing donor stem cells','good');return;}
  emitLog('Nothing to transplant in the '+seg.label.toLowerCase()+' · organs there are working','info');
}
function reattachAlign(j){
  const p=segs[j.p],c=segs[j.c];const sub=distalOf(c);
  const A=P[p.a],B=P[p.b],q={x:lerp(A.x,B.x,j.t),y:lerp(A.y,B.y,j.t)};
  const ce=P[j.end==='a'?c.a:c.b],co=P[j.end==='a'?c.b:c.a];
  const pr=p.rest,cr=c.rest;const rp=Math.atan2(pr.by-pr.ay,pr.bx-pr.ax);
  const rc=j.end==='a'?Math.atan2(cr.by-cr.ay,cr.bx-cr.ax):Math.atan2(cr.ay-cr.by,cr.ax-cr.bx);
  const tgt=Math.atan2(B.y-A.y,B.x-A.x)+(rc-rp);const rot=tgt-Math.atan2(co.y-ce.y,co.x-ce.x);
  const cx=ce.x,cy=ce.y,cs=Math.cos(rot),sn=Math.sin(rot);const ids=new Set();for(const g of sub){ids.add(g.a);ids.add(g.b);}
  for(const i of ids){const pp=P[i];const dx=pp.x-cx,dy=pp.y-cy;pp.x=q.x+dx*cs-dy*sn;pp.y=q.y+dx*sn+dy*cs;pp.px=pp.x;pp.py=pp.y;}
  for(const g of sub)g.detT=0;
  j.broken=false;j.chop=0;updateConnected();
}
function reattachFinish(j){
  const p=segs[j.p],c=segs[j.c];const ps=j.t*p.len,ce=j.end==='a'?0:c.len;
  p.wounds=p.wounds.filter(w=>!(w.type==='stump'&&Math.abs(w.s-ps)<3));c.wounds=c.wounds.filter(w=>!(w.type==='stump'&&Math.abs(w.s-ce)<3));
  for(const v of p.vessels.filter(v=>v.stump&&v.id==='stump'+c.id)){p.vessels.splice(p.vessels.indexOf(v),1);const i=VESSELS.indexOf(v);if(i>=0)VESSELS.splice(i,1);}
  for(const g of distalOf(c))for(const v of g.vessels){if(!v.stump){v.cut=0;v.lig=false;v.clamp=false;}}
  const rr=rad(c,j.end==='a'?0:1);const s0=j.end==='a'?1.2:c.len-1.2;
  const scar=addWound(c,{type:'cut',s:s0,w:-rr*0.95,s2:s0,w2:rr*0.95,r:0.3,len:rr*1.9,bleed:0.1,dw:0,ds:0,z:0.9});scar.sutStart=true;scar.sut=1;
  updateConnected();
}
