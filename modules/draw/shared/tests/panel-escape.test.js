import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import {
    EDITS_SAVED_EVENT, ESCAPE_LAYER_SELECTORS, createEditGuard, hasOpenLayer, installHostPanelEscape, installPanelEscape, isDragging, isHostPopupOpen, onEditsFlush, reportEditsSaved, requestEditsFlush, shouldClosePanelOnEscape,
} from '../panel-escape.js';

// Acceptance contracts (cost: Esc closing the panel while a menu / dialog / drag is the thing the user meant to dismiss, losing a half-typed character card, or stealing Esc from SillyTavern's own popups):
// - Esc closes the panel only when nothing else wants it: no open menu / dialog / popover, no drag, no edited-but-unsaved character card, not a key repeat, not IME composition, no modifiers.
// - Esc with unsaved typing saves first (the page's own flush, serialized with any in-flight save) and closes only when that succeeded; a failed or missing save keeps the panel and the draft, and Esc while saving neither saves twice nor closes twice.
// - The same decision applies whether focus is inside the settings iframe or in the SillyTavern page behind it; in the host page it additionally needs the panel visible, topmost and no ST popup open.
// - The listeners are registered with the panel and removed with it.

const pure = overrides => shouldClosePanelOnEscape({ key: 'Escape', ...overrides });

test('decision: a plain Esc closes; every blocker keeps the panel open', () => {
    assert.equal(pure({}), true);
    assert.equal(shouldClosePanelOnEscape({ key: 'Enter' }), false);
    assert.equal(shouldClosePanelOnEscape({}), false);
    for (const blocker of [
        { layerOpen: true }, { dragging: true }, { unsavedEdit: true }, { repeat: true }, { isComposing: true }, { defaultPrevented: true },
        { shiftKey: true }, { ctrlKey: true }, { altKey: true }, { metaKey: true },
    ]) assert.equal(pure(blocker), false, JSON.stringify(blocker));
});

function page(body = '') {
    const { window, document } = parseHTML(`<html><body>${body}<button class="header-close">x</button></body></html>`);
    const fire = (target, type, extra = {}) => {
        const event = Object.assign(new window.Event(type, { bubbles: true, cancelable: true }), extra);
        target.dispatchEvent(event);
        return event;
    };
    return { window, document, fire };
}

test('layer and drag detection reads the page state', () => {
    const { document } = page();
    assert.equal(hasOpenLayer(document), false);
    document.body.insertAdjacentHTML('beforeend', '<div class="char-menu" hidden></div>');
    assert.equal(hasOpenLayer(document), false, 'a hidden menu is closed');
    document.querySelector('.char-menu').removeAttribute('hidden');
    assert.equal(hasOpenLayer(document), true);
    document.querySelector('.char-menu').remove();
    for (const markup of [
        '<div class="theme-switch-menu"></div>', '<div id="g" class="gallery-modal visible"></div>', '<div data-role="dialog"></div>',
        '<div class="danbooru-panel"></div>', '<div class="lwb-gp-saveform"></div>', '<div class="lwb-gp-confirm"></div>',
    ]) {
        const holder = document.createElement('div');
        holder.innerHTML = markup; // eslint-disable-line no-unsanitized/property -- fixed test markup
        document.body.appendChild(holder);
        assert.equal(hasOpenLayer(document), true, markup);
        holder.remove();
    }
    document.body.insertAdjacentHTML('beforeend', '<div class="gallery-modal"></div><div class="danbooru-panel hidden"></div>');
    assert.equal(hasOpenLayer(document), false, 'closed modal / panel do not count');
    assert.equal(isDragging(document), false);
    for (const className of ['sortable-dragging', 'lwb-ple-dragging', 'lwb-group-resizing']) {
        document.body.classList.add(className);
        assert.equal(isDragging(document), true, className);
        document.body.classList.remove(className);
    }
    assert.ok(ESCAPE_LAYER_SELECTORS.includes('dialog[open]'));
});

