/* TRAUMA_LAB_MAIN */
/* ===== sim/ammo.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
/* =========================================================
   AMMUNITION: real cartridge data, bullet types and what each one does in tissue, ejected cases, bullet drop.
   Lengths in cm, masses in g, velocities in m/s (published SAAMI / CIP / military specifications, rounded).
   ========================================================= */
// case: L length, D base diameter, N neck diameter (bottleneck rifle cases), rim; mat brass | steel (lacquered, as
// most 7.62×39 is) | hull (12 ga: plastic tube on a brass head). port: ejection port distance behind the muzzle (cm).
// act: how the empty case leaves the gun: semi/auto at once, bolt and pump when the action is cycled, revolver never.
const CART={
  p22:     {cal:'.22 LR',            bd:0.57,bm:2.6, v:330, L:1.56,D:0.57,rim:0.69,mat:'brass',act:'semi',port:5},
  pistol:  {cal:'9×19 mm',           bd:0.90,bm:8.0, v:360, L:1.92,D:0.99,mat:'brass',act:'semi',port:6},
  smg:     {cal:'9×19 mm',           bd:0.90,bm:8.0, v:400, L:1.92,D:0.99,mat:'brass',act:'auto',port:14},
  p45:     {cal:'.45 ACP',           bd:1.15,bm:14.9,v:255, L:2.28,D:1.20,mat:'brass',act:'semi',port:6.5},
  revolver:{cal:'.44 Magnum',        bd:1.09,bm:15.6,v:440, L:3.26,D:1.16,rim:1.31,mat:'brass',act:'revolver',port:0},
  rifle:   {cal:'5.56×45 mm NATO',   bd:0.57,bm:4.0, v:940, L:4.47,D:0.96,N:0.64,mat:'brass',act:'auto',port:30},
  ak:      {cal:'7.62×39 mm',        bd:0.79,bm:7.9, v:715, L:3.87,D:1.13,N:0.86,mat:'steel',act:'auto',port:32},
  dmr:     {cal:'7.62×51 mm (.308)', bd:0.78,bm:9.7, v:840, L:5.12,D:1.20,N:0.87,mat:'brass',act:'semi',port:40},
  sniper:  {cal:'.338 Lapua Magnum', bd:0.86,bm:16.2,v:900, L:6.93,D:1.49,N:0.94,mat:'brass',act:'bolt',port:52},
  bmg:     {cal:'12.7×99 mm (.50 BMG)',bd:1.29,bm:42,v:890,L:9.91,D:2.04,N:1.42,mat:'brass',act:'semi',port:70},
  shotgun: {cal:'12 gauge',          bd:0.84,bm:3.5, v:400, L:7.0, D:2.08,mat:'hull',act:'pump',port:42},
  slug:    {cal:'12 gauge',          bd:1.80,bm:28,  v:480, L:7.0, D:2.08,mat:'hull',act:'pump',port:42},
};
// Bullet types. x: expansion (diameter after it opens), xd: depth where it has opened (cm); bone: share of the bone
// cost it pays; cav: wound-cavity factor; fz: fuze depth for explosive rounds; fr: depth where a fragmenting round breaks up.
const AMMO={
  fmj:   {n:'FMJ',          full:'Full metal jacket',   col:'#c9a24a', d:'Copper jacket over lead. Keeps its shape, goes deep and often exits.'},
  sp:    {n:'Soft point',   full:'Soft point',          col:'#d9b98a', d:'Exposed lead tip mushrooms to ≈1.8× its width after ≈4 cm: a wider wound that rarely exits.',x:1.8,xd:4,cav:1.3},
  hp:    {n:'Hollow point', full:'Jacketed hollow point',col:'#d38b4a', d:'The cavity in the nose opens into petals ≈1.6× wider after ≈2.5 cm: a bigger wound that usually stays inside.',x:1.6,xd:2.5,cav:1.3},
  ap:    {n:'AP',           full:'Armor piercing',      col:'#2b2f33', d:'Hardened steel or tungsten core. Punches through body armour and bone with a narrow wound.',bone:0.4,cav:0.85,ap:true},
  inc:   {n:'Incendiary',   full:'Incendiary',          col:'#c0392b', d:'A compound in the nose ignites on impact: it burns the entry and along the wound and can set clothes alight.',inc:true},
  he:    {n:'Explosive',    full:'High explosive',      col:'#e0b400', d:'A small charge detonates a few cm inside: a blast cavity and a spray of jacket fragments that stay in.',he:true,fz:2.5},
  frag:  {n:'Fragmenting',  full:'Fragmenting',         col:'#7a8a99', d:'Breaks apart in tissue: many small wound channels, and the shards stay inside.',frag:true,fr:5},
  buck:  {n:'00 Buck',      full:'00 Buckshot',         col:'#b03a2e', d:'Nine 8.4 mm lead balls. Deep holes in a tight group at room distance.'},
  bird:  {n:'Birdshot',     full:'#7½ Birdshot',        col:'#2e7d32', d:'Hundreds of 2.4 mm pellets, ≈5 J each. Painful and bloody, but shallow: they stay under the skin unless fired point-blank.'},
  dragon:{n:'Dragon’s breath',full:'Dragon’s breath',   col:'#ff7a1a', d:'Magnesium pellets that burn as they fly: a jet of sparks and flame, almost no penetration.',inc:true},
  slug:  {n:'Rifled slug',  full:'Rifled lead slug',    col:'#8a8f94', d:'One 28 g soft-lead slug: a huge wound channel, flattens on bone.'},
  frag12:{n:'Explosive slug',full:'Explosive slug (FRAG-12 type)',col:'#e0b400',d:'A fin-stabilised slug with a small charge that detonates on impact, just under the skin.',he:true,fz:1.2},
};
// which loads exist in each calibre (nobody makes an explosive .22, or AP birdshot)
const AVAIL={p22:['fmj','hp'],pistol:['fmj','hp','ap','frag'],smg:['fmj','hp','ap','frag'],p45:['fmj','hp','frag'],revolver:['fmj','sp','hp'],
  rifle:['fmj','sp','ap','inc','frag'],ak:['fmj','sp','ap','inc'],dmr:['fmj','sp','ap','inc','he'],sniper:['fmj','hp','ap','inc','he'],bmg:['fmj','ap','inc','he'],
  shotgun:['buck','bird','dragon'],slug:['slug','frag12']};
