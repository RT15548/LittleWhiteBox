import{n as R,t as te}from"./async-errors-C4kfchr9.js";import{a as q}from"./panel-escape-Cs2M9fDW.js";import{$ as Fe,C as Le,Ft as L,P as Te,S as ae,St as $e,_t as w,b as Ie,i as De,r as Be,wt as H}from"./gallery-cache-BtPO_egh.js";import{Gt as je,a as Ge,dn as se,h as ze,mn as re,u as qe}from"./html-escape-0qtTuOZD.js";import{t as B}from"./gallery-image-codec-DGZpcasX.js";import{T as ne,a as Pe}from"./draw-common-BXV3PRzN.js";import{t as _e}from"./textarea-autofit-OixiAzbB.js";import{r as Ue}from"./agent-settings-surface-CnNf7hEs.js";import{a as Me,c as Oe,i as Je,l as Re,n as He,o as Ye,r as Ve,s as We}from"./api-preset-page-CGzBWweV.js";function nt({getSettingsDocument:C,updateStatusText:h,runSaveButtonTask:P,withSaveTimeout:N,onCharacterChange:_=()=>{},danbooruReady:A,buildChatGalleryCallbacks:Y,getWorldbooks:V=()=>w().worldbooks,setWorldbooks:W=l=>{w().worldbooks=l}}){const l=globalThis.document,f=e=>C()?.getElementById(e),b=e=>C()?.querySelector(e),K=e=>Array.from(C()?.querySelectorAll(e)||[]),le=e=>f(e)?.value||"",ie=(e,a)=>{const t=f(e);t&&(t.value=String(a))};let g=null,j=null,k=null;function oe(e,a){return Y?Y(e,a):{onUse:(t,s,i)=>R(i?.savedUrl?ne(s,i,{slotId:t}):Pe(s,t),{source:import.meta.url,operation:"useGalleryImage"}),onSave:te(async(t,s)=>{const i=await ae(t);i&&await ne(a,i,{slotId:e,savedUrl:s}),await S()},{source:import.meta.url,operation:"saveGalleryImage"}),onDelete:S,onBecameEmpty:S}}function X(e=0){return!Number.isFinite(e)||e<=0?"0 MB":`${(e/1024/1024).toFixed(1)} MB`}async function S(){const e=f("sd-gallery-container"),a=f("sd-gallery-empty"),t=f("sd-gallery-count"),s=f("sd-gallery-size"),i=f("sd-gallery-cache-days");if(!e||!a||!t||!s)return;i&&(i.value=String(w().cacheDays)),e.textContent="加载中...",a.style.display="none";let r={};try{r=await Ie()}catch(d){console.warn("[Draw settings] getGallerySummary failed:",d)}const n=Object.keys(r),o=n.reduce((d,p)=>d+(r[p]?.count||0),0),u=n.reduce((d,p)=>d+(r[p]?.totalSize||0),0);if(t.textContent=String(o),s.textContent=X(u),!n.length){e.textContent="",a.style.display="block";return}n.sort((d,p)=>(r[p].latestTimestamp||0)-(r[d].latestTimestamp||0)),e.replaceChildren();for(const d of n){const p=r[d],m=p.slots||{},y=Object.keys(m).sort((I,M)=>(m[M]?.latestTimestamp||0)-(m[I]?.latestTimestamp||0)),v=l.createElement("div");v.className="gallery-char-card";const x=l.createElement("div");x.className="gallery-char-head";const c=l.createElement("div");c.className="gallery-char-name",c.textContent=d;const T=l.createElement("div");T.className="gallery-char-meta",T.textContent=`${p.count||0} 张 · ${y.length} 组 · ${X(p.totalSize||0)}`,x.append(c,T);const $=l.createElement("div");$.className="gallery-slots",y.slice(0,8).forEach((I,M)=>{const D=l.createElement("button");D.type="button",D.className="gallery-slot-btn",D.addEventListener("click",te(async()=>{await Te(m[I].latestImgId,oe,S)},{source:import.meta.url,operation:"callback"}));const G=l.createElement("img");G.className="gallery-slot-thumb",G.alt="",ae(m[I]?.latestImgId).then(z=>{z&&(G.src=Le(z))}).catch(z=>{console.warn({source:import.meta.url,operation:"renderGalleryManagement"},z)});const O=l.createElement("div");O.className="gallery-slot-title",O.textContent=`图组 ${M+1}`;const J=l.createElement("div");J.className="gallery-slot-sub",J.textContent=`${m[I]?.count||1} 个版本`,D.append(G,O,J),$.appendChild(D)}),v.append(x,$),e.appendChild(v)}}function Q({keepEmpty:e=!1}={}){const a=new Map((w().characterTags||[]).map(t=>[String(t.id||""),t]).filter(([t])=>t));return K(".sd-char-card").map((t,s)=>{const i={...a.get(String(t.dataset.characterId||""))||{}};return delete i.groupId,Ve({...i,id:t.dataset.characterId||`sd-char-${Date.now()}-${s}`,enabled:Oe(t),name:String(t.querySelector('[data-sd-char-field="name"]')?.value||"").trim(),aliases:String(t.querySelector('[data-sd-char-field="aliases"]')?.value||"").split(",").map(r=>r.trim()).filter(Boolean),type:String(t.querySelector('[data-sd-char-field="type"]')?.value||"girl").trim()||"girl",appearance:String(t.querySelector('[data-sd-char-field="appearance"]')?.value||"").trim(),negativeTags:String(t.querySelector('[data-sd-char-field="negativeTags"]')?.value||"").trim(),danbooruTag:A?String(t.querySelector('[data-sd-char-field="danbooruTag"]')?.value||"").trim():i.danbooruTag,outfits:se(t.querySelector('[data-sd-char-field="outfits"]')?.value||""),dynamicStates:se(t.querySelector('[data-sd-char-field="dynamicStates"]')?.value||"")},t,{keepEmpty:e})}).filter(t=>e||t.name||t.appearance||t.danbooruTag||t.negativeTags||t.aliases.length||t.outfits?.length||t.dynamicStates?.length||t.forms?.length)}function ce(){return g?g.getCharacters():Q()}function de(){return g?g.getGroups():w().characterGroups||[]}function F(){const e=C(),a=b("#sd-shared-character-list"),t=b("#sd-shared-character-toolbar");return!e||!a||!t?null:(g?.document===e||(g?.destroy(),j?.dispose(),j=_e(a),g=Ye({document:e,listElement:a,toolbarElement:t,searchInput:b("#sd-char-search"),readCharacters:Q,renderCard:ve,renderEmpty:fe,onChange:_,notify:{success:s=>L.success(s),warning:s=>L.warning(s),error:s=>L.error(s)}})),g)}function pe(){ue(),g?.destroy(),g=null,j?.dispose(),j=null}function me(){const e=C(),a=b("#sd-group-preset-root"),t=g;return!e||!a||!t?null:k?.document===e?(k.render(),k):(k?.destroy(),k=He({document:e,container:a,getLibrary:()=>t.getLibrary(),syncGroupEnabled:(s,i)=>t.syncGroupEnabled(s,i),runtime:Ue,settings:{get:w},toast:(s,i)=>{(L[i]||L.info).call(L,s)}}),k)}function ue(){k?.destroy(),k=null}function ye(e=[],a){const t=F();t&&t.render({characters:e,groups:a??t.getGroups()})}function fe(){const e=l.createElement("div");e.className="char-empty sd-char-empty";const a=l.createElement("i");a.className="fa-solid fa-user-plus";const t=l.createElement("strong");t.textContent="暂无角色配置";const s=l.createElement("p");return s.textContent="添加角色，保存外貌与服装标签。",e.append(a,t,s),e}function ve({character:e,ordinal:a}){const t=a-1,s=l.createElement("details");s.className="sd-char-card",s.open=!e.name,s.dataset.characterId=String(e.id||`sd-char-${t+1}`);const i=l.createElement("summary");i.className="sd-char-card-header";const r=l.createElement("div");r.className="sd-char-card-title";const n=l.createElement("i");n.className="fa-solid fa-user-group";const o=l.createElement("span");o.textContent=e.name||`角色 ${t+1}`,r.append(n,o);const u=l.createElement("button");u.className="btn btn-danger btn-sm",u.type="button",u.dataset.sdCharDelete=s.dataset.characterId;const d=l.createElement("i");d.className="fa-solid fa-trash";const p=l.createElement("span");p.textContent="删除",u.append(d,p);const m=l.createElement("div");m.className="btn-group";const y=We(l,s,{enabled:e.enabled!==!1,label:`角色 ${t+1}${e.name?` ${e.name}`:""}`});if(m.append(y),A){const c=l.createElement("button");c.className="btn btn-sm",c.type="button",c.dataset.sdCharDanbooru=s.dataset.characterId,A()||(c.disabled=!0,c.style.opacity="0.35");const T=l.createElement("i");T.className="fa-solid fa-magnifying-glass";const $=l.createElement("span");$.textContent="Danbooru",c.append(T,$),m.append(c)}m.append(u),i.append(r,m);const v=l.createElement("div");v.className="form-row",v.append(E("角色名","name",e.name||"","例如 芙蕾雅"),E("类型","type",e.type||"girl","例如 girl / boy"));const x=E("形态名称（可选）","formName",e.formName||"","形态名称");if(s.append(i,v,E("别名（逗号分隔）","aliases",(e.aliases||[]).join(", "),"例如 小芙, Freya"),x,Je({document:l,createField:E,values:e}),...A?[E("Danbooru Tag","danbooruTag",e.danbooruTag||"","可选，用于兼容原有角色提示逻辑")]:[],E("服装参考（每行一套，行首加 # 停用）","outfits",re(e.outfits||[]),"校服 = white shirt, pleated skirt",{multiline:!0}),E(`${qe.title}（每行一条，行首加 # 停用）`,"dynamicStates",re(e.dynamicStates||[]),"脸红 = blush, looking away",{multiline:!0}),Me({document:l,forms:e.forms||[],createField:E})),A){const c=l.createElement("div");c.className="danbooru-panel hidden",c.dataset.charId=s.dataset.characterId,s.appendChild(c)}return s.appendChild(ze(l)),s.addEventListener("input",c=>{c.target.dataset.sdCharField==="name"&&(o.textContent=c.target.value||`角色 ${t+1}`)}),s}function E(e,a,t,s,i={}){const r=l.createElement("div");r.className="form-group";const n=l.createElement("label");n.className="form-label",n.textContent=e,r.appendChild(n);const o=l.createElement(i.multiline?"textarea":"input");return o.className="input",o.dataset[i.dataKey||"sdCharField"]=a,o.placeholder=s,i.multiline?(o.rows=1,o.setAttribute("data-autofit",""),o.textContent=String(t||"")):(o.type="text",o.value=String(t||"")),r.appendChild(o),r}function ge(){F()?.addCharacter()}function he(){const e=F(),a=e?e.getCharacters({keepEmpty:!0}):[];if(!a.length){L.warning("没有角色可清除");return}confirm(`确定清空全部 ${a.length} 个角色？分组会保留；点击“保存角色”前不会真正生效。`)&&e.clearCharacters()}function be(){F()?.openExportDialog()}async function xe(e){const a=e?.files?.[0];try{a&&await F()?.importFile(a)}finally{e&&(e.value="")}}function we(e=""){F()?.deleteCharacters([String(e||"")])}function Z(e={start:"",end:""}){const a=f("sd-filter-rules-list");if(!a)return;const t=l.createElement("div");t.className="filter-rule-row";const s=l.createElement("input");s.type="text",s.placeholder="起始标记",s.value=String(e.start||""),s.dataset.sdFilterField="start";const i=l.createElement("span");i.className="rule-arrow",i.textContent="→";const r=l.createElement("input");r.type="text",r.placeholder="结束标记",r.value=String(e.end||""),r.dataset.sdFilterField="end";const n=l.createElement("input");n.type="checkbox",n.className="rule-keep",n.title="发给 AI",n.setAttribute("aria-label","发给 AI"),n.checked=e.keep===!0,n.dataset.sdFilterField="keep";const o=l.createElement("button");o.type="button",o.className="btn-del-rule",o.textContent="×",o.addEventListener("click",()=>t.remove()),t.append(Ge(l),s,i,r,n,o),a.appendChild(t)}function Ee(e=[]){const a=f("sd-filter-rules-list");a&&(a.textContent="",(Array.isArray(e)&&e.length?e:je).forEach(t=>Z(t)))}function Ce(){return K("#sd-filter-rules-list .filter-rule-row").map(e=>{const a={start:String(e.querySelector('[data-sd-filter-field="start"]')?.value||"").trim(),end:String(e.querySelector('[data-sd-filter-field="end"]')?.value||"").trim()};return e.querySelector('[data-sd-filter-field="keep"]')?.checked&&(a.keep=!0),a}).filter(e=>e.start||e.end)}function ke(e,a){const t=JSON.parse(e);if(!t.entries||typeof t.entries!="object")throw new Error("不是有效的世界书文件（缺少 entries 字段）");const s=[];for(const[i,r]of Object.entries(t.entries)){if(!r||typeof r!="object")continue;const n=String(r.content||"").trim();n&&s.push({uid:Number(i),comment:String(r.comment||""),key:Array.isArray(r.key)?r.key:r.key?[r.key]:[],keysecondary:Array.isArray(r.keysecondary)?r.keysecondary:[],constant:r.constant===!0,disable:r.disable===!0,content:n,order:r.order??100})}if(!s.length)throw new Error("世界书中无有效条目（所有条目缺少 content）");return{name:a,uploadedAt:Date.now(),entries:s}}async function ee(e){const a=V()||{},t=Array.isArray(a.uploadedBooks)?[...a.uploadedBooks]:[],s=[];let i=0;for(const r of Array.from(e||[])){if(!r.name.toLowerCase().endsWith(".json")){s.push(`${r.name}: 不是 .json 文件`);continue}try{const n=ke(await r.text(),r.name),o=t.findIndex(u=>u.name===n.name);o>=0?t[o]=n:t.push(n),i++}catch(n){s.push(`${r.name}: ${n?.message||"解析失败"}`)}}if(W({...a,uploadedBooks:t}),U(t),i>0&&h("sd-worldbook-status","success",`已读取 ${i} 个世界书，请点击保存配置`),s.length){const r=f("sd-wb-entries");if(r){const n=r.ownerDocument.createElement("p");n.className="form-hint",n.style.color="var(--danger)",n.textContent=s.join(`
`),r.replaceChildren(n)}}}function U(e=[]){const a=f("sd-wb-uploaded-list");if(!a)return;const t=Array.isArray(e)?e:[];if(!t.length){const r=a.ownerDocument.createElement("p");r.className="form-hint",r.textContent="尚未上传世界书",a.replaceChildren(r);const n=f("sd-wb-entries");if(n){const o=n.ownerDocument.createElement("p");o.className="form-hint",o.textContent="请先上传世界书",n.replaceChildren(o)}return}const s=a.ownerDocument,i=t.map((r,n)=>{const o=Array.isArray(r.entries)?r.entries:[],u=o.filter(x=>!x.disable).length,d=s.createElement("div");d.className="wb-book-item",d.dataset.index=String(n);const p=s.createElement("span");p.className="wb-book-name",p.textContent=r.name||`世界书 ${n+1}`;const m=s.createElement("span");m.className="wb-book-count",m.textContent=`${u}/${o.length} 条目`;const y=s.createElement("button");y.className="wb-book-delete",y.dataset.index=String(n),y.type="button",y.title="移除";const v=s.createElement("i");return v.className="fa-solid fa-xmark",y.append(v),d.append(p,m,y),d});a.replaceChildren(...i),a.querySelectorAll(".wb-book-item").forEach(r=>{r.addEventListener("click",n=>{if(n.target.closest(".wb-book-delete"))return;const o=t[Number(r.dataset.index)];o&&Se(o)})}),a.querySelectorAll(".wb-book-delete").forEach(r=>{r.addEventListener("click",n=>{n.stopPropagation();const o=V()||{},u=Array.isArray(o.uploadedBooks)?[...o.uploadedBooks]:[];u.splice(Number(r.dataset.index),1),W({...o,uploadedBooks:u}),U(u),h("sd-worldbook-status","","已移除，请点击保存配置")})})}function Se(e){const a=f("sd-wb-entries");if(!a)return;const t=Array.isArray(e.entries)?e.entries:[];if(!t.length){const n=a.ownerDocument.createElement("p");n.className="form-hint",n.textContent=`${e.name||"世界书"}: 无条目`,a.replaceChildren(n);return}const s=a.ownerDocument,i=s.createElement("p");i.className="form-hint",i.style.marginBottom="8px",i.textContent=`${e.name||"世界书"} (${t.length} 条)`;const r=t.map(n=>{const o=n.disable?"disabled":n.constant?"constant":"normal",u=n.disable?"已禁用":n.constant?"常驻":"关键词触发",d=(n.key||[]).filter(Boolean).join(", "),p=s.createElement("div");p.className="wb-entry-item";const m=s.createElement("div");m.className=`wb-lamp ${o}`,m.title=u;const y=s.createElement("div");y.className="wb-entry-info";const v=s.createElement("div");if(v.className="wb-entry-title",v.textContent=n.comment||"(未命名)",y.append(v),d){const c=s.createElement("div");c.className="wb-entry-keys",c.textContent=`关键词: ${d}`,y.append(c)}const x=s.createElement("div");return x.className="wb-entry-preview",x.textContent=String(n.content||"").slice(0,200),y.append(x),p.append(m,y),p});a.replaceChildren(i,...r)}function Ne(){const e=f("sd-wb-dropzone"),a=f("sd-wb-file-input");!e||!a||(e.addEventListener("click",()=>a.click()),e.addEventListener("dragover",t=>{t.preventDefault(),e.classList.add("dragover")}),e.addEventListener("dragleave",()=>e.classList.remove("dragover")),e.addEventListener("drop",t=>{t.preventDefault(),e.classList.remove("dragover"),t.dataTransfer?.files?.length&&R(ee(t.dataTransfer.files),{source:import.meta.url,operation:"callback"})}),a.addEventListener("change",()=>{a.files?.length&&R(ee(a.files),{source:import.meta.url,operation:"callback"}),a.value=""}))}function Ae(){b("#sd-gallery-refresh")?.addEventListener("click",async()=>{await S()}),b("#sd-gallery-save-cache-days")?.addEventListener("click",async e=>{const a=$e(le("sd-gallery-cache-days"),w().cacheDays);await P(e.currentTarget,()=>H(t=>{t.cacheDays=a},"自动清理设置已保存",{notify:!1,silent:!1}),{statusElementId:"sd-gallery-status",pendingText:"正在保存...",successText:`自动清理已设为 ${a} 天`,errorText:"保存失败，请重试"})&&ie("sd-gallery-cache-days",a)}),b("#sd-gallery-save-as-jpeg")?.addEventListener("change",async e=>{const a=e.currentTarget,t=a.checked===!0;a.disabled=!0;const s=await N(H(i=>{i.saveAsJpeg=t},"已保存",{notify:!1,silent:!1}));h("sd-gallery-status",s?"success":"error",s?B.saved:B.saveFailed),a.checked=w().saveAsJpeg===!0,a.disabled=!1}),Re({autoSave:b("#sd-gallery-auto-save"),folder:b("#sd-gallery-save-by-folder"),openButton:b("#sd-gallery-open-folder"),getSettings:w,saveSettings:e=>N(H(e,"已保存",{notify:!1,silent:!1})),report:(e,a)=>h("sd-gallery-status",e==="info"?"":e,a),openFolder:Fe}),b("#sd-gallery-clear-expired")?.addEventListener("click",async()=>{h("sd-gallery-status","","正在清理...");try{h("sd-gallery-status","success",`已清理/瘦身 ${await De(w().cacheDays)} 条`),await S()}catch(e){console.warn("[Draw settings] clearExpiredCache failed:",e),h("sd-gallery-status","error","清理失败，请重试")}}),b("#sd-gallery-clear-all")?.addEventListener("click",async()=>{if(confirm("确定清空全部图片记录？已保存到服务器的文件不会被删除。")){h("sd-gallery-status","","正在清空...");try{await Be(),h("sd-gallery-status","success","已清空"),await S()}catch(e){console.warn("[Draw settings] clearAllCache failed:",e),h("sd-gallery-status","error","清空失败，请重试")}}})}return{bindGallery:Ae,renderGalleryManagement:S,ensureCharacterLibraryUi:F,destroyCharacterLibraryUi:pe,ensureGroupPresetBinding:me,renderCharacterTagList:ye,get characterLibraryUi(){return g},getSharedCharacterTagsFromForm:ce,getSharedCharacterGroupsFromForm:de,addCharacterTagDraft:ge,clearCharacterTagsDraft:he,exportSharedCharacterTags:be,importSharedCharacterTags:xe,deleteCharacterTagDraft:we,renderFilterRuleRow:Z,renderFilterRules:Ee,collectFilterRules:Ce,renderUploadedBooks:U,bindWorldbookUploadEvents:Ne}}function lt(C,{danbooru:h=!1}={}){const P={filter:`
                <details class="card prompt-advanced-card">
                    <summary class="prompt-card-header">
                        <div class="card-title"><i class="fa-solid fa-filter"></i> 消息过滤规则</div>
                        <span class="chain-toggle-icon" aria-hidden="true"></span>
                    </summary>
                    <p class="form-hint" style="margin-bottom:8px;">发送前过滤 RP 消息中匹配的思考块等干扰内容；起始留空表示从消息开头过滤；结束留空表示过滤到消息末尾。<br>默认匹配内容既不供 AI 读取，也不插入图片；勾选「发给 AI」后供 AI 读取，但不允许插入图片。常用于对话美化等。</p>
                    <div class="filter-rule-head" aria-hidden="true"><span>发给 AI</span></div>
                    <div id="sd-filter-rules-list"></div>
                    <div class="btn-group" style="margin-top:8px;">
                        <button id="sd-filter-add" class="btn btn-sm">+ 添加规则</button>
                        <button id="sd-filter-reset" class="btn btn-sm">恢复默认</button>
                    </div>
                    <div class="action-status-row">
                        <div class="btn-group">
                            <button id="sd-filter-save" class="btn btn-primary"><i class="fa-solid fa-floppy-disk"></i> 保存规则</button>
                        </div>
                        <div id="sd-filter-status" class="status-text"></div>
                    </div>
                </details>
`,worldbook:`
                <div class="view-header">
                    <h2 class="view-title">世界书</h2>

                </div>

                <div class="card">
                    <div class="card-title">酒馆当前世界书</div>
                    <label class="check-row"><input type="checkbox" id="sd-shared-use-worldinfo"> 使用酒馆当前世界书</label>
                    <p class="form-hint" style="margin-left:12px;">使用 SillyTavern 当前已启用的世界书，按酒馆原生规则扫描蓝灯、绿灯条目后注入。</p>
                </div>

                <div class="card">
                    <div class="card-title">画图上传世界书</div>
                    <label class="check-row"><input type="checkbox" id="sd-wb-enabled"> 启用画图上传世界书</label>
                    <p class="form-hint" style="margin-left:12px;">支持常驻、关键词、禁用的简化过滤；可与酒馆当前世界书同时开启。</p>
                    <p class="form-hint" style="margin-top:12px;">支持酒馆导出的 .json 世界书文件，可多选。</p>
                    <input type="file" id="sd-wb-file-input" multiple accept=".json" style="display:none;">
                    <div id="sd-wb-dropzone" class="wb-dropzone">
                        <i class="fa-solid fa-cloud-arrow-up" style="font-size:24px;opacity:0.5;"></i>
                        <p>点击或拖拽 .json 文件到此处</p>
                    </div>
                    <div id="sd-wb-uploaded-list" class="wb-book-list" style="margin-top:12px;"></div>
                </div>

                <div class="card">
                    <div class="card-title">过滤设置</div>
                    <div class="form-group">
                        <label class="form-label">过滤模式</label>
                        <select id="sd-wb-filter-mode" class="input">
                            <option value="auto">自动 (简化关键词过滤)</option>
                            <option value="all_active">全部激活条目</option>
                        </select>
                        <p class="form-hint">自动模式：常驻条目始终注入；普通条目按关键词匹配；禁用条目排除。该过滤是画图模块简化规则，不完全等同酒馆原生世界书。</p>
                    </div>
                </div>

                <div class="card">
                    <div class="card-title">条目预览</div>
                    <p class="form-hint">点击已上传的世界书可预览其条目</p>
                    <div id="sd-wb-entries" class="wb-entry-list">
                        <p class="form-hint">请先上传世界书</p>
                    </div>
                </div>

                <div class="action-status-row">
                    <div class="btn-group">
                        <button class="btn btn-primary" type="button" data-sd-save-shared="" data-sd-status="sd-worldbook-status"><i class="fa-solid fa-floppy-disk"></i> 保存配置</button>
                    </div>
                    <div id="sd-worldbook-status" class="status-text"></div>
                </div>
`,characters:`
                <div class="view-header">
                    <h2 class="view-title">角色标签</h2>

                </div>

                <div class="char-management-layout sticky-tools"><div class="char-quick-tools"><input aria-label="搜索角色" id="sd-char-search" type="text" class="input" placeholder="搜索角色、别名或标签"><button id="sd-shared-char-add" class="btn btn-sm" type="button"><i class="fa-solid fa-plus"></i> 添加角色</button><button class="btn btn-sm btn-primary" type="button" data-sd-save-shared=""><i class="fa-solid fa-floppy-disk"></i> 保存角色</button></div>
                    <details class="draw-disclosure char-library-options"><summary>角色库设置</summary><aside class="char-management-sidebar">
                        <div class="card">
                            <div class="card-title">角色概览</div>
                            <div class="char-summary-grid">
                                <div class="char-summary-item">
                                    <div class="char-summary-label">总角色数</div>
                                    <div id="sd-draw-summary-characters-side" class="char-summary-value accent">0</div>
                                </div>
                                <div class="char-summary-item">
                                    <div class="char-summary-label">当前预设</div>
                                    <div id="sd-draw-summary-preset" class="char-summary-value">默认</div>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-title">导入与导出</div>
                            <div class="btn-group">

                                <button id="sd-shared-char-clear" class="btn btn-danger btn-sm" type="button"><i class="fa-solid fa-trash-can"></i> 清除全部</button>
                                <button id="sd-shared-char-export" class="btn btn-sm" type="button"><i class="fa-solid fa-upload"></i> 导出</button>
                                <label class="btn btn-sm" style="cursor:pointer;"><i class="fa-solid fa-download"></i> 导入<input type="file" id="sd-shared-char-import" accept=".json" style="display:none;"></label>

                            </div>
                            <p class="form-hint" style="margin-top:10px;">角色名、别名、外观、服装参考、动态标签、角色负向标签都会被画图流程直接使用。</p>
                        </div>
                        <div class="card">
                            <div id="sd-group-preset-root"></div>
                        </div>
${h?`                        <div class="card">
                            <div class="card-title">Danbooru 资源库</div>
                            <label class="check-row">
                                <input type="checkbox" id="sd-danbooru-local">
                                <span>启用本地角色库</span>
                            </label>
                            <div id="sd-danbooru-local-status" class="status-text">未加载</div>
                            <p class="form-hint">启用后可离线搜索角色官方 tag，并自动填入固定外貌。</p>
                        </div>
`:""}
                    </aside></details>

                    <section class="char-management-main">
                        <div class="card char-list-card">
                            <div class="char-list-card-header">
                                <div>
                                    <div class="card-title">角色列表</div>

                                </div>
                                <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:flex-end;">

                                    <div id="sd-draw-character-result-count" class="char-list-count">0 / 0</div>
                                </div>
                            </div>
                            <div id="sd-shared-character-toolbar"></div>
                            <div class="char-list-body">
                                <div id="sd-shared-character-list" class="char-grid"></div>
                            </div>
                        </div>
                    </section>
                </div>
`,gallery:`
                <div class="view-header">
                    <h2 class="view-title">图片管理</h2>

                </div>

                <div class="card" style="margin-bottom:20px;">
                    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
                        <div style="display:flex;gap:32px;">
                            <div style="text-align:center;">
                                <div style="font-size:28px;font-weight:700;color:var(--accent);" id="sd-gallery-count">0</div>
                                <div style="font-size:11px;color:var(--text-secondary);margin-top:2px;">图片数量</div>
                            </div>
                            <div style="text-align:center;">
                                <div style="font-size:28px;font-weight:700;" id="sd-gallery-size">0 MB</div>
                                <div style="font-size:11px;color:var(--text-secondary);margin-top:2px;">占用空间</div>
                            </div>
                        </div>
                        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                            <div style="display:flex;align-items:center;gap:6px;background:var(--bg-input);padding:6px 10px;border-radius:8px;border:1px solid var(--border);">
                                <span style="font-size:12px;color:var(--text-secondary);">自动清理</span>
                                <input id="sd-gallery-cache-days" type="number" class="input" style="width:50px;padding:4px 6px;min-height:28px;text-align:center;" value="3" min="1" max="30">
                                <span style="font-size:12px;color:var(--text-secondary);">天</span>
                                <button id="sd-gallery-save-cache-days" class="btn btn-sm btn-icon" style="min-height:28px;width:28px;padding:0;"><i class="fa-solid fa-check"></i></button>
                            </div>
                            <div id="sd-gallery-status" class="status-text" style="flex:1 1 220px;min-width:180px;margin-top:0;"></div>
                            <button id="sd-gallery-clear-expired" class="btn btn-sm"><i class="fa-solid fa-broom"></i> 清理过期</button>
                            <button id="sd-gallery-clear-all" class="btn btn-sm btn-danger"><i class="fa-solid fa-trash"></i> 清空全部</button>
                            <button id="sd-gallery-refresh" class="btn btn-sm"><i class="fa-solid fa-arrows-rotate"></i> 刷新</button>
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;flex-wrap:wrap;gap:6px 12px;margin-top:12px;font-size:12px;color:var(--text-secondary);">
                        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                            <input id="sd-gallery-save-as-jpeg" type="checkbox" aria-describedby="sd-gallery-jpeg-hint">
                            <span data-gallery-jpeg-label></span>
                        </label>
                        <span id="sd-gallery-jpeg-hint" data-gallery-jpeg-hint></span>
                    </div>
                    <div style="display:grid;gap:8px;margin-top:8px;font-size:12px;color:var(--text-secondary);">
                        <div>
                            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                                <input id="sd-gallery-auto-save" type="checkbox" aria-describedby="sd-gallery-auto-save-hint">
                                <span data-image-save-auto-label></span>
                            </label>
                            <span id="sd-gallery-auto-save-hint" data-image-save-auto-hint style="display:block;margin-left:22px;"></span>
                        </div>
                        <div>
                            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                                <input id="sd-gallery-save-by-folder" type="checkbox" aria-describedby="sd-gallery-save-by-folder-hint">
                                <span data-image-save-folder-label></span>
                            </label>
                            <span id="sd-gallery-save-by-folder-hint" data-image-save-folder-hint style="display:block;margin-left:22px;"></span>
                        </div>
                        <div><button id="sd-gallery-open-folder" class="btn btn-sm" type="button">打开文件夹</button></div>
                    </div>
                </div>

                <div id="sd-gallery-container" class="gallery-grid"></div>
                <div id="sd-gallery-empty" class="gallery-empty" style="display:none;">
                    <i class="fa-solid fa-images"></i>
                    <div>暂无图片</div>
                    <p>楼层里生成的配图会出现在这里，点击缩略图可打开共享图库查看历史版本</p>
                </div>
`};for(const N of C.querySelectorAll("[data-draw-shared-section]"))N.innerHTML=P[N.dataset.drawSharedSection];for(const[N,_]of[["gallery-jpeg-label",B.label],["gallery-jpeg-hint",`${B.hint} ${B.warning}`],["image-save-auto-label",q.autoLabel],["image-save-auto-hint",q.autoHint],["image-save-folder-label",q.folderLabel],["image-save-folder-hint",q.folderHint]])C.querySelectorAll(`[data-${N}]`).forEach(A=>{A.textContent=_})}export{nt as n,lt as t};
