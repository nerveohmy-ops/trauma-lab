/* TRAUMA_LAB_MAIN */
/* ===== sim/body.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
/* =========================================================
   BODY MODEL
   ========================================================= */
let P=[], segs=[], joints=[], SEG={}, ORG={}, BONES=[], VESSELS=[], ORDER=[];
// which way the loaded body faces: 1 = right (as built), -1 = left (bodyTurn mirrors him). Each part's frame has its
// front (+w) on the facing side, so anatomy, wounds and drawing mirror with him; joint angles are read in his own sense
let FACE=1;
let V=null, DR=null, OBJ=[], BLOOD=[], POOLS=[], WALLST=[], FX=[], LOG=[], FW=[], GIBS=[], DECALS=[], STREAMS={};
function addP(x,y,m,r,seg,end){P.push({x,y,px:x,py:y,m,im:1/m,r,seg,end});return P.length-1;}
function rad(seg,t){return seg.ra+(seg.rb-seg.ra)*t;}
function radS(seg,s){if(s<0)return Math.sqrt(Math.max(0,seg.ra*seg.ra-s*s));if(s>seg.len){const d=s-seg.len;return Math.sqrt(Math.max(0,seg.rb*seg.rb-d*d));}return rad(seg,s/seg.len);}
function frame(seg){const A=P[seg.a],B=P[seg.b];let ux=B.x-A.x,uy=B.y-A.y;const L=Math.hypot(ux,uy)||1;ux/=L;uy/=L;return{ax:A.x,ay:A.y,ux,uy,nx:uy*FACE,ny:-ux*FACE,L};}
function toLocal(seg,x,y){const f=frame(seg),dx=x-f.ax,dy=y-f.ay;return{s:dx*f.ux+dy*f.uy,w:dx*f.nx+dy*f.ny};}
function toWorld(seg,s,w){const f=frame(seg);return{x:f.ax+f.ux*s+f.nx*w,y:f.ay+f.uy*s+f.ny*w};}
function dirWorld(seg,dw,ds){const f=frame(seg);return{x:f.nx*dw+f.ux*ds,y:f.ny*dw+f.uy*ds};}
function dirLocal(seg,dx,dy){const f=frame(seg);return{w:dx*f.nx+dy*f.ny,s:dx*f.ux+dy*f.uy};}
function isBite(w){return w.type==='hole'&&w.dig&&w.r>=1.2&&!(w.sut>=1);}
function bitesOf(seg){if(!seg.hasBite)return [];return seg.wounds.filter(isBite);}
function insideSeg(seg,x,y){const A=P[seg.a],B=P[seg.b];const r=dps(x,y,A.x,A.y,B.x,B.y);if(r.d>=rad(seg,r.t))return false;
  if(seg.hasBite){const L=toLocal(seg,x,y);for(const w of seg.wounds)if(isBite(w)&&Math.hypot(L.w-w.w,L.s-w.s)<w.r*0.72)return false;}return true;}
