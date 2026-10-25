# Season time-lapse GLB clean-up (Blender 5.2, background):
#   blender -b --python scripts/blender-season-glb.py -- <src.glb> <out.glb> <target_tris> <kind> <render_dir>
# kind: tree | root | rosette | flowers. Ground (y=0 in glTF) = soil line, origin on the plant axis.
# Tearing guard: weld seam duplicates before Decimate, count open (boundary) edges before/after,
# and render the original and the result from the same cameras for a side-by-side check.
import bpy, bmesh, sys, json, math, os
from mathutils import Vector

src, out, target, kind, rdir = sys.argv[sys.argv.index('--') + 1:][:5]
target = int(target)
os.makedirs(rdir, exist_ok=True)
name = os.path.splitext(os.path.basename(out))[0]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src, merge_vertices=True)
meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
bpy.ops.object.select_all(action='DESELECT')
for o in meshes: o.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
if len(meshes) > 1: bpy.ops.object.join()
ob = bpy.context.view_layer.objects.active
bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
for o in list(bpy.context.scene.objects):
    if o != ob: bpy.data.objects.remove(o, do_unlink=True)

def stats(o):
    bm = bmesh.new(); bm.from_mesh(o.data)
    s = {'tris': sum(len(f.verts) - 2 for f in bm.faces), 'verts': len(bm.verts),
         'open_edges': sum(1 for e in bm.edges if e.is_boundary),
         'nonmanifold': sum(1 for e in bm.edges if not e.is_manifold and not e.is_boundary)}
    bm.free(); return s

def bounds(o):
    xs = [v.co for v in o.data.vertices]
    lo = Vector((min(v.x for v in xs), min(v.y for v in xs), min(v.z for v in xs)))
    hi = Vector((max(v.x for v in xs), max(v.y for v in xs), max(v.z for v in xs)))
    return lo, hi

report = {'src': os.path.basename(src), 'kind': kind, 'before': stats(ob)}
lo, hi = bounds(ob); size = hi - lo
# Weld only coincident duplicates (seam splits), never nearby geometry.
bm = bmesh.new(); bm.from_mesh(ob.data)
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=max(size) * 1e-6)
bm.to_mesh(ob.data); bm.free()
report['welded'] = stats(ob)

# Render helper: same three cameras for original and result.
scene = bpy.context.scene
scene.render.engine = 'BLENDER_WORKBENCH'
scene.display.shading.light = 'STUDIO'
scene.display.shading.color_type = 'TEXTURE'
scene.display.shading.show_cavity = True
scene.render.resolution_x, scene.render.resolution_y = 900, 900
scene.render.film_transparent = False
world = bpy.data.worlds.new('w'); scene.world = world
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); scene.collection.objects.link(cam); scene.camera = cam
cam.data.type = 'ORTHO'

def shoot(tag):
    pts = [o.matrix_world @ v.co for o in scene.objects if o.type == 'MESH' for v in o.data.vertices]
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    c = (lo + hi) / 2; ext = max(hi - lo) * 1.12
    cam.data.ortho_scale = ext
    for view, d in (('front', Vector((0, -1, 0))), ('side', Vector((1, 0, 0))), ('top', Vector((0, 0, 1)))):
        cam.location = c + d * ext * 3
        cam.rotation_euler = (-d).to_track_quat('-Z', 'Y').to_euler()
        scene.render.filepath = os.path.join(rdir, f'{name}-{tag}-{view}.png')
        bpy.ops.render.render(write_still=True)

shoot('original')

# Decimate (collapse) once to the target.
ratio = min(1.0, target / max(1, report['welded']['tris']))
mod = ob.modifiers.new('decimate', 'DECIMATE'); mod.ratio = ratio; mod.use_collapse_triangulate = True
bpy.context.view_layer.objects.active = ob
bpy.ops.object.modifier_apply(modifier=mod.name)
report['after'] = stats(ob); report['ratio'] = round(ratio, 4)

# Ground line and axis (Blender Z is up; glTF export turns it into +Y).
lo, hi = bounds(ob); h = hi.z - lo.z
verts = [v.co.copy() for v in ob.data.vertices]
def slice_info(z0, z1):
    pts = [v for v in verts if z0 <= v.z < z1]
    if not pts: return None
    xs = [p.x for p in pts]; ys = [p.y for p in pts]
    return max(max(xs) - min(xs), max(ys) - min(ys)), Vector(((max(xs) + min(xs)) / 2, (max(ys) + min(ys)) / 2, 0))
n = 80
slices = [slice_info(lo.z + h * i / n, lo.z + h * (i + 1) / n) for i in range(n)]
if kind == 'tree':
    # Narrowest trunk slice in the middle band, then walk down to where the root flare widens.
    band = [i for i in range(int(n * .2), int(n * .75)) if slices[i]]
    t = min(band, key=lambda i: slices[i][0]); trunk_w = slices[t][0]
    g = t
    while g > 0 and slices[g - 1] and slices[g - 1][0] < trunk_w * 1.7: g -= 1
    ground_z = lo.z + h * g / n; axis = slices[t][1]