// HE fill → blast radius in tissue (cm): a rifle-calibre explosive bullet carries a fraction of a gram, a .50 Raufoss-type ≈ 1 g,
// a 12 ga explosive slug ≈ 2 g. Damage falls off over a few cm.
const HER={dmr:2.4,sniper:3,bmg:6,slug:5};
function ammoOf(k){const L=AVAIL[k];if(!L)return null;const a=OPT.ammo&&OPT.ammo[k];return L.includes(a)?a:L[0];}
function setAmmo(k,a){if(!AVAIL[k]||!AVAIL[k].includes(a))return;OPT.ammo=Object.assign({},OPT.ammo,{[k]:a});saveOpt();}
function ammoName(k,a){a=a||ammoOf(k);return CART[k]&&a?CART[k].cal+' '+AMMO[a].n:'';}
// per-shot numbers for a load: some loads change the projectile itself (birdshot, dragon's breath, slugs)
function ammoShot(k,Wp){const a=ammoOf(k),o={am:a,pellets:Wp.pellets,E:Wp.E,m:Wp.m,cav:Wp.cav,spread:Wp.spread,dia:null};
  // #7½ birdshot: ≈350 lead pellets of 2.4 mm, 0.08 g each, at ≈366 m/s: ≈5.4 J a pellet (½·0.00008·366²), less than a
  // .22 air-rifle pellet (≈15–20 J). On a person that breaks the skin and lodges a few mm to ≈2 cm deep: many small
  // wounds, rarely through the chest wall or into a big vessel beyond a couple of metres. Simulated as 36 pellets, each
  // with a real pellet's mass and energy (up to v1.19 each carried ≈26 J, the shell's energy shared among 36: at 4 m it
  // cut the carotids and the aorta)
  if(a==='bird'){o.pellets=36;o.E=5.4;o.m=0.00008;o.dia=0.24;o.cav=0.15;o.spread=0.09;}
  else if(a==='frag12'){o.E=2300;o.m=0.019;}
  else if(a==='hp'||a==='sp')o.cav=Wp.cav*(AMMO[a].cav||1);
  else if(a==='ap'){o.cav=Wp.cav*0.85;o.E=Wp.E*1.04;}
  return o;}
