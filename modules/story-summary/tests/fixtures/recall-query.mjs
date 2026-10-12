import { Buffer } from 'node:buffer';
import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Real recall ownership, query policy and HTTP transport. Only host config and
// logging are replaced; each test supplies its own unbilled HTTP responses.
const root = fileURLToPath(new URL('../../../../', import.meta.url));
const shims = {
    'config.js': 'export const getVectorConfig=()=>({});',
    'debug-core.js': 'export const xbLog={isEnabled:()=>false,warn(){}};',
};
const bundle = await build({
    stdin: { resolveDir: root, contents: `
        export * from './modules/story-summary/vector/retrieval/query-embedding.js';
        export { embed as embedVectors } from './modules/story-summary/vector/llm/siliconflow.js';
        export * from './modules/story-summary/generate/recall-failure.js';
        export * from './modules/story-summary/vector/runtime/vector-activity.js';
        export * from './modules/story-summary/generate/recall-prefetch.js';
        export * from './modules/story-summary/generate/required-recall.js';
    ` },
    bundle: true, write: false, format: 'esm', platform: 'node',
    plugins: [{ name: 'query-host-boundaries', setup(api) {
        api.onResolve({ filter: /.*/ }, args => {
            const name = path.basename(args.path);
            return Object.hasOwn(shims, name) ? { path: name, namespace: 'host' } : null;
        });
        api.onLoad({ filter: /.*/, namespace: 'host' }, args => ({ contents: shims[args.path] }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- locally bundled production modules and fixed host shims only
export default await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
