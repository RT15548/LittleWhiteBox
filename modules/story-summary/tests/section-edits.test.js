import assert from 'node:assert/strict';
import { test } from 'node:test';
import { applySummarySectionEdit } from '../data/section-edits.js';
import { parseHTML } from 'linkedom';
import { uiEntry } from './helpers/story-summary-entry.js';

// Acceptance: untouched records and fields follow background work; only explicit
// user changes override it. Cost: lost Agent work or resurrected withdrawn memory.
test('event editing preserves background changes and removals', () => {
    const before = [{ id: 'a', title: 'old', summary: 'old source', _addedAt: 2 }, { id: 'b', title: 'withdrawn' }];
    const edited = structuredClone(before); edited[0].title = 'user title';
    const current = [{ id: 'a', title: 'agent title', summary: 'new source', _addedAt: 2 }, { id: 'c', title: 'new' }];
    assert.deepEqual(applySummarySectionEdit('events', before, edited, current), [
        { id: 'a', title: 'user title', summary: 'new source', _addedAt: 2 }, { id: 'c', title: 'new' },
    ]);
    assert.equal(current[0].title, 'agent title');
});

test('fact editor does not replace IDs or hidden maintenance fields', () => {
    const before = [{ id: 'f1', s: 'A', p: 'location', o: 'old', _isState: true }];
    const edited = [{ s: 'A', p: 'location', o: 'user edit' }];
    const current = [{ ...before[0], id: 'f2', since: 9, _isState: false }];
    assert.deepEqual(applySummarySectionEdit('facts', before, edited, current), [{ ...current[0], o: 'user edit' }]);
});

test('character and relationship edits preserve independent maintenance', () => {
    const before = { main: [{ name: 'A', _addedAt: 1 }], relationships: [{ from: 'A', to: 'B', label: 'old', trend: '陌生' }] };
    const edited = { main: [...before.main, { name: 'C' }], relationships: [{ ...before.relationships[0], label: 'user edit' }] };
    const current = { main: [{ name: 'D', _addedAt: 8 }], relationships: [{ ...before.relationships[0], trend: '投缘' }] };
    assert.deepEqual(applySummarySectionEdit('characters', before, edited, current), {
        main: [{ name: 'D', _addedAt: 8 }, { name: 'C' }],
        relationships: [{ from: 'A', to: 'B', label: 'user edit', trend: '投缘' }],
    });
});

for (const [section, key] of [['keywords', 'text'], ['arcs', 'name']]) {
    test(`${section} preserves background additions while applying explicit additions and deletions`, () => {
        const before = [{ [key]: 'old' }];
        const edited = [{ [key]: 'user added' }];
        assert.deepEqual(applySummarySectionEdit(section, before, edited, [...before, { [key]: 'agent added' }]),
            [{ [key]: 'agent added' }, { [key]: 'user added' }]);
    });
}

// Acceptance: UI defaults are not user edits and must not overwrite background
// corrections when the user saves unchanged. Cost: silent loss of maintained data.
test('an editor default does not become an unintended change', () => {
    const { document } = parseHTML('<div id="editor-struct"></div><textarea id="editor-ta"></textarea>'
        + '<div id="editor-title"></div><div id="editor-hint"></div><div id="editor-err"></div><div id="editor-modal"></div>');
    const messages = [], summaryData = { keywords: [{ text: 'A' }] };
    const ui = uiEntry(['openEditor', 'closeEditor', 'readEditorData', 'saveEditor', 'preserveAddedAt'], {
        currentEditSection: null, currentEditBaseline: null, structuredClone, summaryData, archiveView: { closeDialogs() {} },
        SECTION_META: { keywords: { title: '', hint: '' } }, $: id => document.getElementById(id),
        postMsg: (type, data) => messages.push(structuredClone({ type, ...data })), renderKeywords() {},
    });
    ui.openEditor('keywords');
    summaryData.keywords[0].weight = '核心';
    ui.saveEditor();
    const saved = messages.find(item => item.type === 'UPDATE_SECTION');
    assert.deepEqual(applySummarySectionEdit('keywords', saved.previous, saved.data, summaryData.keywords),
        [{ text: 'A', weight: '核心' }]);
});
