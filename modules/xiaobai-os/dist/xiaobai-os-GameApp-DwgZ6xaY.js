/* eslint-disable */
import { C as ne, H as ee, J as q, K as p, N as ae, S as W, Y as t, c as j, gt as g, h as Q, j as P, k as u, l as I, mt as te, o as T, p as le, q as re, r as H, s as a, u as m, z as x } from "./xiaobai-os-runtime-core.esm-bundler-x_Eikhco.js";
import { o as oe, s as se } from "./xiaobai-os-runtime-dom.esm-bundler-DWFjb9Vy.js";
import { n as ie } from "./xiaobai-os-app-navigation-BcQEoInO.js";
import { n as z, t as X } from "./xiaobai-os-room-catalog-DarmW-WP.js";
function Z(s) {
  return s && typeof s == "object" && "code" in s ? String(s.code) : "";
}
function Y(s) {
  const y = s instanceof Error ? s.message : String(s);
  return y.includes("economy_insufficient_funds") || y.includes("cannot be overdrawn") ? "小白币不够了，换个小一点的筹码吧。" : y.includes("game_dice_bid_not_higher") ? "这次要叫得比对方更大一些。" : y.includes("game_revision_conflict") || y.includes("game_event_id_conflict") ? "本局已有变化，请重新加载后继续。" : y.includes("game_main_generation_active") ? "故事正在回复，等回复结束就能继续玩。" : y.includes("聊天已切换") ? "聊天已切换，请重新打开游戏。" : y === "host_request_timeout" ? "暂时没收到结果。可以重试这次操作，不会重复下注或重新抽取结果。" : "这次操作没能完成，请重试。";
}
function ue(s, y) {
  const e = p(structuredClone(q(y))), n = p(null), i = p(null), b = p(null), d = p(!1), v = p(!1), G = p(""), R = p(""), $ = p(null);
  let h = !1, k = 0, S = 0, w = 0, J = 0;
  function E() {
    return typeof globalThis.crypto?.randomUUID == "function" ? "game-ui:" + globalThis.crypto.randomUUID() : "game-ui:" + Date.now() + ":" + ++J;
  }
  const B = T(() => ["unconfirmed", "save-failed"].includes(e.value.status)), f = T(() => d.value || !!b.value), C = T(() => f.value ? "上一项操作还在进行，请稍候。" : e.value.status !== "ready" ? e.value.message || "游戏正在准备，请稍候。" : $.value ? "请先重试这次操作，或重新加载本局结果。" : e.value.generationActive ? "故事正在回复，等回复结束就能继续玩。" : ""), N = T(() => i.value ?? {
    balance: e.value.balance,
    lockedAmount: e.value.lockedAmount
  }), D = T(() => f.value || B.value || [
    "conflict",
    "saving",
    "loading"
  ].includes(e.value.status));
  function L(o) {
    const r = e.value;
    if (r.chatIdentity !== o.chatIdentity)
      n.value = null, i.value = null, $.value = null, b.value = null, d.value = !1, S += 1, w += 1;
    else if (r.activeGame && o.status === "ready" && !o.activeGame) {
      const l = o.records.find((c) => c.gameId === r.activeGame.id);
      l && (i.value = {
        balance: r.balance,
        lockedAmount: r.lockedAmount
      }, n.value = {
        before: structuredClone(q(r.activeGame)),
        record: structuredClone(l),
        balanceAfter: o.balance
      });
    }
    e.value = structuredClone(o), v.value = !1, R.value = "", G.value = "", $.value = null;
  }
  function M(o) {
    const r = o === "game_save_pending" ? "save-failed" : o === "storage_unconfirmed" ? "unconfirmed" : o === "storage_conflict" ? "conflict" : null;
    return r ? (e.value = {
      ...e.value,
      status: r,
      message: r === "save-failed" ? "这局还没保存好，请重试保存后继续。" : r === "unconfirmed" ? "还不确定是否保存成功，请先检查保存。" : "服务器上的游戏记录与当前内容不同，请重新打开酒馆后继续。"
    }, !0) : !1;
  }
  async function U(o) {
    const r = e.value.chatIdentity, l = k, c = w;
    b.value = o.action, $.value = null, G.value = "";
    try {
      const _ = await s.request(o.endpoint, o.payload, 35e3);
      return h || c !== w || e.value.chatIdentity !== r ? !1 : (k === l && L(_.result), !0);
    } catch (_) {
      return !h && c === w && k === l && e.value.chatIdentity === r && !M(Z(_)) && (G.value = Y(_), e.value.status === "ready" && ($.value = o)), !1;
    } finally {
      !h && c === w && e.value.chatIdentity === r && (b.value = null);
    }
  }
  async function F(o) {
    return h || C.value ? !1 : U({
      endpoint: o.endpoint,
      action: structuredClone(q(o)),
      payload: {
        ...structuredClone(q(o.payload || {})),
        chatIdentity: e.value.chatIdentity,
        expectedRevision: e.value.revision,
        expectedEventId: e.value.eventId,
        actionId: E()
      }
    });
  }
  async function O() {
    return h || !$.value || f.value || e.value.status !== "ready" || e.value.generationActive ? !1 : U(structuredClone(q($.value)));
  }
  async function A(o = !1) {
    if (h || f.value || !o && D.value) return;
    const r = e.value.chatIdentity, l = k, c = ++S;
    d.value = !0, G.value = "";
    try {
      const _ = await s.request(o ? "game/confirm-save" : "game/refresh", { chatIdentity: r }, 35e3);
      if (h || c !== S || e.value.chatIdentity !== r) return;
      l === k && L("state" in _.result ? _.result.state : _.result), $.value = null;
    } catch (_) {
      !h && c === S && l === k && e.value.chatIdentity === r && (M(Z(_)) || (G.value = Y(_)));
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
      !h && o === k && r === e.value.chatIdentity && (R.value = Y(l));
    } finally {
      o === k && (v.value = !1);
    }
  }
  const K = s.subscribe((o) => {
    h || (o.type === "game/state" ? (k += 1, L(o.payload.state)) : o.type === "game/error" && (G.value = "游戏暂时无法读取，请重新打开。"));
  });
  return {
    state: e,
    settlement: n,
    funds: N,
    inFlight: b,
    reading: d,
    loadingMore: v,
    busy: f,
    error: G,
    recordsError: R,
    failed: $,
    disabledReason: C,
    needsSave: B,
    refreshDisabled: D,
    act: F,
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
    const y = p(""), e = p("全部"), n = ["全部", ...new Set(X.map((b) => b.category))], i = T(() => X.filter((b) => (e.value === "全部" || b.category === e.value) && (b.name + b.tagline + b.category).includes(y.value.trim())));
    return (b, d) => (u(), m("section", de, [
      s.activeGame ? (u(), m("button", {
        key: 0,
        type: "button",
        class: "game-continue",
        onClick: d[0] || (d[0] = (v) => b.$emit("open", s.activeGame.kind))
      }, [
        a("img", {
          src: t(z)(s.activeGame.kind).artwork,
          alt: ""
        }, null, 8, ve),
        a("span", null, [d[3] || (d[3] = a("small", null, "进行中", -1)), a("strong", null, g(t(z)(s.activeGame.kind).name), 1)]),
        d[4] || (d[4] = a("b", null, "继续 →", -1))
      ])) : I("", !0),
      a("label", ce, [d[5] || (d[5] = a("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [a("circle", {
        cx: "10.5",
        cy: "10.5",
        r: "6.5"
      }), a("path", { d: "m16 16 4 4" })], -1)), ee(a("input", {
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
        class: te(["game-tile", "tone-" + v.tone]),
        onClick: (G) => b.$emit("open", v.id)
      }, [a("div", be, [a("img", {
        src: v.artwork,
        alt: "",
        loading: "lazy"
      }, null, 8, pe)]), a("div", he, [a("h3", null, g(v.name), 1), a("span", null, [le(g(v.entry) + " ", 1), d[6] || (d[6] = a("i", { "aria-hidden": "true" }, "↗", -1))])])], 10, ge))), 128))]),
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
}), Ce = ke, $e = {
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
}, De = ["disabled"], Le = /* @__PURE__ */ Q({
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
    return (e, n) => (u(), m("section", $e, [
      a("header", Ge, [n[1] || (n[1] = a("div", null, [a("h2", { id: "game-records-title" }, "记录")], -1)), a("small", null, g(s.total) + " 局", 1)]),
      s.records.length ? (u(), m("div", Ie, [(u(!0), m(H, null, P(s.records, (i) => (u(), m("article", {
        key: i.id,
        class: te(["game-record", `is-${i.outcomeTone}`])
      }, [a("div", Se, g(t(z)(i.game).mark), 1), a("div", we, [
        a("header", null, [a("div", null, [a("span", null, g(i.gameLabel), 1), a("strong", null, g(i.outcomeLabel), 1)]), a("time", { datetime: new Date(i.createdAt).toISOString() }, g(y(i.createdAt)), 9, Me)]),
        a("div", Ae, [
          a("span", null, "下注 ¤ " + g(i.amountIn), 1),
          a("span", null, "拿回 ¤ " + g(i.payout), 1),
          a("strong", null, g(i.net > 0 ? "+" : "") + g(i.net), 1)
        ]),
        a("details", null, [n[2] || (n[2] = a("summary", null, "本局详情", -1)), (u(), j(ae(t(z)(i.game).record), { detail: i.detail }, null, 8, ["detail"]))])
      ])], 2))), 128))])) : (u(), m("div", Re, [...n[3] || (n[3] = [a("span", { "aria-hidden": "true" }, "◇", -1), a("p", null, "暂无游戏记录", -1)])])),
      s.error ? (u(), m("p", Be, g(s.error), 1)) : I("", !0),
      s.hasMore ? (u(), m("button", {
        key: 3,
        type: "button",
        class: "game-load-more",
        disabled: s.loadingMore,
        onClick: n[0] || (n[0] = (i) => e.$emit("loadMore"))
      }, g(s.loadingMore ? "正在翻阅…" : "更多记录"), 9, De)) : I("", !0)
    ]));
  }
}), Te = Le, Ee = { class: "game-app" }, Ne = { class: "game-header" }, Ue = {
  class: "game-funds",
  "aria-label": "可用小白币"
}, qe = {
  class: "game-nav",
  "aria-label": "游戏页面"
}, ze = ["aria-current"], Fe = ["aria-current"], Oe = ["aria-current"], Ve = {
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
}, Ye = /* @__PURE__ */ Q({
  __name: "GameApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(s) {
    const y = s, e = ue(y.bridge, y.initialState), { state: n, settlement: i, funds: b, inFlight: d, reading: v, loadingMore: G, busy: R, error: $, recordsError: h, failed: k, disabledReason: S, needsSave: w, refreshDisabled: J } = e, E = p(null);
    let B = 0;
    const f = p(n.value.activeGame ? "room" : "lobby"), C = p(n.value.activeGame?.kind || null), N = re(null), D = p(""), L = p(!1);
    let M = 0;
    const U = T(() => C.value ? z(C.value) : null);
    async function F() {
      const r = U.value, l = ++M;
      if (N.value = null, D.value = "", !!r) {
        L.value = !0;
        try {
          const c = await r.load();
          l === M && (N.value = c.default);
        } catch {
          l === M && (D.value = "这个游戏暂时没能打开，再试一次吧。");
        } finally {
          l === M && (L.value = !1);
        }
      }
    }
    x([
      f,
      C,
      () => !!n.value.activeGame,
      () => !!i.value
    ], (r, l) => {
      l[0] === "lobby" && (B = E.value?.scrollTop || 0), W(() => {
        E.value?.scrollTo({ top: f.value === "lobby" ? B : 0 });
      });
    }), x(C, F, { immediate: !0 }), x(i, (r) => {
      r && (C.value = r.record.game);
    }), x(() => n.value.chatIdentity, () => {
      B = 0, C.value = n.value.activeGame?.kind || null, f.value = C.value ? "room" : "lobby", W(() => {
        B = 0, E.value?.scrollTo({ top: 0 });
      });
    });
    function O(r) {
      C.value = r, f.value = "room";
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
      a("header", Ne, [
        f.value === "room" ? (u(), m("button", {
          key: 0,
          type: "button",
          class: "game-back",
          "aria-label": "返回游戏大厅",
          onClick: l[0] || (l[0] = (c) => A("lobby"))
        }, " ‹ ")) : I("", !0),
        a("h1", null, g(f.value === "room" ? U.value?.name : "游戏"), 1),
        a("div", Ue, [a("strong", null, "¤ " + g(t(b).balance.toLocaleString("zh-CN")), 1)])
      ]),
      a("nav", qe, [
        a("button", {
          type: "button",
          "aria-current": f.value === "lobby" ? "page" : void 0,
          onClick: l[1] || (l[1] = (c) => A("lobby"))
        }, " 大厅 ", 8, ze),
        t(n).activeGame ? (u(), m("button", {
          key: 0,
          type: "button",
          "aria-current": f.value === "room" && C.value === t(n).activeGame.kind ? "page" : void 0,
          onClick: V
        }, [...l[7] || (l[7] = [le(" 继续 ", -1), a("i", null, null, -1)])], 8, Fe)) : I("", !0),
        a("button", {
          type: "button",
          "aria-current": f.value === "records" ? "page" : void 0,
          onClick: l[2] || (l[2] = (c) => A("records"))
        }, " 记录 ", 8, Oe)
      ]),
      t(n).message || t($) || t(n).generationActive ? (u(), m("aside", Ve, [
        a("p", null, g(t($) || t(n).message || "故事正在回复，等回复结束就能继续玩。"), 1),
        t(w) ? (u(), m("button", {
          key: 0,
          type: "button",
          disabled: t(R),
          onClick: l[3] || (l[3] = (...c) => t(e).confirmSave && t(e).confirmSave(...c))
        }, g(t(v) ? "正在检查…" : t(n).status === "save-failed" ? "重试保存" : "检查保存"), 9, xe)) : t(k) ? (u(), m("button", {
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
        }, " 重新加载 ", 8, He)) : I("", !0)
      ])) : I("", !0),
      a("div", {
        ref_key: "scroll",
        ref: E,
        class: "game-scroll"
      }, [ee((u(), j(Ce, {
        key: t(n).chatIdentity,
        "active-game": t(n).activeGame,
        onOpen: O
      }, null, 8, ["active-game"])), [[se, f.value === "lobby"]]), f.value === "records" ? (u(), j(Te, {
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
      ])) : f.value === "room" ? (u(), m(H, { key: 1 }, [L.value ? (u(), m("div", Je, [...l[8] || (l[8] = [a("p", null, "正在摆好桌面…", -1)])])) : D.value ? (u(), m("div", Ke, [a("p", null, g(D.value), 1), a("button", {
        type: "button",
        onClick: F
      }, "重新打开")])) : N.value ? (u(), j(ae(N.value), {
        key: 2,
        state: t(n),
        "disabled-reason": t(S),
        "in-flight": t(d),
        settlement: t(i)?.record.game === C.value ? t(i) : null,
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
}), Ze = Ye;
export {
  Ze as default
};
