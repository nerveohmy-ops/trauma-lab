/* TRAUMA_LAB_MAIN */
/* ===== ui/panels.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
function trajGroups(){const out=[];let cur=null;for(const t of TRAJ){if(!cur||cur.n!==t.n){cur={n:t.n,name:t.name,col:t.col,view:t.view,list:[]};out.push(cur);}cur.list.push(t);}return out;}
function sideWord(seg,w){if(seg.kind==='head')return w>2?'face':w<-2?'back of head':'side of head';return w>0.3*(radS(seg,0)||seg.ra)?'front':w<-0.3*(radS(seg,0)||seg.ra)?'back':'side';}
let trajMore=false;
function trajPlace(){const hudH=$('hud').offsetHeight,el=$('traj'),xo=xray?40:0;if(trajOn){el.style.top=(hudH+8+xo)+'px';$('hint').style.visibility='hidden';$('log').style.top=(hudH+14+xo+el.offsetHeight)+'px';}else{$('hint').style.visibility='';$('log').style.top=(hudH+30)+'px';}}
function trajPanel(){
  const el=$('traj');if(!trajOn){el.hidden=true;trajPlace();return;}el.hidden=false;
  if(!trajDirty)return;trajDirty=false;
  const all=trajGroups().reverse(),gs=all.slice(0,trajMore?8:1);
  const esc=x=>String(x).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
  let h=`<h4><span>Bullet paths${all.length>1?' · '+all.length:''}</span><span>${all.length>1?`<button id="trajMore">${trajMore?'Less':'All'}</button> `:''}<button id="trajClr">Clear</button></span></h4>`;
  const C='#ffd166',ic=b=>`<svg viewBox="-7 -5 14 10" aria-hidden="true">${b}</svg>`;
  h+=`<div class="lg">`
    +`<span>${ic(`<circle r="3.2" fill="#111" stroke="${C}" stroke-width="1.2"/><circle r="1.1" fill="${C}"/>`)}entry</span>`
    +`<span>${ic(`<polygon fill="${C}" points="${Array.from({length:10},(_,i)=>{const a=i/10*6.283,r=i%2?1.9:4.4;return (Math.cos(a)*r).toFixed(2)+','+(Math.sin(a)*r).toFixed(2)}).join(' ')}"/>`)}exit</span>`
    +`<span>${ic(`<rect x="-2.6" y="-2.6" width="5.2" height="5.2" fill="${C}" stroke="#111" stroke-width=".8"/>`)}bullet stuck inside</span>`
    +`<span>${ic(`<polygon points="0,-4 3.3,0 0,4 -3.3,0" fill="#9aa3ab" stroke="${C}" stroke-width=".9"/>`)}stopped by armour</span>`
    +`<span>${ic(`<line x1="-6" y1="0" x2="6" y2="0" stroke="${C}" stroke-width="2.2" stroke-linecap="round"/>`)}through the body</span>`
    +`<span>${ic(`<line x1="-6" y1="0" x2="6" y2="0" stroke="${C}" stroke-width="1" stroke-dasharray="2 2"/>`)}outside the body</span>`
    +(view!=='side'?`<span>${ic(`<circle r="3.4" fill="none" stroke="${C}" stroke-width="1" stroke-dasharray="1.6 1.6"/>`)}on the far side</span>`:'')
    +`</div>`;
  if(!gs.length)h+=`<div class="h">Shoot the body to trace each bullet.</div>`;
  for(const g of gs){
    const hits=[...new Set(g.list.flatMap(t=>t.hits))].filter(x=>!/^stopped by|penetrated$/.test(x)||true);
    const segsIn=[...new Set(g.list.flatMap(t=>t.pts.filter(q=>q.k==='in').map(q=>q.seg.label.toLowerCase().replace(' (cut off)',''))))];
    const lod=g.list.filter(t=>t.pts.length&&t.pts[t.pts.length-1].k==='stop').length,thr=g.list.filter(t=>t.pts.length&&t.pts[t.pts.length-1].k==='out').length,arm=g.list.filter(t=>t.pts.some(q=>q.k==='armor')).length;
    const f=g.list[0].pts[0];const fate=[];
    if(g.list.length===1){const pts=g.list[0].pts,nm=q=>q.seg.label.toLowerCase().replace(' (cut off)','');const rt=[];for(let i=0;i<pts.length;i++){const q=pts[i];if(q.k!=='in')continue;const nx=pts[i+1];if(!nx)continue;if(nx.k==='out'||nx.k==='armor')rt.push('through '+nm(q));else if(nx.k==='stop')rt.push('lodged in '+nm(q));}const last=pts[pts.length-1];if(last&&last.k==='armor')rt.push(pts.length>1?'caught by armour':'stopped by armour');else if(last&&last.k==='out')rt.push('out');if(rt.length){fate.push(rt.join(' → '));}}
    if(!fate.length){if(thr)fate.push(thr>1?thr+' through and through':'through and through');if(lod)fate.push(lod>1?lod+' lodged':'lodged');if(arm)fate.push(arm>1?arm+' hit armour':'hit armour');}
    const entry=f?(f.seg.label.toLowerCase().replace(' (cut off)','')+' · '+(f.fv?(f.fv==='back'?'back':'front'):sideWord(f.seg,f.w))):'';
    h+=`<div class="t"><span class="n" style="background:${g.col}">${g.n}</span><div><b>${esc(g.name)}</b>${g.list.length>1?' · '+g.list.length+' pellets':''}<br><span class="h">in: ${esc(entry)}${segsIn.length>1?' → '+esc(segsIn.slice(1).join(' → ')):''} · ${fate.join(', ')}</span>${hits.length?`<br><span class="e">${esc(hits.slice(0,6).join(', '))}${hits.length>6?' +'+(hits.length-6):''}</span>`:''}</div></div>`;
  }
  el.innerHTML=h;const cb=$('trajClr');if(cb)cb.onclick=()=>{TRAJ=[];trajDirty=true;trajPanel();};const mb=$('trajMore');if(mb)mb.onclick=()=>{trajMore=!trajMore;trajDirty=true;trajPanel();};
  trajPlace();
}
/* ---------- X-ray inspector ---------- */
let PROBE=null;
function probeInfo(w){
  const L=[];let title='';const add=(t,cls)=>L.push([t,cls||'']);
  let segsAt=[],front=view!=='side';
  if(!front){segsAt=[...ORDER].reverse().filter(g=>{const A=P[g.a],B=P[g.b];const r=dps(w.x,w.y,A.x,A.y,B.x,B.y);return r.d<rad(g,r.t)+0.5;}).slice(0,2);}
  else{const h=frontHit(w.x,w.y);if(h)segsAt=[h.seg];}
  if(!segsAt.length)return null;
  title=segsAt.map(g=>g.label).join(' + ');
  for(const g of segsAt){
    let ls,lw,z=0;if(!front){const q=toLocal(g,w.x,w.y);ls=q.s;lw=q.w;}else{const h=frontHit(w.x,w.y);ls=h.s;z=h.zx;lw=null;}
    if(!g.connected)add('Detached '+(g.detT|0)+' s ago','bad');
    if(g.dents&&g.dents.length)add('Deformed · '+g.dents.length+' dent'+(g.dents.length>1?'s':'')+(g.kind==='head'?' in the skull/face':g.kind==='chest'?' (caved-in ribs)':''),'bad');
    if(g.jawBroken)add('Jaw broken · hanging open','bad');
    if(g.frac||joints.some(j=>j.key==='frac'&&!j.broken&&(j.p===g.idx||j.c===g.idx)))add('Unstable fracture · limb bends here','bad');
    if(g.mtear>0.05)add('Muscle torn '+Math.round(g.mtear*100)+'% · weaker movement','warn');
    for(const o of g.organs){let inside;if(!front)inside=Math.hypot((lw-o.w)/(o.rw*1.1),(ls-o.s)/(o.rs*1.1))<1;else{const p=frontOrganXY(o);inside=Math.hypot((w.x-p.x)/p.rx,(w.y-p.y)/p.ry)<1.05;}
      if(!inside)continue;const hp=Math.round(o.hp),bl=orgBleed(o);
      let st=hp>=100?'healthy':hp<=0?'destroyed':o.pierced?'torn open':o.contused?'bruised (contusion)':'damaged';if(o.rep)st+=', surgically repaired';
      add(o.name+' '+hp+'% · '+st+(bl>0.05?' · bleeding inside '+bl.toFixed(1)+' ml/s':''),hp>=100?'ok':hp<40||bl>1?'bad':'warn');}
    for(const b of g.bones){let near;if(front)near=true;else if(b.shape==='line')near=polyNear(b.pts,{s:ls,w:lw},b.width/2+1.4);else if(b.shape==='ribs')near=Math.hypot((lw-b.w)/b.rw,(ls-b.s)/b.rs)<1;else near=Math.hypot((lw-b.w)/(b.rw+1),(ls-b.s)/(b.rs+1))<1;
      if(!near)continue;if(b.shape==='ribs'){add('Ribs · '+(g.ribsBroken?g.ribsBroken+' fractured':'intact'),g.ribsBroken?'warn':'ok');continue;}
      add(b.name+' · '+(b.broken?'fractured'+(b.minor?'':' (unstable)'):'intact'),b.broken?'bad':'ok');}
    for(const v of g.vessels){if(v.stump)continue;let near;if(!front)near=polyNear(v.pts,{s:ls,w:lw},v.width/2+1.4);else{const [a,b2]=vesselSpan(v);near=ls>=a-2&&ls<=b2+2&&Math.abs((v.z0+v.z1)/2-z)<0.45;}
      if(!near||(v.cut<=0&&!front&&false))continue;if(v.cut<=0){add(v.name+' · intact','ok');continue;}
      const st=v.lig?'tied off':v.clamp?'compressed':v.plug?'plugged by knife':vOpen(v)?'bleeding out':'bleeding inside';
      add(v.name+' · '+Math.round(v.cut*100)+'% torn · '+st+(v.now>0.05?' '+v.now.toFixed(1)+' ml/s':''),v.lig||v.clamp?'warn':'bad');}
    for(const wd of g.wounds){let d;if(!front){const c=woundCenter(wd);d=Math.hypot(c.s-ls,c.w-lw);}else{const p=woundFrontXY(g,wd);d=p?Math.hypot(p.x-w.x,p.y-w.y):99;}
      if(d>(wd.r||1)+2)continue;
      const nm=wd.type==='bruise'?(wd.abr?'Abrasion (graze) · top layer of skin scraped off':wd.pat==='tram'?'Tramline bruise · two parallel lines left by a rod-shaped weapon':wd.pat==='ring'?'Patterned bruise · round mark of a hammer face':wd.eye?'Black eye · blood pooling around the eye':wd.swell?'Haematoma · swollen pocket of blood under the scalp':'Bruise · blood under the skin from a blunt hit'):wd.type==='burn'?(wd.radBurn?'Radiation burn':wd.frost?'Frostbite':wd.ck==='sa'?'Sulfuric acid burn':wd.ck==='acid'?'Acid burn':wd.ck==='alk'?'Alkali burn':wd.chem?'Chemical burn':'Burn')+' · '+['','1st','2nd','3rd'][wd.deg||3]+' degree'+(wd.gel?' · gel applied':''):wd.type==='stump'?'Amputation stump':wd.type==='cut'?(wd.lac?'Laceration '+(wd.len||2).toFixed(0)+' cm · skin split by blunt force, ragged edges':'Incised wound (cut) '+(wd.len||2).toFixed(0)+' cm'):(wd.punct?'Puncture wound':wd.exit?'Exit wound':isBite(wd)?'Crater, tissue missing':wd.slit?'Stab wound':'Entry wound');
      const tr=wd.graft?' · grafted':wd.sut>=1?' · stitched':wd.band?' · bandaged':wd.pack?' · packed':'';
      add(nm+tr,wd.graft||wd.sut>=1||wd.band||wd.pack?'warn':wd.type==='bruise'?'warn':'bad');}
    for(const Lg of LODGED){if(Lg.seg!==g)continue;const d=front?(Lg.fx!=null?Math.hypot(Lg.fx-w.x,Lg.fy-w.y):99):Math.hypot(Lg.s-ls,Lg.w-lw);if(d<4)add('Lodged '+bulletName(Lg)+' · remove with Forceps','bad');}
    for(const K of KNIVES)if(K.seg===g&&(!front?Math.hypot(K.s-ls,K.w-lw)<6:true))add('Knife stuck '+K.depth.toFixed(0)+' cm deep','bad');
    if(!front&&g.tracks.some(t=>dps(lw,ls,t.w1,t.s1,t.w2,t.s2).d<t.r+1))add('Bullet track through the tissue','warn');
  }
  if(!L.length)add('Nothing abnormal here','ok');
  const rk={bad:0,warn:1};L.sort((a,b)=>(rk[a[1]]??2)-(rk[b[1]]??2));
  return{title,lines:L.slice(0,9)};
}
function probeUpdate(pos){
  if(!$('menu').hidden||!$('opts').hidden){$('probe').hidden=true;return;}
  probeUpdate.t=T;const el=$('probe');if(!PROBE||!xray){el.hidden=true;return;}
  const info=probeInfo(PROBE.w);if(!info){el.hidden=true;return;}
  const esc=x=>String(x).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
  el.innerHTML=`<h5>${esc(info.title)}</h5>`+info.lines.map(([t,c])=>`<div class="l ${c}"><i></i><span>${esc(t)}</span></div>`).join('');
  el.hidden=false;
  if(pos){const w_=el.offsetWidth,h_=el.offsetHeight;let x=PROBE.cx-w_/2,y=PROBE.cy-h_-34;if(y<$('hud').offsetHeight+6)y=PROBE.cy+34;el.style.left=clamp(x,8,W-w_-8)+'px';el.style.top=clamp(y,8,H-h_-8)+'px';}
}
/* =========================================================
   ECG + SOUND
   ========================================================= */
