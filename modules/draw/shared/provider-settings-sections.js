import { drawNotify } from './draw-toast.js';
import { clearAllCache, clearExpiredCache, getGallerySummary, getPreview, getPreviewDisplayUrl, openManagementGallery } from './gallery-cache.js';
import { GALLERY_JPEG_COPY } from './gallery-image-codec.js';
import { bindImageSaveControls } from './image-save-controls.js';
import { openImageFolder } from './image-save.js';
import { getSharedDrawSettings, normalizeSharedCacheDays, updateSharedDrawSettingsPersistent } from './draw-settings.js';
import { clearDrawSavedEntry, DEFAULT_MESSAGE_FILTER_RULES, syncDrawSavedFromPreview } from './draw-common.js';
import { createCharacterEnabledControl, getCharacterEnabledFromCard } from './character-enabled-control.js';
import { createCharacterLibraryUi } from './character-library-ui.js';
import { parseNamedTagLines, serializeNamedTagLines } from './named-tag-items.js';
import { applyFormFieldsFromCard, createFixedAppearanceGroup, createFormsEditor } from './character-forms-dom.js';
import { installTextareaAutofit } from './textarea-autofit.js';
import { EXTRA_TAGS_COPY, createCharacterEditorNote } from './character-editor-copy.js';
import { bindGroupPresetPanel } from './character-group-presets-draft-binding.js';
import * as groupPresetRuntime from './character-group-presets-runtime.js';
import { createFilterRuleHandle } from './filter-rule-sort.js';
import { observeAsyncCallback, observeBackgroundTask } from '../../../shared/common/async-errors.js';

