/* TRAUMA_LAB_MAIN */
/* ===== ui/opfield.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
/* =========================================================
   COMPLEX SURGERY · the operating-field screen
   A close-up of his chest and belly under sterile drapes. Pick an instrument, then drag or tap on the field.
   The simulation lives in sim/opfield.js; this file only draws it and turns pointer input into instrument actions.
   ========================================================= */
const OPF_TOOLS=[
  ['scalpel','Scalpel','Drag along the skin to cut · drag again along the same line to go one layer deeper'],
  ['saw','Sternal saw','Drag straight down the middle of the breastbone'],
  ['retract','Retractor','Tap the incision to spread it open (tap again to take it out)'],
  ['suction','Suction','Tap the blood once: the sucker clears it and sponges are packed around the field'],
  ['clamp','Clamp','Tap a bleeding vessel or a marked pedicle point'],
  ['scissors','Scissors','Tap a clamped pedicle point to divide it'],
  ['needle','Needle','Drag across a clamped vessel, a torn organ or a donor connection · with the retractor out, drag along the incision to close a layer'],
  ['forceps','Forceps','Drag a bullet or a freed organ out of the cavity'],
];
const OPFUI={on:false,tool:'scalpel',p0:null,p1:null,down:false,raf:0,sc:8,ox:0,oy:0,cv:null,cx:null,lastT:0,doneT:0};
(()=>{const d=document.createElement('div');d.id='opf';d.className='opfov';d.hidden=true;d.setAttribute('role','dialog');d.setAttribute('aria-label','Operating field');
  d.innerHTML=`<div class="opfhd"><b>Operating field</b><span id="opfV" class="opfvit"></span><button id="opfX" class="opfx" title="Leave the field (the operation stays as it is)">Leave</button></div>
  <div class="opfstage"><canvas id="opfC" class="opfcv"></canvas><div id="opfNext" class="opfnext"></div><div id="opfMsg" class="opfmsg"></div></div>
  <div class="opftools" id="opfT"></div><div class="opfacts" id="opfA"></div>`;
  document.body.appendChild(d);
  let h='';for(const [id,n,tip] of OPF_TOOLS)h+=`<button data-t="${id}" title="${tip}">${n}</button>`;$('opfT').innerHTML=h;
  $('opfA').innerHTML=`<button id="opfAn" title="Midazolam + ketamine through his IV line">Anaesthesia</button><button id="opfBy">Bypass</button><button id="opfDn">Donor organ</button><button id="opfBl" title="Rapid infuser: 500 mL of matched blood through his IV line">Blood +500</button><button id="opfSh" title="Internal paddles on the heart">Shock</button>`;
  $('opfT').querySelectorAll('button').forEach(b=>b.onclick=()=>opfTool(b.dataset.t));
  $('opfX').onclick=()=>opfClose();
  $('opfAn').onclick=()=>{if(anaesthetised()){log('He is already under anaesthesia','info');return;}INJ_ROUTE='IV';inject('sedative',0,-120);inject('ketamine',0,-120);inject('ketamine',0,-120);log('Anaesthesia · midazolam 5 mg and ketamine 100 mg (≈1.4 mg/kg) into his IV line · wait for him to go under','good');};
  $('opfBl').onclick=()=>{if(V.blood>=5600){log('Blood volume is full ('+Math.round(V.blood)+' mL) · more would overload his heart','info');return;}fluids('blood',{x:0,y:-120});};
  $('opfBy').onclick=()=>{opfBypass();opfButtons();};
  $('opfSh').onclick=()=>{if(!(OPF&&OPF.open>0.5&&OPF.depth>=4&&OPF.saw)){log('Internal paddles need the chest open · use the defibrillator on the skin instead','info');return;}if(ORG.heart.removed){log('There is no heart to shock','bad');return;}defib();};
  $('opfDn').onclick=()=>{const L=Object.keys(OPF_PED).filter(id=>OPF&&OPF.removed[id]&&!OPF.donor[id]);if(!L.length){log('Remove a damaged organ first, then place the donor','info');return;}opfDonor(L[0]);};
  const cv=$('opfC');OPFUI.cv=cv;OPFUI.cx=cv.getContext('2d');
  cv.addEventListener('pointerdown',e=>{e.preventDefault();cv.setPointerCapture(e.pointerId);const p=opfW(e);OPFUI.p0=p;OPFUI.p1=p;OPFUI.down=true;if(OPFUI.tool==='suction'&&OPF){opfSuction(p.x,p.y);}});
  cv.addEventListener('pointermove',e=>{if(!OPFUI.down)return;OPFUI.p1=opfW(e);});
  const up=e=>{if(!OPFUI.down)return;OPFUI.down=false;const a=OPFUI.p0,b=opfW(e);OPFUI.p0=OPFUI.p1=null;if(!OPF)return;opfAct(a,b);opfButtons();};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',()=>{OPFUI.down=false;OPFUI.p0=OPFUI.p1=null;});})();
function opfW(e){const r=OPFUI.cv.getBoundingClientRect();return{x:(e.clientX-r.left-OPFUI.ox)/OPFUI.sc,y:(e.clientY-r.top-OPFUI.oy)/OPFUI.sc};}
function opfTool(id){OPFUI.tool=id;$('opfT').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.t===id));const t=OPF_TOOLS.find(q=>q[0]===id);if(t)log(t[1]+' · '+t[2],'info');}
function opfAct(a,b){const t=OPFUI.tool;
  switch(t){
    case 'scalpel':opfScalpel(a.x,a.y,b.x,b.y);break;
    case 'saw':opfSaw(a.x,a.y,b.x,b.y);break;
    case 'retract':opfRetract(a.x,a.y);break;
    case 'clamp':opfClamp(a.x,a.y);break;
    case 'scissors':opfScissors(a.x,a.y);break;
    case 'needle':opfNeedle(a.x,a.y,b.x,b.y);break;
    case 'forceps':opfForceps(a.x,a.y,b.x,b.y);break;}}
