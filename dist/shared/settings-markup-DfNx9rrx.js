import{f as q,n as M,u as _}from"./provider-resolution-rKXhvkai.js";import{d as O,n as S,o as A}from"./vertex-settings-CDAmP5s2.js";function o(t=""){return String(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function P(t="main"){const s=t==="delegate"?"xb-assistant-delegate":"xb-assistant";return`<label id="${s}-model-list-auth-wrap" style="display: none">
        <span>模型列表鉴权</span>
        <select id="${s}-model-list-auth"></select>
    </label>`}function w(t="main"){const s=t==="delegate"?"xb-assistant-delegate":"xb-assistant";return`<label>
        <span>Base URL</span>
        <input id="${s}-base-url" type="text" aria-describedby="${s}-base-url-hint" />
        <small id="${s}-base-url-hint" hidden>填写服务地址，不要在末尾加 /v1；系统默认使用 /v1beta。</small>
    </label>`}function n(t){return`<svg viewBox="0 0 24 24" aria-hidden="true">${{add:'<path d="M12 5v14" /><path d="M5 12h14" />',rename:'<path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />',save:'<path d="M5 21h14a1 1 0 0 0 1-1V7.5L16.5 4H5a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1Z" /><path d="M8 21v-7h8v7" /><path d="M8 4v5h7" />',saving:'<path class="xb-assistant-save-spinner" d="M12 3a9 9 0 1 1-8.2 5.3" />',success:'<path d="M20 6 9 17l-5-5" />',error:'<path d="M18 6 6 18" /><path d="M6 6l12 12" />',delete:'<path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />'}[t]||""}</svg>`}function H({isBusy:t,saveButton:s,saveIcon:i,saveDisabled:l}){return`<div class="xb-assistant-preset-row is-list">
                <div class="preset-list-header">
                    <div class="preset-list-title">
                        <button id="xb-assistant-preset-collapse" type="button" class="preset-list-toggle" title="折叠 / 展开" aria-label="折叠预设列表" aria-expanded="true" aria-controls="xb-assistant-preset-list"><i class="fa-solid fa-chevron-down" aria-hidden="true"></i></button>
                        <span class="xb-assistant-preset-title" id="xb-assistant-preset-title">已存预设</span>
                    </div>
                    <input id="xb-assistant-preset-name" type="hidden" />
                    <div class="xb-assistant-preset-tools" aria-label="API 预设操作">
                        <button id="xb-assistant-new-preset" type="button" class="xb-assistant-text-button" title="新增预设" aria-label="新增预设" ${t?"disabled":""}>${n("add")}<span>新建</span></button>
                        <button id="xb-assistant-save" type="button" class="xb-assistant-icon-button ${s.className}" title="${s.title}" aria-label="${s.title}" ${l}>${n(i)}</button>
                    </div>
                </div>
                <div id="xb-assistant-preset-list" class="preset-list" role="list" aria-labelledby="xb-assistant-preset-title"></div>
            </div>`}function k(t={}){const s=String(t?.status||"idle");return s==="saving"?"saving":s==="success"?"success":s==="error"?"error":"save"}function I(t={}){const s=String(t?.status||"idle");return s==="saving"?{className:"xb-assistant-save-button is-saving",title:"正在保存配置"}:s==="success"?{className:"xb-assistant-save-button is-success",title:"配置已保存"}:s==="error"?{className:"xb-assistant-save-button is-error",title:o(t?.error||"保存失败")}:{className:"xb-assistant-save-button",title:"保存配置"}}function C(t,s,{className:i="xb-assistant-icon-button",disabled:l=!1}={}){const a=I(s);t.className=`${i} ${a.className}`,t.title=a.title,t.setAttribute("aria-label",a.title),t.setAttribute("aria-busy",String(s?.status==="saving")),t.toggleAttribute("disabled",l||s?.status==="saving"),t.innerHTML=n(k(s))}function z(t,s={}){if(!t?.querySelector)return;const{configSave:i={},inlineToastText:l="",isBusy:a=!1,canDeletePreset:g=!0,configLoadError:p=""}=s,b=String(p||"").trim(),x=a||!!b||String(i?.status||"")==="saving";["#xb-assistant-save","#xb-assistant-delegate-save"].forEach(e=>{const u=t.querySelector(e);u&&C(u,i,{disabled:x})}),["#xb-assistant-preset-select","#xb-assistant-new-preset","#xb-assistant-rename-preset","#xb-assistant-pull-models","#xb-assistant-delegate-pull-models"].forEach(e=>{t.querySelector(e)?.toggleAttribute("disabled",a)}),t.querySelector("#xb-assistant-delete-preset")?.toggleAttribute("disabled",a||!g);const c=t.querySelector("#xb-assistant-toast");c&&(c.textContent=b||String(l||"")),t.querySelector("[data-xb-agent-config-fields]")?.toggleAttribute("disabled",!!b)}function U(t={}){const{configSave:s={},runtimeText:i="",inlineToastText:l="",showInlineToast:a=!0,showAssistantPermissions:g=!0,showDelegateSettings:p=!0,showWebSettings:b=!0,activePage:x="main",delegatePresetHint:c="DelegateRun 分身会使用这里的独立 API 配置；可以和主助手使用不同 Provider、Base URL、模型和 Tool 调用格式。",isBusy:e=!1,canDeletePreset:u=!0,configLoadError:L="",presetLayout:T="select"}=t,v=String(L||"").trim(),d=I(s),m=k(s),f=e||v||String(s?.status||"")==="saving"?"disabled":"",N=e||!u?"disabled":"",h=x==="delegate"?"delegate":"main",$=h==="main",y=h==="delegate",E=g?`
            <label>
                <span>${o(_)}</span>
                <select id="xb-assistant-jsapi-permission"></select>
            </label>
            <label>
                <span>${o(q)}</span>
                <select id="xb-assistant-permission-mode"></select>
            </label>`:"",B=p?`
            <div class="xb-assistant-config-tabs" role="tablist" aria-label="API 配置分页">
                <button id="xb-assistant-config-tab-main" type="button" class="xb-assistant-config-tab ${$?"is-active":""}" data-config-page="main" role="tab" aria-selected="${$?"true":"false"}">主助手 API</button>
                <button id="xb-assistant-config-tab-delegate" type="button" class="xb-assistant-config-tab ${y?"is-active":""}" data-config-page="delegate" role="tab" aria-selected="${y?"true":"false"}">分身 API</button>
            </div>`:"",R=p?`
            <div class="xb-assistant-config-page" data-config-page-panel="delegate" ${y?"":"hidden"}>
                <p class="xb-assistant-config-note">${o(c)}</p>
                <div class="xb-assistant-preset-row">
                    <select id="xb-assistant-delegate-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                    <div class="xb-assistant-preset-tools is-single" aria-label="分身 API 预设操作">
                        <button id="xb-assistant-delegate-save" type="button" class="xb-assistant-icon-button ${d.className}" title="${d.title}" aria-label="${d.title}" ${f}>${n(m)}</button>
                    </div>
                </div>
                <label>
                    <span>Provider</span>
                    <select id="xb-assistant-delegate-provider">
                        ${M.map(r=>`<option value="${r.value}">${r.label}</option>`).join("")}
                    </select>
                </label>
                ${w("delegate")}
                <label>
                    <span>API Key</span>
                    <div class="xb-assistant-inline-input">
                        <input id="xb-assistant-delegate-api-key" type="password" />
                        <button id="xb-assistant-delegate-toggle-key" type="button" class="secondary ghost">显示</button>
                    </div>
                </label>
                <label>
                    <span>Model</span>
                    <input id="xb-assistant-delegate-model" type="text" />
                </label>
                ${S("delegate")}
                ${P("delegate")}
                <div class="xb-assistant-inline-input xb-assistant-model-row">
                    <label class="xb-assistant-grow">
                        <span>已拉取模型</span>
                        <select id="xb-assistant-delegate-model-pulled">
                            <option value="">手动填写</option>
                        </select>
                    </label>
                    <button id="xb-assistant-delegate-pull-models" type="button" class="secondary" ${e?"disabled":""}>拉取模型</button>
                </div>
                <div class="xb-assistant-inline-status" id="xb-assistant-delegate-model-pull-status" aria-live="polite" hidden></div>
                <label>
                    <span>最大输出 Token</span>
                    <input id="xb-assistant-delegate-max-tokens" type="number" min="1" step="1" inputmode="numeric" />
                </label>
                ${A("delegate")}
                <label id="xb-assistant-delegate-tool-mode-wrap">
                    <span>Tool 调用格式</span>
                    <select id="xb-assistant-delegate-tool-mode"></select>
                </label>
                <label>
                    <span>Reasoning 模式</span>
                    <select id="xb-assistant-delegate-reasoning-mode"></select>
                    <small id="xb-assistant-delegate-reasoning-capability"></small>
                </label>
                <label id="xb-assistant-delegate-reasoning-effort-wrap">
                    <span>思考强度</span>
                    <select id="xb-assistant-delegate-reasoning-effort"></select>
                </label>
                <label id="xb-assistant-delegate-reasoning-budget-wrap">
                    <span>思考 Token 预算</span>
                    <input id="xb-assistant-delegate-reasoning-budget" type="number" step="1" inputmode="numeric" />
                    <small>支持 -1 时表示由模型自动决定</small>
                </label>
            </div>`:"",D=T==="list"?H({isBusy:e,saveButton:d,saveIcon:m,saveDisabled:f}):`<div class="xb-assistant-preset-row">
                <select id="xb-assistant-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                <input id="xb-assistant-preset-name" type="hidden" />
                <div class="xb-assistant-preset-tools" aria-label="API 预设操作">
                    <button id="xb-assistant-new-preset" type="button" class="xb-assistant-icon-button" title="新增预设" aria-label="新增预设" ${e?"disabled":""}>${n("add")}</button>
                    <button id="xb-assistant-rename-preset" type="button" class="xb-assistant-icon-button" title="重命名预设" aria-label="重命名预设" ${e?"disabled":""}>${n("rename")}</button>
                    <button id="xb-assistant-save" type="button" class="xb-assistant-icon-button ${d.className}" title="${d.title}" aria-label="${d.title}" ${f}>${n(m)}</button>
                    <button id="xb-assistant-delete-preset" type="button" class="xb-assistant-icon-button" title="删除预设" aria-label="删除预设" ${N}>${n("delete")}</button>
                </div>
            </div>`;return`
        <section class="xb-assistant-config">
            <fieldset class="xb-assistant-config-fields" data-xb-agent-config-fields ${v?"disabled":""}>
            ${B}
            <div class="xb-assistant-config-page" data-config-page-panel="main" ${$?"":"hidden"}>
            ${D}
            <label>
                <span>Provider</span>
                <select id="xb-assistant-provider">
                    ${M.map(r=>`<option value="${r.value}">${r.label}</option>`).join("")}
                </select>
            </label>
            ${w()}
            <label>
                <span>API Key</span>
                <div class="xb-assistant-inline-input">
                    <input id="xb-assistant-api-key" type="password" />
                    <button id="xb-assistant-toggle-key" type="button" class="secondary ghost">显示</button>
                </div>
            </label>
            <label>
                <span>Model</span>
                <input id="xb-assistant-model" type="text" />
            </label>
            ${S()}
            ${P()}
            <div class="xb-assistant-inline-input xb-assistant-model-row">
                <label class="xb-assistant-grow">
                    <span>已拉取模型</span>
                    <select id="xb-assistant-model-pulled">
                        <option value="">手动填写</option>
                    </select>
                </label>
                <button id="xb-assistant-pull-models" type="button" class="secondary" ${e?"disabled":""}>拉取模型</button>
            </div>
            <div class="xb-assistant-inline-status" id="xb-assistant-model-pull-status" aria-live="polite" hidden></div>
            <label>
                <span>最大输出 Token</span>
                <input id="xb-assistant-max-tokens" type="number" min="1" step="1" inputmode="numeric" />
            </label>
            ${A("main")}
            ${b?O():""}
            <label id="xb-assistant-tool-mode-wrap">
                <span>Tool 调用格式</span>
                <select id="xb-assistant-tool-mode"></select>
            </label>
            ${E}
            <label>
                <span>Reasoning 模式</span>
                <select id="xb-assistant-reasoning-mode"></select>
                <small id="xb-assistant-reasoning-capability"></small>
            </label>
            <label id="xb-assistant-reasoning-effort-wrap">
                <span>思考强度</span>
                <select id="xb-assistant-reasoning-effort"></select>
            </label>
            <label id="xb-assistant-reasoning-budget-wrap">
                <span>思考 Token 预算</span>
                <input id="xb-assistant-reasoning-budget" type="number" step="1" inputmode="numeric" />
                <small>支持 -1 时表示由模型自动决定</small>
            </label>
            </div>
            ${R}
            <div class="xb-assistant-runtime" id="xb-assistant-runtime">${o(i)}</div>
            </fieldset>
            ${a?`<div class="xb-assistant-toast xb-assistant-toast-inline" id="xb-assistant-toast" aria-live="polite">${o(v||l)}</div>`:""}
        </section>
    `}export{C as i,n,z as r,U as t};
