extends Node
## Порт sim/body.js — модель тела: точки, сегменты, суставы, органы, сосуды, кости.
## Вся геометрия в сантиметрах как в JS (y вверх = отрицательный	y, пол y=0).
## 3D-сцена метро-масштаб строится отсюда через CM (0.01).

const D2R := PI / 180.0

# кто загружен в глобальные поля тела (0 = испытуемый, иначе id охранника)
var BID := 0
var ACT: Dictionary = { "on": false }
var BCUR: Dictionary = { "id": 0, "name": "", "st": null }
var BODIES: Array = []

# globals тела
var P: Array = []
var segs: Array = []
var joints: Array = []
var SEG: Dictionary = {}
var ORG: Dictionary = {}
var BONES: Array = []
var VESSELS: Array = []
var ORDER: Array = []
var FACE := 1
var FP: Array = []
var V: Dictionary = {}
var DR: Dictionary = {}
var NOBREATH := false

const POSE := {
	"stand": { "neck": 0.0, "head": 0.0, "spine": 0.0, "shoulder": 0.0, "elbow": -8.0, "wrist": 0.0, "hip": 0.0, "knee": 2.0, "ankle": 0.0, "weld": 0.0 },
	"crouch": { "neck": 8.0, "head": 6.0, "spine": -28.0, "shoulder": -35.0, "elbow": -55.0, "wrist": 0.0, "hip": -100.0, "knee": 125.0, "ankle": -28.0, "weld": 0.0 },
	"lie": { "neck": 8.0, "head": 0.0, "spine": -4.0, "shoulder": -15.0, "elbow": -25.0, "wrist": -10.0, "hip": -12.0, "knee": 18.0, "ankle": 5.0, "weld": 0.0 },
	"fetal": { "neck": 30.0, "head": 20.0, "spine": -45.0, "shoulder": -75.0, "elbow": -125.0, "wrist": -25.0, "hip": -108.0, "knee": 128.0, "ankle": -10.0, "weld": 0.0 },
	"flinch": { "neck": 22.0, "head": 15.0, "spine": -22.0, "shoulder": -60.0, "elbow": -110.0, "wrist": -10.0, "hip": -28.0, "knee": 32.0, "ankle": 0.0, "weld": 0.0 },
	"sit": { "neck": 4.0, "head": 2.0, "spine": -6.0, "shoulder": -20.0, "elbow": -60.0, "wrist": 0.0, "hip": -100.0, "knee": 115.0, "ankle": -18.0, "weld": 0.0 },
}

const JK := { "weld": 0.5, "neck": 0.3, "head": 0.3, "spine": 0.35, "shoulder": 0.12, "elbow": 0.12, "wrist": 0.06, "hip": 0.32, "knee": 0.34, "ankle": 0.25 }

const ARMP := {
	"zombie": { "shoulder": -95.0, "elbow": -12.0, "wrist": -10.0, "neck": 20.0, "head": 14.0 },
	"flail": { "shoulder": -115.0, "elbow": -70.0, "wrist": -10.0, "neck": 15.0 },
	"handsup": { "shoulder": -166.0, "elbow": -22.0, "wrist": -10.0 },
	"cover": { "shoulder": -152.0, "elbow": -142.0, "wrist": -25.0, "neck": 22.0, "head": 12.0 },
	"crawl": { "shoulder": -115.0, "elbow": -35.0, "wrist": 0.0 },
}

const WR := { "weld": 0.0, "neck": 10.0, "head": 8.0, "spine": 8.0, "shoulder": 28.0, "elbow": 30.0, "wrist": 20.0, "hip": 22.0, "knee": 28.0, "ankle": 12.0 }

# порт sim/physiology.js DRUGS (полная таблица, используется лечением и химией)
const DRUGS := {
	"painkiller": { "key": "pk", "name": "Paracetamol 1 g", "short": "Paracetamol", "onset": 0.12, "half": 300.0, "col": Color("#9fd3ff") },
	"morphine": { "key": "mor", "name": "Morphine 10 mg", "short": "Morphine", "onset": 0.35, "half": 150.0, "col": Color("#c9a6ff") },
	"adrenaline": { "key": "adr", "name": "Adrenaline 1 mg", "short": "Adrenaline", "onset": 1.5, "half": 30.0, "col": Color("#ff9a5c") },
	"naloxone": { "key": "nal", "name": "Naloxone 0.4 mg", "short": "Naloxone", "onset": 1.0, "half": 60.0, "col": Color("#6fe39a") },
	"txa": { "key": "txa", "name": "Tranexamic acid 1 g", "short": "TXA", "onset": 0.3, "half": 400.0, "col": Color("#f2b441") },
	"sedative": { "key": "sed", "name": "Midazolam 5 mg", "short": "Midazolam", "onset": 0.35, "half": 120.0, "col": Color("#8fb0ff") },
	"fentanyl": { "key": "fen", "name": "Fentanyl 100 mcg", "short": "Fentanyl", "onset": 1.4, "half": 80.0, "col": Color("#b38cff") },
	"ketamine": { "key": "ket", "name": "Ketamine 50 mg", "short": "Ketamine", "onset": 1.0, "half": 110.0, "col": Color("#7fd6c9") },
	"atropine": { "key": "atr", "name": "Atropine 1 mg", "short": "Atropine", "onset": 1.2, "half": 140.0, "col": Color("#ffd36b") },
	"amiodarone": { "key": "ami", "name": "Amiodarone 300 mg", "short": "Amiodarone", "onset": 0.6, "half": 600.0, "col": Color("#ff7fa8") },
	"caffeine": { "key": "caf", "name": "Caffeine", "short": "Caffeine", "onset": 0.5, "half": 400.0, "col": Color("#c8a27a") },
	"alcohol": { "key": "alc", "name": "Alcohol", "short": "Alcohol", "onset": 0.3, "half": 300.0, "col": Color("#e6c75a") },
	"cocaine": { "key": "coc", "name": "Cocaine", "short": "Cocaine", "onset": 1.2, "half": 90.0, "col": Color("#f0f0f0") },
	"lsd": { "key": "lsd", "name": "LSD", "short": "LSD", "onset": 0.25, "half": 500.0, "col": Color("#ff7ae6") },
	"cyanide": { "key": "cyn", "name": "Cyanide", "short": "Cyanide", "onset": 1.5, "half": 900.0, "col": Color("#9be37a") },
	"venom": { "key": "ven", "name": "Snake venom", "short": "Venom", "onset": 0.6, "half": 900.0, "col": Color("#b56b2b") },
	"arsenic": { "key": "ars", "name": "Arsenic", "short": "Arsenic", "onset": 0.2, "half": 900.0, "col": Color("#a0a8b0") },
	"cyanokit": { "key": "ckt", "name": "Cyanide antidote", "short": "Cyanokit", "onset": 1.2, "half": 120.0, "col": Color("#ff4a4a") },
	"antivenom": { "key": "avn", "name": "Antivenom", "short": "Antivenom", "onset": 0.8, "half": 200.0, "col": Color("#7fd0ff") },
	"chelator": { "key": "chl", "name": "Chelator (BAL)", "short": "Chelator", "onset": 0.6, "half": 200.0, "col": Color("#d3b8ff") },
	"zvirus": { "key": "zom", "name": "Zombie virus", "short": "Z-virus", "onset": 2.0, "half": 1e9, "col": Color("#7fd14a") },
	"ultra": { "key": "uls", "name": "Ultra serum", "short": "Ultra", "onset": 1.2, "half": 150.0, "col": Color("#ffd84d") },
	"radx": { "key": "rdx", "name": "Radiation antidote", "short": "Rad antidote", "onset": 1.2, "half": 120.0, "col": Color("#9ff07a") },
	"inhibitor": { "key": "inh", "name": "Universal inhibitor", "short": "Inhibitor", "onset": 1.3, "half": 90.0, "col": Color("#ff5d73") },
	"serum": { "key": "ser", "name": "Super-soldier serum", "short": "Serum", "onset": 0.8, "half": 90.0, "col": Color("#56f0ff") },
	"flumazenil": { "key": "flu", "name": "Flumazenil 0.5 mg", "short": "Flumazenil", "onset": 1.2, "half": 50.0, "col": Color("#9be37a") },
}

