/* TRAUMA_LAB_MAIN */
/* ===== ctrl/powers.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
function powerDown(w){
  if(tool==='tk'&&view==='side'){let p=pickSeg(w,Math.max(3,22/VS));const core=['chest','abd','neck','head'].map(k=>SEG[k]).find(g=>g&&g.connected&&!g.gone&&insideSeg(g,w.x,w.y));if(core&&p&&p.seg.connected)p={seg:core,t:0.5};if(!p){emitLog('Hold on the body to grab it with your mind','info');return;}
    const g=p.seg,limb=g.connected&&['farm','hand','shin','foot'].includes(g.kind)&&g.joint&&!g.joint.broken;
    const list=g.connected?(limb?[g]:segs.filter(q=>q.connected&&!q.gone)):distalOf(g).filter(q=>!q.gone);
    const pts=bodyPts(list);let cx=0,cy=0;for(const q of pts){cx+=q.x;cy+=q.y;}cx/=pts.length;cy/=pts.length;
    drag.tk={list,pts,limb:limb?g:null,ox:cx-w.x,oy:cy-w.y,strain:0};TKH=drag.tk;emitSound('hum');
    emitLog(limb?'Telekinesis · pulling the '+g.label.toLowerCase()+' · pull hard to rip it off':'Telekinesis · lifting '+(g.connected?'him':g.label.toLowerCase()),'info');}
  if(tool==='drain'&&(V.dead||V.zombie)){drag.drain=null;emitLog('Life drain · he is dead, there is no living blood to drain','info');}
  else if(tool==='drain'){const b=bodyAt(w);drag.drain=b?{x:w.x,y:w.y,seg:b.seg}:null;if(!b)emitLog('Hold on the body to drain him','info');else emitLog('Life drain · blood pulled out through his skin','bad');}
  if(tool==='mind'){drag.mind=0;}
}
function tkRelease(d){TKH=null;const k=d.tk;if(!k)return;V.rise=0;}
function powerTap(d,w){
  const t=tool;
  if(t==='lightning'){lightning(w);return;}
  if(t==='freeze'){freezeBody();return;}
  if(t==='push'){forcePush(w,1);return;}
  if(t==='quake'){QUAKE=4;emitSound('rumble');buzz(400);emitLog('Earthquake','bad');return;}
  if(t==='blackhole'){const hit=BHS.find(b=>Math.hypot(w.x-b.x,w.y-b.y)<b.R*2.5+6);if(hit){closeBH(hit);return;}if(BHS.length>=8){emitLog('Black holes · 8 open already, tap one to close it','info');return;}BHS.push({x:clamp(w.x,-ROOM+12,ROOM-12),y:Math.min(w.y,-12),t:0,eaten:0,R:7,ang:rnd(0,6),P:[]});emitSound('rumble');emitLog('Black hole open'+(BHS.length>1?' · '+BHS.length+' holes':'')+' · it keeps growing · tap it again to close it','bad');return;}
  if(t==='meteor'){const tx=clamp(w.x,-ROOM+6,ROOM-6),sx=tx+rnd(-1,1)*60;METEORS.push({x:sx,y:TOP-10,vx:(tx-sx)/0.9,vy:Math.max(260,(Math.min(w.y,-1)-TOP)/0.9),r:4.5,tr:[]});emitSound('whoosh');emitLog('Meteor incoming','bad');return;}
  if(t==='fireball'){const fromL=w.x>-ROOM+30,sx=fromL?Math.max(-ROOM+3,w.x-240):Math.min(ROOM-3,w.x+240);const dx=w.x-sx,dy=w.y-w.y,l=Math.hypot(dx,dy)||1;FBALLS.push({x:sx,y:w.y,vx:dx/l*320,vy:0,t:0});emitSound('whoosh');return;}
  if(t==='snap'){disintegrate(w);return;}
  if(t==='acid'&&!d.moved){acidStroke(w.x,w.y,w.x+0.1,w.y);return;}
}
