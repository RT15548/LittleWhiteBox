/* eslint-disable */
import { $ as M, B as K, E as W, F as r, G as D, L as P, M as J, O as U, Q as t, X as R, Y as _, Z as A, _ as s, b as L, c as G, et as H, g as $, l as Q, m as a, p as h, s as X, tt as k, u as O, v as Y, x as E, y as Z } from "./xiaobai-os-runtime-dom.esm-bundler-DuiaxqDz.js";
import { n as ee } from "./xiaobai-os-app-navigation-CKmHuh0u.js";
import { t as te } from "./xiaobai-os-frame-bridge-5XxFerhp.js";
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
    return (d, n) => (r(), s("article", ae, [
      a("h1", le, k(c.article.title), 1),
      c.update !== "same" ? (r(), s("div", re, [c.update === "updated" ? (r(), s(O, { key: 0 }, [n[1] || (n[1] = a("span", null, "这篇见闻有了新内容", -1)), a("button", {
        type: "button",
        onClick: n[0] || (n[0] = (u) => d.$emit("latest"))
      }, "阅读新版")], 64)) : (r(), s("span", se, "这篇已不在当前列表，仍可读完。"))])) : $("", !0),
      a("div", ne, [(r(!0), s(O, null, P(i.value, (u, g) => (r(), s("p", { key: g }, k(u), 1))), 128))])
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
    const e = _(!1), i = K(), d = `url("https://picsum.photos/800/300?random=${Math.random()}")`;
    return (n, u) => (r(), s("div", ue, [a("div", {
      class: "world-horizon",
      "aria-hidden": "true",
      style: H({ "--world-cover-image": d })
    }, null, 4), c.overview ? (r(), s("div", de, [a("p", {
      id: t(i),
      class: M(["world-overview-text", { "is-expanded": e.value }])
    }, k(c.overview), 11, ve), a("button", {
      type: "button",
      class: "world-overview-toggle",
      "aria-expanded": e.value,
      "aria-controls": t(i),
      "aria-label": e.value ? "收起世界近况" : "查看世界近况",
      onClick: u[0] || (u[0] = (g) => e.value = !e.value)
    }, [(r(), s("svg", {
      viewBox: "0 0 24 24",
      "aria-hidden": "true",
      class: M({ "is-expanded": e.value })
    }, [...u[1] || (u[1] = [a("path", { d: "m7 10 5 5 5-5" }, null, -1)])], 2))], 8, ce)])) : $("", !0)]));
  }
}), fe = pe;
function we(c) {
  const e = R(structuredClone(A(c.initialState))), i = _(!1), d = _(""), n = _(!1);
  let u = !1, g = 0, b = () => {
  };
  function p(y) {
    e.value = structuredClone(A(y)), d.value = "", n.value = !1;
  }
  const S = h(() => !i.value && e.value.writeState === "ready"), x = h(() => e.value.maintenance === "running"), f = h(() => n.value ? d.value : e.value.writeState !== "ready" ? e.value.message : d.value || e.value.message), B = h(() => n.value || e.value.maintenance === "error" || [
    "failed",
    "unconfirmed",
    "conflict"
  ].includes(e.value.writeState));
  async function I(y, m = {}) {
    if (i.value) return;
    i.value = !0, d.value = "", n.value = !1;
    const C = e.value.chatIdentity, N = g;
    try {
      const w = await c.bridge.request(`world/${y}`, {
        chatIdentity: C,
        ...m
      }, 35e3);
      if (!u || e.value.chatIdentity !== C) return;
      N === g && w.result.state.chatIdentity === C && p(w.result.state), w.result.message && (d.value = w.result.message);
    } catch (w) {
      if (!u || e.value.chatIdentity !== C) return;
      const q = w instanceof Error ? w.message : "";
      d.value = q === "host_request_timeout" ? "暂时没收到结果，更新可能还在继续。请稍后重新加载，不要再次生成。" : w instanceof te && w.code === "app_request_failed" ? q : "操作未完成，请检查保存状态或稍后重试。", n.value = !0;
    } finally {
      u && (i.value = !1);
    }
  }
  return J(() => {
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
    error: B,
    request: I
  };
}
var be = { class: "world-toolbar" }, ye = { class: "world-tools" }, ge = ["disabled", "title"], me = ["onKeydown"], ke = { class: "world-menu-sheet" }, _e = ["checked", "disabled"], he = ["checked", "disabled"], Se = ["disabled"], xe = ["disabled"], Ce = ["disabled"], $e = {
  key: 0,
  class: "world-news-list",
  "aria-label": "各处见闻"
}, Be = ["data-article-id", "onClick"], Ie = { class: "world-item-text" }, Ne = { class: "world-item-preview" }, qe = {
  key: 1,
  class: "world-empty"
}, Me = ["disabled"], Ae = /* @__PURE__ */ E({
  __name: "WorldApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(c) {
    const { state: e, pending: i, writable: d, refreshing: n, notice: u, error: g, request: b } = we(c), p = R(null), S = _(null), x = _(null), f = _(null), B = _(null);
    let I = 0, y = "";
    const m = h(() => e.value.world.news.find((v) => v.id === p.value?.id)), C = h(() => m.value ? JSON.stringify(m.value) === JSON.stringify(p.value) ? "same" : "updated" : "removed"), N = h(() => d.value && !n.value);
    async function w(v, l) {
      const o = v.target;
      await b(l === "subscribed" ? "subscribe" : "background", { enabled: o.checked }), o.checked = e.value.settings[l];
    }
    async function q(v) {
      I = S.value?.scrollTop ?? 0, y = v.id, p.value = structuredClone(A(v)), await W(), x.value?.querySelector("h1")?.focus({ preventScroll: !0 });
    }
    async function T() {
      p.value = null, await W(), S.value && (S.value.scrollTop = I, ([...S.value.querySelectorAll("[data-article-id]")].find((v) => v.dataset.articleId === y) ?? B.value)?.focus({ preventScroll: !0 }));
    }
    async function j() {
      m.value && (p.value = structuredClone(A(m.value)), await W(), x.value && (x.value.scrollTop = 0), x.value?.querySelector("h1")?.focus({ preventScroll: !0 }));
    }
    function V() {
      f.value && (f.value.open = !1, f.value.querySelector("summary")?.focus());
    }
    function z(v) {
      f.value && v.target instanceof Node && !f.value.contains(v.target) && (f.value.open = !1);
    }
    function F(v) {
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
        ref: B,
        class: "world-toolbar-title",
        tabindex: "-1"
      }, "世界", 512)), a("div", ye, [a("button", {
        type: "button",
        class: "world-icon-button",
        disabled: !N.value,
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
      }, null, -1)])], 2))], 8, ge), a("details", {
        ref_key: "menu",
        ref: f,
        class: "world-menu",
        onKeydown: G(Q(V, ["stop", "prevent"]), ["esc"]),
        onFocusout: F
      }, [l[13] || (l[13] = Y('<summary aria-label="新闻设置" title="新闻设置"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.7"></circle><circle cx="12" cy="12" r="1.7"></circle><circle cx="19" cy="12" r="1.7"></circle></svg></summary>', 1)), a("div", ke, [
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
      t(u) ? (r(), s("div", {
        key: 0,
        class: M(["world-notice", { "is-error": t(g) }]),
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
      }, "使用已保存版本", 8, xe)) : t(e).writeState === "failed" || t(g) ? (r(), s("button", {
        key: 2,
        disabled: t(i) || t(e).writeState === "saving",
        type: "button",
        onClick: l[5] || (l[5] = (o) => t(b)(t(e).maintenance === "error" && t(e).writeState === "ready" ? "refresh" : "read"))
      }, k(t(e).maintenance === "error" && t(e).writeState === "ready" ? "重试更新" : "重新加载"), 9, Ce)) : $("", !0)], 2)) : $("", !0),
      D(a("div", {
        ref_key: "listing",
        ref: S,
        class: "world-scroll world-listing"
      }, [L(fe, { overview: t(e).world.overview }, null, 8, ["overview"]), t(e).world.news.length ? (r(), s("section", $e, [(r(!0), s(O, null, P(t(e).world.news, (o) => (r(), s("article", {
        key: o.id,
        class: "world-news-item"
      }, [a("button", {
        type: "button",
        "data-article-id": o.id,
        onClick: (Te) => q(o)
      }, [a("span", Ie, [a("h2", null, k(o.title), 1), a("span", Ne, k(o.body), 1)])], 8, Be)]))), 128))])) : (r(), s("section", qe, [
        a("h2", null, k(t(n) ? "正在更新新闻" : t(e).settings.subscribed ? "已开启自动新闻" : "暂无新闻"), 1),
        a("button", {
          type: "button",
          class: "world-primary",
          disabled: !N.value,
          onClick: l[6] || (l[6] = (o) => t(e).settings.subscribed ? t(b)("refresh") : t(b)("subscribe", { enabled: !0 }))
        }, k(t(n) ? "正在更新…" : t(i) ? "正在处理…" : t(e).settings.subscribed ? "获取新闻" : "开启自动新闻"), 9, Me),
        l[14] || (l[14] = a("small", null, "获取及更新将调用模型", -1))
      ]))], 512), [[X, !p.value]]),
      p.value ? (r(), s("div", {
        key: 1,
        ref_key: "articlePage",
        ref: x,
        class: "world-scroll world-reading"
      }, [L(oe, {
        article: p.value,
        update: C.value,
        onLatest: j
      }, null, 8, ["article", "update"]), a("button", {
        type: "button",
        class: "world-bottom-back",
        onClick: T
      }, [...l[15] || (l[15] = [a("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [a("path", { d: "m14 6-6 6 6 6" })], -1), Z(" 返回见闻 ", -1)])])], 512)) : $("", !0)
    ], 32));
  }
}), Ve = Ae;
export {
  Ve as default
};
