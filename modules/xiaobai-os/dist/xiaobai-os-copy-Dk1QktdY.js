/* eslint-disable */
var g = [
  "blade",
  "bow",
  "staff",
  "daggers",
  "grimoire",
  "cannon"
], k = [
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
  "voidknight"
], v = [
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
], w = [
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
], i = Object.freeze({
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
}), _ = Object.freeze({
  resonanceTicks: 90,
  maxPower: 100,
  familiarHp: 38,
  damage: 10,
  empoweredDamage: 17,
  attackTicks: 32,
  empoweredAttackTicks: 20
}), $ = {
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
}, x = v, S = g, l = Object.freeze({
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
}), r = (e, a, t, u, p, f, h) => ({
  hp: e,
  speed: a,
  radius: t,
  damage: u,
  reach: p,
  windup: f,
  cooldown: h
}), y = {
  soldier: r(48, 0.083, 0.4, 11, 1.45, 19, 35),
  archer: r(36, 0.058, 0.36, 10, 11, 26, 55),
  guard: r(95, 0.057, 0.58, 18, 2, 32, 65),
  priest: r(58, 0.035, 0.42, 8, 12, 35, 110),
  charger: r(65, 0.076, 0.48, 16, 12, 32, 80),
  stalker: r(46, 0.12, 0.35, 10, 1.25, 16, 44),
  bomber: r(55, 0.047, 0.42, 15, 13, 28, 82),
  wisp: r(30, 0.062, 0.3, 8, 10, 22, 60)
}, m = {
  warden: {
    ...r(1050, 0.055, 1.25, 21, 20, 34, 32),
    region: 0,
    awardKey: "boss-0"
  },
  thornheart: {
    ...r(1e3, 0.043, 1.3, 18, 20, 30, 35),
    region: 0,
    awardKey: "boss-thornheart"
  },
  weaver: {
    ...r(1450, 0.07, 1.1, 19, 20, 30, 31),
    region: 1,
    awardKey: "boss-1"
  },
  astrologer: {
    ...r(1400, 0.035, 1.1, 22, 20, 36, 32),
    region: 1,
    awardKey: "boss-astrologer"
  },
  king: {
    ...r(2050, 0.09, 1.4, 25, 20, 25, 23),
    region: 2,
    awardKey: "boss-2"
  },
  phoenix: {
    ...r(1750, 0.075, 1.2, 22, 20, 30, 28),
    region: 2,
    awardKey: "boss-phoenix"
  },
  forgemaster: {
    ...r(1100, 0.048, 1.25, 23, 20, 38, 35),
    region: 3,
    awardKey: "boss-forgemaster"
  },
  colossus: {
    ...r(1250, 0.036, 1.5, 25, 20, 42, 38),
    region: 3,
    awardKey: "boss-colossus"
  },
  frostqueen: {
    ...r(1450, 0.062, 1.05, 19, 20, 32, 28),
    region: 4,
    awardKey: "boss-frostqueen"
  },
  leviathan: {
    ...r(1550, 0.072, 1.4, 23, 20, 34, 32),
    region: 4,
    awardKey: "boss-leviathan"
  },
  archivist: {
    ...r(1900, 0.04, 1.15, 21, 20, 34, 25),
    region: 5,
    awardKey: "boss-archivist"
  },
  voidknight: {
    ...r(1850, 0.1, 1.05, 24, 20, 26, 25),
    region: 5,
    awardKey: "boss-voidknight"
  }
}, C = {
  ...y,
  ...m
};
function E(e) {
  return Object.hasOwn(m, e);
}
var A = [
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
], s = Object.freeze({
  city: "赤炉城",
  begin: "开始旅程",
  chapters: "篇章",
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
  nextChapter: "第二章",
  forthcoming: "待续",
  chooseChapter: "选择篇章",
  chooseWeapon: "选择职业",
  controls: "操作",
  equipment: "遗物",
  identityRole: "外地旅人",
  currentChapter: "正在经历",
  completeChapter: "已完成",
  newJourney: "新的旅程",
  restartWarning: "开始新的旅程会替换当前进度、遗物与人物交谈，无法撤销。已拥有的衣装和钱包权益保留。",
  confirmRestart: "确认开始新的旅程",
  entering: "正在启程…",
  loading: "正在读取旅程…"
}), O = {
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
  alarm_silenced: "烽火没点起来，内堡的援兵不会来。",
  captives_released: "旅人打开牢门，扣子与阿念暂留安全处等候接应。",
  postern_opened: "旅人打开牢房小门，营地与牢房之间的捷径永久畅通。",
  receiving_arranged: "老白带担架队守在营地小门，三娘留出了两张床。",
  captives_arrived: "两名受困者已由担架队接回营地。",
  warden_defeated: "门厅守卫倒了，主闸松开。",
  supplies_secured: "旅人核对并接收了哨站归还的药材和冷却管件。",
  roots_cleared: "旅人清除了根庭的荆棘之心，外墙旧庭恢复通行。",
  chapter_completed: "哨站救援结束。营火旁多了两个人，内堡深处的路仍未开启。",
  clinic_helped: "旅人与三娘整理诊棚和归还的药材，陪三娘在门边歇了一会儿。"
}, n = Object.freeze({
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
  fallenDetail: "从这场战斗开始的位置、生命和构筑重试。已完成的救援和已取得的奖励不会丢失。",
  retreat: "返回营地整备",
  reward: "拾起余烬",
  rewardDetail: "选择一件遗物收入收藏。营地可以重新搭配，已收集的遗物不会因卸下而消失。",
  skip: "暂不拾取",
  equipped: "已装配",
  stored: "收入收藏",
  emptyBuild: "战斗后可获得遗物。",
  safeBuild: "回到营地可调整装配。",
  safeWardrobe: "回到营地可更换衣装。",
  slots: (e, a) => `装配 ${e} / ${a}`,
  takeOff: "卸下",
  putOn: "装配",
  loadoutIssue: {
    capacity: "装配已满，先卸下一件遗物。",
    dependency: "这组搭配缺少触发条件；先调整依赖它的遗物。"
  },
  received: "小门外传来担架落地的轻响。三娘掀开诊棚的帘子。阿念抱着泡皱的货签坐下，扣子避开伸来的手，自己找了个高处。老白把门闩推回去，低头翻了翻那本没有看的签本。人回来了。",
  waiting: "牢门已开。他们暂时留在安全处，等小门打开、营地接应到位。",
  rescueAlarm: "牢门的锁链惊动了守军。烽火未熄，内堡将多出一队援兵；你仍可以回头截断信号。",
  alarm: "烽火传讯",
  alarmRaised: "内堡增援已集结",
  alarmSeconds: (e) => `距离传讯 ${e} 秒`,
  endingTitle: "归来的人",
  ending: `归还的药材堆在诊棚桌上。三娘一份份核对，没有按签上的户名把它们分开。阿念被安排在帘边坐着，有人叫她，她才抬起头。扣子蹲在管架上，伸手试了试新接头；老白仍站在小门边。

这一次，两个人都回来了。可药签照旧按人头发，照旧会过期。檐下的名字依然不在内堡的册子里。门厅之后还有一扇门，古炉仍在变冷。`,
  continued: `${s.nextChapter}${s.forthcoming}`,
  remain: "留在檐下",
  optional: "根庭仍可探索；营地的人也还有话想说。",
  talk: "交谈",
  send: "发送",
  cancel: "停止等待",
  input: "你想说什么？",
  player: "你",
  thinking: "对方正在回应…",
  aiUnknown: "这次交谈的结果尚未确认，不会自动再次调用模型。先核对存档；若没有收到回复，重新发送会产生新调用。",
  noAi: "请先在小白 OS 设置中配置 AI，再进行自由交谈。",
  aiAuth: "AI 服务未通过身份验证，请在小白 OS 的 AI 设置中检查密钥与连接配置。输入已保留。",
  aiFailed: "AI 服务调用失败，未取得可保存的回复。输入已保留，不会自动重试；重新发送会产生新调用。",
  emptyReply: "这次没有取得有效对白。可查看交谈记录中的原文；不会自动重发。",
  receivedReply: "查看未保存的回复原文",
  contextFull: "当前输入仍超出上下文预算。原记录完整保留，没有调用新的对话回复。",
  memoryFailed: "记忆整理未完成，原记忆与记录未替换。不会自动重试付费请求。",
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
}), b = {
  crossroads: "岔口有巡兵守着。过了这里，正门和水道才走得通。",
  gate: "八斤的盾排开了。冲过去，烽火台就在后头。",
  beacon: "守军护着火盆。别让那堆火烧起来。",
  waterway: "看守蹲在闸门边。把闸抢回来。",
  hall: "门厅守卫守着主闸。药和管件都压在闸后。",
  roots: "荆棘之心在地底下动。地面鼓起来时，往旁边让。"
};
function R(e) {
  const a = b[e.location.scene];
  if (e.phase === "battle" && a) return a;
  const t = new Set(e.facts);
  return t.has("briefed") ? t.has("chapter_completed") ? n.optional : t.has("crossroads_cleared") ? t.has("captives_released") ? t.has("postern_opened") ? t.has("receiving_arranged") ? t.has("captives_arrived") ? t.has("warden_defeated") ? t.has("supplies_secured") ? "回三娘那儿，把这趟收尾。" : "回营，到诊棚东边的货车上点一点还回来的东西。" : "去内堡门厅。药和管件压在主闸后头。" : "从小门回营，担架队会把人抬回来。" : "回营找老白，让他把担架摆到小门。" : "牢房东南角有扇小门，打开它，回营就不用绕。" : "走正门上烽火台，或者下旧水道直奔牢房。" : "沿营地北路去外墙岔口。" : n.beginning;
}
var d = ["余烬", "远征"], o = {
  titleFirst: d[0],
  titleSecond: d[1],
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
  name: n.title,
  category: "冒险",
  tagline: s.city,
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
  slots: (e) => `${e} / ${i.relicSlots} 遗物`,
  replace: "选择要替换的遗物",
  requiredRelic: "这件遗物是新遗物的触发来源，不能替换。",
  discard: "放弃奖励",
  cancel: "取消",
  confirm: "确认",
  rest: "休整",
  restDetail: (e) => `恢复 ${e} 生命`,
  shrine: "献祭",
  sacrifice: `献出 ${i.sacrificeHp} 生命，换取一件遗物`,
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
  secondsLeft: (e) => `${(e / i.hz).toFixed(1)}秒`,
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
  survive: (e) => `坚守 ${Math.ceil(e / i.hz)} 秒`,
  reinforcement: (e) => `增援 ${Math.ceil(e / i.hz)} 秒`,
  unlockWeapon: (e) => `击败${e}后解锁`,
  unlockCloak: (e) => `击败第 ${e} 位首领后解锁`,
  sound: "声音",
  help: "操作",
  close: "关闭",
  progress: (e, a) => `${e} · ${a + 1} / ${i.zoneSteps}`,
  wave: (e, a) => `第 ${e} / ${a} 波`,
  bossPhase: (e) => `阶段 ${e}`,
  gold: (e) => `本局累计到账 ${e} 小白币`,
  wallet: (e) => `小白币 ${e}`,
  earned: (e) => `获得 ${e} 小白币`,
  newUnlocks: (e) => `已解锁：${e.join(" · ")}`,
  stats: (e, a) => `${e} 击败 · ${Math.floor(a / i.hz / 60)}:${String(Math.floor(a / i.hz) % 60).padStart(2, "0")}`,
  journalEmpty: "完成一次远征后，战绩会留在这里。",
  unknown: "未发现",
  rewardRule: `首领首胜各 ${i.firstBossAward} 币 · 首次通关 ${i.firstVictoryAward} 币 · 每种武器首次通关 ${i.masteryAward} 币 · 每条誓约首次通关 ${i.oathAward} 币`,
  checkpoint: "战斗自动保存；意外关闭后，从最近一次已确认进度继续。",
  lootPool: `遗物按职业适配。最多携带 ${i.relicSlots} 件，同一遗物能逐章强化至 ${i.maxRelicRank} 阶；部分组合需要先获得基础遗物。`,
  mastered: "已通关",
  unlocked: "已解锁",
  healthCost: "生命不足，无法献祭",
  noShards: "碎晶不足"
}, T = {
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
}, c = {
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
}, I = (e) => `${c[e].action}：${c[e].skill}`, P = {
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
}, F = {
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
    detail: `保护中央烽火，击败守军。${o.beaconRule}。`
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
}, q = {
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
    detail: `所有伤害提高，但受到伤害增加 ${Math.round((l.bloodHurt - 1) * 100)}%。强化继续提高输出。`,
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
    detail: `距离超过 ${l.hunterRange} 步的远程命中伤害增加。强化提高远距伤害。`,
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
    detail: `每击败 ${l.siphonEvery} 名敌人恢复生命；击败首领恢复更多。强化增加恢复量。`,
    family: "生"
  },
  focus: {
    name: "澄明",
    detail: `技能冷却缩短，但普攻间隔延长 ${Math.round((l.focusAttack - 1) * 100)}%。强化进一步缩短技能冷却。`,
    family: "技"
  },
  renewal: {
    name: "归途灯",
    detail: "取得或强化遗物时恢复生命，击败首领额外恢复。强化增加恢复量。",
    family: "生"
  },
  execution: {
    name: "断章",
    detail: `对生命低于 ${l.executeThreshold * 100}% 的敌人伤害提高。强化增加斩杀伤害。`,
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
function D(e) {
  const a = e && typeof e == "object" && "code" in e ? String(e.code) : e instanceof Error ? e.message : "";
  return a === "expedition_agent_not_configured" ? n.noAi : a === "expedition_agent_auth" ? n.aiAuth : a === "expedition_agent_failed" ? n.aiFailed : a === "expedition_context_capacity" ? n.contextFull : a === "expedition_data_invalid" ? n.dataInvalid : a === "expedition_narrative_unavailable" ? n.narrativeFailed : a.startsWith("expedition_memory_") ? n.memoryFailed : a.startsWith("expedition_reply_") ? n.emptyReply : a === "expedition_stale" ? o.stale : a === "expedition_locked" ? o.locked : a === "expedition_funds" ? o.noCoins : a === "expedition_unavailable" ? o.unavailable : a === "expedition_invalid" || a === "expedition_identity" ? o.invalid : a.startsWith("expedition_save_") || a.startsWith("host_request_") ? o.saveError : o.failure(a);
}
export {
  w as C,
  k as S,
  l as _,
  c as a,
  S as b,
  n as c,
  s as d,
  m as f,
  x as g,
  A as h,
  q as i,
  O as l,
  C as m,
  P as n,
  D as o,
  _ as p,
  T as r,
  I as s,
  o as t,
  R as u,
  i as v,
  E as x,
  $ as y
};