const STEM := { "w": -0.8, "s": 4.0, "rw": 1.4, "rs": 2.6 }
const LIMBK := ["uarm", "farm", "hand", "thigh", "shin", "foot"]

const FORG := {
	"brain": [0.0, -167.0, 6.9, 6.6], "eye": [3.2, -163.6, 1.25, 1.1], "trachea": [0.0, -145.0, 1.2, 7.5],
	"esophagus": [-0.6, -145.0, 0.7, 6.0], "lungR": [-8.1, -129.4, 5.9, 13.2], "lungL": [8.2, -129.4, 5.5, 13.2],
	"heart": [2.1, -124.6, 4.7, 6.2], "liver": [-3.6, -109.0, 9.6, 4.6], "gallbladder": [-6.5, -104.4, 1.1, 1.6],
	"stomach": [6.2, -106.4, 4.7, 6.0], "spleen": [11.8, -107.8, 1.6, 3.1], "pancreas": [3.6, -102.2, 4.6, 1.2],
	"kidneyR": [-8.7, -100.4, 2.4, 3.6], "kidneyL": [8.7, -100.4, 2.4, 3.6], "intest": [0.0, -95.0, 9.8, 6.6],
	"bladder": [0.0, -87.2, 2.8, 2.2],
}

const ORG_ORDER := ["brain", "eye", "trachea", "esophagus", "heart", "lungL", "lungR", "liver", "gallbladder", "stomach", "pancreas", "spleen", "kidneyL", "kidneyR", "intest", "bladder"]

func add_p(x: float, y: float, m: float, r: float, seg_idx: int, end: String) -> int:
	P.append({ "x": x, "y": y, "px": x, "py": y, "m": m, "im": 1.0 / max(0.0001, m), "r": r, "seg": seg_idx, "end": end })
	return P.size() - 1

static func rad_s(seg: Dictionary, s: float) -> float:
	if s < 0.0:
		return sqrt(maxf(0.0, seg.ra * seg.ra - s * s))
	if s > seg.len:
		var d: float = s - seg.len
		return sqrt(maxf(0.0, seg.rb * seg.rb - d * d))
	return rad(seg, s / seg.len)

static func rad(seg: Dictionary, t: float) -> float:
	return seg.ra + (seg.rb - seg.ra) * t

## Каркас сегмента в мировых координатах точек (JS frame())
func frame(seg: Dictionary) -> Dictionary:
	var A: Dictionary = P[seg.a]
	var B: Dictionary = P[seg.b]
	var ux: float = B.x - A.x
	var uy: float = B.y - A.y
	var L := sqrt(ux * ux + uy * uy)
	if L == 0.0: L = 1.0
	ux /= L
	uy /= L
	return { "ax": A.x, "ay": A.y, "ux": ux, "uy": uy, "nx": uy * FACE, "ny": -ux * FACE, "L": L }

func to_local(seg: Dictionary, x: float, y: float) -> Dictionary:
	var f := frame(seg)
	var dx: float = x - f.ax
	var dy: float = y - f.ay
	return { "s": dx * f.ux + dy * f.uy, "w": dx * f.nx + dy * f.ny }

func to_world(seg: Dictionary, s: float, w: float) -> Dictionary:
	var f := frame(seg)
	return { "x": f.ax + f.ux * s + f.nx * w, "y": f.ay + f.uy * s + f.ny * w }

func dir_world(seg: Dictionary, dw: float, ds: float) -> Dictionary:
	var f := frame(seg)
	return { "x": f.nx * dw + f.ux * ds, "y": f.ny * dw + f.uy * ds }

func dir_local(seg: Dictionary, dx: float, dy: float) -> Dictionary:
	var f := frame(seg)
	return { "w": dx * f.nx + dy * f.ny, "s": dx * f.ux + dy * f.uy }

static func is_bite(w: Dictionary) -> bool:
	return w.type == "hole" and w.dig and w.r >= 1.2 and not (w.get("sut", 0.0) >= 1.0)

