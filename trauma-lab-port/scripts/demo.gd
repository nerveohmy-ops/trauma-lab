extends Node3D
## Trauma Lab - demo: Jolt crates raining onto a steel table.

const MAX_CRATES := 60
const SPAWN_INTERVAL := 0.22

var rng := RandomNumberGenerator.new()
var spawned := 0
var spawn_timer := 0.8
var hint: Label
var ring: MeshInstance3D

func _ready() -> void:
	rng.randomize()
	_build_environment()
	_build_floor()
	_build_table()
	_build_ring()
	_build_hud()

func _build_environment() -> void:
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color(0.04, 0.05, 0.08)
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color(0.3, 0.38, 0.5)
	env.ambient_light_energy = 0.8
	var we := WorldEnvironment.new()
	we.environment = env
	we.name = "Env"
	add_child(we)

func _build_floor() -> void:
	var body := StaticBody3D.new()
	body.name = "Floor"
	var mi := MeshInstance3D.new()
	var box := BoxMesh.new()
	box.size = Vector3(12.0, 0.4, 12.0)
	mi.mesh = box
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.16, 0.17, 0.2)
	mat.roughness = 0.85
	mi.material_override = mat
	mi.position = Vector3(0.0, -0.2, 0.0)
	body.add_child(mi)
	var col := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = box.size
	col.shape = shape
	col.position = mi.position
	body.add_child(col)
	add_child(body)

func _build_table() -> void:
	var table := Node3D.new()
	table.name = "Table"
	add_child(table)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.75, 0.76, 0.8)
	mat.roughness = 0.3
	mat.metallic = 0.6
	var top := MeshInstance3D.new()
	var top_box := BoxMesh.new()
	top_box.size = Vector3(2.0, 0.12, 0.9)
	top.mesh = top_box
	top.material_override = mat
	top.position = Vector3(0.0, 0.75, 0.0)
	table.add_child(top)
	for i in 2:
		var leg := MeshInstance3D.new()
		var leg_box := BoxMesh.new()
		leg_box.size = Vector3(0.12, 0.7, 0.9)
		leg.mesh = leg_box
		leg.material_override = mat
		leg.position = Vector3((-0.85 if i == 0 else 0.85), 0.35, 0.0)
		table.add_child(leg)

func _build_ring() -> void:
	ring = MeshInstance3D.new()
	ring.name = "ScannerRing"
	var torus := TorusMesh.new()
	torus.inner_radius = 0.95
	torus.outer_radius = 1.15
	ring.mesh = torus
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.1, 0.9, 0.7)
	mat.emission_enabled = true
	mat.emission = Color(0.1, 0.9, 0.7)
	mat.emission_energy_multiplier = 1.6
	ring.material_override = mat
	ring.position = Vector3(0.0, 1.0, 0.0)
	ring.rotation_degrees = Vector3(0.0, 0.0, 90.0)
	add_child(ring)

func _build_hud() -> void:
	var layer := CanvasLayer.new()
	layer.name = "HUD"
	add_child(layer)
	var title := Label.new()
	title.text = "TRAUMA LAB - Jolt physics"
	title.position = Vector2(24.0, 16.0)
	title.add_theme_font_size_override("font_size", 30)
	layer.add_child(title)
	hint = Label.new()
	hint.text = "Crates: 0"
	hint.position = Vector2(24.0, 60.0)
	hint.add_theme_font_size_override("font_size", 18)
	hint.modulate = Color(0.7, 0.9, 1.0)
	layer.add_child(hint)

func _spawn_crate() -> void:
	var body := RigidBody3D.new()
	var s := rng.randf_range(0.24, 0.5)
	body.position = Vector3(rng.randf_range(-3.5, 3.5), rng.randf_range(6.0, 9.0), rng.randf_range(-3.5, 3.5))
	body.rotation = Vector3(rng.randf() * TAU, rng.randf() * TAU, rng.randf() * TAU)
	var mi := MeshInstance3D.new()
	var box := BoxMesh.new()
	box.size = Vector3(s, s, s)
	mi.mesh = box
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color.from_hsv(rng.randf(), 0.7, 0.95)
	mat.roughness = rng.randf_range(0.35, 0.85)
	mi.material_override = mat
	body.add_child(mi)
	var col := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = box.size
	col.shape = shape
	body.add_child(col)
	add_child(body)

func _process(delta: float) -> void:
	if ring != null:
		ring.rotation_degrees.y += delta * 80.0
	if spawned < MAX_CRATES:
		spawn_timer += delta
		if spawn_timer >= SPAWN_INTERVAL:
			spawn_timer = 0.0
			_spawn_crate()
			spawned += 1
			hint.text = "Crates: %d" % spawned
	for body in get_children():
		if body is RigidBody3D and body.position.y < -6.0:
			body.queue_free()
