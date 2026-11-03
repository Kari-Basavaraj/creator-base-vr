import * as T from 'three';

// Original reference-led exterior model. Not a surveyed reconstruction or verified site view.
// CAD-facing facade is east (+scene X); building length runs north/south (-scene Z).
export function buildLandmark(world){
 const group=new T.Group();group.name='Vidhana Soudha — reference-led exterior';group.userData={reference:'Arena culture-night concept render 06',surveyed:false};world.add(group);
 const stone=new T.MeshStandardMaterial({color:'#cbb994',roughness:.86,emissive:'#e8b455',emissiveIntensity:.5});
 const trim=new T.MeshStandardMaterial({color:'#e2cfaa',roughness:.8,emissive:'#ffd380',emissiveIntensity:.7});
 const dark=new T.MeshStandardMaterial({color:'#514b40',roughness:.94});
 const glass=new T.MeshStandardMaterial({color:'#69624e',roughness:.5,emissive:'#d9a75a',emissiveIntensity:.38});
 const lawn=new T.MeshStandardMaterial({color:'#424c35',roughness:1});
 const cube=new T.BoxGeometry(1,1,1),shaft=new T.CylinderGeometry(1,1,1,10),sphere=new T.SphereGeometry(1,10,6);
 function box(x,y,z,w,d,h,m=stone){const o=new T.Mesh(cube,m);o.position.set(-250+x,-40+z+h/2,-32-y);o.scale.set(w,h,d);group.add(o);return o;}
 function cyl(x,y,z,r,h,m=trim){const o=new T.Mesh(shaft,m);o.position.set(-250+x,-40+z+h/2,-32-y);o.scale.set(r,h,r);group.add(o);return o;}
 function dome(x,y,z,r,h){const profile=[[0,0],[1,0],[1,.1],[.94,.25],[.82,.55],[.58,.82],[.23,.98],[.1,1.08],[0,1.1]].map(([a,b])=>new T.Vector2(a*r,b*h));const geo=new T.LatheGeometry(profile,24);const o=new T.Mesh(geo,trim);o.position.set(-250+x,-40+z,-32-y);group.add(o);cyl(x,y,z-.6,r*1.08,.6);cyl(x,y,z+h*1.1,.25,2.5);const finial=new T.Mesh(sphere,trim);finial.position.set(-250+x,-40+z+h*1.1+2.5,-32-y);finial.scale.set(.65,.65,.65);group.add(finial);}
 // Plinth, four-storey wings and broad central approach steps.
 box(10,0,-.15,110,240,.15,lawn);box(0,0,0,62,180,2.6);
 box(0,0,2.6,58,174,23.4);for(const z of [3,9.2,15.3,21.4,26])box(.3,0,z,60.5,177,.55,trim);
 for(let i=0;i<10;i++)box(36+i*.85,0,.25+i*.23,1.0,49-i*.9,.24,trim);
 // Deep, dark window recesses and light-coloured pilasters provide architectural rhythm.
 for(let y=-81;y<=81;y+=6){for(let level=0;level<3;level++){box(29.05,y,5+level*6.1,.15,2.6,3.5,dark);box(29.16,y,5.3+level*6.1,.12,1.75,2.7,glass);box(29.45,y,4.85+level*6.1,.6,3,.25,trim);}box(29.6,y+2.5,3.1,.7,.65,22.6,trim);box(30.3,y+2.5,25.9,1.3,1.3,1.5,trim);}
 // Central portico: tall columns, carved entablature and shadowed inner doors.
 box(29,0,3,2,43,22,dark);box(33,0,24.8,14,47,2,trim);box(31,0,26.8,17,49,.7,trim);
 for(let y=-19;y<=19;y+=7.6){cyl(36,y,3.0,1,20.8);cyl(36,y,2.7,1.55,.6);cyl(36,y,23.5,1.45,1.25);box(36,y,24.6,3.1,3.1,.5,trim);}
 for(let y=-15;y<=15;y+=7.5){box(29.2,y,3.2,.3,4,7,dark);box(29.4,y,3.3,.15,2.8,6,glass);}
 // Tiered central tower and a ribbed, Indian-style domed crown.
 box(1,0,26.7,30,35,4.4);box(1,0,31.1,32,37,.7,trim);box(1,0,31.8,24,28,5.8);
 for(let y=-11;y<=11;y+=5.5){box(13.2,y,32.3,.3,2.8,3.6,dark);cyl(13.8,y+2,31.9,.4,5.4);}
 box(1,0,37.6,27,31,.7,trim);cyl(1,0,38.3,10.4,3.4);dome(1,0,41.7,10.7,9.3);
 // Four corner chhatri towers, not just a central dome on a generic slab.
 for(const y of [-76,76])for(const x of [-20,20]){box(x,y,26.5,14,15,1.1,trim);cyl(x,y,27.6,5.3,5.3,stone);for(let j=0;j<8;j++){const a=j*Math.PI/4;cyl(x+Math.cos(a)*4.7,y+Math.sin(a)*4.7,28,.35,4.9);}dome(x,y,33,6,4.6);}
 // Stone parapet posts and lawns retain a readable low skyline around the monument.
 for(let y=-85;y<=85;y+=4)box(29.4,y,26.7,1.05,1.05,1.8,trim);
 // Subtle dusk floodlight pools are baked material cues and therefore survive GLB export.
 const c=document.createElement('canvas');c.width=64;c.height=256;const ctx=c.getContext('2d'),g=ctx.createLinearGradient(0,0,0,256);g.addColorStop(0,'rgba(255,220,146,0)');g.addColorStop(1,'rgba(255,220,146,.32)');ctx.fillStyle=g;ctx.fillRect(0,0,64,256);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const glow=new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,side:T.DoubleSide,opacity:.65});
 for(let y=-78;y<=78;y+=12){const o=new T.Mesh(new T.PlaneGeometry(3.8,19),glow);o.rotation.y=Math.PI/2;o.position.set(-219.8,-25,-32-y);group.add(o);}
 // Batch repeated masonry primitives. Dome silhouettes retain independent geometry.
 const buckets=new Map();for(const o of [...group.children]){if(o.geometry!==cube&&o.geometry!==shaft)continue;const key=o.geometry.uuid+o.material.uuid;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(o);}for(const list of buckets.values()){const mesh=new T.InstancedMesh(list[0].geometry,list[0].material,list.length);mesh.name='Vidhana Soudha / masonry and columns';list.forEach((o,i)=>{o.updateMatrix();mesh.setMatrixAt(i,o.matrix);group.remove(o);});group.add(mesh);}
 function lighting(day){stone.emissiveIntensity=day?0:.5;trim.emissiveIntensity=day?0:.7;glass.emissiveIntensity=day?.03:.38;glow.opacity=day?0:.65;}
 return {group,lighting,report:{name:'Vidhana Soudha',centreCAD:[-250,32],groundDatum:-40,footprint:[62,180],reference:'renders/06_arena_event-mode_culture-night.png',surveyed:false}};
}
