extends Node3D
class_name HumanBody3D
## Сборка 3D-тела из данных SimBody (симуляция в сантиметрах, сцена в метрах: ×CM).
## Фаза A — манекен (freeze). Драйвер мышц/баланс — Фаза B.

const CM := 0.01            # см → м
const ARM_Z := 17.5         # плечо вплотную к торсу (TorsoHW до ~17 см), см
const LEG_Z := 8.7          # бёдра почти смыкаются (r=8 → зазор ~1 см), см
## Индексы суставов JS заданы сверху-вниз (a→b), Godot Y-вверх — знак зеркалим.
## (Проверяется визуально в Фазе B: колено должно сгибаться пяткой назад.)
const JSIGN := -1.0

var nodes := {}             # id сегмента -> RigidBody3D
var jnodes: Array = []      # все Generic6DOFJoint3D
var skin_mat: StandardMaterial3D

func _ready() -> void:
	build()

## Боковой сдвиг цепочки конечностей (near = сторона камеры +Z).
## Рука висит вдоль тела с лёгким наклоном внутрь: 17.5 → 16 → 14.
func chain_z(kind: String, side: String) -> float:
	if side == "mid":
		return 0.0
	var s := 1.0 if side == "near" else -1.0
	match kind:
		"uarm": return s * ARM_Z
		"farm": return s * (ARM_Z - 1.5)
		"hand": return s * (ARM_Z - 3.5)
		"thigh": return s * LEG_Z
		"shin": return s * (LEG_Z - 0.4)
		"foot": return s * (LEG_Z - 0.9)
	return s * 2.0

func js_vec(p: Dictionary, z: float) -> Vector3:
	return Vector3(p.x * CM, -p.y * CM, z * CM)

func seg_axis(s: Dictionary) -> Vector3:
	var A: Dictionary = SimBody.P[s.a]
	var B: Dictionary = SimBody.P[s.b]
	return Vector3(B.x - A.x, -(B.y - A.y), 0.0).normalized()

func _skin_material() -> StandardMaterial3D:
	var tone: Vector3 = SimEnv.SKINS.get(SimEnv.OPT.get("skin", "medium"), SimEnv.SKINS["medium"])
	var m := StandardMaterial3D.new()
	m.albedo_color = Color(tone.x / 255.0, tone.y / 255.0, tone.z / 255.0)
	m.roughness = 0.62
	m.metallic = 0.0
	return m

## Кватернион: локальная +Y → dir (короткая дуга).
func up_to_dir(dir: Vector3) -> Quaternion:
	return Quaternion(Vector3.UP, dir.normalized()).normalized()

func build() -> void:
	skin_mat = _skin_material()
	for s in SimBody.segs:
		_add_seg(s)
	for j in SimBody.joints:
		_add_joint(j)
	_add_face()
	_add_shoulders()
	freeze_all(true)

## Косметические меши (без коллизий/физики) в мировых координатах, жёстко на сегменте.
func _cosmetic_ball(parent: Node3D, wpos: Vector3, radius_cm: float, scale := Vector3.ONE) -> void:
	var mi := MeshInstance3D.new()
	var sp := SphereMesh.new()
	sp.radius = radius_cm * CM
	sp.height = sp.radius * 2.0
	sp.radial_segments = 16
	sp.rings = 8
	mi.mesh = sp
	mi.scale = scale
	mi.material_override = skin_mat
	mi.position = parent.to_local(wpos)
	parent.add_child(mi)

func _cosmetic_capsule(parent: Node3D, wa: Vector3, wb: Vector3, radius_cm: float) -> void:
	var mi := MeshInstance3D.new()
	var cap := CapsuleMesh.new()
	cap.radius = radius_cm * CM
	cap.height = (wa - wb).length()
	cap.radial_segments = 14
	cap.rings = 4
	mi.mesh = cap
	mi.material_override = skin_mat
	var dir_l: Vector3 = parent.global_basis.inverse() * (wb - wa).normalized()
	mi.basis = Basis(up_to_dir(dir_l))
	mi.position = parent.to_local((wa + wb) * 0.5)
	parent.add_child(mi)

