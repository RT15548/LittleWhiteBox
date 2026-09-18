/* eslint-disable */
import { n as be, t as me } from "./xiaobai-os-message-markdown-p_WvGylV.js";
import { C as re, E as oe, H as K, J as ye, K as M, L as ke, S as G, Y as s, b as ae, c as P, gt as u, h as j, j as T, k as a, l as y, m as N, mt as Y, o as E, p as V, q as fe, r as A, s as t, u as n, z as B } from "./xiaobai-os-runtime-core.esm-bundler-x_Eikhco.js";
import { a as ee, c as Q, l as F, o as X, s as ne } from "./xiaobai-os-runtime-dom.esm-bundler-DWFjb9Vy.js";
import { n as _, r as ue } from "./xiaobai-os-app-navigation-BcQEoInO.js";
var pe = ["disabled"], he = {
  key: 0,
  class: "learning-choices"
}, $e = [
  "type",
  "checked",
  "onChange"
], Ce = { class: "learning-option-letter" }, xe = {
  key: 1,
  class: "learning-order"
}, we = [
  "disabled",
  "aria-label",
  "onClick"
], Ie = [
  "disabled",
  "aria-label",
  "onClick"
], Le = {
  key: 2,
  class: "learning-fields"
}, Ae = ["onUpdate:modelValue"], Se = ["value"], Me = {
  key: 3,
  class: "learning-choices"
}, Te = ["checked", "onChange"], Ne = {
  key: 0,
  class: "learning-muted"
}, Re = {
  key: 4,
  class: "learning-fields"
}, Ve = ["onUpdate:modelValue"], qe = {
  key: 5,
  class: "learning-writing"
}, Be = ["disabled"], Ue = /* @__PURE__ */ j({
  __name: "AnswerInput",
  props: /* @__PURE__ */ ae({
    response: {},
    paragraphs: {},
    disabled: { type: Boolean }
  }, {
    modelValue: { required: !0 },
    modelModifiers: {}
  }),
  emits: /* @__PURE__ */ ae(["submit"], ["update:modelValue"]),
  setup(e, { emit: l }) {
    const k = e, o = l, g = ke(e, "modelValue");
    function v(r) {
      k.response.kind === "choice" && !k.response.multiple ? g.value.picked = [r] : g.value.picked = g.value.picked.includes(r) ? g.value.picked.filter((b) => b !== r) : [...g.value.picked, r];
    }
    function m(r, b) {
      const f = [...g.value.order];
      [f[r], f[r + b]] = [f[r + b], f[r]], g.value.order = f;
    }
    const h = E(() => {
      const r = k.response;
      return r.kind === "text" ? !!g.value.text.trim() : r.kind === "gaps" ? r.slots.every((b) => g.value.values[b.id]?.trim()) : r.kind === "match" ? r.left.every((b) => g.value.values[b.id]) : r.kind === "order" ? !0 : g.value.picked.length > 0;
    });
    function c() {
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
      onSubmit: F(c, ["prevent"])
    }, [t("fieldset", { disabled: e.disabled }, [
      b[3] || (b[3] = t("legend", { class: "learning-sr-only" }, "你的回答", -1)),
      e.response.kind === "choice" ? (a(), n("div", he, [(a(!0), n(A, null, T(e.response.options, (f, p) => (a(), n("label", {
        key: f.id,
        class: Y({ selected: g.value.picked.includes(f.id) })
      }, [
        t("input", {
          type: e.response.multiple ? "checkbox" : "radio",
          name: "answer-choice",
          checked: g.value.picked.includes(f.id),
          onChange: (C) => v(f.id)
        }, null, 40, $e),
        t("span", Ce, u(String.fromCharCode(65 + p)), 1),
        t("span", null, u(f.text), 1)
      ], 2))), 128))])) : e.response.kind === "order" ? (a(), n("ol", xe, [(a(!0), n(A, null, T(g.value.order, (f, p) => (a(), n("li", { key: f }, [
        t("span", null, u(e.response.options.find((C) => C.id === f)?.text), 1),
        t("button", {
          type: "button",
          disabled: p === 0,
          "aria-label": `上移第 ${p + 1} 项`,
          onClick: (C) => m(p, -1)
        }, "↑", 8, we),
        t("button", {
          type: "button",
          disabled: p === g.value.order.length - 1,
          "aria-label": `下移第 ${p + 1} 项`,
          onClick: (C) => m(p, 1)
        }, "↓", 8, Ie)
      ]))), 128))])) : e.response.kind === "match" ? (a(), n("div", Le, [(a(!0), n(A, null, T(e.response.left, (f) => (a(), n("label", { key: f.id }, [V(u(f.text) + " ", 1), K(t("select", { "onUpdate:modelValue": (p) => g.value.values[f.id] = p }, [b[1] || (b[1] = t("option", { value: "" }, "选择对应项", -1)), (a(!0), n(A, null, T(e.response.right, (p) => (a(), n("option", {
        key: p.id,
        value: p.id
      }, u(p.text), 9, Se))), 128))], 8, Ae), [[ee, g.value.values[f.id]]])]))), 128))])) : e.response.kind === "evidence" ? (a(), n("div", Me, [(a(!0), n(A, null, T(e.paragraphs, (f) => (a(), n("label", {
        key: f.id,
        class: Y({ selected: g.value.picked.includes(f.id) })
      }, [t("input", {
        type: "checkbox",
        checked: g.value.picked.includes(f.id),
        onChange: (p) => v(f.id)
      }, null, 40, Te), t("span", null, u(f.text), 1)], 2))), 128)), e.paragraphs.length ? y("", !0) : (a(), n("p", Ne, "请先展开相关文稿，再选择原文依据。"))])) : e.response.kind === "gaps" ? (a(), n("div", Re, [(a(!0), n(A, null, T(e.response.slots, (f) => (a(), n("label", { key: f.id }, [V(u(f.text), 1), K(t("input", {
        "onUpdate:modelValue": (p) => g.value.values[f.id] = p,
        type: "text",
        maxlength: "4000",
        autocomplete: "off"
      }, null, 8, Ve), [[X, g.value.values[f.id]]])]))), 128))])) : (a(), n("label", qe, [b[2] || (b[2] = t("span", { class: "learning-sr-only" }, "你的回答", -1)), K(t("textarea", {
        "onUpdate:modelValue": b[0] || (b[0] = (f) => g.value.text = f),
        rows: "6",
        maxlength: "4000",
        placeholder: "写下你的回答…"
      }, null, 512), [[X, g.value.text]])])),
      t("button", {
        class: "learning-primary",
        type: "submit",
        disabled: !h.value
      }, "交给老师 →", 8, Be)
    ], 8, pe)], 32));
  }
}), He = Ue, Oe = ["stroke-width"], je = ["d"], De = /* @__PURE__ */ j({
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
    }, [t("path", { d: l[e.name] }, null, 8, je)], 8, Oe));
  }
}), q = De, Ee = { class: "learning-material" }, Pe = { class: "learning-source" }, Ke = { key: 0 }, Fe = ["href"], Ze = {
  key: 0,
  class: "learning-listening-cover"
}, ze = ["disabled"], Je = {
  key: 1,
  class: "learning-material-body"
}, We = ["onMouseup", "onKeyup"], Ge = ["disabled", "onClick"], Ye = {
  class: "learning-audio-parts",
  "aria-label": "材料朗读分段"
}, Qe = ["disabled", "onClick"], Xe = { key: 2 }, _e = /* @__PURE__ */ j({
  __name: "MaterialReader",
  props: {
    material: {},
    disabled: { type: Boolean },
    exerciseId: {}
  },
  emits: ["action", "select"],
  setup(e, { emit: l }) {
    const k = e, o = l;
    function g(m) {
      o("select", {
        materialId: k.material.id,
        paragraphId: m.id,
        start: 0,
        end: m.text.length,
        quote: m.text
      });
    }
    function v(m, h) {
      const c = window.getSelection();
      if (!c?.rangeCount || c.isCollapsed) return;
      const r = c.getRangeAt(0), b = m.currentTarget;
      if (!b.contains(r.startContainer) || !b.contains(r.endContainer)) return;
      const f = r.cloneRange();
      f.selectNodeContents(b), f.setEnd(r.startContainer, r.startOffset);
      const p = r.toString(), C = f.toString().length;
      p && [...p].length <= 2e3 && h.text.slice(C, C + p.length) === p && o("select", {
        materialId: k.material.id,
        paragraphId: h.id,
        start: C,
        end: C + p.length,
        quote: p
      });
    }
    return (m, h) => (a(), n("article", Ee, [
      t("h2", null, u(e.material.title), 1),
      t("div", Pe, [e.material.provenance.kind === "authored" ? (a(), n("span", Ke, "老师自编练习")) : (a(), n("a", {
        key: 1,
        href: e.material.provenance.url,
        target: "_blank",
        rel: "noopener noreferrer"
      }, u(e.material.provenance.kind === "original" ? "原文节选" : "改编自") + " · " + u(e.material.provenance.title) + " ↗", 9, Fe))]),
      e.material.hidden ? (a(), n("div", Ze, [h[1] || (h[1] = t("svg", {
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
        onClick: h[0] || (h[0] = (c) => o("action", "reveal", {
          kind: "transcripts",
          id: e.material.id
        }))
      }, "看文稿", 8, ze)])) : (a(), n("div", Je, [(a(!0), n(A, null, T(e.material.paragraphs, (c) => (a(), n("div", {
        key: c.id,
        class: "learning-paragraph"
      }, [t("p", {
        tabindex: "0",
        onMouseup: (r) => v(r, c),
        onKeyup: (r) => v(r, c)
      }, u(c.text), 41, We), t("button", {
        type: "button",
        disabled: e.disabled || [...c.text].length > 2e3,
        "aria-label": "选这段提问",
        onClick: (r) => g(c)
      }, "选段", 8, Ge)]))), 128))])),
      t("div", Ye, [(a(!0), n(A, null, T(e.material.parts, (c) => (a(), n("button", {
        key: c.key,
        type: "button",
        disabled: e.disabled,
        onClick: (r) => o("action", "play", {
          materialId: e.material.id,
          partKey: c.key,
          exerciseId: e.exerciseId
        })
      }, [N(q, { name: "play" }), V(u(e.material.parts.length > 1 ? `听第 ${c.number} 段` : "播放朗读"), 1)], 8, Qe))), 128))]),
      e.material.parts.length ? (a(), n("small", Xe, "TTS 合成朗读")) : y("", !0)
    ]));
  }
}), le = _e;
function de(e, l, k = []) {
  const o = (g) => l.kind === "choice" || l.kind === "order" ? l.options.find((v) => v.id === g)?.text ?? g : k.find((v) => v.id === g)?.text ?? g;
  return e.kind === "text" ? e.text : e.kind === "gaps" ? e.values.map((g) => `${l.kind === "gaps" ? l.slots.find((v) => v.id === g.id)?.text ?? "" : ""} ${g.text}`).join(`
`) : e.kind === "match" ? e.pairs.map((g) => l.kind === "match" ? `${l.left.find((v) => v.id === g.left)?.text} → ${l.right.find((v) => v.id === g.right)?.text}` : "").join(`
`) : e.ids.map(o).join(e.kind === "order" ? " → " : `
`);
}
var et = { class: "learning-feedback" }, tt = { class: "learning-muted" }, at = { key: 0 }, nt = { key: 1 }, lt = { key: 0 }, it = { key: 1 }, st = { key: 2 }, rt = ["disabled"], ot = ["disabled"], ut = /* @__PURE__ */ j({
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
    return (k, o) => (a(), n("section", et, [
      o[6] || (o[6] = t("p", { class: "learning-eyebrow" }, "已保存的原答", -1)),
      t("blockquote", null, u(s(de)(e.attempt.answer, e.response, e.paragraphs)), 1),
      t("small", tt, [
        V(u(e.attempt.help.feedback ? "得到反馈后的再练" : e.attempt.help.answer || e.attempt.help.hint || e.attempt.help.transcript ? "这次有辅助" : "未使用答案或提示"), 1),
        e.attempt.help.replays ? (a(), n("span", at, " · 重听 " + u(e.attempt.help.replays) + " 次", 1)) : y("", !0),
        e.attempt.help.slowPlayback ? (a(), n("span", nt, " · 慢放")) : y("", !0)
      ]),
      e.feedback ? (a(), n(A, { key: 0 }, [
        t("h3", null, u(l[e.feedback.verdict]), 1),
        e.feedback.understanding ? (a(), n("p", lt, [o[2] || (o[2] = t("b", null, "理解", -1)), V(u(e.feedback.understanding), 1)])) : y("", !0),
        e.feedback.expression ? (a(), n("p", it, [o[3] || (o[3] = t("b", null, "表达", -1)), V(u(e.feedback.expression), 1)])) : y("", !0),
        e.feedback.guidance ? (a(), n("p", st, [o[4] || (o[4] = t("b", null, "批注", -1)), V(u(e.feedback.guidance), 1)])) : y("", !0),
        t("button", {
          type: "button",
          disabled: e.disabled,
          onClick: o[0] || (o[0] = (g) => k.$emit("action", "assess", {
            attemptId: e.attempt.id,
            review: !0,
            message: "请重新审视我的原答与题目。也请考虑其他有效表达，不只对照原来的答案键。"
          }))
        }, u(e.feedback.verdict === "disputed" ? "请老师复核" : "有疑问，请复核"), 9, rt)
      ], 64)) : (a(), n(A, { key: 1 }, [o[5] || (o[5] = t("p", null, "原答已保存，等待老师评估。", -1)), t("button", {
        type: "button",
        disabled: e.disabled,
        onClick: o[1] || (o[1] = (g) => k.$emit("action", "assess", {
          attemptId: e.attempt.id,
          review: !1,
          message: "请评估这条已经保存的原答。"
        }))
      }, "重试评估", 8, ot)], 64))
    ]));
  }
}), ve = ut, dt = {
  key: 0,
  class: "learning-player",
  "aria-label": "课堂朗读"
}, vt = {
  key: 0,
  role: "status"
}, ct = {
  key: 2,
  class: "learning-row"
}, gt = ["aria-label", "disabled"], bt = ["max", "value"], mt = /* @__PURE__ */ j({
  __name: "LearningPlayer",
  props: { state: {} },
  emits: ["action"],
  setup(e, { emit: l }) {
    const k = l;
    function o(g) {
      return `${Math.floor(g / 60)}:${String(Math.floor(g % 60)).padStart(2, "0")}`;
    }
    return (g, v) => e.state.media.status !== "idle" ? (a(), n("section", dt, [
      e.state.media.message ? (a(), n("p", vt, u(e.state.media.message), 1)) : y("", !0),
      e.state.voices.enabled ? y("", !0) : (a(), n("button", {
        key: 1,
        type: "button",
        onClick: v[0] || (v[0] = (m) => k("action", "tts-settings"))
      }, "如何开启 TTS")),
      e.state.media.key ? (a(), n("div", ct, [
        N(q, { name: "sound" }),
        t("span", null, u(e.state.media.status === "loading" ? "正在生成声音…" : `${o(e.state.media.position)} / ${o(e.state.media.duration)}`), 1),
        e.state.media.status === "playing" ? (a(), n("button", {
          key: 0,
          type: "button",
          "aria-label": "暂停",
          onClick: v[1] || (v[1] = (m) => k("action", "pause"))
        }, [N(q, { name: "pause" })])) : [
          "paused",
          "ended",
          "blocked"
        ].includes(e.state.media.status) ? (a(), n("button", {
          key: 1,
          type: "button",
          "aria-label": e.state.media.status === "ended" ? "再听一遍" : "继续播放",
          disabled: e.state.busy,
          onClick: v[2] || (v[2] = (m) => k("action", "resume"))
        }, [N(q, { name: "play" })], 8, gt)) : y("", !0),
        t("button", {
          type: "button",
          "aria-label": "停止",
          onClick: v[3] || (v[3] = (m) => k("action", "stop"))
        }, [N(q, { name: "stop" })]),
        e.state.media.duration ? (a(), n("button", {
          key: 2,
          type: "button",
          onClick: v[4] || (v[4] = (m) => k("action", "rate", { value: e.state.media.rate === 1 ? 0.75 : 1 }))
        }, u(e.state.media.rate) + "×", 1)) : y("", !0)
      ])) : y("", !0),
      e.state.media.duration ? (a(), n("input", {
        key: 3,
        type: "range",
        min: "0",
        max: e.state.media.duration,
        step: "0.1",
        value: e.state.media.position,
        "aria-label": "当前声音片段播放位置",
        onChange: v[5] || (v[5] = (m) => k("action", "seek", { value: Number(m.target.value) }))
      }, null, 40, bt)) : y("", !0)
    ])) : y("", !0);
  }
}), ce = mt;
function ie(e) {
  return {
    picked: [],
    text: "",
    values: {},
    order: e.kind === "order" ? e.options.map((l) => l.id) : []
  };
}
var yt = ["onKeydown"], kt = {
  role: "dialog",
  "aria-labelledby": "learning-activity-title",
  class: "learning-activity"
}, ft = { class: "learning-activity-header" }, pt = { id: "learning-activity-title" }, ht = {
  key: 0,
  "aria-label": "完成本课的固定奖励"
}, $t = {
  key: 0,
  class: "learning-margin-note",
  role: "status"
}, Ct = {
  key: 0,
  class: "learning-activity-materials"
}, xt = {
  key: 2,
  class: "learning-selection"
}, wt = { class: "learning-row" }, It = ["disabled"], Lt = {
  key: 3,
  class: "learning-question"
}, At = { class: "learning-help-actions" }, St = ["disabled"], Mt = ["disabled"], Tt = ["disabled"], Nt = {
  key: 0,
  class: "learning-margin-note"
}, Rt = {
  key: 1,
  class: "learning-margin-note"
}, Vt = { key: 0 }, qt = { key: 1 }, Bt = { key: 2 }, Ut = ["disabled"], Ht = /* @__PURE__ */ j({
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
    const k = e, o = l, g = M(null), v = /* @__PURE__ */ new Map(), m = M(null), h = M(!1), c = M(null), r = M(null);
    function b() {
      c.value ? c.value = null : h.value ? h.value = !1 : o("close");
    }
    ue(r, b);
    const f = M({});
    let p = null;
    const C = E(() => k.target?.kind === "exercise" ? k.state.unit?.exercises.find(($) => $.id === k.target?.id) : void 0), D = E(() => k.state.unit?.materials.filter(($) => k.target?.kind === "material" ? $.id === k.target.id : C.value?.materialIds.includes($.id)) ?? []), R = E(() => C.value?.id ?? k.state.unit?.exercises.find(($) => $.skill === "listening" && $.materialIds.includes(k.target?.id ?? ""))?.id ?? k.state.unit?.exercises.find(($) => $.materialIds.includes(k.target?.id ?? ""))?.id), Z = E(() => D.value.filter(($) => C.value?.response.kind !== "evidence" || $.id === C.value.response.materialId).flatMap(($) => $.paragraphs)), U = E(() => k.state.unit?.attempts.filter(($) => $.exerciseId === C.value?.id).at(-1)), z = E(() => k.state.unit?.assessments.find(($) => $.attemptId === U.value?.id));
    B(() => C.value, ($) => {
      if (!$) return;
      const x = JSON.stringify($.response);
      f.value[$.id]?.response !== x && (f.value[$.id] = {
        response: x,
        value: ie($.response)
      });
    }, { immediate: !0 });
    const S = E({
      get: () => f.value[C.value.id].value,
      set: ($) => {
        f.value[C.value.id].value = $;
      }
    });
    B(() => k.target, async ($, x) => {
      x && g.value && v.set(`${x.kind}:${x.id}`, g.value.scrollTop), h.value = !1, c.value = null, await G(), $ && (m.value?.focus(), g.value && (g.value.scrollTop = v.get(`${$.kind}:${$.id}`) ?? 0));
    }), B(() => k.state.unit?.id, () => {
      f.value = {}, p = null;
    }), B(() => k.state.unit?.attempts, ($) => {
      if (!p) return;
      const x = $?.filter((L) => L.exerciseId === p.id).at(-1);
      if (x && x.id !== p.before) {
        const L = k.target?.kind === "exercise" && k.target.id === p.id;
        delete f.value[p.id], p = null, L && o("close");
      }
    });
    function w($) {
      p = {
        id: C.value.id,
        before: U.value?.id
      }, o("action", "submit", {
        unitId: k.state.unit.id,
        exerciseId: C.value.id,
        answer: $
      });
    }
    return ($, x) => e.target ? (a(), n("div", {
      key: 0,
      ref_key: "layer",
      ref: r,
      class: "learning-activity-shade",
      onKeydown: Q(F(b, ["stop", "prevent"]), ["esc"])
    }, [t("section", kt, [
      t("header", ft, [
        t("h2", pt, u(C.value ? "练习" : D.value[0]?.title ?? "材料"), 1),
        e.state.unit ? (a(), n("small", ht, "+" + u(e.state.unit.reward.amount) + " 币", 1)) : y("", !0),
        t("button", {
          ref_key: "closeButton",
          ref: m,
          type: "button",
          "aria-label": "收起课件",
          onClick: x[0] || (x[0] = (L) => o("close"))
        }, [x[17] || (x[17] = V("收起", -1)), N(q, { name: "back" })], 512)
      ]),
      e.state.message && !e.state.busy ? (a(), n("p", $t, u(e.state.message), 1)) : y("", !0),
      t("div", {
        ref_key: "body",
        ref: g,
        class: "learning-activity-body"
      }, [
        C.value && D.value.length ? (a(), n("details", Ct, [t("summary", null, "阅读材料 · " + u(D.value.length), 1), (a(!0), n(A, null, T(D.value, (L) => (a(), P(le, {
          key: L.id,
          material: L,
          "exercise-id": R.value,
          disabled: e.disabled,
          onAction: x[1] || (x[1] = (H, O) => o("action", H, O)),
          onSelect: x[2] || (x[2] = (H) => c.value = H)
        }, null, 8, [
          "material",
          "exercise-id",
          "disabled"
        ]))), 128))])) : C.value ? y("", !0) : (a(!0), n(A, { key: 1 }, T(D.value, (L) => (a(), P(le, {
          key: L.id,
          material: L,
          "exercise-id": R.value,
          disabled: e.disabled,
          onAction: x[3] || (x[3] = (H, O) => o("action", H, O)),
          onSelect: x[4] || (x[4] = (H) => c.value = H)
        }, null, 8, [
          "material",
          "exercise-id",
          "disabled"
        ]))), 128)),
        c.value ? (a(), n("div", xt, [t("blockquote", null, u(c.value.quote), 1), t("div", wt, [
          t("button", {
            type: "button",
            onClick: x[5] || (x[5] = (L) => o("ask", R.value, c.value))
          }, "问老师"),
          t("button", {
            type: "button",
            disabled: e.disabled || [...c.value.quote].length > 1e3,
            onClick: x[6] || (x[6] = (L) => o("action", "say", { selection: c.value }))
          }, "朗读", 8, It),
          t("button", {
            type: "button",
            onClick: x[7] || (x[7] = (L) => c.value = null)
          }, "取消选段")
        ])])) : y("", !0),
        C.value ? (a(), n("section", Lt, [
          t("h2", null, u(C.value.prompt), 1),
          t("div", At, [
            t("button", {
              type: "button",
              disabled: e.disabled || [...C.value.prompt].length > 1e3,
              onClick: x[8] || (x[8] = (L) => o("action", "say-question", { exerciseId: C.value.id }))
            }, "听题干", 8, St),
            C.value.hasHint ? (a(), n("button", {
              key: 0,
              type: "button",
              disabled: e.disabled || C.value.hint !== null,
              onClick: x[9] || (x[9] = (L) => o("action", "reveal", {
                kind: "hints",
                id: C.value.id
              }))
            }, "提示", 8, Mt)) : y("", !0),
            t("button", {
              type: "button",
              disabled: e.disabled || C.value.solution !== null,
              onClick: x[10] || (x[10] = (L) => o("action", "reveal", {
                kind: "answers",
                id: C.value.id
              }))
            }, "解答", 8, Tt),
            t("button", {
              type: "button",
              onClick: x[11] || (x[11] = (L) => o("ask", C.value.id))
            }, "问老师")
          ]),
          C.value.hint ? (a(), n("p", Nt, u(C.value.hint), 1)) : y("", !0),
          C.value.solution ? (a(), n("div", Rt, [C.value.solution.kind === "exact" ? (a(), n("p", Vt, u(s(de)(C.value.solution.answer, C.value.response, Z.value)), 1)) : C.value.solution.kind === "gaps" ? (a(), n("p", qt, u(C.value.solution.accepted.map((L) => L.forms.join(" / ")).join(`
`)), 1)) : y("", !0), C.value.solution.kind !== "semantic" ? (a(), n("p", Bt, u(C.value.solution.explanation), 1)) : (a(), n("button", {
            key: 3,
            type: "button",
            onClick: x[12] || (x[12] = (L) => o("ask", C.value.id))
          }, "请老师讲解"))])) : y("", !0),
          (!U.value || h.value) && f.value[C.value.id] ? (a(), P(He, {
            key: C.value.id,
            modelValue: S.value,
            "onUpdate:modelValue": x[13] || (x[13] = (L) => S.value = L),
            response: C.value.response,
            paragraphs: Z.value,
            disabled: e.disabled,
            onSubmit: w
          }, null, 8, [
            "modelValue",
            "response",
            "paragraphs",
            "disabled"
          ])) : y("", !0),
          U.value ? (a(), P(ve, {
            key: 3,
            attempt: U.value,
            feedback: z.value,
            response: C.value.response,
            paragraphs: Z.value,
            disabled: e.disabled,
            onAction: x[14] || (x[14] = (L, H) => {
              o("action", L, H), o("close");
            })
          }, null, 8, [
            "attempt",
            "feedback",
            "response",
            "paragraphs",
            "disabled"
          ])) : y("", !0),
          U.value ? (a(), n("button", {
            key: 4,
            type: "button",
            disabled: e.disabled,
            onClick: x[15] || (x[15] = (L) => {
              h.value = !h.value, f.value[C.value.id] ??= {
                response: JSON.stringify(C.value.response),
                value: s(ie)(C.value.response)
              };
            })
          }, u(h.value ? "收起再练" : "再试一次"), 9, Ut)) : y("", !0)
        ])) : y("", !0)
      ], 512),
      N(ce, {
        state: e.state,
        onAction: x[16] || (x[16] = (L, H) => o("action", L, H))
      }, null, 8, ["state"])
    ])], 40, yt)) : y("", !0);
  }
}), Ot = Ht, jt = { class: "learning-profile-page" }, Dt = { class: "learning-setup-heading" }, Et = { class: "learning-language-options" }, Pt = [
  "disabled",
  "aria-pressed",
  "onClick"
], Kt = { "aria-hidden": "true" }, Ft = ["disabled"], Zt = { class: "learning-teacher-options" }, zt = [
  "disabled",
  "aria-pressed",
  "onClick"
], Jt = { class: "learning-person-initial" }, Wt = {
  key: 0,
  class: "learning-selected-teacher"
}, Gt = { class: "learning-person-initial" }, Yt = ["open"], Qt = ["disabled"], Xt = ["disabled"], _t = { class: "learning-setup-actions" }, ea = ["disabled"], ta = ["disabled"], aa = /* @__PURE__ */ j({
  __name: "LearningSetup",
  props: {
    state: {},
    disabled: { type: Boolean }
  },
  emits: ["action", "done"],
  setup(e, { emit: l }) {
    const k = l, o = M(0), g = M(null), v = M(""), m = [
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
    async function h(c) {
      o.value = c, await G(), g.value?.focus();
    }
    return _(() => o.value ? (h(0), !0) : !1), (c, r) => (a(), n("section", jt, [t("div", Dt, [t("h1", {
      ref_key: "heading",
      ref: g,
      tabindex: "-1"
    }, u(o.value === 0 ? "选择要学习的语言" : "选择老师"), 513)]), o.value === 0 ? (a(), n(A, { key: 0 }, [t("div", Et, [(a(), n(A, null, T(m, ([b, f, p]) => t("button", {
      key: b,
      type: "button",
      disabled: e.disabled,
      "aria-pressed": e.state.language === b,
      onClick: (C) => k("action", "language", { language: b })
    }, [
      t("span", Kt, u(p), 1),
      t("strong", null, u(f), 1),
      e.state.language === b ? (a(), P(q, {
        key: 0,
        name: "check"
      })) : y("", !0)
    ], 8, Pt)), 64))]), t("button", {
      type: "button",
      class: "learning-primary learning-setup-next",
      disabled: e.disabled,
      onClick: r[0] || (r[0] = (b) => h(1))
    }, [r[5] || (r[5] = V("继续", -1)), N(q, { name: "arrow" })], 8, Ft)], 64)) : (a(), n(A, { key: 1 }, [
      t("div", Zt, [(a(!0), n(A, null, T(e.state.candidates, (b) => (a(), n("button", {
        key: b.name,
        type: "button",
        disabled: e.disabled,
        "aria-pressed": e.state.teacher?.name === b.name,
        onClick: (f) => k("action", "teacher", { teacher: {
          name: b.name,
          note: ""
        } })
      }, [
        t("span", Jt, u([...b.name][0]), 1),
        t("strong", null, u(b.name), 1),
        e.state.teacher?.name === b.name ? (a(), P(q, {
          key: 0,
          name: "check"
        })) : y("", !0)
      ], 8, zt))), 128))]),
      e.state.teacher && !e.state.candidates.some((b) => b.name === e.state.teacher?.name) ? (a(), n("p", Wt, [
        t("span", Gt, u([...e.state.teacher.name][0]), 1),
        V(u(e.state.teacher.name), 1),
        N(q, { name: "check" })
      ])) : y("", !0),
      t("details", {
        class: "learning-other-teacher",
        open: !e.state.candidates.length && !e.state.teacher
      }, [r[6] || (r[6] = t("summary", null, "选择其他人物", -1)), t("form", {
        class: "learning-row",
        onSubmit: r[2] || (r[2] = F((b) => k("action", "teacher", { teacher: {
          name: v.value.trim(),
          note: ""
        } }), ["prevent"]))
      }, [K(t("input", {
        "onUpdate:modelValue": r[1] || (r[1] = (b) => v.value = b),
        type: "text",
        "aria-label": "其他人物名字",
        maxlength: "80",
        placeholder: "输入人物名字",
        disabled: e.disabled
      }, null, 8, Qt), [[X, v.value]]), t("button", {
        type: "submit",
        disabled: e.disabled || !v.value.trim()
      }, "选这位", 8, Xt)], 32)], 8, Yt),
      t("div", _t, [t("button", {
        type: "button",
        disabled: e.disabled,
        onClick: r[3] || (r[3] = (b) => h(0))
      }, "上一步", 8, ea), t("button", {
        type: "button",
        class: "learning-primary",
        disabled: e.disabled || !e.state.teacher,
        onClick: r[4] || (r[4] = (b) => k("done"))
      }, [r[7] || (r[7] = V("和老师聊聊", -1)), N(q, { name: "arrow" })], 8, ta)])
    ], 64))]));
  }
}), na = aa, la = { class: "learning-records-page" }, ia = { class: "learning-page-heading" }, sa = {
  key: 0,
  class: "learning-muted"
}, ra = { class: "learning-muted" }, oa = {
  key: 0,
  class: "learning-muted"
}, ua = ["disabled", "onClick"], da = ["disabled"], va = {
  key: 0,
  class: "learning-empty-note"
}, ca = ["disabled", "onClick"], ga = { key: 0 }, ba = {
  key: 1,
  class: "learning-row"
}, ma = ["disabled"], ya = { class: "learning-muted" }, ka = ["disabled"], fa = /* @__PURE__ */ j({
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
    return (v, m) => (a(), n("section", la, [t("div", ia, [m[5] || (m[5] = t("h1", null, "学习记录", -1)), e.state.records.total ? (a(), n("span", sa, u(e.state.records.total) + " 项", 1)) : y("", !0)]), e.state.record ? (a(), n(A, { key: 0 }, [
      t("button", {
        type: "button",
        onClick: m[0] || (m[0] = (h) => v.$emit("action", "records", { offset: e.state.records.offset }))
      }, "‹ 返回记录"),
      t("h2", null, u(e.state.record.label), 1),
      (a(!0), n(A, null, T(e.state.record.evidence, (h) => (a(), n("article", {
        key: h.attempt.id,
        class: "learning-record-evidence"
      }, [
        t("p", ra, u(new Date(h.attempt.submittedAt).toLocaleDateString()), 1),
        t("h3", null, u(h.exercise.prompt), 1),
        (a(!0), n(A, null, T(h.materials, (c) => (a(), n("details", { key: c.id }, [t("summary", null, u(c.title), 1), c.hidden ? (a(), n("p", oa, "听力文稿尚未展开；原答和反馈如下。")) : (a(!0), n(A, { key: 1 }, T(c.paragraphs, (r) => (a(), n("p", { key: r.id }, u(r.text), 1))), 128))]))), 128)),
        N(ve, {
          attempt: h.attempt,
          feedback: h.assessment,
          response: h.exercise.response,
          paragraphs: h.materials.flatMap((c) => c.paragraphs),
          disabled: e.disabled,
          onAction: m[1] || (m[1] = (c, r) => v.$emit("action", c, r))
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
          onClick: (c) => v.$emit("remove", "delete-attempt", { id: h.attempt.id }, "删除这条原答和依赖它的反馈？相关学习项会重新计算，不撤回已到账奖励。")
        }, "删除这条原答", 8, ua)
      ]))), 128)),
      t("button", {
        type: "button",
        disabled: e.disabled,
        onClick: m[2] || (m[2] = (h) => v.$emit("remove", "delete-item", { id: e.state.record.id }, "删除这个学习项及其不再被引用的证据？当前课程不会被删除。"))
      }, "删除学习项", 8, da)
    ], 64)) : (a(), n(A, { key: 1 }, [
      e.state.records.total ? y("", !0) : (a(), n("p", va, "暂无学习记录")),
      (a(!0), n(A, null, T(e.state.records.items, (h) => (a(), n("button", {
        key: h.id,
        class: "learning-record-row",
        type: "button",
        disabled: !h.readable,
        onClick: (c) => v.$emit("action", "records", {
          id: h.id,
          offset: e.state.records.offset
        })
      }, [t("span", null, [t("strong", null, u(h.label), 1), t("small", null, [V(u(h.evidenceCount) + " 份作答依据", 1), h.nextReviewAt ? (a(), n("span", ga, " · 建议 " + u(new Date(h.nextReviewAt).toLocaleDateString()) + " 再练", 1)) : y("", !0)])]), t("em", null, u(g[h.state]), 1)], 8, ca))), 128)),
      e.state.records.total > 30 ? (a(), n("div", ba, [
        t("button", {
          type: "button",
          disabled: e.state.records.offset === 0,
          onClick: m[3] || (m[3] = (h) => v.$emit("action", "records", { offset: Math.max(0, e.state.records.offset - 30) }))
        }, "上一页", 8, ma),
        t("span", ya, u(e.state.records.total) + " 项", 1),
        t("button", {
          type: "button",
          disabled: e.state.records.offset + 30 >= e.state.records.total,
          onClick: m[4] || (m[4] = (h) => v.$emit("action", "records", { offset: e.state.records.offset + 30 }))
        }, "下一页", 8, ka)
      ])) : y("", !0)
    ], 64))]));
  }
}), pa = fa, se = {
  initial: "我想跟你学这门语言，先聊聊吧。",
  returning: "我来继续学语言了，先聊聊今天从哪里开始吧。"
}, ha = /* @__PURE__ */ j({
  __name: "LearningMarkdown",
  props: { text: {} },
  setup(e) {
    const l = e, k = M(null), o = /* @__PURE__ */ new Set([
      "p",
      "br",
      "em",
      "i",
      "strong",
      "b",
      "del",
      "s",
      "u",
      "code",
      "pre",
      "blockquote",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "hr",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "a"
    ]), g = /* @__PURE__ */ new Set([
      "script",
      "style",
      "custom-style",
      "iframe",
      "object",
      "embed",
      "svg",
      "math"
    ]);
    return B([k, () => l.text], () => {
      if (!k.value) return;
      const v = document.createElement("template");
      v.innerHTML = be(l.text, { htmlFenceMode: "code" });
      for (const m of v.content.querySelectorAll("*")) {
        const h = m.localName;
        if (g.has(h)) {
          m.remove();
          continue;
        }
        if (h === "img") {
          m.replaceWith(document.createTextNode(m.getAttribute("alt") ?? ""));
          continue;
        }
        if (!o.has(h)) {
          m.replaceWith(...m.childNodes);
          continue;
        }
        const c = m.getAttribute("href") ?? "", r = m.getAttribute("start") ?? "";
        for (const b of [...m.attributes]) m.removeAttribute(b.name);
        h === "a" && /^(?:https?:\/\/|mailto:)/i.test(c) && (m.setAttribute("href", c), m.setAttribute("target", "_blank"), m.setAttribute("rel", "noopener noreferrer")), h === "ol" && /^\d+$/.test(r) && m.setAttribute("start", r);
      }
      me(v.content, {
        codeBlockClassName: "learning-codeblock",
        codeCopyClassName: "learning-code-copy"
      }), k.value.replaceChildren(v.content);
    }, { flush: "post" }), (v, m) => (a(), n("div", {
      ref_key: "surface",
      ref: k,
      class: "learning-markdown"
    }, null, 512));
  }
}), $a = ha, Ca = { class: "learning-messages" }, xa = {
  key: 0,
  class: "learning-reasoning",
  role: "status"
}, wa = { class: "learning-tool-name" }, Ia = { class: "learning-tool-status" }, La = { class: "learning-tool-details" }, Aa = {
  key: 0,
  class: "learning-tool-error"
}, Sa = /* @__PURE__ */ j({
  __name: "LearningMessages",
  props: {
    messages: {},
    running: { type: Boolean }
  },
  setup(e) {
    const l = e, k = E(() => {
      const c = [];
      for (const r of l.messages) r.role === "assistant" ? c.push({
        message: r,
        results: []
      }) : r.role === "tool" && c.at(-1)?.results.push(r);
      return c.map((r) => ({
        message: r.message,
        tools: (r.message.toolCalls ?? []).map((b) => {
          const f = r.results.find((p) => p.toolCallId === b.id);
          return {
            call: b,
            result: f,
            status: r.message.streaming ? "generating" : f?.streaming ? "running" : f?.content ? f.error || v(f.content) ? "failed" : "done" : l.running && !r.message.error ? "pending" : "cancelled"
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
    function v(c) {
      try {
        return JSON.parse(c)?.ok === !1;
      } catch {
        return !1;
      }
    }
    function m(c) {
      try {
        return JSON.stringify(JSON.parse(c), null, 2);
      } catch {
        return c;
      }
    }
    function h(c) {
      if (!c) return "";
      try {
        const r = JSON.parse(c);
        return r.errors?.map((b) => b.message).join("；") || r.message || r.error || "工具返回失败，展开查看结果。";
      } catch {
        return c;
      }
    }
    return (c, r) => (a(), n("div", Ca, [(a(!0), n(A, null, T(k.value, (b, f) => (a(), n(A, { key: f }, [
      b.message.hasReasoning && b.message.streaming && !b.message.content && !b.tools.length ? (a(), n("p", xa, "正在思考…")) : y("", !0),
      b.message.content ? (a(), n("div", {
        key: 1,
        class: Y(["learning-output", { "is-streaming": b.message.streaming }])
      }, [b.message.content ? (a(), P($a, {
        key: 0,
        text: b.message.content
      }, null, 8, ["text"])) : y("", !0)], 2)) : y("", !0),
      (a(!0), n(A, null, T(b.tools, (p) => (a(), n("div", {
        key: p.call.id,
        class: Y(["learning-tool-entry", `is-${p.status}`])
      }, [t("details", null, [t("summary", null, [t("span", wa, [V(u(o[p.call.name] || p.call.name), 1), t("code", null, u(p.call.name), 1)]), t("span", Ia, u(g[p.status]), 1)]), t("div", La, [
        r[1] || (r[1] = t("h3", null, "参数摘要", -1)),
        t("pre", null, u(m(p.call.arguments)), 1),
        p.result?.content ? (a(), n(A, { key: 0 }, [r[0] || (r[0] = t("h3", null, "结果摘要", -1)), t("pre", null, u(m(p.result.content)), 1)], 64)) : y("", !0)
      ])]), p.status === "failed" ? (a(), n("p", Aa, u(h(p.result?.content)), 1)) : y("", !0)], 2))), 128))
    ], 64))), 128))]));
  }
}), Ma = Sa, Ta = { class: "learning-conversation" }, Na = { class: "learning-conversation-heading" }, Ra = { class: "learning-person-initial" }, Va = ["disabled"], qa = {
  key: 0,
  class: "learning-history-notice"
}, Ba = { class: "learning-conversation-user" }, Ua = ["disabled", "onClick"], Ha = {
  key: 2,
  class: "learning-conversation-tools"
}, Oa = ["disabled"], ja = ["disabled"], Da = {
  key: 1,
  class: "learning-working",
  role: "status"
}, Ea = {
  key: 2,
  class: "learning-conversation-empty"
}, Pa = ["disabled"], Ka = { key: 2 }, Fa = { class: "learning-composer-surface" }, Za = {
  key: 0,
  class: "learning-composer-quote"
}, za = { class: "learning-composer-row" }, Ja = ["maxlength", "onKeydown"], Wa = [
  "type",
  "disabled",
  "aria-label",
  "title"
], Ga = /* @__PURE__ */ j({
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
    const o = e, g = k, v = M(""), m = M(null), h = M(null), c = M(null);
    let r = !0, b = null, f = 0, p = "", C = 0;
    function D() {
      const S = h.value;
      S && (r = S.scrollHeight - S.scrollTop - S.clientHeight < 70);
    }
    async function R() {
      await G(), r && h.value && (h.value.scrollTop = h.value.scrollHeight);
    }
    function Z() {
      const S = m.value;
      S?.clientWidth && (S.style.height = "auto", S.style.height = `${S.scrollHeight}px`, R());
    }
    B(v, Z, { flush: "post" }), B(m, (S) => {
      if (b?.disconnect(), cancelAnimationFrame(f), !S) return;
      let w = 0;
      b = new ResizeObserver(([$]) => {
        $.contentRect.width !== w && (w = $.contentRect.width, cancelAnimationFrame(f), f = requestAnimationFrame(Z));
      }), b.observe(S.parentElement);
    }, { flush: "post" }), oe(R), re(() => {
      b?.disconnect(), cancelAnimationFrame(f);
    }), B(() => o.state.conversation.turns.length + o.state.conversation.removedTurns, (S) => {
      const w = o.state.conversation.turns.at(-1), $ = c.value?.selection ? `${p}

${c.value.selection.quote}` : p;
      S > C && w?.user === $ && v.value.trim() === p && (v.value = "", p = "", c.value = null);
    }), B([
      () => o.state.chatIdentity,
      () => o.state.language,
      () => o.state.teacher?.name
    ], () => {
      v.value = "", p = "", c.value = null;
    }), B(() => o.state.unit?.id, () => {
      c.value = null;
    }), B(() => o.state.conversation.turns.length, (S, w) => {
      !S && w && !o.state.busy && (v.value = "", p = "");
    });
    function U() {
      o.disabled || !v.value.trim() || (p = v.value.trim(), C = o.state.conversation.turns.length + o.state.conversation.removedTurns, g("action", c.value ? "explain" : "talk", {
        message: p,
        ...c.value ?? {}
      }));
    }
    B(() => o.state.conversation.turns.length, (S, w) => {
      S > w && (r = !0), R();
    }), B([
      () => o.state.conversation.turns,
      () => o.state.busy,
      () => o.state.message
    ], R);
    function z(S) {
      return S.kind === "replacement" ? !o.disabled && o.state.currentUnitId === S.unitId : o.state.unit?.id === S.unitId && (S.kind === "exercise" ? o.state.unit.exercises : o.state.unit.materials).some((w) => w.id === S.id);
    }
    return l({
      async ask(S, w) {
        c.value = {
          exerciseId: S,
          selection: w
        }, await G(), m.value?.focus();
      },
      focus: () => m.value?.focus({ preventScroll: !0 })
    }), (S, w) => (a(), n("section", Ta, [
      t("header", Na, [
        t("span", Ra, u([...e.state.teacher?.name ?? "师"][0]), 1),
        t("h1", null, u(e.state.teacher?.name ?? "老师"), 1),
        t("button", {
          type: "button",
          disabled: e.disabled,
          "aria-label": "更换学习语言和老师",
          onClick: w[0] || (w[0] = ($) => g("profile"))
        }, u(new Intl.DisplayNames(["zh-CN"], { type: "language" }).of(e.state.language)), 9, Va)
      ]),
      t("div", {
        ref_key: "scroller",
        ref: h,
        class: "learning-conversation-turns",
        "aria-label": "师生对话",
        onScroll: D
      }, [
        e.state.conversation.removedTurns ? (a(), n("p", qa, "较早对话已整理为课堂记忆。")) : y("", !0),
        (a(!0), n(A, null, T(e.state.conversation.turns, ($, x) => (a(), n("div", {
          key: x,
          class: "learning-conversation-turn"
        }, [
          t("p", Ba, u($.user), 1),
          N(Ma, {
            messages: $.messages,
            running: $.status === "running"
          }, null, 8, ["messages", "running"]),
          $.message ? (a(), n("p", {
            key: 0,
            class: Y(["learning-turn-notice", { "is-error": $.status === "failed" }]),
            role: "status"
          }, u($.message), 3)) : y("", !0),
          $.presentation ? (a(), n("button", {
            key: 1,
            type: "button",
            class: "learning-activity-link",
            disabled: !z($.presentation),
            onClick: (L) => g("present", $.presentation)
          }, [
            N(q, { name: $.presentation.kind === "material" ? "book" : "records" }, null, 8, ["name"]),
            t("span", null, u($.presentation.title), 1),
            N(q, { name: "arrow" })
          ], 8, Ua)) : y("", !0),
          x === e.state.conversation.turns.length - 1 && e.state.reply?.text === $.teacher ? (a(), n("div", Ha, [[...$.teacher].length <= 1e3 ? (a(), n("button", {
            key: 0,
            type: "button",
            disabled: e.disabled,
            onClick: w[1] || (w[1] = (L) => g("action", "say-reply"))
          }, [N(q, { name: "sound" }), w[8] || (w[8] = V("听老师说", -1))], 8, Oa)) : y("", !0), e.state.reply.exerciseId && [...$.teacher].length <= 4e3 ? (a(), n("button", {
            key: 1,
            type: "button",
            disabled: e.disabled || e.state.unit?.notes.some((L) => L.text === $.teacher),
            onClick: w[2] || (w[2] = (L) => g("action", "save-note"))
          }, "保存笔记", 8, ja)) : y("", !0)])) : y("", !0)
        ]))), 128)),
        e.state.busy ? (a(), n("div", Da, [w[9] || (w[9] = t("span", {
          class: "learning-working-dot",
          "aria-hidden": "true"
        }, null, -1)), t("span", null, u(e.state.message || "老师正在回复…"), 1)])) : y("", !0),
        !e.state.conversation.turns.length && !e.state.busy ? (a(), n("div", Ea, [
          N(q, { name: "chat" }),
          t("p", null, u(e.state.teacher ? "今天想学什么？" : "先选一位老师"), 1),
          e.state.teacher ? (a(), n("button", {
            key: 1,
            type: "button",
            disabled: e.disabled,
            onClick: w[4] || (w[4] = ($) => g("action", "talk", { message: e.state.profile ? s(se).returning : s(se).initial }))
          }, u(e.state.profile ? "继续学习" : "开始交流"), 9, Pa)) : (a(), n("button", {
            key: 0,
            class: "learning-primary",
            type: "button",
            onClick: w[3] || (w[3] = ($) => g("profile"))
          }, "选择老师")),
          e.state.teacher ? (a(), n("small", Ka, "交流与教学会调用模型")) : y("", !0)
        ])) : y("", !0)
      ], 544),
      e.state.teacher ? (a(), n("form", {
        key: 0,
        class: "learning-conversation-compose",
        onSubmit: F(U, ["prevent"])
      }, [t("div", Fa, [c.value ? (a(), n("div", Za, [t("span", null, u(c.value.selection?.quote ?? "请教这道题"), 1), t("button", {
        type: "button",
        "aria-label": "取消引用",
        onClick: w[5] || (w[5] = ($) => c.value = null)
      }, "×")])) : y("", !0), t("div", za, [K(t("textarea", {
        ref_key: "composer",
        ref: m,
        "onUpdate:modelValue": w[6] || (w[6] = ($) => v.value = $),
        rows: "1",
        maxlength: c.value?.selection ? 1800 : c.value?.exerciseId ? 2e3 : 4e3,
        "aria-label": "和老师说",
        placeholder: "和老师说…",
        onKeydown: [Q(F(U, ["ctrl", "prevent"]), ["enter"]), Q(F(U, ["meta", "prevent"]), ["enter"])]
      }, null, 40, Ja), [[X, v.value]]), t("button", {
        type: e.state.busy ? "button" : "submit",
        class: Y(e.state.busy ? "learning-composer-stop" : "learning-primary"),
        disabled: e.state.busy ? e.pending : e.disabled || !v.value.trim(),
        "aria-label": e.state.busy ? "停止回复" : "发送给老师",
        title: e.state.busy ? "停止回复" : "发送给老师",
        onClick: w[7] || (w[7] = F(($) => e.state.busy ? g("action", "cancel") : U(), ["prevent"]))
      }, [N(q, { name: e.state.busy ? "stop" : "send" }, null, 8, ["name"])], 10, Wa)])])], 32)) : y("", !0)
    ]));
  }
}), Ya = Ga;
function Qa(e) {
  const l = fe(structuredClone(ye(e.initialState))), k = M(!1), o = M("");
  let g = !1, v = 0, m = () => {
  };
  const h = E(() => !k.value && !l.value.busy && l.value.storage === "ready");
  async function c(r, b = {}) {
    if (k.value) return;
    k.value = !0, o.value = "";
    const f = l.value.chatIdentity, p = v;
    try {
      const C = await e.bridge.request(`learning/${r}`, {
        chatIdentity: f,
        ...b
      }, 35e3);
      return !g || l.value.chatIdentity !== f ? void 0 : (v === p && C.result.state.chatIdentity === f && (l.value = C.result.state), C.result);
    } catch {
      g && l.value.chatIdentity === f && (o.value = "暂时没收到操作结果。请先重新加载，确认是否已保存，不要重复提交或生成。");
    } finally {
      g && (k.value = !1);
    }
  }
  return oe(() => {
    g = !0, m = e.bridge.subscribe((r) => {
      if (r.type === "learning/media") {
        l.value = {
          ...l.value,
          media: r.payload.media
        };
        return;
      }
      if (r.type !== "learning/state") return;
      const b = r.payload.state;
      b.chatIdentity === l.value.chatIdentity && (v++, l.value = b, o.value = "");
    });
  }), re(() => {
    g = !1, m();
  }), {
    state: l,
    pending: k,
    writable: h,
    localMessage: o,
    request: c
  };
}
var Xa = {
  class: "learning-app",
  "aria-label": "语伴语言学习"
}, _a = { class: "learning-toolbar" }, en = { "aria-label": "学习资料与设置" }, tn = { "aria-label": "学习资料与设置" }, an = ["onClick"], nn = {
  key: 0,
  class: "learning-notice",
  role: "status",
  "aria-live": "polite"
}, ln = { class: "learning-row" }, sn = ["disabled"], rn = ["disabled"], on = ["disabled"], un = ["disabled"], dn = {
  key: 0,
  class: "learning-working",
  role: "status"
}, vn = ["disabled"], cn = {
  key: 2,
  class: "learning-materials-page"
}, gn = {
  key: 0,
  class: "learning-empty-note"
}, bn = { class: "learning-materials-title" }, mn = ["onClick"], yn = ["onClick"], kn = {
  key: 0,
  class: "learning-notes"
}, fn = { key: 0 }, pn = ["disabled", "onClick"], hn = {
  key: 3,
  class: "learning-goals-page"
}, $n = { key: 0 }, Cn = { key: 1 }, xn = { key: 2 }, wn = {
  key: 1,
  class: "learning-empty-note"
}, In = {
  key: 5,
  class: "learning-harvest-page"
}, Ln = {
  key: 0,
  class: "learning-empty-note"
}, An = { class: "learning-muted" }, Sn = ["disabled", "onClick"], Mn = ["disabled"], Tn = ["disabled"], Nn = {
  key: 3,
  class: "learning-row"
}, Rn = ["disabled"], Vn = ["disabled"], qn = {
  key: 6,
  class: "learning-settings-page"
}, Bn = ["value", "disabled"], Un = ["value"], Hn = {
  key: 0,
  class: "learning-muted"
}, On = ["value", "disabled"], jn = ["disabled"], Dn = ["disabled"], En = ["disabled"], Pn = ["disabled"], Kn = ["disabled"], Fn = ["disabled"], Zn = ["disabled"], zn = {
  role: "alertdialog",
  "aria-labelledby": "learning-confirm-title",
  class: "learning-confirm"
}, Jn = { class: "learning-row" }, Wn = ["disabled"], Gn = /* @__PURE__ */ j({
  __name: "LearningApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(e) {
    const { state: l, pending: k, writable: o, localMessage: g, request: v } = Qa(e), m = M(l.value.teacher ? "teacher" : "profile"), h = [], c = M(null), r = M(!1);
    _(() => c.value?.open ? (c.value.open = !1, !0) : !1, () => r.value);
    const b = M(null), f = M(null), p = M(null), C = {};
    let D = 0;
    B(() => !!l.value.record, async (I, i) => {
      m.value !== "records" || I === i || (I && (D = p.value?.scrollTop ?? 0), await G(), m.value === "records" && p.value && (p.value.scrollTop = I ? 0 : D));
    });
    const R = M(null), Z = M(null);
    ue(Z, () => {
      R.value = null;
    });
    const U = M(l.value.profile?.voice?.voiceId ?? l.value.voices.defaultVoice), z = M(l.value.profile?.voice?.language ?? l.value.language), S = M(l.value.profile?.voice?.speed ?? 1), w = M(0), $ = E(() => l.value.completions.slice(w.value * 20, (w.value + 1) * 20));
    B([() => l.value.language, () => l.value.profile?.voice], ([I, i]) => {
      U.value = i?.voiceId ?? l.value.voices.defaultVoice, z.value = i?.language ?? I, S.value = i?.speed ?? 1;
    }), B([
      () => l.value.chatIdentity,
      () => l.value.language,
      () => l.value.teacher?.name
    ], () => {
      f.value = null, R.value = null, w.value = 0;
    }), B(() => l.value.currentUnitId, (I) => {
      R.value?.action === "replace-lesson" && R.value.input.unitId !== I && (R.value = null);
    }), B(() => l.value.unit, (I) => {
      const i = f.value;
      i && (I?.id !== i.unitId || !(i.kind === "exercise" ? I.exercises : I.materials).some((d) => d.id === i.id)) && L();
    }), B(() => {
      const I = l.value.conversation.turns.at(-1)?.presentation;
      return I ? `${l.value.conversation.turns.length + l.value.conversation.removedTurns}:${I.unitId}:${I.kind}:${I.id}` : "";
    }, (I) => {
      const i = l.value.conversation.turns.at(-1)?.presentation;
      I && i && x(i);
    });
    function x(I) {
      if (I.kind === "replacement") {
        if (l.value.currentUnitId !== I.unitId || l.value.storage !== "ready") return;
        J("replace-lesson", {
          unitId: I.unitId,
          message: I.message
        }, "换一课？新课保存成功后会替换当前课件、原答和笔记；学习记录和已获得的奖励资格保留。");
        return;
      }
      l.value.unit?.id === I.unitId && (f.value = I);
    }
    function L() {
      f.value = null, v("stop");
    }
    async function H(I, i) {
      L(), await O("teacher"), await b.value?.ask(I, i);
    }
    async function O(I, i = !1) {
      if (I !== m.value && !i) if (I === "teacher") h.length = 0;
      else {
        const d = h.indexOf(I);
        d >= 0 ? h.splice(d) : h.push(m.value);
      }
      if (p.value && (C[m.value] = p.value.scrollTop), c.value && (c.value.open = !1), m.value = I, await G(), p.value) {
        p.value.scrollTop = C[I] ?? 0;
        const d = [...p.value.querySelectorAll("h1")].find((W) => W.offsetParent !== null);
        d && (d.tabIndex = -1, d.focus({ preventScroll: !0 }));
      }
    }
    const te = _(() => c.value?.open ? (c.value.open = !1, !0) : m.value === "teacher" || !h.length && m.value === "profile" && !l.value.teacher ? !1 : (O(h.pop() ?? "teacher", !0), !0));
    function J(I, i, d) {
      R.value = {
        action: I,
        input: i,
        text: d
      };
    }
    async function ge() {
      const I = await v("export");
      if (!I?.document) return;
      const i = URL.createObjectURL(new Blob([JSON.stringify(I.document, null, 2)], { type: "application/json" })), d = document.createElement("a");
      d.href = i, d.download = "LittleWhiteBox_Learning.json", d.click(), setTimeout(() => URL.revokeObjectURL(i), 1e3);
    }
    return (I, i) => (a(), n("section", Xa, [
      t("header", _a, [
        m.value !== "teacher" && (s(l).teacher || h.length) ? (a(), n("button", {
          key: 0,
          type: "button",
          class: "learning-toolbar-back",
          "aria-label": "返回上一页",
          onClick: i[0] || (i[0] = (...d) => s(te) && s(te)(...d))
        }, [N(q, { name: "back" })])) : y("", !0),
        t("button", {
          type: "button",
          class: "learning-wordmark",
          onClick: i[1] || (i[1] = (d) => O("teacher"))
        }, [...i[31] || (i[31] = [t("span", {
          class: "learning-brand-mark",
          "aria-hidden": "true"
        }, [V("a"), t("span", null, "あ")], -1), V("语伴", -1)])]),
        t("details", {
          ref_key: "menu",
          ref: c,
          class: "learning-menu",
          onToggle: i[2] || (i[2] = (d) => r.value = !!c.value?.open),
          onKeydown: i[3] || (i[3] = Q(F((d) => c.value.open = !1, ["stop", "prevent"]), ["esc"]))
        }, [t("summary", en, [N(q, { name: "more" })]), t("nav", tn, [(a(), n(A, null, T([
          ["materials", "课件与笔记"],
          ["records", "学习记录"],
          ["goals", "学习目标"],
          ["harvest", "我的收获"],
          ["settings", "设置"]
        ], ([d, W]) => t("button", {
          key: d,
          type: "button",
          onClick: (Yn) => O(d)
        }, u(W), 9, an)), 64))])], 544)
      ]),
      !s(l).busy && (s(l).message || s(g) || s(l).storage !== "ready") ? (a(), n("div", nn, [V(u(s(g) || s(l).message || (s(l).storage === "unconfirmed" ? "还不确定上次是否保存成功，请先检查保存。" : s(l).storage === "conflict" ? "服务器上的学习记录与当前内容不同，请先检查保存。" : "暂时无法读取学习文件。")) + " ", 1), t("div", ln, [
        s(l).storage === "unconfirmed" || s(l).storage === "conflict" ? (a(), n("button", {
          key: 0,
          type: "button",
          disabled: s(k),
          onClick: i[4] || (i[4] = (d) => s(v)("verify"))
        }, "检查保存", 8, sn)) : y("", !0),
        s(l).storage === "unconfirmed" ? (a(), n("button", {
          key: 1,
          type: "button",
          disabled: s(k),
          onClick: i[5] || (i[5] = (d) => s(v)("retry-save"))
        }, "重试保存", 8, rn)) : y("", !0),
        s(l).storage === "conflict" ? (a(), n("button", {
          key: 2,
          type: "button",
          disabled: s(k),
          onClick: i[6] || (i[6] = (d) => J("adopt-server", {}, "使用服务器上已保存的学习记录？这次尚未确认保存的修改将被放弃。"))
        }, "使用已保存版本", 8, on)) : y("", !0),
        s(l).storage === "unloaded" || s(g) ? (a(), n("button", {
          key: 3,
          type: "button",
          disabled: s(k),
          onClick: i[7] || (i[7] = (d) => s(v)("read"))
        }, "重新加载", 8, un)) : y("", !0)
      ])])) : y("", !0),
      K(N(Ya, {
        ref_key: "conversation",
        ref: b,
        state: s(l),
        disabled: !s(o),
        pending: s(k),
        onAction: s(v),
        onPresent: x,
        onProfile: i[8] || (i[8] = (d) => O("profile"))
      }, null, 8, [
        "state",
        "disabled",
        "pending",
        "onAction"
      ]), [[ne, m.value === "teacher"]]),
      K(t("div", {
        ref_key: "scroller",
        ref: p,
        class: "learning-scroll"
      }, [
        s(l).busy ? (a(), n("div", dn, [
          i[32] || (i[32] = t("span", {
            class: "learning-working-dot",
            "aria-hidden": "true"
          }, null, -1)),
          t("span", null, u(s(l).message || "正在处理你的请求…"), 1),
          t("button", {
            type: "button",
            disabled: s(k),
            onClick: i[9] || (i[9] = (d) => s(v)("cancel"))
          }, "停止", 8, vn)
        ])) : y("", !0),
        m.value === "profile" ? (a(), P(na, {
          key: 1,
          state: s(l),
          disabled: !s(o),
          onAction: s(v),
          onDone: i[10] || (i[10] = (d) => O("teacher"))
        }, null, 8, [
          "state",
          "disabled",
          "onAction"
        ])) : y("", !0),
        m.value === "materials" ? (a(), n("section", cn, [
          i[33] || (i[33] = t("h1", null, "课件与笔记", -1)),
          s(l).unit ? y("", !0) : (a(), n("p", gn, u(s(l).blockedUnit ? "当前课件在另一个故事中" : "还没有课件"), 1)),
          s(l).unit ? (a(), n(A, { key: 1 }, [
            t("p", bn, u(s(l).unit.title), 1),
            (a(!0), n(A, null, T(s(l).unit.materials, (d) => (a(), n("button", {
              key: d.id,
              type: "button",
              class: "learning-activity-link",
              onClick: (W) => x({
                unitId: s(l).unit.id,
                kind: "material",
                id: d.id,
                title: d.title
              })
            }, [
              N(q, { name: "book" }),
              t("span", null, u(d.title), 1),
              N(q, { name: "arrow" })
            ], 8, mn))), 128)),
            (a(!0), n(A, null, T(s(l).unit.exercises, (d) => (a(), n("button", {
              key: d.id,
              type: "button",
              class: "learning-activity-link",
              onClick: (W) => x({
                unitId: s(l).unit.id,
                kind: "exercise",
                id: d.id,
                title: d.prompt
              })
            }, [
              N(q, { name: "records" }),
              t("span", null, u(d.prompt), 1),
              N(q, { name: "arrow" })
            ], 8, yn))), 128)),
            s(l).unit.notes.length ? (a(), n("section", kn, [(a(!0), n(A, null, T(s(l).unit.notes, (d) => (a(), n("article", { key: d.id }, [
              d.selection ? (a(), n("blockquote", fn, u(d.selection.quote), 1)) : y("", !0),
              t("p", null, u(d.text), 1),
              t("button", {
                type: "button",
                disabled: !s(o),
                onClick: (W) => s(v)("delete-note", { id: d.id })
              }, "删除笔记", 8, pn)
            ]))), 128))])) : y("", !0)
          ], 64)) : y("", !0)
        ])) : y("", !0),
        m.value === "goals" ? (a(), n("section", hn, [
          i[35] || (i[35] = t("h1", null, "学习目标", -1)),
          s(l).profile ? (a(), n(A, { key: 0 }, [
            t("p", null, u(s(l).profile.goal.description), 1),
            s(l).profile.goal.exam ? (a(), n("p", $n, u(s(l).profile.goal.exam), 1)) : y("", !0),
            s(l).profile.goal.targetLevel ? (a(), n("p", Cn, u(s(l).profile.goal.targetLevel), 1)) : y("", !0),
            s(l).profile.goal.targetDate ? (a(), n("p", xn, u(s(l).profile.goal.targetDate), 1)) : y("", !0),
            i[34] || (i[34] = t("h2", null, "自评水平", -1)),
            t("p", null, u(s(l).profile.selfAssessment), 1)
          ], 64)) : (a(), n("p", wn, "还没有记录目标")),
          t("button", {
            type: "button",
            class: "learning-primary",
            onClick: i[11] || (i[11] = (d) => {
              O("teacher"), b.value?.focus();
            })
          }, "和老师聊聊")
        ])) : y("", !0),
        m.value === "records" ? (a(), P(pa, {
          key: 4,
          state: s(l),
          disabled: !s(o),
          onAction: s(v),
          onRemove: J
        }, null, 8, [
          "state",
          "disabled",
          "onAction"
        ])) : y("", !0),
        m.value === "harvest" ? (a(), n("section", In, [
          i[37] || (i[37] = t("div", { class: "learning-page-heading" }, [t("h1", null, "我的收获")], -1)),
          s(l).completions.length ? y("", !0) : (a(), n("p", Ln, "还没有完成的课程")),
          (a(!0), n(A, null, T($.value, (d) => (a(), n("article", {
            key: d.unitId,
            class: "learning-harvest-entry"
          }, [
            t("small", null, u(new Date(d.completedAt).toLocaleDateString()), 1),
            t("h2", null, [V("+" + u(d.amount), 1), i[36] || (i[36] = t("span", null, "小白币", -1))]),
            t("p", null, u(d.summary), 1),
            t("p", An, u(d.paid ? "已到账" : d.originHere ? "学习已完成，等待到账" : "请回到开课的原聊天领取"), 1),
            !d.paid && d.originHere ? (a(), n("button", {
              key: 0,
              type: "button",
              disabled: !s(o),
              onClick: (W) => s(v)("reward", {
                unitId: d.unitId,
                openWallet: !s(l).walletOpen
              })
            }, u(s(l).walletOpen ? "检查并补领" : "开通钱包并领取"), 9, Sn)) : y("", !0)
          ]))), 128)),
          s(l).chatStorage === "unconfirmed" || s(l).chatStorage === "conflict" || s(l).chatStorage === "failed" ? (a(), n("button", {
            key: 1,
            type: "button",
            disabled: s(k) || s(l).busy,
            onClick: i[12] || (i[12] = (d) => s(v)("verify-wallet"))
          }, "检查账本保存", 8, Mn)) : y("", !0),
          s(l).chatStorage === "conflict" ? (a(), n("button", {
            key: 2,
            type: "button",
            disabled: s(k) || s(l).busy,
            onClick: i[13] || (i[13] = (d) => J("adopt-wallet", {}, "使用服务器上已保存的聊天账本？这次尚未确认保存的修改将被放弃。已完成的课程仍可检查并补领奖励。"))
          }, "使用已保存账本", 8, Tn)) : y("", !0),
          s(l).completions.length > 20 ? (a(), n("div", Nn, [t("button", {
            type: "button",
            disabled: w.value === 0,
            onClick: i[14] || (i[14] = (d) => w.value--)
          }, "上一页", 8, Rn), t("button", {
            type: "button",
            disabled: (w.value + 1) * 20 >= s(l).completions.length,
            onClick: i[15] || (i[15] = (d) => w.value++)
          }, "下一页", 8, Vn)])) : y("", !0)
        ])) : y("", !0),
        m.value === "settings" ? (a(), n("section", qn, [
          i[46] || (i[46] = t("h1", null, "学习设置", -1)),
          t("label", null, [i[38] || (i[38] = V("当前语言", -1)), t("select", {
            value: s(l).language,
            disabled: !s(o),
            onChange: i[16] || (i[16] = (d) => s(v)("language", { language: d.target.value }))
          }, [(a(!0), n(A, null, T([.../* @__PURE__ */ new Set([s(l).language, ...s(l).languages])], (d) => (a(), n("option", {
            key: d,
            value: d
          }, u(new Intl.DisplayNames(["zh-CN"], { type: "language" }).of(d)), 9, Un))), 128))], 40, Bn)]),
          t("button", {
            type: "button",
            onClick: i[17] || (i[17] = (d) => O("profile"))
          }, "更换语言和老师 →"),
          t("section", null, [
            i[43] || (i[43] = t("h2", null, "老师的声音", -1)),
            s(l).voices.enabled ? (a(), n("form", {
              key: 1,
              onSubmit: i[21] || (i[21] = F((d) => s(v)("voice", { voice: {
                voiceId: U.value,
                language: z.value,
                speed: Number(S.value)
              } }), ["prevent"]))
            }, [
              t("label", null, [i[39] || (i[39] = V("音色", -1)), K(t("select", { "onUpdate:modelValue": i[18] || (i[18] = (d) => U.value = d) }, [(a(!0), n(A, null, T(s(l).voices.voices, (d) => (a(), n("option", {
                key: d.id,
                value: d.id,
                disabled: !d.available
              }, u(d.name) + u(d.available ? "" : "（暂不可用）"), 9, On))), 128))], 512), [[ee, U.value]])]),
              t("label", null, [i[40] || (i[40] = V("发音语言", -1)), K(t("input", {
                "onUpdate:modelValue": i[19] || (i[19] = (d) => z.value = d),
                type: "text",
                maxlength: "80",
                placeholder: "en / ja"
              }, null, 512), [[X, z.value]])]),
              t("label", null, [i[42] || (i[42] = V("语速", -1)), K(t("select", { "onUpdate:modelValue": i[20] || (i[20] = (d) => S.value = d) }, [...i[41] || (i[41] = [
                t("option", { value: 0.75 }, "0.75×", -1),
                t("option", { value: 1 }, "1×", -1),
                t("option", { value: 1.25 }, "1.25×", -1)
              ])], 512), [[ee, S.value]])]),
              t("button", {
                type: "submit",
                disabled: !s(o) || !s(l).profile
              }, "保存声音设置", 8, jn)
            ], 32)) : (a(), n("p", Hn, "使用语音前，请先开启 TTS 模块。文字学习不受影响。")),
            t("button", {
              type: "button",
              onClick: i[22] || (i[22] = (d) => s(v)("tts-settings"))
            }, u(s(l).voices.enabled ? "打开 TTS 设置" : "如何开启 TTS"), 1),
            i[44] || (i[44] = t("small", null, "已听过的题保留原声音，新偏好用于之后的题目。", -1))
          ]),
          t("section", null, [
            i[45] || (i[45] = t("h2", null, "学习数据", -1)),
            t("button", {
              type: "button",
              disabled: s(k) || s(l).busy,
              onClick: i[23] || (i[23] = (d) => J("forget-conversation", {}, "清空和当前老师的对话？目标、课件、学习记录和奖励都会保留。"))
            }, "清空师生对话", 8, Dn),
            t("button", {
              type: "button",
              disabled: !s(o),
              onClick: ge
            }, "导出学习数据", 8, En),
            t("button", {
              type: "button",
              disabled: s(k) || s(l).busy,
              onClick: i[24] || (i[24] = (d) => s(v)("read"))
            }, "重新加载", 8, Pn),
            s(l).unit || s(l).blockedUnit ? (a(), n("button", {
              key: 0,
              type: "button",
              disabled: !s(o),
              onClick: i[25] || (i[25] = (d) => J("abandon", {}, "放下当前这一课？本课课件、作答和笔记会删除；学习记录中留存的作答和已获得的奖励资格会保留。"))
            }, "放下当前课件", 8, Kn)) : y("", !0),
            t("button", {
              type: "button",
              class: "learning-danger",
              disabled: !s(o) || !s(l).profile,
              onClick: i[26] || (i[26] = (d) => J("delete-language", {}, "删除当前语言的全部学习数据？未领取奖励也将放弃，已到账流水保留。"))
            }, "删除当前语言", 8, Fn),
            t("button", {
              type: "button",
              class: "learning-danger",
              disabled: !s(o),
              onClick: i[27] || (i[27] = (d) => J("clear", {}, "清空所有语言的目标、课程和记录？未领取奖励也将放弃。已到账流水不撤销。"))
            }, "清空全部学习数据", 8, Zn)
          ])
        ])) : y("", !0)
      ], 512), [[ne, m.value !== "teacher"]]),
      f.value ? y("", !0) : (a(), P(ce, {
        key: 1,
        state: s(l),
        onAction: s(v)
      }, null, 8, ["state", "onAction"])),
      s(l).unit ? (a(), P(Ot, {
        key: `${s(l).chatIdentity}:${s(l).language}:${s(l).unit.id}`,
        state: s(l),
        target: f.value,
        disabled: !s(o),
        onAction: s(v),
        onClose: L,
        onAsk: H
      }, null, 8, [
        "state",
        "target",
        "disabled",
        "onAction"
      ])) : y("", !0),
      R.value ? (a(), n("div", {
        key: 3,
        ref_key: "confirmLayer",
        ref: Z,
        class: "learning-confirm-shade",
        onKeydown: i[30] || (i[30] = Q(F((d) => R.value = null, ["stop", "prevent"]), ["esc"]))
      }, [t("section", zn, [
        i[47] || (i[47] = t("h2", { id: "learning-confirm-title" }, "确认这次操作", -1)),
        t("p", null, u(R.value.text), 1),
        t("div", Jn, [t("button", {
          autofocus: "",
          type: "button",
          onClick: i[28] || (i[28] = (d) => R.value = null)
        }, "先不改"), t("button", {
          type: "button",
          class: "learning-primary",
          disabled: s(k) || s(l).busy,
          onClick: i[29] || (i[29] = (d) => {
            s(v)(R.value.action, R.value.input), R.value = null;
          })
        }, "确认", 8, Wn)])
      ])], 544)) : y("", !0)
    ]));
  }
}), tl = Gn;
export {
  tl as default
};
