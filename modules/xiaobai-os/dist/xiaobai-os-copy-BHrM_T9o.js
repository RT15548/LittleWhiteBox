/* eslint-disable */
var D = {
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
}, I = D, L = Object.keys(D), p = {
  gather: "收集",
  fill: "装水",
  drink: "饮水",
  sip: "原地捧饮",
  eat: "进食",
  craft: "制作",
  build: "备料施工",
  pour: "倒入容器",
  empty: "倒掉液体",
  wash_item: "清洗物品",
  tend: "照料伤口",
  bury_body: "掩埋遗体",
  exhume_body: "挖开土堆",
  relieve: "如厕",
  wash: "清洁",
  cover_waste: "掩埋排泄物",
  cover_body: "遮盖遗体",
  ignite: "点火",
  fuel: "添柴",
  boil: "煮水",
  construct: "搭建"
}, oe = {
  pole: "支杆",
  cover: "覆盖材料",
  binding: "绑扎材料",
  fabric: "布料",
  fuel: "燃料"
}, re = {
  cut: "切割工具",
  strike: "敲击工具"
}, ae = Object.fromEntries(L.map((e) => [e, I[e].slot])), i = (e, t, r = {}) => ({
  name: e,
  kilograms: t,
  capacity: 0,
  heatSafe: !1,
  energy: 0,
  materials: r,
  tools: []
}), U = Object.fromEntries(L.map((e) => {
  const t = I[e];
  return [e, i(t.name, t.kilograms, t.fabricUnits ? { fabric: t.fabricUnits } : {})];
})), w = {
  ...U,
  branch: i("枯枝", 0.6, {
    pole: 1,
    fuel: 1
  }),
  palm_leaf: i("棕榈叶", 0.3, {
    cover: 1,
    fuel: 0.2
  }),
  cord: i("绳束", 0.1, { binding: 1 }),
  cloth: i("布片", 0.1, {
    fabric: 1,
    cover: 0.5
  }),
  coconut: i("落地椰子", 1.2),
  coconut_open: {
    ...i("打开的椰子", 0.8),
    capacity: 300,
    energy: 400
  },
  coconut_husk: i("椰衣", 0.4, { fuel: 0.3 }),
  shell: {
    ...i("椰壳碗", 0.2),
    capacity: 300,
    heatSafe: !1
  },
  bottle: {
    ...i("回收水瓶", 0.04),
    capacity: 1e3
  },
  metal_cup: {
    ...i("金属杯", 0.15),
    capacity: 350,
    heatSafe: !0
  },
  metal_edge: {
    ...i("金属边片", 0.3),
    tools: ["cut"]
  },
  coral_stone: {
    ...i("厚重珊瑚石", 1.8),
    tools: ["strike"]
  },
  basket: {
    ...i("编篮", 0.6),
    materials: {}
  },
  fish: {
    ...i("潮池小鱼", 0.2),
    energy: 180
  },
  cooked_fish: {
    ...i("熟鱼", 0.18),
    energy: 180
  },
  tinder: i("干引火物", 0.03, { fuel: 0.1 }),
  fire_drill: i("钻木生火组", 0.5)
}, h = (e, t, r) => ({
  name: e,
  seconds: t,
  needs: {},
  kinds: {},
  outputs: {},
  toolOptions: [],
  fire: !1,
  ...r
}), O = {
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
}, Y = {
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
}, H = {
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
}, x = {
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
for (const [e, t, r] of [
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
  x[`${e}_grove_fruit`] = {
    kind: "coconuts",
    position: {
      x: t,
      y: r
    },
    stock: 6
  }, x[`${e}_grove_wood`] = {
    kind: "wood",
    position: {
      x: t - 10,
      y: r + 6
    },
    stock: 18
  }, x[`${e}_grove_leaves`] = {
    kind: "palm",
    position: {
      x: t + 8,
      y: r - 7
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
].forEach(([e, t], r) => {
  x[`coast_pool_${r + 1}`] = {
    kind: "reef_food",
    position: {
      x: e,
      y: t
    },
    stock: 3 + r % 3
  };
});
var u = {
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
}, ne = {
  minimumWashMl: 50,
  fullWashMl: 500,
  portionMl: 250
}, ie = {
  thirst: {
    field: "waterDeficit",
    levels: [
      u.thirstSignal,
      u.lethalWaterDeficit * 0.5,
      u.lethalWaterDeficit * 0.8
    ]
  },
  hunger: {
    field: "energy",
    levels: [
      u.hungerSignal,
      0,
      u.lethalEnergyBalance * 0.5
    ],
    falling: !0
  },
  fatigue: {
    field: "fatigue",
    levels: [u.fatigueSignal, 95]
  },
  bladder: {
    field: "bladder",
    levels: [u.bladderSignal, u.bladderLimit * 0.9]
  },
  bowel: {
    field: "bowel",
    levels: [u.bowelSignal, u.bowelLimit * 0.9]
  },
  wound: {
    field: "footWound",
    levels: [
      0.2,
      0.5,
      0.8
    ]
  },
  infection: {
    field: "infection",
    levels: [
      0.2,
      0.6,
      0.85
    ]
  },
  illness: {
    field: "illness",
    levels: [
      0.2,
      0.6,
      0.85
    ]
  },
  hygiene: {
    field: "soiling",
    levels: [0.5, 0.85]
  }
}, se = {
  cleanLimit: 0.15,
  dirtyLimit: 0.5,
  seaWashFloor: 0.2,
  untreatedWashFloor: 0.1,
  garmentWashMl: 500,
  containerWashMl: 100,
  itemWashSeconds: 120,
  rinseMl: 250,
  rinseSeconds: 120,
  dressSeconds: 180,
  uncoverSeconds: 30,
  cleanWoundDirt: 0.05,
  roughWoundDirt: 0.35,
  dressingMaxWetness: 0.25,
  dressingSoilPerHour: 0.01,
  wornSoilPerHour: 0.015,
  groundSoilPerHour: 0.04,
  bodySoilPerHour: 4e-3,
  woundSoilPerHour: 0.02,
  healingPerHour: 8e-3,
  infectionRecoveryPerHour: 3e-3,
  untreatedResidue: 0.35,
  coconutResidue: 0.1
}, B = {
  urineSeconds: 6 * 3600,
  fecesSeconds: 5 * 86400,
  wasteRadius: 4,
  wastePortion: 150,
  bodyOdorAfter: 6 * 3600,
  bodyWeatheredAfter: 10 * 86400,
  bodyRadius: 12,
  bodyOdorEnds: 30 * 86400,
  weatheredOdor: 0.12,
  coverOdorFactor: 0.65,
  noticeableOdor: 0.15,
  strongOdor: 0.65,
  fliesThreshold: 0.3,
  restLoss: 0.4,
  burySeconds: 7200,
  exhumeSeconds: 3600,
  graveRadius: 1.2,
  waterSeparation: 30,
  handlingSoiling: 0.2,
  diggingTools: ["coral_stone", "metal_edge"]
};
function ce(e) {
  const t = {}, r = {};
  for (const o of e) {
    r[o.kind] = (r[o.kind] ?? 0) + o.units;
    for (const [a, s] of Object.entries(w[o.kind].materials)) {
      const n = a;
      t[n] = (t[n] ?? 0) + s * o.units;
    }
  }
  return {
    capabilities: t,
    kinds: r
  };
}
var X = "叶琳与周涛是夫妻。林遥是周涛的秘书，工作上长期配合，也认识叶琳。", F = {
  ye: {
    name: "叶琳",
    gender: "female",
    age: 45,
    heightMetres: 1.6,
    occupation: "餐馆经营者",
    profile: `基本事实：身形纤瘦，骨架小，漂亮而成熟。经营餐馆多年，熟悉备餐、清洁和人情往来。

外在：极注重仪态与细节，蹲下时会先顺手按住衣摆，乘电梯永远走内侧防走光。在稍远的社交距离下，她举止温柔、温和优雅、分寸感极强，女神味很重，让人心生敬意。

内里：骨子里非常感性、易羞，藏着一个小女生般渴望被惦记、被用心哄的灵魂。越是亲近的人，越能看到她风情与娇气的融合。撒娇是湿的、黏的，面对私密之事虽会害羞脸红，但成熟的阅历让她完全接得住、放得开，私下主动而熟练（如技巧与口活等）。

脾气与日常：对亲近之人的情绪极其敏感。一旦察觉到自己被忽视或被当成只会照顾人的老成大姐，她会流露出明显的、酸溜溜的阴阳怪气，拿话点人，带着一种小脾气等着人来哄。`
  },
  lin: {
    name: "林遥",
    gender: "female",
    age: 35,
    heightMetres: 1.7,
    occupation: "秘书",
    profile: `基本事实：新闻学出身。身形纤瘦修长，漂亮、整洁，待人有礼而疏离。自尊很高，以专业、效率和自制为傲，对愚蠢、低效、没有分寸的人很不耐烦。已婚，心里的重心顺其自然。

来路与内核：体制内家庭出身，从小见惯领导和身边人的运转。她有清醒的自知之明，自己不是成王的人，但需要一个能彻底折服她的主心骨。她对老板的依附与忠诚，基于对方在现实秩序中能撑得住场面、压得住阵脚的实用主义信任。

做事分寸：立场随所认定的人而定，处理事情先考虑对方利益。对外维护赞扬，重大紧急的事由老板出面。她几乎不对公事私事提意见，大部分事直接做好（做出来的就是老板一贯的习惯或不好明说的意思），拿不准的才问。看到老板桌上有新书会悄悄买来读。私下唯一会念叨的，是老板的身体。

私密边界：老板的私事、情感、欲望（指对别人）也是她处理安排的事。她自己也可以，不追求长期的妻子关系，要的是在身边办事。越私密棘手越觉得被信任。

核心收获：收获是一整套的，跟着折服她的人学东西、提升感、地位、被信任、优渥的经济。`
  },
  xu: {
    name: "许宁",
    gender: "female",
    age: 25,
    heightMetres: 1.65,
    occupation: "新职员",
    profile: `基本事实：来自台湾，刚入司。清秀白净，苗条干净，五官秀气耐看。说话带很软的台湾口音和尾音，外表乖巧温软。

背景：父母早亡，八岁起寄住叔叔家。叔叔再婚，家里另有三个女儿共四人挤在一起，长期受冷嘲热讽。青春期被同龄男生骗过感情。在台湾没有独立生活的经济条件，来大陆是为了离开寄人篱下的日子。

想要的：有人保护，替她撑腰，优先照顾她，最好把偏爱留给她一个人。

对男人：贴心棉袄，亲近时关心、体贴、黏人。称呼随亲疏变，名字加哥，亲近后叫哥哥。借递东西、靠近说话、寻求搀扶制造亲近，被追问时能解释成无意。暧昧暗示多，对进一步亲密和明确承诺常留余地。依恋可以是真心，经营关系也是她熟悉的求生办法。

对女人：不喜欢，不硬碰，厌恶和别的女性挤在同一空间争照顾、争资源。表面亲热叫姐姐、求教、示弱。察觉位置被挤占，会经营保护者的态度，让对方疏远竞争者。有时摆出无辜态，是故意气人、看对方失态。`
  },
  zhou: {
    name: "周涛",
    gender: "male",
    age: 48,
    heightMetres: 1.79,
    occupation: "国企领导",
    profile: `基本事实：儒雅，举止从容，衣着讲究整洁与分寸。说话不疾不徐，习惯听人说完，措辞留余地，处理分歧时顾及各方颜面。

工作习惯：长期领导工作的经验在于用人、协调和判断局面。习惯安排事情、听取汇报，让熟悉的下属领会自己的意思；对外稳住场面，私下再谈不满。身份被尊重对他很自然，意见被当众轻慢时尤其在意体面。

日常相处：在熟悉的人面前会有日常的关心与温和玩笑，与妻子的相处带着多年生活形成的默契与疏离。面对具体困难，他会先了解谁有经验、手边有什么，再考虑如何组织合作。`
  },
  luo: {
    name: "罗刚",
    gender: "male",
    age: 30,
    heightMetres: 1.76,
    occupation: "销售",
    profile: `基本事实：壮实偏胖，带着混社会的痞气。识人准，交际广，会说话，出手大方，讲究哥们义气。与人熟络得快，愿意拿实际好处和担当换人心。

行事风格：有野心，也敢承担风险，黑白两种手段都用。对自己人肯帮忙、肯撑腰；对敌人习惯先恐吓，摆出不怕拼命的架势，对方不服就动手，真到敌我对立时能下死手。

情感倾向：好色，嘴甜，会哄女人，有过许多短暂的亲密关系。偏爱年轻漂亮的成年女性，对年长女性缺少情欲兴趣。喜欢别人信服自己、愿意跟着自己干，既懂拉拢，也肯用强硬手段争取分量。`
  },
  chen: {
    name: "陈阳",
    gender: "male",
    age: 29,
    heightMetres: 1.82,
    occupation: "经济学毕业生",
    profile: `基本事实：瘦高，气质阴沉，善于藏住心思。经济学高材生，爱算计，对稀缺、交换、劳动与分配很敏感，习惯先看每个人想得到什么、能付出什么。

行事风格：说话时常用具体利益试探对方，自己的目的却留一部分不说。会挑选时机、交换条件，衡量一件事由谁出力、谁承担风险、最后谁得好处。

情感倾向：花心浪子，极好色，偏爱漂亮的年长美妇、熟女，尤其是有家庭、举止端庄的良家型女性。面对这类人会格外留意她的情绪和关系中的空隙，设法接近、取得信任，欲望也会让他低估代价，作出不划算的选择。`
  }
}, q = {
  male: {
    label: "男",
    heightMetres: 1.78
  },
  female: {
    label: "女",
    heightMetres: 1.67
  }
}, G = {
  twenties: "看起来20上下",
  thirties: "看起来30上下",
  forties: "看起来40上下",
  elder: "看起来是老者"
}, S = {
  background: X,
  npcs: F,
  playerBodies: q,
  playerAges: G
}, le = ["male", "female"], de = S.playerAges, K = S.npcs, ue = S.background, me = S.playerBodies, z = {
  invalid: "荒岛数据或操作格式无效。",
  ended: "本次旅程已经结束，请重开。",
  dead: "死者不能行动。",
  authority: "这次操作不属于当前人物的控制范围。",
  stale_scene: "现场已经改变，需要重新确认在场者。",
  blocked: "这条路线无法通行。",
  occupied: "当前活动尚未结束。",
  body_held: "有人正在搬动或处理这具遗体，需要先停下。",
  digging_tool: "手边缺少适用的挖掘工具。",
  burial_ground: "这里过湿或过硬，需要先把遗体搬到高潮线以上的沙地或林地。",
  burial_water: "这里离取水处太近，不适合掩埋遗体。",
  burial_overlap: "这里已有土堆，需要留出挖掘空间。",
  unavailable: "当前无法接触或使用这个物件。",
  stale: "旅程已更新，请读取当前状态。",
  identity: "操作身份与原请求不一致。",
  missing: "尚未开始旅程。",
  memory_unavailable: "这段经历不在当前可查阅范围内。",
  vector_space: "向量空间或维度不一致。",
  save_failed: "荒岛保存失败，完整候选仍待确认。",
  restart_save_failed: "新旅程没能保存，原存档未改动。请再试一次。",
  save_unconfirmed: "荒岛保存结果尚未确认。",
  save_conflict: "荒岛保存发生冲突。",
  busy: "请先处理正在保存的荒岛操作。",
  materials: "材料的数量或用途不满足这次加工。",
  capacity: "容器空间或携带能力不足。",
  conditions: "现场条件不满足这项活动。",
  wash_item: "先脱下衣物或倒空容器，再用另一处水清洗。",
  wash_volume: "这些水不够清洗选中的整份物品。",
  no_wound: "这里没有需要处理的伤口。",
  care_water: "冲洗伤口需要足量、处理过且没有食物残留的水；先清洗容器并煮水。",
  care_cloth: "需要干燥、清洁且已经拆下的布片。",
  covered_wound: "先拆下原有包扎，再冲洗伤口。",
  care_consent: "先提出照料，等对方停下手里的事并接受。",
  contact_reach: "先走近对方，彼此看得见且中间没有阻挡。",
  contact_offer: "对方已经不在近处，或已收回这次邀请。",
  strike_reach: "对方不在出手可及的距离，或中间有阻挡。",
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
}, fe = (e) => e.startsWith("island_save_") || e === "island_memory_save", _ = [
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
], Q = 6, V = 12, $ = (e, t, r) => ({
  x: e.x + (t.x - e.x) * r,
  y: e.y + (t.y - e.y) * r
});
function M(e, t) {
  return $(e, t, V / Math.hypot(t.x - e.x, t.y - e.y));
}
var k = _.flatMap((e, t) => {
  const r = _[(t + _.length - 1) % _.length], o = _[(t + 1) % _.length], a = M(e, r), s = M(e, o), n = M(o, e), d = [];
  for (let y = 0; y < 6; y++) {
    const g = y / 6;
    d.push($($(a, e, g), $(e, s, g), g));
  }
  const m = n.x - s.x, f = n.y - s.y, b = Math.hypot(m, f), E = Math.ceil(b / Q);
  for (let y = 0; y < E; y++) {
    const g = y / E, A = $(s, n, g), j = Math.sin(Math.PI * g) ** 2, C = e.scallop * j * (0.55 + 0.32 * Math.sin(g * b / 32 + t) + 0.13 * Math.sin(g * b / 11));
    d.push({
      x: A.x + f / b * C,
      y: A.y - m / b * C
    });
  }
  return d;
});
function P(e) {
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
  const r = t.maxX - t.minX > t.maxY - t.minY;
  e.sort((a, s) => r ? a.minX + a.maxX - s.minX - s.maxX : a.minY + a.maxY - s.minY - s.maxY);
  const o = Math.floor(e.length / 2);
  return {
    ...t,
    children: [P(e.slice(0, o)), P(e.slice(o))]
  };
}
var J = P(k.map((e, t) => {
  const r = k[(t + 1) % k.length], o = r.x - e.x, a = r.y - e.y;
  return {
    a: e,
    dx: o,
    dy: a,
    lengthSquared: o * o + a * a,
    minX: Math.min(e.x, r.x),
    maxX: Math.max(e.x, r.x),
    minY: Math.min(e.y, r.y),
    maxY: Math.max(e.y, r.y)
  };
}));
function he(e) {
  let t = 1 / 0;
  function r(a) {
    const s = Math.max(a.minX - e.x, 0, e.x - a.maxX), n = Math.max(a.minY - e.y, 0, e.y - a.maxY);
    return s * s + n * n;
  }
  function o(a, s) {
    if (!(s >= t))
      if ("children" in a) {
        const [n, d] = a.children, m = r(n), f = r(d);
        m < f ? (o(n, m), o(d, f)) : (o(d, f), o(n, m));
      } else for (const n of a.segments) {
        if (r(n) >= t) continue;
        const d = e.x - n.a.x, m = e.y - n.a.y, f = Math.max(0, Math.min(1, (d * n.dx + m * n.dy) / n.lengthSquared));
        t = Math.min(t, (d - f * n.dx) ** 2 + (m - f * n.dy) ** 2);
      }
  }
  return o(J, 0), Math.sqrt(t);
}
var ge = {
  land: k,
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
}, T = 6, Z = 1.5, ee = {
  timeScale: T,
  walkMetresPerSecond: Z / T,
  hearingMetres: 8,
  sightMetres: 35,
  reachMetres: 1.5,
  takeSeconds: 2,
  maxAdvanceSeconds: 3600,
  maxRoutePoints: 64,
  maxSpeechCharacters: 8e3
}, ye = {
  periodSeconds: 12.42 * 3600,
  forageMax: 0.6,
  lowWater: -0.08,
  highWater: 0.65
}, W = "搬动遗体", N = (e) => e >= 60 ? `${Math.ceil(e / 60)} 分钟` : `${Math.max(1, Math.ceil(e))} 秒`, v = {
  embrace: "拥抱",
  handhold: "牵手",
  kiss: "亲吻",
  lean: "依偎"
}, R = {
  push: "推搡",
  punch: "挥拳"
}, l = {
  name: "荒岛",
  category: "生存 · 群像",
  tagline: "七个人，各自活下去",
  entry: "登岛",
  you: "你",
  identity: {
    title: "你是谁",
    name: "姓名",
    namePlaceholder: "别人会怎样称呼你",
    gender: "性别",
    age: "外观年龄",
    agePlaceholder: "选择外观年龄",
    background: "阅历、特长简介",
    optional: "可选",
    backgroundPlaceholder: "做过什么，擅长什么，或不擅长什么……",
    preview: "选择你的模样",
    backgroundCount: (e, t) => `${e} / ${t}`,
    adult: "所有可选身份均为成年人。",
    newJourney: "开始新旅程",
    enter: "以这个身份登岛",
    entering: "正在开启旅程…",
    restart: "确认替换这一局",
    continueEnded: "查看这一局",
    saved: "这一局的你",
    confirmed: "我知道新旅程会替换这一局，无法返回。",
    unreadable: "这一局暂时无法打开，原存档还没有被改动。你可以重新选择身份，确认后开始新旅程。"
  },
  start: "开始旅程",
  resume: "回到岛上",
  restart: "重新开始",
  restartWarning: "重开会结束并替换这一局，无法返回。",
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
  send: "发送",
  thinking: "有人正在回应…",
  stopGm: "停止本轮",
  conversation: "交谈",
  openConversation: "打开交谈",
  closeConversation: "收起交谈",
  conversationNext: "继续",
  requestResponse: "请人物继续回应",
  composeMode: "输入方式",
  canHear: "在交谈范围内",
  sightOnly: "较远",
  latest: "回到最新",
  nearbyPeople: "附近的人",
  viewAll: "查看全部",
  more: "更多",
  surroundings: "环顾四周",
  awaitingResponse: (e) => `${e} 件事等你回应`,
  noTalk: "还没有人开口。",
  noOneNear: "交谈范围内没有人，走近一些才听得见彼此。",
  context: "上下文",
  contextUsage: "交谈上下文用量",
  contextMeasuring: "正在计量…",
  contextUnavailable: "暂时无法计量",
  contextParts: {
    system: "人物与设定",
    rules: "规则与工具",
    story: "现场与近期经历"
  },
  contextTotal: (e, t) => `约 ${(e / 1e3).toFixed(1)}k / ${(t / 1e3).toFixed(1)}k`,
  contextTrimmed: "占用已接近上限：更早的经历不再放进这次交谈，仍可在经历里查看。",
  contextNote: "这是人们下一次回应时会读到的内容量。",
  action: "行动",
  actionPlaceholder: "描述你要做的事……",
  interpretAction: "准备行动",
  interpreting: "正在理解行动…",
  proposedAction: "这一步",
  confirmAction: "执行这一步",
  dismissAction: "放弃这步",
  actionQuestion: "还需要确认",
  actionCost: "会调用当前模型理解意图；确认后才行动。",
  actionUnavailable: "目标已不可用，请放弃这步后重新描述行动。",
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
  declineOffer: "不收",
  offering: (e) => `正递给${c(e)}`,
  offeredBy: (e) => `${c(e)}递来的`,
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
  seaWater: "近处海水",
  washItem: p.wash_item,
  cleanItem: "清洗这件物品",
  cleanliness: {
    clean: "较清洁",
    used: "有使用残留",
    dirty: "脏污",
    unexamined: "还未近看"
  },
  wetItem: "尚湿",
  dryItem: "已干",
  washingNote: "衣物洗后仍湿，放在避雨处随时间晾干；海水只能粗洗。",
  care: "伤口照料",
  woundPart: "处理部位",
  wounds: {
    foot: "足部伤口",
    skin: "身体擦伤"
  },
  treatments: {
    rinse: "冲洗伤口",
    dress: "包扎或换布",
    uncover: "拆下包扎"
  },
  offerCare: "提出照料",
  acceptCare: "接受照料",
  declineCare: "谢绝照料",
  dressing: "包扎在身上",
  careNote: "清理和包扎不会立即治愈，仍需要休息与食水。",
  noCareCloth: "没有干燥、清洁的布片。",
  careCloth: "包扎用布",
  careOfferedBy: (e) => `${c(e)}提出照料`,
  careWaiting: "等对方决定是否接受。",
  careBusy: "先停下当前活动，再接受照料。",
  contactNames: v,
  strikeNames: R,
  offerContact: "提出亲近",
  acceptContact: "接受",
  declineContact: "婉拒",
  releaseContact: "松开",
  withdrawContact: "收回邀请",
  contactOfferedBy: (e, t) => `${c(e)}想与你${v[t]}`,
  contactWith: (e, t) => `与${c(e)}${v[t]}`,
  contactWaiting: "等对方决定是否接受。",
  contactBusy: "先停下手里的事，再接受。",
  conflict: "冲突",
  guard: "停下并护住自己",
  strikeWarning: "出手会伤人、消耗体力，也可能遭到反击。伤势会保留在本局。",
  confirmStrike: "确认出手",
  threat: (e) => `${c(e)}正向你出手`,
  strikeOutcome: {
    missed: "落空了",
    blocked: "被挡住了",
    hit: "击中了对方"
  },
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
  pour: p.pour,
  emptyLiquid: p.empty,
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
  skinWound: "身体擦伤",
  infection: "伤口不适",
  illness: "身体不适",
  dead: "旅程到此为止",
  deadDetail: "你没能活下来。这一局已结束，留下的是你经历过的事。",
  remains: "遗体",
  dragBody: W,
  coverBody: p.cover_body,
  covering: "遮盖在遗体上",
  dragDestination: (e) => `搬动${c(e)}的遗体：选择要走到的地面`,
  coverMaterial: "用来遮盖的衣物或枝叶",
  noCoverMaterial: "手边没有脱下的衣物、布片或棕榈叶。",
  bodyHandlingNote: "拖移较慢，也更耗体力；随身物件与遮盖物会一起移动。",
  grave: "隆起的土堆",
  burialNote: "在遗体所在处掩埋，需干燥高地并远离水源。随身物件一起埋入，挖开后才能取回。",
  exhumationNote: "挖开后，埋在下面的遗体和物件会重新露出。",
  diggingTool: "挖掘工具",
  noDiggingTool: `手边没有能挖掘的${B.diggingTools.map((e) => w[e].name).join("或")}。`,
  remainsCondition: {
    fresh: "尚未明显变化",
    changing: "遗体已开始腐败",
    weathered: "遗体已风化"
  },
  odor: {
    none: "",
    noticeable: "周围有异味，休息不太安稳。",
    strong: "周围异味很重，难以安歇。"
  },
  flies: "附近有蝇虫。",
  fadedTrace: "痕迹正在变淡",
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
  mapLabel: "岛上现场，点击地面、方向键或摇杆移动",
  move: "移动",
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
    with: `我愿意支持${c(e)}。`,
    against: `我不赞同${c(e)}，不再站在同一边。`,
    neutral: `对${c(e)}，我暂不站队。`
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
  proposalBy: (e, t) => `${c(e, t)}的提议`,
  through: (e) => e === "player" ? "本人" : `听自${c(e)}`,
  quote: (e, t) => `${c(e.actor, t)}的${e.choice.kind === "proposal" ? "提议" : "回应"}：「${e.text}」`,
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
  duration: (e) => `岛上约 ${N(e)} · 现实约 ${N(e / ee.timeScale)}`,
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
  injuryFeelings: {
    skin: ["没有明显擦伤", "擦伤仍在，需要照料"],
    infection: [
      "没有明显发炎不适",
      "伤处不适加重",
      "伤处明显恶化"
    ],
    illness: [
      "没有明显不适",
      "身体不舒服",
      "明显虚弱不适"
    ]
  },
  sip: p.sip,
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
  fireBurning: "火在燃烧",
  fireUnlit: "未点燃",
  fireNeedsFuel: "先添入燃料",
  fuelTime: (e) => `现有燃料约可燃烧 ${Math.ceil(e / 60)} 分钟`,
  active: {
    travel: "行走",
    drag: W,
    rest: "休息",
    take: "拾取",
    work: "劳作",
    construct: "施工",
    offer: "递出物品，等对方接过",
    offer_care: "提出照料，等待回应",
    receive_care: "接受照料",
    offer_contact: "提出亲近，等待回应",
    contact: "亲近相伴",
    strike: "出手",
    guard: "护住自己"
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
};
function c(e, t) {
  return e === "player" ? t ?? l.you : K[e].name;
}
function pe(e, t = null) {
  return e === "work" && t ? p[t] : e ? l.active[e] : l.idle;
}
function _e(e, t, r) {
  const o = (a) => c(a, r);
  switch (e.kind) {
    case "speech":
      return e.text;
    case "declaration":
      return t ? `${e.text}
${l.quote(t, r)}` : e.text;
    case "intention":
      return e.text;
    case "encounter":
      return `${o(e.actor)}看见了${o(e.subject)}。`;
    case "started":
      return `${o(e.actor)}开始${l.active[e.activity]}。`;
    case "departed":
      return `${o(e.actor)}动身离开。`;
    case "arrived":
      return `${o(e.actor)}停下脚步。`;
    case "rested":
      return `${o(e.actor)}结束了休息。`;
    case "interrupted":
      return `${o(e.actor)}停下了手里的事。`;
    case "taken":
      return `${o(e.actor)}拾起一件物品。`;
    case "offered":
      return `${o(e.actor)}向${o(e.to)}递出${w[e.form].name} × ${e.units}。`;
    case "received":
      return `${o(e.actor)}接过${o(e.from)}递来的${w[e.form].name} × ${e.units}。`;
    case "offer_declined":
      return `${o(e.actor)}没有收下${o(e.from)}递来的东西。`;
    case "care_offered":
      return `${o(e.actor)}提出为${o(e.to)}${l.treatments[e.treatment]}。`;
    case "care_response":
      return `${o(e.actor)}${e.accepted ? "接受" : "谢绝"}了${o(e.from)}的照料。`;
    case "contact_offered":
      return `${o(e.actor)}提出与${o(e.to)}${v[e.form]}。`;
    case "contact_response":
      return `${o(e.actor)}${e.accepted ? "接受" : "婉拒"}了${o(e.from)}的${v[e.form]}邀请。`;
    case "contact_ended":
      return `${o(e.actor)}与${o(e.with)}结束了${v[e.form]}。`;
    case "strike_started":
      return `${o(e.actor)}向${o(e.to)}${R[e.form]}。`;
    case "strike_resolved":
      return `${o(e.actor)}对${o(e.to)}的${R[e.form]}${l.strikeOutcome[e.outcome]}。`;
    case "tended":
      return `${o(e.actor)}为${e.actor === e.subject ? "自己" : o(e.subject)}完成了${l.wounds[e.wound]}的${l.treatments[e.treatment]}。`;
    case "poured":
      return e.to === null ? `${o(e.actor)}倒掉了 ${e.millilitres} ml 液体。` : `${o(e.actor)}把 ${e.millilitres} ml 液体倒入了另一只容器。`;
    case "dropped":
      return `${o(e.actor)}放下一件物品。`;
    case "worn":
    case "unworn":
      return `${o(e.actor)}调整了穿戴。`;
    case "take_unavailable":
      return `${o(e.actor)}没能拿到那件物品。`;
    case "contested":
    case "resource_contested":
    case "site_contested":
      return `${e.actors.map(o).join("和")}同时伸手，事情暂时停了下来。`;
    case "died":
      return `${o(e.actor)}没能撑过来。`;
    case "noticed_body":
      return `${o(e.actor)}发现了${o(e.subject)}的遗体。`;
    case "body_handling":
      return e.stage === "started" ? `${o(e.actor)}开始搬动${o(e.subject)}的遗体。` : `${o(e.actor)}放下了${o(e.subject)}的遗体。`;
    case "body_covered":
      return `${o(e.actor)}遮盖了${o(e.subject)}的遗体。`;
    case "body_buried":
      return `${o(e.actor)}掩埋了${o(e.subject)}的遗体。`;
    case "body_exhumed":
      return `${o(e.actor)}挖开土堆，露出了${o(e.subject)}的遗体。`;
    case "discovered":
      return `${o(e.actor)}发现了${e.subject.kind === "resource" ? H[e.subject.form].name : Y[e.subject.form].name}。`;
    case "worked":
      return `${o(e.actor)}完成了${e.task === "craft" && e.target && Object.hasOwn(O, e.target) ? O[e.target].name : p[e.task]}。`;
    case "work_failed":
      return `${o(e.actor)}的工作停了下来：${te({ code: e.reason })}`;
    case "need":
      return `${o(e.actor)}感到${{
        thirst: l.thirst,
        hunger: l.hunger,
        fatigue: l.fatigue,
        bladder: "需要小便",
        bowel: "需要排便",
        wound: "脚痛",
        infection: "伤口不适加重",
        illness: "身体不适加重",
        hygiene: "身上脏污难受"
      }[e.need]}。`;
    case "accident":
      return `${o(e.actor)}没能及时处理便意，需要清洁。`;
  }
}
function te(e) {
  const t = e;
  return z[t?.code?.replace(/^island_/, "")] ?? t?.message ?? l.error;
}
export {
  ce as A,
  O as C,
  re as D,
  u as E,
  ae as O,
  ie as S,
  B as T,
  se as _,
  c as a,
  w as b,
  ye as c,
  fe as d,
  K as f,
  Y as g,
  le as h,
  _e as i,
  I as j,
  p as k,
  he as l,
  me as m,
  pe as n,
  ge as o,
  de as p,
  te as r,
  ee as s,
  l as t,
  z as u,
  ne as v,
  H as w,
  oe as x,
  x as y
};
