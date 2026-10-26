import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { createPlannerBypassRequests } from '../ena-planner-requests.js';

test('an outstanding bypass identity does not retain the native message after host return', () => {
    const moduleUrl = new URL('../ena-planner-requests.js', import.meta.url).href;
    const child = spawnSync(process.execPath, ['--expose-gc', '--input-type=module', '-e', `
        import assert from 'node:assert/strict';
        import { setImmediate } from 'node:timers/promises';
        import { createPlannerBypassRequests } from ${JSON.stringify(moduleUrl)};
        const requests = createPlannerBypassRequests({createMarker:()=>'<identity>'});
        const { reference, data } = (() => {
            const source = [{mes:'original'}];
            const native = [{...source[0]}];
            requests.reserve(native,source);
            return {reference:new WeakRef(native[0]), data:{prompt:native[0].mes}};
        })();
        for(let i=0;i<20;i++) {
            await setImmediate();
            global.gc();
            if(!reference.deref()) break;
        }
        assert.equal(reference.deref(),undefined,'registry retained the native message');
        assert.equal(requests.pending(),true);
        assert.equal(requests.matches(data,'prompt'),true);
        assert.equal(requests.take(data,'prompt'),true);
        assert.equal(data.prompt,'original');
        assert.equal(requests.pending(),false);
    `], { encoding: 'utf8', timeout: 10_000 });
    assert.equal(child.status, 0, child.stderr || String(child.error || 'GC fixture failed'));
});

function fixture() {
    let id = 0;
    const requests = createPlannerBypassRequests({ createMarker: () => `\ufeff${'\u2000'.repeat(++id)}\ufeff` });
    const source = [{ is_user: true, mes: ' original \n' }];
    function reserve() {
        const copy = source.map(message => ({ ...message }));
        requests.reserve(copy, source);
        return { copy, marker: copy[0].mes.slice(source[0].mes.length) };
    }
    return { requests, source, reserve };
}

for (const field of ['prompt', 'input', 'messages']) {
    test(`untyped ${field} request is recognized without changing other text`, () => {
        const f = fixture();
        const { copy, marker } = f.reserve();
        const text = ` prefix \n${marker}\n suffix  `;
        const data = { [field]: field === 'messages' ? [{ role: 'user', content: text }] : text };
        const before = structuredClone(data);
        assert.equal(f.requests.pending(), true);
        assert.equal(f.requests.matches(data, field), true);
        assert.deepEqual(data, before);
        assert.equal(f.requests.take(data, field), true);
        assert.equal(field === 'messages' ? data[field][0].content : data[field], ' prefix \n\n suffix  ');
        assert.equal(copy[0].mes, f.source[0].mes);
        assert.equal(f.requests.pending(), false);
        assert.equal(f.requests.take(data, field), false);
    });
}

test('CFG cleans each field once and preserves multimodal attachments', () => {
    const f = fixture();
    const { marker } = f.reserve();
    const image = { type: 'image_url', image_url: { url: `image:${marker}` } };
    const data = { messages: [{ role: 'user', content: [{ type: 'text', text: `a${marker}b` }, image] }],
        negative_prompt: `neg${marker}`, other: marker };
    assert.equal(f.requests.take(data, 'messages', ['negative_prompt']), true);
    assert.equal(data.messages[0].content[0].text, 'ab');
    assert.equal(data.messages[0].content[1], image);
    assert.equal(data.negative_prompt, 'neg');
    assert.equal(data.other, marker);
});

test('concurrent native copies may arrive out of order', () => {
    const f = fixture();
    const first = f.reserve();
    const second = f.reserve();
    assert.equal(f.requests.take({ input: second.copy[0].mes }, 'input'), true);
    assert.equal(f.requests.pending(), true);
    assert.equal(first.copy[0].mes.endsWith(first.marker), true);
    assert.equal(f.requests.take({ prompt: first.copy[0].mes }, 'prompt'), true);
    assert.equal(f.requests.pending(), false);
});

