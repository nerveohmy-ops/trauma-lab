/* TRAUMA_LAB_MAIN */
/* ===== sim/physiology.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
/* =========================================================
   DRUGS
   ========================================================= */
const DRUGS={
  painkiller:{key:'pk', name:'Paracetamol 1 g',     short:'Paracetamol', onset:0.12,half:300,col:'#9fd3ff'},
  morphine:  {key:'mor',name:'Morphine 10 mg',      short:'Morphine',    onset:0.35,half:150,col:'#c9a6ff'},
  adrenaline:{key:'adr',name:'Adrenaline 1 mg',     short:'Adrenaline',  onset:1.5, half:30, col:'#ff9a5c'},
  naloxone:  {key:'nal',name:'Naloxone 0.4 mg',     short:'Naloxone',    onset:1.0, half:60, col:'#6fe39a'},
  txa:       {key:'txa',name:'Tranexamic acid 1 g', short:'TXA',         onset:0.3, half:400,col:'#f2b441'},
  sedative:  {key:'sed',name:'Midazolam 5 mg',      short:'Midazolam',   onset:0.35,half:120,col:'#8fb0ff'},
  fentanyl:  {key:'fen',name:'Fentanyl 100 mcg',    short:'Fentanyl',    onset:1.4, half:80, col:'#b38cff'},
  ketamine:  {key:'ket',name:'Ketamine 50 mg',      short:'Ketamine',    onset:1.0, half:110,col:'#7fd6c9'},
  atropine:  {key:'atr',name:'Atropine 1 mg',       short:'Atropine',    onset:1.2, half:140,col:'#ffd36b'},
  amiodarone:{key:'ami',name:'Amiodarone 300 mg',   short:'Amiodarone',  onset:0.6, half:600,col:'#ff7fa8'},
  caffeine:  {key:'caf',name:'Caffeine',           short:'Caffeine',    onset:0.5, half:400,col:'#c8a27a'},
  alcohol:   {key:'alc',name:'Alcohol',            short:'Alcohol',     onset:0.3, half:300,col:'#e6c75a'},
  cocaine:   {key:'coc',name:'Cocaine',            short:'Cocaine',     onset:1.2, half:90, col:'#f0f0f0'},
  lsd:       {key:'lsd',name:'LSD',                short:'LSD',         onset:0.25,half:500,col:'#ff7ae6'},
  cyanide:   {key:'cyn',name:'Cyanide',            short:'Cyanide',     onset:1.5, half:900,col:'#9be37a'},
  venom:     {key:'ven',name:'Snake venom',        short:'Venom',       onset:0.6, half:900,col:'#b56b2b'},
  arsenic:   {key:'ars',name:'Arsenic',            short:'Arsenic',     onset:0.2, half:900,col:'#a0a8b0'},
  cyanokit:  {key:'ckt',name:'Cyanide antidote',   short:'Cyanokit',    onset:1.2, half:120,col:'#ff4a4a'},
  antivenom: {key:'avn',name:'Antivenom',          short:'Antivenom',   onset:0.8, half:200,col:'#7fd0ff'},
  chelator:  {key:'chl',name:'Chelator (BAL)',     short:'Chelator',    onset:0.6, half:200,col:'#d3b8ff'},
  zvirus:    {key:'zom',name:'Zombie virus',       short:'Z-virus',     onset:2,   half:1e9,col:'#7fd14a'},
  ultra:     {key:'uls',name:'Ultra serum',        short:'Ultra',       onset:1.2, half:150,col:'#ffd84d'},
  radx:      {key:'rdx',name:'Radiation antidote',  short:'Rad antidote',onset:1.2, half:120,col:'#9ff07a'},
  inhibitor: {key:'inh',name:'Universal inhibitor',    short:'Inhibitor',   onset:1.3, half:90, col:'#ff5d73'},
  serum:     {key:'ser',name:'Super-soldier serum',short:'Serum',      onset:0.8, half:90, col:'#56f0ff'},
  flumazenil:{key:'flu',name:'Flumazenil 0.5 mg',   short:'Flumazenil',  onset:1.2, half:50, col:'#9be37a'},
};
// how the last injection went in: IV (vein), IO (needle into the bone marrow, absorbs like IV) or IM (into a muscle)
let INJ_ROUTE='IV';
function opi(){return DR.mor.l+1.6*DR.fen.l;}
function inject(id,x,y){
  const d=DRUGS[id];
  FX.push({k:'syr',x,y,t:0,life:0.8,col:d.col});
  if(id==='inhibitor'){let had=0;for(const k in DR){if(k==='inh')continue;had+=DR[k].l+DR[k].p;DR[k].l=0;DR[k].p=0;}
    if(REGROW){for(const g of REGROW.list)delete g.growF;REGROW=null;had+=1;}
    let extra='';
    if(V.zombie){had+=1;extra=' · the virus dies, the body drops for good';die('virus inhibited');}
    else if(V.zinf>0){had+=1;extra=V.dead?' · the virus is dead, he will not rise':' · zombie virus wiped out, the rot will fade';V.zinf=0;V.seizeT=0;}
    DR.inh.total++;emitLog(d.name+(had>0.02?' · every drug, serum, poison and virus shut down instantly'+extra:' · nothing in the body to block'),'good');return;}
  if(id==='zvirus'){DR.zom.p+=1;DR.zom.total++;if(V.zombie){emitLog('Zombie virus · he is already undead','info');return;}V.zinf=Math.max(V.zinf||0,V.dead?1:0.02);emitLog(V.dead?'Zombie virus · the corpse twitches… it is coming back':'Zombie virus IV · infection spreading, fever rising','bad');return;}
  if(V.zombie&&id!=='inhibitor'){emitLog(d.name+' · no effect, he has no pulse and the virus owns him','info');return;}
  if(V.dead&&id!=='ultra'){emitLog(d.name+' · no circulation, nothing happens','info');return;}
  const st=DR[d.key];st.total++;
  // IM: the dose sits in the muscle and is picked up by its capillaries over minutes (adrenaline IM peaks ≈ 5–10 min vs ≈ 1 min IV)
  if(INJ_ROUTE==='IM')st.im=(st.im||0)+1;else st.p+=1;
  let msg=d.name+' '+(INJ_ROUTE||'IV');
  if(id==='adrenaline'&&V.arrest){
    if(ORG.heart.hp>=20&&V.blood/5000>=0.33&&SEG.head.connected&&Math.random()<0.35){V.arrest=false;V.hr=128;V.phase=0;V.lowSpT=0;msg+=' · return of spontaneous circulation';}
    else msg+=' · still in arrest, defibrillate';
  }
  if(id==='naloxone'&&opi()>0.3)msg+=' · reversing opioids';
  if(id==='morphine'&&DR.mor.l+DR.mor.p+1.6*(DR.fen.l+DR.fen.p)>3)msg+=' · overdose risk';
  if(id==='fentanyl'&&DR.mor.l+DR.mor.p+1.6*(DR.fen.l+DR.fen.p)>3)msg+=' · overdose risk, watch breathing';
  if(id==='ketamine'&&DR.ket.l+DR.ket.p>1.5)msg+=' · dissociated';
  if(id==='flumazenil'&&DR.sed.l>0.3)msg+=' · reversing midazolam';
  if(id==='atropine'&&V.hr<55)msg+=' · treating bradycardia';
  if(id==='serum')msg+=' · cells regenerating';
  if(id==='cyanide')msg+=' · poisoned: his cells cannot use oxygen';
  if(id==='venom')msg+=' · envenomed: blood stops clotting';
  if(id==='arsenic')msg+=' · poisoned: slow organ damage';
  if(id==='lsd')msg+=' · hallucinating';
  if(id==='cocaine'&&DR.coc.l+DR.coc.p>2)msg+=' · overdose risk: heart rhythm';
  if(id==='alcohol'&&DR.alc.l+DR.alc.p>3)msg+=' · heavily drunk';
  if(id==='cyanokit'&&DR.cyn.l>0.1)msg+=' · binding the cyanide';
  if(id==='antivenom'&&DR.ven.l>0.1)msg+=' · neutralising venom';
  if(id==='chelator'&&DR.ars.l>0.1)msg+=' · pulling arsenic out';
  if(id==='radx')msg+=V.rad>0.05?' · flushing '+V.rad.toFixed(1)+' Gy out, marrow recovering':' · no radiation in the body, it will shield him for a while';
  if(id==='ultra')msg+=V.dead?' · the cells are waking up':' · total regeneration';
  if(id==='amiodarone'&&V.arrest)msg+=' · next shock more likely to work';
  if(id==='sedative'&&DR.sed.l+DR.sed.p>1.6)msg+=' · deep sedation';
  emitLog(msg,'good');
}
function drugStep(dt){
  // muscle depot → blood: needs circulation (no flow in arrest, slow in shock)
  for(const k in DRUGS){const s=DR[DRUGS[k].key];if(s.im>0.002){const m=s.im*Math.min(1,0.06*dt*clamp(V.co||0,0,1.1));s.im-=m;s.p+=m;}else s.im=0;}
  for(const k in DRUGS){const d=DRUGS[k],s=DR[d.key];const mv=s.p*Math.min(1,d.onset*dt);s.p-=mv;s.l+=mv;s.l*=Math.pow(0.5,dt/d.half);if(s.l<0.002&&s.p<0.002&&!(s.im>0.002))s.l=0;}
  if(DR.nal.l>0.05){const r=Math.min(1,DR.nal.l*0.9*dt);DR.mor.l*=1-r;DR.mor.p*=1-r;DR.fen.l*=1-r;DR.fen.p*=1-r;}
  const clr=(a,b,f)=>{if(DR[a].l>0.05){const r=Math.min(1,DR[a].l*f*dt);DR[b].l*=1-r;DR[b].p*=1-r;}};
  clr('ckt','cyn',1.6);clr('avn','ven',1.0);clr('chl','ars',0.5);
  if(DR.flu.l>0.05){const r=Math.min(1,DR.flu.l*1.1*dt);DR.sed.l*=1-r;DR.sed.p*=1-r;}
}
/* =========================================================
   PHYSIOLOGY
   ========================================================= */
