// Contracts: safe report typography and bounded, latest-first entry into each run's edits.
// DOM integration catches reading-state regressions without model/storage mocks.
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { reportMarkdown } from '../maintenance/report-markdown.js';
import { createOperationList } from '../maintenance/operation-list.js';

function documentForTest() {
    return parseHTML('<!doctype html><html><body></body></html>').document;
}

test('reports render headings, lists, emphasis, tables and literal fenced code', () => {
    const document = documentForTest();
    const root = document.createElement('div');
    root.append(reportMarkdown('# Result\n\n- **Known**\n- *Uncertain*\n\n| Fact | State |\n| --- | --- |\n| A | B |\n\n```html\n<button>example</button>\n```', document));
    assert.equal(root.querySelector('h1').textContent, 'Result');
    assert.equal(root.querySelectorAll('li').length, 2);
    assert.equal(root.querySelector('strong').textContent, 'Known');
    assert.equal(root.querySelector('em').textContent, 'Uncertain');
    assert.equal(root.querySelectorAll('td').length, 2);
    assert.equal(root.querySelector('pre code').textContent.trim(), '<button>example</button>');
    assert.equal(root.querySelector('button'), null);
});

test('untrusted reports cannot mount active HTML, styles, images or unsafe links', () => {
    const document = documentForTest();
    const root = document.createElement('div');
    root.append(reportMarkdown([
        '[safe](https://example.com) [unsafe](javascript:alert(1))',
        '<a href="jav&#x61;script:alert(1)" onclick="alert(1)">unsafe entity</a>',
        '<div style="position:fixed" id="tab-agent" class="host"><strong onmouseover="alert(1)">text</strong></div>',
        '<img src="https://example.com/tracker" onerror="alert(1)" alt="image label">',
        '<svg><a xlink:href="javascript:alert(1)">svg</a></svg>',
        '<style>body{display:none}</style><iframe src="https://example.com"></iframe>',
        '<form><input autofocus></form>',
    ].join('\n\n'), document));
    assert.equal(root.querySelectorAll('script,style,iframe,form,input,img,svg,object,embed').length, 0);
    const links = [...root.querySelectorAll('a')];
    assert.equal(links.length, 1);
    assert.equal(links[0].getAttribute('href'), 'https://example.com');
    assert.equal(links[0].getAttribute('rel'), 'noopener noreferrer');
    assert.equal(root.textContent.includes('image label'), true);
    for (const node of root.querySelectorAll('*')) {
        assert.deepEqual([...node.attributes].map(attribute => attribute.name).filter(name => !['href', 'target', 'rel'].includes(name)), []);
    }
});

const anchor = index => ({ kind: 'edit', collection: 'anchors', key: `anchor-${index}`,
    changes: [{ collection: 'anchors', key: `anchor-${index}`, before: { floor: index * 2 + 1 }, after: { floor: index * 2 + 1 } }] });

test('long runs start on the last page, preserve manual paging and separate categories', () => {
    const previousDocument = globalThis.document;
    const document = documentForTest();
    globalThis.document = document;
    try {
        const list = createOperationList(() => document.createElement('section'));
        document.body.append(list.element);
        list.element.querySelector('[role="group"]').scrollIntoView = () => {};
        const operations = Array.from({ length: 85 }, (_, index) => anchor(index));
        const receipt = { operations, eventNames: {}, cutoff: 1000 };
        const visible = () => [...list.element.querySelectorAll('[data-operation-index]')].map(node => Number(node.dataset.operationIndex));
        list.update(receipt);
        assert.deepEqual(visible(), [80, 81, 82, 83, 84]);
        assert.equal(list.element.querySelectorAll('details[open]').length, 0);
        const nav = list.element.querySelector('nav');
        nav.querySelector('button').click();
        assert.deepEqual(visible(), Array.from({ length: 20 }, (_, index) => index + 60));
        const kept = list.element.querySelector('[data-operation-index="60"]');
        list.update({ ...receipt, operations: [...operations, anchor(85)] });
        assert.equal(list.element.querySelector('[data-operation-index="60"]'), kept);
        assert.equal(visible().at(0), 60);
        nav.querySelector('button:last-child').click();
        assert.deepEqual(visible(), [80, 81, 82, 83, 84, 85]);
        const summary = { kind: 'merge', collection: 'events', key: 'event',
            changes: [{ collection: 'events', key: 'event', before: { title: 'episode' }, after: { title: 'episode' } }] };
        list.update({ ...receipt, operations: [...operations, summary] });
        list.element.querySelector('[data-category="summary"]').click();
        assert.deepEqual(visible(), [85]);
        assert.equal(list.element.querySelector('[data-category="summary"]').getAttribute('aria-pressed'), 'true');
        const other = createOperationList(() => document.createElement('section'));
        other.update({ ...receipt, operations: operations.slice(0, 2) });
        assert.equal(other.element.querySelector('[data-category="all"]').getAttribute('aria-pressed'), 'true');
        assert.equal(other.element.querySelectorAll('[data-operation-index]').length, 2);
        list.update({ ...receipt, operations: [anchor(0)] });
        assert.equal(list.element.querySelector('[data-category="all"]').getAttribute('aria-pressed'), 'true');
        assert.deepEqual(visible(), [0]);
    } finally {
        if (previousDocument === undefined) delete globalThis.document;
        else globalThis.document = previousDocument;
    }
});
