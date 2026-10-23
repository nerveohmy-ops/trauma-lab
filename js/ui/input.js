/* TRAUMA_LAB_MAIN */
/* ===== ui/input.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
let ZOOMT=-1e9,ZLAST=0;
function zooming(){return performance.now()-ZOOMT<280;}
function pickRes(cur,target){const q=Math.pow(2,Math.round(Math.log2(Math.max(0.5,target))*2)/2);if(cur&&zooming()&&cur>target*0.45&&cur<target*2.2)return cur;return q;}
// adaptive resolution: drop render resolution when frames get slow, raise it again when there is headroom
function perfWatch(ms){if(OPT.quality!=='auto')return;frameAvg+=(Math.min(100,ms)-frameAvg)*0.08;perfT+=ms;if(perfT<1500)return;perfT=0;const nat=Math.min(2,window.devicePixelRatio||1);
  if(frameAvg>30&&DPR>1){DPRCAP=Math.max(1,DPR-0.25);layout();}else if(frameAvg<15&&DPR<nat&&DPRCAP<nat){DPRCAP=Math.min(nat,DPRCAP+0.25);layout();}}
function layout(){
  W=innerWidth;H=innerHeight;DPR=Math.min(2,OPT.quality==='low'?1:OPT.quality==='high'?2:DPRCAP,window.devicePixelRatio||1);
  cv.width=W*DPR;cv.height=H*DPR;skinC.width=W*DPR;skinC.height=H*DPR;
  const land=W>H&&H<=560;if(document.body.classList.contains('land')!==land){document.body.classList.toggle('land',land);}
  const hudH=$('hud').offsetHeight,tl=$('tools');tl.style.top=land?hudH+'px':'';const LW=land?tl.offsetWidth:0;
  // the "now" bar (current tool, what it does, recent tools) sits on top of the dock, or along the bottom in landscape
  const nw=$('now');if(nw){nw.style.left=land?LW+'px':'0';nw.style.bottom=land?'0':tl.offsetHeight+'px';}
  const tbH=(land?0:tl.offsetHeight)+(nw?nw.offsetHeight:0);
  const vc=$('viewctl');vc.style.maxHeight=land?(H-hudH-14-($('now')?$('now').offsetHeight:0))+'px':'';const RW=land?Math.max(48,vc.offsetWidth+14):0;
  OY=H-tbH-(land?12:18);const avail=OY-hudH-10,aw=W-LW-RW;
  S=Math.max(0.6,Math.min(aw/150,avail/198));OX=LW+aw/2;
  if(MAP==='fit'){ROOM=Math.max(80,Math.min(260,(aw/2)/S-2));TOP=-Math.max(220,avail/S);}else{ROOM=MAPS[MAP].w/2;TOP=-MAPS[MAP].h;}
  $('hint').style.top=(hudH+8)+'px';$('log').style.top=(hudH+8)+'px';if(typeof trajPlace==='function'&&trajOn)trajPlace();if(typeof placeXbar==='function'&&xray)placeXbar();
  $('viewctl').style.top=(hudH+8)+'px';$('modes').style.bottom=(tbH+10)+'px';
  const ch=$('chart');ch.style.top=hudH+'px';ch.style.bottom=tbH+'px';
  {const f=$('fps');if(f)f.style.bottom=(tbH+8)+'px';}
  ecgResize();
}
/* ---------- camera ---------- */
function zoomAt(sx,sy,f){
  const cam=CAM[view];const z1=cam.z,z2=clamp(z1*f,0.08,6);
  const wx=(sx-OX-cam.px)/(S*z1),wy=(sy-OY-cam.py)/(S*z1);
  cam.z=z2;cam.px=sx-OX-wx*S*z2;cam.py=sy-OY-wy*S*z2;
}
// point the camera at a spot, showing about wcm centimetres across
function frameWorld(x,y,wcm){const cam=CAM[view];cam.z=clamp(W*0.94/(wcm*S),0.08,6);const vs=S*cam.z;cam.px=W/2-OX-x*vs*(view==='back'?-1:1);cam.py=H*0.48-OY-y*vs;}
function fitZ(){return clamp(Math.min(1,(W*0.96)/(2*ROOM*S)),0.08,1);}
function setView(v){if(HK)knifeUp();view=v;trajDirty=true;PROBE=null;$('probe').hidden=true;$('vSide').setAttribute('aria-pressed',v==='side');$('vFront').setAttribute('aria-pressed',v==='front');$('vBack').setAttribute('aria-pressed',v==='back');drag=null;grab=null;closeMenu();refreshTools();if(typeof pipShow==='function')pipShow();}
const PTRS=new Map();
let pinch=null;
function toW(cx,cy){return{x:(cx-VX)/VS*(view==='back'?-1:1),y:(cy-VY)/VS};}
let MPAN=null;
const PANK=new Set();
function endPointer(e,cancel){
  if(MPAN&&e.pointerId===MPAN.id){MPAN=null;cv.style.cursor='';return;}
  PTRS.delete(e.pointerId);
  if(pinch){if(PTRS.size<2)pinch=null;drag=null;return;}
  if(!drag||e.pointerId!==drag.id)return;const d=drag;drag=null;const w=d.cw;
  if(d.probe){pointerW=null;return;}
  if(HK){knifeUp();pointerW=null;return;}
  if(MWH){meleeUp();pointerW=null;return;}
  if(tool==='bandage'&&wrapCur){wrapEnd();grab=null;pointerW=null;return;}
  if(d.tk)tkRelease(d);
  if(!cancel)useTool(d,w);
  grab=null;pointerW=null;
}
function useTool(d,w){
  const t=TOOL[tool];
  if(tool==='move')return;
  if(tool==='rope'){if(view!=='side'){log('Rope works in side view','info');return;}if(!d.moved&&!d.pullR){let bd=Math.max(5,18/VS),best=null;for(const r of ROPES){const p=ropePos(r.a),q=ropePos(r.b);const dd=dps(w.x,w.y,p.x,p.y,q.x,q.y).d;if(dd<bd){bd=dd;best=r;}}if(best){ropePanel(best,d.sx,d.sy);return;}}if(MODE.rope==='pull'){if(d.pullR)log('Rope pulled in · '+(d.pullR.L/100).toFixed(2)+' m left','info');else log('Pull · press and hold on a rope to reel it in','info');return;}if(d.rope&&d.moved)makeRope(d.rope,ropeEnd(w,false));else log('Rope · press on him and drag to where it should be tied','info');return;}
  if(view!=='side'&&!t.front){log(t.name+' works in side view','info');return;}
  if(tool==='bow'||tool==='crossbow'){
    if(view!=='side'){if(d.moved)return;if(tool==='crossbow'){if(T<(shootCrossbow.next||0)){log('Crossbow · still cocking the string','info');return;}shootCrossbow.next=T+ARDEF.crossbow.reload;}frontLaunch(tool,w.x,w.y);return;}
    if(d.moved){const dx=w.x-d.sw.x,dy=w.y-d.sw.y;if(Math.hypot(dx,dy)<1)return;if(tool==='bow')shootArrow('bow',d.sw.x,d.sw.y,dx,dy,clamp((T-d.t0)/ARDEF.bow.draw,0.15,1));else shootCrossbow(d.sw.x,d.sw.y,dx,dy);return;}
    // tap: shot from the wall, aimed up just enough for the arrow's drop to land on target
    const fromL=w.x>-ROOM+30,x0=fromL?Math.max(-ROOM+3,w.x-260):Math.min(ROOM-3,w.x+260),y0=w.y,v=ARDEF[tool].v,X=Math.abs(w.x-x0),disc=v**4-G*G*X*X;const th=disc>0?Math.atan((v*v-Math.sqrt(disc))/(G*X)):0.6;const sx=fromL?1:-1;
    if(tool==='bow')shootArrow('bow',x0,y0,sx*Math.cos(th),-Math.sin(th),1);else shootCrossbow(x0,y0,sx*Math.cos(th),-Math.sin(th));return;}
  if(t.gun){
    if(d.fired)return;
    if(view!=='side'){frontFire(tool,w.x,w.y);return;}
    if(d.moved){const dx=w.x-d.sw.x,dy=w.y-d.sw.y,l=Math.hypot(dx,dy);if(l>0.5)fire(tool,d.sw.x,d.sw.y,dx/l,dy/l);}else wallShot(w);
    return;
  }
  if(t.prop){if(performance.now()-(useTool.pt||0)<650)return;useTool.pt=performance.now();const v=d.moved?throwVel(d):{x:0,y:0};const bk=BKS[tool],pt=bk?'beaker':tool,off=bk?5*bk[0]:{table:75,chair:46,gurney:86,pool:200}[pt];if(pt==='pool'&&ROOM<180&&view==='side'){setMap('hall');log('Moved to the Hall · a 1.8 m pool needs the space','info');useTool.framePool=1;}const mg=bk?6:pt==='gurney'?96:pt==='pool'?94:48;if((spawnProp(pt,clamp(d.sw.x,-ROOM+mg,ROOM-mg),Math.min(0,d.sw.y+off),v.x*(bk?1:0.6),v.y*(bk?1:0.6),bk?{sc:bk[0],cap:bk[1]}:null))){log(bk?bk[1]+' mL beaker placed · empty':pt==='pool'?'Pool placed · empty · pour water or chemicals over it (type an amount like 500 L), then drag him in':PROPDEF[pt].name+' placed','info');if(pt==='pool'){const pl=PROPS[PROPS.length-1];frameWorld(pl.x-pl.ox,-45,260);}}return;}
  if(isChemTool(tool)){if(!d.chemPoured)chemTap(tool,w);return;}
  if(t.throw){const v=d.moved?throwVel(d):{x:0,y:0};spawnObj(tool,clamp(d.sw.x,-ROOM+12,ROOM-12),Math.min(d.sw.y,-12),v.x,v.y);return;}
  if(MWDEF[tool]&&view!=='side'&&SWINGE[tool]){if(!d.moved&&!frontBlunt(w.x,w.y))log('Tap him to strike','info');return;}
  if(view==='side'&&meleeTool(tool))return;
  if(d.moved&&tool!=='c4')return;
  if(tool==='knife'&&MODE.knife==='stab')return;
  if(tool==='knife'||tool==='machete'||tool==='bat')return;
  if(tool==='hammer'){if(!hammer(w.x,w.y))log('Tap a body part to strike it','info');return;}
  if(tool==='grab'){if(grab&&grab.seg)inspect(grab.seg);return;}
  if(tool==='c4'){const b=bodyAt(w);
    if(b){const o=spawnObj('c4',w.x,w.y,0,0);const r=radS(b.seg,b.s)||b.seg.ra;o.att={seg:b.seg,s:b.s,w:view!=='side'?r*0.95*(view==='back'?-1:1):b.w};log('C4 attached to '+b.seg.label.toLowerCase()+' · 3 s','bad');}
    else if(view==='side'){const o=spawnObj('c4',w.x,Math.min(w.y,-3.5),0,0);o.stuck=true;log('C4 placed · 3 s','bad');}
    return;}
  if(tool==='mine'){const o=spawnObj('mine',clamp(w.x,-ROOM+8,ROOM-8),0,0,0);o.stuck=true;o.y=o.py=0;log('Landmine buried · arming','info');return;}
  if(tool==='bandage'){bandage(w);return;}
  if(tool==='suture'){if(OPT.surg==='complex'){if(oplBegin('suture',w))oplOpen();return;}suture(w);return;}
  if(tool==='forceps'){if(OPT.surg==='complex'){const b=bodyAt(w);if(b&&(b.seg===SEG.chest||b.seg===SEG.abd)){opfOpen();return;}if(b&&LODGED.some(L=>L.seg===b.seg)){if(oplBegin('explore',w))oplOpen();return;}}forceps(w);return;}
  if(tool==='gauze'){gauze(w);return;}
  if(tool==='burngel'){gelAt(w,true);return;}
  if(tool==='graft'){graft(w);return;}
  if(tool==='transplant'){if(OPT.surg==='complex'){const b=bodyAt(w);if(b&&(b.seg===SEG.chest||b.seg===SEG.abd)){opfOpen();log('Transplant · take the damaged organ out (clamp, cut, lift), then Donor organ and sew it in','info');return;}}transplant(w);return;}
  if(tool==='extinguisher')return;
  if(t.power){powerTap(d,w);return;}
  if(tool==='core'){coreTap(w);return;}
  if(tool==='source'){if(SOURCE&&Math.hypot(w.x-SOURCE.x,w.y+3)<12){SOURCE=null;log('Radiation source picked up and shielded','info');}else{SOURCE={x:clamp(w.x,-ROOM+5,ROOM-5),t:T};log('Radiation source dropped · listen to the Geiger counter','bad');}return;}
  if(tool==='surgery'){if(OPT.surg==='complex'){const b=bodyAt(w);if(b&&(b.seg===SEG.chest||b.seg===SEG.abd)){opfOpen();return;}if(oplBegin('explore',w))oplOpen();return;}surgery(w);return;}
  if(tool==='ortho'){if(OPT.surg==='complex'){if(oplBegin('ortho',w))oplOpen();return;}ortho(w);return;}
  if(tool==='remove'){removeAt(w);return;}
  if(tool==='tourniquet'){tourniquet(w);return;}
  if(tool==='defib'){defib();return;}
  // complex mode: the needle has to go somewhere real (a vein, the bone marrow, or a muscle for IM drugs)
  if((t.drug||tool==='blood'||tool==='saline')&&OPT.surg==='complex'){const b=bodyAt(w);if(!b){log('Tap the body to inject','info');return;}const r=injSite(b.seg,b.s);
    if(!r){log('No vein or injection muscle there · IV: forearm, back of the hand, inside of the elbow, neck, ankle · IM: deltoid, thigh · IO: just below the knee','info');return;}
    if(r.route==='IM'&&IV_ONLY.has(tool)){log((TOOL[tool]?TOOL[tool].name:tool)+' has to go into a vein · try the forearm, the back of the hand or the inside of the elbow','info');return;}
    INJ_ROUTE=r.route;log('Needle in · '+r.name+' ('+r.route+')','info');
    if(tool==='blood'||tool==='saline')fluids(tool,w);else inject(tool,w.x,w.y);INJ_ROUTE='IV';return;}
  if(tool==='blood'||tool==='saline'){fluids(tool,w);return;}
  if(t.drug){const b=bodyAt(w);if(!b){log('Tap the body to inject','info');return;}inject(tool,w.x,w.y);return;}
}
const PANKEYS={KeyW:1,KeyA:1,KeyS:1,KeyD:1};
function keyPan(dt){if(!PANK.size)return;const sp=(PANK.has('Shift')?1500:650)*dt,cam=CAM[view];
  if(PANK.has('KeyW'))cam.py+=sp;if(PANK.has('KeyS'))cam.py-=sp;if(PANK.has('KeyA'))cam.px+=sp;if(PANK.has('KeyD'))cam.px-=sp;}
const relayout=()=>{if(layQ)return;layQ=requestAnimationFrame(()=>{layQ=0;layout();layout();});};
