import {makeFootwear} from './footwear.js?v=detail-v4';
import * as T from 'three';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

// Functional room identity and local ambience. Shell/columns remain in app.js.
export function buildProgramme({world,scene,M,colliders,tiers,mats,stage,arenaRing}) {
 const group=new T.Group();group.name='Programme — work, making and community';world.add(group);
 const cube=new T.BoxGeometry(1,1,1),cylinder=new T.CylinderGeometry(1,1,1,10),plane=new T.PlaneGeometry(1,1),round=new RoundedBoxGeometry(1,1,1,2,.05);
 const graphite=new T.MeshStandardMaterial({color:'#343631',roughness:.9}),cork=new T.MeshStandardMaterial({color:'#9b8a6d',roughness:1}),paper=new T.MeshStandardMaterial({color:'#dedbd2',roughness:.95});
 const fabricCanvas=document.createElement('canvas');fabricCanvas.width=fabricCanvas.height=256;const fabricCtx=fabricCanvas.getContext('2d');fabricCtx.fillStyle='#b8b2a8';fabricCtx.fillRect(0,0,256,256);for(let y=0;y<256;y+=4)for(let x=0;x<256;x+=4){fabricCtx.strokeStyle=(x+y)%8?'#cbc5b950':'#8e897e44';fabricCtx.beginPath();fabricCtx.ellipse(x+1,y+1,1.5,1,0,0,Math.PI*2);fabricCtx.stroke();}const fabricMap=new T.CanvasTexture(fabricCanvas);fabricMap.colorSpace=T.SRGBColorSpace;fabricMap.wrapS=fabricMap.wrapT=T.RepeatWrapping;fabricMap.repeat.set(2,2);const fabric=new T.MeshStandardMaterial({color:'#ffffff',map:fabricMap,roughness:1,envMapIntensity:.2});for(const o of world.children)if(o.isMesh&&!o.isInstancedMesh&&o.material===M.felt&&o.geometry.type==='BoxGeometry'&&o.position.x<18.43&&o.position.z<-35.47&&o.position.z>-45.47){o.geometry=round;o.material=fabric;}
 const textMaterials=[];
 function box(x,y,z,w,d,h,m=M.oak,parent=group,rounded=false){const o=new T.Mesh(rounded?round:cube,m);o.position.set(x,z+h/2,-y);o.scale.set(w,h,d);parent.add(o);o.receiveShadow=true;if(z>=3.4)o.userData.roof=true;return o;}
 function cyl(x,y,z,r,h,m=M.black,parent=group){const o=new T.Mesh(cylinder,m);o.position.set(x,z+h/2,-y);o.scale.set(r,h,r);parent.add(o);return o;}
 function line(a,b,r=.015,m=M.black,parent=group){const o=new T.Mesh(cylinder,m),aa=new T.Vector3(...a),bb=new T.Vector3(...b);o.position.copy(aa).add(bb).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),bb.clone().sub(aa).normalize());o.scale.set(r,aa.distanceTo(bb),r);parent.add(o);return o;}
 function label(text,x,y,h,w=1.2,hh=.15,rotation=0,color='#343a31',parent=group){const c=document.createElement('canvas');c.width=1024;c.height=160;const cx=c.getContext('2d');cx.font='600 96px Arial';cx.fillStyle=color;cx.textAlign='center';cx.textBaseline='middle';cx.fillText(text,512,84,980);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const mat=new T.MeshStandardMaterial({map:tex,transparent:true,alphaTest:.2,roughness:1});textMaterials.push(mat);const o=new T.Mesh(plane,mat);o.scale.set(w,hh,1);o.position.set(x,h,-y);o.rotation.y=rotation;o.name='Printed wayfinding — '+text;parent.add(o);return o;}
 function card(title,lines,x,y,h,w=1.4,hh=.85,rotation=0,parent=group){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=640;const ctx=canvas.getContext('2d');const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;const material=new T.MeshStandardMaterial({map:tex,roughness:.94,metalness:0});const o=new T.Mesh(new T.PlaneGeometry(w,hh),material);o.position.set(x,h,-y);o.rotation.y=rotation;parent.add(o);o.name='Interpretation card — '+title;
   function draw(nextTitle,nextLines){ctx.fillStyle='#e7e3d9';ctx.fillRect(0,0,1024,640);ctx.fillStyle='#283326';ctx.font='600 48px Arial';ctx.fillText(nextTitle.toUpperCase(),48,78,930);ctx.fillStyle='#606651';ctx.font='30px Arial';let yy=140;for(const line of nextLines){const words=String(line).split(' ');let row='';for(const word of words){if(ctx.measureText(row+word).width>900){ctx.fillText(row,48,yy);row='';yy+=43;}row+=word+' ';}ctx.fillText(row,48,yy);yy+=62;}tex.needsUpdate=true;}
   draw(title,lines);return {mesh:o,draw,texture:tex};
 }
 // Local materials make rooms distinct while retaining the shared warm material family.
 box(51.65,31.875,.008,11.62,15.2,.012,M.felt); // quiet office floor
 box(15.2,32.6,.012,5,4.8,.014,graphite); // resilient maker work area
 box(15.2,26.65,3.6,6.4,6.3,.08,M.black).userData.roof=true;box(15.2,32.635,3.6,6.4,5.67,.08,M.dark);for(let x=12.1;x<18.35;x+=.18)box(x,32.635,3.49,.045,5.67,.1,M.oak);
 for(const y of [24.5,25.4,26.3,27.2,28.1])box(15.2,y,3.05,5.6,.07,.3,graphite);
 // Discreetly close the partner range wall; the suite entrance remains on its south edge.
 box(45.755,42.485,0,.15,5.97,3.6,M.felt);colliders.push([45.68,45.83,39.5,45.47]);
 colliders.push([45.83,47,39.44,39.56],[48.5,57.48,39.44,39.56]);
 const frost=new T.MeshStandardMaterial({color:'#d8d8cf',transparent:true,opacity:.58,roughness:.95,depthWrite:false});
 box(46.415,39.49,.55,1.17,.015,1.15,frost);box(52.99,39.49,.55,8.98,.015,1.15,frost);
 const door=new T.Group();door.name='Partner privacy door — proximity opening';door.position.set(47,0,-39.5);group.add(door);
 const panel=new T.Mesh(cube,frost);panel.position.set(.75,1.8,0);panel.scale.set(1.5,3.6,.035);door.add(panel);
 for(const x of [0,1.5]){const frame=new T.Mesh(cube,M.black);frame.position.set(x,1.8,0);frame.scale.set(.03,3.6,.045);door.add(frame);}for(const h of [.04,3.56]){const rail=new T.Mesh(cube,M.black);rail.position.set(.75,h,0);rail.scale.set(1.5,.04,.045);door.add(rail);}
 const handle=new T.Mesh(cube,M.black);handle.position.set(1.35,1.05,.05);handle.scale.set(.035,.3,.035);door.add(handle);let doorOpen=0;
 label('PARTNER / PRIVATE',47.75,39.465,2.65,1.1,.12,0,'#41493b');
 const comparison=card('Compare by purpose',['Shortlist two concepts in the Discovery Lab.','Then compare their intended use, construction and trade-offs.','Illustrative concepts — not measured adidas specifications.'],51.6,42.4,1.13,1.35,.75,-Math.PI/2);
 // Camera-ready studio: backdrop, cameras, microphone booms, softboxes and a discreet AV rack.
 box(15.25,23.67,.15,4.7,.09,2.8,graphite);label('CREATOR STUDIO',15.25,23.73,2.63,2,.2,Math.PI,'#d8d4c8');
 for(const [x,y] of [[14.7,26.2],[15.65,26.6]]){cyl(x,y,.76,.08,.025);line([x,.8,-y],[x,1.23,-y],.014);line([x,1.23,-y],[x+.27,1.37,-y-.12],.012);const mic=cyl(x+.27,y+.12,1.31,.04,.15,graphite);mic.rotation.z=.6;}
 for(const [x,y] of [[13.1,27.2],[17.4,25.7]]){line([x,0,-y],[x,1.8,-y],.018);for(let j=0;j<3;j++){const a=j*2.094;line([x,.2,-y],[x+Math.cos(a)*.35,0,-y+Math.sin(a)*.35],.014);}box(x,y,1.5,.6,.13,.45,M.black);box(x,y+.075,1.53,.55,.025,.38,M.light);}
 const camX=16.8,camY=28.2;line([camX,0,-camY],[camX,1.3,-camY],.025);for(let j=0;j<3;j++){const a=j*2.094;line([camX,.8,-camY],[camX+Math.cos(a)*.4,0,-camY+Math.sin(a)*.4],.018);}box(camX,camY,1.27,.28,.38,.2,M.black);const lens=cyl(camX,camY-.23,1.3,.075,.16,M.black);lens.rotation.x=Math.PI/2;
 const recordingLamp=box(15.2,24.0,2.3,.35,.06,.08,paper);recordingLamp.name='Studio rehearsal indicator';
 box(17.75,28.65,0,.6,.55,1.7,M.black);for(let h=.2;h<1.6;h+=.25){box(17.75,28.345,h,.5,.015,.12,graphite);cyl(17.92,28.32,h+.035,.012,.025,M.white);}label('AV / HOST CONTROL',17.75,28.33,1.85,.8,.1);
 // Workshop: a material library, active pin-up surface and workbench tools.
 box(18.29,32.7,1.25,.09,4.2,1.65,cork);label('MAKE / WITH / THE CREW',18.23,32.7,3.05,2.4,.18,-Math.PI/2,'#e9e3d5');
 const swatches=[M.felt,M.dark,M.oak,M.white,graphite,M.green];swatches.forEach((m,i)=>{box(17.8,30.8+i*.65,.12,.55,.45,.06,m);box(17.8,30.8+i*.65,1.0,.55,.45,.06,m);});
 for(const [x,y] of [[14.8,31.45],[15.7,33.8]]){box(x,y,.91,.55,.35,.03,cork);cyl(x+.18,y,.95,.035,.12,M.black);box(x-.1,y,.96,.25,.035,.018,M.black);box(x,y+.12,.95,.1,.16,.018,M.white);}
 const contributions=[];for(let row=0;row<3;row++)for(let col=0;col<3;col++){
   const tile=card('A space for you',['Choose a material.','Add an illustrative crew mark.'],18.225,31.45+col*.95,1.5+row*.36,.82,.3,-Math.PI/2);contributions.push(tile);
 }
 const makerSample=box(15.2,31.5,.92,.55,.36,.06,M.felt);makerSample.name='Visitor-selected maker sample';
 label('TOUCH / TRY / LEAVE A MARK',15.2,31.8,.912,1.7,.12).rotation.set(-Math.PI/2,0,0);
 // A restrained, replaceable culture layer rather than a permanent graphic mural.
 const culture=[['CITY / 01','Take the long way home.','RUN / REST / RETURN'],['CREW / 02','A place for your point of view.','MAKE / SHARE / RETURN']];culture.forEach(([title,line,words],i)=>{const poster=card(title,[line,words],i?16.8:13,29.96,1.8,i?2.2:1.3,1.0,Math.PI),ctx=poster.texture.image.getContext('2d');ctx.strokeStyle='#62705a';ctx.lineWidth=7;for(let row=0;row<5;row++){ctx.beginPath();for(let step=0;step<10;step++){const x=75+step*95,y=330+row*42+Math.sin(step*.7+row+i)*28;step?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}poster.texture.needsUpdate=true;});

 // Detail pass: original seasonal movement artwork, physical making and product samples.
 const artCanvas=document.createElement('canvas');artCanvas.width=1536;artCanvas.height=768;const ac=artCanvas.getContext('2d');ac.fillStyle='#d9d2bd';ac.fillRect(0,0,1536,768);
 ac.fillStyle='#29382f';for(let i=0;i<5;i++){ac.save();ac.translate(180+i*285,410-i%2*70);ac.rotate(-.25);ac.beginPath();ac.arc(0,-175,35,0,7);ac.fill();ac.lineWidth=48;ac.strokeStyle=i%2?'#637160':'#29382f';ac.lineCap='round';for(const path of [[[0,-125],[-35,-20],[100,75],[155,180]],[[-35,-20],[-130,95],[-215,90]],[[0,-115],[95,-60],[155,-120]],[[0,-100],[-95,-160],[-160,-90]]]){ac.beginPath();path.forEach(([x,y],j)=>j?ac.lineTo(x,y):ac.moveTo(x,y));ac.stroke();}ac.restore();}
 ac.fillStyle='#29382f';ac.font='600 30px Arial';ac.fillText('BENGALURU / MOVEMENT STUDY 01',40,725);const artTex=new T.CanvasTexture(artCanvas);artTex.colorSpace=T.SRGBColorSpace;
 box(11.88,30.5,1.65,.08,4.8,1.7,M.dark);const artwork=new T.Mesh(new T.PlaneGeometry(4.6,1.5),new T.MeshStandardMaterial({map:artTex,roughness:1}));artwork.position.set(11.825,2.5,-30.5);artwork.rotation.y=-Math.PI/2;artwork.name='Replaceable seasonal movement artwork — original concept';group.add(artwork);
 // A wall-side storage envelope makes everyday mode explicit; retractable tiers remain conceptual.
 const stored=new T.Group();stored.name='Concept retractable seating storage envelope';group.add(stored);box(11.55,30.8,0,.65,8.1,1.8,M.dark,stored);for(let h=.3;h<1.8;h+=.3)box(11.18,30.8,h,.025,8,.025,M.oak,stored);
 label('RETRACTABLE SEATING / CONCEPT',11.16,30.5,1.35,2.8,.12,-Math.PI/2,'#ece6d9',stored);
 const cultureMode=new T.Group();cultureMode.name='Culture night DJ setup';group.add(cultureMode);box(1.65,31.5,.3,.75,1.6,.9,M.oak,cultureMode);box(1.65,31.5,1.2,.7,1.5,.05,M.black,cultureMode);
 for(const y of [31.08,31.92]){cyl(1.65,y,1.26,.17,.018,graphite,cultureMode);cyl(1.65,y,1.28,.04,.01,M.white,cultureMode);}for(let i=0;i<5;i++)box(1.65,31.32+i*.08,1.26,.12,.018,.02,M.white,cultureMode);
 for(const y of [29.1,33.9]){box(1.6,y,.3,.45,.4,.85,M.black,cultureMode);cyl(1.6,y,.34,.09,.03,graphite,cultureMode);}
 // World-space layer keys and a neutral construction diagram stay in the export.

 const diagram=card('Construction / material study',['01 / Upper holds and ventilates','02 / Foam cushions the foot','03 / Rubber contacts the ground'],24.3,37.04,1.03,.45,.24);diagram.mesh.rotation.set(-Math.PI/2,0,0);diagram.mesh.position.y=1.032;
 // Light rakes across the relief; static pin sleeves supply depth cues in lightweight mode/GLB.
 const graze=new T.SpotLight('#fff1dc',24,12,.7,.7,1.4);graze.position.set(1.2,3.3,-24.25);graze.target.position.set(7,1.6,-23.8);scene.add(graze,graze.target);
 // Products stay neutral at rest. Materials explain construction before an interface is opened.
 for(let i=0;i<8;i++){const x=19.8+i*7.9/7;box(x,37,1.027,.48,.30,.012,paper);for(let j=0;j<3;j++)box(x-.15+j*.15,37.10,1.04,.11,.07,.009,[fabric,M.white,graphite][j]);}
 for(const [x,y] of [[14.8,31.45],[15.7,33.8]]){
  const mat=box(x,y,.94,.8,.5,.008,graphite);mat.name='Cutting mat';for(let j=0;j<9;j++)box(x-.36+j*.09,y,.949,.002,.47,.001,paper);for(let j=0;j<5;j++)box(x,y-.2+j*.1,.949,.76,.002,.001,paper);
  const blank=makeFootwear(0);blank.position.set(x,.96,-y);blank.rotation.y=.35;blank.name='Workshop shoe blank';group.add(blank);
  for(let j=0;j<3;j++){box(x+.43,y-.15+j*.15,.94,.2,.12,.012,[fabric,paper,M.green][j]);const pot=cyl(x-.42,y-.15+j*.15,.94,.035,.065,[M.green,paper,graphite][j]);pot.name='Workshop pigment pot';line([x-.42,1,-y+.15-j*.15],[x-.4,1.14,-y+.15-j*.15],.003,M.oak);}
  line([x+.25,.96,-y-.2],[x+.46,.96,-y-.16],.008,M.black);line([x+.25,.96,-y-.16],[x+.46,.96,-y-.2],.008,M.black);
 }
 for(let i=0;i<4;i++){const sketch=card('Material study / '+(i+1),['UPPER / knit structure','FOAM / cut section','TRACTION / rubber test'],18.22,31.4+i*.9,2.65,.72,.36,-Math.PI/2);const cx=sketch.texture.image.getContext('2d');cx.strokeStyle='#536450';cx.lineWidth=5;cx.beginPath();cx.ellipse(720,440,180,65,-.2,0,7);cx.stroke();sketch.texture.needsUpdate=true;}
 // Soft acoustic strips and an intentional recording backdrop remain clear of the doorway.
 for(let x=13.2;x<17.3;x+=.24)box(x,23.75,.5,.08,.04,1.8,M.felt);
 label('VOICES / IN MOTION',15.25,23.81,2.15,2.2,.18,Math.PI,'#e7e1d1');
 // Quiet, flush inlays complete the walkable route without orange or mandatory interaction.
 const calmRoute=[[18.6,43.2],[7.6,43.2],[7.6,35.8],[2.2,35.8],[2.2,34.8],[5.2,34.8]];
 const inlay=new T.MeshStandardMaterial({color:'#96988c',roughness:.9});for(let i=1;i<calmRoute.length;i++){const a=calmRoute[i-1],b=calmRoute[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]),steps=Math.max(1,Math.floor(length/1.1));for(let j=0;j<=steps;j++){const t=j/steps;box(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,.014,.065,.22,.004,inlay);}}
 // Café details remain quiet and non-interactive.
 box(13.4,36.4,1.12,.8,.5,.45,M.black);for(const x of [13.2,13.6]){cyl(x,36.1,1.12,.05,.16,M.white);box(x,36.02,1.45,.11,.08,.035,M.black);}for(let i=0;i<5;i++)cyl(10.6+i*.25,36.35,1.12,.055,.1,M.white);cyl(15.5,36.4,1.12,.13,.32,M.white);
 const welcome=card('Every stride counts',['Effort becomes a story we share.','Explore a product. Make a contribution. Leave room for calm.','A concept season — no commercial product claims.'],41.4,37.85,1.22,1.5,.8,Math.PI);

 label('TEAM / QUIET WORK',46.15,29.6,2.45,1.05,.15,Math.PI/2,'#3a4436');
 // Explicit floor positions are a design proposal, not an accessibility certification.
 for(const y of [27.4,33.4]){const p=box(5.65,y,.012,1.1,1.3,.012,M.floor);p.name='Proposed step-free audience position';label('STEP-FREE',5.65,y,.04,.9,.13,0,'#5e6356').rotation.set(-Math.PI/2,0,0);}
 // Event furniture belongs to mode groups so reset/changeover is explicit.
 const talk=new T.Group(),launch=new T.Group(),sellin=new T.Group();talk.name='Arena talk layout';launch.name='Arena launch layout';sellin.name='Arena sell-in layout';group.add(talk,launch,sellin);
 for(let i=0;i<4;i++){box(1.65,29.85+i*1.1,.3,.48,.48,.45,M.felt,talk,true);box(1.42,29.85+i*1.1,.6,.1,.48,.48,M.felt,talk,true);}box(1.65,31.5,.3,.6,.6,.9,M.terra,launch,true);for(let i=0;i<3;i++)box(1.65,30.2+i*1.3,.3,.6,.55,.75,M.terra,sellin);
 const arenaLights=scene.children.filter(o=>o.isPointLight&&o.position.x<8);const extraLights=[];
 for(const [x,y,color,intensity,range] of [[15.2,32.6,'#f3f1e2',12,6],[15.2,26.4,'#fff0df',10,5]]){const l=new T.PointLight(color,intensity,range,2);l.position.set(x,2.7,-y);scene.add(l);extraLights.push(l);}
 const basePoints=scene.children.filter(o=>o.isPointLight&&!extraLights.includes(o));for(const l of basePoints){const x=l.position.x,y=-l.position.z;if(x>45)l.color.set('#f2f0e7');else if(x>18&&x<29)l.color.set('#f4f1e9');else l.color.set('#ffe4c5');}
 for(const l of scene.children)if(l.isSpotLight&&l.position.x<29)l.color.set('#fff3df');
 let arenaMode='launch';function setArenaMode(mode){arenaMode=mode;const seated=['launch','talk','sellin','culture'].includes(mode);tiers.forEach(o=>o.visible=seated);mats.forEach(o=>o.visible=mode==='runclub');stored.visible=!seated;cultureMode.visible=mode==='culture';stage.visible=seated;arenaRing.visible=seated;talk.visible=mode==='talk';launch.visible=mode==='launch';sellin.visible=mode==='sellin';arenaLights.forEach(l=>{l.intensity=seated?18:26;l.color.set(seated?'#ffe3bd':'#f0efe6');});}
 setArenaMode('launch');
 function tick(position,dt){const dist=Math.hypot(position.x-47.75,position.z+39.5),goal=dist<2.2?1:0;doorOpen=T.MathUtils.damp(doorOpen,goal,8,dt);door.rotation.y=doorOpen*Math.PI/2;}
 // Batch only static shared primitives; the door, sample and mode groups retain identity.
 const buckets=new Map();for(const o of [...group.children]){if(!o.isMesh||o===recordingLamp||o===makerSample||o.geometry!==cube&&o.geometry!==cylinder)continue;const key=o.geometry.uuid+o.material.uuid+!!o.userData.roof;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(o);}for(const objects of buckets.values()){if(objects.length<2)continue;const mesh=new T.InstancedMesh(objects[0].geometry,objects[0].material,objects.length);mesh.userData.roof=!!objects[0].userData.roof;mesh.receiveShadow=true;objects.forEach((o,i)=>{o.updateMatrix();mesh.setMatrixAt(i,o.matrix);group.remove(o);});group.add(mesh);}
 return {group,card,label,comparison,welcome,contributions,makerSample,recordingLamp,setArenaMode,tick,floorHeightAt(x,y){if(!['launch','talk','sellin','culture'].includes(arenaMode))return 0;if(x>=6.6&&x<12&&y>26.5&&y<35)return Math.min(6,Math.floor((x-6.6)/.9)+1)*.3;if(((x-1.65)/1.3)**2+((y-31.5)/2.5)**2<1)return .3;return 0;},get arenaMode(){return arenaMode},cultureMode,artwork,stored,get doorCollider(){return doorOpen<.15?[47,48.5,39.44,39.56]:null},get doorOpen(){return doorOpen},report:{seated:84,stepFreePositions:2,capacityStatus:'Concept arrangement; code compliance and occupied sightlines not certified',stage:{centre:[1.65,31.5],radii:[1.3,2.5]},staffVestibule:'Assumed core-side interface only; full core circulation is outside the model'}};
}
