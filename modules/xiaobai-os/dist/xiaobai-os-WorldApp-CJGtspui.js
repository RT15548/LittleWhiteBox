/* eslint-disable */
import { $ as L, D as E, E as P, M as W, P as U, R as F, S as r, T as J, U as R, V as s, at as j, dt as H, f as G, ft as k, h as V, lt as t, m as Q, ot as M, p as X, q as Y, r as Z, rt as _, ut as T, v as h, w as ee, x as $, y as a } from "./xiaobai-os-app-navigation-DvMnPkC0.js";
import { n as te } from "./xiaobai-os-frame-bridge-BfVuKvnh.js";
var ae = { class: "world-article" }, le = { tabindex: "-1" }, re = {
  key: 0,
  class: "world-article-update",
  role: "status"
}, se = { key: 1 }, ne = { class: "world-article-body" }, ie = /* @__PURE__ */ E({
  __name: "NewsArticle",
  props: {
    article: {},
    update: {}
  },
  emits: ["latest"],
  setup(c) {
    const e = c, i = h(() => e.article.body.split(/\n\s*\n|\n/).map((d) => d.trim()).filter(Boolean));
    return (d, n) => (s(), r("article", ae, [
      a("h1", le, k(c.article.title), 1),
      c.update !== "same" ? (s(), r("div", re, [c.update === "updated" ? (s(), r(V, { key: 0 }, [n[1] || (n[1] = a("span", null, "这篇见闻有了新内容", -1)), a("button", {
        type: "button",
        onClick: n[0] || (n[0] = (u) => d.$emit("latest"))
      }, "阅读新版")], 64)) : (s(), r("span", se, "这篇已不在当前列表，仍可读完。"))])) : $("", !0),
      a("div", ne, [(s(!0), r(V, null, R(i.value, (u, g) => (s(), r("p", { key: g }, k(u), 1))), 128))])
    ]));
  }
}), oe = ie, ue = { class: "world-opening" }, de = {
  key: 0,
  class: "world-overview"
}, ve = ["id"], ce = [
  "aria-expanded",
  "aria-controls",
  "aria-label"
], pe = /* @__PURE__ */ E({
  __name: "WorldOpening",
  props: { overview: {} },
  setup(c) {
    const e = _(!1), i = Y(), d = `url("https://picsum.photos/800/300?random=${Math.random()}")`;
    return (n, u) => (s(), r("div", ue, [a("div", {
      class: "world-horizon",
      "aria-hidden": "true",
      style: H({ "--world-cover-image": d })
    }, null, 4), c.overview ? (s(), r("div", de, [a("p", {
      id: t(i),
      class: T(["world-overview-text", { "is-expanded": e.value }])
    }, k(c.overview), 11, ve), a("button", {
      type: "button",
      class: "world-overview-toggle",
      "aria-expanded": e.value,
      "aria-controls": t(i),
      "aria-label": e.value ? "收起世界近况" : "查看世界近况",
      onClick: u[0] || (u[0] = (g) => e.value = !e.value)
    }, [(s(), r("svg", {
      viewBox: "0 0 24 24",
      "aria-hidden": "true",
      class: T({ "is-expanded": e.value })
    }, [...u[1] || (u[1] = [a("path", { d: "m7 10 5 5 5-5" }, null, -1)])], 2))], 8, ce)])) : $("", !0)]));
  }
}), fe = pe;
function we(c) {
  const e = j(structuredClone(M(c.initialState))), i = _(!1), d = _(""), n = _(!1);
  let u = !1, g = 0, b = () => {
  };
  function p(y) {
    e.value = structuredClone(M(y)), d.value = "", n.value = !1;
  }
  const S = h(() => !i.value && e.value.writeState === "ready"), x = h(() => e.value.maintenance === "running"), f = h(() => n.value ? d.value : e.value.writeState !== "ready" ? e.value.message : d.value || e.value.message), I = h(() => n.value || e.value.maintenance === "error" || [
    "failed",
    "unconfirmed",
    "conflict"
  ].includes(e.value.writeState));
  async function N(y, m = {}) {
    if (i.value) return;
    i.value = !0, d.value = "", n.value = !1;
    const C = e.value.chatIdentity, q = g;
    try {
      const w = await c.bridge.request(`world/${y}`, {
        chatIdentity: C,
        ...m
      }, 35e3);
      if (!u || e.value.chatIdentity !== C) return;
      q === g && w.result.state.chatIdentity === C && p(w.result.state), w.result.message && (d.value = w.result.message);
    } catch (w) {
      if (!u || e.value.chatIdentity !== C) return;
      const B = w instanceof Error ? w.message : "";
      d.value = B === "host_request_timeout" ? "暂时没收到结果，更新可能还在继续。请稍后重新加载，不要再次生成。" : w instanceof te && w.code === "app_request_failed" ? B : "操作未完成，请检查保存状态或稍后重试。", n.value = !0;
    } finally {
      u && (i.value = !1);
    }
  }
  return F(() => {
    u = !0, b = c.bridge.subscribe((y) => {
      if (y.type === "world/state") {
        const m = y.payload.state;
        m.chatIdentity === e.value.chatIdentity && (g++, p(m));
      } else y.type === "world/error" && (n.value = !0, d.value = "新闻暂时加载不了，请重试。");
    });
  }), U(() => {
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
var be = { class: "world-toolbar" }, ye = { class: "world-tools" }, ge = ["disabled", "title"], me = ["onKeydown"], ke = { class: "world-menu-sheet" }, _e = ["checked", "disabled"], he = ["checked", "disabled"], Se = ["disabled"], xe = ["disabled"], Ce = ["disabled"], $e = {
  key: 0,
  class: "world-news-list",
  "aria-label": "各处见闻"
}, Ie = ["data-article-id", "onClick"], Ne = { class: "world-item-text" }, qe = { class: "world-item-preview" }, Be = {
  key: 1,
  class: "world-empty"
}, Me = ["disabled"], Te = /* @__PURE__ */ E({
  __name: "WorldApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(c) {
    const { state: e, pending: i, writable: d, refreshing: n, notice: u, error: g, request: b } = we(c), p = j(null), S = _(null), x = _(null), f = _(null), I = _(null);
    let N = 0, y = "";
    const m = h(() => e.value.world.news.find((v) => v.id === p.value?.id)), C = h(() => m.value ? JSON.stringify(m.value) === JSON.stringify(p.value) ? "same" : "updated" : "removed"), q = h(() => d.value && !n.value);
    async function w(v, l) {
      const o = v.target;
      await b(l === "subscribed" ? "subscribe" : "background", { enabled: o.checked }), o.checked = e.value.settings[l];
    }
    async function B(v) {
      N = S.value?.scrollTop ?? 0, y = v.id, p.value = structuredClone(M(v)), await W(), x.value?.querySelector("h1")?.focus({ preventScroll: !0 });
    }
    async function A() {
      p.value = null, await W(), S.value && (S.value.scrollTop = N, ([...S.value.querySelectorAll("[data-article-id]")].find((v) => v.dataset.articleId === y) ?? I.value)?.focus({ preventScroll: !0 }));
    }
    async function z() {
      m.value && (p.value = structuredClone(M(m.value)), await W(), x.value && (x.value.scrollTop = 0), x.value?.querySelector("h1")?.focus({ preventScroll: !0 }));
    }
    function O() {
      f.value && (f.value.open = !1, f.value.querySelector("summary")?.focus());
    }
    function D(v) {
      f.value && v.target instanceof Node && !f.value.contains(v.target) && (f.value.open = !1);
    }
    function K(v) {
      f.value && (!(v.relatedTarget instanceof Node) || !f.value.contains(v.relatedTarget)) && (f.value.open = !1);
    }
    return Z(() => f.value?.open ? (O(), !0) : p.value ? (A(), !0) : !1), (v, l) => (s(), r("section", {
      class: "world-app",
      "aria-label": "世界新闻",
      onPointerdown: D
    }, [
      a("header", be, [p.value ? (s(), r("button", {
        key: 0,
        type: "button",
        class: "world-back",
        onClick: A
      }, [...l[7] || (l[7] = [a("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [a("path", { d: "m14 6-6 6 6 6" })], -1), a("span", null, "见闻", -1)])])) : (s(), r("h1", {
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
      }, [(s(), r("svg", {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "1.6",
        "aria-hidden": "true",
        class: T({ "world-spinning": t(n) })
      }, [...l[8] || (l[8] = [a("path", {
        d: "M20 10a8 8 0 1 0-1 6M20 4v6h-6",
        "stroke-linecap": "round",
        "stroke-linejoin": "round"
      }, null, -1)])], 2))], 8, ge), a("details", {
        ref_key: "menu",
        ref: f,
        class: "world-menu",
        onKeydown: X(Q(O, ["stop", "prevent"]), ["esc"]),
        onFocusout: K
      }, [l[13] || (l[13] = ee('<summary aria-label="新闻设置" title="新闻设置"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.7"></circle><circle cx="12" cy="12" r="1.7"></circle><circle cx="19" cy="12" r="1.7"></circle></svg></summary>', 1)), a("div", ke, [
        a("label", null, [l[9] || (l[9] = a("span", null, "自动新闻", -1)), a("input", {
          type: "checkbox",
          checked: t(e).settings.subscribed,
          disabled: t(i),
          onChange: l[1] || (l[1] = (o) => w(o, "subscribed"))
        }, null, 40, _e)]),
        l[11] || (l[11] = a("p", null, "所有聊天生效，随剧情更新并调用模型。关闭后保留新闻。", -1)),
        a("label", null, [l[10] || (l[10] = a("span", null, "作为剧情背景", -1)), a("input", {
          type: "checkbox",
          checked: t(e).settings.injectToStory,
          disabled: t(i),
          onChange: l[2] || (l[2] = (o) => w(o, "injectToStory"))
        }, null, 40, he)]),
        l[12] || (l[12] = a("p", null, "所有聊天生效，仅提供各自聊天的世界近况。", -1))
      ])], 40, me)])]),
      t(u) ? (s(), r("div", {
        key: 0,
        class: T(["world-notice", { "is-error": t(g) }]),
        role: "status",
        "aria-live": "polite"
      }, [a("span", null, k(t(u)), 1), t(e).writeState === "unconfirmed" || t(e).pendingSave && t(e).writeState === "failed" ? (s(), r("button", {
        key: 0,
        disabled: t(i),
        type: "button",
        onClick: l[3] || (l[3] = (o) => t(b)("confirm-save"))
      }, "检查保存", 8, Se)) : t(e).writeState === "conflict" ? (s(), r("button", {
        key: 1,
        disabled: t(i),
        type: "button",
        onClick: l[4] || (l[4] = (o) => t(b)("adopt-server-state"))
      }, "使用已保存版本", 8, xe)) : t(e).writeState === "failed" || t(g) ? (s(), r("button", {
        key: 2,
        disabled: t(i) || t(e).writeState === "saving",
        type: "button",
        onClick: l[5] || (l[5] = (o) => t(b)(t(e).maintenance === "error" && t(e).writeState === "ready" ? "refresh" : "read"))
      }, k(t(e).maintenance === "error" && t(e).writeState === "ready" ? "重试更新" : "重新加载"), 9, Ce)) : $("", !0)], 2)) : $("", !0),
      L(a("div", {
        ref_key: "listing",
        ref: S,
        class: "world-scroll world-listing"
      }, [P(fe, { overview: t(e).world.overview }, null, 8, ["overview"]), t(e).world.news.length ? (s(), r("section", $e, [(s(!0), r(V, null, R(t(e).world.news, (o) => (s(), r("article", {
        key: o.id,
        class: "world-news-item"
      }, [a("button", {
        type: "button",
        "data-article-id": o.id,
        onClick: (Ae) => B(o)
      }, [a("span", Ne, [a("h2", null, k(o.title), 1), a("span", qe, k(o.body), 1)])], 8, Ie)]))), 128))])) : (s(), r("section", Be, [
        a("h2", null, k(t(n) ? "正在更新新闻" : t(e).settings.subscribed ? "已开启自动新闻" : "暂无新闻"), 1),
        a("button", {
          type: "button",
          class: "world-primary",
          disabled: !q.value,
          onClick: l[6] || (l[6] = (o) => t(e).settings.subscribed ? t(b)("refresh") : t(b)("subscribe", { enabled: !0 }))
        }, k(t(n) ? "正在更新…" : t(i) ? "正在处理…" : t(e).settings.subscribed ? "获取新闻" : "开启自动新闻"), 9, Me),
        l[14] || (l[14] = a("small", null, "获取及更新将调用模型", -1))
      ]))], 512), [[G, !p.value]]),
      p.value ? (s(), r("div", {
        key: 1,
        ref_key: "articlePage",
        ref: x,
        class: "world-scroll world-reading"
      }, [P(oe, {
        article: p.value,
        update: C.value,
        onLatest: z
      }, null, 8, ["article", "update"]), a("button", {
        type: "button",
        class: "world-bottom-back",
        onClick: A
      }, [...l[15] || (l[15] = [a("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [a("path", { d: "m14 6-6 6 6 6" })], -1), J(" 返回见闻 ", -1)])])], 512)) : $("", !0)
    ], 32));
  }
}), Ee = Te;
export {
  Ee as default
};
