/* TRAUMA_LAB_MAIN */
/* ===== sim/story.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
/* =========================================================
   STORY MODE · PROTOTYPE (chapter 0: three rooms of the lab)
   You are the test subject. You move him yourself; every injury is the full simulation: a bullet in the thigh tears
   muscle and slows the gait, pain slows it more, blood loss makes the aim shake and the legs give way, a broken leg
   drops him. Treatment comes from what you find and takes real time, during which you cannot walk.
   He faces where you aim (with a weapon) or where you walk, and walks backwards while aiming behind him.
   Cover is real furniture (rigid bodies with mass and friction): you sit with your back against it, and bullets go
   through it or not depending on what it is made of.
   Simulation only: reports through emitLog / emitSound like the rest of sim/.
   ========================================================= */
const STORY={on:false};ACT=STORY;
// the level, left to right (cm), 12 m of lab in three rooms joined by open doorways:
//  B-07 holding: you wake here; a medicine cabinet on the wall, a pistol and a knife on a shelf, a crowbar on the floor
//  B-08 storage: one low steel crate (95 cm: sitting behind it you are hidden, crouching you are not) and a guard
//  B-09 security: another low crate, a sentry gun on a tripod that sweeps its sensor up and down, and the jammed exit
//  door (the crowbar pries it)
const STORYL={start:-540,
  rooms:[{x0:-600,x1:-250,name:'B-07 · SUBJECT HOLDING'},{x0:-250,x1:150,name:'B-08 · STORAGE'},{x0:150,x1:600,name:'B-09 · SECURITY'}],
  doorways:[-250,150],cab:-475,shelf:-400,crowbar:-320,door:556,exit:572,
  tur:{x:470,y:-150,range:330},boxes:[{x:-30,k:'lowbox'},{x:300,k:'lowbox'}],
  // a guard is a whole second body (sim/bodies): the subject's anatomy and physiology, in a uniform shirt, trousers,
  // boots and a soft vest (stops a 9 mm round to the chest or belly, not the head, neck or limbs). He doesn't act yet
  guards:[{x:85,face:-1,wear:['under','shirt','jeans','boots','vest']}]};
// carried items: weapons are held in the hand, medicine is used on the worst wound (or where you choose, in the medical view)
const SITEM={crowbar:{name:'Crowbar',w:true},pistol:{name:'Pistol',w:true},knife:{name:'Knife',w:true},bandage:{name:'Bandage',t:4},gauze:{name:'Gauze pack',t:6},tourniquet:{name:'Tourniquet',t:5},morphine:{name:'Morphine auto-injector',t:2.5}};
function storyInit(){
  Object.assign(STORY,{on:true,t:0,dir:0,held:null,inv:[],ammo:0,
    items:[{id:'cab',x:STORYL.cab,y:-128,loot:['bandage','bandage','gauze','tourniquet','morphine']},{id:'pistol',x:STORYL.shelf-14,y:-98},{id:'knife',x:STORYL.shelf+16,y:-97},{id:'crowbar',x:STORYL.crowbar,y:-1.6}],
    door:{x:STORYL.door,open:0,pry:0,prying:false},
    tur:{x:STORYL.tur.x,y:STORYL.tur.y,hp:3,cd:0,ang:Math.PI,flash:0,seen:false,acq:0,tgt:null,down:false,fall:0,mode:'scan',scan:0,lost:0},
    busy:null,vault:null,aim:{x:0,y:-120},aimSeen:-9,aimA:null,raise:0,fireQ:false,cool:0,done:false,fail:null,pryKey:false,msg:'',msgT:0,run:false,duckWant:false,duckLatch:false,duckK:0,jy:0,jv:0,
    prone:false,proneT:0,proneX:0,proneF:1,proneAim:false,fist:null,upReq:false,kickT:0,kicked:false,stabT:0,stabHit:false,coverGo:null,cover:null,sitK:0,blind:false,
    med:false,medSel:null,landT:0,turnT:0,blocked:false,blockDir:0,boxes:[]});
  for(const c of STORYL.boxes){const pr=spawnProp(c.k,c.x,0,0,0,null);pr.story=true;STORY.boxes.push(pr);}
  bodiesClear();for(const g of STORYL.guards)spawnPerson(g.x,{name:'Guard',wear:g.wear,face:g.face});
}
function storyX(){return (P[SEG.chest.a].x+P[SEG.abd.b].x)/2;}
function storyHand(){const h=SEG.nearHand;return h&&h.connected&&armOK('near')?h:(SEG.farHand&&SEG.farHand.connected&&armOK('far')?SEG.farHand:null);}
function storyNear(x,r){return Math.abs(storyX()-x)<r;}
function storyRoom(x){const R=STORYL.rooms;for(let i=0;i<R.length;i++)if(x<R[i].x1)return i;return R.length-1;}
// a box-shaped prop's outline in the world: left and right faces, top
function storyBoxEdges(pr){let x0=1e9,x1=-1e9,top=0;for(const c of pr.C){const p=propPt(pr,c);x0=Math.min(x0,p.x-c[2]);x1=Math.max(x1,p.x+c[2]);top=Math.min(top,p.y-c[2]);}return {x0,x1,top};}
// walking speed (cm/s). An adult walks at ≈1.35 m/s, jogs at ≈3.4 m/s barefoot (a fit adult sprints 6–8 m/s in shoes);
// stepping backwards ≈0.8 m/s, a backwards jog ≈1.4 m/s. Crouched you move at about half speed. Pain, torn leg muscle,
// blood loss and low consciousness all slow it (exercise tolerance falls as circulating volume falls, ATLS class
// II–III). A broken leg or spine stops running. "Forwards" is the way he faces (ACT is whoever is loaded)
function storyCanRun(){return legsOK()&&(ACT.duckK||0)<0.3&&V.painEff<85&&V.blood>3300;}
function storyWalkSpeed(){
  const fwd=V.walk*FACE>0,run=ACT.run&&storyCanRun(),base=fwd?(run?340:135):(run?140:80);let k=clamp(1.1-V.painEff/110,0.3,1);k*=1-0.55*(ACT.duckK||0);
  for(const id of ['nearThigh','farThigh','nearShin','farShin']){const s=SEG[id];if(s&&s.mtear)k*=1-0.55*Math.min(1,s.mtear);}
  const frac=V.blood/5000;k*=clamp((frac-0.55)/0.25,0.35,1);k*=clamp(V.consc,0.3,1);
  return Math.abs(V.walk)*base*k;}
// stride: a full gait cycle covers ≈1.4 m at a normal walk and shortens when slow
function storyStride(sp){return clamp(50+sp*0.6,50,220);}
// lean of the trunk into a run (cm at the chest): sprinters lean ≈10–15°
function storyLean(){return ACT.on?clamp(((V.wsp||0)-135)/205,0,1)*8*Math.sign(V.walk||0):0;}
/* ---- standing, walking, jumping, crouching and sitting: the subject and the guards (ACT, FACE = whoever is loaded)
   The balance is a puppet: hips, chest, head and feet are pulled to where a person of his size has them and the leg
   muscles follow the gait. Each pull keeps only 30 % of its move as speed and the trunk's own speed fades by 1.5 % a
   step (the sandbox keeps ≈92 % and none fades): his muscles brake the trunk at every step, as a person's do, so he
   doesn't sway, bounce, overshoot a landing or get thrown by his own arms. */
