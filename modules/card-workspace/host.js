import { getContext } from '../../../../../extensions.js';
import { DOMPurify } from '../../../../../../lib.js';
import { getRequestHeaders, select_selected_character } from '../../../../../../script.js';
import { worldInfoCache, world_info, newWorldInfoEntryTemplate, originalWIDataKeyMap, setWIOriginalDataValue, updateWorldInfoList } from '../../../../../world-info.js';
import { saveCharacterTask } from '../scheduled-tasks/scheduled-tasks.js';
import { allowScopedScripts } from '../../../../../extensions/regex/engine.js';
import { COPY } from './copy.js';
import { equalJson, equalText } from './comparison.js';
import { CARD_FIELDS, projectCard, projectItem, json } from './files.js';
import { itemDocumentValue, ITEM_KINDS } from './item-document.js';
import { CARD_EXTENSION } from '../variables/state3/definition/format.js';
import { projectVariableFiles } from '../variables/state3/definition/card-files.js';
import { variableCardHost } from '../variables/state3/definition/card-host.js';
import { readDesign, writeDesign } from './design.js';

const variableFiles = variableCardHost({ readCharacter, assertCard, request, publishCharacter, unconfirmed: COPY.unconfirmed });
export const refreshVariableFiles = variableFiles.refresh;
export const replaceVariableBundle = variableFiles.replace;

export function currentCard() {
    const ctx = getContext(), card = ctx.characters[ctx.characterId];
    if (!card || ctx.groupId) throw new Error(COPY.noCard);
    return card;
}

function assertCard(avatar) {
    if (currentCard().avatar !== avatar) throw new Error(COPY.changedCard);
}

async function request(url, body, signal) {
    const response = await fetch(url, { method: 'POST', headers: getRequestHeaders(), body: JSON.stringify(body), signal, cache: 'no-store' });
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    return response;
}

export async function readCharacter(avatar, signal) {
    return (await request('/api/characters/get', { avatar_url: avatar }, signal)).json();
}

export async function readBook(name, signal) {
    return (await request('/api/worldinfo/get', { name }, signal)).json();
}

export function linkedBooks(card) {
    const name = card.avatar.replace(/\.[^.]+$/, '');
    return [...new Set([card.data?.extensions?.world, ...(world_info.charLore?.find(item => item.name === name)?.extraBooks || [])].filter(Boolean))];
}

function parseSettings(content) {
    const value = JSON.parse(content);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(COPY.invalidObject);
    return value;
}

export function assertUnchanged(file, actual, settings = false) {
    if (ITEM_KINDS[settings] && actual !== null && file.originalContent == null) throw new Error(COPY.conflict);
    if (equalText(actual, file.content, settings)) return false;
    if (actual === null) return true;
    if (!equalText(actual, file.originalContent, settings)) throw new Error(COPY.conflict);
    return true;
}

function publishCharacter(saved) {
    const ctx = getContext(), index = ctx.characters.findIndex(card => card.avatar === saved.avatar);
    if (index < 0) return;
    saved.name = DOMPurify.sanitize(saved.name);
    saved.chat = String(saved.chat);
    ctx.characters[index] = saved;
    if (Number(ctx.characterId) === index) select_selected_character(index, { switchMenu: false });
}

async function mergeCharacter(avatar, data, signal) {
    assertCard(avatar);
    await request('/api/characters/merge-attributes', { avatar, data }, signal);
    const saved = await readCharacter(avatar, signal);
    publishCharacter(saved);
    return saved.data;
}

function readValue(target, card) {
    if (target.kind === 'card') return json(projectCard(card));
    if (target.kind === 'field') return String(card[target.field] || '');
    if (target.kind === 'greeting') return [card.first_mes || '', ...(card.alternate_greetings || [])][target.index] ?? null;
    return null;
}

