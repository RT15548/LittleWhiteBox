import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const xiaobaiOsRoot = path.resolve('modules/xiaobai-os');

function readAppCatalog(relativePath) {
    const ids = JSON.parse(fs.readFileSync(path.resolve(xiaobaiOsRoot, relativePath), 'utf8'));
    if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string' || !id) || new Set(ids).size !== ids.length) {
        throw new Error(`Invalid Xiaobai OS APP catalog: ${relativePath}`);
    }
    return ids;
}

const hostAppIds = readAppCatalog('host/app-catalog.json');
const shellAppIds = readAppCatalog('shell/app-catalog.json');
if (hostAppIds.length !== shellAppIds.length || hostAppIds.some((id, index) => id !== shellAppIds[index])) {
    throw new Error(`Xiaobai OS Host/Shell APP catalogs differ: ${hostAppIds.join(',')} != ${shellAppIds.join(',')}`);
}

function createEslintDisableBannerPlugin() {
    return {
        name: 'xiaobai-os-eslint-disable-banner',
        generateBundle(_options, bundle) {
            Object.values(bundle).forEach((item) => {
                if (item.type === 'chunk' && typeof item.code === 'string' && !item.code.startsWith('/* eslint-disable */')) {
                    item.code = `/* eslint-disable */\n${item.code}`;
                }
            });
        },
    };
}

function createMapAssetCreditsPlugin() {
    return {
        name: 'xiaobai-os-map-asset-credits',
        generateBundle() {
            for (const file of ['SOURCES.md', 'LICENSE-furniture.txt', 'LICENSE-nature.txt', 'LICENSE-car.txt', 'LICENSE-survival.txt']) {
                this.emitFile({ type: 'asset', fileName: `map-assets/${file}`,
                    source: fs.readFileSync(path.join(xiaobaiOsRoot, 'apps/map/ui/three/assets/kenney', file)) });
            }
        },
    };
}

function createAgentCompatibilityPlugin() {
    return {
        name: 'xiaobai-os-agent-compatibility',
        transform(code, id) {
            const normalizedId = id.replace(/\\/g, '/');
            if (normalizedId.includes('/retry/lib/retry_operation.js')) {
                return {
                    code: code
                        .replace("  console.log('Using RetryOperation.try() is deprecated');\n", '')
                        .replace("  console.log('Using RetryOperation.start() is deprecated');\n", ''),
                    map: null,
                };
            }
            if (normalizedId.includes('/openai/_vendor/partial-json-parser/parser.mjs')) {
                return {
                    code: code.replace(
                        "while (index < length && ' \\n\\r\\t'.includes(jsonString[index])) {",
                        'while (index < length && [32, 10, 13, 9].includes(jsonString.charCodeAt(index))) {',
                    ),
                    map: null,
                };
            }
            return null;
        },
    };
}

function createHostExternalPlugin() {
    return {
        name: 'xiaobai-os-host-externals',
        enforce: 'pre',
        resolveId(source, importer) {
            if (!importer || !source.startsWith('.')) return null;
            // Only OS source owns this host boundary. Relative imports inside
            // npm packages must stay in the bundle, not point at node_modules.
            const importerRelativeToOs = path.relative(xiaobaiOsRoot, importer);
            if (importerRelativeToOs.startsWith('..') || path.isAbsolute(importerRelativeToOs)) return null;
            const resolved = path.resolve(path.dirname(importer), source);
            const relativeToOs = path.relative(xiaobaiOsRoot, resolved);
            const belongsToOs = relativeToOs === ''
                || (!relativeToOs.startsWith('..') && !path.isAbsolute(relativeToOs));
            return belongsToOs ? null : { id: resolved, external: true };
        },
    };
}

export default defineConfig(({ mode }) => {
    const buildAgent = mode === 'xiaobai-os-agent';
    const buildHost = mode === 'xiaobai-os-host';
    const buildShell = !buildAgent && !buildHost;
    const outputDirectory = path.resolve(globalThis.process.env.XIAOBAI_OS_OUT_DIR || 'modules/xiaobai-os/dist');
    return {
        plugins: [
            ...(buildAgent ? [createAgentCompatibilityPlugin()] : []),
            ...(buildHost ? [createHostExternalPlugin()] : []),
            ...(buildShell ? [vue(), createMapAssetCreditsPlugin()] : []),
            createEslintDisableBannerPlugin(),
        ],
        define: {
            'process.env.NODE_ENV': JSON.stringify('production'),
            global: 'globalThis',
        },
        experimental: {
            renderBuiltUrl(filename, { hostType }) {
                // Map models live beside the lazy UI chunk, not at SillyTavern's web root.
                if (hostType === 'js' && filename.startsWith('map-assets/')) {
                    return { runtime: `new URL(${JSON.stringify(filename)}, import.meta.url).href` };
                }
            },
        },
        build: {
            emptyOutDir: buildShell,
            outDir: outputDirectory,
            lib: {
                entry: path.resolve(
                    buildAgent
                        ? 'modules/xiaobai-os/agent/browser-entry.ts'
                        : buildHost
                            ? 'modules/xiaobai-os/index.ts'
                            : 'modules/xiaobai-os/shell/app-src/main.ts',
                ),
                formats: ['es'],
                fileName: () => {
                    if (buildAgent) return 'xiaobai-os-agent.js';
                    if (buildHost) return 'xiaobai-os-host.js';
                    return 'xiaobai-os-app.js';
                },
                cssFileName: 'xiaobai-os-app',
            },
            rollupOptions: {
                output: {
                    manualChunks: undefined,
                    chunkFileNames: 'xiaobai-os-[name]-[hash].js',
                    assetFileNames: asset => asset.names.some(name => name.endsWith('.glb'))
                        ? 'map-assets/[name]-[hash][extname]' : '[name][extname]',
                    paths: buildHost
                        ? (id) => {
                            if (!path.isAbsolute(id)) return id;
                            const relative = path.relative(outputDirectory, id).replace(/\\/g, '/');
                            return relative.startsWith('.') ? relative : `./${relative}`;
                        }
                        : undefined,
                },
            },
            modulePreload: false,
            cssCodeSplit: false,
            target: 'es2022',
            minify: 'esbuild',
            sourcemap: false,
        },
    };
});
