import { buildAliasResolver } from './data/character-aliases.js';
import { applyGraphChoices, relationGraph } from './data/relation-graph.js';
import { ARCHIVE_COPY } from './archive-view.js';

const copy = Object.freeze({ people: '关系图人物', removed: '已移除', remove: '从关系图移除', restore: '恢复' });

export function createRelationGraphEditor(root, opening) {
    const data = { ...opening };
    const { resolveKey } = buildAliasResolver(data.characterAliases);
    const initial = new Set((data.removedGraphPeople || []).map(resolveKey));
    const changes = new Map();
    function row(label, names, action, visible) {
        const group = document.createElement('div');
        group.className = 'struct-row graph-choice-row';
        const field = document.createElement('label');
        field.textContent = label;
        const select = document.createElement('select');
        for (const name of names) select.add(new Option(name, name));
        if (!names.length) select.add(new Option(ARCHIVE_COPY.noGraphPeople, ''));
        field.append(select);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-sm';
        button.textContent = action;
        select.disabled = button.disabled = !names.length;
        button.onclick = () => {
            const name = select.value, key = resolveKey(name);
            const change = { name, visible };
            applyGraphChoices(data, data, [change]);
            if (initial.has(key) === !visible) changes.delete(key);
            else changes.set(key, change);
            render();
            const targets = root.querySelectorAll('select:not(:disabled)');
            targets[visible ? targets.length - 1 : 0]?.focus();
        };
        group.append(field, button);
        return group;
    }
    function render() {
        const { people, removed } = relationGraph(data);
        root.replaceChildren(row(copy.people, people.map(person => person.name), copy.remove, false));
        if (removed.length) root.append(row(copy.removed, removed, copy.restore, true));
    }
    render();
    return { changes: () => [...changes.values()] };
}
