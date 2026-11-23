import path from 'node:path';
import { registerHooks } from 'node:module';

// Browser code that derives asset and backend routes from import.meta.url sees
// its real installation layout; imports and implementation still come from this checkout.
const checkout = new URL('../', import.meta.url);
const installation = 'https://tavern.test/scripts/extensions/third-party/LittleWhiteBox/';
const browserModules = new Set(['core/build-assets.js', 'modules/draw/shared/drawing-runtime-client.js']
    .map(file => new URL(file, checkout).href));
const localUrl = url => url?.startsWith(installation) ? new URL(url.slice(installation.length), checkout).href : url;
registerHooks({
    resolve(specifier, context, next) {
        const result = next(specifier, { ...context, parentURL: localUrl(context.parentURL) });
        return browserModules.has(result.url) ? { ...result, url: installation + result.url.slice(checkout.href.length) } : result;
    },
    load(url, context, next) {
        return next(localUrl(url), context);
    },
});

// Node starts one isolated process per file. Only typed dependency trees need tsx.
const typedFiles = new Set(JSON.parse(process.env.LWB_TEST_TYPESCRIPT || '[]').map(file => path.resolve(file)));
if (process.argv[1] && typedFiles.has(path.resolve(process.argv[1]))) {
    await import('tsx');
}
