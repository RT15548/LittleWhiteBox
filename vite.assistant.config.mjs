import path from 'node:path';
import { defineConfig } from 'vite';

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
    }],
    build: {
        emptyOutDir: false,
        outDir: path.resolve('modules/assistant/dist'),
        lib: {
            entry: path.resolve('modules/assistant/app-src/main.js'),
            formats: ['es'],
            fileName: () => 'assistant-app.js',
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
