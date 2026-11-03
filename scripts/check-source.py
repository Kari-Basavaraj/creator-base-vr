#!/usr/bin/env python3
"""Dependency-free source/import and exported-asset checks. Does not execute app code."""
from pathlib import Path
import hashlib,json,re,shutil,struct,subprocess
from urllib.parse import unquote,urlsplit
ROOT=Path(__file__).resolve().parents[1]
errors=[]
js=list(ROOT.glob('*.js'))+list((ROOT/'vendor').rglob('*.js'))+list((ROOT/'tests').glob('*.js'))
if shutil.which('node'):
    for p in js:
        result=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
        if result.returncode:errors.append(f'Syntax: {p.relative_to(ROOT)}: {result.stderr[:300]}')
for p in js+list(ROOT.glob('*.html')):
    for match in re.finditer(r'''(?:from\s*|import\s*\(?)["'](\.[^"']+)["']''',p.read_text()):
        target=p.parent/unquote(urlsplit(match.group(1)).path)
        if not target.exists():errors.append(f'Unresolved import in {p.relative_to(ROOT)}: {match.group(1)}')
for p in ROOT.glob('*.html'):
    for match in re.finditer(r'''(?:src|href)=["']([^"']+)["']''',p.read_text()):
        u=urlsplit(match.group(1))
        if u.scheme or u.netloc or not u.path or u.path.startswith('#'):continue
        target=p.parent/unquote(u.path)
        if not target.exists():errors.append(f'Unresolved link in {p.name}: {match.group(1)}')
b=(ROOT/'world.glb').read_bytes();magic,version,length=struct.unpack_from('<III',b);n,kind=struct.unpack_from('<II',b,12);g=json.loads(b[20:20+n])
triangles=0
for node in g['nodes']:
    if 'mesh' not in node:continue
    instance_attributes=node.get('extensions',{}).get('EXT_mesh_gpu_instancing',{}).get('attributes',{})
    instances=g['accessors'][next(iter(instance_attributes.values()))]['count'] if instance_attributes else 1
    for primitive in g['meshes'][node['mesh']]['primitives']:
        if primitive.get('mode',4)!=4:continue
        accessor=primitive.get('indices',primitive['attributes']['POSITION'])
        triangles+=g['accessors'][accessor]['count']//3*instances
marks=[o for o in g['nodes'] if o.get('extras',{}).get('officialArtwork')]
seats=[o for o in g['nodes'] if o.get('name','').startswith('Arena seat ')]
for condition,message in [(magic==0x46546c67,'GLB magic'),(version==2,'GLB version'),(length==len(b),'GLB length'),(len(marks)==5,'Five logo groups'),(len(seats)==84,'84 audience seat nodes'),(triangles<300000,'Exported triangle budget'),(all('bufferView' in x for x in g.get('images',[])),'All images embedded')]:
    if not condition:errors.append(message)
provenance=ROOT/'assets/provenance.json'
if provenance.exists():
    for asset in json.loads(provenance.read_text()):
        if 'sha256' not in asset:continue
        target=ROOT/'assets'/asset['file']
        if not target.exists() or hashlib.sha256(target.read_bytes()).hexdigest()!=asset['sha256']:errors.append('Asset integrity: '+asset['file'])
logo_meta=json.loads((ROOT/'assets/adidas-wordmark-provenance.json').read_text())
if hashlib.sha256((ROOT/'assets'/logo_meta['asset']).read_bytes()).hexdigest()!=logo_meta['sha256']:errors.append('Logo asset integrity')
result={'passed':not errors,'sourceFilesChecked':len(js),'glb':{'version':version,'triangles':triangles,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'wordmarks':len(marks),'audienceSeats':len(seats),'embeddedImages':len(g.get('images',[]))},'errors':errors,'scope':'Syntax, local references, asset hashes and GLB structure only; see browser checks for behavior.'}
print(json.dumps(result,indent=2));raise SystemExit(1 if errors else 0)
