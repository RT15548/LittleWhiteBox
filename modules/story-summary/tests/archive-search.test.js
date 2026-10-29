import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { parseHTML } from 'linkedom';
import { createSummaryArchive } from '../archive-view.js';

// Acceptance contracts (silent loss of access to existing memory, not data deletion):
// - Loading or revisiting records must not activate an unsubmitted search value.
// - A user's search survives detail/data refresh; switching views or chats clears it.
function harness(t) {
    const { document, window } = parseHTML(readFileSync(new URL('../story-summary.html', import.meta.url), 'utf8'));
    const previousDocument = globalThis.document;
    const previousMatchMedia = globalThis.matchMedia;
    globalThis.document = document;
    globalThis.matchMedia = () => ({ matches: true, addEventListener() {} });
    t.after(() => {
        if (previousDocument === undefined) delete globalThis.document;
        else globalThis.document = previousDocument;
        if (previousMatchMedia === undefined) delete globalThis.matchMedia;
        else globalThis.matchMedia = previousMatchMedia;
    });
    const $ = id => document.getElementById(id);
    const search = $('archive-search');
    search.value = 'unsubmitted';
    Object.defineProperty($('archive-person-select'), 'value', { value: '', writable: true });
    $('archive-detail').showModal = function () { this.open = true; };
    $('archive-detail').close = function () { this.open = false; };
    const data = {
        events: [{ id: 'e-a', title: 'Alpha', participants: ['Alice'] }, { id: 'e-b', title: 'Beta', participants: ['Bob'] }],
        characters: { main: ['Alice', 'Bob'], relationships: [] }, arcs: [], characterAliases: [],
        facts: [{ id: 'f-a', s: 'Alice', p: 'location', o: 'Alpha' }, { id: 'f-b', s: 'Bob', p: 'location', o: 'Beta' }],
    };
    let selected = 'Alice';
    let timeline = [];
    let facts = [];
    const archive = createSummaryArchive({
        getData: () => data, getSelectedCharacter: () => selected,
        onSelectCharacter(id) { selected = id; archive.refreshRoster(); },
        onTimelineChange() { timeline = archive.timelineEvents(); },
        onFactsChange() { facts = archive.filteredFacts(); },
        onPeopleVisible() {}, onEdit() {}, postMsg() {}, h: value => String(value),
        setHtml(element, html) {
            // eslint-disable-next-line no-unsanitized/property -- Only the archive's templates and this test's fixed fixture data.
            element.innerHTML = html;
        },
    });
    const type = value => { search.value = value; search.dispatchEvent(new window.Event('input')); };
    const people = () => [...$('archive-roster').querySelectorAll('[data-archive-person]')].map(button => button.dataset.archivePerson);
    const view = name => $(`archive-tab-${name}`).click();
    return { archive, data, search, type, people, view, $, document, timeline: () => timeline, facts: () => facts };
}

test('initial load and detail selection cannot silently adopt a DOM-only search value', t => {
    const h = harness(t);
    const before = structuredClone(h.data);
    assert.equal(h.archive.hasTimelineFilter(), false);
    assert.equal(h.search.value, '');
    h.search.value = 'unsubmitted';
    assert.deepEqual(h.archive.timelineEvents().map(event => event.id), ['e-b', 'e-a']);
    h.view('people');
    for (let i = 0; i < 3; i++) {
        h.search.value = 'unsubmitted';
        h.$('archive-roster').querySelector('[data-archive-person]').click();
        h.document.querySelector('[data-close-archive]').click();
        assert.deepEqual(h.people(), ['Alice', 'Bob']);
    }
    h.view('world');
    h.search.value = 'unsubmitted';
    assert.deepEqual(h.archive.filteredFacts().map(fact => fact.id), ['f-a', 'f-b']);
    assert.deepEqual(h.data, before);
});

test('user search is retained across details and refresh, and cleared at view/chat boundaries', t => {
    const h = harness(t);
    h.type('  ALPHA  ');
    assert.deepEqual(h.timeline().map(event => event.id), ['e-a']);
    h.archive.refresh();
    assert.deepEqual(h.archive.timelineEvents().map(event => event.id), ['e-a']);
    h.view('people');
    h.type('alice');
    h.$('archive-roster').querySelector('[data-archive-person]').click();
    h.archive.refresh();
    h.document.querySelector('[data-close-archive]').click();
    assert.deepEqual(h.people(), ['Alice']);
    assert.equal(h.search.value, 'alice');
    h.type('');
    assert.deepEqual(h.people(), ['Alice', 'Bob']);
    h.view('world');
    h.type('beta');
    assert.deepEqual(h.facts().map(fact => fact.id), ['f-b']);
    h.archive.reset();
    h.archive.refresh();
    assert.equal(h.search.value, '');
    assert.deepEqual(h.archive.filteredFacts().map(fact => fact.id), ['f-a', 'f-b']);
    h.view('story');
    assert.deepEqual(h.timeline().map(event => event.id), ['e-b', 'e-a']);
});
