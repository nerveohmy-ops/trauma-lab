/* TRAUMA_LAB_MAIN */
/* ===== sim/medical.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
/* ---------- medical ---------- */
function bandageWound(s,wd){
  wd.band=true;let msg='';
  const limb=['uarm','farm','hand','thigh','shin','foot'].includes(s.kind);
  const wc=woundCenter(wd);
  wd.clampV=[];for(const v of s.vessels){if(v.cut>0&&v.at&&!v.deep&&Math.hypot(v.at.s-wc.s,(v.at.w||0)-(wc.w||0))<(limb||s.kind==='neck'?14:8)){wd.clampV.push(v);if(!v.clamp)msg=' · pressure on '+v.name.toLowerCase();v.clamp=true;}}
  for(const f of FW)if(f.ref===wd)f.band=true;
  if(wd.pair&&!wd.pair.band&&openWound(wd.pair)&&s.wounds.includes(wd.pair))msg+=' · '+(wd.exit?'entry':'exit')+' wound on the '+((wd.pair.w||0)>=0?'front':'back')+' is still open';
  if(s.vessels.some(v=>v.deep&&v.cut>0&&!v.lig&&v.at&&Math.hypot(v.at.s-wc.s,(v.at.w||0)-wc.w)<8))msg+=' · deep vessel still bleeding inside';
  return msg;
}
/* ---------- roller bandage: drag to wrap ---------- */
let wrapCur=null;
function wrapAt(x,y){
  if(view==='side'){const g=[...ORDER].reverse().find(q=>{const A=P[q.a],B=P[q.b];const r=dps(x,y,A.x,A.y,B.x,B.y);return r.d<rad(q,r.t)+1.5;});if(!g)return null;const L=toLocal(g,x,y);return{seg:g,s:clamp(L.s,-g.ra*0.7,g.len+g.rb*0.7)};}
  const h=frontHit(x,y);if(!h)return null;return{seg:h.seg,s:h.s};
}
function wrapStroke(x0,y0,x1,y1){
  if(!wrapCur)wrapCur={m:new Map(),n:0,len:0};
  const L=Math.hypot(x1-x0,y1-y0),n=Math.max(1,Math.ceil(L/0.8));
  for(let i=0;i<=n;i++){const h=wrapAt(lerp(x0,x1,i/n),lerp(y0,y1,i/n));if(!h)continue;const seg=h.seg;
    let W=wrapCur.m.get(seg);
    if(!W){W={s0:h.s-1.5,s1:h.s+1.5,t:T};(seg.wraps||(seg.wraps=[])).push(W);wrapCur.m.set(seg,W);}
    else{const a=W.s1-W.s0;W.s0=Math.min(W.s0,h.s-1.5);W.s1=Math.max(W.s1,h.s+1.5);wrapCur.len+=W.s1-W.s0-a;}
    for(const wd of seg.wounds){if(wd.band)continue;if(!(openWound(wd)||(wd.type==='burn'&&wd.heat!=null&&!wd.graft)))continue;const c=woundCenter(wd);
      if(c.s>=W.s0-0.6&&c.s<=W.s1+0.6){bandageWound(seg,wd);wd.wrapped=true;wrapCur.n++;if(wd.type==='burn')hurt(seg,c.s,c.w,2);}}
  }
}
function gelBurnsNear(seg,ls,lw,rad_){let n=0;for(const wd of seg.wounds){if(wd.type!=='burn'||wd.graft)continue;const d=view==='side'?Math.hypot(wd.s-ls,wd.w-lw):Math.abs(wd.s-ls);if(d<rad_+wd.r){if(!wd.gel)n++;wd.gel=true;wd.gelT=T;}}return n;}
function gelAt(w,tap){
  let hit=null;if(view==='side'){const p=pickSeg(w,Math.max(2,10/VS));if(p){const L=toLocal(p.seg,w.x,w.y);hit={seg:p.seg,s:L.s,w:L.w};}}else{const h=frontHit(w.x,w.y);if(h)hit={seg:h.seg,s:h.s,w:0};}
  if(!hit){if(tap)emitLog('Tap a burn to apply the gel','info');return 0;}
  const n=gelBurnsNear(hit.seg,hit.s,hit.w,tap?4:2.5);
  if(tap){if(n){FX.push({k:'ring',x:w.x,y:w.y,t:0,life:0.5});emitLog('Burn gel applied · '+hit.seg.label.toLowerCase()+' · cooling','good');}else emitLog('No untreated burn there','info');}
  return n;
}
let gelCount=0;
function gelStroke(x0,y0,x1,y1){const L=Math.hypot(x1-x0,y1-y0),n=Math.max(1,Math.ceil(L/1.2));for(let i=0;i<=n;i++)gelCount+=gelAt({x:lerp(x0,x1,i/n),y:lerp(y0,y1,i/n)},false);
  if(gelCount&&T-(gelStroke.t||-9)>1.2){gelStroke.t=T;emitLog('Burn gel rubbed in · '+gelCount+' burn'+(gelCount>1?'s':'')+' treated','good');gelCount=0;}}
