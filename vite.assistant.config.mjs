import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
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