const LOCO={keep:0.3,damp:0.985};
function storyLoco(h,r){const A=ACT,F=FACE,feet=[SEG.farFoot,SEG.nearFoot];
  if(V.anchorX==null||r<0.02)V.anchorX=clamp((P[SEG.abd.b].x+P[SEG.farFoot.a].x+P[SEG.nearFoot.a].x)/3,-ROOM+25,ROOM-25);
  const sit=A.sitK||0,jy=A.jy||0,vt=!!A.vault,e=ease(r)*(1-0.72*(A.duckK||0)),fa=(P[SEG.farFoot.a].x+P[SEG.nearFoot.a].x)/2;
  const walking=r>=0.999&&Math.abs(V.walk)>0.06&&sit<0.05&&!vt;V.walkOn=walking;
  if(walking){const sp=storyWalkSpeed();const nx=clamp(V.anchorX+Math.sign(V.walk)*sp*h,-ROOM+30,ROOM-30);V.gait+=Math.abs(nx-V.anchorX)/storyStride(sp)*6.283;V.anchorX=nx;V.wsp=sp;V.plantT=T+0.5;}
  else{V.wsp=0;if(r>=0.999&&Math.abs(fa-V.anchorX)>6&&T>(V.plantT||0)&&(A.duckK||0)<0.05&&sit<0.05&&jy>=0&&!vt)V.anchorX=fa;}
  const fx=V.anchorX,ln=storyLean();
  // standing (e = 1) to a full crouch (head ≈120 cm); sitting on the floor: hips 13 cm up, the back slumped ≈15° back
  // against what is behind him, shoulders at 54 cm, the top of the head at ≈92 cm
  const tg={hip:[fx+F*lerp(-9,0.3,e),lerp(-38,-91,e)+jy],chest:[fx+F*lerp(12,0.3,e)+ln,lerp(-78,-136,e)+jy],head:[fx+F*lerp(20,-0.2,e)+ln*1.4,lerp(-102,-166,e)+jy]};
  // (the back reclines onto what is behind him only at the end, so it settles against it instead of falling into it)
  if(sit>0){const st={hip:[fx,-13],chest:[fx-F*12,-54],head:[fx-F*12,-83]};for(const k in tg){tg[k][0]=lerp(tg[k][0],st[k][0],k==='hip'?sit:sit*sit);tg[k][1]=lerp(tg[k][1],st[k][1],sit);}}
  const pull=(p,tx,ty,k,mx)=>{let dx=(tx-p.x)*k,dy=(ty-p.y)*k;const m=Math.hypot(dx,dy);if(m>mx){dx*=mx/m;dy*=mx/m;}
    const vx=(p.x-p.px)*LOCO.damp,vy=(p.y-p.py)*LOCO.damp;p.x+=dx;p.y+=dy;p.px=p.x-vx-dx*LOCO.keep;p.py=p.y-vy-dy*LOCO.keep;};
  // in the air the trunk rides the jump curve (≈0.8 cm a step at take-off), so it may move further per step
  // (≈0.8 cm a step lets him drop into a crouch in ≈0.2 s; getting up from the floor stays gentler)
  // sitting down or getting up the trunk moves at most ≈0.4 cm a step (≈1.4 m/s): it lowers itself, it doesn't drop
  const air=jy<0,k=(r<0.999?0.09:0.1)*(air?(vt?4:3):1)*(sit>0?1.5:1),mx=(sit>0.01&&sit<0.98?0.4:r<0.999?0.3:Math.max(0.8,(V.wsp||0)/360*1.6))*(air?2:1);
  if(walking){const ds=Math.sign(V.walk),amp=clamp(8+V.wsp*0.13,8,42),lh=clamp(6+V.wsp*0.035,6,17),fmx=Math.max(0.6,V.wsp/360*2.6);
    for(const ft of feet){const ph=V.gait+(ft.side==='near'?0:Math.PI),ox=ds*amp*Math.sin(ph),lift=Math.max(0,Math.cos(ph))*lh;
      pull(P[ft.a],fx+ox,-4-lift+jy,0.16,fmx);pull(P[ft.b],fx+ox+F*15,-2.2-lift*0.7+jy,0.12,fmx);}}
  else for(const ft of feet){const sd=ft.side==='near'?1:-1,vd=vt?Math.sign(A.vault.x1-A.vault.x0)||F:0;
    let ax=fx+sd*F*1.5,ay=-4+jy*0.6,bx=ax+F*15,by=-2.2+jy*0.6;
    if(sit>0){ax=lerp(ax,fx+F*(40+sd*2),sit);ay=lerp(ay,-5,sit);bx=lerp(bx,fx+F*(54+sd*2),sit);by=lerp(by,-3,sit);}
    if(vt){ay=tg.hip[1]+16;ax-=vd*6;bx-=vd*6;}
    const kk=(r<0.999||T<(V.plantT||0)||sit>0||air)?1:0.3,fm=0.5+(air?1.5:0)+(vt?1:0);
    pull(P[ft.a],ax,ay,0.13*kk*(vt?3:1),fm);pull(P[ft.b],bx,by,0.09*kk*(vt?3:1),fm);}
  // sitting: the knees come up in front of him
  if(sit>0.05)for(const sd of ['near','far']){const t=SEG[sd+'Thigh'];if(t&&t.connected)pull(P[t.b],fx+F*(26+(sd==='near'?1:-1)),-44,0.06*sit,0.5);}
  pull(P[SEG.abd.b],tg.hip[0],tg.hip[1],k,mx);pull(P[SEG.chest.a],tg.chest[0],tg.chest[1],k*1.2,mx);pull(P[SEG.head.a],tg.head[0],tg.head[1],k*0.8,mx);}
// which way he faces: toward where you aim while a weapon is up (or was aimed in the last 2.5 s), otherwise toward
// where he walks. He turns only on his feet (fully up: turning while sitting would swing his legs through what is
// behind him), and not in the middle of a jump, a climb, a kick, a stab or a treatment
function storyFacing(x){const S=STORY;if(S.turnT>0||V.rise<0.95||S.sitK>0.02||S.prone||S.vault||S.busy||S.kickT>0||S.stabT>0||S.cover||S.jy<0||S.door.prying)return;
  let want=0;const armed=S.held==='pistol'||S.held==='knife';
  if(armed&&S.t-S.aimSeen<2.5){const dx=S.aim.x-x;if(Math.abs(dx)>12)want=Math.sign(dx);}
  else if(S.dir)want=S.dir;
  if(want&&want!==FACE)storyTurn();}
function storyTurn(){const S=STORY;bodyTurn(storyX());S.turnT=0.18;S.aimA=null;S.reach=null;}
// jump: a standing vertical jump is ≈40 cm for an untrained adult (take-off ≈2.8 m/s); injuries cut it
// climbing over furniture up to ≈1.4 m (both hands on top, a leg swung over): ≈1.1 s, and only with working arms and
// legs, bearable pain and enough blood. Within ≈60 cm of it (a step away), the jump button climbs instead of jumping
function storyVaultTarget(){const S=STORY;if(V.anchorX==null)return null;const ax=V.anchorX,d=S.dir||FACE;
  for(const pr of PROPS){if(!PROPDEF[pr.type].box)continue;const b=storyBoxEdges(pr);
    if(b.top<-145||b.top>-35)continue;if(d>0&&ax>b.x0-60&&ax<b.x0)return {pr,...b,to:b.x1+24};if(d<0&&ax<b.x1+60&&ax>b.x1)return {pr,...b,to:b.x0-24};}
  return null;}
function storyVault(){const S=STORY;if(S.vault||S.busy||V.dead||V.rise<0.99||S.prone||S.cover)return false;const t=storyVaultTarget();if(!t)return false;
  if(!legsOK()||!armOK('near')||!armOK('far')||V.painEff>80||V.blood<3500){S.msg='You’re too hurt to climb over that';S.msgT=2;return false;}
  // room to land: ≈50 cm clear beyond it (a body landing needs its own width plus the arms)
  const dir=t.to>V.anchorX?1:-1;for(const q of PROPS){if(q===t.pr||!PROPDEF[q.type].box)continue;const b=storyBoxEdges(q);
    if(dir>0?(b.x0>t.x1&&b.x0<t.to+30):(b.x1<t.x0&&b.x1>t.to-30)){S.msg='No room to land on the other side';S.msgT=2;return false;}}
  if(dir>0&&S.door.open<1&&t.to+30>S.door.x){S.msg='No room to land on the other side';S.msgT=2;return false;}
  if(FACE!==dir)storyTurn();
  S.vault={t:0,dur:1.1,x0:V.anchorX,x1:t.to,top:t.top,pr:t.pr};S.duckLatch=false;emitSound('thud',0.3);return true;}
function storyJump(){const S=STORY;if(S.cover){storyCover();return true;}if(storyVaultTarget()&&storyVault())return true;
  if(S.jy<0||S.landT>0.05||S.busy||V.dead||V.rise<0.99||!legsOK()||S.duckK>0.3||S.kickT>0||S.sitK>0.05||S.vault)return false;
  let hgt=40*clamp(1.1-V.painEff/100,0.2,1)*clamp((V.blood/5000-0.6)/0.25,0.2,1);for(const id of ['nearThigh','farThigh','nearShin','farShin']){const s=SEG[id];if(s&&s.mtear)hgt*=1-0.6*Math.min(1,s.mtear);}
  // a short crouch first loads the legs, as anyone does before a jump; the take-off speed drives the jump curve S.jy
  // that the balance follows (it is not given to the body points as well: that counted it twice)
  S.duckK=Math.max(S.duckK,0.25);const v=Math.sqrt(2*G*hgt);S.jv=-v;S.jy=-0.01;emitSound('thud',0.15);return true;}
