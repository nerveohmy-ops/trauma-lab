/* TRAUMA_LAB_MAIN */
/* ===== boot/main.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
try{console.info('%cTrauma Lab%c\n'+COPYRIGHT,'font-weight:bold;font-size:14px','');}catch(e){}
// wire the simulation's hooks to the screen log, the audio engine and the menus
HOOKS.log=log;HOOKS.sound=snd;HOOKS.voice=voice;HOOKS.breath=breathSound;HOOKS.noise=noise;HOOKS.ui=c=>{if(c==='closeMenu')closeMenu();else if(c==='challenge')chUI(true);};
try{const q=JSON.parse(localStorage.getItem('traumaLabOpts')||'null');if(q&&typeof q==='object')Object.assign(OPT,q);}catch(e){}
// itch build: gore starts on Extreme (once, also for players who saved older options)
try{if(localStorage.getItem('traumaLabGoreX')!=='1'){OPT.gore=3;localStorage.setItem('traumaLabGoreX','1');saveOpt();}}catch(e){OPT.gore=3;}
setTimeout(()=>{let seen=null;try{seen=localStorage.getItem('traumaLabSeen');localStorage.setItem('traumaLabSeen',GAME_VERSION);}catch(e){}if(seen!==GAME_VERSION&&!window.__noNews){if($('home').hidden)openNews();else{const b=$('hNews');if(b)b.innerHTML="What's new <i class=\"hnew\">NEW</i>";}}},3800);
$('scrim').addEventListener('pointerdown',closeMenu);
document.addEventListener('pointerdown',()=>{ac();if(AC&&AC.state==='suspended')AC.resume();startAmbience();},{capture:true});
/* ---------- opening logo ---------- */
(()=>{const sp=$('splash');if(!sp)return;let done=false;
  const hide=()=>{if(done)return;done=true;sp.classList.add('out');setTimeout(()=>sp.remove(),1000);if(window.startThanks)startThanks();};
  setTimeout(hide,3400);sp.addEventListener('pointerdown',e=>{e.stopPropagation();ac();if(AC&&AC.state==='suspended')AC.resume();startAmbience();hide();});})();
