export interface TavernDrawMarkdownImageEnhancerOptions {
    alertDialog: (options: { title?: string; message?: string; confirmText?: string; tone?: 'default' | 'danger' | 'warning' } | string) => Promise<void>;
    confirmDialog: (options: { title?: string; message?: string; confirmText?: string; cancelText?: string; tone?: 'default' | 'danger' | 'warning' } | string) => Promise<boolean>;
    requestHost: (type: string, payload?: { payload?: object }) => Promise<{ result?: unknown } & Record<string, unknown>>;
    showToast?: (message: string, options?: { tone?: 'info' | 'warning' | 'danger'; durationMs?: number }) => void;
    isHiddenMarkdownNode: (node: Element | null) => boolean;
}

const TAVERN_IMAGE_MARKER_REGEX = /\[tavern-image:([a-z0-9\-_]+)\]/gi;

export function createTavernDrawMarkdownImageEnhancer(options: TavernDrawMarkdownImageEnhancerOptions) {
    const { isHiddenMarkdownNode } = options;
    function canHydrateTavernFigure(figure: HTMLElement, slotId = '') {
        return !!(
            figure
            && figure.isConnected !== false
            && !isHiddenMarkdownNode(figure)
            && String(figure.dataset.tavernImageSlot || '').trim() === slotId
        );
    }

    function toTavernImageResult(response: Record<string, unknown>) {
        return (response.result || response) as Record<string, unknown>;
    }

    function getTavernImageCharacterPrompts(result: Record<string, unknown>): Array<Record<string, unknown>> {
        return Array.isArray(result.characterPrompts)
            ? result.characterPrompts.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
            : [];
    }

    function appendTavernImageEditGroup(
        container: HTMLElement,
        options: { label: string; value: string; type: string; index?: number },
    ): HTMLTextAreaElement {
        const group = document.createElement('span');
        group.className = 'xb-tavern-image-edit-group';

        const label = document.createElement('span');
        label.className = 'xb-tavern-image-edit-group-label';
        label.textContent = options.label;
        group.append(label);

        const textarea = document.createElement('textarea');
        textarea.className = 'xb-tavern-image-edit-input';
        textarea.dataset.type = options.type;
        if (typeof options.index === 'number') {
            textarea.dataset.index = String(options.index);
        }
        textarea.value = options.value;
        group.append(textarea);

        container.append(group);
        return textarea;
    }

    function renderTavernImageEditFields(editScroll: HTMLElement, result: Record<string, unknown>): HTMLTextAreaElement {
        editScroll.replaceChildren();
        const sceneInput = appendTavernImageEditGroup(editScroll, {
            label: '场景',
            value: String(result.tags || ''),
            type: 'scene',
        });

        getTavernImageCharacterPrompts(result).forEach((character, index) => {
            appendTavernImageEditGroup(editScroll, {
                label: String(character.name || `角色 ${index + 1}`),
                value: String(character.prompt || ''),
                type: 'char',
                index,
            });
        });

        return sceneInput;
    }

    function buildTavernImageEditPanel(
        figure: HTMLElement,
        slotId: string,
        result: Record<string, unknown>,
        panelOptions: { inline?: boolean; saveLabel?: string; retryAfterSave?: boolean; onToggle?: (open: boolean) => void } = {},
    ) {
        const editPanel = document.createElement('span');
        editPanel.className = 'xb-tavern-image-edit';
        if (panelOptions.inline) {
            editPanel.classList.add('is-inline');
        }
        editPanel.style.display = 'none';

        const editLabel = document.createElement('span');
        editLabel.className = 'xb-tavern-image-edit-label';
        editLabel.textContent = '编辑 TAG（场景描述）';

        const editScroll = document.createElement('span');
        editScroll.className = 'xb-tavern-image-edit-scroll';

        const editActions = document.createElement('span');
        editActions.className = 'xb-tavern-image-edit-actions';
        [
            { action: 'save-tags', label: panelOptions.saveLabel || '保存 TAG' },
            { action: 'cancel-edit', label: '取消' },
        ].forEach((item) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.dataset.action = item.action;
            button.textContent = item.label;
            editActions.append(button);
        });
        editPanel.append(editLabel, editScroll, editActions);

        const setOpen = (open: boolean) => {
            editPanel.style.display = open ? 'block' : 'none';
            panelOptions.onToggle?.(open);
        };

        const openEditor = () => {
            const sceneInput = renderTavernImageEditFields(editScroll, result);
            setOpen(true);
            sceneInput.focus();
        };

        editPanel.addEventListener('click', (event) => {
            const target = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>('[data-action]');
            if (!target) {return;}
            event.preventDefault();
            event.stopPropagation();
            const action = target.dataset.action || '';
            if (action === 'cancel-edit') {
                setOpen(false);
                editScroll.replaceChildren();
                return;
            }
            if (action === 'save-tags') {
                void (async () => {
                    const sceneInput = editPanel.querySelector<HTMLTextAreaElement>('textarea[data-type="scene"]');
                    const tags = String(sceneInput?.value || '').trim();
                    if (!tags) {
                        await options.alertDialog({
                            title: '缺少场景 TAG',
                            message: '场景 TAG 不能为空',
                        });
                        return;
                    }
                    const characterPrompts = collectTavernImageEditCharacterPrompts(editPanel, result);
                    setTavernImageBusy(figure, true);
                    const runSave = async () => {
                        const editResponse = await options.requestHost('xb-tavern:draw-image-edit', {
                            payload: { slotId, tags, characterPrompts },
                        });
                        if (panelOptions.retryAfterSave) {
                            // Mirrors the main body's failed-state "save-tags-retry": persist the
                            // edited tags first, then regenerate. The host writes a new failed
                            // placeholder on regeneration failure, so a rejected refresh is the
                            // transport-level fallback — re-render with the edited tags regardless.
                            try {
                                const refreshResponse = await options.requestHost('xb-tavern:draw-image-refresh', {
                                    payload: { slotId },
                                });
                                await refreshTavernImageFigure(figure, slotId, refreshResponse);
                            } catch {
                                await refreshTavernImageFigure(figure, slotId, editResponse);
                            }
                            return;
                        }
                        await refreshTavernImageFigure(figure, slotId, editResponse);
                    };
                    void runSave().catch(() => setTavernImageBusy(figure, false));
                })();
            }
        });

        return { editPanel, openEditor };
    }

    function collectTavernImageEditCharacterPrompts(
        editPanel: HTMLElement,
        result: Record<string, unknown>,
    ): Array<Record<string, unknown>> | null {
        const original = getTavernImageCharacterPrompts(result);
        const charInputs = Array.from(editPanel.querySelectorAll<HTMLTextAreaElement>('textarea[data-type="char"]'));
        if (!charInputs.length || !original.length) {return null;}

        const nextPrompts: Array<Record<string, unknown>> = [];
        charInputs.forEach((input) => {
            const index = Math.floor(Number(input.dataset.index));
            const source = Number.isFinite(index) ? original[index] : null;
            if (source) {
                nextPrompts.push({ ...source, prompt: input.value.trim() });
            }
        });
        return nextPrompts;
    }

    function setTavernImageBusy(figure: HTMLElement, busy: boolean) {
        figure.classList.toggle('is-busy', busy);
        figure.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
            button.disabled = busy
                || button.dataset.navDisabled === 'true'
                || button.dataset.editDisabled === 'true';
        });
    }

    function describeTavernImageRefreshError(error: unknown) {
        const raw = error instanceof Error ? error.message : String(error || 'unknown_error');
        return raw.replace(/^xb-tavern:draw-image-refresh:\s*/, '').trim() || 'unknown_error';
    }

    function showTavernImageRefreshError(error: unknown) {
        options.showToast?.(`重绘失败：${describeTavernImageRefreshError(error)}`, {
            tone: 'warning',
            durationMs: 4200,
        });
    }

    function closeTavernImageMenus(root: ParentNode = document) {
        root.querySelectorAll<HTMLElement>('.xb-tavern-image-menu.is-open').forEach((menu) => menu.classList.remove('is-open'));
    }

    function closeTavernImageGallery() {
        if (typeof document === 'undefined') {return;}
        document.getElementById('xb-tavern-image-gallery-overlay')?.remove();
    }

    async function refreshTavernImageFigure(figure: HTMLElement, slotId = '', response: Record<string, unknown>) {
        if (!canHydrateTavernFigure(figure, slotId)) {return;}
        const next = toTavernImageResult(response);
        if (next.hasData && next.url) {
            renderLoadedTavernImageFigure(figure, next);
        } else {
            renderUnavailableTavernImageFigure(figure, next);
        }
    }

    async function selectTavernImageVersion(slotId = '', index = 0, figure?: HTMLElement | null) {
        const response = await options.requestHost('xb-tavern:draw-image-select', {
            payload: { slotId, index },
        });
        if (figure) {
            await refreshTavernImageFigure(figure, slotId, response);
        }
        return toTavernImageResult(response);
    }

    async function openTavernImageGallery(slotId = '', figure?: HTMLElement | null) {
        const response = await options.requestHost('xb-tavern:draw-image-gallery', { payload: { slotId } });
        const data = toTavernImageResult(response);
        const previews = Array.isArray(data.previews) ? data.previews as Array<Record<string, unknown>> : [];
        if (!previews.length) {return;}
        closeTavernImageGallery();

        let currentIndex = Math.max(0, Math.min(previews.length - 1, Math.floor(Number(data.currentIndex) || 0)));
        const overlay = document.createElement('div');
        overlay.id = 'xb-tavern-image-gallery-overlay';
        overlay.className = 'xb-tavern-image-gallery-overlay visible';

        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'xb-tavern-image-gallery-close';
        closeButton.textContent = '×';

        const main = document.createElement('div');
        main.className = 'xb-tavern-image-gallery-main';
        const prevButton = document.createElement('button');
        prevButton.type = 'button';
        prevButton.className = 'xb-tavern-image-gallery-nav';
        prevButton.textContent = '‹';
        const imageWrap = document.createElement('div');
        imageWrap.className = 'xb-tavern-image-gallery-img-wrap';
        const image = document.createElement('img');
        image.className = 'xb-tavern-image-gallery-img';
        const savedBadge = document.createElement('div');
        savedBadge.className = 'xb-tavern-image-gallery-saved-badge';
        savedBadge.textContent = '已保存';
        imageWrap.append(image, savedBadge);
        const nextButton = document.createElement('button');
        nextButton.type = 'button';
        nextButton.className = 'xb-tavern-image-gallery-nav';
        nextButton.textContent = '›';
        main.append(prevButton, imageWrap, nextButton);

        const thumbs = document.createElement('div');
        thumbs.className = 'xb-tavern-image-gallery-thumbs';
        const actions = document.createElement('div');
        actions.className = 'xb-tavern-image-gallery-actions';
        const useButton = document.createElement('button');
        useButton.type = 'button';
        useButton.className = 'xb-tavern-image-gallery-btn primary';
        useButton.textContent = '使用此图';
        const saveButton = document.createElement('button');
        saveButton.type = 'button';
        saveButton.className = 'xb-tavern-image-gallery-btn';
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'xb-tavern-image-gallery-btn danger';
        deleteButton.textContent = '删除';
        actions.append(useButton, saveButton, deleteButton);
        const info = document.createElement('div');
        info.className = 'xb-tavern-image-gallery-info';
        overlay.append(closeButton, main, thumbs, actions, info);
        document.body.append(overlay);

        const render = () => {
            const current = previews[currentIndex] || previews[0];
            image.src = String(current.url || '');
            savedBadge.style.display = current.saved ? 'block' : 'none';
            prevButton.disabled = currentIndex >= previews.length - 1;
            nextButton.disabled = currentIndex <= 0;
            saveButton.textContent = current.saved ? '✓ 已保存' : '保存到服务器';
            saveButton.disabled = !!current.saved;
            info.textContent = `版本 ${previews.length - currentIndex} / ${previews.length}${current.timestamp ? ` · ${new Date(Number(current.timestamp)).toLocaleString()}` : ''}`;
            thumbs.querySelectorAll<HTMLImageElement>('.xb-tavern-image-gallery-thumb').forEach((thumb) => {
                thumb.classList.toggle('active', Number(thumb.dataset.index) === currentIndex);
            });
        };

        previews.slice().reverse().forEach((preview, reverseIndex) => {
            const index = previews.length - 1 - reverseIndex;
            const thumb = document.createElement('img');
            thumb.className = `xb-tavern-image-gallery-thumb${preview.saved ? ' saved' : ''}`;
            thumb.src = String(preview.url || '');
            thumb.dataset.index = String(index);
            thumb.loading = 'lazy';
            thumb.addEventListener('click', () => {
                currentIndex = index;
                render();
            });
            thumbs.append(thumb);
        });

        closeButton.addEventListener('click', closeTavernImageGallery);
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                closeTavernImageGallery();
            }
        });
        prevButton.addEventListener('click', () => {
            currentIndex = Math.min(previews.length - 1, currentIndex + 1);
            render();
        });
        nextButton.addEventListener('click', () => {
            currentIndex = Math.max(0, currentIndex - 1);
            render();
        });
        useButton.addEventListener('click', () => {
            void selectTavernImageVersion(slotId, currentIndex, figure).then(closeTavernImageGallery);
        });
        saveButton.addEventListener('click', () => {
            const current = previews[currentIndex] || previews[0];
            const imgId = String(current?.imgId || '').trim();
            if (!imgId) {return;}
            saveButton.disabled = true;
            void options.requestHost('xb-tavern:draw-image-save', { payload: { slotId, imgId } })
                .then((saveResponse) => {
                    current.saved = true;
                    render();
                    return refreshTavernImageFigure(figure as HTMLElement, slotId, saveResponse);
                })
                .catch(() => { saveButton.disabled = false; });
        });
        deleteButton.addEventListener('click', () => {
            void (async () => {
                if (!await options.confirmDialog({
                    title: '删除图片',
                    message: '确定删除这张图片吗？',
                    confirmText: '删除',
                    tone: 'danger',
                })) {return;}
                const current = previews[currentIndex] || previews[0];
                const imgId = String(current?.imgId || '').trim();
                if (!imgId) {return;}
                void options.requestHost('xb-tavern:draw-image-delete', { payload: { slotId, imgId } })
                    .then((deleteResponse) => refreshTavernImageFigure(figure as HTMLElement, slotId, deleteResponse))
                    .then(() => {
                        previews.splice(currentIndex, 1);
                        if (!previews.length) {
                            closeTavernImageGallery();
                            return;
                        }
                        currentIndex = Math.max(0, Math.min(previews.length - 1, currentIndex));
                        thumbs.querySelectorAll<HTMLImageElement>('.xb-tavern-image-gallery-thumb').forEach((thumb) => {
                            if (Number(thumb.dataset.index) === currentIndex) {
                                thumb.remove();
                            }
                        });
                        closeTavernImageGallery();
                        void openTavernImageGallery(slotId, figure);
                    });
            })();
        });
        render();
    }

    function renderUnavailableTavernImageFigure(figure: HTMLElement, result: Record<string, unknown> = {}) {
        figure.classList.add('is-failed');
        figure.classList.remove('is-loaded', 'is-busy');
        figure.dataset.tavernImageSlot = String(result.slotId || figure.dataset.tavernImageSlot || '').trim();
        figure.dataset.tavernImageHydrating = 'false';
        figure.dataset.tavernImageLoaded = 'false';
        figure.dataset.state = 'failed';

        const slotId = String(result.slotId || figure.dataset.tavernImageSlot || '').trim();
        const isFailed = !!result.isFailed;
        const errorType = String(result.errorType || '').trim();
        const errorMessage = String(result.errorMessage || '').trim();

        const wrap = document.createElement('span');
        wrap.className = 'xb-tavern-image-wrap xb-tavern-image-failed-wrap';

        const icon = document.createElement('span');
        icon.className = 'xb-tavern-image-failed-icon';
        icon.textContent = isFailed ? '⚠️' : '🌫️';
        wrap.append(icon);

        const title = document.createElement('span');
        title.className = 'xb-tavern-image-failed-title';
        title.textContent = errorType || (isFailed ? '生成失败' : '配图未找到');
        wrap.append(title);

        const desc = document.createElement('span');
        desc.className = 'xb-tavern-image-failed-desc';
        desc.textContent = errorMessage || (isFailed ? '点击重试' : '');
        if (desc.textContent) {
            wrap.append(desc);
        }

        if (isFailed && slotId) {
            const actions = document.createElement('span');
            actions.className = 'xb-tavern-image-failed-actions';

            const retryButton = document.createElement('button');
            retryButton.type = 'button';
            retryButton.dataset.action = 'refresh-image';
            retryButton.textContent = '⟳ 重新生成';

            const editButton = document.createElement('button');
            editButton.type = 'button';
            editButton.dataset.action = 'edit-tags';
            editButton.textContent = '✐ 编辑TAG';
            actions.append(retryButton, editButton);
            wrap.append(actions);

            const { editPanel, openEditor } = buildTavernImageEditPanel(figure, slotId, result, {
                inline: true,
                saveLabel: '保存并重试',
                retryAfterSave: true,
                onToggle: (open) => {
                    actions.style.opacity = open ? '0.3' : '';
                    actions.style.pointerEvents = open ? 'none' : '';
                    actions.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
                        button.dataset.editDisabled = open ? 'true' : 'false';
                        button.disabled = open
                            || figure.classList.contains('is-busy')
                            || button.dataset.navDisabled === 'true';
                    });
                },
            });
            wrap.append(editPanel);

            actions.addEventListener('click', (event) => {
                const target = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>('[data-action]');
                if (!target) {return;}
                event.preventDefault();
                event.stopPropagation();
                const action = target.dataset.action || '';
                if (action === 'refresh-image') {
                    setTavernImageBusy(figure, true);
                    void options.requestHost('xb-tavern:draw-image-refresh', { payload: { slotId } })
                        .then((response) => refreshTavernImageFigure(figure, slotId, response))
                        .catch(() => setTavernImageBusy(figure, false));
                    return;
                }
                if (action === 'edit-tags') {
                    openEditor();
                }
            });
        }

        figure.replaceChildren(wrap);
    }

    function renderLoadedTavernImageFigure(figure: HTMLElement, result: Record<string, unknown>) {
        const slotId = String(result.slotId || figure.dataset.tavernImageSlot || '').trim();
        const url = String(result.url || '').trim();
        const historyCount = Math.max(1, Math.floor(Number(result.historyCount) || 1));
        const currentIndex = Math.max(0, Math.min(historyCount - 1, Math.floor(Number(result.currentIndex) || 0)));
        const displayVersion = historyCount - currentIndex;
        figure.classList.add('is-loaded');
        figure.classList.remove('is-failed', 'is-busy');
        figure.dataset.tavernImageSlot = slotId;
        figure.dataset.tavernImageLoaded = 'true';
        figure.dataset.tavernImageIndex = String(currentIndex);
        figure.dataset.tavernImageHistory = String(historyCount);
        figure.dataset.tavernImageImgId = String(result.imgId || '');
        figure.dataset.state = result.saved ? 'saved' : 'preview';

        const wrap = document.createElement('span');
        wrap.className = 'xb-tavern-image-wrap';

        const image = document.createElement('img');
        image.src = url;
        image.alt = result.tags ? `配图：${String(result.tags)}` : '配图';
        image.loading = 'lazy';
        image.addEventListener('click', () => {
            void openTavernImageGallery(slotId, figure);
        });
        wrap.append(image);

        const nav = document.createElement('span');
        nav.className = 'xb-tavern-image-nav';

        const olderButton = document.createElement('button');
        olderButton.type = 'button';
        olderButton.className = 'xb-tavern-image-nav-button';
        olderButton.dataset.action = 'older';
        olderButton.title = '上一版本';
        olderButton.textContent = '‹';
        olderButton.disabled = currentIndex >= historyCount - 1;
        olderButton.dataset.navDisabled = olderButton.disabled ? 'true' : 'false';

        const version = document.createElement('span');
        version.className = 'xb-tavern-image-nav-text';
        version.textContent = `${displayVersion} / ${historyCount}`;

        const newerButton = document.createElement('button');
        newerButton.type = 'button';
        newerButton.className = 'xb-tavern-image-nav-button';
        newerButton.dataset.action = 'newer';
        newerButton.title = currentIndex === 0 ? '重新生成' : '下一版本';
        newerButton.textContent = '›';
        newerButton.disabled = false;
        newerButton.dataset.navDisabled = 'false';
        nav.append(olderButton, version, newerButton);
        wrap.append(nav);

        const menu = document.createElement('span');
        menu.className = 'xb-tavern-image-menu';
        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'xb-tavern-image-menu-trigger';
        trigger.title = '操作';
        trigger.textContent = '⋮';
        const dropdown = document.createElement('span');
        dropdown.className = 'xb-tavern-image-dropdown';
        const menuItems = [
            ...(!result.saved ? [{ action: 'save-image', title: '保存到服务器', label: '⬇' }] : []),
            { action: 'refresh-image', title: '重新生成', label: '⟳' },
            { action: 'edit-tags', title: '编辑TAG', label: '✐' },
            { action: 'delete-image', title: '删除', label: '✕' },
        ];
        menuItems.forEach((item) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.dataset.action = item.action;
            button.title = item.title;
            button.textContent = item.label;
            dropdown.append(button);
        });
        menu.append(trigger, dropdown);
        wrap.append(menu);

        const { editPanel, openEditor } = buildTavernImageEditPanel(figure, slotId, result);
        wrap.append(editPanel);

        figure.replaceChildren(wrap);

        const selectIndex = async (index: number) => {
            setTavernImageBusy(figure, true);
            try {
                const response = await options.requestHost('xb-tavern:draw-image-select', {
                    payload: { slotId, index },
                });
                if (!canHydrateTavernFigure(figure, slotId)) {return;}
                renderLoadedTavernImageFigure(figure, toTavernImageResult(response));
            } catch {
                setTavernImageBusy(figure, false);
            }
        };

        const refreshImage = async () => {
            setTavernImageBusy(figure, true);
            try {
                const response = await options.requestHost('xb-tavern:draw-image-refresh', { payload: { slotId } });
                await refreshTavernImageFigure(figure, slotId, response);
            } catch (error) {
                setTavernImageBusy(figure, false);
                showTavernImageRefreshError(error);
            }
        };

        olderButton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (currentIndex < historyCount - 1) {
                void selectIndex(currentIndex + 1);
            }
        });
        newerButton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (currentIndex > 0) {
                void selectIndex(currentIndex - 1);
                return;
            }
            void refreshImage();
        });
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const willOpen = !menu.classList.contains('is-open');
            closeTavernImageMenus();
            menu.classList.toggle('is-open', willOpen);
        });
        dropdown.addEventListener('click', (event) => {
            const target = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>('[data-action]');
            if (!target) {return;}
            event.preventDefault();
            event.stopPropagation();
            closeTavernImageMenus();
            const action = target.dataset.action || '';
            if (action === 'save-image') {
                setTavernImageBusy(figure, true);
                void options.requestHost('xb-tavern:draw-image-save', { payload: { slotId } })
                    .then((response) => {
                        if (canHydrateTavernFigure(figure, slotId)) {
                            renderLoadedTavernImageFigure(figure, toTavernImageResult(response));
                        }
                    })
                    .catch(() => setTavernImageBusy(figure, false));
            } else if (action === 'refresh-image') {
                void refreshImage();
            } else if (action === 'edit-tags') {
                openEditor();
            } else if (action === 'delete-image') {
                void (async () => {
                    if (!await options.confirmDialog({
                        title: '删除图片',
                        message: '确定删除这张图片吗？',
                        confirmText: '删除',
                        tone: 'danger',
                    })) {return;}
                    setTavernImageBusy(figure, true);
                    void options.requestHost('xb-tavern:draw-image-delete', { payload: { slotId } })
                        .then((response) => refreshTavernImageFigure(figure, slotId, response))
                        .catch(() => setTavernImageBusy(figure, false));
                })();
            }
        });
    }

    function hydrateTavernImageFigure(figure: HTMLElement) {
        const slotId = String(figure.dataset.tavernImageSlot || '').trim();
        if (!slotId || figure.dataset.tavernImageHydrating === 'true' || figure.dataset.tavernImageLoaded === 'true') {
            return;
        }
        figure.dataset.tavernImageHydrating = 'true';
        void options.requestHost('xb-tavern:draw-image', {
            payload: { slotId },
        })
            .then((response) => {
                if (!canHydrateTavernFigure(figure, slotId)) {return;}
                const result = (response.result || response) as Record<string, unknown>;
                figure.dataset.tavernImageHydrating = 'false';
                if (!result.hasData || !result.url) {
                    renderUnavailableTavernImageFigure(figure, result);
                    return;
                }
                renderLoadedTavernImageFigure(figure, result);
            })
            .catch(() => {
                if (!canHydrateTavernFigure(figure, slotId)) {return;}
                figure.dataset.tavernImageHydrating = 'false';
                figure.classList.add('is-failed');
                const placeholder = document.createElement('span');
                placeholder.className = 'xb-tavern-image-placeholder';
                placeholder.textContent = '配图加载失败';
                figure.replaceChildren(placeholder);
            });
    }

    function createTavernImageFigure(slotId = '') {
        const figure = document.createElement('span');
        figure.className = 'xb-tavern-image';
        figure.dataset.tavernImageSlot = slotId;
        const placeholder = document.createElement('span');
        placeholder.className = 'xb-tavern-image-placeholder';
        placeholder.textContent = '配图加载中';
        figure.append(placeholder);
        return figure;
    }

    function removeAdjacentImageLineBreaks(figure: HTMLElement) {
        const parent = figure.parentNode;
        if (!parent) {return;}

        const pruneSide = (direction: 'previousSibling' | 'nextSibling') => {
            let node = figure[direction];
            while (node?.nodeType === Node.TEXT_NODE && !String(node.textContent || '').trim()) {
                const next = node[direction];
                parent.removeChild(node);
                node = next;
            }
            if (node instanceof HTMLBRElement) {
                const next = node[direction];
                parent.removeChild(node);
                node = next;
                while (node?.nodeType === Node.TEXT_NODE && !String(node.textContent || '').trim()) {
                    const after = node[direction];
                    parent.removeChild(node);
                    node = after;
                }
            }
        };

        pruneSide('previousSibling');
        pruneSide('nextSibling');
    }

    function enhanceTavernImageMarkers(root: HTMLElement) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                const textNode = node as Text;
                if (!textNode.data || !TAVERN_IMAGE_MARKER_REGEX.test(textNode.data)) {
                    TAVERN_IMAGE_MARKER_REGEX.lastIndex = 0;
                    return NodeFilter.FILTER_SKIP;
                }
                TAVERN_IMAGE_MARKER_REGEX.lastIndex = 0;
                const parent = textNode.parentElement;
                if (parent?.closest?.('a, button, code, kbd, pre, script, style, textarea, .xb-tavern-image')) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            },
        });
        const nodes: Text[] = [];
        while (walker.nextNode()) {
            nodes.push(walker.currentNode as Text);
        }
        nodes.forEach((textNode) => {
            const text = textNode.data;
            TAVERN_IMAGE_MARKER_REGEX.lastIndex = 0;
            let match: RegExpExecArray | null;
            let lastIndex = 0;
            let replaced = false;
            const fragment = document.createDocumentFragment();
            while ((match = TAVERN_IMAGE_MARKER_REGEX.exec(text)) !== null) {
                replaced = true;
                if (match.index > lastIndex) {
                    const before = text.slice(lastIndex, match.index);
                    fragment.append(document.createTextNode(before.endsWith('\n') ? before.slice(0, -1) : before));
                }
                fragment.append(createTavernImageFigure(match[1] || ''));
                lastIndex = TAVERN_IMAGE_MARKER_REGEX.lastIndex;
                if (text[lastIndex] === '\n') {
                    lastIndex += 1;
                }
            }
            if (!replaced) {return;}
            if (lastIndex < text.length) {
                fragment.append(document.createTextNode(text.slice(lastIndex)));
            }
            textNode.replaceWith(fragment);
        });
        root.querySelectorAll<HTMLElement>('[data-tavern-image-slot]').forEach((figure) => {
            removeAdjacentImageLineBreaks(figure);
            hydrateTavernImageFigure(figure);
        });
    }
    return {
        closeTavernImageGallery,
        enhanceTavernImageMarkers,
    };
}
