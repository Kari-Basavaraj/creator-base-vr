import * as T from 'three';
import { HDRLoader } from './vendor/HDRLoader.js';
import { Reflector } from './vendor/Reflector.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

// A local, deterministic art pass. Layout remains in app.js in CAD metres.
export async function upgradeThreshold({scene,world,renderer,M,floor,sky,hemi,sun,colliders}) {
  const art=new T.Group();art.name='Threshold — material and planting study';world.add(art);
  const loader=new T.TextureLoader(), tasks=[],aniso=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  function texture(name,color=false,repeat=[1,1]) {
    let ready;tasks.push(new Promise(resolve=>ready=resolve));const t=loader.load(`./assets/${name}`,loaded=>{ready();if(!color)return;const c=document.createElement('canvas');c.width=c.height=1024;const cx=c.getContext('2d');cx.drawImage(loaded.image,0,0,1024,1024);const data=cx.getImageData(0,0,1024,1024),wood=name.startsWith('wood'),base=wood?[201,166,124]:[205,198,187],contrast=wood?.42:.16,mean=wood?65:135;for(let i=0;i<data.data.length;i+=4){const l=data.data[i]*.2126+data.data[i+1]*.7152+data.data[i+2]*.0722;for(let j=0;j<3;j++)data.data[i+j]=Math.max(0,Math.min(255,base[j]+(l-mean)*contrast));}cx.putImageData(data,0,0);loaded.image=c;loaded.needsUpdate=true;},undefined,e=>{ready();console.warn('Material fallback:',name)});
    t.colorSpace=color?T.SRGBColorSpace:T.NoColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(...repeat);t.anisotropy=aniso;return t;
  }
  const wood=texture('wood_table_001_diff.jpg',true),woodNormal=texture('wood_table_001_nor_gl.jpg'),woodRough=texture('wood_table_001_rough.jpg');
  M.oak.map=wood;M.oak.normalMap=woodNormal;M.oak.normalScale=new T.Vector2(.18,.18);M.oak.roughnessMap=null;M.oak.roughness=.75;M.oak.color.set('#d8cbbc');
  M.dark.map=wood.clone();M.dark.map.needsUpdate=true;M.dark.normalMap=woodNormal;M.dark.normalScale=new T.Vector2(.15,.15);M.dark.roughnessMap=null;M.dark.color.set('#726453');M.dark.roughness=.83;
  M.floor.map=texture('concrete_floor_02_diff.jpg',true,[.32,.32]);M.floor.normalMap=texture('concrete_floor_02_nor_gl.jpg',false,[.32,.32]);M.floor.normalScale=new T.Vector2(.055,.055);M.floor.roughnessMap=texture('concrete_floor_02_rough.jpg',false,[.32,.32]);M.floor.roughnessMap=null;M.floor.roughness=.52;M.floor.color.set('#b0aa9f');M.floor.envMapIntensity=.5;
  // Box UVs are normalized: use a separate material on thin top bands.
  const bandFloor=M.floor.clone();for(const key of ['map','normalMap','roughnessMap']){if(!M.floor[key])continue;bandFloor[key]=M.floor[key].clone();bandFloor[key].repeat.set(2.2,1);bandFloor[key].needsUpdate=true;}
  world.children.filter(o=>o.isMesh&&o.material===M.floor&&o!==floor).forEach(o=>o.material=bandFloor);
  M.concrete.map=M.floor.map;M.concrete.normalMap=M.floor.normalMap;M.concrete.normalScale=new T.Vector2(.1,.1);M.concrete.roughness=.92;
  // Flecked terrazzo, with distinct aggregate sizes rather than uniform dots.
  const tc=document.createElement('canvas');tc.width=tc.height=1024;const ctx=tc.getContext('2d');ctx.fillStyle='#ddd5c7';ctx.fillRect(0,0,1024,1024);
  let state=9011;const random=()=>{state=(state*1664525+1013904223)>>>0;return state/4294967296;};
  for(let i=0;i<16000;i++){let x=random()*1024,y=random()*1024,r=.5+Math.pow(random(),4)*6;ctx.fillStyle=['#a59a87','#70685b','#f3eee3','#beb4a3'][i%4];ctx.beginPath();for(let j=0;j<5;j++){let a=j/5*Math.PI*2;ctx.lineTo(x+Math.cos(a)*r*(.5+random()),y+Math.sin(a)*r*(.5+random()));}ctx.closePath();ctx.fill();}
  M.terra.map=new T.CanvasTexture(tc);M.terra.map.colorSpace=T.SRGBColorSpace;M.terra.map.anisotropy=aniso;M.terra.color.set('#c9c1b5');M.terra.roughness=.66;M.terra.envMapIntensity=.3;
  Object.values(M).forEach(m=>m.needsUpdate=true);

  // Environment used for light/reflections only. The visible city remains Bangalore massing.
  let env=null,skyHDR=null;
  try {const hdr=await new HDRLoader().loadAsync('./assets/sunset.hdr');skyHDR=hdr;hdr.mapping=T.EquirectangularReflectionMapping;const pmrem=new T.PMREMGenerator(renderer);env=pmrem.fromEquirectangular(hdr);scene.environment=env.texture;scene.environmentIntensity=.55;pmrem.dispose();}catch(e){console.warn('HDR fallback:',e.message);}
  renderer.toneMappingExposure=.82;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  hemi.color.set('#c4bacc');hemi.groundColor.set('#564333');hemi.intensity=.5;
  sun.color.set('#f8d6b6');sun.intensity=1.05;sun.position.set(-85,24,-83);sun.target.position.set(30,0,-40);scene.add(sun.target);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-24,right:24,top:14,bottom:-14,near:1,far:180});sun.shadow.bias=-.0003;sun.shadow.normalBias=.025;sun.shadow.camera.updateProjectionMatrix();
  scene.fog=new T.FogExp2('#7d8395',.0011);
  for(const o of scene.children)if(o.isPointLight){o.color.set('#ffe1bb');o.intensity=11;}
  const interiorLights=[];
  for(const [x,y,power,spread] of [[30.3,38,16,.75],[32.6,38,16,.75],[31.3,41.1,34,1],[35.5,43,25,.8],[38.5,40,30,1],[26.5,39,26,1],[21,39,26,1]]){
    const light=new T.SpotLight('#ffe2bc',power,10,spread,.95,1.4);light.position.set(x,3.34,-y);light.target.position.set(x,.05,-y);scene.add(light,light.target);interiorLights.push(light);
  }
  // Portal header and shadow gaps respect the 3.2 m portal height in the CAD spec.
  const boxGeo=new T.BoxGeometry(1,1,1),roundGeo=new RoundedBoxGeometry(1,1,1,2,.065),cylGeo=new T.CylinderGeometry(1,1,1,12);
  function box(x,y,z,w,d,h,m=M.dark){const o=new T.Mesh(boxGeo,m);o.position.set(x,z+h/2,-y);o.scale.set(w,h,d);art.add(o);return o;}
  function cylinder(x,y,z,r,h,m=M.dark){const o=new T.Mesh(cylGeo,m);o.position.set(x,z+h/2,-y);o.scale.set(r,h,r);art.add(o);return o;}
  box(31.45,37.5,3.05,4.8,4,.15);box(29.37,37.5,.015,.035,4,.02,M.black);box(33.53,37.5,.015,.035,4,.02,M.black);
  for(const x of [29.37,33.53]){box(x,37.5,2.87,.018,3.6,.025,M.light);for(let y=35.55;y<39.5;y+=.38)box(x,y,.06,.012,.008,2.8,M.black);}
  for(const [x,y] of [[30,40.5],[32.5,40.5],[35,40.5],[37.5,40.5],[40,40.5],[42.5,40.5]]){cylinder(x,y,3.44,.075,.025,M.black);cylinder(x,y,3.432,.048,.015,M.light);}

  // Replace the angular line with a continuous 80 mm strip and layered falloff.
  for(const o of [...world.children])if(o.isMesh&&o.material===M.glow&&o.geometry.type==='BoxGeometry'&&o.position.y<.04)world.remove(o);
  const route=new T.CurvePath();const p=(x,y)=>new T.Vector3(x,.022,-y);
  route.add(new T.LineCurve3(p(31.4,30),p(31.4,41.4)));
  route.add(new T.CubicBezierCurve3(p(31.4,41.4),p(31.4,42.5),p(30.28,43.2),p(28.9,43.2)));
  route.add(new T.LineCurve3(p(28.9,43.2),p(18.6,43.2)));
  const points=route.getPoints(200);
  function ribbon(width,material){const v=[],uv=[],indices=[];points.forEach((p,i)=>{const before=points[Math.max(i-1,0)],after=points[Math.min(i+1,points.length-1)],dx=after.x-before.x,dz=after.z-before.z,l=Math.hypot(dx,dz),nx=-dz/l*width/2,nz=dx/l*width/2;v.push(p.x+nx,p.y,p.z+nz,p.x-nx,p.y,p.z-nz);uv.push(i/200,0,i/200,1);if(i<points.length-1){const j=i*2;indices.push(j,j+2,j+1,j+1,j+2,j+3);}});const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();const o=new T.Mesh(g,material);o.name='Visitor light — curved route';art.add(o);return o;}
  const strip=ribbon(.08,new T.MeshBasicMaterial({color:'#ff662c',toneMapped:false,side:T.DoubleSide}));
  const gc=document.createElement('canvas');gc.width=4;gc.height=128;const gx=gc.getContext('2d'),gg=gx.createLinearGradient(0,0,0,128);gg.addColorStop(0,'rgba(255,255,255,0)');gg.addColorStop(.5,'rgba(255,255,255,1)');gg.addColorStop(1,'rgba(255,255,255,0)');gx.fillStyle=gg;gx.fillRect(0,0,4,128);const glowTexture=new T.CanvasTexture(gc);const glowMaterials=[];for(const [w,alpha] of [[.16,.14],[.3,.065],[.6,.025]]){const material=new T.MeshBasicMaterial({color:'#ff5a1f',map:glowTexture,transparent:true,opacity:alpha,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending});glowMaterials.push(material);const o=ribbon(w,material);o.position.y=.001;}
  const startMarker=box(31.45,36,.024,3.7,.08,.008,M.light);

  // Local contact-shadow stamps remain available in VR and standard GLB viewers.
  const ac=document.createElement('canvas');ac.width=ac.height=128;const ax=ac.getContext('2d'),ag=ax.createRadialGradient(64,64,7,64,64,64);ag.addColorStop(0,'rgba(27,21,16,.45)');ag.addColorStop(.38,'rgba(27,21,16,.24)');ag.addColorStop(1,'rgba(27,21,16,0)');ax.fillStyle=ag;ax.fillRect(0,0,128,128);
  const aoTex=new T.CanvasTexture(ac),aoMat=new T.MeshBasicMaterial({map:aoTex,transparent:true,opacity:.8,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});const planeGeo=new T.PlaneGeometry(1,1);
  function contact(x,y,w,d,opacity=1){const o=new T.Mesh(planeGeo,aoMat);o.position.set(x,.018,-y);o.rotation.x=-Math.PI/2;o.scale.set(w,d,1);o.userData.contact=true;art.add(o);return o;}
  for(const [a,b,c,d] of colliders)if(a>18&&b<46&&c>35&&d<46)contact((a+b)/2,(c+d)/2,(b-a)+1.1,(d-c)+1.1);
  for(const [x,y,r] of [[35.5,43,1.2],[38.3,38.5,.4],[44.5,43.8,.4],[21,41.3,.3],[25,41.3,.3]])contact(x,y,r*4,r*4);

  // Leaves use instanced, double-sided cards with an alpha-tested botanical atlas.
  const lc=document.createElement('canvas');lc.width=256;lc.height=128;const lx=lc.getContext('2d'),lg=lx.createLinearGradient(0,0,256,128);lg.addColorStop(0,'#75804a');lg.addColorStop(.5,'#3e592e');lg.addColorStop(1,'#263e20');lx.fillStyle=lg;lx.beginPath();lx.moveTo(2,64);lx.bezierCurveTo(95,-12,193,5,254,64);lx.bezierCurveTo(175,131,80,127,2,64);lx.fill();lx.strokeStyle='#82915a';lx.lineWidth=1.5;lx.beginPath();lx.moveTo(4,64);lx.lineTo(251,64);lx.stroke();lx.strokeStyle='#79935b66';lx.lineWidth=.6;for(let x=24;x<240;x+=15){lx.beginPath();lx.moveTo(x,64);lx.lineTo(x+19,28);lx.moveTo(x,64);lx.lineTo(x+19,100);lx.stroke();}
  const leafTex=new T.CanvasTexture(lc);leafTex.colorSpace=T.SRGBColorSpace;leafTex.anisotropy=aniso;const leafMat=new T.MeshStandardMaterial({map:leafTex,side:T.DoubleSide,alphaTest:.35,roughness:.85,color:'#dce3cb',emissive:'#536b36',emissiveIntensity:.12,envMapIntensity:.35});
  const bark= new T.MeshStandardMaterial({map:wood,color:'#5e4a37',roughness:.96}),soil=new T.MeshStandardMaterial({color:'#302b21',roughness:1});
  const leafItems=[],branchItems=[];
  function branch(a,b,r){const mid=a.clone().add(b).multiplyScalar(.5),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),b.clone().sub(a).normalize());branchItems.push({pos:mid,q,scale:new T.Vector3(r,a.distanceTo(b),r*.85)});}
  function leaf(pos,size=.16){const q=new T.Quaternion().setFromEuler(new T.Euler(random()*2.4-.8,random()*Math.PI*2,random()*Math.PI*2));leafItems.push({pos,q,scale:new T.Vector3(size,size*.43,1),shade:.75+random()*.35});}
  function tree(x,y,h=2.5){const base=new T.Vector3(x,.44,-y),top=new T.Vector3(x+.12,h*.7,-y-.06);branch(base,top,.045);for(let i=0;i<10;i++){const angle=i*2.4+random()*.4,start=base.clone().lerp(top,.4+random()*.5),tip=new T.Vector3(x+Math.cos(angle)*(.3+random()*.4),h*(.65+random()*.3),-y+Math.sin(angle)*(.3+random()*.4));branch(start,tip,.012+random()*.008);for(let j=0;j<6;j++){const dir=angle+j*1.7,twig=tip.clone().add(new T.Vector3(Math.cos(dir)*.25,(random()-.2)*.3,Math.sin(dir)*.25));branch(start.clone().lerp(tip,.65),twig,.004);for(let k=0;k<25;k++)leaf(twig.clone().add(new T.Vector3((random()-.5)*.38,(random()-.5)*.3,(random()-.5)*.38)),.13+random()*.06);}}}
  function fern(x,y,h=.55){for(let i=0;i<16;i++){const a=i*2.4,extent=.35+random()*.23;let prev=new T.Vector3(x,.46,-y);for(let j=1;j<=12;j++){const t=j/12,p=new T.Vector3(x+Math.cos(a)*extent*t,.46+h*Math.sin(t*Math.PI*.8),-y+Math.sin(a)*extent*t);branch(prev,p,.002);prev=p;for(const side of [-1,1]){const off=new T.Vector3(-Math.sin(a)*side*.09*(1-t*.6),.015,Math.cos(a)*side*.09*(1-t*.6));leaf(p.clone().add(off),.075*(1-t*.5));}}}}
  const plantPositions=[[35.5,43],[38.3,38.5],[44.5,43.8],[21,41.3],[25,41.3]];
  for(const o of [...world.children])if(o.isMesh&&o.position.y>0&&plantPositions.some(([x,y])=>Math.hypot(o.position.x-x,o.position.z+y)<.55)&&((o.material===M.green)||(o.material===M.dark&&o.geometry.type==='CylinderGeometry'&&o.scale.x<.1)))world.remove(o);
  for(const o of [...world.children])if(o.isMesh&&o.material===M.terra&&Math.hypot(o.position.x-35.5,o.position.z+43)<.01)world.remove(o);
  const benchShape=new T.Shape();benchShape.absarc(0,0,1.2,0,Math.PI*2,false);const hole=new T.Path();hole.absarc(0,0,.62,0,Math.PI*2,true);benchShape.holes.push(hole);const bench=new T.Mesh(new T.ExtrudeGeometry(benchShape,{depth:.42,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.025,bevelThickness:.015,curveSegments:48}),M.terra);const bp=bench.geometry.attributes.position,bn=bench.geometry.attributes.normal,bu=bench.geometry.attributes.uv;for(let i=0;i<bp.count;i++){const x=bp.getX(i),y=bp.getY(i),z=bp.getZ(i);if(Math.abs(bn.getZ(i))>.6)bu.setXY(i,(x+1.2)/2.4,(y+1.2)/2.4);else bu.setXY(i,(Math.atan2(y,x)+Math.PI)/Math.PI*2,z*2);}bu.needsUpdate=true;bench.rotation.x=-Math.PI/2;bench.position.set(35.5,.025,-43);art.add(bench);cylinder(35.5,43,.4,.62,.035,soil);tree(35.5,43,2.55);fern(35.5,43,.32);tree(38.3,38.5,2);tree(44.5,43.8,2.2);for(const [x,y] of plantPositions.slice(3))fern(x,y,.37);
  for(const [items,geometry,material,name] of [[leafItems,planeGeo,leafMat,'Instanced botanical leaves'],[branchItems,cylGeo,bark,'Instanced branches and fern stems']]){const mesh=new T.InstancedMesh(geometry,material,items.length);mesh.name=name;const d=new T.Object3D();items.forEach((v,i)=>{d.position.copy(v.pos);d.quaternion.copy(v.q);d.scale.copy(v.scale);d.updateMatrix();mesh.setMatrixAt(i,d.matrix);if(v.shade)mesh.setColorAt(i,new T.Color(v.shade,v.shade,v.shade));});mesh.castShadow=true;mesh.receiveShadow=true;art.add(mesh);}
  // Rounded upholstery is limited to the Threshold-adjacent welcome furniture.
  for(const o of world.children)if(o.isMesh&&o.material===M.felt&&o.geometry.type==='BoxGeometry'&&o.position.x>37&&o.position.x<45&&o.position.z<-41&&o.position.z>-44){o.geometry=roundGeo;o.material=M.felt.clone();o.material.roughness=1;}

  // Keep the supplied 180×60 m landmark massing; add readable architectural rhythm.
  const landmark=new T.Group();landmark.name='Vidhana Soudha — assumed detailed massing';world.add(landmark);
  const stone=new T.MeshStandardMaterial({color:'#c5b394',roughness:.9,emissive:'#cbb18b',emissiveIntensity:.12}),recess=new T.MeshStandardMaterial({color:'#5d5247',roughness:1}),warmWindow=new T.MeshBasicMaterial({color:'#d6bd87',toneMapped:true});
  function landmarkBox(x,y,z,w,d,h,m=stone){const o=new T.Mesh(boxGeo,m);o.position.set(x,z+h/2,-y);o.scale.set(w,h,d);landmark.add(o);return o;}
  for(const z of [-36,-25,-16,-14])landmarkBox(-249,32,z,63,182,.7);for(let y=-51;y<116;y+=9){landmarkBox(-219.3,y,-40,1.4,2.4,25);landmarkBox(-218.4,y,-16,1.2,4,.8);landmarkBox(-219,y,-30,.1,2.5,7,recess);landmarkBox(-218.9,y,-28,.12,1.2,4,warmWindow);}
  for(let y=-54;y<120;y+=4.5)landmarkBox(-219,y,-14,1,1.1,2.3);for(const y of [-40,32,104]){for(const z of [-17,-14,-10])landmarkBox(-250,y,z,34,28,.65);}
  const ribMat=new T.MeshStandardMaterial({color:'#cfbc95',emissive:'#c9aa74',emissiveIntensity:.15,roughness:.7});
  for(const [cy,rx,ry,base] of [[32,12,7,3],[-40,6,4,-5],[104,6,4,-5]]){for(let j=0;j<16;j++){const a=j/16*Math.PI*2,pts=[];for(let k=0;k<=12;k++){let t=k/12*Math.PI/2;pts.push(new T.Vector3(-250+Math.cos(a)*rx*Math.sin(t),base+ry*Math.cos(t),-cy+Math.sin(a)*rx*Math.sin(t)));}landmark.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),12,.13,4,false),ribMat));}}
  // Small warm-white city windows make distance legible without extra lights.
  const windows=[];for(const o of world.children){if(!o.isMesh||o.geometry.type!=='BoxGeometry'||o.position.y>=0||o.scale.y<15||o.position.x>80||o.position.x<-500||o.scale.x>45)continue;const h=o.scale.y,xx=o.position.x+o.scale.x/2+.04,yy=o.position.y-h/2;for(let j=3;j<h-2;j+=4)for(let z=-o.scale.z/2+2;z<o.scale.z/2-1;z+=3.3)if(random()>.4)windows.push({p:[xx,yy+j,o.position.z+z],a:Math.PI/2});for(let j=3;j<h-2;j+=4)for(let x=-o.scale.x/2+2;x<o.scale.x/2-1;x+=3.3)if(random()>.4)windows.push({p:[o.position.x+x,yy+j,o.position.z+o.scale.z/2+.04],a:0});}
  const cityWindows=new T.InstancedMesh(planeGeo,new T.MeshBasicMaterial({color:'#d0bd93',transparent:true,opacity:.65}),windows.length);cityWindows.name='Warm-white city windows';const wd=new T.Object3D();windows.forEach((v,i)=>{wd.position.set(...v.p);wd.rotation.y=v.a;wd.scale.set(.85,1.2,1);wd.updateMatrix();cityWindows.setMatrixAt(i,wd.matrix);cityWindows.setColorAt(i,new T.Color(.55+random()*.45,.48+random()*.3,.3+random()*.25));});world.add(cityWindows);
  // A façade atlas adds window reveals, spandrels and dusk reflections at zero geometry cost.
  const facadeCanvas=document.createElement('canvas'),emissionCanvas=document.createElement('canvas');facadeCanvas.width=emissionCanvas.width=1024;facadeCanvas.height=emissionCanvas.height=2048;
  const fx=facadeCanvas.getContext('2d'),ex=emissionCanvas.getContext('2d');fx.fillStyle='#777877';fx.fillRect(0,0,1024,2048);ex.fillStyle='#000';ex.fillRect(0,0,1024,2048);
  for(let row=0;row<20;row++)for(let col=0;col<10;col++){const x=col*102.4+13,y=row*102.4+13,lit=random()>.83;fx.fillStyle='#444c54';fx.fillRect(x-3,y-3,79,76);const g=fx.createLinearGradient(x,y,x+70,y+71);g.addColorStop(0,lit?'#a69d85':'#8b8b97');g.addColorStop(.5,lit?'#d0bf98':'#626d7c');g.addColorStop(1,lit?'#8c8676':'#404955');fx.fillStyle=g;fx.fillRect(x,y,71,65);fx.fillStyle='#81817d';fx.fillRect(x+34,y,2,65);fx.fillStyle='#b2aba0';fx.fillRect(x-4,y+67,80,3);if(lit){ex.fillStyle='#c0ac83';ex.fillRect(x,y,71,65);}fx.fillStyle='#555d61';fx.fillRect(col*102.4,row*102.4+95,102.4,5);}
  const facadeMap=new T.CanvasTexture(facadeCanvas),emissionMap=new T.CanvasTexture(emissionCanvas);facadeMap.colorSpace=T.SRGBColorSpace;emissionMap.colorSpace=T.SRGBColorSpace;facadeMap.anisotropy=aniso;const facadeMaterial=new T.MeshStandardMaterial({map:facadeMap,emissiveMap:emissionMap,emissive:'#fff2cc',emissiveIntensity:.55,roughness:.68,envMapIntensity:.3,color:'#8a8b95'});
  for(const o of world.children)if(o.isMesh&&o.material?.color?.getHexString()==='777876')o.material=facadeMaterial;
  // Atlas illumination replaces detached square lights, which otherwise float over windows.
  world.remove(cityWindows);


  // Shader sky: lilac/peach dusk with layered, softly broken cloud bands.
  sky.material.vertexShader='varying vec3 v; void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
  sky.material.fragmentShader=`varying vec3 v;uniform vec3 top;uniform vec3 bottom;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
    float fbm(vec2 p){return noise(p)*.55+noise(p*2.1)*.27+noise(p*4.3)*.13+noise(p*8.1)*.05;}
    void main(){vec3 n=normalize(v);float h=smoothstep(-.02,.7,n.y);vec3 c=mix(bottom,top,h);vec2 p=vec2(atan(n.z,n.x)*4.,n.y*18.);float cloud=smoothstep(.43,.7,fbm(p+vec2(fbm(p*.5),0.)));float band=smoothstep(-.04,.12,n.y)*(1.-smoothstep(.35,.7,n.y));c=mix(c,mix(bottom*.83,top*.7,.55),cloud*band*.7);gl_FragColor=vec4(c,1.);#include <tonemapping_fragment>\n#include <colorspace_fragment>}`;
  // Include directives need to begin on a new line for WebGL preprocessing.
  sky.material.fragmentShader=sky.material.fragmentShader.replace(';#include',';\n#include');if(skyHDR){sky.material.uniforms.sunsetSky={value:skyHDR};sky.material.fragmentShader='uniform sampler2D sunsetSky;\n'+sky.material.fragmentShader;sky.material.fragmentShader=sky.material.fragmentShader.replace('gl_FragColor=vec4(c,1.);','vec2 suv=vec2(fract(atan(n.z,n.x)/6.2831853+.5),clamp(.56+asin(n.y)/3.14159265,.56,.99));vec3 photo=texture2D(sunsetSky,suv).rgb;photo=photo/(photo+vec3(1.));c=mix(c,photo*.85+.08,.15);gl_FragColor=vec4(c,1.);');}sky.material.needsUpdate=true;

  // A low-contrast blurred planar reflection is a desktop-only rendering layer.
  const reflector=new Reflector(new T.PlaneGeometry(27.2,9.8),{textureWidth:1024,textureHeight:512,clipBias:.005,multisample:0,color:0xa89c8d});reflector.name='Desktop polished-floor reflection';reflector.rotation.x=-Math.PI/2;reflector.position.set(32.1,.011,-40.47);reflector.material.transparent=true;reflector.material.depthWrite=false;
  reflector.material.fragmentShader=reflector.material.fragmentShader.replace('vec4 base = texture2DProj( tDiffuse, vUv );',`vec2 uv=vUv.xy/vUv.w;vec4 base=texture2D(tDiffuse,uv)*.28;for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)base+=texture2D(tDiffuse,uv+vec2(float(x)*.0025,float(y)*.004))*.08;`).replace('blendOverlay( base.rgb, color ), 1.0','blendOverlay( base.rgb, color ), 0.12');
  scene.add(reflector);
  const arrivalUniform={value:-1};
  for(const material of [strip.material,...glowMaterials]){material.onBeforeCompile=shader=>{shader.uniforms.uArrival=arrivalUniform;shader.vertexShader='varying float vJourneyU;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvJourneyU=uv.x;');shader.fragmentShader='uniform float uArrival;varying float vJourneyU;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','#include <opaque_fragment>\nif(uArrival<0.){gl_FragColor.rgb*=.12;}else{float gate=1.-smoothstep(uArrival-.03,uArrival+.03,vJourneyU);gl_FragColor.rgb*=.08+.92*gate;}');};material.customProgramCacheKey=()=> 'visitor-arrival-v3';material.needsUpdate=true;}
  function setArrival(active,progress=0){arrivalUniform.value=active?.36+.64*progress:-1;strip.material.color.set(active?'#ff662c':'#c8c1b3');glowMaterials.forEach((material,i)=>material.opacity=active?[.14,.065,.025][i]:0);startMarker.material=active?M.glow:M.light;}
  setArrival(false);
  let cinematic=true,isDay=false;
  function setQuality(value){cinematic=value;reflector.visible=value&&!renderer.xr.isPresenting;sun.castShadow=value;renderer.shadowMap.needsUpdate=true;}
  renderer.xr.addEventListener('sessionstart',()=>{reflector.visible=false;sun.castShadow=false;renderer.setPixelRatio(1);});renderer.xr.addEventListener('sessionend',()=>{setQuality(cinematic);renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));});
  function lighting(day){isDay=day;hemi.intensity=day?1.6:.5;sun.intensity=day?2.5:1.05;sun.color.set(day?'#fff1db':'#f8d6b6');scene.environmentIntensity=day?.8:.55;renderer.toneMappingExposure=day?1:.82;scene.fog.color.set(day?'#c1c9c8':'#7d8395');facadeMaterial.emissiveIntensity=day?.08:.55;sky.material.uniforms.top.value.set(day?'#7599b5':'#4e607e');sky.material.uniforms.bottom.value.set(day?'#dfdccc':'#d6a2a0');}
  lighting(false);
  // Receive contact shadows on the entire model; only nearby architecture casts.
  world.traverse(o=>{if(!o.isMesh)return;o.receiveShadow=true;if(o.material.transparent||o.material.emissiveIntensity>1)return;if(o.isInstancedMesh)return;const p=o.getWorldPosition(new T.Vector3());if(p.x>18&&p.x<46&&p.z<-35&&p.z>-46&&p.y<3.45)o.castShadow=true;});floor.receiveShadow=true;
  const report={textureSources:['Poly Haven / wood_table_001','Poly Haven / concrete_floor_02','Poly Haven / venice_sunset'],leaves:leafItems.length,branches:branchItems.length,facadeWindowsPerAtlas:200,quality:'desktop cinematic / XR fallback'};
  await Promise.allSettled(tasks);return {report,reflector,lighting,setQuality,setArrival,get cinematic(){return cinematic},get daylight(){return isDay}};
}