// posture library, degrees, per joint key
const POSE={
  stand:  {neck:0, head:0, spine:0,  shoulder:0,  elbow:-8,  wrist:0,  hip:0,   knee:2,   ankle:0, weld:0},
  crouch: {neck:8, head:6, spine:-28,shoulder:-35,elbow:-55, wrist:0,  hip:-100,knee:125, ankle:-28, weld:0},
  lie:    {neck:8, head:0, spine:-4, shoulder:-15,elbow:-25, wrist:-10,hip:-12, knee:18,  ankle:5, weld:0},
  fetal:  {neck:30,head:20,spine:-45,shoulder:-75,elbow:-125,wrist:-25,hip:-108,knee:128, ankle:-10, weld:0},
  flinch: {neck:22,head:15,spine:-22,shoulder:-60,elbow:-110,wrist:-10,hip:-28, knee:32,  ankle:0, weld:0},
  // sitting on the floor, back against something, knees drawn up (story cover)
  sit:    {neck:4, head:2, spine:-6, shoulder:-20,elbow:-60, wrist:0,  hip:-100,knee:115, ankle:-18, weld:0},
};
const JK={weld:.5,neck:.3,head:.3,spine:.35,shoulder:.12,elbow:.12,wrist:.06,hip:.32,knee:.34,ankle:.25};
const ARMP={zombie:{shoulder:-95,elbow:-12,wrist:-10,neck:20,head:14},flail:{shoulder:-115,elbow:-70,wrist:-10,neck:15},handsup:{shoulder:-166,elbow:-22,wrist:-10},cover:{shoulder:-152,elbow:-142,wrist:-25,neck:22,head:12},crawl:{shoulder:-115,elbow:-35,wrist:0}};
const ACTL={zombie:'Undead',burning:'On fire',calm:'Calm',alert:'Alert',handsup:'Hands up',cover:'Covering',backoff:'Backing off',flee:'Fleeing',cower:'Cowering',crawl:'Crawling',none:'Unaware'};
const WR={weld:0,neck:10,head:8,spine:8,shoulder:28,elbow:30,wrist:20,hip:22,knee:28,ankle:12};
function makeBody(){
  if(!BID){FEMALE=OPT.sex==='f';const sj=document.querySelector('.subj');if(sj)sj.textContent=FEMALE?'Subject 02 · 60 kg':'Subject 01 · 70 kg';}
  P=[];segs=[];joints=[];SEG={};ORG={};BONES=[];VESSELS=[];FW=[];FACE=1;if(typeof frontParts==='function')FP=frontParts();
  const def=(id,label,ax,ay,bx,by,ra,rb,mass,side,kind)=>{
    const idx=segs.length;if(FEMALE)mass*=0.86;
    const s={id,label,ra,rb,len:Math.hypot(bx-ax,by-ay),mass,side,kind,organs:[],vessels:[],bones:[],wounds:[],tracks:[],connected:true,detT:0,idx,lastImpact:-9,ribsBroken:0,rest:{ax,ay,bx,by},tq:null};
    s.a=addP(ax,ay,mass/2,ra,idx,'a'); s.b=addP(bx,by,mass/2,rb,idx,'b');
    segs.push(s); SEG[id]=s; return s;
  };
  const org=(seg,id,name,s,w,rs,rw,kind,z0,z1,o={})=>{const g=Object.assign({seg,id,name,s,w,rs,rw,kind,z0,z1,hp:100,vuln:1,blast:0.8,ib:0,rot:0},o);seg.organs.push(g);ORG[id]=g;return g;};
  const ves=(seg,id,name,pts,width,type,rate,ext,z0,z1,o={})=>{const v=Object.assign({seg,id,name,pts,width,type,rate,ext,z0,z1,cut:0,clamp:false,at:null,deep:false,now:0},o);seg.vessels.push(v);VESSELS.push(v);return v;};
  const bone=(seg,id,name,shape,data,width,hp,dens,z0,z1,o={})=>{const b=Object.assign({seg,id,name,shape,width,hp,hp0:hp,dens,z0,z1,broken:false,bp:0.5,ba:rnd(0,6.28)},data,o);if(b.pts){b.fs0=b.pts[0][0];b.fs1=b.pts[b.pts.length-1][0];b.w0=b.pts[0][1];b.w1=b.pts[b.pts.length-1][1];b.off=0;}seg.bones.push(b);BONES.push(b);return b;};

  const head=def('head','Head',-0.5,-166,1.5,-160,9.2,7.4,5,'mid','head');
  const neck=def('neck','Neck',1.5,-160,0,-136,4.3,4.8,1.3,'mid','neck');
  const chest=def('chest','Chest',0,-136,0,-111,10.4,11.4,20,'mid','chest');
  const abd=def('abd','Abdomen',0,-111,0,-91,10.6,11.6,16,'mid','abd');

  org(head,'brain','Brain',0.4,-0.8,6.8,7.2,'brain',-1,1,{vuln:1.6,blast:0.9,ib:1});
  org(head,'eye','Left eye',2.7,6.1,0.95,1.05,'eye',0.2,1,{shallow:true});
  bone(head,'skull','Skull','ell',{s:0.6,w:-0.5,rs:8.5,rw:8.3},1,70,60,-1,1);
  org(neck,'trachea','Trachea',14.5,2.8,5.5,1.2,'trachea',-0.35,0.35,{vuln:1.2,shallow:true});
  org(neck,'esophagus','Esophagus',15,1.0,6.5,0.8,'esoph',-0.3,0.3,{vuln:0.8,ib:0.5});
  ves(neck,'carL','Left carotid artery',[[2,1.4],[24,1.3]],0.9,'a',24,1,0.2,1);
  ves(neck,'carR','Right carotid artery',[[2,1.0],[24,0.9]],0.9,'a',24,1,-1,-0.2);
  ves(neck,'jugL','Left jugular vein',[[2,0],[24,0.2]],1.1,'v',8,1,0.35,1);
  ves(neck,'jugR','Right jugular vein',[[2,-0.4],[24,-0.2]],1.1,'v',8,1,-1,-0.35);
  ves(neck,'vert','Vertebral artery',[[2,-1.6],[24,-1.8]],0.5,'a',6,0.3,-0.3,0.3,{deep:true});
  bone(neck,'cervical','Cervical spine','line',{pts:[[1,-2.4],[24,-2.7]]},2.1,60,70,-0.35,0.35,{spine:true});
  org(chest,'lungR','Right lung',8,-1.6,10.5,8.2,'lung',-1,-0.05,{vuln:0.9,blast:1.5,ib:2,far:true});
  org(chest,'lungL','Left lung',8.6,0.2,10,7.7,'lung',0.05,1,{vuln:0.9,blast:1.5,ib:2});
  org(chest,'heart','Heart',12.5,3.4,5.4,4.5,'heart',-0.4,0.65,{vuln:1.25,blast:1,ib:22,rot:-0.45});
  ves(chest,'aorta','Thoracic aorta',[[11,3],[5,2.6],[1.5,-1],[5,-5.8],[25,-6.2]],2,'a',70,0.25,-0.3,0.45,{deep:true});
  ves(chest,'svc','Vena cava',[[-3,-2],[11,-3.4],[25,-4.4]],1.8,'v',28,0.25,-0.6,0.05,{deep:true});
  ves(chest,'subcl','Subclavian artery',[[0.4,6.5],[1.8,1],[2.6,-4]],0.8,'a',14,0.4,-1,1,{deep:true});
  bone(chest,'thoracic','Thoracic spine','line',{pts:[[0,-2.8],[4,-5.4],[10,-8],[25,-8.6]]},2.4,70,80,-0.3,0.3,{spine:true});
  bone(chest,'ribs','Ribs','ribs',{s:9.5,w:0,rs:13,rw:10.8},0.7,999,35,-1,1);
  org(abd,'liver','Liver',3.5,1.6,5,9,'liver',-1,0.25,{ib:7});
  org(abd,'stomach','Stomach',4.6,5,4.3,4.8,'stomach',0,0.9,{vuln:0.9,ib:1});
  org(abd,'spleen','Spleen',4,-5.4,3,2.6,'spleen',0.35,1,{ib:6});
  org(abd,'kidneyR','Right kidney',8.6,-7.4,3.4,2.2,'kidney',-1,-0.2,{ib:3});
  org(abd,'kidneyL','Left kidney',7.6,-7.9,3.4,2.2,'kidney',0.2,1,{ib:3});
  org(abd,'intest','Intestines',13.5,2.4,6.6,8.3,'intest',-1,1,{vuln:0.7,ib:1.5});
  org(abd,'pancreas','Pancreas',6.6,-2.6,1.6,4.2,'pancreas',-0.5,0.7,{ib:2});
  org(abd,'gallbladder','Gallbladder',7,4.4,1.3,1.5,'gall',-0.85,-0.25,{ib:0.5});
  org(abd,'bladder','Bladder',20.5,6.4,3,3.3,'bladder',-0.4,0.4,{vuln:0.8,ib:0.5});
  ORG.intest.coils=[];for(let i=0;i<26;i++){const a=Math.random()*6.28,r=Math.sqrt(Math.random())*0.85;ORG.intest.coils.push([2.4+Math.cos(a)*r*8.3,13.5+Math.sin(a)*r*6.6,rnd(1.1,1.9)]);}
  ORG.brain.gyri=[];for(let i=0;i<9;i++)ORG.brain.gyri.push([rnd(-7,5),rnd(-3.5,6),rnd(1.5,3),rnd(0,6.28)]);
  ves(abd,'aortaAbd','Abdominal aorta',[[0,-6.4],[17,-6],[19,-5]],1.9,'a',55,0.2,-0.14,0.22,{deep:true});
  ves(abd,'ivc','Inferior vena cava',[[0,-4.6],[18,-3.6]],1.8,'v',24,0.2,-0.6,0.05,{deep:true});
  ves(abd,'iliac','Iliac arteries',[[16,-5.8],[19.5,-2],[21,0.8]],1.2,'a',22,0.3,-0.8,0.8,{deep:true});ves(abd,'mesent','Mesenteric artery',[[5,-6],[10,-1],[14,3]],0.7,'a',8,0.2,-0.3,0.3,{deep:true});ves(abd,'renal','Renal arteries',[[7.2,-6.2],[8.2,-6.9]],0.5,'a',9,0.2,-1,1,{deep:true});
  bone(abd,'lumbar','Lumbar spine','line',{pts:[[0,-8.6],[12,-7.8],[24,-8.6]]},2.7,75,85,-0.3,0.3,{spine:true});
  bone(abd,'pelvis','Pelvis','ell',{s:23,w:-1.5,rs:6,rw:10},1.6,90,70,-1,1,{thick:1.6,hitK:0.68});

  joint(chest,0,neck,'b','neck',-30,40);
  joint(neck,0,head,'b','head',-40,40);
  joint(chest,1,abd,'a','spine',-50,25);

  for(const [side,lab,dx] of [['far','Right',-1.2],['near','Left',1.2]]){
    const ua=def(side+'UpperArm',lab+' upper arm',dx,-134,dx,-109,4.2,3.6,2.1,side,'uarm');
    const fa=def(side+'Forearm',lab+' forearm',dx,-109,dx+1.5,-85,3.5,2.6,1.4,side,'farm');
    const hd=def(side+'Hand',lab+' hand',dx+1.5,-85,dx+2.5,-70,2.6,2.0,0.5,side,'hand');
    const th=def(side+'Thigh',lab+' thigh',dx*0.6,-91,dx*0.6+1,-50,8,5.5,9,side,'thigh');
    const sh=def(side+'Shin',lab+' lower leg',dx*0.6+1,-50,dx*0.6,-4.5,5.2,3.6,4,side,'shin');
    const ft=def(side+'Foot',lab+' foot',dx*0.6,-4.5,dx*0.6+15,-2.2,4,2,1.1,side,'foot');
    const z=[-0.55,0.55];
    bone(ua,side+'Hum',lab+' humerus','line',{pts:[[0,0],[ua.len,0]]},1.4,55,60,-0.45,0.45,{limb:true});
    ves(ua,side+'Brach',lab+' brachial artery',[[0,1.3],[ua.len,1]],0.6,'a',9,1,...z);
    ves(ua,side+'Basil',lab+' basilic vein',[[0,-1],[ua.len,-0.8]],0.7,'v',3,1,...z);
    ves(ua,side+'Ceph',lab+' cephalic vein',[[0,2.7],[ua.len*0.5,2.5],[ua.len,2.0]],0.45,'v',1.5,1,...z);
    bone(fa,side+'Rad',lab+' radius/ulna','line',{pts:[[0,0],[fa.len,0]]},1.2,45,50,-0.45,0.45,{limb:true});
    ves(fa,side+'Radial',lab+' radial artery',[[0,1],[fa.len,0.7]],0.5,'a',4,1,...z);
    ves(fa,side+'Ulnar',lab+' ulnar artery',[[0,-0.4],[fa.len,-0.7]],0.45,'a',3,1,...z);ves(fa,side+'FCeph',lab+' forearm vein',[[0,1.9],[fa.len,1.4]],0.4,'v',1,1,...z);
    bone(hd,side+'Meta',lab+' hand bones','line',{pts:[[0,0],[hd.len,0]]},1,30,30,-0.6,0.6,{limb:true,minor:true});
    ves(hd,side+'Palm',lab+' palmar arch',[[0,0.8],[hd.len,0.5]],0.4,'a',1.5,1,-0.8,0.8);
    bone(th,side+'Fem',lab+' femur','line',{pts:[[0,0],[th.len,0.3]]},2.2,90,100,-0.4,0.4,{limb:true,leg:true});
    ves(th,side+'FemA',lab+' femoral artery',[[0,2.7],[th.len,1.3]],0.9,'a',18,1,...z);
    ves(th,side+'FemV',lab+' femoral vein',[[0,1.6],[th.len,0.3]],1,'v',8,1,...z);
    ves(th,side+'Prof',lab+' deep femoral artery',[[3,2.2],[12,-0.6],[26,-1.8]],0.6,'a',6,1,...z);ves(th,side+'Popl',lab+' popliteal artery',[[30,0.6],[th.len,-1.9]],0.7,'a',9,1,...z);ves(th,side+'Saph',lab+' great saphenous vein',[[0,3.6],[th.len*0.5,3.1],[th.len,2.6]],0.5,'v',2,1,...z);
    bone(sh,side+'Tib',lab+' tibia','line',{pts:[[0,1],[sh.len,0.8]]},1.6,70,80,-0.45,0.45,{limb:true,leg:true});
    ves(sh,side+'TibA',lab+' tibial artery',[[0,-0.8],[sh.len,-0.6]],0.5,'a',4,1,...z);
    ves(sh,side+'PTib',lab+' posterior tibial artery',[[0,-1.9],[sh.len,-1.1]],0.45,'a',3,1,...z);ves(sh,side+'SSaph',lab+' small saphenous vein',[[4,-3.4],[sh.len,-2.1]],0.4,'v',1.2,1,...z);
    bone(ft,side+'Tars',lab+' foot bones','line',{pts:[[0,0.3],[ft.len,0]]},1.2,35,35,-0.6,0.6,{limb:true,leg:true,minor:true});
    ves(ft,side+'Dors',lab+' dorsalis pedis',[[2,1.6],[ft.len,0.8]],0.4,'a',1.5,1,-0.8,0.8);
    joint(chest,0.1,ua,'a','shoulder',-170,55,{stump:14,arm:side});
    joint(ua,1,fa,'a','elbow',-150,0,{stump:8,arm:side});
    joint(fa,1,hd,'a','wrist',-70,70,{stump:3,arm:side});
    joint(abd,1,th,'a','hip',-125,35,{leg:true,stump:24});
    joint(th,1,sh,'a','knee',0,150,{leg:true,stump:10});
    joint(sh,1,ft,'a','ankle',-35,35,{leg:true,stump:3});
  }
  detailBody();
  for(const sg of segs){if(sg.side==='mid')continue;const arm=['uarm','farm','hand'].includes(sg.kind),n=sg.side==='near';sg.zr=arm?(n?[0.62,1.2]:[-1.2,-0.62]):(n?[0,1]:[-1,0]);}
  ORDER=['farUpperArm','farForearm','farHand','farThigh','farShin','farFoot','abd','neck','chest','head','nearThigh','nearShin','nearFoot','nearUpperArm','nearForearm','nearHand'].map(k=>SEG[k]);
  V={blood:5000,rbc:5000,hr:72,sys:120,co:1,spo2:98,brainO2:1,consc:1,pain:0,painEff:0,ko:0,dead:false,bd:false,arrest:false,breath:1,rise:1,ext:0,int:0,phase:0,lastBeat:-1,prevBeat:-2,lowSpT:0,deadAt:0,start:T,resp:14,flinch:0,clutch:null,bphase:0,vfT:0,fear:0,act:'calm',armW:0,armP:null,cow:0,walk:0,gait:0,thx:null,rad:0,radT:0,marrow:false};
  DR={};for(const k in DRUGS)DR[DRUGS[k].key]={l:0,p:0,total:0};
}
function detailBody(){
  const M=(seg,w,s,rw,rs,rot)=>seg.muscles.push({w,s,rw,rs,rot:rot||0});
  for(const sg of segs){
    sg.capil=[];sg.nerves=[];sg.muscles=[];
    for(const v of sg.vessels){
      const n=(sg.kind==='chest'||sg.kind==='abd')?4:(sg.kind==='hand'||sg.kind==='foot')?2:4;
      for(let i=0;i<n;i++){
        const k=Math.floor(rnd(0,v.pts.length-1)),t=Math.random(),p0=v.pts[k],p1=v.pts[k+1];
        let ss=lerp(p0[0],p1[0],t),ww=lerp(p0[1],p1[1],t);const pts=[[ss,ww]];const dir=Math.random()<0.5?-1:1;
        for(let q=0;q<4;q++){ss+=rnd(0.8,2.6);ww+=dir*rnd(0.5,2);if(Math.abs(ww)>radS(sg,ss)*0.82)break;pts.push([ss,ww]);
          if(q===1&&Math.random()<0.6){const b=[[ss,ww],[ss+rnd(1,2.5),ww-dir*rnd(0.6,1.6)]];sg.capil.push({pts:b,type:v.type,w:Math.max(0.1,v.width*0.16)});}}
        if(pts.length>1)sg.capil.push({pts,type:v.type,w:Math.max(0.12,v.width*0.26)});
      }
    }
    const L=sg.len;const MF=(w,s,rw,rs,rot,n)=>sg.muscles.push({w,s,rw,rs,rot:rot||0,k:'flat',n});const MT=(w,s,rw,rs,rot,n,t)=>sg.muscles.push({w,s,rw,rs,rot:rot||0,k:'fus',n,t:t??0.35});
    if(sg.kind==='uarm'){MT(-1.9,12.5,2.1,9.5,0,'Triceps');MT(0.6,18,1.2,5,0,'Brachialis',0.2);MT(1.9,12.5,1.9,8.5,0,'Biceps',0.45);MF(0.3,3.6,3.5,4.6,0,'Deltoid');sg.nerves.push({pts:[[0,0.6],[L,0.4]],w:0.4});}
    if(sg.kind==='farm'){MT(-1.3,8.5,1.35,7.8,0,'Extensors',0.6);MT(1.0,8.8,1.45,8,0,'Flexors',0.65);MT(1.7,5.5,1.2,6.2,0.05,'Brachioradialis',0.5);sg.nerves.push({pts:[[0,0.4],[L,0.3]],w:0.35});}
    if(sg.kind==='hand'){MT(1.1,4.6,0.85,1.8,0,'Thenar',0.1);MT(-0.8,4.9,0.65,1.8,0,'Hypothenar',0.1);}
    if(sg.kind==='thigh'){MF(-5.2,2.4,3.6,5.6,0.1,'Gluteus maximus');MT(-0.4,11,2.6,9,0,'Adductors',0.25);MT(-3.6,21,2.6,16,0,'Biceps femoris',0.3);MT(-2.3,22,1.5,15,0,'Semitendinosus',0.45);MT(1.2,21.5,2.8,17,0,'Vastus lateralis',0.2);MT(3.4,19,2.1,16,0,'Rectus femoris',0.3);MT(2.4,20,0.7,19,-0.12,'Sartorius',0.1);sg.nerves.push({pts:[[0,-3],[L,-1.4]],w:0.8});}
    if(sg.kind==='shin'){MT(-0.6,17,1,11,0,'Peroneus',0.5);MT(-2.2,20,2,11,0,'Soleus',0.6);MT(-2.8,11.5,2.6,9.5,0,'Gastrocnemius',1.25);MT(2.2,15,1.3,12,0,'Tibialis anterior',0.75);sg.nerves.push({pts:[[0,-1.9],[L,-1]],w:0.45});}
    if(sg.kind==='foot'){MF(-1,7,0.8,5,0,'Sole muscles');MT(0.9,6,0.7,2.5,0,'Extensor brevis',0.3);}
    if(sg.kind==='chest'){MF(-9.3,1.5,1.4,6,0.1,'Trapezius');MF(-8.4,15,2,9,-0.1,'Latissimus dorsi');MF(-9.6,12,1,12,0,'Erector spinae');MF(5.6,14,1.4,4,0.3,'Serratus anterior');MF(8.3,5,2.2,6,0.15,'Pectoralis major');}
    if(sg.kind==='abd'){for(let i=0;i<4;i++)M(sg,9.3,1.5+i*4.6,1.1,2.1);MF(6,9,2.5,8,0.4,'External oblique');MF(-9.6,10,1.1,10,0,'Erector spinae');MF(-6,17.5,3,4.5,0.2,'Gluteus medius');}
    if(sg.kind==='head'){MF(-0.5,-2.2,3.2,3.2,0,'Temporalis');MT(3.4,8.6,1.4,2.3,0.25,'Masseter',0.1);}
    if(sg.kind==='neck'){MF(-3.3,12,1.2,11,0,'Trapezius');MT(1.2,12,1.2,10.5,-0.32,'Sternocleidomastoid',0.15);sg.nerves.push({pts:[[2,0.6],[24,0.5]],w:0.3});}
  }
}
function joint(p,t,c,end,key,minD,maxD,o={}){
  const j=Object.assign({p:p.idx,c:c.idx,t,end,key,min:minD*D2R,max:maxD*D2R,broken:false,wf:rnd(2.2,4.5),wp:rnd(0,6.28),chop:0},o);
  j.rest=wrap(segAng(c,end==='b')-segAng(p,false));
  c.joint=j; joints.push(j); return j;
}
function segAng(s,rev){const a=P[s.a],b=P[s.b];return rev?Math.atan2(a.y-b.y,a.x-b.x):Math.atan2(b.y-a.y,b.x-a.x);}
function jointRel(j){const p=segs[j.p],c=segs[j.c];return wrap(FACE*wrap(segAng(c,j.end==='b')-segAng(p,false))-j.rest);}
// turn round: mirror every point about x = cx, so the same joint angles now face the other way. Each point keeps the
// speed it had (turning round doesn't reverse where you are moving). A turn on the spot is a quick pivot on the feet
// (≈0.2 s); drawn as one frame it reads the same at game speed
function bodyTurn(cx){for(const p of P){const vx=p.x-p.px;p.x=2*cx-p.x;p.px=p.x-vx;}FACE=-FACE;if(V.anchorX!=null)V.anchorX=2*cx-V.anchorX;}
function BN(id){return BONES.find(b=>b.id===id);}
function legsOK(){
  if(BN('thoracic').broken||BN('lumbar').broken||BN('pelvis').broken||BN('cervical').broken)return false;
  for(const sd of ['far','near'])for(const k of ['Thigh','Shin','Foot']){const s=SEG[sd+k];if(!s.connected)return false;if(s.bones.some(b=>b.broken&&!b.minor))return false;}
  return true;
}
function armOK(side){for(const k of ['UpperArm','Forearm','Hand']){const s=SEG[side+k];if(!s.connected||s.bones.some(b=>b.broken&&!b.minor))return false;}return true;}
function muscleBase(j){
  if(j.key==='frac'||j.key==='weld')return 0;
  if(V.dead||V.frozenT>0||TKH)return 0;const c=segs[j.c],p=segs[j.p];
  if(!c.connected||!p.connected)return 0;
  if(BN('cervical').broken)return 0;
  if(j.leg&&(BN('thoracic').broken||BN('lumbar').broken))return 0;
  let m=V.consc;
  if(c.bones.some(b=>b.broken&&b.limb&&!b.minor)||p.bones.some(b=>b.broken&&b.limb&&!b.minor))m*=0.08;
  if(c.mtear||p.mtear)m*=1-0.75*Math.min(1,(c.mtear||0)+0.5*(p.mtear||0));
  return m;
}
function painW(){return clamp((V.painEff-22)/50,0,1);}
function poseTarget(key,j,h){
  let t,str;const pw=painW();
  if(V.rise>0.001){const e=ease(V.rise)*(1-(ACT.on?0.72*ACT.duckK:0.62*V.cow));t=lerp(POSE.crouch[key],POSE.stand[key],e);str=1;}
  else{t=lerp(POSE.lie[key],POSE.fetal[key],pw*0.85);str=0.14+0.32*pw;}
  if(ACT.on&&ACT.sitK>0.01&&!j.arm){t=lerp(t,POSE.sit[key],ACT.sitK);str=Math.max(str,1.4);}
  // story code is placing the arms (a gun, a knife, a treatment, a push): the arm muscles hold the angle they are at
  // instead of pulling back toward the standing pose against it
  if(ACT.on&&ACT.armHold&&j.arm){const a=jointRel(j)/D2R;j.ts=a;return [a,0.05];}
  if(V.flinch>0.01){t=lerp(t,POSE.flinch[key],V.flinch*0.6);str=Math.max(str,V.flinch*0.7);}
  if(V.armW>0.01&&V.armP&&ARMP[V.armP][key]!=null){let a=ARMP[V.armP][key];if(V.armP==='crawl'&&key!=='wrist')a+=Math.sin(T*5+(j.arm==='near'?0:Math.PI))*(key==='shoulder'?38:22);if(V.armP==='flail'&&key!=='wrist')a+=Math.sin(T*10+(j.arm==='near'?0:2.1))*(key==='shoulder'?55:40);const wv=V.armW*(1-V.flinch*0.6);t=lerp(t,a,wv);str=Math.max(str,wv*(key==='shoulder'?3.4:key==='elbow'?2.4:1.5));}
  if(V.walkOn&&(key==='knee'||key==='hip'||key==='ankle')){const ph=V.gait+(segs[j.c].side==='near'?0:Math.PI),l=Math.max(0,Math.cos(ph));const rk=ACT.on?1+clamp(((V.wsp||0)-115)/185,0,1)*0.6:1;t+=(key==='knee'?l*55:key==='hip'?-l*32:-l*10)*rk;str=Math.max(str,1.6);}
  if(pw>0.25&&V.consc>0.5&&V.rise<0.5&&!(V.armW>0.3&&j.arm))t+=Math.sin(T*j.wf*0.33+j.wp)*WR[key]*0.45*(pw-0.25);
  j.ts=(j.ts==null)?t:j.ts+(t-j.ts)*Math.min(1,h*4);
  return [j.ts,str];
}
function segX(ax,ay,bx,by,cx,cy,dx,dy){const d=(bx-ax)*(dy-cy)-(by-ay)*(dx-cx);if(Math.abs(d)<1e-9)return false;const u=((cx-ax)*(dy-cy)-(cy-ay)*(dx-cx))/d,v=((cx-ax)*(by-ay)-(cy-ay)*(bx-ax))/d;return u>=0&&u<=1&&v>=0&&v<=1;}
function restLen(seg){const r=seg.rest;return Math.hypot(r.bx-r.ax,r.by-r.ay);}
function frontHW(seg,y){return seg.kind==='head'?8.2:seg.kind==='neck'?4.8:torsoHW(y);}
function frontAbs(seg,s,z){const y=seg.rest.ay+s;return z==null?{x:null,y}:{x:clamp(z,-1,1)*frontHW(seg,y),y};}
function zIn(z,o){return z>=o.z0-0.08&&z<=o.z1+0.08;}
const LIMBK=['uarm','farm','hand','thigh','shin','foot'];
// The brain is split into the cerebrum (thinking, consciousness) and the brainstem (breathing, blood pressure, heartbeat control).
// A bullet path is checked against the brainstem itself; other injuries (blunt, blast, crush) damage it in proportion.
const STEM={w:-0.8,s:4,rw:1.4,rs:2.6};
function updateConnected(){
  for(const s of segs)s.connected=false;
  if(SEG.chest.gone)return;const st=[SEG.chest.idx];SEG.chest.connected=true;
  while(st.length){const i=st.pop();for(const j of joints){if(j.broken)continue;let o=-1;if(j.p===i)o=j.c;else if(j.c===i)o=j.p;if(o>=0&&!segs[o].connected&&!segs[o].gone){segs[o].connected=true;st.push(o);}}}
}
const ODMSG={};
/* =========================================================
   FRONT VIEW: anatomical layout derived from the same organ data
   x > 0 is the subject's left side (viewer's right)
   ========================================================= */
