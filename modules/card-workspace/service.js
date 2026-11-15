import { currentCard, linkedBooks, readCharacter, readBook, readTarget, refreshVariableFiles, saveFile } from './host.js';
import { readFiles, storeFiles, observePaths, observeTree, storeItemReceipt } from './workspace.js';
import { cardFiles, locateFile, rootFor, DESIGN_FILE } from './files.js';
import { COPY } from './copy.js';
import { ITEM_KINDS, resolveItemTarget, parseItemDocument } from './item-document.js';
import { cardFileDirectory } from './display.js';
import { readDesign } from './design.js';
import { cardLifecycle } from './lifecycle.js';
import { equalText } from './comparison.js';
import { variableFileGroup, variableGroupChanged } from '../variables/state3/definition/card-files.js';

export async function runCardFiles(args, options = {}) {
    if (args.action === 'open') {
        const selected = currentCard();
        return cardLifecycle.run([selected.avatar], () => openFiles(selected, options.signal));
    }
    if (!['save', 'refresh'].includes(args.action)) throw new Error(COPY.unsupported);
    const paths = selectedPaths(args.paths), avatars = paths.map(path => locateFile(path)?.avatar).filter(Boolean);
    return cardLifecycle.run(avatars, () => args.action === 'save' ? saveFiles(paths, options.signal) : refreshFiles(paths, options.signal));
}

async function openFiles(selected, signal) {
    const avatar = selected.avatar, root = rootFor(avatar);
    const observed = await observeTree(root);
    const present = (await readFiles()).filter(file => file.path.startsWith(root));
    if (present.length) return reuseFiles(selected, root, signal);
    const card = await readCharacter(avatar, signal), books = [];
    for (const name of linkedBooks(card)) {
        const book = await readBook(name, signal);
        if (book) books.push([name, book]);
    }
    const files = cardFiles(avatar, card.data, books, await readDesign(avatar, signal) ?? '');
    await storeOpenedFiles(files, { observed, scopeRoot: root });
    return { root, avatar, name: selected.name, files: cardFileDirectory(files), reused: false };
}

async function storeOpenedFiles(files, options) {
    try { await storeFiles(files, options); } catch (error) {
        if (error.message === 'workspace_conflict') throw new Error(COPY.designWorkspaceChanged);
        throw error;
    }
}

// A clean design follows server updates; a draft keeps its original baseline.
async function reuseFiles(selected, root, signal) {
    const path = root + DESIGN_FILE;
    const warnings = [];
    const observed = await observePaths([path]);
    const file = observed.find(item => item.path === path)?.expected?.file;
    const content = await readDesign(selected.avatar, signal) ?? '';
    if (file && !equalText(file.content, file.originalContent)) {
        if (equalText(content, file.content)) {
            await storeOpenedFiles([{ path, content }], { observed, baselineOnly: true });
        } else if (!equalText(content, file.originalContent ?? '')) {
            warnings.push({ path, message: COPY.designDraftConflict });
        }
    } else {
        await storeOpenedFiles([{ path, content }], { observed });
    }
    const present = (await readFiles()).filter(file => file.path.startsWith(root));
    return { root, avatar: selected.avatar, name: selected.name, files: cardFileDirectory(present), reused: true,
        ...(warnings.length ? { warnings } : {}) };
}

function selectedPaths(paths) {
    if (!Array.isArray(paths) || !paths.length) throw new Error(COPY.noFiles);
    return [...new Set(paths)];
}

async function refreshFiles(paths, signal) {
    const requested = selectedPaths(paths), observed = await observePaths(requested), files = [], roots = new Set();
    const current = await readFiles();
    for (const path of requested) {
        let target = locateFile(path);
        if (!target) throw new Error(COPY.unsupported);
        if (ITEM_KINDS[target.kind]) {
            const file = current.find(item => item.path === path);
            if (!file) throw new Error(COPY.missing);
            target = { ...target, id: parseItemDocument(target.kind, file.originalContent ?? file.content).id };
        }
        if (target.kind === 'variables') {
            if (roots.has(target.root)) continue;
            roots.add(target.root);
            await refreshVariableFiles(target, signal);
            continue;
        }
        const content = await readTarget(target, signal);
        if (content === null) throw new Error(`${COPY.missing}: ${path}`);
        files.push({ path, content });
    }
    if (files.length) await storeFiles(files, { observed });
    return { paths: requested, refreshed: true };
}

async function saveFiles(paths, signal) {
    const files = await readFiles(), groups = new Map(), results = [];
    for (const path of selectedPaths(paths)) {
        const file = files.find(item => item.path === path);
        let target = locateFile(path);
        if (!file || !target) { results.push({ path, saved: false, error: !file ? COPY.missing : COPY.unsupported }); continue; }
        try { target = resolveItemTarget(target, file); } catch (error) {
            results.push({ path, saved: false, error: error.message }); continue;
        }
        if (target.kind === 'variables') {
            const key = `${target.root}variables`;
            if (!groups.has(key)) groups.set(key, variableFileGroup(target.root, files, locateFile));
            continue;
        }
        const key = path;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push({ target, file });
    }
    for (const entries of groups.values()) {
        try {
            signal?.throwIfAborted();
            const [first, ...companions] = entries;
            if (ITEM_KINDS[first.target.kind]) {
                const peers = files.filter(file => {
                    const target = locateFile(file.path);
                    if (target?.root !== first.target.root || target?.kind !== first.target.kind || target?.book !== first.target.book) return false;
                    try { return parseItemDocument(target.kind, file.originalContent ?? file.content).id === first.target.id; } catch { return false; }
                });
                if (peers.length > 1) throw new Error(COPY.duplicateIdentity);
            }
            const result = await saveFile(first.target, first.file, signal, companions);
            if (ITEM_KINDS[first.target.kind]) {
                const receipt = await storeItemReceipt(first.file, result.content, first.target.kind);
                results.push({ ...receipt, saved: true, unchanged: result.unchanged === true,
                    ...(result.missingActivationConfig ? { missingActivationConfig: true } : {}) });
                continue;
            }
            const receipts = entries.map((item, index) => ({ path: item.file.path, content: result.contents?.[index] ?? result.content,
                ...(result.originalGroupHash && item.target.settings ? { originalGroupHash: result.originalGroupHash } : {}) }));
            await storeFiles(receipts, { baselineOnly: true });
            const latest = await readFiles();
            const groupChanged = first.target.kind === 'variables' && variableGroupChanged(first.target.root, entries, latest);
            results.push(...receipts.map((item, index) => ({ path: item.path, saved: true, unchanged: result.unchanged === true,
                ...(result.missingActivationConfig ? { missingActivationConfig: true } : {}),
                hasUnsavedEdits: groupChanged || latest.some(file => file.path === item.path && file.content !== entries[index].file.content) })));
        } catch (error) {
            results.push(...entries.map(item => ({ path: item.file.path, saved: false, error: error.message })));
        }
    }
    return { ok: results.every(item => item.saved), results };
}
