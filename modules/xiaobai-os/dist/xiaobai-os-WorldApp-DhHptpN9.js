/* eslint-disable */
import { D as L, G as e, H as k, J as b, K as A, P as R, T as j, U as P, W as T, _ as D, b as U, c as E, f as _, g as l, h as I, j as G, k as s, l as J, p as a, s as Z, u as q, v as F, w as W, y as z, z as Q } from "./xiaobai-os-runtime-dom.esm-bundler-DGqntx6-.js";
import { n as X } from "./xiaobai-os-app-navigation-D5qZ5Ulq.js";
var Y = { class: "world-article" }, ee = { tabindex: "-1" }, te = {
  key: 0,
  class: "world-article-update",
  role: "status"
}, ae = { key: 1 }, re = { class: "world-article-body" }, le = /* @__PURE__ */ U({
  __name: "NewsArticle",
  props: {
    article: {},
    update: {}
  },
  emits: ["latest"],
  setup(u) {
    const t = u, d = _(() => t.article.body.split(/\n\s*\n|\n/).map((i) => i.trim()).filter(Boolean));
    return (i, o) => (s(), l("article", Y, [
      a("h1", ee, b(u.article.title), 1),
      u.update !== "same" ? (s(), l("div", te, [u.update === "updated" ? (s(), l(q, { key: 0 }, [o[1] || (o[1] = a("span", null, "这篇见闻有了新内容", -1)), a("button", {
        type: "button",
        onClick: o[0] || (o[0] = (n) => i.$emit("latest"))
      }, "阅读新版")], 64)) : (s(), l("span", ae, "这篇已不在当前列表，仍可读完。"))])) : I("", !0),
      a("div", re, [(s(!0), l(q, null, G(d.value, (n, m) => (s(), l("p", { key: m }, b(n), 1))), 128))])
    ]));
  }
}), se = le, oe = { class: "world-opening" }, ie = { class: "world-horizon" }, ne = ["src"], de = {
  key: 0,
  class: "world-overview"
}, ue = ["id"], ce = [
  "aria-expanded",
  "aria-controls",
  "aria-label"
], ve = /* @__PURE__ */ U({
  __name: "WorldOpening",
  props: { overview: {} },
  setup(u) {
    const t = k(!1), d = R(), i = new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%201000%20280'%20fill='none'%3e%3cstyle%3e%20:root%20{%20--sky-top:%20%23dcedff;%20--sky-bottom:%20%23f5faff;%20--sea-top:%20%23b5d9f2;%20--sea-bottom:%20%23e4f1fa;%20--light:%20%23fffdf1;%20--near:%20%23759dc1;%20--far:%20%238bb6d3;%20--glint:%20%23fff;%20}%20@media%20(prefers-color-scheme:%20dark)%20{%20:root%20{%20--sky-top:%20%23172a43;%20--sky-bottom:%20%23304e74;%20--sea-top:%20%23416185;%20--sea-bottom:%20%23243b56;%20--light:%20%23dcecff;%20--near:%20%23233d5d;%20--far:%20%23345573;%20--glint:%20%2389b9e1;%20}%20}%20%3c/style%3e%3cdefs%3e%3clinearGradient%20id='sky'%20x1='500'%20y1='0'%20x2='500'%20y2='280'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='var(--sky-top)'/%3e%3cstop%20offset='1'%20stop-color='var(--sky-bottom)'/%3e%3c/linearGradient%3e%3clinearGradient%20id='sea'%20x1='500'%20y1='172'%20x2='500'%20y2='280'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='var(--sea-top)'/%3e%3cstop%20offset='1'%20stop-color='var(--sea-bottom)'/%3e%3c/linearGradient%3e%3c/defs%3e%3cpath%20fill='url(%23sky)'%20d='M0%200h1000v280H0z'/%3e%3ccircle%20cx='735'%20cy='81'%20r='27'%20fill='var(--light)'/%3e%3cpath%20d='M0%20174c193-10%20338%202%20510-5s336-5%20490%204v107H0Z'%20fill='url(%23sea)'/%3e%3cpath%20d='M0%20173c202-9%20353%203%20509-4s335-5%20491%204'%20stroke='var(--glint)'%20stroke-width='1.5'/%3e%3cpath%20d='M0%20260c91-17%20130-56%20225-57%20131-1%20176%2077%20323%2077H0Z'%20fill='var(--near)'/%3e%3cpath%20d='M695%20280c119-44%20196-30%20305-71v71Z'%20fill='var(--far)'/%3e%3cpath%20d='m661%20200%20153%201m-188%2016h216m-235%2018h279'%20stroke='var(--glint)'%20stroke-opacity='.55'/%3e%3c/svg%3e", "" + import.meta.url).href;
    return (o, n) => (s(), l("div", oe, [a("div", ie, [a("img", {
      src: e(i),
      alt: "",
      draggable: "false",
      class: "world-horizon-art"
    }, null, 8, ne)]), u.overview ? (s(), l("div", de, [a("p", {
      id: e(d),
      class: A(["world-overview-text", { "is-expanded": t.value }])
    }, b(u.overview), 11, ue), a("button", {
      type: "button",
      class: "world-overview-toggle",
      "aria-expanded": t.value,
      "aria-controls": e(d),
      "aria-label": t.value ? "收起世界近况" : "查看世界近况",
      onClick: n[0] || (n[0] = (m) => t.value = !t.value)
    }, [(s(), l("svg", {
      viewBox: "0 0 24 24",
      "aria-hidden": "true",
      class: A({ "is-expanded": t.value })
    }, [...n[1] || (n[1] = [a("path", { d: "m7 10 5 5 5-5" }, null, -1)])], 2))], 8, ce)])) : I("", !0)]));
  }
}), pe = ve;
function fe(u) {
  const t = P(structuredClone(T(u.initialState))), d = k(!1), i = k(""), o = k(!1);
  let n = !1, m = 0, w = () => {
  };
  function c(y) {
    t.value = structuredClone(T(y)), i.value = "", o.value = !1;
  }
  const x = _(() => !d.value && t.value.writeState === "ready"), S = _(() => t.value.maintenance === "running"), v = _(() => t.value.writeState !== "ready" ? t.value.message : i.value || t.value.message), M = _(() => o.value || t.value.maintenance === "error" || [
    "failed",
    "unconfirmed",
    "conflict"
  ].includes(t.value.writeState));
  async function B(y, g = {}) {
    if (d.value) return;
    d.value = !0, i.value = "", o.value = !1;
    const C = t.value.chatIdentity, N = m;
    try {
      const h = await u.bridge.request(`world/${y}`, {
        chatIdentity: C,
        ...g
      }, 35e3);
      if (!n || t.value.chatIdentity !== C) return;
      N === m && h.result.state.chatIdentity === C && c(h.result.state), h.result.message && (i.value = h.result.message);
    } catch (h) {
      if (!n || t.value.chatIdentity !== C) return;
      const $ = h instanceof Error ? h.message : "";
      i.value = $ === "host_request_timeout" ? "等待结果超时，操作可能仍在进行。请稍后重试读取，避免重复生成。" : $.startsWith("请先在 API") ? "请先在 API 应用中配置可用的模型。" : "操作未完成，请检查保存状态或稍后重试。", o.value = !0;
    } finally {
      n && (d.value = !1);
    }
  }
  return L(() => {
    n = !0, w = u.bridge.subscribe((y) => {
      if (y.type === "world/state") {
        const g = y.payload.state;
        g.chatIdentity === t.value.chatIdentity && (m++, c(g));
      } else y.type === "world/error" && (o.value = !0, i.value = "暂时无法读取世界内容，请重试读取。");
    });
  }), j(() => {
    n = !1, w();
  }), {
    state: t,
    pending: d,
    writable: x,
    refreshing: S,
    notice: v,
    error: M,
    request: B
  };
}
var we = { class: "world-toolbar" }, ye = { class: "world-tools" }, be = ["disabled", "title"], me = ["onKeydown"], ge = { class: "world-menu-sheet" }, he = ["disabled"], ke = ["checked", "disabled"], _e = ["disabled"], xe = ["disabled"], Se = ["disabled"], Ce = {
  key: 0,
  class: "world-news-list",
  "aria-label": "各处见闻"
}, $e = ["data-article-id", "onClick"], Ie = { class: "world-item-text" }, Me = { class: "world-item-summary" }, Be = {
  key: 1,
  class: "world-empty"
}, Ne = ["disabled"], Ae = /* @__PURE__ */ U({
  __name: "WorldApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(u) {
    const { state: t, pending: d, writable: i, refreshing: o, notice: n, error: m, request: w } = fe(u), c = P(null), x = k(null), S = k(null), v = k(null), M = k(null);
    let B = 0, y = "";
    const g = _(() => t.value.world.news.find((p) => p.id === c.value?.id)), C = _(() => g.value ? JSON.stringify(g.value) === JSON.stringify(c.value) ? "same" : "updated" : "removed"), N = _(() => i.value && !o.value);
    async function h(p) {
      B = x.value?.scrollTop ?? 0, y = p.id, c.value = structuredClone(T(p)), await W(), S.value?.querySelector("h1")?.focus({ preventScroll: !0 });
    }
    async function $() {
      c.value = null, await W(), x.value && (x.value.scrollTop = B, ([...x.value.querySelectorAll("[data-article-id]")].find((p) => p.dataset.articleId === y) ?? M.value)?.focus({ preventScroll: !0 }));
    }
    async function V() {
      g.value && (c.value = structuredClone(T(g.value)), await W(), S.value && (S.value.scrollTop = 0), S.value?.querySelector("h1")?.focus({ preventScroll: !0 }));
    }
    function O() {
      v.value && (v.value.open = !1, v.value.querySelector("summary")?.focus());
    }
    function H(p) {
      v.value && p.target instanceof Node && !v.value.contains(p.target) && (v.value.open = !1);
    }
    function K(p) {
      v.value && (!(p.relatedTarget instanceof Node) || !v.value.contains(p.relatedTarget)) && (v.value.open = !1);
    }
    return X(() => v.value?.open ? (O(), !0) : c.value ? ($(), !0) : !1), (p, r) => (s(), l("section", {
      class: "world-app",
      "aria-label": "世界新闻",
      onPointerdown: H
    }, [
      a("header", we, [c.value ? (s(), l("button", {
        key: 0,
        type: "button",
        class: "world-back",
        onClick: $
      }, [...r[7] || (r[7] = [a("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [a("path", { d: "m14 6-6 6 6 6" })], -1), a("span", null, "见闻", -1)])])) : (s(), l("h1", {
        key: 1,
        ref_key: "title",
        ref: M,
        class: "world-toolbar-title",
        tabindex: "-1"
      }, "世界", 512)), a("div", ye, [a("button", {
        type: "button",
        class: "world-icon-button",
        disabled: !N.value,
        "aria-label": "刷新新闻",
        title: e(o) ? "正在更新世界近况" : "刷新新闻，会使用模型",
        onClick: r[0] || (r[0] = (f) => e(w)("refresh"))
      }, [(s(), l("svg", {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "1.6",
        "aria-hidden": "true",
        class: A({ "world-spinning": e(o) })
      }, [...r[8] || (r[8] = [a("path", {
        d: "M20 10a8 8 0 1 0-1 6M20 4v6h-6",
        "stroke-linecap": "round",
        "stroke-linejoin": "round"
      }, null, -1)])], 2))], 8, be), a("details", {
        ref_key: "menu",
        ref: v,
        class: "world-menu",
        onKeydown: E(J(O, ["stop", "prevent"]), ["esc"]),
        onFocusout: K
      }, [r[12] || (r[12] = D('<summary aria-label="新闻设置" title="新闻设置"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.7"></circle><circle cx="12" cy="12" r="1.7"></circle><circle cx="19" cy="12" r="1.7"></circle></svg></summary>', 1)), a("div", ge, [
        a("button", {
          type: "button",
          disabled: !e(i),
          onClick: r[1] || (r[1] = (f) => e(w)("subscribe", { enabled: !e(t).world.subscribed }))
        }, [a("span", null, b(e(t).world.subscribed ? "取消订阅" : "订阅新闻"), 1)], 8, he),
        r[10] || (r[10] = a("p", null, "随剧情更新，将调用模型。取消订阅后保留新闻。", -1)),
        a("label", null, [r[9] || (r[9] = a("span", null, "作为剧情背景", -1)), a("input", {
          type: "checkbox",
          checked: e(t).world.injectToStory,
          disabled: !e(i),
          onChange: r[2] || (r[2] = (f) => e(w)("background", { enabled: f.target.checked }))
        }, null, 40, ke)]),
        r[11] || (r[11] = a("p", null, "将近况提供给后续剧情。", -1))
      ])], 40, me)])]),
      e(n) ? (s(), l("div", {
        key: 0,
        class: A(["world-notice", { "is-error": e(m) }]),
        role: "status",
        "aria-live": "polite"
      }, [a("span", null, b(e(n)), 1), e(t).writeState === "unconfirmed" || e(t).pendingSave && e(t).writeState === "failed" ? (s(), l("button", {
        key: 0,
        disabled: e(d),
        type: "button",
        onClick: r[3] || (r[3] = (f) => e(w)("confirm-save"))
      }, "核实保存", 8, _e)) : e(t).writeState === "conflict" ? (s(), l("button", {
        key: 1,
        disabled: e(d),
        type: "button",
        onClick: r[4] || (r[4] = (f) => e(w)("adopt-server-state"))
      }, "读取服务器版本", 8, xe)) : e(t).writeState === "failed" || e(m) ? (s(), l("button", {
        key: 2,
        disabled: e(d) || e(t).writeState === "saving",
        type: "button",
        onClick: r[5] || (r[5] = (f) => e(w)(e(t).maintenance === "error" && e(t).writeState === "ready" ? "refresh" : "read"))
      }, b(e(t).maintenance === "error" && e(t).writeState === "ready" ? "重试更新" : "重试读取"), 9, Se)) : I("", !0)], 2)) : I("", !0),
      Q(a("div", {
        ref_key: "listing",
        ref: x,
        class: "world-scroll world-listing"
      }, [z(pe, { overview: e(t).world.overview }, null, 8, ["overview"]), e(t).world.news.length ? (s(), l("section", Ce, [(s(!0), l(q, null, G(e(t).world.news, (f) => (s(), l("article", {
        key: f.id,
        class: "world-news-item"
      }, [a("button", {
        type: "button",
        "data-article-id": f.id,
        onClick: (Te) => h(f)
      }, [a("span", Ie, [a("h2", null, b(f.title), 1), a("span", Me, b(f.summary), 1)])], 8, $e)]))), 128))])) : (s(), l("section", Be, [
        a("h2", null, b(e(o) ? "正在更新新闻" : e(t).world.subscribed ? "已订阅，等待新闻" : "暂无新闻"), 1),
        a("button", {
          type: "button",
          class: "world-primary",
          disabled: !N.value,
          onClick: r[6] || (r[6] = (f) => e(t).world.subscribed ? e(w)("refresh") : e(w)("subscribe", { enabled: !0 }))
        }, b(e(o) ? "正在更新…" : e(d) ? "正在处理…" : e(t).world.subscribed ? "获取新闻" : "订阅新闻"), 9, Ne),
        r[13] || (r[13] = a("small", null, "获取及更新将调用模型", -1))
      ]))], 512), [[Z, !c.value]]),
      c.value ? (s(), l("div", {
        key: 1,
        ref_key: "articlePage",
        ref: S,
        class: "world-scroll world-reading"
      }, [z(se, {
        article: c.value,
        update: C.value,
        onLatest: V
      }, null, 8, ["article", "update"]), a("button", {
        type: "button",
        class: "world-bottom-back",
        onClick: $
      }, [...r[14] || (r[14] = [a("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, [a("path", { d: "m14 6-6 6 6 6" })], -1), F(" 返回见闻 ", -1)])])], 512)) : I("", !0)
    ], 32));
  }
}), Ue = Ae;
export {
  Ue as default
};