export async function readTarget(target, signal) {
    if (target.kind === 'design') return await readDesign(target.avatar, signal) ?? '';
    if (target.kind === 'world') return projectItem(target, (await readBook(target.book, signal))?.entries?.[target.id]);
    const card = (await readCharacter(target.avatar, signal)).data;
    if (target.kind === 'variables') return projectVariableFiles(target.root, card.extensions?.[CARD_EXTENSION]).find(file => file.path === target.root + target.relative)?.content ?? null;
    if (['card', 'field', 'greeting'].includes(target.kind)) return readValue(target, card);
    const list = target.kind === 'regex' ? card.extensions?.regex_scripts : card.extensions?.['xiaobaix-tasks']?.tasks;
    return projectItem(target, list?.find(item => item.id === target.id));
}

export async function saveFile(target, file, signal, companions = []) {
    assertCard(target.avatar);
    if (target.kind === 'design') return saveDesign(target, file, signal);
    if (target.kind === 'world') return saveWorldFile(target, file, signal);
    if (target.kind === 'variables') return variableFiles.save(target, file, signal, companions);
    const card = (await readCharacter(target.avatar, signal)).data;
    if (['card', 'field', 'greeting'].includes(target.kind)) {
        const before = readValue(target, card);
        if (!assertUnchanged(file, before, target.kind === 'card')) return { content: before, unchanged: true };
        let patch;
        if (target.kind === 'card') {
            const value = parseSettings(file.content);
            if (Object.keys(value).some(key => ![...CARD_FIELDS, 'world'].includes(key))) throw new Error(COPY.unsupportedSetting);
            patch = Object.fromEntries(CARD_FIELDS.filter(key => Object.hasOwn(value, key)).map(key => [key, value[key]]));
            if (Object.hasOwn(value, 'world')) patch.extensions = { world: value.world };
        } else if (target.kind === 'field') patch = { [target.field]: file.content };
        else if (target.index === 0) patch = { first_mes: file.content };
        else {
            const greetings = [...(card.alternate_greetings || [])];
            if (target.index > greetings.length + 1) throw new Error(COPY.greetingGap);
            greetings[target.index - 1] = file.content;
            patch = { alternate_greetings: greetings };
        }
        const saved = await mergeCharacter(target.avatar, patch, signal);
        const content = readValue(target, saved);
        const expected = readValue(target, { ...card, ...patch, extensions: { ...card.extensions, ...patch.extensions } });
        if (!equalText(content, expected, target.kind === 'card')) throw new Error(COPY.unconfirmed);
        return { content };
    }
    const field = target.kind === 'regex' ? 'regex_scripts' : 'xiaobaix-tasks';
    const list = target.kind === 'regex' ? [...(card.extensions?.[field] || [])] : [...(card.extensions?.[field]?.tasks || [])];
    const index = list.findIndex(item => item.id === target.id), previous = list[index] || null;
    if (!assertUnchanged(file, projectItem(target, previous), target.kind)) return { content: projectItem(target, previous), unchanged: true };
    const edit = itemDocumentValue(target.kind, file.content);
    const defaults = target.kind === 'regex'
        ? { scriptName: target.id, findRegex: '', replaceString: '', trimStrings: [], placement: [2], disabled: false, markdownOnly: true, promptOnly: false, runOnEdit: true, substituteRegex: 0, minDepth: null, maxDepth: null }
        : { name: target.id, commands: '', disabled: false, interval: 1, floorType: 'all', triggerTiming: 'chat_changed' };
    const next = { ...defaults, ...previous, ...edit, id: target.id };
    assertCard(target.avatar);
    if (target.kind === 'tasks') {
        // The task domain owns persistence, cancellation and its UI refresh.
        await saveCharacterTask({ avatar: target.avatar, previous, task: next, signal });
    } else {
        if (index < 0) list.push(next); else list[index] = next;
        const saved = await mergeCharacter(target.avatar, { extensions: { [field]: list } }, signal);
        if (!equalJson(saved.extensions?.[field], list)) throw new Error(COPY.unconfirmed);
        const ctx = getContext();
        allowScopedScripts(ctx.characters.find(item => item.avatar === target.avatar));
    }
    const saved = (await readCharacter(target.avatar, signal)).data.extensions?.[field];
    const savedItem = (target.kind === 'regex' ? saved : saved?.tasks)?.find(item => item.id === target.id);
    if (!savedItem || !equalJson(savedItem, next)) throw new Error(COPY.unconfirmed);
    return { content: projectItem(target, next) };
}

