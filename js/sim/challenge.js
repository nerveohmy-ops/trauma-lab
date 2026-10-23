/* TRAUMA_LAB_MAIN */
/* ===== sim/challenge.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
/* =========================================================
   CHALLENGE MODE · "Keep him alive"
   A real emergency starts; you treat it with the Medicine tab only. Every case runs on the normal physiology:
   the bleeding, the drugs, the heart and the lungs behave exactly as in the sandbox. You win when he has been
   stable for long enough (bleeding controlled, pressure and oxygen holding); you lose if he dies, or if his
   systolic pressure stays under 60 mmHg (shock past the point of compensation) for 6 s.
   ========================================================= */
const CH_STABLE=15;   // s of continuous stability needed to win
const CH_BLEED=0.4;   // mL/s: a controlled ooze (≈25 mL/min) counts as bleeding stopped
function chArtery(segId){const g=SEG[segId];let best=null;for(const v of g.vessels){if(v.type!=='a')continue;if(!best||v.rate>best.rate)best=v;}return best;}
function chCut(v,amt){if(!v)return;const m=v.pts[Math.floor(v.pts.length/2)];cutVessel(v,amt,{s:m[0],w:m[1],dw:1,ds:0},[]);}
function chHole(segId,s,w,r,bleed){const g=SEG[segId];return addWound(g,{type:'hole',s,w,r,bleed,dw:Math.sign(w)||1,ds:0,z:0.85});}
const CASES=[
  // ---------- trauma ----------
  {id:'gsw',kind:'trauma',scene:'battle',name:'Gunshot · thigh',who:'Soldier, 24',
   brief:'9 mm round through the left thigh. The femoral artery is torn: up to ≈1 L per minute can be lost.',
   tip:'Tourniquet high on the thigh, pack the hole with gauze, then blood. TXA within 3 h cuts deaths from bleeding.',
   setup(){const g=SEG.nearThigh,s=g.len*0.38;chHole('nearThigh',s,g.ra*0.9,0.55,0.5);chHole('nearThigh',s+1.5,-g.ra*0.9,0.9,0.6);chCut(chArtery('nearThigh'),0.75);hurt(g,s,0,30);},
   ok(){return V.ext+V.int<CH_BLEED&&V.sys>=85&&!V.arrest;}},
  {id:'sword',kind:'trauma',scene:'medieval',name:'Sword cut · arm',who:'Squire, 19',
   brief:'A blade opened the inner upper arm and cut the brachial artery. Bright red, pulsing.',
   tip:'Tourniquet above the cut, then suture or clamp the vessel (Surgery). Replace lost blood.',
   setup(){const g=SEG.nearUpperArm,s=g.len*0.55;addWound(g,{type:'cut',s:s-3,w:g.ra*0.85,s2:s+3,w2:g.ra*0.8,r:0.5,len:6,bleed:0.7,live:false,dw:1,ds:0,z:0.85});chCut(chArtery('nearUpperArm'),0.8);hurt(g,s,0,28);},
   ok(){return V.ext+V.int<CH_BLEED&&V.sys>=85&&!V.arrest;}},
  {id:'openfx',kind:'trauma',scene:'er',name:'Open fracture · shin',who:'Motorcyclist, 31',
   brief:'The tibia snapped and broke through the skin, tearing a shin artery. Bleeding from the bone ends, severe pain.',
   tip:'Tourniquet above the knee for the arterial bleed, gauze and bandage on the wound, a bone plate (Ortho), morphine or ketamine for the pain.',
   setup(){const g=SEG.nearShin,b=g.bones.find(x=>x.shape==='line');if(b)hitBone(b,999,[],null);const w=chHole('nearShin',g.len*0.5,g.ra*0.95,1.2,0.9);w.jag=[];for(let i=0;i<10;i++)w.jag.push(rnd(0.7,1.25));w.rot=rnd(0,6.28);chCut(chArtery('nearShin'),0.45);hurt(g,g.len*0.5,0,70);},
   ok(){const b=SEG.nearShin.bones.find(x=>x.shape==='line');return V.ext+V.int<CH_BLEED&&V.sys>=85&&V.painEff<45&&(!b||!b.broken||!!b.plates);}},
  // ---------- heart ----------
  {id:'mi',kind:'arrest',scene:'er',name:'Heart attack · cardiac arrest',who:'Man, 72',
   brief:'A blocked coronary artery is killing heart muscle. In seconds the rhythm will collapse into ventricular fibrillation.',
   tip:'VF is shockable: Defib. Adrenaline every few minutes, amiodarone after the 3rd shock keeps the rhythm stable.',
   setup(){ORG.heart.hp=38;CH.vfAt=T+8;},
   step(dt){if(CH.vfAt&&T>CH.vfAt&&!V.arrest){CH.vfAt=0;arrest('Heart attack · ventricular fibrillation');CH.hadArrest=true;}
     // the first minute after a heart restarts is unstable: VF can come back unless amiodarone calms the muscle
     if(!V.arrest&&CH.hadArrest&&T-CH.roscT<60&&Math.random()<0.012*dt*60/60*(1-0.8*Math.min(1,DR.ami.l))){arrest('VF again · the heart muscle is still irritable');}
     if(V.arrest)CH.roscT=T;},
   ok(){return CH.hadArrest&&!V.arrest&&V.sys>=60&&T-CH.roscT>=15;}},
  {id:'rupture',kind:'surgery',scene:'er',name:'Heart wall rupture · needs surgery',who:'Woman, 78',
   brief:'Days after a heart attack the dead muscle tore. Blood leaks into the sac around the heart and the pressure is falling.',
   tip:'Fluids and blood to buy time, then Surgery on the chest to repair the heart. Defib if it fibrillates.',
   setup(){ORG.heart.hp=44;ORG.heart.ib=Math.max(ORG.heart.ib||0,0.8);},
   ok(){return (ORG.heart.rep||ORG.heart.hp>=70)&&V.sys>=80&&!V.arrest;}},
  // ---------- drugs and poisons ----------
  {id:'opioid',kind:'medical',scene:'lab',name:'Opioid overdose',who:'Man, 29 · found unresponsive',
   brief:'Fentanyl has switched off his drive to breathe. Pinpoint pupils, oxygen falling minute by minute.',
   tip:'Naloxone reverses opioids within a minute. It wears off sooner than fentanyl: watch for him going back under.',
   setup(){DR.fen.p+=11;DR.fen.total++;},
   ok(){return V.resp>=10&&V.spo2>=92&&!V.arrest;}},
  {id:'benzo',kind:'medical',scene:'lab',name:'Sleeping pills + alcohol',who:'Woman, 45',
   brief:'A benzodiazepine overdose on top of alcohol: deep sedation and slow, shallow breathing.',
   tip:'Flumazenil reverses the benzodiazepine (it can trigger seizures in long-term users). The alcohol has no antidote: wait it out.',
   setup(){DR.sed.p+=9;DR.sed.total++;DR.alc.p+=3;DR.alc.total++;},
   ok(){return V.resp>=10&&V.spo2>=92&&!V.arrest;}},
  {id:'cyanide',kind:'medical',scene:'er',name:'House fire · cyanide',who:'Firefighter, 38',
   brief:'Burning plastics released hydrogen cyanide. His cells cannot use oxygen even though SpO₂ looks fine.',
   tip:'Cyanide antidote (hydroxocobalamin) binds the cyanide. Support the pressure with fluids.',
   setup(){DR.cyn.p+=2.0;DR.cyn.total++;},
   ok(){return DR.cyn.l<0.25&&V.sys>=85&&!V.arrest;}},
  {id:'snake',kind:'medical',scene:'tent',name:'Snake bite',who:'Ranger, 34',
   brief:'A viper bit the left foot. The venom stops blood clotting and attacks blood vessels.',
   tip:'Antivenom neutralises it, but one dose too many can trigger anaphylaxis: keep adrenaline ready.',
   setup(){chHole('nearFoot',SEG.nearFoot.len*0.5,0.8,0.25,0.08);chHole('nearFoot',SEG.nearFoot.len*0.5+1,0.8,0.25,0.08);DR.ven.p+=3;DR.ven.total++;},
   ok(){return DR.ven.l<0.3&&V.sys>=85&&(V.anaph||0)<0.08&&!V.arrest;}},
  {id:'anaph',kind:'medical',scene:'tent',name:'Bee sting · anaphylaxis',who:'Hiker, 26',
   brief:'A severe allergy: the airway is swelling shut and the blood vessels are dilating. It gets worse fast.',
   tip:'Adrenaline is the treatment (0.5 mg IM in real life, repeat after 5 min). Fluids for the pressure.',
   setup(){V.anaph=0.45;},
   // without adrenaline the reaction keeps building (net ≈ +0.015 /s against the body's own clearance)
   step(dt){if(!CH.done&&DR.adr.l<0.2)V.anaph=Math.min(1,(V.anaph||0)+dt*0.035);},
   ok(){return (V.anaph||0)<0.05&&V.spo2>=92&&V.sys>=85&&!V.arrest;}},
];
let CH=null;
// tools that would make it trivial or are not medicine
const CH_BANNED=new Set(['ultra','serum','inhibitor','zvirus','cyanide','venom','arsenic','cocaine','lsd','alcohol','caffeine']);
function chStart(id){const C=id&&id!=='random'?CASES.find(c=>c.id===id):CASES[Math.floor(Math.random()*CASES.length)];
  CH={c:C,t0:0,el:0,stable:0,low:0,arrestT:0,done:false,result:null,hadArrest:false,roscT:0,vfAt:0,shown:false,on:true,prevScene:OPT.scene||'lab'};
  return C;}
