extends Control
## HUD Фазы A: виталы, статус, переключатель ракурсов + заглушка тулбара.
## Вертикальный layout под Android (720×1280).

signal view_requested(view: String)

var lbl_hr: Label
var lbl_bp: Label
var lbl_sp: Label
var lbl_bl: Label
var lbl_status: Label
var lbl_fps: Label

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	_build()
	_sync.call_deferred()
	get_viewport().size_changed.connect(_sync)

## Гарантированный размер корня (якоря не сработали на CanvasLayer-хосте)
func _sync() -> void:
	size = get_viewport_rect().size
	position = Vector2.ZERO

func _panel_style() -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0.07, 0.08, 0.11, 0.72)
	sb.set_corner_radius_all(10)
	sb.set_content_margin_all(10)
	sb.border_width_bottom = 1
	sb.border_color = Color(0.25, 0.3, 0.38, 0.6)
	return sb

func _chip(title_text: String) -> Dictionary:
	var p := PanelContainer.new()
	p.add_theme_stylebox_override("panel", _panel_style())
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 2)
	var t := Label.new()
	t.text = title_text
	t.add_theme_font_size_override("font_size", 12)
	t.add_theme_color_override("font_color", Color(0.66, 0.73, 0.82))
	var l := Label.new()
	l.add_theme_font_size_override("font_size", 17)
	l.add_theme_color_override("font_color", Color(0.92, 0.95, 0.98))
	v.add_child(t)
	v.add_child(l)
	p.add_child(v)
	return { "panel": p, "value": l }

func _view_button(text: String, view: String) -> Button:
	var b := Button.new()
	b.text = text
	b.custom_minimum_size = Vector2(0, 46)
	b.add_theme_font_size_override("font_size", 15)
	b.pressed.connect(func() -> void: view_requested.emit(view))
	return b

func _build() -> void:
	# --- верх: заголовок + виталы ---
	var top := VBoxContainer.new()
	top.set_anchors_preset(Control.PRESET_TOP_WIDE)
	top.offset_left = 10.0
	top.offset_right = -10.0
	top.offset_top = 10.0
	top.offset_bottom = 108.0
	top.add_theme_constant_override("separation", 6)
	add_child(top)

	var title := Label.new()
	title.text = "TRAUMA LAB · Godot port — Phase A"
	title.add_theme_font_size_override("font_size", 14)
	title.add_theme_color_override("font_color", Color(0.85, 0.88, 0.94))
	top.add_child(title)

	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 6)
	top.add_child(row)
	var hr_chip := _chip("HR bpm")
	var bp_chip := _chip("BP mmHg")
	var sp_chip := _chip("SpO₂ %")
	var bl_chip := _chip("Blood")
	for c in [hr_chip.panel, bp_chip.panel, sp_chip.panel, bl_chip.panel]:
		c.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(c)
	lbl_hr = hr_chip.value
	lbl_bp = bp_chip.value
	lbl_sp = sp_chip.value
	lbl_bl = bl_chip.value

	# --- низ: статус, переключатель вида, тулбар-заглушка ---
	var bottom := VBoxContainer.new()
	bottom.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	bottom.offset_left = 10.0
	bottom.offset_right = -10.0
	bottom.offset_top = -226.0
	bottom.offset_bottom = -12.0
	bottom.add_theme_constant_override("separation", 6)
	add_child(bottom)

	lbl_status = Label.new()
	lbl_status.text = "Subject 01 · male · 70 kg · statue (Phase A)"
	lbl_status.add_theme_font_size_override("font_size", 12)
	lbl_status.add_theme_color_override("font_color", Color(0.6, 0.68, 0.78))
	bottom.add_child(lbl_status)

	var views := HBoxContainer.new()
	views.add_theme_constant_override("separation", 6)
	bottom.add_child(views)
	for spec in [["SIDE", "side"], ["FRONT", "front"], ["BACK", "back"]]:
		var b := _view_button(spec[0], spec[1])
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		views.add_child(b)

	var tools_hint := PanelContainer.new()
	tools_hint.add_theme_stylebox_override("panel", _panel_style())
	var th := Label.new()
	th.text = "Tools · wounds · x-ray — Phase C/D"
	th.add_theme_font_size_override("font_size", 13)
	th.add_theme_color_override("font_color", Color(0.55, 0.6, 0.68))
	th.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	tools_hint.add_child(th)
	bottom.add_child(tools_hint)

	lbl_fps = Label.new()
	lbl_fps.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	lbl_fps.offset_left = -110.0
	lbl_fps.offset_top = -34.0
	lbl_fps.offset_right = -14.0
	lbl_fps.offset_bottom = -12.0
	lbl_fps.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	lbl_fps.add_theme_font_size_override("font_size", 11)
	lbl_fps.add_theme_color_override("font_color", Color(0.5, 0.55, 0.62))
	add_child(lbl_fps)

func set_vitals(v: Dictionary) -> void:
	lbl_hr.text = str(roundi(float(v.get("hr", 0.0))))
	var sys := float(v.get("sys", 0.0))
	lbl_bp.text = "%d/%d" % [roundi(sys), roundi(sys * 0.66)]
	lbl_sp.text = str(roundi(float(v.get("spo2", 0.0))))
	lbl_bl.text = "%.1f L" % (float(v.get("blood", 0.0)) / 1000.0)
	if lbl_fps:
		lbl_fps.text = "%d fps" % Engine.get_frames_per_second()

func set_status(text: String) -> void:
	lbl_status.text = text