/* ---------- startup screens (itch.io free build): thanks + socials, then the supporter build ---------- */
(()=>{
  const IGI='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></svg>';
  const TTI='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.5 3 2.5 5 5.5 5.2"/></svg>';
  const DCI='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/></svg>';
  const SPI='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-9.6A4 4 0 0 1 12 8a4 4 0 0 1 7 2.4C19 15.6 12 20 12 20z"/></svg>';
  function overlay(id,html){let z=$(id);if(!z){z=document.createElement('div');z.id=id;z.className='tlov';z.setAttribute('role','dialog');z.setAttribute('aria-modal','true');z.hidden=true;document.body.appendChild(z);}z.innerHTML=html;return z;}
  function countdown(z,T,done){const b=z.querySelector('.tlok'),bar=b.querySelector('i'),lab=b.querySelector('span'),t0=performance.now();let ready=0;
    if(T<=0){b.disabled=false;ready=performance.now()-1000;lab.textContent='OK';}
    else{b.disabled=true;const tick=()=>{const left=T-(performance.now()-t0);if(left<=0){b.disabled=false;ready=performance.now();lab.textContent='OK';bar.style.width='0';return;}
      lab.textContent='OK · '+Math.ceil(left/1000);bar.style.width=(100*(1-left/T))+'%';requestAnimationFrame(tick);};tick();}
    b.onclick=e=>{if(b.disabled||!ready||performance.now()-ready<250||(e&&e.isTrusted===false))return;z.classList.remove('on');setTimeout(()=>{z.hidden=true;},300);done&&done();};}
  function show(z){z.hidden=false;requestAnimationFrame(()=>z.classList.add('on'));}
  function supHTML(){return `<div class="tlbox"><h2>Want <em>Story mode?</em></h2>
    <p class="tllead">Story mode and the newest builds are in testing right now. There are two ways to get them:</p>
    <div class="tlopts">
      <div class="tlopt tlo-dc"><div class="tlic">${DCI}</div><div><b>Discord playtest</b><span>Free. Sign up in #playtest-signup, testers are picked in waves.</span></div><a href="${DISCORD_URL}" target="_blank" rel="noopener">Join</a></div>
      <div class="tlopt tlo-sp"><div class="tlic">${SPI}</div><div><b>Supporter build <i class="tlsoon">Coming soon</i></b><span>Support the game on itch.io: Story mode and every new build first.</span></div><a href="${ITCH_URL}" target="_blank" rel="noopener">Follow</a></div>
    </div>
    <button class="tlok" id="supOk"><i></i><span>OK</span></button></div>`;}
  window.openSupporter=()=>{const z=overlay('sup',supHTML());show(z);countdown(z,0,()=>{});};
  window.startThanks=()=>{
    if(window.__thxStarted)return;window.__thxStarted=true;
    const z=overlay('thx',`<div class="tlbox">
      <h2>Thanks for <em>playing!</em></h2>
      <p class="tllead">Trauma Lab is made by a small indie studio, and every player helps. Coming next: Story mode.</p>
      <div class="tlgrid">${NEWSHOTS.map(h=>`<figure><img src="${h.src}" alt="${h.t}: ${h.d}"><figcaption>${h.t}</figcaption></figure>`).join('')}</div>
      <p class="tlnote">You're playing ${PUBLIC_VER()} for free. Playtesters get new builds first on Discord.</p>
      <p class="tlfollow">Follow to support the game</p>
      <div class="tlsoc">
        <a class="tl-ig" href="${INSTAGRAM_URL}" target="_blank" rel="noopener">${IGI}Instagram<small>Clips &amp; news</small></a>
        <a class="tl-tt" href="${TIKTOK_URL}" target="_blank" rel="noopener">${TTI}TikTok<small>Gameplay videos</small></a>
        <a class="tl-dc" href="${DISCORD_URL}" target="_blank" rel="noopener">${DCI}Discord<small>Join the playtest</small></a>
      </div>
      <button class="tlok" id="thxOk" disabled><i></i><span>OK · 5</span></button></div>`);
    show(z);
    countdown(z,5000,()=>{const s=overlay('sup',supHTML());s.querySelector('.tlok span').textContent='OK · 3';show(s);countdown(s,3000,()=>{if($('home').hidden)openHome();});});
  };
  // Story mode is for playtesters and supporters in the free build: every way into it opens the supporter screen
  storyStart=function(){openSupporter();};
  if(!$('splash'))startThanks();
})();
setInterval(()=>{const now=performance.now();let ch=false;while(LOG.length&&now-LOG[0].t>9000){LOG.shift();ch=true;}if(ch||(WCHIP&&!WCHIP.hidden&&!LOGOPEN&&LOG.some(l=>now-l.t>3000&&now-l.t<5200)))renderLog();},1000);
$('zIn').onclick=()=>zoomAt(W/2,H*0.45,1.35);
$('zOut').onclick=()=>zoomAt(W/2,H*0.45,1/1.35);
$('zFit').onclick=()=>{const c=CAM[view];c.z=view!=='side'?1:fitZ();c.px=0;c.py=0;};
$('bMap').onclick=e=>openMapMenu(e.currentTarget);
$('bWear').onclick=e=>openWearMenu(e.currentTarget);
$('bOpt').onclick=()=>{if(!$('opts').hidden){closeMenu();return;}closeMenu();renderOpts();$('opts').hidden=false;$('scrim').hidden=false;$('bOpt').setAttribute('aria-pressed','true');};
$('optClose').onclick=closeMenu;
$('optNews').onclick=()=>{if(['Options','Настройки'].includes($('optTitle').textContent))renderNews();else{renderOpts();}};
(async()=>{try{if(!(window.claude&&typeof window.claude.use==='function'))return;const dl=await window.claude.use('downloads');if(!dl)return;const b=$('bSave');b.hidden=false;
  b.onclick=async()=>{const d=SRC_DOC.cloneNode(true);
  for(const sc of [...d.querySelectorAll('script')]){let body=sc.textContent||'';
      if(!body.includes('TRAUMA_LAB_MAIN')&&sc.getAttribute('src')){try{const r=await fetch(sc.getAttribute('src'));if(r.ok)body=await r.text();}catch(_){}}
      if(body.includes('TRAUMA_LAB_MAIN')){sc.textContent=body;}else{sc.remove();continue;}
      sc.removeAttribute('src');}

    const head=d.querySelector('head');if(head&&!d.querySelector('meta[charset]')){const m=document.createElement('meta');m.setAttribute('charset','utf-8');head.prepend(m);}
    if(head&&!d.querySelector('meta[name=viewport]')){const m=document.createElement('meta');m.name='viewport';m.content='width=device-width,initial-scale=1,viewport-fit=cover';head.appendChild(m);}
    const html='<!doctype html>\n'+d.outerHTML;
    try{await dl.save({filename:'trauma-lab.html',data:html});log('Game file saved · open trauma-lab.html in any browser','good');}
    catch(e){const c=e&&e.code;if(c==='declined')log('Download cancelled','info');else if(c==='rate_limited')log('A download prompt is already open','info');else{log('Downloads are not available here','info');if(c==='unavailable'||c==='not_granted'||c==='capability_disabled'||c==='capability_removed')b.hidden=true;}}};
}catch(_){}})();
$('bTraj').onclick=()=>{trajOn=!trajOn;$('bTraj').setAttribute('aria-pressed',trajOn);trajDirty=true;trajPanel();log(trajOn?'Bullet paths on · skin shown see-through':'Bullet paths off','info');};
$('vSide').onclick=()=>setView('side');
$('vBack').onclick=()=>setView('back');
$('vFront').onclick=()=>setView('front');
cv.addEventListener('wheel',e=>{e.preventDefault();zoomAt(e.clientX,e.clientY,Math.exp(-e.deltaY*0.0015));},{passive:false});
cv.addEventListener('mousedown',e=>{if(e.button===1)e.preventDefault();});
cv.addEventListener('auxclick',e=>{if(e.button===1)e.preventDefault();});
cv.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'&&e.button===1){e.preventDefault();try{cv.setPointerCapture(e.pointerId);}catch(_){}MPAN={id:e.pointerId,x:e.clientX,y:e.clientY};cv.style.cursor='grabbing';return;}
  ac();if(AC&&AC.state==='suspended')AC.resume();try{cv.setPointerCapture(e.pointerId);}catch(_){}PTRS.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(PTRS.size===2){const [a,b]=[...PTRS.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),mx:(a.x+b.x)/2,my:(a.y+b.y)/2};drag=null;grab=null;pointerW=null;return;}
  if(PTRS.size>2||drag)return;
  const w=toW(e.clientX,e.clientY);if(view==='side')ZTGT=clamp(w.x,-ROOM+30,ROOM-30);drag={id:e.pointerId,sx:e.clientX,sy:e.clientY,sw:w,cw:w,lw:w,moved:false,t0:T,lt:performance.now(),fired:0,acc:0,ang:0};pointerW=w;
  if(view==='side'&&PROPS.length&&!(TOOL[tool]&&(TOPOF(TOOL[tool].cat)==='weap'||TOOL[tool].power))&&brakeAt(w,Math.max(4.5,16/VS))){drag=null;pointerW=null;return;}
  if(xray&&EXAM&&tool!=='move'){drag.probe=true;pointerW=null;PROBE={w,cx:e.clientX,cy:e.clientY};probeUpdate(true);return;}
  if(knifeStabMode()){knifeDown(w);return;}
  if(view==='side'&&meleeTool(tool)){meleeDown(w);return;}
  if(tool==='bandage')wrapCur=null;
  if(tool==='rope'&&view==='side'){if(MODE.rope==='pull'){let bd=Math.max(5,18/VS);for(const r of ROPES){const p=ropePos(r.a),q=ropePos(r.b);const d=dps(w.x,w.y,p.x,p.y,q.x,q.y).d;if(d<bd){bd=d;drag.pullR=r;}}}else drag.rope=ropeEnd(w,true);}
  if(TOOL[tool]&&TOOL[tool].power)powerDown(w);
  if(tool==='grab'&&view==='side'){
    const o=OBJ.find(o=>Math.hypot(o.x-w.x,o.y-w.y)<o.r+Math.max(4,14/VS)&&!o.att);const pr=o?null:propAt(w);
    if(pr){const ca=Math.cos(-pr.ang),sa=Math.sin(-pr.ang);grab={prop:pr,lx:(w.x-pr.x)*ca-(w.y-pr.y)*sa,ly:(w.x-pr.x)*sa+(w.y-pr.y)*ca};}
    else if(o)grab={obj:o};else{const p=pickSeg(w,Math.max(3,16/VS));if(p)grab=p;}
  }
});
cv.addEventListener('pointermove',e=>{
  if(MPAN&&e.pointerId===MPAN.id){const cam=CAM[view];cam.px+=e.clientX-MPAN.x;cam.py+=e.clientY-MPAN.y;MPAN.x=e.clientX;MPAN.y=e.clientY;return;}
  if(PTRS.has(e.pointerId))PTRS.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pinch&&PTRS.size===2){const [a,b]=[...PTRS.values()];const d=Math.hypot(a.x-b.x,a.y-b.y),mx=(a.x+b.x)/2,my=(a.y+b.y)/2;const cam=CAM[view];cam.px+=mx-pinch.mx;cam.py+=my-pinch.my;zoomAt(mx,my,d/(pinch.d||1));pinch={d,mx,my};return;}
  if(xray&&EXAM&&tool!=='move'&&(!drag||drag.probe)){if(drag||e.pointerType==='mouse'){PROBE={w:toW(e.clientX,e.clientY),cx:e.clientX,cy:e.clientY};probeUpdate(true);}return;}
  if(!drag||e.pointerId!==drag.id)return;
  if(Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)>9)drag.moved=true;
  const now=performance.now();const dtm=Math.max(1,now-drag.lt)/1000;
  if(tool==='move'){const cam=CAM[view];const prev=drag.last||{x:drag.sx,y:drag.sy};cam.px+=e.clientX-prev.x;cam.py+=e.clientY-prev.y;drag.last={x:e.clientX,y:e.clientY};return;}
  const w=toW(e.clientX,e.clientY);
  if(HK){knifeMove(w);pointerW=w;drag.cw=w;drag.lw=w;return;}
  const speed=Math.hypot(w.x-drag.lw.x,w.y-drag.lw.y)/dtm/Math.max(0.125,timeScale);
  if(Math.hypot(w.x-drag.lw.x,w.y-drag.lw.y)>0.3)drag.ang=Math.atan2(w.y-drag.lw.y,w.x-drag.lw.x);
  drag.cw=w;pointerW=w;
  if(tool==='saber'&&view!=='side'){SABT.push({x:w.x,y:w.y,t:performance.now()});if(SABT.length>40)SABT.shift();if(speed>260&&T-(SABT.snd||0)>0.28){snd('saber');SABT.snd=T;}}
  if(drag.moved){
    if(tool==='saber'){if(view!=='side')saberFront(drag.lw.x,drag.lw.y,w.x,w.y,speed);}
    else if((tool==='knife'&&MODE.knife==='slash')||tool==='machete'){if(view!=='side')frontSlash(drag.lw.x,drag.lw.y,w.x,w.y,tool,speed*(0.3+1.3*mStr()[1]));}
    else if(tool==='bandage')wrapStroke(drag.lw.x,drag.lw.y,w.x,w.y);
    else if(tool==='burngel')gelStroke(drag.lw.x,drag.lw.y,w.x,w.y);
    else if(tool==='laser'&&view==='side')bladeStroke(drag.lw.x,drag.lw.y,w.x,w.y,'laser',700);
    else if(tool==='acid')acidStroke(drag.lw.x,drag.lw.y,w.x,w.y);
  }
  drag.lw=w;drag.lt=now;
});
cv.addEventListener('pointerup',e=>endPointer(e,false));
cv.addEventListener('pointercancel',e=>endPointer(e,true));
$('bX').onclick=()=>setXray(!xray);
$('bXL').onclick=e=>openXrayMenu(e.currentTarget);
$('bExam').onclick=()=>setExam(!EXAM);
$('bSlower').onclick=()=>setSpeed(spIdx>3?3:spIdx-1);
$('bFaster').onclick=()=>setSpeed(spIdx<3?3:spIdx+1);
$('bPlay').onclick=()=>{paused=!paused;speedUI();log(paused?'Paused · tools still work, time is frozen':'Playing'+(spIdx!==3?' · '+SPL[spIdx]:''),'info');};
document.addEventListener('keyup',e=>{PANK.delete(e.code);if(e.key==='Shift')PANK.delete('Shift');});
window.addEventListener('blur',()=>PANK.clear());
document.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;if(KEYCAP){keyDown(e);return;}if(PANKEYS[e.code]&&!e.ctrlKey&&!e.metaKey&&!e.altKey){PANK.add(e.code);if(e.shiftKey)PANK.add('Shift');return;}if(e.key==='Shift')PANK.add('Shift');keyDown(e);});
beepBtn();setMon(OPT.mon||0,true);
$('bBeep').onclick=()=>{OPT.beep=OPT.beep===false;saveOpt();beepBtn();log(OPT.beep?'Heart monitor beep on':'Heart monitor beep muted','info');};
$('bSnd').onclick=e=>{soundOn=!soundOn;ac();if(AC&&AC.state==='suspended')AC.resume();e.currentTarget.setAttribute('aria-pressed',soundOn);e.currentTarget.innerHTML=soundOn?SND_ON:SND_OFF;ambienceVolume();};
$('bChart').onclick=e=>{chartEl.hidden=!chartEl.hidden;e.currentTarget.setAttribute('aria-pressed',!chartEl.hidden);updateChart();};
$('chartClose').onclick=()=>{chartEl.hidden=true;$('bChart').setAttribute('aria-pressed','false');};
$('bReset').onclick=()=>{if(CH&&CH.on){if(!CH.done){CH.done=true;CH.result={win:false,why:'You reset the patient',t:CH.el};}chResult();return;}reset();};
function reset(){bodiesClear();voidUndo();SHELLS.length=0;SHELLQ.length=0;V.patient=false;V.bypass=false;OPF=null;OPL=null;if(typeof opfClose==='function')opfClose(true);if(typeof oplClose==='function')oplClose(true);FAXE.length=0;FEYE=[];GUTS=[];PROPS=[];MW=[];MWH=null;ARROWS=[];FARROWS=[];FGLANCE=[];ARSTUCK=[];DROPS=[];WPOOLS=[];FILMS=[];CHFX=[];SOLIDS=[];FDROPS=[];STAINS=[];V.irr=0;chemAir.s1=chemAir.s2=chemAir.s3=0;chemFilms.eye=chemFilms.hp=0;ROPES=[];ROPESEL=null;BHP=[];BHS=[];BH=null;WORLD_GONE=false;{const v=$('voidOv');if(v){v.classList.remove('on');v.hidden=true;}}for(const q in WEAR)if(WEAR[q].hp!=null)WEAR[q].hp=100;makeBody();STREAMS={};OBJ=[];BUL=[];KNIVES=[];HK=null;TRAJ=[];trajN=0;trajDirty=true;LODGED=[];OP=null;FLAMES=[];CORE=null;REGROW=null;CUTN=0;FRACQ=[];SOURCE=null;MIST=[];STRANDS=[];BH=null;QUAKE=0;METEORS=[];FBALLS=[];POWFX=[];DUSTQ=[];DRAIN=0;TKH=null;BLOOD=[];POOLS=[];WALLST=[];FX=[];LOG=[];LOGOPEN=false;PIN=null;GIBS=[];DECALS=[];renderLog();log((FEMALE?'New subject · 60 kg woman':'New subject · 70 kg man')+', 5.0 L blood volume','info');sceneSpawn();}
/* ---------- loop ---------- */
let last=performance.now(),simAcc=0,btUntil=0,fpsN=0,fpsT=0;
function bulletTime(){if(OPT.slowmo&&!paused)btUntil=performance.now()+1100;}
const PH=1/(60*SUB);
function loop(now){
  // keep the loop alive even if one frame throws (e.g. the page loaded at 0×0 inside an itch.io iframe)
  requestAnimationFrame(loop);if(!cv.width||!cv.height){if(innerWidth&&innerHeight)layout();last=now;return;}
  try{loopBody(now);}catch(e){console.error(e);}
}
function loopBody(now){
  perfWatch(now-last);let dt=Math.min(0.05,(now-last)/1000);last=now;
  // fixed physics step: slow motion runs fewer steps per frame, fast forward runs more, the step itself never changes
  if(OPT.fps){fpsN++;fpsT+=now-(loop.prev||now);if(fpsT>500){$('fps').textContent=Math.round(fpsN*1000/fpsT)+' fps · '+DPR.toFixed(2)+'x';fpsN=0;fpsT=0;}}loop.prev=now;
  if(!paused){simAcc+=dt*arrowCam(performance.now()<btUntil?Math.min(timeScale,0.22):timeScale);let n=0,g=0,chunk=0;const maxN=SUB*10*Math.max(1,Math.ceil(timeScale));
    while(simAcc>=PH&&n<maxN){physStep(PH);T+=PH;simAcc-=PH;n++;chunk+=PH;
      if(chunk>=1/60-1e-9){storyStep(chunk);autoFire(chunk);physio(chunk);bleedFX(chunk);gibStep(chunk);bodiesTick(chunk);g+=chunk;chunk=0;}}
    if(chunk>0){storyStep(chunk);autoFire(chunk);physio(chunk);bleedFX(chunk);gibStep(chunk);bodiesTick(chunk);g+=chunk;}
    if(n>=maxN)simAcc=0;
    if(g>0)ecgStep(g);}
  keyPan(dt);if(STORY.on)storyFrame(dt);render(paused?0:dt);if(typeof pipStep==='function')pipStep();updateHUD(dt);if(PROBE&&xray&&EXAM&&T-(probeUpdate.t||-9)>0.3)probeUpdate(false);if(trajOn)trajPanel();
}
window.addEventListener('resize',relayout);
window.addEventListener('orientationchange',()=>{relayout();setTimeout(relayout,350);});
if(window.visualViewport)visualViewport.addEventListener('resize',relayout);
if(window.ResizeObserver){let lastH=0;new ResizeObserver(()=>{const h=$('hud').offsetHeight;if(h!==lastH){lastH=h;relayout();}}).observe($('hud'));}
makeBody();
buildTools();
layout();
updateConnected();
applyOpt('init');
log((FEMALE?'Subject 02':'Subject 01')+' standing · pick a category below','info');
requestAnimationFrame(loop);
window.__lab={fire,frontFire,explode,stab,bladeStroke,spawnObj,inject,setView,selectTool,get V(){return V},SEG,ORG,DR:()=>DR};
