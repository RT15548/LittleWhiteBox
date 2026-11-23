import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { collectSourceFiles } from './workspace-files.mjs';

const extensions = new Set(['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts', '.tsx', '.vue']);
const typed = /\.[cm]?tsx?$/;
const testName = /\.test\.[cm]?[jt]s$/;
export const isHostTest = file => /\.host\.test\.[cm]?[jt]s$/.test(path.basename(file));
const slash = value => value.split(path.sep).join('/');
const inside = (file, directory) => file === directory || file.startsWith(`${directory}/`);
const owner = file => file.startsWith('modules/') ? file.split('/').slice(0, 2).join('/') : null;

export function discoverTests(root) {
    return collectSourceFiles(root, extensions).filter(file => testName.test(file));
}

// References include imports, new URL/readFile fixtures and esbuild entry strings.
// They deliberately over-select: tests also load source as text, not only as modules.
export function sourceGraph(root) {
    const files = collectSourceFiles(root, extensions);
    const known = new Set(files);
    const graph = new Map();
    const resolve = (file, reference) => {
        const base = path.resolve(reference.startsWith('.') ? path.dirname(file) : root, reference.split(/[?#]/)[0]);
        const ext = path.extname(base);
        const substitutions = { '.js': ['.ts', '.tsx'], '.mjs': ['.mts'], '.cjs': ['.cts'] };
        const candidates = [base, ...(substitutions[ext] || []).map(suffix => base.slice(0, -ext.length) + suffix)];
        if (!ext) for (const suffix of extensions) candidates.push(base + suffix, path.join(base, `index${suffix}`));
        // Keep missing local references too: a deleted file must still select consumers.
        return candidates.find(candidate => known.has(candidate)) || (inside(slash(base), slash(root)) ? base : null);
    };
    for (const file of files) {
        const source = fs.readFileSync(file, 'utf8');
        const dependencies = new Set();
        for (const match of source.matchAll(/['"`]((?:\.{1,2}\/|modules\/|core\/|shared\/|scripts\/|server-plugin\/)[^'"`\s$]+)['"`]/g)) {
            const dependency = resolve(file, match[1]);
            if (dependency) dependencies.add(dependency);
        }
        graph.set(file, dependencies);
    }
    return graph;
}

export function typescriptTests(tests, graph) {
    // Propagate to a fixed point so cycles cannot hide a typed dependency.
    const needs = new Set([...graph.keys()].filter(file => typed.test(file)));
    let changed = true;
    while (changed) {
        changed = false;
        for (const [file, dependencies] of graph) {
            if (!needs.has(file) && [...dependencies].some(dependency => needs.has(dependency))) {
                needs.add(file);
                changed = true;
            }
        }
    }
    return tests.filter(file => needs.has(file));
}

export function gitChanges(root) {
    const read = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
    // --no-renames retains both sides of moves; deleted source still selects its owner.
    return [...new Set([
        ...read(['diff', '--name-only', '--no-renames', '-z']),
        ...read(['diff', '--cached', '--name-only', '--no-renames', '-z']),
        ...read(['ls-files', '--others', '--exclude-standard', '-z']),
    ])];
}

export function selectTests(root, tests, scopes, { changes, graph } = {}) {
    if (!scopes.length || scopes.length === 1 && scopes[0] === 'full') return { files: tests, reason: '全量' };
    if (scopes.some(scope => ['full', 'changed', 'standalone', 'host'].includes(scope)) && scopes.length !== 1) {
        throw new Error('full / changed / standalone / host 不能与其他范围混用。');
    }
    if (scopes[0] === 'standalone' || scopes[0] === 'host') {
        const host = scopes[0] === 'host';
        const files = tests.filter(file => isHostTest(file) === host);
        if (!files.length) throw new Error(`此范围没有测试：${scopes[0]}`);
        return { files, reason: host ? '宿主兼容' : '独立测试' };
    }
    if (scopes[0] !== 'changed') {
        const selected = new Set();
        for (const scope of scopes) {
            const candidates = [path.resolve(root, scope), path.resolve(root, 'modules', scope)];
            const found = tests.filter(file => candidates.some(directory => inside(slash(file), slash(directory))));
            if (!found.length) throw new Error(`此范围没有测试：${scope}`);
            for (const file of found) selected.add(file);
        }
        return { files: tests.filter(file => selected.has(file)), reason: scopes.join(', ') };
    }
    const paths = changes ?? gitChanges(root);
    if (!paths.length) return { files: [], reason: '没有未提交改动' };
    const global = paths.find(file => !owner(file) || owner(file) === 'modules/agent-core');
    if (global) return { files: tests, reason: `共享、构建或模块外改动，扩大为全量：${global}` };

    const affected = new Set(paths.map(owner));
    const dependencies = graph ?? sourceGraph(root);
    let expanded = true;
    while (expanded) {
        expanded = false;
        for (const [file, references] of dependencies) {
            const relative = slash(path.relative(root, file));
            const module = owner(relative);
            if (affected.has(module)) continue;
            if ([...references].some(reference => affected.has(owner(slash(path.relative(root, reference)))))) {
                if (!module) {
                    if (!testName.test(file)) return { files: tests, reason: `共享引用方受影响，扩大为全量：${relative}` };
                    continue;
                }
                affected.add(module);
                expanded = true;
            }
        }
    }
    // Integration/build tests can consume generated bundles rather than source imports.
    const files = tests.filter(file => {
        const relative = slash(path.relative(root, file));
        return affected.has(owner(relative)) || !owner(relative);
    });
    return { files, reason: `变动模块及引用方：${[...affected].join(', ')}；另含模块外集成检查` };
}
