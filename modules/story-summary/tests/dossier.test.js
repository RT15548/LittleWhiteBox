import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseHTML } from 'linkedom';
import { buildDossierModel } from '../dossier-model.js';
import { createDossierEditor } from '../dossier-editor.js';
import { applySummarySectionEdit } from '../data/section-edits.js';

// Acceptance contracts:
// - Grouping existing records must leave all active states reachable, resolve
//   existing aliases, and never rewrite stored memory. Cost: invisible memory loss.
// - Editing/deleting one record must preserve unrelated/background data and
//   metadata. Cost: data loss.
// - A failed/pending save keeps the draft; chat switches cannot write it into
//   another chat. Cost: lost input or cross-chat data corruption.
const fixture = () => ({ chatIdentity: 'chat-a', userName: '小林',
    characters: { main: ['林舟', '苏晚'], relationships: [] },
    characterAliases: [{ from: '小林', to: '林舟' }],
    arcs: [{ name: '林舟', trajectory: '学着信任', progress: .3, moments: [{ text: '归还欠条', _addedAt: 4 }] }],
    events: [{ id: 'e1', participants: ['小林'], title: '归还欠条' }],
    removedGraphPeople: ['苏晚'],
    facts: [
        { id: 'f1', s: '林舟', p: '住处', o: '旧码头', _isState: true, since: 2, _addedAt: 2 },
        { id: 'f2', s: '小林', p: '身份', o: '修船匠' },
        { id: 'f3', s: '苏晚', p: '住处', o: '灯塔' },
        { id: 'f4', s: '雨城', p: '天气', o: '大雨' },
        { id: 'f5', s: '未知对象', p: '情况', o: '待确认' },
        { id: 'f6', s: '苏晚', p: '对林舟的看法', o: '值得信任', trend: '投缘' },
        { id: 'f7', s: '林舟', p: '旧住处', o: '山顶', retracted: true },
    ],
});

test('dossier projection partitions states without migrating or hiding unclassified records', () => {
    const data = fixture(), before = structuredClone(data), model = buildDossierModel(data);
    assert.equal(model.people.filter(person => model.key(person.name) === model.key(data.userName)).length, 1);
    assert.deepEqual(model.states('小林').map(f => f.id), ['f1', 'f2']);
    assert.deepEqual(model.states('苏晚').map(f => f.id), ['f3']);
    assert.deepEqual(model.worldFacts.map(f => f.id), ['f4', 'f5']);
    assert.equal(model.relations('小林')[0].id, 'f6');
    assert.equal(model.arc('小林'), data.arcs[0]);
    assert.equal(model.events('林舟')[0], data.events[0]);
    assert.deepEqual(data, before);
});

test('people sharing a surname keep separate states unless an explicit alias links them', () => {
    const data = fixture();
    data.characters.main.push('林朔');
    data.facts.push({ id: 'f8', s: '林朔', p: '住处', o: '山城' });
    const model = buildDossierModel(data);
    assert.deepEqual(model.states('林舟').map(fact => fact.id), ['f1', 'f2']);
    assert.deepEqual(model.states('林朔').map(fact => fact.id), ['f8']);
});

function editorHarness(t) {
    const { document, window } = parseHTML('<html><body></body></html>');
    const prior = globalThis.document;
    globalThis.document = document;
    t.after(() => { if (prior === undefined) delete globalThis.document; else globalThis.document = prior; });
    const data = fixture(), messages = [];
    const editor = createDossierEditor({ getData: () => data, postMsg: (type, payload) => messages.push({ type, ...structuredClone(payload) }),
        h: value => String(value), setHtml(element, html) {
            // eslint-disable-next-line no-unsanitized/property -- Fixed fixture strings in the production template.
            element.innerHTML = html;
        } });
    const dialog = document.querySelector('dialog');
    dialog.showModal = () => { dialog.open = true; };
    dialog.close = () => { dialog.open = false; };
    return { editor, data, messages, dialog,
        value: (name, value) => { dialog.querySelector(`[name="${name}"]`).value = value; },
        save: () => dialog.querySelector('form').dispatchEvent(new window.Event('submit', { cancelable: true, bubbles: true })),
        cancel: () => dialog.dispatchEvent(new window.Event('cancel', { cancelable: true })),
    };
}

test('single-record edit retains metadata and independent background edits after durable acknowledgement', t => {
    const h = editorHarness(t);
    h.editor.open({ record: h.data.facts[0] });
    h.value('o', '山脚');
    h.data.facts[0]._isState = false;
    h.data.facts[2].o = '新灯塔';
    h.data.facts.push({ id: 'new', s: '雨城', p: '道路', o: '封闭' });
    h.save(); h.save(); h.cancel();
    assert.equal(h.messages.length, 1);
    assert.equal(h.dialog.open, true);
    const message = h.messages[0];
    assert.equal(message.previous[0].o, '旧码头');
    assert.equal(message.data.length, 1);
    const next = applySummarySectionEdit(message.section, message.previous, message.data, h.data.facts);
    assert.deepEqual(next[0], { ...h.data.facts[0], o: '山脚' });
    assert.deepEqual(next.slice(1), h.data.facts.slice(1));
    h.editor.receive({ ...message });
    assert.equal(h.dialog.open, false);
});

test('failure preserves draft for retry, stale acknowledgements cannot dismiss another draft', t => {
    const h = editorHarness(t);
    h.editor.open({ record: h.data.facts[0] }); h.value('o', '保存失败仍保留'); h.save();
    const first = h.messages[0];
    h.editor.receive({ ...first, error: '保存失败' });
    assert.equal(h.dialog.open, true);
    assert.equal(h.dialog.querySelector('[name="o"]').value, '保存失败仍保留');
    h.save();
    h.editor.receive(first);
    assert.equal(h.dialog.open, true);
    h.data.chatIdentity = 'chat-b';
    h.editor.setChat('chat-b');
    assert.equal(h.dialog.open, false);
    h.editor.open({ record: h.data.facts[1] });
    h.editor.receive(h.messages[1]);
    assert.equal(h.dialog.open, true);
    h.data.chatIdentity = 'chat-c'; h.save();
    assert.equal(h.messages.length, 2);
});

test('deleting a single record leaves all other facts intact', t => {
    const h = editorHarness(t);
    h.editor.open({ record: h.data.facts[0] });
    h.dialog.querySelector('[data-action="remove"]').click();
    assert.equal(h.messages.length, 0);
    h.dialog.querySelector('[data-action="confirm-remove"]').click();
    const m = h.messages[0];
    assert.deepEqual(applySummarySectionEdit(m.section, m.previous, m.data, h.data.facts), h.data.facts.slice(1));
});

test('editing an arc preserves timestamps on unchanged key moments', t => {
    const h = editorHarness(t);
    h.editor.open({ section: 'arcs', record: h.data.arcs[0] });
    h.value('trajectory', '愿意共同承担'); h.save();
    assert.deepEqual(h.messages[0].data[0].moments, h.data.arcs[0].moments);
    assert.equal(h.messages[0].data[0].trajectory, '愿意共同承担');
});