test('edit guard: input inside an editing card marks it, closing the card clears it, reopening starts clean', () => {
    const { document, fire } = page('<div id="out"><input id="filter"></div><div class="char-card editing" data-id="c1"><textarea id="t"></textarea></div><div class="char-card" data-id="c2"><textarea id="u"></textarea></div>');
    const guard = createEditGuard({ document });
    assert.equal(guard.hasUnsavedEdit(), false, 'opening a card is not an edit');
    fire(document.getElementById('filter'), 'input');
    assert.equal(guard.hasUnsavedEdit(), false, 'typing outside an edit card does not count');
    fire(document.getElementById('u'), 'input');
    assert.equal(guard.hasUnsavedEdit(), false, 'a card that is not being edited does not count');
    fire(document.getElementById('t'), 'input');
    assert.equal(guard.hasUnsavedEdit(), true);

    const card = document.querySelector('[data-id="c1"]');
    card.classList.remove('editing'); // 保存 / 取消之后
    assert.equal(guard.hasUnsavedEdit(), false);
    card.classList.add('editing'); // 再次打开同一张卡
    assert.equal(guard.hasUnsavedEdit(), false, 'a re-opened card is clean');

    fire(document.getElementById('t'), 'change');
    assert.equal(guard.hasUnsavedEdit(), true, 'change events count too');
    // 点击（保存 / 取消 / 打开别的卡）时对账：卡片已关则清掉
    card.classList.remove('editing');
    fire(document.body, 'click');
    card.classList.add('editing');
    assert.equal(guard.hasUnsavedEdit(), false);

    fire(document.getElementById('t'), 'input');
    assert.equal(guard.hasUnsavedEdit(), true);
    guard.destroy();
    assert.equal(guard.hasUnsavedEdit(), false);
    fire(document.getElementById('t'), 'input');
    assert.equal(guard.hasUnsavedEdit(), false, 'destroyed guards stop listening');
});

test('SD / ComfyUI expanded cards are edit roots keyed by character id', () => {
    const { document, fire } = page('<details class="sd-char-card" data-character-id="a" open><input id="x"></details><details class="sd-char-card" data-character-id="b"><input id="y"></details>');
    const guard = createEditGuard({ document });
    fire(document.getElementById('y'), 'input');
    assert.equal(guard.hasUnsavedEdit(), false);
    fire(document.getElementById('x'), 'input');
    assert.equal(guard.hasUnsavedEdit(), true);
});

test('edit guard: once the edits are saved the card is no longer unsaved, even while it stays open and focused', () => {
    const { document, fire } = page('<div class="char-card editing" data-id="c1"><input id="name"></div><details class="sd-char-card" data-character-id="d" open><input id="x"></details>');
    const guard = createEditGuard({ document });
    fire(document.getElementById('name'), 'input');
    fire(document.getElementById('x'), 'change');
    assert.equal(guard.hasUnsavedEdit(), true);
    reportEditsSaved(document); // 自动保存到“已保存” / 保存设置成功
    assert.ok(document.querySelector('.char-card.editing') && document.querySelector('.sd-char-card[open]'), 'the cards are still open');
    assert.equal(guard.hasUnsavedEdit(), false, 'saved edits do not hold Esc');
    fire(document.getElementById('name'), 'input');
    assert.equal(guard.hasUnsavedEdit(), true, 'typing again after a save is unsaved again');
    document.dispatchEvent(new document.defaultView.CustomEvent(EDITS_SAVED_EVENT));
    assert.equal(guard.hasUnsavedEdit(), false);
    guard.destroy();
    fire(document.getElementById('name'), 'input');
    reportEditsSaved(document);
    assert.doesNotThrow(() => reportEditsSaved(null));
    assert.doesNotThrow(() => reportEditsSaved({}));
});