## Плечевой пояс: ОДИН широкий уплощённый эллипсоид-пояс через оба плеча
## (выходит из-под купола груди только на наружных третях — плавный скос),
## + две дельтоидные массы на руках.
func _add_shoulders() -> void:
	var chest: RigidBody3D = nodes["chest"]
	# пояс: r 8.8 · (толщ X 0.62, выс Y 0.52, ширина Z 2.0) → полукрылья ±17.6 см
	_cosmetic_ball(
		chest,
		js_vec({ "x": 0.0, "y": -140.8 }, 0.0),
		8.8,
		Vector3(0.62, 0.52, 2.0)
	)
	for side in ["near", "far"]:
		var s := 1.0 if side == "near" else -1.0
		var ua: RigidBody3D = nodes[side + "UpperArm"]
		# дельтоид: крупный шар у пина плеча, наплывает на торс
		_cosmetic_ball(ua, js_vec({ "x": 0.2, "y": -134.8 }, s * 16.0), 6.2)

func _add_seg(s: Dictionary) -> void:
	var zc := chain_z(s.kind, s.side)
	var A: Dictionary = SimBody.P[s.a]
	var B: Dictionary = SimBody.P[s.b]
	var mid := (js_vec(A, zc) + js_vec(B, zc)) * 0.5
	var rmax := maxf(s.ra, s.rb) * CM
	var l: float = s.len * CM

	var rb := RigidBody3D.new()
	rb.name = "seg_" + s.id
	rb.mass = maxf(0.2, s.mass)
	rb.position = mid
	rb.basis = Basis(up_to_dir(seg_axis(s)))
	rb.collision_layer = 2     # 1 = комната, 2 = тело
	rb.collision_mask = 1 | 2
	rb.continuous_cd = true

	var cs := CollisionShape3D.new()
	var cap := CapsuleShape3D.new()
	cap.radius = rmax
	# высота = длина сегмента (торцы — ровно точки a/b); голова — почти сфера
	cap.height = maxf(l, rmax * 2.0 + 0.001)
	cs.shape = cap
	rb.add_child(cs)

	var mi := MeshInstance3D.new()
	var cyl := CylinderMesh.new()
	cyl.top_radius = maxf(0.004, s.rb * CM)    # локальная +Y = конец b
	cyl.bottom_radius = maxf(0.004, s.ra * CM) # локальная -Y = конец a
	cyl.height = l
	cyl.radial_segments = 16
	cyl.rings = 2
	mi.mesh = cyl
	mi.material_override = skin_mat
	rb.add_child(mi)

	# сферические «суставные» заглушки на концах (сглаживают тапер)
	var ends := [["a", s.ra, -1.0], ["b", s.rb, 1.0]]
	for e in ends:
		var smi := MeshInstance3D.new()
		var sp := SphereMesh.new()
		sp.radius = (e[1] as float) * CM
		sp.height = sp.radius * 2.0
		sp.radial_segments = 14
		sp.rings = 7
		smi.mesh = sp
		smi.material_override = skin_mat
		smi.position = Vector3(0.0, l * 0.5 * (e[2] as float), 0.0)
		rb.add_child(smi)

	add_child(rb)
	nodes[s.id] = rb

