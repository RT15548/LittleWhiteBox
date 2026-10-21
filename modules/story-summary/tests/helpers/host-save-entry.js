import assert from 'node:assert/strict';
import vm from 'node:vm';
import { parse } from 'acorn';
import { readOfficialFile, referenceFor } from '../../../../scripts/host/official.mjs';

const sources = new Map();
function functions(source, names) {
    const declarations = parse(source, { sourceType: 'module', ecmaVersion: 'latest' }).body
        .map(node => node.declaration || node)
        .filter(node => node.type === 'FunctionDeclaration' && names.includes(node.id.name));
    assert.equal(declarations.length, names.length);
    return declarations.map(node => source.slice(node.start, node.end)).join('\n');
}

// Execute pinned official host code, including the wait before target selection.
// Only network, compression, cache/UI boundaries and the active chat are supplied.
export function hostSaveEntry(version, { read, metadata, fetch }) {
    if (!sources.has(version)) {
        const reference = referenceFor(version);
        const constants = readOfficialFile(reference, 'public/scripts/constants.js');
        const debounce = parse(constants, { sourceType: 'module', ecmaVersion: 'latest' }).body
            .map(node => node.declaration || node).find(node => node.type === 'VariableDeclaration'
                && node.declarations.some(item => item.id.name === 'debounce_timeout'));
        const timeout = vm.runInNewContext(`${constants.slice(debounce.start, debounce.end)}; debounce_timeout.relaxed`);
        sources.set(version, { timeout, code: [
            functions(readOfficialFile(reference, 'public/script.js'), ['saveMetadata', 'saveChatConditional', 'saveChat']),
            functions(readOfficialFile(reference, 'public/scripts/utils.js'), ['waitUntilCondition']),
        ].join('\n') });
    }
    const errors = [];
    const context = vm.createContext({
        get chat_metadata() { return metadata(); },
        get characters() { return read().characters; },
        get this_chid() { return read().characterId; },
        get chat() { return read().chat; },
        selected_group: null, isChatSaving: false, DEFAULT_SAVE_EDIT_TIMEOUT: sources.get(version).timeout,
        name1: 'User', name2: 'Character', neutralCharacterName: 'No character', chat_create_date: '',
        Date, setTimeout: (...args) => setTimeout(...args), clearTimeout: id => clearTimeout(id),
        setInterval: (...args) => setInterval(...args), clearInterval: id => clearInterval(id),
        getRequestHeaders: () => ({}), compressRequest: async request => request, fetch,
        cancelDebouncedChatSave() {}, saveTokenCache() {}, saveItemizedPrompts() {},
        getCurrentChatId: () => read().chatId,
        console: { error: error => errors.push(error), warn: error => errors.push(error), trace: error => errors.push(error) },
        toastr: { error: error => errors.push(error) }, t: parts => parts.join(''),
    });
    vm.runInContext(sources.get(version).code, context);
    return { context, errors };
}
