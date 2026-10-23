/* TRAUMA_LAB_MAIN */
/* ===== render/canvas.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
/* =========================================================
   RENDERING
   ========================================================= */
const C={cavity:'#4a1519',muscle:'#8a2a2f',fiber:'rgba(255,175,165,.10)',fat:'#d8b469',bone:'#ece3cb',boneE:'#a8987a',art:'#d8202c',vein:'#4752b4',track:'#2a0508',lungN:'#e39a96',lungF:'#c58180',heart:'#a3202b',liver:'#6e2121',stomach:'#e0a097',spleen:'#6b2846',kidney:'#8a2a2c',intest:'#cf8577',bladder:'#e3cf8c',brain:'#dca7a3',trachea:'#e8c8bd',eye:'#f3efe7'};
let SKC=null,WEARK='';
function setLocal(c,seg){if(SKC&&c===SKC.cx){c.setTransform(SKC.res,0,0,SKC.res,SKC.o*SKC.res,SKC.o*SKC.res);return;}const f=frame(seg),k=VS*DPR;c.setTransform(k*f.nx,k*f.ny,k*f.ux,k*f.uy,(VX+f.ax*VS)*DPR,(VY+f.ay*VS)*DPR);}
function setWorld(c){const m=view==='back'?-1:1;c.setTransform(m*DPR*VS,0,0,DPR*VS,DPR*VX,DPR*VY);}
// only the two long sides of a capsule: outlining these instead of the whole capsule keeps joints seamless (no disc at the knee or elbow)
function capSides(c,len,ra,rb){const sp=clamp((ra-rb)/len,-1,1),cp=Math.sqrt(1-sp*sp);c.beginPath();for(const sg of [1,-1]){c.moveTo(sg*ra*cp,ra*sp);c.lineTo(sg*rb*cp,len+rb*sp);}}
function capPath(c,len,ra,rb){const ph=Math.asin(clamp((ra-rb)/len,-1,1)),th=Math.PI/2;c.beginPath();c.arc(0,0,ra,th+Math.PI/2-ph,th+3*Math.PI/2+ph);c.arc(0,len,rb,th-Math.PI/2+ph,th+Math.PI/2-ph);c.closePath();}
function ell(c,w,s,rw,rs,rot){c.beginPath();c.ellipse(w,s,Math.max(0.01,rw),Math.max(0.01,rs),rot||0,0,Math.PI*2);}
function strokePts(c,pts){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[1],p[0]):c.moveTo(p[1],p[0]));c.stroke();}
const rgb=(a,m=1)=>`rgb(${Math.round(clamp(a[0]*m,0,255))},${Math.round(clamp(a[1]*m,0,255))},${Math.round(clamp(a[2]*m,0,255))})`;