elif kind == 'root':
    ground_z = hi.z - h * .07
    top = [s for s in slices[int(n * .85):] if s]; axis = top[len(top) // 2][1]
else:  # rosette / flowers sit on the ground with their crown or base point at the axis
    ground_z = lo.z
    base = [s for s in slices[:4] if s]; axis = base[0][1] if base else (lo + hi) / 2
report['ground_from_bottom'] = round((ground_z - lo.z) / h, 3)

# Scale: tree total height 2.0; sowthistle parts share one plant scale (root 1.0, rosette width 1.0, flowers 1.5).
lo, hi = bounds(ob); size = hi - lo
scale = {'tree': 2.0 / size.z, 'root': 1.0 / size.z, 'rosette': 1.0 / max(size.x, size.y), 'flowers': 1.5 / size.z}[kind]
for v in ob.data.vertices:
    v.co = Vector(((v.co.x - axis.x) * scale, (v.co.y - axis.y) * scale, (v.co.z - ground_z) * scale))
ob.data.update()
for poly in ob.data.polygons: poly.use_smooth = True
lo, hi = bounds(ob); report['bounds'] = [list(map(lambda x: round(x, 3), lo)), list(map(lambda x: round(x, 3), hi))]
report['depth_over_width'] = round(min(hi.x - lo.x, hi.y - lo.y) / max(hi.x - lo.x, hi.y - lo.y), 3)

# Textures: base colour at 1024, normal map at 1024, no metal/rough map (matte plant).
for mat in ob.data.materials:
    if not mat or not mat.use_nodes: continue
    nodes = mat.node_tree.nodes; bsdf = next((nd for nd in nodes if nd.type == 'BSDF_PRINCIPLED'), None)
    if not bsdf: continue
    for sock in ('Metallic', 'Roughness'):
        for link in list(bsdf.inputs[sock].links): mat.node_tree.links.remove(link)
    bsdf.inputs['Metallic'].default_value = 0.0; bsdf.inputs['Roughness'].default_value = 0.85
    for nd in nodes:
        if nd.type == 'TEX_IMAGE' and nd.image and nd.outputs['Color'].links:
            img = nd.image
            if max(img.size) > 1024: img.scale(1024, 1024)
shoot('result')
if kind == 'tree':
    # Meshy flattened the crown into one plane (side view is a thin sheet). Keep it as a separate 'crown'
    # object above the trunk fork; the app adds two rotated copies (60°, 120°) sharing the same geometry.
    verts = [v.co.copy() for v in ob.data.vertices]; top = max(v.z for v in verts); m = 60
    def width(z0, z1):
        pts = [v for v in verts if z0 <= v.z < z1]
        return max(max(p.x for p in pts) - min(p.x for p in pts), max(p.y for p in pts) - min(p.y for p in pts)) if pts else 0
    widths = [width(top * i / m, top * (i + 1) / m) for i in range(m)]
    t = min(range(int(m * .05), int(m * .4)), key=lambda i: widths[i] or 9)
    f = next((i for i in range(t, m) if widths[i] > widths[t] * 2.2), int(m * .45))
    fork_z = top * f / m; report['fork_z'] = round(fork_z, 3)
    bpy.ops.object.mode_set(mode='EDIT'); bm = bmesh.from_edit_mesh(ob.data)
    for face in bm.faces: face.select_set(all(v.co.z >= fork_z for v in face.verts))
    bmesh.update_edit_mesh(ob.data); bpy.ops.mesh.separate(type='SELECTED'); bpy.ops.object.mode_set(mode='OBJECT')
    crown = next(o for o in scene.objects if o.type == 'MESH' and o != ob)
    ob.name, ob.data.name, crown.name, crown.data.name = 'trunk', 'trunk', 'crown', 'crown'
    report['crown_tris'] = stats(crown)['tris']; report['trunk_tris'] = stats(ob)['tris']
    copies = []
    for angle in (60, 120):
        c = crown.copy(); c.rotation_mode = 'XYZ'; c.rotation_euler = (0, 0, math.radians(angle)); scene.collection.objects.link(c); copies.append(c)
    shoot('crossed')
    for c in copies: bpy.data.objects.remove(c, do_unlink=True)
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=False, export_image_format='JPEG',
                          export_image_quality=86, export_apply=True, export_yup=True, export_draco_mesh_compression_enable=False,
                          export_tangents=False, export_animations=False, export_cameras=False, export_lights=False)
report['out_MB'] = round(os.path.getsize(out) / 1048576, 2)
with open(os.path.join(rdir, f'{name}-report.json'), 'w', encoding='utf-8') as f: json.dump(report, f, ensure_ascii=False, indent=1)
print('SEASON_GLB', json.dumps(report, ensure_ascii=False))
