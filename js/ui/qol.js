/* TRAUMA_LAB_MAIN */
/* ===== ui/qol.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
/* =========================================================
   QUALITY OF LIFE: the "now" bar (current tool + what to do + recent tools), the "More" menu for small screens,
   How to play, and a one-time quick start card.
   ========================================================= */
const TOUCHUI=('ontouchstart' in window)||navigator.maxTouchPoints>0;
function nowUpdate(){const t=TOOL[tool];if(!t||!$('nowCur'))return;
  const h=OPT.hints!==false?hintFor(tool):'';
  $('nowCur').innerHTML=`${svgI(t.icon)}<div><b>${t.name}</b>${h?`<span>${h}</span>`:''}</div>`;
  const rec=RECENT.filter(id=>id!==tool&&TOOL[id]&&!(CH&&CH.on&&!chAllowed(id))).slice(0,4);
  $('nowRec').innerHTML=rec.map(id=>`<button data-t="${id}" title="${TOOL[id].name}" aria-label="Switch to ${TOOL[id].name}">${svgI(TOOL[id].icon)}<span>${TOOL[id].name}</span></button>`).join('');
  $('nowRec').querySelectorAll('button').forEach(b=>b.onclick=()=>{closeMenu();selectTool(b.dataset.t);});
  if(typeof layout==='function'&&nowUpdate.h!==$('now').offsetHeight){nowUpdate.h=$('now').offsetHeight;layout();}}
// tapping the tool name opens its menu
$('nowCur').onclick=()=>{const c=TOPOF(TOOL[tool].cat);openMenu(c,$('c_'+c));};
/* ---------- More: the controls that do not fit on a phone ---------- */
const MORE=[['bPlay','Pause / play'],['bSlower','Slow motion'],['bFaster','Fast forward'],['bX','X-ray'],['bTraj','Bullet paths'],['bChart','Organ chart'],['bSnd','Sound'],['bBeep','Monitor beep'],['bMon','Monitor size'],['bOpt','Options'],['bReset','New subject']];
function openMore(){const m=$('menu');if(!m.hidden&&m.dataset.cat==='more'){closeMenu();return;}closeMenu();m.dataset.cat='more';
  m.innerHTML='<h4>Controls</h4>'+MORE.map(([id,n])=>{const b=$(id);if(!b)return'';const pr=b.getAttribute('aria-pressed');return`<button class="mi mm" data-b="${id}" ${pr!=null?`aria-pressed="${pr}"`:''}>${b.querySelector('svg')?`<span class="mic">${b.innerHTML}</span>`:'<span class="mic"></span>'}<b>${n}</b><em>${b.title||b.getAttribute('aria-label')||''}</em></button>`;}).join('');
  m.querySelectorAll('.mi').forEach(x=>x.onclick=()=>{const id=x.dataset.b;closeMenu();$(id).click();});
  m.hidden=false;$('scrim').hidden=false;const r=$('bMore').getBoundingClientRect(),mw=m.offsetWidth;m.style.maxHeight=(H-r.bottom-20)+'px';m.style.left=clamp(r.right-mw,8,W-mw-8)+'px';m.style.top=(r.bottom+6)+'px';m.style.bottom='auto';}
$('bMore').onclick=openMore;
/* ---------- How to play ---------- */
function openHelp(){closeMenu();const d=$('help');const T_=TOUCHUI;
  const k=a=>`<kbd>${keyName(keyOf(a))}</kbd>`;
  d.innerHTML=`<div class="hhead"><h3>How to play</h3><button id="helpX">Close</button></div>
  <ol class="hsteps"><li><b>Pick a category</b> in the bar at the bottom: Hand, Weapons, Props, Medicine, Powers.</li>
  <li><b>Pick a tool</b> from the list (or type in the search box).</li>
  <li><b>${T_?'Tap or drag':'Click or drag'} on the body.</b> The bar above the categories always says what the tool you hold does. Your last tools sit on its right for a quick switch.</li></ol>
  <h4>Camera</h4><ul><li>${T_?'Pinch to zoom, two fingers to move':'Mouse wheel to zoom · hold the middle button (or W A S D) to move'}.</li><li><b>Side / Front / Back</b> on the right change the view; the square button fits him back on screen.</li></ul>
  <h4>Watching him</h4><ul><li>The monitor at the top shows heart rate, blood pressure, oxygen and blood volume. <b>X-ray</b> shows organs, bones and vessels; <b>Chart</b> lists every injury.</li>
  <li>${T_?'On a small screen the extra controls are in':'More controls are in'} <b>⋯</b> (pause, slow motion, sound, monitor size).</li></ul>
  <h4>Treating him</h4><ul><li>Everything to save him is under <b>Medicine</b>: bandages, tourniquet, stitches, surgery, drugs, defibrillator.</li><li><b>Surgery mode</b> (main menu or Options): Simple does it for you, Complex lets you operate by hand.</li></ul>
  ${T_?'':`<h4>Keys</h4><div class="hkeys"><span>${k('hand')}…${k('power')} categories</span><span>${k('prev')} ${k('next')} previous / next tool</span><span>${k('menu')} tool menu</span><span>${k('pause')} pause</span><span>${k('xray')} X-ray</span><span>${k('view')} change view</span><span>${k('fit')} fit to screen</span><span>${k('reset')} reset</span></div><p class="hsub">Change any key in Options.</p>`}
  <p class="hsub">${COPYRIGHT}</p>`;
  d.hidden=false;$('scrim').hidden=false;$('helpX').onclick=closeHelp;$('scrim').addEventListener('click',closeHelp,{once:true});}
function closeHelp(){$('help').hidden=true;$('scrim').hidden=true;}
$('bHelp').onclick=openHelp;
/* ---------- quick start: shown once, the first time someone plays the sandbox ---------- */
function coachSeen(){try{return localStorage.getItem('traumaLabCoach')==='1';}catch(e){return true;}}
function openCoach(force){if(!force&&coachSeen())return;const d=$('coach');
  d.innerHTML=`<b>Quick start</b><ol><li>Pick a <em>category</em> ${document.body.classList.contains('land')?'on the left':'below'}</li><li>Pick a <em>tool</em></li><li>${TOUCHUI?'Tap':'Click'} or drag on the body</li></ol><div class="cbtns"><button id="coachHelp">More help</button><button id="coachOk">Got it</button></div>`;
  d.hidden=false;const done=()=>{d.hidden=true;try{localStorage.setItem('traumaLabCoach','1');}catch(e){}};
  $('coachOk').onclick=done;$('coachHelp').onclick=()=>{done();openHelp();};
  const r=$('tools').getBoundingClientRect(),land=document.body.classList.contains('land');
  if(land){d.style.left=(r.right+12)+'px';d.style.top='auto';d.style.bottom='60px';d.classList.add('side');}else{d.style.left='50%';d.style.bottom=(H-$('now').getBoundingClientRect().top+10)+'px';d.style.top='auto';d.classList.remove('side');}}
