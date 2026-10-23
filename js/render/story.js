/* TRAUMA_LAB_MAIN */
/* ===== render/story.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
// Story mode (prototype): the lab's fixtures behind the body, and what he holds in front of it. Real sizes in cm.
// (The crates are props, drawn by drawProps with the rest of the furniture.)
// the exit door: a 2.3 m steel slab in a frame; it slides up into the ceiling once the bolt is pried
function drawSteelDoor(c,x,open,pry){const top=-232;c.fillStyle='#2b3035';c.fillRect(x-9,TOP,18,top-TOP);c.fillRect(x-9,top-6,18,6);
  const dy=-open*232;c.save();c.beginPath();c.rect(x-12,top,24,232);c.clip();
  const g=c.createLinearGradient(x-4,0,x+4,0);g.addColorStop(0,'#59626b');g.addColorStop(0.5,'#7b858e');g.addColorStop(1,'#4c545c');c.fillStyle=g;c.fillRect(x-4,top+dy,8,232);
  c.fillStyle='#f2c94c';for(let y=top+dy+10;y<dy;y+=30)c.fillRect(x-4,y,8,6);c.fillStyle='#2c3238';c.fillRect(x-5,-104+dy,2,14);
  if(pry>0&&pry<1){c.fillStyle='rgba(255,220,150,.5)';c.fillRect(x-5,-104,1.5,6*pry);}c.restore();}
// an open doorway between rooms: two jamb posts and a lintel at 2.1 m, the door leaf swung open against the wall
function drawDoorway(c,x){c.fillStyle='#262b30';c.fillRect(x-7,-212,3,212);c.fillRect(x+4,-212,3,212);c.fillRect(x-7,-216,14,5);
  c.fillStyle='rgba(70,80,88,.55)';c.fillRect(x+7,-208,4,206);c.fillStyle='rgba(0,0,0,.25)';c.fillRect(x-4,-211,8,211);}
function drawStoryBack(c){const S=STORY;setWorld(c);
  // painted wall stripe and room numbers, so walking reads as moving through a building
  c.fillStyle='rgba(18,214,176,.07)';c.fillRect(-ROOM,-112,2*ROOM,10);
  c.fillStyle='rgba(231,236,239,.18)';c.font='700 9px "IBM Plex Mono",monospace';c.textAlign='center';
  for(const r of STORYL.rooms)c.fillText(r.name,(r.x0+r.x1)/2,-180);
  for(const x of STORYL.doorways)drawDoorway(c,x);
  // medicine cabinet on the wall: white steel box with a red cross, 40 × 50 cm
  const cab=S.items.find(i=>i.id==='cab');if(cab){const x=cab.x,y=cab.y;c.fillStyle='#d9dee2';c.fillRect(x-20,y-25,40,50);c.strokeStyle='#8a9399';c.lineWidth=0.8;c.strokeRect(x-20,y-25,40,50);
    if(cab.taken){c.fillStyle='#2a3036';c.fillRect(x-17,y-22,34,44);c.fillStyle='#d9dee2';c.fillRect(x-17,y-3,34,1.4);}
    else{c.fillStyle='#d23a3a';c.fillRect(x-3,y-10,6,20);c.fillRect(x-10,y-3,20,6);}}
  // storage shelf (70 cm, at 95 cm) with the pistol and the knife on it
  const sh=STORYL.shelf;c.fillStyle='#5a6168';c.fillRect(sh-37,-96,74,3);c.fillStyle='#41474d';c.fillRect(sh-35,-93,3,8);c.fillRect(sh+32,-93,3,8);
  drawSteelDoor(c,S.door.x,S.door.open,S.door.pry);
  // exit sign over the door
  c.fillStyle='#0f3b25';c.fillRect(STORYL.door-48,-246,44,14);c.fillStyle='#4be38a';c.font='800 10px "Inter",sans-serif';c.textAlign='center';c.fillText('EXIT →',STORYL.door-26,-235.5);c.textAlign='left';
  // the sentry gun on its tripod, housing 1.5 m up. Sweeping, its sensor beam is a faint red line that tilts up and down;
  // locked on, a solid line to the part of you it sees. Kicked over, the whole thing lies on its side
  const U=S.tur;c.save();if(U.down){c.translate(U.x,0);c.rotate(1.45*ease(U.fall));c.translate(-U.x,0);}
  c.strokeStyle='#30363c';c.lineWidth=2.2;c.lineCap='round';c.beginPath();for(const lx of [-26,0,24]){c.moveTo(U.x,U.y+8);c.lineTo(U.x+lx,0);}c.stroke();
  c.fillStyle='#262b30';c.fillRect(U.x-4,U.y+4,8,12);
  const live=U.hp>0&&!U.down&&!V.dead,mx=U.x+Math.cos(U.ang)*16,my=U.y+Math.sin(U.ang)*16;
  if(live&&U.mode==='track'&&U.tgt){const tg=U.tgt,a=U.acq>0.9;c.strokeStyle=a?'rgba(255,40,40,.6)':'rgba(255,60,60,.35)';c.lineWidth=a?0.45:0.3;c.setLineDash(a?[]:[3,3]);c.beginPath();c.moveTo(mx,my);c.lineTo(tg.x,tg.y);c.stroke();c.setLineDash([]);
    c.fillStyle='rgba(255,40,40,.8)';c.beginPath();c.arc(tg.x,tg.y,0.9,0,6.283);c.fill();}
  else if(live){const L=sentryBeamLen(),ex=U.x+Math.cos(U.ang)*L,ey=U.y+Math.sin(U.ang)*L;const g=c.createLinearGradient(mx,my,ex,ey);g.addColorStop(0,'rgba(255,50,50,.45)');g.addColorStop(1,'rgba(255,50,50,.12)');
    c.strokeStyle=g;c.lineWidth=0.35;c.beginPath();c.moveTo(mx,my);c.lineTo(ex,ey);c.stroke();c.fillStyle='rgba(255,60,60,.6)';c.beginPath();c.arc(ex,ey,1.1,0,6.283);c.fill();}
  c.save();c.translate(U.x,U.y);const ga=U.hp>0&&!U.down?U.ang:2.4;c.rotate(ga);if(Math.cos(ga)<0)c.scale(1,-1);
  c.fillStyle=U.hp>0?'#4a525a':'#24282c';c.beginPath();c.roundRect?c.roundRect(-11,-8,22,15,3):c.rect(-11,-8,22,15);c.fill();c.fillStyle='#1d2125';c.fillRect(9,-2.2,13,4.4);c.fillStyle='#5b646c';c.fillRect(-9,-8,16,2.4);
  c.fillStyle='rgba(0,0,0,.35)';c.fillRect(-11,4,22,3);
  if(U.flash>0){c.fillStyle='rgba(255,220,140,.95)';c.beginPath();c.arc(24,0,4.5,0,6.283);c.fill();}
  c.fillStyle=live?(U.mode==='track'?(Math.floor(S.t*10)%2?'#ff3b3b':'#ff9b9b'):'#ff3b3b'):'#111';c.beginPath();c.arc(3,-3,1.5,0,6.283);c.fill();c.restore();c.restore();
  if(U.hp<=0){c.fillStyle='rgba(60,60,60,.3)';for(let i=0;i<3;i++){c.beginPath();c.arc(U.x+Math.sin(S.t*0.7+i*2)*4,U.y-12-((S.t*14+i*9)%30),3+((S.t*3+i)%3),0,6.283);c.fill();}}
  // items lying around
  for(const it of S.items){if(it.taken||it.id==='cab')continue;c.save();c.translate(it.x,it.y);
    if(it.id==='crowbar'){c.rotate(-0.04);c.scale(0.9,0.9);c.translate(-40,0);artDraw(c,'crowbar');}
    else if(it.id==='pistol'){c.translate(10,-6);artDraw(c,'pistol');}
    else if(it.id==='knife'){c.translate(0,-1.5);c.scale(0.75,0.75);artDraw(c,'knife');}
    c.restore();
    // a soft glow so you notice it
    c.fillStyle=`rgba(255,215,90,${0.10+0.06*Math.sin(S.t*3)})`;c.beginPath();c.ellipse(it.x,it.y-3,it.id==='knife'?16:26,7,0,0,6.283);c.fill();}
  // where "Cover" will take you
  if(S.coverGo){c.strokeStyle='rgba(255,201,60,.6)';c.lineWidth=0.6;c.setLineDash([2,2]);c.beginPath();c.moveTo(S.coverGo.x,-2);c.lineTo(S.coverGo.x,-60);c.stroke();c.setLineDash([]);}
}
// what he holds: the pistol in the hand along the aim (it kicks up with each shot), the knife point-forward, or the crowbar
function drawStoryFront(c){const S=STORY;setWorld(c);if(!S.held||V.dead&&!SEG.nearHand)return;const hd=storyHand();if(!hd)return;
  const q=P[hd.b],fa=P[hd.a],ha=Math.atan2(q.y-fa.y,q.x-fa.x);
  if(S.held==='pistol'){const kick=Math.max(0,S.cool-0.18)*4*FACE;
    // the grip passes through the fist ≈7 cm from the wrist, on the palm side; the bore is ≈3 cm above the knuckles.
    // Raised, the gun lines up with the aim; at the low ready it follows the hand
    const g=toWorld(hd,7,0.6),ai=S.aimA??ha,up=S.aiming?S.raise:0,a=ha+wrap(ai-ha)*(S.blind?1:up*0.6)-kick;
    c.save();c.translate(g.x,g.y);c.rotate(a);if(Math.cos(a)<0)c.scale(1,-1);c.translate(typeof WARTBMP!=='undefined'&&WARTBMP.pistol?15.8:15.5,typeof WARTBMP!=='undefined'&&WARTBMP.pistol?-4.4:-6.4);artDraw(c,'pistol');c.restore();
    if(hd===SEG.nearHand&&STORY.fist&&STORY.fist.near){const tone=skinTone(false);setLocal(c,hd);smoothPath(c,FISTP,[1,hd.len/15]);c.fillStyle=rgb(tone,0.97);c.fill();c.strokeStyle='rgba(70,35,25,.26)';c.lineWidth=0.2;c.stroke();fistDetail(c,tone);setWorld(c);}}
  else if(S.held==='knife'){const g=toWorld(hd,7,0.4);c.save();c.translate(g.x,g.y);c.rotate(ha);if(Math.cos(ha)<0)c.scale(1,-1);c.scale(0.75,0.75);c.translate(4,0);artDraw(c,'knife');c.restore();}
  else if(S.held==='crowbar'){const a=ha+FACE*(S.door.prying?-0.6:0.35);c.save();c.translate(q.x,q.y);c.rotate(a);if(Math.cos(a)<0)c.scale(1,-1);c.scale(0.9,0.9);c.translate(-12,0);artDraw(c,'crowbar');c.restore();}
}
