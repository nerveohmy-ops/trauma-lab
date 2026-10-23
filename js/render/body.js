/* TRAUMA_LAB_MAIN */
/* ===== render/body.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
function clipBites(c,seg,bl){for(const w of bl){const p=new Path2D();p.rect(-60,-60,120,seg.len+120);woundPath(p,w,-0.2*w.r);c.clip(p,'evenodd');}}
// side view: wet sheen of liquid still on him and the stains it left
function drawFilmsSide(){if(!FILMS.length&&!STAINS.length)return;const c=ctx;
  for(const q of STAINS){if(q.seg.gone)continue;setLocal(c,q.seg);const R=radS(q.seg,clamp(q.s,0,q.seg.len))||q.seg.ra,w=clamp(q.w,-R+0.4,R-0.4);c.fillStyle=`rgba(${q.col[0]|0},${q.col[1]|0},${q.col[2]|0},${q.a.toFixed(3)})`;ell(c,w,q.s,q.r*0.7,q.r,0);c.fill();}
  for(const f of FILMS){if(f.vol<0.05)continue;setLocal(c,f.seg);const R=radS(f.seg,clamp(f.s,0,f.seg.len))||f.seg.ra,w=clamp(f.w,-R+0.3,R-0.3),r=0.5+Math.min(2.4,Math.sqrt(f.vol)*0.9),col=f.col||[200,225,255,.3];
    c.fillStyle=`rgba(${col[0]|0},${col[1]|0},${col[2]|0},${Math.min(0.45,0.15+f.vol*0.08).toFixed(3)})`;ell(c,w,f.s+r*0.3,r*0.6,r*1.3,0);c.fill();c.fillStyle='rgba(255,255,255,.35)';ell(c,w-r*0.2,f.s,r*0.15,r*0.4,0);c.fill();}
  setWorld(c);}
// patterned bruises, abrasions and swelling (side: x=w,y=s in the part's frame; front: screen coords)
function drawBruiseVar(c,w,x,y){const age=w.age||0,fade=clamp(w.r/1.5,0.3,1),ph=clamp((age-15)/60,0,1),a=0.55*Math.min(1,age/2+0.4)*fade;
  const bc=`rgba(${lerp(150,75,ph)|0},${lerp(35,30,ph)|0},${lerp(55,90,ph)|0},`;
  c.save();c.translate(x,y);c.rotate(w.ang||0);
  if(w.abr){const sc=age>120,rr=w.r;c.fillStyle=sc?`rgba(115,55,40,${0.7*fade})`:`rgba(210,85,75,${0.6*fade})`;c.beginPath();c.ellipse(0,0,rr,rr*0.55,0,0,6.28);c.fill();
    c.strokeStyle=sc?`rgba(80,35,25,${0.6*fade})`:`rgba(150,25,30,${0.65*fade})`;c.lineWidth=0.12;for(let i=-3;i<=3;i++){const yy=i*rr*0.13;c.beginPath();c.moveTo(-rr*0.85,yy);c.lineTo(rr*0.85,yy+rnd(-0.05,0.05));c.stroke();}
    if(!sc){c.fillStyle=`rgba(140,10,20,${0.7*fade})`;for(let i=0;i<5;i++){c.beginPath();c.arc(((i*37)%7-3)*rr*0.22,((i*53)%5-2)*rr*0.18,0.12,0,6.28);c.fill();}}}
  else if(w.pat==='tram'){const L=w.r,gp=(w.gap||1.6)/2;c.strokeStyle=bc+a+')';c.lineWidth=0.55;c.lineCap='round';for(const sgn of [-1,1]){c.beginPath();c.moveTo(-L,sgn*gp);c.lineTo(L,sgn*gp+rnd(-0.03,0.03));c.stroke();}c.strokeStyle=bc+(a*0.35)+')';c.lineWidth=1.4;for(const sgn of [-1,1]){c.beginPath();c.moveTo(-L*0.9,sgn*(gp+0.5));c.lineTo(L*0.9,sgn*(gp+0.5));c.stroke();}}
  else if(w.pat==='ring'){c.strokeStyle=bc+a+')';c.lineWidth=0.45;c.beginPath();c.arc(0,0,w.r,0,6.28);c.stroke();c.fillStyle=bc+(a*0.3)+')';c.beginPath();c.arc(0,0,w.r*0.8,0,6.28);c.fill();}
  else if(w.eye){const g=c.createRadialGradient(0,0,0,0,0,w.r);g.addColorStop(0,bc+Math.min(0.75,a*1.4)+')');g.addColorStop(1,'rgba(90,40,90,0)');c.fillStyle=g;c.beginPath();c.ellipse(0,0,w.r*1.1,w.r*0.8,0,0,6.28);c.fill();}
  else if(w.swell){const g=c.createRadialGradient(0,0,0,0,0,w.r);g.addColorStop(0,bc+Math.min(0.6,a*1.1)+')');g.addColorStop(1,'rgba(110,60,60,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,w.r,0,6.28);c.fill();c.strokeStyle=`rgba(255,235,225,${0.35*fade})`;c.lineWidth=0.2;c.beginPath();c.arc(-w.r*0.2,-w.r*0.2,w.r*0.55,3.4,4.9);c.stroke();}
  c.restore();}
// laceration: ragged, bridged edges with a scraped rim, unlike a clean blade cut
function lacDetail(c,w){const n=10,ax=w.w2-w.w,ay=w.s2-w.s,L=Math.hypot(ax,ay)||1,ux=ax/L,uy=ay/L,nx=-uy,ny=ux;
  c.strokeStyle='rgba(185,80,70,.55)';c.lineWidth=0.35;c.beginPath();for(let i=0;i<=n;i++){const t=i/n,j=(w.jag?w.jag[i%w.jag.length]:1)-1;const x=w.w+ax*t+nx*(0.55+j*0.4),y=w.s+ay*t+ny*(0.55+j*0.4);i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();
  c.beginPath();for(let i=0;i<=n;i++){const t=i/n,j=(w.jag?w.jag[(i+5)%w.jag.length]:1)-1;const x=w.w+ax*t-nx*(0.55+j*0.4),y=w.s+ay*t-ny*(0.55+j*0.4);i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();
  c.strokeStyle='rgba(225,175,160,.8)';c.lineWidth=0.14;for(let i=1;i<4;i++){const t=i/4,x=w.w+ax*t,y=w.s+ay*t;c.beginPath();c.moveTo(x-nx*0.4,y-ny*0.4);c.lineTo(x+nx*0.4,y+ny*0.4);c.stroke();}}
function drawGel(c,x,y,r,rot){
  c.fillStyle='rgba(250,246,225,.38)';c.beginPath();c.arc(x,y,r*0.95,0,6.28);c.fill();
  c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=Math.max(0.08,r*0.06);c.lineCap='round';
  for(let i=0;i<3;i++){const a=rot+i*2.1;c.beginPath();c.arc(x+Math.cos(a)*r*0.25,y+Math.sin(a)*r*0.25,r*0.45,a+2.6,a+3.5);c.stroke();}
}
function drawRadBurn(c,x,y,r,deg,rot){
  const d=deg||1;const gr=c.createRadialGradient(x,y,0,x,y,r*1.15);
  if(d===1){gr.addColorStop(0,'rgba(205,45,85,.5)');gr.addColorStop(0.7,'rgba(190,60,90,.3)');gr.addColorStop(1,'rgba(190,60,90,0)');}
  else if(d===2){gr.addColorStop(0,'rgba(190,25,45,.85)');gr.addColorStop(0.6,'rgba(170,35,70,.55)');gr.addColorStop(1,'rgba(170,40,80,0)');}
  else{gr.addColorStop(0,'rgba(30,8,20,.95)');gr.addColorStop(0.35,'rgba(90,15,45,.85)');gr.addColorStop(0.7,'rgba(170,30,60,.55)');gr.addColorStop(1,'rgba(170,40,80,0)');}
  c.fillStyle=gr;c.beginPath();c.arc(x,y,r*1.15,0,6.28);c.fill();
  c.fillStyle='rgba(120,20,60,.3)';for(let i=0;i<6;i++){const a=rot*2+i*1.05,dd=r*(0.3+0.12*(i%3));c.beginPath();c.arc(x+Math.cos(a)*dd,y+Math.sin(a)*dd,r*0.13,0,6.28);c.fill();}
  if(d>=2){c.strokeStyle='rgba(250,235,225,.75)';c.lineWidth=Math.max(0.06,r*0.035);for(let i=0;i<8;i++){const a=rot+i*0.78,r0=r*0.62,r1=r*0.82;c.beginPath();c.moveTo(x+Math.cos(a)*r0,y+Math.sin(a)*r0);c.quadraticCurveTo(x+Math.cos(a+0.2)*r1,y+Math.sin(a+0.2)*r1,x+Math.cos(a+0.35)*r0*1.05,y+Math.sin(a+0.35)*r0*1.05);c.stroke();}}
}
function drawBurn(c,x,y,r,deg,rot,melt,chem,kind){
  if(melt>0){drawMelt(c,x,y,r,melt,chem,rot||0,kind);return;}
  if(!deg||deg>=3){const gr=c.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(25,14,10,.92)');gr.addColorStop(0.45,'rgba(60,28,16,.75)');gr.addColorStop(0.72,'rgba(150,55,40,.5)');gr.addColorStop(0.9,'rgba(190,70,55,.35)');gr.addColorStop(1,'rgba(190,70,55,0)');c.fillStyle=gr;c.beginPath();c.arc(x,y,r,0,6.28);c.fill();
    if(deg>=3){c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=Math.max(0.1,r*0.03);for(let i=0;i<5;i++){const a=rot+i*1.3;c.beginPath();c.moveTo(x+Math.cos(a)*r*0.15,y+Math.sin(a)*r*0.15);c.lineTo(x+Math.cos(a+0.4)*r*0.55,y+Math.sin(a+0.4)*r*0.55);c.stroke();}}return;}
  const gr=c.createRadialGradient(x,y,0,x,y,r);
  if(deg===1){gr.addColorStop(0,'rgba(215,70,60,.42)');gr.addColorStop(1,'rgba(215,70,60,0)');}
  else{gr.addColorStop(0,'rgba(200,55,50,.7)');gr.addColorStop(0.7,'rgba(205,70,60,.5)');gr.addColorStop(1,'rgba(205,70,60,0)');}
  c.fillStyle=gr;c.beginPath();c.arc(x,y,r,0,6.28);c.fill();
  if(deg===2){c.fillStyle='rgba(250,232,200,.8)';c.strokeStyle='rgba(160,90,70,.5)';c.lineWidth=Math.max(0.06,r*0.02);for(let i=0;i<5;i++){const a=rot*3+i*2.4,d=r*(0.15+0.12*(i%3)),br=r*(0.12+0.05*((i*7)%3));c.beginPath();c.arc(x+Math.cos(a)*d,y+Math.sin(a)*d,br,0,6.28);c.fill();c.stroke();}}
}
// each body part's skin is drawn once into its own small canvas and reused until something on it changes
function skinKey(seg){
  if(seg.kind==='head'||seg.growF!=null||seg.dust!=null)return null;
  for(const w of seg.wounds)if(w.acidT>0)return null;
  const tn=skinTone(seg.side==='far');
  let k=OPT.gore+'|'+Math.round(tn[0]/3)+','+Math.round(tn[1]/3)+','+Math.round(tn[2]/3)+'|'+seg.len.toFixed(2)+','+seg.ra.toFixed(2)+','+seg.rb.toFixed(2)+'|'+(seg.kind==='chest'?Math.round(breathAmt()*14):0)+'|'+(seg.tq??'')+'|'+(seg.wraps?seg.wraps.map(W=>W.s0.toFixed(1)+':'+W.s1.toFixed(1)).join():'')
    +'|'+(seg.spat&&seg.spat.length?seg.spat.length+':'+Math.floor((T-seg.spat[seg.spat.length-1].t)/10):0)+'|'+(seg.dents?seg.dents.map(d=>d.d.toFixed(1)).join():'')+'|'+(V.frozenT>0?'F':V.thawT>0?'t'+Math.round(V.thawT):'')
    +'|'+(seg.lich?Math.floor((T-seg.lich.t)/10):'')+'|'+(seg.amarks?seg.amarks.length:0)+'|'+WEARK+'|'+(seg.hasBite?1:0)+'|'+(seg.part?1:0)+'|'+Math.round((V.rot||0)*12)+'|';
  for(const w of seg.wounds){k+=w.type[0]+Math.round(w.w*2)+':'+Math.round(w.s*2)+(w.torn||'')+'r'+Math.round(w.r*10)+'.'+Math.round((w.sut||0)*10)+(w.band?'b':'')+(w.wrapped?'w':'')+(w.pack?'p':'')+(w.graft?'g':'')+(w.gel?'G':'')+(w.deg||'')+(w.heat?Math.round(w.heat):'')+(w.dig||'')+'a'+Math.min(80,Math.floor(w.age/4))+'c'+Math.round(clotOf(w)*5)+(w.bleed>0.05?'B':'')+';';
    for(const st of w.streaks)k+=(st.pts.length>>2)+(st.drip?'d':'')+Math.floor(st.age/10)+',';}
  return k;}
// knee, elbow, wrist and ankle: the rounded end of the lower part tucks under the part above it. Fading that cap lets the
// two blend into one smooth joint instead of showing a disc (only while the joint is intact)
function jointFade(seg){if(!(seg.kind==='shin'||seg.kind==='forearm'||seg.kind==='hand'||seg.kind==='foot')||seg.part||!seg.joint||seg.joint.broken||!seg.connected)return '';return seg.joint.end==='b'?'b':'a';}
function fadeJointCap(x,seg,res,o,end){const L=seg.len,[ra,rb]=segRad(seg),r=end==='a'?ra:rb,r2=Math.max(ra,rb)+1;x.save();x.setTransform(res,0,0,res,o*res,o*res);x.globalCompositeOperation='destination-out';
  const s0=end==='a'?-r:L+r,s1=end==='a'?r*0.35:L-r*0.35,g=x.createLinearGradient(0,s0,0,s1);g.addColorStop(0,'rgba(0,0,0,.95)');g.addColorStop(0.55,'rgba(0,0,0,.45)');g.addColorStop(1,'rgba(0,0,0,0)');
  x.fillStyle=g;x.fillRect(-r2,Math.min(s0,s1),2*r2,Math.abs(s1-s0));x.restore();}
function drawSkinCached(seg){
  const key=skinKey(seg);if(key==null){drawSkin(seg);return;}
  let sc=seg.scache;
  const fade=jointFade(seg),res=pickRes(sc&&sc.res,Math.min(16,VS*DPR*1.2)),o=Math.max(seg.ra,seg.rb)+5,L=seg.len,w=Math.ceil(2*o*res),h=Math.ceil((L+2*o)*res),fk=key+'|'+res.toFixed(2)+'|'+fade+(handFist(seg)?'|F':'')+(SKINBMP.side?'|A'+(OPT.scene||''):'');
  if(!sc||sc.key!==fk){if(!sc||sc.cv.width!==w||sc.cv.height!==h){sc={cv:document.createElement('canvas')};sc.cv.width=w;sc.cv.height=h;sc.cx=sc.cv.getContext('2d');}
    sc.cx.setTransform(1,0,0,1,0,0);sc.cx.clearRect(0,0,w,h);SKC={cx:sc.cx,res,o};try{drawSkin(seg);if(fade)fadeJointCap(sc.cx,seg,res,o,fade);}finally{SKC=null;}sc.key=fk;sc.res=res;seg.scache=sc;}
  setLocal(sctx,seg);sctx.drawImage(sc.cv,-o,-o,2*o,L+2*o);
}
function drawSkinG(seg){
  if(seg.gone)return;
  if(seg.dust!=null){const c=sctx;c.save();c.globalAlpha=Math.max(0,1-seg.dust);drawSkin(seg);c.restore();return;}
  if(seg.growF==null){drawSkinCached(seg);return;}
  const c=sctx,L=seg.len,g0=seg.g0||0,gl=L-g0,from=!g0&&seg.joint&&seg.joint.end==='b'?'b':'a',r=Math.max(seg.ra,seg.rb)+4;
  const eS=g0+gl*(seg.gs||0),eM=g0+gl*(seg.gm||0),eB=g0+gl*(seg.gb||0);
  // clip a band [s0,s1] measured from the growing end; full bands also keep the rounded tip
  const band=(s0,s1,full)=>{c.beginPath();const lo=s0<=0.001?-r-2:s0,hi=full?L+r:s1;if(from==='a')c.rect(-r,lo,2*r,hi-lo);else c.rect(-r,L-hi,2*r,hi-lo);c.clip();};
  const [ra,rb]=segRad(seg);
  if(eB>eM+0.01){c.save();setLocal(c,seg);band(eM,eB,seg.gb>=1);
    c.fillStyle='rgba(255,216,77,.10)';segPath(c,seg,ra*0.6,rb*0.6);c.fill();drawBones(c,seg);
    if(!seg.bones.some(b=>b.shape==='line')){c.strokeStyle=C.bone;c.lineWidth=Math.max(0.8,Math.min(ra,rb)*0.45);c.lineCap='round';c.beginPath();c.moveTo(0,0);c.lineTo(0,L);c.stroke();}
    c.restore();}
  if(eM>eS+0.01){c.save();setLocal(c,seg);band(eS,eM,seg.gm>=1);
    segPath(c,seg,ra*0.93,rb*0.93);c.fillStyle=C.muscle;c.fill();c.save();segPath(c,seg,ra*0.93,rb*0.93);c.clip();
    c.strokeStyle='rgba(255,175,165,.22)';c.lineWidth=0.25;const rr=Math.max(ra,rb);for(let k=-3;k<=3;k++){c.beginPath();c.moveTo(k*rr/4,-rr);c.lineTo(k*rr/4*0.85,L+rr);c.stroke();}
    drawMuscles(c,seg);c.restore();segPath(c,seg,ra*0.93,rb*0.93);c.strokeStyle='rgba(235,225,215,.35)';c.lineWidth=0.25;c.stroke();c.restore();}
  if(eS>0.01){c.save();setLocal(c,seg);band(0,eS,seg.gs>=1);drawSkin(seg);c.restore();}
  // glowing growth fronts
  c.save();setLocal(c,seg);c.fillStyle='rgba(255,216,77,.6)';
  for(const [e,f] of [[eB,seg.gb],[eM,seg.gm],[eS,seg.gs]]){if(f<=0||f>=1)continue;const y=from==='a'?e:L-e,rr=(radS(seg,clamp(y,0,L))||seg.ra)*(e===eB?0.5:1);c.beginPath();c.ellipse(0,y,rr+0.5,0.9,0,0,6.28);c.fill();}
  c.restore();
}
function stitches(c,x1,y1,x2,y2,sut){
  const L=Math.hypot(x2-x1,y2-y1)||1,nx=-(y2-y1)/L,ny=(x2-x1)/L,n=Math.max(3,Math.round(L/0.6));
  c.lineCap='round';
  if(sut>0.3){c.strokeStyle=`rgba(95,22,26,${Math.min(0.9,sut)})`;c.lineWidth=0.24;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();}
  const m=Math.ceil(n*sut);c.strokeStyle='#17244d';c.lineWidth=0.17;
  for(let i=0;i<m;i++){const t=(i+0.5)/n,x=lerp(x1,x2,t),y=lerp(y1,y2,t),sk=0.18;
    c.beginPath();c.moveTo(x-nx*0.55-(x2-x1)/L*sk,y-ny*0.55-(y2-y1)/L*sk);c.lineTo(x+nx*0.55+(x2-x1)/L*sk,y+ny*0.55+(y2-y1)/L*sk);c.stroke();
    c.fillStyle='#17244d';c.beginPath();c.arc(x+nx*0.6,y+ny*0.6,0.12,0,6.283);c.fill();}
}
function drawGauze(c,w,ex){
  c.save();woundPath(c,w,ex!=null?ex:(w.type==='cut'?0.1:0.05));c.clip();
  const cc=woundCenter(w),R_=w.type==='cut'?Math.max(1.5,(w.len||2)*0.6):w.r+1;
  c.fillStyle='#ece5d6';c.fillRect(cc.w-R_-1,cc.s-R_-1,2*R_+2,2*R_+2);
  const soak=clamp(0.25+w.age*0.01,0.25,0.7);const g=c.createRadialGradient(cc.w,cc.s,0,cc.w,cc.s,R_);g.addColorStop(0,`rgba(140,15,22,${soak})`);g.addColorStop(1,'rgba(140,15,22,.08)');c.fillStyle=g;c.fillRect(cc.w-R_-1,cc.s-R_-1,2*R_+2,2*R_+2);
  c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=0.14;for(let i=0;i<7;i++){const a=w.rot+i*0.9,r0=R_*0.25*(i%3+1)*0.4;c.beginPath();c.arc(cc.w+Math.cos(a)*r0,cc.s+Math.sin(a)*r0,R_*0.35,a,a+2.2);c.stroke();}
  c.restore();
}
function drawGraft(c,w){
  const cc=woundCenter(w);
  c.save();woundPath(c,w,0.15);c.fillStyle='#d79c8a';c.fill();c.clip();
  c.strokeStyle='rgba(120,55,45,.35)';c.lineWidth=0.12;const R_=w.type==='cut'?(w.len||3):w.r+1.5;
  for(let k=-R_;k<=R_;k+=0.55){c.beginPath();c.moveTo(cc.w+k-R_,cc.s-R_);c.lineTo(cc.w+k+R_,cc.s+R_);c.moveTo(cc.w+k+R_,cc.s-R_);c.lineTo(cc.w+k-R_,cc.s+R_);c.stroke();}
  c.restore();
  c.strokeStyle='rgba(95,40,35,.6)';c.lineWidth=0.22;woundPath(c,w,0.15);c.stroke();
  if(w.type!=='cut'){const n=Math.max(6,Math.round(w.r*5)),r0=w.r+0.15;c.strokeStyle='#b8bec4';c.lineWidth=0.16;for(let i=0;i<n;i++){const a=i/n*6.283,x=w.w+Math.cos(a)*r0,y=w.s+Math.sin(a)*r0,tx=-Math.sin(a)*0.35,ty=Math.cos(a)*0.35;c.beginPath();c.moveTo(x-tx,y-ty);c.lineTo(x+tx,y+ty);c.stroke();}}
}
function stitchSide(c,w){
  if(w.type==='cut'){stitches(c,w.w,w.s,w.w2,w.s2,w.sut);return;}
  const rr=(w.type==='stump'?w.r*0.95:w.r+0.45),a=w.rot;stitches(c,w.w-Math.cos(a)*rr,w.s-Math.sin(a)*rr,w.w+Math.cos(a)*rr,w.s+Math.sin(a)*rr,w.sut);
}
function woundLayers(c,w,seg){
  if(w.type==='hole'&&!w.dig&&!w.slit&&!w.arrow){woundArt(c,w.w,w.s,w.r,{kind:seg?seg.kind:'',exit:w.exit,torn:w.torn,bone:seg&&(w.exit||w.r>0.6)&&boneBrokenNear(seg,w.s),seed:w.s*3.1+w.w*1.7,clot:clotOf(w),tone:seg?skinTone(seg.side==='far'):undefined});return;}
  if(w.type==='hole'&&!w.dig&&!w.torn&&!w.exit&&w.r<0.8){
    // entrance wound: punched-in hole ringed by a thin reddish-brown abrasion collar where the bullet scraped the skin
    c.fillStyle='rgba(150,62,52,.75)';woundPath(c,w,0.32);c.fill();c.fillStyle='#4a0a10';woundPath(c,w,0.12);c.fill();c.fillStyle='#1a0306';woundPath(c,w,-0.08);c.fill();return;}
  if(w.type==='hole'&&w.exit&&!w.dig&&w.r<1.3){
    // exit wound: no abrasion collar, skin split outward into a ragged star
    let h=Math.floor(Math.abs(Math.sin(w.rot*53.7))*1e6)+3;const rr=()=>{h=(h*16807)%2147483647;return h/2147483647;};
    c.fillStyle='#5c0c12';woundPath(c,w,0.12);c.fill();c.strokeStyle='#3a060b';c.lineCap='round';
    const n=4+Math.floor(rr()*3);for(let i=0;i<n;i++){const a=w.rot+i/n*6.283+rr()*0.5,l=w.r*(1.1+rr()*0.9);c.lineWidth=0.14+rr()*0.12;c.beginPath();c.moveTo(w.w,w.s);c.lineTo(w.w+Math.cos(a)*l,w.s+Math.sin(a)*l);c.stroke();}
    c.fillStyle='#8e2029';woundPath(c,w,-0.05);c.fill();c.fillStyle='#1a0306';woundPath(c,w,-0.3);c.fill();return;}
  const big=w.exit||w.r>0.75;
  c.fillStyle='#e7c66c';woundPath(c,w,big?0.48:0.4);c.fill();          // yellow subcutaneous fat
  c.fillStyle='#9e252d';woundPath(c,w,big?0.3:0.24);c.fill();           // red muscle
  c.save();woundPath(c,w,big?0.3:0.24);c.clip();c.strokeStyle='rgba(255,190,180,.35)';c.lineWidth=0.09;
  for(let i=-3;i<=3;i++){const x=w.w+i*0.22;c.beginPath();c.moveTo(x,w.s-w.r-0.5);c.lineTo(x+0.05,w.s+w.r+0.5);c.stroke();}c.restore();
  c.strokeStyle='rgba(60,4,8,.65)';c.lineWidth=0.12;woundPath(c,w,0.62);c.stroke();
  if(seg&&(w.exit||w.r>0.6)&&boneBrokenNear(seg,w.s))woundLayers.shards(c,w,5,0.18);
}
woundLayers.shards=(c,w,n,z0)=>{let h=Math.floor(Math.abs(Math.sin(w.rot*97.1))*1e6)+7;const rr=()=>{h=(h*16807)%2147483647;return h/2147483647;};
  c.fillStyle='#efe6cf';c.strokeStyle='rgba(120,100,70,.7)';c.lineWidth=0.06;
  for(let i=0;i<n;i++){const a=rr()*6.283,d=w.r*(0.25+rr()*0.75),x=w.w+Math.cos(a)*d,y=w.s+Math.sin(a)*d,z=z0+rr()*z0*1.2,t=rr()*6.283;
    c.beginPath();c.moveTo(x+Math.cos(t)*z*1.6,y+Math.sin(t)*z*1.6);c.lineTo(x+Math.cos(t+2.2)*z,y+Math.sin(t+2.2)*z);c.lineTo(x+Math.cos(t+3.8)*z*0.8,y+Math.sin(t+3.8)*z*0.8);c.closePath();c.fill();c.stroke();}};
// torn skin flaps, shredded muscle fibres, clotting crust and the wet shine of a fresh wound
function woundDetail(c,w,seg,su){
  const cc=woundCenter(w),cl=clotOf(w),r=w.type==='cut'?Math.max(0.6,(w.len||2)*0.3):w.r;
  if(w.torn&&w.type==='hole'){const n=w.jag?w.jag.length:9,tone=skinTone(seg.side==='far');
    c.strokeStyle='#a3282f';c.lineWidth=0.16;c.lineCap='round';for(let i=0;i<n;i++){const a=w.rot+i/n*6.283+0.3,r0=r*0.15,r1=r*(0.7+0.3*(w.jag?w.jag[i]:1));c.beginPath();c.moveTo(cc.w+Math.cos(a)*r0,cc.s+Math.sin(a)*r0);c.quadraticCurveTo(cc.w+Math.cos(a+0.25)*r1*0.6,cc.s+Math.sin(a+0.25)*r1*0.6,cc.w+Math.cos(a+0.1)*r1,cc.s+Math.sin(a+0.1)*r1);c.stroke();}
    for(let i=0;i<Math.min(7,n);i+=1){const a=w.rot+i*0.9,j=w.jag?w.jag[i%n]:1,b0=r*0.95*j,tip=r*(1.12+0.15*j);
      c.fillStyle=rgb(tone,0.62);c.beginPath();c.moveTo(cc.w+Math.cos(a-0.32)*b0,cc.s+Math.sin(a-0.32)*b0);c.lineTo(cc.w+Math.cos(a)*tip,cc.s+Math.sin(a)*tip);c.lineTo(cc.w+Math.cos(a+0.32)*b0,cc.s+Math.sin(a+0.32)*b0);c.closePath();c.fill();c.strokeStyle='rgba(90,12,18,.7)';c.lineWidth=0.08;c.stroke();}}
  if(cl>0.05){c.globalAlpha=0.9*cl;c.fillStyle='#3a0a0d';woundPath(c,w,-0.05);c.fill();c.fillStyle='#24060a';for(let i=0;i<5;i++){const a=w.rot+i*1.3,d=r*0.45;ell(c,cc.w+Math.cos(a)*d,cc.s+Math.sin(a)*d,r*0.18,r*0.14,a);c.fill();}c.globalAlpha=1;}
  else if(w.bleed>0.05&&su<0.3){c.fillStyle='rgba(255,215,215,.35)';ell(c,cc.w-r*0.35,cc.s-r*0.35,Math.max(0.12,r*0.22),Math.max(0.07,r*0.12),-0.6);c.fill();}
}
// layered cross-section where a limb was cut or torn off, plus jagged bone for torn stumps
function drawStumpEnds(c,seg){
  for(const w of seg.wounds){if(w.type!=='stump'||w.sut>=1||w.graft)continue;const ds=w.ds>=0?1:-1,rr=(radS(seg,clamp(w.s,0,seg.len))||seg.ra)*0.95,cs=w.s+ds*rr*0.28,ry=rr*0.42;
    const b=seg.bones.find(x=>x.shape==='line'&&x.pts),bw=b?b.width:1.2,bx=b?b.pts.reduce((a,p)=>a+p[1],0)/b.pts.length:0;
    if(w.torn){const n=w.jag?w.jag.length:14;c.fillStyle='#7d1820';c.beginPath();for(let i=0;i<=n;i++){const t=i/n,x=-rr+2*rr*t,j=w.jag?w.jag[i%n]:1;const y=cs+ds*(0.3+1.4*Math.abs(Math.sin(i*2.3+w.rot))*j);i?c.lineTo(x,y):c.moveTo(x,y);}c.lineTo(rr,cs-ds*ry);c.lineTo(-rr,cs-ds*ry);c.closePath();c.fill();}
    c.fillStyle=rgb(skinTone(seg.side==='far'),0.8);ell(c,0,cs,rr,ry);c.fill();
    c.fillStyle='#e2c26a';ell(c,0,cs,rr*0.9,ry*0.88);c.fill();
    c.fillStyle='#9e252d';ell(c,0,cs,rr*0.76,ry*0.74);c.fill();
    c.strokeStyle='rgba(60,6,10,.55)';c.lineWidth=0.08;for(let i=0;i<5;i++){const a=i*1.25+w.rot;c.beginPath();c.moveTo(bx,cs);c.lineTo(Math.cos(a)*rr*0.74,cs+Math.sin(a)*ry*0.72);c.stroke();}
    if(w.torn&&b){const L=1.6+1.6*Math.abs(Math.sin(w.rot*3)),tip=cs+ds*L;c.fillStyle=C.bone;c.beginPath();c.moveTo(bx-bw*0.5,cs);c.lineTo(bx-bw*0.45,tip-ds*0.3);c.lineTo(bx-bw*0.1,tip+ds*0.2);c.lineTo(bx+bw*0.15,tip-ds*0.45);c.lineTo(bx+bw*0.5,tip);c.lineTo(bx+bw*0.5,cs);c.closePath();c.fill();c.strokeStyle=C.boneE;c.lineWidth=0.12;c.stroke();
      c.fillStyle='#a5463f';ell(c,bx,tip-ds*0.35,bw*0.2,0.25);c.fill();}
    else{c.fillStyle=C.bone;ell(c,bx,cs,bw*0.55,ry*0.32);c.fill();c.fillStyle='#a5463f';ell(c,bx,cs,bw*0.25,ry*0.14);c.fill();}
    if(w.bleed>0.1&&(w.bmax?w.bleed/w.bmax>0.3:true)){c.fillStyle='rgba(150,10,20,.45)';ell(c,bx*0.5,cs+ds*ry*0.2,rr*0.5,ry*0.35);c.fill();}
  }
}
// an incised wound is a spindle: pointed at both ends, widest a little after the blade entered (deepest there),
// tapering into a shallow tail where the blade left the skin. Skin tension pulls longer cuts wider open.
function cutPath(c,x1,y1,x2,y2,g,ex,seed){const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,nx=-uy,ny=ux,e=Math.max(0,ex||0),n=16,sd=seed||0;
  if(c.beginPath)c.beginPath();const pt=(t,sg)=>{const sh=Math.pow(Math.sin(Math.PI*t),0.62)*(1.12-0.42*t),wob=1+0.07*Math.sin(t*19+sd*7.3+sg);const hw=Math.max(0.015,g*sh*wob+(ex||0)*Math.pow(Math.sin(Math.PI*t),0.25));
    const al=-e+t*(L+2*e);return [x1+ux*al+nx*hw*sg,y1+uy*al+ny*hw*sg];};
  let q=pt(0,1);c.moveTo(q[0],q[1]);for(let i=1;i<=n;i++){q=pt(i/n,1);c.lineTo(q[0],q[1]);}for(let i=n;i>=0;i--){q=pt(i/n,-1);c.lineTo(q[0],q[1]);}c.closePath();}
// front/back skin: a sharp slit punched through the skin layer (the muscle shows through), a thin bruised rim and the exit tail
function drawCutSkin(s,x1,y1,x2,y2,r,su,seed){const L=Math.hypot(x2-x1,y2-y1);
  if(su>=1){s.strokeStyle='rgba(120,40,45,.55)';s.lineWidth=0.3;s.lineCap='butt';s.beginPath();s.moveTo(x1,y1);s.lineTo(x2,y2);s.stroke();stitches(s,x1,y1,x2,y2,su);return;}
  const g=(r+0.3)*clamp(0.55+L*0.06,0.6,1.5);
  s.fillStyle='rgba(120,30,35,.28)';cutPath(s,x1,y1,x2,y2,g+0.35,0.25,seed);s.fill();
  s.fillStyle='#3f070b';cutPath(s,x1,y1,x2,y2,g,0,seed);s.fill();
  // the edges of a gaping cut: dermis, then a band of yellow fat, then the red muscle the blade reached
  if(su<0.5&&g>0.32){s.fillStyle='#d9b45e';cutPath(s,x1,y1,x2,y2,g*0.84,-0.02,seed);s.fill();s.fillStyle='#8f1d24';cutPath(s,x1,y1,x2,y2,g*0.62,-0.04,seed);s.fill();
    if(g>0.6){s.save();cutPath(s,x1,y1,x2,y2,g*0.62,-0.04,seed);s.clip();const L_=Math.hypot(x2-x1,y2-y1)||1,ux=(x2-x1)/L_,uy=(y2-y1)/L_;s.strokeStyle='rgba(230,130,130,.3)';s.lineWidth=0.07;for(let t=0.1;t<1;t+=0.12){const px=lerp(x1,x2,t),py=lerp(y1,y2,t);s.beginPath();s.moveTo(px-uy*g,py+ux*g);s.lineTo(px+uy*g,py-ux*g);s.stroke();}s.restore();}}
  if(su<1){s.globalCompositeOperation='destination-out';cutPath(s,x1,y1,x2,y2,g*(g>0.32&&su<0.5?0.4:0.7)*(1-su),-0.05,seed);s.fill();s.globalCompositeOperation='source-over';}
  // tail: the blade lifting out of the skin leaves a hairline scratch past the exit end
  if(L>1.5){const ux=(x2-x1)/L,uy=(y2-y1)/L,tl=Math.min(2.5,0.12*L+0.4);s.strokeStyle='rgba(125,28,34,.55)';s.lineWidth=0.14;s.lineCap='round';s.beginPath();s.moveTo(x2,y2);s.lineTo(x2+ux*tl,y2+uy*tl);s.stroke();}
  if(su>0)stitches(s,x1,y1,x2,y2,su);}
function woundPath(c,wd,ex){
  if(wd.type==='cut'&&!wd.jag){const L=Math.hypot(wd.w2-wd.w,wd.s2-wd.s)||1;
    const g=Math.max(0.05,Math.min(1.2,0.16+(wd.len||L)*0.04)*(wd.r/0.35)*0.7);cutPath(c,wd.w,wd.s,wd.w2,wd.s2,g,ex>0?ex*0.42:ex,(wd.s*3.1+wd.w*1.7)%6);return;}
  if(wd.type==='cut'){const mw=(wd.w+wd.w2)/2,ms=(wd.s+wd.s2)/2,dx=wd.w2-wd.w,ds=wd.s2-wd.s,L=Math.hypot(dx,ds)||1,nx=-ds/L,ny=dx/L;
    const g=Math.max(0.05,Math.min(1.2,0.18+(wd.len||L)*0.045)*(wd.r/0.35)*0.7+ex);const ux=dx/L*Math.max(0,ex),uy=ds/L*Math.max(0,ex);
    if(c.beginPath)c.beginPath();c.moveTo(wd.w-ux,wd.s-uy);c.quadraticCurveTo(mw+nx*g*2,ms+ny*g*2,wd.w2+ux,wd.s2+uy);c.quadraticCurveTo(mw-nx*g*2,ms-ny*g*2,wd.w-ux,wd.s-uy);c.closePath();return;}
  const r=Math.max(0.05,wd.r+ex);
  if(wd.jag&&wd.dig){if(c.beginPath)c.beginPath();const n=wd.jag.length,pt=i=>{const a=i/n*6.283+wd.rot,rr=r*wd.jag[i%n];return[wd.w+Math.cos(a)*rr,wd.s+Math.sin(a)*rr];};let p0=pt(0),p1=pt(1);c.moveTo((p0[0]+p1[0])/2,(p0[1]+p1[1])/2);for(let i=1;i<=n;i++){const a1=pt(i),a2=pt(i+1);c.quadraticCurveTo(a1[0],a1[1],(a1[0]+a2[0])/2,(a1[1]+a2[1])/2);}c.closePath();return;}
  if(wd.jag){if(c.beginPath)c.beginPath();const n=wd.jag.length;for(let i=0;i<=n;i++){const a=i/n*6.283+wd.rot,rr=r*wd.jag[i%n];const x=wd.w+Math.cos(a)*rr,y=wd.s+Math.sin(a)*rr;i?c.lineTo(x,y):c.moveTo(x,y);}c.closePath();return;}
  if(wd.slit){if(c.beginPath)c.beginPath();c.moveTo(wd.w+Math.cos(wd.rot)*r,wd.s+Math.sin(wd.rot)*r);c.ellipse(wd.w,wd.s,r,Math.max(0.12,r*0.32),wd.rot,0,6.283);c.closePath();return;}
  if(c.beginPath)c.beginPath();c.moveTo(wd.w+r,wd.s);c.arc(wd.w,wd.s,r,0,6.283);c.closePath();
}
function drawFlap(st,tone){const n=st.nodes,m=n.length,c=ctx;
  const L=[],R=[];for(let i=0;i<m;i++){const a=n[Math.max(0,i-1)],b=n[Math.min(m-1,i+1)],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,nx=-dy/d,ny=dx/d,wd=st.wid*(1-0.55*i/(m-1))*0.5*(1+0.12*Math.sin(i*2.1+st.ph));L.push([n[i].x+nx*wd,n[i].y+ny*wd]);R.push([n[i].x-nx*wd,n[i].y-ny*wd]);}
  const path=(sh)=>{c.beginPath();c.moveTo(L[0][0]+sh,L[0][1]);for(let i=1;i<m;i++)c.lineTo(L[i][0]+sh,L[i][1]);for(let i=m-1;i>=0;i--)c.lineTo(R[i][0]+sh,R[i][1]);c.closePath();};
  if(st.k==='flap'){
    // underside (raw dermis and fat) peeks out on one edge, the skin face on top
    path(0.35);c.fillStyle='#9a2a32';c.fill();
    path(0);const g=c.createLinearGradient(n[0].x,n[0].y,n[m-1].x,n[m-1].y);g.addColorStop(0,rgb(tone,0.95));g.addColorStop(1,rgb(tone,0.78));c.fillStyle=g;c.fill();
    c.strokeStyle='#e4c46c';c.lineWidth=0.22;c.beginPath();c.moveTo(R[0][0],R[0][1]);for(let i=1;i<m;i++)c.lineTo(R[i][0],R[i][1]);c.lineTo(L[m-1][0],L[m-1][1]);c.stroke();
    c.strokeStyle='rgba(110,20,26,.75)';c.lineWidth=0.16;c.stroke();
    c.fillStyle='rgba(120,10,18,.55)';const t=n[m-1];c.beginPath();c.arc(t.x,t.y+0.2,0.22,0,6.28);c.fill();
  }else{
    path(0);c.fillStyle='#8e1f27';c.fill();c.strokeStyle='#5c0f15';c.lineWidth=0.14;c.stroke();
    c.strokeStyle='rgba(255,170,160,.3)';c.lineWidth=0.1;for(const f of [-0.25,0,0.25]){c.beginPath();for(let i=0;i<m;i++){const x=lerp(L[i][0],R[i][0],0.5+f),y=lerp(L[i][1],R[i][1],0.5+f);i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}
    c.strokeStyle='rgba(235,225,215,.55)';c.lineWidth=0.2;c.beginPath();c.moveTo(L[0][0],L[0][1]);for(let i=1;i<m;i++)c.lineTo(L[i][0],L[i][1]);c.stroke();
  }
}
function skinTone(far){
  const frac=V.blood/5000;let pal=clamp((1-frac)*1.9,0,0.85)+(V.dead?Math.min(0.3,(T-V.deadAt)*0.03):0);
  const cy=clamp((85-V.spo2)/50,0,0.6);
  const sk=SKINS[OPT.skin]||SKINS.medium;let r=lerp(sk[0],sk[0]*0.72+48,pal),g=lerp(sk[1],sk[1]*0.72+70,pal),b=lerp(sk[2],sk[2]*0.72+86,pal);
  r=lerp(r,168,cy);g=lerp(g,172,cy);b=lerp(b,196,cy);
  const flush=clamp(DR.adr.l*0.06+(V.painEff/100)*0.05,0,0.12)*(V.dead?0:1);r+=flush*120;g-=flush*30;
  if(V.frozenT>0||V.thawT>0){const f=V.frozenT>0?0.75:0.75*clamp(V.thawT/6,0,1);r=lerp(r,178,f);g=lerp(g,208,f);b=lerp(b,232,f);}
  if(DRAIN>0){const f=clamp(DRAIN/3000,0,0.55);r=lerp(r,170,f);g=lerp(g,165,f);b=lerp(b,160,f);}
  if(V.rot>0){const f=Math.min(1,V.rot)*0.72;r=lerp(r,112,f);g=lerp(g,128,f);b=lerp(b,92,f);}
  const k=far?0.8:1;return[r*k,g*k,b*k];
}
function drawSkin(seg){
  const MILD=OPT.gore===0;
  const c=SKC?SKC.cx:sctx;setLocal(c,seg);const tone=skinTone(seg.side==='far');
  const [ra,rb]=segRad(seg);const r=Math.max(ra,rb),L=seg.len;
  const bl=bitesOf(seg);c.save();if(bl.length)clipBites(c,seg,bl);
  segPath(c,seg,ra,rb);
  const g=c.createLinearGradient(-r,0,r,0);g.addColorStop(0,rgb(tone,0.8));g.addColorStop(0.18,rgb(tone,0.9));g.addColorStop(0.45,rgb(tone,0.99));g.addColorStop(0.7,rgb(tone,1.04));g.addColorStop(0.9,rgb(tone,1.0));g.addColorStop(1,rgb(tone,0.9));
  c.fillStyle=g;c.fill();
  c.save();segPath(c,seg,ra,rb);c.clip();
  const g2=c.createLinearGradient(0,-r,0,L+r);g2.addColorStop(0,'rgba(255,240,225,.10)');g2.addColorStop(0.5,'rgba(255,240,225,0)');g2.addColorStop(1,'rgba(60,25,15,.10)');c.fillStyle=g2;c.fillRect(-r-1,-r-1,2*r+2,L+2*r+2);
  if(OPT.quality!=='low'){if(!skinArtSide(c,seg))skinDetail(c,seg,tone,ra,rb);}
  if(V.rot>0.12)rotDetail(c,seg,ra,rb);
  c.restore();
  const limb=!(seg.kind==='chest'||seg.kind==='abd'||seg.kind==='neck'||seg.kind==='head');
  if(limb){if(seg.kind==='hand'&&!seg.part&&seg.len>14){segPath(c,seg,ra,rb);c.strokeStyle='rgba(70,35,25,.2)';c.lineWidth=0.2;c.stroke();c.beginPath();}else if(seg.dents&&seg.dents.length){segPath(c,seg,ra,rb);}else capSides(c,L,ra,rb);c.strokeStyle='rgba(70,35,25,.26)';c.lineWidth=0.28;c.stroke();}
  if(seg.kind==='hand'&&!seg.part&&seg.len>14&&handFist(seg))fistDetail(c,tone);
  else if(seg.kind==='hand'&&!seg.part&&seg.len>14){smoothPath(c,THUMBP,[1,1]);const tg=c.createLinearGradient(1.8,0,3.8,0);tg.addColorStop(0,rgb(tone,0.9));tg.addColorStop(0.6,rgb(tone,1.0));tg.addColorStop(1,rgb(tone,0.93));c.fillStyle=tg;c.fill();c.strokeStyle='rgba(70,35,25,.24)';c.lineWidth=0.15;c.stroke();
    c.strokeStyle='rgba(90,45,35,.18)';c.lineWidth=0.09;c.beginPath();c.moveTo(2.55,7.5);c.quadraticCurveTo(3.1,7.7,3.65,7.45);c.stroke();c.fillStyle='rgba(248,214,206,.8)';ell(c,3.2,9.15,0.36,0.6,-0.25);c.fill();c.fillStyle='rgba(255,255,255,.35)';ell(c,3.3,8.95,0.1,0.2,-0.25);c.fill();}
  if(seg.kind==='head')drawFaceSide(c,seg,tone);
  c.save();segPath(c,seg,ra,rb);c.clip();
  for(const w of seg.wounds){
    if(w.type==='bruise'&&(w.abr||w.pat||w.swell||w.eye)){drawBruiseVar(c,w,w.w,w.s);}
    else if(w.type==='bruise'){const a=0.3*Math.min(1,w.age/3+0.3),ph=clamp((w.age-15)/60,0,1),yl=clamp((w.age-110)/140,0,1);const gr=c.createRadialGradient(w.w,w.s,0,w.w,w.s,w.r*(1+0.25*ph));gr.addColorStop(0,`rgba(${lerp(150,70,ph)|0},${lerp(30,30,ph)|0},${lerp(50,85,ph)|0},${a})`);gr.addColorStop(0.6,`rgba(${lerp(140,110,ph)|0},40,${lerp(60,80,ph)|0},${a*0.8})`);if(yl>0)gr.addColorStop(0.85,`rgba(150,145,60,${a*0.55*yl})`);gr.addColorStop(1,'rgba(110,60,60,0)');c.fillStyle=gr;ell(c,w.w,w.s,w.r,w.r*0.85,w.rot);c.fill();}
    else if(w.type==='burn'){if(w.graft)drawGraft(c,w);else{if(w.radBurn)drawRadBurn(c,w.w,w.s,w.r,w.deg,w.rot);else drawBurn(c,w.w,w.s,w.r,w.deg,w.rot,w.melt,w.chem,seg.kind);if(w.acid&&!(w.melt>0.6)){c.fillStyle=w.ck==='sa'?'rgba(40,22,14,.6)':w.ck==='acid'?'rgba(232,222,180,.45)':w.ck==='alk'?'rgba(160,125,95,.45)':`rgba(150,170,40,${w.acidT>0?0.45:0.25})`;ell(c,w.w,w.s,w.r*0.85,w.r*0.7,w.rot);c.fill();if(w.acidT>0){c.fillStyle='rgba(220,240,120,.6)';for(let i=0;i<4;i++){const a=T*3+i*1.7+w.rot;ell(c,w.w+Math.cos(a)*w.r*0.5,w.s+Math.sin(a*1.3)*w.r*0.4,0.18+0.12*Math.sin(T*9+i),0.18+0.12*Math.sin(T*9+i));c.fill();}}}if(w.gel)drawGel(c,w.w,w.s,w.r,w.rot);if(w.band){c.fillStyle='rgba(239,236,228,.88)';ell(c,w.w,w.s,w.r*0.9,w.r*0.9);c.fill();}}}
    else if(w.type!=='stump'&&!MILD){const cc=woundCenter(w);const hr=(w.type==='cut'?Math.max(1.4,(w.len||2)*0.45):Math.min(w.r*(w.exit?2:2.4),w.r+2.5))+0.5;if(!(w.sut>=1)){const sw=Math.min(1,w.age/40),hz=hr+1.6*sw;c.fillStyle=`rgba(190,70,70,${(0.1*sw).toFixed(3)})`;ell(c,cc.w,cc.s,hz,hz*0.9,w.rot);c.fill();}c.fillStyle='rgba(115,20,40,.13)';ell(c,cc.w,cc.s,hr,hr);c.fill();ell(c,cc.w,cc.s,hr*0.65,hr*0.65);c.fill();}
  }
  if(seg.lich)drawLich(c,seg.lich);
  if(V.frozenT>0||V.thawT>0){const f=V.frozenT>0?1:clamp(V.thawT/6,0,1);c.fillStyle=`rgba(225,240,255,${0.28*f})`;c.fillRect(-r-1,-r-1,2*r+2,L+2*r+2);c.strokeStyle=`rgba(255,255,255,${0.55*f})`;c.lineWidth=0.12;let h_=seg.idx*7919+13;const rr_=()=>{h_=(h_*16807)%2147483647;return h_/2147483647;};for(let i=0;i<Math.ceil(L/4);i++){let x=(rr_()*2-1)*r*0.8,y=rr_()*L;c.beginPath();c.moveTo(x,y);for(let k=0;k<3;k++){x+=(rr_()*2-1)*1.5;y+=(rr_()*2-1)*1.5;c.lineTo(x,y);}c.stroke();}}
  if(!MILD&&seg.spat&&seg.spat.length){for(const q of seg.spat){const dry=clamp((T-q.t)/70,0,1);c.fillStyle=`rgba(${lerp(128,72,dry)|0},${lerp(8,10,dry)|0},${lerp(16,12,dry)|0},.85)`;c.save();c.translate(q.w,q.s);c.rotate(q.ang);ell(c,0,0,q.r*(1+q.e),q.r,0);c.fill();if(q.e>0.5){ell(c,q.r*(1+q.e)*1.25,0,q.r*0.32,q.r*0.28,0);c.fill();}c.restore();}}
  c.lineCap='round';c.lineJoin='round';
  if(!MILD)for(const w of seg.wounds){if(!w.streaks)continue;for(const k of w.streaks){if(k.pts.length<2)continue;const dry=clamp(k.age/40,0,1);
    c.strokeStyle=`rgba(${Math.round(lerp(125,62,dry))},${Math.round(lerp(10,8,dry))},${Math.round(lerp(18,12,dry))},.88)`;
    c.lineWidth=k.wid*0.85;c.beginPath();c.moveTo(k.pts[0][0],k.pts[0][1]);for(let i=1;i<k.pts.length;i++)c.lineTo(k.pts[i][0],k.pts[i][1]);c.stroke();
    const tp=k.pts[k.pts.length-1];if(k.on||k.drip){c.fillStyle=c.strokeStyle;ell(c,tp[0],tp[1],k.wid*0.75,k.wid*0.9);c.fill();}}}
  for(const w of seg.wounds){
    if(w.type!=='hole'&&w.type!=='cut'&&w.type!=='stump')continue;
    if(w.ooze){c.fillStyle='#5a0a10';ell(c,w.w,w.s,0.42,0.34,0);c.fill();continue;}
    const su=w.sut||0,healed=su>=1;
    if(isBite(w)){c.globalCompositeOperation='destination-out';woundPath(c,w,0.15);c.fill();c.globalCompositeOperation='source-over';continue;}
    if(w.graft){drawGraft(c,w);continue;}
    c.fillStyle=healed?'rgba(120,40,45,.55)':(w.type==='stump'?'#5a0b10':'#3f070b');woundPath(c,w,healed?-(w.type==='cut'?0.9:w.r*0.55):(w.type==='stump'?0.5:w.dig?0.35:0.65));c.fill();
    if(MILD){}else if(!healed&&(w.type==='hole'&&!w.dig||w.type==='cut')&&su<0.5){woundLayers(c,w,seg);}
    else if(!healed){c.fillStyle=w.type==='stump'?'#8c2028':'#7a1a20';woundPath(c,w,w.dig?0.15:0.3);c.fill();}
    if(!healed){
      c.globalCompositeOperation='destination-out';woundPath(c,w,-su*(w.type==='cut'?1.3:w.r*0.98));c.fill();c.globalCompositeOperation='source-over';
      if((w.exit||w.dig)&&su<0.3){c.strokeStyle=w.dig?'rgba(235,165,155,.55)':'rgba(225,200,150,.55)';c.lineWidth=w.dig?0.3:0.18;woundPath(c,w,w.dig?0.12:0.05);c.stroke();}
      if(w.laser&&su<1){c.strokeStyle='rgba(25,12,8,.85)';c.lineWidth=0.35;woundPath(c,w,0.25);c.stroke();c.strokeStyle='rgba(255,140,60,.35)';c.lineWidth=0.12;woundPath(c,w,0.05);c.stroke();}
      if(w.type!=='stump'&&!w.pack&&!MILD)woundDetail(c,w,seg,su);
      if(w.lac&&su<1&&!MILD)lacDetail(c,w);
      if(w.pack)drawGauze(c,w);}
    if(su>0)stitchSide(c,w);
  }
  for(const w of seg.wounds){
    if(!w.band||w.wrapped)continue;const cc=woundCenter(w);const sz=w.type==='cut'?Math.max(2.6,(w.len||2)*0.6):Math.max(2.6,w.r*2.8);
    c.save();c.translate(cc.w,cc.s);c.rotate(w.rot*0.2);c.fillStyle='#efece4';c.fillRect(-sz/2,-sz*0.4,sz,sz*0.8);
    c.strokeStyle='rgba(0,0,0,.08)';c.lineWidth=0.12;for(let x=-sz/2+0.4;x<sz/2;x+=0.5){c.beginPath();c.moveTo(x,-sz*0.4);c.lineTo(x,sz*0.4);c.stroke();}
    const soak=clamp(w.age/20,0.2,0.6);c.fillStyle=`rgba(150,20,25,${soak})`;ell(c,0,0,sz*0.22,sz*0.17);c.fill();
    c.fillStyle='rgba(205,195,170,.9)';c.fillRect(-sz/2-0.4,-sz*0.15,0.6,sz*0.3);c.fillRect(sz/2-0.2,-sz*0.15,0.6,sz*0.3);c.restore();
  }
  if(seg.wraps&&seg.wraps.length&&anyWear())drawWrapsSide(c,seg,ra,rb,true);
  if(anyWear())clothSide(c,seg,ra,rb);
  for(const w of bl){c.lineJoin='round';c.strokeStyle='#5a0d13';c.lineWidth=1.1;woundPath(c,w,-0.2*w.r);c.stroke();c.strokeStyle='rgba(185,60,68,.75)';c.lineWidth=0.3;woundPath(c,w,-0.2*w.r+0.45);c.stroke();
    c.strokeStyle='rgba(120,15,22,.9)';c.lineWidth=0.25;const n=w.jag?w.jag.length:10;for(let i=0;i<n;i++){const a=i/n*6.283+w.rot,r0=w.r*0.8*(w.jag?w.jag[i]:1);c.beginPath();c.moveTo(w.w+Math.cos(a)*r0,w.s+Math.sin(a)*r0);c.lineTo(w.w+Math.cos(a+0.12)*(r0+0.7),w.s+Math.sin(a+0.12)*(r0+0.7));c.stroke();}}
  c.restore();
  if(anyWear()){clothBulk(c,seg,ra,rb);steelSide(c,seg,ra,rb);}
  if(seg.tq!=null){c.fillStyle='#2b2f36';c.fillRect(-r-0.5,seg.tq-1,2*r+1,2);c.fillStyle='#d9a441';c.fillRect(-0.6,seg.tq-1.4,1.2,2.8);c.fillStyle='#1a1d22';c.fillRect(-r-0.5,seg.tq-1,2*r+1,0.35);}
  c.restore();
  for(const w of bl)if(w.pack){c.save();segPath(c,seg,ra,rb);c.clip();drawGauze(c,w,0.2);c.restore();}
  if(seg.wraps&&seg.wraps.length)drawWrapsSide(c,seg,ra,rb,false);
  if(seg.wounds.some(w=>w.type==='stump')){setLocal(c,seg);drawStumpEnds(c,seg);}
}
function clothSpan(it,seg,r){const R_=wearRange(it,seg);if(!R_)return null;const off=seg.off||0;const s0=Math.max(-r-1,R_[0]-off),s1=Math.min(seg.len+r+1,R_[1]-off);return s1>s0?[s0,s1]:null;}
function helmetClip(c){c.beginPath();c.rect(-20,-20,40,20.8);c.rect(-20,0.8,16.5,4.4);c.clip();}
function underSide(c,seg,ra,rb,r,s0,s1){
  // the redesign's boxer briefs (side): each part draws its own piece through its rest frame, like the skin
  if(!FEMALE&&(seg.kind==='abd'||seg.kind==='thigh')&&SKINBMP.shortsS&&seg.rest){const b=SKINBMP.shortsS,q=seg.rest;let ux=q.bx-q.ax,uy=q.by-q.ay;const L=Math.hypot(ux,uy)||1;ux/=L;uy/=L;const nx=uy,ny=-ux,sc=seg.len/L;
    c.save();capPath(c,seg.len,ra+0.35,rb+0.35);c.clip();
    // each piece stops at the hip so the belly's piece doesn't show the leg of the shorts where the thigh used to be
    c.beginPath();if(seg.kind==='abd')c.rect(-50,-50,100,seg.len+58);else c.rect(-50,-2,100,seg.len+52);c.clip();c.transform(nx,ux*sc,ny,uy*sc,-(nx*q.ax+ny*q.ay),-(ux*q.ax+uy*q.ay)*sc);c.drawImage(b.cv,b.x0,b.y0,b.w,b.h);c.restore();return;}
  const col=FEMALE?'#2c3442':'#3a4148',trim=FEMALE?'#59657a':'#1d2226';const R2=r+3;
  const shade=()=>{const g=c.createLinearGradient(-r+3,0,r-3,0);g.addColorStop(0,'rgba(0,0,0,.32)');g.addColorStop(0.35,'rgba(0,0,0,0)');g.addColorStop(0.7,'rgba(255,255,255,.06)');g.addColorStop(1,'rgba(0,0,0,.22)');return g;};
  if(seg.kind==='chest'){
    c.fillStyle=col;c.beginPath();c.moveTo(ra-2.6,16.8);c.lineTo(ra-2.6,10.8);c.quadraticCurveTo(ra-0.6,7.6,R2,8.4);c.lineTo(R2,16.8);c.closePath();c.fill();
    c.fillRect(-R2,15.5,2*R2,2);c.fillStyle='rgba(0,0,0,.12)';c.beginPath();c.moveTo(ra-2.6,16.8);c.lineTo(ra-2.6,10.8);c.quadraticCurveTo(ra-0.6,7.6,R2,8.4);c.lineTo(R2,10);c.quadraticCurveTo(ra,9.6,ra-1.6,12);c.lineTo(ra-1.6,16.8);c.closePath();c.fill();
    c.strokeStyle=trim;c.lineWidth=0.75;c.lineCap='round';c.beginPath();c.moveTo(ra-2.2,10.6);c.quadraticCurveTo(ra-2.8,4,ra-4.6,-3);c.moveTo(-ra+1.6,15.6);c.quadraticCurveTo(-ra+2.6,6,-ra+4.2,-3);c.stroke();
    c.strokeStyle='rgba(0,0,0,.28)';c.lineWidth=0.25;c.beginPath();c.moveTo(ra-2.6,10.8);c.quadraticCurveTo(ra-0.6,7.6,R2,8.4);c.stroke();c.fillStyle='rgba(0,0,0,.22)';c.fillRect(-R2,17.3,2*R2,0.3);return;}
  c.fillStyle=col;
  if(seg.kind==='thigh'){const fr=FEMALE?1.4:s1-1,bk=FEMALE?s1+0.6:s1;c.beginPath();c.moveTo(-R2,s0);c.lineTo(R2,s0);c.lineTo(R2,fr);c.lineTo(-R2,bk);c.closePath();c.fill();
    c.fillStyle=shade();c.fill();c.strokeStyle=trim;c.lineWidth=0.45;c.beginPath();c.moveTo(R2,fr);c.lineTo(-R2,bk);c.stroke();return;}
  c.fillRect(-R2,s0,2*R2,s1-s0);c.fillStyle=shade();c.fillRect(-R2,s0,2*R2,s1-s0);
  c.fillStyle=trim;c.fillRect(-R2,s0,2*R2,FEMALE?0.7:1.3);
  if(!FEMALE){c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=0.2;c.beginPath();c.moveTo(seg.ra-0.6,s0+3);c.quadraticCurveTo(seg.ra+0.3,s0+6,seg.ra-0.4,s1);c.stroke();}}
function clothSide(c,seg,ra,rb){
  const r=Math.max(ra,rb)+3,L=seg.len;
  for(const it of WORDER){
    if(!WEAR[it].on)continue;const sp=clothSpan(it,seg,r);if(!sp)continue;const [s0,s1]=sp;
    if(it==='under'){underSide(c,seg,ra,rb,r,s0,s1);continue;}
    c.fillStyle=WEARDEF[it].col;c.fillRect(-r,s0,2*r,s1-s0);
    const g=c.createLinearGradient(-r+3,0,r-3,0);g.addColorStop(0,'rgba(0,0,0,.38)');g.addColorStop(0.35,'rgba(0,0,0,0)');g.addColorStop(0.7,'rgba(255,255,255,.07)');g.addColorStop(1,'rgba(0,0,0,.25)');c.fillStyle=g;c.fillRect(-r,s0,2*r,s1-s0);
    c.fillStyle='rgba(0,0,0,.3)';if(s1<L+r)c.fillRect(-r,s1-0.55,2*r,0.55);if(s0>-r)c.fillRect(-r,s0,2*r,0.45);
    if(it==='jeans'){c.strokeStyle='rgba(214,160,80,.55)';c.lineWidth=0.18;c.setLineDash([0.5,0.4]);c.beginPath();c.moveTo(-0.6,s0);c.lineTo(-0.6,s1);c.stroke();c.setLineDash([]);
      c.strokeStyle='rgba(255,255,255,.06)';c.lineWidth=0.5;for(let s=s0+2;s<s1;s+=4.5){c.beginPath();c.moveTo(-r,s);c.lineTo(r,s+1.2);c.stroke();}
      if(seg.kind==='abd'){c.fillStyle='#1d1a17';c.fillRect(-r,s0,2*r,1.5);c.fillStyle='#b9a26a';c.fillRect(seg.ra-2.4,s0+0.2,1.3,1.1);}}
    else if(it==='shirt'){c.strokeStyle='rgba(0,0,0,.12)';c.lineWidth=0.3;for(let s=s0+3;s<s1-1;s+=6){c.beginPath();c.moveTo(-r,s);c.quadraticCurveTo(0,s+1.5,r,s);c.stroke();}}
    else if(it==='boots'){c.fillStyle='#1b1410';if(seg.kind==='foot'){c.fillRect(-r,-r,1.6,L+2*r);}c.strokeStyle='rgba(220,200,170,.35)';c.lineWidth=0.2;if(seg.kind==='shin')for(let s=s0+1.5;s<s1-0.5;s+=1.6){c.beginPath();c.moveTo(seg.rb-0.2,s);c.lineTo(seg.rb-1.6,s+0.8);c.stroke();}}
    else if(it==='vest'){c.fillStyle='rgba(255,255,255,.05)';c.fillRect(-r,s0+2,2*r,1.2);c.fillStyle='#16191c';c.fillRect(-2.2,s0,1.8,s1-s0);c.fillStyle='rgba(255,255,255,.08)';c.fillRect(-2.2,s0,0.3,s1-s0);}
    else if(it==='plate'){const fr=seg.ra;c.fillStyle='rgba(255,255,255,.07)';c.fillRect(fr-2.6,s0+0.5,2.6+3,s1-s0-1);c.fillRect(-fr-3,s0+0.5,2.6+3,s1-s0-1);
      c.fillStyle='rgba(0,0,0,.35)';for(let s=s0+2;s<s1-1;s+=2.4){c.fillRect(fr-2.4,s,4,0.45);c.fillRect(-fr-1.6,s,4,0.45);}
      c.fillStyle='#3a3f2a';c.fillRect(-3,s0,2.6,s1-s0);}
  }
  if(seg.kind==='head'&&WEAR.helmet.on){c.save();helmetClip(c);c.fillStyle=WEARDEF.helmet.col;c.fillRect(-20,-20,40,26);const g=c.createRadialGradient(1,-7,1,0,-3,12);g.addColorStop(0,'rgba(255,255,255,.12)');g.addColorStop(1,'rgba(0,0,0,.3)');c.fillStyle=g;c.fillRect(-20,-20,40,26);c.restore();}
  // fabric damage and soaked blood
  for(const w of seg.wounds){
    if(w.type==='stump'||w.type==='bruise')continue;const cc=woundCenter(w);
    let cov=false;for(const it of WORDER)if(covers(it,seg,cc.s,cc.w)){cov=true;break;}if(!cov&&covers('helmet',seg,cc.s,cc.w))cov=true;if(!cov)continue;
    if(w.type==='burn'){c.fillStyle='rgba(20,12,8,.75)';ell(c,w.w,w.s,w.r*0.7,w.r*0.7);c.fill();continue;}
    if(!(w.sut>=1)&&!w.band&&w.bleed>0){const sr=Math.min(7,(w.type==='cut'?(w.len||2)*0.4:w.r)+0.8+Math.sqrt(w.age)*0.9*Math.min(1.5,w.bleed+0.3));c.fillStyle='rgba(60,4,10,.55)';ell(c,cc.w,cc.s+sr*0.25,sr*0.85,sr*1.1);c.fill();}
    c.fillStyle='#120708';if(w.type==='cut'){c.strokeStyle='#120708';c.lineWidth=0.7;c.beginPath();c.moveTo(w.w,w.s);c.lineTo(w.w2,w.s2);c.stroke();}else if(!isBite(w)){ell(c,w.w,w.s,w.r*0.8+0.2,w.r*0.8+0.2);c.fill();}
  }
  if(seg.amarks)for(const m of seg.amarks){if(!covers(m.it,seg,m.s,m.w))continue;
    if(m.cut){c.strokeStyle='rgba(200,200,190,.6)';c.lineWidth=0.3;c.beginPath();c.moveTo(m.w-1.2,m.s-0.6);c.lineTo(m.w+1.2,m.s+0.6);c.stroke();continue;}
    c.fillStyle=m.it==='plate'?'rgba(205,200,180,.55)':'rgba(140,140,130,.5)';ell(c,m.w,m.s,1.1,1.1);c.fill();c.fillStyle=m.pen?'#120708':'#8a8a80';ell(c,m.w,m.s,0.45,0.45);c.fill();}
}
function clothBulk(c,seg,ra,rb){
  const r=Math.max(ra,rb)+3,L=seg.len;
  if(seg.kind==='head'){if(!WEAR.helmet.on)return;c.save();helmetClip(c);c.save();c.translate(-0.2,1);c.scale(1.12,1.1);c.translate(0,-1);headPath(c);c.restore();headPath(c);c.fillStyle=WEARDEF.helmet.col;c.fill('evenodd');c.save();c.translate(-0.2,1);c.scale(1.12,1.1);c.translate(0,-1);headPath(c);c.restore();c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=0.3;c.stroke();c.restore();return;}
  if(seg.kind==='hand')return;
  for(const it of WORDER){
    if(!WEAR[it].on||it==='under')continue;const sp=clothSpan(it,seg,r);if(!sp)continue;const t=WTHK[it];
    c.save();c.beginPath();c.rect(-r-t,sp[0],2*(r+t),sp[1]-sp[0]);c.clip();
    c.fillStyle=WEARDEF[it].col;
    c.save();c.beginPath();segPath(c,seg,ra,rb);c.rect(-r-t-2,-r-t-2,2*(r+t+2),L+2*(r+t+2));c.clip('evenodd');capPath(c,L,ra+t,rb+t);c.fill();c.strokeStyle='rgba(0,0,0,.28)';c.lineWidth=0.22;c.stroke();c.restore();
    c.restore();
  }
}
// rot: green-brown blotches, black marbled veins and open sores, fixed per body part
function rotDetail(c,seg,ra,rb){const f=Math.min(1,V.rot),L=seg.len,r=Math.max(ra,rb);let h_=seg.idx*7717+31;const rr=()=>{h_=(h_*16807)%2147483647;return h_/2147483647;};
  const n=Math.max(2,Math.ceil(L/5));
  for(let i=0;i<n;i++){const s=rr()*L,w=(rr()*2-1)*r*0.8,rad=1.4+rr()*3,pu=rr()<0.4;c.fillStyle=pu?`rgba(80,40,70,${(0.32*f).toFixed(3)})`:`rgba(60,72,32,${(0.38*f).toFixed(3)})`;ell(c,w,s,rad,rad*0.75,rr()*3);c.fill();}
  c.strokeStyle=`rgba(30,38,48,${(0.55*f).toFixed(3)})`;c.lineWidth=0.16;c.lineCap='round';
  for(let i=0;i<Math.ceil(n*0.8);i++){let x=(rr()*2-1)*r*0.7,y=rr()*L;c.beginPath();c.moveTo(x,y);for(let k=0;k<4;k++){x+=(rr()*2-1)*1.4;y+=(rr()*2-1)*1.8;c.lineTo(x,y);}c.stroke();}
  if(f>0.6){const m=1+Math.floor(rr()*2.2);for(let i=0;i<m;i++){const s=rr()*L,w=(rr()*2-1)*r*0.6,rad=0.6+rr()*0.9;c.fillStyle='rgba(185,165,80,.6)';ell(c,w,s,rad+0.35,rad*0.8+0.3,0);c.fill();c.fillStyle='#4a1a12';ell(c,w,s,rad,rad*0.75,0);c.fill();c.fillStyle='rgba(20,8,6,.8)';ell(c,w,s,rad*0.45,rad*0.35,0);c.fill();}}
}
// The redesign's drawn skin on one body part (side view). Each part takes its piece of the drawing through the frame
// the part had in the drawing: trunk, legs and head were drawn on the game's own standing pose, so their rest pose
// is used; the arm was drawn a little more forward, so its joints are read off the drawing (px → cm: 2.43 px/cm,
// x 195 = centre line, y 483 = floor). Returns false when there is no drawing (still loading, or the female body)
const SKINARMJ={UpperArm:[195.5,143,199,221],Forearm:[199,221,206.8,279],Hand:[206.8,279,211,312]};
function skinArtSide(c,seg){if(FEMALE||seg.part)return false;const k=seg.kind,arm=k==='uarm'||k==='farm'||k==='hand',b=SKINBMP[arm?'arm':'side'];if(!b)return false;
  let ax,ay,bx,by;if(arm){const j=SKINARMJ[seg.id.replace(/^(near|far)/,'')];if(!j)return false;ax=(j[0]-195)/SKINPX;ay=(j[1]-483)/SKINPX;bx=(j[2]-195)/SKINPX;by=(j[3]-483)/SKINPX;}
  else{const r=seg.rest;if(!r)return false;ax=r.ax;ay=r.ay;bx=r.bx;by=r.by;}
  let ux=bx-ax,uy=by-ay;const L=Math.hypot(ux,uy)||1;ux/=L;uy/=L;const nx=uy,ny=-ux,sc=seg.len/L;
  // local (across, along) = (n·(p−A), u·(p−A)·len/L)
  c.save();c.transform(nx,ux*sc,ny,uy*sc,-(nx*ax+ny*ay),-(ux*ax+uy*ay)*sc);c.drawImage(b.cv,b.x0,b.y0,b.w,b.h);
  // the scene's own light, baked into this part's cached skin (the lab's is already in the drawing): warm or cool key on
  // top, shade toward the feet, overall darkness; it turns with the part, which is cheap and reads fine
  const SL=typeof sceneL==='function'&&OPT.scene&&OPT.scene!=='lab'?sceneL():null;
  if(SL){const g=c.createLinearGradient(0,-176,0,0);g.addColorStop(0,`rgba(${SL.k},${SL.ka*1.5})`);g.addColorStop(0.4,`rgba(${SL.k},0)`);g.addColorStop(1,`rgba(20,10,8,${SL.sa})`);c.fillStyle=g;c.fillRect(-60,-180,120,184);if(SL.d>0){c.fillStyle=`rgba(5,6,10,${SL.d})`;c.fillRect(-60,-180,120,184);}}
  c.restore();return true;}
function skinArtReady(){if(typeof segs!=='undefined')for(const g of segs)g.scache=null;}
function skinDetail(c,seg,tone,ra,rb){
  const L=seg.len,ln='rgba(90,45,35,.2)';c.lineCap='round';c.strokeStyle=ln;c.lineWidth=0.3;
  const curve=(pts)=>{c.beginPath();c.moveTo(pts[0],pts[1]);c.quadraticCurveTo(pts[2],pts[3],pts[4],pts[5]);c.stroke();};
  const hl=(w,s,rw,rs,a)=>{c.fillStyle=`rgba(255,240,225,${a})`;ell(c,w,s,rw,rs);c.fill();};
  switch(seg.kind){
    case 'uarm':curve([ra-0.4,1,ra+0.3,5,ra-1.2,8]);curve([-ra+0.5,3,-ra-0.2,12,-rb+0.4,20]);hl(1,10,1.2,6,0.08);break;
    case 'farm':curve([rb-0.3,L-1.2,0,L-0.6,-rb+0.3,L-1.2]);curve([ra-0.3,1,ra+0.2,8,rb-0.2,16]);break;
    case 'hand':if(seg.part||L<14)break;{const k=L/15;
      // finger gaps from the knuckles to between the tips (little/ring, ring/middle, middle/index)
      c.strokeStyle='rgba(90,45,35,.26)';c.lineWidth=0.14;for(const [x,e] of [[-1.05,14.5],[-0.05,16.0],[0.95,15.8]]){c.beginPath();c.moveTo(x,10.2*k);c.quadraticCurveTo(x+0.08,13*k,x,e*k);c.stroke();}
      // knuckles (MCP heads) as soft highlights, finger joint wrinkles at PIP and DIP
      for(const [x,i] of [[-1.55,0],[-0.55,1],[0.45,2],[1.45,3]]){const kx=c.createRadialGradient(x,8.9*k,0,x,8.9*k,0.7);kx.addColorStop(0,'rgba(255,240,228,.13)');kx.addColorStop(1,'rgba(255,240,228,0)');c.fillStyle=kx;ell(c,x,8.9*k,0.7,0.6);c.fill();
        const pip=[12.0,12.6,12.5,11.9][i]*k,dip=[13.8,14.9,14.7,13.9][i]*k;c.strokeStyle='rgba(90,45,35,.17)';c.lineWidth=0.09;for(const y of [pip-0.12,pip+0.1,dip]){c.beginPath();c.moveTo(x-0.32,y);c.quadraticCurveTo(x,y+0.12,x+0.32,y);c.stroke();}}
      // nails: pale, slightly glossy, set back from each fingertip
      for(const [x,t] of [[-1.45,14.3],[-0.4,15.6],[0.45,16.3],[1.35,15.4]]){c.fillStyle='rgba(248,214,206,.75)';ell(c,x,(t-0.75)*k,0.34,0.62);c.fill();c.strokeStyle='rgba(150,95,85,.3)';c.lineWidth=0.06;c.stroke();c.fillStyle='rgba(255,255,255,.35)';ell(c,x+0.1,(t-1.0)*k,0.1,0.2);c.fill();}
      // extensor tendons fanning from the wrist to the knuckles, a faint dorsal vein
      c.strokeStyle='rgba(255,236,222,.13)';c.lineWidth=0.22;for(const x of [-1.5,-0.5,0.45,1.4]){c.beginPath();c.moveTo(x*0.45,0.6);c.quadraticCurveTo(x*0.8,4.5*k,x,8.4*k);c.stroke();}
      c.strokeStyle='rgba(90,110,150,.12)';c.lineWidth=0.25;c.beginPath();c.moveTo(-0.9,0.4);c.quadraticCurveTo(0.3,3.5*k,-0.2,6.6*k);c.stroke();
      c.strokeStyle='rgba(90,45,35,.2)';c.lineWidth=0.12;curve([-2.1,0.5,0,0.05,2.1,0.4]);}break;
    case 'thigh':curve([ra-0.6,4,ra+0.4,18,rb-0.3,36]);curve([-ra+0.6,2,-ra-0.5,9,-ra+0.5,14]);hl(2,18,2,12,0.06);break;
    case 'shin':{const kg=c.createRadialGradient(ra-1.1,0.6,0.2,ra-1.1,0.6,2.6);kg.addColorStop(0,'rgba(255,240,228,.16)');kg.addColorStop(1,'rgba(255,240,228,0)');c.fillStyle=kg;ell(c,ra-1.1,0.6,2.2,2.8);c.fill();c.strokeStyle='rgba(90,45,35,.16)';c.beginPath();c.arc(ra-1.1,0.8,2,0.5,2.4);c.stroke();}c.strokeStyle=ln;curve([-ra+0.3,4,-ra-1,13,-rb+0.2,27]);hl(-2,12,1.5,7,0.07);hl(ra-1.3,1,1,1.6,0.12);break;
    case 'foot':c.strokeStyle='rgba(90,45,35,.28)';ell(c,0.4,0.6,1.1,1.1);c.stroke();for(let i=0;i<3;i++){c.beginPath();c.moveTo(1.6-i*0.9,L-1.6);c.lineTo(1.4-i*0.9,L+0.9);c.stroke();}c.fillStyle='rgba(255,235,225,.3)';ell(c,1.2,L+0.6,0.6,0.4);c.fill();break;
    case 'neck':c.fillStyle=rgb(tone,1.05);ell(c,ra-0.3,13.5,0.9,1.3);c.fill();curve([-1,4,1.5,13,ra-0.8,20]);curve([ra-0.6,12,ra+0.5,14.5,ra-0.4,17]);break;
    case 'chest':{const [r1]=[ra];if(FEMALE){c.strokeStyle='rgba(90,45,35,.2)';curve([ra+2.7,13,ra+0.7,15.6,ra-1.6,14.2]);hl(ra+1.8,8.4,1.5,2.4,0.1);c.fillStyle='rgba(70,35,30,.07)';ell(c,ra+1.3,12.8,2.2,1.5);c.fill();c.strokeStyle='rgba(90,45,35,.25)';curve([r1-0.5,-4.6,4,-6,-1,-5]);curve([-r1+1,0,-r1+2.6,6,-r1+1.2,12]);break;}c.strokeStyle='rgba(90,45,35,.25)';curve([r1-0.5,-4.6,4,-6,-1,-5]);curve([r1-1,0,r1+0.6,5,r1-1.4,8.5]);curve([-r1+1,0,-r1+2.6,6,-r1+1.2,12]);hl(r1-3,3,2.5,4,0.08);
      c.strokeStyle='rgba(90,45,35,.12)';for(let k=0;k<3;k++)curve([r1-1.5,12+k*3,r1-0.8,13.5+k*3,r1-2.5,15+k*3]);break;}
    case 'abd':c.fillStyle='rgba(90,45,35,.45)';ell(c,seg.ra-0.5,8.5,0.4,0.65);c.fill();c.strokeStyle='rgba(90,45,35,.16)';for(let i=0;i<3;i++){c.beginPath();c.moveTo(seg.ra-1.8,3+i*4.6);c.lineTo(seg.ra-0.3,3.2+i*4.6);c.stroke();}
      c.strokeStyle='rgba(90,45,35,.28)';curve([-12,19,-11,26,-6,30.5]);curve([5,24,9,21,11.5,15]);hl(-8,24,3.5,5,0.07);break;
  }
}
const HEADP=[[-8.8,1],[-8.7,-3.5],[-7,-7.4],[-3.6,-9.3],[0.8,-9.6],[4.6,-8.5],[6.9,-6],[7.7,-3],[7.9,0.2],[7.5,1.7],[7.1,2.6],[7.4,3.7],[8.3,5.2],[9.4,6.7],[9.3,7.3],[8.3,7.6],[7.7,7.8],[8,8.5],[7.8,9.3],[7.95,10],[7.4,10.8],[7.6,12.1],[7.1,13.1],[5.8,13.7],[3.8,13.5],[1.8,12.6],[-0.2,11.1],[-2.6,10.2],[-5.4,8.8],[-7.7,5.6]];
function headPts(seg){if(!seg||(!seg.dents||!seg.dents.length)&&!seg.jawDrop)return HEADP;const jd=seg.jawDrop||0,cj=Math.cos(jd),sj=Math.sin(jd);return HEADP.map(p=>{let x=p[0],y=p[1];if(jd&&y>6.2&&x>-2){const dx=x-0.8,dy=y-5.2;const k=clamp((y-6.2)/1.5,0,1);const rx=0.8+dx*cj-dy*sj,ry=5.2+dx*sj+dy*cj;x=lerp(x,rx,k);y=lerp(y,ry,k);}if(seg.dents&&seg.dents.length)[x,y]=dentPt(seg,x,y);return[x,y];});}
function headPath(c,seg){const HP=headPts(seg||SEG.head);c.beginPath();const n=HP.length;for(let i=0;i<n;i++){const p=HP[i],q=HP[(i+1)%n];const mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2;if(i===0)c.moveTo(mx,my);else c.quadraticCurveTo(p[0],p[1],mx,my);}const p=HP[0],q=HP[1];c.quadraticCurveTo(p[0],p[1],(p[0]+q[0])/2,(p[1]+q[1])/2);c.closePath();}
// side view: the back of a relaxed hanging hand (thumb forward). Width ≈ 5 cm across the knuckles as drawn here, fingertips
// staggered like a real hand (middle longest, little finger ends at the ring finger's last joint)
const HANDP=[[-2.0,-1.2],[-2.25,1],[-2.45,4],[-2.55,6.8],[-2.35,9],[-2.15,11.2],[-2.0,13.2],[-1.85,14.4],[-1.45,14.85],[-1.05,14.4],[-1.0,15.6],[-0.6,16.2],[-0.15,16.0],[0.05,16.6],[0.45,16.9],[0.85,16.5],[0.95,15.8],[1.35,15.95],[1.75,15.3],[1.95,13.6],[2.2,11.5],[2.45,9.2],[2.55,7],[2.4,4.6],[2.2,1.8],[1.9,-1],[0,-1.7]];
// a closed hand (holding a grip): the back of the hand to the knuckles ≈10 cm, the fingers folded back into the palm make a
// block ≈6 cm deep; the thumb lies across the folded fingers
const FISTP=[[-2.0,-1.2],[-2.25,1],[-2.45,4],[-2.55,6.8],[-2.35,9],[-1.7,10.3],[-0.4,11.0],[1.0,11.0],[2.3,10.4],[3.2,9.2],[3.6,7.6],[3.6,5.8],[3.2,4.4],[2.4,3.4],[2.2,1.8],[1.9,-1],[0,-1.7]];
// knuckle creases of the folded fingers, and the thumb across them (its nail toward the front)
function fistDetail(c,tone){c.strokeStyle='rgba(90,45,35,.22)';c.lineWidth=0.12;c.beginPath();for(const y of [5.2,7.0,8.8]){c.moveTo(1.4,y);c.quadraticCurveTo(2.6,y+0.15,3.5,y-0.1);}c.stroke();
  c.beginPath();c.moveTo(-1.5,10.2);c.quadraticCurveTo(0.6,11.2,2.6,10.1);c.stroke();
  c.beginPath();c.moveTo(0.4,2.4);c.quadraticCurveTo(2.9,4.2,3.0,8.6);c.quadraticCurveTo(2.2,9.6,1.5,8.4);c.quadraticCurveTo(1.2,5,0.0,3.2);c.closePath();c.fillStyle=rgb(tone,1.02);c.fill();c.strokeStyle='rgba(70,35,25,.26)';c.lineWidth=0.13;c.stroke();
  c.fillStyle='rgba(248,214,206,.8)';ell(c,2.3,8.2,0.33,0.55,-0.1);c.fill();}
function handFist(seg){return seg.kind==='hand'&&!seg.part&&ACT.on&&!!ACT.fist&&!!ACT.fist[seg.side];}
const THUMBP=[[1.9,1.6],[2.9,3.4],[3.6,5.6],[3.75,7.6],[3.55,9.4],[3.05,10.15],[2.55,9.7],[2.35,8.0],[2.1,6.0],[1.85,4.0]];
function smoothPath(c,PTS,sc){c.beginPath();const n=PTS.length;for(let i=0;i<n;i++){const p=PTS[i],q=PTS[(i+1)%n];const mx=(p[0]+q[0])/2*sc[0],my=(p[1]+q[1])/2*sc[1];if(i===0)c.moveTo(mx,my);else c.quadraticCurveTo(p[0]*sc[0],p[1]*sc[1],mx,my);}const p=PTS[0],q=PTS[1];c.quadraticCurveTo(p[0]*sc[0],p[1]*sc[1],(p[0]+q[0])/2*sc[0],(p[1]+q[1])/2*sc[1]);c.closePath();}
function dentPt(seg,w,s){let x=w,y=s;for(const d of (seg.dents||[])){const q=Math.hypot(w-d.w,s-d.s);if(q>=d.r)continue;const f=Math.pow(1-q/d.r,2)*d.d;
    if(seg.kind==='head'){const cx=0,cy=0.6,l=Math.hypot(x-cx,y-cy)||1;x-=(x-cx)/l*f;y-=(y-cy)/l*f;}else{x-=Math.sign(w||1)*f;}}return[x,y];}
function bustW(seg,s){if(!FEMALE||seg.kind!=='chest'||seg.part)return 0;const d=s-9.8,R=5.2;const cap=Math.max(0,Math.sqrt(Math.max(0,R*R-d*d))-(R-3.7));const top=d<0?1.4*Math.exp(-(d*d)/30):0;return Math.max(cap,top);}
function capPathDent(c,seg,ra,rb){const L=seg.len,pts=[];const N=seg.kind==='chest'&&FEMALE?50:18;
  for(let i=0;i<=N;i++){const sv=L*i/N;pts.push([lerp(ra,rb,i/N)+bustW(seg,sv),sv]);}
  for(let i=1;i<10;i++){const a=i/10*Math.PI;pts.push([Math.cos(a)*rb,L+Math.sin(a)*rb]);}
  for(let i=N;i>=0;i--){const sv=L*i/N;pts.push([-lerp(ra,rb,i/N),sv]);}
  for(let i=1;i<10;i++){const a=Math.PI+i/10*Math.PI;pts.push([Math.cos(a)*ra,Math.sin(a)*ra]);}
  c.beginPath();pts.forEach((p,i)=>{const q=dentPt(seg,p[0],p[1]);i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]);});c.closePath();}
function segPath(c,seg,ra,rb){if(seg.kind==='head')headPath(c,seg);else if(seg.kind==='chest'&&FEMALE&&!seg.part){capPathDent(c,seg,ra,rb);return;}else if(seg.dents&&seg.dents.length&&!(seg.kind==='hand'&&!seg.part&&seg.len>14)){capPathDent(c,seg,ra,rb);return;}else if(seg.kind==='hand'&&!seg.part&&seg.len>14)smoothPath(c,handFist(seg)?FISTP:HANDP,[1,seg.len/15]);else capPath(c,seg.len,ra,rb);}
const HAIRC='#3e2a1d';
const HAIRSP=[[3.5,-10.4],[-3,-11],[-9.7,-7.6],[-10.6,0],[-10.4,8],[-10.8,15],[-9.9,21.5],[-7,23.8],[-4.4,22.4],[-3.8,16.5],[-2.6,10.5],[-0.2,6.8],[0.9,2.4],[1.8,-2.8],[4.6,-6.2],[7.4,-6.8],[7.6,-9.2]];
function hairSide(c){c.fillStyle=HAIRC;smoothPath(c,HAIRSP,[1,1]);c.fill();
  c.strokeStyle='rgba(120,88,62,.45)';c.lineWidth=0.2;for(let i=0;i<6;i++){const x=-9.4+i*1.25;c.beginPath();c.moveTo(x+2.2,-8.6+i*0.2);c.quadraticCurveTo(x-0.9,6,x+0.4,20-i*0.8);c.stroke();}
  c.strokeStyle='rgba(20,12,8,.35)';c.lineWidth=0.25;c.beginPath();c.moveTo(1.2,-1);c.quadraticCurveTo(-1.6,8,-4,21.5);c.stroke();}
function drawFaceSide(c,seg,tone){
  const F=face();
  c.save();headPath(c);c.clip();
  c.fillStyle='rgba(255,235,220,.10)';ell(c,5.5,4.5,2.2,1.4,0.3);c.fill();
  c.fillStyle='rgba(60,30,25,.10)';ell(c,3.5,11.5,4,1.8,0.35);c.fill();
  if(FEMALE){c.fillStyle=HAIRC;c.beginPath();c.moveTo(-11,-12);c.lineTo(7.8,-12);c.lineTo(7.2,-6.4);c.quadraticCurveTo(4,-6.6,1.6,-4.6);c.quadraticCurveTo(0.6,-1,0.9,3);c.lineTo(-11,9);c.closePath();c.fill();}
  else if(!(SKINBMP.side&&!seg.part)){c.fillStyle='#2b211c';c.beginPath();c.moveTo(-11,-12);c.lineTo(7.5,-12);c.lineTo(6.6,-6.2);c.quadraticCurveTo(3.5,-5.4,1.2,-4);c.quadraticCurveTo(-0.6,-1,-1.2,2.6);c.lineTo(-3.4,3);c.lineTo(-5.6,8.4);c.lineTo(-11,9);c.closePath();c.fill();
  c.strokeStyle='rgba(95,76,62,.45)';c.lineWidth=0.18;for(let i=0;i<16;i++){const a=-2.75+i*0.16;c.beginPath();c.moveTo(Math.cos(a)*9-0.5,Math.sin(a)*9+0.3);c.lineTo(Math.cos(a+0.22)*6.4-0.5,Math.sin(a+0.22)*6.4+1.2);c.stroke();}}
  c.restore();
  // ear
  c.fillStyle=rgb(tone,0.9);ell(c,-1,3.8,1.55,2.6,0.1);c.fill();c.strokeStyle='rgba(80,40,30,.42)';c.lineWidth=0.25;c.stroke();
  c.beginPath();c.arc(-0.8,3.8,0.95,-1.3,1.7);c.stroke();c.fillStyle='rgba(80,40,30,.35)';ell(c,-0.5,4.2,0.35,0.5);c.fill();
  if(FEMALE)hairSide(c);
  // eye
  const eo=ORG.eye.hp>0&&!(V.eyesOut&&ORG.eye.hp<=0),ex=6.25,ey=2.7;
  c.fillStyle='rgba(70,35,30,.18)';ell(c,ex,ey,1.5,1.0);c.fill();
  if(eo&&F.squeeze>0.35&&F.open<0.2){c.strokeStyle='rgba(50,28,22,.9)';c.lineWidth=0.32;c.beginPath();c.moveTo(ex-1.05,ey+0.15);c.quadraticCurveTo(ex,ey-0.35*F.squeeze,ex+0.95,ey+0.1);c.stroke();
    c.lineWidth=0.14;c.strokeStyle='rgba(80,40,30,.5)';for(let i=0;i<3;i++){c.beginPath();c.moveTo(ex-1.1,ey+(i-1)*0.35);c.lineTo(ex-1.9,ey+(i-1)*0.6);c.stroke();}
    c.beginPath();c.moveTo(ex-0.6,ey+0.8);c.quadraticCurveTo(ex+0.2,ey+1.3,ex+0.9,ey+0.8);c.stroke();}
  else if(eo&&F.open>0.15){const h=0.55*Math.min(1.2,F.open);c.fillStyle='#f3efe7';c.beginPath();c.moveTo(ex-1.05,ey);c.quadraticCurveTo(ex,ey-h*1.6,ex+0.95,ey-0.05);c.quadraticCurveTo(ex,ey+h*1.2,ex-1.05,ey);c.fill();
    c.fillStyle=V.rot>0.5?'#cfd3c0':F.high?`hsl(${(T*90)%360},55%,45%)`:'#4a6b7a';ell(c,ex+0.5,ey,0.42,Math.min(0.48,h));c.fill();c.fillStyle=V.rot>0.5?'rgba(90,95,85,.8)':'#111';ell(c,ex+0.62,ey,V.rot>0.5?0.1:Math.min(0.38,0.2*F.pupil),V.rot>0.5?0.1:Math.min(0.24*F.pupil,h,0.45));c.fill();
    c.strokeStyle='rgba(40,25,20,.85)';c.lineWidth=0.25;c.beginPath();c.moveTo(ex-1.05,ey);c.quadraticCurveTo(ex,ey-h*1.6,ex+0.95,ey-0.05);c.stroke();
    c.lineWidth=0.12;for(let i=0;i<4;i++){const t=0.35+i*0.18;c.beginPath();c.moveTo(ex-1.05+t*2,ey-h*1.25*Math.sin(t*3.14));c.lineTo(ex-0.9+t*2.2,ey-h*1.25*Math.sin(t*3.14)-0.35);c.stroke();}}
  else if(eo){c.strokeStyle='rgba(60,30,25,.8)';c.lineWidth=0.3;c.beginPath();c.moveTo(ex-1,ey);c.quadraticCurveTo(ex,ey+(F.dead?0.25:0.45),ex+0.95,ey-0.05);c.stroke();}
  else{c.fillStyle='#3a0a0e';ell(c,ex,ey,1,0.7);c.fill();c.fillStyle='rgba(120,10,18,.8)';c.fillRect(ex-0.2,ey,0.45,2.6);}
  // brow
  c.strokeStyle='rgba(43,33,28,.9)';c.lineWidth=0.5;c.beginPath();const fb=F.fear*0.8;c.moveTo(4.8,1.2+F.pain*0.15-fb*0.6);c.quadraticCurveTo(6,0.4+F.pain*0.45-fb*0.9,7.5,0.9+F.pain*0.9-fb*0.3);c.stroke();
  if(F.pain>0.3){c.strokeStyle=`rgba(90,45,35,${0.25+F.pain*0.3})`;c.lineWidth=0.2;c.beginPath();c.moveTo(7.2,0);c.lineTo(7.6,0.6);c.moveTo(7.3,3.8);c.lineTo(7.9,4.4);c.stroke();}
  if(F.squeeze>0.3){c.strokeStyle='rgba(90,45,35,.4)';c.lineWidth=0.16;for(let i=0;i<2;i++){c.beginPath();c.moveTo(7.6+i*0.3,4.6+i*0.5);c.quadraticCurveTo(8.1+i*0.3,4.8+i*0.5,8.3+i*0.3,5.4+i*0.5);c.stroke();}
    c.beginPath();c.moveTo(6.2,5.6);c.quadraticCurveTo(7,6.3,7.4,7.6);c.stroke();}
  if(F.tears){c.strokeStyle='rgba(185,220,255,.55)';c.lineWidth=0.22;c.beginPath();c.moveTo(ex+0.7,ey+0.4);c.quadraticCurveTo(ex+0.9,ey+2.5,ex+0.4,ey+4.2+Math.sin(T*2)*0.3);c.stroke();c.fillStyle='rgba(205,235,255,.7)';ell(c,ex+0.4,ey+4.3+Math.sin(T*2)*0.3,0.18,0.26);c.fill();}
  if(F.sweat){c.fillStyle='rgba(225,240,255,.55)';for(const [x,y] of [[6.6,-2.2],[4.6,-4.4],[7.4,-0.8]]){ell(c,x,y+((T*0.6+x)%2)*0.4,0.17,0.26);c.fill();}}
  // nose detail
  c.fillStyle='rgba(70,30,25,.6)';ell(c,8.45,7.25,0.42,0.2,0.2);c.fill();
  c.strokeStyle='rgba(80,40,30,.35)';c.lineWidth=0.22;c.beginPath();c.moveTo(8.6,6.6);c.quadraticCurveTo(7.9,6.9,7.8,7.5);c.stroke();
  c.beginPath();c.moveTo(7.4,7.8);c.quadraticCurveTo(6.7,8.6,6.9,9.8);c.stroke();
  // mouth
  const mo=Math.max(F.gasp*0.9,F.slack?0.4:0);
  c.fillStyle='rgba(175,95,90,.55)';ell(c,7.7,8.75,0.45,0.32);c.fill();ell(c,7.7,9.95+(F.scream?0.5:0),0.45,0.35);c.fill();
  if(F.scream){c.fillStyle='#2e0f0e';ell(c,7.5,9.65,0.62,1.15);c.fill();c.fillStyle='rgba(240,235,225,.9)';c.fillRect(7.25,8.6,0.6,0.3);c.fillRect(7.25,10.55,0.55,0.25);c.fillStyle='rgba(200,90,95,.8)';ell(c,7.35,10.2,0.35,0.25);c.fill();}
  else if(F.grimace){const g=F.pain;c.fillStyle='#3a1514';c.beginPath();c.moveTo(7.75,9.0);c.lineTo(7.75,9.75);c.lineTo(6.7-g*0.4,9.95+g*0.2);c.lineTo(6.7-g*0.4,9.0+g*0.1);c.closePath();c.fill();
    c.fillStyle='rgba(242,238,228,.95)';c.fillRect(6.8-g*0.3,9.08,0.9+g*0.3,0.32);c.fillRect(6.8-g*0.3,9.45,0.9+g*0.3,0.28);c.strokeStyle='rgba(120,100,90,.6)';c.lineWidth=0.06;for(let i=0;i<4;i++){c.beginPath();c.moveTo(6.85+i*0.25-g*0.2,9.08);c.lineTo(6.85+i*0.25-g*0.2,9.73);c.stroke();}
    c.strokeStyle='rgba(90,45,35,.35)';c.lineWidth=0.16;c.beginPath();c.moveTo(6.6-g*0.4,9.2);c.quadraticCurveTo(6.2-g*0.3,9.6,6.4-g*0.3,10.2);c.stroke();}
  else if(mo>0.15){c.fillStyle='#3e1514';ell(c,7.55,9.35,0.55,0.18+mo*0.55);c.fill();c.fillStyle='rgba(240,235,225,.85)';c.fillRect(7.25,9.35-0.18-mo*0.5,0.55,0.22);}
  else{c.strokeStyle='rgba(120,50,45,.75)';c.lineWidth=0.3;c.beginPath();c.moveTo(7.9,9.35);c.quadraticCurveTo(7.4,9.3+F.pain*0.2,6.9,9.5+F.pain*0.3);c.stroke();}
  c.strokeStyle='rgba(80,40,30,.22)';c.lineWidth=0.22;c.beginPath();c.moveTo(7.3,11.2);c.quadraticCurveTo(6.8,11.4,6.6,11.1);c.stroke();
  c.beginPath();c.moveTo(-1.5,10.4);c.quadraticCurveTo(2,12.6,5.2,13.4);c.stroke();
}
function steelGrad(c,r){const g=c.createLinearGradient(-r,0,r,0);g.addColorStop(0,'#4b5157');g.addColorStop(0.25,'#9aa2aa');g.addColorStop(0.45,'#eef2f5');g.addColorStop(0.6,'#b8c0c7');g.addColorStop(1,'#596067');return g;}
// side view: shells over each part, with articulated lames, rivets and joint cops
function steelSide(c,seg,ra,rb){const L=seg.len,k=seg.kind;
  const rivet=(x,y,r=0.3)=>{c.fillStyle='rgba(16,19,22,.7)';c.beginPath();c.arc(x+0.05,y+0.07,r+0.09,0,6.28);c.fill();c.fillStyle='#d6dce1';c.beginPath();c.arc(x,y,r,0,6.28);c.fill();c.fillStyle='rgba(255,255,255,.9)';c.beginPath();c.arc(x-r*0.35,y-r*0.35,r*0.3,0,6.28);c.fill();};
  const edge=(fn,w=0.5)=>{c.lineCap='round';c.strokeStyle='rgba(16,19,22,.7)';c.lineWidth=w;fn();c.stroke();c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=w*0.38;fn();c.stroke();};
  if(k==='head'){if(!WEAR.helm.on)return;c.save();c.translate(-0.2,0.6);c.scale(1.1,1.08);c.translate(0,-0.6);headPath(c,seg);c.restore();c.fillStyle=steelGrad(c,10);c.fill();
    {const ev=c.createLinearGradient(0,-12,0,12);ev.addColorStop(0,'rgba(235,244,255,.22)');ev.addColorStop(0.42,'rgba(255,255,255,0)');ev.addColorStop(0.56,'rgba(10,14,18,.24)');ev.addColorStop(1,'rgba(95,72,50,.14)');c.fillStyle=ev;c.fill();}
    c.strokeStyle='rgba(30,34,38,.75)';c.lineWidth=0.3;c.stroke();
    // comb along the crown
    c.lineCap='round';c.strokeStyle='rgba(16,19,22,.75)';c.lineWidth=1.1;c.beginPath();c.moveTo(-8.4,-5);c.quadraticCurveTo(-1.5,-14.2,7,-7.6);c.stroke();c.strokeStyle='#eef2f5';c.lineWidth=0.5;c.stroke();
    // visor pivoting at the temple, its sight and breaths; bevor lames under the chin
    edge(()=>{c.beginPath();c.moveTo(-0.8,0.6);c.quadraticCurveTo(4.6,-1.9,9.9,0.6);},0.32);
    edge(()=>{c.beginPath();c.moveTo(-0.8,0.6);c.quadraticCurveTo(-0.2,5.8,4.2,9.2);},0.32);
    c.fillStyle='#0b0d0f';c.beginPath();c.moveTo(2.2,2.1);c.lineTo(9.2,1.6);c.lineTo(9.3,2.6);c.lineTo(2.4,3.0);c.closePath();c.fill();
    c.strokeStyle='rgba(255,255,255,.45)';c.lineWidth=0.14;c.beginPath();c.moveTo(2.4,3.2);c.lineTo(9.3,2.8);c.stroke();
    c.fillStyle='rgba(10,12,14,.9)';for(let r=0;r<3;r++)for(let q=0;q<4;q++){c.beginPath();c.arc(5+q*0.95+r*0.3,5.2+r*1.2,0.24,0,6.28);c.fill();}
    rivet(-0.8,0.6,0.55);c.fillStyle='#c7ced4';c.fillRect(9.5,3.8,1.2,0.7);
    edge(()=>{c.beginPath();c.moveTo(1,8.6);c.quadraticCurveTo(5.6,10.6,9.6,8.2);},0.32);edge(()=>{c.beginPath();c.moveTo(0.4,10.4);c.quadraticCurveTo(5,12.4,8.8,10.2);},0.32);
    c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=0.25;c.beginPath();c.moveTo(-8,-1);c.quadraticCurveTo(-2,-11,7,-5);c.stroke();
    for(const p of [[-7,4],[-3,8.6],[4,-8]])rivet(p[0],p[1],0.33);
    steelMarksSide(c,seg,9.5);return;}
  const it=STEELK.find(q=>q!=='helm'&&WEAR[q].on&&STEELKIND[q]===k)||(k==='abd'&&WEAR.cuirass.on?'cuirass':null);if(!it)return;
  let s0=-ra-1,s1=L+rb+1;if(it==='gorget')s0=-1;
  const t=0.75,r=Math.max(ra,rb)+t;c.save();c.beginPath();c.rect(-r-2,s0,2*r+4,s1-s0);c.clip();capPath(c,L,ra+t,rb+t);c.fillStyle=steelGrad(c,r);c.fill();
  {const ev=c.createLinearGradient(-r,0,r,0);ev.addColorStop(0,'rgba(95,72,50,.12)');ev.addColorStop(0.5,'rgba(255,255,255,0)');ev.addColorStop(0.62,'rgba(10,14,18,.18)');ev.addColorStop(1,'rgba(235,244,255,.12)');c.fillStyle=ev;c.fill();}
  c.strokeStyle='rgba(25,28,32,.75)';c.lineWidth=0.28;c.stroke();
  c.save();capPath(c,L,ra+t,rb+t);c.clip(); // details stay inside the shell
  // specular streak down the piece
  c.strokeStyle='rgba(255,255,255,.45)';c.lineWidth=0.35;c.beginPath();c.moveTo(-r*0.12,Math.max(s0,0)+0.8);c.lineTo(-r*0.12,Math.min(s1,L)-0.8);c.stroke();
  // lames: overlapping steel bands where the armour has to bend
  const lam=(a,b,step)=>{for(let s=a;s<b;s+=step)edge(()=>{c.beginPath();c.moveTo(-r,s);c.quadraticCurveTo(0,s+0.8,r,s);},0.26);};
  const re=s=>edge(()=>{c.beginPath();c.moveTo(-(r-0.4),s);c.quadraticCurveTo(0,s+0.8,r-0.4,s);},0.55); // rolled edge
  if(it==='cuirass'&&k==='abd')lam(2,L,2.6);if(it==='pauldrons')lam(-1,8,2.2);if(it==='gauntlets')lam(4,L,1.8);if(it==='sabatons')lam(2,L,2);if(it==='gorget')lam(2,L,2.4);
  if(it==='cuisses')lam(L-4.4,L,2.2);if(it==='vambraces'||it==='greaves'||it==='cuisses')re(L-0.8);
  // medial ridge at the front of the breastplate, cuisses and greaves
  if(it==='cuisses'||it==='greaves'||(it==='cuirass'&&k==='chest')){const a=Math.max(s0,0)+1,b=Math.min(s1,L)-1;c.strokeStyle='rgba(16,19,22,.45)';c.lineWidth=0.4;c.beginPath();c.moveTo(r-1.1,a);c.lineTo(r-1.1,b);c.stroke();c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=0.22;c.beginPath();c.moveTo(r-1.45,a);c.lineTo(r-1.45,b);c.stroke();}
  if(L>=4)for(const s of [1.2,L-1.2])for(const w of [-r+1,r-1])rivet(w,s,0.28);
  steelMarksSide(c,seg,r);
  c.restore();
  // couter (elbow) and poleyn (knee) cops, each with a fluted fan wing
  if(it==='vambraces'||it==='greaves'){const cx=it==='greaves'?ra*0.4:-ra*0.3,cr=Math.max(2.4,ra*0.75);
    c.beginPath();c.ellipse(cx,0,cr*1.6,cr*1.2,0,0,6.28);c.fillStyle=steelGrad(c,cr*1.6);c.fill();c.strokeStyle='rgba(16,19,22,.75)';c.lineWidth=0.26;c.stroke();
    c.strokeStyle='rgba(16,19,22,.35)';c.lineWidth=0.18;for(let i=0;i<8;i++){const a=i/8*6.283+0.2;c.beginPath();c.moveTo(cx+Math.cos(a)*cr*0.9,Math.sin(a)*cr*0.75);c.lineTo(cx+Math.cos(a)*cr*1.5,Math.sin(a)*cr*1.12);c.stroke();}
    const g=c.createRadialGradient(cx-cr*0.35,-cr*0.35,cr*0.1,cx,0,cr);g.addColorStop(0,'#fbfcfd');g.addColorStop(0.5,'#a7afb6');g.addColorStop(1,'#3e454b');c.fillStyle=g;c.beginPath();c.arc(cx,0,cr,0,6.28);c.fill();c.strokeStyle='rgba(16,19,22,.8)';c.lineWidth=0.28;c.stroke();
    edge(()=>{c.beginPath();c.arc(cx,0,cr*0.62,0,6.28);},0.24);rivet(cx,0,0.5);}
  if(it==='gauntlets')edge(()=>{c.beginPath();c.moveTo(-r,L*0.42);c.quadraticCurveTo(0,L*0.42+1,r,L*0.42);},0.6);
  if(it==='pauldrons'){const ry=ra*0.9+0.5;c.beginPath();c.ellipse(0,-0.5,r+1.6,ry,0,Math.PI,0);c.closePath();c.fillStyle=steelGrad(c,r+1.6);c.fill();c.strokeStyle='rgba(16,19,22,.8)';c.lineWidth=0.28;c.stroke();
    edge(()=>{c.beginPath();c.ellipse(0,-0.5,r+1.1,ry-0.5,0,Math.PI*1.05,Math.PI*1.95);},0.6);rivet(-r*0.5,-0.9);rivet(r*0.5,-0.9);}
  if(it==='cuirass'&&k==='chest'){c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=0.3;c.beginPath();c.moveTo(ra-0.5,2);c.quadraticCurveTo(ra+1.4,10,ra-0.3,L);c.stroke();c.strokeStyle='rgba(25,28,32,.5)';c.beginPath();c.moveTo(-ra-0.2,L*0.15);c.lineTo(-ra-0.2,L);c.stroke();
    re(0.8);edge(()=>{c.beginPath();c.moveTo(ra+0.7,L*0.55);c.quadraticCurveTo(ra*0.3,L*0.85,-ra*0.1,L+0.2);},0.35);rivet(ra-0.3,L*0.6,0.32);
    c.fillStyle='#3f464c';c.fillRect(ra-0.4,L*0.38,1.6,1.2);}
  c.restore();}
// a hit on steel: a dent with a bright rim on the lit side, a skid where an arrow glanced, a petalled hole that weeps blood where it went through
function steelMark(c,x,y,m){const hh=Math.abs(Math.sin(m.s*12.9898+m.w*78.233)*43758.5453)%1,rot=hh*6.283;c.lineCap='round';
  if(m.cut){const dx=Math.cos(rot*0.3-0.4)*1.6,dy=Math.sin(rot*0.3-0.4)*1.6;c.strokeStyle='rgba(20,22,26,.65)';c.lineWidth=0.3;c.beginPath();c.moveTo(x-dx,y-dy);c.lineTo(x+dx,y+dy);c.stroke();c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=0.12;c.beginPath();c.moveTo(x-dx,y-dy-0.2);c.lineTo(x+dx,y+dy-0.2);c.stroke();return;}
  const E=m.E||60,R=clamp(0.55+Math.sqrt(E)/22,0.65,2.6);
  if(m.arrow&&!m.pen){const Lk=R*2.4+1.2,ux=Math.cos(rot),uy=Math.sin(rot);c.strokeStyle='rgba(20,22,26,.55)';c.lineWidth=0.34;c.beginPath();c.moveTo(x,y);c.lineTo(x+ux*Lk,y+uy*Lk);c.stroke();c.strokeStyle='rgba(255,255,255,.85)';c.lineWidth=0.14;c.beginPath();c.moveTo(x-uy*0.18,y+ux*0.18);c.lineTo(x+ux*Lk-uy*0.18,y+uy*Lk+ux*0.18);c.stroke();}
  const g=c.createRadialGradient(x+R*0.2,y+R*0.25,0,x,y,R);g.addColorStop(0,'rgba(25,28,32,.75)');g.addColorStop(0.55,'rgba(60,66,72,.42)');g.addColorStop(1,'rgba(60,66,72,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,R,0,6.28);c.fill();
  c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=0.18;c.beginPath();c.arc(x,y,R*0.78,3.5,5.7);c.stroke();c.strokeStyle='rgba(15,18,20,.55)';c.beginPath();c.arc(x,y,R*0.8,0.4,2.7);c.stroke();
  c.strokeStyle='rgba(235,240,244,.45)';c.lineWidth=0.08;for(let i=0;i<3;i++){const a=rot+i*2.1;c.beginPath();c.moveTo(x+Math.cos(a)*R*0.9,y+Math.sin(a)*R*0.9);c.lineTo(x+Math.cos(a)*R*1.5,y+Math.sin(a)*R*1.5);c.stroke();}
  if(m.pen){const hr=Math.min(0.9,R*0.4);
    if(m.t!=null){const run=Math.min(8,(T-m.t)*1.3);if(run>0.3){const bg=c.createLinearGradient(0,y,0,y+run);bg.addColorStop(0,'rgba(100,6,12,.9)');bg.addColorStop(1,'rgba(100,6,12,0)');c.fillStyle=bg;c.beginPath();c.moveTo(x-hr*0.6,y);c.quadraticCurveTo(x-0.25,y+run*0.6,x,y+run);c.quadraticCurveTo(x+0.25,y+run*0.6,x+hr*0.6,y);c.closePath();c.fill();}}
    c.fillStyle='#0b0d0f';c.beginPath();for(let i=0;i<10;i++){const a=rot+i/10*6.283,q=hr*(i%2?0.55:1.15);i?c.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q):c.moveTo(x+Math.cos(a)*q,y+Math.sin(a)*q);}c.closePath();c.fill();
    c.strokeStyle='rgba(225,230,235,.7)';c.lineWidth=0.1;c.stroke();}}
function steelMarksSide(c,seg,rr){if(!seg.amarks)return;for(const m of seg.amarks){if(!STEELK.includes(m.it)||!covers(m.it,seg,m.s,m.w))continue;steelMark(c,clamp(m.w,-(rr-0.9),rr-0.9),m.s,m);}}
function steelMarksFront(s){for(const seg of segs){if(!seg.connected||!seg.amarks)continue;for(const m of seg.amarks){if(!STEELK.includes(m.it)||!covers(m.it,seg,m.s,m.w))continue;let p=null;
  if(m.fx!=null){if(m.v!==view)continue;p={x:m.fx,y:m.fy};}else{const rr=radS(seg,m.s)||seg.ra;if(view==='back'?m.w>0.3*rr:m.w<-0.3*rr)continue;p=frontPos(seg,m.s,m.z==null?0:clamp(m.z,-1,1));}
  if(p)steelMark(s,p.x,p.y,m);}}}
function drawLich(c,L){const age=T-L.t,a=clamp(1-age/90,0.15,0.75);c.strokeStyle=`rgba(200,60,70,${a})`;c.lineCap='round';let h=Math.floor(L.seed)%2147483646+1;const rr=()=>{h=(h*16807)%2147483647;return h/2147483647;};
  const br=(x,y,ang,len,wd,dep)=>{if(dep>5||len<0.4)return;const x2=x+Math.cos(ang)*len,y2=y+Math.sin(ang)*len;c.lineWidth=wd;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();br(x2,y2,ang+rr()*0.9-0.2,len*0.72,wd*0.7,dep+1);if(rr()<0.75)br(x2,y2,ang-rr()*0.9+0.2,len*0.62,wd*0.65,dep+1);};
  for(let i=0;i<4;i++)br(L.w,L.s,i*1.57+rr()*0.8,L.r*0.32,0.32,0);}
function drawWrapsSide(c,seg,ra,rb,under){
  const L=seg.len,R0=Math.max(ra,rb)+3,special=seg.kind==='head'||(seg.kind==='hand'&&!seg.part&&seg.len>14);
  for(const W of seg.wraps){const s0=Math.max(W.s0,-R0),s1=Math.min(W.s1,L+R0);if(s1<=s0)continue;
    if(under!=null&&(!special&&anyWear()&&wrapCovered(seg,W))!==under)continue;
    c.save();c.beginPath();c.rect(-R0-3,s0,2*R0+6,s1-s0);c.clip();
    if(special){segPath(c,seg,ra,rb);c.fillStyle='#ece8de';c.fill();c.strokeStyle='#ece8de';c.lineWidth=0.8;c.stroke();segPath(c,seg,ra,rb);}
    else{capPath(c,L,ra+0.35,rb+0.35);c.fillStyle='#ece8de';c.fill();}
    c.save();c.clip();
    const g=c.createLinearGradient(-R0,0,R0,0);g.addColorStop(0,'rgba(0,0,0,.25)');g.addColorStop(0.45,'rgba(0,0,0,0)');g.addColorStop(0.8,'rgba(255,255,255,.12)');g.addColorStop(1,'rgba(0,0,0,.18)');c.fillStyle=g;c.fillRect(-R0,s0,2*R0,s1-s0);
    c.strokeStyle='rgba(140,128,108,.5)';c.lineWidth=0.14;for(let y=s0-R0;y<s1+R0;y+=1.5){c.beginPath();c.moveTo(-R0,y);c.lineTo(R0,y+R0*0.5);c.stroke();}
    c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=0.1;for(let y=s0-R0+0.5;y<s1+R0;y+=1.5){c.beginPath();c.moveTo(-R0,y);c.lineTo(R0,y+R0*0.5);c.stroke();}
    for(const wd of seg.wounds){if(!wd.wrapped)continue;const cc=woundCenter(wd);if(cc.s<s0-2||cc.s>s1+2)continue;
      const bl=wd.type==='burn'?0.3:(wd.bleed+0.15);const soak=clamp(0.18+wd.age*0.006*bl,0.15,0.75);const r=(wd.type==='cut'?(wd.len||2)*0.45:wd.r)+1.4;
      const gr=c.createRadialGradient(cc.w,cc.s,0,cc.w,cc.s,r*1.6);const col=wd.type==='burn'?'200,160,90':'150,18,24';gr.addColorStop(0,`rgba(${col},${soak})`);gr.addColorStop(1,`rgba(${col},0)`);c.fillStyle=gr;c.fillRect(cc.w-r*1.6,cc.s-r*1.6,r*3.2,r*3.2);}
    c.fillStyle='rgba(120,108,90,.55)';if(W.s0>-R0)c.fillRect(-R0,s0,2*R0,0.3);if(W.s1<L+R0)c.fillRect(-R0,s1-0.3,2*R0,0.3);
    c.restore();c.restore();
  }
}

/* deep burn, drawn as the layers it has gone through: a ragged charred / raw rim, wet yellow fat, dark fibrous muscle,
   ivory bone (long along the limb), and when the bone goes, a black cavity. Acid wounds are wet and brown-yellow, fire wounds black and dry. */
