/* eslint-disable */
import { C as E, E as g, K as _, gt as u, h as q, j as w, k as v, l as m, p as h, r as I, s as a, u as b } from "./xiaobai-os-runtime-core.esm-bundler-x_Eikhco.js";
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
    const d = p, t = _(d.initialState), i = _(!1), l = _(""), k = {
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
          e.chatIdentity === t.value.chatIdentity && (f++, t.value = e);
        }
      });
    }), E(() => {
      o = !1, C();
    });
    async function y(c, e) {
      if (i.value) return;
      i.value = !0, l.value = "";
      const n = t.value.chatIdentity, r = f;
      try {
        const s = await d.bridge.request(c, {
          chatIdentity: n,
          ...e
        });
        o && r === f && s.result.chatIdentity === n && (t.value = s.result);
      } catch (s) {
        o && (l.value = s instanceof x && s.code === "app_request_failed" ? s.message : "操作未完成，请稍后重试。");
      } finally {
        o && (i.value = !1);
      }
    }
    return (c, e) => (v(), b("main", A, [
      a("section", B, [
        a("div", D, [e[3] || (e[3] = a("h1", { id: "dice-action-label" }, "行动检定", -1)), a("button", {
          type: "button",
          class: "dice-switch",
          role: "switch",
          "aria-labelledby": "dice-action-label",
          "aria-checked": t.value.actionChecksEnabled,
          disabled: i.value,
          onClick: e[0] || (e[0] = (n) => y("dice/set-feature", {
            feature: "actionChecksEnabled",
            enabled: !t.value.actionChecksEnabled
          }))
        }, [e[2] || (e[2] = a("span", { "aria-hidden": "true" }, null, -1)), a("span", S, u(t.value.actionChecksEnabled ? "关闭" : "开启"), 1)], 8, F)]),
        e[5] || (e[5] = a("p", { class: "dice-intro" }, "当你尝试不确定的事——说服陌生人、翻越高墙、破译符文——由骰子裁决，而非 AI。一次真随机掷骰仲裁结果，故事顺从命运。", -1)),
        t.value.actionChecksEnabled ? (v(), b("fieldset", {
          key: 0,
          class: "dice-frequency",
          disabled: i.value,
          "aria-describedby": "dice-frequency-description"
        }, [
          e[4] || (e[4] = a("legend", null, "检定频率", -1)),
          a("div", V, [(v(), b(I, null, w(k, (n, r) => a("button", {
            key: r,
            type: "button",
            class: "dice-frequency-option",
            "aria-pressed": t.value.actionCheckFrequency === r,
            onClick: (s) => t.value.actionCheckFrequency !== r && y("dice/set-frequency", { frequency: r })
          }, u(n.label), 9, $)), 64))]),
          a("p", O, u(k[t.value.actionCheckFrequency].description), 1)
        ], 8, N)) : m("", !0),
        e[6] || (e[6] = a("aside", { class: "dice-notice" }, [
          a("p", null, "请勿开启酒馆的「自动续写」。"),
          a("p", null, "酒馆 1.14 / 1.15：行动检定的自动续写会发送输入框中尚未发送的文字。"),
          a("p", null, "功能开启期间，会自动创建「小白 OS · 行动检定显示」全局正则。")
        ], -1))
      ]),
      a("section", j, [
        a("div", H, [e[8] || (e[8] = a("h2", { id: "dice-encounter-label" }, "随机遭遇", -1)), a("button", {
          type: "button",
          class: "dice-switch",
          role: "switch",
          "aria-labelledby": "dice-encounter-label",
          "aria-checked": t.value.encountersEnabled,
          disabled: i.value,
          onClick: e[1] || (e[1] = (n) => y("dice/set-feature", {
            feature: "encountersEnabled",
            enabled: !t.value.encountersEnabled
          }))
        }, [e[7] || (e[7] = a("span", { "aria-hidden": "true" }, null, -1)), a("span", L, u(t.value.encountersEnabled ? "关闭" : "开启"), 1)], 8, K)]),
        e[9] || (e[9] = a("p", null, "偶尔为剧情添一点变数，也可从已开启的世界背景与剧情记忆中寻找灵感。", -1)),
        e[10] || (e[10] = a("p", { class: "dice-rates" }, [
          h("轻微 5% "),
          a("span", { "aria-hidden": "true" }, "·"),
          h(" 中等 3% "),
          a("span", { "aria-hidden": "true" }, "·"),
          h(" 重大 1%")
        ], -1)),
        e[11] || (e[11] = a("p", { class: "dice-cooldown" }, "触发后，接下来的两次用户发言不会触发新遭遇。不额外调用模型。", -1))
      ]),
      l.value ? (v(), b("section", M, [a("p", null, u(l.value), 1)])) : m("", !0)
    ]));
  }
}), T = (p, d) => {
  const t = p.__vccOpts || p;
  for (const [i, l] of d) t[i] = l;
  return t;
}, G = /* @__PURE__ */ T(R, [["__scopeId", "data-v-21aed558"]]);
export {
  G as default
};
