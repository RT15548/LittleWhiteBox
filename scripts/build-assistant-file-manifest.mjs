/* global process */

import fs from 'node:fs';
import path from 'node:path';
import ignore from 'ignore';

const pluginRoot = process.cwd();
const stRoot = path.resolve(pluginRoot, '../../../../..');
const publicRoot = path.join(stRoot, 'public');
const outputPath = path.join(pluginRoot, 'modules/assistant/assistant-file-manifest.json');

const TEXT_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.vue', '.html', '.css', '.json', '.md', '.txt']);
const INCLUDED_BINARY_TEXT_RESOURCES = new Set([
    'libs/material-symbols/LICENSE',
    'libs/material-symbols/codepoints',
    'modules/draw/shared/data/danbooru-chars.dat',
]);
const EXCLUDED_DIR_NAMES = new Set([
    '.git',
    '.story-summary-replay-cache',
    '.vscode',
    'node_modules',
    'dist',
    'coverage',
    'story-summary-replay-output',
    'story-summary-replay.samples',
]);
const EXCLUDED_PUBLIC_SUBTREES = ['scripts/extensions/third-party/LittleWhiteBox'];
const EXCLUDED_FILE_NAMES = new Set(['context-api-map.json', 'extract-output.txt', 'extract-output2.txt']);

function toPosix(value) {
    return value.split(path.sep).join('/');
}

function shouldIncludeFile(fullPath, rootPath) {
    const fileName = path.basename(fullPath);
    const extension = path.extname(fullPath).toLowerCase();
    const relativePath = toPosix(path.relative(rootPath, fullPath));
    const forceIncludedResource = INCLUDED_BINARY_TEXT_RESOURCES.has(relativePath);

    if (!forceIncludedResource && !TEXT_EXTENSIONS.has(extension)) return false;
    if (fileName.endsWith('.min.js')) return false;
    if (fileName === 'package-lock.json') return false;
    if (EXCLUDED_FILE_NAMES.has(fileName)) return false;

    try {
        const stat = fs.statSync(fullPath);
        if (!stat.isFile()) return false;
    } catch {
        return false;
    }

    if (!relativePath || relativePath.startsWith('..')) return false;
    return true;
}

function walkDirectory(rootPath, currentPath = rootPath, files = []) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.name.startsWith('.') && entry.name !== '.github') continue;

        const fullPath = path.join(currentPath, entry.name);
        if (entry.isDirectory()) {
            if (EXCLUDED_DIR_NAMES.has(entry.name)) continue;
            walkDirectory(rootPath, fullPath, files);
            continue;
        }

        if (shouldIncludeFile(fullPath, rootPath)) {
            files.push(fullPath);
        }
    }
    return files;
}

function getIgnoredFiles(ignoreRoot, fullPaths) {
    const ignorePath = path.join(ignoreRoot, '.gitignore');
    if (!fs.existsSync(ignorePath)) return new Set();
    const matcher = ignore().add(fs.readFileSync(ignorePath, 'utf8'));
    return new Set(fullPaths.filter((fullPath) => {
        const relativePath = toPosix(path.relative(ignoreRoot, fullPath));
        return relativePath && !relativePath.startsWith('..') && matcher.ignores(relativePath);
    }));
}

function buildPluginEntries() {
    const candidates = walkDirectory(pluginRoot)
        .filter(fullPath => !toPosix(path.relative(pluginRoot, fullPath)).startsWith('modules/assistant/dist/'));
    const ignoredFiles = getIgnoredFiles(pluginRoot, candidates);
    return candidates
        .filter(fullPath => !ignoredFiles.has(fullPath))
        .map((fullPath) => {
            const relativePath = toPosix(path.relative(pluginRoot, fullPath));
            const stat = fs.statSync(fullPath);
            return {
                source: 'littlewhitebox',
                publicPath: `scripts/extensions/third-party/LittleWhiteBox/${relativePath}`,
                relativePath,
                extension: path.extname(fullPath).toLowerCase(),
                sizeBytes: stat.size,
            };
        });
}

function buildPublicEntries() {
    const candidates = walkDirectory(publicRoot)
        .filter(fullPath => {
            const relativePath = toPosix(path.relative(publicRoot, fullPath));
            return !EXCLUDED_PUBLIC_SUBTREES.some(excluded => relativePath.startsWith(excluded));
        });
    const ignoredFiles = getIgnoredFiles(stRoot, candidates);
    return candidates
        .filter(fullPath => !ignoredFiles.has(fullPath))
        .map((fullPath) => {
            const relativePath = toPosix(path.relative(publicRoot, fullPath));
            const stat = fs.statSync(fullPath);
            return {
                source: 'sillytavern-public',
                publicPath: relativePath,
                relativePath,
                extension: path.extname(relativePath).toLowerCase(),
                sizeBytes: stat.size,
            };
        });
}

const manifest = {
    generatedAt: new Date().toISOString(),
    version: 2,
    files: [...buildPluginEntries(), ...buildPublicEntries()],
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Assistant file manifest written to ${path.relative(pluginRoot, outputPath)}`);
