/* TRAUMA_LAB_MAIN */
/* ===== ui/oplimb.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
/* =========================================================
   COMPLEX SURGERY · the repair-field screen (stitches, bone plates, limb vessels and bullets)
   The body part is laid out straight under drapes, proximal end on the left. Drawing and input only;
   the procedure itself is in sim/oplimb.js.
   ========================================================= */
const OPL_TOOLS={
  suture:[['local','Local','Inject lidocaine around the wound edges'],['irrigate','Irrigate','Tap the wound to wash it out with saline'],['needle','Needle','Drag across the wound, edge to edge, about 1 cm apart']],
  ortho:[['scalpel','Scalpel','Drag along the limb over the break · twice: skin, then muscle'],['retract','Retractor','Tap the incision'],['reduce','Reduce','Drag the broken bone end back into line'],['plate','Plate','Tap over the break'],['drill','Drill','Tap a plate hole'],['screw','Screw','Tap a drilled hole'],['needle','Needle','Retractor out, then drag along the incision to close each layer']],
  explore:[['scalpel','Scalpel','Drag along the limb over the injury · twice'],['retract','Retractor','Tap the incision'],['suction','Suction','Tap the blood'],['clamp','Clamp','Tap just above and just below the tear'],['needle','Needle','Drag across the clamped tear (3 stitches) · or close the incision'],['forceps','Forceps','Drag the bullet out']]};
const OPLUI={on:false,tool:null,p0:null,p1:null,down:false,raf:0,sc:20,ox:0,oy:0,sm:0,cv:null,cx:null,lastT:0,doneT:0,kind:null};
(()=>{const d=document.createElement('div');d.id='opl';d.className='opfov';d.hidden=true;d.setAttribute('role','dialog');d.setAttribute('aria-label','Repair field');
  d.innerHTML=`<div class="opfhd"><b id="oplTitle">Repair</b><span id="oplV" class="opfvit"></span><button id="oplX" class="opfx" title="Leave (the work so far stays)">Leave</button></div>
  <div class="opfstage"><canvas id="oplC" class="opfcv"></canvas><div id="oplNext" class="opfnext"></div><div id="oplMsg" class="opfmsg"></div></div>
  <div class="opftools" id="oplT"></div><div class="opfacts"><button id="oplAn" title="Midazolam + ketamine through his IV line">Anaesthesia</button><button id="oplBl" title="500 mL of matched blood through his IV line">Blood +500</button></div>`;
  document.body.appendChild(d);
  $('oplX').onclick=()=>oplClose();
  $('oplAn').onclick=()=>{if(anaesthetised()){log('He is already under anaesthesia','info');return;}INJ_ROUTE='IV';inject('sedative',0,-120);inject('ketamine',0,-120);inject('ketamine',0,-120);log('Anaesthesia · midazolam 5 mg and ketamine 100 mg into his IV line','good');};
  $('oplBl').onclick=()=>{if(V.blood>=5600){log('Blood volume is full ('+Math.round(V.blood)+' mL)','info');return;}fluids('blood',{x:0,y:-120});};
  const cv=$('oplC');OPLUI.cv=cv;OPLUI.cx=cv.getContext('2d');
  cv.addEventListener('pointerdown',e=>{e.preventDefault();cv.setPointerCapture(e.pointerId);const p=oplW(e);OPLUI.p0=p;OPLUI.p1=p;OPLUI.down=true;if(OPL&&OPLUI.tool==='suction')oplSuction(p.s,p.w);});
  cv.addEventListener('pointermove',e=>{if(OPLUI.down)OPLUI.p1=oplW(e);});
  cv.addEventListener('pointerup',e=>{if(!OPLUI.down)return;OPLUI.down=false;const a=OPLUI.p0,b=oplW(e);OPLUI.p0=OPLUI.p1=null;if(OPL)oplAct(a,b);});
  cv.addEventListener('pointercancel',()=>{OPLUI.down=false;OPLUI.p0=OPLUI.p1=null;});})();
