/* eslint-disable */
var y = [
  {
    x: -760,
    y: -180,
    scallop: 5
  },
  {
    x: -580,
    y: -400,
    scallop: 9
  },
  {
    x: -120,
    y: -500,
    scallop: 7
  },
  {
    x: 420,
    y: -400,
    scallop: 0.6
  },
  {
    x: 850,
    y: -100,
    scallop: 0.6
  },
  {
    x: 700,
    y: 260,
    scallop: 7
  },
  {
    x: 250,
    y: 450,
    scallop: 9
  },
  {
    x: -300,
    y: 420,
    scallop: 6
  },
  {
    x: -720,
    y: 160,
    scallop: 5
  }
], O = 6, N = 12, k = (e, t, o) => ({
  x: e.x + (t.x - e.x) * o,
  y: e.y + (t.y - e.y) * o
});
function w(e, t) {
  return k(e, t, N / Math.hypot(t.x - e.x, t.y - e.y));
}
var _ = y.flatMap((e, t) => {
  const o = y[(t + y.length - 1) % y.length], i = y[(t + 1) % y.length], a = w(e, o), c = w(e, i), n = w(i, e), l = [];
  for (let p = 0; p < 6; p++) {
    const f = p / 6;
    l.push(k(k(a, e, f), k(e, c, f), f));
  }
  const u = n.x - c.x, m = n.y - c.y, x = Math.hypot(u, m), S = Math.ceil(x / O);
  for (let p = 0; p < S; p++) {
    const f = p / S, P = k(c, n, f), I = Math.sin(Math.PI * f) ** 2, R = e.scallop * I * (0.55 + 0.32 * Math.sin(f * x / 32 + t) + 0.13 * Math.sin(f * x / 11));
    l.push({
      x: P.x + m / x * R,
      y: P.y - u / x * R
    });
  }
  return l;
});
function $(e) {
  const t = {
    minX: 1 / 0,
    minY: 1 / 0,
    maxX: -1 / 0,
    maxY: -1 / 0
  };
  for (const a of e)
    t.minX = Math.min(t.minX, a.minX), t.minY = Math.min(t.minY, a.minY), t.maxX = Math.max(t.maxX, a.maxX), t.maxY = Math.max(t.maxY, a.maxY);
  if (e.length <= 8) return {
    ...t,
    segments: e
  };
  const o = t.maxX - t.minX > t.maxY - t.minY;
  e.sort((a, c) => o ? a.minX + a.maxX - c.minX - c.maxX : a.minY + a.maxY - c.minY - c.maxY);
  const i = Math.floor(e.length / 2);
  return {
    ...t,
    children: [$(e.slice(0, i)), $(e.slice(i))]
  };
}
var U = $(_.map((e, t) => {
  const o = _[(t + 1) % _.length], i = o.x - e.x, a = o.y - e.y;
  return {
    a: e,
    dx: i,
    dy: a,
    lengthSquared: i * i + a * a,
    minX: Math.min(e.x, o.x),
    maxX: Math.max(e.x, o.x),
    minY: Math.min(e.y, o.y),
    maxY: Math.max(e.y, o.y)
  };
}));
function H(e) {
  let t = 1 / 0;
  function o(a) {
    const c = Math.max(a.minX - e.x, 0, e.x - a.maxX), n = Math.max(a.minY - e.y, 0, e.y - a.maxY);
    return c * c + n * n;
  }
  function i(a, c) {
    if (!(c >= t))
      if ("children" in a) {
        const [n, l] = a.children, u = o(n), m = o(l);
        u < m ? (i(n, u), i(l, m)) : (i(l, m), i(n, u));
      } else for (const n of a.segments) {
        if (o(n) >= t) continue;
        const l = e.x - n.a.x, u = e.y - n.a.y, m = Math.max(0, Math.min(1, (l * n.dx + u * n.dy) / n.lengthSquared));
        t = Math.min(t, (l - m * n.dx) ** 2 + (u - m * n.dy) ** 2);
      }
  }
  return i(U, 0), Math.sqrt(t);
}
var d = {
  player: {
    name: "你",
    age: 28,
    occupation: "",
    profile: ""
  },
  lin: {
    name: "林遥",
    age: 29,
    occupation: "编辑",
    profile: "平时说话轻，追问却很具体，常留意别人话里没有说完的部分。愿意帮忙，也很在意自己的空间；不舒服时往往先忍着，直到被人替她作主才明确拒绝。没有野外生活经验，愿意向能解释做法的人学，不喜欢被一句“你不懂”打发。牵挂独居的母亲，最怕自己慢慢习惯不再等救援。"
  },
  zhou: {
    name: "周岑",
    age: 35,
    occupation: "设备维护员",
    profile: "习惯先检查手边东西，再说自己能做什么；熟悉常见手工具和简单修理，没做过野外生火、捕鱼或辨认野食。话少而直，焦急时容易把建议说成命令。愿意教肯一起试的人，却很讨厌别人许诺、让他收尾。希望有个能踏实休息的地方，既不主动争领导，也不愿成为谁的免费劳力。"
  },
  xu: {
    name: "许宁",
    age: 31,
    occupation: "会计",
    profile: "平时有条理，分东西时会问数量和依据；并不追求每件事平均，更在意规则是否临时变卦。能承认自己不会，但很难开口欠人情。紧张时反复核对细节，显得挑剔；被具体的帮助打动后会认真回报。害怕失去选择，愿意共同生活，却会为自己保留退路。"
  },
  chen: {
    name: "陈屿",
    age: 26,
    occupation: "摄影助理",
    profile: "外景工作让他习惯背东西、布置器材和临时协作，并不使他懂热带植物或海况。说话快，喜欢用玩笑压住惊慌；有人认真听他的主意时，容易把把握说得比实际大。肯出力也想被看见，受挫后会先嘴硬再偷偷补救。好奇岛里有什么，但不愿被当成专门跑腿的小孩。"
  },
  ye: {
    name: "叶芮",
    age: 45,
    occupation: "餐馆经营者",
    profile: "熟悉备餐、清洁和协调忙乱的厨房，面对陌生野食仍拿不准。平时能一边做事一边安抚人，记得谁没吃、谁已经忙了很久。照顾人是她主动的选择，不是无穷的义务；别人把照顾当理所当然时，她会停止包办。牵挂家中的孩子，怕死，也怕为了活命变成自己无法面对的人。"
  },
  luo: {
    name: "罗越",
    age: 38,
    occupation: "销售",
    profile: "擅长与陌生人搭话和把分散的意见说到一起，平时重视体面，也在意自己的话还有没有分量。压力大时容易先给保证，再想怎么兑现；真被人指出问题，会难堪，也可能改口协商。愿意促成交换与合作，拿得出实际帮助的人比头衔更能说服他。希望有人需要自己，不愿承认此刻也很害怕。"
  }
}, F = {
  land: _,
  obstacles: [],
  sightScreens: [[
    {
      x: -670,
      y: -60
    },
    {
      x: -590,
      y: -80
    },
    {
      x: -570,
      y: 80
    },
    {
      x: -640,
      y: 110
    }
  ], [
    {
      x: -300,
      y: -120
    },
    {
      x: -160,
      y: -160
    },
    {
      x: -100,
      y: 100
    },
    {
      x: -250,
      y: 140
    }
  ]],
  soundScreens: []
}, q = {
  walkMetresPerSecond: 1,
  hearingMetres: 8,
  sightMetres: 35,
  reachMetres: 1.5,
  takeSeconds: 2,
  maxAdvanceSeconds: 3600,
  maxRoutePoints: 64,
  maxSpeechCharacters: 8e3
}, B = {
  periodSeconds: 12.42 * 3600,
  forageMax: 0.6,
  lowWater: -0.08,
  highWater: 0.65
}, C = {
  lifejacket: {
    name: "救生衣",
    shape: "lifejacket",
    slot: "vest",
    hemMetres: 1,
    color: "#e48b44",
    dryRoughness: 0.94,
    kilograms: 0.5,
    fabricUnits: 0,
    footProtection: 0
  },
  shirt: {
    name: "衬衫",
    shape: "shirt",
    slot: "upper",
    hemMetres: 0.75,
    color: "#dcebf0",
    dryRoughness: 0.94,
    kilograms: 0.2,
    fabricUnits: 2,
    footProtection: 0
  },
  trousers: {
    name: "长裤",
    shape: "trousers",
    slot: "lower",
    hemMetres: 0.07,
    color: "#526c77",
    dryRoughness: 0.94,
    kilograms: 0.4,
    fabricUnits: 3,
    footProtection: 0
  },
  shoes: {
    name: "鞋",
    shape: "shoes",
    slot: "feet",
    hemMetres: 0.025,
    color: "#485151",
    dryRoughness: 0.94,
    kilograms: 0.7,
    fabricUnits: 0,
    footProtection: 1
  },
  wraps: {
    name: "足部包裹",
    shape: "wraps",
    slot: "feet",
    hemMetres: 0.025,
    color: "#ded6c2",
    dryRoughness: 0.94,
    kilograms: 0.2,
    fabricUnits: 0,
    footProtection: 0.6
  },
  ivory_blouse: {
    name: "象牙白上衣",
    shape: "shirt",
    slot: "upper",
    hemMetres: 0.75,
    color: [
      0.74,
      0.71,
      0.65
    ],
    dryRoughness: 0.82,
    kilograms: 0.2,
    fabricUnits: 2,
    footProtection: 0
  },
  charcoal_trousers: {
    name: "炭灰长裤",
    shape: "trousers",
    slot: "lower",
    hemMetres: 0.07,
    color: [
      0.021,
      0.025,
      0.029
    ],
    dryRoughness: 0.76,
    kilograms: 0.4,
    fabricUnits: 3,
    footProtection: 0
  },
  inner_top: {
    name: "内搭",
    shape: "inner-top",
    slot: "upper_inner",
    hemMetres: 0.9,
    color: [
      0.105,
      0.118,
      0.115
    ],
    dryRoughness: 0.9,
    kilograms: 0.1,
    fabricUnits: 1,
    footProtection: 0
  },
  inner_shorts: {
    name: "内裤",
    shape: "inner-shorts",
    slot: "lower_inner",
    hemMetres: 0.68,
    color: [
      0.105,
      0.118,
      0.115
    ],
    dryRoughness: 0.9,
    kilograms: 0.06,
    fabricUnits: 0.5,
    footProtection: 0
  }
}, T = C, j = Object.keys(C), v = {
  gather: "收集",
  fill: "装水",
  drink: "饮水",
  sip: "原地捧饮",
  eat: "进食",
  craft: "制作",
  build: "备料施工",
  pour: "倒入容器",
  empty: "倒掉液体",
  relieve: "如厕",
  wash: "清洁",
  cover_waste: "掩埋排泄物",
  cover_body: "遮盖遗体",
  ignite: "点火",
  fuel: "添柴",
  boil: "煮水",
  construct: "搭建"
}, K = {
  pole: "支杆",
  cover: "覆盖材料",
  binding: "绑扎材料",
  fabric: "布料",
  fuel: "燃料"
}, G = {
  cut: "切割工具",
  strike: "敲击工具"
}, z = Object.fromEntries(j.map((e) => [e, T[e].slot])), s = (e, t, o = {}) => ({
  name: e,
  kilograms: t,
  capacity: 0,
  heatSafe: !1,
  energy: 0,
  materials: o,
  tools: []
}), Y = Object.fromEntries(j.map((e) => {
  const t = T[e];
  return [e, s(t.name, t.kilograms, t.fabricUnits ? { fabric: t.fabricUnits } : {})];
})), M = {
  ...Y,
  branch: s("枯枝", 0.6, {
    pole: 1,
    fuel: 1
  }),
  palm_leaf: s("棕榈叶", 0.3, {
    cover: 1,
    fuel: 0.2
  }),
  cord: s("绳束", 0.1, { binding: 1 }),
  cloth: s("布片", 0.1, {
    fabric: 1,
    cover: 0.5
  }),
  coconut: s("落地椰子", 1.2),
  coconut_open: {
    ...s("打开的椰子", 0.8),
    capacity: 300,
    energy: 400
  },
  coconut_husk: s("椰衣", 0.4, { fuel: 0.3 }),
  shell: {
    ...s("椰壳碗", 0.2),
    capacity: 300,
    heatSafe: !1
  },
  bottle: {
    ...s("回收水瓶", 0.04),
    capacity: 1e3
  },
  metal_cup: {
    ...s("金属杯", 0.15),
    capacity: 350,
    heatSafe: !0
  },
  metal_edge: {
    ...s("金属边片", 0.3),
    tools: ["cut"]
  },
  coral_stone: {
    ...s("厚重珊瑚石", 1.8),
    tools: ["strike"]
  },
  basket: {
    ...s("编篮", 0.6),
    materials: {}
  },
  fish: {
    ...s("潮池小鱼", 0.2),
    energy: 180
  },
  cooked_fish: {
    ...s("熟鱼", 0.18),
    energy: 180
  },
  tinder: s("干引火物", 0.03, { fuel: 0.1 }),
  fire_drill: s("钻木生火组", 0.5)
}, h = (e, t, o) => ({
  name: e,
  seconds: t,
  needs: {},
  kinds: {},
  outputs: {},
  toolOptions: [],
  fire: !1,
  ...o
}), E = {
  tear_cloth: h("拆衣取布", 180, {
    needs: { fabric: 2 },
    outputs: { cloth: 2 }
  }),
  twist_cord: h("搓制绳束", 300, {
    needs: { fabric: 1 },
    outputs: { cord: 2 }
  }),
  foot_wraps: h("制作足部包裹", 180, {
    kinds: { cloth: 2 },
    outputs: { wraps: 1 }
  }),
  open_coconut: h("打开椰子", 240, {
    kinds: { coconut: 1 },
    outputs: {
      coconut_open: 1,
      coconut_husk: 1
    },
    toolOptions: ["cut", "strike"]
  }),
  coir_cord: h("捶取椰棕搓绳", 1200, {
    kinds: { coconut_husk: 1 },
    outputs: { cord: 2 },
    toolOptions: ["strike"]
  }),
  weave_basket: h("编织提篮", 900, {
    needs: {
      cover: 4,
      binding: 2
    },
    outputs: { basket: 1 }
  }),
  dry_tinder: h("整理引火物", 180, {
    kinds: { palm_leaf: 1 },
    outputs: { tinder: 1 }
  }),
  fire_drill: h("制作钻木生火组", 900, {
    needs: {
      pole: 2,
      binding: 1
    },
    outputs: { fire_drill: 1 },
    toolOptions: ["cut"]
  }),
  cook_fish: h("烤鱼", 600, {
    kinds: { fish: 1 },
    outputs: { cooked_fish: 1 },
    fire: !0
  })
}, D = {
  shelter: {
    name: "枝叶棚",
    seconds: 2400,
    radius: 2.5,
    needs: {
      pole: 4,
      cover: 8,
      binding: 4
    },
    capacity: 0
  },
  raincatcher: {
    name: "集雨处",
    seconds: 1200,
    radius: 1.2,
    needs: {
      pole: 2,
      cover: 4,
      binding: 2
    },
    capacity: 2500
  },
  latrine: {
    name: "隐蔽如厕处",
    seconds: 900,
    radius: 1.2,
    needs: {
      pole: 2,
      cover: 4,
      binding: 2
    },
    capacity: 0
  },
  firepit: {
    name: "火塘",
    seconds: 600,
    radius: 0.9,
    needs: { fuel: 3 },
    capacity: 0
  },
  signal: {
    name: "海岸求救标记",
    seconds: 1200,
    radius: 4,
    needs: { pole: 6 },
    capacity: 0
  }
}, L = {
  wood: {
    name: "枯枝散落处",
    seconds: 45,
    output: "branch",
    capacity: 24,
    renewalPerDay: 2,
    renewal: "continuous"
  },
  palm: {
    name: "棕榈叶",
    seconds: 30,
    output: "palm_leaf",
    capacity: 32,
    renewalPerDay: 3,
    renewal: "continuous"
  },
  coconuts: {
    name: "落地椰子",
    seconds: 90,
    output: "coconut",
    capacity: 8,
    renewalPerDay: 1.5,
    renewal: "continuous"
  },
  seep: {
    name: "淡水渗水处",
    seconds: 1,
    output: null,
    capacity: 6e3,
    renewalPerDay: 2e4,
    renewal: "continuous"
  },
  reef_food: {
    name: "潮池",
    seconds: 180,
    output: "fish",
    capacity: 8,
    renewalPerDay: 4,
    renewal: "high_tide"
  }
}, b = {
  west_wood: {
    kind: "wood",
    position: {
      x: -710,
      y: -12
    },
    stock: 18
  },
  west_palm: {
    kind: "palm",
    position: {
      x: -706,
      y: 13
    },
    stock: 24
  },
  west_coconuts: {
    kind: "coconuts",
    position: {
      x: -702,
      y: 19
    },
    stock: 6
  },
  center_seep: {
    kind: "seep",
    position: {
      x: -520,
      y: -35
    },
    stock: 3500
  },
  center_wood: {
    kind: "wood",
    position: {
      x: -495,
      y: -22
    },
    stock: 24
  },
  center_palm: {
    kind: "palm",
    position: {
      x: -470,
      y: 15
    },
    stock: 28
  },
  north_wood: {
    kind: "wood",
    position: {
      x: -390,
      y: -280
    },
    stock: 20
  },
  north_coconuts: {
    kind: "coconuts",
    position: {
      x: -330,
      y: -290
    },
    stock: 8
  },
  east_pools: {
    kind: "reef_food",
    position: {
      x: 800,
      y: 0
    },
    stock: 4
  },
  south_wood: {
    kind: "wood",
    position: {
      x: -80,
      y: 355
    },
    stock: 24
  }
};
for (const [e, t, o] of [
  [
    "northwest",
    -525,
    -250
  ],
  [
    "midwest",
    -440,
    90
  ],
  [
    "center",
    20,
    -100
  ],
  [
    "northeast",
    380,
    -210
  ],
  [
    "southwest",
    -315,
    280
  ],
  [
    "southeast",
    400,
    265
  ]
])
  b[`${e}_grove_fruit`] = {
    kind: "coconuts",
    position: {
      x: t,
      y: o
    },
    stock: 6
  }, b[`${e}_grove_wood`] = {
    kind: "wood",
    position: {
      x: t - 10,
      y: o + 6
    },
    stock: 18
  }, b[`${e}_grove_leaves`] = {
    kind: "palm",
    position: {
      x: t + 8,
      y: o - 7
    },
    stock: 24
  };
