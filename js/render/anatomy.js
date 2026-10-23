/* TRAUMA_LAB_MAIN */
/* ===== render/anatomy.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
// side view: skin tenting over the fragment, or the bone end sticking out of the wound
function drawOpenFrac(c,seg){
  if(OPT.gore===0)return;
  for(const j of joints){if(j.key!=='frac'||j.broken||j.p!==seg.idx||!j.fi)continue;const f=j.fi;if(f.p!==seg)continue;
    const s0=Math.max(0.5,seg.len-0.6),R=radS(seg,s0)||seg.rb,sd=f.side;
    if(!j.openW){if(f.eps<0.08)continue;const hb=Math.min(1.6,f.h*0.55);c.fillStyle=rgb(skinTone(seg.side==='far'),1);ell(c,sd*(R+hb*0.35),s0,hb*0.75+0.3,1.3,0);c.fill();
      c.fillStyle=`rgba(255,250,240,${Math.min(0.5,f.eps)})`;ell(c,sd*(R+hb*0.55),s0,0.35+hb*0.3,0.6,0);c.fill();continue;}
    if(j.openW.sut>=1)continue;
    // the proximal fragment keeps going straight while the limb below turns away, so its jagged end comes out of the convex side
    const out=clamp(f.out+0.5,0.5,3.4),hw=(f.bo.width||1.6)*0.5,dl=Math.hypot(0.85,0.55),dx=sd*0.85/dl,dy=0.55/dl,L=out+0.7;
    const bx=sd*(R-0.7),by=s0-0.3,P1=[bx-dy*hw*sd,by+dx*hw*sd],P2=[bx+dy*hw*sd,by-dx*hw*sd];
    c.fillStyle='#4a070c';ell(c,sd*(R-0.05),s0-0.25,0.55+hw*0.4,hw+0.55,0);c.fill();
    c.fillStyle='rgba(150,25,32,.8)';ell(c,sd*(R+0.05),s0-0.25,0.3+hw*0.3,hw+0.3,0);c.fill();
    const g=c.createLinearGradient(P1[0],P1[1],P2[0],P2[1]);g.addColorStop(0,'#d9ccad');g.addColorStop(0.5,'#f3ead3');g.addColorStop(1,'#cdbd9b');
    c.fillStyle=g;c.strokeStyle='#9c8a6a';c.lineWidth=0.12;c.beginPath();c.moveTo(P1[0],P1[1]);
    const at=(P,k,inw)=>[P[0]+dx*L*k+(bx-P[0])*inw,P[1]+dy*L*k+(by-P[1])*inw];
    for(const q of [at(P1,0.75,0.3),at(P1,0.95,0.55),[bx+dx*L*1.12,by+dy*L*1.12],at(P2,0.8,0.65),at(P2,0.62,0.2),at(P2,0.4,0.05),P2])c.lineTo(q[0],q[1]);c.closePath();c.fill();c.stroke();
    {const m=at(P2,0.7,0.5);c.fillStyle='rgba(140,30,35,.85)';ell(c,m[0],m[1],hw*0.3,hw*0.22,0);c.fill();} // marrow cavity at the broken end
    c.fillStyle='rgba(125,12,20,.75)';for(let k=0;k<2;k++){const q=at(k?P1:P2,0.1,0.2);ell(c,q[0],q[1],0.22,0.1,Math.atan2(dy,dx));c.fill();}}
}
function drawXrayMarks(front){
  const c=ctx,sc=Math.max(1,1.6/VS),pul=0.55+0.45*Math.sin(T*5);
  for(const id in ORG){const o=ORG[id];if(!o.seg.connected||!XL('organs'))continue;const bad=o.hp<100;if(!bad)continue;
    let x,y,rx,ry,rot=0;if(front){const p=frontOrganXY(o);x=p.x;y=p.y;rx=p.rx;ry=p.ry;}else{const g=o.seg,q=toWorld(g,o.s,o.w);x=q.x;y=q.y;rx=o.rw;ry=o.rs;const f=frame(g);rot=Math.atan2(f.uy,f.ux)-Math.PI/2;}
    c.save();c.translate(x,y);c.rotate(rot);c.strokeStyle=o.hp<=0?`rgba(255,60,80,${pul})`:o.contused&&!o.pierced?`rgba(190,110,255,${pul})`:`rgba(255,120,60,${pul})`;c.lineWidth=0.5*sc;c.setLineDash([1.2*sc,0.8*sc]);c.beginPath();c.ellipse(0,0,rx+0.6,ry+0.6,0,0,6.28);c.stroke();c.setLineDash([]);
    if(orgBleed(o)>0.3){c.fillStyle=`rgba(255,40,60,${0.18*pul})`;c.beginPath();c.ellipse(0,0,rx,ry,0,0,6.28);c.fill();}c.restore();}
  if(!front){for(const v of XL('vessels')?VESSELS:[]){if(v.cut<=0||!v.at||!v.seg.connected||v.lig)continue;const p=toWorld(v.seg,v.at.s,v.at.w||0);c.fillStyle=`rgba(255,40,60,${0.6*pul})`;c.beginPath();c.arc(p.x,p.y,(1+v.now*0.15)*sc,0,6.28);c.fill();}
    for(const b of []){if(!b.broken||!b.seg.connected||b.shape!=='line')continue;const t=b.pts[Math.floor(b.pts.length/2)]||b.pts[0];const sp=b.pts.length>1?lerp(b.pts[0][0],b.pts[b.pts.length-1][0],b.bp||0.5):t[0];const p=toWorld(b.seg,sp,t[1]);c.strokeStyle=`rgba(255,220,90,${0.5+0.5*pul})`;c.lineWidth=0.45*sc;c.beginPath();c.moveTo(p.x-2*sc,p.y-1.5*sc);c.lineTo(p.x-0.7*sc,p.y+1*sc);c.lineTo(p.x+0.7*sc,p.y-1*sc);c.lineTo(p.x+2*sc,p.y+1.5*sc);c.stroke();}}
  if(PROBE){const p=PROBE.w;c.strokeStyle='rgba(120,200,255,.9)';c.lineWidth=0.35*sc;c.beginPath();c.arc(p.x,p.y,3*sc,0,6.28);c.moveTo(p.x-5*sc,p.y);c.lineTo(p.x-1.5*sc,p.y);c.moveTo(p.x+1.5*sc,p.y);c.lineTo(p.x+5*sc,p.y);c.moveTo(p.x,p.y-5*sc);c.lineTo(p.x,p.y-1.5*sc);c.moveTo(p.x,p.y+1.5*sc);c.lineTo(p.x,p.y+5*sc);c.stroke();}
}
function drawMuscles(c,seg){
  for(const m of seg.muscles){
    c.save();c.translate(m.w,m.s);c.rotate(m.rot);const rw=m.rw,rs=m.rs;
    if(m.k==='flat'){ell(c,0,0,rw,rs);const g=c.createLinearGradient(-rw,0,rw,0);g.addColorStop(0,'rgba(120,32,40,.92)');g.addColorStop(0.5,'rgba(176,64,72,.92)');g.addColorStop(1,'rgba(122,34,42,.92)');c.fillStyle=g;c.fill();
      c.clip();c.strokeStyle='rgba(255,195,185,.2)';c.lineWidth=0.14;for(let k=-5;k<=5;k++){c.beginPath();c.moveTo(k*rw*0.12,-rs);c.lineTo(k*rw*0.3,rs);c.stroke();}
      c.restore();c.save();c.translate(m.w,m.s);c.rotate(m.rot);c.strokeStyle='rgba(235,220,210,.35)';c.lineWidth=0.18;ell(c,0,0,rw,rs);c.stroke();c.restore();continue;}
    const t=m.t==null?0:m.t*rs;
    if(m.k==='fus'&&t>0){c.strokeStyle='rgba(232,228,215,.85)';c.lineCap='round';c.lineWidth=Math.max(0.18,rw*0.28);c.beginPath();c.moveTo(0,-rs*0.92);c.lineTo(0,-rs-t*0.5);c.moveTo(0,rs*0.92);c.lineTo(0,rs+t);c.stroke();}
    c.beginPath();c.moveTo(0,-rs);c.bezierCurveTo(rw*1.35,-rs*0.55,rw*1.35,rs*0.55,0,rs);c.bezierCurveTo(-rw*1.35,rs*0.55,-rw*1.35,-rs*0.55,0,-rs);
    const g=c.createLinearGradient(-rw,0,rw,0);g.addColorStop(0,'#74202a');g.addColorStop(0.45,'#b4434b');g.addColorStop(0.6,'#c25058');g.addColorStop(1,'#7a232c');c.fillStyle=g;c.fill();
    c.save();c.clip();c.strokeStyle='rgba(255,200,190,.22)';c.lineWidth=0.14;for(let k=-3;k<=3;k++){c.beginPath();c.moveTo(k*rw*0.18,-rs);c.quadraticCurveTo(k*rw*0.38,0,k*rw*0.18,rs);c.stroke();}
    c.fillStyle='rgba(255,235,225,.12)';ell(c,-rw*0.35,-rs*0.2,rw*0.25,rs*0.45);c.fill();c.restore();
    c.strokeStyle='rgba(60,8,14,.45)';c.lineWidth=0.14;c.stroke();
    c.restore();
  }
}
function interiorClip(seg){const p=new Path2D();let any=false;for(const w of seg.wounds){if(!w.ooze&&(w.type==='hole'||w.type==='cut'||w.type==='stump')&&!(w.sut>=1)){woundPath(p,w,0.8);any=true;}}return any?p:null;}
function interiorKey(seg){let a=0;for(const b of seg.bones)a+=(b.plates?b.plates.length*13:0);a+=(seg.ribPlates||0)*3;for(const o of seg.organs)a+=o.hp+(o.hits?o.hits.length*7:0)+(o.out||0)*53;for(const v of seg.vessels)a+=v.cut*3+(v.at?1:0)+(v.lig?2:0);for(const b of seg.bones)a+=b.broken?5:0;for(const w of seg.wounds)a+=w.r*1.7+(w.sut>=1?11:0)+(w.dig||0)+(w.type==='cut'?w.len||0:0);return seg.wounds.length+'/'+seg.tracks.length+'/'+seg.ribsBroken+'/'+seg.len.toFixed(1)+'/'+a.toFixed(2);}
function drawInterior(seg){
  let hc=null;if(!xray){hc=interiorClip(seg);if(!hc)return;}
  const res=(zooming()&&seg.icache&&seg.icache.res)?seg.icache.res:VS*DPR>10?14:VS*DPR>6?9:5,r=Math.max(seg.ra,seg.rb)+1.6,L=seg.len,key=interiorKey(seg)+'|'+res+'|'+xlKey()+'|'+(seg.dents?seg.dents.map(d=>d.d.toFixed(1)).join():'');
  let ic=seg.icache;
  if(!ic||ic.key!==key){
    const w=Math.ceil(2*r*res),h=Math.ceil((L+2*r)*res);
    if(!ic||ic.cv.width!==w||ic.cv.height!==h){ic={cv:document.createElement('canvas')};ic.cv.width=w;ic.cv.height=h;ic.cx=ic.cv.getContext('2d');}
    ic.cx.setTransform(1,0,0,1,0,0);ic.cx.clearRect(0,0,w,h);ic.cx.setTransform(res,0,0,res,r*res,r*res);
    NOBREATH=true;drawInteriorTo(ic.cx,seg);NOBREATH=false;ic.key=key;ic.res=res;seg.icache=ic;
  }
  const c=ctx;setLocal(c,seg);c.save();if(xray&&seg.side==='near'&&LIMBK.includes(seg.kind))c.globalAlpha=0.55;const bl=bitesOf(seg);if(bl.length)clipBites(c,seg,bl);if(hc)c.clip(hc);c.drawImage(ic.cv,-r,-r,2*r,L+2*r);c.restore();
}
function drawInteriorTo(c,seg){
  c.save();const [ra,rb]=segRad(seg);segPath(c,seg,ra,rb);c.clip();
  const r=Math.max(ra,rb),L=seg.len,cav=seg.kind==='chest'||seg.kind==='abd'||seg.kind==='head';
  const lM=XL('muscles'),lO=XL('organs'),lV=XL('vessels'),lB=XL('bones'),lN=XL('nerves');
  if(lM){if(cav){const g=c.createLinearGradient(-r,0,r,0);g.addColorStop(0,'#3a0f13');g.addColorStop(0.5,'#55181d');g.addColorStop(1,'#401115');c.fillStyle=g;}else c.fillStyle=C.muscle;}
  else c.fillStyle=cav?'rgba(26,18,24,.32)':'rgba(20,22,30,.26)';
  c.fillRect(-r-1,-r-1,2*r+2,L+2*r+2);
  if(lM){if(!cav){c.strokeStyle=C.fiber;c.lineWidth=0.25;for(let k=-3;k<=3;k++){c.beginPath();c.moveTo(k*r/4,-r);c.lineTo(k*r/4*0.85,L+r);c.stroke();}}
    drawMuscles(c,seg);
    segPath(c,seg,ra,rb);c.strokeStyle=C.fat;c.lineWidth=1.6;c.stroke();}
  segPath(c,seg,ra,rb);c.strokeStyle=lM?'#e9c9a8':'rgba(200,215,235,.16)';c.lineWidth=0.35;c.stroke();
  if(seg.kind==='chest'){if(lB){drawBones(c,seg,'back');drawPlatesSide(c,seg);}if(lO)for(const o of seg.organs)drawOrgan(c,o,o.w,o.s,o.rw,o.rs,o.rot);
    if(lM){c.strokeStyle='#8a2e34';c.lineWidth=0.9;c.beginPath();c.moveTo(-9,22.5);c.quadraticCurveTo(0,13.5,10,20.5);c.stroke();}
    if(lV)drawVessels(c,seg);if(lN)drawNerves(c,seg);if(lB)drawBones(c,seg,'front');}
  else{if(lB){drawBones(c,seg);drawPlatesSide(c,seg);}if(lN)drawNerves(c,seg);if(lV)drawVessels(c,seg);if(lO)for(const o of seg.organs)drawOrgan(c,o,o.w,o.s,o.rw,o.rs,o.rot);}
  c.lineCap='round';
  for(const t of seg.tracks){const dx=t.w2-t.w1,ds=t.s2-t.s1,L=Math.hypot(dx,ds)||1,nx=-ds/L,ny=dx/L;
    c.strokeStyle='rgba(120,10,18,.45)';c.lineWidth=t.r*3.4;c.lineCap='round';c.beginPath();c.moveTo(t.w1,t.s1);c.lineTo(t.w2,t.s2);c.stroke();
    // ragged channel edges with torn fibre ends
    c.fillStyle='#4a0810';c.beginPath();const N=Math.max(3,Math.ceil(L/0.6));for(let i=0;i<=N;i++){const f=i/N,j=t.r*(1.15+0.35*Math.sin(i*2.3+t.s1));c.lineTo(t.w1+dx*f+nx*j,t.s1+ds*f+ny*j);}for(let i=N;i>=0;i--){const f=i/N,j=t.r*(1.15+0.35*Math.cos(i*1.9+t.w1));c.lineTo(t.w1+dx*f-nx*j,t.s1+ds*f-ny*j);}c.closePath();c.fill();
    c.strokeStyle=C.track;c.lineWidth=t.r*1.1;c.beginPath();c.moveTo(t.w1,t.s1);c.lineTo(t.w2,t.s2);c.stroke();
    c.strokeStyle='rgba(220,120,120,.6)';c.lineWidth=0.1;for(let i=1;i<N;i++){const f=i/N;for(const sg of [1,-1]){const bx=t.w1+dx*f+nx*t.r*1.2*sg,by=t.s1+ds*f+ny*t.r*1.2*sg;c.beginPath();c.moveTo(bx,by);c.lineTo(bx+nx*0.5*sg+dx/L*0.2,by+ny*0.5*sg+ds/L*0.2);c.stroke();}}}
  for(const w of seg.wounds){
    if(w.type!=='hole'&&w.type!=='cut'&&w.type!=='stump')continue;
    if(w.sut>=1)continue;
    if(isBite(w)){c.strokeStyle='#e2c26a';c.lineWidth=0.45;woundPath(c,w,0.1);c.stroke();c.strokeStyle='rgba(158,37,45,.9)';c.lineWidth=0.35;woundPath(c,w,-0.3);c.stroke();if(boneBrokenNear(seg,w.s))woundLayers.shards(c,w,8,0.3);continue;}
    c.strokeStyle=C.fat;c.lineWidth=0.5;woundPath(c,w,-0.12);c.stroke();
    if(w.type==='stump'){const b=seg.bones.find(x=>x.shape==='line');c.fillStyle='rgba(40,0,4,.5)';woundPath(c,w,-0.6);c.fill();
      if(b){const bw=b.width;c.fillStyle=C.bone;ell(c,0,w.s,bw*0.75,bw*0.5);c.fill();c.fillStyle='#a5463f';ell(c,0,w.s,bw*0.35,bw*0.22);c.fill();}}
    else if(w.dig){const g=c.createRadialGradient(w.w,w.s,0,w.w,w.s,w.r);g.addColorStop(0,'#120102');g.addColorStop(0.55,'#3e080d');g.addColorStop(1,'#7a2026');c.fillStyle=g;woundPath(c,w,-0.15);c.fill();c.strokeStyle='rgba(190,80,85,.6)';c.lineWidth=0.18;for(let i=0;i<10;i++){const a=i*0.63+w.rot,r1=w.r*0.95,r2=w.r*rnd(0.55,0.8);c.beginPath();c.moveTo(w.w+Math.cos(a)*r1,w.s+Math.sin(a)*r1);c.lineTo(w.w+Math.cos(a+0.1)*r2,w.s+Math.sin(a+0.1)*r2);c.stroke();}}
    else if(w.r>0.6||w.type==='cut'){c.fillStyle='rgba(30,0,4,.55)';woundPath(c,w,-0.45);c.fill();}
  }
  if(seg.side==='far'){c.fillStyle='rgba(8,10,14,.33)';c.fillRect(-r-1,-r-1,2*r+2,L+2*r+2);}
  c.restore();
}
function drawNerves(c,seg){c.lineCap='round';c.strokeStyle='#e3c96a';for(const n of seg.nerves){c.lineWidth=n.w;strokePts(c,n.pts);}}
function drawVessels(c,seg){
  c.lineCap='round';c.lineJoin='round';
  for(const k of seg.capil){c.strokeStyle=k.type==='a'?'rgba(222,52,62,.85)':'rgba(92,102,196,.8)';c.lineWidth=k.w;strokePts(c,k.pts);}
  for(const v of seg.vessels){if(v.stump)continue;const a=v.type==='a';
    if(v.pts.length>=2&&!v.deep){const P0=v.pts,n=P0.length;for(let i=0;i<n-1;i++){const tw=v.width*(1-0.3*(i/(n-1)));c.strokeStyle=a?'#8f0f18':'#262c70';c.lineWidth=tw+0.25;c.beginPath();c.moveTo(P0[i][1],P0[i][0]);c.lineTo(P0[i+1][1],P0[i+1][0]);c.stroke();}}
    c.strokeStyle=a?'#8f0f18':'#2c3480';c.lineWidth=v.width+0.25;strokePts(c,v.pts);
    c.strokeStyle=a?C.art:C.vein;c.lineWidth=v.width;strokePts(c,v.pts);
    if(!a&&v.width>0.5){c.fillStyle='rgba(150,165,240,.55)';const P0=v.pts;for(let i=0;i<P0.length-1;i++){const L_=Math.hypot(P0[i+1][0]-P0[i][0],P0[i+1][1]-P0[i][1]);for(let d=3;d<L_;d+=5){const t=d/L_;ell(c,lerp(P0[i][1],P0[i+1][1],t),lerp(P0[i][0],P0[i+1][0],t),v.width*0.32,0.25);c.fill();}}}
    c.strokeStyle=a?'rgba(255,150,150,.45)':'rgba(170,180,255,.4)';c.lineWidth=Math.max(0.1,v.width*0.25);strokePts(c,v.pts.map(p=>[p[0],p[1]+v.width*0.2]));
    if(v.cut>0&&v.at){c.fillStyle=C.track;ell(c,v.at.w,v.at.s,v.width*0.9+0.4,v.width*0.9+0.4);c.fill();c.fillStyle='rgba(200,20,30,.5)';ell(c,v.at.w,v.at.s,v.width*1.8+0.6,v.width*1.4+0.6);c.fill();}}
}
const BC='#ece3cb',BE='#a8987a',BS='rgba(150,135,105,.55)';
function bpoly(c,pts,fill,stroke,lw){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fillStyle=fill||BC;c.fill();if(stroke!==false){c.strokeStyle=stroke||BE;c.lineWidth=lw||0.14;c.stroke();}}
function bell(c,x,y,rx,ry,rot,fill){ell(c,x,y,rx,ry,rot);c.fillStyle=fill||BC;c.fill();c.strokeStyle=BE;c.lineWidth=0.14;c.stroke();}
// a long bone shaft with flared ends, drawn between (w0,s0) and (w1,s1)
function shaft(c,w0,s0,w1,s1,wd,flA,flB,bow){
  const dx=w1-w0,ds=s1-s0,L=Math.hypot(dx,ds)||1,nx=-ds/L,ny=dx/L,ux=dx/L,uy=ds/L;const pts=[],pts2=[];const N=14;
  for(let i=0;i<=N;i++){const t=i/N;const fl=1+(flA||0)*Math.pow(Math.max(0,1-t*4),2)+(flB||0)*Math.pow(Math.max(0,t*4-3),2);const hw=wd/2*fl*(0.86+0.14*Math.abs(t-0.5)*2);const b=(bow||0)*Math.sin(t*Math.PI);
    const x=w0+dx*t+nx*b,y=s0+ds*t+ny*b;pts.push([x+nx*hw,y+ny*hw]);pts2.unshift([x-nx*hw,y-ny*hw]);}
  bpoly(c,pts.concat(pts2));
  c.strokeStyle=BS;c.lineWidth=wd*0.16;c.beginPath();c.moveTo(w0+ux*wd*1.4+nx*wd*0.22,s0+uy*wd*1.4+ny*wd*0.22);c.quadraticCurveTo((w0+w1)/2+nx*((bow||0)+wd*0.2),(s0+s1)/2+ny*((bow||0)+wd*0.2),w1-ux*wd*1.4+nx*wd*0.22,s1-uy*wd*1.4+ny*wd*0.22);c.stroke();
  c.strokeStyle='rgba(255,255,250,.55)';c.lineWidth=wd*0.12;c.beginPath();c.moveTo(w0+ux*wd*1.2-nx*wd*0.25,s0+uy*wd*1.2-ny*wd*0.25);c.lineTo(w1-ux*wd*1.2-nx*wd*0.25,s1-uy*wd*1.2-ny*wd*0.25);c.stroke();
}
function vert(c,w,s,h,wd,tilt,proc,col){c.save();c.translate(w,s);c.rotate(tilt||0);
  bpoly(c,[[-wd/2,0],[wd/2,0.15],[wd/2,h-0.15],[-wd/2,h]]);
  if(proc){bpoly(c,[[-wd/2,h*0.15],[-wd/2-proc,h*0.55+proc*0.35],[-wd/2-proc*0.9,h*0.85+proc*0.35],[-wd/2,h*0.75]]);bell(c,-wd/2-0.5,h*0.45,0.45,0.35,0);}
  c.fillStyle=col||'#9fb1d4';c.fillRect(-wd/2+0.1,h,wd-0.2,Math.max(0.25,h*0.22));c.restore();}
// draw one bone in its original (uncut) layout, clipped to the part this segment still holds
function boneDamage(c,b){
  // bullet holes, chips and the fracture itself, drawn in the bone's original frame
  for(const m of b.marks||[]){const hw=b.width*0.42;c.save();c.translate(m.w,m.s);c.rotate(m.r);
    if(m.k==='cut'){c.strokeStyle='rgba(40,8,12,.95)';c.lineWidth=0.25;c.beginPath();c.moveTo(-hw*1.3,-0.2);c.lineTo(hw*1.3,0.2);c.stroke();}
    else{c.fillStyle='rgba(120,30,30,.5)';c.beginPath();c.arc(0,0,hw*1.25,0,6.28);c.fill();c.fillStyle='#1c0306';c.beginPath();for(let i=0;i<8;i++){const a=i/8*6.28,r=hw*(i%2?0.55:0.8);i?c.lineTo(Math.cos(a)*r,Math.sin(a)*r):c.moveTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();c.fill();
      c.strokeStyle='rgba(50,15,15,.85)';c.lineWidth=0.1;for(let i=0;i<4;i++){const a=i*1.6+0.3;c.beginPath();c.moveTo(Math.cos(a)*hw*0.8,Math.sin(a)*hw*0.8);c.lineTo(Math.cos(a+0.3)*hw*2.1,Math.sin(a+0.3)*hw*2.1);c.stroke();}}
    c.restore();}
}
function fractureMark(c,x,y,wd,ang){
  // a jagged break with a gap, splinters and blood in the gap
  c.save();c.translate(x,y);c.rotate(ang||0);const hw=wd*0.62;
  c.fillStyle='rgba(110,10,18,.75)';c.beginPath();c.ellipse(0,0,hw*1.9,1.1,0,0,6.28);c.fill();
  c.fillStyle='#2a0508';c.beginPath();c.moveTo(-hw,-0.15);for(let i=0;i<=6;i++)c.lineTo(-hw+i*hw/3,(i%2?0.45:-0.25));for(let i=6;i>=0;i--)c.lineTo(-hw+i*hw/3,(i%2?0.75:0.15)+0.25);c.closePath();c.fill();
  c.fillStyle=BC;for(const [dx,dy,r] of [[-hw*1.25,0.6,0.22],[hw*1.3,-0.5,0.18],[hw*0.4,1.2,0.15],[-hw*0.3,-1.1,0.16]]){c.beginPath();c.moveTo(dx-r,dy);c.lineTo(dx,dy-r*1.6);c.lineTo(dx+r,dy+r*0.4);c.closePath();c.fill();}
  c.restore();}
function boneClip(c,seg,b,draw){
  const p0=b.pts[0][0],p1=b.pts[b.pts.length-1][0],off=b.off||0;
  const natA=!(off>0.01)&&p0<=b.fs0+0.05,natB=off+p1>=b.fs1-0.05;
  c.save();c.beginPath();c.rect(-40,natA?-40:p0,80,(natB?p1+40:p1)-(natA?-40:p0));c.clip();c.translate(0,-off);draw(natA,natB);boneDamage(c,b);c.restore();
  // cut or broken ends of a split bone
  for(const [nat,sv] of [[natA,p0],[natB,p1]]){if(nat)continue;const wv=polyW(b.pts,sv),hw=b.width*0.55;
    if(b.broken){c.fillStyle=BC;c.beginPath();c.moveTo(wv-hw,sv);for(let i=0;i<=4;i++)c.lineTo(wv-hw+i*hw*0.5,sv+(sv===p0?-1:1)*(i%2?0.9:0.2));c.lineTo(wv+hw,sv);c.closePath();c.fill();}
    else{c.fillStyle='#b5574d';ell(c,wv,sv,hw,0.3);c.fill();}}
}
function drawPlatesSide(c,seg){
  for(const b of seg.bones){if(!b.plates)continue;for(const pl of b.plates){
    let s0=pl.s,w0;if(b.shape==='line'&&b.pts){s0=clamp(s0,b.pts[0][0],b.pts[b.pts.length-1][0]);w0=polyW(b.pts,s0)+b.width/2+0.35;}else{s0=b.s-(b.rs||3)*0.6;w0=b.w+(b.rw||3)*0.55;}
    const L=b.shape==='line'?4.2:2.2;c.save();const g=c.createLinearGradient(w0-0.35,0,w0+0.35,0);g.addColorStop(0,'#8a949c');g.addColorStop(0.5,'#eef3f6');g.addColorStop(1,'#7b858d');c.fillStyle=g;
    c.beginPath();c.roundRect?c.roundRect(w0-0.35,s0-L,0.7,2*L,0.3):c.rect(w0-0.35,s0-L,0.7,2*L);c.fill();c.strokeStyle='#4c555c';c.lineWidth=0.07;c.stroke();
    for(let y=s0-L+0.9;y<s0+L-0.5;y+=1.6){c.strokeStyle='rgba(200,208,214,.9)';c.lineWidth=0.18;c.beginPath();c.moveTo(w0,y);c.lineTo(w0-(b.width||1.5)-0.4,y);c.stroke();c.fillStyle='#d5dce1';c.beginPath();c.arc(w0,y,0.24,0,6.28);c.fill();c.strokeStyle='#5d666d';c.lineWidth=0.06;c.beginPath();c.moveTo(w0-0.15,y);c.lineTo(w0+0.15,y);c.stroke();}
    c.restore();}}}
function drawBones(c,seg,layer){
  const k=seg.kind,front=layer!=='back',back=layer!=='front';c.lineCap='round';c.lineJoin='round';
  for(const b of seg.bones){
    if(b.shape==='line'&&!b.spine&&b.pts&&b.fs0!=null){
      const W=b.width,id=b.id;
      boneClip(c,seg,b,(natA,natB)=>{const s0=b.fs0,s1=b.fs1,w0=b.w0,w1=b.w1,L=s1-s0;
        if(/Fem$/.test(id)){shaft(c,w0,s0+1.6,w1,s1-1.2,W,0.5,0.8,0.55);
          bell(c,w0+0.2,s0+0.1,1.65,1.55,0);c.fillStyle=BS;ell(c,w0+0.5,s0-0.2,0.5,0.4);c.fill();
          bpoly(c,[[w0-0.4,s0+0.6],[w0-1.9,s0-0.4],[w0-2.5,s0+1.2],[w0-1.6,s0+3.2],[w0-0.6,s0+3]]);bell(c,w0-0.9,s0+4.6,0.55,0.75,0);
          bell(c,w1-0.5,s1-0.2,2.1,1.55,0.15);c.fillStyle=BS;ell(c,w1-1.1,s1+0.5,0.9,0.4);c.fill();
          if(natB){bell(c,w1+3.1,s1-0.3,0.85,1.45,0.15);}}
        else if(/Tib$/.test(id)){const fw=-1.5;
          c.save();c.globalAlpha=0.95;shaft(c,w0+fw,s0+1.4,w1+fw+0.1,s1-0.4,W*0.42,1.2,1.4,0.15);bell(c,w0+fw,s0+1.1,0.85,0.75,0);bell(c,w1+fw+0.1,s1+0.2,0.85,1.05,0);c.restore();
          shaft(c,w0,s0+1.5,w1,s1-0.9,W,1.6,1.2,-0.25);
          bpoly(c,[[w0-1.3,s0],[w0+2.5,s0+0.2],[w0+2.2,s0+1.6],[w0+1.4,s0+3.3],[w0-1.2,s0+2.2]]);bell(c,w0+1.75,s0+3.1,0.55,0.75,0);
          bell(c,w1+0.4,s1-0.2,1.05,1.0,0);}
        else if(/Hum$/.test(id)){shaft(c,w0,s0+1.6,w1,s1-1,W,0.6,0.9,0.15);bell(c,w0-0.2,s0+0.7,1.5,1.45,0);bell(c,w0+1.1,s0+1.5,0.6,0.7,0);
          bell(c,w1,s1-0.3,1.45,1.05,0);c.fillStyle=BS;ell(c,w1-0.5,s1-0.6,0.45,0.35);c.fill();}
        else if(/Rad$/.test(id)){shaft(c,w0-0.55,s0+0.6,w1-0.6,s1-0.6,W*0.55,1,0.9,-0.1);bpoly(c,[[w0-0.2,s0+0.3],[w0-1.6,s0-1.2],[w0-1.25,s0+1.3]]);bell(c,w1-0.6,s1-0.2,0.5,0.55,0);
          shaft(c,w0+0.6,s0+1,w1+0.5,s1-0.8,W*0.6,0.7,1.6,0.25);bell(c,w0+0.6,s0+0.7,0.55,0.4,0);bell(c,w1+0.6,s1-0.3,0.85,0.75,0);}
        else if(/Meta$/.test(id)){const f=L/15;
          for(let i=0;i<5;i++){const x=w0-0.9+(i%3)*0.8,y=s0+0.6*f+Math.floor(i/3)*1.2*f;bell(c,x,y,0.42,0.5*f,0);}
          for(const [dw,j] of [[-0.75,0],[0,1],[0.75,2]]){const ss=s0+3*f;shaft(c,w0+dw,ss,w0+dw*1.1,ss+5.1*f,0.48,0.6,0.7,0.05);
            let y=ss+5.4*f;for(const len of [2.9,1.9,1.3]){shaft(c,w0+dw*1.15,y,w0+dw*1.2,y+len*f,0.38-j*0.02,0.5,0.4,0);y+=len*f+0.25;}}}
        else if(/Tars$/.test(id)){const f=L/15;
          bell(c,w0-1.2,s0-1.5,1.35,2.1,0.35);bell(c,w0+0.4,s0+0.4,1.3,1.1,0);bell(c,w0+0.8,s0+2.4*f,0.9,0.8,0);bell(c,w0+0.7,s0+3.8*f,0.75,0.9,0);bell(c,w0-0.4,s0+3.3*f,0.75,0.95,0);
          for(const dw of [0.7,0,-0.6]){shaft(c,w0+dw+0.4,s0+4.8*f,w1+dw*0.5,s0+10.6*f,0.45,0.6,0.8,0.25);let y=s0+11*f;for(const len of [1.8,1.1,0.8]){shaft(c,w1+dw*0.5,y,w1+dw*0.55-0.1,y+len*f,0.35,0.4,0.4,0);y+=len*f+0.2;}}}
        else{shaft(c,w0,s0,w1,s1,W,0.6,0.6,0);}
      });
      if(b.broken&&(b.off||0)<0.01&&b.pts[b.pts.length-1][0]>=b.fs1-0.05){const p0=b.pts[0],p1=b.pts[b.pts.length-1];const sv=lerp(p0[0],p1[0],b.bp),wv=lerp(p0[1],p1[1],b.bp);fractureMark(c,wv,sv,b.width*1.6,0.35);}
      continue;}
    if(b.shape==='line'&&b.spine&&back){
      const p0=b.pts[0],p1=b.pts[b.pts.length-1],n=b.id==='cervical'?7:b.id==='thoracic'?12:5,step=(p1[0]-p0[0])/n;
      for(let i=0;i<n;i++){const s0=p0[0]+i*step,w=polyW(b.pts,s0+step*0.4),proc=b.id==='cervical'?(i===n-1?2:1.1):b.id==='thoracic'?1.9:1.6,tilt=b.id==='thoracic'?0.12:0;
        vert(c,w,s0,step*0.78,b.width*(b.id==='lumbar'?1.25:1),tilt,proc);}
      if(b.id==='cervical'){bell(c,polyW(b.pts,1.5)+0.6,0.6,0.9,0.55,0);}
      if(b.id==='lumbar'){bpoly(c,[[p1[1]-1.1,p1[0]-0.2],[p1[1]+1.3,p1[0]],[p1[1]+2.2,p1[0]+3.2],[p1[1]+2.4,p1[0]+6.5],[p1[1]+3.6,p1[0]+8.2],[p1[1]+2.9,p1[0]+8.6],[p1[1]+0.8,p1[0]+6.6],[p1[1]-0.6,p1[0]+3]]);
        c.strokeStyle=BS;c.lineWidth=0.12;for(let i=1;i<5;i++){c.beginPath();c.moveTo(p1[1]-0.4+i*0.35,p1[0]+i*1.4);c.lineTo(p1[1]+1.6+i*0.25,p1[0]+i*1.4);c.stroke();}}
      if(XL('nerves')){c.strokeStyle='#e3c96a';c.lineWidth=0.6;strokePts(c,b.pts.map(p=>[p[0],p[1]+b.width*0.1]));}
      boneDamage(c,b);if(b.broken){const sv=lerp(p0[0],p1[0],b.bp),wv=polyW(b.pts,sv);fractureMark(c,wv,sv,b.width*1.4,0.25);}
      continue;}
    if(b.shape==='ribs'&&front){
      const rbs=new Set((seg.ribBreaks||[]).map(q=>q.i));for(let k=0;rbs.size<seg.ribsBroken&&k<12;k++)rbs.add(k);c.lineCap='round';
      for(let i=0;i<12;i++){const sy=-1.2+i*1.95,br=rbs.has(i),fl=i>=10,ex=fl?-1.5:7.4+(i>6?-1.2*(i-6)*0.4:0),ey=sy+5.6+i*0.35;
        c.strokeStyle=br?'rgba(236,227,203,.5)':'rgba(236,227,203,.92)';c.lineWidth=0.72;c.beginPath();c.moveTo(-7.2,sy);c.bezierCurveTo(-9.6,sy+1.5,-2,sy+0.8,ex,ey);c.stroke();
        c.strokeStyle='rgba(120,100,70,.5)';c.lineWidth=0.12;c.beginPath();c.moveTo(-7.2,sy+0.35);c.bezierCurveTo(-9.4,sy+1.8,-2,sy+1.15,ex,ey+0.35);c.stroke();
        if(!fl){c.strokeStyle='rgba(200,215,225,.85)';c.lineWidth=0.6;c.beginPath();c.moveTo(ex,ey);c.quadraticCurveTo(ex+1.6,ey-0.5,9.7,Math.min(15.5,sy+2.5+i*0.6));c.stroke();}
        if(XL('muscles')&&i<11){c.strokeStyle='rgba(150,50,60,.45)';c.lineWidth=0.5;c.beginPath();c.moveTo(-6,sy+1);c.bezierCurveTo(-8,sy+2.4,-1,sy+1.8,ex-0.4,ey+1);c.stroke();}
        if(br){const rk=(seg.ribBreaks||[]).find(q=>q.i===i),bw=rk?clamp(rk.w,-6,6):-1.5+(i%3)*1.6;fractureMark(c,bw,sy+1.0+Math.max(0,bw+2)*0.12,1.0,0.9);}}
      bpoly(c,[[9.3,-1.8],[10.9,-1.4],[10.8,3.4],[9.5,3.6]]);bpoly(c,[[9.5,3.9],[10.8,3.8],[10.6,14.4],[9.7,14.6]]);bpoly(c,[[9.8,14.8],[10.5,14.8],[10.1,16.6]]);
      c.strokeStyle=BE;c.lineWidth=1.25;c.beginPath();c.moveTo(9.8,-1.6);c.bezierCurveTo(6,-3.4,1,-1.2,-3.6,-2.6);c.stroke();c.strokeStyle=BC;c.lineWidth=1.0;c.stroke();
      continue;}
    if(b.shape==='ribs'&&back&&layer==='back'){bpoly(c,[[-5.4,-1.2],[-9.6,1.6],[-8.2,11.8],[-6.6,5]],'rgba(236,227,203,.7)');c.strokeStyle=BE;c.lineWidth=0.5;c.beginPath();c.moveTo(-5.6,0.2);c.lineTo(-9.2,3.2);c.stroke();bell(c,-4.4,-2.2,1.1,0.7,0);continue;}
    if(b.shape==='ell'&&b.id==='skull'){drawSkull(c,seg,b);continue;}
    if(b.shape==='ell'&&b.id==='pelvis'&&back){
      // ilium wing, sacrum, acetabulum, pubis and ischium (lateral view)
      bpoly(c,[[-6.6,21.6],[-8.2,17.4],[-8.4,14.2],[-7.4,12.6]],'rgba(226,216,188,.95)');
      bpoly(c,[[-7.4,12.8],[-5.2,11.6],[-1.4,11.2],[2.6,11.8],[5.6,13.2],[6.6,14.6],[5.4,15.6],[4.4,17.4],[3,19],[1.8,20.6],[-0.8,21],[-2.6,20.2],[-4.4,18.4],[-6.4,16.4]],'rgba(236,227,203,.95)');
      c.strokeStyle=BS;c.lineWidth=0.2;c.beginPath();c.moveTo(-6,13.2);c.quadraticCurveTo(-1,12,5.2,14);c.moveTo(-3.6,15.4);c.quadraticCurveTo(0,16.6,2.6,19);c.stroke();
      bpoly(c,[[1.6,20.6],[4.6,21],[7,21.8],[7.6,23.2],[6.2,23.6],[3.6,23.2],[2.2,24.4],[-0.6,25.4],[-3.2,25],[-3.8,23.4],[-2.2,21.6],[-0.8,21.2]],'rgba(236,227,203,.95)');
      c.fillStyle='rgba(50,22,26,.8)';ell(c,2.8,22.7,1.3,0.7,0.15);c.fill();
      c.fillStyle='rgba(120,90,70,.4)';ell(c,0.3,20.2,1.9,1.9);c.fill();c.strokeStyle=BE;c.lineWidth=0.45;ell(c,0.3,20.2,2.0,2.0);c.stroke();
      if(b.broken){c.save();c.translate(-2,15);c.rotate(0.8);c.fillStyle=C.cavity;c.fillRect(-0.4,-1.6,0.8,3.2);c.restore();}
      continue;}
  }
}
function drawSkull(c,seg,b){
  const jd=seg.jawDrop||0;c.save();
  // cranium
  c.beginPath();c.moveTo(-8.2,2.2);c.bezierCurveTo(-9.6,-4,-5.6,-8.8,0,-8.9);c.bezierCurveTo(4.6,-8.9,7.4,-5.4,7.3,-1.2);c.quadraticCurveTo(7.6,0.8,7.1,2);c.lineTo(6.6,2.6);c.quadraticCurveTo(4,4.2,1.6,4.6);c.lineTo(-1,6.4);c.quadraticCurveTo(-4.6,6.6,-7,5);c.closePath();
  c.fillStyle='rgba(236,227,203,.32)';c.fill();c.strokeStyle=BC;c.lineWidth=0.95;c.stroke();c.strokeStyle=BE;c.lineWidth=0.14;c.stroke();
  c.strokeStyle=BS;c.lineWidth=0.14;c.beginPath();c.moveTo(-1.5,-8.7);c.quadraticCurveTo(-2.5,-3,-6.6,0.4);c.moveTo(3.4,-8.2);c.quadraticCurveTo(2.2,-4,3.4,-1);c.stroke();
  // face: orbit, nasal, cheekbone, maxilla
  bpoly(c,[[5,1.2],[7.3,1.4],[7.9,3.2],[8.7,5.4],[8.4,6.2],[7.3,6.4],[7.6,8.2],[5.6,8.4],[4.8,6.4],[2,5.4],[1.4,4.4],[3.6,3.8]],'rgba(236,227,203,.9)');
  c.fillStyle='rgba(40,20,22,.75)';c.beginPath();c.ellipse(5.6,2.8,1.25,1.15,0,0,6.28);c.fill();
  c.fillStyle='rgba(40,20,22,.6)';c.beginPath();c.ellipse(7.9,5.6,0.35,0.6,0.3,0,6.28);c.fill();
  c.strokeStyle=BE;c.lineWidth=0.3;c.beginPath();c.moveTo(4.4,4.4);c.lineTo(0.6,4.5);c.stroke();
  bell(c,-1.4,6.4,0.55,0.9,0);c.fillStyle='rgba(40,20,22,.7)';ell(c,0.3,4.6,0.4,0.4);c.fill();
  c.fillStyle='#f6f1e4';for(let i=0;i<5;i++)c.fillRect(5.2+i*0.52,8.3,0.42,0.75);
  // mandible (drops when the jaw is broken)
  c.translate(0.8,5.2);c.rotate(jd);c.translate(-0.8,-5.2);
  bpoly(c,[[0.4,5],[1.3,5.2],[1.1,9],[2.6,10.4],[5.8,10.6],[7.1,10.2],[7.4,11.4],[6.8,12.9],[3.6,12.7],[1,11.6],[-0.2,10.2]],'rgba(236,227,203,.92)');
  c.fillStyle='#f6f1e4';for(let i=0;i<5;i++)c.fillRect(5.1+i*0.5,9.35,0.4,0.7);
  if(seg.jawBroken){c.strokeStyle=C.cavity;c.lineWidth=0.4;c.beginPath();c.moveTo(4.2,10.4);c.lineTo(4.6,11.4);c.lineTo(4.1,12.6);c.stroke();}
  c.restore();
  boneDamage(c,b);if(b.broken){const cx=b.crack?b.crack.w:b.w+Math.cos(b.ba)*b.rw*0.85,cy=b.crack?b.crack.s:b.s+Math.sin(b.ba)*b.rs*0.85;c.save();c.translate(cx,cy);c.rotate(b.ba);c.fillStyle='rgba(30,4,8,.85)';c.beginPath();c.ellipse(0,0,1.2,0.7,0,0,6.28);c.fill();c.strokeStyle='rgba(40,8,12,.9)';c.lineWidth=0.3;c.beginPath();c.moveTo(-1.6,-1.2);c.lineTo(-0.3,-0.2);c.lineTo(-0.9,0.9);c.lineTo(0.6,1.8);c.moveTo(-0.3,-0.2);c.lineTo(1.6,-0.6);c.stroke();c.restore();}
}
/* ---------- anatomical heart and bowel art ---------- */
// smooth closed path through points (quadratic through midpoints)
function blobPath(c,pts){const n=pts.length;c.beginPath();for(let i=0;i<n;i++){const p=pts[i],q=pts[(i+1)%n],mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2;if(i===0){const z=pts[n-1];c.moveTo((z[0]+p[0])/2,(z[1]+p[1])/2);}c.quadraticCurveTo(p[0],p[1],mx,my);}c.closePath();}
function tube(c,pts,w,col,edge,hl){if(pts.length<2)return;const path=()=>{c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length-1;i++){const p=pts[i],q=pts[i+1];c.quadraticCurveTo(p[0],p[1],(p[0]+q[0])/2,(p[1]+q[1])/2);}const l=pts[pts.length-1];c.lineTo(l[0],l[1]);};
  c.lineCap='round';c.lineJoin='round';path();c.strokeStyle=edge;c.lineWidth=w+0.32;c.stroke();c.strokeStyle=col;c.lineWidth=w;c.stroke();if(hl){c.strokeStyle=hl;c.lineWidth=w*0.28;c.save();c.translate(-w*0.18,-w*0.18);path();c.stroke();c.restore();}}
