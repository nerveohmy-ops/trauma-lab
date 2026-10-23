/* TRAUMA_LAB_MAIN */
/* ===== sim/chemistry.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
// drops of whatever was in the glass: they land in beakers, on him or on the floor
let DROPS=[];
function dropStep(dt){for(let i=DROPS.length-1;i>=0;i--){const d=DROPS[i];d.t+=dt;d.vy+=G*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;let gone=false;
    if(d.p){for(const pr of PROPS){if(isPool(pr)&&d.vy>0){const l=poolLocal(pr,d.x,d.y);if(l.x>POOLD.x0&&l.x<POOLD.x1&&l.y>poolLevel(pr)+Math.min(0,poolWave(pr,l.x))-0.5&&l.y<POOLD.y0+4.5){if(d.key)addChem(null,d.key,d.vol,pr.mix);else addProf(pr.mix,d.vol,d.p);poolKick(pr,l.x,clamp(d.vol*d.vy*0.0004,0,6));if(d.vol>2&&Math.random()<0.5)CHFX.push({k:'spl',y0:d.y,x:d.x,y:d.y,vx:rnd(-30,30),vy:-rnd(20,60)*Math.min(2,Math.cbrt(d.vol)/2),t:0,life:rnd(0.25,0.5),r:Math.min(1.5,0.3+Math.cbrt(d.vol)*0.2),col:d.p.col});gone=true;break;}continue;}
      if(!isBeaker(pr)||pr.dead||(pr===d.src&&d.t<0.3)||d.vy<0)continue;if(Math.abs(Math.atan2(Math.sin(pr.ang),Math.cos(pr.ang)))>0.8)continue;const k=pr.sc||1,ca=Math.cos(-pr.ang),sa=Math.sin(-pr.ang),lx=(d.x-pr.x)*ca-(d.y-pr.y)*sa,ly=(d.x-pr.x)*sa+(d.y-pr.y)*ca,bx=(lx+pr.ox)/k,by=(ly+pr.oy)/k;
        if(Math.abs(bx)<BK.W/2&&by>BK.rim-0.6&&by<BK.y0){addProf(pr.mix,d.vol,d.p);gone=true;break;}}
      if(!gone&&SEG.head.connected&&!SEG.head.gone){const L=toLocal(SEG.head,d.x,d.y);if(Math.hypot(L.s-MOUTH.s,L.w-MOUTH.w)<2.4&&mouthTake({vol:d.vol,p:d.p}))gone=true;}
      if(!gone)for(const g of segs){if(g.gone||!insideSeg(g,d.x,d.y))continue;const L=toLocal(g,d.x,d.y);filmAdd(g,clamp(L.s,0,g.len),L.w,d.vol,d.p);gone=true;break;}}
    if(!gone&&(d.y>-0.2||d.t>4||Math.abs(d.x)>ROOM)){if(d.y>-0.2)puddle(d.x,d.vol||1,d.p||null);gone=true;}
    if(gone)DROPS.splice(i,1);}
  if(DROPS.length>700)DROPS.splice(0,DROPS.length-700);
  for(let i=WPOOLS.length-1;i>=0;i--){const w=WPOOLS[i];if(w.vol!=null){const tw=clamp(Math.sqrt(w.vol)*0.55,1,120);w.w+=(tw-w.w)*Math.min(1,dt*2.5);}if(T-w.t>(w.life||40))WPOOLS.splice(i,1);}}
let WPOOLS=[];
// tap a beaker with a reagent to add a measured amount, or tap him to pour some on
const BKS={beakerS:[0.62,50],beaker:[1,250],beakerL:[1.5,1000]};
// ---------- pouring by holding, solids (pellets and powder), front/back view, stains and swallowing ----------
let SOLIDS=[],FDROPS=[],STAINS=[];
const POUR={water:25,h2so4:12,hcl:12,naoh:12,nh3:12,h2o2:12,etoh:12,ln2:15,ind:0.6};
 // mL/s from a bottle held tipped
const MOUTH={s:9.5,w:7.5},FMOUTH={x:0,y:-155.7};
const isChemTool=id=>id==='jug'||!!CHEM[id];
function chemKey(id){return id==='jug'?'water':id;}
function dropSolid(key,w,m,front){const d=CHEM[key];if(front)FDROPS.push({x:w.x,y:w.y,vy:rnd(0,10),solid:key,m,v:view});else SOLIDS.push({x:w.x,y:w.y,vx:rnd(-3,3),vy:rnd(0,15),id:key,m,t:0,powder:!!d.powder});}
// pellets and powder in the side view
// liquid on the floor: drops landing near a puddle join it; a puddle spreads to a film ≈ 3 mm thick (width ∝ volume over 1 m of floor depth)
function puddle(x,vol,p){let q=null;for(const w of WPOOLS){if(Math.abs(w.x-x)<w.w+1.5&&((!w.p&&!p)||(w.p&&p))){q=w;break;}}
  if(q){if(p&&q.p){const t=vol/(q.vol+vol);for(const k of SPK)q.p[k]=lerp(q.p[k]||0,p[k]||0,t);q.p.T=lerp(q.p.T,p.T,t);q.p.col=q.p.col.map((v,i)=>lerp(v,p.col[i],t));}q.x=lerp(q.x,x,vol/(q.vol+vol)*0.3);q.vol+=vol;q.t=T;return;}
  if(WPOOLS.length>=90)WPOOLS.shift();WPOOLS.push({x,w:1,vol,t:T,p:p?Object.assign({},p,{col:p.col.slice()}):null,life:p&&p.ln2>0.3?3:60});}
function solidStep(dt){
  for(let i=SOLIDS.length-1;i>=0;i--){const o=SOLIDS[i];o.t+=dt;if(o.rest){o.life=(o.life||0)+dt;
      // a pellet lying in a wet puddle reacts with it
      if(!o.powder&&WPOOLS.some(q=>Math.abs(q.x-o.x)<q.w+0.5&&q.p&&q.p.w>0.3)){o.m-=CHEM[o.id].k*Math.pow(Math.max(o.m,1e-4),2/3)*dt;if(Math.random()<dt*25)CHFX.push({k:'flame',x:o.x+rnd(-0.4,0.4),y:-0.8,vx:rnd(-6,6),vy:-rnd(15,35),t:0,life:0.3,r:rnd(0.4,0.8),col:CHEM[o.id].flame});if(o.m<=0.003){SOLIDS.splice(i,1);emitSound('pop',0.3);}}
      if(o.powder&&o.life>60)SOLIDS.splice(i,1);continue;}
    o.vy+=G*dt*(o.powder?0.35:1);if(o.powder){o.vx*=1-2*dt;o.vy=Math.min(o.vy,60);}o.x+=o.vx*dt;o.y+=o.vy*dt;let gone=false;
    for(const pr of PROPS){if(isPool(pr)&&o.vy>0){const l=poolLocal(pr,o.x,o.y);if(l.x>POOLD.x0&&l.x<POOLD.x1&&l.y>poolLevel(pr)-0.5&&l.y<POOLD.y0+4.5){addChem(null,o.id,o.m,pr.mix);gone=true;break;}continue;}
      if(!isBeaker(pr)||pr.dead||o.vy<0)continue;if(Math.abs(Math.atan2(Math.sin(pr.ang),Math.cos(pr.ang)))>0.8)continue;const k=pr.sc||1,ca=Math.cos(-pr.ang),sa=Math.sin(-pr.ang),lx=(o.x-pr.x)*ca-(o.y-pr.y)*sa,ly=(o.x-pr.x)*sa+(o.y-pr.y)*ca,bx=(lx+pr.ox)/k,by=(ly+pr.oy)/k;
      if(Math.abs(bx)<BK.W/2&&by>BK.rim-0.6&&by<BK.y0){addChem(pr,o.id,o.m);if(!o.powder)emitSound('tink',0.2);gone=true;break;}}
    if(!gone&&SEG.head.connected&&!SEG.head.gone){const L=toLocal(SEG.head,o.x,o.y);if(Math.hypot(L.s-MOUTH.s,L.w-MOUTH.w)<2.4&&mouthTake({solid:o.id,m:o.m}))gone=true;}
    if(!gone)for(const g of segs){if(g.gone||!insideSeg(g,o.x,o.y))continue;const L=toLocal(g,o.x,o.y);const p=pureProf(o.id);filmAdd(g,clamp(L.s,0,g.len),L.w,o.m,p);gone=true;break;}
    if(!gone&&o.y>-0.4){o.y=-0.4;o.rest=true;o.vx=o.vy=0;}
    if(gone||o.t>30||Math.abs(o.x)>ROOM)SOLIDS.splice(i,1);}
  if(SOLIDS.length>400)SOLIDS.splice(0,SOLIDS.length-400);
}
// drops and solids poured in the front or back view fall straight down the screen onto him
function fdropStep(dt){
  for(let i=FDROPS.length-1;i>=0;i--){const d=FDROPS[i];if(d.v!==view){FDROPS.splice(i,1);continue;}d.vy+=G*dt*(d.solid&&CHEM[d.solid].powder?0.35:1);d.y+=d.vy*dt;let gone=false;
    if(view==='front'&&Math.hypot(d.x-FMOUTH.x,d.y-FMOUTH.y)<2.2&&SEG.head.connected){if(mouthTake(d.solid?{solid:d.solid,m:d.m}:{vol:d.vol,p:d.p}))gone=true;}
    if(!gone){const h=frontHit(d.x,d.y);if(h){const r=frontLocal(h),w=r.r*0.85*(view==='back'?-1:1),p=d.solid?pureProf(d.solid):d.p;filmAdd(h.seg,h.s,w,d.solid?d.m:d.vol,p,h.zx);gone=true;}}
    if(gone||d.y>0)FDROPS.splice(i,1);}
  if(FDROPS.length>500)FDROPS.splice(0,FDROPS.length-500);
}
// what a liquid leaves on the skin
function stainCol(f){const A=(2*f.sa+f.hcl)*1000,B=f.oh*1000+0.12*f.nh3*1000;
  if(f.ind>0.002){const ph=A>0.01?clamp(-Math.log10(A/1000),0,6.5):B>0.01?clamp(14+Math.log10(B/1000),7.5,14):5.5;const m=newMix();m.ind=1;m.w=1;m.vol=1;m.sa=ph<7?Math.pow(10,-ph)/2000:0;m.oh=ph>7?Math.pow(10,ph-14)/1000:0;return mixColor(m).slice(0,3).concat(0.55);}
  if(f.hco3>0.001)return[248,248,242,0.6];
  if(A>0.5&&f.sa>f.hcl)return[70,40,25,0.45];
  if(A>0.5)return[225,205,120,0.4];
  if(B>0.3)return[200,70,60,0.35];
  if(f.h2o2>0.003)return[250,250,248,0.55];
  if(f.ln2>0.05)return[235,245,255,0.6];
  return null;}
function stainStep(dt){
  for(const f of FILMS){const col=stainCol(f);if(!col)continue;let st=STAINS.find(q=>q.seg===f.seg&&Math.hypot(q.s-f.s,q.w-f.w)<2.2&&(q.fz==null||f.fz==null||Math.abs(q.fz-f.fz)<0.15));
    if(!st){if(STAINS.length>120)STAINS.shift();st={seg:f.seg,s:f.s,w:f.w,fz:f.fz,r:0.9,col,a:0,life:col===null?60:(f.ind>0.002||f.hco3>0.001)?900:f.h2o2>0.003||f.ln2>0.05?40:150,t:0};STAINS.push(st);}
    st.col=col;st.a=Math.min(col[3],st.a+dt*0.8);st.r=Math.min(4,Math.max(st.r,0.9+Math.sqrt(f.vol)*1.2));st.t=0;}
  for(let i=STAINS.length-1;i>=0;i--){const q=STAINS[i];q.t+=dt;if(q.seg.gone||q.t>q.life){q.a-=dt*0.05;if(q.a<=0)STAINS.splice(i,1);}}
}
function rinseStains(seg,s,w,R){for(const q of STAINS){if(q.seg!==seg&&R<50)continue;const p=toWorld(q.seg,q.s,q.w),c=toWorld(seg,s,w);if(Math.hypot(p.x-c.x,p.y-c.y)<R)q.a*=0.5;}}
// liquid or a pellet reaching his mouth: swallowed if the mouth is open (screaming), breathed in if he is unconscious
function mouthTake(o){
  if(V.dead||!SEG.head.connected||SEG.head.gone)return false;const F=face(),uncon=V.consc<0.2;
  if(!F.scream&&!uncon)return false;
  const ing=V.ing||(V.ing={vol:0,said:{}});const hd=SEG.head,rep=[];
  const p=o.solid?pureProf(o.solid):o.p,vol=o.solid?o.m:o.vol,name=o.solid?CHEM[o.solid].n.toLowerCase():((2*p.sa+p.hcl)>5e-4?(p.sa>p.hcl?'sulfuric acid':'hydrochloric acid'):p.oh>5e-4?'lye':p.nh3>5e-4?'ammonia':'');
  const A=(2*p.sa+p.hcl)*1000,B=p.oh*1000,N=p.nh3*1000;
  if(uncon){ // aspiration: it runs into the windpipe and lungs
    const k=vol*(0.4+A/36*3+B/10*3+N/13*1.5)*(p.ln2>0.3?3:1);ORG.lungL.hp=Math.max(0,ORG.lungL.hp-k*0.8);ORG.lungR.hp=Math.max(0,ORG.lungR.hp-k*0.8);dmgOrgan(ORG.trachea,k*0.5,rep,'burned');V.spo2=Math.max(0,V.spo2-vol*0.6);
    if(!ing.said.asp){ing.said.asp=1;emitLog('He is unconscious and cannot swallow · it runs into his windpipe and lungs (aspiration)','bad');}return true;}
  ing.vol+=vol;
  const mouthBurn=(q)=>{if(q>0.05)burnHit(hd,MOUTH.s,MOUTH.w,q,0.3,true);};
  // corrosives: alkali eats the oesophagus (liquefaction), acid hits the stomach hardest (coagulation, perforation)
  const ai=vol*A/36,bi=vol*(B/10+0.4*N/13);
  if(ai>0.02||bi>0.02){dmgOrgan(ORG.esophagus,ai*4+bi*8,rep,'burned');dmgOrgan(ORG.stomach,ai*15+bi*4,rep,'burned');dmgOrgan(ORG.trachea,(ai+bi)*2,rep,'burned');mouthBurn((ai+bi)*3);hurt(hd,MOUTH.s,MOUTH.w,Math.min(40,(ai+bi)*25));
    if(ORG.stomach.hp<=0&&!ing.said.perf){ing.said.perf=1;emitLog('Stomach perforated · acid and gut contents leak into the abdomen','bad');}
    if(!ing.said.cor||T-ing.said.cor>4){ing.said.cor=T;emitLog('He swallowed '+(name||'it')+' · burning his mouth, oesophagus and stomach'+(rep.length?' · '+[...new Set(rep)].slice(0,3).join(', '):''),'bad');}}
  if(p.et>0.05){const g=p.et*vol;DR.alc.p+=g/20;if(!ing.said.et){ing.said.et=1;emitLog('He swallowed ethanol · it burns going down; he gets drunk as it is absorbed','info');}}
  if(p.h2o2>0.005){for(let i=0;i<10;i++){const q=toWorld(hd,MOUTH.s,MOUTH.w);CHFX.push({k:'foam',x:q.x+rnd(-0.6,0.6),y:q.y+rnd(-0.4,0.6),vx:rnd(-3,3),vy:rnd(0,4),t:0,life:rnd(1.5,3),r:rnd(0.3,0.6)});}
    if(view==='front')for(let i=0;i<6;i++)CHFX.push({k:'foam',front:'front',x:FMOUTH.x+rnd(-1,1),y:FMOUTH.y+rnd(0,1.5),vx:rnd(-2,2),vy:rnd(1,4),t:0,life:2,r:rnd(0.3,0.5)});
    if(!ing.said.hp){ing.said.hp=1;emitLog('He swallowed hydrogen peroxide · it foams in his stomach (oxygen) · nausea and vomiting','info');}if(Math.random()<0.4)setTimeout(()=>vomit(),1500);}
  if(p.ln2>0.3){const g=p.ln2*vol;dmgOrgan(ORG.stomach,g*16,rep,'ruptured');dmgOrgan(ORG.esophagus,g*6,rep,'frozen');hurt(SEG.abd,8,2,Math.min(50,g*12));
    if(!ing.said.ln2){ing.said.ln2=1;emitLog('He swallowed liquid nitrogen · it boils into ~700× its volume of gas · '+(ORG.stomach.hp<=0?'his stomach bursts':'his stomach balloons'),'bad');}}
  for(const M of ['K','Na']){if(!(p[M]>0))continue;const g=p[M]*vol;dmgOrgan(ORG.esophagus,g*90,rep,'burned');mouthBurn(g*20);hurt(hd,MOUTH.s,MOUTH.w,40);emitSound('pop',0.4);
    if(!ing.said[M]){ing.said[M]=1;emitLog('He swallowed '+(M==='K'?'potassium':'sodium')+' · it reacts with his saliva: hydrogen, heat and caustic burns in the mouth and throat','bad');}}
  if(p.hco3>0.001&&!ing.said.soda){ing.said.soda=1;emitLog('Baking soda swallowed · it neutralises stomach acid (antacid) · harmless in small amounts','info');}
  if(A<0.02&&B<0.02&&N<0.5&&!(p.et>0.05)&&!(p.h2o2>0.005)&&!(p.ln2>0.3)&&!(p.K>0)&&!(p.Na>0)&&!(p.hco3>0.001)&&!ing.said.w){ing.said.w=1;emitLog('He swallowed some '+(p.ind>0.002?'indicator-tinted water':'water'),'info');}
  return true;
}
/* =========================================================
   CHEMISTRY: lab reagents with real properties, real reactions and what they do to the body
   Beakers hold a mixture tracked as real amounts (g of water, mol of acid/base, g of metal...),
   with its heat capacity and temperature. Reactions release their real enthalpies:
   neutralisation 57.3 kJ/mol, ammonia + strong acid 52.2 kJ/mol, dilution of sulfuric acid
   (integral heat of solution, up to ~74 kJ/mol), potassium + water 196 kJ/mol, sodium + water 184 kJ/mol.
   Liquids pour from the lip when the beaker tips past the level the liquid can hold,
   and every drop carries the mixture: on skin it burns by concentration, contact time and heat.
   ========================================================= */
