var l=new WeakMap,a=new Map,m=!1;function f(){if(m)return;m=!0;const e=document.createElement("style");e.id="xb-msg-toolbar-styles",e.textContent=`
.xb-msg-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 8px 0;
    min-height: 34px;
    flex-wrap: wrap;
    position: relative;
    z-index: 200 !important;
}

/* 展开绘图菜单/详情时解除 mes_block 的裁切，否则弹出层被 overflow:hidden 剪掉 */
.mes_block:has(.xb-msg-toolbar .expanded),
.mes_block:has(.xb-msg-toolbar .show-detail) {
    overflow: visible;
}

.xb-msg-toolbar:empty {
    display: none;
}

.xb-msg-toolbar-left {
    display: flex;
    align-items: center;
    gap: 8px;
}

.xb-msg-toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
}

.xb-msg-toolbar-left:empty {
    display: none;
}

.xb-msg-toolbar-right:empty {
    display: none;
}
`,document.head.appendChild(e)}function d(e){return document.querySelector(`.mes[mesid="${e}"]`)}function p(e){if(!e)return null;if(l.has(e)){const i=l.get(e);if(i.isConnected)return i;l.delete(e)}f();const t=e.querySelector(".mes_block > .ch_name")||e.querySelector(".name_text")?.parentElement;if(!t)return null;let o=t.parentNode.querySelector(":scope > .xb-msg-toolbar");if(o)return l.set(e,o),u(o),o;o=document.createElement("div"),o.className="xb-msg-toolbar";const r=document.createElement("div");r.className="xb-msg-toolbar-left";const n=document.createElement("div");return n.className="xb-msg-toolbar-right",o.appendChild(r),o.appendChild(n),t.parentNode.insertBefore(o,t.nextSibling),l.set(e,o),o}function u(e){if(!e.querySelector(".xb-msg-toolbar-left")){const t=document.createElement("div");t.className="xb-msg-toolbar-left",e.insertBefore(t,e.firstChild)}if(!e.querySelector(".xb-msg-toolbar-right")){const t=document.createElement("div");t.className="xb-msg-toolbar-right",e.appendChild(t)}}function x(e,t,o={}){const{position:r="left",id:n}=o,i=d(e);if(!i)return!1;const s=p(i);if(!s)return!1;if(n){t.dataset.toolbarId=n;const b=s.querySelector(`[data-toolbar-id="${n}"]`);b&&b!==t&&b.remove()}const c=r==="right"?s.querySelector(".xb-msg-toolbar-right"):s.querySelector(".xb-msg-toolbar-left");return c&&!c.contains(t)&&c.appendChild(t),a.has(e)||a.set(e,new Map),n&&a.get(e).set(n,t),!0}function h(e,t){if(!t)return;const o=t.dataset?.toolbarId;t.remove();const r=a.get(e);r&&o&&(r.delete(o),r.size===0&&a.delete(e)),g(e)}function g(e){const t=d(e);if(!t)return;const o=l.get(t);if(!o)return;const r=o.querySelector(".xb-msg-toolbar-left"),n=o.querySelector(".xb-msg-toolbar-right");(!r||r.children.length===0)&&(!n||n.children.length===0)&&(o.remove(),l.delete(t))}export{h as n,x as t};
