/* eslint-disable */
import { D as ve, F as ce, G as s, H as L, I as R, J as u, K as _, S as ae, T as be, U as ge, W as me, a as ee, b as O, c as Q, f as H, g as n, h as g, j as T, k as a, l as z, m as K, o as X, p as t, s as ne, u as A, v as U, w as W, y as V, z as j } from "./xiaobai-os-runtime-dom.esm-bundler-DGqntx6-.js";
import { n as Y, r as se } from "./xiaobai-os-app-navigation-D5qZ5Ulq.js";
var ye = ["disabled"], ke = {
  key: 0,
  class: "learning-choices"
}, fe = [
  "type",
  "checked",
  "onChange"
], pe = { class: "learning-option-letter" }, $e = {
  key: 1,
  class: "learning-order"
}, he = [
  "disabled",
  "aria-label",
  "onClick"
], Ce = [
  "disabled",
  "aria-label",
  "onClick"
], xe = {
  key: 2,
  class: "learning-fields"
}, we = ["onUpdate:modelValue"], Ie = ["value"], Se = {
  key: 3,
  class: "learning-choices"
}, Ae = ["checked", "onChange"], Me = {
  key: 0,
  class: "learning-muted"
}, Le = {
  key: 4,
  class: "learning-fields"
}, Te = ["onUpdate:modelValue"], Ve = {
  key: 5,
  class: "learning-writing"
}, Ue = ["disabled"], qe = /* @__PURE__ */ O({
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
    const y = e, r = l, b = ce(e, "modelValue");
    function c(d) {
      y.response.kind === "choice" && !y.response.multiple ? b.value.picked = [d] : b.value.picked = b.value.picked.includes(d) ? b.value.picked.filter((f) => f !== d) : [...b.value.picked, d];
    }
    function $(d, f) {
      const k = [...b.value.order];
      [k[d], k[d + f]] = [k[d + f], k[d]], b.value.order = k;
    }
    const p = H(() => {
      const d = y.response;
      return d.kind === "text" ? !!b.value.text.trim() : d.kind === "gaps" ? d.slots.every((f) => b.value.values[f.id]?.trim()) : d.kind === "match" ? d.left.every((f) => b.value.values[f.id]) : d.kind === "order" ? !0 : b.value.picked.length > 0;
    });
    function m() {
      const d = y.response;
      !p.value || y.disabled || (d.kind === "text" ? r("submit", {
        kind: "text",
        text: b.value.text
      }) : d.kind === "gaps" ? r("submit", {
        kind: "gaps",
        values: d.slots.map((f) => ({
          id: f.id,
          text: b.value.values[f.id]
        }))
      }) : d.kind === "match" ? r("submit", {
        kind: "match",
        pairs: d.left.map((f) => ({
          left: f.id,
          right: b.value.values[f.id]
        }))
      }) : r("submit", {
        kind: d.kind,
        ids: [...d.kind === "order" ? b.value.order : b.value.picked]
      }));
    }
    return (d, f) => (a(), n("form", {
      class: "learning-answer",
      onSubmit: z(m, ["prevent"])
    }, [t("fieldset", { disabled: e.disabled }, [
      f[3] || (f[3] = t("legend", { class: "learning-sr-only" }, "你的回答", -1)),
      e.response.kind === "choice" ? (a(), n("div", ke, [(a(!0), n(A, null, T(e.response.options, (k, C) => (a(), n("label", {
        key: k.id,
        class: _({ selected: b.value.picked.includes(k.id) })
      }, [
        t("input", {
          type: e.response.multiple ? "checkbox" : "radio",
          name: "answer-choice",
          checked: b.value.picked.includes(k.id),
          onChange: (v) => c(k.id)
        }, null, 40, fe),
        t("span", pe, u(String.fromCharCode(65 + C)), 1),
        t("span", null, u(k.text), 1)
      ], 2))), 128))])) : e.response.kind === "order" ? (a(), n("ol", $e, [(a(!0), n(A, null, T(b.value.order, (k, C) => (a(), n("li", { key: k }, [
        t("span", null, u(e.response.options.find((v) => v.id === k)?.text), 1),
        t("button", {
          type: "button",
          disabled: C === 0,
          "aria-label": `上移第 ${C + 1} 项`,
          onClick: (v) => $(C, -1)
        }, "↑", 8, he),
        t("button", {
          type: "button",
          disabled: C === b.value.order.length - 1,
          "aria-label": `下移第 ${C + 1} 项`,
          onClick: (v) => $(C, 1)
        }, "↓", 8, Ce)
      ]))), 128))])) : e.response.kind === "match" ? (a(), n("div", xe, [(a(!0), n(A, null, T(e.response.left, (k) => (a(), n("label", { key: k.id }, [U(u(k.text) + " ", 1), j(t("select", { "onUpdate:modelValue": (C) => b.value.values[k.id] = C }, [f[1] || (f[1] = t("option", { value: "" }, "选择对应项", -1)), (a(!0), n(A, null, T(e.response.right, (C) => (a(), n("option", {
        key: C.id,
        value: C.id
      }, u(C.text), 9, Ie))), 128))], 8, we), [[ee, b.value.values[k.id]]])]))), 128))])) : e.response.kind === "evidence" ? (a(), n("div", Se, [(a(!0), n(A, null, T(e.paragraphs, (k) => (a(), n("label", {
        key: k.id,
        class: _({ selected: b.value.picked.includes(k.id) })
      }, [t("input", {
        type: "checkbox",
        checked: b.value.picked.includes(k.id),
        onChange: (C) => c(k.id)
      }, null, 40, Ae), t("span", null, u(k.text), 1)], 2))), 128)), e.paragraphs.length ? g("", !0) : (a(), n("p", Me, "请先展开相关文稿，再选择原文依据。"))])) : e.response.kind === "gaps" ? (a(), n("div", Le, [(a(!0), n(A, null, T(e.response.slots, (k) => (a(), n("label", { key: k.id }, [U(u(k.text), 1), j(t("input", {
        "onUpdate:modelValue": (C) => b.value.values[k.id] = C,
        type: "text",
        maxlength: "4000",
        autocomplete: "off"
      }, null, 8, Te), [[X, b.value.values[k.id]]])]))), 128))])) : (a(), n("label", Ve, [f[2] || (f[2] = t("span", { class: "learning-sr-only" }, "你的回答", -1)), j(t("textarea", {
        "onUpdate:modelValue": f[0] || (f[0] = (k) => b.value.text = k),
        rows: "6",
        maxlength: "4000",
        placeholder: "写下你的回答…"
      }, null, 512), [[X, b.value.text]])])),
      t("button", {
        class: "learning-primary",
        type: "submit",
        disabled: !p.value
      }, "交给老师 →", 8, Ue)
    ], 8, ye)], 32));
  }
}), Be = qe, Re = ["stroke-width"], De = ["d"], Ne = /* @__PURE__ */ O({
  __name: "LearningIcon",
  props: { name: {} },
  setup(e) {
    const l = {
      home: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
      book: "M12 5v16M3 4c4-1 6 0 9 1 3-1 5-2 9-1v15c-4-1-6 0-9 2-3-2-5-3-9-2Z",
      records: "M7 3h10a2 2 0 0 1 2 2v16H5V5a2 2 0 0 1 2-2ZM9 8h6M9 12h6M9 16h3",
      reward: "m12 3 3 6 6 1-4 5 1 6-6-3-6 3 1-6-4-5 6-1Z",
      arrow: "M4 12h16m-6-6 6 6-6 6",
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
    return (y, r) => (a(), n("svg", {
      class: "learning-icon",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": e.name === "more" ? 3.5 : 1.7,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true"
    }, [t("path", { d: l[e.name] }, null, 8, De)], 8, Re));
  }
}), q = Ne, He = { class: "learning-material" }, je = { class: "learning-source" }, Ke = { key: 0 }, Oe = ["href"], Ze = {
  key: 0,
  class: "learning-listening-cover"
}, Pe = ["disabled"], ze = {
  key: 1,
  class: "learning-material-body"
}, Fe = ["onMouseup", "onKeyup"], Je = ["disabled", "onClick"], Ee = {
  class: "learning-audio-parts",
  "aria-label": "材料朗读分段"
}, We = ["disabled", "onClick"], Ge = { key: 2 }, Qe = /* @__PURE__ */ O({
  __name: "MaterialReader",
  props: {
    material: {},
    disabled: { type: Boolean },
    exerciseId: {}
  },
  emits: ["action", "select"],
  setup(e, { emit: l }) {
    const y = e, r = l;
    function b($) {
      r("select", {
        materialId: y.material.id,
        paragraphId: $.id,
        start: 0,
        end: $.text.length,
        quote: $.text
      });
    }
    function c($, p) {
      const m = window.getSelection();
      if (!m?.rangeCount || m.isCollapsed) return;
      const d = m.getRangeAt(0), f = $.currentTarget;
      if (!f.contains(d.startContainer) || !f.contains(d.endContainer)) return;
      const k = d.cloneRange();
      k.selectNodeContents(f), k.setEnd(d.startContainer, d.startOffset);
      const C = d.toString(), v = k.toString().length;
      C && [...C].length <= 2e3 && p.text.slice(v, v + C.length) === C && r("select", {
        materialId: y.material.id,
        paragraphId: p.id,
        start: v,
        end: v + C.length,
        quote: C
      });
    }
    return ($, p) => (a(), n("article", He, [
      t("h2", null, u(e.material.title), 1),
      t("div", je, [e.material.provenance.kind === "authored" ? (a(), n("span", Ke, "老师自编练习")) : (a(), n("a", {
        key: 1,
        href: e.material.provenance.url,
        target: "_blank",
        rel: "noopener noreferrer"
      }, u(e.material.provenance.kind === "original" ? "原文节选" : "改编自") + " · " + u(e.material.provenance.title) + " ↗", 9, Oe))]),
      e.material.hidden ? (a(), n("div", Ze, [p[1] || (p[1] = t("svg", {
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
        onClick: p[0] || (p[0] = (m) => r("action", "reveal", {
          kind: "transcripts",
          id: e.material.id
        }))
      }, "看文稿", 8, Pe)])) : (a(), n("div", ze, [(a(!0), n(A, null, T(e.material.paragraphs, (m) => (a(), n("div", {
        key: m.id,
        class: "learning-paragraph"
      }, [t("p", {
        tabindex: "0",
        onMouseup: (d) => c(d, m),
        onKeyup: (d) => c(d, m)
      }, u(m.text), 41, Fe), t("button", {
        type: "button",
        disabled: e.disabled || [...m.text].length > 2e3,
        "aria-label": "选这段提问",
        onClick: (d) => b(m)
      }, "选段", 8, Je)]))), 128))])),
      t("div", Ee, [(a(!0), n(A, null, T(e.material.parts, (m) => (a(), n("button", {
        key: m.key,
        type: "button",
        disabled: e.disabled,
        onClick: (d) => r("action", "play", {
          materialId: e.material.id,
          partKey: m.key,
          exerciseId: e.exerciseId
        })
      }, [V(q, { name: "play" }), U(u(e.material.parts.length > 1 ? `听第 ${m.number} 段` : "播放朗读"), 1)], 8, We))), 128))]),
      e.material.parts.length ? (a(), n("small", Ge, "TTS 合成朗读")) : g("", !0)
    ]));
  }
}), le = Qe;
function re(e, l, y = []) {
  const r = (b) => l.kind === "choice" || l.kind === "order" ? l.options.find((c) => c.id === b)?.text ?? b : y.find((c) => c.id === b)?.text ?? b;
  return e.kind === "text" ? e.text : e.kind === "gaps" ? e.values.map((b) => `${l.kind === "gaps" ? l.slots.find((c) => c.id === b.id)?.text ?? "" : ""} ${b.text}`).join(`
`) : e.kind === "match" ? e.pairs.map((b) => l.kind === "match" ? `${l.left.find((c) => c.id === b.left)?.text} → ${l.right.find((c) => c.id === b.right)?.text}` : "").join(`
`) : e.ids.map(r).join(e.kind === "order" ? " → " : `
`);
}
var Xe = { class: "learning-feedback" }, Ye = { class: "learning-muted" }, _e = { key: 0 }, et = { key: 1 }, tt = { key: 0 }, at = { key: 1 }, nt = { key: 2 }, lt = ["disabled"], it = ["disabled"], st = /* @__PURE__ */ O({
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
    return (y, r) => (a(), n("section", Xe, [
      r[6] || (r[6] = t("p", { class: "learning-eyebrow" }, "已保存的原答", -1)),
      t("blockquote", null, u(s(re)(e.attempt.answer, e.response, e.paragraphs)), 1),
      t("small", Ye, [
        U(u(e.attempt.help.feedback ? "得到反馈后的再练" : e.attempt.help.answer || e.attempt.help.hint || e.attempt.help.transcript ? "这次有辅助" : "未使用答案或提示"), 1),
        e.attempt.help.replays ? (a(), n("span", _e, " · 重听 " + u(e.attempt.help.replays) + " 次", 1)) : g("", !0),
        e.attempt.help.slowPlayback ? (a(), n("span", et, " · 慢放")) : g("", !0)
      ]),
      e.feedback ? (a(), n(A, { key: 0 }, [
        t("h3", null, u(l[e.feedback.verdict]), 1),
        e.feedback.understanding ? (a(), n("p", tt, [r[2] || (r[2] = t("b", null, "理解", -1)), U(u(e.feedback.understanding), 1)])) : g("", !0),
        e.feedback.expression ? (a(), n("p", at, [r[3] || (r[3] = t("b", null, "表达", -1)), U(u(e.feedback.expression), 1)])) : g("", !0),
        e.feedback.guidance ? (a(), n("p", nt, [r[4] || (r[4] = t("b", null, "批注", -1)), U(u(e.feedback.guidance), 1)])) : g("", !0),
        t("button", {
          type: "button",
          disabled: e.disabled,
          onClick: r[0] || (r[0] = (b) => y.$emit("action", "assess", {
            attemptId: e.attempt.id,
            review: !0,
            message: "请重新审视我的原答与题目。也请考虑其他有效表达，不只对照原来的答案键。"
          }))
        }, u(e.feedback.verdict === "disputed" ? "请老师复核" : "有疑问，请复核"), 9, lt)
      ], 64)) : (a(), n(A, { key: 1 }, [r[5] || (r[5] = t("p", null, "原答已保存，等待老师评估。", -1)), t("button", {
        type: "button",
        disabled: e.disabled,
        onClick: r[1] || (r[1] = (b) => y.$emit("action", "assess", {
          attemptId: e.attempt.id,
          review: !1,
          message: "请评估这条已经保存的原答。"
        }))
      }, "重试评估", 8, it)], 64))
    ]));
  }
}), oe = st, rt = {
  key: 0,
  class: "learning-player",
  "aria-label": "课堂朗读"
}, ot = {
  key: 0,
  role: "status"
}, ut = {
  key: 2,
  class: "learning-row"
}, dt = ["aria-label", "disabled"], vt = ["max", "value"], ct = /* @__PURE__ */ O({
  __name: "LearningPlayer",
  props: { state: {} },
  emits: ["action"],
  setup(e, { emit: l }) {
    const y = l;
    function r(b) {
      return `${Math.floor(b / 60)}:${String(Math.floor(b % 60)).padStart(2, "0")}`;
    }
    return (b, c) => e.state.media.status !== "idle" ? (a(), n("section", rt, [
      e.state.media.message ? (a(), n("p", ot, u(e.state.media.message), 1)) : g("", !0),
      e.state.voices.enabled ? g("", !0) : (a(), n("button", {
        key: 1,
        type: "button",
        onClick: c[0] || (c[0] = ($) => y("action", "tts-settings"))
      }, "如何开启 TTS")),
      e.state.media.key ? (a(), n("div", ut, [
        V(q, { name: "sound" }),
        t("span", null, u(e.state.media.status === "loading" ? "正在生成声音…" : `${r(e.state.media.position)} / ${r(e.state.media.duration)}`), 1),
        e.state.media.status === "playing" ? (a(), n("button", {
          key: 0,
          type: "button",
          "aria-label": "暂停",
          onClick: c[1] || (c[1] = ($) => y("action", "pause"))
        }, [V(q, { name: "pause" })])) : [
          "paused",
          "ended",
          "blocked"
        ].includes(e.state.media.status) ? (a(), n("button", {
          key: 1,
          type: "button",
          "aria-label": e.state.media.status === "ended" ? "再听一遍" : "继续播放",
          disabled: e.state.busy,
          onClick: c[2] || (c[2] = ($) => y("action", "resume"))
        }, [V(q, { name: "play" })], 8, dt)) : g("", !0),
        t("button", {
          type: "button",
          "aria-label": "停止",
          onClick: c[3] || (c[3] = ($) => y("action", "stop"))
        }, [V(q, { name: "stop" })]),
        e.state.media.duration ? (a(), n("button", {
          key: 2,
          type: "button",
          onClick: c[4] || (c[4] = ($) => y("action", "rate", { value: e.state.media.rate === 1 ? 0.75 : 1 }))
        }, u(e.state.media.rate) + "×", 1)) : g("", !0)
      ])) : g("", !0),
      e.state.media.duration ? (a(), n("input", {
        key: 3,
        type: "range",
        min: "0",
        max: e.state.media.duration,
        step: "0.1",
        value: e.state.media.position,
        "aria-label": "当前声音片段播放位置",
        onChange: c[5] || (c[5] = ($) => y("action", "seek", { value: Number($.target.value) }))
      }, null, 40, vt)) : g("", !0)
    ])) : g("", !0);
  }
}), ue = ct;
function ie(e) {
  return {
    picked: [],
    text: "",
    values: {},
    order: e.kind === "order" ? e.options.map((l) => l.id) : []
  };
}
var bt = ["onKeydown"], gt = {
  role: "dialog",
  "aria-labelledby": "learning-activity-title",
  class: "learning-activity"
}, mt = { class: "learning-activity-header" }, yt = { id: "learning-activity-title" }, kt = {
  key: 0,
  "aria-label": "完成本课的固定奖励"
}, ft = {
  key: 0,
  class: "learning-margin-note",
  role: "status"
}, pt = {
  key: 0,
  class: "learning-activity-materials"
}, $t = {
  key: 2,
  class: "learning-selection"
}, ht = { class: "learning-row" }, Ct = ["disabled"], xt = {
  key: 3,
  class: "learning-question"
}, wt = { class: "learning-help-actions" }, It = ["disabled"], St = ["disabled"], At = ["disabled"], Mt = {
  key: 0,
  class: "learning-margin-note"
}, Lt = {
  key: 1,
  class: "learning-margin-note"
}, Tt = { key: 0 }, Vt = { key: 1 }, Ut = { key: 2 }, qt = ["disabled"], Bt = /* @__PURE__ */ O({
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
    const y = e, r = l, b = L(null), c = /* @__PURE__ */ new Map(), $ = L(null), p = L(!1), m = L(null), d = L(null);
    function f() {
      m.value ? m.value = null : p.value ? p.value = !1 : r("close");
    }
    se(d, f);
    const k = L({});
    let C = null;
    const v = H(() => y.target?.kind === "exercise" ? y.state.unit?.exercises.find((w) => w.id === y.target?.id) : void 0), I = H(() => y.state.unit?.materials.filter((w) => y.target?.kind === "material" ? w.id === y.target.id : v.value?.materialIds.includes(w.id)) ?? []), x = H(() => v.value?.id ?? y.state.unit?.exercises.find((w) => w.skill === "listening" && w.materialIds.includes(y.target?.id ?? ""))?.id ?? y.state.unit?.exercises.find((w) => w.materialIds.includes(y.target?.id ?? ""))?.id), Z = H(() => I.value.filter((w) => v.value?.response.kind !== "evidence" || w.id === v.value.response.materialId).flatMap((w) => w.paragraphs)), B = H(() => y.state.unit?.attempts.filter((w) => w.exerciseId === v.value?.id).at(-1)), G = H(() => y.state.unit?.assessments.find((w) => w.attemptId === B.value?.id));
    R(() => v.value, (w) => {
      if (!w) return;
      const h = JSON.stringify(w.response);
      k.value[w.id]?.response !== h && (k.value[w.id] = {
        response: h,
        value: ie(w.response)
      });
    }, { immediate: !0 });
    const J = H({
      get: () => k.value[v.value.id].value,
      set: (w) => {
        k.value[v.value.id].value = w;
      }
    });
    R(() => y.target, async (w, h) => {
      h && b.value && c.set(`${h.kind}:${h.id}`, b.value.scrollTop), p.value = !1, m.value = null, await W(), w && ($.value?.focus(), b.value && (b.value.scrollTop = c.get(`${w.kind}:${w.id}`) ?? 0));
    }), R(() => y.state.unit?.id, () => {
      k.value = {}, C = null;
    }), R(() => y.state.unit?.attempts, (w) => {
      if (!C) return;
      const h = w?.filter((M) => M.exerciseId === C.id).at(-1);
      if (h && h.id !== C.before) {
        const M = y.target?.kind === "exercise" && y.target.id === C.id;
        delete k.value[C.id], C = null, M && r("close");
      }
    });
    function P(w) {
      C = {
        id: v.value.id,
        before: B.value?.id
      }, r("action", "submit", {
        unitId: y.state.unit.id,
        exerciseId: v.value.id,
        answer: w
      });
    }
    return (w, h) => e.target ? (a(), n("div", {
      key: 0,
      ref_key: "layer",
      ref: d,
      class: "learning-activity-shade",
      onKeydown: Q(z(f, ["stop", "prevent"]), ["esc"])
    }, [t("section", gt, [
      t("header", mt, [
        t("h2", yt, u(v.value ? "练习" : I.value[0]?.title ?? "材料"), 1),
        e.state.unit ? (a(), n("small", kt, "+" + u(e.state.unit.reward.amount) + " 币", 1)) : g("", !0),
        t("button", {
          ref_key: "closeButton",
          ref: $,
          type: "button",
          "aria-label": "收起课件",
          onClick: h[0] || (h[0] = (M) => r("close"))
        }, [h[17] || (h[17] = U("收起", -1)), V(q, { name: "back" })], 512)
      ]),
      e.state.message && !e.state.busy ? (a(), n("p", ft, u(e.state.message), 1)) : g("", !0),
      t("div", {
        ref_key: "body",
        ref: b,
        class: "learning-activity-body"
      }, [
        v.value && I.value.length ? (a(), n("details", pt, [t("summary", null, "阅读材料 · " + u(I.value.length), 1), (a(!0), n(A, null, T(I.value, (M) => (a(), K(le, {
          key: M.id,
          material: M,
          "exercise-id": x.value,
          disabled: e.disabled,
          onAction: h[1] || (h[1] = (D, N) => r("action", D, N)),
          onSelect: h[2] || (h[2] = (D) => m.value = D)
        }, null, 8, [
          "material",
          "exercise-id",
          "disabled"
        ]))), 128))])) : v.value ? g("", !0) : (a(!0), n(A, { key: 1 }, T(I.value, (M) => (a(), K(le, {
          key: M.id,
          material: M,
          "exercise-id": x.value,
          disabled: e.disabled,
          onAction: h[3] || (h[3] = (D, N) => r("action", D, N)),
          onSelect: h[4] || (h[4] = (D) => m.value = D)
        }, null, 8, [
          "material",
          "exercise-id",
          "disabled"
        ]))), 128)),
        m.value ? (a(), n("div", $t, [t("blockquote", null, u(m.value.quote), 1), t("div", ht, [
          t("button", {
            type: "button",
            onClick: h[5] || (h[5] = (M) => r("ask", x.value, m.value))
          }, "问老师"),
          t("button", {
            type: "button",
            disabled: e.disabled || [...m.value.quote].length > 1e3,
            onClick: h[6] || (h[6] = (M) => r("action", "say", { selection: m.value }))
          }, "朗读", 8, Ct),
          t("button", {
            type: "button",
            onClick: h[7] || (h[7] = (M) => m.value = null)
          }, "取消选段")
        ])])) : g("", !0),
        v.value ? (a(), n("section", xt, [
          t("h2", null, u(v.value.prompt), 1),
          t("div", wt, [
            t("button", {
              type: "button",
              disabled: e.disabled || [...v.value.prompt].length > 1e3,
              onClick: h[8] || (h[8] = (M) => r("action", "say-question", { exerciseId: v.value.id }))
            }, "听题干", 8, It),
            v.value.hasHint ? (a(), n("button", {
              key: 0,
              type: "button",
              disabled: e.disabled || v.value.hint !== null,
              onClick: h[9] || (h[9] = (M) => r("action", "reveal", {
                kind: "hints",
                id: v.value.id
              }))
            }, "提示", 8, St)) : g("", !0),
            t("button", {
              type: "button",
              disabled: e.disabled || v.value.solution !== null,
              onClick: h[10] || (h[10] = (M) => r("action", "reveal", {
                kind: "answers",
                id: v.value.id
              }))
            }, "解答", 8, At),
            t("button", {
              type: "button",
              onClick: h[11] || (h[11] = (M) => r("ask", v.value.id))
            }, "问老师")
          ]),
          v.value.hint ? (a(), n("p", Mt, u(v.value.hint), 1)) : g("", !0),
          v.value.solution ? (a(), n("div", Lt, [v.value.solution.kind === "exact" ? (a(), n("p", Tt, u(s(re)(v.value.solution.answer, v.value.response, Z.value)), 1)) : v.value.solution.kind === "gaps" ? (a(), n("p", Vt, u(v.value.solution.accepted.map((M) => M.forms.join(" / ")).join(`
`)), 1)) : g("", !0), v.value.solution.kind !== "semantic" ? (a(), n("p", Ut, u(v.value.solution.explanation), 1)) : (a(), n("button", {
            key: 3,
            type: "button",
            onClick: h[12] || (h[12] = (M) => r("ask", v.value.id))
          }, "请老师讲解"))])) : g("", !0),
          (!B.value || p.value) && k.value[v.value.id] ? (a(), K(Be, {
            key: v.value.id,
            modelValue: J.value,
            "onUpdate:modelValue": h[13] || (h[13] = (M) => J.value = M),
            response: v.value.response,
            paragraphs: Z.value,
            disabled: e.disabled,
            onSubmit: P
          }, null, 8, [
            "modelValue",
            "response",
            "paragraphs",
            "disabled"
          ])) : g("", !0),
          B.value ? (a(), K(oe, {
            key: 3,
            attempt: B.value,
            feedback: G.value,
            response: v.value.response,
            paragraphs: Z.value,
            disabled: e.disabled,
            onAction: h[14] || (h[14] = (M, D) => {
              r("action", M, D), r("close");
            })
          }, null, 8, [
            "attempt",
            "feedback",
            "response",
            "paragraphs",
            "disabled"
          ])) : g("", !0),
          B.value ? (a(), n("button", {
            key: 4,
            type: "button",
            disabled: e.disabled,
            onClick: h[15] || (h[15] = (M) => {
              p.value = !p.value, k.value[v.value.id] ??= {
                response: JSON.stringify(v.value.response),
                value: s(ie)(v.value.response)
              };
            })
          }, u(p.value ? "收起再练" : "再试一次"), 9, qt)) : g("", !0)
        ])) : g("", !0)
      ], 512),
      V(ue, {
        state: e.state,
        onAction: h[16] || (h[16] = (M, D) => r("action", M, D))
      }, null, 8, ["state"])
    ])], 40, bt)) : g("", !0);
  }
}), Rt = Bt, Dt = { class: "learning-profile-page" }, Nt = { class: "learning-setup-heading" }, Ht = { class: "learning-language-options" }, jt = [
  "disabled",
  "aria-pressed",
  "onClick"
], Kt = { "aria-hidden": "true" }, Ot = ["disabled"], Zt = { class: "learning-teacher-options" }, Pt = [
  "disabled",
  "aria-pressed",
  "onClick"
], zt = { class: "learning-person-initial" }, Ft = {
  key: 0,
  class: "learning-selected-teacher"
}, Jt = { class: "learning-person-initial" }, Et = ["open"], Wt = ["disabled"], Gt = ["disabled"], Qt = { class: "learning-setup-actions" }, Xt = ["disabled"], Yt = ["disabled"], _t = /* @__PURE__ */ O({
  __name: "LearningSetup",
  props: {
    state: {},
    disabled: { type: Boolean }
  },
  emits: ["action", "done"],
  setup(e, { emit: l }) {
    const y = l, r = L(0), b = L(null), c = L(""), $ = [
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
    async function p(m) {
      r.value = m, await W(), b.value?.focus();
    }
    return Y(() => r.value ? (p(0), !0) : !1), (m, d) => (a(), n("section", Dt, [t("div", Nt, [t("h1", {
      ref_key: "heading",
      ref: b,
      tabindex: "-1"
    }, u(r.value === 0 ? "选择要学习的语言" : "选择老师"), 513)]), r.value === 0 ? (a(), n(A, { key: 0 }, [t("div", Ht, [(a(), n(A, null, T($, ([f, k, C]) => t("button", {
      key: f,
      type: "button",
      disabled: e.disabled,
      "aria-pressed": e.state.language === f,
      onClick: (v) => y("action", "language", { language: f })
    }, [
      t("span", Kt, u(C), 1),
      t("strong", null, u(k), 1),
      e.state.language === f ? (a(), K(q, {
        key: 0,
        name: "check"
      })) : g("", !0)
    ], 8, jt)), 64))]), t("button", {
      type: "button",
      class: "learning-primary learning-setup-next",
      disabled: e.disabled,
      onClick: d[0] || (d[0] = (f) => p(1))
    }, [d[5] || (d[5] = U("继续", -1)), V(q, { name: "arrow" })], 8, Ot)], 64)) : (a(), n(A, { key: 1 }, [
      t("div", Zt, [(a(!0), n(A, null, T(e.state.candidates, (f) => (a(), n("button", {
        key: f.name,
        type: "button",
        disabled: e.disabled,
        "aria-pressed": e.state.teacher?.name === f.name,
        onClick: (k) => y("action", "teacher", { teacher: {
          name: f.name,
          note: ""
        } })
      }, [
        t("span", zt, u([...f.name][0]), 1),
        t("strong", null, u(f.name), 1),
        e.state.teacher?.name === f.name ? (a(), K(q, {
          key: 0,
          name: "check"
        })) : g("", !0)
      ], 8, Pt))), 128))]),
      e.state.teacher && !e.state.candidates.some((f) => f.name === e.state.teacher?.name) ? (a(), n("p", Ft, [
        t("span", Jt, u([...e.state.teacher.name][0]), 1),
        U(u(e.state.teacher.name), 1),
        V(q, { name: "check" })
      ])) : g("", !0),
      t("details", {
        class: "learning-other-teacher",
        open: !e.state.candidates.length && !e.state.teacher
      }, [d[6] || (d[6] = t("summary", null, "选择其他人物", -1)), t("form", {
        class: "learning-row",
        onSubmit: d[2] || (d[2] = z((f) => y("action", "teacher", { teacher: {
          name: c.value.trim(),
          note: ""
        } }), ["prevent"]))
      }, [j(t("input", {
        "onUpdate:modelValue": d[1] || (d[1] = (f) => c.value = f),
        type: "text",
        "aria-label": "其他人物名字",
        maxlength: "80",
        placeholder: "输入人物名字",
        disabled: e.disabled
      }, null, 8, Wt), [[X, c.value]]), t("button", {
        type: "submit",
        disabled: e.disabled || !c.value.trim()
      }, "选这位", 8, Gt)], 32)], 8, Et),
      t("div", Qt, [t("button", {
        type: "button",
        disabled: e.disabled,
        onClick: d[3] || (d[3] = (f) => p(0))
      }, "上一步", 8, Xt), t("button", {
        type: "button",
        class: "learning-primary",
        disabled: e.disabled || !e.state.teacher,
        onClick: d[4] || (d[4] = (f) => y("done"))
      }, [d[7] || (d[7] = U("和老师聊聊", -1)), V(q, { name: "arrow" })], 8, Yt)])
    ], 64))]));
  }
}), ea = _t, ta = { class: "learning-records-page" }, aa = { class: "learning-page-heading" }, na = {
  key: 0,
  class: "learning-muted"
}, la = { class: "learning-muted" }, ia = {
  key: 0,
  class: "learning-muted"
}, sa = ["disabled", "onClick"], ra = ["disabled"], oa = {
  key: 0,
  class: "learning-empty-note"
}, ua = ["disabled", "onClick"], da = { key: 0 }, va = {
  key: 1,
  class: "learning-row"
}, ca = ["disabled"], ba = { class: "learning-muted" }, ga = ["disabled"], ma = /* @__PURE__ */ O({
  __name: "LearningRecords",
  props: {
    state: {},
    disabled: { type: Boolean }
  },
  emits: ["action", "remove"],
  setup(e, { emit: l }) {
    const y = e, r = l;
    Y(() => y.state.record ? (r("action", "records", { offset: y.state.records.offset }), !0) : !1);
    const b = {
      unassessed: "尚待练习",
      review: "待复核",
      independent: "已能独立使用",
      practised: "练过一次",
      strengthen: "再练练"
    };
    return (c, $) => (a(), n("section", ta, [t("div", aa, [$[5] || ($[5] = t("h1", null, "学习记录", -1)), e.state.records.total ? (a(), n("span", na, u(e.state.records.total) + " 项", 1)) : g("", !0)]), e.state.record ? (a(), n(A, { key: 0 }, [
      t("button", {
        type: "button",
        onClick: $[0] || ($[0] = (p) => c.$emit("action", "records", { offset: e.state.records.offset }))
      }, "‹ 返回记录"),
      t("h2", null, u(e.state.record.label), 1),
      (a(!0), n(A, null, T(e.state.record.evidence, (p) => (a(), n("article", {
        key: p.attempt.id,
        class: "learning-record-evidence"
      }, [
        t("p", la, u(new Date(p.attempt.submittedAt).toLocaleDateString()), 1),
        t("h3", null, u(p.exercise.prompt), 1),
        (a(!0), n(A, null, T(p.materials, (m) => (a(), n("details", { key: m.id }, [t("summary", null, u(m.title), 1), m.hidden ? (a(), n("p", ia, "听力文稿尚未展开；原答和反馈如下。")) : (a(!0), n(A, { key: 1 }, T(m.paragraphs, (d) => (a(), n("p", { key: d.id }, u(d.text), 1))), 128))]))), 128)),
        V(oe, {
          attempt: p.attempt,
          feedback: p.assessment,
          response: p.exercise.response,
          paragraphs: p.materials.flatMap((m) => m.paragraphs),
          disabled: e.disabled,
          onAction: $[1] || ($[1] = (m, d) => c.$emit("action", m, d))
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
          onClick: (m) => c.$emit("remove", "delete-attempt", { id: p.attempt.id }, "删除这条原答和依赖它的反馈？相关学习项会重新计算，不撤回已到账奖励。")
        }, "删除这条原答", 8, sa)
      ]))), 128)),
      t("button", {
        type: "button",
        disabled: e.disabled,
        onClick: $[2] || ($[2] = (p) => c.$emit("remove", "delete-item", { id: e.state.record.id }, "删除这个学习项及其不再被引用的证据？当前课程不会被删除。"))
      }, "删除学习项", 8, ra)
    ], 64)) : (a(), n(A, { key: 1 }, [
      e.state.records.total ? g("", !0) : (a(), n("p", oa, "暂无学习记录")),
      (a(!0), n(A, null, T(e.state.records.items, (p) => (a(), n("button", {
        key: p.id,
        class: "learning-record-row",
        type: "button",
        disabled: !p.readable,
        onClick: (m) => c.$emit("action", "records", {
          id: p.id,
          offset: e.state.records.offset
        })
      }, [t("span", null, [t("strong", null, u(p.label), 1), t("small", null, [U(u(p.evidenceCount) + " 份作答依据", 1), p.nextReviewAt ? (a(), n("span", da, " · 建议 " + u(new Date(p.nextReviewAt).toLocaleDateString()) + " 再练", 1)) : g("", !0)])]), t("em", null, u(b[p.state]), 1)], 8, ua))), 128)),
      e.state.records.total > 30 ? (a(), n("div", va, [
        t("button", {
          type: "button",
          disabled: e.state.records.offset === 0,
          onClick: $[3] || ($[3] = (p) => c.$emit("action", "records", { offset: Math.max(0, e.state.records.offset - 30) }))
        }, "上一页", 8, ca),
        t("span", ba, u(e.state.records.total) + " 项", 1),
        t("button", {
          type: "button",
          disabled: e.state.records.offset + 30 >= e.state.records.total,
          onClick: $[4] || ($[4] = (p) => c.$emit("action", "records", { offset: e.state.records.offset + 30 }))
        }, "下一页", 8, ga)
      ])) : g("", !0)
    ], 64))]));
  }
}), ya = ma, ka = { class: "learning-conversation" }, fa = { class: "learning-conversation-heading" }, pa = { class: "learning-person-initial" }, $a = ["disabled"], ha = {
  key: 0,
  class: "learning-history-notice"
}, Ca = { class: "learning-conversation-user" }, xa = { class: "learning-conversation-teacher" }, wa = ["disabled", "onClick"], Ia = {
  key: 1,
  class: "learning-conversation-tools"
}, Sa = ["disabled"], Aa = ["disabled"], Ma = {
  key: 1,
  class: "learning-conversation-user"
}, La = {
  key: 2,
  class: "learning-conversation-empty"
}, Ta = ["disabled"], Va = { key: 2 }, Ua = { class: "learning-composer-input" }, qa = {
  key: 0,
  class: "learning-composer-quote"
}, Ba = ["maxlength", "onKeydown"], Ra = ["disabled"], Da = /* @__PURE__ */ O({
  __name: "LearningConversation",
  props: {
    state: {},
    disabled: { type: Boolean }
  },
  emits: [
    "action",
    "present",
    "profile"
  ],
  setup(e, { expose: l, emit: y }) {
    const r = e, b = y, c = L(""), $ = L(null), p = L(null), m = L(null);
    let d = "", f = 0;
    R(() => r.state.conversation.turns.length + r.state.conversation.removedTurns, (v) => {
      const I = r.state.conversation.turns.at(-1), x = m.value?.selection ? `${d}

${m.value.selection.quote}` : d;
      v > f && I?.user === x && c.value.trim() === d && (c.value = "", d = "", m.value = null);
    }), R([
      () => r.state.chatIdentity,
      () => r.state.language,
      () => r.state.teacher?.name
    ], () => {
      c.value = "", d = "", m.value = null;
    }), R(() => r.state.unit?.id, () => {
      m.value = null;
    }), R(() => r.state.conversation.turns.length, (v, I) => {
      !v && I && !r.state.busy && (c.value = "", d = "");
    });
    function k() {
      r.disabled || !c.value.trim() || (d = c.value.trim(), f = r.state.conversation.turns.length + r.state.conversation.removedTurns, b("action", m.value ? "explain" : "talk", {
        message: d,
        ...m.value ?? {}
      }));
    }
    R(() => r.state.conversation.pending, async () => {
      await W(), p.value && (p.value.scrollTop = p.value.scrollHeight);
    }), R(() => r.state.conversation.turns.length, async () => {
      const v = p.value;
      !v || v.scrollHeight - v.scrollTop - v.clientHeight > 100 || (await W(), v.scrollTop = v.scrollHeight);
    });
    function C(v) {
      return v.kind === "replacement" ? !r.disabled && r.state.currentUnitId === v.unitId : r.state.unit?.id === v.unitId && (v.kind === "exercise" ? r.state.unit.exercises : r.state.unit.materials).some((I) => I.id === v.id);
    }
    return l({
      async ask(v, I) {
        m.value = {
          exerciseId: v,
          selection: I
        }, await W(), $.value?.focus();
      },
      focus: () => $.value?.focus({ preventScroll: !0 })
    }), (v, I) => (a(), n("section", ka, [
      t("header", fa, [
        t("span", pa, u([...e.state.teacher?.name ?? "师"][0]), 1),
        t("h1", null, u(e.state.teacher?.name ?? "老师"), 1),
        t("button", {
          type: "button",
          disabled: e.disabled,
          "aria-label": "更换学习语言和老师",
          onClick: I[0] || (I[0] = (x) => b("profile"))
        }, u(new Intl.DisplayNames(["zh-CN"], { type: "language" }).of(e.state.language)), 9, $a)
      ]),
      t("div", {
        ref_key: "scroller",
        ref: p,
        class: "learning-conversation-turns",
        "aria-label": "师生对话"
      }, [
        e.state.conversation.removedTurns ? (a(), n("p", ha, "较早对话已释放，学习记录仍保留。")) : g("", !0),
        (a(!0), n(A, null, T(e.state.conversation.turns, (x, Z) => (a(), n("div", {
          key: Z,
          class: "learning-conversation-turn"
        }, [
          t("p", Ca, u(x.user), 1),
          t("p", xa, u(x.teacher), 1),
          x.presentation ? (a(), n("button", {
            key: 0,
            type: "button",
            class: "learning-activity-link",
            disabled: !C(x.presentation),
            onClick: (B) => b("present", x.presentation)
          }, [
            V(q, { name: x.presentation.kind === "material" ? "book" : "records" }, null, 8, ["name"]),
            t("span", null, u(x.presentation.title), 1),
            V(q, { name: "arrow" })
          ], 8, wa)) : g("", !0),
          Z === e.state.conversation.turns.length - 1 && e.state.reply?.text === x.teacher ? (a(), n("div", Ia, [[...x.teacher].length <= 1e3 ? (a(), n("button", {
            key: 0,
            type: "button",
            disabled: e.disabled,
            onClick: I[1] || (I[1] = (B) => b("action", "say-reply"))
          }, [V(q, { name: "sound" }), I[7] || (I[7] = U("听老师说", -1))], 8, Sa)) : g("", !0), e.state.reply.exerciseId && [...x.teacher].length <= 4e3 ? (a(), n("button", {
            key: 1,
            type: "button",
            disabled: e.disabled || e.state.unit?.notes.some((B) => B.text === x.teacher),
            onClick: I[2] || (I[2] = (B) => b("action", "save-note"))
          }, "保存笔记", 8, Aa)) : g("", !0)])) : g("", !0)
        ]))), 128)),
        e.state.conversation.pending ? (a(), n("p", Ma, u(e.state.conversation.pending), 1)) : g("", !0),
        !e.state.conversation.turns.length && !e.state.conversation.pending ? (a(), n("div", La, [
          V(q, { name: "chat" }),
          t("p", null, u(e.state.teacher ? "今天想学什么？" : "先选一位老师"), 1),
          e.state.teacher ? (a(), n("button", {
            key: 1,
            type: "button",
            disabled: e.disabled,
            onClick: I[4] || (I[4] = (x) => b("action", "talk", { message: e.state.profile ? "请根据我的学习目标和记录，带我继续学习。" : "我想跟你学习这门语言，先聊聊我的水平和目标吧。" }))
          }, u(e.state.profile ? "继续学习" : "开始交流"), 9, Ta)) : (a(), n("button", {
            key: 0,
            class: "learning-primary",
            type: "button",
            onClick: I[3] || (I[3] = (x) => b("profile"))
          }, "选择老师")),
          e.state.teacher ? (a(), n("small", Va, "交流与教学会调用模型")) : g("", !0)
        ])) : g("", !0)
      ], 512),
      e.state.teacher ? (a(), n("form", {
        key: 0,
        class: "learning-conversation-compose",
        onSubmit: z(k, ["prevent"])
      }, [t("div", Ua, [m.value ? (a(), n("div", qa, [t("span", null, u(m.value.selection?.quote ?? "请教这道题"), 1), t("button", {
        type: "button",
        "aria-label": "取消引用",
        onClick: I[5] || (I[5] = (x) => m.value = null)
      }, "×")])) : g("", !0), j(t("textarea", {
        ref_key: "composer",
        ref: $,
        "onUpdate:modelValue": I[6] || (I[6] = (x) => c.value = x),
        rows: "2",
        maxlength: m.value?.selection ? 1800 : m.value?.exerciseId ? 2e3 : 4e3,
        "aria-label": "和老师说",
        placeholder: "和老师说…",
        onKeydown: [Q(z(k, ["ctrl", "prevent"]), ["enter"]), Q(z(k, ["meta", "prevent"]), ["enter"])]
      }, null, 40, Ba), [[X, c.value]])]), t("button", {
        type: "submit",
        class: "learning-primary",
        disabled: e.disabled || !c.value.trim(),
        "aria-label": "发送给老师"
      }, [V(q, { name: "arrow" })], 8, Ra)], 32)) : g("", !0)
    ]));
  }
}), Na = Da;
function Ha(e) {
  const l = ge(structuredClone(me(e.initialState))), y = L(!1), r = L("");
  let b = !1, c = 0, $ = () => {
  };
  const p = H(() => !y.value && !l.value.busy && l.value.storage === "ready");
  async function m(d, f = {}) {
    if (y.value) return;
    y.value = !0, r.value = "";
    const k = l.value.chatIdentity, C = c;
    try {
      const v = await e.bridge.request(`learning/${d}`, {
        chatIdentity: k,
        ...f
      }, 35e3);
      return !b || l.value.chatIdentity !== k ? void 0 : (c === C && v.result.state.chatIdentity === k && (l.value = v.result.state), v.result);
    } catch {
      b && l.value.chatIdentity === k && (r.value = "暂未收到操作结果。请先读取已保存内容，不要重复提交或生成。");
    } finally {
      b && (y.value = !1);
    }
  }
  return ve(() => {
    b = !0, $ = e.bridge.subscribe((d) => {
      if (d.type === "learning/media") {
        l.value = {
          ...l.value,
          media: d.payload.media
        };
        return;
      }
      if (d.type !== "learning/state") return;
      const f = d.payload.state;
      f.chatIdentity === l.value.chatIdentity && (c++, l.value = f, r.value = "");
    });
  }), be(() => {
    b = !1, $();
  }), {
    state: l,
    pending: y,
    writable: p,
    localMessage: r,
    request: m
  };
}
var ja = {
  class: "learning-app",
  "aria-label": "语伴语言学习"
}, Ka = { class: "learning-toolbar" }, Oa = { "aria-label": "学习资料与设置" }, Za = { "aria-label": "学习资料与设置" }, Pa = ["onClick"], za = ["disabled"], Fa = {
  key: 2,
  class: "learning-row"
}, Ja = ["disabled"], Ea = ["disabled"], Wa = ["disabled"], Ga = ["disabled"], Qa = {
  key: 1,
  class: "learning-materials-page"
}, Xa = {
  key: 0,
  class: "learning-empty-note"
}, Ya = { class: "learning-materials-title" }, _a = ["onClick"], en = ["onClick"], tn = {
  key: 0,
  class: "learning-notes"
}, an = { key: 0 }, nn = ["disabled", "onClick"], ln = {
  key: 2,
  class: "learning-goals-page"
}, sn = { key: 0 }, rn = { key: 1 }, on = { key: 2 }, un = {
  key: 1,
  class: "learning-empty-note"
}, dn = {
  key: 4,
  class: "learning-harvest-page"
}, vn = {
  key: 0,
  class: "learning-empty-note"
}, cn = { class: "learning-muted" }, bn = ["disabled", "onClick"], gn = ["disabled"], mn = ["disabled"], yn = {
  key: 3,
  class: "learning-row"
}, kn = ["disabled"], fn = ["disabled"], pn = {
  key: 5,
  class: "learning-settings-page"
}, $n = ["value", "disabled"], hn = ["value"], Cn = {
  key: 0,
  class: "learning-muted"
}, xn = ["value", "disabled"], wn = ["disabled"], In = ["disabled"], Sn = ["disabled"], An = ["disabled"], Mn = ["disabled"], Ln = ["disabled"], Tn = ["disabled"], Vn = {
  role: "alertdialog",
  "aria-labelledby": "learning-confirm-title",
  class: "learning-confirm"
}, Un = { class: "learning-row" }, qn = ["disabled"], Bn = /* @__PURE__ */ O({
  __name: "LearningApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(e) {
    const { state: l, pending: y, writable: r, localMessage: b, request: c } = Ha(e), $ = L(l.value.teacher ? "teacher" : "profile"), p = [], m = L(null), d = L(!1);
    Y(() => m.value?.open ? (m.value.open = !1, !0) : !1, () => d.value);
    const f = L(null), k = L(null), C = L(null), v = {};
    let I = 0;
    R(() => !!l.value.record, async (S, i) => {
      $.value !== "records" || S === i || (S && (I = C.value?.scrollTop ?? 0), await W(), $.value === "records" && C.value && (C.value.scrollTop = S ? 0 : I));
    });
    const x = L(null), Z = L(null);
    se(Z, () => {
      x.value = null;
    });
    const B = L(l.value.profile?.voice?.voiceId ?? l.value.voices.defaultVoice), G = L(l.value.profile?.voice?.language ?? l.value.language), J = L(l.value.profile?.voice?.speed ?? 1), P = L(0), w = H(() => l.value.completions.slice(P.value * 20, (P.value + 1) * 20));
    R([() => l.value.language, () => l.value.profile?.voice], ([S, i]) => {
      B.value = i?.voiceId ?? l.value.voices.defaultVoice, G.value = i?.language ?? S, J.value = i?.speed ?? 1;
    }), R([
      () => l.value.chatIdentity,
      () => l.value.language,
      () => l.value.teacher?.name
    ], () => {
      k.value = null, x.value = null, P.value = 0;
    }), R(() => l.value.currentUnitId, (S) => {
      x.value?.action === "replace-lesson" && x.value.input.unitId !== S && (x.value = null);
    }), R(() => l.value.unit, (S) => {
      const i = k.value;
      i && (S?.id !== i.unitId || !(i.kind === "exercise" ? S.exercises : S.materials).some((o) => o.id === i.id)) && M();
    }), R(() => l.value.conversation.turns.length + l.value.conversation.removedTurns, (S, i) => {
      const o = l.value.conversation.turns.at(-1)?.presentation;
      S > i && o && h(o);
    });
    function h(S) {
      if (S.kind === "replacement") {
        if (l.value.currentUnitId !== S.unitId || l.value.storage !== "ready") return;
        F("replace-lesson", {
          unitId: S.unitId,
          message: S.message
        }, "换一课？新课保存成功后会替换当前课件、原答和笔记；学习记录和已获得的奖励资格保留。");
        return;
      }
      l.value.unit?.id === S.unitId && (k.value = S);
    }
    function M() {
      k.value = null, c("stop");
    }
    async function D(S, i) {
      M(), await N("teacher"), await f.value?.ask(S, i);
    }
    async function N(S, i = !1) {
      if (S !== $.value && !i) if (S === "teacher") p.length = 0;
      else {
        const o = p.indexOf(S);
        o >= 0 ? p.splice(o) : p.push($.value);
      }
      if (C.value && (v[$.value] = C.value.scrollTop), m.value && (m.value.open = !1), $.value = S, await W(), C.value) {
        C.value.scrollTop = v[S] ?? 0;
        const o = [...C.value.querySelectorAll("h1")].find((E) => E.offsetParent !== null);
        o && (o.tabIndex = -1, o.focus({ preventScroll: !0 }));
      }
    }
    const te = Y(() => m.value?.open ? (m.value.open = !1, !0) : $.value === "teacher" || !p.length && $.value === "profile" && !l.value.teacher ? !1 : (N(p.pop() ?? "teacher", !0), !0));
    function F(S, i, o) {
      x.value = {
        action: S,
        input: i,
        text: o
      };
    }
    async function de() {
      const S = await c("export");
      if (!S?.document) return;
      const i = URL.createObjectURL(new Blob([JSON.stringify(S.document, null, 2)], { type: "application/json" })), o = document.createElement("a");
      o.href = i, o.download = "LittleWhiteBox_Learning.json", o.click(), setTimeout(() => URL.revokeObjectURL(i), 1e3);
    }
    return (S, i) => (a(), n("section", ja, [
      t("header", Ka, [
        $.value !== "teacher" && (s(l).teacher || p.length) ? (a(), n("button", {
          key: 0,
          type: "button",
          class: "learning-toolbar-back",
          "aria-label": "返回上一页",
          onClick: i[0] || (i[0] = (...o) => s(te) && s(te)(...o))
        }, [V(q, { name: "back" })])) : g("", !0),
        t("button", {
          type: "button",
          class: "learning-wordmark",
          onClick: i[1] || (i[1] = (o) => N("teacher"))
        }, [...i[31] || (i[31] = [t("span", {
          class: "learning-brand-mark",
          "aria-hidden": "true"
        }, [U("a"), t("span", null, "あ")], -1), U("语伴", -1)])]),
        t("details", {
          ref_key: "menu",
          ref: m,
          class: "learning-menu",
          onToggle: i[2] || (i[2] = (o) => d.value = !!m.value?.open),
          onKeydown: i[3] || (i[3] = Q(z((o) => m.value.open = !1, ["stop", "prevent"]), ["esc"]))
        }, [t("summary", Oa, [V(q, { name: "more" })]), t("nav", Za, [(a(), n(A, null, T([
          ["materials", "课件与笔记"],
          ["records", "学习记录"],
          ["goals", "学习目标"],
          ["harvest", "我的收获"],
          ["settings", "设置"]
        ], ([o, E]) => t("button", {
          key: o,
          type: "button",
          onClick: (Rn) => N(o)
        }, u(E), 9, Pa)), 64))])], 544)
      ]),
      s(l).busy || s(l).message || s(b) || s(l).storage !== "ready" ? (a(), n("div", {
        key: 0,
        class: _(["learning-notice", { "is-working": s(l).busy }]),
        role: "status",
        "aria-live": "polite"
      }, [s(l).busy ? (a(), n(A, { key: 0 }, [
        i[32] || (i[32] = t("span", { class: "learning-working-dot" }, null, -1)),
        U(u(s(l).message || "正在处理学习操作…"), 1),
        t("button", {
          type: "button",
          disabled: s(y),
          onClick: i[4] || (i[4] = (o) => s(c)("cancel"))
        }, "停止", 8, za)
      ], 64)) : (a(), n(A, { key: 1 }, [U(u(s(b) || s(l).message || (s(l).storage === "unconfirmed" ? "上次保存尚未确认，请先核实。" : s(l).storage === "conflict" ? "学习文件出现另一版本，请先核实。" : "暂时无法读取学习文件。")), 1)], 64)), s(l).busy ? g("", !0) : (a(), n("div", Fa, [
        s(l).storage === "unconfirmed" || s(l).storage === "conflict" ? (a(), n("button", {
          key: 0,
          type: "button",
          disabled: s(y),
          onClick: i[5] || (i[5] = (o) => s(c)("verify"))
        }, "核实保存", 8, Ja)) : g("", !0),
        s(l).storage === "unconfirmed" ? (a(), n("button", {
          key: 1,
          type: "button",
          disabled: s(y),
          onClick: i[6] || (i[6] = (o) => s(c)("retry-save"))
        }, "重试原保存", 8, Ea)) : g("", !0),
        s(l).storage === "conflict" ? (a(), n("button", {
          key: 2,
          type: "button",
          disabled: s(y),
          onClick: i[7] || (i[7] = (o) => F("adopt-server", {}, "采用服务器上的学习文件？未确认的本次修改将不再作为候选保留。"))
        }, "采用服务器版本", 8, Wa)) : g("", !0),
        s(l).storage === "unloaded" || s(b) ? (a(), n("button", {
          key: 3,
          type: "button",
          disabled: s(y),
          onClick: i[8] || (i[8] = (o) => s(c)("read"))
        }, "重试读取", 8, Ga)) : g("", !0)
      ]))], 2)) : g("", !0),
      j(V(Na, {
        ref_key: "conversation",
        ref: f,
        state: s(l),
        disabled: !s(r),
        onAction: s(c),
        onPresent: h,
        onProfile: i[9] || (i[9] = (o) => N("profile"))
      }, null, 8, [
        "state",
        "disabled",
        "onAction"
      ]), [[ne, $.value === "teacher"]]),
      j(t("div", {
        ref_key: "scroller",
        ref: C,
        class: "learning-scroll"
      }, [
        $.value === "profile" ? (a(), K(ea, {
          key: 0,
          state: s(l),
          disabled: !s(r),
          onAction: s(c),
          onDone: i[10] || (i[10] = (o) => N("teacher"))
        }, null, 8, [
          "state",
          "disabled",
          "onAction"
        ])) : g("", !0),
        $.value === "materials" ? (a(), n("section", Qa, [
          i[33] || (i[33] = t("h1", null, "课件与笔记", -1)),
          s(l).unit ? g("", !0) : (a(), n("p", Xa, u(s(l).blockedUnit ? "当前课件在另一个故事中" : "还没有课件"), 1)),
          s(l).unit ? (a(), n(A, { key: 1 }, [
            t("p", Ya, u(s(l).unit.title), 1),
            (a(!0), n(A, null, T(s(l).unit.materials, (o) => (a(), n("button", {
              key: o.id,
              type: "button",
              class: "learning-activity-link",
              onClick: (E) => h({
                unitId: s(l).unit.id,
                kind: "material",
                id: o.id,
                title: o.title
              })
            }, [
              V(q, { name: "book" }),
              t("span", null, u(o.title), 1),
              V(q, { name: "arrow" })
            ], 8, _a))), 128)),
            (a(!0), n(A, null, T(s(l).unit.exercises, (o) => (a(), n("button", {
              key: o.id,
              type: "button",
              class: "learning-activity-link",
              onClick: (E) => h({
                unitId: s(l).unit.id,
                kind: "exercise",
                id: o.id,
                title: o.prompt
              })
            }, [
              V(q, { name: "records" }),
              t("span", null, u(o.prompt), 1),
              V(q, { name: "arrow" })
            ], 8, en))), 128)),
            s(l).unit.notes.length ? (a(), n("section", tn, [(a(!0), n(A, null, T(s(l).unit.notes, (o) => (a(), n("article", { key: o.id }, [
              o.selection ? (a(), n("blockquote", an, u(o.selection.quote), 1)) : g("", !0),
              t("p", null, u(o.text), 1),
              t("button", {
                type: "button",
                disabled: !s(r),
                onClick: (E) => s(c)("delete-note", { id: o.id })
              }, "删除笔记", 8, nn)
            ]))), 128))])) : g("", !0)
          ], 64)) : g("", !0)
        ])) : g("", !0),
        $.value === "goals" ? (a(), n("section", ln, [
          i[35] || (i[35] = t("h1", null, "学习目标", -1)),
          s(l).profile ? (a(), n(A, { key: 0 }, [
            t("p", null, u(s(l).profile.goal.description), 1),
            s(l).profile.goal.exam ? (a(), n("p", sn, u(s(l).profile.goal.exam), 1)) : g("", !0),
            s(l).profile.goal.targetLevel ? (a(), n("p", rn, u(s(l).profile.goal.targetLevel), 1)) : g("", !0),
            s(l).profile.goal.targetDate ? (a(), n("p", on, u(s(l).profile.goal.targetDate), 1)) : g("", !0),
            i[34] || (i[34] = t("h2", null, "自评水平", -1)),
            t("p", null, u(s(l).profile.selfAssessment), 1)
          ], 64)) : (a(), n("p", un, "还没有记录目标")),
          t("button", {
            type: "button",
            class: "learning-primary",
            onClick: i[11] || (i[11] = (o) => {
              N("teacher"), f.value?.focus();
            })
          }, "和老师聊聊")
        ])) : g("", !0),
        $.value === "records" ? (a(), K(ya, {
          key: 3,
          state: s(l),
          disabled: !s(r),
          onAction: s(c),
          onRemove: F
        }, null, 8, [
          "state",
          "disabled",
          "onAction"
        ])) : g("", !0),
        $.value === "harvest" ? (a(), n("section", dn, [
          i[37] || (i[37] = t("div", { class: "learning-page-heading" }, [t("h1", null, "我的收获")], -1)),
          s(l).completions.length ? g("", !0) : (a(), n("p", vn, "还没有完成的课程")),
          (a(!0), n(A, null, T(w.value, (o) => (a(), n("article", {
            key: o.unitId,
            class: "learning-harvest-entry"
          }, [
            t("small", null, u(new Date(o.completedAt).toLocaleDateString()), 1),
            t("h2", null, [U("+" + u(o.amount), 1), i[36] || (i[36] = t("span", null, "小白币", -1))]),
            t("p", null, u(o.summary), 1),
            t("p", cn, u(o.paid ? "已到账" : o.originHere ? "学习已完成，等待到账" : "请回到开课的原聊天领取"), 1),
            !o.paid && o.originHere ? (a(), n("button", {
              key: 0,
              type: "button",
              disabled: !s(r),
              onClick: (E) => s(c)("reward", {
                unitId: o.unitId,
                openWallet: !s(l).walletOpen
              })
            }, u(s(l).walletOpen ? "核实并补领" : "开通钱包并领取"), 9, bn)) : g("", !0)
          ]))), 128)),
          s(l).chatStorage === "unconfirmed" || s(l).chatStorage === "conflict" || s(l).chatStorage === "failed" ? (a(), n("button", {
            key: 1,
            type: "button",
            disabled: s(y) || s(l).busy,
            onClick: i[12] || (i[12] = (o) => s(c)("verify-wallet"))
          }, "核实账本保存", 8, gn)) : g("", !0),
          s(l).chatStorage === "conflict" ? (a(), n("button", {
            key: 2,
            type: "button",
            disabled: s(y) || s(l).busy,
            onClick: i[13] || (i[13] = (o) => F("adopt-wallet", {}, "采用服务器上的聊天账本？本次未确认的候选将被放下，之后可凭已保存的学习完成记录核实并补领。"))
          }, "采用服务器账本", 8, mn)) : g("", !0),
          s(l).completions.length > 20 ? (a(), n("div", yn, [t("button", {
            type: "button",
            disabled: P.value === 0,
            onClick: i[14] || (i[14] = (o) => P.value--)
          }, "上一页", 8, kn), t("button", {
            type: "button",
            disabled: (P.value + 1) * 20 >= s(l).completions.length,
            onClick: i[15] || (i[15] = (o) => P.value++)
          }, "下一页", 8, fn)])) : g("", !0)
        ])) : g("", !0),
        $.value === "settings" ? (a(), n("section", pn, [
          i[46] || (i[46] = t("h1", null, "学习设置", -1)),
          t("label", null, [i[38] || (i[38] = U("当前语言", -1)), t("select", {
            value: s(l).language,
            disabled: !s(r),
            onChange: i[16] || (i[16] = (o) => s(c)("language", { language: o.target.value }))
          }, [(a(!0), n(A, null, T([.../* @__PURE__ */ new Set([s(l).language, ...s(l).languages])], (o) => (a(), n("option", {
            key: o,
            value: o
          }, u(new Intl.DisplayNames(["zh-CN"], { type: "language" }).of(o)), 9, hn))), 128))], 40, $n)]),
          t("button", {
            type: "button",
            onClick: i[17] || (i[17] = (o) => N("profile"))
          }, "更换语言和老师 →"),
          t("section", null, [
            i[43] || (i[43] = t("h2", null, "老师的声音", -1)),
            s(l).voices.enabled ? (a(), n("form", {
              key: 1,
              onSubmit: i[21] || (i[21] = z((o) => s(c)("voice", { voice: {
                voiceId: B.value,
                language: G.value,
                speed: Number(J.value)
              } }), ["prevent"]))
            }, [
              t("label", null, [i[39] || (i[39] = U("音色", -1)), j(t("select", { "onUpdate:modelValue": i[18] || (i[18] = (o) => B.value = o) }, [(a(!0), n(A, null, T(s(l).voices.voices, (o) => (a(), n("option", {
                key: o.id,
                value: o.id,
                disabled: !o.available
              }, u(o.name) + u(o.available ? "" : "（暂不可用）"), 9, xn))), 128))], 512), [[ee, B.value]])]),
              t("label", null, [i[40] || (i[40] = U("发音语言", -1)), j(t("input", {
                "onUpdate:modelValue": i[19] || (i[19] = (o) => G.value = o),
                type: "text",
                maxlength: "80",
                placeholder: "en / ja"
              }, null, 512), [[X, G.value]])]),
              t("label", null, [i[42] || (i[42] = U("合成语速", -1)), j(t("select", { "onUpdate:modelValue": i[20] || (i[20] = (o) => J.value = o) }, [...i[41] || (i[41] = [
                t("option", { value: 0.75 }, "0.75×", -1),
                t("option", { value: 1 }, "1×", -1),
                t("option", { value: 1.25 }, "1.25×", -1)
              ])], 512), [[ee, J.value]])]),
              t("button", {
                type: "submit",
                disabled: !s(r) || !s(l).profile
              }, "保存声音偏好", 8, wn)
            ], 32)) : (a(), n("p", Cn, "使用语音前，请先开启 TTS 模块。文字学习不受影响。")),
            t("button", {
              type: "button",
              onClick: i[22] || (i[22] = (o) => s(c)("tts-settings"))
            }, u(s(l).voices.enabled ? "打开 TTS 设置" : "如何开启 TTS"), 1),
            i[44] || (i[44] = t("small", null, "已听过的题保留原声音，新偏好用于之后的题目。", -1))
          ]),
          t("section", null, [
            i[45] || (i[45] = t("h2", null, "学习数据", -1)),
            t("button", {
              type: "button",
              disabled: s(y) || s(l).busy,
              onClick: i[23] || (i[23] = (o) => F("forget-conversation", {}, "清空和当前老师的临时对话？目标、课件、学习记录和奖励都会保留。"))
            }, "清空师生对话", 8, In),
            t("button", {
              type: "button",
              disabled: !s(r),
              onClick: de
            }, "导出学习数据", 8, Sn),
            t("button", {
              type: "button",
              disabled: s(y) || s(l).busy,
              onClick: i[24] || (i[24] = (o) => s(c)("read"))
            }, "重新读取保存内容", 8, An),
            s(l).unit || s(l).blockedUnit ? (a(), n("button", {
              key: 0,
              type: "button",
              disabled: !s(r),
              onClick: i[25] || (i[25] = (o) => F("abandon", {}, "放下当前这一课？本课课件、原答和笔记会移除；已被学习项保留的证据和完成奖励资格仍保留。"))
            }, "放下当前课件", 8, Mn)) : g("", !0),
            t("button", {
              type: "button",
              class: "learning-danger",
              disabled: !s(r) || !s(l).profile,
              onClick: i[26] || (i[26] = (o) => F("delete-language", {}, "删除当前语言的全部学习数据？未领取奖励也将放弃，已到账流水保留。"))
            }, "删除当前语言", 8, Ln),
            t("button", {
              type: "button",
              class: "learning-danger",
              disabled: !s(r),
              onClick: i[27] || (i[27] = (o) => F("clear", {}, "清空所有语言的目标、课程和记录？未领取奖励也将放弃。已到账流水不撤销。"))
            }, "清空全部学习数据", 8, Tn)
          ])
        ])) : g("", !0)
      ], 512), [[ne, $.value !== "teacher"]]),
      k.value ? g("", !0) : (a(), K(ue, {
        key: 1,
        state: s(l),
        onAction: s(c)
      }, null, 8, ["state", "onAction"])),
      s(l).unit ? (a(), K(Rt, {
        key: `${s(l).chatIdentity}:${s(l).language}:${s(l).unit.id}`,
        state: s(l),
        target: k.value,
        disabled: !s(r),
        onAction: s(c),
        onClose: M,
        onAsk: D
      }, null, 8, [
        "state",
        "target",
        "disabled",
        "onAction"
      ])) : g("", !0),
      x.value ? (a(), n("div", {
        key: 3,
        ref_key: "confirmLayer",
        ref: Z,
        class: "learning-confirm-shade",
        onKeydown: i[30] || (i[30] = Q(z((o) => x.value = null, ["stop", "prevent"]), ["esc"]))
      }, [t("section", Vn, [
        i[47] || (i[47] = t("h2", { id: "learning-confirm-title" }, "确认这次操作", -1)),
        t("p", null, u(x.value.text), 1),
        t("div", Un, [t("button", {
          autofocus: "",
          type: "button",
          onClick: i[28] || (i[28] = (o) => x.value = null)
        }, "先不改"), t("button", {
          type: "button",
          class: "learning-primary",
          disabled: s(y) || s(l).busy,
          onClick: i[29] || (i[29] = (o) => {
            s(c)(x.value.action, x.value.input), x.value = null;
          })
        }, "确认", 8, qn)])
      ])], 544)) : g("", !0)
    ]));
  }
}), Hn = Bn;
export {
  Hn as default
};
