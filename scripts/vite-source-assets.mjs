import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

/** Keep OS media beside its owning feature, shared by source and the flat production bundles. */
export function createSourceAssetPlugin({ root, outputDirectory }) {
    return {
        name: 'xiaobai-os-source-assets',
        apply: 'build',
        enforce: 'pre',
        load(id) {
            const [filename, query] = id.split('?', 2);
            const parameters = new URLSearchParams(query);
            if (!parameters.has('url') || !parameters.has('no-inline')) return null;
            const relative = path.relative(root, filename);
            if (relative.startsWith(`..${path.sep}`) || relative === '..' || path.isAbsolute(relative)) return null;
            this.addWatchFile(filename);
            const version = createHash('sha256').update(fs.readFileSync(filename)).digest('hex').slice(0, 16);
            const url = path.relative(outputDirectory, filename).split(path.sep).map(encodeURIComponent).join('/');
            return `export default new URL(/* @vite-ignore */ ${JSON.stringify(`${url}?v=${version}`)}, import.meta.url).href;`;
        },
    };
}
