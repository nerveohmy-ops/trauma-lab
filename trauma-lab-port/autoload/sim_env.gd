extends Node
## Порт core/env.js — глобальное состояние мира (без графики).
## Имена совпадают с JS, чтобы перенос state-модулей был строка-в-строку.

const COPYRIGHT := "© 2026 Abynotic Studios. All rights reserved."
const NOTICE := "18+ · Contains graphic violence and gore · A fictional simulation, not medical advice"

## CM в метры для 3D-мира (вся JS-симуляция живёт в сантиметрах).
const CM := 0.01

var W := 0.0
var H := 0.0
var DPR := 1.0
var S := 1.5
var OX := 0.0
var OY := 0.0
var ROOM := 110.0   # половина ширины комнаты, см
var TOP := -220.0   # потолок, см (отрицательный — вверх)
var VS := 1.5
var VX := 0.0
var VY := 0.0
var view := "side"   # side | front | back
var FEMALE := false  # пол субъекта (глобал env.js)

var G := 981.0                 # см/с²
const SUB := 6
const ITER := 10
var T := 0.0                   # время симуляции, с
var time_scale := 1.0
var xray := false
var sound_on := true
var shake := 0.0

const OPT_DEF := {
	"sex": "m", "mon": 0, "keys": null, "mstr": 2, "chemq": 2, "chemc": 0, "ammo": {},
	"mlist": false, "gunvol": 1.0, "casevol": 0.5, "pip": false, "scene": "lab",
	"surg": "simple", "tear": true, "beep": true,
	"xl": { "skin": true, "muscles": true, "organs": true, "vessels": true, "bones": true, "nerves": true },
	"gore": 3, "strands": true, "spatter": true, "clot": true, "god": false, "bleedout": true,
	"react": true, "painfx": true, "slowmo": false, "arrowcam": true, "gravity": "earth",
	"skin": "medium", "quality": "auto", "shake": true, "hints": true, "logs": true,
	"pin": true, "fps": false, "vol": 0.8, "amb": true, "vib": true,
}
var OPT: Dictionary = {}

const GORE := [
	{ "k": 0.4, "b": 450, "g": 140, "m": 160, "n": "Mild" },
	{ "k": 1.0, "b": 900, "g": 320, "m": 420, "n": "Realistic" },
	{ "k": 1.8, "b": 1500, "g": 520, "m": 750, "n": "Heavy" },
	{ "k": 3.0, "b": 2400, "g": 800, "m": 1200, "n": "Extreme" },
]

const GRAV := { "earth": 981.0, "mars": 371.0, "moon": 162.0, "zero": 0.0, "jupiter": 2479.0, "sun": 27400.0 }

const SKINS := {
	"light": Vector3(238, 200, 172),
	"medium": Vector3(200, 143, 111),
	"tan": Vector3(182, 132, 98),
	"dark": Vector3(122, 84, 62),
}

const MAPS := {
	"fit": { "name": "Fit screen", "desc": "Lab sized to your screen" },
	"closet": { "name": "Closet", "w": 150.0, "h": 230.0, "desc": "1.5 m wide lab cell" },
	"room": { "name": "Test room", "w": 300.0, "h": 260.0, "desc": "3 m wide lab" },
	"hall": { "name": "Hall", "w": 600.0, "h": 320.0, "desc": "6 m wide hall" },
	"warehouse": { "name": "Warehouse", "w": 1200.0, "h": 520.0, "desc": "12 m concrete warehouse", "theme": "wh" },
	"field": { "name": "Field", "w": 2500.0, "h": 900.0, "desc": "25 m open field", "theme": "field" },
	"facility": { "name": "Lab corridor", "w": 1200.0, "h": 260.0, "desc": "Story mode", "hidden": true },
}
var MAP := "fit"

## Смена вида + палитра кожи — нужны рендеру и физиологии.
func XL(k: String) -> bool:   # слой рентгена включён
	return not xray or not OPT.has("xl") or OPT["xl"].get(k, true) != false

func GQ() -> Dictionary:
	var g: Dictionary = GORE[clampi(int(OPT.get("gore", 1)), 0, GORE.size() - 1)]
	if OPT.get("quality") == "low":
		return { "k": g.k * 0.6, "b": minf(g.b, 500), "g": minf(g.g, 160), "m": minf(g.m, 150), "n": g.n }
	return g

func gore_n(n: float) -> int:
	var v: float = n * GQ().k
	return int(v) + (1 if randf() < fposmod(v, 1.0) else 0)

func apply_gravity() -> void:
	G = float(GRAV.get(OPT.get("gravity", "earth"), 981.0))

func _ready() -> void:
	randomize()
	OPT = OPT_DEF.duplicate(true)
	apply_gravity()
