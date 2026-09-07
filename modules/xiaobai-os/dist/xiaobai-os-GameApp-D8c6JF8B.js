/* eslint-disable */
import { G as t, H as p, I as x, J as g, K as ee, N as ae, T as ne, U as re, W as z, b as Q, f as L, g as m, h as I, j as P, k as u, m as j, o as oe, p as a, s as se, u as H, v as te, w as X, z as le } from "./xiaobai-os-runtime-dom.esm-bundler-DGqntx6-.js";
import { n as ie } from "./xiaobai-os-app-navigation-D5qZ5Ulq.js";
import { n as F, t as Y } from "./xiaobai-os-room-catalog-BYX95Q29.js";
function Z(s) {
  return s && typeof s == "object" && "code" in s ? String(s.code) : "";
}
function W(s) {
  const y = s instanceof Error ? s.message : String(s);
  return y.includes("economy_insufficient_funds") || y.includes("cannot be overdrawn") ? "小白币不够了，换个小一点的筹码吧。" : y.includes("game_dice_bid_not_higher") ? "这次要叫得比对方更大一些。" : y.includes("game_revision_conflict") || y.includes("game_event_id_conflict") ? "本局已有变化，请重新读取后继续。" : y.includes("game_main_generation_active") ? "故事正在回复，等回复结束就能继续玩。" : y.includes("聊天已切换") ? "聊天已切换，请重新打开游戏。" : y === "host_request_timeout" ? "等待结果超时了。可以重试这次操作，不会重复下注或重新抽取结果。" : "这次操作没能完成，请重试。";
}
function ue(s, y) {
  const e = p(structuredClone(z(y))), n = p(null), i = p(null), b = p(null), d = p(!1), v = p(!1), G = p(""), R = p(""), C = p(null);
  let h = !1, k = 0, S = 0, w = 0, J = 0;
  function E() {
    return typeof globalThis.crypto?.randomUUID == "function" ? "game-ui:" + globalThis.crypto.randomUUID() : "game-ui:" + Date.now() + ":" + ++J;
  }
  const B = L(() => ["unconfirmed", "save-failed"].includes(e.value.status)), f = L(() => d.value || !!b.value), $ = L(() => f.value ? "上一项操作还在进行，请稍候。" : e.value.status !== "ready" ? e.value.message || "游戏正在准备，请稍候。" : C.value ? "请先重试这次操作，或重新读取本局结果。" : e.value.generationActive ? "故事正在回复，等回复结束就能继续玩。" : ""), U = L(() => i.value ?? {
    balance: e.value.balance,
    lockedAmount: e.value.lockedAmount
  }), T = L(() => f.value || B.value || [
    "conflict",
    "saving",
    "loading"
  ].includes(e.value.status));
  function D(o) {
    const r = e.value;
    if (r.chatIdentity !== o.chatIdentity)
      n.value = null, i.value = null, C.value = null, b.value = null, d.value = !1, S += 1, w += 1;
    else if (r.activeGame && o.status === "ready" && !o.activeGame) {
      const l = o.records.find((c) => c.gameId === r.activeGame.id);
      l && (i.value = {
        balance: r.balance,
        lockedAmount: r.lockedAmount
      }, n.value = {
        before: structuredClone(z(r.activeGame)),
        record: structuredClone(l),
        balanceAfter: o.balance
      });
    }
    e.value = structuredClone(o), v.value = !1, R.value = "", G.value = "", C.value = null;
  }
  function M(o) {
    const r = o === "game_save_pending" ? "save-failed" : o === "storage_unconfirmed" ? "unconfirmed" : o === "storage_conflict" ? "conflict" : null;
    return r ? (e.value = {
      ...e.value,
      status: r,
      message: r === "save-failed" ? "这局还没保存好，请重试保存后继续。" : r === "unconfirmed" ? "保存结果尚未确认，请先核实。" : "保存的版本不一致，请重新打开酒馆后继续。"
    }, !0) : !1;
  }
  async function N(o) {
    const r = e.value.chatIdentity, l = k, c = w;
    b.value = o.action, C.value = null, G.value = "";
    try {
      const _ = await s.request(o.endpoint, o.payload, 35e3);
      return h || c !== w || e.value.chatIdentity !== r ? !1 : (k === l && D(_.result), !0);
    } catch (_) {
      return !h && c === w && k === l && e.value.chatIdentity === r && !M(Z(_)) && (G.value = W(_), e.value.status === "ready" && (C.value = o)), !1;
    } finally {
      !h && c === w && e.value.chatIdentity === r && (b.value = null);
    }
  }
  async function q(o) {
    return h || $.value ? !1 : N({
      endpoint: o.endpoint,
      action: structuredClone(z(o)),
      payload: {
        ...structuredClone(z(o.payload || {})),
        chatIdentity: e.value.chatIdentity,
        expectedRevision: e.value.revision,
        expectedEventId: e.value.eventId,
        actionId: E()
      }
    });
  }
  async function O() {
    return h || !C.value || f.value || e.value.status !== "ready" || e.value.generationActive ? !1 : N(structuredClone(z(C.value)));
  }
  async function A(o = !1) {
    if (h || f.value || !o && T.value) return;
    const r = e.value.chatIdentity, l = k, c = ++S;
    d.value = !0, G.value = "";
    try {
      const _ = await s.request(o ? "game/confirm-save" : "game/refresh", { chatIdentity: r }, 35e3);
      if (h || c !== S || e.value.chatIdentity !== r) return;
      l === k && D("state" in _.result ? _.result.state : _.result), C.value = null;
    } catch (_) {
      !h && c === S && l === k && e.value.chatIdentity === r && (M(Z(_)) || (G.value = W(_)));
    } finally {
      c === S && (d.value = !1);
    }
  }
  async function V() {
    if (h || !e.value.hasMore || v.value || f.value || e.value.status !== "ready") return;
    const o = k, r = e.value.chatIdentity;
    v.value = !0, R.value = "";
    try {
      const l = await s.request("game/records/load-more", {
        chatIdentity: r,
        offset: e.value.records.length
      }, 35e3);
      if (h || o !== k || r !== e.value.chatIdentity) return;
      const c = new Set(e.value.records.map((_) => _.id));
      e.value.records.push(...l.result.records.filter((_) => !c.has(_.id))), e.value.total = l.result.total, e.value.hasMore = l.result.hasMore;
    } catch (l) {
      !h && o === k && r === e.value.chatIdentity && (R.value = W(l));
    } finally {
      o === k && (v.value = !1);
    }
  }
  const K = s.subscribe((o) => {
    h || (o.type === "game/state" ? (k += 1, D(o.payload.state)) : o.type === "game/error" && (G.value = "游戏暂时无法读取，请重新打开。"));
  });
  return {
    state: e,
    settlement: n,
    funds: U,
    inFlight: b,
    reading: d,
    loadingMore: v,
    busy: f,
    error: G,
    recordsError: R,
    failed: C,
    disabledReason: $,
    needsSave: B,
    refreshDisabled: T,
    act: q,
    retry: O,
    loadMore: V,
    refresh: () => A(),
    confirmSave: () => A(!0),
    revealComplete: () => {
      i.value = null;
    },
    dismissSettlement: () => {
      n.value = null, i.value = null;
    },
    dispose: () => {
      h = !0, S += 1, K();
    }
  };
}
var de = { class: "game-lobby" }, ve = ["src"], ce = { class: "game-search" }, me = {
  class: "game-categories",
  "aria-label": "游戏分类"
}, fe = ["aria-pressed", "onClick"], ye = { class: "game-shelf" }, ge = ["onClick"], be = { class: "game-tile-art" }, pe = ["src"], he = { class: "game-tile-copy" }, _e = {
  key: 1,
  class: "game-empty"
}, ke = /* @__PURE__ */ Q({
  __name: "GameLobby",
  props: { activeGame: {} },
  emits: ["open"],
  setup(s) {
    const y = p(""), e = p("全部"), n = ["全部", ...new Set(Y.map((b) => b.category))], i = L(() => Y.filter((b) => (e.value === "全部" || b.category === e.value) && (b.name + b.tagline + b.category).includes(y.value.trim())));
    return (b, d) => (u(), m("section", de, [
      s.activeGame ? (u(), m("button", {
        key: 0,
        type: "button",
        class: "game-continue",
        onClick: d[0] || (d[0] = (v) => b.$emit("open", s.activeGame.kind))
      }, [
        a("img", {
          src: t(F)(s.activeGame.kind).artwork,
          alt: ""
        }, null, 8, ve),
        a("span", null, [d[3] || (d[3] = a("small", null, "进行中", -1)), a("strong", null, g(t(F)(s.activeGame.kind).name), 1)]),
        d[4] || (d[4] = a("b", null, "继续 →", -1))
      ])) : I("", !0),
      a("label", ce, [d[5] || (d[5] = a("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [a("circle", {
        cx: "10.5",
        cy: "10.5",
        r: "6.5"
      }), a("path", { d: "m16 16 4 4" })], -1)), le(a("input", {
        "onUpdate:modelValue": d[1] || (d[1] = (v) => y.value = v),
        type: "search",
        placeholder: "找个游戏",
        "aria-label": "搜索游戏"
      }, null, 512), [[oe, y.value]])]),
      a("nav", me, [(u(), m(H, null, P(n, (v) => a("button", {
        key: v,
        type: "button",
        "aria-pressed": e.value === v,
        onClick: (G) => e.value = v
      }, g(v), 9, fe)), 64))]),
      a("div", ye, [(u(!0), m(H, null, P(i.value, (v) => (u(), m("button", {
        key: v.id,
        type: "button",
        class: ee(["game-tile", "tone-" + v.tone]),
        onClick: (G) => b.$emit("open", v.id)
      }, [a("div", be, [a("img", {
        src: v.artwork,
        alt: "",
        loading: "lazy"
      }, null, 8, pe)]), a("div", he, [a("h3", null, g(v.name), 1), a("span", null, [te(g(v.entry) + " ", 1), d[6] || (d[6] = a("i", { "aria-hidden": "true" }, "↗", -1))])])], 10, ge))), 128))]),
      i.value.length ? I("", !0) : (u(), m("div", _e, [
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
}), $e = ke, Ce = {
  class: "game-records",
  "aria-labelledby": "game-records-title"
}, Ge = { class: "game-section-heading" }, Ie = {
  key: 0,
  class: "game-record-list"
}, Se = {
  class: "game-record-mark",
  "aria-hidden": "true"
}, we = { class: "game-record-main" }, Me = ["datetime"], Ae = { class: "game-record-money" }, Re = {
  key: 1,
  class: "game-record-empty"
}, Be = {
  key: 2,
  class: "game-inline-error",
  role: "status"
}, Te = ["disabled"], De = /* @__PURE__ */ Q({
  __name: "GameRecords",
  props: {
    records: {},
    total: {},
    hasMore: { type: Boolean },
    loadingMore: { type: Boolean },
    error: {}
  },
  emits: ["loadMore"],
  setup(s) {
    function y(e) {
      return new Intl.DateTimeFormat("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(e));
    }
    return (e, n) => (u(), m("section", Ce, [
      a("header", Ge, [n[1] || (n[1] = a("div", null, [a("h2", { id: "game-records-title" }, "记录")], -1)), a("small", null, g(s.total) + " 局", 1)]),
      s.records.length ? (u(), m("div", Ie, [(u(!0), m(H, null, P(s.records, (i) => (u(), m("article", {
        key: i.id,
        class: ee(["game-record", `is-${i.outcomeTone}`])
      }, [a("div", Se, g(t(F)(i.game).mark), 1), a("div", we, [
        a("header", null, [a("div", null, [a("span", null, g(i.gameLabel), 1), a("strong", null, g(i.outcomeLabel), 1)]), a("time", { datetime: new Date(i.createdAt).toISOString() }, g(y(i.createdAt)), 9, Me)]),
        a("div", Ae, [
          a("span", null, "下注 ¤ " + g(i.amountIn), 1),
          a("span", null, "拿回 ¤ " + g(i.payout), 1),
          a("strong", null, g(i.net > 0 ? "+" : "") + g(i.net), 1)
        ]),
        a("details", null, [n[2] || (n[2] = a("summary", null, "本局详情", -1)), (u(), j(ae(t(F)(i.game).record), { detail: i.detail }, null, 8, ["detail"]))])
      ])], 2))), 128))])) : (u(), m("div", Re, [...n[3] || (n[3] = [a("span", { "aria-hidden": "true" }, "◇", -1), a("p", null, "暂无游戏记录", -1)])])),
      s.error ? (u(), m("p", Be, g(s.error), 1)) : I("", !0),
      s.hasMore ? (u(), m("button", {
        key: 3,
        type: "button",
        class: "game-load-more",
        disabled: s.loadingMore,
        onClick: n[0] || (n[0] = (i) => e.$emit("loadMore"))
      }, g(s.loadingMore ? "正在翻阅…" : "更多记录"), 9, Te)) : I("", !0)
    ]));
  }
}), Le = De, Ee = { class: "game-app" }, Ue = { class: "game-header" }, Ne = {
  class: "game-funds",
  "aria-label": "可用小白币"
}, ze = {
  class: "game-nav",
  "aria-label": "游戏页面"
}, Fe = ["aria-current"], qe = ["aria-current"], Oe = ["aria-current"], Ve = {
  key: 0,
  class: "game-notice",
  role: "status"
}, xe = ["disabled"], je = ["disabled"], He = ["disabled"], Je = {
  key: 0,
  class: "game-empty",
  role: "status"
}, Ke = {
  key: 1,
  class: "game-empty",
  role: "status"
}, We = /* @__PURE__ */ Q({
  __name: "GameApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(s) {
    const y = s, e = ue(y.bridge, y.initialState), { state: n, settlement: i, funds: b, inFlight: d, reading: v, loadingMore: G, busy: R, error: C, recordsError: h, failed: k, disabledReason: S, needsSave: w, refreshDisabled: J } = e, E = p(null);
    let B = 0;
    const f = p(n.value.activeGame ? "room" : "lobby"), $ = p(n.value.activeGame?.kind || null), U = re(null), T = p(""), D = p(!1);
    let M = 0;
    const N = L(() => $.value ? F($.value) : null);
    async function q() {
      const r = N.value, l = ++M;
      if (U.value = null, T.value = "", !!r) {
        D.value = !0;
        try {
          const c = await r.load();
          l === M && (U.value = c.default);
        } catch {
          l === M && (T.value = "这个游戏暂时没能打开，再试一次吧。");
        } finally {
          l === M && (D.value = !1);
        }
      }
    }
    x([
      f,
      $,
      () => !!n.value.activeGame,
      () => !!i.value
    ], (r, l) => {
      l[0] === "lobby" && (B = E.value?.scrollTop || 0), X(() => {
        E.value?.scrollTo({ top: f.value === "lobby" ? B : 0 });
      });
    }), x($, q, { immediate: !0 }), x(i, (r) => {
      r && ($.value = r.record.game);
    }), x(() => n.value.chatIdentity, () => {
      B = 0, $.value = n.value.activeGame?.kind || null, f.value = $.value ? "room" : "lobby", X(() => {
        B = 0, E.value?.scrollTo({ top: 0 });
      });
    });
    function O(r) {
      $.value = r, f.value = "room";
    }
    function A(r) {
      e.dismissSettlement(), f.value = r;
    }
    ie(() => f.value === "lobby" ? !1 : (A("lobby"), !0));
    function V() {
      n.value.activeGame && O(n.value.activeGame.kind);
    }
    function K() {
      e.dismissSettlement();
    }
    async function o(r) {
      await e.act(r);
    }
    return ne(() => {
      M += 1, e.dispose();
    }), (r, l) => (u(), m("main", Ee, [
      a("header", Ue, [
        f.value === "room" ? (u(), m("button", {
          key: 0,
          type: "button",
          class: "game-back",
          "aria-label": "返回游戏大厅",
          onClick: l[0] || (l[0] = (c) => A("lobby"))
        }, " ‹ ")) : I("", !0),
        a("h1", null, g(f.value === "room" ? N.value?.name : "游戏"), 1),
        a("div", Ne, [a("strong", null, "¤ " + g(t(b).balance.toLocaleString("zh-CN")), 1)])
      ]),
      a("nav", ze, [
        a("button", {
          type: "button",
          "aria-current": f.value === "lobby" ? "page" : void 0,
          onClick: l[1] || (l[1] = (c) => A("lobby"))
        }, " 大厅 ", 8, Fe),
        t(n).activeGame ? (u(), m("button", {
          key: 0,
          type: "button",
          "aria-current": f.value === "room" && $.value === t(n).activeGame.kind ? "page" : void 0,
          onClick: V
        }, [...l[7] || (l[7] = [te(" 继续 ", -1), a("i", null, null, -1)])], 8, qe)) : I("", !0),
        a("button", {
          type: "button",
          "aria-current": f.value === "records" ? "page" : void 0,
          onClick: l[2] || (l[2] = (c) => A("records"))
        }, " 记录 ", 8, Oe)
      ]),
      t(n).message || t(C) || t(n).generationActive ? (u(), m("aside", Ve, [
        a("p", null, g(t(C) || t(n).message || "故事正在回复，等回复结束就能继续玩。"), 1),
        t(w) ? (u(), m("button", {
          key: 0,
          type: "button",
          disabled: t(R),
          onClick: l[3] || (l[3] = (...c) => t(e).confirmSave && t(e).confirmSave(...c))
        }, g(t(v) ? "正在确认…" : t(n).status === "save-failed" ? "重试保存" : "核实保存结果"), 9, xe)) : t(k) ? (u(), m("button", {
          key: 1,
          type: "button",
          disabled: t(R) || t(n).generationActive,
          onClick: l[4] || (l[4] = (...c) => t(e).retry && t(e).retry(...c))
        }, " 重试这次操作 ", 8, je)) : I("", !0),
        !t(w) && t(n).status !== "conflict" ? (u(), m("button", {
          key: 2,
          type: "button",
          disabled: t(J),
          onClick: l[5] || (l[5] = (...c) => t(e).refresh && t(e).refresh(...c))
        }, " 重新读取 ", 8, He)) : I("", !0)
      ])) : I("", !0),
      a("div", {
        ref_key: "scroll",
        ref: E,
        class: "game-scroll"
      }, [le((u(), j($e, {
        key: t(n).chatIdentity,
        "active-game": t(n).activeGame,
        onOpen: O
      }, null, 8, ["active-game"])), [[se, f.value === "lobby"]]), f.value === "records" ? (u(), j(Le, {
        key: 0,
        records: t(n).records,
        total: t(n).total,
        "has-more": t(n).hasMore,
        "loading-more": t(G),
        error: t(h),
        onLoadMore: t(e).loadMore
      }, null, 8, [
        "records",
        "total",
        "has-more",
        "loading-more",
        "error",
        "onLoadMore"
      ])) : f.value === "room" ? (u(), m(H, { key: 1 }, [D.value ? (u(), m("div", Je, [...l[8] || (l[8] = [a("p", null, "正在摆好桌面…", -1)])])) : T.value ? (u(), m("div", Ke, [a("p", null, g(T.value), 1), a("button", {
        type: "button",
        onClick: q
      }, "重新打开")])) : U.value ? (u(), j(ae(U.value), {
        key: 2,
        state: t(n),
        "disabled-reason": t(S),
        "in-flight": t(d),
        settlement: t(i)?.record.game === $.value ? t(i) : null,
        onRevealed: t(e).revealComplete,
        onAction: o,
        onAgain: K,
        onLobby: l[6] || (l[6] = (c) => A("lobby")),
        onResume: V
      }, null, 40, [
        "state",
        "disabled-reason",
        "in-flight",
        "settlement",
        "onRevealed"
      ])) : I("", !0)], 64)) : I("", !0)], 512)
    ]));
  }
}), Ye = We;
export {
  Ye as default
};
