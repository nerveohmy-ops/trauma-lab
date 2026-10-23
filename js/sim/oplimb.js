/* TRAUMA_LAB_MAIN */
/* ===== sim/oplimb.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
/* =========================================================
   COMPLEX SURGERY · the repair field (one body part, laid out straight)
   Coordinates are the segment's own: s along it (cm from the proximal end), w across it (cm from the centre line).
   Three procedures, each done by hand in Complex mode:
   · suture   — numb the edges (lidocaine 1 %), irrigate, then place each stitch across the wound ≈ 1 cm apart
   · ortho    — ORIF: cut down to the bone, retract, reduce the fracture, lay the plate, drill and screw
                3 holes each side of the break (AO principle: ≥ 6 cortices each side), close in layers
   · explore  — open over a torn vessel or a bullet, suction, clamp above and below the tear, repair it with
                stitches, pull the bullet with forceps, close
   ========================================================= */
let OPL=null;
// the window: a close-up about 18 cm long around the work (smaller for a short wound), never past the ends of the part
// always centred on the work, even near a joint (the drape covers past the end of the part)
function oplWin(s0,L){const g=OPL.seg;L=Math.min(L||18,g.len+8);OPL.s0=s0-L/2;OPL.s1=s0+L/2;}
function oplStart(kind,seg,o){
  OPL=Object.assign({kind,seg,t:0,said:{},inc:null,depth:0,open:0,pool:0,packed:0,clamps:[],stitches:[],numb:0,clean:false,n:0,done:false},o||{});
  if(kind==='suture'){const wd=OPL.wd,cc=woundCenter(wd);OPL.need=wd.type==='cut'?Math.max(2,Math.round((wd.len||Math.hypot(wd.s2-wd.s,wd.w2-wd.w))/1.0)):Math.max(2,Math.round((wd.type==='stump'?wd.r*1.9:wd.r*2+0.6)/0.9));OPL.wc=cc.w;oplWin(cc.s,Math.max(13,(wd.type==='cut'?(wd.len||Math.hypot(wd.s2-wd.s,wd.w2-wd.w)):wd.r*2)+7));OPL.c=cc;
    emitLog('Wound repair · numb the edges (Local), wash it out (Irrigate), then stitch it closed · '+OPL.need+' stitches','info');}
  else if(kind==='ortho'){OPL.wc=OPL.fw;oplWin(OPL.fs);emitLog('Bone surgery · cut down to the bone along its length over the break','info');}
  else{OPL.wc=OPL.fw;oplWin(OPL.fs);emitLog('Exploration · cut over the injury, then find the bleeding vessel or the bullet','info');}}
function oplSay(k,m,c){if(OPL.said[k])return;OPL.said[k]=1;emitLog(m,c||'info');}
function oplAwake(amt){if(anaesthetised()||(OPL.kind==='suture'&&OPL.numb>=1))return false;hurt(OPL.seg,OPL.c?OPL.c.s:OPL.fs,0,amt);V.fear=Math.min(1,(V.fear||0)+0.2);oplSay('awake',OPL.kind==='suture'?'He feels the needle · numb the wound with Local first (or sedate him)':'He is AWAKE · give anaesthesia first','bad');return true;}
function oplR(s){return radS(OPL.seg,clamp(s,0,OPL.seg.len))||OPL.seg.ra;}
function oplEll(){const I=OPL.inc;if(!I)return null;return{ms:(I.s1+I.s2)/2,ra:Math.abs(I.s2-I.s1)/2+0.8,rb:(OPL.open?clamp(Math.abs(I.s2-I.s1)*0.3,1.8,Math.max(1.8,Math.min(4,oplR((I.s1+I.s2)/2)*0.85))):0.3)};}
function oplReach(s,w){const E=oplEll();if(!E||OPL.open<0.5||OPL.depth<2)return false;const u=(s-E.ms)/E.ra,v=(w-OPL.incW)/E.rb;return u*u+v*v<1.15;}
/* ---------- suturing a wound ---------- */
function oplLocal(s,w){if(OPL.kind!=='suture')return;const c=OPL.c;if(Math.hypot(s-c.s,w-c.w)>Math.max(7,(OPL.wd.len||2)/2+5)){emitLog('Inject around the wound edges','info');return;}
  if(OPL.numb>0){emitLog('Already infiltrated · lidocaine works in about a minute','info');return;}
  OPL.numb=0.01;emitLog('Lidocaine 1 % infiltrated around the edges · numb in a moment','good');}
