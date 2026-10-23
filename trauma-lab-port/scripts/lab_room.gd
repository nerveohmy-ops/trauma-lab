extends Node3D
class_name LabRoom
## Лаборатория (порт MAPS.room из env.js: 3 м × 2.6 м). Фаза A — простые материалы,
## плиточный шейдер стен — Фаза D. Передняя сторона (к камере) открыта.

const W := 3.0    # ширина X, м (300 см)
const H := 2.6    # высота, м
const D := 2.6    # глубина Z, м

func _ready() -> void:
	_build()

func _mat(color: Color, rough := 0.85) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_color = color
	m.roughness = rough
	return m

func _box(size: Vector3, pos: Vector3, mat: Material, parent: Node3D = null, collide := true) -> void:
	var holder := parent if parent != null else self
	var mi := MeshInstance3D.new()
	var bm := BoxMesh.new()
	bm.size = size
	mi.mesh = bm
	mi.material_override = mat
	mi.position = pos
	holder.add_child(mi)
	if collide:
		var sb := StaticBody3D.new()
		sb.collision_layer = 1
		sb.collision_mask = 0
		var cs := CollisionShape3D.new()
		var bs := BoxShape3D.new()
		bs.size = size
		cs.shape = bs
		sb.add_child(cs)
		sb.position = pos
		holder.add_child(sb)

var walls := {}   # имя группы стен -> Node3D (left/right скрыт при виде с этой стороны)

func _holder(key: String) -> Node3D:
	var n := Node3D.new()
	n.name = key
	add_child(n)
	walls[key] = n
	return n

func _build() -> void:
	var floor_c := Color(0.13, 0.14, 0.16)
	var wall_c := Color(0.16, 0.185, 0.215)
	var trim_c := Color(0.58, 0.62, 0.66)
	var fl := _holder("floor")
	# пол
	_box(Vector3(W + 0.6, 0.1, D + 0.6), Vector3(0.0, -0.05, 0.0), _mat(floor_c, 0.7), fl)
	# потолок (ловит свет)
	_box(Vector3(W + 0.6, 0.06, D + 0.6), Vector3(0.0, H + 0.03, 0.0), _mat(Color(0.1, 0.11, 0.13)), fl, false)
	# задняя стена + плинтус
	var bk := _holder("back")
	_box(Vector3(W + 0.6, H, 0.12), Vector3(0.0, H * 0.5, -D * 0.5 - 0.06), _mat(wall_c), bk)
	_box(Vector3(W + 0.6, 0.08, 0.02), Vector3(0.0, 0.04, -D * 0.5 + 0.02), _mat(trim_c, 0.5), bk, false)
	# боковые стены + плинтусы
	var lf := _holder("left")
	_box(Vector3(0.12, H, D + 0.6), Vector3(-W * 0.5 - 0.06, H * 0.5, 0.0), _mat(wall_c), lf)
	_box(Vector3(0.02, 0.08, D + 0.6), Vector3(-W * 0.5 + 0.02, 0.04, 0.0), _mat(trim_c, 0.5), lf, false)
	var rt := _holder("right")
	_box(Vector3(0.12, H, D + 0.6), Vector3(W * 0.5 + 0.06, H * 0.5, 0.0), _mat(wall_c), rt)
	_box(Vector3(0.02, 0.08, D + 0.6), Vector3(W * 0.5 - 0.02, 0.04, 0.0), _mat(trim_c, 0.5), rt, false)

## Стена между камерой и телом мешает виду — прячем со стороны ракурса
func set_view(v: String) -> void:
	walls["left"].visible = v != "back"
	walls["right"].visible = v != "front"
	walls["back"].visible = true
