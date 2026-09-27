/* eslint-disable */
import { $ as W, E as Q, F as a, G as Z, H as U, L as T, M as re, O as oe, Q as s, V as be, X as me, Y as M, Z as ye, _ as n, a as ee, b as R, c as X, g as m, h as E, l as F, m as t, o as Y, p as H, s as ae, tt as u, u as S, w as ne, x as P, y as N } from "./xiaobai-os-runtime-dom.esm-bundler-DuiaxqDz.js";
import { n as _, r as ue } from "./xiaobai-os-app-navigation-CKmHuh0u.js";
import { t as ke } from "./xiaobai-os-MessageMarkdown-CaSkkvsl.js";
var fe = ["disabled"], pe = {
  key: 0,
  class: "learning-choices"
}, $e = [
  "type",
  "checked",
  "onChange"
], he = { class: "learning-option-letter" }, Ce = {
  key: 1,
  class: "learning-order"
}, we = [
  "disabled",
  "aria-label",
  "onClick"
], xe = [
  "disabled",
  "aria-label",
  "onClick"
], Ie = {
  key: 2,
  class: "learning-fields"
}, Le = ["onUpdate:modelValue"], Se = ["value"], Ae = {
  key: 3,
  class: "learning-choices"
}, Me = ["checked", "onChange"], Te = {
  key: 0,
  class: "learning-muted"
}, Re = {
  key: 4,
  class: "learning-fields"
}, Ve = ["onUpdate:modelValue"], Ne = {
  key: 5,
  class: "learning-writing"
}, Be = ["disabled"], Ue = /* @__PURE__ */ P({
  __name: "AnswerInput",
  props: /* @__PURE__ */ ne({
    response: {},
    paragraphs: {},
    disabled: { type: Boolean }
  }, {
    modelValue: { required: !0 },
    modelModifiers: {}
  }),
  emits: /* @__PURE__ */ ne(["submit"], ["update:modelValue"]),
  setup(e, { emit: l }) {
    const k = e, o = l, g = be(e, "modelValue");
    function c(r) {
      k.response.kind === "choice" && !k.response.multiple ? g.value.picked = [r] : g.value.picked = g.value.picked.includes(r) ? g.value.picked.filter((b) => b !== r) : [...g.value.picked, r];
    }
    function p(r, b) {
      const y = [...g.value.order];
      [y[r], y[r + b]] = [y[r + b], y[r]], g.value.order = y;
    }
    const h = H(() => {
      const r = k.response;
      return r.kind === "text" ? !!g.value.text.trim() : r.kind === "gaps" ? r.slots.every((b) => g.value.values[b.id]?.trim()) : r.kind === "match" ? r.left.every((b) => g.value.values[b.id]) : r.kind === "order" ? !0 : g.value.picked.length > 0;
    });
    function v() {
      const r = k.response;
      !h.value || k.disabled || (r.kind === "text" ? o("submit", {
        kind: "text",
        text: g.value.text
      }) : r.kind === "gaps" ? o("submit", {
        kind: "gaps",
        values: r.slots.map((b) => ({
          id: b.id,
          text: g.value.values[b.id]
        }))
      }) : r.kind === "match" ? o("submit", {
        kind: "match",
        pairs: r.left.map((b) => ({
          left: b.id,
          right: g.value.values[b.id]
        }))
      }) : o("submit", {
        kind: r.kind,
        ids: [...r.kind === "order" ? g.value.order : g.value.picked]
      }));
    }
    return (r, b) => (a(), n("form", {
      class: "learning-answer",
      onSubmit: F(v, ["prevent"])
    }, [t("fieldset", { disabled: e.disabled }, [
      b[3] || (b[3] = t("legend", { class: "learning-sr-only" }, "你的回答", -1)),
      e.response.kind === "choice" ? (a(), n("div", pe, [(a(!0), n(S, null, T(e.response.options, (y, f) => (a(), n("label", {
        key: y.id,
        class: W({ selected: g.value.picked.includes(y.id) })
      }, [
        t("input", {
          type: e.response.multiple ? "checkbox" : "radio",
          name: "answer-choice",
          checked: g.value.picked.includes(y.id),
          onChange: (C) => c(y.id)
        }, null, 40, $e),
        t("span", he, u(String.fromCharCode(65 + f)), 1),
        t("span", null, u(y.text), 1)
      ], 2))), 128))])) : e.response.kind === "order" ? (a(), n("ol", Ce, [(a(!0), n(S, null, T(g.value.order, (y, f) => (a(), n("li", { key: y }, [
        t("span", null, u(e.response.options.find((C) => C.id === y)?.text), 1),
        t("button", {
          type: "button",
          disabled: f === 0,
          "aria-label": `上移第 ${f + 1} 项`,
          onClick: (C) => p(f, -1)
        }, "↑", 8, we),
        t("button", {
          type: "button",
          disabled: f === g.value.order.length - 1,
          "aria-label": `下移第 ${f + 1} 项`,
          onClick: (C) => p(f, 1)
        }, "↓", 8, xe)
      ]))), 128))])) : e.response.kind === "match" ? (a(), n("div", Ie, [(a(!0), n(S, null, T(e.response.left, (y) => (a(), n("label", { key: y.id }, [N(u(y.text) + " ", 1), Z(t("select", { "onUpdate:modelValue": (f) => g.value.values[y.id] = f }, [b[1] || (b[1] = t("option", { value: "" }, "选择对应项", -1)), (a(!0), n(S, null, T(e.response.right, (f) => (a(), n("option", {
        key: f.id,
        value: f.id
      }, u(f.text), 9, Se))), 128))], 8, Le), [[ee, g.value.values[y.id]]])]))), 128))])) : e.response.kind === "evidence" ? (a(), n("div", Ae, [(a(!0), n(S, null, T(e.paragraphs, (y) => (a(), n("label", {
        key: y.id,
        class: W({ selected: g.value.picked.includes(y.id) })
      }, [t("input", {
        type: "checkbox",
        checked: g.value.picked.includes(y.id),
        onChange: (f) => c(y.id)
      }, null, 40, Me), t("span", null, u(y.text), 1)], 2))), 128)), e.paragraphs.length ? m("", !0) : (a(), n("p", Te, "请先展开相关文稿，再选择原文依据。"))])) : e.response.kind === "gaps" ? (a(), n("div", Re, [(a(!0), n(S, null, T(e.response.slots, (y) => (a(), n("label", { key: y.id }, [N(u(y.text), 1), Z(t("input", {
        "onUpdate:modelValue": (f) => g.value.values[y.id] = f,
        type: "text",
        maxlength: "4000",
        autocomplete: "off"
      }, null, 8, Ve), [[Y, g.value.values[y.id]]])]))), 128))])) : (a(), n("label", Ne, [b[2] || (b[2] = t("span", { class: "learning-sr-only" }, "你的回答", -1)), Z(t("textarea", {
        "onUpdate:modelValue": b[0] || (b[0] = (y) => g.value.text = y),
        rows: "6",
        maxlength: "4000",
        placeholder: "写下你的回答…"
      }, null, 512), [[Y, g.value.text]])])),
      t("button", {
        class: "learning-primary",
        type: "submit",
        disabled: !h.value
      }, "交给老师 →", 8, Be)
    ], 8, fe)], 32));
  }
}), qe = Ue, Oe = ["stroke-width"], De = ["d"], je = /* @__PURE__ */ P({
  __name: "LearningIcon",
  props: { name: {} },
  setup(e) {
    const l = {
      home: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
      book: "M12 5v16M3 4c4-1 6 0 9 1 3-1 5-2 9-1v15c-4-1-6 0-9 2-3-2-5-3-9-2Z",
      records: "M7 3h10a2 2 0 0 1 2 2v16H5V5a2 2 0 0 1 2-2ZM9 8h6M9 12h6M9 16h3",
      reward: "m12 3 3 6 6 1-4 5 1 6-6-3-6 3 1-6-4-5 6-1Z",
      arrow: "M4 12h16m-6-6 6 6-6 6",
      send: "M12 20V4m-6 6 6-6 6 6",
      back: "m14 5-7 7 7 7",
      check: "m5 12 4 4L19 6",
      play: "m8 4 12 8-12 8Z",
      pause: "M8 5v14M16 5v14",
      stop: "M6 6h12v12H6Z",
      sound: "m11 4-6 5H2v6h3l6 5ZM16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14",
      chat: "M5 3h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9l-6 4V5a2 2 0 0 1 2-2ZM7 8h10M7 12h6",
      more: "M5 12h.01M12 12h.01M19 12h.01",
      close: "m6 6 12 12M6 18 18 6",
      globe: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z"
    };
    return (k, o) => (a(), n("svg", {
      class: "learning-icon",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": e.name === "more" ? 3.5 : 1.7,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true"
    }, [t("path", { d: l[e.name] }, null, 8, De)], 8, Oe));
  }
}), B = je, He = { class: "learning-material" }, Ee = { class: "learning-source" }, Pe = { key: 0 }, Ze = ["href"], Fe = {
  key: 0,
  class: "learning-listening-cover"
}, Ke = ["disabled"], ze = {
  key: 1,
  class: "learning-material-body"
}, Je = ["onMouseup", "onKeyup"], Ge = ["disabled", "onClick"], We = {
  class: "learning-audio-parts",
  "aria-label": "材料朗读分段"
}, Qe = ["disabled", "onClick"], Xe = { key: 2 }, Ye = /* @__PURE__ */ P({
  __name: "MaterialReader",
  props: {
    material: {},
    disabled: { type: Boolean },
    exerciseId: {}
  },
  emits: ["action", "select"],
  setup(e, { emit: l }) {
    const k = e, o = l;
    function g(p) {
      o("select", {
        materialId: k.material.id,
        paragraphId: p.id,
        start: 0,
        end: p.text.length,
        quote: p.text
      });
    }
    function c(p, h) {
      const v = window.getSelection();
      if (!v?.rangeCount || v.isCollapsed) return;
      const r = v.getRangeAt(0), b = p.currentTarget;
      if (!b.contains(r.startContainer) || !b.contains(r.endContainer)) return;
      const y = r.cloneRange();
      y.selectNodeContents(b), y.setEnd(r.startContainer, r.startOffset);
      const f = r.toString(), C = y.toString().length;
      f && [...f].length <= 2e3 && h.text.slice(C, C + f.length) === f && o("select", {
        materialId: k.material.id,
        paragraphId: h.id,
        start: C,
        end: C + f.length,
        quote: f
      });
    }
    return (p, h) => (a(), n("article", He, [
      t("h2", null, u(e.material.title), 1),
      t("div", Ee, [e.material.provenance.kind === "authored" ? (a(), n("span", Pe, "老师自编练习")) : (a(), n("a", {
        key: 1,
        href: e.material.provenance.url,
        target: "_blank",
        rel: "noopener noreferrer"
      }, u(e.material.provenance.kind === "original" ? "原文节选" : "改编自") + " · " + u(e.material.provenance.title) + " ↗", 9, Ze))]),
      e.material.hidden ? (a(), n("div", Fe, [h[1] || (h[1] = t("svg", {
        viewBox: "0 0 140 60",
        "aria-hidden": "true"
      }, [t("path", {
        d: "M8 27v6m10-14v22m10-31v40m10-26v12m10-35v58m10-47v36m10-27v18m10-37v56m10-36v16m10-29v42m10-31v20m10-16v12m10-8v4",
        stroke: "currentColor",
        "stroke-width": "3",
        "stroke-linecap": "round",
        fill: "none"
      })], -1)), t("button", {
        type: "button",
        disabled: e.disabled,
        onClick: h[0] || (h[0] = (v) => o("action", "reveal", {
          kind: "transcripts",
          id: e.material.id
        }))
      }, "看文稿", 8, Ke)])) : (a(), n("div", ze, [(a(!0), n(S, null, T(e.material.paragraphs, (v) => (a(), n("div", {
        key: v.id,
        class: "learning-paragraph"
      }, [t("p", {
        tabindex: "0",
        onMouseup: (r) => c(r, v),
        onKeyup: (r) => c(r, v)
      }, u(v.text), 41, Je), t("button", {
        type: "button",
        disabled: e.disabled || [...v.text].length > 2e3,
        "aria-label": "选这段提问",
        onClick: (r) => g(v)
      }, "选段", 8, Ge)]))), 128))])),
      t("div", We, [(a(!0), n(S, null, T(e.material.parts, (v) => (a(), n("button", {
        key: v.key,
        type: "button",
        disabled: e.disabled,
        onClick: (r) => o("action", "play", {
          materialId: e.material.id,
          partKey: v.key,
          exerciseId: e.exerciseId
        })
      }, [R(B, { name: "play" }), N(u(e.material.parts.length > 1 ? `听第 ${v.number} 段` : "播放朗读"), 1)], 8, Qe))), 128))]),
      e.material.parts.length ? (a(), n("small", Xe, "TTS 合成朗读")) : m("", !0)
    ]));
  }
}), le = Ye;
function de(e, l, k = []) {
  const o = (g) => l.kind === "choice" || l.kind === "order" ? l.options.find((c) => c.id === g)?.text ?? g : k.find((c) => c.id === g)?.text ?? g;
  return e.kind === "text" ? e.text : e.kind === "gaps" ? e.values.map((g) => `${l.kind === "gaps" ? l.slots.find((c) => c.id === g.id)?.text ?? "" : ""} ${g.text}`).join(`
`) : e.kind === "match" ? e.pairs.map((g) => l.kind === "match" ? `${l.left.find((c) => c.id === g.left)?.text} → ${l.right.find((c) => c.id === g.right)?.text}` : "").join(`
`) : e.ids.map(o).join(e.kind === "order" ? " → " : `
`);
}
var _e = { class: "learning-feedback" }, et = { class: "learning-muted" }, tt = { key: 0 }, at = { key: 1 }, nt = { key: 0 }, lt = { key: 1 }, it = { key: 2 }, st = ["disabled"], rt = ["disabled"], ot = /* @__PURE__ */ P({
  __name: "AttemptFeedback",
  props: {
    attempt: {},
    feedback: {},
    response: {},
    paragraphs: {},
    disabled: { type: Boolean }
  },
  emits: ["action"],
  setup(e) {
    const l = {
      correct: "答对了",
      partial: "已经掌握一部分",
      incorrect: "一起把这里弄懂",
      disputed: "这处还需复核"
    };
    return (k, o) => (a(), n("section", _e, [
      o[6] || (o[6] = t("p", { class: "learning-eyebrow" }, "已保存的原答", -1)),
      t("blockquote", null, u(s(de)(e.attempt.answer, e.response, e.paragraphs)), 1),
      t("small", et, [
        N(u(e.attempt.help.feedback ? "得到反馈后的再练" : e.attempt.help.answer || e.attempt.help.hint || e.attempt.help.transcript ? "这次有辅助" : "未使用答案或提示"), 1),
        e.attempt.help.replays ? (a(), n("span", tt, " · 重听 " + u(e.attempt.help.replays) + " 次", 1)) : m("", !0),
        e.attempt.help.slowPlayback ? (a(), n("span", at, " · 慢放")) : m("", !0)
      ]),
      e.feedback ? (a(), n(S, { key: 0 }, [
        t("h3", null, u(l[e.feedback.verdict]), 1),
        e.feedback.understanding ? (a(), n("p", nt, [o[2] || (o[2] = t("b", null, "理解", -1)), N(u(e.feedback.understanding), 1)])) : m("", !0),
        e.feedback.expression ? (a(), n("p", lt, [o[3] || (o[3] = t("b", null, "表达", -1)), N(u(e.feedback.expression), 1)])) : m("", !0),
        e.feedback.guidance ? (a(), n("p", it, [o[4] || (o[4] = t("b", null, "批注", -1)), N(u(e.feedback.guidance), 1)])) : m("", !0),
        t("button", {
          type: "button",
          disabled: e.disabled,
          onClick: o[0] || (o[0] = (g) => k.$emit("action", "assess", {
            attemptId: e.attempt.id,
            review: !0,
            message: "请重新审视我的原答与题目。也请考虑其他有效表达，不只对照原来的答案键。"
          }))
        }, u(e.feedback.verdict === "disputed" ? "请老师复核" : "有疑问，请复核"), 9, st)
      ], 64)) : (a(), n(S, { key: 1 }, [o[5] || (o[5] = t("p", null, "原答已保存，等待老师评估。", -1)), t("button", {
        type: "button",
        disabled: e.disabled,
        onClick: o[1] || (o[1] = (g) => k.$emit("action", "assess", {
          attemptId: e.attempt.id,
          review: !1,
          message: "请评估这条已经保存的原答。"
        }))
      }, "重试评估", 8, rt)], 64))
    ]));
  }
}), ve = ot, ut = {
  key: 0,
  class: "learning-player",
  "aria-label": "课堂朗读"
}, dt = {
  key: 0,
  role: "status"
}, vt = {
  key: 2,
  class: "learning-row"
}, ct = ["aria-label", "disabled"], gt = ["max", "value"], bt = /* @__PURE__ */ P({
  __name: "LearningPlayer",
  props: { state: {} },
  emits: ["action"],
  setup(e, { emit: l }) {
    const k = l;
    function o(g) {
      return `${Math.floor(g / 60)}:${String(Math.floor(g % 60)).padStart(2, "0")}`;
    }
    return (g, c) => e.state.media.status !== "idle" ? (a(), n("section", ut, [
      e.state.media.message ? (a(), n("p", dt, u(e.state.media.message), 1)) : m("", !0),
      e.state.voices.enabled ? m("", !0) : (a(), n("button", {
        key: 1,
        type: "button",
        onClick: c[0] || (c[0] = (p) => k("action", "tts-settings"))
      }, "如何开启 TTS")),
      e.state.media.key ? (a(), n("div", vt, [
        R(B, { name: "sound" }),
        t("span", null, u(e.state.media.status === "loading" ? "正在生成声音…" : `${o(e.state.media.position)} / ${o(e.state.media.duration)}`), 1),
        e.state.media.status === "playing" ? (a(), n("button", {
          key: 0,
          type: "button",
          "aria-label": "暂停",
          onClick: c[1] || (c[1] = (p) => k("action", "pause"))
        }, [R(B, { name: "pause" })])) : [
          "paused",
          "ended",
          "blocked"
        ].includes(e.state.media.status) ? (a(), n("button", {
          key: 1,
          type: "button",
          "aria-label": e.state.media.status === "ended" ? "再听一遍" : "继续播放",
          disabled: e.state.busy,
          onClick: c[2] || (c[2] = (p) => k("action", "resume"))
        }, [R(B, { name: "play" })], 8, ct)) : m("", !0),
        t("button", {
          type: "button",
          "aria-label": "停止",
          onClick: c[3] || (c[3] = (p) => k("action", "stop"))
        }, [R(B, { name: "stop" })]),
        e.state.media.duration ? (a(), n("button", {
          key: 2,
          type: "button",
          onClick: c[4] || (c[4] = (p) => k("action", "rate", { value: e.state.media.rate === 1 ? 0.75 : 1 }))
        }, u(e.state.media.rate) + "×", 1)) : m("", !0)
      ])) : m("", !0),
      e.state.media.duration ? (a(), n("input", {
        key: 3,
        type: "range",
        min: "0",
        max: e.state.media.duration,
        step: "0.1",
        value: e.state.media.position,
        "aria-label": "当前声音片段播放位置",
        onChange: c[5] || (c[5] = (p) => k("action", "seek", { value: Number(p.target.value) }))
      }, null, 40, gt)) : m("", !0)
    ])) : m("", !0);
  }
}), ce = bt;
function ie(e) {
  return {
    picked: [],
    text: "",
    values: {},
    order: e.kind === "order" ? e.options.map((l) => l.id) : []
  };
}
var mt = ["onKeydown"], yt = {
  role: "dialog",
  "aria-labelledby": "learning-activity-title",
  class: "learning-activity"
}, kt = { class: "learning-activity-header" }, ft = { id: "learning-activity-title" }, pt = {
  key: 0,
  "aria-label": "完成本课的固定奖励"
}, $t = {
  key: 0,
  class: "learning-margin-note",
  role: "status"
}, ht = {
  key: 0,
  class: "learning-activity-materials"
}, Ct = {
  key: 2,
  class: "learning-selection"
}, wt = { class: "learning-row" }, xt = ["disabled"], It = {
  key: 3,
  class: "learning-question"
}, Lt = { class: "learning-help-actions" }, St = ["disabled"], At = ["disabled"], Mt = ["disabled"], Tt = {
  key: 0,
  class: "learning-margin-note"
}, Rt = {
  key: 1,
  class: "learning-margin-note"
}, Vt = { key: 0 }, Nt = { key: 1 }, Bt = { key: 2 }, Ut = ["disabled"], qt = /* @__PURE__ */ P({
  __name: "LearningActivity",
  props: {
    state: {},
    target: {},
    disabled: { type: Boolean }
  },
  emits: [
    "action",
    "close",
    "ask"
  ],
  setup(e, { emit: l }) {
    const k = e, o = l, g = M(null), c = /* @__PURE__ */ new Map(), p = M(null), h = M(!1), v = M(null), r = M(null);
    function b() {
      v.value ? v.value = null : h.value ? h.value = !1 : o("close");
    }
    ue(r, b);
    const y = M({});
    let f = null;
    const C = H(() => k.target?.kind === "exercise" ? k.state.unit?.exercises.find(($) => $.id === k.target?.id) : void 0), j = H(() => k.state.unit?.materials.filter(($) => k.target?.kind === "material" ? $.id === k.target.id : C.value?.materialIds.includes($.id)) ?? []), V = H(() => C.value?.id ?? k.state.unit?.exercises.find(($) => $.skill === "listening" && $.materialIds.includes(k.target?.id ?? ""))?.id ?? k.state.unit?.exercises.find(($) => $.materialIds.includes(k.target?.id ?? ""))?.id), K = H(() => j.value.filter(($) => C.value?.response.kind !== "evidence" || $.id === C.value.response.materialId).flatMap(($) => $.paragraphs)), q = H(() => k.state.unit?.attempts.filter(($) => $.exerciseId === C.value?.id).at(-1)), z = H(() => k.state.unit?.assessments.find(($) => $.attemptId === q.value?.id));
    U(() => C.value, ($) => {
      if (!$) return;
      const w = JSON.stringify($.response);
      y.value[$.id]?.response !== w && (y.value[$.id] = {
        response: w,
        value: ie($.response)
      });
    }, { immediate: !0 });
    const A = H({
      get: () => y.value[C.value.id].value,
      set: ($) => {
        y.value[C.value.id].value = $;
      }
    });
    U(() => k.target, async ($, w) => {
      w && g.value && c.set(`${w.kind}:${w.id}`, g.value.scrollTop), h.value = !1, v.value = null, await Q(), $ && (p.value?.focus(), g.value && (g.value.scrollTop = c.get(`${$.kind}:${$.id}`) ?? 0));
    }), U(() => k.state.unit?.id, () => {
      y.value = {}, f = null;
    }), U(() => k.state.unit?.attempts, ($) => {
      if (!f) return;
      const w = $?.filter((L) => L.exerciseId === f.id).at(-1);
      if (w && w.id !== f.before) {
        const L = k.target?.kind === "exercise" && k.target.id === f.id;
        delete y.value[f.id], f = null, L && o("close");
      }
    });
    function x($) {
      f = {
        id: C.value.id,
        before: q.value?.id
      }, o("action", "submit", {
        unitId: k.state.unit.id,
        exerciseId: C.value.id,
        answer: $
      });
    }
    return ($, w) => e.target ? (a(), n("div", {
      key: 0,
      ref_key: "layer",
      ref: r,
      class: "learning-activity-shade",
      onKeydown: X(F(b, ["stop", "prevent"]), ["esc"])
    }, [t("section", yt, [
      t("header", kt, [
        t("h2", ft, u(C.value ? "练习" : j.value[0]?.title ?? "材料"), 1),
        e.state.unit ? (a(), n("small", pt, "+" + u(e.state.unit.reward.amount) + " 币", 1)) : m("", !0),
        t("button", {
          ref_key: "closeButton",
          ref: p,
          type: "button",
          "aria-label": "收起课件",
          onClick: w[0] || (w[0] = (L) => o("close"))
        }, [w[17] || (w[17] = N("收起", -1)), R(B, { name: "back" })], 512)
      ]),
      e.state.message && !e.state.busy ? (a(), n("p", $t, u(e.state.message), 1)) : m("", !0),
      t("div", {
        ref_key: "body",
        ref: g,
        class: "learning-activity-body"
      }, [
        C.value && j.value.length ? (a(), n("details", ht, [t("summary", null, "阅读材料 · " + u(j.value.length), 1), (a(!0), n(S, null, T(j.value, (L) => (a(), E(le, {
          key: L.id,
          material: L,
          "exercise-id": V.value,
          disabled: e.disabled,
          onAction: w[1] || (w[1] = (O, D) => o("action", O, D)),
          onSelect: w[2] || (w[2] = (O) => v.value = O)
        }, null, 8, [
          "material",
          "exercise-id",
          "disabled"
        ]))), 128))])) : C.value ? m("", !0) : (a(!0), n(S, { key: 1 }, T(j.value, (L) => (a(), E(le, {
          key: L.id,
          material: L,
          "exercise-id": V.value,
          disabled: e.disabled,
          onAction: w[3] || (w[3] = (O, D) => o("action", O, D)),
          onSelect: w[4] || (w[4] = (O) => v.value = O)
        }, null, 8, [
          "material",
          "exercise-id",
          "disabled"
        ]))), 128)),
        v.value ? (a(), n("div", Ct, [t("blockquote", null, u(v.value.quote), 1), t("div", wt, [
          t("button", {
            type: "button",
            onClick: w[5] || (w[5] = (L) => o("ask", V.value, v.value))
          }, "问老师"),
          t("button", {
            type: "button",
            disabled: e.disabled || [...v.value.quote].length > 1e3,
            onClick: w[6] || (w[6] = (L) => o("action", "say", { selection: v.value }))
          }, "朗读", 8, xt),
          t("button", {
            type: "button",
            onClick: w[7] || (w[7] = (L) => v.value = null)
          }, "取消选段")
        ])])) : m("", !0),
        C.value ? (a(), n("section", It, [
          t("h2", null, u(C.value.prompt), 1),
          t("div", Lt, [
            t("button", {
              type: "button",
              disabled: e.disabled || [...C.value.prompt].length > 1e3,
              onClick: w[8] || (w[8] = (L) => o("action", "say-question", { exerciseId: C.value.id }))
            }, "听题干", 8, St),
            C.value.hasHint ? (a(), n("button", {
              key: 0,
              type: "button",
              disabled: e.disabled || C.value.hint !== null,
              onClick: w[9] || (w[9] = (L) => o("action", "reveal", {
                kind: "hints",
                id: C.value.id
              }))
            }, "提示", 8, At)) : m("", !0),
            t("button", {
              type: "button",
              disabled: e.disabled || C.value.solution !== null,
              onClick: w[10] || (w[10] = (L) => o("action", "reveal", {
                kind: "answers",
                id: C.value.id
              }))
            }, "解答", 8, Mt),
            t("button", {
              type: "button",
              onClick: w[11] || (w[11] = (L) => o("ask", C.value.id))
            }, "问老师")
          ]),
          C.value.hint ? (a(), n("p", Tt, u(C.value.hint), 1)) : m("", !0),
          C.value.solution ? (a(), n("div", Rt, [C.value.solution.kind === "exact" ? (a(), n("p", Vt, u(s(de)(C.value.solution.answer, C.value.response, K.value)), 1)) : C.value.solution.kind === "gaps" ? (a(), n("p", Nt, u(C.value.solution.accepted.map((L) => L.forms.join(" / ")).join(`
`)), 1)) : m("", !0), C.value.solution.kind !== "semantic" ? (a(), n("p", Bt, u(C.value.solution.explanation), 1)) : (a(), n("button", {
            key: 3,
            type: "button",
            onClick: w[12] || (w[12] = (L) => o("ask", C.value.id))
          }, "请老师讲解"))])) : m("", !0),
          (!q.value || h.value) && y.value[C.value.id] ? (a(), E(qe, {
            key: C.value.id,
            modelValue: A.value,
            "onUpdate:modelValue": w[13] || (w[13] = (L) => A.value = L),
            response: C.value.response,
            paragraphs: K.value,
            disabled: e.disabled,
            onSubmit: x
          }, null, 8, [
            "modelValue",
            "response",
            "paragraphs",
            "disabled"
          ])) : m("", !0),
          q.value ? (a(), E(ve, {
            key: 3,
            attempt: q.value,
            feedback: z.value,
            response: C.value.response,
            paragraphs: K.value,
            disabled: e.disabled,
            onAction: w[14] || (w[14] = (L, O) => {
              o("action", L, O), o("close");
            })
          }, null, 8, [
            "attempt",
            "feedback",
            "response",
            "paragraphs",
            "disabled"
          ])) : m("", !0),
          q.value ? (a(), n("button", {
            key: 4,
            type: "button",
            disabled: e.disabled,
            onClick: w[15] || (w[15] = (L) => {
              h.value = !h.value, y.value[C.value.id] ??= {
                response: JSON.stringify(C.value.response),
                value: s(ie)(C.value.response)
              };
            })
          }, u(h.value ? "收起再练" : "再试一次"), 9, Ut)) : m("", !0)
        ])) : m("", !0)
      ], 512),
      R(ce, {
        state: e.state,
        onAction: w[16] || (w[16] = (L, O) => o("action", L, O))
      }, null, 8, ["state"])
    ])], 40, mt)) : m("", !0);
  }
}), Ot = qt, Dt = { class: "learning-profile-page" }, jt = { class: "learning-setup-heading" }, Ht = { class: "learning-language-options" }, Et = [
  "disabled",
  "aria-pressed",
  "onClick"
], Pt = { "aria-hidden": "true" }, Zt = ["disabled"], Ft = { class: "learning-teacher-options" }, Kt = [
  "disabled",
  "aria-pressed",
  "onClick"
], zt = { class: "learning-person-initial" }, Jt = {
  key: 0,
  class: "learning-selected-teacher"
}, Gt = { class: "learning-person-initial" }, Wt = ["open"], Qt = ["disabled"], Xt = ["disabled"], Yt = { class: "learning-setup-actions" }, _t = ["disabled"], ea = ["disabled"], ta = /* @__PURE__ */ P({
  __name: "LearningSetup",
  props: {
    state: {},
    disabled: { type: Boolean }
  },
  emits: ["action", "done"],
  setup(e, { emit: l }) {
    const k = l, o = M(0), g = M(null), c = M(""), p = [
      [
        "en",
        "英语",
        "Aa"
      ],
      [
        "ja",
        "日语",
        "あ"
      ],
      [
        "ko",
        "韩语",
        "한"
      ],
      [
        "fr",
        "法语",
        "Ç"
      ],
      [
        "de",
        "德语",
        "ß"
      ],
      [
        "es",
        "西班牙语",
        "Ñ"
      ],
      [
        "zh-CN",
        "中文",
        "文"
      ]
    ];
    async function h(v) {
      o.value = v, await Q(), g.value?.focus();
    }
    return _(() => o.value ? (h(0), !0) : !1), (v, r) => (a(), n("section", Dt, [t("div", jt, [t("h1", {
      ref_key: "heading",
      ref: g,
      tabindex: "-1"
    }, u(o.value === 0 ? "选择要学习的语言" : "选择老师"), 513)]), o.value === 0 ? (a(), n(S, { key: 0 }, [t("div", Ht, [(a(), n(S, null, T(p, ([b, y, f]) => t("button", {
      key: b,
      type: "button",
      disabled: e.disabled,
      "aria-pressed": e.state.language === b,
      onClick: (C) => k("action", "language", { language: b })
    }, [
      t("span", Pt, u(f), 1),
      t("strong", null, u(y), 1),
      e.state.language === b ? (a(), E(B, {
        key: 0,
        name: "check"
      })) : m("", !0)
    ], 8, Et)), 64))]), t("button", {
      type: "button",
      class: "learning-primary learning-setup-next",
      disabled: e.disabled,
      onClick: r[0] || (r[0] = (b) => h(1))
    }, [r[5] || (r[5] = N("继续", -1)), R(B, { name: "arrow" })], 8, Zt)], 64)) : (a(), n(S, { key: 1 }, [
      t("div", Ft, [(a(!0), n(S, null, T(e.state.candidates, (b) => (a(), n("button", {
        key: b.name,
        type: "button",
        disabled: e.disabled,
        "aria-pressed": e.state.teacher?.name === b.name,
        onClick: (y) => k("action", "teacher", { teacher: {
          name: b.name,
          note: ""
        } })
      }, [
        t("span", zt, u([...b.name][0]), 1),
        t("strong", null, u(b.name), 1),
        e.state.teacher?.name === b.name ? (a(), E(B, {
          key: 0,
          name: "check"
        })) : m("", !0)
      ], 8, Kt))), 128))]),
      e.state.teacher && !e.state.candidates.some((b) => b.name === e.state.teacher?.name) ? (a(), n("p", Jt, [
        t("span", Gt, u([...e.state.teacher.name][0]), 1),
        N(u(e.state.teacher.name), 1),
        R(B, { name: "check" })
      ])) : m("", !0),
      t("details", {
        class: "learning-other-teacher",
        open: !e.state.candidates.length && !e.state.teacher
      }, [r[6] || (r[6] = t("summary", null, "选择其他人物", -1)), t("form", {
        class: "learning-row",
        onSubmit: r[2] || (r[2] = F((b) => k("action", "teacher", { teacher: {
          name: c.value.trim(),
          note: ""
        } }), ["prevent"]))
      }, [Z(t("input", {
        "onUpdate:modelValue": r[1] || (r[1] = (b) => c.value = b),
        type: "text",
        "aria-label": "其他人物名字",
        maxlength: "80",
        placeholder: "输入人物名字",
        disabled: e.disabled
      }, null, 8, Qt), [[Y, c.value]]), t("button", {
        type: "submit",
        disabled: e.disabled || !c.value.trim()
      }, "选这位", 8, Xt)], 32)], 8, Wt),
      t("div", Yt, [t("button", {
        type: "button",
        disabled: e.disabled,
        onClick: r[3] || (r[3] = (b) => h(0))
      }, "上一步", 8, _t), t("button", {
        type: "button",
        class: "learning-primary",
        disabled: e.disabled || !e.state.teacher,
        onClick: r[4] || (r[4] = (b) => k("done"))
      }, [r[7] || (r[7] = N("和老师聊聊", -1)), R(B, { name: "arrow" })], 8, ea)])
    ], 64))]));
  }
}), aa = ta, na = { class: "learning-records-page" }, la = { class: "learning-page-heading" }, ia = {
  key: 0,
  class: "learning-muted"
}, sa = { class: "learning-muted" }, ra = {
  key: 0,
  class: "learning-muted"
}, oa = ["disabled", "onClick"], ua = ["disabled"], da = {
  key: 0,
  class: "learning-empty-note"
}, va = ["disabled", "onClick"], ca = { key: 0 }, ga = {
  key: 1,
  class: "learning-row"
}, ba = ["disabled"], ma = { class: "learning-muted" }, ya = ["disabled"], ka = /* @__PURE__ */ P({
  __name: "LearningRecords",
  props: {
    state: {},
    disabled: { type: Boolean }
  },
  emits: ["action", "remove"],
  setup(e, { emit: l }) {
    const k = e, o = l;
    _(() => k.state.record ? (o("action", "records", { offset: k.state.records.offset }), !0) : !1);
    const g = {
      unassessed: "尚待练习",
      review: "待复核",
      independent: "已能独立使用",
      practised: "练过一次",
      strengthen: "再练练"
    };
    return (c, p) => (a(), n("section", na, [t("div", la, [p[5] || (p[5] = t("h1", null, "学习记录", -1)), e.state.records.total ? (a(), n("span", ia, u(e.state.records.total) + " 项", 1)) : m("", !0)]), e.state.record ? (a(), n(S, { key: 0 }, [
      t("button", {
        type: "button",
        onClick: p[0] || (p[0] = (h) => c.$emit("action", "records", { offset: e.state.records.offset }))
      }, "‹ 返回记录"),
      t("h2", null, u(e.state.record.label), 1),
      (a(!0), n(S, null, T(e.state.record.evidence, (h) => (a(), n("article", {
        key: h.attempt.id,
        class: "learning-record-evidence"
      }, [
        t("p", sa, u(new Date(h.attempt.submittedAt).toLocaleDateString()), 1),
        t("h3", null, u(h.exercise.prompt), 1),
        (a(!0), n(S, null, T(h.materials, (v) => (a(), n("details", { key: v.id }, [t("summary", null, u(v.title), 1), v.hidden ? (a(), n("p", ra, "听力文稿尚未展开；原答和反馈如下。")) : (a(!0), n(S, { key: 1 }, T(v.paragraphs, (r) => (a(), n("p", { key: r.id }, u(r.text), 1))), 128))]))), 128)),
        R(ve, {
          attempt: h.attempt,
          feedback: h.assessment,
          response: h.exercise.response,
          paragraphs: h.materials.flatMap((v) => v.paragraphs),
          disabled: e.disabled,
          onAction: p[1] || (p[1] = (v, r) => c.$emit("action", v, r))
        }, null, 8, [
          "attempt",
          "feedback",
          "response",
          "paragraphs",
          "disabled"
        ]),
        t("button", {
          type: "button",
          disabled: e.disabled,
          onClick: (v) => c.$emit("remove", "delete-attempt", { id: h.attempt.id }, "删除这条原答和依赖它的反馈？相关学习项会重新计算，不撤回已到账奖励。")
        }, "删除这条原答", 8, oa)
      ]))), 128)),
      t("button", {
        type: "button",
        disabled: e.disabled,
        onClick: p[2] || (p[2] = (h) => c.$emit("remove", "delete-item", { id: e.state.record.id }, "删除这个学习项及其不再被引用的证据？当前课程不会被删除。"))
      }, "删除学习项", 8, ua)
    ], 64)) : (a(), n(S, { key: 1 }, [
      e.state.records.total ? m("", !0) : (a(), n("p", da, "暂无学习记录")),
      (a(!0), n(S, null, T(e.state.records.items, (h) => (a(), n("button", {
        key: h.id,
        class: "learning-record-row",
        type: "button",
        disabled: !h.readable,
        onClick: (v) => c.$emit("action", "records", {
          id: h.id,
          offset: e.state.records.offset
        })
      }, [t("span", null, [t("strong", null, u(h.label), 1), t("small", null, [N(u(h.evidenceCount) + " 份作答依据", 1), h.nextReviewAt ? (a(), n("span", ca, " · 建议 " + u(new Date(h.nextReviewAt).toLocaleDateString()) + " 再练", 1)) : m("", !0)])]), t("em", null, u(g[h.state]), 1)], 8, va))), 128)),
      e.state.records.total > 30 ? (a(), n("div", ga, [
        t("button", {
          type: "button",
          disabled: e.state.records.offset === 0,
          onClick: p[3] || (p[3] = (h) => c.$emit("action", "records", { offset: Math.max(0, e.state.records.offset - 30) }))
        }, "上一页", 8, ba),
        t("span", ma, u(e.state.records.total) + " 项", 1),
        t("button", {
          type: "button",
          disabled: e.state.records.offset + 30 >= e.state.records.total,
          onClick: p[4] || (p[4] = (h) => c.$emit("action", "records", { offset: e.state.records.offset + 30 }))
        }, "下一页", 8, ya)
      ])) : m("", !0)
    ], 64))]));
  }
}), fa = ka, se = {
  initial: "我想跟你学这门语言，先聊聊吧。",
  returning: "我来继续学语言了，先聊聊今天从哪里开始吧。"
}, pa = { class: "learning-messages" }, $a = {
  key: 0,
  class: "learning-reasoning",
  role: "status"
}, ha = { class: "learning-tool-name" }, Ca = { class: "learning-tool-status" }, wa = { class: "learning-tool-details" }, xa = {
  key: 0,
  class: "learning-tool-error"
}, Ia = /* @__PURE__ */ P({
  __name: "LearningMessages",
  props: {
    messages: {},
    running: { type: Boolean }
  },
  setup(e) {
    const l = e, k = H(() => {
      const v = [];
      for (const r of l.messages) r.role === "assistant" ? v.push({
        message: r,
        results: []
      }) : r.role === "tool" && v.at(-1)?.results.push(r);
      return v.map((r) => ({
        message: r.message,
        tools: (r.message.toolCalls ?? []).map((b) => {
          const y = r.results.find((f) => f.toolCallId === b.id);
          return {
            call: b,
            result: y,
            status: r.message.streaming ? "generating" : y?.streaming ? "running" : y?.content ? y.error || c(y.content) ? "failed" : "done" : l.running && !r.message.error ? "pending" : "cancelled"
          };
        })
      }));
    }), o = {
      LearningRead: "读取学习记录",
      LearningContextRead: "查看背景资料",
      LearningSearch: "搜索教材",
      LearningExtract: "读取原文",
      LearningProfileEdit: "更新学习目标",
      LearningLessonEdit: "编排课件",
      LearningAnswer: "记录原答",
      LearningAssess: "评估作答",
      LearningHelp: "确认讲解范围",
      LearningPresent: "安排学习活动",
      LearningComplete: "总结本课"
    }, g = {
      generating: "生成参数中",
      pending: "待执行",
      running: "执行中",
      done: "已完成",
      failed: "失败",
      cancelled: "未执行"
    };
    function c(v) {
      try {
        return JSON.parse(v)?.ok === !1;
      } catch {
        return !1;
      }
    }
    function p(v) {
      try {
        return JSON.stringify(JSON.parse(v), null, 2);
      } catch {
        return v;
      }
    }
    function h(v) {
      if (!v) return "";
      try {
        const r = JSON.parse(v);
        return r.errors?.map((b) => b.message).join("；") || r.message || r.error || "工具返回失败，展开查看结果。";
      } catch {
        return v;
      }
    }
    return (v, r) => (a(), n("div", pa, [(a(!0), n(S, null, T(k.value, (b, y) => (a(), n(S, { key: y }, [
      b.message.hasReasoning && b.message.streaming && !b.message.content && !b.tools.length ? (a(), n("p", $a, "正在思考…")) : m("", !0),
      b.message.content ? (a(), n("div", {
        key: 1,
        class: W(["learning-output", { "is-streaming": b.message.streaming }])
      }, [b.message.content ? (a(), E(ke, {
        key: 0,
        class: "learning-markdown",
        text: b.message.content
      }, null, 8, ["text"])) : m("", !0)], 2)) : m("", !0),
      (a(!0), n(S, null, T(b.tools, (f) => (a(), n("div", {
        key: f.call.id,
        class: W(["learning-tool-entry", `is-${f.status}`])
      }, [t("details", null, [t("summary", null, [t("span", ha, [N(u(o[f.call.name] || f.call.name), 1), t("code", null, u(f.call.name), 1)]), t("span", Ca, u(g[f.status]), 1)]), t("div", wa, [
        r[1] || (r[1] = t("h3", null, "参数摘要", -1)),
        t("pre", null, u(p(f.call.arguments)), 1),
        f.result?.content ? (a(), n(S, { key: 0 }, [r[0] || (r[0] = t("h3", null, "结果摘要", -1)), t("pre", null, u(p(f.result.content)), 1)], 64)) : m("", !0)
      ])]), f.status === "failed" ? (a(), n("p", xa, u(h(f.result?.content)), 1)) : m("", !0)], 2))), 128))
    ], 64))), 128))]));
  }
}), La = Ia, Sa = { class: "learning-conversation" }, Aa = { class: "learning-conversation-heading" }, Ma = { class: "learning-person-initial" }, Ta = ["disabled"], Ra = {
  key: 0,
  class: "learning-history-notice"
}, Va = { class: "learning-conversation-user" }, Na = ["disabled", "onClick"], Ba = {
  key: 2,
  class: "learning-conversation-tools"
}, Ua = ["disabled"], qa = ["disabled"], Oa = {
  key: 1,
  class: "learning-working",
  role: "status"
}, Da = {
  key: 2,
  class: "learning-conversation-empty"
}, ja = ["disabled"], Ha = { key: 2 }, Ea = { class: "learning-composer-surface" }, Pa = {
  key: 0,
  class: "learning-composer-quote"
}, Za = { class: "learning-composer-row" }, Fa = ["maxlength", "onKeydown"], Ka = [
  "type",
  "disabled",
  "aria-label",
  "title"
], za = /* @__PURE__ */ P({
  __name: "LearningConversation",
  props: {
    state: {},
    disabled: { type: Boolean },
    pending: { type: Boolean }
  },
  emits: [
    "action",
    "present",
    "profile"
  ],
  setup(e, { expose: l, emit: k }) {
    const o = e, g = k, c = M(""), p = M(null), h = M(null), v = M(null);
    let r = !0, b = null, y = 0, f = "", C = 0;
    function j() {
      const A = h.value;
      A && (r = A.scrollHeight - A.scrollTop - A.clientHeight < 70);
    }
    async function V() {
      await Q(), r && h.value && (h.value.scrollTop = h.value.scrollHeight);
    }
    function K() {
      const A = p.value;
      A?.clientWidth && (A.style.height = "auto", A.style.height = `${A.scrollHeight}px`, V());
    }
    U(c, K, { flush: "post" }), U(p, (A) => {
      if (b?.disconnect(), cancelAnimationFrame(y), !A) return;
      let x = 0;
      b = new ResizeObserver(([$]) => {
        $.contentRect.width !== x && (x = $.contentRect.width, cancelAnimationFrame(y), y = requestAnimationFrame(K));
      }), b.observe(A.parentElement);
    }, { flush: "post" }), re(V), oe(() => {
      b?.disconnect(), cancelAnimationFrame(y);
    }), U(() => o.state.conversation.turns.length + o.state.conversation.removedTurns, (A) => {
      const x = o.state.conversation.turns.at(-1), $ = v.value?.selection ? `${f}

${v.value.selection.quote}` : f;
      A > C && x?.user === $ && c.value.trim() === f && (c.value = "", f = "", v.value = null);
    }), U([
      () => o.state.chatIdentity,
      () => o.state.language,
      () => o.state.teacher?.name
    ], () => {
      c.value = "", f = "", v.value = null;
    }), U(() => o.state.unit?.id, () => {
      v.value = null;
    }), U(() => o.state.conversation.turns.length, (A, x) => {
      !A && x && !o.state.busy && (c.value = "", f = "");
    });
    function q() {
      o.disabled || !c.value.trim() || (f = c.value.trim(), C = o.state.conversation.turns.length + o.state.conversation.removedTurns, g("action", v.value ? "explain" : "talk", {
        message: f,
        ...v.value ?? {}
      }));
    }
    U(() => o.state.conversation.turns.length, (A, x) => {
      A > x && (r = !0), V();
    }), U([
      () => o.state.conversation.turns,
      () => o.state.busy,
      () => o.state.message
    ], V);
    function z(A) {
      return A.kind === "replacement" ? !o.disabled && o.state.currentUnitId === A.unitId : o.state.unit?.id === A.unitId && (A.kind === "exercise" ? o.state.unit.exercises : o.state.unit.materials).some((x) => x.id === A.id);
    }
    return l({
      async ask(A, x) {
        v.value = {
          exerciseId: A,
          selection: x
        }, await Q(), p.value?.focus();
      },
      focus: () => p.value?.focus({ preventScroll: !0 })
    }), (A, x) => (a(), n("section", Sa, [
      t("header", Aa, [
        t("span", Ma, u([...e.state.teacher?.name ?? "师"][0]), 1),
        t("h1", null, u(e.state.teacher?.name ?? "老师"), 1),
        t("button", {
          type: "button",
          disabled: e.disabled,
          "aria-label": "更换学习语言和老师",
          onClick: x[0] || (x[0] = ($) => g("profile"))
        }, u(new Intl.DisplayNames(["zh-CN"], { type: "language" }).of(e.state.language)), 9, Ta)
      ]),
      t("div", {
        ref_key: "scroller",
        ref: h,
        class: "learning-conversation-turns",
        "aria-label": "师生对话",
        onScroll: j
      }, [
        e.state.conversation.removedTurns ? (a(), n("p", Ra, "较早对话已整理为课堂记忆。")) : m("", !0),
        (a(!0), n(S, null, T(e.state.conversation.turns, ($, w) => (a(), n("div", {
          key: w,
          class: "learning-conversation-turn"
        }, [
          t("p", Va, u($.user), 1),
          R(La, {
            messages: $.messages,
            running: $.status === "running"
          }, null, 8, ["messages", "running"]),
          $.message ? (a(), n("p", {
            key: 0,
            class: W(["learning-turn-notice", { "is-error": $.status === "failed" }]),
            role: "status"
          }, u($.message), 3)) : m("", !0),
          $.presentation ? (a(), n("button", {
            key: 1,
            type: "button",
            class: "learning-activity-link",
            disabled: !z($.presentation),
            onClick: (L) => g("present", $.presentation)
          }, [
            R(B, { name: $.presentation.kind === "material" ? "book" : "records" }, null, 8, ["name"]),
            t("span", null, u($.presentation.title), 1),
            R(B, { name: "arrow" })
          ], 8, Na)) : m("", !0),
          w === e.state.conversation.turns.length - 1 && e.state.reply?.text === $.teacher ? (a(), n("div", Ba, [[...$.teacher].length <= 1e3 ? (a(), n("button", {
            key: 0,
            type: "button",
            disabled: e.disabled,
            onClick: x[1] || (x[1] = (L) => g("action", "say-reply"))
          }, [R(B, { name: "sound" }), x[8] || (x[8] = N("听老师说", -1))], 8, Ua)) : m("", !0), e.state.reply.exerciseId && [...$.teacher].length <= 4e3 ? (a(), n("button", {
            key: 1,
            type: "button",
            disabled: e.disabled || e.state.unit?.notes.some((L) => L.text === $.teacher),
            onClick: x[2] || (x[2] = (L) => g("action", "save-note"))
          }, "保存笔记", 8, qa)) : m("", !0)])) : m("", !0)
        ]))), 128)),
        e.state.busy ? (a(), n("div", Oa, [x[9] || (x[9] = t("span", {
          class: "learning-working-dot",
          "aria-hidden": "true"
        }, null, -1)), t("span", null, u(e.state.message || "老师正在回复…"), 1)])) : m("", !0),
        !e.state.conversation.turns.length && !e.state.busy ? (a(), n("div", Da, [
          R(B, { name: "chat" }),
          t("p", null, u(e.state.teacher ? "今天想学什么？" : "先选一位老师"), 1),
          e.state.teacher ? (a(), n("button", {
            key: 1,
            type: "button",
            disabled: e.disabled,
            onClick: x[4] || (x[4] = ($) => g("action", "talk", { message: e.state.profile ? s(se).returning : s(se).initial }))
          }, u(e.state.profile ? "继续学习" : "开始交流"), 9, ja)) : (a(), n("button", {
            key: 0,
            class: "learning-primary",
            type: "button",
            onClick: x[3] || (x[3] = ($) => g("profile"))
          }, "选择老师")),
          e.state.teacher ? (a(), n("small", Ha, "交流与教学会调用模型")) : m("", !0)
        ])) : m("", !0)
      ], 544),
      e.state.teacher ? (a(), n("form", {
        key: 0,
        class: "learning-conversation-compose",
        onSubmit: F(q, ["prevent"])
      }, [t("div", Ea, [v.value ? (a(), n("div", Pa, [t("span", null, u(v.value.selection?.quote ?? "请教这道题"), 1), t("button", {
        type: "button",
        "aria-label": "取消引用",
        onClick: x[5] || (x[5] = ($) => v.value = null)
      }, "×")])) : m("", !0), t("div", Za, [Z(t("textarea", {
        ref_key: "composer",
        ref: p,
        "onUpdate:modelValue": x[6] || (x[6] = ($) => c.value = $),
        rows: "1",
        maxlength: v.value?.selection ? 1800 : v.value?.exerciseId ? 2e3 : 4e3,
        "aria-label": "和老师说",
        placeholder: "和老师说…",
        onKeydown: [X(F(q, ["ctrl", "prevent"]), ["enter"]), X(F(q, ["meta", "prevent"]), ["enter"])]
      }, null, 40, Fa), [[Y, c.value]]), t("button", {
        type: e.state.busy ? "button" : "submit",
        class: W(e.state.busy ? "learning-composer-stop" : "learning-primary"),
        disabled: e.state.busy ? e.pending : e.disabled || !c.value.trim(),
        "aria-label": e.state.busy ? "停止回复" : "发送给老师",
        title: e.state.busy ? "停止回复" : "发送给老师",
        onClick: x[7] || (x[7] = F(($) => e.state.busy ? g("action", "cancel") : q(), ["prevent"]))
      }, [R(B, { name: e.state.busy ? "stop" : "send" }, null, 8, ["name"])], 10, Ka)])])], 32)) : m("", !0)
    ]));
  }
}), Ja = za;
function Ga(e) {
  const l = me(structuredClone(ye(e.initialState))), k = M(!1), o = M("");
  let g = !1, c = 0, p = () => {
  };
  const h = H(() => !k.value && !l.value.busy && l.value.storage === "ready");
  async function v(r, b = {}) {
    if (k.value) return;
    k.value = !0, o.value = "";
    const y = l.value.chatIdentity, f = c;
    try {
      const C = await e.bridge.request(`learning/${r}`, {
        chatIdentity: y,
        ...b
      }, 35e3);
      return !g || l.value.chatIdentity !== y ? void 0 : (c === f && C.result.state.chatIdentity === y && (l.value = C.result.state), C.result);
    } catch {
      g && l.value.chatIdentity === y && (o.value = "暂时没收到操作结果。请先重新加载，确认是否已保存，不要重复提交或生成。");
    } finally {
      g && (k.value = !1);
    }
  }
  return re(() => {
    g = !0, p = e.bridge.subscribe((r) => {
      if (r.type === "learning/media") {
        l.value = {
          ...l.value,
          media: r.payload.media
        };
        return;
      }
      if (r.type !== "learning/state") return;
      const b = r.payload.state;
      b.chatIdentity === l.value.chatIdentity && (c++, l.value = b, o.value = "");
    });
  }), oe(() => {
    g = !1, p();
  }), {
    state: l,
    pending: k,
    writable: h,
    localMessage: o,
    request: v
  };
}
var Wa = {
  class: "learning-app",
  "aria-label": "语伴语言学习"
}, Qa = { class: "learning-toolbar" }, Xa = { "aria-label": "学习资料与设置" }, Ya = { "aria-label": "学习资料与设置" }, _a = ["onClick"], en = {
  key: 0,
  class: "learning-notice",
  role: "status",
  "aria-live": "polite"
}, tn = { class: "learning-row" }, an = ["disabled"], nn = ["disabled"], ln = ["disabled"], sn = ["disabled"], rn = {
  key: 0,
  class: "learning-working",
  role: "status"
}, on = ["disabled"], un = {
  key: 2,
  class: "learning-materials-page"
}, dn = {
  key: 0,
  class: "learning-empty-note"
}, vn = { class: "learning-materials-title" }, cn = ["onClick"], gn = ["onClick"], bn = {
  key: 0,
  class: "learning-notes"
}, mn = { key: 0 }, yn = ["disabled", "onClick"], kn = {
  key: 3,
  class: "learning-goals-page"
}, fn = { key: 0 }, pn = { key: 1 }, $n = { key: 2 }, hn = {
  key: 1,
  class: "learning-empty-note"
}, Cn = {
  key: 5,
  class: "learning-harvest-page"
}, wn = {
  key: 0,
  class: "learning-empty-note"
}, xn = { class: "learning-muted" }, In = ["disabled", "onClick"], Ln = ["disabled"], Sn = ["disabled"], An = {
  key: 3,
  class: "learning-row"
}, Mn = ["disabled"], Tn = ["disabled"], Rn = {
  key: 6,
  class: "learning-settings-page"
}, Vn = ["value", "disabled"], Nn = ["value"], Bn = {
  key: 0,
  class: "learning-muted"
}, Un = ["value", "disabled"], qn = ["disabled"], On = ["disabled"], Dn = ["disabled"], jn = ["disabled"], Hn = ["disabled"], En = ["disabled"], Pn = ["disabled"], Zn = {
  role: "alertdialog",
  "aria-labelledby": "learning-confirm-title",
  class: "learning-confirm"
}, Fn = { class: "learning-row" }, Kn = ["disabled"], zn = /* @__PURE__ */ P({
  __name: "LearningApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(e) {
    const { state: l, pending: k, writable: o, localMessage: g, request: c } = Ga(e), p = M(l.value.teacher ? "teacher" : "profile"), h = [], v = M(null), r = M(!1);
    _(() => v.value?.open ? (v.value.open = !1, !0) : !1, () => r.value);
    const b = M(null), y = M(null), f = M(null), C = {};
    let j = 0;
    U(() => !!l.value.record, async (I, i) => {
      p.value !== "records" || I === i || (I && (j = f.value?.scrollTop ?? 0), await Q(), p.value === "records" && f.value && (f.value.scrollTop = I ? 0 : j));
    });
    const V = M(null), K = M(null);
    ue(K, () => {
      V.value = null;
    });
    const q = M(l.value.profile?.voice?.voiceId ?? l.value.voices.defaultVoice), z = M(l.value.profile?.voice?.language ?? l.value.language), A = M(l.value.profile?.voice?.speed ?? 1), x = M(0), $ = H(() => l.value.completions.slice(x.value * 20, (x.value + 1) * 20));
    U([() => l.value.language, () => l.value.profile?.voice], ([I, i]) => {
      q.value = i?.voiceId ?? l.value.voices.defaultVoice, z.value = i?.language ?? I, A.value = i?.speed ?? 1;
    }), U([
      () => l.value.chatIdentity,
      () => l.value.language,
      () => l.value.teacher?.name
    ], () => {
      y.value = null, V.value = null, x.value = 0;
    }), U(() => l.value.currentUnitId, (I) => {
      V.value?.action === "replace-lesson" && V.value.input.unitId !== I && (V.value = null);
    }), U(() => l.value.unit, (I) => {
      const i = y.value;
      i && (I?.id !== i.unitId || !(i.kind === "exercise" ? I.exercises : I.materials).some((d) => d.id === i.id)) && L();
    }), U(() => {
      const I = l.value.conversation.turns.at(-1)?.presentation;
      return I ? `${l.value.conversation.turns.length + l.value.conversation.removedTurns}:${I.unitId}:${I.kind}:${I.id}` : "";
    }, (I) => {
      const i = l.value.conversation.turns.at(-1)?.presentation;
      I && i && w(i);
    });
    function w(I) {
      if (I.kind === "replacement") {
        if (l.value.currentUnitId !== I.unitId || l.value.storage !== "ready") return;
        J("replace-lesson", {
          unitId: I.unitId,
          message: I.message
        }, "换一课？新课保存成功后会替换当前课件、原答和笔记；学习记录和已获得的奖励资格保留。");
        return;
      }
      l.value.unit?.id === I.unitId && (y.value = I);
    }
    function L() {
      y.value = null, c("stop");
    }
    async function O(I, i) {
      L(), await D("teacher"), await b.value?.ask(I, i);
    }
    async function D(I, i = !1) {
      if (I !== p.value && !i) if (I === "teacher") h.length = 0;
      else {
        const d = h.indexOf(I);
        d >= 0 ? h.splice(d) : h.push(p.value);
      }
      if (f.value && (C[p.value] = f.value.scrollTop), v.value && (v.value.open = !1), p.value = I, await Q(), f.value) {
        f.value.scrollTop = C[I] ?? 0;
        const d = [...f.value.querySelectorAll("h1")].find((G) => G.offsetParent !== null);
        d && (d.tabIndex = -1, d.focus({ preventScroll: !0 }));
      }
    }
    const te = _(() => v.value?.open ? (v.value.open = !1, !0) : p.value === "teacher" || !h.length && p.value === "profile" && !l.value.teacher ? !1 : (D(h.pop() ?? "teacher", !0), !0));
    function J(I, i, d) {
      V.value = {
        action: I,
        input: i,
        text: d
      };
    }
    async function ge() {
      const I = await c("export");
      if (!I?.document) return;
      const i = URL.createObjectURL(new Blob([JSON.stringify(I.document, null, 2)], { type: "application/json" })), d = document.createElement("a");
      d.href = i, d.download = "LittleWhiteBox_Learning.json", d.click(), setTimeout(() => URL.revokeObjectURL(i), 1e3);
    }
    return (I, i) => (a(), n("section", Wa, [
      t("header", Qa, [
        p.value !== "teacher" && (s(l).teacher || h.length) ? (a(), n("button", {
          key: 0,
          type: "button",
          class: "learning-toolbar-back",
          "aria-label": "返回上一页",
          onClick: i[0] || (i[0] = (...d) => s(te) && s(te)(...d))
        }, [R(B, { name: "back" })])) : m("", !0),
        t("button", {
          type: "button",
          class: "learning-wordmark",
          onClick: i[1] || (i[1] = (d) => D("teacher"))
        }, [...i[31] || (i[31] = [t("span", {
          class: "learning-brand-mark",
          "aria-hidden": "true"
        }, [N("a"), t("span", null, "あ")], -1), N("语伴", -1)])]),
        t("details", {
          ref_key: "menu",
          ref: v,
          class: "learning-menu",
          onToggle: i[2] || (i[2] = (d) => r.value = !!v.value?.open),
          onKeydown: i[3] || (i[3] = X(F((d) => v.value.open = !1, ["stop", "prevent"]), ["esc"]))
        }, [t("summary", Xa, [R(B, { name: "more" })]), t("nav", Ya, [(a(), n(S, null, T([
          ["materials", "课件与笔记"],
          ["records", "学习记录"],
          ["goals", "学习目标"],
          ["harvest", "我的收获"],
          ["settings", "设置"]
        ], ([d, G]) => t("button", {
          key: d,
          type: "button",
          onClick: (Jn) => D(d)
        }, u(G), 9, _a)), 64))])], 544)
      ]),
      !s(l).busy && (s(l).message || s(g) || s(l).storage !== "ready") ? (a(), n("div", en, [N(u(s(g) || s(l).message || (s(l).storage === "unconfirmed" ? "还不确定上次是否保存成功，请先检查保存。" : s(l).storage === "conflict" ? "服务器上的学习记录与当前内容不同，请先检查保存。" : "暂时无法读取学习文件。")) + " ", 1), t("div", tn, [
        s(l).storage === "unconfirmed" || s(l).storage === "conflict" ? (a(), n("button", {
          key: 0,
          type: "button",
          disabled: s(k),
          onClick: i[4] || (i[4] = (d) => s(c)("verify"))
        }, "检查保存", 8, an)) : m("", !0),
        s(l).storage === "unconfirmed" ? (a(), n("button", {
          key: 1,
          type: "button",
          disabled: s(k),
          onClick: i[5] || (i[5] = (d) => s(c)("retry-save"))
        }, "重试保存", 8, nn)) : m("", !0),
        s(l).storage === "conflict" ? (a(), n("button", {
          key: 2,
          type: "button",
          disabled: s(k),
          onClick: i[6] || (i[6] = (d) => J("adopt-server", {}, "使用服务器上已保存的学习记录？这次尚未确认保存的修改将被放弃。"))
        }, "使用已保存版本", 8, ln)) : m("", !0),
        s(l).storage === "unloaded" || s(g) ? (a(), n("button", {
          key: 3,
          type: "button",
          disabled: s(k),
          onClick: i[7] || (i[7] = (d) => s(c)("read"))
        }, "重新加载", 8, sn)) : m("", !0)
      ])])) : m("", !0),
      Z(R(Ja, {
        ref_key: "conversation",
        ref: b,
        state: s(l),
        disabled: !s(o),
        pending: s(k),
        onAction: s(c),
        onPresent: w,
        onProfile: i[8] || (i[8] = (d) => D("profile"))
      }, null, 8, [
        "state",
        "disabled",
        "pending",
        "onAction"
      ]), [[ae, p.value === "teacher"]]),
      Z(t("div", {
        ref_key: "scroller",
        ref: f,
        class: "learning-scroll"
      }, [
        s(l).busy ? (a(), n("div", rn, [
          i[32] || (i[32] = t("span", {
            class: "learning-working-dot",
            "aria-hidden": "true"
          }, null, -1)),
          t("span", null, u(s(l).message || "正在处理你的请求…"), 1),
          t("button", {
            type: "button",
            disabled: s(k),
            onClick: i[9] || (i[9] = (d) => s(c)("cancel"))
          }, "停止", 8, on)
        ])) : m("", !0),
        p.value === "profile" ? (a(), E(aa, {
          key: 1,
          state: s(l),
          disabled: !s(o),
          onAction: s(c),
          onDone: i[10] || (i[10] = (d) => D("teacher"))
        }, null, 8, [
          "state",
          "disabled",
          "onAction"
        ])) : m("", !0),
        p.value === "materials" ? (a(), n("section", un, [
          i[33] || (i[33] = t("h1", null, "课件与笔记", -1)),
          s(l).unit ? m("", !0) : (a(), n("p", dn, u(s(l).blockedUnit ? "当前课件在另一个故事中" : "还没有课件"), 1)),
          s(l).unit ? (a(), n(S, { key: 1 }, [
            t("p", vn, u(s(l).unit.title), 1),
            (a(!0), n(S, null, T(s(l).unit.materials, (d) => (a(), n("button", {
              key: d.id,
              type: "button",
              class: "learning-activity-link",
              onClick: (G) => w({
                unitId: s(l).unit.id,
                kind: "material",
                id: d.id,
                title: d.title
              })
            }, [
              R(B, { name: "book" }),
              t("span", null, u(d.title), 1),
              R(B, { name: "arrow" })
            ], 8, cn))), 128)),
            (a(!0), n(S, null, T(s(l).unit.exercises, (d) => (a(), n("button", {
              key: d.id,
              type: "button",
              class: "learning-activity-link",
              onClick: (G) => w({
                unitId: s(l).unit.id,
                kind: "exercise",
                id: d.id,
                title: d.prompt
              })
            }, [
              R(B, { name: "records" }),
              t("span", null, u(d.prompt), 1),
              R(B, { name: "arrow" })
            ], 8, gn))), 128)),
            s(l).unit.notes.length ? (a(), n("section", bn, [(a(!0), n(S, null, T(s(l).unit.notes, (d) => (a(), n("article", { key: d.id }, [
              d.selection ? (a(), n("blockquote", mn, u(d.selection.quote), 1)) : m("", !0),
              t("p", null, u(d.text), 1),
              t("button", {
                type: "button",
                disabled: !s(o),
                onClick: (G) => s(c)("delete-note", { id: d.id })
              }, "删除笔记", 8, yn)
            ]))), 128))])) : m("", !0)
          ], 64)) : m("", !0)
        ])) : m("", !0),
        p.value === "goals" ? (a(), n("section", kn, [
          i[35] || (i[35] = t("h1", null, "学习目标", -1)),
          s(l).profile ? (a(), n(S, { key: 0 }, [
            t("p", null, u(s(l).profile.goal.description), 1),
            s(l).profile.goal.exam ? (a(), n("p", fn, u(s(l).profile.goal.exam), 1)) : m("", !0),
            s(l).profile.goal.targetLevel ? (a(), n("p", pn, u(s(l).profile.goal.targetLevel), 1)) : m("", !0),
            s(l).profile.goal.targetDate ? (a(), n("p", $n, u(s(l).profile.goal.targetDate), 1)) : m("", !0),
            i[34] || (i[34] = t("h2", null, "自评水平", -1)),
            t("p", null, u(s(l).profile.selfAssessment), 1)
          ], 64)) : (a(), n("p", hn, "还没有记录目标")),
          t("button", {
            type: "button",
            class: "learning-primary",
            onClick: i[11] || (i[11] = (d) => {
              D("teacher"), b.value?.focus();
            })
          }, "和老师聊聊")
        ])) : m("", !0),
        p.value === "records" ? (a(), E(fa, {
          key: 4,
          state: s(l),
          disabled: !s(o),
          onAction: s(c),
          onRemove: J
        }, null, 8, [
          "state",
          "disabled",
          "onAction"
        ])) : m("", !0),
        p.value === "harvest" ? (a(), n("section", Cn, [
          i[37] || (i[37] = t("div", { class: "learning-page-heading" }, [t("h1", null, "我的收获")], -1)),
          s(l).completions.length ? m("", !0) : (a(), n("p", wn, "还没有完成的课程")),
          (a(!0), n(S, null, T($.value, (d) => (a(), n("article", {
            key: d.unitId,
            class: "learning-harvest-entry"
          }, [
            t("small", null, u(new Date(d.completedAt).toLocaleDateString()), 1),
            t("h2", null, [N("+" + u(d.amount), 1), i[36] || (i[36] = t("span", null, "小白币", -1))]),
            t("p", null, u(d.summary), 1),
            t("p", xn, u(d.rewardStatus === "paid" ? "已到账" : d.rewardStatus === "retired" ? "经济重置前的课程，不再补发奖励" : "学习已完成，等待到账"), 1),
            d.rewardStatus !== "paid" && d.rewardStatus !== "retired" ? (a(), n("button", {
              key: 0,
              type: "button",
              disabled: !s(o) || s(l).walletStorage !== "ready",
              onClick: (G) => s(c)("reward", {
                unitId: d.unitId,
                openWallet: !s(l).walletOpen
              })
            }, u(s(l).walletOpen ? "检查并补领" : "开通钱包并领取"), 9, In)) : m("", !0)
          ]))), 128)),
          s(l).walletStorage === "unconfirmed" || s(l).walletStorage === "conflict" || s(l).walletStorage === "failed" ? (a(), n("button", {
            key: 1,
            type: "button",
            disabled: s(k) || s(l).busy,
            onClick: i[12] || (i[12] = (d) => s(c)("verify-wallet"))
          }, "检查账本保存", 8, Ln)) : m("", !0),
          s(l).walletStorage === "conflict" ? (a(), n("button", {
            key: 2,
            type: "button",
            disabled: s(k) || s(l).busy,
            onClick: i[13] || (i[13] = (d) => J("adopt-wallet", {}, "使用服务器上已保存的全局账本？这次尚未确认保存的修改将被放弃。"))
          }, "使用已保存账本", 8, Sn)) : m("", !0),
          s(l).completions.length > 20 ? (a(), n("div", An, [t("button", {
            type: "button",
            disabled: x.value === 0,
            onClick: i[14] || (i[14] = (d) => x.value--)
          }, "上一页", 8, Mn), t("button", {
            type: "button",
            disabled: (x.value + 1) * 20 >= s(l).completions.length,
            onClick: i[15] || (i[15] = (d) => x.value++)
          }, "下一页", 8, Tn)])) : m("", !0)
        ])) : m("", !0),
        p.value === "settings" ? (a(), n("section", Rn, [
          i[46] || (i[46] = t("h1", null, "学习设置", -1)),
          t("label", null, [i[38] || (i[38] = N("当前语言", -1)), t("select", {
            value: s(l).language,
            disabled: !s(o),
            onChange: i[16] || (i[16] = (d) => s(c)("language", { language: d.target.value }))
          }, [(a(!0), n(S, null, T([.../* @__PURE__ */ new Set([s(l).language, ...s(l).languages])], (d) => (a(), n("option", {
            key: d,
            value: d
          }, u(new Intl.DisplayNames(["zh-CN"], { type: "language" }).of(d)), 9, Nn))), 128))], 40, Vn)]),
          t("button", {
            type: "button",
            onClick: i[17] || (i[17] = (d) => D("profile"))
          }, "更换语言和老师 →"),
          t("section", null, [
            i[43] || (i[43] = t("h2", null, "老师的声音", -1)),
            s(l).voices.enabled ? (a(), n("form", {
              key: 1,
              onSubmit: i[21] || (i[21] = F((d) => s(c)("voice", { voice: {
                voiceId: q.value,
                language: z.value,
                speed: Number(A.value)
              } }), ["prevent"]))
            }, [
              t("label", null, [i[39] || (i[39] = N("音色", -1)), Z(t("select", { "onUpdate:modelValue": i[18] || (i[18] = (d) => q.value = d) }, [(a(!0), n(S, null, T(s(l).voices.voices, (d) => (a(), n("option", {
                key: d.id,
                value: d.id,
                disabled: !d.available
              }, u(d.name) + u(d.available ? "" : "（暂不可用）"), 9, Un))), 128))], 512), [[ee, q.value]])]),
              t("label", null, [i[40] || (i[40] = N("发音语言", -1)), Z(t("input", {
                "onUpdate:modelValue": i[19] || (i[19] = (d) => z.value = d),
                type: "text",
                maxlength: "80",
                placeholder: "en / ja"
              }, null, 512), [[Y, z.value]])]),
              t("label", null, [i[42] || (i[42] = N("语速", -1)), Z(t("select", { "onUpdate:modelValue": i[20] || (i[20] = (d) => A.value = d) }, [...i[41] || (i[41] = [
                t("option", { value: 0.75 }, "0.75×", -1),
                t("option", { value: 1 }, "1×", -1),
                t("option", { value: 1.25 }, "1.25×", -1)
              ])], 512), [[ee, A.value]])]),
              t("button", {
                type: "submit",
                disabled: !s(o) || !s(l).profile
              }, "保存声音设置", 8, qn)
            ], 32)) : (a(), n("p", Bn, "使用语音前，请先开启 TTS 模块。文字学习不受影响。")),
            t("button", {
              type: "button",
              onClick: i[22] || (i[22] = (d) => s(c)("tts-settings"))
            }, u(s(l).voices.enabled ? "打开 TTS 设置" : "如何开启 TTS"), 1),
            i[44] || (i[44] = t("small", null, "已听过的题保留原声音，新偏好用于之后的题目。", -1))
          ]),
          t("section", null, [
            i[45] || (i[45] = t("h2", null, "学习数据", -1)),
            t("button", {
              type: "button",
              disabled: s(k) || s(l).busy,
              onClick: i[23] || (i[23] = (d) => J("forget-conversation", {}, "清空和当前老师的对话？目标、课件、学习记录和奖励都会保留。"))
            }, "清空师生对话", 8, On),
            t("button", {
              type: "button",
              disabled: !s(o),
              onClick: ge
            }, "导出学习数据", 8, Dn),
            t("button", {
              type: "button",
              disabled: s(k) || s(l).busy,
              onClick: i[24] || (i[24] = (d) => s(c)("read"))
            }, "重新加载", 8, jn),
            s(l).unit || s(l).blockedUnit ? (a(), n("button", {
              key: 0,
              type: "button",
              disabled: !s(o),
              onClick: i[25] || (i[25] = (d) => J("abandon", {}, "放下当前这一课？本课课件、作答和笔记会删除；学习记录中留存的作答和已获得的奖励资格会保留。"))
            }, "放下当前课件", 8, Hn)) : m("", !0),
            t("button", {
              type: "button",
              class: "learning-danger",
              disabled: !s(o) || !s(l).profile,
              onClick: i[26] || (i[26] = (d) => J("delete-language", {}, "删除当前语言的全部学习数据？未领取奖励也将放弃，已到账流水保留。"))
            }, "删除当前语言", 8, En),
            t("button", {
              type: "button",
              class: "learning-danger",
              disabled: !s(o),
              onClick: i[27] || (i[27] = (d) => J("clear", {}, "清空所有语言的目标、课程和记录？未领取奖励也将放弃。已到账流水不撤销。"))
            }, "清空全部学习数据", 8, Pn)
          ])
        ])) : m("", !0)
      ], 512), [[ae, p.value !== "teacher"]]),
      y.value ? m("", !0) : (a(), E(ce, {
        key: 1,
        state: s(l),
        onAction: s(c)
      }, null, 8, ["state", "onAction"])),
      s(l).unit ? (a(), E(Ot, {
        key: `${s(l).chatIdentity}:${s(l).language}:${s(l).unit.id}`,
        state: s(l),
        target: y.value,
        disabled: !s(o),
        onAction: s(c),
        onClose: L,
        onAsk: O
      }, null, 8, [
        "state",
        "target",
        "disabled",
        "onAction"
      ])) : m("", !0),
      V.value ? (a(), n("div", {
        key: 3,
        ref_key: "confirmLayer",
        ref: K,
        class: "learning-confirm-shade",
        onKeydown: i[30] || (i[30] = X(F((d) => V.value = null, ["stop", "prevent"]), ["esc"]))
      }, [t("section", Zn, [
        i[47] || (i[47] = t("h2", { id: "learning-confirm-title" }, "确认这次操作", -1)),
        t("p", null, u(V.value.text), 1),
        t("div", Fn, [t("button", {
          autofocus: "",
          type: "button",
          onClick: i[28] || (i[28] = (d) => V.value = null)
        }, "先不改"), t("button", {
          type: "button",
          class: "learning-primary",
          disabled: s(k) || s(l).busy,
          onClick: i[29] || (i[29] = (d) => {
            s(c)(V.value.action, V.value.input), V.value = null;
          })
        }, "确认", 8, Kn)])
      ])], 544)) : m("", !0)
    ]));
  }
}), Xn = zn;
export {
  Xn as default
};
