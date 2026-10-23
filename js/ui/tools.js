/* TRAUMA_LAB_MAIN */
/* ===== ui/tools.js ===== */
// Trauma Lab — © 2026 Abynotic Studios. All rights reserved.
// Proprietary and confidential. Copying, redistribution or reuse without written permission is prohibited.
/* =========================================================
   TOOLS + UI
   ========================================================= */
const IC={pool:'<path d="M3 8v11h18V8"/><path d="M3 12c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0"/>',gurney:'<path d="M2 11h20M3 9h6M4 11v7M20 11v7"/><circle cx="4" cy="20" r="1.5"/><circle cx="20" cy="20" r="1.5"/>',
  table:'<path d="M3 8h18M5 8v12M19 8v12M5 12h14"/>',
  chair:'<path d="M7 3v18M7 13h11M17 13v8M7 9h3"/>',
  beaker:'<path d="M6 3h12M7.5 3v15a3 3 0 0 0 3 3h3a3 3 0 0 0 3-3V3M7.5 12h9"/>',
  jug:'<path d="M7 4h8l1 3v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7zM16 9h2a2 2 0 0 1 0 4h-2M7 11h9"/>',
  powder:'<path d="M8 4h8v3l2 3v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-9l2-3z"/><circle cx="10" cy="14" r=".8"/><circle cx="13.5" cy="16" r=".8"/><circle cx="12" cy="12" r=".8"/>',
  flask:'<path d="M9.5 3h5M10.5 3v6L5.6 18a2 2 0 0 0 1.8 3h9.2a2 2 0 0 0 1.8-3L13.5 9V3M7.8 15h8.4"/>',
  metal:'<path d="M4 15l5-7h7l4 7-4 4H8z"/><path d="M9 8l2 7h9M11 15l-3 4"/>',
  bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  fireball:'<circle cx="15" cy="13" r="5"/><path d="M10 11H3M11 15H5M12 8 7 5"/>',
  snow:'<path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 2 3-2M9 20l3-2 3 2"/>',
  acid:'<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11zM9 14a3 3 0 0 0 3 3"/>',
  tk:'<circle cx="12" cy="12" r="3"/><path d="M5 12a7 7 0 0 1 14 0M2 12a10 10 0 0 1 20 0M12 15v6"/>',
  push:'<path d="M3 12h10M9 7l5 5-5 5M17 5v14M21 8v8"/>',
  quake:'<path d="M2 17h4l2-6 3 9 3-12 3 9 2-4h3M4 21h16"/>',
  hole:'<circle cx="12" cy="12" r="3"/><path d="M12 4a8 8 0 0 1 8 8M4 12a8 8 0 0 0 8 8M18 6a9 9 0 0 0-11-1M6 18a9 9 0 0 0 11 1"/>',
  meteor:'<circle cx="16" cy="16" r="4"/><path d="M13 13 4 4M15 11 9 5M11 15 5 9"/>',
  laser:'<path d="M3 21 21 3M14 3h7v7"/><circle cx="6" cy="18" r="1.5"/>',
  saber:'<path d="M5 19 19 5" stroke-width="2.6"/><path d="M3 21l3.4-3.4M5.6 15.6l2.8 2.8"/>',
  dust:'<path d="M5 19h2M9 17h2M7 14h2M12 20h2M14 15h2M17 18h2M11 11h2M16 11h1M8 9h1"/><path d="M10 4h4v4h-4z"/>',
  brain:'<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a3 3 0 0 0-3-1zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>',
  drain:'<path d="M8 3s4 5 4 8a4 4 0 0 1-8 0c0-3 4-8 4-8zM14 14h7M18 11l3 3-3 3"/>',
  rope:'<path d="M5 3v3M3.5 6h3M5 6c0 5 4 4 7 6s2 6 6 6"/><circle cx="19" cy="19" r="2"/>',
  grab:'<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4a1.5 1.5 0 0 1 3 0v7M14 11V5.5a1.5 1.5 0 0 1 3 0V13M17 10.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1.5A5.5 5.5 0 0 1 8 16.5l-2.6-3.8a1.6 1.6 0 0 1 2.6-1.9L8 13"/>',
  move:'<path d="M12 3v18M3 12h18M12 3 9.5 5.5M12 3l2.5 2.5M12 21l-2.5-2.5M12 21l2.5-2.5M3 12l2.5-2.5M3 12l2.5 2.5M21 12l-2.5-2.5M21 12l-2.5 2.5"/>',
  bow:'<path d="M6 3c6 3 6 15 0 18M6 3v18M3 12h17M17 9l3 3-3 3"/>',
  crossbow:'<path d="M4 12h16M12 5c3 2 3 12 0 14M6 9l-2 3 2 3M15 12v5"/>',
  pistol:'<path d="M3 7h16l1 2h1v3h-8l-1.5 1.5V19H7.5l1-7H3z"/>',
  revolver:'<path d="M2 8h13l1-1h5v3h-4v1h-3l-1.5 1.5V19H8.5l1-6.5H2zM11.5 11.5h.01"/>',
  smg:'<path d="M2 9h17l2 1v2h-7l-1 2h-2v5H8v-5H6l-1-3H2zM13 14v4h2v-4"/>',
  rifle:'<path d="M1.5 10h15l1.5-1h4.5v3H17l-2 1h-3l-1 3.5H8.5l1-3.5H5l-3.5 2.5z"/>',
  shotgun:'<path d="M2 9h20v3H11l-1.5 2.5H7L8 12H2zM3.5 12 2 16h3l1.5-4"/>',
  sniper:'<path d="M1 12h18l2-1h2M5 12v2.5L3 18M10 12l-1 4h2M8 8.5h7v3.5H8zM6.5 10H8M15 10h1.5"/>',
  knife:'<path d="M3 21l8.5-8.5M11.5 12.5 20 4c.6 3.4-1.4 7.6-5 10.2z"/>',
  machete:'<path d="M3 21l4.5-4.5M7.5 16.5 19 5c1.8 1 2.2 3.5.8 5.6L11 19.5z"/>',
  bat:'<path d="M4 20l1.2 1.2M5 19.2 16.6 7.6a2.9 2.9 0 0 1 4.1 4.1L9 23.3"/>',
  axe:'<path d="M5 21L16 10M13.5 4.5c3-1.5 6.5-.5 7 3l-4.8 4.8-5.2-5.2z"/>',
  pipe:'<path d="M4 18l14-14M6 20l14-14M3.5 17.5l3 3M17.5 3.5l3 3"/>',
  crowbar:'<path d="M4 20L18 6c1-1 3-1 3 1v2M4 20l-1-2"/>',
  hammer:'<path d="M14.5 3.5l6 6M11 7l6 6-2.6 2.6-6-6zM8.4 12.6 3 18l3 3 5.4-5.4"/>',
  brick:'<path d="M3 7.5h18v9H3zM3 12h18M9 7.5V12M15 12v4.5"/>',
  ball:'<path d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM10 8h.01M13.5 7.5h.01M12.5 10.8h.01"/>',
  anvil:'<path d="M2 7h13c0 3 3 4 7 4-2 1-5 1-7 2v2l2 3H6l2-3v-2C5 13 3 11 2 7z"/>',
  grenade:'<path d="M12 9a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zM10 9V6h4v3M14 6.5l4.5-2"/>',
  c4:'<path d="M3 9h18v9H3zM7 9V6h10v3M7 13.5h4M15.5 13.5h.01"/>',
  mine:'<path d="M3 18h18M5 18c0-4 3-6.5 7-6.5s7 2.5 7 6.5M12 11.5V8.5M10 8.5h4"/>',
  flamer:'<path d="M3 13h10v4H3zM13 14h4M17 12.5v5M5 13v-3h4v3M19 15c1.5-1 2-2.5 1.5-4 1.5 1 2 3 .5 4.5"/>',
  ext:'<path d="M9 8h6v13H9zM10 8V5h4v3M14 5l4-2M12 3v2"/>',
  core:'<path d="M5 13a7 7 0 0 1 14 0zM5 15a7 7 0 0 0 14 0zM14 14h7"/>',
  organ:'<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11zM12 6v14"/>',
  source:'<path d="M8 15h8v5H8zM10 15v-3h4v3M12 3l1.5 4h-3zM6 6l3 3M18 6l-3 3"/>',
  gel:'<path d="M7 9h10l-1 11H8zM9 9V6h6v3M10 3h4v3M11 13c0 1 2 1 2 2s-2 1-2 2"/>',
  gauze:'<path d="M4 6h16v12H4zM4 10h16M4 14h16M9 6v12M15 6v12"/>',
  graft:'<path d="M5 5h14v14H5zM5 5l14 14M19 5 5 19M3 12h2M19 12h2M12 3v2M12 19v2"/>',
  forceps:'<path d="M5 3l7 11M19 3l-7 11M12 14v7M9 8.5l6 0"/>',
  scalpel:'<path d="M3 21l8-8M11 13l9-9c1 3-1 7-5 9l-2 1z"/>',
  plate:'<rect x="9" y="2" width="6" height="20" rx="2"/><circle cx="12" cy="6" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="18" r="1"/>',
  suture:'<path d="M4 20c2.5-.6 4-3 5.5-6S14 6.5 20 4M17.5 2.5l3 3M7 13l2.5 2.5M9.5 10.5 12 13M12.5 8l2.5 2.5"/>',
  remove:'<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5"/>',
  bandage:'<path d="M4.6 14.4l9.8-9.8a3.5 3.5 0 0 1 5 5l-9.8 9.8a3.5 3.5 0 0 1-5-5zM10 10l4 4M11 13h.01M13 11h.01"/>',
  tourniquet:'<path d="M3 12h18M7 8.5v7M17 8.5v7M12 12V5.5M9.5 5.5h5"/>',
  defib:'<path d="M13 2 5 13.5h6L10 22l8-12h-6z"/>',
  blood:'<path d="M12 3c3 4.5 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-6.5 6-11z" style="fill:#c4262f;stroke:#e0454f"/><path d="M10 15h4M12 13v4" style="stroke:#fff"/>',
  saline:'<path d="M7.5 3h9v11a4.5 4.5 0 0 1-9 0zM12 18.5V22M10 7.5h4M10 10.5h4"/>',
  syringe:'<path d="M18 2l4 4M20 4l-8.5 8.5M15 7l2 2M14.5 6.5 6 15l-2 5 5-2 8.5-8.5M7.5 13.5l3 3"/>',
  medcat:'<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
  bomb:'<path d="M11 8.5a6.75 6.75 0 1 1 0 13.5 6.75 6.75 0 0 1 0-13.5zM14.5 9.5l2-2M17.5 6.5l1.5-1.5M19.5 3v1.5M21 4.5h-1.5"/>',
};
const TOOLS=[
  {id:'grab',cat:'hand',name:'Grab',icon:'grab',desc:'Drag body parts or objects',hint:'Drag any body part or object. Fling to throw. Tap a body part to examine it.'},
  {id:'remove',cat:'hand',name:'Remove',icon:'remove',desc:'Take off bandages, stitches, tourniquets, objects',hint:'Tap a bandage, stitches, tourniquet, stuck knife, charge, mine, object or debris to remove it.',front:true},
  {id:'extinguisher',cat:'hand',name:'Extinguisher',icon:'ext',desc:'Hold to spray, puts out fire',front:true,hint:'Hold over the flames to put them out. Lying down also smothers fire.'},
  {id:'rope',cat:'hand',name:'Rope',icon:'rope',desc:'Tie him to a wall, the ceiling or an object',hint:'Press on a body part and drag to where the rope should go. Tap a rope to select it and use the Pull slider. Pull too hard and the joint gives way.'},
  {id:'move',cat:'hand',name:'Move',icon:'move',desc:'Pan and zoom the camera',hint:'Drag to pan. Pinch or scroll to zoom. Works in both views.',front:true},
  {id:'p22',cat:'guns',name:'.22 Pistol',icon:'pistol',desc:'.22 LR, 150 J, small holes',gun:true,front:true},
  {id:'p45',cat:'guns',name:'.45 Pistol',icon:'pistol',desc:'.45 ACP, 560 J, heavy slow round',gun:true,front:true},
  {id:'ak',cat:'guns',name:'Assault rifle',icon:'rifle',desc:'7.62x39, 2100 J, full auto',gun:true,front:true},
  {id:'dmr',cat:'guns',name:'Marksman',icon:'sniper',desc:'.308, 3500 J',gun:true,front:true},
  {id:'bow',cat:'guns',name:'Compound bow',icon:'bow',desc:'70 lb · 28 g arrow up to 90 m/s (~110 J) · broadheads cut, arrows stay in',front:true,hint:'Side view: drag from where you stand toward the target and hold to draw; let go to shoot. Arrows drop over distance. Tap to shoot from the wall. Front/back: tap where to aim; you shoot from 25 m and the arrow arcs down onto the spot.'},
  {id:'crossbow',cat:'guns',name:'Crossbow',icon:'crossbow',desc:'26 g bolt at ~110 m/s (~160 J) · 2.5 s to re-cock',front:true,hint:'Side view: drag to aim, let go to shoot; tap to shoot from the wall. It takes 2.5 s to re-cock. Front/back: tap.'},
  {id:'bmg',cat:'guns',name:'.50 BMG',icon:'sniper',desc:'18 kJ anti-materiel: blows limbs off, bursts the head, tears the torso open',gun:true,front:true},
  {id:'slug',cat:'guns',name:'Slug',icon:'shotgun',desc:'12 ga slug, 3200 J, one huge hole',gun:true,front:true},
  {id:'pistol',cat:'guns',name:'Pistol',icon:'pistol',desc:'9 mm, 520 J',gun:true,front:true},
  {id:'revolver',cat:'guns',name:'Revolver',icon:'revolver',desc:'.44 Magnum, 1300 J',gun:true,front:true},
  {id:'smg',cat:'guns',name:'SMG',icon:'smg',desc:'9 mm, full auto',gun:true,front:true},
  {id:'rifle',cat:'guns',name:'Rifle',icon:'rifle',desc:'5.56 mm, semi or auto',gun:true,front:true,modes:[['semi','Semi'],['auto','Auto']]},
  {id:'flamer',cat:'guns',name:'Flamer',icon:'flamer',desc:'Flamethrower, hold to burn',gun:true,front:true},
  {id:'shotgun',cat:'guns',name:'Shotgun',icon:'shotgun',desc:'12 gauge, 9 pellets',gun:true,front:true},
  {id:'sniper',cat:'guns',name:'Sniper',icon:'sniper',desc:'.338, can sever limbs',gun:true,front:true},
  {id:'knife',cat:'melee',name:'Knife',icon:'knife',desc:'0.15 kg · edge slices, point stabs on a thrust',front:true,modes:[['slash','Swing'],['stab','Stab']],hint:'Side view: press to take it by the handle and swing it. The edge cuts along its path; thrust the point in to stab. Let go to throw it.'},
  {id:'machete',cat:'melee',name:'Machete',icon:'machete',desc:'0.6 kg · deep chops, can sever',front:true,hint:'Side view: take it by the handle and swing. Fast chops at a joint can sever it. Front/back: swipe across the body.'},
  {id:'axe',cat:'melee',name:'Axe',icon:'axe',desc:'1.6 kg · heavy chop that splits bone',front:true,hint:'Side view: take it by the handle and swing; the heavy head whips around. Front/back: tap to chop.'},
  {id:'saber',cat:'melee',name:'Plasma sword',icon:'saber',desc:'Plasma blade: cuts through bone, seals the wound',front:true,modes:[['blue','Blue'],['red','Red'],['green','Green'],['purple','Purple']],hint:'Side view: take the hilt and sweep the blade through him. Front/back: swipe across the body.'},
  {id:'bat',cat:'melee',name:'Baseball bat',icon:'bat',desc:'0.9 kg wood · tramline bruises, fractures',front:true,hint:'Side view: take it by the grip and swing; hit with the barrel for the most force. Front/back: tap to strike.'},
  {id:'pipe',cat:'melee',name:'Steel pipe',icon:'pipe',desc:'1.2 kg · rough steel, scrapes and splits skin',front:true,hint:'Side view: take it and swing. Front/back: tap to strike.'},
  {id:'crowbar',cat:'melee',name:'Crowbar',icon:'crowbar',desc:'1.6 kg steel · the hook punches holes',front:true,hint:'Side view: take it and swing; the hooked end punctures. Front/back: tap to strike.'},
  {id:'hammer',cat:'melee',name:'Hammer',icon:'hammer',desc:'0.6 kg · round face, depressed fractures',front:true,hint:'Side view: take it by the handle and swing; the face leaves a round mark, the claw punctures. Front/back: tap to strike.'},
  {id:'brick',cat:'thrown',name:'Brick',icon:'brick',desc:'2.5 kg',throw:true,hint:'Drag toward a target and release to throw. Tap to drop.'},
  {id:'ball',cat:'thrown',name:'Bowling',icon:'ball',desc:'7 kg bowling ball',throw:true,hint:'Drag toward a target and release to throw. Tap to drop.'},
  {id:'anvil',cat:'thrown',name:'Anvil',icon:'anvil',desc:'100 kg industrial anvil',throw:true,hint:'Tap high above him to drop it, or drag and release to throw. 100 kg of steel crushes whatever it lands on.'},
  {id:'pool',cat:'props',name:'Pool',icon:'pool',desc:'180 cm tank, holds ≈ 890 L · starts empty, slides when pushed',prop:true,hint:'Tap the floor to place it (it starts empty). Pick Water or any chemical and tap over it to pour (Amount sets how much, or type your own, e.g. 500 L). Drag him in with Grab.'},
  {id:'gurney',cat:'props',name:'Gurney',icon:'gurney',desc:'45 kg hospital stretcher on wheels',prop:true,hint:'Tap to place a gurney (it needs ≈2 m of room). Grab him and lay him on it, or grab the gurney and roll it.'},
  {id:'table',cat:'props',name:'Table',icon:'table',desc:'24 kg wooden table',prop:true,hint:'Tap to place a table, or drag and release to throw it. Grab it to drag it around; he can land on it, under it or against it.'},
  {id:'chair',cat:'props',name:'Chair',icon:'chair',desc:'6 kg wooden chair',prop:true,hint:'Tap to place a chair, or drag and release to throw it. Grab it to swing it into him.'},
  {id:'beakerS',cat:'chem',name:'Beaker 50 mL',icon:'beaker',desc:'Small 50 mL glass beaker, empty · breaks on impact',prop:true,hint:'Tap to place an empty beaker. Fill it from the chemicals. Grab it near the bottom to tip it and pour, or throw it.'},
  {id:'beaker',cat:'chem',name:'Beaker 250 mL',icon:'beaker',desc:'250 mL glass beaker, empty · breaks on impact',prop:true,hint:'Tap to place an empty beaker. Fill it from the chemicals. Grab it near the bottom to tip it and pour, or throw it.'},
  {id:'beakerL',cat:'chem',name:'Beaker 1 L',icon:'beaker',desc:'1 L glass beaker, empty · heavy when full',prop:true,hint:'Tap to place an empty beaker. Fill it from the chemicals. Grab it near the bottom to tip it and pour, or throw it.'},
  {id:'jug',cat:'chem',front:true,name:'Water',icon:'jug',desc:'Tap a beaker: + 20% water · tap him: rinse 40 mL over him',hint:'Water dilutes and cools a beaker. Poured on him it rinses chemicals off the skin (first aid: rinse a chemical burn for 20 minutes).'},
  {id:'h2so4',cat:'chem',front:true,name:'Sulfuric acid',icon:'flask',desc:'98% H₂SO₄ · oily, dehydrates and chars skin · very hot when mixed with water',hint:'Tap a beaker to add 10% of its size, tap anywhere to pour 10 mL, hold to keep pouring. Add acid to water: water poured into strong acid boils and spits.'},
  {id:'hcl',cat:'chem',front:true,name:'Hydrochloric acid',icon:'flask',desc:'37% HCl · fuming, acrid vapour · corrosive',hint:'Strong acid. Its vapour (hydrogen chloride) irritates the eyes and airway when the beaker is near his face.'},
  {id:'naoh',cat:'chem',front:true,name:'Sodium hydroxide',icon:'flask',desc:'32% lye · feels soapy, then eats deep · worst in the eyes',hint:'Strong alkali. Alkali burns keep penetrating until washed off (liquefactive necrosis). Mix with acid to neutralise it: it gets hot.'},
  {id:'nh3',cat:'chem',front:true,name:'Ammonia',icon:'flask',desc:'25% ammonia solution · pungent vapour',hint:'Weak alkali with a strong vapour: near his face it makes him cough and burns his eyes and airway above 300 ppm. Next to hydrochloric acid it makes white smoke.'},
  {id:'h2o2',cat:'chem',front:true,name:'Hydrogen peroxide',icon:'flask',desc:'3% H₂O₂ · foams white in wounds',hint:'Harmless on skin. In an open wound the enzyme catalase in blood splits it into water and oxygen: white foam and a sting.'},
  {id:'etoh',cat:'chem',front:true,name:'Ethanol',icon:'flask',desc:'96% alcohol · stings wounds · flammable',hint:'Stings in open wounds. Any flame nearby lights it with a pale blue flame, in the beaker or on his skin.'},
  {id:'ln2',cat:'chem',front:true,name:'Liquid nitrogen',icon:'flask',desc:'−196 °C · boils into fog · frostbite if it pools',hint:'Splashes skate off skin on a cushion of vapour (Leidenfrost effect); a pool of it causes frostbite. Poured into water it boils violently and freezes it.'},
  {id:'k',cat:'chem',front:true,name:'Potassium',icon:'metal',desc:'Metal · 0.3 g per tap · reacts with water',hint:'Drop it into a beaker with water: hydrogen and heat, a lilac flame, pops. Bigger amounts burst the beaker and spray boiling caustic potash.'},
  {id:'na',cat:'chem',front:true,name:'Sodium',icon:'metal',desc:'Metal · 0.3 g per tap · reacts with water',hint:'Like potassium but slower: fizzes and melts into a ball, orange flame once it is hot enough.'},
  {id:'soda',cat:'chem',front:true,name:'Baking soda',icon:'powder',desc:'NaHCO₃ powder · fizzes with acid',hint:'Tap to shake out a pinch, hold to keep pouring. In acid it fizzes CO₂ foam (and cools slightly). It neutralises acid on the skin too.'},
  {id:'ind',cat:'chem',front:true,name:'Indicator',icon:'flask',desc:'Universal indicator · colours by pH',hint:'A few drops colour the liquid by pH: red acid, green neutral, purple alkali.'},
  {id:'grenade',cat:'thrown',name:'Grenade',icon:'grenade',desc:'2.5 s fuse',throw:true,hint:'Drag to throw. It explodes 2.5 s after release.'},
  {id:'c4',cat:'explo',name:'C4',icon:'c4',desc:'Sticks to what you tap, 3 s',front:true,hint:'Tap the body to stick a charge to it, or tap anywhere to place it. Detonates after 3 s.'},
  {id:'core',cat:'explo',name:'Demon core',icon:'core',desc:'Radiation accident: tap to slip the screwdriver',hint:'Tap the floor to place the core. Tap the core to let the screwdriver slip: blue flash, radiation dose by distance. Tap again to reopen it.'},
  {id:'lightning',cat:'power',name:'Lightning',icon:'bolt',power:true,front:true,desc:'Tap: a bolt from the sky',hint:'Tap him or the floor near him. The current burns in and out through the feet and can stop the heart.'},
  {id:'fireball',cat:'power',name:'Fireball',icon:'fireball',power:true,desc:'Tap: hurl a fireball from the wall',hint:'Tap where the fireball should hit. It bursts into flames and sets him alight.'},
  {id:'freeze',cat:'power',name:'Freeze',icon:'snow',power:true,front:true,desc:'Tap: flash-freeze him solid',hint:'Tap to freeze him. Frozen limbs shatter when shot or dropped hard. Stay frozen too long and the cold kills him.'},
  {id:'acid',cat:'power',name:'Acid',icon:'acid',power:true,front:true,desc:'Drag: spray acid on the skin',hint:'Drag across the body to spray acid. It keeps eating deeper for a few seconds.'},
  {id:'tk',cat:'power',name:'Telekinesis',icon:'tk',power:true,desc:'Hold: lift and fling with your mind',hint:'Hold on the torso to lift his whole body and fling him into walls. Hold a limb and pull hard to rip it off.'},
  {id:'push',cat:'power',name:'Force push',icon:'push',power:true,desc:'Tap: shockwave knocks him flying',hint:'Tap near him to blast a shockwave out from that point.'},
  {id:'quake',cat:'power',name:'Earthquake',icon:'quake',power:true,desc:'Tap: shake the ground for 4 s',hint:'Tap anywhere to shake the floor.'},
  {id:'blackhole',cat:'power',name:'Black hole',icon:'hole',power:true,desc:'Tap: a black hole that never stops growing',hint:'Tap to open a black hole. It keeps growing and pulling harder: it drags in him, props, debris and blood, tears limbs off and disintegrates everything that crosses the horizon. Tap it again to close it.'},
  {id:'meteor',cat:'power',name:'Meteor',icon:'meteor',power:true,desc:'Tap: call down a meteor',hint:'Tap where the meteor should land.'},
  {id:'laser',cat:'power',name:'Laser',icon:'laser',power:true,desc:'Drag: beam that slices and cauterises',hint:'Drag across the body. The beam cuts through limbs and seals small vessels as it burns.'},
  {id:'snap',cat:'power',name:'Disintegrate',icon:'dust',power:true,front:true,desc:'Tap a limb: it turns to dust',hint:'Tap a limb or the head and it crumbles to ash. Tap the torso and he is gone. Ultra serum can rebuild lost limbs.'},
  {id:'mind',cat:'power',name:'Mind crush',icon:'brain',power:true,front:true,desc:'Hold: crush the brain until it bursts',hint:'Hold anywhere. His brain bleeds, his eyes and nose bleed, and after a few seconds his head bursts.'},
  {id:'drain',cat:'power',name:'Life drain',icon:'drain',power:true,front:true,desc:'Hold on him: pull the blood out',hint:'Hold on the body to draw his blood out through the skin.'},
  {id:'source',cat:'explo',name:'Rad source',icon:'source',desc:'Glowing capsule: steady radiation, Geiger clicks',hint:'Tap the floor to drop a radioactive capsule. It irradiates whoever is close, burning the skin that faces it. Tap it again to pick it up.'},
  {id:'mine',cat:'explo',name:'Landmine',icon:'mine',desc:'Triggers when stepped on',hint:'Tap the floor to bury a mine. It arms after 1.4 s and blows upward.'},
  {id:'bandage',cat:'med',name:'Bandage',icon:'bandage',desc:'Tap to dress, drag to wrap',front:true,hint:'Tap a wound to dress it. Drag along the body to wrap a roll of bandage around it, covering every wound and burn underneath.'},
  {id:'burngel',cat:'med',name:'Burn gel',icon:'gel',desc:'Cooling ointment: tap or rub over burns',front:true,hint:'Tap a burn, or drag over burned skin to rub the ointment in. It cools, eases pain, stops fluid loss and heals 1st and 2nd degree burns. 3rd degree burns still need a Graft.'},
  {id:'gauze',cat:'med',name:'Gauze pack',icon:'gauze',desc:'Stuff deep wounds, craters, stumps',front:true,hint:'Tap a wound to pack it with hemostatic gauze. Works on craters and stumps that cannot be stitched.'},
  {id:'graft',cat:'med',name:'Graft',icon:'graft',desc:'Rebuild missing tissue, close stumps',front:true,hint:'Tap a big wound, crater or stump. Cleans it, ties off the vessels in it and covers it with a skin graft. Sedate him first.'},
  {id:'transplant',cat:'med',name:'Transplant',icon:'organ',desc:'Donor organ, reattach limb, bone marrow',front:true,hint:'Tap a body part to swap its most damaged organ for a donor one. Tap a stump or a cut-off limb to sew it back on. After radiation, tap the body for a bone marrow transplant.'},
  {id:'forceps',cat:'med',name:'Forceps',icon:'forceps',desc:'Pull out a lodged bullet',front:true,hint:'Tap a grey bullet to pull it out. Bullets left inside hurt and slowly bleed.'},
  {id:'ortho',cat:'med',name:'Bone plate',icon:'plate',desc:'Set broken bones with steel plates and screws',front:true,hint:'Tap a broken arm, leg, the hip, spine, skull or chest. Opens over the fracture, sets the bone straight and fixes it with a plate and screws, so he can use the limb and stand again once the pain allows. Sedate him first.'},
  {id:'surgery',cat:'med',name:'Surgery',icon:'scalpel',desc:'Open repair of internal bleeding',front:true,hint:'Tap a body part to operate: ties off bleeding vessels, repairs bleeding organs and removes bullets there, then closes. Sedate him first.'},
  {id:'suture',cat:'med',name:'Suture',icon:'suture',desc:'Stitch a wound closed',front:true,hint:'Tap a wound to stitch it closed. Ties off torn vessels at the wound. Deep internal bleeding continues.'},
  {id:'tourniquet',cat:'med',name:'Tourniquet',icon:'tourniquet',desc:'Stops limb bleeding',front:true,hint:'Tap an arm or leg. Clamps every bleeding vessel below the strap.'},
  {id:'defib',cat:'med',name:'Defib',icon:'defib',desc:'Shock a fibrillating heart',front:true,hint:'Tap to shock. Restarts ventricular fibrillation if the heart can still pump. Adrenaline improves the odds.'},
  {id:'blood',cat:'med',name:'Blood',icon:'blood',desc:'500 ml O-negative',front:true,hint:'Tap to transfuse 500 ml of whole blood.'},
  {id:'saline',cat:'med',name:'Saline',icon:'saline',desc:'500 ml volume, no oxygen',front:true,hint:'Tap to give 500 ml saline. Raises blood pressure but dilutes oxygen-carrying blood.'},
  {id:'painkiller',cat:'drugs',name:'Paracetamol',icon:'syringe',desc:'Mild pain relief',front:true,drug:true},
  {id:'morphine',cat:'drugs',name:'Morphine',icon:'syringe',desc:'Strong pain relief, slows breathing',front:true,drug:true},
  {id:'adrenaline',cat:'drugs',name:'Adrenaline',icon:'syringe',desc:'Raises HR and BP, wakes, aids restart',front:true,drug:true},
  {id:'naloxone',cat:'drugs',name:'Naloxone',icon:'syringe',desc:'Reverses morphine and fentanyl',front:true,drug:true},
  {id:'txa',cat:'drugs',name:'TXA',icon:'syringe',desc:'Slows bleeding',front:true,drug:true},
  {id:'sedative',cat:'drugs',name:'Midazolam',icon:'syringe',desc:'Sedation, calms writhing',front:true,drug:true},
  {id:'fentanyl',cat:'drugs',name:'Fentanyl',icon:'syringe',desc:'Fast, potent opioid. Stops breathing in excess',front:true,drug:true},
  {id:'ketamine',cat:'drugs',name:'Ketamine',icon:'syringe',desc:'Pain relief without slowing breathing. Dissociates',front:true,drug:true},
  {id:'atropine',cat:'drugs',name:'Atropine',icon:'syringe',desc:'Speeds up a slow heart',front:true,drug:true},
  {id:'amiodarone',cat:'drugs',name:'Amiodarone',icon:'syringe',desc:'Antiarrhythmic. Helps defib, blocks adrenaline VF',front:true,drug:true},
  {id:'caffeine',cat:'drugs',name:'Caffeine',icon:'syringe',desc:'Mild stimulant, faster heart',front:true,drug:true},
  {id:'alcohol',cat:'drugs',name:'Alcohol',icon:'syringe',desc:'Drunk: sways, dulls pain, slows breathing in excess',front:true,drug:true},
  {id:'cocaine',cat:'drugs',name:'Cocaine',icon:'syringe',desc:'Racing heart, agitation, can stop the heart',front:true,drug:true},
  {id:'lsd',cat:'drugs',name:'LSD',icon:'syringe',desc:'Hallucinations, the screen trips with him',front:true,drug:true},
  {id:'cyanide',cat:'drugs',name:'Cyanide',icon:'syringe',desc:'Fast poison: cells stop using oxygen',front:true,drug:true},
  {id:'venom',cat:'drugs',name:'Snake venom',icon:'syringe',desc:'Blood stops clotting, bleeds inside',front:true,drug:true},
  {id:'arsenic',cat:'drugs',name:'Arsenic',icon:'syringe',desc:'Slow poison: organs fail, vomiting',front:true,drug:true},
  {id:'cyanokit',cat:'drugs',name:'Cyanide antidote',icon:'syringe',desc:'Binds cyanide',front:true,drug:true},
  {id:'antivenom',cat:'drugs',name:'Antivenom',icon:'syringe',desc:'Neutralises snake venom',front:true,drug:true},
  {id:'chelator',cat:'drugs',name:'Chelator',icon:'syringe',desc:'Pulls arsenic out of the body',front:true,drug:true},
  {id:'ultra',cat:'drugs',name:'Ultra serum',icon:'syringe',desc:'Brings back the dead, regrows lost limbs',front:true,drug:true},
  {id:'inhibitor',cat:'drugs',name:'Inhibitor',icon:'syringe',desc:'One shot: instantly cancels every drug, serum, poison and virus',front:true,drug:true},
  {id:'radx',cat:'drugs',name:'Rad antidote',icon:'syringe',desc:'Flushes radiation, rebuilds marrow, heals radiation burns',front:true,drug:true},
  {id:'serum',cat:'drugs',name:'Super serum',icon:'syringe',desc:'Experimental: the body regenerates',front:true,drug:true},
  {id:'zvirus',cat:'drugs',name:'Zombie virus',icon:'syringe',desc:'He sickens, dies, then rises rotten and hungry',front:true,drug:true},
  {id:'flumazenil',cat:'drugs',name:'Flumazenil',icon:'syringe',desc:'Reverses midazolam',front:true,drug:true},
];
const TOOL={};
TOOLS.forEach(t=>TOOL[t.id]=t);
const SUBG={
  hand:[['Interact',['grab','move','remove','rope']],['Utility',['extinguisher']]],
  guns:[['Handguns',['p22','pistol','p45','revolver']],['Automatic',['smg','rifle','ak']],['Shotguns',['shotgun','slug']],['Precision',['dmr','sniper','bmg']],['Bows',['bow','crossbow']],['Special',['flamer']]],
  melee:[['Blades',['knife','machete','axe','saber']],['Blunt',['bat','pipe','crowbar','hammer']]],
  thrown:[['Objects',['brick','ball','anvil']],['Explosive',['grenade']]],
  props:[['Furniture',['table','chair','gurney']],['Containers',['pool']]],
  chem:[['Glassware',['beakerS','beaker','beakerL']],['Liquids',['jug','h2so4','hcl','naoh','nh3','h2o2','etoh','ln2','ind']],['Solids',['k','na','soda']]],
  explo:[['Explosives',['c4','mine']],['Hazards',['core','source']]],
  power:[['Elements',['lightning','fireball','freeze','acid']],['Force',['tk','push','quake','blackhole','meteor']],['Dark arts',['laser','snap','mind','drain']]],
  med:[['Bleeding control',['bandage','gauze','tourniquet']],['Burns',['burngel']],['Wound repair',['suture','graft']],['Surgery',['surgery','ortho','forceps','transplant']],['Resuscitation',['defib','blood','saline']]],
  drugs:[['Pain relief',['painkiller','morphine','fentanyl','ketamine']],['Sedation & reversal',['sedative','naloxone','flumazenil']],['Heart & blood',['adrenaline','atropine','amiodarone','txa']],['Recreational',['caffeine','alcohol','cocaine','lsd']],['Poisons',['cyanide','venom','arsenic']],['Antidotes',['cyanokit','antivenom','chelator','radx']],['Experimental',['serum','ultra','inhibitor','zvirus']]],
};
const SUBOPEN={};
// sections you folded in the card view (per tab), kept while the game is open
const SUBCOL={};
const CATS=[
  {id:'hand',name:'Hand',icon:'grab'},{id:'weap',name:'Weapons',icon:'pistol'},{id:'props',name:'Props',icon:'table'},{id:'med',name:'Medicine',icon:'medcat'},{id:'power',name:'Powers',icon:'bolt'},
];
// tabs that hold several categories: a switch at the top of the menu picks the category
const SECS={weap:[['Firearms',['guns']],['Melee',['melee']],['Throwables',['thrown','explo']]],med:[['Surgery',['med']],['Drugs',['drugs']],['Chemicals',['chem']]]};
const TOPOF=c=>({guns:'weap',melee:'weap',thrown:'weap',explo:'weap',drugs:'med',chem:'med'}[c]||c);
const SECNOW={};
const lastIn={hand:'grab',weap:'pistol',props:'table',med:'bandage',power:'lightning'};
const MODE={knife:'slash',rifle:'semi',saber:'blue',rope:'tie'};
const svgI=n=>`<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${IC[n]}</svg>`;
function hintFor(t){
  const d=TOOL[t];
  if(view!=='side'&&!d.front)return d.name+' works in side view. Switch with the Side button.';
  if(d.gun)return view!=='side'?(view==='back'?'Tap a spot to shoot straight into the back. Hold to keep firing.':'Tap a spot to shoot straight into the body. Hold to keep firing.'):(WEAP[t].auto&&(t!=='rifle'||MODE.rifle==='auto')?'Hold to fire from the wall at that height. Drag to aim from anywhere.':'Tap to fire from the wall. Drag to aim from anywhere.');
  if(t==='knife')return MODE.knife==='slash'?'Drag across the body to slash.':(view==='side'?'Press to take the knife. Push it into the body, pull back to take it out. Let go while it is in to leave it there.':'Press the body to stab. Let go to leave the knife in, or drag away to pull it out.');
  if(d.drug)return 'Tap the body to inject '+DRUGS[t].name+'.';
  return d.hint||'';
}
function buildTools(){
  const nav=$('tools');nav.innerHTML='';
  for(const c of CATS){
    const b=document.createElement('button');b.className='cat';b.id='c_'+c.id;b.setAttribute('aria-haspopup','menu');b.setAttribute('aria-label',c.name);
    nav.appendChild(b);b.onclick=()=>openMenu(c.id,b);hoverBind(b,c.id,btn=>openMenu(c.id,btn));
  }
  refreshTools();
}
function refreshTools(){
  for(const c of CATS){const b=$('c_'+c.id);const cur=TOOL[lastIn[c.id]];const active=TOPOF(TOOL[tool].cat)===c.id;
    b.setAttribute('aria-pressed',active);b.innerHTML=`${svgI(active?cur.icon:c.icon)}<b>${c.name}</b><span>${cur.name}</span>`;b.title=c.name+' · '+cur.name;}
  $('hint').textContent=hintFor(tool);if(typeof nowUpdate==='function')nowUpdate();
  const t=TOOL[tool],md=$('modes');
  // front/back view melee: how hard you swing (keyboard: G)
  const strOn=view!=='side'&&(frontMeleeTool(tool)||(tool==='knife'&&MODE.knife==='slash'));
  const chemOn=typeof isChemTool==='function'&&isChemTool(tool);
  const ammoOn=t.gun&&AVAIL[tool]&&AVAIL[tool].length>1;
  if(t.modes||strOn||chemOn||ammoOn){md.hidden=false;let h=t.modes?t.modes.map(([k,l])=>`<button data-m="${k}" aria-pressed="${MODE[tool]===k}">${l}</button>`).join(''):'';
    if(ammoOn){const cur=ammoOf(tool);h+=(h?'<i class="msep"></i>':'')+'<span class="mlab">Ammo</span>'+AVAIL[tool].map(a=>`<button data-am="${a}" aria-pressed="${a===cur}" title="${AMMO[a].full}: ${AMMO[a].d}"><i class="amdot" style="background:${AMMO[a].col}"></i>${AMMO[a].n}</button>`).join('');}
    if(strOn)h+=(t.modes?'<i class="msep"></i>':'')+'<span class="mlab">Swing</span>'+MSTRL.map(([l],i)=>`<button data-str="${i}" aria-pressed="${(OPT.mstr==null?2:OPT.mstr)===i}">${l}</button>`).join('');
    if(chemOn){const g=!!(CHEM[chemKey(tool)].metal||CHEM[chemKey(tool)].powder),cv=OPT.chemc>0?fmtAmt(OPT.chemc,g):'';
      h+=(h?'<i class="msep"></i>':'')+'<span class="mlab">Amount</span>'+CHEMQ.map((f,i)=>`<button data-cq="${i}" aria-pressed="${(OPT.chemq??2)===i}" title="${['Drop','Small','Normal','Large','Max'][i]} · ×100 in the pool">${chemAmt(tool,f)}</button>`).join('')+
      `<label class="cqin" aria-pressed="${OPT.chemq===5}"><input id="chemC" type="text" inputmode="decimal" placeholder="Type: 250 ${g?'g':'mL'}, 2 L…" value="${cv}" aria-label="Your own amount" autocomplete="off" spellcheck="false"></label>`;}
    $('modeSeg').innerHTML=h;
    $('modeSeg').querySelectorAll('button[data-m]').forEach(b=>b.onclick=()=>{MODE[tool]=b.dataset.m;refreshTools();});
    $('modeSeg').querySelectorAll('button[data-am]').forEach(b=>b.onclick=()=>{setAmmo(tool,b.dataset.am);refreshTools();log('Ammunition · '+ammoName(tool),'info');});
    {const ci=$('chemC');if(ci){const apply=()=>{const v=parseAmt(ci.value,!!(CHEM[chemKey(tool)].metal||CHEM[chemKey(tool)].powder));if(v>0){if(OPT.chemc===v&&OPT.chemq===5)return;OPT.chemc=v;OPT.chemq=5;saveOpt();refreshTools();log('Amount per tap · '+fmtAmt(v,!!(CHEM[chemKey(tool)].metal||CHEM[chemKey(tool)].powder))+' (your own)','info');}else if(ci.value.trim())log('Type a number, like 250, 2 L or 30 g','info');};
      ci.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter'){apply();ci.blur();}};ci.onchange=apply;ci.onpointerdown=e=>e.stopPropagation();}}
    $('modeSeg').querySelectorAll('button[data-cq]').forEach(b=>b.onclick=()=>{OPT.chemq=+b.dataset.cq;saveOpt();refreshTools();log('Amount per tap · '+chemAmt(tool,CHEMQ[OPT.chemq]),'info');});
    $('modeSeg').querySelectorAll('button[data-str]').forEach(b=>b.onclick=()=>{OPT.mstr=+b.dataset.str;saveOpt();refreshTools();});}
  else md.hidden=true;
}
/* ---------- item menu: a grid of cards with real drawings, and a detail panel for what you hold ---------- */
function itemArt(t,big){const id=t.id,cls=big?'art big':'art';
  const a=artSVG(id,cls);if(a)return a;
  if(t.drug||DRUGCOL[id])return vialSVG(DRUGCOL[id]||'#9aa2aa').replace('class="art"',`class="${cls}"`);
  if(typeof isChemTool==='function'&&isChemTool(id)&&CHEM[chemKey(id)]){const ch=CHEM[chemKey(id)],c=ch.col;
    if(ch.metal)return metalSVG().replace('class="art"',`class="${cls}"`);
    if(ch.powder)return powderSVG(c?`rgba(${c[0]},${c[1]},${c[2]},1)`:'#eee').replace('class="art"',`class="${cls}"`);
    if(!c)return `<span class="ibadge c-med">${svgI(t.icon)}</span>`;
    return bottleSVG(`rgba(${c[0]},${c[1]},${c[2]},${Math.max(0.55,c[3])})`).replace('class="art"',`class="${cls}"`);}
  return `<span class="ibadge c-${TOPOF(t.cat)}">${svgI(t.icon)}</span>`;}
function itemSpec(t){if(t.gun&&CART[t.id])return CART[t.id].cal;if(WEAP[t.id]&&t.gun)return t.desc.split(/[,·]/)[0];return t.desc.split(' · ')[0].split(', ')[0];}
// stats for a firearm with the chosen load: muzzle energy, velocity, bullet mass (log scale for energy: 150 J … 18 kJ)
function gunStats(id){const W_=WEAP[id],C_=CART[id];if(!W_||!C_)return '';const Am=ammoShot(id,W_),E=Am.E*Am.pellets,v=C_.v;
  const bar=(lab,val,f,txt)=>`<div class="st"><span>${lab}</span><i><i style="width:${Math.round(clamp(f,0.04,1)*100)}%"></i></i><b>${txt}</b></div>`;
  return bar('Energy',E,Math.log(E/100)/Math.log(180),E>=1000?(E/1000).toFixed(1)+' kJ':Math.round(E)+' J')+bar('Velocity',v,v/1000,v+' m/s')+bar(Am.pellets>1?'Shot':'Bullet',C_.bm,Math.log(C_.bm*Am.pellets+1)/Math.log(45),Am.pellets>1?Am.pellets+(Am.am==='bird'?'+':'')+' pellets':C_.bm+' g');}
function ammoChips(id){const L=AVAIL[id];if(!L)return '';const cur=ammoOf(id);
  return `<div class="ammo" role="radiogroup" aria-label="Ammunition">${L.map(a=>`<button role="radio" data-am="${a}" aria-checked="${a===cur}" aria-pressed="${a===cur}" title="${AMMO[a].full}: ${AMMO[a].d}"><i style="background:${AMMO[a].col}"></i>${AMMO[a].n}</button>`).join('')}</div><p class="amd">${AMMO[cur].d}</p>`;}
function itemDetail(t){const gun=t.gun&&CART[t.id];
  return `<div class="idet"><div class="idart">${itemArt(t,true)}</div><div class="idtx"><span class="idk">In hand</span><b>${t.name}</b><em>${gun?CART[t.id].cal+' · '+(CART[t.id].act==='bolt'?'bolt action':CART[t.id].act==='pump'?'pump action':CART[t.id].act==='revolver'?'revolver':WEAP[t.id].auto?'automatic':'semi-automatic'):t.desc}</em></div>
    ${gun?`<div class="stats">${gunStats(t.id)}</div>${ammoChips(t.id)}`:''}</div>`;}
function openMenu(cat,btn){
  const m=$('menu');
  if(!m.hidden&&m.dataset.cat===cat){closeMenu();return;}
  m.dataset.cat=cat;
  const secs=SECS[cat];if(secs&&!SECNOW[cat])SECNOW[cat]=(secs.find(x=>x[1].includes(TOOL[tool].cat))||secs[0])[0];
  let groups,keys;
  const build=()=>{keys=secs?secs.find(x=>x[0]===SECNOW[cat])[1]:[cat];
    groups=keys.flatMap(k=>(SUBG[k]||[]).map(([n,ids])=>[n,ids.filter(i=>TOOL[i])]));
    const listed=new Set(groups.flatMap(g=>g[1]));const rest=TOOLS.filter(t=>keys.includes(t.cat)&&!listed.has(t.id)).map(t=>t.id);if(rest.length)groups.push(['Other',rest]);};
  build();
  const card=t=>{const off=CH&&CH.on&&!chAllowed(t.id),side=view!=='side'&&!t.front;const am=t.gun&&AVAIL[t.id]?AMMO[ammoOf(t.id)]:null;
    return `<button class="ic" role="menuitem" data-t="${t.id}" aria-pressed="${t.id===tool}"${off?' aria-disabled="true"':''} title="${t.name} · ${t.desc}${side?' · side view only':''}"><span class="ia">${itemArt(t)}</span><b>${t.name}</b><em>${itemSpec(t)}</em>${am?`<s style="--c:${am.col}">${am.n}</s>`:''}${side?'<u>Side view</u>':''}</button>`;};
  const row=t=>{const off=CH&&CH.on&&!chAllowed(t.id),side=view!=='side'&&!t.front;const am=t.gun&&AVAIL[t.id]?AMMO[ammoOf(t.id)]:null;
    return `<button class="ic row" role="menuitem" data-t="${t.id}" aria-pressed="${t.id===tool}"${off?' aria-disabled="true"':''}><span class="ia">${itemArt(t)}</span><b>${t.name}</b><em>${itemSpec(t)}${am?' · '+am.n:''}${side?' · side view only':''}</em></button>`;};
  let q=m.dataset.q&&m.dataset.cat===cat?m.dataset.q:'';
  const draw=()=>{
    const search=`<div class="msearch"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/></svg><input id="mq" type="search" placeholder="Search every item…" aria-label="Search every item" value="${q.replace(/"/g,'&quot;')}" autocomplete="off" spellcheck="false"></div>`;
    const L=!!OPT.mlist;
    const tog=`<button id="mview" class="mview" aria-pressed="${L}" title="${L?'Show cards with pictures':'Show a compact list'}" aria-label="${L?'Cards view':'Compact list view'}">${L?'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg><span>Cards</span>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg><span>List</span>'}</button>`;
    const head=`<div class="mhead"><h4>${CATS.find(c=>c.id===cat).name}</h4><div class="mrow">${search}${tog}</div></div>`;
    if(q){const k=q.toLowerCase();const rank=t=>{const n=t.name.toLowerCase(),id=t.id.toLowerCase();return n.startsWith(k)||id.startsWith(k)?0:n.includes(k)?1:(t.desc+' '+t.cat+' '+(CART[t.id]?CART[t.id].cal:'')).toLowerCase().includes(k)?2:9;};const hits=TOOLS.filter(t=>rank(t)<9&&!(CH&&CH.on&&!chAllowed(t.id))).sort((a,b)=>rank(a)-rank(b));
      m.innerHTML=head+(hits.length?(OPT.mlist?`<div class="ilist">${hits.slice(0,30).map(row).join('')}</div>`:`<div class="ig">${hits.slice(0,30).map(card).join('')}</div>`):'<p class="mnone">Nothing called that · try “knife”, “9 mm”, “burn”, “heart”…</p>');
      wire();return;}
    const cur=TOOL[tool],showDet=keys.includes(cur.cat);
    if(L){if(!SUBOPEN[cat+':'+SECNOW[cat]]){const g=groups.find(g=>g[1].includes(tool))||groups[0];SUBOPEN[cat+':'+SECNOW[cat]]={[g[0]]:true};}const so=SUBOPEN[cat+':'+SECNOW[cat]];
      m.innerHTML=head+(secs?`<div class="secs" role="tablist">${secs.map(([n,ks])=>`<button role="tab" data-sec="${n}" aria-pressed="${n===SECNOW[cat]}">${n}${ks.includes(TOOL[tool].cat)&&n!==SECNOW[cat]?' ·':''}</button>`).join('')}</div>`:'')
        +(showDet&&cur.gun&&AVAIL[tool]?`<div class="idet slim"><span class="idk">${cur.name} · ${CART[tool].cal}</span>${ammoChips(tool)}</div>`:'')
        +groups.map(([n,ids])=>{const op=!!so[n],has=ids.includes(tool);return `<div class="grp${op?' open':''}"><button class="gh" data-g="${n}" aria-expanded="${op}"><span>${n}${has&&!op?' ·':''}</span><small>${ids.length}</small><i>▾</i></button>${op?`<div class="ilist">${ids.map(i=>row(TOOL[i])).join('')}</div>`:''}</div>`;}).join('');
      m.querySelectorAll('.gh').forEach(b=>b.onclick=e=>{e.stopPropagation();const g=b.dataset.g,was=!!so[g];for(const k in so)delete so[k];so[g]=!was;draw();});}
    else
    m.innerHTML=head+(secs?`<div class="secs" role="tablist">${secs.map(([n,ks])=>`<button role="tab" data-sec="${n}" aria-pressed="${n===SECNOW[cat]}">${n}${ks.includes(TOOL[tool].cat)&&n!==SECNOW[cat]?' ·':''}</button>`).join('')}</div>`:'')
      +(showDet?itemDetail(cur):'')
      +groups.map(([n,ids])=>{const shut=!!(SUBCOL[cat+':'+SECNOW[cat]]||{})[n],has=ids.includes(tool);return `<button class="h5" data-g="${n}" aria-expanded="${!shut}"><span>${n}${shut&&has?' ·':''}</span><small>${ids.length}</small><i>▾</i></button>${shut?'':`<div class="ig">${ids.map(i=>card(TOOL[i])).join('')}</div>`}`;}).join('');
    m.querySelectorAll('.h5').forEach(b=>b.onclick=e=>{e.stopPropagation();const key=cat+':'+SECNOW[cat],o=SUBCOL[key]||(SUBCOL[key]={}),g=b.dataset.g;o[g]=!o[g];const st=m.scrollTop;draw();m.scrollTop=st;});
    m.querySelectorAll('.secs button').forEach(b=>b.onclick=e=>{e.stopPropagation();SECNOW[cat]=b.dataset.sec;build();draw();});
    m.querySelectorAll('.ammo button').forEach(b=>b.onclick=e=>{e.stopPropagation();setAmmo(tool,b.dataset.am);refreshTools();log('Ammunition · '+ammoName(tool),'info');const st=m.scrollTop;draw();m.scrollTop=st;});
    wire();};
  const wire=()=>{const mv=$('mview');if(mv)mv.onclick=e=>{e.stopPropagation();OPT.mlist=!OPT.mlist;saveOpt();const st=m.scrollTop;draw();m.scrollTop=OPT.mlist?0:st;};
m.querySelectorAll('.ic').forEach(b=>b.onclick=()=>{if(b.getAttribute('aria-disabled')==='true'){selectTool(b.dataset.t);return;}selectTool(b.dataset.t);m.dataset.q='';closeMenu();});
    const inp=$('mq');if(inp){inp.oninput=()=>{q=inp.value.trim();m.dataset.q=q;const pos=inp.selectionStart;draw();const n=$('mq');n.focus();try{n.setSelectionRange(pos,pos);}catch(e){}};
      inp.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter'){const f=m.querySelector('.ic');if(f)f.click();}if(e.key==='Escape'){closeMenu();}};}};
  m.classList.add('items');draw();
  m.hidden=false;$('scrim').hidden=false;
  const r=btn.getBoundingClientRect(),mw=m.offsetWidth;
  if(document.body.classList.contains('land')){const hudH=$('hud').offsetHeight;m.style.left=(r.right+8)+'px';m.style.bottom='auto';m.style.maxHeight=(H-hudH-16)+'px';const mh=Math.min(m.offsetHeight,H-hudH-16);m.style.top=clamp(r.top+r.height/2-mh/2,hudH+8,H-mh-8)+'px';return;}
  m.style.left=clamp(r.left+r.width/2-mw/2,8,W-mw-8)+'px';
  const nt=$('now')?$('now').getBoundingClientRect().top:r.top,top=$('hud')?$('hud').getBoundingClientRect().bottom:0;m.style.top='auto';m.style.bottom=(H-Math.min(r.top,nt)+8)+'px';m.style.maxHeight=Math.max(240,Math.min(r.top,nt)-top-16)+'px';
}
function cleanFloor(){SHELLS.length=0;SHELLQ.length=0;BLOOD.length=0;POOLS.length=0;DECALS.length=0;GIBS.length=0;MIST.length=0;WALLST.length=0;OBJ=OBJ.filter(o=>o.att||o.type==='mine');log('Floor cleaned','info');}
function openMapMenu(btn){
  const m=$('menu');if(!m.hidden&&m.dataset.cat==='map'){closeMenu();return;}
  m.dataset.cat='map';
  m.innerHTML='<h4>Challenge</h4><button class="mi" data-act="chal"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10zM6 12h3l1.5-3 2 6 1.5-3H18"/></svg><b>Keep him alive</b><em>Real emergencies · stabilise him with medicine only</em></button>'
    +'<h4>Scene</h4>'+Object.entries(SCENES).map(([k,d])=>`<button class="mi" role="menuitem" data-scene="${k}" aria-pressed="${(OPT.scene||'lab')===k}"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20h18M5 20V9l7-5 7 5v11M10 20v-6h4v6"/></svg><b>${d.name}</b><em>${d.desc}</em></button>`).join('');
  m.innerHTML+='<h4>Map size</h4>'+Object.entries(MAPS).filter(([k,d])=>!d.hidden).map(([k,d])=>`<button class="mi" role="menuitem" data-map="${k}" aria-pressed="${k===MAP}"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18h18M5 18V8h14v10M9 18v-5h6v5"/></svg><b>${d.name}</b><em>${d.desc}</em></button>`).join('');
  m.innerHTML+='<h4>Lab</h4><button class="mi" data-act="floor"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16M7 20l3-9h4l3 9M10 11V4h4v7"/></svg><b>Clean floor</b><em>Mop blood, gibs and debris</em></button>'
    +'<button class="mi" data-act="body"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c3 4 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10z"/></svg><b>Wash the body</b><em>Wipe blood trails off the skin</em></button>'
    +'<button class="mi" data-act="news"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6zM9 9h7M9 13h7M9 17h4"/></svg><b>Patch notes</b><em>Every update so far · '+fmtVer(GAME_VERSION)+'</em></button>'
    +`<button class="mi" data-act="hap" aria-pressed="${OPT.vib}"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8v16H8zM4 9v6M20 9v6"/></svg><b>Vibration</b><em>${OPT.vib?'On':'Off'} · buzz on shots and blasts (phones)</em></button>`;
  m.querySelectorAll('.mi').forEach(b=>b.onclick=()=>{const a=b.dataset.act;
    if(a==='chal'){openChallenge();return;}
    if(b.dataset.scene){if(CH&&CH.on){log('Finish or give up the challenge first','info');return;}setScene(b.dataset.scene);closeMenu();reset();return;}
    if(a==='floor'){cleanFloor();closeMenu();return;}
    if(a==='news'){openNews();return;}
    if(a==='body'){for(const g of segs){g.spat=[];for(const wd of g.wounds)if(wd.streaks)wd.streaks=wd.streaks.filter(k=>k.on);}log('Body washed','info');closeMenu();return;}
    if(a==='hap'){OPT.vib=!OPT.vib;saveOpt();if(OPT.vib)buzz(30);log('Vibration '+(OPT.vib?'on':'off'),'info');closeMenu();return;}
    setMap(b.dataset.map);closeMenu();});
  m.hidden=false;$('scrim').hidden=false;
  const r=btn.getBoundingClientRect(),mw=m.offsetWidth;m.style.left=clamp(r.right-mw,12,W-mw-12)+'px';m.style.top=(r.bottom+8)+'px';m.style.bottom='auto';m.style.maxHeight=Math.max(200,H-r.bottom-24)+'px';
}
const WICON={helm:'<path d="M5 13a7 7 0 0 1 14 0v6H5zM8 13h8M12 13v6"/>',gorget:'<path d="M6 9h12l-1 6H7zM8 12h8"/>',cuirass:'<path d="M6 4h12l1 8-2 8H7l-2-8zM12 4v10M7 16h10"/>',pauldrons:'<path d="M4 10a8 6 0 0 1 16 0v2H4zM6 14h12v6H6z"/>',vambraces:'<path d="M8 4h8v16H8zM8 9h8M8 14h8"/>',gauntlets:'<path d="M7 20V10l2-6 2 6 2-6 2 6 2-4v14z"/>',cuisses:'<path d="M7 3h10l-1 18H8zM7 8h10"/>',greaves:'<path d="M8 3h8v18H8zM12 3v18"/><circle cx="12" cy="6" r="2.5"/>',sabatons:'<path d="M6 6h5v8l8 3v3H6zM6 14h13"/>',under:'<path d="M4 7h16l-1.5 5.5L14 18h-4l-4.5-5.5z"/><path d="M4 9.5h16"/>',shirt:'<path d="M8.5 3 4 6l2 4 2-1v12h8V9l2 1 2-4-4.5-3c-.8 1.4-2 2-3.5 2s-2.7-.6-3.5-2z"/>',jeans:'<path d="M6 3h12l1 18h-5l-2-11-2 11H5zM6 6h12"/>',boots:'<path d="M7 3h6v9l6 3.2V20H7zM7 17h12"/>',vest:'<path d="M8 3 5 6v14h14V6l-3-3-2.5 3.5h-3zM5 12h14M12 7v13"/>',plate:'<path d="M7 4h10v4l2 2v10H5V10l2-2zM8 12h8M8 15h8M8 18h8"/>',helmet:'<path d="M4 16a8 8 0 0 1 16 0v1H4zM2.5 17h19M9 9.5h6"/>'};
function openWearMenu(btn){
  const m=$('menu');if(!m.hidden&&m.dataset.cat==='wear'){closeMenu();return;}
  m.dataset.cat='wear';
  const draw=()=>{
    m.innerHTML='<h4>Subject</h4>'+[['m','Man','Subject 01 · 70 kg'],['f','Woman','Subject 02 · 60 kg']].map(([k,n,d])=>`<button class="mi" role="menuitemradio" data-sx="${k}" aria-checked="${OPT.sex===k}" aria-pressed="${OPT.sex===k}"><svg class="i" viewBox="0 0 24 24" aria-hidden="true">${k==='m'?'<circle cx="12" cy="6" r="3"/><path d="M7 21v-8l-1-3h12l-1 3v8"/>':'<circle cx="12" cy="6" r="3"/><path d="M8 21l1-6-2-5h10l-2 5 1 6"/>'}</svg><b>${n}</b><em>${d}</em></button>`).join('')+'<h4>Wear</h4>'+Object.entries(WEARDEF).map(([k,d])=>{const A=WEAR[k];const cond=A.hp!=null&&A.on?` · condition ${A.hp<=0?'destroyed':Math.round(A.hp)+'%'}`:'';return `<button class="mi" role="menuitemcheckbox" data-w="${k}" aria-checked="${A.on}" aria-pressed="${A.on}"><svg class="i" viewBox="0 0 24 24" aria-hidden="true">${WICON[k]}</svg><b>${d.name}</b><em>${d.desc}${cond}</em></button>`;}).join('')
      +`<button class="mi" data-w="_kit"><svg class="i" viewBox="0 0 24 24" aria-hidden="true">${WICON.plate}</svg><b>Full kit</b><em>Modern clothes and body armour</em></button><button class="mi" data-w="_steel"><svg class="i" viewBox="0 0 24 24" aria-hidden="true">${WICON.cuirass}</svg><b>Full plate armour</b><em>Every steel piece, head to toe</em></button><button class="mi" data-w="_off"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg><b>Strip</b><em>Take everything off</em></button>`;
    m.querySelectorAll('.mi').forEach(b=>b.onclick=()=>{const k=b.dataset.w;
      if(b.dataset.sx){const x=b.dataset.sx;if(x!==OPT.sex){OPT.sex=x;saveOpt();closeMenu();reset();log((FEMALE?'Subject 02 · woman':'Subject 01 · man')+' standing','info');}else draw();return;}
      if(k==='_kit'){for(const q in WEAR){if(q==='under'||STEELK.includes(q))continue;WEAR[q].on=true;if(WEAR[q].hp!=null)WEAR[q].hp=100;}for(const q of STEELK)WEAR[q].on=false;log('Dressed · full protective kit','info');}
      else if(k==='_steel'){for(const q of STEELK){WEAR[q].on=true;WEAR[q].hp=100;}for(const q of ['helmet','vest','plate','boots'])WEAR[q].on=false;log('Dressed · full steel plate armour','info');}
      else if(k==='_off'){for(const q in WEAR)WEAR[q].on=false;log('Clothing removed','info');}
      else{const A=WEAR[k];A.on=!A.on;if(A.on&&A.hp!=null&&A.hp<=0)A.hp=100;if(A.on){const EX={helm:['helmet'],helmet:['helm'],cuirass:['vest','plate'],vest:['cuirass'],plate:['cuirass'],sabatons:['boots'],boots:['sabatons']}[k]||[];for(const q of EX)WEAR[q].on=false;}if(k==='plate'&&A.on&&WEAR.vest.on){WEAR.vest.on=false;}if(k==='vest'&&A.on&&WEAR.plate.on){WEAR.plate.on=false;}log((A.on?'Put on · ':'Took off · ')+WEARDEF[k].name,'info');}
      if(WEAR.plate.on&&WEAR.vest.on)WEAR.vest.on=false;
      draw();});
  };
  draw();m.hidden=false;$('scrim').hidden=false;
  const r=btn.getBoundingClientRect(),mw=m.offsetWidth,tb=document.body.classList.contains('land')?H:$('tools').getBoundingClientRect().top;m.style.left=clamp(r.right-mw,12,W-mw-12)+'px';m.style.bottom='auto';
  const mh=m.offsetHeight;let top=r.bottom+8;if(top+mh>tb-8)top=Math.max(8,tb-8-mh);m.style.top=top+'px';m.style.maxHeight=(tb-16)+'px';m.style.overflowY='auto';
}
function setMap(id){
  MAP=id;layout();
  const xs=P.map(p=>p.x),mn=Math.min(...xs),mx=Math.max(...xs);
  if(mn<-ROOM+6||mx>ROOM-6){const d=-(mn+mx)/2;for(const p of P){p.x+=d;p.px+=d;}V.anchorX=null;}
  for(const p of P){if(p.y<TOP+p.r){p.y=p.py=TOP+p.r;}}
  OBJ=OBJ.filter(o=>Math.abs(o.x)<ROOM);GIBS=GIBS.filter(g=>Math.abs(g.x)<=ROOM);DECALS=DECALS.filter(d=>Math.abs(d.x)<ROOM);POOLS=POOLS.filter(d=>Math.abs(d.x)<ROOM);WALLST=WALLST.filter(d=>Math.abs(d.x)<=ROOM);
  CAM.side.z=fitZ();CAM.side.px=0;CAM.side.py=0;
  log('Map · '+MAPS[id].name+(MAPS[id].w?' ('+MAPS[id].w/100+' m)':''),'info');
}
function closeMenu(){$('menu').classList.remove('items');$('menu').dataset.hover='';$('opts').hidden=true;$('bOpt').setAttribute('aria-pressed','false');$('menu').style.maxHeight='';$('menu').style.overflowY='';$('menu').hidden=true;$('scrim').hidden=true;}
const RECENT=[];
function selectTool(id){if(CH&&CH.on&&!CH.done&&!chAllowed(id)){log('Challenge · only medicine (and your hands) · '+(TOOL[id]?TOOL[id].name:id)+' is not allowed','info');return;}if(EXAM&&xray&&id!==tool)setExam(false);tool=id;lastIn[TOPOF(TOOL[id].cat)]=id;{const i=RECENT.indexOf(id);if(i>=0)RECENT.splice(i,1);RECENT.unshift(id);if(RECENT.length>6)RECENT.length=6;}refreshTools();}

// "250", "2.5 L", "750ml", "30 g", "1,5 kg" → mL (liquids) or g (metals, powders)
function parseAmt(t,g){t=String(t).trim().toLowerCase().replace(',','.');const m=t.match(/^([0-9]*\.?[0-9]+)\s*(ml|l|g|kg|mg)?$/);if(!m)return 0;let v=parseFloat(m[1]);const u=m[2]||'';
  if(u==='l'||u==='kg')v*=1000;else if(u==='mg')v/=1000;return v>0&&isFinite(v)?+v.toFixed(3):0;}
