/* eslint-env node */
import fs from 'node:fs';
import path from 'node:path';
import ignore from 'ignore';

export function collectWorkspaceFiles(root, extensions, ignoredDirectories = new Set()) {
    const matcher = ignore().add('.git/').add(fs.readFileSync(path.join(root, '.gitignore'), 'utf8'));
    const files = [];

    function walk(directory) {
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
            const fullPath = path.join(directory, entry.name);
            const relativePath = path.relative(root, fullPath).split(path.sep).join('/');
            if (matcher.ignores(entry.isDirectory() ? `${relativePath}/` : relativePath)) continue;
            if (entry.isDirectory()) {
                if (!ignoredDirectories.has(entry.name)) walk(fullPath);
            } else if (entry.isFile() && extensions.has(path.extname(entry.name))) {
                files.push(fullPath);
            }
        }
    }

    walk(root);
    return files;
}

// ESLint owns the distinction between authored source and generated/vendor files.
// Tests, type checking and page discovery reuse it instead of listing modules.
export function collectSourceFiles(root, extensions) {
    const matcher = ignore().add(fs.readFileSync(path.join(root, '.eslintignore'), 'utf8'));
    return collectWorkspaceFiles(root, extensions)
        .filter(file => !matcher.ignores(path.relative(root, file).split(path.sep).join('/')))
        .sort();
}
