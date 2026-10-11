/* eslint-disable */
import { $ as le, A as Mt, C as pa, D as ee, E as W, G as ba, H as ma, J as fa, M as de, P as Ne, Q as Wt, R as Te, S as i, T as H, U as D, V as a, W as ka, X as z, Y as ya, at as ha, b as Z, c as $a, d as pe, dt as Gt, f as wa, ft as r, h as R, i as pt, k as xa, lt as l, m as ve, nt as Ie, ot as Ca, p as Me, r as Xe, rt as G, st as ye, u as et, ut as oe, v as S, x as g, y as n } from "./xiaobai-os-app-navigation-DvMnPkC0.js";
import { n as Ia, t as La } from "./xiaobai-os-frame-bridge-BfVuKvnh.js";
import { t as bt } from "./xiaobai-os-MessageMarkdown-_hWt2Lpl.js";
var ut = /* @__PURE__ */ new WeakMap(), Et = [
  "select",
  "input",
  "keyup",
  "pointerup",
  "scroll"
], at = {
  mounted(e, v) {
    const s = v.value, t = s.cursor, o = () => {
      s.cursor = {
        start: e.selectionStart,
        end: e.selectionEnd,
        direction: e.selectionDirection,
        top: e.scrollTop,
        left: e.scrollLeft
      };
    };
    ut.set(e, o);
    for (const d of Et) e.addEventListener(d, o, { passive: !0 });
    de(() => {
      !e.isConnected || !t || (e.setSelectionRange(t.start, t.end, t.direction), e.scrollTop = t.top, e.scrollLeft = t.left);
    });
  },
  beforeUnmount(e) {
    const v = ut.get(e);
    if (v) {
      v();
      for (const s of Et) e.removeEventListener(s, v);
      ut.delete(e);
    }
  }
}, Sa = ["disabled"], Aa = {
  key: 0,
  class: "learning-choices"
}, Ra = [
  "type",
  "checked",
  "onChange"
], Ma = { class: "learning-option-letter" }, Ea = {
  key: 1,
  class: "learning-order"
}, Na = [
  "disabled",
  "aria-label",
  "onClick"
], Ta = [
  "disabled",
  "aria-label",
  "onClick"
], Oa = {
  key: 2,
  class: "learning-fields"
}, Ba = ["onUpdate:modelValue"], qa = ["value"], Pa = {
  key: 3,
  class: "learning-choices"
}, _a = ["checked", "onChange"], Va = {
  key: 0,
  class: "learning-muted"
}, Ua = {
  key: 4,
  class: "learning-fields"
}, Da = ["onUpdate:modelValue"], ja = {
  key: 5,
  class: "learning-writing"
}, Wa = ["disabled"], Ga = /* @__PURE__ */ ee({
  __name: "AnswerInput",
  props: /* @__PURE__ */ Mt({
    response: {},
    paragraphs: {},
    disabled: { type: Boolean }
  }, {
    modelValue: { required: !0 },
    modelModifiers: {}
  }),
  emits: /* @__PURE__ */ Mt(["submit"], ["update:modelValue"]),
  setup(e, { emit: v }) {
    const s = e, t = v, o = fa(e, "modelValue");
    function d(k) {
      s.response.kind === "choice" && !s.response.multiple ? o.value.picked = [k] : o.value.picked = o.value.picked.includes(k) ? o.value.picked.filter((w) => w !== k) : [...o.value.picked, k];
    }
    function c(k, w) {
      const f = [...o.value.order];
      [f[k], f[k + w]] = [f[k + w], f[k]], o.value.order = f;
    }
    const b = S(() => {
      const k = s.response;
      return k.kind === "text" ? !!o.value.text.trim() : k.kind === "gaps" ? k.slots.every((w) => o.value.values[w.id]?.trim()) : k.kind === "match" ? k.left.every((w) => o.value.values[w.id]) : k.kind === "order" ? !0 : o.value.picked.length > 0;
    });
    function I() {
      const k = s.response;
      !b.value || s.disabled || (k.kind === "text" ? t("submit", {
        kind: "text",
        text: o.value.text
      }) : k.kind === "gaps" ? t("submit", {
        kind: "gaps",
        values: k.slots.map((w) => ({
          id: w.id,
          text: o.value.values[w.id]
        }))
      }) : k.kind === "match" ? t("submit", {
        kind: "match",
        pairs: k.left.map((w) => ({
          left: w.id,
          right: o.value.values[w.id]
        }))
      }) : t("submit", {
        kind: k.kind,
        ids: [...k.kind === "order" ? o.value.order : o.value.picked]
      }));
    }
    return (k, w) => (a(), i("form", {
      class: "learning-answer",
      onSubmit: ve(I, ["prevent"])
    }, [n("fieldset", { disabled: e.disabled }, [
      w[3] || (w[3] = n("legend", { class: "learning-sr-only" }, "你的回答", -1)),
      e.response.kind === "choice" ? (a(), i("div", Aa, [(a(!0), i(R, null, D(e.response.options, (f, L) => (a(), i("label", {
        key: f.id,
        class: oe({ selected: o.value.picked.includes(f.id) })
      }, [
        n("input", {
          type: e.response.multiple ? "checkbox" : "radio",
          name: "answer-choice",
          checked: o.value.picked.includes(f.id),
          onChange: (y) => d(f.id)
        }, null, 40, Ra),
        n("span", Ma, r(String.fromCharCode(65 + L)), 1),
        n("span", null, r(f.text), 1)
      ], 2))), 128))])) : e.response.kind === "order" ? (a(), i("ol", Ea, [(a(!0), i(R, null, D(o.value.order, (f, L) => (a(), i("li", { key: f }, [
        n("span", null, r(e.response.options.find((y) => y.id === f)?.text), 1),
        n("button", {
          type: "button",
          disabled: L === 0,
          "aria-label": `上移第 ${L + 1} 项`,
          onClick: (y) => c(L, -1)
        }, "↑", 8, Na),
        n("button", {
          type: "button",
          disabled: L === o.value.order.length - 1,
          "aria-label": `下移第 ${L + 1} 项`,
          onClick: (y) => c(L, 1)
        }, "↓", 8, Ta)
      ]))), 128))])) : e.response.kind === "match" ? (a(), i("div", Oa, [(a(!0), i(R, null, D(e.response.left, (f) => (a(), i("label", { key: f.id }, [H(r(f.text) + " ", 1), le(n("select", { "onUpdate:modelValue": (L) => o.value.values[f.id] = L }, [w[1] || (w[1] = n("option", { value: "" }, "选择对应项", -1)), (a(!0), i(R, null, D(e.response.right, (L) => (a(), i("option", {
        key: L.id,
        value: L.id
      }, r(L.text), 9, qa))), 128))], 8, Ba), [[et, o.value.values[f.id]]])]))), 128))])) : e.response.kind === "evidence" ? (a(), i("div", Pa, [(a(!0), i(R, null, D(e.paragraphs, (f) => (a(), i("label", {
        key: f.id,
        class: oe({ selected: o.value.picked.includes(f.id) })
      }, [n("input", {
        type: "checkbox",
        checked: o.value.picked.includes(f.id),
        onChange: (L) => d(f.id)
      }, null, 40, _a), n("span", null, r(f.text), 1)], 2))), 128)), e.paragraphs.length ? g("", !0) : (a(), i("p", Va, "请先展开相关文稿，再选择原文依据。"))])) : e.response.kind === "gaps" ? (a(), i("div", Ua, [(a(!0), i(R, null, D(e.response.slots, (f) => (a(), i("label", { key: f.id }, [H(r(f.text), 1), le(n("input", {
        "onUpdate:modelValue": (L) => o.value.values[f.id] = L,
        type: "text",
        maxlength: "4000",
        autocomplete: "off"
      }, null, 8, Da), [[pe, o.value.values[f.id]]])]))), 128))])) : (a(), i("label", ja, [w[2] || (w[2] = n("span", { class: "learning-sr-only" }, "你的回答", -1)), le(n("textarea", {
        "onUpdate:modelValue": w[0] || (w[0] = (f) => o.value.text = f),
        rows: "6",
        maxlength: "4000",
        placeholder: "写下你的回答…"
      }, null, 512), [[pe, o.value.text], [l(at), o.value]])])),
      n("button", {
        class: "learning-primary",
        type: "submit",
        disabled: !b.value
      }, "交给语伴 →", 8, Wa)
    ], 8, Sa)], 32));
  }
}), mt = Ga, Ft = 2e3, Fa = ["stroke-width"], Ha = ["d"], Ya = /* @__PURE__ */ ee({
  __name: "LearningIcon",
  props: { name: {} },
  setup(e) {
    const v = {
      home: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
      book: "M12 5v16M3 4c4-1 6 0 9 1 3-1 5-2 9-1v15c-4-1-6 0-9 2-3-2-5-3-9-2Z",
      workbook: "M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM8 3v18M11 8h5M11 12h5",
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
    return (s, t) => (a(), i("svg", {
      class: "learning-icon",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": e.name === "more" ? 3.5 : 1.7,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true"
    }, [n("path", { d: v[e.name] }, null, 8, Ha)], 8, Fa));
  }
}), J = Ya, Ue = Object.freeze({
  select: "引用这段",
  ask: "问语伴",
  listen: "朗读",
  dismiss: "取消引用"
});
function za(e, v, s) {
  if (!s?.rangeCount || s.isCollapsed) return null;
  const t = s.getRangeAt(0), o = t.startContainer, d = (o instanceof Element ? o : o.parentElement)?.closest("[data-learning-text]");
  if (!d || !e.contains(d) || !d.contains(t.endContainer)) return null;
  const c = v.find((f) => f.id === d.dataset.materialId), b = c?.paragraphs.find((f) => f.id === d.dataset.paragraphId);
  if (!c || !b) return null;
  const I = t.cloneRange();
  I.selectNodeContents(d), I.setEnd(t.startContainer, t.startOffset);
  const k = I.toString().length, w = t.toString();
  return !w.trim() || [...w].length > 2e3 || b.text.slice(k, k + w.length) !== w ? null : {
    materialId: c.id,
    paragraphId: b.id,
    start: k,
    end: k + w.length,
    quote: w
  };
}
function Ht(e, v, s) {
  const t = () => {
    if (!e.value) return;
    const o = za(e.value, v(), window.getSelection());
    o && s(o);
  };
  Te(() => document.addEventListener("selectionchange", t)), Ne(() => document.removeEventListener("selectionchange", t));
}
var Ka = { class: "learning-source" }, Ja = { key: 0 }, Za = ["href"], Qa = {
  key: 0,
  class: "learning-listening-cover"
}, Xa = ["disabled"], en = {
  key: 1,
  class: "learning-material-body"
}, tn = ["data-material-id", "data-paragraph-id"], an = ["disabled", "onClick"], nn = {
  class: "learning-audio-parts",
  "aria-label": "材料朗读分段"
}, ln = ["disabled", "onClick"], sn = { key: 2 }, rn = /* @__PURE__ */ ee({
  __name: "MaterialReader",
  props: {
    material: {},
    disabled: { type: Boolean },
    exerciseId: {}
  },
  emits: ["action", "select"],
  setup(e, { emit: v }) {
    const s = e, t = v, o = G(null);
    Ht(o, () => [s.material], (c) => t("select", c));
    function d(c) {
      t("select", {
        materialId: s.material.id,
        paragraphId: c.id,
        start: 0,
        end: c.text.length,
        quote: c.text
      });
    }
    return (c, b) => (a(), i("article", {
      ref_key: "root",
      ref: o,
      class: "learning-material"
    }, [
      n("h2", null, r(e.material.title), 1),
      n("div", Ka, [e.material.provenance.kind === "authored" ? (a(), i("span", Ja, "语伴自编练习")) : (a(), i("a", {
        key: 1,
        href: e.material.provenance.url,
        target: "_blank",
        rel: "noopener noreferrer"
      }, r(e.material.provenance.kind === "original" ? "原文节选" : "改编自") + " · " + r(e.material.provenance.title) + " ↗", 9, Za))]),
      e.material.hidden ? (a(), i("div", Qa, [b[1] || (b[1] = n("svg", {
        viewBox: "0 0 140 60",
        "aria-hidden": "true"
      }, [n("path", {
        d: "M8 27v6m10-14v22m10-31v40m10-26v12m10-35v58m10-47v36m10-27v18m10-37v56m10-36v16m10-29v42m10-31v20m10-16v12m10-8v4",
        stroke: "currentColor",
        "stroke-width": "3",
        "stroke-linecap": "round",
        fill: "none"
      })], -1)), n("button", {
        type: "button",
        disabled: e.disabled,
        onClick: b[0] || (b[0] = (I) => t("action", "reveal", {
          kind: "transcripts",
          id: e.material.id
        }))
      }, "看文稿", 8, Xa)])) : (a(), i("div", en, [(a(!0), i(R, null, D(e.material.paragraphs, (I) => (a(), i("div", {
        key: I.id,
        class: "learning-paragraph"
      }, [n("p", {
        tabindex: "0",
        "data-learning-text": "",
        "data-material-id": e.material.id,
        "data-paragraph-id": I.id
      }, r(I.text), 9, tn), n("button", {
        type: "button",
        disabled: [...I.text].length > l(Ft),
        onClick: (k) => d(I)
      }, r(l(Ue).select), 9, an)]))), 128))])),
      n("div", nn, [(a(!0), i(R, null, D(e.material.parts, (I) => (a(), i("button", {
        key: I.key,
        type: "button",
        disabled: e.disabled,
        onClick: (k) => t("action", "play", {
          materialId: e.material.id,
          partKey: I.key,
          exerciseId: e.exerciseId
        })
      }, [W(J, { name: "play" }), H(r(e.material.parts.length > 1 ? `听第 ${I.number} 段` : "播放朗读"), 1)], 8, ln))), 128))]),
      e.material.parts.length ? (a(), i("small", sn, "TTS 合成朗读")) : g("", !0)
    ], 512));
  }
}), Nt = rn;
function ft(e, v, s = []) {
  const t = (o) => v.kind === "choice" || v.kind === "order" ? v.options.find((d) => d.id === o)?.text ?? o : s.find((d) => d.id === o)?.text ?? o;
  return e.kind === "text" ? e.text : e.kind === "gaps" ? e.values.map((o) => `${v.kind === "gaps" ? v.slots.find((d) => d.id === o.id)?.text ?? "" : ""} ${o.text}`).join(`
`) : e.kind === "match" ? e.pairs.map((o) => v.kind === "match" ? `${v.left.find((d) => d.id === o.left)?.text} → ${v.right.find((d) => d.id === o.right)?.text}` : "").join(`
`) : e.ids.map(t).join(e.kind === "order" ? " → " : `
`);
}
var Fd = Object.freeze({
  materialText: 6e3,
  prompt: 1200,
  explanation: 2e3,
  answer: 4e3,
  name: 80,
  goal: 800,
  itemChanges: 5,
  evidence: 3,
  options: 6,
  pairs: 8,
  gaps: 6,
  readDefault: 20,
  readMax: 50,
  dataMessage: 24e3,
  paragraphChunk: 2e3,
  acceptedForms: 12,
  annotations: 40,
  terms: 12,
  quote: 600,
  reviewItems: 20
}), Yt = {
  unavailable: "Select work available in this story",
  feedbackRequired: "Select saved feedback to review",
  revised: "这篇已有修改稿，结果以修改稿的批改为准；请对修改稿的反馈申请复核。",
  hiddenRevisions: "这次作答关联其他故事中的修改稿，不能在这里一并删除。"
}, on = { class: "learning-feedback" }, un = { class: "learning-muted" }, dn = { key: 0 }, vn = { key: 1 }, cn = { key: 0 }, gn = { key: 1 }, pn = { key: 2 }, bn = {
  key: 3,
  class: "learning-muted"
}, mn = ["disabled"], fn = ["disabled"], kn = /* @__PURE__ */ ee({
  __name: "AttemptFeedback",
  props: {
    attempt: {},
    feedback: {},
    response: {},
    paragraphs: {},
    disabled: { type: Boolean },
    reviewable: { type: Boolean }
  },
  emits: ["action"],
  setup(e) {
    const v = {
      correct: "答对了",
      partial: "已经掌握一部分",
      incorrect: "一起把这里弄懂",
      disputed: "这处还需复核"
    };
    return (s, t) => (a(), i("section", on, [
      t[6] || (t[6] = n("p", { class: "learning-eyebrow" }, "已保存的原答", -1)),
      n("blockquote", null, r(l(ft)(e.attempt.answer, e.response, e.paragraphs)), 1),
      n("small", un, [
        H(r(e.attempt.help.feedback ? "得到反馈后的再练" : e.attempt.help.answer || e.attempt.help.hint || e.attempt.help.transcript ? "这次有辅助" : "未使用答案或提示"), 1),
        e.attempt.help.replays ? (a(), i("span", dn, " · 重听 " + r(e.attempt.help.replays) + " 次", 1)) : g("", !0),
        e.attempt.help.slowPlayback ? (a(), i("span", vn, " · 慢放")) : g("", !0)
      ]),
      e.feedback ? (a(), i(R, { key: 0 }, [
        n("h3", null, r(v[e.feedback.verdict]), 1),
        e.feedback.understanding ? (a(), i("p", cn, [t[2] || (t[2] = n("b", null, "理解", -1)), H(r(e.feedback.understanding), 1)])) : g("", !0),
        e.feedback.expression ? (a(), i("p", gn, [t[3] || (t[3] = n("b", null, "表达", -1)), H(r(e.feedback.expression), 1)])) : g("", !0),
        e.feedback.guidance ? (a(), i("p", pn, [t[4] || (t[4] = n("b", null, "批注", -1)), H(r(e.feedback.guidance), 1)])) : g("", !0),
        e.reviewable ? (a(), i("button", {
          key: 4,
          type: "button",
          disabled: e.disabled,
          onClick: t[0] || (t[0] = (o) => s.$emit("action", "assess", {
            attemptId: e.attempt.id,
            review: !0,
            message: "请重新审视我的原答与题目。也请考虑其他有效表达，不只对照原来的答案键。"
          }))
        }, r(e.feedback.verdict === "disputed" ? "请语伴复核" : "有疑问，请复核"), 9, mn)) : (a(), i("small", bn, r(l(Yt).revised), 1))
      ], 64)) : (a(), i(R, { key: 1 }, [t[5] || (t[5] = n("p", null, "原答已保存，等待语伴评估。", -1)), n("button", {
        type: "button",
        disabled: e.disabled,
        onClick: t[1] || (t[1] = (o) => s.$emit("action", "assess", {
          attemptId: e.attempt.id,
          review: !1,
          message: "请评估这条已经保存的原答。"
        }))
      }, "重试评估", 8, fn)], 64))
    ]));
  }
}), kt = kn, zt = {
  busy: "上一件事还没做完，等它完成后再试一次吧。这次没有开始。",
  notSent: "这次没有发出去，输入的内容还在。请再试一次。",
  rejected: "这次操作未能完成，请查看最新状态后再继续。",
  unknown: "还没收到确认，操作可能仍在继续。请先查看最新状态，不要重复发送。",
  refresh: "查看最新状态"
}, Re = {
  unconfirmed: "搭子的对话与设置尚未确认保存，已收到的回复保留。",
  conflict: "搭子的对话与设置有另一份已保存的版本，请先核对。",
  failed: "暂时没能打开搭子的对话与设置，请检查保存。",
  verify: "检查搭子记录",
  adopt: "使用已保存记录",
  adoptWarning: "放弃尚未确认的对话或设置，使用已保存的搭子记录？文章与作文会保留。"
}, ne = {
  title: "学习动态",
  unknownTool: "准备下一步",
  stop: "停止本次操作",
  round: (e) => `第 ${e} 轮`,
  history: (e) => `${e} 个步骤`,
  received: (e) => `已收到 ${e} 字，正在整理`,
  preparing: "准备中",
  running: "进行中",
  done: "完成",
  failed: "未完成",
  cancelled: "已停止",
  "not-run": "未执行",
  thinking: "正在思考…",
  results: (e) => `找到 ${e} 个候选网页`,
  extracted: (e) => `取回 ${e} 个网页的文字，待选材`,
  paragraphs: (e) => `读到 ${e} 段文字`,
  entries: (e) => `读到 ${e} 条记录`,
  sourcesFailed: (e) => `${e} 个网页未能用于本次取材`,
  proposedMaterials: (e) => `${e} 篇材料`,
  proposedExercises: (e) => `${e} 道练习`,
  outcomes: {
    finished: "本次已完成",
    failed: "本次未完成",
    cancelled: "本次已停止",
    unconfirmed: "等待确认保存",
    conflict: "需要核对保存结果"
  },
  tools: {
    LearningRead: "查看学习记录",
    LearningContextRead: "查看相关资料",
    LearningSearch: "寻找文章",
    LearningExtract: "读取网页",
    LearningProfileEdit: "调整学习目标",
    LearningLessonEdit: "准备练习",
    LearningRequest: "安排练习",
    LearningModelEssay: "准备范文",
    LearningArticle: "整理阅读正文",
    LearningReadingNotes: "整理本段知识",
    LearningEssayTask: "准备写作题",
    LearningAssess: "批改作答",
    LearningPresent: "打开练习",
    LearningReveal: "展示学习帮助",
    LearningSubmit: "保存原答",
    LearningComplete: "整理学习收获"
  },
  sections: {
    overview: "学习概况",
    training: "本次阅读材料",
    unit: "本次练习",
    materials: "阅读材料",
    exercises: "练习题",
    attempts: "你的作答",
    notes: "笔记",
    listening: "听力记录",
    items: "知识点",
    review: "到期复习",
    evidence: "学习记录",
    completions: "已完成练习",
    sources: "文章来源"
  }
}, Kt = {
  unassessed: "还没练过",
  review: "待确认",
  independent: "已能独立使用",
  practised: "练过一次",
  strengthen: "再练练"
}, Jt = (e) => `${e} 次作答`, Zt = (e) => `${e} 个知识点可以温习了`, ct = {
  settings: "声音设置",
  enable: "开启语音"
}, ae = {
  navigation: "本篇学习",
  reading: "阅读与写作",
  feedback: "批改与修改",
  model: "范文",
  completed: "本篇完成",
  grading: "正在看你的作品…",
  reviewing: "正在复核修改稿…",
  modelling: "正在写范文…",
  grade: "批改已提交的作答",
  continue: "继续",
  stop: "停止",
  viewModel: "查看范文",
  review: "开始复习",
  resumeReview: "继续复习",
  original: "原稿与批注",
  revision: "修改稿",
  resolved: "这处已改对",
  setupTitle: "这次想学到哪里",
  setupSteps: 3,
  setupContinue: "继续",
  setupFinish: "确认目标",
  optionalSettings: "讲解语言与兴趣",
  saveSettings: "保存设置"
}, Tt = {
  title: "还有内容没提交",
  accept: "放弃并切换"
}, dt = {
  "share-course": {
    title: "允许这份课件跨故事使用？",
    accept: "允许跨故事使用"
  },
  language: Tt,
  teacher: Tt,
  "replace-lesson": {
    title: "换一篇练习？",
    accept: "换一篇"
  },
  abandon: {
    title: "放下这次练习？",
    accept: "放下练习"
  },
  "abandon-review": {
    title: "放下这组复习？",
    accept: "放下复习"
  },
  "skip-revision": {
    title: "跳过修改？",
    accept: "查看范文"
  },
  "adopt-server": {
    title: "使用已保存的学习记录？",
    accept: "使用已保存记录"
  },
  "adopt-wallet": {
    title: "使用已保存的钱包？",
    accept: "使用已保存钱包"
  },
  "adopt-workbench": {
    title: "使用已保存的教学对话？",
    accept: "使用已保存记录"
  },
  "adopt-teacher": {
    title: "使用已保存的搭子记录？",
    accept: "使用已保存记录"
  },
  "forget-conversation": {
    title: "清空这段对话？",
    accept: "清空对话"
  },
  "delete-language": {
    title: "删除这门语言的学习数据？",
    accept: "删除学习数据"
  },
  clear: {
    title: "清空所有学习数据？",
    accept: "清空学习数据"
  },
  "reset-learning": {
    title: "重置学习数据？",
    accept: "重置学习数据"
  },
  "delete-item": {
    title: "删除这条学习记录？",
    accept: "删除记录"
  },
  "delete-attempt": {
    title: "删除这次作答？",
    accept: "删除作答"
  }
}, ke = {
  resetLearning: "将清空所有语言的目标、课程和学习记录，未领取奖励也将放弃。学习对话和已到账奖励保留。此操作无法撤销。",
  context: "切换后，尚未提交的输入会丢失。已提交的作答和学习记录会保留。",
  companion: "切换语伴会清空尚未发送的聊天内容，当前练习和作答会保留。",
  keepEditing: "继续编辑",
  lesson: "本次练习的材料、作答和笔记会删除；已收入学习本的记录和已获得的奖励会保留。",
  review: "这组已答的题会删除，复习时间安排不变。"
}, vt = {
  private: "仅当前故事",
  action: "跨故事使用",
  confirm: "这份课件、参考答案、讲解和笔记将可用于你的其他故事，里面可能有当前剧情。语伴私聊和原有作答不公开。"
}, $e = {
  answer: "你的作答",
  saved: "已保存，答完这组再一起看看。",
  ready: "这组答完了",
  grade: "批改这组",
  ask: "问语伴",
  retry: "再试一次",
  cancelRetry: "取消重答",
  verdicts: {
    correct: "答对了",
    partial: "对了一部分",
    incorrect: "还没想起来",
    disputed: "等待复核"
  }
}, te = {
  send: "发送",
  stop: "停止回复",
  retry: "重试回复",
  assistant: "学习助手",
  assistantEmpty: "想调整学习安排，还是问问这次的批改？",
  assistantPlaceholder: "问学习助手…",
  closeAssistant: "回到读写",
  askAssessment: "问问这次批改",
  clearAssistant: "清空教学对话",
  clearCompanion: "清空搭子对话",
  clearAssistantConfirm: "清空当前语言的教学对话？文章、作文和学习记录都会保留。",
  clearCompanionConfirm: "清空和当前搭子的对话？文章、作文和学习记录都会保留。",
  assistantStorage: "学习助手的记录暂不可用，请检查保存。已收到的回复保留。",
  verify: "检查保存",
  adopt: "使用已保存记录",
  adoptConfirm: "放弃本次尚未保存的对话，使用服务器上的记录？",
  skipCompanion: "先自己学",
  listen: "听这段回复",
  saveNote: "保存笔记"
}, Ke = {
  title: "替换当前练习？",
  detail: "新内容保存成功后，替换这份课件、作答和笔记。学习本中的记录和已获得的奖励保留。",
  decline: "保留当前练习",
  accept: "替换并继续"
}, yn = {
  key: 0,
  class: "learning-player",
  "aria-label": "课堂朗读"
}, hn = {
  key: 0,
  role: "status"
}, $n = {
  key: 2,
  class: "learning-row"
}, wn = ["aria-label", "disabled"], xn = ["max", "value"], Cn = /* @__PURE__ */ ee({
  __name: "LearningPlayer",
  props: { state: {} },
  emits: ["action"],
  setup(e, { emit: v }) {
    const s = v;
    function t(o) {
      return `${Math.floor(o / 60)}:${String(Math.floor(o % 60)).padStart(2, "0")}`;
    }
    return (o, d) => e.state.media.status !== "idle" ? (a(), i("section", yn, [
      e.state.media.message ? (a(), i("p", hn, r(e.state.media.message), 1)) : g("", !0),
      e.state.voices.enabled ? g("", !0) : (a(), i("button", {
        key: 1,
        type: "button",
        onClick: d[0] || (d[0] = (c) => s("action", "tts-settings"))
      }, r(l(ct).enable), 1)),
      e.state.media.key ? (a(), i("div", $n, [
        W(J, { name: "sound" }),
        n("span", null, r(e.state.media.status === "loading" ? "正在生成声音…" : `${t(e.state.media.position)} / ${t(e.state.media.duration)}`), 1),
        e.state.media.status === "playing" ? (a(), i("button", {
          key: 0,
          type: "button",
          "aria-label": "暂停",
          onClick: d[1] || (d[1] = (c) => s("action", "pause"))
        }, [W(J, { name: "pause" })])) : [
          "paused",
          "ended",
          "blocked"
        ].includes(e.state.media.status) ? (a(), i("button", {
          key: 1,
          type: "button",
          "aria-label": e.state.media.status === "ended" ? "再听一遍" : "继续播放",
          disabled: e.state.busy,
          onClick: d[2] || (d[2] = (c) => s("action", "resume"))
        }, [W(J, { name: "play" })], 8, wn)) : g("", !0),
        n("button", {
          type: "button",
          "aria-label": "停止",
          onClick: d[3] || (d[3] = (c) => s("action", "stop"))
        }, [W(J, { name: "stop" })]),
        e.state.media.duration ? (a(), i("button", {
          key: 2,
          type: "button",
          onClick: d[4] || (d[4] = (c) => s("action", "rate", { value: e.state.media.rate === 1 ? 0.75 : 1 }))
        }, r(e.state.media.rate) + "×", 1)) : g("", !0)
      ])) : g("", !0),
      e.state.media.duration ? (a(), i("input", {
        key: 3,
        type: "range",
        min: "0",
        max: e.state.media.duration,
        step: "0.1",
        value: e.state.media.position,
        "aria-label": "当前声音片段播放位置",
        onChange: d[5] || (d[5] = (c) => s("action", "seek", { value: Number(c.target.value) }))
      }, null, 40, xn)) : g("", !0)
    ])) : g("", !0);
  }
}), Qt = Cn, In = { class: "learning-selection" }, Ln = { class: "learning-row" }, Sn = ["disabled"], An = /* @__PURE__ */ ee({
  __name: "LearningSelectionActions",
  props: {
    selection: {},
    disabled: { type: Boolean }
  },
  emits: [
    "ask",
    "say",
    "dismiss"
  ],
  setup(e) {
    return (v, s) => (a(), i("div", In, [n("blockquote", null, r(e.selection.quote), 1), n("div", Ln, [
      n("button", {
        type: "button",
        onClick: s[0] || (s[0] = (t) => v.$emit("ask"))
      }, r(l(Ue).ask), 1),
      n("button", {
        type: "button",
        disabled: e.disabled || [...e.selection.quote].length > 1e3,
        onClick: s[1] || (s[1] = (t) => v.$emit("say"))
      }, r(l(Ue).listen), 9, Sn),
      n("button", {
        type: "button",
        onClick: s[2] || (s[2] = (t) => v.$emit("dismiss"))
      }, r(l(Ue).dismiss), 1)
    ])]));
  }
}), Xt = An;
function Ee(e) {
  return {
    picked: [],
    text: "",
    values: {},
    order: e.kind === "order" ? e.options.map((v) => v.id) : []
  };
}
function Ot(e, v) {
  const s = Ee(v);
  return !!e.text.trim() || !!e.picked.length || Object.values(e.values).some((t) => !!t.trim()) || e.order.length !== s.order.length || e.order.some((t, o) => t !== s.order[o]);
}
function ea(e) {
  return e.stage.exercises.flatMap((v) => {
    const s = e.exercises.find((I) => I.id === v.exerciseId), t = e.attempts.find((I) => I.id === v.revisionAttemptId), o = t && e.assessments.some((I) => I.attemptId === t.id && I.verdict !== "disputed"), d = o ? t : e.attempts.find((I) => I.id === (t?.revisesAttemptId ?? v.draftAttemptId));
    if (!s || s.response.kind !== "text" || !d) return [];
    const c = e.assessments.find((I) => I.attemptId === d.id), b = o ? void 0 : t;
    return [{
      row: v,
      exercise: s,
      draft: d,
      assessment: c,
      revision: b,
      review: b && e.assessments.find((I) => I.attemptId === b.id),
      annotations: c?.annotations ?? []
    }];
  });
}
function ta(e) {
  const v = (s) => s.trim() || null;
  return {
    exam: v(e.exam),
    level: v(e.level),
    targetLevel: v(e.targetLevel),
    explanationLanguage: e.explanationLanguage,
    interests: v(e.interests)
  };
}
var Je = () => ({
  text: "",
  cursor: void 0,
  focus: null,
  study: null,
  sent: null,
  scroll: 0,
  following: !0
});
function Rn() {
  const e = Ie({}), v = Ie(Je()), s = Ie(Je()), t = Ie({
    open: !1,
    form: {
      exam: "",
      level: "",
      targetLevel: "",
      explanationLanguage: "zh-CN",
      interests: ""
    },
    submitted: null
  }), o = Ie({ enabled: !1 }), d = Ie({
    step: 0,
    name: "",
    note: ""
  }), c = Ie({
    tab: "grammar",
    reason: ""
  });
  return {
    units: e,
    chat: v,
    workbenchChat: s,
    settings: t,
    companion: o,
    setup: d,
    books: c,
    unit(b) {
      return e[b] ??= {
        reading: {
          view: null,
          scrolls: {}
        },
        writing: {},
        edits: {},
        expanded: {},
        selection: null,
        activities: {},
        activityDrafts: {},
        review: {
          index: null,
          drafts: {},
          openReason: "",
          expanded: !1,
          seenBefore: null
        }
      }, e[b];
    },
    reset(b = !1, I = !1) {
      if (!I) {
        for (const k of Object.keys(e)) delete e[k];
        t.open = !1, t.submitted = null, Object.assign(s, Je());
      }
      Object.assign(v, Je()), o.enabled = !1, b || Object.assign(d, {
        step: 0,
        name: "",
        note: ""
      }), Object.assign(c, {
        tab: "grammar",
        reason: ""
      });
    },
    reconcile(b) {
      const I = t.submitted;
      I && b.storage === "ready" && !b.busy && b.profile && Object.entries(I.value).every(([k, w]) => b.profile.settings[k] === w) && (Object.entries(I.form).every(([k, w]) => t.form[k] === w) && (t.open = !1), t.submitted = null);
      for (const k of Object.keys(e)) {
        const w = [b.unit, b.review].find((L) => L?.id === k);
        if (!w) {
          delete e[k];
          continue;
        }
        for (const [L, y] of Object.entries(e[k].review.drafts)) {
          const m = w.attempts.filter((u) => u.exerciseId === L).at(-1);
          y.submitted && m && m.id !== y.submitted.before && delete e[k].review.drafts[L];
        }
        for (const [L, y] of Object.entries(e[k].activityDrafts)) {
          const m = w.attempts.filter((u) => u.exerciseId === L).at(-1);
          if (y.submitted && m && m.id !== y.submitted.before) {
            delete e[k].activityDrafts[L];
            const u = e[k].activities[`exercise:${L}`];
            u && (u.retry = !1);
          }
        }
        const f = e[k].selection;
        f && w.materials.find((L) => L.id === f.materialId)?.paragraphs.find((L) => L.id === f.paragraphId)?.text.slice(f.start, f.end) !== f.quote && (e[k].selection = null);
        for (const [L, y] of Object.entries(e[k].writing)) {
          const m = w.attempts.filter(($) => $.exerciseId === L && !$.revisesAttemptId).at(-1), u = y.submitted;
          !u || !m || m.id === u.before || (y.text === u.text && m.answer.kind === "text" && m.answer.text === u.text.trim() ? (y.text = "", y.rewriting = !1) : y.rewriting = !0, y.submitted = null);
        }
      }
      for (const [k, w] of [[v, b.conversation], [s, b.workbenchConversation]]) {
        const f = k.sent;
        f && w.turns.some((L, y) => y + w.removedTurns >= f.after && L.purpose === "talk" && L.user === f.user) && (k.text === f.text && (k.text = "", k.focus = null), k.sent = null);
      }
    }
  };
}
var aa = /* @__PURE__ */ Symbol("learning-ui-session");
function na(e, v) {
  if (e.chat.text.trim() || e.workbenchChat.text.trim() || e.settings.open && Object.entries(ta(e.settings.form)).some(([s, t]) => v.profile?.settings[s] !== t) || e.setup.step === 1 && e.setup.name.trim() && (e.setup.name.trim() !== v.teacher?.name || e.setup.note.trim() !== v.teacher.note)) return !0;
  for (const s of [v.unit, v.review]) {
    const t = s && e.units[s.id];
    if (!(!s || !t)) {
      if (Object.values(t.writing).some((o) => !!o.text.trim()) || Object.keys(t.edits).length && ea(s).some((o) => o.row.status === "revising" && o.annotations.some((d) => t.edits[d.id] && t.edits[d.id].value !== d.quote))) return !0;
      for (const o of s.exercises) {
        const d = t.activityDrafts[o.id]?.value, c = t.review.drafts[o.id];
        if (d && Ot(d, o.response) || c && (c.retry || !s.attempts.some((b) => b.exerciseId === o.id)) && Ot(c.value, o.response)) return !0;
      }
    }
  }
  return !1;
}
function Mn(e, v, s, t) {
  return s === "teacher" ? t.teacher?.name !== v.teacher?.name && !!e.chat.text.trim() : s === "language" && t.language !== v.language && na(e, v);
}
function En(e) {
  const v = Rn();
  return ma(aa, v), z([
    () => e.value.chatIdentity,
    () => e.value.language,
    () => e.value.companionSessionId
  ], (s, t) => v.reset(s[0] === t[0], s[0] === t[0] && s[1] === t[1])), z(() => e.value, (s) => v.reconcile(s), { immediate: !0 }), z(() => [e.value.unit?.id, e.value.review?.id], (s) => {
    for (const t of [v.chat, v.workbenchChat])
      t.focus?.unitId && !s.includes(t.focus.unitId) && (t.focus = null), t.study && !s.includes(t.study.unitId) && (t.study = null);
  }), z(() => na(v, e.value), (s, t, o) => {
    if (!s) return;
    const d = (c) => {
      c.preventDefault(), c.returnValue = "";
    };
    window.addEventListener("beforeunload", d), o(() => window.removeEventListener("beforeunload", d));
  }, { immediate: !0 }), v;
}
function Oe() {
  const e = xa(aa);
  if (!e) throw new Error("Learning views require their application session");
  return e;
}
function Be(e) {
  const v = Oe();
  return S(() => v.unit(e()));
}
var Nn = ["onKeydown"], Tn = {
  role: "dialog",
  "aria-labelledby": "learning-activity-title",
  class: "learning-activity"
}, On = { class: "learning-activity-header" }, Bn = { id: "learning-activity-title" }, qn = {
  key: 0,
  "aria-label": "完成本课的固定奖励"
}, Pn = {
  key: 0,
  class: "learning-margin-note",
  role: "status"
}, _n = ["open"], Vn = {
  key: 3,
  class: "learning-question"
}, Un = { class: "learning-help-actions" }, Dn = ["disabled"], jn = ["disabled"], Wn = ["disabled"], Gn = {
  key: 0,
  class: "learning-margin-note"
}, Fn = {
  key: 1,
  class: "learning-margin-note"
}, Hn = { key: 0 }, Yn = { key: 1 }, zn = { key: 2 }, Kn = ["disabled"], Jn = /* @__PURE__ */ ee({
  __name: "LearningActivity",
  props: {
    state: {},
    target: {},
    active: { type: Boolean },
    disabled: { type: Boolean }
  },
  emits: [
    "action",
    "close",
    "ask"
  ],
  setup(e, { emit: v }) {
    const s = e, t = v, o = G(null), d = Be(() => s.target.unitId), c = S(() => `${s.target.kind}:${s.target.id}`);
    z([d, c], () => {
      d.value.activities[c.value] ??= {
        scroll: 0,
        selected: null,
        retry: !1,
        materialsOpen: !1
      };
    }, { immediate: !0 });
    const b = S(() => d.value.activities[c.value]), I = G(null), k = S({
      get: () => b.value.retry,
      set: (x) => {
        b.value.retry = x;
      }
    }), w = S({
      get: () => b.value.selected,
      set: (x) => {
        b.value.selected = x;
      }
    }), f = G(null);
    function L() {
      w.value ? w.value = null : k.value ? k.value = !1 : t("close");
    }
    pt(S(() => s.active ? f.value : null), L, () => !1);
    const y = S(() => d.value.activityDrafts);
    let m = null;
    const u = S(() => s.target?.kind === "exercise" ? s.state.unit?.exercises.find((x) => x.id === s.target?.id) : void 0), $ = S(() => s.state.unit?.materials.filter((x) => s.target?.kind === "material" ? x.id === s.target.id : u.value?.materialIds.includes(x.id)) ?? []), N = S(() => u.value?.id ?? s.state.unit?.exercises.find((x) => x.skill === "listening" && x.materialIds.includes(s.target?.id ?? ""))?.id ?? s.state.unit?.exercises.find((x) => x.materialIds.includes(s.target?.id ?? ""))?.id), j = S(() => $.value.filter((x) => u.value?.response.kind !== "evidence" || x.id === u.value.response.materialId).flatMap((x) => x.paragraphs)), B = S(() => s.state.unit?.attempts.filter((x) => x.exerciseId === u.value?.id).at(-1)), Q = S(() => s.state.unit?.assessments.find((x) => x.attemptId === B.value?.id));
    z(() => u.value, (x) => {
      if (!x) return;
      const C = JSON.stringify(x.response);
      y.value[x.id]?.response !== C && (y.value[x.id] = {
        response: C,
        value: Ee(x.response)
      });
    }, { immediate: !0 });
    const X = S({
      get: () => y.value[u.value.id].value,
      set: (x) => {
        y.value[u.value.id].value = x;
      }
    });
    z([() => s.active, I], ([x, C]) => {
      x && C?.focus({ preventScroll: !0 });
    }, { flush: "post" }), Te(() => {
      o.value && (o.value.scrollTop = b.value.scroll);
    }), Ne(() => {
      o.value && (b.value.scroll = o.value.scrollTop);
    }), z(() => s.state.unit?.attempts, (x) => {
      if (!m) return;
      const C = x?.filter((q) => q.exerciseId === m.id).at(-1);
      if (C && C.id !== m.before) {
        const q = s.target?.kind === "exercise" && s.target.id === m.id;
        delete y.value[m.id], m = null, q && t("close");
      }
    });
    function M(x) {
      m = {
        id: u.value.id,
        before: B.value?.id
      }, y.value[u.value.id].submitted = { before: B.value?.id }, t("action", "submit", {
        unitId: s.state.unit.id,
        exerciseId: u.value.id,
        answer: x
      });
    }
    return (x, C) => (a(), i("div", {
      ref_key: "layer",
      ref: f,
      class: "learning-activity-shade",
      onKeydown: Me(ve(L, ["stop", "prevent"]), ["esc"])
    }, [n("section", Tn, [
      n("header", On, [
        n("h2", Bn, r(u.value ? "练习" : $.value[0]?.title ?? "材料"), 1),
        e.state.unit ? (a(), i("small", qn, "+" + r(e.state.unit.reward.amount) + " 币", 1)) : g("", !0),
        n("button", {
          ref_key: "closeButton",
          ref: I,
          type: "button",
          "aria-label": "收起课件",
          onClick: C[0] || (C[0] = (q) => t("close"))
        }, [C[18] || (C[18] = H("收起", -1)), W(J, { name: "back" })], 512)
      ]),
      e.state.message && !e.state.busy ? (a(), i("p", Pn, r(e.state.message), 1)) : g("", !0),
      n("div", {
        ref_key: "body",
        ref: o,
        class: "learning-activity-body"
      }, [
        u.value && $.value.length ? (a(), i("details", {
          key: 0,
          class: "learning-activity-materials",
          open: b.value.materialsOpen,
          onToggle: C[3] || (C[3] = (q) => b.value.materialsOpen = q.target.open)
        }, [n("summary", null, "阅读材料 · " + r($.value.length), 1), (a(!0), i(R, null, D($.value, (q) => (a(), Z(Nt, {
          key: q.id,
          material: q,
          "exercise-id": N.value,
          disabled: e.disabled,
          onAction: C[1] || (C[1] = (K, O) => t("action", K, O)),
          onSelect: C[2] || (C[2] = (K) => w.value = K)
        }, null, 8, [
          "material",
          "exercise-id",
          "disabled"
        ]))), 128))], 40, _n)) : u.value ? g("", !0) : (a(!0), i(R, { key: 1 }, D($.value, (q) => (a(), Z(Nt, {
          key: q.id,
          material: q,
          "exercise-id": N.value,
          disabled: e.disabled,
          onAction: C[4] || (C[4] = (K, O) => t("action", K, O)),
          onSelect: C[5] || (C[5] = (K) => w.value = K)
        }, null, 8, [
          "material",
          "exercise-id",
          "disabled"
        ]))), 128)),
        w.value ? (a(), Z(Xt, {
          key: 2,
          selection: w.value,
          disabled: e.disabled,
          onAsk: C[6] || (C[6] = (q) => t("ask", N.value, w.value)),
          onSay: C[7] || (C[7] = (q) => t("action", "say", { selection: w.value })),
          onDismiss: C[8] || (C[8] = (q) => w.value = null)
        }, null, 8, ["selection", "disabled"])) : g("", !0),
        u.value ? (a(), i("section", Vn, [
          n("h2", null, r(u.value.prompt), 1),
          n("div", Un, [
            n("button", {
              type: "button",
              disabled: e.disabled || [...u.value.prompt].length > 1e3,
              onClick: C[9] || (C[9] = (q) => t("action", "say-question", { exerciseId: u.value.id }))
            }, "听题干", 8, Dn),
            u.value.hasHint ? (a(), i("button", {
              key: 0,
              type: "button",
              disabled: e.disabled || u.value.hint !== null,
              onClick: C[10] || (C[10] = (q) => t("action", "reveal", {
                kind: "hints",
                id: u.value.id
              }))
            }, "提示", 8, jn)) : g("", !0),
            n("button", {
              type: "button",
              disabled: e.disabled || u.value.solution !== null,
              onClick: C[11] || (C[11] = (q) => t("action", "reveal", {
                kind: "answers",
                id: u.value.id
              }))
            }, "解答", 8, Wn),
            n("button", {
              type: "button",
              onClick: C[12] || (C[12] = (q) => t("ask", u.value.id))
            }, "问语伴")
          ]),
          u.value.hint ? (a(), i("p", Gn, r(u.value.hint), 1)) : g("", !0),
          u.value.solution ? (a(), i("div", Fn, [u.value.solution.kind === "exact" ? (a(), i("p", Hn, r(l(ft)(u.value.solution.answer, u.value.response, j.value)), 1)) : u.value.solution.kind === "gaps" ? (a(), i("p", Yn, r(u.value.solution.accepted.map((q) => q.forms.join(" / ")).join(`
`)), 1)) : g("", !0), u.value.solution.kind !== "semantic" ? (a(), i("p", zn, r(u.value.solution.explanation), 1)) : (a(), i("button", {
            key: 3,
            type: "button",
            onClick: C[13] || (C[13] = (q) => t("ask", u.value.id))
          }, "请语伴讲解"))])) : g("", !0),
          (!B.value || k.value) && y.value[u.value.id] ? (a(), Z(mt, {
            key: u.value.id,
            modelValue: X.value,
            "onUpdate:modelValue": C[14] || (C[14] = (q) => X.value = q),
            response: u.value.response,
            paragraphs: j.value,
            disabled: e.disabled,
            onSubmit: M
          }, null, 8, [
            "modelValue",
            "response",
            "paragraphs",
            "disabled"
          ])) : g("", !0),
          B.value ? (a(), Z(kt, {
            key: 3,
            attempt: B.value,
            feedback: Q.value,
            response: u.value.response,
            paragraphs: j.value,
            disabled: e.disabled,
            reviewable: e.state.unit.attemptActions[B.value.id].review,
            onAction: C[15] || (C[15] = (q, K) => {
              t("action", q, K), t("close");
            })
          }, null, 8, [
            "attempt",
            "feedback",
            "response",
            "paragraphs",
            "disabled",
            "reviewable"
          ])) : g("", !0),
          B.value ? (a(), i("button", {
            key: 4,
            type: "button",
            disabled: e.disabled,
            onClick: C[16] || (C[16] = (q) => {
              k.value = !k.value, y.value[u.value.id] ??= {
                response: JSON.stringify(u.value.response),
                value: l(Ee)(u.value.response)
              };
            })
          }, r(k.value ? "收起再练" : "再试一次"), 9, Kn)) : g("", !0)
        ])) : g("", !0)
      ], 512),
      W(Qt, {
        state: e.state,
        onAction: C[17] || (C[17] = (q, K) => t("action", q, K))
      }, null, 8, ["state"])
    ])], 40, Nn));
  }
}), Zn = Jn, Qn = {
  role: "alertdialog",
  "aria-labelledby": "learning-approval-title",
  "aria-describedby": "learning-approval-detail",
  class: "learning-confirm"
}, Xn = { id: "learning-approval-title" }, ei = { id: "learning-approval-detail" }, ti = { class: "learning-row" }, ai = ["disabled"], ni = ["disabled"], ii = /* @__PURE__ */ ee({
  __name: "LearningApproval",
  props: {
    approval: {},
    pending: { type: Boolean }
  },
  emits: ["action"],
  setup(e, { emit: v }) {
    const s = e, t = v, o = G(null), d = (c) => t("action", "approve-operation", {
      id: s.approval.id,
      approved: c
    });
    return pt(o, () => d(!1)), (c, b) => (a(), i("div", {
      ref_key: "layer",
      ref: o,
      class: "learning-confirm-shade",
      onKeydown: b[2] || (b[2] = Me(ve((I) => d(!1), ["stop", "prevent"]), ["esc"]))
    }, [n("section", Qn, [
      n("h2", Xn, r(l(Ke).title), 1),
      n("p", null, r(e.approval.title), 1),
      n("p", ei, r(l(Ke).detail), 1),
      n("div", ti, [n("button", {
        autofocus: "",
        type: "button",
        disabled: e.pending,
        onClick: b[0] || (b[0] = (I) => d(!1))
      }, r(l(Ke).decline), 9, ai), n("button", {
        type: "button",
        class: "learning-primary",
        disabled: e.pending,
        onClick: b[1] || (b[1] = (I) => d(!0))
      }, r(l(Ke).accept), 9, ni)])
    ])], 544));
  }
}), li = ii;
function si(e, v) {
  return /^(zh|ja|ko)\b/iu.test(v) ? {
    count: [...e.replace(/[\s\p{P}\p{S}]/gu, "")].length,
    unit: "characters"
  } : {
    count: e.match(/[\p{L}\p{N}][\p{L}\p{N}\p{M}'’-]*/gu)?.length ?? 0,
    unit: "words"
  };
}
var ri = 864e5;
function Bt(e, v) {
  const s = si(e, v);
  return {
    count: s.count,
    unit: s.unit === "characters" ? "字" : "词"
  };
}
function ia(e, v) {
  const s = [], t = /* @__PURE__ */ new Map();
  for (const o of v)
    if (o.quote)
      for (let d = e.indexOf(o.quote); d >= 0; d = e.indexOf(o.quote, d + 1)) {
        const c = d + o.quote.length;
        if (!s.some(([b, I]) => d < I && b < c)) {
          s.push([d, c]), t.set(o.id, d);
          break;
        }
      }
  return t;
}
function oi(e, v) {
  const s = e.split(/(\r?\n)/u), t = [];
  s.forEach((k, w) => {
    w % 2 === 0 && k.trim() && t.push(w);
  });
  const o = [], d = [], c = /* @__PURE__ */ new Map();
  for (const k of v) c.set(k.paragraphIndex, [...c.get(k.paragraphIndex) ?? [], k]);
  for (const [k, w] of c) {
    const f = t[k];
    if (f === void 0) {
      o.push(...w.map((u) => u.id));
      continue;
    }
    const L = ia(s[f], w), y = w.filter((u) => L.has(u.id)).sort((u, $) => L.get($.id) - L.get(u.id));
    let m = s[f];
    for (const u of y) {
      const $ = L.get(u.id);
      m = m.slice(0, $) + u.replacement + m.slice($ + u.quote.length), u.replacement !== u.quote && d.push(u.id);
    }
    s[f] = m, o.push(...w.filter((u) => !L.has(u.id)).map((u) => u.id));
  }
  const b = new Map(v.map((k, w) => [k.id, w])), I = (k, w) => b.get(k) - b.get(w);
  return {
    text: s.join(""),
    missing: o.sort(I),
    applied: d.sort(I)
  };
}
function ui(e, v) {
  const s = ia(e, v), t = v.filter((c) => s.has(c.id)).map((c) => ({
    id: c.id,
    start: s.get(c.id),
    length: c.quote.length
  })).sort((c, b) => c.start - b.start), o = [];
  let d = 0;
  for (const c of t)
    c.start > d && o.push({ text: e.slice(d, c.start) }), o.push({
      text: e.slice(c.start, c.start + c.length),
      id: c.id
    }), d = c.start + c.length;
  return (d < e.length || !o.length) && o.push({ text: e.slice(d) }), o;
}
function di(e, v = "xiaobai-learning-seen-units") {
  const s = /* @__PURE__ */ new Set(), t = () => {
    try {
      const o = JSON.parse(e()?.getItem(v) ?? "[]");
      return Array.isArray(o) ? o.filter((d) => typeof d == "string") : [];
    } catch {
      return [];
    }
  };
  return {
    has: (o) => s.has(o) || t().includes(o),
    mark(o) {
      s.add(o);
      try {
        e()?.setItem(v, JSON.stringify([.../* @__PURE__ */ new Set([...t(), o])].slice(-50)));
      } catch {
      }
    }
  };
}
var vi = () => {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}, qt = di(vi);
function yt(e, v = Date.now()) {
  const s = new Date(e), t = new Date(v), o = Math.round((Date.UTC(s.getFullYear(), s.getMonth(), s.getDate()) - Date.UTC(t.getFullYear(), t.getMonth(), t.getDate())) / ri);
  return !Number.isFinite(o) || o <= 0 ? "今天复习" : o === 1 ? "明天再见" : `${o} 天后再见`;
}
var ci = { class: "learning-records-page" }, gi = {
  key: 0,
  class: "learning-page-heading"
}, pi = {
  key: 0,
  class: "learning-muted"
}, bi = { class: "learning-muted" }, mi = {
  key: 0,
  class: "learning-muted"
}, fi = ["disabled", "onClick"], ki = {
  key: 0,
  class: "learning-muted"
}, yi = ["disabled"], hi = {
  key: 0,
  class: "learning-empty-note"
}, $i = ["disabled", "onClick"], wi = ["title"], xi = {
  key: 1,
  class: "learning-row"
}, Ci = ["disabled"], Ii = { class: "learning-muted" }, Li = ["disabled"], Si = /* @__PURE__ */ ee({
  __name: "LearningRecords",
  props: {
    state: {},
    disabled: { type: Boolean },
    embedded: { type: Boolean }
  },
  emits: ["action", "remove"],
  setup(e, { emit: v }) {
    const s = e, t = v;
    Xe(() => s.state.record ? (t("action", "records", { offset: s.state.records.offset }), !0) : !1);
    const o = {
      deleteAnswer: "删除这次作答",
      deleteRecord: "删除记录",
      answerWarning: "这次作答和对应的反馈会删除，相关知识点的掌握情况会更新。已到账奖励保留。",
      recordWarning: "这条学习记录会删除，仅属于它的历史作答也会删除。当前练习不受影响。",
      hidden: "听力原文暂未显示，下面是你的作答和点评。"
    };
    return (d, c) => (a(), i("section", ci, [!e.embedded || e.state.record ? (a(), i("div", gi, [c[5] || (c[5] = n("h1", null, "学习记录", -1)), e.state.records.total ? (a(), i("span", pi, r(e.state.records.total) + " 项", 1)) : g("", !0)])) : g("", !0), e.state.record ? (a(), i(R, { key: 1 }, [
      n("button", {
        type: "button",
        onClick: c[0] || (c[0] = (b) => d.$emit("action", "records", { offset: e.state.records.offset }))
      }, "‹ 返回记录"),
      n("h2", null, r(e.state.record.label), 1),
      (a(!0), i(R, null, D(e.state.record.evidence, (b) => (a(), i("article", {
        key: b.attempt.id,
        class: "learning-record-evidence"
      }, [
        n("p", bi, r(new Date(b.attempt.submittedAt).toLocaleDateString()), 1),
        n("h3", null, r(b.exercise.prompt), 1),
        (a(!0), i(R, null, D(b.materials, (I) => (a(), i("details", { key: I.id }, [n("summary", null, r(I.title), 1), I.hidden ? (a(), i("p", mi, r(o.hidden), 1)) : (a(!0), i(R, { key: 1 }, D(I.paragraphs, (k) => (a(), i("p", { key: k.id }, r(k.text), 1))), 128))]))), 128)),
        W(kt, {
          attempt: b.attempt,
          feedback: b.assessment,
          response: b.exercise.response,
          paragraphs: b.materials.flatMap((I) => I.paragraphs),
          disabled: e.disabled,
          reviewable: b.actions.review,
          onAction: c[1] || (c[1] = (I, k) => d.$emit("action", I, k))
        }, null, 8, [
          "attempt",
          "feedback",
          "response",
          "paragraphs",
          "disabled",
          "reviewable"
        ]),
        n("button", {
          type: "button",
          disabled: e.disabled || !b.actions.remove,
          onClick: (I) => d.$emit("remove", "delete-attempt", { id: b.attempt.id }, o.answerWarning)
        }, r(o.deleteAnswer), 9, fi),
        b.actions.remove ? g("", !0) : (a(), i("p", ki, r(l(Yt).hiddenRevisions), 1))
      ]))), 128)),
      n("button", {
        type: "button",
        disabled: e.disabled,
        onClick: c[2] || (c[2] = (b) => d.$emit("remove", "delete-item", { id: e.state.record.id }, o.recordWarning))
      }, r(o.deleteRecord), 9, yi)
    ], 64)) : (a(), i(R, { key: 2 }, [
      e.state.records.total ? g("", !0) : (a(), i("p", hi, "暂无学习记录")),
      (a(!0), i(R, null, D(e.state.records.items, (b) => (a(), i("button", {
        key: b.id,
        class: "learning-record-row",
        type: "button",
        disabled: !b.readable,
        onClick: (I) => d.$emit("action", "records", {
          id: b.id,
          offset: e.state.records.offset
        })
      }, [n("span", null, [n("strong", null, r(b.label), 1), n("small", null, [H(r(l(Jt)(b.evidenceCount)), 1), b.nextReviewAt ? (a(), i("span", {
        key: 0,
        title: b.scheduleReason ?? void 0
      }, " · " + r(l(yt)(b.nextReviewAt)) + "（" + r(new Date(b.nextReviewAt).toLocaleDateString()) + "）", 9, wi)) : g("", !0)])]), n("em", null, r(l(Kt)[b.state]), 1)], 8, $i))), 128)),
      e.state.records.total > 30 ? (a(), i("div", xi, [
        n("button", {
          type: "button",
          disabled: e.state.records.offset === 0,
          onClick: c[3] || (c[3] = (b) => d.$emit("action", "records", { offset: Math.max(0, e.state.records.offset - 30) }))
        }, "上一页", 8, Ci),
        n("span", Ii, r(e.state.records.total) + " 项", 1),
        n("button", {
          type: "button",
          disabled: e.state.records.offset + 30 >= e.state.records.total,
          onClick: c[4] || (c[4] = (b) => d.$emit("action", "records", { offset: e.state.records.offset + 30 }))
        }, "下一页", 8, Li)
      ])) : g("", !0)
    ], 64))]));
  }
}), Pt = Si, Ai = { class: "learning-books-page" }, Ri = { class: "learning-page-heading" }, Mi = {
  key: 0,
  class: "learning-due"
}, Ei = { key: 0 }, Ni = { key: 1 }, Ti = ["disabled"], Oi = {
  class: "learning-tabs",
  role: "tablist",
  "aria-label": "学习记录视图"
}, Bi = ["aria-selected", "onClick"], qi = {
  key: 0,
  class: "learning-empty-note"
}, Pi = { class: "learning-book-list" }, _i = ["disabled", "onClick"], Vi = ["aria-expanded", "onClick"], Ui = {
  key: 1,
  class: "learning-chip-reason"
}, Di = {
  key: 2,
  class: "learning-growth"
}, ji = {
  key: 0,
  class: "learning-empty-note"
}, Wi = { class: "learning-muted" }, Gi = { key: 0 }, Fi = { key: 0 }, Hi = { key: 1 }, Yi = { key: 2 }, zi = /* @__PURE__ */ ee({
  __name: "LearningBooks",
  props: {
    state: {},
    disabled: { type: Boolean }
  },
  emits: [
    "action",
    "review",
    "remove"
  ],
  setup(e, { emit: v }) {
    const s = e, t = v, o = Oe().books, d = ye(o, "tab"), c = [
      ["grammar", "语法本"],
      ["vocabulary", "生词本"],
      ["growth", "成长"],
      ["all", "全部记录"]
    ], b = { title: "学习本" }, I = ye(o, "reason"), k = S(() => d.value === "grammar" || d.value === "vocabulary" ? s.state.books[d.value] : []), w = S(() => s.state.growth), f = S(() => !!s.state.review && s.state.review.stage.stage !== "complete");
    return (L, y) => (a(), i("section", Ai, [e.state.record ? (a(), Z(Pt, {
      key: 0,
      state: e.state,
      disabled: e.disabled,
      onAction: y[0] || (y[0] = (m, u) => t("action", m, u)),
      onRemove: y[1] || (y[1] = (m, u, $) => t("remove", m, u, $))
    }, null, 8, ["state", "disabled"])) : (a(), i(R, { key: 1 }, [
      n("div", Ri, [n("h1", null, r(b.title), 1)]),
      e.state.dueCount || f.value ? (a(), i("div", Mi, [e.state.dueCount ? (a(), i("span", Ei, r(l(Zt)(e.state.dueCount)), 1)) : g("", !0), e.state.blockedReview ? (a(), i("small", Ni, "有一组复习在另一个故事中进行，回到学习页可以放下它")) : f.value ? (a(), i("button", {
        key: 3,
        type: "button",
        class: "learning-primary",
        onClick: y[3] || (y[3] = (m) => t("review"))
      }, r(l(ae).resumeReview), 1)) : (a(), i("button", {
        key: 2,
        type: "button",
        class: "learning-primary",
        disabled: e.disabled,
        onClick: y[2] || (y[2] = (m) => t("action", "start-review"))
      }, r(l(ae).review), 9, Ti))])) : g("", !0),
      n("div", Oi, [(a(), i(R, null, D(c, ([m, u]) => n("button", {
        key: m,
        type: "button",
        role: "tab",
        "aria-selected": d.value === m,
        onClick: ($) => {
          d.value = m, I.value = "";
        }
      }, r(u), 9, Bi)), 64))]),
      d.value === "grammar" || d.value === "vocabulary" ? (a(), i(R, { key: 1 }, [k.value.length ? g("", !0) : (a(), i("p", qi, r(d.value === "grammar" ? "批改里出现的语法问题会记到这里。" : "批改里的词汇问题、读文章时收藏的词语会记到这里。"), 1)), n("ul", Pi, [(a(!0), i(R, null, D(k.value, (m) => (a(), i("li", { key: m.id }, [
        n("button", {
          type: "button",
          class: "learning-book-item",
          disabled: !m.readable,
          onClick: (u) => t("action", "records", {
            id: m.id,
            offset: e.state.records.offset
          })
        }, [n("strong", null, r(m.label), 1), n("small", null, r(l(Kt)[m.state]) + " · " + r(l(Jt)(m.evidenceCount)), 1)], 8, _i),
        m.nextReviewAt ? (a(), i("button", {
          key: 0,
          type: "button",
          class: "learning-chip",
          "aria-expanded": I.value === m.id,
          onClick: (u) => I.value = I.value === m.id ? "" : m.id
        }, r(l(yt)(m.nextReviewAt)), 9, Vi)) : g("", !0),
        I.value === m.id ? (a(), i("small", Ui, r(m.scheduleReason), 1)) : g("", !0)
      ]))), 128))])], 64)) : d.value === "growth" ? (a(), i("section", Di, [w.value.enough ? (a(), i(R, { key: 1 }, [
        n("p", Wi, [H("来自 " + r(w.value.evidence) + " 份作答", 1), w.value.completed ? (a(), i("span", Gi, "、" + r(w.value.completed) + " 次完成", 1)) : g("", !0)]),
        w.value.steady.length ? (a(), i("div", Fi, [y[6] || (y[6] = n("h2", null, "已经稳定", -1)), n("p", null, r(w.value.steady.join("、")), 1)])) : g("", !0),
        w.value.practising.length ? (a(), i("div", Hi, [y[7] || (y[7] = n("h2", null, "最近独立做对", -1)), n("p", null, r(w.value.practising.join("、")), 1)])) : g("", !0),
        w.value.struggling.length ? (a(), i("div", Yi, [y[8] || (y[8] = n("h2", null, "还要再练", -1)), n("p", null, r(w.value.struggling.join("、")), 1)])) : g("", !0)
      ], 64)) : (a(), i("p", ji, "还需要几次练习才看得出"))])) : (a(), Z(Pt, {
        key: 3,
        embedded: "",
        state: e.state,
        disabled: e.disabled,
        onAction: y[4] || (y[4] = (m, u) => t("action", m, u)),
        onRemove: y[5] || (y[5] = (m, u, $) => t("remove", m, u, $))
      }, null, 8, ["state", "disabled"]))
    ], 64))]));
  }
}), Ki = zi, Ji = {
  class: "learning-settings-card",
  "aria-label": "训练设置"
}, Zi = { key: 0 }, Qi = ["disabled"], Xi = ["open"], el = ["value"], tl = { class: "learning-row" }, al = ["disabled"], nl = /* @__PURE__ */ ee({
  __name: "LearningSettingsCard",
  props: {
    state: {},
    disabled: { type: Boolean },
    onboarding: { type: Boolean }
  },
  emits: ["action"],
  setup(e, { emit: v }) {
    const s = e, t = v, o = [
      ["zh-CN", "中文"],
      ["en", "English"],
      ["ja", "日本語"],
      ["ko", "한국어"]
    ], d = S(() => s.state.profile?.settings ?? null), c = Oe().settings, b = c.form, I = ye(c, "open");
    function k() {
      Object.assign(b, {
        exam: d.value?.exam ?? "",
        level: d.value?.level ?? "",
        targetLevel: d.value?.targetLevel ?? "",
        explanationLanguage: d.value?.explanationLanguage ?? "zh-CN",
        interests: d.value?.interests ?? ""
      });
    }
    s.onboarding && !c.open && (k(), c.open = !0);
    const w = (m) => o.find(([u]) => u === m)?.[1] ?? new Intl.DisplayNames(["zh-CN"], { type: "language" }).of(m) ?? m, f = S(() => [.../* @__PURE__ */ new Set([...o.map(([m]) => m), d.value?.explanationLanguage ?? "zh-CN"])]), L = S(() => [
      ["考试", d.value?.exam || "不备考"],
      ["水平", d.value?.level || "不确定"],
      ["目标", d.value?.targetLevel || "比现在高一级"],
      ["讲解", w(d.value?.explanationLanguage ?? "zh-CN")],
      ["兴趣", d.value?.interests || "不限"]
    ]);
    function y() {
      const m = ta(b);
      c.submitted = {
        value: m,
        form: { ...b }
      }, t("action", "settings", { value: m });
    }
    return (m, u) => (a(), i("section", Ji, [I.value ? g("", !0) : (a(), i("dl", Zi, [(a(!0), i(R, null, D(L.value, ([$, N]) => (a(), i("div", { key: $ }, [n("dt", null, r($), 1), n("dd", null, r(N), 1)]))), 128))])), I.value ? (a(), i("form", {
      key: 2,
      class: "learning-fields",
      onSubmit: ve(y, ["prevent"])
    }, [
      n("label", null, [u[7] || (u[7] = H("考试", -1)), le(n("input", {
        "onUpdate:modelValue": u[1] || (u[1] = ($) => l(b).exam = $),
        type: "text",
        maxlength: "80",
        placeholder: "不备考（例如 雅思、JLPT N2）"
      }, null, 512), [[pe, l(b).exam]])]),
      n("label", null, [u[8] || (u[8] = H("现在的水平", -1)), le(n("input", {
        "onUpdate:modelValue": u[2] || (u[2] = ($) => l(b).level = $),
        type: "text",
        maxlength: "80",
        placeholder: "不确定"
      }, null, 512), [[pe, l(b).level]])]),
      n("label", null, [u[9] || (u[9] = H("目标", -1)), le(n("input", {
        "onUpdate:modelValue": u[3] || (u[3] = ($) => l(b).targetLevel = $),
        type: "text",
        maxlength: "80",
        placeholder: "比现在高一级"
      }, null, 512), [[pe, l(b).targetLevel]])]),
      n("details", {
        class: "learning-settings-optional",
        open: !e.onboarding
      }, [
        n("summary", null, r(l(ae).optionalSettings), 1),
        n("label", null, [u[10] || (u[10] = H("讲解语言", -1)), le(n("select", { "onUpdate:modelValue": u[4] || (u[4] = ($) => l(b).explanationLanguage = $) }, [(a(!0), i(R, null, D(f.value, ($) => (a(), i("option", {
          key: $,
          value: $
        }, r(w($)), 9, el))), 128))], 512), [[et, l(b).explanationLanguage]])]),
        n("label", null, [u[11] || (u[11] = H("感兴趣的话题", -1)), le(n("input", {
          "onUpdate:modelValue": u[5] || (u[5] = ($) => l(b).interests = $),
          type: "text",
          maxlength: "200",
          placeholder: "不限"
        }, null, 512), [[pe, l(b).interests]])])
      ], 8, Xi),
      n("div", tl, [e.onboarding ? g("", !0) : (a(), i("button", {
        key: 0,
        type: "button",
        onClick: u[6] || (u[6] = ($) => {
          I.value = !1, l(c).submitted = null;
        })
      }, "取消")), n("button", {
        type: "submit",
        class: "learning-primary",
        disabled: e.disabled
      }, r(e.onboarding ? l(ae).setupFinish : l(ae).saveSettings), 9, al)])
    ], 32)) : (a(), i("button", {
      key: 1,
      type: "button",
      disabled: e.disabled,
      onClick: u[0] || (u[0] = ($) => {
        k(), I.value = !0;
      })
    }, "调整", 8, Qi))]));
  }
}), la = nl, il = { class: "learning-profile-page" }, ll = { class: "learning-setup-heading" }, sl = { class: "learning-eyebrow" }, rl = { class: "learning-language-options" }, ol = [
  "disabled",
  "aria-pressed",
  "onClick"
], ul = { "aria-hidden": "true" }, dl = ["disabled"], vl = {
  key: 0,
  class: "learning-setup-empty"
}, cl = { class: "learning-teacher-options" }, gl = [
  "disabled",
  "aria-pressed",
  "onClick"
], pl = { class: "learning-person-initial" }, bl = {
  key: 1,
  class: "learning-selected-teacher"
}, ml = { class: "learning-person-initial" }, fl = { key: 0 }, kl = ["open"], yl = ["disabled"], hl = ["disabled"], $l = ["disabled"], wl = { class: "learning-setup-actions" }, xl = ["disabled"], Cl = ["disabled"], Il = /* @__PURE__ */ ee({
  __name: "LearningSetup",
  props: {
    state: {},
    disabled: { type: Boolean }
  },
  emits: ["action"],
  setup(e, { emit: v }) {
    const s = v, t = Oe().setup, o = ye(t, "step"), d = G(null), c = ye(t, "name"), b = ye(t, "note"), I = [
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
    async function k(w) {
      o.value = w, await de(), d.value?.focus();
    }
    return Xe(() => o.value ? (k(o.value - 1), !0) : !1), (w, f) => (a(), i("section", il, [n("div", ll, [n("p", sl, r(o.value + 1) + " / " + r(l(ae).setupSteps), 1), n("h1", {
      ref_key: "heading",
      ref: d,
      tabindex: "-1"
    }, r(o.value === 0 ? "选择要学习的语言" : o.value === 1 ? "选择语伴" : l(ae).setupTitle), 513)]), o.value === 0 ? (a(), i(R, { key: 0 }, [n("div", rl, [(a(), i(R, null, D(I, ([L, y, m]) => n("button", {
      key: L,
      type: "button",
      disabled: e.disabled,
      "aria-pressed": e.state.language === L,
      onClick: (u) => s("action", "language", { language: L })
    }, [
      n("span", ul, r(m), 1),
      n("strong", null, r(y), 1),
      e.state.language === L ? (a(), Z(J, {
        key: 0,
        name: "check"
      })) : g("", !0)
    ], 8, ol)), 64))]), n("button", {
      type: "button",
      class: "learning-primary learning-setup-next",
      disabled: e.disabled,
      onClick: f[0] || (f[0] = (L) => k(1))
    }, [f[7] || (f[7] = H("继续", -1)), W(J, { name: "arrow" })], 8, dl)], 64)) : o.value === 1 ? (a(), i(R, { key: 1 }, [
      e.state.candidates.length ? g("", !0) : (a(), i("p", vl, "当前故事里还没有认识的人物，所以没有可选的语伴。可以在下面手动填一位：名字加一句身份说明。")),
      n("div", cl, [(a(!0), i(R, null, D(e.state.candidates, (L) => (a(), i("button", {
        key: L.name,
        type: "button",
        disabled: e.disabled,
        "aria-pressed": e.state.teacher?.name === L.name,
        onClick: (y) => s("action", "teacher", { teacher: {
          name: L.name,
          note: ""
        } })
      }, [
        n("span", pl, r([...L.name][0]), 1),
        n("strong", null, r(L.name), 1),
        e.state.teacher?.name === L.name ? (a(), Z(J, {
          key: 0,
          name: "check"
        })) : g("", !0)
      ], 8, gl))), 128))]),
      e.state.teacher && !e.state.candidates.some((L) => L.name === e.state.teacher?.name) ? (a(), i("p", bl, [
        n("span", ml, r([...e.state.teacher.name][0]), 1),
        n("span", null, [H(r(e.state.teacher.name), 1), e.state.teacher.note ? (a(), i("small", fl, r(e.state.teacher.note), 1)) : g("", !0)]),
        W(J, { name: "check" })
      ])) : g("", !0),
      n("details", {
        class: "learning-other-teacher",
        open: !e.state.candidates.length
      }, [n("summary", null, r(e.state.candidates.length ? "手动填写其他人物" : "手动填写"), 1), n("form", {
        class: "learning-fields",
        onSubmit: f[3] || (f[3] = ve((L) => s("action", "teacher", { teacher: {
          name: c.value.trim(),
          note: b.value.trim()
        } }), ["prevent"]))
      }, [
        n("label", null, [f[8] || (f[8] = H("名字", -1)), le(n("input", {
          "onUpdate:modelValue": f[1] || (f[1] = (L) => c.value = L),
          type: "text",
          maxlength: "80",
          placeholder: "例如 林老师",
          disabled: e.disabled
        }, null, 8, yl), [[pe, c.value]])]),
        n("label", null, [f[9] || (f[9] = H("一句身份说明", -1)), le(n("input", {
          "onUpdate:modelValue": f[2] || (f[2] = (L) => b.value = L),
          type: "text",
          maxlength: "200",
          placeholder: "例如 在东京长大的邻居，说话直爽",
          disabled: e.disabled
        }, null, 8, hl), [[pe, b.value]])]),
        n("button", {
          type: "submit",
          disabled: e.disabled || !c.value.trim()
        }, "选这位", 8, $l)
      ], 32)], 8, kl),
      n("div", wl, [n("button", {
        type: "button",
        disabled: e.disabled,
        onClick: f[4] || (f[4] = (L) => k(0))
      }, "上一步", 8, xl), n("button", {
        type: "button",
        class: "learning-primary",
        disabled: e.disabled,
        onClick: f[5] || (f[5] = (L) => k(2))
      }, [H(r(e.state.teacher ? l(ae).setupContinue : l(te).skipCompanion), 1), W(J, { name: "arrow" })], 8, Cl)])
    ], 64)) : (a(), Z(la, {
      key: 2,
      onboarding: "",
      state: e.state,
      disabled: e.disabled,
      onAction: f[6] || (f[6] = (L, y) => s("action", L, y ?? {}))
    }, null, 8, ["state", "disabled"]))]));
  }
}), Ll = Il, Sl = { class: "learning-companion-control" }, Al = {
  key: 0,
  class: "learning-sr-only"
}, Rl = { class: "learning-companion-options" }, Ml = { class: "learning-companion-switch" }, El = ["aria-label"], Nl = { class: "learning-cost-note" }, Tl = /* @__PURE__ */ ee({
  __name: "LearningCompanionControl",
  props: { name: {} },
  setup(e) {
    const v = ye(Oe().companion, "enabled"), s = {
      title: "陪读",
      on: "陪你学习中",
      off: "未开启",
      description: "开启后，你安静阅读时语伴会偶尔搭句话",
      costTitle: "费用说明",
      cost: "陪读消息和聊天一样，按你所用的 AI 服务计费。"
    };
    return (t, o) => (a(), i("details", Sl, [n("summary", null, [
      n("span", {
        class: oe(["learning-companion-light", { "is-on": v.value }]),
        "aria-hidden": "true"
      }, null, 2),
      H(r(v.value ? e.name ? `${e.name} · ${s.on}` : s.on : s.title), 1),
      v.value ? g("", !0) : (a(), i("span", Al, r(s.off), 1))
    ]), n("div", Rl, [n("label", Ml, [n("span", null, r(s.description), 1), le(n("input", {
      "onUpdate:modelValue": o[0] || (o[0] = (d) => v.value = d),
      type: "checkbox",
      role: "switch",
      "aria-label": s.title
    }, null, 8, El), [[$a, v.value]])]), n("details", Nl, [n("summary", null, r(s.costTitle), 1), n("small", null, r(s.cost), 1)])])]));
  }
}), sa = Tl, Ze = {
  unconfirmed: "还没确认保存是否成功，请先查看保存结果，不要重复提交。",
  conflict: "发现另一份学习记录，请先核对再继续。",
  unloaded: "暂时打不开学习记录。",
  invalid: "学习数据无法使用，重置后即可重新开始。",
  failed: "这次没能保存，之前保存的内容都还在，请重试。"
}, me = {
  paid: "奖励已到账",
  retired: "钱包已重置，这份奖励不再补发",
  saving: "正在保存学习成果…",
  pending: "学习已完成，奖励待领取",
  needsWallet: "开通钱包后即可领取",
  claim: "领取奖励",
  openWallet: "开通钱包并领取",
  unknown: "学习已完成，奖励到账情况还没确认。请查看钱包状态，不需要重新做练习。"
}, Ol = {
  context: "翻看学习资料",
  config: "连接 AI",
  session: "准备学习内容",
  summary: "整理之前聊过的内容",
  provider: "组织回复",
  tools: "整理学习内容",
  save: "保存学习内容",
  action: "准备学习内容"
};
function Bl(e) {
  return `正在${Ol[e.stage]}…`;
}
function _t(e) {
  return e.split(/\r?\n/u).filter((v) => v.trim());
}
var ql = ["aria-labelledby"], Pl = { id: "learning-grading-title" }, _l = {
  key: 0,
  class: "learning-grading-actions"
}, Vl = {
  key: 0,
  class: "learning-annotation-missing",
  role: "status"
}, Ul = ["disabled"], Dl = ["disabled"], jl = ["open", "onToggle"], Wl = {
  key: 0,
  class: "learning-revised-text"
}, Gl = { class: "learning-write-saved" }, Fl = { key: 0 }, Hl = {
  key: 1,
  class: "learning-graded-guidance"
}, Yl = ["onClick"], zl = ["open", "onToggle"], Kl = { key: 0 }, Jl = { key: 1 }, Zl = { key: 4 }, Ql = { class: "learning-graded-text" }, Xl = { class: "learning-annotation-fixed" }, es = {
  key: 0,
  class: "learning-annotation-missing"
}, ts = {
  key: 1,
  class: "learning-annotation-fixed"
}, as = ["onClick"], ns = { class: "learning-annotation-tag" }, is = {
  key: 0,
  class: "learning-annotation-suggestion"
}, ls = ["onSubmit"], ss = ["onUpdate:modelValue", "aria-label"], rs = ["disabled"], os = { key: 2 }, us = ["onClick"], ds = {
  key: 1,
  class: "learning-working",
  role: "status"
}, vs = ["disabled"], cs = ["disabled"], gs = {
  key: 2,
  class: "learning-model-essay"
}, ps = /* @__PURE__ */ ee({
  __name: "LearningGrading",
  props: {
    state: {},
    unit: {},
    disabled: { type: Boolean },
    pending: { type: Boolean },
    view: {}
  },
  emits: [
    "action",
    "confirm",
    "record",
    "ask"
  ],
  setup(e, { emit: v }) {
    const s = e, t = v, o = {
      content: "内容",
      grammar: "语法",
      vocabulary: "词汇",
      cohesion: "衔接"
    }, d = {
      error: "需要改",
      improve: "可以更好",
      alternative: "另一种说法"
    }, c = {
      grammar: "语法本",
      vocabulary: "生词本"
    }, b = {
      title: "看看哪里能写得更好",
      unplaced: "这处改动还没写进作文。请调整后再提交，或跳过修改。"
    }, I = (O) => O.itemId && (O.category === "grammar" || O.category === "vocabulary") ? c[O.category] : null, k = Be(() => s.unit.id), w = S(() => k.value.edits), f = S(() => s.unit.stage.stage), L = S(() => new Map(s.unit.materials.flatMap((O) => O.paragraphs).map((O, T) => [O.id, T + 1]))), y = (O) => O?.answer.kind === "text" ? O.answer.text : "", m = S(() => ea(s.unit).map((O) => {
      const { exercise: T, draft: _, review: P, annotations: E } = O;
      return {
        ...O,
        label: T.paragraphId ? `第 ${L.value.get(T.paragraphId) ?? "?"} 段总结` : T.prompt,
        paragraphs: _t(y(_)).map((Y, V) => ({
          index: V,
          segments: ui(Y, E.filter((F) => F.paragraphIndex === V)),
          annotations: E.filter((F) => F.paragraphIndex === V)
        })),
        resolved: new Set(P?.resolvedAnnotationIds ?? [])
      };
    }).sort((O, T) => +(T.annotations.length > 0) - +(O.annotations.length > 0))), u = (O) => O.row.status === "revising", $ = (O, T) => u(O) && T.severity !== "alternative";
    z(m, (O) => {
      for (const T of O.flatMap((_) => _.annotations)) w.value[T.id] ??= {
        value: T.quote,
        done: !1
      };
    }, { immediate: !0 });
    function N(O) {
      const T = w.value[O.id];
      T?.value.trim() && T.value !== O.quote && (T.done = !0);
    }
    const j = S(() => new Map(m.value.filter(u).map((O) => [O.draft.id, oi(y(O.draft), O.annotations.map((T) => ({
      id: T.id,
      paragraphIndex: T.paragraphIndex,
      quote: T.quote,
      replacement: w.value[T.id]?.done ? w.value[T.id].value : T.quote
    })))]))), B = S(() => new Set([...j.value.values()].flatMap((O) => O.missing))), Q = S(() => [...j.value.values()].reduce((O, T) => O + T.applied.length, 0)), X = G("");
    z(Q, () => {
      X.value = "";
    });
    const M = S(() => m.value.filter(u).flatMap((O) => O.annotations.filter((T) => T.severity !== "alternative")).length), x = (O, T) => {
      const _ = O.annotations.find((P) => P.id === T);
      return _ ? ["learning-mark", `is-${_.severity}`] : "";
    };
    function C() {
      const O = m.value.filter(u).flatMap((T) => {
        const _ = j.value.get(T.draft.id);
        return !_ || _.text === y(T.draft) ? [] : [{
          attemptId: T.draft.id,
          text: _.text
        }];
      });
      O.length ? t("action", "submit-revision", {
        unitId: s.unit.id,
        revisions: O
      }) : X.value = b.unplaced;
    }
    const q = S(() => s.state.pending?.unitId === s.unit.id ? s.state.pending.purpose : null), K = S(() => m.value.some((O) => O.row.status === "grading" || O.row.status === "reviewing"));
    return (O, T) => (a(), i("section", {
      class: "learning-grading",
      "aria-labelledby": e.view === "feedback" ? "learning-grading-title" : void 0
    }, [
      e.view === "feedback" ? (a(), i(R, { key: 0 }, [
        n("h2", Pl, r(b.title), 1),
        m.value.some(u) ? (a(), i("div", _l, [
          n("small", null, "已改 " + r(Q.value) + " / " + r(M.value) + " 处", 1),
          X.value ? (a(), i("small", Vl, r(X.value), 1)) : g("", !0),
          n("button", {
            type: "button",
            disabled: e.disabled,
            onClick: T[0] || (T[0] = (_) => t("confirm", "skip-revision", { unitId: e.unit.id }, "跳过这次修改？批注会保留，直接进入范文。"))
          }, "跳过修改", 8, Ul),
          n("button", {
            type: "button",
            class: "learning-primary",
            disabled: e.disabled || !Q.value,
            onClick: C
          }, "提交修改", 8, Dl)
        ])) : g("", !0),
        (a(!0), i(R, null, D(m.value, (_) => (a(), i("details", {
          key: _.exercise.id,
          class: "learning-graded",
          open: l(k).expanded[`grading:${_.draft.id}`] ?? _.annotations.length > 0,
          onToggle: (P) => l(k).expanded[`grading:${_.draft.id}`] = P.target.open
        }, [
          n("summary", null, [n("h3", null, r(_.label), 1)]),
          _.revision ? (a(), i("section", Wl, [
            n("h4", null, r(l(ae).revision), 1),
            n("p", Gl, r(y(_.revision)), 1),
            _.review?.guidance ? (a(), i("p", Fl, r(_.review.guidance), 1)) : g("", !0)
          ])) : g("", !0),
          _.assessment?.guidance ? (a(), i("p", Hl, r(_.assessment.guidance), 1)) : g("", !0),
          _.assessment ? (a(), i("button", {
            key: 2,
            type: "button",
            onClick: (P) => t("ask", _.exercise.id)
          }, r(l(te).askAssessment), 9, Yl)) : g("", !0),
          _.assessment && (_.assessment.understanding || _.assessment.expression) ? (a(), i("details", {
            key: 3,
            class: "learning-graded-more",
            open: l(k).expanded[`feedback:${_.draft.id}`],
            onToggle: (P) => l(k).expanded[`feedback:${_.draft.id}`] = P.target.open
          }, [
            T[5] || (T[5] = n("summary", null, "理解与表达点评", -1)),
            _.assessment.understanding ? (a(), i("p", Kl, [T[3] || (T[3] = n("b", null, "理解", -1)), H(r(_.assessment.understanding), 1)])) : g("", !0),
            _.assessment.expression ? (a(), i("p", Jl, [T[4] || (T[4] = n("b", null, "表达", -1)), H(r(_.assessment.expression), 1)])) : g("", !0)
          ], 40, zl)) : g("", !0),
          _.revision ? (a(), i("h4", Zl, r(l(ae).original), 1)) : g("", !0),
          (a(!0), i(R, null, D(_.paragraphs, (P) => (a(), i("div", {
            key: P.index,
            class: "learning-graded-paragraph"
          }, [n("p", Ql, [(a(!0), i(R, null, D(P.segments, (E, Y) => (a(), i(R, { key: Y }, [E.id ? (a(), i("mark", {
            key: 0,
            class: oe(x(_, E.id))
          }, r(E.text), 3)) : (a(), i(R, { key: 1 }, [H(r(E.text), 1)], 64))], 64))), 128))]), (a(!0), i(R, null, D(P.annotations, (E) => (a(), i("div", {
            key: E.id,
            class: oe(["learning-annotation", [`is-${E.severity}`, {
              "is-fixed": _.resolved.has(E.id),
              "is-edited": w.value[E.id]?.done && u(_)
            }]])
          }, [_.resolved.has(E.id) ? (a(), i(R, { key: 0 }, [n("p", Xl, "✓ " + r(l(ae).resolved), 1), n("p", null, r(E.explanation), 1)], 64)) : w.value[E.id]?.done && u(_) ? (a(), i(R, { key: 1 }, [B.value.has(E.id) ? (a(), i("p", es, "原文里找不到“" + r(E.quote) + "”，这处改动不会写进修改稿。", 1)) : (a(), i("p", ts, "✓ 改为“" + r(w.value[E.id].value) + "”", 1)), n("button", {
            type: "button",
            onClick: (Y) => w.value[E.id].done = !1
          }, "再改", 8, as)], 64)) : (a(), i(R, { key: 2 }, [
            n("p", ns, [n("span", null, r(d[E.severity]), 1), H(r(o[E.category]), 1)]),
            n("p", null, r(E.explanation), 1),
            E.suggestion ? (a(), i("p", is, "可以写成：" + r(E.suggestion), 1)) : g("", !0),
            $(_, E) && w.value[E.id] ? (a(), i("form", {
              key: 1,
              class: "learning-annotation-edit",
              onSubmit: ve((Y) => N(E), ["prevent"])
            }, [le(n("textarea", {
              "onUpdate:modelValue": (Y) => w.value[E.id].value = Y,
              rows: "2",
              "aria-label": `改写：${E.quote}`,
              maxlength: "600"
            }, null, 8, ss), [[pe, w.value[E.id].value], [l(at), w.value[E.id]]]), n("button", {
              type: "submit",
              disabled: !w.value[E.id].value.trim() || w.value[E.id].value === E.quote
            }, "改好了", 8, rs)], 40, ls)) : _.review && E.severity !== "alternative" ? (a(), i("small", os, "复核时这里还没改到")) : g("", !0)
          ], 64)), I(E) ? (a(), i("button", {
            key: 3,
            type: "button",
            class: "learning-annotation-book",
            onClick: (Y) => t("record", E.itemId)
          }, r(I(E)) + " ↗", 9, us)) : g("", !0)], 2))), 128))]))), 128))
        ], 40, jl))), 128))
      ], 64)) : g("", !0),
      K.value || f.value === "model" ? (a(), i("div", ds, [q.value ? (a(), i(R, { key: 0 }, [
        T[6] || (T[6] = n("span", {
          class: "learning-working-dot",
          "aria-hidden": "true"
        }, null, -1)),
        n("span", null, r(q.value === "grade" ? l(ae).grading : q.value === "revision-review" ? l(ae).reviewing : l(ae).modelling), 1),
        n("button", {
          type: "button",
          disabled: e.pending,
          onClick: T[1] || (T[1] = (_) => t("action", "cancel"))
        }, r(l(ae).stop), 9, vs)
      ], 64)) : (a(), i("button", {
        key: 1,
        type: "button",
        class: "learning-primary",
        disabled: e.disabled,
        onClick: T[2] || (T[2] = (_) => t("action", "grade", { unitId: e.unit.id }))
      }, r(f.value === "grading" ? l(ae).grade : l(ae).continue), 9, cs))])) : g("", !0),
      e.view === "model" && e.unit.modelEssay ? (a(), i("section", gs, [n("h3", null, [T[7] || (T[7] = H("范文", -1)), n("small", null, r(e.unit.modelEssay.level), 1)]), (a(!0), i(R, null, D(l(_t)(e.unit.modelEssay.text), (_, P) => (a(), i("p", { key: P }, r(_), 1))), 128))])) : g("", !0)
    ], 8, ql));
  }
}), bs = ps, ms = {
  class: "learning-complete",
  role: "status",
  "aria-live": "polite"
}, fs = {
  key: 0,
  class: "learning-complete-burst",
  "aria-hidden": "true"
}, ks = { class: "learning-complete-title" }, ys = {
  key: 1,
  class: "learning-complete-amount"
}, hs = ["disabled"], $s = /* @__PURE__ */ ee({
  __name: "LearningCompletion",
  props: {
    state: {},
    unitId: {},
    amount: {},
    label: {},
    disabled: { type: Boolean },
    quiet: { type: Boolean }
  },
  emits: ["action"],
  setup(e, { emit: v }) {
    const s = e, t = v, o = S(() => s.state.completions.find((c) => c.unitId === s.unitId)), d = S(() => {
      const c = o.value?.rewardStatus;
      return c === "paid" ? me.paid : c === "retired" ? me.retired : o.value ? s.state.walletOpen ? me.pending : me.needsWallet : me.saving;
    });
    return (c, b) => (a(), i("section", ms, [
      e.quiet ? g("", !0) : (a(), i("div", fs, [(a(), i(R, null, D(8, (I) => n("span", {
        key: I,
        style: Gt({ "--i": I })
      }, null, 4)), 64))])),
      n("p", ks, r(e.label), 1),
      o.value?.rewardStatus !== "retired" ? (a(), i("p", ys, [n("strong", null, r(o.value?.rewardStatus === "paid" ? "+" : "") + r(o.value?.amount ?? e.amount), 1), b[1] || (b[1] = n("span", null, "小白币", -1))])) : g("", !0),
      n("small", null, r(d.value), 1),
      o.value && o.value.rewardStatus !== "paid" && o.value.rewardStatus !== "retired" ? (a(), i("button", {
        key: 2,
        type: "button",
        disabled: e.disabled || e.state.walletStorage !== "ready",
        onClick: b[0] || (b[0] = (I) => t("action", "reward", {
          unitId: e.unitId,
          openWallet: !e.state.walletOpen
        }))
      }, r(e.state.walletOpen ? l(me).claim : l(me).openWallet), 9, hs)) : g("", !0)
    ]));
  }
}), ra = $s, ws = ["data-exercise-id"], xs = { class: "learning-write-label" }, Cs = [
  "aria-label",
  "placeholder",
  "rows",
  "onKeydown"
], Is = { class: "learning-write-foot" }, Ls = { "aria-live": "polite" }, Ss = ["disabled"], As = { class: "learning-write-saved" }, Rs = { class: "learning-write-foot" }, Ms = ["disabled"], Es = /* @__PURE__ */ ee({
  __name: "LearningWriteBox",
  props: {
    state: {},
    unit: {},
    exercise: {},
    disabled: { type: Boolean },
    label: {},
    placeholder: {},
    tone: {}
  },
  emits: ["action"],
  setup(e, { emit: v }) {
    const s = e, t = v, o = Be(() => s.unit.id);
    z([o, () => s.exercise.id], () => {
      o.value.writing[s.exercise.id] ??= {
        text: "",
        rewriting: !1,
        submitted: null
      };
    }, { immediate: !0 });
    const d = S(() => o.value.writing[s.exercise.id]), c = S({
      get: () => d.value.text,
      set: ($) => {
        d.value.text = $;
      }
    }), b = S({
      get: () => d.value.rewriting,
      set: ($) => {
        d.value.rewriting = $;
      }
    }), I = S(() => s.unit.attempts.filter(($) => $.exerciseId === s.exercise.id && $.revisesAttemptId === void 0).at(-1)), k = S(() => I.value?.answer.kind === "text" ? I.value.answer.text : ""), w = S(() => !I.value || b.value), f = S(() => Bt(c.value, s.state.language)), L = S(() => Bt(k.value, s.state.language)), y = S(() => s.state.workbenchConversation.summaryReviews.find(($) => $.attemptId === I.value?.id)?.text ?? "");
    function m() {
      s.disabled || !c.value.trim() || (d.value.submitted = {
        before: I.value?.id,
        text: c.value
      }, t("action", "submit", {
        unitId: s.unit.id,
        exerciseId: s.exercise.id,
        answer: {
          kind: "text",
          text: c.value.trim()
        }
      }));
    }
    function u() {
      c.value = k.value, b.value = !0;
    }
    return ($, N) => (a(), i("div", {
      class: oe(["learning-write", `is-${e.tone ?? "summary"}`]),
      "data-exercise-id": e.exercise.id
    }, [
      n("p", xs, r(e.label), 1),
      w.value ? (a(), i("form", {
        key: 0,
        onSubmit: ve(m, ["prevent"])
      }, [le(n("textarea", {
        "onUpdate:modelValue": N[0] || (N[0] = (j) => c.value = j),
        "aria-label": e.label,
        placeholder: e.placeholder,
        maxlength: "4000",
        rows: e.tone === "essay" ? 8 : 3,
        onKeydown: [Me(ve(m, ["ctrl", "prevent"]), ["enter"]), Me(ve(m, ["meta", "prevent"]), ["enter"])]
      }, null, 40, Cs), [[pe, c.value], [l(at), d.value]]), n("div", Is, [
        n("small", Ls, r(f.value.count) + " " + r(f.value.unit), 1),
        b.value ? (a(), i("button", {
          key: 0,
          type: "button",
          onClick: N[1] || (N[1] = (j) => {
            b.value = !1, c.value = "";
          })
        }, "取消")) : g("", !0),
        n("button", {
          type: "submit",
          class: "learning-primary",
          disabled: e.disabled || !c.value.trim()
        }, r(I.value ? "保存新稿" : "提交"), 9, Ss)
      ])], 32)) : I.value ? (a(), i(R, { key: 1 }, [n("p", As, r(k.value), 1), n("div", Rs, [n("small", null, "已保存 · " + r(L.value.count) + " " + r(L.value.unit), 1), n("button", {
        type: "button",
        disabled: e.disabled,
        onClick: u
      }, "重写", 8, Ms)])], 64)) : g("", !0),
      y.value ? (a(), Z(bt, {
        key: 2,
        class: "learning-markdown learning-write-reply",
        text: y.value
      }, null, 8, ["text"])) : g("", !0)
    ], 10, ws));
  }
}), oa = Es, re = {
  noWeb: "还没连接联网取材。你可以去设置，或先读一篇语伴原创。",
  unavailable: "这次没能准备好文章，可以重试，或改读原创文章。",
  retry: "重试准备",
  settings: "设置联网取材",
  original: "读语伴原创",
  existing: "继续已有课文",
  dismiss: "暂不开始",
  notes: "正在整理本段知识…",
  essay: "正在准备写作题…",
  stopped: "准备已暂停，已保存的内容都在。",
  incomplete: "这部分还没准备好，已保存的内容不受影响。",
  resume: "继续准备",
  missingNotes: "本段知识待补充",
  missingEssay: "写作题待补充",
  notesRequest: "请补充这些段落的学习知识。",
  essayRequest: "请为这篇文章准备主题写作题。",
  taskTitles: { prepare: "准备学习内容" }
}, Ns = "用你的话概括这一段", Ts = ["data-paragraph-id", "data-material-id"], Os = { class: "learning-reading-text" }, Bs = {
  class: "learning-reading-number",
  "aria-hidden": "true"
}, qs = ["data-material-id", "data-paragraph-id"], Ps = ["disabled"], _s = ["open"], Vs = { key: 0 }, Us = { class: "learning-knowledge-text" }, Ds = {
  key: 0,
  class: "learning-terms"
}, js = [
  "disabled",
  "aria-pressed",
  "onClick"
], Ws = {
  key: 2,
  class: "learning-muted learning-knowledge-pending"
}, Gs = /* @__PURE__ */ ee({
  __name: "ReadingParagraph",
  props: {
    state: {},
    unit: {},
    materialId: {},
    paragraph: {},
    number: {},
    disabled: { type: Boolean }
  },
  emits: ["action", "ask"],
  setup(e, { emit: v }) {
    const s = e, t = v, o = S(() => s.unit.explanations.find((L) => L.materialId === s.materialId && L.paragraphId === s.paragraph.id)), d = S(() => s.unit.exercises.find((L) => L.paragraphId === s.paragraph.id)), c = S(() => new Set(s.state.savedTerms)), b = (L) => c.value.has(L), I = Be(() => s.unit.id), k = S(() => `knowledge:${s.materialId}:${s.paragraph.id}`), w = S(() => I.value.selection?.materialId === s.materialId && I.value.selection.paragraphId === s.paragraph.id ? I.value.selection : null);
    function f() {
      I.value.selection = {
        materialId: s.materialId,
        paragraphId: s.paragraph.id,
        start: 0,
        end: s.paragraph.text.length,
        quote: s.paragraph.text
      };
    }
    return (L, y) => (a(), i("section", {
      class: "learning-reading-paragraph",
      "data-paragraph-id": e.paragraph.id,
      "data-material-id": e.materialId
    }, [
      n("p", Os, [n("span", Bs, r(e.number), 1), n("span", {
        "data-learning-text": "",
        "data-material-id": e.materialId,
        "data-paragraph-id": e.paragraph.id
      }, r(e.paragraph.text), 9, qs)]),
      n("button", {
        type: "button",
        class: "learning-paragraph-quote",
        disabled: [...e.paragraph.text].length > l(Ft),
        onClick: f
      }, r(l(Ue).select), 9, Ps),
      w.value ? (a(), Z(Xt, {
        key: 0,
        selection: w.value,
        disabled: e.disabled,
        onAsk: y[0] || (y[0] = (m) => t("ask", d.value?.id, w.value)),
        onSay: y[1] || (y[1] = (m) => t("action", "say", { selection: w.value })),
        onDismiss: y[2] || (y[2] = (m) => l(I).selection = null)
      }, null, 8, ["selection", "disabled"])) : g("", !0),
      o.value ? (a(), i("details", {
        key: 1,
        class: "learning-knowledge",
        open: l(I).expanded[k.value],
        onToggle: y[3] || (y[3] = (m) => l(I).expanded[k.value] = m.target.open)
      }, [
        n("summary", null, [y[5] || (y[5] = H("本段知识", -1)), o.value.terms.length ? (a(), i("span", Vs, " · " + r(o.value.terms.length) + " 个词语", 1)) : g("", !0)]),
        n("p", Us, r(o.value.explanation), 1),
        o.value.terms.length ? (a(), i("ul", Ds, [(a(!0), i(R, null, D(o.value.terms, (m) => (a(), i("li", { key: m.text }, [n("span", null, [n("strong", null, r(m.text), 1), n("small", null, r(m.note), 1)]), n("button", {
          type: "button",
          disabled: e.disabled || b(m.text),
          "aria-pressed": b(m.text),
          onClick: (u) => t("action", "bookmark", {
            unitId: e.unit.id,
            materialId: e.materialId,
            paragraphId: e.paragraph.id,
            termText: m.text
          })
        }, r(b(m.text) ? "已收藏" : "收藏"), 9, js)]))), 128))])) : g("", !0)
      ], 40, _s)) : (a(), i("p", Ws, r(e.state.preparation?.running ? l(re).notes : l(re).missingNotes), 1)),
      d.value ? (a(), Z(oa, {
        key: 3,
        state: e.state,
        unit: e.unit,
        exercise: d.value,
        disabled: e.disabled,
        label: l(Ns),
        placeholder: "写下这段的大意，不必逐句翻译",
        onAction: y[4] || (y[4] = (m, u) => t("action", m, u))
      }, null, 8, [
        "state",
        "unit",
        "exercise",
        "disabled",
        "label"
      ])) : g("", !0)
    ], 8, Ts));
  }
}), Fs = Gs;
function Hs(e, v) {
  return e === "talk" || e === "retry-chat" ? v === "workbench" ? "workbench-talk" : "talk" : e;
}
var Ys = /* @__PURE__ */ new Set([
  "language",
  "teacher",
  "forget-conversation",
  "resume",
  "rate",
  "seek",
  "verify-teacher",
  "adopt-teacher",
  "share-course",
  "reset-learning"
]), zs = /* @__PURE__ */ new Set([
  "submit",
  "bookmark",
  "say",
  "play",
  "save-note",
  "delete-note"
]), ua = /* @__PURE__ */ new Set([
  "approve-operation",
  "records",
  "export",
  "pause",
  "stop",
  "cancel",
  "cancel-chat",
  "cancel-companion",
  "cancel-preparation",
  "tts-settings",
  "research-settings",
  "dismiss-source"
]), Ks = /* @__PURE__ */ new Set([
  "read",
  "verify",
  "retry-save",
  "adopt-server",
  "verify-teacher",
  "adopt-teacher",
  "verify-workbench",
  "adopt-workbench",
  "verify-wallet",
  "adopt-wallet",
  "export"
]);
function Qe(e, v) {
  return ua.has(e) ? !1 : e === "talk" || e === "retry-notification" ? v.chatBusy : e === "workbench-talk" ? v.workbenchBusy : Ys.has(e) ? v.busy || v.chatBusy || v.workbenchBusy || !!v.preparation?.running : v.busy || !!v.preparation?.running && !zs.has(e);
}
function fe(e, v) {
  return e === "reset-learning" ? !Qe(e, v) && v.storage === "invalid" : e === "talk" || e === "workbench-talk" ? !Qe(e, v) && (e === "talk" ? v.chatStorage : v.workbenchStorage) === "ready" : !Qe(e, v) && (ua.has(e) || Ks.has(e) || (e === "teacher" ? v.chatStorage === "ready" : v.storage === "ready"));
}
var Js = ["aria-label"], Zs = [
  "aria-current",
  "disabled",
  "onClick"
], Qs = { class: "learning-reading-head" }, Xs = ["open"], er = { key: 0 }, tr = { class: "learning-source" }, ar = ["href"], nr = { class: "learning-essay-prompt" }, ir = {
  key: 0,
  class: "learning-essay"
}, lr = { class: "learning-muted" }, sr = ["data-exercise-id"], rr = ["aria-label"], or = ["aria-current"], ur = {
  key: 1,
  class: "learning-stage-bar is-writing"
}, dr = {
  key: 1,
  class: "learning-muted"
}, vr = {
  key: 2,
  class: "learning-stage-bar"
}, cr = ["disabled"], gr = ["disabled"], pr = /* @__PURE__ */ ee({
  __name: "LearningReading",
  props: {
    state: {},
    unit: {},
    disabled: { type: Boolean },
    pending: { type: Boolean }
  },
  emits: [
    "action",
    "confirm",
    "ask",
    "record",
    "assistant"
  ],
  setup(e, { emit: v }) {
    const s = e, t = v, o = G(null), d = Be(() => s.unit.id);
    Ht(o, () => s.unit.materials, (M) => {
      d.value.selection = M;
    });
    const c = S(() => s.unit.stage.stage), b = S(() => d.value.reading.view ?? (c.value === "complete" ? "model" : ["writing", "grading"].includes(c.value) ? "reading" : "feedback")), I = [
      "reading",
      "feedback",
      "model"
    ];
    async function k(M) {
      const x = o.value?.closest(".learning-scroll");
      x && (d.value.reading.scrolls[b.value] = x.scrollTop), d.value.reading.view = M, await de(), x && (x.scrollTop = d.value.reading.scrolls[M] ?? 0);
    }
    const w = [
      ["writing", "阅读与写作"],
      ["grading", "统一批改"],
      ["revising", "修改"],
      ["model", "范文"],
      ["complete", "完成"]
    ], f = S(() => ({
      writing: 0,
      grading: 1,
      revising: 2,
      reviewing: 3,
      model: 3,
      complete: 4
    })[c.value] ?? 0), L = S(() => s.unit.exercises.filter((M) => !M.paragraphId && M.skill === "writing" && M.response.kind === "text")), y = S(() => s.unit.exercises.filter((M) => !M.paragraphId && !L.value.includes(M)));
    z([y, () => y.value.map((M) => d.value.activityDrafts[M.id])], ([M]) => {
      for (const x of M) {
        const C = JSON.stringify(x.response);
        d.value.activityDrafts[x.id]?.response !== C && (d.value.activityDrafts[x.id] = {
          response: C,
          value: Ee(x.response)
        });
      }
    }, { immediate: !0 });
    const m = S(() => y.value.flatMap((M) => {
      const x = s.unit.attempts.filter((C) => C.exerciseId === M.id).at(-1);
      return x ? [{
        exercise: M,
        attempt: x,
        feedback: s.unit.assessments.find((C) => C.attemptId === x.id)
      }] : [];
    })), u = S(() => s.unit.stage.exercises.some((M) => M.status === "grading" || M.status === "reviewing")), $ = S(() => s.unit.stage.exercises.filter((M) => M.status === "writing").map((M) => M.exerciseId)), N = {
      goal: "本篇目标",
      progress: "学习进度",
      essay: "主题写作",
      essayLabel: "你的作文",
      essayPlaceholder: "写下你的看法和理由",
      authored: "语伴原创",
      adapted: "改写自",
      original: "原文",
      written: "已写",
      next: "继续写作"
    }, j = S(() => {
      let M = 0;
      return s.unit.materials.map((x) => ({
        material: x,
        paragraphs: x.paragraphs.map((C) => ({
          paragraph: C,
          number: ++M
        }))
      }));
    }), B = (M, x) => t("action", M, x);
    function Q(M, x) {
      d.value.activityDrafts[M].submitted = { before: s.unit.attempts.filter((C) => C.exerciseId === M).at(-1)?.id }, B("submit", {
        unitId: s.unit.id,
        exerciseId: M,
        answer: x
      });
    }
    function X(M) {
      const x = o.value?.querySelector(`[data-exercise-id="${CSS.escape(M)}"]`);
      x?.scrollIntoView({
        block: "center",
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      }), x?.querySelector("textarea, button")?.focus({ preventScroll: !0 });
    }
    return (M, x) => (a(), i("article", {
      ref_key: "root",
      ref: o,
      class: "learning-reading"
    }, [
      n("nav", {
        class: "learning-reading-nav",
        "aria-label": l(ae).navigation
      }, [(a(), i(R, null, D(I, (C) => n("button", {
        key: C,
        type: "button",
        "aria-current": b.value === C ? "page" : void 0,
        disabled: C === "model" && !e.unit.modelEssay,
        onClick: (q) => k(C)
      }, r(l(ae)[C]), 9, Zs)), 64))], 8, Js),
      e.state.completions.some((C) => C.unitId === e.unit.id) ? (a(), Z(ra, {
        key: 0,
        state: e.state,
        "unit-id": e.unit.id,
        amount: e.unit.reward.amount,
        label: l(ae).completed,
        disabled: e.disabled,
        onAction: B
      }, null, 8, [
        "state",
        "unit-id",
        "amount",
        "label",
        "disabled"
      ])) : g("", !0),
      b.value === "reading" ? (a(), i(R, { key: 1 }, [
        n("header", Qs, [n("details", {
          class: "learning-reading-goal",
          open: l(d).expanded.goal,
          onToggle: x[0] || (x[0] = (C) => l(d).expanded.goal = C.target.open)
        }, [
          n("summary", null, r(N.goal), 1),
          n("strong", null, r(e.unit.title), 1),
          e.unit.goal ? (a(), i("p", er, r(e.unit.goal), 1)) : g("", !0)
        ], 40, Xs), W(sa, { name: e.state.teacher?.name }, null, 8, ["name"])]),
        (a(!0), i(R, null, D(j.value, (C, q) => (a(), i("section", {
          key: C.material.id,
          class: "learning-reading-material"
        }, [
          (a(), Z(ba(q === 0 ? "h1" : "h2"), { tabindex: "-1" }, {
            default: Wt(() => [H(r(C.material.title), 1)]),
            _: 2
          }, 1024)),
          n("p", tr, [C.material.provenance.kind === "authored" ? (a(), i(R, { key: 0 }, [H(r(N.authored), 1)], 64)) : (a(), i(R, { key: 1 }, [H(r(C.material.provenance.kind === "adapted" ? N.adapted : N.original) + " ", 1), n("a", {
            href: C.material.provenance.url,
            target: "_blank",
            rel: "noopener noreferrer"
          }, r(C.material.provenance.title), 9, ar)], 64))]),
          (a(!0), i(R, null, D(C.paragraphs, (K) => (a(), Z(Fs, {
            key: K.paragraph.id,
            state: e.state,
            unit: e.unit,
            "material-id": C.material.id,
            paragraph: K.paragraph,
            number: K.number,
            disabled: e.disabled,
            onAction: B,
            onAsk: x[1] || (x[1] = (O, T) => t("ask", O, T))
          }, null, 8, [
            "state",
            "unit",
            "material-id",
            "paragraph",
            "number",
            "disabled"
          ]))), 128))
        ]))), 128)),
        (a(!0), i(R, null, D(L.value, (C) => (a(), i("section", {
          key: C.id,
          class: "learning-essay"
        }, [
          n("h2", null, r(N.essay), 1),
          n("p", nr, r(C.prompt), 1),
          W(oa, {
            state: e.state,
            unit: e.unit,
            exercise: C,
            disabled: e.disabled,
            label: N.essayLabel,
            placeholder: N.essayPlaceholder,
            tone: "essay",
            onAction: B
          }, null, 8, [
            "state",
            "unit",
            "exercise",
            "disabled",
            "label",
            "placeholder"
          ])
        ]))), 128)),
        L.value.length ? g("", !0) : (a(), i("section", ir, [n("h2", null, r(N.essay), 1), n("p", lr, r(e.state.preparation?.running ? l(re).essay : l(re).missingEssay), 1)])),
        (a(!0), i(R, null, D(y.value, (C) => (a(), i("section", {
          key: C.id,
          class: "learning-essay",
          "data-exercise-id": C.id
        }, [
          n("h2", null, r(C.prompt), 1),
          l(d).activityDrafts[C.id] ? (a(), Z(mt, {
            key: 0,
            modelValue: l(d).activityDrafts[C.id].value,
            "onUpdate:modelValue": (q) => l(d).activityDrafts[C.id].value = q,
            response: C.response,
            paragraphs: e.unit.materials.filter((q) => C.materialIds.includes(q.id)).flatMap((q) => q.paragraphs),
            disabled: e.disabled,
            onSubmit: (q) => Q(C.id, q)
          }, null, 8, [
            "modelValue",
            "onUpdate:modelValue",
            "response",
            "paragraphs",
            "disabled",
            "onSubmit"
          ])) : g("", !0),
          (a(!0), i(R, null, D(m.value.filter((q) => q.exercise.id === C.id), (q) => (a(), Z(kt, {
            key: q.attempt.id,
            attempt: q.attempt,
            feedback: q.feedback,
            response: C.response,
            paragraphs: e.unit.materials.flatMap((K) => K.paragraphs),
            disabled: e.disabled,
            reviewable: e.unit.attemptActions[q.attempt.id].review,
            onAction: B
          }, null, 8, [
            "attempt",
            "feedback",
            "response",
            "paragraphs",
            "disabled",
            "reviewable"
          ]))), 128))
        ], 8, sr))), 128)),
        n("ol", {
          class: "learning-steps",
          "aria-label": N.progress
        }, [(a(), i(R, null, D(w, ([C, q], K) => n("li", {
          key: C,
          class: oe({
            "is-done": K < f.value,
            "is-current": K === f.value
          }),
          "aria-current": K === f.value ? "step" : void 0
        }, r(q), 11, or)), 64))], 8, rr),
        c.value === "writing" ? (a(), i("div", ur, [n("span", null, r(N.written) + " " + r(e.unit.stage.exercises.length - $.value.length) + " / " + r(e.unit.stage.exercises.length), 1), $.value.length ? (a(), i("button", {
          key: 0,
          type: "button",
          onClick: x[2] || (x[2] = (C) => X($.value[0]))
        }, r(N.next), 1)) : (a(), i("span", dr, r(e.unit.preparation.essay ? l(re).missingNotes : l(re).missingEssay), 1))])) : g("", !0),
        u.value ? (a(), i("div", vr, [e.state.pending?.purpose === "grade" ? (a(), i(R, { key: 0 }, [
          x[10] || (x[10] = n("span", {
            class: "learning-working-dot",
            "aria-hidden": "true"
          }, null, -1)),
          n("span", null, r(l(ae).grading), 1),
          n("button", {
            type: "button",
            disabled: e.pending,
            onClick: x[3] || (x[3] = (C) => t("action", "cancel"))
          }, r(l(ae).stop), 9, cr)
        ], 64)) : (a(), i("button", {
          key: 1,
          type: "button",
          class: "learning-primary",
          disabled: e.disabled || !l(fe)("grade", e.state),
          onClick: x[4] || (x[4] = (C) => t("action", "grade", { unitId: e.unit.id }))
        }, r(l(ae).grade), 9, gr))])) : e.unit.assessments.length ? (a(), i("button", {
          key: 3,
          type: "button",
          class: "learning-primary",
          onClick: x[5] || (x[5] = (C) => k("feedback"))
        }, r(l(ae).feedback), 1)) : g("", !0)
      ], 64)) : (a(), Z(bs, {
        key: 2,
        view: b.value,
        state: e.state,
        unit: e.unit,
        disabled: e.disabled || !l(fe)("grade", e.state),
        pending: e.pending,
        onAsk: x[6] || (x[6] = (C) => t("assistant", C)),
        onAction: B,
        onConfirm: x[7] || (x[7] = (C, q, K) => t("confirm", C, q, K)),
        onRecord: x[8] || (x[8] = (C) => t("record", C))
      }, null, 8, [
        "view",
        "state",
        "unit",
        "disabled",
        "pending"
      ])),
      b.value === "feedback" && c.value === "complete" ? (a(), i("button", {
        key: 3,
        type: "button",
        class: "learning-primary",
        onClick: x[9] || (x[9] = (C) => k("model"))
      }, r(l(ae).viewModel), 1)) : g("", !0)
    ], 512));
  }
}), br = pr, mr = ["data-learning-unit-id", "data-exercise-id"], fr = { class: "learning-review-head" }, kr = { class: "learning-muted" }, yr = ["disabled"], hr = {
  class: "learning-review-dots",
  "aria-label": "复习卡片"
}, $r = [
  "aria-label",
  "aria-current",
  "onClick"
], wr = { class: "learning-eyebrow" }, xr = { class: "learning-card-verdict" }, Cr = { key: 0 }, Ir = { key: 1 }, Lr = { key: 2 }, Sr = { key: 1 }, Ar = ["disabled"], Rr = ["disabled"], Mr = {
  key: 1,
  class: "learning-working",
  role: "status"
}, Er = ["disabled"], Nr = ["disabled"], Tr = ["disabled"], Or = {
  key: 2,
  class: "learning-row"
}, Br = { class: "learning-review-results" }, qr = ["aria-current", "onClick"], Pr = ["aria-expanded", "onClick"], _r = {
  key: 1,
  class: "learning-chip-reason"
}, Vr = /* @__PURE__ */ ee({
  __name: "LearningReview",
  props: {
    state: {},
    review: {},
    disabled: { type: Boolean },
    pending: { type: Boolean }
  },
  emits: [
    "action",
    "confirm",
    "ask"
  ],
  setup(e, { emit: v }) {
    const s = e, t = v, o = $e.verdicts, d = S(() => s.review.stage.stage), c = (P) => s.review.attempts.filter((E) => E.exerciseId === P).at(-1), b = () => Math.max(0, s.review.exercises.findIndex((P) => !c(P.id))), I = Be(() => s.review.id), k = S(() => I.value.review), w = S({
      get: () => k.value.index ?? b(),
      set: (P) => {
        k.value.index = P;
      }
    }), f = S(() => s.review.exercises[w.value]), L = S(() => f.value && c(f.value.id)), y = S(() => s.review.assessments.find((P) => P.attemptId === L.value?.id)), m = S(() => s.review.materials.flatMap((P) => P.paragraphs)), u = S(() => k.value.drafts);
    z([f, () => f.value && u.value[f.value.id]], ([P]) => {
      P && !u.value[P.id] && (u.value[P.id] = {
        value: Ee(P.response),
        retry: !1
      });
    }, { immediate: !0 });
    const $ = S({
      get: () => u.value[f.value.id].value,
      set: (P) => {
        u.value[f.value.id].value = P;
      }
    }), N = S(() => !!f.value && !!u.value[f.value.id]?.retry), j = S(() => s.review.exercises.filter((P) => c(P.id)).length), B = S({
      get: () => k.value.openReason,
      set: (P) => {
        k.value.openReason = P;
      }
    });
    function Q(P) {
      u.value[f.value.id].submitted = { before: L.value?.id }, t("action", "submit", {
        unitId: s.review.id,
        exerciseId: f.value.id,
        answer: P
      });
    }
    function X() {
      const P = f.value;
      u.value[P.id] = {
        value: Ee(P.response),
        retry: !N.value
      };
    }
    function M() {
      const P = s.review.exercises.findIndex((E) => !c(E.id));
      P >= 0 && (w.value = P);
    }
    function x(P) {
      w.value = P, O.value = !0;
    }
    const C = S(() => s.state.completions.find((P) => P.unitId === s.review.id)), q = S(() => C.value?.rewardStatus === "paid" || C.value?.rewardStatus === "retired");
    z(k, (P) => {
      P.seenBefore ??= d.value === "complete" && qt.has(s.review.id);
    }, { immediate: !0 });
    const K = S(() => k.value.seenBefore ?? !1), O = S({
      get: () => k.value.expanded,
      set: (P) => {
        k.value.expanded = P;
      }
    });
    z([d, () => s.review.id], ([P, E]) => {
      P === "complete" && qt.mark(E);
    }, { immediate: !0 });
    const T = S(() => K.value && q.value && !O.value), _ = (P) => [...s.state.books.grammar, ...s.state.books.vocabulary].find((E) => E.id === P);
    return (P, E) => (a(), i("section", {
      class: "learning-review",
      "data-learning-unit-id": e.review.id,
      "data-exercise-id": f.value?.id,
      "aria-labelledby": "learning-review-title"
    }, [
      n("header", fr, [
        E[8] || (E[8] = n("h2", { id: "learning-review-title" }, "今日复习", -1)),
        n("span", kr, r(j.value) + " / " + r(e.review.exercises.length), 1),
        d.value === "answering" ? (a(), i("button", {
          key: 0,
          type: "button",
          disabled: e.disabled || !l(fe)("abandon-review", e.state),
          onClick: E[0] || (E[0] = (Y) => t("confirm", "abandon-review", {}, l(ke).review))
        }, "放下", 8, yr)) : g("", !0)
      ]),
      n("nav", hr, [(a(!0), i(R, null, D(e.review.exercises, (Y, V) => (a(), i("button", {
        key: Y.id,
        type: "button",
        "aria-label": `第 ${V + 1} 张`,
        "aria-current": V === w.value,
        class: oe({ "is-answered": !!c(Y.id) }),
        onClick: (F) => x(V)
      }, null, 10, $r))), 128))]),
      f.value && !T.value ? (a(), i("div", {
        key: `${f.value.id}:${L.value && !N.value ? "back" : "front"}`,
        class: oe(["learning-card", { "is-back": !!L.value && !N.value }])
      }, [
        n("p", wr, r(L.value ? l($e).answer : `第 ${w.value + 1} 张`), 1),
        n("h3", null, r(f.value.prompt), 1),
        !L.value || N.value ? (a(), Z(mt, {
          key: 0,
          modelValue: $.value,
          "onUpdate:modelValue": E[1] || (E[1] = (Y) => $.value = Y),
          response: f.value.response,
          paragraphs: m.value,
          disabled: e.disabled || !l(fe)("submit", e.state),
          onSubmit: Q
        }, null, 8, [
          "modelValue",
          "response",
          "paragraphs",
          "disabled"
        ])) : (a(), i(R, { key: 1 }, [
          n("blockquote", null, r(l(ft)(L.value.answer, f.value.response, m.value)), 1),
          y.value ? (a(), i(R, { key: 0 }, [
            n("p", xr, r(l(o)[y.value.verdict]), 1),
            y.value.understanding ? (a(), i("p", Cr, r(y.value.understanding), 1)) : g("", !0),
            y.value.expression ? (a(), i("p", Ir, r(y.value.expression), 1)) : g("", !0),
            y.value.guidance ? (a(), i("p", Lr, r(y.value.guidance), 1)) : g("", !0)
          ], 64)) : (a(), i("small", Sr, r(l($e).saved), 1)),
          j.value < e.review.exercises.length ? (a(), i("button", {
            key: 2,
            type: "button",
            class: "learning-primary",
            onClick: M
          }, "下一张")) : g("", !0)
        ], 64)),
        L.value ? (a(), i("button", {
          key: 2,
          type: "button",
          disabled: e.disabled || !l(fe)("submit", e.state),
          onClick: X
        }, r(N.value ? l($e).cancelRetry : l($e).retry), 9, Ar)) : g("", !0),
        n("button", {
          type: "button",
          class: "learning-review-ask",
          "data-action": "ask",
          disabled: e.pending || !l(fe)("talk", e.state),
          onClick: E[2] || (E[2] = (Y) => t("ask", f.value.id, e.review.id))
        }, r(l($e).ask), 9, Rr)
      ], 2)) : g("", !0),
      d.value === "grading" ? (a(), i("div", Mr, [e.state.pending?.purpose === "review-assess" ? (a(), i(R, { key: 0 }, [
        E[9] || (E[9] = n("span", {
          class: "learning-working-dot",
          "aria-hidden": "true"
        }, null, -1)),
        E[10] || (E[10] = n("span", null, "正在批改这组复习…", -1)),
        n("button", {
          type: "button",
          disabled: e.pending,
          onClick: E[3] || (E[3] = (Y) => t("action", "cancel"))
        }, "停止", 8, Er)
      ], 64)) : (a(), i(R, { key: 1 }, [
        n("span", null, r(l($e).ready), 1),
        n("button", {
          type: "button",
          disabled: e.disabled || !l(fe)("abandon-review", e.state),
          onClick: E[4] || (E[4] = (Y) => t("confirm", "abandon-review", {}, l(ke).review))
        }, "放下", 8, Nr),
        n("button", {
          type: "button",
          disabled: e.disabled || !l(fe)("grade", e.state),
          onClick: E[5] || (E[5] = (Y) => t("action", "grade", { unitId: e.review.id }))
        }, r(l($e).grade), 9, Tr)
      ], 64))])) : g("", !0),
      d.value === "complete" && T.value ? (a(), i("div", Or, [E[11] || (E[11] = n("span", { class: "learning-muted" }, "这组复习已完成", -1)), n("button", {
        type: "button",
        "aria-expanded": !1,
        onClick: E[6] || (E[6] = (Y) => O.value = !0)
      }, "查看结果")])) : d.value === "complete" ? (a(), i(R, { key: 3 }, [n("ul", Br, [(a(!0), i(R, null, D(e.review.exercises, (Y, V) => (a(), i("li", { key: Y.id }, [
        n("button", {
          type: "button",
          class: "learning-review-result",
          "aria-current": V === w.value,
          onClick: (F) => x(V)
        }, [n("strong", null, r(_(Y.itemId)?.label ?? Y.prompt), 1), n("small", null, r(l(o)[e.review.assessments.find((F) => F.attemptId === c(Y.id)?.id)?.verdict ?? "disputed"]), 1)], 8, qr),
        _(Y.itemId)?.nextReviewAt ? (a(), i("button", {
          key: 0,
          type: "button",
          class: "learning-chip",
          "aria-expanded": B.value === Y.id,
          onClick: (F) => B.value = B.value === Y.id ? "" : Y.id
        }, r(l(yt)(_(Y.itemId).nextReviewAt)), 9, Pr)) : g("", !0),
        B.value === Y.id ? (a(), i("small", _r, r(_(Y.itemId)?.scheduleReason), 1)) : g("", !0)
      ]))), 128))]), W(ra, {
        state: e.state,
        "unit-id": e.review.id,
        amount: e.review.reward.amount,
        label: "复习完成",
        disabled: e.disabled,
        quiet: K.value,
        onAction: E[7] || (E[7] = (Y, V) => t("action", Y, V))
      }, null, 8, [
        "state",
        "unit-id",
        "amount",
        "disabled",
        "quiet"
      ])], 64)) : g("", !0)
    ], 8, mr));
  }
}), Ur = Vr, Dr = {
  key: 0,
  class: "learning-source-choice",
  "aria-live": "polite"
}, jr = { class: "learning-row" }, Wr = ["disabled"], Gr = ["disabled"], Fr = ["disabled"], Hr = ["disabled"], Yr = ["disabled"], zr = {
  key: 1,
  class: "learning-preparation",
  "aria-live": "polite"
}, Kr = {
  key: 0,
  class: "learning-turn-notice"
}, Jr = { class: "learning-row" }, Zr = ["disabled"], Qr = /* @__PURE__ */ ee({
  __name: "LearningPreparation",
  props: {
    state: {},
    disabled: { type: Boolean },
    pending: { type: Boolean }
  },
  emits: ["action"],
  setup(e, { emit: v }) {
    const s = v;
    return (t, o) => e.state.sourceChoice ? (a(), i("section", Dr, [
      n("p", null, r(e.state.sourceChoice === "unconfigured" ? l(re).noWeb : e.state.preparation?.message || l(re).unavailable), 1),
      n("div", jr, [
        e.state.sourceChoice === "unavailable" ? (a(), i("button", {
          key: 0,
          type: "button",
          class: "learning-primary",
          disabled: e.disabled,
          onClick: o[0] || (o[0] = (d) => s("action", "retry-source"))
        }, r(l(re).retry), 9, Wr)) : (a(), i("button", {
          key: 1,
          type: "button",
          class: "learning-primary",
          disabled: e.pending,
          onClick: o[1] || (o[1] = (d) => s("action", "research-settings"))
        }, r(l(re).settings), 9, Gr)),
        e.state.preparation?.source !== "authored" ? (a(), i("button", {
          key: 2,
          type: "button",
          disabled: e.disabled,
          onClick: o[2] || (o[2] = (d) => s("action", "choose-original"))
        }, r(l(re).original), 9, Fr)) : g("", !0),
        n("button", {
          type: "button",
          disabled: e.pending,
          onClick: o[3] || (o[3] = (d) => s("action", "dismiss-source"))
        }, r(e.state.unit ? l(re).existing : l(re).dismiss), 9, Hr)
      ]),
      e.state.sourceChoice === "unavailable" && e.state.preparation?.source !== "authored" ? (a(), i("button", {
        key: 0,
        type: "button",
        disabled: e.pending,
        onClick: o[4] || (o[4] = (d) => s("action", "research-settings"))
      }, r(l(re).settings), 9, Yr)) : g("", !0)
    ])) : !e.state.preparation?.running && (e.state.preparation || e.state.unit?.kind === "reading-writing" && !e.state.unit.preparation.ready) ? (a(), i("section", zr, [e.state.preparation?.message ? (a(), i("p", Kr, r(e.state.preparation.message), 1)) : g("", !0), n("div", Jr, [e.state.unit?.kind === "reading-writing" && !e.state.unit.preparation.ready ? (a(), i("button", {
      key: 0,
      type: "button",
      disabled: e.disabled,
      onClick: o[5] || (o[5] = (d) => s("action", "resume-preparation", { unitId: e.state.unit.id }))
    }, r(l(re).resume), 9, Zr)) : g("", !0)])])) : g("", !0);
  }
}), gt = Qr, Xr = {
  key: 0,
  class: "learning-row"
}, eo = { class: "learning-muted" }, to = ["disabled"], ao = /* @__PURE__ */ ee({
  __name: "LearningCourseSharing",
  props: {
    state: {},
    unit: {},
    disabled: { type: Boolean }
  },
  emits: ["confirm"],
  setup(e, { emit: v }) {
    const s = e, t = v;
    function o() {
      t("confirm", "share-course", {
        unitId: s.unit.id,
        commitId: s.state.commitId,
        approved: !0
      }, vt.confirm);
    }
    return (d, c) => e.unit.shared === !1 ? (a(), i("div", Xr, [n("span", eo, r(l(vt).private), 1), n("button", {
      type: "button",
      disabled: e.disabled || !e.state.commitId || !l(fe)("share-course", e.state),
      onClick: o
    }, r(l(vt).action), 9, to)])) : g("", !0);
  }
}), Vt = ao, no = { class: "learning-workbench" }, io = {
  key: 1,
  class: "learning-due"
}, lo = {
  key: 0,
  class: "learning-working",
  role: "status"
}, so = ["disabled"], ro = ["disabled"], oo = {
  key: 2,
  class: "learning-row"
}, uo = ["disabled"], vo = ["data-learning-unit-id"], co = { class: "learning-eyebrow" }, go = { tabindex: "-1" }, po = {
  key: 0,
  class: "learning-muted"
}, bo = ["onClick"], mo = ["onClick"], fo = { class: "learning-row" }, ko = ["disabled"], yo = {
  key: 8,
  class: "learning-start"
}, ho = ["disabled"], $o = {
  key: 0,
  tabindex: "-1"
}, wo = { key: 1 }, xo = ["aria-label"], Co = { class: "learning-start-reading" }, Io = ["disabled"], Lo = ["disabled"], So = /* @__PURE__ */ ee({
  __name: "LearningWorkbench",
  props: {
    state: {},
    disabled: { type: Boolean },
    pending: { type: Boolean },
    preparationInProcess: { type: Boolean }
  },
  emits: [
    "action",
    "confirm",
    "present",
    "go",
    "ask",
    "assistant",
    "record"
  ],
  setup(e, { emit: v }) {
    const s = e, t = (m) => s.disabled || !fe(m, s.state), o = v, d = S(() => !!s.state.review && s.state.review.stage.stage !== "complete"), c = S(() => s.state.unit), b = S(() => !c.value || s.state.completions.some((m) => m.unitId === c.value?.id)), I = S(() => s.state.busy && !s.state.pending), k = {
      start: "开始读写",
      reading: "读写练习",
      readingHint: "读一篇文章，写下你的看法",
      lesson: "专项练习",
      lessonHint: "练语法、词汇或听力",
      select: "选择语伴",
      selectFirst: "先选一位语伴",
      next: "接下来",
      settings: "学习设置",
      complete: "完成练习",
      notes: "笔记",
      review: "开始复习"
    }, w = S(() => [
      new Intl.DisplayNames(["zh-CN"], { type: "language" }).of(s.state.language),
      s.state.profile?.settings.exam,
      [s.state.profile?.settings.level, s.state.profile?.settings.targetLevel].filter(Boolean).join(" → ")
    ].filter(Boolean).join(" · "));
    function f(m) {
      o("action", "prepare", {
        kind: m,
        message: m === "reading-writing" ? "请按我的训练设置准备一篇读写训练。" : "请按我现在的情况准备一节专项小课。"
      });
    }
    const L = (m, u) => o("action", m, u), y = (m, u, $) => o("confirm", m, u, $);
    return (m, u) => (a(), i("div", no, [
      !e.preparationInProcess && (!e.state.sourceChoice || !b.value) ? (a(), Z(gt, {
        key: 0,
        state: e.state,
        disabled: e.disabled,
        pending: e.pending,
        onAction: L
      }, null, 8, [
        "state",
        "disabled",
        "pending"
      ])) : g("", !0),
      e.state.dueCount && !d.value ? (a(), i("div", io, [n("span", null, r(l(Zt)(e.state.dueCount)), 1), e.state.pending?.purpose === "review-prepare" ? (a(), i("span", lo, [
        u[13] || (u[13] = n("span", {
          class: "learning-working-dot",
          "aria-hidden": "true"
        }, null, -1)),
        u[14] || (u[14] = n("span", null, "正在出题…", -1)),
        n("button", {
          type: "button",
          disabled: e.pending,
          onClick: u[0] || (u[0] = ($) => o("action", "cancel"))
        }, "停止", 8, so)
      ])) : e.state.blockedReview ? g("", !0) : (a(), i("button", {
        key: 1,
        type: "button",
        class: "learning-primary",
        disabled: t("start-review"),
        onClick: u[1] || (u[1] = ($) => o("action", "start-review"))
      }, r(k.review), 9, ro))])) : g("", !0),
      e.state.blockedReview ? (a(), i("div", oo, [u[15] || (u[15] = n("p", { class: "learning-muted" }, "有一组复习在另一个故事中进行。回到那个故事可以接着做；也可以放下它，在这里重新出题。", -1)), n("button", {
        type: "button",
        disabled: t("abandon-review"),
        onClick: u[2] || (u[2] = ($) => y("abandon-review", {}, l(ke).review))
      }, "放下", 8, uo)])) : g("", !0),
      e.state.review ? (a(), Z(Vt, {
        key: 3,
        state: e.state,
        unit: e.state.review,
        disabled: e.disabled,
        onConfirm: y
      }, null, 8, [
        "state",
        "unit",
        "disabled"
      ])) : g("", !0),
      e.state.review ? (a(), Z(Ur, {
        key: 4,
        state: e.state,
        review: e.state.review,
        disabled: e.disabled,
        pending: e.pending,
        onAction: L,
        onConfirm: y,
        onAsk: u[3] || (u[3] = ($, N) => o("ask", $, void 0, N))
      }, null, 8, [
        "state",
        "review",
        "disabled",
        "pending"
      ])) : g("", !0),
      c.value ? (a(), Z(Vt, {
        key: 5,
        state: e.state,
        unit: c.value,
        disabled: e.disabled,
        onConfirm: y
      }, null, 8, [
        "state",
        "unit",
        "disabled"
      ])) : g("", !0),
      c.value?.kind === "reading-writing" ? (a(), Z(br, {
        key: 6,
        "data-learning-unit-id": c.value.id,
        state: e.state,
        unit: c.value,
        disabled: e.disabled,
        pending: e.pending,
        onAction: L,
        onConfirm: y,
        onAsk: u[4] || (u[4] = ($, N) => o("ask", $, N, c.value.id)),
        onAssistant: u[5] || (u[5] = ($) => o("assistant", $, c.value.id)),
        onRecord: u[6] || (u[6] = ($) => o("record", $))
      }, null, 8, [
        "data-learning-unit-id",
        "state",
        "unit",
        "disabled",
        "pending"
      ])) : c.value ? (a(), i("section", {
        key: 7,
        class: "learning-lesson",
        "data-learning-unit-id": c.value.id
      }, [
        n("p", co, "专项小课 · 完成可得 " + r(c.value.reward.amount) + " 小白币", 1),
        n("h1", go, r(c.value.title), 1),
        c.value.goal ? (a(), i("p", po, r(c.value.goal), 1)) : g("", !0),
        (a(!0), i(R, null, D(c.value.materials, ($) => (a(), i("button", {
          key: $.id,
          type: "button",
          class: "learning-activity-link",
          onClick: (N) => o("present", {
            unitId: c.value.id,
            kind: "material",
            id: $.id,
            title: $.title
          })
        }, [
          W(J, { name: "book" }),
          n("span", null, r($.title), 1),
          W(J, { name: "arrow" })
        ], 8, bo))), 128)),
        (a(!0), i(R, null, D(c.value.exercises, ($) => (a(), i("button", {
          key: $.id,
          type: "button",
          class: "learning-activity-link",
          onClick: (N) => o("present", {
            unitId: c.value.id,
            kind: "exercise",
            id: $.id,
            title: $.prompt
          })
        }, [
          W(J, { name: c.value.stage.exercises.find((N) => N.exerciseId === $.id)?.status === "done" ? "check" : "records" }, null, 8, ["name"]),
          n("span", null, r($.prompt), 1),
          W(J, { name: "arrow" })
        ], 8, mo))), 128)),
        n("div", fo, [n("button", {
          type: "button",
          disabled: t("complete"),
          onClick: u[7] || (u[7] = ($) => o("action", "complete"))
        }, r(k.complete), 9, ko), n("button", {
          type: "button",
          onClick: u[8] || (u[8] = ($) => o("go", "materials"))
        }, r(k.notes), 1)])
      ], 8, vo)) : g("", !0),
      b.value ? (a(), i("section", yo, [e.state.blockedUnit ? (a(), i(R, { key: 0 }, [
        u[16] || (u[16] = n("h1", { tabindex: "-1" }, "当前课件在另一个故事中", -1)),
        u[17] || (u[17] = n("p", { class: "learning-muted" }, "回到那个故事可以继续；也可以放下它，在这里重新开始。", -1)),
        n("button", {
          type: "button",
          disabled: t("abandon"),
          onClick: u[9] || (u[9] = ($) => y("abandon", {}, l(ke).lesson))
        }, "放下并重新开始", 8, ho)
      ], 64)) : (a(), i(R, { key: 1 }, [
        c.value ? (a(), i("h2", wo, r(k.next), 1)) : (a(), i("h1", $o, r(k.reading), 1)),
        c.value ? g("", !0) : (a(), i("button", {
          key: 2,
          type: "button",
          class: "learning-start-preference",
          "aria-label": `${k.settings}：${w.value}`,
          onClick: u[10] || (u[10] = ($) => o("go", "settings"))
        }, [n("span", null, [n("strong", null, r(k.settings), 1), n("small", null, r(w.value), 1)]), W(J, { name: "arrow" })], 8, xo)),
        e.state.sourceChoice && !e.preparationInProcess ? (a(), Z(gt, {
          key: 3,
          state: e.state,
          disabled: e.disabled,
          pending: e.pending,
          onAction: L
        }, null, 8, [
          "state",
          "disabled",
          "pending"
        ])) : g("", !0),
        !I.value && !e.state.sourceChoice ? (a(), i(R, { key: 4 }, [n("section", Co, [
          W(J, { name: "workbook" }),
          n("p", null, r(k.readingHint), 1),
          n("button", {
            type: "button",
            class: "learning-primary",
            disabled: t("prepare"),
            onClick: u[11] || (u[11] = ($) => f("reading-writing"))
          }, [H(r(k.start), 1), W(J, { name: "arrow" })], 8, Io)
        ]), n("button", {
          type: "button",
          class: "learning-start-secondary",
          disabled: t("prepare"),
          onClick: u[12] || (u[12] = ($) => f("lesson"))
        }, [
          W(J, { name: "records" }),
          n("span", null, [n("strong", null, r(k.lesson), 1), n("small", null, r(k.lessonHint), 1)]),
          W(J, { name: "arrow" })
        ], 8, Lo)], 64)) : g("", !0)
      ], 64))])) : g("", !0)
    ]));
  }
}), Ao = So;
function Ut(e) {
  try {
    return JSON.parse(e);
  } catch {
    return {};
  }
}
function Ro(e) {
  const v = [];
  for (const s of e.messages) s.role === "assistant" ? v.push({
    message: s,
    results: []
  }) : s.role === "tool" && v.at(-1)?.results.push(s);
  return v.map(({ message: s, results: t }, o) => ({
    index: o + 1,
    text: s.toolCalls?.length ? s.content : "",
    receivedChars: s.receivedChars,
    thinking: s.hasReasoning,
    streaming: !!s.streaming,
    tools: (s.toolCalls ?? []).map((d) => {
      const c = t.find((w) => w.toolCallId === d.id), b = Ut(c?.content ?? ""), I = e.status === "running", k = c?.error || b.ok === !1 ? "failed" : c?.content && !c.streaming ? "done" : !I || s.error ? c ? "cancelled" : "not-run" : c?.streaming ? "running" : "preparing";
      return {
        id: d.id,
        name: d.name,
        status: k,
        input: Ut(d.arguments),
        result: b
      };
    })
  }));
}
var Mo = {
  invalid_arguments: "这次没能正确选择或读取文章来源，可以重试准备。",
  learning_search_failed: "暂时连不上搜索服务，请检查联网取材设置后重试。",
  learning_search_timeout: "搜索文章等了太久，可以重试或先读原创文章。",
  learning_search_not_configured: "还没连接联网取材，请先设置，或改读原创文章。",
  learning_extract_http_failed: "联网服务没能读取正文，请检查联网取材设置后重试。",
  learning_extract_timeout: "读取正文等了太久，可以重试或改读原创文章。",
  learning_extract_failed: "读取正文时连接中断，请检查联网取材连接后重试。",
  learning_extract_invalid_response: "联网服务返回的内容无法作为正文读取，可以重试或改读原创文章。",
  learning_source_unavailable: "这个网页没有读到可用正文，可以换一个来源或改读原创文章。",
  learning_source_too_large: "这个网页内容太多，未能读入。可以换一个来源或改读原创文章。",
  learning_research_failed: "这次联网取材没有完成，可以重试或改读原创文章。"
};
function Eo(e, v) {
  if (e === "learning_extract_http_failed" || e === "learning_search_failed") {
    if (v === 401) return "联网取材的验证没有通过，请检查联网密钥是否有效。";
    if (v === 403) return "联网服务拒绝了这次请求，请检查账号或接口权限；不一定是密钥填错。";
    if (v === 404 || v === 405) return e === "learning_extract_http_failed" ? "当前联网地址不支持读取正文，请检查联网取材地址，或改读原创文章。" : "当前联网地址不支持搜索，请检查联网取材地址，或改读原创文章。";
    if (v === 429) return "联网服务暂时限制了请求，请稍后重试，并检查剩余额度。";
    if (v && v >= 500) return "联网服务暂时不可用，请稍后重试，或先读原创文章。";
  }
  return Mo[e];
}
var No = ["aria-label"], To = { class: "learning-process-header" }, Oo = ["aria-expanded"], Bo = { "aria-hidden": "true" }, qo = ["disabled", "aria-label"], Po = ["aria-label"], _o = ["data-status"], Vo = {
  class: "learning-process-dot",
  "aria-hidden": "true"
}, Uo = { key: 0 }, Do = { class: "learning-process-result" }, jo = {
  key: 1,
  class: "learning-process-status",
  role: "status",
  "aria-live": "polite"
}, Wo = {
  key: 0,
  class: "learning-working-dot",
  "aria-hidden": "true"
}, Go = {
  key: 2,
  class: "learning-process-recovery"
}, Fo = /* @__PURE__ */ ee({
  __name: "LearningProcess",
  props: {
    turn: {},
    stoppable: {
      type: Boolean,
      default: !1
    },
    disabled: {
      type: Boolean,
      default: !1
    }
  },
  emits: ["stop"],
  setup(e, { emit: v }) {
    const s = e, t = v, o = S(() => Ro(s.turn)), d = S(() => o.value.flatMap((u) => u.tools)), c = S(() => s.turn.status === "running"), b = S(() => re.taskTitles[s.turn.purpose]), I = G(null), k = ya(), w = S(() => I.value ?? (c.value || s.turn.status === "failed" || !!k.default)), f = G(null), L = S(() => s.turn.progress?.round ?? o.value.at(-1)?.index), y = S(() => {
      if (!c.value) return ne.outcomes[s.turn.status];
      const u = o.value.at(-1), $ = u?.tools.find((N) => N.status === "running" || N.status === "preparing");
      if ($) return `${ne.tools[$.name] ?? ne.unknownTool} · ${ne[$.status]}`;
      if (s.turn.progress?.stage === "provider" && u?.streaming) {
        if (u.receivedChars) return ne.received(u.receivedChars);
        if (u.thinking) return ne.thinking;
      }
      return Bl(s.turn.progress ?? { stage: "provider" });
    });
    function m(u) {
      const $ = [];
      u.result.error && $.push(Eo(u.result.error, u.result.httpStatus));
      const N = u.result.section ?? u.input.section;
      return N && ne.sections[N] && $.push(ne.sections[N]), u.result.resultsCount !== void 0 && (!u.result.error || u.result.resultsCount > 0) && $.push(u.name === "LearningExtract" ? ne.extracted(u.result.resultsCount) : ne.results(u.result.resultsCount)), u.result.paragraphCount !== void 0 && $.push(ne.paragraphs(u.result.paragraphCount)), u.result.dataCount !== void 0 && $.push(ne.entries(u.result.dataCount)), u.result.failedCount && (!u.result.error || u.result.failedCount > 1) && $.push(ne.sourcesFailed(u.result.failedCount)), u.name === "LearningLessonEdit" && (u.input.materialsCount && $.push(ne.proposedMaterials(u.input.materialsCount)), u.input.exercisesCount && $.push(ne.proposedExercises(u.input.exercisesCount))), $.join(" · ");
    }
    return z(c, () => {
      I.value = null;
    }), z(() => s.turn.messages, async () => {
      const u = f.value, $ = !u || u.scrollHeight - u.scrollTop - u.clientHeight < 48;
      await de(), $ && f.value && (f.value.scrollTop = f.value.scrollHeight);
    }), (u, $) => c.value || d.value.length || u.$slots.default ? (a(), i("section", {
      key: 0,
      class: oe(["learning-process", { "is-running": c.value }]),
      "aria-label": l(ne).title
    }, [
      n("header", To, [n("button", {
        type: "button",
        class: "learning-process-toggle",
        "aria-expanded": w.value,
        onClick: $[0] || ($[0] = (N) => I.value = !w.value)
      }, [
        n("span", Bo, r(w.value ? "⌄" : "›"), 1),
        n("strong", null, r(b.value ?? l(ne).title), 1),
        n("small", null, r(c.value && L.value ? l(ne).round(L.value) : l(ne).history(d.value.length)), 1)
      ], 8, Oo), c.value && e.stoppable ? (a(), i("button", {
        key: 0,
        type: "button",
        class: "learning-process-stop",
        disabled: e.disabled,
        "aria-label": l(ne).stop,
        onClick: $[1] || ($[1] = (N) => t("stop"))
      }, "■", 8, qo)) : g("", !0)]),
      w.value ? (a(), i("div", {
        key: 0,
        ref_key: "body",
        ref: f,
        class: "learning-process-body"
      }, [(a(!0), i(R, null, D(o.value, (N) => (a(), i(R, { key: N.index }, [N.text ? (a(), Z(bt, {
        key: 0,
        class: "learning-markdown learning-process-narration",
        text: N.text
      }, null, 8, ["text"])) : g("", !0), N.tools.length ? (a(), i("ol", {
        key: 1,
        class: "learning-process-steps",
        "aria-label": l(ne).round(N.index)
      }, [(a(!0), i(R, null, D(N.tools, (j) => (a(), i("li", {
        key: j.id,
        "data-status": j.status
      }, [
        n("span", Vo, r(j.status === "done" ? "✓" : j.status === "failed" ? "!" : "·"), 1),
        n("div", null, [
          n("span", null, r(l(ne).tools[j.name] ?? l(ne).unknownTool), 1),
          m(j) ? (a(), i("small", Uo, r(m(j)), 1)) : g("", !0),
          (a(!0), i(R, null, D(j.result.errors, (B, Q) => (a(), i("small", {
            key: Q,
            class: "learning-process-error"
          }, r(B.message), 1))), 128))
        ]),
        n("small", Do, r(l(ne)[j.status]), 1)
      ], 8, _o))), 128))], 8, Po)) : g("", !0)], 64))), 128))], 512)) : g("", !0),
      c.value || !u.$slots.default && e.turn.status === "finished" && (!b.value || w.value) ? (a(), i("p", jo, [c.value ? (a(), i("span", Wo)) : g("", !0), H(r(y.value), 1)])) : g("", !0),
      u.$slots.default ? (a(), i("div", Go, [ka(u.$slots, "default")])) : g("", !0)
    ], 10, No)) : g("", !0);
  }
}), da = Fo;
function De(e, v, s) {
  return e.notice === "history-save" && v !== "ready" || e.notice === "learning-save" && s !== "ready" ? "" : e.message;
}
function we(e) {
  return e.kind === "prepare";
}
function tt(e) {
  return e.kind === "talk" || e.kind === "companion" || e.kind === "task-result";
}
var Dt = {
  initial: "我想跟你学这门语言，先聊聊吧。",
  returning: "我来继续学语言了，先聊聊今天从哪里开始吧。"
}, Ho = { class: "learning-messages" }, Yo = /* @__PURE__ */ ee({
  __name: "LearningMessages",
  props: {
    turn: {},
    disabled: { type: Boolean }
  },
  emits: ["stop"],
  setup(e, { emit: v }) {
    const s = e, t = v, o = S(() => s.turn.messages.filter((d) => d.role === "assistant" && !d.toolCalls?.length && d.content));
    return (d, c) => (a(), i("div", Ho, [W(da, {
      turn: e.turn,
      stoppable: "",
      disabled: e.disabled,
      onStop: c[0] || (c[0] = (b) => t("stop"))
    }, null, 8, ["turn", "disabled"]), (a(!0), i(R, null, D(o.value, (b, I) => (a(), i("div", {
      key: I,
      class: oe(["learning-output", { "is-streaming": b.streaming }])
    }, [W(bt, {
      class: "learning-markdown",
      text: b.content
    }, null, 8, ["text"])], 2))), 128))]));
  }
}), zo = Yo, Ko = {
  workbench: "学习助手",
  companion: "语伴",
  historyLoadFailed: "暂时没能打开对话记录，请重新加载。学习内容保留。",
  historySaveFailed: "回复已收到，但这段对话还没有保存。请检查保存状态，回复不需要重新生成。",
  stopped: "已停止回复，已收到的内容保留。",
  retryUnavailable: "这条消息已不能重试，请先检查保存状态，或在当前对话里重新提问。",
  workStopped: "已停止。已保存的学习内容保留。",
  changed: "学习内容已变化，这次操作没有继续。",
  delegatedBusy: "当前训练操作尚未完成，这次委托没有执行。",
  notificationFailed: "工作台的结果已保留，但语伴还没收到。可以重试通知，不会重新执行任务。",
  notificationRetry: "重试通知",
  memoryClearFailed: "对话记录尚未确认清理，请检查保存状态。",
  learningSaveUnconfirmed: "学习修改尚未确认保存，请检查保存。",
  learningSaveConflict: "学习记录有冲突，请检查保存。",
  learningSaveRecovered: "已确认刚才的修改保存成功。这次工作中途停下了，可以接着提出未完成的要求。"
};
function Jo(e, v) {
  if (!e || e.id !== v?.unitId || !v.exerciseId || !e.exercises.some((t) => t.id === v.exerciseId)) return null;
  const s = {
    exerciseId: v.exerciseId,
    text: v.text,
    selection: v.selection ?? null
  };
  return {
    note: s,
    saved: e.notes?.some((t) => t.exerciseId === s.exerciseId && t.text === s.text && JSON.stringify(t.selection) === JSON.stringify(s.selection)) ?? !1
  };
}
var Zo = { class: "learning-conversation" }, Qo = { class: "learning-conversation-heading" }, Xo = {
  class: "learning-person-initial",
  "aria-hidden": "true"
}, eu = ["disabled"], tu = ["aria-label"], au = ["aria-label"], nu = {
  key: 0,
  class: "learning-history-notice"
}, iu = {
  key: 0,
  class: "learning-conversation-user"
}, lu = {
  key: 1,
  class: "learning-turn-recovery"
}, su = ["disabled", "onClick"], ru = ["disabled", "onClick"], ou = {
  key: 3,
  class: "learning-conversation-tools"
}, uu = ["disabled", "onClick"], du = ["disabled", "onClick"], vu = {
  key: 1,
  class: "learning-working",
  role: "status"
}, cu = {
  key: 2,
  class: "learning-turn-notice is-error",
  role: "status"
}, gu = {
  class: "learning-turn-notice is-error",
  role: "status"
}, pu = ["disabled", "onClick"], bu = {
  key: 3,
  class: "learning-conversation-empty"
}, mu = ["disabled"], fu = { class: "learning-composer-surface" }, ku = {
  key: 0,
  class: "learning-composer-quote"
}, yu = { class: "learning-composer-row" }, hu = [
  "disabled",
  "maxlength",
  "aria-label",
  "placeholder"
], $u = [
  "type",
  "disabled",
  "aria-label",
  "title"
], wu = /* @__PURE__ */ ee({
  __name: "LearningConversation",
  props: {
    target: {},
    state: {},
    disabled: { type: Boolean },
    pending: { type: Boolean }
  },
  emits: [
    "action",
    "present",
    "profile",
    "close"
  ],
  setup(e, { expose: v, emit: s }) {
    const t = e, o = S(() => t.target === "workbench" ? t.state.workbenchConversation : t.state.conversation), d = S(() => t.target === "workbench" ? t.state.workbenchBusy : t.state.chatBusy), c = S(() => t.target === "workbench" ? t.state.workbenchMessage : t.state.chatMessage), b = S(() => t.target === "companion" ? t.state.delegatedTasks.filter((V) => V.notification === "failed") : []), I = S(() => t.target === "workbench" ? t.state.workbenchStorage : t.state.chatStorage), k = S(() => t.target === "workbench" ? t.state.reply : t.state.companionReply), w = S(() => t.target === "workbench" ? te.assistant : t.state.teacher?.name ?? "语伴"), f = S(() => o.value.turns.map((V, F) => ({
      turn: V,
      index: F
    })).filter(({ turn: V }) => !we({ kind: V.purpose ?? "talk" }) || V.status === "running")), L = {
      conversation: "和语伴聊天",
      history: "更早的聊天已收起",
      empty: "今天想聊什么？",
      select: "先选一位语伴",
      opening: "打个招呼"
    }, y = /* @__PURE__ */ new Set([
      "prepare",
      "complete",
      "grade",
      "revision-review",
      "model-essay",
      "review-prepare",
      "review-assess",
      "companion"
    ]), m = s, u = Oe(), $ = t.target === "workbench" ? u.workbenchChat : u.chat, N = (V, F = {}) => m("action", V, {
      ...F,
      target: t.target
    }), j = ye($, "text"), B = G(null), Q = G(null), X = G(null), M = ye($, "focus");
    let x = null, C = 0;
    function q() {
      const V = X.value;
      V && ($.scroll = V.scrollTop, $.following = V.scrollHeight - V.scrollTop - V.clientHeight < 70);
    }
    async function K() {
      await de(), $.following && X.value && (X.value.scrollTop = X.value.scrollHeight);
    }
    function O() {
      const V = B.value;
      V?.clientWidth && (V.style.height = "auto", V.style.height = `${V.scrollHeight}px`, K());
    }
    z(j, O, { flush: "post" }), z(B, (V) => {
      if (x?.disconnect(), cancelAnimationFrame(C), !V) return;
      let F = 0;
      x = new ResizeObserver(([U]) => {
        U.contentRect.width !== F && (F = U.contentRect.width, cancelAnimationFrame(C), C = requestAnimationFrame(O));
      }), x.observe(V.parentElement);
    }, { flush: "post" }), Te(() => {
      X.value && (X.value.scrollTop = $.scroll), K();
    }), Ne(() => {
      X.value && ($.scroll = X.value.scrollTop), x?.disconnect(), cancelAnimationFrame(C);
    });
    function T() {
      if (t.disabled || !j.value.trim()) return;
      const V = j.value.trim();
      $.sent = {
        text: j.value,
        user: M.value?.selection ? `${V}

${M.value.selection.quote}` : V,
        after: o.value.turns.length + o.value.removedTurns
      }, $.following = !0, N("talk", {
        message: V,
        ...M.value ?? $.study ?? {}
      });
    }
    function _(V) {
      V.key !== "Enter" || V.shiftKey || V.isComposing || V.keyCode === 229 || (V.preventDefault(), T());
    }
    z([() => o.value.turns, () => d.value], K);
    function P(V) {
      const F = [t.state.unit, t.state.review].find((U) => U?.id === V.unitId);
      return !!F && (V.kind === "exercise" ? F.exercises : F.materials).some((U) => U.id === V.id);
    }
    const E = S(() => t.state.unit?.id === k.value?.unitId ? t.state.unit : null), Y = S(() => Jo(E.value, k.value));
    return v({
      async ask(V, F, U = t.state.unit?.id) {
        M.value = {
          unitId: U,
          exerciseId: V,
          selection: F,
          help: !!V && !F
        }, $.study = U ? {
          unitId: U,
          exerciseId: V
        } : null, await de(), B.value?.focus();
      },
      focusHeading: () => Q.value?.focus({ preventScroll: !0 })
    }), (V, F) => (a(), i("section", Zo, [
      n("header", Qo, [
        n("span", Xo, r(e.target === "workbench" ? "a" : [...w.value][0]), 1),
        n("h1", {
          ref_key: "heading",
          ref: Q,
          tabindex: "-1"
        }, r(w.value), 513),
        e.target === "companion" ? (a(), i("button", {
          key: 0,
          type: "button",
          disabled: e.disabled,
          "aria-label": "更换学习语言和语伴",
          onClick: F[0] || (F[0] = (U) => m("profile"))
        }, r(new Intl.DisplayNames(["zh-CN"], { type: "language" }).of(e.state.language)), 9, eu)) : (a(), i("button", {
          key: 1,
          type: "button",
          "aria-label": l(te).closeAssistant,
          onClick: F[1] || (F[1] = (U) => m("close"))
        }, [W(J, { name: "close" })], 8, tu))
      ]),
      n("div", {
        ref_key: "scroller",
        ref: X,
        class: "learning-conversation-turns",
        "aria-label": e.target === "workbench" ? l(te).assistant : L.conversation,
        onScroll: q
      }, [
        o.value.removedTurns ? (a(), i("p", nu, r(L.history), 1)) : g("", !0),
        (a(!0), i(R, null, D(f.value, ({ turn: U, index: Le }, Se) => (a(), i("div", {
          key: o.value.removedTurns + Le,
          class: "learning-conversation-turn"
        }, [
          U.user && !l(y).has(U.purpose) && !l(we)({ kind: U.purpose ?? "talk" }) ? (a(), i("p", iu, r(U.user), 1)) : g("", !0),
          W(zo, {
            turn: U,
            disabled: e.pending,
            onStop: (he) => N(l(tt)({ kind: U.purpose ?? "talk" }) ? "cancel-chat" : l(we)({ kind: U.purpose ?? "talk" }) ? "cancel-preparation" : "cancel")
          }, null, 8, [
            "turn",
            "disabled",
            "onStop"
          ]),
          U.purpose !== "task-result" && (l(De)(U, I.value, e.state.storage) || U.retryable) ? (a(), i("div", lu, [l(De)(U, I.value, e.state.storage) ? (a(), i("p", {
            key: 0,
            class: oe(["learning-turn-notice", { "is-error": U.status === "failed" }]),
            role: "status"
          }, r(l(De)(U, I.value, e.state.storage)), 3)) : g("", !0), U.retryable ? (a(), i("button", {
            key: 1,
            type: "button",
            disabled: e.disabled || e.pending,
            onClick: (he) => N("retry-chat", { id: U.id })
          }, r(l(te).retry), 9, su)) : g("", !0)])) : g("", !0),
          U.presentation ? (a(), i("button", {
            key: 2,
            type: "button",
            class: "learning-activity-link",
            disabled: !P(U.presentation),
            onClick: (he) => m("present", U.presentation)
          }, [
            W(J, { name: U.presentation.kind === "material" ? "book" : "records" }, null, 8, ["name"]),
            n("span", null, r(U.presentation.title), 1),
            W(J, { name: "arrow" })
          ], 8, ru)) : g("", !0),
          Se === f.value.length - 1 && k.value && k.value.id === U.id ? (a(), i("div", ou, [[...U.teacher].length <= 1e3 ? (a(), i("button", {
            key: 0,
            type: "button",
            disabled: e.disabled,
            onClick: (he) => N("say-reply", { id: U.id })
          }, [W(J, { name: "sound" }), H(r(l(te).listen), 1)], 8, uu)) : g("", !0), Y.value && E.value && [...U.teacher].length <= 4e3 ? (a(), i("button", {
            key: 1,
            type: "button",
            disabled: e.disabled || Y.value.saved,
            onClick: (he) => N("save-note", {
              id: U.id,
              unitId: E.value.id
            })
          }, r(l(te).saveNote), 9, du)) : g("", !0)])) : g("", !0)
        ]))), 128)),
        d.value && !o.value.turns.some((U) => U.status === "running" && l(tt)({ kind: U.purpose ?? "talk" })) ? (a(), i("div", vu, [F[7] || (F[7] = n("span", {
          class: "learning-working-dot",
          "aria-hidden": "true"
        }, null, -1)), n("span", null, r(c.value), 1)])) : !d.value && c.value && I.value === "ready" ? (a(), i("p", cu, r(c.value), 1)) : g("", !0),
        (a(!0), i(R, null, D(b.value, (U) => (a(), i("div", {
          key: U.taskId,
          class: "learning-turn-recovery"
        }, [n("p", gu, r(U.notificationError), 1), n("button", {
          type: "button",
          disabled: e.pending || e.state.chatBusy || !["ready", "unconfirmed"].includes(I.value),
          onClick: (Le) => N("retry-notification", { id: U.taskId })
        }, r(l(Ko).notificationRetry), 9, pu)]))), 128)),
        !f.value.length && !d.value ? (a(), i("div", bu, [
          W(J, { name: "chat" }),
          n("p", null, r(e.target === "workbench" ? l(te).assistantEmpty : e.state.teacher ? L.empty : L.select), 1),
          e.target === "companion" && !e.state.teacher ? (a(), i("button", {
            key: 0,
            class: "learning-primary",
            type: "button",
            onClick: F[2] || (F[2] = (U) => m("profile"))
          }, r(L.select), 1)) : e.target === "companion" ? (a(), i("button", {
            key: 1,
            type: "button",
            disabled: e.disabled,
            onClick: F[3] || (F[3] = (U) => N("talk", { message: e.state.profile ? l(Dt).returning : l(Dt).initial }))
          }, r(L.opening), 9, mu)) : g("", !0)
        ])) : g("", !0)
      ], 40, au),
      e.target === "workbench" || e.state.teacher ? (a(), i("form", {
        key: 0,
        class: "learning-conversation-compose",
        onSubmit: ve(T, ["prevent"])
      }, [n("div", fu, [M.value ? (a(), i("div", ku, [n("span", null, r(M.value.selection?.quote ?? "请教这道题"), 1), n("button", {
        type: "button",
        "aria-label": "取消引用",
        onClick: F[4] || (F[4] = (U) => M.value = null)
      }, "×")])) : g("", !0), n("div", yu, [le(n("textarea", {
        ref_key: "composer",
        ref: B,
        "onUpdate:modelValue": F[5] || (F[5] = (U) => j.value = U),
        rows: "1",
        disabled: I.value !== "ready",
        maxlength: M.value?.selection ? 1800 : M.value?.exerciseId ? 2e3 : 4e3,
        "aria-label": e.target === "workbench" ? l(te).assistantPlaceholder : "和语伴说",
        placeholder: e.target === "workbench" ? l(te).assistantPlaceholder : "和语伴说…",
        onKeydown: _
      }, null, 40, hu), [[pe, j.value], [l(at), l($)]]), n("button", {
        type: d.value ? "button" : "submit",
        class: oe(d.value ? "learning-composer-stop" : "learning-primary"),
        disabled: d.value ? e.pending : e.disabled || !j.value.trim(),
        "aria-label": d.value ? l(te).stop : l(te).send,
        title: d.value ? l(te).stop : l(te).send,
        onClick: F[6] || (F[6] = ve((U) => d.value ? N("cancel-chat") : T(), ["prevent"]))
      }, [W(J, { name: d.value ? "stop" : "send" }, null, 8, ["name"])], 10, $u)])])], 32)) : g("", !0)
    ]));
  }
}), jt = wu;
function xu(e) {
  const v = ha(structuredClone(Ca(e.initialState))), s = G(!1), t = G(null), o = S(() => t.value ? zt[t.value] : ""), d = S(() => t.value === "unknown" || t.value === "rejected");
  let c = !1, b = 0, I = () => {
  };
  const k = (y) => !s.value && fe(y, v.value), w = S(() => k("submit")), f = S(() => k("talk"));
  async function L(y, m = {}) {
    if (s.value) return;
    if (Qe(Hs(y, m.target), v.value)) {
      t.value = "busy";
      return;
    }
    s.value = !0, t.value = null;
    const u = v.value.chatIdentity, $ = b;
    let N = !1;
    try {
      const j = JSON.parse(JSON.stringify({
        chatIdentity: u,
        ...m
      }));
      N = !0;
      const B = await e.bridge.request(`learning/${y}`, j, 35e3);
      return !c || v.value.chatIdentity !== u ? void 0 : (b === $ && B.result.state.chatIdentity === u && (v.value = B.result.state), B.result.rejected && (t.value = B.result.rejected), B.result);
    } catch (j) {
      c && v.value.chatIdentity === u && (t.value = !N || j instanceof La && j.code === "host_request_not_sent" ? "notSent" : j instanceof Ia ? "rejected" : "unknown");
    } finally {
      c && (s.value = !1);
    }
  }
  return Te(() => {
    c = !0, I = e.bridge.subscribe((y) => {
      if (y.type === "learning/media") {
        v.value = {
          ...v.value,
          media: y.payload.media
        };
        return;
      }
      if (y.type !== "learning/state") return;
      const m = y.payload.state;
      m.chatIdentity === v.value.chatIdentity && (b++, v.value = m);
    });
  }), Ne(() => {
    c = !1, I();
  }), {
    state: v,
    pending: s,
    writable: w,
    canChat: f,
    canRequest: k,
    localIssue: t,
    localMessage: o,
    needsRefresh: d,
    request: L
  };
}
function Cu(e = Math.random) {
  return Math.round(3 * 6e4 + Math.min(Math.max(e(), 0), 1) * 9 * 6e4);
}
function Iu(e) {
  let v = !1, s, t = 0;
  function o() {
    s !== void 0 && (e.clearTimer(s), s = void 0);
  }
  function d() {
    if (!v) return;
    const c = t;
    s = e.setTimer(() => {
      c === t && (s = void 0, v && (e.opportunity(), d()));
    }, Cu(e.random));
  }
  return {
    update(c) {
      v !== c && (v = c, t++, o(), d());
    },
    dispose() {
      v = !1, t++, o();
    }
  };
}
function Lu(e) {
  const v = G(!1), s = G(!1), t = G(!1), o = G(!1), d = G("");
  let c, b;
  const I = S(() => e.preference.enabled && e.reading.value && v.value && !e.blocked.value && !!e.state.value.teacher && e.state.value.storage === "ready"), k = S(() => I.value && !s.value && !t.value && !o.value && !e.pending.value && !e.state.value.busy && !e.state.value.chatBusy && !e.state.value.companionBusy);
  function w() {
    const B = e.root.value?.querySelector(".learning-scroll")?.getBoundingClientRect(), Q = B?.top ?? 0, X = [...e.root.value?.querySelectorAll("[data-material-id][data-paragraph-id]") ?? []].find((M) => M.getBoundingClientRect().bottom > Q + 60 && M.getBoundingClientRect().top < (B?.bottom ?? 0));
    return X ? {
      materialId: X.dataset.materialId,
      paragraphId: X.dataset.paragraphId
    } : null;
  }
  const f = Iu({
    setTimer: (B, Q) => setTimeout(B, Q),
    clearTimer: (B) => clearTimeout(B),
    opportunity: () => {
      const B = w();
      B && e.request("companion", B);
    }
  });
  z(k, (B) => f.update(B), { immediate: !0 }), z([
    I,
    s,
    t,
    o,
    e.pending,
    () => e.state.value.companionBusy
  ], ([B, Q, X, M, x, C]) => {
    C && !x && (!B || Q || X || M) && e.request("cancel-companion");
  });
  function L() {
    const B = document.activeElement;
    s.value = B instanceof HTMLElement && !!e.root.value?.contains(B) && B.matches("textarea, input:not([type=checkbox],[type=radio],[type=range]), [contenteditable=true]");
  }
  const y = () => queueMicrotask(L);
  function m() {
    const B = document.getSelection();
    t.value = !!B && !B.isCollapsed && !!e.root.value?.contains(B.anchorNode);
  }
  function u() {
    clearTimeout(c), o.value = !0, c = setTimeout(() => {
      o.value = !1;
    }, 3e4);
  }
  function $(B) {
    !(B.target instanceof HTMLElement) || !B.target.matches("textarea, input:not([type=checkbox],[type=radio],[type=range]), [contenteditable=true]") || u();
  }
  function N() {
    v.value = document.visibilityState === "visible", v.value || (clearTimeout(c), o.value = !1, j()), L();
  }
  function j() {
    clearTimeout(b), d.value = "";
  }
  return z(() => e.state.value.remark?.text ?? "", (B) => {
    j(), B && e.reading.value && v.value && !s.value && !t.value && !o.value && !e.blocked.value && (d.value = B, b = setTimeout(j, 1e4));
  }), z([
    e.reading,
    e.blocked,
    s,
    t,
    o
  ], ([B, Q, X, M, x]) => {
    (!B || Q || X || M || x) && j();
  }), Te(() => {
    N(), document.addEventListener("visibilitychange", N), document.addEventListener("selectionchange", m), e.root.value?.addEventListener("pointerdown", u), e.root.value?.addEventListener("focusin", y), e.root.value?.addEventListener("focusout", y), e.root.value?.addEventListener("input", $);
  }), Ne(() => {
    f.dispose(), clearTimeout(c), j(), document.removeEventListener("visibilitychange", N), document.removeEventListener("selectionchange", m), e.root.value?.removeEventListener("pointerdown", u), e.root.value?.removeEventListener("focusin", y), e.root.value?.removeEventListener("focusout", y), e.root.value?.removeEventListener("input", $);
  }), {
    bubble: d,
    dismiss: j
  };
}
var Su = { class: "learning-toolbar" }, Au = {
  key: 0,
  class: "learning-unread-dot",
  "aria-hidden": "true"
}, Ru = {
  key: 1,
  class: "learning-layout-control"
}, Mu = ["min", "max"], Eu = ["aria-label", "aria-expanded"], Nu = { "aria-label": "学习资料与设置" }, Tu = { "aria-label": "学习资料与设置" }, Ou = ["onClick"], Bu = {
  key: 0,
  class: "learning-notice",
  role: "status",
  "aria-live": "polite"
}, qu = { class: "learning-row" }, Pu = ["disabled"], _u = ["disabled"], Vu = ["disabled"], Uu = ["disabled"], Du = ["disabled"], ju = {
  key: 1,
  class: "learning-notice",
  role: "status",
  "aria-live": "polite"
}, Wu = { class: "learning-row" }, Gu = ["disabled"], Fu = ["disabled"], Hu = {
  key: 2,
  class: "learning-notice",
  role: "status"
}, Yu = ["disabled"], zu = ["disabled"], Ku = ["inert", "aria-hidden"], Ju = ["inert", "aria-hidden"], Zu = {
  key: 2,
  class: "learning-working",
  role: "status"
}, Qu = ["disabled"], Xu = {
  key: 5,
  class: "learning-materials-page"
}, ed = {
  key: 0,
  class: "learning-empty-note"
}, td = { class: "learning-materials-title" }, ad = ["onClick"], nd = ["onClick"], id = {
  key: 0,
  class: "learning-notes"
}, ld = { key: 0 }, sd = ["disabled", "onClick"], rd = {
  key: 7,
  class: "learning-harvest-page"
}, od = {
  key: 0,
  class: "learning-empty-note"
}, ud = { key: 0 }, dd = { class: "learning-muted" }, vd = ["disabled", "onClick"], cd = ["disabled"], gd = ["disabled"], pd = {
  key: 3,
  class: "learning-row"
}, bd = ["disabled"], md = ["disabled"], fd = {
  key: 8,
  class: "learning-settings-page"
}, kd = ["value", "disabled"], yd = ["value"], hd = {
  key: 0,
  class: "learning-settings-goal"
}, $d = {
  key: 0,
  class: "learning-muted"
}, wd = ["value", "disabled"], xd = ["disabled"], Cd = ["disabled"], Id = ["disabled"], Ld = ["disabled"], Sd = ["disabled"], Ad = ["disabled"], Rd = ["disabled"], Md = ["disabled"], Ed = ["inert", "aria-hidden"], Nd = ["aria-label"], Td = { class: "learning-person-initial" }, Od = {
  key: 0,
  class: "learning-unread-dot",
  "aria-hidden": "true"
}, Bd = ["aria-label"], qd = {
  key: 0,
  class: "learning-unread-dot",
  "aria-hidden": "true"
}, Pd = {
  role: "alertdialog",
  "aria-labelledby": "learning-confirm-title",
  class: "learning-confirm"
}, _d = { id: "learning-confirm-title" }, Vd = { class: "learning-row" }, Ud = ["disabled"], Dd = /* @__PURE__ */ ee({
  __name: "LearningApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(e) {
    const v = e, s = {
      cancel: "取消",
      working: "正在准备学习内容…",
      verify: "查看保存结果",
      retry: "重新保存",
      adopt: "使用已保存记录",
      adoptWarning: "这次尚未保存成功的修改将被放弃，改用已保存的学习记录。",
      replaceWarning: "新练习准备好后，会替换这次的材料、作答和笔记。学习本中的记录和已获得的奖励会保留。",
      verifyWallet: "查看钱包状态",
      adoptWallet: "使用已保存钱包",
      adoptWalletWarning: "这次尚未保存成功的钱包修改将被放弃，改用已保存的钱包。",
      voiceDisabled: "还没有开启语音，文字学习不受影响。"
    }, { state: t, pending: o, writable: d, canChat: c, canRequest: b, localMessage: I, needsRefresh: k, request: w } = xu(v), f = En(t), L = G(!1);
    async function y(A, p = {}, h = !1) {
      if (!h && Mn(f, t.value, A, p)) {
        ge(A, p, A === "teacher" ? ke.companion : ke.context);
        return;
      }
      return A === "reset-learning" ? L.value = !0 : A === "cancel" && (L.value = !1), w(A, p);
    }
    const m = G(t.value.profile ? "home" : "profile"), u = [], $ = G(null), N = G(!1);
    Xe(() => $.value?.open ? ($.value.open = !1, !0) : !1, () => N.value);
    const j = G(null), B = G(null), Q = G(!1), X = G(null), M = G(null), x = G(null), C = {}, q = G(null), K = G(0), O = S(() => K.value >= 760 && !!t.value.teacher), T = G("work"), _ = G(!0), P = G(!1), E = G(62), Y = S(() => Math.max(42, Math.ceil(320 / Math.max(K.value, 1) * 100))), V = S(() => Math.min(68, Math.floor((1 - 320 / Math.max(K.value, 1)) * 100))), F = S({
      get: () => O.value ? Math.min(V.value, Math.max(Y.value, E.value)) : E.value,
      set: (A) => {
        E.value = A;
      }
    }), U = G(!1);
    let Le, Se;
    const he = () => {
      U.value = Se?.matches ?? !1;
    };
    Te(() => {
      Se = matchMedia("(prefers-reduced-motion: reduce)"), he(), Se.addEventListener("change", he), !(!q.value || typeof ResizeObserver > "u") && (Le = new ResizeObserver(([A]) => {
        K.value = A?.contentRect.width ?? 0;
      }), Le.observe(q.value));
    }), Ne(() => {
      Le?.disconnect(), Se?.removeEventListener("change", he);
    });
    const ue = S(() => O.value || T.value === "work"), je = S(() => !!t.value.teacher && (O.value || T.value === "chat"));
    z([
      ue,
      je,
      U
    ], async ([A, p, h], ie, ze) => {
      let Ve = !0, At;
      if (ze(() => {
        Ve = !1, clearTimeout(At);
      }), A && (_.value = !0), p && (P.value = !0), await de(), !Ve) return;
      A && x.value && (x.value.scrollTop = C[m.value] ?? 0);
      const Rt = () => {
        _.value = A, P.value = p;
      };
      O.value || h ? Rt() : At = setTimeout(Rt, 320);
    }, { immediate: !0 });
    function We() {
      ue.value && x.value && !Q.value && (C[m.value] = x.value.scrollTop), qe();
    }
    async function qe(A) {
      const p = A?.target instanceof Element ? A.target : null;
      if (await de(), ue.value && M.value) {
        f.chat.study = {
          unitId: M.value.unitId,
          exerciseId: M.value.kind === "exercise" ? M.value.id : void 0
        };
        return;
      }
      if (!ue.value || m.value !== "home" || !x.value) return;
      const h = x.value.getBoundingClientRect(), ie = p?.closest("[data-learning-unit-id]") ?? [...x.value.querySelectorAll("[data-learning-unit-id]")].find((ze) => {
        const Ve = ze.getBoundingClientRect();
        return Ve.bottom > h.top + 48 && Ve.top < h.bottom;
      });
      ie?.dataset.learningUnitId && (f.chat.study = {
        unitId: ie.dataset.learningUnitId,
        exerciseId: ie.dataset.exerciseId
      });
    }
    z([
      x,
      m,
      ue
    ], () => {
      qe();
    }, { flush: "post" });
    const nt = S(() => {
      const { turns: A, removedTurns: p } = t.value.conversation;
      let h = A.length - 1;
      for (; h >= 0 && we({ kind: A[h].purpose ?? "talk" }); ) h--;
      return h < 0 ? 0 : p + h + 1;
    }), it = G(nt.value);
    z([nt, je], ([A, p]) => {
      (p || A < it.value) && (it.value = A);
    }, { immediate: !0 });
    const ht = S(() => nt.value > it.value), ce = S(() => {
      const A = t.value.workbenchConversation.turns;
      let p = A.length - 1;
      for (; p >= 0 && tt({ kind: A[p].purpose ?? "talk" }); ) p--;
      let h = A.length - 1;
      for (; h >= 0 && (A[h].status !== "running" || tt({ kind: A[h].purpose ?? "talk" })); ) h--;
      return h >= 0 && (p = h), p < 0 ? null : {
        turn: t.value.workbenchConversation.turns[p],
        key: `${t.value.chatIdentity}:${t.value.language}:${t.value.workbenchConversation.removedTurns + p}`
      };
    });
    async function $t() {
      t.value.teacher && (await qe(), We(), T.value = "chat", P.value = !0, await de(), T.value === "chat" && j.value?.focusHeading());
    }
    async function Pe() {
      if (_.value = !0, T.value = "work", await de(), x.value && (x.value.scrollTop = C[m.value] ?? 0), M.value) return;
      const A = x.value?.querySelector("h1, h2");
      A && (A.tabIndex = -1, A.focus({ preventScroll: !0 }));
    }
    let wt = 0;
    z(() => !!t.value.record, async (A, p) => {
      m.value !== "books" || A === p || (A && (wt = x.value?.scrollTop ?? 0), await de(), m.value === "books" && x.value && (x.value.scrollTop = A ? 0 : wt));
    });
    const se = G(null), xt = G(null);
    pt(xt, () => {
      se.value = null;
    });
    const Ge = G(t.value.profile?.voice?.voiceId ?? t.value.voices.defaultVoice), Fe = G(t.value.profile?.voice?.language ?? t.value.language), He = G(t.value.profile?.voice?.speed ?? 1), xe = G(0), va = S(() => t.value.completions.slice(xe.value * 20, (xe.value + 1) * 20));
    z([() => t.value.language, () => t.value.profile?.voice], ([A, p]) => {
      Ge.value = p?.voiceId ?? t.value.voices.defaultVoice, Fe.value = p?.language ?? A, He.value = p?.speed ?? 1;
    }), z([
      () => t.value.chatIdentity,
      () => t.value.language,
      () => t.value.teacher?.name
    ], () => {
      M.value = null, se.value = null, xe.value = 0;
    }), z(() => !!t.value.teacher, (A) => {
      A || (T.value = "work");
    }), z(() => t.value.currentUnitId, (A) => {
      se.value?.action === "replace-lesson" && se.value.input.unitId !== A && (se.value = null);
    }), z(() => t.value.unit, (A) => {
      const p = M.value;
      p && (A?.id !== p.unitId || !(p.kind === "exercise" ? A.exercises : A.materials).some((h) => h.id === p.id)) && _e();
    });
    for (const A of ["conversation", "workbenchConversation"]) z(() => {
      const p = t.value[A].turns.at(-1)?.presentation;
      return p ? `${t.value[A].turns.length + t.value[A].removedTurns}:${p.unitId}:${p.kind}:${p.id}` : "";
    }, (p) => {
      const h = t.value[A].turns.at(-1)?.presentation;
      p && h && Ae(h, !0);
    });
    const Ce = G(!1);
    z([ue, m], ([A, p]) => {
      A && p === "home" && (Ce.value = !1);
    });
    async function Ae(A, p = !1) {
      if (t.value.review?.id === A.unitId) {
        if (p) {
          (!ue.value || m.value !== "home") && (Ce.value = !0);
          return;
        }
        const h = f.unit(A.unitId).review;
        A.kind === "exercise" && (h.index = t.value.review.exercises.findIndex((ie) => ie.id === A.id)), h.expanded = !0, await rt();
        return;
      }
      if (t.value.unit?.id === A.unitId) {
        if (t.value.unit.kind === "reading-writing") {
          if (p) {
            (!ue.value || m.value !== "home") && (Ce.value = !0);
            return;
          }
          f.unit(A.unitId).reading.view = "reading", await be("home");
          const h = A.kind === "exercise" ? `[data-exercise-id="${CSS.escape(A.id)}"]` : `[data-material-id="${CSS.escape(A.id)}"][data-paragraph-id]`;
          x.value?.querySelector(h)?.scrollIntoView({
            block: "start",
            behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
          });
          return;
        }
        M.value = A, p ? ue.value || (Ce.value = !0) : await Pe();
      }
    }
    function _e() {
      M.value = null, y("stop");
    }
    async function lt(A, p) {
      M.value && _e(), Q.value || We(), Q.value = !0, await Pe(), await de(), A ? await B.value?.ask(A, void 0, p) : B.value?.focusHeading();
    }
    async function st() {
      Q.value = !1, await de(), x.value && (x.value.scrollTop = C[m.value] ?? 0), X.value?.focus({ preventScroll: !0 });
    }
    async function Ct(A, p, h) {
      if (!t.value.teacher) {
        await lt(A, h), p && await B.value?.ask(A, p, h);
        return;
      }
      _e(), We(), T.value = "chat", P.value = !0, await de(), await j.value?.ask(A, p, h);
    }
    async function be(A, p = !1) {
      if (M.value && _e(), Q.value = !1, A !== m.value && !p) if (A === "home") u.length = 0;
      else {
        const h = u.indexOf(A);
        h >= 0 ? u.splice(h) : u.push(m.value);
      }
      if (x.value && (C[m.value] = x.value.scrollTop), $.value && ($.value.open = !1), m.value = A, await Pe(), await de(), x.value) {
        x.value.scrollTop = C[A] ?? 0;
        const h = [...x.value.querySelectorAll("h1, h2")].find((ie) => ie.offsetParent !== null);
        h && (h.tabIndex = -1, h.focus({ preventScroll: !0 }));
      }
    }
    function It() {
      f.setup.step = 0, be("profile");
    }
    z([t, o], ([A, p]) => {
      !L.value || p || A.busy || A.storage !== "ready" || (L.value = !1, !A.profile && (f.settings.submitted = null, f.settings.open = !0, f.setup.step = A.teacher ? 2 : 0, u.length = 0, C.profile = 0, be("profile", !0)));
    }), z([() => t.value.chatIdentity, () => t.value.language], () => {
      L.value = !1;
    });
    async function rt() {
      await be("home"), x.value && (x.value.scrollTop = 0);
      const A = x.value?.querySelector("#learning-review-title");
      A && (A.tabIndex = -1, A.focus({ preventScroll: !0 }));
    }
    async function Ye(A, p = {}, h = !1) {
      if (A === "prepare" && !t.value.profile) {
        f.setup.step = 2, await be("profile");
        return;
      }
      A === "start-review" && await rt();
      const ie = t.value.unit;
      ie?.kind === "reading-writing" && p.unitId === ie.id && [
        "grade",
        "submit-revision",
        "skip-revision"
      ].includes(A) && (f.unit(ie.id).reading.view = A === "skip-revision" && ie.modelEssay ? "model" : "feedback", await be("home"), x.value && (x.value.scrollTop = 0)), await y(A, p, h);
    }
    z(() => f.settings.submitted, (A, p) => {
      !A && p && !f.settings.open && m.value === "profile" && f.setup.step === 2 && t.value.storage === "ready" && !t.value.busy && t.value.profile && Object.entries(p.value).every(([h, ie]) => t.value.profile.settings[h] === ie) && be("home");
    }), z(() => t.value.busy, (A) => {
      const p = t.value.unit;
      !A && p?.stage.stage === "revising" && f.unit(p.id).reading.view === "model" && (f.unit(p.id).reading.view = "feedback");
    });
    const Lt = Xe(() => $.value?.open ? ($.value.open = !1, !0) : Q.value && ue.value ? (st(), !0) : !O.value && T.value === "chat" ? (Pe(), !0) : m.value === "home" || !u.length && m.value === "profile" && !t.value.teacher ? !1 : (be(u.pop() ?? "home", !0), !0));
    function ge(A, p, h) {
      se.value = {
        action: A,
        input: p,
        text: h
      };
    }
    async function ca(A) {
      await y("records", {
        id: A,
        offset: t.value.records.offset
      }), t.value.record?.id === A && await be("books");
    }
    const { bubble: St, dismiss: ot } = Lu({
      root: q,
      state: t,
      pending: o,
      preference: f.companion,
      reading: S(() => ue.value && m.value === "home" && t.value.unit?.kind === "reading-writing" && [
        "writing",
        "grading",
        "complete"
      ].includes(t.value.unit.stage.stage)),
      blocked: S(() => Q.value || !!M.value || !!se.value || N.value),
      request: y
    });
    async function ga() {
      const A = await y("export");
      if (!A?.document) return;
      const p = URL.createObjectURL(new Blob([JSON.stringify(A.document, null, 2)], { type: "application/json" })), h = document.createElement("a");
      h.href = p, h.download = "LittleWhiteBox_Learning.json", h.click(), setTimeout(() => URL.revokeObjectURL(p), 1e3);
    }
    return (A, p) => (a(), i("section", {
      ref_key: "root",
      ref: q,
      class: "learning-app",
      style: Gt({
        "--learning-switch-ms": `${l(320)}ms`,
        "--learning-work-share": `${F.value}%`
      }),
      "aria-label": "语伴语言学习"
    }, [
      n("header", Su, [
        m.value !== "home" && (l(t).teacher || u.length) && (O.value || T.value === "work") ? (a(), i("button", {
          key: 0,
          type: "button",
          class: "learning-toolbar-back",
          "aria-label": "返回上一页",
          onClick: p[0] || (p[0] = (...h) => l(Lt) && l(Lt)(...h))
        }, [W(J, { name: "back" })])) : g("", !0),
        n("button", {
          type: "button",
          class: "learning-wordmark",
          onClick: p[1] || (p[1] = (h) => be("home"))
        }, [
          p[38] || (p[38] = n("span", {
            class: "learning-brand-mark",
            "aria-hidden": "true"
          }, [H("a"), n("span", null, "あ")], -1)),
          p[39] || (p[39] = H("语伴", -1)),
          Ce.value && (O.value || T.value === "work") ? (a(), i("span", Au)) : g("", !0)
        ]),
        O.value && l(t).teacher ? (a(), i("label", Ru, [
          W(J, { name: "workbook" }),
          le(n("input", {
            "onUpdate:modelValue": p[2] || (p[2] = (h) => F.value = h),
            type: "range",
            min: Y.value,
            max: V.value,
            step: "1",
            "aria-label": "阅读区宽度比例"
          }, null, 8, Mu), [[
            pe,
            F.value,
            void 0,
            { number: !0 }
          ]]),
          W(J, { name: "chat" })
        ])) : g("", !0),
        n("button", {
          ref_key: "assistantButton",
          ref: X,
          type: "button",
          class: "learning-assistant-button",
          "aria-label": l(te).assistant,
          "aria-expanded": Q.value,
          onClick: p[3] || (p[3] = (h) => Q.value ? st() : lt())
        }, [W(J, { name: "chat" }), n("span", null, r(l(te).assistant), 1)], 8, Eu),
        n("details", {
          ref_key: "menu",
          ref: $,
          class: "learning-menu",
          onToggle: p[4] || (p[4] = (h) => N.value = !!$.value?.open),
          onKeydown: p[5] || (p[5] = Me(ve((h) => $.value.open = !1, ["stop", "prevent"]), ["esc"]))
        }, [n("summary", Nu, [W(J, { name: "more" })]), n("nav", Tu, [(a(), i(R, null, D([
          ["books", "语法本与生词本"],
          ["materials", "课件与笔记"],
          ["harvest", "我的收获"],
          ["settings", "设置"]
        ], ([h, ie]) => n("button", {
          key: h,
          type: "button",
          onClick: (ze) => be(h)
        }, r(ie), 9, Ou)), 64))])], 544)
      ]),
      l(I) || !l(t).busy && (l(t).message || l(t).storage !== "ready") ? (a(), i("div", Bu, [H(r(l(I) || l(t).message || (l(t).storage === "unconfirmed" ? l(Ze).unconfirmed : l(t).storage === "conflict" ? l(Ze).conflict : l(t).storage === "invalid" ? l(Ze).invalid : l(Ze).unloaded)) + " ", 1), n("div", qu, [
        l(t).storage === "unconfirmed" || l(t).storage === "conflict" ? (a(), i("button", {
          key: 0,
          type: "button",
          disabled: l(o),
          onClick: p[6] || (p[6] = (h) => y("verify"))
        }, r(s.verify), 9, Pu)) : g("", !0),
        l(t).storage === "unconfirmed" ? (a(), i("button", {
          key: 1,
          type: "button",
          disabled: l(o),
          onClick: p[7] || (p[7] = (h) => y("retry-save"))
        }, r(s.retry), 9, _u)) : g("", !0),
        l(t).storage === "conflict" ? (a(), i("button", {
          key: 2,
          type: "button",
          disabled: l(o),
          onClick: p[8] || (p[8] = (h) => ge("adopt-server", {}, s.adoptWarning))
        }, r(s.adopt), 9, Vu)) : g("", !0),
        l(t).storage === "invalid" ? (a(), i("button", {
          key: 3,
          type: "button",
          class: "learning-primary",
          disabled: !l(b)("reset-learning"),
          onClick: p[9] || (p[9] = (h) => ge("reset-learning", {}, l(ke).resetLearning))
        }, r(l(dt)["reset-learning"].accept), 9, Uu)) : l(t).storage === "unloaded" || l(k) ? (a(), i("button", {
          key: 4,
          type: "button",
          disabled: l(o),
          onClick: p[10] || (p[10] = (h) => y("read"))
        }, r(l(zt).refresh), 9, Du)) : g("", !0)
      ])])) : g("", !0),
      [
        "unconfirmed",
        "conflict",
        "failed"
      ].includes(l(t).chatStorage) ? (a(), i("div", ju, [H(r(l(t).chatStorage === "unconfirmed" ? l(Re).unconfirmed : l(t).chatStorage === "conflict" ? l(Re).conflict : l(Re).failed) + " ", 1), n("div", Wu, [n("button", {
        type: "button",
        disabled: !l(b)("verify-teacher"),
        onClick: p[11] || (p[11] = (h) => y("verify-teacher"))
      }, r(l(Re).verify), 9, Gu), l(t).chatStorage !== "failed" ? (a(), i("button", {
        key: 0,
        type: "button",
        disabled: !l(b)("adopt-teacher"),
        onClick: p[12] || (p[12] = (h) => ge("adopt-teacher", {}, l(Re).adoptWarning))
      }, r(l(Re).adopt), 9, Fu)) : g("", !0)])])) : g("", !0),
      [
        "unconfirmed",
        "conflict",
        "failed"
      ].includes(l(t).workbenchStorage) ? (a(), i("div", Hu, [
        H(r(l(te).assistantStorage) + " ", 1),
        n("button", {
          type: "button",
          disabled: l(o),
          onClick: p[13] || (p[13] = (h) => y("verify-workbench"))
        }, r(l(te).verify), 9, Yu),
        l(t).workbenchStorage === "conflict" ? (a(), i("button", {
          key: 0,
          type: "button",
          disabled: l(o),
          onClick: p[14] || (p[14] = (h) => ge("adopt-workbench", {}, l(te).adoptConfirm))
        }, r(l(te).adopt), 9, zu)) : g("", !0)
      ])) : g("", !0),
      n("div", { class: oe(["learning-stage", {
        "is-wide": O.value,
        "is-chat": !O.value && T.value === "chat"
      }]) }, [
        n("div", {
          class: "learning-pane is-work",
          inert: !ue.value,
          "aria-hidden": !ue.value
        }, [n("div", {
          class: "learning-work-surface",
          inert: !!M.value,
          "aria-hidden": !!M.value
        }, [_.value && Q.value ? (a(), Z(jt, {
          key: 0,
          ref_key: "assistant",
          ref: B,
          target: "workbench",
          state: l(t),
          disabled: !l(b)("workbench-talk"),
          pending: l(o),
          onAction: y,
          onPresent: Ae,
          onClose: st
        }, null, 8, [
          "state",
          "disabled",
          "pending"
        ])) : g("", !0), le(n("div", {
          ref_key: "scroller",
          ref: x,
          class: "learning-scroll",
          onScrollPassive: We,
          onClick: qe,
          onFocusin: qe
        }, [_.value && !Q.value ? (a(), i(R, { key: 0 }, [
          ce.value ? (a(), Z(da, {
            key: ce.value.key,
            turn: ce.value.turn,
            stoppable: "",
            disabled: l(o),
            onStop: p[15] || (p[15] = (h) => y(l(we)({ kind: ce.value.turn.purpose ?? "talk" }) ? "cancel-preparation" : "cancel"))
          }, pa({ _: 2 }, [l(t).storage === "ready" && l(we)({ kind: ce.value.turn.purpose ?? "talk" }) && !l(t).preparation?.running && (l(t).preparation || l(t).sourceChoice) ? {
            name: "default",
            fn: Wt(() => [W(gt, {
              state: l(t),
              disabled: !l(d),
              pending: l(o),
              onAction: Ye
            }, null, 8, [
              "state",
              "disabled",
              "pending"
            ])]),
            key: "0"
          } : void 0]), 1032, ["turn", "disabled"])) : g("", !0),
          ce.value && !l(we)({ kind: ce.value.turn.purpose ?? "talk" }) && l(De)(ce.value.turn, l(t).workbenchStorage, l(t).storage) ? (a(), i("p", {
            key: 1,
            class: oe(["learning-turn-notice", { "is-error": ce.value.turn.status === "failed" }]),
            role: "status"
          }, r(l(De)(ce.value.turn, l(t).workbenchStorage, l(t).storage)), 3)) : g("", !0),
          l(t).busy && ce.value?.turn.status !== "running" ? (a(), i("div", Zu, [
            p[40] || (p[40] = n("span", {
              class: "learning-working-dot",
              "aria-hidden": "true"
            }, null, -1)),
            n("span", null, r(l(t).message || s.working), 1),
            n("button", {
              type: "button",
              disabled: l(o),
              onClick: p[16] || (p[16] = (h) => y("cancel"))
            }, "停止", 8, Qu)
          ])) : g("", !0),
          m.value === "home" ? (a(), Z(Ao, {
            key: 3,
            state: l(t),
            disabled: !l(d),
            pending: l(o),
            "preparation-in-process": !!ce.value && l(we)({ kind: ce.value.turn.purpose ?? "talk" }),
            onAction: Ye,
            onConfirm: ge,
            onPresent: Ae,
            onGo: be,
            onAsk: Ct,
            onAssistant: lt,
            onRecord: ca
          }, null, 8, [
            "state",
            "disabled",
            "pending",
            "preparation-in-process"
          ])) : g("", !0),
          m.value === "profile" ? (a(), Z(Ll, {
            key: 4,
            state: l(t),
            disabled: !l(b)("language"),
            onAction: y
          }, null, 8, ["state", "disabled"])) : g("", !0),
          m.value === "materials" ? (a(), i("section", Xu, [
            p[41] || (p[41] = n("h1", null, "课件与笔记", -1)),
            l(t).unit ? g("", !0) : (a(), i("p", ed, r(l(t).blockedUnit ? "当前课件在另一个故事中" : "还没有课件"), 1)),
            l(t).unit ? (a(), i(R, { key: 1 }, [
              n("p", td, r(l(t).unit.title), 1),
              (a(!0), i(R, null, D(l(t).unit.materials, (h) => (a(), i("button", {
                key: h.id,
                type: "button",
                class: "learning-activity-link",
                onClick: (ie) => Ae({
                  unitId: l(t).unit.id,
                  kind: "material",
                  id: h.id,
                  title: h.title
                })
              }, [
                W(J, { name: "book" }),
                n("span", null, r(h.title), 1),
                W(J, { name: "arrow" })
              ], 8, ad))), 128)),
              (a(!0), i(R, null, D(l(t).unit.exercises, (h) => (a(), i("button", {
                key: h.id,
                type: "button",
                class: "learning-activity-link",
                onClick: (ie) => Ae({
                  unitId: l(t).unit.id,
                  kind: "exercise",
                  id: h.id,
                  title: h.prompt
                })
              }, [
                W(J, { name: "records" }),
                n("span", null, r(h.prompt), 1),
                W(J, { name: "arrow" })
              ], 8, nd))), 128)),
              l(t).unit.notes.length ? (a(), i("section", id, [(a(!0), i(R, null, D(l(t).unit.notes, (h) => (a(), i("article", { key: h.id }, [
                h.selection ? (a(), i("blockquote", ld, r(h.selection.quote), 1)) : g("", !0),
                n("p", null, r(h.text), 1),
                n("button", {
                  type: "button",
                  disabled: !l(d),
                  onClick: (ie) => y("delete-note", { id: h.id })
                }, "删除笔记", 8, sd)
              ]))), 128))])) : g("", !0)
            ], 64)) : g("", !0)
          ])) : g("", !0),
          m.value === "books" ? (a(), Z(Ki, {
            key: 6,
            state: l(t),
            disabled: !l(b)("start-review"),
            onAction: Ye,
            onReview: rt,
            onRemove: ge
          }, null, 8, ["state", "disabled"])) : g("", !0),
          m.value === "harvest" ? (a(), i("section", rd, [
            p[43] || (p[43] = n("div", { class: "learning-page-heading" }, [n("h1", null, "我的收获")], -1)),
            l(t).completions.length ? g("", !0) : (a(), i("p", od, "还没有完成的课程")),
            (a(!0), i(R, null, D(va.value, (h) => (a(), i("article", {
              key: h.unitId,
              class: "learning-harvest-entry"
            }, [
              n("small", null, r(new Date(h.completedAt).toLocaleDateString()), 1),
              h.rewardStatus !== "retired" ? (a(), i("h2", ud, [H(r(h.rewardStatus === "paid" ? "+" : "") + r(h.amount), 1), p[42] || (p[42] = n("span", null, "小白币", -1))])) : g("", !0),
              n("p", null, r(h.summary), 1),
              n("p", dd, r(h.rewardStatus === "paid" ? l(me).paid : h.rewardStatus === "retired" ? l(me).retired : l(me).pending), 1),
              h.rewardStatus !== "paid" && h.rewardStatus !== "retired" ? (a(), i("button", {
                key: 1,
                type: "button",
                disabled: !l(d) || l(t).walletStorage !== "ready",
                onClick: (ie) => y("reward", {
                  unitId: h.unitId,
                  openWallet: !l(t).walletOpen
                })
              }, r(l(t).walletOpen ? l(me).claim : l(me).openWallet), 9, vd)) : g("", !0)
            ]))), 128)),
            l(t).walletStorage === "unconfirmed" || l(t).walletStorage === "conflict" || l(t).walletStorage === "failed" ? (a(), i("button", {
              key: 1,
              type: "button",
              disabled: l(o) || l(t).busy,
              onClick: p[17] || (p[17] = (h) => y("verify-wallet"))
            }, r(s.verifyWallet), 9, cd)) : g("", !0),
            l(t).walletStorage === "conflict" ? (a(), i("button", {
              key: 2,
              type: "button",
              disabled: l(o) || l(t).busy,
              onClick: p[18] || (p[18] = (h) => ge("adopt-wallet", {}, s.adoptWalletWarning))
            }, r(s.adoptWallet), 9, gd)) : g("", !0),
            l(t).completions.length > 20 ? (a(), i("div", pd, [n("button", {
              type: "button",
              disabled: xe.value === 0,
              onClick: p[19] || (p[19] = (h) => xe.value--)
            }, "上一页", 8, bd), n("button", {
              type: "button",
              disabled: (xe.value + 1) * 20 >= l(t).completions.length,
              onClick: p[20] || (p[20] = (h) => xe.value++)
            }, "下一页", 8, md)])) : g("", !0)
          ])) : g("", !0),
          m.value === "settings" ? (a(), i("section", fd, [
            p[53] || (p[53] = n("h1", null, "学习设置", -1)),
            n("label", null, [p[44] || (p[44] = H("当前语言", -1)), n("select", {
              value: l(t).language,
              disabled: !l(b)("language"),
              onChange: p[21] || (p[21] = (h) => {
                y("language", { language: h.target.value }), h.target.value = l(t).language;
              })
            }, [(a(!0), i(R, null, D([.../* @__PURE__ */ new Set([l(t).language, ...l(t).languages])], (h) => (a(), i("option", {
              key: h,
              value: h
            }, r(new Intl.DisplayNames(["zh-CN"], { type: "language" }).of(h)), 9, yd))), 128))], 40, kd)]),
            n("button", {
              type: "button",
              onClick: It
            }, "更换语言和语伴 →"),
            W(sa),
            n("section", null, [
              p[45] || (p[45] = n("h2", null, "训练设置", -1)),
              l(t).profile?.goal.description ? (a(), i("p", hd, r(l(t).profile.goal.description), 1)) : g("", !0),
              W(la, {
                state: l(t),
                disabled: !l(b)("settings"),
                onAction: y
              }, null, 8, ["state", "disabled"])
            ]),
            n("section", null, [
              p[50] || (p[50] = n("h2", null, "语伴的声音", -1)),
              l(t).voices.enabled ? (a(), i("form", {
                key: 1,
                onSubmit: p[25] || (p[25] = ve((h) => y("voice", { voice: {
                  voiceId: Ge.value,
                  language: Fe.value,
                  speed: Number(He.value)
                } }), ["prevent"]))
              }, [
                n("label", null, [p[46] || (p[46] = H("音色", -1)), le(n("select", { "onUpdate:modelValue": p[22] || (p[22] = (h) => Ge.value = h) }, [(a(!0), i(R, null, D(l(t).voices.voices, (h) => (a(), i("option", {
                  key: h.id,
                  value: h.id,
                  disabled: !h.available
                }, r(h.name) + r(h.available ? "" : "（暂不可用）"), 9, wd))), 128))], 512), [[et, Ge.value]])]),
                n("label", null, [p[47] || (p[47] = H("发音语言", -1)), le(n("input", {
                  "onUpdate:modelValue": p[23] || (p[23] = (h) => Fe.value = h),
                  type: "text",
                  maxlength: "80",
                  placeholder: "en / ja"
                }, null, 512), [[pe, Fe.value]])]),
                n("label", null, [p[49] || (p[49] = H("语速", -1)), le(n("select", { "onUpdate:modelValue": p[24] || (p[24] = (h) => He.value = h) }, [...p[48] || (p[48] = [
                  n("option", { value: 0.75 }, "0.75×", -1),
                  n("option", { value: 1 }, "1×", -1),
                  n("option", { value: 1.25 }, "1.25×", -1)
                ])], 512), [[et, He.value]])]),
                n("button", {
                  type: "submit",
                  disabled: !l(b)("voice") || !l(t).profile
                }, "保存声音设置", 8, xd)
              ], 32)) : (a(), i("p", $d, r(s.voiceDisabled), 1)),
              n("button", {
                type: "button",
                onClick: p[26] || (p[26] = (h) => y("tts-settings"))
              }, r(l(t).voices.enabled ? l(ct).settings : l(ct).enable), 1),
              p[51] || (p[51] = n("small", null, "已听过的题保留原声音，新偏好用于之后的题目。", -1))
            ]),
            n("section", null, [
              p[52] || (p[52] = n("h2", null, "学习数据", -1)),
              n("button", {
                type: "button",
                disabled: !l(b)("forget-conversation"),
                onClick: p[27] || (p[27] = (h) => ge("forget-conversation", { target: "companion" }, l(te).clearCompanionConfirm))
              }, r(l(te).clearCompanion), 9, Cd),
              n("button", {
                type: "button",
                disabled: !l(b)("forget-conversation"),
                onClick: p[28] || (p[28] = (h) => ge("forget-conversation", { target: "workbench" }, l(te).clearAssistantConfirm))
              }, r(l(te).clearAssistant), 9, Id),
              n("button", {
                type: "button",
                disabled: !l(b)("export"),
                onClick: ga
              }, "导出学习数据", 8, Ld),
              n("button", {
                type: "button",
                disabled: !l(b)("read"),
                onClick: p[29] || (p[29] = (h) => y("read"))
              }, "重新加载", 8, Sd),
              l(t).unit || l(t).blockedUnit ? (a(), i("button", {
                key: 0,
                type: "button",
                disabled: !l(b)("abandon"),
                onClick: p[30] || (p[30] = (h) => ge("abandon", {}, l(ke).lesson))
              }, "放下当前练习", 8, Ad)) : g("", !0),
              n("button", {
                type: "button",
                class: "learning-danger",
                disabled: !l(b)("delete-language") || !l(t).profile,
                onClick: p[31] || (p[31] = (h) => ge("delete-language", {}, "删除当前语言的全部学习数据？未领取奖励也将放弃，已到账流水保留。"))
              }, "删除当前语言", 8, Rd),
              n("button", {
                type: "button",
                class: "learning-danger",
                disabled: !l(b)("clear"),
                onClick: p[32] || (p[32] = (h) => ge("clear", {}, "清空所有语言的目标、课程和记录？未领取奖励也将放弃。已到账流水不撤销。"))
              }, "清空全部学习数据", 8, Md)
            ])
          ])) : g("", !0)
        ], 64)) : g("", !0)], 544), [[wa, !Q.value]])], 8, Ju), _.value && l(t).unit && M.value ? (a(), Z(Zn, {
          key: `${l(t).chatIdentity}:${l(t).language}:${l(t).unit.id}:${M.value.kind}:${M.value.id}`,
          state: l(t),
          target: M.value,
          active: ue.value,
          disabled: !l(d),
          onAction: y,
          onClose: _e,
          onAsk: Ct
        }, null, 8, [
          "state",
          "target",
          "active",
          "disabled"
        ])) : g("", !0)], 8, Ku),
        l(t).teacher ? (a(), i("div", {
          key: 0,
          class: "learning-pane is-chat",
          inert: !je.value,
          "aria-hidden": !je.value
        }, [P.value ? (a(), Z(jt, {
          key: 0,
          ref_key: "conversation",
          ref: j,
          target: "companion",
          state: l(t),
          disabled: !l(c),
          pending: l(o),
          onAction: y,
          onPresent: Ae,
          onProfile: It
        }, null, 8, [
          "state",
          "disabled",
          "pending"
        ])) : g("", !0)], 8, Ed)) : g("", !0),
        !O.value && T.value === "work" && l(t).teacher ? (a(), i("button", {
          key: 1,
          type: "button",
          class: "learning-float is-companion",
          "aria-label": ht.value ? `和${l(t).teacher.name}聊天，有新消息` : `和${l(t).teacher.name}聊天`,
          onClick: $t
        }, [n("span", Td, r([...l(t).teacher.name][0]), 1), ht.value ? (a(), i("span", Od)) : g("", !0)], 8, Nd)) : g("", !0),
        !O.value && T.value === "chat" ? (a(), i("button", {
          key: 2,
          type: "button",
          class: "learning-float is-workbook",
          "aria-label": Ce.value ? "回到练习本，有新指引" : "回到练习本",
          onClick: Pe
        }, [W(J, { name: "workbook" }), Ce.value ? (a(), i("span", qd)) : g("", !0)], 8, Bd)) : g("", !0),
        l(St) ? (a(), i("aside", {
          key: 3,
          class: oe(["learning-companion-bubble", { "is-wide": O.value }]),
          "aria-live": "polite"
        }, [n("button", {
          type: "button",
          onClick: p[33] || (p[33] = (h) => {
            $t(), l(ot)();
          })
        }, r(l(St)), 1), n("button", {
          type: "button",
          "aria-label": "收起这句话",
          onClick: p[34] || (p[34] = (...h) => l(ot) && l(ot)(...h))
        }, [W(J, { name: "close" })])], 2)) : g("", !0)
      ], 2),
      !M.value || !ue.value ? (a(), Z(Qt, {
        key: 3,
        state: l(t),
        onAction: y
      }, null, 8, ["state"])) : g("", !0),
      l(t).approval ? (a(), Z(li, {
        key: 4,
        approval: l(t).approval,
        pending: l(o),
        onAction: y
      }, null, 8, ["approval", "pending"])) : se.value ? (a(), i("div", {
        key: 5,
        ref_key: "confirmLayer",
        ref: xt,
        class: "learning-confirm-shade",
        onKeydown: p[37] || (p[37] = Me(ve((h) => se.value = null, ["stop", "prevent"]), ["esc"]))
      }, [n("section", Pd, [
        n("h2", _d, r(l(dt)[se.value.action].title), 1),
        n("p", null, r(se.value.text), 1),
        n("div", Vd, [n("button", {
          autofocus: "",
          type: "button",
          onClick: p[35] || (p[35] = (h) => se.value = null)
        }, r(["language", "teacher"].includes(se.value.action) ? l(ke).keepEditing : s.cancel), 1), n("button", {
          type: "button",
          class: "learning-primary",
          disabled: !l(b)(se.value.action),
          onClick: p[36] || (p[36] = (h) => {
            Ye(se.value.action, se.value.input, !0), se.value = null;
          })
        }, r(l(dt)[se.value.action].accept), 9, Ud)])
      ])], 544)) : g("", !0)
    ], 4));
  }
}), Hd = Dd;
export {
  Hd as default
};
