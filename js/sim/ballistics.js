/* TRAUMA_LAB_MAIN */
/* ===== sim/ballistics.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
// a bullet hole in the wall or ceiling. Only the newest 600 are kept: an all-day session used to keep every one of them
// in memory and redraw them all each frame
function wallHole(x,y){WALLST.push({x,y,r:0.7,c:'#111'});if(WALLST.length>600)WALLST.splice(0,WALLST.length-600);}
const WEAP={
  pistol:  {name:'9 mm pistol',E:520,m:0.008,loss:11,pellets:1,spread:0.004,cav:1,range:1e6,knock:6,snd:'pistol'},
  revolver:{name:'.44 revolver',E:1300,m:0.015,loss:11,pellets:1,spread:0.006,cav:1.4,range:1e6,knock:8,snd:'revolver'},
  smg:     {name:'9 mm SMG',E:480,m:0.008,loss:11,pellets:1,spread:0.025,cav:1,range:1e6,knock:5,snd:'smg',auto:12},
  rifle:   {name:'5.56 rifle',E:1750,m:0.004,loss:8,pellets:1,spread:0.003,cav:1.8,range:1e6,knock:7,snd:'rifle',auto:10},
  shotgun: {name:'12 ga shotgun',E:190,m:0.0035,loss:15,pellets:9,spread:0.075,cav:0.8,range:1e6,knock:8,snd:'shotgun'},
  sniper:  {name:'.338 sniper',E:4800,m:0.016,loss:6,pellets:1,spread:0,cav:2.6,range:1e6,knock:10,snd:'sniper',sever:true},
  p22:     {name:'.22 LR pistol',E:150,m:0.0026,loss:12,pellets:1,spread:0.006,cav:0.6,range:1e6,knock:3,snd:'pistol',cls:'hand'},
  p45:     {name:'.45 ACP pistol',E:560,m:0.015,loss:12,pellets:1,spread:0.005,cav:1.25,range:1e6,knock:8,snd:'revolver',cls:'hand'},
  ak:      {name:'7.62x39 rifle',E:2100,m:0.008,loss:8,pellets:1,spread:0.012,cav:2,range:1e6,knock:8,snd:'rifle',auto:10,cls:'rifle'},
  dmr:     {name:'.308 marksman',E:3500,m:0.0097,loss:7,pellets:1,spread:0.002,cav:2.3,range:1e6,knock:9,snd:'sniper',cls:'rifle'},
  bmg:     {name:'.50 BMG',E:18000,m:0.042,loss:4,pellets:1,spread:0.002,cav:4,range:1e6,knock:22,snd:'sniper',sever:true,cls:'ap'},
  slug:    {name:'12 ga slug',E:3200,m:0.028,loss:10,pellets:1,spread:0.01,cav:2.8,range:1e6,knock:16,snd:'shotgun',cls:'slug'},
  flamer:  {name:'Flamethrower',E:0,m:0,loss:0,pellets:1,spread:0,cav:0,range:420,knock:0,snd:'flame',auto:30},
  bow:{name:'Compound bow',E:110,m:0.028,loss:0,pellets:1,spread:0,cav:0.4,range:1e6,knock:1,snd:'whoosh',cls:'arrow'},
  crossbow:{name:'Crossbow',E:160,m:0.026,loss:0,pellets:1,spread:0,cav:0.4,range:1e6,knock:1,snd:'whoosh',cls:'arrow'},
  shrapnel:{name:'Shrapnel',E:240,m:0.003,loss:13,pellets:1,spread:0,cav:1,range:160,knock:5}
};
function rayRoomLen(x,y,dx,dy,max){
  let L=max;
  if(dy>1e-6)L=Math.min(L,(0-y)/dy);if(dy<-1e-6)L=Math.min(L,(TOP-y)/dy);
  if(dx>1e-6)L=Math.min(L,(ROOM-x)/dx);if(dx<-1e-6)L=Math.min(L,(-ROOM-x)/dx);
  return Math.max(0,L);
}
// the same ray against everyone (sim/bodies), nearest first; each hit remembers whose body it is
function traceAll(x0,y0,dx,dy,L){const out=[];forBodies(bd=>{for(const ht of traceRay(x0,y0,dx,dy,L)){ht.bd=bd;out.push(ht);}});return out.sort((a,b)=>a.tin-b.tin);}
function traceRay(x0,y0,dx,dy,L){
  const hits=[];
  for(const s of segs){
    const A=P[s.a],B=P[s.b],rm=Math.max(s.ra,s.rb)+0.5;
    const pa=(A.x-x0)*dy-(A.y-y0)*dx,pb=(B.x-x0)*dy-(B.y-y0)*dx;
    if((pa>rm&&pb>rm)||(pa<-rm&&pb<-rm))continue;
    const ta=(A.x-x0)*dx+(A.y-y0)*dy,tb=(B.x-x0)*dx+(B.y-y0)*dy;
    const t0=Math.max(0,Math.min(ta,tb)-rm),t1=Math.min(L,Math.max(ta,tb)+rm);
    if(t1<=t0)continue;
    let tin=-1,tout=-1;
    for(let t=t0;t<=t1;t+=0.3){if(insideSeg(s,x0+dx*t,y0+dy*t)){if(tin<0)tin=t;tout=t;}else if(tin>=0)break;}
    if(tin>=0)hits.push({seg:s,tin,tout});
  }
  return hits.sort((a,b)=>a.tin-b.tin);
}
let LODGED=[],OP=null,FLAMES=[],CORE=null,flameN=0,SOURCE=null;
let TRAJ=[],trajOn=false,trajN=0,trajDirty=true;
const TCOL=['#ffd166','#4cc9f0','#f72585','#80ed99','#ff8c42','#b388ff','#f9f871','#00f5d4'];
function newTrk(name,view_){trajN++;return{n:trajN,name,col:TCOL[(trajN-1)%TCOL.length],pts:[],hits:[],view:view_};}
function addTrk(t){if(!t||!t.pts.length)return;TRAJ.push(t);if(TRAJ.length>60)TRAJ.splice(0,TRAJ.length-60);trajDirty=true;}
const BSPD={pistol:2600,revolver:2900,smg:2600,rifle:4600,shotgun:2700,sniper:6200,p22:2300,p45:2200,ak:4300,dmr:5200,bmg:5600,slug:2400};
function wcls(k){const W_=WEAP[k];if(W_&&W_.cls)return W_.cls;return({pistol:'hand',revolver:'magnum',smg:'hand',rifle:'rifle',shotgun:'buck',sniper:'ap',shrapnel:'frag'})[k]||'hand';}
let BUL=[];
function buzz(ms){try{if(OPT.vib&&navigator.vibrate)navigator.vibrate(ms);}catch(e){}}
function fire(kind,x0,y0,dx,dy,quiet){if(!quiet)buzz(kind==='bmg'||kind==='sniper'||kind==='shotgun'||kind==='slug'?35:15);
  if(kind==='flamer'){flameBurst(x0,y0,dx,dy);if(V&&!V.dead){V.fear=Math.min(1,V.fear+0.05);V.thx=x0;}const a=Math.atan2(dy,dx);FX.push({k:'gun',x:x0,y:y0,a,kind,t:0,life:0.2});return[];}
  const Wp=WEAP[kind];const base=Math.atan2(dy,dx);const rep=[];
  if(BSPD[kind]){
    const Am=ammoShot(kind,Wp),nm=CART[kind]?ammoName(kind):Wp.name;
    if(!quiet){ejectCase(kind,x0,y0,base);}
    // dragon's breath: burning magnesium, a jet of fire rather than projectiles
    if(Am.am==='dragon'){for(let i=0;i<4;i++)flameBurst(x0,y0,Math.cos(base+rnd(-0.05,0.05)),Math.sin(base+rnd(-0.05,0.05)));for(let i=0;i<24;i++){const a=base+rnd(-0.12,0.12),v=rnd(500,1400);FX.push({k:'ember',x:x0+Math.cos(base)*4,y:y0+Math.sin(base)*4,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0,life:rnd(0.4,1.1)});}
      if(!quiet){if(V&&!V.dead){V.fear=1;V.thx=x0;}FX.push({k:'gun',x:x0,y:y0,a:base,kind,t:0,life:0.55});FX.push({k:'flash',x:x0+Math.cos(base)*4,y:y0+Math.sin(base)*4,a:base,t:0,life:0.12});emitSound(Wp.snd,1,Am?Am.E*Am.pellets:Wp.E);emitLog(nm+' · a jet of burning magnesium','info');}return rep;}
    const shot={name:nm,rep,left:Am.pellets,quiet};const tk=newTrk(nm,'side');
    for(let i=0;i<Am.pellets;i++){
      const an=base+rnd(-Am.spread,Am.spread),sp=BSPD[kind]*rnd(0.96,1.04),E=Am.E*rnd(0.92,1.05);
      BUL.push({trk:Object.assign({},tk,{pts:[],hits:[]}),side:true,E,E0:E,m:Am.m,am:Am.am,dia:Am.dia,gk:dropK(kind),ox:x0,oy:y0,odx:Math.cos(an),ody:Math.sin(an),loss:Wp.loss,z:rnd(-1.15,1.15),cav:Am.cav,knock:Wp.knock,sever:Wp.sever&&Am.am!=='hp',k:kind,x:x0+Math.cos(an)*3,y:y0+Math.sin(an)*3,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp,v0:sp,dist:0,range:Wp.range,done:new Set(),shot,w:kind==='sniper'?0.9:kind==='rifle'?0.65:kind==='shotgun'?0.35:0.5});
    }
    if(BUL.length>200)BUL.splice(0,BUL.length-200);
  } else
  for(let i=0;i<Wp.pellets;i++){
    const an=base+rnd(-Wp.spread,Wp.spread),ddx=Math.cos(an),ddy=Math.sin(an);
    const b={side:true,E:Wp.E*rnd(0.92,1.05),m:Wp.m,loss:Wp.loss,z:rnd(-1.15,1.15),cav:Wp.cav,knock:Wp.knock,sever:Wp.sever,k:kind};
    const L=rayRoomLen(x0,y0,ddx,ddy,Wp.range);
    const hits=traceRay(x0,y0,ddx,ddy,L);
    let end=L;
    for(const h of hits){if(b.E<=0)break;const zr=h.seg.zr;if(zr&&(b.z<zr[0]||b.z>zr[1]))continue;const zs=b.z;if(zr)b.z=clamp((zs-(zr[0]+zr[1])/2)/((zr[1]-zr[0])/2),-1,1);const st=through(h,b,x0,y0,ddx,ddy,rep);b.z=zs;if(st!=null){end=st;break;}}
    const ex=x0+ddx*end,ey=y0+ddy*end;
    FX.push({k:'trace',x1:x0,y1:y0,x2:ex,y2:ey,t:0,life:kind==='shrapnel'?0.08:0.14,w:kind==='sniper'?1:kind==='rifle'?0.7:0.45});
    if(end>=L-0.01&&L<Wp.range-1){FX.push({k:'spark',x:ex,y:ey,t:0,life:0.18});if(Math.abs(Math.abs(ex)-ROOM)<1||ey<TOP+1)wallHole(ex,ey);}
  }
  if(!quiet){
    if(V&&!V.dead){V.fear=Math.min(1,V.fear+0.3);V.thx=x0;}
    const a=Math.atan2(dy,dx);
    FX.push({k:'gun',x:x0,y:y0,a,kind,t:0,life:0.55});FX.push({k:'flash',x:x0+Math.cos(a)*4,y:y0+Math.sin(a)*4,a,t:0,life:0.06});
    emitSound(Wp.snd,1,Wp.E*Wp.pellets);if(!BSPD[kind])reportHit(Wp.name,rep);
  }
  return rep;
}
function bulletStep(h){
  for(let i=BUL.length-1;i>=0;i--){
    const b=BUL[i];let alive=b.E>0;
    if(alive){
      b.vy+=G*(b.gk||0.005)*h;   // real drop for this cartridge's muzzle velocity (see dropK)
      const sp=Math.hypot(b.vx,b.vy),dx=b.vx/sp,dy=b.vy/sp,step=sp*h;
      const wl=rayRoomLen(b.x,b.y,dx,dy,step+60);
      const hits=BODIES.length?traceAll(b.x,b.y,dx,dy,wl):traceRay(b.x,b.y,dx,dy,wl);
      let end=Math.min(step,wl),stopped=false;if(PROPS.length){propBullet(b,b.x,b.y,dx,dy,end);if(b.stopAt!=null){end=Math.min(end,b.stopAt);stopped=true;b.stopAt=null;}}
      if(STORY.on){const t=storyBulletStop(b.x,b.y,dx,dy,end);if(t!=null){end=t;stopped=true;FX.push({k:'spark',x:b.x+dx*t,y:b.y+dy*t,t:0,life:0.2});emitSound('tink',0.5);}}
      for(const ht of hits){
        if(ht.tin>end)break;const hk=(ht.bd?ht.bd.id*1000:0)+ht.seg.idx;if(b.done.has(hk))continue;b.done.add(hk);
        const zr=ht.seg.zr;if(zr&&(b.z<zr[0]||b.z>zr[1]))continue;
        const zs=b.z;if(zr)b.z=clamp((zs-(zr[0]+zr[1])/2)/((zr[1]-zr[0])/2),-1,1);
        if(ht.bd&&ht.bd.id)b.shot.who=ht.bd.name;
        const r0=b.shot.rep.length;const st=ht.bd?withBody(ht.bd,()=>through(ht,b,b.x,b.y,dx,dy,b.shot.rep)):through(ht,b,b.x,b.y,dx,dy,b.shot.rep);b.z=zs;if(b.trk)for(const x of b.shot.rep.slice(r0))b.trk.hits.push(x);
        if(st!=null){end=st;stopped=true;break;}
        end=Math.min(wl,Math.max(end,ht.tout+0.05));
        if(b.E<=0){stopped=true;break;}
      }
      b.x+=dx*end;b.y+=dy*end;b.dist+=end;
      const ns=Math.min(sp,b.v0*Math.sqrt(Math.max(0.12,b.E/b.E0)));b.vx=dx*ns;b.vy=dy*ns;
      if(stopped||b.E<=0)alive=false;
      else if(end>=wl-0.01&&wl<step+60-0.01){alive=false;FX.push({k:'spark',x:b.x,y:b.y,t:0,life:0.18});if(Math.abs(Math.abs(b.x)-ROOM)<1||b.y<TOP+1)wallHole(b.x,b.y);}
      else if(b.dist>b.range)alive=false;
    }
    if(!alive){BUL.splice(i,1);if(b.trk&&b.odx!=null){const ddx=b.x-b.ox,ddy=b.y-b.oy;const dr=Math.abs(ddx*b.ody-ddy*b.odx);b.trk.drop=dr;b.trk.dist=Math.hypot(ddx,ddy);if(b.trk.dist>20&&!/ drop /.test(b.trk.name))b.trk.name+=' · drop '+fmtDrop(dr)+' over '+(b.trk.dist/100).toFixed(1)+' m';}addTrk(b.trk);const sh=b.shot;sh.left--;if(sh.left<=0&&!sh.quiet)reportHit((sh.who?sh.who+' · ':'')+sh.name,sh.rep);}
  }
}
function reportHit(name,rep){const all=[...new Set(rep)];const ld=all.filter(x=>/ lodged in /.test(x)),ot=all.filter(x=>!/ lodged in /.test(x));const sh=ot.slice(0,5-Math.min(2,ld.length)).concat(ld.slice(0,2)),more=all.length-sh.length;emitLog(name+' · '+(all.length?sh.join(', ')+(more>0?' +'+more:''):'missed'),all.length?'bad':'info');}
function through(h,b,x0,y0,dx,dy,rep){
  const seg=h.seg;
  const Li=toLocal(seg,x0+dx*h.tin,y0+dy*h.tin),Lo=toLocal(seg,x0+dx*h.tout,y0+dy*h.tout);
  const dl=dirLocal(seg,dx,dy);
  const r=penetrate(seg,Li,Lo,Math.max(0.3,h.tout-h.tin),b,dl,rep);
  return r.exited?null:h.tin+(h.tout-h.tin)*r.frac;
}
/* Terminal ballistics: the bullet is slowed by drag through each tissue it actually reaches, in order.
   Energy decays as E·exp(-k·(A/m)·ρ·ds): heavy, narrow rounds (high sectional density) go deep, light ones stop early.
   Skin resists like a few cm of muscle; bone is a shell that costs energy to break through, in proportion to its density,
   thickness and the bullet's frontal area; lungs (air) and brain are softer than muscle. Rifle rounds yaw after ~8 cm and slow faster. */