// kick: a front kick. The foot reaches ≈60 cm in front of the hip at knee height; a real front kick delivers a peak force
// of 2–4 kN over ≈10 ms, an impulse of ≈30–40 N·s: a 35 kg crate slides off at ≈1 m/s, an 80 kg steel crate barely moves
function storyKick(){const S=STORY;if(S.kickT>0||S.busy||V.dead||V.rise<0.99||S.jy<0||S.sitK>0.05||!SEG.nearFoot.connected||!legsOK())return false;S.kickT=0.5;S.kicked=false;S.kickX=V.anchorX??P[SEG.abd.b].x;S.kickF=FACE;emitSound('whoosh',0.3);return true;}
function storyKickHit(){const S=STORY,ft=P[SEG.nearFoot.b],J=3600*S.kickF;let hit=false;
  for(const pr of PROPS){let best=null,bd=1e9;for(const c of pr.C){const p=propPt(pr,c);const d=Math.hypot(p.x-ft.x,p.y-ft.y)-c[2];if(d<bd){bd=d;best=p;}}
    if(bd<22){rbImp(pr,best.x-pr.x,best.y-pr.y,J,-Math.abs(J)*0.15);hit=true;emitSound('thud',0.9);emitLog((PROPDEF[pr.type].name||'It')+' kicked','info');}}
  // the sentry's tripod: knocked over, it lies on its side and cannot aim at you
  const U=S.tur;if(!U.down&&Math.abs(ft.x-U.x)<34&&ft.y>-70){U.down=true;U.fall=0;hit=true;emitSound('thud',1);emitSound('tink',0.8);emitLog('You kicked the sentry over · it can’t aim from the floor','good');}
  // kicking hurts a bare foot a little; kicking with a broken leg is not possible (checked above)
  if(hit)V.pain=Math.min(100,(V.pain||0)+4);return hit;}
// knife: a straight thrust from the chest to arm's length (≈0.15 s out). The point goes in where it meets a body; the
// wound is the sandbox's stab (blade length, what it cuts, clothing and the vest can stop it)
function storyStab(){const S=STORY;if(S.stabT>0||S.busy||V.dead||(V.rise<0.9&&!S.prone)||S.sitK>0.5)return false;const hd=storyHand();if(!hd)return false;
  S.stabT=0.4;S.stabHit=false;S.aimSeen=S.t;emitSound('whoosh',0.25);return true;}
function storyKnifeTip(){const hd=storyHand();if(!hd)return null;const a=P[hd.a],b=P[hd.b],l=Math.hypot(b.x-a.x,b.y-a.y)||1;return {x:b.x+(b.x-a.x)/l*16,y:b.y+(b.y-a.y)/l*16};}
// a limb pulled toward a pose. Its speed settles at the speed it is being moved: each step keeps 85 % of the speed it
// had plus 15 % of the move (up to v1.19 it kept 90 % of both, so a held pull built up ≈9× the real speed: a hand
// barely moving read as 6 m/s, flung the body about and bruised him on any furniture it touched)
function pullPt(q,tx,ty,k,mx){let dx=(tx-q.x)*k,dy=(ty-q.y)*k;const m=Math.hypot(dx,dy);if(m>mx){dx*=mx/m;dy*=mx/m;}
  const vx=(q.x-q.px)*0.85,vy=(q.y-q.py)*0.85;q.x+=dx;q.y+=dy;q.px=q.x-vx-dx*0.15;q.py=q.y-vy-dy*0.15;}
// the furniture touching in a row ahead of a piece in direction d (pushing one pushes the next)
function storyRow(pr,d){const row=[pr];let cur=pr;for(let k=0;k<5;k++){const e=storyBoxEdges(cur),f=d>0?e.x1:e.x0;
  let nx=null;for(const q of PROPS){if(row.includes(q)||!PROPDEF[q.type].box)continue;const b=storyBoxEdges(q),g=d>0?b.x0:b.x1;if(Math.abs(g-f)<3){nx=q;break;}}if(!nx)break;row.push(nx);cur=nx;}return row;}
// a closed steel door at x: keeps the body on its left
function storyWall(x,open){if(open>=1)return;const S=STORY;if(V.anchorX!=null&&V.anchorX>x-30&&V.anchorX<x&&S.dir>0){S.blocked=true;S.blockDir=1;}const top=-232+open*232;for(const p of P){if(p.gone)continue;if(p.y>top&&p.x>x-4-p.r&&p.x<x+40){p.x=x-4-p.r;if(p.px>p.x)p.px=p.x;}}if(V.anchorX!=null&&V.anchorX>x-26)V.anchorX=x-26;
  for(const pr of PROPS){if(pr.x<x+30&&pr.x+pr.R>x-4){let m=-1e9;for(const c of pr.C){const p=propPt(pr,c);m=Math.max(m,p.x+c[2]);}if(m>x-4){pr.x-=m-(x-4);if(pr.vx>0)pr.vx=-pr.vx*0.2;}}}}
// walking into furniture: he stops at its face and, if you keep walking into it, leans in and pushes with ≈350 N (a hard
// push from the legs). Sliding friction μ·m·g is ≈190 N for a 35 kg crate and ≈390 N for the 80 kg steel crate, which
// therefore doesn't move; everything touching in a row adds up. If the push wins, the row slides at a speed set by the
// margin (≈0.5 m/s for a lone crate); if not, nothing moves
function storyPush(pr,d){const S=STORY;if(!(V.walk*d>0.2&&S.dir===d))return;S.pushing=pr;const row=storyRow(pr,d);let Ff=0;for(const q of row)Ff+=(PROPDEF[q.type].mu||0.5)*q.m*9.81;const F=350;
  if(F<=Ff){S.blocked=true;S.blockDir=d;S.pushV=0;if(!S.heavyMsg){S.heavyMsg=true;S.msg='Too heavy to push · climb over it (↑) or take cover behind it';S.msgT=2.2;}return;}
  const v=110*(F-Ff)/F;for(const q of row){if(q.vx*d<v)q.vx=v*d;
    // both hands spread on its face keep it upright while it slides (a push at hip height would tip a tall crate)
    q.av*=0.6;q.ang*=0.9;}S.pushV=v;}
