import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        {
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
        },
        {
            name: 'normalize-partial-json-whitespace-scan',
            transform(code, id) {
                const normalizedId = id.replace(/\\/g, '/');
                if (!normalizedId.includes('/openai/_vendor/partial-json-parser/parser.mjs')) {
                    return null;
                }
                return {
                    code: code.replace(
                        "while (index < length && ' \\n\\r\\t'.includes(jsonString[index])) {",
                        'while (index < length && [32, 10, 13, 9].includes(jsonString.charCodeAt(index))) {',
                    ),
                    map: null,
                };
            },
        },
    ],
    build: {
        emptyOutDir: true,
        outDir: path.resolve('modules/agent-core/dist'),
        lib: {
            entry: path.resolve('modules/agent-core/browser-entry.js'),
            formats: ['es'],
            fileName: () => 'agent-core-browser.js',
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
