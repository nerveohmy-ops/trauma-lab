/* TRAUMA_LAB_MAIN */
/* ===== render/front.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
// front/back view: the same films and stains, plus the falling drops and grains
function drawChemFront(){const c=ctx,bk=view==='back';setWorld(c);
  const at=(q)=>{const rr=radS(q.seg,clamp(q.s,0,q.seg.len))||q.seg.ra;if(bk?q.w>0.4*rr:q.w<-0.4*rr)return null;return frontPos(q.seg,q.s,q.fz!=null?q.fz:clamp(q.w/rr,-0.3,0.3)*0.3);};
  for(const q of STAINS){if(!q.seg.connected)continue;const p=at(q);if(!p)continue;c.fillStyle=`rgba(${q.col[0]|0},${q.col[1]|0},${q.col[2]|0},${q.a.toFixed(3)})`;c.beginPath();c.ellipse(p.x,p.y,q.r*0.8,q.r,0,0,6.28);c.fill();}
  for(const f of FILMS){if(!f.seg.connected||f.vol<0.05)continue;const p=at(f);if(!p)continue;const r=0.8+Math.min(3,Math.sqrt(f.vol)*1.2),col=f.col||[200,225,255,.3],a=Math.min(0.5,0.2+f.vol*0.08);c.fillStyle=`rgba(${col[0]|0},${col[1]|0},${col[2]|0},${a.toFixed(3)})`;c.beginPath();c.ellipse(p.x,p.y+r*0.3,r*0.75,r*1.3,0,0,6.28);c.fill();if(f.vol>0.5){c.strokeStyle=c.fillStyle;c.lineWidth=0.35;c.lineCap='round';c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x+Math.sin(f.age*0.3)*0.4,p.y+r*1.3+Math.min(6,f.age*1.5));c.stroke();}c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.ellipse(p.x-r*0.25,p.y,r*0.15,r*0.4,0,0,6.28);c.fill();}
  for(const d of FDROPS){if(d.v!==view)continue;if(d.solid){const pw=CHEM[d.solid].powder;c.fillStyle=pw?'rgba(248,248,244,.85)':(d.solid==='k'?'#b9b9c4':'#d8d8cc');c.beginPath();c.arc(d.x,d.y,pw?0.22:0.25+0.5*Math.cbrt(d.m),0,6.28);c.fill();continue;}
    const col=d.p.col;c.fillStyle=`rgba(${col[0]|0},${col[1]|0},${col[2]|0},${Math.min(0.9,col[3]+0.35)})`;c.beginPath();c.arc(d.x,d.y,0.35,0,6.28);c.fill();}
  for(const q of CHFX){if(q.front!==view)continue;const k=q.t/q.life;c.fillStyle=q.k==='flame'?`rgba(${q.col},${0.75*(1-k)})`:`rgba(250,250,245,${0.85*(1-k)})`;c.beginPath();c.arc(q.x,q.y,q.r,0,6.28);c.fill();}
}
function drawTrajFront(){
  const c=ctx,sc=Math.max(1,1.6/VS),bk=view==='back';
  for(const t of TRAJ){
    const P2=[];for(const q of t.pts){if(!q.seg.connected)continue;let p;
      if(q.fv){p=q.fv===view?{x:q.fx,y:q.fy}:{x:q.fx*(q.fv==='back'?1:1),y:q.fy};}else p=frontPos(q.seg,q.s,clamp(q.z==null?0:q.z,-1,1));
      if(!p)continue;const vis=bk?q.w<0:q.w>0;P2.push({x:p.x,y:p.y,k:q.k,vis});}
    if(!P2.length)continue;
    c.strokeStyle=t.col;c.lineCap='round';
    for(let i=0;i<P2.length-1;i++){const a=P2[i],b=P2[i+1];const inside=a.k==='in';c.setLineDash(inside?[]:[1.2*sc,1.2*sc]);c.lineWidth=(inside?0.8:0.35)*sc;c.globalAlpha=inside?1:0.7;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
    c.setLineDash([]);c.globalAlpha=1;
    for(const q of P2){if(q.vis||q.k==='stop')trajMark(c,q.x,q.y,q.k,t.col,sc);else{c.strokeStyle=t.col;c.globalAlpha=0.75;c.lineWidth=0.35*sc;c.setLineDash([0.8*sc,0.8*sc]);c.beginPath();c.arc(q.x,q.y,(q.k==='out'?2:1.3)*sc,0,6.28);c.stroke();c.setLineDash([]);c.globalAlpha=1;}}
  }
  for(const g of trajGroups()){const t=g.list.find(x=>x.pts.length);if(!t)continue;const q=t.pts[0];if(!q.seg.connected)continue;const p=q.fv?{x:q.fx,y:q.fy}:frontPos(q.seg,q.s,clamp(q.z||0,-1,1));if(!p)continue;
    const lx=p.x+(bk?-5:5),ly=p.y-5;c.save();if(bk){c.translate(lx,ly);c.scale(-1,1);c.translate(-lx,-ly);}c.fillStyle=g.col;c.beginPath();c.arc(lx,ly,2.4*sc,0,6.28);c.fill();c.fillStyle='#111';c.font=`700 ${2.8*sc}px sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(g.n,lx,ly+0.15*sc);c.restore();}
}
// axes lodged in front/back view: the steel cheek of the head shows at the wound, the haft comes out toward you (foreshortened)
function drawAxesFront(c){for(const a of FAXE){if(a.v!==view||!a.seg.connected)continue;const x=a.fx,y=a.fy,r=a.rot,ux=Math.cos(r),uy=Math.sin(r);
  // haft: from the head out and down-right toward the viewer, shortened by perspective
  const hx=x+Math.cos(r+1.2)*16,hy=y+Math.sin(r+1.2)*16+6;c.lineCap='round';
  c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=3.2;c.beginPath();c.moveTo(x+0.6,y+0.8);c.lineTo(hx+0.6,hy+0.8);c.stroke();
  const g=c.createLinearGradient(x,y,hx,hy);g.addColorStop(0,'#b88a55');g.addColorStop(1,'#7e5631');c.strokeStyle=g;c.lineWidth=2.6;c.beginPath();c.moveTo(x,y);c.lineTo(hx,hy);c.stroke();
  c.strokeStyle='rgba(255,235,200,.35)';c.lineWidth=0.5;c.beginPath();c.moveTo(x-0.6,y);c.lineTo(hx-0.7,hy);c.stroke();
  // the part of the head still outside the skin: poll and a sliver of cheek, edge buried
  const vis=Math.max(1.2,4-a.depth*0.4);c.fillStyle=steel(c,y-vis,y+vis);c.beginPath();c.moveTo(x-ux*4.2,y-uy*4.2);c.lineTo(x+ux*4.2,y+uy*4.2);c.lineTo(x+ux*3.4-uy*vis,y+uy*3.4+ux*vis*-1);c.lineTo(x-ux*3.8-uy*vis,y-uy*3.8-ux*vis);c.closePath();c.fill();
  c.strokeStyle='rgba(30,30,32,.6)';c.lineWidth=0.2;c.stroke();c.fillStyle='rgba(90,0,8,.8)';c.beginPath();c.ellipse(x,y,4.6,0.9,r,0,6.28);c.fill();}}
function drawKnivesFront(c){
  const list=KNIVES.slice();if(HK&&HK.front&&HK.ins)list.push(HK.ins);
  for(const K of list){if(!K.seg.connected)continue;const p=knifeFrontXY(K);if(!p)continue;
    const out=Math.abs(K.dw||0),vy=-(K.ds||0);
    let dx=0.42*out,dy=-0.5*out+vy;const dl=Math.hypot(dx,dy)||1;dx/=dl;dy/=dl;
    const k=0.55*out+Math.abs(vy);const vb=(KBL-K.depth)*k,hl=KHL*k+1.5;
    const gx=p.x+dx*vb,gy=p.y+dy*vb,ex=gx+dx*hl,ey=gy+dy*hl,nx=-dy,ny=dx;
    c.fillStyle='rgba(60,4,10,.5)';c.beginPath();c.ellipse(p.x,p.y+0.5,1.7,1.2,0,0,6.28);c.fill();
    if(vb>0.3){c.fillStyle='#cfd6dc';c.beginPath();c.moveTo(p.x+nx*0.9,p.y+ny*0.9);c.lineTo(gx+nx*1,gy+ny*1);c.lineTo(gx-nx*0.4,gy-ny*0.4);c.lineTo(p.x-nx*0.4,p.y-ny*0.4);c.closePath();c.fill();}
    c.fillStyle='#4a4a4a';c.beginPath();c.ellipse(gx,gy,2.3,1.1,Math.atan2(ny,nx),0,6.28);c.fill();
    c.fillStyle='#2a2420';c.beginPath();c.moveTo(gx+nx*1.15,gy+ny*1.15);c.lineTo(ex+nx*1.35,ey+ny*1.35);c.lineTo(ex-nx*1.35,ey-ny*1.35);c.lineTo(gx-nx*1.15,gy-ny*1.15);c.closePath();c.fill();
    c.beginPath();c.ellipse(ex,ey,1.4,1.3,0,0,6.28);c.fill();
    c.fillStyle='#b9a36a';for(const f of [0.35,0.72]){c.beginPath();c.arc(lerp(gx,ex,f),lerp(gy,ey,f),0.32,0,6.28);c.fill();}
    c.fillStyle='rgba(255,255,255,.14)';c.beginPath();c.ellipse(ex-0.4,ey-0.4,0.6,0.5,0,0,6.28);c.fill();}
}
function rotFront(s){const f=Math.min(1,V.rot);let h_=4421;const rr=()=>{h_=(h_*16807)%2147483647;return h_/2147483647;};
  for(const q of FP){const seg=SEG[q.id];if(!seg||!seg.connected)continue;const n=q.t==='torso'?14:4;
    for(let i=0;i<n;i++){let x,y;if(q.t==='cap'){const tt=rr();x=lerp(q.x1,q.x2,tt)+(rr()*2-1)*lerp(q.r1,q.r2,tt)*0.7;y=lerp(q.y1,q.y2,tt);}else if(q.t==='torso'){y=lerp(q.y0,q.y1,rr());x=(rr()*2-1)*torsoHW(y)*0.8;}else{x=q.cx+(rr()*2-1)*q.rx*0.6;y=q.cy+(rr()*2-1)*q.ry*0.6;}
      const rad=1.2+rr()*2.6,pu=rr()<0.4;s.fillStyle=pu?`rgba(80,40,70,${(0.3*f).toFixed(3)})`:`rgba(60,72,32,${(0.36*f).toFixed(3)})`;s.beginPath();s.ellipse(x,y,rad,rad*0.75,rr()*3,0,6.28);s.fill();
      if(rr()<0.5){s.strokeStyle=`rgba(30,38,48,${(0.5*f).toFixed(3)})`;s.lineWidth=0.16;s.beginPath();let vx=x,vy=y;s.moveTo(vx,vy);for(let k=0;k<4;k++){vx+=(rr()*2-1)*1.4;vy+=(rr()*2-1)*1.8;s.lineTo(vx,vy);}s.stroke();}
      if(f>0.6&&rr()<0.18){const r2=0.6+rr()*0.8;s.fillStyle='rgba(185,165,80,.6)';s.beginPath();s.ellipse(x,y,r2+0.35,r2*0.8+0.3,0,0,6.28);s.fill();s.fillStyle='#4a1a12';s.beginPath();s.ellipse(x,y,r2,r2*0.75,0,0,6.28);s.fill();}}}
}
// a foot seen from the front points at you: narrow at the ankle, the dorsum foreshortened, splaying to the toes with the
// big toe on the inside; from the back you see the rounded heel and the Achilles tendon narrowing into the calf
function footPts(f){const sg=Math.sign(f.cx)||1,x=f.cx,top=f.cy-f.ry-3.2;
  // malleoli: the inner ankle bone (tibia) sits ≈1 cm higher than the outer one (fibula)
  return view==='back'?[[x-sg*3.45,top],[x+sg*3.45,top],[x+sg*3.5,-6.4],[x+sg*3.2,-4.6],[x+sg*3.7,-1.8],[x+sg*2.9,0],[x,0.25],[x-sg*2.9,0],[x-sg*3.7,-1.8],[x-sg*3.2,-4.6],[x-sg*3.6,-7.2]]
    :[[x-sg*3.45,top],[x+sg*3.45,top],[x+sg*3.95,-6.3],[x+sg*3.6,-4.6],[x+sg*4.8,-1.4],[x+sg*4.4,-0.05],[x+sg*1.4,0.2],[x-sg*1.9,0.25],[x-sg*4.3,-0.1],[x-sg*4.4,-1.6],[x-sg*3.5,-4.9],[x-sg*4.0,-7.3]];}
function footFront(c,f){let P=footPts(f);{let A=0;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];A+=a[0]*b[1]-b[0]*a[1];}if(A<0)P=P.reverse();}const n=P.length,m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];let q=m(P[n-1],P[0]);c.moveTo(q[0],q[1]);
  for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n],mm=m(a,b);c.quadraticCurveTo(a[0],a[1],mm[0],mm[1]);}c.closePath();}
// soft inner shadow along the outer edge of the whole body (not of each overlapping part), cached: it gives the limbs and
// torso their roundness without the dark rings that outlining every part used to leave at the joints
function frontRim(s,tone){
  const X0=-44,Y0=-188,W0=88,H0=194,cn=segs.map(g=>g.connected&&!g.gone?1:0).join(''),key=view+(FEMALE?'f':'m')+cn+OPT.skin;
  let R=frontRim.c;const res=pickRes(R&&R.res,Math.min(6,Math.max(1.5,VS*DPR)));
  if(!R||R.key!==key||R.res!==res){const w=Math.ceil(W0*res),h=Math.ceil(H0*res);
    if(!R||R.cv.width!==w||R.cv.height!==h){R={cv:document.createElement('canvas'),o:document.createElement('canvas')};R.cv.width=R.o.width=w;R.cv.height=R.o.height=h;}
    const o=R.o.getContext('2d'),x=R.cv.getContext('2d');
    // outside-of-body mask
    o.setTransform(1,0,0,1,0,0);o.globalCompositeOperation='source-over';o.clearRect(0,0,w,h);o.fillStyle='#000';o.fillRect(0,0,w,h);
    o.setTransform(res,0,0,res,-X0*res,-Y0*res);o.globalCompositeOperation='destination-out';frontSilhouette(o);o.fill();o.globalCompositeOperation='source-over';
    x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,w,h);x.save();x.setTransform(res,0,0,res,-X0*res,-Y0*res);frontSilhouette(x);x.clip();x.setTransform(1,0,0,1,0,0);
    // the mask is drawn off-canvas; only its blurred shadow falls back onto the body, darkening it toward every outer edge
    const dk=`rgba(${Math.round(tone[0]*0.42)},${Math.round(tone[1]*0.3)},${Math.round(tone[2]*0.26)},`;
    for(const [b,a] of [[3.2,0.5],[1.1,0.35]]){x.shadowColor=dk+a+')';x.shadowBlur=b*res;x.shadowOffsetX=w+20;x.drawImage(R.o,-(w+20),0);}
    x.restore();R.key=key;R.res=res;frontRim.c=R;}
  s.drawImage(R.cv,X0,Y0,W0,H0);
  // key light from the upper left, a little warmth in the shadow side (light scattering under the skin)
  const lg=s.createLinearGradient(-30,-170,30,-20);lg.addColorStop(0,'rgba(255,246,236,.10)');lg.addColorStop(0.5,'rgba(255,246,236,0)');lg.addColorStop(1,'rgba(120,40,30,.07)');s.fillStyle=lg;s.fillRect(X0,Y0,W0,H0);}
// Hands hang with the palm toward the thigh, so from the front and back you see them edge-on: a wrist narrower than the
// forearm, the knuckle bump on the back of the hand, fingers curling a little toward the palm (relaxed flexion ≈ 15–25°)
const HANDF=[[-1.2,2.45],[1.5,2.35],[4.5,2.6],[7.2,2.85],[8.4,2.75],[10.5,2.35],[12.6,1.75],[14.3,0.85],[15.3,-0.2],[15.4,-0.95],[14.9,-1.6],[13.4,-2.1],[11.2,-2.35],[9,-2.7],[6.5,-3.0],[4,-2.85],[1.5,-2.45],[-1.2,-2.5]];
function handFrame(f){const dx=f.x2-f.x1,dy=f.y2-f.y1,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,sg=Math.sign(f.x1)||1;let nx=-uy,ny=ux;if(nx*sg<0){nx=-nx;ny=-ny;}
  const k=L/15;return {P:(u,v)=>[f.x1+ux*u*k+nx*v,f.y1+uy*u*k+ny*v],k};}
function handFront(c,f){const F=handFrame(f);let P=HANDF.map(q=>F.P(q[0],q[1]));{let A=0;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];A+=a[0]*b[1]-b[0]*a[1];}if(A<0)P=P.reverse();}
  const n=P.length,m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];let q=m(P[n-1],P[0]);c.moveTo(q[0],q[1]);for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n],mm=m(a,b);c.quadraticCurveTo(a[0],a[1],mm[0],mm[1]);}c.closePath();}
// skin detail on an edge-on hand: from the front the thumb lies along the index finger (pad against it, nail facing out);
// from the back you see the little-finger edge. Creases sit at the knuckles: MCP ≈ 55%, PIP ≈ 75%, DIP ≈ 90% of hand length
function handFrontDetail(s,tone,bk){
  for(const sd of ['near','far']){const seg=SEG[sd+'Hand'];if(!seg||!seg.connected||seg.gone||seg.part)continue;const f=FP.find(q=>q.id===sd+'Hand');if(!f)continue;const F=handFrame(f),P=F.P;
    const path=(pts)=>{s.beginPath();const a=pts.map(q=>P(q[0],q[1]));s.moveTo(a[0][0],a[0][1]);for(let i=1;i<a.length;i++)s.lineTo(a[i][0],a[i][1]);};
    const curve=(pts)=>{const a=pts.map(q=>P(q[0],q[1]));s.beginPath();s.moveTo(a[0][0],a[0][1]);s.quadraticCurveTo(a[1][0],a[1][1],a[2][0],a[2][1]);s.stroke();};
    s.lineCap='round';s.strokeStyle='rgba(90,45,35,.22)';s.lineWidth=0.16;
    curve([[0.2,-2.2],[0.6,0],[0.2,2.2]]);                                   // wrist crease
    {const g=P(7.6,2.4);const hg=s.createRadialGradient(g[0],g[1],0,g[0],g[1],1.4);hg.addColorStop(0,'rgba(255,240,226,.22)');hg.addColorStop(1,'rgba(255,240,226,0)');s.fillStyle=hg;s.beginPath();s.arc(g[0],g[1],1.4,0,6.28);s.fill();}
    if(!bk){
      // thumb: base at the thenar eminence, tip reaching about the index PIP joint
      const T=[[2.2,-1.1],[3.6,-0.2],[6,0.15],[8.6,0.2],[10.4,0.0],[11.3,-0.6],[11.1,-1.45],[10,-1.85],[7.6,-1.95],[5,-2.2],[3,-2.3]].map(q=>P(q[0],q[1]));
      s.beginPath();s.moveTo(T[0][0],T[0][1]);for(let i=1;i<T.length;i++){const a=T[i],b=T[(i+1)%T.length];s.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2);}s.closePath();
      s.fillStyle=rgb(tone,1.03);s.fill();s.strokeStyle='rgba(90,45,35,.3)';s.lineWidth=0.15;s.stroke();
      s.strokeStyle='rgba(90,45,35,.2)';curve([[8.0,-0.2],[8.2,-1],[8.0,-1.8]]);  // thumb IP crease
      {const nl=P(10.2,-0.55),dir=P(11.2,-0.55);const an=Math.atan2(dir[1]-nl[1],dir[0]-nl[0]);s.save();s.translate(nl[0],nl[1]);s.rotate(an);s.fillStyle='rgba(248,214,206,.85)';s.beginPath();s.ellipse(0,0,0.75,0.42,0,0,6.28);s.fill();s.strokeStyle='rgba(150,95,85,.35)';s.lineWidth=0.08;s.stroke();s.fillStyle='rgba(255,255,255,.4)';s.beginPath();s.ellipse(0.35,-0.05,0.2,0.12,0,0,6.28);s.fill();s.restore();}
      s.strokeStyle='rgba(90,45,35,.18)';s.lineWidth=0.14;curve([[11.6,1.8],[11.9,0.6],[11.6,-0.6]]);curve([[13.7,1.1],[13.9,0.2],[13.6,-0.7]]);   // index PIP, DIP
    }else{
      // little-finger edge: hypothenar pad, creases, the ulnar styloid bump at the wrist
      s.strokeStyle='rgba(90,45,35,.2)';s.lineWidth=0.14;curve([[11.9,1.7],[12.2,0.4],[11.8,-1.2]]);curve([[13.9,1.0],[14.1,0],[13.7,-1.0]]);curve([[9.2,2.4],[9.4,0],[9.0,-2.3]]);
      const st=P(-0.4,1.5),g2=s.createRadialGradient(st[0],st[1],0,st[0],st[1],1);g2.addColorStop(0,'rgba(255,240,226,.25)');g2.addColorStop(1,'rgba(255,240,226,0)');s.fillStyle=g2;s.beginPath();s.arc(st[0],st[1],1,0,6.28);s.fill();
      s.strokeStyle='rgba(90,45,35,.12)';s.lineWidth=0.2;path([[4,-2.4],[8.5,-2.5]]);s.stroke();}
  }}
function frontSilhouette(c){
  c.beginPath();
  for(const f of FP){
    const seg=SEG[f.id];if(!seg.connected)continue;
    if(f.t==='cap'&&!(seg.kind==='hand'&&!seg.part)){
      const ang=Math.atan2(f.y2-f.y1,f.x2-f.x1)-Math.PI/2,len=Math.hypot(f.x2-f.x1,f.y2-f.y1);const ph=Math.asin(clamp((f.r1-f.r2)/len,-1,1)),th=Math.PI/2;
      const ca=Math.cos(ang),sa=Math.sin(ang);const pt=(x,y)=>[f.x1+x*ca-y*sa,f.y1+x*sa+y*ca];
      const N=10;const pts=[];
      // after a decapitation the neck ends flat at the cut instead of in a rounded cap
      const flat=f.id==='neck'&&!SEG.head.connected;
      for(let i=0;i<=N;i++){const a=th+Math.PI/2-ph+(Math.PI+2*ph)*i/N,yy=Math.sin(a)*f.r1;pts.push(pt(Math.cos(a)*f.r1,flat?Math.max(0,yy):yy));}
      for(let i=0;i<=N;i++){const a=th-Math.PI/2+ph+(Math.PI-2*ph)*i/N;pts.push(pt(Math.cos(a)*f.r2,len+Math.sin(a)*f.r2));}
      c.moveTo(pts[0][0],pts[0][1]);for(const p of pts)c.lineTo(p[0],p[1]);c.closePath();}
    else if(f.t==='ell'&&seg.kind==='foot')footFront(c,f);
    else if(f.t==='cap'&&seg.kind==='hand'&&!seg.part)handFront(c,f);
    else if(f.t==='ell'){c.moveTo(f.cx+f.rx,f.cy);c.ellipse(f.cx,f.cy,f.rx,f.ry,0,0,Math.PI*2);}
    else if(f.t==='torso'){const b=f.id==='chest'?breathAmt()*0.012:0;const ys=[];for(let y=f.y0;y<=f.y1+0.01;y+=1)ys.push(y);
      c.moveTo(torsoHW(ys[0])*(1+b),ys[0]);for(const y of ys)c.lineTo(torsoHW(y)*(1+b),y);for(let i=ys.length-1;i>=0;i--)c.lineTo(-torsoHW(ys[i])*(1+b),ys[i]);c.closePath();}
  }
}
function frontSpine(c){
  c.fillStyle=C.bone;for(let y=-157;y<-90;y+=2.6){const hw=y<-145?1.4:y<-110?1.7:2.1;c.fillRect(-hw,y,hw*2,2);c.fillStyle='#93a6cc';c.fillRect(-hw,y+2,hw*2,0.6);c.fillStyle=C.bone;if(view==='back'){c.beginPath();c.moveTo(-0.5,y+0.3);c.lineTo(0.5,y+0.3);c.lineTo(0,y+2.4);c.fill();if(y>-145&&y<-112){c.fillRect(-hw-1.2,y+0.6,1.2,0.7);c.fillRect(hw,y+0.6,1.2,0.7);}}}
  if(view==='back'){c.strokeStyle='#e3c96a';c.lineWidth=0.5;c.beginPath();c.moveTo(0,-157);c.lineTo(0,-92);c.stroke();}
}
function drawFrontMuscles(c,torso){
  // pectorals, abdominals, deltoids, quads and calves seen from the front
  const bk=view==='back';c.save();
  const belly=(x,y,rx,ry,rot,col)=>{c.save();c.translate(x,y);c.rotate(rot||0);c.beginPath();c.moveTo(0,-ry);c.quadraticCurveTo(rx*1.25,0,0,ry);c.quadraticCurveTo(-rx*1.25,0,0,-ry);const g=c.createLinearGradient(-rx,0,rx,0);g.addColorStop(0,'#7a2228');g.addColorStop(0.5,col||'#b0444a');g.addColorStop(1,'#7e252b');c.fillStyle=g;c.fill();
    c.strokeStyle='rgba(255,200,190,.18)';c.lineWidth=0.15;for(let k=-2;k<=2;k++){c.beginPath();c.moveTo(k*rx*0.3,-ry*0.85);c.quadraticCurveTo(k*rx*0.42,0,k*rx*0.3,ry*0.85);c.stroke();}c.restore();};
  if(!torso){}else if(!bk){for(const sg of [1,-1]){belly(sg*7,-136,6.2,4.3,sg*0.5);belly(sg*17,-140,3.2,5,sg*-0.3);for(let i=0;i<4;i++)belly(sg*2.4,-123+i*5.2,2.2,2.3,0,'#a63b42');belly(sg*8.2,-115,2.5,9,sg*-0.18);}
    c.strokeStyle='rgba(240,230,215,.55)';c.lineWidth=0.4;c.beginPath();c.moveTo(0,-131);c.lineTo(0,-96);c.stroke();}
  else if(torso){for(const sg of [1,-1]){belly(sg*6,-138,6,7,sg*0.6,'#a8404a');belly(sg*9,-122,4,8,sg*0.2);belly(sg*3,-110,2.4,10,0);belly(sg*6,-91,6,5.5,0,'#a33c45');}}
  for(const f of FP){if(f.t!=='cap')continue;const seg=SEG[f.id];if(!seg||!seg.connected||seg.kind==='neck')continue;const mx=(f.x1+f.x2)/2,my=(f.y1+f.y2)/2,len=Math.hypot(f.x2-f.x1,f.y2-f.y1),ang=Math.atan2(f.y2-f.y1,f.x2-f.x1)-Math.PI/2,rr=(f.r1+f.r2)/2;
    if(['uarm','farm','thigh','shin'].includes(seg.kind)){belly(mx-Math.cos(ang)*rr*0.3,my-Math.sin(ang)*rr*0.3,rr*0.42,len*0.42,ang);belly(mx+Math.cos(ang)*rr*0.32,my+Math.sin(ang)*rr*0.32,rr*0.38,len*0.4,ang,'#a73e45');}}
  c.restore();
}
function drawFrontPelvis(c){
  c.save();c.fillStyle='rgba(236,227,203,.7)';c.strokeStyle='#a8987a';c.lineWidth=0.2;
  for(const sg of [1,-1]){c.beginPath();c.moveTo(sg*1.5,-99);c.quadraticCurveTo(sg*15,-104,sg*14.5,-96);c.quadraticCurveTo(sg*12,-90,sg*8.5,-88);c.quadraticCurveTo(sg*6,-84.5,sg*1.6,-85.5);c.quadraticCurveTo(sg*4,-92,sg*1.5,-99);c.fill();c.stroke();
    c.fillStyle='rgba(60,30,30,.6)';c.beginPath();c.ellipse(sg*5.2,-87.5,1.6,1.3,0,0,6.28);c.fill();c.fillStyle='rgba(236,227,203,.7)';
    c.beginPath();c.arc(sg*9.6,-91,1.9,0,6.28);c.fill();c.stroke();}
  c.beginPath();c.moveTo(-3,-99);c.lineTo(3,-99);c.lineTo(1.4,-90);c.lineTo(-1.4,-90);c.closePath();c.fill();c.stroke();
  c.restore();
}
/* ---------- front / back anatomy ---------- */
function fpart(id){const f=FP.find(q=>q.id===id);const g=SEG[id];return f&&g&&g.connected&&!g.gone?f:null;}
function capPt(f,t,u,sg){const x=lerp(f.x1,f.x2,t),y=lerp(f.y1,f.y2,t),r=lerp(f.r1,f.r2,clamp(t,0,1));const dx=f.x2-f.x1,dy=f.y2-f.y1,L=Math.hypot(dx,dy)||1;return[x+dy/L*u*sg*r,y-dx/L*u*sg*r];}
function smoothBlob(c,pts){const n=pts.length;c.beginPath();for(let i=0;i<=n;i++){const p=pts[i%n],q=pts[(i+1)%n],mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2;if(i===0)c.moveTo(mx,my);else c.quadraticCurveTo(p[0],p[1],mx,my);}c.closePath();}
function muscleShape(c,pts,fib,col){smoothBlob(c,pts);let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const p of pts){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);}
  const g=c.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,col||'#a43c44');g.addColorStop(0.5,'#c35860');g.addColorStop(1,'#8c2b33');c.fillStyle=g;c.fill();
  c.save();c.clip();c.strokeStyle='rgba(255,205,195,.26)';c.lineWidth=0.13;const fa=fib==null?Math.PI/2:fib,cx=(x0+x1)/2,cy=(y0+y1)/2,R=Math.max(x1-x0,y1-y0);
  for(let k=-10;k<=10;k++){const ox=Math.cos(fa+Math.PI/2)*k*R/14,oy=Math.sin(fa+Math.PI/2)*k*R/14;c.beginPath();c.moveTo(cx+ox-Math.cos(fa)*R,cy+oy-Math.sin(fa)*R);c.lineTo(cx+ox+Math.cos(fa)*R,cy+oy+Math.sin(fa)*R);c.stroke();}
  c.fillStyle='rgba(255,230,220,.10)';c.fillRect(x0,y0,(x1-x0)*0.4,y1-y0);c.restore();
  smoothBlob(c,pts);c.strokeStyle='rgba(70,10,18,.6)';c.lineWidth=0.16;c.stroke();}
