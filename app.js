import { createQuestControls } from './quest-controls.js';
import {buildLandmark} from './landmark.js?v=landmark-v5';
import {makeFootwear,makeSole} from './footwear.js?v=landmark-v5';
import * as T from 'three';
import { VRButton } from './vendor/VRButton.js';
import { GLTFExporter } from './vendor/GLTFExporter.js';
import { upgradeThreshold } from './threshold.js?v=landmark-v5';
import { addBranding } from './branding.js?v=landmark-v5';
import { buildProgramme } from './programme.js?v=landmark-v5';
import { createExperience } from './experience.js?v=landmark-v5';
const $=s=>document.querySelector(s), scene=new T.Scene(),world=new T.Group();world.name='Creator Base — 1:1 CAD model';scene.add(world);
const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);renderer.xr.enabled=true;renderer.xr.setReferenceSpaceType('local-floor');renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;$('#world').append(renderer.domElement);
const camera=new T.PerspectiveCamera(65,innerWidth/innerHeight,.07,1600),rig=new T.Group();rig.add(camera);scene.add(rig);camera.position.y=1.6;
const mat=(c,extra={})=>new T.MeshStandardMaterial({color:c,roughness:.83,...extra});const M={floor:mat('#CFC8BE'),oak:mat('#C9A27A'),dark:mat('#4A3A2E'),terra:mat('#E2DDD5'),core:mat('#8E8A84'),felt:mat('#B8B2A8'),concrete:mat('#A8A39B'),black:mat('#1A1A1A'),white:mat('#f2eee5'),green:mat('#354c32'),track:mat('#9C4A32'),glow:mat('#FF5A1F',{emissive:'#FF5A1F',emissiveIntensity:2.2}),light:mat('#fff0d8',{emissive:'#ffe4b6',emissiveIntensity:1.2}),glass:mat('#b7c8c1',{transparent:true,opacity:.09,depthWrite:false,roughness:.1,side:T.DoubleSide})};
// Procedural tactile materials: no external imagery or model downloads.
function surface(kind){const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');let n=921;const rnd=()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296;};ctx.fillStyle=kind==='oak'?'#c9a27a':kind==='terrazzo'?'#e2ddd5':'#cfc8be';ctx.fillRect(0,0,256,256);for(let i=0;i<(kind==='oak'?850:2400);i++){const x=rnd()*256,y=rnd()*256;ctx.fillStyle=kind==='oak'?`rgba(80,49,21,${rnd()*.16})`:`rgba(${rnd()>.5?'110,104,93':'255,251,238'},${rnd()*.13})`;if(kind==='oak')ctx.fillRect(x,y,.3+rnd(),15+rnd()*95);else{ctx.beginPath();ctx.ellipse(x,y,rnd()*.85+.2,rnd()*.7+.15,rnd()*3,0,7);ctx.fill();}}const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;return t;}
M.oak.map=surface('oak');M.oak.color.set('#ffffff');M.terra.map=surface('terrazzo');M.terra.color.set('#ffffff');M.floor.map=surface('cement');M.floor.color.set('#ffffff');
const cube=new T.BoxGeometry(1,1,1), cylinder=new T.CylinderGeometry(1,1,1,16),sphere=new T.SphereGeometry(1,12,8),colliders=[];let solids=true;
function box(x,y,z,w,d,h,m=M.oak,collision=false,parent=world){const o=new T.Mesh(cube,m);o.position.set(x,z+h/2,-y);o.scale.set(w,h,d);parent.add(o);if(collision)colliders.push([x-w/2,x+w/2,y-d/2,y+d/2]);return o;}
function cyl(x,y,z,r,h,m=M.oak,parent=world){const o=new T.Mesh(cylinder,m);o.position.set(x,z+h/2,-y);o.scale.set(r,h,r);parent.add(o);return o;}
function ell(x,y,z,sx,sy,sz,m,parent=world){const o=new T.Mesh(sphere,m);o.position.set(x,z,-y);o.scale.set(sx,sy,sz);parent.add(o);return o;}
function ring(x,y,z,r,m=M.glow,parent=world){const o=new T.Mesh(new T.TorusGeometry(r,.025,5,60),m);o.rotation.x=-Math.PI/2;o.position.set(x,z,-y);parent.add(o);return o;}
function plant(x,y,r=.4){cyl(x,y,0,r,.5,M.terra);cyl(x,y,.5,.045,1.4,M.dark);for(let j=0;j<7;j++){const a=j*2.4;ell(x+Math.cos(a)*r*.6,y+Math.sin(a)*r*.6,1.1+j*.13,r*.62,.36,r*.8,M.green);}}
function table(x,y,w=2.4,d=1,h=.75){box(x,y,h-.09,w,d,.09);for(const a of [-1,1])for(const b of [-1,1])box(x+a*(w/2-.12),y+b*(d/2-.12),0,.07,.07,h-.09,M.black);colliders.push([x-w/2,x+w/2,y-d/2,y+d/2]);}
const chairParts=[];
function chair(x,y,angle=0){chairParts.push({x,y,angle});}
function makeChairs(){for(const [w,h,d,py,pz,m] of [[.48,.1,.48,.45,0,M.felt],[.48,.55,.08,.77,.22,M.felt],[.055,.42,.055,.21,-.18,M.black],[.055,.42,.055,.21,.18,M.black]]){const mesh=new T.InstancedMesh(cube,m,chairParts.length),dummy=new T.Object3D();chairParts.forEach((p,i)=>{dummy.position.set(p.x+Math.sin(p.angle)*pz,py,-p.y+Math.cos(p.angle)*pz);dummy.rotation.y=p.angle;dummy.scale.set(w,h,d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix)});world.add(mesh);}}
function sofa(x,y,w=2.2){box(x,y,0,w,.9,.43,M.felt,true);box(x,y-.38,.4,w,.16,.35,M.felt);for(const a of [-1,1])box(x+a*(w/2-.09),y,.4,.18,.9,.2,M.felt);}
function slats(x1,x2,y,z=0,h=3.6){for(let x=x1;x<x2;x+=.08)box(x,y,z,.04,.06,h);}
const poly=[[0,23.5],[18.43,23.5],[18.43,35.47],[45.83,35.47],[45.83,28.47],[43.83,28.47],[43.83,24.25],[57.48,24.25],[57.48,45.47],[8.49,45.47],[8.49,45.02],[6.38,45.02],[6.38,41.1],[0,41.1]];
const shape=new T.Shape();poly.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();const fg=new T.ShapeGeometry(shape),floor=new T.Mesh(fg,M.floor);floor.rotation.x=-Math.PI/2;floor.name='Proposed area floor';world.add(floor);box(31.43,25.235,-.1,3.8,20.47,.1,M.dark);
// Core mass, deliberately leaving the lift corridor void.
box(23.98,24.195,0,11.1,22.55,3.6,M.core,true);box(39.58,20.695,0,12.5,15.55,3.6,M.core,true);box(38.58,26.36,0,10.5,4.22,3.6,M.core,true);box(39.015,31.22,0,11.37,6.1,3.6,M.core,true);box(45.265,28.585,0,1.13,.83,3.6,M.core,true);box(45.265,32.235,0,1.13,4.07,3.6,M.core,true);box(45.265,29.6,2.3,1.13,1.2,1.3,M.core);box(45.265,29.6,-.06,1.13,1.2,.06,M.floor);box(39.58,34.985,0,12.5,1,3.6,M.core,true);
// Staff door opening at y29–30.2 on east core face.
box(45.8,28.735,0,.12,.53,3.6,M.core,true);box(45.8,32.835,0,.12,5.27,3.6,M.core,true);box(45.8,29.6,2.2,.12,1.2,1.4,M.core);
box(29.5,25.2,0,.09,20.5,3.6,M.dark);box(33.36,25.2,0,.09,20.5,3.6,M.dark);box(31.43,25.2,3.6,3.8,20.5,.08,M.dark);for(let y=18;y<34;y+=5){box(29.55,y,0,.03,1.7,2.5,M.black);box(33.3,y,0,.03,1.7,2.5,M.black);box(31.43,y,3.52,1.3,.06,.025,M.light);}
box(9.215,23.5,0,18.43,.15,3.6,M.core,true);box(50.655,24.25,0,13.65,.15,3.6,M.core,true);
const columns=[[3.8,18.9],[3.8,29.4],[3.8,39.9],[3.9,8.4],[14.3,3.8],[14.3,44.5],[24.8,3.7],[24.8,44.6],[35.3,3.7],[35.3,44.6],[45.8,3.7],[45.8,44.5],[56.6,18.9],[56.6,29.4],[56.6,39.9]];columns.forEach(([x,y])=>box(x,y,0,1.35,1.35,3.6,M.concrete,true));
const ext=[[0,0],[52.98,0],[52.98,6.37],[57.03,6.37],[57.03,8.53],[57.48,8.53],[57.48,45.47],[8.49,45.47],[8.49,45.02],[6.38,45.02],[6.38,41.1],[0,41.1]];
for(let i=0;i<ext.length;i++){const a=ext[i],b=ext[(i+1)%ext.length],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),n=Math.ceil(len/1.5);const panel=box((a[0]+b[0])/2,(a[1]+b[1])/2,0,len,.035,3.6,M.glass);panel.rotation.y=Math.atan2(dy,dx);for(let j=0;j<=n;j++)box(a[0]+dx*j/n,a[1]+dy*j/n,0,.045,.045,3.6,M.black);for(const z of [.02,3.55]){const rail=box((a[0]+b[0])/2,(a[1]+b[1])/2,z,len,.05,.05,M.black);rail.rotation.y=Math.atan2(dy,dx);}}
// Ceilings follow the in-scope bands, with individual timber slats.
box(31.78,40.47,3.6,51.4,10,.08,M.dark);box(6,29.5,3.6,12,12,.08,M.black);box(51.65,31.87,3.6,11.65,15.25,.08,M.white);
for(let x=7;x<45.8;x+=.15)box(x,40.47,3.49,.045,10,.1);for(let x=8;x<44;x+=4)box(x,40.47,3.47,.04,8,.025,M.light);for(let y=25;y<35;y+=2)box(6,y,3.48,10,.04,.025,M.light);for(let y=25;y<39;y+=1.2)box(51.5,y,3,9,.06,.28,M.felt);
box(29.2,37.5,0,.3,4,3.2,M.dark,true);box(33.7,37.5,0,.3,4,3.2,M.dark,true);cyl(35.5,43,0,1.2,.45,M.terra);plant(35.5,43,.45);plant(38.3,38.5);plant(44.5,43.8);table(41.4,37.5,2.4,.6,1);sofa(39.8,42.8);sofa(43,42.8);cyl(41.4,42.8,0,.45,.4);
slats(18.43,29,35.5);box(23.7,35.56,2.9,10.5,.04,.025,M.light);
const shoes=[];let shoeFamily=0;function shoe(x,y,z,parent=world){const g=makeFootwear(shoeFamily++%3);g.position.set(x,z,-y);parent.add(g);return g;}
for(let i=0;i<8;i++){const x=19.8+i*7.9/7;box(x,37,0,.6,.6,1,M.terra,true);box(x,37,1,.38,.22,.025,M.white);const s=shoe(x,37,1.13);const halo=ring(x,37,1.01,.24);halo.visible=false;const layers=[];for(let j=0;j<3;j++){const l=makeSole(j===0?M.black:j===1?M.white:M.felt);l.position.set(x,1.14+j*.14,-37);world.add(l);l.visible=false;layers.push(l)}shoes.push({x,y:37,shoe:s,halo,layers,until:0});}
for(const [a,b,m] of [[22,29,M.track],[15,22,M.oak],[7.6,15,M.floor]])box((a+b)/2,43.25,.003,b-a,3.5,.006,m);for(let x=9;x<29;x+=4)plant(x,41.3,.3);
// Route is present only in active journey areas; calm Fuel Bar is intentionally unlit.
const routePoints=[[31.4,30],[31.4,41.4],[28.9,43.9],[18.6,43.9]];for(let i=1;i<routePoints.length;i++){const a=routePoints[i-1],b=routePoints[i],dx=b[0]-a[0],dy=b[1]-a[1];const o=box((a[0]+b[0])/2,(a[1]+b[1])/2,.012,.08,Math.hypot(dx,dy),.008,M.glow);o.rotation.y=-Math.atan2(dx,dy);}box(31.45,36,.015,3.7,.08,.008,M.glow);
// Fuel, recovery and workshop.
box(12.5,36.4,0,8,.8,1.05,M.terra,true);box(12.5,36.4,1.05,8.05,.85,.07);for(let x=9;x<17;x+=1.4){cyl(x,37.45,0,.045,.7,M.black);cyl(x,37.45,.7,.22,.07);}
for(let z=.8;z<2.5;z+=.65)box(12.5,35.65,z,8,.35,.06);for(let x=9;x<17;x+=2)plant(x,35.8,.18);sofa(12,39.6,3);sofa(15.5,39.6,3);for(let i=0;i<3;i++)box(4.5+i,38.5,.01,.6,1.8,.025,M.black);cyl(7,38,0,.18,.5,M.felt);cyl(10,40,0,.4,.4,M.felt);plant(7,44,.45);
const tiers=[];for(let i=0;i<6;i++){const h=(i+1)*.3;tiers.push(box(7.05+i*.9,30.75,0,.9,8.5,h,M.oak));for(let seat=0;seat<14;seat++){const y=26.8+seat*.6;const o=box(7.05+i*.9,y,h,.6,.5,.07,M.felt);o.name='Arena seat '+(i*14+seat+1);tiers.push(o);}}const stage=cyl(1.65,31.5,0,1,.3);stage.name='Arena stage — column-clear concept';stage.scale.set(1.3,.3,2.5);const arenaRing=ring(1.65,31.5,3.2,2.5,M.light);arenaRing.scale.x=.52;const mats=[];for(let i=0;i<12;i++){const o=box(5.1+i%3*2.1,27.1+Math.floor(i/3)*1.9,.01,.65,1.5,.03,M.felt);o.visible=false;mats.push(o);}
// Enclosed studio, north-side door, and open workshop.
box(12,26.65,0,.15,6.3,3.6,M.felt,true);box(13,29.8,0,2,.15,3.6,M.felt,true);box(16.815,29.8,0,3.23,.15,3.6,M.felt,true);box(14.6,29.8,2.3,1.2,.15,1.3,M.felt);box(13,29.9,1.1,1.7,.06,1.3,M.dark);box(16.8,29.9,1.1,2.9,.06,1.3,M.dark);table(15.2,26.4,1.8,.9);chair(15.2,25.6);chair(15.2,27.2,Math.PI);cyl(17,25.2,0,.035,2,M.black);box(17,25.2,1.8,.5,.12,.4,M.black);table(15.2,31.5,2.4,1,.9);table(15.2,33.8,2.4,1,.9);for(const y of [30.7,32.3,33,34.6])for(const x of [14.5,15.8])chair(x,y,y===30.7||y===33?0:Math.PI);
// Workshop west edge remains open to the Arena; do not fill it with wall slats.
for(const y of [30.05,35.3])box(12,y,0,.06,.06,3.6);
// Sell-in suite and 30 staff positions.
box(46.415,39.5,0,1.17,.04,3.6,M.glass);box(52.99,39.5,0,8.98,.04,3.6,M.glass);for(let x=45.83;x<57.48;x+=1.5)box(x,39.5,0,.04,.04,3.6,M.black);table(51.6,42.4,4,1.2);for(let i=0;i<4;i++){chair(50.1+i,41.4,Math.PI);chair(50.1+i,43.4);}box(51.6,42.4,2.7,3,.08,.06,M.light);for(let j=0;j<3;j++){box(46,42.5,.7+j*.6,.35,5,.05);for(let k=0;k<4;k++)shoe(46,40.5+k*1.2,.8+j*.6);}
for(const [x,y] of [[48.2,27.5],[51.4,27.5],[54.6,27.5],[48.2,33.5],[51.4,33.5]])for(let j=0;j<3;j++)for(const side of [-1,1]){const yy=y+(j-1)*1.6;table(x+side*.4,yy,.8,1.6);chair(x+side*1.05,yy,side*Math.PI/2);box(x+side*.12,yy,.76,.04,.55,.35,M.black);}
for(const dx of [-1.2,1.2])box(54.8+dx,33.5,0,.04,2.4,2.4,M.glass);box(54.8,34.7,0,2.4,.04,2.4,M.glass);box(54.8,33.5,2.4,2.4,2.4,.04,M.white);table(54.8,33.5,1.2,.7);chair(54.8,32.7);box(46,34,1.4,.3,2,.05);for(let i=0;i<5;i++)shoe(46,33.2+i*.35,1.5);plant(56,37);plant(47,38);makeChairs();
// Instanced pin field: 80 mm pitch, 44 mm diameter. Segment distance draws runners.
const segments=[[0,2.05,0,1.35],[0,1.7,-.48,1.9],[-.48,1.9,-.72,1.55],[0,1.65,.45,1.32],[.45,1.32,.7,1.7],[0,1.35,-.48,.85],[-.48,.85,-.82,.95],[0,1.35,.42,.8],[.42,.8,.65,.25]];
function dist(x,y,a,b,c,d){let t=Math.max(0,Math.min(1,((x-a)*(c-a)+(y-b)*(d-b))/((c-a)**2+(d-b)**2)));return Math.hypot(x-a-t*(c-a),y-b-t*(d-b));}
function figure(x,y,c){return Math.hypot(x-c,y-2.35)<.19||segments.some((s,i)=>dist(x-c,y,...s)<(i===0?.19:.135));}
const pins=[],pg=new T.CylinderGeometry(.022,.022,1,8),whitePins=[],markPins=[];for(let x=1;x<=11;x+=.08)for(let h=.3;h<=3.4;h+=.08){const v=figure(x,h,7.5),a=figure(x,h,3.5);(v?markPins:whitePins).push({x,h,depth:a?.19:.025});}const pinIndices=pg.index.array;pg.setIndex([...pinIndices.slice(0,pg.groups[0].count),...pinIndices.slice(pg.groups[2].start)]);pg.clearGroups();const dummy=new T.Object3D();function pinMesh(list,m){const mesh=new T.InstancedMesh(pg,m,list.length);mesh.name=m===M.glow?'Visitor mark pins':'White pin field and athlete relief';world.add(mesh);return mesh;}const wp=pinMesh(whitePins,M.white),vp=pinMesh(markPins,M.white);function updatePins(mesh,list,t=0){list.forEach((p,i)=>{const dep=mesh===vp?.035+t*(p.signatureDepth??.115):p.depth;dummy.position.set(p.x,p.h,-23.62-dep/2);dummy.rotation.set(Math.PI/2,0,0);dummy.scale.set(1,dep,1);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.instanceMatrix.needsUpdate=true;}vp.name='Visitor relief — illustrative local mark';box(6,23.595,.25,10.2,.04,3.2,M.felt);for(const x of [.86,11.14])box(x,23.66,.17,.1,.13,3.32,M.dark);for(const h of [.17,3.43]){box(6,23.66,h,10.38,.13,.075,M.dark);box(6,23.77,h+.02,10.1,.04,.025,M.light);}updatePins(wp,whitePins);updatePins(vp,markPins);cyl(6,25.5,.005,.6,.025,M.black);const padRing=ring(6,25.5,.04,.6);padRing.visible=false;
// Deterministic city and assumed landmark, at 40 m below floor datum.
let seed=47;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
box(-200,20,-42,1500,1500,1,mat('#53604b'));const cityMat=mat('#777876');for(let i=0;i<180;i++){const a=rand()*Math.PI*2,r=100+rand()*500,x=25+Math.cos(a)*r,y=32+Math.sin(a)*r;if(x<0&&x>-350&&Math.abs(y-32)<110)continue;let h=15+rand()*45;box(x,y,-40,10+rand()*25,10+rand()*25,h,cityMat);if(i%3===0)box(x,y,-40+h-.5,8,8,.1,M.light);}
const landmark=buildLandmark(world);for(let i=0;i<100;i++){let a=rand()*Math.PI*2,r=80+rand()*400,x=25+Math.cos(a)*r,y=32+Math.sin(a)*r;if(x<0&&x>-240&&Math.abs(y-32)<60)continue;cyl(x,y,-41,.65,6,M.dark);ell(x,y,-35.5,8,6,8,M.green);}
const hemi=new T.HemisphereLight('#e2d4d1','#615a49',2.2);scene.add(hemi);const sun=new T.DirectionalLight('#ffdfb1',3);sun.position.set(-80,40,30);scene.add(sun);for(const [x,y] of [[31,40],[23,38],[10,38],[6,29],[51,33],[51,43]]){const l=new T.PointLight('#ffe1b4',28,18,2);l.position.set(x,3,-y);scene.add(l);}
// Sky is a gradient sphere excluded from GLB export.
const sky=new T.Mesh(new T.SphereGeometry(1100,24,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{top:{value:new T.Color('#626c91')},bottom:{value:new T.Color('#eebd9e')}},vertexShader:'varying vec3 v; void main(){v=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 v; uniform vec3 top; uniform vec3 bottom; void main(){float h=smoothstep(-.08,.65,normalize(v).y);gl_FragColor=vec4(mix(bottom,top,h),1.);}'}));scene.add(sky);
const threshold=await upgradeThreshold({scene,world,renderer,M,floor,sky,hemi,sun,colliders});
const branding=await addBranding(world,M);
const programme=buildProgramme({world,scene,M,colliders,tiers,mats,stage,arenaRing});
let daylight=false,event=true;function light(day){daylight=day;sky.material.uniforms.top.value.set(day?'#8dbcd2':'#626c91');sky.material.uniforms.bottom.value.set(day?'#e5e3d6':'#eebd9e');hemi.intensity=day?3:2.2;sun.intensity=day?3.8:3;sun.color.set(day?'#fff4df':'#ffdfb1');$('#day').classList.toggle('selected',day);$('#dusk').classList.toggle('selected',!day);threshold.lighting(day);landmark.lighting(day);}
$('#quality').onclick=()=>{threshold.setQuality(!threshold.cinematic);$('#quality').textContent=threshold.cinematic?'Quality: Cinematic':'Quality: Lightweight';};
$('#reference-view').onclick=()=>setReviewShot(0);
let reviewShot=0;
function setReviewShot(index){reviewShot=index;const views=[[31.4,39,33.1,44.4,'Threshold'],[31.4,30,31.4,40,'Arrival'],[4.5,35.1,-250,32,'Landmark'],[31.45,33.0,31.45,39,'Entrance logos'],[11.55,30.75,1.65,31.5,'Arena back tier'],[24,38.7,24,37,'Lab detail'],[6,27.5,6,23.5,'Imprint detail'],[13.3,34.6,16.5,31.5,'Workshop detail'],[14.5,28.8,15.2,25,'Studio detail'],[5.2,34.5,1.65,31.5,'Culture night'],[6,32,11.8,30.5,'Everyday storage']];const v=views[index];jump(0);if(index>=9)experience.setArenaMode(index===9?'culture':'everyday');rig.position.set(v[0],0,index===3&&innerWidth<600?-30:-v[1]);lookAt(innerWidth<600&&index===0?35.5:v[2],innerWidth<600&&index===0?43:v[3]);pitch=index===4?-.25:-.035;camera.rotation.x=pitch;camera.fov=index===3?80:index===2?55:innerWidth<600?75:65;camera.updateProjectionMatrix();$('#shot').textContent='View: '+v[4]+' ↔';}
$('#shot').onclick=()=>setReviewShot((reviewShot+1)%11);
let brandView=0;function showBrandView(i){brandView=i;if(i===0)setReviewShot(3);else{const v=[null,[24,39.2,25.2,35.5,2.38],[7.2,31.5,2.965,31.5,.156],[49,42.4,45.87,42.4,2.84]][i];jump(i===1?1:i===2?2:0);rig.position.set(v[0],0,-v[1]);lookAt(v[2],v[3]);pitch=Math.atan2(v[4]-1.6,Math.hypot(v[2]-v[0],v[3]-v[1]));camera.rotation.x=pitch;}$('#branding-view').textContent='Brand: '+['Entrance','Lab','Arena','Suite'][i]+' ↔';}$('#branding-view').onclick=()=>showBrandView((brandView+1)%4);

$('#clean').onclick=()=>document.body.classList.add('clean');$('#restore-ui').onclick=()=>document.body.classList.remove('clean');
$('#day').onclick=()=>light(true);$('#dusk').onclick=()=>light(false);$('#mode').onclick=()=>{event=!['launch','talk','sellin','culture'].includes(programme.arenaMode);experience.setArenaMode(event?'launch':'everyday');};
let pointerTravel=0;let yaw=0,pitch=0,walking=false,overview=false,mark=0,markSaved=false,drag=false,lastX=0,lastY=0,tour=null;const keys=new Set(),clock=new T.Clock();const stops=[[31.4,30,31.4,40],[24,39.2,23.2,37],[6,26.8,6,23.5],[9,40,-250,32]];
function lookAt(x,y){const dir=new T.Vector3(x-rig.position.x,0,-y-rig.position.z);yaw=Math.atan2(-dir.x,-dir.z);pitch=0;rig.rotation.y=yaw;camera.rotation.set(0,0,0);}
function jump(i){threshold.reflector.visible=threshold.cinematic&&!renderer.xr.isPresenting;camera.fov=65;camera.updateProjectionMatrix();world.traverse(o=>{if(o.userData.roof)o.visible=true;});walking=true;overview=false;document.body.classList.add('walking');const s=stops[i];rig.position.set(s[0],0,-s[1]);camera.position.set(0,renderer.xr.isPresenting?0:1.6,0);lookAt(s[2],s[3]);$('.journey .active')?.classList.remove('active');$(`[data-stop="${i}"]`).classList.add('active');tour=null;}
function goTo(x,y,tx=x,ty=y+1){jump(0);rig.position.set(x,0,-y);lookAt(tx,ty);}
function restoreMark(seed){mark=seed==null?0:1;markSaved=seed!=null;if(seed!=null)experience.applySeed(seed);vp.material=seed==null?M.white:M.glow;padRing.visible=seed!=null;updatePins(vp,markPins,mark);}
const experience=createExperience({world,scene,renderer,rig,camera,shoes,threshold,programme,M,markPins,visitorPins:vp,padRing,goTo,onLift:lift,onReplayMark:()=>restoreMark(null),onRestoreMark:restoreMark,onShowcaseMark:()=>{vp.material=M.glow;updatePins(vp,markPins,1);},notify:toast});
if(experience.savedMark)restoreMark(experience.savedMark.seed);
rig.position.set(31.4,0,-30);lookAt(31.4,40); // exact specified spawn
// Landing camera uses the same model; Start restores the exact CAD spawn.
rig.position.set(31.45,0,innerWidth<600?-30:-33);lookAt(31.45,39);pitch=-.035;camera.rotation.x=pitch;camera.fov=80;camera.updateProjectionMatrix();
$('#begin').onclick=()=>experience.start();document.querySelectorAll('[data-stop]').forEach(b=>b.onclick=()=>jump(Number(b.dataset.stop)));$('#overview').onclick=()=>{threshold.reflector.visible=false;world.traverse(o=>{if(o.userData.roof || (o.isMesh && o.position.y>=3.45 && o.position.y<4 && !o.isInstancedMesh)){o.userData.roof=true;o.visible=false;}});overview=true;walking=true;document.body.classList.add('walking');rig.position.set(30,30,-13);camera.position.set(0,1.6,0);lookAt(28,36);pitch=-1;camera.rotation.x=pitch;toast('Floor plan view · choose a journey stop to return');};
$('#help').onclick=()=>$('#controls').showModal();$('#close-help').onclick=()=>$('#controls').close();function toast(s){$('#toast').textContent=s;$('#toast').style.opacity=1;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').style.opacity=0,4000);}
function inside(x,y){let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){let a=poly[i],b=poly[j];if((a[1]>y)!=(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit||(x>29.75&&x<33.1&&y>15&&y<35.5)||(x>44.9&&x<46.05&&y>29.08&&y<30.12);}
function valid(x,y){const door=programme.doorCollider;return inside(x,y)&&![...colliders,...(door?[door]:[])].some(([a,b,c,d])=>x>a-.2&&x<b+.2&&y>c-.2&&y<d+.2);}
function move(dx,dz){let x=rig.position.x+dx,y=-rig.position.z;if(valid(x,y))rig.position.x=x;y=-rig.position.z-dz;if(valid(rig.position.x,y))rig.position.z+=dz;}
window.addEventListener('keydown',e=>{if($('#controls').open||e.target.closest?.('input,select,textarea,[contenteditable]'))return;keys.add(e.code);if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();if(e.code==='KeyE')interact();if(e.code==='KeyH')document.body.classList.toggle('clean');});window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{keys.clear();drag=false;});const cv=renderer.domElement;cv.addEventListener('pointerdown',e=>{drag=true;pointerTravel=0;lastX=e.clientX;lastY=e.clientY;cv.setPointerCapture(e.pointerId);});cv.addEventListener('pointermove',e=>{if(!drag)return;pointerTravel+=Math.abs(e.clientX-lastX)+Math.abs(e.clientY-lastY);yaw-=(e.clientX-lastX)*.003;pitch=Math.max(-1.4,Math.min(1.4,pitch-(e.clientY-lastY)*.003));rig.rotation.y=yaw;camera.rotation.x=pitch;lastX=e.clientX;lastY=e.clientY;});cv.addEventListener('pointerup',()=>{drag=false;});cv.addEventListener('pointercancel',()=>{drag=false;});cv.addEventListener('click',()=>{if(walking&&pointerTravel<8)interact();});$('#touch-forward').onpointerdown=e=>{keys.add('KeyW');e.target.setPointerCapture(e.pointerId)};$('#touch-forward').onpointerup=()=>keys.delete('KeyW');$('#touch-forward').onpointercancel=()=>keys.delete('KeyW');
function lift(s){s.until=performance.now()+30000;s.shoe.position.y=1.13;s.halo.visible=true;s.layers.forEach(l=>l.visible=false);s.cardPhase=-1;experience.onProductLift(s);toast('Lift to learn · 0 / 5 / 20-second construction story');}
function interact(){const p=renderer.xr.isPresenting?renderer.xr.getCamera().getWorldPosition(new T.Vector3()):rig.position;if(experience.interactAt(p))return;const s=shoes.map(s=>({shoe:s,distance:Math.hypot(s.x-p.x,s.y+p.z)})).filter(a=>a.distance<2.8).sort((a,b)=>a.distance-b.distance)[0]?.shoe;if(s)lift(s);else if(Math.hypot(p.x-6,p.z+25.5)<2&&!markSaved){experience.recordMark();markSaved=true;}else toast('Walk up to a plinth, then press E to lift a shoe.');}
$('#map').onclick=e=>{const svg=$('#map'),p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const q=p.matrixTransform(svg.getScreenCTM().inverse());if(valid(q.x,q.y)){walking=true;overview=false;document.body.classList.add('walking');rig.position.set(q.x,0,-q.y);camera.position.y=1.6;pitch=0;camera.rotation.x=0;}};
const questControls = createQuestControls({
  renderer, scene, rig, valid,
  move: (dx, dz, head) => {
    if (valid(head.x + dx, -head.z - dz)) move(dx, dz);
  },
  floorHeight: (x, y) => programme.floorHeightAt(x, y),
  interact: controller => experience.controllerInteract(controller),
  actions: [
    ['Discovery Lab', () => { experience.visit('lab'); questControls.reset(); }],
    ['Community Arena', () => { experience.visit('arena'); questControls.reset(); }],
    ['Imprint Wall', () => { experience.visit('imprint'); questControls.reset(); }],
    ['Creator Studio', () => { experience.visit('studio'); questControls.reset(); }]
  ],
  onTurn: angle => { yaw = angle; }
});
const vr = VRButton.createButton(renderer);
vr.hidden = true;
document.body.append(vr);
if (navigator.xr) navigator.xr.isSessionSupported('immersive-vr').then(supported => { vr.hidden = !supported; }).catch(() => { vr.hidden = true; });
let desktopCinematic;
renderer.xr.addEventListener('sessionstart', () => {
  desktopCinematic = threshold.cinematic;
  threshold.setQuality(false);
  jump(0);
  camera.position.y = 0;
  keys.clear();
  questControls.reset();
});
renderer.xr.addEventListener('sessionend', () => {
  questControls.reset();
  threshold.setQuality(desktopCinematic);
  camera.position.set(0, 1.6, 0);
});
$('#export').onclick=async()=>{const b=$('#export');b.disabled=true;b.textContent='Exporting…';let restoreExport;try{restoreExport=experience.prepareExport();const glb=await new GLTFExporter().parseAsync(world,{binary:true,onlyVisible:true});const url=URL.createObjectURL(new Blob([glb],{type:'model/gltf-binary'})),a=document.createElement('a');a.href=url;a.download='Creator-Base-Landmark-v5.glb';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('world.glb exported · metres · Y up');}catch(e){console.error(e);toast('Export failed: '+e.message);}finally{restoreExport?.();b.disabled=false;b.textContent='Export showcase ↗';}};
// Batch static repeated primitives for headset draw-call efficiency.
const dynamic=new Set([...tiers,...mats,stage,arenaRing,padRing,...shoes.flatMap(s=>[s.halo,...s.layers])]);const batches=new Map();for(const o of [...world.children]){if(!o.isMesh||o.isInstancedMesh||dynamic.has(o))continue;const roof=o.position.y>=3.45&&o.position.y<4;const key=o.geometry.uuid+o.material.uuid+roof;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(o);}for(const list of batches.values()){if(list.length<2)continue;const first=list[0],mesh=new T.InstancedMesh(first.geometry,first.material,list.length);mesh.userData.roof=first.position.y>=3.45&&first.position.y<4;mesh.receiveShadow=true;mesh.castShadow=list.some(o=>o.castShadow);list.forEach((o,i)=>{o.updateMatrix();mesh.setMatrixAt(i,o.matrix);world.remove(o);});world.add(mesh);}
let triangles=0;world.traverse(o=>{if(o.isMesh){const g=o.geometry;triangles+=(g.index?g.index.count:g.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);}});$('#stats').textContent=`${Math.round(triangles/1000)}K TRIANGLES / 1:1 MODEL`;window.creatorBase={scene,world,renderer,camera,rig,shoes,triangles,valid,jump,setReviewShot,threshold,branding,programme,experience,landmark,goTo,get mark(){return mark},get daylight(){return daylight},get event(){return ['launch','talk','sellin','culture'].includes(programme.arenaMode)}};
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});$('#loading').style.display='none';
const entryParams=new URLSearchParams(location.search);const entryView=['threshold','arrival','landmark','entrance','tiers','lab','imprint','workshop','studio','culture','everyday'].indexOf(entryParams.get('view'));if(entryView>=0)setReviewShot(entryView);if(entryParams.get('clean')==='1')document.body.classList.add('clean');
renderer.setAnimationLoop(()=>{const dt=Math.min(clock.getDelta(),.05),now=performance.now();if(walking&&!overview&&!renderer.xr.isPresenting){const forward=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0),side=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0),norm=Math.max(1,Math.hypot(forward,side)),speed=dt*1.6/norm;move((-Math.sin(yaw)*forward+Math.cos(yaw)*side)*speed,(-Math.cos(yaw)*forward-Math.sin(yaw)*side)*speed);}
if (renderer.xr.isPresenting && !experience.suspended) questControls.tick(dt);
for(const s of shoes)if(!experience.suspended&&s.until&&s.until<now){s.until=0;s.shoe.position.y=1.13;s.halo.visible=false;s.layers.forEach(l=>l.visible=false);}const p=renderer.xr.isPresenting?renderer.xr.getCamera().getWorldPosition(new T.Vector3()):rig.position;if(!overview&&walking&&!experience.suspended){const height=programme.floorHeightAt(p.x,-p.z);rig.position.y=T.MathUtils.damp(rig.position.y,height,10,dt);}experience.tick(p,dt,{walking,overview});const onPad=!experience.suspended&&!overview&&Math.hypot(p.x-6,p.z+25.5)<.65;if(onPad&&!markSaved){experience.recordMark();markSaved=true;toast('Your effort belongs here. Your mark is taking shape.');}if(!experience.suspended&&markSaved&&mark<1){mark=Math.min(1,mark+dt/4);vp.material=M.glow;updatePins(vp,markPins,mark);padRing.visible=true;}
$('#map-dot').setAttribute('cx',p.x);$('#map-dot').setAttribute('cy',-p.z);const x=p.x,y=-p.z;$('#location').textContent=y<35.47&&x>29&&x<34?'Lift lobby':x>45.83?'Team & partner base':x<12&&y<35.47?'Community Arena':x<18.43?'Fuel & Recovery':x<29?'Discovery Lab':'The Threshold';renderer.render(scene,camera);});
