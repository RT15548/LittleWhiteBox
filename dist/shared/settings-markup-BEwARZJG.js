import{r as N}from"./constants-RJ4jNr01.js";import{I as R,M as C,N as $,P as y,j as O,k as _}from"./provider-resolution-JgyZmH2Q.js";import{t as f}from"./installation-CGZi8Y3w.js";function H(){return`<link rel="stylesheet" href="/${encodeURI(N)}/modules/agent-core/ui/web-settings.css">
    <div class="xb-assistant-web-settings"><label><span>${y.provider}</span>
        <select id="xb-assistant-web-provider">${$.map(({id:e,label:t})=>`<option value="${e}">${t}</option>`).join("")}</select>
    </label>${$.map(({id:e,label:t})=>`<label id="xb-assistant-${e}-key-wrap">
        <span>${t} ${y.key}</span>
        <div class="xb-assistant-inline-input">
            <input id="xb-assistant-${e}-api-key" type="password" autocomplete="off" />
            <button id="xb-assistant-toggle-${e}-key" type="button" class="secondary ghost">${y.show}</button>
        </div>
    </label>`).join("")}<div id="xb-assistant-exa-backend-note" class="xb-web-backend-note" hidden>
        <small>${y.exaBackend}</small>
        <button id="xb-assistant-exa-install-guide" class="xb-web-guide-button" type="button" aria-haspopup="dialog">${f.open}</button>
    </div>
    <dialog id="xb-assistant-exa-install-dialog" class="xb-web-install-dialog" aria-labelledby="xb-assistant-exa-install-title">
        <header><h3 id="xb-assistant-exa-install-title">${f.title}</h3>
            <button type="button" id="xb-assistant-exa-install-close" class="xb-web-guide-button" autofocus>${f.close}</button></header>
        <ol id="xb-assistant-exa-install-steps"></ol>
    </dialog></div>`}function ee(e){const t=e.querySelector("#xb-assistant-exa-install-dialog");if(!t)return;const s=t.ownerDocument;e.querySelector("#xb-assistant-exa-install-steps").replaceChildren(...f.steps.map(a=>{const n=s.createElement("li");if(n.textContent=a.text,a.code){const l=s.createElement("code");l.textContent=a.code,n.append(l)}return n})),e.querySelector("#xb-assistant-exa-install-guide").addEventListener("click",()=>t.showModal()),e.querySelector("#xb-assistant-exa-install-close").addEventListener("click",()=>t.close())}function te(e,t){return R({webProvider:e.querySelector("#xb-assistant-web-provider")?.value,...Object.fromEntries($.map(({id:s})=>[`${s}ApiKey`,e.querySelector(`#xb-assistant-${s}-api-key`)?.value]))},t)}function se(e,t){const s=R(t),a=e.querySelector("#xb-assistant-web-provider");a&&(a.value=s.webProvider);const n=e.querySelector("#xb-assistant-exa-backend-note");n&&(n.hidden=s.webProvider!=="exa");const l=e.querySelector("#xb-assistant-exa-install-dialog");s.webProvider!=="exa"&&l?.open&&l.close();for(const{id:i}of $){const o=e.querySelector(`#xb-assistant-${i}-key-wrap`),b=e.querySelector(`#xb-assistant-${i}-api-key`);o&&(o.style.display=s.webProvider===i?"":"none"),b&&(b.value=s[`${i}ApiKey`])}}var m=Object.freeze({title:"采样参数",temperature:"温度",defaults:"使用接口默认",enable:"启用",enabled:"已启用",disabled:"未启用"}),j=[{key:"temperature",label:m.temperature,min:0,max:2,step:.05,value:1},..._],D=e=>e==="delegate"?"xb-assistant-delegate":"xb-assistant";function L(e="main"){const t=D(e);return`${e==="main"?`<link rel="stylesheet" href="/${encodeURI(N)}/modules/agent-core/ui/sampling-settings.css">`:""}
    <details class="xb-sampling" data-sampling-scope="${e}">
        <summary><span class="xb-sampling-title">${m.title}</span><span class="xb-sampling-summary"></span><span class="xb-sampling-chevron" aria-hidden="true">⌄</span></summary>
        <div class="xb-sampling-fields">${j.map(s=>{const a=`${t}-${s.key}`,n=s.key==="temperature"?`${t}-send-temperature`:`${a}-enabled`;return`<div class="xb-sampling-row" data-sampling-key="${s.key}">
                <label class="xb-sampling-name" for="${a}">${s.label}</label>
                <input id="${a}" type="number" min="${s.min}" ${s.max===void 0?"":`max="${s.max}"`} step="${s.step===1?1:"any"}" inputmode="${s.step===1?"numeric":"decimal"}" required>
                <label class="xb-sampling-toggle" title="${m.enable}${s.label}"><input id="${n}" type="checkbox" role="switch" aria-label="${m.enable}${s.label}"><span aria-hidden="true"></span></label>
            </div>`}).join("")}</div>
    </details>`}function ae(e,t,s,a="main"){const n=D(a),l=O(s);for(const i of C(t)){const o=e.querySelector(`#${n}-${i.key}`),b=e.querySelector(`#${n}-${i.key}-enabled`);if(!o||!b)continue;const r=o.value!==""&&o.validity?.valid!==!1?Number(o.value):l[i.key]?.value??i.value;l[i.key]={enabled:b.checked,value:r}}return l}function q(e){const t=[];for(const s of e.querySelectorAll("[data-sampling-key]")){if(s.hidden)continue;const a=s.querySelector('input[type="checkbox"]'),n=s.querySelector('input[type="number"]');n.disabled=!a.checked,s.dataset.enabled=String(a.checked),s.querySelector(".xb-sampling-toggle").title=a.checked?m.enabled:m.disabled,a.checked&&t.push(`${s.querySelector(".xb-sampling-name").textContent} ${n.value}`)}e.querySelector(".xb-sampling-summary").textContent=t.join(" · ")||m.defaults}function ne(e,{provider:t,temperature:s,sendTemperature:a,sampling:n},l="main"){const i=e.querySelector(`[data-sampling-scope="${l}"]`);if(!i)return;const o=new Set(["temperature",...C(t).map(r=>r.key)]),b=O(n);for(const r of j){const d=i.querySelector(`[data-sampling-key="${r.key}"]`);d.hidden=!o.has(r.key);const c=r.key==="temperature",u=d.querySelector('input[type="number"]');u.value=String(c?s??r.value:b[r.key]?.value??r.value),d.querySelector('input[type="checkbox"]').checked=c?a!==!1:b[r.key]?.enabled===!0,u.disabled=d.hidden||!d.querySelector('input[type="checkbox"]').checked}q(i)}function ie(e,t){for(const s of e.querySelectorAll("[data-sampling-scope]"))s.addEventListener("input",()=>{q(s),t()}),s.addEventListener("change",()=>{q(s),t()})}function le(e){for(const t of e.querySelectorAll('.xb-sampling input[type="number"]'))if(!t.disabled&&t.validity?.valid===!1)return t.closest("details").open=!0,t.reportValidity(),!1;return!0}function v(e=""){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function T(e="main"){const t=e==="delegate"?"xb-assistant-delegate":"xb-assistant";return`<label id="${t}-model-list-auth-wrap" style="display: none">
        <span>模型列表鉴权</span>
        <select id="${t}-model-list-auth"></select>
    </label>`}function p(e){return`<svg viewBox="0 0 24 24" aria-hidden="true">${{add:'<path d="M12 5v14" /><path d="M5 12h14" />',rename:'<path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />',save:'<path d="M5 21h14a1 1 0 0 0 1-1V7.5L16.5 4H5a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1Z" /><path d="M8 21v-7h8v7" /><path d="M8 4v5h7" />',saving:'<path class="xb-assistant-save-spinner" d="M12 3a9 9 0 1 1-8.2 5.3" />',success:'<path d="M20 6 9 17l-5-5" />',error:'<path d="M18 6 6 18" /><path d="M6 6l12 12" />',delete:'<path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />',more:'<circle cx="5" cy="12" r="1.4" fill="currentColor" /><circle cx="12" cy="12" r="1.4" fill="currentColor" /><circle cx="19" cy="12" r="1.4" fill="currentColor" />',copy:'<rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" />'}[e]||""}</svg>`}function M(e,t,s,{disabled:a=!1,danger:n=!1}={}){return`<button type="button" role="menuitem" class="xb-assistant-preset-menu-item${n?" is-danger":""}" data-preset-action="${e}" title="${t}"${a?" disabled":""}>${p(s)}<span>${t}</span></button>`}function K({names:e=[],selectedName:t="",isBusy:s=!1,canDeletePreset:a=!0}={}){return e.map(n=>{const l=String(n),i=v(l),o=l===t;return`
                <div class="xb-assistant-preset-item${o?" is-selected":""}" role="listitem" data-preset-item data-preset-name="${i}">
                    <span class="xb-assistant-preset-drag" role="button" tabindex="0" data-preset-drag title="拖动调整顺序，也可聚焦后按 ↑ / ↓" aria-label="拖动调整预设 ${i} 的顺序">⋮⋮</span>
                    <button type="button" class="xb-assistant-preset-name" data-preset-action="select" title="${i}"${o?' aria-current="true"':""}>${i}</button>
                    <span class="xb-assistant-preset-menu-wrap" data-card-menu>
                        <button type="button" class="xb-assistant-icon-button xb-assistant-preset-menu-button" data-preset-action="menu" title="更多操作" aria-label="更多操作 ${i}" aria-haspopup="menu" aria-expanded="false">${p("more")}</button>
                        <div class="xb-assistant-preset-menu" role="menu" aria-label="更多操作 ${i}" hidden>
                            ${M("rename","重命名","rename",{disabled:s})}
                            ${M("duplicate","复制","copy",{disabled:s})}
                            ${M("delete","删除","delete",{disabled:s||!a,danger:!0})}
                        </div>
                    </span>
                </div>`}).join("")}function Y(e,{isBusy:t=!1,canDeletePreset:s=!0}={}){["rename","duplicate"].forEach(a=>{e?.querySelectorAll?.(`[data-preset-action="${a}"]`)?.forEach?.(n=>n.toggleAttribute("disabled",t))}),e?.querySelectorAll?.('[data-preset-action="delete"]')?.forEach?.(a=>a.toggleAttribute("disabled",t||!s))}function Z({names:e,selectedName:t,isBusy:s,canDeletePreset:a,saveButton:n,saveIcon:l,saveDisabled:i}){return`<div class="xb-assistant-preset-row is-list">
                <div class="xb-assistant-preset-header">
                    <span class="xb-assistant-preset-title" id="xb-assistant-preset-title">已存预设</span>
                    <input id="xb-assistant-preset-name" type="hidden" />
                    <div class="xb-assistant-preset-tools" aria-label="API 预设操作">
                        <button id="xb-assistant-new-preset" type="button" class="xb-assistant-text-button" title="新增预设" aria-label="新增预设" ${s?"disabled":""}>${p("add")}<span>新建</span></button>
                        <button id="xb-assistant-save" type="button" class="xb-assistant-icon-button ${n.className}" title="${n.title}" aria-label="${n.title}" ${i}>${p(l)}</button>
                    </div>
                </div>
                <div id="xb-assistant-preset-list" class="xb-assistant-preset-list" role="list" aria-labelledby="xb-assistant-preset-title">${K({names:e,selectedName:t,isBusy:s,canDeletePreset:a})}</div>
            </div>`}function F(e={}){const t=String(e?.status||"idle");return t==="saving"?"saving":t==="success"?"success":t==="error"?"error":"save"}function G(e={}){const t=String(e?.status||"idle");return t==="saving"?{className:"xb-assistant-save-button is-saving",title:"正在保存配置"}:t==="success"?{className:"xb-assistant-save-button is-success",title:"配置已保存"}:t==="error"?{className:"xb-assistant-save-button is-error",title:v(e?.error||"保存失败")}:{className:"xb-assistant-save-button",title:"保存配置"}}function oe(e,t={}){if(!e?.querySelector)return;const{configSave:s={},inlineToastText:a="",isBusy:n=!1,canDeletePreset:l=!0,configLoadError:i=""}=t,o=String(i||"").trim(),b=G(s),r=F(s),d=n||!!o||String(s?.status||"")==="saving";["#xb-assistant-save","#xb-assistant-delegate-save"].forEach(u=>{const g=e.querySelector(u);g&&(g.className=`xb-assistant-icon-button ${b.className}`,g.title=b.title,g.setAttribute("aria-label",b.title),g.toggleAttribute("disabled",d),g.innerHTML=p(r))}),["#xb-assistant-preset-select","#xb-assistant-new-preset","#xb-assistant-rename-preset","#xb-assistant-pull-models","#xb-assistant-delegate-pull-models"].forEach(u=>{e.querySelector(u)?.toggleAttribute("disabled",n)}),e.querySelector("#xb-assistant-delete-preset")?.toggleAttribute("disabled",n||!l),Y(e,{isBusy:n,canDeletePreset:l});const c=e.querySelector("#xb-assistant-toast");c&&(c.textContent=o||String(a||"")),e.querySelector("[data-xb-agent-config-fields]")?.toggleAttribute("disabled",!!o)}function re(e={}){const{configSave:t={},runtimeText:s="",inlineToastText:a="",showInlineToast:n=!0,showAssistantPermissions:l=!0,showDelegateSettings:i=!0,showWebSettings:o=!0,activePage:b="main",delegatePresetHint:r="DelegateRun 分身会使用这里的独立 API 配置；可以和主助手使用不同 Provider、Base URL、模型和 Tool 调用格式。",isBusy:d=!1,canDeletePreset:c=!0,configLoadError:u="",presetLayout:g="select",presetNames:h=[],currentPresetName:I=""}=e,S=String(u||"").trim(),x=G(t),k=F(t),w=d||S||String(t?.status||"")==="saving"?"disabled":"",W=d||!c?"disabled":"",E=b==="delegate"?"delegate":"main",A=E==="main",P=E==="delegate",z=l?`
            <label>
                <span>斜杠命令权限</span>
                <select id="xb-assistant-permission-mode"></select>
            </label>
            <label>
                <span>JavaScript API 权限</span>
                <select id="xb-assistant-jsapi-permission"></select>
            </label>`:"",B=i?`
            <div class="xb-assistant-config-tabs" role="tablist" aria-label="API 配置分页">
                <button id="xb-assistant-config-tab-main" type="button" class="xb-assistant-config-tab ${A?"is-active":""}" data-config-page="main" role="tab" aria-selected="${A?"true":"false"}">主助手 API</button>
                <button id="xb-assistant-config-tab-delegate" type="button" class="xb-assistant-config-tab ${P?"is-active":""}" data-config-page="delegate" role="tab" aria-selected="${P?"true":"false"}">分身 API</button>
            </div>`:"",U=i?`
            <div class="xb-assistant-config-page" data-config-page-panel="delegate" ${P?"":"hidden"}>
                <p class="xb-assistant-config-note">${v(r)}</p>
                <div class="xb-assistant-preset-row">
                    <select id="xb-assistant-delegate-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                    <div class="xb-assistant-preset-tools is-single" aria-label="分身 API 预设操作">
                        <button id="xb-assistant-delegate-save" type="button" class="xb-assistant-icon-button ${x.className}" title="${x.title}" aria-label="${x.title}" ${w}>${p(k)}</button>
                    </div>
                </div>
                <label>
                    <span>Provider</span>
                    <select id="xb-assistant-delegate-provider">
                        <option value="openai-responses">OpenAI Responses</option>
                        <option value="openai-compatible">OpenAI 兼容</option>
                        <option value="sillytavern-openai-compatible">酒馆 OpenAI 兼容</option>
                        <option value="sillytavern-claude">酒馆 Claude</option>
                        <option value="sillytavern-google">酒馆 Google AI</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="google">Google AI</option>
                    </select>
                </label>
                <label>
                    <span>Base URL</span>
                    <input id="xb-assistant-delegate-base-url" type="text" />
                </label>
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
                ${T("delegate")}
                <div class="xb-assistant-inline-input xb-assistant-model-row">
                    <label class="xb-assistant-grow">
                        <span>已拉取模型</span>
                        <select id="xb-assistant-delegate-model-pulled">
                            <option value="">手动填写</option>
                        </select>
                    </label>
                    <button id="xb-assistant-delegate-pull-models" type="button" class="secondary" ${d?"disabled":""}>拉取模型</button>
                </div>
                <div class="xb-assistant-inline-status" id="xb-assistant-delegate-model-pull-status" aria-live="polite" hidden></div>
                <label>
                    <span>最大输出 Token</span>
                    <input id="xb-assistant-delegate-max-tokens" type="number" min="1" step="1" inputmode="numeric" />
                </label>
                ${L("delegate")}
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
            </div>`:"",V=g==="list"?Z({names:h,selectedName:h.includes(I)?I:h[0]??"",isBusy:d,canDeletePreset:c,saveButton:x,saveIcon:k,saveDisabled:w}):`<div class="xb-assistant-preset-row">
                <select id="xb-assistant-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                <input id="xb-assistant-preset-name" type="hidden" />
                <div class="xb-assistant-preset-tools" aria-label="API 预设操作">
                    <button id="xb-assistant-new-preset" type="button" class="xb-assistant-icon-button" title="新增预设" aria-label="新增预设" ${d?"disabled":""}>${p("add")}</button>
                    <button id="xb-assistant-rename-preset" type="button" class="xb-assistant-icon-button" title="重命名预设" aria-label="重命名预设" ${d?"disabled":""}>${p("rename")}</button>
                    <button id="xb-assistant-save" type="button" class="xb-assistant-icon-button ${x.className}" title="${x.title}" aria-label="${x.title}" ${w}>${p(k)}</button>
                    <button id="xb-assistant-delete-preset" type="button" class="xb-assistant-icon-button" title="删除预设" aria-label="删除预设" ${W}>${p("delete")}</button>
                </div>
            </div>`;return`
        <section class="xb-assistant-config">
            <fieldset class="xb-assistant-config-fields" data-xb-agent-config-fields ${S?"disabled":""}>
            ${B}
            <div class="xb-assistant-config-page" data-config-page-panel="main" ${A?"":"hidden"}>
            ${V}
            <label>
                <span>Provider</span>
                <select id="xb-assistant-provider">
                    <option value="openai-responses">OpenAI Responses</option>
                    <option value="openai-compatible">OpenAI 兼容</option>
                    <option value="sillytavern-openai-compatible">酒馆 OpenAI 兼容</option>
                    <option value="sillytavern-claude">酒馆 Claude</option>
                    <option value="sillytavern-google">酒馆 Google AI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="google">Google AI</option>
                </select>
            </label>
            <label>
                <span>Base URL</span>
                <input id="xb-assistant-base-url" type="text" />
            </label>
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
            ${T()}
            <div class="xb-assistant-inline-input xb-assistant-model-row">
                <label class="xb-assistant-grow">
                    <span>已拉取模型</span>
                    <select id="xb-assistant-model-pulled">
                        <option value="">手动填写</option>
                    </select>
                </label>
                <button id="xb-assistant-pull-models" type="button" class="secondary" ${d?"disabled":""}>拉取模型</button>
            </div>
            <div class="xb-assistant-inline-status" id="xb-assistant-model-pull-status" aria-live="polite" hidden></div>
            <label>
                <span>最大输出 Token</span>
                <input id="xb-assistant-max-tokens" type="number" min="1" step="1" inputmode="numeric" />
            </label>
            ${L("main")}
            ${o?H():""}
            <label id="xb-assistant-tool-mode-wrap">
                <span>Tool 调用格式</span>
                <select id="xb-assistant-tool-mode"></select>
            </label>
            ${z}
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
            ${U}
            <div class="xb-assistant-runtime" id="xb-assistant-runtime">${v(s)}</div>
            </fieldset>
            ${n?`<div class="xb-assistant-toast xb-assistant-toast-inline" id="xb-assistant-toast" aria-live="polite">${v(S||a)}</div>`:""}
        </section>
    `}export{Y as a,ne as c,te as d,se as f,oe as i,le as l,p as n,ie as o,K as r,ae as s,re as t,ee as u};
