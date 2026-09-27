import path from 'node:path';
import { build } from 'vite';
import vue from '@vitejs/plugin-vue';
import { validateMapDomain } from '../../modules/xiaobai-os/domains/map/invariants.ts';
import { createEmptyMapDomain } from '../../modules/xiaobai-os/domains/map/state.ts';
import { compileSceneIntent } from '../../modules/xiaobai-os/apps/map/tools/scene-intent-compiler.ts';
import { sceneMapInputs, sceneMapLocations } from '../../modules/xiaobai-os/tests/fixtures/scene-maps.js';
import { sceneObjectInputs, sceneObjectLocations } from '../../modules/xiaobai-os/tests/fixtures/scene-map-objects.js';
import { mapAtlasFixture } from '../../modules/xiaobai-os/tests/fixtures/map-atlas.js';
import { mapBrowseFixture } from '../../modules/xiaobai-os/tests/fixtures/map-browse.js';
const fixtures = Object.fromEntries([...sceneMapInputs, ...sceneObjectInputs].map(input => {
    const compiled = compileSceneIntent(mapAtlasFixture([[...sceneMapLocations, ...sceneObjectLocations].find(place => place.key === input.scene)]), input, { actorKey: 'player', displayName: '小白' });
    if (compiled.result.skipped.length) throw new Error(JSON.stringify(compiled.result));
    validateMapDomain(compiled.domain);
    return [input.scene, compiled.domain];
}));
fixtures.world = structuredClone(fixtures.cabin);
fixtures.world.atlas.actors = [];
for (const scene of Object.values(fixtures.world.scenes)) scene.elements = scene.elements.filter(e => !e.actorKey);
fixtures.empty = createEmptyMapDomain();
fixtures.regions = mapBrowseFixture();
validateMapDomain(fixtures.regions);
await build({ configFile: false, root: path.resolve('output/map-production-check'), base: './',
    plugins: [vue(), { name: 'fixture', resolveId(id) {if (id === 'check:fixtures') return '\0fixture';}, load(id) {if (id === '\0fixture') return 'export default ' + JSON.stringify(fixtures);} }],
    build: { outDir: 'dist', emptyOutDir: true, rollupOptions: { output: { entryFileNames: '[name]-[hash].js', chunkFileNames: '[name]-[hash].js', assetFileNames: '[name]-[hash][extname]' } } },
});