// the 31 outline angles and the rotation never change inside one blob: work their sines and cosines out once
const MBA=[],MBC=[],MBS=[];for(let i=0;i<=30;i++){const a=i/30*6.283;MBA.push(a);MBC.push(Math.cos(a));MBS.push(Math.sin(a));}
function meltBlob(c,x,y,rx,ry,rot,seed,jag){c.beginPath();const n=30,cr=Math.cos(rot),sr=Math.sin(rot),s2=seed*2.3,s3=seed*5.1;for(let i=0;i<=n;i++){const a=MBA[i],k=1+jag*(Math.sin(a*2+seed)*0.45+Math.sin(a*5+s2)*0.35+Math.sin(a*9+s3)*0.2);const px=MBC[i]*rx*k,py=MBS[i]*ry*k;const X=x+px*cr-py*sr,Y=y+px*sr+py*cr;i?c.lineTo(X,Y):c.moveTo(X,Y);}c.closePath();}
// seeded random so a wound looks the same every frame
function mrng(seed){let h=(Math.floor(Math.abs(seed)*9973)%2147483646)+1;return()=>{h=(h*16807)%2147483647;return h/2147483647;};}
function drawMelt(c,x,y,r,m,chem,rot,kind){const sd=rot*7.3+x*0.13+y*0.07,R=mrng(sd*1000),L=i=>clamp(m-i,0,1),wet=!!chem;
  // each deeper layer sits off-centre (wounds are never neat rings) and is smaller
  const off=()=>[(R()-0.5)*r*0.28,(R()-0.5)*r*0.28];const shade=(cx,cy,rr,a,b)=>{const g=c.createRadialGradient(cx-rr*0.25,cy-rr*0.3,rr*0.1,cx,cy,rr*1.05);g.addColorStop(0,a);g.addColorStop(1,b);return g;};
  // scorched / inflamed skin around it, blistered at the edge
  const gr=c.createRadialGradient(x,y,r*0.45,x,y,r*1.35);gr.addColorStop(0,wet?'rgba(110,62,28,.6)':'rgba(25,14,9,.8)');gr.addColorStop(0.6,wet?'rgba(160,80,45,.3)':'rgba(90,40,25,.35)');gr.addColorStop(1,'rgba(170,60,50,0)');c.fillStyle=gr;c.beginPath();c.arc(x,y,r*1.35,0,6.283);c.fill();
  if(wet){c.fillStyle='rgba(245,225,175,.55)';for(let i=0;i<7;i++){const a=R()*6.283,d=r*(0.95+R()*0.2);c.beginPath();c.arc(x+Math.cos(a)*d,y+Math.sin(a)*d,r*(0.05+R()*0.07),0,6.283);c.fill();}}
  // 0→1 the skin is gone: eschar rim (acid: grey-brown, curling; fire: black, cracked) over raw red dermis
  const R0=r*(0.55+0.42*L(0));meltBlob(c,x,y,R0,R0*0.9,rot,sd,0.32);c.fillStyle=wet?'#5b3322':'#170d08';c.fill();
  c.strokeStyle=wet?'rgba(215,190,150,.5)':'rgba(70,40,25,.6)';c.lineWidth=Math.max(0.05,r*0.035);c.stroke();
  let [ox,oy]=off();meltBlob(c,x+ox*0.4,y+oy*0.4,R0*0.84,R0*0.76,rot,sd+1,0.3);c.fillStyle=shade(x,y,R0,wet?'#c8644d':'#4a2214',wet?'#7e2c22':'#22100a');c.fill();
  if(!wet){c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=Math.max(0.04,r*0.025);for(let i=0;i<6;i++){const a=R()*6.283,d0=R0*0.2,d1=R0*(0.5+R()*0.35);c.beginPath();c.moveTo(x+Math.cos(a)*d0,y+Math.sin(a)*d0);c.lineTo(x+Math.cos(a+0.3)*d1,y+Math.sin(a+0.3)*d1);c.stroke();}}
  // 1→2 fat: lumpy yellow lobules
  if(m>1){[ox,oy]=off();const cx=x+ox,cy=y+oy,R1=R0*(0.3+0.5*L(1)),fatT=kind==='head'?0.3:1;meltBlob(c,cx,cy,R1,R1*0.88,rot,sd+2,0.35);c.fillStyle=shade(cx,cy,R1,wet?'#f0d27a':'#8a6428',wet?'#b88a34':'#4a3214');c.fill();
    c.save();c.clip();for(let i=0;i<18*fatT;i++){const a=R()*6.283,d=R1*Math.sqrt(R())*0.9,rr=R1*(0.07+R()*0.09);c.fillStyle=wet?`rgba(255,${235+R()*20|0},${150+R()*60|0},.55)`:'rgba(140,100,50,.45)';c.beginPath();c.arc(cx+Math.cos(a)*d,cy+Math.sin(a)*d,rr,0,6.283);c.fill();c.strokeStyle='rgba(150,100,40,.35)';c.lineWidth=Math.max(0.03,rr*0.12);c.stroke();}c.restore();}
  // 2→3 muscle: dark red bundles with glossy fibres running along the body part
  if(m>2){[ox,oy]=off();const cx=x+ox,cy=y+oy,R2=R0*(0.22+0.46*L(2));meltBlob(c,cx,cy,R2*0.9,R2,rot*0.2,sd+3,0.28);c.fillStyle=shade(cx,cy,R2,wet?'#9a2a26':'#40140c',wet?'#4a0d10':'#1c0805');c.fill();
    c.save();c.clip();for(let i=-6;i<=6;i++){const xx=cx+i*R2*0.16+(R()-0.5)*R2*0.05;c.strokeStyle=wet?`rgba(${210+R()*40|0},110,110,${0.18+R()*0.2})`:'rgba(110,50,30,.35)';c.lineWidth=Math.max(0.04,R2*(0.03+R()*0.04));c.beginPath();c.moveTo(xx,cy-R2*1.1);c.quadraticCurveTo(xx+(R()-0.5)*R2*0.3,cy,xx+(R()-0.5)*R2*0.15,cy+R2*1.1);c.stroke();}
      c.fillStyle='rgba(255,255,255,.12)';c.beginPath();c.ellipse(cx-R2*0.3,cy-R2*0.35,R2*0.35,R2*0.12,-0.6,0,6.283);c.fill();c.restore();}
  // 3→4 what lies under the muscle: ribs on the chest, coils of bowel in the belly, the skull on the head, a bone shaft in a limb
  if(m>3){[ox,oy]=off();const cx=x+ox*0.5,cy=y+oy*0.5,R3=R0*(0.18+0.34*L(3));
    if(kind==='abd'){meltBlob(c,cx,cy,R3*1.1,R3,0,sd+4,0.2);c.fillStyle='#d98f86';c.fill();c.save();c.clip();for(let i=0;i<9;i++){const a=R()*6.283,d=R3*0.7*Math.sqrt(R());c.strokeStyle='rgba(140,60,60,.6)';c.lineWidth=Math.max(0.05,R3*0.06);c.fillStyle=`rgba(${225+R()*25|0},${150+R()*30|0},${140+R()*30|0},.95)`;c.beginPath();c.ellipse(cx+Math.cos(a)*d,cy+Math.sin(a)*d,R3*0.32,R3*0.2,R()*3,0,6.283);c.fill();c.stroke();}c.restore();}
    else if(kind==='chest'){c.save();meltBlob(c,cx,cy,R3*1.15,R3*1.05,0,sd+4,0.12);c.clip();c.fillStyle='#4a0d10';c.fillRect(cx-R3*1.4,cy-R3*1.4,R3*2.8,R3*2.8);for(let k=-2;k<=2;k++){const yy=cy+k*R3*0.42;c.fillStyle=shade(cx,yy,R3,'#f3ecd6','#c4b28a');c.beginPath();c.ellipse(cx,yy,R3*1.3,R3*0.13,0.12,0,6.283);c.fill();c.strokeStyle='rgba(110,90,60,.6)';c.lineWidth=Math.max(0.04,R3*0.03);c.stroke();}c.restore();}
    else if(kind==='head'){meltBlob(c,cx,cy,R3*1.05,R3*0.95,0,sd+4,0.08);c.fillStyle=shade(cx,cy,R3,'#f5eedb','#cbbb93');c.fill();c.strokeStyle='rgba(110,90,60,.55)';c.lineWidth=Math.max(0.04,R3*0.04);c.beginPath();c.moveTo(cx-R3*0.8,cy-R3*0.1);c.quadraticCurveTo(cx-R3*0.2,cy+R3*0.25,cx+R3*0.3,cy-R3*0.05);c.quadraticCurveTo(cx+R3*0.6,cy-R3*0.2,cx+R3*0.85,cy+R3*0.1);c.stroke();}
    else{c.fillStyle='rgba(0,0,0,.35)';meltBlob(c,cx+R3*0.12,cy+R3*0.1,R3*0.72,R3*1.45,0,sd+4,0.06);c.fill();meltBlob(c,cx,cy,R3*0.68,R3*1.4,0,sd+4,0.06);c.fillStyle=shade(cx,cy,R3*1.2,wet?'#f3ecd6':'#d9cdb0',wet?'#c9b98f':'#9c8c6c');c.fill();c.strokeStyle='rgba(110,90,60,.7)';c.lineWidth=Math.max(0.05,R3*0.06);c.stroke();}
    if(kind!=='abd'){c.fillStyle=wet?'rgba(150,110,60,.5)':'rgba(40,25,15,.55)';for(let i=0;i<10;i++){const a=R()*6.283,d=R3*0.55*Math.sqrt(R());c.beginPath();c.arc(cx+Math.cos(a)*d*0.6,cy+Math.sin(a)*d*1.2,R3*(0.04+R()*0.06),0,6.283);c.fill();}}}
  // 4→5 the bone is going: a ragged hole through it, dark marrow inside
  if(m>4){const R4=R0*(0.08+0.32*L(4)),hd=kind==='head';meltBlob(c,x,y,R4*(hd?1:0.75),R4*(hd?0.9:1.3),0,sd+5,0.38);c.fillStyle=hd?shade(x,y,R4,'#d8a3a0','#8e5a5a'):shade(x,y,R4,'#3a0b0b','#0e0303');c.fill();if(hd){c.strokeStyle='rgba(120,60,60,.6)';c.lineWidth=Math.max(0.04,R4*0.05);for(let i=0;i<5;i++){c.beginPath();c.arc(x+(R()-0.5)*R4,y+(R()-0.5)*R4,R4*0.35,R()*3,R()*3+2);c.stroke();}}c.strokeStyle=wet?'rgba(215,190,120,.8)':'rgba(50,30,18,.9)';c.lineWidth=Math.max(0.05,R4*0.1);c.stroke();
    c.fillStyle='rgba(120,25,25,.6)';for(let i=0;i<5;i++){const a=R()*6.283,d=R4*0.4*R();c.beginPath();c.arc(x+Math.cos(a)*d*0.7,y+Math.sin(a)*d*1.2,R4*0.12,0,6.283);c.fill();}}
  // acid: a wet sheen and fizzing bubbles over the whole wound
  if(wet){c.fillStyle='rgba(255,255,225,.16)';meltBlob(c,x-R0*0.2,y-R0*0.25,R0*0.4,R0*0.16,rot-0.4,sd+6,0.15);c.fill();
    for(let i=0;i<7;i++){const a=T*2.1+i*0.9+sd,d=R0*(0.15+0.11*i),s_=0.1+0.11*Math.abs(Math.sin(T*6.5+i*2.2));c.fillStyle=`rgba(240,245,200,${0.35+0.3*Math.abs(Math.sin(T*5+i))})`;c.beginPath();c.arc(x+Math.cos(a)*d,y+Math.sin(a*1.13)*d,s_,0,6.283);c.fill();}}}
