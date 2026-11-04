import fs from 'fs';
import path from 'path';
import { collectWorkspaceFiles } from './workspace-files.mjs';
import { scanGarbledText } from './garbled-text.mjs';

const root = process.cwd();
const includeExts = new Set(['.js', '.html', '.css']);

const files = collectWorkspaceFiles(root, includeExts);
const issues = [];

for (const file of files) {
    const relativePath = path.relative(root, file).split(path.sep).join('/');
    const hits = scanGarbledText(relativePath, fs.readFileSync(file));
    if (hits.length) {
        issues.push({ file, hits });
    }
}

if (issues.length) {
    console.error('Garbled text check failed:');
    for (const issue of issues) {
        const rel = path.relative(root, issue.file);
        for (const hit of issue.hits) {
            console.error(`- ${rel}:${hit.line}:${hit.column} [${hit.name}] ${hit.preview}`);
        }
    }
    process.exit(1);
} else {
    console.log('Garbled text check passed.');
}
