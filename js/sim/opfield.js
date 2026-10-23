/* TRAUMA_LAB_MAIN */
/* ===== sim/opfield.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
/* =========================================================
   COMPLEX SURGERY · the operating field (chest and abdomen)
   Coordinates are the front-view torso (cm): x across (+ = his left), y down the body (negative = up).
   You open him in layers with the scalpel (skin → fat → muscle/fascia → peritoneum), the chest needs the sternal saw
   (or a rib spreader for a side thoracotomy), retract, keep the field dry with suction, clamp what bleeds, repair with
   sutures, pull bullets with forceps, take organs out (clamp, cut the pedicle, lift) and sew donor organs in.
   Everything acts on the real physiology: unclamped cuts bleed his blood volume, a heart out of the chest needs the
   bypass machine, and he feels it all if he is not anaesthetised.
   ========================================================= */
let OPF=null;
const OPF_DEPTH=['intact skin','skin','fat','muscle / fascia','cavity'];
// organs that can be taken out, and where their pedicle (artery, vein, duct) is, relative to the organ ellipse [dx, dy] in rx/ry units
const OPF_PED={heart:[[-0.35,-1.05,'aorta'],[0.25,-1.1,'pulmonary artery'],[-0.85,-0.55,'vena cava'],[0.85,-0.45,'pulmonary veins']],
  kidneyL:[[-0.95,0,'renal artery'],[-0.9,0.35,'renal vein']],kidneyR:[[0.95,0,'renal artery'],[0.9,0.35,'renal vein']],
  spleen:[[-0.9,0.1,'splenic hilum']],gallbladder:[[0.2,-1,'cystic duct and artery']],
  lungL:[[-0.95,-0.15,'left hilum']],lungR:[[0.95,-0.15,'right hilum']],
  liver:[[0.1,0.95,'portal vein'],[0.45,0.8,'hepatic artery'],[-0.5,-0.9,'hepatic veins']]};
function opfPed(id){const f=FORG[id],P_=OPF_PED[id];if(!f||!P_)return[];return P_.map(([dx,dy,n])=>({x:f[0]+dx*f[2],y:f[1]+dy*f[3],n}));}
function opfStart(){
  OPF={inc:null,depth:0,saw:false,open:0,openT:0,pool:0,clamps:[],ped:{},removed:{},donor:{},stitch:{},close:0,wd:null,seg:null,t:0,done:false,said:{}};
  for(const id in OPF_PED)OPF.ped[id]=opfPed(id).map(p=>Object.assign(p,{clamped:false,cut:false}));
  emitLog('Operating field · cut with the scalpel, layer by layer','info');}
