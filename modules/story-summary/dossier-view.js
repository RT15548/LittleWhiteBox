import { DOSSIER_COPY as C } from './dossier-copy.js';
import { buildDossierModel } from './dossier-model.js';
import { parseRelationTarget } from './data/fact-predicates.js';

export function createDossierView({ getData, getSelectedCharacter, editor, setHtml, h }) {
    const root = document.getElementById('profile-content');
    let tab = 'states';
    let personId = null;
    const blank = text => `<p class="dossier-empty">${text}</p>`;
    const edit = index => `<button class="archive-text" data-edit-fact="${index}">${C.edit}</button>`;
    function render() {
        const data = getData();
        const model = buildDossierModel(data);
        const person = model.people.find(person => person.id === getSelectedCharacter());
        if (!person) { setHtml(root, blank(C.noPerson)); return; }
        if (personId !== person.id) { tab = 'states'; personId = person.id; }
        const arc = model.arc(person.name);
        const facts = model.states(person.name);
        const relations = model.relations(person.name);
        const events = model.events(person.name);
        const aliases = model.aliases(person.name);
        let content;
        if (tab === 'states') {
            content = `<div class="dossier-toolbar"><span>${C.states}</span><button class="archive-text" data-add-fact>${C.add}</button></div>`
                + (facts.length ? `<dl class="dossier-facts">${facts.map(fact => `<div><dt>${h(fact.p)}</dt><dd>${h(fact.o)}</dd>${edit(data.facts.indexOf(fact))}</div>`).join('')}</dl>` : blank(C.noStates));
        } else if (tab === 'relations') {
            content = `<div class="dossier-toolbar"><span>${C.relations}</span><button class="archive-text" data-add-relation>${C.addRelation}</button></div>`
                + (relations.length ? `<div class="dossier-relations">${relations.map(fact => {
                    const outgoing = model.key(fact.s) === model.key(person.name);
                    const other = outgoing ? parseRelationTarget(fact.p) : fact.s;
                    return `<article><header><button class="dossier-person-link" data-archive-person="${h(other)}">${h(outgoing ? C.outgoing(other) : C.incoming(other))}</button>${fact.trend ? `<span class="dossier-badge">${h(fact.trend)}</span>` : ''}${edit(data.facts.indexOf(fact))}</header><p>${h(fact.o)}</p></article>`;
                }).join('')}</div>` : blank(C.noRelations));
        } else {
            const moments = (arc?.moments || []).map(m => typeof m === 'string' ? m : m.text);
            content = `<div class="dossier-toolbar"><span>${C.arc}</span><button class="archive-text" data-edit-arc>${C.edit}</button></div>`
                + (arc ? `<p class="dossier-trajectory">${h(arc.trajectory)}</p><div class="dossier-progress"><progress max="1" value="${arc.progress || 0}" aria-label="${C.arc}"></progress><span>${Math.round((arc.progress || 0) * 100)}%</span></div>` : blank(C.noHistory))
                + (moments.length ? `<h3>${C.moments}</h3><ul class="dossier-moments">${moments.map(text => `<li>${h(text)}</li>`).join('')}</ul>` : '')
                + (events.length ? `<h3>${C.events}</h3><div class="dossier-events">${events.map(event => `<button data-archive-event="${data.events.indexOf(event)}"><span>${h(event.timeLabel || '')}</span>${h(event.title)}<span aria-hidden="true">›</span></button>`).join('')}</div>` : '');
        }
        setHtml(root, `<header class="dossier-heading"><div>${person.protagonist ? `<span class="dossier-badge">${C.protagonist}</span>` : ''}<h2>${h(person.name)}</h2></div></header>
            ${aliases.length ? `<div class="dossier-alias-line">${aliases.map(alias => `<span>${h(alias.from)}</span>`).join('')}</div>` : ''}
            <div class="dossier-tabs" role="tablist">${['states', 'relations', 'history'].map(name => `<button id="dossier-tab-${name}" role="tab" aria-selected="${tab === name}" aria-controls="dossier-body" tabindex="${tab === name ? 0 : -1}" data-dossier-tab="${name}">${C[name]}</button>`).join('')}</div>
            <section id="dossier-body" role="tabpanel" aria-labelledby="dossier-tab-${tab}">${content}</section>`);
    }
    root.addEventListener('click', event => {
        const button = event.target.closest('button');
        if (!button) return;
        if (button.dataset.dossierTab) { tab = button.dataset.dossierTab; render(); root.querySelector(`[data-dossier-tab="${tab}"]`).focus({ preventScroll: true }); }
        const data = getData();
        const model = buildDossierModel(data);
        const person = model.people.find(person => person.id === getSelectedCharacter());
        if (button.hasAttribute('data-add-fact')) editor.open({ subject: person.name });
        if (button.hasAttribute('data-add-relation')) editor.open({ subject: person.name, relation: true });
        if (button.hasAttribute('data-edit-arc')) editor.open({ section: 'arcs', subject: person.name, record: model.arc(person.name) });
    });
    root.addEventListener('keydown', event => {
        const tabs = [...root.querySelectorAll('[role="tab"]')];
        const index = tabs.indexOf(event.target);
        if (index < 0) return;
        const target = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
        if (target == null) return;
        event.preventDefault(); tabs[target].click();
    });
    document.addEventListener('click', event => {
        const button = event.target.closest('[data-edit-fact]');
        if (button) {
            const record = getData().facts[Number(button.dataset.editFact)];
            editor.open({ record, relation: !!parseRelationTarget(record.p) });
        }
    });
    return { render, reset() { personId = null; tab = 'states'; } };
}
