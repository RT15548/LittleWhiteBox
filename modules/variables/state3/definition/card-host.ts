import { CARD_EXTENSION } from './format.js';
import { CARD_FILES_COPY, decodeBundle, locateVariableFile, prepareVariableWrite, projectVariableFiles, variableExtensionWrite, type CardFile } from './card-files.js';
import { compileDefinition } from './compile.js';
import { diagnostic, reject } from '../engine/diagnostics.js';
import type { Bundle } from '../types.js';
import { digest } from './digest.js';
import { readFiles, storeFiles, observeTree } from '../../../card-workspace/workspace.js';

interface Character { name: string; avatar: string; data: { extensions?: Record<string, unknown> } }
interface Target { avatar: string; root: string }
interface Host {
    readCharacter(avatar: string, signal?: AbortSignal): Promise<Character>;
    assertCard(avatar: string): void;
    request(url: string, body: unknown, signal?: AbortSignal): Promise<unknown>;
    publishCharacter(card: Character): void;
    unconfirmed: string;
}

/** Runs after every confirmed rule writeback, before the save resolves. */
const savedListeners = new Set<() => Promise<unknown>>();
export function onRulesSaved(listener: () => Promise<unknown>) {
    savedListeners.add(listener);
    return () => { savedListeners.delete(listener); };
}
const rulesSaved = () => Promise.all([...savedListeners].map(listener => listener()));

/** The host supplies I/O; the owned bundle and writeback protocol belong to 3.0. */
export function variableCardHost(host: Host) {
    const read = async (target: Target, signal?: AbortSignal) => {
        const card = await host.readCharacter(target.avatar, signal);
        return projectVariableFiles(target.root, card.data.extensions?.[CARD_EXTENSION]);
    };
    return {
        read,
        async replace(avatar: string, bundle: Bundle, previous: string, signal?: AbortSignal) {
            const compiled = compileDefinition(bundle);
            const card = await host.readCharacter(avatar, signal);
            if (digest(card.data.extensions?.[CARD_EXTENSION] ?? null) !== previous) {reject('rules-conflict');}
            host.assertCard(avatar);
            await host.request('/api/characters/merge-attributes', variableExtensionWrite(card, compiled.bundle), signal);
            const saved = await host.readCharacter(avatar, signal);
            if (digest(decodeBundle(saved.data.extensions?.[CARD_EXTENSION])) !== digest(compiled.bundle)) {throw new Error(host.unconfirmed);}
            host.publishCharacter(saved); await rulesSaved();
        },
        async save(target: Target, file: CardFile, signal?: AbortSignal, companions: { file: CardFile }[] = []) {
            const files = [file, ...companions.map(item => item.file)];
            const card = await host.readCharacter(target.avatar, signal);
            const { bundle, unchanged } = prepareVariableWrite(target.root, files, card.data.extensions?.[CARD_EXTENSION]);
            try { compileDefinition(bundle); }
            catch (error) {
                throw new Error(`${CARD_FILES_COPY.invalidRules}\n${JSON.stringify(diagnostic(error))}`, { cause: error });
            }
            if (!unchanged) {
                host.assertCard(target.avatar);
                await host.request('/api/characters/merge-attributes', variableExtensionWrite(card, bundle), signal);
                const saved = await host.readCharacter(target.avatar, signal);
                if (digest(decodeBundle(saved.data.extensions?.[CARD_EXTENSION])) !== digest(bundle)) {throw new Error(host.unconfirmed);}
                host.publishCharacter(saved); await rulesSaved();
            }
            const projected = projectVariableFiles(target.root, bundle);
            return { unchanged, originalGroupHash: digest(bundle), contents: files.map(item => projected.find(candidate => candidate.path === item.path)!.content) };
        },
        async refresh(target: Target, signal?: AbortSignal) {
            const scopeRoot = `${target.root}variables/`, observed = await observeTree(scopeRoot);
            const previous = (await readFiles()).flatMap(file => file.kind !== 'image' && file.path.startsWith(target.root) && locateVariableFile(file.path.slice(target.root.length)) ? [file.path] : []);
            const refreshed = await read(target, signal);
            await storeFiles(refreshed, { observed, scopeRoot,
                removePaths: previous.filter(path => !refreshed.some(item => item.path === path)) });
        },
    };
}
