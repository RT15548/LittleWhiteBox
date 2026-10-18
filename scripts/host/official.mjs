import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import ignore from 'ignore';

export const pluginRoot = path.resolve(import.meta.dirname, '../..');
export const official = JSON.parse(fs.readFileSync(new URL('./official.json', import.meta.url), 'utf8'));
const remote = `https://github.com/${official.repository}.git`;

function git(directory, args, options = {}) {
    const result = spawnSync('git', ['--no-replace-objects', '-C', directory, ...args], {
        encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...options,
    });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`Official host reference: ${result.stderr || args.join(' ')}`);
    return result.stdout;
}

export function referenceFor(version) {
    if (!/^[\w.-]+$/.test(version)) throw new Error('Invalid official host version or ref');
    let commit = official.verificationVersions[version];
    if (!commit) {
        // Resolve the version against the official repository, never against the developer's remote.
        const refs = git(pluginRoot, ['ls-remote', remote, `refs/tags/${version}`, `refs/tags/${version}^{}`, `refs/heads/${version}`])
            .trim().split('\n').filter(Boolean).map(line => line.split(/\s+/));
        const resolved = refs.find(([, name]) => name.endsWith('^{}')) || refs.find(([, name]) => name === `refs/tags/${version}`) || refs[0];
        if (!resolved) throw new Error(`No official SillyTavern ref: ${version}`);
        commit = resolved[0];
    }
    const directory = path.join(pluginRoot, 'output/official-host', commit);
    fs.mkdirSync(directory, { recursive: true });
    if (!fs.existsSync(path.join(directory, 'HEAD'))) git(directory, ['init', '--bare']);
    const present = spawnSync('git', ['--no-replace-objects', '-C', directory, 'cat-file', '-e', `${commit}^{commit}`]);
    if (present.status !== 0) git(directory, ['fetch', '--depth=1', remote, commit]);
    const entries = git(directory, ['ls-tree', '-r', '-l', '-z', commit]).split('\0').filter(Boolean).map(line => {
        const [metadata, file] = line.split('\t');
        const [mode, type, hash, size] = metadata.trim().split(/\s+/);
        if (type !== 'blob' || !['100644', '100755'].includes(mode)) throw new Error(`Unsupported official host entry: ${file}`);
        return { path: file, hash, size: Number(size) };
    });
    const ignoreRules = git(directory, ['show', `${commit}:.gitignore`]);
    return { version, commit, entries, ignoreRules };
}

export function installedHostRoot() {
    const directory = path.resolve(process.env.LWB_HOST_ROOT || path.join(pluginRoot, '../../../../..'));
    const manifest = path.join(directory, 'package.json');
    return fs.existsSync(manifest) && JSON.parse(fs.readFileSync(manifest, 'utf8')).name === 'sillytavern'
        ? directory : null;
}

export function readOfficialFile(reference, file) {
    return git(path.join(pluginRoot, 'output/official-host', reference.commit), ['show', `${reference.commit}:${file}`]);
}

export function installedHostReference(directory) {
    const version = process.env.LWB_HOST_REF || JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8')).version;
    return referenceFor(version);
}

export function blobHash(content) {
    return createHash('sha1').update(`blob ${content.length}\0`).update(content).digest('hex');
}

export function inspectHost(directory, reference) {
    const problems = [];
    const tracked = new Set(reference.entries.map(entry => entry.path));
    for (const entry of reference.entries) {
        const file = path.join(directory, entry.path);
        if (!fs.existsSync(file)) { problems.push({ path: entry.path, kind: 'missing' }); continue; }
        const stat = fs.lstatSync(file);
        if (!stat.isFile()) { problems.push({ path: entry.path, kind: 'not-file' }); continue; }
        const content = fs.readFileSync(file);
        if (blobHash(content) === entry.hash) continue;
        // Git's Windows checkout conversion does not constitute a source modification.
        if (!content.includes(0) && blobHash(Buffer.from(content.toString('utf8').replace(/\r\n/g, '\n'))) === entry.hash) continue;
        problems.push({ path: entry.path, kind: 'modified' });
    }
    // Use official ignore rules, not a locally edited file that could hide injected source.
    const matcher = ignore().add(reference.ignoreRules).add(['/.git/', '/*.log']);
    function walk(current) {
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const full = path.join(current, entry.name);
            const relative = path.relative(directory, full).split(path.sep).join('/');
            if (matcher.ignores(entry.isDirectory() ? `${relative}/` : relative)) continue;
            if (entry.isDirectory()) walk(full);
            else if (!tracked.has(relative)) problems.push({ path: relative, kind: 'extra' });
        }
    }
    walk(directory);
    return problems;
}

export function assertOfficialHost(directory, reference) {
    const problems = inspectHost(directory, reference);
    if (problems.length) throw Object.assign(new Error(`Host differs from official ${reference.version} (${reference.commit}):\n${problems.map(item => `${item.kind}: ${item.path}`).join('\n')}`), {
        code: 'HOST_NOT_OFFICIAL', problems,
    });
    console.log(`Official host verified: ${reference.version} ${reference.commit} (${reference.entries.length} files).`);
}