function torsoHW(y){
  if(FEMALE){if(y<-141)return 10.6+5.1*Math.sqrt(clamp((y+147)/6,0,1));if(y<-111)return lerp(15.7,12.9,(y+141)/30);if(y<-104)return lerp(12.9,12.3,(y+111)/7);if(y<-94)return lerp(12.3,17.4,(y+104)/10);return lerp(17.4,16,clamp((y+94)/9,0,1));}
  if(y<-141)return 11+6*Math.sqrt(clamp((y+147)/6,0,1));
  if(y<-111)return lerp(17,14.2,(y+141)/30);
  if(y<-104)return lerp(14.2,13.6,(y+111)/7);
  if(y<-94)return lerp(13.6,16.6,(y+104)/10);
  return lerp(16.6,15.2,clamp((y+94)/9,0,1));
}
function frontParts(){
  const L=[];
  const fa=typeof FEMALE!=='undefined'&&FEMALE,ax=fa?-1:0;
  for(const [side,sg] of [['near',1],['far',-1]]){
    L.push({id:side+'Hand',t:'cap',x1:sg*(23.4+ax),y1:-86,x2:sg*(24.2+ax),y2:-71,r1:fa?2.5:2.7,r2:fa?1.9:2.1});
    L.push({id:side+'Forearm',t:'cap',x1:sg*(21.6+ax),y1:-110,x2:sg*(23.4+ax),y2:-86,r1:fa?3.2:3.5,r2:fa?2.4:2.7});
    L.push({id:side+'UpperArm',t:'cap',x1:sg*(19.6+ax),y1:-141,x2:sg*(21.6+ax),y2:-110,r1:fa?4.1:4.4,r2:fa?3.3:3.6});
  }
  L.push({id:'head',t:'ell',cx:0,cy:-163.5,rx:8.2,ry:11.3});
  L.push({id:'neck',t:'cap',x1:0,y1:-154,x2:0,y2:-143,r1:4.8,r2:5.4});
  L.push({id:'chest',t:'torso',y0:-147,y1:-111});
  L.push({id:'abd',t:'torso',y0:-111,y1:-85});
  for(const [side,sg] of [['near',1],['far',-1]]){
    L.push({id:side+'Thigh',t:'cap',x1:sg*(fa?9.3:8.6),y1:-90,x2:sg*8.4,y2:-50,r1:fa?8.1:7.6,r2:5.3});
    L.push({id:side+'Shin',t:'cap',x1:sg*8.4,y1:-50,x2:sg*8,y2:-6,r1:5,r2:3.4});
    L.push({id:side+'Foot',t:'ell',cx:sg*8.6,cy:-3.2,rx:4.4,ry:3.4});
  }
  return L;
}
let FP=frontParts();
function frontHit(x,y){
  for(const f of FP){
    const seg=SEG[f.id];if(!seg||!seg.connected)continue;
    if(f.t==='cap'){const r=dps(x,y,f.x1,f.y1,f.x2,f.y2);const rr=lerp(f.r1,f.r2,r.t);if(r.d<rr){
      if(seg.kind==='neck')return{seg,s:y-seg.rest.ay,zx:clamp((x-r.qx)/rr,-1,1),f};
      const pp=fpPart(seg,r.t*(seg.fullL||seg.len));return{seg:pp.seg,s:pp.s,zx:clamp((x-r.qx)/rr,-1,1),f};}}
    else if(f.t==='ell'){const dx=(x-f.cx)/f.rx,dy=(y-f.cy)/f.ry;if(dx*dx+dy*dy<1){const s=seg.kind==='foot'?seg.len*0.6:(y-seg.rest.ay);return{seg,s,zx:clamp(dx,-1,1),f};}}
    else if(f.t==='torso'){if(y>=f.y0&&y<f.y1){const hw=torsoHW(y);if(Math.abs(x)<hw)return{seg,s:y-seg.rest.ay,zx:x/hw,f};}}
  }
  return null;
}
function frontLocal(hit){const r=radS(hit.seg,hit.s)||Math.max(hit.seg.ra,hit.seg.rb)*0.6;return{s:hit.s,r};}
function topSegAt(x,y){for(const s of [...ORDER].reverse())if(insideSeg(s,x,y))return s;return null;}
function aimAtBody(x,y){const p=pickSeg({x,y},400);if(!p)return 0;const A=P[p.seg.a],B=P[p.seg.b];const q=dps(x,y,A.x,A.y,B.x,B.y);return Math.atan2(q.qy-y,q.qx-x);}
function breathAmt(){return V.dead?0:Math.sin(V.bphase)*clamp(V.breath,0,1)*(0.35+clamp((V.resp-14)/30,0,0.6));}
function segRad(seg){if(seg.kind==='chest'&&!NOBREATH){const b=breathAmt();return[seg.ra+b*0.5,seg.rb+b*0.7];}return[seg.ra,seg.rb];}
let NOBREATH=false;
function segX(ax,ay,bx,by,cx,cy,dx,dy){const d=(bx-ax)*(dy-cy)-(by-ay)*(dx-cx);if(Math.abs(d)<1e-9)return false;const t=((cx-ax)*(dy-cy)-(cy-ay)*(dx-cx))/d,u=((cx-ax)*(by-ay)-(cy-ay)*(bx-ax))/d;return t>=0&&t<=1&&u>=0&&u<=1;}
const FORG={brain:[0,-167,6.9,6.6],eye:[3.2,-163.6,1.25,1.1],trachea:[0,-145,1.2,7.5],esophagus:[-0.6,-145,0.7,6],lungR:[-8.1,-129.4,5.9,13.2],lungL:[8.2,-129.4,5.5,13.2],heart:[2.1,-124.6,4.7,6.2],
  liver:[-3.6,-109,9.6,4.6],gallbladder:[-6.5,-104.4,1.1,1.6],stomach:[6.2,-106.4,4.7,6],spleen:[11.8,-107.8,1.6,3.1],pancreas:[3.6,-102.2,4.6,1.2],kidneyR:[-8.7,-100.4,2.4,3.6],kidneyL:[8.7,-100.4,2.4,3.6],intest:[0,-95,9.8,6.6],bladder:[0,-87.2,2.8,2.2]};
