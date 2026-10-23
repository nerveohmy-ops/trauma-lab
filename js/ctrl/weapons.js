/* TRAUMA_LAB_MAIN */
/* ===== ctrl/weapons.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
function meleeTool(t){return !!MWDEF[t]&&!(t==='knife'&&MODE.knife==='stab');}
function meleeDown(w){const id=tool,d=MWDEF[id];mwSamples(d);
  // grab the nearest one of this weapon within reach (a lodged one too); otherwise a fresh one in your hand
  let o=null,bd=Math.max(40,d.L);for(const q of MW){if(q.id!==id)continue;const dd=Math.hypot(q.cx-w.x,q.cy-w.y);if(dd<bd){bd=dd;o=q;}}
  if(o&&o.stuck){MWH={o,tx:w.x,ty:w.y,px:w.x,py:w.y,gvx:0,gvy:0,anchor:{x:w.x,y:w.y}};o.stuck.t=Math.min(o.stuck.t,T-1);emitLog('Hands on the '+d.n.toLowerCase()+' · drag to pull it out','info');return;}
  if(!o){const fr=MW.find(q=>q.id===id&&!q.stuck);if(fr)MW.splice(MW.indexOf(fr),1);o={id,cx:0,cy:0,vx:0,vy:0,ang:Math.PI/2+0.25,om:0,cd:new Map(),prev:null};MW.push(o);}
  const ca=Math.cos(o.ang),sa=Math.sin(o.ang),dc=d.com-d.xg;o.cx=w.x+dc*ca;o.cy=w.y+dc*sa;o.vx=o.vy=0;o.rest=false;MWH={o,tx:w.x,ty:w.y,px:w.x,py:w.y,gvx:0,gvy:0,ox:w.x,oy:w.y};
  if(!meleeDown.said||meleeDown.said!==id){meleeDown.said=id;emitLog(d.n+' in hand · swing it through him; faster swings hit harder · let go to throw it','info');}}
function meleeUp(){if(!MWH)return;const o=MWH.o;MWH=null;if(o.stuck)return;o.free=true;
  const sp=Math.hypot(o.vx,o.vy);if(sp>400)emitLog(MWDEF[o.id].n+' thrown','info');}
// front/back view: tap to strike. Strength picks how hard you swing: kinetic energy at impact for an adult swing
// (½·m_eff·v², m_eff = weapon + ≈0.8 kg of arm): bat ≈ 28 m/s at the barrel → ≈ 400 J flat out; hammer ≈ 200 J; axe ≈ 500 J.
const SWINGE={bat:400,pipe:420,crowbar:450,hammer:200,axe:500};
const MSTRL=[['Light',0.15],['Medium',0.4],['Hard',0.7],['Full',1]];
function mStr(){return MSTRL[clamp(OPT.mstr==null?2:OPT.mstr,0,3)];}
function frontMeleeTool(t){return !!MWDEF[t]&&t!=='saber';}
function cycleStrength(){OPT.mstr=((OPT.mstr==null?2:OPT.mstr)+1)%4;saveOpt();refreshTools();emitLog('Swing strength · '+mStr()[0],'info');}
const FAXE=[];   // axes lodged in front/back view: {seg,s,w,z,fx,fy,v,rot,wd}
function frontBlunt(fx,fy){
  // tapping a lodged axe pulls it out
  if(tool==='axe'){const i=FAXE.findIndex(a=>a.v===view&&Math.hypot(a.fx-fx,a.fy-fy)<5);if(i>=0){const a=FAXE.splice(i,1)[0];if(a.wd&&a.seg.wounds.includes(a.wd)){a.wd.plug=false;a.wd.bleed*=1.35;}hurt(a.seg,a.s,a.w,10);emitSound('slice');emitLog('Axe wrenched out of the '+a.seg.label.toLowerCase()+' · the wound opens up','bad');return true;}}
  const hit=frontHit(fx,fy);if(!hit)return false;const d=MWDEF[tool],{s,r}=frontLocal(hit),w=r*0.9*(view==='back'?-1:1),k=mStr()[1],E=SWINGE[tool]*k*rnd(0.9,1.1);
  if(tool==='axe'){const len=2+6*k;frontSlash(fx-len/2,fy-len*0.2,fx+len/2,fy+len*0.2,'machete',400+1400*k);blunt2(hit.seg,s,w,E*0.6,'Axe',{focus:2,chop:1,z:hit.zx});
    // an axe swung hard buries its wedge (bone or deep muscle) and stays in
    if(k>=0.4&&hit.seg.connected&&!hit.seg.gone){const cw=hit.seg.wounds.filter(q=>q.type==='cut').pop();if(cw)cw.plug=true;FAXE.push({seg:hit.seg,s,w,z:hit.zx,fx,fy,v:view,rot:rnd(-0.5,0.5),wd:cw,depth:Math.min(6.5,1.5+E/60)});if(FAXE.length>6)FAXE.shift();emitLog('Axe lodged in the '+hit.seg.label.toLowerCase()+' · tap it with the axe to pull it out','bad');}}
  else blunt2(hit.seg,s,w,E,d.n,{pat:tool==='hammer'?'ring':'tram',focus:tool==='hammer'?2.2:1,tang:rnd(0,0.4),rough:d.rough||0,rodR:d.rodR||1.4,ax:{s:0,w:1},slide:{s:1,w:0},z:hit.zx});
  FX.push({k:'ring',x:fx,y:fy,t:0,life:0.3});emitSound('thud',0.4+0.6*k);shake=Math.max(shake,0.05+0.15*k);return true;}
function knifeStabMode(){return tool==='knife'&&MODE.knife==='stab';}
function knifeDown(w){
  if(view==='side'){HK={x:w.x,y:w.y,ang:aimAtBody(w.x,w.y),ins:null,blocked:null,first:true};HK.tx=w.x+Math.cos(HK.ang)*KGRIP;HK.ty=w.y+Math.sin(HK.ang)*KGRIP;HK.blocked=topSegAt(HK.tx,HK.ty);if(HK.blocked){knifeEnterInside(HK.blocked,HK.tx,HK.ty);}return;}
  const hit=frontHit(w.x,w.y);if(!hit){HK={front:true,ins:null,x:w.x,y:w.y};return;}
  const rep=[];const {s:ls,r}=frontLocal(hit);const sg=view==='back'?-1:1,seg=hit.seg;
  const before=new Map(seg.vessels.map(v=>[v,v.cut]));
  if(!stabAt(seg,ls,r*0.6*sg,hit.zx,rep)){const m=seg.amarks[seg.amarks.length-1];m.fx=w.x;m.fy=w.y;m.v=view;emitLog('Stab · '+rep.join(', '),'info');emitSound('thud',0.4);HK={front:true,ins:null,x:w.x,y:w.y};return;}
  const wd=seg.wounds[seg.wounds.length-1];wd.w=r*0.95*sg;wd.dw=sg;
  if(view==='back'){wd.bx1=w.x;wd.by1=w.y;}else{wd.ff=true;FW.push({seg,x:w.x,y:w.y,r:0.9,type:'hole',band:false,ref:wd,age:0,blood:0});}
  const vs=seg.vessels.filter(v=>v.cut>(before.get(v)||0));
  emitLog('Stab · '+seg.label.toLowerCase()+(rep.length?': '+[...new Set(rep)].join(', '):''),'bad');emitSound('slice');
  HK={front:true,x:w.x,y:w.y,sx:w.x,sy:w.y,ins:{seg,s:ls,w:r*0.95*sg,dw:-sg,ds:0,depth:9,z:hit.zx,wd,vs,fx:w.x,fy:w.y,fv:view}};
}
function knifeMove(w){if(!HK)return;HK.x=w.x;HK.y=w.y;
  if(HK.front&&HK.ins&&Math.hypot(w.x-HK.sx,w.y-HK.sy)*VS>26){emitLog('Knife pulled out · '+HK.ins.seg.label.toLowerCase(),'info');HK.ins=null;}}
function knifeUp(){
  const k=HK;HK=null;if(!k||!k.ins)return;const I=k.ins;
  if(!k.front)knifeLog(I);
  if(I.depth>1.2&&I.seg.wounds.includes(I.wd)){
    KNIVES.push(I);I.wd.plug=true;for(const v of I.vs)v.plug=(v.plug||0)+1;
    if(KNIVES.length>10)unplugKnife(KNIVES[0],true);
    emitLog('Knife left in '+I.seg.label.toLowerCase()+' · it slows the bleeding until removed','info');
  }
}
function wallShot(w){const fromL=w.x>-ROOM+30;const mx=fromL?Math.max(-ROOM+3,w.x-260):Math.min(ROOM-3,w.x+260);const dx=w.x-mx,l=Math.abs(dx)||1;fire(tool,mx,w.y,dx/l,0);}
function autoOn(){const W_=WEAP[tool];return W_&&W_.auto&&(tool!=='rifle'||MODE.rifle==='auto');}
function autoFire(dt){
  if(drag&&drag.pullR&&tool==='rope'){const r=drag.pullR;if(ROPES.includes(r))r.L=Math.max(3,r.L-75*dt);}
  powerStep(dt);
  if(!drag||drag.probe||!TOOL[tool].gun||!autoOn())return;
  const held=T-drag.t0;if(held<0.12&&!drag.fired)return;
  drag.acc+=dt;const iv=1/WEAP[tool].auto;
  while(drag.acc>=iv){drag.acc-=iv;drag.fired++;
    const w=drag.cw;
    if(view!=='side')frontFire(tool,w.x,w.y);
    else if(drag.moved){const dx=w.x-drag.sw.x,dy=w.y-drag.sw.y,l=Math.hypot(dx,dy);if(l>0.5)fire(tool,drag.sw.x,drag.sw.y,dx/l,dy/l);}
    else wallShot(w);
  }
}
