/* eslint-disable */
import { C as m, E as S, K as b, gt as k, h as I, k as v, l as y, s as a, u as c } from "./xiaobai-os-runtime-core.esm-bundler-x_Eikhco.js";
var h = { class: "dice-app" }, D = { class: "dice-switch-row" }, A = ["aria-checked", "disabled"], C = { class: "dice-sr" }, w = {
  key: 0,
  class: "dice-recovery",
  "aria-live": "polite"
}, x = ["disabled"], B = ["disabled"], E = /* @__PURE__ */ I({
  __name: "DiceApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(u) {
    const n = u, t = b(n.initialState), i = b(!1), l = b("");
    let _ = () => {
    }, r = !1, p = 0;
    S(() => {
      r = !0, _ = n.bridge.subscribe((d) => {
        if (d.type === "dice/state") {
          const e = d.payload.state;
          e.chatIdentity === t.value.chatIdentity && (p++, t.value = e);
        }
      });
    }), m(() => {
      r = !1, _();
    });
    async function f(d, e) {
      if (i.value) return;
      i.value = !0, l.value = "";
      const o = t.value.chatIdentity, g = p;
      try {
        const s = await n.bridge.request(d, {
          chatIdentity: o,
          ...e === void 0 ? {} : { enabled: e }
        });
        r && g === p && s.result.chatIdentity === o && (t.value = s.result);
      } catch (s) {
        r && (l.value = s instanceof Error ? s.message : String(s));
      } finally {
        r && (i.value = !1);
      }
    }
    return (d, e) => (v(), c("main", h, [
      a("section", D, [e[4] || (e[4] = a("h1", { id: "dice-action-label" }, "行动检定", -1)), a("button", {
        type: "button",
        class: "dice-switch",
        role: "switch",
        "aria-labelledby": "dice-action-label",
        "aria-checked": t.value.enabled,
        disabled: i.value || t.value.fileState !== "ready",
        onClick: e[0] || (e[0] = (o) => f("dice/set-enabled", !t.value.enabled))
      }, [e[3] || (e[3] = a("span", { "aria-hidden": "true" }, null, -1)), a("span", C, k(t.value.enabled ? "关闭" : "开启"), 1)], 8, A)]),
      e[5] || (e[5] = a("p", { class: "dice-intro" }, "让关键行动的成败交给骰子。AI 提出检定，Dice 投出 D20，再由 AI 接着讲完故事。", -1)),
      e[6] || (e[6] = a("p", null, "骰点与后文留在同一条回复中。本聊天单独启用，没有属性加成。", -1)),
      e[7] || (e[7] = a("aside", { class: "dice-notice" }, [a("p", null, "每次检定会调用一次聊天主 API 续写，按你的模型正常计费。"), a("p", null, "请关闭酒馆的「自动续写」。生成期间不要编辑或删除 Dice 的显示正则。")], -1)),
      t.value.fileState !== "ready" || l.value ? (v(), c("section", w, [
        a("p", null, k(l.value || (t.value.fileState === "saving" ? "正在保存…" : "文件尚未确认，开关保持上一次已保存的状态。")), 1),
        t.value.pending ? (v(), c("button", {
          key: 0,
          disabled: i.value,
          onClick: e[1] || (e[1] = (o) => f("dice/retry-file"))
        }, "核实并重试保存", 8, x)) : y("", !0),
        t.value.fileState === "conflict" || t.value.fileState === "failed" || t.value.fileState === "unconfirmed" ? (v(), c("button", {
          key: 1,
          disabled: i.value,
          onClick: e[2] || (e[2] = (o) => f("dice/adopt-file"))
        }, " 使用服务端文件 ", 8, B)) : y("", !0)
      ])) : y("", !0)
    ]));
  }
}), $ = (u, n) => {
  const t = u.__vccOpts || u;
  for (const [i, l] of n) t[i] = l;
  return t;
}, V = /* @__PURE__ */ $(E, [["__scopeId", "data-v-fa903645"]]);
export {
  V as default
};