const CHEM={
  water:{n:'Water',s:'Water',rho:1,cp:4.18,col:[150,200,255,.35],sp:{w:1}},
  h2so4:{n:'Sulfuric acid 98%',s:'H₂SO₄ 98%',rho:1.84,cp:1.42,col:[238,232,205,.5],sp:{sa:0.0184,w:0.0368}},
  hcl:{n:'Hydrochloric acid 37%',s:'HCl 37%',rho:1.18,cp:2.5,col:[236,240,185,.45],sp:{hcl:0.01197,w:0.743}},
  naoh:{n:'Sodium hydroxide 32%',s:'NaOH 32%',rho:1.35,cp:3.4,col:[228,236,246,.42],sp:{oh:0.0108,w:0.918}},
  nh3:{n:'Ammonia 25%',s:'NH₃ 25%',rho:0.91,cp:4.4,col:[214,232,250,.35],sp:{nh3:0.01336,w:0.6825}},
  h2o2:{n:'Hydrogen peroxide 3%',s:'H₂O₂ 3%',rho:1.01,cp:4.1,col:[205,226,255,.35],sp:{h2o2:0.0303,w:0.98}},
  etoh:{n:'Ethanol 96%',s:'Ethanol',rho:0.8,cp:2.44,col:[226,240,255,.3],sp:{et:0.77,w:0.032}},
  ln2:{n:'Liquid nitrogen',s:'LN₂ −196 °C',rho:0.807,cp:2.04,col:[236,246,255,.28],sp:{ln2:0.807}},
  ind:{n:'Universal indicator',s:'Indicator',rho:1,cp:4.18,col:[70,165,85,.85],sp:{ind:1,w:1}},
  k:{n:'Potassium',s:'K metal',metal:'K',M:39.1,dH:5030,k:0.8,flame:'200,150,255'},
  na:{n:'Sodium',s:'Na metal',metal:'Na',M:22.99,dH:8000,k:0.34,flame:'255,175,50'},
  soda:{n:'Baking soda',s:'NaHCO₃ powder',powder:true,M:84.01,col:[246,246,240,.9]},
};
const SPK=['w','ice','ln2','sa','hcl','oh','nh3','nh4','h2o2','et','ind','K','Na','hco3'];
const BK={W:7.8,H:8.6,y0:-0.6,rim:-9.4};
 // beaker interior in drawing units at scale 1 (≈ a real 250 mL beaker)