function frontOrganXY(o){
  const fo=FORG[o.id];if(fo)return{x:fo[0],y:fo[1],rx:fo[2],ry:fo[3]};
  const seg=o.seg;const cy=seg.rest.ay+o.s;
  const hw=seg.kind==='head'?8.2:seg.kind==='neck'?4.8:torsoHW(cy);
  const zc=(o.z0+o.z1)/2,zr=(o.z1-o.z0)/2;
  return{x:zc*hw,y:cy,rx:Math.max(1,Math.min(zr*hw*0.95,Math.max(o.rw,o.rs)*1.1)),ry:o.rs};
}
function wFix(wd,seg){let p=null;if(view==='back'&&wd.bx1!=null)p={x:(wd.bx1+(wd.bx2??wd.bx1))/2,y:(wd.by1+(wd.by2??wd.by1))/2};else if(view==='front'&&wd.fx1!=null)p={x:wd.fx1,y:wd.fy1};return p&&seg?keepIn(seg,p,wd.r||0.6):p;}
// pull a skin mark back onto its body part so it never sits in the gap between arm and torso
function keepIn(seg,p,r){const f=fpOf(seg);if(!f)return p;
  if(f.t==='cap'){const q=dps(p.x,p.y,f.x1,f.y1,f.x2,f.y2);const rr=lerp(f.r1,f.r2,q.t),lim=Math.max(0.3,rr*0.88-Math.min(r,rr*0.4));if(q.d<=lim)return p;const k=lim/(q.d||1);return{x:q.qx+(p.x-q.qx)*k,y:q.qy+(p.y-q.qy)*k};}
  if(f.t==='torso'){const y=clamp(p.y,f.y0+0.5,f.y1-0.5),hw=torsoHW(y)*0.92-Math.min(r,3);return{x:clamp(p.x,-hw,hw),y};}
  if(f.t==='ell'){const dx=(p.x-f.cx)/f.rx,dy=(p.y-f.cy)/f.ry,d=Math.hypot(dx,dy);if(d<=0.85)return p;return{x:f.cx+dx/d*0.85*f.rx,y:f.cy+dy/d*0.85*f.ry};}
  return p;}
