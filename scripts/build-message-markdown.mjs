import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

// Native-module iframes cannot resolve the shared renderer's npm import.
// Publish only its parser entry, without the chat UI or HTML preview controls.
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = resolve(projectRoot, 'modules/agent-core/ui/dist/message-markdown.js');
const result = await build({
    absWorkingDir: projectRoot,
    stdin: {
        contents: "export { renderMarkdownToHtml } from './modules/agent-core/ui/message-markdown.js';",
        resolveDir: projectRoot,
        sourcefile: 'message-markdown-entry.js',
    },
    bundle: true, format: 'esm', platform: 'browser', target: 'es2022',
    minify: true, legalComments: 'inline', tsconfigRaw: {}, write: false,
});
const contents = result.outputFiles[0].contents;
if (process.argv.includes('--check')) {
    if (!(await readFile(outputPath)).equals(contents)) {
        throw new Error('Markdown browser bundle is stale; run npm run build:message-markdown');
    }
} else {
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, contents);
}