test('persistent objects and missing string messages are rejected', () => {
    const f = fixture();
    assert.throws(() => f.requests.reserve([...f.source], f.source), /persistent/);
    assert.throws(() => f.requests.reserve([{ mes: null }], f.source), /missing/);
    assert.throws(() => f.requests.reserve([], f.source), /missing/);
    assert.equal(f.source[0].mes, ' original \n');
    assert.equal(f.requests.pending(), false);
});

test('marks the last string message without adding a message', () => {
    const f = fixture();
    const copy = [{ mes: 'first' }, { mes: '' }, { mes: null }];
    f.requests.reserve(copy, f.source);
    assert.equal(copy.length, 3);
    assert.equal(copy[0].mes, 'first');
    assert.notEqual(copy[1].mes, '');
    assert.equal(f.requests.take({ prompt: copy[1].mes }, 'prompt'), true);
    assert.equal(copy[1].mes, '');
});

test('restoration does not overwrite third-party changes to native copy', () => {
    const f = fixture();
    const { copy, marker } = f.reserve();
    copy[0].mes = 'third-party replacement';
    assert.equal(f.requests.take({ prompt: marker }, 'prompt'), true);
    assert.equal(copy[0].mes, 'third-party replacement');
});

test('default marker is whitespace and does not alter trimmed WI text', () => {
    const requests = createPlannerBypassRequests();
    const source = [{ mes: ' source \n' }];
    const copy = [{ ...source[0] }];
    requests.reserve(copy, source);
    const marker = copy[0].mes.slice(source[0].mes.length);
    assert.match(marker, /^\s+$/u);
    assert.doesNotMatch(marker, /[\r\n]/);
    assert.equal(copy[0].mes.trim(), source[0].mes.trim());
    assert.equal(`Name: ${copy[0].mes}`.trim(), `Name: ${source[0].mes}`.trim());
    assert.equal(requests.take({ prompt: copy[0].mes }, 'prompt'), true);
});

for (const kind of ['duplicate-primary', 'duplicate-companion', 'different-primary', 'different-companion']) {
    test(`${kind} is rejected atomically`, () => {
        const f = fixture();
        const a = f.reserve();
        const b = f.reserve();
        const data = { prompt: a.marker, negative_prompt: a.marker };
        if (kind === 'duplicate-primary') data.prompt += a.marker;
        if (kind === 'duplicate-companion') data.negative_prompt += a.marker;
        if (kind === 'different-primary') data.prompt += b.marker;
        if (kind === 'different-companion') data.negative_prompt = b.marker;
        const before = structuredClone(data);
        assert.throws(() => f.requests.take(data, 'prompt', ['negative_prompt']), /Conflicting/);
        assert.deepEqual(data, before);
        assert.equal(f.requests.pending(), true);
        assert.equal(a.copy[0].mes.endsWith(a.marker), true);
        assert.equal(b.copy[0].mes.endsWith(b.marker), true);
    });
}

test('companion-only match is observable but cannot authorize primary', () => {
    const f = fixture();
    const { marker } = f.reserve();
    const data = { prompt: 'unidentified', negative_prompt: marker };
    assert.equal(f.requests.matches(data, 'prompt', ['negative_prompt']), true);
    assert.equal(f.requests.take(data, 'prompt', ['negative_prompt']), false);
    assert.equal(data.negative_prompt, marker);
    assert.equal(f.requests.pending(), true);
});

test('unknown payloads leave registry and source untouched', () => {
    const f = fixture();
    f.reserve();
    for (const data of [null, {}, { prompt: 'unknown' }]) {
        assert.equal(f.requests.matches(data, 'prompt'), false);
        assert.equal(f.requests.take(data, 'prompt'), false);
    }
    assert.equal(f.requests.pending(), true);
    assert.equal(f.source[0].mes, ' original \n');
});
