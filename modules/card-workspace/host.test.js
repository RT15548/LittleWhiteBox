import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { COPY } from './copy.js';
import { equalJson, equalText } from './comparison.js';
import { CARD_FIELDS, TEXT_FIELDS, cardFiles, locateFile, projectCard, projectItem, json } from './files.js';
import { ITEM_KINDS, itemDocumentValue, serializeItemDocument, parseItemDocument } from './item-document.js';
import { rebaseCardName } from './rename.js';

// C1: newline representation and JSON key order cannot block unchanged content;
// real text/array/value changes still conflict (lost edits / false save failures).
function harness() {
    const card = { name: 'fixture', avatar: 'fixture.png', data: { extensions: { regex_scripts: [{ id: 'one', scriptName: 'one', replaceString: 'old' }] } } };
    let book = { entries: { 1: { uid: 1, content: 'old', comment: 'one' } } }, writes = 0, design = null;
    const ctx = { characters: [card], characterId: 0, eventSource: { emit: async () => {} }, eventTypes: {} };
    const reversed = obj => Object.fromEntries(Object.entries(obj).reverse());
    const source = readFileSync(new URL('./host.js', import.meta.url), 'utf8').replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '');
    const api = runInNewContext(source + '\n({assertUnchanged,saveFile})', {
        COPY, equalJson, equalText, CARD_FIELDS, projectCard, projectItem, json, structuredClone, ITEM_KINDS, itemDocumentValue,
        variableCardHost: () => ({}), getContext: () => ctx, getRequestHeaders: () => ({}), readDesign: async () => design,
        writeDesign: async (avatar, content) => { writes++; design = content.trim() ? content : null; },
        DOMPurify: { sanitize: v => v }, select_selected_character() {}, allowScopedScripts() {},
        newWorldInfoEntryTemplate: {}, originalWIDataKeyMap: {}, setWIOriginalDataValue() {},
        worldInfoCache: new Map(), updateWorldInfoList: async () => {},
        fetch: async (url, options) => {
            const body = JSON.parse(options.body);
            if (url === '/api/characters/merge-attributes') {
                writes++;
                Object.assign(card.data, body.data);
                if (body.data.extensions?.regex_scripts) card.data.extensions.regex_scripts = body.data.extensions.regex_scripts.map(reversed);
            }
            else if (url === '/api/worldinfo/edit') { writes++; book = body.data; book.entries[1] = reversed(book.entries[1]); }
            return { ok: true, json: async () => structuredClone(url.includes('worldinfo') ? book : card) };
        },
    });
    return { ...api, writes: () => writes, book: () => book, card: () => card };
}

test('C1: only line-ending representation is ignored; JSON settings retain semantic conflict checks', () => {
    const { assertUnchanged } = harness();
    assert.equal(assertUnchanged({ originalContent: 'a\nb\n', content: 'A\nb\n' }, 'a\r\nb\r\n'), true);
    assert.equal(assertUnchanged({ originalContent: 'old', content: 'a\nb' }, 'a\r\nb'), false);
    for (const changed of ['a\nc\n', 'a \nb\n', 'a\nb', 'a\n\nb\n']) {
        assert.throws(() => assertUnchanged({ originalContent: 'a\nb\n', content: 'A\nb\n' }, changed), { message: COPY.conflict });
    }
    assert.equal(assertUnchanged({ originalContent: '{"a":1,"b":2}', content: '{"a":3,"b":2}' }, '{"b":2,"a":1}', true), true);
    assert.equal(equalJson({ a: [1, 2] }, { a: [2, 1] }), false);
});

// Acceptance: clearing a saved design elsewhere must not let an old draft
// silently restore it; a genuinely new design can still be saved (lost work).
test('design saves distinguish a new document from a remotely cleared baseline', async () => {
    const host = harness(), target = { avatar: 'fixture.png', kind: 'design' };
    await assert.rejects(host.saveFile(target, { originalContent: 'previous', content: 'draft' }), { message: COPY.conflict });
    assert.equal(host.writes(), 0);
    assert.equal((await host.saveFile(target, { content: 'new' })).content, 'new');
    assert.equal((await host.saveFile(target, { originalContent: 'new', content: '  \n' })).content, '');
    assert.equal((await host.saveFile(target, { originalContent: '', content: 'next' })).content, 'next');
});

test('metadata rebased after a host rename can save unrelated edits without reverting the name', async () => {
    const host = harness();
    host.card().data.name = 'Old';
    const originalContent = json(projectCard(host.card().data));
    const file = { originalContent, content: JSON.stringify({ ...JSON.parse(originalContent), creator: 'new author' }) };
    host.card().data.name = 'New';
    await host.saveFile({ avatar: 'fixture.png', kind: 'card' }, rebaseCardName(file, 'New'));
    assert.equal(host.card().data.name, 'New');
    assert.equal(host.card().data.creator, 'new author');
});