function woundFrontXY(seg,wd){
  if(wd.ff&&view==='front'){const f=FW.find(q=>q.ref===wd);if(f)return f.type==='cut'?{x:(f.x+f.x2)/2,y:(f.y+f.y2)/2}:{x:f.x,y:f.y};return null;}
  if(wd.ff)return null;const cc=woundCenter(wd);const rr=radS(seg,cc.s)||seg.ra;
  if(view==='back'?cc.w>0.4*rr:cc.w<-0.4*rr)return null;
  return wFix(wd,seg)||frontPos(seg,cc.s,wd.z==null?0.85:wd.z);
}
// front/back views draw each limb once at full length; parts split off by a fracture share their parent's drawing
function fpRoot(seg){return SEG[seg.id.replace(/(X\d+)+$/,'')]||seg;}
function fpOf(seg){const r=fpRoot(seg);return FP.find(q=>q.id===r.id);}
function fpT(seg,s){const r=fpRoot(seg);return (s+(seg.off||0)-(r.off||0))/(r.fullL||r.len);}
function fpPart(root,S){if(S<=root.len)return{seg:root,s:S};for(const q of segs){if(q===root||!q.connected||q.gone||!q.id.startsWith(root.id+'X'))continue;const o=(q.off||0)-(root.off||0);if(S>=o-0.01&&S<=o+q.len+0.01)return{seg:q,s:S-o};}return{seg:root,s:Math.min(S,root.len)};}
function frontPos(seg,sv,z){
  const f=fpOf(seg);if(!f)return null;
  if(f.t==='torso'){const y=seg.rest.ay+sv;if(y<f.y0-3||y>f.y1+5)return null;const yy=clamp(y,f.y0,f.y1-0.5);return{x:z*torsoHW(yy)*0.9,y:yy};}
  if(f.t==='ell'){if(seg.kind==='foot')return{x:f.cx+z*f.rx*0.75,y:f.cy};const y=clamp(seg.rest.ay+sv,f.cy-f.ry*0.95,f.cy+f.ry*0.95);const k=Math.sqrt(Math.max(0,1-((y-f.cy)/f.ry)**2));return{x:f.cx+z*f.rx*k*0.88,y};}
  let t=seg.kind==='neck'?((seg.rest.ay+sv)-f.y1)/(f.y2-f.y1):fpT(seg,sv);t=clamp(t,0,1);const r=lerp(f.r1,f.r2,t);return{x:lerp(f.x1,f.x2,t)+z*r*0.82,y:lerp(f.y1,f.y2,t)};
}
function bodyPts(list){const ids=new Set();for(const g of list){ids.add(g.a);ids.add(g.b);}return [...ids].map(i=>P[i]);}
function pickSeg(w,tol){let best=null,bd=tol;for(const s of [...ORDER].reverse()){const A=P[s.a],B=P[s.b];const r=dps(w.x,w.y,A.x,A.y,B.x,B.y);const d=r.d-rad(s,r.t);if(d<bd){bd=d;best={seg:s,t:r.t};if(d<0)break;}}return best;}
function bodyAt(w){
  if(view!=='side'){const h=frontHit(w.x,w.y);if(!h)return null;const r=frontLocal(h);return{seg:h.seg,s:h.s,w:r.r*0.8*(view==='back'?-1:1),z:h.zx};}
  const p=pickSeg(w,Math.max(2,10/VS));if(!p)return null;const L=toLocal(p.seg,w.x,w.y);return{seg:p.seg,s:L.s,w:L.w,z:rnd(-1,1)};
}
function bodyAtOrg(w){
  if(view==='side'){const hits=[...ORDER].reverse().filter(g=>insideSeg(g,w.x,w.y));const g=hits.find(q=>q.organs.length&&q.connected)||hits.find(q=>q.connected)||hits[0];if(g){const L=toLocal(g,w.x,w.y);return{seg:g,s:L.s,w:L.w,z:0};}}
  return bodyAt(w);
}
function distalOf(seg){const out=[seg];let ch=true;while(ch){ch=false;for(const j of joints){if(j.broken)continue;if(out.includes(segs[j.p])&&!out.includes(segs[j.c])){out.push(segs[j.c]);ch=true;}}}return out;}
const ORG_ORDER=['brain','eye','trachea','esophagus','heart','lungL','lungR','liver','gallbladder','stomach','pancreas','spleen','kidneyL','kidneyR','intest','bladder'];
function orgState(o){return o.hp>=99?'intact':o.hp>75?'bruised':o.hp>40?'lacerated':o.hp>0?'perforated':'destroyed';}
