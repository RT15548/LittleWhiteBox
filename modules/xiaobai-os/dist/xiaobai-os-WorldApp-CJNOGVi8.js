/* eslint-disable */
import { C as L, E as D, H as F, I as H, J as A, K as h, S as W, Y as t, f as U, gt as k, h as O, ht as Y, j as K, k as r, l as $, m as j, mt as M, o as _, p as G, q as P, r as E, s as a, u as s } from "./xiaobai-os-runtime-core.esm-bundler-x_Eikhco.js";
import { c as Q, l as X, s as Z } from "./xiaobai-os-runtime-dom.esm-bundler-DWFjb9Vy.js";
import { n as ee } from "./xiaobai-os-app-navigation-BcQEoInO.js";
import { t as te } from "./xiaobai-os-frame-bridge-5XxFerhp.js";
var ae = { class: "world-article" }, le = { tabindex: "-1" }, re = {
  key: 0,
  class: "world-article-update",
  role: "status"
}, se = { key: 1 }, ne = { class: "world-article-body" }, ie = /* @__PURE__ */ O({
  __name: "NewsArticle",
  props: {
    article: {},
    update: {}
  },
  emits: ["latest"],
  setup(c) {
    const e = c, i = _(() => e.article.body.split(/\n\s*\n|\n/).map((d) => d.trim()).filter(Boolean));
    return (d, n) => (r(), s("article", ae, [
      a("h1", le, k(c.article.title), 1),
      c.update !== "same" ? (r(), s("div", re, [c.update === "updated" ? (r(), s(E, { key: 0 }, [n[1] || (n[1] = a("span", null, "这篇见闻有了新内容", -1)), a("button", {
        type: "button",
        onClick: n[0] || (n[0] = (u) => d.$emit("latest"))
      }, "阅读新版")], 64)) : (r(), s("span", se, "这篇已不在当前列表，仍可读完。"))])) : $("", !0),
      a("div", ne, [(r(!0), s(E, null, K(i.value, (u, m) => (r(), s("p", { key: m }, k(u), 1))), 128))])
    ]));
  }
}), oe = ie, ue = { class: "world-opening" }, de = {
  key: 0,
  class: "world-overview"
}, ve = ["id"], ce = [
  "aria-expanded",
  "aria-controls",
  "aria-label"
], pe = /* @__PURE__ */ O({
  __name: "WorldOpening",
  props: { overview: {} },
  setup(c) {
    const e = h(!1), i = H(), d = `url("https://picsum.photos/800/300?random=${Math.random()}")`;
    return (n, u) => (r(), s("div", ue, [a("div", {
      class: "world-horizon",
      "aria-hidden": "true",
      style: Y({ "--world-cover-image": d })
    }, null, 4), c.overview ? (r(), s("div", de, [a("p", {
      id: t(i),
      class: M(["world-overview-text", { "is-expanded": e.value }])
    }, k(c.overview), 11, ve), a("button", {
      type: "button",
      class: "world-overview-toggle",
      "aria-expanded": e.value,
      "aria-controls": t(i),
      "aria-label": e.value ? "收起世界近况" : "查看世界近况",
      onClick: u[0] || (u[0] = (m) => e.value = !e.value)
    }, [(r(), s("svg", {
      viewBox: "0 0 24 24",
      "aria-hidden": "true",
      class: M({ "is-expanded": e.value })
    }, [...u[1] || (u[1] = [a("path", { d: "m7 10 5 5 5-5" }, null, -1)])], 2))], 8, ce)])) : $("", !0)]));
  }
}), fe = pe;
function we(c) {
  const e = P(structuredClone(A(c.initialState))), i = h(!1), d = h(""), n = h(!1);
  let u = !1, m = 0, b = () => {
  };
  function p(y) {
    e.value = structuredClone(A(y)), d.value = "", n.value = !1;
  }
  const S = _(() => !i.value && e.value.writeState === "ready"), x = _(() => e.value.maintenance === "running"), f = _(() => n.value ? d.value : e.value.writeState !== "ready" ? e.value.message : d.value || e.value.message), I = _(() => n.value || e.value.maintenance === "error" || [
    "failed",
    "unconfirmed",
    "conflict"
  ].includes(e.value.writeState));
  async function N(y, g = {}) {
    if (i.value) return;
    i.value = !0, d.value = "", n.value = !1;
    const C = e.value.chatIdentity, q = m;
    try {
      const w = await c.bridge.request(`world/${y}`, {
        chatIdentity: C,
        ...g
      }, 35e3);
      if (!u || e.value.chatIdentity !== C) return;
      q === m && w.result.state.chatIdentity === C && p(w.result.state), w.result.message && (d.value = w.result.message);
    } catch (w) {
      if (!u || e.value.chatIdentity !== C) return;
      const B = w instanceof Error ? w.message : "";
      d.value = B === "host_request_timeout" ? "暂时没收到结果，更新可能还在继续。请稍后重新加载，不要再次生成。" : w instanceof te && w.code === "app_request_failed" ? B : "操作未完成，请检查保存状态或稍后重试。", n.value = !0;
    } finally {
      u && (i.value = !1);
    }
  }
  return D(() => {
    u = !0, b = c.bridge.subscribe((y) => {
      if (y.type === "world/state") {
        const g = y.payload.state;
        g.chatIdentity === e.value.chatIdentity && (m++, p(g));
      } else y.type === "world/error" && (n.value = !0, d.value = "新闻暂时加载不了，请重试。");
    });
  }), L(() => {
    u = !1, b();
  }), {
    state: e,
    pending: i,
    writable: S,
    refreshing: x,
    notice: f,
    error: I,
    request: N
  };
}
var be = { class: "world-toolbar" }, ye = { class: "world-tools" }, me = ["disabled", "title"], ge = ["onKeydown"], ke = { class: "world-menu-sheet" }, he = ["checked", "disabled"], _e = ["checked", "disabled"], Se = ["disabled"], xe = ["disabled"], Ce = ["disabled"], $e = {
  key: 0,
  class: "world-news-list",
  "aria-label": "各处见闻"
}, Ie = ["data-article-id", "onClick"], Ne = { class: "world-item-text" }, qe = { class: "world-item-summary" }, Be = {
  key: 1,
  class: "world-empty"
}, Ae = ["disabled"], Me = /* @__PURE__ */ O({
  __name: "WorldApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(c) {
    const { state: e, pending: i, writable: d, refreshing: n, notice: u, error: m, request: b } = we(c), p = P(null), S = h(null), x = h(null), f = h(null), I = h(null);
    let N = 0, y = "";
    const g = _(() => e.value.world.news.find((v) => v.id === p.value?.id)), C = _(() => g.value ? JSON.stringify(g.value) === JSON.stringify(p.value) ? "same" : "updated" : "removed"), q = _(() => d.value && !n.value);
    async function w(v, l) {
      const o = v.target;
      await b(l === "subscribed" ? "subscribe" : "background", { enabled: o.checked }), o.checked = e.value.settings[l];
    }
    async function B(v) {
      N = S.value?.scrollTop ?? 0, y = v.id, p.value = structuredClone(A(v)), await W(), x.value?.querySelector("h1")?.focus({ preventScroll: !0 });
    }
    async function T() {
      p.value = null, await W(), S.value && (S.value.scrollTop = N, ([...S.value.querySelectorAll("[data-article-id]")].find((v) => v.dataset.articleId === y) ?? I.value)?.focus({ preventScroll: !0 }));
    }
    async function R() {
      g.value && (p.value = structuredClone(A(g.value)), await W(), x.value && (x.value.scrollTop = 0), x.value?.querySelector("h1")?.focus({ preventScroll: !0 }));
    }
    function V() {
      f.value && (f.value.open = !1, f.value.querySelector("summary")?.focus());
    }
    function z(v) {
      f.value && v.target instanceof Node && !f.value.contains(v.target) && (f.value.open = !1);
    }
    function J(v) {
      f.value && (!(v.relatedTarget instanceof Node) || !f.value.contains(v.relatedTarget)) && (f.value.open = !1);
    }
    return ee(() => f.value?.open ? (V(), !0) : p.value ? (T(), !0) : !1), (v, l) => (r(), s("section", {
      class: "world-app",
      "aria-label": "世界新闻",
      onPointerdown: z
    }, [
      a("header", be, [p.value ? (r(), s("button", {
        key: 0,
        type: "button",
        class: "world-back",
        onClick: T
      }, [...l[7] || (l[7] = [a("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [a("path", { d: "m14 6-6 6 6 6" })], -1), a("span", null, "见闻", -1)])])) : (r(), s("h1", {
        key: 1,
        ref_key: "title",
        ref: I,
        class: "world-toolbar-title",
        tabindex: "-1"
      }, "世界", 512)), a("div", ye, [a("button", {
        type: "button",
        class: "world-icon-button",
        disabled: !q.value,
        "aria-label": "刷新新闻",
        title: t(n) ? "正在更新新闻" : "刷新新闻，会使用模型",
        onClick: l[0] || (l[0] = (o) => t(b)("refresh"))
      }, [(r(), s("svg", {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "1.6",
        "aria-hidden": "true",
        class: M({ "world-spinning": t(n) })
      }, [...l[8] || (l[8] = [a("path", {
        d: "M20 10a8 8 0 1 0-1 6M20 4v6h-6",
        "stroke-linecap": "round",
        "stroke-linejoin": "round"
      }, null, -1)])], 2))], 8, me), a("details", {
        ref_key: "menu",
        ref: f,
        class: "world-menu",
        onKeydown: Q(X(V, ["stop", "prevent"]), ["esc"]),
        onFocusout: J
      }, [l[13] || (l[13] = U('<summary aria-label="新闻设置" title="新闻设置"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.7"></circle><circle cx="12" cy="12" r="1.7"></circle><circle cx="19" cy="12" r="1.7"></circle></svg></summary>', 1)), a("div", ke, [
        a("label", null, [l[9] || (l[9] = a("span", null, "自动新闻", -1)), a("input", {
          type: "checkbox",
          checked: t(e).settings.subscribed,
          disabled: t(i),
          onChange: l[1] || (l[1] = (o) => w(o, "subscribed"))
        }, null, 40, he)]),
        l[11] || (l[11] = a("p", null, "所有聊天生效，随剧情更新并调用模型。关闭后保留新闻。", -1)),
        a("label", null, [l[10] || (l[10] = a("span", null, "作为剧情背景", -1)), a("input", {
          type: "checkbox",
          checked: t(e).settings.injectToStory,
          disabled: t(i),
          onChange: l[2] || (l[2] = (o) => w(o, "injectToStory"))
        }, null, 40, _e)]),
        l[12] || (l[12] = a("p", null, "所有聊天生效，仅提供各自聊天的世界近况。", -1))
      ])], 40, ge)])]),
      t(u) ? (r(), s("div", {
        key: 0,
        class: M(["world-notice", { "is-error": t(m) }]),
        role: "status",
        "aria-live": "polite"
      }, [a("span", null, k(t(u)), 1), t(e).writeState === "unconfirmed" || t(e).pendingSave && t(e).writeState === "failed" ? (r(), s("button", {
        key: 0,
        disabled: t(i),
        type: "button",
        onClick: l[3] || (l[3] = (o) => t(b)("confirm-save"))
      }, "检查保存", 8, Se)) : t(e).writeState === "conflict" ? (r(), s("button", {
        key: 1,
        disabled: t(i),
        type: "button",
        onClick: l[4] || (l[4] = (o) => t(b)("adopt-server-state"))
      }, "使用已保存版本", 8, xe)) : t(e).writeState === "failed" || t(m) ? (r(), s("button", {
        key: 2,
        disabled: t(i) || t(e).writeState === "saving",
        type: "button",
        onClick: l[5] || (l[5] = (o) => t(b)(t(e).maintenance === "error" && t(e).writeState === "ready" ? "refresh" : "read"))
      }, k(t(e).maintenance === "error" && t(e).writeState === "ready" ? "重试更新" : "重新加载"), 9, Ce)) : $("", !0)], 2)) : $("", !0),
      F(a("div", {
        ref_key: "listing",
        ref: S,
        class: "world-scroll world-listing"
      }, [j(fe, { overview: t(e).world.overview }, null, 8, ["overview"]), t(e).world.news.length ? (r(), s("section", $e, [(r(!0), s(E, null, K(t(e).world.news, (o) => (r(), s("article", {
        key: o.id,
        class: "world-news-item"
      }, [a("button", {
        type: "button",
        "data-article-id": o.id,
        onClick: (Te) => B(o)
      }, [a("span", Ne, [a("h2", null, k(o.title), 1), a("span", qe, k(o.summary), 1)])], 8, Ie)]))), 128))])) : (r(), s("section", Be, [
        a("h2", null, k(t(n) ? "正在更新新闻" : t(e).settings.subscribed ? "已开启自动新闻" : "暂无新闻"), 1),
        a("button", {
          type: "button",
          class: "world-primary",
          disabled: !q.value,
          onClick: l[6] || (l[6] = (o) => t(e).settings.subscribed ? t(b)("refresh") : t(b)("subscribe", { enabled: !0 }))
        }, k(t(n) ? "正在更新…" : t(i) ? "正在处理…" : t(e).settings.subscribed ? "获取新闻" : "开启自动新闻"), 9, Ae),
        l[14] || (l[14] = a("small", null, "获取及更新将调用模型", -1))
      ]))], 512), [[Z, !p.value]]),
      p.value ? (r(), s("div", {
        key: 1,
        ref_key: "articlePage",
        ref: x,
        class: "world-scroll world-reading"
      }, [j(oe, {
        article: p.value,
        update: C.value,
        onLatest: R
      }, null, 8, ["article", "update"]), a("button", {
        type: "button",
        class: "world-bottom-back",
        onClick: T
      }, [...l[15] || (l[15] = [a("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [a("path", { d: "m14 6-6 6 6 6" })], -1), G(" 返回见闻 ", -1)])])], 512)) : $("", !0)
    ], 32));
  }
}), je = Me;
export {
  je as default
};