// linkedom 不区分捕获 / 冒泡阶段，所以监听接线用一个最小的事件树（body → document → window，带捕获 / 冒泡 / stopPropagation / preventDefault）来验证；
// “页面里开着什么”用一组选择器模拟。真实浏览器里的表现另在浏览器里手动核对。
function fakeWorld() {
    const node = (name, parent) => {
        const listeners = [];
        return {
            name, parent, listeners,
            addEventListener(type, fn, capture = false) { listeners.push({ type, fn, capture: Boolean(capture) }); },
            removeEventListener(type, fn) { const index = listeners.findIndex(item => item.type === type && item.fn === fn); if (index >= 0) listeners.splice(index, 1); },
        };
    };
    const win = node('window', null);
    const doc = node('document', win);
    const body = node('body', doc);
    const open = new Set();
    Object.assign(doc, { defaultView: win, body, querySelector: selector => (open.has(selector) ? {} : null) });
    function dispatch(target, init) {
        const event = {
            type: 'keydown', defaultPrevented: false, stopped: false,
            preventDefault() { this.defaultPrevented = true; },
            stopPropagation() { this.stopped = true; },
            ...init,
        };
        const path = [];
        for (let current = target; current; current = current.parent) path.push(current);
        const run = (current, wantCapture) => {
            for (const item of [...current.listeners]) {
                if (item.type === event.type && (wantCapture === null || item.capture === wantCapture)) item.fn(event);
            }
        };
        for (const current of path.slice(1).reverse()) { run(current, true); if (event.stopped) return event; }
        run(path[0], null);
        for (const current of path.slice(1)) { run(current, false); if (event.stopped) return event; }
        return event;
    }
    return { win, doc, body, open, dispatch };
}

function wire(options = {}) {
    const world = fakeWorld();
    const closed = [];
    const dispose = installPanelEscape({ document: world.doc, close: () => closed.push('closed'), ...options });
    return { ...world, closed, dispose, esc: (extra = {}) => world.dispatch(world.body, { key: 'Escape', ...extra }) };
}

test('iframe listener: Esc closes the panel when nothing else wants it', () => {
    const { closed, esc } = wire();
    const event = esc();
    assert.deepEqual(closed, ['closed']);
    assert.equal(event.defaultPrevented, true);
});

test('iframe listener: other keys, modified Esc, key repeat and IME composition do nothing', () => {
    const { closed, esc, dispatch, body } = wire();
    dispatch(body, { key: 'Enter' });
    esc({ ctrlKey: true });
    esc({ repeat: true });
    esc({ isComposing: true });
    esc({ keyCode: 229 });
    assert.deepEqual(closed, []);
});

test('iframe listener: an open menu / dialog / modal gets the Esc and the panel stays, even when that layer closes itself first', () => {
    const { closed, esc, open, doc } = wire();
    open.add('.gallery-modal.visible');
    // 页面自己的处理者（冒泡阶段、不 preventDefault）在我们之前关掉了画廊：我们仍按“事件开始时”的状态判断。
    doc.addEventListener('keydown', () => open.delete('.gallery-modal.visible'));
    esc();
    assert.deepEqual(closed, [], 'the modal consumed this Esc');
    esc();
    assert.deepEqual(closed, ['closed'], 'the next Esc (nothing open) closes the panel');
});

test('iframe listener: a layer that swallows Esc in the capture phase (card menu, drag) keeps the panel open', () => {
    const { closed, esc, open, doc } = wire();
    open.add('.char-menu:not([hidden])');
    doc.addEventListener('keydown', (event) => { if (!open.has('.char-menu:not([hidden])')) return; event.preventDefault(); event.stopPropagation(); open.delete('.char-menu:not([hidden])'); }, true);
    esc();
    assert.deepEqual(closed, []);
    esc();
    assert.deepEqual(closed, ['closed']);
});

test('iframe listener: an Esc already handled (defaultPrevented) by a field or popover does not close the panel', () => {
    const { closed, esc, body } = wire();
    body.addEventListener('keydown', event => event.preventDefault());
    esc();
    assert.deepEqual(closed, []);
});

test('iframe listener: a drag in progress and an edited-but-unsaved card both keep the panel open; unedited cards do not', () => {
    let unsaved = false;
    const { closed, esc, open } = wire({ hasUnsavedEdit: () => unsaved });
    esc();
    assert.deepEqual(closed, ['closed'], 'an open card with no edits does not hold the panel');
    unsaved = true;
    esc();
    assert.deepEqual(closed, ['closed'], 'with unsaved typing, Esc leaves the panel and the draft alone');
    unsaved = false;
    open.add('body.sortable-dragging');
    esc();
    assert.deepEqual(closed, ['closed']);
    open.delete('body.sortable-dragging');
    esc();
    assert.deepEqual(closed, ['closed', 'closed']);
});