function opfSay(k,msg,cls){if(OPF.said[k])return;OPF.said[k]=1;emitLog(msg,cls||'info');}
function opfSeg(y){return y<-111?SEG.chest:SEG.abd;}
function inTorso(x,y){return y>-147&&y<-84&&Math.abs(x)<(torsoHW(y)||10)*0.9;}
function dSeg(px,py,x1,y1,x2,y2){return dps(px,py,x1,y1,x2,y2);}
// the opening: an ellipse around the incision, wider as the retractor spreads it · a sternal spreader opens ≈ 12 cm,
// a self-retaining abdominal retractor (Balfour / Bookwalter) pulls a 30 cm laparotomy ≈ 20 cm wide
function opfEll(){const I=OPF.inc;if(!I)return null;const mx=(I.x1+I.x2)/2,my=(I.y1+I.y2)/2,a=Math.atan2(I.y2-I.y1,I.x2-I.x1);return{mx,my,a,ra:I.len/2+1.2,rb:(chestPart(my)?clamp(I.len*0.3,2.5,6.5):clamp(I.len*0.4,2.5,11))*OPF.open+0.4};}
function inOpen(x,y,pad=0){const E=opfEll();if(!E||OPF.open<0.5)return false;const c=Math.cos(-E.a),s=Math.sin(-E.a),dx=x-E.mx,dy=y-E.my,u=dx*c-dy*s,v=dx*s+dy*c;return (u*u)/((E.ra+pad)**2)+(v*v)/((E.rb+pad)**2)<1;}
function crossesMid(){const I=OPF.inc;return I&&Math.min(I.x1,I.x2)<2.5&&Math.max(I.x1,I.x2)>-2.5||I&&Math.abs((I.x1+I.x2)/2)<2.5;}
function chestPart(y){return y<-113;}
// can the instrument reach this point inside him?
function reach(x,y){if(!OPF.inc||OPF.depth<4||!inOpen(x,y,1.5))return false;if(chestPart(y)&&!OPF.saw&&crossesMid())return false;return true;}
function awakePain(amt){if(anaesthetised())return;hurt(OPF.seg||SEG.chest,10,0,amt);V.fear=Math.min(1,(V.fear||0)+0.3);opfSay('awake','He is AWAKE and feels the knife · give ketamine or midazolam first','bad');}
// the skin wound on the body that matches the incision
function opfWound(){const I=OPF.inc,seg=OPF.seg,sA=I.y1-seg.rest.ay,sB=I.y2-seg.rest.ay,s1=clamp(Math.min(sA,sB),0,seg.len),s2=clamp(Math.max(sA,sB),0,seg.len),mid=(I.y1+I.y2)/2,rr=radS(seg,clamp((s1+s2)/2,0,seg.len))||seg.ra;
  OPF.wd=addWound(seg,{type:'cut',s:s1,w:rr*0.92,s2,w2:rr*0.92,r:0.35,len:I.len,bleed:0.15,dw:1,ds:0,z:clamp(((I.x1+I.x2)/2)/((torsoHW(mid)||10)*0.9),-0.95,0.95),ff:false,surg:true});}
/* ---------- instruments ---------- */
function opfScalpel(x1,y1,x2,y2){const L=Math.hypot(x2-x1,y2-y1);
  if(!OPF.inc){
    // forgiving: a short stroke or a tap becomes a 12 cm incision through that point (vertical for a tap), kept on the torso
    let mx=(x1+x2)/2,my=(y1+y2)/2,ux=L>1?(x2-x1)/L:0,uy=L>1?(y2-y1)/L:1;if(Math.abs(mx)<3)mx=0;
    if(L<12){const h=6;x1=mx-ux*h;y1=my-uy*h;x2=mx+ux*h;y2=my+uy*h;}
    const fit=(x,y)=>{y=clamp(y,-146,-85);const hw=(torsoHW(y)||10)*0.85;return[clamp(x,-hw,hw),y];};[x1,y1]=fit(x1,y1);[x2,y2]=fit(x2,y2);
    if(Math.hypot(x2-x1,y2-y1)<4){emitLog('Cut on the chest or the abdomen','info');return;}
    const L2=Math.hypot(x2-x1,y2-y1);
    OPF.inc={x1,y1,x2,y2,len:L2};OPF.seg=opfSeg((y1+y2)/2);OPF.depth=1;opfWound();emitSound('slice');awakePain(25);
    emitLog('Skin incision · '+L2.toFixed(0)+' cm · next: the fat below (scalpel again along the same line)','good');return;}
  const I=OPF.inc;if(dSeg((x1+x2)/2,(y1+y2)/2,I.x1,I.y1,I.x2,I.y2).d>7){emitLog('Cut near the incision to go deeper','info');return;}
  if(OPF.depth>=4){emitLog('Already in the cavity','info');return;}
  if(OPF.depth===3&&chestPart((I.y1+I.y2)/2)&&crossesMid()){emitLog('Bone below: the sternum · use the sternal saw down the midline','info');return;}
  if(OPF.depth===3&&chestPart((I.y1+I.y2)/2)){emitLog('Between the ribs · open the space with the retractor (rib spreader)','info');return;}
  OPF.depth++;if(OPF.wd)OPF.wd.bleed+=0.15;emitSound('slice');awakePain(18);
  emitLog(['','','Through the fat (yellow) · next: muscle and fascia','Through the muscle / linea alba · next: open the peritoneum','Peritoneum open · retract, suction, then work inside'][OPF.depth],'good');}