func bites_of(seg: Dictionary) -> Array:
	if not seg.get("hasBite", false):
		return []
	return seg.wounds.filter(func(w): return is_bite(w))

func inside_seg(seg: Dictionary, x: float, y: float) -> bool:
	var A: Dictionary = P[seg.a]
	var B: Dictionary = P[seg.b]
	var r := SimMath.dps(x, y, A.x, A.y, B.x, B.y)
	if r.d >= rad(seg, r.t):
		return false
	if seg.get("hasBite", false):
		var L := to_local(seg, x, y)
		for w in seg.wounds:
			if is_bite(w) and sqrt((L.w - w.w) * (L.w - w.w) + (L.s - w.s) * (L.s - w.s)) < w.r * 0.72:
				return false
	return true

func body_get() -> Dictionary:
	return { "P": P, "segs": segs, "joints": joints, "SEG": SEG, "ORG": ORG, "BONES": BONES, "VESSELS": VESSELS, "ORDER": ORDER, "V": V, "DR": DR, "FP": FP, "FEMALE": SimEnv.FEMALE, "FACE": FACE, "NOBREATH": NOBREATH, "ACT": ACT }

func body_set(s: Dictionary) -> void:
	P = s.P; segs = s.segs; joints = s.joints; SEG = s.SEG; ORG = s.ORG
	BONES = s.BONES; VESSELS = s.VESSELS; ORDER = s.ORDER; V = s.V; DR = s.DR
	FP = s.FP; SimEnv.FEMALE = s.FEMALE; FACE = s.FACE; NOBREATH = s.NOBREATH; ACT = s.ACT

func body_use(b: Dictionary) -> void:
	if b == BCUR:
		return
	BCUR.st = body_get()
	body_set(b.st)
	b.st = null
	BID = b.id
	BCUR = b

func with_body(b: Dictionary, fn: Callable) -> void:
	var pv := BCUR
	body_use(b)
	fn.call(b)
	body_use(pv)

