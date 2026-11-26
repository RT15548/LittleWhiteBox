import{d as C,n as S,p as H,u as A}from"./provider-resolution-D4Z3Ctpn.js";import{d as G,n as P,o as w}from"./vertex-settings-BaYo-jqQ.js";function n(t=""){return String(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function k(t="main"){const s=t==="delegate"?"xb-assistant-delegate":"xb-assistant";return`<label id="${s}-model-list-auth-wrap" style="display: none">
        <span>模型列表鉴权</span>
        <select id="${s}-model-list-auth"></select>
    </label>`}function I(t="main"){const s=t==="delegate"?"xb-assistant-delegate":"xb-assistant";return`<label>
        <span>Base URL</span>
        <input id="${s}-base-url" type="text" aria-describedby="${s}-base-url-hint" />
        <small id="${s}-base-url-hint" hidden>填写服务地址，不要在末尾加 /v1；系统默认使用 /v1beta。</small>
    </label>`}function l(t){return`<svg viewBox="0 0 24 24" aria-hidden="true">${{add:'<path d="M12 5v14" /><path d="M5 12h14" />',rename:'<path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />',save:'<path d="M5 21h14a1 1 0 0 0 1-1V7.5L16.5 4H5a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1Z" /><path d="M8 21v-7h8v7" /><path d="M8 4v5h7" />',saving:'<path class="xb-assistant-save-spinner" d="M12 3a9 9 0 1 1-8.2 5.3" />',success:'<path d="M20 6 9 17l-5-5" />',error:'<path d="M18 6 6 18" /><path d="M6 6l12 12" />',delete:'<path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />'}[t]||""}</svg>`}function U({isBusy:t,saveButton:s,saveIcon:i,saveDisabled:d}){return`<div class="xb-assistant-preset-row is-list">
                <div class="preset-list-header">
                    <div class="preset-list-title">
                        <button id="xb-assistant-preset-collapse" type="button" class="preset-list-toggle" title="折叠 / 展开" aria-label="折叠预设列表" aria-expanded="true" aria-controls="xb-assistant-preset-list"><i class="fa-solid fa-chevron-down" aria-hidden="true"></i></button>
                        <span class="xb-assistant-preset-title" id="xb-assistant-preset-title">已存预设</span>
                    </div>
                    <input id="xb-assistant-preset-name" type="hidden" />
                    <div class="xb-assistant-preset-tools" aria-label="API 预设操作">
                        <button id="xb-assistant-new-preset" type="button" class="xb-assistant-text-button" title="新增预设" aria-label="新增预设" ${t?"disabled":""}>${l("add")}<span>新建</span></button>
                        <button id="xb-assistant-save" type="button" class="xb-assistant-icon-button ${s.className}" title="${s.title}" aria-label="${s.title}" ${d}>${l(i)}</button>
                    </div>
                </div>
                <div id="xb-assistant-preset-list" class="preset-list" role="list" aria-labelledby="xb-assistant-preset-title"></div>
            </div>`}function T(t={}){const s=String(t?.status||"idle");return s==="saving"?"saving":s==="success"?"success":s==="error"?"error":"save"}function L(t={}){const s=String(t?.status||"idle");return s==="saving"?{className:"xb-assistant-save-button is-saving",title:"正在保存配置"}:s==="success"?{className:"xb-assistant-save-button is-success",title:"配置已保存"}:s==="error"?{className:"xb-assistant-save-button is-error",title:n(t?.error||"保存失败")}:{className:"xb-assistant-save-button",title:"保存配置"}}function V(t,s,{className:i="xb-assistant-icon-button",disabled:d=!1}={}){const a=L(s);t.className=`${i} ${a.className}`,t.title=a.title,t.setAttribute("aria-label",a.title),t.setAttribute("aria-busy",String(s?.status==="saving")),t.toggleAttribute("disabled",d||s?.status==="saving"),t.innerHTML=l(T(s))}function K(t,s={}){if(!t?.querySelector)return;const{configSave:i={},inlineToastText:d="",isBusy:a=!1,canDeletePreset:u=!0,configLoadError:g=""}=s,r=String(g||"").trim(),x=a||!!r||String(i?.status||"")==="saving";["#xb-assistant-save","#xb-assistant-delegate-save"].forEach(p=>{const e=t.querySelector(p);e&&V(e,i,{disabled:x})}),["#xb-assistant-preset-select","#xb-assistant-new-preset","#xb-assistant-rename-preset","#xb-assistant-pull-models","#xb-assistant-delegate-pull-models"].forEach(p=>{t.querySelector(p)?.toggleAttribute("disabled",a)}),t.querySelector("#xb-assistant-delete-preset")?.toggleAttribute("disabled",a||!u);const c=t.querySelector("#xb-assistant-toast");c&&(c.textContent=r||String(d||"")),t.querySelector("[data-xb-agent-config-fields]")?.toggleAttribute("disabled",!!r)}function W(t={}){const{configSave:s={},runtimeText:i="",inlineToastText:d="",showInlineToast:a=!0,showAssistantPermissions:u=!0,showImageInput:g=!1,showDelegateSettings:r=!0,showWebSettings:x=!0,activePage:c="main",delegatePresetHint:p="DelegateRun 分身会使用这里的独立 API 配置；可以和主助手使用不同 Provider、Base URL、模型和 Tool 调用格式。",isBusy:e=!1,canDeletePreset:N=!0,configLoadError:E="",presetLayout:B="select"}=t,m=String(E||"").trim(),o=L(s),v=T(s),$=e||m||String(s?.status||"")==="saving"?"disabled":"",R=e||!N?"disabled":"",h=c==="delegate"?"delegate":"main",f=h==="main",y=h==="delegate",_=u?`
            <label>
                <span>${n(C)}</span>
                <select id="xb-assistant-jsapi-permission"></select>
            </label>
            <label>
                <span>${n(H)}</span>
                <select id="xb-assistant-permission-mode"></select>
            </label>`:"",M=b=>g?`
            <label class="xb-assistant-checkbox-row">
                <span>${n(A.label)}<small>${n(A.hint)}</small></span>
                <span class="xb-assistant-checkbox-control">
                    <input id="${b==="delegate"?"xb-assistant-delegate-model-image-input":"xb-assistant-model-image-input"}" type="checkbox" />
                </span>
            </label>`:"",D=r?`
            <div class="xb-assistant-config-tabs" role="tablist" aria-label="API 配置分页">
                <button id="xb-assistant-config-tab-main" type="button" class="xb-assistant-config-tab ${f?"is-active":""}" data-config-page="main" role="tab" aria-selected="${f?"true":"false"}">主助手 API</button>
                <button id="xb-assistant-config-tab-delegate" type="button" class="xb-assistant-config-tab ${y?"is-active":""}" data-config-page="delegate" role="tab" aria-selected="${y?"true":"false"}">分身 API</button>
            </div>`:"",q=r?`
            <div class="xb-assistant-config-page" data-config-page-panel="delegate" ${y?"":"hidden"}>
                <p class="xb-assistant-config-note">${n(p)}</p>
                <div class="xb-assistant-preset-row">
                    <select id="xb-assistant-delegate-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                    <div class="xb-assistant-preset-tools is-single" aria-label="分身 API 预设操作">
                        <button id="xb-assistant-delegate-save" type="button" class="xb-assistant-icon-button ${o.className}" title="${o.title}" aria-label="${o.title}" ${$}>${l(v)}</button>
                    </div>
                </div>
                <label>
                    <span>Provider</span>
                    <select id="xb-assistant-delegate-provider">
                        ${S.map(b=>`<option value="${b.value}">${b.label}</option>`).join("")}
                    </select>
                </label>
                ${I("delegate")}
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
                ${P("delegate")}
                ${k("delegate")}
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
                ${w("delegate")}
                <label id="xb-assistant-delegate-tool-mode-wrap">
                    <span>Tool 调用格式</span>
                    <select id="xb-assistant-delegate-tool-mode"></select>
                </label>
                ${M("delegate")}
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
            </div>`:"",O=B==="list"?U({isBusy:e,saveButton:o,saveIcon:v,saveDisabled:$}):`<div class="xb-assistant-preset-row">
                <select id="xb-assistant-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                <input id="xb-assistant-preset-name" type="hidden" />
                <div class="xb-assistant-preset-tools" aria-label="API 预设操作">
                    <button id="xb-assistant-new-preset" type="button" class="xb-assistant-icon-button" title="新增预设" aria-label="新增预设" ${e?"disabled":""}>${l("add")}</button>
                    <button id="xb-assistant-rename-preset" type="button" class="xb-assistant-icon-button" title="重命名预设" aria-label="重命名预设" ${e?"disabled":""}>${l("rename")}</button>
                    <button id="xb-assistant-save" type="button" class="xb-assistant-icon-button ${o.className}" title="${o.title}" aria-label="${o.title}" ${$}>${l(v)}</button>
                    <button id="xb-assistant-delete-preset" type="button" class="xb-assistant-icon-button" title="删除预设" aria-label="删除预设" ${R}>${l("delete")}</button>
                </div>
            </div>`;return`
        <section class="xb-assistant-config">
            <fieldset class="xb-assistant-config-fields" data-xb-agent-config-fields ${m?"disabled":""}>
            ${D}
            <div class="xb-assistant-config-page" data-config-page-panel="main" ${f?"":"hidden"}>
            ${O}
            <label>
                <span>Provider</span>
                <select id="xb-assistant-provider">
                    ${S.map(b=>`<option value="${b.value}">${b.label}</option>`).join("")}
                </select>
            </label>
            ${I()}
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
            ${P()}
            ${k()}
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
            ${w("main")}
            ${x?G():""}
            <label id="xb-assistant-tool-mode-wrap">
                <span>Tool 调用格式</span>
                <select id="xb-assistant-tool-mode"></select>
            </label>
            ${M("main")}
            ${_}
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
            ${q}
            <div class="xb-assistant-runtime" id="xb-assistant-runtime">${n(i)}</div>
            </fieldset>
            ${a?`<div class="xb-assistant-toast xb-assistant-toast-inline" id="xb-assistant-toast" aria-live="polite">${n(m||d)}</div>`:""}
        </section>
    `}export{V as i,l as n,K as r,W as t};