const PRONE_T=1.0;   // seconds to go from standing to flat on the belly (see PRONEK)
function storyStep(h){
  if(!STORY.on||STORY.done)return;const S=STORY;S.t+=h;S.cool=Math.max(0,S.cool-h);S.msgT=Math.max(0,S.msgT-h);S.turnT=Math.max(0,S.turnT-h);
  const x=storyX();
  // ---- going to cover, and sitting there with your back against it. He eases off over the last 20 cm and sits once
  // nearly still (walking into it and sitting at 1.3 m/s throws the back against the crate)
  if(S.coverGo){const g=S.coverGo,d=g.x-x;if(S.busy||V.rise<0.99||S.prone||V.dead)S.coverGo=null;
    else if(Math.abs(d)<8&&Math.abs(V.walk)<0.25){S.coverGo=null;S.cover={pr:g.pr,side:g.side};S.duckLatch=false;if(FACE!==g.side)storyTurn();}else S.dir=Math.abs(d)<8?0:Math.abs(d)<20?(Math.abs(V.walk)>0.4?0:Math.sign(d)):Math.sign(d);}
  if(S.cover){const c=S.cover,b=PROPS.includes(c.pr)?storyBoxEdges(c.pr):null;
    if(!b||b.top>-60||S.prone||V.rise<0.6||V.dead||S.busy)S.cover=null;
    else{V.anchorX=c.side<0?b.x0-22:b.x1+22;if(S.dir===c.side&&S.sitK>0.85)S.cover=null;}}   // walking away from it stands you up
  // sitting down or getting up takes ≈0.4 s
  S.sitK+=((S.cover?1:0)-S.sitK)*Math.min(1,h*7);if(S.sitK<0.003)S.sitK=0;
  // ---- walking: the player sets the direction, the body does the rest. It answers in ≈0.1 s
  const want=(S.busy||V.dead||S.fail||S.kickT>0||S.vault||S.cover||S.sitK>0.3||S.stabT>0.2||(S.blocked&&S.dir===S.blockDir))?0:S.dir;V.walk+=(want-V.walk)*Math.min(1,h*12);if(Math.abs(V.walk)<0.02)V.walk=0;
  storyFacing(x);
  // ducking: knees and hips bend until the head is ≈120 cm off the floor (from 166) in ≈0.15 s; landing from a jump
  // bends them briefly
  const duck=(S.duckWant||S.duckLatch)&&!V.dead&&S.jy>=0&&!S.prone&&!S.cover;S.landT=Math.max(0,S.landT-h);
  S.duckK+=((duck?1:S.landT>0?0.35:0)-S.duckK)*Math.min(1,h*(S.landT>0?16:14));
  // the jump: the body's targets ride a ballistic arc while the legs push off
  if(S.jy<0&&!S.vault){S.jy+=S.jv*h;S.jv+=G*h;if(S.jy>=0){S.jy=0;S.jv=0;S.landT=0.2;emitSound('thud',0.3);}}
  // ---- lying down (prone) and getting up again
  // going prone is a controlled drop forward (storyPronePose moves the limbs); the standing balance lets go at once
  if(S.prone&&!S.proneT){const px=storyProneRoom(P[SEG.abd.b].x);if(px==null){S.prone=false;S.msg='No room to lie down here';S.msgT=1.8;}else{S.proneX=px;S.proneF=FACE;S.proneS=null;S.pbx=null;}}
  if(S.prone)S.proneT+=h;else S.proneT=0;
  if(S.prone&&V.rise>0){V.rise=Math.max(0,V.rise-h*5);V.riseCD=T+0.4;}
  if(S.prone)V.riseCD=Math.max(V.riseCD||0,T+0.3);
  if(!S.prone&&S.upReq){S.upReq=false;if(V.rise<=0.001){V.riseCD=0;V.stillT=Math.max(V.stillT||0,1.3);V.lowT=Math.max(V.lowT||0,1);}}
  // ---- climbing over: the hips follow an arc over the top while the legs tuck; it ends crouched on the far side
  if(S.vault){const v=S.vault;v.t+=h;const u=Math.min(1,v.t/v.dur);
    // the hips rise to ≈25 cm above the top (standing hip height is 91 cm) while the feet tuck up under them
    const lf=u<0.35?ease(u/0.35):u<0.65?1:ease(Math.max(0,(1-u)/0.35)),ax=lerp(v.x0,v.x1,ease(clamp((u-0.33)/0.34,0,1))),lift=Math.max(20,-v.top+25-91)*lf;
    V.anchorX=ax;S.jy=u<1?-lift-0.01:0;
    S.duckK=Math.max(S.duckK,0.55*Math.sin(Math.PI*u));if(u>=1){S.passPr=v.pr;S.passT=0.5;S.vault=null;S.jy=0;S.landT=0.25;emitSound('thud',0.35);}}
  S.passT=Math.max(0,(S.passT||0)-h);
  // ---- kick: wind up, strike, recover. Contact is checked through the strike (0.34–0.16 s left), the first touch
  // delivers the impulse
  if(S.kickT>0){S.kickT-=h;if(!S.kicked&&S.kickT<0.34){if(storyKickHit())S.kicked=true;else if(S.kickT<0.16){S.kicked=true;emitSound('whoosh',0.2);}}}
  // ---- knife: the point is checked while the arm is out (0.14–0.24 s into the thrust)
  if(S.stabT>0){S.stabT-=h;const u=1-S.stabT/0.4;if(!S.stabHit&&u>0.35&&u<0.62){const tip=storyKnifeTip();
    if(tip)for(const b of BODIES)if(withBody(b,()=>stab(tip.x,tip.y))){S.stabHit=true;break;}
    const U=S.tur;if(!S.stabHit&&tip&&Math.hypot(tip.x-U.x,tip.y-U.y)<14){S.stabHit=true;emitSound('tink',0.8);S.msg='The blade skids off the steel housing';S.msgT=1.6;}}}
  // ---- furniture and people in the way
  S.blocked=false;S.pushing=null;if(V.anchorX!=null&&V.rise>0.6&&!V.dead&&!S.vault&&!S.cover&&S.sitK<0.3){const ax=V.anchorX;
    for(const pr of PROPS){if(!PROPDEF[pr.type].box)continue;const b=storyBoxEdges(pr);
      if(b.top>-35)continue;   // lying low (knocked over): you can step over it
      if(ax<b.x0+10&&ax>b.x0-40){if(ax>b.x0-22)V.anchorX=b.x0-22;if(ax>b.x0-24)storyPush(pr,1);}
      else if(ax>b.x1-10&&ax<b.x1+40){if(ax<b.x1+22)V.anchorX=b.x1+22;if(ax<b.x1+24)storyPush(pr,-1);}}}
  // a man on his feet is an obstacle, like the furniture. Your walk is driven, not a force, so it would shove him along;
  // instead you stop with your chest ≈40 cm from his (two torsos ≈22 cm deep plus the arms). Lying down he is no
  // obstacle: you walk past him (the room has depth the side view doesn't show)
  if(V.anchorX!=null&&V.rise>0.6&&!V.dead&&!S.vault)for(const b of BODIES){const o=withBody(b,()=>({up:V.rise>0.6,x:storyX()}));if(!o.up)continue;const ax=V.anchorX;
    if(ax<o.x&&ax>o.x-60){if(ax>o.x-40)V.anchorX=o.x-40;if(S.dir>0&&ax>o.x-42){S.blocked=true;S.blockDir=1;}}
    else if(ax>=o.x&&ax<o.x+60){if(ax<o.x+40)V.anchorX=o.x+40;if(S.dir<0&&ax<o.x+42){S.blocked=true;S.blockDir=-1;}}}
  // ---- the jammed exit door (crowbar)
  const D=S.door;storyWall(D.x,D.open);
  if(D.pry>=1&&D.open<1)D.open=Math.min(1,D.open+h/1.4);
  // prying: crowbar in the hand, at the door, holding E for ≈3 s (the bolt shears)
  D.prying=false;
  if(S.pryKey&&S.held==='crowbar'&&D.pry<1&&storyNear(D.x-30,45)&&!S.busy&&V.rise>0.9&&!S.cover){const hd=storyHand();if(hd){if(FACE<0)storyTurn();D.prying=true;D.pry=Math.min(1,D.pry+h/3);
    if(D.pry>=1){emitSound('thud',1);emitSound('rumble',0.5);emitLog('The bolt shears · the door slides open','good');}}}
  storySentry(h);
  // ---- treatment in progress
  if(S.busy){S.busy.t+=h;const b=S.busy;b.p=toWorld(b.tgt.g,b.tgt.s,b.tgt.w);if(b.t>=b.dur){storyApply(b);S.busy=null;}}
  // ---- the gun. It is in both hands whenever you can use it; it comes up to the eye when you aim (the last 2.5 s) or
  // fire, and rests at the low ready (muzzle ≈45° down, elbows in) otherwise and while running. Up in ≈0.2 s, down in
  // ≈0.35 s. Not in the air: the arms have nothing to brace against there
  const hd=storyHand(),gun=S.held==='pistol'&&!!hd&&!V.dead&&!S.busy,pd=S.prone&&S.proneT>=PRONE_T;
  S.blind=!!(gun&&S.cover&&S.sitK>0.8&&(S.aim.x-S.cover.pr.x)*S.cover.side<0);
  // (not while sitting down or getting up either: the arms would swing round into the crate behind him)
  const can=gun&&S.kickT<=0&&S.jy>=0&&!S.vault&&S.landT<=0&&S.stabT<=0&&!S.pushing&&(S.sitK<0.03||S.sitK>0.8)&&((V.rise>0.9&&!S.prone)||pd);
  const up=can&&(S.t-S.aimSeen<2.5||S.fireHeld||S.fireQ)&&!(S.run&&Math.abs(V.walk)>0.5&&!S.prone);
  S.raise+=((up?1:0)-S.raise)*Math.min(1,h*(up?8:4.5));S.aiming=can;S.proneAim=can&&pd;
  if(S.fireQ&&(!can||(S.raise>0.85&&(!S.blind||storyBlindReady())))){S.fireQ=false;if(can)storyFire();}
  // ---- end of the lab
  if(D.open>=1&&x>STORYL.exit){S.done=true;S.dir=0;emitLog('You made it out of the lab','good');}
  if(V.dead&&!S.fail){const l=[...LOG].reverse().find(q=>/^Subject deceased/.test(q.text));S.fail=l?l.text.replace(/^Subject deceased · /,'').replace(/ · [0-9:]+$/,''):'You died';}
}
// ---- the sentry gun (B-09). Its sensor is a narrow beam (±4.5°) that sweeps ±24° up and down in front of it, once every
// ≈4.2 s, out to 3.3 m: the whole security room and nothing beyond its doorway. When the beam crosses a part of you it
// can see it locks on (a beep) and then tracks whatever it can see of you, firing a 9 mm round every 1.0–1.6 s from
// 0.9 s after the lock, with a spread of ≈2.8° (1 SD, ≈15 cm at 3 m). Out of sight for 1.2 s, it goes back to sweeping
function storySentry(h){const S=STORY,U=S.tur;U.flash=Math.max(0,U.flash-h);if(U.down)U.fall=Math.min(1,U.fall+h*3);
  if(!(U.hp>0&&!U.down&&!V.dead)){U.seen=false;U.tgt=null;return;}
  if(U.mode!=='track'){U.scan+=h;const a=Math.PI+Math.sin(U.scan*1.5)*0.42;U.ang+=wrap(a-U.ang)*Math.min(1,h*10);U.seen=false;U.tgt=null;U.acq=0;
    const t=storySeen(U.ang,0.08);if(t){U.mode='track';U.tgt=t;U.seen=true;U.lost=0;U.acq=0;U.cd=0;emitSound('beep',0.6);}return;}
  const t=storySeen(null,1.3);U.tgt=t;U.seen=!!t;
  if(t){U.lost=0;U.acq+=h;const ta=Math.atan2(t.y-U.y,t.x-U.x);U.ang+=wrap(ta-U.ang)*Math.min(1,h*4);
    if(U.acq>0.9){U.cd-=h;if(U.cd<=0){U.cd=1.0+Math.random()*0.6;const a=U.ang+(Math.random()+Math.random()-1)*0.12;U.flash=0.07;
      storyShoot(U.x+Math.cos(U.ang)*16,U.y+Math.sin(U.ang)*16,Math.cos(a),Math.sin(a));}}}
  else{U.lost+=h;U.acq=Math.max(0,U.acq-h);if(U.lost>1.2){U.mode='scan';U.scan=Math.asin(clamp(wrap(U.ang-Math.PI)/0.42,-1,1))/1.5;}}}
