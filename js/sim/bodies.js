/* TRAUMA_LAB_MAIN */
/* ===== sim/bodies.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
/* =========================================================
   SEVERAL PEOPLE IN ONE WORLD
   The body simulation keeps one person in plain globals (P, segs, SEG, ORG, V, DR, WEAR…). Every other person (a guard
   in story mode) keeps his own copy of those globals: to step, shoot or draw him, his copy is loaded, the same code runs
   on it, and the subject's copy is loaded back. So a guard has the whole anatomy, physiology and bleeding of the subject.
   The world (props, bullets, blood on the floor, the log) is shared by everyone.
   ========================================================= */
let BID=0;              // who is loaded in the body globals: 0 = the subject, otherwise a guard's id
let ACT={on:false};     // what drives the loaded body: the player's STORY state, or a guard's own (set in sim/story)
const BODY0={id:0,name:'',st:null};let BCUR=BODY0;
const BODIES=[];        // everyone else
function bodyGet(){return {P,segs,joints,SEG,ORG,BONES,VESSELS,ORDER,V,DR,FW,FP,WEAR,FEMALE,LODGED,FRACQ,GUTS,STRANDS,NOBREATH,ACT,FACE};}
function bodySet(s){({P,segs,joints,SEG,ORG,BONES,VESSELS,ORDER,V,DR,FW,FP,WEAR,FEMALE,LODGED,FRACQ,GUTS,STRANDS,NOBREATH,ACT,FACE}=s);}
function bodyUse(b){if(b===BCUR)return;BCUR.st=bodyGet();bodySet(b.st);b.st=null;BID=b.id;BCUR=b;}
function withBody(b,fn){const pv=BCUR;bodyUse(b);try{return fn(b);}finally{bodyUse(pv);}}
// run fn once with each person loaded, the subject first
function forBodies(fn){withBody(BODY0,fn);for(const b of BODIES)withBody(b,fn);}
function bodiesClear(){if(BCUR!==BODY0)bodyUse(BODY0);BODIES.length=0;}
// a new adult man standing at x (cm), wearing `wear` (WEAR keys); his story controls start idle
function spawnPerson(x,o){o=o||{};const b={id:(spawnPerson.n=(spawnPerson.n||0)+1),name:o.name||'Guard',st:null};
  const w=JSON.parse(JSON.stringify(WEAR));for(const k in w){w[k].on=(o.wear||['under']).includes(k);if(w[k].hp!=null)w[k].hp=100;}
  b.st=Object.assign(bodyGet(),{P:[],segs:[],joints:[],SEG:{},ORG:{},BONES:[],VESSELS:[],ORDER:[],V:null,DR:null,FW:[],WEAR:w,FEMALE:false,LODGED:[],FRACQ:[],GUTS:[],STRANDS:[],NOBREATH:false,
    FACE:1,ACT:Object.assign({on:true,dir:0,run:false,duckK:0,jy:0,vault:null,prone:false,busy:null,fist:null,passT:0,sitK:0},o.act)});
  BODIES.push(b);
  withBody(b,()=>{makeBody();const dx=x-(P[SEG.chest.a].x+P[SEG.abd.b].x)/2;for(const p of P){p.x+=dx;p.px+=dx;}V.anchorX=null;if(o.face===-1)bodyTurn(x);});
  return b;}
// people on their feet don't pass through each other. Every body point is a sphere (its radius) and every segment a
// tapered capsule; where a point of one person sinks into a segment of another, both are pushed apart in proportion to
// their inverse masses, at most 0.4 cm per 1/360 s step (≈1.4 m/s): a body pushed in by a teleport is eased out
// instead of being shot out (a forced pull faster than ≈1 cm per step injures the ragdoll). Someone lying on the floor
// is not in the way: the corridor has depth the side view doesn't show, and you walk past him, not into him
function bodyContacts(){const L=[BODY0,...BODIES].map(b=>{const s=b===BCUR?bodyGet():b.st;let x0=1e9,x1=-1e9;for(const p of s.P){if(p.gone)continue;if(p.x<x0)x0=p.x;if(p.x>x1)x1=p.x;}return{P:s.P,segs:s.segs,x0,x1,up:s.V.rise>0.3};});
  for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i],b=L[j];if(!a.up||!b.up||a.x1+12<b.x0||b.x1+12<a.x0)continue;bodyPush(a,b);bodyPush(b,a);}}
function bodyPush(a,b){for(const p of a.P){if(p.gone)continue;for(const s of b.segs){if(s.gone)continue;const A=b.P[s.a],B=b.P[s.b];
  const r=dps(p.x,p.y,A.x,A.y,B.x,B.y),RR=p.r+rad(s,r.t);if(r.d>=RR||r.d<1e-4)continue;
  const nx=(p.x-r.qx)/r.d,ny=(p.y-r.qy)/r.d,t=r.t,sim=(1-t)*A.im+t*B.im,k=Math.min(0.4,RR-r.d)/(p.im+sim||1);
  p.x+=nx*k*p.im;p.y+=ny*k*p.im;A.x-=nx*k*A.im*(1-t);A.y-=ny*k*A.im*(1-t);B.x-=nx*k*B.im*t;B.y-=ny*k*B.im*t;}}}
// every 1/60 s: each other person's physiology, bleeding and what his wounds do on their own
function bodiesTick(dt){for(const b of BODIES)withBody(b,()=>{if(typeof guardStep==='function')guardStep(dt);physio(dt);bleedBody(dt);strandStep(dt);fracStep();openFracStep(dt);evisStep(dt);gutStep(dt);});}