function cutEnd(c,x,y,r){c.fillStyle='#3a0509';c.beginPath();c.arc(x,y,r,0,6.28);c.fill();c.strokeStyle='rgba(240,200,190,.8)';c.lineWidth=0.18;c.stroke();}
// anterior view of the heart, origin at the centre of the ventricles, +x = patient's left, +y = down, units cm
// stubs: great vessels cut short (a heart that has been torn out)
function heartFrontArt(c,pu,stubs){
  const k=1+(pu||0);c.save();c.scale(k,k);
  const VB='#4c5cc0',VBd='#2b357a',AR='#c4262f',ARd='#6e0c14';
  // behind: IVC, right pulmonary artery, descending aorta, pulmonary veins
  tube(c,[[-3.5,4.2],[-3.4,stubs?5.6:7.4]],1.7,VB,VBd);
  if(!stubs){tube(c,[[2.4,-9.4],[-0.6,-9.6],[-3.6,-9.2]],1.5,'#5a64c8',VBd);tube(c,[[4.2,-11.6],[4.8,-8.6],[4.9,-5.6]],2.0,'#a8202a',ARd);}
  // ventricles and right atrium
  const body=[[-3.2,-5.2],[-4.8,-3.8],[-5.5,-1.0],[-5.3,1.8],[-4.3,3.8],[-2.0,5.2],[1.4,6.1],[4.6,6.4],[6.9,5.7],[7.7,3.8],[7.3,1.0],[6.1,-1.6],[4.6,-3.2],[3.0,-4.6],[0.2,-5.2],[-1.6,-5.6]];
  blobPath(c,body);let g=c.createRadialGradient(-0.6,-1.4,0.5,0.6,1,8.6);g.addColorStop(0,'#cf4652');g.addColorStop(0.6,'#a92b38');g.addColorStop(1,'#6a1220');c.fillStyle=g;c.fill();
  c.save();blobPath(c,body);c.clip();
  // right atrium (viewer's left) and left ventricle strip are darker
  c.fillStyle='rgba(70,10,40,.35)';c.beginPath();c.moveTo(-1.6,-6);c.quadraticCurveTo(-3.6,0,-2.6,6);c.lineTo(-7,6);c.lineTo(-7,-6);c.closePath();c.fill();
  c.fillStyle='rgba(60,0,12,.25)';c.beginPath();c.moveTo(2.9,-5);c.quadraticCurveTo(3.6,1.6,6.2,6.8);c.lineTo(9,6.8);c.lineTo(9,-5);c.closePath();c.fill();
  // muscle sheen
  c.strokeStyle='rgba(255,190,190,.12)';c.lineWidth=0.25;for(let i=0;i<7;i++){c.beginPath();c.moveTo(-2+i*1.1,-4.2);c.quadraticCurveTo(0+i*0.9,1.5,2.4+i*0.5,6.6);c.stroke();}
  c.fillStyle='rgba(255,220,220,.16)';ell(c,-0.4,-2.2,2.4,1.5,-0.5);c.fill();
  c.restore();
  blobPath(c,body);c.strokeStyle='#4a0910';c.lineWidth=0.22;c.stroke();
  // coronary grooves with fat, arteries and veins
  const groove=(p0,p1,p2,art,vein)=>{c.lineCap='round';c.strokeStyle='rgba(236,200,112,.55)';c.lineWidth=1.15;c.beginPath();c.moveTo(p0[0],p0[1]);c.quadraticCurveTo(p1[0],p1[1],p2[0],p2[1]);c.stroke();c.strokeStyle='rgba(240,206,120,.85)';c.lineWidth=0.6;c.beginPath();c.moveTo(p0[0],p0[1]);c.quadraticCurveTo(p1[0],p1[1],p2[0],p2[1]);c.stroke();
    if(vein){c.strokeStyle='#4a58b8';c.lineWidth=0.3;c.beginPath();c.moveTo(p0[0]+0.35,p0[1]);c.quadraticCurveTo(p1[0]+0.35,p1[1],p2[0]+0.3,p2[1]);c.stroke();}
    c.strokeStyle=art;c.lineWidth=0.36;c.beginPath();c.moveTo(p0[0],p0[1]);c.quadraticCurveTo(p1[0],p1[1],p2[0],p2[1]);c.stroke();};
  groove([-1.4,-5.0],[-3.4,0],[-2.6,5.3],'#e2323c',false);
  groove([2.7,-4.4],[3.5,1.6],[6.1,6.2],'#e2323c',true);
  c.strokeStyle='#e2323c';c.lineWidth=0.22;for(const [a,b] of [[[3.1,-1.5],[6,0.2]],[[3.7,1.6],[6.6,3.4]],[[3,-0.6],[0.6,2.6]],[[4.2,3.6],[2,5.6]]]){c.beginPath();c.moveTo(a[0],a[1]);c.quadraticCurveTo((a[0]+b[0])/2+0.4,(a[1]+b[1])/2,b[0],b[1]);c.stroke();}
  // left auricle peeking out at the top left border
  blobPath(c,[[3.4,-4.7],[4.9,-5.4],[6.2,-4.6],[6.6,-3.2],[5.6,-2.4],[4.2,-2.9]]);c.fillStyle='#8f2335';c.fill();c.strokeStyle='#4a0910';c.lineWidth=0.18;c.stroke();
  c.strokeStyle='rgba(40,0,10,.45)';c.lineWidth=0.14;for(let i=0;i<3;i++){c.beginPath();c.arc(4.6+i*0.6,-3.4+i*0.15,0.5,3.6,5.6);c.stroke();}
  // right auricle over the aortic root
  blobPath(c,[[-3.2,-5.3],[-1.6,-6.4],[-0.4,-5.6],[-1.2,-4.4],[-2.8,-4.2]]);c.fillStyle='#8a2840';c.fill();c.strokeStyle='#4a0910';c.lineWidth=0.18;c.stroke();
  if(stubs){
    tube(c,[[-0.9,-5.0],[-0.8,-7.6]],2.2,AR,ARd,'rgba(255,170,170,.4)');cutEnd(c,-0.8,-7.8,0.85);
    tube(c,[[1.6,-4.8],[2.1,-7.2]],2.0,'#5a64c8',VBd);cutEnd(c,2.1,-7.4,0.75);
    tube(c,[[-3.0,-5.0],[-3.1,-7.0]],1.8,VB,VBd);cutEnd(c,-3.1,-7.2,0.7);
  }else{
    // SVC with the brachiocephalic veins
    tube(c,[[-3.0,-5.0],[-3.1,-10],[-3.2,-13.8]],1.9,VB,VBd,'rgba(200,210,255,.3)');
    tube(c,[[-3.2,-13.8],[-5.6,-15.2]],1.1,VB,VBd);
    // aortic arch with its three branches
    tube(c,[[-0.4,-12.4],[-1.4,-14.4],[-2.4,-16.6]],0.95,AR,ARd);tube(c,[[1.3,-13.2],[1.3,-17.2]],0.75,AR,ARd);tube(c,[[2.9,-12.8],[3.6,-14.6],[4.4,-16.6]],0.8,AR,ARd);
    tube(c,[[-0.9,-5.0],[-0.9,-9.6],[-0.2,-12.8],[2.2,-13.4],[4.2,-11.6]],2.3,AR,ARd,'rgba(255,170,170,.45)');
    tube(c,[[-3.2,-13.8],[0,-15.6],[3,-15.8]],1.0,VB,VBd);
    // pulmonary trunk and left pulmonary artery in front
    tube(c,[[1.6,-4.8],[2.0,-7.4],[2.6,-9.2],[4.4,-9.8],[6.6,-9.4]],2.0,'#5a64c8',VBd,'rgba(210,215,255,.35)');
    c.strokeStyle='rgba(236,226,200,.6)';c.lineWidth=0.25;c.beginPath();c.moveTo(1.2,-10.6);c.lineTo(2.6,-12.6);c.stroke();// ligamentum arteriosum
  }
  c.restore();
}
// left lateral view, origin at the centre, +x = anterior, +y = down
function heartSideArt(c,pu){
  const k=1+(pu||0);c.save();c.scale(k,k);const VB='#4c5cc0',VBd='#2b357a',AR='#c4262f',ARd='#6e0c14';
  tube(c,[[-2.6,3.4],[-2.8,6.6]],1.6,VB,VBd);
  for(const y of [-1.6,0.6])tube(c,[[-4.0,y],[-6.4,y+0.3]],0.85,'#b84a54','#5e1219');
  const body=[[-3.8,-3.6],[-1.2,-4.8],[1.8,-4.4],[3.9,-2.3],[5.1,0.9],[5.3,3.8],[4.5,5.7],[2.0,5.9],[-0.8,4.7],[-3.0,2.7],[-4.5,0],[-4.7,-2.2]];
  blobPath(c,body);const g=c.createRadialGradient(1.2,-0.6,0.5,1.4,1,7.5);g.addColorStop(0,'#cf4652');g.addColorStop(0.6,'#a92b38');g.addColorStop(1,'#6a1220');c.fillStyle=g;c.fill();
  c.save();blobPath(c,body);c.clip();c.fillStyle='rgba(70,10,40,.38)';c.beginPath();c.moveTo(-0.4,-6);c.quadraticCurveTo(-1.8,0.6,-1.0,6);c.lineTo(-6,6);c.lineTo(-6,-6);c.closePath();c.fill();
  c.strokeStyle='rgba(255,190,190,.12)';c.lineWidth=0.25;for(let i=0;i<6;i++){c.beginPath();c.moveTo(0+i*0.8,-3.8);c.quadraticCurveTo(1.8+i*0.6,1.5,3+i*0.3,5.6);c.stroke();}
  c.fillStyle='rgba(255,220,220,.15)';ell(c,1.6,-1.6,2,1.2,-0.6);c.fill();c.restore();
  blobPath(c,body);c.strokeStyle='#4a0910';c.lineWidth=0.22;c.stroke();
  c.lineCap='round';for(const [a,b,d,art] of [[[-0.4,-4.5],[-1.7,0.6],[-1.0,4.7],1],[[2.6,-3.8],[4.4,1],[4.4,5.5],1]]){c.strokeStyle='rgba(236,200,112,.6)';c.lineWidth=0.7;c.beginPath();c.moveTo(a[0],a[1]);c.quadraticCurveTo(b[0],b[1],d[0],d[1]);c.stroke();c.strokeStyle='#e2323c';c.lineWidth=0.34;c.stroke();}
  blobPath(c,[[-0.2,-4.9],[1.0,-5.6],[2.0,-4.8],[1.6,-3.9],[0.3,-3.9]]);c.fillStyle='#8f2335';c.fill();c.strokeStyle='#4a0910';c.lineWidth=0.16;c.stroke();
  // aorta rises behind the pulmonary trunk and arches backwards; the trunk curves up and back under the arch
  tube(c,[[0.2,-4.2],[0.6,-8.4],[-1.4,-10.6],[-4.4,-9.6],[-5.4,-6.4],[-5.6,-3.4]],2.2,AR,ARd,'rgba(255,170,170,.45)');
  tube(c,[[-0.6,-10.4],[-0.4,-12.8]],0.8,AR,ARd);tube(c,[[-1.9,-10.7],[-1.9,-12.9]],0.7,AR,ARd);tube(c,[[-3.1,-10.4],[-3.4,-12.6]],0.75,AR,ARd);
  tube(c,[[1.6,-4.3],[1.6,-6.6],[0.2,-8.0],[-1.8,-8.0]],1.9,'#5a64c8',VBd,'rgba(210,215,255,.35)');
  c.restore();
}
// bowel: a long tube drawn as overlapping loops with sheen and constrictions
function bowelPath(c,pts,w,dark){tube(c,pts,w,dark?'#c9837a':'#e2a395','#7e3a34','rgba(255,232,222,.5)');
  c.strokeStyle='rgba(126,58,52,.35)';c.lineWidth=0.1;for(let i=1;i<pts.length-1;i+=2){const p=pts[i],q=pts[i+1],dx=q[0]-p[0],dy=q[1]-p[1],L=Math.hypot(dx,dy)||1,nx=-dy/L*w*0.5,ny=dx/L*w*0.5;c.beginPath();c.moveTo(p[0]+nx,p[1]+ny);c.lineTo(p[0]-nx,p[1]-ny);c.stroke();}}