func make_body() -> void:
	FACE = 1
	P = []
	segs = []
	joints = []
	SEG = {}
	ORG = {}
	BONES = []
	VESSELS = []
	ORDER = []
	FP = []

	var FEMALE: bool = SimEnv.OPT.get("sex", "m") == "f"
	SimEnv.FEMALE = FEMALE

	var _def := func(id: String, label: String, ax: float, ay: float, bx: float, by: float, ra: float, rb: float, mass: float, side: String, kind: String) -> Dictionary:
		var idx := segs.size()
		var m := mass * (0.86 if FEMALE else 1.0)
		var s := {
			"id": id, "label": label, "ra": ra, "rb": rb, "len": sqrt((bx - ax) * (bx - ax) + (by - ay) * (by - ay)), "mass": m,
			"side": side, "kind": kind, "organs": [], "vessels": [], "bones": [], "muscles": [], "nerves": [], "capil": [],
			"wounds": [], "tracks": [], "connected": true, "detT": 0.0, "idx": idx, "lastImpact": -9.0, "ribsBroken": 0,
			"rest": { "ax": ax, "ay": ay, "bx": bx, "by": by }, "tq": null,
		}
		s.a = add_p(ax, ay, m / 2.0, ra, idx, "a")
		s.b = add_p(bx, by, m / 2.0, rb, idx, "b")
		s.gone = false
		s.fullL = s.len
		s.hasBite = false
		s.zr = [-1.0, 1.0]
		segs.append(s)
		SEG[id] = s
		return s

	var _org := func(seg: Dictionary, id: String, name_: String, s: float, w: float, rs: float, rw: float, kind: String, z0: float, z1: float, o: Dictionary = {}) -> Dictionary:
		var g := { "seg": seg, "id": id, "name": name_, "s": s, "w": w, "rs": rs, "rw": rw, "kind": kind, "z0": z0, "z1": z1, "hp": 100.0, "vuln": 1.0, "blast": 0.8, "ib": 0.0, "rot": 0.0 }.merged(o, true)
		seg.organs.append(g)
		ORG[id] = g
		return g

	var _ves := func(seg: Dictionary, id: String, name_: String, pts: Array, width: float, type: String, rate: float, ext: float, z0: float, z1: float, o: Dictionary = {}) -> Dictionary:
		var v := { "seg": seg, "id": id, "name": name_, "pts": pts, "width": width, "type": type, "rate": rate, "ext": ext, "z0": z0, "z1": z1, "cut": 0.0, "clamp": false, "at": null, "deep": false, "now": 0.0 }.merged(o, true)
		seg.vessels.append(v)
		VESSELS.append(v)
		return v

	var _bone := func(seg: Dictionary, id: String, name_: String, shape: String, data: Dictionary, width: float, hp: float, dens: float, z0: float, z1: float, o: Dictionary = {}) -> Dictionary:
		var b := { "seg": seg, "id": id, "name": name_, "shape": shape, "width": width, "hp": hp, "hp0": hp, "dens": dens, "z0": z0, "z1": z1, "broken": false, "bp": 0.5, "ba": SimMath.rnd(0.0, 6.28) }.merged(data, true)
		if b.has("pts"):
			b.fs0 = b.pts[0][0]
			b.fs1 = b.pts[b.pts.size() - 1][0]
			b.w0 = b.pts[0][1]
			b.w1 = b.pts[b.pts.size() - 1][1]
			b.off = 0.0
		seg.bones.append(b)
		BONES.append(b)
		return b

	var head: Dictionary = _def.call("head", "Head", -0.5, -166.0, 1.5, -160.0, 9.2, 7.4, 5.0, "mid", "head")
	var neck: Dictionary = _def.call("neck", "Neck", 1.5, -160.0, 0.0, -136.0, 4.3, 4.8, 1.3, "mid", "neck")
	var chest: Dictionary = _def.call("chest", "Chest", 0.0, -136.0, 0.0, -111.0, 10.4, 11.4, 20.0, "mid", "chest")
	var abd: Dictionary = _def.call("abd", "Abdomen", 0.0, -111.0, 0.0, -91.0, 10.6, 11.6, 16.0, "mid", "abd")

	_org.call(head, "brain", "Brain", 0.4, -0.8, 6.8, 7.2, "brain", -1.0, 1.0, { "vuln": 1.6, "blast": 0.9, "ib": 1.0 })
	_org.call(head, "eye", "Left eye", 2.7, 6.1, 0.95, 1.05, "eye", 0.2, 1.0, { "shallow": true })
	_bone.call(head, "skull", "Skull", "ell", { "s": 0.6, "w": -0.5, "rs": 8.5, "rw": 8.3 }, 1.0, 70.0, 60.0, -1.0, 1.0)
	_org.call(neck, "trachea", "Trachea", 14.5, 2.8, 5.5, 1.2, "trachea", -0.35, 0.35, { "vuln": 1.2, "shallow": true })
	_org.call(neck, "esophagus", "Esophagus", 15.0, 1.0, 6.5, 0.8, "esoph", -0.3, 0.3, { "vuln": 0.8, "ib": 0.5 })
	_ves.call(neck, "carL", "Left carotid artery", [[2, 1.4], [24, 1.3]], 0.9, "a", 24.0, 1.0, 0.2, 1.0)
	_ves.call(neck, "carR", "Right carotid artery", [[2, 1.0], [24, 0.9]], 0.9, "a", 24.0, 1.0, -1.0, -0.2)
	_ves.call(neck, "jugL", "Left jugular vein", [[2, 0.0], [24, 0.2]], 1.1, "v", 8.0, 1.0, 0.35, 1.0)
	_ves.call(neck, "jugR", "Right jugular vein", [[2, -0.4], [24, -0.2]], 1.1, "v", 8.0, 1.0, -1.0, -0.35)
	_ves.call(neck, "vert", "Vertebral artery", [[2, -1.6], [24, -1.8]], 0.5, "a", 6.0, 0.3, -0.3, 0.3, { "deep": true })
	_bone.call(neck, "cervical", "Cervical spine", "line", { "pts": [[1, -2.4], [24, -2.7]] }, 2.1, 60.0, 70.0, -0.35, 0.35, { "spine": true })
	_org.call(chest, "lungR", "Right lung", 8.0, -1.6, 10.5, 8.2, "lung", -1.0, -0.05, { "vuln": 0.9, "blast": 1.5, "ib": 2.0, "far": true })
	_org.call(chest, "lungL", "Left lung", 8.6, 0.2, 10.0, 7.7, "lung", 0.05, 1.0, { "vuln": 0.9, "blast": 1.5, "ib": 2.0 })
	_org.call(chest, "heart", "Heart", 12.5, 3.4, 5.4, 4.5, "heart", -0.4, 0.65, { "vuln": 1.25, "blast": 1.0, "ib": 22.0, "rot": -0.45 })
	_ves.call(chest, "aorta", "Thoracic aorta", [[11, 3], [5, 2.6], [1.5, -1], [5, -5.8], [25, -6.2]], 2.0, "a", 70.0, 0.25, -0.3, 0.45, { "deep": true })
	_ves.call(chest, "svc", "Vena cava", [[-3, -2], [11, -3.4], [25, -4.4]], 1.8, "v", 28.0, 0.25, -0.6, 0.05, { "deep": true })
	_ves.call(chest, "subcl", "Subclavian artery", [[0.4, 6.5], [1.8, 1], [2.6, -4]], 0.8, "a", 14.0, 0.4, -1.0, 1.0, { "deep": true })
	_bone.call(chest, "thoracic", "Thoracic spine", "line", { "pts": [[0, -2.8], [4, -5.4], [10, -8], [25, -8.6]] }, 2.4, 70.0, 80.0, -0.3, 0.3, { "spine": true })
	_bone.call(chest, "ribs", "Ribs", "ribs", { "s": 9.5, "w": 0.0, "rs": 13.0, "rw": 10.8 }, 0.7, 999.0, 35.0, -1.0, 1.0)
	_org.call(abd, "liver", "Liver", 3.5, 1.6, 5.0, 9.0, "liver", -1.0, 0.25, { "ib": 7.0 })
	_org.call(abd, "stomach", "Stomach", 4.6, 5.0, 4.3, 4.8, "stomach", 0.0, 0.9, { "vuln": 0.9, "ib": 1.0 })
	_org.call(abd, "spleen", "Spleen", 4.0, -5.4, 3.0, 2.6, "spleen", 0.35, 1.0, { "ib": 6.0 })
	_org.call(abd, "kidneyR", "Right kidney", 8.6, -7.4, 3.4, 2.2, "kidney", -1.0, -0.2, { "ib": 3.0 })
	_org.call(abd, "kidneyL", "Left kidney", 7.6, -7.9, 3.4, 2.2, "kidney", 0.2, 1.0, { "ib": 3.0 })
	_org.call(abd, "intest", "Intestines", 13.5, 2.4, 6.6, 8.3, "intest", -1.0, 1.0, { "vuln": 0.7, "ib": 1.5 })
	_org.call(abd, "pancreas", "Pancreas", 6.6, -2.6, 1.6, 4.2, "pancreas", -0.5, 0.7, { "ib": 2.0 })
	_org.call(abd, "gallbladder", "Gallbladder", 7.0, 4.4, 1.3, 1.5, "gall", -0.85, -0.25, { "ib": 0.5 })
	_org.call(abd, "bladder", "Bladder", 20.5, 6.4, 3.0, 3.3, "bladder", -0.4, 0.4, { "vuln": 0.8, "ib": 0.5 })

	ORG.intest.coils = []
	for i in 26:
		var a := randf() * 6.28
		var r := sqrt(randf()) * 0.85
		ORG.intest.coils.append([2.4 + cos(a) * r * 8.3, 13.5 + sin(a) * r * 6.6, SimMath.rnd(1.1, 1.9)])
	ORG.brain.gyri = []
	for i in 9:
		ORG.brain.gyri.append([SimMath.rnd(-7.0, 5.0), SimMath.rnd(-3.5, 6.0), SimMath.rnd(1.5, 3.0), SimMath.rnd(0.0, 6.28)])

	_ves.call(abd, "aortaAbd", "Abdominal aorta", [[0, -6.4], [17, -6], [19, -5]], 1.9, "a", 55.0, 0.2, -0.14, 0.22, { "deep": true })
	_ves.call(abd, "ivc", "Inferior vena cava", [[0, -4.6], [18, -3.6]], 1.8, "v", 24.0, 0.2, -0.6, 0.05, { "deep": true })
	_ves.call(abd, "iliac", "Iliac arteries", [[16, -5.8], [19.5, -2], [21, 0.8]], 1.2, "a", 22.0, 0.3, -0.8, 0.8, { "deep": true })
	_ves.call(abd, "mesent", "Mesenteric artery", [[5, -6], [10, -1], [14, 3]], 0.7, "a", 8.0, 0.2, -0.3, 0.3, { "deep": true })
	_ves.call(abd, "renal", "Renal arteries", [[7.2, -6.2], [8.2, -6.9]], 0.5, "a", 9.0, 0.2, -1.0, 1.0, { "deep": true })
	_bone.call(abd, "lumbar", "Lumbar spine", "line", { "pts": [[0, -8.6], [12, -7.8], [24, -8.6]] }, 2.7, 75.0, 85.0, -0.3, 0.3, { "spine": true })
	_bone.call(abd, "pelvis", "Pelvis", "ell", { "s": 23.0, "w": -1.5, "rs": 6.0, "rw": 10.0 }, 1.6, 90.0, 70.0, -1.0, 1.0, { "thick": 1.6, "hitK": 0.68 })

	joint(chest, 0.0, neck, "b", "neck", -30.0, 40.0)
	joint(neck, 0.0, head, "b", "head", -40.0, 40.0)
	joint(chest, 1.0, abd, "a", "spine", -50.0, 25.0)

	for arm_spec in [["far", "Right", -1.2], ["near", "Left", 1.2]]:
		var side: String = arm_spec[0]
		var lab: String = arm_spec[1]
		var dx: float = arm_spec[2]
		var ua: Dictionary = _def.call(side + "UpperArm", lab + " upper arm", dx, -134.0, dx, -109.0, 4.2, 3.6, 2.1, side, "uarm")
		var fa: Dictionary = _def.call(side + "Forearm", lab + " forearm", dx, -109.0, dx + 1.5, -85.0, 3.5, 2.6, 1.4, side, "farm")
		var hd: Dictionary = _def.call(side + "Hand", lab + " hand", dx + 1.5, -85.0, dx + 2.5, -70.0, 2.6, 2.0, 0.5, side, "hand")
		var th: Dictionary = _def.call(side + "Thigh", lab + " thigh", dx * 0.6, -91.0, dx * 0.6 + 1.0, -50.0, 8.0, 5.5, 9.0, side, "thigh")
		var sh: Dictionary = _def.call(side + "Shin", lab + " lower leg", dx * 0.6 + 1.0, -50.0, dx * 0.6, -4.5, 5.2, 3.6, 4.0, side, "shin")
		var ft: Dictionary = _def.call(side + "Foot", lab + " foot", dx * 0.6, -4.5, dx * 0.6 + 15.0, -2.2, 4.0, 2.0, 1.1, side, "foot")
		var z := [-0.55, 0.55]
		_bone.call(ua, side + "Hum", lab + " humerus", "line", { "pts": [[0, 0], [ua.len, 0]] }, 1.4, 55.0, 60.0, -0.45, 0.45, { "limb": true })
		_ves.call(ua, side + "Brach", lab + " brachial artery", [[0, 1.3], [ua.len, 1.0]], 0.6, "a", 9.0, 1.0, z[0], z[1])
		_ves.call(ua, side + "Basil", lab + " basilic vein", [[0, -1.0], [ua.len, -0.8]], 0.7, "v", 3.0, 1.0, z[0], z[1])
		_ves.call(ua, side + "Ceph", lab + " cephalic vein", [[0, 2.7], [ua.len * 0.5, 2.5], [ua.len, 2.0]], 0.45, "v", 1.5, 1.0, z[0], z[1])
		_bone.call(fa, side + "Rad", lab + " radius/ulna", "line", { "pts": [[0, 0], [fa.len, 0]] }, 1.2, 45.0, 50.0, -0.45, 0.45, { "limb": true })
		_ves.call(fa, side + "Radial", lab + " radial artery", [[0, 1.0], [fa.len, 0.7]], 0.5, "a", 4.0, 1.0, z[0], z[1])
		_ves.call(fa, side + "Ulnar", lab + " ulnar artery", [[0, -0.4], [fa.len, -0.7]], 0.45, "a", 3.0, 1.0, z[0], z[1])
		_ves.call(fa, side + "FCeph", lab + " forearm vein", [[0, 1.9], [fa.len, 1.4]], 0.4, "v", 1.0, 1.0, z[0], z[1])
		_bone.call(hd, side + "Meta", lab + " hand bones", "line", { "pts": [[0, 0], [hd.len, 0]] }, 1.0, 30.0, 30.0, -0.6, 0.6, { "limb": true, "minor": true })
		_ves.call(hd, side + "Palm", lab + " palmar arch", [[0, 0.8], [hd.len, 0.5]], 0.4, "a", 1.5, 1.0, -0.8, 0.8)
		_bone.call(th, side + "Fem", lab + " femur", "line", { "pts": [[0, 0], [th.len, 0.3]] }, 2.2, 90.0, 100.0, -0.4, 0.4, { "limb": true, "leg": true })
		_ves.call(th, side + "FemA", lab + " femoral artery", [[0, 2.7], [th.len, 1.3]], 0.9, "a", 18.0, 1.0, z[0], z[1])
		_ves.call(th, side + "FemV", lab + " femoral vein", [[0, 1.6], [th.len, 0.3]], 1.0, "v", 8.0, 1.0, z[0], z[1])
		_ves.call(th, side + "Prof", lab + " deep femoral artery", [[3, 2.2], [12, -0.6], [26, -1.8]], 0.6, "a", 6.0, 1.0, z[0], z[1])
		_ves.call(th, side + "Popl", lab + " popliteal artery", [[30, 0.6], [th.len, -1.9]], 0.7, "a", 9.0, 1.0, z[0], z[1])
		_ves.call(th, side + "Saph", lab + " great saphenous vein", [[0, 3.6], [th.len * 0.5, 3.1], [th.len, 2.6]], 0.5, "v", 2.0, 1.0, z[0], z[1])
		_bone.call(sh, side + "Tib", lab + " tibia", "line", { "pts": [[0, 1], [sh.len, 0.8]] }, 1.6, 70.0, 80.0, -0.45, 0.45, { "limb": true, "leg": true })
		_ves.call(sh, side + "TibA", lab + " tibial artery", [[0, -0.8], [sh.len, -0.6]], 0.5, "a", 4.0, 1.0, z[0], z[1])
		_ves.call(sh, side + "PTib", lab + " posterior tibial artery", [[0, -1.9], [sh.len, -1.1]], 0.45, "a", 3.0, 1.0, z[0], z[1])
		_ves.call(sh, side + "SSaph", lab + " small saphenous vein", [[4, -3.4], [sh.len, -2.1]], 0.4, "v", 1.2, 1.0, z[0], z[1])
		_bone.call(ft, side + "Tars", lab + " foot bones", "line", { "pts": [[0, 0.3], [ft.len, 0]] }, 1.2, 35.0, 35.0, -0.6, 0.6, { "limb": true, "leg": true, "minor": true })
		_ves.call(ft, side + "Dors", lab + " dorsalis pedis", [[2, 1.6], [ft.len, 0.8]], 0.4, "a", 1.5, 1.0, -0.8, 0.8)
		joint(chest, 0.1, ua, "a", "shoulder", -170.0, 55.0, { "stump": 14.0, "arm": side })
		joint(ua, 1.0, fa, "a", "elbow", -150.0, 0.0, { "stump": 8.0, "arm": side })
		joint(fa, 1.0, hd, "a", "wrist", -70.0, 70.0, { "stump": 3.0, "arm": side })
		joint(abd, 1.0, th, "a", "hip", -125.0, 35.0, { "leg": true, "stump": 24.0 })
		joint(th, 1.0, sh, "a", "knee", 0.0, 150.0, { "leg": true, "stump": 10.0 })
		joint(sh, 1.0, ft, "a", "ankle", -35.0, 35.0, { "leg": true, "stump": 3.0 })

	_detail_body()
	for sg in segs:
		if sg.side == "mid":
			continue
		var arm: bool = ["uarm", "farm", "hand"].has(sg.kind)
		var n: bool = sg.side == "near"
		sg.zr = ([0.62, 1.2] if n else [-1.2, -0.62]) if arm else ([0.0, 1.0] if n else [-1.0, 0.0])
	ORDER = ["farUpperArm", "farForearm", "farHand", "farThigh", "farShin", "farFoot", "abd", "neck", "chest", "head", "nearThigh", "nearShin", "nearFoot", "nearUpperArm", "nearForearm", "nearHand"].map(func(k): return SEG[k])

	V = { "blood": 5000.0, "rbc": 5000.0, "hr": 72.0, "sys": 120.0, "co": 1.0, "spo2": 98.0, "brainO2": 1.0, "consc": 1.0, "pain": 0.0, "painEff": 0.0,
		"ko": 0.0, "dead": false, "bd": false, "arrest": false, "breath": 1.0, "rise": 1.0, "ext": 0.0, "int": 0.0, "phase": 0.0, "lastBeat": -1.0,
		"prevBeat": -2.0, "lowSpT": 0.0, "deadAt": 0.0, "start": SimEnv.T, "resp": 14.0, "flinch": 0.0, "clutch": null, "bphase": 0.0, "vfT": 0.0,
		"fear": 0.0, "act": "calm", "armW": 0.0, "armP": null, "cow": 0.0, "walk": 0.0, "gait": 0.0, "thx": null, "rad": 0.0, "radT": 0.0, "marrow": false }
	DR = {}
	for k in DRUGS:
		DR[DRUGS[k].key] = { "l": 0.0, "p": 0.0, "total": 0 }

