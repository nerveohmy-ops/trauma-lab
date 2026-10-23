/* TRAUMA_LAB_MAIN */
/* ===== core/env.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
// the credit players see (the owner's full notice stays in the file headers, the page metadata and LICENSE)
const COPYRIGHT='© 2026 Abynotic Studios. All rights reserved.';
// content notice shown on the splash, the main menu and in Options / What's new
const NOTICE='18+ · Contains graphic violence and gore · A fictional simulation, not medical advice';
'use strict';
/* TRAUMA_LAB_MAIN */
const SRC_DOC=document.documentElement.cloneNode(true);
const $=id=>document.getElementById(id);
const cv=$('c');let ctx=cv.getContext('2d');
// let (not const): the side-view mini camera swaps these to draw into its own canvas
let skinC=document.createElement('canvas'), sctx=skinC.getContext('2d');
const reduceMotion=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
let W=0,H=0,DPR=1,S=1.5,OX=0,OY=0,ROOM=110,TOP=-220;
let VS=1.5,VX=0,VY=0;
              // live view transform
const CAM={side:{z:1,px:0,py:0},front:{z:1,px:0,py:0},back:{z:1,px:0,py:0}};
let view='side';
let G=981;
const SUB=6, ITER=10;
let T=0, hPrev=0, timeScale=1, xray=false, soundOn=true, shake=0;
/* ---------- options ---------- */
const OPT_DEF={sex:'m',mon:0,keys:null,mstr:2,chemq:2,chemc:0,ammo:{},mlist:false,gunvol:1,casevol:0.5,pip:false,scene:'lab',surg:'simple',tear:true,beep:true,xl:{skin:true,muscles:true,organs:true,vessels:true,bones:true,nerves:true},gore:3,strands:true,spatter:true,clot:true,god:false,bleedout:true,react:true,painfx:true,slowmo:false,arrowcam:true,gravity:'earth',skin:'medium',quality:'auto',shake:true,hints:true,logs:true,pin:true,fps:false,vol:0.8,amb:true,vib:true};
let OPT=Object.assign({},OPT_DEF);
OPT.xl=Object.assign({},OPT_DEF.xl,OPT.xl||{});
let FEMALE=false;
function XL(k){return !xray||!OPT.xl||OPT.xl[k]!==false;}
function xlKey(){return xray&&OPT.xl?Object.keys(OPT.xl).map(k=>OPT.xl[k]?1:0).join(''):'';}
function saveOpt(){try{localStorage.setItem('traumaLabOpts',JSON.stringify(OPT));}catch(e){}}
const GORE=[{k:0.4,b:450,g:140,m:160,n:'Mild'},{k:1,b:900,g:320,m:420,n:'Realistic'},{k:1.8,b:1500,g:520,m:750,n:'Heavy'},{k:3,b:2400,g:800,m:1200,n:'Extreme'}];
function GQ(){const g=GORE[OPT.gore]||GORE[1];return OPT.quality==='low'?{k:g.k*0.6,b:Math.min(g.b,500),g:Math.min(g.g,160),m:Math.min(g.m,150),n:g.n}:g;}
function gn(n){const v=n*GQ().k;return Math.floor(v)+(Math.random()<v%1?1:0);}
const GRAV={earth:981,mars:371,moon:162,zero:0,jupiter:2479,sun:27400};
G=GRAV[OPT.gravity]??981;
// medium matches the redesign's base skin (#c68b6c) under its key light
const SKINS={light:[238,200,172],medium:[200,143,111],tan:[182,132,98],dark:[122,84,62]};
const MAPS={fit:{name:'Fit screen',desc:'Lab sized to your screen'},closet:{name:'Closet',w:150,h:230,desc:'1.5 m wide lab cell'},room:{name:'Test room',w:300,h:260,desc:'3 m wide lab'},hall:{name:'Hall',w:600,h:320,desc:'6 m wide hall'},warehouse:{name:'Warehouse',w:1200,h:520,desc:'12 m concrete warehouse',theme:'wh'},field:{name:'Field',w:2500,h:900,desc:'25 m open field',theme:'field'},facility:{name:'Lab corridor',w:1200,h:260,desc:'Story mode',hidden:true}};
let MAP='fit';
let DPRCAP=2,frameAvg=16,perfT=0;
let layQ=0;