function colonPath(c,pts,R){ // haustra: sacculated large bowel with a taenia stripe
  tube(c,pts,R*1.8,'#c8857a','#8a443d');const out=[];for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let d=0;d<L;d+=R*1.25)out.push([a[0]+(b[0]-a[0])*d/L,a[1]+(b[1]-a[1])*d/L]);}out.push(pts[pts.length-1]);
  c.fillStyle='rgba(138,68,61,.8)';for(const p of out){c.beginPath();c.arc(p[0],p[1],R*0.95+0.15,0,6.28);c.fill();}
  out.forEach((p,i)=>{const g=c.createRadialGradient(p[0]-R*0.3,p[1]-R*0.3,0.1,p[0],p[1],R);g.addColorStop(0,'#e7b0a0');g.addColorStop(1,'#bf7b6c');c.fillStyle=g;c.beginPath();c.arc(p[0],p[1],R*0.95,0,6.28);c.fill();c.strokeStyle='rgba(110,50,45,.55)';c.lineWidth=0.12;c.beginPath();c.arc(p[0],p[1],R*0.98,2.2+i,3.6+i);c.stroke();});
  c.strokeStyle='rgba(245,230,205,.75)';c.lineWidth=0.3;c.beginPath();out.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();
  c.fillStyle='#e8c870';for(let i=2;i<out.length;i+=3){const p=out[i];c.beginPath();c.arc(p[0]+R*0.8,p[1]-R*0.5,0.32,0,6.28);c.fill();}}