function opfButtons(){$('opfBy').setAttribute('aria-pressed',!!V.bypass);$('opfBy').textContent=V.bypass?'Bypass ON':'Bypass';
  const dn=OPF&&Object.keys(OPF_PED).some(id=>OPF.removed[id]&&!OPF.donor[id]);$('opfDn').disabled=!dn;}
// open the field: from the Surgery tool in complex mode
function opfOpen(){if(typeof oplClose==='function')oplClose(true);if(!OPF)opfStart();OPFUI.on=true;OPFUI.doneT=0;$('opf').hidden=false;document.body.classList.add('opfon');closeMenu&&closeMenu();opfTool(OPFUI.tool);opfButtons();opfSize();
  if(!OPFUI.raf)OPFUI.raf=requestAnimationFrame(opfFrame);}
function opfClose(hard){OPFUI.on=false;OPFUI.down=false;const d=$('opf');if(d)d.hidden=true;document.body.classList.remove('opfon');if(OPFUI.raf){cancelAnimationFrame(OPFUI.raf);OPFUI.raf=0;}
  if(!hard&&OPF&&OPF.done){OPF=null;}}
function opfSize(){const cv=OPFUI.cv,r=cv.parentElement.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);cv.width=Math.max(10,Math.round(r.width*dpr));cv.height=Math.max(10,Math.round(r.height*dpr));cv.style.width=r.width+'px';cv.style.height=r.height+'px';
  // the field: the sterile window, x −16…16 cm, y −150…−82 cm (collarbones to pubis)
  const W=r.width,H=r.height,sc=Math.min(W/38,(H-64)/68);OPFUI.sc=sc;OPFUI.ox=W/2;OPFUI.oy=(H-64)/2+30+116*sc;OPFUI.dpr=dpr;}