function wrapEnd(){
  const C=wrapCur;wrapCur=null;if(!C||!C.m.size)return;
  for(const seg of C.m.keys()){const ws=seg.wraps.sort((a,b)=>a.s0-b.s0),out=[];for(const W of ws){const l=out[out.length-1];if(l&&W.s0<=l.s1+0.5){l.s1=Math.max(l.s1,W.s1);}else out.push(W);}seg.wraps=out;}
  const names=[...C.m.keys()].map(g=>g.label.toLowerCase());
  emitLog('Wrapped '+names.slice(0,3).join(', ')+(names.length>3?' +'+(names.length-3):'')+(C.n?' · '+C.n+' wound'+(C.n>1?'s':'')+' dressed':''),'good');
}
function inWrap(seg,sv){return seg.wraps&&seg.wraps.find(W=>sv>=W.s0-0.6&&sv<=W.s1+0.6);}
function wrapCovered(seg,W){const m=(W.s0+W.s1)/2;for(const it of WORDER)if(covers(it,seg,m,0))return true;return false;}
function bandage(w){
  if(view!=='side'){
    const b=woundAtTap(w,wd=>(openWound(wd)||(wd.type==='burn'&&wd.heat!=null&&!wd.graft))&&!wd.band);
    if(!b){emitLog('No open wound there','info');return;}
    let msg=bandageWound(b.seg,b.wd);let n=1;
    for(const wd of b.seg.wounds){if(wd===b.wd||wd.band||!openWound(wd))continue;const c=woundCenter(wd),c0=woundCenter(b.wd);if(Math.hypot(c.s-c0.s,c.w-c0.w)<4&&Math.sign(c.w||1)===Math.sign(c0.w||1)){bandageWound(b.seg,wd);n++;}}
    FX.push({k:'ring',x:w.x,y:w.y,t:0,life:0.5});emitLog('Dressed '+(n>1?n+' wounds':'wound')+' · '+b.seg.label.toLowerCase()+msg,'good');return;
  }
  let best=null,bd=Math.max(5,22/VS);
  for(const s of segs){for(const wd of s.wounds){if(wd.type==='bruise'||(wd.type==='burn'&&(wd.heat==null||wd.graft))||wd.band)continue;const sv=wd.type==='cut'?(wd.s+wd.s2)/2:wd.s,wv=wd.type==='cut'?(wd.w+wd.w2)/2:wd.w;const p=toWorld(s,sv,wv);const d=Math.hypot(p.x-w.x,p.y-w.y);if(d<bd){bd=d;best={s,wd};}}}
  if(!best){emitLog('No open wound there','info');return;}
  const s=best.s;let n=0,msg='';
  for(const wd of s.wounds){if(wd.type==='bruise'||(wd.type==='burn'&&(wd.heat==null||wd.graft))||wd.band)continue;const p=toWorld(s,wd.s,wd.w);if(wd===best.wd||Math.hypot(p.x-w.x,p.y-w.y)<10){msg=bandageWound(s,wd)||msg;n++;}}
  FX.push({k:'ring',x:w.x,y:w.y,t:0,life:0.5});emitLog('Dressed '+n+' wound'+(n>1?'s':'')+' · '+s.label.toLowerCase()+msg,'good');
}
function gauze(w){
  const b=woundAtTap(w,wd=>openWound(wd)&&!wd.pack&&!(wd.sut>=1));
  if(!b){emitLog('No open wound there','info');return;}
  const {seg,wd}=b;wd.pack=true;hurt(seg,woundCenter(wd).s,woundCenter(wd).w,isBite(wd)||wd.type==='stump'?10:5);
  const vs=seg.vessels.filter(v=>v.cut>0&&v.at&&!v.lig&&vCovered(v));
  FX.push({k:'ring',x:w.x,y:w.y,t:0,life:0.5});
  emitLog('Packed '+(isBite(wd)?'crater':wd.type==='stump'?'stump':'wound')+' · '+seg.label.toLowerCase()+(vs.length?' · pressure on '+vs.map(v=>v.name.toLowerCase()).join(', '):'')+(vs.some(v=>v.deep)?' · deep bleeding continues inside':''),'good');
}
function graft(w){
  if(OP){emitLog('Surgery in progress','info');return;}
  const b=woundAtTap(w,wd=>(openWound(wd)||(wd.type==='burn'&&(wd.deg||3)>=2))&&!wd.graft&&!(wd.sut>=1));
  if(!b){emitLog('No open wound or deep burn there to repair','info');return;}
  const {seg,wd}=b;const cc=woundCenter(wd);
  const big=isBite(wd)||wd.type==='stump'||(wd.r||0)>=1.2||(wd.len||0)>6;
  const tasks=[{k:'debride',d:big?1.2:0.6},{k:'graft',d:big?2.6:1.2,wd}];
  for(const o of seg.wounds){if(o===wd||!(openWound(o)||(o.type==='burn'&&(o.deg||3)>=2))||o.graft||o.sut>=1)continue;const c2=woundCenter(o);if(Math.hypot(c2.s-cc.s,c2.w-cc.w)<7&&(Math.sign(c2.w)||1)===(Math.sign(cc.w)||1))tasks.push({k:'graft',d:isBite(o)?1.6:0.8,wd:o});}
  OP={kind:'graft',seg,tasks,i:0,t:0,x:w.x,y:w.y,s:cc.s,w:cc.w,v:view};
  painCheck(seg,(wd.type==='stump'?'Closing the stump with a skin flap':isBite(wd)?'Rebuilding the missing tissue with a skin graft':'Repairing the wound with a graft')+' · '+seg.label.toLowerCase());
}
function forceps(w){
  if(OP){emitLog('Surgery in progress','info');return;}
  let best=null,bd=Math.max(6,30/VS);for(const L of LODGED){const p=lodgedXY(L);if(!p)continue;const d=Math.hypot(p.x-w.x,p.y-w.y);if(d<bd){bd=d;best=L;}}
  if(!best){emitLog(LODGED.length?'No bullet there · bullets inside show as grey slugs while Forceps is selected':'No bullets are lodged in the body','info');return;}
  const p=lodgedXY(best);
  OP={kind:'forceps',seg:best.seg,tasks:[{k:'bullet',L:best,d:1.4}],i:0,t:0,x:p.x,y:p.y,s:best.s,w:best.w,v:view};
  painCheck(best.seg,'Pulling out the '+bulletName(best)+' from the '+best.seg.label.toLowerCase());
}
function surgery(w){
  if(OP){emitLog('Surgery in progress · '+(OP.i+1)+'/'+OP.tasks.length,'info');return;}
  const b=bodyAtOrg(w);if(!b){emitLog('Tap the body part to operate on','info');return;}
  const seg=b.seg;if(!seg.connected){emitLog('That part is detached, nothing to save','info');return;}
  const tasks=[];
  for(const v of seg.vessels){if(v.cut>0&&!v.lig)tasks.push({k:'vessel',v,d:v.deep?2:1.4,pr:v.rate*v.cut*(v.deep?2:1)});}
  for(const o of seg.organs){if(o.ib&&o.hp<100&&o.hp>0&&!o.rep&&o.ib*Math.pow(1-o.hp/100,1.3)>0.05)tasks.push({k:'organ',o,d:o.id==='heart'?4:2.5,pr:o.ib*Math.pow(1-o.hp/100,1.3)});
    else if(o.ib&&o.hp<=0&&!o.rep)tasks.push({k:'organ',o,d:3,pr:o.ib});}
  for(const L of LODGED)if(L.seg===seg)tasks.push({k:'bullet',L,d:0.8,pr:0.1});
  if(!tasks.length){emitLog('Nothing to repair inside the '+seg.label.toLowerCase(),'info');return;}
  tasks.sort((a,c)=>c.pr-a.pr);
  // open right over what needs fixing: the worst organ, vessel or bullet
  const t0=tasks[0];const ts=t0.k==='organ'?t0.o.s:t0.k==='vessel'?(t0.v.at?t0.v.at.s:t0.v.pts[0][0]):t0.k==='bullet'?t0.L.s:b.s,tw=t0.k==='organ'?t0.o.w:t0.k==='bullet'?t0.L.w:b.w;
  const site=opSite(seg,ts,tw,4,t0.k==='organ'&&(t0.o.id==='kidneyL'||t0.o.id==='kidneyR')?-1:(Math.sign(tw)||1),t0.k==='organ'?t0.o.id:null);
  tasks.unshift({k:'open',d:1.2});tasks.push({k:'close',d:1.4,wd:site.inc});
  OP={kind:'surgery',seg,tasks,i:0,t:0,x:site.x,y:site.y,s:site.s,w:site.w,v:view,inc:site.inc,hl:site.hl};
  painCheck(seg,'Surgery on the '+seg.label.toLowerCase()+' · '+(tasks.length-2)+' repair'+(tasks.length>3?'s':''));
}
// where to cut: on the skin straight over the site (front of the body unless the organ is reached from the back)
function opSite(seg,ss,sw,hl,side,oid){
  const sc=clamp(ss,1,seg.len-1),rr=radS(seg,sc)||seg.ra,sg=view==='back'?-1:view==='front'?1:(side||1);
  const inc=addWound(seg,{type:'cut',s:clamp(sc-hl,0,seg.len),w:rr*0.92*sg,s2:clamp(sc+hl,0,seg.len),w2:rr*0.92*sg,r:0.35,len:hl*2,bleed:0.25,dw:sg,ds:0,z:0.9,ff:false,surg:true});
  let x,y;if(view==='side'){const q=toWorld(seg,sc,rr*0.92*sg);x=q.x;y=q.y;}else{const fo=oid&&FORG[oid];const q=fo?{x:fo[0],y:fo[1]}:frontPos(seg,sc,0)||{x:0,y:seg.rest.ay+sc};x=q.x;y=q.y;}
  // the stitched incision is drawn exactly where the body was opened, not on the flank
  if(view!=='side'&&(seg.kind==='chest'||seg.kind==='abd')){inc.z=clamp(x/((torsoHW(y)||10)*0.9),-0.95,0.95);}
  else if(view==='side'&&(seg.kind==='chest'||seg.kind==='abd')){const fo=oid&&FORG[oid];inc.z=fo?clamp(fo[0]/((torsoHW(fo[1])||10)*0.9),-0.95,0.95):0;}
  return{inc,s:sc,w:rr*0.92*sg,x,y,hl};
}
/* ---------- orthopaedic fixation: open reduction and internal fixation (ORIF) ---------- */
const baseId=id=>id.replace(/X\d.*$/,'');
function orthoBones(seg){
  const out=[];const k=seg.kind;
  if(LIMBK.includes(k)){const base=baseId(seg.id);for(const g of segs){if(g.gone||!g.connected||baseId(g.id)!==base)continue;for(const b of g.bones)if(b.broken&&b.shape==='line')out.push(b);}}
  else{for(const b of seg.bones)if(b.broken&&b.shape!=='ribs')out.push(b);}
  return out;}
