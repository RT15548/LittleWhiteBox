/* eslint-disable */
import { D as se, F as be, G as s, H as L, I as B, J as u, K as _, S as ae, T as re, U as ge, W as me, a as ee, b as z, c as Q, f as O, g as n, h as b, j as T, k as a, l as F, m as Z, o as X, p as t, s as ne, u as M, v as q, w as G, y as V, z as K } from "./xiaobai-os-runtime-dom.esm-bundler-DGqntx6-.js";
import { n as Y, r as oe } from "./xiaobai-os-app-navigation-D5qZ5Ulq.js";
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
}, we = ["onUpdate:modelValue"], Ie = ["value"], Ae = {
  key: 3,
  class: "learning-choices"
}, Se = ["checked", "onChange"], Me = {
  key: 0,
  class: "learning-muted"
}, Le = {
  key: 4,
  class: "learning-fields"
}, Te = ["onUpdate:modelValue"], Ve = {
  key: 5,
  class: "learning-writing"
}, Re = ["disabled"], Ue = /* @__PURE__ */ z({
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
    const m = e, r = l, v = be(e, "modelValue");
    function d(c) {
      m.response.kind === "choice" && !m.response.multiple ? v.value.picked = [c] : v.value.picked = v.value.picked.includes(c) ? v.value.picked.filter((k) => k !== c) : [...v.value.picked, c];
    }
    function p(c, k) {
      const y = [...v.value.order];
      [y[c], y[c + k]] = [y[c + k], y[c]], v.value.order = y;
    }
    const $ = O(() => {
      const c = m.response;
      return c.kind === "text" ? !!v.value.text.trim() : c.kind === "gaps" ? c.slots.every((k) => v.value.values[k.id]?.trim()) : c.kind === "match" ? c.left.every((k) => v.value.values[k.id]) : c.kind === "order" ? !0 : v.value.picked.length > 0;
    });
    function g() {
      const c = m.response;
      !$.value || m.disabled || (c.kind === "text" ? r("submit", {
        kind: "text",
        text: v.value.text
      }) : c.kind === "gaps" ? r("submit", {
        kind: "gaps",
        values: c.slots.map((k) => ({
          id: k.id,
          text: v.value.values[k.id]
        }))
      }) : c.kind === "match" ? r("submit", {
        kind: "match",
        pairs: c.left.map((k) => ({
          left: k.id,
          right: v.value.values[k.id]
        }))
      }) : r("submit", {
        kind: c.kind,
        ids: [...c.kind === "order" ? v.value.order : v.value.picked]
      }));
    }
    return (c, k) => (a(), n("form", {
      class: "learning-answer",
      onSubmit: F(g, ["prevent"])
    }, [t("fieldset", { disabled: e.disabled }, [
      k[3] || (k[3] = t("legend", { class: "learning-sr-only" }, "你的回答", -1)),
      e.response.kind === "choice" ? (a(), n("div", ke, [(a(!0), n(M, null, T(e.response.options, (y, C) => (a(), n("label", {
        key: y.id,
        class: _({ selected: v.value.picked.includes(y.id) })
      }, [
        t("input", {
          type: e.response.multiple ? "checkbox" : "radio",
          name: "answer-choice",
          checked: v.value.picked.includes(y.id),
          onChange: (f) => d(y.id)
        }, null, 40, fe),
        t("span", pe, u(String.fromCharCode(65 + C)), 1),
        t("span", null, u(y.text), 1)
      ], 2))), 128))])) : e.response.kind === "order" ? (a(), n("ol", $e, [(a(!0), n(M, null, T(v.value.order, (y, C) => (a(), n("li", { key: y }, [
        t("span", null, u(e.response.options.find((f) => f.id === y)?.text), 1),
        t("button", {
          type: "button",
          disabled: C === 0,
          "aria-label": `上移第 ${C + 1} 项`,
          onClick: (f) => p(C, -1)
        }, "↑", 8, he),
        t("button", {
          type: "button",
          disabled: C === v.value.order.length - 1,
          "aria-label": `下移第 ${C + 1} 项`,
          onClick: (f) => p(C, 1)
        }, "↓", 8, Ce)
      ]))), 128))])) : e.response.kind === "match" ? (a(), n("div", xe, [(a(!0), n(M, null, T(e.response.left, (y) => (a(), n("label", { key: y.id }, [q(u(y.text) + " ", 1), K(t("select", { "onUpdate:modelValue": (C) => v.value.values[y.id] = C }, [k[1] || (k[1] = t("option", { value: "" }, "选择对应项", -1)), (a(!0), n(M, null, T(e.response.right, (C) => (a(), n("option", {
        key: C.id,
        value: C.id
      }, u(C.text), 9, Ie))), 128))], 8, we), [[ee, v.value.values[y.id]]])]))), 128))])) : e.response.kind === "evidence" ? (a(), n("div", Ae, [(a(!0), n(M, null, T(e.paragraphs, (y) => (a(), n("label", {
        key: y.id,
        class: _({ selected: v.value.picked.includes(y.id) })
      }, [t("input", {
        type: "checkbox",
        checked: v.value.picked.includes(y.id),
        onChange: (C) => d(y.id)
      }, null, 40, Se), t("span", null, u(y.text), 1)], 2))), 128)), e.paragraphs.length ? b("", !0) : (a(), n("p", Me, "请先展开相关文稿，再选择原文依据。"))])) : e.response.kind === "gaps" ? (a(), n("div", Le, [(a(!0), n(M, null, T(e.response.slots, (y) => (a(), n("label", { key: y.id }, [q(u(y.text), 1), K(t("input", {
        "onUpdate:modelValue": (C) => v.value.values[y.id] = C,
        type: "text",
        maxlength: "4000",
        autocomplete: "off"
      }, null, 8, Te), [[X, v.value.values[y.id]]])]))), 128))])) : (a(), n("label", Ve, [k[2] || (k[2] = t("span", { class: "learning-sr-only" }, "你的回答", -1)), K(t("textarea", {
        "onUpdate:modelValue": k[0] || (k[0] = (y) => v.value.text = y),
        rows: "6",
        maxlength: "4000",
        placeholder: "写下你的回答…"
      }, null, 512), [[X, v.value.text]])])),
      t("button", {
        class: "learning-primary",
        type: "submit",
        disabled: !$.value
      }, "交给老师 →", 8, Re)
    ], 8, ye)], 32));
  }
}), qe = Ue, Be = ["stroke-width"], De = ["d"], Ne = /* @__PURE__ */ z({
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
    return (m, r) => (a(), n("svg", {
      class: "learning-icon",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": e.name === "more" ? 3.5 : 1.7,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true"
    }, [t("path", { d: l[e.name] }, null, 8, De)], 8, Be));
  }
}), U = Ne, He = { class: "learning-material" }, je = { class: "learning-source" }, Oe = { key: 0 }, Ke = ["href"], Fe = {
  key: 0,
  class: "learning-listening-cover"
}, Ze = ["disabled"], ze = {
  key: 1,
  class: "learning-material-body"
}, Pe = ["onMouseup", "onKeyup"], Ee = ["disabled", "onClick"], Je = {
  class: "learning-audio-parts",
  "aria-label": "材料朗读分段"
}, We = ["disabled", "onClick"], Ge = { key: 2 }, Qe = /* @__PURE__ */ z({
  __name: "MaterialReader",
  props: {
    material: {},
    disabled: { type: Boolean },
    exerciseId: {}
  },
  emits: ["action", "select"],
  setup(e, { emit: l }) {
    const m = e, r = l;
    function v(p) {
      r("select", {
        materialId: m.material.id,
        paragraphId: p.id,
        start: 0,
        end: p.text.length,
        quote: p.text
      });
    }
    function d(p, $) {
      const g = window.getSelection();
      if (!g?.rangeCount || g.isCollapsed) return;
      const c = g.getRangeAt(0), k = p.currentTarget;
      if (!k.contains(c.startContainer) || !k.contains(c.endContainer)) return;
      const y = c.cloneRange();
      y.selectNodeContents(k), y.setEnd(c.startContainer, c.startOffset);
      const C = c.toString(), f = y.toString().length;
      C && [...C].length <= 2e3 && $.text.slice(f, f + C.length) === C && r("select", {
        materialId: m.material.id,
        paragraphId: $.id,
        start: f,
        end: f + C.length,
        quote: C
      });
    }
    return (p, $) => (a(), n("article", He, [
      t("h2", null, u(e.material.title), 1),
      t("div", je, [e.material.provenance.kind === "authored" ? (a(), n("span", Oe, "老师自编练习")) : (a(), n("a", {
        key: 1,
        href: e.material.provenance.url,
        target: "_blank",
        rel: "noopener noreferrer"
      }, u(e.material.provenance.kind === "original" ? "原文节选" : "改编自") + " · " + u(e.material.provenance.title) + " ↗", 9, Ke))]),
      e.material.hidden ? (a(), n("div", Fe, [$[1] || ($[1] = t("svg", {
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
        onClick: $[0] || ($[0] = (g) => r("action", "reveal", {
          kind: "transcripts",
          id: e.material.id
        }))
      }, "看文稿", 8, Ze)])) : (a(), n("div", ze, [(a(!0), n(M, null, T(e.material.paragraphs, (g) => (a(), n("div", {
        key: g.id,
        class: "learning-paragraph"
      }, [t("p", {
        tabindex: "0",
        onMouseup: (c) => d(c, g),
        onKeyup: (c) => d(c, g)
      }, u(g.text), 41, Pe), t("button", {
        type: "button",
        disabled: e.disabled || [...g.text].length > 2e3,
        "aria-label": "选这段提问",
        onClick: (c) => v(g)
      }, "选段", 8, Ee)]))), 128))])),
      t("div", Je, [(a(!0), n(M, null, T(e.material.parts, (g) => (a(), n("button", {
        key: g.key,
        type: "button",
        disabled: e.disabled,
        onClick: (c) => r("action", "play", {
          materialId: e.material.id,
          partKey: g.key,
          exerciseId: e.exerciseId
        })
      }, [V(U, { name: "play" }), q(u(e.material.parts.length > 1 ? `听第 ${g.number} 段` : "播放朗读"), 1)], 8, We))), 128))]),
      e.material.parts.length ? (a(), n("small", Ge, "TTS 合成朗读")) : b("", !0)
    ]));
  }
}), le = Qe;
function ue(e, l, m = []) {
  const r = (v) => l.kind === "choice" || l.kind === "order" ? l.options.find((d) => d.id === v)?.text ?? v : m.find((d) => d.id === v)?.text ?? v;
  return e.kind === "text" ? e.text : e.kind === "gaps" ? e.values.map((v) => `${l.kind === "gaps" ? l.slots.find((d) => d.id === v.id)?.text ?? "" : ""} ${v.text}`).join(`
`) : e.kind === "match" ? e.pairs.map((v) => l.kind === "match" ? `${l.left.find((d) => d.id === v.left)?.text} → ${l.right.find((d) => d.id === v.right)?.text}` : "").join(`
`) : e.ids.map(r).join(e.kind === "order" ? " → " : `
`);
}
var Xe = { class: "learning-feedback" }, Ye = { class: "learning-muted" }, _e = { key: 0 }, et = { key: 1 }, tt = { key: 0 }, at = { key: 1 }, nt = { key: 2 }, lt = ["disabled"], it = ["disabled"], st = /* @__PURE__ */ z({
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
    return (m, r) => (a(), n("section", Xe, [
      r[6] || (r[6] = t("p", { class: "learning-eyebrow" }, "已保存的原答", -1)),
      t("blockquote", null, u(s(ue)(e.attempt.answer, e.response, e.paragraphs)), 1),
      t("small", Ye, [
        q(u(e.attempt.help.feedback ? "得到反馈后的再练" : e.attempt.help.answer || e.attempt.help.hint || e.attempt.help.transcript ? "这次有辅助" : "未使用答案或提示"), 1),
        e.attempt.help.replays ? (a(), n("span", _e, " · 重听 " + u(e.attempt.help.replays) + " 次", 1)) : b("", !0),
        e.attempt.help.slowPlayback ? (a(), n("span", et, " · 慢放")) : b("", !0)
      ]),
      e.feedback ? (a(), n(M, { key: 0 }, [
        t("h3", null, u(l[e.feedback.verdict]), 1),
        e.feedback.understanding ? (a(), n("p", tt, [r[2] || (r[2] = t("b", null, "理解", -1)), q(u(e.feedback.understanding), 1)])) : b("", !0),
        e.feedback.expression ? (a(), n("p", at, [r[3] || (r[3] = t("b", null, "表达", -1)), q(u(e.feedback.expression), 1)])) : b("", !0),
        e.feedback.guidance ? (a(), n("p", nt, [r[4] || (r[4] = t("b", null, "批注", -1)), q(u(e.feedback.guidance), 1)])) : b("", !0),
        t("button", {
          type: "button",
          disabled: e.disabled,
          onClick: r[0] || (r[0] = (v) => m.$emit("action", "assess", {
            attemptId: e.attempt.id,
            review: !0,
            message: "请重新审视我的原答与题目。也请考虑其他有效表达，不只对照原来的答案键。"
          }))
        }, u(e.feedback.verdict === "disputed" ? "请老师复核" : "有疑问，请复核"), 9, lt)
      ], 64)) : (a(), n(M, { key: 1 }, [r[5] || (r[5] = t("p", null, "原答已保存，等待老师评估。", -1)), t("button", {
        type: "button",
        disabled: e.disabled,
        onClick: r[1] || (r[1] = (v) => m.$emit("action", "assess", {
          attemptId: e.attempt.id,
          review: !1,
          message: "请评估这条已经保存的原答。"
        }))
      }, "重试评估", 8, it)], 64))
    ]));
  }
}), de = st, rt = {
  key: 0,
  class: "learning-player",
  "aria-label": "课堂朗读"
}, ot = {
  key: 0,
  role: "status"
}, ut = {
  key: 2,
  class: "learning-row"
}, dt = ["aria-label", "disabled"], vt = ["max", "value"], ct = /* @__PURE__ */ z({
  __name: "LearningPlayer",
  props: { state: {} },
  emits: ["action"],
  setup(e, { emit: l }) {
    const m = l;
    function r(v) {
      return `${Math.floor(v / 60)}:${String(Math.floor(v % 60)).padStart(2, "0")}`;
    }
    return (v, d) => e.state.media.status !== "idle" ? (a(), n("section", rt, [
      e.state.media.message ? (a(), n("p", ot, u(e.state.media.message), 1)) : b("", !0),
      e.state.voices.enabled ? b("", !0) : (a(), n("button", {
        key: 1,
        type: "button",
        onClick: d[0] || (d[0] = (p) => m("action", "tts-settings"))
      }, "如何开启 TTS")),
      e.state.media.key ? (a(), n("div", ut, [
        V(U, { name: "sound" }),
        t("span", null, u(e.state.media.status === "loading" ? "正在生成声音…" : `${r(e.state.media.position)} / ${r(e.state.media.duration)}`), 1),
        e.state.media.status === "playing" ? (a(), n("button", {
          key: 0,
          type: "button",
          "aria-label": "暂停",
          onClick: d[1] || (d[1] = (p) => m("action", "pause"))
        }, [V(U, { name: "pause" })])) : [
          "paused",
          "ended",
          "blocked"
        ].includes(e.state.media.status) ? (a(), n("button", {
          key: 1,
          type: "button",
          "aria-label": e.state.media.status === "ended" ? "再听一遍" : "继续播放",
          disabled: e.state.busy,
          onClick: d[2] || (d[2] = (p) => m("action", "resume"))
        }, [V(U, { name: "play" })], 8, dt)) : b("", !0),
        t("button", {
          type: "button",
          "aria-label": "停止",
          onClick: d[3] || (d[3] = (p) => m("action", "stop"))
        }, [V(U, { name: "stop" })]),
        e.state.media.duration ? (a(), n("button", {
          key: 2,
          type: "button",
          onClick: d[4] || (d[4] = (p) => m("action", "rate", { value: e.state.media.rate === 1 ? 0.75 : 1 }))
        }, u(e.state.media.rate) + "×", 1)) : b("", !0)
      ])) : b("", !0),
      e.state.media.duration ? (a(), n("input", {
        key: 3,
        type: "range",
        min: "0",
        max: e.state.media.duration,
        step: "0.1",
        value: e.state.media.position,
        "aria-label": "当前声音片段播放位置",
        onChange: d[5] || (d[5] = (p) => m("action", "seek", { value: Number(p.target.value) }))
      }, null, 40, vt)) : b("", !0)
    ])) : b("", !0);
  }
}), ve = ct;
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
}, wt = { class: "learning-help-actions" }, It = ["disabled"], At = ["disabled"], St = ["disabled"], Mt = {
  key: 0,
  class: "learning-margin-note"
}, Lt = {
  key: 1,
  class: "learning-margin-note"
}, Tt = { key: 0 }, Vt = { key: 1 }, Rt = { key: 2 }, Ut = ["disabled"], qt = /* @__PURE__ */ z({
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
    const m = e, r = l, v = L(null), d = /* @__PURE__ */ new Map(), p = L(null), $ = L(!1), g = L(null), c = L(null);
    function k() {
      g.value ? g.value = null : $.value ? $.value = !1 : r("close");
    }
    oe(c, k);
    const y = L({});
    let C = null;
    const f = O(() => m.target?.kind === "exercise" ? m.state.unit?.exercises.find((h) => h.id === m.target?.id) : void 0), j = O(() => m.state.unit?.materials.filter((h) => m.target?.kind === "material" ? h.id === m.target.id : f.value?.materialIds.includes(h.id)) ?? []), R = O(() => f.value?.id ?? m.state.unit?.exercises.find((h) => h.skill === "listening" && h.materialIds.includes(m.target?.id ?? ""))?.id ?? m.state.unit?.exercises.find((h) => h.materialIds.includes(m.target?.id ?? ""))?.id), P = O(() => j.value.filter((h) => f.value?.response.kind !== "evidence" || h.id === f.value.response.materialId).flatMap((h) => h.paragraphs)), D = O(() => m.state.unit?.attempts.filter((h) => h.exerciseId === f.value?.id).at(-1)), E = O(() => m.state.unit?.assessments.find((h) => h.attemptId === D.value?.id));
    B(() => f.value, (h) => {
      if (!h) return;
      const x = JSON.stringify(h.response);
      y.value[h.id]?.response !== x && (y.value[h.id] = {
        response: x,
        value: ie(h.response)
      });
    }, { immediate: !0 });
    const A = O({
      get: () => y.value[f.value.id].value,
      set: (h) => {
        y.value[f.value.id].value = h;
      }
    });
    B(() => m.target, async (h, x) => {
      x && v.value && d.set(`${x.kind}:${x.id}`, v.value.scrollTop), $.value = !1, g.value = null, await G(), h && (p.value?.focus(), v.value && (v.value.scrollTop = d.get(`${h.kind}:${h.id}`) ?? 0));
    }), B(() => m.state.unit?.id, () => {
      y.value = {}, C = null;
    }), B(() => m.state.unit?.attempts, (h) => {
      if (!C) return;
      const x = h?.filter((I) => I.exerciseId === C.id).at(-1);
      if (x && x.id !== C.before) {
        const I = m.target?.kind === "exercise" && m.target.id === C.id;
        delete y.value[C.id], C = null, I && r("close");
      }
    });
    function w(h) {
      C = {
        id: f.value.id,
        before: D.value?.id
      }, r("action", "submit", {
        unitId: m.state.unit.id,
        exerciseId: f.value.id,
        answer: h
      });
    }
    return (h, x) => e.target ? (a(), n("div", {
      key: 0,
      ref_key: "layer",
      ref: c,
      class: "learning-activity-shade",
      onKeydown: Q(F(k, ["stop", "prevent"]), ["esc"])
    }, [t("section", gt, [
      t("header", mt, [
        t("h2", yt, u(f.value ? "练习" : j.value[0]?.title ?? "材料"), 1),
        e.state.unit ? (a(), n("small", kt, "+" + u(e.state.unit.reward.amount) + " 币", 1)) : b("", !0),
        t("button", {
          ref_key: "closeButton",
          ref: p,
          type: "button",
          "aria-label": "收起课件",
          onClick: x[0] || (x[0] = (I) => r("close"))
        }, [x[17] || (x[17] = q("收起", -1)), V(U, { name: "back" })], 512)
      ]),
      e.state.message && !e.state.busy ? (a(), n("p", ft, u(e.state.message), 1)) : b("", !0),
      t("div", {
        ref_key: "body",
        ref: v,
        class: "learning-activity-body"
      }, [
        f.value && j.value.length ? (a(), n("details", pt, [t("summary", null, "阅读材料 · " + u(j.value.length), 1), (a(!0), n(M, null, T(j.value, (I) => (a(), Z(le, {
          key: I.id,
          material: I,
          "exercise-id": R.value,
          disabled: e.disabled,
          onAction: x[1] || (x[1] = (N, H) => r("action", N, H)),
          onSelect: x[2] || (x[2] = (N) => g.value = N)
        }, null, 8, [
          "material",
          "exercise-id",
          "disabled"
        ]))), 128))])) : f.value ? b("", !0) : (a(!0), n(M, { key: 1 }, T(j.value, (I) => (a(), Z(le, {
          key: I.id,
          material: I,
          "exercise-id": R.value,
          disabled: e.disabled,
          onAction: x[3] || (x[3] = (N, H) => r("action", N, H)),
          onSelect: x[4] || (x[4] = (N) => g.value = N)
        }, null, 8, [
          "material",
          "exercise-id",
          "disabled"
        ]))), 128)),
        g.value ? (a(), n("div", $t, [t("blockquote", null, u(g.value.quote), 1), t("div", ht, [
          t("button", {
            type: "button",
            onClick: x[5] || (x[5] = (I) => r("ask", R.value, g.value))
          }, "问老师"),
          t("button", {
            type: "button",
            disabled: e.disabled || [...g.value.quote].length > 1e3,
            onClick: x[6] || (x[6] = (I) => r("action", "say", { selection: g.value }))
          }, "朗读", 8, Ct),
          t("button", {
            type: "button",
            onClick: x[7] || (x[7] = (I) => g.value = null)
          }, "取消选段")
        ])])) : b("", !0),
        f.value ? (a(), n("section", xt, [
          t("h2", null, u(f.value.prompt), 1),
          t("div", wt, [
            t("button", {
              type: "button",
              disabled: e.disabled || [...f.value.prompt].length > 1e3,
              onClick: x[8] || (x[8] = (I) => r("action", "say-question", { exerciseId: f.value.id }))
            }, "听题干", 8, It),
            f.value.hasHint ? (a(), n("button", {
              key: 0,
              type: "button",
              disabled: e.disabled || f.value.hint !== null,
              onClick: x[9] || (x[9] = (I) => r("action", "reveal", {
                kind: "hints",
                id: f.value.id
              }))
            }, "提示", 8, At)) : b("", !0),
            t("button", {
              type: "button",
              disabled: e.disabled || f.value.solution !== null,
              onClick: x[10] || (x[10] = (I) => r("action", "reveal", {
                kind: "answers",
                id: f.value.id
              }))
            }, "解答", 8, St),
            t("button", {
              type: "button",
              onClick: x[11] || (x[11] = (I) => r("ask", f.value.id))
            }, "问老师")
          ]),
          f.value.hint ? (a(), n("p", Mt, u(f.value.hint), 1)) : b("", !0),
          f.value.solution ? (a(), n("div", Lt, [f.value.solution.kind === "exact" ? (a(), n("p", Tt, u(s(ue)(f.value.solution.answer, f.value.response, P.value)), 1)) : f.value.solution.kind === "gaps" ? (a(), n("p", Vt, u(f.value.solution.accepted.map((I) => I.forms.join(" / ")).join(`
`)), 1)) : b("", !0), f.value.solution.kind !== "semantic" ? (a(), n("p", Rt, u(f.value.solution.explanation), 1)) : (a(), n("button", {
            key: 3,
            type: "button",
            onClick: x[12] || (x[12] = (I) => r("ask", f.value.id))
          }, "请老师讲解"))])) : b("", !0),
          (!D.value || $.value) && y.value[f.value.id] ? (a(), Z(qe, {
            key: f.value.id,
            modelValue: A.value,
            "onUpdate:modelValue": x[13] || (x[13] = (I) => A.value = I),
            response: f.value.response,
            paragraphs: P.value,
            disabled: e.disabled,
            onSubmit: w
          }, null, 8, [
            "modelValue",
            "response",
            "paragraphs",
            "disabled"
          ])) : b("", !0),
          D.value ? (a(), Z(de, {
            key: 3,
            attempt: D.value,
            feedback: E.value,
            response: f.value.response,
            paragraphs: P.value,
            disabled: e.disabled,
            onAction: x[14] || (x[14] = (I, N) => {
              r("action", I, N), r("close");
            })
          }, null, 8, [
            "attempt",
            "feedback",
            "response",
            "paragraphs",
            "disabled"
          ])) : b("", !0),
          D.value ? (a(), n("button", {
            key: 4,
            type: "button",
            disabled: e.disabled,
            onClick: x[15] || (x[15] = (I) => {
              $.value = !$.value, y.value[f.value.id] ??= {
                response: JSON.stringify(f.value.response),
                value: s(ie)(f.value.response)
              };
            })
          }, u($.value ? "收起再练" : "再试一次"), 9, Ut)) : b("", !0)
        ])) : b("", !0)
      ], 512),
      V(ve, {
        state: e.state,
        onAction: x[16] || (x[16] = (I, N) => r("action", I, N))
      }, null, 8, ["state"])
    ])], 40, bt)) : b("", !0);
  }
}), Bt = qt, Dt = { class: "learning-profile-page" }, Nt = { class: "learning-setup-heading" }, Ht = { class: "learning-language-options" }, jt = [
  "disabled",
  "aria-pressed",
  "onClick"
], Ot = { "aria-hidden": "true" }, Kt = ["disabled"], Ft = { class: "learning-teacher-options" }, Zt = [
  "disabled",
  "aria-pressed",
  "onClick"
], zt = { class: "learning-person-initial" }, Pt = {
  key: 0,
  class: "learning-selected-teacher"
}, Et = { class: "learning-person-initial" }, Jt = ["open"], Wt = ["disabled"], Gt = ["disabled"], Qt = { class: "learning-setup-actions" }, Xt = ["disabled"], Yt = ["disabled"], _t = /* @__PURE__ */ z({
  __name: "LearningSetup",
  props: {
    state: {},
    disabled: { type: Boolean }
  },
  emits: ["action", "done"],
  setup(e, { emit: l }) {
    const m = l, r = L(0), v = L(null), d = L(""), p = [
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
    async function $(g) {
      r.value = g, await G(), v.value?.focus();
    }
    return Y(() => r.value ? ($(0), !0) : !1), (g, c) => (a(), n("section", Dt, [t("div", Nt, [t("h1", {
      ref_key: "heading",
      ref: v,
      tabindex: "-1"
    }, u(r.value === 0 ? "选择要学习的语言" : "选择老师"), 513)]), r.value === 0 ? (a(), n(M, { key: 0 }, [t("div", Ht, [(a(), n(M, null, T(p, ([k, y, C]) => t("button", {
      key: k,
      type: "button",
      disabled: e.disabled,
      "aria-pressed": e.state.language === k,
      onClick: (f) => m("action", "language", { language: k })
    }, [
      t("span", Ot, u(C), 1),
      t("strong", null, u(y), 1),
      e.state.language === k ? (a(), Z(U, {
        key: 0,
        name: "check"
      })) : b("", !0)
    ], 8, jt)), 64))]), t("button", {
      type: "button",
      class: "learning-primary learning-setup-next",
      disabled: e.disabled,
      onClick: c[0] || (c[0] = (k) => $(1))
    }, [c[5] || (c[5] = q("继续", -1)), V(U, { name: "arrow" })], 8, Kt)], 64)) : (a(), n(M, { key: 1 }, [
      t("div", Ft, [(a(!0), n(M, null, T(e.state.candidates, (k) => (a(), n("button", {
        key: k.name,
        type: "button",
        disabled: e.disabled,
        "aria-pressed": e.state.teacher?.name === k.name,
        onClick: (y) => m("action", "teacher", { teacher: {
          name: k.name,
          note: ""
        } })
      }, [
        t("span", zt, u([...k.name][0]), 1),
        t("strong", null, u(k.name), 1),
        e.state.teacher?.name === k.name ? (a(), Z(U, {
          key: 0,
          name: "check"
        })) : b("", !0)
      ], 8, Zt))), 128))]),
      e.state.teacher && !e.state.candidates.some((k) => k.name === e.state.teacher?.name) ? (a(), n("p", Pt, [
        t("span", Et, u([...e.state.teacher.name][0]), 1),
        q(u(e.state.teacher.name), 1),
        V(U, { name: "check" })
      ])) : b("", !0),
      t("details", {
        class: "learning-other-teacher",
        open: !e.state.candidates.length && !e.state.teacher
      }, [c[6] || (c[6] = t("summary", null, "选择其他人物", -1)), t("form", {
        class: "learning-row",
        onSubmit: c[2] || (c[2] = F((k) => m("action", "teacher", { teacher: {
          name: d.value.trim(),
          note: ""
        } }), ["prevent"]))
      }, [K(t("input", {
        "onUpdate:modelValue": c[1] || (c[1] = (k) => d.value = k),
        type: "text",
        "aria-label": "其他人物名字",
        maxlength: "80",
        placeholder: "输入人物名字",
        disabled: e.disabled
      }, null, 8, Wt), [[X, d.value]]), t("button", {
        type: "submit",
        disabled: e.disabled || !d.value.trim()
      }, "选这位", 8, Gt)], 32)], 8, Jt),
      t("div", Qt, [t("button", {
        type: "button",
        disabled: e.disabled,
        onClick: c[3] || (c[3] = (k) => $(0))
      }, "上一步", 8, Xt), t("button", {
        type: "button",
        class: "learning-primary",
        disabled: e.disabled || !e.state.teacher,
        onClick: c[4] || (c[4] = (k) => m("done"))
      }, [c[7] || (c[7] = q("和老师聊聊", -1)), V(U, { name: "arrow" })], 8, Yt)])
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
}, ca = ["disabled"], ba = { class: "learning-muted" }, ga = ["disabled"], ma = /* @__PURE__ */ z({
  __name: "LearningRecords",
  props: {
    state: {},
    disabled: { type: Boolean }
  },
  emits: ["action", "remove"],
  setup(e, { emit: l }) {
    const m = e, r = l;
    Y(() => m.state.record ? (r("action", "records", { offset: m.state.records.offset }), !0) : !1);
    const v = {
      unassessed: "尚待练习",
      review: "待复核",
      independent: "已能独立使用",
      practised: "练过一次",
      strengthen: "再练练"
    };
    return (d, p) => (a(), n("section", ta, [t("div", aa, [p[5] || (p[5] = t("h1", null, "学习记录", -1)), e.state.records.total ? (a(), n("span", na, u(e.state.records.total) + " 项", 1)) : b("", !0)]), e.state.record ? (a(), n(M, { key: 0 }, [
      t("button", {
        type: "button",
        onClick: p[0] || (p[0] = ($) => d.$emit("action", "records", { offset: e.state.records.offset }))
      }, "‹ 返回记录"),
      t("h2", null, u(e.state.record.label), 1),
      (a(!0), n(M, null, T(e.state.record.evidence, ($) => (a(), n("article", {
        key: $.attempt.id,
        class: "learning-record-evidence"
      }, [
        t("p", la, u(new Date($.attempt.submittedAt).toLocaleDateString()), 1),
        t("h3", null, u($.exercise.prompt), 1),
        (a(!0), n(M, null, T($.materials, (g) => (a(), n("details", { key: g.id }, [t("summary", null, u(g.title), 1), g.hidden ? (a(), n("p", ia, "听力文稿尚未展开；原答和反馈如下。")) : (a(!0), n(M, { key: 1 }, T(g.paragraphs, (c) => (a(), n("p", { key: c.id }, u(c.text), 1))), 128))]))), 128)),
        V(de, {
          attempt: $.attempt,
          feedback: $.assessment,
          response: $.exercise.response,
          paragraphs: $.materials.flatMap((g) => g.paragraphs),
          disabled: e.disabled,
          onAction: p[1] || (p[1] = (g, c) => d.$emit("action", g, c))
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
          onClick: (g) => d.$emit("remove", "delete-attempt", { id: $.attempt.id }, "删除这条原答和依赖它的反馈？相关学习项会重新计算，不撤回已到账奖励。")
        }, "删除这条原答", 8, sa)
      ]))), 128)),
      t("button", {
        type: "button",
        disabled: e.disabled,
        onClick: p[2] || (p[2] = ($) => d.$emit("remove", "delete-item", { id: e.state.record.id }, "删除这个学习项及其不再被引用的证据？当前课程不会被删除。"))
      }, "删除学习项", 8, ra)
    ], 64)) : (a(), n(M, { key: 1 }, [
      e.state.records.total ? b("", !0) : (a(), n("p", oa, "暂无学习记录")),
      (a(!0), n(M, null, T(e.state.records.items, ($) => (a(), n("button", {
        key: $.id,
        class: "learning-record-row",
        type: "button",
        disabled: !$.readable,
        onClick: (g) => d.$emit("action", "records", {
          id: $.id,
          offset: e.state.records.offset
        })
      }, [t("span", null, [t("strong", null, u($.label), 1), t("small", null, [q(u($.evidenceCount) + " 份作答依据", 1), $.nextReviewAt ? (a(), n("span", da, " · 建议 " + u(new Date($.nextReviewAt).toLocaleDateString()) + " 再练", 1)) : b("", !0)])]), t("em", null, u(v[$.state]), 1)], 8, ua))), 128)),
      e.state.records.total > 30 ? (a(), n("div", va, [
        t("button", {
          type: "button",
          disabled: e.state.records.offset === 0,
          onClick: p[3] || (p[3] = ($) => d.$emit("action", "records", { offset: Math.max(0, e.state.records.offset - 30) }))
        }, "上一页", 8, ca),
        t("span", ba, u(e.state.records.total) + " 项", 1),
        t("button", {
          type: "button",
          disabled: e.state.records.offset + 30 >= e.state.records.total,
          onClick: p[4] || (p[4] = ($) => d.$emit("action", "records", { offset: e.state.records.offset + 30 }))
        }, "下一页", 8, ga)
      ])) : b("", !0)
    ], 64))]));
  }
}), ya = ma, ka = { class: "learning-conversation" }, fa = { class: "learning-conversation-heading" }, pa = { class: "learning-person-initial" }, $a = ["disabled"], ha = {
  key: 0,
  class: "learning-history-notice"
}, Ca = { class: "learning-conversation-user" }, xa = { class: "learning-conversation-teacher" }, wa = ["disabled", "onClick"], Ia = {
  key: 1,
  class: "learning-conversation-tools"
}, Aa = ["disabled"], Sa = ["disabled"], Ma = {
  key: 1,
  class: "learning-conversation-user"
}, La = {
  key: 2,
  class: "learning-working",
  role: "status"
}, Ta = {
  key: 3,
  class: "learning-conversation-empty"
}, Va = ["disabled"], Ra = { key: 2 }, Ua = { class: "learning-composer-surface" }, qa = {
  key: 0,
  class: "learning-composer-quote"
}, Ba = { class: "learning-composer-row" }, Da = ["maxlength", "onKeydown"], Na = [
  "type",
  "disabled",
  "aria-label",
  "title"
], Ha = /* @__PURE__ */ z({
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
  setup(e, { expose: l, emit: m }) {
    const r = e, v = m, d = L(""), p = L(null), $ = L(null), g = L(null);
    let c = !0, k = null, y = 0, C = "", f = 0;
    function j() {
      const A = $.value;
      A && (c = A.scrollHeight - A.scrollTop - A.clientHeight < 70);
    }
    async function R() {
      await G(), c && $.value && ($.value.scrollTop = $.value.scrollHeight);
    }
    function P() {
      const A = p.value;
      A?.clientWidth && (A.style.height = "auto", A.style.height = `${A.scrollHeight}px`, R());
    }
    B(d, P, { flush: "post" }), B(p, (A) => {
      if (k?.disconnect(), cancelAnimationFrame(y), !A) return;
      let w = 0;
      k = new ResizeObserver(([h]) => {
        h.contentRect.width !== w && (w = h.contentRect.width, cancelAnimationFrame(y), y = requestAnimationFrame(P));
      }), k.observe(A.parentElement);
    }, { flush: "post" }), se(R), re(() => {
      k?.disconnect(), cancelAnimationFrame(y);
    }), B(() => r.state.conversation.turns.length + r.state.conversation.removedTurns, (A) => {
      const w = r.state.conversation.turns.at(-1), h = g.value?.selection ? `${C}

${g.value.selection.quote}` : C;
      A > f && w?.user === h && d.value.trim() === C && (d.value = "", C = "", g.value = null);
    }), B([
      () => r.state.chatIdentity,
      () => r.state.language,
      () => r.state.teacher?.name
    ], () => {
      d.value = "", C = "", g.value = null;
    }), B(() => r.state.unit?.id, () => {
      g.value = null;
    }), B(() => r.state.conversation.turns.length, (A, w) => {
      !A && w && !r.state.busy && (d.value = "", C = "");
    });
    function D() {
      r.disabled || !d.value.trim() || (C = d.value.trim(), f = r.state.conversation.turns.length + r.state.conversation.removedTurns, v("action", g.value ? "explain" : "talk", {
        message: C,
        ...g.value ?? {}
      }));
    }
    B(() => r.state.conversation.pending, (A) => {
      A && (c = !0), R();
    }), B([
      () => r.state.conversation.turns.length,
      () => r.state.busy,
      () => r.state.message
    ], R);
    function E(A) {
      return A.kind === "replacement" ? !r.disabled && r.state.currentUnitId === A.unitId : r.state.unit?.id === A.unitId && (A.kind === "exercise" ? r.state.unit.exercises : r.state.unit.materials).some((w) => w.id === A.id);
    }
    return l({
      async ask(A, w) {
        g.value = {
          exerciseId: A,
          selection: w
        }, await G(), p.value?.focus();
      },
      focus: () => p.value?.focus({ preventScroll: !0 })
    }), (A, w) => (a(), n("section", ka, [
      t("header", fa, [
        t("span", pa, u([...e.state.teacher?.name ?? "师"][0]), 1),
        t("h1", null, u(e.state.teacher?.name ?? "老师"), 1),
        t("button", {
          type: "button",
          disabled: e.disabled,
          "aria-label": "更换学习语言和老师",
          onClick: w[0] || (w[0] = (h) => v("profile"))
        }, u(new Intl.DisplayNames(["zh-CN"], { type: "language" }).of(e.state.language)), 9, $a)
      ]),
      t("div", {
        ref_key: "scroller",
        ref: $,
        class: "learning-conversation-turns",
        "aria-label": "师生对话",
        onScroll: j
      }, [
        e.state.conversation.removedTurns ? (a(), n("p", ha, "较早对话已整理为课堂记忆。")) : b("", !0),
        (a(!0), n(M, null, T(e.state.conversation.turns, (h, x) => (a(), n("div", {
          key: x,
          class: "learning-conversation-turn"
        }, [
          t("p", Ca, u(h.user), 1),
          t("p", xa, u(h.teacher), 1),
          h.presentation ? (a(), n("button", {
            key: 0,
            type: "button",
            class: "learning-activity-link",
            disabled: !E(h.presentation),
            onClick: (I) => v("present", h.presentation)
          }, [
            V(U, { name: h.presentation.kind === "material" ? "book" : "records" }, null, 8, ["name"]),
            t("span", null, u(h.presentation.title), 1),
            V(U, { name: "arrow" })
          ], 8, wa)) : b("", !0),
          x === e.state.conversation.turns.length - 1 && e.state.reply?.text === h.teacher ? (a(), n("div", Ia, [[...h.teacher].length <= 1e3 ? (a(), n("button", {
            key: 0,
            type: "button",
            disabled: e.disabled,
            onClick: w[1] || (w[1] = (I) => v("action", "say-reply"))
          }, [V(U, { name: "sound" }), w[8] || (w[8] = q("听老师说", -1))], 8, Aa)) : b("", !0), e.state.reply.exerciseId && [...h.teacher].length <= 4e3 ? (a(), n("button", {
            key: 1,
            type: "button",
            disabled: e.disabled || e.state.unit?.notes.some((I) => I.text === h.teacher),
            onClick: w[2] || (w[2] = (I) => v("action", "save-note"))
          }, "保存笔记", 8, Sa)) : b("", !0)])) : b("", !0)
        ]))), 128)),
        e.state.conversation.pending ? (a(), n("p", Ma, u(e.state.conversation.pending), 1)) : b("", !0),
        e.state.busy ? (a(), n("div", La, [w[9] || (w[9] = t("span", {
          class: "learning-working-dot",
          "aria-hidden": "true"
        }, null, -1)), t("span", null, u(e.state.message || "老师正在回复…"), 1)])) : b("", !0),
        !e.state.conversation.turns.length && !e.state.conversation.pending && !e.state.busy ? (a(), n("div", Ta, [
          V(U, { name: "chat" }),
          t("p", null, u(e.state.teacher ? "今天想学什么？" : "先选一位老师"), 1),
          e.state.teacher ? (a(), n("button", {
            key: 1,
            type: "button",
            disabled: e.disabled,
            onClick: w[4] || (w[4] = (h) => v("action", "talk", { message: e.state.profile ? "请根据我的学习目标和记录，带我继续学习。" : "我想跟你学习这门语言，先聊聊我的水平和目标吧。" }))
          }, u(e.state.profile ? "继续学习" : "开始交流"), 9, Va)) : (a(), n("button", {
            key: 0,
            class: "learning-primary",
            type: "button",
            onClick: w[3] || (w[3] = (h) => v("profile"))
          }, "选择老师")),
          e.state.teacher ? (a(), n("small", Ra, "交流与教学会调用模型")) : b("", !0)
        ])) : b("", !0)
      ], 544),
      e.state.teacher ? (a(), n("form", {
        key: 0,
        class: "learning-conversation-compose",
        onSubmit: F(D, ["prevent"])
      }, [t("div", Ua, [g.value ? (a(), n("div", qa, [t("span", null, u(g.value.selection?.quote ?? "请教这道题"), 1), t("button", {
        type: "button",
        "aria-label": "取消引用",
        onClick: w[5] || (w[5] = (h) => g.value = null)
      }, "×")])) : b("", !0), t("div", Ba, [K(t("textarea", {
        ref_key: "composer",
        ref: p,
        "onUpdate:modelValue": w[6] || (w[6] = (h) => d.value = h),
        rows: "1",
        maxlength: g.value?.selection ? 1800 : g.value?.exerciseId ? 2e3 : 4e3,
        "aria-label": "和老师说",
        placeholder: "和老师说…",
        onKeydown: [Q(F(D, ["ctrl", "prevent"]), ["enter"]), Q(F(D, ["meta", "prevent"]), ["enter"])]
      }, null, 40, Da), [[X, d.value]]), t("button", {
        type: e.state.busy ? "button" : "submit",
        class: _(e.state.busy ? "learning-composer-stop" : "learning-primary"),
        disabled: e.state.busy ? e.pending : e.disabled || !d.value.trim(),
        "aria-label": e.state.busy ? "停止回复" : "发送给老师",
        title: e.state.busy ? "停止回复" : "发送给老师",
        onClick: w[7] || (w[7] = F((h) => e.state.busy ? v("action", "cancel") : D(), ["prevent"]))
      }, [V(U, { name: e.state.busy ? "stop" : "send" }, null, 8, ["name"])], 10, Na)])])], 32)) : b("", !0)
    ]));
  }
}), ja = Ha;
function Oa(e) {
  const l = ge(structuredClone(me(e.initialState))), m = L(!1), r = L("");
  let v = !1, d = 0, p = () => {
  };
  const $ = O(() => !m.value && !l.value.busy && l.value.storage === "ready");
  async function g(c, k = {}) {
    if (m.value) return;
    m.value = !0, r.value = "";
    const y = l.value.chatIdentity, C = d;
    try {
      const f = await e.bridge.request(`learning/${c}`, {
        chatIdentity: y,
        ...k
      }, 35e3);
      return !v || l.value.chatIdentity !== y ? void 0 : (d === C && f.result.state.chatIdentity === y && (l.value = f.result.state), f.result);
    } catch {
      v && l.value.chatIdentity === y && (r.value = "暂未收到操作结果。请先读取已保存内容，不要重复提交或生成。");
    } finally {
      v && (m.value = !1);
    }
  }
  return se(() => {
    v = !0, p = e.bridge.subscribe((c) => {
      if (c.type === "learning/media") {
        l.value = {
          ...l.value,
          media: c.payload.media
        };
        return;
      }
      if (c.type !== "learning/state") return;
      const k = c.payload.state;
      k.chatIdentity === l.value.chatIdentity && (d++, l.value = k, r.value = "");
    });
  }), re(() => {
    v = !1, p();
  }), {
    state: l,
    pending: m,
    writable: $,
    localMessage: r,
    request: g
  };
}
var Ka = {
  class: "learning-app",
  "aria-label": "语伴语言学习"
}, Fa = { class: "learning-toolbar" }, Za = { "aria-label": "学习资料与设置" }, za = { "aria-label": "学习资料与设置" }, Pa = ["onClick"], Ea = {
  key: 0,
  class: "learning-notice",
  role: "status",
  "aria-live": "polite"
}, Ja = { class: "learning-row" }, Wa = ["disabled"], Ga = ["disabled"], Qa = ["disabled"], Xa = ["disabled"], Ya = {
  key: 0,
  class: "learning-working",
  role: "status"
}, _a = ["disabled"], en = {
  key: 2,
  class: "learning-materials-page"
}, tn = {
  key: 0,
  class: "learning-empty-note"
}, an = { class: "learning-materials-title" }, nn = ["onClick"], ln = ["onClick"], sn = {
  key: 0,
  class: "learning-notes"
}, rn = { key: 0 }, on = ["disabled", "onClick"], un = {
  key: 3,
  class: "learning-goals-page"
}, dn = { key: 0 }, vn = { key: 1 }, cn = { key: 2 }, bn = {
  key: 1,
  class: "learning-empty-note"
}, gn = {
  key: 5,
  class: "learning-harvest-page"
}, mn = {
  key: 0,
  class: "learning-empty-note"
}, yn = { class: "learning-muted" }, kn = ["disabled", "onClick"], fn = ["disabled"], pn = ["disabled"], $n = {
  key: 3,
  class: "learning-row"
}, hn = ["disabled"], Cn = ["disabled"], xn = {
  key: 6,
  class: "learning-settings-page"
}, wn = ["value", "disabled"], In = ["value"], An = {
  key: 0,
  class: "learning-muted"
}, Sn = ["value", "disabled"], Mn = ["disabled"], Ln = ["disabled"], Tn = ["disabled"], Vn = ["disabled"], Rn = ["disabled"], Un = ["disabled"], qn = ["disabled"], Bn = {
  role: "alertdialog",
  "aria-labelledby": "learning-confirm-title",
  class: "learning-confirm"
}, Dn = { class: "learning-row" }, Nn = ["disabled"], Hn = /* @__PURE__ */ z({
  __name: "LearningApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(e) {
    const { state: l, pending: m, writable: r, localMessage: v, request: d } = Oa(e), p = L(l.value.teacher ? "teacher" : "profile"), $ = [], g = L(null), c = L(!1);
    Y(() => g.value?.open ? (g.value.open = !1, !0) : !1, () => c.value);
    const k = L(null), y = L(null), C = L(null), f = {};
    let j = 0;
    B(() => !!l.value.record, async (S, i) => {
      p.value !== "records" || S === i || (S && (j = C.value?.scrollTop ?? 0), await G(), p.value === "records" && C.value && (C.value.scrollTop = S ? 0 : j));
    });
    const R = L(null), P = L(null);
    oe(P, () => {
      R.value = null;
    });
    const D = L(l.value.profile?.voice?.voiceId ?? l.value.voices.defaultVoice), E = L(l.value.profile?.voice?.language ?? l.value.language), A = L(l.value.profile?.voice?.speed ?? 1), w = L(0), h = O(() => l.value.completions.slice(w.value * 20, (w.value + 1) * 20));
    B([() => l.value.language, () => l.value.profile?.voice], ([S, i]) => {
      D.value = i?.voiceId ?? l.value.voices.defaultVoice, E.value = i?.language ?? S, A.value = i?.speed ?? 1;
    }), B([
      () => l.value.chatIdentity,
      () => l.value.language,
      () => l.value.teacher?.name
    ], () => {
      y.value = null, R.value = null, w.value = 0;
    }), B(() => l.value.currentUnitId, (S) => {
      R.value?.action === "replace-lesson" && R.value.input.unitId !== S && (R.value = null);
    }), B(() => l.value.unit, (S) => {
      const i = y.value;
      i && (S?.id !== i.unitId || !(i.kind === "exercise" ? S.exercises : S.materials).some((o) => o.id === i.id)) && I();
    }), B(() => l.value.conversation.turns.length + l.value.conversation.removedTurns, (S, i) => {
      const o = l.value.conversation.turns.at(-1)?.presentation;
      S > i && o && x(o);
    });
    function x(S) {
      if (S.kind === "replacement") {
        if (l.value.currentUnitId !== S.unitId || l.value.storage !== "ready") return;
        J("replace-lesson", {
          unitId: S.unitId,
          message: S.message
        }, "换一课？新课保存成功后会替换当前课件、原答和笔记；学习记录和已获得的奖励资格保留。");
        return;
      }
      l.value.unit?.id === S.unitId && (y.value = S);
    }
    function I() {
      y.value = null, d("stop");
    }
    async function N(S, i) {
      I(), await H("teacher"), await k.value?.ask(S, i);
    }
    async function H(S, i = !1) {
      if (S !== p.value && !i) if (S === "teacher") $.length = 0;
      else {
        const o = $.indexOf(S);
        o >= 0 ? $.splice(o) : $.push(p.value);
      }
      if (C.value && (f[p.value] = C.value.scrollTop), g.value && (g.value.open = !1), p.value = S, await G(), C.value) {
        C.value.scrollTop = f[S] ?? 0;
        const o = [...C.value.querySelectorAll("h1")].find((W) => W.offsetParent !== null);
        o && (o.tabIndex = -1, o.focus({ preventScroll: !0 }));
      }
    }
    const te = Y(() => g.value?.open ? (g.value.open = !1, !0) : p.value === "teacher" || !$.length && p.value === "profile" && !l.value.teacher ? !1 : (H($.pop() ?? "teacher", !0), !0));
    function J(S, i, o) {
      R.value = {
        action: S,
        input: i,
        text: o
      };
    }
    async function ce() {
      const S = await d("export");
      if (!S?.document) return;
      const i = URL.createObjectURL(new Blob([JSON.stringify(S.document, null, 2)], { type: "application/json" })), o = document.createElement("a");
      o.href = i, o.download = "LittleWhiteBox_Learning.json", o.click(), setTimeout(() => URL.revokeObjectURL(i), 1e3);
    }
    return (S, i) => (a(), n("section", Ka, [
      t("header", Fa, [
        p.value !== "teacher" && (s(l).teacher || $.length) ? (a(), n("button", {
          key: 0,
          type: "button",
          class: "learning-toolbar-back",
          "aria-label": "返回上一页",
          onClick: i[0] || (i[0] = (...o) => s(te) && s(te)(...o))
        }, [V(U, { name: "back" })])) : b("", !0),
        t("button", {
          type: "button",
          class: "learning-wordmark",
          onClick: i[1] || (i[1] = (o) => H("teacher"))
        }, [...i[31] || (i[31] = [t("span", {
          class: "learning-brand-mark",
          "aria-hidden": "true"
        }, [q("a"), t("span", null, "あ")], -1), q("语伴", -1)])]),
        t("details", {
          ref_key: "menu",
          ref: g,
          class: "learning-menu",
          onToggle: i[2] || (i[2] = (o) => c.value = !!g.value?.open),
          onKeydown: i[3] || (i[3] = Q(F((o) => g.value.open = !1, ["stop", "prevent"]), ["esc"]))
        }, [t("summary", Za, [V(U, { name: "more" })]), t("nav", za, [(a(), n(M, null, T([
          ["materials", "课件与笔记"],
          ["records", "学习记录"],
          ["goals", "学习目标"],
          ["harvest", "我的收获"],
          ["settings", "设置"]
        ], ([o, W]) => t("button", {
          key: o,
          type: "button",
          onClick: (jn) => H(o)
        }, u(W), 9, Pa)), 64))])], 544)
      ]),
      !s(l).busy && (s(l).message || s(v) || s(l).storage !== "ready") ? (a(), n("div", Ea, [q(u(s(v) || s(l).message || (s(l).storage === "unconfirmed" ? "上次保存尚未确认，请先核实。" : s(l).storage === "conflict" ? "学习文件出现另一版本，请先核实。" : "暂时无法读取学习文件。")) + " ", 1), t("div", Ja, [
        s(l).storage === "unconfirmed" || s(l).storage === "conflict" ? (a(), n("button", {
          key: 0,
          type: "button",
          disabled: s(m),
          onClick: i[4] || (i[4] = (o) => s(d)("verify"))
        }, "核实保存", 8, Wa)) : b("", !0),
        s(l).storage === "unconfirmed" ? (a(), n("button", {
          key: 1,
          type: "button",
          disabled: s(m),
          onClick: i[5] || (i[5] = (o) => s(d)("retry-save"))
        }, "重试原保存", 8, Ga)) : b("", !0),
        s(l).storage === "conflict" ? (a(), n("button", {
          key: 2,
          type: "button",
          disabled: s(m),
          onClick: i[6] || (i[6] = (o) => J("adopt-server", {}, "采用服务器上的学习文件？未确认的本次修改将不再作为候选保留。"))
        }, "采用服务器版本", 8, Qa)) : b("", !0),
        s(l).storage === "unloaded" || s(v) ? (a(), n("button", {
          key: 3,
          type: "button",
          disabled: s(m),
          onClick: i[7] || (i[7] = (o) => s(d)("read"))
        }, "重试读取", 8, Xa)) : b("", !0)
      ])])) : b("", !0),
      K(V(ja, {
        ref_key: "conversation",
        ref: k,
        state: s(l),
        disabled: !s(r),
        pending: s(m),
        onAction: s(d),
        onPresent: x,
        onProfile: i[8] || (i[8] = (o) => H("profile"))
      }, null, 8, [
        "state",
        "disabled",
        "pending",
        "onAction"
      ]), [[ne, p.value === "teacher"]]),
      K(t("div", {
        ref_key: "scroller",
        ref: C,
        class: "learning-scroll"
      }, [
        s(l).busy ? (a(), n("div", Ya, [
          i[32] || (i[32] = t("span", {
            class: "learning-working-dot",
            "aria-hidden": "true"
          }, null, -1)),
          t("span", null, u(s(l).message || "正在处理学习操作…"), 1),
          t("button", {
            type: "button",
            disabled: s(m),
            onClick: i[9] || (i[9] = (o) => s(d)("cancel"))
          }, "停止", 8, _a)
        ])) : b("", !0),
        p.value === "profile" ? (a(), Z(ea, {
          key: 1,
          state: s(l),
          disabled: !s(r),
          onAction: s(d),
          onDone: i[10] || (i[10] = (o) => H("teacher"))
        }, null, 8, [
          "state",
          "disabled",
          "onAction"
        ])) : b("", !0),
        p.value === "materials" ? (a(), n("section", en, [
          i[33] || (i[33] = t("h1", null, "课件与笔记", -1)),
          s(l).unit ? b("", !0) : (a(), n("p", tn, u(s(l).blockedUnit ? "当前课件在另一个故事中" : "还没有课件"), 1)),
          s(l).unit ? (a(), n(M, { key: 1 }, [
            t("p", an, u(s(l).unit.title), 1),
            (a(!0), n(M, null, T(s(l).unit.materials, (o) => (a(), n("button", {
              key: o.id,
              type: "button",
              class: "learning-activity-link",
              onClick: (W) => x({
                unitId: s(l).unit.id,
                kind: "material",
                id: o.id,
                title: o.title
              })
            }, [
              V(U, { name: "book" }),
              t("span", null, u(o.title), 1),
              V(U, { name: "arrow" })
            ], 8, nn))), 128)),
            (a(!0), n(M, null, T(s(l).unit.exercises, (o) => (a(), n("button", {
              key: o.id,
              type: "button",
              class: "learning-activity-link",
              onClick: (W) => x({
                unitId: s(l).unit.id,
                kind: "exercise",
                id: o.id,
                title: o.prompt
              })
            }, [
              V(U, { name: "records" }),
              t("span", null, u(o.prompt), 1),
              V(U, { name: "arrow" })
            ], 8, ln))), 128)),
            s(l).unit.notes.length ? (a(), n("section", sn, [(a(!0), n(M, null, T(s(l).unit.notes, (o) => (a(), n("article", { key: o.id }, [
              o.selection ? (a(), n("blockquote", rn, u(o.selection.quote), 1)) : b("", !0),
              t("p", null, u(o.text), 1),
              t("button", {
                type: "button",
                disabled: !s(r),
                onClick: (W) => s(d)("delete-note", { id: o.id })
              }, "删除笔记", 8, on)
            ]))), 128))])) : b("", !0)
          ], 64)) : b("", !0)
        ])) : b("", !0),
        p.value === "goals" ? (a(), n("section", un, [
          i[35] || (i[35] = t("h1", null, "学习目标", -1)),
          s(l).profile ? (a(), n(M, { key: 0 }, [
            t("p", null, u(s(l).profile.goal.description), 1),
            s(l).profile.goal.exam ? (a(), n("p", dn, u(s(l).profile.goal.exam), 1)) : b("", !0),
            s(l).profile.goal.targetLevel ? (a(), n("p", vn, u(s(l).profile.goal.targetLevel), 1)) : b("", !0),
            s(l).profile.goal.targetDate ? (a(), n("p", cn, u(s(l).profile.goal.targetDate), 1)) : b("", !0),
            i[34] || (i[34] = t("h2", null, "自评水平", -1)),
            t("p", null, u(s(l).profile.selfAssessment), 1)
          ], 64)) : (a(), n("p", bn, "还没有记录目标")),
          t("button", {
            type: "button",
            class: "learning-primary",
            onClick: i[11] || (i[11] = (o) => {
              H("teacher"), k.value?.focus();
            })
          }, "和老师聊聊")
        ])) : b("", !0),
        p.value === "records" ? (a(), Z(ya, {
          key: 4,
          state: s(l),
          disabled: !s(r),
          onAction: s(d),
          onRemove: J
        }, null, 8, [
          "state",
          "disabled",
          "onAction"
        ])) : b("", !0),
        p.value === "harvest" ? (a(), n("section", gn, [
          i[37] || (i[37] = t("div", { class: "learning-page-heading" }, [t("h1", null, "我的收获")], -1)),
          s(l).completions.length ? b("", !0) : (a(), n("p", mn, "还没有完成的课程")),
          (a(!0), n(M, null, T(h.value, (o) => (a(), n("article", {
            key: o.unitId,
            class: "learning-harvest-entry"
          }, [
            t("small", null, u(new Date(o.completedAt).toLocaleDateString()), 1),
            t("h2", null, [q("+" + u(o.amount), 1), i[36] || (i[36] = t("span", null, "小白币", -1))]),
            t("p", null, u(o.summary), 1),
            t("p", yn, u(o.paid ? "已到账" : o.originHere ? "学习已完成，等待到账" : "请回到开课的原聊天领取"), 1),
            !o.paid && o.originHere ? (a(), n("button", {
              key: 0,
              type: "button",
              disabled: !s(r),
              onClick: (W) => s(d)("reward", {
                unitId: o.unitId,
                openWallet: !s(l).walletOpen
              })
            }, u(s(l).walletOpen ? "核实并补领" : "开通钱包并领取"), 9, kn)) : b("", !0)
          ]))), 128)),
          s(l).chatStorage === "unconfirmed" || s(l).chatStorage === "conflict" || s(l).chatStorage === "failed" ? (a(), n("button", {
            key: 1,
            type: "button",
            disabled: s(m) || s(l).busy,
            onClick: i[12] || (i[12] = (o) => s(d)("verify-wallet"))
          }, "核实账本保存", 8, fn)) : b("", !0),
          s(l).chatStorage === "conflict" ? (a(), n("button", {
            key: 2,
            type: "button",
            disabled: s(m) || s(l).busy,
            onClick: i[13] || (i[13] = (o) => J("adopt-wallet", {}, "采用服务器上的聊天账本？本次未确认的候选将被放下，之后可凭已保存的学习完成记录核实并补领。"))
          }, "采用服务器账本", 8, pn)) : b("", !0),
          s(l).completions.length > 20 ? (a(), n("div", $n, [t("button", {
            type: "button",
            disabled: w.value === 0,
            onClick: i[14] || (i[14] = (o) => w.value--)
          }, "上一页", 8, hn), t("button", {
            type: "button",
            disabled: (w.value + 1) * 20 >= s(l).completions.length,
            onClick: i[15] || (i[15] = (o) => w.value++)
          }, "下一页", 8, Cn)])) : b("", !0)
        ])) : b("", !0),
        p.value === "settings" ? (a(), n("section", xn, [
          i[46] || (i[46] = t("h1", null, "学习设置", -1)),
          t("label", null, [i[38] || (i[38] = q("当前语言", -1)), t("select", {
            value: s(l).language,
            disabled: !s(r),
            onChange: i[16] || (i[16] = (o) => s(d)("language", { language: o.target.value }))
          }, [(a(!0), n(M, null, T([.../* @__PURE__ */ new Set([s(l).language, ...s(l).languages])], (o) => (a(), n("option", {
            key: o,
            value: o
          }, u(new Intl.DisplayNames(["zh-CN"], { type: "language" }).of(o)), 9, In))), 128))], 40, wn)]),
          t("button", {
            type: "button",
            onClick: i[17] || (i[17] = (o) => H("profile"))
          }, "更换语言和老师 →"),
          t("section", null, [
            i[43] || (i[43] = t("h2", null, "老师的声音", -1)),
            s(l).voices.enabled ? (a(), n("form", {
              key: 1,
              onSubmit: i[21] || (i[21] = F((o) => s(d)("voice", { voice: {
                voiceId: D.value,
                language: E.value,
                speed: Number(A.value)
              } }), ["prevent"]))
            }, [
              t("label", null, [i[39] || (i[39] = q("音色", -1)), K(t("select", { "onUpdate:modelValue": i[18] || (i[18] = (o) => D.value = o) }, [(a(!0), n(M, null, T(s(l).voices.voices, (o) => (a(), n("option", {
                key: o.id,
                value: o.id,
                disabled: !o.available
              }, u(o.name) + u(o.available ? "" : "（暂不可用）"), 9, Sn))), 128))], 512), [[ee, D.value]])]),
              t("label", null, [i[40] || (i[40] = q("发音语言", -1)), K(t("input", {
                "onUpdate:modelValue": i[19] || (i[19] = (o) => E.value = o),
                type: "text",
                maxlength: "80",
                placeholder: "en / ja"
              }, null, 512), [[X, E.value]])]),
              t("label", null, [i[42] || (i[42] = q("合成语速", -1)), K(t("select", { "onUpdate:modelValue": i[20] || (i[20] = (o) => A.value = o) }, [...i[41] || (i[41] = [
                t("option", { value: 0.75 }, "0.75×", -1),
                t("option", { value: 1 }, "1×", -1),
                t("option", { value: 1.25 }, "1.25×", -1)
              ])], 512), [[ee, A.value]])]),
              t("button", {
                type: "submit",
                disabled: !s(r) || !s(l).profile
              }, "保存声音偏好", 8, Mn)
            ], 32)) : (a(), n("p", An, "使用语音前，请先开启 TTS 模块。文字学习不受影响。")),
            t("button", {
              type: "button",
              onClick: i[22] || (i[22] = (o) => s(d)("tts-settings"))
            }, u(s(l).voices.enabled ? "打开 TTS 设置" : "如何开启 TTS"), 1),
            i[44] || (i[44] = t("small", null, "已听过的题保留原声音，新偏好用于之后的题目。", -1))
          ]),
          t("section", null, [
            i[45] || (i[45] = t("h2", null, "学习数据", -1)),
            t("button", {
              type: "button",
              disabled: s(m) || s(l).busy,
              onClick: i[23] || (i[23] = (o) => J("forget-conversation", {}, "清空和当前老师的临时对话？目标、课件、学习记录和奖励都会保留。"))
            }, "清空师生对话", 8, Ln),
            t("button", {
              type: "button",
              disabled: !s(r),
              onClick: ce
            }, "导出学习数据", 8, Tn),
            t("button", {
              type: "button",
              disabled: s(m) || s(l).busy,
              onClick: i[24] || (i[24] = (o) => s(d)("read"))
            }, "重新读取保存内容", 8, Vn),
            s(l).unit || s(l).blockedUnit ? (a(), n("button", {
              key: 0,
              type: "button",
              disabled: !s(r),
              onClick: i[25] || (i[25] = (o) => J("abandon", {}, "放下当前这一课？本课课件、原答和笔记会移除；已被学习项保留的证据和完成奖励资格仍保留。"))
            }, "放下当前课件", 8, Rn)) : b("", !0),
            t("button", {
              type: "button",
              class: "learning-danger",
              disabled: !s(r) || !s(l).profile,
              onClick: i[26] || (i[26] = (o) => J("delete-language", {}, "删除当前语言的全部学习数据？未领取奖励也将放弃，已到账流水保留。"))
            }, "删除当前语言", 8, Un),
            t("button", {
              type: "button",
              class: "learning-danger",
              disabled: !s(r),
              onClick: i[27] || (i[27] = (o) => J("clear", {}, "清空所有语言的目标、课程和记录？未领取奖励也将放弃。已到账流水不撤销。"))
            }, "清空全部学习数据", 8, qn)
          ])
        ])) : b("", !0)
      ], 512), [[ne, p.value !== "teacher"]]),
      y.value ? b("", !0) : (a(), Z(ve, {
        key: 1,
        state: s(l),
        onAction: s(d)
      }, null, 8, ["state", "onAction"])),
      s(l).unit ? (a(), Z(Bt, {
        key: `${s(l).chatIdentity}:${s(l).language}:${s(l).unit.id}`,
        state: s(l),
        target: y.value,
        disabled: !s(r),
        onAction: s(d),
        onClose: I,
        onAsk: N
      }, null, 8, [
        "state",
        "target",
        "disabled",
        "onAction"
      ])) : b("", !0),
      R.value ? (a(), n("div", {
        key: 3,
        ref_key: "confirmLayer",
        ref: P,
        class: "learning-confirm-shade",
        onKeydown: i[30] || (i[30] = Q(F((o) => R.value = null, ["stop", "prevent"]), ["esc"]))
      }, [t("section", Bn, [
        i[47] || (i[47] = t("h2", { id: "learning-confirm-title" }, "确认这次操作", -1)),
        t("p", null, u(R.value.text), 1),
        t("div", Dn, [t("button", {
          autofocus: "",
          type: "button",
          onClick: i[28] || (i[28] = (o) => R.value = null)
        }, "先不改"), t("button", {
          type: "button",
          class: "learning-primary",
          disabled: s(m) || s(l).busy,
          onClick: i[29] || (i[29] = (o) => {
            s(d)(R.value.action, R.value.input), R.value = null;
          })
        }, "确认", 8, Nn)])
      ])], 544)) : b("", !0)
    ]));
  }
}), Fn = Hn;
export {
  Fn as default
};
