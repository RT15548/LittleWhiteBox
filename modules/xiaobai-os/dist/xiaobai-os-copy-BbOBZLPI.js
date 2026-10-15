/* eslint-disable */
var T = [
  "blade",
  "bow",
  "staff",
  "daggers",
  "grimoire",
  "cannon"
], R = [
  "haste",
  "scarcity",
  "legion"
], x = [
  "warden",
  "thornheart",
  "weaver",
  "astrologer",
  "king",
  "phoenix",
  "forgemaster",
  "colossus",
  "frostqueen",
  "leviathan",
  "archivist",
  "voidknight",
  "keeper",
  "bridgekeeper",
  "heatkeeper"
], A = [
  "storm-step",
  "conductor",
  "momentum",
  "cinder",
  "wildfire",
  "blood-price",
  "frost",
  "shatter",
  "echo",
  "hunter",
  "piercing",
  "orbit",
  "thorns",
  "aegis",
  "siphon",
  "focus",
  "renewal",
  "execution",
  "last-stand",
  "quicksilver",
  "magnet",
  "wardstone",
  "pilgrim",
  "gambit",
  "riposte",
  "shield-break",
  "cleave-wave",
  "duelist",
  "blood-dance",
  "valor",
  "ricochet",
  "split-arrow",
  "pinning",
  "distance-draw",
  "hunter-mark",
  "trapper",
  "nova",
  "inferno",
  "fracture",
  "overload",
  "orbitals",
  "convergence",
  "backstab",
  "shadowstep",
  "hemorrhage",
  "execution-chain",
  "smoke",
  "venom",
  "pack-bond",
  "martyr",
  "covenant",
  "frenzy",
  "soul-harvest",
  "command",
  "shrapnel",
  "minefield",
  "overclock",
  "bunker",
  "salvage",
  "railgun"
], J = [
  "traveler",
  "guardian",
  "moonweaver",
  "sovereign",
  "ranger",
  "paladin",
  "witch",
  "assassin",
  "machinist",
  "beastcaller",
  "frostbound",
  "stargazer"
], I = Object.freeze({
  rootRingGap: Math.PI / 2,
  mobHp: 1.8,
  enemyLimit: 6,
  bossEnemyLimit: 5,
  simultaneousWindups: 2,
  signalTicks: 180,
  reinforcementWarning: 36,
  recoveryTicks: 48,
  keeperHp: 3e3,
  wardenHp: 5e3,
  heartHp: 4600,
  bossControlRecovery: 75
}), Z = (e) => e < 3, w = Object.freeze({
  bridgeHp: 3800,
  keeperHp: 6200,
  ventWait: 42,
  ventDamage: 23,
  pullDistance: 4
}), Q = { pipe_gallery: [{
  x: -17,
  y: -3,
  angle: 0,
  length: 34,
  width: 1,
  offset: 75,
  period: 180
}] }, X = {
  pipe_gallery: {
    scene: "pipe_gallery",
    complete: "gallery_cleared",
    reward: null,
    trigger: "encounter",
    triggerRadius: 52,
    boss: null,
    bounds: {
      left: -22,
      right: 22,
      top: -25,
      bottom: 22
    },
    summons: [],
    waves: [[
      {
        kind: "guard",
        anchor: "guard"
      },
      {
        kind: "archer",
        anchor: "archer"
      },
      {
        kind: "soldier",
        anchor: "flank"
      }
    ], [
      {
        kind: "charger",
        anchor: "guard"
      },
      {
        kind: "bomber",
        anchor: "bomber"
      },
      {
        kind: "stalker",
        anchor: "flank"
      }
    ]]
  },
  sluice_bridge: {
    scene: "sluice_bridge",
    complete: "bridge_cleared",
    reward: "bridge",
    trigger: "encounter",
    triggerRadius: 52,
    boss: "bridgekeeper",
    bounds: {
      left: -28,
      right: 28,
      top: -24,
      bottom: 24
    },
    summons: ["left", "right"],
    waves: [[{
      kind: "bridgekeeper",
      anchor: "guard"
    }]]
  },
  main_valve: {
    scene: "main_valve",
    complete: "heatkeeper_defeated",
    reward: "heatkeeper",
    trigger: "encounter",
    triggerRadius: 56,
    boss: "heatkeeper",
    bounds: {
      left: -32,
      right: 32,
      top: -27,
      bottom: 26
    },
    summons: ["left", "right"],
    waves: [[{
      kind: "heatkeeper",
      anchor: "keeper"
    }]]
  },
  coal_store: {
    scene: "coal_store",
    complete: "coal_store_cleared",
    reward: "coal_store",
    trigger: "encounter",
    triggerRadius: 50,
    boss: null,
    bounds: {
      left: -28,
      right: 28,
      top: -25,
      bottom: 24
    },
    summons: [],
    waves: [[
      {
        kind: "guard",
        anchor: "guard"
      },
      {
        kind: "archer",
        anchor: "archer"
      },
      {
        kind: "bomber",
        anchor: "bomber"
      }
    ], [
      {
        kind: "guard",
        anchor: "guard"
      },
      {
        kind: "priest",
        anchor: "archer"
      },
      {
        kind: "charger",
        anchor: "flank"
      },
      {
        kind: "bomber",
        anchor: "bomber"
      }
    ]]
  }
}, l = Object.freeze({
  hz: 30,
  arena: 11,
  playerRadius: 0.34,
  speed: 0.115,
  maxHp: 100,
  dashTicks: 8,
  dashCooldown: 42,
  relicSlots: 6,
  relicPoolSize: 30,
  zoneSteps: 5,
  zones: 3,
  maxInputTicks: 900,
  checkpointTicks: 240,
  shopCost: 60,
  supplyCost: 35,
  supplyHeal: 25,
  maxRelicRank: 3,
  maxEnemies: 22,
  battleShards: 28,
  eliteShards: 52,
  bossShards: 80,
  restHeal: 35,
  sacrificeHp: 20,
  firstBossAward: 80,
  firstVictoryAward: 200,
  masteryAward: 120,
  oathAward: 100,
  recordLimit: 20
}), ee = Object.freeze({
  resonanceTicks: 90,
  maxPower: 100,
  familiarHp: 38,
  damage: 10,
  empoweredDamage: 17,
  attackTicks: 32,
  empoweredAttackTicks: 20
}), ae = {
  blade: {
    damage: 24,
    period: 20,
    range: 2.45,
    skill: 48,
    skillCooldown: 105,
    moveFire: 1,
    unlock: 0,
    guard: 0.8
  },
  bow: {
    damage: 15,
    period: 25,
    range: 8.2,
    skill: 24,
    skillCooldown: 165,
    moveFire: 0.65,
    unlock: 0,
    guard: 1
  },
  staff: {
    damage: 21,
    period: 38,
    range: 6.8,
    skill: 30,
    skillCooldown: 180,
    moveFire: 0.5,
    unlock: 0,
    guard: 1
  },
  daggers: {
    damage: 13,
    period: 11,
    range: 1.7,
    skill: 65,
    skillCooldown: 120,
    moveFire: 1,
    unlock: 1,
    guard: 0.85
  },
  grimoire: {
    damage: 10,
    period: 36,
    range: 5.5,
    skill: 22,
    skillCooldown: 150,
    moveFire: 0.85,
    unlock: 2,
    guard: 1
  },
  cannon: {
    damage: 35,
    period: 52,
    range: 7.5,
    skill: 18,
    skillCooldown: 210,
    moveFire: 0.42,
    unlock: 3,
    guard: 0.9
  }
}, re = A, ne = R, te = T, p = Object.freeze({
  bloodDamage: 1.3,
  bloodHurt: 1.25,
  hunterRange: 5,
  hunterDamage: 1.3,
  executeThreshold: 0.3,
  executeDamage: 1.35,
  echoEvery: 4,
  extraPierce: 1,
  orbitTicks: 75,
  siphonEvery: 6,
  siphonHeal: 3,
  siphonBossHeal: 6,
  focusSkill: 0.82,
  focusAttack: 1.12,
  renewalHeal: 6,
  renewalZoneHeal: 8
}), s = (e, a, n, t, o, h, u) => ({
  hp: e,
  speed: a,
  radius: n,
  damage: t,
  reach: o,
  windup: h,
  cooldown: u
}), P = {
  soldier: s(48, 0.083, 0.4, 11, 1.45, 19, 35),
  archer: s(36, 0.058, 0.36, 10, 11, 26, 55),
  guard: s(95, 0.057, 0.58, 18, 2, 32, 65),
  priest: s(58, 0.035, 0.42, 8, 12, 35, 110),
  charger: s(65, 0.076, 0.48, 16, 12, 32, 80),
  stalker: s(46, 0.12, 0.35, 10, 1.25, 16, 44),
  bomber: s(55, 0.047, 0.42, 15, 13, 28, 82),
  wisp: s(30, 0.062, 0.3, 8, 10, 22, 60)
}, E = {
  bridgekeeper: {
    ...s(w.bridgeHp, 0.07, 0.9, 22, 15, 32, 75),
    region: 1,
    awardKey: "city-bridge"
  },
  heatkeeper: {
    ...s(w.keeperHp, 0.065, 1, 25, 20, 34, 80),
    region: 1,
    awardKey: "city-heatkeeper"
  },
  keeper: {
    ...s(I.keeperHp, 0.062, 0.85, 20, 12, 30, 65),
    region: 0,
    awardKey: "keeper"
  },
  warden: {
    ...s(1050, 0.055, 1.25, 21, 20, 34, 32),
    region: 0,
    awardKey: "boss-0"
  },
  thornheart: {
    ...s(1e3, 0.043, 1.3, 18, 20, 30, 35),
    region: 0,
    awardKey: "boss-thornheart"
  },
  weaver: {
    ...s(1450, 0.07, 1.1, 19, 20, 30, 31),
    region: 1,
    awardKey: "boss-1"
  },
  astrologer: {
    ...s(1400, 0.035, 1.1, 22, 20, 36, 32),
    region: 1,
    awardKey: "boss-astrologer"
  },
  king: {
    ...s(2050, 0.09, 1.4, 25, 20, 25, 23),
    region: 2,
    awardKey: "boss-2"
  },
  phoenix: {
    ...s(1750, 0.075, 1.2, 22, 20, 30, 28),
    region: 2,
    awardKey: "boss-phoenix"
  },
  forgemaster: {
    ...s(1100, 0.048, 1.25, 23, 20, 38, 35),
    region: 3,
    awardKey: "boss-forgemaster"
  },
  colossus: {
    ...s(1250, 0.036, 1.5, 25, 20, 42, 38),
    region: 3,
    awardKey: "boss-colossus"
  },
  frostqueen: {
    ...s(1450, 0.062, 1.05, 19, 20, 32, 28),
    region: 4,
    awardKey: "boss-frostqueen"
  },
  leviathan: {
    ...s(1550, 0.072, 1.4, 23, 20, 34, 32),
    region: 4,
    awardKey: "boss-leviathan"
  },
  archivist: {
    ...s(1900, 0.04, 1.15, 21, 20, 34, 25),
    region: 5,
    awardKey: "boss-archivist"
  },
  voidknight: {
    ...s(1850, 0.1, 1.05, 24, 20, 26, 25),
    region: 5,
    awardKey: "boss-voidknight"
  }
}, ie = {
  ...P,
  ...E
}, se = x;
function oe(e) {
  return Object.hasOwn(E, e);
}
var le = [
  {
    bosses: ["warden", "thornheart"],
    encounters: [
      "skirmish",
      "pursuit",
      "ritual"
    ],
    mobs: [
      "soldier",
      "archer",
      "guard",
      "stalker"
    ]
  },
  {
    bosses: ["weaver", "astrologer"],
    encounters: [
      "ritual",
      "crossfire",
      "survival"
    ],
    mobs: [
      "archer",
      "priest",
      "wisp",
      "stalker"
    ]
  },
  {
    bosses: ["king", "phoenix"],
    encounters: [
      "siege",
      "pursuit",
      "crossfire"
    ],
    mobs: [
      "guard",
      "charger",
      "archer",
      "priest"
    ]
  },
  {
    bosses: ["forgemaster", "colossus"],
    encounters: [
      "siege",
      "survival",
      "crossfire"
    ],
    mobs: [
      "guard",
      "bomber",
      "soldier",
      "charger"
    ]
  },
  {
    bosses: ["frostqueen", "leviathan"],
    encounters: [
      "pursuit",
      "survival",
      "skirmish"
    ],
    mobs: [
      "charger",
      "stalker",
      "wisp",
      "archer"
    ]
  },
  {
    bosses: ["archivist", "voidknight"],
    encounters: [
      "ritual",
      "siege",
      "crossfire"
    ],
    mobs: [
      "priest",
      "stalker",
      "bomber",
      "wisp"
    ]
  }
], g = {
  sanniang: "三娘",
  anian: "阿念",
  kouzi: "扣子",
  laobai: "老白"
}, z = Object.keys(g), de = {
  sanniang: "changyounian_intel",
  laobai: "bajin_intel",
  anian: null,
  kouzi: null
}, O = (e, a, n, t, o, h, u = {}) => ({
  id: e,
  kind: a,
  footprint: {
    x: n,
    z: t,
    width: o,
    depth: h
  },
  ...u
}), i = (e, a, n, t, o, h, u, b = {}) => ({
  ...O(e, n, t, o, h, u, b),
  label: a
}), j = {
  wen_house: {
    name: "文宅 · 前厅",
    household: ["wen_household"],
    width: 32,
    depth: 28,
    use: "三娘生活过十九年的家。饭桌留着夫妻的旧座位，客席另添；柜边有以家庭名义领回的药盒。",
    enclosure: "南门通南街；院内有家人做活，前厅不是无人经过的卧室。",
    doors: [{
      side: "south",
      to: "south_street",
      arrival: "wen_house"
    }],
    anchors: {
      table: {
        x: -3,
        y: -1
      },
      host: {
        x: 3,
        y: -4
      }
    },
    objects: [{
      id: "wen_table",
      anchor: "table",
      kind: "inspect",
      passage: "wen_table",
      condition: { all: ["wen_visit_agreed"] }
    }],
    furniture: [
      i("table", "按旧习惯摆好夫妻碗筷的饭桌", "table", -7, -4, 4, 6),
      i("wife-chair", "三娘从前坐的椅子", "chair", -11, -4, 2, 2),
      i("host-chair", "文守桐的椅子", "chair", -3, -4, 2, 2),
      i("chair", "留给客人的椅子", "chair", -7, 1, 2, 2),
      i("screen", "通往内院的雕木屏风", "screen", 0, -10.5, 12, 1),
      i("cabinet", "收着药盒的漆柜", "cabinet", 12, -8, 4, 4, { tint: "rose" }),
      i("tea", "茶炉与水壶", "stove", 11, 5, 2, 2),
      i("bench", "靠墙的长椅", "bench", -12, 6, 2, 6)
    ]
  },
  transfer_office: {
    name: "工场 · 交接房",
    household: ["clerks"],
    width: 26,
    depth: 24,
    use: "工场工牌、食宿记账和遣返登记的交接处，书吏在柜台后当值。",
    enclosure: "临工坊街的门常有人进出，隔墙能听到工场声。",
    doors: [{
      side: "south",
      to: "workshop_street",
      arrival: "transfer_office"
    }],
    anchors: {
      register: {
        x: 0,
        y: -3
      },
      clerk: {
        x: 6,
        y: -3
      }
    },
    objects: [{
      id: "transfer_record",
      anchor: "register",
      kind: "inspect",
      passage: "transfer_record",
      condition: { all: ["worker_found"] }
    }],
    furniture: [
      i("desk", "登记柜台与底簿", "ledger", 0, -7, 12, 2),
      i("shelf", "按年月扎好的工牌存档", "cabinet", 9, -8, 4, 4),
      i("bench", "等候核对的长凳", "bench", -8, 3, 2, 6),
      i("stove", "盖住炉口的小炭炉", "stove", 9, 7, 2, 2)
    ]
  },
  audit_office: {
    name: "南门 · 查验房",
    household: ["clerks"],
    width: 26,
    depth: 24,
    use: "借签过门和门簿争议的查验处，桌上摊着门楼送来的簿册。",
    enclosure: "南门通街面，候查的人隔着一张长桌等候。",
    doors: [{
      side: "south",
      to: "south_street",
      arrival: "audit_office"
    }],
    anchors: {
      register: {
        x: -2,
        y: -3
      },
      clerk: {
        x: 6,
        y: -3
      }
    },
    objects: [{
      id: "gate_cases",
      anchor: "register",
      kind: "inspect",
      passage: "gate_cases",
      condition: { all: ["gate_book_agreed"] }
    }],
    furniture: [
      i("ledger", "门簿与具名清单", "ledger", -2, -7, 10, 2),
      i("rack", "挂着借签牌的柜子", "cabinet", 9, -7, 4, 4),
      i("bench", "候查长凳", "bench", -8, 3, 2, 6)
    ]
  },
  workers_lodging: {
    name: "寄工住处",
    household: ["workers"],
    width: 28,
    depth: 26,
    use: "临时工住的通铺，陈禾仍住在这里。床位、吃饭和欠账都由工场记。",
    enclosure: "一间房住着几个人，门外通工坊街，床位之间挂布帘。",
    doors: [{
      side: "south",
      to: "workshop_street",
      arrival: "workers_lodging"
    }],
    anchors: {
      bunk: {
        x: -4,
        y: -4
      },
      worker: {
        x: -3,
        y: 0
      },
      mender: {
        x: -4,
        y: 6
      }
    },
    objects: [
      {
        id: "worker_bunk",
        anchor: "bunk",
        kind: "inspect",
        passage: "worker_bunk",
        condition: {
          all: ["missing_name_agreed"],
          none: ["worker_record_corrected"]
        }
      },
      {
        id: "worker_result",
        anchor: "bunk",
        kind: "inspect",
        passage: "worker_result",
        condition: { all: ["worker_record_corrected"] }
      },
      {
        id: "gate_refused",
        anchor: "mender",
        kind: "inspect",
        passage: "gate_refused",
        condition: { all: ["gate_cases_heard"] }
      }
    ],
    furniture: [
      i("west-bed", "陈禾的铺位与工牌", "bed", -8, -4, 4, 6),
      i("east-bed", "隔着布帘的铺位", "bunk", 8, -4, 4, 6),
      i("table", "放针线和饭碗的共用桌", "table", 0, -8, 4, 2),
      i("wash", "共用水盆", "basin", 9, 7, 2, 2),
      i("chest", "铺边的衣物箱", "cabinet", -9, 4, 4, 2)
    ]
  },
  south_inn: {
    name: "南街客舍 · 客房",
    household: ["player"],
    width: 20,
    depth: 20,
    rest: !0,
    use: "旅人在内堡的临时落脚处，行囊与换洗衣物可以放在床边。",
    enclosure: "客房门通南街的客舍檐廊，经过后掩上。厚布窗帘遮住窗，隔壁仍有别的住客。",
    doors: [{
      side: "south",
      to: "south_street",
      arrival: "south_inn"
    }],
    furniture: [
      i("bed", "铺着干净被褥的客床", "bed", -5, -4, 4, 6, { tint: "sage" }),
      i("wardrobe", "客用衣物柜", "wardrobe", 6, -7, 4, 2),
      i("table", "灯与茶杯所在的小桌", "table", 5, 0, 4, 2),
      i("chair", "木椅", "chair", 5, 3, 2, 2),
      i("wash", "盆架与清水", "basin", -7, 5, 2, 2)
    ]
  }
}, r = (e, a, n, t, o, h, u, b = {}) => ({
  ...O(e, n, t, o, h, u, b),
  label: a
}), _ = {
  ...j,
  clinic_front: {
    name: "诊棚 · 接诊间",
    household: ["sanniang"],
    use: "三娘接诊、换药与整理药材的前间，病人会来候诊。",
    enclosure: "临街木门经过后掩上；北侧木门通向三娘的起居后间。候诊处与诊床间有屏风。",
    width: 24,
    depth: 22,
    doors: [{
      side: "south",
      to: "camp",
      arrival: "clinic_front"
    }, {
      side: "north",
      to: "sanniang_room",
      arrival: "south"
    }],
    furniture: [
      r("examination", "铺白布的诊床", "bed", -5.5, -3.5, 3, 5, { tint: "sage" }),
      r("screen", "遮住诊床的屏风", "screen", -2.5, -3, 1, 6),
      r("apothecary", "分格药柜", "cabinet", 7, -7, 6, 2, { tint: "sage" }),
      r("medicine", "药碗与药材工作台", "medicine", 7, -2, 6, 2),
      r("wash", "洗手盆与清水罐", "basin", -8, -8, 2, 2),
      r("waiting", "候诊长凳", "bench", -7, 6, 6, 2)
    ]
  },
  sanniang_room: {
    name: "三娘的起居后间",
    household: ["sanniang"],
    use: "三娘在诊棚后的日常住处，与接诊间分开。",
    enclosure: "木门通接诊间，经过后掩上；窗帘遮住临巷的窗，门外的说话声仍可能传进来。",
    width: 18,
    depth: 18,
    doors: [{
      side: "south",
      to: "clinic_front",
      arrival: "north"
    }],
    furniture: [
      r("bed", "床与叠好的薄被", "bed", -4.5, -4, 3, 4, { tint: "rose" }),
      r("wardrobe", "衣柜与换洗衣物", "wardrobe", 5, -7, 6, 2, { tint: "rose" }),
      r("tea", "放着茶具和书的矮桌", "table", 4, 1, 4, 2),
      r("chair", "桌边的木椅", "chair", 4, 4, 2, 2),
      r("wash", "梳洗盆与毛巾", "basin", -7, 4, 2, 2)
    ]
  },
  inn: {
    name: "小客店 · 前厅",
    household: ["innkeeper"],
    use: "檐下供过路人投宿的小客店，共用前厅。",
    enclosure: "临街木门与客房门相隔一个前厅，店家在柜台边照看生意。",
    width: 24,
    depth: 22,
    doors: [{
      side: "south",
      to: "camp",
      arrival: "inn"
    }, {
      side: "north",
      to: "guest_room",
      arrival: "south"
    }],
    furniture: [
      r("counter", "店家的柜台与登记簿", "ledger", 7, -5, 6, 2),
      r("shelf", "碗盏与备用被褥柜", "cabinet", 7, -9, 6, 2),
      r("table", "共用饭桌", "table", -5, 0, 4, 4),
      r("seats", "饭桌旁的长凳", "bench", -5, 4, 4, 2),
      r("stove", "温着水的小炉", "stove", -8, -7, 2, 2)
    ]
  },
  guest_room: {
    rest: !0,
    name: "小客店 · 旅人客房",
    household: ["player"],
    use: "旅人在檐下投宿的一间客房，暂住，不是自有房产。",
    enclosure: "独立木门通前厅，经过后掩上；有窗帘，木隔墙不完全隔音。",
    width: 18,
    depth: 18,
    doors: [{
      side: "south",
      to: "inn",
      arrival: "north"
    }],
    furniture: [
      r("bed", "客床与干净被褥", "bed", -4.5, -3, 3, 4, { tint: "sage" }),
      r("chest", "放行囊的矮柜", "cabinet", 5, -6, 4, 2, { height: 1.2 }),
      r("table", "带烛台的小桌", "table", 5, 0, 4, 2),
      r("chair", "木椅", "chair", 5, 3, 2, 2),
      r("wash", "水盆与毛巾", "basin", -7, 4, 2, 2)
    ]
  },
  laobai_home: {
    name: "老白的小屋",
    household: ["laobai"],
    use: "外门附近，老白离开父母家后独住的小屋；门楼是工作点。",
    enclosure: "独立木门临街，经过后掩上；窄窗挂着旧布帘，能听见外门的动静。",
    width: 18,
    depth: 18,
    doors: [{
      side: "south",
      to: "camp",
      arrival: "laobai_home"
    }],
    furniture: [
      r("bed", "靠墙的单人床", "bed", -4.5, -4, 3, 4, { tint: "sage" }),
      r("kit", "衣物柜与守门用具", "wardrobe", 6, -7, 4, 2),
      r("table", "饭碗与水壶所在的桌子", "table", 5, -1, 4, 2),
      r("chair", "旧木椅", "chair", 5, 2, 2, 2),
      r("stove", "墙角的小炉", "stove", -7, 5, 2, 2)
    ]
  },
  kouzi_home: {
    name: "扣子的管边小窝",
    household: ["kouzi"],
    use: "扣子在管线旁自搭的住处，修缮工具和睡铺挤在同一间。",
    enclosure: "木板门经过后掩上，板壁接缝透进管架的光；热管的震声穿过墙板。",
    width: 18,
    depth: 18,
    doors: [{
      side: "south",
      to: "camp",
      arrival: "kouzi_home"
    }, {
      side: "north",
      to: "deep_waterway",
      arrival: "kouzi_home",
      condition: { all: ["deep_route_agreed"] }
    }],
    furniture: [
      r("bed", "挤在工具旁的睡铺", "bed", -4.5, -3, 3, 4, { tint: "amber" }),
      r("bench", "钳子、扳手与零件工作台", "workbench", 5, -4, 6, 2),
      r("rack", "铜管短料与工具架", "toolrack", 5, -7, 6, 2),
      r("chair", "修理凳", "chair", 5, -1, 2, 2),
      r("wash", "搪洗盆", "basin", -7, 5, 2, 2)
    ]
  },
  anian_home: {
    name: "阿念家 · 起居间",
    household: ["anian", "anian_parents"],
    use: "阿念与父母同住的家，共用起居间供一家吃饭、做活。父母睡处在屏风后。",
    enclosure: "临街木门经过后掩上；北侧木门通阿念的睡处。父母在家做活，起居间不是空屋。",
    width: 26,
    depth: 24,
    doors: [{
      side: "south",
      to: "camp",
      arrival: "anian_home"
    }, {
      side: "north",
      to: "anian_room",
      arrival: "south"
    }],
    furniture: [
      r("table", "一家人吃饭的桌子", "table", -5, 3, 4, 4),
      r("bench", "桌边长凳", "bench", -5, 7, 4, 2),
      r("work", "父亲修铜管的工作台", "workbench", 8, -6, 6, 2),
      r("sewing", "母亲的衣料柜", "wardrobe", 8, 0, 6, 2, { tint: "rose" }),
      r("parents_bed", "父母的床铺", "bed", -7, -6, 4, 4),
      r("screen", "遮住父母睡处的屏风", "screen", -7, -1.5, 6, 1)
    ]
  },
  anian_room: {
    name: "阿念的睡处",
    household: ["anian"],
    use: "阿念在父母家中的小房间。",
    enclosure: "木门与起居间相隔，经过后掩上；有窗帘，隔壁父母做活与说话的声音可闻。",
    width: 18,
    depth: 18,
    doors: [{
      side: "south",
      to: "anian_home",
      arrival: "north"
    }],
    furniture: [
      r("bed", "小床与洗净的被单", "bed", -4.5, -3, 3, 4, { tint: "rose" }),
      r("clothes", "衣物柜", "wardrobe", 5, -6, 6, 2, { tint: "rose" }),
      r("desk", "临窗小桌", "table", 5, 0, 4, 2),
      r("chair", "木椅", "chair", 5, 3, 2, 2),
      r("wash", "洗脸盆", "basin", -7, 5, 2, 2)
    ]
  }
}, ce = [
  {
    to: "clinic_front",
    building: "clinic",
    position: {
      x: -19,
      y: 12
    }
  },
  {
    to: "inn",
    building: "arrival-home",
    position: {
      x: -27,
      y: 32.5
    }
  },
  {
    to: "laobai_home",
    building: "roadside-workshop",
    position: {
      x: -17,
      y: -32.5
    }
  },
  {
    to: "kouzi_home",
    building: "eastern-workshop",
    position: {
      x: 28,
      y: 34.5
    }
  },
  {
    to: "anian_home",
    building: "eastern-home",
    position: {
      x: 15,
      y: 23.5
    }
  }
];
function N(e) {
  return Object.hasOwn(_, e) ? _[e] : void 0;
}
function D(e) {
  const a = N(e);
  return a ? D(a.doors[0].to) : e;
}
var k = {
  talk: (e) => `和${e}说话`,
  leave: "回到现场",
  bridgeUntried: "闸桥守卫横过牵引链：「封支令没撤，检修班也不准过！」",
  bridgeTested: "表针已经稳住，桥上的牵引链却仍绷着。守卫拒绝让路。",
  valveUntried: "执闸长挡在阀轮前：「外头那支，今天必须封死。」",
  valveTested: "执闸长压住阀轮：「管子通得了，也轮不到他们。」",
  trialAfterBridgeSetup: `试流阀就在脚边，表针贴着零刻度。桥上的牵引链已经放下，水声从空桥底下传来。

程铁生交给你的阀柄正好能卡进去。先试一小股回水，便能知道旧管是否承得住。`,
  trialAfterBridge: `阀柄转过最涩的半圈，脚下传来一阵低沉的水声。细针冲高，回落，终于停稳。管壁的接缝没有渗水。

桥上的牵引链已经放下，通往主闸的路也已打通。脚下这一股热水，证实了程铁生图上画的路。`,
  awaitWitness: (e) => `这件事要与${e}一道看。人还没到，可以先去接上，再回来。`,
  reviewed: "当时的记录",
  now: "眼下",
  heatSituation: "南坊贴着封闭檐下旧支路的告示，分暖站正在试封；在册街面的热水仍照常供应。",
  restoredNotice: "告示上的“封闭旧支路”被划去了，旁边添上检修日期与回流压力。铺里仍照常烧水，领水的签没有因此换过。",
  restoredPlan: "回流管已接通，图上的两处接头盖了检修记。工人按这张图继续维护，檐下的热水由此经过。",
  restoredDeep: "测量线还在，封堵用的木楔已经搬走。新回流在这段管壁里低低作响；旧交易留下的收条仍在那里。",
  campHeatTitle: "炉边的热水",
  campHeat: `还没走到炉边，就先听见水开了。

有人掀盖，有人笑骂别抢，搪瓷壶挨着挤成一排。洗缝的把冻红的手伸到白气里，舍不得立刻缩回去。诊棚门口，一盆新换的热水正被端进去。

一只空凳被挪到火旁，给回来的你留着。先坐下吧，水还烫。`,
  workerCorrected: "陈禾的身份签已恢复，由错误登记追加的扣薪与追债已撤销；他仍住在寄工住处，接下来的去留由他自己安排。"
}, H = {
  heat_notice: {
    title: "铁闸响了一声",
    fact: "heat_notice_read",
    body: `告示才贴上，分暖站里便响起试封的铜铃。沿墙伸向檐下的支管震了一下，压力表的针慢慢落到底。热水铺的水龙头却还在冒白气。

有人追问门外怎么办。披着护肩的执闸长停在告示旁，手套上沾着阀油。

「先保册上的。这口炉，不能人人都伸手。」

铃停了。他转身回站里，封支的铁楔还堆在门边。`
  },
  pipe_receipt: {
    title: "管件冲号",
    fact: "pipes_traced",
    body: `工场墙边排着十二副冷却管件，封蜡完整，冲号与哨站出库签相同。

收料簿写着：“余存十二副，完好。调南坊分暖站封支工程。”

管口没有冻裂。报给檐下的损耗，成了这里的实收。`
  },
  return_plan: {
    title: "图上被抹掉的路",
    fact: "return_plan_found",
    body: `新闸的一道直线，把檐下涂成了灰色。程铁生没看那片灰，手指沿旧管线绕过去，停在闸后。

「这截回水还热。换掉坏接头，就能接出去。不用抢街上正在烧的那口水。」

哨站报损的完好件，恰好够用。他将一只试流阀柄放到图上，手却没有立刻松开。

「封支是执闸长下的令，检修班不准过桥。我带人在这头接，你走通管廊，先试旧阀。表针稳得住，才知道这条路值不值得争。」`
  },
  return_trial: {
    title: "旧管里的水声",
    fact: "return_flow_tested",
    operation: {
      setup: `试流阀就在脚边，表针贴着零刻度。闸桥上有人巡守，隔着水声，看不清这里。

程铁生交给你的阀柄正好能卡进去。先试一小股回水，便能知道旧管是否承得住。`,
      label: "扳开试流阀"
    },
    body: `阀柄转过最涩的半圈，脚下传来一阵低沉的水声。细针冲高，回落，终于停稳。管壁的接缝没有渗水。

桥上传来铁靴声。执闸长看了表，又看向伸出城墙的旧管。

「能流，不等于该给。册上的明冬还缺多少，谁敢保？把桥拦住。」

闸桥的牵引链绷紧了。回水就在脚底，去主闸的路上却挡着人。`
  },
  wen_table: {
    title: "她原来的座位",
    fact: "wen_terms_heard",
    witnesses: ["sanniang", "wenshoutong"],
    body: `文守桐先把靠里的一张椅子拉开。茶杯的缺口朝墙，鱼腹上的细刺已挑净；做这些时，他没有问三娘一句。

随后才给你添杯，放在桌角的客席。

「芷娘，菜还是照你从前的口味。难得回来，今晚别急着走。」

廊外有人叫了一声太太。漆柜旁搁着尚未拆封的药盒，领用纸上，仍写着文郑氏。门没有关，饭还热着。`
  },
  wen_walk: {
    title: "在廊下停一停",
    fact: "wen_walk_shared",
    witnesses: ["sanniang"],
    body: `文宅门里的碗筷声渐渐远了。南街廊柱挡住风，灯光从纸罩里漏下来，在两个人脚边落成一小片暖色。

隔壁铺面正在收摊，偶尔有人拎着水壶经过。这里没有那张饭桌，也没有为谁预先摆好的座位。

回檐下的路还长。可以先在这里，和她说一会儿话。`
  },
  deep_gate: {
    title: "锈闸两边",
    fact: "deep_gate_opened",
    witnesses: ["kouzi"],
    operation: {
      setup: `锈闸把墙里的灯火切成细条。下层绞柄一松手就回弹，上层的扣销又够不着。

扣子试了试管架，回头看你。

「我上去拔销。你压下面那个，等我过去了再松。一个人还真弄不开这破东西。」`,
      label: "替她压住绞柄"
    },
    body: `你压下绞柄。扣子踩着管架侧身过去，鞋尖点过两处扣缝，攀到闸顶。

扣销脱出的刹那，柄猛地往掌心一撞。上面传来一声短促的「稳住」，随即是铁链咬进齿槽的脆响。

闸板擦着石槽升起，灯火沿水面照了进来。扣子从管架上落回你身旁，手里还拎着那根碍事的销子。

「好了。现在谁也别想把咱们关在外头。」`
  },
  deep_receipt: {
    title: "有人走过她的路",
    fact: "deep_trade_found",
    witnesses: ["kouzi"],
    body: `石洞里还有旧药瓶和换下的铜环。收条被水泡透了，背面几笔价钱却认得出。

新的白色测量线越过石洞，连她带人绕开哨站的那处暗弯也标了。画线的人不是从大门进来的。

前面是封堵班留下的铁楔，后面是两人刚走过的路。扣子的扳手碰到管壁，轻轻响了一下。`
  },
  anian_street: {
    title: "街口的风车",
    fact: "anian_street_shared",
    witnesses: ["anian"],
    body: `烤饼摊的油纸一展开，芝麻香就追了过来。隔壁挂着一排薄铜片风车，小贩拨动其中一只，整排都细细地响。

阿念停在架子前，看一只转慢了，伸手又拨一下。檐下每天登记的那扇门，原来里面还有这些东西。

街上不缺赶路的人。此刻却没人催你们往前走。`
  },
  anian_bridge: {
    title: "桥洞里有回声",
    fact: "anian_walk_finished",
    witnesses: ["anian"],
    operation: {
      setup: `工坊的锤声在桥洞里拐了个弯。阿念往栏外探了探，短短地「喂」了一声；隔了一息，桥下竟也回了她一声。

她眼睛一下亮起来，又往旁边让出半步。

「你也试试。往这边！」`,
      label: "和她试试回声"
    },
    body: `你的声音落进桥洞，还没传回来，阿念就抢着又喊了一声。两个尾音撞在一起，她自己先笑出了声。

「哎，你等它说完呀。」

她说完才想起是谁先抢的，笑得伏在栏杆上，半天没直起腰。水面映着碎灯，锤声仍从街那头传来。这一次，她没有急着跟上赶路的人。`
  },
  anian_home: {
    title: "废签背面的小地图",
    fact: "anian_home_shared",
    witnesses: ["anian"],
    body: `登记桌还是出门时那张。阿念坐下，把一张写废的签翻过来，先画了一个圆，又在旁边添上一道弯。

「饼。桥。这个……风车怎么画？」

铜片被她画成了几根歪杈，自己看了一会儿，也没擦。她把纸往你这边推了推，给你腾出桌角。

「下回走这儿。我认得了。」

街名和门牌都没写对，那两个地方倒挨得很近。她没有把这张纸夹进替别人记名的簿子，就留在了手边。`
  },
  gate_tea: {
    title: "老白的旧碗",
    fact: "gate_tea_shared",
    witnesses: ["laobai"],
    body: `还没坐稳，掌柜便从炉边拎出一只豁口碗，往老白面前一推。

「你的，赔不起新的。上回帮我看铺，茶钱没收几文，倒把客人都聊走了。」

老白啧了一声，把碗转了半圈，让缺口背过去。掌柜又添一只完好的放到你手边，没问你从哪来。

靠墙有张空凳，墙缝不漏风。这地方，他确实熟。`
  },
  gate_home: {
    title: "再坐一碗",
    fact: "gate_home_shared",
    witnesses: ["laobai"],
    body: `查验房的门在身后合上。这一回，借签的人先走了，老白也终于能把一直夹在腋下的簿子放下来。

热水铺的炉没熄。掌柜抬眼看了看，没追问，往两只碗里续上水。

老白拉开先前那张凳子。街面还是那条街，坐在这里，却不只是来认个门路了。`
  },
  worker_bunk: {
    title: "点名声里的陈禾",
    fact: "worker_found",
    witnesses: ["anian", "chenhe"],
    body: `门外的点工铃响了。陈禾把针插回线团，拿起工牌走到门口；来点名的人看了一眼册子，让他去补昨夜那班。

「又补？我家里的信呢？」

册子上没有陈禾这个名字，只有挂着旧债的工号。他还在这里做工，外面的登记却说他早已遣返。被扣的工钱、送不出的信，都卡在同一个错字后面。

他看向阿念，停了一下，没把工牌收回去。`
  },
  transfer_record: {
    title: "交接房底簿",
    fact: "worker_record_checked",
    witnesses: ["anian", "qinzhi"],
    body: `秦芷把原始交接簿摊在阿念面前：陈禾留用，旁边压着当日工牌的拓印。后来抄入遣返册时，名字落进了隔行。

扣薪凭单上的债额都沿用了那条遣返登记，没有另一份借据。秦芷将更正页移到桌前，留出经手人说明的空处。陈禾还在寄工住处等消息。`
  },
  worker_result: {
    title: "把凭单交还陈禾",
    fact: "worker_result_delivered",
    witnesses: ["anian", "chenhe"],
    body: `陈禾把更正凭单看了两遍，拇指压住自己的名字。新签和退回的工钱放进同一只旧布袋，他把袋口系得很紧。

「这回信能送出去了。」

他没急着走，先把原来写废的那封信找了出来。阿念站在铺边，门外的街声一阵阵进来。还想说什么，可以就在这里说；想回街上走走，门也开着。`
  },
  gate_cases: {
    title: "这次谁先过门",
    fact: "gate_cases_heard",
    witnesses: ["laobai", "liangyoufang"],
    body: `查验房里坐满了人，药包、空水壶、换下来的工衣堆在脚边。梁有方把门簿翻到折角处，指尖停在老白的记号上。

「这些签不是他们本人的。过门的人都追偿，还是经手的人留下说清？」

有人抬头认出了老白。也有人把脸转了过去。

梁有方将椅子往桌前推了推。老白可以留下担下自行放行的责任，让门外另找人轮值；也可以具名复核，把每一笔过门的缘由说清。两条路，都能先让这些人离开。`
  },
  gate_allowed: {
    title: "热水铺的旧签",
    fact: "gate_allowed_seen",
    witnesses: ["laobai"],
    body: `热水铺掌柜将水壶拎离火口，从柜底取出一只空药包。旧门签夹在包纸里，边角已经磨软。

“那晚你让我过门，我记得。家里的药，就差那几日。”

掌柜给老白也倒了水。簿上一笔越例放行，在这里是烧水、守铺、还在过日子的一家人。`
  },
  gate_refused: {
    title: "补鞋人的手",
    fact: "gate_refused_seen",
    witnesses: ["laobai"],
    body: `通铺边的老人用左手压着鞋底，右手夹针时，少掉的两根手指露了出来。门簿写他那夜证签不合，遣回。

“那时我是去拿药。你说放我进去，你要担事。我就回去了。”

他没有停下针。如今寄工住处一双补好的鞋，能抵一顿饭钱。老白站在他仍然需要借住的床铺前。`
  },
  heat_return: {
    title: "把火送回去",
    fact: "heat_restored",
    operation: {
      setup: `执闸长留下的锁链松在脚边，通向檐下的管口仍然冰凉。闸轮已经没人看守。

分暖站那头传来三下敲管声。程铁生的工班等在那里，接头已备好，就差你这边开闸。`,
      label: "接通檐下回水"
    },
    body: `阀轮一圈圈转开，第一股锈水冲进沟里，随后是清水、白气，和越来越响的管鸣。

三下敲击沿铜管传了回来。另一头的工班收到了水。

压力表的针停稳，没有再落下去。沿墙伸向檐下的那根铜管，重新热了起来。

回去的路已经通了。炉边那些空着的壶，该能装满了。`
  },
  camp_heat: {
    title: k.campHeatTitle,
    fact: "warmth_seen_home",
    body: k.campHeat
  }
}, C = {
  south_street: "内堡南街",
  workshop_street: "工坊街",
  heat_station: "南坊分暖站",
  pipe_gallery: "检修管廊",
  sluice_bridge: "闸桥",
  main_valve: "回流主闸",
  deep_waterway: "深水道",
  coal_store: "旧炭库"
};
function ue(e) {
  return Object.hasOwn(C, e);
}
var c = Object.freeze({
  artwork: {
    unavailable: "部分场景纹理未载入，不影响游玩。",
    retry: "重新载入",
    loading: "载入中…"
  },
  transition: (e) => `正在前往 · ${e}`,
  rested: "生命值已满",
  households: {
    anian_parents: "阿念的父母",
    innkeeper: "客店店家",
    wen_household: "文守桐与文家人",
    clerks: "当值书吏",
    workers: "陈禾与同住的寄工"
  },
  scenes: {
    camp: "檐下",
    crossroads: "外墙岔口",
    gate: "哨站正门",
    beacon: "烽火台",
    waterway: "旧水道",
    cells: "牢房",
    hall: "内堡门厅",
    roots: "根庭",
    ...C,
    ...Object.fromEntries(Object.entries(_).map(([e, a]) => [e, a.name]))
  },
  people: g,
  switches: {
    sluice_opened: "升起水闸",
    captives_released: "打开牢门",
    postern_opened: "拉开小门"
  },
  passages: {
    ...H,
    warning: {
      title: "哨站的烽火",
      body: "墙上的传令管正通向烽火台。先熄灭烽火，能截住内堡的增援；若从水道先去救人，守军会在撤离途中或内堡集结。受困者不会因为你停下来查看道路而被处决。"
    },
    cargo: {
      title: "归还的货签",
      body: `货车上是药材和冷却管件。

哨站随货送来的放还单：
“冷却管件十二副，库中仅此，余者冻裂报损。”

管件箱里夹着的出库签：
“本箱原装二十四副，出十二，存十二，完好。”`
    },
    orders: {
      title: "主闸控制台",
      body: "封锁的闸齿停了下来，外墙的输送轨道正在逐段亮起。控制台上的旧命令只有“内城优先”四个字，没有撤销日期。"
    }
  },
  actions: {
    inspect: "查看",
    talk: "交谈",
    rest: "休整",
    travel: "前往",
    close: "返回",
    interact: "交互",
    next: "切换对象",
    map: "地图",
    resume: "继续",
    move: "移动",
    controls: "WASD 或方向键移动，E 交互",
    paused: "已暂停"
  }
}), f = {
  sanniang: {
    initial: {
      scene: "camp",
      anchor: "clinic"
    },
    station: {
      scene: "camp",
      anchor: "clinic"
    },
    returnFact: null
  },
  laobai: {
    initial: {
      scene: "camp",
      anchor: "guard"
    },
    station: {
      scene: "camp",
      anchor: "guard"
    },
    returnFact: null
  },
  kouzi: {
    initial: {
      scene: "cells",
      anchor: "kouzi"
    },
    station: {
      scene: "camp",
      anchor: "kouzi"
    },
    returnFact: "kouzi_returned"
  },
  anian: {
    initial: {
      scene: "cells",
      anchor: "anian"
    },
    station: {
      scene: "camp",
      anchor: "anian"
    },
    returnFact: "anian_returned"
  }
}, F = z.filter((e) => f[e].returnFact !== null), he = {
  ...Object.fromEntries(Object.keys(_).map((e) => [e, {
    scene: e,
    anchor: "settle",
    name: c.scenes[e]
  }])),
  camp: {
    scene: "camp",
    anchor: "start",
    name: "檐下营地"
  },
  gatehouse: {
    scene: "camp",
    anchor: "gatehouse",
    name: "外门门楼"
  },
  pipewalk: {
    scene: "camp",
    anchor: "kouzi",
    name: "管架高处"
  },
  clinic_back: {
    scene: "camp",
    anchor: "clinic_back",
    name: "诊棚后"
  },
  registry: {
    scene: "camp",
    anchor: "registry",
    name: "登记棚"
  },
  crossroads: {
    scene: "crossroads",
    anchor: "warning",
    name: c.scenes.crossroads
  },
  gate: {
    scene: "gate",
    anchor: "crossroads",
    name: c.scenes.gate
  },
  beacon: {
    scene: "beacon",
    anchor: "gate",
    name: c.scenes.beacon
  },
  waterway: {
    scene: "waterway",
    anchor: "crossroads",
    name: c.scenes.waterway
  },
  cells: {
    scene: "cells",
    anchor: "release",
    name: c.scenes.cells
  },
  hall: {
    scene: "hall",
    anchor: "cells",
    name: c.scenes.hall
  },
  roots: {
    scene: "roots",
    anchor: "crossroads",
    name: c.scenes.roots
  },
  south_street: {
    scene: "south_street",
    anchor: "rest",
    name: c.scenes.south_street
  },
  workshop_street: {
    scene: "workshop_street",
    anchor: "rest",
    name: c.scenes.workshop_street
  },
  heat_station: {
    scene: "heat_station",
    anchor: "rest",
    name: c.scenes.heat_station
  },
  deep_waterway: {
    scene: "deep_waterway",
    anchor: "receipt",
    name: c.scenes.deep_waterway
  }
}, v = {
  scene: "camp",
  fact: "supplies_secured",
  object: {
    id: "cargo",
    anchor: "cargo",
    kind: "inspect",
    passage: "cargo",
    condition: { all: ["warden_defeated"] }
  },
  situation: {
    held: "药材与冷却管件仍被哨站扣押，解除内堡门厅的封锁后，物资会运回檐下的货车。",
    ready: "门厅封锁已解除，药材与冷却管件已运回檐下的货车，等玩家在货车处核对接收。",
    collected: "玩家已在檐下的货车核对接收药材与冷却管件，这批物资已经取回。"
  }
};
function $(e, a) {
  const n = f[a].returnFact;
  return n !== null && (e.includes("captives_arrived") || e.includes(n));
}
function me(e, a) {
  return f[a].returnFact ? $(e, a) ? "returned" : e.includes("captives_released") ? "released" : "confined" : null;
}
function M(e) {
  const a = new Set(e.facts), n = F.filter((o) => !$(e.facts, o)), t = a.has(v.fact) ? "collected" : v.object.condition.all.every((o) => a.has(o)) ? "ready" : "held";
  return {
    phase: a.has("chapter_completed") ? "free" : a.has("briefed") ? a.has("crossroads_cleared") ? a.has("captives_released") ? a.has("captives_arrived") ? t === "held" ? "warden" : t === "ready" ? "supplies" : "finish" : "return" : "release" : "road" : "briefing",
    awaitingReturn: n,
    supplies: t,
    optionalRoots: a.has("warden_defeated") && !a.has("roots_cleared")
  };
}
var W = {
  heat_notice_read: "旅人在落闸告示旁亲见试封，执闸长坚持优先供给在册街区，檐下支管的压力归零。",
  pipes_traced: "工场收料簿与实物上的同批冲号相符：哨站报损的十二副完好管件被调给了南坊分暖站。",
  return_plan_found: "检修图和现场管口核对过了：旧回流管可以修通，保住檐下一支热源，但须经过闸桥与主闸。",
  gallery_cleared: "旅人打通分暖站检修管廊。",
  return_flow_tested: "旅人在管廊开启旧回流的试流阀，压力稳定，旧管接缝没有渗水；这条回路确实承得住回水。",
  bridge_cleared: "闸桥守卫退下，通向主闸的检修桥可以通过。",
  heatkeeper_defeated: "旅人击退执闸长，取得回流主闸的控制。",
  heat_restored: "旅人接通旧回流，檐下恢复热水与炉火。程铁生的工班接手维护这一支，尚未取得长期配暖权。",
  warmth_seen_home: "旅人回到檐下，看到了重新烧开的公共热水与诊棚里温热的水盆。",
  coal_store_cleared: "旧炭库的巡守散了，堆煤后的遗物可以取走。",
  wen_visit_agreed: "三娘邀请旅人陪她回文家赴席，让旅人走进她生活过十九年的地方。",
  wen_terms_heard: "文宅席上，文守桐按旧习惯留着妻子的座位，把旅人安置在客席。他希望三娘回来，药物份额仍记在家庭名下。",
  wen_private_agreed: "三娘与旅人私下约定，暂不向文家公开彼此的私事。婚籍与既有药物安排未变，文守桐没有获知这项约定。",
  wen_departure_declared: "三娘当着文守桐的面决定随旅人离开，继续住在檐下。双方尚未谈定婚籍与药物安排。",
  wen_walk_shared: "文宅赴席后，三娘与旅人在南街廊下停步。文守桐不在这里，街上仍有人经过。",
  wen_release_offered: "文守桐当面同意办理解除婚姻、结束家庭药物供给，三娘可以作自己的选择。",
  wen_independence_offered: "文守桐当面同意三娘独立居住行医、暂保婚籍，药物不再附带返家条件。",
  wen_marriage_ended: "三娘与文守桐当面确认解除婚姻，文家停止以家庭名义供给药物。三娘继续在檐下居住行医。",
  wen_independence_agreed: "文家确认三娘独立居住行医、自己安排药物来源，暂时保留婚籍。文守桐不再以返家作为条件。",
  deep_route_agreed: "扣子约旅人走自己掌握的深水道，绕过大门，从地下去看内堡。",
  deep_gate_opened: "扣子在上层管架卸下锈闸的扣销，旅人在下方压住绞柄，两人一起打开通往南街的水道闸。",
  kouzi_entered_city: "扣子第一次实际踏上了内堡南坊的街面。",
  deep_trade_found: "深水道的旧药瓶、零件与收条留下扣子交易的痕迹。新的测量线沿着她曾带人走过的路延伸；收条本身不能说明那些人拿通路做过什么。",
  deep_route_private: "扣子决定保留深水道为有限知情者的私路，不向工场公开完整路径。",
  deep_route_shared: "扣子将深水道靠内堡的一段开放给检修工和住户，入口与用途公开；通向她住处的支段仍由她掌握。",
  missing_name_agreed: "阿念与旅人约定一道逛内堡；她也带着未归工人的名字，想顺路去工坊问问。",
  anian_street_shared: "阿念与旅人在南街的烤饼摊和拨片风车前停留，听见街口的铜铃与叫卖声。",
  anian_walk_finished: "阿念与旅人逛过南街，又来到工坊街的桥边，试过桥洞的回声。",
  anian_home_shared: "逛过内堡后，阿念与旅人在檐下登记桌旁歇脚；她把去过的烤饼摊和回声桥画在一张废签背面，留在自己的桌上。",
  worker_found: "旅人在寄工住处找到了陈禾。他被误记遣返后一直留在工场，因身份签作废而被扣薪抵债。",
  worker_record_checked: "交接房底簿与陈禾的工牌核对一致。遣返登记有误，扣薪不能由那条登记作凭据。",
  worker_error_acknowledged: "阿念在交接房承认遣返簿上的错笔，请求依底簿更正陈禾登记。",
  worker_record_corrected: "交接房根据底簿与工牌更正陈禾的登记，撤销由此产生的扣签与追债，退回错误扣留的工钱。",
  worker_result_delivered: "阿念与旅人将更正凭单送到陈禾手里。他收到了恢复身份签、撤销错误追债的凭据；他如何看待阿念仍由他的经历与交谈决定。",
  gate_book_agreed: "老白约旅人去南街坐坐，带旅人认熟门路，也要处理查验房索取门簿的事。",
  gate_tea_shared: "老白带旅人坐过南街热水铺，掌柜留着他的旧碗，提起他帮忙看铺却把客人聊走的糗事。",
  gate_cases_heard: "查验房拦下了几名借签者，梁有方在门簿上找到了老白的放行记号，要求经手人留下说明或具名逐件核验。",
  gate_allowed_seen: "老白与旅人在南街热水铺见到当年借签求药的掌柜，看到留下的药包和旧签。那次放行让一家人撑过了病中缺药的几日。",
  gate_refused_seen: "老白与旅人在寄工住处见到当年被他拦回的补鞋人。对方少了两根冻坏的手指，仍靠补鞋交食宿钱。",
  gate_responsibility_taken: "老白公开承担自行放行的责任，门口值守暂由他人轮替；借签者不再被一并追偿。",
  gate_review_agreed: "老白提交具名复核，查验房暂停笼统追偿，逐件核对借签缘由。老白留任并负责到场作证。",
  gate_home_shared: "处理过门簿的事以后，老白与旅人回到热水铺坐下。掌柜给他们留着热水，借签的客人已经能够离开查验房。"
}, Y = Object.freeze({
  id: "outpost",
  number: "第一章",
  numeral: "I",
  title: "哨站救援"
}), q = [
  "captives_arrived",
  "supplies_secured",
  "warden_defeated"
], L = Object.freeze({
  id: "inner_city",
  number: "第二章",
  numeral: "II",
  title: "墙里灯火"
}), pe = [Y.id, L.id], K = [
  {
    person: "sanniang",
    title: "她的另一边",
    accepted: "wen_visit_agreed",
    resolved: [
      "wen_marriage_ended",
      "wen_independence_agreed",
      "wen_departure_declared",
      "wen_private_agreed"
    ],
    invitation: "文家备了席。三娘想带你回去，看看她从前生活的地方。",
    steps: [{
      until: "wen_terms_heard",
      task: "陪三娘到南街文宅赴席。"
    }],
    conclusion: "席上的话可以当面说；南街廊下也有停步的地方，客舍里能私下谈。",
    coda: {
      until: "wen_walk_shared",
      task: "离开文宅后，和三娘在南街廊下停一停。"
    }
  },
  {
    person: "kouzi",
    title: "水下的门",
    accepted: "deep_route_agreed",
    resolved: ["deep_route_private", "deep_route_shared"],
    invitation: "扣子知道一条不用等人开门的路，想带你从那里看看内堡。",
    steps: [{
      until: "deep_gate_opened",
      task: "从管边小窝下深水道，和扣子一起扳开锈闸。"
    }, {
      until: "deep_trade_found",
      task: "看看水道石洞旁新刷的测量线。"
    }],
    conclusion: "路就在脚下，和扣子商量以后让谁走。",
    coda: {
      until: "kouzi_entered_city",
      task: "和扣子穿过刚打开的水道出口，去看墙里的灯火。"
    }
  },
  {
    person: "anian",
    title: "一起去看看",
    accepted: "missing_name_agreed",
    resolved: ["anian_walk_finished"],
    invitation: "阿念想和你一起逛逛墙里的街面。她还没去过。",
    steps: [{
      until: "anian_street_shared",
      task: "和阿念去南街看看烤饼摊与风车。"
    }, {
      until: "anian_walk_finished",
      task: "工坊街桥洞里有回声，陪她去听听。"
    }],
    conclusion: "这段路是你们一起走的。",
    coda: {
      until: "anian_home_shared",
      task: "回檐下时，和阿念在登记桌旁歇歇脚。"
    }
  },
  {
    person: "laobai",
    title: "门的另一边",
    accepted: "gate_book_agreed",
    resolved: ["gate_responsibility_taken", "gate_review_agreed"],
    invitation: "老白约你去南街坐坐。他说有家铺子，熟人不用等水开。",
    steps: [{
      until: "gate_tea_shared",
      task: "随老白去南街热水铺，认认他的熟人。"
    }, {
      until: "gate_cases_heard",
      task: "查验房拦下了借签的人，陪老白去看看。"
    }],
    conclusion: "这一次怎么过门，听听老白自己的打算。",
    coda: {
      until: "gate_home_shared",
      task: "事情告一段落，和老白回南街热水铺再坐一碗。"
    }
  }
];
function _e(e) {
  const a = new Set(e.facts), n = q.every((t) => a.has(t));
  return K.flatMap((t) => {
    const o = a.has(t.accepted), h = t.resolved.some((u) => a.has(u));
    return !o && (!n || e.relationships[t.person].highestBand < 4) ? [] : [{
      person: t.person,
      name: g[t.person],
      title: t.title,
      accepted: o,
      resolved: h,
      task: h ? a.has(t.coda.until) ? null : t.coda.task : o ? t.steps.find((u) => !a.has(u.until))?.task ?? t.conclusion : t.invitation
    }];
  });
}
function ge(e) {
  const a = new Set(e.facts);
  return !a.has("missing_name_agreed") || a.has("worker_result_delivered") ? null : {
    title: "陈禾的下落",
    task: a.has("worker_found") ? a.has("worker_record_checked") ? a.has("worker_record_corrected") ? "更正凭单办好了，可以带回寄工住处交给陈禾。" : "凭据已对上，可以请秦芷更正登记，拿回被扣的工钱。" : "陈禾的工牌还在，去交接房能核对原始底簿。" : "若想打听陈禾，工坊街的寄工住处有人认识他。"
  };
}
function B(e) {
  const a = new Set(e.facts);
  return a.has("warmth_seen_home") ? {
    phase: "home",
    task: "炉边又有了热水。尚未了结的人与事，可以慢慢走下去。"
  } : a.has("heat_restored") ? {
    phase: "restored",
    task: "回檐下炉边看看恢复的热水，或继续尚未了结的人与事。"
  } : a.has("heat_notice_read") ? a.has("pipes_traced") ? a.has("return_plan_found") ? a.has("gallery_cleared") ? !a.has("return_flow_tested") && !a.has("bridge_cleared") ? {
    phase: "trial",
    task: "扳开管廊尽头的试流阀，看看这条旧管还能不能送热水。"
  } : a.has("bridge_cleared") ? a.has("heatkeeper_defeated") ? {
    phase: "repair",
    task: "到主闸后的回流管口接通旧管，再回檐下。"
  } : {
    phase: "valve",
    task: "夺下回流主闸，给檐下保住一支热源。"
  } : {
    phase: "bridge",
    task: "穿过闸桥，留意泄压线路，别被逼在桥墩之间。"
  } : {
    phase: "gallery",
    task: "由分暖站进入检修管廊，打通通向闸桥的路。"
  } : {
    phase: "plan",
    task: "去分暖站检修桌，核对旧回流图与现场管口。"
  } : {
    phase: "investigate",
    task: "去工坊街核对管件冲号，查清哨站报损的十二副管件。"
  } : {
    phase: "arrival",
    task: "分暖站响起试封的铜铃。去热水铺旁看看发生了什么。"
  };
}
var be = {
  ...W,
  bajin_intel: "老白向旅人讲出了八斤的事。",
  bajin_passed: "八斤侧过盾，给旅人让开了路。",
  changyounian_passed: "常有年眯着眼看了旅人一会儿，叫人把火绳收了。",
  changyounian_intel: "三娘向旅人讲出了常守长眼睛的事。",
  briefed: "旅人接下哨站救援，要把困在外墙牢房的扣子与阿念带回来。",
  crossroads_cleared: "岔口的巡兵散了，正门和旧水道都走得通。",
  patrol_cleared: "旅人通过了哨站正门。",
  sluice_opened: "旅人升起旧水闸，露出了通往牢房的检修路。",
  waterway_cleared: "水道看守躺下了。",
  alarm_raised: "守军接到了警报；烽火未熄时，内堡将有援军。",
  alarm_silenced: "烽火信号已截断，内堡后续援兵不会再来。",
  captives_released: "旅人打开了两间牢房的门，扣子与阿念可以离开牢房。",
  postern_opened: "旅人打开牢房小门，营地与牢房之间的捷径永久畅通。",
  receiving_arranged: "老白带担架队守在营地小门，三娘留出了两张床。",
  anian_returned: "阿念已经脱困返营。",
  kouzi_returned: "扣子已经脱困返营。",
  captives_arrived: "两名受困者均已脱困返营。",
  warden_defeated: "门厅守卫倒了，主闸松开。",
  supplies_secured: "旅人核对并接收了哨站归还的药材和冷却管件。",
  roots_cleared: "旅人清除了根庭的荆棘之心，外墙旧庭恢复通行。",
  chapter_completed: "哨站救援结束。阿念、扣子与药材都回到檐下，内堡门厅的封锁已经解除。",
  clinic_helped: "旅人与三娘整理诊棚和归还的药材，陪三娘在门边歇了一会儿。"
}, d = Object.freeze({
  title: "余火",
  start: "走进檐下",
  resume: "继续旅程",
  pause: "菜单",
  map: "地图",
  journal: "手记",
  build: "行囊",
  wardrobe: "衣装",
  opening: "天刚亮，雾还挂在外墙上。老白拖着伤腿回来了，身后少了扣子和阿念。三娘的诊棚亮了一夜，哨站仍扣着药材和冷却管件。",
  beginning: "到诊棚找三娘，或向北门的老白了解情况。",
  prepare: "准备行装",
  close: "返回",
  retry: "重试这场战斗",
  fallen: "火还没有熄灭",
  fallenDetail: "恢复生命，重试这场战斗；也可以回营调整搭配。已打通的路、救援和遗物都保留。",
  retreat: "返回营地整备",
  reward: "拾起余烬",
  skip: "暂不拾取",
  equipped: "已装配",
  stored: "收入收藏",
  emptyBuild: "尚未拾取遗物。",
  safeWardrobe: "回到营地可更换衣装。",
  slots: (e, a) => `装配 ${e} / ${a}`,
  takeOff: "卸下",
  putOn: "装配",
  loadoutIssue: { capacity: "装配已满，先卸下一件遗物。" },
  received: "阿念与扣子都已脱困返营。这一次，两个人都回来了。",
  openCells: "靠近两间牢房外过道上的机关，打开牢门。",
  rescueObjective: (e) => `${e}尚未返营。可交谈带她们同行，或打开小门请老白接应。`,
  rescueAlarm: "牢门的锁链惊动了守军。烽火未熄，内堡将多出一队援兵；你仍可以回头截断信号。",
  alarm: "烽火传讯",
  alarmRaised: "内堡增援已集结",
  alarmSeconds: (e) => `距离传讯 ${e} 秒`,
  endingTitle: "归来的人",
  ending: `阿念与扣子都已脱困返营，药材和冷却管件也已取回。这趟哨站救援，在三娘这里有了交代。

药签照旧按人头发，照旧会过期。檐下的名字依然不在内堡的册子里。那些事还在，但眼前这场救援已经结束，日子可以接着过了。`,
  continued: "内堡门厅以北，南街的灯还亮着。",
  remain: "继续旅程",
  freeTime: "可以从内堡门厅进入南街，查查那批报损管件的去向。",
  optionalRoots: "根庭尚未清理，可选探索。",
  rewardReceived: (e) => `+${e} 小白币 · 已到账`,
  rewardTitle: "阶段奖励",
  rewardDismiss: "收起奖励",
  journeyReward: (e) => `本次旅程已获 ${e} 小白币`,
  rewardRule: "各项奖励仅首次完成时领取，重新开始旅程不会重复领取。",
  talk: "交谈",
  send: "发送",
  cancel: "停止等待",
  input: "你想说什么？",
  player: "你",
  aiUnknown: "这次交谈的结果尚未确认，请先核对并恢复存档。",
  noAi: "请先在小白 OS 设置中配置 AI，再进行自由交谈。",
  aiAuth: "AI 服务未通过身份验证。",
  aiFailed: "AI 服务调用失败，未返回错误详情。",
  emptyReply: "这次没有取得有效对白，可查看交谈记录中的原文。",
  receivedReply: "查看未保存的回复原文",
  contextFull: "当前输入仍超出上下文预算。原记录完整保留，没有调用新的对话回复。",
  memoryFailed: "记忆整理未完成，原记忆与记录未替换。",
  narrativeFailed: "人物资料读取失败，请检查扩展文件是否完整。尚未调用对话模型。",
  dataInvalid: "余火存档不符合当前模型，未覆盖原文件。其他小游戏仍可使用。",
  rebuild: "丢弃旧测试旅程，重新开始",
  rebuildWarning: "这会清除无法读取的余火旅程和人物记录，不能撤销。不迁移旧剧情；共享钱包与账本中已确认的衣装、奖励权益保留。",
  saveFirst: "先保存当前行动，再继续。",
  recover: "核对并恢复存档",
  load: "读取存档",
  acknowledge: "知道了",
  noticeTitle: "旅程已暂停",
  controls: "WASD / 方向键移动 · 空格闪避 · E 交互或技能 · Esc 暂停。靠近敌方警戒区会进入战斗，武器自动攻击。",
  touchControls: "左侧摇杆移动，靠近人物、机关或出口后点右侧交互。战斗中自动攻击，右侧按钮控制闪避和技能。",
  generation: "酒馆正在生成，旅程已暂停。",
  sound: "音效",
  renderError: "场景渲染中断。已暂停，请重新载入画面。",
  reload: "重新载入画面",
  unknownArea: "尚未抵达",
  here: "所在位置",
  objective: "当前行程",
  chapterMap: "区域总览",
  localMap: "当前区域",
  mapKey: "朱红：当前位置 · 蓝色：已抵达 · 浅色：未探索"
}), U = {
  crossroads: "岔口有巡兵守着。过了这里，正门和水道才走得通。",
  gate: "八斤的盾排开了。冲过去，烽火台就在后头。",
  beacon: "守军护着火盆。别让那堆火烧起来。",
  waterway: "看守蹲在闸门边。把闸抢回来。",
  hall: "门厅守卫守着主闸。药和管件都压在闸后。",
  roots: "荆棘之心在地底下动。地面鼓起来时，往旁边让。",
  pipe_gallery: "打通检修管廊，试流阀就在后面。留意管口泄压。",
  sluice_bridge: "守住换边的空隙，突破闸桥，把检修班的路抢回来。",
  main_valve: "夺下执闸长身后的主闸。别让牵引链把你拖进泄压线。",
  coal_store: "炭堆后的巡守围了过来。绕开夹击，别困在角落。"
};
function fe(e) {
  const a = U[e.location.scene];
  if (e.phase === "battle" && a) return a;
  if (e.chapter === "inner_city") return B(e).task;
  const n = M(e);
  switch (n.phase) {
    case "briefing":
      return d.beginning;
    case "free":
      return d.freeTime + (n.optionalRoots ? d.optionalRoots : "");
    case "road":
      return "沿营地北路去外墙岔口。";
    case "release":
      return e.location.scene === "cells" ? d.openCells : "走正门上烽火台，或者下旧水道直奔牢房。";
    case "return":
      return d.rescueObjective(n.awaitingReturn.map((t) => g[t]).join("、"));
    case "warden":
      return "去内堡门厅解除封锁，让药材和管件运回檐下。";
    case "supplies":
      return "回檐下货车处，核对归还的药材和管件。";
    case "finish":
      return "回三娘那儿，把这趟收尾。";
  }
}
var V = Object.freeze({
  city: "赤炉城",
  begin: "开始旅程",
  identity: "你的旅人",
  name: "姓名",
  namePlaceholder: "旅人的名字",
  gender: "性别",
  genders: {
    male: "男",
    female: "女"
  },
  next: "继续",
  back: "返回",
  enter: "启程",
  title: "返回标题",
  age: "年龄",
  agePlaceholder: "选择年龄",
  chooseWeapon: "选择职业",
  controls: "操作",
  equipment: "遗物",
  identityRole: "外地旅人",
  newJourney: "新的旅程",
  restartWarning: "开始新的旅程会替换当前进度、遗物与人物交谈，无法撤销。已拥有的衣装和钱包权益保留。",
  confirmRestart: "确认开始新的旅程",
  entering: "正在启程…",
  loading: "正在读取旅程…"
});
function G(e) {
  const a = e && typeof e == "object" && "code" in e ? String(e.code) : "expedition_agent_failed", n = e && typeof e == "object" && "message" in e && typeof e.message == "string" ? e.message : typeof e == "string" ? e : void 0;
  return {
    code: a,
    ...n && n !== a ? { message: n } : {}
  };
}
var y = ["余烬", "远征"], m = {
  titleFirst: y[0],
  titleSecond: y[1],
  journey: "远征之路",
  dashKey: "空格",
  skillKey: "E",
  moveKeys: "W A S D / 方向键",
  lockedTag: "未解锁",
  unlockReward: (e, a) => `击败${e}，解锁${a}`,
  victory: "区域已肃清",
  chapter: (e) => `第 ${e + 1} 章`,
  bossDefeated: (e) => `${e}已被击败`,
  equipped: "已装备",
  noRelics: "击败敌人后，选择你的第一件遗物。",
  nextGoal: (e) => `下一位首领 · ${e}`,
  name: d.title,
  category: "冒险",
  tagline: V.city,
  entry: "探索 · 战斗 · 人物交谈",
  start: "启程",
  resume: "继续远征",
  pause: "暂停",
  paused: "远征已暂停",
  continue: "继续战斗",
  preparing: "正在打开远征…",
  saving: "正在保存",
  saved: "已保存",
  retry: "核实并恢复",
  refresh: "重新读取",
  saveError: "进度尚未确认，远征已暂停。核实保存后继续，不会重新抽取奖励。",
  invalid: "远征数据或操作不合法，未执行。",
  stale: "进度已经更新，请重新读取。",
  failure: (e) => `远征操作未完成${e ? `（${e}）` : ""}，请重新读取后再试。`,
  unavailable: "当前不能继续远征，请等保存或故事回复结束。",
  locked: "尚未解锁这项选择。",
  presentationError: {
    rendering: "战场画面无法显示，进度已保留。请重新打开游戏。",
    sound: "声音启动失败，可关闭声音后继续。"
  },
  story: "故事正在回复，战斗已暂停。",
  controls: "移动 WASD / 方向键 · 闪避 空格 · 技能 E · 暂停 Esc",
  touchMove: "移动摇杆",
  dash: "闪避",
  skill: "技能",
  autoAttack: "自动攻击最近的敌人",
  route: "选择路线",
  reward: "遗物与强化",
  equipment: "行囊",
  slots: (e) => `${e} / ${l.relicSlots} 遗物`,
  replace: "选择要替换的遗物",
  requiredRelic: "这件遗物是新遗物的触发来源，不能替换。",
  discard: "放弃奖励",
  cancel: "取消",
  confirm: "确认",
  rest: "休整",
  restDetail: (e) => `恢复 ${e} 生命`,
  shrine: "献祭",
  sacrifice: `献出 ${l.sacrificeHp} 生命，换取一件遗物`,
  merchant: "遗物商人",
  buy: (e) => `${e} 碎晶 · 购买`,
  shards: "碎晶",
  hp: "生命",
  leave: "继续前行",
  abandoned: "远征已结束",
  lost: "远征未完成",
  won: "王城的钟声再次响起",
  defeat: {
    fallen: "小白倒下了",
    beacon: "烽火被摧毁"
  },
  defeatDetail: {
    fallen: "生命耗尽，本次远征结束。",
    beacon: "守护目标的生命耗尽，本次远征结束。"
  },
  resultDetail: "解锁、发现和已到账奖励永久保留；本局遗物与碎晶不带入下一局。",
  restart: "再次启程",
  return: "返回营地",
  abandon: "结束本次远征",
  abandonBody: "放弃当前远征？本局构筑将结束，已经获得的解锁与奖励保留。",
  archive: "远征手记",
  back: "返回",
  discoveries: "发现的遗物",
  history: "最近远征",
  awardHistory: "奖励记录",
  totalEarned: (e) => `历次累计到账 ${e} 小白币`,
  noAwards: "完成首次成就后，到账记录会留在这里。",
  firstClear: (e) => `${e} · 首次击败`,
  firstMastery: (e) => `${e} · 首次通关`,
  firstOath: (e) => `${e} · 首次完成`,
  firstVictory: "首次完成远征",
  receipt: "到账编号",
  weapons: "职业",
  oaths: "难度与挑战",
  oathsLocked: "首次通关后开放挑战誓约",
  oathCount: (e) => `${e} 项誓约`,
  wardrobe: "时装与衣橱",
  wardrobeNote: "永久外观，不影响战斗能力",
  tryOn: "试穿",
  purchase: "购买",
  equip: "穿上",
  owned: "已拥有",
  rotate: "旋转预览",
  previewAction: "动作预览",
  nextRunOutfit: "已启程的远征保留原穿搭，新选择在下次启程生效。",
  buyOutfit: (e, a) => `花费 ${a} 小白币，永久拥有「${e}」？`,
  coins: (e) => `${e} 小白币`,
  noCoins: "小白币不足",
  wardrobeBought: "已购买，可在衣橱穿上",
  upgrade: (e) => `强化至 ${e} 阶`,
  rank: (e) => `${e} 阶`,
  newRelic: "新遗物",
  upgradeHint: "强化保留格子；下一章开放更高阶。",
  noOffers: "本次没有可选的遗物，可以继续前行。",
  supply: "购买补给",
  supplyDetail: (e) => `恢复 ${e} 生命`,
  normal: "普通远征",
  weaponUnlock: (e) => `击败 ${e} 位不同首领后解锁`,
  reached: (e) => `抵达第 ${e + 1} 章`,
  resource: "蓄势",
  ward: "护盾",
  achievement: "首胜奖励",
  ready: "就绪",
  contractPower: "契约之力",
  resonanceActive: "使魔强化",
  secondsLeft: (e) => `${(e / l.hz).toFixed(1)}秒`,
  wardValue: (e) => `护盾 ${Math.ceil(e)}`,
  guardActive: "格挡中",
  defenseFeedback: {
    block: "格挡",
    parry: "完美格挡",
    "ward-hit": "护盾吸收",
    "ward-break": "护盾破碎"
  },
  beaconName: "烽火",
  beaconDanger: "烽火危急",
  beaconRule: "烽火被摧毁即失败",
  objectiveProgress: (e, a) => `${Math.floor(e / a * 100)}%`,
  survive: (e) => `坚守 ${Math.ceil(e / l.hz)} 秒`,
  reinforcement: (e) => `增援 ${Math.ceil(e / l.hz)} 秒`,
  unlockWeapon: (e) => `击败${e}后解锁`,
  unlockCloak: (e) => `击败第 ${e} 位首领后解锁`,
  sound: "声音",
  help: "操作",
  close: "关闭",
  progress: (e, a) => `${e} · ${a + 1} / ${l.zoneSteps}`,
  wave: (e, a) => `第 ${e} / ${a} 波`,
  bossPhase: (e) => `阶段 ${e}`,
  gold: (e) => `本局累计到账 ${e} 小白币`,
  wallet: (e) => `小白币 ${e}`,
  earned: (e) => `获得 ${e} 小白币`,
  newUnlocks: (e) => `已解锁：${e.join(" · ")}`,
  stats: (e, a) => `${e} 击败 · ${Math.floor(a / l.hz / 60)}:${String(Math.floor(a / l.hz) % 60).padStart(2, "0")}`,
  journalEmpty: "完成一次远征后，战绩会留在这里。",
  unknown: "未发现",
  rewardRule: `首领首胜各 ${l.firstBossAward} 币 · 首次通关 ${l.firstVictoryAward} 币 · 每种武器首次通关 ${l.masteryAward} 币 · 每条誓约首次通关 ${l.oathAward} 币`,
  checkpoint: "战斗自动保存；意外关闭后，从最近一次已确认进度继续。",
  lootPool: `遗物按职业适配。最多携带 ${l.relicSlots} 件，同一遗物能逐章强化至 ${l.maxRelicRank} 阶；部分组合需要先获得基础遗物。`,
  mastered: "已通关",
  unlocked: "已解锁",
  healthCost: "生命不足，无法献祭",
  noShards: "碎晶不足"
}, we = {
  traveler: {
    name: "晨风旅人",
    detail: "蓝披风与金线，旅途最初的模样。"
  },
  guardian: {
    name: "庭院守望",
    detail: "青绿战甲，重盔上抽出一枝新芽。"
  },
  moonweaver: {
    name: "织月祭司",
    detail: "银月长袍与月角冠，承接回廊的星光。"
  },
  sovereign: {
    name: "日冕君主",
    detail: "金冠、绯红披风与王城肩甲。"
  },
  ranger: {
    name: "林间游侠",
    detail: "叶片兜帽、短披肩与斜挎箭袋。"
  },
  paladin: {
    name: "白昼骑士",
    detail: "银白全甲，金边战袍与翼形肩饰。"
  },
  witch: {
    name: "午夜魔女",
    detail: "宽檐尖帽、星纹裙摆与随身药瓶。"
  },
  assassin: {
    name: "绯影行者",
    detail: "暗色兜帽、绯红面巾与双层短衣。"
  },
  machinist: {
    name: "铜翼工匠",
    detail: "护目镜、皮革长衣与铜制动力背包。"
  },
  beastcaller: {
    name: "森之契约",
    detail: "鹿角、叶羽披肩与发光的契约石。"
  },
  frostbound: {
    name: "霜海巡礼",
    detail: "晶冠、雪绒长衣与冰晶背饰。"
  },
  stargazer: {
    name: "观星使徒",
    detail: "星环冠、层叠长袍与悬浮的星轨。"
  }
}, S = {
  blade: {
    name: "破晓剑士",
    equipment: "剑与盾",
    detail: "近身横斩蓄势，三连击打断敌人。",
    action: "回旋斩",
    skill: "消耗蓄势重击，同时举盾格挡。接住攻击可回充蓄势，举盾瞬间接招为完美格挡。"
  },
  bow: {
    name: "逐风射手",
    equipment: "弓",
    detail: "长距离连射；射击时走位减慢。",
    action: "穿云箭",
    skill: "五束贯穿箭矢，后撤拉开距离。"
  },
  staff: {
    name: "星灯术士",
    equipment: "法杖",
    detail: "溅射星弹蓄能；施法时走位较慢。",
    action: "星落",
    skill: "消耗蓄能，在敌群中心落下三次冲击。"
  },
  daggers: {
    name: "绯影双刃",
    equipment: "双匕首",
    detail: "极近距离快攻，在敌人身后寻找破绽。",
    action: "影袭",
    skill: "突进目标背后重击，使其短暂易伤。"
  },
  grimoire: {
    name: "契约使",
    equipment: "魔导书",
    detail: "自动召出使魔缠斗，咒弹积攒契约之力。",
    action: "共鸣",
    skill: "恢复在场使魔生命，让所有使魔的伤害与攻速提高，并诅咒目标。契约之力越多，强化越久；期间补召同样生效。"
  },
  cannon: {
    name: "机巧炮手",
    equipment: "手炮",
    detail: "重炮范围爆破；开火时难以迅速转移。",
    action: "部署",
    skill: "放置可承伤的自动炮台，建立火力阵地。"
  }
}, ke = (e) => `${S[e].action}：${S[e].skill}`, ve = {
  keeper: "闸口看守",
  bridgekeeper: "闸桥领班",
  heatkeeper: "执闸长",
  soldier: "失落卫兵",
  archer: "逐风射手",
  guard: "重盾守卫",
  priest: "月灯祭司",
  charger: "裂角兽",
  stalker: "影爪猎手",
  bomber: "熔火投弹手",
  wisp: "游灯",
  warden: "庭院守望者",
  thornheart: "棘心古树",
  weaver: "织月者",
  astrologer: "失明占星师",
  king: "空冠之王",
  phoenix: "灰烬不死鸟",
  forgemaster: "赤铜锻主",
  colossus: "裂炉巨像",
  frostqueen: "霜镜女王",
  leviathan: "沉潮巨兽",
  archivist: "无页典守",
  voidknight: "折光骑士"
}, ye = {
  skirmish: {
    name: "肃清",
    detail: "击败全部守军"
  },
  pursuit: {
    name: "追猎",
    detail: "增援不会等待，尽快击破敌群"
  },
  siege: {
    name: "守护烽火",
    detail: `保护中央烽火，击败守军。${m.beaconRule}。`
  },
  ritual: {
    name: "三重封印",
    detail: "清开敌人，站入封印逐个解除"
  },
  survival: {
    name: "长夜坚守",
    detail: "留在安全区域，坚守后清除余敌"
  },
  crossfire: {
    name: "交叉火线",
    detail: "穿越交错射线，击败守军"
  }
}, Se = {
  "storm-step": {
    name: "踏雷靴",
    detail: "闪避起点留下雷场，每次命中造成雷击。",
    family: "雷"
  },
  conductor: {
    name: "导雷针",
    detail: "雷击向附近敌人传导。强化增加传导目标。",
    family: "雷"
  },
  momentum: {
    name: "风暴轴心",
    detail: "雷击命中使闪避冷却缩短；闪避结束释放雷击。",
    family: "雷"
  },
  cinder: {
    name: "余烬",
    detail: "攻击点燃敌人。强化提高灼烧伤害与持续时间。",
    family: "火"
  },
  wildfire: {
    name: "野火瓶",
    detail: "燃烧敌人倒下时留下蔓延火场。强化提高范围与伤害。",
    family: "火"
  },
  "blood-price": {
    name: "赤誓",
    detail: `所有伤害提高，但受到伤害增加 ${Math.round((p.bloodHurt - 1) * 100)}%。强化继续提高输出。`,
    family: "险"
  },
  frost: {
    name: "霜铃",
    detail: "攻击使敌人减速；首领效果较弱。强化延长冰缓。",
    family: "霜"
  },
  shatter: {
    name: "碎冰棱",
    detail: "技能命中（炮手为炮台命中）消耗冰缓造成爆发，并炸伤附近敌人。强化提高爆发伤害。",
    family: "霜"
  },
  echo: {
    name: "回声",
    detail: "周期性追加一次普攻追击。强化提高追击频率。",
    family: "技"
  },
  hunter: {
    name: "猎星镜",
    detail: `距离超过 ${p.hunterRange} 步的远程命中伤害增加。强化提高远距伤害。`,
    family: "弓"
  },
  piercing: {
    name: "穿心羽",
    detail: "远程弹体穿透更多敌人；近战攻击范围扩大。强化增加穿透与范围。",
    family: "锋"
  },
  orbit: {
    name: "卫星",
    detail: "周期性向身边敌人释放雷击。强化提高威力并缩短间隔。",
    family: "雷"
  },
  thorns: {
    name: "荆棘银环",
    detail: "受伤时反击；格挡反击额外打断敌人。强化提升反击伤害。",
    family: "守"
  },
  aegis: {
    name: "镜盾",
    detail: "释放技能时生成护盾，并短暂举盾格挡、反射弹体；剑士延长原有格挡。强化增加护盾和格挡时长。",
    family: "守"
  },
  siphon: {
    name: "温血石",
    detail: `每击败 ${p.siphonEvery} 名敌人恢复生命；击败首领恢复更多。强化增加恢复量。`,
    family: "生"
  },
  focus: {
    name: "澄明",
    detail: `技能冷却缩短，但普攻间隔延长 ${Math.round((p.focusAttack - 1) * 100)}%。强化进一步缩短技能冷却。`,
    family: "技"
  },
  renewal: {
    name: "归途灯",
    detail: "取得或强化遗物时恢复生命，击败首领额外恢复。强化增加恢复量。",
    family: "生"
  },
  execution: {
    name: "断章",
    detail: `对生命低于 ${p.executeThreshold * 100}% 的敌人伤害提高。强化增加斩杀伤害。`,
    family: "锋"
  },
  "last-stand": {
    name: "不灭余火",
    detail: "每场战斗抵挡一次致命伤，恢复生命并短暂无敌。强化增加救回的生命。",
    family: "守"
  },
  quicksilver: {
    name: "流银扣",
    detail: "缩短闪避冷却，闪避后的短时间移动更快。强化进一步提速。",
    family: "技"
  },
  magnet: {
    name: "引力核",
    detail: "敌人倒下时牵引附近敌人，聚拢目标。强化扩大牵引范围。",
    family: "技"
  },
  wardstone: {
    name: "静谧石",
    detail: "一段时间未受伤便逐渐生成护盾。强化提高护盾上限。",
    family: "守"
  },
  pilgrim: {
    name: "远行针",
    detail: "持续移动积攒护盾，闪避也计入路程。强化增加获得的护盾。",
    family: "生"
  },
  gambit: {
    name: "孤注筹码",
    detail: "普攻更强，但受到伤害增加。强化继续提高普攻伤害。",
    family: "险"
  },
  riposte: {
    name: "回敬纹章",
    detail: "格挡向周围反击；起手完美格挡造成更强的破招反击。强化提高反击强度。",
    family: "剑"
  },
  "shield-break": {
    name: "裂盾楔",
    detail: "普攻削弱盾卫正面防御，技能使敌人易伤。强化延长易伤。",
    family: "剑"
  },
  "cleave-wave": {
    name: "破晓刃痕",
    detail: "每次三连击放出贯穿剑气。强化提高剑气伤害。",
    family: "剑"
  },
  duelist: {
    name: "决斗誓印",
    detail: "普攻造成失衡，打断普通敌人；首领需积累失衡。强化增强破招。",
    family: "剑"
  },
  "blood-dance": {
    name: "绯刃穗",
    detail: "攻击附加流血。强化提高流血伤害并延长时间。",
    family: "剑"
  },
  valor: {
    name: "无畏徽章",
    detail: "回旋斩把蓄势化为护盾，蓄势越足护盾越厚。强化提高护盾量。",
    family: "剑"
  },
  ricochet: {
    name: "回旋箭羽",
    detail: "箭矢命中后向附近新目标弹射。强化增加弹射次数。",
    family: "弓"
  },
  "split-arrow": {
    name: "三叶弦",
    detail: "每第三次射击追加两枚分裂箭。强化提高分裂箭伤害。",
    family: "弓"
  },
  pinning: {
    name: "缚足箭钉",
    detail: "箭矢减速，第三箭额外造成失衡。强化延长控制。",
    family: "弓"
  },
  "distance-draw": {
    name: "长风弓环",
    detail: "距离目标越远，箭矢威力越大。强化提高远距收益。",
    family: "弓"
  },
  "hunter-mark": {
    name: "追猎印记",
    detail: "穿云箭使命中的目标易伤。强化延长易伤时间。",
    family: "弓"
  },
  trapper: {
    name: "霜网匣",
    detail: "闪避留下冰霜陷阱，减速并伤害追兵。强化提高陷阱伤害。",
    family: "弓"
  },
  nova: {
    name: "寒星花",
    detail: "施放星落时在身边爆开冰环，减速并打断围攻者。强化扩大冰环。",
    family: "杖"
  },
  inferno: {
    name: "燃星页",
    detail: "技能击中燃烧敌人时生成火场。强化提高火场伤害与范围。",
    family: "杖"
  },
  fracture: {
    name: "霜裂冠",
    detail: "冰缓敌人倒下时迸出冰片，伤害周围敌人。强化增加冰片。",
    family: "杖"
  },
  overload: {
    name: "极昼棱镜",
    detail: "攻击同时燃烧、冰缓的敌人时消耗两种状态，引发强烈爆发。强化提高爆发伤害。",
    family: "杖"
  },
  orbitals: {
    name: "环星仪",
    detail: "周期性震击身边敌人并施加冰缓。强化提高范围和伤害。",
    family: "杖"
  },
  convergence: {
    name: "坠星锚",
    detail: "星落牵引目标周围的敌人，聚拢三次冲击。强化扩大牵引范围。",
    family: "杖"
  },
  backstab: {
    name: "背光刃",
    detail: "从敌人背后普攻伤害大增并施加易伤。强化提高背击威力。",
    family: "刃"
  },
  shadowstep: {
    name: "留影纱",
    detail: "影袭留下共同作战的影分身。强化提高分身伤害与持续时间。",
    family: "刃"
  },
  hemorrhage: {
    name: "血月齿",
    detail: "攻击造成流血。强化提高流血伤害与持续时间。",
    family: "刃"
  },
  "execution-chain": {
    name: "连诛结",
    detail: "击败敌人返还闪避与技能冷却。强化增加闪避返还。",
    family: "刃"
  },
  smoke: {
    name: "夜幕瓶",
    detail: "闪避在原地释放烟雾，打断并暴露周围敌人。强化扩大控制范围。",
    family: "刃"
  },
  venom: {
    name: "青毒针",
    detail: "攻击施加持续毒伤。强化提高毒伤并延长时间。",
    family: "刃"
  },
  "pack-bond": {
    name: "群星契环",
    detail: "增加同时作战的使魔。每次强化再增加一只。",
    family: "契"
  },
  martyr: {
    name: "归魂铃",
    detail: "使魔战死爆开冲击并恢复你的生命。强化提高伤害与恢复。",
    family: "契"
  },
  covenant: {
    name: "共生纹",
    detail: "使魔攻击更强，受到弹幕伤害更少。强化加深共生。",
    family: "契"
  },
  frenzy: {
    name: "猎群牙",
    detail: "使魔移动与攻击更快。强化提高追猎速度。",
    family: "契"
  },
  "soul-harvest": {
    name: "拾魂灯",
    detail: "击败敌人回充契约之力。强化提高每次回充。",
    family: "契"
  },
  command: {
    name: "敕令书签",
    detail: "共鸣在目标处唤出雷场，持续压制敌人。强化扩大雷场并提高伤害。",
    family: "契"
  },
  shrapnel: {
    name: "花火弹壳",
    detail: "重炮爆炸范围扩大。强化进一步扩大爆破。",
    family: "炮"
  },
  minefield: {
    name: "机雷箱",
    detail: "闪避留下机雷，追兵靠近后爆炸并造成失衡。强化提高爆炸威力。",
    family: "炮"
  },
  overclock: {
    name: "超频齿轮",
    detail: "炮台持续更久、射击更快更强；升至二阶可同时部署两座。",
    family: "炮"
  },
  bunker: {
    name: "堡垒铆钉",
    detail: "部署炮台时获得护盾。强化增加护盾量。",
    family: "炮"
  },
  salvage: {
    name: "拾荒扳手",
    detail: "炮台击败敌人时缩短部署冷却。强化提高返还。",
    family: "炮"
  },
  railgun: {
    name: "轨道导管",
    detail: "重炮弹体贯穿敌人，每次命中都能爆炸。强化增加贯穿数量。",
    family: "炮"
  }
};
function Ee(e) {
  const { code: a, message: n } = G(e);
  return a === "expedition_agent_not_configured" ? d.noAi : a === "expedition_agent_auth" ? n || d.aiAuth : a === "expedition_agent_failed" ? n || d.aiFailed : a === "expedition_context_capacity" ? n || d.contextFull : a === "expedition_data_invalid" ? d.dataInvalid : a === "expedition_narrative_unavailable" ? d.narrativeFailed : a.startsWith("expedition_memory_") ? d.memoryFailed : a.startsWith("expedition_reply_") ? d.emptyReply : a === "expedition_stale" ? m.stale : a === "expedition_locked" ? m.locked : a === "expedition_funds" ? m.noCoins : a === "expedition_unavailable" ? m.unavailable : a === "expedition_invalid" || a === "expedition_identity" ? m.invalid : a.startsWith("expedition_save_") || a.startsWith("host_request_") ? m.saveError : n || m.failure(a);
}
export {
  Z as $,
  _ as A,
  ie as B,
  he as C,
  H as D,
  ue as E,
  g as F,
  l as G,
  le as H,
  de as I,
  oe as J,
  ae as K,
  se as L,
  N as M,
  O as N,
  k as O,
  z as P,
  I as Q,
  E as R,
  F as S,
  c as T,
  re as U,
  ne as V,
  p as W,
  X,
  w as Y,
  Q as Z,
  W as _,
  S as a,
  me as b,
  V as c,
  fe as d,
  x as et,
  K as f,
  q as g,
  Y as h,
  Se as i,
  D as j,
  ce as k,
  d as l,
  ge as m,
  ve as n,
  Ee as o,
  _e as p,
  te as q,
  we as r,
  ke as s,
  m as t,
  J as tt,
  be as u,
  M as v,
  f as w,
  v as x,
  $ as y,
  ee as z
};