func _detail_body() -> void:
	for sg in segs:
		sg.capil = []
		sg.nerves = []
		sg.muscles = []
		for v in sg.vessels:
			var n := 4 if (sg.kind == "chest" or sg.kind == "abd") else (2 if (sg.kind == "hand" or sg.kind == "foot") else 4)
			for i in n:
				var k := clampi(int(SimMath.rnd(0.0, v.pts.size() - 2.0)), 0, v.pts.size() - 2)
				var t := randf()
				var p0: Array = v.pts[k]
				var p1: Array = v.pts[k + 1]
				var ss: float = lerp(float(p0[0]), float(p1[0]), t)
				var ww: float = lerp(float(p0[1]), float(p1[1]), t)
				var pts := [[ss, ww]]
				var dir := -1.0 if randf() < 0.5 else 1.0
				for q in 4:
					ss += SimMath.rnd(0.8, 2.6)
					ww += dir * SimMath.rnd(0.5, 2.0)
					if absf(ww) > rad_s(sg, ss) * 0.82:
						break
					pts.append([ss, ww])
					if q == 1 and randf() < 0.6:
						var b := [[ss, ww], [ss + SimMath.rnd(1.0, 2.5), ww - dir * SimMath.rnd(0.6, 1.6)]]
						sg.capil.append({ "pts": b, "type": v.type, "w": maxf(0.1, v.width * 0.16) })
				if pts.size() > 1:
					sg.capil.append({ "pts": pts, "type": v.type, "w": maxf(0.12, v.width * 0.26) })
		var L: float = sg.len
		if sg.kind == "uarm":
			MT(sg, -1.9, 12.5, 2.1, 9.5, 0.0, "Triceps", 0.35)
			MT(sg, 0.6, 18.0, 1.2, 5.0, 0.0, "Brachialis", 0.2)
			MT(sg, 1.9, 12.5, 1.9, 8.5, 0.0, "Biceps", 0.45)
			MF(sg, 0.3, 3.6, 3.5, 4.6, 0.0, "Deltoid")
			sg.nerves.append({ "pts": [[0.0, 0.6], [L, 0.4]], "w": 0.4 })
		if sg.kind == "farm":
			MT(sg, -1.3, 8.5, 1.35, 7.8, 0.0, "Extensors", 0.6)
			MT(sg, 1.0, 8.8, 1.45, 8.0, 0.0, "Flexors", 0.65)
			MT(sg, 1.7, 5.5, 1.2, 6.2, 0.05, "Brachioradialis", 0.5)
			sg.nerves.append({ "pts": [[0.0, 0.4], [L, 0.3]], "w": 0.35 })
		if sg.kind == "hand":
			MT(sg, 1.1, 4.6, 0.85, 1.8, 0.0, "Thenar", 0.1)
			MT(sg, -0.8, 4.9, 0.65, 1.8, 0.0, "Hypothenar", 0.1)
		if sg.kind == "thigh":
			MF(sg, -5.2, 2.4, 3.6, 5.6, 0.1, "Gluteus maximus")
			MT(sg, -0.4, 11.0, 2.6, 9.0, 0.0, "Adductors", 0.25)
			MT(sg, -3.6, 21.0, 2.6, 16.0, 0.0, "Biceps femoris", 0.3)
			MT(sg, -2.3, 22.0, 1.5, 15.0, 0.0, "Semitendinosus", 0.45)
			MT(sg, 1.2, 21.5, 2.8, 17.0, 0.0, "Vastus lateralis", 0.2)
			MT(sg, 3.4, 19.0, 2.1, 16.0, 0.0, "Rectus femoris", 0.3)
			MT(sg, 2.4, 20.0, 0.7, 19.0, -0.12, "Sartorius", 0.1)
			sg.nerves.append({ "pts": [[0.0, -3.0], [L, -1.4]], "w": 0.8 })
		if sg.kind == "shin":
			MT(sg, -0.6, 17.0, 1.0, 11.0, 0.0, "Peroneus", 0.5)
			MT(sg, -2.2, 20.0, 2.0, 11.0, 0.0, "Soleus", 0.6)
			MT(sg, -2.8, 11.5, 2.6, 9.5, 0.0, "Gastrocnemius", 1.25)
			MT(sg, 2.2, 15.0, 1.3, 12.0, 0.0, "Tibialis anterior", 0.75)
			sg.nerves.append({ "pts": [[0.0, -1.9], [L, -1.0]], "w": 0.45 })
		if sg.kind == "foot":
			MF(sg, -1.0, 7.0, 0.8, 5.0, 0.0, "Sole muscles")
			MT(sg, 0.9, 6.0, 0.7, 2.5, 0.0, "Extensor brevis", 0.3)
		if sg.kind == "chest":
			MF(sg, -9.3, 1.5, 1.4, 6.0, 0.1, "Trapezius")
			MF(sg, -8.4, 15.0, 2.0, 9.0, -0.1, "Latissimus dorsi")
			MF(sg, -9.6, 12.0, 1.0, 12.0, 0.0, "Erector spinae")
			MF(sg, 5.6, 14.0, 1.4, 4.0, 0.3, "Serratus anterior")
			MF(sg, 8.3, 5.0, 2.2, 6.0, 0.15, "Pectoralis major")
		if sg.kind == "abd":
			for i in 4:
				sg.muscles.append({ "w": 9.3, "s": 1.5 + i * 4.6, "rw": 1.1, "rs": 2.1, "rot": 0.0 })
			MF(sg, 6.0, 9.0, 2.5, 8.0, 0.4, "External oblique")
			MF(sg, -9.6, 10.0, 1.1, 10.0, 0.0, "Erector spinae")
			MF(sg, -6.0, 17.5, 3.0, 4.5, 0.2, "Gluteus medius")
		if sg.kind == "head":
			MF(sg, -0.5, -2.2, 3.2, 3.2, 0.0, "Temporalis")
			MT(sg, 3.4, 8.6, 1.4, 2.3, 0.25, "Masseter", 0.1)
		if sg.kind == "neck":
			MF(sg, -3.3, 12.0, 1.2, 11.0, 0.0, "Trapezius")
			MT(sg, 1.2, 12.0, 1.2, 10.5, -0.32, "Sternocleidomastoid", 0.15)
			sg.nerves.append({ "pts": [[2.0, 0.6], [24.0, 0.5]], "w": 0.3 })