function tendon(c,pts,w){c.strokeStyle='rgba(236,230,214,.9)';c.lineWidth=w||0.5;c.lineCap='round';c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();}
function limbMuscle(c,f,sg,tu,fib,col){if(!f)return;const pts=tu.map(([t,u])=>capPt(f,t,u,sg));const ang=Math.atan2(f.y2-f.y1,f.x2-f.x1);muscleShape(c,pts,fib==null?ang:ang+fib,col);}
function drawFrontMusclesFull(c,bk){
  for(const sg of [1,-1]){const sd=sg>0?'near':'far',ua=fpart(sd+'UpperArm'),fa=fpart(sd+'Forearm'),hd=fpart(sd+'Hand'),th=fpart(sd+'Thigh'),sh=fpart(sd+'Shin');
    if(!bk){
      // neck and chest
      muscleShape(c,[[sg*2.6,-152.5],[sg*4.8,-150],[sg*15.5,-144.4],[sg*16.6,-142.6],[sg*7,-144.8],[sg*3,-147]],Math.PI*0.06*sg);
      muscleShape(c,[[sg*5.6,-158],[sg*6.6,-156.5],[sg*2.4,-143.6],[sg*1,-144.2]],sg>0?2.05:1.09,'#a9424a');
      muscleShape(c,[[sg*1.4,-143.4],[sg*8,-144.6],[sg*15.6,-142.4],[sg*18.2,-138.6],[sg*16.4,-135.5],[sg*11,-130.4],[sg*4.6,-129.6],[sg*1.4,-131.5]],sg>0?0.25:-0.25+Math.PI);
      for(let i=0;i<3;i++)muscleShape(c,[[sg*11.8,-129.6+i*3.4],[sg*15.4,-131+i*3.4],[sg*15.6,-128.4+i*3.4],[sg*12.4,-127.4+i*3.4]],0.4*sg,'#a03a42');
      // abdomen: six-pack, obliques
      for(let i=0;i<3;i++){const y0=-127.6+i*7.4;muscleShape(c,[[sg*0.65,y0],[sg*4.8,y0-0.4],[sg*5.1,y0+6.6],[sg*0.65,y0+6.8]],Math.PI/2);}
      muscleShape(c,[[sg*0.65,-105.4],[sg*4.9,-105.6],[sg*4.2,-96],[sg*2.4,-87.2],[sg*0.65,-86.8]],Math.PI/2);
      muscleShape(c,[[sg*5.6,-126],[sg*13.6,-128.6],[sg*15.4,-118],[sg*15.6,-104],[sg*14,-96],[sg*9,-91.4],[sg*5.4,-100]],sg>0?1.1:2.04,'#a8424a');
      // arms
      limbMuscle(c,ua,sg,[[-0.13,-0.7],[-0.14,0.9],[0.12,1.2],[0.45,0.55],[0.4,-0.25],[0.1,-0.9]],0);
      limbMuscle(c,ua,sg,[[0.22,-0.5],[0.3,0.5],[0.62,0.62],[0.88,0.25],[0.9,-0.28],[0.6,-0.68]],0);
      limbMuscle(c,ua,sg,[[0.25,-1],[0.55,-0.95],[0.88,-0.8],[0.6,-0.62]],0,'#8f2f37');
      limbMuscle(c,fa,sg,[[0,0.35],[-0.02,1],[0.42,0.95],[0.66,0.45],[0.4,0.2]],0,'#b14850');
      limbMuscle(c,fa,sg,[[0.02,-1],[0.04,0.25],[0.5,0.02],[0.66,-0.6]],0);
      if(fa){for(const u of [-0.5,-0.15,0.2])tendon(c,[capPt(fa,0.6,u,sg),capPt(fa,1.02,u*0.8,sg)],0.35);}
      if(hd){muscleShape(c,[capPt(hd,0.1,0.95,sg),capPt(hd,0.35,0.9,sg),capPt(hd,0.4,0.2,sg),capPt(hd,0.12,0.25,sg)],null,'#a9424a');for(const u of [-0.6,-0.2,0.2,0.6])tendon(c,[capPt(hd,0.2,u*0.7,sg),capPt(hd,0.95,u,sg)],0.22);}
      // legs
      limbMuscle(c,th,sg,[[0.0,0.9],[0.08,1.05],[0.6,1.0],[0.92,0.62],[0.72,0.35],[0.2,0.55]],0,'#ad444c');
      limbMuscle(c,th,sg,[[0.04,0.1],[0.12,0.55],[0.6,0.46],[0.9,0.16],[0.88,-0.16],[0.5,-0.22]],0);
      limbMuscle(c,th,sg,[[0.55,-0.62],[0.7,-0.2],[0.93,-0.04],[0.99,-0.48],[0.86,-0.86]],0,'#b44b53');
      limbMuscle(c,th,sg,[[0,-0.98],[-0.02,-0.25],[0.46,-0.52],[0.56,-0.96]],0,'#963540');
      if(th){c.strokeStyle='rgba(205,105,105,.95)';c.lineWidth=1.0;c.beginPath();const a=capPt(th,0.03,0.88,sg),b=capPt(th,0.5,0,sg),e=capPt(th,0.98,-0.8,sg);c.moveTo(a[0],a[1]);c.quadraticCurveTo(b[0],b[1],e[0],e[1]);c.stroke();
        tendon(c,[capPt(th,0.97,0,sg),capPt(th,1.06,0,sg)],1.3);}
      limbMuscle(c,sh,sg,[[0.06,0.15],[0.1,0.78],[0.55,0.6],[0.82,0.22],[0.5,0.02]],0);
      limbMuscle(c,sh,sg,[[0.05,-0.98],[0.06,-0.42],[0.42,-0.55],[0.52,-0.98]],0,'#953742');
      limbMuscle(c,sh,sg,[[0.12,0.86],[0.62,0.95],[0.86,0.6],[0.5,0.62]],0,'#a33e47');
      if(sh)tendon(c,[capPt(sh,0.8,0.18,sg),capPt(sh,1.05,0.05,sg)],0.45);
    }else{
      // back: trapezius, lats, glutes, hamstrings, calves
      muscleShape(c,[[0,-156],[sg*4.2,-152],[sg*16.4,-143.6],[sg*13,-138.4],[sg*6,-128],[0,-117.6]],sg>0?2.6:0.55,'#ab434b');
      muscleShape(c,[[sg*5.6,-139.4],[sg*12.6,-140.6],[sg*14.2,-133],[sg*8,-130.4]],0.15*sg,'#a03a42');
      muscleShape(c,[[sg*3.6,-123],[sg*12.6,-132],[sg*16,-124],[sg*14.6,-110],[sg*8.4,-100.6],[sg*1.6,-98.4]],sg>0?0.9:2.24);
      muscleShape(c,[[sg*0.7,-127],[sg*3.8,-127],[sg*4.6,-100],[sg*3,-93],[sg*0.7,-93]],Math.PI/2,'#9b3841');
      muscleShape(c,[[sg*3.4,-97.6],[sg*13.8,-99.6],[sg*15.6,-92.4],[sg*10,-90.6],[sg*4,-93]],0.2*sg,'#a3404a');
      muscleShape(c,[[sg*0.8,-92.4],[sg*11.8,-94.4],[sg*15,-86],[sg*13.4,-78.6],[sg*6.4,-76.6],[sg*0.8,-79.6]],sg>0?0.5:2.64,'#b9505a');
      limbMuscle(c,ua,sg,[[-0.13,-0.6],[-0.12,0.95],[0.15,1.15],[0.4,0.5],[0.3,-0.4]],0.2);
      limbMuscle(c,ua,sg,[[0.18,-0.75],[0.16,0.8],[0.62,0.95],[0.92,0.35],[0.85,-0.3],[0.5,-0.9]],0);
      limbMuscle(c,fa,sg,[[0.02,-0.9],[0.02,0.95],[0.5,0.7],[0.68,0.05],[0.5,-0.6]],0,'#a6424a');
      if(fa){for(const u of [-0.4,0,0.4])tendon(c,[capPt(fa,0.62,u,sg),capPt(fa,1.02,u*0.8,sg)],0.32);}
      limbMuscle(c,th,sg,[[0.12,-0.88],[0.1,0.88],[0.66,0.72],[0.96,0.25],[0.96,-0.3],[0.66,-0.82]],0);
      if(th){c.strokeStyle='rgba(60,10,16,.55)';c.lineWidth=0.25;c.beginPath();const a=capPt(th,0.2,0,sg),b=capPt(th,0.92,0,sg);c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();}
      limbMuscle(c,sh,sg,[[0.28,-0.92],[0.28,0.92],[0.74,0.5],[0.74,-0.5]],0,'#8f3139');
      limbMuscle(c,sh,sg,[[0.02,-0.98],[0.03,-0.04],[0.46,-0.2],[0.56,-0.78]],0,'#b44b53');
      limbMuscle(c,sh,sg,[[0.02,0.98],[0.03,0.04],[0.42,0.2],[0.5,0.78]],0,'#aa444c');
      if(sh)tendon(c,[capPt(sh,0.62,0,sg),capPt(sh,1.04,0,sg)],1.1);
    }}
  if(!bk){c.strokeStyle='rgba(240,232,218,.7)';c.lineWidth=0.45;c.beginPath();c.moveTo(0,-129);c.lineTo(0,-87);c.stroke();}
  else{c.strokeStyle='rgba(240,232,218,.55)';c.lineWidth=0.9;c.beginPath();c.moveTo(0,-155);c.lineTo(0,-117);c.stroke();c.fillStyle='rgba(236,226,206,.55)';c.beginPath();c.moveTo(-3,-104);c.lineTo(3,-104);c.lineTo(1.5,-92);c.lineTo(-1.5,-92);c.fill();}
}
// full skeleton seen from the front or the back
function drawPlatesFront(c){
  for(const b of BONES){if(!b.plates||!b.seg||!b.seg.connected)continue;const g=b.seg,f=fpOf(g);
    for(const pl of b.plates){let x,y,ang=Math.PI/2,L=4;
      if(f&&f.t==='cap'){const t=clamp(fpT(g,pl.s),0,1);x=lerp(f.x1,f.x2,t);y=lerp(f.y1,f.y2,t);ang=Math.atan2(f.y2-f.y1,f.x2-f.x1);x+=Math.sign(x||1)*0.9;}
      else if(b.id==='pelvis'){x=6;y=-90;L=2.2;ang=0.3;}else if(b.id==='skull'){x=3;y=-172;L=2;ang=0;}else if(b.spine){x=1.2;y=g.rest.ay+pl.s;}else{const q=frontPos(g,pl.s,0);if(!q)continue;x=q.x;y=q.y;}
      c.save();c.translate(x,y);c.rotate(ang-Math.PI/2);const gr=c.createLinearGradient(-0.4,0,0.4,0);gr.addColorStop(0,'#8a949c');gr.addColorStop(0.5,'#eef3f6');gr.addColorStop(1,'#7b858d');c.fillStyle=gr;
      c.beginPath();c.roundRect?c.roundRect(-0.4,-L,0.8,2*L,0.35):c.rect(-0.4,-L,0.8,2*L);c.fill();c.strokeStyle='#4c555c';c.lineWidth=0.07;c.stroke();
      for(let yy=-L+0.8;yy<L-0.4;yy+=1.6){c.fillStyle='#d5dce1';c.beginPath();c.arc(0,yy,0.25,0,6.28);c.fill();c.strokeStyle='#5d666d';c.lineWidth=0.06;c.beginPath();c.moveTo(-0.16,yy);c.lineTo(0.16,yy);c.stroke();}
      c.restore();}}}
