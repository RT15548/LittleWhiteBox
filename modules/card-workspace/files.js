import { locateVariableFile, projectVariableFiles } from '../variables/state3/definition/card-files.js';
import { CARD_EXTENSION } from '../variables/state3/definition/format.js';
import { CARD_ROOT, rootFor } from './paths.js';
import { serializeItemDocument, itemDocumentPath, ITEM_KINDS } from './item-document.js';
export { CARD_ROOT, rootFor } from './paths.js';

// File layout and projections are shared by the tool, host and workspace UI.
export const CARD_FILE = 'card.json';
// The CardFlow design document lives in the user's SillyTavern files, not in the card.
export const DESIGN_FILE = 'design.md';
export const TEXT_FIELDS = ['description', 'personality', 'scenario', 'mes_example', 'system_prompt', 'post_history_instructions', 'creator_notes'];
export const CARD_FIELDS = ['name', 'tags', 'creator', 'character_version'];
export const json = value => JSON.stringify(value, null, 2);

export function locateFile(path) {
    if (!path.startsWith(CARD_ROOT)) return null;
    const parts = path.slice(CARD_ROOT.length).split('/');
    if (parts.length < 2) return null;
    const avatar = decodeURIComponent(parts.shift());
    const relative = parts.join('/');
    const base = { avatar, root: rootFor(avatar), relative };
    if (relative === CARD_FILE) return { ...base, kind: 'card' };
    if (relative === DESIGN_FILE) return { ...base, kind: 'design' };
    const variables = locateVariableFile(relative);
    if (variables) return { ...base, ...variables };
    const field = TEXT_FIELDS.find(key => relative === `${key}.md`);
    if (field) return { ...base, kind: 'field', field };
    let match = relative.match(/^message\/(0|[1-9]\d*)\.md$/);
    if (match) return { ...base, kind: 'greeting', index: Number(match[1]) };
    match = relative.match(/^world_book\/([^/]+)\/([^/]+)\.md$/);
    if (match) return { ...base, kind: 'world', book: decodeURIComponent(match[1]) };
    match = relative.match(/^(regex|tasks)\/([^/]+)\.md$/);
    if (match) return { ...base, kind: match[1] };
    return null;
}

export function projectCard(data) {
    return { ...Object.fromEntries(CARD_FIELDS.map(key => [key, data[key] ?? (key === 'tags' ? [] : '')])), world: data.extensions?.world || '' };
}

export function projectItem(target, value) {
    if (value == null) return null;
    return serializeItemDocument(target.kind, value, target.id);
}

export function cardFiles(avatar, data, books, design = '') {
    const root = rootFor(avatar);
    const files = [{ path: root + DESIGN_FILE, content: design }, { path: root + CARD_FILE, content: json(projectCard(data)) }];
    for (const field of TEXT_FIELDS) files.push({ path: `${root}${field}.md`, content: String(data[field] || '') });
    [data.first_mes || '', ...(data.alternate_greetings || [])].forEach((content, index) => {
        files.push({ path: `${root}message/${index}.md`, content });
    });
    const occupied = new Set();
    const addItem = (kind, prefix, id, item) => {
        const path = itemDocumentPath(`${root}${prefix}/`, String(item[ITEM_KINDS[kind].name] || ''), occupied);
        occupied.add(path);
        files.push({ path, content: projectItem({ kind, id }, item) });
    };
    for (const [name, book] of books) for (const [id, entry] of Object.entries(book.entries || {})) addItem('world', `world_book/${encodeURIComponent(name)}`, Number(id), entry);
    for (const item of data.extensions?.regex_scripts || []) addItem('regex', 'regex', item.id, item);
    for (const item of data.extensions?.['xiaobaix-tasks']?.tasks || []) addItem('tasks', 'tasks', item.id, item);
    files.push(...projectVariableFiles(root, data.extensions?.[CARD_EXTENSION]));
    return files;
}