/* gunshot and puncture wounds, drawn the way they look:
   entrance — a round punched hole with a reddish-brown abrasion collar (the bullet scrapes the skin as it pushes in) and a bruise ring;
   exit — larger and irregular, the skin split outward into flaps (no collar), fat and muscle pushed out through it;
   big / torn — a crater: ragged skin, lumpy yellow fat, torn dark-red muscle, bone chips when the bone under it is broken. */
function woundArt(c,x,y,r,o){o=o||{};const R=mrng((o.seed||1)*977+r*31),ex=!!o.exit,big=ex||o.torn||r>0.8,tone=o.tone||[214,160,130];
  // bruise / contusion ring
  const br=r*(big?2.6:2.2)+0.6,gb=c.createRadialGradient(x,y,r*0.6,x,y,br);gb.addColorStop(0,'rgba(110,30,45,.5)');gb.addColorStop(0.55,'rgba(120,45,70,.22)');gb.addColorStop(1,'rgba(120,60,80,0)');c.fillStyle=gb;c.beginPath();c.arc(x,y,br,0,6.283);c.fill();
  if(!big){// entrance: collar, then the hole
    meltBlob(c,x,y,r+0.34,(r+0.34)*0.92,R()*3,o.seed||1,0.12);c.fillStyle='#8a3a2c';c.fill();
    meltBlob(c,x,y,r+0.14,(r+0.14)*0.9,R()*3,(o.seed||1)+1,0.1);c.fillStyle='#5a0d12';c.fill();
    meltBlob(c,x,y,r*0.78,r*0.72,R()*3,(o.seed||1)+2,0.12);c.fillStyle='#160305';c.fill();
    c.fillStyle='rgba(255,220,220,.3)';c.beginPath();c.ellipse(x-r*0.3,y-r*0.35,r*0.25,r*0.12,-0.6,0,6.283);c.fill();
    // a pin-point specular glint: fresh blood is wet and mirrors the overhead light
    if(!(o.clot>0.4)){c.fillStyle='rgba(255,245,245,.75)';c.beginPath();c.arc(x-r*0.32,y-r*0.38,Math.max(0.05,r*0.08),0,6.283);c.fill();}return;}
  const Rr=r+0.5;
  // skin flaps pushed outward (exit) or torn back (crater)
  const n=ex?5+Math.floor(R()*3):8+Math.floor(R()*4);c.lineJoin='round';
  for(let i=0;i<n;i++){const a=i/n*6.283+R()*0.4,len=Rr*(ex?1.25+R()*0.7:1.05+R()*0.35),w=0.35+R()*0.25,b0=Rr*0.8;
    c.fillStyle='#7c1a20';c.beginPath();c.moveTo(x+Math.cos(a-w)*b0,y+Math.sin(a-w)*b0);c.lineTo(x+Math.cos(a)*len,y+Math.sin(a)*len);c.lineTo(x+Math.cos(a+w)*b0,y+Math.sin(a+w)*b0);c.closePath();c.fill();
    c.fillStyle=`rgb(${tone[0]*0.85|0},${tone[1]*0.7|0},${tone[2]*0.68|0})`;c.beginPath();c.moveTo(x+Math.cos(a-w*0.75)*b0,y+Math.sin(a-w*0.75)*b0);c.lineTo(x+Math.cos(a)*len*0.93,y+Math.sin(a)*len*0.93);c.lineTo(x+Math.cos(a+w*0.75)*b0,y+Math.sin(a+w*0.75)*b0);c.closePath();c.fill();}
  // the wound bed
  meltBlob(c,x,y,Rr,Rr*0.92,R()*3,(o.seed||1)+3,0.28);c.fillStyle='#4a0a0f';c.fill();
  const fx=x+(R()-0.5)*r*0.2,fy=y+(R()-0.5)*r*0.2;meltBlob(c,fx,fy,Rr*0.85,Rr*0.78,R()*3,(o.seed||1)+4,0.3);c.fillStyle='#d9b45e';c.fill();
  c.save();c.clip();for(let i=0;i<10;i++){const a=R()*6.283,d=Rr*0.75*Math.sqrt(R()),rr=Rr*(0.08+R()*0.1);c.fillStyle=`rgba(250,${220+R()*30|0},${130+R()*60|0},.6)`;c.beginPath();c.arc(fx+Math.cos(a)*d,fy+Math.sin(a)*d,rr,0,6.283);c.fill();}c.restore();
  const mx=x+(R()-0.5)*r*0.25,my=y+(R()-0.5)*r*0.25;meltBlob(c,mx,my,Rr*0.62,Rr*0.6,R()*3,(o.seed||1)+5,0.35);c.fillStyle='#8f1d24';c.fill();
  c.save();c.clip();for(let i=-5;i<=5;i++){c.strokeStyle=`rgba(${200+R()*50|0},110,110,${0.15+R()*0.2})`;c.lineWidth=Math.max(0.05,Rr*0.04);const xx=mx+i*Rr*0.12;c.beginPath();c.moveTo(xx,my-Rr);c.quadraticCurveTo(xx+(R()-0.5)*Rr*0.4,my,xx+(R()-0.5)*Rr*0.2,my+Rr);c.stroke();}c.restore();
  // shredded muscle tags pushed out of an exit
  if(ex||o.torn){c.fillStyle='#a8282f';for(let i=0;i<4;i++){const a=R()*6.283,d=Rr*(0.5+R()*0.4);c.beginPath();c.ellipse(x+Math.cos(a)*d,y+Math.sin(a)*d,Rr*0.18,Rr*0.09,a,0,6.283);c.fill();}}
  // the centre: torn open onto whatever is underneath (bone, skull, ribs, organs) — cut out of the skin layer so the anatomy below shows.
  // The more of him is shot away (bigger wound, more hits in the same place), the wider it opens.
  const open=o.noPunch?0:clamp((r-0.7)/2.6,0,1)*0.55+clamp(((o.hits||1)-1)*0.08,0,0.2);
  if(open>0.05){c.save();c.globalCompositeOperation='destination-out';meltBlob(c,x,y,Rr*(0.25+open*0.8),Rr*(0.23+open*0.78),R()*3,(o.seed||1)+6,0.32);c.fill();c.restore();
    c.strokeStyle='rgba(60,6,10,.85)';c.lineWidth=Math.max(0.08,Rr*0.05);meltBlob(c,x,y,Rr*(0.25+open*0.8),Rr*(0.23+open*0.78),R()*3,(o.seed||1)+6,0.32);c.stroke();
    // bone at the edge of the opening: the broken rim of the skull, splintered ribs, or the shattered shaft of a limb bone
    const ro=Rr*(0.25+open*0.8),kd=o.kind||'';if(open>0.25&&(kd==='head'||kd==='chest'||o.bone)){c.fillStyle='#efe6cf';c.strokeStyle='rgba(120,100,70,.8)';c.lineWidth=Math.max(0.05,Rr*0.025);
      const nb=kd==='head'?9:kd==='chest'?6:5;for(let i=0;i<nb;i++){const a=R()*6.283,a2=a+(kd==='head'?0.35+R()*0.4:0.18+R()*0.2),d0=ro*(0.86+R()*0.12),d1=ro*(1.02+R()*0.12),th=kd==='head'?Rr*0.14:Rr*0.09;
        c.beginPath();c.moveTo(x+Math.cos(a)*d0,y+Math.sin(a)*d0);c.lineTo(x+Math.cos((a+a2)/2)*(d0-th*0.8),y+Math.sin((a+a2)/2)*(d0-th*0.8));c.lineTo(x+Math.cos(a2)*d0,y+Math.sin(a2)*d0);c.lineTo(x+Math.cos(a2)*d1,y+Math.sin(a2)*d1);c.lineTo(x+Math.cos(a)*d1,y+Math.sin(a)*d1);c.closePath();c.fill();c.stroke();}
      if(kd==='head'&&open>0.45){c.fillStyle='rgba(205,150,150,.85)';c.strokeStyle='rgba(130,70,75,.6)';for(let i=0;i<4;i++){const a=R()*6.283,d=ro*0.45*R();c.beginPath();c.ellipse(x+Math.cos(a)*d,y+Math.sin(a)*d,Rr*0.22,Rr*0.13,R()*3,0,6.283);c.fill();c.stroke();}}}}
  else{meltBlob(c,x,y,Rr*0.3,Rr*0.28,R()*3,(o.seed||1)+6,0.35);c.fillStyle='#170305';c.fill();}
  // bone chips when the bone under it is broken
  if(o.bone){c.fillStyle='#efe6cf';c.strokeStyle='rgba(120,100,70,.75)';c.lineWidth=0.06;for(let i=0;i<5;i++){const a=R()*6.283,d=Rr*(0.15+R()*0.5),z=0.18+R()*0.25,t=R()*6.283,px=x+Math.cos(a)*d,py=y+Math.sin(a)*d;c.beginPath();c.moveTo(px+Math.cos(t)*z*1.6,py+Math.sin(t)*z*1.6);c.lineTo(px+Math.cos(t+2.2)*z,py+Math.sin(t+2.2)*z);c.lineTo(px+Math.cos(t+3.8)*z*0.8,py+Math.sin(t+3.8)*z*0.8);c.closePath();c.fill();c.stroke();}}
  // clot crust as it stops bleeding, wet shine while fresh
  if(o.clot>0.05&&!(open>0.05)){c.globalAlpha=0.85*o.clot;c.fillStyle='#2e070a';meltBlob(c,x,y,Rr*0.8,Rr*0.75,0,(o.seed||1)+7,0.25);c.fill();c.globalAlpha=1;}
  else{c.fillStyle='rgba(255,225,225,.3)';c.beginPath();c.ellipse(x-Rr*0.3,y-Rr*0.35,Rr*0.3,Rr*0.12,-0.6,0,6.283);c.fill();c.fillStyle='rgba(255,245,245,.7)';c.beginPath();c.arc(x-Rr*0.34,y-Rr*0.38,Math.max(0.05,Rr*0.06),0,6.283);c.fill();}}