function oplIrrigate(s,w){if(OPL.kind!=='suture')return;const c=OPL.c;if(Math.hypot(s-c.s,w-c.w)>Math.max(7,(OPL.wd.len||2)/2+5))return;
  if(OPL.clean){emitLog('Already clean','info');return;}OPL.clean=true;oplAwake(6);OPL.wd.dirt=0;OPL.wd.inf=0;emitLog('Irrigated with saline under pressure · dirt and clot washed out (the main way to prevent infection)','good');}
// does the drag (a→b) cross the wound and bite both edges?
function oplCross(s1,w1,s2,w2){const wd=OPL.wd;
  if(wd.type==='cut'){const ax=wd.s,ay=wd.w,bx=wd.s2,by=wd.w2,dx=bx-ax,dy=by-ay,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;
    const d1=(s1-ax)*nx+(w1-ay)*ny,d2=(s2-ax)*nx+(w2-ay)*ny;if(d1*d2>=0)return null;const t=d1/(d1-d2),px=s1+(s2-s1)*t,py=w1+(w2-w1)*t,u=((px-ax)*dx+(py-ay)*dy)/(L*L);
    if(u<-0.08||u>1.08)return null;if(Math.min(Math.abs(d1),Math.abs(d2))<0.25)return{bad:'Take a bigger bite · enter about 5 mm from the edge'};if(Math.max(Math.abs(d1),Math.abs(d2))>2.2)return{bad:'Too wide · bites about 5 mm from each edge'};return{s:px,w:py};}
  const c=woundCenter(wd),r=wd.r||1,dp=dps(c.s,c.w,s1,w1,s2,w2);if(dp.d>r*0.9)return null;const e1=Math.hypot(s1-c.s,w1-c.w),e2=Math.hypot(s2-c.s,w2-c.w);if(e1<r||e2<r)return{bad:'Start and finish the stitch outside the wound edge'};return{s:dp.qx,w:dp.qy};}
function oplStitch(s1,w1,s2,w2){if(OPL.kind!=='suture'||OPL.done)return;
  if(!OPL.clean){emitLog('Irrigate the wound first · stitching dirt inside it causes infection','info');return;}
  const x=oplSlot((s1+s2)/2,(w1+w2)/2);if(!x){emitLog('Sew on the wound · drag or tap the needle across it','info');return;}
  oplAwake(7);OPL.stitches.push(x);OPL.n++;emitSound('tink',0.25);
  const wd=OPL.wd;wd.sut=Math.min(0.99,OPL.n/OPL.need);wd.bleed*=0.85;
  if(OPL.n>=OPL.need){wd.sutStart=true;wd.sut=1;wd.ligV=[];const cc=OPL.c,tied=[];for(const v of OPL.seg.vessels){if(v.cut>0&&v.at&&(!v.deep||wd.type==='stump')&&!v.lig&&Math.hypot(v.at.s-cc.s,(v.at.w||0)-cc.w)<(wd.type==='stump'?7:5)){v.lig=true;tied.push(v.name.toLowerCase());}}
    OPL.done=true;emitLog('Sutured · '+OPL.n+' stitches · '+OPL.seg.label.toLowerCase()+(tied.length?' · tied off '+tied.join(', '):''),'good');}
  else emitLog('Stitch '+OPL.n+'/'+OPL.need,'info');}
// the stitch positions: evenly along a cut (≈ 1 cm apart, bites ≈ 5 mm each side), or across a round wound
function oplSlots(){const wd=OPL.wd,n=OPL.need,out=[];
  if(wd.type==='cut'){const dx=wd.s2-wd.s,dy=wd.w2-wd.w,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;for(let i=0;i<n;i++){const t=(i+0.5)/n,s=wd.s+dx*t,w=wd.w+dy*t;out.push({s,w,s1:s-nx*0.55,w1:w-ny*0.55,s2:s+nx*0.55,w2:w+ny*0.55});}}
  else{const c=woundCenter(wd),r=(wd.r||1)+0.3;for(let i=0;i<n;i++){const t=(i+0.5)/n,s=c.s-r+2*r*t;out.push({s,w:c.w,s1:s,w1:c.w-r,s2:s,w2:c.w+r});}}
  return out;}
function oplSlot(s,w){const all=oplSlots();let d0=1e9;for(const q of all)d0=Math.min(d0,Math.hypot(q.s-s,q.w-w));if(d0>3.5)return null;
  let best=null,bd=1e9;for(const q of all){if(OPL.stitches.some(t=>Math.hypot(t.s-q.s,t.w-q.w)<0.05))continue;const d=Math.hypot(q.s-s,q.w-w);if(d<bd){bd=d;best=q;}}return best;}
