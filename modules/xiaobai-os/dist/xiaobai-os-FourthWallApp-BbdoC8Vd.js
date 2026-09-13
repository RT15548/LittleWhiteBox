/* eslint-disable */
import { E as Be, G as ce, H as Q, J as ee, K as G, M as I, P as He, Q as V, T as Me, V as ke, X as ye, Y as Re, Z as Xe, b as te, f as re, g as H, h as K, i as ie, k as Fe, l as Qe, m as ne, o as ae, p as v, u as le, v as x, x as ge, y as we, z as se } from "./xiaobai-os-runtime-dom.esm-bundler-BcM9c-Z9.js";
import { n as De, r as Oe } from "./xiaobai-os-app-navigation-sg-40eOk.js";
import { t as qe } from "./xiaobai-os-AppDialog-CI-E933W.js";
import { t as ve } from "./xiaobai-os-context-tokens-W3T8vx4V.js";
var Je = Object.create, Ne = Object.defineProperty, Ye = Object.getOwnPropertyDescriptor, xe = Object.getOwnPropertyNames, er = Object.getPrototypeOf, rr = Object.prototype.hasOwnProperty, ar = (u, d) => () => (d || (u((d = { exports: {} }).exports, d), u = null), d.exports), tr = (u, d, l, f) => {
  if (d && typeof d == "object" || typeof d == "function")
    for (var t = xe(d), g = 0, h = t.length, _; g < h; g++)
      _ = t[g], !rr.call(u, _) && _ !== l && Ne(u, _, {
        get: ((p) => d[p]).bind(null, _),
        enumerable: !(f = Ye(d, _)) || f.enumerable
      });
  return u;
}, nr = (u, d, l) => (l = u != null ? Je(er(u)) : {}, tr(d || !u || !u.__esModule ? Ne(l, "default", {
  value: u,
  enumerable: !0
}) : l, u)), sr = { class: "fourth-wall-context" }, ir = ["aria-label", "aria-expanded"], or = {
  key: 0,
  class: "fourth-wall-context-popover",
  "aria-label": "上下文用量"
}, lr = { class: "fourth-wall-context-total" }, ur = ["disabled"], cr = { key: 2 }, dr = /* @__PURE__ */ te({
  __name: "FourthWallContextButton",
  props: {
    stats: {},
    busy: { type: Boolean },
    phase: {}
  },
  emits: ["summarize", "cancel"],
  setup(u, { emit: d }) {
    const l = u, f = d, t = G(!1);
    De(() => (t.value = !1, !0), () => t.value);
    const g = re(() => Math.min(1, l.stats.usedTokens / l.stats.limit)), h = (p) => `${(p / 1e3).toFixed(1)}k`, _ = {
      counting: "计算中",
      summarizing: "总结中",
      saving: "保存中",
      replying: "回复中"
    };
    return (p, k) => (I(), H("div", sr, [v("button", {
      type: "button",
      class: ye(["fourth-wall-context-ring", { "is-warning": u.stats.usedTokens >= u.stats.trigger }]),
      style: Xe({ "--context-fill": `${g.value * 360}deg` }),
      "aria-label": `上下文：约 ${h(u.stats.usedTokens)} / 158k`,
      "aria-expanded": t.value,
      title: "上下文",
      onClick: k[0] || (k[0] = (y) => t.value = !t.value)
    }, [v("span", null, V(u.busy ? "…" : Math.round(g.value * 100)), 1)], 14, ir), t.value ? (I(), H("section", or, [
      v("header", null, [k[4] || (k[4] = v("strong", null, "上下文", -1)), v("button", {
        type: "button",
        "aria-label": "关闭上下文用量",
        onClick: k[1] || (k[1] = (y) => t.value = !1)
      }, "×")]),
      v("p", lr, "约 " + V(h(u.stats.usedTokens)) + " / 158k", 1),
      v("dl", null, [
        k[5] || (k[5] = v("dt", null, "主剧情", -1)),
        v("dd", null, V(h(u.stats.mainTokens)), 1),
        k[6] || (k[6] = v("dt", null, "皮下记忆", -1)),
        v("dd", null, V(h(u.stats.memoryTokens)), 1),
        k[7] || (k[7] = v("dt", null, "皮下聊天", -1)),
        v("dd", null, V(h(u.stats.historyTokens)), 1),
        k[8] || (k[8] = v("dt", null, "提示词与输入", -1)),
        v("dd", null, V(h(u.stats.promptTokens)), 1)
      ]),
      k[9] || (k[9] = v("p", null, "128k 时在下次回复前自动总结。", -1)),
      u.busy ? (I(), H("button", {
        key: 0,
        type: "button",
        onClick: k[2] || (k[2] = (y) => f("cancel"))
      }, V(u.phase ? _[u.phase] : "处理中") + " · 取消", 1)) : (I(), H("button", {
        key: 1,
        type: "button",
        disabled: !u.stats.canSummarize,
        onClick: k[3] || (k[3] = (y) => {
          f("summarize"), t.value = !1;
        })
      }, "立即总结", 8, ur)),
      !u.stats.canSummarize && !u.busy ? (I(), H("small", cr, "暂无可总结的较早聊天，近期原文会保留。")) : K("", !0)
    ])) : K("", !0)]));
  }
}), fr = dr, hr = ["disabled"], mr = ["disabled"], pr = {
  key: 0,
  class: "fourth-wall-dialog-error",
  role: "alert"
}, gr = ["disabled"], vr = ["disabled"], _r = /* @__PURE__ */ te({
  __name: "FourthWallMemory",
  props: {
    content: {},
    busy: { type: Boolean },
    error: {}
  },
  emits: ["close", "save"],
  setup(u, { emit: d }) {
    const l = u, f = d, t = G(l.content);
    function g() {
      (t.value === l.content || window.confirm("放弃尚未保存的记忆修改？")) && f("close");
    }
    function h() {
      window.confirm("清空皮下记忆？聊天原文仍保留，已归档的内容不会自动重新送入上下文。") && (t.value = "", f("save", ""));
    }
    return (_, p) => (I(), ne(qe, {
      class: "fourth-wall-memory fourth-wall-dialog",
      "aria-label": "皮下记忆",
      busy: u.busy,
      onClose: g
    }, {
      default: ke(() => [
        v("header", null, [p[2] || (p[2] = v("strong", null, "皮下记忆", -1)), v("button", {
          type: "button",
          disabled: u.busy,
          onClick: g
        }, "关闭", 8, hr)]),
        Q(v("textarea", {
          "onUpdate:modelValue": p[0] || (p[0] = (k) => t.value = k),
          "aria-label": "皮下记忆正文",
          disabled: u.busy,
          placeholder: "总结后的皮下人设与长期记忆，也可以直接填写。"
        }, null, 8, mr), [[ae, t.value]]),
        u.error ? (I(), H("p", pr, V(u.error), 1)) : K("", !0),
        v("footer", null, [v("button", {
          type: "button",
          class: "is-danger",
          disabled: u.busy || !u.content,
          onClick: h
        }, "清空记忆", 8, gr), v("button", {
          type: "button",
          class: "is-primary",
          disabled: u.busy,
          onClick: p[1] || (p[1] = (k) => f("save", t.value))
        }, "保存", 8, vr)])
      ]),
      _: 1
    }, 8, ["busy"]));
  }
}), wr = _r, Ue = te({
  name: "FourthWallContent",
  props: { content: {
    type: Object,
    required: !0
  } },
  setup(u, { slots: d }) {
    function l(f) {
      if (f.kind === "text") return f.value;
      if (f.kind === "media") {
        const g = u.content.media[f.index];
        return d.media?.({
          segment: g,
          index: f.index
        }) ?? g.raw;
      }
      const t = ge(f.tag, f.attrs, f.children.map(l));
      return f.tag === "table" ? ge("div", { class: "fourth-wall-table-scroll" }, [t]) : t;
    }
    return () => ge("div", { class: "fourth-wall-markdown" }, u.content.nodes.map(l));
  }
}), br = /* @__PURE__ */ ar(((u, d) => {
  (function() {
    function l(e) {
      "use strict";
      var a = {
        omitExtraWLInCodeBlocks: {
          defaultValue: !1,
          describe: "Omit the default extra whiteline added to code blocks",
          type: "boolean"
        },
        noHeaderId: {
          defaultValue: !1,
          describe: "Turn on/off generated header id",
          type: "boolean"
        },
        prefixHeaderId: {
          defaultValue: !1,
          describe: "Add a prefix to the generated header ids. Passing a string will prefix that string to the header id. Setting to true will add a generic 'section-' prefix",
          type: "string"
        },
        rawPrefixHeaderId: {
          defaultValue: !1,
          describe: 'Setting this option to true will prevent showdown from modifying the prefix. This might result in malformed IDs (if, for instance, the " char is used in the prefix)',
          type: "boolean"
        },
        ghCompatibleHeaderId: {
          defaultValue: !1,
          describe: "Generate header ids compatible with github style (spaces are replaced with dashes, a bunch of non alphanumeric chars are removed)",
          type: "boolean"
        },
        rawHeaderId: {
          defaultValue: !1,
          describe: `Remove only spaces, ' and " from generated header ids (including prefixes), replacing them with dashes (-). WARNING: This might result in malformed ids`,
          type: "boolean"
        },
        headerLevelStart: {
          defaultValue: !1,
          describe: "The header blocks level start",
          type: "integer"
        },
        parseImgDimensions: {
          defaultValue: !1,
          describe: "Turn on/off image dimension parsing",
          type: "boolean"
        },
        simplifiedAutoLink: {
          defaultValue: !1,
          describe: "Turn on/off GFM autolink style",
          type: "boolean"
        },
        excludeTrailingPunctuationFromURLs: {
          defaultValue: !1,
          describe: "Excludes trailing punctuation from links generated with autoLinking",
          type: "boolean"
        },
        literalMidWordUnderscores: {
          defaultValue: !1,
          describe: "Parse midword underscores as literal underscores",
          type: "boolean"
        },
        literalMidWordAsterisks: {
          defaultValue: !1,
          describe: "Parse midword asterisks as literal asterisks",
          type: "boolean"
        },
        strikethrough: {
          defaultValue: !1,
          describe: "Turn on/off strikethrough support",
          type: "boolean"
        },
        tables: {
          defaultValue: !1,
          describe: "Turn on/off tables support",
          type: "boolean"
        },
        tablesHeaderId: {
          defaultValue: !1,
          describe: "Add an id to table headers",
          type: "boolean"
        },
        ghCodeBlocks: {
          defaultValue: !0,
          describe: "Turn on/off GFM fenced code blocks support",
          type: "boolean"
        },
        tasklists: {
          defaultValue: !1,
          describe: "Turn on/off GFM tasklist support",
          type: "boolean"
        },
        smoothLivePreview: {
          defaultValue: !1,
          describe: "Prevents weird effects in live previews due to incomplete input",
          type: "boolean"
        },
        smartIndentationFix: {
          defaultValue: !1,
          describe: "Tries to smartly fix indentation in es6 strings",
          type: "boolean"
        },
        disableForced4SpacesIndentedSublists: {
          defaultValue: !1,
          describe: "Disables the requirement of indenting nested sublists by 4 spaces",
          type: "boolean"
        },
        simpleLineBreaks: {
          defaultValue: !1,
          describe: "Parses simple line breaks as <br> (GFM Style)",
          type: "boolean"
        },
        requireSpaceBeforeHeadingText: {
          defaultValue: !1,
          describe: "Makes adding a space between `#` and the header text mandatory (GFM Style)",
          type: "boolean"
        },
        ghMentions: {
          defaultValue: !1,
          describe: "Enables github @mentions",
          type: "boolean"
        },
        ghMentionsLink: {
          defaultValue: "https://github.com/{u}",
          describe: "Changes the link generated by @mentions. Only applies if ghMentions option is enabled.",
          type: "string"
        },
        encodeEmails: {
          defaultValue: !0,
          describe: "Encode e-mail addresses through the use of Character Entities, transforming ASCII e-mail addresses into its equivalent decimal entities",
          type: "boolean"
        },
        openLinksInNewWindow: {
          defaultValue: !1,
          describe: "Open all links in new windows",
          type: "boolean"
        },
        backslashEscapesHTMLTags: {
          defaultValue: !1,
          describe: "Support for HTML Tag escaping. ex: <div>foo</div>",
          type: "boolean"
        },
        emoji: {
          defaultValue: !1,
          describe: "Enable emoji support. Ex: `this is a :smile: emoji`",
          type: "boolean"
        },
        underline: {
          defaultValue: !1,
          describe: "Enable support for underline. Syntax is double or triple underscores: `__underline word__`. With this option enabled, underscores no longer parses into `<em>` and `<strong>`",
          type: "boolean"
        },
        ellipsis: {
          defaultValue: !0,
          describe: "Replaces three dots with the ellipsis unicode character",
          type: "boolean"
        },
        completeHTMLDocument: {
          defaultValue: !1,
          describe: "Outputs a complete html document, including `<html>`, `<head>` and `<body>` tags",
          type: "boolean"
        },
        metadata: {
          defaultValue: !1,
          describe: "Enable support for document metadata (defined at the top of the document between `«««` and `»»»` or between `---` and `---`).",
          type: "boolean"
        },
        splitAdjacentBlockquotes: {
          defaultValue: !1,
          describe: "Split adjacent blockquote blocks",
          type: "boolean"
        }
      };
      if (e === !1) return JSON.parse(JSON.stringify(a));
      var r = {};
      for (var n in a) a.hasOwnProperty(n) && (r[n] = a[n].defaultValue);
      return r;
    }
    function f() {
      "use strict";
      var e = l(!0), a = {};
      for (var r in e) e.hasOwnProperty(r) && (a[r] = !0);
      return a;
    }
    var t = {}, g = {}, h = {}, _ = l(!0), p = "vanilla", k = {
      github: {
        omitExtraWLInCodeBlocks: !0,
        simplifiedAutoLink: !0,
        excludeTrailingPunctuationFromURLs: !0,
        literalMidWordUnderscores: !0,
        strikethrough: !0,
        tables: !0,
        tablesHeaderId: !0,
        ghCodeBlocks: !0,
        tasklists: !0,
        disableForced4SpacesIndentedSublists: !0,
        simpleLineBreaks: !0,
        requireSpaceBeforeHeadingText: !0,
        ghCompatibleHeaderId: !0,
        ghMentions: !0,
        backslashEscapesHTMLTags: !0,
        emoji: !0,
        splitAdjacentBlockquotes: !0
      },
      original: {
        noHeaderId: !0,
        ghCodeBlocks: !1
      },
      ghost: {
        omitExtraWLInCodeBlocks: !0,
        parseImgDimensions: !0,
        simplifiedAutoLink: !0,
        excludeTrailingPunctuationFromURLs: !0,
        literalMidWordUnderscores: !0,
        strikethrough: !0,
        tables: !0,
        tablesHeaderId: !0,
        ghCodeBlocks: !0,
        tasklists: !0,
        smoothLivePreview: !0,
        simpleLineBreaks: !0,
        requireSpaceBeforeHeadingText: !0,
        ghMentions: !1,
        encodeEmails: !0
      },
      vanilla: l(!0),
      allOn: f()
    };
    t.helper = {}, t.extensions = {}, t.setOption = function(e, a) {
      "use strict";
      return _[e] = a, this;
    }, t.getOption = function(e) {
      "use strict";
      return _[e];
    }, t.getOptions = function() {
      "use strict";
      return _;
    }, t.resetOptions = function() {
      "use strict";
      _ = l(!0);
    }, t.setFlavor = function(e) {
      "use strict";
      if (!k.hasOwnProperty(e)) throw Error(e + " flavor was not found");
      t.resetOptions();
      var a = k[e];
      p = e;
      for (var r in a) a.hasOwnProperty(r) && (_[r] = a[r]);
    }, t.getFlavor = function() {
      "use strict";
      return p;
    }, t.getFlavorOptions = function(e) {
      "use strict";
      if (k.hasOwnProperty(e)) return k[e];
    }, t.getDefaultOptions = function(e) {
      "use strict";
      return l(e);
    }, t.subParser = function(e, a) {
      "use strict";
      if (t.helper.isString(e)) if (typeof a < "u") g[e] = a;
      else {
        if (g.hasOwnProperty(e)) return g[e];
        throw Error("SubParser named " + e + " not registered!");
      }
    }, t.extension = function(e, a) {
      "use strict";
      if (!t.helper.isString(e)) throw Error("Extension 'name' must be a string");
      if (e = t.helper.stdExtName(e), t.helper.isUndefined(a)) {
        if (!h.hasOwnProperty(e)) throw Error("Extension named " + e + " is not registered!");
        return h[e];
      } else {
        typeof a == "function" && (a = a()), t.helper.isArray(a) || (a = [a]);
        var r = y(a, e);
        if (r.valid) h[e] = a;
        else throw Error(r.error);
      }
    }, t.getAllExtensions = function() {
      "use strict";
      return h;
    }, t.removeExtension = function(e) {
      "use strict";
      delete h[e];
    }, t.resetExtensions = function() {
      "use strict";
      h = {};
    };
    function y(e, a) {
      "use strict";
      var r = a ? "Error in " + a + " extension->" : "Error in unnamed extension", n = {
        valid: !0,
        error: ""
      };
      t.helper.isArray(e) || (e = [e]);
      for (var i = 0; i < e.length; ++i) {
        var c = r + " sub-extension " + i + ": ", s = e[i];
        if (typeof s != "object")
          return n.valid = !1, n.error = c + "must be an object, but " + typeof s + " given", n;
        if (!t.helper.isString(s.type))
          return n.valid = !1, n.error = c + 'property "type" must be a string, but ' + typeof s.type + " given", n;
        var m = s.type = s.type.toLowerCase();
        if (m === "language" && (m = s.type = "lang"), m === "html" && (m = s.type = "output"), m !== "lang" && m !== "output" && m !== "listener")
          return n.valid = !1, n.error = c + "type " + m + ' is not recognized. Valid values: "lang/language", "output/html" or "listener"', n;
        if (m === "listener") {
          if (t.helper.isUndefined(s.listeners))
            return n.valid = !1, n.error = c + '. Extensions of type "listener" must have a property called "listeners"', n;
        } else if (t.helper.isUndefined(s.filter) && t.helper.isUndefined(s.regex))
          return n.valid = !1, n.error = c + m + ' extensions must define either a "regex" property or a "filter" method', n;
        if (s.listeners) {
          if (typeof s.listeners != "object")
            return n.valid = !1, n.error = c + '"listeners" property must be an object but ' + typeof s.listeners + " given", n;
          for (var M in s.listeners) if (s.listeners.hasOwnProperty(M) && typeof s.listeners[M] != "function")
            return n.valid = !1, n.error = c + '"listeners" property must be an hash of [event name]: [callback]. listeners.' + M + " must be a function but " + typeof s.listeners[M] + " given", n;
        }
        if (s.filter) {
          if (typeof s.filter != "function")
            return n.valid = !1, n.error = c + '"filter" must be a function, but ' + typeof s.filter + " given", n;
        } else if (s.regex) {
          if (t.helper.isString(s.regex) && (s.regex = new RegExp(s.regex, "g")), !(s.regex instanceof RegExp))
            return n.valid = !1, n.error = c + '"regex" property must either be a string or a RegExp object, but ' + typeof s.regex + " given", n;
          if (t.helper.isUndefined(s.replace))
            return n.valid = !1, n.error = c + '"regex" extensions must implement a replace string or function', n;
        }
      }
      return n;
    }
    t.validateExtension = function(e) {
      "use strict";
      var a = y(e, null);
      return a.valid ? !0 : (console.warn(a.error), !1);
    }, t.hasOwnProperty("helper") || (t.helper = {}), t.helper.isString = function(e) {
      "use strict";
      return typeof e == "string" || e instanceof String;
    }, t.helper.isFunction = function(e) {
      "use strict";
      return e && {}.toString.call(e) === "[object Function]";
    }, t.helper.isArray = function(e) {
      "use strict";
      return Array.isArray(e);
    }, t.helper.isUndefined = function(e) {
      "use strict";
      return typeof e > "u";
    }, t.helper.forEach = function(e, a) {
      "use strict";
      if (t.helper.isUndefined(e)) throw new Error("obj param is required");
      if (t.helper.isUndefined(a)) throw new Error("callback param is required");
      if (!t.helper.isFunction(a)) throw new Error("callback param must be a function/closure");
      if (typeof e.forEach == "function") e.forEach(a);
      else if (t.helper.isArray(e)) for (var r = 0; r < e.length; r++) a(e[r], r, e);
      else if (typeof e == "object")
        for (var n in e) e.hasOwnProperty(n) && a(e[n], n, e);
      else throw new Error("obj does not seem to be an array or an iterable object");
    }, t.helper.stdExtName = function(e) {
      "use strict";
      return e.replace(/[_?*+\/\\.^-]/g, "").replace(/\s/g, "").toLowerCase();
    };
    function z(e, a) {
      "use strict";
      return "¨E" + a.charCodeAt(0) + "E";
    }
    t.helper.escapeCharactersCallback = z, t.helper.escapeCharacters = function(e, a, r) {
      "use strict";
      var n = "([" + a.replace(/([\[\]\\])/g, "\\$1") + "])";
      r && (n = "\\\\" + n);
      var i = new RegExp(n, "g");
      return e = e.replace(i, z), e;
    }, t.helper.unescapeHTMLEntities = function(e) {
      "use strict";
      return e.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
    };
    var B = function(e, a, r, n) {
      "use strict";
      var i = n || "", c = i.indexOf("g") > -1, s = new RegExp(a + "|" + r, "g" + i.replace(/g/g, "")), m = new RegExp(a, i.replace(/g/g, "")), M = [], P, S, C, o, b;
      do
        for (P = 0; C = s.exec(e); ) if (m.test(C[0]))
          P++ || (S = s.lastIndex, o = S - C[0].length);
        else if (P && !--P) {
          b = C.index + C[0].length;
          var j = {
            left: {
              start: o,
              end: S
            },
            match: {
              start: S,
              end: C.index
            },
            right: {
              start: C.index,
              end: b
            },
            wholeMatch: {
              start: o,
              end: b
            }
          };
          if (M.push(j), !c) return M;
        }
      while (P && (s.lastIndex = S));
      return M;
    };
    t.helper.matchRecursiveRegExp = function(e, a, r, n) {
      "use strict";
      for (var i = B(e, a, r, n), c = [], s = 0; s < i.length; ++s) c.push([
        e.slice(i[s].wholeMatch.start, i[s].wholeMatch.end),
        e.slice(i[s].match.start, i[s].match.end),
        e.slice(i[s].left.start, i[s].left.end),
        e.slice(i[s].right.start, i[s].right.end)
      ]);
      return c;
    }, t.helper.replaceRecursiveRegExp = function(e, a, r, n, i) {
      "use strict";
      if (!t.helper.isFunction(a)) {
        var c = a;
        a = function() {
          return c;
        };
      }
      var s = B(e, r, n, i), m = e, M = s.length;
      if (M > 0) {
        var P = [];
        s[0].wholeMatch.start !== 0 && P.push(e.slice(0, s[0].wholeMatch.start));
        for (var S = 0; S < M; ++S)
          P.push(a(e.slice(s[S].wholeMatch.start, s[S].wholeMatch.end), e.slice(s[S].match.start, s[S].match.end), e.slice(s[S].left.start, s[S].left.end), e.slice(s[S].right.start, s[S].right.end))), S < M - 1 && P.push(e.slice(s[S].wholeMatch.end, s[S + 1].wholeMatch.start));
        s[M - 1].wholeMatch.end < e.length && P.push(e.slice(s[M - 1].wholeMatch.end)), m = P.join("");
      }
      return m;
    }, t.helper.regexIndexOf = function(e, a, r) {
      "use strict";
      if (!t.helper.isString(e)) throw "InvalidArgumentError: first parameter of showdown.helper.regexIndexOf function must be a string";
      if (!(a instanceof RegExp)) throw "InvalidArgumentError: second parameter of showdown.helper.regexIndexOf function must be an instance of RegExp";
      var n = e.substring(r || 0).search(a);
      return n >= 0 ? n + (r || 0) : n;
    }, t.helper.splitAtIndex = function(e, a) {
      "use strict";
      if (!t.helper.isString(e)) throw "InvalidArgumentError: first parameter of showdown.helper.regexIndexOf function must be a string";
      return [e.substring(0, a), e.substring(a)];
    }, t.helper.encodeEmailAddress = function(e) {
      "use strict";
      var a = [
        function(r) {
          return "&#" + r.charCodeAt(0) + ";";
        },
        function(r) {
          return "&#x" + r.charCodeAt(0).toString(16) + ";";
        },
        function(r) {
          return r;
        }
      ];
      return e = e.replace(/./g, function(r) {
        if (r === "@") r = a[Math.floor(Math.random() * 2)](r);
        else {
          var n = Math.random();
          r = n > 0.9 ? a[2](r) : n > 0.45 ? a[1](r) : a[0](r);
        }
        return r;
      }), e;
    }, t.helper.padEnd = function(a, r, n) {
      "use strict";
      return r = r >> 0, n = String(n || " "), a.length > r ? String(a) : (r = r - a.length, r > n.length && (n += n.repeat(r / n.length)), String(a) + n.slice(0, r));
    }, typeof console > "u" && (console = {
      warn: function(e) {
        "use strict";
        alert(e);
      },
      log: function(e) {
        "use strict";
        alert(e);
      },
      error: function(e) {
        "use strict";
        throw e;
      }
    }), t.helper.regexes = { asteriskDashAndColon: /([*_:~])/g }, t.helper.emojis = {
      "+1": "👍",
      "-1": "👎",
      100: "💯",
      1234: "🔢",
      "1st_place_medal": "🥇",
      "2nd_place_medal": "🥈",
      "3rd_place_medal": "🥉",
      "8ball": "🎱",
      a: "🅰️",
      ab: "🆎",
      abc: "🔤",
      abcd: "🔡",
      accept: "🉑",
      aerial_tramway: "🚡",
      airplane: "✈️",
      alarm_clock: "⏰",
      alembic: "⚗️",
      alien: "👽",
      ambulance: "🚑",
      amphora: "🏺",
      anchor: "⚓️",
      angel: "👼",
      anger: "💢",
      angry: "😠",
      anguished: "😧",
      ant: "🐜",
      apple: "🍎",
      aquarius: "♒️",
      aries: "♈️",
      arrow_backward: "◀️",
      arrow_double_down: "⏬",
      arrow_double_up: "⏫",
      arrow_down: "⬇️",
      arrow_down_small: "🔽",
      arrow_forward: "▶️",
      arrow_heading_down: "⤵️",
      arrow_heading_up: "⤴️",
      arrow_left: "⬅️",
      arrow_lower_left: "↙️",
      arrow_lower_right: "↘️",
      arrow_right: "➡️",
      arrow_right_hook: "↪️",
      arrow_up: "⬆️",
      arrow_up_down: "↕️",
      arrow_up_small: "🔼",
      arrow_upper_left: "↖️",
      arrow_upper_right: "↗️",
      arrows_clockwise: "🔃",
      arrows_counterclockwise: "🔄",
      art: "🎨",
      articulated_lorry: "🚛",
      artificial_satellite: "🛰",
      astonished: "😲",
      athletic_shoe: "👟",
      atm: "🏧",
      atom_symbol: "⚛️",
      avocado: "🥑",
      b: "🅱️",
      baby: "👶",
      baby_bottle: "🍼",
      baby_chick: "🐤",
      baby_symbol: "🚼",
      back: "🔙",
      bacon: "🥓",
      badminton: "🏸",
      baggage_claim: "🛄",
      baguette_bread: "🥖",
      balance_scale: "⚖️",
      balloon: "🎈",
      ballot_box: "🗳",
      ballot_box_with_check: "☑️",
      bamboo: "🎍",
      banana: "🍌",
      bangbang: "‼️",
      bank: "🏦",
      bar_chart: "📊",
      barber: "💈",
      baseball: "⚾️",
      basketball: "🏀",
      basketball_man: "⛹️",
      basketball_woman: "⛹️&zwj;♀️",
      bat: "🦇",
      bath: "🛀",
      bathtub: "🛁",
      battery: "🔋",
      beach_umbrella: "🏖",
      bear: "🐻",
      bed: "🛏",
      bee: "🐝",
      beer: "🍺",
      beers: "🍻",
      beetle: "🐞",
      beginner: "🔰",
      bell: "🔔",
      bellhop_bell: "🛎",
      bento: "🍱",
      biking_man: "🚴",
      bike: "🚲",
      biking_woman: "🚴&zwj;♀️",
      bikini: "👙",
      biohazard: "☣️",
      bird: "🐦",
      birthday: "🎂",
      black_circle: "⚫️",
      black_flag: "🏴",
      black_heart: "🖤",
      black_joker: "🃏",
      black_large_square: "⬛️",
      black_medium_small_square: "◾️",
      black_medium_square: "◼️",
      black_nib: "✒️",
      black_small_square: "▪️",
      black_square_button: "🔲",
      blonde_man: "👱",
      blonde_woman: "👱&zwj;♀️",
      blossom: "🌼",
      blowfish: "🐡",
      blue_book: "📘",
      blue_car: "🚙",
      blue_heart: "💙",
      blush: "😊",
      boar: "🐗",
      boat: "⛵️",
      bomb: "💣",
      book: "📖",
      bookmark: "🔖",
      bookmark_tabs: "📑",
      books: "📚",
      boom: "💥",
      boot: "👢",
      bouquet: "💐",
      bowing_man: "🙇",
      bow_and_arrow: "🏹",
      bowing_woman: "🙇&zwj;♀️",
      bowling: "🎳",
      boxing_glove: "🥊",
      boy: "👦",
      bread: "🍞",
      bride_with_veil: "👰",
      bridge_at_night: "🌉",
      briefcase: "💼",
      broken_heart: "💔",
      bug: "🐛",
      building_construction: "🏗",
      bulb: "💡",
      bullettrain_front: "🚅",
      bullettrain_side: "🚄",
      burrito: "🌯",
      bus: "🚌",
      business_suit_levitating: "🕴",
      busstop: "🚏",
      bust_in_silhouette: "👤",
      busts_in_silhouette: "👥",
      butterfly: "🦋",
      cactus: "🌵",
      cake: "🍰",
      calendar: "📆",
      call_me_hand: "🤙",
      calling: "📲",
      camel: "🐫",
      camera: "📷",
      camera_flash: "📸",
      camping: "🏕",
      cancer: "♋️",
      candle: "🕯",
      candy: "🍬",
      canoe: "🛶",
      capital_abcd: "🔠",
      capricorn: "♑️",
      car: "🚗",
      card_file_box: "🗃",
      card_index: "📇",
      card_index_dividers: "🗂",
      carousel_horse: "🎠",
      carrot: "🥕",
      cat: "🐱",
      cat2: "🐈",
      cd: "💿",
      chains: "⛓",
      champagne: "🍾",
      chart: "💹",
      chart_with_downwards_trend: "📉",
      chart_with_upwards_trend: "📈",
      checkered_flag: "🏁",
      cheese: "🧀",
      cherries: "🍒",
      cherry_blossom: "🌸",
      chestnut: "🌰",
      chicken: "🐔",
      children_crossing: "🚸",
      chipmunk: "🐿",
      chocolate_bar: "🍫",
      christmas_tree: "🎄",
      church: "⛪️",
      cinema: "🎦",
      circus_tent: "🎪",
      city_sunrise: "🌇",
      city_sunset: "🌆",
      cityscape: "🏙",
      cl: "🆑",
      clamp: "🗜",
      clap: "👏",
      clapper: "🎬",
      classical_building: "🏛",
      clinking_glasses: "🥂",
      clipboard: "📋",
      clock1: "🕐",
      clock10: "🕙",
      clock1030: "🕥",
      clock11: "🕚",
      clock1130: "🕦",
      clock12: "🕛",
      clock1230: "🕧",
      clock130: "🕜",
      clock2: "🕑",
      clock230: "🕝",
      clock3: "🕒",
      clock330: "🕞",
      clock4: "🕓",
      clock430: "🕟",
      clock5: "🕔",
      clock530: "🕠",
      clock6: "🕕",
      clock630: "🕡",
      clock7: "🕖",
      clock730: "🕢",
      clock8: "🕗",
      clock830: "🕣",
      clock9: "🕘",
      clock930: "🕤",
      closed_book: "📕",
      closed_lock_with_key: "🔐",
      closed_umbrella: "🌂",
      cloud: "☁️",
      cloud_with_lightning: "🌩",
      cloud_with_lightning_and_rain: "⛈",
      cloud_with_rain: "🌧",
      cloud_with_snow: "🌨",
      clown_face: "🤡",
      clubs: "♣️",
      cocktail: "🍸",
      coffee: "☕️",
      coffin: "⚰️",
      cold_sweat: "😰",
      comet: "☄️",
      computer: "💻",
      computer_mouse: "🖱",
      confetti_ball: "🎊",
      confounded: "😖",
      confused: "😕",
      congratulations: "㊗️",
      construction: "🚧",
      construction_worker_man: "👷",
      construction_worker_woman: "👷&zwj;♀️",
      control_knobs: "🎛",
      convenience_store: "🏪",
      cookie: "🍪",
      cool: "🆒",
      policeman: "👮",
      copyright: "©️",
      corn: "🌽",
      couch_and_lamp: "🛋",
      couple: "👫",
      couple_with_heart_woman_man: "💑",
      couple_with_heart_man_man: "👨&zwj;❤️&zwj;👨",
      couple_with_heart_woman_woman: "👩&zwj;❤️&zwj;👩",
      couplekiss_man_man: "👨&zwj;❤️&zwj;💋&zwj;👨",
      couplekiss_man_woman: "💏",
      couplekiss_woman_woman: "👩&zwj;❤️&zwj;💋&zwj;👩",
      cow: "🐮",
      cow2: "🐄",
      cowboy_hat_face: "🤠",
      crab: "🦀",
      crayon: "🖍",
      credit_card: "💳",
      crescent_moon: "🌙",
      cricket: "🏏",
      crocodile: "🐊",
      croissant: "🥐",
      crossed_fingers: "🤞",
      crossed_flags: "🎌",
      crossed_swords: "⚔️",
      crown: "👑",
      cry: "😢",
      crying_cat_face: "😿",
      crystal_ball: "🔮",
      cucumber: "🥒",
      cupid: "💘",
      curly_loop: "➰",
      currency_exchange: "💱",
      curry: "🍛",
      custard: "🍮",
      customs: "🛃",
      cyclone: "🌀",
      dagger: "🗡",
      dancer: "💃",
      dancing_women: "👯",
      dancing_men: "👯&zwj;♂️",
      dango: "🍡",
      dark_sunglasses: "🕶",
      dart: "🎯",
      dash: "💨",
      date: "📅",
      deciduous_tree: "🌳",
      deer: "🦌",
      department_store: "🏬",
      derelict_house: "🏚",
      desert: "🏜",
      desert_island: "🏝",
      desktop_computer: "🖥",
      male_detective: "🕵️",
      diamond_shape_with_a_dot_inside: "💠",
      diamonds: "♦️",
      disappointed: "😞",
      disappointed_relieved: "😥",
      dizzy: "💫",
      dizzy_face: "😵",
      do_not_litter: "🚯",
      dog: "🐶",
      dog2: "🐕",
      dollar: "💵",
      dolls: "🎎",
      dolphin: "🐬",
      door: "🚪",
      doughnut: "🍩",
      dove: "🕊",
      dragon: "🐉",
      dragon_face: "🐲",
      dress: "👗",
      dromedary_camel: "🐪",
      drooling_face: "🤤",
      droplet: "💧",
      drum: "🥁",
      duck: "🦆",
      dvd: "📀",
      "e-mail": "📧",
      eagle: "🦅",
      ear: "👂",
      ear_of_rice: "🌾",
      earth_africa: "🌍",
      earth_americas: "🌎",
      earth_asia: "🌏",
      egg: "🥚",
      eggplant: "🍆",
      eight_pointed_black_star: "✴️",
      eight_spoked_asterisk: "✳️",
      electric_plug: "🔌",
      elephant: "🐘",
      email: "✉️",
      end: "🔚",
      envelope_with_arrow: "📩",
      euro: "💶",
      european_castle: "🏰",
      european_post_office: "🏤",
      evergreen_tree: "🌲",
      exclamation: "❗️",
      expressionless: "😑",
      eye: "👁",
      eye_speech_bubble: "👁&zwj;🗨",
      eyeglasses: "👓",
      eyes: "👀",
      face_with_head_bandage: "🤕",
      face_with_thermometer: "🤒",
      fist_oncoming: "👊",
      factory: "🏭",
      fallen_leaf: "🍂",
      family_man_woman_boy: "👪",
      family_man_boy: "👨&zwj;👦",
      family_man_boy_boy: "👨&zwj;👦&zwj;👦",
      family_man_girl: "👨&zwj;👧",
      family_man_girl_boy: "👨&zwj;👧&zwj;👦",
      family_man_girl_girl: "👨&zwj;👧&zwj;👧",
      family_man_man_boy: "👨&zwj;👨&zwj;👦",
      family_man_man_boy_boy: "👨&zwj;👨&zwj;👦&zwj;👦",
      family_man_man_girl: "👨&zwj;👨&zwj;👧",
      family_man_man_girl_boy: "👨&zwj;👨&zwj;👧&zwj;👦",
      family_man_man_girl_girl: "👨&zwj;👨&zwj;👧&zwj;👧",
      family_man_woman_boy_boy: "👨&zwj;👩&zwj;👦&zwj;👦",
      family_man_woman_girl: "👨&zwj;👩&zwj;👧",
      family_man_woman_girl_boy: "👨&zwj;👩&zwj;👧&zwj;👦",
      family_man_woman_girl_girl: "👨&zwj;👩&zwj;👧&zwj;👧",
      family_woman_boy: "👩&zwj;👦",
      family_woman_boy_boy: "👩&zwj;👦&zwj;👦",
      family_woman_girl: "👩&zwj;👧",
      family_woman_girl_boy: "👩&zwj;👧&zwj;👦",
      family_woman_girl_girl: "👩&zwj;👧&zwj;👧",
      family_woman_woman_boy: "👩&zwj;👩&zwj;👦",
      family_woman_woman_boy_boy: "👩&zwj;👩&zwj;👦&zwj;👦",
      family_woman_woman_girl: "👩&zwj;👩&zwj;👧",
      family_woman_woman_girl_boy: "👩&zwj;👩&zwj;👧&zwj;👦",
      family_woman_woman_girl_girl: "👩&zwj;👩&zwj;👧&zwj;👧",
      fast_forward: "⏩",
      fax: "📠",
      fearful: "😨",
      feet: "🐾",
      female_detective: "🕵️&zwj;♀️",
      ferris_wheel: "🎡",
      ferry: "⛴",
      field_hockey: "🏑",
      file_cabinet: "🗄",
      file_folder: "📁",
      film_projector: "📽",
      film_strip: "🎞",
      fire: "🔥",
      fire_engine: "🚒",
      fireworks: "🎆",
      first_quarter_moon: "🌓",
      first_quarter_moon_with_face: "🌛",
      fish: "🐟",
      fish_cake: "🍥",
      fishing_pole_and_fish: "🎣",
      fist_raised: "✊",
      fist_left: "🤛",
      fist_right: "🤜",
      flags: "🎏",
      flashlight: "🔦",
      fleur_de_lis: "⚜️",
      flight_arrival: "🛬",
      flight_departure: "🛫",
      floppy_disk: "💾",
      flower_playing_cards: "🎴",
      flushed: "😳",
      fog: "🌫",
      foggy: "🌁",
      football: "🏈",
      footprints: "👣",
      fork_and_knife: "🍴",
      fountain: "⛲️",
      fountain_pen: "🖋",
      four_leaf_clover: "🍀",
      fox_face: "🦊",
      framed_picture: "🖼",
      free: "🆓",
      fried_egg: "🍳",
      fried_shrimp: "🍤",
      fries: "🍟",
      frog: "🐸",
      frowning: "😦",
      frowning_face: "☹️",
      frowning_man: "🙍&zwj;♂️",
      frowning_woman: "🙍",
      middle_finger: "🖕",
      fuelpump: "⛽️",
      full_moon: "🌕",
      full_moon_with_face: "🌝",
      funeral_urn: "⚱️",
      game_die: "🎲",
      gear: "⚙️",
      gem: "💎",
      gemini: "♊️",
      ghost: "👻",
      gift: "🎁",
      gift_heart: "💝",
      girl: "👧",
      globe_with_meridians: "🌐",
      goal_net: "🥅",
      goat: "🐐",
      golf: "⛳️",
      golfing_man: "🏌️",
      golfing_woman: "🏌️&zwj;♀️",
      gorilla: "🦍",
      grapes: "🍇",
      green_apple: "🍏",
      green_book: "📗",
      green_heart: "💚",
      green_salad: "🥗",
      grey_exclamation: "❕",
      grey_question: "❔",
      grimacing: "😬",
      grin: "😁",
      grinning: "😀",
      guardsman: "💂",
      guardswoman: "💂&zwj;♀️",
      guitar: "🎸",
      gun: "🔫",
      haircut_woman: "💇",
      haircut_man: "💇&zwj;♂️",
      hamburger: "🍔",
      hammer: "🔨",
      hammer_and_pick: "⚒",
      hammer_and_wrench: "🛠",
      hamster: "🐹",
      hand: "✋",
      handbag: "👜",
      handshake: "🤝",
      hankey: "💩",
      hatched_chick: "🐥",
      hatching_chick: "🐣",
      headphones: "🎧",
      hear_no_evil: "🙉",
      heart: "❤️",
      heart_decoration: "💟",
      heart_eyes: "😍",
      heart_eyes_cat: "😻",
      heartbeat: "💓",
      heartpulse: "💗",
      hearts: "♥️",
      heavy_check_mark: "✔️",
      heavy_division_sign: "➗",
      heavy_dollar_sign: "💲",
      heavy_heart_exclamation: "❣️",
      heavy_minus_sign: "➖",
      heavy_multiplication_x: "✖️",
      heavy_plus_sign: "➕",
      helicopter: "🚁",
      herb: "🌿",
      hibiscus: "🌺",
      high_brightness: "🔆",
      high_heel: "👠",
      hocho: "🔪",
      hole: "🕳",
      honey_pot: "🍯",
      horse: "🐴",
      horse_racing: "🏇",
      hospital: "🏥",
      hot_pepper: "🌶",
      hotdog: "🌭",
      hotel: "🏨",
      hotsprings: "♨️",
      hourglass: "⌛️",
      hourglass_flowing_sand: "⏳",
      house: "🏠",
      house_with_garden: "🏡",
      houses: "🏘",
      hugs: "🤗",
      hushed: "😯",
      ice_cream: "🍨",
      ice_hockey: "🏒",
      ice_skate: "⛸",
      icecream: "🍦",
      id: "🆔",
      ideograph_advantage: "🉐",
      imp: "👿",
      inbox_tray: "📥",
      incoming_envelope: "📨",
      tipping_hand_woman: "💁",
      information_source: "ℹ️",
      innocent: "😇",
      interrobang: "⁉️",
      iphone: "📱",
      izakaya_lantern: "🏮",
      jack_o_lantern: "🎃",
      japan: "🗾",
      japanese_castle: "🏯",
      japanese_goblin: "👺",
      japanese_ogre: "👹",
      jeans: "👖",
      joy: "😂",
      joy_cat: "😹",
      joystick: "🕹",
      kaaba: "🕋",
      key: "🔑",
      keyboard: "⌨️",
      keycap_ten: "🔟",
      kick_scooter: "🛴",
      kimono: "👘",
      kiss: "💋",
      kissing: "😗",
      kissing_cat: "😽",
      kissing_closed_eyes: "😚",
      kissing_heart: "😘",
      kissing_smiling_eyes: "😙",
      kiwi_fruit: "🥝",
      koala: "🐨",
      koko: "🈁",
      label: "🏷",
      large_blue_circle: "🔵",
      large_blue_diamond: "🔷",
      large_orange_diamond: "🔶",
      last_quarter_moon: "🌗",
      last_quarter_moon_with_face: "🌜",
      latin_cross: "✝️",
      laughing: "😆",
      leaves: "🍃",
      ledger: "📒",
      left_luggage: "🛅",
      left_right_arrow: "↔️",
      leftwards_arrow_with_hook: "↩️",
      lemon: "🍋",
      leo: "♌️",
      leopard: "🐆",
      level_slider: "🎚",
      libra: "♎️",
      light_rail: "🚈",
      link: "🔗",
      lion: "🦁",
      lips: "👄",
      lipstick: "💄",
      lizard: "🦎",
      lock: "🔒",
      lock_with_ink_pen: "🔏",
      lollipop: "🍭",
      loop: "➿",
      loud_sound: "🔊",
      loudspeaker: "📢",
      love_hotel: "🏩",
      love_letter: "💌",
      low_brightness: "🔅",
      lying_face: "🤥",
      m: "Ⓜ️",
      mag: "🔍",
      mag_right: "🔎",
      mahjong: "🀄️",
      mailbox: "📫",
      mailbox_closed: "📪",
      mailbox_with_mail: "📬",
      mailbox_with_no_mail: "📭",
      man: "👨",
      man_artist: "👨&zwj;🎨",
      man_astronaut: "👨&zwj;🚀",
      man_cartwheeling: "🤸&zwj;♂️",
      man_cook: "👨&zwj;🍳",
      man_dancing: "🕺",
      man_facepalming: "🤦&zwj;♂️",
      man_factory_worker: "👨&zwj;🏭",
      man_farmer: "👨&zwj;🌾",
      man_firefighter: "👨&zwj;🚒",
      man_health_worker: "👨&zwj;⚕️",
      man_in_tuxedo: "🤵",
      man_judge: "👨&zwj;⚖️",
      man_juggling: "🤹&zwj;♂️",
      man_mechanic: "👨&zwj;🔧",
      man_office_worker: "👨&zwj;💼",
      man_pilot: "👨&zwj;✈️",
      man_playing_handball: "🤾&zwj;♂️",
      man_playing_water_polo: "🤽&zwj;♂️",
      man_scientist: "👨&zwj;🔬",
      man_shrugging: "🤷&zwj;♂️",
      man_singer: "👨&zwj;🎤",
      man_student: "👨&zwj;🎓",
      man_teacher: "👨&zwj;🏫",
      man_technologist: "👨&zwj;💻",
      man_with_gua_pi_mao: "👲",
      man_with_turban: "👳",
      tangerine: "🍊",
      mans_shoe: "👞",
      mantelpiece_clock: "🕰",
      maple_leaf: "🍁",
      martial_arts_uniform: "🥋",
      mask: "😷",
      massage_woman: "💆",
      massage_man: "💆&zwj;♂️",
      meat_on_bone: "🍖",
      medal_military: "🎖",
      medal_sports: "🏅",
      mega: "📣",
      melon: "🍈",
      memo: "📝",
      men_wrestling: "🤼&zwj;♂️",
      menorah: "🕎",
      mens: "🚹",
      metal: "🤘",
      metro: "🚇",
      microphone: "🎤",
      microscope: "🔬",
      milk_glass: "🥛",
      milky_way: "🌌",
      minibus: "🚐",
      minidisc: "💽",
      mobile_phone_off: "📴",
      money_mouth_face: "🤑",
      money_with_wings: "💸",
      moneybag: "💰",
      monkey: "🐒",
      monkey_face: "🐵",
      monorail: "🚝",
      moon: "🌔",
      mortar_board: "🎓",
      mosque: "🕌",
      motor_boat: "🛥",
      motor_scooter: "🛵",
      motorcycle: "🏍",
      motorway: "🛣",
      mount_fuji: "🗻",
      mountain: "⛰",
      mountain_biking_man: "🚵",
      mountain_biking_woman: "🚵&zwj;♀️",
      mountain_cableway: "🚠",
      mountain_railway: "🚞",
      mountain_snow: "🏔",
      mouse: "🐭",
      mouse2: "🐁",
      movie_camera: "🎥",
      moyai: "🗿",
      mrs_claus: "🤶",
      muscle: "💪",
      mushroom: "🍄",
      musical_keyboard: "🎹",
      musical_note: "🎵",
      musical_score: "🎼",
      mute: "🔇",
      nail_care: "💅",
      name_badge: "📛",
      national_park: "🏞",
      nauseated_face: "🤢",
      necktie: "👔",
      negative_squared_cross_mark: "❎",
      nerd_face: "🤓",
      neutral_face: "😐",
      new: "🆕",
      new_moon: "🌑",
      new_moon_with_face: "🌚",
      newspaper: "📰",
      newspaper_roll: "🗞",
      next_track_button: "⏭",
      ng: "🆖",
      no_good_man: "🙅&zwj;♂️",
      no_good_woman: "🙅",
      night_with_stars: "🌃",
      no_bell: "🔕",
      no_bicycles: "🚳",
      no_entry: "⛔️",
      no_entry_sign: "🚫",
      no_mobile_phones: "📵",
      no_mouth: "😶",
      no_pedestrians: "🚷",
      no_smoking: "🚭",
      "non-potable_water": "🚱",
      nose: "👃",
      notebook: "📓",
      notebook_with_decorative_cover: "📔",
      notes: "🎶",
      nut_and_bolt: "🔩",
      o: "⭕️",
      o2: "🅾️",
      ocean: "🌊",
      octopus: "🐙",
      oden: "🍢",
      office: "🏢",
      oil_drum: "🛢",
      ok: "🆗",
      ok_hand: "👌",
      ok_man: "🙆&zwj;♂️",
      ok_woman: "🙆",
      old_key: "🗝",
      older_man: "👴",
      older_woman: "👵",
      om: "🕉",
      on: "🔛",
      oncoming_automobile: "🚘",
      oncoming_bus: "🚍",
      oncoming_police_car: "🚔",
      oncoming_taxi: "🚖",
      open_file_folder: "📂",
      open_hands: "👐",
      open_mouth: "😮",
      open_umbrella: "☂️",
      ophiuchus: "⛎",
      orange_book: "📙",
      orthodox_cross: "☦️",
      outbox_tray: "📤",
      owl: "🦉",
      ox: "🐂",
      package: "📦",
      page_facing_up: "📄",
      page_with_curl: "📃",
      pager: "📟",
      paintbrush: "🖌",
      palm_tree: "🌴",
      pancakes: "🥞",
      panda_face: "🐼",
      paperclip: "📎",
      paperclips: "🖇",
      parasol_on_ground: "⛱",
      parking: "🅿️",
      part_alternation_mark: "〽️",
      partly_sunny: "⛅️",
      passenger_ship: "🛳",
      passport_control: "🛂",
      pause_button: "⏸",
      peace_symbol: "☮️",
      peach: "🍑",
      peanuts: "🥜",
      pear: "🍐",
      pen: "🖊",
      pencil2: "✏️",
      penguin: "🐧",
      pensive: "😔",
      performing_arts: "🎭",
      persevere: "😣",
      person_fencing: "🤺",
      pouting_woman: "🙎",
      phone: "☎️",
      pick: "⛏",
      pig: "🐷",
      pig2: "🐖",
      pig_nose: "🐽",
      pill: "💊",
      pineapple: "🍍",
      ping_pong: "🏓",
      pisces: "♓️",
      pizza: "🍕",
      place_of_worship: "🛐",
      plate_with_cutlery: "🍽",
      play_or_pause_button: "⏯",
      point_down: "👇",
      point_left: "👈",
      point_right: "👉",
      point_up: "☝️",
      point_up_2: "👆",
      police_car: "🚓",
      policewoman: "👮&zwj;♀️",
      poodle: "🐩",
      popcorn: "🍿",
      post_office: "🏣",
      postal_horn: "📯",
      postbox: "📮",
      potable_water: "🚰",
      potato: "🥔",
      pouch: "👝",
      poultry_leg: "🍗",
      pound: "💷",
      rage: "😡",
      pouting_cat: "😾",
      pouting_man: "🙎&zwj;♂️",
      pray: "🙏",
      prayer_beads: "📿",
      pregnant_woman: "🤰",
      previous_track_button: "⏮",
      prince: "🤴",
      princess: "👸",
      printer: "🖨",
      purple_heart: "💜",
      purse: "👛",
      pushpin: "📌",
      put_litter_in_its_place: "🚮",
      question: "❓",
      rabbit: "🐰",
      rabbit2: "🐇",
      racehorse: "🐎",
      racing_car: "🏎",
      radio: "📻",
      radio_button: "🔘",
      radioactive: "☢️",
      railway_car: "🚃",
      railway_track: "🛤",
      rainbow: "🌈",
      rainbow_flag: "🏳️&zwj;🌈",
      raised_back_of_hand: "🤚",
      raised_hand_with_fingers_splayed: "🖐",
      raised_hands: "🙌",
      raising_hand_woman: "🙋",
      raising_hand_man: "🙋&zwj;♂️",
      ram: "🐏",
      ramen: "🍜",
      rat: "🐀",
      record_button: "⏺",
      recycle: "♻️",
      red_circle: "🔴",
      registered: "®️",
      relaxed: "☺️",
      relieved: "😌",
      reminder_ribbon: "🎗",
      repeat: "🔁",
      repeat_one: "🔂",
      rescue_worker_helmet: "⛑",
      restroom: "🚻",
      revolving_hearts: "💞",
      rewind: "⏪",
      rhinoceros: "🦏",
      ribbon: "🎀",
      rice: "🍚",
      rice_ball: "🍙",
      rice_cracker: "🍘",
      rice_scene: "🎑",
      right_anger_bubble: "🗯",
      ring: "💍",
      robot: "🤖",
      rocket: "🚀",
      rofl: "🤣",
      roll_eyes: "🙄",
      roller_coaster: "🎢",
      rooster: "🐓",
      rose: "🌹",
      rosette: "🏵",
      rotating_light: "🚨",
      round_pushpin: "📍",
      rowing_man: "🚣",
      rowing_woman: "🚣&zwj;♀️",
      rugby_football: "🏉",
      running_man: "🏃",
      running_shirt_with_sash: "🎽",
      running_woman: "🏃&zwj;♀️",
      sa: "🈂️",
      sagittarius: "♐️",
      sake: "🍶",
      sandal: "👡",
      santa: "🎅",
      satellite: "📡",
      saxophone: "🎷",
      school: "🏫",
      school_satchel: "🎒",
      scissors: "✂️",
      scorpion: "🦂",
      scorpius: "♏️",
      scream: "😱",
      scream_cat: "🙀",
      scroll: "📜",
      seat: "💺",
      secret: "㊙️",
      see_no_evil: "🙈",
      seedling: "🌱",
      selfie: "🤳",
      shallow_pan_of_food: "🥘",
      shamrock: "☘️",
      shark: "🦈",
      shaved_ice: "🍧",
      sheep: "🐑",
      shell: "🐚",
      shield: "🛡",
      shinto_shrine: "⛩",
      ship: "🚢",
      shirt: "👕",
      shopping: "🛍",
      shopping_cart: "🛒",
      shower: "🚿",
      shrimp: "🦐",
      signal_strength: "📶",
      six_pointed_star: "🔯",
      ski: "🎿",
      skier: "⛷",
      skull: "💀",
      skull_and_crossbones: "☠️",
      sleeping: "😴",
      sleeping_bed: "🛌",
      sleepy: "😪",
      slightly_frowning_face: "🙁",
      slightly_smiling_face: "🙂",
      slot_machine: "🎰",
      small_airplane: "🛩",
      small_blue_diamond: "🔹",
      small_orange_diamond: "🔸",
      small_red_triangle: "🔺",
      small_red_triangle_down: "🔻",
      smile: "😄",
      smile_cat: "😸",
      smiley: "😃",
      smiley_cat: "😺",
      smiling_imp: "😈",
      smirk: "😏",
      smirk_cat: "😼",
      smoking: "🚬",
      snail: "🐌",
      snake: "🐍",
      sneezing_face: "🤧",
      snowboarder: "🏂",
      snowflake: "❄️",
      snowman: "⛄️",
      snowman_with_snow: "☃️",
      sob: "😭",
      soccer: "⚽️",
      soon: "🔜",
      sos: "🆘",
      sound: "🔉",
      space_invader: "👾",
      spades: "♠️",
      spaghetti: "🍝",
      sparkle: "❇️",
      sparkler: "🎇",
      sparkles: "✨",
      sparkling_heart: "💖",
      speak_no_evil: "🙊",
      speaker: "🔈",
      speaking_head: "🗣",
      speech_balloon: "💬",
      speedboat: "🚤",
      spider: "🕷",
      spider_web: "🕸",
      spiral_calendar: "🗓",
      spiral_notepad: "🗒",
      spoon: "🥄",
      squid: "🦑",
      stadium: "🏟",
      star: "⭐️",
      star2: "🌟",
      star_and_crescent: "☪️",
      star_of_david: "✡️",
      stars: "🌠",
      station: "🚉",
      statue_of_liberty: "🗽",
      steam_locomotive: "🚂",
      stew: "🍲",
      stop_button: "⏹",
      stop_sign: "🛑",
      stopwatch: "⏱",
      straight_ruler: "📏",
      strawberry: "🍓",
      stuck_out_tongue: "😛",
      stuck_out_tongue_closed_eyes: "😝",
      stuck_out_tongue_winking_eye: "😜",
      studio_microphone: "🎙",
      stuffed_flatbread: "🥙",
      sun_behind_large_cloud: "🌥",
      sun_behind_rain_cloud: "🌦",
      sun_behind_small_cloud: "🌤",
      sun_with_face: "🌞",
      sunflower: "🌻",
      sunglasses: "😎",
      sunny: "☀️",
      sunrise: "🌅",
      sunrise_over_mountains: "🌄",
      surfing_man: "🏄",
      surfing_woman: "🏄&zwj;♀️",
      sushi: "🍣",
      suspension_railway: "🚟",
      sweat: "😓",
      sweat_drops: "💦",
      sweat_smile: "😅",
      sweet_potato: "🍠",
      swimming_man: "🏊",
      swimming_woman: "🏊&zwj;♀️",
      symbols: "🔣",
      synagogue: "🕍",
      syringe: "💉",
      taco: "🌮",
      tada: "🎉",
      tanabata_tree: "🎋",
      taurus: "♉️",
      taxi: "🚕",
      tea: "🍵",
      telephone_receiver: "📞",
      telescope: "🔭",
      tennis: "🎾",
      tent: "⛺️",
      thermometer: "🌡",
      thinking: "🤔",
      thought_balloon: "💭",
      ticket: "🎫",
      tickets: "🎟",
      tiger: "🐯",
      tiger2: "🐅",
      timer_clock: "⏲",
      tipping_hand_man: "💁&zwj;♂️",
      tired_face: "😫",
      tm: "™️",
      toilet: "🚽",
      tokyo_tower: "🗼",
      tomato: "🍅",
      tongue: "👅",
      top: "🔝",
      tophat: "🎩",
      tornado: "🌪",
      trackball: "🖲",
      tractor: "🚜",
      traffic_light: "🚥",
      train: "🚋",
      train2: "🚆",
      tram: "🚊",
      triangular_flag_on_post: "🚩",
      triangular_ruler: "📐",
      trident: "🔱",
      triumph: "😤",
      trolleybus: "🚎",
      trophy: "🏆",
      tropical_drink: "🍹",
      tropical_fish: "🐠",
      truck: "🚚",
      trumpet: "🎺",
      tulip: "🌷",
      tumbler_glass: "🥃",
      turkey: "🦃",
      turtle: "🐢",
      tv: "📺",
      twisted_rightwards_arrows: "🔀",
      two_hearts: "💕",
      two_men_holding_hands: "👬",
      two_women_holding_hands: "👭",
      u5272: "🈹",
      u5408: "🈴",
      u55b6: "🈺",
      u6307: "🈯️",
      u6708: "🈷️",
      u6709: "🈶",
      u6e80: "🈵",
      u7121: "🈚️",
      u7533: "🈸",
      u7981: "🈲",
      u7a7a: "🈳",
      umbrella: "☔️",
      unamused: "😒",
      underage: "🔞",
      unicorn: "🦄",
      unlock: "🔓",
      up: "🆙",
      upside_down_face: "🙃",
      v: "✌️",
      vertical_traffic_light: "🚦",
      vhs: "📼",
      vibration_mode: "📳",
      video_camera: "📹",
      video_game: "🎮",
      violin: "🎻",
      virgo: "♍️",
      volcano: "🌋",
      volleyball: "🏐",
      vs: "🆚",
      vulcan_salute: "🖖",
      walking_man: "🚶",
      walking_woman: "🚶&zwj;♀️",
      waning_crescent_moon: "🌘",
      waning_gibbous_moon: "🌖",
      warning: "⚠️",
      wastebasket: "🗑",
      watch: "⌚️",
      water_buffalo: "🐃",
      watermelon: "🍉",
      wave: "👋",
      wavy_dash: "〰️",
      waxing_crescent_moon: "🌒",
      wc: "🚾",
      weary: "😩",
      wedding: "💒",
      weight_lifting_man: "🏋️",
      weight_lifting_woman: "🏋️&zwj;♀️",
      whale: "🐳",
      whale2: "🐋",
      wheel_of_dharma: "☸️",
      wheelchair: "♿️",
      white_check_mark: "✅",
      white_circle: "⚪️",
      white_flag: "🏳️",
      white_flower: "💮",
      white_large_square: "⬜️",
      white_medium_small_square: "◽️",
      white_medium_square: "◻️",
      white_small_square: "▫️",
      white_square_button: "🔳",
      wilted_flower: "🥀",
      wind_chime: "🎐",
      wind_face: "🌬",
      wine_glass: "🍷",
      wink: "😉",
      wolf: "🐺",
      woman: "👩",
      woman_artist: "👩&zwj;🎨",
      woman_astronaut: "👩&zwj;🚀",
      woman_cartwheeling: "🤸&zwj;♀️",
      woman_cook: "👩&zwj;🍳",
      woman_facepalming: "🤦&zwj;♀️",
      woman_factory_worker: "👩&zwj;🏭",
      woman_farmer: "👩&zwj;🌾",
      woman_firefighter: "👩&zwj;🚒",
      woman_health_worker: "👩&zwj;⚕️",
      woman_judge: "👩&zwj;⚖️",
      woman_juggling: "🤹&zwj;♀️",
      woman_mechanic: "👩&zwj;🔧",
      woman_office_worker: "👩&zwj;💼",
      woman_pilot: "👩&zwj;✈️",
      woman_playing_handball: "🤾&zwj;♀️",
      woman_playing_water_polo: "🤽&zwj;♀️",
      woman_scientist: "👩&zwj;🔬",
      woman_shrugging: "🤷&zwj;♀️",
      woman_singer: "👩&zwj;🎤",
      woman_student: "👩&zwj;🎓",
      woman_teacher: "👩&zwj;🏫",
      woman_technologist: "👩&zwj;💻",
      woman_with_turban: "👳&zwj;♀️",
      womans_clothes: "👚",
      womans_hat: "👒",
      women_wrestling: "🤼&zwj;♀️",
      womens: "🚺",
      world_map: "🗺",
      worried: "😟",
      wrench: "🔧",
      writing_hand: "✍️",
      x: "❌",
      yellow_heart: "💛",
      yen: "💴",
      yin_yang: "☯️",
      yum: "😋",
      zap: "⚡️",
      zipper_mouth_face: "🤐",
      zzz: "💤",
      octocat: '<img alt=":octocat:" height="20" width="20" align="absmiddle" src="https://assets-cdn.github.com/images/icons/emoji/octocat.png">',
      showdown: `<span style="font-family: 'Anonymous Pro', monospace; text-decoration: underline; text-decoration-style: dashed; text-decoration-color: #3e8b8a;text-underline-position: under;">S</span>`
    }, t.Converter = function(e) {
      "use strict";
      var a = {}, r = [], n = [], i = {}, c = p, s = {
        parsed: {},
        raw: "",
        format: ""
      };
      m();
      function m() {
        e = e || {};
        for (var o in _) _.hasOwnProperty(o) && (a[o] = _[o]);
        if (typeof e == "object")
          for (var b in e) e.hasOwnProperty(b) && (a[b] = e[b]);
        else throw Error("Converter expects the passed parameter to be an object, but " + typeof e + " was passed instead.");
        a.extensions && t.helper.forEach(a.extensions, M);
      }
      function M(o, b) {
        if (b = b || null, t.helper.isString(o))
          if (o = t.helper.stdExtName(o), b = o, t.extensions[o]) {
            console.warn("DEPRECATION WARNING: " + o + " is an old extension that uses a deprecated loading method.Please inform the developer that the extension should be updated!"), P(t.extensions[o], o);
            return;
          } else if (!t.helper.isUndefined(h[o])) o = h[o];
          else throw Error('Extension "' + o + '" could not be loaded. It was either not found or is not a valid extension.');
        typeof o == "function" && (o = o()), t.helper.isArray(o) || (o = [o]);
        var j = y(o, b);
        if (!j.valid) throw Error(j.error);
        for (var T = 0; T < o.length; ++T) {
          switch (o[T].type) {
            case "lang":
              r.push(o[T]);
              break;
            case "output":
              n.push(o[T]);
              break;
          }
          if (o[T].hasOwnProperty("listeners"))
            for (var N in o[T].listeners) o[T].listeners.hasOwnProperty(N) && S(N, o[T].listeners[N]);
        }
      }
      function P(o, b) {
        typeof o == "function" && (o = o(new t.Converter())), t.helper.isArray(o) || (o = [o]);
        var j = y(o, b);
        if (!j.valid) throw Error(j.error);
        for (var T = 0; T < o.length; ++T) switch (o[T].type) {
          case "lang":
            r.push(o[T]);
            break;
          case "output":
            n.push(o[T]);
            break;
          default:
            throw Error("Extension loader error: Type unrecognized!!!");
        }
      }
      function S(o, b) {
        if (!t.helper.isString(o)) throw Error("Invalid argument in converter.listen() method: name must be a string, but " + typeof o + " given");
        if (typeof b != "function") throw Error("Invalid argument in converter.listen() method: callback must be a function, but " + typeof b + " given");
        i.hasOwnProperty(o) || (i[o] = []), i[o].push(b);
      }
      function C(o) {
        var b = o.match(/^\s*/)[0].length, j = new RegExp("^\\s{0," + b + "}", "gm");
        return o.replace(j, "");
      }
      this._dispatch = function(b, j, T, N) {
        if (i.hasOwnProperty(b)) for (var A = 0; A < i[b].length; ++A) {
          var E = i[b][A](b, j, this, T, N);
          E && typeof E < "u" && (j = E);
        }
        return j;
      }, this.listen = function(o, b) {
        return S(o, b), this;
      }, this.makeHtml = function(o) {
        if (!o) return o;
        var b = {
          gHtmlBlocks: [],
          gHtmlMdBlocks: [],
          gHtmlSpans: [],
          gUrls: {},
          gTitles: {},
          gDimensions: {},
          gListLevel: 0,
          hashLinkCounts: {},
          langExtensions: r,
          outputModifiers: n,
          converter: this,
          ghCodeBlocks: [],
          metadata: {
            parsed: {},
            raw: "",
            format: ""
          }
        };
        return o = o.replace(/¨/g, "¨T"), o = o.replace(/\$/g, "¨D"), o = o.replace(/\r\n/g, `
`), o = o.replace(/\r/g, `
`), o = o.replace(/\u00A0/g, "&nbsp;"), a.smartIndentationFix && (o = C(o)), o = `

` + o + `

`, o = t.subParser("detab")(o, a, b), o = o.replace(/^[ \t]+$/gm, ""), t.helper.forEach(r, function(j) {
          o = t.subParser("runExtension")(j, o, a, b);
        }), o = t.subParser("metadata")(o, a, b), o = t.subParser("hashPreCodeTags")(o, a, b), o = t.subParser("githubCodeBlocks")(o, a, b), o = t.subParser("hashHTMLBlocks")(o, a, b), o = t.subParser("hashCodeTags")(o, a, b), o = t.subParser("stripLinkDefinitions")(o, a, b), o = t.subParser("blockGamut")(o, a, b), o = t.subParser("unhashHTMLSpans")(o, a, b), o = t.subParser("unescapeSpecialChars")(o, a, b), o = o.replace(/¨D/g, "$$"), o = o.replace(/¨T/g, "¨"), o = t.subParser("completeHTMLDocument")(o, a, b), t.helper.forEach(n, function(j) {
          o = t.subParser("runExtension")(j, o, a, b);
        }), s = b.metadata, o;
      }, this.makeMarkdown = this.makeMd = function(o, b) {
        if (o = o.replace(/\r\n/g, `
`), o = o.replace(/\r/g, `
`), o = o.replace(/>[ \t]+</, ">¨NBSP;<"), !b) if (window && window.document) b = window.document;
        else throw new Error("HTMLParser is undefined. If in a webworker or nodejs environment, you need to provide a WHATWG DOM and HTML such as JSDOM");
        var j = b.createElement("div");
        j.innerHTML = o;
        var T = { preList: L(j) };
        w(j);
        for (var N = j.childNodes, A = "", E = 0; E < N.length; E++) A += t.subParser("makeMarkdown.node")(N[E], T);
        function w(Z) {
          for (var X = 0; X < Z.childNodes.length; ++X) {
            var J = Z.childNodes[X];
            J.nodeType === 3 ? !/\S/.test(J.nodeValue) && !/^[ ]+$/.test(J.nodeValue) ? (Z.removeChild(J), --X) : (J.nodeValue = J.nodeValue.split(`
`).join(" "), J.nodeValue = J.nodeValue.replace(/(\s)+/g, "$1")) : J.nodeType === 1 && w(J);
          }
        }
        function L(Z) {
          for (var X = Z.querySelectorAll("pre"), J = [], Y = 0; Y < X.length; ++Y) if (X[Y].childElementCount === 1 && X[Y].firstChild.tagName.toLowerCase() === "code") {
            var he = X[Y].firstChild.innerHTML.trim(), me = X[Y].firstChild.getAttribute("data-language") || "";
            if (me === "")
              for (var Ce = X[Y].firstChild.className.split(" "), pe = 0; pe < Ce.length; ++pe) {
                var Pe = Ce[pe].match(/^language-(.+)$/);
                if (Pe !== null) {
                  me = Pe[1];
                  break;
                }
              }
            he = t.helper.unescapeHTMLEntities(he), J.push(he), X[Y].outerHTML = '<precode language="' + me + '" precodenum="' + Y.toString() + '"></precode>';
          } else
            J.push(X[Y].innerHTML), X[Y].innerHTML = "", X[Y].setAttribute("prenum", Y.toString());
          return J;
        }
        return A;
      }, this.setOption = function(o, b) {
        a[o] = b;
      }, this.getOption = function(o) {
        return a[o];
      }, this.getOptions = function() {
        return a;
      }, this.addExtension = function(o, b) {
        b = b || null, M(o, b);
      }, this.useExtension = function(o) {
        M(o);
      }, this.setFlavor = function(o) {
        if (!k.hasOwnProperty(o)) throw Error(o + " flavor was not found");
        var b = k[o];
        c = o;
        for (var j in b) b.hasOwnProperty(j) && (a[j] = b[j]);
      }, this.getFlavor = function() {
        return c;
      }, this.removeExtension = function(o) {
        t.helper.isArray(o) || (o = [o]);
        for (var b = 0; b < o.length; ++b) {
          for (var j = o[b], T = 0; T < r.length; ++T) r[T] === j && r.splice(T, 1);
          for (var N = 0; N < n.length; ++N) n[N] === j && n.splice(N, 1);
        }
      }, this.getAllExtensions = function() {
        return {
          language: r,
          output: n
        };
      }, this.getMetadata = function(o) {
        return o ? s.raw : s.parsed;
      }, this.getMetadataFormat = function() {
        return s.format;
      }, this._setMetadataPair = function(o, b) {
        s.parsed[o] = b;
      }, this._setMetadataFormat = function(o) {
        s.format = o;
      }, this._setMetadataRaw = function(o) {
        s.raw = o;
      };
    }, t.subParser("anchors", function(e, a, r) {
      "use strict";
      e = r.converter._dispatch("anchors.before", e, a, r);
      var n = function(i, c, s, m, M, P, S) {
        if (t.helper.isUndefined(S) && (S = ""), s = s.toLowerCase(), i.search(/\(<?\s*>? ?(['"].*['"])?\)$/m) > -1) m = "";
        else if (!m)
          if (s || (s = c.toLowerCase().replace(/ ?\n/g, " ")), m = "#" + s, !t.helper.isUndefined(r.gUrls[s]))
            m = r.gUrls[s], t.helper.isUndefined(r.gTitles[s]) || (S = r.gTitles[s]);
          else return i;
        m = m.replace(t.helper.regexes.asteriskDashAndColon, t.helper.escapeCharactersCallback);
        var C = '<a href="' + m + '"';
        return S !== "" && S !== null && (S = S.replace(/"/g, "&quot;"), S = S.replace(t.helper.regexes.asteriskDashAndColon, t.helper.escapeCharactersCallback), C += ' title="' + S + '"'), a.openLinksInNewWindow && !/^#/.test(m) && (C += ' rel="noopener noreferrer" target="¨E95Eblank"'), C += ">" + c + "</a>", C;
      };
      return e = e.replace(/\[((?:\[[^\]]*]|[^\[\]])*)] ?(?:\n *)?\[(.*?)]()()()()/g, n), e = e.replace(/\[((?:\[[^\]]*]|[^\[\]])*)]()[ \t]*\([ \t]?<([^>]*)>(?:[ \t]*((["'])([^"]*?)\5))?[ \t]?\)/g, n), e = e.replace(/\[((?:\[[^\]]*]|[^\[\]])*)]()[ \t]*\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?:[ \t]*((["'])([^"]*?)\5))?[ \t]?\)/g, n), e = e.replace(/\[([^\[\]]+)]()()()()()/g, n), a.ghMentions && (e = e.replace(/(^|\s)(\\)?(@([a-z\d]+(?:[a-z\d.-]+?[a-z\d]+)*))/gim, function(i, c, s, m, M) {
        if (s === "\\") return c + m;
        if (!t.helper.isString(a.ghMentionsLink)) throw new Error("ghMentionsLink option must be a string");
        var P = a.ghMentionsLink.replace(/\{u}/g, M), S = "";
        return a.openLinksInNewWindow && (S = ' rel="noopener noreferrer" target="¨E95Eblank"'), c + '<a href="' + P + '"' + S + ">" + m + "</a>";
      })), e = r.converter._dispatch("anchors.after", e, a, r), e;
    });
    var F = /([*~_]+|\b)(((https?|ftp|dict):\/\/|www\.)[^'">\s]+?\.[^'">\s]+?)()(\1)?(?=\s|$)(?!["<>])/gi, U = /([*~_]+|\b)(((https?|ftp|dict):\/\/|www\.)[^'">\s]+\.[^'">\s]+?)([.!?,()\[\]])?(\1)?(?=\s|$)(?!["<>])/gi, W = /()<(((https?|ftp|dict):\/\/|www\.)[^'">\s]+)()>()/gi, O = /(^|\s)(?:mailto:)?([A-Za-z0-9!#$%&'*+-/=?^_`{|}~.]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)(?=$|\s)/gim, $ = /<()(?:mailto:)?([-.\w]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi, R = function(e) {
      "use strict";
      return function(a, r, n, i, c, s, m) {
        n = n.replace(t.helper.regexes.asteriskDashAndColon, t.helper.escapeCharactersCallback);
        var M = n, P = "", S = "", C = r || "", o = m || "";
        return /^www\./i.test(n) && (n = n.replace(/^www\./i, "http://www.")), e.excludeTrailingPunctuationFromURLs && s && (P = s), e.openLinksInNewWindow && (S = ' rel="noopener noreferrer" target="¨E95Eblank"'), C + '<a href="' + n + '"' + S + ">" + M + "</a>" + P + o;
      };
    }, D = function(e, a) {
      "use strict";
      return function(r, n, i) {
        var c = "mailto:";
        return n = n || "", i = t.subParser("unescapeSpecialChars")(i, e, a), e.encodeEmails ? (c = t.helper.encodeEmailAddress(c + i), i = t.helper.encodeEmailAddress(i)) : c = c + i, n + '<a href="' + c + '">' + i + "</a>";
      };
    };
    t.subParser("autoLinks", function(e, a, r) {
      "use strict";
      return e = r.converter._dispatch("autoLinks.before", e, a, r), e = e.replace(W, R(a)), e = e.replace($, D(a, r)), e = r.converter._dispatch("autoLinks.after", e, a, r), e;
    }), t.subParser("simplifiedAutoLinks", function(e, a, r) {
      "use strict";
      return a.simplifiedAutoLink && (e = r.converter._dispatch("simplifiedAutoLinks.before", e, a, r), a.excludeTrailingPunctuationFromURLs ? e = e.replace(U, R(a)) : e = e.replace(F, R(a)), e = e.replace(O, D(a, r)), e = r.converter._dispatch("simplifiedAutoLinks.after", e, a, r)), e;
    }), t.subParser("blockGamut", function(e, a, r) {
      "use strict";
      return e = r.converter._dispatch("blockGamut.before", e, a, r), e = t.subParser("blockQuotes")(e, a, r), e = t.subParser("headers")(e, a, r), e = t.subParser("horizontalRule")(e, a, r), e = t.subParser("lists")(e, a, r), e = t.subParser("codeBlocks")(e, a, r), e = t.subParser("tables")(e, a, r), e = t.subParser("hashHTMLBlocks")(e, a, r), e = t.subParser("paragraphs")(e, a, r), e = r.converter._dispatch("blockGamut.after", e, a, r), e;
    }), t.subParser("blockQuotes", function(e, a, r) {
      "use strict";
      e = r.converter._dispatch("blockQuotes.before", e, a, r), e = e + `

`;
      var n = /(^ {0,3}>[ \t]?.+\n(.+\n)*\n*)+/gm;
      return a.splitAdjacentBlockquotes && (n = /^ {0,3}>[\s\S]*?(?:\n\n)/gm), e = e.replace(n, function(i) {
        return i = i.replace(/^[ \t]*>[ \t]?/gm, ""), i = i.replace(/¨0/g, ""), i = i.replace(/^[ \t]+$/gm, ""), i = t.subParser("githubCodeBlocks")(i, a, r), i = t.subParser("blockGamut")(i, a, r), i = i.replace(/(^|\n)/g, "$1  "), i = i.replace(/(\s*<pre>[^\r]+?<\/pre>)/gm, function(c, s) {
          var m = s;
          return m = m.replace(/^  /gm, "¨0"), m = m.replace(/¨0/g, ""), m;
        }), t.subParser("hashBlock")(`<blockquote>
` + i + `
</blockquote>`, a, r);
      }), e = r.converter._dispatch("blockQuotes.after", e, a, r), e;
    }), t.subParser("codeBlocks", function(e, a, r) {
      "use strict";
      return e = r.converter._dispatch("codeBlocks.before", e, a, r), e += "¨0", e = e.replace(/(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=¨0))/g, function(n, i, c) {
        var s = i, m = c, M = `
`;
        return s = t.subParser("outdent")(s, a, r), s = t.subParser("encodeCode")(s, a, r), s = t.subParser("detab")(s, a, r), s = s.replace(/^\n+/g, ""), s = s.replace(/\n+$/g, ""), a.omitExtraWLInCodeBlocks && (M = ""), s = "<pre><code>" + s + M + "</code></pre>", t.subParser("hashBlock")(s, a, r) + m;
      }), e = e.replace(/¨0/, ""), e = r.converter._dispatch("codeBlocks.after", e, a, r), e;
    }), t.subParser("codeSpans", function(e, a, r) {
      "use strict";
      return e = r.converter._dispatch("codeSpans.before", e, a, r), typeof e > "u" && (e = ""), e = e.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm, function(n, i, c, s) {
        var m = s;
        return m = m.replace(/^([ \t]*)/g, ""), m = m.replace(/[ \t]*$/g, ""), m = t.subParser("encodeCode")(m, a, r), m = i + "<code>" + m + "</code>", m = t.subParser("hashHTMLSpans")(m, a, r), m;
      }), e = r.converter._dispatch("codeSpans.after", e, a, r), e;
    }), t.subParser("completeHTMLDocument", function(e, a, r) {
      "use strict";
      if (!a.completeHTMLDocument) return e;
      e = r.converter._dispatch("completeHTMLDocument.before", e, a, r);
      var n = "html", i = `<!DOCTYPE HTML>
`, c = "", s = `<meta charset="utf-8">
`, m = "", M = "";
      typeof r.metadata.parsed.doctype < "u" && (i = "<!DOCTYPE " + r.metadata.parsed.doctype + `>
`, n = r.metadata.parsed.doctype.toString().toLowerCase(), (n === "html" || n === "html5") && (s = '<meta charset="utf-8">'));
      for (var P in r.metadata.parsed) if (r.metadata.parsed.hasOwnProperty(P)) switch (P.toLowerCase()) {
        case "doctype":
          break;
        case "title":
          c = "<title>" + r.metadata.parsed.title + `</title>
`;
          break;
        case "charset":
          n === "html" || n === "html5" ? s = '<meta charset="' + r.metadata.parsed.charset + `">
` : s = '<meta name="charset" content="' + r.metadata.parsed.charset + `">
`;
          break;
        case "language":
        case "lang":
          m = ' lang="' + r.metadata.parsed[P] + '"', M += '<meta name="' + P + '" content="' + r.metadata.parsed[P] + `">
`;
          break;
        default:
          M += '<meta name="' + P + '" content="' + r.metadata.parsed[P] + `">
`;
      }
      return e = i + "<html" + m + `>
<head>
` + c + s + M + `</head>
<body>
` + e.trim() + `
</body>
</html>`, e = r.converter._dispatch("completeHTMLDocument.after", e, a, r), e;
    }), t.subParser("detab", function(e, a, r) {
      "use strict";
      return e = r.converter._dispatch("detab.before", e, a, r), e = e.replace(/\t(?=\t)/g, "    "), e = e.replace(/\t/g, "¨A¨B"), e = e.replace(/¨B(.+?)¨A/g, function(n, i) {
        for (var c = i, s = 4 - c.length % 4, m = 0; m < s; m++) c += " ";
        return c;
      }), e = e.replace(/¨A/g, "    "), e = e.replace(/¨B/g, ""), e = r.converter._dispatch("detab.after", e, a, r), e;
    }), t.subParser("ellipsis", function(e, a, r) {
      "use strict";
      return a.ellipsis && (e = r.converter._dispatch("ellipsis.before", e, a, r), e = e.replace(/\.\.\./g, "…"), e = r.converter._dispatch("ellipsis.after", e, a, r)), e;
    }), t.subParser("emoji", function(e, a, r) {
      "use strict";
      return a.emoji && (e = r.converter._dispatch("emoji.before", e, a, r), e = e.replace(/:([\S]+?):/g, function(n, i) {
        return t.helper.emojis.hasOwnProperty(i) ? t.helper.emojis[i] : n;
      }), e = r.converter._dispatch("emoji.after", e, a, r)), e;
    }), t.subParser("encodeAmpsAndAngles", function(e, a, r) {
      "use strict";
      return e = r.converter._dispatch("encodeAmpsAndAngles.before", e, a, r), e = e.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g, "&amp;"), e = e.replace(/<(?![a-z\/?$!])/gi, "&lt;"), e = e.replace(/</g, "&lt;"), e = e.replace(/>/g, "&gt;"), e = r.converter._dispatch("encodeAmpsAndAngles.after", e, a, r), e;
    }), t.subParser("encodeBackslashEscapes", function(e, a, r) {
      "use strict";
      return e = r.converter._dispatch("encodeBackslashEscapes.before", e, a, r), e = e.replace(/\\(\\)/g, t.helper.escapeCharactersCallback), e = e.replace(/\\([`*_{}\[\]()>#+.!~=|:-])/g, t.helper.escapeCharactersCallback), e = r.converter._dispatch("encodeBackslashEscapes.after", e, a, r), e;
    }), t.subParser("encodeCode", function(e, a, r) {
      "use strict";
      return e = r.converter._dispatch("encodeCode.before", e, a, r), e = e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/([*_{}\[\]\\=~-])/g, t.helper.escapeCharactersCallback), e = r.converter._dispatch("encodeCode.after", e, a, r), e;
    }), t.subParser("escapeSpecialCharsWithinTagAttributes", function(e, a, r) {
      "use strict";
      e = r.converter._dispatch("escapeSpecialCharsWithinTagAttributes.before", e, a, r);
      var n = /<\/?[a-z\d_:-]+(?:[\s]+[\s\S]+?)?>/gi, i = /<!(--(?:(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)>/gi;
      return e = e.replace(n, function(c) {
        return c.replace(/(.)<\/?code>(?=.)/g, "$1`").replace(/([\\`*_~=|])/g, t.helper.escapeCharactersCallback);
      }), e = e.replace(i, function(c) {
        return c.replace(/([\\`*_~=|])/g, t.helper.escapeCharactersCallback);
      }), e = r.converter._dispatch("escapeSpecialCharsWithinTagAttributes.after", e, a, r), e;
    }), t.subParser("githubCodeBlocks", function(e, a, r) {
      "use strict";
      return a.ghCodeBlocks ? (e = r.converter._dispatch("githubCodeBlocks.before", e, a, r), e += "¨0", e = e.replace(/(?:^|\n)(?: {0,3})(```+|~~~+)(?: *)([^\s`~]*)\n([\s\S]*?)\n(?: {0,3})\1/g, function(n, i, c, s) {
        var m = a.omitExtraWLInCodeBlocks ? "" : `
`;
        return s = t.subParser("encodeCode")(s, a, r), s = t.subParser("detab")(s, a, r), s = s.replace(/^\n+/g, ""), s = s.replace(/\n+$/g, ""), s = "<pre><code" + (c ? ' class="' + c + " language-" + c + '"' : "") + ">" + s + m + "</code></pre>", s = t.subParser("hashBlock")(s, a, r), `

¨G` + (r.ghCodeBlocks.push({
          text: n,
          codeblock: s
        }) - 1) + `G

`;
      }), e = e.replace(/¨0/, ""), r.converter._dispatch("githubCodeBlocks.after", e, a, r)) : e;
    }), t.subParser("hashBlock", function(e, a, r) {
      "use strict";
      return e = r.converter._dispatch("hashBlock.before", e, a, r), e = e.replace(/(^\n+|\n+$)/g, ""), e = `

¨K` + (r.gHtmlBlocks.push(e) - 1) + `K

`, e = r.converter._dispatch("hashBlock.after", e, a, r), e;
    }), t.subParser("hashCodeTags", function(e, a, r) {
      "use strict";
      e = r.converter._dispatch("hashCodeTags.before", e, a, r);
      var n = function(i, c, s, m) {
        var M = s + t.subParser("encodeCode")(c, a, r) + m;
        return "¨C" + (r.gHtmlSpans.push(M) - 1) + "C";
      };
      return e = t.helper.replaceRecursiveRegExp(e, n, "<code\\b[^>]*>", "</code>", "gim"), e = r.converter._dispatch("hashCodeTags.after", e, a, r), e;
    }), t.subParser("hashElement", function(e, a, r) {
      "use strict";
      return function(n, i) {
        var c = i;
        return c = c.replace(/\n\n/g, `
`), c = c.replace(/^\n/, ""), c = c.replace(/\n+$/g, ""), c = `

¨K` + (r.gHtmlBlocks.push(c) - 1) + `K

`, c;
      };
    }), t.subParser("hashHTMLBlocks", function(e, a, r) {
      "use strict";
      e = r.converter._dispatch("hashHTMLBlocks.before", e, a, r);
      var n = [
        "pre",
        "div",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "blockquote",
        "table",
        "dl",
        "ol",
        "ul",
        "script",
        "noscript",
        "form",
        "fieldset",
        "iframe",
        "math",
        "style",
        "section",
        "header",
        "footer",
        "nav",
        "article",
        "aside",
        "address",
        "audio",
        "canvas",
        "figure",
        "hgroup",
        "output",
        "video",
        "p"
      ], i = function(o, b, j, T) {
        var N = o;
        return j.search(/\bmarkdown\b/) !== -1 && (N = j + r.converter.makeHtml(b) + T), `

¨K` + (r.gHtmlBlocks.push(N) - 1) + `K

`;
      };
      a.backslashEscapesHTMLTags && (e = e.replace(/\\<(\/?[^>]+?)>/g, function(o, b) {
        return "&lt;" + b + "&gt;";
      }));
      for (var c = 0; c < n.length; ++c)
        for (var s, m = new RegExp("^ {0,3}(<" + n[c] + "\\b[^>]*>)", "im"), M = "<" + n[c] + "\\b[^>]*>", P = "</" + n[c] + ">"; (s = t.helper.regexIndexOf(e, m)) !== -1; ) {
          var S = t.helper.splitAtIndex(e, s), C = t.helper.replaceRecursiveRegExp(S[1], i, M, P, "im");
          if (C === S[1]) break;
          e = S[0].concat(C);
        }
      return e = e.replace(/(\n {0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g, t.subParser("hashElement")(e, a, r)), e = t.helper.replaceRecursiveRegExp(e, function(o) {
        return `

¨K` + (r.gHtmlBlocks.push(o) - 1) + `K

`;
      }, "^ {0,3}<!--", "-->", "gm"), e = e.replace(/(?:\n\n)( {0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g, t.subParser("hashElement")(e, a, r)), e = r.converter._dispatch("hashHTMLBlocks.after", e, a, r), e;
    }), t.subParser("hashHTMLSpans", function(e, a, r) {
      "use strict";
      e = r.converter._dispatch("hashHTMLSpans.before", e, a, r);
      function n(i) {
        return "¨C" + (r.gHtmlSpans.push(i) - 1) + "C";
      }
      return e = e.replace(/<[^>]+?\/>/gi, function(i) {
        return n(i);
      }), e = e.replace(/<([^>]+?)>[\s\S]*?<\/\1>/g, function(i) {
        return n(i);
      }), e = e.replace(/<([^>]+?)\s[^>]+?>[\s\S]*?<\/\1>/g, function(i) {
        return n(i);
      }), e = e.replace(/<[^>]+?>/gi, function(i) {
        return n(i);
      }), e = r.converter._dispatch("hashHTMLSpans.after", e, a, r), e;
    }), t.subParser("unhashHTMLSpans", function(e, a, r) {
      "use strict";
      e = r.converter._dispatch("unhashHTMLSpans.before", e, a, r);
      for (var n = 0; n < r.gHtmlSpans.length; ++n) {
        for (var i = r.gHtmlSpans[n], c = 0; /¨C(\d+)C/.test(i); ) {
          var s = RegExp.$1;
          if (i = i.replace("¨C" + s + "C", r.gHtmlSpans[s]), c === 10) {
            console.error("maximum nesting of 10 spans reached!!!");
            break;
          }
          ++c;
        }
        e = e.replace("¨C" + n + "C", i);
      }
      return e = r.converter._dispatch("unhashHTMLSpans.after", e, a, r), e;
    }), t.subParser("hashPreCodeTags", function(e, a, r) {
      "use strict";
      e = r.converter._dispatch("hashPreCodeTags.before", e, a, r);
      var n = function(i, c, s, m) {
        var M = s + t.subParser("encodeCode")(c, a, r) + m;
        return `

¨G` + (r.ghCodeBlocks.push({
          text: i,
          codeblock: M
        }) - 1) + `G

`;
      };
      return e = t.helper.replaceRecursiveRegExp(e, n, "^ {0,3}<pre\\b[^>]*>\\s*<code\\b[^>]*>", "^ {0,3}</code>\\s*</pre>", "gim"), e = r.converter._dispatch("hashPreCodeTags.after", e, a, r), e;
    }), t.subParser("headers", function(e, a, r) {
      "use strict";
      e = r.converter._dispatch("headers.before", e, a, r);
      var n = isNaN(parseInt(a.headerLevelStart)) ? 1 : parseInt(a.headerLevelStart), i = a.smoothLivePreview ? /^(.+)[ \t]*\n={2,}[ \t]*\n+/gm : /^(.+)[ \t]*\n=+[ \t]*\n+/gm, c = a.smoothLivePreview ? /^(.+)[ \t]*\n-{2,}[ \t]*\n+/gm : /^(.+)[ \t]*\n-+[ \t]*\n+/gm;
      e = e.replace(i, function(M, P) {
        var S = t.subParser("spanGamut")(P, a, r), C = a.noHeaderId ? "" : ' id="' + m(P) + '"', o = n, b = "<h" + o + C + ">" + S + "</h" + o + ">";
        return t.subParser("hashBlock")(b, a, r);
      }), e = e.replace(c, function(M, P) {
        var S = t.subParser("spanGamut")(P, a, r), C = a.noHeaderId ? "" : ' id="' + m(P) + '"', o = n + 1, b = "<h" + o + C + ">" + S + "</h" + o + ">";
        return t.subParser("hashBlock")(b, a, r);
      });
      var s = a.requireSpaceBeforeHeadingText ? /^(#{1,6})[ \t]+(.+?)[ \t]*#*\n+/gm : /^(#{1,6})[ \t]*(.+?)[ \t]*#*\n+/gm;
      e = e.replace(s, function(M, P, S) {
        var C = S;
        a.customizedHeaderId && (C = S.replace(/\s?\{([^{]+?)}\s*$/, ""));
        var o = t.subParser("spanGamut")(C, a, r), b = a.noHeaderId ? "" : ' id="' + m(S) + '"', j = n - 1 + P.length, T = "<h" + j + b + ">" + o + "</h" + j + ">";
        return t.subParser("hashBlock")(T, a, r);
      });
      function m(M) {
        var P, S;
        if (a.customizedHeaderId) {
          var C = M.match(/\{([^{]+?)}\s*$/);
          C && C[1] && (M = C[1]);
        }
        return P = M, t.helper.isString(a.prefixHeaderId) ? S = a.prefixHeaderId : a.prefixHeaderId === !0 ? S = "section-" : S = "", a.rawPrefixHeaderId || (P = S + P), a.ghCompatibleHeaderId ? P = P.replace(/ /g, "-").replace(/&amp;/g, "").replace(/¨T/g, "").replace(/¨D/g, "").replace(/[&+$,\/:;=?@"#{}|^¨~\[\]`\\*)(%.!'<>]/g, "").toLowerCase() : a.rawHeaderId ? P = P.replace(/ /g, "-").replace(/&amp;/g, "&").replace(/¨T/g, "¨").replace(/¨D/g, "$").replace(/["']/g, "-").toLowerCase() : P = P.replace(/[^\w]/g, "").toLowerCase(), a.rawPrefixHeaderId && (P = S + P), r.hashLinkCounts[P] ? P = P + "-" + r.hashLinkCounts[P]++ : r.hashLinkCounts[P] = 1, P;
      }
      return e = r.converter._dispatch("headers.after", e, a, r), e;
    }), t.subParser("horizontalRule", function(e, a, r) {
      "use strict";
      e = r.converter._dispatch("horizontalRule.before", e, a, r);
      var n = t.subParser("hashBlock")("<hr />", a, r);
      return e = e.replace(/^ {0,2}( ?-){3,}[ \t]*$/gm, n), e = e.replace(/^ {0,2}( ?\*){3,}[ \t]*$/gm, n), e = e.replace(/^ {0,2}( ?_){3,}[ \t]*$/gm, n), e = r.converter._dispatch("horizontalRule.after", e, a, r), e;
    }), t.subParser("images", function(e, a, r) {
      "use strict";
      e = r.converter._dispatch("images.before", e, a, r);
      var n = /!\[([^\]]*?)][ \t]*()\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/g, i = /!\[([^\]]*?)][ \t]*()\([ \t]?<([^>]*)>(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(?:(["'])([^"]*?)\6))?[ \t]?\)/g, c = /!\[([^\]]*?)][ \t]*()\([ \t]?<?(data:.+?\/.+?;base64,[A-Za-z0-9+/=\n]+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/g, s = /!\[([^\]]*?)] ?(?:\n *)?\[([\s\S]*?)]()()()()()/g, m = /!\[([^\[\]]+)]()()()()()/g;
      function M(S, C, o, b, j, T, N, A) {
        return b = b.replace(/\s/g, ""), P(S, C, o, b, j, T, N, A);
      }
      function P(S, C, o, b, j, T, N, A) {
        var E = r.gUrls, w = r.gTitles, L = r.gDimensions;
        if (o = o.toLowerCase(), A || (A = ""), S.search(/\(<?\s*>? ?(['"].*['"])?\)$/m) > -1) b = "";
        else if (b === "" || b === null)
          if ((o === "" || o === null) && (o = C.toLowerCase().replace(/ ?\n/g, " ")), b = "#" + o, !t.helper.isUndefined(E[o]))
            b = E[o], t.helper.isUndefined(w[o]) || (A = w[o]), t.helper.isUndefined(L[o]) || (j = L[o].width, T = L[o].height);
          else return S;
        C = C.replace(/"/g, "&quot;").replace(t.helper.regexes.asteriskDashAndColon, t.helper.escapeCharactersCallback), b = b.replace(t.helper.regexes.asteriskDashAndColon, t.helper.escapeCharactersCallback);
        var Z = '<img src="' + b + '" alt="' + C + '"';
        return A && t.helper.isString(A) && (A = A.replace(/"/g, "&quot;").replace(t.helper.regexes.asteriskDashAndColon, t.helper.escapeCharactersCallback), Z += ' title="' + A + '"'), j && T && (j = j === "*" ? "auto" : j, T = T === "*" ? "auto" : T, Z += ' width="' + j + '"', Z += ' height="' + T + '"'), Z += " />", Z;
      }
      return e = e.replace(s, P), e = e.replace(c, M), e = e.replace(i, P), e = e.replace(n, P), e = e.replace(m, P), e = r.converter._dispatch("images.after", e, a, r), e;
    }), t.subParser("italicsAndBold", function(e, a, r) {
      "use strict";
      e = r.converter._dispatch("italicsAndBold.before", e, a, r);
      function n(i, c, s) {
        return c + i + s;
      }
      return a.literalMidWordUnderscores ? (e = e.replace(/\b___(\S[\s\S]*?)___\b/g, function(i, c) {
        return n(c, "<strong><em>", "</em></strong>");
      }), e = e.replace(/\b__(\S[\s\S]*?)__\b/g, function(i, c) {
        return n(c, "<strong>", "</strong>");
      }), e = e.replace(/\b_(\S[\s\S]*?)_\b/g, function(i, c) {
        return n(c, "<em>", "</em>");
      })) : (e = e.replace(/___(\S[\s\S]*?)___/g, function(i, c) {
        return /\S$/.test(c) ? n(c, "<strong><em>", "</em></strong>") : i;
      }), e = e.replace(/__(\S[\s\S]*?)__/g, function(i, c) {
        return /\S$/.test(c) ? n(c, "<strong>", "</strong>") : i;
      }), e = e.replace(/_([^\s_][\s\S]*?)_/g, function(i, c) {
        return /\S$/.test(c) ? n(c, "<em>", "</em>") : i;
      })), a.literalMidWordAsterisks ? (e = e.replace(/([^*]|^)\B\*\*\*(\S[\s\S]*?)\*\*\*\B(?!\*)/g, function(i, c, s) {
        return n(s, c + "<strong><em>", "</em></strong>");
      }), e = e.replace(/([^*]|^)\B\*\*(\S[\s\S]*?)\*\*\B(?!\*)/g, function(i, c, s) {
        return n(s, c + "<strong>", "</strong>");
      }), e = e.replace(/([^*]|^)\B\*(\S[\s\S]*?)\*\B(?!\*)/g, function(i, c, s) {
        return n(s, c + "<em>", "</em>");
      })) : (e = e.replace(/\*\*\*(\S[\s\S]*?)\*\*\*/g, function(i, c) {
        return /\S$/.test(c) ? n(c, "<strong><em>", "</em></strong>") : i;
      }), e = e.replace(/\*\*(\S[\s\S]*?)\*\*/g, function(i, c) {
        return /\S$/.test(c) ? n(c, "<strong>", "</strong>") : i;
      }), e = e.replace(/\*([^\s*][\s\S]*?)\*/g, function(i, c) {
        return /\S$/.test(c) ? n(c, "<em>", "</em>") : i;
      })), e = r.converter._dispatch("italicsAndBold.after", e, a, r), e;
    }), t.subParser("lists", function(e, a, r) {
      "use strict";
      function n(s, m) {
        r.gListLevel++, s = s.replace(/\n{2,}$/, `
`), s += "¨0";
        var M = /(\n)?(^ {0,3})([*+-]|\d+[.])[ \t]+((\[(x|X| )?])?[ \t]*[^\r]+?(\n{1,2}))(?=\n*(¨0| {0,3}([*+-]|\d+[.])[ \t]+))/gm, P = /\n[ \t]*\n(?!¨0)/.test(s);
        return a.disableForced4SpacesIndentedSublists && (M = /(\n)?(^ {0,3})([*+-]|\d+[.])[ \t]+((\[(x|X| )?])?[ \t]*[^\r]+?(\n{1,2}))(?=\n*(¨0|\2([*+-]|\d+[.])[ \t]+))/gm), s = s.replace(M, function(S, C, o, b, j, T, N) {
          N = N && N.trim() !== "";
          var A = t.subParser("outdent")(j, a, r), E = "";
          return T && a.tasklists && (E = ' class="task-list-item" style="list-style-type: none;"', A = A.replace(/^[ \t]*\[(x|X| )?]/m, function() {
            var w = '<input type="checkbox" disabled style="margin: 0px 0.35em 0.25em -1.6em; vertical-align: middle;"';
            return N && (w += " checked"), w += ">", w;
          })), A = A.replace(/^([-*+]|\d\.)[ \t]+[\S\n ]*/g, function(w) {
            return "¨A" + w;
          }), C || A.search(/\n{2,}/) > -1 ? (A = t.subParser("githubCodeBlocks")(A, a, r), A = t.subParser("blockGamut")(A, a, r)) : (A = t.subParser("lists")(A, a, r), A = A.replace(/\n$/, ""), A = t.subParser("hashHTMLBlocks")(A, a, r), A = A.replace(/\n\n+/g, `

`), P ? A = t.subParser("paragraphs")(A, a, r) : A = t.subParser("spanGamut")(A, a, r)), A = A.replace("¨A", ""), A = "<li" + E + ">" + A + `</li>
`, A;
        }), s = s.replace(/¨0/g, ""), r.gListLevel--, m && (s = s.replace(/\s+$/, "")), s;
      }
      function i(s, m) {
        if (m === "ol") {
          var M = s.match(/^ *(\d+)\./);
          if (M && M[1] !== "1") return ' start="' + M[1] + '"';
        }
        return "";
      }
      function c(s, m, M) {
        var P = a.disableForced4SpacesIndentedSublists ? /^ ?\d+\.[ \t]/gm : /^ {0,3}\d+\.[ \t]/gm, S = a.disableForced4SpacesIndentedSublists ? /^ ?[*+-][ \t]/gm : /^ {0,3}[*+-][ \t]/gm, C = m === "ul" ? P : S, o = "";
        if (s.search(C) !== -1) (function j(T) {
          var N = T.search(C), A = i(s, m);
          N !== -1 ? (o += `

<` + m + A + `>
` + n(T.slice(0, N), !!M) + "</" + m + `>
`, m = m === "ul" ? "ol" : "ul", C = m === "ul" ? P : S, j(T.slice(N))) : o += `

<` + m + A + `>
` + n(T, !!M) + "</" + m + `>
`;
        })(s);
        else {
          var b = i(s, m);
          o = `

<` + m + b + `>
` + n(s, !!M) + "</" + m + `>
`;
        }
        return o;
      }
      return e = r.converter._dispatch("lists.before", e, a, r), e += "¨0", r.gListLevel ? e = e.replace(/^(( {0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(¨0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm, function(s, m, M) {
        return c(m, M.search(/[*+-]/g) > -1 ? "ul" : "ol", !0);
      }) : e = e.replace(/(\n\n|^\n?)(( {0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(¨0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm, function(s, m, M, P) {
        return c(M, P.search(/[*+-]/g) > -1 ? "ul" : "ol", !1);
      }), e = e.replace(/¨0/, ""), e = r.converter._dispatch("lists.after", e, a, r), e;
    }), t.subParser("metadata", function(e, a, r) {
      "use strict";
      if (!a.metadata) return e;
      e = r.converter._dispatch("metadata.before", e, a, r);
      function n(i) {
        r.metadata.raw = i, i = i.replace(/&/g, "&amp;").replace(/"/g, "&quot;"), i = i.replace(/\n {4}/g, " "), i.replace(/^([\S ]+): +([\s\S]+?)$/gm, function(c, s, m) {
          return r.metadata.parsed[s] = m, "";
        });
      }
      return e = e.replace(/^\s*«««+(\S*?)\n([\s\S]+?)\n»»»+\n/, function(i, c, s) {
        return n(s), "¨M";
      }), e = e.replace(/^\s*---+(\S*?)\n([\s\S]+?)\n---+\n/, function(i, c, s) {
        return c && (r.metadata.format = c), n(s), "¨M";
      }), e = e.replace(/¨M/g, ""), e = r.converter._dispatch("metadata.after", e, a, r), e;
    }), t.subParser("outdent", function(e, a, r) {
      "use strict";
      return e = r.converter._dispatch("outdent.before", e, a, r), e = e.replace(/^(\t|[ ]{1,4})/gm, "¨0"), e = e.replace(/¨0/g, ""), e = r.converter._dispatch("outdent.after", e, a, r), e;
    }), t.subParser("paragraphs", function(e, a, r) {
      "use strict";
      e = r.converter._dispatch("paragraphs.before", e, a, r), e = e.replace(/^\n+/g, ""), e = e.replace(/\n+$/g, "");
      for (var n = e.split(/\n{2,}/g), i = [], c = n.length, s = 0; s < c; s++) {
        var m = n[s];
        m.search(/¨(K|G)(\d+)\1/g) >= 0 ? i.push(m) : m.search(/\S/) >= 0 && (m = t.subParser("spanGamut")(m, a, r), m = m.replace(/^([ \t]*)/g, "<p>"), m += "</p>", i.push(m));
      }
      for (c = i.length, s = 0; s < c; s++) {
        for (var M = "", P = i[s], S = !1; /¨(K|G)(\d+)\1/.test(P); ) {
          var C = RegExp.$1, o = RegExp.$2;
          C === "K" ? M = r.gHtmlBlocks[o] : S ? M = t.subParser("encodeCode")(r.ghCodeBlocks[o].text, a, r) : M = r.ghCodeBlocks[o].codeblock, M = M.replace(/\$/g, "$$$$"), P = P.replace(/(\n\n)?¨(K|G)\d+\2(\n\n)?/, M), /^<pre\b[^>]*>\s*<code\b[^>]*>/.test(P) && (S = !0);
        }
        i[s] = P;
      }
      return e = i.join(`
`), e = e.replace(/^\n+/g, ""), e = e.replace(/\n+$/g, ""), r.converter._dispatch("paragraphs.after", e, a, r);
    }), t.subParser("runExtension", function(e, a, r, n) {
      "use strict";
      if (e.filter) a = e.filter(a, n.converter, r);
      else if (e.regex) {
        var i = e.regex;
        i instanceof RegExp || (i = new RegExp(i, "g")), a = a.replace(i, e.replace);
      }
      return a;
    }), t.subParser("spanGamut", function(e, a, r) {
      "use strict";
      return e = r.converter._dispatch("spanGamut.before", e, a, r), e = t.subParser("codeSpans")(e, a, r), e = t.subParser("escapeSpecialCharsWithinTagAttributes")(e, a, r), e = t.subParser("encodeBackslashEscapes")(e, a, r), e = t.subParser("images")(e, a, r), e = t.subParser("anchors")(e, a, r), e = t.subParser("autoLinks")(e, a, r), e = t.subParser("simplifiedAutoLinks")(e, a, r), e = t.subParser("emoji")(e, a, r), e = t.subParser("underline")(e, a, r), e = t.subParser("italicsAndBold")(e, a, r), e = t.subParser("strikethrough")(e, a, r), e = t.subParser("ellipsis")(e, a, r), e = t.subParser("hashHTMLSpans")(e, a, r), e = t.subParser("encodeAmpsAndAngles")(e, a, r), a.simpleLineBreaks ? /\n\n¨K/.test(e) || (e = e.replace(/\n+/g, `<br />
`)) : e = e.replace(/  +\n/g, `<br />
`), e = r.converter._dispatch("spanGamut.after", e, a, r), e;
    }), t.subParser("strikethrough", function(e, a, r) {
      "use strict";
      function n(i) {
        return a.simplifiedAutoLink && (i = t.subParser("simplifiedAutoLinks")(i, a, r)), "<del>" + i + "</del>";
      }
      return a.strikethrough && (e = r.converter._dispatch("strikethrough.before", e, a, r), e = e.replace(/(?:~){2}([\s\S]+?)(?:~){2}/g, function(i, c) {
        return n(c);
      }), e = r.converter._dispatch("strikethrough.after", e, a, r)), e;
    }), t.subParser("stripLinkDefinitions", function(e, a, r) {
      "use strict";
      var n = /^ {0,3}\[([^\]]+)]:[ \t]*\n?[ \t]*<?([^>\s]+)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*\n?[ \t]*(?:(\n*)["|'(](.+?)["|')][ \t]*)?(?:\n+|(?=¨0))/gm, i = /^ {0,3}\[([^\]]+)]:[ \t]*\n?[ \t]*<?(data:.+?\/.+?;base64,[A-Za-z0-9+/=\n]+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*\n?[ \t]*(?:(\n*)["|'(](.+?)["|')][ \t]*)?(?:\n\n|(?=¨0)|(?=\n\[))/gm;
      e += "¨0";
      var c = function(s, m, M, P, S, C, o) {
        return m = m.toLowerCase(), e.toLowerCase().split(m).length - 1 < 2 ? s : (M.match(/^data:.+?\/.+?;base64,/) ? r.gUrls[m] = M.replace(/\s/g, "") : r.gUrls[m] = t.subParser("encodeAmpsAndAngles")(M, a, r), C ? C + o : (o && (r.gTitles[m] = o.replace(/"|'/g, "&quot;")), a.parseImgDimensions && P && S && (r.gDimensions[m] = {
          width: P,
          height: S
        }), ""));
      };
      return e = e.replace(i, c), e = e.replace(n, c), e = e.replace(/¨0/, ""), e;
    }), t.subParser("tables", function(e, a, r) {
      "use strict";
      if (!a.tables) return e;
      var n = /^ {0,3}\|?.+\|.+\n {0,3}\|?[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|[ \t]*:?[ \t]*(?:[-=]){2,}[\s\S]+?(?:\n\n|¨0)/gm, i = /^ {0,3}\|.+\|[ \t]*\n {0,3}\|[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|[ \t]*\n( {0,3}\|.+\|[ \t]*\n)*(?:\n|¨0)/gm;
      function c(S) {
        return /^:[ \t]*--*$/.test(S) ? ' style="text-align:left;"' : /^--*[ \t]*:[ \t]*$/.test(S) ? ' style="text-align:right;"' : /^:[ \t]*--*[ \t]*:$/.test(S) ? ' style="text-align:center;"' : "";
      }
      function s(S, C) {
        var o = "";
        return S = S.trim(), (a.tablesHeaderId || a.tableHeaderId) && (o = ' id="' + S.replace(/ /g, "_").toLowerCase() + '"'), S = t.subParser("spanGamut")(S, a, r), "<th" + o + C + ">" + S + `</th>
`;
      }
      function m(S, C) {
        var o = t.subParser("spanGamut")(S, a, r);
        return "<td" + C + ">" + o + `</td>
`;
      }
      function M(S, C) {
        for (var o = `<table>
<thead>
<tr>
`, b = S.length, j = 0; j < b; ++j) o += S[j];
        for (o += `</tr>
</thead>
<tbody>
`, j = 0; j < C.length; ++j) {
          o += `<tr>
`;
          for (var T = 0; T < b; ++T) o += C[j][T];
          o += `</tr>
`;
        }
        return o += `</tbody>
</table>
`, o;
      }
      function P(S) {
        var C, o = S.split(`
`);
        for (C = 0; C < o.length; ++C)
          /^ {0,3}\|/.test(o[C]) && (o[C] = o[C].replace(/^ {0,3}\|/, "")), /\|[ \t]*$/.test(o[C]) && (o[C] = o[C].replace(/\|[ \t]*$/, "")), o[C] = t.subParser("codeSpans")(o[C], a, r);
        var b = o[0].split("|").map(function(Z) {
          return Z.trim();
        }), j = o[1].split("|").map(function(Z) {
          return Z.trim();
        }), T = [], N = [], A = [], E = [];
        for (o.shift(), o.shift(), C = 0; C < o.length; ++C)
          o[C].trim() !== "" && T.push(o[C].split("|").map(function(Z) {
            return Z.trim();
          }));
        if (b.length < j.length) return S;
        for (C = 0; C < j.length; ++C) A.push(c(j[C]));
        for (C = 0; C < b.length; ++C)
          t.helper.isUndefined(A[C]) && (A[C] = ""), N.push(s(b[C], A[C]));
        for (C = 0; C < T.length; ++C) {
          for (var w = [], L = 0; L < N.length; ++L)
            t.helper.isUndefined(T[C][L]), w.push(m(T[C][L], A[L]));
          E.push(w);
        }
        return M(N, E);
      }
      return e = r.converter._dispatch("tables.before", e, a, r), e = e.replace(/\\(\|)/g, t.helper.escapeCharactersCallback), e = e.replace(n, P), e = e.replace(i, P), e = r.converter._dispatch("tables.after", e, a, r), e;
    }), t.subParser("underline", function(e, a, r) {
      "use strict";
      return a.underline && (e = r.converter._dispatch("underline.before", e, a, r), a.literalMidWordUnderscores ? (e = e.replace(/\b___(\S[\s\S]*?)___\b/g, function(n, i) {
        return "<u>" + i + "</u>";
      }), e = e.replace(/\b__(\S[\s\S]*?)__\b/g, function(n, i) {
        return "<u>" + i + "</u>";
      })) : (e = e.replace(/___(\S[\s\S]*?)___/g, function(n, i) {
        return /\S$/.test(i) ? "<u>" + i + "</u>" : n;
      }), e = e.replace(/__(\S[\s\S]*?)__/g, function(n, i) {
        return /\S$/.test(i) ? "<u>" + i + "</u>" : n;
      })), e = e.replace(/(_)/g, t.helper.escapeCharactersCallback), e = r.converter._dispatch("underline.after", e, a, r)), e;
    }), t.subParser("unescapeSpecialChars", function(e, a, r) {
      "use strict";
      return e = r.converter._dispatch("unescapeSpecialChars.before", e, a, r), e = e.replace(/¨E(\d+)E/g, function(n, i) {
        var c = parseInt(i);
        return String.fromCharCode(c);
      }), e = r.converter._dispatch("unescapeSpecialChars.after", e, a, r), e;
    }), t.subParser("makeMarkdown.blockquote", function(e, a) {
      "use strict";
      var r = "";
      if (e.hasChildNodes())
        for (var n = e.childNodes, i = n.length, c = 0; c < i; ++c) {
          var s = t.subParser("makeMarkdown.node")(n[c], a);
          s !== "" && (r += s);
        }
      return r = r.trim(), r = "> " + r.split(`
`).join(`
> `), r;
    }), t.subParser("makeMarkdown.codeBlock", function(e, a) {
      "use strict";
      var r = e.getAttribute("language"), n = e.getAttribute("precodenum");
      return "```" + r + `
` + a.preList[n] + "\n```";
    }), t.subParser("makeMarkdown.codeSpan", function(e) {
      "use strict";
      return "`" + e.innerHTML + "`";
    }), t.subParser("makeMarkdown.emphasis", function(e, a) {
      "use strict";
      var r = "";
      if (e.hasChildNodes()) {
        r += "*";
        for (var n = e.childNodes, i = n.length, c = 0; c < i; ++c) r += t.subParser("makeMarkdown.node")(n[c], a);
        r += "*";
      }
      return r;
    }), t.subParser("makeMarkdown.header", function(e, a, r) {
      "use strict";
      var n = new Array(r + 1).join("#"), i = "";
      if (e.hasChildNodes()) {
        i = n + " ";
        for (var c = e.childNodes, s = c.length, m = 0; m < s; ++m) i += t.subParser("makeMarkdown.node")(c[m], a);
      }
      return i;
    }), t.subParser("makeMarkdown.hr", function() {
      "use strict";
      return "---";
    }), t.subParser("makeMarkdown.image", function(e) {
      "use strict";
      var a = "";
      return e.hasAttribute("src") && (a += "![" + e.getAttribute("alt") + "](", a += "<" + e.getAttribute("src") + ">", e.hasAttribute("width") && e.hasAttribute("height") && (a += " =" + e.getAttribute("width") + "x" + e.getAttribute("height")), e.hasAttribute("title") && (a += ' "' + e.getAttribute("title") + '"'), a += ")"), a;
    }), t.subParser("makeMarkdown.links", function(e, a) {
      "use strict";
      var r = "";
      if (e.hasChildNodes() && e.hasAttribute("href")) {
        var n = e.childNodes, i = n.length;
        r = "[";
        for (var c = 0; c < i; ++c) r += t.subParser("makeMarkdown.node")(n[c], a);
        r += "](", r += "<" + e.getAttribute("href") + ">", e.hasAttribute("title") && (r += ' "' + e.getAttribute("title") + '"'), r += ")";
      }
      return r;
    }), t.subParser("makeMarkdown.list", function(e, a, r) {
      "use strict";
      var n = "";
      if (!e.hasChildNodes()) return "";
      for (var i = e.childNodes, c = i.length, s = e.getAttribute("start") || 1, m = 0; m < c; ++m)
        if (!(typeof i[m].tagName > "u" || i[m].tagName.toLowerCase() !== "li")) {
          var M = "";
          r === "ol" ? M = s.toString() + ". " : M = "- ", n += M + t.subParser("makeMarkdown.listItem")(i[m], a), ++s;
        }
      return n += `
<!-- -->
`, n.trim();
    }), t.subParser("makeMarkdown.listItem", function(e, a) {
      "use strict";
      for (var r = "", n = e.childNodes, i = n.length, c = 0; c < i; ++c) r += t.subParser("makeMarkdown.node")(n[c], a);
      return /\n$/.test(r) ? r = r.split(`
`).join(`
    `).replace(/^ {4}$/gm, "").replace(/\n\n+/g, `

`) : r += `
`, r;
    }), t.subParser("makeMarkdown.node", function(e, a, r) {
      "use strict";
      r = r || !1;
      var n = "";
      if (e.nodeType === 3) return t.subParser("makeMarkdown.txt")(e, a);
      if (e.nodeType === 8) return "<!--" + e.data + `-->

`;
      if (e.nodeType !== 1) return "";
      switch (e.tagName.toLowerCase()) {
        case "h1":
          r || (n = t.subParser("makeMarkdown.header")(e, a, 1) + `

`);
          break;
        case "h2":
          r || (n = t.subParser("makeMarkdown.header")(e, a, 2) + `

`);
          break;
        case "h3":
          r || (n = t.subParser("makeMarkdown.header")(e, a, 3) + `

`);
          break;
        case "h4":
          r || (n = t.subParser("makeMarkdown.header")(e, a, 4) + `

`);
          break;
        case "h5":
          r || (n = t.subParser("makeMarkdown.header")(e, a, 5) + `

`);
          break;
        case "h6":
          r || (n = t.subParser("makeMarkdown.header")(e, a, 6) + `

`);
          break;
        case "p":
          r || (n = t.subParser("makeMarkdown.paragraph")(e, a) + `

`);
          break;
        case "blockquote":
          r || (n = t.subParser("makeMarkdown.blockquote")(e, a) + `

`);
          break;
        case "hr":
          r || (n = t.subParser("makeMarkdown.hr")(e, a) + `

`);
          break;
        case "ol":
          r || (n = t.subParser("makeMarkdown.list")(e, a, "ol") + `

`);
          break;
        case "ul":
          r || (n = t.subParser("makeMarkdown.list")(e, a, "ul") + `

`);
          break;
        case "precode":
          r || (n = t.subParser("makeMarkdown.codeBlock")(e, a) + `

`);
          break;
        case "pre":
          r || (n = t.subParser("makeMarkdown.pre")(e, a) + `

`);
          break;
        case "table":
          r || (n = t.subParser("makeMarkdown.table")(e, a) + `

`);
          break;
        case "code":
          n = t.subParser("makeMarkdown.codeSpan")(e, a);
          break;
        case "em":
        case "i":
          n = t.subParser("makeMarkdown.emphasis")(e, a);
          break;
        case "strong":
        case "b":
          n = t.subParser("makeMarkdown.strong")(e, a);
          break;
        case "del":
          n = t.subParser("makeMarkdown.strikethrough")(e, a);
          break;
        case "a":
          n = t.subParser("makeMarkdown.links")(e, a);
          break;
        case "img":
          n = t.subParser("makeMarkdown.image")(e, a);
          break;
        default:
          n = e.outerHTML + `

`;
      }
      return n;
    }), t.subParser("makeMarkdown.paragraph", function(e, a) {
      "use strict";
      var r = "";
      if (e.hasChildNodes())
        for (var n = e.childNodes, i = n.length, c = 0; c < i; ++c) r += t.subParser("makeMarkdown.node")(n[c], a);
      return r = r.trim(), r;
    }), t.subParser("makeMarkdown.pre", function(e, a) {
      "use strict";
      var r = e.getAttribute("prenum");
      return "<pre>" + a.preList[r] + "</pre>";
    }), t.subParser("makeMarkdown.strikethrough", function(e, a) {
      "use strict";
      var r = "";
      if (e.hasChildNodes()) {
        r += "~~";
        for (var n = e.childNodes, i = n.length, c = 0; c < i; ++c) r += t.subParser("makeMarkdown.node")(n[c], a);
        r += "~~";
      }
      return r;
    }), t.subParser("makeMarkdown.strong", function(e, a) {
      "use strict";
      var r = "";
      if (e.hasChildNodes()) {
        r += "**";
        for (var n = e.childNodes, i = n.length, c = 0; c < i; ++c) r += t.subParser("makeMarkdown.node")(n[c], a);
        r += "**";
      }
      return r;
    }), t.subParser("makeMarkdown.table", function(e, a) {
      "use strict";
      var r = "", n = [[], []], i = e.querySelectorAll("thead>tr>th"), c = e.querySelectorAll("tbody>tr"), s, m;
      for (s = 0; s < i.length; ++s) {
        var M = t.subParser("makeMarkdown.tableCell")(i[s], a), P = "---";
        if (i[s].hasAttribute("style")) switch (i[s].getAttribute("style").toLowerCase().replace(/\s/g, "")) {
          case "text-align:left;":
            P = ":---";
            break;
          case "text-align:right;":
            P = "---:";
            break;
          case "text-align:center;":
            P = ":---:";
            break;
        }
        n[0][s] = M.trim(), n[1][s] = P;
      }
      for (s = 0; s < c.length; ++s) {
        var S = n.push([]) - 1, C = c[s].getElementsByTagName("td");
        for (m = 0; m < i.length; ++m) {
          var o = " ";
          typeof C[m] < "u" && (o = t.subParser("makeMarkdown.tableCell")(C[m], a)), n[S].push(o);
        }
      }
      var b = 3;
      for (s = 0; s < n.length; ++s) for (m = 0; m < n[s].length; ++m) {
        var j = n[s][m].length;
        j > b && (b = j);
      }
      for (s = 0; s < n.length; ++s) {
        for (m = 0; m < n[s].length; ++m) s === 1 ? n[s][m].slice(-1) === ":" ? n[s][m] = t.helper.padEnd(n[s][m].slice(-1), b - 1, "-") + ":" : n[s][m] = t.helper.padEnd(n[s][m], b, "-") : n[s][m] = t.helper.padEnd(n[s][m], b);
        r += "| " + n[s].join(" | ") + ` |
`;
      }
      return r.trim();
    }), t.subParser("makeMarkdown.tableCell", function(e, a) {
      "use strict";
      var r = "";
      if (!e.hasChildNodes()) return "";
      for (var n = e.childNodes, i = n.length, c = 0; c < i; ++c) r += t.subParser("makeMarkdown.node")(n[c], a, !0);
      return r.trim();
    }), t.subParser("makeMarkdown.txt", function(e) {
      "use strict";
      var a = e.nodeValue;
      return a = a.replace(/ +/g, " "), a = a.replace(/¨NBSP;/g, " "), a = t.helper.unescapeHTMLEntities(a), a = a.replace(/([*_~|`])/g, "\\$1"), a = a.replace(/^(\s*)>/g, "\\$1>"), a = a.replace(/^#/gm, "\\#"), a = a.replace(/^(\s*)([-=]{3,})(\s*)$/, "$1\\$2$3"), a = a.replace(/^( {0,3}\d+)\./gm, "$1\\."), a = a.replace(/^( {0,3})([+-])/gm, "$1\\$2"), a = a.replace(/]([\s]*)\(/g, "\\]$1\\("), a = a.replace(/^ {0,3}\[([\S \t]*?)]:/gm, "\\[$1]:"), a;
    });
    var q = this;
    typeof define == "function" && define.amd ? define(function() {
      "use strict";
      return t;
    }) : typeof d < "u" && d.exports ? d.exports = t : q.showdown = t;
  }).call(u);
})), We = /* @__PURE__ */ nr(br(), 1), Se = /* @__PURE__ */ new Set([
  "script",
  "style",
  "textarea",
  "title"
]), kr = /* @__PURE__ */ new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]), yr = /* @__PURE__ */ new Set([
  "a",
  "abbr",
  "b",
  "bdi",
  "bdo",
  "cite",
  "code",
  "data",
  "del",
  "dfn",
  "em",
  "i",
  "ins",
  "kbd",
  "label",
  "mark",
  "q",
  "ruby",
  "s",
  "samp",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "time",
  "u",
  "var"
]);
function Ve(u = "", d = 0) {
  const l = String(u || "");
  if (l[d] !== "<") return null;
  let f = d + 1;
  for (; /\s/.test(l[f] || ""); ) f += 1;
  const t = l[f] === "/";
  if (t)
    for (f += 1; /\s/.test(l[f] || ""); ) f += 1;
  if (!/[a-z]/i.test(l[f] || "")) return null;
  const g = f;
  for (; /[\w:.-]/.test(l[f] || ""); ) f += 1;
  const h = l.slice(g, f).toLowerCase();
  let _ = "";
  for (; f < l.length; f += 1) {
    const p = l[f];
    if (_) {
      p === _ && (_ = "");
      continue;
    }
    if (p === '"' || p === "'") {
      _ = p;
      continue;
    }
    if (p !== ">") continue;
    const k = l.slice(d, f + 1);
    return {
      start: d,
      end: f + 1,
      name: h,
      closing: t,
      selfClosing: !t && (kr.has(h) || /\/\s*>$/.test(k))
    };
  }
  return null;
}
function Sr(u = "", d = "", l = 0) {
  const f = String(u || ""), t = f.toLowerCase(), g = `</${String(d || "").toLowerCase()}`;
  let h = l;
  for (; (h = t.indexOf(g, h)) >= 0; ) {
    const _ = Ve(f, h);
    if (_?.closing && _.name === d) return _;
    h += g.length;
  }
  return null;
}
function fe(u = "") {
  const d = String(u || ""), l = [];
  let f = 0, t = "";
  for (; f < d.length; ) {
    if (t) {
      const _ = Sr(d, t, f);
      if (!_) break;
      l.push(_), f = _.end, t = "";
      continue;
    }
    const g = d.indexOf("<", f);
    if (g < 0) break;
    if (d.startsWith("<!--", g)) {
      const _ = d.indexOf("-->", g + 4);
      f = _ < 0 ? d.length : _ + 3;
      continue;
    }
    if (d.startsWith("<![CDATA[", g)) {
      const _ = d.indexOf("]]>", g + 9);
      f = _ < 0 ? d.length : _ + 3;
      continue;
    }
    if (/^<\s*[!?]/.test(d.slice(g))) {
      const _ = d.indexOf(">", g + 2);
      f = _ < 0 ? d.length : _ + 1;
      continue;
    }
    const h = Ve(d, g);
    if (!h) {
      f = g + 1;
      continue;
    }
    l.push(h), f = h.end, !h.closing && !h.selfClosing && Se.has(h.name) && (t = h.name);
  }
  return l;
}
function Cr(u = "", d = fe(u)) {
  const l = String(u || "");
  let f = "", t = 0;
  return d.forEach((g) => {
    f += l.slice(t, g.start), t = g.end;
  }), f + l.slice(t);
}
function oe(u = "") {
  const d = String(u || "").trim();
  if (!d || !d.startsWith("<") || !d.endsWith(">") || /^<!--[\s\S]*-->$/.test(d) || /^<!doctype\b/i.test(d) || /^<\?xml\b/i.test(d)) return !1;
  const l = fe(d);
  if (!l.length || l.some((t) => Se.has(t.name))) return !1;
  const f = Cr(d, l).trim();
  return !f || !/(^|\s)(?:#{1,6}\s|[-+*]\s|\d+\.\s|```|~~~|>\s)/.test(f);
}
function Ge(u = []) {
  const d = [], l = [];
  let f = 0;
  return u.forEach((t) => {
    if (t.selfClosing) return;
    if (!t.closing) {
      f += 1, d.push({
        id: f,
        tag: t,
        depth: d.length
      });
      return;
    }
    const g = d[d.length - 1];
    if (!g || g.tag.name !== t.name) {
      d.length = 0;
      return;
    }
    d.pop(), l.push({
      id: g.id,
      start: g.tag.end,
      end: t.start,
      depth: g.depth,
      rawText: Se.has(t.name),
      blockContainer: !yr.has(t.name),
      openingTag: g.tag,
      closingTag: t
    });
  }), l;
}
function Ke(u = []) {
  const d = [];
  let l = 0;
  return u.forEach((f) => {
    d.push(l), l += String(f || "").length + 1;
  }), d;
}
function Pr(u = [], d = 0) {
  return u.filter((l) => l.start <= d && d < l.end);
}
function Mr(u = "", d = 0, l = [], f = []) {
  const t = String(u || ""), g = d + t.length, h = l.filter((z) => z.start < g && z.end > d), _ = [];
  let p = d;
  h.forEach((z) => {
    z.start > p && _.push([p, Math.min(z.start, g)]), p = Math.max(p, z.end);
  }), p < g && _.push([p, g]);
  let k = null, y = !1;
  for (const [z, B] of _) {
    const F = t.slice(Math.max(0, z - d), Math.max(0, B - d)).search(/\S/);
    if (F < 0) continue;
    y = !0;
    const U = Pr(f, z + F);
    if (U.some((O) => O.rawText)) return null;
    const W = new Set(U.filter((O) => O.blockContainer && !O.rawText).map((O) => O.id));
    if (!W.size || (k = k === null ? W : new Set([...k].filter((O) => W.has(O))), !k.size)) return null;
  }
  return !y || !k?.size ? null : f.filter((z) => k.has(z.id)).sort((z, B) => B.depth - z.depth)[0] || null;
}
function zr(u = []) {
  const d = u.filter((f) => String(f || "").trim()).map((f) => (String(f || "").match(/^[ \t]*/) || [""])[0]);
  if (!d.length) return "";
  let l = d[0];
  for (const f of d.slice(1)) {
    let t = 0;
    for (; t < l.length && t < f.length && l[t] === f[t]; ) t += 1;
    if (l = l.slice(0, t), !l) break;
  }
  return l;
}
function $r(u = []) {
  const d = [...u], l = fe(d.join(`
`)), f = Ge(l);
  if (!f.length) return d;
  const t = Ke(d), g = d.map((h, _) => oe(h) ? null : Mr(h, t[_], l, f));
  for (let h = 0; h < d.length; ) {
    const _ = g[h];
    if (!_) {
      h += 1;
      continue;
    }
    const p = h;
    for (h += 1; h < d.length; ) {
      if (g[h]?.id === _.id) {
        h += 1;
        continue;
      }
      if (!d[h].trim() && !oe(d[h])) {
        h += 1;
        continue;
      }
      break;
    }
    const k = zr(d.slice(p, h));
    if (k)
      for (let y = p; y < h; y += 1) d[y].trim() && (d[y] = d[y].slice(k.length));
  }
  return d;
}
function ze(u = [], d = 0) {
  let l = 0, f = u.length - 1;
  for (; l <= f; ) {
    const t = Math.floor((l + f) / 2);
    if (u[t] <= d) {
      if (t === u.length - 1 || u[t + 1] > d) return t;
      l = t + 1;
    } else f = t - 1;
  }
  return 0;
}
function jr(u = []) {
  const d = fe(u.join(`
`)), l = Ge(d);
  if (!l.length) return u;
  const f = Ke(u), t = /* @__PURE__ */ new Set();
  l.forEach((h) => {
    const _ = ze(f, h.openingTag.start), p = ze(f, h.closingTag.start);
    !h.blockContainer || _ === p || (t.add(h.openingTag.start), t.add(h.closingTag.start));
  });
  const g = [];
  return u.forEach((h, _) => {
    if (oe(h)) {
      g.push(h);
      return;
    }
    const p = f[_], k = p + h.length, y = d.filter((O) => O.start >= p && O.end <= k && t.has(O.start));
    let z = 0, B = (h.match(/^[ \t]*/) || [""])[0].length;
    for (const O of y.filter(($) => !$.closing).sort(($, R) => $.start - R.start)) {
      if (O.start - p !== B) break;
      for (z = O.end - p, B = z; /[ \t]/.test(h[B] || ""); ) B += 1;
    }
    let F = h.length;
    B = h.length - (h.match(/[ \t]*$/) || [""])[0].length;
    for (const O of y.filter(($) => $.closing).sort(($, R) => R.end - $.end)) {
      if (O.end - p !== B) break;
      for (F = O.start - p, B = F; B > 0 && /[ \t]/.test(h[B - 1]); ) B -= 1;
    }
    if (!z && F === h.length) {
      g.push(h);
      return;
    }
    z && g.push(h.slice(0, z));
    const U = F === h.length ? h.length : F, W = h.slice(z, U);
    W.trim() && g.push(W), F < h.length && g.push(h.slice(F));
  }), g;
}
function Er(u = []) {
  return jr($r(u));
}
var _e = null, $e = !1, je = 0, Ar = /* @__PURE__ */ new Map(), Ee = 0, be = /* @__PURE__ */ new Map(), Tr = /* @__PURE__ */ new Set([
  "html",
  "htm",
  "xhtml",
  "xml",
  "svg",
  "vue",
  "svelte"
]), de = [".xb-tavern-markdown", ".xb-assistant-markdown"];
function Lr(u) {
  return String(u || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function Ir() {
  return je += 1, `html-${Date.now().toString(36)}-${je.toString(36)}`;
}
function Br() {
  return Ee += 1, `raw-${Date.now().toString(36)}-${Ee.toString(36)}`;
}
function Hr(u = "") {
  return Tr.has(String(u || "").trim().toLowerCase());
}
function Rr() {
  $e || ($e = !0, We.default.subParser("unhashHTMLSpans", function(d, l, f) {
    let t = f.converter._dispatch("unhashHTMLSpans.before", d, l, f);
    for (let g = 0; g < f.gHtmlSpans.length; g += 1) {
      let h = f.gHtmlSpans[g], _ = 0;
      for (; /¨C(\d+)C/.test(h); ) {
        const p = RegExp.$1;
        if (h = h.replace(`¨C${p}C`, f.gHtmlSpans[p]), _ === 1e4) break;
        _ += 1;
      }
      t = t.replace(`¨C${g}C`, h);
    }
    return f.converter._dispatch("unhashHTMLSpans.after", t, l, f);
  }));
}
function Fr(u = "") {
  const d = String(u || "").trim();
  return d ? /^<!doctype\s+html/i.test(d) || /^<html[\s>]/i.test(d) ? !0 : (d.match(/<\/?[a-z][\w:-]*(?:\s[^<>]*)?>/gi) || []).length >= 3 && /<\/[a-z][\w:-]*>/i.test(d) : !1;
}
function Dr(u = "", d = "html") {
  const l = Ir();
  return Ar.set(l, {
    code: String(u || ""),
    language: String(d || "html").trim() || "html"
  }), `@@XBHTMLBLOCK:${l}@@`;
}
function Or(u = "") {
  const d = Br();
  return be.set(d, String(u || "")), `@@XBHTMLRAW:${d}@@`;
}
function qr(u = "") {
  const d = String(u || "");
  return d && (d.replace(/&nbsp;|&#160;|&#xa0;/gi, "").replace(/[\s\u00A0\u200B-\u200D\u2060\uFEFF]+/g, "") ? d : "");
}
function Ae(u = "") {
  const d = String(u || "");
  if (!d.trim()) return d;
  const l = Er(d.split(/\r?\n/).map((t) => qr(t))), f = [];
  for (let t = 0; t < l.length; t += 1) {
    const g = l[t];
    if (!oe(g)) {
      f.push(g);
      continue;
    }
    const h = [g];
    for (; t + 1 < l.length && oe(l[t + 1]); )
      t += 1, h.push(l[t]);
    (f[f.length - 1] ?? "").trim() && f.push(""), f.push(Or(h.join(`
`)));
    const _ = l[t + 1] ?? "";
    _.trim() && !oe(_) && f.push("");
  }
  return f.join(`
`);
}
function Nr(u = "", d = {}) {
  const l = String(u || ""), f = d.htmlFenceMode === "code" ? "code" : "placeholder", t = d.protectRawHtmlBoundaries !== !1, g = /(^|\n)(`{3,}|~{3,})[ \t]*([^\n]*)\n([\s\S]*?)\n\2[ \t]*(?=\n|$)/g;
  let h = "", _ = 0, p = null;
  for (; (p = g.exec(l)) !== null; ) {
    const k = p[1] || "", y = p.index + k.length, z = g.lastIndex, B = String(p[3] || "").trim().split(/\s+/)[0] || "", F = String(p[4] || ""), U = Hr(B) || !B && Fr(F);
    h += t ? Ae(l.slice(_, y)) : l.slice(_, y), U && f !== "code" ? h += Dr(F, B || "html") : h += l.slice(y, z), _ = z;
  }
  return h += t ? Ae(l.slice(_)) : l.slice(_), h;
}
function Te(u = "") {
  return String(u || "").replace(/@@XBHTMLBLOCK:([a-z0-9-]+)@@|@@XB_HTML_BLOCK_([a-z0-9-]+)@@/g, (d, l, f) => `<span class="xb-markdown-html-placeholder" data-xb-html-block-id="${l || f}"></span>`);
}
function Ur(u = "") {
  const d = (l, f) => {
    const t = be.get(f) || "";
    return be.delete(f), t;
  };
  return String(u || "").replace(/<p>\s*@@XBHTMLRAW:([a-z0-9-]+)@@\s*<\/p>/g, d).replace(/(^|[\r\n])@@XBHTMLRAW:([a-z0-9-]+)@@(?=[\r\n]|$)/g, (l, f, t) => `${f}${d(l, t)}`);
}
function Wr(u = "") {
  return String(u || "").replace(/&#x([0-9a-f]+);?/gi, (d, l) => String.fromCodePoint(Number.parseInt(l, 16) || 0)).replace(/&#([0-9]+);?/g, (d, l) => String.fromCodePoint(Number.parseInt(l, 10) || 0)).replace(/&colon;?/gi, ":").replace(/&tab;?/gi, "	").replace(/&newline;?/gi, `
`).replace(/&amp;?/gi, "&");
}
function Vr(u = "") {
  const d = Wr(u).trim().replace(/[\u0000-\u001F\u007F\s]+/g, "").toLowerCase();
  return /^(?:javascript|vbscript|data):/.test(d);
}
function Gr(u = "") {
  return String(u || "").replace(/<style>([\s\S]+?)<\/style>/gim, (d, l) => `<custom-style>${encodeURIComponent(l)}</custom-style>`);
}
function Kr(u = "") {
  const d = [];
  let l = "", f = 0;
  for (const t of String(u || "")) {
    if ((t === "(" || t === "[") && (f += 1), (t === ")" || t === "]") && f > 0 && (f -= 1), t === "," && f === 0) {
      d.push(l), l = "";
      continue;
    }
    l += t;
  }
  return l && d.push(l), d;
}
function Zr(u = "") {
  const d = new RegExp(`:(${[
    "has",
    "not",
    "where",
    "is",
    "matches",
    "any"
  ].join("|")})\\(([^)]+)\\)`, "g"), l = (f = "") => String(f || "").split(/\s+/).map((t) => t.replace(/\.([\w-]+)/g, (g, h) => String(h || "").startsWith("custom-") ? g : `.custom-${h}`)).join(" ");
  return l(String(u || "").replace(d, (f, t, g) => `:${t}(${l(g)})`));
}
function Xr(u = de) {
  const d = (Array.isArray(u) ? u : [u]).map((l) => String(l || "").trim()).filter(Boolean).map((l) => `${l} `);
  return d.length ? d : de.map((l) => `${l} `);
}
function Qr(u = "", d = de) {
  const l = Xr(d);
  return String(u || "").replace(/@import[^;]+;?/gi, "").replace(/(^|[{}])\s*([^@{}][^{}]*)\{/g, (f, t, g) => {
    const h = Kr(g).map((_) => _.trim()).filter(Boolean);
    return !h.length || h.every((_) => /^(?:from|to|\d+(?:\.\d+)?%)$/i.test(_)) ? f : `${t}${h.flatMap((_) => {
      const p = Zr(_);
      return l.map((k) => `${k}${p}`);
    }).join(", ")}{`;
  }).replace(/[^{};]+:\s*[^{};]*:\/\/[^{};]*(?:;|(?=}))/g, "");
}
function Le(u = "", d = {}) {
  const l = Array.isArray(d.prefixes) ? d.prefixes : d.prefix ? [d.prefix] : de;
  return String(u || "").replace(/<custom-style>([\s\S]+?)<\/custom-style>/gim, (f, t) => {
    try {
      return `<style>${Qr(decodeURIComponent(String(t || "")).replaceAll(/<br\/>/g, ""), l)}</style>`;
    } catch (g) {
      return `CSS ERROR: ${g instanceof Error ? g.message : String(g || "decode_failed")}`;
    }
  });
}
function Jr(u = "") {
  return String(u || "").split(/\s+/).filter(Boolean).map((d) => d.startsWith("fa-") || d.startsWith("note-") || d === "monospace" || d.startsWith("custom-") ? d : `custom-${d}`).join(" ");
}
function Yr(u = "") {
  return String(u || "").replace(/<\/?(?:script|style|iframe|object|embed|link|meta|base|form|input|button|textarea|select|option)[^>]*>/gi, "").replace(/\s+on[a-z0-9_-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+)/gi, "").replace(/\s+class\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+)/gi, (d, l) => {
    const f = String(l || "")[0], t = f === '"' || f === "'", g = Jr(t ? String(l).slice(1, -1) : String(l || ""));
    return t ? ` class=${f}${g}${f}` : ` class=${g}`;
  }).replace(/\s+(href|src|xlink:href)\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+)/gi, (d, l, f) => Vr(String(f || "").replace(/^["']|["']$/g, "")) ? "" : ` ${l}=${f}`);
}
function Ie(u) {
  return typeof u?.sanitize == "function" ? u : null;
}
function xr() {
  try {
    const u = globalThis.parent && globalThis.parent !== globalThis ? Ie(globalThis.parent.DOMPurify) : null;
    if (u) return u;
  } catch {
  }
  return Ie(globalThis.DOMPurify);
}
function ea(u = "") {
  const d = Gr(u), l = xr(), f = {
    RETURN_DOM: !1,
    RETURN_DOM_FRAGMENT: !1,
    RETURN_TRUSTED_TYPE: !1,
    MESSAGE_SANITIZE: !0,
    ADD_TAGS: ["custom-style"]
  };
  if (l) try {
    return Le(String(l.sanitize(d, f) || ""));
  } catch {
  }
  return Le(Yr(d));
}
function ra(u, d = {}) {
  const l = String(u || "").trim();
  if (!l) return "";
  const f = Nr(l, d);
  try {
    return _e || (Rr(), _e = new We.default.Converter({
      emoji: !0,
      literalMidWordUnderscores: !0,
      parseImgDimensions: !0,
      simpleLineBreaks: !0,
      strikethrough: !0,
      tables: !0,
      underline: !0,
      disableForced4SpacesIndentedSublists: !0
    })), Te(ea(Ur(_e.makeHtml(f))));
  } catch {
  }
  return Te(Lr(f).replace(/\n/g, "<br>"));
}
var aa = /* @__PURE__ */ new Set([
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
]), ta = /* @__PURE__ */ new Set([
  "script",
  "style",
  "custom-style",
  "iframe",
  "object",
  "embed",
  "svg",
  "math"
]);
function Ze(u, d = globalThis.document) {
  const l = [], f = `XB4W${Array.from(crypto.getRandomValues(new Uint32Array(4))).join("")}MEDIA`, t = u.replace(/\[(?:img|图片)\s*:\s*([^\]]+)\]|\[(?:voice|语音)\s*:([^:\]]*):([^\]]+)\]|\[(?:voice|语音)\s*:\s*([^\]]+)\]/gi, (y, z, B, F, U, W) => {
    let O = 0;
    for (let $ = W - 1; $ >= 0 && u[$] === "\\"; $--) O++;
    return O % 2 ? y : (l.push(z !== void 0 ? {
      kind: "image",
      raw: y,
      value: z.trim()
    } : {
      kind: "voice",
      raw: y,
      value: String(F ?? U ?? "").trim(),
      emotion: String(B || "").trim().toLowerCase()
    }), `${f}${l.length - 1}END`);
  }), g = new RegExp(`${f}(\\d+)END`, "g"), h = (y) => y.replace(g, (z, B) => l[Number(B)].raw);
  function _(y, z) {
    if (z) return [{
      kind: "text",
      value: h(y)
    }];
    const B = [];
    let F = 0;
    for (const U of y.matchAll(g))
      U.index > F && B.push({
        kind: "text",
        value: y.slice(F, U.index)
      }), B.push({
        kind: "media",
        index: Number(U[1])
      }), F = U.index + U[0].length;
    return F < y.length && B.push({
      kind: "text",
      value: y.slice(F)
    }), B;
  }
  function p(y, z = !1) {
    if (y.nodeType === 3) return _(y.textContent || "", z);
    if (y.nodeType !== 1) return [];
    const B = y, F = B.localName;
    if (ta.has(F)) return [];
    if (F === "img") return [{
      kind: "text",
      value: h(B.getAttribute("alt") || "")
    }];
    const U = Array.from(B.childNodes).flatMap((O) => p(O, z || [
      "code",
      "pre",
      "a"
    ].includes(F)));
    if (!aa.has(F)) return U;
    const W = {};
    if (F === "a") {
      const O = h(B.getAttribute("href") || "").trim();
      if (!/^(?:https?:\/\/|mailto:)/i.test(O)) return U;
      W.href = O, W.target = "_blank", W.rel = "noopener noreferrer", B.hasAttribute("title") && (W.title = h(B.getAttribute("title")));
    }
    return F === "ol" && /^\d+$/.test(B.getAttribute("start") || "") && (W.start = B.getAttribute("start")), [{
      kind: "element",
      tag: F,
      attrs: W,
      children: U
    }];
  }
  const k = d.createElement("template");
  return k.innerHTML = ra(t, { htmlFenceMode: "code" }), {
    nodes: Array.from(k.content.childNodes).flatMap((y) => p(y)),
    media: l
  };
}
var na = ["data-message-index"], sa = ["src"], ia = {
  key: 1,
  class: "fourth-wall-avatar is-placeholder",
  "aria-hidden": "true"
}, oa = { class: "fourth-wall-message-stack" }, la = {
  key: 0,
  class: "fourth-wall-thinking"
}, ua = { class: "fourth-wall-bubble" }, ca = ["data-image-index"], da = ["src", "alt"], fa = ["onClick"], ha = {
  key: 2,
  class: "fourth-wall-image-unavailable"
}, ma = ["disabled", "onClick"], pa = ["onClick"], ga = { "aria-hidden": "true" }, va = { key: 0 }, _a = { class: "fourth-wall-message-actions" }, wa = ["disabled"], ba = ["disabled"], ka = ["disabled"], ya = { key: 1 }, Sa = /* @__PURE__ */ te({
  __name: "FourthWallMessage",
  props: {
    message: {},
    messageIndex: {},
    chatIdentity: {},
    sessionId: {},
    userAvatar: {},
    characterAvatar: {},
    imageAvailable: { type: Boolean },
    voiceAvailable: { type: Boolean },
    bridge: {},
    editable: { type: Boolean },
    editDraft: {}
  },
  emits: [
    "edit",
    "delete",
    "draft",
    "editCancel"
  ],
  setup(u, { emit: d }) {
    const l = u, f = d, t = re(() => l.editDraft !== void 0);
    De(() => (f("editCancel"), !0), () => t.value);
    const g = re({
      get: () => l.editDraft || "",
      set: (a) => f("draft", a)
    }), h = G(null);
    let _ = null;
    const p = ce({}), k = /* @__PURE__ */ new Set();
    let y = () => {
    };
    const z = re(() => Ze(l.message.content)), B = re(() => l.message.ts ? new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(l.message.ts) : "");
    function F(a, r) {
      return `fw-${a}-${Date.now()}-${l.messageIndex}-${r}-${Math.random().toString(36).slice(2, 7)}`;
    }
    function U(a) {
      return a.result;
    }
    function W(a, r) {
      return k.has(r) && p[a]?.requestId === r;
    }
    async function O(a, r) {
      if (p[r]?.status === "loading" || p[r]?.status === "ready") return;
      if (!l.imageAvailable) {
        p[r] = {
          status: "unavailable",
          message: "画图能力未启用"
        };
        return;
      }
      const n = F("image", r);
      k.add(n), p[r] = {
        status: "loading",
        message: "查询图片缓存",
        requestId: n
      };
      const i = {
        chatIdentity: l.chatIdentity,
        sessionId: l.sessionId
      };
      try {
        const c = U(await l.bridge.request("fourth-wall/image-check", {
          ...i,
          tags: a.value,
          mediaRequestId: n
        }, 3e4));
        if (!W(r, n)) return;
        if (!c.available) {
          p[r] = {
            status: "unavailable",
            message: "画图能力未启用",
            requestId: n
          };
          return;
        }
        let s = c.cached || "";
        if (!s) {
          p[r] = {
            status: "loading",
            message: "正在生成图片",
            requestId: n
          };
          const m = U(await l.bridge.request("fourth-wall/image-generate", {
            ...i,
            tags: a.value,
            mediaRequestId: n
          }, 18e4));
          if (!W(r, n)) return;
          s = m.base64;
        }
        p[r] = {
          status: "ready",
          source: /^(?:data:|blob:|https?:)/i.test(s) ? s : `data:image/png;base64,${s}`
        };
      } catch (c) {
        W(r, n) && (p[r] = {
          status: "error",
          message: c instanceof Error ? c.message : String(c),
          requestId: n
        });
      } finally {
        k.delete(n);
      }
    }
    async function $(a, r) {
      if (!l.voiceAvailable) {
        p[r] = {
          status: "unavailable",
          message: "TTS 能力未启用"
        };
        return;
      }
      const n = p[r];
      if (n?.status === "loading") return;
      if (n?.status === "playing" && n.requestId) {
        l.bridge.post("fourth-wall/voice-stop", {
          chatIdentity: l.chatIdentity,
          mediaRequestId: n.requestId
        }), p[r] = { status: "idle" };
        return;
      }
      const i = F("voice", r);
      k.add(i), p[r] = {
        status: "loading",
        message: "正在准备语音",
        requestId: i
      };
      try {
        await l.bridge.request("fourth-wall/voice-play", {
          chatIdentity: l.chatIdentity,
          sessionId: l.sessionId,
          mediaRequestId: i,
          text: a.value,
          emotion: a.emotion
        });
      } catch (c) {
        W(r, i) && (p[r] = {
          status: "error",
          message: c instanceof Error ? c.message : String(c),
          requestId: i
        }), k.delete(i);
      }
    }
    function R() {
      f("draft", l.message.content);
    }
    function D() {
      const a = g.value.trim();
      a && f("edit", l.messageIndex, a);
    }
    function q() {
      k.forEach((a) => {
        l.bridge.post("fourth-wall/image-cancel", {
          chatIdentity: l.chatIdentity,
          mediaRequestId: a
        }), l.bridge.post("fourth-wall/voice-stop", {
          chatIdentity: l.chatIdentity,
          mediaRequestId: a
        });
      }), k.clear();
    }
    function e() {
      _?.disconnect(), h.value?.querySelectorAll("[data-image-index]").forEach((a) => _?.observe(a));
    }
    return Fe(() => {
      y = l.bridge.subscribe((a) => {
        if (a.type === "fourth-wall/image-progress") {
          const r = a.payload, n = Object.keys(p).map(Number).find((i) => p[i]?.requestId === r.mediaRequestId);
          n !== void 0 && (p[n].message = r.status === "queued" ? `图片队列第 ${r.position || 1} 位` : "正在生成图片");
        }
        if (a.type === "fourth-wall/voice-state") {
          const r = a.payload, n = Object.keys(p).map(Number).find((i) => p[i]?.requestId === r.requestId);
          if (n === void 0) return;
          r.state === "playing" && (p[n].status = "playing"), (r.state === "ended" || r.state === "stopped") && (k.delete(String(r.requestId || "")), p[n] = { status: "idle" }), r.state === "error" && (k.delete(String(r.requestId || "")), p[n] = {
            status: "error",
            message: r.message || "语音播放失败"
          });
        }
      }), h.value && typeof IntersectionObserver < "u" && (_ = new IntersectionObserver((a) => {
        for (const r of a) {
          if (!r.isIntersecting) continue;
          const n = Number(r.target.dataset.imageIndex), i = z.value.media[n];
          i?.kind === "image" && O(i, n), _?.unobserve(r.target);
        }
      }, { root: h.value.closest(".fourth-wall-conversation") }), e());
    }), se(() => l.message.content, () => {
      q(), Object.keys(p).forEach((a) => delete p[Number(a)]);
    }), se([z, t], e, { flush: "post" }), Be(() => {
      y(), _?.disconnect(), q();
    }), (a, r) => (I(), H("article", {
      ref_key: "root",
      ref: h,
      class: ye(["fourth-wall-message", u.message.role === "user" ? "is-user" : "is-ai"]),
      "data-message-index": u.messageIndex
    }, [(u.message.role === "user" ? u.userAvatar : u.characterAvatar) ? (I(), H("img", {
      key: 0,
      class: "fourth-wall-avatar",
      src: u.message.role === "user" ? u.userAvatar : u.characterAvatar,
      alt: ""
    }, null, 8, sa)) : (I(), H("span", ia)), v("div", oa, [
      u.message.thinking ? (I(), H("details", la, [r[3] || (r[3] = v("summary", null, "思考过程", -1)), v("div", null, V(u.message.thinking), 1)])) : K("", !0),
      v("div", ua, [t.value ? Q((I(), H("textarea", {
        key: 0,
        "onUpdate:modelValue": r[0] || (r[0] = (n) => g.value = n),
        class: "fourth-wall-edit",
        rows: "3"
      }, null, 512)), [[ae, g.value]]) : (I(), ne(Re(Ue), {
        key: 1,
        content: z.value
      }, {
        media: ke(({ segment: n, index: i }) => [n.kind === "image" ? (I(), H("span", {
          key: 0,
          class: "fourth-wall-image-card",
          "data-image-index": i
        }, [p[i]?.status === "ready" ? (I(), H("img", {
          key: 0,
          src: p[i].source,
          alt: n.value
        }, null, 8, da)) : p[i]?.status === "error" ? (I(), H("button", {
          key: 1,
          type: "button",
          onClick: (c) => O(n, i)
        }, [x(V(n.raw), 1), v("small", null, V(p[i].message) + "，点此重试", 1)], 8, fa)) : p[i]?.status === "unavailable" ? (I(), H("span", ha, [x(V(n.raw), 1), v("small", null, V(p[i].message), 1)])) : (I(), H("button", {
          key: 3,
          type: "button",
          disabled: p[i]?.status === "loading",
          onClick: (c) => O(n, i)
        }, [x(V(n.raw), 1), v("small", null, V(p[i]?.message || "生成图片"), 1)], 8, ma))], 8, ca)) : (I(), H("button", {
          key: 1,
          class: "fourth-wall-voice",
          type: "button",
          onClick: (c) => $(n, i)
        }, [
          v("span", ga, V(p[i]?.status === "playing" ? "■" : "▶"), 1),
          v("span", null, V(n.value), 1),
          p[i]?.message ? (I(), H("small", va, V(p[i].message), 1)) : K("", !0)
        ], 8, pa))]),
        _: 1
      }, 8, ["content"])), v("div", _a, [t.value ? (I(), H(le, { key: 0 }, [v("button", {
        type: "button",
        disabled: !u.editable,
        onClick: D
      }, "保存", 8, wa), v("button", {
        type: "button",
        onClick: r[1] || (r[1] = (n) => f("editCancel"))
      }, "取消")], 64)) : (I(), H(le, { key: 1 }, [v("button", {
        type: "button",
        disabled: !u.editable,
        onClick: R
      }, "编辑", 8, ba), v("button", {
        type: "button",
        disabled: !u.editable,
        onClick: r[2] || (r[2] = (n) => f("delete", u.messageIndex))
      }, "删除", 8, ka)], 64))])]),
      B.value ? (I(), H("time", ya, V(B.value), 1)) : K("", !0)
    ])], 10, na));
  }
}), Ca = Sa, Pa = ["disabled"], Ma = {
  key: 1,
  class: "fourth-wall-empty"
}, za = ["disabled"], $a = {
  key: 3,
  class: "fourth-wall-message is-ai is-streaming",
  role: "status"
}, ja = ["src"], Ea = {
  key: 1,
  class: "fourth-wall-avatar is-placeholder"
}, Aa = { class: "fourth-wall-message-stack" }, Ta = {
  key: 0,
  class: "fourth-wall-thinking",
  open: ""
}, La = { class: "fourth-wall-bubble" }, Ia = {
  key: 2,
  class: "fourth-wall-unsaved"
}, Ba = ["disabled"], Ha = /* @__PURE__ */ te({
  __name: "FourthWallConversation",
  props: {
    page: {},
    busy: { type: Boolean },
    sessionId: {},
    chatIdentity: {},
    userAvatar: {},
    characterAvatar: {},
    imageAvailable: { type: Boolean },
    voiceAvailable: { type: Boolean },
    generation: {},
    bridge: {}
  },
  emits: [
    "edit",
    "delete",
    "error"
  ],
  setup(u, { emit: d }) {
    const l = u, f = d, t = G(null), g = G(l.page), h = re(() => Ze(l.generation.text || "")), _ = G(!1), p = G(!0), k = G(null);
    let y = 0;
    const z = {
      counting: "正在计算上下文…",
      summarizing: "正在整理皮下记忆…",
      saving: "正在保存…",
      replying: "等待回应…"
    };
    function B() {
      const $ = t.value;
      if (!$) return null;
      const R = $.getBoundingClientRect().top, D = Array.from($.querySelectorAll("[data-message-index]")).find((q) => q.getBoundingClientRect().bottom > R);
      return D ? {
        index: D.dataset.messageIndex,
        offset: D.getBoundingClientRect().top - R
      } : null;
    }
    async function F($, R = !1) {
      const D = B();
      if (k.value && $.sessionId === g.value.sessionId) {
        const e = $.messages[k.value.index - $.start];
        e?.ts === k.value.ts && e.content === k.value.content.trim() ? k.value = null : e?.ts === k.value.ts && e.content === k.value.original ? k.value.revision = $.revision : e && (f("error", `正在编辑的消息已变化，未保存的草稿：${k.value.content}`), k.value = null);
      }
      g.value = $, await Me();
      const q = t.value;
      if (q) {
        if (R) {
          q.scrollTop = q.scrollHeight, p.value = !0;
          return;
        }
        if (D) {
          const e = q.querySelector('[data-message-index="' + D.index + '"]');
          e && (q.scrollTop += e.getBoundingClientRect().top - q.getBoundingClientRect().top - D.offset);
        }
      }
    }
    function U() {
      const $ = t.value;
      $ && (p.value = g.value.start + g.value.messages.length === g.value.total && $.scrollHeight - $.clientHeight - $.scrollTop < 48);
    }
    async function W($) {
      if (_.value) return;
      const R = ++y;
      _.value = !0;
      const D = l.sessionId;
      try {
        const q = await l.bridge.request("fourth-wall/history-page", {
          chatIdentity: l.chatIdentity,
          sessionId: D,
          direction: $,
          revision: g.value.revision
        });
        if (R !== y || D !== l.sessionId) return;
        $ !== "latest" && (p.value = !1);
        const e = q.result;
        if ($ === "earlier") e.messages = [...e.messages, ...g.value.messages].slice(0, 60);
        else if ($ === "later") {
          const a = [...g.value.messages, ...e.messages];
          e.start = g.value.start + Math.max(0, a.length - 60), e.messages = a.slice(-60);
        }
        await F(e, $ === "latest");
      } catch (q) {
        R === y && f("error", q instanceof Error ? q.message : String(q));
      } finally {
        R === y && (_.value = !1);
      }
    }
    function O($, R) {
      const D = g.value.messages[$ - g.value.start];
      D && (k.value?.index === $ ? k.value.content = R : k.value = {
        index: $,
        content: R,
        original: D.content,
        ts: D.ts,
        revision: g.value.revision
      });
    }
    return se(() => l.page, ($) => {
      y++, _.value = !1, F($, $.sessionId !== g.value.sessionId || p.value);
    }, { immediate: !0 }), se(() => l.sessionId, () => {
      k.value = null, p.value = !0;
    }), se(() => l.generation.text, async () => {
      p.value && (await Me(), t.value && (t.value.scrollTop = t.value.scrollHeight));
    }), ($, R) => (I(), H("section", {
      ref_key: "viewport",
      ref: t,
      class: "fourth-wall-conversation",
      "aria-live": "polite",
      onScrollPassive: U
    }, [
      g.value.start > 0 ? (I(), H("button", {
        key: 0,
        type: "button",
        class: "fourth-wall-earlier",
        disabled: _.value,
        onClick: R[0] || (R[0] = (D) => W("earlier"))
      }, V(_.value ? "读取中…" : "查看更早的记录"), 9, Pa)) : K("", !0),
      g.value.total === 0 && u.generation.status === "idle" ? (I(), H("div", Ma, [...R[6] || (R[6] = [
        v("span", null, "IV", -1),
        v("strong", null, "越过故事边界", -1),
        v("p", null, "这里是你与角色扮演者的皮下私聊。", -1)
      ])])) : K("", !0),
      (I(!0), H(le, null, He(g.value.messages, (D, q) => (I(), ne(Ca, {
        key: D.ts + "-" + (g.value.start + q),
        message: D,
        "message-index": g.value.start + q,
        "chat-identity": u.chatIdentity,
        "session-id": u.sessionId,
        "user-avatar": u.userAvatar,
        "character-avatar": u.characterAvatar,
        "image-available": u.imageAvailable,
        "voice-available": u.voiceAvailable,
        bridge: u.bridge,
        editable: !u.busy,
        "edit-draft": k.value?.index === g.value.start + q && k.value.ts === D.ts ? k.value.content : void 0,
        onDraft: (e) => O(g.value.start + q, e),
        onEditCancel: R[1] || (R[1] = (e) => k.value = null),
        onEdit: R[2] || (R[2] = (e, a) => f("edit", e, a, k.value?.revision ?? g.value.revision)),
        onDelete: R[3] || (R[3] = (e) => f("delete", e))
      }, null, 8, [
        "message",
        "message-index",
        "chat-identity",
        "session-id",
        "user-avatar",
        "character-avatar",
        "image-available",
        "voice-available",
        "bridge",
        "editable",
        "edit-draft",
        "onDraft"
      ]))), 128)),
      g.value.start + g.value.messages.length < g.value.total ? (I(), H("button", {
        key: 2,
        type: "button",
        class: "fourth-wall-earlier",
        disabled: _.value,
        onClick: R[4] || (R[4] = (D) => W("later"))
      }, " 查看后面的记录 ", 8, za)) : K("", !0),
      u.generation.status !== "idle" && p.value ? (I(), H("article", $a, [u.characterAvatar ? (I(), H("img", {
        key: 0,
        class: "fourth-wall-avatar",
        src: u.characterAvatar,
        alt: ""
      }, null, 8, ja)) : (I(), H("span", Ea)), v("div", Aa, [u.generation.thinking ? (I(), H("details", Ta, [R[7] || (R[7] = v("summary", null, "思考中", -1)), v("div", null, V(u.generation.thinking), 1)])) : K("", !0), v("div", La, [u.generation.text ? (I(), ne(Re(Ue), {
        key: 0,
        content: h.value
      }, null, 8, ["content"])) : (I(), H(le, { key: 1 }, [x(V(u.generation.status === "error" ? u.generation.message : z[u.generation.phase || "replying"]), 1)], 64)), u.generation.unsaved ? (I(), H("small", Ia, "未保存")) : K("", !0)])])])) : K("", !0),
      p.value ? K("", !0) : (I(), H("button", {
        key: 4,
        type: "button",
        class: "fourth-wall-latest",
        disabled: _.value,
        onClick: R[5] || (R[5] = (D) => W("latest"))
      }, "回到最新 ↓", 8, Ba))
    ], 544));
  }
}), Ra = Ha, Fa = {
  class: "fourth-wall-modal",
  role: "dialog",
  "aria-label": "四次元壁提示词"
}, Da = { class: "fourth-wall-prompt-fields" }, Oa = /* @__PURE__ */ te({
  __name: "FourthWallPromptEditor",
  props: { templates: {} },
  emits: [
    "close",
    "save",
    "restore"
  ],
  setup(u, { emit: d }) {
    const l = u, f = d, t = ce(structuredClone(ee(l.templates))), g = G(null);
    Oe(g, () => f("close"));
    function h() {
      f("save", structuredClone(ee(t)));
    }
    return (_, p) => (I(), H("div", {
      ref_key: "layer",
      ref: g,
      class: "fourth-wall-modal-backdrop",
      onClick: p[6] || (p[6] = Qe((k) => f("close"), ["self"]))
    }, [v("section", Fa, [
      v("header", null, [p[7] || (p[7] = v("strong", null, "提示词模板", -1)), v("button", {
        type: "button",
        onClick: p[0] || (p[0] = (k) => f("close"))
      }, "关闭")]),
      v("div", Da, [
        v("label", null, [p[8] || (p[8] = x("Top User", -1)), Q(v("textarea", {
          "onUpdate:modelValue": p[1] || (p[1] = (k) => t.topuser = k),
          rows: "5"
        }, null, 512), [[ae, t.topuser]])]),
        v("label", null, [p[9] || (p[9] = x("Confirm", -1)), Q(v("textarea", {
          "onUpdate:modelValue": p[2] || (p[2] = (k) => t.confirm = k),
          rows: "3"
        }, null, 512), [[ae, t.confirm]])]),
        v("label", null, [p[10] || (p[10] = x("Meta Protocol", -1)), Q(v("textarea", {
          "onUpdate:modelValue": p[3] || (p[3] = (k) => t.metaProtocol = k),
          rows: "12"
        }, null, 512), [[ae, t.metaProtocol]])]),
        v("label", null, [p[11] || (p[11] = x("Bottom", -1)), Q(v("textarea", {
          "onUpdate:modelValue": p[4] || (p[4] = (k) => t.bottom = k),
          rows: "5"
        }, null, 512), [[ae, t.bottom]])])
      ]),
      v("footer", null, [v("button", {
        type: "button",
        class: "is-danger",
        onClick: p[5] || (p[5] = (k) => f("restore"))
      }, "恢复默认"), v("button", {
        type: "button",
        class: "is-primary",
        onClick: h
      }, "保存")])
    ])], 512));
  }
}), qa = Oa, Na = { class: "fourth-wall-settings-section" }, Ua = { class: "fourth-wall-session-row" }, Wa = ["value", "disabled"], Va = ["value"], Ga = ["disabled"], Ka = ["disabled"], Za = ["disabled"], Xa = /* @__PURE__ */ te({
  __name: "FourthWallSessions",
  props: {
    sessions: {},
    activeSessionId: {},
    disabled: { type: Boolean }
  },
  emits: [
    "switch",
    "add",
    "rename",
    "delete"
  ],
  setup(u, { emit: d }) {
    const l = d;
    function f() {
      const h = window.prompt("新记录名称", "新记录")?.trim();
      h && l("add", h);
    }
    function t(h, _) {
      const p = window.prompt("重命名记录", _)?.trim();
      p && l("rename", h, p);
    }
    function g(h) {
      window.confirm("确定删除当前记录及其皮下记忆吗？") && l("delete", h);
    }
    return (h, _) => (I(), H("section", Na, [_[3] || (_[3] = v("h3", null, "聊天记录", -1)), v("div", Ua, [
      v("select", {
        value: u.activeSessionId,
        disabled: u.disabled,
        onChange: _[0] || (_[0] = (p) => l("switch", p.target.value))
      }, [(I(!0), H(le, null, He(u.sessions, (p) => (I(), H("option", {
        key: p.id,
        value: p.id
      }, V(p.name), 9, Va))), 128))], 40, Wa),
      v("button", {
        type: "button",
        disabled: u.disabled,
        title: "新建记录",
        onClick: f
      }, "＋", 8, Ga),
      v("button", {
        type: "button",
        disabled: u.disabled,
        title: "重命名记录",
        onClick: _[1] || (_[1] = (p) => t(u.activeSessionId, u.sessions.find((k) => k.id === u.activeSessionId)?.name || ""))
      }, " 改 ", 8, Ka),
      v("button", {
        type: "button",
        disabled: u.disabled || u.sessions.length <= 1,
        title: "删除记录",
        class: "is-danger",
        onClick: _[2] || (_[2] = (p) => g(u.activeSessionId))
      }, " 删 ", 8, Za)
    ])]));
  }
}), Qa = Xa, Ja = { class: "fourth-wall-settings-scroll" }, Ya = { class: "fourth-wall-settings-section" }, xa = { class: "is-toggle" }, et = { class: "is-toggle" }, rt = ["disabled"], at = { class: "fourth-wall-settings-section" }, tt = { class: "is-toggle" }, nt = { class: "is-toggle" }, st = { class: "is-toggle" }, it = { key: 0 }, ot = ["disabled"], lt = { class: "fourth-wall-settings-section is-actions" }, ut = /* @__PURE__ */ te({
  __name: "FourthWallSettings",
  props: {
    chat: {},
    global: {},
    busy: { type: Boolean }
  },
  emits: [
    "close",
    "updateChat",
    "updateGlobal",
    "switchSession",
    "addSession",
    "renameSession",
    "deleteSession",
    "openPrompts"
  ],
  setup(u, { emit: d }) {
    const l = u, f = d, t = ce(structuredClone(ee(l.chat.settings))), g = G(null);
    Oe(g, () => f("close"));
    const h = ce(structuredClone(ee(l.global)));
    function _() {
      f("updateChat", structuredClone(ee(t)));
    }
    function p() {
      f("updateGlobal", {
        image: structuredClone(ee(h.image)),
        voice: structuredClone(ee(h.voice)),
        commentary: structuredClone(ee(h.commentary))
      });
    }
    return (k, y) => (I(), H("aside", {
      ref_key: "layer",
      ref: g,
      class: "fourth-wall-settings",
      "aria-label": "四次元壁设置"
    }, [v("header", null, [y[13] || (y[13] = v("strong", null, "四次元壁设置", -1)), v("button", {
      type: "button",
      onClick: y[0] || (y[0] = (z) => f("close"))
    }, "关闭")]), v("div", Ja, [
      we(Qa, {
        sessions: u.chat.sessions,
        "active-session-id": u.chat.activeSessionId,
        disabled: u.busy,
        onSwitch: y[1] || (y[1] = (z) => f("switchSession", z)),
        onAdd: y[2] || (y[2] = (z) => f("addSession", z)),
        onRename: y[3] || (y[3] = (z, B) => f("renameSession", z, B)),
        onDelete: y[4] || (y[4] = (z) => f("deleteSession", z))
      }, null, 8, [
        "sessions",
        "active-session-id",
        "disabled"
      ]),
      v("section", Ya, [
        y[17] || (y[17] = v("h3", null, "上下文", -1)),
        v("label", null, [y[14] || (y[14] = x("普通聊天层数", -1)), Q(v("input", {
          "onUpdate:modelValue": y[5] || (y[5] = (z) => t.maxChatLayers = z),
          type: "number",
          min: "1",
          max: "9999"
        }, null, 512), [[
          ae,
          t.maxChatLayers,
          void 0,
          { number: !0 }
        ]])]),
        v("label", xa, [y[15] || (y[15] = v("span", null, "流式生成", -1)), Q(v("input", {
          "onUpdate:modelValue": y[6] || (y[6] = (z) => t.stream = z),
          type: "checkbox"
        }, null, 512), [[ie, t.stream]])]),
        v("label", et, [y[16] || (y[16] = v("span", null, "禁用 Assistant Prefill", -1)), Q(v("input", {
          "onUpdate:modelValue": y[7] || (y[7] = (z) => t.disableAssistantPrefill = z),
          type: "checkbox"
        }, null, 512), [[ie, t.disableAssistantPrefill]])]),
        v("button", {
          type: "button",
          class: "is-primary",
          disabled: u.busy,
          onClick: _
        }, "保存上下文设置", 8, rt)
      ]),
      v("section", at, [
        y[21] || (y[21] = v("h3", null, "能力", -1)),
        v("label", tt, [y[18] || (y[18] = v("span", null, "在提示词中允许图片", -1)), Q(v("input", {
          "onUpdate:modelValue": y[8] || (y[8] = (z) => h.image.enablePrompt = z),
          type: "checkbox"
        }, null, 512), [[ie, h.image.enablePrompt]])]),
        v("label", nt, [y[19] || (y[19] = v("span", null, "在提示词中允许语音", -1)), Q(v("input", {
          "onUpdate:modelValue": y[9] || (y[9] = (z) => h.voice.enabled = z),
          type: "checkbox"
        }, null, 512), [[ie, h.voice.enabled]])]),
        v("label", st, [y[20] || (y[20] = v("span", null, "实时吐槽", -1)), Q(v("input", {
          "onUpdate:modelValue": y[10] || (y[10] = (z) => h.commentary.enabled = z),
          type: "checkbox"
        }, null, 512), [[ie, h.commentary.enabled]])]),
        h.commentary.enabled ? (I(), H("label", it, [x(" 吐槽概率 " + V(h.commentary.probability) + "% ", 1), Q(v("input", {
          "onUpdate:modelValue": y[11] || (y[11] = (z) => h.commentary.probability = z),
          type: "range",
          min: "1",
          max: "99"
        }, null, 512), [[
          ae,
          h.commentary.probability,
          void 0,
          { number: !0 }
        ]])])) : K("", !0),
        v("button", {
          type: "button",
          class: "is-primary",
          disabled: u.busy,
          onClick: p
        }, "保存能力设置", 8, ot)
      ]),
      v("section", lt, [v("button", {
        type: "button",
        onClick: y[12] || (y[12] = (z) => f("openPrompts"))
      }, "提示词模板")])
    ])], 512));
  }
}), ct = ut, dt = { class: "fourth-wall-app" }, ft = { class: "fourth-wall-header" }, ht = { class: "fourth-wall-heading" }, mt = { class: "fourth-wall-header-actions" }, pt = ["disabled"], gt = ["disabled"], vt = {
  key: 0,
  class: "fourth-wall-error",
  role: "alert"
}, _t = ["disabled"], wt = { class: "fourth-wall-composer" }, bt = ["disabled"], kt = ["disabled"], yt = ["disabled"], St = { class: "fourth-wall-clear-choice" }, Ct = {
  key: 0,
  class: "fourth-wall-dialog-error",
  role: "alert"
}, Pt = ["disabled"], Mt = ["disabled"], ue = 35e3, zt = /* @__PURE__ */ te({
  __name: "FourthWallApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(u) {
    const d = u, l = G(structuredClone(ee(d.initialState))), f = G(""), t = G(!1), g = G(!1), h = G(!1), _ = G(""), p = G(!1), k = G(!1), y = G(!1), z = G(!1), B = G(""), F = G(0), U = G(!1), W = G(0);
    let O;
    const $ = G({
      status: "idle",
      sessionId: "",
      text: "",
      thinking: "",
      message: "",
      unsaved: !1
    });
    let R = () => {
    };
    const D = re(() => l.value.chat.sessions.find((E) => E.id === l.value.chat.activeSessionId)), q = re(() => $.value.status === "started" || $.value.status === "progress"), e = re(() => ({
      ...l.value.context,
      usedTokens: l.value.context.usedTokens + W.value,
      promptTokens: l.value.context.promptTokens + W.value
    }));
    se(() => [f.value, $.value.text], () => {
      O || (O = setTimeout(() => {
        W.value = ve(f.value) + ve($.value.text), O = void 0;
      }, 200));
    }), se(() => D.value.id, () => {
      z.value = !1, k.value = !1, U.value = !1, f.value = "", $.value = {
        status: "idle",
        sessionId: "",
        text: "",
        thinking: "",
        message: "",
        unsaved: !1
      };
    });
    function a(E = D.value.id) {
      return {
        chatIdentity: l.value.chatIdentity,
        sessionId: E
      };
    }
    function r(E) {
      return structuredClone(E.result);
    }
    async function n(E, w) {
      h.value = !0, _.value = "";
      try {
        return l.value = r(await d.bridge.request(E, w, ue)), !0;
      } catch (L) {
        return _.value = L instanceof Error ? L.message : String(L), !1;
      } finally {
        h.value = !1;
      }
    }
    async function i() {
      const E = f.value.trim();
      if (!(!E || q.value || h.value)) {
        f.value = "", _.value = "", U.value = !1, $.value = {
          status: "started",
          sessionId: D.value.id,
          text: "",
          thinking: "",
          message: "",
          unsaved: !1
        };
        try {
          await d.bridge.request("fourth-wall/send", {
            ...a(),
            content: E
          }, ue);
        } catch (w) {
          _.value = `发送请求未确认：${w instanceof Error ? w.message : String(w)}。请核对聊天记录后再发送。原输入：${E}`, $.value.status = "idle";
        }
      }
    }
    async function c() {
      if (!(q.value || h.value)) {
        _.value = "", U.value = !1, $.value = {
          status: "started",
          sessionId: D.value.id,
          text: "",
          thinking: "",
          message: "",
          unsaved: !1
        };
        try {
          await d.bridge.request("fourth-wall/regenerate", a(), ue);
        } catch (E) {
          _.value = E instanceof Error ? E.message : String(E), $.value.status = "idle";
        }
      }
    }
    function s() {
      d.bridge.post("fourth-wall/cancel", a());
    }
    function m(E) {
      E && (f.value ? _.value += `
未保存的原输入：${E}` : f.value = E);
    }
    function M(E) {
      E.key !== "Enter" || E.shiftKey || p.value || (E.preventDefault(), q.value ? s() : i());
    }
    function P(E) {
      const w = E < D.value.archivedCount ? `这条消息已经归档；删除原文不会修改记忆，需要遗忘的内容请在记忆中删除。
` : "";
      window.confirm(`${w}确定删除这条消息吗？`) && n("fourth-wall/delete-message", {
        ...a(),
        revision: l.value.history.revision,
        messageIndex: E
      });
    }
    function S() {
      y.value = !1, k.value = !0;
    }
    async function C() {
      await n("fourth-wall/clear-history", {
        ...a(),
        clearMemory: y.value
      }) && (k.value = !1);
    }
    async function o(E, w, L) {
      E < D.value.archivedCount && !window.confirm("这条消息已经归档，修改原文不会改写记忆；需要同步更正时请编辑记忆。继续修改？") || await n("fourth-wall/edit-message", {
        ...a(),
        revision: L,
        messageIndex: E,
        content: w
      });
    }
    async function b(E) {
      if (!(q.value || h.value)) {
        _.value = "", U.value = !1, $.value = {
          status: "started",
          sessionId: D.value.id,
          text: "",
          thinking: "",
          message: "",
          unsaved: !1,
          phase: "counting",
          manual: E === "summarize"
        };
        try {
          await d.bridge.request(`fourth-wall/${E}`, a(), ue);
        } catch (w) {
          $.value.status = "idle", _.value = String(w instanceof Error ? w.message : w);
        }
      }
    }
    async function j() {
      if (h.value || q.value) return;
      h.value = !0, _.value = "";
      const E = a(), w = l.value.history.revision;
      try {
        const L = await d.bridge.request("fourth-wall/read-memory", {
          ...E,
          revision: w
        });
        if (E.sessionId !== D.value.id || E.chatIdentity !== l.value.chatIdentity) return;
        B.value = L.result.content, F.value = w, z.value = !0;
      } catch (L) {
        _.value = L instanceof Error ? L.message : String(L);
      } finally {
        h.value = !1;
      }
    }
    async function T(E) {
      await n("fourth-wall/save-memory", {
        ...a(),
        revision: F.value,
        expectedContent: B.value,
        content: E
      }) && (z.value = !1);
    }
    function N(E) {
      n("fourth-wall/update-chat-settings", {
        ...a(),
        patch: E
      });
    }
    function A(E) {
      n("fourth-wall/update-global-settings", {
        ...a(),
        patch: E
      });
    }
    return Fe(() => {
      R = d.bridge.subscribe((E) => {
        if (E.type === "fourth-wall/state" && (l.value = structuredClone(E.payload.state)), E.type !== "fourth-wall/generation") return;
        const w = E.payload;
        if (!(w.sessionId && w.sessionId !== D.value.id)) {
          if (w.status === "complete" || w.status === "cancelled") {
            w.status === "cancelled" && (w.message && (_.value = w.message), m(w.inputDraft)), W.value = ve(f.value), $.value = {
              status: "idle",
              sessionId: "",
              text: "",
              thinking: "",
              message: "",
              unsaved: !1
            };
            return;
          }
          if (w.status === "error") {
            _.value = w.message || "生成失败", U.value = !w.manual && w.kind !== "save" && w.kind !== "input-save", m(w.inputDraft), $.value = w.kind === "save" && (w.draft?.text || w.draft?.thinking) ? {
              status: "error",
              sessionId: w.sessionId || D.value.id,
              text: w.draft?.text || "",
              thinking: w.draft?.thinking || "",
              message: "",
              unsaved: !0
            } : {
              status: "idle",
              sessionId: "",
              text: "",
              thinking: "",
              message: "",
              unsaved: !1
            };
            return;
          }
          $.value = {
            status: w.status || "progress",
            sessionId: w.sessionId || D.value.id,
            text: w.text || $.value.text,
            thinking: w.thinking || $.value.thinking,
            message: "",
            unsaved: !1,
            phase: w.phase || $.value.phase,
            manual: w.manual ?? $.value.manual
          };
        }
      });
    }), Be(() => {
      R(), clearTimeout(O);
    }), (E, w) => (I(), H("main", dt, [
      v("header", ft, [v("div", ht, [w[23] || (w[23] = v("span", null, "IV", -1)), v("div", null, [w[22] || (w[22] = v("strong", null, "四次元壁", -1)), v("small", null, V(D.value.name), 1)])]), v("div", mt, [
        we(fr, {
          stats: e.value,
          busy: q.value,
          phase: $.value.phase,
          onSummarize: w[0] || (w[0] = (L) => b("summarize")),
          onCancel: s
        }, null, 8, [
          "stats",
          "busy",
          "phase"
        ]),
        v("button", {
          type: "button",
          title: "皮下记忆",
          "aria-label": "皮下记忆",
          disabled: h.value || q.value,
          onClick: j
        }, [...w[24] || (w[24] = [v("svg", {
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, [v("path", { d: "M12 5c-3-2-7-2-9-1v15c3-1 6-1 9 1m0-15c3-2 7-2 9-1v15c-3-1-6-1-9 1V5Z" })], -1)])], 8, pt),
        v("button", {
          type: "button",
          title: "清空当前记录",
          "aria-label": "清空当前记录",
          disabled: h.value,
          onClick: S
        }, [...w[25] || (w[25] = [v("svg", {
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, [v("path", { d: "M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5" })], -1)])], 8, gt),
        v("button", {
          type: "button",
          title: "设置",
          onClick: w[1] || (w[1] = (L) => t.value = !0)
        }, "⚙")
      ])]),
      _.value ? (I(), H("div", vt, [
        v("span", null, V(_.value), 1),
        U.value ? (I(), H("button", {
          key: 0,
          type: "button",
          disabled: q.value || h.value,
          onClick: w[2] || (w[2] = (L) => b("retry"))
        }, "重试回复", 8, _t)) : K("", !0),
        v("button", {
          type: "button",
          "aria-label": "关闭错误提示",
          onClick: w[3] || (w[3] = (L) => _.value = "")
        }, "×")
      ])) : K("", !0),
      we(Ra, {
        page: l.value.history,
        busy: h.value || q.value,
        "session-id": D.value.id,
        "chat-identity": l.value.chatIdentity,
        "user-avatar": l.value.userAvatar,
        "character-avatar": l.value.characterAvatar,
        "image-available": l.value.capabilities.image.available,
        "voice-available": l.value.capabilities.voice.available,
        generation: $.value,
        bridge: u.bridge,
        onEdit: o,
        onDelete: P,
        onError: w[4] || (w[4] = (L) => _.value = L)
      }, null, 8, [
        "page",
        "busy",
        "session-id",
        "chat-identity",
        "user-avatar",
        "character-avatar",
        "image-available",
        "voice-available",
        "generation",
        "bridge"
      ]),
      v("footer", wt, [
        v("button", {
          type: "button",
          class: "fourth-wall-regenerate",
          title: "重答",
          "aria-label": "重答",
          disabled: h.value || q.value,
          onClick: c
        }, " ↻ ", 8, bt),
        Q(v("textarea", {
          "onUpdate:modelValue": w[5] || (w[5] = (L) => f.value = L),
          rows: "1",
          placeholder: "聊点什么...",
          disabled: h.value,
          onCompositionstart: w[6] || (w[6] = (L) => p.value = !0),
          onCompositionend: w[7] || (w[7] = (L) => p.value = !1),
          onKeydown: M
        }, null, 40, kt), [[ae, f.value]]),
        v("button", {
          type: "button",
          class: ye({ "is-stop": q.value }),
          disabled: h.value,
          onClick: w[8] || (w[8] = (L) => q.value ? s() : i())
        }, V(q.value ? "■" : "↑"), 11, yt)
      ]),
      t.value ? (I(), ne(ct, {
        key: 1,
        chat: l.value.chat,
        global: l.value.global,
        busy: h.value || q.value,
        onClose: w[9] || (w[9] = (L) => t.value = !1),
        onUpdateChat: N,
        onUpdateGlobal: A,
        onSwitchSession: w[10] || (w[10] = (L) => n("fourth-wall/switch-session", {
          ...a(),
          targetSessionId: L
        })),
        onAddSession: w[11] || (w[11] = (L) => n("fourth-wall/add-session", {
          ...a(),
          name: L
        })),
        onRenameSession: w[12] || (w[12] = (L, Z) => n("fourth-wall/rename-session", {
          ...a(L),
          name: Z
        })),
        onDeleteSession: w[13] || (w[13] = (L) => n("fourth-wall/delete-session", a(L))),
        onOpenPrompts: w[14] || (w[14] = (L) => g.value = !0)
      }, null, 8, [
        "chat",
        "global",
        "busy"
      ])) : K("", !0),
      g.value ? (I(), ne(qa, {
        key: 2,
        templates: l.value.global.promptTemplates,
        onClose: w[15] || (w[15] = (L) => g.value = !1),
        onSave: w[16] || (w[16] = (L) => {
          A({ promptTemplates: L }), g.value = !1;
        }),
        onRestore: w[17] || (w[17] = () => {
          n("fourth-wall/restore-prompts", a()), g.value = !1;
        })
      }, null, 8, ["templates"])) : K("", !0),
      z.value ? (I(), ne(wr, {
        key: 3,
        content: B.value,
        busy: h.value,
        error: _.value,
        onClose: w[18] || (w[18] = (L) => z.value = !1),
        onSave: T
      }, null, 8, [
        "content",
        "busy",
        "error"
      ])) : K("", !0),
      k.value ? (I(), ne(qe, {
        key: 4,
        class: "fourth-wall-dialog",
        "aria-label": "清空皮下聊天",
        busy: h.value,
        onClose: w[21] || (w[21] = (L) => k.value = !1)
      }, {
        default: ke(() => [
          w[27] || (w[27] = v("header", null, [v("strong", null, "清空皮下聊天？")], -1)),
          w[28] || (w[28] = v("p", null, "当前聊天原文将被删除，默认保留皮下记忆。", -1)),
          v("label", St, [Q(v("input", {
            "onUpdate:modelValue": w[19] || (w[19] = (L) => y.value = L),
            type: "checkbox"
          }, null, 512), [[ie, y.value]]), w[26] || (w[26] = x("同时清空皮下记忆", -1))]),
          _.value ? (I(), H("p", Ct, V(_.value), 1)) : K("", !0),
          v("footer", null, [v("button", {
            type: "button",
            disabled: h.value,
            onClick: w[20] || (w[20] = (L) => k.value = !1)
          }, "取消", 8, Pt), v("button", {
            type: "button",
            class: "is-danger",
            disabled: h.value,
            onClick: C
          }, "清空聊天", 8, Mt)])
        ]),
        _: 1
      }, 8, ["busy"])) : K("", !0)
    ]));
  }
}), Tt = zt;
export {
  Tt as default
};
