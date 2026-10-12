/* eslint-disable */
import { n as d, r as m } from "./xiaobai-os-message-markdown-C9E8FiNZ.js";
import { D as f, S as p, V as h, X as b, rt as k } from "./xiaobai-os-app-navigation-DvMnPkC0.js";
var _ = /* @__PURE__ */ f({
  __name: "MessageMarkdown",
  props: { text: {} },
  setup(c) {
    const a = c, r = k(null), l = /* @__PURE__ */ new Set([
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
    ]), i = /* @__PURE__ */ new Set([
      "script",
      "style",
      "custom-style",
      "iframe",
      "object",
      "embed",
      "svg",
      "math"
    ]);
    return b([r, () => a.text], () => {
      if (!r.value) return;
      const t = document.createElement("template");
      t.innerHTML = m(a.text, { htmlFenceMode: "code" });
      for (const e of t.content.querySelectorAll("*")) {
        const o = e.localName;
        if (i.has(o)) {
          e.remove();
          continue;
        }
        if (o === "img") {
          e.replaceWith(document.createTextNode(e.getAttribute("alt") ?? ""));
          continue;
        }
        if (!l.has(o)) {
          e.replaceWith(...e.childNodes);
          continue;
        }
        const s = e.getAttribute("href") ?? "", n = e.getAttribute("start") ?? "";
        for (const u of [...e.attributes]) e.removeAttribute(u.name);
        o === "a" && /^(?:https?:\/\/|mailto:)/i.test(s) && (e.setAttribute("href", s), e.setAttribute("target", "_blank"), e.setAttribute("rel", "noopener noreferrer")), o === "ol" && /^\d+$/.test(n) && e.setAttribute("start", n);
      }
      d(t.content, {
        codeBlockClassName: "os-markdown-codeblock",
        codeCopyClassName: "os-markdown-code-copy"
      }), r.value.replaceChildren(t.content);
    }, { flush: "post" }), (t, e) => (h(), p("div", {
      ref_key: "surface",
      ref: r,
      class: "os-message-markdown"
    }, null, 512));
  }
}), v = _;
export {
  v as t
};