function fracSite(b){const g=b.seg;const child=joints.find(j=>j.key==='frac'&&!j.broken&&j.p===g.idx);if(child)return{s:g.len-0.4,w:0};
  if(b.pts){const s0=lerp(b.pts[0][0],b.pts[b.pts.length-1][0],b.bp??0.5);return{s:s0,w:polyW(b.pts,s0)};}return{s:b.s??g.len/2,w:b.w??0};}
function ortho(w){
  if(OP){emitLog('Surgery in progress','info');return;}
  const b=bodyAtOrg(w);if(!b){emitLog('Tap a broken bone','info');return;}
  let seg=b.seg;if(!seg.connected){emitLog('That part is detached','info');return;}
  let bones=orthoBones(seg);const ribs=seg.kind==='chest'&&seg.ribsBroken>0,jaw=seg.kind==='head'&&seg.jawBroken;
  if(!bones.length&&!ribs&&!jaw){emitLog('No broken bone to fix in the '+seg.label.toLowerCase(),'info');return;}
  const tgt=bones[0];let site;if(tgt){const f=fracSite(tgt);seg=tgt.seg;site=opSite(seg,f.s,f.w,4.5,1);}else site=opSite(seg,ribs?14:9,0,4,1);
  OP={kind:'ortho',seg,tasks:[{k:'open',d:1.2},{k:'reduce',d:1.6},{k:'plate',d:2.8,bones,ribs,jaw,seg},{k:'close',d:1.4,wd:site.inc}],i:0,t:0,x:site.x,y:site.y,s:site.s,w:site.w,v:view,inc:site.inc,hl:site.hl};
  painCheck(seg,'Bone surgery · '+(bones.length?bones.map(x=>x.name.replace(/x\d+$/,'')).filter((v,i,a)=>a.indexOf(v)===i).join(', '):ribs?'ribs':'jaw')+' · plate and screws');}
