import path from 'node:path';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

function readHashInput(filePath) {
    try {
        return readFileSync(filePath, 'utf8');
    } catch {
        return '';
    }
}

function normalizeGeneratedEbookChunk(code = '') {
    const whitespaceTemplateLiteral = ['` ', '\\r\t`'].join('\n');
    return String(code || '').replaceAll(whitespaceTemplateLiteral, '" \\\\n\\\\r\\\\t"');
}

function createEbookBuildInfoPlugin() {
    return {
        name: 'ebook-build-info',
        generateBundle(_options, bundle) {
            const appChunk = bundle['ebook-app.js'];
            if (appChunk && typeof appChunk.code === 'string') {
                appChunk.code = normalizeGeneratedEbookChunk(appChunk.code);
            }
            const source = typeof appChunk?.code === 'string'
                ? appChunk.code
                : String(appChunk?.source || '');
            const hashInput = [
                source,
                readHashInput(path.resolve('modules/ebook/ebook.html')),
                readHashInput(path.resolve('modules/ebook/ebook.js')),
            ].join('\n/* ebook-build-boundary */\n');
            const hash = createHash('sha256').update(hashInput).digest('hex').slice(0, 16);
            this.emitFile({
                type: 'asset',
                fileName: 'ebook-build.json',
                source: `${JSON.stringify({ hash }, null, 4)}\n`,
            });
        },
    };
}

export default defineConfig({
    plugins: [{
        name: 'strip-retry-deprecation-logs',
        transform(code, id) {
            const normalizedId = id.replace(/\\/g, '/');
            if (!normalizedId.includes('/retry/lib/retry_operation.js')) {
                return null;
            }
            return {
                code: code
                    .replace("  console.log('Using RetryOperation.try() is deprecated');\n", '')
                    .replace("  console.log('Using RetryOperation.start() is deprecated');\n", ''),
                map: null,
            };
        },
    }, createEbookBuildInfoPlugin()],
    build: {
        emptyOutDir: false,
        outDir: path.resolve('modules/ebook/dist'),
        lib: {
            entry: path.resolve('modules/ebook/app-src/main.js'),
            formats: ['es'],
            fileName: () => 'ebook-app.js',
        },
        rollupOptions: {
            output: {
                manualChunks: undefined,
            },
        },
        modulePreload: false,
        cssCodeSplit: false,
        ...(/** @type {const} */ ({ codeSplitting: false })),
        target: 'es2022',
        minify: 'esbuild',
        sourcemap: false,
    },
});