// a story round: the normal bullet (it goes through props by material, see propBullet) without the sandbox's floating
// gun drawing, which in story mode would be a second gun next to the one in his hand
function storyShoot(x0,y0,dx,dy){const n=FX.length;fire('pistol',x0,y0,dx,dy);for(let i=FX.length-1;i>=n;i--)if(FX[i].k==='gun')FX.splice(i,1);}
// cover geometry: each piece of cover is a rigid body; the line of sight is tested against its (rotated) box
function propBox(pr){const d=PROPDEF[pr.type];return d.box?{x0:d.box[0]-pr.ox,x1:d.box[1]-pr.ox,y0:d.box[2]-pr.oy,y1:d.box[3]-pr.oy}:null;}
function lineHitsProp(pr,ax,ay,bx,by){const b=propBox(pr);if(!b)return null;const c=Math.cos(-pr.ang),s=Math.sin(-pr.ang);
  const L=(x,y)=>{const rx=x-pr.x,ry=y-pr.y;return [rx*c-ry*s,rx*s+ry*c];};const [px,py]=L(ax,ay),[qx,qy]=L(bx,by);const dx=qx-px,dy=qy-py;let t0=0,t1=1;
  for(const [p,q] of [[-dx,px-b.x0],[dx,b.x1-px],[-dy,py-b.y0],[dy,b.y1-py]]){if(p===0){if(q<0)return null;continue;}const r=q/p;if(p<0){if(r>t1)return null;if(r>t0)t0=r;}else{if(r<t0)return null;if(r<t1)t1=r;}}
  return t0<=t1?t0:null;}
function coverBlocks(ax,ay,bx,by){for(const pr of PROPS)if(PROPDEF[pr.type].box&&lineHitsProp(pr,ax,ay,bx,by)!=null)return true;return false;}
// the part of you the sentry can see, most central first: in front of it, in its room, within range, nothing in between,
// and (sweeping) inside its beam, or (tracking) within ±75° of straight ahead
function storySeen(beam,half){const U=STORY.tur,x0=STORYL.rooms[2].x0-10;
  for(const [id,f] of [['chest',0.5],['abd',0.5],['head',0.55],['nearThigh',0.4],['farThigh',0.4],['nearUpperArm',0.5],['nearShin',0.4],['nearForearm',0.5]]){const g=SEG[id];if(!g||!g.connected||g.gone)continue;
    const p=toWorld(g,g.len*f,0);if(p.x>U.x-8||p.x<x0||Math.hypot(p.x-U.x,p.y-U.y)>STORYL.tur.range)continue;
    const a=Math.atan2(p.y-U.y,p.x-U.x);if(Math.abs(wrap(a-(beam??Math.PI)))>half)continue;
    if(!coverBlocks(U.x,U.y,p.x,p.y))return {x:p.x,y:p.y,id};}
  return null;}
// how far the sweeping beam reaches before it meets the floor, a crate or him (for drawing it)
function sentryBeamLen(){const U=STORY.tur,dx=Math.cos(U.ang),dy=Math.sin(U.ang);let L=dy>0.01?(-U.y)/dy:STORYL.tur.range;L=Math.min(L,STORYL.tur.range);
  for(const pr of PROPS){if(!PROPDEF[pr.type].box)continue;const t=lineHitsProp(pr,U.x,U.y,U.x+dx*L,U.y+dy*L);if(t!=null)L=Math.min(L,t*L);}return L;}
// arms, every physics step: the gun (aimed, low ready, blind over cover, lying down); the knife thrust; the reach to a
// wound; the crowbar on the door; pushing; or swinging with the gait (walking ±13 cm, running with the elbows bent at
// ≈90° and pumping ±24 cm, opposite to the legs)
function storyArms(h){const S=STORY;S.armHold=false;if(!STORY.on||V.dead){S.fist=null;return;}const hd=storyHand(),F=FACE;
  S.fist=S.held&&hd?{[hd.side]:true,[hd.side==='near'?'far':'near']:!!S.aiming&&S.raise>0.3&&!S.blind}:null;
  if(S.prone&&S.proneT>0){S.armHold=true;storyPronePose(h||0);if(S.proneAim)storyProneAim(h||0);return;}
  if(V.rise<0.6)return;
  // climbing: both hands planted on top of the furniture, the knees drawn up
  if(S.vault&&S.vault.t<S.vault.dur*0.7){S.armHold=true;const v=S.vault,cx=(v.x0+v.x1)/2;for(const sd of ['near','far']){const h_=SEG[sd+'Hand'];if(h_&&h_.connected)pullPt(P[h_.b],cx+(sd==='near'?4:-4),v.top-1,0.3,3);}
    return;}
  if(S.kickT>0&&SEG.nearFoot.connected){const hp=S.kickX,K=S.kickF,ph=S.kickT>0.32?(0.5-S.kickT)/0.18:S.kickT>0.2?1:Math.max(0,S.kickT/0.2);
    let fx=hp+K*lerp(14,56,ph);const fy=lerp(-22,-44,ph);
    // the foot stops at the surface it hits
    for(const pr of PROPS){if(!PROPDEF[pr.type].box)continue;const b=storyBoxEdges(pr);if(b.top>fy+20)continue;const face=K>0?b.x0:b.x1;if((face-hp)*K>0&&(fx-face)*K>-10)fx=face-K*4;}
    pullPt(P[SEG.nearFoot.a],fx,fy,0.3,2.4);pullPt(P[SEG.nearFoot.b],fx+K*9,fy-3,0.3,2.4);pullPt(P[SEG.nearShin.a],hp+K*lerp(22,34,ph),lerp(-58,-62,ph),0.22,1.8);
    const st=SEG.farFoot;if(st&&st.connected){pullPt(P[st.a],hp-K*6,-4,0.2,1);pullPt(P[st.b],hp+K*9,-2.2,0.2,1);}}
  if(S.busy&&hd&&S.busy.p){S.armHold=true;pullPt(P[hd.b],S.busy.p.x,S.busy.p.y,0.25,1.2);const o=hd===SEG.nearHand?SEG.farHand:SEG.nearHand;if(o&&o.connected)pullPt(P[o.b],S.busy.p.x+3,S.busy.p.y-2,0.15,0.8);return;}
  if(S.door.prying&&hd){S.armHold=true;pullPt(P[hd.b],S.door.x-8,-100+Math.sin(S.t*9)*3,0.25,1.5);const o=hd===SEG.nearHand?SEG.farHand:SEG.nearHand;if(o&&o.connected)pullPt(P[o.b],S.door.x-14,-92,0.2,1);return;}
  // pushing furniture: both palms flat on its face at about chest height (a weapon stays in the hand)
  if(S.pushing&&hd){S.armHold=true;const b=storyBoxEdges(S.pushing),face=S.blockDir<0||V.walk<0?b.x1:b.x0,d=Math.sign(face-storyX())||1;
    for(const sd of ['near','far']){const h_=SEG[sd+'Hand'];if(!h_||!h_.connected||!armOK(sd))continue;const y=Math.max(b.top+14,-118)+(sd==='near'?0:10);
      pullPt(P[SEG[sd+'Forearm'].b],face-d*13,y+4,0.2,1.5);pullPt(P[h_.b],face-d*1.5,y-6,0.2,1.5);}return;}
  if(S.stabT>0&&hd){S.armHold=true;storyStabPose();return;}
  if(S.blind){S.armHold=true;storyBlindPose(h||0);return;}
  if(S.aiming){S.armHold=true;storyAimPose(h||0);return;}
  // sitting without a gun up: forearms resting on the knees
  if(S.sitK>0.5){S.armHold=true;for(const sd of ['near','far']){const h_=SEG[sd+'Hand'];if(!h_||!h_.connected||!armOK(sd))continue;pullPt(P[h_.b],V.anchorX+F*(36+(sd==='near'?2:-2)),-40,0.05,0.6);}return;}
  if(Math.abs(V.walk)>0.15&&V.walkOn){const run=(V.wsp||0)>190,amp=run?24:13;
    for(const sd of ['near','far']){const h_=SEG[sd+'Hand'];if(!h_||!h_.connected||!armOK(sd))continue;const ua=SEG[sd+'UpperArm'],sh=P[ua.a];
      const ph=V.gait+(sd==='near'?Math.PI:0),sw=Math.sin(ph)*amp*Math.sign(V.walk);
      if(run){pullPt(P[h_.b],sh.x+sw+F*6,sh.y+30-Math.cos(ph)*5,0.12,1.2);pullPt(P[ua.b],sh.x+sw*0.35-F*4,sh.y+26,0.1,1);}
      else pullPt(P[h_.b],sh.x+sw,sh.y+58,0.06,0.8);}}}