/* ---------- opening (ortho and explore) ---------- */
function oplScalpel(s1,w1,s2,w2){if(OPL.kind==='suture')return;const L=Math.hypot(s2-s1,w2-w1);
  if(!OPL.inc){let a=Math.min(s1,s2),b=Math.max(s1,s2);const mid=(a+b)/2;if(Math.abs(mid-OPL.fs)>9){emitLog('Cut near the injury (the dashed ring)','info');return;}
    // always longitudinal (spares nerves and vessels) and always across the injury: at least 8 cm, centred over it
    a=Math.min(a,OPL.fs-4);b=Math.max(b,OPL.fs+4);if(b-a>16){a=OPL.fs-8;b=OPL.fs+8;}w1=w2=Math.abs((w1+w2)/2-OPL.fw)<3?(w1+w2)/2:OPL.fw;
    const sa=clamp(a,0,OPL.seg.len),sb=clamp(b,0,OPL.seg.len),wm=clamp((w1+w2)/2,-oplR((sa+sb)/2)*0.9,oplR((sa+sb)/2)*0.9);OPL.inc={s1:sa,s2:sb};OPL.incW=wm;OPL.depth=1;
    const rr=oplR((sa+sb)/2),sg=Math.sign(wm)||1;OPL.wdInc=addWound(OPL.seg,{type:'cut',s:sa,w:rr*0.92*sg,s2:sb,w2:rr*0.92*sg,r:0.35,len:sb-sa,bleed:0.2,dw:sg,ds:0,z:0.9,ff:false,surg:true});
    emitSound('slice');oplAwake(25);emitLog('Skin incision · '+(sb-sa).toFixed(0)+' cm · next: through the fascia and muscle (scalpel again along it)','good');return;}
  const I=OPL.inc;if(Math.abs((s1+s2)/2-(I.s1+I.s2)/2)>Math.abs(I.s2-I.s1)/2+4||Math.abs((w1+w2)/2-OPL.incW)>4){emitLog('Cut near the incision to go deeper','info');return;}
  if(OPL.depth>=2){emitLog('Already down to the '+(OPL.kind==='ortho'?'bone':'vessels'),'info');return;}
  OPL.depth=2;if(OPL.wdInc)OPL.wdInc.bleed+=0.15;emitSound('slice');oplAwake(18);emitLog(OPL.kind==='ortho'?'Through fascia and muscle · down to the bone · now the Retractor':'Through the fascia · the vessels are below · now the Retractor','good');}
function oplRetract(s,w){const I=OPL.inc;if(!I){emitLog('Nothing to retract yet','info');return;}
  if(s<Math.min(I.s1,I.s2)-5||s>Math.max(I.s1,I.s2)+5||Math.abs(w-OPL.incW)>6){emitLog('Place the retractor in the incision','info');return;}
  if(OPL.open){OPL.open=0;emitLog('Retractor out · close in layers with the Needle','info');return;}
  OPL.open=1;emitLog('Self-retaining retractor in · wound held open','good');}
function oplSuction(s,w){if(!OPL.open||!oplReach(s,w)&&OPL.pool<0.01)return;const had=OPL.pool;OPL.pool=0;OPL.packed=150;emitLog(had>0.05?'Suctioned ≈ '+Math.round(had*120)+' mL · field dry':'Field dry','good');}
function oplBleeders(){const out=[];for(const v of OPL.seg.vessels){if(v.cut<=0||v.lig)continue;const at=v.at||{s:v.pts[0][0],w:v.pts[0][1]};out.push({v,s:at.s,w:at.w??0});}return out;}
/* ---------- ortho ---------- */
function oplReduce(s1,w1,s2,w2){if(OPL.kind!=='ortho')return;if(!oplReach(OPL.fs,OPL.fw)){emitLog('Expose the bone first (scalpel twice, retractor)','info');return;}
  if(OPL.reduced){emitLog('Already reduced','info');return;}if(Math.hypot(s1-OPL.fs,w1-OPL.fw)>7){emitLog('Grab the bone end at the break and pull it back into line','info');return;}
  OPL.reduced=true;oplAwake(30);emitSound('thud',0.4);emitLog('Traction and manipulation · the bone ends are back in line (reduced)','good');}
function oplPlate(s,w){if(OPL.kind!=='ortho')return;if(!OPL.reduced){emitLog(OPL.inc&&OPL.open?'Reduce the fracture first (Reduce: drag the bone end into line)':'Expose the bone first','info');return;}
  if(OPL.holes){emitLog('Plate already on','info');return;}if(Math.abs(s-OPL.fs)>8){emitLog('Put the plate near the break','info');return;}
  const sp=OPL.seg.kind==='thigh'?1.6:OPL.seg.kind==='hand'||OPL.seg.kind==='foot'||OPL.ribs||OPL.jaw?0.8:1.2;
  OPL.holes=[-3,-2,-1,1,2,3].map(k=>({s:OPL.fs+k*sp-(Math.sign(k)*sp*0.5),drilled:false,screw:false}));OPL.plateSp=sp;emitSound('tink',0.5);
  emitLog('Locking plate laid across the break · drill and screw 3 holes on each side','good');}