let FILMS=[],CHFX=[];
function newMix(){const m={vol:0,T:22,C:0,Hd:0,add:{},note:'',P:0,boil:0,fire:0,irr:0,foam:0,said:{}};for(const k of SPK)m[k]=0;return m;}
const isBeaker=pr=>pr&&pr.type==='beaker'&&pr.mix;
// the pool, in its own coordinates (prop-local, before the centre-of-mass shift): inside 172 × 52 cm, 100 cm deep into the screen
const POOLD={x0:-86,x1:86,y0:-4.2,rim:-56,D:100,cap:172*51.8*100};
const isPool=pr=>pr&&pr.type==='pool'&&pr.mix;
// the surface is a row of POOLN columns that carry waves (shallow-water speed √(g·depth) ≈ 2 m/s in 40 cm of liquid)
const POOLN=44;
function poolWave(pr,lx){if(!pr.wv)return 0;const t=clamp((lx-POOLD.x0)/(POOLD.x1-POOLD.x0)*(POOLN-1),0,POOLN-1),i=Math.floor(t),f=t-i;return lerp(pr.wv[i],pr.wv[Math.min(POOLN-1,i+1)],f);}
function poolKick(pr,lx,dv){if(!pr.wv)return;const i=Math.round(clamp((lx-POOLD.x0)/(POOLD.x1-POOLD.x0)*(POOLN-1),0,POOLN-1));pr.wvv[i]+=dv;if(i>0)pr.wvv[i-1]+=dv*0.5;if(i<POOLN-1)pr.wvv[i+1]+=dv*0.5;}
function poolLocal(pr,x,y){return{x:x-pr.x+pr.ox,y:y-pr.y+pr.oy};}
function poolLevel(pr){return POOLD.y0-Math.min(pr.mix.vol,pr.cap)/((POOLD.x1-POOLD.x0)*POOLD.D);}
function poolSurfY(pr){return pr.y-pr.oy+poolLevel(pr);}
function inLiquid(pr,x,y){if(pr.mix.vol<1)return false;const l=poolLocal(pr,x,y);return l.x>POOLD.x0&&l.x<POOLD.x1&&l.y<POOLD.y0+0.5&&l.y>poolLevel(pr)+poolWave(pr,l.x);}
// tapping over the pool: anywhere between the walls from the floor of the tank up to 40 cm above the rim
function poolAt(x,y){for(const pr of PROPS){if(!isPool(pr))continue;const l=poolLocal(pr,x,y);if(l.x>POOLD.x0-2&&l.x<POOLD.x1+2&&l.y<POOLD.y0&&l.y>POOLD.rim-40)return pr;}return null;}
// density of what is in it (g/mL), from what went in
function mixRho(m){let a=0,b=0;for(const k in m.add){const d=CHEM[k];if(!d||d.metal||d.powder)continue;a+=m.add[k]*(d.rho||1);b+=m.add[k];}return b>0?a/b:1;}
// enthalpy of H2SO4 in water vs mol water per mol acid (integral heat of solution, J/mol)
const saH=r=>-74000*r/(r+1.7);
function molality(m){const kg=Math.max(1e-4,m.w/1000);return(m.sa*3+m.hcl*2+m.oh*2+m.nh3+m.nh4*2+m.et/46+m.h2o2/34)/kg;}
function mixPH(m){if(m.vol<0.05||m.w<0.05)return null;const V=Math.max(1e-5,m.vol/1000),A=2*m.sa+m.hcl;
  if(A>1e-9)return clamp(-Math.log10(A/V),-1.5,7);
  if(m.oh>1e-9)return clamp(14+Math.log10(m.oh/V),7,15.2);
  if(m.hco3>1e-9)return 8.3;
  if(m.nh3>1e-9)return m.nh4>1e-9?clamp(14-(4.74+Math.log10(m.nh4/m.nh3)),7,12):clamp(14+Math.log10(Math.sqrt(1.8e-5*m.nh3/V)),7,12.2);
  if(m.nh4>1e-9)return clamp(0.5*(9.25-Math.log10(m.nh4/V)),3,7);
  return 7;}
// a per-mL snapshot of the mixture: what a drop of it carries
function mixProf(m){const v=Math.max(1e-6,m.vol),p={T:m.T,Hd:m.Hd,Cpm:m.C/v,fire:m.fire>0?1:0,col:mixColor(m)};for(const k of SPK)p[k]=m[k]/v;return p;}
function pureProf(id){const d=CHEM[id];if(d&&(d.metal||d.powder)){const p={T:22,Hd:0,Cpm:d.metal?0.8:1,fire:0,col:d.metal?[190,190,200,.9]:[246,246,240,.9]};for(const k of SPK)p[k]=0;if(d.metal)p[d.metal]=1;else p.hco3=1/d.M;return p;}
  const m=newMix();addChem(null,id,1,m);return mixProf(m);}
