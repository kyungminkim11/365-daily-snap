"""Generate selection maps from vuski/admdongkor 20260701 GeoJSON.
Usage: python scripts/build-region-maps.py INPUT.geojson (requires shapely).
SGIS public data / KOGL type 1; see public/licenses/map-attribution.txt.
"""
import json, sys, math
from pathlib import Path
from shapely.geometry import shape, box
from shapely.ops import unary_union

data = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8-sig'))
groups = {'seoul': {}, 'gyeonggi': {}, 'incheon': {}}
for f in data['features']:
    p = f['properties']
    area = {'11': 'seoul', '41': 'gyeonggi', '28': 'incheon'}.get(p['sido'])
    if not area: continue
    name = p['sggnm'].split()[0]
    # The source sometimes concatenates the city and its non-autonomous district.
    if area == 'gyeonggi' and name.endswith('구') and '시' in name: name = name.split('시')[0] + '시'
    groups[area].setdefault(name, []).append(shape(f['geometry']))

def draw(geoms, bounds, target=(32, 32, 696, 536)):
    x0, y0, x1, y1 = bounds
    tx, ty, tw, th = target
    c = math.cos(math.radians(37.5))
    scale = min(tw / ((x1-x0)*c), th / (y1-y0))
    ox, oy = tx+(tw-(x1-x0)*c*scale)/2, ty+(th-(y1-y0)*scale)/2
    def xy(x, y): return [round(ox+(x-x0)*c*scale,1), round(oy+(y1-y)*scale,1)]
    out=[]
    for name, geom in geoms.items():
        geom = geom.simplify(.00065, preserve_topology=True)
        polygons = list(geom.geoms) if geom.geom_type == 'MultiPolygon' else [geom]
        paths=[]
        for poly in polygons:
            for ring in [poly.exterior, *poly.interiors]:
                pts=[xy(x,y) for x,y in ring.coords]
                paths.append('M'+'L'.join(f'{x},{y}' for x,y in pts)+'Z')
        pt=max(polygons,key=lambda p:p.area).representative_point()
        out.append({'name':name,'path':''.join(paths),'label':xy(pt.x,pt.y)})
    return out

result={}
for area, items in groups.items():
    geoms={n:unary_union(g).buffer(0) for n,g in items.items()}
    if area == 'incheon':
        islands=geoms.pop('옹진군')
        result[area]=draw(geoms, unary_union(list(geoms.values())).bounds, (200,20,535,550))
        result[area]+=draw({'옹진군':islands}, islands.bounds, (20,355,165,170))
    else: result[area]=draw(geoms, unary_union(list(geoms.values())).bounds)
    result[area].sort(key=lambda x:x['name'])
offsets = {'gyeonggi': {'부천시':[210,325], '광명시':[205,352], '시흥시':[205,380], '안양시':[205,407], '군포시':[205,434], '과천시':[340,338], '의왕시':[363,395], '성남시':[401,362]}, 'incheon': {'제물포구':[548,447], '미추홀구':[635,440], '옹진군':[105,345]}}
for area, items in offsets.items():
    for feature in result[area]:
        if feature['name'] in items:
            feature['anchor'] = feature['label']
            feature['label'] = items[feature['name']]
Path('src/data/districtMaps.json').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print({k:len(v) for k,v in result.items()})
