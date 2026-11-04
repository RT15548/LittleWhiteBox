import{n as C}from"./async-errors-C4kfchr9.js";import{ut as te}from"./gallery-cache-Dq4zRh98.js";import{B as He,H as ke,V as z,ct as Qe,d as Te,in as Xe,lt as Ke,n as ce,t as Je,z as ue}from"./message-toolbar-Bs4CyevN.js";import{o as Ee}from"./panel-escape-ymarUWxh.js";import{gt as Se,mt as v,vt as I,yt as Ze}from"./draw-common-DlZJvGJ0.js";import{a as Ie,i as H,l as Le,o as ie,s as w,t as Re,u as Ne}from"./novel-draw-_MbmR82u.js";import{a as et,c as Ae,d as tt,f as nt,i as be,l as Pe,m as ot,o as rt,p as pe,r as De,s as we,t as Fe,u as at}from"./draw-run-ui-state-CgVERtQP.js";import{getContext as A}from"../../../../../../scripts/extensions.js";var Oe="xb_novel_float_pos",B=8e3,it="novelai",a={IDLE:"idle",SUBMITTING:"submitting",ACCEPTED:"accepted",UNCERTAIN:"uncertain",QUEUED:"queued",LLM:"llm",GEN:"gen",COOLDOWN:"cooldown",RECONNECTING:"reconnecting",CANCELLING:"cancelling",BACKEND_LEGACY:"backend_legacy",SUCCESS:"success",PARTIAL:"partial",ERROR:"error"},st=[{value:"default",label:"跟随预设",width:null,height:null},{value:"auto",label:"AI 自动（按构图）",width:null,height:null},{value:"832x1216",label:"832 × 1216  竖图",width:832,height:1216},{value:"1216x832",label:"1216 × 832  横图",width:1216,height:832},{value:"1024x1024",label:"1024 × 1024  方图",width:1024,height:1024},{value:"768x1280",label:"768 x 1280  大竖",width:768,height:1280},{value:"1280x768",label:"1280 x 768  大横",width:1280,height:768}],p=new Map,W=new Map,L=null,i=null,m=null,h=a.IDLE,$=null,f={success:0,total:0,error:null,startTime:0},S=null,X=null,J=0,g={},ye=!1,se=null,ze=74,$e=98,lt=`

/* ═══════════════════════════════════════════════════════════════════════════
   楼层按钮样式
   ═══════════════════════════════════════════════════════════════════════════ */
.nd-float.nd-novel {
    position: relative;
    user-select: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.nd-novel .nd-capsule{
    box-sizing: border-box;
    width: ${ze}px;
    height: var(--nd-h);
    background: var(--nd-bg);
    border: 1px solid var(--nd-border);
    border-radius: 17px;
    position: relative;
    overflow: hidden;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.nd-float.nd-novel:hover .nd-capsule {
    background: var(--nd-bg-hover);
    border-color: var(--nd-border-hover);
}

.nd-float.nd-novel.working .nd-capsule { border-color: var(--nd-warning); }
.nd-float.nd-novel.cooldown .nd-capsule { border-color: var(--nd-info); background: color-mix(in srgb, var(--nd-info) 10%, var(--nd-bg)); }
.nd-float.nd-novel.success .nd-capsule { border-color: var(--nd-success); background: color-mix(in srgb, var(--nd-success) 10%, var(--nd-bg)); }
.nd-float.nd-novel.partial .nd-capsule { border-color: var(--nd-warning); background: color-mix(in srgb, var(--nd-warning) 10%, var(--nd-bg)); }
.nd-float.nd-novel.error .nd-capsule { border-color: var(--nd-error); background: color-mix(in srgb, var(--nd-error) 10%, var(--nd-bg)); }

/* 非空闲状态：胶囊右侧多出 24px，放常驻菜单按钮（生成中也能打开菜单/设置） */
.nd-float.nd-novel.working .nd-capsule,
.nd-float.nd-novel.cooldown .nd-capsule,
.nd-float.nd-novel.success .nd-capsule,
.nd-float.nd-novel.partial .nd-capsule,
.nd-float.nd-novel.error .nd-capsule { width: ${$e}px; }

.nd-novel .nd-inner{
    display: grid;
    width: 100%;
    height: 100%;
    grid-template-areas: "s";
    grid-template-rows: minmax(0, 1fr);
    grid-template-columns: minmax(0, 1fr);
    pointer-events: none;
}

.nd-novel .nd-layer{
    grid-area: s;
    min-width: 0;
    min-height: 0;
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    transition: opacity 0.2s, transform 0.2s;
    pointer-events: auto;
}

.nd-novel .nd-layer-idle{ opacity: 1; visibility: visible; transform: translateY(0); }

.nd-float.nd-novel.working .nd-layer-idle,
.nd-float.nd-novel.cooldown .nd-layer-idle,
.nd-float.nd-novel.success .nd-layer-idle,
.nd-float.nd-novel.partial .nd-layer-idle,
.nd-float.nd-novel.error .nd-layer-idle {
    opacity: 0;
    visibility: hidden;
    transform: translateY(-100%);
    pointer-events: none;
}

.nd-novel .nd-btn-draw{
    flex: 1;
    height: 100%;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    color: var(--nd-text-primary);
    transition: background 0.15s;
    font-size: 16px;
}
.nd-novel .nd-btn-draw:hover { background: var(--nd-bg-active); }
.nd-novel .nd-btn-draw:active{ transform: scale(0.92); }

.nd-novel button { margin: 0; padding: 0; box-shadow: none; }
.nd-novel button:focus-visible { outline: 2px solid var(--nd-text-secondary); outline-offset: -3px; }
.nd-novel .nd-icon { display: block; width: 16px; height: 16px; flex-shrink: 0; pointer-events: none; }
.nd-novel .nd-arrow { display: flex; align-items: center; justify-content: center; }
.nd-novel .nd-arrow .nd-icon { width: 12px; height: 12px; }

.nd-novel .nd-auto-dot{
    position: absolute;
    top: 7px;
    right: 6px;
    width: 6px;
    height: 6px;
    background: var(--nd-success);
    border-radius: 50%;
    box-shadow: 0 0 6px var(--nd-success);
    opacity: 0;
    transform: scale(0);
    transition: all 0.2s;
}
.nd-float.nd-novel.auto-on .nd-auto-dot { opacity: 1; transform: scale(1); }

.nd-novel .nd-sep{ width: 1px; height: 12px; background: var(--nd-border); }

.nd-novel .nd-btn-menu {
    width: 24px;
    height: 100%;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--nd-text-secondary);
    font-size: 8px;
    opacity: 1;
    transition: opacity 0.25s, transform 0.25s;
}
.nd-float.nd-novel:hover .nd-btn-menu { opacity: 1; }
.nd-novel .nd-btn-menu:hover { background: var(--nd-bg-active); color: var(--nd-text-primary); }

/* 常驻菜单按钮：只在非空闲状态显示（空闲时由 idle 层自己的菜单按钮负责） */
.nd-novel .nd-btn-menu-persist {
    display: none;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 2;
    box-sizing: border-box;
    border-left: 1px solid var(--nd-border);
}
.nd-float.nd-novel.working .nd-btn-menu-persist,
.nd-float.nd-novel.cooldown .nd-btn-menu-persist,
.nd-float.nd-novel.success .nd-btn-menu-persist,
.nd-float.nd-novel.partial .nd-btn-menu-persist,
.nd-float.nd-novel.error .nd-btn-menu-persist { display: flex; }

.nd-novel .nd-arrow{ transition: transform 0.2s; }
.nd-float.nd-novel.expanded .nd-arrow { transform: rotate(180deg); }

.nd-novel .nd-layer-active {
    box-sizing: border-box;
    border: 0;
    background: transparent;
    padding: 0 6px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(100%);
    justify-content: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: var(--nd-text-primary);
    cursor: pointer;
    pointer-events: none;
    transition: opacity 0.2s, transform 0.2s, padding-right 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.nd-float.nd-novel.working .nd-layer-active,
.nd-float.nd-novel.cooldown .nd-layer-active,
.nd-float.nd-novel.success .nd-layer-active,
.nd-float.nd-novel.partial .nd-layer-active,
.nd-float.nd-novel.error .nd-layer-active {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    pointer-events: auto;
    padding-right: 30px; /* 原 6px + 常驻菜单按钮 24px，文字区宽度保持不变 */
}

.nd-float.nd-novel.cooldown .nd-layer-active { color: var(--nd-info); }
.nd-float.nd-novel.success .nd-layer-active { color: var(--nd-success); }
.nd-float.nd-novel.partial .nd-layer-active { color: var(--nd-warning); }
.nd-float.nd-novel.error .nd-layer-active { color: var(--nd-error); }

.nd-novel .nd-spin{ display: inline-block; animation: nd-spin 1.5s linear infinite; }
.nd-novel .nd-status-icon{ flex-shrink: 0; }
.nd-novel .nd-status-text{ min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
@keyframes nd-spin { to { transform: rotate(360deg); } }

.nd-novel .nd-countdown{ font-variant-numeric: tabular-nums; min-width: 36px; text-align: center; }

/* 详情弹窗 - 向下展开（楼层按钮用） */
.nd-novel .nd-detail {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: var(--nd-bg-solid);
    border: 1px solid var(--nd-border);
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 12px;
    color: var(--nd-text-secondary);
    white-space: nowrap;
    box-shadow: var(--nd-shadow-lg);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.15s ease, visibility 0.15s;
    z-index: 100;
}

.nd-float.nd-novel.show-detail .nd-detail {
    opacity: 1;
    visibility: visible;
    transform: none;
}

.nd-novel .nd-detail-row{ display: flex; align-items: center; gap: 10px; padding: 3px 0; }
.nd-novel .nd-detail-row + .nd-detail-row{ margin-top: 6px; padding-top: 8px; border-top: 1px solid var(--nd-border-subtle); }
.nd-novel .nd-detail-icon{ opacity: 0.6; font-size: 13px; }
.nd-novel .nd-detail-label{ color: var(--nd-text-muted); }
.nd-novel .nd-detail-value{ margin-left: auto; font-weight: 600; color: var(--nd-text-primary); }
.nd-novel .nd-detail-value.success{ color: var(--nd-success); }
.nd-novel .nd-detail-value.warning{ color: var(--nd-warning); }
.nd-novel .nd-detail-value.error{ color: var(--nd-error); }

/* 菜单 - 向下展开（楼层按钮用）；整体限高，预设网格在菜单内部滚动 */
.nd-novel .nd-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 242px;
    display: flex;
    flex-direction: column;
    max-height: min(55vh, 400px);
    overflow: hidden;
    background: var(--nd-bg-solid);
    border: 1px solid var(--nd-border);
    border-radius: 12px;
    padding: 10px;
    box-sizing: border-box;
    box-shadow: var(--nd-shadow-lg);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.15s ease, visibility 0.15s;
    z-index: 100;
}

.nd-float.nd-novel.expanded .nd-menu {
    opacity: 1;
    visibility: visible;
    transform: none;
}

.nd-novel .nd-card{
    background: transparent;
    border: none;
    border-radius: 0;
    overflow: visible;
    flex-shrink: 0;
}

.nd-novel .nd-row{
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 2px;
    min-height: 36px;
}

.nd-novel .nd-label{
    font-size: 11px;
    color: var(--nd-text-muted);
    width: 32px;
    flex-shrink: 0;
    padding: 0;
}

.nd-novel .nd-select {
    flex: 1;
    min-width: 0;
    background: var(--nd-bg-active);
    border: 1px solid var(--nd-border-subtle);
    color: var(--nd-text-primary);
    font-size: 11px;
    min-height: 32px;
    border-radius: 6px;
    padding: 6px 8px;
    margin: 0;
    box-sizing: border-box;
    outline: none;
    cursor: pointer;
    text-align: center;
    text-align-last: center;
    transition: border-color 0.2s;
    vertical-align: middle;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
}
.nd-novel .nd-select:hover { border-color: var(--nd-border-hover); }
.nd-novel .nd-select:focus { border-color: var(--nd-text-muted); }
.nd-novel .nd-select option { background: var(--nd-bg-solid); color: var(--nd-text-primary); text-align: left; }
.nd-novel .nd-select.size{ font-family: "SF Mono", "Menlo", "Consolas", monospace; font-size: 11px; }
${at}
.nd-novel .nd-max-images-input { background: var(--nd-bg-active); }
.nd-novel .nd-max-images-input:hover { border-color: var(--nd-border-hover); }
.nd-novel .nd-max-images-input:focus { border-color: var(--nd-text-muted); }

.nd-novel .nd-inner-sep{ display: none; }

.nd-novel .nd-controls{ display: flex; align-items: center; gap: 8px; margin-top: 10px; flex-shrink: 0; }

/* 尺寸（控制行内，弹性占满）+ 数目并排一行 */
.nd-novel .nd-row-pair{ display: flex; align-items: stretch; gap: 8px; padding: 6px 2px; }
.nd-novel .nd-row-pair .nd-row{ flex: 1; min-width: 0; padding: 0; }
.nd-novel .nd-row-pair .nd-label{ width: auto; padding-right: 2px; }
.nd-novel .nd-controls .nd-row{ flex: 1; min-width: 0; padding: 0; }

.nd-novel .nd-auto{
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 32px;
    box-sizing: border-box;
    padding: 0 12px;
    background: var(--nd-bg-active);
    border: 1px solid var(--nd-border-subtle);
    border-radius: var(--nd-radius-sm);
    cursor: pointer;
    transition: all 0.15s;
}
.nd-novel .nd-auto:hover { background: var(--nd-bg-active); }
.nd-novel .nd-auto.on{ background: color-mix(in srgb, var(--nd-success) 8%, var(--nd-bg)); border-color: var(--nd-success); }

.nd-novel .nd-dot{
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--nd-text-muted);
    transition: all 0.2s;
}
.nd-novel .nd-auto.on .nd-dot{ background: var(--nd-success); box-shadow: 0 0 8px var(--nd-success); }

.nd-novel .nd-auto-text{ font-size: 12px; color: var(--nd-text-muted); }
.nd-novel .nd-auto:hover .nd-auto-text{ color: var(--nd-text-secondary); }
.nd-novel .nd-auto.on .nd-auto-text{ color: var(--nd-success); }

.nd-novel .nd-gear{
    width: 36px;
    height: 36px;
    border: 1px solid var(--nd-border-subtle);
    border-radius: var(--nd-radius-sm);
    background: var(--nd-bg-active);
    color: var(--nd-text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: all 0.15s;
}
.nd-novel .nd-gear:hover { background: var(--nd-bg-active); color: var(--nd-text-secondary); }

/* ═══════════════════════════════════════════════════════════════════════════
   画师串预设网格
   ═══════════════════════════════════════════════════════════════════════════ */
/* 结构与已验证可用的 nai-preset-switcher 对齐：
   普通 block 卡片（不用 button/flex），缩略图直接是 <img> 本身 */
.nd-preset-grid {
    flex: 1;
    min-height: 0;
    margin-top: 10px;
    display: grid;
    /* 固定 4 列：菜单宽 260px，内容约 240px，每列约 54px（原卡片一半） */
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: max-content;
    align-items: start;
    gap: 6px;
    align-content: start;
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
}

.nd-preset-card {
    position: relative;
    border: 1px solid var(--nd-border-subtle);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.03);
    overflow: hidden;
    cursor: pointer;
    -webkit-user-select: none;
    user-select: none;
    transition: border-color 0.15s, background 0.15s, transform 0.1s;
}
.nd-preset-card:hover { border-color: rgba(255, 255, 255, 0.28); background: rgba(255, 255, 255, 0.07); }
.nd-preset-card:active { transform: scale(0.96); }
.nd-preset-card.active {
    border: 1px solid var(--nd-success);
    box-shadow: 0 0 8px rgba(62, 207, 142, 0.35);
    background: rgba(62, 207, 142, 0.08);
}

/* 缩略图固定像素高度：绝不依赖 aspect-ratio 或百分比 padding，
   否则该 WebView 会把高度算成 0，导致卡片被压成细线、全部挤在一起不滚动。
   高度带 !important：楼层/悬浮两种挂载位置命中的宿主页样式不同（聊天消息里的
   img 规则可能更高优先级），不加会被宿主样式拉伸成“随位置填满高度” */
.nd-preset-thumb {
    width: 100% !important;
    height: 75px !important;
    max-height: 75px !important;
    object-fit: cover;
    background: rgba(128, 128, 128, 0.28);
    display: block;
    pointer-events: none;
}
.nd-preset-thumb.empty {
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.35);
    font-size: 10px;
    line-height: 1.2;
    text-align: center;
    padding: 2px;
    box-sizing: border-box;
}

.nd-preset-check {
    position: absolute;
    top: 2px;
    right: 2px;
    z-index: 2;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--nd-success);
    color: #0b1712;
    font-size: 9px;
    font-weight: 700;
    display: none;
    align-items: center;
    justify-content: center;
    pointer-events: none;
}
.nd-preset-card.active .nd-preset-check { display: flex; }

.nd-preset-name {
    font-size: 10px;
    line-height: 1.25;
    color: var(--nd-text-secondary);
    padding: 3px 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    pointer-events: none;
}
.nd-preset-card.active .nd-preset-name { color: var(--nd-text-primary); }

.nd-preset-empty {
    grid-column: 1 / -1;
    text-align: center;
    color: var(--nd-text-muted);
    font-size: 11px;
    padding: 24px 0;
}

/* ═══════════════════════════════════════════════════════════════════════════
   悬浮按钮样式（固定定位，可拖拽）
   ═══════════════════════════════════════════════════════════════════════════ */
.nd-floating-global.nd-novel {
    position: fixed;
    z-index: 10000;
    user-select: none;
    transition: transform 0.25s ease;
}

/* 貼邊半藏：膠囊一半移出螢幕；吸附時隱藏跳圖鈕 */
.nd-floating-global.nd-novel.nd-docked-left { transform: translateX(-50%); }
.nd-floating-global.nd-novel.nd-docked-right { transform: translateX(50%); }
.nd-floating-global.nd-novel[class*="nd-docked"] .nd-img-jump { display: none; }

.nd-floating-global.nd-novel .nd-capsule {
    background: var(--nd-bg-solid);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.16);
    touch-action: none;
    cursor: grab;
}

/* 跳圖上下鈕：絕對定位在膠囊外，不影響膠囊尺寸與拖曳 */
.nd-floating-global.nd-novel .nd-img-jump {
    touch-action: none;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 34px;
    height: 26px;
    border: none;
    border-radius: 11px;
    background: transparent;
    color: var(--nd-text-muted);
    font-size: 12px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: none;
    z-index: 1;
    padding: 0;
    transition: color 0.15s, background 0.15s;
}
.nd-floating-global.nd-novel .nd-img-jump-prev { bottom: calc(100% + 4px); }
.nd-floating-global.nd-novel .nd-img-jump-next { top: calc(100% + 4px); }
.nd-floating-global.nd-novel .nd-img-jump:hover { color: var(--nd-text-primary); background: var(--nd-bg-active); }
.nd-novel .nd-img-jump-prev .nd-icon { transform: rotate(180deg); }

.nd-floating-global.nd-novel .nd-capsule:active { cursor: grabbing; }

${nt}
@media (prefers-reduced-motion: reduce) {
    .nd-novel, .nd-novel * { transition: none !important; animation: none !important; }
}
`;function fe(){if(Ze(),ye)return;ye=!0;const e=document.createElement("style");e.id="nd-float-styles",e.textContent=lt,document.head.appendChild(e)}function d(e,t,n){const o=document.createElement(e);return t&&(o.className=t),n!==void 0&&(o.textContent=n),o}function u(e){return I(e==="chevron"?"chevron-down":e,"nd-icon")}function ge(){const e=d("span","nd-arrow");return e.appendChild(u("chevron")),e}function Me(){const e=d("button","nd-btn-menu nd-btn-menu-persist");return e.title="展开菜单",e.appendChild(ge()),e}function Y(e){if(!e)return;const t=w().overrideSize||"default";e.replaceChildren(),st.forEach(n=>{const o=document.createElement("option");o.value=n.value,o.textContent=n.label,n.value===t&&(o.selected=!0),e.appendChild(o)})}function V(e){if(!e)return;const t=w(),n=t.paramsPresets||[],o=t.selectedParamsPresetId;if(e.replaceChildren(),!n.length){e.appendChild(d("div","nd-preset-empty","暂无画师串预设"));return}n.forEach(r=>{const s=d("div",`nd-preset-card${r.id===o?" active":""}`);s.dataset.presetId=r.id,s.title=r.name||"未命名",s.style.alignSelf="start";const l=()=>{const c=d("div","nd-preset-thumb empty","无预览");return c.style.cssText="width:100% !important;height:75px !important;max-height:75px !important;display:flex;align-items:center;justify-content:center;background:rgba(128,128,128,0.28);color:rgba(255,255,255,0.45);font-size:10px;line-height:1.2;text-align:center;padding:2px;box-sizing:border-box;",c};if(r.thumbnail){const c=document.createElement("img");c.className="nd-preset-thumb",c.alt="",c.loading="lazy",c.decoding="async",c.style.cssText="width:100% !important;height:75px !important;max-height:75px !important;object-fit:cover;display:block;background:rgba(128,128,128,0.28);box-sizing:border-box;",c.src=r.thumbnail,c.addEventListener("error",()=>c.replaceWith(l()),{once:!0}),s.appendChild(c)}else s.appendChild(l());s.appendChild(d("span","nd-preset-check","✓")),s.appendChild(d("div","nd-preset-name",r.name||"未命名")),e.appendChild(s)})}var M=tt({getOverride:()=>w().overrideMaxImages,getPresetMaxImages:()=>{const e=w();return Xe(e.paramsPresets,e.selectedParamsPresetId)},persistOverride:(e,{okText:t})=>Ne(n=>{n.overrideMaxImages=e},t),listInputs:()=>[...p.values()].map(e=>e.$cache?.maxImagesInput).concat(g.maxImagesInput),notify:e=>globalThis.toastr?.warning?.(e)});function dt(e){return{messageId:e,root:null,state:a.IDLE,result:{success:0,total:0,error:null,startTime:0},autoResetTimer:null,cooldownRafId:null,cooldownEndTime:0,$cache:{},_cleanup:null}}function ct(e){const t=w().mode==="auto",n=document.createElement("div");n.className=`nd-float nd-novel lwb-draw-ui${t?" auto-on":""}`,n.dataset.messageId=e;const o=d("div","nd-capsule"),r=d("div","nd-inner"),s=d("div","nd-layer nd-layer-idle"),l=d("button","nd-btn-draw");l.title="点击生成配图",l.appendChild(u("palette")),l.appendChild(d("span","nd-auto-dot"));const c=d("div","nd-sep"),x=d("button","nd-btn-menu");x.title="展开菜单",x.appendChild(ge()),s.append(l,c,x);const D=d("button","nd-layer nd-layer-active");D.append(d("span","nd-status-icon"),d("span","nd-status-text",v.analysis)),r.append(s,D),o.append(r,Me());const F=d("div","nd-detail"),R=d("div","nd-detail-row");R.append(I("images","nd-detail-icon"),d("span","nd-detail-label","结果"),d("span","nd-detail-value nd-result","-"));const N=d("div","nd-detail-row nd-error-row");N.style.display="none",N.append(I("circle-info","nd-detail-icon"),d("span","nd-detail-label","原因"),d("span","nd-detail-value error nd-error","-"));const y=d("div","nd-detail-row");y.append(I("clock","nd-detail-icon"),d("span","nd-detail-label","耗时"),d("span","nd-detail-value nd-time","-")),F.append(R,N,y);const T=d("div","nd-menu"),k=d("div","nd-card"),E=d("div",`nd-auto${t?" on":""} nd-auto-toggle`);E.append(d("span","nd-dot"),d("span","nd-auto-text",t?"自动":"手动"));const b=d("div","nd-row-pair");b.append(E,M.createRow()),k.append(b);const O=d("div","nd-controls"),Q=d("div","nd-row");Q.appendChild(d("span","nd-label","尺寸"));const q=d("select","nd-select size nd-size-select");Y(q),Q.appendChild(q);const G=d("button","nd-gear nd-settings-btn");G.title="打开设置",G.appendChild(I("sliders")),O.append(Q,G);const U=d("div","nd-preset-grid");return V(U),T.append(k,O,U),n.append(o,F,T),n}function ut(e){const t=e.root;t&&(e.$cache={statusIcon:t.querySelector(".nd-status-icon"),statusText:t.querySelector(".nd-status-text"),result:t.querySelector(".nd-result"),errorRow:t.querySelector(".nd-error-row"),error:t.querySelector(".nd-error"),time:t.querySelector(".nd-time"),sizeSelect:t.querySelector(".nd-size-select"),maxImagesInput:t.querySelector(`.${Pe}`),autoToggle:t.querySelector(".nd-auto-toggle"),presetGrid:t.querySelector(".nd-preset-grid")})}function j(e,t,n={}){const o=p.get(e);if(!o?.root)return;const r=o.root;o.state=t,o.autoResetTimer&&(clearTimeout(o.autoResetTimer),o.autoResetTimer=null),t!==a.COOLDOWN&&o.cooldownRafId&&(cancelAnimationFrame(o.cooldownRafId),o.cooldownRafId=null,o.cooldownEndTime=0),r.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:s,statusText:l}=o.$cache;switch(l&&(l.className="nd-status-text"),t){case a.IDLE:o.result={success:0,total:0,error:null,startTime:0};break;case a.SUBMITTING:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),s&&(s.replaceChildren(u("upload")),s.className="nd-status-icon nd-spin"),l&&(l.textContent=v.submitting);break;case a.ACCEPTED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),s&&(s.replaceChildren(u(["analysis","retry"].includes(De(n))?"spinner":"palette")),s.className="nd-status-icon nd-spin"),l&&(l.textContent=Fe(n));break;case a.UNCERTAIN:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),s&&(s.replaceChildren(u("rotate")),s.className="nd-status-icon nd-spin"),l&&(l.textContent=v.uncertain);break;case a.QUEUED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),s&&(s.replaceChildren(u("clock")),s.className="nd-status-icon"),l&&(l.textContent=v.queued),o.result.total=n.total||o.result.total||0;break;case a.LLM:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),s&&(s.replaceChildren(u("spinner")),s.className="nd-status-icon nd-spin"),l&&(l.textContent=Se(n));break;case a.GEN:r.classList.add("working"),s&&(s.replaceChildren(u("palette")),s.className="nd-status-icon nd-spin"),l&&(l.textContent=`${n.current||0}/${n.total||0}`),o.result.total=n.total||0;break;case a.COOLDOWN:r.classList.add("cooldown"),s&&(s.replaceChildren(u("spinner")),s.className="nd-status-icon nd-spin"),ft(o,n);break;case a.RECONNECTING:r.classList.add("working"),s&&(s.replaceChildren(u("rotate")),s.className="nd-status-icon nd-spin"),l&&(l.textContent=v.reconnecting);break;case a.CANCELLING:r.classList.add("working"),s&&(s.replaceChildren(u("spinner")),s.className="nd-status-icon nd-spin"),l&&(l.textContent=v.cancelling);break;case a.BACKEND_LEGACY:r.classList.add("working"),s&&(s.replaceChildren(u("share-from-square")),s.className="nd-status-icon"),l&&(l.textContent=v.legacy);break;case a.SUCCESS:r.classList.add("success"),s&&(s.replaceChildren(u("check")),s.className="nd-status-icon"),l&&(l.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>j(e,a.IDLE),B);break;case a.PARTIAL:r.classList.add("partial"),s&&(s.replaceChildren(u("triangle-exclamation")),s.className="nd-status-icon"),l&&(l.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>j(e,a.IDLE),B);break;case a.ERROR:r.classList.add("error"),s&&(s.replaceChildren(u("xmark")),s.className="nd-status-icon"),l&&(l.textContent=n.unknown?v.unknown:v.error),o.result.error=n.error,o.autoResetTimer=setTimeout(()=>j(e,a.IDLE),B);break}}async function _(e,t={}){const n=ie(e);if(n){Z(e,n.state,n.data);return}const o=ue(e),r=await He(e).catch(()=>null);if(!r||!z(o))return;e=A().chat.indexOf(o.message);const s=ie(e);if(s){Z(e,s.state,s.data);return}const l=A(),c=String(l?.chatId||""),x=l?.chat?.[Number(e)];if(!c||!x)return;const D=Number.isInteger(x.swipe_id)?x.swipe_id:0,F=Number.isSafeInteger(r.swipeIndex)?r.swipeIndex:D,R=r.provider||t?.provider||it,N=r.runId||t?.runId||"",y={chatId:c,messageId:e,swipeIndex:F,provider:R,runId:N},T=et({detail:t,pending:r.pending,...y}),k=rt(T,r,y),E=p.get(e);if(E){const b=we({currentState:E.state,pending:r.pending,detail:k,...y});(b!==E.state||b===a.ACCEPTED&&be(T))&&j(e,b,k)}if(i&&Number(e)===H()){const b=we({currentState:h,pending:r.pending,detail:k,...y});r.pending&&($=Number(e)),(b!==h||b===a.ACCEPTED&&be(T))&&P(b,k)}}function pt(e={}){const t=Qe(e,A());if(!t)return;const n=H();(p.has(t.messageId)||i&&t.messageId===n)&&C(_(t.messageId,e),{source:import.meta.url,operation:"syncDrawRunActivity"})}function Qt(){const e=H();if(i){const t=e>=0?ie(e):null;t?($=e,P(t.state,t.data)):P(a.IDLE)}e>=0&&C(_(e),{source:import.meta.url,operation:"refreshDrawRunUiState"})}function _e({cooldownUntil:e,duration:t}={}){const n=Number(e);return Number.isFinite(n)&&n>0?n:Date.now()+Math.max(0,Number(t)||0)}function ft(e,t){e.cooldownRafId&&cancelAnimationFrame(e.cooldownRafId),e.cooldownEndTime=_e(t);function n(){if(!e.cooldownEndTime)return;const o=Math.max(0,e.cooldownEndTime-Date.now()),r=e.$cache?.statusText;if(r&&(r.textContent=`${(o/1e3).toFixed(1)}s`,r.className="nd-status-text nd-countdown"),o<=0){e.cooldownRafId=null,e.cooldownEndTime=0;return}e.cooldownRafId=requestAnimationFrame(n)}e.cooldownRafId=requestAnimationFrame(n)}function gt(e){const t=p.get(e);if(!t?.root)return;const{result:n,errorRow:o,error:r,time:s}=t.$cache,{result:l,state:c}=t,x=l.startTime?((Date.now()-l.startTime)/1e3).toFixed(1):"-";c===a.SUCCESS||c===a.PARTIAL?(n&&(n.textContent=`${l.success}/${l.total} 成功`,n.className=`nd-detail-value ${c===a.SUCCESS?"success":"warning"}`),o&&(o.style.display=c===a.PARTIAL?"flex":"none"),r&&c===a.PARTIAL&&(r.textContent=`${l.total-l.success} 张失败`)):c===a.ERROR&&(n&&(n.textContent=l.error?.label||te.redrawFailed,n.className="nd-detail-value error"),o&&(o.style.display="flex"),r&&(r.textContent=l.error?.desc||"未知错误")),s&&(s.textContent=`${x}s`)}async function mt(e){const t=p.get(e);if(!(!t||t.state!==a.IDLE))try{await Ie({messageId:e,onStateChange:(n,o,r)=>{Z(r,n,o)}})}catch(n){if(n.drawTaskReported)return;n instanceof Te||ke(n)?toastr?.info?.(n.message):(console.error(n),toastr?.error?.(n.message))}}async function vt(e){const t=ue(e);try{await Ae({cancel:()=>Re(e,{target:t}),isCurrent:()=>z(t),getState:()=>p.get(A().chat.indexOf(t.message))?.state,setState:n=>j(A().chat.indexOf(t.message),n)})&&z(t)&&toastr?.info?.("正在中止"),z(t)&&await _(A().chat.indexOf(t.message))}catch(n){console.error("[NovelDraw] 中止失败:",n),toastr?.error?.(te.cancelFailed)}}function xt(e){const{messageId:t,root:n}=e;n.querySelector(".nd-btn-draw")?.addEventListener("click",l=>{l.stopPropagation(),C(mt(t),{source:import.meta.url,operation:"callback"})}),n.querySelectorAll(".nd-btn-menu").forEach(l=>l.addEventListener("click",c=>{c.stopPropagation(),n.classList.remove("show-detail"),n.classList.contains("expanded")||(ht(t),bt(t),wt(t)),n.classList.toggle("expanded")})),n.querySelector(".nd-layer-active")?.addEventListener("click",l=>{l.stopPropagation();const c=e.state;[a.SUBMITTING,a.ACCEPTED,a.UNCERTAIN,a.QUEUED,a.LLM,a.GEN,a.COOLDOWN,a.RECONNECTING,a.BACKEND_LEGACY].includes(c)?C(vt(t),{source:import.meta.url,operation:"callback"}):[a.SUCCESS,a.PARTIAL,a.ERROR].includes(c)&&(gt(t),n.classList.toggle("show-detail"))}),e.$cache.presetGrid?.addEventListener("click",async l=>{const c=l.target.closest(".nd-preset-card");if(!c)return;l.stopPropagation();const x=c.dataset.presetId;x&&x!==w().selectedParamsPresetId&&await qe(x),n.classList.remove("expanded")}),e.$cache.sizeSelect?.addEventListener("change",async l=>{await Ge(l.target.value)});const o=M.bind(e.$cache.maxImagesInput);e.$cache.autoToggle?.addEventListener("click",async()=>{await Ue()}),n.querySelector(".nd-settings-btn")?.addEventListener("click",l=>{l.stopPropagation(),n.classList.remove("expanded"),C(Le(),{source:import.meta.url,operation:"callback"})});const r=l=>{n.contains(l.target)||n.classList.remove("expanded","show-detail")};document.addEventListener("click",r,{passive:!0});const s=Ee({document,container:n.querySelector(".nd-controls")});e._cleanup=()=>{s?.destroy(),o.destroy(),document.removeEventListener("click",r),e.autoResetTimer&&clearTimeout(e.autoResetTimer),e.autoResetTimer=null,e.cooldownRafId&&cancelAnimationFrame(e.cooldownRafId),e.cooldownRafId=null,e.cooldownEndTime=null}}function ht(e){V(p.get(e)?.$cache?.presetGrid)}function bt(e){const t=p.get(e)?.$cache?.sizeSelect;Y(t)}function wt(e){M.fill(p.get(e)?.$cache?.maxImagesInput)}async function me(e,t,n){const o=await Ne(e,t);return o&&typeof n=="function"&&n(),o}async function qe(e){return me(t=>{t.selectedParamsPresetId=e},"预设已切换",Ve)}async function Ge(e){return me(t=>{t.overrideSize=e},"尺寸已切换",Mt)}async function Ue(){const e=w().mode==="auto"?"manual":"auto";return me(t=>{t.mode=e},e==="auto"?"自动配图已开启":"自动配图已关闭",qt)}function le(e,t){if(p.has(t)){const r=p.get(t);if(r.root?.isConnected)return C(_(t),{source:import.meta.url,operation:"mountFloorPanel"}),r;r._cleanup?.(),p.delete(t)}fe();const n=dt(t),o=ct(t);return n.root=o,Je(t,o,{position:"right",id:`novel-draw-${t}`})?(ut(n),xt(n),p.set(t,n),C(_(t),{source:import.meta.url,operation:"mountFloorPanel"}),n):null}function yt(){L||(L=new IntersectionObserver(e=>{const t=[];for(const n of e){if(!n.isIntersecting)continue;const o=n.target,r=Number(o.getAttribute("mesid"));W.has(r)&&(t.push({el:o,mid:r}),W.delete(r),L.unobserve(o))}t.length>0&&requestAnimationFrame(()=>{for(const{el:n,mid:o}of t)le(n,o)})},{rootMargin:"300px"}))}function Ct(e,t,n={}){if(w().showFloorButton===!1)return null;const{force:o=!1}=n;if(fe(),p.has(t)){const s=p.get(t);if(s.root?.isConnected)return s;s._cleanup?.(),p.delete(t)}if(o)return le(e,t);const r=e.getBoundingClientRect();return r.top<window.innerHeight+500&&r.bottom>-500?le(e,t):(yt(),W.set(t,!0),L.observe(e),null)}function Xt(e,t){L?.unobserve(e),W.delete(t);const n=p.get(t);!n||!e.contains(n.root)||(n.autoResetTimer&&clearTimeout(n.autoResetTimer),n.cooldownRafId&&cancelAnimationFrame(n.cooldownRafId),n._cleanup?.(),ce(t,n.root),p.delete(t))}function Z(e,t,n={}){let o=p.get(e);if(!o?.root?.isConnected){const r=document.querySelector(`.mes[mesid="${e}"]`);r&&(o=Ct(r,e,{force:!0}))}o&&j(e,t,n),i&&e===H()&&($=e,P(t,n))}function kt(){try{const t=localStorage.getItem(Oe);if(t)return JSON.parse(t)}catch(t){console.warn({source:import.meta.url,operation:"getFloatingPosition"},t)}const e=document.getElementById("xiaobaix-debug-mini");if(e){const t=e.getBoundingClientRect();return{left:t.left,top:t.bottom+8}}return{left:window.innerWidth-110,top:window.innerHeight-80}}var ne=null;function oe(e){i&&(ne=e,i.classList.toggle("nd-docked-left",e==="left"),i.classList.toggle("nd-docked-right",e==="right"))}function ve(){if(!i)return;const e=parseFloat(i.style.left)||0,t=parseFloat(i.style.top)||0;try{localStorage.setItem(Oe,JSON.stringify({left:Math.round(e),top:Math.round(t),docked:ne||""}))}catch(n){console.warn({source:import.meta.url,operation:"saveFloatingPosition"},n)}}function de(){if(!i)return;const e=kt(),t=pe(),n=h===a.IDLE?ze:$e,o=i.offsetHeight||34,r=30,s=e.docked==="left"?t.left:e.docked==="right"?t.right-n:e.left;i.style.left=`${Math.max(t.left,Math.min(s,t.right-n))}px`,i.style.top=`${Math.max(t.top+r,Math.min(e.top,t.bottom-o-r))}px`,oe(e.docked==="left"||e.docked==="right"?e.docked:null)}function ee(){X&&(cancelAnimationFrame(X),X=null),J=0}function Tt(e){ee(),J=_e(e);function t(){if(!J)return;const n=Math.max(0,J-Date.now()),o=g.statusText;if(o&&(o.textContent=`${(n/1e3).toFixed(1)}s`,o.className="nd-status-text nd-countdown"),n<=0){ee();return}X=requestAnimationFrame(t)}X=requestAnimationFrame(t)}function P(e,t={}){if(!i)return;const n=h===a.IDLE;h=e,n!==(e===a.IDLE)&&de(),S&&(clearTimeout(S),S=null),e!==a.COOLDOWN&&ee(),i.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:o,statusText:r}=g;if(!(!o||!r))switch(r.className="nd-status-text",e){case a.IDLE:$=null,f={success:0,total:0,error:null,startTime:0};break;case a.SUBMITTING:i.classList.add("working"),f.startTime||(f.startTime=Date.now()),o.replaceChildren(u("upload")),o.className="nd-status-icon nd-spin",r.textContent=v.submitting;break;case a.ACCEPTED:i.classList.add("working"),f.startTime||(f.startTime=Date.now()),o.replaceChildren(u(["analysis","retry"].includes(De(t))?"spinner":"palette")),o.className="nd-status-icon nd-spin",r.textContent=Fe(t);break;case a.UNCERTAIN:i.classList.add("working"),f.startTime||(f.startTime=Date.now()),o.replaceChildren(u("rotate")),o.className="nd-status-icon nd-spin",r.textContent=v.uncertain;break;case a.QUEUED:i.classList.add("working"),f.startTime||(f.startTime=Date.now()),o.replaceChildren(u("clock")),o.className="nd-status-icon",r.textContent=v.queued;break;case a.LLM:i.classList.add("working"),f.startTime||(f.startTime=Date.now()),o.replaceChildren(u("spinner")),o.className="nd-status-icon nd-spin",r.textContent=Se(t);break;case a.GEN:i.classList.add("working"),o.replaceChildren(u("palette")),o.className="nd-status-icon nd-spin",r.textContent=`${t.current||0}/${t.total||0}`,f.total=t.total||0;break;case a.COOLDOWN:i.classList.add("cooldown"),o.replaceChildren(u("spinner")),o.className="nd-status-icon nd-spin",Tt(t);break;case a.RECONNECTING:i.classList.add("working"),o.replaceChildren(u("rotate")),o.className="nd-status-icon nd-spin",r.textContent=v.reconnecting;break;case a.CANCELLING:i.classList.add("working"),o.replaceChildren(u("spinner")),o.className="nd-status-icon nd-spin",r.textContent=v.cancelling;break;case a.BACKEND_LEGACY:i.classList.add("working"),o.replaceChildren(u("share-from-square")),o.className="nd-status-icon",r.textContent=v.legacy;break;case a.SUCCESS:i.classList.add("success"),o.replaceChildren(u("check")),o.className="nd-status-icon",r.textContent=`${t.success}/${t.total}`,f.success=t.success,f.total=t.total,S=setTimeout(()=>P(a.IDLE),B);break;case a.PARTIAL:i.classList.add("partial"),o.replaceChildren(u("triangle-exclamation")),o.className="nd-status-icon",r.textContent=`${t.success}/${t.total}`,f.success=t.success,f.total=t.total,S=setTimeout(()=>P(a.IDLE),B);break;case a.ERROR:i.classList.add("error"),o.replaceChildren(u("xmark")),o.className="nd-status-icon",r.textContent=t.unknown?v.unknown:v.error,f.error=t.error,S=setTimeout(()=>P(a.IDLE),B);break}}function Et(){const{detailResult:e,detailErrorRow:t,detailError:n,detailTime:o}=g;if(!e)return;const r=f.startTime?((Date.now()-f.startTime)/1e3).toFixed(1):"-";h===a.SUCCESS||h===a.PARTIAL?(e.textContent=`${f.success}/${f.total} 成功`,e.className=`nd-detail-value ${h===a.SUCCESS?"success":"warning"}`,t.style.display=h===a.PARTIAL?"flex":"none",h===a.PARTIAL&&(n.textContent=`${f.total-f.success} 张失败`)):h===a.ERROR&&(e.textContent=f.error?.label||te.redrawFailed,e.className="nd-detail-value error",t.style.display="flex",n.textContent=f.error?.desc||"未知错误"),o.textContent=`${r}s`}function St(e){if(!(e.button!==0||m||!e.target.closest(".nd-capsule, .nd-img-jump"))){if(ne){oe(null),ve(),e.preventDefault();return}m={startX:e.clientX,startY:e.clientY,startLeft:i.getBoundingClientRect().left,startTop:i.getBoundingClientRect().top,pointerId:e.pointerId,moved:!1,originalTarget:e.target};try{e.currentTarget.setPointerCapture(e.pointerId)}catch(t){console.warn({source:import.meta.url,operation:"onFloatingPointerDown"},t)}e.preventDefault()}}function It(e){if(!m||m.pointerId!==e.pointerId)return;const t=e.clientX-m.startX,n=e.clientY-m.startY;if(!m.moved&&(Math.abs(t)>3||Math.abs(n)>3)&&(m.moved=!0),m.moved){const o=pe(),r=i.offsetWidth||88,s=i.offsetHeight||36,l=30;i.style.left=`${Math.max(o.left,Math.min(m.startLeft+t,o.right-r))}px`,i.style.top=`${Math.max(o.top+l,Math.min(m.startTop+n,o.bottom-s-l))}px`}e.preventDefault()}function Lt(e){if(!m||m.pointerId!==e.pointerId)return;const{moved:t,originalTarget:n}=m;if(m=null,e.currentTarget.hasPointerCapture(e.pointerId)&&e.currentTarget.releasePointerCapture(e.pointerId),t){const o=parseFloat(i.style.left)||0,r=i.offsetWidth||88,s=28,l=pe();let c=null;o<=l.left+s?c="left":o>=l.right-r-s&&(c="right"),c&&(i.style.left=`${c==="left"?l.left:l.right-r}px`),oe(c),ve()}else Be(n)}function Ce(e){if(!m||m.pointerId!==e.pointerId)return;const{startLeft:t,startTop:n}=m;m=null,i.style.left=`${t}px`,i.style.top=`${n}px`,e.currentTarget.hasPointerCapture(e.pointerId)&&e.currentTarget.releasePointerCapture(e.pointerId)}function Rt(e){if(e.target.closest(".nd-capsule, .nd-img-jump")&&(e.preventDefault(),e.stopPropagation(),e.detail===0)){if(ne){oe(null),ve();return}Be(e.target)}}function Nt(){return[...document.querySelectorAll("#chat .mes .mes_text .xb-nd-img")].filter(e=>e.offsetHeight>0&&e.offsetWidth>0&&e.querySelector("img"))}function At(e){const t=window.innerHeight/2;let n=null,o=1/0;for(const r of Nt()){const s=r.getBoundingClientRect();if(e<0&&s.bottom<t-1){const l=t-s.bottom;l<o&&(o=l,n=r)}else if(e>0&&s.top>t+1){const l=s.top-t;l<o&&(o=l,n=r)}}n&&n.scrollIntoView({behavior:"smooth",block:"center"})}function Be(e){e.closest(".nd-img-jump")?At(e.closest(".nd-img-jump-prev")?-1:1):e.closest(".nd-btn-draw")?C(Pt(),{source:import.meta.url,operation:"routeFloatingClick"}):e.closest(".nd-btn-menu")?(i.classList.remove("show-detail"),i.classList.contains("expanded")||(Ft(),Ot(),zt()),i.classList.toggle("expanded")):e.closest(".nd-layer-active")&&([a.SUBMITTING,a.ACCEPTED,a.UNCERTAIN,a.QUEUED,a.LLM,a.GEN,a.COOLDOWN,a.RECONNECTING,a.BACKEND_LEGACY].includes(h)?C(Dt(),{source:import.meta.url,operation:"routeFloatingClick"}):[a.SUCCESS,a.PARTIAL,a.ERROR].includes(h)&&(Et(),i.classList.toggle("show-detail")))}async function Pt(){if(h!==a.IDLE)return;const e=H();if(e<0){toastr?.warning?.("没有可配图的AI消息");return}$=e;try{await Ie({messageId:e,onStateChange:(t,n,o)=>{Z(o,t,n)}})}catch(t){if(t.drawTaskReported)return;t instanceof Te||ke(t)?toastr?.info?.(t.message):(console.error(t),toastr?.error?.(t.message))}}async function Dt(){const e=$,t=ue(e);try{e>=0&&await Ae({cancel:()=>Re(e,{target:t}),isCurrent:()=>z(t)&&$===A().chat.indexOf(t.message),getState:()=>h,setState:P})&&z(t)&&toastr?.info?.("正在中止"),e>=0&&z(t)&&await _(A().chat.indexOf(t.message))}catch(n){console.error("[NovelDraw] 中止失败:",n),toastr?.error?.(te.cancelFailed)}}function Ft(){V(g.presetGrid)}function Ot(){Y(g.sizeSelect)}function zt(){M.fill(g.maxImagesInput)}function $t(){i&&(g={capsule:i.querySelector(".nd-capsule"),statusIcon:i.querySelector(".nd-status-icon"),statusText:i.querySelector(".nd-status-text"),detailResult:i.querySelector(".nd-result"),detailErrorRow:i.querySelector(".nd-error-row"),detailError:i.querySelector(".nd-error"),detailTime:i.querySelector(".nd-time"),sizeSelect:i.querySelector(".nd-size-select"),maxImagesInput:i.querySelector(`.${Pe}`),autoToggle:i.querySelector(".nd-auto-toggle"),presetGrid:i.querySelector(".nd-preset-grid")})}function je(e){i&&!i.contains(e.target)&&i.classList.remove("expanded","show-detail")}function We(){if(i)return;const e=w();if(e.showFloatingButton!==!0)return;fe();const t=e.mode==="auto";i=document.createElement("div"),i.className=`nd-float nd-novel lwb-draw-ui nd-floating-global${t?" auto-on":""}`,i.id="nd-floating-global";const n=d("div","nd-detail"),o=d("div","nd-detail-row");o.append(I("images","nd-detail-icon"),d("span","nd-detail-label","结果"),d("span","nd-detail-value nd-result","-"));const r=d("div","nd-detail-row nd-error-row");r.style.display="none",r.append(I("circle-info","nd-detail-icon"),d("span","nd-detail-label","原因"),d("span","nd-detail-value error nd-error","-"));const s=d("div","nd-detail-row");s.append(I("clock","nd-detail-icon"),d("span","nd-detail-label","耗时"),d("span","nd-detail-value nd-time","-")),n.append(o,r,s);const l=d("div","nd-menu"),c=d("div","nd-card"),x=d("div",`nd-auto${t?" on":""} nd-auto-toggle`);x.append(d("span","nd-dot"),d("span","nd-auto-text",t?"自动":"手动"));const D=d("div","nd-row-pair");D.append(x,M.createRow()),c.append(D);const F=d("div","nd-controls"),R=d("div","nd-row");R.appendChild(d("span","nd-label","尺寸"));const N=d("select","nd-select size nd-size-select");Y(N),R.appendChild(N);const y=d("button","nd-gear nd-settings-btn");y.title="打开设置",y.appendChild(I("sliders")),F.append(R,y);const T=d("div","nd-preset-grid");V(T),l.append(c,F,T);const k=d("div","nd-capsule"),E=d("div","nd-inner"),b=d("div","nd-layer nd-layer-idle"),O=d("button","nd-btn-draw");O.title="点击为最后一条AI消息生成配图",O.appendChild(u("palette")),O.appendChild(d("span","nd-auto-dot"));const Q=d("div","nd-sep"),q=d("button","nd-btn-menu");q.title="展开菜单",q.appendChild(ge()),b.append(O,Q,q);const G=d("button","nd-layer nd-layer-active");G.append(d("span","nd-status-icon"),d("span","nd-status-text",v.analysis)),E.append(b,G),k.append(E,Me());const U=d("button","nd-img-jump nd-img-jump-prev");U.appendChild(u("chevron")),U.title="跳到上一张图片";const re=d("button","nd-img-jump nd-img-jump-next");re.appendChild(u("chevron")),re.title="跳到下一张图片",i.append(n,l,U,k,re),document.body.appendChild(i),$t(),de(),i.addEventListener("pointerdown",St,{passive:!1}),i.addEventListener("pointermove",It,{passive:!1}),i.addEventListener("pointerup",Lt,{passive:!1}),i.addEventListener("pointercancel",Ce),i.addEventListener("lostpointercapture",Ce),i.addEventListener("click",Rt),g.presetGrid?.addEventListener("click",async K=>{const he=K.target.closest(".nd-preset-card");if(!he)return;K.stopPropagation();const ae=he.dataset.presetId;ae&&ae!==w().selectedParamsPresetId&&await qe(ae),i?.classList.remove("expanded")}),g.sizeSelect?.addEventListener("change",async K=>{await Ge(K.target.value)}),g.maxImagesBinding=M.bind(g.maxImagesInput),g.themeSwitch=Ee({document,container:i.querySelector(".nd-controls")}),g.popovers=ot(i,de),g.autoToggle?.addEventListener("click",async()=>{await Ue()}),i.querySelector(".nd-settings-btn")?.addEventListener("click",()=>{i.classList.remove("expanded"),C(Le(),{source:import.meta.url,operation:"callback"})}),document.addEventListener("click",je,{passive:!0});const xe=H();xe>=0&&C(_(xe),{source:import.meta.url,operation:"createFloatingButton"})}function Ye(){g.popovers?.destroy(),g.themeSwitch?.destroy(),g.maxImagesBinding?.destroy(),ee(),S&&(clearTimeout(S),S=null),document.removeEventListener("click",je),i?.remove(),i=null,m=null,h=a.IDLE,g={}}function Ve(){p.forEach(e=>{V(e?.$cache?.presetGrid)}),V(g.presetGrid),_t()}function Mt(){p.forEach(e=>{Y(e.$cache?.sizeSelect)}),Y(g.sizeSelect)}function _t(){M.updateAll()}function qt(){const e=w().mode==="auto",t=e?"自动":"手动";if(p.forEach(n=>{if(!n.root)return;n.root.classList.toggle("auto-on",e),n.$cache.autoToggle?.classList.toggle("on",e);const o=n.$cache.autoToggle?.querySelector(".nd-auto-text");o&&(o.textContent=t)}),i){i.classList.toggle("auto-on",e),g.autoToggle?.classList.toggle("on",e);const n=g.autoToggle?.querySelector(".nd-auto-text");n&&(n.textContent=t)}}function Kt(){Ve()}function Jt(e,t){t&&!i?We():!t&&i&&Ye(),e||(p.forEach((n,o)=>{n.autoResetTimer&&clearTimeout(n.autoResetTimer),n.cooldownRafId&&cancelAnimationFrame(n.cooldownRafId),n._cleanup?.(),n.root&&ce(o,n.root)}),p.clear(),W.clear(),L?.disconnect(),L=null)}function Zt(){const e=w();se??=Ke(pt),e.showFloatingButton===!0&&We()}function en(){se?.(),se=null,p.forEach((e,t)=>{e.autoResetTimer&&clearTimeout(e.autoResetTimer),e.cooldownRafId&&cancelAnimationFrame(e.cooldownRafId),e._cleanup?.(),e.root&&ce(t,e.root)}),p.clear(),W.clear(),L?.disconnect(),L=null,Ye()}export{a as FloatState,st as SIZE_OPTIONS,We as createFloatingButton,Ye as destroyFloatingButton,en as destroyFloatingPanel,Ct as ensureNovelDrawPanel,Zt as initFloatingPanel,Qt as refreshDrawRunUiState,Kt as refreshPresetSelect,Kt as refreshPresetSelectAll,Xt as releaseNovelDrawPanel,P as setFloatingState,Z as setStateForMessage,_t as updateAllMaxImagesInputs,Ve as updateAllPresetSelects,Mt as updateAllSizeSelects,qt as updateAutoModeUI,Jt as updateButtonVisibility};
