extends Object
class_name SimMath
## Порт core/math.js — чистые функции без состояния.
## Единицы JS (сантиметры); 3D-мир переводит через SimEnv.CM (0.01).

const D2R := PI / 180.0

static func rnd(a: float, b: float) -> float:
	return a + randf() * (b - a)

static func rndi(a: int, b: int) -> int:
	return a + randi() % maxi(1, b - a + 1)

static func ease_t(t: float) -> float:
	return 2.0 * t * t if t < 0.5 else 1.0 - pow(-2.0 * t + 2.0, 2.0) / 2.0

## Нормализация угла в [-PI, PI] (имя wrap() занято глобальным builtin)
static func norm_ang(a: float) -> float:
	while a > PI:
		a -= TAU
	while a < -PI:
		a += TAU
	return a

static func ang_lerp(a: float, b: float, t: float) -> float:
	return a + norm_ang(b - a) * t

## Точка ↔ отрезок (2D): расстояние, параметр t, ближайшая точка.
static func dps(px: float, py: float, ax: float, ay: float, bx: float, by: float) -> Dictionary:
	var dx := bx - ax
	var dy := by - ay
	var l2 := dx * dx + dy * dy
	var t := 0.0 if l2 == 0.0 else clampf(((px - ax) * dx + (py - ay) * dy) / l2, 0.0, 1.0)
	var qx := ax + dx * t
	var qy := ay + dy * t
	return { "d": sqrt((px - qx) * (px - qx) + (py - qy) * (py - qy)), "t": t, "qx": qx, "qy": qy }

## То же в 3D (для хитов по сегментам).
static func dps3(p: Vector3, a: Vector3, b: Vector3) -> Dictionary:
	var d := b - a
	var l2 := d.length_squared()
	var t := 0.0 if l2 == 0.0 else clampf((p - a).dot(d) / l2, 0.0, 1.0)
	var q := a + d * t
	return { "d": p.distance_to(q), "t": t, "q": q }

static func seg_intersects(a: Vector2, b: Vector2, c: Vector2, d: Vector2) -> bool:
	var d1 := (d.x - c.x) * (a.y - c.y) - (d.y - c.y) * (a.x - c.x)
	var d2 := (d.x - c.x) * (b.y - c.y) - (d.y - c.y) * (b.x - c.x)
	var d3 := (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
	var d4 := (b.x - a.x) * (d.y - a.y) - (b.y - a.y) * (d.x - a.x)
	return (d1 > 0.0) != (d2 > 0.0) and (d3 > 0.0) != (d4 > 0.0)

## JS-полигон: массив пар [сдвиг_вдоль, поперёк]; poly_w — ширина в точке sv.
static func poly_w(pts: Array, sv: float) -> float:
	if sv <= pts[0][0]:
		return pts[0][1]
	for i in range(pts.size() - 1):
		var a: Array = pts[i]
		var b: Array = pts[i + 1]
		if sv <= b[0]:
			return lerp(a[1], b[1], (sv - a[0]) / maxf(1e-9, b[0] - a[0]))
	return pts[pts.size() - 1][1]

## Детерминированный хеш-шум (порт hsh из world.js).
static func hsh(i: float) -> float:
	var x := sin(i * 127.1 + 311.7) * 43758.5453
	return x - floor(x)

static func gauss(t: float, m: float, s: float) -> float:
	return exp(-((t - m) * (t - m)) / (2.0 * s * s))