func MF(sg: Dictionary, w: float, s: float, rw: float, rs: float, rot: float, n: String) -> void:
	sg.muscles.append({ "w": w, "s": s, "rw": rw, "rs": rs, "rot": rot, "k": "flat", "n": n })

func MT(sg: Dictionary, w: float, s: float, rw: float, rs: float, rot: float, n: String, t: float = 0.35) -> void:
	sg.muscles.append({ "w": w, "s": s, "rw": rw, "rs": rs, "rot": rot, "k": "fus", "n": n, "t": t })

func joint(p: Dictionary, t: float, c: Dictionary, end: String, key: String, minD: float, maxD: float, o: Dictionary = {}) -> Dictionary:
	var j := { "p": p.idx, "c": c.idx, "t": t, "end": end, "key": key, "min": minD * D2R, "max": maxD * D2R, "broken": false, "wf": SimMath.rnd(2.2, 4.5), "wp": SimMath.rnd(0.0, 6.28), "chop": 0.0 }.merged(o, true)
	j.rest = SimMath.norm_ang(seg_ang(c, end == "b") - seg_ang(p, false))
	c.joint = j
	joints.append(j)
	return j

func seg_ang(s: Dictionary, rev: bool) -> float:
	var a: Dictionary = P[s.a]
	var b: Dictionary = P[s.b]
	return atan2(a.y - b.y, a.x - b.x) if rev else atan2(b.y - a.y, b.x - a.x)