function orthoFix(tk){
  const names=[];
  for(const b of tk.bones){if(!b.broken)continue;const g=b.seg,hasChild=joints.some(j=>j.key==='frac'&&!j.broken&&j.p===g.idx),isPiece=joints.some(j=>j.key==='frac'&&!j.broken&&j.c===g.idx);
    // one plate per break: on the piece above each break, or where an unsplit bone cracked
    if(hasChild||!isPiece){const f=fracSite(b);(b.plates||(b.plates=[])).push({s:f.s,w:f.w,t:T});}b.broken=false;b.hp=Math.max(b.hp||0,70);b.hp2=null;b.heal=0;names.push(b.name.replace(/x\d+$/,''));}
  if(tk.ribs){const g=tk.seg;g.ribPlates=(g.ribPlates||0)+g.ribsBroken;g.ribsBroken=0;g.ribBreaks=[];names.push('ribs');}
  if(tk.jaw){const g=tk.seg;g.jawBroken=false;g.jawDrop=0;names.push('jaw (wired)');}
  for(const g of segs)g.icache=null;
  emitLog('Fixed with plate and screws · '+[...new Set(names)].join(', ')+(legsOK()?' · he can bear weight again':''),'good');}
function opStep(dt){
  const O=OP;if(!O)return;
  if(!O.seg.connected){emitLog('Surgery stopped · the part came off','bad');OP=null;return;}
  O.t+=dt;const tk=O.tasks[O.i];
  if(!anaesthetised()&&Math.random()<dt*1.5)hurt(O.seg,O.s,O.w,6);
  if(O.t<tk.d)return;
  O.t=0;const lab=O.seg.label.toLowerCase();
  if(tk.k==='vessel'){tk.v.lig=true;tk.v.clamp=false;emitLog((tk.v.stump?'Tied off ':'Repaired ')+tk.v.name.toLowerCase(),'good');}
  else if(tk.k==='organ'){tk.o.rep=true;emitLog(tk.o.hp<=0?tk.o.name+' packed, bleeding controlled':tk.o.name+' sutured, bleeding controlled','good');}
  else if(tk.k==='bullet'){const i=LODGED.indexOf(tk.L);if(i>=0)LODGED.splice(i,1);for(const t of TRAJ)for(const q of t.pts)if(q.k==='stop'&&q.seg===tk.L.seg&&Math.abs(q.s-tk.L.s)<0.5&&Math.abs(q.w-tk.L.w)<0.5)q.k='removed';
    for(const wd of O.seg.wounds)if(wd.type==='hole'&&!wd.sut&&Math.hypot(wd.s-tk.L.s,wd.w-tk.L.w)<14){wd.bleed+=0.1;break;}
    const p=lodgedXY(tk.L)||{x:O.x,y:O.y};FX.push({k:'spark',x:p.x,y:p.y,t:0,life:0.2});emitLog(bulletName(tk.L)[0].toUpperCase()+bulletName(tk.L).slice(1)+' removed from '+lab,'good');}
  else if(tk.k==='graft'){const wd=tk.wd;
    if(O.seg.wounds.includes(wd)){if(wd.type==='burn')wd.heat=0;wd.graft=true;wd.pack=false;wd.band=false;wd.sutStart=true;wd.sut=1;wd.bleed*=0.05;for(const f of FW)if(f.ref===wd)f.band=false;
      const cc=woundCenter(wd);const tied=[];
      for(const v of O.seg.vessels){if(v.cut>0&&v.at&&!v.lig&&(!v.deep||wd.type==='stump')&&Math.hypot(v.at.s-cc.s,(v.at.w||0)-cc.w)<(wd.type==='stump'?8:Math.max(5,(wd.r||1)*2.5))){v.lig=true;tied.push(v.name.toLowerCase());}}
      if(isBite(wd)===false&&wd.dig)O.seg.hasBite=O.seg.wounds.some(isBite);
      emitLog((wd.type==='stump'?'Stump closed':'Graft in place')+' · '+lab+(tied.length?' · tied off '+tied.join(', '):''),'good');}}
  else if(tk.k==='explant'){emitLog('Damaged '+tk.o.name.toLowerCase()+' removed','info');}
  else if(tk.k==='implant'){tk.o.hp=100;tk.o.rep=false;tk.o.hits=[];tk.o.out=0;if(tk.o.id==='heart'&&V.arrest&&!V.dead){V.arrest=false;V.hr=95;V.phase=0;}emitLog('Donor '+tk.o.name.toLowerCase()+' in place and working','good');}
  else if(tk.k==='reduce'){emitLog('Bone ends set back in line','info');}
  else if(tk.k==='plate'){orthoFix(tk);}
  else if(tk.k==='marrow'){V.marrow=true;emitLog('Bone marrow engrafted · blood production protected from radiation','good');}
  else if(tk.k==='bone'){emitLog('Bone fixed with a plate','info');}
  else if(tk.k==='reattach'){reattachFinish(tk.j);emitLog(segs[tk.j.c].label+' reattached · vessels and nerves reconnected','good');}
  else if(tk.k==='close'){if(tk.wd){tk.wd.sutStart=true;tk.wd.sut=0;tk.wd.ligV=[];}}
  O.i++;if(O.i>=O.tasks.length){if(O.kind==='surgery'||O.kind==='transplant'||O.kind==='ortho')emitLog((O.kind==='transplant'?'Transplant':O.kind==='ortho'?'Bone surgery':'Surgery')+' on '+lab+' finished','good');OP=null;trajDirty=true;}
}
function recomputeClamps(){for(const v of VESSELS)v.clamp=false;for(const seg of segs){for(const wd of seg.wounds)if(wd.band&&wd.clampV)for(const v of wd.clampV)v.clamp=true;if(seg.tq!=null&&seg.tqV)for(const v of seg.tqV)v.clamp=true;}if(OPF)for(const v of OPF.clamps)if(!v.lig)v.clamp=true;if(OPL)for(const c of OPL.clamps)if(c.p&&c.d&&!c.v.lig)c.v.clamp=true;}
function suture(w){
  const b=woundAtTap(w,wd=>openWound(wd)&&!wd.sutStart);
  if(!b){emitLog('No open wound there to stitch','info');return;}
  const {seg,wd}=b;
  if(wd.band){emitLog('Take the bandage off first (Hand → Remove)','info');return;}
  const cc=woundCenter(wd);if(isBite(wd)){emitLog('Too much tissue is missing to stitch this · use Gauze pack to stop the bleeding, then Graft to rebuild it','info');return;}wd.sutStart=true;wd.sut=0;wd.ligV=[];
  for(const v of seg.vessels){if(v.cut>0&&v.at&&(!v.deep||wd.type==='stump')&&Math.hypot(v.at.s-cc.s,(v.at.w||0)-cc.w)<(wd.type==='stump'?7:5))wd.ligV.push(v);}
  hurt(seg,cc.s,cc.w,8);FX.push({k:'ring',x:w.x,y:w.y,t:0,life:0.5});
  emitLog('Stitching '+seg.label.toLowerCase()+(wd.ligV.length?' · tying off '+wd.ligV.map(v=>v.name.toLowerCase()).join(', '):''),'good');
}
function removeAt(w){
  if(view==='side'){const pr=propAt(w);if(pr){PROPS.splice(PROPS.indexOf(pr),1);emitLog(PROPDEF[pr.type].name+' removed','info');return;}}
  let best=null,bd=Math.max(6,26/VS);const consider=(d,item)=>{if(d<bd){bd=d;best=item;}};
  const wb=woundAtTap(w,wd=>(wd.band&&!wd.wrapped)||wd.pack||(wd.sutStart&&!wd.graft));
  for(const seg of segs){if(!seg.wraps)continue;for(const W of seg.wraps){const ms=(W.s0+W.s1)/2;let p=null;if(view==='side')p=toWorld(seg,clamp(ms,0,seg.len),0);else if(seg.connected)p=frontPos(seg,ms,0);if(!p)continue;consider(Math.max(0,Math.hypot(p.x-w.x,p.y-w.y)-Math.max(2,(W.s1-W.s0)/2)),{k:'wrap',seg,W});}}if(wb)consider(wb.d,{k:'wound',seg:wb.seg,wd:wb.wd});
  for(const seg of segs){if(seg.tq==null||!seg.connected)continue;let p=null;
    if(view!=='side'){const f=fpOf(seg);if(f&&f.t==='cap'){const t=clamp(fpT(seg,seg.tq),0,1);p={x:lerp(f.x1,f.x2,t),y:lerp(f.y1,f.y2,t)};}}else p=toWorld(seg,seg.tq,0);
    if(p)consider(Math.hypot(p.x-w.x,p.y-w.y),{k:'tq',seg});}
  if(view==='side'){for(const o of OBJ)consider(Math.max(0,Math.hypot(o.x-w.x,o.y-w.y)-o.r*0.6),{k:'obj',o});for(const g of GIBS)consider(Math.hypot(g.x-w.x,g.y-w.y)+1.5,{k:'gib',g});}
  else for(const o of OBJ){if(!o.att)continue;const p=frontPos(o.att.seg,o.att.s,0);if(p)consider(Math.hypot(p.x-w.x,p.y-w.y),{k:'obj',o});}
  for(const K of KNIVES){let p=null;if(view==='side'){const E=toWorld(K.seg,K.s,K.w),u=dirWorld(K.seg,K.dw,K.ds),n=Math.hypot(u.x,u.y)||1,o=KBL-K.depth+KHL*0.5;p={x:E.x-u.x/n*o,y:E.y-u.y/n*o};}else if(K.seg.connected)p=knifeFrontXY(K);
    if(p)consider(Math.max(0,Math.hypot(p.x-w.x,p.y-w.y)-3),{k:'knife',K});}
  for(const S of ARSTUCK){if(!S.seg||!S.seg.connected)continue;let p=null;if(view==='side'){const W_=arrowWorld(S),o=(ARDEF[S.k].len-S.depth)*0.5;p={x:W_.x-W_.ux*o,y:W_.y-W_.uy*o};}else p=S.front&&S.front.v===view?{x:S.front.x,y:S.front.y}:frontPos(S.seg,S.s,clamp(S.z||0,-1,1));if(p)consider(Math.max(0,Math.hypot(p.x-w.x,p.y-w.y)-3),{k:'arrow',S});}
  if(view==='side')for(const r of ROPES){const p=ropePos(r.a),q=ropePos(r.b);for(const pt of [p,q,{x:(p.x+q.x)/2,y:(p.y+q.y)/2}])consider(Math.hypot(pt.x-w.x,pt.y-w.y),{k:'rope',r});}
  if(!best){emitLog('Nothing to remove there','info');return;}
  FX.push({k:'ring',x:w.x,y:w.y,t:0,life:0.4});
  if(best.k==='wrap'){const {seg,W}=best;seg.wraps.splice(seg.wraps.indexOf(W),1);let n=0;for(const wd of seg.wounds){if(!wd.wrapped)continue;const c=woundCenter(wd);if(c.s>=W.s0-0.7&&c.s<=W.s1+0.7&&!inWrap(seg,c.s)){wd.wrapped=false;wd.band=false;wd.clampV=[];for(const f of FW)if(f.ref===wd)f.band=false;n++;}}recomputeClamps();emitLog('Unwrapped bandage · '+seg.label.toLowerCase()+(n?' · '+n+' wound'+(n>1?'s':'')+' exposed':''),'info');return;}
  if(best.k==='arrow'){pullArrow(best.S);return;}
  if(best.k==='knife'){unplugKnife(best.K,false);emitSound('slice');emitLog('Knife pulled out of '+best.K.seg.label.toLowerCase()+' · bleeding picks up','bad');return;}
  if(best.k==='wound'){const {seg,wd}=best;
    if(!wd.band&&wd.pack){wd.pack=false;recomputeClamps();emitLog('Gauze pulled out · '+seg.label.toLowerCase()+' bleeds again','bad');}
    else if(wd.band){wd.band=false;wd.clampV=[];for(const f of FW)if(f.ref===wd)f.band=false;recomputeClamps();emitLog('Bandage removed · '+seg.label.toLowerCase(),'info');}
    else{wd.sutStart=false;wd.sut=0;for(const v of wd.ligV||[])v.lig=false;wd.ligV=[];hurt(seg,woundCenter(wd).s,woundCenter(wd).w,6);emitLog('Stitches removed · '+seg.label.toLowerCase()+' wound reopened','bad');}}
  else if(best.k==='rope'){ROPES.splice(ROPES.indexOf(best.r),1);emitLog('Rope untied','info');}
  else if(best.k==='tq'){best.seg.tq=null;best.seg.tqV=[];recomputeClamps();emitLog('Tourniquet removed · '+best.seg.label.toLowerCase()+', blood flow restored','info');}
  else if(best.k==='obj'){const o=best.o;OBJ.splice(OBJ.indexOf(o),1);emitLog({c4:'C4 removed and defused',mine:'Landmine dug up and defused',grenade:'Grenade removed',brick:'Brick removed',ball:'Bowling ball removed'}[o.type]||'Object removed','info');}
  else{GIBS.splice(GIBS.indexOf(best.g),1);emitLog('Debris removed','info');}
}
// a tight tourniquet (≈250–300 mmHg on the thigh, above arterial pressure) stops nearly all flow below it: wounds and
// cut vessels distal to it bleed ≈2% of their open rate (collateral flow through bone and deep muscle)
function tqFactor(){let any=false;const full=new Set(),part=[];for(const g of segs){if(g.tq==null||!g.connected)continue;any=true;part.push(g);for(const d of distalOf(g))if(d!==g)full.add(d);}
  if(!any)return ()=>1;return (seg,ls)=>full.has(seg)||(part.includes(seg)&&ls>=seg.tq-1)?0.02:1;}