const ecgC=$('ecg'),ectx=ecgC.getContext('2d');
let ecgBuf=new Float32Array(10),ecgX=0,ecgW=10,ecgAcc=0;
function ecgResize(){const r=ecgC.getBoundingClientRect();ecgW=Math.max(10,Math.floor(r.width));ecgC.width=ecgW*DPR;ecgC.height=r.height*DPR;ecgBuf=new Float32Array(ecgW);ecgX=0;}
function ecgAt(tt){
  if(V.dead)return(Math.random()-0.5)*0.03;
  if(V.arrest)return shockable()?Math.sin(tt*29)*0.28+Math.sin(tt*17.3+1)*0.2+(Math.random()-0.5)*0.08:(Math.random()-0.5)*0.03;
  const b=tt>=V.lastBeat?V.lastBeat:V.prevBeat;const ts=tt-b;
  return 1.0*gs(ts,0.035,0.008)-0.28*gs(ts,0.06,0.009)-0.1*gs(ts,0.015,0.007)+0.22*gs(ts,0.26,0.04)+0.08*gs(ts,0.9*60/Math.max(40,V.hr),0.02);
}
function ecgStep(dt){
  ecgAcc+=dt*70;const n=Math.floor(ecgAcc);ecgAcc-=n;
  for(let i=0;i<n;i++){ecgBuf[ecgX]=ecgAt(T-(n-1-i)/70);ecgX=(ecgX+1)%ecgW;}
  const c=ectx;c.setTransform(DPR,0,0,DPR,0,0);const h=ecgC.height/DPR;c.clearRect(0,0,ecgW,h);
  c.strokeStyle=V.arrest?'#ff6577':'#6fe39a';c.lineWidth=1.4;c.lineJoin='round';c.beginPath();let pen=false;
  for(let x=0;x<ecgW;x++){const gap=(x-ecgX+ecgW)%ecgW;if(gap<10){pen=false;continue;}const y=h*0.62-ecgBuf[x]*h*0.55;if(!pen){c.moveTo(x,y);pen=true;}else c.lineTo(x,y);}
  c.stroke();
}
function renderNews(){
  $('optTitle').textContent="What's new";$('optNews').textContent='Options';
  let h=`<p class="chintro">Trauma Lab · version ${fmtVer(GAME_VERSION).slice(1)}</p>`;
  if(TL_LANG==='ru')h+=`<p class="chintro" data-noi18n>Список изменений доступен только на английском.</p>`;
  CHANGELOG.forEach(([v,t,items],i)=>{h+=`<details class="chv" data-noi18n${i===0?' open':''}><summary><i>${fmtVer(v)}</i>${t}${i===0?' <b class="chnew">NEW</b>':''}</summary><ul>${items.map(x=>`<li>${x}</li>`).join('')}</ul></details>`;});
  h+=`<p class="credit">${COPYRIGHT}<br>${NOTICE}</p>`;
  $('optBody').innerHTML=h;
}
function openNews(){closeMenu();renderNews();$('opts').hidden=false;$('scrim').hidden=false;$('bOpt').setAttribute('aria-pressed','true');}
/* ---------- options panel ---------- */
// Options, in tabs. ['#','Tab'] starts a tab, ['Title'] a section, then rows: [key,name,description,choices,kind]
const OPTUI=[
  ['#','Gameplay'],
  ['Medicine'],
  ['surg','Surgery mode','Simple: tap and it happens · Complex: you operate yourself (scalpel, saw, clamps, sutures, organ removal) and syringes must go into a real vein or muscle',[['simple','Simple'],['complex','Complex']]],
  ['Subject'],
  ['god','God mode','He survives anything, even without a head'],
  ['bleedout','Can bleed out','Off keeps his blood volume topped up'],
  ['react','Reactions','Flinching, fleeing, taking cover and clutching wounds'],
  ['painfx','Pain faces','Grimacing, screaming and tears'],
  ['Physics and time'],
  ['gravity','Gravity','',[['earth','Earth'],['mars','Mars'],['moon','Moon'],['jupiter','Jupiter'],['sun','Sun'],['zero','Zero']]],
  ['arrowcam','Arrow cam','Slows time while an arrow is in the air so you can watch it fly, drop and hit'],
  ['slowmo','Slow-mo on big hits','A second of slow motion on amputations, blasts and death'],
  ['#','Body & gore'],
  ['Gore and blood'],
  ['gore','Gore level','How much blood, mist and tissue each hit throws out',[[0,'Mild'],[1,'Real'],[2,'Heavy'],[3,'Extreme']]],
  ['strands','Hanging tissue','Torn muscle, tendon and skin dangle from big wounds and stumps'],
  ['spatter','Blood spatter on skin','Flying drops stain the body where they land'],
  ['clot','Natural clotting','Small wounds slowly stop bleeding on their own'],
  ['tear','Limb tearing','Pulling too hard (rope, grab, any force) dislocates joints, tears the muscles and finally rips the limb off'],
  ['Appearance'],
  ['skin','Skin tone','',[['light','Light'],['medium','Medium'],['tan','Tan'],['dark','Dark']]],
  ['#','Graphics'],
  ['Display'],
  ['quality','Quality','Auto lowers resolution when it lags · Low also trims particles and fine skin detail for slow phones',[['auto','Auto'],['high','High'],['low','Low']]],
  ['shake','Camera shake','Screen shake from explosions'],
  ['fps','Frame counter','Frames per second in the corner'],
  ['#','Sound'],
  ['Volume'],
  ['vol','Master volume','Everything the game plays',null,'range'],
  ['gunvol','Gunshots','Crack, blast and echo of every shot',null,'range'],
  ['casevol','Empty cases','Cases ringing on the floor',null,'range'],
  ['Sounds'],
  ['beep','Monitor beep','The heart monitor beeps with every beat and alarms in cardiac arrest'],
  ['amb','Lab ambience','Background hum and beeps'],
  ['#','Controls'],
  ['Feedback'],
  ['vib','Vibration','Phones buzz on shots and blasts'],
  ['%keys'],
  ['#','Interface'],
  ['On screen'],
  ['hints','Tool hints','Help line under the monitor'],
  ['logs','Event log','Messages describing every injury'],
  ['pin','Hit label','A label on the newest wound: where the bullet went in and what it hit'],
  ['mon','Monitor size','The vital-signs monitor at the top',[[0,'Full'],[1,'Compact'],[2,'Closed']]],
  ['Help'],
  ['%help']];