function oplW(e){const r=OPLUI.cv.getBoundingClientRect();return{s:OPLUI.sm+(e.clientX-r.left-OPLUI.ox)/OPLUI.sc,w:(e.clientY-r.top-OPLUI.oy)/OPLUI.sc};}
function oplTool(id){OPLUI.tool=id;$('oplT').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.t===id));const t=(OPL_TOOLS[OPLUI.kind]||[]).find(q=>q[0]===id);if(t)log(t[1]+' · '+t[2],'info');}
function oplAct(a,b){switch(OPLUI.tool){
  case 'local':oplLocal(a.s,a.w);break;case 'irrigate':oplIrrigate(a.s,a.w);break;case 'needle':oplNeedle(a.s,a.w,b.s,b.w);break;
  case 'scalpel':oplScalpel(a.s,a.w,b.s,b.w);break;case 'retract':oplRetract(a.s,a.w);break;case 'reduce':oplReduce(a.s,a.w,b.s,b.w);break;
  case 'plate':oplPlate(a.s,a.w);break;case 'drill':oplDrill(a.s,a.w);break;case 'screw':oplScrew(a.s,a.w);break;
  case 'clamp':oplClamp(a.s,a.w);break;case 'forceps':oplForceps(a.s,a.w,b.s,b.w);break;}}
function oplOpen(){if(!OPL)return;if(typeof opfClose==='function')opfClose(true);closeMenu();OPLUI.on=true;OPLUI.doneT=0;
  if(OPLUI.kind!==OPL.kind){OPLUI.kind=OPL.kind;const T_=OPL_TOOLS[OPL.kind];$('oplT').innerHTML=T_.map(([id,n,tip])=>`<button data-t="${id}" title="${tip}">${n}</button>`).join('');$('oplT').querySelectorAll('button').forEach(b=>b.onclick=()=>oplTool(b.dataset.t));OPLUI.tool=null;}
  $('oplTitle').innerHTML={suture:'Wound repair',ortho:'Bone surgery',explore:'Exploration'}[OPL.kind]+'<small>'+OPL.seg.label.toLowerCase()+'</small>';
  $('opl').hidden=false;document.body.classList.add('opfon');oplTool(OPLUI.tool||OPL_TOOLS[OPL.kind][0][0]);oplSize();if(!OPLUI.raf)OPLUI.raf=requestAnimationFrame(oplFrame);}
function oplClose(hard){OPLUI.on=false;OPLUI.down=false;const d=$('opl');if(d)d.hidden=true;if(!(OPFUI&&OPFUI.on))document.body.classList.remove('opfon');if(OPLUI.raf){cancelAnimationFrame(OPLUI.raf);OPLUI.raf=0;}if(!hard&&OPL&&OPL.done)OPL=null;}
function oplSize(){const cv=OPLUI.cv,r=cv.parentElement.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);cv.width=Math.max(10,Math.round(r.width*dpr));cv.height=Math.max(10,Math.round(r.height*dpr));cv.style.width=r.width+'px';cv.style.height=r.height+'px';OPLUI.dpr=dpr;
  if(!OPL)return;let rm=0;for(let s=Math.max(0,OPL.s0);s<=Math.min(OPL.seg.len,OPL.s1);s+=1)rm=Math.max(rm,oplR(s));
  // the part runs across the screen; a hand is shown bigger than a thigh, capped so a fingertip is not a billboard
  const L=OPL.s1-OPL.s0,sc=Math.min(r.width/L,(r.height-90)/(2*rm+4),46);OPLUI.sc=sc;OPLUI.sm=(OPL.s0+OPL.s1)/2;OPLUI.ox=r.width/2;OPLUI.oy=(r.height-90)/2+44-clamp(OPL.wc||0,-rm*0.6,rm*0.6)*sc;OPLUI.rm=rm;}