func joint_rel(j: Dictionary) -> float:
	var p: Dictionary = segs[j.p]
	var c: Dictionary = segs[j.c]
	return SimMath.norm_ang(FACE * SimMath.norm_ang(seg_ang(c, j.end == "b") - seg_ang(p, false)) - j.rest)

func body_turn(cx: float) -> void:
	for p in P:
		var vx: float = p.x - p.px
		p.x = 2.0 * cx - p.x
		p.px = p.x - vx
	FACE = -FACE

func bn(id: String) -> Dictionary:
	for b in BONES:
		if b.id == id:
			return b
	return {}

func legs_ok() -> bool:
	if bn("thoracic").broken or bn("lumbar").broken or bn("pelvis").broken or bn("cervical").broken:
		return false
	for sd in ["far", "near"]:
		for k in ["Thigh", "Shin", "Foot"]:
			var s: Dictionary = SEG[sd + k]
			if not s.connected:
				return false
			for b in s.bones:
				if b.broken and not b.get("minor", false):
					return false
	return true

func arm_ok(side: String) -> bool:
	for k in ["UpperArm", "Forearm", "Hand"]:
		var s: Dictionary = SEG[side + k]
		if not s.connected:
			return false
		for b in s.bones:
			if b.broken and not b.get("minor", false):
				return false
	return true