// a tap anywhere on or near the plate picks the closest hole that still needs that step
function oplHole(s,w,need){if(!OPL.holes||Math.abs(w-OPL.fw)>5)return null;let b=null,bd=6;for(const h of OPL.holes){if(need&&!need(h))continue;const d=Math.abs(h.s-s);if(d<bd){bd=d;b=h;}}return b;}
function oplDrill(s,w){if(OPL.kind!=='ortho')return;if(!OPL.holes){emitLog('Lay the plate first','info');return;}const h=oplHole(s,w,q=>!q.drilled)||oplHole(s,w);if(!h){emitLog('Drill through a hole in the plate','info');return;}
  if(h.drilled){emitLog('Already drilled · now the screw','info');return;}h.drilled=true;oplAwake(12);emitSound('saber',0.3);emitLog('Drilled through both cortices · measure and screw','info');}
function oplScrew(s,w){if(OPL.kind!=='ortho')return;const h=oplHole(s,w,q=>q.drilled&&!q.screw)||oplHole(s,w);if(!h){emitLog('Screw into a drilled hole','info');return;}if(!h.drilled){emitLog('Drill the hole first','info');return;}if(h.screw){emitLog('Screw already in','info');return;}
  h.screw=true;emitSound('tink',0.4);const left=OPL.holes.filter(q=>!q.screw).length;
  if(left){emitLog('Screw in · '+left+' to go','info');return;}
  orthoFix({bones:OPL.bones,ribs:OPL.ribs,jaw:OPL.jaw,seg:OPL.seg});OPL.fixed=true;emitLog('Fixation stable · take the retractor out and close','good');}
/* ---------- explore: clamps, vessel repair, bullets ---------- */
function oplClamp(s,w){if(OPL.pool>0.6){emitLog('Too much blood · suction first','info');return;}
  let best=null,bd=6;for(const b of oplBleeders()){if(!oplReach(b.s,b.w))continue;const d=Math.hypot(s-b.s,(w-b.w)*0.5);if(d<bd){bd=d;best=b;}}
  if(!best){emitLog('Clamp a torn vessel just above or below the tear','info');return;}
  const v=best.v,side=s<best.s?'p':'d';const k=OPL.clamps.find(c=>c.v===v)||(OPL.clamps.push({v,p:false,d:false}),OPL.clamps[OPL.clamps.length-1]);
  if(k[side]){emitLog('Already clamped on that side','info');return;}k[side]=true;emitSound('tink',0.4);
  // an artery fills back from the far side through collaterals, so it needs a clamp on each side of the tear
  if(k.p&&k.d){v.clamp=true;emitLog('Clamped above and below · '+v.name.toLowerCase()+' · now repair it with the Needle','good');}
  else emitLog('Clamp '+(side==='p'?'above':'below')+' the tear · '+(v.type==='a'?'it still back-bleeds from the other side':'now the other side'),'info');}
function oplNeedle(s1,w1,s2,w2){
  if(OPL.kind==='suture'){oplStitch(s1,w1,s2,w2);return;}
  const I=OPL.inc;if(!I){emitLog('Nothing to sew','info');return;}
  if(!OPL.open){const a=Math.min(s1,s2),b=Math.max(s1,s2);if(Math.abs((s1+s2)/2-(I.s1+I.s2)/2)>Math.abs(I.s2-I.s1)/2+4||Math.abs((w1+w2)/2-OPL.incW)>5){emitLog('Sew near the incision to close it','info');return;}
    OPL.depth--;emitSound('tink',0.3);oplAwake(8);
    if(OPL.depth>0){emitLog('Fascia and muscle closed · last: the skin','good');return;}
    if(OPL.wdInc){OPL.wdInc.sutStart=true;OPL.wdInc.sut=0;}OPL.done=true;emitLog('Skin closed · operation finished','good');return;}
  if(OPL.pool>0.6){emitLog('Too much blood · suction first','info');return;}
  for(const b of oplBleeders()){if(!oplReach(b.s,b.w))continue;if(dps(b.s,b.w,s1,w1,s2,w2).d>3.5)continue;
    if(!b.v.clamp){emitLog('Clamp it above and below first, or it fills the field as you sew','info');return;}
    const k='v'+b.v.id;OPL[k]=(OPL[k]||0)+1;emitSound('tink',0.25);oplAwake(6);
    if(OPL[k]>=3){b.v.lig=true;b.v.clamp=false;OPL.clamps=OPL.clamps.filter(c=>c.v!==b.v);emitLog('Vessel repaired · '+b.v.name.toLowerCase()+' · clamps off, no leak','good');}else emitLog('Stitch '+OPL[k]+'/3 · '+b.v.name.toLowerCase(),'info');return;}
  emitLog('Sew across a clamped vessel · or take the retractor out and close the incision','info');}
