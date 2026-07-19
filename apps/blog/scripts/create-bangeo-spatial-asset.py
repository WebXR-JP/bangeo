"""Create the self-contained GLB used by the BANGEO Spatial Fabric demo.

Run with Blender:
  blender --background --python scripts/create-bangeo-spatial-asset.py
"""

from pathlib import Path
import math

import bpy
from mathutils import Vector


SCRIPT_DIR = Path(__file__).resolve().parent
BLOG_DIR = SCRIPT_DIR.parent
MASCOT_PATH = BLOG_DIR / "public" / "assets" / "mascot" / "vr.png"
OUTPUT_PATH = (
    BLOG_DIR
    / "public"
    / "spatial"
    / "bangeo"
    / "assets"
    / "bangeo-spatial-guide-v3.glb"
)
PREVIEW_PATH = BLOG_DIR / "public" / "assets" / "tech" / "bangeo-spatial-fabric-preview.png"


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)

    for data_collection in (
        bpy.data.meshes,
        bpy.data.curves,
        bpy.data.materials,
        bpy.data.cameras,
        bpy.data.lights,
    ):
        for data_block in list(data_collection):
            if data_block.users == 0:
                data_collection.remove(data_block)


def solid_material(
    name: str,
    color: tuple[float, float, float, float],
    metallic: float = 0.0,
    roughness: float = 0.55,
) -> bpy.types.Material:
    material = bpy.data.materials.new(name=name)
    material.use_nodes = True
    shader = material.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = color
    shader.inputs["Metallic"].default_value = metallic
    shader.inputs["Roughness"].default_value = roughness
    return material


def add_beveled_cube(
    name: str,
    location: tuple[float, float, float],
    dimensions: tuple[float, float, float],
    material: bpy.types.Material,
    bevel_width: float,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    bevel = obj.modifiers.new(name="Soft edges", type="BEVEL")
    bevel.width = bevel_width
    bevel.segments = 4
    obj.data.materials.append(material)
    return obj


def add_text(
    body: str,
    name: str,
    location: tuple[float, float, float],
    size: float,
    extrude: float,
    material: bpy.types.Material,
) -> bpy.types.Object:
    bpy.ops.object.text_add(
        location=location,
        rotation=(math.radians(-90.0), 0.0, 0.0),
    )
    obj = bpy.context.object
    obj.name = name
    obj.data.body = body
    obj.data.align_x = "CENTER"
    obj.data.align_y = "CENTER"
    obj.data.size = size
    obj.data.extrude = extrude
    obj.data.bevel_depth = 0.015
    obj.data.bevel_resolution = 3
    obj.data.materials.append(material)

    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target="MESH")
    obj.scale.x = -1.0
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return obj


def add_mascot_billboard(frame_material: bpy.types.Material) -> None:
    add_beveled_cube(
        name="Mascot frame",
        location=(0.0, 0.0, 2.15),
        dimensions=(3.55, 0.18, 3.55),
        material=frame_material,
        bevel_width=0.12,
    )

    bpy.ops.mesh.primitive_plane_add(
        size=2.0,
        location=(0.0, 0.1, 2.15),
        rotation=(math.radians(-90.0), 0.0, 0.0),
    )
    plane = bpy.context.object
    plane.name = "BANGEO VR mascot"
    plane.scale = (1.65, 1.65, 1.65)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    # Match the image orientation to the front-facing side of the billboard.
    for uv_loop in plane.data.uv_layers.active.data:
        uv_loop.uv.x = 1.0 - uv_loop.uv.x

    material = bpy.data.materials.new(name="BANGEO mascot image")
    material.use_nodes = True
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    shader = nodes.get("Principled BSDF")
    texture = nodes.new("ShaderNodeTexImage")
    texture.image = bpy.data.images.load(str(MASCOT_PATH), check_existing=True)
    links.new(texture.outputs["Color"], shader.inputs["Base Color"])
    shader.inputs["Roughness"].default_value = 0.8
    plane.data.materials.append(material)


