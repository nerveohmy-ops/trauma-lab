/* TRAUMA_LAB_MAIN */
/* ===== ctrl/chemistry.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
// how much each tap / second of pouring delivers: Drop · Small · Normal · Large · Max (the Amount buttons above the tool bar)
const CHEMQ=[0.1,0.5,1,2.5,5];
const chemF=()=>CHEMQ[clamp(OPT.chemq??2,0,CHEMQ.length-1)];
// custom amount (index 5): exactly what the player typed, in mL for liquids and g for metals and powders
const chemCustom=()=>OPT.chemq===5&&OPT.chemc>0;
function chemBase(key){const d=CHEM[key];return d.metal?0.3:d.powder?1:key==='ind'?0.5:key==='water'?40:10;}
function chemFk(key){return chemCustom()?Math.min(OPT.chemc,CHEM[key].metal?50:CHEM[key].powder?500:1e6)/chemBase(key):chemF();}
// the pool: presets add 100× more than a tap elsewhere (0.1 · 0.5 · 1 · 2.5 · 5 L of a liquid), a custom amount goes in as typed
function poolAmt(key){const d=CHEM[key];if(chemCustom())return Math.min(OPT.chemc,d.metal?50:d.powder?500:1e6);return chemBase(key)*chemF()*(key==='water'?25:100)*(d.metal?0.1:1);}
const fmtAmt=(v,g)=>g?(v>=1000?+(v/1000).toFixed(2)+' kg':+v.toFixed(v<1?2:1)+' g'):(v>=1000?+(v/1000).toFixed(2)+' L':+v.toFixed(v<1?2:1)+' mL');
// what one tap gives with this tool, for the button labels
function chemAmt(id,f){const key=chemKey(id),d=CHEM[key];if(!d)return'';const r=x=>x>=10?Math.round(x):x>=1?+x.toFixed(1):+x.toFixed(2);
  return d.metal?r(0.3*f)+' g':d.powder?r(1*f)+' g':r((key==='ind'?0.5:key==='water'?40:10)*f)+' mL';}
function chemTap(tool,w){const key=chemKey(tool),d=CHEM[key];if(!d)return;const front=view!=='side';
  const pool=view==='side'?poolAt(w.x,w.y):null;
  // the pool: poured from above the rim as a real stream (big amounts take seconds to run in)
  if(pool){const amt=poolAmt(key),top=pool.y-pool.oy+POOLD.rim-22,x=clamp(w.x,pool.x-pool.ox+POOLD.x0+6,pool.x-pool.ox+POOLD.x1-6);pourBig(key,x,Math.min(top,w.y),amt,false);emitSound(d.metal||d.powder?'tink':'whoosh',0.25);
    emitLog('Pouring '+fmtAmt(amt,d.metal||d.powder)+' of '+d.n.toLowerCase()+' into the pool','info');return;}
  const pr=view==='side'?propAt(w):null;
  if(pr&&isBeaker(pr)&&!pr.dead){const f=chemFk(key),r1=x=>x>=5?Math.round(x):+x.toFixed(1),amt=chemCustom()?Math.min(OPT.chemc,d.metal?50:d.powder?500:pr.cap):d.metal?r1(0.3*f):d.powder?r1(2*f):key==='ind'?r1(0.5*f):key==='ln2'||key==='water'?r1(pr.cap*0.2*f):r1(Math.max(1,pr.cap*0.1*f));
    addChem(pr,key,amt);emitSound('tink',0.25);emitLog(d.n+' · +'+amt+(d.metal||d.powder?' g':' mL')+' → '+Math.round(pr.mix.vol)+' / '+pr.cap+' mL','info');return;}
  // anywhere else: a measured splash, pellet or pinch of powder falls from where you tapped
  const F=chemFk(key);
  // a big amount anywhere else: it pours out as a stream instead of appearing at once
  {const tot=chemBase(key)*F;if(!d.metal&&!d.powder&&tot>60){pourBig(key,w.x,w.y-(front?0:6),tot,front);const b=bodyAt(w);if(b)emitLog('Pouring '+fmtAmt(tot)+' of '+d.n.toLowerCase()+' over the '+b.seg.label.toLowerCase(),'bad');return;}
   if((d.metal&&tot>3)||(d.powder&&tot>20)){pourBig(key,w.x,w.y,tot,front);return;}}
  if(d.metal){dropSolid(key,w,+(0.3*F).toFixed(2),front);return;}
  if(d.powder){const n=Math.min(60,Math.max(1,Math.round(10*F)));for(let i=0;i<n;i++)dropSolid(key,{x:w.x+rnd(-1,1),y:w.y+rnd(-0.6,0.6)},F/n,front);return;}
  const p=pureProf(key),vol=+((key==='ind'?0.5:key==='water'?40:10)*F).toFixed(2),n=Math.max(1,Math.min(60,Math.ceil(vol/0.8)));
  for(let i=0;i<n;i++){if(front)FDROPS.push({x:w.x+rnd(-1.2,1.2),y:w.y-rnd(0,4),vy:rnd(0,20),vol:vol/n,p,v:view});else DROPS.push({x:w.x+rnd(-1.5,1.5),y:w.y-rnd(0,5),vx:rnd(-8,8),vy:rnd(0,30),t:0,vol:vol/n,p});}
  const b=bodyAt(w);if(b)emitLog(key==='water'?'Water poured over the '+b.seg.label.toLowerCase()+' · rinsing chemicals off':'Poured '+vol+' mL of '+d.n.toLowerCase()+' on the '+b.seg.label.toLowerCase(),key==='water'?'good':'bad');}
// hold the finger: the bottle keeps pouring (liquids), dropping pellets (metals) or shaking out powder
function pourStep(dt){
  if(!drag||drag.probe||!pointerW||!isChemTool(tool))return;
  drag.hold=(drag.hold||0)+dt;if(drag.hold<0.22)return;drag.chemPoured=true;
  const key=chemKey(tool),d=CHEM[key],w=pointerW,front=view!=='side';
  const F=chemFk(key);
  if(d.metal){drag.acc=(drag.acc||0)+dt;if(drag.acc>=0.45){drag.acc=0;dropSolid(key,w,+(0.3*F).toFixed(2),front);}return;}
  if(d.powder){drag.acc=(drag.acc||0)+dt*2*F;const pm=Math.max(0.1,dt*2*F/4);while(drag.acc>=pm){drag.acc-=pm;dropSolid(key,{x:w.x+rnd(-0.8,0.8),y:w.y+rnd(-0.5,0.5)},pm,front);}return;}
  const p=drag.prof||(drag.prof=pureProf(key)),rate=(POUR[key]||12)*F;drag.acc=(drag.acc||0)+rate*dt;const dv=Math.max(0.8,rate*dt/6);
  while(drag.acc>=dv){drag.acc-=dv;if(front)FDROPS.push({x:w.x+rnd(-0.4,0.4),y:w.y,vy:rnd(0,15),vol:dv,p,v:view});else DROPS.push({x:w.x+rnd(-0.4,0.4),y:w.y,vx:rnd(-4,4),vy:rnd(0,20),t:0,vol:dv,p});}
  if(!drag.saidPour){drag.saidPour=1;emitLog('Pouring '+d.n.toLowerCase()+' · keep holding','info');}
}