func update_connected() -> void:
	for s in segs:
		s.connected = false
	if SEG.chest.gone:
		return
	var st := [SEG.chest.idx]
	SEG.chest.connected = true
	while st.size():
		var i: int = st.pop_back()
		for j in joints:
			if j.broken:
				continue
			var o := -1
			if j.p == i:
				o = j.c
			elif j.c == i:
				o = j.p
			if o >= 0 and not segs[o].connected and not segs[o].gone:
				segs[o].connected = true
				st.append(o)

# ---------- фронтальный скелет (для вида спереди, Phase D) ----------
static func torso_hw(y: float, female: bool) -> float:
	if female:
		if y < -141.0:
			return 10.6 + 5.1 * sqrt(clampf((y + 147.0) / 6.0, 0.0, 1.0))
		if y < -111.0:
			return lerp(15.7, 12.9, (y + 141.0) / 30.0)
		if y < -104.0:
			return lerp(12.9, 12.3, (y + 111.0) / 7.0)
		if y < -94.0:
			return lerp(12.3, 17.4, (y + 104.0) / 10.0)
		return lerp(17.4, 16.0, clampf((y + 94.0) / 9.0, 0.0, 1.0))
	if y < -141.0:
		return 11.0 + 6.0 * sqrt(clampf((y + 147.0) / 6.0, 0.0, 1.0))
	if y < -111.0:
		return lerp(17.0, 14.2, (y + 141.0) / 30.0)
	if y < -104.0:
		return lerp(14.2, 13.6, (y + 111.0) / 7.0)
	if y < -94.0:
		return lerp(13.6, 16.6, (y + 104.0) / 10.0)
	return lerp(16.6, 15.2, clampf((y + 94.0) / 9.0, 0.0, 1.0))

func front_parts(female: bool) -> Array:
	var L := []
	var ax := -1.0 if female else 0.0
	for side_spec in [["near", 1.0], ["far", -1.0]]:
		var side: String = side_spec[0]
		var sg: float = side_spec[1]
		L.append({ "id": side + "Hand", "t": "cap", "x1": sg * (23.4 + ax), "y1": -86.0, "x2": sg * (24.2 + ax), "y2": -71.0, "r1": 2.5 if female else 2.7, "r2": 1.9 if female else 2.1 })
		L.append({ "id": side + "Forearm", "t": "cap", "x1": sg * (21.6 + ax), "y1": -110.0, "x2": sg * (23.4 + ax), "y2": -86.0, "r1": 3.2 if female else 3.5, "r2": 2.4 if female else 2.7 })
		L.append({ "id": side + "UpperArm", "t": "cap", "x1": sg * (19.6 + ax), "y1": -141.0, "x2": sg * (21.6 + ax), "y2": -110.0, "r1": 4.1 if female else 4.4, "r2": 3.3 if female else 3.6 })
	L.append({ "id": "head", "t": "ell", "cx": 0.0, "cy": -163.5, "rx": 8.2, "ry": 11.3 })
	L.append({ "id": "neck", "t": "cap", "x1": 0.0, "y1": -154.0, "x2": 0.0, "y2": -143.0, "r1": 4.8, "r2": 5.4 })
	L.append({ "id": "chest", "t": "torso", "y0": -147.0, "y1": -111.0 })
	L.append({ "id": "abd", "t": "torso", "y0": -111.0, "y1": -85.0 })
	for side_spec in [["near", 1.0], ["far", -1.0]]:
		var side: String = side_spec[0]
		var sg: float = side_spec[1]
		L.append({ "id": side + "Thigh", "t": "cap", "x1": sg * (9.3 if female else 8.6), "y1": -90.0, "x2": sg * 8.4, "y2": -50.0, "r1": 8.1 if female else 7.6, "r2": 5.3 })
		L.append({ "id": side + "Shin", "t": "cap", "x1": sg * 8.4, "y1": -50.0, "x2": sg * 8.0, "y2": -6.0, "r1": 5.0, "r2": 3.4 })
		L.append({ "id": side + "Foot", "t": "ell", "cx": sg * 8.6, "cy": -3.2, "rx": 4.4, "ry": 3.4 })
	return L

func pick_seg(w: Vector2, tol: float) -> Dictionary:
	var best := {}
	var bd := tol
	var ord := ORDER.duplicate()
	ord.reverse()
	for s in ord:
		var A: Dictionary = P[s.a]
		var B: Dictionary = P[s.b]
		var r := SimMath.dps(w.x, w.y, A.x, A.y, B.x, B.y)
		var d: float = r.d - rad(s, r.t)
		if d < bd:
			bd = d
			best = { "seg": s, "t": r.t }
			if d < 0.0:
				break
	return best

static func breath_amt(v: Dictionary) -> float:
	if v.dead:
		return 0.0
	return sin(v.bphase) * clampf(v.breath, 0.0, 1.0) * (0.35 + clampf((v.resp - 14.0) / 30.0, 0.0, 0.6))

func seg_rad(seg: Dictionary, v: Dictionary) -> Array:
	if seg.kind == "chest" and not NOBREATH:
		var b := breath_amt(v)
		return [seg.ra + b * 0.5, seg.rb + b * 0.7]
	return [seg.ra, seg.rb]