function smallBowelCoil(cx,cy,rx,ry,seed,n){const k=seed+'|'+rx.toFixed(1)+ry.toFixed(1)+n;if(COILS[k])return COILS[k];
  let h=seed;const rr=()=>{h=(h*16807)%2147483647;return h/2147483647;};const L=[];
  for(let layer=0;layer<2;layer++){const rows=n+layer;for(let r=0;r<rows;r++){const y0=-0.82+1.64*(r+0.5)/rows,dir=(r+layer)%2?-1:1,pts=[];const span=Math.sqrt(Math.max(0.05,1-y0*y0))*0.95;
    const fq=4+rr()*4,am=0.5+rr()*0.5,p0=rr()*6.28,p1=rr()*6.28;
    for(let t=0;t<=1.0001;t+=0.04){const x=dir*(-span+2*span*t);const loop=(Math.sin(t*Math.PI*fq+p0)*am+Math.sin(t*Math.PI*fq*2.3+p1)*0.25)*1.15/rows;const xo=Math.cos(t*Math.PI*fq+p0)*0.06*am;pts.push([cx+(x+xo)*rx,cy+(y0+loop)*ry]);}
    L.push({layer,pts});}}
  COILS[k]=L;return L;}
function drawSmallBowel(c,cx,cy,rx,ry,w,seed,n){for(const s of smallBowelCoil(cx,cy,rx,ry,seed,n))bowelPath(c,s.pts,w,s.layer===0);}
// the simulated chain is a smooth rope; the bowel itself is drawn coiling around it
function gutCoil(pts,seed){const out=[];let acc=0;for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1e-6,nx=-dy/L,ny=dx/L;
    for(let d=0;d<L;d+=0.55){const t=acc+d,amp=Math.min(1,t/2)*(1.5+0.5*Math.sin(t*0.37+seed)),o=amp*Math.sin(t*1.15+seed)+0.5*Math.sin(t*0.53+seed*2);out.push([a[0]+dx*d/L+nx*o,a[1]+dy*d/L+ny*o]);}acc+=L;}
  const l=pts[pts.length-1];out.push(l);return out;}