// pour vol mL of a profile into a mixture
function addProf(m,vol,p){if(vol<=0)return;const Ca=p.Cpm*vol;m.T=(m.C+Ca)>0?(m.T*m.C+p.T*Ca)/(m.C+Ca):p.T;m.C+=Ca;
  if(p.sa>0){const sa=p.sa*vol;m.Hd=(m.Hd*m.sa+p.Hd*sa)/(m.sa+sa||1);}
  for(const k of SPK)m[k]+=p[k]*vol;m.vol+=vol;m.add.mix=(m.add.mix||0)+vol;if(p.fire)m.fire=Math.max(m.fire,1);}
function addChem(pr,id,amt,mm){const m=mm||pr.mix,d=CHEM[id];if(!d)return;
  if(d.metal){m[d.metal]+=amt;m.add[id]=(m.add[id]||0)+amt;return;}
  if(d.powder){const Ca=amt*1.0;m.T=(m.C+Ca)>0?(m.T*m.C+22*Ca)/(m.C+Ca):22;m.C+=Ca;m.hco3+=amt/d.M;m.vol+=amt/2.2;m.add[id]=(m.add[id]||0)+amt;if(pr)react(m,0);return;}
  // water into strong sulfuric acid boils where it lands and spits acid out — always add acid to water
  const spit=pr&&(id==='water'||id==='nh3'||id==='naoh'||id==='h2o2')&&m.sa>0&&m.sa/(Math.max(1,m.vol)/1000)>9&&amt<m.vol;
  if(id==='ln2'){m.ln2+=amt*0.807;m.vol+=amt;m.add[id]=(m.add[id]||0)+amt;return;}
  const Ca=amt*d.rho*d.cp;m.T=(m.C+Ca)>0?(m.T*m.C+22*Ca)/(m.C+Ca):22;m.C+=Ca;
  if(d.sp.sa){const sa=d.sp.sa*amt,H=saH((d.sp.w*amt/18)/sa);m.Hd=(m.Hd*m.sa+H*sa)/(m.sa+sa);}
  for(const k in d.sp)m[k]+=d.sp[k]*amt;m.vol+=amt;m.add[id]=(m.add[id]||0)+amt;
  if(pr){react(m,0);if(spit){const n=Math.min(10,Math.round(amt*0.4)+2);chSpray(pr,Math.min(m.vol*0.03,amt*0.3),n,160,true);emitSound('sizzle');chSay(m,'spit','Water into concentrated sulfuric acid · it boils where it lands and spits hot acid · always add acid to water',true);}}
}
function chSay(m,k,txt,bad){if(m.said[k])return;m.said[k]=1;emitLog(txt,bad?'bad':'info');}
// remove a fraction f of everything (spilled or thrown out); returns the profile that left
function takeFrac(m,f){f=clamp(f,0,1);const p=mixProf(m),v=m.vol*f;for(const k of SPK)m[k]*=1-f;m.C*=1-f;m.vol-=v;for(const k in m.add)m.add[k]*=1-f;if(m.vol<0.05)emptyMix(m);return{p,v};}
function emptyMix(m){const said=m.said;Object.assign(m,newMix());m.said=said;}
function react(m,dt){
  let Q=0,P=0;m.note='';
  // strong acid + strong base -> water: 57.3 kJ/mol
  let A=2*m.sa+m.hcl;if(A>1e-12&&m.oh>1e-12){const n=Math.min(A,m.oh),fa=n/A;Q+=n*57300;m.sa*=1-fa;m.hcl*=1-fa;m.oh-=n;m.w+=n*18;m.note='neutralising · heat';}
  A=2*m.sa+m.hcl;if(A>1e-12&&m.nh3>1e-12){const n=Math.min(A,m.nh3),fa=n/A;Q+=n*52200;m.sa*=1-fa;m.hcl*=1-fa;m.nh3-=n;m.nh4+=n;m.note='ammonium salt forming · heat';}
  // bicarbonate + strong acid -> CO2 gas + water (slightly endothermic, ~+9 kJ/mol); the gas froths up as foam
  A=2*m.sa+m.hcl;if(A>1e-12&&m.hco3>1e-12&&m.w>0.2){const n=Math.min(A,m.hco3,dt>0?Math.max(1e-4,m.hco3*Math.min(1,dt*3)):m.hco3*0.2),fa=n/A;Q-=n*9000;m.sa*=1-fa;m.hcl*=1-fa;m.hco3-=n;m.w+=n*18;m.foam+=n*24000*0.05;m.note='fizzing · CO₂ gas';}
  if(dt>0)m.foam*=Math.exp(-dt/4);
  // sulfuric acid dilution: heat comes out as the acid takes on water
  if(m.sa>1e-9){const H=saH((m.w/18)/m.sa);Q+=m.sa*(m.Hd-H);m.Hd=H;}
  // alkali metals: 2M + 2H2O -> 2MOH + H2, rate ∝ surface area (m^2/3)
  if(dt>0)for(const id of ['k','na']){const d=CHEM[id],M=d.metal;if(m[M]<=1e-6)continue;if(m.w<0.3||m.T<-5){if(m[M]>0)m.note=d.n+' resting · needs water';continue;}
    const dm=Math.min(m[M],d.k*Math.pow(m[M],2/3)*dt*Math.min(1,m.w/20)),mol=dm/d.M;m[M]-=dm;Q+=dm*d.dH;P+=dm*d.dH/dt;m.oh+=mol;m.w-=mol*18;m.C+=dm*0.8;
    m.note=(id==='k'?'K':'Na')+' + H₂O → '+(id==='k'?'KOH':'NaOH')+' + H₂';}
  m.P=P;
  // liquid nitrogen boils off, drawing heat from whatever it touches (latent heat 199 J/g)
  if(m.ln2>0&&dt>0){const sz=Math.pow(Math.max(m.vol,10)/250,2/3),wet=m.C>2,hA=wet?3.5*sz:0.25*sz,q=hA*((wet?m.T:22)+196)*dt,b=Math.min(m.ln2,q/199);m.ln2-=b;m.vol=Math.max(0,m.vol-b/0.807);if(wet)Q-=b*199+b*1.04*(m.T+196)*0.3;m.boilN=b/dt;m.note=m.note||'boiling off at −196 °C';}else m.boilN=0;
  // ethanol burning on top (blue flame): 29.7 kJ/g, most of it goes up into the air
  if(m.fire>0&&dt>0){const ef=m.et/Math.max(1,m.vol*0.8);if(ef<0.12||m.vol<0.3||m.ln2>0){m.fire=0;}else{const b=Math.min(m.et,0.12*Math.pow(m.vol/250,2/3)*dt*2);m.et-=b;m.vol-=b/0.79;m.C-=b*2.44;Q+=b*29700*0.04;m.note='ethanol burning';}}
  if(m.C>0.5)m.T+=Q/m.C;else if(Q<0)m.T=-196;
  // freezing (depressed by what is dissolved) and melting, latent heat 334 J/g
  const Tf=Math.max(-60,-1.86*molality(m));
  if(m.T<Tf&&m.w>0&&m.C>0.5){const fr=Math.min(m.w,(Tf-m.T)*m.C/334);m.w-=fr;m.ice+=fr;m.C-=fr*2.08;m.T+=fr*334/Math.max(0.5,m.C);}
  if(m.ice>0&&m.T>Tf){const ml=Math.min(m.ice,(m.T-Tf)*m.C/334);m.ice-=ml;m.w+=ml;m.C+=ml*2.08;m.T-=ml*334/Math.max(0.5,m.C);}
  // boiling (raised by what is dissolved), latent heat 2257 J/g
  const etR=m.et>m.w,bp=etR?78:Math.min(160,100+0.512*molality(m));m.boil=0;
  if(etR&&m.T>bp){const ev=Math.min(m.et,(m.T-bp)*m.C/841);m.et-=ev;m.vol=Math.max(0,m.vol-ev/0.79);m.C-=ev*2.44;m.T=bp;m.boil=dt>0?ev/dt:0;m.note=m.note||'ethanol boiling';}
  else if(m.T>bp&&m.w>0.05){const ev=Math.min(m.w,(m.T-bp)*m.C/2257);m.w-=ev;m.vol=Math.max(0,m.vol-ev);m.C-=ev*4.18;m.T=bp;m.boil=dt>0?ev/dt:0;m.note=m.note||'boiling';}
  m.T=clamp(m.T,-196,400);
  if(dt>0){const tau=600*Math.cbrt(Math.max(m.vol,5)/250);if(m.ln2<=0)m.T+=(22-m.T)*(1-Math.exp(-dt/tau));}
  if(m.vol<0.05&&m.K<=0&&m.Na<=0)emptyMix(m);
  if(m.h2o2>0&&!m.note&&m.oh>0)m.note='';
}
function mixColor(m){
  if(m.ind>0&&m.w>0){const ph=mixPH(m);if(ph!=null){const st=[[-1,[200,20,45]],[2,[230,60,40]],[4,[245,150,40]],[5,[245,215,50]],[6,[200,220,80]],[7,[60,170,80]],[8,[40,150,140]],[9,[45,110,185]],[10,[60,75,190]],[12,[95,50,160]],[15,[75,25,110]]];
    let i=0;while(i<st.length-2&&ph>st[i+1][0])i++;const a=st[i],b=st[i+1],t=clamp((ph-a[0])/(b[0]-a[0]),0,1);const k=clamp(m.ind/Math.max(1,m.vol)*400,0.25,0.85);return[...a[1].map((v,j)=>Math.round(lerp(v,b[1][j],t))),k];}}
  let r=0,g=0,b=0,a=0,s=0;for(const id in m.add){const d=CHEM[id];if(!d||d.metal||!d.col)continue;const v=m.add[id];r+=d.col[0]*v;g+=d.col[1]*v;b+=d.col[2]*v;a+=d.col[3]*v;s+=v;}
  if(s<=0)return[160,205,250,.35];return[r/s,g/s,b/s,a/s];}
