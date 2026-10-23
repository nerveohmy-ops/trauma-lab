/* TRAUMA_LAB_MAIN */
/* ===== core/math.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const rnd=(a,b)=>a+Math.random()*(b-a);
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
function wrap(a){while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;}
function dps(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy;let t=l2?((px-ax)*dx+(py-ay)*dy)/l2:0;t=clamp(t,0,1);const qx=ax+dx*t,qy=ay+dy*t;return{d:Math.hypot(px-qx,py-qy),t,qx,qy};}
function cross(ax,ay,bx,by,cx,cy){return (bx-ax)*(cy-ay)-(by-ay)*(cx-ax);}
function segInter(a,b,c,d){const d1=cross(c[0],c[1],d[0],d[1],a[0],a[1]),d2=cross(c[0],c[1],d[0],d[1],b[0],b[1]),d3=cross(a[0],a[1],b[0],b[1],c[0],c[1]),d4=cross(a[0],a[1],b[0],b[1],d[0],d[1]);return ((d1>0)!==(d2>0))&&((d3>0)!==(d4>0));}
function segDist(a,b,c,d){if(segInter(a,b,c,d))return 0;return Math.min(dps(a[0],a[1],c[0],c[1],d[0],d[1]).d,dps(b[0],b[1],c[0],c[1],d[0],d[1]).d,dps(c[0],c[1],a[0],a[1],b[0],b[1]).d,dps(d[0],d[1],a[0],a[1],b[0],b[1]).d);}
const D2R=Math.PI/180;
// clip a polygon to the half-plane d·p >= c
function clipHalf(poly,dx,dy,cc){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=a[0]*dx+a[1]*dy-cc,db=b[0]*dx+b[1]*dy-cc;if(da>=0)out.push(a);if((da>=0)!==(db>=0)){const t=da/(da-db);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}return out;}
function polyArea(p){let a=0;for(let i=0;i<p.length;i++){const q=p[i],r=p[(i+1)%p.length];a+=q[0]*r[1]-r[0]*q[1];}return Math.abs(a)/2;}
function ellHit(o,a,b,pad){const x1=(a.w-o.w)/(o.rw+pad),y1=(a.s-o.s)/(o.rs+pad),x2=(b.w-o.w)/(o.rw+pad),y2=(b.s-o.s)/(o.rs+pad);return dps(0,0,x1,y1,x2,y2).d<1;}
function polyHit(pts,a,b,r){for(let i=0;i<pts.length-1;i++){if(segDist([a.w,a.s],[b.w,b.s],[pts[i][1],pts[i][0]],[pts[i+1][1],pts[i+1][0]])<r)return true;}return false;}
function polyNear(pts,p,r){for(let i=0;i<pts.length-1;i++){if(dps(p.w,p.s,pts[i][1],pts[i][0],pts[i+1][1],pts[i+1][0]).d<r)return true;}return false;}
function splitLine(pts,c){const lo=[],hi=[];for(let i=0;i<pts.length;i++){const p=pts[i];if(p[0]<=c)lo.push([p[0],p[1]]);else hi.push([p[0]-c,p[1]]);
  if(i<pts.length-1){const q=pts[i+1];if((p[0]-c)*(q[0]-c)<0){const t=(c-p[0])/(q[0]-p[0]),w=lerp(p[1],q[1],t);lo.push([c,w]);hi.push([0,w]);}}}return[lo,hi];}
function angLerp(a,b,t){return a+wrap(b-a)*t;}
function polyW(pts,sv){if(sv<=pts[0][0])return pts[0][1];for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];if(sv<=b[0])return lerp(a[1],b[1],(sv-a[0])/((b[0]-a[0])||1));}return pts[pts.length-1][1];}
const gs=(t,m,s)=>Math.exp(-((t-m)*(t-m))/(2*s*s));