function drawFrontSkeleton(c,bk,part){
  const bc='#ece3cb',be='rgba(150,135,105,.9)',cart='rgba(214,200,226,.9)';
  const B=(pts,f)=>{smoothBlob(c,pts);c.fillStyle=f||bc;c.fill();c.strokeStyle=be;c.lineWidth=0.14;c.stroke();};
  const E=(x,y,rx,ry,rot,f)=>{c.beginPath();c.ellipse(x,y,rx,ry,rot||0,0,6.28);c.fillStyle=f||bc;c.fill();c.strokeStyle=be;c.lineWidth=0.14;c.stroke();};
  const S=(x0,y0,x1,y1,w,fa,fb)=>{shaft(c,x0,y0,x1,y1,w,fa||0.5,fb||0.5,0);};
  const base=part!=='cage',cage=part!=='base';
  if(base){
  // skull
  if(fpart('head')){
    B([[0,-175.4],[5.6,-173.6],[7.7,-168],[7.4,-162.2],[6,-157.6],[4.4,-155],[2,-152.8],[0,-152.4],[-2,-152.8],[-4.4,-155],[-6,-157.6],[-7.4,-162.2],[-7.7,-168],[-5.6,-173.6]],bk?bc:'rgba(236,227,203,.95)');
    if(!bk){c.fillStyle='rgba(30,18,20,.85)';for(const sg of [1,-1]){c.beginPath();c.ellipse(sg*3.1,-164.4,2.1,1.75,sg*-0.1,0,6.28);c.fill();}
      c.beginPath();c.moveTo(0,-162.3);c.lineTo(1.2,-159);c.lineTo(0,-158.4);c.lineTo(-1.2,-159);c.closePath();c.fill();
      c.strokeStyle=be;c.lineWidth=0.25;for(const sg of [1,-1]){c.beginPath();c.moveTo(sg*5.6,-162);c.quadraticCurveTo(sg*7.2,-160.4,sg*6.4,-158.6);c.stroke();}
      const jd=SEG.head.jawDrop||0;c.save();c.translate(0,jd*6);
      B([[-5.6,-158.6],[-4.4,-154.6],[-2,-152.2],[0,-151.6],[2,-152.2],[4.4,-154.6],[5.6,-158.6],[4.6,-157.8],[3.4,-155.6],[0,-154.6],[-3.4,-155.6],[-4.6,-157.8]]);
      c.fillStyle='#f6f2e6';for(let i=-4;i<4;i++){c.fillRect(i*0.62+0.06,-155.9,0.5,0.85);}c.restore();
      c.fillStyle='#f6f2e6';for(let i=-4;i<4;i++)c.fillRect(i*0.62+0.06,-157.2,0.5,0.9);
      c.strokeStyle='rgba(150,135,105,.6)';c.lineWidth=0.15;c.beginPath();c.moveTo(-5,-171);c.quadraticCurveTo(0,-173.4,5,-171);c.stroke();}
    else{c.strokeStyle='rgba(150,135,105,.7)';c.lineWidth=0.18;c.beginPath();c.moveTo(0,-175);c.lineTo(0,-165);c.moveTo(-6.8,-163);c.quadraticCurveTo(0,-170,6.8,-163);c.stroke();c.fillStyle='rgba(40,20,22,.5)';c.beginPath();c.ellipse(0,-155,1.2,0.8,0,0,6.28);c.fill();}
    for(const m of BN('skull').marks||[]){const x=clamp(m.z,-1,1)*6,y=-163.5+(m.s-0.6)*1.05;c.fillStyle='rgba(110,20,25,.55)';c.beginPath();c.arc(x,y,1.1,0,6.28);c.fill();c.fillStyle='#1c0306';c.beginPath();c.arc(x,y,0.55,0,6.28);c.fill();}
    if(BN('skull').broken&&BN('skull').crack){const k=BN('skull').crack,x=clamp(k.z,-1,1)*5.5,y=-163.5+(k.s-0.6)*1.05;c.strokeStyle='rgba(40,8,12,.95)';c.lineWidth=0.35;c.beginPath();c.moveTo(x,y);c.lineTo(x-1.6,y-2);c.lineTo(x-0.8,y-3.6);c.moveTo(x,y);c.lineTo(x+2,y-0.8);c.lineTo(x+2.8,y+1.2);c.moveTo(x,y);c.lineTo(x+0.4,y+2.4);c.stroke();}
    else if(BN('skull').broken){c.strokeStyle='rgba(40,8,12,.95)';c.lineWidth=0.35;c.beginPath();c.moveTo(-4,-172);c.lineTo(-2,-169);c.lineTo(-3,-166);c.lineTo(-0.5,-164);c.moveTo(-2,-169);c.lineTo(1,-170.5);c.stroke();}}
  if(!bk)for(const sg of [1,-1]){c.save();c.globalAlpha=0.45;B([[sg*5,-142.6],[sg*15,-143.4],[sg*15.4,-140],[sg*7.4,-127.6],[sg*5.6,-130]]);c.restore();}
  // spine
  for(let i=0;i<24;i++){const y=-152+i*2.55,cerv=i<7,lum=i>=19,hw=cerv?1.1:lum?2.4:1.6;
    c.fillStyle=bc;c.beginPath();c.roundRect?c.roundRect(-hw,y,hw*2,1.95,0.4):c.rect(-hw,y,hw*2,1.95);c.fill();c.strokeStyle=be;c.lineWidth=0.12;c.stroke();
    c.fillStyle='#a9b8d8';c.fillRect(-hw*0.85,y+1.95,hw*1.7,0.55);
    if(lum||bk||cerv){c.fillStyle=bc;c.fillRect(-hw-(lum?2.4:1.2),y+0.6,(lum?2.4:1.2),0.7);c.fillRect(hw,y+0.6,(lum?2.4:1.2),0.7);}
    if(bk){c.beginPath();c.moveTo(-0.6,y+0.4);c.lineTo(0.6,y+0.4);c.lineTo(0,y+2.6);c.closePath();c.fillStyle=bc;c.fill();}}
  if(XL('nerves')){c.strokeStyle='rgba(227,201,106,.9)';c.lineWidth=0.5;c.beginPath();c.moveTo(0,-153);c.lineTo(0,-96);c.stroke();}
  for(const id of ['cervical','thoracic','lumbar']){const b=BN(id);if(!b)continue;const seg=b.seg;const y0=seg.rest.ay;
    for(const m of b.marks||[]){const y=y0+m.s;c.fillStyle='#1c0306';c.beginPath();c.arc(clamp(m.z,-1,1)*1.2,y,0.5,0,6.28);c.fill();}
    if(b.broken){const p0=b.pts[0][0],p1=b.pts[b.pts.length-1][0];fractureMark(c,0,y0+lerp(p0,p1,b.bp),id==='lumbar'?3.2:2.4,0.15);}}
  }
  if(cage){
  // shoulder girdle
  for(const sg of [1,-1]){
    c.strokeStyle=be;c.lineWidth=1.3;c.lineCap='round';c.beginPath();c.moveTo(sg*1.6,-143.4);c.bezierCurveTo(sg*6,-145.6,sg*10,-142.6,sg*16.6,-144.4);c.stroke();c.strokeStyle=bc;c.lineWidth=1.05;c.stroke();
    const sca=[[sg*5,-142.6],[sg*15,-143.4],[sg*15.4,-140],[sg*7.4,-127.6],[sg*5.6,-130]];
    if(bk){c.save();c.globalAlpha=1;B(sca);if(bk){c.strokeStyle=be;c.lineWidth=0.45;c.beginPath();c.moveTo(sg*5.6,-139);c.lineTo(sg*15.6,-142.4);c.stroke();}c.restore();}}
  // ribs
  const rbl=SEG.chest.ribBreaks||[];const rbx=new Set(rbl.map(q=>q.i+':'+(q.z>=0?1:-1)));for(let k=0;rbx.size<(SEG.chest.ribsBroken||0)&&k<12;k++)rbx.add(k+':1');
  for(let i=0;i<12;i++){const ys=-141.6+i*2.35;
    for(const sg of [1,-1]){const hw=torsoHW(ys+4)*0.93,br=rbx.has(i+':'+sg);
      if(!bk){c.save();c.globalAlpha=0.38;c.strokeStyle=bc;c.lineWidth=0.55;c.beginPath();c.moveTo(sg*1.8,ys-1.2);c.quadraticCurveTo(sg*hw*0.8,ys-2,sg*hw,ys+3);c.stroke();c.restore();}
      if(i<10){const ce=i<7?[sg*(2.8+i*0.75),ys+0.8+i*0.25]:[sg*(6.8+(i-7)*1.4),ys+0.6];
        if(!bk){c.strokeStyle=cart;c.lineWidth=0.7;c.beginPath();c.moveTo(i<7?sg*1.3:sg*(5.8+(i-7)*0.4),i<7?ys:ys-2.2-(i-7)*0.8);c.lineTo(ce[0],ce[1]);c.stroke();}
        c.strokeStyle=br?'rgba(236,227,203,.4)':bc;c.lineWidth=0.75;c.beginPath();if(bk){c.moveTo(sg*1.8,ys-1.2);c.quadraticCurveTo(sg*hw*0.75,ys-2.4,sg*hw,ys+2.5);c.quadraticCurveTo(sg*hw*1.02,ys+4.6,sg*hw*0.92,ys+6);}
        else{c.moveTo(ce[0],ce[1]);c.bezierCurveTo(sg*hw*0.65,ys+2.8,sg*hw*1.02,ys+3.6,sg*hw*0.98,ys+1.4);}c.stroke();
        c.strokeStyle='rgba(150,135,105,.55)';c.lineWidth=0.12;c.stroke();
        if(br)fractureMark(c,sg*hw*0.72,ys+2.6,1.1,sg*0.5);}
      else{c.strokeStyle=bc;c.lineWidth=0.6;c.beginPath();c.moveTo(sg*2,ys-1);c.quadraticCurveTo(sg*hw*0.6,ys-0.8,sg*hw*0.86,ys+2.6);c.stroke();}}}
  if(!bk){B([[-1.6,-143.6],[1.6,-143.6],[2,-140.4],[1.1,-138.6],[-1.1,-138.6],[-2,-140.4]]);B([[-1.2,-138.2],[1.2,-138.2],[1.4,-125],[0.6,-123.8],[-0.6,-123.8],[-1.4,-125]]);B([[-0.6,-123.6],[0.6,-123.6],[0,-121.2]]);}
  }
  if(base){
  // pelvis and sacrum
  for(const sg of [1,-1]){B([[sg*2.4,-100.4],[sg*8,-104.6],[sg*14.2,-101.4],[sg*14.8,-97],[sg*12.6,-92.6],[sg*10.2,-89],[sg*7.6,-87],[sg*4.4,-85.4],[sg*1.2,-85.6],[sg*1.4,-87.6],[sg*5.4,-90.2],[sg*5.8,-94],[sg*3.2,-96.4]],'rgba(236,227,203,.94)');
    c.fillStyle='rgba(40,22,26,.75)';c.beginPath();c.ellipse(sg*5.4,-87.6,1.55,1.25,sg*0.3,0,6.28);c.fill();
    c.strokeStyle='rgba(150,135,105,.6)';c.lineWidth=0.4;c.beginPath();c.arc(sg*8.6,-90,2.2,0,6.28);c.stroke();}
  B([[-2.6,-99.6],[2.6,-99.6],[2.1,-92],[0.7,-88.6],[-0.7,-88.6],[-2.1,-92]],'#e2d8bc');
  c.fillStyle='rgba(60,35,35,.55)';for(let i=0;i<4;i++)for(const sg of [1,-1]){c.beginPath();c.arc(sg*1.1,-98+i*2.1,0.35,0,6.28);c.fill();}
  for(const m of BN('pelvis').marks||[]){const x=clamp(m.z,-1,1)*10,y=-111+m.s*0.9;c.fillStyle='#1c0306';c.beginPath();c.arc(x,y,0.6,0,6.28);c.fill();}
  if(BN('pelvis').broken){const k=BN('pelvis').crack,x=k?clamp(k.z,-1,1)*10:-8.6,y=k?-111+k.s*0.9:-97;fractureMark(c,x,y,1.6,0.8);}
  // limbs
  const brk=(f,id)=>{const g=SEG[id];if(!g)return;const sg=f.x1>0?1:-1;const all=[...g.bones];for(const q of segs)if(q!==g&&q.id.startsWith(id+'X'))all.push(...q.bones);
    for(const b of all){if(!b.pts)continue;const L0=(b.fs1-b.fs0)||g.len;for(const m of b.marks||[]){const p=capPt(f,clamp((m.s-b.fs0)/L0,0,1),clamp(m.z,-1,1)*0.25,sg);c.fillStyle='rgba(110,20,25,.55)';c.beginPath();c.arc(p[0],p[1],0.9,0,6.28);c.fill();c.fillStyle='#1c0306';c.beginPath();c.arc(p[0],p[1],0.45,0,6.28);c.fill();}
      if(b.broken&&(b.off||0)<0.01){const sv=lerp(b.fs0,b.fs1,b.bp);const p=capPt(f,clamp((sv-b.fs0)/L0,0,1),0,sg);fractureMark(c,p[0],p[1],1.7,0.4+sg*0.2);}}};
  for(const sg of [1,-1]){const sd=sg>0?'near':'far',ua=fpart(sd+'UpperArm'),fa=fpart(sd+'Forearm'),hd=fpart(sd+'Hand'),th=fpart(sd+'Thigh'),sh=fpart(sd+'Shin');
    if(ua){const a=capPt(ua,0.06,-0.05,sg),b=capPt(ua,0.96,0,sg);E(a[0],a[1]-0.4,1.9,1.9);S(a[0],a[1]+1,b[0],b[1]-0.6,1.25,0.6,0.9);const k=capPt(ua,1,0,sg);E(k[0],k[1],2.0,1.0);brk(ua,sd+'UpperArm');}
    if(fa){const r0=capPt(fa,0.03,0.35,sg),r1=capPt(fa,0.97,0.45,sg),u0=capPt(fa,0.02,-0.35,sg),u1=capPt(fa,0.97,-0.25,sg);S(u0[0],u0[1],u1[0],u1[1],0.62,1,0.6);S(r0[0],r0[1]+0.4,r1[0],r1[1],0.68,0.5,1.4);brk(fa,sd+'Forearm');}
    if(hd){for(let i=0;i<8;i++){const p=capPt(hd,0.05+Math.floor(i/4)*0.09,-0.75+(i%4)*0.5,sg);E(p[0],p[1],0.42,0.4);}
      for(let d=0;d<5;d++){const u=d===0?0.95:-0.75+(d-1)*0.5,t0=d===0?0.18:0.24;const m0=capPt(hd,t0,u*0.7,sg),m1=capPt(hd,d===0?0.42:0.55,u*(d===0?1.15:0.85),sg);S(m0[0],m0[1],m1[0],m1[1],0.34,0.5,0.6);
        let tp=d===0?0.45:0.58;for(const len of d===0?[0.17,0.14]:[0.17,0.12,0.09]){const p0=capPt(hd,tp,u*(d===0?1.2:0.88),sg),p1=capPt(hd,tp+len,u*(d===0?1.3:0.9),sg);S(p0[0],p0[1],p1[0],p1[1],0.27,0.4,0.4);tp+=len+0.015;}}}
    if(th){const hip=[sg*8.4,-90],gt=capPt(th,0.06,0.95,sg),kn=capPt(th,0.95,0,sg);E(hip[0],hip[1],1.85,1.85);S(hip[0]+sg*0.6,hip[1]+0.4,gt[0]-sg*0.4,gt[1],1.15,0.3,0.3);E(gt[0],gt[1],1.2,1.5);
      S(gt[0]-sg*0.6,gt[1]+1,kn[0],kn[1]-1,1.55,0.5,1.0);B([[kn[0]-2.3,kn[1]-1.2],[kn[0]+2.3,kn[1]-1.2],[kn[0]+2.1,kn[1]+1.2],[kn[0]-2.1,kn[1]+1.2]]);if(!bk)E(kn[0],kn[1]-0.4,1.25,1.5,0,'#e7dcc0');brk(th,sd+'Thigh');}
    if(sh){const t0=capPt(sh,0.03,-0.1,sg),t1=capPt(sh,0.96,-0.25,sg),f0=capPt(sh,0.06,0.72,sg),f1=capPt(sh,0.99,0.72,sg);
      S(f0[0],f0[1],f1[0],f1[1],0.5,0.9,1.2);B([[t0[0]-2.1,t0[1]-0.6],[t0[0]+2.2,t0[1]-0.6],[t0[0]+1.6,t0[1]+1.6],[t0[0]-1.6,t0[1]+1.6]]);S(t0[0],t0[1]+1.4,t1[0],t1[1],1.2,0.4,0.8);E(t1[0]-sg*0.2,t1[1]+0.3,0.75,0.9);brk(sh,sd+'Shin');}
    const ft=fpart(sd+'Foot');if(ft){const x=ft.cx,y=ft.cy;E(x,y-1.4,1.6,1.0);for(let i=0;i<5;i++){const dx=(i-2)*0.85;S(x+dx*0.6,y-0.6,x+dx,y+1.2,0.36,0.4,0.5);S(x+dx,y+1.4,x+dx*1.05,y+2.6,0.3,0.3,0.3);}}}
  }
}
// arteries and veins as a branching tree
function drawFrontVessels(c,bk,pulseOnly){
  if(pulseOnly){drawCutVesselPulse(c);return;}
  const line=(pts,col,w)=>{c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();};
  const A=(pts,w)=>{line(pts,'#7d0d16',w+0.25);line(pts,C.art,w);line(pts,'rgba(255,150,150,.45)',w*0.3);},Vn=(pts,w)=>{line(pts,'#222a6a',w+0.25);line(pts,C.vein,w);};
  c.save();c.globalAlpha=bk?0.75:1;
  // central
  Vn([[-1.6,-121],[-1.7,-131],[-1.6,-140],[-2.6,-144],[-3.4,-150],[-4,-158]],1.4);Vn([[-1.6,-121],[-1.4,-110],[-1.4,-94],[-2.6,-91]],1.3);Vn([[1.6,-144],[3.4,-150],[4,-158]],0.9);
  A([[1.6,-122],[1.4,-131],[0.6,-136],[-0.4,-139],[0.8,-140.8],[2.4,-139.4],[2.6,-131],[1.6,-120],[1.1,-104],[0.6,-93]],1.4);
  A([[0.2,-139.6],[-0.6,-143.4],[-2.6,-150],[-3.2,-157]],0.75);A([[1.2,-140.4],[2.6,-150],[3.2,-157]],0.75);
  for(const sg of [1,-1]){A([[sg*1.4,-140.4],[sg*8,-142.8],[sg*15,-142],[sg*18.6,-139]],0.6);Vn([[sg*1.8,-142.2],[sg*9,-144.6],[sg*16,-143],[sg*18.4,-140.8]],0.55);
    A([[0.6,-93],[sg*4.2,-90.6],[sg*7.2,-89]],0.95);Vn([[-1.4,-93],[sg*4,-89.6],[sg*7.6,-88]],0.95);
    A([[1.2,-108],[sg*6.6,-106.4]],0.45);A([[1.2,-112],[sg*3,-111]],0.35);}
  A([[1,-104],[2,-100],[1,-96]],0.4);
  // limbs
  for(const sg of [1,-1]){const sd=sg>0?'near':'far',ua=fpart(sd+'UpperArm'),fa=fpart(sd+'Forearm'),hd=fpart(sd+'Hand'),th=fpart(sd+'Thigh'),sh=fpart(sd+'Shin');
    const P_=(f,t,u)=>capPt(f,t,u,sg);
    if(ua){A([P_(ua,0,-0.4),P_(ua,0.5,-0.45),P_(ua,1,-0.25)],0.5);Vn([P_(ua,0,-0.6),P_(ua,1,-0.5)],0.45);Vn([P_(ua,0,0.75),P_(ua,0.5,0.8),P_(ua,1,0.55)],0.35);}
    if(fa){A([P_(fa,0,-0.2),P_(fa,1,0.45)],0.38);A([P_(fa,0,-0.3),P_(fa,1,-0.5)],0.36);Vn([P_(fa,0,0.6),P_(fa,1,0.55)],0.3);Vn([P_(fa,0,-0.7),P_(fa,1,-0.65)],0.3);}
    if(hd){A([P_(hd,0.12,0.5),P_(hd,0.3,0.2),P_(hd,0.3,-0.4)],0.25);for(const u of [-0.6,-0.2,0.2,0.6])A([P_(hd,0.3,u*0.7),P_(hd,0.9,u)],0.14);}
    if(th){A([[sg*7.2,-89],P_(th,0.1,-0.25),P_(th,0.55,-0.45),P_(th,0.98,-0.1)],0.7);A([P_(th,0.1,-0.25),P_(th,0.4,0.15)],0.4);Vn([[sg*7.6,-88],P_(th,0.1,-0.4),P_(th,0.55,-0.6),P_(th,0.98,-0.25)],0.7);Vn([P_(th,0,-0.8),P_(th,0.5,-0.85),P_(th,1,-0.75)],0.35);}
    if(sh){A([P_(sh,0,-0.1),P_(sh,0.55,0.2),P_(sh,1,0.1)],0.4);A([P_(sh,0,-0.1),P_(sh,1,-0.45)],0.36);Vn([P_(sh,0,-0.8),P_(sh,1,-0.6)],0.32);}
    const ft=fpart(sd+'Foot');if(ft){A([[ft.cx,ft.cy-2],[ft.cx,ft.cy+1.5]],0.25);}}
  c.restore();
}
function drawFrontNerves(c,bk){c.save();c.strokeStyle='rgba(227,201,106,.85)';c.lineCap='round';c.lineWidth=0.35;
  for(const sg of [1,-1]){const sd=sg>0?'near':'far',ua=fpart(sd+'UpperArm'),fa=fpart(sd+'Forearm'),th=fpart(sd+'Thigh'),sh=fpart(sd+'Shin');
    c.beginPath();c.moveTo(0,-148);c.quadraticCurveTo(sg*10,-146,sg*17,-141);if(ua){const a=capPt(ua,0.5,-0.2,sg),b=capPt(ua,1,-0.1,sg);c.lineTo(a[0],a[1]);c.lineTo(b[0],b[1]);}if(fa){const a=capPt(fa,1,0,sg);c.lineTo(a[0],a[1]);}c.stroke();
    c.beginPath();c.moveTo(sg*1.5,-96);c.lineTo(sg*6,-90);if(th){const a=capPt(th,0.5,bk?0:-0.1,sg),b=capPt(th,1,0,sg);c.lineTo(a[0],a[1]);c.lineTo(b[0],b[1]);}if(sh){const a=capPt(sh,1,0.2,sg);c.lineTo(a[0],a[1]);}c.lineWidth=bk?0.6:0.35;c.stroke();c.lineWidth=0.35;}
  c.restore();}
