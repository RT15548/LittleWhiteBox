/* eslint-disable */
var p = {
  fee: 50,
  habitableAward: 50,
  collectionSize: 6,
  seedAttempts: 64,
  maxParts: 40,
  maxWidth: 6,
  maxDepth: 3
}, ae = [
  "courtyard",
  "duplex",
  "terrace",
  "sunroom"
], E = {
  courtyard: {
    floors: 1,
    living: 2,
    materials: 7,
    award: 100
  },
  duplex: {
    floors: 2,
    living: 4,
    materials: 9,
    award: 140
  },
  terrace: {
    floors: 3,
    living: 5,
    materials: 11,
    award: 200
  },
  sunroom: {
    floors: 2,
    living: 2,
    materials: 12,
    award: 140
  }
}, oe = "sunroom", k = {
  hall: {
    width: 1,
    cost: 0
  },
  entry: {
    width: 1,
    cost: 0
  },
  room: {
    width: 1,
    cost: 1
  },
  study: {
    width: 1,
    cost: 2
  },
  wide: {
    width: 2,
    cost: 2
  },
  terrace: {
    width: 1,
    cost: 1
  },
  garden: {
    width: 1,
    cost: 1
  },
  path: {
    width: 1,
    cost: 0
  },
  roof: {
    width: 1,
    cost: 0
  }
}, O = [
  "room",
  "wide",
  "study",
  "garden",
  "path",
  "terrace"
];
function se(e) {
  return e.heights.flatMap((n, a) => Array.from({ length: n }, (r, t) => ({
    x: a % e.width,
    y: t,
    z: Math.floor(a / e.width)
  })));
}
function j(e, n, a) {
  return e.heights[a * e.width + n];
}
var ie = {
  width: 1.3,
  height: 1.12,
  depth: 1.15
};
function S(e) {
  return e === "room" || e === "wide" || e === "study";
}
function v(e) {
  return e === "entry" || e === "hall" || S(e);
}
function l(e) {
  return `${e.x}:${e.y}:${e.z}`;
}
function y(e) {
  return Array.from({ length: k[e.kind].width }, (n, a) => ({
    x: e.x + a,
    y: e.y,
    z: e.z
  }));
}
var F = ["room", "room"], Z = O.filter((e) => e !== "path");
function H(e, n) {
  return Object.fromEntries(Z.map((a) => [a, e.owned.filter((r) => r === a).length - n.filter((r) => r.kind === a).length]));
}
function le(e, n) {
  return Object.values(H(e, n)).every((a) => a >= 0);
}
function b(e) {
  return [
    {
      ...e,
      x: e.x - 1
    },
    {
      ...e,
      x: e.x + 1
    },
    {
      ...e,
      z: e.z - 1
    },
    {
      ...e,
      z: e.z + 1
    }
  ];
}
function w(e) {
  const n = /* @__PURE__ */ new Map();
  for (const a of e) for (const r of y(a)) n.set(l(r), a);
  return n;
}
function P(e, n, a = {
  x: e.entrance,
  y: 0,
  z: e.entryZ
}) {
  const r = w(n), t = V(e, n), o = l(a), s = /* @__PURE__ */ new Map();
  if (!r.has(o) || r.get(o).kind === "roof") return s;
  const u = [a];
  s.set(o, null);
  for (let h = 0; h < u.length; h++) {
    const m = u[h], i = l(m), d = b(m);
    t.has(i) && d.push({
      ...m,
      y: m.y + 1
    }), t.has(l({
      ...m,
      y: m.y - 1
    })) && d.push({
      ...m,
      y: m.y - 1
    });
    for (const c of d) {
      const f = l(c), x = r.get(f);
      x && x.kind !== "roof" && !s.has(f) && (s.set(f, i), u.push(c));
    }
  }
  return s;
}
function M(e, n) {
  return P(e, n);
}
function de(e, n, a, r) {
  const t = P(e, n, r);
  let o = l(a);
  if (!t.has(o)) return [];
  const s = [];
  for (; o !== null; ) {
    const [u, h, m] = o.split(":").map(Number);
    s.unshift({
      x: u,
      y: h,
      z: m
    }), o = t.get(o);
  }
  return s;
}
function V(e, n) {
  const a = w(n), r = /* @__PURE__ */ new Set(), t = /* @__PURE__ */ new Set();
  for (const o of n.filter((s) => s.y > 0 && s.kind !== "roof").flatMap(y)) {
    if (t.has(l(o))) continue;
    const s = [o];
    t.add(l(o));
    for (let i = 0; i < s.length; i++) for (const d of b(s[i])) {
      const c = l(d), f = a.get(c);
      f && f.kind !== "roof" && !t.has(c) && (t.add(c), s.push(d));
    }
    const u = s.map((i) => ({
      ...i,
      y: i.y - 1
    })).filter((i) => {
      const d = a.get(l(i));
      return d && v(d.kind);
    }), h = (i) => ["hall", "entry"].includes(a.get(l(i)).kind) ? 0 : 1, m = (i) => Math.abs(i.x - e.entrance) + Math.abs(i.z - e.entryZ);
    u.sort((i, d) => h(i) - h(d) || m(i) - m(d) || i.z - d.z || i.x - d.x), u.length && r.add(l(u[0]));
  }
  return r;
}
function A(e, n) {
  return n.filter((a) => a.y === 0 && v(a.kind)).flatMap(y).sort((a, r) => Math.abs(a.x - e.entrance) + Math.abs(a.z - e.entryZ) - (Math.abs(r.x - e.entrance) + Math.abs(r.z - e.entryZ)) || a.x - r.x)[0] ?? null;
}
function C(e, n) {
  const a = A(e, n), r = n.map((s) => s.kind === "hall" && a && l(s) === l(a) ? {
    ...s,
    kind: "entry"
  } : s), t = w(r), o = r.filter((s) => v(s.kind)).flatMap(y).filter((s) => !t.has(l({
    x: s.x,
    y: s.y + 1,
    z: s.z
  })));
  return [...r, ...o.map((s) => ({
    kind: "roof",
    x: s.x,
    y: s.y + 1,
    z: s.z
  }))];
}
function B(e, n, a) {
  const r = A(e, a);
  return !r || Math.abs(r.y - n.y) + Math.abs(r.x - n.x) + Math.abs(r.z - n.z) > 1;
}
function G(e, n) {
  const a = w(n);
  return [-1, 1].filter((r) => {
    const t = a.get(l({
      x: r < 0 ? e.x - 1 : e.x + k[e.kind].width,
      y: e.y,
      z: e.z
    }));
    return !t || !v(t.kind);
  });
}
function D(e, n, a) {
  return !a.some((r) => r !== n && r.z === n.z && r.y >= n.y && y(r).some((t) => t.x === n.x || Math.sign(t.x - n.x) === e.sunSide));
}
function R(e, n, a) {
  return B(e, n, a) ? G(n, a).length ? null : "window" : "noisy";
}
function _(e, n) {
  const a = w(n), r = M(e, n);
  return n.flatMap((t) => {
    const o = t.kind === "study" ? "read" : t.kind === "terrace" ? "sunbathe" : t.kind === "room" ? "rest" : t.kind === "wide" ? "relax" : t.kind === "garden" ? "garden" : null;
    return o ? [{
      part: t,
      activity: o,
      issue: r.has(l(t)) ? o === "read" && R(e, t, n) ? R(e, t, n) : o === "sunbathe" && !D(e, t, n) ? "shaded" : [
        "read",
        "rest",
        "relax"
      ].includes(o) && y(t).some((s) => !a.has(l({
        x: s.x,
        y: s.y + 1,
        z: s.z
      }))) ? "uncovered" : null : "disconnected"
    }] : [];
  });
}
function K(e, n) {
  const a = M(e, n), r = n.filter((o) => a.has(l(o))), t = {
    quietReading: r.some((o) => o.kind === "study" && !R(e, o, n)),
    sunTerrace: r.some((o) => o.kind === "terrace" && D(e, o, n)),
    garden: r.some((o) => o.kind === "garden" && Math.sign(o.x - e.entrance) === e.gardenSide),
    spacious: r.filter((o) => S(o.kind)).reduce((o, s) => o + k[s.kind].width, 0) >= e.living,
    upstairs: r.some((o) => S(o.kind) && o.y === e.floors - 1),
    terrace: r.some((o) => o.kind === "terrace")
  };
  return J(e).map((o) => ({
    id: o,
    met: t[o]
  }));
}
function J(e) {
  switch (e.tier) {
    case "courtyard":
      return ["garden", "spacious"];
    case "duplex":
      return ["spacious", "upstairs"];
    case "terrace":
      return ["upstairs", "terrace"];
    case "sunroom":
      return ["quietReading", "sunTerrace"];
  }
}
function ce(e, n) {
  const a = _(e, n).filter((r) => !r.issue);
  return [
    "read",
    "sunbathe",
    "relax",
    "rest",
    "garden"
  ].flatMap((r) => {
    const t = a.find((o) => o.activity === r);
    return t ? [t] : [];
  });
}
function N(e) {
  return e.reduce((n, a) => n + k[a.kind].cost, 0);
}
function q(e, n) {
  if (n.length > p.maxParts) return "materials";
  const a = /* @__PURE__ */ new Map();
  for (const t of n) {
    if (t.kind !== "hall" && !O.includes(t.kind) || !Number.isInteger(t.x) || !Number.isInteger(t.y) || !Number.isInteger(t.z) || t.z < 0 || t.z >= e.depth || t.x < 0 || t.x + k[t.kind].width > e.width || t.y < 0 || y(t).some((o) => o.y >= j(e, o.x, o.z))) return "bounds";
    for (const o of y(t)) {
      const s = l(o);
      if (a.has(s)) return "occupied";
      a.set(s, t);
    }
  }
  if (N(n) > e.materials) return "materials";
  if (!a.has(l({
    x: e.entrance,
    y: 0,
    z: e.entryZ
  }))) return "entrance";
  for (const t of n) {
    if (t.kind === "garden" && (t.y !== 0 || n.some((o) => o.y > 0 && y(o).some((s) => s.x === t.x && s.z === t.z)))) return "garden";
    if (t.kind === "path" && t.y !== 0) return "path";
    if (t.kind === "terrace" && (t.y === 0 || !e.terraces)) return "terrace";
    if (t.y > 0 && y(t).some((o) => {
      const s = a.get(l({
        x: o.x,
        y: o.y - 1,
        z: o.z
      }));
      return !s || !v(s.kind);
    })) return "support";
  }
  const r = M(e, n);
  return n.some((t) => y(t).some((o) => !r.has(l(o)))) ? "connected" : null;
}
function Q(e, n) {
  const a = C(e, n), r = M(e, a), t = K(e, a), o = !q(e, n) && n.some((s) => s.kind === "room");
  return {
    wishes: t,
    spaces: _(e, a),
    habitable: o,
    fulfilled: o && t.every((s) => s.met),
    materials: N(n),
    unreachable: n.filter((s) => !r.has(l(s))).map(l)
  };
}
function ue(e, n, a) {
  const r = w(n), t = [];
  for (let o = 0; o < e.floors; o++) for (let s = 0; s < e.depth; s++) for (let u = 0; u < e.width; u++) {
    const h = {
      kind: a,
      x: u,
      y: o,
      z: s
    };
    !r.has(l(h)) && !q(e, [...n, h]) && t.push(h);
  }
  return t;
}
function he(e, n, a) {
  const r = e.find((t) => l(t) === l(n));
  return !r || !["room", "study"].includes(r.kind) || r.kind === a ? null : e.map((t) => t === r ? {
    ...t,
    kind: a
  } : t);
}
var L = [
  "gardenWalk",
  "gardenReading",
  "gardenTea",
  "quietBedroom",
  "courtyard"
];
var X = {
  gardenWalk: "garden",
  gardenReading: "study",
  gardenTea: "wide",
  quietBedroom: "room",
  courtyard: "garden"
};
function me(e) {
  return e.length * 2;
}
function ee(e) {
  const n = [...L];
  return (e >>> 4) % 2 && ([n[1], n[2]] = [n[2], n[1]]), n;
}
function U(e, n) {
  return e.y - n.y || e.z - n.z || e.x - n.x;
}
function W(e, n, a) {
  const r = (i) => ({
    id: e,
    part: null,
    need: i
  }), t = (i) => ({
    id: e,
    part: i,
    need: null
  });
  if (!Q(n, a).habitable) return r("bedroom");
  const o = C(n, a), s = w(a), u = _(n, o).filter((i) => !i.issue).map((i) => i.part).sort(U), h = u.filter((i) => i.kind === "garden"), m = (i) => y(i).some((d) => b(d).some((c) => s.get(l(c))?.kind === "garden"));
  switch (e) {
    case "gardenWalk": {
      if (!h.length) return r("garden");
      const i = h.find((d) => b(d).some((c) => s.get(l(c))?.kind === "path"));
      return i ? t(i) : r("path");
    }
    case "gardenReading": {
      const i = u.filter((c) => c.kind === "study");
      if (!i.length) return r("study");
      const d = i.find((c) => [-1, 1].some((f) => s.get(l({
        ...c,
        x: c.x + f
      }))?.kind === "garden"));
      return d ? t(d) : r("gardenWindow");
    }
    case "gardenTea": {
      const i = u.filter((c) => c.kind === "wide");
      if (!i.length) return r("livingRoom");
      const d = i.find(m);
      return d ? t(d) : r("gardenDoor");
    }
    case "quietBedroom": {
      const i = u.filter((d) => d.kind === "room" && B(n, d, o)).find((d) => {
        const c = o.filter((x) => x !== d && x.kind !== "roof"), f = M(n, c);
        return c.every((x) => y(x).every((Y) => f.has(l(Y))));
      });
      return i ? t(i) : r("privacy");
    }
    case "courtyard": {
      if (!h.length) return r("garden");
      const i = h.find((d) => b(d).filter((c) => {
        const f = s.get(l(c));
        return f && v(f.kind);
      }).length >= 3);
      return i ? t(i) : r("enclosure");
    }
  }
}
function ge(e, n, a) {
  const r = ee(e.seed).find((t) => !a.includes(t));
  return r ? W(r, e, n) : null;
}
function fe(e, n, a) {
  return a.flatMap((r) => {
    const t = n.filter((s) => s.kind === X[r]).sort(U), o = W(r, e, n).part ?? t[0];
    return o ? [{
      id: r,
      part: o
    }] : [];
  });
}
var z = {
  hall: "过厅",
  entry: "门厅",
  room: "卧室",
  wide: "客厅",
  study: "阅读角",
  terrace: "露台",
  garden: "花园",
  path: "院路",
  roof: "屋顶"
}, I = {
  courtyard: "小院平房",
  duplex: "两层小楼",
  terrace: "露台小屋",
  sunroom: "阳光书屋"
}, ye = {
  disconnected: "这里还没有接通",
  uncovered: "这里还没有封顶",
  noisy: "门口旁边和正上方都吵，隔开一格更安静",
  window: "两侧都被房间夹住了，要留一面朝户外的侧窗",
  shaded: "太阳被挡住了，向阳一侧要留空"
}, T = {
  read: "读一会儿书",
  sunbathe: "晒晒太阳",
  rest: "睡个午觉",
  relax: "坐下来喝杯茶",
  garden: "看看小院"
}, pe = {
  read: "小白在翻书",
  sunbathe: "小白在晒太阳",
  rest: "小白睡着啦",
  relax: "小白在喝茶",
  garden: "小白在赏花"
}, ne = {
  gardenWalk: {
    title: "沿小路去赏花",
    wish: "想沿着院路，走到花园里。",
    gift: "小鸟浴台",
    thanks: "小路通到花园了，也给小鸟留一碗水。"
  },
  gardenReading: {
    title: "窗外就是花园",
    wish: "想在安静的阅读角，透过侧窗看花。",
    gift: "窗边花盆",
    thanks: "翻书的时候，抬头就能看见花。"
  },
  gardenTea: {
    title: "花园下午茶",
    wish: "想有一间出门就到花园的客厅。",
    gift: "薄荷茶具",
    thanks: "茶泡好啦，坐下来陪我一会儿吧。"
  },
  quietBedroom: {
    title: "不被打扰的午睡",
    wish: "想把卧室放安静些，不让大家从床边穿行。",
    gift: "暖绒小毯",
    thanks: "这回能安心睡个午觉啦。"
  },
  courtyard: {
    title: "屋子围着的小院",
    wish: "想让花园三面挨着屋子，头顶还能看见天。",
    gift: "庭院灯串",
    thanks: "窗里有家，窗外有花。这就是我们的小院啦。"
  }
}, xe = {
  bedroom: "先留一间能住的卧室。",
  garden: "添一块露天花园。",
  path: "让院路直接接到花园边，拐角相碰不算。",
  study: "阅读角要远离门口，并留一面朝户外的侧窗。",
  gardenWindow: "花园要紧挨阅读角的左侧或右侧。",
  livingRoom: "添一间双格客厅。",
  gardenDoor: "让客厅与花园共用一条边，不隔着院路。",
  privacy: "卧室离门口至少两格；去其他地方不必穿过卧室。",
  enclosure: "花园的前后左右，至少三边紧挨地面房间。"
}, $ = {
  name: "小白筑家",
  category: "3D · 小屋建造",
  tagline: "给小白造一个不一样的家。",
  entry: "随机建材 · 自由造家",
  mark: "⌂",
  description: "选房间，搭一个小白真正住得进去的家。",
  ledger: {
    fee: "小白筑家 · 开工",
    ready: "小白筑家 · 基础房屋",
    finished: "小白筑家 · 心愿交付"
  },
  start: `开工 · ${p.fee} 金币`,
  admission: (e) => `开工扣 ${p.fee} 金币，先领 ${F.length} 间卧室的建材。有卧室即返还 ${p.habitableAward}；配齐客厅和户外一角可交付。安静阅读角、向阳露台、三面围合小院，任选 2 项实现，交付再得 ${E[e].award - p.habitableAward}。旧小屋会保留。`,
  construction: "给小白造个家",
  workbench: "建造与家园",
  newProject: "开始一栋新小屋",
  another: "再建一栋",
  resume: "继续建造",
  newBrief: "先选 3 批随机建材，再动手造家。",
  supplies: "建材配给",
  batch: (e) => `第 ${e + 1} / 3 批建材`,
  pickTerms: "每批独立随机，3 选 1；不保证每种房型都有。",
  takePack: "选这份",
  stock: (e) => `余 ${e}`,
  cost: (e) => `预算 ${e}`,
  freePath: "免费",
  commission: "委托详情",
  minimumTitle: "可以入住",
  minimumGoals: {
    bedroom: "卧室",
    lounge: "客厅",
    outdoor: "花园／向阳露台"
  },
  bonusTitle: "额外心愿 · 任选 2 项",
  bonusTerms: (e) => `交付时满足任意 2 项，另得 ${E[e].award - p.habitableAward} 金币。`,
  bonusProgress: (e) => `心愿 ${Math.min(e, 2)}/2 · 详情`,
  planningHelp: "房间的数字是预算花费，小字是剩余建材。拆下会退回建材和预算。阅读角需要远离门口、侧窗朝外；露台要在楼上，向阳处不受遮挡。建材不必用完，达标后也可继续建造。",
  deliver: "交付小屋",
  delivered: "小白的新家，交付啦！",
  deliveryTerms: (e, n) => `本次共得 ${e} 金币（含已发的 ${p.habitableAward}）。${n ? "额外心愿也达成了。" : "额外心愿还没齐，交付后不再补领本次奖金。"}交付后仍可在家园自由改建。`,
  deliveryIncomplete: "卧室、客厅和可用的花园或露台齐全后，即可交付。",
  goal: {
    courtyard: "露天花园三面紧挨地面房间",
    quietReading: "远离门口、侧窗通向户外的阅读角",
    sunTerrace: "向阳无遮挡的露台"
  },
  homes: "我的家园",
  homeMode: "自由改建",
  prepare: "正在检查地块…",
  loading: "正在找回你的小屋…",
  saving: "正在保存…",
  parts: "房间",
  remove: "拆下",
  undo: "撤销",
  menu: "更多",
  budget: (e) => `预算余 ${e}`,
  selected: (e) => z[e.kind],
  cell: (e, n, a) => `第 ${n + 1} 层，第 ${a + 1} 排，第 ${e + 1} 列`,
  place: (e) => `建${z[e.kind]}，第 ${e.y + 1} 层，第 ${e.z + 1} 排，第 ${e.x + 1} 列`,
  choice: (e, n = null) => `${z[e]}，预算 ${k[e].cost}${n === null ? "" : `，剩余建材 ${n}`}`,
  refit: (e) => `改成${z[e]}`,
  remodel: "改建家园",
  done: "结束改建",
  reside: "住回这里",
  floors: "查看楼层",
  whole: "全景",
  floor: (e) => e === 0 ? "一层 · 庭院" : `${e + 1} 层`,
  invited: (e) => `好呀，去${T[e]}。`,
  focus: "看看小白",
  noPlace: "这里暂时放不下，换一种房间或拆改一下。",
  sun: (e) => `阳光从${e === -1 ? "左" : "右"}边来`,
  walking: (e) => `小白正要${T[e]}`,
  useSpace: (e) => `请小白${T[e]}`,
  archiveTitle: (e, n) => `${I[e]} · ${n + 1}`,
  complete: "小白的家",
  abandoned: "工程已停工",
  earned: (e) => `已到账 ${e} 金币`,
  net: (e) => `净收益 ${e - p.fee >= 0 ? "+" : ""}${e - p.fee}`,
  memories: "小家回忆",
  memoryProgress: (e) => `${e} / ${L.length} 段生活`,
  memoryReward: (e) => `${ne[e].gift} · 改建预算 +2`,
  remember: "请小白来看看",
  memoryReady: "布置好了，叫小白来试试吧。",
  memoryComplete: "每个角落，都有一起住下来的回忆。",
  memoryFinished: "继续按你的心意改建，纪念物会一直留下。",
  memoryStored: "已收好，添回对应房间就会摆出来",
  memoryPlaced: (e) => `摆在${z[e]}`,
  memoryLocked: "还没发生的生活",
  memoryCollection: "纪念物随对应用途房间自动摆放；拆改不丢失，也不重复领取。",
  collection: "作品册",
  collect: "收藏这栋",
  uncollect: "移出作品册",
  emptyCollection: "另建新小屋时，交付的旧屋会自动留在这里。",
  collectionCount: (e) => `${e} / ${p.collectionSize} 栋`,
  uncollectTitle: "移出作品册？",
  uncollectBody: "历史收益保留。若不是当前工程，移出后将不再保留这栋建筑，可先保存留影。",
  export: "保存留影",
  exportName: (e) => `小白筑家-${I[e]}.png`,
  exportError: "留影未能保存，请重试。",
  abandon: "放弃工程",
  abandonTitle: "停止这次建造？",
  abandonBody: "已到账的奖励保留，开工费不退。未收藏的工程会在下一次开工时替换。",
  confirm: "确定",
  cancel: "再想想",
  close: "关闭",
  back: "返回当前工程",
  rules: "玩法",
  ruleItems: [
    "选楼层和房间，再点地面空位。可前后左右扩建，院路能连通花园和房间；门、楼梯和屋顶自动安排。",
    "每块地的轮廓和预算不同。小院留在地面，露台在楼上；阅读角要远离门口，至少一侧通向户外、小院或露台。点现有房间可以拆改或请小白试住。",
    "开工后连选 3 批建材，每批独立随机 3 选 1，不按之前选择调整，也不保证都有露台。已出现的选项会保存，刷新不重抽。拆房退回建材，院路免费。",
    `有卧室立即到账 ${p.habitableAward} 金币。卧室、客厅和户外一角齐全即可主动交付，也可继续实现额外心愿。`,
    "交付后奖金结清，家园可免费改建、发展生活纪念；不补发或重发本次金币。另建新屋前确认费用，旧屋自动保留。"
  ],
  zoomIn: "放大",
  zoomOut: "缩小",
  resetView: "全屋",
  scene: "小白的建造场地",
  storyBusy: "故事生成中，施工暂歇",
  soundOn: "声音开",
  soundOff: "声音关",
  soundError: "声音设置未保存，请重试。",
  audioDispose: "[Building] Audio context disposal failed",
  noFunds: `开工需要 ${p.fee} 金币，当前余额不足。`,
  graphics: "画面暂停，工程仍在。请重新载入画面。",
  reload: "重载画面",
  saveProblem: "这次操作尚未确认，请复核原操作。",
  conflict: "工程有新版本，请重新读取。",
  recoveryProblem: "恢复记录无法读写，请允许本站存储后复核原操作。",
  recover: "复核原操作",
  refresh: "重新读取",
  retiredIntent: "旧版未完成的构件操作已取消，工程和到账记录保留，请按新布局继续。",
  balance: (e) => `钱包 ${e}`
}, te = {
  stock: "手头没有这类建材，可以拆回已有的同类房间。",
  bounds: "这里超出了地块或层高",
  occupied: "这里已经有房间",
  materials: "建造预算不够了",
  support: "楼上的每一格都要有房间承托",
  entrance: "要保留入口的位置",
  path: "院路只能铺在地面，楼上需要房间承托",
  garden: "小院要落在地面，上方留空",
  terrace: "露台需要建在楼上",
  connected: "房间之间要连通门厅"
}, re = {
  ...Object.fromEntries(Object.entries(te).map(([e, n]) => [`building_${e}`, n])),
  building_invalid: "这次操作不合法，请重新读取工程。",
  building_identity: "操作身份不匹配，请重新读取。",
  building_stale: $.conflict,
  building_funds: $.noFunds,
  building_active: "先完成或放弃当前工程。",
  building_memory_incomplete: "这段生活还没布置好，或已经留过纪念了。",
  building_supply: "本轮建材不可领取，请重新读取工程。",
  building_finished: "这个工程不能进行此操作。",
  building_incomplete: $.deliveryIncomplete,
  building_collection_full: "作品册已满，请先移出一栋或保存留影。",
  building_generation: "地块检查未完成，没有扣费，请再试一次。",
  building_unavailable: "当前无法施工，请稍后再试。",
  building_recovery: $.recoveryProblem
};
function we(e) {
  return re[e && typeof e == "object" && "code" in e ? String(e.code) : e instanceof Error ? e.message : ""] ?? $.saveProblem;
}
var g = {
  helmet: "#efbd50",
  highlight: "#ffe19a",
  denim: "#467c8d",
  seam: "#a7d0ce",
  leather: "#98653f",
  metal: "#d8e7e6"
}, ke = [
  {
    shape: "ball",
    size: [
      0.345,
      0.12,
      0.285
    ],
    at: [
      0,
      0.405,
      -0.015
    ],
    color: g.helmet
  },
  {
    shape: "ball",
    size: [
      0.375,
      0.024,
      0.31
    ],
    at: [
      0,
      0.365,
      0.015
    ],
    color: g.helmet
  },
  {
    shape: "box",
    size: [
      0.045,
      0.025,
      0.4
    ],
    at: [
      0,
      0.516,
      -0.015
    ],
    color: g.highlight
  },
  {
    shape: "box",
    size: [
      0.082,
      0.055,
      0.02
    ],
    at: [
      0,
      0.407,
      0.278
    ],
    color: g.highlight
  },
  {
    shape: "ball",
    size: [
      0.285,
      0.165,
      0.255
    ],
    at: [
      0,
      -0.14,
      0
    ],
    color: g.denim
  },
  {
    shape: "box",
    size: [
      0.26,
      0.21,
      0.05
    ],
    at: [
      0,
      -0.055,
      0.252
    ],
    color: g.denim
  },
  ...[-1, 1].map((e) => ({
    shape: "box",
    size: [
      0.046,
      0.19,
      0.042
    ],
    at: [
      e * 0.17,
      -7e-3,
      0.239
    ],
    color: g.denim,
    tilt: e * -0.22
  })),
  ...[-1, 1].map((e) => ({
    shape: "ball",
    size: [
      0.023,
      0.023,
      0.012
    ],
    at: [
      e * 0.15,
      0.035,
      0.272
    ],
    color: g.helmet
  })),
  {
    shape: "box",
    size: [
      0.12,
      0.073,
      0.02
    ],
    at: [
      0,
      -0.055,
      0.283
    ],
    color: g.seam
  },
  {
    shape: "ball",
    size: [
      0.299,
      0.035,
      0.266
    ],
    at: [
      0,
      -0.155,
      0
    ],
    color: g.leather
  },
  {
    shape: "box",
    size: [
      0.065,
      0.056,
      0.02
    ],
    at: [
      0,
      -0.155,
      0.274
    ],
    color: g.helmet
  },
  {
    shape: "box",
    size: [
      0.125,
      0.12,
      0.115
    ],
    at: [
      -0.277,
      -0.17,
      0.12
    ],
    color: g.leather
  },
  {
    shape: "box",
    size: [
      0.083,
      0.075,
      0.025
    ],
    at: [
      -0.277,
      -0.155,
      0.188
    ],
    color: g.helmet
  },
  {
    shape: "box",
    size: [
      0.039,
      0.19,
      0.047
    ],
    at: [
      0.29,
      -0.21,
      0.13
    ],
    color: g.leather,
    tilt: -0.18
  },
  {
    shape: "box",
    size: [
      0.15,
      0.064,
      0.079
    ],
    at: [
      0.31,
      -0.11,
      0.13
    ],
    color: g.metal,
    tilt: -0.18
  }
];
export {
  Z as A,
  y as B,
  G as C,
  w as D,
  M as E,
  k as F,
  l as H,
  oe as I,
  O as L,
  le as M,
  p as N,
  de as O,
  ie as P,
  ae as R,
  _ as S,
  C as T,
  se as U,
  j as V,
  v as W,
  ue as _,
  ne as a,
  he as b,
  ye as c,
  fe as d,
  me as f,
  Q as g,
  ge as h,
  te as i,
  H as j,
  V as k,
  we as l,
  ee as m,
  pe as n,
  xe as o,
  W as p,
  $ as r,
  z as s,
  ke as t,
  L as u,
  N as v,
  A as w,
  ce as x,
  q as y,
  E as z
};
