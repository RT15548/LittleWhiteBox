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
import { compileAtlasIntent } from '../../modules/xiaobai-os/apps/map/tools/atlas-intent-compiler.ts';
import { ATLAS_EXAMPLES } from '../../modules/xiaobai-os/apps/map/tools/atlas-examples.ts';
import { atlasGeographyInput } from './atlas-geography.mjs';
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
for (const example of ATLAS_EXAMPLES) {
    const compiled = compileAtlasIntent(createEmptyMapDomain(), example.input, { actorKey: 'player', displayName: '小白' });
    if (compiled.result.skipped.length) throw new Error(JSON.stringify(compiled.result));
    fixtures[`atlas-${example.id}`] = compiled.domain;
}
fixtures['atlas-empty-places'] = compileAtlasIntent(createEmptyMapDomain(), { features: [
    { id: 'sand', map: null, role: 'surface', material: 'sand', form: 'dunes', geometry: { shape: 'rect', x: 0, y: 0, width: 1000, height: 600 } },
] }, { actorKey: 'player', displayName: '小白' }).domain;
// Regional houses carried by a world-frame plain; the region has no boundary clip.
fixtures['atlas-carrier'] = compileAtlasIntent(createEmptyMapDomain(), {
    locations: [{ key: 'town', name: 'Town', scale: 'region' }],
    maps: [{ map: 'town', mapping: { map: null, scale: 2, offset: [100, 50] } }],
    features: [
        { id: 'plain', map: null, role: 'surface', material: 'grass', geometry: { shape: 'rect', x: 0, y: 0, width: 400, height: 300 } },
        { id: 'houses', map: 'town', role: 'structure', material: 'wood', form: 'compact', support: 'plain', geometry: { shape: 'rect', x: -70, y: 10, width: 40, height: 30 } },
    ],
}, { actorKey: 'player', displayName: '小白' }).domain;
validateMapDomain(fixtures['atlas-carrier']);
fixtures['atlas-lifecycle'] = compileSceneIntent(fixtures['atlas-nature'], { ...sceneMapInputs.find(input => input.scene === 'tavern'), scene: 'station' }, { actorKey: 'player', displayName: '小白' }).domain;
validateMapDomain(fixtures['atlas-lifecycle']);
validateMapDomain(fixtures.regions);
const geography = compileAtlasIntent(createEmptyMapDomain(), atlasGeographyInput, { actorKey: 'player', displayName: '小白' });
if (geography.result.skipped.length) throw new Error(JSON.stringify(geography.result));
fixtures['atlas-geography'] = geography.domain;
await build({ configFile: false, root: path.resolve('output/map-production-check'), base: './',
    plugins: [vue(), { name: 'fixture', resolveId(id) {if (id === 'check:fixtures') return '\0fixture';}, load(id) {if (id === '\0fixture') return 'export default ' + JSON.stringify(fixtures);} }],
    build: { outDir: 'dist', emptyOutDir: true, rollupOptions: { output: { entryFileNames: '[name]-[hash].js', chunkFileNames: '[name]-[hash].js', assetFileNames: '[name]-[hash][extname]' } } },
});