function tourniquet(w){
  const b=bodyAt(w);
  if(!b||!['uarm','farm','hand','thigh','shin','foot'].includes(b.seg.kind)){emitLog('Tap an arm or a leg','info');return;}
  let seg=b.seg;let s=clamp(b.s,2,seg.len-2);
  if(seg.kind==='hand'){seg=SEG[seg.side+'Forearm'];s=seg.len*0.7;}if(seg.kind==='foot'){seg=SEG[seg.side+'Shin'];s=seg.len*0.8;}
  seg.tq=s;seg.tqV=[];let k=0;
  for(const d of distalOf(seg))for(const v of d.vessels){if(d!==seg||!v.at||v.at.s>=s-1){seg.tqV.push(v);if(v.cut>0&&!v.clamp&&!v.lig)k++;v.clamp=true;}}
  hurt(null,0,0,18);FX.push({k:'ring',x:w.x,y:w.y,t:0,life:0.5});
  emitLog('Tourniquet on '+seg.label.toLowerCase()+(k?' · '+k+' bleed'+(k>1?'s':'')+' controlled':' · nothing bleeding below'),'good');
}
function defib(){
  const cx=P[SEG.chest.a].x,cy=(P[SEG.chest.a].y+P[SEG.chest.b].y)/2;
  FX.push({k:'shock',x:view!=='side'?0:cx,y:view!=='side'?-128:cy,t:0,life:0.35});emitSound('zap');
  for(const s of [SEG.chest,SEG.abd,SEG.nearUpperArm,SEG.farUpperArm,SEG.head])for(const i of [s.a,s.b]){P[i].py+=rnd(20,45)*(hPrev||1/360);}
  if(V.dead){emitLog('Shock delivered · no response, subject is deceased','info');return;}
  if(!V.arrest){hurt(null,0,0,40);emitLog('Shock delivered to a beating heart · pain, arrhythmia risk','bad');if(Math.random()<0.25)arrest('Shock induced ventricular fibrillation');return;}
  const p=Math.min(0.97,0.55+0.4*Math.min(1,DR.adr.l)+0.25*Math.min(1,DR.ami.l));
  if(shockable()&&Math.random()<p){V.arrest=false;V.hr=115;V.phase=0;V.lowSpT=0;emitLog('Shock delivered · return of spontaneous circulation','good');}
  else if(shockable())emitLog('Shock delivered · still in VF, shock again or give adrenaline','info');
  else emitLog('Shock delivered · no shockable rhythm'+(V.blood/5000<0.33?' (transfuse first)':ORG.heart.hp<20?' (heart too damaged)':''),'info');
}
function fluids(kind,w){
  if(V.dead){emitLog('No circulation, fluids have no effect','info');return;}
  FX.push({k:'syr',x:w.x,y:w.y,t:0,life:0.8,col:kind==='blood'?'#b3121d':'rgba(200,225,240,.95)'});   // packed red cells are dark red; saline is clear
  V.blood=Math.min(5600,V.blood+500);if(kind==='blood')V.rbc=Math.min(5600,V.rbc+500);
  emitLog((kind==='blood'?'Transfused 500 ml blood':'Infused 500 ml saline')+' · '+Math.round(V.blood)+' ml circulating','good');
}
function inspect(s){
  const parts=[];
  for(const o of s.organs)if(o.hp<100)parts.push(o.name+' '+Math.round(o.hp)+'%');
  for(const b of s.bones){if(b.broken)parts.push(b.name+' fractured');}
  if(s.ribsBroken)parts.push(s.ribsBroken+' ribs fractured');
  {const bs=s.wounds.filter(w=>w.type==='burn'&&!w.graft);if(bs.length)parts.push(bs.length+' burn'+(bs.length>1?'s':'')+' (worst: '+['','1st','2nd','3rd'][Math.max(...bs.map(w=>w.deg||3))]+' degree)');}
  {const n=LODGED.filter(L=>L.seg===s).length;if(n)parts.push(n+' bullet'+(n>1?'s':'')+' lodged');}
  for(const v of s.vessels)if(v.cut>0)parts.push(v.name+(v.clamp?' (controlled)':' bleeding'));
  const open=s.wounds.filter(w=>!w.band&&(w.type==='hole'||w.type==='cut'||w.type==='stump')).length;if(open)parts.push(open+' open wound'+(open>1?'s':''));
  if(!s.connected)parts.unshift('detached');
  emitLog(s.label+' · '+(parts.length?parts.join(', '):'no injuries'),'info');
}