def point_at(obj: bpy.types.Object, target: tuple[float, float, float]) -> None:
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def scale_for_browser(scale: float) -> None:
    for obj in list(bpy.context.scene.objects):
        if obj.type != "MESH":
            continue
        obj.location = tuple(component * scale for component in obj.location)
        obj.scale = tuple(component * scale for component in obj.scale)


def render_preview() -> None:
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 1200
    scene.render.resolution_y = 675
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = str(PREVIEW_PATH)

    scene.world.color = (0.008, 0.016, 0.035)
    world_nodes = scene.world.node_tree.nodes if scene.world.use_nodes else None
    if world_nodes is None:
        scene.world.use_nodes = True
        world_nodes = scene.world.node_tree.nodes
    background = world_nodes.get("Background")
    background.inputs["Color"].default_value = (0.008, 0.016, 0.035, 1.0)
    background.inputs["Strength"].default_value = 0.22

    bpy.ops.object.camera_add(location=(4.2, 6.6, 3.3))
    camera = bpy.context.object
    camera.name = "Preview camera"
    camera.data.lens = 50
    point_at(camera, (0.0, 0.0, 1.18))
    scene.camera = camera

    for name, location, energy, color, size in (
        ("Key", (-4.5, 5.0, 7.0), 1100.0, (1.0, 0.82, 0.75), 5.0),
        ("Fill", (4.5, 2.0, 4.5), 850.0, (0.35, 0.72, 1.0), 4.0),
        ("Rim", (0.0, -4.0, 5.5), 1200.0, (0.15, 0.55, 1.0), 3.0),
    ):
        bpy.ops.object.light_add(type="AREA", location=location)
        light = bpy.context.object
        light.name = f"{name} light"
        light.data.energy = energy
        light.data.color = color
        light.data.shape = "DISK"
        light.data.size = size
        point_at(light, (0.0, 0.0, 2.0))

    PREVIEW_PATH.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.render.render(write_still=True)


def build_scene() -> None:
    clear_scene()

    navy = solid_material("BANGEO navy", (0.025, 0.055, 0.11, 1.0), 0.15, 0.35)
    red = solid_material("BANGEO red", (0.8, 0.015, 0.095, 1.0), 0.05, 0.3)
    cyan = solid_material("Spatial cyan", (0.05, 0.7, 0.95, 1.0), 0.1, 0.28)
    white = solid_material("Soft white", (0.95, 0.98, 1.0, 1.0), 0.0, 0.55)

    bpy.ops.mesh.primitive_cylinder_add(
        vertices=64,
        radius=2.45,
        depth=0.24,
        location=(0.0, 0.0, 0.12),
    )
    platform = bpy.context.object
    platform.name = "Spatial platform"
    platform.data.materials.append(navy)

    bpy.ops.mesh.primitive_torus_add(
        major_radius=2.05,
        minor_radius=0.055,
        major_segments=64,
        minor_segments=12,
        location=(0.0, 0.0, 0.26),
    )
    ring = bpy.context.object
    ring.name = "Platform guide ring"
    ring.data.materials.append(cyan)

    add_beveled_cube(
        name="Billboard support",
        location=(0.0, -0.18, 0.95),
        dimensions=(0.34, 0.34, 1.5),
        material=red,
        bevel_width=0.08,
    )

    add_mascot_billboard(navy)

    add_text(
        body="BANGEO",
        name="BANGEO title",
        location=(0.0, 0.13, 4.25),
        size=0.72,
        extrude=0.055,
        material=red,
    )
    add_text(
        body="OPEN SPATIAL INTERNET",
        name="Spatial subtitle",
        location=(0.0, 0.14, 0.48),
        size=0.22,
        extrude=0.025,
        material=white,
    )

    for x_position in (-1.9, 1.9):
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=32,
            ring_count=16,
            radius=0.12,
            location=(x_position, 0.0, 0.4),
        )
        marker = bpy.context.object
        marker.name = "Spatial marker"
        marker.data.materials.append(cyan)

    scale_for_browser(0.55)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(OUTPUT_PATH),
        export_format="GLB",
        export_apply=True,
        export_yup=True,
        export_cameras=False,
        export_lights=False,
        export_extras=True,
    )
    render_preview()


if __name__ == "__main__":
    build_scene()
    print(f"Created {OUTPUT_PATH}")