function oplForceps(s1,w1,s2,w2){for(const L of LODGED.slice()){if(L.seg!==OPL.seg||!oplReach(L.s,L.w))continue;if(Math.hypot(L.s-s1,L.w-w1)>4.5)continue;
    LODGED.splice(LODGED.indexOf(L),1);for(const t of TRAJ)for(const q of t.pts)if(q.k==='stop'&&q.seg===L.seg&&Math.abs(q.s-L.s)<0.5&&Math.abs(q.w-L.w)<0.5)q.k='removed';trajDirty=true;emitSound('tink',0.5);oplAwake(10);
    emitLog(bulletName(L)[0].toUpperCase()+bulletName(L).slice(1)+' extracted','good');return;}
  emitLog('Grab the bullet with the forceps and pull it out','info');}
function oplStep(dt){if(!OPL)return;OPL.t+=dt;if(!OPL.seg.connected){emitLog('Operation stopped · the part came off','bad');OPL=null;return;}
  if(OPL.numb>0&&OPL.numb<1){OPL.numb=Math.min(1,OPL.numb+dt/4);if(OPL.numb>=1)oplSay('numb','Wound edges numb · he will not feel the stitches','good');}
  if(OPL.open&&OPL.depth>=2){let r=0;for(const b of oplBleeders())if(oplReach(b.s,b.w)&&!b.v.clamp)r+=b.v.now||0;let ml=r*dt;if(OPL.packed>0){const k=Math.min(OPL.packed,ml);OPL.packed-=k;ml-=k;}OPL.pool=Math.min(1,OPL.pool+ml/120);}
  for(const c of OPL.clamps)if(c.p&&c.d&&!c.v.lig)c.v.clamp=true;}
// Complex mode: work out what this tap asks for and set up the field · returns false when there is nothing to do there
function oplBegin(kind,w){if(OPL&&!OPL.done){const b=bodyAtOrg(w);if(b&&b.seg===OPL.seg)return true;}
  if(kind==='suture'){const b=woundAtTap(w,wd=>openWound(wd)&&!wd.sutStart);if(!b){emitLog('No open wound there to stitch','info');return false;}
    if(b.wd.band){emitLog('Take the bandage off first (Hand → Remove)','info');return false;}if(isBite(b.wd)){emitLog('Too much tissue is missing to stitch this · use Gauze pack, then Graft','info');return false;}
    oplStart('suture',b.seg,{wd:b.wd});return true;}
  const b=kind==='ortho'?bodyAtOrg(w):bodyAt(w);if(!b){emitLog('Tap the body part to operate on','info');return false;}let seg=b.seg;if(!seg.connected){emitLog('That part is detached','info');return false;}
  if(kind==='ortho'){const bones=orthoBones(seg),ribs=seg.kind==='chest'&&seg.ribsBroken>0,jaw=seg.kind==='head'&&seg.jawBroken;
    if(!bones.length&&!ribs&&!jaw){emitLog('No broken bone to fix in the '+seg.label.toLowerCase(),'info');return false;}
    let fs=ribs?14:9,fw=0;if(bones[0]){const f=fracSite(bones[0]);seg=bones[0].seg;fs=f.s;fw=f.w;}
    oplStart('ortho',seg,{bones,ribs,jaw,fs,fw,bw:bones[0]?bones[0].width:1});return true;}
  // explore: the worst torn vessel or a bullet in this part
  let fs=null,fw=0,best=0;for(const v of seg.vessels){if(v.cut>0&&!v.lig){const r=v.rate*v.cut;if(r>best){best=r;const at=v.at||{s:v.pts[0][0],w:v.pts[0][1]};fs=at.s;fw=at.w??0;}}}
  if(fs==null){const L=LODGED.find(q=>q.seg===seg);if(L){fs=L.s;fw=L.w;}}
  if(fs==null){emitLog('Nothing to repair inside the '+seg.label.toLowerCase(),'info');return false;}
  oplStart('explore',seg,{fs,fw});return true;}