function die(why){if(V.zombie){V.zombie=false;V.zdead=true;V.dead=true;V.arrest=true;V.consc=0;V.deadAt=T;V.rise=0;emitLog('Zombie destroyed · '+why,'bad');return;}if(V.dead||OPT.god)return;bulletTime();if(V.consc>0.1||Math.random()<0.6)emitBreath('gurgle');V.dead=true;V.arrest=true;V.consc=0;V.deadAt=T;emitLog('Subject deceased · '+why+' · '+fmtTime(T-V.start),'bad');}
// zombie virus: fever and rot while alive, death, then he rises with no pulse until the brain is destroyed
function zombieTick(dt){
  if(!V.zombie&&!(V.zinf>0)&&V.rot>0)V.rot=Math.max(0,V.rot-dt/60);
  if(V.eyesOut&&ORG.eye.hp>60){V.eyesOut=false;FEYE=[];}
  if(!V.dead&&!V.zombie&&V.zinf>0&&V.zinf<1){V.zinf=Math.min(1,V.zinf+dt/25);V.rot=Math.max(V.rot||0,V.zinf*0.45);V.pain=Math.max(V.pain||0,V.zinf*60);
    if(V.zinf>0.8)V.seizeT=Math.max(V.seizeT||0,0.25);
    if(!zombieTick.w&&V.zinf>0.5){zombieTick.w=1;emitLog('Zombie virus · skin greying, veins darkening','bad');}
    if(V.zinf>=1){zombieTick.w=0;const g=OPT.god;OPT.god=false;die('Zombie virus');OPT.god=g;}}
  if(V.dead&&V.zinf>=1&&!V.zombie&&!V.zdead&&T-V.deadAt>6&&SEG.head.connected&&!SEG.head.gone&&ORG.brain.hp>0){
    V.zombie=true;V.dead=false;V.arrest=true;V.consc=1;V.rise=0;V.riseCD=T+0.8;V.stillT=2;V.rot=Math.max(V.rot||0,0.55);V.fear=0;V.seizeT=0;
    emitLog('He is back… UNDEAD · only destroying the brain stops him','bad');}
  if(!V.zombie)return false;
  V.rot=Math.min(1,(V.rot||0.55)+dt/120);V.hr=0;V.sys=0;V.co=0.06;V.spo2=0;V.resp=0;V.consc=1;V.pain=0;V.painEff=0;V.ko=0;V.brainO2=1;V.arrest=true;V.ext=0;V.int=0;V.flinch=0;
  for(const v of VESSELS)v.now=0;
  if(!SEG.head.connected||SEG.head.gone||ORG.brain.hp<=0){die(SEG.head.connected?'brain destroyed':'head cut off');return true;}
  return true;
}
// Sun gravity (28 g): the weight alone crushes the body flat — bones snap, organs burst, skin splits, eyes pop
function crushStep(dt){
  const gf=G/981;if(gf<10){V.crushT=0;return;}
  V.crushT=(V.crushT||0)+dt;const ct=V.crushT,k=Math.min(1,ct/4),rep=[];
  if(!crushStep.l||ct<dt*1.5){crushStep.l=1;emitLog('Sun gravity · 28 g · his own weight is crushing him','bad');}
  for(const g of segs){if(!g.connected||g.gone)continue;
    // flatten: deep dents along the top side of every part
    const up=dirWorld(g,1,0).y<0?1:-1,rr=Math.max(g.ra,g.rb),want=rr*0.8*k,n=g.kind==='head'?1:g.len>18?3:2;
    g.dents=g.dents||[];for(let i=0;i<n;i++){const s=g.kind==='head'?1.5:g.len*(i+0.5)/n;let d=g.dents.find(q=>q.crush&&q.i===i);if(!d){d={s,w:up*rr*0.95,d:0,r:g.kind==='head'?9:Math.max(6.5,g.len/n*1.1),crush:true,i};g.dents.push(d);if(g.dents.length>6)g.dents.splice(g.dents.findIndex(q=>!q.crush),1);}
      if(d.d<want){d.d=Math.min(want,d.d+rr*0.25*dt);g.icache=null;}}
    if(Math.random()<dt*2.2*Math.min(1,ct)){const bo=g.bones[Math.floor(Math.random()*g.bones.length)];if(bo&&!bo.broken)hitBone(bo,60,rep,{s:g.len*0.5,w:up*rr*0.4,z:0});else if(bo&&bo.shape==='ribs')hitBone(bo,60,rep,{s:rnd(0,g.len),w:up*rr*0.5,z:rnd(-1,1)});}
    for(const o of g.organs){if(o.hp>0)o.hp=Math.max(0,o.hp-dt*(o.id==='brain'?(ct>1.2?55:0):18+rnd(0,22)));}
    if(ct>0.6&&Math.random()<dt*1.6&&g.wounds.length<40){const s=rnd(1,Math.max(1.5,g.len-1));addWound(g,{type:'cut',s,w:up*rr*0.8,s2:s+rnd(1.5,4),w2:up*rr*0.7,r:0.5,len:3,bleed:0.6,dw:up,ds:0});}
  }
  if(!V.dead&&!V.zombie){V.blood=Math.max(0,V.blood-90*dt*Math.min(1,ct));V.pain=100;}
  if(ct>1.4&&!V.eyesOut&&SEG.head.connected)popEyes();
  if(ct>0.5&&Math.random()<dt*6&&BLOOD.length<GQ().b){const g=segs.filter(q=>q.connected&&!q.gone)[Math.floor(Math.random()*segs.length)%Math.max(1,segs.filter(q=>q.connected).length)];if(g){const q=toWorld(g,rnd(0,g.len),0);for(let i=0;i<4;i++)BLOOD.push({x:q.x,y:q.y,vx:rnd(-160,160),vy:-rnd(5,40),r:rnd(0.3,0.6),life:2});addPool(q.x,1.2);}}
  if(rep.length&&T-(crushStep.t||0)>0.6){crushStep.t=T;emitLog('Crushed · '+[...new Set(rep)].slice(0,4).join(', '),'bad');}
  if(ORG.brain.hp<=0&&!V.dead){const gd=OPT.god;OPT.god=false;die('Crushed by 28 g of sun gravity');OPT.god=gd;}
}
function fmtTime(t){const m=Math.floor(t/60),s=Math.floor(t%60);return m+':'+String(s).padStart(2,'0');}
function shockable(){return V.arrest&&!V.dead&&ORG.heart.hp>=20&&V.blood/5000>=0.33&&SEG.head.connected;}
function physio(dt){if(CH)chStep(dt);if(OPF)opfStep(dt);if(OPL)oplStep(dt);
  if(dt<=0)return;
  drugStep(dt);
  crushStep(dt);
  if(zombieTick(dt))return;
  if(OPT.god&&!V.dead){V.blood=Math.max(V.blood,2600);V.rbc=Math.max(V.rbc||0,2600);V.spo2=Math.max(V.spo2,80);V.brainO2=Math.max(V.brainO2,0.7);for(const id of ['brain','heart'])ORG[id].hp=Math.max(ORG[id].hp,35);ORG.brain.stem=Math.max(ORG.brain.stem??100,35);if(V.arrest){V.arrest=false;V.hr=100;V.phase=0;V.lowSpT=0;}}
  if(!OPT.bleedout)V.blood=Math.max(V.blood,4600);
  if(OPT.clot&&!V.dead)clotStep(dt);
  const brain=ORG.brain,heart=ORG.heart,frac=V.blood/5000;
  const headOn=SEG.head.connected&&SEG.neck.connected;
  // Decapitation = immediate, irreversible brain death (legally and medically he is dead at this moment).
  // The heart, however, has its own pacemaker (sinoatrial node) and needs no signal from the brain, so it keeps
  // beating on its own until the oxygen in the blood runs out: no brainstem means no breathing, and the cut
  // spinal cord drops all sympathetic tone (spinal/neurogenic shock), so blood pressure falls too.
  if(!headOn&&!V.dead&&!V.zombie&&!OPT.god){die('Decapitation');}
  if(false){V.bd=true;V.bdAt=T;V.consc=0;V.pain=0;V.ko=0;V.act=null;V.seizeT=Math.max(V.seizeT||0,rnd(2,4));
    emitLog(V.arrest?'Decapitated · brain death':'Decapitated · brain death · without a brainstem he cannot breathe; the heart beats on by itself until its oxygen runs out','bad');}
  if(V.bd&&headOn&&!SEG.head.gone&&brain.hp>20)V.bd=false;
  // Haemodynamics: bleeding is flow driven by a pressure difference (Poiseuille: Q ∝ ΔP).
  // Arteries are driven by mean arterial pressure (MAP ≈ 93 mmHg); veins and oozing tissue by venous pressure (≈ 8 mmHg).
  // When the heart stops, arterial pressure falls within seconds to the mean systemic filling pressure (≈ 7 mmHg),
  // and after death that too fades as vessels relax, so only gravity (ρgh ≈ 0.078 mmHg per cm of height) keeps
  // blood draining slowly from the lowest wounds; wounds facing up stop bleeding.
  // Only the "stressed" volume above the unstressed volume (≈ 2 L once vascular tone is lost) makes filling pressure,
  // so a body that has already bled out to arrest has almost nothing left that can drain.
  {const pumping=!V.dead&&(!V.arrest||V.bypass)&&V.sys>5,MAP=V.sys*0.76,fill=pumping?7*clamp(frac/0.9,0.15,1.15):7*clamp((V.blood-2000)/2500,0,1.15);
   if(!pumping&&V.stopT==null)V.stopT=T;if(pumping)V.stopT=null;
   if(V.pms==null)V.pms=fill;V.pms=pumping?fill:Math.min(fill,V.pms)*Math.exp(-dt/120);
   if(V.pa==null)V.pa=MAP;V.pa=pumping?MAP:V.pms+(V.pa-V.pms)*Math.exp(-dt/4);
   V.pv=pumping?8*clamp(frac/0.9,0.25,1.2)*(0.6+0.4*Math.min(1.3,V.co)):V.pms;}
  // height of the body's blood pool: blood drains from wounds below it, not from ones above
  let cy=0,cn=0;for(const g of segs){if(!g.connected||g.gone||!(g.kind==='chest'||g.kind==='abd'))continue;const A=P[g.a],B=P[g.b];cy+=A.y+B.y;cn+=2;}cy=cn?cy/cn:-100;
  const hs=(!V.dead&&!V.arrest)?1:clamp(V.pms/7,0,1)*0.6+0.08*clamp((V.blood-1500)/1500,0,1)*Math.exp(-(T-(V.stopT??T))/180); // collapsed veins and clotting choke gravity drainage within minutes // collapsed, settling vessels pass little blood once the pump stops
  const hydro=(seg,ls,lw)=>{const q=toWorld(seg,clamp(ls,0,seg.len),lw||0);return clamp(q.y-cy,-40,40)*0.078*hs;};
  const artF=clamp(V.pa/93,0,1.4),venF=clamp(V.pv/8,0,1.3);
  const venAt=(seg,ls,lw)=>clamp((V.pv+hydro(seg,ls,lw))/8,0,1.6),artAt=(seg,ls,lw)=>clamp((V.pa+hydro(seg,ls,lw))/93,0,1.5);
  const txa=(1-0.45*Math.min(1,DR.txa.l))*(1+Math.min(3,DR.ven.l*1.6))*(V.frozenT>0?0.08:1);
  let ext=0,inb=0;const tq=tqFactor();
  // open wounds ooze from torn capillaries and small vessels: mostly venous-pressure driven, partly arterial
  for(const s of segs){if(!s.connected)continue;for(const w of s.wounds)if(w.bleed){const cc=woundCenter(w);ext+=w.bleed*txa*tq(s,cc.s)*(w.pack?0.03:w.band?0.04:1)*(w.plug?0.3:1)*(1-(w.sut||0))*(0.3*artAt(s,cc.s,cc.w)+0.7*venAt(s,cc.s,cc.w));}}
  for(const v of VESSELS){
    if(v.cut<=0||!v.seg.connected){v.now=0;continue;}
    const spasm=(v.type==='a'&&v.cut>=0.95&&v.sevT!=null)?1-(v.rate<=10?0.7:v.rate<=25?0.35:0)*Math.min(1,(T-v.sevT)/120):1;
    const at=v.at||{s:v.pts[0][0],w:v.pts[0][1]};const r=v.rate*v.cut*(v.type==='a'?artAt(v.seg,at.s,at.w):venAt(v.seg,at.s,at.w))*(v.cut<0.95?txa:1)*(V.frozenT>0?0.15:1)*spasm*tq(v.seg,at.s);
    const lg=v.lig?0:1,cov=!v.clamp&&lg&&vCovered(v),pl=v.plug?0.3:1;
    if(!v.clamp&&lg&&!vOpen(v)){inb+=r*pl;v.now=0;continue;}
    if(cov&&!v.deep){ext+=r*v.ext*0.06*pl;inb+=r*(1-v.ext)*0.1*pl;v.now=r*0.08*pl;}
    else if(cov){ext+=r*v.ext*0.04*pl;inb+=(r*(1-v.ext)+r*v.ext*0.96)*pl;v.now=r*pl;}
    else{ext+=r*v.ext*(v.clamp?0.05:1)*lg*pl;inb+=r*(1-v.ext)*lg*pl;v.now=r*lg*pl;}
  }
  for(const id in ORG){const o=ORG[id];if(o.ib&&o.hp<100)inb+=o.ib*txa*Math.pow(1-o.hp/100,1.3)*(0.6*artF+0.4*venF)*(o.rep?0.04:1);}
  inb+=radInb();
  if(DR.ven.l>0.2&&!V.dead)inb+=Math.min(3,DR.ven.l*0.5);
  for(const L of LODGED)if(L.seg.connected){inb+=0.12*(0.5*artF+0.5*venF);if(!V.dead)V.pain=Math.min(100,V.pain+0.35*dt);}
  opStep(dt);
  V.ext=ext;V.int=inb;
  const loss=(ext+inb)*dt;
  if(V.blood>0){V.rbc=Math.max(0,V.rbc-loss*V.rbc/V.blood);}
  V.blood=Math.max(0,V.blood-loss);
  burnStep(dt);radStep(dt);serumStep(dt);toxStep(dt);
  const relief=1-(1-Math.min(0.35,DR.pk.l*0.35))*(1-Math.min(0.9,opi()*0.55))*(1-Math.min(0.3,DR.adr.l*0.25))*(1-Math.min(0.75,DR.ket.l*0.6))*(1-Math.min(0.25,DR.coc.l*0.15))*(1-Math.min(0.3,DR.alc.l*0.1));
  V.painEff=V.pain*(1-relief);
  if(!V.arrest&&!V.dead){
    if(heart.removed)arrest(V.bypass?'Heart out · the bypass machine is his circulation now':'Heart out with no bypass · no circulation');
    else if(heart.hp<15)arrest('Ventricular fibrillation: heart damaged');
    else if(frac<0.48)arrest('Cardiac arrest: exsanguination ('+Math.round((1-frac)*100)+'% of his blood lost)');
    else if(V.lowSpT>(V.bd?100:60))arrest(V.bd?'Heart stopped · no oxygen without breathing ('+fmtTime(T-V.bdAt)+' after decapitation)':'Hypoxic cardiac arrest');
    else if(DR.coc.l>1.8&&Math.random()<(DR.coc.l-1.8)*0.1*dt*(1-0.6*Math.min(1,DR.ami.l)))arrest('Cocaine overdose: ventricular fibrillation');
    else if(DR.ars.l>1.2&&Math.random()<(DR.ars.l-1.2)*0.03*dt)arrest('Arsenic poisoning: heart rhythm failure');
    else if(DR.adr.l>3&&Math.random()<(DR.adr.l-3)*0.12*dt*(1-0.75*Math.min(1,DR.ami.l)))arrest('Adrenaline overdose: ventricular fibrillation');
  }
  const eff=clamp((heart.hp-15)/55,0,1);
  const adr=Math.min(DR.adr.l,2.5);
  V.co=V.arrest?0:clamp(eff*clamp((frac-0.46)/0.34,0,1)*(1+0.25*Math.min(adr,1.2)),0,1.15);
  // cardiopulmonary bypass: a roller/centrifugal pump gives ≈2.4 L/min/m² (≈ normal cardiac output) whether the heart beats or not
  if(V.bypass&&!V.dead)V.co=0.92*clamp(frac*1.1,0,1);
  let hrT=V.arrest?0:clamp(68+(1-frac)*230+V.painEff*0.35+(1-eff)*25+adr*45-Math.min(opi(),3)*6-DR.sed.l*5+Math.min(DR.ket.l,2)*12+Math.min(DR.atr.l,2)*24-Math.min(DR.ami.l,1)*5+Math.min(DR.caf.l,3)*8+Math.min(DR.coc.l,3)*28+Math.min(DR.lsd.l,2)*8+Math.min(DR.alc.l,3)*4+(V.odHr||0),25,210);
  if(!V.arrest&&V.brainO2<0.3)hrT*=0.6;
  // denervated heart (vagus and sympathetic chain cut): runs at its intrinsic rate ≈ 100 bpm, slowing as the heart muscle goes hypoxic
  if(V.bd&&!V.arrest)hrT=100*clamp((V.spo2-8)/52,0.3,1)*clamp(frac/0.6,0.5,1);
  const cush=!V.bd&&!V.arrest&&brain.stem<92?clamp((92-brain.stem)/50,0,1):0;if(cush>0)hrT*=1-0.4*cush;
  V.hr+=(hrT-V.hr)*Math.min(1,dt*(V.arrest?6:0.9));
  // on bypass the flow is non-pulsatile; perfusionists hold mean pressure ≈ 50–80 mmHg
  const sysT=V.bypass&&!V.dead?74*clamp(frac*1.08,0,1)-DR.sed.l*2:V.arrest?0:(40+82*V.co*clamp(frac*1.08,0,1))*(1+0.22*adr)-opi()*4-DR.sed.l*5+Math.min(DR.ket.l,2)*8+Math.min(DR.coc.l,3)*20+Math.min(DR.caf.l,3)*4-Math.min(DR.alc.l,4)*4+(V.odSys||0);
  V.sys+=(Math.max(0,(V.bd?0.62*clamp((V.spo2+20)/80,0.4,1):1+0.35*cush)*sysT)-V.sys)*Math.min(1,dt*2);
  // a destroyed brainstem often throws the heart into a fatal rhythm within minutes (autonomic storm)
  if(V.bd&&V.stemHit&&!V.arrest&&!V.dead&&Math.random()<0.008*dt)arrest('Heart rhythm collapsed after the brainstem injury');
  const apnea=V.dead||V.subm||(brain.stem??100)<15||BN('cervical').broken||!headOn||opi()+DR.sed.l*0.8+DR.alc.l*0.55>4.2||DR.ket.l>3.8;
  const depress=clamp(1-Math.max(0,opi()-1.5)*0.32-Math.max(0,DR.sed.l-1.4)*0.3,0,1);
  const br=apnea?0:(brain.hp<15?0.55+0.25*Math.sin(T*0.35):1)*clamp((ORG.lungL.hp+ORG.lungR.hp)/130,0,1)*clamp(ORG.trachea.hp/50,0,1)*depress*(1-0.75*(V.anaph||0))*(V.blood>6300?clamp(1-(V.blood-6300)/2500,0.2,1):1);
  V.breath=br;V.resp=apnea?0:Math.round(clamp((14+(1-frac)*22+(1-br)*16+V.painEff*0.08+adr*4)*Math.max(0.35,depress),4,40));
  const spT=V.bypass&&!V.dead?99:br>0?100*Math.pow(br,0.35)-2:0;
  // Apnoea with a beating heart: the lungs (≈2.5 L FRC) and blood hold about 1.5 L of O2 against a use of ≈250 ml/min,
  // so SpO2 stays near 90% for about a minute, then falls faster and faster (steep part of the O2-Hb dissociation curve).
  if(br<=0&&!V.arrest&&!V.dead&&!V.bypass)V.spo2-=(0.05+(100-V.spo2)*0.02)*clamp(V.spo2/35,0.12,1)*dt;
  else V.spo2+=(spT-V.spo2)*dt*(spT<V.spo2?0.035:0.25);V.spo2=clamp(V.spo2,0,100);
  V.lowSpT=V.spo2<40?V.lowSpT+dt:0;
  const ocf=Math.pow(clamp(V.rbc/2600,0,1),0.6);
  const carF=1-VESSELS.reduce((a,v)=>a+((v.id==='carL'||v.id==='carR')&&v.cut>0&&!v.lig&&!v.clamp?0.22*v.cut:0),0);
  const del=(headOn?Math.min(1,V.co)*clamp(V.spo2/95,0,1)*ocf*carF:0)*clamp(1-DR.cyn.l*0.75,0,1);
  V.brainO2+=(del-V.brainO2)*dt*(del<V.brainO2?0.085:0.4);
  if(!headOn&&brain.hp>0)brain.hp=Math.max(0,brain.hp-dt*9);
  if(V.bd&&!V.dead){V.consc=0;V.pain=0;V.ko=0;if(V.arrest){const g=OPT.god;OPT.god=false;die(headOn?'Brain destroyed':'Decapitation');OPT.god=g;}}
  // swelling after a massive brain injury pushes the brainstem down through the skull base (herniation) over minutes
  if(brain.stem==null)brain.stem=100;
  if(headOn&&!V.dead&&!V.bd&&brain.hp<25&&brain.stem>0&&!OPT.god){const k=clamp((25-brain.hp)/25,0,1);brain.stem=Math.max(0,brain.stem-0.15*k*dt);
    if(!physio.hern&&brain.stem<92){physio.hern=1;emitLog('Brain swelling · pressure inside the skull is rising · Cushing response: high blood pressure, slow pulse, irregular breathing','bad');}
    if(brain.stem<=0)brainDeath('Brain herniation');}
  if(brain.stem>=100)physio.hern=0;
  if((brain.stem??100)<=0&&headOn&&!V.dead&&!V.bd&&!OPT.god)brainDeath('Brainstem failure');
  if(V.brainO2<0.35&&brain.hp>0){brain.hp-=(0.35-V.brainO2)*dt*1.0;if(brain.hp<=0){brain.hp=0;die(headOn?'Hypoxic brain injury':'Decapitation');}}
  // the brainstem survives oxygen lack longer than the cortex, but not forever
  if(headOn&&V.brainO2<0.2&&!V.dead&&!V.bd&&(brain.stem??100)>0&&!OPT.god){brain.stem=Math.max(0,(brain.stem??100)-(0.2-V.brainO2)*dt*0.6);if(brain.stem<=0&&!V.arrest)brainDeath('Hypoxic brainstem failure');}
  V.pain=Math.max(0,V.pain-(0.45+V.pain*0.025)*dt);
  V.ko=Math.max(0,V.ko-dt*(1+adr*1.5));
  const sedF=clamp(1-Math.max(0,DR.sed.l-0.5)*1.1,0,1)*clamp(1-Math.max(0,opi()-2.2)*0.6,0,1)*clamp(1-Math.max(0,DR.ket.l-1.3)*0.9,0,1)*clamp(1-Math.max(0,DR.alc.l-2.5)*0.5,0,1)*clamp(1-Math.max(0,DR.cyn.l-0.4)*1.2,0,1);
  const cT=(V.dead||V.bd)?0:clamp((V.brainO2-0.42)/0.3,0,1)*clamp((brain.hp-20)/40,0,1)*(V.ko>0?0:1)*(V.painEff>94?0.3:1)*clamp((frac-0.56)/0.14,0.12,1)*Math.min(1,sedF+adr*0.25);
  V.consc+=(cT-V.consc)*Math.min(1,dt*(cT<V.consc?3:0.25));
  if(!V.dead){V.moanT=(V.moanT??3)-dt;
    if(V.moanT<=0){const pe=V.painEff;
      if(V.consc>0.45&&pe>30){if(pe>80&&Math.random()<0.35)emitVoice('scream',0.6);else emitVoice(pe>55||Math.random()<0.5?'groan':'whimper',pe/60);V.moanT=rnd(2.2,4.5)*clamp(90/pe,0.8,2.6);}
      else if(V.consc>0.15&&(V.brainO2<0.5||V.spo2<80)&&V.breath>0){emitBreath('gasp');V.moanT=rnd(1.6,3);}
      else if(V.consc>0.5&&(ORG.lungL.hp<70||ORG.lungR.hp<70||ORG.trachea.hp<70)&&Math.random()<0.5){emitBreath('cough');V.moanT=rnd(3,6);}
      else V.moanT=rnd(1.5,3);}}
  if(!V.arrest&&V.hr>1){V.phase+=V.hr/60*dt;if(V.phase>=1){V.phase-=1;onBeat();}}
  V.bphase+=dt*Math.max(0,V.resp)/60*Math.PI*2;
  for(const s of segs){if(!s.connected)s.detT+=dt;for(const w of s.wounds){w.age+=dt;if(w.sutStart&&w.sut<1){w.sut=Math.min(1,w.sut+dt/1.6);if(w.sut>=1){for(const v of w.ligV||[])v.lig=true;emitLog('Sutured · '+s.label.toLowerCase()+((w.ligV||[]).length?' · vessels tied off':''),'good');}}}}
  for(const w of FW)w.age+=dt;
}
// Brain death (head cut off or destroyed): he is dead, but the heart has its own pacemaker and keeps beating
// without the brain until hypoxia stops it (see physio); a zombie or an already-stopped heart just dies.
function brainDeath(why){if(OPT.god&&!V.zombie)return;ORG.brain.hp=0;ORG.brain.stem=0;die(why);return;V.bd=true;V.bdAt=T;V.consc=0;V.pain=0;V.ko=0;V.act=null;V.seizeT=Math.max(V.seizeT||0,rnd(2,4));bulletTime();
  emitLog(why+' · brain death · no brainstem means no breathing; the heart beats on by itself until its oxygen runs out','bad');}
