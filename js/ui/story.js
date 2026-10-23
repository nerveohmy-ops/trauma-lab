/* TRAUMA_LAB_MAIN */
/* ===== ui/story.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
// Story mode (prototype): menu entry, controls, objective and inventory bar, camera, medical view, end screens.
// PC: ← → or A/D walk · Shift run · ↑/W/Space jump · ↓/S crouch (hold) · C crouch on/off · Z lie down · F kick ·
//     Q cover (sit behind a low crate) · E use · M medical view · mouse aims (he turns to face it), hold the button to
//     fire or stab · 1–7 items · Esc pause.
// Phone: arrow pad under the left thumb (◀ ▶ walk, double-tap and hold to run, ▲ jump, ▼ crouch), RUN and LIE DOWN
// above it; the aim stick under the right thumb with FIRE, KICK and USE on its arc; COVER pops up next to a low crate
// (STAND while in cover); MED
// opens the medical view. Items are a strip at the top where no thumb rests.
(()=>{const d=document.createElement('div');d.id='story';d.hidden=true;document.body.appendChild(d);})();
const SKEYS=new Set();
const STICK={R:null};   // the aim stick: {id,cx,cy,x,y} (x,y in −1…1)
const SPAD={last:{L:0,R:0},run:false};
function storyStart(){
  closeHome();closeMenu&&closeMenu();if(CH&&CH.on){CH.done=true;endChallenge();}
  if(view!=='side')setView('side');setXray(false);
  STORY.on=true;reset();setMap('facility');
  // place him at the start, standing, then furnish the corridor
  const dx=STORYL.start-storyX();for(const p of P){p.x+=dx;p.px+=dx;}V.anchorX=null;storyInit();
  setAmmo('pistol','fmj');OPT.god=false;paused=false;timeScale=1;
  document.body.classList.add('storyon');SKEYS.clear();STICK.R=null;SPAD.run=false;STORY.fireHeld=false;STORY.duckLatch=false;STORY.runLatch=false;
  document.documentElement.style.setProperty('--hudh',$('hud').offsetHeight+'px');
  const s=$('story');s.hidden=false;s.innerHTML=`<div class="sobj" id="sObj"></div><div class="sprompt" id="sPr"></div><div class="smsg" id="sMsg"></div>
    <div class="sinv" id="sInv"></div><div class="sbusy" id="sBusy" hidden><i></i></div>
    <div class="szone R" id="szR"></div><div class="sstick R" id="stR"><i></i><span>AIM</span></div>
    <div class="spadx" id="sPadX"><button data-d="U" aria-label="Jump">▲</button><button data-d="L" aria-label="Walk left">◀</button><button data-d="R" aria-label="Walk right">▶</button><button data-d="D" aria-label="Crouch">▼</button></div>
    <button class="sbtn sm run" id="sRun" aria-label="Run" aria-pressed="false">RUN</button><button class="sbtn sm prone" id="sProne" aria-label="Lie down" aria-pressed="false">LIE<br>DOWN</button>
    <button class="sbtn fire" id="sFire" aria-label="Fire">FIRE</button><button class="sbtn use" id="sUse" aria-label="Use, pick up, pry">USE</button><button class="sbtn kick" id="sKick" aria-label="Kick">KICK</button>
    <button class="sbtn cover" id="sCover" aria-label="Take cover" hidden>COVER</button>
    <button class="smed" id="sMed" aria-label="Medical view">✚ MED</button>
    <div class="smedp" id="sMedP" hidden></div>
    <button class="smenu" id="sMenu" aria-label="Pause">❚❚</button><div class="send" id="sEnd" hidden></div>
    <div class="stag">STORY · PROTOTYPE</div>`;
  stickSetup();
  const hold=(el,dn,up)=>{el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();try{el.setPointerCapture(e.pointerId);}catch(_){}el.classList.add('dn');dn(e);});
    const u=e=>{e.preventDefault();el.classList.remove('dn');up&&up(e);};el.addEventListener('pointerup',u);el.addEventListener('pointercancel',u);};
  // arrow pad: hold ◀ ▶ to walk; tap twice quickly and hold to run; ▲ jumps; ▼ toggles crouch
  for(const b of s.querySelectorAll('#sPadX button')){const d=b.dataset.d;hold(b,()=>{
      if(d==='L'||d==='R'){const now=performance.now();if(now-SPAD.last[d]<300)SPAD.run=true;SPAD.last[d]=now;SKEYS.add('P'+d);}
      else if(d==='U'){if(STORY.prone)storyProne(false);else storyJump();}
      else if(d==='D'){if(STORY.prone)return;STORY.duckLatch=!STORY.duckLatch;}},
    ()=>{if(d==='L'||d==='R'){SKEYS.delete('P'+d);if(!SKEYS.has('PL')&&!SKEYS.has('PR'))SPAD.run=false;}});}
  hold($('sRun'),()=>{STORY.runLatch=!STORY.runLatch;});
  hold($('sProne'),()=>storyProne(!STORY.prone));
  hold($('sFire'),()=>{STORY.fireHeld=true;storyFire();},()=>{STORY.fireHeld=false;});
  hold($('sUse'),()=>storyE(true),()=>storyE(false));
  hold($('sKick'),()=>storyKick());
  hold($('sCover'),()=>storyCover());
  $('sMed').onclick=()=>storyMed(!STORY.med);
  $('sMenu').onclick=()=>storyPause();
  log('Story · prototype · get out of the lab','info');storyHint(true);
}
function storyStop(){STORY.on=false;STORY.med=false;document.body.classList.remove('storyon','storymed');$('story').hidden=true;$('story').innerHTML='';SKEYS.clear();STICK.R=null;setXray(false);setMap('fit');reset();}
const STOUCH=()=>matchMedia('(pointer:coarse)').matches;
function storyHint(first){const s=STORY;s.msg=!first?'':STOUCH()?'◀ ▶ walk (tap twice and hold to run) · ▲ jump · ▼ crouch · right stick aims (he turns to face it), FIRE shoots or stabs · USE, KICK, COVER · ✚ MED to treat yourself':'← → walk · Shift run · ↑ jump · ↓ crouch · Z lie down · F kick · Q cover · E use · M medical view · mouse aims, click fires or stabs';s.msgT=first?9:0;}
function storyE(down){if(!STORY.on)return;if(down){if(!storyInteract())STORY.pryKey=true;}else STORY.pryKey=false;}
function storyProne(on){const S=STORY;if(!S.on||S.busy||V.dead)return;S.prone=on;S.duckLatch=false;S.coverGo=null;if(!on)S.upReq=true;}
// medical view: the camera comes close, time keeps running, you pick an item and tap where it goes (like the sandbox)
function storyMed(on){const S=STORY;if(!S.on||V.dead)return;S.med=on;S.medSel=null;document.body.classList.toggle('storymed',on);if(!on)setXray(false);$('sMed').classList.toggle('on',on);}
function storyPause(){if(!STORY.on)return;paused=true;const e=$('sEnd');e.hidden=false;e.innerHTML=`<h2>Paused</h2><div class="srow"><button id="sRes">Resume</button><button id="sRe">Restart</button><button id="sQ">Main menu</button></div>`;
  $('sRes').onclick=()=>{paused=false;e.hidden=true;};$('sRe').onclick=()=>{paused=false;storyStart();};$('sQ').onclick=()=>{paused=false;storyStop();openHome();};}
function storyEnd(win){const e=$('sEnd');if(!e.hidden)return;storyMed(false);e.hidden=false;const t=fmtTime(STORY.t);
  e.innerHTML=win?`<h2>You got out</h2><p>The lab corridor · ${t} · blood ${Math.round(V.blood)} mL</p><p class="sfine">This is an early test of story mode. Tell us what you think on Discord!</p><div class="srow"><button id="sRe">Play again</button><button id="sQ">Main menu</button></div>`
    :`<h2>You died</h2><p>${STORY.fail}</p><p class="sfine">${t} · Tip: the sentry sweeps a red beam up and down and only shoots what it can see. Sit behind a steel crate (COVER) and fire blind over it, or lie down under the beam.</p><div class="srow"><button id="sRe">Try again</button><button id="sQ">Main menu</button></div>`;
  $('sRe').onclick=()=>storyStart();$('sQ').onclick=()=>{storyStop();openHome();};}
// the aim stick: it appears where the right thumb lands, the knob travels 56 px
function stickSetup(){const zone=$('szR'),base=$('stR'),knob=base.firstChild,R=56;
  zone.addEventListener('pointerdown',e=>{if(STICK.R||STORY.med)return;e.preventDefault();try{zone.setPointerCapture(e.pointerId);}catch(_){}STICK.R={id:e.pointerId,cx:e.clientX,cy:e.clientY,x:0,y:0};base.style.left=(e.clientX-70)+'px';base.style.top=(e.clientY-70)+'px';base.style.right='auto';base.style.bottom='auto';base.classList.add('on');knob.style.transform='';});
  zone.addEventListener('pointermove',e=>{const s=STICK.R;if(!s||s.id!==e.pointerId)return;e.preventDefault();let dx=e.clientX-s.cx,dy=e.clientY-s.cy;const l=Math.hypot(dx,dy);if(l>R){dx*=R/l;dy*=R/l;}s.x=dx/R;s.y=dy/R;knob.style.transform=`translate(${dx}px,${dy}px)`;});
  const end=e=>{const s=STICK.R;if(!s||s.id!==e.pointerId)return;STICK.R=null;base.classList.remove('on');knob.style.transform='';base.removeAttribute('style');};
  zone.addEventListener('pointerup',end);zone.addEventListener('pointercancel',end);}
// every frame, before drawing: input → movement, camera, the bar on screen
function storyFrame(dt){const S=STORY,Rs=STICK.R;
  const kx=((SKEYS.has('R')||SKEYS.has('PR'))?1:0)-((SKEYS.has('L')||SKEYS.has('PL'))?1:0);
  if(kx)S.coverGo=null;
  if(!S.coverGo)S.dir=S.med?0:kx;
  S.run=SKEYS.has('Shift')||SPAD.run||S.runLatch;
  S.duckWant=SKEYS.has('Duck');
  // right stick aims: a point 4 m away along the stick from his shoulder
  if(Rs&&Math.hypot(Rs.x,Rs.y)>0.25){const sh=P[SEG.nearUpperArm.a];const l=Math.hypot(Rs.x,Rs.y);S.aim={x:sh.x+Rs.x/l*400,y:sh.y+Rs.y/l*400};S.aimSeen=S.t;}
  if(S.fireHeld&&S.cool<=0)storyFire();
  // camera: about 5.2 m of lab, him a little behind centre so you see what is ahead of where he faces; close up in the
  // medical view
  const c=CAM.side;let x,y,wcm;
  if(S.med){const a=toWorld(SEG.chest,0,0);x=(a.x+storyX())/2+10;y=Math.min(-60,a.y+20);wcm=190;}else{S.camX=(S.camX??storyX()+90*FACE)+((storyX()+90*FACE)-(S.camX??0))*Math.min(1,dt*2.5);x=clamp(S.camX,-ROOM+250,ROOM-250);y=-118;wcm=520;}
  const tz=clamp(W*0.94/(wcm*S_()),0.08,6);c.z+=(tz-c.z)*Math.min(1,dt*3);
  const vs=S_()*c.z;const tx=W/2-OX-x*vs,ty=H*(S.med?0.55:0.56)-OY-y*vs;c.px+=(tx-c.px)*Math.min(1,dt*(S.run?6:4));c.py+=(ty-c.py)*Math.min(1,dt*4);
  const rm=storyRoom(storyX()),armed=S.inv.includes('pistol')||S.inv.includes('knife');
  const obj=S.done?'You got out.':S.med?'Medical view · pick an item, then tap where it goes. Time is still running.':rm===0&&!armed?'Get out of the lab. Look around this room first.':rm===0?'Get out of the lab. The door is on the far side of the next rooms.':rm===1?'Storage · a guard. The steel crate is cover (COVER).':S.tur.hp>0&&!S.tur.down?'A sentry’s red beam sweeps the room. Hide, shoot it or kick it over.':!S.inv.includes('crowbar')&&!S.door.open?'The exit door is jammed · the crowbar in your room could pry it.':S.door.pry<1?'Pry the exit door open with the crowbar.':'Go through the door to the exit.';
  $('sObj').textContent=obj;$('sPr').textContent=S.med?'':storyPrompt();
  const m=$('sMsg');m.textContent=S.msgT>0?S.msg:'';m.style.opacity=S.msgT>0?Math.min(1,S.msgT*2):0;
  $('sRun').setAttribute('aria-pressed',!!(S.runLatch||SPAD.run));$('sProne').setAttribute('aria-pressed',!!S.prone);$('sFire').classList.toggle('off',S.held!=='pistol'&&S.held!=='knife');
  const cn=!S.med&&(S.cover||(!S.prone&&V.rise>0.99&&storyCoverNear()));const cb=$('sCover');cb.hidden=!cn;const cl=S.cover?'STAND':'COVER';if(cb.textContent!==cl)cb.textContent=cl;
  // inventory: stacked items, the held weapon highlighted
  const counts={};for(const i of S.inv)counts[i]=(counts[i]||0)+1;const keys=Object.keys(counts);S.slots=keys;
  const icon=k=>artSVG(k)||(k==='morphine'?vialSVG(DRUGCOL.morphine):'')||'';
  const html=keys.map((k,i)=>`<button data-i="${k}" class="${S.held===k?'on':''}" title="${SITEM[k].name}"><span class="n">${i+1}</span>${icon(k)}<b>${SITEM[k].name}${counts[k]>1?' ×'+counts[k]:''}${k==='pistol'?' · '+S.ammo:''}</b></button>`).join('');
  const inv=$('sInv');if(inv.dataset.h!==html){inv.innerHTML=html||'<em>Empty hands</em>';inv.dataset.h=html;for(const b of inv.querySelectorAll('button'))b.onclick=()=>{if(S.med&&!SITEM[b.dataset.i].w){S.medSel=b.dataset.i;}else storyUse(b.dataset.i);};}
  // medical view palette: only the medicine you carry, the selected one lit; X-ray to see what bleeds
  const mp=$('sMedP');mp.hidden=!S.med;if(S.med){const meds=keys.filter(k=>!SITEM[k].w);const mh=`<b>Treat yourself</b>${meds.map(k=>`<button data-m="${k}" class="${S.medSel===k?'on':''}">${icon(k)}<span>${SITEM[k].name}${counts[k]>1?' ×'+counts[k]:''}<em>${SITEM[k].t} s</em></span></button>`).join('')||'<em>No medicine · find the medicine cabinet</em>'}<div class="srow2"><button data-x="1" class="${xray?'on':''}">X-ray</button><button data-q="1">Done</button></div>`;
    if(mp.dataset.h!==mh){mp.innerHTML=mh;mp.dataset.h=mh;for(const b of mp.querySelectorAll('button[data-m]'))b.onclick=()=>{S.medSel=b.dataset.m;};mp.querySelector('[data-x]').onclick=()=>setXray(!xray);mp.querySelector('[data-q]').onclick=()=>storyMed(false);}}
  const bb=$('sBusy');if(S.busy){bb.hidden=false;bb.firstChild.style.width=(100*S.busy.t/S.busy.dur)+'%';}else bb.hidden=true;
  if(S.done)storyEnd(true);else if(S.fail&&V.dead&&T-(V.deadAt||T)>2.2)storyEnd(false);
}
function S_(){return S;}
// keyboard: while story mode runs it owns the keys
const SKMAP={KeyA:'L',ArrowLeft:'L',KeyD:'R',ArrowRight:'R',ShiftLeft:'Shift',ShiftRight:'Shift',KeyS:'Duck',ArrowDown:'Duck',ControlLeft:'Duck',ControlRight:'Duck'};
window.addEventListener('keydown',e=>{if(!STORY.on||e.target.tagName==='INPUT')return;const k=e.code;let used=true;
  if(SKMAP[k])SKEYS.add(SKMAP[k]);
  else if(k==='KeyW'||k==='Space'||k==='ArrowUp'){if(!e.repeat){if(STORY.prone)storyProne(false);else storyJump();}}
  else if(k==='KeyC'){if(!e.repeat)STORY.duckLatch=!STORY.duckLatch;}
  else if(k==='KeyZ'){if(!e.repeat)storyProne(!STORY.prone);}
  else if(k==='KeyF'){if(!e.repeat)storyKick();}
  else if(k==='KeyQ'){if(!e.repeat)storyCover();}
  else if(k==='KeyM'){if(!e.repeat)storyMed(!STORY.med);}
  else if(k==='KeyE'){if(!e.repeat)storyE(true);}
  else if(/^Digit[1-9]$/.test(k)){const i=+k.slice(5)-1;const sl=STORY.slots||[];if(sl[i]){if(STORY.med&&!SITEM[sl[i]].w)STORY.medSel=sl[i];else storyUse(sl[i]);}}
  else if(k==='Escape'||k==='KeyP'){if(STORY.med&&k==='Escape')storyMed(false);else $('sEnd').hidden?storyPause():(!STORY.fail&&!STORY.done&&$('sRes')&&$('sRes').click());}
  else if(k==='KeyR'&&(STORY.fail||STORY.done))storyStart();
  else used=false;
  if(used){e.preventDefault();e.stopImmediatePropagation();}},true);
window.addEventListener('keyup',e=>{if(!STORY.on)return;const k=e.code;if(SKMAP[k])SKEYS.delete(SKMAP[k]);else if(k==='KeyE')storyE(false);e.stopImmediatePropagation();},true);
window.addEventListener('blur',()=>{SKEYS.clear();if(STORY.on){STORY.pryKey=false;STORY.fireHeld=false;}});
// mouse: aim with the pointer, hold the button to keep firing. In the medical view a tap or click puts the item there.
cv.addEventListener('pointermove',e=>{if(!STORY.on)return;if(e.pointerType==='mouse'){STORY.aim=toW(e.clientX,e.clientY);STORY.aimSeen=STORY.t;}e.stopImmediatePropagation();},true);
cv.addEventListener('pointerdown',e=>{if(!STORY.on)return;e.stopImmediatePropagation();e.preventDefault();const w=toW(e.clientX,e.clientY);
  if(STORY.med){if(STORY.medSel){if(storyUseAt(STORY.medSel,w))STORY.medSel=null;}else{STORY.msg='Pick an item first';STORY.msgT=1.2;}return;}
  if(e.pointerType!=='mouse')return;STORY.aim=w;STORY.aimSeen=STORY.t;if(STORY.held==='pistol'||STORY.held==='knife'){STORY.fireHeld=true;storyFire();}},true);
window.addEventListener('pointerup',e=>{if(STORY.on&&e.pointerType==='mouse')STORY.fireHeld=false;},true);
cv.addEventListener('pointerup',e=>{if(STORY.on)e.stopImmediatePropagation();},true);
cv.addEventListener('wheel',e=>{if(STORY.on){e.stopImmediatePropagation();e.preventDefault();}},{capture:true,passive:false});
