import fs from 'node:fs';
import path from 'node:path';

export function buildFiles(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
        ? buildFiles(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
}

export function compareBuild(root, stage) {
    for (const source of buildFiles(stage)) {
        const relative = path.relative(stage, source), installed = path.join(root, relative);
        if (!fs.existsSync(installed) || !fs.readFileSync(source).equals(fs.readFileSync(installed))) {
            throw Object.assign(new Error(`Stale build output: ${relative}`), { code: 'BUILD_ARTIFACT_STALE' });
        }
    }
    const expected = new Set(buildFiles(path.join(stage, 'dist')).map(file => path.relative(path.join(stage, 'dist'), file)));
    for (const file of buildFiles(path.join(root, 'dist'))) {
        if (!expected.has(path.relative(path.join(root, 'dist'), file))) {
            throw Object.assign(new Error(`Obsolete build output: ${file}`), { code: 'BUILD_ARTIFACT_OBSOLETE' });
        }
    }
}