function arrest(why){V.arrest=true;emitLog(why,'bad');}
function onBeat(){
  V.prevBeat=V.lastBeat;V.lastBeat=T;
  if(soundOn&&OPT.beep!==false)emitSound('beep');
}
function toxStep(dt){
  if(V.dead)return;
  if(DR.ars.l>0.2){for(const id of ['liver','kidneyL','kidneyR','stomach','intest'])if(ORG[id].hp>0)ORG[id].hp=Math.max(0,ORG[id].hp-DR.ars.l*0.35*dt);V.pain=Math.min(100,V.pain+DR.ars.l*0.6*dt);}
  if(DR.ven.l>0.2)V.pain=Math.min(100,V.pain+DR.ven.l*0.5*dt);
  odStep(dt);
  const sick=(DR.alc.l>2.6?1:0)+(DR.ars.l>0.5?1:0)+(DR.cyn.l>0.3?0.5:0);
  if(sick>0){V.tnaus=(V.tnaus??rnd(4,8))-dt*sick;if(V.tnaus<=0){V.tnaus=rnd(8,16);vomit();}}
  if(DR.coc.l>0.3||DR.caf.l>1.5)V.fear=Math.max(V.fear,Math.min(0.5,DR.coc.l*0.2));
  if(DR.lsd.l>0.3&&V.consc>0.6&&Math.random()<dt*0.12*DR.lsd.l)V.fear=Math.min(1,V.fear+rnd(0.2,0.6));
}
function odOnce(k,msg){if(ODMSG[k]&&T-ODMSG[k]<60)return;ODMSG[k]=T;emitLog(msg,'bad');}
function odStep(dt){
  const D=DR;V.odHr=0;V.odSys=0;V.anaph=Math.max(0,(V.anaph||0)-dt*0.02*(1+D.adr.l*6));
  if(D.pk.l>2.5){ORG.liver.hp=Math.max(0,ORG.liver.hp-(D.pk.l-2.5)*0.9*dt);odOnce('pk','Paracetamol overdose · the liver is failing');}
  if(D.caf.l>4){V.odHr+=25;if(Math.random()<(D.caf.l-4)*0.05*dt&&!V.arrest)arrest('Caffeine overdose: ventricular fibrillation');odOnce('caf','Caffeine overdose · racing, irregular heart');}
  if(D.txa.l>3){ORG.brain.hp=Math.max(0,ORG.brain.hp-(D.txa.l-3)*0.4*dt);odOnce('txa','TXA overdose · blood clots reaching the brain (stroke)');}
  if(D.atr.l>3){V.fear=Math.min(1,V.fear+dt*0.3);V.odHr+=20;if(Math.random()<(D.atr.l-3)*0.03*dt&&!V.arrest)arrest('Atropine overdose: heart rhythm failure');odOnce('atr','Atropine overdose · delirium, burning hot, racing heart');}
  if(D.ami.l>2.2){V.odHr-=(D.ami.l-2.2)*30;V.odSys-=(D.ami.l-2.2)*25;odOnce('ami','Amiodarone overdose · heart slowing, pressure dropping');}
  if(D.nal.l>2.5&&opi()<0.2){V.pain=Math.min(100,V.pain+3*dt);V.fear=Math.min(1,V.fear+dt*0.2);odOnce('nal','Too much naloxone · agitated and in pain');}
  if(D.flu.l>2&&!(V.seizeT>0)&&Math.random()<(D.flu.l-2)*0.15*dt){V.seizeT=rnd(5,9);emitLog('Seizure · flumazenil overdose','bad');}
  if(D.lsd.l>3){V.fear=1;odOnce('lsd','Bad trip · panic and psychosis');}
  if(D.ckt.l>3){V.odSys+=(D.ckt.l-3)*25;odOnce('ckt','Too much cyanide antidote · blood pressure spiking');}
  if(D.avn.l>2.5){V.anaph=Math.min(1,(V.anaph||0)+dt*0.25);odOnce('avn','Antivenom reaction · anaphylaxis: airway swelling (give adrenaline)');}
  if(D.chl.l>3){ORG.kidneyL.hp=Math.max(0,ORG.kidneyL.hp-(D.chl.l-3)*0.8*dt);ORG.kidneyR.hp=Math.max(0,ORG.kidneyR.hp-(D.chl.l-3)*0.8*dt);odOnce('chl','Chelator overdose · kidneys failing');}
  if(D.ket.l>3.5)odOnce('ket','Ketamine overdose · breathing failing');
  if(V.blood>6300){odOnce('vol','Fluid overload · lungs filling with fluid');}
  if(V.anaph>0)V.odSys-=V.anaph*60;
  // viper venom: phospholipases and bradykinin release dilate the vessels, systolic pressure falls ≈20 mmHg per unit above 0.5
  if(D.ven.l>0.5)V.odSys-=Math.min(50,(D.ven.l-0.5)*20);
  if(V.seizeT>0){V.seizeT-=dt;V.ko=Math.max(V.ko,1.5);V.pain=Math.min(100,V.pain+dt*2);}
}
function vomit(){
  if(V.consc<0.3||!SEG.head.connected){return;}
  const hd=SEG.head,p=toWorld(hd,9.4,7.6),d=dirWorld(hd,1,0.3),dl=Math.hypot(d.x,d.y)||1;
  for(let i=0;i<18;i++){const a=Math.atan2(d.y,d.x)+rnd(-0.4,0.4),sp=rnd(80,220);FLAMES.push({puke:true,x:p.x,y:p.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,t:0,life:1.2,r:rnd(0.4,0.8),hot:0,co2:true});}
  V.flinch=Math.min(0.8,V.flinch+0.5);V.pain=Math.min(100,V.pain+4);
  if(T-(vomit.t||-99)>20){vomit.t=T;const why=V.rad>1?'radiation sickness':DR.ars.l>0.5?'arsenic poisoning':DR.alc.l>2.6?'too much alcohol':DR.cyn.l>0.3?'cyanide poisoning':'nausea';emitLog('Vomiting · '+why,'bad');}
}
// natural clotting: small wounds slowly seal themselves; TXA speeds it up, venom and blood loss slow it down
function clotStep(dt){
  const ck=(DR.txa.l>0.2?2.2:1)/(1+Math.min(3,DR.ven.l*2))*clamp(V.blood/5000,0.4,1);
  for(const g of segs){if(!g.connected)continue;for(const w of g.wounds){if(!w.bleed||w.sut>=1)continue;w.bmax=Math.max(w.bmax||0,w.bleed);
    const base=w.type==='stump'?1/260:w.dig?1/160:w.type==='cut'?1/90:1/70;if(w.bleed<3.5)w.bleed*=Math.exp(-base*ck*dt*(w.band||w.pack?3:1));if(w.bleed<0.012)w.bleed=0;}}
}
function clotOf(w){return w.bmax?clamp(1-(w.bleed||0)/w.bmax,0,1)*clamp((w.age-8)/25,0,1):0;}
function face(){
  const awake=V.consc>0.3&&!V.dead&&OPT.painfx;
  const p=awake?clamp(Math.max(V.painEff/80,V.flinch*0.95),0,1):0;
  const squeeze=clamp((p-0.42)/0.3,0,1);
  const fear=awake?clamp(V.fear||0,0,1)*(1-squeeze):0;
  const scream=awake&&p>0.7&&((Math.sin(T*1.7)+Math.sin(T*0.63))>-0.4);
  const pupil=clamp(1+Math.min(1,DR.lsd.l*0.6+DR.coc.l*0.4)+fear*0.25-Math.min(0.55,opi()*0.25),0.45,2);
  return{open:V.consc>0.35&&!V.dead?clamp((1-squeeze*1.1)*(1+fear*0.3)-p*0.15,0,1.25):0,dead:V.dead,pain:p,squeeze,fear,scream,grimace:awake&&p>0.28&&!scream,
    tears:awake&&p>0.6,sweat:awake&&(p>0.45||V.blood<3600||DR.coc.l>0.8),pupil,high:DR.lsd.l>0.3,
    gasp:(!V.dead&&V.consc>0.2&&(V.resp>28||V.spo2<85))?1:0,slack:V.dead||V.consc<0.2};
}
function anaesthetised(){return DR.sed.l>=1||DR.ket.l>=1.1||V.consc<0.4||V.dead;}
function painCheck(seg,msg){emitLog(msg+(anaesthetised()?'':' · he is awake, sedate him (Ketamine or Midazolam) to spare the pain'),anaesthetised()?'good':'bad');}
