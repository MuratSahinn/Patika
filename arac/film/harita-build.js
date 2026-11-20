// Natural Earth (world-atlas, kamu malı veri; paket ISC) → Akdeniz bölgesi kara + TR/IT/GR sınırları
// Kullanım: node arac/film/harita-build.js <world-atlas klasörü> > arac/film/harita.json
const fs = require('fs'), path = require('path');
const topo = require(path.resolve(process.argv[2], '..', 'topojson-client'));
const BB = [4, 30, 47, 48.5]; // lon0, lat0, lon1, lat1
const TOL = +process.env.TOL || 0.005, TOLS = +process.env.TOLS || 0.012, Q = 1000; // derece toleransı, nicemleme (0.001°)
function clip(ring){ // Sutherland–Hodgman, dikdörtgen
  const edges = [[p=>p[0]>=BB[0], (a,b)=>ix(a,b,0,BB[0])],[p=>p[0]<=BB[2], (a,b)=>ix(a,b,0,BB[2])],[p=>p[1]>=BB[1], (a,b)=>ix(a,b,1,BB[1])],[p=>p[1]<=BB[3], (a,b)=>ix(a,b,1,BB[3])]];
  let out = ring;
  for(const [ins, cut] of edges){ const inp = out; out = []; if(!inp.length) break;
    for(let i=0;i<inp.length;i++){ const c=inp[i], p=inp[(i+inp.length-1)%inp.length];
      if(ins(c)){ if(!ins(p)) out.push(cut(p,c)); out.push(c); } else if(ins(p)) out.push(cut(p,c)); } }
  return out;
}
function ix(a,b,k,v){ const t=(v-a[k])/(b[k]-a[k]); return k===0?[v, a[1]+(b[1]-a[1])*t]:[a[0]+(b[0]-a[0])*t, v]; }
function dpRing(r, tol){ // kapalı halka: kapanış noktasını at, en uzak noktadan ikiye böl
  let pts = r; const a = pts[0], z = pts[pts.length-1]; if(a[0]===z[0] && a[1]===z[1]) pts = pts.slice(0,-1);
  if(pts.length<4) return pts; let k=0, md=-1; for(let i=1;i<pts.length;i++){ const d=Math.hypot(pts[i][0]-pts[0][0], pts[i][1]-pts[0][1]); if(d>md){ md=d; k=i; } }
  const A = dp(pts.slice(0,k+1), tol), B = dp(pts.slice(k).concat([pts[0]]), tol);
  return A.concat(B.slice(1,-1)); }
function dp(pts, tol){ if(pts.length<3) return pts; const keep=new Uint8Array(pts.length); keep[0]=keep[pts.length-1]=1; const st=[[0,pts.length-1]];
  while(st.length){ const [a,b]=st.pop(); let md=0, mi=-1; const [ax,ay]=pts[a],[bx,by]=pts[b]; const dx=bx-ax, dy=by-ay, L=Math.hypot(dx,dy)||1e-12;
    for(let i=a+1;i<b;i++){ const d=Math.abs(dy*pts[i][0]-dx*pts[i][1]+bx*ay-by*ax)/L; if(d>md){md=d;mi=i;} }
    if(md>tol){ keep[mi]=1; st.push([a,mi],[mi,b]); } }
  return pts.filter((_,i)=>keep[i]); }
function enc(ring){ const o=[]; let px=0, py=0; for(const [x,y] of ring){ const qx=Math.round(x*Q), qy=Math.round(y*Q); if(o.length && qx===px && qy===py) continue; o.push(qx-px, qy-py); px=qx; py=qy; } return o; }
const land = JSON.parse(fs.readFileSync(path.join(process.argv[2],'land-10m.json')));
const cty = JSON.parse(fs.readFileSync(path.join(process.argv[2],'countries-10m.json')));
const out = { q:Q, bb:BB, kara:[], sinir:{} };
const lf = topo.feature(land, land.objects.land);
for(const f of lf.features){ const polys = f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
  for(const poly of polys){ const r = clip(poly[0]); if(r.length<4) continue; const s = dpRing(r, TOL); if(s.length<4) continue;
    let a=0; for(let i=0;i<s.length;i++){ const p=s[i], q=s[(i+1)%s.length]; a+=p[0]*q[1]-q[0]*p[1]; } if(Math.abs(a)/2 < 0.002) continue; // çok küçük adacıklar
    out.kara.push(enc(s)); } }
const AD = { tr:'Turkey', it:'Italy', gr:'Greece' };
const cf = topo.feature(cty, cty.objects.countries);
for(const [k,ad] of Object.entries(AD)){ const f = cf.features.find(x=>x.properties.name===ad); const polys = f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
  out.sinir[k] = polys.map(p=>dpRing(clip(p[0]), TOLS)).filter(r=>r.length>=4).map(enc); }
process.stdout.write(JSON.stringify(out));
