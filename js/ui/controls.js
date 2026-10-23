/* TRAUMA_LAB_MAIN */
/* ===== ui/controls.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
// Interface controls: heart-monitor size, hover-to-open menus (mouse only) and keyboard shortcuts (rebindable).

// ---------- heart monitor: 0 full · 1 compact · 2 closed ----------
const MONL=['Monitor · full','Monitor · compact','Monitor · closed'];
function setMon(n,quiet){n=clamp(n|0,0,2);OPT.mon=n;saveOpt();const B=document.body;B.classList.toggle('mon1',n===1);B.classList.toggle('mon2',n===2);
  const b=$('bMon');if(b){b.setAttribute('aria-pressed',n!==0);b.title=MONL[n]+' · click to change size';}
  if(!quiet)log(MONL[n]+(n===2?' · the monitor button or the grip brings it back':''),'info');
  requestAnimationFrame(()=>{try{ecgResize();relayout();}catch(e){}});}
function monMini(){if(OPT.mon!==2)return;const e=$('miniV');if(!e)return;
  const bp=V.sys<5?'--/--':Math.round(V.sys)+'/'+Math.round(V.sys*0.64);
  e.innerHTML=`<i class="hr">♥ ${Math.round(V.hr)}</i><i class="bp">${bp}</i><i class="sp">${Math.round(V.spo2)}%</i><i class="bl">${Math.round(V.blood)} mL</i>`;}
(()=>{const grip=$('monGrip');if(!grip)return;let d=null;
  grip.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();try{grip.setPointerCapture(e.pointerId);}catch(_){}d={y:e.clientY,n:OPT.mon||0,moved:false};});
  grip.addEventListener('pointermove',e=>{if(!d)return;const dy=e.clientY-d.y;if(Math.abs(dy)>6)d.moved=true;
    // drag down = bigger, drag up = smaller, one step every 28 px
    const n=clamp(d.n-Math.round(dy/28),0,2);if(n!==(OPT.mon||0))setMon(n,true);});
  grip.addEventListener('pointerup',e=>{if(!d)return;if(!d.moved)setMon(((OPT.mon||0)+1)%3);else log(MONL[OPT.mon||0],'info');d=null;});
  grip.addEventListener('pointercancel',()=>{d=null;});})();

// ---------- menus open on hover with a mouse (phones and tablets keep tap-to-open) ----------
const HOVERUI=window.matchMedia?matchMedia('(hover:hover) and (pointer:fine)'):{matches:false};
let hovT=0,hovLeaveT=0;
function hovLeave(){clearTimeout(hovLeaveT);hovLeaveT=setTimeout(()=>{const m=$('menu');
  if(m.dataset.hover==='1'&&!m.hidden&&!m.matches(':hover')&&!document.querySelector('.hovb:hover'))closeMenu();},380);}
function hoverBind(btn,cat,open){if(!btn||btn.dataset.hb)return;btn.dataset.hb='1';btn.classList.add('hovb');
  btn.addEventListener('pointerenter',e=>{if(e.pointerType!=='mouse'||!HOVERUI.matches||!$('opts').hidden)return;clearTimeout(hovLeaveT);clearTimeout(hovT);
    const m=$('menu');if(!m.hidden&&m.dataset.hover!=='1')return;           // a menu you clicked open stays put
    hovT=setTimeout(()=>{if(!m.hidden&&m.dataset.cat===cat)return;if(!m.hidden)closeMenu();open(btn);m.dataset.hover='1';$('scrim').hidden=true;},m.hidden?150:60);});
  btn.addEventListener('pointerleave',e=>{if(e.pointerType!=='mouse')return;clearTimeout(hovT);hovLeave();});
  // clicking a menu that hover opened pins it (instead of closing it again)
  btn.addEventListener('click',e=>{const m=$('menu');if(m.dataset.hover==='1'&&!m.hidden&&m.dataset.cat===cat){m.dataset.hover='';$('scrim').hidden=false;e.stopImmediatePropagation();}},true);}
(()=>{const m=$('menu');
  m.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')clearTimeout(hovLeaveT);});
  m.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')hovLeave();});
  // a hover-opened menu has no scrim: a click elsewhere just closes it, it does not fire the tool
  window.addEventListener('pointerdown',e=>{if(m.hidden||m.dataset.hover!=='1')return;const t=e.target;if(m.contains(t)||(t.closest&&t.closest('.hovb')))return;
    closeMenu();if(t===cv){e.stopPropagation();e.preventDefault();}},true);
  hoverBind($('bMap'),'map',openMapMenu);hoverBind($('bWear'),'wear',openWearMenu);hoverBind($('bXL'),'xray',openXrayMenu);})();

// ---------- keyboard shortcuts (PC) ----------
// [action, label, default key (KeyboardEvent.code)] · WASD pans the camera and Esc closes menus, so those stay fixed
const KEYACT=[
  ['hand','Hand tools (Grab)','Digit1'],['weap','Weapons','Digit2'],['props','Props','Digit3'],['med','Medicine','Digit4'],['power','Powers','Digit5'],
  ['prev','Previous tool in the tab','KeyQ'],['next','Next tool in the tab','KeyE'],['mode','Switch tool mode (slash/stab, semi/auto…)','KeyF'],['menu','Open the tool menu','Tab'],
  ['str','Melee strength (front/back)','KeyG'],
  ['xray','X-ray','KeyX'],['exam','Examine (with X-ray)','KeyZ'],['paths','Bullet paths','KeyT'],['chart','Organ chart','KeyC'],['mon','Heart monitor size','KeyM'],
  ['view','Next view (side → front → back)','KeyV'],['side','Side view',''],['front','Front view',''],['back','Back view',''],
  ['pause','Pause / play','Space'],['slower','Slower','ArrowLeft'],['faster','Faster','ArrowRight'],
  ['zin','Zoom in','Equal'],['zout','Zoom out','Minus'],['fit','Fit to screen','Digit0'],
  ['chal','Challenge: keep him alive','KeyH'],['wear','Wear menu','KeyB'],['map','Map menu',''],['opts','Options','KeyO'],['reset','New subject (reset)','']];
const KDEF=Object.fromEntries(KEYACT.map(a=>[a[0],a[2]]));
const keyOf=a=>OPT.keys&&a in OPT.keys?OPT.keys[a]:KDEF[a];
function keyName(c){if(!c)return '—';return c.replace(/^Key/,'').replace(/^Digit/,'').replace(/^Numpad/,'Num ').replace('ArrowLeft','←').replace('ArrowRight','→').replace('ArrowUp','↑').replace('ArrowDown','↓').replace('Equal','=').replace('Minus','−').replace('Space','Space').replace('Backquote','`').replace('BracketLeft','[').replace('BracketRight',']').replace('Semicolon',';').replace('Quote',"'").replace('Comma',',').replace('Period','.').replace('Slash','/').replace('Backslash','\\');}
function catKey(c){const b=$('c_'+c);if(TOPOF(TOOL[tool].cat)===c){openMenu(c,b);return;}closeMenu();selectTool(lastIn[c]);log(TOOL[tool].name,'info');}
function tabTools(){const top=TOPOF(TOOL[tool].cat);return TOOLS.filter(t=>TOPOF(t.cat)===top&&(view==='side'||t.front)).map(t=>t.id);}
function stepTool(d){const L=tabTools();if(!L.length)return;let i=L.indexOf(tool);i=(i<0?0:i+d+L.length)%L.length;selectTool(L[i]);log(TOOL[tool].name,'info');}
function keyAction(a){
  switch(a){
    case 'hand':case 'weap':case 'props':case 'med':case 'power':catKey(a);break;
    case 'prev':stepTool(-1);break;case 'next':stepTool(1);break;
    case 'mode':{const t=TOOL[tool];if(t.modes){const ks=t.modes.map(m=>m[0]);MODE[tool]=ks[(ks.indexOf(MODE[tool])+1)%ks.length];refreshTools();log(t.name+' · '+t.modes.find(m=>m[0]===MODE[tool])[1],'info');}break;}
    case 'menu':{const c=TOPOF(TOOL[tool].cat);openMenu(c,$('c_'+c));break;}
    case 'str':if(typeof cycleStrength==='function')cycleStrength();break;
    case 'xray':$('bX').click();break;case 'exam':if(xray)$('bExam').click();else log('Examine needs X-ray on (X)','info');break;
    case 'paths':$('bTraj').click();break;case 'chart':$('bChart').click();break;case 'mon':setMon(((OPT.mon||0)+1)%3);break;
    case 'view':setView(view==='side'?'front':view==='front'?'back':'side');break;case 'side':case 'front':case 'back':setView(a);break;
    case 'pause':$('bPlay').click();break;case 'slower':$('bSlower').click();break;case 'faster':$('bFaster').click();break;
    case 'zin':$('zIn').click();break;case 'zout':$('zOut').click();break;case 'fit':$('zFit').click();break;
    case 'chal':if(!CH||!CH.on)openChallenge();break;case 'wear':$('bWear').click();break;case 'map':$('bMap').click();break;case 'opts':$('bOpt').click();break;case 'reset':$('bReset').click();break;}}
let KEYCAP=null;  // action waiting for a new key in Options
function keyDown(e){
  if(KEYCAP){e.preventDefault();e.stopPropagation();const a=KEYCAP;KEYCAP=null;
    if(e.code!=='Escape'){const code=e.code==='Backspace'||e.code==='Delete'?'':e.code;
      if(PANKEYS[code]){log(keyName(code)+' moves the camera · pick another key','info');}
      else{OPT.keys=Object.assign({},OPT.keys||{});if(code)for(const [k] of KEYACT)if(k!==a&&keyOf(k)===code)OPT.keys[k]='';OPT.keys[a]=code;saveOpt();}}
    renderOpts();return true;}
  if(e.ctrlKey||e.metaKey||e.altKey)return false;
  if(e.code==='Escape'){if(!$('menu').hidden||!$('opts').hidden){closeMenu();return true;}if(!$('chart').hidden){$('bChart').click();return true;}return false;}
  if(!$('opts').hidden)return false;
  for(const [a] of KEYACT){if(keyOf(a)&&keyOf(a)===e.code){
    if(e.repeat&&!['slower','faster','zin','zout','prev','next'].includes(a)){e.preventDefault();return true;}
    e.preventDefault();keyAction(a);return true;}}
  return false;}
function keysHtml(){let h='<h4>Keyboard</h4><p class="okhint">Click a key, then press the new one · Backspace clears it · Esc cancels · W A S D move the camera</p><div class="okeys">';
  for(const [a,l] of KEYACT)h+=`<div class="ok"><span>${l}</span><button class="kb${KEYCAP===a?' cap':''}" data-a="${a}">${KEYCAP===a?'press a key…':keyName(keyOf(a))}</button></div>`;
  return h+'</div><button id="keysReset">Default keys</button>';}
function keysWire(b){b.querySelectorAll('.kb').forEach(k=>k.onclick=()=>{KEYCAP=k.dataset.a;renderOpts();});
  const r=b.querySelector('#keysReset');if(r)r.onclick=()=>{OPT.keys=null;saveOpt();KEYCAP=null;renderOpts();log('Keys restored to defaults','info');};}