/* ---------- where a needle can go (complex mode) ----------
   IV: forearm and back-of-hand veins, the antecubital fossa (inside of the elbow), the external jugular in the neck, dorsal foot veins,
       the great saphenous vein just in front of the ankle.
   IO: intraosseous needle into the marrow of the proximal tibia (2 cm below the knee) or the humeral head; drugs reach the heart as fast as IV.
   IM: deltoid (upper third of the upper arm), vastus lateralis (outer thigh) · only drugs licensed for IM. */
const IV_ONLY=new Set(['painkiller','txa','amiodarone','antivenom','cyanokit','flumazenil','inhibitor','ultra','serum','radx','blood','saline']);
function injSite(seg,s){if(!seg||!seg.connected)return null;const f=s/(seg.len||1);
  switch(seg.kind){
    case 'farm':return{route:'IV',name:'forearm vein'};
    case 'hand':return{route:'IV',name:'vein on the back of the hand'};
    case 'neck':return{route:'IV',name:'external jugular vein'};
    case 'foot':return{route:'IV',name:'dorsal foot vein'};
    case 'uarm':return f>0.72?{route:'IV',name:'antecubital vein (inside of the elbow)'}:f<0.14?{route:'IO',name:'humeral head (intraosseous)'}:{route:'IM',name:'deltoid muscle'};
    case 'thigh':return{route:'IM',name:'vastus lateralis (thigh muscle)'};
    case 'shin':return f<0.16?{route:'IO',name:'proximal tibia (intraosseous)'}:f>0.86?{route:'IV',name:'great saphenous vein at the ankle'}:null;}
  return null;}
