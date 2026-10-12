/* eslint-env node */
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'acorn';
import { collectWorkspaceFiles } from './workspace-files.mjs';

const ROOT_DIR = process.cwd();
const CHECK_EXTENSIONS = new Set(['.js', '.mjs', '.cjs']);
const RESOLVE_EXTENSIONS = ['.js', '.mjs', '.cjs', '.json', '.html', '.css'];
const TYPESCRIPT_SOURCE_EXTENSIONS = new Map([
    ['.js', ['.ts', '.tsx']],
    ['.mjs', ['.mts']],
    ['.cjs', ['.cts']],
]);
const IGNORE_DIRS = new Set(['dist', 'coverage']);

function toPosix(value) {
    return value.split(path.sep).join('/');
}

function isRelativeSpecifier(specifier) {
    return specifier.startsWith('./') || specifier.startsWith('../');
}

function stripResourceSuffix(specifier) {
    return specifier.split(/[?#]/, 1)[0];
}

function isFile(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    } catch {
        return false;
    }
}

function hasExactSpecifierPathCase(fromFile, specifier) {
    const cleanSpecifier = stripResourceSuffix(specifier);
    const segments = cleanSpecifier.split(/[\\/]+/).filter(Boolean);
    let currentPath = path.dirname(fromFile);

    for (const segment of segments) {
        if (segment === '.') continue;
        if (segment === '..') {
            currentPath = path.dirname(currentPath);
            continue;
        }

        let entries = [];
        try {
            entries = fs.readdirSync(currentPath);
        } catch {
            return false;
        }

        if (!entries.includes(segment)) {
            return false;
        }
        currentPath = path.join(currentPath, segment);
    }

    return true;
}

function resolveExistingImport(fromFile, specifier) {
    const cleanSpecifier = stripResourceSuffix(specifier);
    const basePath = path.resolve(path.dirname(fromFile), cleanSpecifier);
    const candidates = [basePath];
    const sourceExtensions = TYPESCRIPT_SOURCE_EXTENSIONS.get(path.extname(basePath)) || [];

    for (const extension of sourceExtensions) {
        candidates.push(`${basePath.slice(0, -path.extname(basePath).length)}${extension}`);
    }

    if (!path.extname(basePath)) {
        for (const extension of RESOLVE_EXTENSIONS) {
            candidates.push(`${basePath}${extension}`);
        }
        for (const extension of RESOLVE_EXTENSIONS) {
            candidates.push(path.join(basePath, `index${extension}`));
        }
    }

    return candidates.find(isFile) || null;
}

function parseJavaScript(source, filePath) {
    const options = {
        ecmaVersion: 'latest',
        locations: true,
        allowHashBang: true,
        allowReturnOutsideFunction: true,
    };

    try {
        return parse(source, { ...options, sourceType: 'module' });
    } catch (moduleError) {
        try {
            return parse(source, { ...options, sourceType: 'script' });
        } catch (scriptError) {
            const relativePath = toPosix(path.relative(ROOT_DIR, filePath));
            throw new Error(`${relativePath}: parse failed: ${moduleError.message}; ${scriptError.message}`);
        }
    }
}

function getStringLiteralValue(node) {
    if (!node) return null;
    if (node.type === 'Literal' && typeof node.value === 'string') return node.value;
    return null;
}

function collectRelativeSpecifiers(ast) {
    const specifiers = [];

    function addSpecifier(node, sourceNode) {
        const specifier = getStringLiteralValue(sourceNode);
        if (specifier && isRelativeSpecifier(specifier)) {
            specifiers.push({ specifier, loc: sourceNode.loc || node.loc });
        }
    }

    function visit(node) {
        if (!node || typeof node.type !== 'string') return;

        if (
            node.type === 'ImportDeclaration'
            || node.type === 'ExportNamedDeclaration'
            || node.type === 'ExportAllDeclaration'
        ) {
            addSpecifier(node, node.source);
        } else if (node.type === 'ImportExpression') {
            addSpecifier(node, node.source);
        } else if (
            node.type === 'CallExpression'
            && node.callee?.type === 'Import'
            && node.arguments?.length === 1
        ) {
            addSpecifier(node, node.arguments[0]);
        } else if (
            node.type === 'CallExpression'
            && node.callee?.type === 'Identifier'
            && node.callee.name === 'require'
            && node.arguments?.length === 1
        ) {
            addSpecifier(node, node.arguments[0]);
        }

        for (const value of Object.values(node)) {
            if (!value) continue;
            if (Array.isArray(value)) {
                for (const child of value) visit(child);
            } else if (typeof value === 'object' && typeof value.type === 'string') {
                visit(value);
            }
        }
    }

    visit(ast);
    return specifiers;
}

function checkFile(filePath) {
    const source = fs.readFileSync(filePath, 'utf8');
    const ast = parseJavaScript(source, filePath);
    const problems = [];

    for (const { specifier, loc } of collectRelativeSpecifiers(ast)) {
        const relativePath = toPosix(path.relative(ROOT_DIR, filePath));
        const line = loc?.start?.line ?? 1;
        const column = (loc?.start?.column ?? 0) + 1;
        const resolvedImport = resolveExistingImport(filePath, specifier);

        if (!resolvedImport) {
            problems.push(`${relativePath}:${line}:${column} missing relative import "${specifier}"`);
            continue;
        }

        const resolvedSpecifier = toPosix(path.relative(path.dirname(filePath), resolvedImport));
        if (!hasExactSpecifierPathCase(filePath, resolvedSpecifier)) {
            problems.push(`${relativePath}:${line}:${column} import path case mismatch "${specifier}"`);
        }
    }

    return problems;
}

const files = collectWorkspaceFiles(ROOT_DIR, CHECK_EXTENSIONS, IGNORE_DIRS);
const problems = [];

for (const filePath of files) {
    problems.push(...checkFile(filePath));
}

if (problems.length) {
    console.error(`Relative import existence check failed (${problems.length}):`);
    for (const problem of problems) {
        console.error(`  ${problem}`);
    }
    process.exitCode = 1;
} else {
    console.log(`Relative import existence check passed (${files.length} files).`);
}