// level a tilted beaker can hold without spilling (rectangular vessel, width W height H)
function fillMax(ang){let a=Math.abs(Math.atan2(Math.sin(ang),Math.cos(ang)));if(a>=Math.PI/2)return 0;const t=Math.tan(a),W=BK.W,H=BK.H+0.2;return t<=H/W?1-W*t/(2*H):H/(2*W*t);}
// world point from beaker drawing coordinates
function bkPt(pr,x,y){const s=pr.sc||1;return propPt(pr,[x*s-pr.ox,y*s-pr.oy]);}
function chSpray(pr,vol,n,sp,hot){if(vol<=0)return;const{p,v}=takeFrac(pr.mix,vol/Math.max(vol,pr.mix.vol));if(hot)p.T=Math.max(p.T,95);const top=bkPt(pr,0,BK.rim);n=Math.max(1,n);for(let i=0;i<n;i++)DROPS.push({x:top.x+rnd(-2,2)*(pr.sc||1),y:top.y,vx:pr.vx+rnd(-1,1)*sp*0.6,vy:pr.vy-rnd(0.4,1)*sp,t:0,vol:v/n,p,src:pr});}
function chemBeakers(dt){
  for(const pr of PROPS){if(!isBeaker(pr)||pr.dead)continue;const m=pr.mix,sc=pr.sc||1;
    react(m,dt);
    // spill over the lip when tipped
    const f=(m.vol+m.foam)/pr.cap,fm=fillMax(pr.ang);if(m.foam>2&&Math.random()<dt*10){const s=bkPt(pr,rnd(-3.4,3.4),BK.y0-Math.min(1.05,f)*BK.H);CHFX.push({k:'bub',x:s.x,y:s.y,vx:rnd(-5,5),vy:-rnd(4,10),t:0,life:0.5,r:0.3});}
    if(m.vol>0.05&&f>fm+0.002){const out=Math.min((f-fm)*pr.cap*Math.min(1,dt*7),140*sc*sc*dt+0.4);if(m.foam>0)m.foam=Math.max(0,m.foam-out*0.7);const{p,v}=takeFrac(m,Math.min(1,out*(m.vol/(m.vol+m.foam))/m.vol));
      const a=Math.atan2(Math.sin(pr.ang),Math.cos(pr.ang)),sg=a>=0?1:-1,lip=bkPt(pr,sg*3.95,BK.rim),[vx,vy]=rbVel(pr,lip.x-pr.x,lip.y-pr.y);
      const n=Math.max(1,Math.min(8,Math.ceil(v/1.2)));for(let i=0;i<n;i++)DROPS.push({x:lip.x+rnd(-0.4,0.4),y:lip.y+rnd(-0.3,0.3),vx:vx+sg*Math.cos(pr.ang)*rnd(8,30),vy:vy+rnd(-5,10),t:0,vol:v/n,p,src:pr});}
    if(m.vol>0.05&&(m.K>0||m.Na>0)&&m.w>0.3){
      const met=m.K>0?'k':'na',d=CHEM[met];
      chSay(m,'m'+met,met==='k'?'Potassium + water → potassium hydroxide + hydrogen · it skates on the surface, the hydrogen burns with a lilac flame':'Sodium + water → sodium hydroxide + hydrogen · it fizzes and melts into a ball, orange flame if it gets hot enough',false);
      const surf=bkPt(pr,rnd(-2.5,2.5),BK.y0-Math.min(1,f)*BK.H);
      if(Math.random()<dt*20)CHFX.push({k:'bub',x:surf.x,y:surf.y,vx:rnd(-6,6),vy:-rnd(8,20),t:0,life:0.4,r:0.25});
      const lit=met==='k'?m.P>250:m.P>1800;
      if(lit&&Math.random()<dt*40)CHFX.push({k:'flame',x:surf.x+rnd(-0.8,0.8),y:surf.y-0.5,vx:rnd(-8,8),vy:-rnd(20,45),t:0,life:rnd(0.2,0.4),r:rnd(0.45,0.9)*Math.min(2,Math.sqrt(m.P/800)+0.5),col:d.flame});
      // larger pieces: the melt bursts apart (steam + hydrogen pops) and throws hot caustic droplets
      if(m.P>3000&&Math.random()<dt*m.P/3500){emitSound('pop',Math.min(1,m.P/12000));chSpray(pr,Math.min(m.vol*0.04,4),4,60+m.P/200,true);for(let i=0;i<6;i++)CHFX.push({k:'spark',x:surf.x,y:surf.y,vx:rnd(-90,90),vy:-rnd(60,200),t:0,life:rnd(0.3,0.6),r:0.3,col:d.flame});}
      if(m.P>7000&&!pr.erupt){pr.erupt=1;emitLog((met==='k'?'Potassium':'Sodium')+' · violent reaction ('+Math.round(m.P/1000)+' kW) · the beaker bursts and sprays boiling '+(met==='k'?'KOH':'NaOH'),'bad');chSpray(pr,m.vol*0.5,24,150,true);shatterBeaker(pr,null,true);continue;}
    }
    if(m.boil>0.05&&Math.random()<dt*Math.min(30,m.boil*6)){const s=bkPt(pr,rnd(-3,3),BK.rim);CHFX.push({k:'steam',x:s.x,y:s.y,vx:rnd(-6,6),vy:-rnd(10,25),t:0,life:rnd(0.8,1.5),r:rnd(1,2)});
      if(m.boil>1.5&&Math.random()<0.3)chSpray(pr,0.3,1,90,true);chSay(m,'boil','Beaker boiling · it spits scalding drops','bad');}
    if(m.ln2>0&&Math.random()<dt*Math.min(40,6+(m.boilN||0)*3)){const s=bkPt(pr,rnd(-3.5,3.5),BK.rim+0.5);CHFX.push({k:'fog',x:s.x,y:s.y,vx:rnd(-10,10),vy:rnd(2,12),t:0,life:rnd(1.2,2.4),r:rnd(0.6,1.2)*(pr.sc||1)});}
    if(m.fire>0&&Math.random()<dt*30){const s=bkPt(pr,rnd(-3,3),BK.y0-Math.min(1,f)*BK.H-0.3);CHFX.push({k:'flame',x:s.x,y:s.y,vx:rnd(-5,5),vy:-rnd(15,35),t:0,life:rnd(0.3,0.5),r:rnd(0.8,1.4),col:'110,160,255'});}
    // ethanol catches from any flame near the top of the beaker
    if(m.fire<=0&&m.et/Math.max(1,m.vol*0.8)>0.2){const top=bkPt(pr,0,BK.rim);if(FLAMES.some(q=>!q.co2&&!q.front&&Math.hypot(q.x-top.x,q.y-top.y)<6)||CHFX.some(q=>q.k==='flame'&&q.col!=='110,160,255'&&Math.hypot(q.x-top.x,q.y-top.y)<5)||segs.some(g=>g.fireT>0&&dps(top.x,top.y,P[g.a].x,P[g.a].y,P[g.b].x,P[g.b].y).d<8)){m.fire=1;emitLog('Ethanol caught fire · a pale blue flame on the surface','bad');}}
    // fumes: ammonia and concentrated (fuming) hydrochloric acid
    const V=Math.max(1e-4,m.vol/1000),tf=1+Math.max(0,m.T-22)/15,ar=sc*sc,cn=m.nh3/V,ch=m.hcl/V;
    pr.fN=30*cn*ar*tf;pr.fH=25*Math.max(0,ch-6)*ar*tf;
    if((pr.fN>40||pr.fH>15)&&Math.random()<dt*3){const s=bkPt(pr,rnd(-3,3),BK.rim);CHFX.push({k:'fume',x:s.x,y:s.y,vx:rnd(-4,4),vy:-rnd(3,8),t:0,life:rnd(1.5,2.5),r:rnd(0.8,1.4)});}
  }
  // ammonia meets hydrogen chloride in the air: white ammonium chloride smoke
  for(const a of PROPS){if(!isBeaker(a)||a.dead||!(a.fN>40))continue;for(const b of PROPS){if(!isBeaker(b)||b.dead||!(b.fH>15))continue;const pa=bkPt(a,0,BK.rim),pb=bkPt(b,0,BK.rim),d=Math.hypot(pa.x-pb.x,pa.y-pb.y);if(d>40)continue;
    if(Math.random()<dt*12*(1-d/40)){const t=rnd(0.3,0.7);CHFX.push({k:'smoke',x:lerp(pa.x,pb.x,t),y:lerp(pa.y,pb.y,t)-rnd(1,5),vx:rnd(-4,4),vy:-rnd(2,6),t:0,life:rnd(2,3.5),r:rnd(0.7,1.4)});}
    if(!a.mix.said.nh4cl){a.mix.said.nh4cl=1;emitLog('NH₃ + HCl → NH₄Cl · the two fumes meet in the air as white smoke','info');}}}
}
// what he breathes: ammonia (danger level IDLH 300 ppm) and hydrogen chloride (IDLH 50 ppm)
function chemAir(dt){
  if(!SEG.head.connected||SEG.head.gone)return;const h=toWorld(SEG.head,SEG.head.len*0.45,3);let pn=0,ph=0;
  for(const pr of PROPS){if(!(isBeaker(pr)||isPool(pr))||pr.dead||!(pr.fN>0||pr.fH>0))continue;const t=isPool(pr)?{x:clamp(h.x,pr.x-pr.ox+POOLD.x0,pr.x-pr.ox+POOLD.x1),y:poolSurfY(pr)}:bkPt(pr,0,BK.rim),d=Math.hypot(t.x-h.x,t.y-h.y),k=Math.exp(-Math.max(0,d-5)/10);pn+=pr.fN*k;ph+=pr.fH*k;}
  for(const f of FILMS){if(f.seg.kind!=='head'&&f.seg.kind!=='neck')continue;const N=f.nh3*1000;if(N>0.5)pn+=N*20*Math.min(1,f.vol);}
  const I=pn/300+ph/50;V.irr=I;V.ppm=[Math.round(pn),Math.round(ph)];
  if(V.dead||I<0.08||!(V.breath>0))return;const what=pn/300>=ph/50?'Ammonia':'Hydrogen chloride';
  if(!chemAir.s1){chemAir.s1=1;emitLog(what+' fumes · '+(pn/300>=ph/50?Math.round(pn)+' ppm':Math.round(ph)+' ppm')+' at his face · sharp smell','info');}
  if(I>0.35){V.pain=Math.min(100,V.pain+dt*3*Math.min(3,I));V.fear=Math.min(1,V.fear+dt*0.2*I);if(T-(chemAir.c||-9)>rnd(1.8,3.5)/Math.min(3,I)){chemAir.c=T;if(V.consc>0.3)emitVoice('grunt',0.5);}
    if(!chemAir.s2){chemAir.s2=1;emitLog(what+' · eyes streaming, coughing and choking','bad');}}
  if(I>1){const k=(I-1)*dt;dmgOrgan(ORG.trachea,k*0.6,[],'burned');ORG.lungL.hp=Math.max(0,ORG.lungL.hp-k*0.25);ORG.lungR.hp=Math.max(0,ORG.lungR.hp-k*0.25);if(I>2)dmgOrgan(ORG.eye,k*0.4,[],'burned');
    if(!chemAir.s3){chemAir.s3=1;emitLog(what+' above the danger level (IDLH) · it is burning his airway and lungs','bad');}}
}
// chemicals sitting on the skin
// z: where across the body it landed (front/back view, −1…1). Spots side by side stay separate films, so the burn forms where the liquid is
function filmAdd(seg,s,w,vol,p,z){if(vol<=0.002||seg.gone)return;
  let f=null,bd=2.6;for(const q of FILMS){if(q.seg!==seg)continue;if(z!=null&&q.fz!=null&&Math.abs(q.fz-z)*(radS(seg,clamp(s,0,seg.len))||seg.ra)>2.2)continue;const d=Math.hypot(q.s-s,q.w-w);if(d<bd){bd=d;f=q;}}
  const sp={};for(const k of ['sa','hcl','oh','nh3','nh4','h2o2','et','ln2','K','Na','w','ind','hco3'])sp[k]=(p[k]||0);
  // plain water rinses: it dilutes every chemical film nearby and washes stains
  const pA=(2*sp.sa+sp.hcl)*1000,pB=sp.oh*1000+sp.nh3*120;
  if(sp.w>0.9&&pA<0.01&&pB<0.01&&!sp.ind){const c0=toWorld(seg,s,w);for(const q of FILMS){const c1=toWorld(q.seg,q.s,q.w);if(Math.hypot(c1.x-c0.x,c1.y-c0.y)>7)continue;const k=q.vol/(q.vol+vol*3);for(const s_ of ['sa','hcl','oh','nh3','et','h2o2','K','Na','ind','hco3'])q[s_]*=k;q.T=lerp(22,q.T,k);q.fire=0;}rinseStains(seg,s,w,5);}
  if(!f){if(FILMS.length>90)FILMS.shift();f={seg,s,w,z:z!=null?z:seg.side==='far'?-0.8:0.8,fz:z!=null?z:undefined,vol:0,T:p.T,age:0,fire:0,col:p.col};for(const k in sp)f[k]=0;FILMS.push(f);}
  const tv=f.vol+vol;for(const k in sp)f[k]=(f[k]*f.vol+sp[k]*vol)/tv;f.T=(f.T*f.vol+p.T*vol)/tv;f.col=(f.col||p.col).map((v,i)=>(v*f.vol+(p.col?p.col[i]:v)*vol)/tv);f.vol=tv;if(p.fire)f.fire=Math.max(f.fire,1.5);f.s=lerp(f.s,s,vol/tv);f.w=lerp(f.w,w,vol/tv);
  // acid meets base on the skin: neutralises, warms
  let A=2*f.sa+f.hcl;if(A>1e-9&&f.oh>1e-9){const n=Math.min(A,f.oh),fa=n/A;f.sa*=1-fa;f.hcl*=1-fa;f.oh-=n;f.T+=n*57300/4.0;}
  A=2*f.sa+f.hcl;if(A>1e-9&&f.hco3>1e-9){const n=Math.min(A,f.hco3),fa=n/A;f.sa*=1-fa;f.hcl*=1-fa;f.hco3-=n;for(let i=0;i<4;i++){const q=toWorld(seg,f.s,f.w);CHFX.push({k:'foam',x:q.x+rnd(-0.6,0.6),y:q.y+rnd(-0.6,0.6),vx:rnd(-2,2),vy:rnd(-3,1),t:0,life:rnd(0.8,1.6),r:rnd(0.2,0.45)});}}
  return f;
}
function chemFilms(dt){
  for(let i=FILMS.length-1;i>=0;i--){const f=FILMS[i],g=f.seg;f.age+=dt;
    if(g.gone){FILMS.splice(i,1);continue;}
    const A=(2*f.sa+f.hcl)*1000,B=f.oh*1000,N=f.nh3*1000,qf=Math.min(1,f.vol/0.4);
    let r=0,frost=false,kind='';
    if(A>0.05){r+=1.2*Math.pow(A/36,1.2);kind=f.sa>f.hcl?'sulfuric acid':'hydrochloric acid';}
    const Be=B+0.12*N;if(Be>0.05){r+=0.25*Math.pow(Be/10,0.8)*(1+1.5*Math.min(1,f.age/120));kind=B>0.12*N?'lye (alkali)':'ammonia';}
    if(f.T>45){r+=Math.min(10,6*Math.exp((f.T-60)/3));kind=kind||'scald';}
    const ln=f.ln2*f.vol;if(ln>4){r+=3*Math.min(1,(ln-4)/6);frost=true;kind='frostbite (liquid nitrogen)';}
    if(f.K+f.Na>1e-4){const mg=(f.K+f.Na)*f.vol;r+=3*Math.min(1,mg/0.3);kind='alkali metal reacting with his sweat';const dK=f.K*(1-Math.exp(-dt/1.5)),dN=f.Na*(1-Math.exp(-dt/3));f.K-=dK;f.Na-=dN;f.oh+=dK/39.1+dN/22.99;f.T=Math.min(110,f.T+(dK*5030+dN*8000)*f.vol/(4*f.vol+15));}
    if(f.fire>0){f.fire-=dt;r+=3;kind='burning ethanol';if(Math.random()<dt*25){const q=toWorld(g,f.s,f.w);CHFX.push({k:'flame',x:q.x,y:q.y,vx:rnd(-5,5),vy:-rnd(15,30),t:0,life:0.35,r:rnd(0.6,1.2),col:'110,160,255'});}}
    else if(f.et*f.vol>0.3&&(g.fireT>0||CHFX.some(q=>q.k==='flame'&&Math.hypot(q.x-toWorld(g,f.s,f.w).x,q.y-toWorld(g,f.s,f.w).y)<4))){f.fire=Math.min(8,f.et*f.vol*1.2);emitLog('Ethanol on his skin caught fire','bad');}
    // weak exposures add up slowly (a dilute acid bath irritates over minutes) instead of never reaching a burn
    let dmg=r*qf*dt;if(dmg<=0.003&&dmg>0){f.dose=(f.dose||0)+dmg;if(f.dose>0.003){dmg=f.dose;f.dose=0;}else dmg=0;}
    if(dmg>0.003&&g.connected!==undefined){const wd=burnHit(g,f.s,f.w,dmg,f.z,true);if(wd){wd.chem=1;if(A>0.05||Be>0.05){wd.acid=1;wd.ck=A>0.05?(f.sa>f.hcl?'sa':'acid'):'alk';}if(frost)wd.frost=1;if(A>20&&f.sa>f.hcl)wd.char=1;}
      if(!f.said&&f.age>0.3&&kind){f.said=1;const mk=kind+g.id;if(chemFilms.lk===mk&&T-chemFilms.lt<6){}else{chemFilms.lk=mk;chemFilms.lt=T;emitLog('Chemical burn · '+kind+' on the '+g.label.toLowerCase()+(kind==='lye (alkali)'||kind==='ammonia'?' · alkali keeps eating deeper until it is washed off':kind.includes('acid')?' · wash it off with lots of water':''),'bad');}}}
    if(g.kind==='head'&&f.w>1.5&&Math.abs(f.s-3)<5&&(A>0.5||Be>0.3)&&ORG.eye.hp>0){dmgOrgan(ORG.eye,(A/36*25+Be/10*45)*qf*dt,[],'burned');if(!chemFilms.eye){chemFilms.eye=1;emitLog('Chemical in the eye · '+(Be>A?'alkali eye burns are the most dangerous · irrigate for 20 minutes':'acid eye burn'),'bad');}}
    // hydrogen peroxide on an open wound: catalase in blood splits it into water and oxygen (white foam)
    if(f.h2o2*f.vol>0.004){const open=g.wounds.find(w=>(w.type==='hole'||w.type==='cut'||w.type==='stump')&&!(w.sut>=1)&&Math.hypot(w.s-f.s,(w.w||0)-f.w)<4);
      if(open){f.h2o2*=Math.exp(-dt/2);if(Math.random()<dt*30){const q=toWorld(g,open.s,open.w);CHFX.push({k:'foam',x:q.x+rnd(-0.8,0.8),y:q.y+rnd(-0.8,0.8),vx:rnd(-3,3),vy:rnd(-4,1),t:0,life:rnd(1.5,3),r:rnd(0.3,0.7)});}
        if(Math.random()<dt*0.8&&!V.dead)hurt(g,open.s,open.w,2);if(!chemFilms.hp){chemFilms.hp=1;emitLog('Hydrogen peroxide foams white in the wound · catalase in his blood splits it into water and oxygen','info');}}
      else f.h2o2*=Math.exp(-dt/30);}
    if(f.et*f.vol>0.05&&g.wounds.some(w=>(w.type==='hole'||w.type==='cut')&&!(w.sut>=1)&&Math.hypot(w.s-f.s,w.w-f.w)<4)&&Math.random()<dt*0.7&&!V.dead)hurt(g,f.s,f.w,3);
    // tissue buffers acid and the film runs off; alkali and nitrogen behave differently
    f.sa*=Math.exp(-dt/60);f.hcl*=Math.exp(-dt/60);f.oh*=Math.exp(-dt/150);f.nh3*=Math.exp(-dt/40);f.et*=Math.exp(-dt/15);f.ln2*=Math.exp(-dt/2.5);
    {const dy=dirWorld(g,0,1).y;f.s=clamp(f.s+dy*2.5*Math.min(1,f.vol)*dt,0,g.len);}
    f.T+=(33-f.T)*(1-Math.exp(-dt/5));f.vol*=Math.exp(-dt/25);
    if(f.vol<0.02||(r===0&&f.age>40&&f.h2o2*f.vol<0.004))FILMS.splice(i,1);}
}
let chemPoolT=0;
function chemPools(dt){chemPoolT+=dt;if(chemPoolT<0.3)return;const st=chemPoolT;chemPoolT=0;
  for(const pl of WPOOLS){const p=pl.p;if(!p)continue;const A=(2*p.sa+p.hcl)*1000,B=p.oh*1000+0.12*p.nh3*1000;if(A<0.5&&B<0.3)continue;
    for(const g of segs){if(g.gone||!g.connected)continue;for(const [Q,t] of [[P[g.a],0],[P[g.b],1]]){const r=rad(g,t);if(Q.y<-r-1.5||Math.abs(Q.x-pl.x)>pl.w+r)continue;const L=toLocal(g,Q.x,Math.min(-0.2,Q.y+r*0.9));filmAdd(g,clamp(L.s,0,g.len),L.w,0.25*st,p);}}}
}
function chemStep(dt){pourStep(dt);if(POURS.length)poursStep(dt);solidStep(dt);fdropStep(dt);if(!PROPS.length&&!FILMS.length&&!CHFX.length&&!DROPS.length&&!WPOOLS.length&&!STAINS.length&&!POURS.length)return;stainStep(dt);chemBeakers(dt);chemPoolProps(dt);chemAir(dt);chemFilms(dt);chemPools(dt);
  for(let i=CHFX.length-1;i>=0;i--){const q=CHFX[i];q.t+=dt;if(q.t>q.life){CHFX.splice(i,1);continue;}q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.k==='spark'||q.k==='spl')q.vy+=G*(q.k==='spl'?1:0.6)*dt;if(q.k==='spl'&&q.vy>0&&q.y>q.y0){q.t=q.life;}if(q.k==='fog'){q.vy+=20*dt;if(q.y>-0.5){q.y=-0.5;q.vy=0;q.vx*=0.98;}}}
  if(CHFX.length>500)CHFX.splice(0,CHFX.length-500);
  // sparks and burning bits that land on him burn
  for(const q of CHFX){if(q.k!=='spark'||q.hit)continue;for(const g of segs){if(g.gone||!insideSeg(g,q.x,q.y))continue;q.hit=1;const L=toLocal(g,q.x,q.y);burnHit(g,L.s,L.w,1.2,null,true);break;}}
}
// the liquid stays level in the world: find the surface line that encloses the right area
function liquidPoly(f,ang){const W=BK.W/2,y1=BK.y0,y0=BK.y0-BK.H,rect=[[-W,y0],[W,y0],[W,y1],[-W,y1]],gx=Math.sin(ang),gy=Math.cos(ang),tgt=clamp(f,0,1)*BK.W*BK.H;if(tgt<=0.01)return null;
  let lo=-20,hi=20;for(let i=0;i<22;i++){const mid=(lo+hi)/2,a=polyArea(clipHalf(rect,gx,gy,mid));if(a>tgt)lo=mid;else hi=mid;}const poly=clipHalf(rect,gx,gy,(lo+hi)/2);return poly.length>2?{poly,gx,gy,c:(lo+hi)/2}:null;}