let OPTTAB='Gameplay';
function renderOpts(){
  $('optTitle').textContent='Options';$('optNews').textContent="What's new";
  const b=$('optBody');const tabs=OPTUI.filter(o=>o[0]==='#').map(o=>o[1]);if(!tabs.includes(OPTTAB))OPTTAB=tabs[0];
  let h=`<div class="otabs" role="tablist">${tabs.map(t=>`<button role="tab" data-tab="${t}" aria-selected="${t===OPTTAB}" aria-pressed="${t===OPTTAB}">${t}</button>`).join('')}</div><div class="opane">`;
  let cur=null;
  for(const o of OPTUI){
    if(o[0]==='#'){cur=o[1];continue;}if(cur!==OPTTAB)continue;
    if(o[0]==='%keys'){h+=keysHtml()+(('ontouchstart' in window)&&!HOVERUI.matches?'<p class="okhint">Keys work when a keyboard is connected (tablet or PC).</p>':'');continue;}
    if(o[0]==='%help'){h+='<div class="obtnrow"><button id="optHelp">How to play</button><button id="optCoach">Show the quick start again</button></div>';continue;}
    if(o.length===1){h+=`<h4>${o[0]}</h4>`;continue;}
    const [k,name,desc,choices,kind]=o;
    const val=k==='beep'?OPT.beep!==false:k==='mon'?(OPT.mon||0):OPT[k];
    let ctl;
    if(kind==='range')ctl=`<div class="orng-w"><input class="orng" type="range" min="0" max="100" step="5" value="${Math.round((OPT[k]??1)*100)}" data-k="${k}" aria-label="${name}"><output>${Math.round((OPT[k]??1)*100)}%</output></div>`;
    else if(choices)ctl=`<div class="oseg" role="group" aria-label="${name}">`+choices.map(([v,l])=>`<button data-k="${k}" data-v="${v}" aria-pressed="${val===v}">${l}</button>`).join('')+'</div>';
    else ctl=`<button class="tg" role="switch" data-k="${k}" aria-checked="${!!val}" aria-label="${name}"></button>`;
    const wide=choices&&choices.length>3||kind==='range';
    h+=`<div class="oi${wide?' wide':''}"><div><b>${name}</b>${desc?`<em>${desc}</em>`:''}</div>${ctl}</div>`;
  }
  h+=`</div><div class="obtnrow"><button id="optTabReset">Reset ${OPTTAB.toLowerCase()}</button><button id="optReset">Restore all defaults</button></div>`;
  h+=`<p class="credit">${COPYRIGHT}<br>${NOTICE}</p>`;
  b.innerHTML=h;
  b.querySelectorAll('.otabs button').forEach(t=>t.onclick=()=>{OPTTAB=t.dataset.tab;KEYCAP=null;renderOpts();$('opts').scrollTop=0;});
  keysWire(b);
  b.querySelectorAll('.tg').forEach(t=>t.onclick=()=>{const k=t.dataset.k;if(k==='beep'){OPT.beep=OPT.beep===false;saveOpt();beepBtn();t.setAttribute('aria-checked',OPT.beep!==false);return;}OPT[k]=!OPT[k];t.setAttribute('aria-checked',OPT[k]);applyOpt(k);});
  b.querySelectorAll('.oseg button').forEach(t=>t.onclick=()=>{const k=t.dataset.k;let v=t.dataset.v;if(typeof OPT_DEF[k]==='number')v=+v;t.parentNode.querySelectorAll('button').forEach(q=>q.setAttribute('aria-pressed',q===t));if(k==='mon'){setMon(v);return;}OPT[k]=v;applyOpt(k);});
  b.querySelectorAll('.orng').forEach(t=>t.oninput=()=>{OPT[t.dataset.k]=+t.value/100;t.nextElementSibling.textContent=t.value+'%';applyOpt(t.dataset.k);});
  const hb=$('optHelp');if(hb)hb.onclick=()=>{closeMenu();openHelp();};
  const cb=$('optCoach');if(cb)cb.onclick=()=>{closeMenu();openCoach(true);};
  $('optTabReset').onclick=()=>{let cur=null;for(const o of OPTUI){if(o[0]==='#'){cur=o[1];continue;}if(cur!==OPTTAB||o.length<2||o[0][0]==='%')continue;OPT[o[0]]=OPT_DEF[o[0]];}if(OPTTAB==='Controls'){OPT.keys=null;KEYCAP=null;}applyOpt('all');beepBtn();renderOpts();log(OPTTAB+' options restored','info');};
  $('optReset').onclick=()=>{OPT=Object.assign({},OPT_DEF);OPT.xl=Object.assign({},OPT_DEF.xl);applyOpt('all');beepBtn();renderOpts();log('Options restored to defaults','info');};
}
function applyOpt(k){
  saveOpt();
  if(k==='all'&&typeof setMon==='function')setMon(OPT.mon||0,true);
  G=GRAV[OPT.gravity]??981;
  $('hint').style.display=OPT.hints?'':'none';$('log').style.display=OPT.logs?'':'none';
  const f=$('fps');f.hidden=!OPT.fps;f.style.bottom=((document.body.classList.contains('land')?0:$('tools').offsetHeight)+8)+'px';
  if(AC&&AC.out)AC.out.gain.setTargetAtTime(OPT.vol,AC.currentTime,0.05);ambienceVolume();
  if(k==='quality'||k==='all'){DPRCAP=2;layout();}
  if(k==='gore'||k==='all'){const q=GQ();if(BLOOD.length>q.b)BLOOD.length=q.b;if(GIBS.length>q.g)GIBS.splice(0,GIBS.length-q.g);if(MIST.length>q.m)MIST.length=q.m;}
  if(k==='strands'&&!OPT.strands)STRANDS.length=0;
  if(k==='spatter'&&!OPT.spatter)for(const g of segs)g.spat=[];
  if(k==='gravity'){for(const p of P){p.py-=0.02;}log('Gravity · '+OPT.gravity,'info');}
  if(k==='god'&&OPT.god&&CH&&CH.on){OPT.god=false;saveOpt();log('God mode is off during a challenge','info');}
  if(k==='god'&&OPT.god&&V.dead)log('God mode only protects the living · use the ultra serum to bring him back','info');
  if(k==='vib'&&OPT.vib)buzz(30);
}
function log(text,cls){LOG.push({text,cls:cls||'',t:performance.now()});if(LOG.length>3)LOG.shift();renderLog();if(cls==='bad')pinFromLog(text);}
// a label pinned to the newest wound (redesign): the body part and the first findings of the hit report, short
function pinShort(x){return x.replace(/ perforated/g,' perf.').replace(/ severed/g,' cut').replace(/ fractured/g,' broken').replace(/ artery/g,' a.').replace(/ vein/g,' v.').replace(/bullet lodged in /,'lodged · ').replace(/^./,c=>c.toUpperCase());}
function pinFromLog(text){const i=text.indexOf(' · ');if(i<0||STORY.on||OPT.pin===false)return;const items=text.slice(i+3).split(/, (?![^(]*\))/).map(s=>s.replace(/ \+\d+$/,'')).filter(s=>s&&s!=='missed');if(!items.length)return;
  // the part the first finding is in (organ, vessel, bone or the part itself), then its newest wound
  const f0=items[0].toLowerCase(),inName=x=>x&&x.name&&f0.includes(x.name.toLowerCase());let want=null;
  for(const o of Object.values(ORG))if(inName(o)){want=o.seg;break;}
  if(!want)for(const v of VESSELS)if(inName(v)){want=v.seg;break;}
  if(!want)for(const g of segs)if(g.label&&f0.includes(g.label.toLowerCase())){want=g;break;}
  if(!want)for(const g of segs)for(const bn of g.bones)if(inName(bn)){want=g;break;}
  let best=null,ba=2;for(const g of segs){if(g.gone||!g.connected)continue;const pen=want&&g!==want?0.5:0;for(const w of g.wounds)if((w.type==='hole'||w.type==='cut')&&w.age<1.5&&w.age+pen<ba){ba=w.age+pen;best={seg:g,w};}}
  let fw=null,fa=1.5;for(const f of FW)if(f.seg&&f.seg.connected&&f.age<fa){fa=f.age;fw=f;}
  if(!best&&!fw)return;PIN={t:performance.now(),seg:best?best.seg:fw.seg,w:best?best.w:null,fw,title:((best?best.seg:fw.seg).label||'').toUpperCase(),items:items.slice(0,3).map(pinShort)};}
