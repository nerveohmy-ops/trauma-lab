/* TRAUMA_LAB_MAIN */
/* ===== sim/wounds.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
let FSHOT=null;
function vesselSpan(v){let a=1e9,b=-1e9;for(const p of v.pts){a=Math.min(a,p[0]);b=Math.max(b,p[0]);}return[a,b];}
function boneCross(bo,a,b,pad){if(bo.shape==='line')return polyHit(bo.pts,a,b,bo.width/2+pad);return ellHit(bo,a,b,0);}
function addWound(seg,wd){wd.age=0;wd.blood=0;wd.band=false;wd.rot=rnd(0,6.28);wd.streaks=[];if(wd.z==null)wd.z=seg.side==='far'?-0.85:0.85;
  if(wd.exit||wd.type==='stump'){wd.jag=[];const n=wd.type==='stump'?14:9;for(let i=0;i<n;i++)wd.jag.push(wd.type==='stump'?rnd(0.85,1.12):(i%2?rnd(0.55,0.75):rnd(0.95,1.3)));}
  if(wd.type==='stump'&&TEAR){wd.torn=1;seg.wounds.push(wd);addStrands(seg,wd,5,3.5);seg.wounds.pop();}
  seg.wounds.push(wd);if(seg.wounds.length>60)pruneWound(seg,wd);return wd;}
// when a body part has too many wounds, drop the least visible one (an old bruise or the smallest untreated nick), never the big craters
function pruneWound(seg,keep){let bi=-1,bv=1e9;seg.wounds.forEach((w,i)=>{if(w===keep||w.type==='stump')return;const tr=w.sut>0||w.band||w.wrapped||w.pack||w.graft;let v=w.type==='bruise'?-100+w.age*-0.01:(w.r||1)*(w.type==='cut'?(w.len||2):3)+(tr?50:0)+(isBite(w)?200:0);if(v<bv){bv=v;bi=i;}});if(bi>=0)seg.wounds.splice(bi,1);}
function digHole(seg,wd){
  for(const o of seg.wounds){
    if(o.type!=='hole'||o.sutStart)continue;
    // pellet holes join only where they actually touch on the skin: the side view's s and w say nothing about how far
    // across the body (z) each one went in, and two pellets 20 cm apart across the back used to merge into one crater
    if(wd.pel&&(Math.abs((o.z??0)-(wd.z??0))*radS(seg,o.s)>o.r+wd.r||Math.hypot(o.w-wd.w,o.s-wd.s)>o.r+wd.r+0.1))continue;
    if(Math.hypot(o.w-wd.w,o.s-wd.s)<Math.max(o.r,wd.r)+0.7){
      const lim=LIMBK.includes(seg.kind)?radS(seg,o.s)*1.4:9;
      o.r=Math.min(lim,Math.sqrt(o.r*o.r+wd.r*wd.r*1.6)+0.12);o.dig=(o.dig||0)+1;o.bleed=Math.min(6,o.bleed+wd.bleed*0.5);
      const mv=0.35*wd.r*wd.r/(o.r*o.r+wd.r*wd.r);o.w=lerp(o.w,wd.w,mv);o.s=lerp(o.s,wd.s,mv);o.nOut=(o.nOut??(o.exit?1:0))+(wd.exit?1:0);o.nIn=(o.nIn??(o.exit?0:1))+(wd.exit?0:1);o.exit=o.nOut>o.nIn;
      if(!o.jag||o.jag.length<12){o.jag=[];for(let i=0;i<12;i++)o.jag.push(rnd(0.78,1.18));}else for(let i=0;i<o.jag.length;i++)o.jag[i]=clamp(o.jag[i]+rnd(-0.07,0.07),0.65,1.3);
      o.band=false;if(o.r>=1.2)seg.hasBite=true;
      if(throughAndThrough(seg,o))return o;
      if(Math.random()<0.55){const p=toWorld(seg,o.s,o.w),d=dirWorld(seg,-(wd.dw||0),-(wd.ds||0));spawnGibs(p.x,p.y,-d.x||rnd(-1,1),-d.y||-1,1,Math.random()<0.15?'bone':'flesh',150);}
      return o;
    }
  }
  return addWound(seg,wd);
}
// when repeated hits have dug a crater across the whole width of the neck or a limb, nothing is left to carry the part
// below it: the spine or the long bone is gone with the muscle around it, and a strip of skin cannot hold a 5 kg head or
// a 10 kg leg. The part comes off there (the neck: decapitation, which is brain death)
function throughAndThrough(seg,o){
  if(seg.kind!=='neck'&&!LIMBK.includes(seg.kind))return false;if(seg.gone||seg.growF!=null)return false;
  // craters dug in from both sides (entries on one, exits on the other) meet in the middle: the part is gone when the
  // craters at this height together cover the width except a thin strip of skin at the edge (15% of the radius)
  const rr=radS(seg,clamp(o.s,0,seg.len))||seg.ra,iv=[];
  for(const w of seg.wounds){if(w.type!=='hole'||!(w.dig||w.exit)||w.r<1.2||Math.abs(w.s-o.s)>Math.max(w.r,o.r)*0.6)continue;iv.push([w.w-w.r,w.w+w.r]);}
  iv.sort((x,y)=>x[0]-y[0]);let reach=-rr*0.85;for(const [a0,a1] of iv){if(a0>reach)break;reach=Math.max(reach,a1);}
  if(reach<rr*0.85)return false;
  const rep=[];TEAR=1;
  try{if(seg.kind==='neck'){const h=SEG.head;if(!h||!h.joint||h.joint.broken)return false;sever(h.joint,rep);emitLog('Neck shot through · the head came off','bad');}
    else{const cs=clamp(o.s,0,seg.len);if(!cutLimbAt(seg,cs,rep)){const j=seg.joint;if(!j||j.broken)return false;sever(j,rep);}emitLog(cap1(seg.label.toLowerCase().replace(' (cut off)',''))+' shot off · nothing left to hold it','bad');}}
  finally{TEAR=0;}
  return true;}
function woundCenter(wd){return wd.type==='cut'?{w:(wd.w+wd.w2)/2,s:(wd.s+wd.s2)/2}:{w:wd.w,s:wd.s};}
function orgMark(o,kind,w1,s1,w2,s2,z){const fa=FSHOT?{x:FSHOT.x,y:FSHOT.y}:frontAbs(o.seg,s1,z);const q={fx:fa.x,fy:fa.y,k:kind,x1:clamp((w1-o.w)/o.rw,-1.1,1.1),y1:clamp((s1-o.s)/o.rs,-1.1,1.1),x2:clamp(((w2??w1)-o.w)/o.rw,-1.1,1.1),y2:clamp(((s2??s1)-o.s)/o.rs,-1.1,1.1),z:z??0};(o.marks||(o.marks=[])).push(q);if(o.marks.length>14)o.marks.shift();}
function stemDmg(o,d,rep){if(o.id!=='brain'||!(o.stem>0))return;o.stem=Math.max(0,o.stem-d);if(d>4)rep.push(o.stem<=0?'Brainstem destroyed':'Brainstem injured');
  if(o.stem<=0&&!V.dead&&o.seg.connected){V.stemHit=1;brainDeath('Brainstem destroyed');}}
function dmgOrgan(o,d,rep,verb,noStem){
  if(o.id==='brain'&&o.stem==null)o.stem=100;
  if(o.id==='brain'&&!noStem)stemDmg(o,d*(o.hp-d<=0?0.55:0.3),rep);
  if(o.hp<=0)return;o.hp=Math.max(0,o.hp-d);o.rep=false;
  rep.push(o.name+' '+(o.hp<=0?'destroyed':verb));if(verb==='contused')o.contused=true;else o.pierced=true;
  if(o.id==='brain'&&o.hp<=0&&!V.dead&&o.seg.connected)brainDeath('Brain destroyed');
}
function boneHitAt(bo,a,b,z){
  // where along a path a->b the bone is struck (segment-local s,w)
  let best=null,bd=1e9;for(let i=0;i<=24;i++){const t=i/24,q={s:lerp(a.s,b.s,t),w:lerp(a.w,b.w,t)};let d;
    if(bo.shape==='line')d=bo.pts.reduce((m,p,k)=>k?Math.min(m,dps(q.w,q.s,bo.pts[k-1][1],bo.pts[k-1][0],p[1],p[0]).d):m,1e9);
    else if(bo.shape==='ribs')d=Math.abs(Math.hypot((q.w-bo.w)/bo.rw,(q.s-bo.s)/bo.rs)-0.85);
    else d=Math.abs(Math.hypot((q.w-bo.w)/bo.rw,(q.s-bo.s)/bo.rs)-1)*Math.min(bo.rw,bo.rs);
    if(d<bd){bd=d;best=q;}}
  if(best)best.z=z??0;return best;}
function boneMark(bo,loc,kind){if(!loc)return;(bo.marks||(bo.marks=[])).push({s:loc.s+(bo.off||0),w:loc.w,z:loc.z??0,k:kind,r:rnd(0,6.28)});if(bo.marks.length>8)bo.marks.shift();}
function hitBone(bo,d,rep,loc){
  if(bo.shape==='ribs'){if(Math.random()<0.6){bo.seg.ribsBroken++;const i=loc?clamp(Math.round((loc.s+1.2)/1.95),0,11):bo.seg.ribsBroken-1;(bo.seg.ribBreaks||(bo.seg.ribBreaks=[])).push({i,z:loc?loc.z:0.5,w:loc?loc.w:0});rep.push('rib fractured');}return;}
  if(loc)boneMark(bo,loc,'hole');
  if(bo.broken){
    // an already broken limb bone can snap again elsewhere along the same piece
    if(loc&&bo.limb&&!bo.minor&&bo.pts&&bo.seg&&bo.seg.connected&&bo.seg.len>=8){const p0=bo.pts[0][0],p1=bo.pts[bo.pts.length-1][0];const ls=loc.s;
      if(ls-p0>3.2&&p1-ls>3.2){bo.hp2=(bo.hp2==null?bo.hp0*0.8:bo.hp2)-d;if(bo.hp2<=0){bo.hp2=null;bo.bp=clamp((ls-p0)/((p1-p0)||1),0.12,0.88);rep.push(bo.name.replace(/x\d+$/,'')+' fractured again');FRACQ.push(bo);}}}
    return;}
  bo.hp-=d;
  if(bo.hp<=0){bo.broken=true;bo.hp=0;bo.bp=rnd(0.3,0.7);
    if(loc&&bo.pts){const p0=bo.pts[0][0],p1=bo.pts[bo.pts.length-1][0];bo.bp=clamp((loc.s-p0)/((p1-p0)||1),0.1,0.9);}
    if(loc&&bo.shape==='ell'){bo.ba=Math.atan2((loc.s-bo.s)/bo.rs,(loc.w-bo.w)/bo.rw);bo.crack={s:loc.s,w:loc.w,z:loc.z??0};}rep.push(bo.name+' fractured');if(bo.limb&&!bo.minor&&bo.pts)FRACQ.push(bo);
    if(bo.id==='cervical')emitLog('Cervical spine fractured: paralysis, breathing stopped','bad');
    else if(bo.id==='thoracic'||bo.id==='lumbar')emitLog(bo.name+' fractured: legs paralysed','bad');}
}
function cutVessel(v,amt,at,rep){const before=v.cut;v.cut=Math.min(1,v.cut+amt);if(v.cut>=0.95&&before<0.95)v.sevT=T;v.at=at;v.clamp=false;v.lig=false;if(v.cut>before+0.05)rep.push(v.name+(v.cut>=0.95?' severed':' torn'));}
function hurt(seg,s,w,amount){
  if(seg&&(!seg.connected||seg.gone))return; // a severed part has no nerves left to the brain
  if(!V.dead&&V.consc>0.4&&amount>=5&&T-(V.vT||-9)>0.12){V.vT=T;const pe=amount*(V.painEff/Math.max(1,V.pain)||1);if(amount>22)emitVoice('scream',amount/35);else emitVoice(amount>12?'scream':'grunt',amount/30);}
  V.fear=Math.min(1,V.fear+amount/45);
  V.pain=Math.min(100,V.pain+amount);V.flinch=Math.min(0.8,V.flinch+0.25+amount/80);
  if(seg&&!V.dead){
    let hand='near';
    if(seg.side==='near'&&['uarm','farm','hand'].includes(seg.kind))hand='far';
    if(!armOK(hand))hand=hand==='near'?'far':'near';
    if(!(seg.side===hand&&['uarm','farm','hand'].includes(seg.kind)))V.clutch={seg,s,w,hand,t:T};
  }
}
function addDent(seg,s,w,depth,r){
  if(!seg)return;const rr=radS(seg,clamp(s,0,seg.len))||seg.ra;if(Math.abs(w)<rr*0.5)w=(Math.random()<0.5?-1:1)*rr*0.95;
  const D=seg.dents||(seg.dents=[]);const ex=D.find(d=>Math.hypot(d.s-s,d.w-w)<r*0.7);
  if(ex){ex.d=Math.min(rr*0.42,ex.d+depth*0.6);ex.r=Math.max(ex.r,r);}else{D.push({s,w,d:Math.min(rr*0.42,depth),r});if(D.length>6)D.shift();}
  seg.icache=null;
}
function blunt(seg,s,w,E,src,focus=1,raw=false){
  const rep=[];if(!raw&&anyWear())E*=bluntArmor(seg,s,w);
  if(E>15)addWound(seg,{type:'bruise',s,w,r:clamp(1.5+E/45,1.5,7)/Math.sqrt(focus)});
  hurt(seg,s,w,E/4);
  for(const bo of seg.bones){
    if(bo.shape==='ribs'){if(E*focus>110&&Math.random()<0.7){seg.ribsBroken++;(seg.ribBreaks||(seg.ribBreaks=[])).push({i:clamp(Math.round((s+1.2)/1.95),0,11),z:0.5,w});rep.push('rib fractured');}continue;}
    if(bo.id==='skull'){if(E*focus>180)hitBone(bo,(E*focus-180)*0.5,rep,{s,w,z:0});continue;}
    if(E*focus>55){const lc=bo.pts?{s:clamp(s,bo.pts[0][0],bo.pts[bo.pts.length-1][0]),w:polyW(bo.pts,clamp(s,bo.pts[0][0],bo.pts[bo.pts.length-1][0])),z:0}:{s,w,z:0};hitBone(bo,(E*focus-55)*0.38,rep,lc);}
  }
  if(seg.kind==='head'){
    if(E>35){dmgOrgan(ORG.brain,(E-35)*0.17*(BN('skull').broken?1.6:1),rep,'concussed');if(seg.connected){V.ko=Math.max(V.ko,clamp((E-30)/12,0,25));if(E>60)rep.push('knocked out');}}
  } else for(const o of seg.organs){const d=Math.hypot((o.w-w)/o.rw,(o.s-s)/o.rs);if(d<2.2&&E>45){dmgOrgan(o,(E-45)*0.07*(2.2-d),rep,'contused');orgMark(o,'bruise',clamp(w,o.w-o.rw,o.w+o.rw),clamp(s,o.s-o.rs,o.s+o.rs));}}
  if(seg.kind==='neck'&&E>140)hitBone(BN('cervical'),(E-140)*0.4,rep);
  {const Ef=E*focus,broke=rep.some(x=>/fractur/.test(x));
    if(seg.kind==='head'){if(s>6.8&&w>-1&&Ef>130&&!seg.jawBroken){seg.jawBroken=true;seg.jawDrop=clamp((Ef-130)/400,0.12,0.32);rep.push('jaw broken');}
      if(Ef>120)addDent(seg,s,w,clamp((Ef-120)/220,0.2,1.3)+(BN('skull').broken?1.1:0),clamp(2+Ef/110,2.2,4.6));}
    else if(seg.kind==='chest'||seg.kind==='abd'){if(Ef>110&&(broke||Ef>220))addDent(seg,s,w,clamp((Ef-110)/160,0.3,2.2)+(seg.ribsBroken>2?0.8:0),clamp(2.5+Ef/90,3,6));}
    else if(Ef>140&&broke)addDent(seg,s,w,clamp((Ef-140)/200,0.2,0.9),clamp(1.8+Ef/120,2,4));}
  if(!raw&&E>30&&!seg.gone&&T-(seg.skinT||-9)>0.5){seg.skinT=T;rep.push(...bluntSkin(seg,s,w,E,{focus,tang:rnd(0,0.6)}));}
  if(rep.length&&!raw)emitLog(src+' · '+seg.label.toLowerCase()+': '+[...new Set(rep)].join(', '),'bad');
  return rep;
}
function boneInside(bo,q){
  if(bo.shape==='line')return bo.pts.some((p,k)=>k>0&&dps(q.w,q.s,bo.pts[k-1][1],bo.pts[k-1][0],p[1],p[0]).d<bo.width/2+0.15);
  const sh=bo.hitK||1;const x=(q.w-bo.w)/(bo.rw*sh),y=(q.s-bo.s)/(bo.rs*sh),d=x*x+y*y;
  if(bo.shape==='ribs')return Math.abs(Math.sqrt(d)-0.85)<0.06;return d<1;}
function buriedIn(seg,ls,lw){
  const p=toWorld(seg,ls,lw);
  for(const j of joints){if(j.broken)continue;let o=null;if(j.p===seg.idx)o=segs[j.c];else if(j.c===seg.idx)o=segs[j.p];if(!o)continue;
    const A=P[o.a],B=P[o.b];const r=dps(p.x,p.y,A.x,A.y,B.x,B.y);if(r.d<rad(o,r.t)-0.6)return true;}
  return false;
}
function sever(j,rep){
  j.broken=true;const c=segs[j.c],p=segs[j.p];
  const se=j.end==='a'?0:c.len,cr=rad(c,j.end==='a'?0:1);
  addWound(c,{type:'stump',s:se,w:0,r:cr*0.92,bleed:1.2,dw:0,ds:j.end==='a'?-1:1});
  const ps=j.t*p.len;
  const a=P[j.end==='a'?c.a:c.b],b=P[j.end==='a'?c.b:c.a];const L=Math.hypot(b.x-a.x,b.y-a.y)||1;const cd=dirLocal(p,(b.x-a.x)/L,(b.y-a.y)/L);
  addWound(p,{type:'stump',s:ps,w:0,r:cr*0.95,bleed:1.5,dw:cd.w,ds:cd.s});
  const v={seg:p,id:'stump'+c.id,name:c.label+' stump',pts:[[ps-0.5,0],[ps+0.5,0]],width:1,type:'a',rate:j.stump||(c.kind==='neck'||c.kind==='head'?60:10),ext:1,z0:-1,z1:1,cut:1,clamp:false,at:{s:ps,w:0,dw:cd.w,ds:cd.s},deep:false,stump:true,now:0};
  p.vessels.push(v);VESSELS.push(v);
  for(const vv of c.vessels)if(vv.type==='a'){vv.cut=1;vv.at={s:se,w:0,dw:0,ds:j.end==='a'?-1:1};}
  rep.push(c.label+' severed');
  {const jp=P[j.end==='a'?c.a:c.b];spawnGibs(jp.x,jp.y,rnd(-1,1),-0.6,4,'flesh',220);spawnGibs(jp.x,jp.y,rnd(-1,1),-0.8,2,'bone',260);mist(jp.x,jp.y,0,-1,14,300,3.1,0.7);bulletTime();for(let i=0,n_=gn(25);i<n_;i++)if(BLOOD.length<GQ().b){const a=rnd(0,6.28),sp=rnd(80,420);BLOOD.push({x:jp.x,y:jp.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-150,r:rnd(0.3,0.7),life:3});}}
  updateConnected();
  if(!SEG.head.connected&&!V.dead)V.ko=99;
}
function cutLimbAt(seg,cs,rep,mode){
  const FR=mode==='frac';
  if(!LIMBK.includes(seg.kind)||!seg.connected)return false;
  const L0=seg.len;
  // close to a joint: sever the joint itself
  if(!FR&&cs<3.5&&seg.joint&&!seg.joint.broken){sever(seg.joint,rep);return true;}
  const cj=joints.find(q=>q.p===seg.idx&&q.t>0.9&&!q.broken);
  if(!FR&&cs>L0-3.5){if(cj){sever(cj,rep);return true;}return false;}
  if(FR&&(cs<3.5||cs>L0-3.5))return false;
  if(L0<7)return false;
  if(FR&&!seg.off&&seg.fullL==null)seg.fullL=L0;
  cs=clamp(cs,3.5,L0-3.5);const f=cs/L0,A=P[seg.a],B=P[seg.b];
  const cx=lerp(A.x,B.x,f),cy=lerp(A.y,B.y,f),cpx=lerp(A.px,B.px,f),cpy=lerp(A.py,B.py,f),rc=rad(seg,f);
  if(REGROW&&REGROW.list.includes(seg))endRegrow();
  const idx=segs.length,cn=++CUTN;
  const N={id:seg.id+'X'+cn,label:FR?seg.label:seg.label.replace(/^(\w+)/,'$1')+' (cut off)',ra:rc,rb:seg.rb,len:L0-cs,mass:seg.mass*(1-f),side:seg.side,kind:seg.kind,organs:[],vessels:[],bones:[],wounds:[],tracks:[],connected:false,detT:0,idx,lastImpact:-9,ribsBroken:0,rest:seg.rest,tq:null,muscles:[],capil:[],nerves:[],part:!FR,frac:FR};
  N.a=addP(cx,cy,N.mass/2,rc,idx,'a');P[N.a].px=cpx;P[N.a].py=cpy;
  N.b=seg.b;const ob=P[seg.b];ob.seg=idx;ob.m=N.mass/2;ob.im=1/ob.m;
  seg.mass*=f;seg.len=cs;seg.rb=rc;
  seg.b=addP(cx,cy,seg.mass/2,rc,seg.idx,'b');P[seg.b].px=cpx;P[seg.b].py=cpy;P[seg.a].m=seg.mass/2;P[seg.a].im=1/P[seg.a].m;
  for(const r of ROPES)for(const E of [r.a,r.b]){if(E.k!=='seg'||E.seg!==seg)continue;const sv=E.t*L0;if(sv>cs){E.seg=N;E.t=clamp((sv-cs)/(L0-cs),0,1);}else E.t=clamp(sv/cs,0,1);}
  N.hasBite=seg.hasBite;N.zr=seg.zr;N.off=(seg.off||0)+cs;N.from=seg.idx;segs.push(N);SEG[N.id]=N;ORDER.splice(ORDER.indexOf(seg)+1,0,N);
  for(const j of joints){if(j.p===seg.idx&&j.t*L0>cs-0.01){j.p=idx;j.t=clamp((j.t*L0-cs)/N.len,0,1);}}
  const keep=[];
  for(const v of seg.vessels){if(v.stump){keep.push(v);continue;}const [lo,hi]=splitLine(v.pts,cs);
    if(FR){const hiCut=v.cut>0&&v.at&&v.at.s>cs;
      if(hi.length>=2){const nv=Object.assign({},v,{pts:hi,seg:N,id:v.id+'x'+cn,cut:hiCut?v.cut:0,at:hiCut?Object.assign({},v.at,{s:v.at.s-cs}):null,now:0});N.vessels.push(nv);VESSELS.push(nv);}
      if(lo.length>=2){v.pts=lo;if(hiCut){v.cut=0;v.at=null;}keep.push(v);}else{const i=VESSELS.indexOf(v);if(i>=0&&hi.length<2)VESSELS.splice(i,1);}continue;}
    if(hi.length>=2){const nv=Object.assign({},v,{pts:hi,seg:N,id:v.id+'x'+cn,cut:1,at:{s:0,w:hi[0][1],dw:0,ds:-1},clamp:false,lig:false,now:0});N.vessels.push(nv);VESSELS.push(nv);}
    if(lo.length>=2){v.pts=lo;v.cut=1;v.at={s:cs,w:lo[lo.length-1][1],dw:0,ds:1};v.clamp=false;v.lig=false;keep.push(v);}else{const i=VESSELS.indexOf(v);if(i>=0&&hi.length<2)VESSELS.splice(i,1);}}
  seg.vessels=keep;
  const bk=[];
  for(const bo of seg.bones){if(bo.shape!=='line'){bk.push(bo);continue;}const [lo,hi]=splitLine(bo.pts,cs);
    if(hi.length>=2){const nb=Object.assign({},bo,{off:(bo.off||0)+cs,pts:hi,seg:N,id:bo.id+'x'+cn,broken:FR?bo.broken:false});N.bones.push(nb);BONES.push(nb);}
    if(lo.length>=2){bo.pts=lo;bk.push(bo);}}
  seg.bones=bk;
  for(const wd of seg.wounds.slice()){const cc=woundCenter(wd);if(cc.s>cs){seg.wounds.splice(seg.wounds.indexOf(wd),1);wd.s-=cs;if(wd.s2!=null)wd.s2-=cs;wd.streaks=[];N.wounds.push(wd);for(const fw of FW)if(fw.ref===wd)fw.seg=N;}}
  seg.tracks=seg.tracks.filter(t=>{if(t.s1>cs){t.s1-=cs;t.s2-=cs;N.tracks.push(t);return false;}return true;});
  seg.muscles=seg.muscles.filter(m=>{if(m.s>cs){m.s-=cs;N.muscles.push(m);return false;}return true;});
  seg.capil=seg.capil.filter(k=>{if(k.pts[0][0]>cs){k.pts=k.pts.map(p=>[p[0]-cs,p[1]]);N.capil.push(k);return false;}return true;});
  const nk=[];for(const n of seg.nerves){const [lo,hi]=splitLine(n.pts,cs);if(hi.length>=2)N.nerves.push({pts:hi,w:n.w});if(lo.length>=2)nk.push({pts:lo,w:n.w});}seg.nerves=nk;
  if(seg.tq!=null&&seg.tq>cs){seg.tq=null;seg.tqV=[];}
  for(const st of STRANDS)if(st.seg===seg&&st.s>cs){st.seg=N;st.s-=cs;}
  for(const o of OBJ)if(o.att&&o.att.seg===seg&&o.att.s>cs){o.att.seg=N;o.att.s-=cs;}
  for(const K of KNIVES)if(K.seg===seg&&K.s>cs){K.seg=N;K.s-=cs;}
  for(const t of TRAJ)for(const q of t.pts)if(q.seg===seg&&q.s>cs){q.seg=N;q.s-=cs;}
  for(const q of LODGED)if(q.seg===seg&&q.s>cs){q.seg=N;q.s-=cs;}
  for(const b of BUL)if(b.trk)for(const q of b.trk.pts)if(q.seg===seg&&q.s>cs){q.seg=N;q.s-=cs;}
  if(FR){
    const j={p:seg.idx,c:N.idx,t:1,end:'a',key:'frac',rest:0,min:-0.95,max:0.95,broken:false,wf:3,wp:0,chop:0,stump:seg.joint?seg.joint.stump:6,arm:seg.joint?seg.joint.arm:undefined,leg:seg.joint?seg.joint.leg:undefined};
    joints.push(j);N.joint=j;
    for(const [g,sv] of [[seg,cs-0.5],[N,0.5]]){const r_=radS(g,clamp(sv,0,g.len))||g.ra;addWound(g,{type:'bruise',s:sv,w:r_*0.6,r:r_*1.3});}
    updateConnected();return true;}
  addWound(seg,{type:'stump',s:cs,w:0,r:rc*0.92,bleed:1.4,dw:0,ds:1});
  addWound(N,{type:'stump',s:0,w:0,r:rc*0.92,bleed:1,dw:0,ds:-1});
  const fp=FP.find(q=>q.id===seg.id);if(fp&&fp.t==='cap'){if(!fp.o)fp.o={x2:fp.x2,y2:fp.y2,r2:fp.r2};fp.x2=lerp(fp.x1,fp.x2,f);fp.y2=lerp(fp.y1,fp.y2,f);fp.r2=lerp(fp.r1,fp.r2,f);fp.cut=true;}
  spawnGibs(cx,cy,rnd(-1,1),-0.7,4,'flesh',230);spawnGibs(cx,cy,rnd(-1,1),-0.8,2,'bone',260);
  mist(cx,cy,0,-1,14,300,3.1,0.7);bulletTime();for(let i=0,n_=gn(22);i<n_;i++)if(BLOOD.length<GQ().b){const a=rnd(0,6.28),sp=rnd(80,380);BLOOD.push({x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-120,r:rnd(0.3,0.6),life:3});}
  rep.push(seg.label+' cut through');
  updateConnected();
  return true;
}
// ---------- blunt force: what really happens to skin, fat, muscle and bone ----------
// bony prominence: how directly the skin lies on bone at that spot (skin splits when crushed against bone)
function bonyAt(g,s,w){const k=g.kind,L=g.len;
  if(k==='head')return 1;if(k==='shin')return w>0?1:0.3;if(k==='farm')return s<3?0.9:0.65;if(k==='hand'||k==='foot')return 0.8;
  if(k==='uarm')return s>L-3?0.9:0.3;if(k==='thigh')return s>L-4?0.85:0.15;if(k==='chest')return 0.45;if(k==='neck')return 0.25;if(k==='abd')return 0.05;return 0.3;}
function blunt2(g,s,w,E,src,o={}){
  if(anyWear())E*=bluntArmor(g,s,w);const focus=o.focus||1;
  const rep=blunt(g,s,w,E,src,focus,true)||[],skin=bluntSkin(g,s,w,E,o);
  if(o.chop)skin.push('chop wound');
  const all=[...skin,...rep];if(all.length)emitLog(src+' · '+g.label.toLowerCase()+' ('+Math.round(E)+' J): '+[...new Set(all)].slice(0,5).join(', '),'bad');
  return all;
}
function bluntSkin(g,s,w,E,o={}){if(g.gone)return[];const focus=o.focus||1;
  const R=radS(g,clamp(s,0,g.len))||g.ra,sg=Math.sign(w)||1,ws=sg*R*0.95;
  const bp=bonyAt(g,s,w),Ec=E*focus*bp,skin=[];
  const angOf=v=>v?Math.atan2(v.s,v.w):0;
  // haematoma ("goose egg") where the scalp is crushed over the skull
  if(g.kind==='head'&&E>25){addWound(g,{type:'bruise',swell:1,s,w:ws,r:clamp(1.2+E/90,1.2,3.6),z:o.z});skin.push('haematoma (swelling)');
    if(s>0&&s<5.5&&w>2&&E>30){addWound(g,{type:'bruise',eye:1,s:2.8,w:5.6,r:2.2,z:o.z});skin.push('black eye');}}
  // patterned injuries: the weapon's shape printed in the skin
  if(o.pat==='tram'&&E>30){addWound(g,{type:'bruise',pat:'tram',s,w:ws*0.97,r:clamp(2+E/70,2,6),gap:(o.rodR||1.5)*1.2,ang:angOf(o.ax)+Math.PI/2,z:o.z});skin.push('tramline bruise (rod-shaped weapon)');}
  if(o.pat==='ring'&&E>25){addWound(g,{type:'bruise',pat:'ring',s,w:ws*0.97,r:1.5,z:o.z});skin.push('round patterned bruise (hammer face)');}
  // abrasion: the surface scraped off when the blow slides across the skin
  if((o.tang||0)>0.3&&E>10||(o.rough&&E>25)){addWound(g,{type:'bruise',abr:1,s,w:ws*0.97,r:clamp(1+E/90,1,4)*(0.6+(o.tang||0)),ang:angOf(o.slide),z:o.z});skin.push('abrasion (graze)');}
  // laceration: skin split by crushing against bone — ragged edges, bridging strands, abraded margins
  if(Ec>45&&Math.random()<clamp((Ec-45)/60,0.35,1)){const len=clamp(1.5+Ec/55,1.5,g.kind==='head'?3.5:7)*(o.pat==='ring'?0.5:1),a=o.pat==='ring'?rnd(-1,1):0;
    const wd=addWound(g,{type:'cut',lac:true,s:s-len/2,w:ws,s2:s+len/2,w2:ws+a,r:0.42,len,bleed:(g.kind==='head'?0.55:0.22)*clamp(Ec/80,0.6,2),live:false,dw:sg,ds:0,z:o.z});
    wd.jag=[];for(let i=0;i<10;i++)wd.jag.push(rnd(0.6,1.4));skin.push(g.kind==='head'?'scalp laceration (scalp bleeds heavily)':'laceration (skin split against bone)');}
  // a claw or hook punches a ragged puncture
  if(o.punct&&E>15){addWound(g,{type:'hole',s,w:ws*0.9,r:0.55,bleed:0.35,dw:sg,ds:0,z:o.z,punct:1});skin.push('puncture wound');}
  // degloving: a heavy sliding blow tears the skin off the tissue beneath
  if(LIMBK.includes(g.kind)&&E>350&&(o.tang||0)>0.5){const wd=addWound(g,{type:'cut',lac:true,s:s-3,w:ws,s2:s+3,w2:ws,r:0.9,len:6,bleed:0.8,dw:sg,ds:0,z:o.z});wd.jag=[];for(let i=0;i<10;i++)wd.jag.push(rnd(0.5,1.6));if(OPT.gore>=3)addFlaps(g,wd,2);skin.push('degloving (skin torn off the tissue beneath)');}
  return skin;
}
function orgBleed(o){return o.ib&&o.hp<100?o.ib*Math.pow(1-o.hp/100,1.3)*(o.rep?0.04:1):0;}
// skin, fat and muscle visible in the rim of a bullet hole, plus bone chips when the round broke bone
function boneBrokenNear(seg,sv){for(const b of seg.bones){if(!b.broken||b.shape!=='line'||!b.pts)continue;const s0=b.pts[0][0],s1=b.pts[b.pts.length-1][0];if(sv>=Math.min(s0,s1)-2.5&&sv<=Math.max(s0,s1)+2.5)return true;}return false;}
// the skin openings a cut vessel can bleed out of (nearest first)
function vHoles(v){if(!v.at)return[];const out=[];for(const wd of v.seg.wounds){if(!openWound(wd)||wd.sut>=1||wd.graft)continue;const c=woundCenter(wd);const lim=wd.type==='stump'?(v.stump?99:8):Math.max(7,(wd.r||1)*3,(wd.len||0)*0.6);const d=Math.hypot(c.s-v.at.s,c.w-(v.at.w||0));if(d<lim)out.push([d,wd]);}out.sort((a,b)=>a[0]-b[0]);return out.map(q=>q[1]);}
function vOpen(v){return vHoles(v).length>0;}
const wdShut=(seg,wd)=>wd.band||wd.pack||wd.wrapped||!!inWrap(seg,woundCenter(wd).s);
// covered = every opening it could bleed through is under a dressing, packing or a wrapped bandage
function vCovered(v){const hs=vHoles(v);return hs.length>0&&hs.every(wd=>wdShut(v.seg,wd));}
function vJetHole(v){return vHoles(v).find(wd=>!wdShut(v.seg,wd))||null;}
const openWound=wd=>wd.type==='hole'||wd.type==='cut'||wd.type==='stump';
function woundAtTap(w,pred){
  let best=null,bd=Math.max(5,24/VS);
  if(view!=='side'){
    if(view==='front')for(const f of FW){if(!f.seg.connected||!f.ref||!pred(f.ref))continue;const x=f.type==='cut'?(f.x+f.x2)/2:f.x,y=f.type==='cut'?(f.y+f.y2)/2:f.y;const d=Math.hypot(x-w.x,y-w.y);if(d<bd){bd=d;best={seg:f.seg,wd:f.ref,d};}}
    for(const seg of segs){if(!seg.connected)continue;for(const wd of seg.wounds){if((wd.ff&&view==='front')||!pred(wd))continue;const cc=woundCenter(wd);const rr=radS(seg,cc.s)||seg.ra;if(view==='back'?cc.w>0.4*rr:cc.w<-0.4*rr)continue;const p=wFix(wd,seg)||frontPos(seg,cc.s,wd.z==null?0.85:wd.z);if(!p)continue;const d=Math.hypot(p.x-w.x,p.y-w.y);if(d<bd){bd=d;best={seg,wd,d};}}}
  } else {
    for(const seg of segs)for(const wd of seg.wounds){if(!pred(wd))continue;const cc=woundCenter(wd);const p=toWorld(seg,cc.s,cc.w);const d=Math.hypot(p.x-w.x,p.y-w.y);if(d<bd){bd=d;best={seg,wd,d};}}
  }
  return best;
}
