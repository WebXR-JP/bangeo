"""Generate the UV-textured BANGEO fish, GLB, and animated preview.

Run with Blender 5.1: blender --background --python create-mascot.py
"""

from pathlib import Path
import math
import subprocess

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
FRAMES = ROOT / ".preview-frames"
ASSETS.mkdir(exist_ok=True)
FRAMES.mkdir(exist_ok=True)

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)


def material(name, color, image=None):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Roughness"].default_value = 0.72
    if image:
        tex = mat.node_tree.nodes.new("ShaderNodeTexImage")
        tex.image = image
        mat.node_tree.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    return mat


# The body is a proper UV sphere, with a painted equirectangular color texture.
width, height = 512, 256
image = bpy.data.images.new("BANGEO painted scales", width=width, height=height, alpha=True)
pixels = [0.0] * (width * height * 4)
for y in range(height):
    v = y / (height - 1)
    for x in range(width):
        u = x / (width - 1)
        scale = 0.5 + 0.5 * math.cos(u * 2 * math.pi * 22 + math.sin(v * 25) * 1.6)
        stripe = 0.5 + 0.5 * math.cos(v * 2 * math.pi * 10)
        shade = 0.90 + 0.08 * scale * stripe
        blush = 0.035 * math.sin(u * math.pi) ** 2
        idx = (y * width + x) * 4
        pixels[idx:idx + 4] = (min(1, (0.83 + blush) * shade), 0.20 * shade, 0.29 * shade, 1)
image.pixels = pixels
image.filepath_raw = str(ASSETS / "mascot-body.png")
image.file_format = "PNG"
image.save()

pink = material("Painted pink body", (1, 1, 1), image)
rose = material("Rose fins", (0.66, 0.10, 0.20))
white = material("Ivory belly", (0.97, 0.97, 0.95))
black = material("Ink eyes", (0.035, 0.035, 0.045))
highlight = material("Eye glint", (1, 1, 1))
parts = []


def ellipsoid(name, location, scale, mat, segments=32, rings=20):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(mat)
    bpy.ops.object.shade_smooth()
    parts.append(obj)
    return obj


def fin(name, points, mat):
    # A double-sided soft fin: four vertices in a fan, with UVs for inspection.
    verts = [points[0], points[1], points[2], points[3]]
    faces = [(0, 1, 2), (0, 2, 3), (2, 1, 0), (3, 2, 0)]
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    uv = mesh.uv_layers.new(name="Fin UV")
    coords = [(0, 0), (1, 0), (1, 1), (0, 1)]
    for poly in mesh.polygons:
        for loop_index in poly.loop_indices:
            uv.data[loop_index].uv = coords[mesh.loops[loop_index].vertex_index]
    obj.data.materials.append(mat)
    parts.append(obj)
    return obj


ellipsoid("Round body", (0, 0, 0), (0.72, 0.38, 0.56), pink)
ellipsoid("White face and belly", (0.25, -0.23, -0.16), (0.49, 0.25, 0.36), white)
ellipsoid("Left eye", (-0.12, -0.373, 0.22), (0.073, 0.035, 0.115), black, 20, 12)
ellipsoid("Right eye", (0.37, -0.38, 0.20), (0.066, 0.035, 0.108), black, 20, 12)
ellipsoid("Left eye glint", (-0.145, -0.408, 0.265), (0.020, 0.012, 0.029), highlight, 12, 8)
ellipsoid("Right eye glint", (0.35, -0.418, 0.245), (0.018, 0.012, 0.026), highlight, 12, 8)
ellipsoid("Smile", (0.15, -0.48, -0.075), (0.11, 0.024, 0.042), black, 20, 12)
fin("Dorsal fin", [(-0.39, 0.0, 0.42), (-0.46, 0.0, 0.83), (0.08, 0.0, 0.56), (0.22, 0.0, 0.45)], rose)
fin("Tail upper", [(-0.60, 0, 0.02), (-1.12, 0, 0.42), (-1.08, 0, 0.08), (-0.72, 0, -0.04)], rose)
fin("Tail lower", [(-0.72, 0, -0.04), (-1.08, 0, -0.08), (-1.04, 0, -0.40), (-0.61, 0, -0.22)], rose)
fin("Left side fin", [(-0.48, -0.27, -0.04), (-0.91, -0.47, -0.02), (-0.68, -0.50, -0.26), (-0.37, -0.33, -0.20)], rose)
fin("Right side fin", [(0.56, 0.10, -0.01), (1.00, 0.16, 0.02), (0.78, 0.19, -0.24), (0.52, 0.12, -0.18)], rose)

# Apply transforms and join, leaving one glTF mesh with textured and solid primitives.
for obj in parts:
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bpy.ops.object.select_all(action="DESELECT")
for obj in parts:
    obj.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.join()
fish = bpy.context.object
fish.name = "BANGEO UV fish"
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(ASSETS / "bangeo-fish.blend"))
bpy.ops.export_scene.gltf(filepath=str(ASSETS / "bangeo-fish.glb"), export_format="GLB", use_selection=True, export_apply=True)

# Render a short turntable. This is a scene preview, not measured Quest output.
scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 480
scene.render.resolution_y = 360
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.world.color = (0.95, 0.97, 0.98)
scene.world.use_nodes = True
scene.world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.93, 0.96, 0.99, 1)
scene.world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.8
bpy.ops.object.camera_add(location=(0, -4.2, 1.0))
camera = bpy.context.object
camera.rotation_euler = (Vector((0, 0, 0)) - camera.location).to_track_quat("-Z", "Y").to_euler()
camera.data.type = "ORTHO"
camera.data.ortho_scale = 3.1
scene.camera = camera
for location, energy, size in [((-2, -3, 4), 550, 4), ((3, 0, 2), 340, 3)]:
    bpy.ops.object.light_add(type="AREA", location=location)
    light = bpy.context.object
    light.data.energy = energy
    light.data.size = size
    light.rotation_euler = (Vector((0, 0, 0)) - light.location).to_track_quat("-Z", "Y").to_euler()
scene.render.film_transparent = True
for frame in range(18):
    fish.rotation_euler.z = math.radians(-18 + 36 * (0.5 - 0.5 * math.cos(2 * math.pi * frame / 18)))
    fish.location.z = 0.055 * math.sin(2 * math.pi * frame / 18)
    scene.render.filepath = str(FRAMES / f"{frame:03}.png")
    bpy.ops.render.render(write_still=True)

subprocess.run([
    "ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", "color=c=0xfff1f2:s=480x360:r=9",
    "-framerate", "9", "-i", str(FRAMES / "%03d.png"),
    "-filter_complex", "[0:v][1:v]overlay=shortest=1:format=auto,split[a][b];[a]palettegen[p];[b][p]paletteuse",
    "-frames:v", "18",
    str(ASSETS / "bangeo-fish-preview.gif"),
], check=True)
for frame in FRAMES.glob("*.png"):
    frame.unlink()
FRAMES.rmdir()
print("Created", ASSETS / "bangeo-fish.glb", ASSETS / "bangeo-fish-preview.gif")