// The injury log used to sit over his chest and legs, right where you aim and treat. Now one chip sums it up
// ("3 WOUNDS · −74 ml/s · arterial"); tap it to read the full log. While it is folded, a new line still shows for 4 s
let LOGOPEN=false,WCHIP=null,WCK='';
function woundSummary(){let n=0;for(const g of segs){if(g.gone)continue;for(const w of g.wounds)if(w.type!=='bruise'&&!w.healed)n++;}
  const art=!V.dead&&VESSELS.some(v=>v.type==='a'&&v.cut>0&&v.seg.connected&&(v.now||0)>0.3);return {n,art,r:V.dead?0:V.ext+V.int};}
function wchipEl(){if(WCHIP)return WCHIP;const b=document.createElement('button');b.id='wchip';b.type='button';b.setAttribute('aria-expanded','false');
  b.innerHTML='<span class="wdot"></span><span class="wtx"><b></b><small></small></span><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3"/></svg>';
  b.onclick=()=>{LOGOPEN=!LOGOPEN;renderLog();};WCHIP=b;return b;}
function wchipUpdate(){const s=woundSummary(),b=wchipEl(),on=s.n>0;let shown=false;if(b.hidden===on){b.hidden=!on;WCK='';shown=true;}if(!on){if(shown)renderLog();return;}
  const k=s.n+'|'+s.r.toFixed(0)+'|'+s.art;if(k===WCK&&!shown)return;WCK=k;
  b.querySelector('b').textContent=s.n+(s.n===1?' WOUND':' WOUNDS');
  b.querySelector('small').textContent=s.r<0.5?'not bleeding':'−'+Math.round(s.r)+' ml/s · '+(s.art?'arterial':'venous');
  b.className=(s.art?'art':s.r>=0.5?'ven':'ok')+(LOGOPEN?' open':'');if(shown)renderLog();}
