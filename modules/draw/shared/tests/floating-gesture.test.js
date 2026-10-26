import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import { parse } from 'acorn';
import { build } from 'esbuild';
import { parseHTML } from 'linkedom';

// Exercise the real mounted controller. Only paid operations and host I/O are replaced.
test('floating gesture admission never turns drag/cancel into a paid action', async t => {
    const { document, window } = parseHTML('<html><head></head><body><div id="chat"><div class="mes"><div class="mes_text"><div class="xb-nd-img"><img></div></div></div></div></body></html>');
    const saved = new Map();
    const counters = { draws: 0, jumps: 0 };
    const prior = { document: globalThis.document, window: globalThis.window, localStorage: globalThis.localStorage };
    Object.assign(globalThis, { document, window, localStorage: { getItem: k => saved.get(k) ?? null, setItem: (k, v) => saved.set(k, v) } });
    Object.assign(window, { innerWidth: 800, innerHeight: 800 });
    window.HTMLElement.prototype.getBoundingClientRect = function () { return { left: parseFloat(this.style.left) || 100, top: parseFloat(this.style.top) || 100 }; };
    window.HTMLElement.prototype.setPointerCapture = function (id) { this.captured = id; };
    window.HTMLElement.prototype.hasPointerCapture = function (id) { return this.captured === id; };
    window.HTMLElement.prototype.releasePointerCapture = function () { this.captured = null; };
    const picture = document.querySelector('.xb-nd-img');
    Object.assign(picture, { offsetWidth: 100, offsetHeight: 100, scrollIntoView: () => { counters.jumps++; } });
    picture.getBoundingClientRect = () => ({ top: 600, bottom: 700 });
    globalThis.__floatingGestureTest = counters;
    let api;
    t.after(() => { api?.destroyFloatingButton(); Object.assign(globalThis, prior); delete globalThis.__floatingGestureTest; });
    const url = new URL('../../providers/novelai/floating-panel.js', import.meta.url);
    let source = await readFile(url, 'utf8');
    const imports = parse(source, { ecmaVersion: 'latest', sourceType: 'module' }).body.filter(n => n.type === 'ImportDeclaration');
    const stubs = {
        getSettings: '()=>({showFloatingButton:true,mode:"manual",paramsPresets:[]})',
        findLastAIMessageId: '()=>0',
        generateAndInsertImages: 'async()=>{globalThis.__floatingGestureTest.draws++;}',
        getContext: '()=>({chat:[]})',
        getPendingDrawWorkState: 'async()=>null',
        FloorImageBusyError: 'class extends Error {}',
        DRAW_SLOT_COPY: '{}',
    };
    for (const item of imports.reverse()) {
        if (/max-images|draw-capsule-copy|async-errors|draw-visuals|theme-switch/.test(item.source.value)) continue;
        const replacement = item.specifiers.map(spec => `const ${spec.local.name}=${stubs[spec.local.name] ?? '()=>null'};`).join('\n');
        source = source.slice(0, item.start) + replacement + source.slice(item.end);
    }
    const bundle = await build({ stdin: { contents: source, resolveDir: fileURLToPath(new URL('.', url)) }, bundle: true, write: false, platform: 'node', format: 'esm' });
    // eslint-disable-next-line no-unsanitized/method -- Local controller and fixed host stubs only.
    api = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
    api.createFloatingButton();
    const root = document.querySelector('.nd-floating-global');
    const draw = root.querySelector('.nd-btn-draw');
    const next = root.querySelector('.nd-img-jump-next');
    const emit = (target, type, extra = {}) => {
        const e = new window.Event(type, { bubbles: true, cancelable: true });
        Object.assign(e, { button: 0, pointerId: 1, clientX: 100, clientY: 100, detail: 1 }, extra);
        target.dispatchEvent(e);
    };
    for (const target of [draw, root.querySelector('.nd-btn-menu'), root.querySelector('.nd-img-jump-prev'), next]) {
        emit(target, 'pointerdown');
        emit(root, 'pointermove', { clientX: 150, clientY: 160 });
        emit(root, 'pointerup', { clientX: 150, clientY: 160 });
        emit(target, 'click');
        assert.deepEqual(counters, { draws: 0, jumps: 0 });
        assert.equal(root.classList.contains('expanded'), false);
    }
    for (const type of ['pointercancel', 'lostpointercapture']) {
        emit(draw, 'pointerdown');
        emit(root, 'pointermove', { clientX: 150 });
        emit(root, type);
        emit(root, 'pointerup');
        emit(draw, 'click');
        assert.equal(counters.draws, 0);
    }
    emit(draw, 'pointerdown'); emit(root, 'pointerup'); emit(draw, 'click');
    assert.equal(counters.draws, 1);
    emit(next, 'pointerdown'); emit(root, 'pointerup'); emit(next, 'click');
    assert.equal(counters.jumps, 1);
    emit(draw, 'click', { detail: 0 });
    assert.equal(counters.draws, 2);
    // Selecting a quick-menu field must not capture a pointer or move the control.
    const before = root.style.cssText;
    emit(root.querySelector('select'), 'pointerdown');
    emit(root, 'pointermove', { clientX: 180 }); emit(root, 'pointerup');
    assert.equal(root.style.cssText, before);
    assert.equal(counters.draws, 2);
    // Docking is a gesture result; the next tap only restores the control.
    emit(draw, 'pointerdown'); emit(root, 'pointermove', { clientX: -1000 }); emit(root, 'pointerup');
    emit(draw, 'pointerdown'); emit(root, 'pointerup'); emit(draw, 'click');
    assert.equal(counters.draws, 2);
    const theme = root.querySelector('[data-role="theme-switch"]');
    assert.ok(theme, 'the actual floating controller mounts its theme button');
    const oldTheme = document.documentElement.getAttribute('data-draw-theme');
    emit(theme, 'pointerdown'); emit(root, 'pointerup'); emit(theme, 'click');
    assert.notEqual(document.documentElement.getAttribute('data-draw-theme'), oldTheme);
    assert.equal(counters.draws, 2, 'changing the theme never requests an image');
});
