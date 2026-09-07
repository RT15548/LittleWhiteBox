/* eslint-disable */
import { A as ue, B as _, C as ie, E as T, H as v, I as L, L as de, N as j, R as ve, T as a, _ as V, a as X, b as Z, c as O, d as t, f as K, g as q, i as ee, j as D, l as S, m as n, o as te, p as m, s as Q, u as H, v as P, w as ce, x as be, y as ae, z as s } from "./xiaobai-os-runtime-dom.esm-bundler-DwdCK5Jt.js";
var me = ["disabled"], ge = {
  key: 0,
  class: "learning-choices"
}, ye = [
  "type",
  "checked",
  "onChange"
], ke = { class: "learning-option-letter" }, fe = {
  key: 1,
  class: "learning-order"
}, pe = [
  "disabled",
  "aria-label",
  "onClick"
], $e = [
  "disabled",
  "aria-label",
  "onClick"
], he = {
  key: 2,
  class: "learning-fields"
}, Ce = ["onUpdate:modelValue"], xe = ["value"], we = {
  key: 3,
  class: "learning-choices"
}, Ie = ["checked", "onChange"], Se = {
  key: 0,
  class: "learning-muted"
}, Me = {
  key: 4,
  class: "learning-fields"
}, Ae = ["onUpdate:modelValue"], Le = {
  key: 5,
  class: "learning-writing"
}, Te = ["disabled"], Ve = /* @__PURE__ */ P({
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
    const g = e, r = l, o = ue(e, "modelValue");
    function b(d) {
      g.response.kind === "choice" && !g.response.multiple ? o.value.picked = [d] : o.value.picked = o.value.picked.includes(d) ? o.value.picked.filter((y) => y !== d) : [...o.value.picked, d];
    }
    function h(d, y) {
      const f = [...o.value.order];
      [f[d], f[d + y]] = [f[d + y], f[d]], o.value.order = f;
    }
    const M = H(() => {
      const d = g.response;
      return d.kind === "text" ? !!o.value.text.trim() : d.kind === "gaps" ? d.slots.every((y) => o.value.values[y.id]?.trim()) : d.kind === "match" ? d.left.every((y) => o.value.values[y.id]) : d.kind === "order" ? !0 : o.value.picked.length > 0;
    });
    function $() {
      const d = g.response;
      !M.value || g.disabled || (d.kind === "text" ? r("submit", {
        kind: "text",
        text: o.value.text
      }) : d.kind === "gaps" ? r("submit", {
        kind: "gaps",
        values: d.slots.map((y) => ({
          id: y.id,
          text: o.value.values[y.id]
        }))
      }) : d.kind === "match" ? r("submit", {
        kind: "match",
        pairs: d.left.map((y) => ({
          left: y.id,
          right: o.value.values[y.id]
        }))
      }) : r("submit", {
        kind: d.kind,
        ids: [...d.kind === "order" ? o.value.order : o.value.picked]
      }));
    }
    return (d, y) => (a(), n("form", {
      class: "learning-answer",
      onSubmit: O($, ["prevent"])
    }, [t("fieldset", { disabled: e.disabled }, [
      y[3] || (y[3] = t("legend", { class: "learning-sr-only" }, "你的回答", -1)),
      e.response.kind === "choice" ? (a(), n("div", ge, [(a(!0), n(S, null, T(e.response.options, (f, C) => (a(), n("label", {
        key: f.id,
        class: _({ selected: o.value.picked.includes(f.id) })
      }, [
        t("input", {
          type: e.response.multiple ? "checkbox" : "radio",
          name: "answer-choice",
          checked: o.value.picked.includes(f.id),
          onChange: (u) => b(f.id)
        }, null, 40, ye),
        t("span", ke, v(String.fromCharCode(65 + C)), 1),
        t("span", null, v(f.text), 1)
      ], 2))), 128))])) : e.response.kind === "order" ? (a(), n("ol", fe, [(a(!0), n(S, null, T(o.value.order, (f, C) => (a(), n("li", { key: f }, [
        t("span", null, v(e.response.options.find((u) => u.id === f)?.text), 1),
        t("button", {
          type: "button",
          disabled: C === 0,
          "aria-label": `上移第 ${C + 1} 项`,
          onClick: (u) => h(C, -1)
        }, "↑", 8, pe),
        t("button", {
          type: "button",
          disabled: C === o.value.order.length - 1,
          "aria-label": `下移第 ${C + 1} 项`,
          onClick: (u) => h(C, 1)
        }, "↓", 8, $e)
      ]))), 128))])) : e.response.kind === "match" ? (a(), n("div", he, [(a(!0), n(S, null, T(e.response.left, (f) => (a(), n("label", { key: f.id }, [q(v(f.text) + " ", 1), j(t("select", { "onUpdate:modelValue": (C) => o.value.values[f.id] = C }, [y[1] || (y[1] = t("option", { value: "" }, "选择对应项", -1)), (a(!0), n(S, null, T(e.response.right, (C) => (a(), n("option", {
        key: C.id,
        value: C.id
      }, v(C.text), 9, xe))), 128))], 8, Ce), [[ee, o.value.values[f.id]]])]))), 128))])) : e.response.kind === "evidence" ? (a(), n("div", we, [(a(!0), n(S, null, T(e.paragraphs, (f) => (a(), n("label", {
        key: f.id,
        class: _({ selected: o.value.picked.includes(f.id) })
      }, [t("input", {
        type: "checkbox",
        checked: o.value.picked.includes(f.id),
        onChange: (C) => b(f.id)
      }, null, 40, Ie), t("span", null, v(f.text), 1)], 2))), 128)), e.paragraphs.length ? m("", !0) : (a(), n("p", Se, "请先展开相关文稿，再选择原文依据。"))])) : e.response.kind === "gaps" ? (a(), n("div", Me, [(a(!0), n(S, null, T(e.response.slots, (f) => (a(), n("label", { key: f.id }, [q(v(f.text), 1), j(t("input", {
        "onUpdate:modelValue": (C) => o.value.values[f.id] = C,
        type: "text",
        maxlength: "4000",
        autocomplete: "off"
      }, null, 8, Ae), [[X, o.value.values[f.id]]])]))), 128))])) : (a(), n("label", Le, [y[2] || (y[2] = t("span", { class: "learning-sr-only" }, "你的回答", -1)), j(t("textarea", {
        "onUpdate:modelValue": y[0] || (y[0] = (f) => o.value.text = f),
        rows: "6",
        maxlength: "4000",
        placeholder: "写下你的回答…"
      }, null, 512), [[X, o.value.text]])])),
      t("button", {
        class: "learning-primary",
        type: "submit",
        disabled: !M.value
      }, "交给老师 →", 8, Te)
    ], 8, me)], 32));
  }
}), qe = Ve, Ue = ["stroke-width"], Be = ["d"], De = /* @__PURE__ */ P({
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
    return (g, r) => (a(), n("svg", {
      class: "learning-icon",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": e.name === "more" ? 3.5 : 1.7,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true"
    }, [t("path", { d: l[e.name] }, null, 8, Be)], 8, Ue));
  }
}), U = De, Re = { class: "learning-material" }, Ee = { class: "learning-source" }, He = { key: 0 }, Ne = ["href"], je = {
  key: 0,
  class: "learning-listening-cover"
}, Ke = ["disabled"], Pe = {
  key: 1,
  class: "learning-material-body"
}, Ze = ["onMouseup", "onKeyup"], Oe = ["disabled", "onClick"], ze = {
  class: "learning-audio-parts",
  "aria-label": "材料朗读分段"
}, Fe = ["disabled", "onClick"], Je = { key: 2 }, We = /* @__PURE__ */ P({
  __name: "MaterialReader",
  props: {
    material: {},
    disabled: { type: Boolean },
    exerciseId: {}
  },
  emits: ["action", "select"],
  setup(e, { emit: l }) {
    const g = e, r = l;
    function o(h) {
      r("select", {
        materialId: g.material.id,
        paragraphId: h.id,
        start: 0,
        end: h.text.length,
        quote: h.text
      });
    }
    function b(h, M) {
      const $ = window.getSelection();
      if (!$?.rangeCount || $.isCollapsed) return;
      const d = $.getRangeAt(0), y = h.currentTarget;
      if (!y.contains(d.startContainer) || !y.contains(d.endContainer)) return;
      const f = d.cloneRange();
      f.selectNodeContents(y), f.setEnd(d.startContainer, d.startOffset);
      const C = d.toString(), u = f.toString().length;
      C && [...C].length <= 2e3 && M.text.slice(u, u + C.length) === C && r("select", {
        materialId: g.material.id,
        paragraphId: M.id,
        start: u,
        end: u + C.length,
        quote: C
      });
    }
    return (h, M) => (a(), n("article", Re, [
      t("h2", null, v(e.material.title), 1),
      t("div", Ee, [e.material.provenance.kind === "authored" ? (a(), n("span", He, "老师自编练习")) : (a(), n("a", {
        key: 1,
        href: e.material.provenance.url,
        target: "_blank",
        rel: "noopener noreferrer"
      }, v(e.material.provenance.kind === "original" ? "原文节选" : "改编自") + " · " + v(e.material.provenance.title) + " ↗", 9, Ne))]),
      e.material.hidden ? (a(), n("div", je, [M[1] || (M[1] = t("svg", {
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
        onClick: M[0] || (M[0] = ($) => r("action", "reveal", {
          kind: "transcripts",
          id: e.material.id
        }))
      }, "看文稿", 8, Ke)])) : (a(), n("div", Pe, [(a(!0), n(S, null, T(e.material.paragraphs, ($) => (a(), n("div", {
        key: $.id,
        class: "learning-paragraph"
      }, [t("p", {
        tabindex: "0",
        onMouseup: (d) => b(d, $),
        onKeyup: (d) => b(d, $)
      }, v($.text), 41, Ze), t("button", {
        type: "button",
        disabled: e.disabled || [...$.text].length > 2e3,
        "aria-label": "选这段提问",
        onClick: (d) => o($)
      }, "选段", 8, Oe)]))), 128))])),
      t("div", ze, [(a(!0), n(S, null, T(e.material.parts, ($) => (a(), n("button", {
        key: $.key,
        type: "button",
        disabled: e.disabled,
        onClick: (d) => r("action", "play", {
          materialId: e.material.id,
          partKey: $.key,
          exerciseId: e.exerciseId
        })
      }, [V(U, { name: "play" }), q(v(e.material.parts.length > 1 ? `听第 ${$.number} 段` : "播放朗读"), 1)], 8, Fe))), 128))]),
      e.material.parts.length ? (a(), n("small", Je, "TTS 合成朗读")) : m("", !0)
    ]));
  }
}), ne = We;
function se(e, l, g = []) {
  const r = (o) => l.kind === "choice" || l.kind === "order" ? l.options.find((b) => b.id === o)?.text ?? o : g.find((b) => b.id === o)?.text ?? o;
  return e.kind === "text" ? e.text : e.kind === "gaps" ? e.values.map((o) => `${l.kind === "gaps" ? l.slots.find((b) => b.id === o.id)?.text ?? "" : ""} ${o.text}`).join(`
`) : e.kind === "match" ? e.pairs.map((o) => l.kind === "match" ? `${l.left.find((b) => b.id === o.left)?.text} → ${l.right.find((b) => b.id === o.right)?.text}` : "").join(`
`) : e.ids.map(r).join(e.kind === "order" ? " → " : `
`);
}
var Ge = { class: "learning-feedback" }, Qe = { class: "learning-muted" }, Xe = { key: 0 }, Ye = { key: 1 }, _e = { key: 0 }, et = { key: 1 }, tt = { key: 2 }, at = ["disabled"], nt = ["disabled"], lt = /* @__PURE__ */ P({
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
    return (g, r) => (a(), n("section", Ge, [
      r[6] || (r[6] = t("p", { class: "learning-eyebrow" }, "已保存的原答", -1)),
      t("blockquote", null, v(s(se)(e.attempt.answer, e.response, e.paragraphs)), 1),
      t("small", Qe, [
        q(v(e.attempt.help.feedback ? "得到反馈后的再练" : e.attempt.help.answer || e.attempt.help.hint || e.attempt.help.transcript ? "这次有辅助" : "未使用答案或提示"), 1),
        e.attempt.help.replays ? (a(), n("span", Xe, " · 重听 " + v(e.attempt.help.replays) + " 次", 1)) : m("", !0),
        e.attempt.help.slowPlayback ? (a(), n("span", Ye, " · 慢放")) : m("", !0)
      ]),
      e.feedback ? (a(), n(S, { key: 0 }, [
        t("h3", null, v(l[e.feedback.verdict]), 1),
        e.feedback.understanding ? (a(), n("p", _e, [r[2] || (r[2] = t("b", null, "理解", -1)), q(v(e.feedback.understanding), 1)])) : m("", !0),
        e.feedback.expression ? (a(), n("p", et, [r[3] || (r[3] = t("b", null, "表达", -1)), q(v(e.feedback.expression), 1)])) : m("", !0),
        e.feedback.guidance ? (a(), n("p", tt, [r[4] || (r[4] = t("b", null, "批注", -1)), q(v(e.feedback.guidance), 1)])) : m("", !0),
        t("button", {
          type: "button",
          disabled: e.disabled,
          onClick: r[0] || (r[0] = (o) => g.$emit("action", "assess", {
            attemptId: e.attempt.id,
            review: !0,
            message: "请重新审视我的原答与题目。也请考虑其他有效表达，不只对照原来的答案键。"
          }))
        }, v(e.feedback.verdict === "disputed" ? "请老师复核" : "有疑问，请复核"), 9, at)
      ], 64)) : (a(), n(S, { key: 1 }, [r[5] || (r[5] = t("p", null, "原答已保存，等待老师评估。", -1)), t("button", {
        type: "button",
        disabled: e.disabled,
        onClick: r[1] || (r[1] = (o) => g.$emit("action", "assess", {
          attemptId: e.attempt.id,
          review: !1,
          message: "请评估这条已经保存的原答。"
        }))
      }, "重试评估", 8, nt)], 64))
    ]));
  }
}), re = lt, it = {
  key: 0,
  class: "learning-player",
  "aria-label": "课堂朗读"
}, st = {
  key: 0,
  role: "status"
}, rt = {
  key: 2,
  class: "learning-row"
}, ot = ["aria-label", "disabled"], ut = ["max", "value"], dt = /* @__PURE__ */ P({
  __name: "LearningPlayer",
  props: { state: {} },
  emits: ["action"],
  setup(e, { emit: l }) {
    const g = l;
    function r(o) {
      return `${Math.floor(o / 60)}:${String(Math.floor(o % 60)).padStart(2, "0")}`;
    }
    return (o, b) => e.state.media.status !== "idle" ? (a(), n("section", it, [
      e.state.media.message ? (a(), n("p", st, v(e.state.media.message), 1)) : m("", !0),
      e.state.voices.enabled ? m("", !0) : (a(), n("button", {
        key: 1,
        type: "button",
        onClick: b[0] || (b[0] = (h) => g("action", "tts-settings"))
      }, "如何开启 TTS")),
      e.state.media.key ? (a(), n("div", rt, [
        V(U, { name: "sound" }),
        t("span", null, v(e.state.media.status === "loading" ? "正在生成声音…" : `${r(e.state.media.position)} / ${r(e.state.media.duration)}`), 1),
        e.state.media.status === "playing" ? (a(), n("button", {
          key: 0,
          type: "button",
          "aria-label": "暂停",
          onClick: b[1] || (b[1] = (h) => g("action", "pause"))
        }, [V(U, { name: "pause" })])) : [
          "paused",
          "ended",
          "blocked"
        ].includes(e.state.media.status) ? (a(), n("button", {
          key: 1,
          type: "button",
          "aria-label": e.state.media.status === "ended" ? "再听一遍" : "继续播放",
          disabled: e.state.busy,
          onClick: b[2] || (b[2] = (h) => g("action", "resume"))
        }, [V(U, { name: "play" })], 8, ot)) : m("", !0),
        t("button", {
          type: "button",
          "aria-label": "停止",
          onClick: b[3] || (b[3] = (h) => g("action", "stop"))
        }, [V(U, { name: "stop" })]),
        e.state.media.duration ? (a(), n("button", {
          key: 2,
          type: "button",
          onClick: b[4] || (b[4] = (h) => g("action", "rate", { value: e.state.media.rate === 1 ? 0.75 : 1 }))
        }, v(e.state.media.rate) + "×", 1)) : m("", !0)
      ])) : m("", !0),
      e.state.media.duration ? (a(), n("input", {
        key: 3,
        type: "range",
        min: "0",
        max: e.state.media.duration,
        step: "0.1",
        value: e.state.media.position,
        "aria-label": "当前声音片段播放位置",
        onChange: b[5] || (b[5] = (h) => g("action", "seek", { value: Number(h.target.value) }))
      }, null, 40, ut)) : m("", !0)
    ])) : m("", !0);
  }
}), oe = dt;
function le(e) {
  return {
    picked: [],
    text: "",
    values: {},
    order: e.kind === "order" ? e.options.map((l) => l.id) : []
  };
}
var vt = {
  key: 0,
  class: "learning-activity-shade"
}, ct = { class: "learning-activity-header" }, bt = { id: "learning-activity-title" }, mt = {
  key: 0,
  "aria-label": "完成本课的固定奖励"
}, gt = {
  key: 0,
  class: "learning-margin-note",
  role: "status"
}, yt = {
  key: 0,
  class: "learning-activity-materials"
}, kt = {
  key: 2,
  class: "learning-selection"
}, ft = { class: "learning-row" }, pt = ["disabled"], $t = {
  key: 3,
  class: "learning-question"
}, ht = { class: "learning-help-actions" }, Ct = ["disabled"], xt = ["disabled"], wt = ["disabled"], It = {
  key: 0,
  class: "learning-margin-note"
}, St = {
  key: 1,
  class: "learning-margin-note"
}, Mt = { key: 0 }, At = { key: 1 }, Lt = { key: 2 }, Tt = ["disabled"], Vt = /* @__PURE__ */ P({
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
    const g = e, r = l, o = L(null), b = L(null), h = /* @__PURE__ */ new Map(), M = L(null), $ = L(!1), d = L(null), y = L({});
    let f = null, C = null;
    const u = H(() => g.target?.kind === "exercise" ? g.state.unit?.exercises.find((p) => p.id === g.target?.id) : void 0), I = H(() => g.state.unit?.materials.filter((p) => g.target?.kind === "material" ? p.id === g.target.id : u.value?.materialIds.includes(p.id)) ?? []), A = H(() => u.value?.id ?? g.state.unit?.exercises.find((p) => p.skill === "listening" && p.materialIds.includes(g.target?.id ?? ""))?.id ?? g.state.unit?.exercises.find((p) => p.materialIds.includes(g.target?.id ?? ""))?.id), E = H(() => I.value.filter((p) => u.value?.response.kind !== "evidence" || p.id === u.value.response.materialId).flatMap((p) => p.paragraphs)), B = H(() => g.state.unit?.attempts.filter((p) => p.exerciseId === u.value?.id).at(-1)), z = H(() => g.state.unit?.assessments.find((p) => p.attemptId === B.value?.id));
    D(() => u.value, (p) => {
      if (!p) return;
      const k = JSON.stringify(p.response);
      y.value[p.id]?.response !== k && (y.value[p.id] = {
        response: k,
        value: le(p.response)
      });
    }, { immediate: !0 });
    const N = H({
      get: () => y.value[u.value.id].value,
      set: (p) => {
        y.value[u.value.id].value = p;
      }
    });
    D(() => g.target, async (p, k) => {
      const x = o.value?.closest(".learning-app");
      k && b.value && h.set(`${k.kind}:${k.id}`, b.value.scrollTop), $.value = !1, d.value = null, p && !k && (f = document.activeElement instanceof HTMLElement ? document.activeElement : null), await Z(), p ? (M.value?.focus(), b.value && (b.value.scrollTop = h.get(`${p.kind}:${p.id}`) ?? 0)) : f?.isConnected && f.getClientRects().length && f.matches("button, input, textarea, summary, [tabindex]") ? f.focus({ preventScroll: !0 }) : x?.querySelector(".learning-conversation-compose textarea")?.focus({ preventScroll: !0 });
    }), D(() => g.state.unit?.id, () => {
      y.value = {}, C = null;
    }), D(() => g.state.unit?.attempts, (p) => {
      if (!C) return;
      const k = p?.filter((x) => x.exerciseId === C.id).at(-1);
      k && k.id !== C.before && (delete y.value[C.id], C = null, r("close"));
    });
    function Y(p) {
      C = {
        id: u.value.id,
        before: B.value?.id
      }, r("action", "submit", {
        unitId: g.state.unit.id,
        exerciseId: u.value.id,
        answer: p
      });
    }
    function F(p) {
      const k = [...o.value.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), summary, a, [tabindex="0"]')].filter((x) => x.getClientRects().length);
      o.value.contains(document.activeElement) ? p.shiftKey && document.activeElement === k[0] ? (p.preventDefault(), k.at(-1)?.focus()) : !p.shiftKey && document.activeElement === k.at(-1) && (p.preventDefault(), k[0]?.focus()) : (p.preventDefault(), (p.shiftKey ? k.at(-1) : k[0])?.focus());
    }
    function J(p) {
      !g.target || !o.value || (p.key === "Escape" ? (p.preventDefault(), p.stopPropagation(), r("close")) : p.key === "Tab" && F(p));
    }
    return ie(() => document.addEventListener("keydown", J, !0)), ce(() => document.removeEventListener("keydown", J, !0)), (p, k) => e.target ? (a(), n("div", vt, [t("section", {
      ref_key: "dialog",
      ref: o,
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "learning-activity-title",
      class: "learning-activity"
    }, [
      t("header", ct, [
        t("h2", bt, v(u.value ? "练习" : I.value[0]?.title ?? "材料"), 1),
        e.state.unit ? (a(), n("small", mt, "+" + v(e.state.unit.reward.amount) + " 币", 1)) : m("", !0),
        t("button", {
          ref_key: "closeButton",
          ref: M,
          type: "button",
          "aria-label": "回到老师对话",
          onClick: k[0] || (k[0] = (x) => r("close"))
        }, [k[17] || (k[17] = q("收起", -1)), V(U, { name: "back" })], 512)
      ]),
      e.state.message && !e.state.busy ? (a(), n("p", gt, v(e.state.message), 1)) : m("", !0),
      t("div", {
        ref_key: "body",
        ref: b,
        class: "learning-activity-body"
      }, [
        u.value && I.value.length ? (a(), n("details", yt, [t("summary", null, "阅读材料 · " + v(I.value.length), 1), (a(!0), n(S, null, T(I.value, (x) => (a(), K(ne, {
          key: x.id,
          material: x,
          "exercise-id": A.value,
          disabled: e.disabled,
          onAction: k[1] || (k[1] = (R, W) => r("action", R, W)),
          onSelect: k[2] || (k[2] = (R) => d.value = R)
        }, null, 8, [
          "material",
          "exercise-id",
          "disabled"
        ]))), 128))])) : u.value ? m("", !0) : (a(!0), n(S, { key: 1 }, T(I.value, (x) => (a(), K(ne, {
          key: x.id,
          material: x,
          "exercise-id": A.value,
          disabled: e.disabled,
          onAction: k[3] || (k[3] = (R, W) => r("action", R, W)),
          onSelect: k[4] || (k[4] = (R) => d.value = R)
        }, null, 8, [
          "material",
          "exercise-id",
          "disabled"
        ]))), 128)),
        d.value ? (a(), n("div", kt, [t("blockquote", null, v(d.value.quote), 1), t("div", ft, [
          t("button", {
            type: "button",
            onClick: k[5] || (k[5] = (x) => r("ask", A.value, d.value))
          }, "问老师"),
          t("button", {
            type: "button",
            disabled: e.disabled || [...d.value.quote].length > 1e3,
            onClick: k[6] || (k[6] = (x) => r("action", "say", { selection: d.value }))
          }, "朗读", 8, pt),
          t("button", {
            type: "button",
            onClick: k[7] || (k[7] = (x) => d.value = null)
          }, "取消选段")
        ])])) : m("", !0),
        u.value ? (a(), n("section", $t, [
          t("h2", null, v(u.value.prompt), 1),
          t("div", ht, [
            t("button", {
              type: "button",
              disabled: e.disabled || [...u.value.prompt].length > 1e3,
              onClick: k[8] || (k[8] = (x) => r("action", "say-question", { exerciseId: u.value.id }))
            }, "听题干", 8, Ct),
            u.value.hasHint ? (a(), n("button", {
              key: 0,
              type: "button",
              disabled: e.disabled || u.value.hint !== null,
              onClick: k[9] || (k[9] = (x) => r("action", "reveal", {
                kind: "hints",
                id: u.value.id
              }))
            }, "提示", 8, xt)) : m("", !0),
            t("button", {
              type: "button",
              disabled: e.disabled || u.value.solution !== null,
              onClick: k[10] || (k[10] = (x) => r("action", "reveal", {
                kind: "answers",
                id: u.value.id
              }))
            }, "解答", 8, wt),
            t("button", {
              type: "button",
              onClick: k[11] || (k[11] = (x) => r("ask", u.value.id))
            }, "问老师")
          ]),
          u.value.hint ? (a(), n("p", It, v(u.value.hint), 1)) : m("", !0),
          u.value.solution ? (a(), n("div", St, [u.value.solution.kind === "exact" ? (a(), n("p", Mt, v(s(se)(u.value.solution.answer, u.value.response, E.value)), 1)) : u.value.solution.kind === "gaps" ? (a(), n("p", At, v(u.value.solution.accepted.map((x) => x.forms.join(" / ")).join(`
`)), 1)) : m("", !0), u.value.solution.kind !== "semantic" ? (a(), n("p", Lt, v(u.value.solution.explanation), 1)) : (a(), n("button", {
            key: 3,
            type: "button",
            onClick: k[12] || (k[12] = (x) => r("ask", u.value.id))
          }, "请老师讲解"))])) : m("", !0),
          (!B.value || $.value) && y.value[u.value.id] ? (a(), K(qe, {
            key: u.value.id,
            modelValue: N.value,
            "onUpdate:modelValue": k[13] || (k[13] = (x) => N.value = x),
            response: u.value.response,
            paragraphs: E.value,
            disabled: e.disabled,
            onSubmit: Y
          }, null, 8, [
            "modelValue",
            "response",
            "paragraphs",
            "disabled"
          ])) : m("", !0),
          B.value ? (a(), K(re, {
            key: 3,
            attempt: B.value,
            feedback: z.value,
            response: u.value.response,
            paragraphs: E.value,
            disabled: e.disabled,
            onAction: k[14] || (k[14] = (x, R) => {
              r("action", x, R), r("close");
            })
          }, null, 8, [
            "attempt",
            "feedback",
            "response",
            "paragraphs",
            "disabled"
          ])) : m("", !0),
          B.value ? (a(), n("button", {
            key: 4,
            type: "button",
            disabled: e.disabled,
            onClick: k[15] || (k[15] = (x) => {
              $.value = !$.value, y.value[u.value.id] ??= {
                response: JSON.stringify(u.value.response),
                value: s(le)(u.value.response)
              };
            })
          }, v($.value ? "收起再练" : "再试一次"), 9, Tt)) : m("", !0)
        ])) : m("", !0)
      ], 512),
      V(oe, {
        state: e.state,
        onAction: k[16] || (k[16] = (x, R) => r("action", x, R))
      }, null, 8, ["state"])
    ], 512)])) : m("", !0);
  }
}), qt = Vt, Ut = { class: "learning-profile-page" }, Bt = { class: "learning-setup-heading" }, Dt = { class: "learning-language-options" }, Rt = [
  "disabled",
  "aria-pressed",
  "onClick"
], Et = { "aria-hidden": "true" }, Ht = ["disabled"], Nt = { class: "learning-teacher-options" }, jt = [
  "disabled",
  "aria-pressed",
  "onClick"
], Kt = { class: "learning-person-initial" }, Pt = {
  key: 0,
  class: "learning-selected-teacher"
}, Zt = { class: "learning-person-initial" }, Ot = ["open"], zt = ["disabled"], Ft = ["disabled"], Jt = { class: "learning-setup-actions" }, Wt = ["disabled"], Gt = ["disabled"], Qt = /* @__PURE__ */ P({
  __name: "LearningSetup",
  props: {
    state: {},
    disabled: { type: Boolean }
  },
  emits: ["action", "done"],
  setup(e, { emit: l }) {
    const g = l, r = L(0), o = L(null), b = L(""), h = [
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
    async function M($) {
      r.value = $, await Z(), o.value?.focus();
    }
    return ($, d) => (a(), n("section", Ut, [t("div", Bt, [t("h1", {
      ref_key: "heading",
      ref: o,
      tabindex: "-1"
    }, v(r.value === 0 ? "选择要学习的语言" : "选择老师"), 513)]), r.value === 0 ? (a(), n(S, { key: 0 }, [t("div", Dt, [(a(), n(S, null, T(h, ([y, f, C]) => t("button", {
      key: y,
      type: "button",
      disabled: e.disabled,
      "aria-pressed": e.state.language === y,
      onClick: (u) => g("action", "language", { language: y })
    }, [
      t("span", Et, v(C), 1),
      t("strong", null, v(f), 1),
      e.state.language === y ? (a(), K(U, {
        key: 0,
        name: "check"
      })) : m("", !0)
    ], 8, Rt)), 64))]), t("button", {
      type: "button",
      class: "learning-primary learning-setup-next",
      disabled: e.disabled,
      onClick: d[0] || (d[0] = (y) => M(1))
    }, [d[5] || (d[5] = q("继续", -1)), V(U, { name: "arrow" })], 8, Ht)], 64)) : (a(), n(S, { key: 1 }, [
      t("div", Nt, [(a(!0), n(S, null, T(e.state.candidates, (y) => (a(), n("button", {
        key: y.name,
        type: "button",
        disabled: e.disabled,
        "aria-pressed": e.state.teacher?.name === y.name,
        onClick: (f) => g("action", "teacher", { teacher: {
          name: y.name,
          note: ""
        } })
      }, [
        t("span", Kt, v([...y.name][0]), 1),
        t("strong", null, v(y.name), 1),
        e.state.teacher?.name === y.name ? (a(), K(U, {
          key: 0,
          name: "check"
        })) : m("", !0)
      ], 8, jt))), 128))]),
      e.state.teacher && !e.state.candidates.some((y) => y.name === e.state.teacher?.name) ? (a(), n("p", Pt, [
        t("span", Zt, v([...e.state.teacher.name][0]), 1),
        q(v(e.state.teacher.name), 1),
        V(U, { name: "check" })
      ])) : m("", !0),
      t("details", {
        class: "learning-other-teacher",
        open: !e.state.candidates.length && !e.state.teacher
      }, [d[6] || (d[6] = t("summary", null, "选择其他人物", -1)), t("form", {
        class: "learning-row",
        onSubmit: d[2] || (d[2] = O((y) => g("action", "teacher", { teacher: {
          name: b.value.trim(),
          note: ""
        } }), ["prevent"]))
      }, [j(t("input", {
        "onUpdate:modelValue": d[1] || (d[1] = (y) => b.value = y),
        type: "text",
        "aria-label": "其他人物名字",
        maxlength: "80",
        placeholder: "输入人物名字",
        disabled: e.disabled
      }, null, 8, zt), [[X, b.value]]), t("button", {
        type: "submit",
        disabled: e.disabled || !b.value.trim()
      }, "选这位", 8, Ft)], 32)], 8, Ot),
      t("div", Jt, [t("button", {
        type: "button",
        disabled: e.disabled,
        onClick: d[3] || (d[3] = (y) => M(0))
      }, "上一步", 8, Wt), t("button", {
        type: "button",
        class: "learning-primary",
        disabled: e.disabled || !e.state.teacher,
        onClick: d[4] || (d[4] = (y) => g("done"))
      }, [d[7] || (d[7] = q("和老师聊聊", -1)), V(U, { name: "arrow" })], 8, Gt)])
    ], 64))]));
  }
}), Xt = Qt, Yt = { class: "learning-records-page" }, _t = { class: "learning-page-heading" }, ea = {
  key: 0,
  class: "learning-muted"
}, ta = { class: "learning-muted" }, aa = {
  key: 0,
  class: "learning-muted"
}, na = ["disabled", "onClick"], la = ["disabled"], ia = {
  key: 0,
  class: "learning-empty-note"
}, sa = ["disabled", "onClick"], ra = { key: 0 }, oa = {
  key: 1,
  class: "learning-row"
}, ua = ["disabled"], da = { class: "learning-muted" }, va = ["disabled"], ca = /* @__PURE__ */ P({
  __name: "LearningRecords",
  props: {
    state: {},
    disabled: { type: Boolean }
  },
  emits: ["action", "remove"],
  setup(e) {
    const l = {
      unassessed: "尚待练习",
      review: "待复核",
      independent: "已能独立使用",
      practised: "练过一次",
      strengthen: "再练练"
    };
    return (g, r) => (a(), n("section", Yt, [t("div", _t, [r[5] || (r[5] = t("h1", null, "学习记录", -1)), e.state.records.total ? (a(), n("span", ea, v(e.state.records.total) + " 项", 1)) : m("", !0)]), e.state.record ? (a(), n(S, { key: 0 }, [
      t("button", {
        type: "button",
        onClick: r[0] || (r[0] = (o) => g.$emit("action", "records", { offset: e.state.records.offset }))
      }, "‹ 返回记录"),
      t("h2", null, v(e.state.record.label), 1),
      (a(!0), n(S, null, T(e.state.record.evidence, (o) => (a(), n("article", {
        key: o.attempt.id,
        class: "learning-record-evidence"
      }, [
        t("p", ta, v(new Date(o.attempt.submittedAt).toLocaleDateString()), 1),
        t("h3", null, v(o.exercise.prompt), 1),
        (a(!0), n(S, null, T(o.materials, (b) => (a(), n("details", { key: b.id }, [t("summary", null, v(b.title), 1), b.hidden ? (a(), n("p", aa, "听力文稿尚未展开；原答和反馈如下。")) : (a(!0), n(S, { key: 1 }, T(b.paragraphs, (h) => (a(), n("p", { key: h.id }, v(h.text), 1))), 128))]))), 128)),
        V(re, {
          attempt: o.attempt,
          feedback: o.assessment,
          response: o.exercise.response,
          paragraphs: o.materials.flatMap((b) => b.paragraphs),
          disabled: e.disabled,
          onAction: r[1] || (r[1] = (b, h) => g.$emit("action", b, h))
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
          onClick: (b) => g.$emit("remove", "delete-attempt", { id: o.attempt.id }, "删除这条原答和依赖它的反馈？相关学习项会重新计算，不撤回已到账奖励。")
        }, "删除这条原答", 8, na)
      ]))), 128)),
      t("button", {
        type: "button",
        disabled: e.disabled,
        onClick: r[2] || (r[2] = (o) => g.$emit("remove", "delete-item", { id: e.state.record.id }, "删除这个学习项及其不再被引用的证据？当前课程不会被删除。"))
      }, "删除学习项", 8, la)
    ], 64)) : (a(), n(S, { key: 1 }, [
      e.state.records.total ? m("", !0) : (a(), n("p", ia, "暂无学习记录")),
      (a(!0), n(S, null, T(e.state.records.items, (o) => (a(), n("button", {
        key: o.id,
        class: "learning-record-row",
        type: "button",
        disabled: !o.readable,
        onClick: (b) => g.$emit("action", "records", {
          id: o.id,
          offset: e.state.records.offset
        })
      }, [t("span", null, [t("strong", null, v(o.label), 1), t("small", null, [q(v(o.evidenceCount) + " 份作答依据", 1), o.nextReviewAt ? (a(), n("span", ra, " · 建议 " + v(new Date(o.nextReviewAt).toLocaleDateString()) + " 再练", 1)) : m("", !0)])]), t("em", null, v(l[o.state]), 1)], 8, sa))), 128)),
      e.state.records.total > 30 ? (a(), n("div", oa, [
        t("button", {
          type: "button",
          disabled: e.state.records.offset === 0,
          onClick: r[3] || (r[3] = (o) => g.$emit("action", "records", { offset: Math.max(0, e.state.records.offset - 30) }))
        }, "上一页", 8, ua),
        t("span", da, v(e.state.records.total) + " 项", 1),
        t("button", {
          type: "button",
          disabled: e.state.records.offset + 30 >= e.state.records.total,
          onClick: r[4] || (r[4] = (o) => g.$emit("action", "records", { offset: e.state.records.offset + 30 }))
        }, "下一页", 8, va)
      ])) : m("", !0)
    ], 64))]));
  }
}), ba = ca, ma = { class: "learning-conversation" }, ga = { class: "learning-conversation-heading" }, ya = { class: "learning-person-initial" }, ka = ["disabled"], fa = {
  key: 0,
  class: "learning-history-notice"
}, pa = { class: "learning-conversation-user" }, $a = { class: "learning-conversation-teacher" }, ha = ["disabled", "onClick"], Ca = {
  key: 1,
  class: "learning-conversation-tools"
}, xa = ["disabled"], wa = ["disabled"], Ia = {
  key: 1,
  class: "learning-conversation-user"
}, Sa = {
  key: 2,
  class: "learning-conversation-empty"
}, Ma = ["disabled"], Aa = { key: 2 }, La = { class: "learning-composer-input" }, Ta = {
  key: 0,
  class: "learning-composer-quote"
}, Va = ["maxlength", "onKeydown"], qa = ["disabled"], Ua = /* @__PURE__ */ P({
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
  setup(e, { expose: l, emit: g }) {
    const r = e, o = g, b = L(""), h = L(null), M = L(null), $ = L(null);
    let d = "", y = 0;
    D(() => r.state.conversation.turns.length + r.state.conversation.removedTurns, (u) => {
      const I = r.state.conversation.turns.at(-1), A = $.value?.selection ? `${d}

${$.value.selection.quote}` : d;
      u > y && I?.user === A && b.value.trim() === d && (b.value = "", d = "", $.value = null);
    }), D([
      () => r.state.chatIdentity,
      () => r.state.language,
      () => r.state.teacher?.name
    ], () => {
      b.value = "", d = "", $.value = null;
    }), D(() => r.state.unit?.id, () => {
      $.value = null;
    }), D(() => r.state.conversation.turns.length, (u, I) => {
      !u && I && !r.state.busy && (b.value = "", d = "");
    });
    function f() {
      r.disabled || !b.value.trim() || (d = b.value.trim(), y = r.state.conversation.turns.length + r.state.conversation.removedTurns, o("action", $.value ? "explain" : "talk", {
        message: d,
        ...$.value ?? {}
      }));
    }
    D(() => r.state.conversation.pending, async () => {
      await Z(), M.value && (M.value.scrollTop = M.value.scrollHeight);
    }), D(() => r.state.conversation.turns.length, async () => {
      const u = M.value;
      !u || u.scrollHeight - u.scrollTop - u.clientHeight > 100 || (await Z(), u.scrollTop = u.scrollHeight);
    });
    function C(u) {
      return u.kind === "replacement" ? !r.disabled && r.state.currentUnitId === u.unitId : r.state.unit?.id === u.unitId && (u.kind === "exercise" ? r.state.unit.exercises : r.state.unit.materials).some((I) => I.id === u.id);
    }
    return l({
      async ask(u, I) {
        $.value = {
          exerciseId: u,
          selection: I
        }, await Z(), h.value?.focus();
      },
      focus: () => h.value?.focus({ preventScroll: !0 })
    }), (u, I) => (a(), n("section", ma, [
      t("header", ga, [
        t("span", ya, v([...e.state.teacher?.name ?? "师"][0]), 1),
        t("h1", null, v(e.state.teacher?.name ?? "老师"), 1),
        t("button", {
          type: "button",
          disabled: e.disabled,
          "aria-label": "更换学习语言和老师",
          onClick: I[0] || (I[0] = (A) => o("profile"))
        }, v(new Intl.DisplayNames(["zh-CN"], { type: "language" }).of(e.state.language)), 9, ka)
      ]),
      t("div", {
        ref_key: "scroller",
        ref: M,
        class: "learning-conversation-turns",
        "aria-label": "师生对话"
      }, [
        e.state.conversation.removedTurns ? (a(), n("p", fa, "较早对话已释放，学习记录仍保留。")) : m("", !0),
        (a(!0), n(S, null, T(e.state.conversation.turns, (A, E) => (a(), n("div", {
          key: E,
          class: "learning-conversation-turn"
        }, [
          t("p", pa, v(A.user), 1),
          t("p", $a, v(A.teacher), 1),
          A.presentation ? (a(), n("button", {
            key: 0,
            type: "button",
            class: "learning-activity-link",
            disabled: !C(A.presentation),
            onClick: (B) => o("present", A.presentation)
          }, [
            V(U, { name: A.presentation.kind === "material" ? "book" : "records" }, null, 8, ["name"]),
            t("span", null, v(A.presentation.title), 1),
            V(U, { name: "arrow" })
          ], 8, ha)) : m("", !0),
          E === e.state.conversation.turns.length - 1 && e.state.reply?.text === A.teacher ? (a(), n("div", Ca, [[...A.teacher].length <= 1e3 ? (a(), n("button", {
            key: 0,
            type: "button",
            disabled: e.disabled,
            onClick: I[1] || (I[1] = (B) => o("action", "say-reply"))
          }, [V(U, { name: "sound" }), I[7] || (I[7] = q("听老师说", -1))], 8, xa)) : m("", !0), e.state.reply.exerciseId && [...A.teacher].length <= 4e3 ? (a(), n("button", {
            key: 1,
            type: "button",
            disabled: e.disabled || e.state.unit?.notes.some((B) => B.text === A.teacher),
            onClick: I[2] || (I[2] = (B) => o("action", "save-note"))
          }, "保存笔记", 8, wa)) : m("", !0)])) : m("", !0)
        ]))), 128)),
        e.state.conversation.pending ? (a(), n("p", Ia, v(e.state.conversation.pending), 1)) : m("", !0),
        !e.state.conversation.turns.length && !e.state.conversation.pending ? (a(), n("div", Sa, [
          V(U, { name: "chat" }),
          t("p", null, v(e.state.teacher ? "今天想学什么？" : "先选一位老师"), 1),
          e.state.teacher ? (a(), n("button", {
            key: 1,
            type: "button",
            disabled: e.disabled,
            onClick: I[4] || (I[4] = (A) => o("action", "talk", { message: e.state.profile ? "请根据我的学习目标和记录，带我继续学习。" : "我想跟你学习这门语言，先聊聊我的水平和目标吧。" }))
          }, v(e.state.profile ? "继续学习" : "开始交流"), 9, Ma)) : (a(), n("button", {
            key: 0,
            class: "learning-primary",
            type: "button",
            onClick: I[3] || (I[3] = (A) => o("profile"))
          }, "选择老师")),
          e.state.teacher ? (a(), n("small", Aa, "交流与教学会调用模型")) : m("", !0)
        ])) : m("", !0)
      ], 512),
      e.state.teacher ? (a(), n("form", {
        key: 0,
        class: "learning-conversation-compose",
        onSubmit: O(f, ["prevent"])
      }, [t("div", La, [$.value ? (a(), n("div", Ta, [t("span", null, v($.value.selection?.quote ?? "请教这道题"), 1), t("button", {
        type: "button",
        "aria-label": "取消引用",
        onClick: I[5] || (I[5] = (A) => $.value = null)
      }, "×")])) : m("", !0), j(t("textarea", {
        ref_key: "composer",
        ref: h,
        "onUpdate:modelValue": I[6] || (I[6] = (A) => b.value = A),
        rows: "2",
        maxlength: $.value?.selection ? 1800 : $.value?.exerciseId ? 2e3 : 4e3,
        "aria-label": "和老师说",
        placeholder: "和老师说…",
        onKeydown: [Q(O(f, ["ctrl", "prevent"]), ["enter"]), Q(O(f, ["meta", "prevent"]), ["enter"])]
      }, null, 40, Va), [[X, b.value]])]), t("button", {
        type: "submit",
        class: "learning-primary",
        disabled: e.disabled || !b.value.trim(),
        "aria-label": "发送给老师"
      }, [V(U, { name: "arrow" })], 8, qa)], 32)) : m("", !0)
    ]));
  }
}), Ba = Ua;
function Da(e) {
  const l = de(structuredClone(ve(e.initialState))), g = L(!1), r = L("");
  let o = !1, b = 0, h = () => {
  };
  const M = H(() => !g.value && !l.value.busy && l.value.storage === "ready");
  async function $(d, y = {}) {
    if (g.value) return;
    g.value = !0, r.value = "";
    const f = l.value.chatIdentity, C = b;
    try {
      const u = await e.bridge.request(`learning/${d}`, {
        chatIdentity: f,
        ...y
      }, 35e3);
      return !o || l.value.chatIdentity !== f ? void 0 : (b === C && u.result.state.chatIdentity === f && (l.value = u.result.state), u.result);
    } catch {
      o && l.value.chatIdentity === f && (r.value = "暂未收到操作结果。请先读取已保存内容，不要重复提交或生成。");
    } finally {
      o && (g.value = !1);
    }
  }
  return ie(() => {
    o = !0, h = e.bridge.subscribe((d) => {
      if (d.type === "learning/media") {
        l.value = {
          ...l.value,
          media: d.payload.media
        };
        return;
      }
      if (d.type !== "learning/state") return;
      const y = d.payload.state;
      y.chatIdentity === l.value.chatIdentity && (b++, l.value = y, r.value = "");
    });
  }), be(() => {
    o = !1, h();
  }), {
    state: l,
    pending: g,
    writable: M,
    localMessage: r,
    request: $
  };
}
var Ra = {
  class: "learning-app",
  "aria-label": "语伴语言学习"
}, Ea = ["inert"], Ha = { "aria-label": "学习资料与设置" }, Na = { "aria-label": "学习资料与设置" }, ja = ["onClick"], Ka = ["inert"], Pa = ["disabled"], Za = {
  key: 2,
  class: "learning-row"
}, Oa = ["disabled"], za = ["disabled"], Fa = ["disabled"], Ja = ["disabled"], Wa = ["inert"], Ga = {
  key: 1,
  class: "learning-materials-page"
}, Qa = {
  key: 0,
  class: "learning-empty-note"
}, Xa = { class: "learning-materials-title" }, Ya = ["onClick"], _a = ["onClick"], en = {
  key: 0,
  class: "learning-notes"
}, tn = { key: 0 }, an = ["disabled", "onClick"], nn = {
  key: 2,
  class: "learning-goals-page"
}, ln = { key: 0 }, sn = { key: 1 }, rn = { key: 2 }, on = {
  key: 1,
  class: "learning-empty-note"
}, un = {
  key: 4,
  class: "learning-harvest-page"
}, dn = {
  key: 0,
  class: "learning-empty-note"
}, vn = { class: "learning-muted" }, cn = ["disabled", "onClick"], bn = ["disabled"], mn = ["disabled"], gn = {
  key: 3,
  class: "learning-row"
}, yn = ["disabled"], kn = ["disabled"], fn = {
  key: 5,
  class: "learning-settings-page"
}, pn = ["value", "disabled"], $n = ["value"], hn = {
  key: 0,
  class: "learning-muted"
}, Cn = ["value", "disabled"], xn = ["disabled"], wn = ["disabled"], In = ["disabled"], Sn = ["disabled"], Mn = ["disabled"], An = ["disabled"], Ln = ["disabled"], Tn = {
  role: "alertdialog",
  "aria-modal": "true",
  "aria-labelledby": "learning-confirm-title",
  class: "learning-confirm"
}, Vn = { class: "learning-row" }, qn = ["disabled"], Un = /* @__PURE__ */ P({
  __name: "LearningApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(e) {
    const { state: l, pending: g, writable: r, localMessage: o, request: b } = Da(e), h = L(l.value.teacher ? "teacher" : "profile"), M = L(null), $ = L(null), d = L(null), y = H(() => !!u.value || !!d.value), f = L(null), C = {}, u = L(null), I = L(null);
    let A = null;
    const E = L(l.value.profile?.voice?.voiceId ?? l.value.voices.defaultVoice), B = L(l.value.profile?.voice?.language ?? l.value.language), z = L(l.value.profile?.voice?.speed ?? 1), N = L(0), Y = H(() => l.value.completions.slice(N.value * 20, (N.value + 1) * 20));
    D([() => l.value.language, () => l.value.profile?.voice], ([w, i]) => {
      E.value = i?.voiceId ?? l.value.voices.defaultVoice, B.value = i?.language ?? w, z.value = i?.speed ?? 1;
    }), D([
      () => l.value.chatIdentity,
      () => l.value.language,
      () => l.value.teacher?.name
    ], () => {
      d.value = null, u.value = null, N.value = 0;
    }), D(() => l.value.currentUnitId, (w) => {
      u.value?.action === "replace-lesson" && u.value.input.unitId !== w && (u.value = null);
    }), D(() => l.value.unit, (w) => {
      const i = d.value;
      i && (w?.id !== i.unitId || !(i.kind === "exercise" ? w.exercises : w.materials).some((c) => c.id === i.id)) && J();
    }), D(() => l.value.conversation.turns.length + l.value.conversation.removedTurns, (w, i) => {
      const c = l.value.conversation.turns.at(-1)?.presentation;
      w > i && c && F(c);
    });
    async function F(w) {
      if (w.kind === "replacement") {
        if (l.value.currentUnitId !== w.unitId || l.value.storage !== "ready") return;
        await k("teacher"), await x("replace-lesson", {
          unitId: w.unitId,
          message: w.message
        }, "换一课？新课保存成功后会替换当前课件、原答和笔记；学习记录和已获得的奖励资格保留。");
        return;
      }
      l.value.unit?.id === w.unitId && (await k("teacher"), d.value = w);
    }
    function J() {
      d.value = null, b("stop");
    }
    async function p(w, i) {
      J(), await k("teacher"), await $.value?.ask(w, i);
    }
    async function k(w) {
      if (f.value && (C[h.value] = f.value.scrollTop), M.value && (M.value.open = !1), h.value = w, await Z(), f.value) {
        f.value.scrollTop = C[w] ?? 0;
        const i = [...f.value.querySelectorAll("h1")].find((c) => c.offsetParent !== null);
        i && (i.tabIndex = -1, i.focus({ preventScroll: !0 }));
      }
    }
    async function x(w, i, c) {
      A = document.activeElement instanceof HTMLElement ? document.activeElement : null, u.value = {
        action: w,
        input: i,
        text: c
      }, await Z(), I.value?.focus();
    }
    D(u, async (w) => {
      w || (await Z(), A?.focus({ preventScroll: !0 }));
    });
    function R(w) {
      const i = w.currentTarget.querySelectorAll("button");
      w.shiftKey && document.activeElement === i[0] ? (w.preventDefault(), i[i.length - 1]?.focus()) : !w.shiftKey && document.activeElement === i[i.length - 1] && (w.preventDefault(), i[0]?.focus());
    }
    async function W() {
      const w = await b("export");
      if (!w?.document) return;
      const i = URL.createObjectURL(new Blob([JSON.stringify(w.document, null, 2)], { type: "application/json" })), c = document.createElement("a");
      c.href = i, c.download = "LittleWhiteBox_Learning.json", c.click(), setTimeout(() => URL.revokeObjectURL(i), 1e3);
    }
    return (w, i) => (a(), n("section", Ra, [
      t("header", {
        class: "learning-toolbar",
        inert: y.value
      }, [
        h.value !== "teacher" ? (a(), n("button", {
          key: 0,
          type: "button",
          class: "learning-toolbar-back",
          "aria-label": "返回老师对话",
          onClick: i[0] || (i[0] = (c) => k("teacher"))
        }, [V(U, { name: "back" })])) : m("", !0),
        t("button", {
          type: "button",
          class: "learning-wordmark",
          onClick: i[1] || (i[1] = (c) => k("teacher"))
        }, [...i[30] || (i[30] = [t("span", {
          class: "learning-brand-mark",
          "aria-hidden": "true"
        }, [q("a"), t("span", null, "あ")], -1), q("语伴", -1)])]),
        t("details", {
          ref_key: "menu",
          ref: M,
          class: "learning-menu",
          onKeydown: i[2] || (i[2] = Q(O((c) => M.value.open = !1, ["stop", "prevent"]), ["esc"]))
        }, [t("summary", Ha, [V(U, { name: "more" })]), t("nav", Na, [(a(), n(S, null, T([
          ["materials", "课件与笔记"],
          ["records", "学习记录"],
          ["goals", "学习目标"],
          ["harvest", "我的收获"],
          ["settings", "设置"]
        ], ([c, G]) => t("button", {
          key: c,
          type: "button",
          onClick: (Bn) => k(c)
        }, v(G), 9, ja)), 64))])], 544)
      ], 8, Ea),
      s(l).busy || s(l).message || s(o) || s(l).storage !== "ready" ? (a(), n("div", {
        key: 0,
        class: _(["learning-notice", { "is-working": s(l).busy }]),
        role: "status",
        "aria-live": "polite",
        inert: y.value
      }, [s(l).busy ? (a(), n(S, { key: 0 }, [
        i[31] || (i[31] = t("span", { class: "learning-working-dot" }, null, -1)),
        q(v(s(l).message || "正在处理学习操作…"), 1),
        t("button", {
          type: "button",
          disabled: s(g),
          onClick: i[3] || (i[3] = (c) => s(b)("cancel"))
        }, "停止", 8, Pa)
      ], 64)) : (a(), n(S, { key: 1 }, [q(v(s(o) || s(l).message || (s(l).storage === "unconfirmed" ? "上次保存尚未确认，请先核实。" : s(l).storage === "conflict" ? "学习文件出现另一版本，请先核实。" : "暂时无法读取学习文件。")), 1)], 64)), s(l).busy ? m("", !0) : (a(), n("div", Za, [
        s(l).storage === "unconfirmed" || s(l).storage === "conflict" ? (a(), n("button", {
          key: 0,
          type: "button",
          disabled: s(g),
          onClick: i[4] || (i[4] = (c) => s(b)("verify"))
        }, "核实保存", 8, Oa)) : m("", !0),
        s(l).storage === "unconfirmed" ? (a(), n("button", {
          key: 1,
          type: "button",
          disabled: s(g),
          onClick: i[5] || (i[5] = (c) => s(b)("retry-save"))
        }, "重试原保存", 8, za)) : m("", !0),
        s(l).storage === "conflict" ? (a(), n("button", {
          key: 2,
          type: "button",
          disabled: s(g),
          onClick: i[6] || (i[6] = (c) => x("adopt-server", {}, "采用服务器上的学习文件？未确认的本次修改将不再作为候选保留。"))
        }, "采用服务器版本", 8, Fa)) : m("", !0),
        s(l).storage === "unloaded" || s(o) ? (a(), n("button", {
          key: 3,
          type: "button",
          disabled: s(g),
          onClick: i[7] || (i[7] = (c) => s(b)("read"))
        }, "重试读取", 8, Ja)) : m("", !0)
      ]))], 10, Ka)) : m("", !0),
      j(V(Ba, {
        ref_key: "conversation",
        ref: $,
        state: s(l),
        disabled: !s(r),
        inert: y.value,
        onAction: s(b),
        onPresent: F,
        onProfile: i[8] || (i[8] = (c) => k("profile"))
      }, null, 8, [
        "state",
        "disabled",
        "inert",
        "onAction"
      ]), [[te, h.value === "teacher"]]),
      j(t("div", {
        ref_key: "scroller",
        ref: f,
        class: "learning-scroll",
        inert: y.value
      }, [
        h.value === "profile" ? (a(), K(Xt, {
          key: 0,
          state: s(l),
          disabled: !s(r),
          onAction: s(b),
          onDone: i[9] || (i[9] = (c) => k("teacher"))
        }, null, 8, [
          "state",
          "disabled",
          "onAction"
        ])) : m("", !0),
        h.value === "materials" ? (a(), n("section", Ga, [
          i[32] || (i[32] = t("h1", null, "课件与笔记", -1)),
          s(l).unit ? m("", !0) : (a(), n("p", Qa, v(s(l).blockedUnit ? "当前课件在另一个故事中" : "还没有课件"), 1)),
          s(l).unit ? (a(), n(S, { key: 1 }, [
            t("p", Xa, v(s(l).unit.title), 1),
            (a(!0), n(S, null, T(s(l).unit.materials, (c) => (a(), n("button", {
              key: c.id,
              type: "button",
              class: "learning-activity-link",
              onClick: (G) => F({
                unitId: s(l).unit.id,
                kind: "material",
                id: c.id,
                title: c.title
              })
            }, [
              V(U, { name: "book" }),
              t("span", null, v(c.title), 1),
              V(U, { name: "arrow" })
            ], 8, Ya))), 128)),
            (a(!0), n(S, null, T(s(l).unit.exercises, (c) => (a(), n("button", {
              key: c.id,
              type: "button",
              class: "learning-activity-link",
              onClick: (G) => F({
                unitId: s(l).unit.id,
                kind: "exercise",
                id: c.id,
                title: c.prompt
              })
            }, [
              V(U, { name: "records" }),
              t("span", null, v(c.prompt), 1),
              V(U, { name: "arrow" })
            ], 8, _a))), 128)),
            s(l).unit.notes.length ? (a(), n("section", en, [(a(!0), n(S, null, T(s(l).unit.notes, (c) => (a(), n("article", { key: c.id }, [
              c.selection ? (a(), n("blockquote", tn, v(c.selection.quote), 1)) : m("", !0),
              t("p", null, v(c.text), 1),
              t("button", {
                type: "button",
                disabled: !s(r),
                onClick: (G) => s(b)("delete-note", { id: c.id })
              }, "删除笔记", 8, an)
            ]))), 128))])) : m("", !0)
          ], 64)) : m("", !0)
        ])) : m("", !0),
        h.value === "goals" ? (a(), n("section", nn, [
          i[34] || (i[34] = t("h1", null, "学习目标", -1)),
          s(l).profile ? (a(), n(S, { key: 0 }, [
            t("p", null, v(s(l).profile.goal.description), 1),
            s(l).profile.goal.exam ? (a(), n("p", ln, v(s(l).profile.goal.exam), 1)) : m("", !0),
            s(l).profile.goal.targetLevel ? (a(), n("p", sn, v(s(l).profile.goal.targetLevel), 1)) : m("", !0),
            s(l).profile.goal.targetDate ? (a(), n("p", rn, v(s(l).profile.goal.targetDate), 1)) : m("", !0),
            i[33] || (i[33] = t("h2", null, "自评水平", -1)),
            t("p", null, v(s(l).profile.selfAssessment), 1)
          ], 64)) : (a(), n("p", on, "还没有记录目标")),
          t("button", {
            type: "button",
            class: "learning-primary",
            onClick: i[10] || (i[10] = (c) => {
              k("teacher"), $.value?.focus();
            })
          }, "和老师聊聊")
        ])) : m("", !0),
        h.value === "records" ? (a(), K(ba, {
          key: 3,
          state: s(l),
          disabled: !s(r),
          onAction: s(b),
          onRemove: x
        }, null, 8, [
          "state",
          "disabled",
          "onAction"
        ])) : m("", !0),
        h.value === "harvest" ? (a(), n("section", un, [
          i[36] || (i[36] = t("div", { class: "learning-page-heading" }, [t("h1", null, "我的收获")], -1)),
          s(l).completions.length ? m("", !0) : (a(), n("p", dn, "还没有完成的课程")),
          (a(!0), n(S, null, T(Y.value, (c) => (a(), n("article", {
            key: c.unitId,
            class: "learning-harvest-entry"
          }, [
            t("small", null, v(new Date(c.completedAt).toLocaleDateString()), 1),
            t("h2", null, [q("+" + v(c.amount), 1), i[35] || (i[35] = t("span", null, "小白币", -1))]),
            t("p", null, v(c.summary), 1),
            t("p", vn, v(c.paid ? "已到账" : c.originHere ? "学习已完成，等待到账" : "请回到开课的原聊天领取"), 1),
            !c.paid && c.originHere ? (a(), n("button", {
              key: 0,
              type: "button",
              disabled: !s(r),
              onClick: (G) => s(b)("reward", {
                unitId: c.unitId,
                openWallet: !s(l).walletOpen
              })
            }, v(s(l).walletOpen ? "核实并补领" : "开通钱包并领取"), 9, cn)) : m("", !0)
          ]))), 128)),
          s(l).chatStorage === "unconfirmed" || s(l).chatStorage === "conflict" || s(l).chatStorage === "failed" ? (a(), n("button", {
            key: 1,
            type: "button",
            disabled: s(g) || s(l).busy,
            onClick: i[11] || (i[11] = (c) => s(b)("verify-wallet"))
          }, "核实账本保存", 8, bn)) : m("", !0),
          s(l).chatStorage === "conflict" ? (a(), n("button", {
            key: 2,
            type: "button",
            disabled: s(g) || s(l).busy,
            onClick: i[12] || (i[12] = (c) => x("adopt-wallet", {}, "采用服务器上的聊天账本？本次未确认的候选将被放下，之后可凭已保存的学习完成记录核实并补领。"))
          }, "采用服务器账本", 8, mn)) : m("", !0),
          s(l).completions.length > 20 ? (a(), n("div", gn, [t("button", {
            type: "button",
            disabled: N.value === 0,
            onClick: i[13] || (i[13] = (c) => N.value--)
          }, "上一页", 8, yn), t("button", {
            type: "button",
            disabled: (N.value + 1) * 20 >= s(l).completions.length,
            onClick: i[14] || (i[14] = (c) => N.value++)
          }, "下一页", 8, kn)])) : m("", !0)
        ])) : m("", !0),
        h.value === "settings" ? (a(), n("section", fn, [
          i[45] || (i[45] = t("h1", null, "学习设置", -1)),
          t("label", null, [i[37] || (i[37] = q("当前语言", -1)), t("select", {
            value: s(l).language,
            disabled: !s(r),
            onChange: i[15] || (i[15] = (c) => s(b)("language", { language: c.target.value }))
          }, [(a(!0), n(S, null, T([.../* @__PURE__ */ new Set([s(l).language, ...s(l).languages])], (c) => (a(), n("option", {
            key: c,
            value: c
          }, v(new Intl.DisplayNames(["zh-CN"], { type: "language" }).of(c)), 9, $n))), 128))], 40, pn)]),
          t("button", {
            type: "button",
            onClick: i[16] || (i[16] = (c) => k("profile"))
          }, "更换语言和老师 →"),
          t("section", null, [
            i[42] || (i[42] = t("h2", null, "老师的声音", -1)),
            s(l).voices.enabled ? (a(), n("form", {
              key: 1,
              onSubmit: i[20] || (i[20] = O((c) => s(b)("voice", { voice: {
                voiceId: E.value,
                language: B.value,
                speed: Number(z.value)
              } }), ["prevent"]))
            }, [
              t("label", null, [i[38] || (i[38] = q("音色", -1)), j(t("select", { "onUpdate:modelValue": i[17] || (i[17] = (c) => E.value = c) }, [(a(!0), n(S, null, T(s(l).voices.voices, (c) => (a(), n("option", {
                key: c.id,
                value: c.id,
                disabled: !c.available
              }, v(c.name) + v(c.available ? "" : "（暂不可用）"), 9, Cn))), 128))], 512), [[ee, E.value]])]),
              t("label", null, [i[39] || (i[39] = q("发音语言", -1)), j(t("input", {
                "onUpdate:modelValue": i[18] || (i[18] = (c) => B.value = c),
                type: "text",
                maxlength: "80",
                placeholder: "en / ja"
              }, null, 512), [[X, B.value]])]),
              t("label", null, [i[41] || (i[41] = q("合成语速", -1)), j(t("select", { "onUpdate:modelValue": i[19] || (i[19] = (c) => z.value = c) }, [...i[40] || (i[40] = [
                t("option", { value: 0.75 }, "0.75×", -1),
                t("option", { value: 1 }, "1×", -1),
                t("option", { value: 1.25 }, "1.25×", -1)
              ])], 512), [[ee, z.value]])]),
              t("button", {
                type: "submit",
                disabled: !s(r) || !s(l).profile
              }, "保存声音偏好", 8, xn)
            ], 32)) : (a(), n("p", hn, "使用语音前，请先开启 TTS 模块。文字学习不受影响。")),
            t("button", {
              type: "button",
              onClick: i[21] || (i[21] = (c) => s(b)("tts-settings"))
            }, v(s(l).voices.enabled ? "打开 TTS 设置" : "如何开启 TTS"), 1),
            i[43] || (i[43] = t("small", null, "已听过的题保留原声音，新偏好用于之后的题目。", -1))
          ]),
          t("section", null, [
            i[44] || (i[44] = t("h2", null, "学习数据", -1)),
            t("button", {
              type: "button",
              disabled: s(g) || s(l).busy,
              onClick: i[22] || (i[22] = (c) => x("forget-conversation", {}, "清空和当前老师的临时对话？目标、课件、学习记录和奖励都会保留。"))
            }, "清空师生对话", 8, wn),
            t("button", {
              type: "button",
              disabled: !s(r),
              onClick: W
            }, "导出学习数据", 8, In),
            t("button", {
              type: "button",
              disabled: s(g) || s(l).busy,
              onClick: i[23] || (i[23] = (c) => s(b)("read"))
            }, "重新读取保存内容", 8, Sn),
            s(l).unit || s(l).blockedUnit ? (a(), n("button", {
              key: 0,
              type: "button",
              disabled: !s(r),
              onClick: i[24] || (i[24] = (c) => x("abandon", {}, "放下当前这一课？本课课件、原答和笔记会移除；已被学习项保留的证据和完成奖励资格仍保留。"))
            }, "放下当前课件", 8, Mn)) : m("", !0),
            t("button", {
              type: "button",
              class: "learning-danger",
              disabled: !s(r) || !s(l).profile,
              onClick: i[25] || (i[25] = (c) => x("delete-language", {}, "删除当前语言的全部学习数据？未领取奖励也将放弃，已到账流水保留。"))
            }, "删除当前语言", 8, An),
            t("button", {
              type: "button",
              class: "learning-danger",
              disabled: !s(r),
              onClick: i[26] || (i[26] = (c) => x("clear", {}, "清空所有语言的目标、课程和记录？未领取奖励也将放弃。已到账流水不撤销。"))
            }, "清空全部学习数据", 8, Ln)
          ])
        ])) : m("", !0)
      ], 8, Wa), [[te, h.value !== "teacher"]]),
      d.value ? m("", !0) : (a(), K(oe, {
        key: 1,
        state: s(l),
        inert: !!u.value,
        onAction: s(b)
      }, null, 8, [
        "state",
        "inert",
        "onAction"
      ])),
      s(l).unit ? (a(), K(qt, {
        key: `${s(l).chatIdentity}:${s(l).language}:${s(l).unit.id}`,
        state: s(l),
        target: d.value,
        disabled: !s(r),
        onAction: s(b),
        onClose: J,
        onAsk: p
      }, null, 8, [
        "state",
        "target",
        "disabled",
        "onAction"
      ])) : m("", !0),
      u.value ? (a(), n("div", {
        key: 3,
        class: "learning-confirm-shade",
        onKeydown: [i[29] || (i[29] = Q(O((c) => u.value = null, ["stop", "prevent"]), ["esc"])), Q(R, ["tab"])]
      }, [t("section", Tn, [
        i[46] || (i[46] = t("h2", { id: "learning-confirm-title" }, "确认这次操作", -1)),
        t("p", null, v(u.value.text), 1),
        t("div", Vn, [t("button", {
          ref_key: "confirmButton",
          ref: I,
          type: "button",
          onClick: i[27] || (i[27] = (c) => u.value = null)
        }, "先不改", 512), t("button", {
          type: "button",
          class: "learning-primary",
          disabled: s(g) || s(l).busy,
          onClick: i[28] || (i[28] = (c) => {
            s(b)(u.value.action, u.value.input), u.value = null;
          })
        }, "确认", 8, qn)])
      ])], 32)) : m("", !0)
    ]));
  }
}), Rn = Un;
export {
  Rn as default
};
