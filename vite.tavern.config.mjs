import path from 'node:path';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const TAVERN_UI_VERSION = 'tavern-ui-1';

function readHashInput(filePath) {
    try {
        return readFileSync(filePath, 'utf8');
    } catch {
        return '';
    }
}

function createTavernBuildInfoPlugin() {
    return {
        name: 'tavern-build-info',
        generateBundle(_options, bundle) {
            const appChunk = bundle['tavern-app.js'];
            const source = typeof appChunk?.code === 'string'
                ? appChunk.code
                : String(appChunk?.source || '');
            const hashInput = [
                TAVERN_UI_VERSION,
                source,
                readHashInput(path.resolve('modules/tavern/tavern.html')),
                readHashInput(path.resolve('modules/tavern/tavern.ts')),
                readHashInput(path.resolve('modules/tavern/host/agent-config.ts')),
                readHashInput(path.resolve('modules/tavern/host/chat-presets.ts')),
                readHashInput(path.resolve('modules/tavern/host/sillytavern-context.ts')),
            ].join('\n/* tavern-build-boundary */\n');
            const hash = createHash('sha256').update(hashInput).digest('hex').slice(0, 16);
            this.emitFile({
                type: 'asset',
                fileName: 'tavern-build.json',
                source: `${JSON.stringify({ uiVersion: TAVERN_UI_VERSION, hash }, null, 4)}\n`,
            });
        },
    };
}

function createEslintDisableBannerPlugin() {
    return {
        name: 'tavern-eslint-disable-banner',
        generateBundle(_options, bundle) {
            Object.values(bundle).forEach((item) => {
                if (item.type === 'chunk' && typeof item.code === 'string' && !item.code.startsWith('/* eslint-disable */')) {
                    item.code = `/* eslint-disable */\n${item.code}`;
                }
            });
        },
    };
}

function createDiffCheckSafeBundlePlugin() {
    return {
        name: 'tavern-diff-check-safe-bundle',
        generateBundle(_options, bundle) {
            Object.values(bundle).forEach((item) => {
                if (item.type !== 'chunk' || typeof item.code !== 'string') return;
                item.code = item.code.replace(/` \n\\r\t`/g, '" \\n\\r\\t"');
            });
        },
    };
}

export default defineConfig({
    plugins: [vue(), createEslintDisableBannerPlugin(), createDiffCheckSafeBundlePlugin(), createTavernBuildInfoPlugin()],
    define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
        global: 'globalThis',
    },
    build: {
        emptyOutDir: false,
        outDir: path.resolve('modules/tavern/dist'),
        lib: {
            entry: path.resolve('modules/tavern/app-src/main.ts'),
            formats: ['es'],
            fileName: () => 'tavern-app.js',
            cssFileName: 'tavern-app',
        },
        rollupOptions: {
            output: {
                manualChunks: undefined,
            },
        },
        modulePreload: false,
        cssCodeSplit: false,
        target: 'es2022',
        minify: 'esbuild',
        sourcemap: false,
    },
});
