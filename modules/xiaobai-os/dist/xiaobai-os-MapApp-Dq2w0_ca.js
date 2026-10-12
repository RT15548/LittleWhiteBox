/* eslint-disable */
import { D as F, E as $, P as X, Q as M, R as G, S as b, T as V, V as r, X as K, b as Y, ft as d, h as L, lt as e, ot as W, rt as P, ut as J, v as R, x as c, y as i } from "./xiaobai-os-app-navigation-DvMnPkC0.js";
import { E as S, T, t as Z, w as C } from "./xiaobai-os-MapBrowser-wEeT2tGo.js";
import { t as x } from "./xiaobai-os-AppDialog-B4VpOkFC.js";
var _ = { class: "map-dialog-header" }, ee = { key: 0 }, te = { class: "map-settings-content" }, ae = { class: "map-auto-setting" }, ne = ["aria-checked", "disabled"], se = { class: "map-auto-setting" }, ie = [
  "aria-checked",
  "aria-label",
  "disabled"
], le = { class: "map-settings-section" }, oe = ["disabled"], ue = { key: 0 }, re = { class: "map-settings-section" }, de = { key: 0 }, me = ["disabled"], be = {
  key: 0,
  class: "map-setting-note",
  role: "status"
}, ve = ["disabled"], ce = /* @__PURE__ */ F({
  __name: "MapSettings",
  props: {
    autoMaintenance: { type: Boolean },
    projectToChat: { type: Boolean },
    busy: { type: Boolean },
    refreshDisabled: { type: Boolean },
    autoToggleBusy: { type: Boolean },
    disabledReason: {},
    hasMap: { type: Boolean },
    status: {},
    maintenanceMessage: {},
    maintenanceError: { type: Boolean },
    notice: {},
    noticeError: { type: Boolean }
  },
  emits: [
    "close",
    "setAuto",
    "setProjection",
    "update",
    "rebuild",
    "refresh"
  ],
  setup(t) {
    return (a, s) => (r(), Y(x, {
      class: "map-dialog map-settings",
      "aria-labelledby": "map-settings-title",
      onClose: s[6] || (s[6] = (l) => a.$emit("close"))
    }, {
      default: M(() => [
        i("header", _, [s[7] || (s[7] = i("div", null, [i("small", null, "让地图跟上你的故事"), i("h2", { id: "map-settings-title" }, "地图设置")], -1)), i("button", {
          type: "button",
          class: "map-round-button",
          "aria-label": "关闭地图设置",
          onClick: s[0] || (s[0] = (l) => a.$emit("close"))
        }, [$(S, { name: "close" })])]),
        t.status || t.notice || t.maintenanceMessage ? (r(), b("section", {
          key: 0,
          class: J(["map-settings-feedback", { "is-error": t.notice ? t.noticeError : t.maintenanceError }]),
          role: "status"
        }, [i("strong", null, d(t.notice ? t.notice === t.maintenanceMessage ? "最近一次更新" : "操作提示" : t.status || "最近一次更新"), 1), t.notice || t.maintenanceMessage ? (r(), b("p", ee, d(t.notice || t.maintenanceMessage), 1)) : c("", !0)], 2)) : c("", !0),
        i("div", te, [
          i("section", ae, [s[9] || (s[9] = i("div", null, [i("h3", null, "随对话自动更新"), i("p", null, "你发送下一条消息时，根据上一轮对话更新地图。适用于所有普通聊天。")], -1)), i("button", {
            type: "button",
            class: "map-switch",
            role: "switch",
            "aria-checked": t.autoMaintenance,
            "aria-label": "随对话自动更新",
            disabled: t.autoToggleBusy,
            onClick: s[1] || (s[1] = (l) => a.$emit("setAuto", !t.autoMaintenance))
          }, [...s[8] || (s[8] = [i("span", null, null, -1)])], 8, ne)]),
          i("section", se, [i("div", null, [i("h3", null, d(e(T).label), 1), i("p", null, d(e(T).description), 1)]), i("button", {
            type: "button",
            class: "map-switch",
            role: "switch",
            "aria-checked": t.projectToChat,
            "aria-label": e(T).label,
            disabled: t.autoToggleBusy,
            onClick: s[2] || (s[2] = (l) => a.$emit("setProjection", !t.projectToChat))
          }, [...s[10] || (s[10] = [i("span", null, null, -1)])], 8, ie)]),
          i("section", le, [
            $(S, { name: "refresh" }),
            s[11] || (s[11] = i("h3", null, "补充最近的变化", -1)),
            s[12] || (s[12] = i("p", null, "根据最近一轮对话更新位置和地点，并补全当前区域尚缺少的探索去处。", -1)),
            i("button", {
              type: "button",
              class: "map-primary-button",
              disabled: t.busy || !!t.disabledReason || !t.hasMap,
              onClick: s[3] || (s[3] = (l) => a.$emit("update"))
            }, d(t.busy ? t.status || "请稍候…" : "更新地图"), 9, oe),
            t.hasMap ? c("", !0) : (r(), b("small", ue, "请先建立世界地图"))
          ]),
          i("section", re, [
            $(S, { name: "globe" }),
            i("h3", null, d(t.hasMap ? "重新绘制世界" : "建立世界地图"), 1),
            s[13] || (s[13] = i("p", null, "依据角色与世界设定建立地图；设定未写明的地方，会合理补全。结合当前聊天保留已发生的故事。", -1)),
            t.hasMap ? (r(), b("p", de, "新地图保存成功后替换原图；失败时保留原图。")) : c("", !0),
            i("button", {
              type: "button",
              class: "map-secondary-button",
              disabled: t.busy || !!t.disabledReason,
              onClick: s[4] || (s[4] = (l) => a.$emit("rebuild"))
            }, d(t.busy ? t.status || "请稍候…" : t.hasMap ? "重新绘制" : "绘制世界地图"), 9, me)
          ]),
          t.disabledReason ? (r(), b("p", be, d(t.disabledReason), 1)) : c("", !0),
          i("button", {
            type: "button",
            class: "map-sync-button",
            disabled: t.busy || t.refreshDisabled,
            onClick: s[5] || (s[5] = (l) => a.$emit("refresh"))
          }, [$(S, { name: "refresh" }), s[14] || (s[14] = V("重新加载地图", -1))], 8, ve),
          s[15] || (s[15] = i("p", { class: "map-setting-note" }, "只加载已保存的地图，不会重新绘制。绘制或更新时可以离开此页面。", -1))
        ])
      ]),
      _: 1
    }));
  }
}), pe = ce;
function A(t) {
  return !!t && typeof t == "object" && !Array.isArray(t);
}
function z(t) {
  return t.maintenanceStatus === "maintaining" || t.maintenanceStatus === "rebuilding";
}
function fe(t) {
  const a = P(structuredClone(W(t.initialState))), s = P(null), l = P(""), m = P(!1);
  let p = !1, f = 0, k = 0, E = () => {
  };
  const B = R(() => a.value.status === "unconfirmed" || a.value.writeState === "unconfirmed"), y = R(() => s.value !== null || ["loading", "saving"].includes(a.value.status) || ["maintaining", "rebuilding"].includes(a.value.maintenanceStatus || "")), j = R(() => y.value ? "正在更新地图，请稍候" : B.value ? "请先检查上一次是否保存成功" : a.value.status === "conflict" ? "存档有变化，请先选择要保留的版本" : a.value.status !== "ready" ? a.value.message || "地图暂时不可更新" : a.value.chatIdentity ? "" : "请先打开一个聊天"), q = R(() => a.value.maintenanceStatus === "rebuilding" || s.value === "rebuild" ? "正在绘制世界…" : a.value.maintenanceStatus === "maintaining" || s.value === "maintain" ? "正在更新地图…" : s.value === "confirm" ? "正在检查保存…" : y.value ? "请稍候…" : ""), D = R(() => a.value.message || l.value), U = R(() => a.value.message ? [
    "blocked",
    "error",
    "conflict",
    "unconfirmed"
  ].includes(a.value.status) : m.value);
  function h(o) {
    const n = z(a.value);
    a.value = structuredClone(o), z(o) ? (l.value = "", m.value = !1) : n && (l.value = o.maintenanceMessage || "", m.value = o.maintenanceStatus === "error");
  }
  function w(o, n) {
    const u = o instanceof Error ? o.message : String(o);
    return u.includes("聊天已切换") ? "聊天已切换，请重新打开地图。" : u === "host_request_timeout" ? "暂时没收到结果，地图可能还在更新。请稍后查看，不要再次更新。" : n === "confirm" ? "仍无法确认保存结果，请稍后再试。" : n === "adopt" ? "已保存版本暂时加载不了，当前修改还在，请稍后重试。" : n === "settings" || n === "projection" ? "设置未能保存，请重试。" : "地图操作未完成，请稍后重试。";
  }
  async function v(o, n, u = {}) {
    if (s.value) return;
    const I = ++f, Q = k, N = a.value.chatIdentity;
    s.value = n, l.value = "", m.value = !1;
    try {
      const O = await t.bridge.request(o, {
        chatIdentity: N,
        ...u
      }, 35e3);
      if (!p || I !== f || a.value.chatIdentity !== N) return;
      const g = A(O) ? O.result : void 0, H = A(g) && A(g.state) ? g.state : g;
      Q === k && A(H) && H.chatIdentity === N && h(H), (n === "maintain" || n === "rebuild") && A(g) && typeof g.message == "string" && g.message && (l.value = g.message), n === "refresh" && a.value.status === "ready" && (l.value = "已加载保存的地图。"), n === "settings" && (l.value = a.value.autoMaintenance ? "自动更新已开启。" : "自动更新已关闭。"), n === "projection" && (l.value = a.value.projectToChat ? T.enabled : T.disabled), n === "confirm" && a.value.status === "ready" && (l.value = "已确认保存成功。"), n === "adopt" && A(g) && g.adoption === "adopted" && (l.value = "已使用当前聊天里保存的 OS 存档。");
    } catch (O) {
      p && I === f && a.value.chatIdentity === N && (l.value = w(O, n), m.value = !0);
    } finally {
      p && I === f && (s.value = null);
    }
  }
  return G(() => {
    p = !0, E = t.bridge.subscribe((o) => {
      if (o.type === "map/state") {
        const n = o.payload.state;
        if (n.chatIdentity !== a.value.chatIdentity) return;
        k += 1, h(n);
      } else o.type === "map/error" && (k += 1, m.value = !0, l.value = o.payload.message || "地图暂时无法读取，请重新打开。");
    });
  }), X(() => {
    p = !1, f += 1, E();
  }), {
    state: a,
    activeRequest: s,
    busy: y,
    disabledReason: j,
    requiresConfirmation: B,
    status: q,
    notice: D,
    isError: U,
    dismissNotice: () => {
      l.value = "", m.value = !1;
    },
    refresh: () => {
      if (!y.value && !B.value) return v("map/refresh", "refresh");
    },
    confirmSave: () => {
      if (!y.value) return v("map/confirm-save", "confirm");
    },
    adopt: () => {
      if (!y.value) return v("map/adopt-server-state", "adopt");
    },
    setAuto: (o) => v("map/set-auto-maintenance", "settings", { enabled: o }),
    setProjection: (o) => v("map/set-projection", "projection", { enabled: o }),
    update: () => {
      if (!j.value && a.value.map) return v("map/maintain-once", "maintain");
    },
    rebuild: () => {
      if (!j.value) return v("map/rebuild", "rebuild");
    }
  };
}
var ye = {
  key: 0,
  class: "map-progress",
  role: "status"
}, ge = ["disabled"], ke = ["disabled"], he = ["disabled"], Ce = ["disabled"], Me = {
  key: 0,
  class: "map-setting-note"
}, $e = ["disabled"], Se = { class: "map-empty map-first-map" }, Be = { class: "map-empty-art" }, je = ["disabled"], Re = {
  key: 1,
  class: "map-setting-note"
}, Ae = /* @__PURE__ */ F({
  __name: "MapApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(t) {
    const { state: a, activeRequest: s, busy: l, disabledReason: m, requiresConfirmation: p, status: f, notice: k, isError: E, dismissNotice: B, refresh: y, confirmSave: j, adopt: q, setAuto: D, setProjection: U, update: h, rebuild: w } = fe(t), v = P(!1);
    return K(() => a.value.chatIdentity, () => {
      v.value = !1;
    }), (o, n) => (r(), Y(Z, {
      map: e(a).map,
      "chat-identity": e(a).chatIdentity
    }, {
      toolbar: M(() => [i("button", {
        type: "button",
        class: "map-round-button",
        "aria-label": "地图设置",
        onClick: n[0] || (n[0] = (u) => v.value = !0)
      }, [$(S, { name: "more" })])]),
      feedback: M(() => [e(f) ? (r(), b("div", ye, [n[9] || (n[9] = i("span", null, null, -1)), V(d(e(f)), 1)])) : c("", !0), e(k) || e(p) || e(a).status === "conflict" ? (r(), b("aside", {
        key: 1,
        class: J(["map-notice", { "is-error": e(E) }]),
        role: "status"
      }, [i("p", null, d(e(k) || (e(p) ? "还不确定是否保存成功，请先检查保存。" : "服务器上的存档与当前内容不同。")), 1), e(p) ? (r(), b("button", {
        key: 0,
        type: "button",
        disabled: e(l),
        onClick: n[1] || (n[1] = (...u) => e(j) && e(j)(...u))
      }, "检查保存", 8, ge)) : e(a).status === "conflict" ? (r(), b(L, { key: 1 }, [n[10] || (n[10] = i("small", null, "恢复会放弃尚未保存的更改，并使用当前聊天已保存的 OS 数据（不只是地图）。", -1)), i("button", {
        type: "button",
        disabled: e(l),
        onClick: n[2] || (n[2] = (...u) => e(q) && e(q)(...u))
      }, "放弃未保存更改并恢复", 8, ke)], 64)) : e(a).status === "error" || e(a).status === "blocked" ? (r(), b("button", {
        key: 2,
        type: "button",
        disabled: e(l),
        onClick: n[3] || (n[3] = (...u) => e(y) && e(y)(...u))
      }, "重新加载", 8, he)) : (r(), b("button", {
        key: 3,
        type: "button",
        class: "map-notice-close",
        "aria-label": "关闭地图提示",
        onClick: n[4] || (n[4] = (...u) => e(B) && e(B)(...u))
      }, [$(S, { name: "close" })]))], 2)) : c("", !0)]),
      "scene-empty-action": M(({ located: u }) => [
        i("p", null, d(u ? e(C).sceneUpdateHint : e(C).locationUpdateHint), 1),
        i("button", {
          type: "button",
          class: "map-secondary-button",
          disabled: !!e(m),
          onClick: n[5] || (n[5] = (...I) => e(h) && e(h)(...I))
        }, d(e(l) ? e(C).updating : e(C).update), 9, Ce),
        e(m) && !e(l) ? (r(), b("p", Me, d(e(m)), 1)) : c("", !0)
      ]),
      "scope-empty-action": M(() => [i("button", {
        type: "button",
        class: "map-secondary-button",
        disabled: !!e(m),
        onClick: n[6] || (n[6] = (...u) => e(h) && e(h)(...u))
      }, d(e(l) ? e(C).updating : e(C).update), 9, $e)]),
      "empty-map": M(() => [i("div", Se, [
        i("span", Be, [$(S, { name: "globe" })]),
        n[11] || (n[11] = i("small", null, "故事之外，还有一整个世界", -1)),
        i("h1", null, d(e(a).status === "loading" ? e(C).loading : "下一站，去哪里？"), 1),
        n[12] || (n[12] = i("p", null, [
          V("把世界设定画成地图，"),
          i("br"),
          V("也为留白的地方添上值得探索的去处。")
        ], -1)),
        e(a).status !== "loading" ? (r(), b("button", {
          key: 0,
          type: "button",
          class: "map-primary-button",
          disabled: !!e(m),
          onClick: n[7] || (n[7] = (...u) => e(w) && e(w)(...u))
        }, d(e(l) ? e(f) || "正在准备…" : "绘制世界地图"), 9, je)) : c("", !0),
        e(m) && !e(l) ? (r(), b("p", Re, d(e(m)), 1)) : c("", !0)
      ])]),
      overlay: M(() => [v.value ? (r(), Y(pe, {
        key: 0,
        "auto-maintenance": e(a).autoMaintenance,
        "project-to-chat": e(a).projectToChat,
        busy: e(l),
        "refresh-disabled": e(p),
        "auto-toggle-busy": e(s) !== null,
        "disabled-reason": e(m),
        "has-map": !!e(a).map,
        status: e(f),
        "maintenance-message": e(a).maintenanceMessage || "",
        "maintenance-error": e(a).maintenanceStatus === "error",
        notice: e(k),
        "notice-error": e(E),
        onClose: n[8] || (n[8] = (u) => v.value = !1),
        onSetAuto: e(D),
        onSetProjection: e(U),
        onUpdate: e(h),
        onRebuild: e(w),
        onRefresh: e(y)
      }, null, 8, [
        "auto-maintenance",
        "project-to-chat",
        "busy",
        "refresh-disabled",
        "auto-toggle-busy",
        "disabled-reason",
        "has-map",
        "status",
        "maintenance-message",
        "maintenance-error",
        "notice",
        "notice-error",
        "onSetAuto",
        "onSetProjection",
        "onUpdate",
        "onRebuild",
        "onRefresh"
      ])) : c("", !0)]),
      _: 1
    }, 8, ["map", "chat-identity"]));
  }
}), Pe = Ae;
export {
  Pe as default
};