test('iframe listener: type, save, Esc — closes with the field still focused; an unsaved or failed edit still holds it', () => {
    const { document, fire } = page('<div class="char-card editing" data-id="c1"><input id="name"></div>');
    const guard = createEditGuard({ document });
    const { closed, esc } = wire({ hasUnsavedEdit: () => guard.hasUnsavedEdit() });
    fire(document.getElementById('name'), 'input');
    esc();
    assert.deepEqual(closed, [], 'typed but not saved yet: the draft is protected');
    reportEditsSaved(document);
    esc();
    assert.deepEqual(closed, ['closed'], 'saved: Esc closes although the card is open');
    fire(document.getElementById('name'), 'input'); // 保存失败 / 名称为空：没有“已保存”，继续保护
    esc();
    assert.deepEqual(closed, ['closed']);
});

const idle = () => new Promise(resolve => setTimeout(resolve, 0));
const deferred = () => { let resolve; const promise = new Promise((done) => { resolve = done; }); return { promise, resolve }; };

test('flush request: every registered save must succeed; nobody registered, a refusal or a throw all count as not saved', async () => {
    const { document } = page();
    assert.equal(await requestEditsFlush(document), false, 'no page save registered: stay blocked');
    assert.equal(await requestEditsFlush(null), false);
    const off = onEditsFlush(document, () => true);
    assert.equal(await requestEditsFlush(document), true);
    const offOk = onEditsFlush(document, async () => ({ ok: true, saved: false }));
    assert.equal(await requestEditsFlush(document), true);
    for (const bad of [() => false, async () => ({ ok: false, error: 'x' }), () => { throw new Error('boom'); }, () => Promise.reject(new Error('boom'))]) {
        const offBad = onEditsFlush(document, bad);
        assert.equal(await requestEditsFlush(document), false);
        offBad();
    }
    off(); offOk();
    assert.equal(await requestEditsFlush(document), false, 'unregistered');
});

test('edit guard flush asks the page to save and reports whether everything was saved', async () => {
    const { document } = page();
    const guard = createEditGuard({ document });
    assert.equal(await guard.flush(), false);
    let calls = 0;
    onEditsFlush(document, () => { calls += 1; return true; });
    assert.equal(await guard.flush(), true);
    assert.equal(calls, 1);
});

test('iframe listener: Esc with unsaved typing saves first and closes after the save succeeded', async () => {
    const save = deferred();
    let flushes = 0;
    const { closed, esc } = wire({ hasUnsavedEdit: () => true, flush: () => { flushes += 1; return save.promise; } });
    const first = esc();
    assert.ok(first.defaultPrevented);
    assert.equal(flushes, 1, 'the save is issued right away');
    await idle();
    assert.deepEqual(closed, [], 'not closed before the host acknowledged');
    save.resolve(true);
    await idle();
    assert.deepEqual(closed, ['closed']);
});

test('iframe listener: Esc pressed again while the save is running neither saves twice nor closes twice', async () => {
    const save = deferred();
    let flushes = 0;
    let unsaved = true;
    const { closed, esc } = wire({ hasUnsavedEdit: () => unsaved, flush: () => { flushes += 1; return save.promise; } });
    esc();
    esc();
    unsaved = false; // “已保存”事件在回执之前就清掉了标记：第二下 Esc 也不能抢先关
    esc();
    assert.equal(flushes, 1);
    assert.deepEqual(closed, []);
    save.resolve(true);
    await idle();
    assert.deepEqual(closed, ['closed']);
    esc();
    assert.deepEqual(closed, ['closed', 'closed'], 'afterwards a plain Esc closes immediately as usual');
    assert.equal(flushes, 1);
});

test('iframe listener: a refused, rejected or missing save keeps the panel open, and Esc can be tried again', async () => {
    for (const outcome of [() => Promise.resolve(false), () => Promise.reject(new Error('boom')), () => { throw new Error('boom'); }, () => Promise.resolve(undefined)]) {
        let attempts = 0;
        const { closed, esc } = wire({ hasUnsavedEdit: () => true, flush: () => { attempts += 1; return outcome(); } });
        esc();
        await idle();
        esc();
        await idle();
        assert.equal(attempts, 2, 'the failure released the lock');
        assert.deepEqual(closed, []);
    }
    const noSave = wire({ hasUnsavedEdit: () => true });
    const event = noSave.esc();
    await idle();
    assert.deepEqual(noSave.closed, [], 'nothing can save here: stay blocked as before');
    assert.ok(!event.defaultPrevented);
});

