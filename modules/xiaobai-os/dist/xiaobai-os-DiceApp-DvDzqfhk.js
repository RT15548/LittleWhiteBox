/* eslint-disable */
import { $ as K, F as d, H as ie, L as q, M as le, O as se, Q as l, W as ne, X as Y, Y as R, _ as u, g, h as X, m as e, p as P, tt as n, u as j, x as J, y as D } from "./xiaobai-os-runtime-dom.esm-bundler-DuiaxqDz.js";
import { t as re } from "./xiaobai-os-frame-bridge-5XxFerhp.js";
import { t as oe } from "./xiaobai-os-AppDialog-CaAiivYL.js";
function m(t, i) {
  return {
    label: t,
    uses: i,
    description: i.join("、")
  };
}
var A = {
  body: m("体魄", [
    "施力",
    "耐力",
    "身体抵抗"
  ]),
  mind: m("心智", [
    "推理",
    "记忆",
    "临场判断"
  ]),
  will: m("意志", [
    "专注",
    "决心",
    "精神抵抗"
  ]),
  appearance: m("外表", [
    "吸引力",
    "印象",
    "影响"
  ])
}, Z = {
  athletics: m("运动", [
    "攀爬",
    "游泳",
    "平衡",
    "闪避",
    "骑乘"
  ]),
  melee: m("近战", ["徒手", "近身武器"]),
  ranged: m("远程", [
    "弓弩",
    "枪械",
    "投掷"
  ]),
  awareness: m("侦察", [
    "观察",
    "聆听",
    "搜索"
  ]),
  survival: m("求生", [
    "辨向",
    "追踪",
    "野外生存"
  ]),
  medicine: m("医学", [
    "急救",
    "诊断",
    "治疗"
  ]),
  knowledge: m("学识", ["知识辨识", "资料研究"]),
  social: m("社交", [
    "交涉",
    "欺骗",
    "察言观色"
  ]),
  mechanics: m("机工", [
    "器具操作",
    "载具操作",
    "维修",
    "锁具"
  ]),
  craft: m("技艺", [
    "表演",
    "烹饪",
    "艺术",
    "手工"
  ]),
  concealment: m("隐匿", [
    "潜行",
    "藏身",
    "扒窃"
  ]),
  intimacy: m("亲密", [
    "取悦",
    "情欲技巧",
    "身体亲昵"
  ])
}, N = {
  ...A,
  ...Z
}, ce = Object.keys(A), de = Object.keys(Z), x = {
  max: 80,
  step: 5
}, _ = {
  attributes: {
    ids: ce,
    min: 20,
    allocation: [
      70,
      60,
      40,
      30
    ]
  },
  skills: {
    ids: de,
    min: 20,
    allocation: [
      80,
      70,
      60,
      50,
      40,
      40,
      30,
      30,
      20,
      20,
      20,
      20
    ]
  }
}, V = {
  invalid: "dice_coc7_sheet_invalid",
  missing: "dice_coc7_sheet_missing"
};
function Q(t) {
  return _[t].allocation.reduce((i, a) => i + a, 0);
}
function M(t, i) {
  return Q(i) - Object.values(t[i]).reduce((a, c) => a + c, 0);
}
function B(t, i) {
  return Object.hasOwn(A, i) ? t.attributes[i] : t.skills[i];
}
function W(t, i) {
  return !!t && typeof t == "object" && !Array.isArray(t) && Object.keys(t).length === i.length && i.every((a) => Object.hasOwn(t, a));
}
function z(t) {
  const i = () => {
    throw new TypeError(V.invalid);
  };
  if (!W(t, Object.keys(_))) return i();
  for (const c of Object.keys(_)) {
    const o = t[c];
    if (!W(o, _[c].ids) || !Object.values(o).every((h) => typeof h == "number" && Number.isInteger(h) && h >= _[c].min && h <= x.max && h % x.step === 0) || Object.values(o).reduce((h, w) => h + w, 0) > Q(c)) return i();
  }
  const a = t;
  return {
    attributes: { ...a.attributes },
    skills: { ...a.skills }
  };
}
function ue(t) {
  if (t === null) return { kind: "empty" };
  try {
    return {
      kind: "ready",
      sheet: z(t)
    };
  } catch (i) {
    if (!(i instanceof TypeError) || i.message !== V.invalid) throw i;
    return { kind: "invalid" };
  }
}
function U(t, i) {
  return Object.fromEntries(_[t].ids.map((a) => [a, i()]));
}
function ve() {
  return {
    attributes: U("attributes", () => _.attributes.min),
    skills: U("skills", () => _.skills.min)
  };
}
function H(t, i, a) {
  const c = Object.hasOwn(A, i) ? "attributes" : "skills", o = B(t, i) + a * x.step;
  return (a === -1 || a === 1) && o >= _[c].min && o <= x.max && (a < 0 || M(t, c) >= x.step);
}
function be(t, i, a) {
  if (!H(t, i, a)) throw new TypeError(V.invalid);
  const c = Object.hasOwn(A, i) ? "attributes" : "skills";
  return {
    ...t,
    [c]: {
      ...t[c],
      [i]: B(t, i) + a * x.step
    }
  };
}
function he(t = Math.random) {
  const i = (a) => {
    const c = [..._[a].allocation];
    return U(a, () => {
      const o = t();
      if (!Number.isFinite(o) || o < 0 || o >= 1) throw new TypeError("dice_random_invalid");
      return c.splice(Math.floor(o * c.length), 1)[0];
    });
  };
  return z({
    attributes: i("attributes"),
    skills: i("skills")
  });
}
var ye = {
  insufficientFunds: "小白币不足，重置需要 100 小白币。原属性未改变。",
  saveUnconfirmed: "还不确定属性与账目是否保存成功，请先检查保存。",
  operationExpired: "原操作的条件已失效，未重新提交。请在钱包中使用已保存账本，再重新操作。",
  resetTransactionTitle: "重置人物属性",
  checkSave: "检查保存"
}, r = {
  ...ye,
  title: "人物属性",
  rule: "D100 属性鉴定",
  generate: "一键随机",
  close: "关闭人物属性",
  saved: "已保存",
  repair: "需重新分配",
  repairNotice: "人物属性需重新分配，新检定已暂停。",
  save: "保存",
  saving: "保存中…",
  cancel: "取消修改",
  reset: "重置",
  confirmReset: "确认重置",
  resetQuestion: "是否确认重置？",
  cancelReset: "取消",
  resetting: "重置中…",
  resetNotice: "花费 100 小白币，清空已保存的人物属性。聊天和已掷结果保留。",
  damaged: "人物属性不符合当前分配规则，请重新分配或重置。操作成功前保留原数据，历史骰子不变。",
  scope: "全局保存",
  attributes: "属性",
  skills: "技能",
  remaining: "剩余",
  allocated: "已分配",
  unassigned: "待分配",
  unsaved: "未保存",
  decrease: "减少",
  increase: "增加",
  limits: `属性 ${_.attributes.min}–${x.max} · 技能 ${_.skills.min}–${x.max} · 每次 ${x.step} 点；无需花完点数。`,
  invalidAllocation: "分配不符合点数或单项范围，请调整后保存。",
  saveFailed: "属性未能保存，草稿已保留，请重试。",
  resetFailed: "重置失败，原属性已保留，请重试。",
  description: "仅检定你扮演的角色，使用全局人物能力，按属性或技能掷百分骰。"
}, fe = ["aria-expanded", "disabled"], pe = {
  key: 0,
  role: "alert",
  class: "coc-entry-warning",
  "data-sheet-state": "invalid"
}, ke = {
  class: "coc-sheet",
  "aria-labelledby": "coc-sheet-title"
}, me = { class: "coc-header" }, _e = { id: "coc-sheet-title" }, Ce = ["aria-label", "disabled"], ge = {
  class: "coc-budgets",
  "aria-live": "polite"
}, we = ["data-budget"], Se = { class: "coc-scroll" }, Oe = {
  key: 0,
  role: "alert",
  class: "coc-error"
}, $e = { class: "coc-limits" }, Ee = ["aria-labelledby"], xe = ["id"], Ie = { class: "coc-grid" }, je = ["data-stat"], Re = { class: "coc-stat-name" }, Te = ["id"], qe = ["aria-labelledby"], Be = [
  "aria-label",
  "disabled",
  "onClick"
], Ae = ["aria-labelledby"], Fe = [
  "aria-label",
  "disabled",
  "onClick"
], Ne = ["disabled"], De = { class: "coc-footer" }, Me = {
  key: 0,
  role: "alert",
  class: "coc-error"
}, Le = ["disabled"], Pe = {
  key: 2,
  class: "coc-reset-confirm",
  role: "group",
  "aria-labelledby": "coc-reset-question"
}, Ue = { id: "coc-reset-question" }, He = { class: "coc-draft-actions" }, Ve = ["disabled"], Qe = ["disabled"], ze = {
  key: 3,
  class: "coc-draft-actions"
}, Ge = ["disabled"], Ke = {
  key: 0,
  class: "coc-saved",
  role: "status"
}, Ye = ["disabled"], We = ["disabled"], Xe = /* @__PURE__ */ J({
  __name: "Coc7Sheet",
  props: {
    sheet: {},
    invalid: { type: Boolean },
    busy: { type: Boolean },
    failure: {},
    blocked: { type: Boolean },
    checkSave: { type: Function },
    save: { type: Function }
  },
  emits: ["confirmed"],
  setup(t, { emit: i }) {
    const a = t, c = i, o = P(() => a.busy || a.blocked), h = Y(null), w = Y(), I = R(!1), C = R(""), O = R(!1), f = P(() => h.value ?? a.sheet ?? ve()), F = P(() => ue(f.value).kind === "ready"), $ = Object.keys(_).map((k) => ({
      id: k,
      label: r[k],
      ids: _[k].ids,
      budget: Q(k)
    }));
    ie([
      w,
      () => a.sheet,
      () => a.invalid,
      () => a.blocked,
      () => a.busy
    ], () => {
      if (a.busy || a.blocked || w.value === void 0) return;
      const k = w.value;
      w.value = void 0;
      const v = a.sheet;
      !a.invalid && (k === null ? v === null : v !== null && $.every((b) => b.ids.every((y) => B(v, y) === B(k, y)))) && (L(), c("confirmed"));
    });
    function s(k) {
      w.value = void 0, h.value = k, C.value = "", O.value = !1;
    }
    function S() {
      a.busy || (I.value = !1, O.value = !1);
    }
    function p(k, v) {
      o.value || s(be(f.value, k, v));
    }
    function T() {
      o.value || s(he());
    }
    async function E() {
      if (!(o.value || !h.value && a.sheet)) {
        if (!F.value) {
          C.value = r.invalidAllocation;
          return;
        }
        await G(z(f.value));
      }
    }
    function L() {
      w.value = void 0, h.value = null, C.value = "", O.value = !1;
    }
    async function G(k) {
      await a.save(k) ? L() : (a.blocked && (w.value = k), C.value = k === null ? r.resetFailed : r.saveFailed);
    }
    async function ae() {
      o.value || await G(null);
    }
    return (k, v) => (d(), u(j, null, [
      e("button", {
        type: "button",
        class: "coc-entry",
        "data-sheet-action": "open",
        "aria-haspopup": "dialog",
        "aria-expanded": I.value,
        disabled: t.busy,
        onClick: v[0] || (v[0] = (b) => I.value = !0)
      }, [
        v[4] || (v[4] = e("svg", {
          class: "coc-entry-icon",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          "stroke-width": "1.6",
          "aria-hidden": "true"
        }, [e("circle", {
          cx: "12",
          cy: "8",
          r: "3.5"
        }), e("path", { d: "M5 21v-2a7 7 0 0 1 14 0v2M3 3h3M18 3h3M3 3v4M21 3v4" })], -1)),
        e("span", null, n(l(r).title), 1),
        e("small", { class: K({ "needs-repair": t.invalid }) }, n(h.value ? l(r).unsaved : t.invalid ? l(r).repair : t.sheet ? l(r).saved : l(r).unassigned), 3),
        v[5] || (v[5] = e("svg", {
          class: "coc-entry-arrow",
          viewBox: "0 0 16 16",
          fill: "none",
          stroke: "currentColor",
          "stroke-width": "1.5",
          "aria-hidden": "true"
        }, [e("path", { d: "m6 3 5 5-5 5" })], -1))
      ], 8, fe),
      t.invalid ? (d(), u("p", pe, n(l(r).repairNotice), 1)) : g("", !0),
      I.value ? (d(), X(oe, {
        key: 1,
        class: "coc-dialog",
        "aria-labelledby": "coc-sheet-title",
        busy: t.busy,
        onClose: S
      }, {
        default: ne(() => [e("section", ke, [
          e("header", me, [e("div", null, [e("h2", _e, n(l(r).title), 1), e("small", null, n(l(r).scope), 1)]), e("button", {
            type: "button",
            class: "coc-close",
            "data-sheet-action": "close",
            "aria-label": l(r).close,
            disabled: t.busy,
            autofocus: "",
            onClick: S
          }, [...v[6] || (v[6] = [e("svg", {
            viewBox: "0 0 20 20",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "1.6",
            "aria-hidden": "true"
          }, [e("path", { d: "m5 5 10 10M15 5 5 15" })], -1)])], 8, Ce)]),
          e("div", ge, [(d(!0), u(j, null, q(l($), (b) => (d(), u("div", {
            key: b.id,
            "data-budget": b.id
          }, [
            e("span", null, [D(n(b.label), 1), e("small", null, n(l(r).remaining), 1)]),
            e("strong", { class: K({ complete: l(M)(f.value, b.id) === 0 }) }, n(l(M)(f.value, b.id)), 3),
            e("small", null, n(l(r).allocated) + " " + n(b.budget - l(M)(f.value, b.id)) + " / " + n(b.budget), 1)
          ], 8, we))), 128))]),
          e("div", Se, [
            t.invalid ? (d(), u("p", Oe, n(l(r).damaged), 1)) : g("", !0),
            e("p", $e, n(l(r).limits), 1),
            (d(!0), u(j, null, q(l($), (b) => (d(), u("section", {
              key: b.id,
              class: "coc-group",
              "aria-labelledby": "coc-" + b.id
            }, [e("h3", { id: "coc-" + b.id }, n(b.label), 9, xe), e("div", Ie, [(d(!0), u(j, null, q(b.ids, (y) => (d(), u("div", {
              key: y,
              class: "coc-stat",
              "data-stat": y
            }, [e("div", Re, [e("span", { id: "coc-label-" + y }, n(l(N)[y].label), 9, Te), e("small", null, n(l(N)[y].description), 1)]), e("div", {
              class: "coc-stepper",
              role: "group",
              "aria-labelledby": "coc-label-" + y
            }, [
              e("button", {
                type: "button",
                "data-step": "decrease",
                "aria-label": l(r).decrease + l(N)[y].label,
                disabled: o.value || !l(H)(f.value, y, -1),
                onClick: (te) => p(y, -1)
              }, "−", 8, Be),
              e("output", { "aria-labelledby": "coc-label-" + y }, n(l(B)(f.value, y)), 9, Ae),
              e("button", {
                type: "button",
                "data-step": "increase",
                "aria-label": l(r).increase + l(N)[y].label,
                disabled: o.value || !l(H)(f.value, y, 1),
                onClick: (te) => p(y, 1)
              }, "+", 8, Fe)
            ], 8, qe)], 8, je))), 128))])], 8, Ee))), 128)),
            (t.sheet || t.invalid) && !O.value ? (d(), u("button", {
              key: 1,
              type: "button",
              class: "coc-reset",
              "data-sheet-action": "reset",
              disabled: o.value,
              onClick: v[1] || (v[1] = (b) => O.value = !0)
            }, n(l(r).reset), 9, Ne)) : g("", !0)
          ]),
          e("footer", De, [
            t.failure || C.value || t.blocked ? (d(), u("p", Me, n(t.failure || (t.blocked ? l(r).saveUnconfirmed : C.value)), 1)) : g("", !0),
            t.blocked ? (d(), u("button", {
              key: 1,
              type: "button",
              "data-sheet-action": "check-save",
              disabled: t.busy,
              onClick: v[2] || (v[2] = (b) => t.checkSave?.())
            }, n(l(r).checkSave), 9, Le)) : g("", !0),
            O.value && !t.blocked ? (d(), u("div", Pe, [
              e("p", Ue, n(l(r).resetQuestion), 1),
              e("p", null, n(l(r).resetNotice), 1),
              e("div", He, [e("button", {
                type: "button",
                "data-sheet-action": "cancel-reset",
                disabled: t.busy,
                onClick: v[3] || (v[3] = (b) => O.value = !1)
              }, n(l(r).cancelReset), 9, Ve), e("button", {
                type: "button",
                class: "primary",
                "data-sheet-action": "confirm-reset",
                disabled: o.value,
                onClick: ae
              }, n(t.busy ? l(r).resetting : l(r).confirmReset), 9, Qe)])
            ])) : t.blocked ? g("", !0) : (d(), u("div", ze, [
              e("button", {
                type: "button",
                class: "coc-random",
                "data-sheet-action": "generate",
                disabled: o.value,
                onClick: T
              }, n(l(r).generate), 9, Ge),
              !h.value && t.sheet ? (d(), u("span", Ke, n(l(r).saved), 1)) : g("", !0),
              h.value ? (d(), u("button", {
                key: 1,
                type: "button",
                "data-sheet-action": "cancel",
                disabled: t.busy,
                onClick: L
              }, n(l(r).cancel), 9, Ye)) : g("", !0),
              e("button", {
                type: "button",
                class: "primary",
                "data-sheet-action": "save",
                disabled: o.value || !h.value && !!t.sheet || !F.value,
                onClick: E
              }, n(t.busy ? l(r).saving : l(r).save), 9, We)
            ]))
          ])
        ])]),
        _: 1
      }, 8, ["busy"])) : g("", !0)
    ], 64));
  }
}), ee = (t, i) => {
  const a = t.__vccOpts || t;
  for (const [c, o] of i) a[c] = o;
  return a;
}, Je = /* @__PURE__ */ ee(Xe, [["__scopeId", "data-v-86b8f0c7"]]), Ze = { class: "dice-app" }, ea = {
  "aria-labelledby": "dice-action-label",
  class: "dice-feature"
}, aa = { class: "dice-switch-row" }, ta = ["aria-checked", "disabled"], ia = { class: "dice-sr" }, la = ["disabled"], sa = { class: "dice-frequency-options" }, na = ["aria-pressed", "onClick"], ra = {
  id: "dice-rule-description",
  "aria-live": "polite"
}, oa = ["disabled"], ca = { class: "dice-frequency-options" }, da = ["aria-pressed", "onClick"], ua = {
  id: "dice-frequency-description",
  "aria-live": "polite"
}, va = {
  "aria-labelledby": "dice-encounter-label",
  class: "dice-feature"
}, ba = { class: "dice-switch-row" }, ha = ["aria-checked", "disabled"], ya = { class: "dice-sr" }, fa = {
  key: 0,
  class: "dice-recovery",
  "aria-live": "polite"
}, pa = "使用不支持预填充的模型时，请关闭「续写预填充」，并保留预设「实用提示词」里的「继续推进」内容（不能为空）。", ka = /* @__PURE__ */ J({
  __name: "DiceApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(t) {
    const i = t, a = R(i.initialState), c = R(!1), o = R(null), h = {
      standard: {
        label: "标准",
        description: "有风险或阻力，且成败会改变后续的行动才检定。"
      },
      active: {
        label: "积极",
        description: "日常小目标，以及效果、耗时和代价的不确定性也可检定。"
      }
    }, w = {
      d20: {
        label: "通用 D20",
        description: "不需要人物数值，由情境决定难度。"
      },
      coc7: {
        label: r.rule,
        description: r.description
      }
    };
    let I = () => {
    }, C = !1, O = 0;
    le(() => {
      C = !0, I = i.bridge.subscribe(($) => {
        if ($.type === "dice/state") {
          const s = $.payload.state;
          s.chatIdentity === a.value.chatIdentity && (O++, a.value = s);
        }
      });
    }), se(() => {
      C = !1, I();
    });
    async function f($, s, S = !0) {
      if (c.value) return !1;
      c.value = !0, o.value = null;
      const p = a.value.chatIdentity, T = O;
      try {
        const E = await i.bridge.request($, {
          chatIdentity: p,
          ...s
        });
        return C && T === O && E.result.chatIdentity === p && (a.value = E.result), C && E.result.chatIdentity === p;
      } catch (E) {
        return C && S && (o.value = {
          type: $,
          message: E instanceof re && E.code === "app_request_failed" ? E.message : "操作未完成，请稍后重试。"
        }), !1;
      } finally {
        C && (c.value = !1);
      }
    }
    function F() {
      (o.value?.type === "dice/set-coc7-sheet" || o.value?.type === "dice/confirm-sheet-save") && (o.value = null);
    }
    return ($, s) => (d(), u("main", Ze, [
      e("section", ea, [
        e("div", aa, [s[3] || (s[3] = e("h1", { id: "dice-action-label" }, "行动检定", -1)), e("button", {
          type: "button",
          class: "dice-switch",
          role: "switch",
          "aria-labelledby": "dice-action-label",
          "aria-checked": a.value.actionChecksEnabled,
          disabled: c.value,
          onClick: s[0] || (s[0] = (S) => f("dice/set-feature", {
            feature: "actionChecksEnabled",
            enabled: !a.value.actionChecksEnabled
          }))
        }, [s[2] || (s[2] = e("span", { "aria-hidden": "true" }, null, -1)), e("span", ia, n(a.value.actionChecksEnabled ? "关闭" : "开启"), 1)], 8, ta)]),
        s[9] || (s[9] = e("p", { class: "dice-intro" }, "当你尝试不确定的事——说服陌生人、翻越高墙、破译符文——由骰点裁决，而非 AI。", -1)),
        a.value.actionChecksEnabled ? (d(), u("fieldset", {
          key: 0,
          class: "dice-frequency",
          disabled: c.value,
          "aria-describedby": "dice-rule-description"
        }, [
          s[4] || (s[4] = e("legend", null, "检定规则", -1)),
          e("div", sa, [(d(), u(j, null, q(w, (S, p) => e("button", {
            key: p,
            type: "button",
            class: "dice-frequency-option",
            "aria-pressed": a.value.actionCheckRule === p,
            onClick: (T) => a.value.actionCheckRule !== p && f("dice/set-rule", { rule: p })
          }, n(S.label), 9, na)), 64))]),
          e("p", ra, n(w[a.value.actionCheckRule].description), 1)
        ], 8, la)) : g("", !0),
        a.value.actionChecksEnabled && a.value.actionCheckRule === "d20" ? (d(), u("fieldset", {
          key: 1,
          class: "dice-frequency",
          disabled: c.value,
          "aria-describedby": "dice-frequency-description"
        }, [
          s[5] || (s[5] = e("legend", null, "检定频率", -1)),
          e("div", ca, [(d(), u(j, null, q(h, (S, p) => e("button", {
            key: p,
            type: "button",
            class: "dice-frequency-option",
            "aria-pressed": a.value.actionCheckFrequency === p,
            onClick: (T) => a.value.actionCheckFrequency !== p && f("dice/set-frequency", { frequency: p })
          }, n(S.label), 9, da)), 64))]),
          e("p", ua, n(h[a.value.actionCheckFrequency].description), 1)
        ], 8, oa)) : g("", !0),
        a.value.coc7Sheet.kind === "invalid" || a.value.actionChecksEnabled && a.value.actionCheckRule === "coc7" ? (d(), X(Je, {
          key: 2,
          sheet: a.value.coc7Sheet.kind === "ready" ? a.value.coc7Sheet.sheet : null,
          invalid: a.value.coc7Sheet.kind === "invalid",
          busy: c.value,
          failure: o.value?.message,
          blocked: a.value.sheetStorage !== "ready",
          "check-save": () => f("dice/confirm-sheet-save", {}),
          save: (S) => f("dice/set-coc7-sheet", { sheet: S }),
          onConfirmed: F
        }, null, 8, [
          "sheet",
          "invalid",
          "busy",
          "failure",
          "blocked",
          "check-save",
          "save"
        ])) : g("", !0),
        e("aside", { class: "dice-notice" }, [
          s[6] || (s[6] = e("p", null, "请勿开启酒馆的「自动续写」。", -1)),
          e("p", null, n(pa)),
          s[7] || (s[7] = e("p", null, "酒馆 1.14 / 1.15：点击检定的「继续」会发送输入框中尚未发送的文字。", -1)),
          s[8] || (s[8] = e("p", null, "功能开启期间，会自动创建「小白 OS · 行动检定显示」全局正则。", -1))
        ])
      ]),
      e("section", va, [
        e("div", ba, [s[11] || (s[11] = e("h2", { id: "dice-encounter-label" }, "随机遭遇", -1)), e("button", {
          type: "button",
          class: "dice-switch",
          role: "switch",
          "aria-labelledby": "dice-encounter-label",
          "aria-checked": a.value.encountersEnabled,
          disabled: c.value,
          onClick: s[1] || (s[1] = (S) => f("dice/set-feature", {
            feature: "encountersEnabled",
            enabled: !a.value.encountersEnabled
          }))
        }, [s[10] || (s[10] = e("span", { "aria-hidden": "true" }, null, -1)), e("span", ya, n(a.value.encountersEnabled ? "关闭" : "开启"), 1)], 8, ha)]),
        s[12] || (s[12] = e("p", null, "偶尔为剧情添一点变数，也可从已开启的世界背景与剧情记忆中寻找灵感。", -1)),
        s[13] || (s[13] = e("p", { class: "dice-rates" }, [
          D("轻微 5% "),
          e("span", { "aria-hidden": "true" }, "·"),
          D(" 中等 3% "),
          e("span", { "aria-hidden": "true" }, "·"),
          D(" 重大 1%")
        ], -1)),
        s[14] || (s[14] = e("p", { class: "dice-cooldown" }, "触发后，接下来的两次用户发言不会触发新遭遇。不额外调用模型。", -1))
      ]),
      o.value ? (d(), u("section", fa, [e("p", null, n(o.value.message), 1)])) : g("", !0)
    ]));
  }
}), ga = /* @__PURE__ */ ee(ka, [["__scopeId", "data-v-839ca5e6"]]);
export {
  ga as default
};