addEventListener('resize',()=>{if(OPLUI.on)oplSize();});
function oplNext(){if(!OPL)return'';const K=OPL.kind;if(OPL.done)return K==='suture'?'Wound closed':'Operation finished';
  if(K==='suture'){if(!OPL.numb&&!anaesthetised())return'Local · inject around the wound edges';if(!OPL.clean)return'Irrigate · tap the wound';return'Needle · drag across the wound, edge to edge · '+OPL.n+'/'+OPL.need;}
  if(!anaesthetised()&&!V.dead)return'He is awake · give Anaesthesia first';
  if(!OPL.inc)return'Scalpel · drag along the limb over the injury (dashed ring)';
  if(OPL.fixed||(K==='explore'&&!oplBleeders().some(b=>oplReach(b.s,b.w))&&!LODGED.some(L=>L.seg===OPL.seg&&oplReach(L.s,L.w))&&OPL.depth>=2&&OPL.open)){return OPL.open?'Retractor · tap to take it out, then close':'Needle · drag along the incision to close ('+(OPL.depth>1?'fascia':'skin')+')';}
  if(!OPL.open&&OPL.depth<2)return'Scalpel · again along the same line';
  if(!OPL.open)return OPL.depth<2?'Scalpel · again':'Retractor · tap the incision';
  if(OPL.depth<2)return'Scalpel · again along the same line';
  if(K==='ortho'){if(!OPL.reduced)return'Reduce · drag the displaced bone end back into line';if(!OPL.holes)return'Plate · tap over the break';const h=OPL.holes.find(q=>!q.drilled);if(h)return'Drill · tap each plate hole ('+OPL.holes.filter(q=>q.drilled).length+'/6)';return'Screw · tap each drilled hole ('+OPL.holes.filter(q=>q.screw).length+'/6)';}
  if(OPL.pool>0.6)return'Suction · tap the blood';
  const b=oplBleeders().find(q=>oplReach(q.s,q.w));if(b){const c=OPL.clamps.find(q=>q.v===b.v);if(!(c&&c.p&&c.d))return'Clamp · just above and just below the tear';return'Needle · stitch across the tear (3)';}
  return'Forceps · drag the bullet out';}
function oplFrame(now){OPLUI.raf=0;if(!OPLUI.on)return;const dt=Math.min(0.05,((now||0)-(OPLUI.lastT||now||0))/1000)||0;OPLUI.lastT=now;
  oplDraw();
  $('oplV').innerHTML=`<i class="hr">♥ ${Math.round(V.hr)}</i><i class="bp">${Math.round(V.sys)}</i><i class="sp">SpO₂ ${Math.round(V.spo2)}%</i><i class="bl">${Math.round(V.blood)} mL</i><i class="${anaesthetised()||(OPL&&OPL.numb>=1)?'ok':'bad'}">${anaesthetised()?'asleep':OPL&&OPL.numb>=1?'numb':'AWAKE'}</i>`;
  $('oplNext').textContent=oplNext();const m=LOG[LOG.length-1],mm=$('oplMsg');if(m&&performance.now()-m.t<6000){mm.textContent=m.text;mm.className='opfmsg '+(m.cls||'');mm.hidden=false;}else mm.hidden=true;
  if(!OPL){oplClose(true);return;}
  if(OPL.done){OPLUI.doneT+=dt;if(OPLUI.doneT>2.2){oplClose();return;}}
  OPLUI.raf=requestAnimationFrame(oplFrame);}