test('iframe listener: no unsaved edit closes synchronously without saving; menus, drags and handled Esc never trigger a save', async () => {
    let flushes = 0;
    const { closed, esc } = wire({ hasUnsavedEdit: () => false, flush: () => { flushes += 1; return true; } });
    esc();
    assert.deepEqual(closed, ['closed'], 'closed in the same tick');
    const busy = wire({ hasUnsavedEdit: () => true, flush: () => { flushes += 1; return true; } });
    busy.open.add('.char-menu:not([hidden])');
    busy.esc();
    busy.open.delete('.char-menu:not([hidden])');
    busy.open.add('body.sortable-dragging');
    busy.esc();
    busy.open.delete('body.sortable-dragging');
    busy.esc({ defaultPrevented: true }); // 行内重命名等已消费
    busy.esc({ repeat: true });
    busy.esc({ shiftKey: true });
    await idle();
    assert.equal(flushes, 0);
    assert.deepEqual(busy.closed, []);
});

test('iframe listener: type then Esc on a real guard saves through the page hook, then closes', async () => {
    const { document, fire } = page('<div class="char-card editing" data-id="c1"><input id="name"></div>');
    const guard = createEditGuard({ document });
    let saved = 0;
    onEditsFlush(document, () => { saved += 1; reportEditsSaved(document); return { ok: true }; });
    const { closed, esc } = wire({ hasUnsavedEdit: () => guard.hasUnsavedEdit(), flush: () => guard.flush() });
    esc();
    assert.deepEqual([saved, closed.length], [0, 1], 'untouched card: plain close');
    fire(document.getElementById('name'), 'input');
    esc();
    await idle();
    assert.equal(saved, 1);
    assert.deepEqual(closed, ['closed', 'closed']);
    assert.ok(!guard.hasUnsavedEdit());
});

test('iframe listener: dispose removes it', () => {
    const { closed, esc, dispose } = wire();
    dispose();
    esc();
    assert.deepEqual(closed, []);
});

function host({ popup = '', frameBody = '', display = 'block', topmost = true } = {}) {
    const hostEnv = page(`${popup}<div id="overlay"></div>`);
    const overlay = hostEnv.document.getElementById('overlay');
    overlay.style.display = display;
    const frame = { contentDocument: page(frameBody).document };
    if (!topmost) hostEnv.document.elementFromPoint = () => hostEnv.document.body;
    else hostEnv.document.elementFromPoint = () => overlay;
    const forwarded = [];
    const dispose = installHostPanelEscape({
        hostWindow: hostEnv.window,
        getOverlay: () => overlay,
        getFrame: () => frame,
        forward: frameDocument => forwarded.push(frameDocument),
    });
    return { ...hostEnv, overlay, frame, forwarded, dispose, esc: (extra = {}) => hostEnv.fire(hostEnv.document.body, 'keydown', { key: 'Escape', ...extra }) };
}

test('host listener: with the panel visible and topmost and no ST popup, Esc in the SillyTavern page is forwarded into the panel (and kept from ST)', () => {
    const { esc, forwarded, frame } = host();
    const event = esc();
    assert.deepEqual(forwarded, [frame.contentDocument]);
    assert.equal(event.defaultPrevented, true);
});

test('host listener: not stealing Esc from ST popups, hidden panels, panels covered by something else, or modified / repeated keys', () => {
    for (const popup of ['<dialog open></dialog>', '<div class="popup" open></div>', '<div class="select2-container--open"></div>']) {
        const { esc, forwarded } = host({ popup });
        const event = esc();
        assert.deepEqual(forwarded, [], popup);
        assert.equal(event.defaultPrevented, false);
    }
    assert.deepEqual((() => { const env = host({ display: 'none' }); env.esc(); return env.forwarded; })(), [], 'hidden overlay');
    assert.deepEqual((() => { const env = host({ topmost: false }); env.esc(); return env.forwarded; })(), [], 'not topmost');
    const env = host();
    env.esc({ ctrlKey: true });
    env.esc({ repeat: true });
    env.fire(env.document.body, 'keydown', { key: 'Enter' });
    assert.deepEqual(env.forwarded, []);
    env.overlay.remove();
    env.esc();
    assert.deepEqual(env.forwarded, [], 'a removed overlay');
    assert.equal(isHostPopupOpen(env.document), false);
});

