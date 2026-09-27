/* eslint-disable */
import { $ as J, E as W, F as o, G as te, H as j, L as Y, O as ne, Q as t, X as re, Y as h, Z as q, _ as m, d as oe, g as $, h as x, m as a, o as ue, p as E, s as ie, tt as b, u as H, x as P, y as le, z as Z } from "./xiaobai-os-runtime-dom.esm-bundler-DuiaxqDz.js";
import { n as se } from "./xiaobai-os-app-navigation-CKmHuh0u.js";
import { n as de, r as K, t as ee } from "./xiaobai-os-room-catalog-wdTdAbjP.js";
function ae(u) {
  return u && typeof u == "object" && "code" in u ? String(u.code) : "";
}
function X(u) {
  const g = u instanceof Error ? u.message : String(u);
  return g.includes("economy_insufficient_funds") || g.includes("cannot be overdrawn") ? "小白币不够了，换个小一点的筹码吧。" : g.includes("game_dice_bid_not_higher") ? "这次要叫得比对方更大一些。" : g.includes("game_revision_conflict") || g.includes("game_event_id_conflict") ? "本局已有变化，请重新加载后继续。" : g.includes("game_main_generation_active") ? "故事正在回复，等回复结束就能继续玩。" : g.includes("聊天已切换") ? "聊天已切换，请重新打开游戏。" : g === "host_request_timeout" ? "暂时没收到结果。可以重试这次操作，不会重复下注或重新抽取结果。" : "这次操作没能完成，请重试。";
}
function ve(u, g) {
  const e = h(structuredClone(q(g))), l = h(null), i = h(null), p = h(null), v = h(!1), y = h(!1), I = h(""), L = h(""), G = h(null);
  let k = !1, C = 0, S = 0, w = 0, Q = 0;
  function U() {
    return typeof globalThis.crypto?.randomUUID == "function" ? "game-ui:" + globalThis.crypto.randomUUID() : "game-ui:" + Date.now() + ":" + ++Q;
  }
  const T = E(() => ["unconfirmed", "save-failed"].includes(e.value.status)), f = E(() => v.value || !!p.value), _ = E(() => f.value ? "上一项操作还在进行，请稍候。" : e.value.status !== "ready" ? e.value.message || "游戏正在准备，请稍候。" : G.value ? "请先重试这次操作，或重新加载本局结果。" : e.value.generationActive ? "故事正在回复，等回复结束就能继续玩。" : ""), A = E(() => i.value ?? {
    balance: e.value.balance,
    lockedAmount: e.value.lockedAmount
  }), M = E(() => f.value || T.value || [
    "conflict",
    "saving",
    "loading"
  ].includes(e.value.status));
  function R(r) {
    const c = e.value;
    if (c.chatIdentity !== r.chatIdentity)
      l.value = null, i.value = null, G.value = null, p.value = null, v.value = !1, S += 1, w += 1;
    else if (c.activeGame && r.status === "ready" && !r.activeGame) {
      const s = r.records.find((n) => n.gameId === c.activeGame.id);
      s && (i.value = {
        balance: c.balance,
        lockedAmount: c.lockedAmount
      }, l.value = {
        before: structuredClone(q(c.activeGame)),
        record: structuredClone(s),
        balanceAfter: r.balance
      });
    }
    e.value = structuredClone(r), y.value = !1, L.value = "", I.value = "", G.value = null;
  }
  function B(r) {
    const c = r === "game_save_pending" ? "save-failed" : r === "storage_unconfirmed" ? "unconfirmed" : r === "storage_conflict" ? "conflict" : null;
    return c ? (e.value = {
      ...e.value,
      status: c,
      message: c === "save-failed" ? "这局还没保存好，请重试保存后继续。" : c === "unconfirmed" ? "还不确定是否保存成功，请先检查保存。" : "服务器上的游戏记录与当前内容不同，请重新打开酒馆后继续。"
    }, !0) : !1;
  }
  async function D(r) {
    const c = e.value.chatIdentity, s = C, n = w;
    p.value = r.action, G.value = null, I.value = "";
    try {
      const d = await u.request(r.endpoint, r.payload, 35e3);
      return k || n !== w || e.value.chatIdentity !== c ? !1 : (C === s && R(d.result), !0);
    } catch (d) {
      return !k && n === w && C === s && e.value.chatIdentity === c && !B(ae(d)) && (I.value = X(d), e.value.status === "ready" && (G.value = r)), !1;
    } finally {
      !k && n === w && e.value.chatIdentity === c && (p.value = null);
    }
  }
  async function F(r) {
    return k || _.value ? !1 : D({
      endpoint: r.endpoint,
      action: structuredClone(q(r)),
      payload: {
        ...structuredClone(q(r.payload || {})),
        chatIdentity: e.value.chatIdentity,
        expectedRevision: e.value.revision,
        expectedEventId: e.value.eventId,
        actionId: U()
      }
    });
  }
  async function V() {
    return k || !G.value || f.value || e.value.status !== "ready" || e.value.generationActive ? !1 : D(structuredClone(q(G.value)));
  }
  async function z(r = !1) {
    if (k || f.value || !r && M.value) return;
    const c = e.value.chatIdentity, s = C, n = ++S;
    v.value = !0, I.value = "";
    try {
      const d = await u.request(r ? "game/confirm-save" : "game/refresh", { chatIdentity: c }, 35e3);
      if (k || n !== S || e.value.chatIdentity !== c) return;
      s === C && R("state" in d.result ? d.result.state : d.result), G.value = null;
    } catch (d) {
      !k && n === S && s === C && e.value.chatIdentity === c && (B(ae(d)) || (I.value = X(d)));
    } finally {
      n === S && (v.value = !1);
    }
  }
  async function N() {
    if (k || !e.value.hasMore || y.value || f.value || e.value.status !== "ready") return;
    const r = C, c = e.value.chatIdentity;
    y.value = !0, L.value = "";
    try {
      const s = await u.request("game/records/load-more", {
        chatIdentity: c,
        offset: e.value.records.length
      }, 35e3);
      if (k || r !== C || c !== e.value.chatIdentity) return;
      const n = new Set(e.value.records.map((d) => d.id));
      e.value.records.push(...s.result.records.filter((d) => !n.has(d.id))), e.value.total = s.result.total, e.value.hasMore = s.result.hasMore;
    } catch (s) {
      !k && r === C && c === e.value.chatIdentity && (L.value = X(s));
    } finally {
      r === C && (y.value = !1);
    }
  }
  const O = u.subscribe((r) => {
    k || (r.type === "game/state" ? (C += 1, R(r.payload.state)) : r.type === "game/error" && (I.value = "游戏暂时无法读取，请重新打开。"));
  });
  return {
    state: e,
    settlement: l,
    funds: A,
    inFlight: p,
    reading: v,
    loadingMore: y,
    busy: f,
    error: I,
    recordsError: L,
    failed: G,
    disabledReason: _,
    needsSave: T,
    refreshDisabled: M,
    act: F,
    retry: V,
    loadMore: N,
    refresh: () => z(),
    confirmSave: () => z(!0),
    revealComplete: () => {
      i.value = null;
    },
    dismissSettlement: () => {
      l.value = null, i.value = null;
    },
    dispose: () => {
      k = !0, S += 1, O();
    }
  };
}
var ce = { class: "game-lobby" }, me = ["src"], ye = { class: "game-search" }, fe = {
  class: "game-categories",
  "aria-label": "游戏分类"
}, ge = ["aria-pressed", "onClick"], be = { class: "game-shelf" }, pe = ["onClick"], he = { class: "game-tile-art" }, ke = ["src"], _e = { class: "game-tile-copy" }, $e = {
  key: 1,
  class: "game-empty"
}, Ce = /* @__PURE__ */ P({
  __name: "GameLobby",
  props: { activeGame: {} },
  emits: ["open"],
  setup(u) {
    const g = h(""), e = h("全部"), l = ["全部", ...new Set(ee.map((p) => p.category))], i = E(() => ee.filter((p) => (e.value === "全部" || p.category === e.value) && (p.name + p.tagline + p.category).includes(g.value.trim())));
    return (p, v) => (o(), m("section", ce, [
      u.activeGame ? (o(), m("button", {
        key: 0,
        type: "button",
        class: "game-continue",
        onClick: v[0] || (v[0] = (y) => p.$emit("open", u.activeGame.kind))
      }, [
        a("img", {
          src: t(K)(u.activeGame.kind).artwork,
          alt: ""
        }, null, 8, me),
        a("span", null, [v[3] || (v[3] = a("small", null, "进行中", -1)), a("strong", null, b(t(K)(u.activeGame.kind).name), 1)]),
        v[4] || (v[4] = a("b", null, "继续 →", -1))
      ])) : $("", !0),
      a("label", ye, [v[5] || (v[5] = a("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [a("circle", {
        cx: "10.5",
        cy: "10.5",
        r: "6.5"
      }), a("path", { d: "m16 16 4 4" })], -1)), te(a("input", {
        "onUpdate:modelValue": v[1] || (v[1] = (y) => g.value = y),
        type: "search",
        placeholder: "找个游戏",
        "aria-label": "搜索游戏"
      }, null, 512), [[ue, g.value]])]),
      a("nav", fe, [(o(), m(H, null, Y(l, (y) => a("button", {
        key: y,
        type: "button",
        "aria-pressed": e.value === y,
        onClick: (I) => e.value = y
      }, b(y), 9, ge)), 64))]),
      a("div", be, [(o(!0), m(H, null, Y(i.value, (y) => (o(), m("button", {
        key: y.id,
        type: "button",
        class: J(["game-tile", "tone-" + y.tone]),
        onClick: (I) => p.$emit("open", y.id)
      }, [a("div", he, [a("img", {
        src: y.artwork,
        alt: "",
        loading: "lazy"
      }, null, 8, ke)]), a("div", _e, [a("h3", null, b(y.name), 1), a("span", null, [le(b(y.entry) + " ", 1), v[6] || (v[6] = a("i", { "aria-hidden": "true" }, "↗", -1))])])], 10, pe))), 128))]),
      i.value.length ? $("", !0) : (o(), m("div", $e, [
        v[7] || (v[7] = a("h3", null, "没找到这个游戏", -1)),
        v[8] || (v[8] = a("p", null, "换个名字，或者看看其他分类。", -1)),
        a("button", {
          type: "button",
          onClick: v[2] || (v[2] = (y) => {
            g.value = "", e.value = "全部";
          })
        }, " 查看全部 ")
      ]))
    ]));
  }
}), Ge = Ce, Ie = {
  class: "game-records",
  "aria-labelledby": "game-records-title"
}, Se = { class: "game-section-heading" }, we = {
  key: 0,
  class: "game-record-list"
}, Ae = {
  class: "game-record-mark",
  "aria-hidden": "true"
}, Me = { class: "game-record-main" }, Re = ["datetime"], Be = { class: "game-record-money" }, Ee = {
  key: 1,
  class: "game-record-empty"
}, Le = {
  key: 2,
  class: "game-inline-error",
  role: "status"
}, Te = ["disabled"], De = /* @__PURE__ */ P({
  __name: "GameRecords",
  props: {
    records: {},
    total: {},
    hasMore: { type: Boolean },
    loadingMore: { type: Boolean },
    error: {}
  },
  emits: ["loadMore"],
  setup(u) {
    function g(e) {
      return new Intl.DateTimeFormat("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(e));
    }
    return (e, l) => (o(), m("section", Ie, [
      a("header", Se, [l[1] || (l[1] = a("div", null, [a("h2", { id: "game-records-title" }, "记录")], -1)), a("small", null, b(u.total) + " 局", 1)]),
      u.records.length ? (o(), m("div", we, [(o(!0), m(H, null, Y(u.records, (i) => (o(), m("article", {
        key: i.id,
        class: J(["game-record", `is-${i.outcomeTone}`])
      }, [a("div", Ae, b(t(K)(i.game).mark), 1), a("div", Me, [
        a("header", null, [a("div", null, [a("span", null, b(i.gameLabel), 1), a("strong", null, b(i.outcomeLabel), 1)]), a("time", { datetime: new Date(i.createdAt).toISOString() }, b(g(i.createdAt)), 9, Re)]),
        a("div", Be, [
          a("span", null, "下注 ¤ " + b(i.amountIn), 1),
          a("span", null, "拿回 ¤ " + b(i.payout), 1),
          a("strong", null, b(i.net > 0 ? "+" : "") + b(i.net), 1)
        ]),
        a("details", null, [l[2] || (l[2] = a("summary", null, "本局详情", -1)), (o(), x(Z(t(K)(i.game).record), { detail: i.detail }, null, 8, ["detail"]))])
      ])], 2))), 128))])) : (o(), m("div", Ee, [...l[3] || (l[3] = [a("span", { "aria-hidden": "true" }, "◇", -1), a("p", null, "暂无游戏记录", -1)])])),
      u.error ? (o(), m("p", Le, b(u.error), 1)) : $("", !0),
      u.hasMore ? (o(), m("button", {
        key: 3,
        type: "button",
        class: "game-load-more",
        disabled: u.loadingMore,
        onClick: l[0] || (l[0] = (i) => e.$emit("loadMore"))
      }, b(u.loadingMore ? "正在翻阅…" : "更多记录"), 9, Te)) : $("", !0)
    ]));
  }
}), Fe = De, Ne = { class: "game-header" }, Ue = {
  key: 1,
  class: "game-funds",
  "aria-label": "可用小白币"
}, xe = {
  key: 0,
  class: "game-nav",
  "aria-label": "游戏页面"
}, ze = ["aria-current"], qe = ["aria-current"], Ve = ["aria-current"], Oe = {
  key: 1,
  class: "game-notice",
  role: "status"
}, je = ["disabled"], He = ["disabled"], Ke = ["disabled"], Qe = {
  key: 0,
  class: "game-empty",
  role: "status"
}, Xe = {
  key: 1,
  class: "game-empty",
  role: "status"
}, Ye = /* @__PURE__ */ P({
  __name: "GameApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(u) {
    const g = u, e = ve(g.bridge, g.initialState), { state: l, settlement: i, funds: p, inFlight: v, reading: y, loadingMore: I, busy: L, error: G, recordsError: k, failed: C, disabledReason: S, needsSave: w, refreshDisabled: Q } = e, U = h(null);
    let T = 0;
    const f = h(l.value.activeGame ? "room" : "lobby"), _ = h(l.value.activeGame?.kind || null), A = re(null), M = h(""), R = h(!1);
    let B = 0;
    const D = E(() => _.value ? de(_.value) : null), F = E(() => f.value === "room" && D.value?.mode === "standalone");
    async function V() {
      const s = D.value, n = ++B;
      if (A.value = null, M.value = "", !!s) {
        R.value = !0;
        try {
          const d = await s.load();
          n === B && (A.value = d.default);
        } catch {
          n === B && (M.value = "这个游戏暂时没能打开，再试一次吧。");
        } finally {
          n === B && (R.value = !1);
        }
      }
    }
    j([
      f,
      _,
      () => !!l.value.activeGame,
      () => !!i.value
    ], (s, n) => {
      n[0] === "lobby" && (T = U.value?.scrollTop || 0), W(() => {
        U.value?.scrollTo({ top: f.value === "lobby" ? T : 0 });
      });
    }), j(_, V, { immediate: !0 }), j(i, (s) => {
      s && (_.value = s.record.game);
    }), j(() => l.value.chatIdentity, () => {
      T = 0, _.value = l.value.activeGame?.kind || null, f.value = _.value ? "room" : "lobby", W(() => {
        T = 0, U.value?.scrollTo({ top: 0 });
      });
    });
    function z(s) {
      _.value = s, f.value = "room";
    }
    function N(s) {
      e.dismissSettlement(), f.value = s;
    }
    se(() => f.value === "lobby" ? !1 : (N("lobby"), !0));
    function O() {
      l.value.activeGame && z(l.value.activeGame.kind);
    }
    function r() {
      e.dismissSettlement();
    }
    async function c(s) {
      await e.act(s);
    }
    return ne(() => {
      B += 1, e.dispose();
    }), (s, n) => (o(), m("main", { class: J(["game-app", { "game-app-standalone": F.value }]) }, [
      a("header", Ne, [
        f.value === "room" ? (o(), m("button", {
          key: 0,
          type: "button",
          class: "game-back",
          "aria-label": "返回游戏大厅",
          onClick: n[0] || (n[0] = (d) => N("lobby"))
        }, " ‹ ")) : $("", !0),
        a("h1", null, b(f.value === "room" ? D.value?.name : "游戏"), 1),
        F.value ? $("", !0) : (o(), m("div", Ue, [a("strong", null, "¤ " + b(t(p).balance.toLocaleString("zh-CN")), 1)]))
      ]),
      F.value ? $("", !0) : (o(), m("nav", xe, [
        a("button", {
          type: "button",
          "aria-current": f.value === "lobby" ? "page" : void 0,
          onClick: n[1] || (n[1] = (d) => N("lobby"))
        }, " 大厅 ", 8, ze),
        t(l).activeGame ? (o(), m("button", {
          key: 0,
          type: "button",
          "aria-current": f.value === "room" && _.value === t(l).activeGame.kind ? "page" : void 0,
          onClick: O
        }, [...n[7] || (n[7] = [le(" 继续 ", -1), a("i", null, null, -1)])], 8, qe)) : $("", !0),
        a("button", {
          type: "button",
          "aria-current": f.value === "records" ? "page" : void 0,
          onClick: n[2] || (n[2] = (d) => N("records"))
        }, " 记录 ", 8, Ve)
      ])),
      !F.value && (t(l).message || t(G) || t(l).generationActive) ? (o(), m("aside", Oe, [
        a("p", null, b(t(G) || t(l).message || "故事正在回复，等回复结束就能继续玩。"), 1),
        t(w) ? (o(), m("button", {
          key: 0,
          type: "button",
          disabled: t(L),
          onClick: n[3] || (n[3] = (...d) => t(e).confirmSave && t(e).confirmSave(...d))
        }, b(t(y) ? "正在检查…" : t(l).status === "save-failed" ? "重试保存" : "检查保存"), 9, je)) : t(C) ? (o(), m("button", {
          key: 1,
          type: "button",
          disabled: t(L) || t(l).generationActive,
          onClick: n[4] || (n[4] = (...d) => t(e).retry && t(e).retry(...d))
        }, " 重试这次操作 ", 8, He)) : $("", !0),
        !t(w) && t(l).status !== "conflict" ? (o(), m("button", {
          key: 2,
          type: "button",
          disabled: t(Q),
          onClick: n[5] || (n[5] = (...d) => t(e).refresh && t(e).refresh(...d))
        }, " 重新加载 ", 8, Ke)) : $("", !0)
      ])) : $("", !0),
      a("div", {
        ref_key: "scroll",
        ref: U,
        class: "game-scroll"
      }, [
        te((o(), x(Ge, {
          key: t(l).chatIdentity,
          "active-game": t(l).activeGame,
          onOpen: z
        }, null, 8, ["active-game"])), [[ie, f.value === "lobby"]]),
        f.value === "records" ? (o(), x(Fe, {
          key: 0,
          records: t(l).records,
          total: t(l).total,
          "has-more": t(l).hasMore,
          "loading-more": t(I),
          error: t(k),
          onLoadMore: t(e).loadMore
        }, null, 8, [
          "records",
          "total",
          "has-more",
          "loading-more",
          "error",
          "onLoadMore"
        ])) : f.value === "room" ? (o(), m(H, { key: 1 }, [R.value ? (o(), m("div", Qe, [...n[8] || (n[8] = [a("p", null, "正在摆好桌面…", -1)])])) : M.value ? (o(), m("div", Xe, [a("p", null, b(M.value), 1), a("button", {
          type: "button",
          onClick: V
        }, "重新打开")])) : A.value && D.value?.mode === "wager" ? (o(), x(Z(A.value), {
          key: 2,
          state: t(l),
          "disabled-reason": t(S),
          "in-flight": t(v),
          settlement: t(i)?.record.game === _.value ? t(i) : null,
          onRevealed: t(e).revealComplete,
          onAction: c,
          onAgain: r,
          onLobby: n[6] || (n[6] = (d) => N("lobby")),
          onResume: O
        }, null, 40, [
          "state",
          "disabled-reason",
          "in-flight",
          "settlement",
          "onRevealed"
        ])) : $("", !0)], 64)) : $("", !0),
        (o(), x(oe, {
          key: t(l).chatIdentity,
          max: 1
        }, [F.value && A.value && !R.value && !M.value ? (o(), x(Z(A.value), {
          key: _.value,
          bridge: g.bridge,
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
}), We = Ye;
export {
  We as default
};