function opfSaw(x1,y1,x2,y2){const I=OPF.inc;if(!I){emitLog('Make a skin incision first','info');return;}
  if(!chestPart((I.y1+I.y2)/2)){emitLog('The sternal saw is for the chest','info');return;}
  if(OPF.depth<3){emitLog('Go through skin, fat and muscle first (scalpel)','info');return;}
  if(dSeg((x1+x2)/2,(y1+y2)/2,I.x1,I.y1,I.x2,I.y2).d>7){emitLog('Saw along the incision, down the breastbone','info');return;}
  if(OPF.saw){emitLog('Sternum already open','info');return;}
  OPF.saw=true;OPF.depth=4;if(OPF.wd)OPF.wd.bleed+=0.25;emitSound('saber');awakePain(40);emitLog('Median sternotomy · sternum split · open it with the retractor','good');}
function opfRetract(x,y){const I=OPF.inc;if(!I){emitLog('Nothing to retract yet','info');return;}
  if(dSeg(x,y,I.x1,I.y1,I.x2,I.y2).d>9){emitLog('Place the retractor on the incision','info');return;}
  if(OPF.open>0.5){OPF.open=0;emitLog('Retractor out · the wound can be closed','info');return;}
  if(OPF.depth===3&&chestPart((I.y1+I.y2)/2)&&!crossesMid()){OPF.depth=4;emitLog('Rib spreader in · thoracotomy open','good');awakePain(30);}
  OPF.open=1;emitLog(OPF.depth>=4?'Retractor in · the cavity is open':'Retractor in','good');}
// a Yankauer sucker on wall suction clears ≈ 80 mL/s, so a field full of blood (≈ 300 mL) takes ≈ 4 s
// one pass of the sucker plus laparotomy sponges packed around the field empties it (a big Poole sucker clears ≈ 300 mL in seconds);
// the sponges then soak up slow ooze (each holds ≈ 100 mL), so only a vessel that is really still bleeding fills it again
function opfSuction(x,y){if(!OPF.inc||OPF.open<0.5)return;const had=OPF.pool;OPF.pool=0;OPF.packed=300;
  emitLog(had>0.05?'Suctioned ≈ '+Math.round(had*300)+' mL · sponges packed · field dry':'Field dry · sponges packed','good');}
function opfBleeders(){const out=[];for(const seg of [SEG.chest,SEG.abd])for(const v of seg.vessels){if(v.cut<=0||v.lig)continue;const at=v.at||{s:v.pts[0][0],w:v.pts[0][1]};const p=frontPos(seg,at.s,clamp(v.z0!=null?(v.z0+v.z1)/2:0,-1,1));if(p)out.push({v,x:p.x,y:p.y});}return out;}
function opfClamp(x,y){if(OPF.pool>0.6){emitLog('Too much blood in the field · suction first','info');return;}
  let best=null,bd=4.5;for(const b of opfBleeders()){if(!reach(b.x,b.y))continue;const d=Math.hypot(b.x-x,b.y-y);if(d<bd){bd=d;best={k:'v',b};}}
  for(const id in OPF.ped)for(const p of OPF.ped[id]){if(p.cut||p.clamped||!reach(p.x,p.y))continue;const d=Math.hypot(p.x-x,p.y-y);if(d<bd){bd=d;best={k:'p',p,id};}}
  if(!best){emitLog('Nothing to clamp there','info');return;}
  emitSound('tink',0.4);
  if(best.k==='v'){const v=best.b.v;if(!OPF.clamps.includes(v))OPF.clamps.push(v);v.clamp=true;emitLog('Clamped · '+v.name.toLowerCase()+' · now suture it','good');}
  else{best.p.clamped=true;emitLog('Clamped · '+best.p.n+' ('+ORG[best.id].name.toLowerCase()+')','good');}}