func _add_joint(j: Dictionary) -> void:
	var pS: Dictionary = SimBody.segs[j.p]
	var cS: Dictionary = SimBody.segs[j.c]
	var Ap: Dictionary = SimBody.P[pS.a]
	var Bp: Dictionary = SimBody.P[pS.b]
	var t: float = j.t
	var pin := js_vec({ "x": Ap.x + (Bp.x - Ap.x) * t, "y": Ap.y + (Bp.y - Ap.y) * t }, chain_z(cS.kind, cS.side))

	var gj := Generic6DOFJoint3D.new()
	gj.position = pin
	gj.node_a = nodes[pS.id].get_path()
	gj.node_b = nodes[cS.id].get_path()
	# линейные оси — жёсткий пин
	for ax in ["x", "y", "z"]:
		match ax:
			"x":
				gj.set_flag_x(Generic6DOFJoint3D.FLAG_ENABLE_LINEAR_LIMIT, true)
				gj.set_param_x(Generic6DOFJoint3D.PARAM_LINEAR_UPPER_LIMIT, 0.0)
				gj.set_param_x(Generic6DOFJoint3D.PARAM_LINEAR_LOWER_LIMIT, 0.0)
			"y":
				gj.set_flag_y(Generic6DOFJoint3D.FLAG_ENABLE_LINEAR_LIMIT, true)
				gj.set_param_y(Generic6DOFJoint3D.PARAM_LINEAR_UPPER_LIMIT, 0.0)
				gj.set_param_y(Generic6DOFJoint3D.PARAM_LINEAR_LOWER_LIMIT, 0.0)
			"z":
				gj.set_flag_z(Generic6DOFJoint3D.FLAG_ENABLE_LINEAR_LIMIT, true)
				gj.set_param_z(Generic6DOFJoint3D.PARAM_LINEAR_UPPER_LIMIT, 0.0)
				gj.set_param_z(Generic6DOFJoint3D.PARAM_LINEAR_LOWER_LIMIT, 0.0)
	# вращение: X/Y — жёсткая блокировка; Z = сгиб в сагиттальной плоскости
	for ax in ["x", "y"]:
		match ax:
			"x":
				gj.set_flag_x(Generic6DOFJoint3D.FLAG_ENABLE_ANGULAR_LIMIT, true)
				gj.set_param_x(Generic6DOFJoint3D.PARAM_ANGULAR_UPPER_LIMIT, 0.0)
				gj.set_param_x(Generic6DOFJoint3D.PARAM_ANGULAR_LOWER_LIMIT, 0.0)
			"y":
				gj.set_flag_y(Generic6DOFJoint3D.FLAG_ENABLE_ANGULAR_LIMIT, true)
				gj.set_param_y(Generic6DOFJoint3D.PARAM_ANGULAR_UPPER_LIMIT, 0.0)
				gj.set_param_y(Generic6DOFJoint3D.PARAM_ANGULAR_LOWER_LIMIT, 0.0)
	gj.set_flag_z(Generic6DOFJoint3D.FLAG_ENABLE_ANGULAR_LIMIT, true)
	gj.set_param_z(Generic6DOFJoint3D.PARAM_ANGULAR_UPPER_LIMIT, JSIGN * j.min)
	gj.set_param_z(Generic6DOFJoint3D.PARAM_ANGULAR_LOWER_LIMIT, JSIGN * j.max)
	add_child(gj)
	jnodes.append(gj)

func _add_face() -> void:
	if not nodes.has("head") or not SimBody.ORG.has("eye"):
		return
	var head: RigidBody3D = nodes["head"]
	var eye: Dictionary = SimBody.ORG["eye"]
	var w := SimBody.to_world(SimBody.SEG["head"], eye.s, eye.w)
	var base := Vector3(w.x * CM, -w.y * CM, 0.0)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.88, 0.87, 0.82)
	mat.roughness = 0.15
	for sd in [1.0, -1.0]:
		var mi := MeshInstance3D.new()
		var sp := SphereMesh.new()
		sp.radius = 1.1 * CM
		sp.height = 2.2 * CM
		sp.radial_segments = 12
		sp.rings = 6
		mi.mesh = sp
		mi.material_override = mat
		mi.position = head.to_local(base + Vector3(0.0, 0.0, sd * 3.1 * CM))
		head.add_child(mi)

func freeze_all(on: bool) -> void:
	for rb in nodes.values():
		rb.freeze = on