[
  [700, -197],
  [730, -176],
  [760, -155],
  [790, -135],
  [820, -114],
  [837, -92],
  [829, -70],
  [815, -35],
  [786, 35],
  [771, 70],
  [757, 105],
  [742, 140],
  [727, 175],
  [713, 210],
  [698, 245]
].forEach(([e, t], o) => {
  b[`coast_pool_${o + 1}`] = {
    kind: "reef_food",
    position: {
      x: e,
      y: t
    },
    stock: 3 + o % 3
  };
});
var Q = {
  maxCarryKg: 18,
  basketBonusKg: 5,
  dragSpeedFactor: 0.3,
  dragExertionFactor: 1.8,
  coverBodySeconds: 45,
  waterLossRestPerHour: 100,
  waterLossWorkPerHour: 260,
  thirstSignal: 1e3,
  lethalWaterDeficit: 6e3,
  maxEnergy: 2600,
  lethalEnergyBalance: -24e3,
  energyRestPerHour: 70,
  energyWorkPerHour: 170,
  hungerSignal: 600,
  fatigueWorkPerHour: 7,
  fatigueRestPerHour: 13,
  fatigueSignal: 75,
  bladderPerHour: 30,
  bladderSignal: 350,
  bladderLimit: 600,
  bowelSignal: 150,
  bowelLimit: 300,
  infectionPerHour: 2e-3,
  footDamagePerRoughMetre: 35e-5,
  urineSeconds: 45,
  fecesSeconds: 120,
  washSeconds: 60,
  coverSeconds: 90,
  drinkMlPerSecond: 30,
  sipMlPerSecond: 10,
  maxSipMl: 1e3,
  fillMlPerSecond: 50,
  fireSecondsPerFuel: 1800,
  dryPerSecond: 1 / 10800,
  rainWetPerSecond: 1 / 600,
  rainCollectionMlPerSecond: 3
}, V = {
  minimumWashMl: 50,
  fullWashMl: 500,
  portionMl: 250
};
function J(e) {
  const t = {}, o = {};
  for (const i of e) {
    o[i.kind] = (o[i.kind] ?? 0) + i.units;
    for (const [a, c] of Object.entries(M[i.kind].materials)) {
      const n = a;
      t[n] = (t[n] ?? 0) + c * i.units;
    }
  }
  return {
    capabilities: t,
    kinds: o
  };
}
var W = {
  invalid: "荒岛数据或操作格式无效。",
  ended: "本次旅程已经结束，请重开。",
  dead: "死者不能行动。",
  authority: "这次操作不属于当前人物的控制范围。",
  stale_scene: "现场已经改变，需要重新确认在场者。",
  blocked: "这条路线无法通行。",
  occupied: "当前活动尚未结束。",
  body_held: "有人正在搬动这具遗体，需要先放下。",
  unavailable: "当前无法接触或使用这个物件。",
  stale: "旅程已更新，请读取当前状态。",
  identity: "操作身份与原请求不一致。",
  missing: "尚未开始旅程。",
  memory_unavailable: "这段经历不在当前可查阅范围内。",
  vector_space: "向量空间或维度不一致。",
  save_failed: "荒岛保存失败，完整候选仍待确认。",
  save_unconfirmed: "荒岛保存结果尚未确认。",
  save_conflict: "荒岛保存发生冲突。",
  busy: "请先处理正在保存的荒岛操作。",
  materials: "材料的数量或用途不满足这次加工。",
  capacity: "容器空间或携带能力不足。",
  conditions: "现场条件不满足这项活动。",
  tool_missing: "手边缺少适合这次加工的工具。",
  fire_missing: "附近没有可用的火。",
  material_wet: "引火材料还太湿，需要先晾干。",
  building_ground: "这里的地面不适合搭建，换到较高的沙地或林地。",
  building_overlap: "这里与已有设施太近，需要留出空间。",
  agent_empty: "模型没有提交有效结果，本次现场未改变。",
  intent_multiple: "模型同时提交了多个行动结果，本次没有选择或执行其中任何一个。",
  agent_limit: "模型本次处理达到上限，尚未提交现场。",
  agent_refused: "模型未能继续本次现场，已保留玩家操作。",
  context_full: "本次现场上下文达到上限，尚未提交。",
  embedding_config: "请先配置故事总结中的 Embedding 连接；荒岛只使用这项连接。",
  embedding_failed: "荒岛记忆向量请求失败，本次未自动重试。",
  memory_save: "荒岛记忆索引保存未确认，请先恢复保存。",
  cancelled: "本次模型处理已取消，已保存的操作不受影响。"
}, A = "搬动遗体", g = {
  name: "荒岛",
  category: "生存 · 群像",
  tagline: "七个人，各自活下去",
  entry: "登岛",
  start: "开始旅程",
  resume: "回到岛上",
  restart: "重新开始",
  restartWarning: "重开会结束并替换这一局，无法返回。",
  opening: "海浪把你推上沙滩。六个人散落在不远处，有人咳嗽，有人还没站起来。你的衣服是湿的。",
  back: "返回",
  close: "关闭",
  yes: "确认重开",
  cancel: "取消",
  journal: "经历",
  inventory: "随身",
  craft: "制作",
  build: "营地",
  body: "身体",
  speak: "说话",
  sayPlaceholder: "说些什么……",
  send: "说出口",
  thinking: "有人正在作出决定…",
  stopGm: "停止本轮",
  action: "行动",
  actionPlaceholder: "想做什么？例如：脱下救生衣",
  interpretAction: "看看怎么做",
  interpreting: "正在理解行动…",
  proposedAction: "这一步",
  confirmAction: "执行这一步",
  dismissAction: "放弃这步",
  actionQuestion: "还需要确认",
  actionCost: "会调用当前模型理解意图；确认后才行动。",
  actionRoute: "经过位置",
  actionTarget: "对象",
  actionPosition: "位置",
  actionWater: "用水量",
  actionWords: "会说出口",
  actionTime: "预计耗时",
  actionQuantity: (e) => `× ${e}`,
  actionMl: (e) => `${e} 毫升`,
  actionReference: (e) => `经历 #${e}`,
  actionCoordinates: (e) => `东向 ${Math.round(e.x * 10) / 10}、南向 ${Math.round(e.y * 10) / 10} 米`,
  actionItem: (e, t) => `${e} · ${t}`,
  carried: "随身携带",
  actionAtFeet: "脚下当前位置",
  actionReliefNote: "在这里处理，周围的人仍可能看见。",
  actionMaterialsNote: "这些材料会被实际消耗；尚未执行。",
  alone: "交谈范围内无人",
  private: "两人交谈",
  group: "多人在场",
  nearby: "附近",
  nobody: "视线内没有人",
  continue: "继续行动",
  wait: "等一会儿",
  rest: "休息十分钟",
  pause: "停下",
  approach: "走近",
  take: "拾取",
  drop: "放下",
  wear: "穿上",
  unwear: "脱下",
  offer: "递给",
  offerTo: "递给谁",
  receive: "接过",
  incoming: "递到你面前",
  takeBack: "收回",
  offering: (e) => `正递给${d[e].name}`,
  offeredBy: (e) => `${d[e].name}递来的`,
  noRecipient: "附近没人能接过物品，先走近对方。",
  gather: "收集",
  eat: "吃",
  drink: "喝水",
  wash: "用水清洁",
  fill: "装水",
  relieveUrine: "小便",
  relieveFeces: "排便",
  cover: "掩埋",
  washSupply: "清洁用水",
  washAmount: "用水量（毫升）",
  washNote: "会消耗这些水；清洁身体不等于消毒、治伤或洗净衣物。",
  noWashWater: "手边没有可用的水。",
  groundTraces: "附近痕迹",
  wasteKind: {
    urine: "尿液湿痕",
    feces: "未掩埋的粪便",
    disturbed_ground: "翻动过的土面"
  },
  foodCondition: {
    unexamined: "还未凑近查看",
    no_obvious_spoilage: "没有明显异味，不代表食用安全",
    off_odor: "已有变质异味，食用会增加疾病负担"
  },
  eatDespiteSpoilage: "仍然吃",
  spoiledCooking: "材料已有异味，烤熟不会消除已累积的变质风险。",
  drinkDespiteSpoilage: "仍然喝",
  liquid: "液体",
  foodAndLiquid: "食物与液体",
  pour: v.pour,
  emptyLiquid: v.empty,
  pourFrom: "从这件容器",
  pourTo: "倒入",
  pourAmount: "倒入量（毫升）",
  emptyLiquidNote: "倒掉的液体无法取回，容器会保留。",
  water: "水",
  materials: "使用材料",
  make: "开始制作",
  place: "在这里搭建",
  work: "继续施工",
  empty: "没有可用物品",
  choose: "选择",
  quantity: "数量",
  ml: "毫升",
  untreated: "未处理",
  treated: "已处理",
  worn: "穿戴中",
  ground: "地面",
  hunger: "饥饿",
  thirst: "口渴",
  fatigue: "疲劳",
  bladder: "便意 · 小便",
  bowel: "便意 · 排便",
  wound: "脚伤",
  hygiene: "清洁",
  dead: "旅程到此为止",
  deadDetail: "你没能活下来。这一局已结束，只能重新开始。",
  remains: "遗体",
  dragBody: A,
  coverBody: v.cover_body,
  covering: "遮盖在遗体上",
  dragDestination: (e) => `搬动${d[e].name}的遗体：选择要走到的地面`,
  coverMaterial: "用来遮盖的衣物或枝叶",
  noCoverMaterial: "手边没有脱下的衣物、布片或棕榈叶。",
  bodyHandlingNote: "拖移较慢，也更耗体力；随身物件与遮盖物会一起移动。",
  recover: "确认保存状态",
  retry: "重新读取",
  error: "操作未完成",
  saved: "已保存",
  saving: "保存中",
  gmFailed: "人物回应未完成",
  retryGm: "重试人物回应",
  errorDetails: "查看原因",
  modelSettings: "模型设置",
  gmFailureDetail: "已保存的行动和说话仍保留。重试只重新请求人物回应，会使用当前模型。",
  renderError: "岛上画面暂时没能载入。可以重试，旅程进度仍保留。",
  loadingScene: "正在回到岛上…",
  reloadScene: "重新载入画面",
  mapLabel: "岛上现场，点击地面移动",
  noMaterials: "附近或随身没有适用材料",
  occupied: "进行中",
  waiting: "等待行动",
  storm: "阵雨",
  clear: "晴",
  night: "夜间",
  stairs: "行动",
  fire: "生火",
  fuel: "添柴",
  boil: "煮水",
  waterContainer: "容器",
  materialMissing: "材料不足",
  people: "人与立场",
  visiblePeople: "眼前的人",
  ownChoices: "我的选择",
  residence: "住处",
  settleHere: "决定住在这里",
  noResidence: "还没决定住处",
  declareResidence: "我打算住在这里。",
  stance: {
    with: "支持",
    against: "反对",
    neutral: "不站队"
  },
  declaration: (e, t) => ({
    with: `我愿意支持${d[e].name}。`,
    against: `我不赞同${d[e].name}，不再站在同一边。`,
    neutral: `对${d[e].name}，我暂不站队。`
  })[t],
  declarationNote: "这是你公开表达的选择。只有现场能听见的人会知道；不会替对方作出承诺。",
  knownChoices: "我知道的表态",
  noChoices: "还没有听到明确表态。",
  returnHome: "走回住处",
  look: "查看",
  agreements: "合作约定",
  propose: "提出约定",
  proposalTerms: "我愿意怎样合作",
  proposalPlaceholder: "说清各自做什么、物资怎么用……",
  noAgreements: "还没有听到合作提议。",
  agreementNote: "提出只代表你自己答应。其他人各自回应，交付与劳动仍需实际行动。",
  commitment: {
    accept: "愿意履行",
    decline: "不参与"
  },
  noCommitment: "尚未回应",
  accept: "我愿意",
  decline: "不参与",
  withdraw: "退出约定",
  respondAgreement: (e) => e ? "这份约定，我愿意履行。" : "这份约定，我不参与。",
  relayTerms: "转述原提议",
  relayResponse: "转述这次回应",
  relayStatement: "我把听到的原话转述给你们。",
  proposalBy: (e) => `${d[e].name}的提议`,
  through: (e) => e === "player" ? "本人" : `听自${d[e].name}`,
  quote: (e) => `${d[e.actor].name}的${e.choice.kind === "proposal" ? "提议" : "回应"}：「${e.text}」`,
  earlier: "查看早期经历",
  nextPage: "下一页",
  recent: "近期",
  historyEmpty: "没有更早的经历。",
  zoomIn: "拉近",
  zoomOut: "拉远",
  inSight: "视线内",
  idle: "停留",
  dismantleWarning: (e) => `会拆用正在穿着的${e.join("、")}，拆用后不能再穿。`,
  tools: "工具条件",
  toolChoice: (e) => e.join("或"),
  nearbyFire: "附近的火",
  toolsKept: "工具不会消耗。",
  ready: "已具备",
  missingCondition: "缺少",
  produces: "得到",
  duration: (e) => `约 ${Math.ceil(e / 60)} 分钟`,
  feeling: {
    thirst: [
      "还不太渴",
      "口干，想喝水",
      "很渴，需要补水"
    ],
    hunger: [
      "还不饿",
      "肚子饿了",
      "持续缺食，体力恢复变慢"
    ],
    fatigue: [
      "尚有余力",
      "有些累",
      "很累，需要休息"
    ],
    relief: ["不急", "需要找地方处理"],
    foot: ["行走无脚伤妨碍", "脚痛，行走变慢"],
    clean: ["还算清洁", "身上脏了，需要清洁"]
  },
  wetClothing: "身上的衣物还湿着，休息恢复较慢。",
  sip: v.sip,
  rawWaterRisk: "水未经处理，直接饮用有生病风险。",
  gatherAvailable: (e) => `可收集 ${e} 份`,
  poolExposed: "当前水位较低，可以下池采集。",
  poolFlooded: "当前水位较高，暂不能下池采集。",
  sourceDepleted: "眼下没有可收集的东西。",
  repeated: (e) => `× ${e}`,
  materialAvailable: (e) => `有 ${e} 份`,
  places: "已知地点",
  knownPlacesNote: "记得的位置，不代表那里此刻的情况。",
  noKnownPlaces: "还没有记下地点。",
  firstObserved: "发现于",
  goThere: "走过去",
  contactPause: "遇见了人，行动暂歇",
  fireBurning: "火在燃烧",
  fireUnlit: "未点燃",
  fireNeedsFuel: "先添入燃料",
  fuelTime: (e) => `现有燃料约可燃烧 ${Math.ceil(e / 60)} 分钟`,
  active: {
    travel: "行走",
    drag: A,
    rest: "休息",
    take: "拾取",
    work: "劳作",
    construct: "施工",
    offer: "递出物品，等对方接过"
  },
  terrain: {
    sand: "西岸沙滩",
    scrub: "岛中林地",
    reef: "东岸礁滩",
    mangrove: "南端红树林"
  },
  time: (e) => {
    const t = e + 32400;
    return `第 ${Math.floor(t / 86400) + 1} 天 · ${String(Math.floor(t / 3600) % 24).padStart(2, "0")}:${String(Math.floor(t / 60) % 60).padStart(2, "0")}`;
  },
  distance: (e) => `${Math.round(e)} 米`
}, r = (e) => d[e].name;
function Z(e, t) {
  switch (e.kind) {
    case "speech":
      return e.text;
    case "declaration":
      return t ? `${e.text}
${g.quote(t)}` : e.text;
    case "intention":
      return e.text;
    case "encounter":
      return `${r(e.actor)}看见了${r(e.subject)}。`;
    case "started":
      return `${r(e.actor)}开始${g.active[e.activity]}。`;
    case "departed":
      return `${r(e.actor)}动身离开。`;
    case "arrived":
      return `${r(e.actor)}停下脚步。`;
    case "rested":
      return `${r(e.actor)}结束了休息。`;
    case "interrupted":
      return `${r(e.actor)}停下了手里的事。`;
    case "taken":
      return `${r(e.actor)}拾起一件物品。`;
    case "offered":
      return `${r(e.actor)}向${r(e.to)}递出${M[e.form].name} × ${e.units}。`;
    case "received":
      return `${r(e.actor)}接过${r(e.from)}递来的${M[e.form].name} × ${e.units}。`;
    case "poured":
      return e.to === null ? `${r(e.actor)}倒掉了 ${e.millilitres} ml 液体。` : `${r(e.actor)}把 ${e.millilitres} ml 液体倒入了另一只容器。`;
    case "dropped":
      return `${r(e.actor)}放下一件物品。`;
    case "worn":
    case "unworn":
      return `${r(e.actor)}调整了穿戴。`;
    case "take_unavailable":
      return `${r(e.actor)}没能拿到那件物品。`;
    case "contested":
    case "resource_contested":
    case "site_contested":
      return `${e.actors.map(r).join("和")}同时伸手，事情暂时停了下来。`;
    case "died":
      return `${r(e.actor)}没能撑过来。`;
    case "noticed_body":
      return `${r(e.actor)}发现了${r(e.subject)}的遗体。`;
    case "body_handling":
      return e.stage === "started" ? `${r(e.actor)}开始搬动${r(e.subject)}的遗体。` : `${r(e.actor)}放下了${r(e.subject)}的遗体。`;
    case "body_covered":
      return `${r(e.actor)}遮盖了${r(e.subject)}的遗体。`;
    case "discovered":
      return `${r(e.actor)}发现了${e.subject.kind === "resource" ? L[e.subject.form].name : D[e.subject.form].name}。`;
    case "worked":
      return `${r(e.actor)}完成了${e.task === "craft" && e.target && Object.hasOwn(E, e.target) ? E[e.target].name : v[e.task]}。`;
    case "work_failed":
      return `${r(e.actor)}的工作停了下来：${X({ code: e.reason })}`;
    case "need":
      return `${r(e.actor)}感到${{
        thirst: g.thirst,
        hunger: g.hunger,
        fatigue: g.fatigue,
        bladder: "需要小便",
        bowel: "需要排便",
        wound: "脚痛"
      }[e.need]}。`;
    case "accident":
      return `${r(e.actor)}没能及时处理便意，需要清洁。`;
  }
}
function X(e) {
  const t = e;
  return W[t?.code?.replace(/^island_/, "")] ?? t?.message ?? g.error;
}
var ee = "" + new URL("island-assets/shore-cover-DiTtWp89.png", import.meta.url).href;
export {
  H as C,
  B as S,
  J as _,
  W as a,
  F as b,
  b as c,
  E as d,
  L as f,
  v as g,
  z as h,
  Z as i,
  M as l,
  G as m,
  g as n,
  D as o,
  Q as p,
  X as r,
  V as s,
  ee as t,
  K as u,
  T as v,
  q as x,
  d as y
};