test('C1: regex and worldbook saves confirm equal JSON despite reordered response keys', async () => {
    const host = harness();
    for (const target of [{ avatar: 'fixture.png', kind: 'regex', id: 'one' },
        { avatar: 'fixture.png', kind: 'world', id: 1, book: 'fixture' }]) {
        const value = target.kind === 'world' ? host.book().entries[1] : host.card().data.extensions.regex_scripts[0];
        const originalContent = projectItem(target, value), bodyField = ITEM_KINDS[target.kind].body;
        const result = await host.saveFile(target, { content: projectItem(target, { ...value, [bodyField]: 'new' }), originalContent });
        assert.equal(parseItemDocument(target.kind, result.content).body, 'new');
    }
    assert.equal(host.writes(), 2);
});

// Acceptance: opening a card preserves empty field/greeting baselines so they
// can be filled and saved; concurrent host edits still conflict (lost author work).
test('empty and populated card fields retain writable baselines without overwriting host edits', async () => {
    for (const initial of [undefined, null, '', 'existing text']) {
        const host = harness(), data = host.card().data;
        const keys = [...TEXT_FIELDS, 'first_mes'];
        for (const key of keys) if (initial !== undefined) data[key] = initial;
        data.alternate_greetings = ['keep alternate', ''];
        const files = cardFiles('fixture.png', data, []);
        for (const key of keys) {
            const relative = key === 'first_mes' ? 'message/0.md' : `${key}.md`;
            const file = files.find(item => item.path.endsWith(`/${relative}`));
            assert.ok(file, relative);
            assert.equal(file.content, initial || '');
            const edit = { ...file, originalContent: file.content, content: `filled ${key}` };
            const target = locateFile(file.path);
            assert.equal((await host.saveFile(target, edit)).content, edit.content);
            assert.equal(data[key], edit.content);
            const writes = host.writes();
            assert.equal((await host.saveFile(target, edit)).unchanged, true);
            data[key] = 'edited in host';
            await assert.rejects(host.saveFile(target, edit), { message: COPY.conflict });
            assert.equal(data[key], 'edited in host');
            assert.equal(host.writes(), writes);
        }
        assert.deepEqual(data.alternate_greetings, ['keep alternate', '']);
    }
});

// Activation warnings must not induce edits to a valid route; unchanged saves retain the warning (incorrect card changes).
test('worldbook saves and unchanged saves report missing standard activation settings', async () => {
    const host = harness();
    const target = { avatar: 'fixture.png', kind: 'world', id: 1, book: 'fixture' };
    const originalContent = projectItem(target, host.book().entries[1]);
    const content = projectItem(target, { ...host.book().entries[1], content: 'new' });
    assert.equal((await host.saveFile(target, { content, originalContent })).missingActivationConfig, true);
    const unchanged = await host.saveFile(target, { content, originalContent: content });
    assert.equal(unchanged.unchanged, true);
    assert.equal(unchanged.missingActivationConfig, true);
    let saved = content;
    for (const route of [{ key: ['港口'] }, { constant: true }, { disable: true }, { vectorized: true }]) {
        const result = await host.saveFile(target, { content: serializeItemDocument('world', { ...itemDocumentValue('world', saved), ...route }), originalContent: saved });
        assert.equal(result.missingActivationConfig, undefined, JSON.stringify(route));
        saved = (await host.saveFile(target, { content: serializeItemDocument('world', { ...itemDocumentValue('world', result.content), key: [], constant: false, disable: false, vectorized: false }), originalContent: result.content })).content;
    }
});

test('worldbook activation decorators suppress the configuration warning only when recognized by the host', async () => {
    for (const [content, warning] of [['@@activate\nAlways active', undefined], ['@@unknown\n@@@activate\nFallback', undefined],
        ['Body\n@@activate', true], ['@@@activate\nNo fallback', true], ['@@activate_extra\nUnknown', true]]) {
        const host = harness();
        const target = { avatar: 'fixture.png', kind: 'world', id: 1, book: 'fixture' };
        const result = await host.saveFile(target, { content: projectItem(target, { ...host.book().entries[1], content }), originalContent: projectItem(target, host.book().entries[1]) });
        assert.equal(result.missingActivationConfig, warning, content);
        assert.equal((await host.saveFile(target, { content: result.content, originalContent: result.content })).missingActivationConfig, warning);
    }
});
