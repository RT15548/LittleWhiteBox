import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { parse, compileScript } from '@vue/compiler-sfc';
import { validateMapDomain } from '../../modules/xiaobai-os/domains/map/invariants.ts';
import { createEmptyMapDomain } from '../../modules/xiaobai-os/domains/map/state.ts';
import { compileSceneIntent } from '../../modules/xiaobai-os/apps/map/maintenance/scene-intent-compiler.ts';
import { sceneMapInputs } from '../../modules/xiaobai-os/tests/fixtures/scene-maps.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const fixtures = ['cabin', 'tavern', 'valley'].map(key => {
    const input = sceneMapInputs.find(item => item.scene === key);
    const compiled = compileSceneIntent(createEmptyMapDomain(), input, { actorKey: 'player', displayName: '小白' });
    if (compiled.result.skipped.length) throw new Error(JSON.stringify(compiled.result));
    validateMapDomain(compiled.domain);
    const scene = Object.values(compiled.domain.scenes)[0];
    if (!scene || scene.elements.length !== input.elements.length) throw new Error('Incomplete fixture: ' + key);
    return { id: key, input, scene };
});
const font = await fs.readFile(path.resolve(root, '../../libs/material-symbols/material-symbols-rounded.woff2'));
const fontUrl = 'data:font/woff2;base64,' + font.toString('base64');
const built = await build({
    entryPoints: [path.join(root, 'preview.js')], outdir: path.join(root, 'bundle'), bundle: true, write: false,
    format: 'iife', target: 'es2022', minify: true, legalComments: 'inline',
    define: { __VUE_OPTIONS_API__: 'false', __VUE_PROD_DEVTOOLS__: 'false', __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false', 'process.env.NODE_ENV': '"production"' },
    alias: { three: path.join(root, 'vendor/three.module.js') },
    plugins: [{ name: 'demo-only-adapters', setup(builder) {
        builder.onResolve({ filter: /^demo:scenes$/ }, () => ({ path: 'scenes', namespace: 'demo' }));
        builder.onLoad({ filter: /.*/, namespace: 'demo' }, () => ({ contents: 'export default ' + JSON.stringify(fixtures), loader: 'js' }));
        // Change only the asset URL for offline use; retain the production loader's behavior.
        builder.onLoad({ filter: /map-symbols\.ts$/ }, async args => {
            const source = await fs.readFile(args.path, 'utf8');
            const target = 'new URL(relativePath, import.meta.url)';
            if (!source.includes(target)) throw new Error('Map font loader changed; recheck the demo resource adapter.');
            return { contents: source.replace(target, 'new URL(' + JSON.stringify(fontUrl) + ')'), loader: 'ts' };
        });
        builder.onLoad({ filter: /\.vue$/ }, async args => {
            const source = await fs.readFile(args.path, 'utf8');
            const { descriptor, errors } = parse(source, { filename: args.path });
            if (errors.length) throw errors[0];
            if (descriptor.styles.length) throw new Error('Review scoped SFC styles before bundling this component.');
            const compiled = compileScript(descriptor, { id: path.basename(args.path), inlineTemplate: true, isProd: true });
            return { contents: compiled.content, loader: 'ts', resolveDir: path.dirname(args.path) };
        });
    } }],
});
const template = await fs.readFile(path.join(root, 'template.html'), 'utf8');
const script = built.outputFiles.find(file => file.path.endsWith('.js')).text.replaceAll('</script', '<\\/script');
const css = built.outputFiles.find(file => file.path.endsWith('.css')).text;
const license = await fs.readFile(path.join(root, 'vendor/LICENSE'), 'utf8');
const html = template.replace('/* DEMO_BUNDLE */', () => script).replace('/* MAP_COMPONENT_CSS */', () => css)
    .replace('<head>', () => '<head>\n<!-- three.js 0.180.0\n' + license + '\n-->');
await fs.writeFile(path.join(root, 'index.html'), html);
console.log('Compiled and validated: ' + fixtures.map(f => f.id + ' (' + f.scene.elements.length + ')').join(', ') + '. Production MapScene embedded. Offline HTML: ' + Math.round(Buffer.byteLength(html) / 1024) + ' KiB.');
