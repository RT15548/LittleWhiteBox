import fs from 'node:fs';
import path from 'node:path';

/** Install only validated, explicitly owned outputs; restore the whole set on failure. */
export function publishBuild(root, stage, recovery, targets, rename = fs.renameSync) {
    const applied = [];
    try {
        for (const relative of targets) {
            const source = path.join(stage, relative), target = path.resolve(root, relative), backup = path.join(recovery, relative);
            if (!target.startsWith(root + path.sep)) throw new Error(`Unsafe build target: ${relative}`);
            fs.mkdirSync(path.dirname(target), { recursive: true });
            const item = { source, target, backup, moved: false, installed: false };
            applied.push(item);
            if (fs.existsSync(target)) { fs.mkdirSync(path.dirname(backup), { recursive: true }); rename(target, backup); item.moved = true; }
            rename(source, target); item.installed = true;
        }
    } catch (error) {
        for (const item of applied.reverse()) {
            if (item.installed) { fs.mkdirSync(path.dirname(item.source), { recursive: true }); rename(item.target, item.source); }
            if (item.moved) rename(item.backup, item.target);
        }
        throw error;
    }
}
