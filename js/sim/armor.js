/* TRAUMA_LAB_MAIN */
/* ===== sim/armor.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
/* =========================================================
   DAMAGE
   ========================================================= */
// he starts in the grey lab-issue boxer briefs of the redesign (take them off in Wear)
let WEAR={under:{on:true},shirt:{on:false},jeans:{on:false},boots:{on:false},vest:{on:false,hp:100},plate:{on:false,hp:100},helmet:{on:false,hp:100},helm:{on:false,hp:100},gorget:{on:false,hp:100},cuirass:{on:false,hp:100},pauldrons:{on:false,hp:100},vambraces:{on:false,hp:100},gauntlets:{on:false,hp:100},cuisses:{on:false,hp:100},greaves:{on:false,hp:100},sabatons:{on:false,hp:100}};
const WEARDEF={
  shirt:{name:'T-shirt',desc:'Cotton, no protection',col:'#5a6b7e'},
  jeans:{name:'Jeans',desc:'Denim, no protection',col:'#2f4766'},
  boots:{name:'Boots',desc:'Leather, turns knife slashes',col:'#3d2b1f'},
  vest:{name:'Aramid vest',desc:'Soft armour IIIA. Stops handguns, buckshot, fragments',col:'#24292e'},
  plate:{name:'Plate carrier',desc:'Level IV plates. Stops rifle rounds',col:'#555b3d'},
  helmet:{name:'Aramid helmet',desc:'Stops handgun rounds and fragments',col:'#4f553a'},
  helm:{name:'Steel helm',desc:'Closed helm with visor · turns blades and arrows, eye slit is a weak spot',col:'#9aa2aa'},
  gorget:{name:'Gorget',desc:'Steel collar · protects the throat and neck',col:'#9aa2aa'},
  cuirass:{name:'Steel cuirass',desc:'Breast and back plate with a lamed skirt · stops arrows, blades, .22',col:'#9aa2aa'},
  pauldrons:{name:'Pauldrons',desc:'Shoulder and upper-arm plates · gap at the armpit',col:'#9aa2aa'},
  vambraces:{name:'Vambraces',desc:'Forearm plates with elbow cops · gap at the inner elbow',col:'#9aa2aa'},
  gauntlets:{name:'Gauntlets',desc:'Articulated steel gloves',col:'#9aa2aa'},
  cuisses:{name:'Cuisses',desc:'Thigh plates · gap at the groin and back of the thigh',col:'#9aa2aa'},
  greaves:{name:'Greaves',desc:'Shin plates with knee cops · gap behind the knee',col:'#9aa2aa'},
  sabatons:{name:'Sabatons',desc:'Articulated steel shoes',col:'#9aa2aa'},
};
const WRANGE={gorget:{neck:[-99,999]},cuirass:{chest:[-99,999],abd:[-99,999]},pauldrons:{uarm:[-99,999]},vambraces:{farm:[-99,999]},gauntlets:{hand:[-99,999]},cuisses:{thigh:[-99,999]},greaves:{shin:[-99,999]},sabatons:{foot:[-99,999]},shirt:{chest:[-99,99],abd:[-99,17],uarm:[-99,11]},jeans:{abd:[15,99],thigh:[-99,999],shin:[-99,999]},boots:{foot:[-99,999],shin:[-12,999]},vest:{chest:[-5,99],abd:[-99,13]},plate:{chest:[-4,99],abd:[-99,8]}};
function wearRange(it,seg){if(it==='under'){const k=seg.kind;if(k==='abd')return[FEMALE?16:14,99];if(k==='thigh')return[-99,FEMALE?3.5:16];if(k==='chest'&&FEMALE&&!seg.part)return[7.5,17.5];return null;}const m=WRANGE[it];if(!m)return null;const r=m[seg.kind];if(!r)return null;if(it==='boots'&&seg.kind==='shin'){const L0=restLen(seg);return[L0-12,999];}return r;}
function covers(it,seg,s,w){
  if(!WEAR[it].on)return false;
  if(it==='helmet'){if(seg.kind!=='head')return false;return s<0.8||(w<-3.5&&s<5);}
  if(it==='helm')return seg.kind==='head';
  const r=wearRange(it,seg);if(!r)return false;const S=s+(seg.off||0);return S>=r[0]&&S<=r[1];
}
function anyWear(){for(const k in WEAR)if(WEAR[k].on)return true;return false;}
const ARMS=['helmet','helm','plate','cuirass','vest','gorget','pauldrons','vambraces','gauntlets','cuisses','greaves','sabatons'];
function armorStop(seg,L,b,dl,rep,exit){
  for(const it of ARMS){
    const A=WEAR[it];if(!A.on||A.hp<=0||!covers(it,seg,L.s,L.w))continue;
    const k=b.k||'pistol',E=b.E;let stop,red;
    const cl=b.am==='ap'?'ap':b.am==='bird'?'frag':wcls(k);   // armour-piercing cores defeat soft armour; birdshot is stopped like fragments
    if(STEELK.includes(it)){if(steelGap(it))continue;stop=steelStops(it,cl,E);red=0.7;}
    else if(cl==='arrow'){stop=it==='plate'||it==='helmet'||(it==='vest'&&E<60);red=0.6;}
    else if(it==='plate'){stop=cl==='ap'?(E<6000&&Math.random()<0.4):true;red=0.6;}
    else if(it==='vest'){stop=(cl==='hand'||cl==='buck'||cl==='frag'||cl==='magnum'||cl==='slug')&&E<3300;red=0.82;}
    else{stop=cl==='hand'||cl==='buck'||cl==='frag'||(cl==='magnum'&&Math.random()<0.5);red=0.85;}
    const soft=(k==='shotgun'||k==='shrapnel')?0.35:1;
    A.hp=Math.max(0,A.hp-E/(it==='plate'?100:it==='vest'?28:STEELK.includes(it)?50:24)*soft);
    const m={s:L.s,w:L.w,z:b.z,it,pen:!stop,t:T,E};(seg.amarks||(seg.amarks=[])).push(m);if(seg.amarks.length>30)seg.amarks.shift();if(!exit)b.mark=m;
    if(A.hp<=0)rep.push(WEARDEF[it].name.toLowerCase()+' shot through, no longer protecting');
    if(stop){
      b.E=0;
      if(!exit){const bt=E*(it==='plate'?0.022:it==='helmet'?0.05:STEELK.includes(it)?0.04:0.065);for(const x of blunt(seg,L.s,L.w,bt,'',1,true))rep.push(x);
        const vin=Math.sqrt(2*E/b.m),wd=dirWorld(seg,dl.w,dl.s);impulse(seg,clamp(L.s/seg.len,0,1),wd.x,wd.y,b.m*vin*b.knock*0.6);}
      rep.push(exit?'went through the body, caught by the '+WEARDEF[it].name.toLowerCase():'stopped by '+WEARDEF[it].name.toLowerCase());
      const p=toWorld(seg,L.s,L.w);FX.push({k:'spark',x:p.x,y:p.y,t:0,life:0.15});
      return true;
    }
    b.E*=red;if(!exit)rep.push(WEARDEF[it].name.toLowerCase()+' penetrated');
    return false;
  }
  return false;
}
function bladeBlock(seg,s,w,kind,stab){
  for(const it of STEELK){const A=WEAR[it];if(!A.on||A.hp<=0||!covers(it,seg,s,w))continue;if(steelGap(it))break;if(kind==='saber')break;return it;}
  for(const it of ['helmet','plate','vest','boots']){const A=WEAR[it];if(!A.on||(A.hp!=null&&A.hp<=0)||!covers(it,seg,s,w))continue;
    if(it==='boots'&&(kind==='machete'||stab))continue;
    if(it==='vest'&&(stab?Math.random()<0.35:kind==='machete'&&Math.random()<0.3))continue;
    return it;}
  return null;
}
function bluntArmor(seg,s,w){let f=1;for(const it of STEELK)if(covers(it,seg,s,w)&&WEAR[it].hp>0){f*=it==='helm'?0.5:0.6;break;}if(covers('helmet',seg,s,w)&&WEAR.helmet.hp>0)f*=0.45;else if(covers('plate',seg,s,w))f*=0.55;else if(covers('vest',seg,s,w))f*=0.82;else if(covers('boots',seg,s,w))f*=0.85;return f;}
const WORDER=['under','jeans','shirt','boots','vest','plate'];
const WTHK={under:0.1,shirt:0.25,jeans:0.45,boots:0.9,vest:1.4,plate:2.3};
// ---------- full steel plate armour (≈1.5–2 mm tempered steel over padding) ----------
// Plate turns blades and arrows and spreads blunt blows, but it has gaps where it must move
// (armpits, inner elbows, backs of knees, eye slit, fingers). A 9 mm can punch through at close range; rifles go through.
const STEELK=['helm','gorget','cuirass','pauldrons','vambraces','gauntlets','cuisses','greaves','sabatons'];
const STEELGAP={helm:0.05,gorget:0.1,cuirass:0.05,pauldrons:0.15,vambraces:0.12,gauntlets:0.2,cuisses:0.15,greaves:0.12,sabatons:0.1};
const STEELKIND={gorget:'neck',cuirass:'chest',pauldrons:'uarm',vambraces:'farm',gauntlets:'hand',cuisses:'thigh',greaves:'shin',sabatons:'foot'};
function steelGap(it){return Math.random()<(STEELGAP[it]||0);}
function steelStops(it,cl,E){if(cl==='arrow')return !(E>130&&Math.random()<0.3);if(cl==='buck'||cl==='frag')return true;if(cl==='hand')return E<300||Math.random()<0.4;if(cl==='magnum')return Math.random()<0.2;return false;}
