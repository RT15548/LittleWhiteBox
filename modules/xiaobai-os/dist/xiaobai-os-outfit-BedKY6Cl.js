/* eslint-disable */
var t = Object.freeze({
  chapterReward: 50,
  challengeFee: 50,
  challengePrize: 100,
  challengeWinsPerTier: 3,
  challengeMinimumPeak: 6,
  candidateLimit: 8192
}), s = {
  hard: "高难",
  expert: "专家",
  extreme: "极限"
}, i = {
  name: "小白搬家",
  category: "收纳",
  tagline: "留点空位，把小屋慢慢搬空",
  description: "同类三件打包，空位留给下一步。",
  entry: "两章 · 3D 解谜",
  mark: "搬",
  chapters: "两间小屋",
  close: "收起",
  cancel: "取消",
  confirm: "确定",
  restart: "重新收拾",
  undo: "撤回一步",
  rules: "怎么玩",
  soundOn: "声音开",
  soundOff: "声音关",
  soundUnavailable: "当前浏览器不支持游戏声音。",
  soundFailed: "声音没能打开，可再次尝试。",
  soundSaveFailed: "声音设置没有保存，稍后再试。",
  rotateLeft: "向左转",
  rotateRight: "向右转",
  resetView: "回正视角",
  zoomIn: "近一点",
  zoomOut: "远一点",
  rotateHint: "从上往下拆垛 · 拖动转视角",
  tray: "待打包架",
  emptySlot: "空位",
  pickList: "看物件",
  pickListTitle: "从上往下收拾",
  noItems: "转个角度，看看最上面的物件。",
  progress: (e, a) => `已搬 ${e} / ${a} 箱`,
  progressLabel: "打包进度",
  stage: (e) => `第 ${e + 1} 关`,
  tierProgress: (e) => e.nextTier ? `累计通关 ${e.wins} 次 · 再赢 ${e.winsToNext} 局升至${s[e.nextTier]}` : `累计通关 ${e.wins} 次 · 最高档无限随机`,
  tierRule: `每累计通关 ${t.challengeWinsPerTier} 次升一档，升至最高档后保持。失败或放弃不降档。`,
  nextTier: (e) => `下一局 · ${s[e]}`,
  item: (e, a) => `收拾${e} ${a}`,
  slot: (e, a) => `第 ${a + 1} 格：${e}`,
  slots: (e, a) => `暂存 ${e} / ${a}`,
  packed: (e) => `${e}打包好啦，空位腾出来了。`,
  selected: (e) => `${e}暂时放在架上。`,
  won: "这间屋子，收拾好啦！",
  lost: "暂存架满了",
  abandoned: "本次搬家已放弃",
  lostBody: "撤回一步，换个收拾顺序。",
  next: "下一关",
  chapterComplete: "去魔女的厨房",
  restartTitle: "从头收拾？",
  discard: "这一关从头开始，首通奖励不会重复发放。",
  sessionNote: "进度自动保存。关窗、刷新或换聊天，都可以回来继续。",
  instructions: [
    "物件一层层压着，先拿走最上面的，才能拿下一层。",
    "七格架子只做暂存；同类三件自动打包，把空位腾出来。",
    "拿第三件之前，先看看要清掉哪些杂物，空位够不够。",
    "填满架子仍凑不成三件，本局结束。转视角可以观察，但不能从下面抽物件。"
  ],
  loading: "正在取出搬家记录…",
  generating: "正在寻找一间够难的小屋…",
  graphicsFailed: "立体小屋没有成功打开。请检查浏览器的硬件加速，再重试。",
  contextLost: "三维画面连接中断了。当前局还在，重新打开画面即可继续。",
  retryGraphics: "重新打开画面",
  sceneLabel: "立体小屋，拖动旋转，从上方轻点物件；左右方向键旋转",
  lobby: "返回大厅",
  backChapters: "回到两间小屋",
  resume: "继续收拾",
  abandon: "放弃本局",
  abandonTitle: "确定放弃这次挑战？",
  abandonBody: `报名费 ${t.challengeFee} 不退还。只是暂时离开，可以关窗，下次接着玩。`,
  paidLost: `本局结束，报名费 ${t.challengeFee} 不退还。`,
  admissionTitle: (e) => `报名${s[e]}挑战`,
  admission: `报名 ${t.challengeFee}`,
  admissionBody: `报名扣 ${t.challengeFee} 小白币；通关到账 ${t.challengePrize}，净赚 ${t.challengePrize - t.challengeFee}。失败或主动放弃不退费，无撤回、无免费重开。`,
  paidRule: "无撤回 · 关窗可续玩",
  challengeLocked: "完成第一章后开放",
  chapterOne: "第一章",
  chapterTwo: "第二章",
  firstReward: `每关首次通关 +${t.chapterReward}`,
  earned: "首通已领取",
  reward: (e) => `小白币 +${e}`,
  balance: (e) => `余额 ¤ ${e}`,
  challengeTerms: `报名 ${t.challengeFee} · 通关 ${t.challengePrize}`,
  paidActive: "先完成或放弃正在进行的挑战。",
  saved: "已保存",
  saving: "正在保存…",
  recover: "检查并恢复本次操作",
  refresh: "重新读取",
  saveProblem: "这一步还没确认保存，先检查结果。不会重复扣费或换题。",
  conflict: "存档存在冲突，暂时不能继续。请重新打开小白 OS 核对。",
  genericError: "这次操作没有完成，请检查结果后重试。",
  noFunds: `至少需要 ${t.challengeFee} 小白币才能报名。`,
  storyBusy: "故事正在回复，结束后可以继续收拾。",
  shelf: (e) => `第 ${e + 1} 垛`,
  underneath: "上面还有物件",
  available: "可搬走"
}, r = {
  cat: "猫猫摆件",
  toast: "厚吐司",
  ufo: "小飞碟",
  cup: "胖杯子",
  duck: "小黄鸭",
  plant: "盆栽",
  potion: "魔药瓶",
  star: "小星星"
}, c = {
  weekend: "猫咪的小屋",
  witch: "魔女的厨房"
}, l = {
  finished: "这一局已经结束。",
  missing: "这件东西已经收走了。",
  blocked: "上面还压着物件，先从最上面收拾。"
}, o = {
  ...l,
  locked: i.challengeLocked,
  active: i.paidActive,
  noUndo: "还没有可以撤回的一步。",
  paidRule: i.paidRule,
  stale: "这一局有了新变化，请重新读取。",
  identity: "页面已切换，请重新打开游戏。",
  invalid: "搬家记录未通过校验，请检查存档。",
  generation: "没有生成合格的挑战，本次未扣费，请重试。",
  funds: i.noFunds,
  unavailable: "正在处理其他操作，请稍后再试。"
};
function d(e) {
  const a = e && typeof e == "object" && "code" in e ? String(e.code) : e instanceof Error ? e.message : "";
  return a.startsWith("moving_save_") || a === "host_request_timeout" ? i.saveProblem : a === "moving_generation_exhausted" ? o.generation : o[a.replace(/^moving_/, "")] ?? i.genericError;
}
var n = {
  cap: "#377f83",
  seam: "#9ed3cf",
  vest: "#e79258",
  stripe: "#fff0c6",
  pocket: "#ba6744",
  glove: "#f1eadb"
}, p = [
  {
    shape: "ball",
    size: [
      0.32,
      0.108,
      0.275
    ],
    at: [
      0,
      0.405,
      -0.025
    ],
    color: n.cap
  },
  {
    shape: "ball",
    size: [
      0.29,
      0.025,
      0.2
    ],
    at: [
      0,
      0.36,
      0.205
    ],
    color: n.cap
  },
  {
    shape: "box",
    size: [
      0.06,
      0.025,
      0.28
    ],
    at: [
      0,
      0.508,
      -0.025
    ],
    color: n.seam
  },
  {
    shape: "box",
    size: [
      0.082,
      0.055,
      0.022
    ],
    at: [
      0,
      0.414,
      0.256
    ],
    color: n.stripe
  },
  ...[-1, 1].map((e) => ({
    shape: "ball",
    size: [
      0.13,
      0.17,
      0.073
    ],
    at: [
      e * 0.16,
      -0.075,
      0.206
    ],
    color: n.vest
  })),
  ...[-1, 1].map((e) => ({
    shape: "box",
    size: [
      0.11,
      0.025,
      0.026
    ],
    at: [
      e * 0.16,
      -0.065,
      0.277
    ],
    color: n.stripe
  })),
  ...[-1, 1].map((e) => ({
    shape: "box",
    size: [
      0.075,
      0.06,
      0.022
    ],
    at: [
      e * 0.16,
      -0.174,
      0.263
    ],
    color: n.pocket
  })),
  ...[-1, 1].map((e) => ({
    shape: "ball",
    size: [
      0.068,
      0.085,
      0.074
    ],
    at: [
      e * 0.288,
      -0.015,
      0.295
    ],
    color: n.glove
  })),
  ...[-1, 1].map((e) => ({
    shape: "ball",
    size: [
      0.06,
      0.035,
      0.065
    ],
    at: [
      e * 0.292,
      -0.078,
      0.272
    ],
    color: n.cap
  }))
];
export {
  l as a,
  t as c,
  i,
  s as n,
  c as o,
  r,
  d as s,
  p as t
};
