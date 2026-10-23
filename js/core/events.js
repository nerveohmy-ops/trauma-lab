/* TRAUMA_LAB_MAIN */
/* ===== core/events.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
// The simulation reports to the outside world only through these hooks. The UI and audio layers plug into them at
// boot; a headless run (tests, an engine port, a server) can leave them empty or route them anywhere.
const HOOKS={log(){},sound(){},voice(){},breath(){},noise(){},ui(){}};
// another person (sim/bodies, BID ≠ 0) is named in the log; the heart monitor and the voice belong to the subject only
function emitLog(text,cls){HOOKS.log(BID?BCUR.name+' · '+text.replace(/^Subject /,''):text,cls);}
function emitSound(kind,vol,rate){if(BID&&kind==='beep')return;HOOKS.sound(kind,vol,rate);}
function emitVoice(kind,amt){if(!BID)HOOKS.voice(kind,amt);}
function emitBreath(kind){if(!BID)HOOKS.breath(kind);}
function emitNoise(dur,freq,gain,type){HOOKS.noise(dur,freq,gain,type);}
function emitUI(cmd){HOOKS.ui(cmd);}
