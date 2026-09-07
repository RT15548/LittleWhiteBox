/* eslint-disable */
import { D as J, G as t, H as k, J as y, K as q, P as L, T as R, U as z, W as M, _ as U, b as P, c as F, f as h, g as r, h as I, j as K, k as s, l as G, p as a, q as H, s as Q, u as W, v as X, w as T, y as V, z as Y } from "./xiaobai-os-runtime-dom.esm-bundler-DGqntx6-.js";
import { n as Z } from "./xiaobai-os-app-navigation-D5qZ5Ulq.js";
var ee = { class: "world-article" }, te = { tabindex: "-1" }, ae = {
  key: 0,
  class: "world-article-update",
  role: "status"
}, le = { key: 1 }, re = { class: "world-article-body" }, se = /* @__PURE__ */ P({
  __name: "NewsArticle",
  props: {
    article: {},
    update: {}
  },
  emits: ["latest"],
  setup(d) {
    const e = d, u = h(() => e.article.body.split(/\n\s*\n|\n/).map((i) => i.trim()).filter(Boolean));
    return (i, n) => (s(), r("article", ee, [
      a("h1", te, y(d.article.title), 1),
      d.update !== "same" ? (s(), r("div", ae, [d.update === "updated" ? (s(), r(W, { key: 0 }, [n[1] || (n[1] = a("span", null, "这篇见闻有了新内容", -1)), a("button", {
        type: "button",
        onClick: n[0] || (n[0] = (o) => i.$emit("latest"))
      }, "阅读新版")], 64)) : (s(), r("span", le, "这篇已不在当前列表，仍可读完。"))])) : I("", !0),
      a("div", re, [(s(!0), r(W, null, K(u.value, (o, m) => (s(), r("p", { key: m }, y(o), 1))), 128))])
    ]));
  }
}), ne = se, ie = { class: "world-opening" }, oe = {
  key: 0,
  class: "world-overview"
}, ue = ["id"], de = [
  "aria-expanded",
  "aria-controls",
  "aria-label"
], ve = /* @__PURE__ */ P({
  __name: "WorldOpening",
  props: { overview: {} },
  setup(d) {
    const e = k(!1), u = L(), i = `url("https://picsum.photos/800/300?random=${Math.random()}")`;
    return (n, o) => (s(), r("div", ie, [a("div", {
      class: "world-horizon",
      "aria-hidden": "true",
      style: H({ "--world-cover-image": i })
    }, null, 4), d.overview ? (s(), r("div", oe, [a("p", {
      id: t(u),
      class: q(["world-overview-text", { "is-expanded": e.value }])
    }, y(d.overview), 11, ue), a("button", {
      type: "button",
      class: "world-overview-toggle",
      "aria-expanded": e.value,
      "aria-controls": t(u),
      "aria-label": e.value ? "收起世界近况" : "查看世界近况",
      onClick: o[0] || (o[0] = (m) => e.value = !e.value)
    }, [(s(), r("svg", {
      viewBox: "0 0 24 24",
      "aria-hidden": "true",
      class: q({ "is-expanded": e.value })
    }, [...o[1] || (o[1] = [a("path", { d: "m7 10 5 5 5-5" }, null, -1)])], 2))], 8, de)])) : I("", !0)]));
  }
}), ce = ve;
function pe(d) {
  const e = z(structuredClone(M(d.initialState))), u = k(!1), i = k(""), n = k(!1);
  let o = !1, m = 0, f = () => {
  };
  function v(b) {
    e.value = structuredClone(M(b)), i.value = "", n.value = !1;
  }
  const S = h(() => !u.value && e.value.writeState === "ready"), x = h(() => e.value.maintenance === "running"), c = h(() => e.value.writeState !== "ready" ? e.value.message : i.value || e.value.message), N = h(() => n.value || e.value.maintenance === "error" || [
    "failed",
    "unconfirmed",
    "conflict"
  ].includes(e.value.writeState));
  async function A(b, g = {}) {
    if (u.value) return;
    u.value = !0, i.value = "", n.value = !1;
    const C = e.value.chatIdentity, B = m;
    try {
      const _ = await d.bridge.request(`world/${b}`, {
        chatIdentity: C,
        ...g
      }, 35e3);
      if (!o || e.value.chatIdentity !== C) return;
      B === m && _.result.state.chatIdentity === C && v(_.result.state), _.result.message && (i.value = _.result.message);
    } catch (_) {
      if (!o || e.value.chatIdentity !== C) return;
      const $ = _ instanceof Error ? _.message : "";
      i.value = $ === "host_request_timeout" ? "等待结果超时，操作可能仍在进行。请稍后重试读取，避免重复生成。" : $.startsWith("请先在 API") ? "请先在 API 应用中配置可用的模型。" : "操作未完成，请检查保存状态或稍后重试。", n.value = !0;
    } finally {
      o && (u.value = !1);
    }
  }
  return J(() => {
    o = !0, f = d.bridge.subscribe((b) => {
      if (b.type === "world/state") {
        const g = b.payload.state;
        g.chatIdentity === e.value.chatIdentity && (m++, v(g));
      } else b.type === "world/error" && (n.value = !0, i.value = "暂时无法读取世界内容，请重试读取。");
    });
  }), R(() => {
    o = !1, f();
  }), {
    state: e,
    pending: u,
    writable: S,
    refreshing: x,
    notice: c,
    error: N,
    request: A
  };
}
var we = { class: "world-toolbar" }, fe = { class: "world-tools" }, be = ["disabled", "title"], ye = ["onKeydown"], me = { class: "world-menu-sheet" }, ge = ["disabled"], _e = ["checked", "disabled"], ke = ["disabled"], he = ["disabled"], Se = ["disabled"], xe = {
  key: 0,
  class: "world-news-list",
  "aria-label": "各处见闻"
}, Ce = ["data-article-id", "onClick"], $e = { class: "world-item-text" }, Ie = { class: "world-item-summary" }, Ne = {
  key: 1,
  class: "world-empty"
}, Ae = ["disabled"], Be = /* @__PURE__ */ P({
  __name: "WorldApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(d) {
    const { state: e, pending: u, writable: i, refreshing: n, notice: o, error: m, request: f } = pe(d), v = z(null), S = k(null), x = k(null), c = k(null), N = k(null);
    let A = 0, b = "";
    const g = h(() => e.value.world.news.find((p) => p.id === v.value?.id)), C = h(() => g.value ? JSON.stringify(g.value) === JSON.stringify(v.value) ? "same" : "updated" : "removed"), B = h(() => i.value && !n.value);
    async function _(p) {
      A = S.value?.scrollTop ?? 0, b = p.id, v.value = structuredClone(M(p)), await T(), x.value?.querySelector("h1")?.focus({ preventScroll: !0 });
    }
    async function $() {
      v.value = null, await T(), S.value && (S.value.scrollTop = A, ([...S.value.querySelectorAll("[data-article-id]")].find((p) => p.dataset.articleId === b) ?? N.value)?.focus({ preventScroll: !0 }));
    }
    async function j() {
      g.value && (v.value = structuredClone(M(g.value)), await T(), x.value && (x.value.scrollTop = 0), x.value?.querySelector("h1")?.focus({ preventScroll: !0 }));
    }
    function O() {
      c.value && (c.value.open = !1, c.value.querySelector("summary")?.focus());
    }
    function D(p) {
      c.value && p.target instanceof Node && !c.value.contains(p.target) && (c.value.open = !1);
    }
    function E(p) {
      c.value && (!(p.relatedTarget instanceof Node) || !c.value.contains(p.relatedTarget)) && (c.value.open = !1);
    }
    return Z(() => c.value?.open ? (O(), !0) : v.value ? ($(), !0) : !1), (p, l) => (s(), r("section", {
      class: "world-app",
      "aria-label": "世界新闻",
      onPointerdown: D
    }, [
      a("header", we, [v.value ? (s(), r("button", {
        key: 0,
        type: "button",
        class: "world-back",
        onClick: $
      }, [...l[7] || (l[7] = [a("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [a("path", { d: "m14 6-6 6 6 6" })], -1), a("span", null, "见闻", -1)])])) : (s(), r("h1", {
        key: 1,
        ref_key: "title",
        ref: N,
        class: "world-toolbar-title",
        tabindex: "-1"
      }, "世界", 512)), a("div", fe, [a("button", {
        type: "button",
        class: "world-icon-button",
        disabled: !B.value,
        "aria-label": "刷新新闻",
        title: t(n) ? "正在更新世界近况" : "刷新新闻，会使用模型",
        onClick: l[0] || (l[0] = (w) => t(f)("refresh"))
      }, [(s(), r("svg", {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "1.6",
        "aria-hidden": "true",
        class: q({ "world-spinning": t(n) })
      }, [...l[8] || (l[8] = [a("path", {
        d: "M20 10a8 8 0 1 0-1 6M20 4v6h-6",
        "stroke-linecap": "round",
        "stroke-linejoin": "round"
      }, null, -1)])], 2))], 8, be), a("details", {
        ref_key: "menu",
        ref: c,
        class: "world-menu",
        onKeydown: F(G(O, ["stop", "prevent"]), ["esc"]),
        onFocusout: E
      }, [l[12] || (l[12] = U('<summary aria-label="新闻设置" title="新闻设置"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.7"></circle><circle cx="12" cy="12" r="1.7"></circle><circle cx="19" cy="12" r="1.7"></circle></svg></summary>', 1)), a("div", me, [
        a("button", {
          type: "button",
          disabled: !t(i),
          onClick: l[1] || (l[1] = (w) => t(f)("subscribe", { enabled: !t(e).world.subscribed }))
        }, [a("span", null, y(t(e).world.subscribed ? "取消订阅" : "订阅新闻"), 1)], 8, ge),
        l[10] || (l[10] = a("p", null, "随剧情更新，将调用模型。取消订阅后保留新闻。", -1)),
        a("label", null, [l[9] || (l[9] = a("span", null, "作为剧情背景", -1)), a("input", {
          type: "checkbox",
          checked: t(e).world.injectToStory,
          disabled: !t(i),
          onChange: l[2] || (l[2] = (w) => t(f)("background", { enabled: w.target.checked }))
        }, null, 40, _e)]),
        l[11] || (l[11] = a("p", null, "将近况提供给后续剧情。", -1))
      ])], 40, ye)])]),
      t(o) ? (s(), r("div", {
        key: 0,
        class: q(["world-notice", { "is-error": t(m) }]),
        role: "status",
        "aria-live": "polite"
      }, [a("span", null, y(t(o)), 1), t(e).writeState === "unconfirmed" || t(e).pendingSave && t(e).writeState === "failed" ? (s(), r("button", {
        key: 0,
        disabled: t(u),
        type: "button",
        onClick: l[3] || (l[3] = (w) => t(f)("confirm-save"))
      }, "核实保存", 8, ke)) : t(e).writeState === "conflict" ? (s(), r("button", {
        key: 1,
        disabled: t(u),
        type: "button",
        onClick: l[4] || (l[4] = (w) => t(f)("adopt-server-state"))
      }, "读取服务器版本", 8, he)) : t(e).writeState === "failed" || t(m) ? (s(), r("button", {
        key: 2,
        disabled: t(u) || t(e).writeState === "saving",
        type: "button",
        onClick: l[5] || (l[5] = (w) => t(f)(t(e).maintenance === "error" && t(e).writeState === "ready" ? "refresh" : "read"))
      }, y(t(e).maintenance === "error" && t(e).writeState === "ready" ? "重试更新" : "重试读取"), 9, Se)) : I("", !0)], 2)) : I("", !0),
      Y(a("div", {
        ref_key: "listing",
        ref: S,
        class: "world-scroll world-listing"
      }, [V(ce, { overview: t(e).world.overview }, null, 8, ["overview"]), t(e).world.news.length ? (s(), r("section", xe, [(s(!0), r(W, null, K(t(e).world.news, (w) => (s(), r("article", {
        key: w.id,
        class: "world-news-item"
      }, [a("button", {
        type: "button",
        "data-article-id": w.id,
        onClick: (qe) => _(w)
      }, [a("span", $e, [a("h2", null, y(w.title), 1), a("span", Ie, y(w.summary), 1)])], 8, Ce)]))), 128))])) : (s(), r("section", Ne, [
        a("h2", null, y(t(n) ? "正在更新新闻" : t(e).world.subscribed ? "已订阅，等待新闻" : "暂无新闻"), 1),
        a("button", {
          type: "button",
          class: "world-primary",
          disabled: !B.value,
          onClick: l[6] || (l[6] = (w) => t(e).world.subscribed ? t(f)("refresh") : t(f)("subscribe", { enabled: !0 }))
        }, y(t(n) ? "正在更新…" : t(u) ? "正在处理…" : t(e).world.subscribed ? "获取新闻" : "订阅新闻"), 9, Ae),
        l[13] || (l[13] = a("small", null, "获取及更新将调用模型", -1))
      ]))], 512), [[Q, !v.value]]),
      v.value ? (s(), r("div", {
        key: 1,
        ref_key: "articlePage",
        ref: x,
        class: "world-scroll world-reading"
      }, [V(ne, {
        article: v.value,
        update: C.value,
        onLatest: j
      }, null, 8, ["article", "update"]), a("button", {
        type: "button",
        class: "world-bottom-back",
        onClick: $
      }, [...l[14] || (l[14] = [a("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [a("path", { d: "m14 6-6 6 6 6" })], -1), X(" 返回见闻 ", -1)])])], 512)) : I("", !0)
    ], 32));
  }
}), We = Be;
export {
  We as default
};