/* ---------- the pool: reactions, fumes, steam, and what it does to him when he is in it ---------- */
let poolT=0;
function chemPoolProps(dt){V.subm=false;poolT+=dt;const st=poolT>=0.3?poolT:0;if(st)poolT=0;
  for(const pr of PROPS){if(!isPool(pr))continue;const m=pr.mix;react(m,dt);
    // more than it holds runs over the rim onto the floor
    if(m.vol>pr.cap){const{p,v}=takeFrac(m,(m.vol-pr.cap)/m.vol);for(const sg of [-1,1])overSpill(pr,sg,v/2,p);if(v>50)chSay(m,'over','The pool overflows · it runs onto the floor',false);}
    poolWaves(pr,dt);
    if(m.vol<1)continue;const sy=poolSurfY(pr),X0=pr.x-pr.ox+POOLD.x0,X1=pr.x-pr.ox+POOLD.x1,sx=()=>rnd(X0+4,X1-4);
    if((m.K>0||m.Na>0)&&m.w>0.3){const met=m.K>0?'k':'na',d=CHEM[met];
      chSay(m,'m'+met,met==='k'?'Potassium in the pool · it skates on the surface, fizzing hydrogen that burns lilac':'Sodium in the pool · it fizzes and races across the surface, orange flashes',false);
      if(Math.random()<dt*25)CHFX.push({k:'bub',x:sx(),y:sy,vx:rnd(-6,6),vy:-rnd(8,20),t:0,life:0.4,r:0.3});
      if(m.P>(met==='k'?250:1800)&&Math.random()<dt*40)CHFX.push({k:'flame',x:sx(),y:sy-0.5,vx:rnd(-8,8),vy:-rnd(20,45),t:0,life:rnd(0.2,0.4),r:rnd(0.5,1)*Math.min(3,Math.sqrt(m.P/800)+0.5),col:d.flame});
      if(m.P>3000&&Math.random()<dt*m.P/3500){emitSound('pop',Math.min(1,m.P/12000));const x=sx();for(let i=0;i<6;i++)CHFX.push({k:'spark',x,y:sy,vx:rnd(-90,90),vy:-rnd(60,200),t:0,life:rnd(0.3,0.6),r:0.3,col:d.flame});}}
    if(m.boil>0.05&&Math.random()<dt*Math.min(40,m.boil*8))CHFX.push({k:'steam',x:sx(),y:sy,vx:rnd(-6,6),vy:-rnd(10,25),t:0,life:rnd(0.8,1.5),r:rnd(1.5,3)});
    if(m.ln2>0&&Math.random()<dt*20)CHFX.push({k:'fog',x:sx(),y:sy,vx:rnd(-10,10),vy:rnd(2,12),t:0,life:rnd(1.2,2.4),r:rnd(1,2)});
    if(m.fire>0&&Math.random()<dt*40)CHFX.push({k:'flame',x:sx(),y:sy-0.3,vx:rnd(-5,5),vy:-rnd(15,35),t:0,life:rnd(0.3,0.5),r:rnd(1,1.8),col:'110,160,255'});
    if(m.fire<=0&&m.et/Math.max(1,m.vol*0.8)>0.2&&(FLAMES.some(q=>!q.co2&&!q.front&&q.x>X0&&q.x<X1&&Math.abs(q.y-sy)<8)||segs.some(g=>g.fireT>0&&P[g.a].x>X0&&P[g.a].x<X1&&Math.abs(P[g.a].y-sy)<10))){m.fire=1;emitLog('The ethanol in the pool caught fire','bad');}
    // fumes: a big open surface (≈1.7 m²) gives off far more than a beaker
    const V_=Math.max(1e-4,m.vol/1000),tf=1+Math.max(0,m.T-22)/15,cn=m.nh3/V_,ch=m.hcl/V_;pr.fN=30*cn*6*tf;pr.fH=25*Math.max(0,ch-6)*6*tf;
    if((pr.fN>40||pr.fH>15)&&Math.random()<dt*5)CHFX.push({k:'fume',x:sx(),y:sy,vx:rnd(-4,4),vy:-rnd(3,8),t:0,life:rnd(1.5,2.5),r:rnd(1,2)});
    // him in it: the liquid wets every part under the surface (water rinses, acid and lye burn, hot scalds, LN₂ freezes)
    if(st){const p=mixProf(m);for(const g of segs){if(g.gone)continue;for(const t of [0.25,0.75]){const Q=toWorld(g,g.len*t,0);if(!inLiquid(pr,Q.x,Q.y))continue;for(const sg of [1,-1])filmAdd(g,g.len*t,sg*(radS(g,g.len*t)||g.ra)*0.85,0.5*st,p,sg>0?0.8:-0.8);}}}
    // head under: no breath (drowning) · he swallows and inhales the liquid if he tries
    if(SEG.head.connected&&!SEG.head.gone){const M=toWorld(SEG.head,MOUTH.s,MOUTH.w);if(inLiquid(pr,M.x,M.y)){V.subm=true;if(!V.dead&&!chemPoolProps.said){chemPoolProps.said=1;emitLog('His head is under the surface · he cannot breathe','bad');}}else chemPoolProps.said=0;}
  }}