function drawGuts(){
  if(!GUTS.length)return;const c=ctx;
  for(const g of GUTS){const pts=g.pts.map(q=>[q.x,q.y]);if(g.anchor){const a=g.anchor;if(a.seg&&!a.seg.gone){const A=toWorld(a.seg,a.s,a.w);pts.unshift([A.x,A.y]);}}
    // mesentery: the thin fatty membrane still attached along the bowel (≈1.5 cm either side of a loose, hanging loop).
    // It follows the gut only: closing it into one shape drew a yellow wedge from the wound to the end of the strand
    c.strokeStyle='rgba(214,160,120,.22)';c.lineWidth=3.2;c.lineJoin='round';c.lineCap='round';c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();
    const cp=gutCoil(pts.slice().reverse(),g.seed).reverse();bowelPath(c,cp,2.5,false);
    c.fillStyle='rgba(120,20,26,.55)';for(let i=3;i<pts.length;i+=5){const p=pts[i];c.beginPath();c.arc(p[0]+0.4,p[1]+0.6,0.45,0,6.28);c.fill();}
    if(!g.anchor){const e=pts[pts.length-1];cutEnd(c,e[0],e[1],0.75);}}
}
function drawOrganGib(c,g){
  const o=g.org,age=T-(g.t0||0);c.save();c.translate(g.x,g.y);c.rotate(g.ang);
  if(o.id==='heart'){const beating=g.beat&&age<6,pu=beating?Math.exp(-((age*1.6)%1)*9)*0.09*(1-age/6):0;heartFrontArt(c,pu,true);if(beating&&Math.floor(age*1.6)!==Math.floor((age-1/60)*1.6)&&BLOOD.length<GQ().b){const q={x:g.x+Math.cos(g.ang-1.57)*7,y:g.y+Math.sin(g.ang-1.57)*7};for(let i=0;i<5;i++)BLOOD.push({x:q.x,y:q.y,vx:rnd(-40,40),vy:-rnd(40,120),r:0.4,life:2});}}
  else{const t=o.out;o.out=0;drawOrgan(c,o,0,0,o.rw,o.rs,0,false);o.out=t;}
  c.restore();
  if(g.teth&&age<0.7){const a=g.teth;if(a.seg&&!a.seg.gone&&Math.hypot(toWorld(a.seg,a.s,a.w).x-g.x,toWorld(a.seg,a.s,a.w).y-g.y)<9){const A=toWorld(a.seg,a.s,a.w);c.strokeStyle='#8e1f27';c.lineWidth=0.7;c.lineCap='round';c.beginPath();c.moveTo(A.x,A.y);c.quadraticCurveTo((A.x+g.x)/2,(A.y+g.y)/2+2,g.x,g.y);c.stroke();c.strokeStyle='#4c5cc0';c.lineWidth=0.45;c.beginPath();c.moveTo(A.x+0.6,A.y);c.quadraticCurveTo((A.x+g.x)/2+0.6,(A.y+g.y)/2+2.4,g.x+0.5,g.y);c.stroke();}}
}
function drawOrgan(c,o,w,s,rw,rs,rot,front,pz,dmgOnly){
  if(o.out>=1||(o.out&&o.id!=='intest'))return;
  const dmg=1-o.hp/100;c.lineWidth=0.3;
  if(!dmgOnly)switch(o.kind){
    case 'brain':{ell(c,w,s,rw,rs);const g=c.createRadialGradient(w-rw*0.3,s-rs*0.3,0,w,s,Math.max(rw,rs));g.addColorStop(0,'#ecc0bb');g.addColorStop(1,'#c58a88');c.fillStyle=g;c.fill();
      c.strokeStyle='#a86a6d';c.lineWidth=0.35;for(const q of o.gyri){c.beginPath();c.arc(w+q[0]*rw/o.rw,s+(q[1]-1)*rs/o.rs,q[2]*Math.min(1,rw/o.rw+0.15),q[3],q[3]+2.4);c.stroke();}
      if(!front){c.strokeStyle='#8f5559';c.lineWidth=0.4;c.beginPath();c.moveTo(w+1,s-rs);c.quadraticCurveTo(w+2.2,s-1,w+0.5,s+2);c.stroke();c.beginPath();c.moveTo(w+4,s+2.5);c.quadraticCurveTo(w,s+1.5,w-4,s+3.6);c.stroke();
        c.fillStyle='#c48b88';ell(c,w-3.6,s+5.4,2.7,1.8);c.fill();c.strokeStyle='#9c6164';c.lineWidth=0.22;for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(w-6.8,s+5.1+i*0.45);c.quadraticCurveTo(w-4.3,s+4.6+i*0.45,w-1.8,s+5.1+i*0.45);c.stroke();}
        c.fillStyle='#d4a39e';c.beginPath();c.moveTo(w-2.8,s+4.2);c.lineTo(w-1,s+4.2);c.lineTo(w-1.6,s+11);c.lineTo(w-2.8,s+11);c.closePath();c.fill();}
      else{c.strokeStyle='#8f5559';c.lineWidth=0.4;c.beginPath();c.moveTo(w,s-rs);c.lineTo(w,s+rs*0.75);c.stroke();}
      break;}
    case 'lung':{if(o.hp<60){const k=0.55+0.45*clamp(o.hp/60,0,1);s-=rs*(1-k)*0.5;rs*=k;rw*=0.8+0.2*k;}ell(c,w,s,rw,rs,0.08);const g=c.createRadialGradient(w-rw*0.3,s-rs*0.3,0,w,s,Math.max(rw,rs));g.addColorStop(0,o.far?'#d29490':'#f1b3ad');g.addColorStop(1,o.far?'#a46668':'#c47f7c');c.fillStyle=g;c.fill();c.strokeStyle='rgba(120,40,45,.6)';c.stroke();
      c.save();ell(c,w,s,rw,rs,0.08);c.clip();c.fillStyle='rgba(150,60,70,.18)';for(let i=0;i<22;i++){const a=i*2.4,rr=((i*37)%10)/10;c.beginPath();c.arc(w+Math.cos(a)*rw*rr*0.9,s+Math.sin(a)*rs*rr*0.9,0.35,0,6.28);c.fill();}
      const hx=front?w+(o.id==='lungL'?-1:1)*rw*0.65:w+rw*0.35,hy=s-rs*0.1;
      const br=(x,y,a,len,wd,d)=>{if(d>3||len<0.6)return;const x2=x+Math.cos(a)*len,y2=y+Math.sin(a)*len;c.strokeStyle='rgba(242,214,200,.9)';c.lineWidth=wd;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();br(x2,y2,a-0.45,len*0.66,wd*0.66,d+1);br(x2,y2,a+0.5,len*0.62,wd*0.66,d+1);};
      const base=front?(o.id==='lungL'?0:Math.PI):Math.PI;
      for(const da of [-1.5,-0.6,0.4,1.3])br(hx,hy,base+da,Math.min(rw,rs)*0.42,0.55,0);
      c.restore();c.strokeStyle='rgba(120,40,45,.5)';c.lineWidth=0.3;c.beginPath();c.moveTo(w-rw*0.7,s-2);c.quadraticCurveTo(w,s+1,w+rw*0.8,s+4);c.stroke();break;}
    case 'heart':{const pu=V.dead?0:V.arrest?(shockable()?rnd(0,0.035):0):Math.exp(-(T-V.lastBeat)*9)*0.08;
      c.save();c.translate(w,s);c.scale(rw/4.9,rs/5.2);heartSideArt(c,pu);c.restore();break;}
    case 'liver':{ell(c,w,s,rw,rs,rot);const g=c.createRadialGradient(w-rw*0.3,s-rs*0.4,0,w,s,Math.max(rw,rs));g.addColorStop(0,'#8e3530');g.addColorStop(1,'#561817');c.fillStyle=g;c.fill();c.strokeStyle='rgba(30,0,0,.5)';c.stroke();
      c.strokeStyle='rgba(30,0,0,.4)';c.lineWidth=0.3;c.beginPath();c.moveTo(w+rw*0.2,s-rs);c.quadraticCurveTo(w-rw*0.1,s,w+rw*0.25,s+rs);c.stroke();
      c.fillStyle='rgba(255,220,210,.12)';ell(c,w-rw*0.35,s-rs*0.45,rw*0.35,rs*0.18,-0.4);c.fill();break;}
    case 'stomach':{ell(c,w,s,rw,rs,rot);c.fillStyle='#d9978d';c.fill();c.strokeStyle='rgba(120,50,45,.5)';c.stroke();
      c.save();ell(c,w,s,rw,rs);c.clip();c.strokeStyle='rgba(170,80,75,.55)';c.lineWidth=0.25;for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(w-rw,s+i*rs*0.28);for(let x=-rw;x<=rw;x+=0.8)c.lineTo(w+x,s+i*rs*0.28+Math.sin(x*2+i)*0.3);c.stroke();}c.restore();break;}
    case 'kidney':{ell(c,w,s,rw,rs);c.fillStyle='#9a3a35';c.fill();c.fillStyle='#7a2526';ell(c,w,s,rw*0.72,rs*0.75);c.fill();
      c.fillStyle='#5c171b';for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(w-rw*0.55,s+i*rs*0.45-0.5);c.lineTo(w+rw*0.2,s+i*rs*0.2);c.lineTo(w-rw*0.55,s+i*rs*0.45+0.5);c.fill();}
      c.fillStyle='#e3c9a0';ell(c,w+rw*0.55,s,rw*0.28,rs*0.28);c.fill();break;}
    case 'intest':{const left=1-0.65*(o.out||0);rs*=left;s+=o.rs*(1-left)*0.6;c.save();ell(c,w,s,rw,rs);c.fillStyle='#7a3a36';c.fill();c.clip();
      drawSmallBowel(c,w,s+rs*0.12,rw*0.95,rs*0.8,1.25,1234,Math.max(2,Math.round(5*left)));
      colonPath(c,[[w+rw*0.86,s-rs*0.5],[w+rw*0.25,s-rs*0.82],[w-rw*0.45,s-rs*0.78],[w-rw*0.84,s-rs*0.35],[w-rw*0.9,s+rs*0.55]],1.15);
      c.restore();break;}
    case 'trachea':c.fillStyle=C.trachea;c.fillRect(w-rw,s-rs,rw*2,rs*2);c.strokeStyle='#bfa093';c.lineWidth=0.3;for(let y=s-rs+0.8;y<s+rs;y+=1.1){c.beginPath();c.moveTo(w-rw,y);c.lineTo(w+rw,y);c.stroke();}break;
    case 'esoph':c.fillStyle='#c9867c';c.fillRect(w-rw,s-rs,rw*2,rs*2);c.strokeStyle='rgba(120,50,45,.5)';c.lineWidth=0.18;c.beginPath();c.moveTo(w,s-rs);c.lineTo(w,s+rs);c.stroke();break;
    case 'eye':ell(c,w,s,rw,rs);c.fillStyle=C.eye;c.fill();c.fillStyle='#4a6b7a';ell(c,w+rw*0.45,s,rw*0.42,rs*0.55);c.fill();c.fillStyle='#111';ell(c,w+rw*0.55,s,rw*0.2,rs*0.25);c.fill();break;
    case 'pancreas':{ell(c,w,s,rw,rs);c.fillStyle='#e0b089';c.fill();c.fillStyle='rgba(180,120,80,.5)';for(let i=-3;i<=3;i++){c.beginPath();c.arc(w+i*rw*0.28,s+Math.sin(i)*rs*0.3,Math.min(rw,rs)*0.35,0,6.28);c.fill();}break;}
    case 'gall':ell(c,w,s,rw,rs);c.fillStyle='#5f7d3a';c.fill();c.fillStyle='rgba(220,255,200,.2)';ell(c,w-rw*0.3,s-rs*0.3,rw*0.35,rs*0.25);c.fill();break;
    case 'bladder':{ell(c,w,s,rw,rs);c.fillStyle='#e0c88c';c.fill();c.strokeStyle='rgba(150,110,60,.5)';c.lineWidth=0.2;for(let i=0;i<4;i++){c.beginPath();c.arc(w,s,rw*(0.3+i*0.18),0.5,2.6);c.stroke();}break;}
    default:ell(c,w,s,rw,rs,rot);c.fillStyle=C[o.kind]||'#a55';c.fill();c.strokeStyle='rgba(40,0,0,.45)';c.stroke();
  }
  if(dmg>0.02&&!(o.hits&&o.hits.length)&&!(o.marks&&o.marks.length)){ell(c,w,s,rw,rs,rot);c.fillStyle=`rgba(80,10,30,${(dmg*0.22).toFixed(3)})`;c.fill();}
  c.save();ell(c,w,s,rw*1.02,rs*1.02,rot);c.clip();
  const inO=(fx,fy)=>{let dx=(fx-w)/rw,dy=(fy-s)/rs;const d=Math.hypot(dx,dy);if(d>0.85){dx*=0.85/d;dy*=0.85/d;}return[w+dx*rw,s+dy*rs];};
  if(o.hits)for(const hh of o.hits){let x=front&&pz?w+clamp((hh.z-pz.zc)/(pz.zr||1),-1,1)*rw*0.8:w+hh.x*rw,y=s+hh.y*rs;const r=Math.max(0.35,hh.r);if(front&&hh.fy!=null){[x,y]=inO(hh.fx??x,hh.fy);}
    const g=c.createRadialGradient(x,y,0,x,y,r*3.4);g.addColorStop(0,'rgba(90,0,12,.75)');g.addColorStop(1,'rgba(120,0,16,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,r*3.4,0,6.28);c.fill();
    const sd=(hh.x*13.7+hh.y*7.1)%1;c.fillStyle='#4e0910';c.beginPath();for(let i=0;i<10;i++){const a=i/10*6.283+sd*6,rr=r*(1.25+0.35*Math.sin(i*2.7+sd*20));i?c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr):c.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}c.closePath();c.fill();
    c.fillStyle='#120103';c.beginPath();c.arc(x,y,r*0.75,0,6.28);c.fill();
    c.strokeStyle='rgba(30,0,4,.85)';c.lineWidth=0.14;for(let i=0;i<4;i++){const a=i*1.57+sd*4;c.beginPath();c.moveTo(x+Math.cos(a)*r*1.2,y+Math.sin(a)*r*1.2);c.lineTo(x+Math.cos(a+0.25)*r*2.4,y+Math.sin(a+0.25)*r*2.4);c.stroke();}}
  c.restore();
  if(o.marks)for(const q of o.marks){const mx=v=>front&&pz?w+clamp((q.z-pz.zc)/(pz.zr||1),-1,1)*rw*0.7+v*0:w+v*rw;let x1=front&&pz?mx(0)+q.y1*0:w+q.x1*rw,y1=s+q.y1*rs,x2=front&&pz?x1+(q.x2-q.x1)*rw*0.3:w+q.x2*rw,y2=s+q.y2*rs;if(front&&q.fy!=null){const dx=x2-x1,dy=y2-y1;[x1,y1]=inO(q.fx??x1,q.fy);x2=x1+dx;y2=y1+dy;}
    if(q.k==='bruise'){const g=c.createRadialGradient(x1,y1,0,x1,y1,Math.min(rw,rs)*0.6);g.addColorStop(0,'rgba(70,20,70,.65)');g.addColorStop(1,'rgba(70,20,70,0)');c.fillStyle=g;c.beginPath();c.arc(x1,y1,Math.min(rw,rs)*0.6,0,6.28);c.fill();}
    else if(q.k==='rupture'){c.strokeStyle='rgba(25,0,4,.9)';c.lineWidth=0.35;c.beginPath();let x=x1,y=y1;c.moveTo(x,y);for(let i=0;i<4;i++){x+=Math.cos(i*1.7+q.x1*9)*rw*0.25;y+=Math.sin(i*1.7+q.y1*9)*rs*0.25;c.lineTo(x,y);}c.stroke();}
    else{const len=Math.hypot(x2-x1,y2-y1),ln=q.k==='stab'?Math.min(rw,rs)*0.35:len;const ang=q.k==='stab'?0.9+q.x1:Math.atan2(y2-y1,x2-x1),cx=q.k==='stab'?x1:(x1+x2)/2,cy=q.k==='stab'?y1:(y1+y2)/2;
      c.save();c.translate(cx,cy);c.rotate(ang);c.fillStyle='rgba(150,30,40,.85)';c.beginPath();c.ellipse(0,0,Math.max(0.3,ln/2+0.15),0.55,0,0,6.28);c.fill();c.fillStyle='#1e0205';c.beginPath();c.ellipse(0,0,Math.max(0.2,ln/2),0.25,0,0,6.28);c.fill();c.restore();}}
  if(o.hp<=0){c.save();ell(c,w,s,rw,rs,rot);c.clip();let h=Math.floor((o.rw*97+o.rs*13)*1000)%2147483646+1;const rr=()=>{h=(h*16807)%2147483647;return h/2147483647;};
    c.fillStyle='rgba(70,0,10,.35)';ell(c,w,s+rs*0.4,rw,rs*0.7,rot);c.fill();
    c.strokeStyle='#2a0207';c.lineCap='round';for(let i=0;i<6;i++){let x=w+(rr()-0.5)*rw*1.4,y=s+(rr()-0.5)*rs*1.4;c.lineWidth=0.25+rr()*0.35;c.beginPath();c.moveTo(x,y);for(let k=0;k<3;k++){x+=(rr()-0.5)*rw*0.7;y+=(rr()-0.5)*rs*0.7;c.lineTo(x,y);}c.stroke();}
    c.restore();}
}
function drawCutVesselPulse(c){
  const pul=0.6+0.4*Math.sin(T*6);
  for(const v of VESSELS){if(v.stump||!v.seg.connected||!(v.cut>0)||!v.at)continue;const seg=v.seg;const f=fpOf(seg);let p=null;
    if(f&&f.t==='cap'){const t=clamp(fpT(seg,v.at.s),0,1),sg=f.x1>0?1:-1;p=capPt(f,t,-0.35,sg);}else if(f&&f.t==='torso'){p=[(v.z0+v.z1)/2*5,seg.rest.ay+v.at.s];}else if(seg.kind==='neck'){p=[(v.z0+v.z1)/2*3.4,-152+v.at.s*0.4];}
    if(!p)continue;c.fillStyle=v.lig?'rgba(120,120,120,.8)':`rgba(255,40,60,${pul})`;c.beginPath();c.arc(p[0],p[1],v.width+0.5,0,6.28);c.fill();c.fillStyle=C.track;c.beginPath();c.arc(p[0],p[1],v.width*0.6+0.2,0,6.28);c.fill();}
}
function drawLodged(c,front){
  const show=xray||trajOn||tool==='forceps'||tool==='surgery';if(!show||!LODGED.length)return;
  const sc=Math.max(1,1.6/VS),hi=tool==='forceps'||tool==='surgery';
  for(const L of LODGED){const p=front?(L.seg.connected?(L.fv?(L.fv===view?{x:L.fx,y:L.fy}:{x:L.fx,y:L.fy}):frontPos(L.seg,L.s,clamp(L.z==null?0:L.z,-1,1))):null):toWorld(L.seg,L.s,L.w);if(!p)continue;
    if(hi){c.strokeStyle='rgba(233,196,106,'+(0.5+0.4*Math.sin(T*6))+')';c.lineWidth=0.4*sc;c.beginPath();c.arc(p.x,p.y,2.6*sc,0,6.28);c.stroke();}
    // metal is radio-opaque: bullets show bright white on X-ray. Shape tells the story: a whole bullet, a mushroomed
    // hollow point, the base of a fragmenting round, or jagged shards of jacket and lead
    const shard=L.k==='shard'||L.k==='lead',r0=(L.sz||0.6)*sc;
    c.fillStyle=xray?'#e9eef2':'#8d9196';c.strokeStyle='#2a2d30';c.lineWidth=0.2*sc;c.beginPath();
    if(shard){const a=L.rot||0,n=5;for(let i=0;i<n;i++){const t=a+i/n*6.283,rr=r0*(i%2?0.45:1)*(L.k==='lead'?0.8:1);i?c.lineTo(p.x+Math.cos(t)*rr,p.y+Math.sin(t)*rr):c.moveTo(p.x+Math.cos(t)*rr,p.y+Math.sin(t)*rr);}c.closePath();}
    else if(L.mush){for(let i=0;i<8;i++){const t=i/8*6.283,rr=(i%2?0.75:1.15)*sc;i?c.lineTo(p.x+Math.cos(t)*rr,p.y+Math.sin(t)*rr*0.8):c.moveTo(p.x+Math.cos(t)*rr,p.y+Math.sin(t)*rr*0.8);}c.closePath();}
    else c.ellipse(p.x,p.y,(L.core?0.6:0.9)*sc,(L.core?0.45:0.6)*sc,0.6,0,6.28);
    c.fill();c.stroke();
    if(!shard){c.fillStyle='rgba(255,255,255,.6)';c.beginPath();c.arc(p.x-0.25*sc,p.y-0.2*sc,0.22*sc,0,6.28);c.fill();}}
}
function drawOp(c){
  const O=OP;if(!O||O.v!==view)return;const sc=Math.max(1,1.6/VS);
  const p=view==='side'?toWorld(O.seg,clamp(O.s,0,O.seg.len),O.w):{x:O.x,y:O.y};
  const tk=O.tasks[O.i],u=Math.min(1,O.t/tk.d),f=(O.i+u)/O.tasks.length;
  // the opened incision: wound edges pulled apart by retractors
  let open=tk.k==='open'?u:tk.k==='close'?1-u:1;open=open*open*(3-2*open);
  if(open>0.02&&O.kind!=='reattach'&&O.inc){
    let ax,ay;if(view==='side'){const d=dirWorld(O.seg,0,1),l=Math.hypot(d.x,d.y)||1;ax=d.x/l;ay=d.y/l;}else{ax=0;ay=1;}
    const L=(O.hl||4)*1.05,Wd=open*Math.min(3.4,L*0.55),nx=-ay,ny=ax;
    c.save();c.translate(p.x,p.y);c.rotate(Math.atan2(ay,ax)-Math.PI/2);
    const cav=(k)=>{c.beginPath();c.moveTo(0,-L);c.quadraticCurveTo(Wd*k,0,0,L);c.quadraticCurveTo(-Wd*k,0,0,-L);c.closePath();};
    cav(1.25);c.fillStyle='#e8c070';c.fill();cav(1.12);c.fillStyle='#8a1c26';c.fill();cav(0.9);const g=c.createRadialGradient(0,0,0.2,0,0,L);g.addColorStop(0,'#2a0408');g.addColorStop(1,'#5a0a12');c.fillStyle=g;c.fill();
    if(OPT.gore>0){c.fillStyle='rgba(120,10,18,.6)';c.beginPath();c.ellipse(0,L*0.55,Wd*0.6,0.6,0,0,6.28);c.fill();}
    // retractor blades hooking each edge
    c.strokeStyle='#cfd6dc';c.lineWidth=0.45;c.lineCap='round';for(const sgn of [1,-1])for(const yy of [-L*0.35,L*0.35]){const ex=sgn*Wd*1.05;c.beginPath();c.moveTo(ex*0.85,yy);c.lineTo(ex+sgn*2.4,yy);c.lineTo(ex+sgn*2.8,yy-1.6);c.stroke();}
    c.restore();
    // old organ comes out, the donor organ goes in
    if(tk.o&&(tk.k==='explant'||tk.k==='implant')){
      const e=u*u*(3-2*u),out=tk.k==='explant';const lift=out?e:1-e;const side=view==='back'?-1:1;
      const ox=p.x+side*(out?e*14:(1-e)*-14),oy=p.y-lift*16,scale=0.75;
      if(lift>0.08||!out){c.save();c.globalAlpha=Math.min(1,lift*6+0.15);c.translate(ox,oy);c.scale(scale,scale);c.rotate((out?1:-1)*lift*0.4);
        const o=out?tk.o:Object.assign({},tk.o,{hp:100,hits:[],marks:[],out:0,rep:false});
        if(o.id==='heart')heartFrontArt(c,out?0:Math.exp(-((T*1.4)%1)*9)*0.06,true);else{const t=o.out;o.out=0;drawOrgan(c,o,0,0,o.rw,o.rs,0,view!=='side');o.out=t;}
        if(out){c.fillStyle='rgba(60,10,20,.35)';c.beginPath();c.ellipse(0,0,o.rw,o.rs,0,0,6.28);c.fill();}
        c.restore();
        // forceps holding it
        c.strokeStyle='#d8dee4';c.lineWidth=0.5*sc;c.lineCap='round';c.beginPath();c.moveTo(ox-1,oy-tk.o.rs*0.7);c.lineTo(ox-3,oy-tk.o.rs*0.7-12);c.moveTo(ox+1,oy-tk.o.rs*0.7);c.lineTo(ox-1.5,oy-tk.o.rs*0.7-12);c.stroke();}
      // the removed organ waits in a steel tray beside the body
      if(!out||u>0.9){const tx=p.x+side*16,ty=p.y-3;c.fillStyle='#9aa4ad';c.beginPath();c.ellipse(tx,ty,6,1.6,0,0,6.28);c.fill();c.fillStyle='#c7cfd6';c.beginPath();c.ellipse(tx,ty-0.4,5.4,1.2,0,0,6.28);c.fill();
        if(!out){c.save();c.translate(tx,ty-1.6);c.scale(0.4,0.4);if(tk.o.id==='heart')heartFrontArt(c,0,true);else{const o=tk.o,t=o.out;o.out=0;drawOrgan(c,o,0,0,o.rw,o.rs,0,view!=='side');o.out=t;}c.fillStyle='rgba(40,10,20,.35)';c.beginPath();c.ellipse(0,0,tk.o.rw,tk.o.rs,0,0,6.28);c.fill();c.restore();}}
    }
    // a bullet lifted out with forceps
    if(tk.k==='bullet'){const e=u*u*(3-2*u),bx=p.x,by=p.y-e*12;c.fillStyle='#8d9196';c.strokeStyle='#2a2d30';c.lineWidth=0.2;c.beginPath();c.ellipse(bx,by,0.9,0.6,0.6,0,6.28);c.fill();c.stroke();c.strokeStyle='#d8dee4';c.lineWidth=0.4*sc;c.beginPath();c.moveTo(bx-0.4,by-0.5);c.lineTo(bx-2,by-10);c.moveTo(bx+0.4,by-0.5);c.lineTo(bx-0.8,by-10);c.stroke();}
    // steel plate lowered onto the bone, screws driven one by one
    if(tk.k==='plate'){const e=Math.min(1,u*2.2),py=p.y-(1-e)*12;c.save();c.translate(p.x,py);if(view==='side'){const d=dirWorld(O.seg,0,1);c.rotate(Math.atan2(d.y,d.x)-Math.PI/2);}
      const g=c.createLinearGradient(-0.5,0,0.5,0);g.addColorStop(0,'#8a949c');g.addColorStop(0.5,'#e6ecf0');g.addColorStop(1,'#7b858d');c.fillStyle=g;c.beginPath();c.roundRect?c.roundRect(-0.55,-4,1.1,8,0.5):c.rect(-0.55,-4,1.1,8);c.fill();c.strokeStyle='#4c555c';c.lineWidth=0.08;c.stroke();
      const nS=Math.floor(clamp((u-0.4)/0.6,0,1)*4.999);for(let i=0;i<4;i++){const yy=-3+i*2;c.fillStyle=i<nS?'#c9d0d6':'#3a4248';c.beginPath();c.arc(0,yy,0.32,0,6.28);c.fill();if(i<nS){c.strokeStyle='#5d666d';c.lineWidth=0.07;c.beginPath();c.moveTo(-0.2,yy);c.lineTo(0.2,yy);c.moveTo(0,yy-0.2);c.lineTo(0,yy+0.2);c.stroke();}}
      if(u>0.4&&nS<4){const yy=-3+nS*2;c.strokeStyle='#d8dee4';c.lineWidth=0.35;c.beginPath();c.moveTo(0,yy);c.lineTo(3,yy-9);c.stroke();}
      c.restore();}
    // needle and thread while repairing
    if(tk.k==='organ'||tk.k==='vessel'){const a=T*6,nx2=p.x+Math.cos(a)*1.6,ny2=p.y+Math.sin(a)*1.2;c.strokeStyle='#d8dee4';c.lineWidth=0.3*sc;c.beginPath();c.arc(nx2,ny2,1,0.2,3);c.stroke();c.strokeStyle='rgba(60,40,120,.9)';c.lineWidth=0.12;c.beginPath();c.moveTo(nx2,ny2);c.quadraticCurveTo(nx2+3,ny2-5,nx2+5,ny2-9);c.stroke();}
  }
  c.lineWidth=1*sc;c.strokeStyle='rgba(0,0,0,.5)';const ry=p.y-26*sc*0.3-14;c.beginPath();c.arc(p.x,ry,3*sc,0,6.28);c.stroke();
  c.strokeStyle='#6fe39a';c.beginPath();c.arc(p.x,ry,3*sc,-Math.PI/2,-Math.PI/2+f*6.283);c.stroke();
  const txt={reduce:'Setting the bone',plate:'Plate and screws',explant:'Removing damaged '+(tk.o&&tk.o.name.toLowerCase()),implant:'Placing donor '+(tk.o&&tk.o.name.toLowerCase()),marrow:'Infusing bone marrow',bone:'Plating the bone',reattach:'Reconnecting vessels',debride:'Cleaning wound',graft:'Grafting',open:'Opening',vessel:'Repairing '+(tk.v&&tk.v.name.toLowerCase()),organ:'Repairing '+(tk.o&&tk.o.name.toLowerCase()),bullet:'Removing bullet',close:'Closing'}[tk.k];
  c.save();c.translate(p.x,ry-4.5*sc);if(view==='back')c.scale(-1,1);c.font=`600 ${2.6*sc}px sans-serif`;c.textAlign='center';c.lineWidth=0.8*sc;c.strokeStyle='rgba(0,0,0,.7)';c.strokeText(txt,0,0);c.fillStyle='#e9ffe9';c.fillText(txt,0,0);c.restore();
}
