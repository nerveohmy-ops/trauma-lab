/* TRAUMA_LAB_MAIN */
/* ===== render/effects.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
function drawRopes(){const c=ctx;if(!ROPES.length&&!(drag&&drag.rope))return;c.save();c.lineCap='round';
  const one=(p,q,L,live)=>{const d=Math.hypot(q.x-p.x,q.y-p.y),sag=L?Math.min(L*0.35,Math.sqrt(Math.max(0,L*L-d*d))*0.55):0,mx=(p.x+q.x)/2,my=(p.y+q.y)/2+sag;
    c.strokeStyle=live?'rgba(214,180,120,.75)':'#7a5a30';c.lineWidth=1.0;if(live)c.setLineDash([1.6,1.2]);c.beginPath();c.moveTo(p.x,p.y);c.quadraticCurveTo(mx,my,q.x,q.y);c.stroke();c.setLineDash([]);
    if(!live){c.strokeStyle='rgba(235,205,150,.55)';c.lineWidth=0.35;c.setLineDash([0.7,0.9]);c.stroke();c.setLineDash([]);}};
  const end=(E,p)=>{if(E.k==='pt'){c.fillStyle='#4b5157';c.beginPath();c.arc(p.x,p.y,1.4,0,6.28);c.fill();c.strokeStyle='#9aa2aa';c.lineWidth=0.4;c.beginPath();c.arc(p.x,p.y+0.9,1.1,0.2,Math.PI-0.2);c.stroke();}
    else{c.strokeStyle='#5e4424';c.lineWidth=0.7;c.beginPath();c.ellipse(p.x,p.y,1.3,0.9,0,0,6.28);c.stroke();}};
  if(ROPESEL&&ROPES.includes(ROPESEL)){const r=ROPESEL,p=ropePos(r.a),q=ropePos(r.b),d=Math.hypot(q.x-p.x,q.y-p.y),sag=Math.min(r.L*0.35,Math.sqrt(Math.max(0,r.L*r.L-d*d))*0.55);c.strokeStyle='rgba(255,209,102,.55)';c.lineWidth=3.2;c.beginPath();c.moveTo(p.x,p.y);c.quadraticCurveTo((p.x+q.x)/2,(p.y+q.y)/2+sag,q.x,q.y);c.stroke();c.strokeStyle='#ffd166';c.lineWidth=0.5;for(const e of [p,q]){c.beginPath();c.arc(e.x,e.y,2.4,0,6.28);c.stroke();}}
  for(const r of ROPES){const p=ropePos(r.a),q=ropePos(r.b);one(p,q,r.L,false);end(r.a,p);end(r.b,q);}
  if(drag&&drag.rope&&pointerW){const p=ropePos(drag.rope);one(p,pointerW,0,true);end(drag.rope,p);}
  c.restore();}
function drawDrops(){const c=ctx;c.lineCap='round';for(const d of DROPS){const col=d.p?d.p.col:[160,205,250,.75],st=`rgba(${col[0]|0},${col[1]|0},${col[2]|0},${Math.min(0.9,col[3]+0.35)})`,r=0.28+Math.min(2.4,Math.cbrt(d.vol||1)*0.42),sp=Math.hypot(d.vx,d.vy);
    // fast drops stretch into streaks, so a heavy pour reads as a falling stream
    if(sp>40){const k=Math.min(0.045,(r*3)/sp);c.strokeStyle=st;c.lineWidth=r*1.7;c.beginPath();c.moveTo(d.x,d.y);c.lineTo(d.x-d.vx*k,d.y-d.vy*k);c.stroke();}
    else{c.fillStyle=st;c.beginPath();c.arc(d.x,d.y,r,0,6.28);c.fill();}}
  for(const p of WPOOLS){const col=p.p?p.p.col:[170,210,250,.35],a=clamp(1-(T-p.t)/(p.life||40),0,1)*Math.max(0.3,col[3]);c.fillStyle=`rgba(${col[0]|0},${col[1]|0},${col[2]|0},${a.toFixed(3)})`;c.beginPath();c.ellipse(p.x,-0.15,p.w,0.25,0,0,6.28);c.fill();}
  drawSolids();drawFilmsSide();drawChemFX();}
function drawSolids(){if(!SOLIDS.length)return;const c=ctx;for(const o of SOLIDS){if(o.powder){c.fillStyle='rgba(248,248,244,.85)';c.beginPath();c.arc(o.x,o.y,0.22,0,6.28);c.fill();continue;}
  const r=0.25+0.5*Math.cbrt(o.m);c.fillStyle=o.id==='k'?'#b9b9c4':'#d8d8cc';c.beginPath();c.arc(o.x,o.y-(o.rest?r*0.6:0),r,0,6.28);c.fill();c.fillStyle='rgba(255,255,255,.6)';c.beginPath();c.arc(o.x-r*0.3,o.y-r*0.3-(o.rest?r*0.6:0),r*0.3,0,6.28);c.fill();}}
function drawChemFX(){if(!CHFX.length)return;const c=ctx;
  for(const q of CHFX){const k=q.t/q.life;
    if(q.k==='flame'){c.fillStyle=`rgba(${q.col},${0.75*(1-k)})`;c.beginPath();c.arc(q.x,q.y,q.r*(1-k*0.5),0,6.28);c.fill();c.fillStyle=`rgba(255,255,255,${0.35*(1-k)})`;c.beginPath();c.arc(q.x,q.y+q.r*0.3,q.r*0.35,0,6.28);c.fill();}
    else if(q.k==='spl'){const col=q.col||[170,210,250,.6];c.fillStyle=`rgba(${col[0]|0},${col[1]|0},${col[2]|0},${Math.min(0.85,(col[3]+0.3))*(1-k)})`;c.beginPath();c.arc(q.x,q.y,q.r*(1-k*0.4),0,6.28);c.fill();}
    else if(q.k==='spark'){c.fillStyle=`rgba(${q.col},${1-k})`;c.beginPath();c.arc(q.x,q.y,0.35,0,6.28);c.fill();}
    else if(q.k==='bub'){c.strokeStyle=`rgba(230,245,255,${0.7*(1-k)})`;c.lineWidth=0.1;c.beginPath();c.arc(q.x,q.y,q.r,0,6.28);c.stroke();}
    else if(q.k==='foam'){c.fillStyle=`rgba(250,250,245,${0.9*(1-k*k)})`;c.beginPath();c.arc(q.x,q.y,q.r*(1+k*0.6),0,6.28);c.fill();}
    else{const col=q.k==='fume'?'225,235,215':q.k==='smoke'?'245,245,245':q.k==='fog'?'235,245,255':'240,240,240',a=q.k==='fume'?0.07:q.k==='smoke'?0.32:q.k==='fog'?0.28:0.25;c.fillStyle=`rgba(${col},${a*(1-k)})`;c.beginPath();c.arc(q.x,q.y,q.r*(1+k*1.2),0,6.28);c.fill();}}
}
function trajMark(c,x,y,k,col,sc){
  c.lineWidth=0.45*sc;
  if(k==='in'){c.fillStyle='#111';c.strokeStyle=col;c.beginPath();c.arc(x,y,1.3*sc,0,6.28);c.fill();c.stroke();c.fillStyle=col;c.beginPath();c.arc(x,y,0.45*sc,0,6.28);c.fill();}
  else if(k==='out'){c.fillStyle=col;c.beginPath();for(let i=0;i<10;i++){const a=i/10*6.283,r=(i%2?0.9:2)*sc;c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}c.closePath();c.fill();}
  else if(k==='removed'){c.strokeStyle=col;c.setLineDash([0.6*sc,0.6*sc]);c.beginPath();c.rect(x-1.1*sc,y-1.1*sc,2.2*sc,2.2*sc);c.stroke();c.setLineDash([]);}
  else if(k==='stop'){c.fillStyle=col;c.strokeStyle='#111';c.beginPath();c.rect(x-1.1*sc,y-1.1*sc,2.2*sc,2.2*sc);c.fill();c.stroke();}
  else{c.fillStyle='#9aa3ab';c.strokeStyle=col;c.beginPath();c.moveTo(x,y-1.8*sc);c.lineTo(x+1.5*sc,y);c.lineTo(x,y+1.8*sc);c.lineTo(x-1.5*sc,y);c.closePath();c.fill();c.stroke();}
}
function drawTrajSide(){
  const c=ctx,sc=Math.max(1,1.6/VS);c.lineCap='round';c.lineJoin='round';
  const all=TRAJ.concat(BUL.filter(b=>b.trk&&b.trk.pts.length).map(b=>b.trk));
  for(const t of all){const W=t.pts.map(q=>{const p=toWorld(q.seg,q.s,q.w);const d=dirWorld(q.seg,q.dw||0,q.ds||0);return{x:p.x,y:p.y,dx:d.x,dy:d.y,k:q.k};});if(!W.length)continue;
    const f=W[0],fl=Math.hypot(f.dx,f.dy)||1;
    c.setLineDash([1.2*sc,1.2*sc]);c.strokeStyle=t.col;c.globalAlpha=0.7;c.lineWidth=0.35*sc;c.beginPath();c.moveTo(f.x-f.dx/fl*16,f.y-f.dy/fl*16);c.lineTo(f.x,f.y);
    for(let i=1;i<W.length;i++)if(W[i].k==='in'){c.moveTo(W[i-1].x,W[i-1].y);c.lineTo(W[i].x,W[i].y);}
    const L=W[W.length-1];if(L.k==='out'){const ll=Math.hypot(L.dx,L.dy)||1;c.moveTo(L.x,L.y);c.lineTo(L.x+L.dx/ll*14,L.y+L.dy/ll*14);}
    c.stroke();c.setLineDash([]);c.globalAlpha=1;
    for(let i=0;i<W.length-1;i++){if(W[i].k!=='in')continue;const a=W[i],b=W[i+1];
      c.strokeStyle='rgba(0,0,0,.55)';c.lineWidth=1.5*sc;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
      c.strokeStyle=t.col;c.lineWidth=0.8*sc;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
    if(L.k==='out'){const ll=Math.hypot(L.dx,L.dy)||1,ax=L.x+L.dx/ll*14,ay=L.y+L.dy/ll*14,ux=L.dx/ll,uy=L.dy/ll;c.fillStyle=t.col;c.beginPath();c.moveTo(ax+ux*2*sc,ay+uy*2*sc);c.lineTo(ax-uy*1.2*sc,ay+ux*1.2*sc);c.lineTo(ax+uy*1.2*sc,ay-ux*1.2*sc);c.closePath();c.fill();}
    for(const q of W)trajMark(c,q.x,q.y,q.k,t.col,sc);
  }
  for(const g of trajGroups()){const t=g.list.find(x=>x.view==='side'&&x.pts.length);if(!t)continue;const q=t.pts[0];const p=toWorld(q.seg,q.s,q.w),d=dirWorld(q.seg,q.dw||0,q.ds||0),dl=Math.hypot(d.x,d.y)||1;
    const lx=p.x-d.x/dl*19,ly=p.y-d.y/dl*19;c.fillStyle=g.col;c.beginPath();c.arc(lx,ly,2.4*sc,0,6.28);c.fill();c.fillStyle='#111';c.font=`700 ${2.8*sc}px sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(g.n,lx,ly+0.15*sc);}
}
// bullets in flight: a short light streak, and the projectile itself at its true size and shape
// (pistol bullets ≈ 1.5 calibres long and round-nosed, rifle bullets ≈ 3–4 calibres with a pointed ogive);
// the tip colour follows the military code: black AP, red incendiary, yellow explosive
const TIPC={ap:'#15181b',inc:'#c0392b',he:'#e0b400',frag12:'#e0b400'};
function drawBullets(){
  if(!BUL.length)return;ctx.lineCap='round';
  for(const b of BUL){const sp=Math.hypot(b.vx,b.vy)||1,dx=b.vx/sp,dy=b.vy/sp,L=Math.min(b.dist+3,10+sp*0.006);
    const dia=b.dia||CAL[b.k]||0.9,inc=b.am==='inc';
    const g=ctx.createLinearGradient(b.x-dx*L,b.y-dy*L,b.x,b.y);g.addColorStop(0,inc?'rgba(255,90,40,0)':'rgba(255,220,150,0)');g.addColorStop(1,inc?'rgba(255,150,80,.95)':'rgba(255,244,210,.8)');
    ctx.strokeStyle=g;ctx.lineWidth=Math.max(dia*0.7,1.4/VS);ctx.beginPath();ctx.moveTo(b.x-dx*L,b.y-dy*L);ctx.lineTo(b.x,b.y);ctx.stroke();
    const rifle=CART[b.k]&&CART[b.k].N!=null,len=dia*(b.k==='slug'?1.2:rifle?3.6:1.5),r=dia/2,k=Math.max(1,1.2/(VS*dia));
    ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(dy,dx));ctx.scale(k,k);
    const cu=ctx.createLinearGradient(0,-r,0,r);const base=b.am==='bird'||b.k==='shotgun'?['#c8c8c8','#7d7f82','#4b4d50']:['#f3c27a','#c47a3a','#7a4520'];cu.addColorStop(0,base[0]);cu.addColorStop(0.45,base[1]);cu.addColorStop(1,base[2]);
    ctx.fillStyle=cu;ctx.beginPath();
    if(b.k==='shotgun'){ctx.arc(0,0,r,0,6.283);}
    else{ctx.moveTo(-len*0.5,-r);ctx.lineTo(len*(rifle?0.05:0.1),-r);ctx.quadraticCurveTo(len*0.5,-r*(rifle?0.55:0.9),len*0.5,0);ctx.quadraticCurveTo(len*0.5,r*(rifle?0.55:0.9),len*(rifle?0.05:0.1),r);ctx.lineTo(-len*0.5,r);ctx.closePath();}
    ctx.fill();const tc=TIPC[b.am];if(tc&&b.k!=='shotgun'){ctx.fillStyle=tc;ctx.beginPath();ctx.moveTo(len*0.32,-r*0.75);ctx.quadraticCurveTo(len*0.5,-r*0.4,len*0.5,0);ctx.quadraticCurveTo(len*0.5,r*0.4,len*0.32,r*0.75);ctx.closePath();ctx.fill();}
    if(b.am==='hp'&&b.k!=='shotgun'){ctx.fillStyle='#3a2514';ctx.beginPath();ctx.arc(len*0.48,0,r*0.35,0,6.283);ctx.fill();}
    ctx.restore();}
}
// ejected cases on the floor and in the air, at their real size: straight-walled pistol cases, bottlenecked rifle
// cases, and 12-gauge hulls (coloured plastic on a brass head)
function drawCases(c){
  if(!SHELLS.length)return;
  for(const s of SHELLS){const C=CART[s.k];if(!C)continue;const L=C.L,R=C.D/2,N=C.N!=null?C.N/2:R;
    c.save();c.translate(s.x,s.y);c.rotate(s.ang);
    if(C.mat==='hull'){c.fillStyle='#b5332a';c.fillRect(-L/2,-R,L*0.78,2*R);c.fillStyle='rgba(0,0,0,.2)';c.fillRect(-L/2,R*0.35,L*0.78,R*0.65);
      const g=c.createLinearGradient(0,-R,0,R);g.addColorStop(0,'#f6dc8e');g.addColorStop(0.5,'#c99a3a');g.addColorStop(1,'#7d5a18');c.fillStyle=g;c.fillRect(L*0.28,-R*1.04,L*0.22,2.08*R);}
    else{const g=c.createLinearGradient(0,-R,0,R);
      if(C.mat==='steel'){g.addColorStop(0,'#a7a487');g.addColorStop(0.5,'#6f6c4e');g.addColorStop(1,'#3d3b29');}else{g.addColorStop(0,'#fbe7a1');g.addColorStop(0.45,'#d4a640');g.addColorStop(1,'#7c5a14');}
      c.fillStyle=g;c.beginPath();
      if(C.N!=null){const sh=L*0.22,nk=L*0.14;c.moveTo(L/2,-R);c.lineTo(-L/2+nk+sh,-R);c.lineTo(-L/2+nk,-N);c.lineTo(-L/2,-N);c.lineTo(-L/2,N);c.lineTo(-L/2+nk,N);c.lineTo(-L/2+nk+sh,R);c.lineTo(L/2,R);c.closePath();}
      else c.rect(-L/2,-R,L,2*R);
      c.fill();c.fillStyle='rgba(0,0,0,.28)';c.fillRect(L/2-L*0.06,-(C.rim||C.D)/2,L*0.06,(C.rim||C.D));
      c.fillStyle='rgba(255,255,255,.35)';c.fillRect(-L/2+(C.N!=null?L*0.36:0),-R*0.62,L*(C.N!=null?0.6:0.95),R*0.22);}
    c.restore();}
}
function drawFlames(front){
  if(!FLAMES.length)return;const c=ctx;
  c.save();c.globalCompositeOperation='lighter';
  for(const f of FLAMES){if(f.co2)continue;if(front?f.front!==view:!!f.front)continue;const k=f.t/f.life;if(k>0.8)continue;
    const a=(1-k/0.8)*0.5;c.fillStyle=k<0.2?`rgba(255,240,180,${a})`:k<0.45?`rgba(255,170,60,${a})`:`rgba(240,80,20,${a*0.8})`;c.beginPath();c.arc(f.x,f.y,f.r*(0.7+k),0,6.28);c.fill();}
  c.restore();
  for(const f of FLAMES){if(front?f.front!==view:!!f.front)continue;const k=f.t/f.life;
    if(f.puke){if(f.y>-0.5){f.t=f.life;continue;}c.fillStyle='rgba(176,165,70,.85)';c.beginPath();c.arc(f.x,f.y,f.r,0,6.28);c.fill();}
    else if(f.co2){c.fillStyle=`rgba(235,240,245,${0.35*(1-k)})`;c.beginPath();c.arc(f.x,f.y,f.r,0,6.28);c.fill();}
    else if(k>0.6){c.fillStyle=`rgba(60,58,56,${0.22*(1-k)/0.4})`;c.beginPath();c.arc(f.x,f.y,f.r*(1+k),0,6.28);c.fill();}}
}
function drawSerumGlow(front){
  const RL=DR?regenLevel():{k:0,ku:0};if(RL.k<0.05&&RL.ku<0.05)return;const gold=RL.ku>0.05;const a=Math.min(0.6,RL.k*0.3)*(0.6+0.4*Math.sin(T*(gold?7:5)));const c=ctx;
  c.save();setWorld(c);c.fillStyle=gold?`rgba(255,216,77,${a})`:`rgba(86,240,255,${a})`;c.shadowColor=gold?'#ffd84d':'#56f0ff';c.shadowBlur=(gold?26:18)*DPR;
  if(front){frontSilhouette(c);c.fill();}
  else for(const g of segs){if(!g.connected)continue;const f=frame(g);c.save();c.transform(f.nx,f.ny,f.ux,f.uy,f.ax,f.ay);const [ra,rb]=segRad(g);segPath(c,g,ra+0.4,rb+0.4);c.restore();c.fill();}
  c.restore();
}
function drawSource(){
  if(!SOURCE)return;const c=ctx,x=SOURCE.x,y=-3;
  c.save();c.globalCompositeOperation='lighter';const g=c.createRadialGradient(x,y,0,x,y,18);g.addColorStop(0,`rgba(120,255,170,${0.35+0.1*Math.sin(T*6)})`);g.addColorStop(1,'rgba(60,255,140,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,18,0,6.28);c.fill();c.restore();
  c.fillStyle='#9aa1a8';c.fillRect(x-3.2,y-2.4,6.4,4.8);c.fillStyle='#d9e0e6';c.fillRect(x-3.2,y-2.4,6.4,0.8);c.fillStyle='#e8c430';c.beginPath();c.arc(x,y,1.5,0,6.28);c.fill();c.fillStyle='#222';for(let i=0;i<3;i++){const a=i*2.094-1.57;c.beginPath();c.moveTo(x,y);c.arc(x,y,1.3,a-0.5,a+0.5);c.closePath();c.fill();}c.fillStyle='#e8c430';c.beginPath();c.arc(x,y,0.35,0,6.28);c.fill();
  c.fillStyle='rgba(200,255,220,.9)';c.font=`600 ${Math.max(2.4,9/VS)}px monospace`;c.textAlign='center';c.fillText((SOURCE.rate*60).toFixed(2)+' Gy/min',x,y-6);
}
function drawTrip(){
  const L=DR&&DR.lsd.l||0;if(L<0.1)return;const c=ctx,a=Math.min(0.3,L*0.14);
  c.save();c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='overlay';
  const t=T*0.6,g=c.createLinearGradient(cv.width*(0.5+0.5*Math.cos(t)),0,cv.width*(0.5-0.5*Math.cos(t)),cv.height);
  for(let i=0;i<=6;i++)g.addColorStop(i/6,`hsla(${(i*60+T*80)%360},90%,55%,${a})`);c.fillStyle=g;c.fillRect(0,0,cv.width,cv.height);
  c.globalCompositeOperation='screen';for(let i=0;i<4;i++){const x=cv.width*(0.5+0.35*Math.sin(T*0.7+i*1.7)),y=cv.height*(0.45+0.3*Math.cos(T*0.5+i*2.1)),r=cv.width*(0.15+0.05*Math.sin(T+i));const gr=c.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`hsla(${(i*90+T*60)%360},100%,60%,${a*0.6})`);gr.addColorStop(1,'hsla(0,0%,0%,0)');c.fillStyle=gr;c.fillRect(x-r,y-r,2*r,2*r);}
  c.restore();
}
function drawCore(){
  if(!CORE)return;const c=ctx,x=CORE.x;
  c.fillStyle='#3a3f45';c.fillRect(x-22,CTOP,44,2);c.fillStyle='#2a2e33';c.fillRect(x-20,CTOP+2,2.2,-CTOP-2);c.fillRect(x+17.8,CTOP+2,2.2,-CTOP-2);c.fillStyle='rgba(255,255,255,.06)';c.fillRect(x-22,CTOP,44,0.5);
  c.save();c.translate(0,CTOP);
  const k=Math.max(0,1-(T-CORE.flash)/0.8);
  if(k>0){c.save();c.globalCompositeOperation='lighter';const g=c.createRadialGradient(x,-9,0,x,-9,60*k+10);g.addColorStop(0,`rgba(150,200,255,${0.9*k})`);g.addColorStop(1,'rgba(80,120,255,0)');c.fillStyle=g;c.beginPath();c.arc(x,-9,60*k+10,0,6.28);c.fill();c.restore();}
  c.fillStyle='#4a4f56';c.fillRect(x-8,-3.4,16,3.4);c.fillStyle='#2d3136';c.fillRect(x-9,-0.8,18,0.8);
  const R_=4.4,gap=CORE.open?1.3:0;
  const metal=(y0,up)=>{const g=c.createLinearGradient(x-R_,y0-R_,x+R_,y0+R_);g.addColorStop(0,'#eef1f4');g.addColorStop(0.5,'#a9b0b8');g.addColorStop(1,'#6c737b');c.fillStyle=g;c.beginPath();c.arc(x,y0,R_,up?Math.PI:0,up?0:Math.PI,false);c.closePath();c.fill();c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=0.2;c.stroke();};
  metal(-7.8,false);metal(-7.8-gap,true);
  c.fillStyle='#2b2f34';c.fillRect(x-0.6,-7.8-gap-R_-1.4,1.2,1.4);
  if(CORE.open){c.fillStyle='#cfd5da';c.beginPath();c.moveTo(x+0.5,-7.8-gap*0.5);c.lineTo(x+R_+1.5,-7.8-gap*0.5-0.25);c.lineTo(x+R_+1.5,-7.8-gap*0.5+0.35);c.closePath();c.fill();c.fillStyle='#e0b13a';c.fillRect(x+R_+1.5,-7.8-gap*0.5-0.7,5.5,1.4);c.fillStyle='rgba(0,0,0,.25)';c.fillRect(x+R_+1.5,-7.8-gap*0.5+0.3,5.5,0.4);}
  if(!CORE.open&&k<=0){c.save();c.globalCompositeOperation='lighter';c.fillStyle=`rgba(120,170,255,${0.08+0.04*Math.sin(T*3)})`;c.beginPath();c.arc(x,-7.8,R_+2,0,6.28);c.fill();c.restore();}
  c.restore();
}
function drawStreams(){
  ctx.lineCap='round';ctx.lineJoin='round';
  for(const k in STREAMS){const st=STREAMS[k],pts=st.pts;
    const path=new Path2D();let pen=false;const drops=[];
    for(let i=0;i<pts.length;i++){const q=pts[i];
      if(q.dead){pen=false;continue;}
      // a jet stays coherent for only ~10-25 cm before surface tension breaks it into droplets
      if(q.age>0.05+st.w*0.06){pen=false;drops.push(q);continue;}
      if(pen){const pr=pts[i-1];if(pr.dead||Math.hypot(q.x-pr.x,q.y-pr.y)>9){pen=false;}}
      if(!pen){path.moveTo(q.x,q.y);pen=true;}else path.lineTo(q.x,q.y);}
    ctx.strokeStyle='#7a0a12';ctx.lineWidth=st.w;ctx.stroke(path);
    ctx.strokeStyle='rgba(225,70,80,.45)';ctx.lineWidth=st.w*0.28;ctx.stroke(path);
    ctx.strokeStyle='#7a0a12';ctx.lineWidth=st.w*0.75;
    const dp=new Path2D();for(const q of drops){const sp=Math.hypot(q.vx,q.vy)||1,l=Math.min(1.6,sp*0.004)+0.15;dp.moveTo(q.x,q.y);dp.lineTo(q.x-q.vx/sp*l,q.y-q.vy/sp*l);}ctx.stroke(dp);
  }
}
function drawMist(){if(!MIST.length||OPT.quality==='low'&&MIST.length>60)return;const P4=[new Path2D(),new Path2D(),new Path2D(),new Path2D()],AS=new Path2D();for(const m of MIST){if(m.ash){AS.moveTo(m.x+m.r,m.y);AS.arc(m.x,m.y,m.r*(1-m.t/m.life*0.5),0,6.28);continue;}const k=1-m.t/m.life,b=Math.min(3,Math.floor(k*4));P4[b].moveTo(m.x+m.r,m.y);P4[b].arc(m.x,m.y,m.r,0,6.28);}
  ctx.fillStyle='rgba(70,64,58,.55)';ctx.fill(AS);
  for(let b=0;b<4;b++){ctx.fillStyle=`rgba(150,12,22,${(0.07+b*0.075).toFixed(3)})`;ctx.fill(P4[b]);}}
function drawStrands(){if(!STRANDS.length)return;ctx.lineCap='round';ctx.lineJoin='round';const tone=skinTone(false);
  for(const st of STRANDS){const n=st.nodes,m=n.length;
    if(st.k==='flap'||st.k==='mflap'){drawFlap(st,tone);continue;}
    const col=st.k==='muscle'?['#6e141b','#b0343c']:st.k==='tendon'?['#cdbfa8','#f1e8d8']:st.k==='skin'?[rgb(tone,0.8),'#e2c26a']:['#5a0a12','#9a1a26'];
    for(let pass=0;pass<2;pass++){ctx.strokeStyle=col[pass];for(let i=1;i<m;i++){const f=1-(i-1)/(m-1)*0.75;ctx.lineWidth=st.wid*f*(pass?0.42:1);ctx.beginPath();ctx.moveTo(n[i-1].x,n[i-1].y);ctx.lineTo(n[i].x,n[i].y);ctx.stroke();}}
    if(st.k==='muscle'){const t=n[m-1];ctx.fillStyle='#7a1a20';ctx.beginPath();ctx.arc(t.x,t.y,st.wid*0.32,0,6.28);ctx.fill();}}}
function drawGibs(){
  const P3={glass:new Path2D(),wood:new Path2D(),bone:new Path2D(),fat:new Path2D(),flesh:new Path2D(),muscle:new Path2D(),skin:new Path2D(),ice:new Path2D(),rock:new Path2D()},HL=new Path2D(),FB=new Path2D();
  const eyes=[],orgs=[];
  for(const g of GIBS){if(g.type==='eye'){eyes.push(g);continue;}if(g.type==='organ'){orgs.push(g);continue;}const ca=Math.cos(g.ang),sa=Math.sin(g.ang),p=P3[g.type]||P3.flesh;
    g.pts.forEach((q,i)=>{const x=g.x+q[0]*ca-q[1]*sa,y=g.y+q[0]*sa+q[1]*ca;i?p.lineTo(x,y):p.moveTo(x,y);});p.closePath();
    if(g.type==='flesh'){HL.moveTo(g.x+g.r*0.35,g.y-g.r*0.2);HL.arc(g.x-g.r*0.05,g.y-g.r*0.2,g.r*0.38,0,6.28);}
    else if(g.type==='muscle'){const L=g.r*(g.el||2)*0.8,W=g.r*0.3;for(let k=-1;k<=1;k++){FB.moveTo(g.x-L*ca-k*W*sa,g.y-L*sa+k*W*ca);FB.lineTo(g.x+L*ca-k*W*sa,g.y+L*sa+k*W*ca);}}}
  ctx.fillStyle='#7a1318';ctx.fill(P3.flesh);ctx.fillStyle='rgba(200,80,90,.45)';ctx.fill(HL);
  ctx.fillStyle='#8e1f27';ctx.fill(P3.muscle);ctx.strokeStyle='rgba(255,170,160,.35)';ctx.lineWidth=0.12;ctx.stroke(FB);ctx.strokeStyle='#5c0f15';ctx.lineWidth=0.1;ctx.stroke(P3.muscle);
  ctx.fillStyle=rgb(skinTone(false),0.92);ctx.fill(P3.skin);ctx.strokeStyle='#e2c26a';ctx.lineWidth=0.22;ctx.stroke(P3.skin);
  ctx.fillStyle='rgba(200,230,255,.85)';ctx.fill(P3.ice);ctx.strokeStyle='#fff';ctx.lineWidth=0.1;ctx.stroke(P3.ice);ctx.fillStyle='#4a3e36';ctx.fill(P3.rock);ctx.fillStyle='rgba(215,235,255,.55)';ctx.fill(P3.glass);ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=0.08;ctx.stroke(P3.glass);ctx.fillStyle='#9a6a3c';ctx.fill(P3.wood);
  ctx.fillStyle='#dcbf72';ctx.fill(P3.fat);ctx.fillStyle='#ece3cb';ctx.fill(P3.bone);ctx.strokeStyle='#a8987a';ctx.lineWidth=0.15;ctx.stroke(P3.bone);
  for(const g of orgs)drawOrganGib(ctx,g);
  for(const g of eyes){const age=T-(g.t0||0);let sx=g.sx,sy=g.sy;if(SEG.head.connected&&age<0.7){const q=toWorld(SEG.head,2.7,6.25);sx=q.x;sy=q.y;}drawEyeball(ctx,g.x,g.y,g.ang,g.r,age<0.7?[sx,sy]:null,g.vx,g.vy);}
}
function drawEyeball(c,x,y,ang,r,stalk,vx,vy){
  if(stalk&&Math.hypot(stalk[0]-x,stalk[1]-y)>5.5)stalk=null;
  if(stalk){c.strokeStyle='#8e1f27';c.lineWidth=0.35;c.lineCap='round';c.beginPath();c.moveTo(stalk[0],stalk[1]);c.quadraticCurveTo((stalk[0]+x)/2,(stalk[1]+y)/2+1.5,x,y);c.stroke();c.strokeStyle='rgba(230,200,190,.5)';c.lineWidth=0.12;c.stroke();}
  else{const l=Math.hypot(vx||0,vy||0)||1;c.strokeStyle='#8e1f27';c.lineWidth=0.3;c.lineCap='round';c.beginPath();c.moveTo(x-Math.cos(ang)*r,y-Math.sin(ang)*r);c.lineTo(x-Math.cos(ang)*r*2.3,y-Math.sin(ang)*r*2.3+0.4);c.stroke();}
  c.fillStyle='#f1ece3';c.beginPath();c.arc(x,y,r,0,6.28);c.fill();c.strokeStyle='rgba(170,40,50,.55)';c.lineWidth=0.08;for(let i=0;i<4;i++){const a=ang+2.4+i*0.5;c.beginPath();c.moveTo(x+Math.cos(a)*r*0.95,y+Math.sin(a)*r*0.95);c.lineTo(x+Math.cos(a+0.2)*r*0.45,y+Math.sin(a+0.2)*r*0.45);c.stroke();}
  const ix=x+Math.cos(ang)*r*0.45,iy=y+Math.sin(ang)*r*0.45;c.fillStyle=V.rot>0.5?'#cfd3c0':'#4a6b7a';c.beginPath();c.arc(ix,iy,r*0.42,0,6.28);c.fill();c.fillStyle='#111';c.beginPath();c.arc(ix,iy,r*0.2,0,6.28);c.fill();
}
function blinker(x,y,fast){ctx.fillStyle=(Math.floor(T*(fast?10:3))%2)?'#ff3b3b':'#5a1a1a';ctx.beginPath();ctx.arc(x,y,0.7,0,6.28);ctx.fill();}
function drawFX(dt){
  setWorld(ctx);
  for(let i=FX.length-1;i>=0;i--){const f=FX[i];f.t+=dt;if(f.t>f.life){FX.splice(i,1);continue;}const k=1-f.t/f.life;
    if(view!=='side'&&!['fflash','fspark','ring','syr','shock','blue'].includes(f.k))continue;
    if(view==='side'&&['fflash','fspark'].includes(f.k))continue;
    if(f.k==='trace'){const g=ctx.createLinearGradient(f.x1,f.y1,f.x2,f.y2);g.addColorStop(0,'rgba(255,230,170,0)');g.addColorStop(1,`rgba(255,240,200,${k})`);ctx.strokeStyle=g;ctx.lineWidth=f.w;ctx.beginPath();ctx.moveTo(f.x1,f.y1);ctx.lineTo(f.x2,f.y2);ctx.stroke();}
    else if(f.k==='blue'){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=`rgba(140,180,255,${0.55*k})`;ctx.fillRect(0,0,cv.width,cv.height);ctx.restore();setWorld(ctx);}
    else if(f.k==='flash'){ctx.fillStyle=`rgba(255,220,140,${k})`;ctx.beginPath();ctx.arc(f.x,f.y,4*k+1,0,6.28);ctx.fill();}
    else if(f.k==='fflash'){ctx.fillStyle=`rgba(255,225,160,${k*0.8})`;ctx.beginPath();ctx.arc(f.x,f.y,2+6*(1-k),0,6.28);ctx.fill();ctx.strokeStyle=`rgba(255,240,200,${k})`;ctx.lineWidth=0.4;ctx.beginPath();ctx.arc(f.x,f.y,4+10*(1-k),0,6.28);ctx.stroke();}
    else if(f.k==='spark'||f.k==='fspark'){ctx.fillStyle=`rgba(255,210,140,${k})`;for(let j=0;j<4;j++)ctx.fillRect(f.x+rnd(-2,2),f.y+rnd(-2,2),0.6,0.6);}
    else if(f.k==='gun')drawGun(f,k);
    else if(f.k==='boom'){const p=f.p||1;ctx.fillStyle=`rgba(255,200,120,${k*0.9})`;ctx.beginPath();ctx.arc(f.x,f.y,10+70*p*(1-k),0,6.28);ctx.fill();ctx.strokeStyle=`rgba(255,255,255,${k*0.5})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(f.x,f.y,20+120*p*(1-k),0,6.28);ctx.stroke();}
    else if(f.k==='ember'){f.vy+=G*0.25*dt;f.vx*=1-1.5*dt;f.vy*=1-1.5*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.y>-0.3){f.y=-0.3;f.vy=0;f.vx*=0.5;}ctx.fillStyle=`rgba(255,${(200*k)|0},${(80*k)|0},${Math.min(1,k*1.4)})`;ctx.beginPath();ctx.arc(f.x,f.y,0.5+0.6*k,0,6.283);ctx.fill();}
    else if(f.k==='debris'){f.vy+=G*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;ctx.fillStyle=`rgba(60,50,40,${k})`;ctx.fillRect(f.x,f.y,0.8,0.8);}
    else if(f.k==='shock'){ctx.strokeStyle=`rgba(150,220,255,${k})`;ctx.lineWidth=0.6;for(let j=0;j<5;j++){ctx.beginPath();let x=f.x+rnd(-8,8),y=f.y+rnd(-10,10);ctx.moveTo(x,y);for(let q=0;q<4;q++){x+=rnd(-4,4);y+=rnd(-4,4);ctx.lineTo(x,y);}ctx.stroke();}}
    else if(f.k==='ring'){ctx.strokeStyle=`rgba(233,196,106,${k})`;ctx.lineWidth=0.6;ctx.beginPath();ctx.arc(f.x,f.y,3+6*(1-k),0,6.28);ctx.stroke();}
    else if(f.k==='syr'){ctx.save();ctx.translate(f.x,f.y);ctx.rotate(-0.7);ctx.globalAlpha=Math.min(1,k*2);ctx.fillStyle='rgba(220,235,245,.9)';ctx.fillRect(-1,-14,2,10);ctx.fillStyle=f.col||'#8fb0c9';ctx.fillRect(-1,-14+10*(1-k),2,10*k);ctx.fillStyle='#ccc';ctx.fillRect(-0.15,-4,0.3,4);ctx.fillRect(-1.8,-15,3.6,1);ctx.restore();ctx.globalAlpha=1;}
  }
}
// the pinned wound label: corner brackets on the wound, a leader line, a small card with the part and what was hit.
// It stays 7 s (fading over the last second) or until the next hit
let PIN=null;
function drawPin(){const p=PIN;if(!p)return;if(OPT.pin===false){PIN=null;return;}const age=(performance.now()-p.t)/1000;if(age>7||!p.seg.connected||p.seg.gone||segs[p.seg.idx]!==p.seg){PIN=null;return;}   // (a regrown part replaces the old one)
  let wx,wy;if(view==='side'){if(!p.w||!p.seg.wounds.includes(p.w))return;const cc=typeof woundCenter==='function'?woundCenter(p.w):{s:p.w.s,w:p.w.w};const q=toWorld(p.seg,cc.s,cc.w);wx=q.x;wy=q.y;}
  else{if(!p.fw||!FW.includes(p.fw))return;wx=(view==='back'?-1:1)*p.fw.x;wy=p.fw.y;}
  const c=ctx,sx=VX+wx*VS,sy=VY+wy*VS,a=age>6?7-age:1;c.save();c.setTransform(DPR,0,0,DPR,0,0);c.globalAlpha=a;
  const right=sx<W*0.6,bx=right?sx+46:sx-46,by=Math.max(70,sy-34);
  c.strokeStyle='#e9c46a';c.lineWidth=1.4;c.lineCap='round';const r=10,k=4;c.beginPath();
  for(const [dx,dy] of [[-1,-1],[1,-1],[1,1],[-1,1]]){c.moveTo(sx+dx*r,sy+dy*(r-k));c.lineTo(sx+dx*r,sy+dy*r);c.lineTo(sx+dx*(r-k),sy+dy*r);}c.stroke();
  c.font='700 11px "Saira Condensed", sans-serif';const tw=c.measureText(p.title).width;c.font='400 10px "IBM Plex Mono", monospace';let w=tw;for(const it of p.items)w=Math.max(w,c.measureText(it.slice(0,26)).width);
  const bw=Math.min(W-16,w+16),bh=20+p.items.length*13,x0=right?Math.min(W-bw-8,bx):Math.max(8,bx-bw),y0=by;
  c.strokeStyle='rgba(233,196,106,.7)';c.lineWidth=1;c.beginPath();c.moveTo(sx+(right?r:-r),sy);c.lineTo(right?x0:x0+bw,y0+10);c.stroke();
  c.fillStyle='rgba(13,16,19,.9)';c.beginPath();c.roundRect?c.roundRect(x0,y0,bw,bh,6):c.rect(x0,y0,bw,bh);c.fill();c.strokeStyle='rgba(233,196,106,.6)';c.stroke();
  c.fillStyle='#e9c46a';c.font='700 11px "Saira Condensed", sans-serif';c.fillText(p.title,x0+8,y0+14);
  c.font='400 10px "IBM Plex Mono", monospace';p.items.forEach((it,i)=>{c.fillStyle=/ a\.| cut|arter/.test(it)?'#ff9ba6':'#e7ecef';c.fillText(it.slice(0,26),x0+8,y0+28+i*13);});
  c.restore();}
function drawOverlays(){drawPin();
  setWorld(ctx);drawOp(ctx);
  const t=TOOL[tool];const gun=t&&t.gun;
  if(view==='side'&&drag&&drag.moved&&gun){
    const dx=drag.cw.x-drag.sw.x,dy=drag.cw.y-drag.sw.y,l=Math.hypot(dx,dy)||1;const L=rayRoomLen(drag.sw.x,drag.sw.y,dx/l,dy/l,900);
    ctx.setLineDash([2,2]);ctx.strokeStyle='rgba(239,79,98,.8)';ctx.lineWidth=0.4;ctx.beginPath();ctx.moveTo(drag.sw.x,drag.sw.y);ctx.lineTo(drag.sw.x+dx/l*L,drag.sw.y+dy/l*L);ctx.stroke();ctx.setLineDash([]);
    {const sh=FX.filter(f=>f.k==='gun'&&Math.hypot(f.x-drag.sw.x,f.y-drag.sw.y)<1).pop();drawGun({x:drag.sw.x,y:drag.sw.y,a:Math.atan2(dy,dx),kind:tool,t:sh?sh.t:null},1);}
  }
  if(view!=='side'&&gun&&pointerW&&drag){ctx.strokeStyle='rgba(239,79,98,.9)';ctx.lineWidth=0.35;const x=pointerW.x,y=pointerW.y;ctx.beginPath();ctx.arc(x,y,3,0,6.28);ctx.moveTo(x-5,y);ctx.lineTo(x-1.5,y);ctx.moveTo(x+1.5,y);ctx.lineTo(x+5,y);ctx.moveTo(x,y-5);ctx.lineTo(x,y-1.5);ctx.moveTo(x,y+1.5);ctx.lineTo(x,y+5);ctx.stroke();}
  if(view==='side'&&drag&&drag.moved&&t&&t.throw){
    const v=throwVel(drag);let x=drag.sw.x,y=drag.sw.y,vx=v.x,vy=v.y;ctx.fillStyle='rgba(233,196,106,.8)';
    for(let i=0;i<26;i++){for(let k=0;k<3;k++){vy+=G/90;x+=vx/90;y+=vy/90;}if(y>0||Math.abs(x)>ROOM)break;ctx.beginPath();ctx.arc(x,y,0.7,0,6.28);ctx.fill();}
  }
  drawSaber();drawMelee();
  if(view==='side')drawRopes();
  if(false){ctx.save();ctx.translate(pointerW.x,pointerW.y);ctx.rotate(drag.ang||0);ctx.fillStyle='#b98a52';ctx.beginPath();ctx.moveTo(-34,-1);ctx.lineTo(0,-3.2);ctx.lineTo(0,3.2);ctx.lineTo(-34,1);ctx.closePath();ctx.fill();ctx.restore();}
  if(view!=='side'&&drag&&((tool==='knife'&&!knifeStabMode())||tool==='machete')&&pointerW&&drag.moved){ctx.save();ctx.translate(pointerW.x,pointerW.y);ctx.rotate(drag.ang||0);ctx.fillStyle='#cfd6dc';const L=tool==='machete'?40:17;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-L,-1.8);ctx.lineTo(-L,0.6);ctx.closePath();ctx.fill();ctx.fillStyle='#2b2b2b';ctx.fillRect(-L-10,-1.2,10,2.4);ctx.restore();}
  if(grab&&pointerW&&!grab.obj&&!grab.prop&&view==='side'){const s=grab.seg,A=P[s.a],B=P[s.b];ctx.strokeStyle='rgba(233,196,106,.7)';ctx.lineWidth=0.4;ctx.beginPath();ctx.moveTo(lerp(A.x,B.x,grab.t),lerp(A.y,B.y,grab.t));ctx.lineTo(pointerW.x,pointerW.y);ctx.stroke();}
}
function drawBH(c){const k=Math.min(1,BH.t*2);if(k<=0)return;const x=BH.x,y=BH.y,R=BH.R*k+0.05,sp=BH.ang;c.save();
  let g=c.createRadialGradient(x,y,R*1.2,x,y,R*7);g.addColorStop(0,'rgba(255,170,90,.32)');g.addColorStop(0.35,'rgba(160,70,40,.12)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,R*7,0,6.28);c.fill();
  const disk=(front)=>{for(let i=0;i<5;i++){const rr=R*(1.9+i*0.5),ry=rr*0.18,a=0.55-i*0.09;const lg=c.createLinearGradient(x-rr,y,x+rr,y);lg.addColorStop(0,`rgba(255,250,235,${a+0.25})`);lg.addColorStop(0.45,`rgba(255,190,110,${a})`);lg.addColorStop(1,`rgba(170,60,20,${a*0.6})`);
      c.strokeStyle=lg;c.lineWidth=R*0.32*(1-i*0.12);c.beginPath();if(front)c.ellipse(x,y,rr,ry,0,0,Math.PI);else c.ellipse(x,y,rr,ry,0,Math.PI,2*Math.PI);c.stroke();}
    c.lineWidth=R*0.08;for(let i=0;i<14;i++){const rr=R*(1.8+((i*0.37+sp*0.15)%1)*2.4),s0=(sp*(3/(rr/R))+i*1.7)%(2*Math.PI);const a0=front?Math.max(0,Math.min(Math.PI,s0)):Math.PI+((s0)%Math.PI);c.strokeStyle=`rgba(255,240,210,${0.35-i*0.015})`;c.beginPath();c.ellipse(x,y,rr,rr*0.18,0,a0,a0+0.5);c.stroke();}};
  disk(false);
  // the far side of the disk bent over the top (and faintly under the bottom) of the shadow
  for(const [s,a] of [[-1,0.75],[1,0.3]]){const lg=c.createLinearGradient(x-R*2,y,x+R*2,y);lg.addColorStop(0,`rgba(255,245,225,${a})`);lg.addColorStop(1,`rgba(220,110,40,${a*0.55})`);c.strokeStyle=lg;c.lineWidth=R*0.42;c.beginPath();c.ellipse(x,y+s*R*0.05,R*1.75,R*(s<0?1.55:1.35),0,s<0?Math.PI*1.05:0.08,s<0?Math.PI*1.95:Math.PI-0.08);c.stroke();}
  c.fillStyle='#000';c.beginPath();c.arc(x,y,R*1.3,0,6.28);c.fill();
  c.strokeStyle='rgba(255,236,200,.9)';c.lineWidth=Math.max(0.15,R*0.06);c.beginPath();c.arc(x,y,R*1.36,0,6.28);c.stroke();
  c.strokeStyle='rgba(255,200,140,.35)';c.lineWidth=R*0.18;c.beginPath();c.arc(x,y,R*1.45,0,6.28);c.stroke();
  disk(true);
  for(const q of BH.P||[]){const px=x+Math.cos(q.a)*q.r,py=y+Math.sin(q.a)*q.r*0.6;c.strokeStyle=`rgba(${q.c},${Math.min(1,q.l).toFixed(2)})`;c.lineWidth=q.w;c.beginPath();c.moveTo(px,py);c.lineTo(x+Math.cos(q.a-0.35)*(q.r+1.2),y+Math.sin(q.a-0.35)*(q.r+1.2)*0.6);c.stroke();}
  c.restore();}
function drawPow(dt){
  setWorld(ctx);
  for(const b of BHS){BH=b;drawBH(ctx);}BH=null;
  for(const m of METEORS){ctx.lineCap='round';for(let i=1;i<m.tr.length;i++){const a=i/m.tr.length;ctx.strokeStyle=`rgba(255,${(150+80*a)|0},60,${a*0.8})`;ctx.lineWidth=m.r*2*a;ctx.beginPath();ctx.moveTo(m.tr[i-1][0],m.tr[i-1][1]);ctx.lineTo(m.tr[i][0],m.tr[i][1]);ctx.stroke();}
    ctx.fillStyle='#4a3a30';ctx.beginPath();ctx.arc(m.x,m.y,m.r,0,6.28);ctx.fill();ctx.fillStyle='rgba(255,140,40,.6)';ctx.beginPath();ctx.arc(m.x-m.r*0.2,m.y+m.r*0.3,m.r*0.6,0,6.28);ctx.fill();}
  for(const f of FBALLS){const g=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,4);g.addColorStop(0,'#fff6c8');g.addColorStop(0.4,'#ffb040');g.addColorStop(1,'rgba(255,80,20,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(f.x,f.y,4,0,6.28);ctx.fill();}
  if(drag&&!drag.probe&&pointerW&&tool==='laser'&&view==='side'){const w=pointerW,sx=w.x>0?-ROOM+1:ROOM-1,sy=w.y-50;ctx.lineCap='round';ctx.strokeStyle='rgba(255,40,40,.35)';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(w.x,w.y);ctx.stroke();ctx.strokeStyle='#ffd0d0';ctx.lineWidth=0.35;ctx.stroke();ctx.fillStyle='rgba(255,220,200,.9)';ctx.beginPath();ctx.arc(w.x,w.y,0.9+Math.random()*0.4,0,6.28);ctx.fill();if(Math.random()<0.4)snd('hum');}
  for(let i=POWFX.length-1;i>=0;i--){const f=POWFX[i];f.t+=dt||1/60;if(f.t>f.life){POWFX.splice(i,1);continue;}const k=1-f.t/f.life;
    if(f.k==='bolt'){ctx.lineCap='round';ctx.lineJoin='round';for(const [w,c] of [[2.4,`rgba(150,170,255,${0.35*k})`],[0.6,`rgba(255,255,255,${k})`]]){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();f.pts.forEach((p,j)=>j?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();}}
    else if(f.k==='flash'){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=`rgba(235,240,255,${0.6*k})`;ctx.fillRect(0,0,cv.width,cv.height);ctx.restore();setWorld(ctx);}
    else if(f.k==='frost'){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=`rgba(190,225,255,${0.45*k})`;ctx.fillRect(0,0,cv.width,cv.height);ctx.restore();setWorld(ctx);}
    else if(f.k==='wave'){ctx.strokeStyle=`rgba(200,220,255,${0.8*k})`;ctx.lineWidth=1.2*k+0.2;ctx.beginPath();ctx.arc(f.x,f.y,4+76*(1-k),0,6.28);ctx.stroke();}
    else if(f.k==='aura'){ctx.fillStyle=`rgba(170,120,255,${0.35*k})`;ctx.beginPath();ctx.arc(f.x,f.y,1+3*(1-k),0,6.28);ctx.fill();}
    else if(f.k==='psi'){ctx.strokeStyle=`rgba(190,120,255,${0.7*k})`;ctx.lineWidth=0.35;ctx.beginPath();ctx.arc(f.x,f.y,2+14*(1-k),0,6.28);ctx.stroke();}
    else if(f.k==='drop'){f.vy+=G*(dt||1/60);f.x+=f.vx*(dt||1/60);f.y+=f.vy*(dt||1/60);ctx.fillStyle=`rgba(190,230,60,${k})`;ctx.beginPath();ctx.arc(f.x,f.y,0.35,0,6.28);ctx.fill();}
    else if(f.k==='dp'){const e=1-k,x=lerp(f.x,f.tx,e*e),y=lerp(f.y,f.ty,e)-Math.sin(e*3.14)*6;ctx.fillStyle=`rgba(170,10,24,${0.9*k+0.1})`;ctx.beginPath();ctx.arc(x,y,0.45,0,6.28);ctx.fill();}}
  if(drag&&drag.drain&&pointerW){const g=ctx.createRadialGradient(pointerW.x,pointerW.y-14,0,pointerW.x,pointerW.y-14,4+Math.min(6,DRAIN/600));g.addColorStop(0,'rgba(200,20,40,.95)');g.addColorStop(1,'rgba(120,0,20,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(pointerW.x,pointerW.y-14,10,0,6.28);ctx.fill();}
  if(TKH){ctx.strokeStyle=`rgba(170,120,255,${0.35+0.2*Math.sin(T*12)})`;ctx.lineWidth=0.8;ctx.lineCap='round';for(const g of TKH.list){if(g.gone)continue;const A=P[g.a],B=P[g.b];ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.lineWidth=(Math.max(g.ra,g.rb)*2+1.6);ctx.stroke();}}
}
function drawSaber(){if(tool!=='saber'||!drag||drag.probe||!pointerW||view==='side')return;const now=performance.now();while(SABT.length&&now-SABT[0].t>140)SABT.shift();const col=SABC[MODE.saber]||SABC.blue,c=ctx;
  c.save();c.lineCap='round';c.lineJoin='round';
  if(SABT.length>1){for(const [w,a] of [[5.5,0.12],[3,0.25],[1.6,0.5]]){c.strokeStyle=`rgba(${col},${a})`;c.lineWidth=w;c.beginPath();SABT.forEach((q,i)=>i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y));c.stroke();}c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=0.6;c.beginPath();SABT.forEach((q,i)=>i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y));c.stroke();}
  const ang=(drag.ang||0)+1.9,tx=pointerW.x,ty=pointerW.y,hx=tx+Math.cos(ang)*34,hy=ty+Math.sin(ang)*34,ex=hx+Math.cos(ang)*8,ey=hy+Math.sin(ang)*8;
  for(const [w,a] of [[4.2,0.14],[2.4,0.3],[1.3,0.6]]){c.strokeStyle=`rgba(${col},${a})`;c.lineWidth=w;c.beginPath();c.moveTo(hx,hy);c.lineTo(tx,ty);c.stroke();}
  c.strokeStyle='#fbfdff';c.lineWidth=0.55;c.beginPath();c.moveTo(hx,hy);c.lineTo(tx,ty);c.stroke();
  c.strokeStyle='#2c3036';c.lineWidth=1.5;c.beginPath();c.moveTo(hx,hy);c.lineTo(ex,ey);c.stroke();c.strokeStyle='#b9c0c8';c.lineWidth=0.5;c.beginPath();c.moveTo(hx+Math.cos(ang)*1.5,hy+Math.sin(ang)*1.5);c.lineTo(hx+Math.cos(ang)*5,hy+Math.sin(ang)*5);c.stroke();
  c.restore();}