// going prone the way it is taught: drop to both knees, hands down in front, then lower the chest between them and kick
// the legs back. Forward, toward where he faces, so he ends up on his belly. Each joint follows a smooth path from where it
// was (eased, so the knees touch down at well under 1 m/s instead of falling 50 cm), in ≈1 s as a drill teaches it.
// Real lengths: thigh 41, shin 46, upper arm 25, forearm 24, trunk 45 cm; lying, the trunk's middle is ≈11 cm off the
// floor (its half-depth). Keyframes: [end time s, {point: [cm ahead of where the hips were, y]}]; o = ±2 cm between the
// near and far limb
const PRONEK=[[0.32,o=>({'Thigh.b':[12+o,-8],'Shin.b':[-30+o,-5],'Foot.b':[-42+o,-2],'abd.b':[4,-50],'chest.a':[10,-95],'head.a':[16,-127],'UpperArm.b':[12+o,-72],'Forearm.b':[22+o,-52],'Hand.b':[30+o,-40]})],
  [0.62,o=>({'Thigh.b':[12+o,-7],'Shin.b':[-30+o,-5],'Foot.b':[-42+o,-2],'abd.b':[6,-46],'chest.a':[40,-48],'head.a':[66,-54],'UpperArm.b':[46+o,-24],'Forearm.b':[54+o,-4],'Hand.b':[68+o,-2]})],
  [PRONE_T,o=>({'Thigh.b':[-1,-7+o*0.5],'Shin.b':[-46,-12],'Foot.b':[-50,-1.5],'abd.b':[40,-12],'chest.a':[84,-15],'head.a':[116,-18],'UpperArm.b':[90+o,-4],'Forearm.b':[112+o*2,-5],'Hand.b':[126+o*2,-6]})]];
function pronePts(fn){const o=[];for(const sd of ['near','far']){const m=fn(sd==='near'?2:-2);for(const k in m){const [sg,e]=k.split('.');const id=sg==='abd'||sg==='chest'||sg==='head'?sg:sd+sg;if(id===sg&&sd==='far')continue;o.push([id,e,m[k]]);}}return o;}
function storyPronePose(h){const S=STORY,t=S.proneT,hx=S.proneX,F=S.proneF;
  if(!S.proneS){S.proneS={};for(const [id,e] of pronePts(PRONEK[0][1])){const g=SEG[id];if(g&&g.connected)S.proneS[id+e]={x:(P[g[e]].x-hx)*F,y:P[g[e]].y};}}
  // once down the hold is light, so he can crawl, and it follows him
  const done=t>=PRONE_T;let ki=0;while(ki<PRONEK.length-1&&t>PRONEK[ki][0])ki++;
  const t0=ki?PRONEK[ki-1][0]:0,u=done?1:ease(clamp((t-t0)/(PRONEK[ki][0]-t0),0,1)),prev=ki?pronePts(PRONEK[ki-1][1]):null,cur=pronePts(PRONEK[ki][1]);
  if(!done||S.pbx==null)S.pbx=hx;else S.pbx+=(P[SEG.abd.b].x-F*PRONEK[2][1](0)['abd.b'][0]-S.pbx)*0.002;const bx=S.pbx,k=done?0.03:0.3,m=done?0.4:3;
  // the low crawl (≈0.3 m/s, one arm stroke each 0.5 s): a forearm reaches ≈18 cm ahead and pulls the body up to it while
  // the opposite knee draws up and pushes. Pain and a broken arm or leg slow it; with no working arm he can't. Aiming,
  // he doesn't crawl
  const arms=(armOK('near')?1:0)+(armOK('far')?1:0),crawl=done&&S.dir!==0&&!S.busy&&!S.proneAim&&V.consc>0.5&&arms>0&&!storyCrawlBlocked(S.dir,S.dir*2);let cy=null;
  if(crawl){S.crawlPh=(S.crawlPh||0)+h*6.283;const ph=S.crawlPh,sp=30*clamp(1.1-V.painEff/110,0.35,1)*(arms===2?1:0.5)*(legsOK()?1:0.6),dx=S.dir*sp*Math.abs(Math.sin(ph))*1.57*h;
    for(const q of P){q.x+=dx;q.px+=dx;}S.pbx+=dx;cy={near:Math.sin(ph),far:-Math.sin(ph)};}
  for(let n=0;n<cur.length;n++){const [id,e,c]=cur[n],g=SEG[id];if(!g||!g.connected)continue;if(S.proneAim&&done&&/UpperArm|Forearm|Hand/.test(id))continue;
    const a=prev?{x:prev[n][2][0],y:prev[n][2][1]}:(S.proneS[id+e]||{x:c[0],y:c[1]});let tx=bx+F*lerp(a.x,c[0],u),ty=lerp(a.y,c[1],u),kk=k,mm=m;
    if(cy&&g.side!=='mid'){const w=cy[g.side]*S.dir;kk=0.12;mm=1.5;
      if(/Forearm|Hand/.test(id)){tx+=w*14;ty-=Math.max(0,w*F)*5;}else if(/UpperArm/.test(id))tx+=w*7;
      else if(/Thigh/.test(id)){tx+=Math.max(0,-w*F)*16*F;ty-=Math.max(0,-w*F)*5;}else if(/Shin|Foot/.test(id))tx+=Math.max(0,-w*F)*14*F;}
    pullPt(P[g[e]],tx,ty,kk,mm);}}
// lying down takes ≈55 cm behind the hips (feet) and ≈135 cm in front (head and forearms). Next to a wall or furniture
// he lies down a little further forward or back (up to 35 cm); with less room than that he doesn't
function storyProneRoom(hx){const S=STORY,F=FACE;let L=-ROOM+5,R=ROOM-5;
  const wall=(x)=>{if(x<hx)L=Math.max(L,x);else R=Math.min(R,x);};
  if(S.door.open<0.8)wall(S.door.x);
  for(const pr of PROPS){if(!PROPDEF[pr.type].box)continue;const b=storyBoxEdges(pr);if(b.x1<hx)wall(b.x1);else if(b.x0>hx)wall(b.x0);else return null;}
  const lo=L+(F>0?58:138),hi=R-(F>0?138:58);if(lo>hi)return null;const x=clamp(hx,lo,hi);return Math.abs(x-hx)>35?null:x;}
// crawling stops at a wall, a closed door or a piece of furniture (the head or the feet would hit it first)
function storyCrawlBlocked(d,dx){const S=STORY;let f=d>0?-1e9:1e9;for(const q of P)f=d>0?Math.max(f,q.x+q.r):Math.min(f,q.x-q.r);const n=f+dx;
  const hit=(x)=>d>0?(f<=x+30&&n+18>=x):(f>=x-30&&n-18<=x);   // 18 cm: how far the reaching forearm goes
  if(hit(d>0?ROOM-5:-ROOM+5))return true;
  if(S.door.open<0.8&&hit(S.door.x-d*5))return true;
  for(const pr of PROPS){if(!PROPDEF[pr.type].box)continue;const b=storyBoxEdges(pr);if(hit(d>0?b.x0:b.x1))return true;}
  return false;}
