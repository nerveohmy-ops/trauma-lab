extends Node3D
## Главная сцена (Фаза A): человек-манекен, лаборатория, камера с ракурсами
## side/front/back, pan/pinch/zoom, HUD с виталами.

const FOV := 55.0
const VITAL_PERIOD := 0.25

var cam_rig: Node3D
var cam: Camera3D
var yaw := 0.0             # радианы
var yaw_target := 0.0      # градусы
var dist := 2.95
var target := Vector3(0.0, 0.92, 0.0)
var body_root: HumanBody3D
var room: LabRoom
var hud: Control
var vital_t := 0.0

var touches := {}          # pointer index -> Vector2
var pinch_base := 0.0
var last_tap_ms := 0
var pan_pointer := -1
const MOUSE_ID := 100

func _ready() -> void:
	SimEnv.OPT["scene"] = "room"
	SimBody.make_body()
	_build_world()
	_build_hud()
	_apply_view("side")

func _build_world() -> void:
	room = LabRoom.new()
	add_child(room)

	var sun := DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-52.0, 28.0, 0.0)
	sun.light_energy = 1.1
	sun.light_color = Color(1.0, 0.97, 0.92)
	sun.shadow_enabled = true
	add_child(sun)

	var key := OmniLight3D.new()
	key.position = Vector3(0.6, 2.3, 1.2)
	key.light_energy = 1.6
	key.omni_range = 4.0
	key.light_color = Color(1.0, 0.93, 0.85)
	add_child(key)

	var rim := OmniLight3D.new()
	rim.position = Vector3(-1.4, 2.0, -1.2)
	rim.light_energy = 0.8
	rim.omni_range = 4.0
	rim.light_color = Color(0.7, 0.8, 1.0)
	add_child(rim)

	var env_node := WorldEnvironment.new()
	var e := Environment.new()
	e.background_mode = Environment.BG_COLOR
	e.background_color = Color(0.055, 0.065, 0.09)
	e.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	e.ambient_light_color = Color(0.55, 0.6, 0.7)
	e.ambient_light_energy = 0.8
	env_node.environment = e
	add_child(env_node)

	body_root = HumanBody3D.new()
	add_child(body_root)

	cam_rig = Node3D.new()
	cam = Camera3D.new()
	cam.fov = FOV
	cam.near = 0.05
	cam.position = Vector3(0.0, 0.0, dist)
	cam_rig.add_child(cam)
	cam_rig.position = target
	add_child(cam_rig)
	cam.current = true

func _build_hud() -> void:
	var layer := CanvasLayer.new()
	add_child(layer)
	hud = load("res://scripts/hud.gd").new()
	hud.view_requested.connect(_on_view)
	layer.add_child(hud)

func _on_view(v: String) -> void:
	_apply_view(v)

func _apply_view(v: String) -> void:
	SimEnv.view = v
	match v:
		"front": yaw_target = 90.0    # камера на +X, смотрит на лицо
		"back": yaw_target = -90.0    # камера на −X, смотрит на спину
		_: yaw_target = 0.0           # сбоку: +Z
	if room:
		room.set_view(v)

func _process(dt: float) -> void:
	yaw = lerp_angle(yaw, deg_to_rad(yaw_target), minf(1.0, dt * 6.0))
	cam_rig.rotation.y = yaw
	cam.position = Vector3(0.0, 0.0, dist)
	cam_rig.position = target
	vital_t += dt
	if vital_t > VITAL_PERIOD:
		vital_t = 0.0
		hud.set_vitals(SimBody.V)

# ---------- ввод: pan / pinch / double-tap ----------

func _unhandled_input(ev: InputEvent) -> void:
	if ev is InputEventScreenTouch:
		_touch(ev.index, ev.position, ev.pressed)
	elif ev is InputEventScreenDrag:
		_drag(ev.index, ev.position, ev.relative)
	elif ev is InputEventMouseButton and ev.pressed:
		match ev.button_index:
			MOUSE_BUTTON_WHEEL_UP: dist = clampf(dist * 0.92, 0.7, 7.0)
			MOUSE_BUTTON_WHEEL_DOWN: dist = clampf(dist * 1.08, 0.7, 7.0)
			MOUSE_BUTTON_LEFT: _touch(MOUSE_ID, ev.position, true)
	elif ev is InputEventMouseMotion and touches.has(MOUSE_ID):
		_drag(MOUSE_ID, ev.position, ev.relative)
	elif ev is InputEventMouseButton and not ev.pressed and ev.button_index == MOUSE_BUTTON_LEFT:
		_touch(MOUSE_ID, ev.position, false)
	elif ev is InputEventKey and ev.pressed and not ev.echo:
		match ev.keycode:
			KEY_1: _apply_view("side")
			KEY_2: _apply_view("front")
			KEY_3: _apply_view("back")
			KEY_F: _fit()

func _touch(i: int, pos: Vector2, pressed: bool) -> void:
	if pressed:
		touches[i] = pos
		if touches.size() == 2:
			var keys := touches.keys()
			pinch_base = touches[keys[0]].distance_to(touches[keys[1]])
			pan_pointer = -1
		else:
			pan_pointer = i
			var now := Time.get_ticks_msec()
			if now - last_tap_ms < 320:
				_fit()
			last_tap_ms = now
	else:
		touches.erase(i)
		pinch_base = 0.0
		if pan_pointer == i:
			var rest := touches.keys()
			pan_pointer = rest[0] if rest.size() > 0 else -1

func _drag(i: int, pos: Vector2, rel: Vector2) -> void:
	touches[i] = pos
	if touches.size() >= 2:
		var keys := touches.keys()
		var d: float = touches[keys[0]].distance_to(touches[keys[1]])
		if pinch_base > 0.0 and d > 0.0:
			dist = clampf(dist * (pinch_base / d), 0.7, 7.0)
			pinch_base = d
		return
	if i != pan_pointer or i < 0:
		return
	var h := float(get_viewport().get_visible_rect().size.y)
	var wpp := 2.0 * dist * tan(deg_to_rad(FOV) * 0.5) / h
	var right := cam.global_basis.x
	target.x = clampf(target.x - right.x * rel.x * wpp, -1.6, 1.6)
	target.z = clampf(target.z - right.z * rel.x * wpp, -1.8, 1.8)
	target.y = clampf(target.y + rel.y * wpp, 0.15, 2.1)

func _fit() -> void:
	var aspect := 720.0 / 1280.0
	var vfov := deg_to_rad(FOV)
	var hfov := 2.0 * atan(tan(vfov * 0.5) * aspect)
	var dh := (2.05 * 0.5) / tan(vfov * 0.5)
	var dw := (1.15 * 0.5) / tan(hfov * 0.5)
	dist = clampf(maxf(dh, dw), 0.7, 7.0)
	target = Vector3(0.0, 0.95, 0.0)