function opfScissors(x,y){let best=null,bd=4.5;for(const id in OPF.ped)for(const p of OPF.ped[id]){if(p.cut||!reach(p.x,p.y)||OPF.removed[id])continue;const d=Math.hypot(p.x-x,p.y-y)-(p.clamped?1.5:0);if(d<bd){bd=d;best={p,id};}}
  if(!best){emitLog('Cut an organ\'s pedicle (the marked points) · clamp it first','info');return;}
  const {p,id}=best;p.cut=true;emitSound('slice');
  if(!p.clamped){const loss=id==='heart'||id==='liver'?600:id.startsWith('lung')?350:250;V.blood=Math.max(0,V.blood-loss);OPF.pool=Math.min(1,OPF.pool+0.6);emitLog('Cut an UNCLAMPED '+p.n+' · '+loss+' mL of blood in seconds','bad');}
  else emitLog('Divided · '+p.n,'good');
  if(OPF.ped[id].every(q=>q.cut))emitLog(ORG[id].name+' is free · lift it out with the forceps','info');}
function opfNeedle(x1,y1,x2,y2){
  // closing: retractor out, suture along the incision, one pass per layer
  const I=OPF.inc;if(!I){emitLog('Nothing to sew','info');return;}
  if(OPF.open<0.5){    if(dSeg((x1+x2)/2,(y1+y2)/2,I.x1,I.y1,I.x2,I.y2).d>8){emitLog('Sew near the incision to close it','info');return;}
    if(OPF.depth>=4&&OPF.saw&&!OPF.wired){OPF.wired=true;OPF.depth=3;emitLog('Sternal wires · the sternum is closed','good');return;}
    if(OPF.depth>=4&&!anaesthetised())awakePain(10);OPF.closing=true;OPF.depth=Math.max(0,OPF.depth-1);emitSound('tink',0.3);
    if(OPF.depth>0)emitLog(['','Fat closed · last: the skin','Muscle and fascia closed · next: the fat',chestPart((I.y1+I.y2)/2)?'Ribs brought together · next: muscle':'Peritoneum closed · next: muscle and fascia'][OPF.depth]||'Layer closed','good');
    else{if(OPF.wd){OPF.wd.sutStart=true;OPF.wd.sut=0;}OPF.done=true;emitLog('Skin closed · operation finished','good');}return;}
  if(OPF.pool>0.6){emitLog('Too much blood in the field · suction first','info');return;}
  const hit=(px,py,r)=>dSeg(px,py,x1,y1,x2,y2).d<r;
  // a clamped vessel: three stitches repair it
  for(const v of OPF.clamps){if(v.lig)continue;const b=opfBleeders().find(q=>q.v===v);if(!b||!reach(b.x,b.y)||!hit(b.x,b.y,3.5))continue;const k='v'+v.id;OPF.stitch[k]=(OPF.stitch[k]||0)+1;emitSound('tink',0.25);
    if(OPF.stitch[k]>=3){v.lig=true;v.clamp=false;OPF.clamps.splice(OPF.clamps.indexOf(v),1);emitLog('Vessel repaired · '+v.name.toLowerCase(),'good');}else emitLog('Stitch '+OPF.stitch[k]+'/3 · '+v.name.toLowerCase(),'info');return;}
  // a donor organ: sew each connection
  for(const id in OPF.donor){const D=OPF.donor[id];for(const p of D.pts){if(p.sewn||!hit(p.x,p.y,3))continue;p.sewn=true;emitSound('tink',0.25);const left=D.pts.filter(q=>!q.sewn).length;
    if(left){emitLog('Anastomosis · '+p.n+' sewn · '+left+' to go','info');return;}
    const o=ORG[id];o.removed=false;o.hp=100;o.rep=false;o.hits=[];o.out=0;delete OPF.donor[id];OPF.removed[id]=false;for(const q of OPF.ped[id]){q.cut=false;q.clamped=false;}
    emitLog('Donor '+o.name.toLowerCase()+' connected and perfused'+(id==='heart'?' · it needs a shock to start beating':''),'good');return;}}
  // a damaged organ: stitches across the tear
  for(const id in FORG){const o=ORG[id],f=FORG[id];if(!o||o.removed||o.rep||!(o.hp<100))continue;if(!reach(f[0],f[1]))continue;
    const r=dSeg(f[0],f[1],x1,y1,x2,y2);if(r.d>Math.max(f[2],f[3])*1.5+1)continue;const need=clamp(Math.round((100-o.hp)/15),2,6),k='o'+id;OPF.stitch[k]=(OPF.stitch[k]||0)+1;emitSound('tink',0.25);
    if(OPF.stitch[k]>=need){o.rep=true;o.hp=Math.max(o.hp,Math.min(100,o.hp+30));emitLog(o.name+' repaired ('+need+' stitches) · bleeding controlled','good');}else emitLog(o.name+' · stitch '+OPF.stitch[k]+'/'+need,'info');return;}
  emitLog('Sew across a clamped vessel, a torn organ or a donor connection','info');}