// liquid running over the rim: a sheet of drops down the outside of the wall
function overSpill(pr,sg,v,p){const x=pr.x-pr.ox+sg*(POOLD.x1+3),y=pr.y-pr.oy+POOLD.rim,n=Math.max(1,Math.min(14,Math.ceil(v/40)));for(let i=0;i<n;i++)DROPS.push({x:x+sg*rnd(0,3),y:y+rnd(-1,1),vx:sg*rnd(10,40)+pr.vx,vy:rnd(-10,10),t:0,vol:v/n,p});}
// surface waves: shallow-water wave equation on the columns, reflecting walls, damped; sloshing when the tank is pushed;
// a wave higher than the rim throws liquid over it
function poolWaves(pr,dt){if(!pr.wv)return;const m=pr.mix,N=POOLN;if(m.vol<1){pr.wv.fill(0);pr.wvv.fill(0);pr.pvx=pr.vx;return;}
  const depth=Math.max(1,POOLD.y0-poolLevel(pr)),dx=(POOLD.x1-POOLD.x0)/(N-1),c=Math.sqrt(G*depth),sub=Math.max(1,Math.ceil(c*dt/dx/0.7)),h=dt/sub,k=c*c/(dx*dx);
  // the tank accelerating sideways tilts the surface the other way (pseudo-force)
  const ax=clamp((pr.vx-(pr.pvx||0))/Math.max(dt,1e-4),-3000,3000);pr.pvx=pr.vx;
  const wv=pr.wv,vv=pr.wvv;
  for(let s_=0;s_<sub;s_++){for(let i=0;i<N;i++){const l=wv[i>0?i-1:1]+wv[i<N-1?i+1:N-2]-2*wv[i];vv[i]+=(k*l-vv[i]*1.6)*h-ax*0.02*((i/(N-1))-0.5)*h*20;}let mean=0;for(let i=0;i<N;i++){wv[i]+=vv[i]*h;mean+=wv[i];}mean/=N;const lim=Math.min(14,depth*0.8+0.5);for(let i=0;i<N;i++){wv[i]=clamp(wv[i]-mean,-lim,lim);}}
  // him moving in it stirs the surface
  for(const q of P){if(q.gone)continue;const l=poolLocal(pr,q.x,q.y);if(l.x<=POOLD.x0||l.x>=POOLD.x1)continue;const lv=poolLevel(pr)+poolWave(pr,l.x);if(Math.abs(l.y-lv)<4){const vy=(q.y-q.py)/(1/360);poolKick(pr,l.x,clamp(vy*0.004,-8,8)*dt*60*0.15);}}
  // over the rim
  const lv=poolLevel(pr);for(const [i,sg] of [[0,-1],[N-1,1]]){const top=lv+wv[i];if(top<POOLD.rim&&m.vol>1){const out=Math.min(m.vol*0.02,(POOLD.rim-top)*100*dx*Math.min(1,dt*6));if(out>0.5){const{p,v}=takeFrac(m,out/m.vol);overSpill(pr,sg,v,p);wv[i]=POOLD.rim-lv;}}}}