addEventListener('resize',()=>{if(OPFUI.on)opfSize();});
// what to do next, read from the state of the operation
function opfNext(){if(!OPF)return'';const I=OPF.inc,chest=I&&chestPart((I.y1+I.y2)/2);
  if(OPF.done)return'Operation finished';
  if(!anaesthetised()&&!V.dead)return'He is awake · give Anaesthesia first';
  if(!I)return'Scalpel · drag a line on the skin: down the middle of the chest for the heart, down the middle of the belly for the abdomen';
  if(OPF.open<0.5&&OPF.depth>0&&(OPF.closing||OPF.wired))return'Needle · drag along the incision to close the next layer';
  if(OPF.depth<3)return'Scalpel · again along the same line ('+OPF_DEPTH[OPF.depth+1]+')';
  if(OPF.depth===3&&chest&&crossesMid()&&!OPF.saw)return'Sternal saw · drag straight down the breastbone';
  if(OPF.depth===3&&!chest)return'Scalpel · once more to open the peritoneum';
  if(OPF.open<0.5)return'Retractor · tap the incision to spread it';
  if(OPF.pool>0.6)return'Suction · tap the blood';
  const bl=opfBleeders().filter(b=>reach(b.x,b.y));if(bl.some(b=>!b.v.clamp))return'Clamp the bleeding vessel (red pulse)';if(bl.length)return'Needle · three stitches across the clamped vessel';
  for(const id in FORG){const o=ORG[id];if(o&&!o.removed&&!o.rep&&o.hp<100&&o.ib&&reach(FORG[id][0],FORG[id][1]))return'Needle · stitch across the torn '+o.name.toLowerCase();}
  if(LODGED.some(L=>(L.seg===SEG.chest||L.seg===SEG.abd)&&(()=>{const p=frontPos(L.seg,L.s,clamp(L.z||0,-1,1));return p&&reach(p.x,p.y);})()))return'Forceps · drag the bullet out';
  for(const id in OPF.donor)return'Needle · sew each donor connection (blue rings)';
  if(OPF.removed.heart&&!OPF.donor.heart)return'Donor organ · place the new heart';
  if(V.arrest&&V.bypass&&!ORG.heart.removed)return'Shock · restart the heart, then switch the bypass off';
  if(chest&&!V.bypass&&OPF.saw)return'Bypass · before you take the heart out · or close: Retractor off, then Needle';
  return'To take an organ out: Clamp each yellow point, Scissors, then Forceps · or close: Retractor off, then Needle';}
/* ---------- drawing ---------- */
function opfFrame(now){OPFUI.raf=0;if(!OPFUI.on)return;const dt=Math.min(0.05,((now||0)-(OPFUI.lastT||now||0))/1000)||0;OPFUI.lastT=now;
  opfDraw();opfButtons();
  const v=$('opfV');if(v)v.innerHTML=`<i class="hr">♥ ${Math.round(V.hr)}</i><i class="bp">${V.bypass?'MAP ':''}${Math.round(V.sys)}</i><i class="sp">SpO₂ ${Math.round(V.spo2)}%</i><i class="bl">${Math.round(V.blood)} mL</i><i class="${anaesthetised()?'ok':'bad'}">${anaesthetised()?'asleep':'AWAKE'}</i>`;
  $('opfNext').textContent=opfNext();const m=LOG[LOG.length-1];const mm=$('opfMsg');if(m&&performance.now()-m.t<6000){mm.textContent=m.text;mm.className='opfmsg '+(m.cls||'');mm.hidden=false;}else mm.hidden=true;
  if(OPF&&OPF.done){OPFUI.doneT+=dt;if(OPFUI.doneT>2.2){opfClose();return;}}
  OPFUI.raf=requestAnimationFrame(opfFrame);}
