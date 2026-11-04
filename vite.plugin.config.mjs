import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { root, entries, pages } from './scripts/build/browser-entries.mjs';
import { createSourceAssetPlugin } from './scripts/vite-source-assets.mjs';
import { outputRoot } from './scripts/build/output-root.mjs';

const posix = value => value.replaceAll('\\', '/');
const inside = value => { const resolved = path.resolve(value); return resolved === root || resolved.startsWith(`${root}${path.sep}`); };

export default defineConfig({
    root,
    base: './',
    publicDir: false,
    plugins: [vue(), createSourceAssetPlugin({ root }), {
        name: 'plugin-source-boundaries',
        enforce: 'pre',
        configResolved(config) {
            if (path.resolve(config.build.outDir) !== path.join(outputRoot, 'dist')) throw new Error('Browser output must stay in the unified build staging directory.');
        },
        resolveId(source, importer) {
            if (!importer || !source.startsWith('.')) return;
            let resolved = path.resolve(path.dirname(importer.split('?')[0]), source.split('?')[0]);
            if (!inside(resolved)) return { id: `/__st__/${posix(path.relative(path.resolve(root, '../../../../..'), resolved))}`, external: true };
            if (fs.existsSync(path.join(outputRoot, path.relative(root, resolved)))) return posix(resolved);
            if (resolved.endsWith('.js') && fs.existsSync(resolved.slice(0, -3) + '.ts')) return posix(resolved.slice(0, -3) + '.ts');
        },
        load(id) {
            if (!id.startsWith('\0') && inside(id.split('?')[0]) && process.env.LWB_BUILD_STAGE) {
                const staged = path.join(process.env.LWB_BUILD_STAGE, path.relative(root, id.split('?')[0]));
                if (fs.existsSync(staged) && fs.statSync(staged).isFile() && /\.(js|ts|json)$/.test(staged)) return fs.readFileSync(staged, 'utf8');
            }
        },
        transform(code, id) {
            if (id.includes('/libs/msgpack.mjs')) return `export { decode } from '@msgpack/msgpack';`;
            if (id.includes('/libs/js-sha256.mjs')) return `export { sha256 } from 'js-sha256';`;
            if (posix(id).includes('/retry/lib/retry_operation.js')) return code.replace(/^.*console\.log\('Using RetryOperation\.(?:try|start)\(\) is deprecated'\);.*$/gm, '');
        },
    }, {
        name: 'plugin-build-manifest',
        generateBundle: { order: 'post', handler(_, bundle) {
            const chunks = Object.values(bundle).filter(item => item.type === 'chunk');
            const manifest = { buildId: '', entries: {}, resources: {}, pages };
            const audit = {};
            const cssFor = (chunk, visited = new Set()) => {
                if (!chunk || visited.has(chunk.fileName)) return [];
                visited.add(chunk.fileName);
                return [...new Set([...chunk.viteMetadata?.importedCss || [], ...chunk.imports.flatMap(file => cssFor(bundle[file], visited))])].sort();
            };
            for (const chunk of chunks) {
                // All emitted JS lives exactly one directory under dist.
                chunk.code = chunk.code.replaceAll(/(["'])\/__st__\/([^"']+)\1/g, (_match, quote, target) => `${quote}${posix(path.relative(path.resolve(root, 'dist', path.dirname(chunk.fileName)), path.resolve(root, '../../../../..', target)))}${quote}`);
                if (chunk.isEntry) manifest.entries[chunk.name] = { file: chunk.fileName, css: cssFor(chunk) };
                manifest.resources[chunk.fileName] = { imports: chunk.imports.filter(file => bundle[file]), dynamicImports: chunk.dynamicImports.filter(file => bundle[file]), css: cssFor(chunk) };
                audit[chunk.fileName] = Object.keys(chunk.modules).filter(id => inside(id)).map(id => posix(path.relative(root, id)));
            }
            const hash = createHash('sha256');
            for (const [file, item] of Object.entries(bundle).sort(([a], [b]) => a.localeCompare(b))) hash.update(file).update(item.type === 'chunk' ? item.code : item.source);
            for (const file of pages) hash.update(fs.readFileSync(path.join(root, file)));
            manifest.buildId = hash.digest('hex').slice(0, 20);
            fs.mkdirSync(path.join(root, 'output'), { recursive: true });
            fs.writeFileSync(path.join(root, 'output/browser-build-audit.json'), JSON.stringify({ buildId: manifest.buildId, modules: audit }, null, 2));
            this.emitFile({ type: 'asset', fileName: 'manifest.json', source: JSON.stringify(manifest, null, 2) + '\n' });
        } },
    }],
    define: { 'process.env.NODE_ENV': JSON.stringify('production'), global: 'globalThis' },
    build: {
        outDir: path.join(outputRoot, 'dist'), emptyOutDir: true, target: 'es2022', minify: 'esbuild', sourcemap: false,
        license: { fileName: 'THIRD-PARTY-LICENSES.md' },
        cssCodeSplit: true, modulePreload: false,
        rollupOptions: { input: Object.fromEntries(Object.entries(entries).map(([id, file]) => [id, path.join(root, file)])), preserveEntrySignatures: 'strict', output: {
            entryFileNames: info => info.name === 'host/plugin' ? 'host/plugin.js' : '[name]-[hash].js',
            chunkFileNames: 'shared/[name]-[hash].js', assetFileNames: 'assets/[name]-[hash][extname]',
        } },
    },
});