test('host listener: the panel closing path end to end — forwarded Esc reaches the iframe listener, which clicks the same ✕ and honours its own blockers', () => {
    const hostEnv = page('<div id="overlay"></div>');
    const overlay = hostEnv.document.getElementById('overlay');
    overlay.style.display = 'block';
    const inner = page('<div class="char-menu"></div>');
    let clicks = 0;
    inner.document.querySelector('.header-close').addEventListener('click', () => { clicks += 1; });
    installPanelEscape({ document: inner.document, close: () => inner.document.querySelector('.header-close')?.click() });
    installHostPanelEscape({
        hostWindow: hostEnv.window,
        getOverlay: () => overlay,
        getFrame: () => ({ contentDocument: inner.document }),
        forward: frameDocument => frameDocument.body.dispatchEvent(Object.assign(new inner.window.Event('keydown', { bubbles: true, cancelable: true }), { key: 'Escape' })),
    });
    hostEnv.fire(hostEnv.document.body, 'keydown', { key: 'Escape' });
    assert.equal(clicks, 0, 'the open menu in the panel takes the first Esc');
    inner.document.querySelector('.char-menu').setAttribute('hidden', '');
    hostEnv.fire(hostEnv.document.body, 'keydown', { key: 'Escape' });
    assert.equal(clicks, 1);
});

test('host listener: dispose removes it', () => {
    const { esc, forwarded, dispose } = host();
    dispose();
    esc();
    assert.deepEqual(forwarded, []);
});

test('wiring: the shared page entry installs the iframe listener bound to the header ✕; each host module registers on overlay creation and disposes on hide', () => {
    const entry = readFileSync(new URL('../settings-page.js', import.meta.url), 'utf8');
    assert.match(entry, /installPanelEscape\(\{[^}]*close: \(\) => document\.querySelector\('\.header-close'\)\?\.click\(\)[^}]*flush: \(\) => editGuard\.flush\(\)/s);
    for (const [file, overlayVar, frameVar] of [
        ['../../providers/novelai/novel-draw.js', 'overlay', 'iframe'],
        ['../../providers/sd-webui/sd-draw.js', 'overlayElement', 'overlayFrame'],
        ['../../providers/comfyui/comfy-draw.js', 'overlayElement', 'overlayFrame'],
    ]) {
        const source = readFileSync(new URL(file, import.meta.url), 'utf8');
        assert.ok(source.includes(`installHostPanelEscape({ hostWindow: window, getOverlay: () => ${overlayVar}, getFrame: () => ${frameVar} })`), `${file} registers`);
        assert.equal((source.match(/hostEscapeDispose\?\.\(\);/g) || []).length, 1, `${file} disposes once, in the hide path`);
        assert.ok(source.indexOf('hostEscapeDispose?.();') < source.lastIndexOf('.remove();', source.indexOf('hostEscapeDispose?.();') + 400), `${file}: disposed before the overlay is removed`);
    }
    const reports = (file, text) => assert.ok(readFileSync(new URL(file, import.meta.url), 'utf8').includes(text), `${file} reports saved edits`);
    reports('../../providers/novelai/novel-draw-page.js', "if (status === 'saved') reportEditsSaved(document);");
    reports('../../providers/novelai/novel-draw-page.js', 'onEditsFlush(document, flushCharacterEditorForEscape);');
    reports('../../providers/sd-webui/sd-draw.js', 'onEditsFlush(getSettingsDocument(), () => saveAllSettings({ notify: false }));');
    reports('../../providers/comfyui/comfy-draw.js', 'onEditsFlush(getSettingsDocument(), () => saveAllSettings({ notify: false }));');
    for (const file of ['../../providers/sd-webui/sd-draw.js', '../../providers/comfyui/comfy-draw.js']) {
        reports(file, 'runPostSaveHooks = async () => {\n        reportEditsSaved(getSettingsDocument());');
    }
    for (const relative of ['../../providers/novelai/novel-draw.html', '../../providers/sd-webui/sd-draw.html', '../../providers/comfyui/comfy-draw.html']) {
        assert.match(readFileSync(new URL(relative, import.meta.url), 'utf8'), /class="header-close"/, `${relative} has the ✕ the Esc handler clicks`);
    }
});