function drawFrontWounds(c){
  const bk=view==='back';
  for(const seg of segs){if(!seg.connected||seg.gone)continue;
    for(const wd of seg.wounds){if(!(wd.type==='hole'||wd.type==='cut')||wd.sut>=1||wd.graft||wd.ooze)continue;const cc=woundCenter(wd),rr=radS(seg,cc.s)||seg.ra;
      if(bk?cc.w>0.4*rr:cc.w<-0.4*rr)continue;const z=wd.z==null?0.85:wd.z;
      const p=wFix(wd,seg)||frontPos(seg,cc.s,z);if(!p)continue;
      if(wd.type==='cut'){const p1=frontPos(seg,wd.s,z),p2=frontPos(seg,wd.s2,z);if(!p1||!p2)continue;const sx=(wd.w2-wd.w)*0.35;
        {const x1=p1.x-sx,y1=p1.y,x2=p2.x+sx,y2=p2.y,L=Math.hypot(x2-x1,y2-y1),g=(wd.r+0.3)*clamp(0.55+L*0.06,0.6,1.5),sd=(wd.s*3.1+wd.w*1.7)%6;
        c.fillStyle='rgba(120,10,20,.45)';cutPath(c,x1,y1,x2,y2,g*1.5+0.3,0.3,sd);c.fill();c.fillStyle='#e0b06a';cutPath(c,x1,y1,x2,y2,g*1.05,0,sd);c.fill();
        c.fillStyle='#8a1c26';cutPath(c,x1,y1,x2,y2,g*0.8,0,sd);c.fill();c.fillStyle='#1c0205';cutPath(c,x1,y1,x2,y2,g*0.38,-0.05,sd);c.fill();}continue;}
      const r=Math.max(0.5,wd.r*1.05);const g=c.createRadialGradient(p.x,p.y,0,p.x,p.y,Math.min(r,2.5)*2.6);g.addColorStop(0,'rgba(110,0,14,.4)');g.addColorStop(1,'rgba(110,0,14,0)');c.fillStyle=g;c.beginPath();c.arc(p.x,p.y,Math.min(r,2.5)*2.6,0,6.28);c.fill();
      c.fillStyle='rgba(78,9,16,.55)';c.beginPath();for(let i=0;i<10;i++){const a=i/10*6.283+wd.rot,q=Math.min(2.2,r)*(1.0+0.3*Math.sin(i*2.9+wd.rot*5));i?c.lineTo(p.x+Math.cos(a)*q,p.y+Math.sin(a)*q):c.moveTo(p.x+Math.cos(a)*q,p.y+Math.sin(a)*q);}c.closePath();c.fill();
      // the bullet track itself is narrow (≈ 1 cm); what is around it stays visible through a large wound
      c.fillStyle='#120103';c.beginPath();c.arc(p.x,p.y,Math.min(1.1,r*0.4),0,6.28);c.fill();
      if(wd.boneOut&&!wd.boneOut.broken&&joints.includes(wd.boneOut)&&OPT.gore!==0){const o=Math.min(1.6,0.5+(wd.boneOut.fi?wd.boneOut.fi.out:0)*0.35);c.fillStyle='#ece2c8';c.strokeStyle='#a8977a';c.lineWidth=0.12;c.beginPath();
        for(let i=0;i<7;i++){const a=i/7*6.283+wd.rot,q=o*(i%2?0.55:1)*(0.8+0.2*Math.sin(i*3.1));i?c.lineTo(p.x+Math.cos(a)*q,p.y+Math.sin(a)*q*1.3):c.moveTo(p.x+Math.cos(a)*q,p.y+Math.sin(a)*q*1.3);}c.closePath();c.fill();c.stroke();
        c.fillStyle='#8a1a22';c.beginPath();c.arc(p.x,p.y,o*0.35,0,6.28);c.fill();}
      c.strokeStyle='rgba(225,130,130,.6)';c.lineWidth=0.12;for(let i=0;i<8;i++){const a=i/8*6.283+wd.rot;c.beginPath();c.moveTo(p.x+Math.cos(a)*r*1.3,p.y+Math.sin(a)*r*1.3);c.lineTo(p.x+Math.cos(a)*r*1.9,p.y+Math.sin(a)*r*1.9);c.stroke();}}}
}
// organ shapes for the front view, drawn back to front like an anatomy chart
function orgPath(c,pts){smoothBlob(c,pts);}
function drawFrontOrgans(c,bk){
  const ok=id=>ORG[id]&&!ORG[id].removed&&ORG[id].seg.connected&&!ORG[id].seg.gone&&!(ORG[id].out>=1||(ORG[id].out&&id!=='intest'));
  const shade=(x0,y0,x1,y1,a,b,cc)=>{const g=c.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,a);g.addColorStop(0.55,cc||a);g.addColorStop(1,b);return g;};
  const dmg=(id)=>{const o=ORG[id],f=FORG[id];drawOrgan(c,o,f[0],f[1],f[2],f[3],0,true,{zc:(o.z0+o.z1)/2,zr:(o.z1-o.z0)/2},true);};
  const coll=(id)=>{const o=ORG[id];return o.hp<60?0.55+0.45*clamp(o.hp/60,0,1):1;};
  c.save();c.lineJoin='round';c.lineCap='round';
  // kidneys, ureters, pancreas, spleen (deep)
  for(const [id,sg] of [['kidneyR',-1],['kidneyL',1]]){if(!ok(id))continue;const x=sg*8.7,y=-100.4;orgPath(c,[[x-sg*1.6,y-3.4],[x+sg*1.6,y-3.2],[x+sg*2.4,y],[x+sg*1.6,y+3.3],[x-sg*1.4,y+3.4],[x-sg*0.9,y+0.9],[x-sg*0.9,y-0.9]]);
    c.fillStyle=shade(x-2,y-3,x+2,y+3,'#a5403b','#6d1e22');c.fill();c.strokeStyle='rgba(60,10,12,.6)';c.lineWidth=0.15;c.stroke();
    c.strokeStyle='rgba(235,220,160,.75)';c.lineWidth=0.3;c.beginPath();c.moveTo(x-sg*1,y+1);c.quadraticCurveTo(sg*5.6,-92,sg*1.6,-88.4);c.stroke();dmg(id);}
  if(ok('spleen')){orgPath(c,[[10.6,-111.4],[12.6,-111.6],[13.4,-108],[12.6,-104.4],[11,-104.8],[10.8,-108]]);c.fillStyle=shade(10,-112,13,-104,'#83305a','#5a1e3c');c.fill();dmg('spleen');}
  if(ok('pancreas')){orgPath(c,[[-0.6,-102.6],[2,-103.6],[6,-103.4],[9.2,-103.6],[8.8,-102.2],[5,-101.4],[1,-100.8],[-0.8,-101.4]]);c.fillStyle='#e4b48a';c.fill();c.fillStyle='rgba(180,120,80,.45)';for(let i=0;i<9;i++){c.beginPath();c.arc(0.4+i*0.95,-102.3+Math.sin(i)*0.35,0.42,0,6.28);c.fill();}dmg('pancreas');}
  // intestines: coiled small bowel inside the frame of the large bowel (caecum, ascending, transverse, descending, sigmoid)
  if(ok('intest')){const left=1-0.6*(ORG.intest.out||0);
    c.save();c.beginPath();c.ellipse(0,-94.2,8.3,5.9,0,0,6.28);c.fillStyle='#8a4640';c.fill();c.clip();drawSmallBowel(c,0,-94.2+(1-left)*2.4,7.9,5.5*left,1.25,777,Math.max(2,Math.round(6*left)));c.restore();
    tube(c,[[-6.9,-87.4],[-6.6,-85.6],[-5.4,-84.9]],0.45,'#d99a8c','#7e3a34');
    colonPath(c,[[-7.2,-87.6],[-9.4,-90.6],[-9.9,-95],[-9.5,-99.6],[-7.6,-101.6],[-4,-100.2],[0,-98.4],[4,-99.8],[7.8,-102.4],[9.7,-100.4],[9.9,-95.6],[9.5,-91],[7.4,-88.6],[4.4,-89.6],[2.2,-88.2],[0.6,-86.2]],1.25);
    dmg('intest');}
  if(ok('bladder')){orgPath(c,[[-2.6,-88.8],[0,-89.6],[2.6,-88.8],[2.9,-86.4],[1.2,-85],[-1.2,-85],[-2.9,-86.4]]);c.fillStyle=shade(-3,-89,3,-85,'#e8bfa0','#c98f78');c.fill();c.fillStyle='rgba(255,245,230,.35)';ell(c,-1,-88,0.9,0.5);c.fill();dmg('bladder');}
  // stomach (J shape) under the left ribs
  if(ok('stomach')){orgPath(c,[[4.4,-112.4],[7.6,-113.4],[10.6,-111.2],[11.2,-106],[9.6,-101.4],[5.6,-100.2],[2.2,-101.4],[0.8,-103.2],[2.4,-104.2],[5,-105.4],[5.2,-108.2],[3.8,-110.4]]);
    c.fillStyle=shade(3,-113,11,-100,'#e6a59c','#c87e74','#efb2a8');c.fill();c.strokeStyle='rgba(140,60,55,.6)';c.lineWidth=0.18;c.stroke();
    c.save();c.clip();c.strokeStyle='rgba(170,80,75,.4)';c.lineWidth=0.18;for(let i=0;i<6;i++){c.beginPath();c.moveTo(4,-111+i*1.9);c.quadraticCurveTo(7.5,-110+i*1.9,11,-111.5+i*2.3);c.stroke();}c.restore();dmg('stomach');}
  // liver and gallbladder
  if(ok('liver')){orgPath(c,[[-13.4,-112],[-9,-114.4],[-3,-114.6],[2.4,-114],[6.6,-113.2],[9,-112.2],[7.6,-110.6],[3.4,-108.6],[-1,-106.6],[-6.4,-104.4],[-11,-103.6],[-13.4,-105.6],[-14,-109]]);
    c.fillStyle=shade(-14,-114,9,-104,'#94392f','#5c1917','#7a2a24');c.fill();c.strokeStyle='rgba(40,6,6,.6)';c.lineWidth=0.18;c.stroke();
    c.strokeStyle='rgba(40,6,6,.45)';c.lineWidth=0.2;c.beginPath();c.moveTo(-0.6,-114.4);c.quadraticCurveTo(-1.2,-110,-0.6,-106.8);c.stroke();
    c.fillStyle='rgba(255,220,210,.13)';ell(c,-7,-111.6,4,1.2,-0.15);c.fill();dmg('liver');}
  if(ok('gallbladder')){orgPath(c,[[-7.4,-105.6],[-5.6,-105.6],[-5.4,-103.6],[-6.4,-102.8],[-7.4,-103.6]]);c.fillStyle='#6f8f3e';c.fill();c.fillStyle='rgba(220,255,200,.25)';ell(c,-6.8,-104.8,0.4,0.3);c.fill();dmg('gallbladder');}
  // lungs with bronchial trees
  for(const [id,sg] of [['lungR',-1],['lungL',1]]){if(!ok(id))continue;const k=coll(id),yb=-129.4,f=y=>yb+(y-yb)*k;
    const pts=sg<0?[[-4.4,-142.6],[-9.4,-139.6],[-12.8,-133],[-14,-124],[-13,-117.4],[-9.4,-115.4],[-5.2,-116.8],[-2.4,-118.6],[-2.2,-128],[-3,-138]]:[[4.4,-142.6],[9.2,-139.6],[12.4,-133],[13.6,-124],[12.6,-117.6],[9.2,-116],[6,-117.6],[5,-120.8],[3.4,-122],[2.8,-128],[3.4,-138]];
    orgPath(c,pts.map(p=>[p[0],f(p[1])]));const g=c.createRadialGradient(sg*6,-133,1,sg*8,-126,12);g.addColorStop(0,'#f4bcb6');g.addColorStop(1,'#cf8984');c.fillStyle=g;c.fill();c.strokeStyle='rgba(130,50,55,.55)';c.lineWidth=0.18;c.stroke();
    c.save();c.clip();c.fillStyle='rgba(160,70,80,.16)';for(let i=0;i<40;i++){const a=i*2.4,r=((i*37)%10)/10;c.beginPath();c.arc(sg*8+Math.cos(a)*r*5,f(-128+Math.sin(a)*r*11),0.45,0,6.28);c.fill();}
      c.strokeStyle='rgba(130,50,55,.45)';c.lineWidth=0.2;c.beginPath();c.moveTo(sg*3,f(-134));c.quadraticCurveTo(sg*8,f(-130),sg*13,f(-124));if(sg<0){c.moveTo(sg*3,f(-126));c.quadraticCurveTo(sg*8,f(-127),sg*13.4,f(-129));}c.stroke();
      const br=(x,y,a,len,wd,d)=>{if(d>4||len<0.5)return;const x2=x+Math.cos(a)*len,y2=y+Math.sin(a)*len*k;c.strokeStyle='rgba(120,140,190,.75)';c.lineWidth=wd;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();br(x2,y2,a-0.5,len*0.68,wd*0.7,d+1);br(x2,y2,a+0.45,len*0.64,wd*0.7,d+1);};
      for(const da of [-1.0,-0.2,0.6])br(sg*2.6,f(-131),(sg>0?0:Math.PI)+da*sg,3.4,0.5,0);c.restore();dmg(id);}
  // trachea and main bronchi
  if(ok('trachea')){c.fillStyle='#cfdbe8';c.fillRect(-1.2,-152.5,2.4,16);c.strokeStyle='rgba(120,135,160,.75)';c.lineWidth=0.3;for(let y=-152;y<-136.6;y+=1)  {c.beginPath();c.moveTo(-1.2,y);c.lineTo(1.2,y);c.stroke();}
    c.strokeStyle='#cfdbe8';c.lineWidth=1.3;c.beginPath();c.moveTo(0,-136.8);c.quadraticCurveTo(-1.6,-134.6,-3,-131.6);c.moveTo(0,-136.8);c.quadraticCurveTo(1.6,-134.6,3,-131.6);c.stroke();dmg('trachea');}
  // heart with great vessels, anterior view
  if(ok('heart')){const pu=V.dead||V.arrest?0:Math.exp(-(T-V.lastBeat)*9)*0.05;c.save();c.translate(1.6,-124.6);heartFrontArt(c,pu,false);c.restore();dmg('heart');}
  c.restore();
}
function frontKey(){
  let k=(FEMALE?'f':'m')+view+'|'+xlKey()+'|'+(xray?1:0)+'|'+(SEG.head.jawDrop||0).toFixed(2)+'|'+(SEG.chest.ribsBroken||0);
  for(const id in ORG){const o=ORG[id];k+=(o.seg.connected&&!o.seg.gone?1:0)+','+Math.round(o.hp/4)+','+(o.hits?o.hits.length:0)+','+(o.marks?o.marks.length:0)+';';}
  for(const b of BONES)if(b.broken||b.marks||b.plates)k+=b.id+(b.broken?'*':'')+(b.marks?b.marks.length:0)+(b.plates?'p'+b.plates.length:'');
  for(const g of segs){k+=g.connected&&!g.gone?'1':'0';for(const w of g.wounds)if(w.type==='hole'||w.type==='cut')k+=(w.sut>=1?'s':w.graft?'g':'o')+Math.round(w.r*4);}
  for(const v of VESSELS)if(v.cut>0)k+=v.id+(v.lig?'l':'');
  return k;}