function oplDraw(){const cv=OPLUI.cv,c=OPLUI.cx,d=OPLUI.dpr||1,sc=OPLUI.sc;
  c.setTransform(1,0,0,1,0,0);c.fillStyle='#16241f';c.fillRect(0,0,cv.width,cv.height);if(!OPL)return;
  c.setTransform(sc*d,0,0,sc*d,(OPLUI.ox-OPLUI.sm*sc)*d,OPLUI.oy*d);
  const g=OPL.seg,a=OPL.s0,b=OPL.s1,rm=OPLUI.rm||g.ra;
  // the limb: skin, with the cut ends of the drape at the joints
  const band=(k)=>{c.beginPath();for(let s=a;s<=b+0.01;s+=0.5)c.lineTo(s,-oplR(s)*k);for(let s=b;s>=a-0.01;s-=0.5)c.lineTo(s,oplR(s)*k);c.closePath();};
  band(1);c.fillStyle=rgb(skinTone(false));c.fill();
  c.fillStyle='rgba(90,40,30,.18)';band(1);c.save();c.clip();c.fillRect(a,rm*0.55,b-a,rm);c.restore();          // shading: the limb is round
  c.fillStyle='rgba(150,78,18,.25)';band(1);c.fill();                                                              // iodine prep
  const wa=Math.max(a,OPL.s0+1),wb=Math.min(b,OPL.s1-1);
  c.save();c.beginPath();c.rect(OPL.s0-50,-200,OPL.s1-OPL.s0+100,400);c.rect(wa,-rm-1.2,wb-wa,2*rm+2.4);c.fillStyle='#2f6b5c';c.fill('evenodd');
  c.strokeStyle='rgba(255,255,255,.07)';c.lineWidth=0.08;for(let x=OPL.s0-30;x<OPL.s1+30;x+=1.2){c.beginPath();c.moveTo(x,-60);c.lineTo(x+1.5,60);c.stroke();}c.restore();
  c.lineCap='round';c.lineJoin='round';
  // every other wound on this part, where it really is
  for(const wd of g.wounds){if(wd===OPL.wd||wd===OPL.wdInc||wd.type==='burn'||!openWound(wd))continue;const cc=woundCenter(wd);if(cc.s<wa||cc.s>wb)continue;const sut=wd.sut>=1;
    if(wd.type==='cut'){c.strokeStyle=sut?'#7a3a3a':'#5a0a10';c.lineWidth=sut?0.12:0.35;c.beginPath();c.moveTo(wd.s,wd.w);c.lineTo(wd.s2,wd.w2);c.stroke();if(sut){c.strokeStyle='#1d2b54';c.lineWidth=0.06;const n=Math.max(2,Math.round(Math.hypot(wd.s2-wd.s,wd.w2-wd.w)));for(let i=0;i<n;i++){const t=(i+0.5)/n;c.beginPath();c.moveTo(lerp(wd.s,wd.s2,t),lerp(wd.w,wd.w2,t)-0.4);c.lineTo(lerp(wd.s,wd.s2,t),lerp(wd.w,wd.w2,t)+0.4);c.stroke();}}}
    else{const r=sut?(wd.r||0.6)*0.5:(wd.r||0.6)+0.15;c.fillStyle=sut?'rgba(120,40,45,.6)':'#4d0a0e';c.beginPath();c.arc(cc.s,cc.w,r,0,6.283);c.fill();if(!sut&&!wd.band){c.fillStyle='rgba(140,10,20,.5)';c.beginPath();c.ellipse(cc.s,cc.w+r*0.9,r*0.5,r*0.9,0,0,6.283);c.fill();}}}
  if(OPL.kind==='suture')oplDrawWound(c);else oplDrawOpen(c);
  // drag preview
  if(OPLUI.down&&OPLUI.p0&&OPLUI.p1){const p=OPLUI.p0,q=OPLUI.p1;c.strokeStyle={scalpel:'#e8f0f6',needle:'#59c7ff',reduce:'#ffd34d',forceps:'#c9d3dc'}[OPLUI.tool]||'#fff';c.lineWidth=0.08;c.setLineDash(OPLUI.tool==='needle'?[0.25,0.15]:[]);c.beginPath();c.moveTo(p.s,p.w);c.lineTo(q.s,q.w);c.stroke();c.setLineDash([]);}}
function oplDrawWound(c){const wd=OPL.wd,cc=OPL.c;
  if(OPL.numb>0){const g=c.createRadialGradient(cc.s,cc.w,0,cc.s,cc.w,(wd.len||2)/2+2.5);g.addColorStop(0,`rgba(255,240,230,${0.35*OPL.numb})`);g.addColorStop(1,'rgba(255,240,230,0)');c.fillStyle=g;c.beginPath();c.arc(cc.s,cc.w,(wd.len||2)/2+2.5,0,6.283);c.fill();}
  const left=1-OPL.n/OPL.need;
  if(wd.type==='cut'){const gap=(0.18+0.35*(wd.r||0.4))*left+0.04;c.strokeStyle='#5a0a10';c.lineWidth=gap*2;c.beginPath();c.moveTo(wd.s,wd.w);c.lineTo(wd.s2,wd.w2);c.stroke();c.strokeStyle='#8e1f27';c.lineWidth=gap;c.stroke();
    if(!OPL.clean){c.fillStyle='rgba(70,40,20,.75)';for(let i=0;i<9;i++){const t=(i*0.37)%1;c.beginPath();c.arc(lerp(wd.s,wd.s2,t)+Math.sin(i*7)*0.3,lerp(wd.w,wd.w2,t)+Math.cos(i*5)*0.35,0.09,0,6.283);c.fill();}}}
  else{const r=(wd.r||1)*(0.35+0.65*left);c.fillStyle='#4d0a0e';c.beginPath();c.arc(cc.s,cc.w,r+0.15,0,6.283);c.fill();c.fillStyle='#7a1018';c.beginPath();c.arc(cc.s,cc.w,r*0.7,0,6.283);c.fill();}
  for(const q of OPL.stitches){const dx=q.s2-q.s1,dy=q.w2-q.w1,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,h=0.55;c.strokeStyle='#1d2b54';c.lineWidth=0.07;c.beginPath();c.moveTo(q.s-ux*h,q.w-uy*h);c.lineTo(q.s+ux*h,q.w+uy*h);c.stroke();c.fillStyle='#1d2b54';c.beginPath();c.arc(q.s+uy*0.15,q.w-ux*0.15,0.09,0,6.283);c.fill();}}
