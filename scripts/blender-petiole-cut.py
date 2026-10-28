# Petiole cutaway GLB clean-up (Blender 5.2, background):
#   blender -b --python scripts/blender-petiole-cut.py -- <src.glb> <out.glb> <target_tris> <render_dir> [turn_deg]
# Upright specimen, height 2.0, origin at the centre of its bounding box. turn_deg spins it about the
# vertical axis so the opened cut faces the front (glTF +Z, the lab camera). Without <out.glb> ("-")
# it only renders four sides of the original to find that angle.
# Tearing guard as in blender-season-glb.py: weld seam duplicates only, Decimate once, count open edges.
import bpy, bmesh, sys, json, math, os
from mathutils import Vector, Matrix

args = sys.argv[sys.argv.index('--') + 1:]
src, out, target, rdir = args[:4]
turn = float(args[4]) if len(args) > 4 else 0.0
target = int(target)
os.makedirs(rdir, exist_ok=True)

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
         'open_edges': sum(1 for e in bm.edges if e.is_boundary)}
    bm.free(); return s

def bounds(o):
    xs = [v.co for v in o.data.vertices]
    return (Vector((min(v.x for v in xs), min(v.y for v in xs), min(v.z for v in xs))),
            Vector((max(v.x for v in xs), max(v.y for v in xs), max(v.z for v in xs))))

report = {'src': os.path.basename(src), 'before': stats(ob), 'turn_deg': turn}
lo, hi = bounds(ob); size = hi - lo
report['source_size_xyz'] = [round(v, 3) for v in size]

scene = bpy.context.scene
scene.render.engine = 'BLENDER_WORKBENCH'
scene.display.shading.light = 'STUDIO'
scene.display.shading.color_type = 'TEXTURE'
scene.display.shading.show_cavity = True
scene.render.resolution_x, scene.render.resolution_y = 700, 700
scene.world = bpy.data.worlds.new('w')
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); scene.collection.objects.link(cam); scene.camera = cam
cam.data.type = 'ORTHO'

def shoot(tag, views=(('front', (0, -1, 0)), ('right', (1, 0, 0)), ('back', (0, 1, 0)), ('left', (-1, 0, 0)))):
    lo, hi = bounds(ob); c = (lo + hi) / 2; ext = max(hi - lo) * 1.12
    cam.data.ortho_scale = ext
    for view, d in views:
        d = Vector(d); cam.location = c + d * ext * 3
        cam.rotation_euler = (-d).to_track_quat('-Z', 'Y').to_euler()
        scene.render.filepath = os.path.join(rdir, f'petiole-cut-{tag}-{view}.png')
        bpy.ops.render.render(write_still=True)

if out == '-':
    shoot('original')
    print('PETIOLE_GLB', json.dumps(report, ensure_ascii=False)); sys.exit(0)

bm = bmesh.new(); bm.from_mesh(ob.data)
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=max(size) * 1e-6)
bm.to_mesh(ob.data); bm.free()
report['welded'] = stats(ob)

ratio = min(1.0, target / max(1, report['welded']['tris']))
mod = ob.modifiers.new('decimate', 'DECIMATE'); mod.ratio = ratio; mod.use_collapse_triangulate = True
bpy.ops.object.modifier_apply(modifier=mod.name)
report['after'] = stats(ob); report['ratio'] = round(ratio, 4)

# Upright (Blender Z), spun so the cut faces the front, height 2.0, centred on the box centre.
lo, hi = bounds(ob); c = (lo + hi) / 2; scale = 2.0 / (hi.z - lo.z)
rot = Matrix.Rotation(math.radians(turn), 3, 'Z')
for v in ob.data.vertices: v.co = rot @ ((v.co - c) * scale)
ob.data.update()
for poly in ob.data.polygons: poly.use_smooth = True
lo, hi = bounds(ob); s = hi - lo
report['size_xyz'] = [round(v, 3) for v in s]
report['depth_over_width'] = round(min(s.x, s.y) / max(s.x, s.y), 3)

# Textures: colour and normal at 1024, no metal/rough map (matte plant tissue).
for mat in ob.data.materials:
    if not mat or not mat.use_nodes: continue
    nodes = mat.node_tree.nodes; bsdf = next((nd for nd in nodes if nd.type == 'BSDF_PRINCIPLED'), None)
    if not bsdf: continue
    for sock in ('Metallic', 'Roughness'):
        for link in list(bsdf.inputs[sock].links): mat.node_tree.links.remove(link)
    bsdf.inputs['Metallic'].default_value = 0.0; bsdf.inputs['Roughness'].default_value = 0.8
    for nd in nodes:
        if nd.type == 'TEX_IMAGE' and nd.image and nd.outputs['Color'].links:
            if max(nd.image.size) > 1024: nd.image.scale(1024, 1024)
shoot('result')
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=False, export_image_format='JPEG',
                          export_image_quality=86, export_apply=True, export_yup=True, export_draco_mesh_compression_enable=False,
                          export_tangents=False, export_animations=False, export_cameras=False, export_lights=False)
report['out_MB'] = round(os.path.getsize(out) / 1048576, 2)
with open(os.path.join(rdir, 'petiole-cut-report.json'), 'w', encoding='utf-8') as f: json.dump(report, f, ensure_ascii=False, indent=1)
print('PETIOLE_GLB', json.dumps(report, ensure_ascii=False))
