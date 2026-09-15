/* eslint-disable */
import { C, E, K as y, gt as k, h as w, k as u, l as f, p as _, s as t, u as c } from "./xiaobai-os-runtime-core.esm-bundler-x_Eikhco.js";
import { t as g } from "./xiaobai-os-frame-bridge-5XxFerhp.js";
var I = { class: "dice-app" }, x = {
  "aria-labelledby": "dice-action-label",
  class: "dice-feature"
}, D = { class: "dice-switch-row" }, A = ["aria-checked", "disabled"], B = { class: "dice-sr" }, $ = {
  "aria-labelledby": "dice-encounter-label",
  class: "dice-feature"
}, q = { class: "dice-switch-row" }, N = ["aria-checked", "disabled"], O = { class: "dice-sr" }, V = {
  key: 0,
  class: "dice-recovery",
  "aria-live": "polite"
}, H = ["disabled"], K = ["disabled"], M = {
  key: 2,
  class: "dice-recovery-note"
}, R = /* @__PURE__ */ w({
  __name: "DiceApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(v) {
    const n = v, a = y(n.initialState), i = y(!1), l = y("");
    let m = () => {
    }, d = !1, b = 0;
    E(() => {
      d = !0, m = n.bridge.subscribe((r) => {
        if (r.type === "dice/state") {
          const e = r.payload.state;
          e.chatIdentity === a.value.chatIdentity && (b++, a.value = e);
        }
      });
    }), C(() => {
      d = !1, m();
    });
    async function p(r, e, o) {
      if (i.value) return;
      i.value = !0, l.value = "";
      const h = a.value.chatIdentity, S = b;
      try {
        const s = await n.bridge.request(r, {
          chatIdentity: h,
          ...e ? {
            feature: e,
            enabled: o
          } : {}
        });
        d && S === b && s.result.chatIdentity === h && (a.value = s.result);
      } catch (s) {
        d && (l.value = s instanceof g && s.code === "app_request_failed" ? s.message : "操作未完成，请稍后重试。");
      } finally {
        d && (i.value = !1);
      }
    }
    return (r, e) => (u(), c("main", I, [
      e[14] || (e[14] = t("p", { class: "dice-scope" }, "当前聊天", -1)),
      t("section", x, [
        t("div", D, [e[5] || (e[5] = t("h1", { id: "dice-action-label" }, "行动检定", -1)), t("button", {
          type: "button",
          class: "dice-switch",
          role: "switch",
          "aria-labelledby": "dice-action-label",
          "aria-checked": a.value.actionChecksEnabled,
          disabled: i.value || a.value.fileState !== "ready",
          onClick: e[0] || (e[0] = (o) => p("dice/set-feature", "actionChecksEnabled", !a.value.actionChecksEnabled))
        }, [e[4] || (e[4] = t("span", { "aria-hidden": "true" }, null, -1)), t("span", B, k(a.value.actionChecksEnabled ? "关闭" : "开启"), 1)], 8, A)]),
        e[6] || (e[6] = t("p", { class: "dice-intro" }, "关键行动由 D20 骰子决定成败，AI 根据结果接着写。", -1)),
        e[7] || (e[7] = t("p", null, "结果和后续剧情留在同一条回复里，不计算角色属性加成。", -1)),
        e[8] || (e[8] = t("aside", { class: "dice-notice" }, [t("p", null, "每次检定后，会用当前聊天模型额外续写一次，正常计费。"), t("p", null, "请关闭酒馆的「自动续写」。回复生成时，请勿修改「小白 OS · 行动检定显示」正则。")], -1))
      ]),
      t("section", $, [
        t("div", q, [e[10] || (e[10] = t("h2", { id: "dice-encounter-label" }, "随机遭遇", -1)), t("button", {
          type: "button",
          class: "dice-switch",
          role: "switch",
          "aria-labelledby": "dice-encounter-label",
          "aria-checked": a.value.encountersEnabled,
          disabled: i.value || a.value.fileState !== "ready",
          onClick: e[1] || (e[1] = (o) => p("dice/set-feature", "encountersEnabled", !a.value.encountersEnabled))
        }, [e[9] || (e[9] = t("span", { "aria-hidden": "true" }, null, -1)), t("span", O, k(a.value.encountersEnabled ? "关闭" : "开启"), 1)], 8, N)]),
        e[11] || (e[11] = t("p", null, "偶尔为剧情添一点变数，也可从已开启的世界背景与剧情记忆中寻找灵感。", -1)),
        e[12] || (e[12] = t("p", { class: "dice-rates" }, [
          _("轻微 5% "),
          t("span", { "aria-hidden": "true" }, "·"),
          _(" 中等 3% "),
          t("span", { "aria-hidden": "true" }, "·"),
          _(" 重大 1%")
        ], -1)),
        e[13] || (e[13] = t("p", { class: "dice-cooldown" }, "触发后，接下来的两次用户发言不会触发新遭遇。不额外调用模型。", -1))
      ]),
      [
        "conflict",
        "failed",
        "unconfirmed"
      ].includes(a.value.fileState) || l.value ? (u(), c("section", V, [
        t("p", null, k(l.value || "还不确定设置是否保存成功，暂时沿用之前的设置。"), 1),
        a.value.pending ? (u(), c("button", {
          key: 0,
          disabled: i.value,
          onClick: e[2] || (e[2] = (o) => p("dice/retry-file"))
        }, "检查保存", 8, H)) : f("", !0),
        a.value.fileState === "conflict" || a.value.fileState === "failed" || a.value.fileState === "unconfirmed" ? (u(), c("button", {
          key: 1,
          disabled: i.value,
          onClick: e[3] || (e[3] = (o) => p("dice/adopt-file"))
        }, " 使用已保存版本 ", 8, K)) : f("", !0),
        [
          "conflict",
          "failed",
          "unconfirmed"
        ].includes(a.value.fileState) ? (u(), c("p", M, "使用已保存版本会放弃当前聊天中尚未确认的 OS 修改。")) : f("", !0)
      ])) : f("", !0)
    ]));
  }
}), T = (v, n) => {
  const a = v.__vccOpts || v;
  for (const [i, l] of n) a[i] = l;
  return a;
}, z = /* @__PURE__ */ T(R, [["__scopeId", "data-v-1bbfa4f3"]]);
export {
  z as default
};
