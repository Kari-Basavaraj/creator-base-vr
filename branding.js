import * as T from 'three';
import { SVGLoader } from './vendor/SVGLoader.js';

// User-approved change to the initial no-logo concept, November 3, 2026.
// All branding is attached to world, so the existing GLTFExporter includes it.
export async function addBranding(world, materials) {
  const data=await new SVGLoader().loadAsync('./assets/adidas-wordmark.svg');
  const shapes=data.paths.flatMap(path=>SVGLoader.createShapes(path));
  const geometries=shapes.map(shape=>{
    const g=new T.ExtrudeGeometry(shape,{depth:.24,steps:1,bevelEnabled:false,curveSegments:8});
    // Normalize SVG's downward Y without leaving negative scales in the GLB.
    g.scale(1,-1,1);g.translate(-40,9.5,0);
    if(g.index){for(let i=0;i<g.index.count;i+=3){const a=g.index.getX(i+1);g.index.setX(i+1,g.index.getX(i+2));g.index.setX(i+2,a);}}
    else {for(const attribute of Object.values(g.attributes)){for(let i=0;i<attribute.count;i+=3)for(let k=0;k<attribute.itemSize;k++){const a=(i+1)*attribute.itemSize+k,b=(i+2)*attribute.itemSize+k,v=attribute.array[a];attribute.array[a]=attribute.array[b];attribute.array[b]=v;}}}
    g.computeVertexNormals();return g;
  });
  const group=new T.Group();group.name='adidas — architectural branding';
  group.userData={source:'https://report.adidas-group.com/2025/en/',asset:'Official adidas header wordmark',revision:'2026-11-03-r2',finish:'Matte neutral; no orange'};world.add(group);
  const white=new T.MeshStandardMaterial({color:'#eeeae1',roughness:.85,metalness:0,envMapIntensity:.4});white.name='Branding — matte warm white';
  const charcoal=new T.MeshStandardMaterial({color:'#393933',roughness:.96,metalness:0});charcoal.name='Branding — etched charcoal';
  const placements=[];
  function pose(object,x,y,height,rotation=0){object.position.set(x,height,-y);object.rotation.y=rotation;return object;}
  function wordmark(name,{x,y,height,width,rotation=0,material=white}){
    const mark=new T.Group();mark.name=`adidas wordmark — ${name}`;mark.userData={zone:name,widthMetres:width,asset:'adidas-wordmark.svg',officialArtwork:true};mark.scale.setScalar(width/80);pose(mark,x,y,height,rotation);
    for(const geometry of geometries){const mesh=new T.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;mark.add(mesh);}group.add(mark);placements.push(mark);return mark;
  }
  function label(text,{x,y,height,width=.9,letterHeight=.055,rotation=0,color='#d5d0c5'}){
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=128;const ctx=canvas.getContext('2d');ctx.font='500 72px Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(text,512,67,970);
    const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
    const material=new T.MeshStandardMaterial({map:texture,transparent:true,alphaTest:.2,roughness:1,metalness:0,polygonOffset:true,polygonOffsetFactor:-1});material.name='Branding — printed/etched type';
    const mesh=new T.Mesh(new T.PlaneGeometry(width,letterHeight),material);mesh.name=`Architectural label — ${text}`;pose(mesh,x,y,height,rotation);group.add(mesh);return mesh;
  }
  function backing(x,y,height,w,d,h,material=materials.dark){const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),material);mesh.name='Flush oak branding plaque';mesh.position.set(x,height,-y);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;}
  // South-facing face of the arrival portal, readable from the exact lobby spawn.
  backing(31.45,35.48,2.87,1.7,.04,.48);
  label('CREATOR BASE',{x:31.45,y:35.45,height:2.87,width:1.46,letterHeight:.23});
  wordmark('Entrance left wall',{x:29.363,y:37.3,height:1.77,width:1.7,rotation:Math.PI/2});
  wordmark('Entrance right wall',{x:33.537,y:37.3,height:1.77,width:1.7,rotation:-Math.PI/2});
  label('LEAVE YOUR MARK',{x:29.368,y:37.3,height:1.36,width:1.3,letterHeight:.13,rotation:Math.PI/2});
  label('LEAVE YOUR MARK',{x:33.532,y:37.3,height:1.36,width:1.3,letterHeight:.13,rotation:-Math.PI/2});
  // North-facing lab wall; preserve the glass and the lifted-shoe story.
  wordmark('Discovery Lab',{x:25.2,y:35.555,height:2.38,width:1.35,rotation:Math.PI});
  label('LIFT TO LEARN',{x:25.2,y:35.56,height:2.06,width:1.4,letterHeight:.12,rotation:Math.PI});
  const productLabels=['01 / UPPER','02 / SUPPORT','03 / CUSHION','04 / LAYERS','05 / ENERGY','06 / GRIP','07 / MATERIAL','08 / MOVEMENT'];
  productLabels.forEach((text,i)=>label(text,{x:19.8+i*7.9/7,y:37.305,height:.78,width:.42,letterHeight:.07,rotation:Math.PI,color:'#5b554b'}));
  // Small wordmark on the east-facing stage fascia, away from the Imprint Wall.
  wordmark('Community Arena',{x:2.964,y:31.5,height:.156,width:.9,rotation:Math.PI/2});
  // Range-wall plaque, east-facing; calm, non-emissive branding only.
  const plaque=backing(45.85,42.4,2.74,.035,1.55,.68,materials.oak);
  wordmark('Partner suite',{x:45.874,y:42.4,height:2.84,width:1.12,rotation:Math.PI/2,material:charcoal});
  label('PARTNER SHOWCASE',{x:45.878,y:42.4,height:2.58,width:1.16,letterHeight:.10,rotation:Math.PI/2,color:'#393933'});
  return {group,placements,report:{revision:'2026-11-03-r2',wordmarks:placements.length,productLabels:productLabels.length,source:group.userData.source,neutralOnly:true}};
}