/* ---------- pouring a big amount: a stream that takes time to empty, sized by the flow ----------
   A 1 L bottle empties in ≈ 2 s, a 20 L can in ≈ 10 s, a drum (200 L) through its bung in ≈ 40 s: flow ∝ √volume here. */
let POURS=[];
function pourBig(key,x,y,amt,front){const d=CHEM[key];if(!d||amt<=0)return;const rate=d.metal||d.powder?Math.max(2,amt/3):Math.max(20,Math.sqrt(amt)*14);
  POURS.push({key,x,y,left:amt,rate,front,p:d.metal||d.powder?null:pureProf(key),t:0});}
function poursStep(dt){for(let i=POURS.length-1;i>=0;i--){const q=POURS[i];q.t+=dt;const out=Math.min(q.left,q.rate*dt);q.left-=out;const d=CHEM[q.key];
    if(d.metal||d.powder){const n=Math.max(1,Math.min(6,Math.ceil(out/(d.metal?1:0.5))));for(let j=0;j<n;j++)dropSolid(q.key,{x:q.x+rnd(-1.5,1.5),y:q.y},out/n,q.front);}
    else{const n=Math.max(1,Math.min(10,Math.ceil(out/2)));for(let j=0;j<n;j++){const v=out/n,sp=Math.min(6,0.6+Math.sqrt(q.rate)*0.08);
      if(q.front)FDROPS.push({x:q.x+rnd(-sp,sp)*0.5,y:q.y,vy:rnd(0,30),vol:v,p:q.p,v:view});else DROPS.push({x:q.x+rnd(-sp,sp)*0.4,y:q.y+rnd(0,2),vx:rnd(-6,6),vy:rnd(20,60),t:0,vol:v,p:q.p,key:q.key});}}
    if(q.left<=0.0001)POURS.splice(i,1);}}
