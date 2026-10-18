import{r as q}from"./settings-panel-C2lg92QP.js";function u(t=""){return String(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function A(t="main"){const e=t==="delegate"?"xb-assistant-delegate":"xb-assistant";return`<label id="${e}-model-list-auth-wrap" style="display: none">
        <span>模型列表鉴权</span>
        <select id="${e}-model-list-auth"></select>
    </label>`}function i(t){return`<svg viewBox="0 0 24 24" aria-hidden="true">${{add:'<path d="M12 5v14" /><path d="M5 12h14" />',rename:'<path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />',save:'<path d="M5 21h14a1 1 0 0 0 1-1V7.5L16.5 4H5a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1Z" /><path d="M8 21v-7h8v7" /><path d="M8 4v5h7" />',saving:'<path class="xb-assistant-save-spinner" d="M12 3a9 9 0 1 1-8.2 5.3" />',success:'<path d="M20 6 9 17l-5-5" />',error:'<path d="M18 6 6 18" /><path d="M6 6l12 12" />',delete:'<path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />'}[t]||""}</svg>`}function w(t={}){const e=String(t?.status||"idle");return e==="saving"?"saving":e==="success"?"success":e==="error"?"error":"save"}function S(t={}){const e=String(t?.status||"idle");return e==="saving"?{className:"xb-assistant-save-button is-saving",title:"正在保存配置"}:e==="success"?{className:"xb-assistant-save-button is-success",title:"配置已保存"}:e==="error"?{className:"xb-assistant-save-button is-error",title:u(t?.error||"保存失败")}:{className:"xb-assistant-save-button",title:"保存配置"}}function N(t,e={}){if(!t?.querySelector)return;const{configSave:l={},inlineToastText:g="",isBusy:o=!1,canDeletePreset:x=!0,configLoadError:r=""}=e,b=String(r||"").trim(),p=S(l),v=w(l),a=o||!!b||String(l?.status||"")==="saving";["#xb-assistant-save","#xb-assistant-delegate-save"].forEach(d=>{const s=t.querySelector(d);s&&(s.className=`xb-assistant-icon-button ${p.className}`,s.title=p.title,s.setAttribute("aria-label",p.title),s.toggleAttribute("disabled",a),s.innerHTML=i(v))}),["#xb-assistant-new-preset","#xb-assistant-rename-preset","#xb-assistant-pull-models","#xb-assistant-delegate-pull-models"].forEach(d=>{t.querySelector(d)?.toggleAttribute("disabled",o)}),t.querySelector("#xb-assistant-delete-preset")?.toggleAttribute("disabled",o||!x);const c=t.querySelector("#xb-assistant-toast");c&&(c.textContent=b||String(g||"")),t.querySelector("[data-xb-agent-config-fields]")?.toggleAttribute("disabled",!!b)}function L(t={}){const{configSave:e={},runtimeText:l="",inlineToastText:g="",showInlineToast:o=!0,showAssistantPermissions:x=!0,showDelegateSettings:r=!0,showWebSettings:b=!0,activePage:p="main",delegatePresetHint:v="DelegateRun 分身会使用这里的独立 API 配置；可以和主助手使用不同 Provider、Base URL、模型和 Tool 调用格式。",isBusy:a=!1,canDeletePreset:c=!0,configLoadError:d=""}=t,s=String(d||"").trim(),n=S(e),y=w(e),h=a||s||String(e?.status||"")==="saving"?"disabled":"",M=a||!c?"disabled":"",$=p==="delegate"?"delegate":"main",m=$==="main",f=$==="delegate",k=x?`
            <label>
                <span>斜杠命令权限</span>
                <select id="xb-assistant-permission-mode"></select>
            </label>
            <label>
                <span>JavaScript API 权限</span>
                <select id="xb-assistant-jsapi-permission"></select>
            </label>`:"",I=r?`
            <div class="xb-assistant-config-tabs" role="tablist" aria-label="API 配置分页">
                <button id="xb-assistant-config-tab-main" type="button" class="xb-assistant-config-tab ${m?"is-active":""}" data-config-page="main" role="tab" aria-selected="${m?"true":"false"}">主助手 API</button>
                <button id="xb-assistant-config-tab-delegate" type="button" class="xb-assistant-config-tab ${f?"is-active":""}" data-config-page="delegate" role="tab" aria-selected="${f?"true":"false"}">分身 API</button>
            </div>`:"",P=r?`
            <div class="xb-assistant-config-page" data-config-page-panel="delegate" ${f?"":"hidden"}>
                <p class="xb-assistant-config-note">${u(v)}</p>
                <div class="xb-assistant-preset-row">
                    <select id="xb-assistant-delegate-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                    <div class="xb-assistant-preset-tools is-single" aria-label="分身 API 预设操作">
                        <button id="xb-assistant-delegate-save" type="button" class="xb-assistant-icon-button ${n.className}" title="${n.title}" aria-label="${n.title}" ${h}>${i(y)}</button>
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
                ${A("delegate")}
                <div class="xb-assistant-inline-input xb-assistant-model-row">
                    <label class="xb-assistant-grow">
                        <span>已拉取模型</span>
                        <select id="xb-assistant-delegate-model-pulled">
                            <option value="">手动填写</option>
                        </select>
                    </label>
                    <button id="xb-assistant-delegate-pull-models" type="button" class="secondary" ${a?"disabled":""}>拉取模型</button>
                </div>
                <div class="xb-assistant-inline-status" id="xb-assistant-delegate-model-pull-status" aria-live="polite" hidden></div>
                <label>
                    <span>最大输出 Token</span>
                    <input id="xb-assistant-delegate-max-tokens" type="number" min="1" step="1" inputmode="numeric" />
                </label>
                <div class="xb-assistant-temperature-row">
                    <label>
                        <span>温度</span>
                        <input id="xb-assistant-delegate-temperature" type="number" min="0" max="2" step="0.05" />
                    </label>
                    <label class="xb-assistant-checkbox-row">
                        <span>允许传参</span>
                        <span class="xb-assistant-checkbox-control">
                            <input id="xb-assistant-delegate-send-temperature" type="checkbox" />
                        </span>
                    </label>
                </div>
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
                <label>
                    <span>自定义发送参数 (JSON)</span>
                    <textarea id="xb-assistant-delegate-custom-params" rows="3" spellcheck="false" placeholder="例如: { &quot;top_p&quot;: 0.8, &quot;frequency_penalty&quot;: 0.3 }"></textarea>
                    <small>请求时将作为 JSON 顶层字段合并至 Request Body</small>
                </label>
            </div>`:"";return`
        <section class="xb-assistant-config">
            <fieldset class="xb-assistant-config-fields" data-xb-agent-config-fields ${s?"disabled":""}>
            ${I}
            <div class="xb-assistant-config-page" data-config-page-panel="main" ${m?"":"hidden"}>
            <div class="xb-assistant-preset-row">
                <select id="xb-assistant-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                <input id="xb-assistant-preset-name" type="hidden" />
                <div class="xb-assistant-preset-tools" aria-label="API 预设操作">
                    <button id="xb-assistant-new-preset" type="button" class="xb-assistant-icon-button" title="新增预设" aria-label="新增预设" ${a?"disabled":""}>${i("add")}</button>
                    <button id="xb-assistant-rename-preset" type="button" class="xb-assistant-icon-button" title="重命名预设" aria-label="重命名预设" ${a?"disabled":""}>${i("rename")}</button>
                    <button id="xb-assistant-save" type="button" class="xb-assistant-icon-button ${n.className}" title="${n.title}" aria-label="${n.title}" ${h}>${i(y)}</button>
                    <button id="xb-assistant-delete-preset" type="button" class="xb-assistant-icon-button" title="删除预设" aria-label="删除预设" ${M}>${i("delete")}</button>
                </div>
            </div>
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
            ${A()}
            <div class="xb-assistant-inline-input xb-assistant-model-row">
                <label class="xb-assistant-grow">
                    <span>已拉取模型</span>
                    <select id="xb-assistant-model-pulled">
                        <option value="">手动填写</option>
                    </select>
                </label>
                <button id="xb-assistant-pull-models" type="button" class="secondary" ${a?"disabled":""}>拉取模型</button>
            </div>
            <div class="xb-assistant-inline-status" id="xb-assistant-model-pull-status" aria-live="polite" hidden></div>
            <label>
                <span>最大输出 Token</span>
                <input id="xb-assistant-max-tokens" type="number" min="1" step="1" inputmode="numeric" />
            </label>
            <div class="xb-assistant-temperature-row">
                <label>
                    <span>温度</span>
                    <input id="xb-assistant-temperature" type="number" min="0" max="2" step="0.05" />
                </label>
                <label class="xb-assistant-checkbox-row">
                    <span>允许传参</span>
                    <span class="xb-assistant-checkbox-control">
                        <input id="xb-assistant-send-temperature" type="checkbox" />
                    </span>
                </label>
            </div>
            ${b?q():""}
            <label id="xb-assistant-tool-mode-wrap">
                <span>Tool 调用格式</span>
                <select id="xb-assistant-tool-mode"></select>
            </label>
            ${k}
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
            <label>
                <span>自定义发送参数 (JSON)</span>
                <textarea id="xb-assistant-custom-params" rows="3" spellcheck="false" placeholder="例如: { &quot;top_p&quot;: 0.8, &quot;frequency_penalty&quot;: 0.3 }"></textarea>
                <small>请求时将作为 JSON 顶层字段合并至 Request Body</small>
            </label>
            </div>
            ${P}
            <div class="xb-assistant-runtime" id="xb-assistant-runtime">${u(l)}</div>
            </fieldset>
            ${o?`<div class="xb-assistant-toast xb-assistant-toast-inline" id="xb-assistant-toast" aria-live="polite">${u(s||g)}</div>`:""}
        </section>
    `}export{N as n,L as t};
