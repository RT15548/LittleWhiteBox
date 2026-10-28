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

/**
 * ST 核心模块的规范 URL 路径（相对于 ST 服务根）：
 * - script.js 位于服务根（public/script.js），其余前端模块均在 /scripts/ 下；
 * - 扩展内引用形如 extensions/regex/engine.js 的，落到 /scripts/extensions/...；
 * - 刻意不依赖构建机的文件系统布局：resolveId 产出的 /__st__/target 在不同机器上
 *   会解析成任意宿主路径，只有 basename/子目录名是稳定信号。
 */
const stModuleUrlPath = (target) => {
    const segs = String(target).split('/');
    const base = segs[segs.length - 1];
    // ST 仅这两个 JS 模块位于服务根（public/script.js、public/lib.js），其余前端模块均在 /scripts/ 下。
    if (base === 'script.js' || base === 'lib.js') return base;
    const extIdx = segs.indexOf('extensions');
    if (extIdx >= 0 && extIdx < segs.length - 1) return `scripts/extensions/${segs.slice(extIdx + 1).join('/')}`;
    if (segs[segs.length - 2] === 'slash-commands') return `scripts/slash-commands/${base}`;
    if (segs[segs.length - 2] === 'util') return `scripts/util/${base}`;
    return `scripts/${base}`;
};

/** dist 下各 chunk 的 URL 深度 = 4（scripts/extensions/third-party/<name>）+ 1（dist）+ 子目录层数。 */
const stRelativePrefix = (fileName) => '../'.repeat(5 + fileName.split('/').length - 1);

const rewriteStModuleRefs = (code, fileName) => {
    if (!code.includes('__st__/')) return null;
    const ups = stRelativePrefix(fileName);
    const rewrite = (_match, quote, target) => `${quote}${ups}${stModuleUrlPath(target)}${quote}`;
    // 两种形态都吃：base 相对化之前是 "/__st__/x"，之后是 "(../)+__st__/x"。
    const rewritten = code
        .replaceAll(/(["'])\/__st__\/([^"']+)\1/g, rewrite)
        .replaceAll(/(["'])(?:\.\.\/)+__st__\/([^"']+)\1/g, rewrite);
    return rewritten === code ? null : rewritten;
};

export default defineConfig({
    root,
    base: './',
    publicDir: false,
    plugins: [vue(), createSourceAssetPlugin({ root }), {
        name: 'plugin-st-module-rewrite',
        renderChunk(code, chunk) {
            return rewriteStModuleRefs(code, chunk.fileName);
        },
    }, {
        name: 'plugin-source-boundaries',
        enforce: 'pre',
        configResolved(config) {
            if (path.resolve(config.build.outDir) !== path.join(outputRoot, 'dist')) throw new Error('Browser output must stay in the unified build staging directory.');
        },
        resolveId(source, importer) {
            if (!importer || !source.startsWith('.')) return;
            let resolved = path.resolve(path.dirname(importer.split('?')[0]), source.split('?')[0]);
            if (!inside(resolved)) return { id: `/__st__/${posix(path.relative(path.resolve(root, '../../../../..'), resolved))}`, external: true };
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