// gravity felt by a bullet in the slowed-down simulation: real drop over a real distance.
// Bullets fly at BSPD (cm/s, slowed so you can see them); real ones at v (m/s). Over a path s the real flight time is
// s/v, so the real drop is ½g(s/v)²; scaling gravity by (BSPD/v)² gives exactly that drop at the slowed speed.
function dropK(k){const c=CART[k];if(!c||!BSPD[k])return 0.005;const r=BSPD[k]/(c.v*100);return r*r;}
function fmtDrop(cm){const mm=cm*10;return mm<0.1?'< 0.1 mm':mm<10?mm.toFixed(1)+' mm':(mm/10).toFixed(1)+' cm';}
/* ---------- terminal effects that depend on the bullet type ---------- */
// a shard of jacket or lead that ends up in the tissue: it damages what it crosses and stays (X-ray, forceps)
function addShard(seg,s0,w0,s1,w1,z,rep,kind){
  const R=radS(seg,clamp(s1,0,seg.len))||seg.ra;const w=clamp(w1,-R*0.92,R*0.92),s=clamp(s1,0.3,seg.len-0.3);
  const Li={s:s0,w:w0},Le={s,w};
  for(const o of seg.organs){if(zIn(z,o)&&ellHit(o,Li,Le,0.12)){dmgOrgan(o,(9+8*Math.random())*o.vuln,rep,'torn by fragments');}}
  for(const v of seg.vessels){if(!zIn(z,v))continue;if(polyHit(v.pts,Li,Le,v.width/2+0.1)&&Math.random()<0.6)cutVessel(v,0.25,{s,w,dw:0,ds:0},rep);}
  seg.tracks.push({s1:s0,w1:w0,s2:s,w2:w,r:0.18});if(seg.tracks.length>40)seg.tracks.shift();
  const L={seg,s,w,z,k:kind||'shard',t:T,rot:rnd(0,6.28),sz:rnd(0.35,0.7)};
  if(FSHOT){L.fx=FSHOT.x+(w-w0)*0.25+rnd(-1.2,1.2);L.fy=FSHOT.y+(s-s0)*0.6+rnd(-1.2,1.2);L.fv=view;}
  LODGED.push(L);if(LODGED.length>90)LODGED.shift();return L;}
function spray(seg,at,dl,n,len,cone,z,rep,kind){let c=0;const a0=Math.atan2(dl.s,dl.w);
  for(let i=0;i<n;i++){const a=a0+rnd(-cone,cone),l=len*rnd(0.4,1);addShard(seg,at.s,at.w,at.s+Math.sin(a)*l,at.w+Math.cos(a)*l,z,rep,kind);c++;}return c;}
// explosive bullet: the charge goes off at the fuze depth. Overpressure tears a cavity of radius R around the point,
// the jacket breaks into fragments that fly on in a cone, and the blast vents back out through the nearest skin.
function heBlast(seg,at,dl,b,rep){const R=(HER[b.k]||2)*(b.am==='frag12'?1:1);
  const p=toWorld(seg,at.s,at.w),dd=dirWorld(seg,dl.w,dl.s);
  for(const o of seg.organs){const d=dps(o.w,o.s,at.w,at.s,at.w,at.s).d-Math.max(o.rw,o.rs)*0.6;if(d<R)dmgOrgan(o,(60+60*Math.random())*clamp(1-d/R,0.25,1)*o.vuln*(1+R/4),rep,'blasted');}
  for(const v of seg.vessels){if(v.stump)continue;if(polyHit(v.pts,at,at,v.width/2+R*0.8))cutVessel(v,0.6+0.4*Math.random(),{s:at.s,w:at.w,dw:dl.w,ds:dl.s},rep);}
  for(const bo of seg.bones){if(bo.shape==='ribs'){if(R>2.5)for(let i=0;i<Math.round(R/2);i++)hitBone(bo,120,rep,{s:at.s+rnd(-R,R),w:at.w,z:b.z});continue;}if(boneCross(bo,at,at,R*0.8))hitBone(bo,90+R*25,rep,boneHitAt(bo,at,at,b.z));}
  // the blast vents through the skin it came in by: a torn crater
  const Rs=radS(seg,clamp(at.s,0,seg.len))||seg.ra,toSkin=Rs-Math.abs(at.w);
  const vent={s:at.s,w:Math.sign(at.w||-dl.w)*Rs*0.97};
  const cr=digHole(seg,{type:'hole',exit:true,torn:2,s:vent.s,w:vent.w,r:Math.min(4.5,0.9+R*0.55),bleed:0.8+R*0.35,dw:Math.sign(vent.w),ds:0,z:b.z});
  if(cr){addStrands(seg,cr,R>3?3:2,1.5+R*0.6);if(FSHOT){cr.fx1=FSHOT.x;cr.fy1=FSHOT.y;}}
  burnHit(seg,vent.s,vent.w,4+R*1.5,b.z,true);
  const nf=spray(seg,at,dl,Math.round(5+R*1.5),R*1.8,0.7,b.z,rep,'shard');
  rep.push('explosive round detonated inside · '+nf+' fragments');
  mist(p.x,p.y,-dd.x,-dd.y,10+R*4,520,1.1,0.9);spawnGibs(p.x,p.y,-dd.x,-dd.y,Math.round(R*0.9),'flesh',520);
  FX.push({k:'boom',x:p.x,y:p.y,t:0,life:0.35,p:Math.min(0.5,R/12)});emitSound('boom');shake=reduceMotion?0:Math.max(shake,0.12+R*0.04);
  hurt(seg,at.s,at.w,25+R*8);
  impulse(seg,clamp(at.s/seg.len,0,1),dd.x,dd.y,600+R*350);
  return cr;}