export function createProviderSettingsSections({
    getSettingsDocument, updateStatusText, runSaveButtonTask, withSaveTimeout,
    onCharacterChange = () => {}, danbooruReady, buildChatGalleryCallbacks,
    getWorldbooks = () => getSharedDrawSettings().worldbooks,
    setWorldbooks = worldbooks => { getSharedDrawSettings().worldbooks = worldbooks; },
}) {
    const document = globalThis.document;
    const getSettingsElement = id => getSettingsDocument()?.getElementById(id);
    const querySettings = selector => getSettingsDocument()?.querySelector(selector);
    const querySettingsAll = selector => Array.from(getSettingsDocument()?.querySelectorAll(selector) || []);
    const getValue = id => getSettingsElement(id)?.value || '';
    const setValue = (id, value) => { const node = getSettingsElement(id); if (node) node.value = String(value); };
    let characterLibraryUi = null;
    let characterListAutofit = null;
    let groupPresetBinding = null;

    function galleryCallbacks(slotId, messageId) {
        if (buildChatGalleryCallbacks) return buildChatGalleryCallbacks(slotId, messageId);
        return {
            onUse: (sid, mid, selected) => observeBackgroundTask(
                selected?.savedUrl ? syncDrawSavedFromPreview(mid, selected, { slotId: sid }) : clearDrawSavedEntry(mid, sid),
                { source: import.meta.url, operation: 'useGalleryImage' },
            ),
            onSave: observeAsyncCallback(async (imgId, savedUrl) => {
                const preview = await getPreview(imgId);
                if (preview) await syncDrawSavedFromPreview(messageId, preview, { slotId, savedUrl });
                await renderGalleryManagement();
            }, { source: import.meta.url, operation: 'saveGalleryImage' }),
            onDelete: renderGalleryManagement,
            onBecameEmpty: renderGalleryManagement,
        };
    }

    function formatBytes(bytes = 0) {
        if (!Number.isFinite(bytes) || bytes <= 0) return '0 MB';
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    }

    async function renderGalleryManagement() {
        const container = getSettingsElement('sd-gallery-container');
        const empty = getSettingsElement('sd-gallery-empty');
        const countEl = getSettingsElement('sd-gallery-count');
        const sizeEl = getSettingsElement('sd-gallery-size');
        const cacheDaysEl = getSettingsElement('sd-gallery-cache-days');
        if (!container || !empty || !countEl || !sizeEl) return;
        if (cacheDaysEl) {
            cacheDaysEl.value = String(getSharedDrawSettings().cacheDays);
        }

        container.textContent = '加载中...';
        empty.style.display = 'none';

        let summary = {};
        try {
            summary = await getGallerySummary();
        } catch (error) {
            console.warn('[Draw settings] getGallerySummary failed:', error);
        }

        const chars = Object.keys(summary);
        const totalCount = chars.reduce((sum, charName) => sum + (summary[charName]?.count || 0), 0);
        const totalSize = chars.reduce((sum, charName) => sum + (summary[charName]?.totalSize || 0), 0);
        countEl.textContent = String(totalCount);
        sizeEl.textContent = formatBytes(totalSize);

        if (!chars.length) {
            container.textContent = '';
            empty.style.display = 'block';
            return;
        }

        chars.sort((a, b) => (summary[b].latestTimestamp || 0) - (summary[a].latestTimestamp || 0));
        container.replaceChildren();

        for (const charName of chars) {
            const charSummary = summary[charName];
            const slotSummaries = charSummary.slots || {};
            const slotIds = Object.keys(slotSummaries)
                .sort((a, b) => ((slotSummaries[b]?.latestTimestamp || 0) - (slotSummaries[a]?.latestTimestamp || 0)));

            const card = document.createElement('div');
            card.className = 'gallery-char-card';

            const head = document.createElement('div');
            head.className = 'gallery-char-head';
            const title = document.createElement('div');
            title.className = 'gallery-char-name';
            title.textContent = charName;
            const meta = document.createElement('div');
            meta.className = 'gallery-char-meta';
            meta.textContent = `${charSummary.count || 0} 张 · ${slotIds.length} 组 · ${formatBytes(charSummary.totalSize || 0)}`;
            head.append(title, meta);

            const grid = document.createElement('div');
            grid.className = 'gallery-slots';

            slotIds.slice(0, 8).forEach((slotId, index) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'gallery-slot-btn';
                button.addEventListener('click', observeAsyncCallback(async () => {
                    await openManagementGallery(slotSummaries[slotId].latestImgId, galleryCallbacks, renderGalleryManagement);
                }, { source: import.meta.url, operation: "callback" }));

                const img = document.createElement('img');
                img.className = 'gallery-slot-thumb';
                img.alt = '';
                void getPreview(slotSummaries[slotId]?.latestImgId).then((latest) => {
                    if (latest) img.src = getPreviewDisplayUrl(latest);
                }).catch((caughtError) => { console.warn({ source: import.meta.url, operation: "renderGalleryManagement" }, caughtError); });

                const label = document.createElement('div');
                label.className = 'gallery-slot-title';
                label.textContent = `图组 ${index + 1}`;

                const sub = document.createElement('div');
                sub.className = 'gallery-slot-sub';
                sub.textContent = `${slotSummaries[slotId]?.count || 1} 个版本`;

                button.append(img, label, sub);
                grid.appendChild(button);
            });

            card.append(head, grid);
            container.appendChild(card);
        }
    }

    // 从表单读出各卡片的字段（不含分组：分组由角色库界面按卡片所在位置补上）。
    // keepEmpty 为 true 时保留全空的新卡片；只有保存 / 导出时才丢弃它们。
    function readCharacterCardsFromForm({ keepEmpty = false } = {}) {
        const existingById = new Map((getSharedDrawSettings().characterTags || [])
            .map((item) => [String(item.id || ''), item])
            .filter(([id]) => id));

        return querySettingsAll('.sd-char-card').map((card, index) => {
            // 已保存记录里的 groupId 可能已过期（草稿里可能刚换过分组），一律丢弃，以卡片所在位置为准。
            const saved = { ...(existingById.get(String(card.dataset.characterId || '')) || {}) };
            delete saved.groupId;
            const record = {
                ...saved,
                id: card.dataset.characterId || `sd-char-${Date.now()}-${index}`,
                enabled: getCharacterEnabledFromCard(card),
                name: String(card.querySelector('[data-sd-char-field="name"]')?.value || '').trim(),
                aliases: String(card.querySelector('[data-sd-char-field="aliases"]')?.value || '')
                    .split(',')
                    .map(item => item.trim())
                    .filter(Boolean),
                type: String(card.querySelector('[data-sd-char-field="type"]')?.value || 'girl').trim() || 'girl',
                appearance: String(card.querySelector('[data-sd-char-field="appearance"]')?.value || '').trim(),
                negativeTags: String(card.querySelector('[data-sd-char-field="negativeTags"]')?.value || '').trim(),
                danbooruTag: danbooruReady ? String(card.querySelector('[data-sd-char-field="danbooruTag"]')?.value || '').trim() : saved.danbooruTag,
                outfits: parseNamedTagLines(card.querySelector('[data-sd-char-field="outfits"]')?.value || ''),
                dynamicStates: parseNamedTagLines(card.querySelector('[data-sd-char-field="dynamicStates"]')?.value || ''),
            };
            // 形态：第一形态名称与额外形态并入记录（清空时显式删除，因为上面先展开了已保存的记录）。
            return applyFormFieldsFromCard(record, card, { keepEmpty });
        }).filter((item) => keepEmpty || item.name || item.appearance || item.danbooruTag || item.negativeTags || item.aliases.length || item.outfits?.length || item.dynamicStates?.length || item.forms?.length);
    }

    // 当前草稿里的角色（含未保存的编辑与所属分组，已丢弃全空的新卡片），保存与导出用。
    function getSharedCharacterTagsFromForm() {
        return characterLibraryUi ? characterLibraryUi.getCharacters() : readCharacterCardsFromForm();
    }

    function getSharedCharacterGroupsFromForm() {
        return characterLibraryUi ? characterLibraryUi.getGroups() : (getSharedDrawSettings().characterGroups || []);
    }

    function ensureCharacterLibraryUi() {
        const doc = getSettingsDocument();
        const list = querySettings('#sd-shared-character-list');
        const toolbar = querySettings('#sd-shared-character-toolbar');
        if (!doc || !list || !toolbar) return null;
        if (characterLibraryUi?.document === doc) return characterLibraryUi;
        characterLibraryUi?.destroy();
        characterListAutofit?.dispose();
        characterListAutofit = installTextareaAutofit(list);
        characterLibraryUi = createCharacterLibraryUi({
            document: doc,
            listElement: list,
            toolbarElement: toolbar,
            searchInput: querySettings('#sd-char-search'),
            readCharacters: readCharacterCardsFromForm,
            renderCard: renderCharacterCard,
            renderEmpty: createCharacterEmptyState,
            onChange: onCharacterChange,
            notify: {
                success: (message) => drawNotify.success(message),
                warning: (message) => drawNotify.warning(message),
                error: (message) => drawNotify.error(message),
            },
        });
        return characterLibraryUi;
    }

    function destroyCharacterLibraryUi() {
        destroyGroupPresetBinding();
        characterLibraryUi?.destroy();
        characterLibraryUi = null;
        characterListAutofit?.dispose();
        characterListAutofit = null;
    }

    // 分组预设卡片：预设不属于角色草稿，修改立即持久化；展示用的分组 / 角色取自角色库草稿（用户所见）。
    // 预设自动应用后，把草稿里受影响分组的开关同步成最新值，避免之后“保存角色”写回旧值。
    function ensureGroupPresetBinding() {
        const doc = getSettingsDocument();
        const container = querySettings('#sd-group-preset-root');
        const ui = characterLibraryUi;
        if (!doc || !container || !ui) return null;
        if (groupPresetBinding?.document === doc) {
            groupPresetBinding.render();
            return groupPresetBinding;
        }
        groupPresetBinding?.destroy();
        groupPresetBinding = bindGroupPresetPanel({
            document: doc,
            container,
            getLibrary: () => ui.getLibrary(),
            syncGroupEnabled: (groups, ids) => ui.syncGroupEnabled(groups, ids),
            runtime: groupPresetRuntime,
            settings: { get: getSharedDrawSettings },
            toast: (message, level) => {
                const show = drawNotify[level] || drawNotify.info;
                show.call(drawNotify, message);
            },
        });
        return groupPresetBinding;
    }

    function destroyGroupPresetBinding() {
        groupPresetBinding?.destroy();
        groupPresetBinding = null;
    }

    // 用 tags / groups 重绘整个角色列表（丢弃当前草稿）；groups 缺省时沿用当前草稿的分组。
    function renderCharacterTagList(tags = [], groups) {
        const ui = ensureCharacterLibraryUi();
        if (!ui) return;
        ui.render({ characters: tags, groups: groups ?? ui.getGroups() });
    }

    function createCharacterEmptyState() {
        const empty = document.createElement('div');
        empty.className = 'char-empty sd-char-empty';
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-user-plus';
        const title = document.createElement('strong');
        title.textContent = '暂无角色配置';
        const desc = document.createElement('p');
        desc.textContent = '添加角色，保存外貌与服装标签。';
        empty.append(icon, title, desc);
        return empty;
    }

    function renderCharacterCard({ character: tag, ordinal }) {
        const index = ordinal - 1;
        const card = document.createElement('details');
        card.className = 'sd-char-card';
        card.open = !tag.name;
        card.dataset.characterId = String(tag.id || `sd-char-${index + 1}`);

        const top = document.createElement('summary');
        top.className = 'sd-char-card-header';
        const title = document.createElement('div');
        title.className = 'sd-char-card-title';
        const titleIcon = document.createElement('i');
        titleIcon.className = 'fa-solid fa-user-group';
        const titleText = document.createElement('span');
        titleText.textContent = tag.name || `角色 ${index + 1}`;
        title.append(titleIcon, titleText);
        const delButton = document.createElement('button');
        delButton.className = 'btn btn-danger btn-sm';
        delButton.type = 'button';
        delButton.dataset.sdCharDelete = card.dataset.characterId;
        const delIcon = document.createElement('i');
        delIcon.className = 'fa-solid fa-trash';
        const delText = document.createElement('span');
        delText.textContent = '删除';
        delButton.append(delIcon, delText);
        const actions = document.createElement('div');
        actions.className = 'btn-group';
        const enabledControl = createCharacterEnabledControl(document, card, {
            enabled: tag.enabled !== false,
            label: `角色 ${index + 1}${tag.name ? ` ${tag.name}` : ''}`,
        });
        actions.append(enabledControl);
        if (danbooruReady) {
            const danbooruButton = document.createElement('button');
            danbooruButton.className = 'btn btn-sm';
            danbooruButton.type = 'button';
            danbooruButton.dataset.sdCharDanbooru = card.dataset.characterId;
            if (!danbooruReady()) {
                danbooruButton.disabled = true;
                danbooruButton.style.opacity = '0.35';
            }
            const danbooruIcon = document.createElement('i');
            danbooruIcon.className = 'fa-solid fa-magnifying-glass';
            const danbooruText = document.createElement('span');
            danbooruText.textContent = 'Danbooru';
            danbooruButton.append(danbooruIcon, danbooruText);

            actions.append(danbooruButton);
        }
        actions.append(delButton);
        top.append(title, actions);

        const grid = document.createElement('div');
        grid.className = 'form-row';
        grid.append(
            createCharacterField('角色名', 'name', tag.name || '', '例如 芙蕾雅'),
            createCharacterField('类型', 'type', tag.type || 'girl', '例如 girl / boy'),
        );
        const formNameField = createCharacterField('形态名称（可选）', 'formName', tag.formName || '', '形态名称');

        card.append(
            top,
            grid,
            createCharacterField('别名（逗号分隔）', 'aliases', (tag.aliases || []).join(', '), '例如 小芙, Freya'),
            formNameField,
            createFixedAppearanceGroup({ document, createField: createCharacterField, values: tag }),
            ...(danbooruReady ? [createCharacterField('Danbooru Tag', 'danbooruTag', tag.danbooruTag || '', '可选，用于兼容原有角色提示逻辑')] : []),
            createCharacterField('服装参考（每行一套，行首加 # 停用）', 'outfits', serializeNamedTagLines(tag.outfits || []), '校服 = white shirt, pleated skirt', { multiline: true }),
            createCharacterField(`${EXTRA_TAGS_COPY.title}（每行一条，行首加 # 停用）`, 'dynamicStates', serializeNamedTagLines(tag.dynamicStates || []), '脸红 = blush, looking away', { multiline: true }),
            createFormsEditor({ document, forms: tag.forms || [], createField: createCharacterField }),
        );
        if (danbooruReady) {
            const panel = document.createElement('div');
            panel.className = 'danbooru-panel hidden';
            panel.dataset.charId = card.dataset.characterId;
            card.appendChild(panel);
        }
        card.appendChild(createCharacterEditorNote(document));
        card.addEventListener('input', event => {
            if (event.target.dataset.sdCharField === 'name') titleText.textContent = event.target.value || `角色 ${index + 1}`;
        });
        return card;
    }

    function createCharacterField(labelText, fieldName, value, placeholder, options = {}) {
        const field = document.createElement('div');
        field.className = 'form-group';

        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = labelText;
        field.appendChild(label);

        const input = document.createElement(options.multiline ? 'textarea' : 'input');
        input.className = 'input';
        input.dataset[options.dataKey || 'sdCharField'] = fieldName;
        input.placeholder = placeholder;
        if (options.multiline) {
            input.rows = 1;
            input.setAttribute("data-autofit", "");
            input.textContent = String(value || '');
        } else {
            input.type = 'text';
            input.value = String(value || '');
        }
        field.appendChild(input);
        return field;
    }

    function addCharacterTagDraft() {
        ensureCharacterLibraryUi()?.addCharacter();
    }

    function clearCharacterTagsDraft() {
        const ui = ensureCharacterLibraryUi();
        const current = ui ? ui.getCharacters({ keepEmpty: true }) : [];
        if (!current.length) {
            drawNotify.warning('没有角色可清除');
            return;
        }
        if (!confirm(`确定清空全部 ${current.length} 个角色？分组会保留；点击“保存角色”前不会真正生效。`)) return;
        ui.clearCharacters();
    }

    function exportSharedCharacterTags() {
        ensureCharacterLibraryUi()?.openExportDialog();
    }

    async function importSharedCharacterTags(input) {
        const file = input?.files?.[0];
        try {
            if (file) await ensureCharacterLibraryUi()?.importFile(file);
        } finally {
            if (input) input.value = '';
        }
    }

    function deleteCharacterTagDraft(characterId = '') {
        ensureCharacterLibraryUi()?.deleteCharacters([String(characterId || '')]);
    }

    function renderFilterRuleRow(rule = { start: '', end: '' }) {
        const list = getSettingsElement('sd-filter-rules-list');
        if (!list) return;
        const row = document.createElement('div');
        row.className = 'filter-rule-row';

        const start = document.createElement('input');
        start.type = 'text';
        start.placeholder = '起始标记';
        start.value = String(rule.start || '');
        start.dataset.sdFilterField = 'start';

        const arrow = document.createElement('span');
        arrow.className = 'rule-arrow';
        arrow.textContent = '→';

        const end = document.createElement('input');
        end.type = 'text';
        end.placeholder = '结束标记';
        end.value = String(rule.end || '');
        end.dataset.sdFilterField = 'end';

        // 「发给 AI」：只放一个勾选框，列标题写在列表上方；缺省不勾
        const keep = document.createElement('input');
        keep.type = 'checkbox';
        keep.className = 'rule-keep';
        keep.title = '发给 AI';
        keep.setAttribute('aria-label', '发给 AI');
        keep.checked = rule.keep === true;
        keep.dataset.sdFilterField = 'keep';

        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'btn-del-rule';
        del.textContent = '×';
        del.addEventListener('click', () => row.remove());

        row.append(createFilterRuleHandle(document), start, arrow, end, keep, del);
        list.appendChild(row);
    }

    function renderFilterRules(rules = []) {
        const list = getSettingsElement('sd-filter-rules-list');
        if (!list) return;
        list.textContent = '';
        const normalized = Array.isArray(rules) && rules.length ? rules : DEFAULT_MESSAGE_FILTER_RULES;
        normalized.forEach((rule) => renderFilterRuleRow(rule));
    }

    function collectFilterRules() {
        return querySettingsAll('#sd-filter-rules-list .filter-rule-row')
            .map((row) => {
                const rule = {
                    start: String(row.querySelector('[data-sd-filter-field="start"]')?.value || '').trim(),
                    end: String(row.querySelector('[data-sd-filter-field="end"]')?.value || '').trim(),
                };
                // 「发给 AI」只在勾选时写入 keep: true；不勾（默认）不写键
                if (row.querySelector('[data-sd-filter-field="keep"]')?.checked) rule.keep = true;
                return rule;
            })
            .filter((rule) => rule.start || rule.end);
    }

    function parseWorldbookJson(jsonText, fileName) {
        const data = JSON.parse(jsonText);
        if (!data.entries || typeof data.entries !== 'object') {
            throw new Error('不是有效的世界书文件（缺少 entries 字段）');
        }
        const entries = [];
        for (const [uid, entry] of Object.entries(data.entries)) {
            if (!entry || typeof entry !== 'object') continue;
            const content = String(entry.content || '').trim();
            if (!content) continue;
            entries.push({
                uid: Number(uid),
                comment: String(entry.comment || ''),
                key: Array.isArray(entry.key) ? entry.key : (entry.key ? [entry.key] : []),
                keysecondary: Array.isArray(entry.keysecondary) ? entry.keysecondary : [],
                constant: entry.constant === true,
                disable: entry.disable === true,
                content,
                order: entry.order ?? 100,
            });
        }
        if (!entries.length) {
            throw new Error('世界书中无有效条目（所有条目缺少 content）');
        }
        return { name: fileName, uploadedAt: Date.now(), entries };
    }

    async function handleWorldbookFiles(files) {
        const worldbooks = getWorldbooks() || {};
        const uploaded = Array.isArray(worldbooks.uploadedBooks) ? [...worldbooks.uploadedBooks] : [];
        const errors = [];
        let added = 0;

        for (const file of Array.from(files || [])) {
            if (!file.name.toLowerCase().endsWith('.json')) {
                errors.push(`${file.name}: 不是 .json 文件`);
                continue;
            }
            try {
                const book = parseWorldbookJson(await file.text(), file.name);
                const existingIndex = uploaded.findIndex((item) => item.name === book.name);
                if (existingIndex >= 0) uploaded[existingIndex] = book;
                else uploaded.push(book);
                added++;
            } catch (error) {
                errors.push(`${file.name}: ${error?.message || '解析失败'}`);
            }
        }

        setWorldbooks({ ...worldbooks, uploadedBooks: uploaded });
        renderUploadedBooks(uploaded);
        if (added > 0) {
            updateStatusText('sd-worldbook-status', 'success', `已读取 ${added} 个世界书，请点击保存配置`);
        }
        if (errors.length) {
            const container = getSettingsElement('sd-wb-entries');
            if (container) {
                const message = container.ownerDocument.createElement('p');
                message.className = 'form-hint';
                message.style.color = 'var(--danger)';
                message.textContent = errors.join('\n');
                container.replaceChildren(message);
            }
        }
    }

    function renderUploadedBooks(books = []) {
        const container = getSettingsElement('sd-wb-uploaded-list');
        if (!container) return;
        const normalized = Array.isArray(books) ? books : [];
        if (!normalized.length) {
            const empty = container.ownerDocument.createElement('p');
            empty.className = 'form-hint';
            empty.textContent = '尚未上传世界书';
            container.replaceChildren(empty);
            const entries = getSettingsElement('sd-wb-entries');
            if (entries) {
                const hint = entries.ownerDocument.createElement('p');
                hint.className = 'form-hint';
                hint.textContent = '请先上传世界书';
                entries.replaceChildren(hint);
            }
            return;
        }
        const doc = container.ownerDocument;
        const items = normalized.map((book, index) => {
            const entries = Array.isArray(book.entries) ? book.entries : [];
            const activeCount = entries.filter((entry) => !entry.disable).length;
            const item = doc.createElement('div');
            item.className = 'wb-book-item';
            item.dataset.index = String(index);
            const name = doc.createElement('span');
            name.className = 'wb-book-name';
            name.textContent = book.name || `世界书 ${index + 1}`;
            const count = doc.createElement('span');
            count.className = 'wb-book-count';
            count.textContent = `${activeCount}/${entries.length} 条目`;
            const del = doc.createElement('button');
            del.className = 'wb-book-delete';
            del.dataset.index = String(index);
            del.type = 'button';
            del.title = '移除';
            const icon = doc.createElement('i');
            icon.className = 'fa-solid fa-xmark';
            del.append(icon);
            item.append(name, count, del);
            return item;
        });
        container.replaceChildren(...items);

        container.querySelectorAll('.wb-book-item').forEach((item) => {
            item.addEventListener('click', (event) => {
                if (event.target.closest('.wb-book-delete')) return;
                const book = normalized[Number(item.dataset.index)];
                if (book) renderWorldbookEntries(book);
            });
        });
        container.querySelectorAll('.wb-book-delete').forEach((button) => {
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                const worldbooks = getWorldbooks() || {};
                const nextBooks = Array.isArray(worldbooks.uploadedBooks) ? [...worldbooks.uploadedBooks] : [];
                nextBooks.splice(Number(button.dataset.index), 1);
                setWorldbooks({ ...worldbooks, uploadedBooks: nextBooks });
                renderUploadedBooks(nextBooks);
                updateStatusText('sd-worldbook-status', '', '已移除，请点击保存配置');
            });
        });
    }

    function renderWorldbookEntries(book) {
        const container = getSettingsElement('sd-wb-entries');
        if (!container) return;
        const entries = Array.isArray(book.entries) ? book.entries : [];
        if (!entries.length) {
            const empty = container.ownerDocument.createElement('p');
            empty.className = 'form-hint';
            empty.textContent = `${book.name || '世界书'}: 无条目`;
            container.replaceChildren(empty);
            return;
        }
        const doc = container.ownerDocument;
        const title = doc.createElement('p');
        title.className = 'form-hint';
        title.style.marginBottom = '8px';
        title.textContent = `${book.name || '世界书'} (${entries.length} 条)`;
        const entryItems = entries.map((entry) => {
                const state = entry.disable ? 'disabled' : (entry.constant ? 'constant' : 'normal');
                const label = entry.disable ? '已禁用' : (entry.constant ? '常驻' : '关键词触发');
                const keys = (entry.key || []).filter(Boolean).join(', ');
                const item = doc.createElement('div');
                item.className = 'wb-entry-item';
                const lamp = doc.createElement('div');
                lamp.className = `wb-lamp ${state}`;
                lamp.title = label;
                const info = doc.createElement('div');
                info.className = 'wb-entry-info';
                const entryTitle = doc.createElement('div');
                entryTitle.className = 'wb-entry-title';
                entryTitle.textContent = entry.comment || '(未命名)';
                info.append(entryTitle);
                if (keys) {
                    const keyLine = doc.createElement('div');
                    keyLine.className = 'wb-entry-keys';
                    keyLine.textContent = `关键词: ${keys}`;
                    info.append(keyLine);
                }
                const preview = doc.createElement('div');
                preview.className = 'wb-entry-preview';
                preview.textContent = String(entry.content || '').slice(0, 200);
                info.append(preview);
                item.append(lamp, info);
                return item;
            });
        container.replaceChildren(title, ...entryItems);
    }

    function bindWorldbookUploadEvents() {
        const dropzone = getSettingsElement('sd-wb-dropzone');
        const fileInput = getSettingsElement('sd-wb-file-input');
        if (!dropzone || !fileInput) return;
        dropzone.addEventListener('click', () => fileInput.click());
        dropzone.addEventListener('dragover', (event) => {
            event.preventDefault();
            dropzone.classList.add('dragover');
        });
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
        dropzone.addEventListener('drop', (event) => {
            event.preventDefault();
            dropzone.classList.remove('dragover');
            if (event.dataTransfer?.files?.length) observeBackgroundTask(handleWorldbookFiles(event.dataTransfer.files), { source: import.meta.url, operation: "callback" });
        });
        fileInput.addEventListener('change', () => {
            if (fileInput.files?.length) observeBackgroundTask(handleWorldbookFiles(fileInput.files), { source: import.meta.url, operation: "callback" });
            fileInput.value = '';
        });
    }

    function bindGallery() {
        querySettings('#sd-gallery-refresh')?.addEventListener('click', async () => {
            await renderGalleryManagement();
        });
        querySettings('#sd-gallery-save-cache-days')?.addEventListener('click', async (event) => {
            const nextDays = normalizeSharedCacheDays(getValue('sd-gallery-cache-days'), getSharedDrawSettings().cacheDays);
            const ok = await runSaveButtonTask(event.currentTarget, () => updateSharedDrawSettingsPersistent((settings) => {
                settings.cacheDays = nextDays;
            }, '自动清理设置已保存', { notify: false, silent: false }), {
                statusElementId: 'sd-gallery-status',
                pendingText: '正在保存...',
                successText: `自动清理已设为 ${nextDays} 天`,
                errorText: '保存失败，请重试',
            });
            if (ok) {
                setValue('sd-gallery-cache-days', nextDays);
            }
        });
        // JPEG applies to new images only.
        querySettings('#sd-gallery-save-as-jpeg')?.addEventListener('change', async (event) => {
            const checkbox = event.currentTarget;
            const nextJpeg = checkbox.checked === true;
            checkbox.disabled = true;
            const ok = await withSaveTimeout(updateSharedDrawSettingsPersistent((settings) => {
                settings.saveAsJpeg = nextJpeg;
            }, '已保存', { notify: false, silent: false }));
            updateStatusText('sd-gallery-status', ok ? 'success' : 'error',
                ok ? GALLERY_JPEG_COPY.saved : GALLERY_JPEG_COPY.saveFailed);
            checkbox.checked = getSharedDrawSettings().saveAsJpeg === true;
            checkbox.disabled = false;
        });
        bindImageSaveControls({
            autoSave: querySettings('#sd-gallery-auto-save'),
            folder: querySettings('#sd-gallery-save-by-folder'),
            openButton: querySettings('#sd-gallery-open-folder'),
            getSettings: getSharedDrawSettings,
            saveSettings: mutate => withSaveTimeout(updateSharedDrawSettingsPersistent(mutate, '已保存', { notify: false, silent: false })),
            report: (state, text) => updateStatusText('sd-gallery-status', state === 'info' ? '' : state, text),
            openFolder: openImageFolder,
        });
        querySettings('#sd-gallery-clear-expired')?.addEventListener('click', async () => {
            updateStatusText('sd-gallery-status', '', '正在清理...');
            try {
                const cleaned = await clearExpiredCache(getSharedDrawSettings().cacheDays);
                updateStatusText('sd-gallery-status', 'success', `已清理/瘦身 ${cleaned} 条`);
                await renderGalleryManagement();
            } catch (error) {
                console.warn('[Draw settings] clearExpiredCache failed:', error);
                updateStatusText('sd-gallery-status', 'error', '清理失败，请重试');
            }
        });
        querySettings('#sd-gallery-clear-all')?.addEventListener('click', async () => {
            if (!confirm('确定清空全部图片记录？已保存到服务器的文件不会被删除。')) return;
            updateStatusText('sd-gallery-status', '', '正在清空...');
            try {
                await clearAllCache();
                updateStatusText('sd-gallery-status', 'success', '已清空');
                await renderGalleryManagement();
            } catch (error) {
                console.warn('[Draw settings] clearAllCache failed:', error);
                updateStatusText('sd-gallery-status', 'error', '清空失败，请重试');
            }
        });
    }

    return {
        bindGallery, renderGalleryManagement,
        ensureCharacterLibraryUi, destroyCharacterLibraryUi, ensureGroupPresetBinding, renderCharacterTagList,
        get characterLibraryUi() { return characterLibraryUi; },
        getSharedCharacterTagsFromForm, getSharedCharacterGroupsFromForm,
        addCharacterTagDraft, clearCharacterTagsDraft, exportSharedCharacterTags, importSharedCharacterTags, deleteCharacterTagDraft,
        renderFilterRuleRow, renderFilterRules, collectFilterRules, renderUploadedBooks, bindWorldbookUploadEvents,
    };
}
