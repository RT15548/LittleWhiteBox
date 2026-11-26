import { GALLERY_JPEG_COPY } from './gallery-image-codec.js';
import { IMAGE_SAVE_COPY } from './image-save-core.js';

/** Mount the same settings sections into any provider's iframe. Only trusted, static markup is used. */
export function mountProviderSettingsSections(document, { danbooru = false } = {}) {
    const sections = {
        filter: `
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
`,
        worldbook: `
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
`,
        characters: `
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
${danbooru ? `                        <div class="card">
                            <div class="card-title">Danbooru 资源库</div>
                            <label class="check-row">
                                <input type="checkbox" id="sd-danbooru-local">
                                <span>启用本地角色库</span>
                            </label>
                            <div id="sd-danbooru-local-status" class="status-text">未加载</div>
                            <p class="form-hint">启用后可离线搜索角色官方 tag，并自动填入固定外貌。</p>
                        </div>
` : ''}
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
`,
        gallery: `
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
`,
    };
    for (const root of document.querySelectorAll('[data-draw-shared-section]')) {
        // eslint-disable-next-line no-unsanitized/property -- All section bodies are repository markup, never interpolated user data.
        root.innerHTML = sections[root.dataset.drawSharedSection];
    }
    for (const [selector, text] of [
        ['gallery-jpeg-label', GALLERY_JPEG_COPY.label],
        ['gallery-jpeg-hint', `${GALLERY_JPEG_COPY.hint} ${GALLERY_JPEG_COPY.warning}`],
        ['image-save-auto-label', IMAGE_SAVE_COPY.autoLabel], ['image-save-auto-hint', IMAGE_SAVE_COPY.autoHint],
        ['image-save-folder-label', IMAGE_SAVE_COPY.folderLabel], ['image-save-folder-hint', IMAGE_SAVE_COPY.folderHint],
    ]) {
        document.querySelectorAll(`[data-${selector}]`).forEach(node => { node.textContent = text; });
    }
}
