import path from 'node:path';
import assert from 'node:assert/strict';
import { build } from 'vite';
import vue from '@vitejs/plugin-vue';

// Compile the real two-dimensional scene and all of its dependencies with Three forbidden.
// This proves a rendering boundary, not the presence of particular source strings.
const result = await build({ configFile: false, plugins: [vue(), {
    name: 'forbid-three-in-2d', enforce: 'pre',
    resolveId(id) {
        if (id === 'three' || id.startsWith('three/') || id.replaceAll('\\', '/').includes('/ui/three/')) {
            throw new Error(`Two-dimensional Map scene depends on Three: ${id}`);
        }
    },
}], build: { write: false, lib: { entry: path.resolve('modules/xiaobai-os/apps/map/ui/MapScene.vue'), formats: ['es'] } } });
assert.ok(result[0].output.some(item => item.type === 'chunk' && item.isEntry));
console.log('Real MapScene/MapViewport two-dimensional build passed without Three.');
