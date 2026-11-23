import path from 'node:path';
import { registerHooks } from 'node:module';

// Run the real browser asset resolver with its installation URL, independent
// of the checkout's filesystem name. Only its module location is substituted.
const assets = new URL('../core/build-assets.js', import.meta.url).href;
const installedAssets = 'https://tavern.test/scripts/extensions/third-party/LittleWhiteBox/core/build-assets.js';
registerHooks({
    resolve(specifier, context, next) {
        const result = next(specifier, context.parentURL === installedAssets ? { ...context, parentURL: assets } : context);
        return result.url === assets ? { ...result, url: installedAssets } : result;
    },
    load(url, context, next) {
        return next(url === installedAssets ? assets : url, context);
    },
});

// Node starts one isolated process per file. Only typed dependency trees need tsx.
const typedFiles = new Set(JSON.parse(process.env.LWB_TEST_TYPESCRIPT || '[]').map(file => path.resolve(file)));
if (process.argv[1] && typedFiles.has(path.resolve(process.argv[1]))) {
    await import('tsx');
}
