// NovelAI quick-menu presentation only; preset selection and persistence stay in the panel.
const COPY = {
    empty: '暂无画师串预设',
    unnamed: '未命名',
    thumbnailFailed: '画师串预设预览加载失败',
};
const TARGET_HEIGHT = 64;

export function mountPresetGallery(element) {
    const doc = element.ownerDocument;
    const win = doc.defaultView;
    let entries = [];
    let frame = null;
    let lastWidth = 0;
    let disposed = false;
    let imageEvents;

    function create(tag, className, text) {
        const node = doc.createElement(tag);
        node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function layout() {
        frame = null;
        const width = element.clientWidth;
        if (disposed || !width || !entries.length) return;
        lastWidth = width;
        const focused = element.contains(doc.activeElement) ? doc.activeElement : null;
        const scrollTop = element.scrollTop;
        const gap = parseFloat(win.getComputedStyle(element).gap);
        const cardStyle = win.getComputedStyle(entries[0].card);
        const border = parseFloat(cardStyle.borderLeftWidth) + parseFloat(cardStyle.borderRightWidth);
        const ratio = entry => entry.image.naturalWidth ? entry.image.naturalWidth / entry.image.naturalHeight : 1;
        const fitHeight = row => (width - gap * (row.length - 1) - border * row.length)
            / row.reduce((sum, entry) => sum + ratio(entry), 0);
        const children = [];
        let pending = [];

        function finishRow(last) {
            const row = create('div', 'nd-preset-photo-row');
            const fit = fitHeight(pending);
            // Full rows share the available width; a sparse final row is not enlarged.
            const height = last && (pending.length === 1 || fit > TARGET_HEIGHT * 1.25)
                ? Math.min(fit, TARGET_HEIGHT) : fit;
            for (const entry of pending) {
                entry.card.style.width = `${ratio(entry) * height + border}px`;
                // Explicit pixels also work in WebViews; host chat-image rules must not resize previews.
                entry.image.style.setProperty('height', `${height}px`, 'important');
                entry.image.style.setProperty('max-height', `${height}px`, 'important');
                row.append(entry.card);
            }
            children.push(row);
            pending = [];
        }

        for (const entry of entries.filter(item => item.image)) {
            if (pending.length >= 3 && fitHeight([...pending, entry]) < TARGET_HEIGHT * 0.85
                && fitHeight(pending) <= TARGET_HEIGHT * 1.25) finishRow(false);
            pending.push(entry);
            if (fitHeight(pending) <= TARGET_HEIGHT) finishRow(false);
        }
        if (pending.length) finishRow(true);
        const tags = create('div', 'nd-preset-tags');
        for (const entry of entries.filter(item => !item.image)) tags.append(entry.card);
        if (tags.childElementCount) children.push(tags);
        element.replaceChildren(...children);
        element.scrollTop = scrollTop;
        focused?.focus({ preventScroll: true });
    }

    function scheduleLayout() {
        if (disposed || frame !== null || !entries.length) return;
        frame = win.requestAnimationFrame(layout);
    }

    const sizes = new win.ResizeObserver(() => {
        if (element.clientWidth === lastWidth) return;
        scheduleLayout();
    });
    sizes.observe(element);

    return {
        render(presets, currentId) {
            imageEvents?.abort();
            imageEvents = new win.AbortController();
            const focusedId = element.contains(doc.activeElement) ? doc.activeElement.dataset.presetId : null;
            entries = presets.map(preset => {
                // Keep plain block cards for the supported WebViews, with native keyboard activation.
                const card = create('div', 'nd-preset-card');
                card.classList.toggle('active', preset.id === currentId);
                card.dataset.presetId = preset.id;
                card.tabIndex = 0;
                card.setAttribute('role', 'button');
                card.setAttribute('aria-pressed', String(preset.id === currentId));
                const name = preset.name || COPY.unnamed;
                card.title = name;
                card.setAttribute('aria-label', name);
                card.addEventListener('keydown', event => {
                    if (event.key !== 'Enter' && event.key !== ' ') return;
                    event.preventDefault();
                    card.click();
                });
                const entry = { card, image: null };
                card.classList.toggle('nd-preset-text', !preset.thumbnail);
                if (preset.thumbnail) {
                    const image = create('img', 'nd-preset-thumb');
                    entry.image = image;
                    image.alt = '';
                    image.loading = 'lazy';
                    image.decoding = 'async';
                    image.style.setProperty('width', '100%', 'important');
                    image.addEventListener('load', scheduleLayout, { signal: imageEvents.signal });
                    image.addEventListener('error', () => {
                        console.warn(COPY.thumbnailFailed, { presetId: preset.id });
                        image.remove();
                        entry.image = null;
                        card.style.removeProperty('width');
                        card.classList.add('nd-preset-text');
                        scheduleLayout();
                    }, { once: true, signal: imageEvents.signal });
                    image.src = preset.thumbnail;
                    card.append(image);
                }
                card.append(create('span', 'nd-preset-check', '✓'), create('div', 'nd-preset-name', name));
                return entry;
            });
            element.replaceChildren(...entries.map(entry => entry.card));
            if (!entries.length) element.append(create('div', 'nd-preset-empty', COPY.empty));
            if (focusedId) entries.find(entry => entry.card.dataset.presetId === focusedId)?.card.focus({ preventScroll: true });
            scheduleLayout();
        },
        destroy() {
            disposed = true;
            sizes.disconnect();
            imageEvents?.abort();
            if (frame !== null) win.cancelAnimationFrame(frame);
            entries = [];
        },
    };
}
