/* eslint-env node */
import fs from 'fs';
import path from 'path';
import { collectWorkspaceFiles } from './workspace-files.mjs';

const root = process.cwd();
const includeExts = new Set(['.js', '.html', '.css']);

const patterns = [
    { name: 'question-marks', regex: /\?\?\?/g },
    { name: 'replacement-char', regex: /\uFFFD/g },
];

function scanFile(filePath) {
    let content = '';
    try {
        content = fs.readFileSync(filePath, 'utf8');
    } catch {
        return [];
    }

    const lines = content.split(/\r?\n/);
    const hits = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (const { name, regex } of patterns) {
            regex.lastIndex = 0;
            if (regex.test(line)) {
                const preview = line.replace(/\t/g, '\\t').slice(0, 200);
                hits.push({ line: i + 1, name, preview });
            }
        }
    }

    return hits;
}

const files = collectWorkspaceFiles(root, includeExts);
const issues = [];

for (const file of files) {
    const hits = scanFile(file);
    if (hits.length) {
        issues.push({ file, hits });
    }
}

if (issues.length) {
    console.error('Garbled text check failed:');
    for (const issue of issues) {
        const rel = path.relative(root, issue.file);
        for (const hit of issue.hits) {
            console.error(`- ${rel}:${hit.line} [${hit.name}] ${hit.preview}`);
        }
    }
    process.exit(1);
} else {
    console.log('Garbled text check passed.');
}
