import * as T from 'three';
// Original procedural concept footwear; no third-party product model or specification.
const rubber=new T.MeshStandardMaterial({color:'#353b38',roughness:.93});
const foam=new T.MeshStandardMaterial({color:'#e3dfd3',roughness:.86});
const knit=new T.MeshStandardMaterial({color:'#c8c4b6',roughness:.94});
const trim=new T.MeshStandardMaterial({color:'#777e70',roughness:.72});
const soleShape=new T.Shape();soleShape.moveTo(-.15,-.043);soleShape.bezierCurveTo(-.18,-.02,-.17,.043,-.13,.052);soleShape.lineTo(.09,.06);soleShape.bezierCurveTo(.19,.052,.19,-.048,.10,-.056);soleShape.closePath();
const soleGeo=new T.ExtrudeGeometry(soleShape,{depth:.027,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.005,bevelThickness:.004,curveSegments:5});soleGeo.rotateX(-Math.PI/2);
const laceGeo=new T.CylinderGeometry(.0018,.0018,1,5),detailGeo=new T.BoxGeometry(1,1,1);
export function makeSole(material=foam){return new T.Mesh(soleGeo,material);}
export function makeFootwear(family=0){
 const g=new T.Group();g.name=['Knit distance concept','Structured court concept','Trail traction concept'][family%3];
 const add=(geo,mat,pos,scale)=>{const m=new T.Mesh(geo,mat);m.position.set(...pos);if(scale)m.scale.set(...scale);g.add(m);return m;};
 const sole=makeSole(foam);g.add(sole);const outsole=makeSole(rubber);outsole.position.y=-.015;outsole.scale.y=.4;g.add(outsole);
 // Cross sections form a tapered toe, instep and open collar instead of an ellipsoid.
 const sections=[[-.15,.04,.025],[-.115,.05,.105],[-.055,.051,.092],[.015,.054,.071],[.09,.053,.048],[.15,.026,.033]],verts=[],indices=[];
 for(const [x,w,h] of sections)for(let j=0;j<8;j++){const a=j/7*Math.PI;verts.push(x,.03+Math.sin(a)*h,Math.cos(a)*w);}
 for(let i=0;i<sections.length-1;i++)for(let j=0;j<7;j++){const a=i*8+j;indices.push(a,a+1,a+8,a+1,a+9,a+8);}
 const upperGeo=new T.BufferGeometry();upperGeo.setAttribute('position',new T.Float32BufferAttribute(verts,3));upperGeo.setIndex(indices);upperGeo.computeVertexNormals();const upper=add(upperGeo,knit,[0,0,0]);upper.material=knit.clone();upper.material.color.set(['#c8c4b6','#e1dfd4','#899584'][family%3]);
 const collar=new T.Mesh(new T.TorusGeometry(.026,.007,4,12),trim);collar.rotation.x=Math.PI/2;collar.scale.set(1.1,1.4,1);collar.position.set(-.105,.126,0);g.add(collar);
 add(detailGeo,rubber,[-.105,.115,0],[.04,.008,.038]); // dark collar interior
 add(detailGeo,trim,[-.151,.069,0],[.008,.065,.076]);
 add(detailGeo,knit,[-.04,.105,0],[.065,.008,.032]).rotation.z=-.18;
 for(let i=0;i<5;i++){const x=-.065+i*.018,y=.108-i*.006;const a=new T.Vector3(x-.008,y,-.022),b=new T.Vector3(x+.008,y,.022),l=add(laceGeo,foam,[0,0,0]);l.position.copy(a).add(b).multiplyScalar(.5);l.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.clone().sub(a).normalize());l.scale.y=a.distanceTo(b);}
 for(const z of [-1,1])for(let i=0;i<3;i++){const panel=add(detailGeo,trim,[-.048+i*.026,.062,z*.051],[.009,.043,.003]);panel.rotation.z=-.35;}
 if(family%3===2)for(let i=0;i<6;i++)for(const z of [-.035,.035])add(detailGeo,rubber,[-.12+i*.048,-.017,z],[.025,.01,.018]);
 if(family%3===1)add(detailGeo,trim,[-.09,.041,0],[.10,.017,.108]);
 return g;
}