function frontXrayCached(c){
  let fc=frontXrayCached.c;
  const res=pickRes(fc&&fc.res,Math.min(16,Math.max(2,VS*DPR))),X0=-42,Y0=-186,W0=84,H0=192,w=Math.ceil(W0*res),h=Math.ceil(H0*res),key=frontKey();
  if(!fc||fc.key!==key||fc.res!==res){
    if(!fc||fc.cv.width!==w||fc.cv.height!==h){fc={cv:document.createElement('canvas')};fc.cv.width=w;fc.cv.height=h;fc.cx=fc.cv.getContext('2d');}
    const x=fc.cx;x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,w,h);x.setTransform(res,0,0,res,-X0*res,-Y0*res);x.save();frontSilhouette(x);x.clip();drawFrontXray(x);x.restore();fc.key=key;fc.res=res;frontXrayCached.c=fc;}
  c.drawImage(fc.cv,X0,Y0,W0,H0);
  if(XL('vessels')){c.save();frontSilhouette(c);c.clip();drawCutVesselPulse(c);c.restore();}
}
function drawFrontXray(c){
  const fM=XL('muscles'),fO=XL('organs'),fV=XL('vessels'),fB=XL('bones'),fN=XL('nerves'),bk=view==='back';
  c.fillStyle=fM?'#6d1d24':'rgba(18,20,28,.55)';c.fillRect(-40,-185,80,190);
  if(fM){c.fillStyle='rgba(230,200,120,.18)';frontSilhouette(c);c.lineWidth=0.9;c.strokeStyle='rgba(220,185,110,.3)';c.stroke();}
  const torsoCav=()=>{c.beginPath();for(let y=-147;y<=-85;y++)c.lineTo(torsoHW(y)*0.86,y);for(let y=-85;y>=-147;y--)c.lineTo(-torsoHW(y)*0.86,y);c.closePath();};
  if(fO){c.fillStyle='rgba(60,18,24,.85)';torsoCav();c.fill();c.beginPath();c.ellipse(0,-165,7.4,9.4,0,0,6.28);c.fill();}
  if(fM)drawFrontMusclesFull(c,bk);
  if(fB&&fO)drawFrontSkeleton(c,bk,'base');
  if(fO){for(const id of ['brain','eye']){const o=ORG[id];if(!o||!o.seg.connected||o.seg.gone)continue;const p=frontOrganXY(o);if(id==='eye'){if(bk)continue;for(const sg of [1,-1])drawOrgan(c,o,sg*p.x,p.y,p.rx,p.ry,0,true,{zc:0,zr:1});continue;}drawOrgan(c,o,p.x,p.y,p.rx,p.ry,0,true,{zc:0,zr:1});}
    drawFrontOrgans(c,bk);
    if(fB){c.save();c.globalAlpha=0.75;drawFrontSkeleton(c,bk,'cage');c.restore();}}
  if(fM)drawFrontWounds(c);
  if(fV)drawFrontVessels(c,bk);
  if(fN)drawFrontNerves(c,bk);
  if(fB&&!fO)drawFrontSkeleton(c,bk);
  if(fB)drawPlatesFront(c);
}
function drawFront(){
  const c=ctx;setWorld(c);
  if(xray||FW.some(f=>f.seg.connected&&!(f.ref&&f.ref.sut>=1))||segs.some(g=>g.connected&&g.wounds.some(w=>openWound(w)&&!(w.sut>=1)))){
  frontXrayCached(c);}
  if(xray&&!XL('skin'))return;
  // the skin layer only needs clearing and copying where the figure can be: the body box (88 x 194 cm) plus 60 cm for
  // knives, axes and hair sticking out. Everything outside is transparent anyway, so the picture is the same, with far
  // fewer pixels pushed per frame
  const s=sctx,fm=view==='back'?-1:1,fx0=DPR*(VX+fm*VS*-104),fx1=DPR*(VX+fm*VS*104),R_=[Math.max(0,Math.floor(Math.min(fx0,fx1))),Math.max(0,Math.floor(DPR*(VY+VS*-248))),Math.min(skinC.width,Math.ceil(Math.max(fx0,fx1))),Math.min(skinC.height,Math.ceil(DPR*(VY+VS*66)))];
  {const pr=render.skinR||[0,0,skinC.width,skinC.height];s.setTransform(1,0,0,1,0,0);s.clearRect(pr[0],pr[1],pr[2]-pr[0],pr[3]-pr[1]);render.skinR=R_;}setWorld(s);
  const tone=skinTone(false);
  if(FEMALE&&view!=='back'&&SEG.head.connected)hairBehindFront(s);
  frontSilhouette(s);s.fillStyle=rgb(tone);s.fill();
  s.save();frontSilhouette(s);s.clip();
  // the redesign's drawn skin (light, muscle forms, pores, hair, line work) laid over the front diagram
  const art=view!=='back'&&!FEMALE&&SKINBMP.front,artB=view==='back'&&!FEMALE&&SKINBMP.back;
  if(art||artB){const b=art?SKINBMP.front:SKINBMP.back;s.drawImage(b.cv,b.x0,b.y0,b.w,b.h);
    // the scene's own light on him (the lab's is already in the drawing)
    const SL=typeof sceneL==='function'?sceneL():null;if(SL&&OPT.scene&&OPT.scene!=='lab'){const g=s.createLinearGradient(-30,0,30,0);g.addColorStop(0,`rgba(${SL.k},${SL.ka*1.4})`);g.addColorStop(0.45,`rgba(${SL.k},0)`);g.addColorStop(0.8,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(${SL.r},${SL.ra*1.3})`);s.fillStyle=g;s.fillRect(-40,-180,80,182);if(SL.d>0){s.fillStyle=`rgba(5,6,10,${SL.d})`;s.fillRect(-40,-180,80,182);}}}
  else frontRim(s,tone);
  if(view==='back')backDetails(s);else if(art){}else{
  s.strokeStyle='rgba(90,45,35,.22)';s.lineWidth=0.35;
  s.beginPath();s.moveTo(-14,-139);s.quadraticCurveTo(-7,-133,-2,-136);s.moveTo(14,-139);s.quadraticCurveTo(7,-133,2,-136);
  if(!FEMALE){s.moveTo(-12.5,-128);s.quadraticCurveTo(-6,-124,-1.5,-127.5);s.moveTo(12.5,-128);s.quadraticCurveTo(6,-124,1.5,-127.5);}
  s.moveTo(0,-122);s.lineTo(0,-104);s.moveTo(-13,-93);s.quadraticCurveTo(-8,-88,-3.5,-85.5);s.moveTo(13,-93);s.quadraticCurveTo(8,-88,3.5,-85.5);s.stroke();
  s.fillStyle='rgba(90,45,35,.45)';s.beginPath();s.ellipse(0,-100,0.5,0.7,0,0,6.28);s.fill();
  s.strokeStyle='rgba(90,45,35,.14)';for(let i=0;i<3;i++){s.beginPath();s.moveTo(-5,-118+i*5.5);s.quadraticCurveTo(0,-117+i*5.5,5,-118+i*5.5);s.stroke();}
  s.beginPath();s.moveTo(-6,-120);s.quadraticCurveTo(-6.5,-108,-5,-102);s.moveTo(6,-120);s.quadraticCurveTo(6.5,-108,5,-102);s.stroke();
  s.strokeStyle='rgba(90,45,35,.22)';s.beginPath();s.moveTo(-2.2,-145);s.quadraticCurveTo(0,-143.5,2.2,-145);s.stroke();
  {const soft=(x,y,rx,ry,a)=>{s.save();s.translate(x,y);s.scale(rx,ry);const g=s.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,`rgba(255,242,228,${a})`);g.addColorStop(1,'rgba(255,242,228,0)');s.fillStyle=g;s.beginPath();s.arc(0,0,1,0,6.28);s.fill();s.restore();};
   for(const sg of [1,-1]){soft(sg*7,-131,6,5,0.12);soft(sg*20,-138,3,4.4,0.12);soft(sg*8.2,-72,4.6,13,0.09);soft(sg*8.3,-30,2.6,9,0.06);}}
  handFrontDetail(s,tone,false);s.strokeStyle='rgba(90,45,35,.25)';s.lineWidth=0.25;for(const sg of [1,-1]){s.beginPath();s.moveTo(sg*21.5,-110);s.quadraticCurveTo(sg*21.8,-109,sg*22.4,-110.5);s.stroke();for(let i=-1;i<=2;i++){s.beginPath();s.moveTo(sg*8.6+i*1.4,-1.5);s.lineTo(sg*8.6+i*1.4,0.1);s.stroke();}}
  for(const sg of [1,-1]){if(!SEG[(sg>0?'near':'far')+'Shin'].connected)continue;s.strokeStyle='rgba(90,45,35,.2)';s.beginPath();s.arc(sg*8.5,-50,3,0.3,2.8);s.stroke();}
  }
  if(FEMALE&&view!=='back'&&SEG.chest.connected)bustFront(s,tone);
  if(V.rot>0.12)rotFront(s);
  s.restore();
  if(view==='back')drawHeadBack(s,tone);else drawFaceFront(s,tone);
  for(const f of FP){if(!f.cut)continue;const seg=SEG[f.id];if(!seg||!seg.connected)continue;s.fillStyle='#6a0c12';s.beginPath();s.ellipse(f.x2,f.y2,f.r2*0.95,f.r2*0.5,0,0,6.28);s.fill();s.fillStyle='#ece3cb';s.beginPath();s.ellipse(f.x2,f.y2,f.r2*0.3,f.r2*0.18,0,0,6.28);s.fill();}
  for(const f of FP){const seg=SEG[f.id];if(seg.connected)continue;if(seg.joint&&seg.joint.broken){const pj=segs[seg.joint.p];if(!pj.connected)continue;if(f.id==='head'){neckStumpFront(s,FP.find(q=>q.id==='neck'));continue;}const x=f.t==='cap'?f.x1:f.cx,y=f.t==='cap'?f.y1:f.cy;const rx=(f.r1||f.rx),ry=(f.r1||f.ry);s.fillStyle='#6a0c12';s.beginPath();s.ellipse(x,y,rx*0.95,ry*0.5,0,0,6.28);s.fill();s.globalCompositeOperation='destination-out';s.beginPath();s.ellipse(x,y,rx*0.75,ry*0.38,0,0,6.28);s.fill();s.globalCompositeOperation='source-over';}}
  s.save();frontSilhouette(s);s.clip();
  for(const w of FW){if(view!=='front'||OPT.gore===0)break;if(!w.seg.connected||w.band||w.blood<0.2)continue;const x=w.type==='cut'?(w.x+w.x2)/2:w.x,y=w.type==='cut'?(w.y+w.y2)/2:w.y;const wd=Math.max(0.45,w.r*0.75);s.fillStyle='rgba(110,10,16,.82)';s.beginPath();s.moveTo(x-wd,y);s.lineTo(x+wd,y);s.lineTo(x,y+w.blood);s.closePath();s.fill();s.beginPath();s.arc(x,y+w.blood,wd*0.5,0,6.28);s.fill();}
  for(const w of FW){if(view!=='front')break;if(!w.seg.connected)continue;
    const su=w.ref&&w.ref.sut||0;
    if(w.ref&&w.ref.graft){s.fillStyle='#d79c8a';s.beginPath();s.arc(w.x,w.y,(w.type==='cut'?1.2:w.r+0.4),0,6.28);s.fill();s.strokeStyle='rgba(95,40,35,.6)';s.lineWidth=0.2;s.stroke();continue;}
    if(w.ref&&w.ref.pack){s.fillStyle='#ece5d6';s.beginPath();s.arc(w.x,w.y,w.r+0.35,0,6.28);s.fill();s.fillStyle='rgba(140,15,22,.45)';s.beginPath();s.arc(w.x,w.y,w.r*0.6,0,6.28);s.fill();continue;}
    if(w.type==='arrow')drawBroadheadWound(s,w.x,w.y,w.r,w.rot||0,su,false);
    else if(w.type==='hole'){if(su>=1){s.fillStyle='rgba(120,40,45,.55)';s.beginPath();s.arc(w.x,w.y,w.r*0.5,0,6.28);s.fill();}else{const rf=w.ref||{};woundArt(s,w.x,w.y,w.r*(1-su*0.6),{kind:w.seg.kind,hits:w.hits,exit:rf.exit,torn:rf.torn,bone:rf.s!=null&&(rf.exit||w.r>0.6)&&boneBrokenNear(w.seg,rf.s),seed:w.x*3.1+w.y*1.7,clot:rf.type?clotOf(rf):0,tone});}
      if(su>0)stitches(s,w.x-w.r-0.45,w.y,w.x+w.r+0.45,w.y,su);}
    else drawCutSkin(s,w.x,w.y,w.x2,w.y2,w.r,su,(w.x*1.3+w.y*0.7)%6);
    if(w.band&&!(w.ref&&w.ref.wrapped)){const x=w.type==='cut'?(w.x+w.x2)/2:w.x,y=w.type==='cut'?(w.y+w.y2)/2:w.y;const sz=w.type==='cut'?Math.max(2.6,Math.hypot(w.x2-w.x,w.y2-w.y)+1):2.8;s.fillStyle='#efece4';s.fillRect(x-sz/2,y-1.2,sz,2.4);}
  }
  drawSideWoundsFront(s);
  s.restore();
  drawWrapsFront(s);
  if(anyWear())drawClothesFront(s);
  drawKnivesFront(s);drawAxesFront(s);
  for(const sd of ['near','far']){for(const k of ['UpperArm','Forearm','Thigh','Shin']){const seg=SEG[sd+k];if(seg.tq==null||!seg.connected)continue;const f=fpOf(seg);const t=clamp(fpT(seg,seg.tq),0,1);const x=lerp(f.x1,f.x2,t),y=lerp(f.y1,f.y2,t),r=lerp(f.r1,f.r2,t);s.fillStyle='#2b2f36';s.fillRect(x-r-0.4,y-1,2*r+0.8,2);s.fillStyle='#d9a441';s.fillRect(x-0.6,y-1.4,1.2,2.8);}}
  for(const o of OBJ){if(!o.att)continue;const f=fpOf(o.att.seg);if(!f)continue;let x,y;if(f.t==='cap'){const t=clamp(fpT(o.att.seg,o.att.s),0,1);x=lerp(f.x1,f.x2,t);y=lerp(f.y1,f.y2,t);}else{x=f.t==='ell'?f.cx:0;y=o.att.seg.rest.ay+o.att.s;}s.fillStyle='#c9b98f';s.fillRect(x-4,y-2.6,8,5.2);s.fillStyle='#3a3a3a';s.fillRect(x-4,y-0.6,8,1.2);s.fillStyle=(Math.floor(T*(o.fuse<1.2?10:3))%2)?'#ff3b3b':'#5a1a1a';s.beginPath();s.arc(x,y-3.6,0.7,0,6.28);s.fill();}
  ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=xray?(XL('skin')?0.2:0.05):trajOn&&TRAJ.length?0.45:1;if(R_[2]>R_[0]&&R_[3]>R_[1])ctx.drawImage(skinC,R_[0],R_[1],R_[2]-R_[0],R_[3]-R_[1],R_[0],R_[1],R_[2]-R_[0],R_[3]-R_[1]);ctx.globalAlpha=1;
}
// the cut neck after decapitation, seen edge-on from the front or the back: a flat oval of cut muscle at the top of the
// neck (≈10 cm wide, as the neck), with the windpipe toward the front and the cervical spine toward the back, and the
// two carotid arteries at the sides. The side nearer the viewer is the lower half of the oval
function neckStumpFront(s,n){if(!n)return;const back=view==='back',x=n.x1,y=n.y1,rx=n.r1*0.97,ry=n.r1*0.36,near=back?-1:1;
  s.fillStyle='#7a1018';s.beginPath();s.ellipse(x,y,rx,ry,0,0,6.28);s.fill();
  s.fillStyle='#a3242c';s.beginPath();s.ellipse(x,y,rx*0.8,ry*0.72,0,0,6.28);s.fill();
  // windpipe: a pale cartilage ring with a dark lumen
  const ty=y-near*ry*0.38;s.fillStyle='#e8d6c4';s.beginPath();s.ellipse(x,y+near*ry*0.42,rx*0.3,ry*0.36,0,0,6.28);s.fill();s.fillStyle='#3a0a0e';s.beginPath();s.ellipse(x,y+near*ry*0.42,rx*0.17,ry*0.2,0,0,6.28);s.fill();
  // cervical vertebra and cord
  s.fillStyle='#efe6d2';s.beginPath();s.ellipse(x,ty,rx*0.26,ry*0.34,0,0,6.28);s.fill();s.fillStyle='#d9c48e';s.beginPath();s.ellipse(x,ty,rx*0.1,ry*0.13,0,0,6.28);s.fill();
  // carotid arteries
  s.fillStyle='#5a060c';for(const k of [-1,1]){s.beginPath();s.ellipse(x+k*rx*0.52,y+near*ry*0.1,rx*0.08,ry*0.14,0,0,6.28);s.fill();}
  s.strokeStyle='rgba(60,6,10,.7)';s.lineWidth=0.25;s.beginPath();s.ellipse(x,y,rx,ry,0,0,6.28);s.stroke();}
function torsoBand(s,y0,y1,k){s.beginPath();const ys=[];for(let y=y0;y<=y1+0.01;y+=1)ys.push(y);if(ys[ys.length-1]<y1)ys.push(y1);s.moveTo(torsoHW(ys[0])*k,ys[0]);for(const y of ys)s.lineTo(torsoHW(y)*k,y);for(let i=ys.length-1;i>=0;i--)s.lineTo(-torsoHW(ys[i])*k,ys[i]);s.closePath();}
function capBand(s,f,t0,t1,pad){const x0=lerp(f.x1,f.x2,t0),y0=lerp(f.y1,f.y2,t0),x1=lerp(f.x1,f.x2,t1),y1=lerp(f.y1,f.y2,t1),r0=lerp(f.r1,f.r2,t0)+pad,r1=lerp(f.r1,f.r2,t1)+pad;const dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;s.beginPath();s.moveTo(x0+nx*r0,y0+ny*r0);s.lineTo(x1+nx*r1,y1+ny*r1);s.lineTo(x1-nx*r1,y1-ny*r1);s.lineTo(x0-nx*r0,y0-ny*r0);s.closePath();}
function underFront(s,bk,ok,fp){
  // the redesign's grey boxer briefs (front): drawn as designed, cut to what is left of him
  if(!FEMALE&&SKINBMP[bk?'shortsB':'shortsF']&&ok('abd')){const b=SKINBMP[bk?'shortsB':'shortsF'];s.save();frontSilhouette(s);s.clip();s.drawImage(b.cv,b.x0,b.y0,b.w,b.h);s.restore();return;}
  const col=FEMALE?'#2c3442':'#3a4148',trim=FEMALE?'#5f536d':'#1d2226';
  if(ok('abd')){const top=FEMALE?-92.6:-95.6,hw=torsoHW(top)*1.05,cy=FEMALE?(bk?-79.5:-81):(bk?-79:-79.5),cx=FEMALE?(bk?3.6:2.2):(bk?4:3.2),sx=FEMALE?(bk?7.5:6.2):(bk?8:7.6),sy=FEMALE?-88.6:-87;
    s.fillStyle=col;s.beginPath();s.moveTo(-hw,top);s.lineTo(hw,top);s.lineTo(torsoHW(sy)*1.05,sy);s.quadraticCurveTo(sx,sy+3.4,cx,cy);s.lineTo(-cx,cy);s.quadraticCurveTo(-sx,sy+3.4,-torsoHW(sy)*1.05,sy);s.closePath();s.fill();
    s.strokeStyle=trim;s.lineWidth=0.45;s.beginPath();s.moveTo(torsoHW(sy)*1.05,sy);s.quadraticCurveTo(sx,sy+3.4,cx,cy);s.moveTo(-torsoHW(sy)*1.05,sy);s.quadraticCurveTo(-sx,sy+3.4,-cx,cy);s.stroke();
    s.fillStyle=trim;torsoBand(s,top,top+(FEMALE?0.8:1.4),1.06);s.fill();
    if(!FEMALE&&!bk){s.strokeStyle='rgba(0,0,0,.22)';s.lineWidth=0.25;s.beginPath();s.moveTo(-2.4,-93.5);s.quadraticCurveTo(-3,-87,-1.2,-81.5);s.moveTo(2.4,-93.5);s.quadraticCurveTo(3,-87,1.2,-81.5);s.stroke();}
    if(bk){s.strokeStyle='rgba(0,0,0,.18)';s.lineWidth=0.25;s.beginPath();s.moveTo(0,top+1);s.lineTo(0,cy+1);s.stroke();}
    const g=s.createLinearGradient(-18,0,18,0);g.addColorStop(0,'rgba(0,0,0,.25)');g.addColorStop(0.3,'rgba(0,0,0,0)');g.addColorStop(0.7,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.25)');s.fillStyle=g;s.fillRect(-20,top,40,cy-top+1);}
  if(FEMALE&&ok('chest')){
    s.fillStyle=col;torsoBand(s,bk?-122.4:-120.6,bk?-119.8:-118.4,1.04);s.fill();
    s.strokeStyle=trim;s.lineWidth=0.9;s.lineCap='round';
    if(!bk){for(const sg of [1,-1]){s.fillStyle=col;s.beginPath();s.moveTo(sg*1.2,-119.6);s.quadraticCurveTo(sg*1.1,-126,sg*6.4,-128.6);s.quadraticCurveTo(sg*11.6,-127.4,sg*12.4,-119.6);s.closePath();s.fill();
        s.strokeStyle='rgba(0,0,0,.25)';s.lineWidth=0.25;s.beginPath();s.moveTo(sg*1.2,-119.6);s.quadraticCurveTo(sg*1.1,-126,sg*6.4,-128.6);s.quadraticCurveTo(sg*11.6,-127.4,sg*12.4,-119.6);s.stroke();
        s.strokeStyle=trim;s.lineWidth=0.9;s.beginPath();s.moveTo(sg*7.6,-128.2);s.lineTo(sg*8.9,-146.6);s.stroke();}
      s.fillStyle=trim;s.fillRect(-1.3,-121.4,2.6,2);}
    else{for(const sg of [1,-1]){s.beginPath();s.moveTo(sg*8.9,-146.6);s.quadraticCurveTo(sg*8.2,-134,sg*6.8,-122.2);s.stroke();}s.fillStyle=trim;s.fillRect(-2.2,-122.8,4.4,3.4);s.fillStyle='rgba(255,255,255,.25)';s.fillRect(-1.6,-121.6,3.2,0.35);}
  }}
function drawClothesFront(s){
  const fp=id=>FP.find(q=>q.id===id),ok=id=>SEG[id]&&SEG[id].connected;
  const shade=()=>{const g=s.createLinearGradient(-18,0,18,0);g.addColorStop(0,'rgba(0,0,0,.28)');g.addColorStop(0.3,'rgba(0,0,0,0)');g.addColorStop(0.7,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.28)');return g;};
  s.save();frontSilhouette(s);s.clip();
  const bk=view==='back';
  if(WEAR.under.on)underFront(s,bk,ok,fp);
  if(WEAR.jeans.on){s.fillStyle=WEARDEF.jeans.col;
    if(ok('abd')){torsoBand(s,-96,-85,1.04);s.fill();}
    for(const sd of ['near','far']){for(const k of ['Thigh','Shin']){const id=sd+k;if(!ok(id))continue;capBand(s,fp(id),k==='Thigh'?-0.15:0,1,1.5);s.fill();if(k==='Thigh'){s.beginPath();s.ellipse(fp(id).x1,fp(id).y1,fp(id).r1+1.5,fp(id).r1+1.5,0,0,6.28);s.fill();}}}
    s.strokeStyle='rgba(214,160,80,.5)';s.lineWidth=0.2;s.setLineDash([0.5,0.4]);for(const sg of [1,-1]){s.beginPath();s.moveTo(sg*8.6,-87);s.lineTo(sg*8.3,-6);s.stroke();}s.setLineDash([]);
    if(ok('abd')){s.fillStyle='#1d1a17';torsoBand(s,-96,-94.4,1.05);s.fill();if(!bk){s.fillStyle='#b9a26a';s.fillRect(-1.2,-96.1,2.4,1.9);s.strokeStyle='rgba(0,0,0,.35)';s.lineWidth=0.25;s.beginPath();s.moveTo(0,-94);s.lineTo(0,-86);s.stroke();}
      else{s.strokeStyle='rgba(214,160,80,.5)';s.lineWidth=0.2;for(const sg of [1,-1]){s.strokeRect(sg*7-3,-93,6,6);}}}
  }
  if(WEAR.boots.on){s.fillStyle=WEARDEF.boots.col;for(const sd of ['near','far']){if(ok(sd+'Shin')){capBand(s,fp(sd+'Shin'),0.73,1.05,1.6);s.fill();}const f=fp(sd+'Foot');if(ok(sd+'Foot')){s.beginPath();s.ellipse(f.cx,f.cy,f.rx+1,f.ry+1,0,0,6.28);s.fill();s.fillStyle='#1b1410';s.fillRect(f.cx-f.rx-1,f.cy+1.6,2*f.rx+2,2);s.fillStyle=WEARDEF.boots.col;}}}
  if(WEAR.shirt.on){s.fillStyle=WEARDEF.shirt.col;
    if(ok('chest')){s.beginPath();const ys=[];for(let y=-147;y<=-94;y+=1)ys.push(y);s.moveTo(torsoHW(-147)*1.05,-147);for(const y of ys)s.lineTo(torsoHW(y)*1.05,y);for(let i=ys.length-1;i>=0;i--)s.lineTo(-torsoHW(ys[i])*1.05,ys[i]);s.closePath();s.ellipse(0,bk?-147.6:-146.6,5.6,bk?2:3.2,0,0,6.28);s.fill('evenodd');
      s.strokeStyle='rgba(0,0,0,.25)';s.lineWidth=0.5;s.beginPath();s.ellipse(0,bk?-147.6:-146.6,5.9,bk?2.3:3.5,0,0.1,3.04);s.stroke();}
    for(const sd of ['near','far']){const id=sd+'UpperArm';if(!ok(id))continue;capBand(s,fp(id),-0.1,0.42,1);s.fill();s.fillStyle='rgba(0,0,0,.22)';capBand(s,fp(id),0.4,0.42,1);s.fill();s.fillStyle=WEARDEF.shirt.col;}
    s.fillStyle='rgba(0,0,0,.1)';for(let i=0;i<3;i++){s.fillRect(-12,-128+i*9,24,0.5);}
  }
  if(WEAR.vest.on&&ok('chest')){s.fillStyle=WEARDEF.vest.col;torsoBand(s,-142,-98,0.9);s.fill();
    for(const sg of [1,-1]){s.beginPath();s.moveTo(sg*5.6,-147.5);s.lineTo(sg*10.4,-147.5);s.lineTo(sg*12,-141);s.lineTo(sg*5,-141);s.closePath();s.fill();}
    s.fillStyle='rgba(255,255,255,.07)';s.fillRect(-13,-124,26,1.2);s.fillRect(-13,-109,26,1.2);
    if(!bk){s.fillStyle='#16191c';s.fillRect(-0.4,-141,0.8,43);s.fillStyle='rgba(225,225,225,.55)';s.fillRect(-4.5,-137,9,2.6);s.fillStyle='#16191c';s.font='bold 2px sans-serif';s.textAlign='center';s.fillText('IIIA',0,-135.1);}
    else{s.fillStyle='rgba(225,225,225,.55)';s.fillRect(-7,-136,14,3.2);}
    s.fillStyle=shade();torsoBand(s,-142,-98,0.9);s.fill();}
  if(WEAR.plate.on&&ok('chest')){s.fillStyle='#3a3f2a';torsoBand(s,-112,-101,0.95);s.fill();
    s.fillStyle=WEARDEF.plate.col;s.beginPath();s.roundRect?s.roundRect(-10.5,-141,21,30,[4,4,1.5,1.5]):s.rect(-10.5,-141,21,30);s.fill();
    for(const sg of [1,-1]){s.beginPath();s.moveTo(sg*6.5,-148);s.lineTo(sg*10.6,-148);s.lineTo(sg*10.5,-140);s.lineTo(sg*6.5,-140);s.closePath();s.fill();}
    s.fillStyle='rgba(0,0,0,.32)';for(let y=-136;y<-113;y+=2.6)s.fillRect(-9.5,y,19,0.55);s.fillStyle='rgba(0,0,0,.2)';for(let x=-8;x<=8;x+=4)s.fillRect(x-0.2,-136,0.4,22);
    if(!bk){s.fillStyle='#454a31';s.fillRect(-8,-122,16,6.5);s.fillStyle='rgba(0,0,0,.3)';s.fillRect(-8,-122,16,0.5);for(const x of [-5.3,0,5.3]){s.fillRect(x-2.4,-122,4.8,6.5);}s.fillStyle='#454a31';for(const x of [-5.3,0,5.3])s.fillRect(x-2.1,-121.7,4.2,6);}
    s.fillStyle=shade();s.fillRect(-10.5,-141,21,30);}
  // soaked blood and holes in fabric
  for(const seg of segs){if(!seg.connected)continue;for(const wd of seg.wounds){
    if(wd.type==='stump'||wd.type==='bruise')continue;const cc=woundCenter(wd);let cov=false;for(const it of WORDER)if(covers(it,seg,cc.s,cc.w)){cov=true;break;}if(!cov)continue;
    const p=woundFrontXY(seg,wd);if(!p)continue;
    if(wd.type==='burn'){s.fillStyle='rgba(20,12,8,.7)';s.beginPath();s.arc(p.x,p.y,wd.r*0.6,0,6.28);s.fill();continue;}
    if(!(wd.sut>=1)&&!wd.band&&wd.bleed>0){const sr=Math.min(7,(wd.type==='cut'?(wd.len||2)*0.4:wd.r)+0.8+Math.sqrt(wd.age)*0.9*Math.min(1.5,wd.bleed+0.3));s.fillStyle='rgba(60,4,10,.5)';s.beginPath();s.ellipse(p.x,p.y+sr*0.3,sr*0.85,sr*1.15,0,0,6.28);s.fill();}
    if(isBite(wd))continue;s.fillStyle='#120708';if(wd.type==='cut'){const h=Math.min(3,(wd.len||2)*0.5);s.fillRect(p.x-h,p.y-0.3,2*h,0.6);}else{s.beginPath();s.arc(p.x,p.y,(wd.r||0.6)*0.8+0.2,0,6.28);s.fill();}}}
  for(const seg of segs){if(!seg.connected||!seg.amarks)continue;for(const m of seg.amarks){if(!covers(m.it,seg,m.s,m.w))continue;let p=null;
    if(m.fx!=null){if(m.v!==view)continue;p={x:m.fx,y:m.fy};}else{const rr=radS(seg,m.s)||seg.ra;if(view==='back'?m.w>0.3*rr:m.w<-0.3*rr)continue;p=frontPos(seg,m.s,m.z==null?0:clamp(m.z,-1,1));}
    if(!p)continue;
    if(m.cut){s.strokeStyle='rgba(200,200,190,.6)';s.lineWidth=0.3;s.beginPath();s.moveTo(p.x-1.2,p.y-0.5);s.lineTo(p.x+1.2,p.y+0.5);s.stroke();continue;}
    s.fillStyle=m.it==='plate'?'rgba(205,200,180,.55)':'rgba(140,140,130,.5)';s.beginPath();s.arc(p.x,p.y,1.1,0,6.28);s.fill();s.fillStyle=m.pen?'#120708':'#8a8a80';s.beginPath();s.arc(p.x,p.y,0.45,0,6.28);s.fill();}}
  s.restore();
  steelFront(s);
  if(WEAR.helmet.on&&ok('head')){s.save();s.beginPath();s.rect(-14,-182,28,bk?20.5:16);s.rect(-14,-166.5,28,5.5);s.clip();
    s.beginPath();s.rect(-14,-182,28,bk?20.5:15.6);if(!bk){s.rect(-14,-166.6,4.9,5.6);s.rect(9.1,-166.6,4.9,5.6);}s.clip();
    s.fillStyle=WEARDEF.helmet.col;s.beginPath();s.ellipse(0,-164.3,9.6,12.3,0,0,6.28);s.fill();
    const g=s.createRadialGradient(-2,-172,1,0,-166,12);g.addColorStop(0,'rgba(255,255,255,.14)');g.addColorStop(1,'rgba(0,0,0,.3)');s.fillStyle=g;s.fill();s.restore();
    s.strokeStyle='rgba(0,0,0,.4)';s.lineWidth=0.35;s.beginPath();s.moveTo(-9.4,bk?-161.6:-166.4);s.lineTo(9.4,bk?-161.6:-166.4);s.stroke();
    if(!bk){s.strokeStyle='#26281c';s.lineWidth=0.5;for(const sg of [1,-1]){s.beginPath();s.moveTo(sg*8.6,-161.5);s.quadraticCurveTo(sg*7.4,-154,0,-152.5);s.stroke();}}}
}
// front/back view: close helm, gorget, breastplate with plackart, fauld and tassets (backplate and culet from behind),
// pauldrons with besagews, couters and poleyns with fan wings, articulated gauntlets and sabatons
function steelFront(s){const fp=id=>FP.find(q=>q.id===id),ok=id=>SEG[id]&&SEG[id].connected,bk=view==='back',P2=Math.PI*2;
  const SG=(x0,x1,hi=0.4)=>{const g=s.createLinearGradient(x0,0,x1,0);g.addColorStop(0,'#363c42');g.addColorStop(Math.max(0.05,hi-0.22),'#8b949c');g.addColorStop(hi,'#f4f7f9');g.addColorStop(Math.min(0.95,hi+0.14),'#b4bcc3');g.addColorStop(1,'#434a51');return g;};
  const ENV=(y0,y1,a=1)=>{const g=s.createLinearGradient(0,y0,0,y1);g.addColorStop(0,`rgba(235,244,255,${0.2*a})`);g.addColorStop(0.42,'rgba(255,255,255,0)');g.addColorStop(0.56,`rgba(10,14,18,${0.22*a})`);g.addColorStop(1,`rgba(95,72,50,${0.14*a})`);return g;};
  const fillSteel=(x0,x1,y0,y1,hi)=>{s.fillStyle=SG(x0,x1,hi);s.fill();s.fillStyle=ENV(y0,y1);s.fill();s.strokeStyle='rgba(16,19,22,.82)';s.lineWidth=0.3;s.stroke();};
  const rivet=(x,y,r=0.34)=>{s.fillStyle='rgba(16,19,22,.75)';s.beginPath();s.arc(x+0.06,y+0.08,r+0.1,0,P2);s.fill();s.fillStyle='#d6dce1';s.beginPath();s.arc(x,y,r,0,P2);s.fill();s.fillStyle='rgba(255,255,255,.9)';s.beginPath();s.arc(x-r*0.35,y-r*0.35,r*0.32,0,P2);s.fill();};
  const edgeLine=(fn,w=0.55)=>{s.lineCap='round';s.strokeStyle='rgba(16,19,22,.7)';s.lineWidth=w;fn();s.stroke();s.strokeStyle='rgba(255,255,255,.55)';s.lineWidth=w*0.38;fn();s.stroke();};
  const caps=(x0,y0,r0,x1,y1,r1)=>{const a=Math.atan2(y1-y0,x1-x0);s.beginPath();s.arc(x0,y0,r0,a+Math.PI/2,a+Math.PI*1.5);s.arc(x1,y1,r1,a-Math.PI/2,a+Math.PI/2);s.closePath();};
  const at=(f,t,pad=0)=>({x:lerp(f.x1,f.x2,t),y:lerp(f.y1,f.y2,t),r:lerp(f.r1,f.r2,t)+pad});
  const tube=(f,t0,t1,pad,hi)=>{const A=at(f,t0,pad),B=at(f,t1,pad);caps(A.x,A.y,A.r,B.x,B.y,B.r);const r=Math.max(A.r,B.r);fillSteel(Math.min(A.x,B.x)-r,Math.max(A.x,B.x)+r,A.y-A.r,B.y+B.r,hi);};
  const lameArc=(f,t,pad,cv=0.9)=>{const A=at(f,t,pad);edgeLine(()=>{s.beginPath();s.moveTo(A.x-A.r*0.97,A.y);s.quadraticCurveTo(A.x,A.y+cv,A.x+A.r*0.97,A.y);},0.32);};
  const ridge=(f,t0,t1)=>{const A=at(f,t0),B=at(f,t1);s.lineCap='round';s.strokeStyle='rgba(20,24,28,.45)';s.lineWidth=0.5;s.beginPath();s.moveTo(A.x+0.35,A.y);s.lineTo(B.x+0.35,B.y);s.stroke();s.strokeStyle='rgba(255,255,255,.75)';s.lineWidth=0.28;s.beginPath();s.moveTo(A.x-0.1,A.y);s.lineTo(B.x-0.1,B.y);s.stroke();};
  const cop=(x,y,r,sg)=>{s.beginPath();s.moveTo(x,y-r*0.9);s.quadraticCurveTo(x+sg*(r+3.4),y-r*1.2,x+sg*(r+3),y);s.quadraticCurveTo(x+sg*(r+3.4),y+r*1.2,x,y+r*0.9);s.closePath();fillSteel(Math.min(x,x+sg*(r+3.5)),Math.max(x,x+sg*(r+3.5)),y-r,y+r,0.45);
    s.strokeStyle='rgba(20,24,28,.4)';s.lineWidth=0.2;for(const q of [-0.5,0,0.5]){s.beginPath();s.moveTo(x+sg*r*0.6,y+q*r*0.6);s.lineTo(x+sg*(r+2.6),y+q*r*1.3);s.stroke();}
    s.beginPath();s.ellipse(x,y,r,r*0.8,0,0,P2);const g=s.createRadialGradient(x-r*0.35,y-r*0.35,r*0.1,x,y,r);g.addColorStop(0,'#fbfcfd');g.addColorStop(0.5,'#a7afb6');g.addColorStop(1,'#3e454b');s.fillStyle=g;s.fill();s.strokeStyle='rgba(16,19,22,.82)';s.lineWidth=0.3;s.stroke();
    edgeLine(()=>{s.beginPath();s.ellipse(x,y,r*0.62,r*0.5,0,0,P2);},0.25);rivet(x,y,0.42);};
  // ---- legs
  for(const [sd,sg] of [['near',1],['far',-1]]){const th=fp(sd+'Thigh'),sh=fp(sd+'Shin'),ft=fp(sd+'Foot');
    if(WEAR.sabatons.on&&ok(sd+'Foot')&&ft){s.beginPath();s.ellipse(ft.cx,ft.cy+0.2,ft.rx+0.9,ft.ry+0.8,0,0,P2);fillSteel(ft.cx-ft.rx-1,ft.cx+ft.rx+1,ft.cy-ft.ry,ft.cy+ft.ry,0.4);
      for(let i=0;i<3;i++){const y=ft.cy-ft.ry*0.55+i*1.3;edgeLine(()=>{s.beginPath();s.ellipse(ft.cx,y+2.5,ft.rx*(0.95-i*0.05),2.6,0,Math.PI*1.12,Math.PI*1.88);},0.28);}
      rivet(ft.cx-sg*ft.rx*0.7,ft.cy-ft.ry*0.3);}
    if(WEAR.greaves.on&&ok(sd+'Shin')&&sh){tube(sh,0.05,0.96,1.0,bk?0.55:0.42);
      if(!bk)ridge(sh,0.1,0.92);else{const A=at(sh,0.08),B=at(sh,0.92);s.strokeStyle='rgba(20,24,28,.5)';s.lineWidth=0.25;s.beginPath();s.moveTo(A.x+sg*A.r*0.55,A.y);s.lineTo(B.x+sg*B.r*0.55,B.y);s.stroke();for(const t of [0.2,0.5,0.8]){const q=at(sh,t);rivet(q.x+sg*q.r*0.55,q.y,0.3);}}
      const B=at(sh,0.96,1.0);edgeLine(()=>{s.beginPath();s.moveTo(B.x-B.r,B.y-0.6);s.quadraticCurveTo(B.x,B.y+0.6,B.x+B.r,B.y-0.6);},0.5);
      const A=at(sh,0.06,1.0);rivet(A.x-A.r*0.7,A.y+1.2);rivet(A.x+A.r*0.7,A.y+1.2);}
    if(WEAR.cuisses.on&&ok(sd+'Thigh')&&th){tube(th,0.08,0.95,1.1,0.42);if(!bk)ridge(th,0.12,0.8);
      lameArc(th,0.82,1.1,1);lameArc(th,0.9,1.1,1);
      const q=at(th,0.35,1.1);s.fillStyle='#4a3020';s.fillRect(q.x-q.r,q.y-0.9,2*q.r,1.8);s.strokeStyle='rgba(0,0,0,.35)';s.lineWidth=0.15;s.strokeRect(q.x-q.r,q.y-0.9,2*q.r,1.8);s.strokeStyle='#c9a95a';s.lineWidth=0.3;s.strokeRect(q.x+sg*q.r*0.45-0.8,q.y-1.1,1.6,2.2);}
    if((WEAR.cuisses.on||WEAR.greaves.on)&&ok(sd+'Shin')&&sh){if(!bk)cop(sh.x1,sh.y1+0.3,5.2,sg);
      else edgeLine(()=>{s.beginPath();s.moveTo(sh.x1-4.6,sh.y1-1);s.quadraticCurveTo(sh.x1,sh.y1+1.2,sh.x1+4.6,sh.y1-1);},0.35);}}
  // ---- forearms and hands
  for(const [sd,sg] of [['near',1],['far',-1]]){const ua=fp(sd+'UpperArm'),fa=fp(sd+'Forearm'),hd=fp(sd+'Hand');
    if(WEAR.vambraces.on&&ok(sd+'Forearm')&&fa){if(ok(sd+'UpperArm')&&ua)tube(ua,0.55,1,0.8,0.4);
      tube(fa,0.12,0.97,0.85,0.4);const B=at(fa,0.97,0.85);edgeLine(()=>{s.beginPath();s.moveTo(B.x-B.r,B.y);s.quadraticCurveTo(B.x,B.y+0.7,B.x+B.r,B.y);},0.45);
      for(const t of [0.35,0.75]){const q=at(fa,t,0.85);rivet(q.x-sg*q.r*0.65,q.y,0.3);}
      cop(fa.x1,fa.y1,3.8,sg);}
    if(WEAR.gauntlets.on&&ok(sd+'Hand')&&hd){const A=at(hd,0,1.7),B=at(hd,0.3,0.9);caps(A.x,A.y,A.r,B.x,B.y,B.r);fillSteel(A.x-A.r,A.x+A.r,A.y,B.y,0.42);
      edgeLine(()=>{s.beginPath();s.moveTo(A.x-A.r,A.y-0.2);s.quadraticCurveTo(A.x,A.y+0.9,A.x+A.r,A.y-0.2);},0.45);
      tube(hd,0.3,0.6,0.75,0.42);const K=at(hd,0.6,0.8);edgeLine(()=>{s.beginPath();s.moveTo(K.x-K.r,K.y);s.quadraticCurveTo(K.x,K.y+1,K.x+K.r,K.y);},0.5);
      tube(hd,0.6,1,0.55,0.42);for(const t of [0.7,0.8,0.9])lameArc(hd,t,0.55,0.6);
      const F=at(hd,0.66),G2=at(hd,1);s.strokeStyle='rgba(16,19,22,.5)';s.lineWidth=0.18;for(const q of [-0.33,0,0.33]){s.beginPath();s.moveTo(F.x+q*F.r*1.4,F.y);s.lineTo(G2.x+q*G2.r*1.4,G2.y+0.6);s.stroke();}
      const M=at(hd,0.42);rivet(M.x,M.y,0.3);}}
  // ---- cuirass
  if(WEAR.cuirass.on&&ok('chest')){
    if(!bk)for(const sg of [1,-1]){if(!ok(sg>0?'nearThigh':'farThigh'))continue;const cx=sg*8.2;
      for(let i=1;i>=0;i--){const y0=-93+i*5.5,y1=y0+7.2,w0=6.8,w1=6.2;s.beginPath();s.moveTo(cx-w0,y0);s.lineTo(cx+w0,y0);s.lineTo(cx+w1,y1-1.2);s.quadraticCurveTo(cx,y1+1,cx-w1,y1-1.2);s.closePath();fillSteel(cx-w0,cx+w0,y0,y1,0.42);
        edgeLine(()=>{s.beginPath();s.moveTo(cx-w1+0.3,y1-1.4);s.quadraticCurveTo(cx,y1+0.6,cx+w1-0.3,y1-1.4);},0.35);rivet(cx,y0+1.4,0.3);}}
    // fauld in front, culet behind: hoops that overlap downward, so the lowest is drawn first
    const hoops=bk?[-104,-100.2,-96.4,-92.6,-88.8]:[-104,-100.4,-96.8];
    for(let i=hoops.length-1;i>=0;i--){const y0=hoops[i],y1=y0+4.4,kx=1.09+i*0.012;torsoBand(s,y0,y1,kx);fillSteel(-17*kx,17*kx,y0,y1,0.45);
      edgeLine(()=>{s.beginPath();s.moveTo(-torsoHW(y1-0.5)*kx+0.3,y1-0.5);s.quadraticCurveTo(0,y1+0.6,torsoHW(y1-0.5)*kx-0.3,y1-0.5);},0.38);for(const x of [-0.72,0,0.72])rivet(x*torsoHW(y0+1.2)*kx,y0+1.2,0.28);}
    torsoBand(s,-148,-103.5,1.07);fillSteel(-18,18,-148,-104,bk?0.56:0.44);
    if(!bk){const g=s.createLinearGradient(-3,0,3,0);g.addColorStop(0,'rgba(20,24,28,0)');g.addColorStop(0.42,'rgba(20,24,28,.28)');g.addColorStop(0.5,'rgba(255,255,255,.85)');g.addColorStop(0.6,'rgba(255,255,255,0)');s.fillStyle=g;s.fillRect(-3,-145.5,6,41);
      const hw=torsoHW(-104)*1.085;s.beginPath();s.moveTo(-hw,-103.6);s.quadraticCurveTo(-hw*0.55,-114,0,-126);s.quadraticCurveTo(hw*0.55,-114,hw,-103.6);s.closePath();fillSteel(-hw,hw,-126,-104,0.46);
      edgeLine(()=>{s.beginPath();s.moveTo(-hw+0.6,-104.2);s.quadraticCurveTo(-hw*0.55,-114.4,0,-125.2);s.quadraticCurveTo(hw*0.55,-114.4,hw-0.6,-104.2);},0.32);rivet(0,-122.6,0.4);rivet(-hw*0.62,-108.5,0.32);rivet(hw*0.62,-108.5,0.32);
      edgeLine(()=>{s.beginPath();s.moveTo(-9.6,-147);s.quadraticCurveTo(0,-140.5,9.6,-147);},0.75);
      for(const sg of [1,-1]){edgeLine(()=>{s.beginPath();s.moveTo(sg*11.2,-146.6);s.quadraticCurveTo(sg*13.6,-139,sg*16.2,-134.5);},0.75);
        for(const k2 of [0,1])edgeLine(()=>{s.beginPath();s.moveTo(sg*(12.6+k2*1.3),-145.5+k2*1.6);s.quadraticCurveTo(sg*(14.4+k2*1.3),-139+k2,sg*(16.4+k2*0.6),-135.5+k2*1.2);},0.28);}
      s.fillStyle='#3f464c';s.fillRect(-11.6,-129.5,3.4,1.5);rivet(-11,-128.8,0.3);rivet(-8.8,-128.8,0.3);}
    else{s.strokeStyle='rgba(20,24,28,.4)';s.lineWidth=0.55;s.beginPath();s.moveTo(0,-146);s.lineTo(0,-104.5);s.stroke();s.strokeStyle='rgba(255,255,255,.4)';s.lineWidth=0.25;s.beginPath();s.moveTo(0.6,-146);s.lineTo(0.6,-104.5);s.stroke();
      edgeLine(()=>{s.beginPath();s.moveTo(-9.6,-147.2);s.quadraticCurveTo(0,-144.6,9.6,-147.2);},0.75);
      for(const sg of [1,-1]){s.fillStyle='#4a3020';s.beginPath();s.moveTo(sg*7.5,-148);s.lineTo(sg*10.3,-148);s.lineTo(sg*11.6,-136);s.lineTo(sg*8.8,-136);s.closePath();s.fill();s.strokeStyle='#c9a95a';s.lineWidth=0.32;s.strokeRect(sg*10.2-1.1,-137.6,2.2,2.6);
        for(const y of [-140,-118])rivet(sg*12.6,y,0.32);}}
    edgeLine(()=>{s.beginPath();s.moveTo(-torsoHW(-104)*1.07,-104);s.quadraticCurveTo(0,-102.6,torsoHW(-104)*1.07,-104);},0.5);}
  // ---- pauldrons over the cuirass, lames running down the upper arm, besagew at the armpit
  for(const [sd,sg] of [['near',1],['far',-1]]){const ua=fp(sd+'UpperArm');if(!WEAR.pauldrons.on||!ok(sd+'UpperArm')||!ua)continue;
    tube(ua,0.2,0.6,0.9,0.4);
    for(let i=3;i>=0;i--){const q=at(ua,0.12+i*0.09,1.4+(3-i)*0.25);s.beginPath();s.ellipse(q.x,q.y-0.4,q.r+0.5,2.6,0,0,Math.PI);s.lineTo(q.x-q.r-0.5,q.y-3);s.lineTo(q.x+q.r+0.5,q.y-3);s.closePath();fillSteel(q.x-q.r-1,q.x+q.r+1,q.y-3,q.y+2.6,0.42);rivet(q.x+sg*q.r*0.2,q.y+0.9,0.25);}
    const cx=ua.x1+sg*0.6,cy=ua.y1+1.4,rx=ua.r1+3.4,ry=ua.r1+2.6;s.beginPath();s.ellipse(cx,cy,rx,ry,0,Math.PI*0.92,Math.PI*2.08);s.closePath();fillSteel(cx-rx,cx+rx,cy-ry,cy,0.4);
    edgeLine(()=>{s.beginPath();s.ellipse(cx,cy,rx-0.4,ry-0.4,0,Math.PI*1.04,Math.PI*1.96);},0.7);rivet(cx-rx*0.6,cy-0.6);rivet(cx+rx*0.6,cy-0.6);
    if(!bk){const bx=ua.x1-sg*(ua.r1+1.6),by=ua.y1+6.5;s.beginPath();s.arc(bx,by,2.7,0,P2);const g=s.createRadialGradient(bx-0.9,by-0.9,0.2,bx,by,2.7);g.addColorStop(0,'#fbfcfd');g.addColorStop(0.55,'#9ea6ad');g.addColorStop(1,'#3e454b');s.fillStyle=g;s.fill();s.strokeStyle='rgba(16,19,22,.82)';s.lineWidth=0.3;s.stroke();
      edgeLine(()=>{s.beginPath();s.arc(bx,by,1.9,0,P2);},0.25);rivet(bx,by,0.45);}}
  // ---- gorget
  if(WEAR.gorget.on&&ok('neck')){for(let i=0;i<3;i++){const y=-146.6-i*2.3,rx=8.9-i*1.15,ry=3.5-i*0.35;s.beginPath();s.ellipse(0,y,rx,ry,0,0,P2);fillSteel(-rx,rx,y-ry,y+ry,0.45);edgeLine(()=>{s.beginPath();s.ellipse(0,y,rx-0.35,ry-0.3,0,0.15,Math.PI-0.15);},0.3);}
    rivet(-5.6,-146,0.3);rivet(5.6,-146,0.3);}
  // ---- close helm
  if(WEAR.helm.on&&ok('head')){s.beginPath();s.ellipse(0,-164.6,10,12.7,0,0,P2);const g=s.createRadialGradient(-3.4,-171,0.8,0,-164,13.5);g.addColorStop(0,'#fbfcfd');g.addColorStop(0.35,'#c4cbd1');g.addColorStop(0.7,'#7c858d');g.addColorStop(1,'#353b41');s.fillStyle=g;s.fill();s.fillStyle=ENV(-177,-152,0.8);s.fill();s.strokeStyle='rgba(16,19,22,.85)';s.lineWidth=0.35;s.stroke();
    s.lineCap='round';s.strokeStyle='rgba(16,19,22,.6)';s.lineWidth=1.1;s.beginPath();s.moveTo(0,-177);s.lineTo(0,bk?-153:-169.5);s.stroke();s.strokeStyle='#eef2f5';s.lineWidth=0.5;s.beginPath();s.moveTo(-0.15,-176.8);s.lineTo(-0.15,bk?-153.4:-169.7);s.stroke();
    if(!bk){s.beginPath();s.moveTo(-9.7,-167.2);s.quadraticCurveTo(0,-171.2,9.7,-167.2);s.lineTo(9.2,-160.6);s.quadraticCurveTo(0,-156.4,-9.2,-160.6);s.closePath();fillSteel(-10,10,-171,-157,0.44);
      s.strokeStyle='rgba(255,255,255,.7)';s.lineWidth=0.3;s.beginPath();s.moveTo(-0.1,-169.6);s.lineTo(-0.1,-157.6);s.stroke();
      s.fillStyle='#07090b';for(const sg of [-1,1]){s.beginPath();s.moveTo(sg*0.9,-167.6);s.lineTo(sg*7.6,-167);s.lineTo(sg*7.4,-166);s.lineTo(sg*0.9,-166.4);s.closePath();s.fill();}
      s.strokeStyle='rgba(255,255,255,.5)';s.lineWidth=0.15;s.beginPath();s.moveTo(-7.4,-165.8);s.lineTo(-0.9,-166.2);s.moveTo(0.9,-166.2);s.lineTo(7.4,-165.8);s.stroke();
      s.fillStyle='#07090b';for(let r=0;r<3;r++)for(let q=0;q<4;q++){s.beginPath();s.ellipse(-2.4-q*1.35-r*0.25,-162.8+r*1.45,0.42,0.28,0,0,P2);s.fill();}
      for(const sg of [-1,1])rivet(sg*9.4,-166.6,0.55);s.fillStyle='#c7ced4';s.fillRect(8.6,-162.6,1.6,0.8);
      for(let i=0;i<2;i++){const y=-158.4+i*2;s.beginPath();s.moveTo(-8.4+i*0.8,y-0.8);s.quadraticCurveTo(0,y+2.4,8.4-i*0.8,y-0.8);s.lineTo(8.1-i*0.8,y+1.4);s.quadraticCurveTo(0,y+3.6,-8.1+i*0.8,y+1.4);s.closePath();fillSteel(-9,9,y-1,y+3.6,0.45);}}
    else{for(let i=0;i<3;i++)edgeLine(()=>{s.beginPath();s.moveTo(-8.6+i*0.6,-157.6+i*1.6);s.quadraticCurveTo(0,-155.6+i*1.6,8.6-i*0.6,-157.6+i*1.6);},0.32);
      for(const x of [-6,-3,0,3,6])rivet(x,-158.8,0.28);}}
  steelMarksFront(s);
}
function drawArrowsFront(){const c=ctx;
  for(const S of ARSTUCK){if(!S.seg||!S.seg.connected)continue;let p=null,toward=false;
    if(S.front&&S.front.v===view){p={x:S.front.x,y:S.front.y};toward=true;}
    else{const rr=radS(S.seg,clamp(S.s,0,S.seg.len))||S.seg.ra,fr=S.w>0.3*rr,bkS=S.w<-0.3*rr;if(view==='front'&&!fr&&!(S.front&&S.front.v==='back'))continue;if(view==='back'&&!bkS&&!(S.front&&S.front.v==='front'))continue;p=frontPos(S.seg,S.s,clamp(S.z||0,-1,1));toward=!(S.front&&S.front.v!==view);}
    if(!p)continue;const d=ARDEF[S.k];
    if(toward){
      // the shaft points almost straight at you, so it is foreshortened; it leans a little and sags, and shudders after the hit
      const vis=d.len-S.depth,tl=S.tilt||(S.tilt={x:rnd(-0.14,0.14),y:rnd(0.06,0.2)}),age=T-(S.t||0),qv=Math.exp(-age/0.35)*Math.sin(2*Math.PI*11*age)*0.05;
      const tx=tl.x+qv*0.6,ty=tl.y+qv,nk={x:p.x+tx*vis,y:p.y+ty*vis},len=Math.max(0.01,Math.hypot(tx,ty)*vis),dx=(nk.x-p.x)/len,dy=(nk.y-p.y)/len,fr=len/vis;
      c.fillStyle='rgba(110,8,16,.7)';c.beginPath();c.arc(p.x,p.y,1.2,0,6.28);c.fill();
      c.lineCap='round';c.strokeStyle=d.shaft;c.lineWidth=0.8;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(nk.x,nk.y);c.stroke();c.strokeStyle='rgba(255,255,255,.25)';c.lineWidth=0.22;c.stroke();
      const f0=S.k==='crossbow'?1.5:2.5,f1=S.k==='crossbow'?7:11,h=S.k==='crossbow'?1.5:2.1,rot=S.rot??(S.rot=rnd(0,6.28));
      for(let i=0;i<3;i++){const ph=rot+i*2.094,ex=Math.cos(ph)*h,ey=Math.sin(ph)*h,ax=nk.x-dx*f0*fr,ay=nk.y-dy*f0*fr,bx=nk.x-dx*f1*fr,by=nk.y-dy*f1*fr;
        c.fillStyle=d.flet;c.beginPath();c.moveTo(bx+Math.cos(ph-0.5)*h*0.2,by+Math.sin(ph-0.5)*h*0.2);c.lineTo(ax+ex,ay+ey);c.lineTo(ax+Math.cos(ph+0.35)*h*0.3,ay+Math.sin(ph+0.35)*h*0.3);c.closePath();c.fill();c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=0.12;c.stroke();}
      c.fillStyle='#d8d23a';c.beginPath();c.arc(nk.x,nk.y,0.55,0,6.28);c.fill();c.fillStyle='rgba(0,0,0,.5)';c.fillRect(nk.x-0.5,nk.y-0.08,1,0.16);}
    else if(S.out>0.5){
      // seen from the far side: the head came out and points at you, foreshortened, bloodied, three steel blades
      const tl=S.tilt||(S.tilt={x:rnd(-0.14,0.14),y:rnd(0.06,0.2)}),k=-1,hx=p.x+tl.x*k*S.out,hy=p.y+tl.y*k*S.out*0.6;
      c.fillStyle='rgba(110,8,16,.75)';c.beginPath();c.arc(p.x,p.y,1.3,0,6.28);c.fill();
      c.lineCap='round';c.strokeStyle=d.shaft;c.lineWidth=0.8;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(hx,hy);c.stroke();c.strokeStyle='rgba(120,10,18,.6)';c.lineWidth=0.9;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(lerp(p.x,hx,0.6),lerp(p.y,hy,0.6));c.stroke();
      const rot=S.rot??(S.rot=rnd(0,6.28));for(let i=0;i<3;i++){const ph=rot+i*2.094;c.fillStyle='#c9ced3';c.beginPath();c.moveTo(hx,hy);c.lineTo(hx+Math.cos(ph)*1.5,hy+Math.sin(ph)*1.5);c.lineTo(hx+Math.cos(ph+0.5)*0.5,hy+Math.sin(ph+0.5)*0.5);c.closePath();c.fill();c.strokeStyle='rgba(110,10,16,.7)';c.lineWidth=0.15;c.stroke();}
      c.fillStyle='#eef1f3';c.beginPath();c.arc(hx,hy,0.3,0,6.28);c.fill();}
    else{c.fillStyle='rgba(90,20,40,.35)';c.beginPath();c.arc(p.x,p.y,1.7,0,6.28);c.fill();c.fillStyle='#c9ced3';c.beginPath();c.arc(p.x,p.y,0.45,0,6.28);c.fill();}}
  for(const g of FGLANCE)drawArrowShape(c,g.k,g.x,g.y,Math.cos(g.ang),Math.sin(g.ang),999);
  for(const f of FARROWS)if(f.v===view)drawFrontFlight(c,f);}
function drawSideWoundsFront(s){
  for(const seg of segs){if(!seg.connected)continue;
    for(const wd of seg.wounds){
      if((wd.ff&&view==='front')||wd.type==='stump')continue;const cc=woundCenter(wd);const rr=radS(seg,cc.s)||seg.ra;
      if((view==='back'?cc.w>0.4*rr:cc.w<-0.4*rr)&&wd.type!=='bruise'&&wd.type!=='burn')continue;
      const z=wd.z==null?0.85:wd.z;const p=wFix(wd,seg)||frontPos(seg,cc.s,z);if(!p)continue;
      if(wd.type==='bruise'&&(wd.abr||wd.pat||wd.swell||wd.eye)){drawBruiseVar(s,wd,p.x,p.y);continue;}
      if(wd.type==='bruise'){const g=s.createRadialGradient(p.x,p.y,0,p.x,p.y,wd.r);g.addColorStop(0,'rgba(80,35,85,.32)');g.addColorStop(1,'rgba(110,60,60,0)');s.fillStyle=g;s.beginPath();s.arc(p.x,p.y,wd.r,0,6.28);s.fill();continue;}
      if(wd.type==='burn'){if(wd.graft){s.fillStyle='#d79c8a';s.beginPath();s.arc(p.x,p.y,wd.r,0,6.28);s.fill();}else{if(wd.radBurn)drawRadBurn(s,p.x,p.y,wd.r,wd.deg,wd.rot);else drawBurn(s,p.x,p.y,wd.r,wd.deg,wd.rot,wd.melt,wd.chem,seg.kind);if(wd.gel)drawGel(s,p.x,p.y,wd.r,wd.rot);if(wd.band){s.fillStyle='rgba(239,236,228,.88)';s.beginPath();s.arc(p.x,p.y,wd.r*0.9,0,6.28);s.fill();}}continue;}
      if(!wd.band&&!wd.pack&&!(wd.sut>=1)&&wd.blood>0.2){const wdh=Math.max(0.4,(wd.r||0.5)*0.7);s.fillStyle='rgba(110,10,16,.82)';s.beginPath();s.moveTo(p.x-wdh,p.y);s.lineTo(p.x+wdh,p.y);s.lineTo(p.x+0.2,p.y+wd.blood*1.3);s.closePath();s.fill();s.beginPath();s.arc(p.x+0.2,p.y+wd.blood*1.3,wdh*0.55,0,6.28);s.fill();}
      if(wd.ooze){s.fillStyle='#6a0a10';s.beginPath();s.ellipse(p.x,p.y,0.42,0.32,0,0,6.28);s.fill();continue;}
      s.fillStyle='#3f070b';
      const su=wd.sut||0;
      if(wd.type==='cut'){const useB=view==='back'&&wd.bx1!=null;const p1=useB?{x:wd.bx1,y:wd.by1}:frontPos(seg,wd.s,z),p2=useB?{x:wd.bx2??wd.bx1,y:wd.by2??wd.by1}:frontPos(seg,wd.s2,z);if(!p1||!p2)continue;const sx=useB?0:(wd.w2-wd.w)*0.35;drawCutSkin(s,p1.x-sx,p1.y,p2.x+sx,p2.y,wd.r,su,(wd.s*3.1+wd.w*1.7)%6);}
      else if(wd.graft){s.fillStyle='#d79c8a';s.beginPath();s.arc(p.x,p.y,(wd.r||1)+0.4,0,6.28);s.fill();s.strokeStyle='rgba(95,40,35,.6)';s.lineWidth=0.2;s.stroke();}
      else if(wd.pack){s.fillStyle='#ece5d6';s.beginPath();s.arc(p.x,p.y,(wd.r||1)+0.4,0,6.28);s.fill();s.fillStyle='rgba(140,15,22,.45)';s.beginPath();s.arc(p.x,p.y,(wd.r||1)*0.6,0,6.28);s.fill();}
      else if(su>=1){s.fillStyle='rgba(120,40,45,.55)';s.beginPath();s.arc(p.x,p.y,wd.r*0.5,0,6.28);s.fill();stitches(s,p.x-wd.r-0.45,p.y,p.x+wd.r+0.45,p.y,1);}
      else if(wd.boneOut){ // open fracture: a ragged inside-out tear along the limb, with the bone end showing when still displaced
        const rx=Math.max(0.7,wd.r)*1.5,ry=Math.max(0.7,wd.r)*2.4;s.fillStyle='rgba(110,0,14,.22)';s.beginPath();s.ellipse(p.x,p.y,rx*1.6,ry*1.3,0,0,6.28);s.fill();
        s.fillStyle='#4a070c';s.beginPath();for(let i=0;i<12;i++){const a_=i/12*6.283,q=(i%2?0.9:1.02)*(0.9+0.12*Math.sin(i*2.3+wd.rot));i?s.lineTo(p.x+Math.cos(a_)*rx*q,p.y+Math.sin(a_)*ry*q):s.moveTo(p.x+Math.cos(a_)*rx*q,p.y+Math.sin(a_)*ry*q);}s.closePath();s.fill();
        s.fillStyle='#9e252d';s.beginPath();s.ellipse(p.x,p.y,rx*0.6,ry*0.75,0,0,6.28);s.fill();
        const j=wd.boneOut;if(!j.broken&&joints.includes(j)){const o=1+Math.min(1.4,(j.fi?j.fi.out:0)*0.5),hw=(j.fi&&j.fi.bo.width||1.6)*0.45;
          s.fillStyle='#efe6cf';s.strokeStyle='#a8977a';s.lineWidth=0.1;s.beginPath();const pts=[[-hw,-o*0.2],[-hw*0.5,-o],[hw*0.1,-o*0.55],[hw*0.6,-o*1.05],[hw,-o*0.1],[hw*0.7,o*0.5],[-hw*0.6,o*0.45]];
          pts.forEach((q,i)=>i?s.lineTo(p.x+q[0],p.y+q[1]):s.moveTo(p.x+q[0],p.y+q[1]));s.closePath();s.fill();s.stroke();
          s.fillStyle='rgba(140,30,35,.85)';s.beginPath();s.ellipse(p.x+hw*0.1,p.y-o*0.45,hw*0.35,o*0.2,0,0,6.28);s.fill();}}
      else if(wd.arrow&&wd.type==='hole')drawBroadheadWound(s,p.x,p.y,wd.r,wd.rot||0,su,!!wd.exit);
      else if(wd.type==='hole'&&!wd.dig&&!wd.jag&&su<0.5){woundArt(s,p.x,p.y,wd.r,{kind:seg.kind,exit:wd.exit,torn:wd.torn,bone:(wd.exit||wd.r>0.6)&&boneBrokenNear(seg,wd.s),seed:wd.s*3.1+wd.w*1.7,clot:clotOf(wd),tone:skinTone(false)});}
      else{const r=wd.r*(1-su);s.beginPath();s.arc(p.x,p.y,wd.r+0.55,0,6.28);s.fill();
        if(wd.type==='hole'&&!wd.dig&&su<0.5){s.fillStyle='#e7c66c';s.beginPath();s.arc(p.x,p.y,wd.r+0.4,0,6.28);s.fill();s.fillStyle='#9e252d';s.beginPath();s.arc(p.x,p.y,wd.r+0.22,0,6.28);s.fill();
          if((wd.exit||wd.r>0.6)&&boneBrokenNear(seg,wd.s)){s.fillStyle='#efe6cf';for(let i=0;i<4;i++){const a=wd.rot+i*1.7,d=wd.r*0.8;s.beginPath();s.arc(p.x+Math.cos(a)*d,p.y+Math.sin(a)*d,0.22,0,6.28);s.fill();}}}
        else{s.fillStyle='#7a1a20';s.beginPath();s.arc(p.x,p.y,wd.r+0.25,0,6.28);s.fill();}if(su>0){s.globalCompositeOperation='destination-out';s.beginPath();s.arc(p.x,p.y,Math.max(0.05,r),0,6.28);s.fill();s.globalCompositeOperation='source-over';stitches(s,p.x-wd.r-0.45,p.y,p.x+wd.r+0.45,p.y,su);continue;}s.globalCompositeOperation='destination-out';s.beginPath();
        if(wd.jag){const n=wd.jag.length;for(let i=0;i<=n;i++){const a=i/n*6.283,q=r*wd.jag[i%n];i?s.lineTo(p.x+Math.cos(a)*q,p.y+Math.sin(a)*q):s.moveTo(p.x+Math.cos(a)*q,p.y+Math.sin(a)*q);}}else s.arc(p.x,p.y,r,0,6.28);
        s.fill();s.globalCompositeOperation='source-over';}
      if(wd.band&&!wd.wrapped){s.fillStyle='#efece4';s.fillRect(p.x-1.5,p.y-1.2,3,2.4);}
    }}
}
function headBase(s,tone){
  s.fillStyle=rgb(tone,0.88);for(const sg of [1,-1]){s.beginPath();s.ellipse(sg*8.15,-163,1.35,2.7,sg*0.08,0,6.28);s.fill();}
  s.strokeStyle='rgba(80,40,30,.35)';s.lineWidth=0.22;for(const sg of [1,-1]){s.beginPath();s.arc(sg*8.1,-163,0.85,sg>0?-1.6:1.6,sg>0?1.4:4.6,sg<0);s.stroke();}
  const g=s.createRadialGradient(0,-165,1,0,-163.5,12);g.addColorStop(0,rgb(tone,1.05));g.addColorStop(0.7,rgb(tone,0.98));g.addColorStop(1,rgb(tone,0.84));
  s.fillStyle=g;s.beginPath();s.ellipse(0,-163.5,8.2,11.3,0,0,6.28);s.fill();
}
function bustFront(s,tone){
  for(const sg of [1,-1]){const x=sg*6.6,y=-127;
    const g=s.createRadialGradient(x+sg*1,y-2.1,0.4,x,y,5.7);g.addColorStop(0,rgb(tone,1.08));g.addColorStop(0.55,rgb(tone,1));g.addColorStop(0.85,rgb(tone,0.93));g.addColorStop(1,rgb(tone,0.86));
    s.fillStyle=g;s.beginPath();s.arc(x,y,5.4,0,6.28);s.fill();
    s.strokeStyle='rgba(90,45,35,.26)';s.lineWidth=0.4;s.beginPath();s.arc(x,y,5.4,0.25,2.9);s.stroke();
    s.fillStyle='rgba(90,45,35,.09)';s.beginPath();s.ellipse(x,y+5.2,4.3,0.85,0,0,6.28);s.fill();}}
function hairBehindFront(s){s.fillStyle=HAIRC;s.beginPath();s.moveTo(-8.6,-170);s.quadraticCurveTo(-11.4,-160,-11.6,-150);s.quadraticCurveTo(-11.8,-142,-10,-138.6);s.lineTo(10,-138.6);s.quadraticCurveTo(11.8,-142,11.6,-150);s.quadraticCurveTo(11.4,-160,8.6,-170);s.closePath();s.fill();
  s.strokeStyle='rgba(120,88,62,.35)';s.lineWidth=0.2;for(const sg of [1,-1])for(let i=0;i<4;i++){s.beginPath();s.moveTo(sg*(8.4+i*0.7),-162);s.quadraticCurveTo(sg*(9.8+i*0.5),-150,sg*(8.6+i*0.6),-139.5);s.stroke();}}
function hairFrontTop(s){
  s.fillStyle=HAIRC;s.beginPath();s.moveTo(-9,-177);s.lineTo(9,-177);s.lineTo(9,-158);s.quadraticCurveTo(8.2,-167,1.6,-171.4);s.lineTo(0.6,-171.8);s.quadraticCurveTo(-6.6,-170.4,-9,-160);s.closePath();s.fill();
  s.strokeStyle='rgba(120,88,62,.4)';s.lineWidth=0.16;for(let i=0;i<5;i++){s.beginPath();s.moveTo(1+i*0.4,-172.5);s.quadraticCurveTo(5+i*0.8,-170.5,7.4+i*0.3,-162+i);s.stroke();s.beginPath();s.moveTo(0.4-i*0.4,-172.5);s.quadraticCurveTo(-4.6-i*0.8,-170.5,-7+i*0.1,-163+i);s.stroke();}}
function hairFrontLocks(s){s.fillStyle=HAIRC;for(const sg of [1,-1]){s.beginPath();s.moveTo(sg*8.3,-169);s.quadraticCurveTo(sg*9.9,-158,sg*9.5,-148.5);s.lineTo(sg*7.6,-149.5);s.quadraticCurveTo(sg*7.9,-160,sg*6.6,-168.6);s.closePath();s.fill();}}
function hairBack(s){s.fillStyle=HAIRC;s.beginPath();s.ellipse(0,-164,8.8,11.7,0,Math.PI,2*Math.PI);s.lineTo(9.9,-150);s.quadraticCurveTo(10.8,-141,8.8,-138.4);s.lineTo(-8.8,-138.4);s.quadraticCurveTo(-10.8,-141,-9.9,-150);s.closePath();s.fill();
  s.strokeStyle='rgba(120,88,62,.4)';s.lineWidth=0.18;for(let i=-6;i<=6;i++){s.beginPath();s.moveTo(i*1.1,-175);s.quadraticCurveTo(i*1.35,-158,i*1.25,-139.5);s.stroke();}
  s.strokeStyle='rgba(20,12,8,.3)';s.lineWidth=0.3;s.beginPath();s.moveTo(0,-175.5);s.lineTo(0,-168);s.stroke();}
function drawFaceFront(s,tone){
  if(!SEG.head.connected)return;
  const F=face();headBase(s,tone);
  // the redesign's head: stubble, face shading and its hair cap; the game still draws the eyes, brows, nose and mouth
  // on top so they can move
  const art=!FEMALE&&SKINBMP.front;
  s.save();s.beginPath();s.ellipse(0,-163.5,8.2,11.3,0,0,6.28);for(const sg of [1,-1])s.ellipse(sg*8.15,-163,1.35,2.7,sg*0.08,0,6.28);s.clip();
  if(art){const b=SKINBMP.front;s.drawImage(b.cv,b.x0,b.y0,b.w,b.h);}
  s.restore();
  s.save();s.beginPath();s.ellipse(0,-163.5,8.2,11.3,0,0,6.28);s.clip();
  if(FEMALE)hairFrontTop(s);else if(!art){
  s.fillStyle='#2b211c';s.beginPath();s.moveTo(-9,-177);s.lineTo(9,-177);s.lineTo(9,-165.5);s.quadraticCurveTo(8.3,-170.6,4.6,-171);s.quadraticCurveTo(0,-170,-4.6,-171);s.quadraticCurveTo(-8.3,-170.6,-9,-165.5);s.closePath();s.fill();
  s.strokeStyle='rgba(95,76,62,.45)';s.lineWidth=0.16;for(let i=-6;i<=6;i++){s.beginPath();s.moveTo(i*1.2,-175);s.quadraticCurveTo(i*1.3+0.3,-173,i*1.25,-170.8);s.stroke();}}
  s.fillStyle='rgba(255,240,225,.10)';for(const sg of [1,-1]){s.beginPath();s.ellipse(sg*4.4,-160.5,2,1.4,0,0,6.28);s.fill();}
  s.fillStyle='rgba(70,35,30,.07)';s.beginPath();s.ellipse(0,-153.6,4.8,1.6,0,0,6.28);s.fill();
  s.restore();
  for(const sg of [1,-1]){
    const x=sg*3.1,y=-164;const eyeOK=!(V.eyesOut&&ORG.eye.hp<=0)&&(sg<0||ORG.eye.hp>0);
    s.fillStyle='rgba(60,30,25,.12)';s.beginPath();s.ellipse(x,y-0.2,1.9,1.15,0,0,6.28);s.fill();
    if(!eyeOK){s.fillStyle='#3a0a0e';s.beginPath();s.ellipse(x,y,1.2,0.8,0,0,6.28);s.fill();s.fillStyle='rgba(120,10,18,.8)';s.fillRect(x-0.2,y,0.4,2.6);}
    else if(F.squeeze>0.35&&F.open<0.2){s.strokeStyle='rgba(50,28,22,.9)';s.lineWidth=0.34;s.beginPath();s.moveTo(x-1.3,y+0.1);s.quadraticCurveTo(x,y-0.45*F.squeeze,x+1.3,y+0.1);s.stroke();
      s.lineWidth=0.14;s.strokeStyle='rgba(80,40,30,.5)';for(let i=0;i<3;i++){s.beginPath();s.moveTo(x+sg*1.4,y+(i-1)*0.35);s.lineTo(x+sg*2.2,y+(i-1)*0.65);s.stroke();}
      s.beginPath();s.moveTo(x-1.1,y+0.9);s.quadraticCurveTo(x,y+1.4,x+1.1,y+0.9);s.stroke();}
    else if(F.open>0.15){const h=0.55*Math.min(1.25,F.open);
      s.fillStyle='#f3efe7';s.beginPath();s.moveTo(x-1.3,y);s.quadraticCurveTo(x,y-h*1.7,x+1.3,y);s.quadraticCurveTo(x,y+h*1.2,x-1.3,y);s.fill();
      s.fillStyle=V.rot>0.5?'#cfd3c0':F.high?`hsl(${(T*90+sg*40)%360},55%,45%)`:'#4a6b7a';s.beginPath();s.arc(x,y-0.05,Math.min(0.55,h*0.95),0,6.28);s.fill();s.fillStyle=V.rot>0.5?'rgba(90,95,85,.8)':'#111';s.beginPath();s.arc(x,y-0.05,V.rot>0.5?0.12:Math.min(0.45,0.24*F.pupil,h*0.8),0,6.28);s.fill();
      s.fillStyle='rgba(255,255,255,.7)';s.beginPath();s.arc(x+0.18,y-0.25,0.1,0,6.28);s.fill();
      s.strokeStyle='rgba(40,25,20,.85)';s.lineWidth=0.26;s.beginPath();s.moveTo(x-1.3,y);s.quadraticCurveTo(x,y-h*1.7,x+1.3,y);s.stroke();
      s.strokeStyle='rgba(80,40,30,.25)';s.lineWidth=0.15;s.beginPath();s.moveTo(x-1.1,y+0.15);s.quadraticCurveTo(x,y+h*1.25,x+1.1,y+0.15);s.stroke();}
    else{s.strokeStyle='rgba(60,30,25,.75)';s.lineWidth=0.28;s.beginPath();s.moveTo(x-1.2,y);s.quadraticCurveTo(x,y+(F.dead?0.25:0.5),x+1.2,y);s.stroke();}
    s.strokeStyle='rgba(43,33,28,.85)';s.lineWidth=0.38;s.beginPath();s.moveTo(sg*(1.3-0.25*F.pain),y-1.7+F.pain*0.75-F.fear*0.9);s.quadraticCurveTo(sg*3,y-2.5+F.pain*0.25-F.fear*0.7,sg*4.7,y-1.9-F.pain*0.1-F.fear*0.35);s.stroke();
    if(F.tears){s.strokeStyle='rgba(185,220,255,.55)';s.lineWidth=0.22;const tx=x-sg*0.9;s.beginPath();s.moveTo(tx,y+0.5);s.quadraticCurveTo(tx-sg*0.2,y+2.4,tx+sg*0.1,y+4.2+Math.sin(T*2+sg)*0.3);s.stroke();s.fillStyle='rgba(205,235,255,.7)';s.beginPath();s.ellipse(tx+sg*0.1,y+4.3+Math.sin(T*2+sg)*0.3,0.18,0.26,0,0,6.28);s.fill();}
  }
  if(F.pain>0.35){s.strokeStyle=`rgba(80,40,30,${0.15+F.pain*0.3})`;s.lineWidth=0.16;for(const sg of [1,-1]){s.beginPath();s.moveTo(sg*0.45,-166.6);s.quadraticCurveTo(sg*0.6,-165.8,sg*0.4,-165.1);s.stroke();}}
  if(F.squeeze>0.35){s.strokeStyle='rgba(80,40,30,.35)';s.lineWidth=0.15;for(let i=0;i<2;i++){s.beginPath();s.moveTo(-0.9,-162.9+i*0.45);s.quadraticCurveTo(0,-163.2+i*0.45,0.9,-162.9+i*0.45);s.stroke();}
    for(const sg of [1,-1]){s.beginPath();s.moveTo(sg*1.6,-160.6);s.quadraticCurveTo(sg*2.6,-159,sg*2.5,-157.4);s.stroke();}}
  if(F.sweat){s.fillStyle='rgba(225,240,255,.55)';for(const [x,y] of [[-3.6,-170.2],[2.8,-169.4],[0.6,-171.6],[5.2,-167.5]]){s.beginPath();s.ellipse(x,y+((T*0.6+x+5)%2)*0.4,0.17,0.26,0,0,6.28);s.fill();}}
  s.strokeStyle='rgba(80,40,30,.2)';s.lineWidth=0.25;for(const sg of [1,-1]){s.beginPath();s.moveTo(sg*0.8,-163.6);s.quadraticCurveTo(sg*1,-161.5,sg*1.3,-160.2);s.stroke();}
  s.fillStyle=rgb(tone,1.06);s.beginPath();s.ellipse(0,-159.9,0.85,0.7,0,0,6.28);s.fill();
  s.fillStyle='rgba(70,30,25,.55)';for(const sg of [1,-1]){s.beginPath();s.ellipse(sg*0.7,-159.3,0.38,0.2,sg*0.3,0,6.28);s.fill();}
  s.strokeStyle='rgba(80,40,30,.28)';s.lineWidth=0.2;for(const sg of [1,-1]){s.beginPath();s.arc(sg*1.05,-159.7,0.5,sg>0?-0.6:1.9,sg>0?1.2:3.7);s.stroke();}
  s.beginPath();s.moveTo(-0.25,-158.8);s.lineTo(-0.25,-157.4);s.moveTo(0.25,-158.8);s.lineTo(0.25,-157.4);s.stroke();
  const mo=Math.max(F.gasp*0.9,F.slack?0.4:0);
  if(F.scream){s.fillStyle='#2e0f0e';s.beginPath();s.ellipse(0,-155.7,1.7,1.9,0,0,6.28);s.fill();s.fillStyle='rgba(240,235,225,.92)';s.fillRect(-1.25,-157.45,2.5,0.45);s.fillRect(-1.0,-154.25,2.0,0.35);s.fillStyle='rgba(200,90,95,.8)';s.beginPath();s.ellipse(0,-154.7,0.9,0.45,0,0,6.28);s.fill();s.strokeStyle='rgba(150,75,70,.7)';s.lineWidth=0.3;s.beginPath();s.ellipse(0,-155.7,1.75,1.95,0,0,6.28);s.stroke();}
  else if(F.grimace){const g=F.pain,w2=1.6+g*0.9,h2=0.42+g*0.35;s.fillStyle='#3a1514';s.beginPath();s.moveTo(-w2,-156.3+g*0.35);s.quadraticCurveTo(0,-157.0-h2,w2,-156.3+g*0.35);s.quadraticCurveTo(0,-155.5+h2*0.6,-w2,-156.3+g*0.35);s.fill();
    s.save();s.clip();s.fillStyle='rgba(242,238,228,.95)';s.fillRect(-w2,-157.2-h2,2*w2,0.62+h2*0.6);s.fillRect(-w2,-156.35,2*w2,0.4+h2);s.strokeStyle='rgba(120,100,90,.6)';s.lineWidth=0.06;for(let i=-3;i<=3;i++){s.beginPath();s.moveTo(i*0.42,-157.4-h2);s.lineTo(i*0.42,-155.4);s.stroke();}s.strokeStyle='rgba(60,30,28,.7)';s.lineWidth=0.1;s.beginPath();s.moveTo(-w2,-156.4);s.lineTo(w2,-156.4);s.stroke();s.restore();
    s.strokeStyle='rgba(150,75,70,.75)';s.lineWidth=0.28;s.beginPath();s.moveTo(-w2,-156.3+g*0.35);s.quadraticCurveTo(0,-157.0-h2,w2,-156.3+g*0.35);s.quadraticCurveTo(0,-155.5+h2*0.6,-w2,-156.3+g*0.35);s.stroke();}
  else{
  s.fillStyle='rgba(165,85,80,.6)';s.beginPath();s.moveTo(-1.8,-156.6);s.quadraticCurveTo(-0.6,-157.3,0,-157);s.quadraticCurveTo(0.6,-157.3,1.8,-156.6);s.quadraticCurveTo(0,-156.2,-1.8,-156.6);s.fill();
  s.fillStyle='rgba(175,95,90,.45)';s.beginPath();s.ellipse(0,-155.85,1.35,0.5,0,0,6.28);s.fill();
  if(mo>0.15){s.fillStyle='#3e1514';s.beginPath();s.ellipse(0,-156.3,1.3+mo*0.3,0.25+mo*0.75,0,0,6.28);s.fill();s.fillStyle='rgba(240,235,225,.85)';s.fillRect(-0.9,-156.3-0.25-mo*0.6,1.8,0.3);}
  else{s.strokeStyle='rgba(110,45,42,.75)';s.lineWidth=0.25;s.beginPath();s.moveTo(-1.8,-156.55+F.pain*0.3);s.quadraticCurveTo(0,-156.35,1.8,-156.55+F.pain*0.3);s.stroke();}
  }
  s.strokeStyle='rgba(80,40,30,.18)';s.lineWidth=0.2;s.beginPath();s.arc(0,-153.4,1.1,0.4,2.7);s.stroke();
  if(FEMALE)hairFrontLocks(s);
}
function drawHeadBack(s,tone){
  if(!SEG.head.connected)return;
  headBase(s,tone);
  s.save();s.beginPath();s.ellipse(0,-163.5,8.2,11.3,0,0,6.28);s.clip();
  s.fillStyle='#2b211c';s.beginPath();s.moveTo(-9,-177);s.lineTo(9,-177);s.lineTo(9,-159.5);s.quadraticCurveTo(5,-156,0,-156.4);s.quadraticCurveTo(-5,-156,-9,-159.5);s.closePath();s.fill();
  s.strokeStyle='rgba(95,76,62,.45)';s.lineWidth=0.16;for(let i=-7;i<=7;i++){s.beginPath();s.moveTo(i*1.1,-174);s.quadraticCurveTo(i*1.2,-166,i*1.05,-157.5);s.stroke();}
  s.restore();
  s.strokeStyle='rgba(90,45,35,.2)';s.lineWidth=0.3;s.beginPath();s.moveTo(0,-155.5);s.lineTo(0,-146);s.stroke();
  if(FEMALE)hairBack(s);
}
function backDetails(s){
  s.strokeStyle='rgba(90,45,35,.22)';s.lineWidth=0.35;
  s.beginPath();s.moveTo(0,-145);s.quadraticCurveTo(0.3,-120,0,-96);s.stroke();
  s.fillStyle='rgba(255,240,225,.09)';
  for(const sg of [1,-1]){
    s.beginPath();s.moveTo(sg*3.5,-139.5);s.quadraticCurveTo(sg*10,-141.5,sg*12.5,-136.5);s.quadraticCurveTo(sg*11,-128,sg*5,-125.5);s.stroke();
    s.beginPath();s.ellipse(sg*8,-133,3.6,4.8,0,0,6.28);s.fill();
    s.beginPath();s.ellipse(sg*6.5,-115,3.5,7,0,0,6.28);s.fill();
    s.beginPath();s.ellipse(sg*7.2,-90,6,5,0,0,6.28);s.fill();
    s.beginPath();s.moveTo(sg*1,-84.5);s.quadraticCurveTo(sg*7,-81.5,sg*13,-85.5);s.stroke();
    s.fillStyle='rgba(90,45,35,.35)';s.beginPath();s.arc(sg*3.2,-97,0.35,0,6.28);s.fill();s.fillStyle='rgba(255,240,225,.09)';
    if(SEG[(sg>0?'near':'far')+'Shin'].connected){s.beginPath();s.moveTo(sg*6,-51);s.quadraticCurveTo(sg*8.5,-50,sg*11,-51);s.stroke();s.beginPath();s.ellipse(sg*8.6,-38,3.8,9,0,0,6.28);s.fill();}
    s.beginPath();s.arc(sg*21.6,-110,1.6,0.2,2.9);s.stroke();
    s.beginPath();s.moveTo(sg*13,-142);s.quadraticCurveTo(sg*8,-146,sg*4.5,-149);s.stroke();
  }
  s.beginPath();s.moveTo(0,-95);s.lineTo(0,-84);s.stroke();
  handFrontDetail(s,skinTone(false),true);
}
function drawWrapsFront(s){
  for(const seg of segs){if(!seg.connected||!seg.wraps||!seg.wraps.length)continue;const f=fpOf(seg);if(!f)continue;
    for(const W of seg.wraps){
      s.save();if(anyWear()&&wrapCovered(seg,W)){frontSilhouette(s);s.clip();}
      if(f.t==='cap'){let t0,t1;if(seg.kind==='neck'){t0=(seg.rest.ay+W.s0-f.y1)/(f.y2-f.y1);t1=(seg.rest.ay+W.s1-f.y1)/(f.y2-f.y1);}else{t0=fpT(seg,W.s0);t1=fpT(seg,W.s1);}t0=clamp(Math.min(t0,t1),-0.15,1.1);t1=clamp(Math.max(t0,t1),-0.15,1.1);if(t1-t0<0.01){s.restore();continue;}capBand(s,f,t0,t1,0.45);}
      else if(f.t==='torso'){const y0=clamp(seg.rest.ay+W.s0,f.y0,f.y1),y1=clamp(seg.rest.ay+W.s1,f.y0,f.y1);if(y1-y0<0.3){s.restore();continue;}torsoBand(s,y0,y1,1.035);}
      else{const y0=seg.kind==='foot'?f.cy-f.ry:seg.rest.ay+W.s0,y1=seg.kind==='foot'?f.cy+f.ry:seg.rest.ay+W.s1;s.beginPath();s.rect(f.cx-f.rx-2,y0,2*f.rx+4,y1-y0);s.clip();s.beginPath();s.ellipse(f.cx,f.cy,f.rx+0.45,f.ry+0.45,0,0,6.28);}
      s.fillStyle='#ece8de';s.fill();s.clip();
      const b=s.getTransform?null:null;
      s.strokeStyle='rgba(140,128,108,.5)';s.lineWidth=0.14;for(let y=-190;y<10;y+=1.5){s.beginPath();s.moveTo(-40,y);s.lineTo(40,y+12);s.stroke();}
      for(const wd of seg.wounds){if(!wd.wrapped)continue;const p=woundFrontXY(seg,wd);if(!p)continue;const bl=wd.type==='burn'?0.3:(wd.bleed+0.15);const soak=clamp(0.18+wd.age*0.006*bl,0.15,0.75);const r=(wd.r||1)+1.3;const col=wd.type==='burn'?'200,160,90':'150,18,24';const gr=s.createRadialGradient(p.x,p.y,0,p.x,p.y,r*1.6);gr.addColorStop(0,`rgba(${col},${soak})`);gr.addColorStop(1,`rgba(${col},0)`);s.fillStyle=gr;s.fillRect(p.x-r*1.6,p.y-r*1.6,r*3.2,r*3.2);}
      s.restore();
    }}
}