function oplDrawOpen(c){const I=OPL.inc,E=oplEll();
  if(!I){c.strokeStyle='rgba(255,211,77,.9)';c.lineWidth=0.08;c.setLineDash([0.3,0.2]);c.beginPath();c.arc(OPL.fs,OPL.fw,2.2,0,6.283);c.stroke();c.setLineDash([]);return;}
  if(!OPL.open){c.strokeStyle=OPL.depth>=2?'#5a0a10':'#8a1a20';c.lineWidth=0.12+OPL.depth*0.07;c.beginPath();c.moveTo(I.s1,OPL.incW);c.lineTo(I.s2,OPL.incW);c.stroke();
    if(OPL.done){const n=Math.max(2,Math.round((I.s2-I.s1)/0.8));c.strokeStyle='#1d2b54';c.lineWidth=0.07;for(let i=0;i<=n;i++){const s=lerp(I.s1,I.s2,i/n);c.beginPath();c.moveTo(s,OPL.incW-0.4);c.lineTo(s,OPL.incW+0.4);c.stroke();}}
    else if(OPL.fixed||OPL.depth<2&&OPL.n){}
    return;}
  const ring=(ka,kb,col)=>{c.beginPath();c.ellipse(E.ms,OPL.incW,E.ra*ka,E.rb*kb,0,0,6.283);c.fillStyle=col;c.fill();};
  ring(1.02,1.15,'#b9575a');ring(0.98,1,'#e2c062');ring(0.94,0.86,'#8a2a2f');
  c.save();c.beginPath();c.ellipse(E.ms,OPL.incW,E.ra*0.94,E.rb*0.86,0,0,6.283);c.clip();
  // muscle fibres
  c.strokeStyle='rgba(255,170,160,.12)';c.lineWidth=0.06;for(let w=-6;w<6;w+=0.35){c.beginPath();c.moveTo(E.ms-E.ra,OPL.incW+w);c.lineTo(E.ms+E.ra,OPL.incW+w+0.3);c.stroke();}
  if(OPL.depth>=2){
    if(OPL.kind==='ortho'){const bw=Math.max(0.6,OPL.bw||1.2)*0.9,fs=OPL.fs,fw=OPL.fw,off=OPL.reduced||OPL.fixed?0:bw*0.45,ang=OPL.reduced||OPL.fixed?0:0.12;
      const bone=(s0,s1,dy,rot)=>{c.save();c.translate(fs,fw+dy);c.rotate(rot);c.fillStyle='#ece3cb';c.strokeStyle='#a8987a';c.lineWidth=0.06;c.beginPath();c.moveTo(s0-fs,-bw/2);c.lineTo(s1-fs,-bw/2);
        // jagged break edge
        const jag=s1===fs?[[0,-bw/2],[0.25,-bw/4],[-0.15,0],[0.2,bw/4],[0,bw/2]]:null;if(jag){for(const p of jag)c.lineTo(p[0],p[1]);}else c.lineTo(s1-fs,bw/2);
        c.lineTo(s0-fs,bw/2);if(s0===fs){for(const p of [[0,bw/2],[0.2,bw/4],[-0.15,0],[0.25,-bw/4],[0,-bw/2]])c.lineTo(p[0]+0.12,p[1]);}c.closePath();c.fill();c.stroke();c.restore();};
      bone(fs-20,fs,0,0);bone(fs,fs+20,off,ang);
      if(OPL.holes){const h0=OPL.holes[0].s-OPL.plateSp*0.6,h1=OPL.holes[5].s+OPL.plateSp*0.6;c.fillStyle='#b8c2cc';c.strokeStyle='#5f6b76';c.lineWidth=0.05;c.beginPath();c.roundRect?c.roundRect(h0,fw-bw*0.3,h1-h0,bw*0.6,bw*0.25):c.rect(h0,fw-bw*0.3,h1-h0,bw*0.6);c.fill();c.stroke();
        for(const h of OPL.holes){c.fillStyle=h.screw?'#dfe5ea':h.drilled?'#2a2a2a':'#8b959f';c.beginPath();c.arc(h.s,fw,bw*0.18,0,6.283);c.fill();if(h.screw){c.strokeStyle='#5f6b76';c.lineWidth=0.04;c.beginPath();c.moveTo(h.s-bw*0.1,fw);c.lineTo(h.s+bw*0.1,fw);c.moveTo(h.s,fw-bw*0.1);c.lineTo(h.s,fw+bw*0.1);c.stroke();}}}}
    else{for(const v of OPL.seg.vessels){const col=v.type==='a'?'#d8202c':'#4752b4',wv=Math.max(0.3,v.width||0.5);const at=v.cut>0&&!v.lig?(v.at||{s:v.pts[0][0],w:v.pts[0][1]}):null;
        c.strokeStyle=col;c.lineWidth=wv;c.beginPath();v.pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();
        if(at){const cl=OPL.clamps.find(q=>q.v===v);c.fillStyle='#2a0508';c.beginPath();c.ellipse(at.s,at.w??0,0.35,wv*0.75,0,0,6.283);c.fill();
          if(!v.clamp){const pu=0.5+0.5*Math.sin(performance.now()/(v.type==='a'?140:400));c.fillStyle=`rgba(255,40,50,${0.4+0.4*pu})`;c.beginPath();c.arc(at.s,at.w??0,0.25+0.2*pu,0,6.283);c.fill();}
          for(const [k,dx] of [['p',-1.3],['d',1.3]])if(cl&&cl[k])oplClampArt(c,at.s+dx,at.w??0);
          const n=OPL['v'+v.id]||0;c.strokeStyle='#59c7ff';c.lineWidth=0.06;for(let i=0;i<n;i++){const s=at.s-0.2+i*0.2;c.beginPath();c.moveTo(s,(at.w??0)-wv*0.7);c.lineTo(s,(at.w??0)+wv*0.7);c.stroke();}}}
      for(const L of LODGED){if(L.seg!==OPL.seg)continue;c.fillStyle='#9aa0a6';c.strokeStyle='#3d4247';c.lineWidth=0.05;c.beginPath();c.ellipse(L.s,L.w,0.45,0.3,0.4,0,6.283);c.fill();c.stroke();}}
    if(OPL.pool>0.01){c.fillStyle=`rgba(112,6,14,${clamp(OPL.pool,0,0.95)})`;c.fillRect(E.ms-E.ra,OPL.incW-E.rb,E.ra*2,E.rb*2);}}
  c.restore();
  // retractor blades
  c.fillStyle='#b8c2cc';c.strokeStyle='#5f6b76';c.lineWidth=0.06;for(const sg of [-1,1]){c.beginPath();c.rect(E.ms-E.ra*0.35,OPL.incW+sg*(E.rb+0.1)-(sg>0?0:0.5),E.ra*0.7,0.5);c.fill();c.stroke();c.beginPath();c.rect(E.ms-0.3,OPL.incW+sg*(E.rb+0.6)-(sg>0?0:2.5),0.6,2.5);c.fill();c.stroke();}}
function oplClampArt(c,x,y){c.save();c.translate(x,y);c.rotate(-1.2);c.strokeStyle='#d6dde3';c.lineWidth=0.1;c.beginPath();c.moveTo(-0.5,0);c.lineTo(2,0);c.moveTo(-0.5,0.18);c.lineTo(2,0.3);c.stroke();c.beginPath();c.arc(2.3,0.05,0.28,0,6.283);c.arc(2.4,0.7,0.28,0,6.283);c.stroke();c.restore();}