const CAL={p22:0.57,pistol:0.9,smg:0.9,p45:1.15,revolver:1.09,rifle:0.57,ak:0.78,dmr:0.78,sniper:0.86,bmg:1.29,shotgun:0.84,slug:1.8,shrapnel:0.5};
const KMUS=0.00115,SKIN_EQ=2.5;
function ballistics(seg,Li,Lo,len,b){
  // (the mass floor is 0.05 g: a 0.08 g birdshot pellet used to be treated as 1 g, so it went 12× too deep)
  const k=b.k||'pistol',dia=b.dia||CAL[k]||0.9,m=Math.max(0.00005,b.m||0.008);let A=Math.PI*dia*dia/4;const AM=b.am?AMMO[b.am]:null;let opened=false;
  const shape=k==='shrapnel'?2.5:1,Emin=0.5*m*1600;
  let E=b.E*Math.exp(-KMUS*shape*A/m*SKIN_EQ);
  const N=Math.max(10,Math.ceil(len/0.35)),ds=len/N,bones=[],eAt=new Map(),inside=new Map();let inBone=null,stopT=null,trav=0;
  const soft=seg.organs.filter(o=>o.kind==='lung'||o.kind==='brain');
  for(let i=0;i<=N&&stopT==null;i++){const t=i/N,q={s:lerp(Li.s,Lo.s,t),w:lerp(Li.w,Lo.w,t)};
    // bones: pay to break in (and out of a shell bone)
    for(const bo of seg.bones){if(!zIn(b.z,bo))continue;if(FSHOT&&bo.spine&&Math.abs(FSHOT.x)>2.8)continue;
      const now=boneInside(bo,q),was=inside.get(bo)||false;inside.set(bo,now);
      const enter=now&&!was,leave=!now&&was&&bo.shape==='ell';if(!enter&&!leave)continue;
      const thick=bo.thick??(bo.shape==='ell'?1:bo.shape==='ribs'?0.35:Math.max(0.6,bo.width/2));const cost=bo.dens*A*2.2*thick*(AM&&AM.bone||1);
      if(!bones.includes(bo)){bones.push(bo);eAt.set(bo,E);}
      if(E-cost<=Emin){stopT=t;inBone=bo;E=0;break;}E-=cost;}
    if(stopT!=null)break;
    // soft tissue drag
    let f=seg.kind==='abd'&&q.s>17&&q.w<-4?2.1:1; // thick gluteal muscle behind the pelvis
    for(const o of soft){const x=(q.w-o.w)/o.rw,y=(q.s-o.s)/o.rs;if(x*x+y*y<1){f=o.kind==='lung'?0.3:0.55;break;}}
    trav+=ds;
    // hollow / soft points open into a mushroom: the frontal area grows and the drag with it
    if(AM&&AM.x&&!opened&&trav>=AM.xd){opened=true;A*=AM.x*AM.x;b.opened=true;}
    // explosive: the fuze fires a couple of cm in; fragmenting: the jacket breaks up once it has slowed in tissue
    if(AM&&AM.he&&trav>=AM.fz&&!b.det){b.det={t};stopT=t;E=0;break;}
    if(AM&&AM.frag&&trav>=AM.fr&&!b.broke&&E>Emin*4){b.broke={t,E};stopT=t;E=0;break;}
    const yaw=(k==='rifle'||k==='ak'||k==='dmr')&&trav>8?2.2:1;
    E*=Math.exp(-KMUS*shape*yaw*A/m*f*ds);
    if(E<=Emin){stopT=t;E=0;}
  }
  if(stopT==null){E*=Math.exp(-KMUS*shape*A/m*SKIN_EQ);if(E<=Emin)return{exited:false,frac:0.98,E:0,bones,eAt,inBone:null};return{exited:true,frac:1,E,bones,eAt,inBone:null};}
  return{exited:false,frac:Math.max(0.02,stopT),E:0,bones,eAt,inBone};
}
function penetrate(seg,Li,Lo,len,b,dl,rep){
  if(V.frozenT>0&&seg.connected&&(LIMBK.includes(seg.kind)||seg.kind==='head'||seg.kind==='neck')&&b.E>250&&Math.random()<0.75){shatter(seg,(Li.s+Lo.s)/2,rep);b.E*=0.6;return{exited:true,frac:1,entry:null};}
  if(anyWear()&&armorStop(seg,Li,b,dl,rep,false)){if(b.trk)b.trk.pts.push({seg,s:Li.s,w:Li.w,z:b.z,k:'armor',ds:dl.s,dw:dl.w});return{exited:false,frac:0,entry:null,stopped:true};}
  const Ein=b.E,scale=clamp(Ein/500,0.2,3);
  const bal=ballistics(seg,Li,Lo,len,b);const bhit=bal.bones,frac=bal.frac,exited=bal.exited;b.E=bal.E;
  const Le=exited?Lo:{s:lerp(Li.s,Lo.s,frac),w:lerp(Li.w,Lo.w,frac)};
  if(!exited&&bal.inBone){rep.push((b.am==='bird'?'pellet':'bullet')+' stopped by the '+bal.inBone.name.toLowerCase());}
  const det=b.det&&!exited,broke=b.broke&&!exited;
  // an explosive round leaves no bullet (it is the fragments); a fragmenting one leaves its base, the rest is shards
  if(!exited&&!det){const L={seg,s:Le.s,w:Le.w,z:b.z,k:b.k||'shrapnel',t:T,am:b.am,mush:!!b.opened,core:!!broke};LODGED.push(L);if(b.k!=='shrapnel')rep.push((broke?'bullet base':b.opened?'expanded bullet':b.k==='shotgun'?'pellet':'bullet')+' lodged in '+seg.label.toLowerCase().replace(' (cut off)',''));b.lod=L;if(LODGED.length>90)LODGED.shift();}
  if(b.trk){b.trk.pts.push({seg,s:Li.s,w:Li.w,z:b.z,k:'in',ds:dl.s,dw:dl.w});b.trk.pts.push({seg,s:Le.s,w:Le.w,z:b.z,k:exited?'out':'stop',ds:dl.s,dw:dl.w});}
  for(const bo of bhit){const eb=bal.eAt.get(bo)||Ein;hitBone(bo,(55+30*Math.random())*clamp(eb/500,0.15,3)*b.cav*(bal.inBone===bo?0.6:1),rep,boneHitAt(bo,Li,Le,b.z));}
  for(const o of seg.organs){const fo=FSHOT&&o.id!=='eye'?FORG[o.id]:null;let hitO;if(fo){const pd=0.3*b.cav;hitO=((FSHOT.x-fo[0])/(fo[2]+pd))**2+((FSHOT.y-fo[1])/(fo[3]+pd))**2<1&&Math.max(Li.w,Le.w)>=o.w-o.rw-pd&&Math.min(Li.w,Le.w)<=o.w+o.rw+pd;}else hitO=zIn(b.z,o)&&ellHit(o,Li,Le,0.35*b.cav);if(hitO){if(o.id==='brain'){if(o.stem==null)o.stem=100;if(Math.abs(b.z||0)<0.4&&ellHit(STEM,Li,Le,0.3*b.cav))stemDmg(o,(70+40*Math.random())*scale*b.cav,rep);}dmgOrgan(o,(42+35*Math.random())*scale*o.vuln*b.cav,rep,'perforated',o.id==='brain');const q=dps(o.w,o.s,Li.w,Li.s,Le.w,Le.s);const fa=FSHOT?{x:FSHOT.x,y:FSHOT.y}:frontAbs(seg,q.qy,b.z);(o.hits||(o.hits=[])).push({fx:fa.x,fy:fa.y,x:clamp((q.qx-o.w)/o.rw,-1,1),y:clamp((q.qy-o.s)/o.rs,-1,1),z:b.z,r:0.5+0.35*b.cav*Math.min(2,scale)});if(o.hits.length>12)o.hits.shift();}}
  // a bullet through a vessel tears at least half of it; a pellet under 5 mm (birdshot) only punctures it, in proportion to
  // its size (a 2.4 mm pellet through a 9 mm carotid: ≈15 %), and several pellets add up
  for(const v of seg.vessels){if(!zIn(b.z,v))continue;if(polyHit(v.pts,Li,Le,v.width/2+0.45*b.cav)){const at=exited?{s:Lo.s,w:Lo.w,dw:dl.w,ds:dl.s}:{s:Li.s,w:Li.w,dw:-dl.w,ds:-dl.s};
    const pd=b.dia||0;cutVessel(v,pd&&pd<0.5?clamp(0.08+0.25*pd/v.width,0.08,0.35):0.5+0.5*Math.min(1,scale*b.cav),at,rep);}}
  const headK=seg.kind==='head'?1.8:1;
  // a pellet under 5 mm (birdshot) leaves a hole about its own size (a 2.4 mm pellet: ≈4–5 mm across, ≈6 mm where it
  // comes out), not a bullet's (≥1.2 cm)
  const pel=b.dia&&b.dia<0.5,rIn=pel?0.12+0.4*b.dia:Math.min(1.4,0.6+0.12*scale*b.cav),rOut=pel?0.16+0.6*b.dia:Math.min(3,0.9+0.3*scale*b.cav);
  const entry=(b.side&&buriedIn(seg,Li.s,Li.w))?null:digHole(seg,{type:'hole',s:Li.s,w:Li.w,r:rIn,bleed:0.3*scale*headK*(pel?0.4:1),dw:-dl.w,ds:-dl.s,z:b.z,pel});
  const exW=(exited&&!(b.side&&buriedIn(seg,Lo.s,Lo.w)))?digHole(seg,{type:'hole',exit:true,s:Lo.s,w:Lo.w,r:rOut,bleed:0.55*scale*headK*(pel?0.4:1),dw:dl.w,ds:dl.s,z:b.z,pel}):null;
  if(entry&&exW&&entry!==exW){entry.pair=exW;exW.pair=entry;}
  if(exW&&exW.r>1.7&&(exW.torn||0)<3){exW.torn=(exW.torn||0)+1;addStrands(seg,exW,exW.r>2.4?2:1,1.5+exW.r);}
  {const ew=toWorld(seg,(exited?Lo:Le).s,(exited?Lo:Le).w),dd=dirWorld(seg,dl.w,dl.s),iw=toWorld(seg,Li.s,Li.w);
   mist(iw.x,iw.y,-dd.x,-dd.y,4+scale*3,160,0.7,0.45);for(let i=0,n_=gn(2+scale*2);i<n_;i++)if(BLOOD.length<GQ().b){const a=Math.atan2(-dd.y,-dd.x)+rnd(-0.6,0.6),sp=rnd(80,260);BLOOD.push({x:iw.x,y:iw.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:rnd(0.2,0.45),life:3});}
   if(exited){mist(ew.x,ew.y,dd.x,dd.y,8+scale*b.cav*8,420,0.45,0.6);for(let i=0,n_=gn(4+scale*b.cav*6);i<n_;i++)if(BLOOD.length<GQ().b){const a=Math.atan2(dd.y,dd.x)+rnd(-0.45,0.45),sp=rnd(250,750);BLOOD.push({x:ew.x,y:ew.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:rnd(0.25,0.6),life:3});}
     if(Ein*b.cav>1100)spawnGibs(ew.x,ew.y,dd.x,dd.y,Math.round(scale*b.cav*1.2),'flesh',420);
     if(bhit.some(x=>x.shape!=='ribs')&&Ein>800)spawnGibs(ew.x,ew.y,dd.x,dd.y,1+Math.round(Math.random()*scale*1.5),'bone',380);}}
  seg.tracks.push({s1:Li.s,w1:Li.w,s2:Le.s,w2:Le.w,r:0.5+0.35*b.cav*Math.min(2,scale)});if(seg.tracks.length>30)seg.tracks.shift();
  if(!seg.organs.length&&!bhit.length)rep.push(seg.label.toLowerCase()+' (soft tissue)');
  const vin=Math.sqrt(2*Ein/b.m),vout=Math.sqrt(2*Math.max(0,b.E)/b.m);
  const dp=b.m*(vin-vout)*b.knock;const tm=clamp(((Li.s+Le.s)/2)/seg.len,0,1);
  const wd=dirWorld(seg,dl.w,dl.s);impulse(seg,tm,wd.x,wd.y,dp);
  hurt(seg,Li.s,Li.w,(seg.kind==='head'?30:16)*scale);
  // bullet-type effects in the tissue
  if(det){heBlast(seg,Le,dl,b,rep);b.detDone=true;}
  if(broke){const n=Math.round(clamp(5+b.broke.E/120,6,14));const c=spray(seg,Le,dl,n,clamp(2.5+b.broke.E/250,3,9),0.6,b.z,rep,'shard');rep.push('bullet broke into '+c+' fragments');}
  if(b.am&&AMMO[b.am].inc&&b.am!=='dragon')incHit(seg,Li,Le,b,rep,false);
  // even a full-jacket bullet sheds bits of lead and jacket when it smashes through bone
  else if(!det&&!broke&&bhit.some(x=>x.shape!=='ribs')&&Ein>350&&Math.random()<0.45){const bo=bhit.find(x=>x.shape!=='ribs');const at=boneHitAt(bo,Li,Le,b.z)||Le;spray(seg,{s:at.s??Le.s,w:at.w??Le.w},dl,1+Math.floor(Math.random()*3),2,1.1,b.z,rep,'lead');rep.push('lead fragments near the '+bo.name.toLowerCase());}
  if(LIMBK.includes(seg.kind)&&seg.connected&&entry&&entry.dig&&entry.r>radS(seg,entry.s)*(seg.bones.some(x=>x.broken)?0.75:1.05)){TEAR=1;cutLimbAt(seg,entry.s,rep);TEAR=0;return{exited,frac,entry};}
  if(b.k==='bmg'&&Ein>4000&&seg.connected&&!seg.gone){if(bmgHit(seg,Li,Le,Lo,exited,dl,rep,b))return{exited,frac,entry};}
  else if(b.sever&&bhit.some(x=>x.limb)&&Math.random()<0.75){
    TEAR=1;cutLimbAt(seg,(Li.s+Le.s)/2,rep);TEAR=0;
  }
  if(exited&&b.E>0&&anyWear()&&armorStop(seg,Lo,b,dl,rep,true)&&b.trk){const q=b.trk.pts[b.trk.pts.length-1];if(q)q.k='armor';}
  return{exited,frac,entry};
}
// .50 BMG: 18 kJ anti-materiel round. Limbs come off wherever they're hit, the head bursts, the neck is cut through,
// and the torso gets a fist-sized cavity that destroys everything around the wound track; a second hit in the same crater tears the body in two
function bmgHit(seg,Li,Le,Lo,exited,dl,rep,b){
  const mid={s:(Li.s+Le.s)/2,w:(Li.w+Le.w)/2},p=toWorld(seg,mid.s,mid.w),d=dirWorld(seg,dl.w,dl.s);
  const spray=(n,g)=>{mist(p.x,p.y,d.x,d.y,26+n*0.4,750,1.4,1);for(let i=0,n_=gn(n);i<n_;i++)if(BLOOD.length<GQ().b){const a=Math.atan2(d.y,d.x)+rnd(-1,1),sp=rnd(200,1000);BLOOD.push({x:p.x,y:p.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:rnd(0.25,0.75),life:3});}
    spawnGibs(p.x,p.y,d.x,d.y,g,'flesh',700);spawnGibs(p.x,p.y,d.x,d.y,Math.ceil(g/3),'bone',650);shake=Math.max(shake,0.6);};
  if(seg.kind==='head'){spray(50,10);headPop();rep.push('head destroyed');if(!V.dead)brainDeath('Head destroyed by a .50 BMG');return true;}
  if(seg.kind==='neck'){spray(35,7);const h=SEG.head;if(h&&h.joint&&!h.joint.broken){TEAR=1;sever(h.joint,rep);TEAR=0;const hp=P[h.a],hb=P[h.b];for(const q of [hp,hb]){q.px-=d.x*3.5;q.py-=d.y*3.5+1.5;}}rep.push('decapitated');if(!V.dead)brainDeath('Decapitated by a .50 BMG');return true;}
  if(LIMBK.includes(seg.kind)){spray(30,7);TEAR=1;cutLimbAt(seg,clamp(mid.s,0.6,seg.len-0.6),rep);TEAR=0;rep.push(seg.label.toLowerCase()+' blown off');return true;}
  // torso: temporary cavity ~ 15 cm wide wrecks every organ, vessel and bone near the track
  spray(45,12);
  const near=(o,R)=>{if(FSHOT&&FORG[o.id]){const f=FORG[o.id];return Math.hypot((FSHOT.x-f[0])/(f[2]+R),(FSHOT.y-f[1])/(f[3]+R))<1;}return dps(o.w,o.s,Li.w,Li.s,Lo.w,Lo.s).d<Math.max(o.rw,o.rs)+R;};
  for(const o of seg.organs){if(near(o,4.5))dmgOrgan(o,250,rep,'destroyed');else if(near(o,8))dmgOrgan(o,70,rep,'torn apart');}
  for(const v of seg.vessels){if(v.stump)continue;if(polyHit(v.pts,Li,Lo,v.width/2+5))cutVessel(v,1,{s:Lo.s,w:Lo.w,dw:dl.w,ds:dl.s},rep);}
  for(const bo of seg.bones){if(bo.shape==='ribs'){const n=3+Math.floor(Math.random()*3);for(let i=0;i<n;i++)hitBone(bo,999,rep,{s:mid.s+rnd(-4,4),w:mid.w,z:b.z});continue;}if(boneCross(bo,Li,Lo,4))hitBone(bo,400,rep,boneHitAt(bo,Li,Lo,b.z));}
  const cr=digHole(seg,{type:'hole',exit:true,s:Lo.s,w:Lo.w,r:4.6,bleed:4,dw:dl.w,ds:dl.s,z:b.z});
  if(cr){cr.torn=3;addStrands(seg,cr,3,6);rep.push('massive exit wound');const m=woundMouth(seg,cr);if(m){if(seg.kind==='abd')spillGuts(seg,m,cr);else if(ORG.heart&&!ORG.heart.out&&Math.hypot(ORG.heart.s-m.s,ORG.heart.w-m.w)<m.size+5&&Math.random()<0.5)organOut(ORG.heart,seg,m);}}
  impulse(seg,clamp(mid.s/seg.len,0,1),d.x,d.y,9000);
  // the same crater hit again: the trunk tears apart at the waist
  const wj=SEG.abd&&SEG.abd.joint;
  if(cr&&cr.r>=7.5&&wj&&!wj.broken&&(seg.kind==='abd'||(seg.kind==='chest'&&mid.s>seg.len*0.55))){TEAR=1;sever(wj,rep);TEAR=0;rep.push('body torn in half');spawnGibs(p.x,p.y,d.x,d.y,10,'flesh',500);if(!V.dead&&!V.zombie)die('Torn in half by a .50 BMG');}
  return false;
}
function explode(x,y,power=1,up=false){buzz(Math.round(40+60*Math.min(2,power)));
  V.fear=1;V.thx=x;FX.push({k:'boom',x,y,t:0,life:0.5,p:power});shake=reduceMotion?0:Math.min(1.5,power);emitSound('boom');
  const R=95*Math.sqrt(power);const rep=[];
  for(const pr of PROPS){const dx=pr.x-x,dy=pr.y-y,d=Math.hypot(dx,dy)||1,f=clamp(1-d/(R*1.3),0,1);if(f<=0)continue;const j=f*f*1600*power*Math.min(1,propMass(pr)/4+0.3);pr.vx+=dx/d*j*Math.min(1,8/propMass(pr)+0.15);pr.vy+=(dy/d-0.5)*j*Math.min(1,8/propMass(pr)+0.15);pr.av+=rnd(-8,8)*f;if(pr.type==='beaker'&&f>0.1)shatterBeaker(pr,null);}
  for(const s of segs){
    const A=P[s.a],B=P[s.b];const r=dps(x,y,A.x,A.y,B.x,B.y);const ds=Math.max(0,r.d-rad(s,r.t));const f=clamp(1-ds/R,0,1);
    if(f<=0)continue;
    let nx=r.qx-x,ny=r.qy-y;const nl=Math.hypot(nx,ny)||1;nx/=nl;ny=ny/nl-(up?0.9:0.35);
    const dv=(1500*f*f+200*f)*Math.min(1.4,power);const h=hPrev||1/360;
    for(const p of [A,B]){p.px-=nx*dv*h;p.py-=ny*dv*h;}
    if(f>0.2){
      const L=toLocal(s,r.qx-(r.qx-x)/nl*rad(s,r.t),r.qy-(r.qy-y)/nl*rad(s,r.t));
      addWound(s,{type:'burn',s:L.s,w:L.w,r:2+6*f,bleed:0});
      if(f>0.45){const tw=addWound(s,{type:'hole',exit:true,torn:1,s:L.s,w:L.w,r:0.8+2.4*f,bleed:2.2*f,dw:-nx,ds:-ny});const dl2=dirLocal(s,-nx,-ny);tw.dw=dl2.w;tw.ds=dl2.s;addStrands(s,tw,f>0.7?3:1,2+3*f);s.mtear=Math.min(1,(s.mtear||0)+0.3*f);mist(r.qx,r.qy,-nx,-ny,10*f,500,1.2,0.8);}
      for(const o of s.organs){dmgOrgan(o,95*f*f*o.blast*Math.min(1.5,power),rep,'ruptured');if(f>0.4)orgMark(o,'rupture',o.w+rnd(-0.5,0.5)*o.rw,o.s+rnd(-0.5,0.5)*o.rs);}
      for(const bo of s.bones){if(bo.shape==='ribs'){if(f>0.4)s.ribsBroken+=Math.round(f*4);continue;}if(f>0.45)hitBone(bo,140*f*f*power,rep);}
      if(f>0.5)for(const v of s.vessels){if(Math.random()<f*0.8)cutVessel(v,0.5*f,{s:L.s,w:L.w,dw:0,ds:0},rep);}
      if(s.connected){hurt(null,0,0,50*f);V.ko=Math.max(V.ko,6*f);}
      if(f>0.55){spawnGibs(r.qx,r.qy,nx,ny,Math.round(f*5*Math.min(1.5,power)),'flesh',700*f);if(f>0.7)spawnGibs(r.qx,r.qy,nx,ny,2,'bone',600*f);}
      if(s.joint&&!s.joint.broken&&f>0.6&&Math.random()<(f-0.5)*1.7*Math.min(1.3,power)&&s.kind!=='abd'){TEAR=1;if(LIMBK.includes(s.kind)&&Math.random()<0.5)cutLimbAt(s,s.len*rnd(0.3,0.7),rep);else sever(s.joint,rep);TEAR=0;}
    }
  }
  V.rise=0;if(power>1.2)bulletTime();
  for(let i=0;i<Math.round(16*power);i++){const a=rnd(0,6.28);fire('shrapnel',x,y,Math.cos(a),Math.sin(a)-(up?0.8:0),true).forEach(t=>rep.push(t));}
  for(let i=0;i<60;i++)FX.push({k:'debris',x,y,vx:rnd(-900,900),vy:rnd(-1100,up?-200:200),t:0,life:rnd(0.3,0.9)});
  const u=[...new Set(rep)];emitLog((EXPL||(power>1.5?'C4':up?'Landmine':'Grenade'))+' · '+(u.length?u.slice(0,6).join(', ')+(u.length>6?' +'+(u.length-6):''):'no casualties'),u.length?'bad':'info');
}
function frontFire(kind,fx,fy){
  if(kind==='flamer'){frontFlame(fx,fy);return;}
  const Wp=WEAP[kind];const rep=[];const Am=ammoShot(kind,Wp),nm=CART[kind]?ammoName(kind):Wp.name;const tk=newTrk(nm,view);const hitSegs=new Set();
  if(Am.am==='dragon'){for(let i=0;i<5;i++)frontFlame(fx+rnd(-6,6),fy+rnd(-6,6));FX.push({k:'fflash',x:fx,y:fy,t:0,life:0.2});emitSound(Wp.snd,1,Am?Am.E*Am.pellets:Wp.E);emitLog(nm+' · burning magnesium sprays over him','bad');return;}
  for(let i=0;i<Am.pellets;i++){
    const spr=Am.pellets>1?(Am.am==='bird'?7:9):Am.spread*60;const px=fx+rnd(-1,1)*spr,py=fy+rnd(-1,1)*spr;
    const hit=frontHit(px,py);
    if(!hit){FX.push({k:'fspark',x:px,y:py,t:0,life:0.2});continue;}
    const b={E:Am.E*rnd(0.92,1.05),m:Am.m,am:Am.am,dia:Am.dia,loss:Wp.loss,z:hit.zx,cav:Am.cav,knock:Wp.knock,sever:Wp.sever&&Am.am!=='hp',k:kind,trk:Object.assign({},tk,{pts:[],hits:[]})};
    hitSegs.add(hit.seg.label||hit.seg.id);const {s,r}=frontLocal(hit);const r0=rep.length;
    const bk=view==='back';FSHOT={x:px,y:py};let res;try{res=penetrate(hit.seg,{s,w:(bk?-1:1)*r*0.97},{s,w:(bk?1:-1)*r*0.97},2*r,b,{w:bk?1:-1,s:0},rep);}finally{FSHOT=null;}
    const setP=(w,kx,ky)=>{if(w[kx]==null||w.type!=='hole'){w[kx]=px;w[ky]=py;}else{w[kx]=lerp(w[kx],px,0.25);w[ky]=lerp(w[ky],py,0.25);}};
    if(res.entry){if(bk){setP(res.entry,'bx1','by1');res.entry.bx2=null;res.entry.by2=null;}else setP(res.entry,'fx1','fy1');const ex=res.exited?res.entry.pair:null;if(ex&&ex!==res.entry){if(bk)setP(ex,'fx1','fy1');else{setP(ex,'bx1','by1');ex.bx2=null;ex.by2=null;}}}
    for(const q of b.trk.pts){q.fx=px;q.fy=py;q.fv=view;}if(b.lod){b.lod.fx=px;b.lod.fy=py;b.lod.fv=view;}for(const x of rep.slice(r0))b.trk.hits.push(x);addTrk(b.trk);if(b.mark){b.mark.fx=px;b.mark.fy=py;b.mark.v=view;}if(bk||!res.entry)continue;res.entry.ff=true;
    {const nr=(0.6+0.14*clamp(Am.E/500,0.2,3)*Am.cav)*(Am.am==='bird'?0.35:1);const ex=FW.find(f=>f.type==='hole'&&f.seg===hit.seg&&Math.hypot(f.x-px,f.y-py)<f.r+0.8);
     if(ex){ex.hits=(ex.hits||1)+1;ex.r=Math.min(5.5,Math.sqrt(ex.r*ex.r+nr*nr*0.45)+0.05);ex.ref=res.entry;ex.band=false;}else FW.push({seg:hit.seg,x:px,y:py,r:nr,type:'hole',band:false,ref:res.entry,age:0,blood:0});}
    if(FW.length>160){const i=FW.findIndex(f=>!f.ref||!f.seg.wounds.includes(f.ref));FW.splice(i>=0?i:0,1);}
  }
  if(!V.dead){V.fear=Math.min(1,V.fear+0.3);const bx=(P[SEG.chest.a].x+P[SEG.abd.b].x)/2;V.thx=bx+(view==='back'?-150:150);}
  FX.push({k:'fflash',x:fx,y:fy,t:0,life:0.12});shake=reduceMotion?0:0.15;
  emitSound(Wp.snd,1,Am?Am.E*Am.pellets:Wp.E);if(!rep.length&&hitSegs.size)rep.push('soft-tissue wound · '+[...hitSegs].map(n=>String(n).toLowerCase()).join(', '));reportHit(nm+(view==='back'?' (back)':' (front)'),rep);
}
function lodgedXY(L){
  if(view==='side')return toWorld(L.seg,L.s,L.w);
  if(!L.seg.connected)return null;
  if(L.fv)return L.fv===view?{x:L.fx,y:L.fy}:{x:L.fx,y:L.fy};
  return frontPos(L.seg,L.s,clamp(L.z==null?0:L.z,-1,1));
}
function bulletName(L){if(L.k==='shard')return'bullet fragment';if(L.k==='lead')return'lead fragment';if(L.mush)return'expanded bullet';if(L.core)return'bullet base';return({pistol:'9 mm bullet',smg:'9 mm bullet',revolver:'.44 bullet',rifle:'5.56 bullet',shotgun:'shotgun pellet',sniper:'.338 bullet',shrapnel:'fragment'})[L.k]||'bullet';}