function opfDraw(){const cv=OPFUI.cv,c=OPFUI.cx,d=OPFUI.dpr||1,sc=OPFUI.sc;
  c.setTransform(1,0,0,1,0,0);c.fillStyle='#16241f';c.fillRect(0,0,cv.width,cv.height);
  c.setTransform(sc*d,0,0,sc*d,OPFUI.ox*d,OPFUI.oy*d);
  // the torso skin
  const tone=skinTone(false),torso=(k)=>{c.beginPath();for(let y=-153;y<=-78;y++)c.lineTo(torsoHW(y)*(k||1),y);for(let y=-78;y>=-153;y--)c.lineTo(-torsoHW(y)*(k||1),y);c.closePath();};
  torso();c.fillStyle=rgb(tone);c.fill();
  // iodine prep on the sterile window
  c.fillStyle='rgba(150,78,18,.28)';c.fillRect(-16,-149,32,66);
  // drapes: everything but the window
  c.save();c.beginPath();c.rect(-60,-200,120,160);c.rect(-15,-148,30,64);c.fillStyle='#2f6b5c';c.fill('evenodd');
  c.strokeStyle='rgba(255,255,255,.08)';c.lineWidth=0.25;for(let x=-58;x<60;x+=3){c.beginPath();c.moveTo(x,-200);c.lineTo(x+4,-40);c.stroke();}
  c.strokeStyle='#244f45';c.lineWidth=0.6;c.strokeRect(-15,-148,30,64);c.restore();
  if(!OPF)return;
  // his wounds on the chest and belly, and where the damage inside is (dashed rings) so you know where to open
  const drawn=new Set();
  for(const f of FW){if(!(f.seg===SEG.chest||f.seg===SEG.abd)||!f.seg.connected)continue;drawn.add(f.ref);opfSkinWound(c,f.type,f.x,f.y,f.x2,f.y2,f.r,f.ref&&f.ref.sut>=1);}
  for(const seg of [SEG.chest,SEG.abd])for(const wd of seg.wounds){if(drawn.has(wd)||wd===OPF.wd||wd.type==='burn'||!openWound(wd))continue;const cc=woundCenter(wd);const p=frontPos(seg,cc.s,clamp(wd.z==null?0.85:wd.z,-1,1));if(!p)continue;
    if(wd.type==='cut'){const q=frontPos(seg,wd.s2,clamp(wd.z==null?0.85:wd.z,-1,1)),p0=frontPos(seg,wd.s,clamp(wd.z==null?0.85:wd.z,-1,1));if(p0&&q)opfSkinWound(c,'cut',p0.x,p0.y,q.x+(wd.len&&Math.abs(q.y-p0.y)<1?wd.len:0),q.y,wd.r||0.4,wd.sut>=1);}else opfSkinWound(c,'hole',p.x,p.y,0,0,wd.r||0.6,wd.sut>=1);}
  if(!(OPF.open>0.5&&OPF.depth>=4)){c.strokeStyle='rgba(255,211,77,.85)';c.lineWidth=0.22;c.setLineDash([0.7,0.45]);
    for(const id in FORG){const o=ORG[id];if(!o||o.removed||o.rep||!(o.hp<100)||!o.ib||!(o.seg===SEG.chest||o.seg===SEG.abd))continue;const f=FORG[id];c.beginPath();c.ellipse(f[0],f[1],f[2]*0.8+1,f[3]*0.8+1,0,0,6.283);c.stroke();}
    for(const L of LODGED){if(L.seg!==SEG.chest&&L.seg!==SEG.abd)continue;const p=frontPos(L.seg,L.s,clamp(L.z||0,-1,1));if(p){c.beginPath();c.arc(p.x,p.y,1.6,0,6.283);c.stroke();}}
    c.setLineDash([]);}
  const I=OPF.inc,E=opfEll();
  if(I){
    if(OPF.open>0.5&&E){c.save();c.translate(E.mx,E.my);c.rotate(E.a);
      const ring=(ka,kb,col)=>{c.beginPath();c.ellipse(0,0,E.ra*ka,E.rb*kb,0,0,6.283);c.fillStyle=col;c.fill();};
      ring(1.02,1.12,'#b9575a');                                   // cut skin edge (dermis)
      if(OPF.depth>=2)ring(0.98,0.98,'#e2c062');                     // subcutaneous fat
      if(OPF.depth>=3)ring(0.94,0.86,'#8a2a2f');                     // muscle / fascia
      if(OPF.depth>=4){ring(0.9,0.76,'#3a0d12');}
      c.restore();
      if(OPF.depth>=4){c.save();c.translate(E.mx,E.my);c.rotate(E.a);c.beginPath();c.ellipse(0,0,E.ra*0.9,E.rb*0.76,0,0,6.283);c.restore();c.save();c.clip();
        c.fillStyle='#3a0d12';c.fillRect(-30,-160,60,90);
        drawFrontVessels(c,false);drawFrontOrgans(c,false); // seen from the front the organs lie over the great vessels
        // empty bed where an organ was taken out, and donor organs waiting to be sewn in
        for(const id in OPF.removed){if(!OPF.removed[id])continue;const f=FORG[id];c.fillStyle='rgba(20,2,5,.85)';c.beginPath();c.ellipse(f[0],f[1],f[2]*0.95,f[3]*0.95,0,0,6.283);c.fill();
          if(OPF.donor[id]){c.save();c.translate(f[0],f[1]);c.globalAlpha=0.9;if(id==='heart')heartFrontArt(c,0,true);else{const o=ORG[id],t=o.out,h=o.hp,r=o.removed;o.out=0;o.hp=100;drawOrgan(c,o,0,0,f[2],f[3],0,true,{zc:0,zr:1});o.out=t;o.hp=h;o.removed=r;}c.restore();}}
        if(OPF.saw){c.fillStyle='#ece3cb';c.strokeStyle='rgba(150,135,105,.9)';c.lineWidth=0.15;for(const sg of [-1,1]){c.save();c.translate(E.mx,E.my);c.rotate(E.a);c.beginPath();c.ellipse(0,sg*E.rb*0.72,E.ra*0.8,0.9,0,0,6.283);c.fill();c.stroke();c.restore();}}
        // blood in the field
        if(OPF.pool>0.01){c.fillStyle=`rgba(112,6,14,${clamp(OPF.pool*1.05,0,0.96)})`;c.fillRect(-30,-160,60,90);c.fillStyle=`rgba(255,120,120,${0.12*OPF.pool})`;c.beginPath();c.ellipse(E.mx-E.ra*0.2,E.my-1,E.ra*0.3,0.6,E.a,0,6.283);c.fill();}
        c.restore();}
      // retractor blades
      c.save();c.translate(E.mx,E.my);c.rotate(E.a);c.fillStyle='#b8c2cc';c.strokeStyle='#5f6b76';c.lineWidth=0.18;
      for(const sg of [-1,1]){c.beginPath();c.rect(-E.ra*0.45,sg*(E.rb+0.2)-(sg>0?0:1.1),E.ra*0.9,1.1);c.fill();c.stroke();c.beginPath();c.rect(-0.7,sg*(E.rb+1.3)-(sg>0?0:5),1.4,5);c.fill();c.stroke();}
      c.restore();}
    else{ // closed or not yet retracted: a slit, darker with each layer; sutures once closed
      c.strokeStyle=OPF.depth>=3?'#5a0a10':'#8a1a20';c.lineWidth=0.25+OPF.depth*0.13;c.lineCap='round';c.beginPath();c.moveTo(I.x1,I.y1);c.lineTo(I.x2,I.y2);c.stroke();
      if(OPF.depth>=2){c.strokeStyle='#e2c062';c.lineWidth=0.12;c.beginPath();c.moveTo(I.x1,I.y1);c.lineTo(I.x2,I.y2);c.stroke();}
      if(OPF.done||OPF.closing){const n=Math.max(2,Math.round(I.len/1.2)),a=Math.atan2(I.y2-I.y1,I.x2-I.x1),nx=-Math.sin(a),ny=Math.cos(a);c.strokeStyle=OPF.done?'#1d2b54':'rgba(29,43,84,.5)';c.lineWidth=0.14;
        for(let i=0;i<=n;i++){const x=lerp(I.x1,I.x2,i/n),y=lerp(I.y1,I.y2,i/n);c.beginPath();c.moveTo(x-nx*0.7,y-ny*0.7);c.lineTo(x+nx*0.7,y+ny*0.7);c.stroke();}}}
  }
  // bypass cannulae: arterial return into the ascending aorta, venous drainage from the right atrium
  if(V.bypass&&E&&OPF.open>0.5){const tube=(x0,y0,x1,y1,col)=>{c.lineCap='round';c.strokeStyle='rgba(235,240,245,.85)';c.lineWidth=1.25;c.beginPath();c.moveTo(x0,y0);c.quadraticCurveTo((x0+x1)/2,y0-6,x1,y1);c.stroke();c.strokeStyle=col;c.lineWidth=0.8;c.stroke();};
    tube(0.6,-130.5,15,-152,'#b3121d');tube(-2.2,-126,-15,-152,'#3a2a7a');}
  // markers inside the open cavity
  if(OPF.open>0.5&&OPF.depth>=4){const pu=0.5+0.5*Math.sin(performance.now()/160);
    for(const b of opfBleeders()){if(!reach(b.x,b.y))continue;if(b.v.clamp){opfClampArt(c,b.x,b.y);continue;}c.fillStyle=`rgba(255,40,50,${0.5+0.4*pu})`;c.beginPath();c.arc(b.x,b.y,0.5+0.35*pu,0,6.283);c.fill();c.strokeStyle='#ff5a64';c.lineWidth=0.12;c.beginPath();c.arc(b.x,b.y,1.3,0,6.283);c.stroke();}
    for(const id in OPF.ped){if(OPF.removed[id])continue;for(const p of OPF.ped[id]){if(!reach(p.x,p.y))continue;
      if(p.cut){c.strokeStyle='#2a0508';c.lineWidth=0.25;c.beginPath();c.moveTo(p.x-0.5,p.y-0.5);c.lineTo(p.x+0.5,p.y+0.5);c.moveTo(p.x+0.5,p.y-0.5);c.lineTo(p.x-0.5,p.y+0.5);c.stroke();if(p.clamped)opfClampArt(c,p.x,p.y);continue;}
      if(p.clamped){opfClampArt(c,p.x,p.y);continue;}
      c.strokeStyle='#ffd34d';c.lineWidth=0.16;c.setLineDash([0.35,0.25]);c.beginPath();c.arc(p.x,p.y,0.8,0,6.283);c.stroke();c.setLineDash([]);}}
    for(const id in OPF.donor)for(const p of OPF.donor[id].pts){c.strokeStyle=p.sewn?'#53e08a':'#59c7ff';c.lineWidth=0.18;c.beginPath();c.arc(p.x,p.y,0.8,0,6.283);c.stroke();if(p.sewn){c.fillStyle='#53e08a';c.beginPath();c.arc(p.x,p.y,0.3,0,6.283);c.fill();}}
    for(const L of LODGED){if(L.seg!==SEG.chest&&L.seg!==SEG.abd)continue;const p=frontPos(L.seg,L.s,clamp(L.z||0,-1,1));if(!p||!reach(p.x,p.y))continue;c.fillStyle='#9aa0a6';c.strokeStyle='#3d4247';c.lineWidth=0.12;c.beginPath();c.ellipse(p.x,p.y,0.45,0.32,0.6,0,6.283);c.fill();c.stroke();}
    // torn organs: a dark tear line
    for(const id in FORG){const o=ORG[id];if(!o||o.removed||o.rep||!(o.hp<100)||!o.ib||!reach(FORG[id][0],FORG[id][1]))continue;const f=FORG[id];c.strokeStyle='rgba(30,0,4,.9)';c.lineWidth=0.3;c.beginPath();c.moveTo(f[0]-f[2]*0.4,f[1]-0.6);c.lineTo(f[0],f[1]+0.4);c.lineTo(f[0]+f[2]*0.35,f[1]-0.3);c.stroke();}}
  // the stroke being drawn
  if(OPFUI.down&&OPFUI.p0&&OPFUI.p1){const a=OPFUI.p0,b=OPFUI.p1,t=OPFUI.tool,col={scalpel:'#e8f0f6',saw:'#ffd34d',needle:'#59c7ff',forceps:'#c9d3dc',suction:'#9fd3ff'}[t]||'#fff';
    c.strokeStyle=col;c.lineWidth=0.18;c.setLineDash(t==='needle'?[0.5,0.3]:[]);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();c.setLineDash([]);
    if(t==='suction'){c.fillStyle='rgba(159,211,255,.35)';c.beginPath();c.arc(b.x,b.y,1.4,0,6.283);c.fill();}}
  // kidney dish with what was taken out
  const out=Object.keys(OPF.removed).filter(id=>OPF.removed[id]&&!OPF.donor[id]);
  if(out.length){c.save();c.translate(Math.min(19,OPFUI.cv.width/(OPFUI.dpr||1)/2/sc-8.5),-88);c.fillStyle='#c5ccd3';c.strokeStyle='#6d7780';c.lineWidth=0.2;c.beginPath();c.ellipse(0,0,8,5,0,0,6.283);c.fill();c.stroke();
    out.forEach((id,i)=>{const f=FORG[id];c.save();c.translate((i-(out.length-1)/2)*5,0);const k=Math.min(1,3.6/Math.max(f[2],f[3]));c.scale(k,k);if(id==='heart')heartFrontArt(c,0,true);else{const o=ORG[id],t=o.out;o.out=0;drawOrgan(c,o,0,0,f[2],f[3],0,true,{zc:0,zr:1});o.out=t;}c.restore();});c.restore();}
}
function opfClampArt(c,x,y){c.save();c.translate(x,y);c.rotate(-0.6);c.strokeStyle='#d6dde3';c.lineWidth=0.22;c.beginPath();c.moveTo(-1,0);c.lineTo(3.4,0);c.moveTo(-1,0.35);c.lineTo(3.4,0.6);c.stroke();c.beginPath();c.arc(4,0.1,0.55,0,6.283);c.arc(4.2,1.3,0.55,0,6.283);c.stroke();c.restore();}
function opfSkinWound(c,type,x,y,x2,y2,r,sut){c.lineCap='round';
  if(type==='cut'&&x2!=null){c.strokeStyle=sut?'#7a3a3a':'#5a0a10';c.lineWidth=sut?0.25:0.6;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();return;}
  const rr=sut?r*0.5:r+0.25;c.fillStyle=sut?'rgba(120,40,45,.6)':'#4d0a0e';c.beginPath();c.arc(x,y,rr,0,6.283);c.fill();if(!sut){c.fillStyle='rgba(140,10,20,.55)';c.beginPath();c.ellipse(x,y+rr*1.2,rr*0.55,rr*1.3,0,0,6.283);c.fill();}}
