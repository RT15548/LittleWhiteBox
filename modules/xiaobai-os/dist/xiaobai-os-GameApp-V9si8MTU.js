/* eslint-disable */
import { $ as te, D as W, G as J, M as Z, P as ne, S as m, T as le, U as Q, V as o, X as O, at as re, b as V, d as oe, f as ie, ft as y, g as se, h as j, lt as t, ot as P, r as ue, rt as h, ut as Y, v as L, x as k, y as a } from "./xiaobai-os-app-navigation-DvMnPkC0.js";
import { t as de } from "./xiaobai-os-identity-DpYJdX5Y.js";
import { n as ve, r as K, t as ee } from "./xiaobai-os-room-catalog-pmmnBW78.js";
function ae(i) {
  return i && typeof i == "object" && "code" in i ? String(i.code) : "";
}
function H(i) {
  const f = i instanceof Error ? i.message : String(i);
  return f.includes("economy_insufficient_funds") || f.includes("cannot be overdrawn") ? "小白币不够了，换个小一点的筹码吧。" : f.includes("game_dice_bid_not_higher") ? "这次要叫得比对方更大一些。" : f.includes("game_revision_conflict") || f.includes("game_event_id_conflict") ? "本局已有变化，请重新加载后继续。" : f.includes("game_main_generation_active") ? "故事正在回复，等回复结束就能继续玩。" : f.includes("聊天已切换") ? "聊天已切换，请重新打开游戏。" : f === "host_request_timeout" ? "暂时没收到结果。可以重试这次操作，不会重复下注或重新抽取结果。" : "这次操作没能完成，请重试。";
}
function ce(i, f) {
  const e = h(structuredClone(P(f))), l = h(null), s = h(null), g = h(null), u = h(!1), d = h(!1), I = h(""), T = h(""), G = h(null);
  let _ = !1, $ = 0, R = 0, B = 0;
  function X() {
    return "game-ui:" + de();
  }
  const D = L(() => ["unconfirmed", "save-failed"].includes(e.value.status)), S = L(() => u.value || !!g.value), b = L(() => S.value ? "上一项操作还在进行，请稍候。" : e.value.status !== "ready" ? e.value.message || "游戏正在准备，请稍候。" : G.value ? "请先重试这次操作，或重新加载本局结果。" : e.value.generationActive ? "故事正在回复，等回复结束就能继续玩。" : ""), C = L(() => s.value ?? {
    balance: e.value.balance,
    lockedAmount: e.value.lockedAmount
  }), A = L(() => S.value || D.value || [
    "conflict",
    "saving",
    "loading"
  ].includes(e.value.status));
  function M(r) {
    const v = e.value;
    if (v.chatIdentity !== r.chatIdentity)
      l.value = null, s.value = null, G.value = null, g.value = null, u.value = !1, R += 1, B += 1;
    else if (v.activeGame && r.status === "ready" && !r.activeGame) {
      const p = r.records.find((c) => c.gameId === v.activeGame.id);
      p && (s.value = {
        balance: v.balance,
        lockedAmount: v.lockedAmount
      }, l.value = {
        before: structuredClone(P(v.activeGame)),
        record: structuredClone(p),
        balanceAfter: r.balance
      });
    }
    e.value = structuredClone(r), d.value = !1, T.value = "", I.value = "", G.value = null;
  }
  function N(r) {
    const v = r === "game_save_pending" ? "save-failed" : r === "storage_unconfirmed" ? "unconfirmed" : r === "storage_conflict" ? "conflict" : null;
    return v ? (e.value = {
      ...e.value,
      status: v,
      message: v === "save-failed" ? "这局还没保存好，请重试保存后继续。" : v === "unconfirmed" ? "还不确定是否保存成功，请先检查保存。" : "服务器上的游戏记录与当前内容不同，请重新打开酒馆后继续。"
    }, !0) : !1;
  }
  async function E(r) {
    const v = e.value.chatIdentity, p = $, c = B;
    g.value = r.action, G.value = null, I.value = "";
    try {
      const n = await i.request(r.endpoint, r.payload, 35e3);
      return _ || c !== B || e.value.chatIdentity !== v ? !1 : ($ === p && M(n.result), !0);
    } catch (n) {
      return !_ && c === B && $ === p && e.value.chatIdentity === v && !N(ae(n)) && (I.value = H(n), e.value.status === "ready" && (G.value = r)), !1;
    } finally {
      !_ && c === B && e.value.chatIdentity === v && (g.value = null);
    }
  }
  async function z(r) {
    return _ || b.value ? !1 : E({
      endpoint: r.endpoint,
      action: structuredClone(P(r)),
      payload: {
        ...structuredClone(P(r.payload || {})),
        chatIdentity: e.value.chatIdentity,
        expectedRevision: e.value.revision,
        expectedEventId: e.value.eventId,
        actionId: X()
      }
    });
  }
  async function x() {
    return _ || !G.value || S.value || e.value.status !== "ready" || e.value.generationActive ? !1 : E(structuredClone(P(G.value)));
  }
  async function q(r = !1) {
    if (_ || S.value || !r && A.value) return;
    const v = e.value.chatIdentity, p = $, c = ++R;
    u.value = !0, I.value = "";
    try {
      const n = await i.request(r ? "game/confirm-save" : "game/refresh", { chatIdentity: v }, 35e3);
      if (_ || c !== R || e.value.chatIdentity !== v) return;
      p === $ && M("state" in n.result ? n.result.state : n.result), G.value = null;
    } catch (n) {
      !_ && c === R && p === $ && e.value.chatIdentity === v && (N(ae(n)) || (I.value = H(n)));
    } finally {
      c === R && (u.value = !1);
    }
  }
  async function U() {
    if (_ || !e.value.hasMore || d.value || S.value || e.value.status !== "ready") return;
    const r = $, v = e.value.chatIdentity;
    d.value = !0, T.value = "";
    try {
      const p = await i.request("game/records/load-more", {
        chatIdentity: v,
        offset: e.value.records.length
      }, 35e3);
      if (_ || r !== $ || v !== e.value.chatIdentity) return;
      const c = new Set(e.value.records.map((n) => n.id));
      e.value.records.push(...p.result.records.filter((n) => !c.has(n.id))), e.value.total = p.result.total, e.value.hasMore = p.result.hasMore;
    } catch (p) {
      !_ && r === $ && v === e.value.chatIdentity && (T.value = H(p));
    } finally {
      r === $ && (d.value = !1);
    }
  }
  const F = i.subscribe((r) => {
    _ || (r.type === "game/state" ? ($ += 1, M(r.payload.state)) : r.type === "game/error" && (I.value = "游戏暂时无法读取，请重新打开。"));
  });
  return {
    state: e,
    settlement: l,
    funds: C,
    inFlight: g,
    reading: u,
    loadingMore: d,
    busy: S,
    error: I,
    recordsError: T,
    failed: G,
    disabledReason: b,
    needsSave: D,
    refreshDisabled: A,
    act: z,
    retry: x,
    loadMore: U,
    refresh: () => q(),
    confirmSave: () => q(!0),
    revealComplete: () => {
      s.value = null;
    },
    dismissSettlement: () => {
      l.value = null, s.value = null;
    },
    dispose: () => {
      _ = !0, R += 1, F();
    }
  };
}
var me = { class: "game-lobby" }, fe = ["src"], ye = { class: "game-search" }, ge = {
  class: "game-categories",
  "aria-label": "游戏分类"
}, be = ["aria-pressed", "onClick"], pe = { class: "game-shelf" }, he = ["data-game-room", "onClick"], _e = { class: "game-tile-art" }, ke = ["src"], $e = ["src"], Ce = { class: "game-tile-copy" }, Ge = {
  key: 1,
  class: "game-empty"
}, Ie = /* @__PURE__ */ W({
  __name: "GameLobby",
  props: { activeGame: {} },
  emits: ["open"],
  setup(i) {
    const f = h(""), e = h("全部"), l = ["全部", ...new Set(ee.map((g) => g.category))], s = L(() => ee.filter((g) => (e.value === "全部" || g.category === e.value) && (g.name + g.tagline + g.category).includes(f.value.trim())));
    return (g, u) => (o(), m("section", me, [
      i.activeGame ? (o(), m("button", {
        key: 0,
        type: "button",
        class: "game-continue",
        onClick: u[0] || (u[0] = (d) => g.$emit("open", i.activeGame.kind))
      }, [
        a("img", {
          src: t(K)(i.activeGame.kind).artwork,
          alt: ""
        }, null, 8, fe),
        a("span", null, [u[3] || (u[3] = a("small", null, "进行中", -1)), a("strong", null, y(t(K)(i.activeGame.kind).name), 1)]),
        u[4] || (u[4] = a("b", null, "继续 →", -1))
      ])) : k("", !0),
      a("label", ye, [u[5] || (u[5] = a("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [a("circle", {
        cx: "10.5",
        cy: "10.5",
        r: "6.5"
      }), a("path", { d: "m16 16 4 4" })], -1)), te(a("input", {
        "onUpdate:modelValue": u[1] || (u[1] = (d) => f.value = d),
        type: "search",
        placeholder: "找个游戏",
        "aria-label": "搜索游戏"
      }, null, 512), [[oe, f.value]])]),
      a("nav", ge, [(o(), m(j, null, Q(l, (d) => a("button", {
        key: d,
        type: "button",
        "aria-pressed": e.value === d,
        onClick: (I) => e.value = d
      }, y(d), 9, be)), 64))]),
      a("div", pe, [(o(!0), m(j, null, Q(s.value, (d) => (o(), m("button", {
        key: d.id,
        type: "button",
        class: Y(["game-tile", "tone-" + d.tone]),
        "data-game-room": d.id,
        onClick: (I) => g.$emit("open", d.id)
      }, [a("div", _e, [a("img", {
        src: d.artwork,
        alt: "",
        loading: "lazy"
      }, null, 8, ke), "mascotPortrait" in d ? (o(), m("img", {
        key: 0,
        class: "game-tile-mascot",
        src: d.mascotPortrait,
        alt: "",
        loading: "lazy"
      }, null, 8, $e)) : k("", !0)]), a("div", Ce, [a("h3", null, y(d.name), 1), a("span", null, [le(y(d.entry) + " ", 1), u[6] || (u[6] = a("i", { "aria-hidden": "true" }, "↗", -1))])])], 10, he))), 128))]),
      s.value.length ? k("", !0) : (o(), m("div", Ge, [
        u[7] || (u[7] = a("h3", null, "没找到这个游戏", -1)),
        u[8] || (u[8] = a("p", null, "换个名字，或者看看其他分类。", -1)),
        a("button", {
          type: "button",
          onClick: u[2] || (u[2] = (d) => {
            f.value = "", e.value = "全部";
          })
        }, " 查看全部 ")
      ]))
    ]));
  }
}), Se = Ie, we = {
  class: "game-records",
  "aria-labelledby": "game-records-title"
}, Ae = { class: "game-section-heading" }, Me = {
  key: 0,
  class: "game-record-list"
}, Re = {
  class: "game-record-mark",
  "aria-hidden": "true"
}, Be = { class: "game-record-main" }, Ee = ["datetime"], Le = { class: "game-record-money" }, Te = {
  key: 1,
  class: "game-record-empty"
}, De = {
  key: 2,
  class: "game-inline-error",
  role: "status"
}, Ne = ["disabled"], xe = /* @__PURE__ */ W({
  __name: "GameRecords",
  props: {
    records: {},
    total: {},
    hasMore: { type: Boolean },
    loadingMore: { type: Boolean },
    error: {}
  },
  emits: ["loadMore"],
  setup(i) {
    function f(e) {
      return new Intl.DateTimeFormat("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(e));
    }
    return (e, l) => (o(), m("section", we, [
      a("header", Ae, [l[1] || (l[1] = a("div", null, [a("h2", { id: "game-records-title" }, "记录")], -1)), a("small", null, y(i.total) + " 局", 1)]),
      i.records.length ? (o(), m("div", Me, [(o(!0), m(j, null, Q(i.records, (s) => (o(), m("article", {
        key: s.id,
        class: Y(["game-record", `is-${s.outcomeTone}`])
      }, [a("div", Re, y(t(K)(s.game).mark), 1), a("div", Be, [
        a("header", null, [a("div", null, [a("span", null, y(s.gameLabel), 1), a("strong", null, y(s.outcomeLabel), 1)]), a("time", { datetime: new Date(s.createdAt).toISOString() }, y(f(s.createdAt)), 9, Ee)]),
        a("div", Le, [
          a("span", null, "下注 ¤ " + y(s.amountIn), 1),
          a("span", null, "拿回 ¤ " + y(s.payout), 1),
          a("strong", null, y(s.net > 0 ? "+" : "") + y(s.net), 1)
        ]),
        a("details", null, [l[2] || (l[2] = a("summary", null, "本局详情", -1)), (o(), V(J(t(K)(s.game).record), { detail: s.detail }, null, 8, ["detail"]))])
      ])], 2))), 128))])) : (o(), m("div", Te, [...l[3] || (l[3] = [a("span", { "aria-hidden": "true" }, "◇", -1), a("p", null, "暂无游戏记录", -1)])])),
      i.error ? (o(), m("p", De, y(i.error), 1)) : k("", !0),
      i.hasMore ? (o(), m("button", {
        key: 3,
        type: "button",
        class: "game-load-more",
        disabled: i.loadingMore,
        onClick: l[0] || (l[0] = (s) => e.$emit("loadMore"))
      }, y(i.loadingMore ? "正在翻阅…" : "更多记录"), 9, Ne)) : k("", !0)
    ]));
  }
}), ze = xe, Fe = {
  key: 0,
  class: "game-header"
}, Ve = {
  class: "game-funds",
  "aria-label": "可用小白币"
}, qe = {
  key: 1,
  class: "game-nav",
  "aria-label": "游戏页面"
}, Pe = ["aria-current"], Ue = ["aria-current"], Oe = ["aria-current"], je = {
  key: 2,
  class: "game-notice",
  role: "status"
}, Ke = ["disabled"], Xe = ["disabled"], He = ["disabled"], Je = {
  key: 0,
  class: "game-empty",
  role: "status"
}, Qe = {
  key: 1,
  class: "game-empty",
  role: "status"
}, We = /* @__PURE__ */ W({
  __name: "GameApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(i) {
    const f = i, e = ce(f.bridge, f.initialState), { state: l, settlement: s, funds: g, inFlight: u, reading: d, loadingMore: I, busy: T, error: G, recordsError: _, failed: $, disabledReason: R, needsSave: B, refreshDisabled: X } = e, D = h(null);
    let S = 0;
    const b = h(l.value.activeGame ? "room" : "lobby"), C = h(l.value.activeGame?.kind || null), A = re(null), M = h(""), N = h(!1);
    let E = 0;
    const z = L(() => C.value ? ve(C.value) : null), x = L(() => b.value === "room" && z.value?.mode === "standalone");
    async function q() {
      const c = z.value, n = ++E;
      if (A.value = null, M.value = "", !!c) {
        N.value = !0;
        try {
          const w = await c.load();
          n === E && (A.value = w.default);
        } catch {
          n === E && (M.value = "这个游戏暂时没能打开，再试一次吧。");
        } finally {
          n === E && (N.value = !1);
        }
      }
    }
    O([
      b,
      C,
      () => !!l.value.activeGame,
      () => !!s.value
    ], (c, n) => {
      n[0] === "lobby" && (S = D.value?.scrollTop || 0), Z(() => {
        D.value?.scrollTo({ top: b.value === "lobby" ? S : 0 });
      });
    }), O(C, q, { immediate: !0 }), O(s, (c) => {
      c && (C.value = c.record.game);
    }), O(() => l.value.chatIdentity, () => {
      S = 0, C.value = l.value.activeGame?.kind || null, b.value = C.value ? "room" : "lobby", Z(() => {
        S = 0, D.value?.scrollTo({ top: 0 });
      });
    });
    function U(c) {
      C.value = c, b.value = "room";
    }
    function F(c) {
      e.dismissSettlement(), b.value = c;
    }
    ue(() => b.value === "lobby" ? !1 : (F("lobby"), !0));
    function r() {
      l.value.activeGame && U(l.value.activeGame.kind);
    }
    function v() {
      e.dismissSettlement();
    }
    async function p(c) {
      await e.act(c);
    }
    return ne(() => {
      E += 1, e.dispose();
    }), (c, n) => (o(), m("main", { class: Y(["game-app", { "game-app-standalone": x.value }]) }, [
      x.value ? k("", !0) : (o(), m("header", Fe, [a("h1", null, y(b.value === "room" ? z.value?.name : "游戏"), 1), a("div", Ve, [a("strong", null, "¤ " + y(t(g).balance.toLocaleString("zh-CN")), 1)])])),
      x.value ? k("", !0) : (o(), m("nav", qe, [
        a("button", {
          type: "button",
          "aria-current": b.value === "lobby" ? "page" : void 0,
          onClick: n[0] || (n[0] = (w) => F("lobby"))
        }, " 大厅 ", 8, Pe),
        t(l).activeGame ? (o(), m("button", {
          key: 0,
          type: "button",
          "aria-current": b.value === "room" && C.value === t(l).activeGame.kind ? "page" : void 0,
          onClick: r
        }, [...n[6] || (n[6] = [le(" 继续 ", -1), a("i", null, null, -1)])], 8, Ue)) : k("", !0),
        a("button", {
          type: "button",
          "aria-current": b.value === "records" ? "page" : void 0,
          onClick: n[1] || (n[1] = (w) => F("records"))
        }, " 记录 ", 8, Oe)
      ])),
      !x.value && (t(l).message || t(G) || t(l).generationActive) ? (o(), m("aside", je, [
        a("p", null, y(t(G) || t(l).message || "故事正在回复，等回复结束就能继续玩。"), 1),
        t(B) ? (o(), m("button", {
          key: 0,
          type: "button",
          disabled: t(T),
          onClick: n[2] || (n[2] = (...w) => t(e).confirmSave && t(e).confirmSave(...w))
        }, y(t(d) ? "正在检查…" : t(l).status === "save-failed" ? "重试保存" : "检查保存"), 9, Ke)) : t($) ? (o(), m("button", {
          key: 1,
          type: "button",
          disabled: t(T) || t(l).generationActive,
          onClick: n[3] || (n[3] = (...w) => t(e).retry && t(e).retry(...w))
        }, " 重试这次操作 ", 8, Xe)) : k("", !0),
        !t(B) && t(l).status !== "conflict" ? (o(), m("button", {
          key: 2,
          type: "button",
          disabled: t(X),
          onClick: n[4] || (n[4] = (...w) => t(e).refresh && t(e).refresh(...w))
        }, " 重新加载 ", 8, He)) : k("", !0)
      ])) : k("", !0),
      a("div", {
        ref_key: "scroll",
        ref: D,
        class: "game-scroll"
      }, [
        te((o(), V(Se, {
          key: t(l).chatIdentity,
          "active-game": t(l).activeGame,
          onOpen: U
        }, null, 8, ["active-game"])), [[ie, b.value === "lobby"]]),
        b.value === "records" ? (o(), V(ze, {
          key: 0,
          records: t(l).records,
          total: t(l).total,
          "has-more": t(l).hasMore,
          "loading-more": t(I),
          error: t(_),
          onLoadMore: t(e).loadMore
        }, null, 8, [
          "records",
          "total",
          "has-more",
          "loading-more",
          "error",
          "onLoadMore"
        ])) : b.value === "room" ? (o(), m(j, { key: 1 }, [N.value ? (o(), m("div", Je, [...n[7] || (n[7] = [a("p", null, "正在摆好桌面…", -1)])])) : M.value ? (o(), m("div", Qe, [a("p", null, y(M.value), 1), a("button", {
          type: "button",
          onClick: q
        }, "重新打开")])) : A.value && z.value?.mode === "wager" ? (o(), V(J(A.value), {
          key: 2,
          state: t(l),
          "disabled-reason": t(R),
          "in-flight": t(u),
          settlement: t(s)?.record.game === C.value ? t(s) : null,
          onRevealed: t(e).revealComplete,
          onAction: p,
          onAgain: v,
          onLobby: n[5] || (n[5] = (w) => F("lobby")),
          onResume: r
        }, null, 40, [
          "state",
          "disabled-reason",
          "in-flight",
          "settlement",
          "onRevealed"
        ])) : k("", !0)], 64)) : k("", !0),
        (o(), V(se, {
          key: t(l).chatIdentity,
          max: 1
        }, [x.value && A.value && !N.value && !M.value ? (o(), V(J(A.value), {
          key: C.value,
          bridge: f.bridge,
          "chat-identity": t(l).chatIdentity,
          "generation-active": t(l).generationActive
        }, null, 8, [
          "bridge",
          "chat-identity",
          "generation-active"
        ])) : k("", !0)], 1024))
      ], 512)
    ], 2));
  }
}), aa = We;
export {
  aa as default
};