// incendiary: the filler flashes at the entry (≈ 2500 °C for a few ms) and keeps burning along the first few cm
function incHit(seg,Li,Le,b,rep,big){const q=big?14:b.k==='bmg'?16:9;
  burnHit(seg,Li.s,Li.w,q,b.z,false);
  for(const o of seg.organs)if(zIn(b.z,o)&&ellHit(o,Li,Le,0.3))dmgOrgan(o,6*o.vuln,rep,'burned');
  const p=toWorld(seg,Li.s,Li.w);for(let i=0;i<6;i++)FX.push({k:'spark',x:p.x+rnd(-1,1),y:p.y+rnd(-1,1),t:0,life:rnd(0.15,0.35)});
  rep.push('incendiary burn at the entry');}
/* ---------- ejected cases ---------- */
let SHELLS=[],SHELLQ=[];
function ejectCase(k,x0,y0,a){const c=CART[k];if(!c||c.act==='revolver')return;
  const delay=c.act==='bolt'?0.7:c.act==='pump'?0.45:0;
  SHELLQ.push({k,x0,y0,a,at:T+delay});}
function caseStep(dt){
  for(let i=SHELLQ.length-1;i>=0;i--){const q=SHELLQ[i];if(T<q.at)continue;SHELLQ.splice(i,1);const c=CART[q.k];
    // the port is on the right side of the gun and cases leave mostly sideways (into the screen in a side view):
    // what you see in profile is a hop of ≈ 1.5–3 m/s upward and ≈ 0.5–1.5 m/s back, so they land around the shooter's feet
    const fl=Math.cos(q.a)<0?-1:1,ca=Math.cos(q.a),sa=Math.sin(q.a),px=q.x0-ca*c.port,py=q.y0-sa*c.port-1.5;
    const rifle=c.N!=null,man=c.act==='pump'||c.act==='bolt'?0.6:1,up=(rifle?rnd(180,320):rnd(120,240))*man,back=(rifle?rnd(30,90):rnd(20,70))*man;
    SHELLS.push({k:q.k,x:px,y:py,vx:-ca*back*fl*fl+rnd(-20,20),vy:-up,ang:q.a,av:rnd(18,40)*(Math.random()<0.5?-1:1),rest:false,b:0});
    if(SHELLS.length>160)SHELLS.shift();}
  for(const s of SHELLS){if(s.rest)continue;const c=CART[s.k];
    s.vy+=G*dt;s.vx*=1-0.4*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.ang+=s.av*dt;
    const r=c.D/2;
    if(s.y>-r){s.y=-r;if(s.vy>40){s.b++;// the recorded drop already holds its own bounces: play it once, at first contact. Pitch follows the case:
      // the ring of a thin tube scales roughly with 1/length (9 mm ≈ ×1.25, 5.56 ≈ ×1, .50 BMG ≈ ×0.6); steel rings duller
      if(s.b===1){if(c.mat==='hull')emitSound('hull',clamp(s.vy/400,0.2,1));else emitSound('casing',clamp(s.vy/320,0.25,1),clamp(Math.sqrt(4.47/c.L),0.55,1.5)*(c.mat==='steel'?0.88:1));}}
      s.vy=-s.vy*(c.mat==='hull'?0.2:0.38);s.vx*=0.6;s.av=s.av*0.5+s.vx*0.12;
      if(Math.abs(s.vy)<25&&Math.abs(s.vx)<12){s.vy=0;s.vx=0;s.rest=true;s.ang=Math.round(s.ang/Math.PI)*Math.PI+rnd(-0.05,0.05);}}
    // sliding on the floor: brass on vinyl or concrete, μ ≈ 0.3 → decelerates at ≈ 3 m/s²
    if(s.y>=-r-0.05&&!s.rest){const dv=300*dt;s.vx=Math.abs(s.vx)<=dv?0:s.vx-Math.sign(s.vx)*dv;if(Math.abs(s.vx)<1&&Math.abs(s.vy)<25){s.rest=true;s.vy=0;s.ang=Math.round(s.ang/Math.PI)*Math.PI+rnd(-0.05,0.05);}}
    if(s.x<-ROOM+r){s.x=-ROOM+r;s.vx=Math.abs(s.vx)*0.4;}if(s.x>ROOM-r){s.x=ROOM-r;s.vx=-Math.abs(s.vx)*0.4;}}}
