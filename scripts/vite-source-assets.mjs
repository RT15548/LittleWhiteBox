import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

/** Media belongs to its feature, never to a second copy in the output tree. */
export function createSourceAssetPlugin({ root }) {
    const prefix = '\0source-asset:';
    return {
        name: 'plugin-source-assets',
        apply: 'build',
        enforce: 'pre',
        resolveId(source, importer) {
            if (!importer || !source.startsWith('.')) return null;
            const [filename, query] = source.split('?', 2);
            const parameters = new URLSearchParams(query);
            if (!parameters.has('url') || !parameters.has('no-inline')) return null;
            const resolved = path.resolve(path.dirname(importer.split('?')[0]), filename);
            const relative = path.relative(root, resolved);
            if (relative.startsWith(`..${path.sep}`) || relative === '..' || path.isAbsolute(relative)) return null;
            return prefix + resolved;
        },
        load(id) {
            if (!id.startsWith(prefix)) return null;
            const filename = id.slice(prefix.length);
            this.addWatchFile(filename);
            const version = createHash('sha256').update(fs.readFileSync(filename)).digest('hex').slice(0, 16);
            const url = path.relative(root, filename).split(path.sep).map(encodeURIComponent).join('/');
            const loader = path.join(root, 'core/build-assets.js').replaceAll('\\', '/');
            return `import { pluginAsset } from ${JSON.stringify(loader)};export default pluginAsset(${JSON.stringify(`${url}?v=${version}`)});`;
        },
    };
}
