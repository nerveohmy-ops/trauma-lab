/* TRAUMA_LAB_MAIN */
/* ===== render/world.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
function drawProps(){
  if(!PROPS.length)return;const c=ctx;
  for(const pr of PROPS){c.save();c.translate(pr.x,pr.y);c.rotate(pr.ang);c.translate(-pr.ox,-pr.oy);
    if(pr.type==='crate')drawCrate(c,pr);else if(pr.type==='lowbox')drawLowbox(c,pr);else if(pr.type==='cabinet')drawCabinet(c,pr);else if(pr.type==='table')drawTable(c);else if(pr.type==='pool')drawPool(c,pr);else if(pr.type==='gurney'){drawGurney(c);drawBrakes(c,pr);}else if(pr.type==='stretcher')drawStretcher(c);else if(pr.type==='slab')drawSlab(c);else if(pr.type==='chair')drawChair(c);else{c.scale(pr.sc||1,pr.sc||1);drawBeaker(c,pr);}
    c.restore();}
  if(grab&&grab.prop&&pointerW){const pr=grab.prop,ca=Math.cos(pr.ang),sa=Math.sin(pr.ang);c.strokeStyle='rgba(233,196,106,.7)';c.lineWidth=0.4;c.beginPath();c.moveTo(pr.x+grab.lx*ca-grab.ly*sa,pr.y+grab.lx*sa+grab.ly*ca);c.lineTo(pointerW.x,pointerW.y);c.stroke();}
}
// story-mode cover: a plywood crate and a steel filing cabinet, with the holes bullets have left in them
function propHoles(c,pr,steel){if(!pr.holes)return;for(const [x,y] of pr.holes){c.fillStyle=steel?'#1a1c1e':'#20160c';c.beginPath();c.arc(x,y,steel?0.55:0.65,0,6.283);c.fill();c.strokeStyle=steel?'rgba(220,225,230,.6)':'rgba(230,200,150,.35)';c.lineWidth=0.25;c.beginPath();c.arc(x,y,steel?0.95:1.1,0,6.283);c.stroke();}}
function drawCrate(c,pr){const g=c.createLinearGradient(0,-130,0,0);g.addColorStop(0,'#7a6342');g.addColorStop(1,'#56452d');c.fillStyle=g;c.fillRect(-22,-130,44,130);
  c.strokeStyle='#3d311f';c.lineWidth=1.3;c.strokeRect(-21.3,-129.3,42.6,128.6);c.beginPath();c.moveTo(-20,-128);c.lineTo(20,-2);c.moveTo(20,-128);c.lineTo(-20,-2);c.stroke();
  c.strokeStyle='rgba(0,0,0,.18)';c.lineWidth=0.3;for(let y=-120;y<0;y+=10){c.beginPath();c.moveTo(-21,y);c.lineTo(21,y);c.stroke();}
  c.fillStyle='rgba(255,255,255,.09)';c.fillRect(-22,-130,44,2.2);c.fillStyle='rgba(20,16,10,.75)';c.font='700 5.5px "IBM Plex Mono",monospace';c.textAlign='center';c.fillText('BIOHAZARD',0,-62);c.fillText('35 kg',0,-55);c.textAlign='left';propHoles(c,pr,false);}
// the low steel crate: olive drab, ribbed sides, stencilled, two handles
function drawLowbox(c,pr){const g=c.createLinearGradient(-32,0,32,0);g.addColorStop(0,'#3f4a36');g.addColorStop(0.5,'#536048');g.addColorStop(1,'#3b4532');c.fillStyle=g;c.fillRect(-32,-95,64,95);
  c.fillStyle='#2c3427';c.fillRect(-32,-95,64,4);c.fillRect(-32,-4,64,4);for(const y of [-66,-36]){c.fillStyle='rgba(0,0,0,.22)';c.fillRect(-31,y,62,2);c.fillStyle='rgba(255,255,255,.07)';c.fillRect(-31,y-1,62,1);}
  c.fillStyle='#1f251b';for(const x of [-26,22])c.fillRect(x,-82,4,10);
  c.fillStyle='rgba(225,220,170,.55)';c.font='700 6px "IBM Plex Mono",monospace';c.textAlign='center';c.fillText('EQUIPMENT',0,-55);c.font='700 5px "IBM Plex Mono",monospace';c.fillText('80 kg',0,-47);c.textAlign='left';
  c.fillStyle='rgba(255,255,255,.08)';c.fillRect(-32,-95,64,1.2);propHoles(c,pr,true);}
function drawCabinet(c,pr){c.fillStyle='#8e98a0';c.fillRect(-32,-132,64,4);const g=c.createLinearGradient(-32,0,32,0);g.addColorStop(0,'#59626a');g.addColorStop(0.5,'#6b757d');g.addColorStop(1,'#545c63');c.fillStyle=g;c.fillRect(-31,-128,62,126);
  for(let i=0;i<4;i++){const y=-124+i*31;c.fillStyle='#4b535a';c.fillRect(-27,y,54,27);c.fillStyle='#c3cbd0';c.fillRect(-6,y+11,12,2.2);c.fillStyle='rgba(255,255,255,.75)';c.fillRect(-4,y+4,8,4);}
  c.fillStyle='#2d3237';c.fillRect(-31,-2,62,2);propHoles(c,pr,true);}
function woodGrad(c,x0,y0,x1,y1){const g=c.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,'#8a5a34');g.addColorStop(0.5,'#a26c3f');g.addColorStop(1,'#734828');return g;}
function drawTable(c){
  for(const sx of [-41,41]){c.fillStyle=woodGrad(c,sx-2,0,sx+2,0);c.fillRect(sx-1.9,-71,3.8,71);c.fillStyle='rgba(0,0,0,.25)';c.fillRect(sx+0.9,-71,1,71);c.fillStyle='#3a2616';c.fillRect(sx-2.1,-1.2,4.2,1.2);}
  c.fillStyle='#6b4325';c.fillRect(-38,-71.5,76,3.4);
  c.fillStyle=woodGrad(c,0,-75,0,-71);c.fillRect(-47,-75.2,94,4.4);c.fillStyle='rgba(255,230,190,.18)';c.fillRect(-47,-75.2,94,0.8);
  c.strokeStyle='rgba(60,35,18,.35)';c.lineWidth=0.18;for(let i=0;i<4;i++){c.beginPath();c.moveTo(-46,-74.4+i);c.bezierCurveTo(-20,-74.8+i,10,-73.6+i,46,-74.2+i);c.stroke();}
}
function drawChair(c){
  for(const sx of [-19,19]){c.fillStyle=woodGrad(c,sx-1.5,0,sx+1.5,0);c.fillRect(sx-1.4,-44,2.8,44);c.fillStyle='#3a2616';c.fillRect(sx-1.6,-1,3.2,1);}
  c.fillStyle='#6b4325';c.fillRect(-18,-24,36,1.6);
  c.fillStyle=woodGrad(c,-21.5,0,-18.5,0);c.fillRect(-21.4,-93,2.9,49);
  for(const y of [-90,-80,-70]){c.fillStyle='#7c5030';c.fillRect(-21.2,y,2.6,5);}
  c.fillStyle=woodGrad(c,0,-47,0,-43);c.fillRect(-21.6,-47,43.2,3.6);c.fillStyle='rgba(255,230,190,.2)';c.fillRect(-21.6,-47,43.2,0.7);
}
function drawBeaker(c,pr){
  const m=pr.mix,H_=9.4,inH=8.6,f=m.vol/pr.cap,L=m.vol>0.05?liquidPoly(Math.min(1.02,f),pr.ang):null;
  if(L){const col=mixColor(m);c.save();c.beginPath();L.poly.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.closePath();
    c.fillStyle=`rgba(${col[0]|0},${col[1]|0},${col[2]|0},${Math.max(0.28,col[3]).toFixed(2)})`;c.fill();c.clip();
    const sp=L.poly.filter(q=>Math.abs(q[0]*L.gx+q[1]*L.gy-L.c)<0.03),mx=sp.length>=2?(sp[0][0]+sp[1][0])/2:0,my=sp.length>=2?(sp[0][1]+sp[1][1])/2:-0.6-inH*Math.min(1,f);
    if(sp.length>=2){c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=0.25;c.beginPath();c.moveTo(sp[0][0],sp[0][1]);c.lineTo(sp[1][0],sp[1][1]);c.stroke();}
    if(m.foam>1){const fh=Math.min(BK.H,m.foam/pr.cap*BK.H);c.restore();c.save();c.fillStyle='rgba(250,250,246,.85)';c.beginPath();c.rect(-3.9,my-fh,7.8,fh+0.3);c.fill();for(let i=0;i<10;i++){c.fillStyle='rgba(255,255,255,.9)';c.beginPath();c.arc(-3.4+i*0.75,my-fh,0.45,0,6.28);c.fill();}c.restore();c.save();c.beginPath();L.poly.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.closePath();c.clip();}
    if(m.ice>0.3){c.fillStyle='rgba(245,250,255,.85)';const n=Math.min(6,1+Math.floor(m.ice/15));for(let i=0;i<n;i++){const x=mx+((i*37)%7-3)*0.8,y=my+0.5+(i%2)*0.6;c.fillRect(x-0.5,y-0.4,1,0.8);}}
    const rx=m.P>0||m.boil>0.05||m.ln2>0;if(rx){c.strokeStyle='rgba(240,250,255,.7)';c.lineWidth=0.1;for(let i=0;i<8;i++){const x=rnd(-3.6,3.6),y=rnd(my,-0.8);c.beginPath();c.arc(x,y,rnd(0.12,0.3),0,6.28);c.stroke();}}
    for(const [M,col] of [['K','190,190,200'],['Na','215,215,205']])if(m[M]>0.002){const r=0.25+0.55*Math.cbrt(m[M]),x=mx+Math.sin(T*7+(M==='K'?0:2))*(m.w>0.3?2:0);c.fillStyle=`rgb(${col})`;c.beginPath();c.arc(x,my-r*0.3,r,0,6.28);c.fill();c.fillStyle='rgba(255,255,255,.6)';c.beginPath();c.arc(x-r*0.3,my-r*0.6,r*0.3,0,6.28);c.fill();}
    c.restore();}
  else for(const [M,col] of [['K','190,190,200'],['Na','215,215,205']])if(m[M]>0.002){const r=0.25+0.55*Math.cbrt(m[M]);c.fillStyle=`rgb(${col})`;c.beginPath();c.arc(0,-0.6-r,r,0,6.28);c.fill();}
  if(m.T>45){c.fillStyle=`rgba(255,120,60,${Math.min(0.18,(m.T-45)/300)})`;c.fillRect(-3.9,-H_,7.8,H_);}
  if(m.T<-20){c.fillStyle='rgba(235,245,255,.25)';c.fillRect(-3.9,-H_,7.8,H_);}
  // glass
  c.strokeStyle='rgba(225,240,255,.85)';c.lineWidth=0.32;c.beginPath();c.moveTo(-4.4,-H_-0.5);c.lineTo(-3.9,-H_);c.lineTo(-3.9,-0.4);c.quadraticCurveTo(-3.9,0,-3.5,0);c.lineTo(3.5,0);c.quadraticCurveTo(3.9,0,3.9,-0.4);c.lineTo(3.9,-H_);c.stroke();
  c.fillStyle='rgba(200,225,255,.08)';c.fillRect(-3.9,-H_,7.8,H_);
  c.strokeStyle='rgba(225,240,255,.6)';c.lineWidth=0.12;for(let i=1;i<=4;i++){const y=-0.6-inH*i/5;c.beginPath();c.moveTo(2.4,y);c.lineTo(3.9,y);c.stroke();}
  c.fillStyle='rgba(255,255,255,.35)';c.fillRect(-3.4,-H_+0.8,0.5,H_-2);
}
// contents readout above every beaker, drawn in screen space so it stays readable at any zoom
function drawBeakerLabels(){
  if(!PROPS.length||view!=='side')return;const c=ctx,placed=[];
  for(const pr of PROPS.filter(isBeaker).sort((a,b)=>b.y-a.y)){if(pr.dead)continue;const m=pr.mix,p=bkPt(pr,0,BK.rim-1);const sx=p.x*VS+VX,sy=p.y*VS+VY-8;if(sx<-90||sx>W+90||sy<-40||sy>H+90)continue;
    const lines=[];for(const id in m.add){if(id==='mix')continue;const d=CHEM[id],v=m.add[id];if(!d||v<(d.metal?0.01:0.5))continue;const cc=d.metal?(id==='k'?'200,150,255':'255,175,50'):d.col.slice(0,3).map(q=>Math.round(q)).join(',');lines.push([d.s,d.metal?(m[d.metal]>0.003?m[d.metal].toFixed(2)+' g':'reacted'):Math.round(v)+' mL','rgb('+cc+')']);}
    if(m.add.mix>0.5)lines.push(['Poured in',Math.round(m.add.mix)+' mL','rgb(170,190,210)']);
    const ph=mixPH(m);lines.push([m.vol>0.05?Math.round(m.vol)+' / '+pr.cap+' mL':'Empty · '+pr.cap+' mL',m.vol>0.05?(ph!=null?'pH '+ph.toFixed(1)+' · ':'')+Math.round(m.T)+' °C':'',m.T>60?'rgb(255,138,92)':m.T<0?'rgb(159,208,255)':'rgb(150,160,170)']);
    if(m.note&&m.vol>0.05)lines.push([m.note,'','rgb(233,196,106)']);
    c.save();c.setTransform(DPR,0,0,DPR,0,0);c.font='600 10px "IBM Plex Mono",ui-monospace,monospace';const w=Math.max(...lines.map(l=>c.measureText(l[0]+'  '+l[1]).width))+18,h=lines.length*13+6;
    const x0=clamp(sx-w/2,4,W-w-4);let y0=sy-h;for(let it=0;it<8;it++){const o=placed.find(r=>x0<r[0]+r[2]&&x0+w>r[0]&&y0<r[1]+r[3]&&y0+h>r[1]);if(!o)break;y0=o[1]-h-3;}placed.push([x0,y0,w,h]);c.fillStyle='rgba(13,16,19,.82)';c.strokeStyle='rgba(255,255,255,.14)';c.lineWidth=1;c.beginPath();c.roundRect?c.roundRect(x0,y0,w,h,5):c.rect(x0,y0,w,h);c.fill();c.stroke();
    lines.forEach((l,i)=>{c.fillStyle=l[2];c.fillRect(x0+5,y0+7+i*13,5,5);c.fillStyle='#e7ecef';c.textAlign='left';c.fillText(l[0],x0+13,y0+13+i*13);c.fillStyle='#8794a0';c.textAlign='right';if(l[1])c.fillText(l[1],x0+w-5,y0+13+i*13);});
    c.restore();}
}
// ---------- drawing the weapons ----------
// a lodged weapon is drawn before the body: the skin hides the buried part of the blade, the rest sticks out of the wound
function drawMeleeStuck(){if(!MW.length||view!=='side')return;const c=ctx;
  for(const o of MW){if(!o.stuck)continue;const d=MWDEF[o.id];const b=mwPt(o,0,0);c.save();c.translate(b.x,b.y);c.rotate(o.ang);drawWeapon(c,o.id,d);c.restore();}}
function drawMelee(){if(!MW.length||view!=='side')return;const c=ctx;
  for(const o of MW){if(o.stuck)continue;const d=MWDEF[o.id];const b=mwPt(o,0,0);c.save();c.translate(b.x,b.y);c.rotate(o.ang);drawWeapon(c,o.id,d);c.restore();}}
function steel(c,y0,y1){const g=c.createLinearGradient(0,y0,0,y1);g.addColorStop(0,'#eef2f5');g.addColorStop(0.45,'#aab3bb');g.addColorStop(1,'#6d757d');return g;}
// knife, machete and bat are drawn from the redesign's weapon sheet (handle end at x 0 along y 0, true length); the axe
// keeps its own drawing because its edge has to sit where the game cuts with it (below the haft)
const WARTMELEE={knife:1,machete:1,bat:1};
function drawWeapon(c,id,d){if(WARTMELEE[id]&&typeof WARTBMP!=='undefined'&&WARTBMP[id]){const p=WART[id].p;c.drawImage(WARTBMP[id],p[0],p[1],p[2],p[3]);return;}
  c.lineJoin='round';c.lineCap='round';
  const grip=(x0,x1,h,col,wrap)=>{c.fillStyle=col;c.beginPath();c.roundRect?c.roundRect(x0,-h,x1-x0,2*h,h*0.6):c.rect(x0,-h,x1-x0,2*h);c.fill();if(wrap){c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=0.18;for(let x=x0+1;x<x1;x+=1.4){c.beginPath();c.moveTo(x,-h);c.lineTo(x+0.7,h);c.stroke();}}c.fillStyle='rgba(255,255,255,.12)';c.fillRect(x0+0.5,-h*0.7,x1-x0-1,h*0.35);};
  if(id==='knife'){grip(0,11,1.15,'#1d1f22');c.fillStyle='#c9ced3';for(const x of [3,7.5]){c.beginPath();c.arc(x,0,0.32,0,6.28);c.fill();}c.fillStyle='#9aa2aa';c.fillRect(10.6,-1.35,1.2,2.7);
    c.fillStyle=steel(c,-1.2,1.5);c.beginPath();c.moveTo(11.6,-1.1);c.lineTo(26,-1.1);c.quadraticCurveTo(29,-0.9,30,0.2);c.quadraticCurveTo(27,1.4,22,1.5);c.lineTo(11.6,1.5);c.closePath();c.fill();c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=0.14;c.beginPath();c.moveTo(12,1.15);c.lineTo(22,1.15);c.quadraticCurveTo(27,1.05,29.6,0.25);c.stroke();return;}
  if(id==='machete'){grip(0,14,1.25,'#2a2622',true);c.fillStyle='#8a9096';c.fillRect(13.6,-1.5,0.9,3);
    c.fillStyle=steel(c,-1.6,2.2);c.beginPath();c.moveTo(14.5,-1.4);c.lineTo(56,-1.6);c.quadraticCurveTo(61,-1.2,62,0.6);c.quadraticCurveTo(58,2.6,50,2.6);c.lineTo(14.5,1.9);c.closePath();c.fill();c.fillStyle='rgba(60,50,40,.25)';c.fillRect(20,-1.2,30,0.6);c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=0.16;c.beginPath();c.moveTo(15,1.6);c.lineTo(50,2.25);c.quadraticCurveTo(58,2.2,61.5,0.6);c.stroke();return;}
  if(id==='axe'){const g=c.createLinearGradient(0,-1.4,0,1.4);g.addColorStop(0,'#c99a62');g.addColorStop(1,'#8a5f34');c.fillStyle=g;c.beginPath();c.moveTo(0,-1.3);c.quadraticCurveTo(35,-1.7,70,-1.2);c.lineTo(70,1.2);c.quadraticCurveTo(35,1.7,0,1.4);c.closePath();c.fill();
    c.strokeStyle='rgba(90,55,25,.35)';c.lineWidth=0.15;for(let i=0;i<3;i++){c.beginPath();c.moveTo(4,-0.8+i*0.7);c.bezierCurveTo(25,-0.4+i*0.5,45,-1+i*0.7,66,-0.6+i*0.6);c.stroke();}
    c.fillStyle=steel(c,-4,9);c.beginPath();c.moveTo(62,-4);c.lineTo(71.5,-4);c.lineTo(72,-1);c.lineTo(73,4);c.quadraticCurveTo(75,7,73.5,10);c.lineTo(60.5,9);c.quadraticCurveTo(62.5,5,62.5,1.5);c.closePath();c.fill();c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.moveTo(61,8.6);c.lineTo(73.4,9.6);c.lineTo(73,8.6);c.lineTo(62,7.6);c.closePath();c.fill();return;}
  if(id==='saber'){const col=SABC[MODE.saber]||SABC.blue;for(const [w,a] of [[4,0.14],[2.4,0.3],[1.3,0.6]]){c.strokeStyle=`rgba(${col},${a})`;c.lineWidth=w;c.beginPath();c.moveTo(28,0);c.lineTo(110,0);c.stroke();}c.strokeStyle='#fbfdff';c.lineWidth=0.55;c.beginPath();c.moveTo(28,0);c.lineTo(110,0);c.stroke();
    const g=c.createLinearGradient(0,-1.5,0,1.5);g.addColorStop(0,'#e3e7ea');g.addColorStop(0.5,'#8d949b');g.addColorStop(1,'#3c4146');c.fillStyle=g;c.fillRect(0,-1.4,28,2.8);c.fillStyle='#22262a';for(let x=3;x<15;x+=2.2)c.fillRect(x,-1.45,1.1,2.9);c.fillStyle='#b9a24a';c.fillRect(24,-1.7,1.2,3.4);c.fillStyle='#c33';c.fillRect(18,-1.6,1.6,0.6);return;}
  if(id==='bat'){const g=c.createLinearGradient(0,-3.3,0,3.3);g.addColorStop(0,'#e1b979');g.addColorStop(0.5,'#c6965a');g.addColorStop(1,'#8f6534');c.fillStyle=g;c.beginPath();c.moveTo(0,-1.5);c.lineTo(28,-1.4);c.bezierCurveTo(45,-1.6,58,-3.3,80,-3.3);c.quadraticCurveTo(84.5,-3.2,84.5,0);c.quadraticCurveTo(84.5,3.2,80,3.3);c.bezierCurveTo(58,3.3,45,1.6,28,1.4);c.lineTo(0,1.5);c.closePath();c.fill();
    c.fillStyle='#7a5530';c.beginPath();c.ellipse(-0.6,0,0.9,2.1,0,0,6.28);c.fill();grip(0.5,24,1.5,'#222',true);c.strokeStyle='rgba(110,70,30,.3)';c.lineWidth=0.15;for(let i=0;i<4;i++){c.beginPath();c.moveTo(30,-1+i*0.6);c.bezierCurveTo(50,-1.8+i*1.1,65,-2.4+i*1.5,82,-2.2+i*1.4);c.stroke();}return;}
  if(id==='hammer'){const g=c.createLinearGradient(0,-1.1,0,1.1);g.addColorStop(0,'#f2c24a');g.addColorStop(1,'#b27f12');c.fillStyle=g;c.beginPath();c.roundRect?c.roundRect(0,-1.1,30,2.2,1):c.rect(0,-1.1,30,2.2);c.fill();grip(0,13,1.25,'#1f1f1f',true);
    c.fillStyle=steel(c,-7,6);c.beginPath();c.moveTo(29.5,-2.2);c.lineTo(34.5,-2.2);c.lineTo(34.5,3);c.lineTo(35.3,3.2);c.lineTo(35.3,6.2);c.lineTo(28.7,6.2);c.lineTo(28.7,3.2);c.lineTo(29.5,3);c.closePath();c.fill();
    c.beginPath();c.moveTo(29.5,-2.2);c.quadraticCurveTo(29,-5,31.2,-7.4);c.lineTo(32.3,-7.2);c.quadraticCurveTo(31.6,-4.8,33,-2.2);c.closePath();c.fill();c.fillStyle='rgba(255,255,255,.5)';c.fillRect(28.9,5.6,6.2,0.45);return;}
  if(id==='pipe'){const g=c.createLinearGradient(0,-1.7,0,1.7);g.addColorStop(0,'#c9ced2');g.addColorStop(0.4,'#8d959c');g.addColorStop(1,'#4f565c');c.fillStyle=g;c.fillRect(0,-1.7,60,3.4);c.fillStyle='rgba(140,80,40,.35)';for(const x of [9,23,41]){c.beginPath();c.ellipse(x,0.6,2.5,0.7,0.2,0,6.28);c.fill();}
    c.strokeStyle='rgba(30,30,30,.45)';c.lineWidth=0.14;for(let x=55.5;x<60;x+=0.6){c.beginPath();c.moveTo(x,-1.7);c.lineTo(x+0.3,1.7);c.stroke();}for(let x=0.4;x<4.5;x+=0.6){c.beginPath();c.moveTo(x,-1.7);c.lineTo(x+0.3,1.7);c.stroke();}c.fillStyle='#2a2d30';c.beginPath();c.ellipse(60,0,0.5,1.5,0,0,6.28);c.fill();return;}
  if(id==='crowbar'){const g=c.createLinearGradient(0,-1.1,0,1.1);g.addColorStop(0,'#e0534a');g.addColorStop(1,'#8e1f19');c.fillStyle=g;c.fillRect(0,-1.1,71,2.2);c.fillStyle='#2b2b2b';c.fillRect(0,-1.1,9,2.2);
    c.strokeStyle=g;c.lineWidth=2.2;c.beginPath();c.moveTo(70,0);c.quadraticCurveTo(77,0,76.5,4.5);c.stroke();c.fillStyle='#3a3a3a';c.beginPath();c.moveTo(0,-1.1);c.lineTo(-3,-1.6);c.lineTo(-3,0.2);c.closePath();c.fill();c.fillStyle='rgba(255,255,255,.25)';c.fillRect(10,-0.9,58,0.4);return;}
}
function drawKnifeAt(c,x,y,ux,uy,vis,full,a){
  const nx=-uy,ny=ux,bw=1.6;c.globalAlpha=a==null?1:a;
  const bx=x-ux*vis,by=y-uy*vis;
  if(vis>0.2){c.fillStyle='#d3d9de';c.beginPath();
    if(full){c.moveTo(x,y);c.quadraticCurveTo(x-ux*4+nx*bw,y-uy*4+ny*bw,bx+nx*bw,by+ny*bw);c.lineTo(bx-nx*0.45,by-ny*0.45);c.closePath();}
    else{c.moveTo(x+nx*bw*0.95,y+ny*bw*0.95);c.lineTo(bx+nx*bw,by+ny*bw);c.lineTo(bx-nx*0.45,by-ny*0.45);c.lineTo(x-nx*0.45,y-ny*0.45);c.closePath();}
    c.fill();c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=0.18;c.beginPath();c.moveTo(bx-nx*0.3,by-ny*0.3);c.lineTo(x-nx*0.3+(full?ux*-2:0),y-ny*0.3+(full?uy*-2:0));c.stroke();}
  c.fillStyle='#4a4a4a';c.beginPath();c.moveTo(bx+nx*2.3,by+ny*2.3);c.lineTo(bx-nx*1.4,by-ny*1.4);c.lineTo(bx-ux*0.9-nx*1.4,by-uy*0.9-ny*1.4);c.lineTo(bx-ux*0.9+nx*2.3,by-uy*0.9+ny*2.3);c.closePath();c.fill();
  const hx=bx-ux*0.9,hy=by-uy*0.9,ex=hx-ux*KHL,ey=hy-uy*KHL;
  c.fillStyle='#2a2420';c.beginPath();c.moveTo(hx+nx*1.25,hy+ny*1.25);c.lineTo(ex+nx*1.4,ey+ny*1.4);c.quadraticCurveTo(ex-ux*1.4,ey-uy*1.4,ex-nx*1.1,ey-ny*1.1);c.lineTo(hx-nx*1.0,hy-ny*1.0);c.closePath();c.fill();
  c.fillStyle='#b9a36a';for(const f of [0.3,0.7]){c.beginPath();c.arc(lerp(hx,ex,f),lerp(hy,ey,f),0.35,0,6.28);c.fill();}
  c.globalAlpha=1;
}
function drawKnivesSide(){
  const c=ctx;
  for(const K of KNIVES){const E=toWorld(K.seg,K.s,K.w),u=dirWorld(K.seg,K.dw,K.ds),n=Math.hypot(u.x,u.y)||1;const ux=u.x/n,uy=u.y/n;
    if(xray)drawKnifeAt(c,E.x+ux*K.depth,E.y+uy*K.depth,ux,uy,K.depth,true,0.55);drawKnifeAt(c,E.x,E.y,ux,uy,KBL-K.depth,false);}
  if(HK&&!HK.front&&view==='side'){
    if(HK.ins){const I=HK.ins,E=toWorld(I.seg,I.s,I.w),u=dirWorld(I.seg,I.dw,I.ds),n=Math.hypot(u.x,u.y)||1;const ux=u.x/n,uy=u.y/n;if(xray)drawKnifeAt(c,E.x+ux*I.depth,E.y+uy*I.depth,ux,uy,I.depth,true,0.55);drawKnifeAt(c,E.x,E.y,ux,uy,KBL-I.depth,false);}
    else drawKnifeAt(c,HK.tx,HK.ty,Math.cos(HK.ang),Math.sin(HK.ang),KBL,true);
    c.strokeStyle='rgba(233,196,106,.5)';c.lineWidth=0.35;c.beginPath();c.arc(HK.x,HK.y,2.2,0,6.28);c.stroke();
  }
}
function drawFrontFlight(c,f){const d=ARDEF[f.k],vn=f.v0/(1+AR_DRAG*f.v0*f.t),A=frontFlightState(f,f.t),B=frontFlightState(f,f.t+d.len/vn);
  c.strokeStyle='rgba(233,196,106,.55)';c.lineWidth=0.18;c.setLineDash([0.6,0.6]);c.beginPath();c.arc(f.x,f.y,1.6,0,6.28);c.stroke();c.setLineDash([]);
  if(A.d<300)return; // still beside you, out of frame
  const pr=q=>{const K=f.D/q.d;return{x:f.x+q.lat*K,y:f.y-q.up*K,K};},n=pr(A),tp=pr(B),K=Math.min(n.K,5);
  c.lineCap='round';c.strokeStyle=d.shaft;c.lineWidth=0.75*K;c.beginPath();c.moveTo(n.x,n.y);c.lineTo(tp.x,tp.y);c.stroke();
  c.strokeStyle='rgba(255,255,255,.2)';c.lineWidth=0.22*K;c.stroke();
  const h=(f.k==='crossbow'?1.5:2.1)*K,rot=f.rot+2*Math.PI*32*f.t,dx=tp.x-n.x,dy=tp.y-n.y;c.fillStyle=d.flet;
  for(let i=0;i<3;i++){const ph=rot+i*2.094;c.beginPath();c.moveTo(n.x+dx*0.12+Math.cos(ph-0.5)*h*0.25,n.y+dy*0.12+Math.sin(ph-0.5)*h*0.25);c.lineTo(n.x+Math.cos(ph)*h,n.y+Math.sin(ph)*h);c.lineTo(n.x+Math.cos(ph+0.35)*h*0.35,n.y+Math.sin(ph+0.35)*h*0.35);c.closePath();c.fill();}
  c.fillStyle=d.shaft;c.beginPath();c.arc(n.x,n.y,0.42*K,0,6.28);c.fill();c.fillStyle='#d8d23a';c.beginPath();c.arc(n.x,n.y,0.5*K,0,6.28);c.fill();}
// broadhead wound: three cut slits round the shaft hole, bruised round the edge; an exit is everted
function drawBroadheadWound(s,x,y,r,rot,su,exit){
  if(su>=1){s.strokeStyle='rgba(120,40,45,.55)';s.lineWidth=0.3;s.lineCap='round';for(let i=0;i<3;i++){const a=rot+i*2.094;s.beginPath();s.moveTo(x,y);s.lineTo(x+Math.cos(a)*r*1.1,y+Math.sin(a)*r*1.1);s.stroke();}return;}
  const g=s.createRadialGradient(x,y,0,x,y,r*2.8);g.addColorStop(0,'rgba(95,18,38,.42)');g.addColorStop(0.55,'rgba(110,40,60,.18)');g.addColorStop(1,'rgba(110,40,60,0)');s.fillStyle=g;s.beginPath();s.arc(x,y,r*2.8,0,6.28);s.fill();
  const L=r*1.45*(exit?1.15:1)*(1-su*0.6),wd=r*0.34*(exit?1.3:1)*(1-su*0.6);
  for(let i=0;i<3;i++){const a=rot+i*2.094,ux=Math.cos(a),uy=Math.sin(a),nx=-uy,ny=ux,mx=x+ux*L*0.5,my=y+uy*L*0.5,tx=x+ux*L,ty=y+uy*L;
    if(exit){s.fillStyle='rgba(205,110,110,.6)';s.beginPath();s.moveTo(x,y);s.quadraticCurveTo(mx+nx*wd*1.9,my+ny*wd*1.9,tx+ux*0.2,ty+uy*0.2);s.quadraticCurveTo(mx-nx*wd*1.9,my-ny*wd*1.9,x,y);s.fill();}
    s.fillStyle='#2a0306';s.beginPath();s.moveTo(x,y);s.quadraticCurveTo(mx+nx*wd,my+ny*wd,tx,ty);s.quadraticCurveTo(mx-nx*wd,my-ny*wd,x,y);s.fill();
    s.fillStyle='#86131c';s.beginPath();s.moveTo(x,y);s.quadraticCurveTo(mx+nx*wd*0.4,my+ny*wd*0.4,x+ux*L*0.85,y+uy*L*0.85);s.quadraticCurveTo(mx-nx*wd*0.4,my-ny*wd*0.4,x,y);s.fill();}
  s.fillStyle='#1a0204';s.beginPath();s.arc(x,y,r*0.42*(1-su*0.5),0,6.28);s.fill();}
// drawing: shaft, cresting, fletching, nock and broadhead. flex bends the shaft in flight (its ends swing against
// its middle, the archer's paradox); quiv bends it from where it leaves the body (shudder on impact, sag under its weight)
// gaps: spans [u0,u1] (cm back from the tip) that are inside the body and not drawn
function drawArrowShape(c,kind,tipX,tipY,ux,uy,vis,flex=0,quiv=0,gaps=null){const d=ARDEF[kind],L=d.len,nx=-uy,ny=ux;
  const s0=Math.max(0,L-vis); // only the part outside the body is drawn
  const G_=(gaps||[]).concat(s0>0?[[0,s0]]:[]),hid=u=>G_.some(g=>u>g[0]&&u<g[1]);
  const off=u=>{const t=u/L;let o=flex*(Math.sin(Math.PI*t)-0.64);if(quiv&&L-s0>0.5){const q=Math.max(0,(u-s0)/(L-s0));o+=quiv*q*q;}return o;};
  const P=u=>{const o=off(u);return{x:tipX-ux*u+nx*o,y:tipY-uy*u+ny*o};};
  c.lineCap='round';c.lineJoin='round';
  {const pth=new Path2D();let pen=false;for(let i=0;i<=48;i++){const u=L*i/48;if(hid(u)){pen=false;continue;}const p=P(u);pen?pth.lineTo(p.x,p.y):pth.moveTo(p.x,p.y);pen=true;}
  c.strokeStyle=d.shaft;c.lineWidth=0.75;c.stroke(pth);c.strokeStyle='rgba(255,255,255,.22)';c.lineWidth=0.2;c.stroke(pth);}
  const pn=P(L),pq=P(L-2),dl=Math.hypot(pn.x-pq.x,pn.y-pq.y)||1,vx=(pq.x-pn.x)/dl,vy=(pq.y-pn.y)/dl,mx=-vy,my=vx;
  const f0=kind==='crossbow'?1.5:2.5,f1=kind==='crossbow'?7:11,h=kind==='crossbow'?1.5:2.1;
  if(kind==='bow'&&L-f1-3.6>=s0&&!hid(L-f1-2.4)){const a=P(L-f1-1.2),b=P(L-f1-3.6),e=P(L-f1-2.1),e2=P(L-f1-2.7);c.strokeStyle='#e9e2cf';c.lineWidth=0.85;c.lineCap='butt';c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();c.strokeStyle=d.flet;c.beginPath();c.moveTo(e.x,e.y);c.lineTo(e2.x,e2.y);c.stroke();c.lineCap='round';}
  if(L-f0>=s0&&!hid(L-(f0+f1)/2)){const ax=pn.x+vx*f0,ay=pn.y+vy*f0,bx=pn.x+vx*f1,by=pn.y+vy*f1;c.fillStyle=d.flet;
    for(const sg of [1,-1]){c.beginPath();c.moveTo(bx,by);c.quadraticCurveTo(pn.x+vx*(f0+2)+mx*sg*h*1.25,pn.y+vy*(f0+2)+my*sg*h*1.25,ax+mx*sg*h*0.8,ay+my*sg*h*0.8);c.lineTo(ax,ay);c.closePath();c.fill();}
    c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=0.28;c.beginPath();c.moveTo(ax,ay);c.lineTo(bx,by);c.stroke();
    c.fillStyle='#d8d23a';c.beginPath();c.arc(pn.x-vx*0.3,pn.y-vy*0.3,0.5,0,6.28);c.fill();}
  if(s0<=0.01&&!hid(2)){const fa=P(3.6),fb=P(6.2);c.fillStyle='#6e757b';c.beginPath();c.moveTo(fa.x+nx*0.46,fa.y+ny*0.46);c.lineTo(fb.x+nx*0.42,fb.y+ny*0.42);c.lineTo(fb.x-nx*0.42,fb.y-ny*0.42);c.lineTo(fa.x-nx*0.46,fa.y-ny*0.46);c.closePath();c.fill();
    const t0=P(0),tx=t0.x,ty=t0.y;c.fillStyle='#c9ced3';c.beginPath();c.moveTo(tx+ux*0.4,ty+uy*0.4);c.lineTo(tx-ux*4.2+nx*1.4,ty-uy*4.2+ny*1.4);c.lineTo(tx-ux*3.2,ty-uy*3.2);c.lineTo(tx-ux*4.2-nx*1.4,ty-uy*4.2-ny*1.4);c.closePath();c.fill();
    c.strokeStyle='rgba(255,255,255,.65)';c.lineWidth=0.12;c.stroke();c.strokeStyle='rgba(40,44,48,.6)';c.lineWidth=0.1;c.beginPath();c.moveTo(tx,ty);c.lineTo(tx-ux*3.6,ty-uy*3.6);c.stroke();}
}
function drawArrows(){if(view!=='side'){drawArrowsFront();return;}const c=ctx;
  for(const a of ARROWS){const sp=Math.hypot(a.vx,a.vy)||1;let ux=a.vx/sp,uy=a.vy/sp,flex=0;
    if(a.defl&&a.ang!=null){ux=Math.cos(a.ang);uy=Math.sin(a.ang);}
    else{const t=a.t,fx=a.flex||0;flex=fx*1.5*Math.exp(-t/0.05)*Math.sin(2*Math.PI*58*t+(a.ph||0));
      const yaw=0.035*fx*Math.exp(-t/0.09)*Math.sin(2*Math.PI*14*t+(a.ph||0)),cs=Math.cos(yaw),sn=Math.sin(yaw);const u2=ux*cs-uy*sn;uy=ux*sn+uy*cs;ux=u2;
      if(a.hist&&a.hist.length>=2){const L=ARDEF[a.k].len,nkx=a.x-ux*L,nky=a.y-uy*L,hx=a.hist[0]-ux*L,hy=a.hist[1]-uy*L;const g=c.createLinearGradient(hx,hy,nkx,nky);g.addColorStop(0,'rgba(220,225,230,0)');g.addColorStop(1,'rgba(220,225,230,.2)');c.strokeStyle=g;c.lineWidth=0.6;c.beginPath();c.moveTo(hx,hy);c.lineTo(nkx,nky);c.stroke();}}
    let gaps=null;if(!a.defl&&a.done&&a.done.size){const L=ARDEF[a.k].len;gaps=[];for(const ht of traceRay(a.x-ux*L,a.y-uy*L,ux,uy,L)){if(!a.done.has(ht.seg.idx))continue;gaps.push([Math.max(0,L-ht.tout),L-Math.max(0,ht.tin)]);}}
    drawArrowShape(c,a.k,a.x,a.y,ux,uy,999,flex,0,gaps);}
  for(const S of ARSTUCK){const W=arrowWorld(S),dep=S.depth,tip={x:W.x+W.ux*dep,y:W.y+W.uy*dep},age=T-(S.t||0),vis=ARDEF[S.k].len-dep,ny=W.ux;
    let q=S.flat?0:(vis/40)*2.4*Math.exp(-age/0.35)*Math.sin(2*Math.PI*11*age);
    if(!S.flat&&S.seg)q+=(ny>=0?1:-1)*Math.abs(W.ux)*Math.min(1.2,vis/50);
    if(S.out>0&&S.seg){drawArrowShape(c,S.k,tip.x,tip.y,W.ux,W.uy,999,0,q,[[S.out,S.depth]]);const ex={x:tip.x-W.ux*S.out,y:tip.y-W.uy*S.out};c.fillStyle='rgba(110,8,16,.75)';c.beginPath();c.arc(ex.x,ex.y,0.9,0,6.28);c.fill();
      // blood smeared on the protruding head and shaft
      c.strokeStyle='rgba(120,10,18,.55)';c.lineWidth=0.9;c.lineCap='round';c.beginPath();c.moveTo(ex.x,ex.y);c.lineTo(ex.x+W.ux*Math.min(S.out,8),ex.y+W.uy*Math.min(S.out,8));c.stroke();}
    else drawArrowShape(c,S.k,tip.x,tip.y,W.ux,W.uy,vis,0,q);
    if(S.seg){c.fillStyle='rgba(110,8,16,.75)';c.beginPath();c.arc(W.x,W.y,0.8,0,6.28);c.fill();}}}
// the bow drawn in your hand while you pull: string back in proportion to the draw
function drawBowAim(){if(view!=='side'||!drag||drag.probe||!pointerW||!drag.moved)return;if(tool!=='bow'&&tool!=='crossbow')return;
  const c=ctx,o=drag.sw,ang=Math.atan2(pointerW.y-o.y,pointerW.x-o.x),ux=Math.cos(ang),uy=Math.sin(ang),nx=-uy,ny=ux;
  if(tool==='bow'){const dr=clamp((T-drag.t0)/ARDEF.bow.draw,0,1),pull=6+dr*22,H=34;
    c.strokeStyle='#2a2d31';c.lineWidth=1.3;c.lineCap='round';c.beginPath();c.moveTo(o.x+nx*H,o.y+ny*H);c.quadraticCurveTo(o.x+ux*10,o.y+uy*10,o.x-nx*H,o.y-ny*H);c.stroke();
    c.fillStyle='#555b62';for(const sg of [1,-1]){c.beginPath();c.arc(o.x+nx*H*sg,o.y+ny*H*sg,1.3,0,6.28);c.fill();}c.fillStyle='#8b5a2b';c.fillRect(o.x-1.5,o.y-1.5,3,3);
    const nk={x:o.x-ux*pull,y:o.y-uy*pull};c.strokeStyle='rgba(235,235,235,.85)';c.lineWidth=0.25;c.beginPath();c.moveTo(o.x+nx*H,o.y+ny*H);c.lineTo(nk.x,nk.y);c.lineTo(o.x-nx*H,o.y-ny*H);c.stroke();
    drawArrowShape(c,'bow',nk.x+ux*ARDEF.bow.len,nk.y+uy*ARDEF.bow.len,ux,uy,999);
    c.fillStyle='rgba(233,196,106,.9)';c.font=`600 ${2.6/Math.max(0.5,VS/2)}px sans-serif`;c.fillText(Math.round(dr*100)+'%',o.x+nx*(H+4),o.y+ny*(H+4));}
  else{const ready=T>=(shootCrossbow.next||0);c.save();c.translate(o.x,o.y);c.rotate(ang);c.fillStyle='#4a3a28';c.fillRect(-30,-1.6,40,3.2);c.fillStyle='#22262a';c.fillRect(-12,1.4,4,6);c.strokeStyle='#2a2d31';c.lineWidth=1.4;c.beginPath();c.moveTo(6,-18);c.quadraticCurveTo(13,0,6,18);c.stroke();
    c.strokeStyle='rgba(235,235,235,.85)';c.lineWidth=0.25;c.beginPath();c.moveTo(6,-18);c.lineTo(ready?-10:5,0);c.lineTo(6,18);c.stroke();c.restore();if(ready)drawArrowShape(c,'crossbow',o.x+ux*30,o.y+uy*30,ux,uy,999);}}
const bgC=document.createElement('canvas'),bgX=bgC.getContext('2d');
let bgKey='';
// ---------- scenes: where he stands. Each scene paints its own walls, floor and background objects (not physical) ----------
const SCENES={lab:{name:'Modern lab',desc:'The clean test chamber',label:'BALLISTICS & TRAUMA'},er:{name:'Hospital trauma bay',desc:'ER room, monitors, oxygen, gurney',label:'TRAUMA BAY'},
  tent:{name:'Field hospital tent',desc:'Army medical tent, lantern light, dirt floor',label:'FIELD HOSPITAL'},medieval:{name:'Castle infirmary',desc:'Stone walls, torches, a wooden table',label:'CASTLE INFIRMARY'},
  battle:{name:'Battlefield',desc:'Ruins, smoke, sandbags and wire, mud',label:'BATTLEFIELD'}};
function hsh(i){const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);}
function drawScene(c,sc){
  const X=x=>VX+x*VS,Y=y=>VY+y*VS,L=Math.max(-50,VX-ROOM*VS),R=Math.min(W+50,VX+ROOM*VS),Tp=Math.max(-50,VY+TOP*VS),Rm=ROOM;
  const inR=(x,hw)=>x-hw>-Rm&&x+hw<Rm;
  c.fillStyle='#0b0d0f';c.fillRect(0,0,W,H);
  c.save();c.beginPath();c.rect(L,Tp,R-L,H-Tp);c.clip();
  if(sc==='er'){
    let g=c.createLinearGradient(0,Tp,0,VY);g.addColorStop(0,'#2e4446');g.addColorStop(1,'#3a5153');c.fillStyle=g;c.fillRect(L,Tp,R-L,VY-Tp);
    c.fillStyle='#41595b';c.fillRect(L,Y(-120),R-L,VY-Y(-120));
    c.strokeStyle='rgba(255,255,255,.06)';c.lineWidth=1;for(let y=-15;y>-120;y-=15){c.beginPath();c.moveTo(L,Y(y));c.lineTo(R,Y(y));c.stroke();}for(let x=-Math.floor(Rm/15)*15;x<Rm;x+=15){c.beginPath();c.moveTo(X(x),Y(-120));c.lineTo(X(x),VY);c.stroke();}
    c.fillStyle='#62797b';c.fillRect(L,Y(-98),R-L,4*VS);c.fillStyle='rgba(255,255,255,.18)';c.fillRect(L,Y(-98),R-L,0.8*VS);
    // medical gas panel: oxygen (green), air (yellow), suction (black)
    {const x=-Rm*0.5;if(inR(x,18)){c.fillStyle='rgba(205,214,214,.85)';c.fillRect(X(x-16),Y(-152),32*VS,20*VS);for(const [i,col] of [[0,'#2f9e5b'],[1,'#e2c044'],[2,'#222']]){c.fillStyle=col;c.beginPath();c.arc(X(x-9+i*9),Y(-142),2.4*VS,0,6.28);c.fill();}}}
    // vitals monitor on a wall arm
    {const x=-Rm*0.78;if(inR(x,20)){c.strokeStyle='#6f7b7c';c.lineWidth=2*VS;c.beginPath();c.moveTo(X(-Rm),Y(-178));c.lineTo(X(x),Y(-178));c.stroke();c.fillStyle='#1c2326';c.fillRect(X(x-18),Y(-196),36*VS,26*VS);c.fillStyle='#071012';c.fillRect(X(x-16),Y(-194),32*VS,22*VS);
      c.strokeStyle='#3ee07a';c.lineWidth=Math.max(1,0.5*VS);c.beginPath();for(let i=0;i<=30;i++){const xx=x-15+i,yy=-186+(i%10===4?-5:i%10===5?4:0);i?c.lineTo(X(xx),Y(yy)):c.moveTo(X(xx),Y(yy));}c.stroke();
      c.fillStyle='#3ee07a';c.font=`700 ${Math.max(6,5*VS)}px "IBM Plex Mono", monospace`;c.fillText('72',X(x+6),Y(-176));c.fillStyle='#5fc6f2';c.fillText('98',X(x-14),Y(-176));}}
    // IV pole with a saline bag
    {const x=Rm*0.42;if(inR(x,10)){c.strokeStyle='#9aa4a8';c.lineWidth=1.4*VS;c.beginPath();c.moveTo(X(x),VY);c.lineTo(X(x),Y(-195));c.moveTo(X(x-7),Y(-195));c.lineTo(X(x+7),Y(-195));c.stroke();
      c.fillStyle='rgba(225,240,245,.55)';c.fillRect(X(x+2),Y(-192),8*VS,14*VS);c.strokeStyle='rgba(220,235,240,.6)';c.lineWidth=0.5*VS;c.beginPath();c.moveTo(X(x+6),Y(-178));c.quadraticCurveTo(X(x+10),Y(-120),X(x+4),Y(-90));c.stroke();
      for(const dx of [-8,0,8]){c.fillStyle='#222';c.beginPath();c.arc(X(x+dx),Y(-2),2*VS,0,6.28);c.fill();}}}
    // ceiling surgical lamp
    if(TOP<-225){const x=-Rm*0.12,y0=Math.max(TOP,-260);c.strokeStyle='#8b9599';c.lineWidth=2*VS;c.beginPath();c.moveTo(X(x),Y(y0));c.lineTo(X(x),Y(-232));c.stroke();
      const lg=c.createRadialGradient(X(x),Y(-228),2,X(x),Y(-140),110*VS);lg.addColorStop(0,'rgba(255,252,235,.13)');lg.addColorStop(1,'rgba(255,252,235,0)');c.fillStyle=lg;c.beginPath();c.moveTo(X(x-12),Y(-228));c.lineTo(X(x-70),VY);c.lineTo(X(x+70),VY);c.lineTo(X(x+12),Y(-228));c.fill();
      c.fillStyle='#d6dcdf';c.beginPath();c.ellipse(X(x),Y(-229),17*VS,5*VS,0,Math.PI,0);c.fill();c.fillStyle='#fffbe8';c.fillRect(X(x-13),Y(-229),26*VS,1.4*VS);}
    // privacy curtain on a ceiling rail
    {const x0=Rm*0.62,x1=Rm-2;if(x1-x0>20){const top=Math.max(TOP+4,-240);c.fillStyle='#8a979a';c.fillRect(X(x0-4),Y(top),(x1-x0+4)*VS,1.5*VS);
      for(let x=x0;x<x1;x+=6){const k=((x-x0)/6)%2;c.fillStyle=k?'rgba(95,143,154,.78)':'rgba(80,124,134,.78)';c.fillRect(X(x),Y(top+2),6*VS,(-55-top)*VS);}}}
    g=c.createLinearGradient(0,VY,0,H);g.addColorStop(0,'#5b6366');g.addColorStop(1,'#25292b');c.fillStyle=g;c.fillRect(L,VY,R-L,H-VY);
    c.fillStyle='rgba(255,255,255,.12)';c.fillRect(L,VY,R-L,1.5);
  }else if(sc==='tent'){
    let g=c.createLinearGradient(0,Tp,0,VY);g.addColorStop(0,'#2f2e1d');g.addColorStop(0.4,'#45432b');g.addColorStop(1,'#4d4b30');c.fillStyle=g;c.fillRect(L,Tp,R-L,VY-Tp);
    for(let x=-Math.floor(Rm/70)*70;x<Rm;x+=70){const sx=X(x);const fg=c.createLinearGradient(sx,0,sx+70*VS,0);fg.addColorStop(0,'rgba(0,0,0,.22)');fg.addColorStop(0.15,'rgba(255,240,200,.05)');fg.addColorStop(0.6,'rgba(0,0,0,0)');fg.addColorStop(1,'rgba(0,0,0,.12)');c.fillStyle=fg;c.fillRect(sx,Tp,70*VS,VY-Tp);c.strokeStyle='rgba(20,18,10,.45)';c.lineWidth=Math.max(1,0.6*VS);c.beginPath();c.moveTo(sx,Tp);c.lineTo(sx,VY);c.stroke();}
    // canopy slopes and the ridge
    c.fillStyle='rgba(15,14,8,.35)';c.beginPath();c.moveTo(L,Tp);c.lineTo(X(0),Tp);c.lineTo(L,Y(-200));c.fill();c.beginPath();c.moveTo(R,Tp);c.lineTo(X(0),Tp);c.lineTo(R,Y(-200));c.fill();
    {const x=-Rm*0.45;if(inR(x,4)){c.fillStyle='#5a4128';c.fillRect(X(x-2.2),Tp,4.4*VS,VY-Tp);c.fillStyle='rgba(255,220,160,.12)';c.fillRect(X(x-2.2),Tp,1.2*VS,VY-Tp);}}
    // stencilled MEDIC on the canvas
    {const x=-Rm*0.75;if(inR(x,25)){c.fillStyle='rgba(235,230,210,.22)';c.font=`700 ${Math.max(8,11*VS)}px "Saira Condensed", sans-serif`;c.textAlign='center';c.fillText('MEDIC',X(x),Y(-150));c.textAlign='left';}}
    // ammunition crates in the corner
    {const x=Rm*0.72;if(inR(x,30)){for(const [dx,dy,w,h] of [[-26,0,30,22],[6,0,30,22],[-12,-22,30,22]]){c.fillStyle='#4f5530';c.fillRect(X(x+dx),Y(dy-h),w*VS,h*VS);c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=Math.max(1,0.5*VS);c.strokeRect(X(x+dx),Y(dy-h),w*VS,h*VS);c.fillStyle='rgba(230,225,190,.35)';c.fillRect(X(x+dx+4),Y(dy-h+8),12*VS,2*VS);}}}
    // hanging lantern and its warm light
    {const x=Rm*0.22;const lg=c.createRadialGradient(X(x),Y(-200),2,X(x),Y(-200),150*VS);lg.addColorStop(0,'rgba(255,190,90,.25)');lg.addColorStop(1,'rgba(255,190,90,0)');c.fillStyle=lg;c.fillRect(L,Tp,R-L,VY-Tp);
      c.strokeStyle='#2a241a';c.lineWidth=0.6*VS;c.beginPath();c.moveTo(X(x),Tp);c.lineTo(X(x),Y(-210));c.stroke();c.fillStyle='#2a241a';c.fillRect(X(x-4),Y(-210),8*VS,2*VS);c.fillStyle='rgba(255,210,120,.9)';c.fillRect(X(x-3),Y(-208),6*VS,9*VS);c.fillStyle='#2a241a';c.fillRect(X(x-4),Y(-199),8*VS,2*VS);}
    g=c.createLinearGradient(0,VY,0,H);g.addColorStop(0,'#4a3b27');g.addColorStop(1,'#1b150e');c.fillStyle=g;c.fillRect(L,VY,R-L,H-VY);
    c.fillStyle='rgba(20,14,8,.5)';for(let i=0;i<160;i++){const x=-Rm+hsh(i)*2*Rm,d=hsh(i+50)*40;c.fillRect(X(x),VY+d*VS*0.6+2,Math.max(1,0.8*VS),Math.max(1,0.5*VS));}
  }else if(sc==='medieval'){
    c.fillStyle='#211e1a';c.fillRect(L,Tp,R-L,VY-Tp);
    const bh=24,bw=46;for(let r=0;r*bh<-TOP+bh;r++){const y=-(r+1)*bh,off=(r%2)*bw/2;for(let x=-Math.ceil(Rm/bw)*bw-off;x<Rm;x+=bw){const t=hsh(r*91+Math.round(x));const v=58+t*22|0;c.fillStyle=`rgb(${v},${v-5|0},${v-12|0})`;c.fillRect(X(x+1),Y(y+1),(bw-2)*VS,(bh-2)*VS);c.fillStyle='rgba(255,240,220,.05)';c.fillRect(X(x+1),Y(y+1),(bw-2)*VS,1.2*VS);c.fillStyle='rgba(0,0,0,.18)';c.fillRect(X(x+1),Y(y+bh-3),(bw-2)*VS,2*VS);}}
    if(TOP<-235){c.fillStyle='#3d2a18';c.fillRect(L,Y(-246),R-L,9*VS);c.fillStyle='rgba(255,220,170,.08)';c.fillRect(L,Y(-246),R-L,1.4*VS);}
    // banner with a simple chevron (no real heraldry)
    {const x=-Rm*0.28;if(inR(x,14)){c.fillStyle='#6b1a1d';c.beginPath();c.moveTo(X(x-13),Y(-220));c.lineTo(X(x+13),Y(-220));c.lineTo(X(x+13),Y(-140));c.lineTo(X(x),Y(-148));c.lineTo(X(x-13),Y(-140));c.closePath();c.fill();c.strokeStyle='#c9a54a';c.lineWidth=2.4*VS;c.beginPath();c.moveTo(X(x-9),Y(-170));c.lineTo(X(x),Y(-185));c.lineTo(X(x+9),Y(-170));c.stroke();c.fillStyle='#4a3420';c.fillRect(X(x-16),Y(-223),32*VS,3*VS);}}
    // torches with flickerless glow (the backdrop is cached)
    for(const sg of [-1,1]){const x=sg*Rm*0.62;if(!inR(x,8))continue;const lg=c.createRadialGradient(X(x),Y(-160),2,X(x),Y(-160),95*VS);lg.addColorStop(0,'rgba(255,160,60,.32)');lg.addColorStop(1,'rgba(255,160,60,0)');c.fillStyle=lg;c.fillRect(L,Tp,R-L,VY-Tp);
      c.fillStyle='#2b2520';c.fillRect(X(x-3),Y(-146),6*VS,3*VS);c.fillStyle='#5a3a1e';c.save();c.translate(X(x),Y(-148));c.rotate(-0.15*sg);c.fillRect(-1.2*VS,-14*VS,2.4*VS,16*VS);c.restore();
      const fg=c.createRadialGradient(X(x),Y(-165),0,X(x),Y(-164),7*VS);fg.addColorStop(0,'#fff3b0');fg.addColorStop(0.5,'#ffa830');fg.addColorStop(1,'rgba(255,90,20,0)');c.fillStyle=fg;c.beginPath();c.ellipse(X(x),Y(-166),4.5*VS,8*VS,0,0,6.28);c.fill();}
    let g=c.createLinearGradient(0,VY,0,H);g.addColorStop(0,'#3d342a');g.addColorStop(1,'#16120e');c.fillStyle=g;c.fillRect(L,VY,R-L,H-VY);
    c.strokeStyle='rgba(205,175,90,.35)';c.lineWidth=Math.max(1,0.4*VS);for(let i=0;i<120;i++){const x=-Rm+hsh(i+7)*2*Rm,a=hsh(i+99)*3.14,l=6*VS;const sy=VY+2+hsh(i+3)*14*VS;c.beginPath();c.moveTo(X(x),sy);c.lineTo(X(x)+Math.cos(a)*l,sy+Math.sin(a)*l*0.25);c.stroke();}
  }else if(sc==='battle'){
    let g=c.createLinearGradient(0,Tp,0,VY);g.addColorStop(0,'#181c22');g.addColorStop(0.55,'#3a3533');g.addColorStop(0.85,'#6e4a33');g.addColorStop(1,'#8a5a38');c.fillStyle=g;c.fillRect(L,Tp,R-L,VY-Tp);
    // ruined skyline far away
    c.fillStyle='#15181b';let x=-Rm-40;let i=0;c.beginPath();c.moveTo(X(x),VY);while(x<Rm+40){const w=25+hsh(i)*45,h=35+hsh(i+20)*90;c.lineTo(X(x),Y(-h));c.lineTo(X(x+w*0.3),Y(-h-hsh(i+40)*14));c.lineTo(X(x+w*0.55),Y(-h+8));c.lineTo(X(x+w),Y(-h*(0.6+hsh(i+60)*0.4)));x+=w;i++;}c.lineTo(X(x),VY);c.closePath();c.fill();
    c.fillStyle='rgba(255,150,60,.5)';for(let k=0;k<26;k++){const xx=-Rm+hsh(k+300)*2*Rm,yy=-20-hsh(k+400)*60;c.fillRect(X(xx),Y(yy),Math.max(1,1.6*VS),Math.max(1,2*VS));}
    // smoke columns
    for(let k=0;k<4;k++){const xx=-Rm+hsh(k+500)*2*Rm;for(let j=0;j<6;j++){const yy=-60-j*30,r=(20+j*10)*VS;const sg=c.createRadialGradient(X(xx+j*6),Y(yy),0,X(xx+j*6),Y(yy),r);sg.addColorStop(0,'rgba(60,58,58,.35)');sg.addColorStop(1,'rgba(60,58,58,0)');c.fillStyle=sg;c.beginPath();c.arc(X(xx+j*6),Y(yy),r,0,6.28);c.fill();}}
    // sandbag wall
    {const x0=-Rm*0.78,x1=-Rm*0.4;if(x1>x0+20)for(let r=0;r<3;r++)for(let xx=x0+(r%2)*9;xx<x1;xx+=18){const yy=-8-r*14;c.fillStyle='#7a6b49';c.beginPath();c.ellipse(X(xx+9),Y(yy),9.5*VS,7*VS,0,0,6.28);c.fill();c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(X(xx+9),Y(yy+3),9*VS,3.5*VS,0,0,6.28);c.fill();c.fillStyle='rgba(255,240,200,.1)';c.beginPath();c.ellipse(X(xx+7),Y(yy-3),5*VS,2*VS,0,0,6.28);c.fill();}}
    // barbed wire coil on pickets
    {const x0=Rm*0.38,x1=Rm*0.86;if(x1>x0+20){c.strokeStyle='rgba(40,40,42,.9)';c.lineWidth=Math.max(1,0.5*VS);for(let xx=x0;xx<x1;xx+=7){c.beginPath();c.ellipse(X(xx),Y(-22),5*VS,20*VS,0.25,0,6.28);c.stroke();}for(const xx of [x0,(x0+x1)/2,x1]){c.lineWidth=Math.max(1,1.2*VS);c.beginPath();c.moveTo(X(xx),VY);c.lineTo(X(xx),Y(-48));c.stroke();}}}
    g=c.createLinearGradient(0,VY,0,H);g.addColorStop(0,'#3d3324');g.addColorStop(1,'#14100a');c.fillStyle=g;c.fillRect(L,VY,R-L,H-VY);
    c.fillStyle='rgba(15,11,6,.55)';for(let k=0;k<8;k++){const xx=-Rm+hsh(k+700)*2*Rm;c.beginPath();c.ellipse(X(xx),VY+(4+hsh(k+800)*12)*VS,(12+hsh(k)*18)*VS,2.5*VS,0,0,6.28);c.fill();}
    c.fillStyle='rgba(120,140,150,.18)';for(let k=0;k<5;k++){const xx=-Rm+hsh(k+900)*2*Rm;c.beginPath();c.ellipse(X(xx),VY+(3+hsh(k+950)*8)*VS,(10+hsh(k+1)*10)*VS,1.4*VS,0,0,6.28);c.fill();}
  }
  // atmosphere (redesign): the battlefield's low sun behind him, and every scene falls off into shadow at the edges
  if(sc==='battle'){const sx=X(Rm*0.45),sy=Y(-25),sg=c.createRadialGradient(sx,sy,0,sx,sy,Math.max(160,170*VS));sg.addColorStop(0,'rgba(255,213,154,.55)');sg.addColorStop(0.25,'rgba(255,170,95,.25)');sg.addColorStop(1,'rgba(255,138,60,0)');c.fillStyle=sg;c.fillRect(L,Tp,R-L,VY-Tp);
    const hz=c.createLinearGradient(0,VY-40*VS,0,VY+20*VS);hz.addColorStop(0,'rgba(208,122,58,0)');hz.addColorStop(0.7,'rgba(208,122,58,.3)');hz.addColorStop(1,'rgba(208,122,58,0)');c.fillStyle=hz;c.fillRect(L,VY-40*VS,R-L,60*VS);}
  {c.fillStyle='rgba(4,6,8,.16)';c.fillRect(L,Tp,R-L,H-Tp);const rr=Math.hypot(W,H)*0.5,vg=c.createRadialGradient(X(0),Y(-100),Math.min(W,H)*0.22,X(0),Y(-100),rr);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,`rgba(0,0,0,${sc==='battle'?0.75:0.62})`);c.fillStyle=vg;c.fillRect(L,Tp,R-L,H-Tp);}
  c.restore();
  // height ruler and the scene's name
  const rx=VX+(-ROOM+3)*VS;
  if(rx>-40&&rx<W){c.strokeStyle='rgba(233,196,106,.35)';c.fillStyle='rgba(231,236,239,.35)';c.font='500 10px "IBM Plex Mono", monospace';c.lineWidth=1;
    for(let cm=0;cm<=200;cm+=10){const sy=VY-cm*VS;if(sy<Tp)break;const l=cm%50===0?12:6;c.beginPath();c.moveTo(rx,sy);c.lineTo(rx+l,sy);c.stroke();if(cm%50===0&&cm>0&&VS>0.6)c.fillText(cm+' cm',rx+15,sy+3.5);}}
  c.fillStyle='rgba(231,236,239,.16)';c.font='700 13px "Saira Condensed", sans-serif';c.textAlign='right';c.fillText(view!=='side'?(view==='back'?'POSTERIOR VIEW':'ANTERIOR VIEW'):SCENES[sc].label,Math.min(R,W)-8,Math.max(Tp+18,VY-205*VS));c.textAlign='left';
}
function drawStretcher(c){c.fillStyle='#4d5a32';c.fillRect(-92,-21,184,3.6);c.fillStyle='rgba(0,0,0,.25)';c.fillRect(-92,-18.2,184,0.8);
  for(const sg of [-1,1]){c.fillStyle='#6b5634';c.fillRect(-104,-19.2+sg*0.2,208,1.6);}c.fillStyle='#3d3a30';for(const sx of [-86,86]){c.fillRect(sx-1.4,-17,2.8,16);c.fillRect(sx-4,-1.6,8,1.6);}
  c.fillStyle='rgba(235,230,210,.3)';c.fillRect(-10,-20.6,20,2);}
function drawSlab(c){for(const sx of [-84,84]){c.fillStyle=woodGrad(c,sx-2.2,0,sx+2.2,0);c.fillRect(sx-2.2,-75,4.4,75);c.fillStyle='rgba(0,0,0,.25)';c.fillRect(sx+1,-75,1.2,75);}
  c.fillStyle='#5e3b20';c.fillRect(-80,-74,160,3);c.fillStyle=woodGrad(c,0,-81,0,-75);c.fillRect(-98,-80.6,196,5.4);c.fillStyle='rgba(255,230,190,.16)';c.fillRect(-98,-80.6,196,0.8);
  c.strokeStyle='rgba(60,35,18,.35)';c.lineWidth=0.18;for(let i=0;i<4;i++){c.beginPath();c.moveTo(-97,-79.6+i*1.2);c.bezierCurveTo(-30,-80+i*1.2,30,-78.8+i*1.2,97,-79.4+i*1.2);c.stroke();}}
// hospital stretcher (gurney): steel frame, mattress at ≈86 cm, four castors
function drawGurney(c){
  const steel=(y0,y1)=>{const g=c.createLinearGradient(0,y0,0,y1);g.addColorStop(0,'#e6eaed');g.addColorStop(0.5,'#9aa3aa');g.addColorStop(1,'#646c73');return g;};
  for(const sx of [-78,78]){c.fillStyle=steel(-80,-8);c.fillRect(sx-1.6,-81,3.2,73);c.fillStyle='#2a2d30';c.beginPath();c.arc(sx,-3.2,3.2,0,6.28);c.fill();c.fillStyle='#8a9096';c.beginPath();c.arc(sx,-3.2,1.1,0,6.28);c.fill();c.fillStyle='#5a6066';c.fillRect(sx-2.4,-8,4.8,2);}
  c.fillStyle=steel(-40,-36);c.fillRect(-78,-40,156,2.6);
  c.fillStyle=steel(-84,-80);c.fillRect(-94,-84,188,4);
  c.fillStyle='#5f7d8c';c.beginPath();c.roundRect?c.roundRect(-93,-91,186,7.4,3):c.rect(-93,-91,186,7.4);c.fill();c.fillStyle='rgba(255,255,255,.2)';c.fillRect(-91,-90.6,182,1.2);
  c.fillStyle='#eef1f2';c.beginPath();c.ellipse(-78,-92.3,13,3.2,0,0,6.28);c.fill();
  c.strokeStyle='#b8c0c6';c.lineWidth=1.1;c.beginPath();c.moveTo(-70,-84);c.lineTo(-70,-97);c.lineTo(40,-97);c.lineTo(40,-84);c.stroke();}
function drawBackdrop(){
  const key=[Math.round(VX*2),Math.round(VY*2),VS.toFixed(3),W,H,DPR,MAP,view,ROOM,TOP,OPT.scene].join('|');
  if(key!==bgKey||bgC.width!==cv.width||bgC.height!==cv.height){if(bgC.width!==cv.width||bgC.height!==cv.height){bgC.width=cv.width;bgC.height=cv.height;}bgKey=key;drawBackdropTo(bgX);}
  ctx.setTransform(1,0,0,1,0,0);if(bgC.width&&bgC.height)ctx.drawImage(bgC,0,0);
}
function drawBackdropTo(c){
  c.setTransform(DPR,0,0,DPR,0,0);
  if(OPT.scene&&OPT.scene!=='lab'&&SCENES[OPT.scene]){drawScene(c,OPT.scene);return;}
  const th=(MAPS[MAP]&&MAPS[MAP].theme)||'lab';
  c.fillStyle=th==='field'?'#0e1418':'#0d1013';c.fillRect(0,0,W,H);
  const L=Math.max(-50,VX-ROOM*VS),R=Math.min(W+50,VX+ROOM*VS),Tp=Math.max(-50,VY+TOP*VS);
  const g=c.createLinearGradient(0,Tp,0,VY);
  if(th==='field'){g.addColorStop(0,'#1d2c3c');g.addColorStop(0.7,'#3d5466');g.addColorStop(1,'#5b6f73');}
  else if(th==='wh'){g.addColorStop(0,'#1f2224');g.addColorStop(1,'#33363a');}
  else{g.addColorStop(0,'#232a30');g.addColorStop(1,'#2d353c');}
  c.fillStyle=g;c.fillRect(L,Tp,R-L,VY-Tp);
  const step=ROOM>700?250:ROOM>300?120:60;
  if(th==='field'){c.fillStyle='rgba(30,40,35,.7)';for(let x=-ROOM;x<ROOM;x+=180){const sx=VX+x*VS;if(sx<L-200||sx>R+200)continue;const hgt=(80+((x*7919)%120+120)%120)*VS;c.beginPath();c.moveTo(sx,VY);c.quadraticCurveTo(sx+90*VS,VY-hgt,sx+180*VS,VY);c.fill();}}
  else if(th==='lab')labWall(c,L,R,Tp);
  else{c.strokeStyle='rgba(255,255,255,.035)';c.lineWidth=1;
    for(let x=-Math.floor(ROOM/step)*step;x<=ROOM;x+=step){const sx=VX+x*VS;if(sx<L||sx>R)continue;c.beginPath();c.moveTo(sx,Tp);c.lineTo(sx,VY);c.stroke();}
    for(let y=-step;y>TOP;y-=step){const sy=VY+y*VS;c.beginPath();c.moveTo(L,sy);c.lineTo(R,sy);c.stroke();}
    if(th==='wh'){c.fillStyle='rgba(10,12,14,.55)';for(let x=-ROOM+200;x<ROOM-100;x+=400){const sx=VX+x*VS;if(sx<L-40||sx>R+40)continue;c.fillRect(sx,Tp,30*VS,VY-Tp);}}}
  const rx=VX+(-ROOM+3)*VS;
  if(rx>-40&&rx<W){c.strokeStyle='rgba(233,196,106,.45)';c.fillStyle='rgba(231,236,239,.42)';c.font='500 10px "IBM Plex Mono", monospace';
    for(let cm=0;cm<=200;cm+=10){const sy=VY-cm*VS;if(sy<Tp)break;const l=cm%50===0?12:6;c.beginPath();c.moveTo(rx,sy);c.lineTo(rx+l,sy);c.stroke();if(cm%50===0&&cm>0&&VS>0.6)c.fillText(cm+' cm',rx+15,sy+3.5);}
    c.beginPath();c.moveTo(rx,VY);c.lineTo(rx,Math.max(Tp,VY-200*VS));c.stroke();}
  c.fillStyle='rgba(231,236,239,.13)';c.font='700 13px "Saira Condensed", sans-serif';c.textAlign='right';c.fillText(view!=='side'?(view==='back'?'POSTERIOR VIEW':'ANTERIOR VIEW'):(MAPS[MAP].name.toUpperCase()+(MAPS[MAP].w?' · '+MAPS[MAP].w/100+' M':'')+' · BALLISTICS & TRAUMA'),Math.min(R,W)-8,Math.max(Tp+18,VY-205*VS));c.textAlign='left';
  const fg=c.createLinearGradient(0,VY,0,H);
  if(th==='field'){fg.addColorStop(0,'#2c3a22');fg.addColorStop(1,'#141a10');}else if(th==='wh'){fg.addColorStop(0,'#3a3836');fg.addColorStop(1,'#171615');}else{fg.addColorStop(0,'#2a2522');fg.addColorStop(1,'#151311');}
  c.fillStyle=fg;c.fillRect(L,VY,R-L,Math.max(0,H-VY));
  c.fillStyle=th==='field'?'rgba(140,170,90,.25)':'rgba(255,240,220,.10)';c.fillRect(L,VY,R-L,1.5);
  if(th==='wh'){c.fillStyle='rgba(230,180,40,.35)';for(let x=-ROOM;x<ROOM;x+=40){const sx=VX+x*VS;if(sx<L||sx>R)continue;c.fillRect(sx,VY+2,20*VS,Math.max(1,2*VS));}}
  if(th==='lab')labFloor(c,L,R);
}
// ---- the test chamber: glazed wall tiles (30 cm, real lab size) up to 2.1 m, painted wall above, a steel kick plate
// with hazard stripes, a sealed concrete floor with a drain, a ceiling camera, and one surgical light over the subject.
// Static, so it is drawn once into the cached backdrop
function labWall(c,L,R,Tp){const X=x=>VX+x*VS,Y=y=>VY+y*VS,Rm=ROOM;
  const wg=c.createLinearGradient(0,Tp,0,VY);wg.addColorStop(0,'#0f1418');wg.addColorStop(1,'#1a2227');c.fillStyle=wg;c.fillRect(L,Tp,R-L,VY-Tp);
  const tTop=Math.max(TOP,-210),T=30;
  c.fillStyle='#1b2329';c.fillRect(L,Y(tTop),R-L,(-tTop)*VS);
  // tiles: each a slightly different glaze, a lit top edge and a shadowed bottom edge, dark grout between
  for(let y=0;y>tTop;y-=T)for(let x=-Math.ceil(Rm/T)*T;x<Rm;x+=T){const sx=X(x),sy=Y(y-T);if(sx>R||sx+T*VS<L)continue;const v=hsh(x*3.1+y*7.7);
    c.fillStyle=`rgb(${30+v*7|0},${39+v*7|0},${45+v*8|0})`;c.fillRect(sx+0.6*VS,sy+0.6*VS,(T-1.2)*VS,(T-1.2)*VS);
    c.fillStyle='rgba(220,235,245,.035)';c.fillRect(sx+0.6*VS,sy+0.6*VS,(T-1.2)*VS,Math.max(1,0.8*VS));c.fillStyle='rgba(0,0,0,.18)';c.fillRect(sx+0.6*VS,sy+(T-1.6)*VS,(T-1.2)*VS,Math.max(1,VS));}
  c.fillStyle='#2a343a';c.fillRect(L,Y(tTop)-2*VS,R-L,2*VS);c.fillStyle='rgba(255,255,255,.06)';c.fillRect(L,Y(tTop)-2*VS,R-L,Math.max(1,0.5*VS));
  // painted wall stripe at 1.1 m and a stencilled chamber number
  c.fillStyle='rgba(233,196,106,.05)';c.fillRect(L,Y(-112),R-L,6*VS);
  if(VS>0.5&&Rm>90){c.fillStyle='rgba(231,236,239,.028)';c.font=`700 ${Math.round(26*VS)}px "Saira Condensed", sans-serif`;c.textAlign='left';c.fillText('CHAMBER 01',X(-Rm+16),Y(-140));}
  // ceiling camera in the corner, red LED (it is filming)
  if(TOP<-170){const x=Rm-26,y=Math.max(TOP+14,-250);c.fillStyle='#2a3238';c.fillRect(X(x+8),Y(y-4),10*VS,3*VS);c.save();c.translate(X(x+8),Y(y));c.rotate(0.35);
    c.fillStyle='#39434a';c.fillRect(-16*VS,-4*VS,18*VS,8*VS);c.fillStyle='#11161a';c.beginPath();c.arc(-16*VS,0,3.2*VS,0,6.28);c.fill();c.fillStyle='#ff3b3b';c.beginPath();c.arc(-2*VS,-2*VS,1.1*VS,0,6.28);c.fill();
    c.fillStyle='rgba(255,59,59,.25)';c.beginPath();c.arc(-2*VS,-2*VS,3*VS,0,6.28);c.fill();c.restore();}
  // the surgical light over the subject: a 60 cm dome and its cone onto the floor (≈100 000 lux at the table, so the
  // walls around fall off into shadow)
  const lx=0,ly=Math.max(TOP+6,-236);
  const cone=c.createLinearGradient(0,Y(ly),0,VY);cone.addColorStop(0,'rgba(244,251,255,.16)');cone.addColorStop(1,'rgba(244,251,255,.05)');
  c.fillStyle=cone;c.beginPath();c.moveTo(X(lx-24),Y(ly+4));c.lineTo(X(lx-95),VY);c.lineTo(X(lx+95),VY);c.lineTo(X(lx+24),Y(ly+4));c.closePath();c.fill();
  const pool=c.createRadialGradient(X(lx),Y(-90),5,X(lx),Y(-90),150*VS);pool.addColorStop(0,'rgba(244,251,255,.07)');pool.addColorStop(1,'rgba(244,251,255,0)');c.fillStyle=pool;c.fillRect(L,Tp,R-L,VY-Tp);
  c.strokeStyle='#3a444b';c.lineWidth=Math.max(1,2*VS);c.beginPath();c.moveTo(X(lx),Tp);c.lineTo(X(lx),Y(ly-6));c.stroke();
  c.fillStyle='#4a555d';c.beginPath();c.ellipse(X(lx),Y(ly+2),26*VS,8*VS,0,Math.PI,0);c.fill();c.fillStyle='#f4fbff';c.fillRect(X(lx-21),Y(ly+1),42*VS,Math.max(1,1.6*VS));
  const glow=c.createRadialGradient(X(lx),Y(ly+3),0,X(lx),Y(ly+3),40*VS);glow.addColorStop(0,'rgba(244,251,255,.35)');glow.addColorStop(1,'rgba(244,251,255,0)');c.fillStyle=glow;c.fillRect(X(lx-40),Y(ly-37),80*VS,80*VS);
  // the edges of the room fall into shadow
  const vg=c.createRadialGradient(X(0),Y(-100),60*VS,X(0),Y(-100),Math.max(R-L,VY-Tp)*0.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.45)');c.fillStyle=vg;c.fillRect(L,Tp,R-L,VY-Tp);
  // steel kick plate with hazard stripes, 12 cm
  c.fillStyle='#14181b';c.fillRect(L,Y(-12),R-L,12*VS);c.save();c.beginPath();c.rect(L,Y(-11),R-L,8*VS);c.clip();c.fillStyle='rgba(201,160,62,.55)';
  for(let x=-Rm-20;x<Rm+20;x+=12){c.beginPath();c.moveTo(X(x),Y(-3));c.lineTo(X(x+6),Y(-3));c.lineTo(X(x+14),Y(-11));c.lineTo(X(x+8),Y(-11));c.closePath();c.fill();}c.restore();
  c.fillStyle='rgba(255,255,255,.08)';c.fillRect(L,Y(-12),R-L,Math.max(1,0.5*VS));}
function labFloor(c,L,R){const X=x=>VX+x*VS,Rm=ROOM,D=Math.max(0,H-VY);if(D<2)return;
  const fg=c.createLinearGradient(0,VY,0,H);fg.addColorStop(0,'#1f272c');fg.addColorStop(1,'#0b0e10');c.fillStyle=fg;c.fillRect(L,VY,R-L,D);
  // floor seams receding toward the viewer (the floor is seen from slightly above)
  c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1;for(let x=-Math.ceil(Rm/60)*60;x<=Rm;x+=60){c.beginPath();c.moveTo(X(x),VY);c.lineTo(X(x*1.9),VY+D);c.stroke();}
  for(const f of [0.12,0.3,0.58]){const y=VY+D*f;c.beginPath();c.moveTo(L,y);c.lineTo(R,y);c.stroke();}
  // the light's pool on the floor
  const pg=c.createRadialGradient(X(0),VY+6*VS,0,X(0),VY+6*VS,110*VS);pg.addColorStop(0,'rgba(244,251,255,.10)');pg.addColorStop(1,'rgba(244,251,255,0)');c.fillStyle=pg;c.save();c.scale(1,0.3);c.fillRect(L,(VY-40*VS)/0.3,R-L,140*VS/0.3);c.restore();
  // drain: a 15 cm grate (the room is hosed down)
  if(view==='side'){const dx=48,dy=VY+Math.min(D*0.25,6*VS);c.fillStyle='#07090a';c.beginPath();c.ellipse(X(dx),dy,9*VS,1.8*VS,0,0,6.28);c.fill();c.strokeStyle='rgba(140,150,155,.35)';c.lineWidth=Math.max(1,0.4*VS);for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(X(dx+i*2.4),dy-1.4*VS);c.lineTo(X(dx+i*2.4),dy+1.4*VS);c.stroke();}}
  c.fillStyle='rgba(255,255,255,.07)';c.fillRect(L,VY,R-L,1.2);
  const vg=c.createLinearGradient(L,0,R,0);vg.addColorStop(0,'rgba(0,0,0,.4)');vg.addColorStop(0.25,'rgba(0,0,0,0)');vg.addColorStop(0.75,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.4)');c.fillStyle=vg;c.fillRect(L,VY,R-L,D);}
// ---- light on the body (side view). The room has one overhead surgical light and cool fill bouncing off the tiles:
// the top of the body catches the warm key light, the legs fall off into shade, and the back edge (away from where he
// faces) picks up a thin cool rim, so he reads as a solid body in a room instead of flat paper

// each place lights him differently (from the redesign boards): key colour and strength on top, shade at the feet,
// rim colour and strength on his back edge, and overall darkness
const SCENEL={lab:{k:'255,232,206',ka:.13,sa:.26,r:'165,215,245',ra:.13,d:0},er:{k:'244,255,249',ka:.15,sa:.22,r:'191,243,234',ra:.17,d:0},
  tent:{k:'255,214,160',ka:.17,sa:.3,r:'255,194,122',ra:.18,d:.07},medieval:{k:'255,205,140',ka:.17,sa:.34,r:'169,200,255',ra:.2,d:.12},battle:{k:'159,176,200',ka:.08,sa:.38,r:'255,170,95',ra:.38,d:.24}};
function sceneL(){return SCENEL[(OPT.scene&&SCENES[OPT.scene])?OPT.scene:'lab']||SCENEL.lab;}
function skinLight(R_,wy0,wy1){const [x0,y0,x1,y1]=R_,w=x1-x0,h=y1-y0,c=sctx;
  c.save();c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-atop';
  // key from above: warm on the head and shoulders, ≈25 % darker at the feet (the light is 2.3 m up; the inverse square
  // of 0.7 m vs 2.2 m would be far stronger, but the walls fill in)
  const top=(VY+wy0*VS)*DPR,bot=(VY+Math.min(0,wy1)*VS)*DPR;const g=c.createLinearGradient(0,top,0,Math.max(top+1,bot));
  const SL=sceneL();g.addColorStop(0,`rgba(${SL.k},${SL.ka})`);g.addColorStop(0.35,`rgba(${SL.k},0)`);g.addColorStop(0.7,`rgba(30,14,10,${SL.sa*0.46})`);g.addColorStop(1,`rgba(20,10,8,${SL.sa})`);c.fillStyle=g;c.fillRect(x0,y0,w,h);
  if(SL.d>0){c.fillStyle=`rgba(5,6,10,${SL.d})`;c.fillRect(x0,y0,w,h);}
  c.restore();
  // (the thin cool rim along his back was dropped in v1.17: four full-body image passes per frame were too slow on phones)
}
// shadow on the floor under the overhead light: a wide soft penumbra under the body and a small dark core where the
// feet (or whatever lies on the floor) touch it. Fainter the higher he is off the floor
// one soft round shadow, drawn once and stretched for every blob
const SHADOWSPR=(function(){const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(0.5,'rgba(0,0,0,.55)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return cv;})();
function contactShadow(cx,hy){const c=ctx;const air=Math.max(0,Math.min(...[SEG.nearFoot,SEG.farFoot].map(f=>f&&f.connected?-Math.max(P[f.a].y,P[f.b].y):99)));
  const k=clamp(1-air/80,0.15,1);let x0=1e9,x1=-1e9;for(const g of segs){if(g.gone||!g.connected)continue;for(const q of [P[g.a],P[g.b]])if(q.y>-60){x0=Math.min(x0,q.x);x1=Math.max(x1,q.x);}}
  if(x0>x1){x0=cx-10;x1=cx+10;}const mx=(x0+x1)/2,hw=Math.max(18,(x1-x0)/2+14);
  const blob=(x,rw,rh,a)=>{if(a<0.02)return;c.globalAlpha=a;c.drawImage(SHADOWSPR,x-rw,1.2-rh,2*rw,2*rh);c.globalAlpha=1;};
  blob(mx,hw+16,3.6,0.42*k);
  for(const g of segs){if(g.gone||!g.connected||!(g.kind==='foot'||g.kind==='shin'||g.kind==='hand'||g.kind==='head'||g.kind==='chest'||g.kind==='abd'||g.kind==='thigh'))continue;
    for(const q of [P[g.a],P[g.b]]){const h=-q.y-(q.r||3);if(h<14)blob(q.x,(g.kind==='foot'?14:10),1.6,0.5*(1-h/14));}}}
// X-ray on: the room drops to ≈20 % brightness, like a viewing box in a dark reading room, with a faint blue-white
// film glow behind the body, so the organs and the bullet's path stand out
function xrayRoom(){const c=ctx;c.setTransform(1,0,0,1,0,0);c.fillStyle='rgba(3,6,9,.8)';c.fillRect(0,0,c.canvas.width,c.canvas.height);
  setWorld(c);let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const g of segs){if(g.gone)continue;for(const q of [P[g.a],P[g.b]]){x0=Math.min(x0,q.x);x1=Math.max(x1,q.x);y0=Math.min(y0,q.y);y1=Math.max(y1,q.y);}}
  if(x0>x1)return;const cx=(x0+x1)/2,cy=(y0+y1)/2,r=Math.max(60,Math.hypot(x1-x0,y1-y0)*0.7);const g=c.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,'rgba(90,160,210,.16)');g.addColorStop(1,'rgba(90,160,210,0)');c.fillStyle=g;c.fillRect(cx-r,cy-r,2*r,2*r);}
function render(dt){
  if(OPT.gore===0){BLOOD.length=0;MIST.length=0;POOLS.length=0;DECALS.length=0;WALLST.length=0;for(const k in STREAMS)delete STREAMS[k];for(const g of segs)if(g.spat&&g.spat.length)g.spat.length=0;}
  if(!OPT.shake)shake=0;shake*=Math.pow(0.02,dt);const sx=shake>0.01?rnd(-1,1)*shake*8:0,sy=shake>0.01?rnd(-1,1)*shake*8:0;
  const cam=CAM[view];VS=S*cam.z;VX=OX+cam.px+sx;VY=OY+cam.py+sy;
  if(Math.abs(VS-ZLAST)>1e-4){ZOOMT=performance.now();ZLAST=VS;}
  drawBackdrop();if(xray)xrayRoom();
  if(view!=='side'){
    drawSerumGlow(true);drawFront();drawChemFront();drawArrows();
    setWorld(ctx);if(view==='front')for(const e of FEYE)drawEyeball(ctx,e.x,e.y,e.ang,0.85,e.t<0.6&&SEG.head.connected?[e.sx,e.sy]:null,e.vx,e.vy);if(trajOn)drawTrajFront();drawLodged(ctx,true);if(xray)drawXrayMarks(true);drawFlames(true);
    drawFX(dt);drawPow(dt);drawOverlays();drawTrip();return;
  }
  setWorld(ctx);
  for(const s of WALLST){ctx.fillStyle=s.c;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,6.28);ctx.fill();}
  if(STORY.on)drawStoryBack(ctx);
  forBodies(()=>{const cx=(P[SEG.chest.a].x+P[SEG.abd.b].x)/2;let hy=0;for(const p of P)if(!p.gone&&p.y<hy)hy=p.y;
    contactShadow(cx,hy);});
  for(const p of POOLS){const hh=Math.min(3.2,p.w*0.16+0.4);ctx.fillStyle=`rgba(110,10,16,${(0.55*p.a).toFixed(2)})`;ctx.beginPath();ctx.ellipse(p.x,1.2,p.w,hh,0,0,6.28);ctx.fill();ctx.fillStyle=`rgba(80,5,10,${(0.8*p.a).toFixed(2)})`;ctx.beginPath();ctx.ellipse(p.x,1.2,p.w*0.8,hh*0.8,0,0,6.28);ctx.fill();}
  {const pa=new Path2D(),pb=new Path2D();DECALS.forEach((d,i)=>{const p=i%2?pa:pb;const x=d.x+d.sk*d.w*0.5,hh=Math.max(0.25,d.w*0.16);p.moveTo(x+d.w,0.7);p.ellipse(x,0.7,d.w,hh,0,0,6.28);if(d.dots){const dx=d.x+d.dots[0];p.moveTo(dx+d.dots[1],0.6);p.ellipse(dx,0.6,d.dots[1],d.dots[1]*0.3,0,0,6.28);}});ctx.fillStyle='rgba(96,10,16,.8)';ctx.fill(pa);ctx.fillStyle='rgba(112,16,22,.72)';ctx.fill(pb);}
  for(const o of OBJ)if(o.type==='mine')drawObj(o);
  drawCore();drawSource();drawSerumGlow(false);drawMeleeStuck();
  // everyone else first (sim/bodies), so the subject is drawn in front
  if(BODIES.length){const pr=render.skinR;if(pr){sctx.setTransform(1,0,0,1,0,0);sctx.clearRect(pr[0],pr[1],pr[2]-pr[0],pr[3]-pr[1]);render.skinR=[0,0,0,0];}
    for(const b of BODIES)withBody(b,drawBodySide);}
  drawBodySide();
  setWorld(ctx);
  for(const o of OBJ)if(o.type!=='mine')drawObj(o);
  drawProps();drawDrops();
  drawKnivesSide();forBodies(()=>{drawLodged(ctx,false);drawGuts();drawStrands();});
  drawGibs();drawMist();
  if(xray)drawXrayMarks(false);
  drawCases(ctx);drawStreams();drawBullets();drawArrows();drawBowAim();drawFlames(false);if(trajOn)drawTrajSide();
  {ctx.lineCap='round';ctx.strokeStyle='#860c14';ctx.lineWidth=0.7;const bp=new Path2D();for(const b of BLOOD){const sp=Math.hypot(b.vx,b.vy)||1,l=Math.min(2.2,sp*0.006)+0.1;bp.moveTo(b.x,b.y);bp.lineTo(b.x-b.vx/sp*l,b.y-b.vy/sp*l);}ctx.stroke(bp);}
  if(STORY.on)drawStoryFront(ctx);
  drawFX(dt);drawPow(dt);drawOverlays();drawTrip();drawBeakerLabels();
}
// the loaded body, side view: inside (x-ray, open wounds), then the skin through the skin layer, then open fractures.
// Another person's skin layer is cleared as soon as it is drawn, so it never shows up a second time under the subject's
function drawBodySide(){
  for(const s of ORDER)if(s.growF==null&&!s.gone&&s.dust==null)drawInterior(s);
  if(!(xray&&!XL('skin'))){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const g of segs){if(g.gone)continue;const m=Math.max(g.ra,g.rb)+(g.kind==='head'?14:7);for(const p of [P[g.a],P[g.b]]){x0=Math.min(x0,p.x-m);x1=Math.max(x1,p.x+m);y0=Math.min(y0,p.y-m);y1=Math.max(y1,p.y+m);}}
   const k=VS*DPR,rx0=Math.max(0,Math.floor((VX+x0*VS)*DPR)),ry0=Math.max(0,Math.floor((VY+y0*VS)*DPR)),rx1=Math.min(skinC.width,Math.ceil((VX+x1*VS)*DPR)),ry1=Math.min(skinC.height,Math.ceil((VY+y1*VS)*DPR));
   const pr=BID?[0,0,0,0]:render.skinR||[0,0,skinC.width,skinC.height];sctx.setTransform(1,0,0,1,0,0);sctx.clearRect(pr[0],pr[1],pr[2]-pr[0],pr[3]-pr[1]);
   const R_=[rx0,ry0,Math.max(rx0+1,rx1),Math.max(ry0+1,ry1)];if(!BID)render.skinR=R_;
   WEARK=Object.keys(WEAR).map(q=>WEAR[q].on?q+(WEAR[q].hp!=null?Math.round(WEAR[q].hp/10):''):'').join(',');
   for(const s of ORDER)drawSkinG(s);
   // the drawn skin carries its own light (baked per part); this whole-layer pass is only for the plain body
   if(OPT.quality!=='low'&&(FEMALE||!SKINBMP.side)&&R_[2]>R_[0]+2&&R_[3]>R_[1]+2)skinLight(R_,y0,y1);
   ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=xray?(XL('skin')?0.2:0.05):trajOn&&TRAJ.length?0.45:1;
   if(R_[2]>R_[0]&&R_[3]>R_[1])ctx.drawImage(skinC,R_[0],R_[1],R_[2]-R_[0],R_[3]-R_[1],R_[0],R_[1],R_[2]-R_[0],R_[3]-R_[1]);ctx.globalAlpha=1;
   if(BID){sctx.setTransform(1,0,0,1,0,0);sctx.clearRect(R_[0],R_[1],R_[2]-R_[0],R_[3]-R_[1]);}}
  if(joints.some(j=>j.key==='frac'&&j.fi)){for(const sg of segs)if(LIMBK.includes(sg.kind)&&sg.connected&&!sg.gone){setLocal(ctx,sg);drawOpenFrac(ctx,sg);}}
}
function drawObj(o){
  ctx.save();ctx.translate(o.x,o.y);ctx.rotate(o.ang);
  if(o.type==='anvil'){ctx.fillStyle='#2c3138';ctx.beginPath();ctx.moveTo(-14,-9);ctx.lineTo(8,-9);ctx.quadraticCurveTo(10,-4,19,-4.5);ctx.quadraticCurveTo(13,-1,7,0);ctx.lineTo(5,0);ctx.lineTo(5,4);ctx.lineTo(9,10);ctx.lineTo(-11,10);ctx.lineTo(-7,4);ctx.lineTo(-7,0);ctx.quadraticCurveTo(-13,-2,-14,-9);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(-14,-9,22,1.4);ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(-11,8,20,2);ctx.fillStyle='#1b1f24';ctx.fillRect(-4,-8,2.2,2.2);ctx.fillStyle='rgba(255,210,120,.55)';ctx.font='bold 3px sans-serif';ctx.textAlign='center';ctx.fillText('100 KG',-1,7.5);}
  else if(o.type==='brick'){ctx.fillStyle='#8f4632';ctx.fillRect(-6.5,-4,13,8);ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(-6.5,1.5,13,2.5);ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(-6.5,-4,13,1.2);}
  else if(o.type==='ball'){ctx.fillStyle='#24324a';ctx.beginPath();ctx.arc(0,0,o.r,0,6.28);ctx.fill();ctx.fillStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.arc(-3,-3.5,4,0,6.28);ctx.fill();ctx.fillStyle='#0c1018';for(const [x,y] of [[2,-3],[4.5,-1],[3,2]]){ctx.beginPath();ctx.arc(x,y,1,0,6.28);ctx.fill();}}
  else if(o.type==='grenade'){ctx.fillStyle='#4b5537';ctx.beginPath();ctx.ellipse(0,0,3.2,3.6,0,0,6.28);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=0.3;for(let i=-2;i<=2;i+=2){ctx.beginPath();ctx.moveTo(-3,i);ctx.lineTo(3,i);ctx.stroke();}ctx.fillStyle='#777';ctx.fillRect(-1,-5,2,1.6);blinker(0,-5.4,o.fuse<1);}
  else if(o.type==='c4'){ctx.fillStyle='#c9b98f';ctx.fillRect(-4,-2.6,8,5.2);ctx.fillStyle='#3a3a3a';ctx.fillRect(-4,-0.6,8,1.2);ctx.fillStyle='#222';ctx.fillRect(-1.6,-3.6,3.2,2);blinker(0,-3.9,o.fuse<1.2);}
  else if(o.type==='mine'){ctx.fillStyle='#3b4230';ctx.beginPath();ctx.ellipse(0,-1.2,7,2.4,0,Math.PI,0);ctx.fill();ctx.fillRect(-7,-1.2,14,1.2);ctx.fillStyle='#555';ctx.fillRect(-1,-4,2,1.6);blinker(0,-4.2,o.arm<=0);}
  ctx.restore();
}
function drawGun(f,k){
  // while you aim, the gun in your hand is drawn by the aim overlay (it recoils there); don't draw a second copy
  if(f.k==='gun'&&view==='side'&&drag&&drag.moved&&Math.hypot(f.x-drag.sw.x,f.y-drag.sw.y)<1)return;
  ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.a);if(Math.cos(f.a)<0)ctx.scale(1,-1);ctx.globalAlpha=Math.min(1,k*2.5);
  // recoil: the gun kicks back along the bore and the muzzle climbs for the first ~60 ms, then settles
  // (no kick while you are only aiming: there is no shot yet)
  const age=f.t,kick=age==null?0:Math.exp(-age*30),hv=['bmg','sniper','slug','shotgun','revolver','dmr'].includes(f.kind)?1.6:1;
  ctx.translate(-1.6*kick*hv,0);ctx.rotate(-0.12*kick*hv);
  if(!artDraw(ctx,f.kind)){ctx.fillStyle='#1b1e22';ctx.fillRect(-48,-1.8,49,3);}
  ctx.restore();ctx.globalAlpha=1;
}
function drawBrakes(c,pr){for(const [x,y] of BRAKEPT){const on=pr.brake;c.fillStyle=on?'#d9453b':'#4fae62';c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=0.5;c.beginPath();c.arc(x,y,3.4,0,6.283);c.fill();c.stroke();
  // padlock: closed when braked, open when free
  c.fillStyle='#fff';c.fillRect(x-1.5,y-0.4,3,2.4);c.strokeStyle='#fff';c.lineWidth=0.55;c.beginPath();if(on)c.arc(x,y-0.5,1.05,Math.PI,0);else c.arc(x+0.9,y-0.9,1.05,Math.PI,-0.3);c.stroke();}}
// the pool, seen from the side through its clear acrylic front panel: the liquid tints whatever is inside it
function drawPool(c,pr){const D=POOLD,m=pr.mix,lv=poolLevel(pr),col=mixColor(m),X0=D.x0,X1=D.x1,N=POOLN;
  if(m.vol>1){const a=clamp(col[3]*1.15,0.22,0.9),sx=i=>X0+(X1-X0)*i/(N-1),sy=i=>Math.max(D.rim-6,lv+(pr.wv?pr.wv[i]:0));
    const surf=()=>{c.beginPath();c.moveTo(X0,D.y0);for(let i=0;i<N;i++)c.lineTo(sx(i),sy(i));c.lineTo(X1,D.y0);c.closePath();};
    surf();c.fillStyle=`rgba(${col[0]|0},${col[1]|0},${col[2]|0},${a})`;c.fill();
    const g=c.createLinearGradient(0,lv,0,D.y0);g.addColorStop(0,'rgba(255,255,255,.12)');g.addColorStop(1,'rgba(0,0,30,.22)');surf();c.fillStyle=g;c.fill();
    c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=0.45;c.beginPath();for(let i=0;i<N;i++){const y=sy(i)+0.25*Math.sin(i*1.7+T*3);i?c.lineTo(sx(i),y):c.moveTo(sx(i),y);}c.stroke();}
  // acrylic front: a faint sheen and the frame
  c.fillStyle='rgba(200,230,255,.06)';c.fillRect(X0,D.rim,X1-X0,D.y0-D.rim);
  c.fillStyle='#d9e3ea';c.fillRect(-90,-4.2,180,4.2);c.fillStyle='#9fb2bf';c.fillRect(-90,-1.2,180,1.2);
  for(const sx of [-1,1]){const x=sx>0?X1:-90;c.fillStyle='#e4edf3';c.fillRect(x,-57,4,57);c.fillStyle='rgba(60,90,110,.35)';for(let y=-54;y<-4;y+=6)c.fillRect(x,y,4,0.4);}
  c.fillStyle='#f4f8fa';c.fillRect(-90.5,-58,181,2.2);c.strokeStyle='rgba(120,150,170,.6)';c.lineWidth=0.3;c.strokeRect(X0,D.rim,X1-X0,D.y0-D.rim);
  // label: how much, how hot, how acidic
  const ph=mixPH(m);c.save();c.fillStyle='rgba(13,16,19,.72)';c.fillRect(-36,-71,72,9);c.fillStyle='#e7ecef';c.font='600 4.6px "IBM Plex Mono",monospace';c.textAlign='center';c.textBaseline='middle';
  c.fillText(m.vol<1?'Empty · pour something in':fmtAmt(m.vol)+' · '+Math.round(m.T)+' °C'+(ph!=null?' · pH '+ph.toFixed(1):''),0,-66.4);c.restore();}