// called by the UI after reset() so the patient is fresh
function chBegin(){if(!CH)return;chBed();CH.c.setup();CH.t0=T;emitLog('Challenge · '+CH.c.name+' · '+CH.c.who,'bad');emitLog(CH.c.brief,'info');}
function chStep(dt){if(!CH||!CH.on||CH.done)return;const C=CH.c;CH.el=T-CH.t0;if(C.step)C.step(dt);
  if(V.arrest&&!V.bypass)CH.arrestT+=dt;
  // stability only counts once he has actually been in trouble (or after a minute if you treated before the first symptoms)
  const good=C.ok();if(!good)CH.sick=true;
  if(good&&(CH.sick||CH.el>60)){CH.stable+=dt;}else CH.stable=0;
  if(C.kind!=='arrest'&&V.sys<60)CH.low+=dt;else CH.low=0;
  // the brain tolerates SpO2 under ≈50% (PaO2 ≈ 27 mmHg) only briefly before hypoxic injury
  if(!V.arrest&&V.spo2<50)CH.hyp=(CH.hyp||0)+dt;else CH.hyp=0;
  let lose=null;
  if(V.dead)lose='He died · '+(V.deathWhy||'');
  else if(CH.low>6)lose='Systolic pressure under 60 mmHg for too long · irreversible shock';
  else if(ORG.brain.hp<30)lose='Severe brain damage · his brain cells were starved of oxygen';
  else if(CH.hyp>30)lose='Oxygen under 50% for 30 s · hypoxic brain injury';
  else if(CH.arrestT>240)lose='Four minutes without circulation · the brain could not be saved';
  if(lose){CH.done=true;CH.result={win:false,why:lose,t:CH.el};emitUI('challenge');return;}
  if(CH.stable>=CH_STABLE){CH.done=true;
    // score: speed, blood he kept and comfort; the clock stops when he became stable
    const t=CH.el-CH_STABLE,score=Math.round(Math.max(150,1400-t*4)+clamp(V.blood/5000,0,1.2)*300+(100-clamp(V.painEff,0,100))*2);
    CH.result={win:true,t,score};emitUI('challenge');}
}
// props that belong to the scene, placed beside him when there is room (the room width depends on the map size)
function sceneSpawn(){const sc=OPT.scene||'lab';if(CH&&CH.on)return;if(STORY.on)return;
  if((sc==='er'||sc==='tent')&&ROOM>=215)spawnProp('gurney',Math.min(ROOM-97,118),0,0,0,null);
  if(sc==='medieval'&&ROOM>=110)spawnProp('table',Math.min(ROOM-50,70),0,0,0,null);}
// ---------- the patient lies down: supine, head to the left, on whatever this place has to lie on ----------
const BEDS={er:['gurney',-88.6],tent:['stretcher',-20.3],medieval:['slab',-80.9],battle:['stretcher',-20.3],lab:[null,-0.2]};
function layPatient(xc,ys){
  const live=P.filter(p=>!p.gone);let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const p of live){x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);y0=Math.min(y0,p.y-(p.r||1));y1=Math.max(y1,p.y+(p.r||1));}
  const cx=(x0+x1)/2,my=(y0+y1)/2;let minRel=1e9;for(const p of live)minRel=Math.min(minRel,(p.x-cx)-(p.r||1));
  // standing → supine: up becomes left, the front of the body becomes up, the back rests on the surface
  for(const p of P){const nx=xc+(p.y-my),ny=ys-((p.x-cx)-minRel);p.x=p.px=nx;p.y=p.py=ny;}
  V.rise=0;V.patient=true;}
function chBed(){const sc=OPT.scene||'lab',b=BEDS[sc]||BEDS.lab;layPatient(4,b[1]-(b[0]?3:0));if(b[0])spawnProp(b[0],0,0,0,0,null);}
