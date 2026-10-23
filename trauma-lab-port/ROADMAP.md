# Trauma Lab — Godot 4.7 Port · ROADMAP

Порт: **3D-версия** (движок-физика Jolt + порт state-модулей почти дословно), Android-portrait (720×1280, canvas_items/expand, portrait).

## Принципы
- Симуляционные данные живут в **сантиметрах** как в JS (`SimEnv.CM = 0.01` переводит в метры для 3D).
- State-логика (раны, баллистика, физиология, медицина) портируется дословно — она от рендера не зависит.
- Физика — не верле-порт, а движок: RigidBody3D на сегмент + Generic6DOFJoint3D с угловыми пределами из JS `joint(min,max)`.
- Найденные в JS баги чиним по ходу (помечаем в ченжлоге).

## Структура
```
autoload/
  sim_env.gd    # core/env.js   — константы, OPT, GORE, MAPS, гравитация
  sim_body.gd   # sim/body.js   — точки/сегменты/суставы/органы/сосуды/кости/DRUGS
  sim_math.gd   # core/math.js  — чистые функции (class_name SimMath)
scripts/
  main.gd       # сцена, камера (side/front/back), pan/pinch/zoom/fit, ввод
  human_body.gd # сборка 3D-тела из SimBody (RigidBody3D + joints + капсюли)
  lab_room.gd   # комната (MAPS.room), стены со скрытием по ракурсу
  hud.gd        # виталы/статус/переключатель вида (portrait)
scenes/main.tscn
```

## Статус
- **Фаза A ✅**: тело стоит (freeze-манекен), комната, свет, 3 ракурса (клавиши 1/2/3, кнопки HUD), F = fit, pinch/pan/zoom-код, HUD с виталами (HR/BP/SpO2/Blood), 165 fps.
- DRUGS-таблица, органы/сосуды/кости/мышцы/нервы/капилляры — уже в `sim_body.gd` (порт body.js + physiology.js DRUGS).

## Ченжлог исправленных багов
- HUD-корень на CanvasLayer не растягивался якорями → `hud._sync()` + `size_changed`.
- Камера вида back (yaw 180) улетала за глухую стену → back = yaw −90°.
- Стены комнаты блокируют камеру снаружи → скрытие стены на стороне ракурса (`LabRoom.set_view`).
- JS-баг `_detail_body`: индекс капилляра мог быть последним (`p1 = pts[k+1]` → crash) → clamp до size−2.
- Углы суставов JS→Godot зеркалятся (`JSIGN = −1`): сегменты заданы сверху-вниз, Godot Y-вверх. **Проверить визуально в Фазе B** (колено сгибается пяткой назад, локоть — вперед).

## Фазы
- **B — тело оживает**: unfreeze, драйвер мышц (angular motors из POSE/JK/ARMP), стабилизатор баланса (COM-аналог `legC`/`armC`), поворот тела (FACE), позы stand/crouch/lie/fetal/flinch/sit, сидение/лёг, падение. Проверка знаков JSIGN.
- **C — инструменты**: drag через сцены, порт `sim/ballistics.js` (калибры, треки, рикошеты), `sim/melee.js` (порезы/топор), `sim/wounds.js` (woundPath/кламп/швы → 3D: декали + меши слоёв кожи), отрывы суставов (broken joint + культя), gore (GQ(), пятна/лужи), жёсткая QA-проверка хита: raycast сегмент→(s,w,z).
- **D — физиология**: `sim/physiology.js` (HR/BP/SpO2/шок/аресты/VF, ECG), `sim/medical.js` (медикаменты/DR), `sim/healing.js`, `sim/chemistry.js` (DRINK), HUD-ECG, мониторы.
- **E — виды и rентген**: front/back-render анатомии (frontParts/torsoHW уже в sim_body), x-ray со слоями (XL(), BONES/ORG/VESSELS меши в 3D — просто включение видимости), анатомическая глава.
- **F — meta**: story/aware симуляция (`bodies.js`, зомби/обмороки), audio, i18n (ru/en), сохранения, Android-экспорт (vram → ETC2/ASTC), полировка.

## Готовые хуки для будущих фаз
- `SimBody.frame/to_local/to_world/rad/rad_s/pick_seg/inside_seg` — геометрия хитов в JS-координатах.
- `SimEnv.GQ()/gore_n` — множители gore.
- `HumanBody3D.nodes[id]` — доступ к RigidBody3D сегмента; `jnodes` — к суставам (motors для Фазы B).
- Данные `POSE/JK/ARMP/WR` — цели моторов суставов.
