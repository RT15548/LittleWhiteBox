/* eslint-disable */
import { C as E, E as g, K as _, gt as u, h as q, j as w, k as v, l as m, p as h, r as I, s as t, u as b } from "./xiaobai-os-runtime-core.esm-bundler-x_Eikhco.js";
import { t as x } from "./xiaobai-os-frame-bridge-5XxFerhp.js";
var A = { class: "dice-app" }, B = {
  "aria-labelledby": "dice-action-label",
  class: "dice-feature"
}, D = { class: "dice-switch-row" }, F = ["aria-checked", "disabled"], S = { class: "dice-sr" }, N = ["disabled"], V = { class: "dice-frequency-options" }, $ = ["aria-pressed", "onClick"], O = {
  id: "dice-frequency-description",
  "aria-live": "polite"
}, j = {
  "aria-labelledby": "dice-encounter-label",
  class: "dice-feature"
}, H = { class: "dice-switch-row" }, K = ["aria-checked", "disabled"], L = { class: "dice-sr" }, M = {
  key: 0,
  class: "dice-recovery",
  "aria-live": "polite"
}, R = /* @__PURE__ */ q({
  __name: "DiceApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(p) {
    const d = p, a = _(d.initialState), i = _(!1), l = _(""), k = {
      light: {
        label: "轻量",
        description: "模型会更克制地使用骰子。"
      },
      standard: {
        label: "标准",
        description: "模型会在合适的时候使用骰子。"
      },
      active: {
        label: "活跃",
        description: "模型将更活跃地使用骰子参与剧情。"
      }
    };
    let C = () => {
    }, o = !1, f = 0;
    g(() => {
      o = !0, C = d.bridge.subscribe((c) => {
        if (c.type === "dice/state") {
          const e = c.payload.state;
          e.chatIdentity === a.value.chatIdentity && (f++, a.value = e);
        }
      });
    }), E(() => {
      o = !1, C();
    });
    async function y(c, e) {
      if (i.value) return;
      i.value = !0, l.value = "";
      const n = a.value.chatIdentity, r = f;
      try {
        const s = await d.bridge.request(c, {
          chatIdentity: n,
          ...e
        });
        o && r === f && s.result.chatIdentity === n && (a.value = s.result);
      } catch (s) {
        o && (l.value = s instanceof x && s.code === "app_request_failed" ? s.message : "操作未完成，请稍后重试。");
      } finally {
        o && (i.value = !1);
      }
    }
    return (c, e) => (v(), b("main", A, [
      t("section", B, [
        t("div", D, [e[3] || (e[3] = t("h1", { id: "dice-action-label" }, "行动检定", -1)), t("button", {
          type: "button",
          class: "dice-switch",
          role: "switch",
          "aria-labelledby": "dice-action-label",
          "aria-checked": a.value.actionChecksEnabled,
          disabled: i.value,
          onClick: e[0] || (e[0] = (n) => y("dice/set-feature", {
            feature: "actionChecksEnabled",
            enabled: !a.value.actionChecksEnabled
          }))
        }, [e[2] || (e[2] = t("span", { "aria-hidden": "true" }, null, -1)), t("span", S, u(a.value.actionChecksEnabled ? "关闭" : "开启"), 1)], 8, F)]),
        e[5] || (e[5] = t("p", { class: "dice-intro" }, "当你尝试不确定的事——说服陌生人、翻越高墙、破译符文——由骰子裁决，而非 AI。一次真随机掷骰仲裁结果，故事顺从命运。", -1)),
        a.value.actionChecksEnabled ? (v(), b("fieldset", {
          key: 0,
          class: "dice-frequency",
          disabled: i.value,
          "aria-describedby": "dice-frequency-description"
        }, [
          e[4] || (e[4] = t("legend", null, "检定频率", -1)),
          t("div", V, [(v(), b(I, null, w(k, (n, r) => t("button", {
            key: r,
            type: "button",
            class: "dice-frequency-option",
            "aria-pressed": a.value.actionCheckFrequency === r,
            onClick: (s) => a.value.actionCheckFrequency !== r && y("dice/set-frequency", { frequency: r })
          }, u(n.label), 9, $)), 64))]),
          t("p", O, u(k[a.value.actionCheckFrequency].description), 1)
        ], 8, N)) : m("", !0),
        e[6] || (e[6] = t("aside", { class: "dice-notice" }, [
          t("p", null, "请勿开启酒馆的「自动续写」。"),
          t("p", null, "酒馆 1.14 / 1.15：行动检定的自动续写会发送输入框中尚未发送的文字。"),
          t("p", null, "功能开启期间，会自动创建「小白 OS · 行动检定显示」全局正则。")
        ], -1))
      ]),
      t("section", j, [
        t("div", H, [e[8] || (e[8] = t("h2", { id: "dice-encounter-label" }, "随机遭遇", -1)), t("button", {
          type: "button",
          class: "dice-switch",
          role: "switch",
          "aria-labelledby": "dice-encounter-label",
          "aria-checked": a.value.encountersEnabled,
          disabled: i.value,
          onClick: e[1] || (e[1] = (n) => y("dice/set-feature", {
            feature: "encountersEnabled",
            enabled: !a.value.encountersEnabled
          }))
        }, [e[7] || (e[7] = t("span", { "aria-hidden": "true" }, null, -1)), t("span", L, u(a.value.encountersEnabled ? "关闭" : "开启"), 1)], 8, K)]),
        e[9] || (e[9] = t("p", null, "偶尔为剧情添一点变数，也可从已开启的世界背景与剧情记忆中寻找灵感。", -1)),
        e[10] || (e[10] = t("p", { class: "dice-rates" }, [
          h("轻微 5% "),
          t("span", { "aria-hidden": "true" }, "·"),
          h(" 中等 3% "),
          t("span", { "aria-hidden": "true" }, "·"),
          h(" 重大 1%")
        ], -1)),
        e[11] || (e[11] = t("p", { class: "dice-cooldown" }, "触发后，接下来的两次用户发言不会触发新遭遇。不额外调用模型。", -1))
      ]),
      l.value ? (v(), b("section", M, [t("p", null, u(l.value), 1)])) : m("", !0)
    ]));
  }
}), T = (p, d) => {
  const a = p.__vccOpts || p;
  for (const [i, l] of d) a[i] = l;
  return a;
}, G = /* @__PURE__ */ T(R, [["__scopeId", "data-v-8437291e"]]);
export {
  G as default
};
