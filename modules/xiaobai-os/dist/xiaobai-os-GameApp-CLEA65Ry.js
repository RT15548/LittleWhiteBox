/* eslint-disable */
import { $ as te, D as W, G as J, M as Z, P as ne, S as f, T as le, U as Q, V as o, X as O, at as re, b as z, d as oe, f as ie, ft as b, g as ue, h as j, lt as t, ot as V, r as se, rt as h, ut as Y, v as B, x as $, y as a } from "./xiaobai-os-app-navigation-DvMnPkC0.js";
import { n as de, r as K, t as ee } from "./xiaobai-os-room-catalog-C1kpY1HV.js";
function ae(i) {
  return i && typeof i == "object" && "code" in i ? String(i.code) : "";
}
function H(i) {
  const y = i instanceof Error ? i.message : String(i);
  return y.includes("economy_insufficient_funds") || y.includes("cannot be overdrawn") ? "小白币不够了，换个小一点的筹码吧。" : y.includes("game_dice_bid_not_higher") ? "这次要叫得比对方更大一些。" : y.includes("game_revision_conflict") || y.includes("game_event_id_conflict") ? "本局已有变化，请重新加载后继续。" : y.includes("game_main_generation_active") ? "故事正在回复，等回复结束就能继续玩。" : y.includes("聊天已切换") ? "聊天已切换，请重新打开游戏。" : y === "host_request_timeout" ? "暂时没收到结果。可以重试这次操作，不会重复下注或重新抽取结果。" : "这次操作没能完成，请重试。";
}
function ve(i, y) {
  const e = h(structuredClone(V(y))), l = h(null), u = h(null), p = h(null), d = h(!1), v = h(!1), I = h(""), D = h(""), G = h(null);
  let _ = !1, C = 0, S = 0, w = 0, X = 0;
  function N() {
    return typeof globalThis.crypto?.randomUUID == "function" ? "game-ui:" + globalThis.crypto.randomUUID() : "game-ui:" + Date.now() + ":" + ++X;
  }
  const E = B(() => ["unconfirmed", "save-failed"].includes(e.value.status)), g = B(() => d.value || !!p.value), k = B(() => g.value ? "上一项操作还在进行，请稍候。" : e.value.status !== "ready" ? e.value.message || "游戏正在准备，请稍候。" : G.value ? "请先重试这次操作，或重新加载本局结果。" : e.value.generationActive ? "故事正在回复，等回复结束就能继续玩。" : ""), A = B(() => u.value ?? {
    balance: e.value.balance,
    lockedAmount: e.value.lockedAmount
  }), M = B(() => g.value || E.value || [
    "conflict",
    "saving",
    "loading"
  ].includes(e.value.status));
  function R(r) {
    const m = e.value;
    if (m.chatIdentity !== r.chatIdentity)
      l.value = null, u.value = null, G.value = null, p.value = null, d.value = !1, S += 1, w += 1;
    else if (m.activeGame && r.status === "ready" && !r.activeGame) {
      const s = r.records.find((n) => n.gameId === m.activeGame.id);
      s && (u.value = {
        balance: m.balance,
        lockedAmount: m.lockedAmount
      }, l.value = {
        before: structuredClone(V(m.activeGame)),
        record: structuredClone(s),
        balanceAfter: r.balance
      });
    }
    e.value = structuredClone(r), v.value = !1, D.value = "", I.value = "", G.value = null;
  }
  function T(r) {
    const m = r === "game_save_pending" ? "save-failed" : r === "storage_unconfirmed" ? "unconfirmed" : r === "storage_conflict" ? "conflict" : null;
    return m ? (e.value = {
      ...e.value,
      status: m,
      message: m === "save-failed" ? "这局还没保存好，请重试保存后继续。" : m === "unconfirmed" ? "还不确定是否保存成功，请先检查保存。" : "服务器上的游戏记录与当前内容不同，请重新打开酒馆后继续。"
    }, !0) : !1;
  }
  async function L(r) {
    const m = e.value.chatIdentity, s = C, n = w;
    p.value = r.action, G.value = null, I.value = "";
    try {
      const c = await i.request(r.endpoint, r.payload, 35e3);
      return _ || n !== w || e.value.chatIdentity !== m ? !1 : (C === s && R(c.result), !0);
    } catch (c) {
      return !_ && n === w && C === s && e.value.chatIdentity === m && !T(ae(c)) && (I.value = H(c), e.value.status === "ready" && (G.value = r)), !1;
    } finally {
      !_ && n === w && e.value.chatIdentity === m && (p.value = null);
    }
  }
  async function U(r) {
    return _ || k.value ? !1 : L({
      endpoint: r.endpoint,
      action: structuredClone(V(r)),
      payload: {
        ...structuredClone(V(r.payload || {})),
        chatIdentity: e.value.chatIdentity,
        expectedRevision: e.value.revision,
        expectedEventId: e.value.eventId,
        actionId: N()
      }
    });
  }
  async function q() {
    return _ || !G.value || g.value || e.value.status !== "ready" || e.value.generationActive ? !1 : L(structuredClone(V(G.value)));
  }
  async function F(r = !1) {
    if (_ || g.value || !r && M.value) return;
    const m = e.value.chatIdentity, s = C, n = ++S;
    d.value = !0, I.value = "";
    try {
      const c = await i.request(r ? "game/confirm-save" : "game/refresh", { chatIdentity: m }, 35e3);
      if (_ || n !== S || e.value.chatIdentity !== m) return;
      s === C && R("state" in c.result ? c.result.state : c.result), G.value = null;
    } catch (c) {
      !_ && n === S && s === C && e.value.chatIdentity === m && (T(ae(c)) || (I.value = H(c)));
    } finally {
      n === S && (d.value = !1);
    }
  }
  async function x() {
    if (_ || !e.value.hasMore || v.value || g.value || e.value.status !== "ready") return;
    const r = C, m = e.value.chatIdentity;
    v.value = !0, D.value = "";
    try {
      const s = await i.request("game/records/load-more", {
        chatIdentity: m,
        offset: e.value.records.length
      }, 35e3);
      if (_ || r !== C || m !== e.value.chatIdentity) return;
      const n = new Set(e.value.records.map((c) => c.id));
      e.value.records.push(...s.result.records.filter((c) => !n.has(c.id))), e.value.total = s.result.total, e.value.hasMore = s.result.hasMore;
    } catch (s) {
      !_ && r === C && m === e.value.chatIdentity && (D.value = H(s));
    } finally {
      r === C && (v.value = !1);
    }
  }
  const P = i.subscribe((r) => {
    _ || (r.type === "game/state" ? (C += 1, R(r.payload.state)) : r.type === "game/error" && (I.value = "游戏暂时无法读取，请重新打开。"));
  });
  return {
    state: e,
    settlement: l,
    funds: A,
    inFlight: p,
    reading: d,
    loadingMore: v,
    busy: g,
    error: I,
    recordsError: D,
    failed: G,
    disabledReason: k,
    needsSave: E,
    refreshDisabled: M,
    act: U,
    retry: q,
    loadMore: x,
    refresh: () => F(),
    confirmSave: () => F(!0),
    revealComplete: () => {
      u.value = null;
    },
    dismissSettlement: () => {
      l.value = null, u.value = null;
    },
    dispose: () => {
      _ = !0, S += 1, P();
    }
  };
}
var ce = { class: "game-lobby" }, me = ["src"], fe = { class: "game-search" }, ye = {
  class: "game-categories",
  "aria-label": "游戏分类"
}, ge = ["aria-pressed", "onClick"], be = { class: "game-shelf" }, pe = ["data-game-room", "onClick"], he = { class: "game-tile-art" }, _e = ["src"], ke = ["src"], $e = { class: "game-tile-copy" }, Ce = {
  key: 1,
  class: "game-empty"
}, Ge = /* @__PURE__ */ W({
  __name: "GameLobby",
  props: { activeGame: {} },
  emits: ["open"],
  setup(i) {
    const y = h(""), e = h("全部"), l = ["全部", ...new Set(ee.map((p) => p.category))], u = B(() => ee.filter((p) => (e.value === "全部" || p.category === e.value) && (p.name + p.tagline + p.category).includes(y.value.trim())));
    return (p, d) => (o(), f("section", ce, [
      i.activeGame ? (o(), f("button", {
        key: 0,
        type: "button",
        class: "game-continue",
        onClick: d[0] || (d[0] = (v) => p.$emit("open", i.activeGame.kind))
      }, [
        a("img", {
          src: t(K)(i.activeGame.kind).artwork,
          alt: ""
        }, null, 8, me),
        a("span", null, [d[3] || (d[3] = a("small", null, "进行中", -1)), a("strong", null, b(t(K)(i.activeGame.kind).name), 1)]),
        d[4] || (d[4] = a("b", null, "继续 →", -1))
      ])) : $("", !0),
      a("label", fe, [d[5] || (d[5] = a("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [a("circle", {
        cx: "10.5",
        cy: "10.5",
        r: "6.5"
      }), a("path", { d: "m16 16 4 4" })], -1)), te(a("input", {
        "onUpdate:modelValue": d[1] || (d[1] = (v) => y.value = v),
        type: "search",
        placeholder: "找个游戏",
        "aria-label": "搜索游戏"
      }, null, 512), [[oe, y.value]])]),
      a("nav", ye, [(o(), f(j, null, Q(l, (v) => a("button", {
        key: v,
        type: "button",
        "aria-pressed": e.value === v,
        onClick: (I) => e.value = v
      }, b(v), 9, ge)), 64))]),
      a("div", be, [(o(!0), f(j, null, Q(u.value, (v) => (o(), f("button", {
        key: v.id,
        type: "button",
        class: Y(["game-tile", "tone-" + v.tone]),
        "data-game-room": v.id,
        onClick: (I) => p.$emit("open", v.id)
      }, [a("div", he, [a("img", {
        src: v.artwork,
        alt: "",
        loading: "lazy"
      }, null, 8, _e), "mascotPortrait" in v ? (o(), f("img", {
        key: 0,
        class: "game-tile-mascot",
        src: v.mascotPortrait,
        alt: "",
        loading: "lazy"
      }, null, 8, ke)) : $("", !0)]), a("div", $e, [a("h3", null, b(v.name), 1), a("span", null, [le(b(v.entry) + " ", 1), d[6] || (d[6] = a("i", { "aria-hidden": "true" }, "↗", -1))])])], 10, pe))), 128))]),
      u.value.length ? $("", !0) : (o(), f("div", Ce, [
        d[7] || (d[7] = a("h3", null, "没找到这个游戏", -1)),
        d[8] || (d[8] = a("p", null, "换个名字，或者看看其他分类。", -1)),
        a("button", {
          type: "button",
          onClick: d[2] || (d[2] = (v) => {
            y.value = "", e.value = "全部";
          })
        }, " 查看全部 ")
      ]))
    ]));
  }
}), Ie = Ge, Se = {
  class: "game-records",
  "aria-labelledby": "game-records-title"
}, we = { class: "game-section-heading" }, Ae = {
  key: 0,
  class: "game-record-list"
}, Me = {
  class: "game-record-mark",
  "aria-hidden": "true"
}, Re = { class: "game-record-main" }, Te = ["datetime"], Be = { class: "game-record-money" }, De = {
  key: 1,
  class: "game-record-empty"
}, Ee = {
  key: 2,
  class: "game-inline-error",
  role: "status"
}, Le = ["disabled"], Ue = /* @__PURE__ */ W({
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
    function y(e) {
      return new Intl.DateTimeFormat("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(e));
    }
    return (e, l) => (o(), f("section", Se, [
      a("header", we, [l[1] || (l[1] = a("div", null, [a("h2", { id: "game-records-title" }, "记录")], -1)), a("small", null, b(i.total) + " 局", 1)]),
      i.records.length ? (o(), f("div", Ae, [(o(!0), f(j, null, Q(i.records, (u) => (o(), f("article", {
        key: u.id,
        class: Y(["game-record", `is-${u.outcomeTone}`])
      }, [a("div", Me, b(t(K)(u.game).mark), 1), a("div", Re, [
        a("header", null, [a("div", null, [a("span", null, b(u.gameLabel), 1), a("strong", null, b(u.outcomeLabel), 1)]), a("time", { datetime: new Date(u.createdAt).toISOString() }, b(y(u.createdAt)), 9, Te)]),
        a("div", Be, [
          a("span", null, "下注 ¤ " + b(u.amountIn), 1),
          a("span", null, "拿回 ¤ " + b(u.payout), 1),
          a("strong", null, b(u.net > 0 ? "+" : "") + b(u.net), 1)
        ]),
        a("details", null, [l[2] || (l[2] = a("summary", null, "本局详情", -1)), (o(), z(J(t(K)(u.game).record), { detail: u.detail }, null, 8, ["detail"]))])
      ])], 2))), 128))])) : (o(), f("div", De, [...l[3] || (l[3] = [a("span", { "aria-hidden": "true" }, "◇", -1), a("p", null, "暂无游戏记录", -1)])])),
      i.error ? (o(), f("p", Ee, b(i.error), 1)) : $("", !0),
      i.hasMore ? (o(), f("button", {
        key: 3,
        type: "button",
        class: "game-load-more",
        disabled: i.loadingMore,
        onClick: l[0] || (l[0] = (u) => e.$emit("loadMore"))
      }, b(i.loadingMore ? "正在翻阅…" : "更多记录"), 9, Le)) : $("", !0)
    ]));
  }
}), Ne = Ue, xe = {
  key: 0,
  class: "game-header"
}, ze = {
  class: "game-funds",
  "aria-label": "可用小白币"
}, Fe = {
  key: 1,
  class: "game-nav",
  "aria-label": "游戏页面"
}, Ve = ["aria-current"], qe = ["aria-current"], Pe = ["aria-current"], Oe = {
  key: 2,
  class: "game-notice",
  role: "status"
}, je = ["disabled"], Ke = ["disabled"], Xe = ["disabled"], He = {
  key: 0,
  class: "game-empty",
  role: "status"
}, Je = {
  key: 1,
  class: "game-empty",
  role: "status"
}, Qe = /* @__PURE__ */ W({
  __name: "GameApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(i) {
    const y = i, e = ve(y.bridge, y.initialState), { state: l, settlement: u, funds: p, inFlight: d, reading: v, loadingMore: I, busy: D, error: G, recordsError: _, failed: C, disabledReason: S, needsSave: w, refreshDisabled: X } = e, N = h(null);
    let E = 0;
    const g = h(l.value.activeGame ? "room" : "lobby"), k = h(l.value.activeGame?.kind || null), A = re(null), M = h(""), R = h(!1);
    let T = 0;
    const L = B(() => k.value ? de(k.value) : null), U = B(() => g.value === "room" && L.value?.mode === "standalone");
    async function q() {
      const s = L.value, n = ++T;
      if (A.value = null, M.value = "", !!s) {
        R.value = !0;
        try {
          const c = await s.load();
          n === T && (A.value = c.default);
        } catch {
          n === T && (M.value = "这个游戏暂时没能打开，再试一次吧。");
        } finally {
          n === T && (R.value = !1);
        }
      }
    }
    O([
      g,
      k,
      () => !!l.value.activeGame,
      () => !!u.value
    ], (s, n) => {
      n[0] === "lobby" && (E = N.value?.scrollTop || 0), Z(() => {
        N.value?.scrollTo({ top: g.value === "lobby" ? E : 0 });
      });
    }), O(k, q, { immediate: !0 }), O(u, (s) => {
      s && (k.value = s.record.game);
    }), O(() => l.value.chatIdentity, () => {
      E = 0, k.value = l.value.activeGame?.kind || null, g.value = k.value ? "room" : "lobby", Z(() => {
        E = 0, N.value?.scrollTo({ top: 0 });
      });
    });
    function F(s) {
      k.value = s, g.value = "room";
    }
    function x(s) {
      e.dismissSettlement(), g.value = s;
    }
    se(() => g.value === "lobby" ? !1 : (x("lobby"), !0));
    function P() {
      l.value.activeGame && F(l.value.activeGame.kind);
    }
    function r() {
      e.dismissSettlement();
    }
    async function m(s) {
      await e.act(s);
    }
    return ne(() => {
      T += 1, e.dispose();
    }), (s, n) => (o(), f("main", { class: Y(["game-app", { "game-app-standalone": U.value }]) }, [
      U.value ? $("", !0) : (o(), f("header", xe, [a("h1", null, b(g.value === "room" ? L.value?.name : "游戏"), 1), a("div", ze, [a("strong", null, "¤ " + b(t(p).balance.toLocaleString("zh-CN")), 1)])])),
      U.value ? $("", !0) : (o(), f("nav", Fe, [
        a("button", {
          type: "button",
          "aria-current": g.value === "lobby" ? "page" : void 0,
          onClick: n[0] || (n[0] = (c) => x("lobby"))
        }, " 大厅 ", 8, Ve),
        t(l).activeGame ? (o(), f("button", {
          key: 0,
          type: "button",
          "aria-current": g.value === "room" && k.value === t(l).activeGame.kind ? "page" : void 0,
          onClick: P
        }, [...n[6] || (n[6] = [le(" 继续 ", -1), a("i", null, null, -1)])], 8, qe)) : $("", !0),
        a("button", {
          type: "button",
          "aria-current": g.value === "records" ? "page" : void 0,
          onClick: n[1] || (n[1] = (c) => x("records"))
        }, " 记录 ", 8, Pe)
      ])),
      !U.value && (t(l).message || t(G) || t(l).generationActive) ? (o(), f("aside", Oe, [
        a("p", null, b(t(G) || t(l).message || "故事正在回复，等回复结束就能继续玩。"), 1),
        t(w) ? (o(), f("button", {
          key: 0,
          type: "button",
          disabled: t(D),
          onClick: n[2] || (n[2] = (...c) => t(e).confirmSave && t(e).confirmSave(...c))
        }, b(t(v) ? "正在检查…" : t(l).status === "save-failed" ? "重试保存" : "检查保存"), 9, je)) : t(C) ? (o(), f("button", {
          key: 1,
          type: "button",
          disabled: t(D) || t(l).generationActive,
          onClick: n[3] || (n[3] = (...c) => t(e).retry && t(e).retry(...c))
        }, " 重试这次操作 ", 8, Ke)) : $("", !0),
        !t(w) && t(l).status !== "conflict" ? (o(), f("button", {
          key: 2,
          type: "button",
          disabled: t(X),
          onClick: n[4] || (n[4] = (...c) => t(e).refresh && t(e).refresh(...c))
        }, " 重新加载 ", 8, Xe)) : $("", !0)
      ])) : $("", !0),
      a("div", {
        ref_key: "scroll",
        ref: N,
        class: "game-scroll"
      }, [
        te((o(), z(Ie, {
          key: t(l).chatIdentity,
          "active-game": t(l).activeGame,
          onOpen: F
        }, null, 8, ["active-game"])), [[ie, g.value === "lobby"]]),
        g.value === "records" ? (o(), z(Ne, {
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
        ])) : g.value === "room" ? (o(), f(j, { key: 1 }, [R.value ? (o(), f("div", He, [...n[7] || (n[7] = [a("p", null, "正在摆好桌面…", -1)])])) : M.value ? (o(), f("div", Je, [a("p", null, b(M.value), 1), a("button", {
          type: "button",
          onClick: q
        }, "重新打开")])) : A.value && L.value?.mode === "wager" ? (o(), z(J(A.value), {
          key: 2,
          state: t(l),
          "disabled-reason": t(S),
          "in-flight": t(d),
          settlement: t(u)?.record.game === k.value ? t(u) : null,
          onRevealed: t(e).revealComplete,
          onAction: m,
          onAgain: r,
          onLobby: n[5] || (n[5] = (c) => x("lobby")),
          onResume: P
        }, null, 40, [
          "state",
          "disabled-reason",
          "in-flight",
          "settlement",
          "onRevealed"
        ])) : $("", !0)], 64)) : $("", !0),
        (o(), z(ue, {
          key: t(l).chatIdentity,
          max: 1
        }, [U.value && A.value && !R.value && !M.value ? (o(), z(J(A.value), {
          key: k.value,
          bridge: y.bridge,
          "chat-identity": t(l).chatIdentity,
          "generation-active": t(l).generationActive
        }, null, 8, [
          "bridge",
          "chat-identity",
          "generation-active"
        ])) : $("", !0)], 1024))
      ], 512)
    ], 2));
  }
}), Ze = Qe;
export {
  Ze as default
};