function renderLog(){const el=$('log');el.innerHTML='';const ch=wchipEl(),folded=!ch.hidden&&!LOGOPEN,now=performance.now();
  if(!ch.hidden){el.appendChild(ch);ch.setAttribute('aria-expanded',String(LOGOPEN));ch.classList.toggle('open',LOGOPEN);}
  const show=folded?LOG.filter(l=>now-l.t<4000).slice(-1):LOG;
  for(const l of show){const d=document.createElement('div');d.className=l.cls==='bad'?'':l.cls;d.textContent=l.text;el.appendChild(d);}}
let EXAM=false;
function placeXbar(){const hudH=$('hud').offsetHeight,xb=$('xbar');xb.style.top=(hudH+8)+'px';xb.hidden=!xray;if(xray){$('hint').style.visibility='hidden';$('log').style.top=(hudH+48)+'px';if(trajOn)trajPlace();}else{$('hint').style.visibility='';$('log').style.top=(hudH+30)+'px';if(trajOn)trajPlace();}}
function setExam(on){EXAM=on;$('bExam').setAttribute('aria-checked',on);if(!on){PROBE=null;$('probe').hidden=true;}log(on?'Examine on · touch or hover the body to see what is inside (tools paused)':'Examine off · X-ray stays on, you can shoot and use tools','info');}
function setXray(on){xray=on;$('bX').setAttribute('aria-pressed',xray);for(const g of segs)g.icache=null;if(!xray){PROBE=null;$('probe').hidden=true;if($('menu').dataset.cat==='xray')closeMenu();}else log('X-ray on · Layers picks what you see, Examine lets you inspect','info');placeXbar();}
const XLDEF=[['skin','Skin','Faint outline of the skin'],['muscles','Muscles','Muscle bellies, tendons and fat'],['organs','Organs','Brain, heart, lungs, gut…'],['vessels','Arteries & veins','Red arteries, blue veins'],['bones','Bones','Full skeleton'],['nerves','Nerves','Spinal cord and nerves']];
const XLPRE=[['All layers',{skin:1,muscles:1,organs:1,vessels:1,bones:1,nerves:1}],['Skeleton only',{bones:1}],['Organs only',{organs:1}],['Circulation only',{vessels:1}],['Muscles only',{muscles:1}],['Nervous system',{nerves:1,bones:0}]];
function openXrayMenu(btn){
  const m=$('menu');if(!m.hidden&&m.dataset.cat==='xray'){closeMenu();return;}
  m.dataset.cat='xray';
  const draw=()=>{const L=OPT.xl;
    m.innerHTML='<h4>X-ray layers</h4>'+XLDEF.map(([k,n,d])=>`<button class="mi" role="menuitemcheckbox" data-l="${k}" aria-checked="${!!L[k]}" aria-pressed="${!!L[k]}"><span class="xld ${k}"></span><b>${n}</b><em>${d}</em></button>`).join('')
      +'<h4>Presets</h4>'+XLPRE.map(([n],i)=>`<button class="mi" data-p="${i}"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10"/></svg><b>${n}</b></button>`).join('')
      +'<button class="mi" data-off="1"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg><b>Turn X-ray off</b></button>';
    m.querySelectorAll('.mi').forEach(b=>b.onclick=()=>{
      if(b.dataset.off){setXray(false);closeMenu();return;}
      if(b.dataset.p!=null){const p=XLPRE[+b.dataset.p][1];for(const [k] of XLDEF)OPT.xl[k]=!!p[k];}
      else{const k=b.dataset.l;OPT.xl[k]=!OPT.xl[k];}
      saveOpt();for(const g of segs)g.icache=null;draw();});};
  draw();m.hidden=false;$('scrim').hidden=false;
  const r=btn.getBoundingClientRect(),mw=m.offsetWidth;m.style.left=clamp(r.left,12,W-mw-12)+'px';m.style.top=(r.bottom+8)+'px';m.style.bottom='auto';m.style.maxHeight=Math.max(200,H-r.bottom-24)+'px';
}
const SPEEDS=[0.125,0.25,0.5,1,2,4,8],SPL=['⅛×','¼×','½×','1×','2×','4×','8×'];
let spIdx=3,paused=false;
function speedUI(){
  $('bSlower').setAttribute('aria-pressed',spIdx<3);$('bFaster').setAttribute('aria-pressed',spIdx>3);$('bPlay').setAttribute('aria-pressed',paused);
  $('bPlay').setAttribute('aria-label',paused?'Play':'Pause');
  $('bPlay').innerHTML=paused?'<svg viewBox="0 0 24 24"><path d="M6 4l14 8-14 8z"/></svg>':'<svg viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';
}
function setSpeed(i){spIdx=clamp(i,0,SPEEDS.length-1);timeScale=SPEEDS[spIdx];if(paused){paused=false;}speedUI();log(spIdx===3?'Normal speed':spIdx>3?'Speed up · '+SPL[spIdx]:'Slow motion · '+SPL[spIdx],'info');}
const BEEP_ON='<svg viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 3c0 5.4-7.5 10-7.5 10z"/><path d="M6 12h3l1.5-2.5L13 15l1.5-3H18" fill="none" stroke="#0d1013" stroke-width="1.6" stroke-linejoin="round"/></svg>',BEEP_OFF='<svg viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 3c0 5.4-7.5 10-7.5 10z" opacity=".45"/><path d="M3 3l18 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
function beepBtn(){const b=$('bBeep');const on=OPT.beep!==false;b.setAttribute('aria-pressed',on);b.innerHTML=on?BEEP_ON:BEEP_OFF;}
const SND_ON='<svg viewBox="0 0 24 24"><path d="M3 9h4l5-4v14l-5-4H3z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',SND_OFF='<svg viewBox="0 0 24 24"><path d="M3 9h4l5-4v14l-5-4H3z"/><path d="M16 9l6 6M22 9l-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const chartEl=$('chart');
function updateChart(){
  if(chartEl.hidden)return;
  let h='<div class="sec"><h3>Organs</h3>';
  for(const id of ORG_ORDER){const o=ORG[id];const p=Math.round(o.hp);const col=p>75?'var(--hr)':p>40?'var(--warn)':'var(--bl)';h+=`<div class="orow${p<100?' bad':''}"><span>${o.name}</span><span class="bar"><i style="width:${p}%;background:${col}"></i></span><em>${orgState(o)}</em></div>`;}
  h+='</div><div class="sec"><h3>Bleeding</h3>';
  const vs=VESSELS.filter(v=>v.cut>0);
  if(!vs.length)h+='<div class="none">No vessel injuries</div>';
  for(const v of vs){const r=v.seg.connected?(v.now||0)*(v.ext*(v.clamp?0.05:1)+(1-v.ext)):0;h+=`<div class="kv"><span>${v.name}${v.lig?' · tied off':v.clamp?' · controlled':''}${v.seg.connected?'':' · detached'}</span><span>${r.toFixed(1)} ml/s</span></div>`;}
  h+=`<div class="kv"><span>External total</span><span>${V.ext.toFixed(1)} ml/s</span></div><div class="kv"><span>Internal total</span><span>${V.int.toFixed(1)} ml/s</span></div><div class="kv"><span>Haemoglobin</span><span>${(15*V.rbc/Math.max(1,V.blood)).toFixed(1)} g/dL</span></div></div>`;
  h+='<div class="sec"><h3>Skeleton</h3>';
  const br=BONES.filter(b=>b.broken).map(b=>b.name);const ribs=segs.reduce((a,s)=>a+s.ribsBroken,0);if(ribs)br.push(Math.min(24,ribs)+' rib fracture'+(ribs>1?'s':''));
  h+=br.length?br.map(n=>`<div class="kv"><span>${n}</span><span>fractured</span></div>`).join(''):'<div class="none">No fractures</div>';
  for(const j of joints){if(j.key!=='frac'||j.broken||!j.fi)continue;const f=j.fi;h+=`<div class="kv"><span>${f.bo.name.replace(/x\d+$/,'')} · skin</span><span>${j.openW?'open · bone through skin':(j.sig>8?'tenting · ':'')+Math.round(Math.abs(f.th)*57.3)+'° · '+Math.round(f.eps*100)+'% · '+j.sig.toFixed(1)+' MPa'}</span></div>`;}
  const det=segs.filter(s=>s.joint&&s.joint.broken).map(s=>s.label);if(det.length)h+=det.map(n=>`<div class="kv"><span>${n}</span><span>amputated</span></div>`).join('');
  h+='</div><div class="sec"><h3>Drugs on board</h3>';
  const act=Object.entries(DRUGS).filter(([k,d])=>DR[d.key].total>0);
  h+=act.length?act.map(([k,d])=>`<div class="kv"><span>${d.name} × ${DR[d.key].total}</span><span>${(DR[d.key].l+DR[d.key].p).toFixed(2)}</span></div>`).join(''):'<div class="none">None given</div>';
  h+='</div><div class="sec"><h3>Neuro & resp</h3>';
  h+=`<div class="kv"><span>Consciousness</span><span>${V.dead?'none':V.bd?'none · brain dead':V.consc<0.35&&(ORG.brain.hp<20||(ORG.brain.stem??100)<92)?'coma':V.consc>0.8?'alert':V.consc>0.35?'drowsy':'unresponsive'}</span></div>`;
  h+=`<div class="kv"><span>Brainstem (breathing, heartbeat)</span><span>${Math.round(ORG.brain.stem??100)}%</span></div>`;
  h+=`<div class="kv"><span>Brain oxygenation</span><span>${Math.round(V.brainO2*100)}%</span></div>`;
  h+=`<div class="kv"><span>Pain felt / injury pain</span><span>${Math.round(V.painEff)} / ${Math.round(V.pain)}</span></div>`;
  h+=`<div class="kv"><span>Ventilation</span><span>${Math.round(V.breath*100)}%</span></div>`;
  h+=`<div class="kv"><span>Time since start</span><span>${fmtTime(T-V.start)}</span></div></div>`;
  $('chartBody').innerHTML=h;
}
let uiAcc=0;
function updateHUD(dt){
  uiAcc+=dt;if(uiAcc<0.15)return;uiAcc=0;
  const frac=V.blood/5000;
  $('vHR').textContent=Math.round(V.hr);monMini();if(CH)chUI();
  $('vRhythm').textContent=V.zombie?'no pulse':V.dead?'asystole':V.bd&&!V.arrest?'brain dead · beating':V.arrest?(shockable()?'V-fib':'asystole'):V.hr>100?'sinus tachy':V.hr<55?'sinus brady':'sinus';
  $('vBP').textContent=V.sys<5?'--/--':Math.round(V.sys)+'/'+Math.round(V.sys*0.64);
  $('vSP').textContent=Math.round(V.spo2);
  $('vResp').textContent='resp '+V.resp;
  $('vBL').textContent=Math.round(V.blood);
  $('vLoss').textContent='ml · −'+(V.ext+V.int).toFixed(1)+'/s';wchipUpdate();
  let chips=paused?`<span class="chip spd">❚❚ Paused</span>`:spIdx!==3?`<span class="chip spd">${spIdx>3?'▶▶ ':'◀◀ '}${SPL[spIdx]}</span>`:'';
  if(V.rad>0.05)chips+=`<span class="chip${V.rad>4?' od':''}">☢ ${V.rad.toFixed(1)} Gy${V.marrow?' · marrow ok':''}</span>`;
  if(V.burnArea>3)chips+=`<span class="chip od">Burns ${Math.round(V.burnArea)}</span>`;
  chips+=V.act?`<span class="chip mind${V.fear>0.55?' od':''}">${ACTL[V.act]||''}<i><b style="width:${Math.round(V.fear*100)}%;background:#e2c25a"></b></i></span>`:'';
  chips+=`<span class="chip pain">Pain ${Math.round(V.painEff)}<i><b style="width:${Math.round(V.painEff)}%"></b></i></span>`;
  for(const k in DRUGS){const d=DRUGS[k],s=DR[d.key];const lv=s.l+s.p;if(lv<0.04)continue;const OD={pk:2.5,caf:4,txa:3,atr:3,ami:2.2,nal:2.5,flu:2,lsd:3,ckt:3,avn:2.5,chl:3,ket:3.5};const od=(OD[d.key]!=null&&lv>OD[d.key])||['cyn','ven','ars'].includes(d.key)||(d.key==='coc'&&lv>1.8)||(d.key==='alc'&&lv>3)||((d.key==='mor'||d.key==='fen')&&opi()>3)||(d.key==='ket'&&lv>1.5)||(d.key==='adr'&&lv>3)||(d.key==='sed'&&lv>1.8);
    chips+=`<span class="chip${od?' od':''}">${d.short}<i><b style="width:${Math.min(100,lv*33)}%;background:${d.col}"></b></i></span>`;}
  $('chips').innerHTML=chips;
  const st=$('status');let cls='',txt='Stable';
  const injured=segs.some(s=>s.wounds.length)||BONES.some(b=>b.broken);
  if(V.zombie){cls='arrest';txt='Undead';}
  else if(V.dead){cls='dead';txt='Deceased';}
  else if(V.bd){cls='dead';txt='Brain dead';}
  else if(V.arrest){cls='arrest';txt='Arrest';}
  else if(V.consc<0.35&&(ORG.brain.hp<20||(ORG.brain.stem??100)<92)){cls='dead';txt='Coma';}
  else if(V.consc<0.35){cls='unc';txt='Unconscious';}
  else if(frac<0.72||V.sys<90){cls='shock';txt='Shock';}
  else if(injured){cls='injured';txt='Injured';}
  st.className='pill '+cls;st.textContent=txt;
  updateChart();flatline();
}