function opfForceps(x1,y1,x2,y2){if(OPF.pool>0.6){emitLog('Too much blood in the field · suction first','info');return;}
  // bullet out
  for(const L of LODGED.slice()){if(L.seg!==SEG.chest&&L.seg!==SEG.abd)continue;const p=frontPos(L.seg,L.s,clamp(L.z||0,-1,1));if(!p||!reach(p.x,p.y)||Math.hypot(p.x-x1,p.y-y1)>4.5)continue;
    LODGED.splice(LODGED.indexOf(L),1);for(const t of TRAJ)for(const q of t.pts)if(q.k==='stop'&&q.seg===L.seg&&Math.abs(q.s-L.s)<0.5&&Math.abs(q.w-L.w)<0.5)q.k='removed';trajDirty=true;emitSound('tink',0.5);
    emitLog(bulletName(L)[0].toUpperCase()+bulletName(L).slice(1)+' extracted','good');return;}
  // a freed organ out
  for(const id in OPF.ped){const f=FORG[id],o=ORG[id];if(!o||OPF.removed[id]||!reach(f[0],f[1])||Math.hypot(f[0]-x1,f[1]-y1)>Math.max(f[2],f[3])+3)continue;
    if(!OPF.ped[id].every(q=>q.cut)){emitLog(o.name+' is still attached · clamp and cut its pedicle','info');return;}
    OPF.removed[id]=true;o.removed=true;o.hp=0;o.rep=true;o.ib=o.ib||0;emitSound('slice');
    emitLog(o.name+' removed'+(id==='heart'?(V.bypass?' · the bypass machine keeps him alive':' · without bypass there is no circulation'):''),id==='heart'&&!V.bypass?'bad':'good');return;}
  emitLog('Grab a bullet or a freed organ','info');}
function opfDonor(id){if(!OPF.removed[id]){emitLog('Remove the damaged '+ORG[id].name.toLowerCase()+' first','info');return;}if(OPF.donor[id])return;
  OPF.donor[id]={pts:opfPed(id).map(p=>Object.assign(p,{sewn:false}))};emitLog('Donor '+ORG[id].name.toLowerCase()+' in place · sew each connection with the needle','good');}
function opfBypass(){if(!V.bypass){if(!(OPF.saw&&OPF.open>0.5)){emitLog('Bypass needs the chest open (sternotomy + retractor) to cannulate the heart','info');return;}
    V.bypass=true;emitLog('Cardiopulmonary bypass on · the machine pumps and oxygenates his blood','good');}
  else{if(ORG.heart.removed||V.arrest){emitLog('The heart cannot take over yet · '+(ORG.heart.removed?'there is no heart':'restart it first (internal defib)'),'bad');}V.bypass=false;emitLog('Off bypass','info');}}
function opfStep(dt){if(!OPF)return;OPF.t+=dt;
  // what bleeds into the open field fills it (≈300 mL fills the view); suction empties it
  // only real bleeding fills it: open vessels in reach (their mL/s) and torn organs; packed sponges soak up the first ≈ 300 mL
  if(OPF.inc&&OPF.open>0.5&&OPF.depth>=3){let r=0;for(const b of opfBleeders())if(reach(b.x,b.y)&&!b.v.clamp)r+=b.v.now||0;for(const id in FORG){const o=ORG[id];if(o&&o.ib&&!o.rep&&o.hp<100&&reach(FORG[id][0],FORG[id][1]))r+=o.ib*Math.pow(1-o.hp/100,1.3);}
    let ml=r*dt;if(OPF.packed>0){const k=Math.min(OPF.packed,ml);OPF.packed-=k;ml-=k;}
    OPF.pool=Math.min(1,OPF.pool+ml/300);}
  for(const v of OPF.clamps)if(!v.lig)v.clamp=true;}
