import{r as T}from"./constants-RJ4jNr01.js";import{I as N,M as R,N as f,P as v,j as C,k as _}from"./provider-resolution-JgyZmH2Q.js";import{t as y}from"./installation-CGZi8Y3w.js";function H(){return`<link rel="stylesheet" href="/${encodeURI(T)}/modules/agent-core/ui/web-settings.css">
    <div class="xb-assistant-web-settings"><label><span>${v.provider}</span>
        <select id="xb-assistant-web-provider">${f.map(({id:e,label:t})=>`<option value="${e}">${t}</option>`).join("")}</select>
    </label>${f.map(({id:e,label:t})=>`<label id="xb-assistant-${e}-key-wrap">
        <span>${t} ${v.key}</span>
        <div class="xb-assistant-inline-input">
            <input id="xb-assistant-${e}-api-key" type="password" autocomplete="off" />
            <button id="xb-assistant-toggle-${e}-key" type="button" class="secondary ghost">${v.show}</button>
        </div>
    </label>`).join("")}<div id="xb-assistant-exa-backend-note" class="xb-web-backend-note" hidden>
        <small>${v.exaBackend}</small>
        <button id="xb-assistant-exa-install-guide" class="xb-web-guide-button" type="button" aria-haspopup="dialog">${y.open}</button>
    </div>
    <dialog id="xb-assistant-exa-install-dialog" class="xb-web-install-dialog" aria-labelledby="xb-assistant-exa-install-title">
        <header><h3 id="xb-assistant-exa-install-title">${y.title}</h3>
            <button type="button" id="xb-assistant-exa-install-close" class="xb-web-guide-button" autofocus>${y.close}</button></header>
        <ol id="xb-assistant-exa-install-steps"></ol>
    </dialog></div>`}function te(e){const t=e.querySelector("#xb-assistant-exa-install-dialog");if(!t)return;const s=t.ownerDocument;e.querySelector("#xb-assistant-exa-install-steps").replaceChildren(...y.steps.map(n=>{const a=s.createElement("li");if(a.textContent=n.text,n.code){const l=s.createElement("code");l.textContent=n.code,a.append(l)}return a})),e.querySelector("#xb-assistant-exa-install-guide").addEventListener("click",()=>t.showModal()),e.querySelector("#xb-assistant-exa-install-close").addEventListener("click",()=>t.close())}function se(e,t){return N({webProvider:e.querySelector("#xb-assistant-web-provider")?.value,...Object.fromEntries(f.map(({id:s})=>[`${s}ApiKey`,e.querySelector(`#xb-assistant-${s}-api-key`)?.value]))},t)}function ae(e,t){const s=N(t),n=e.querySelector("#xb-assistant-web-provider");n&&(n.value=s.webProvider);const a=e.querySelector("#xb-assistant-exa-backend-note");a&&(a.hidden=s.webProvider!=="exa");const l=e.querySelector("#xb-assistant-exa-install-dialog");s.webProvider!=="exa"&&l?.open&&l.close();for(const{id:i}of f){const o=e.querySelector(`#xb-assistant-${i}-key-wrap`),b=e.querySelector(`#xb-assistant-${i}-api-key`);o&&(o.style.display=s.webProvider===i?"":"none"),b&&(b.value=s[`${i}ApiKey`])}}var g=Object.freeze({title:"采样参数",temperature:"温度",defaults:"使用接口默认",enable:"启用",enabled:"已启用",disabled:"未启用"}),O=[{key:"temperature",label:g.temperature,min:0,max:2,step:.05,value:1},..._],j=e=>e==="delegate"?"xb-assistant-delegate":"xb-assistant";function E(e="main"){const t=j(e);return`${e==="main"?`<link rel="stylesheet" href="/${encodeURI(T)}/modules/agent-core/ui/sampling-settings.css">`:""}
    <details class="xb-sampling" data-sampling-scope="${e}">
        <summary><span class="xb-sampling-title">${g.title}</span><span class="xb-sampling-summary"></span><span class="xb-sampling-chevron" aria-hidden="true">⌄</span></summary>
        <div class="xb-sampling-fields">${O.map(s=>{const n=`${t}-${s.key}`,a=s.key==="temperature"?`${t}-send-temperature`:`${n}-enabled`;return`<div class="xb-sampling-row" data-sampling-key="${s.key}">
                <label class="xb-sampling-name" for="${n}">${s.label}</label>
                <input id="${n}" type="number" min="${s.min}" ${s.max===void 0?"":`max="${s.max}"`} step="${s.step===1?1:"any"}" inputmode="${s.step===1?"numeric":"decimal"}" required>
                <label class="xb-sampling-toggle" title="${g.enable}${s.label}"><input id="${a}" type="checkbox" role="switch" aria-label="${g.enable}${s.label}"><span aria-hidden="true"></span></label>
            </div>`}).join("")}</div>
    </details>`}function ne(e,t,s,n="main"){const a=j(n),l=C(s);for(const i of R(t)){const o=e.querySelector(`#${a}-${i.key}`),b=e.querySelector(`#${a}-${i.key}-enabled`);if(!o||!b)continue;const d=o.value!==""&&o.validity?.valid!==!1?Number(o.value):l[i.key]?.value??i.value;l[i.key]={enabled:b.checked,value:d}}return l}function M(e){const t=[];for(const s of e.querySelectorAll("[data-sampling-key]")){if(s.hidden)continue;const n=s.querySelector('input[type="checkbox"]'),a=s.querySelector('input[type="number"]');a.disabled=!n.checked,s.dataset.enabled=String(n.checked),s.querySelector(".xb-sampling-toggle").title=n.checked?g.enabled:g.disabled,n.checked&&t.push(`${s.querySelector(".xb-sampling-name").textContent} ${a.value}`)}e.querySelector(".xb-sampling-summary").textContent=t.join(" · ")||g.defaults}function ie(e,{provider:t,temperature:s,sendTemperature:n,sampling:a},l="main"){const i=e.querySelector(`[data-sampling-scope="${l}"]`);if(!i)return;const o=new Set(["temperature",...R(t).map(d=>d.key)]),b=C(a);for(const d of O){const r=i.querySelector(`[data-sampling-key="${d.key}"]`);r.hidden=!o.has(d.key);const c=d.key==="temperature",m=r.querySelector('input[type="number"]');m.value=String(c?s??d.value:b[d.key]?.value??d.value),r.querySelector('input[type="checkbox"]').checked=c?n!==!1:b[d.key]?.enabled===!0,m.disabled=r.hidden||!r.querySelector('input[type="checkbox"]').checked}M(i)}function le(e,t){for(const s of e.querySelectorAll("[data-sampling-scope]"))s.addEventListener("input",()=>{M(s),t()}),s.addEventListener("change",()=>{M(s),t()})}function oe(e){for(const t of e.querySelectorAll('.xb-sampling input[type="number"]'))if(!t.disabled&&t.validity?.valid===!1)return t.closest("details").open=!0,t.reportValidity(),!1;return!0}function x(e=""){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function L(e="main"){const t=e==="delegate"?"xb-assistant-delegate":"xb-assistant";return`<label id="${t}-model-list-auth-wrap" style="display: none">
        <span>模型列表鉴权</span>
        <select id="${t}-model-list-auth"></select>
    </label>`}function p(e){return`<svg viewBox="0 0 24 24" aria-hidden="true">${{add:'<path d="M12 5v14" /><path d="M5 12h14" />',rename:'<path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />',save:'<path d="M5 21h14a1 1 0 0 0 1-1V7.5L16.5 4H5a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1Z" /><path d="M8 21v-7h8v7" /><path d="M8 4v5h7" />',saving:'<path class="xb-assistant-save-spinner" d="M12 3a9 9 0 1 1-8.2 5.3" />',success:'<path d="M20 6 9 17l-5-5" />',error:'<path d="M18 6 6 18" /><path d="M6 6l12 12" />',delete:'<path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />',more:'<circle cx="5" cy="12" r="1.4" fill="currentColor" /><circle cx="12" cy="12" r="1.4" fill="currentColor" /><circle cx="19" cy="12" r="1.4" fill="currentColor" />',copy:'<rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" />'}[e]||""}</svg>`}function P(e,t,s,{disabled:n=!1,danger:a=!1}={}){return`<button type="button" role="menuitem" class="xb-assistant-preset-menu-item${a?" is-danger":""}" data-preset-action="${e}" title="${t}"${n?" disabled":""}>${p(s)}<span>${t}</span></button>`}function K({names:e=[],selectedName:t="",isBusy:s=!1,canDeletePreset:n=!0}={}){return e.map(a=>{const l=String(a),i=x(l),o=l===t;return`
                <div class="xb-assistant-preset-item${o?" is-selected":""}" role="listitem" data-preset-item data-preset-name="${i}">
                    <span class="xb-assistant-preset-drag" role="button" tabindex="0" data-preset-drag title="拖动调整顺序，也可聚焦后按 ↑ / ↓" aria-label="拖动调整预设 ${i} 的顺序">⋮⋮</span>
                    <button type="button" class="xb-assistant-preset-name" data-preset-action="select" title="${i}"${o?' aria-current="true"':""}>${i}</button>
                    <span class="xb-assistant-preset-menu-wrap" data-card-menu>
                        <button type="button" class="xb-assistant-icon-button xb-assistant-preset-menu-button" data-preset-action="menu" title="更多操作" aria-label="更多操作 ${i}" aria-haspopup="menu" aria-expanded="false">${p("more")}</button>
                        <div class="xb-assistant-preset-menu" role="menu" aria-label="更多操作 ${i}" hidden>
                            ${P("rename","重命名","rename",{disabled:s})}
                            ${P("duplicate","复制","copy",{disabled:s})}
                            ${P("delete","删除","delete",{disabled:s||!n,danger:!0})}
                        </div>
                    </span>
                </div>`}).join("")}function Y(e,{isBusy:t=!1,canDeletePreset:s=!0}={}){["rename","duplicate"].forEach(n=>{e?.querySelectorAll?.(`[data-preset-action="${n}"]`)?.forEach?.(a=>a.toggleAttribute("disabled",t))}),e?.querySelectorAll?.('[data-preset-action="delete"]')?.forEach?.(n=>n.toggleAttribute("disabled",t||!s))}function Z({names:e,selectedName:t,isBusy:s,canDeletePreset:n,saveButton:a,saveIcon:l,saveDisabled:i}){return`<div class="xb-assistant-preset-row is-list">
                <div class="xb-assistant-preset-header">
                    <span class="xb-assistant-preset-title" id="xb-assistant-preset-title">已存预设</span>
                    <input id="xb-assistant-preset-name" type="hidden" />
                    <div class="xb-assistant-preset-tools" aria-label="API 预设操作">
                        <button id="xb-assistant-new-preset" type="button" class="xb-assistant-text-button" title="新增预设" aria-label="新增预设" ${s?"disabled":""}>${p("add")}<span>新建</span></button>
                        <button id="xb-assistant-save" type="button" class="xb-assistant-icon-button ${a.className}" title="${a.title}" aria-label="${a.title}" ${i}>${p(l)}</button>
                    </div>
                </div>
                <div id="xb-assistant-preset-list" class="xb-assistant-preset-list" role="list" aria-labelledby="xb-assistant-preset-title">${K({names:e,selectedName:t,isBusy:s,canDeletePreset:n})}</div>
            </div>`}function D(e={}){const t=String(e?.status||"idle");return t==="saving"?"saving":t==="success"?"success":t==="error"?"error":"save"}function F(e={}){const t=String(e?.status||"idle");return t==="saving"?{className:"xb-assistant-save-button is-saving",title:"正在保存配置"}:t==="success"?{className:"xb-assistant-save-button is-success",title:"配置已保存"}:t==="error"?{className:"xb-assistant-save-button is-error",title:x(e?.error||"保存失败")}:{className:"xb-assistant-save-button",title:"保存配置"}}function J(e,t,{className:s="xb-assistant-icon-button",disabled:n=!1}={}){const a=F(t);e.className=`${s} ${a.className}`,e.title=a.title,e.setAttribute("aria-label",a.title),e.setAttribute("aria-busy",String(t?.status==="saving")),e.toggleAttribute("disabled",n||t?.status==="saving"),e.innerHTML=p(D(t))}function re(e,t={}){if(!e?.querySelector)return;const{configSave:s={},inlineToastText:n="",isBusy:a=!1,canDeletePreset:l=!0,configLoadError:i=""}=t,o=String(i||"").trim(),b=a||!!o||String(s?.status||"")==="saving";["#xb-assistant-save","#xb-assistant-delegate-save"].forEach(r=>{const c=e.querySelector(r);c&&J(c,s,{disabled:b})}),["#xb-assistant-preset-select","#xb-assistant-new-preset","#xb-assistant-rename-preset","#xb-assistant-pull-models","#xb-assistant-delegate-pull-models"].forEach(r=>{e.querySelector(r)?.toggleAttribute("disabled",a)}),e.querySelector("#xb-assistant-delete-preset")?.toggleAttribute("disabled",a||!l),Y(e,{isBusy:a,canDeletePreset:l});const d=e.querySelector("#xb-assistant-toast");d&&(d.textContent=o||String(n||"")),e.querySelector("[data-xb-agent-config-fields]")?.toggleAttribute("disabled",!!o)}function de(e={}){const{configSave:t={},runtimeText:s="",inlineToastText:n="",showInlineToast:a=!0,showAssistantPermissions:l=!0,showDelegateSettings:i=!0,showWebSettings:o=!0,activePage:b="main",delegatePresetHint:d="DelegateRun 分身会使用这里的独立 API 配置；可以和主助手使用不同 Provider、Base URL、模型和 Tool 调用格式。",isBusy:r=!1,canDeletePreset:c=!0,configLoadError:m="",presetLayout:G="select",presetNames:$=[],currentPresetName:q=""}=e,h=String(m||"").trim(),u=F(t),S=D(t),k=r||h||String(t?.status||"")==="saving"?"disabled":"",W=r||!c?"disabled":"",I=b==="delegate"?"delegate":"main",w=I==="main",A=I==="delegate",B=l?`
            <label>
                <span>斜杠命令权限</span>
                <select id="xb-assistant-permission-mode"></select>
            </label>
            <label>
                <span>JavaScript API 权限</span>
                <select id="xb-assistant-jsapi-permission"></select>
            </label>`:"",z=i?`
            <div class="xb-assistant-config-tabs" role="tablist" aria-label="API 配置分页">
                <button id="xb-assistant-config-tab-main" type="button" class="xb-assistant-config-tab ${w?"is-active":""}" data-config-page="main" role="tab" aria-selected="${w?"true":"false"}">主助手 API</button>
                <button id="xb-assistant-config-tab-delegate" type="button" class="xb-assistant-config-tab ${A?"is-active":""}" data-config-page="delegate" role="tab" aria-selected="${A?"true":"false"}">分身 API</button>
            </div>`:"",U=i?`
            <div class="xb-assistant-config-page" data-config-page-panel="delegate" ${A?"":"hidden"}>
                <p class="xb-assistant-config-note">${x(d)}</p>
                <div class="xb-assistant-preset-row">
                    <select id="xb-assistant-delegate-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                    <div class="xb-assistant-preset-tools is-single" aria-label="分身 API 预设操作">
                        <button id="xb-assistant-delegate-save" type="button" class="xb-assistant-icon-button ${u.className}" title="${u.title}" aria-label="${u.title}" ${k}>${p(S)}</button>
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
                ${L("delegate")}
                <div class="xb-assistant-inline-input xb-assistant-model-row">
                    <label class="xb-assistant-grow">
                        <span>已拉取模型</span>
                        <select id="xb-assistant-delegate-model-pulled">
                            <option value="">手动填写</option>
                        </select>
                    </label>
                    <button id="xb-assistant-delegate-pull-models" type="button" class="secondary" ${r?"disabled":""}>拉取模型</button>
                </div>
                <div class="xb-assistant-inline-status" id="xb-assistant-delegate-model-pull-status" aria-live="polite" hidden></div>
                <label>
                    <span>最大输出 Token</span>
                    <input id="xb-assistant-delegate-max-tokens" type="number" min="1" step="1" inputmode="numeric" />
                </label>
                ${E("delegate")}
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
            </div>`:"",V=G==="list"?Z({names:$,selectedName:$.includes(q)?q:$[0]??"",isBusy:r,canDeletePreset:c,saveButton:u,saveIcon:S,saveDisabled:k}):`<div class="xb-assistant-preset-row">
                <select id="xb-assistant-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                <input id="xb-assistant-preset-name" type="hidden" />
                <div class="xb-assistant-preset-tools" aria-label="API 预设操作">
                    <button id="xb-assistant-new-preset" type="button" class="xb-assistant-icon-button" title="新增预设" aria-label="新增预设" ${r?"disabled":""}>${p("add")}</button>
                    <button id="xb-assistant-rename-preset" type="button" class="xb-assistant-icon-button" title="重命名预设" aria-label="重命名预设" ${r?"disabled":""}>${p("rename")}</button>
                    <button id="xb-assistant-save" type="button" class="xb-assistant-icon-button ${u.className}" title="${u.title}" aria-label="${u.title}" ${k}>${p(S)}</button>
                    <button id="xb-assistant-delete-preset" type="button" class="xb-assistant-icon-button" title="删除预设" aria-label="删除预设" ${W}>${p("delete")}</button>
                </div>
            </div>`;return`
        <section class="xb-assistant-config">
            <fieldset class="xb-assistant-config-fields" data-xb-agent-config-fields ${h?"disabled":""}>
            ${z}
            <div class="xb-assistant-config-page" data-config-page-panel="main" ${w?"":"hidden"}>
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
            ${L()}
            <div class="xb-assistant-inline-input xb-assistant-model-row">
                <label class="xb-assistant-grow">
                    <span>已拉取模型</span>
                    <select id="xb-assistant-model-pulled">
                        <option value="">手动填写</option>
                    </select>
                </label>
                <button id="xb-assistant-pull-models" type="button" class="secondary" ${r?"disabled":""}>拉取模型</button>
            </div>
            <div class="xb-assistant-inline-status" id="xb-assistant-model-pull-status" aria-live="polite" hidden></div>
            <label>
                <span>最大输出 Token</span>
                <input id="xb-assistant-max-tokens" type="number" min="1" step="1" inputmode="numeric" />
            </label>
            ${E("main")}
            ${o?H():""}
            <label id="xb-assistant-tool-mode-wrap">
                <span>Tool 调用格式</span>
                <select id="xb-assistant-tool-mode"></select>
            </label>
            ${B}
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
            <div class="xb-assistant-runtime" id="xb-assistant-runtime">${x(s)}</div>
            </fieldset>
            ${a?`<div class="xb-assistant-toast xb-assistant-toast-inline" id="xb-assistant-toast" aria-live="polite">${x(h||n)}</div>`:""}
        </section>
    `}export{J as a,ne as c,te as d,se as f,re as i,ie as l,p as n,Y as o,ae as p,K as r,le as s,de as t,oe as u};