// Missing and emptied designs have the same empty baseline. An old nonempty
// baseline therefore conflicts with a remote deletion, just like any other edit.
async function saveDesign(target, file, signal) {
    const before = await readDesign(target.avatar, signal) ?? '';
    const contentToSave = file.content.trim() ? file.content : '';
    if (!assertUnchanged({ ...file, content: contentToSave, originalContent: file.originalContent ?? '' }, before)) return { content: before, unchanged: true };
    await writeDesign(target.avatar, file.content, signal);
    const content = await readDesign(target.avatar, signal) ?? '';
    if (!equalText(content, file.content.trim() ? file.content : '')) throw new Error(COPY.unconfirmed);
    return { content };
}

// SillyTavern's leading decorator block supports fallback decorators after an
// unknown decorator. The host parser is private; only activation is inspected here.
function hasActivationDecorator(content) {
    let fallback = false;
    for (let line of String(content || '').split('\n')) {
        if (!line.startsWith('@@')) break;
        if (line.startsWith('@@@')) {
            if (!fallback) continue;
            line = line.slice(1);
        }
        if (line === '@@activate') return true;
        fallback = !['@@activate', '@@dont_activate'].some(decorator => line.startsWith(decorator));
    }
    return false;
}

function worldSaveReceipt(entry, target, unchanged = false) {
    const missingActivationConfig = !entry.disable && !entry.constant && !entry.vectorized
        && !(entry.key || []).some(key => String(key).trim()) && !hasActivationDecorator(entry.content);
    return { content: projectItem(target, entry), ...(unchanged ? { unchanged } : {}),
        ...(missingActivationConfig ? { missingActivationConfig } : {}) };
}

async function saveWorldFile(target, file, signal) {
    const existing = await readBook(target.book, signal), book = existing || { entries: {} };
    const previous = book.entries[target.id] || null;
    if (!assertUnchanged(file, projectItem(target, previous), target.kind)) return worldSaveReceipt(previous, target, true);
    const edit = itemDocumentValue(target.kind, file.content);
    const next = { ...structuredClone(newWorldInfoEntryTemplate), ...previous, ...edit, uid: target.id };
    book.entries[target.id] = next;
    if (book.originalData?.entries) {
        let original = book.originalData.entries.find(item => item.id === target.id || item.uid === target.id);
        if (!original) {
            original = { id: target.id, uid: target.id, keys: [], content: '', insertion_order: next.order, enabled: !next.disable, extensions: {} };
            book.originalData.entries.push(original);
        }
        original.uid = target.id;
    }
    for (const [key, value] of Object.entries(next)) {
        if (originalWIDataKeyMap[key]) setWIOriginalDataValue(book, target.id, originalWIDataKeyMap[key], value);
    }
    for (const [key, value] of Object.entries({ enabled: !next.disable, 'extensions.group': next.group,
        'extensions.outlet_name': next.outletName, 'extensions.useProbability': next.useProbability,
        'extensions.selectiveLogic': next.selectiveLogic })) setWIOriginalDataValue(book, target.id, key, value);
    assertCard(target.avatar);
    await request('/api/worldinfo/edit', { name: target.book, data: book }, signal);
    const saved = await readBook(target.book, signal);
    if (!equalJson(saved?.entries?.[target.id], next)) throw new Error(COPY.unconfirmed);
    worldInfoCache.set(target.book, saved);
    const ctx = getContext();
    await ctx.eventSource.emit(ctx.eventTypes.WORLDINFO_UPDATED, target.book, saved);
    await updateWorldInfoList();
    return worldSaveReceipt(next, target);
}
