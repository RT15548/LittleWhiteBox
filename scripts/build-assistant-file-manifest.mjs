
import fs from 'node:fs';
import { outputRoot } from './build/output-root.mjs';
import path from 'node:path';
import ignore from 'ignore';
import { official, referenceFor } from './host/official.mjs';

const pluginRoot = process.cwd();
const MANIFEST_RELATIVE_PATH = 'modules/assistant/assistant-file-manifest.json';
const outputPath = path.join(outputRoot, MANIFEST_RELATIVE_PATH);

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
            if (currentPath === rootPath && entry.name === 'output') continue;
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
    const stagedFiles = outputRoot === pluginRoot ? [] : walkDirectory(outputRoot)
        .map(fullPath => path.join(pluginRoot, path.relative(outputRoot, fullPath)));
    const candidates = [...new Set([...walkDirectory(pluginRoot), ...stagedFiles])]
        .sort((a, b) => toPosix(a) < toPosix(b) ? -1 : toPosix(a) > toPosix(b) ? 1 : 0)
        .filter((fullPath) => {
            const relativePath = toPosix(path.relative(pluginRoot, fullPath));
            // The manifest cannot describe itself: recording its own sizeBytes changes
            // that size, so the entry would always report the previous build.
            if (relativePath === MANIFEST_RELATIVE_PATH) return false;
            // Local previews and verification output are not plugin source.
            if (relativePath.startsWith('output/')) return false;
            return true;
        });
    const ignoredFiles = getIgnoredFiles(pluginRoot, candidates);
    return candidates
        .filter(fullPath => !ignoredFiles.has(fullPath))
        .map((fullPath) => {
            const relativePath = toPosix(path.relative(pluginRoot, fullPath));
            const stagedPath = path.join(outputRoot, relativePath);
            const sourcePath = fs.existsSync(stagedPath) ? stagedPath : fullPath;
            // The index describes canonical text, independent of Git's checkout EOLs.
            const sizeBytes = Buffer.byteLength(fs.readFileSync(sourcePath, 'utf8').replace(/\r\n/g, '\n'));
            return {
                source: 'littlewhitebox',
                publicPath: `scripts/extensions/third-party/LittleWhiteBox/${relativePath}`,
                relativePath,
                extension: path.extname(fullPath).toLowerCase(),
                sizeBytes,
            };
        });
}

function buildPublicEntries() {
    // A fixed official reference indexes host source; installed host edits and extra
    // extensions are never build inputs. This does not restrict developers' host version.
    return referenceFor(official.indexVersion).entries
        .filter(entry => entry.path.startsWith('public/') && TEXT_EXTENSIONS.has(path.extname(entry.path))
            && !entry.path.endsWith('.min.js') && path.basename(entry.path) !== 'package-lock.json')
        .map((entry) => {
            const relativePath = entry.path.slice('public/'.length);
            return {
                source: 'sillytavern-public',
                publicPath: relativePath,
                relativePath,
                extension: path.extname(relativePath).toLowerCase(),
                sizeBytes: entry.size,
            };
        });
}

// Deliberately free of a build timestamp: the manifest is a pure function of the
// scanned sources, so rebuilding without source changes must produce no diff.
const manifest = {
    version: 2,
    files: [...buildPluginEntries(), ...buildPublicEntries()],
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Assistant file manifest written to ${path.relative(pluginRoot, outputPath)}`);