// the aim angle (world radians) for a hand or shoulder at (x,y). Standing he reaches from ≈115° up (over the head) to 75°
// down (at his feet), in front of him; on his belly from 20° up to 7° down (the chest is on the floor); blind over
// cover, over the crate toward the far side, from 35° up to 15° down
function storyAimRel(x,y,lo,hi,d){const a=Math.atan2(STORY.aim.y-y,(STORY.aim.x-x)*d),r=clamp(a,lo,hi);return d>0?r:Math.PI-r;}
function storyAimAng(x,y){const S=STORY;if(S.blind)return storyAimRel(x,y,-0.6,0.26,-S.cover.side);if(S.proneAim)return storyAimRel(x,y,-0.35,0.12,S.proneF);return storyAimRel(x,y,-2.0,1.3,FACE);}
// the gun's own angle follows the aim with a little lag (≈0.07 s), like hands do, and the shot goes where it points
function storyGunAng(x,y,h){const S=STORY,a=storyAimAng(x,y);S.aimA=S.aimA==null?a:S.aimA+wrap(a-S.aimA)*Math.min(1,h*14);return S.aimA;}
// the two-handed hold: from the low ready (muzzle ≈45° down, gun ≈35 cm out, elbows in) up to the aim (the gun hand out
// along the line to the target at arm's length, ≈55 cm from the shoulder, the elbow a little low, the other hand cupping
// the grip). It breathes (±0.6 cm, 0.3 Hz), bobs with the steps and wobbles with the sway below
function storyAimPose(h){const S=STORY;const hd=storyHand();if(!hd)return;const near=hd===SEG.nearHand,ua=near?SEG.nearUpperArm:SEG.farUpperArm,fa=near?SEG.nearForearm:SEG.farForearm,F=FACE;
  const sh=P[ua.a],ai=storyGunAng(sh.x,sh.y,h),lo=F>0?0.8:Math.PI-0.8,R=S.raise,aa=lo+wrap(ai-lo)*R;const dx=Math.cos(aa),dy=Math.sin(aa);const sw=storySway()*R;
  // "below the line of sight": the side the pistol grip hangs to (screen-down when aiming right)
  const sg=dx>=0?1:-1,px=-dy*sg,py=dx*sg;
  const kick=Math.max(0,S.cool-0.18)*6;   // recoil: the muzzle flips up and back for ≈0.1 s after each shot
  const bob=Math.sin(S.t*1.9)*0.6+(V.walkOn?Math.sin(V.gait*2)*1.4:0);
  const wx=Math.sin(S.t*7.3)*sw*30,wy=Math.cos(S.t*5.1)*sw*30+bob;
  const at=(s_,o)=>({x:sh.x+dx*s_+px*o+wx*(s_/60),y:sh.y+dy*s_+py*o+wy*(s_/60)});
  // something within arm's reach on the line of fire (a crate, the door): the gun comes back to the chest, elbows
  // tucked ("compressed ready"), instead of the arms ramming into it
  let dist=70;for(const yo of [-4,10]){const ax=sh.x,ay=sh.y+yo,bx=ax+dx*70,by=ay+dy*70;
    for(const pr of PROPS){if(!PROPDEF[pr.type].box)continue;const t=lineHitsProp(pr,ax,ay,bx,by);if(t!=null)dist=Math.min(dist,t*70);}
    if(S.door.open<0.8&&dx>0.05){const t=(S.door.x-6-ax)/dx;if(t>0&&t<dist)dist=t;}}
  {const g=clamp((dist-38)/30,0,1);S.reach=S.reach==null||g<S.reach?g:lerp(S.reach,g,0.04);}const f=S.reach*lerp(0.55,1,R);   // pulls in at once, reaches out gently
  const el=at(lerp(4,24,f),lerp(20,4,f)),wr=at(lerp(18,46,f)-kick*4,lerp(10,1,f)),tp=at(lerp(30,61,f)-kick*4,lerp(6,0,f)-kick*2.5);
  // at most ≈0.85 cm per 1/360 s step: bringing the gun up takes ≈0.2–0.3 s, as fast as a trained draw (≈3 m/s at the hand)
  const k=lerp(0.6,1,R);pullPt(P[ua.b],el.x,el.y,0.2*k,0.55);pullPt(P[fa.b],wr.x,wr.y,0.24*k,0.75);pullPt(P[hd.b],tp.x,tp.y,0.28*k,0.85);
  // the support hand wraps around the gun hand from below: its wrist under the shooting wrist, its fingers over the
  // shooting hand's fingers, its elbow bent a little more (≈150°) and pointing down
  const o=near?SEG.farHand:SEG.nearHand,os=near?'far':'near';if(o&&o.connected&&armOK(os)){const oua=SEG[os+'UpperArm'],ofa=SEG[os+'Forearm'],osh=P[oua.a];
    const ow=at(lerp(17,44,f)-kick*4,lerp(13,3.2,f)),ot=at(lerp(28,57,f)-kick*4,lerp(11,2.8,f)),oe=lerp(2,21,f),op=lerp(22,7,f);
    pullPt(P[oua.b],osh.x+dx*oe+px*op,osh.y+dy*oe+py*op,0.16*k,0.55);pullPt(P[ofa.b],ow.x,ow.y,0.2*k,0.75);pullPt(P[o.b],ot.x,ot.y,0.2*k,0.85);}}
// lying on the belly: both forearms on the floor, the gun out ahead at arm's length a few cm off the floor (the prone
// supported position); the aim moves only a little up or down
function storyProneAim(h){const S=STORY;const hd=storyHand();if(!hd)return;const near=hd===SEG.nearHand;
  for(const [sd,o] of [[near?'near':'far',0],[near?'far':'near',-3]]){const ua=SEG[sd+'UpperArm'],fa=SEG[sd+'Forearm'],hn=SEG[sd+'Hand'];if(!hn||!hn.connected||!armOK(sd))continue;
    const sh=P[ua.a],a=o?S.aimA??storyAimAng(sh.x,sh.y):storyGunAng(sh.x,sh.y,h),dx=Math.cos(a),dy=Math.sin(a),kick=Math.max(0,S.cool-0.18)*6;
    pullPt(P[ua.b],sh.x+dx*16,Math.min(-3,sh.y+12),0.2,0.8);pullPt(P[fa.b],sh.x+dx*(38+o)-kick*3*dx,Math.min(-3,sh.y+dy*38+4),0.22,0.9);pullPt(P[hn.b],sh.x+dx*(52+o)-kick*4*dx,Math.min(-4,sh.y+dy*52+2),0.25,1);}}
// blind fire from cover: sitting with his back to the crate, the gun hand goes up over his head and over the top of it,
// the muzzle pointing over to the far side; he can't see what he hits (the spread is 3× wider). Sitting against it his
// shoulder is ≈13 cm in front of its face, so the arm goes up (≈155° of shoulder flexion: the joint stops at ≈170°; upper
// arm 25 + forearm 24 cm put the wrist ≈47 cm over the shoulder, just above the top) and the wrist bends back ≈60°, so
// the gun's barrel reaches ≈7 cm past the crate's face. The hand rises in front of the face line first: a straight
// path from his lap would sweep the arm into the crate's edge
function storyBlindPose(h){const S=STORY,c=S.cover,hd=storyHand();if(!hd||!c)return;const b=storyBoxEdges(c.pr),d=-c.side,face=d>0?b.x0:b.x1,near=hd===SEG.nearHand;
  const ua=near?SEG.nearUpperArm:SEG.farUpperArm,fa=near?SEG.nearForearm:SEG.farForearm,sh=P[ua.a];storyGunAng(P[hd.b].x,P[hd.b].y,h);
  const kick=Math.max(0,S.cool-0.18)*6;
  const up=P[fa.b].y<b.top-1,hx=up?sh.x+d*9:sh.x-d*6,hy=sh.y-(up?56:62)-kick*2;
  pullPt(P[ua.b],sh.x-d*10,sh.y-22,0.2,0.6);pullPt(P[fa.b],sh.x-d*4,sh.y-47,0.24,0.7);pullPt(P[hd.b],hx,hy,0.26,0.8);}
// the gun is over the top of the crate (blind fire only goes off then: lower, it would point back through him)
function storyBlindReady(){const S=STORY,hd=storyHand();if(!S.blind||!hd)return false;const b=storyBoxEdges(S.cover.pr),d=-S.cover.side,face=d>0?b.x0:b.x1;
  return P[hd.a].y<b.top-1&&(P[hd.b].x-face)*d>-9;}
// knife thrust: the hand draws back to the chest (0–30 %), drives out along the aim to arm's length (30–55 %), and
// comes back
function storyStabPose(){const S=STORY,hd=storyHand(),near=hd===SEG.nearHand,ua=near?SEG.nearUpperArm:SEG.farUpperArm,fa=near?SEG.nearForearm:SEG.farForearm,sh=P[ua.a];
  const a=storyAimRel(sh.x,sh.y,-0.7,0.7,FACE),dx=Math.cos(a),dy=Math.sin(a),u=1-S.stabT/0.4;
  const r=u<0.3?lerp(30,14,u/0.3):u<0.55?lerp(14,62,(u-0.3)/0.25):lerp(62,30,(u-0.55)/0.45),k=u>=0.3&&u<0.55?0.6:0.3;
  pullPt(P[ua.b],sh.x+dx*r*0.4,sh.y+dy*r*0.4+6,k,3);pullPt(P[fa.b],sh.x+dx*r*0.75,sh.y+dy*r*0.75+2,k,3.5);pullPt(P[hd.b],sh.x+dx*r,sh.y+dy*r,k,4);}
// aim wobble (radians, 1 SD): steady hands ≈0.5°, worse with pain, blood loss, shaking from adrenaline, and a hurt arm
function storySway(){const frac=V.blood/5000;let s=0.009+0.03*clamp((V.painEff-20)/60,0,1)+0.05*clamp((0.85-frac)/0.3,0,1)+0.012*clamp(DR.adr.l-0.8,0,2)+0.04*(1-clamp(V.consc,0,1));
  const ua=SEG.nearUpperArm,fa=SEG.nearForearm;if((ua&&ua.mtear)||(fa&&fa.mtear))s+=0.025;if(!armOK('near'))s+=0.05;if(STORY.run&&Math.abs(V.walk)>0.3)s+=0.05;if(STORY.jy<0)s+=0.06;
  if(STORY.blind)s=s*3+0.03;else if(STORY.proneAim)s*=0.6;   // blind: no sight picture; prone: the most stable position
  return s;}
// FIRE: with the knife, a thrust; with the pistol, a shot (brought up first if it is at the low ready)
function storyFire(){const S=STORY;if(S.held==='knife')return storyStab();if(S.held!=='pistol'||S.busy||S.cool>0||V.dead||S.done||S.med)return false;
  if(S.ammo<=0){emitSound('tink',0.5);S.msg='Out of ammunition';S.msgT=1.5;return false;}
  const hd=storyHand();if(!hd||!S.aiming){S.msg='You can’t aim like this';S.msgT=1.5;return false;}
  S.aimSeen=S.t;if(S.raise<0.85||(S.blind&&!storyBlindReady())){S.fireQ=true;return true;}
  const o=P[hd.b];let a=(S.aimA??storyAimAng(o.x,o.y))+(Math.random()+Math.random()+Math.random()-1.5)*storySway()*1.4;const dx=Math.cos(a),dy=Math.sin(a);
  S.ammo--;S.cool=0.28;const x0=o.x+dx*14,y0=o.y+dy*14;
  // did it reach the sentry? (a 20 cm housing). A steel crate on the way stops a 9 mm round; a wooden one does not
  const U=S.tur;if(U.hp>0){const rx=U.x-x0,ry=U.y-y0,t=rx*dx+ry*dy;if(t>0&&Math.hypot(rx-dx*t,ry-dy*t)<(U.down?14:10)){
    let blocked=false;for(const pr of PROPS){if(PROPDEF[pr.type].mat!=='steel')continue;const tt=lineHitsProp(pr,x0,y0,x0+dx*t,y0+dy*t);if(tt!=null){blocked=true;break;}}
    storyShoot(x0,y0,dx,dy);if(!blocked){U.hp--;FX.push({k:'spark',x:U.x-dx*8,y:U.y-dy*8,t:0,life:0.25});emitSound('tink',0.8);
      if(U.mode!=='track'){U.mode='track';U.lost=0;U.acq=0.5;}   // a hit tells it where you are
      if(U.hp<=0){emitLog('Sentry destroyed','good');emitSound('pop',0.8);for(let i=0;i<6;i++)FX.push({k:'spark',x:U.x+rnd(-6,6),y:U.y+rnd(-4,6),t:0,life:0.4});}}return true;}}
  storyShoot(x0,y0,dx,dy);return true;}
// E: pick up what is in reach, open the cabinet, start prying the door
function storyInteract(){const S=STORY;if(S.busy||V.dead||S.done)return '';const x=storyX();
  for(const it of S.items){if(it.taken||Math.abs(it.x-x)>55)continue;
    if(it.id==='cab'){it.taken=true;for(const m of it.loot)S.inv.push(m);emitSound('glass',0.25);emitLog('Medicine cabinet · 2 bandages, a gauze pack, a tourniquet, a morphine auto-injector','good');return 'cab';}
    it.taken=true;S.inv.push(it.id);if(it.id==='pistol')S.ammo=15;if(!S.held||it.id==='pistol')S.held=it.id;emitSound('thud',0.25);
    emitLog(SITEM[it.id].name+' picked up'+(it.id==='pistol'?' · 15 rounds of 9 mm':''),'good');return it.id;}
  return '';}
// the closed steel exit door stops a pistol round (and a rifle round: it is ≥ 5 mm plate); returns how far along the
// step the bullet hits it, or null. It slides sideways, so until it is half open the gap is narrower than a man and it is
// treated as closed
function storyBulletStop(x0,y0,dx,dy,len){const S=STORY;if(S.door.open>=0.5||Math.abs(dx)<1e-6)return null;
  const t=(S.door.x-x0)/dx;if(t<0||t>len)return null;const y=y0+dy*t;return y<-232||y>0?null:t;}
// the low crate within reach to sit behind, the side you are on, and where your hips go (22 cm from its face, so your
// back rests on it). Only a crate low enough to sit behind and high enough to hide a sitting man (60–110 cm)
function storyCoverNear(){let best=null,bd=130;const x=storyX();for(const pr of PROPS){if(!PROPDEF[pr.type].box)continue;const b=storyBoxEdges(pr);if(b.top<-110||b.top>-60)continue;
  const d=Math.abs(pr.x-x);if(d<bd){bd=d;const side=x<pr.x?-1:1;best={pr,side,x:side<0?b.x0-22:b.x1+22};}}return best;}
function storyCover(){const S=STORY;if(S.cover){S.cover=null;return true;}if(S.busy||V.dead||V.rise<0.99||S.prone)return false;const c=storyCoverNear();if(!c)return false;S.coverGo=c;S.duckLatch=false;return true;}
function storyPrompt(){const S=STORY;if(S.busy)return SITEM[S.busy.id].name+' · '+Math.ceil(S.busy.dur-S.busy.t)+' s';const x=storyX();
  for(const it of S.items){if(it.taken||Math.abs(it.x-x)>55)continue;return 'E · '+(it.id==='cab'?'open the medicine cabinet':'pick up the '+SITEM[it.id].name.toLowerCase());}
  const D=S.door;if(D.pry<1&&storyNear(D.x-30,45))return S.held==='crowbar'?'Hold E · pry the door open'+(D.pry>0?' ('+Math.round(D.pry*100)+'%)':''):'The door is jammed shut · you need something to pry it';
  if(S.cover)return S.held==='pistol'?'In cover · aim over the crate to fire blind · Q or walk away to stand':'In cover · Q or walk away to stand';
  if(!S.vault&&V.rise>0.99&&storyCoverNear()&&!S.coverGo)return 'Q · take cover behind the crate';
  if(!S.vault&&V.rise>0.99&&storyVaultTarget())return '↑ · climb over';
  return '';}
// the wound that needs help most: the one bleeding fastest and not yet covered
function worstWound(limbOnly){let best=null,bv=0.04;
  for(const g of segs){if(!g.connected||g.gone)continue;if(limbOnly&&!LIMBK.includes(g.kind))continue;for(const w of g.wounds){if(w.band||w.pack||w.wrapped||w.sut>=1||w.tq)continue;const b=w.bleed||0;if(b>bv){bv=b;best={g,w};}}}
  return best;}
function storyStartUse(id,tgt){const S=STORY,i=S.inv.indexOf(id),it=SITEM[id];S.inv.splice(i,1);S.busy={id,t:0,dur:it.t,tgt,p:toWorld(tgt.g,tgt.s,tgt.w)};S.dir=0;S.coverGo=null;emitLog(it.name+' · '+it.t+' s, you can’t move until it’s done','info');return true;}
function storyUse(id){const S=STORY;if(S.busy||V.dead||S.done)return false;const i=S.inv.indexOf(id);if(i<0)return false;const it=SITEM[id];
  if(it.w){S.held=S.held===id?null:id;S.raise=0;S.fireQ=false;return true;}
  let tgt=null;
  if(id==='morphine'){const g=SEG.nearThigh.connected?SEG.nearThigh:SEG.farThigh;tgt={g,s:g.len*0.35,w:0};}
  else if(id==='tourniquet'){const b=worstWound(true);if(!b){S.msg='No bleeding arm or leg to put a tourniquet on';S.msgT=2;return false;}
    // a tourniquet goes 5–8 cm above the wound, on the upper arm or thigh for wounds below the elbow or knee
    let g=b.g,s=b.w.s-7;if(g.kind==='shin'||g.kind==='foot')g=SEG[g.side+'Thigh'];else if(g.kind==='farm'||g.kind==='hand')g=SEG[g.side+'UpperArm'];if(g!==b.g)s=g.len*0.65;tgt={g,s:clamp(s,3,g.len-2),w:0};}
  else{const b=worstWound(false);if(!b){S.msg='Nothing is bleeding enough to need that';S.msgT=2;return false;}tgt={g:b.g,s:b.w.s,w:b.w.w};}
  return storyStartUse(id,tgt);}
// medical view: you choose where it goes, like in the sandbox (the point you tap on the body)
function storyUseAt(id,w){const S=STORY;if(S.busy||V.dead||S.done||!S.inv.includes(id)||SITEM[id].w)return false;const b=bodyAt(w);if(!b){S.msg='Tap on his body';S.msgT=1.5;return false;}
  if(id==='tourniquet'&&!LIMBK.includes(b.seg.kind)){S.msg='A tourniquet only goes on an arm or a leg';S.msgT=2;return false;}
  return storyStartUse(id,{g:b.seg,s:b.s,w:b.w});}
function storyApply(b){const p=toWorld(b.tgt.g,b.tgt.s,b.tgt.w);
  if(b.id==='bandage')bandage(p);else if(b.id==='gauze')gauze(p);else if(b.id==='tourniquet')tourniquet(p);else if(b.id==='morphine')inject('morphine',p.x,p.y);}
