import { createApp, h, shallowRef } from 'vue';
import MapScene from '../../modules/xiaobai-os/apps/map/ui/MapScene.vue';
import '../../modules/xiaobai-os/apps/map/ui/map.css';

// Production scene and viewport gestures; no app/storage/agent services are mounted.
export function mountPlan(element, initialScene) {
    const scene = shallowRef(initialScene);
    const app = createApp({ setup: () => () => h(MapScene, { scene: scene.value }) });
    app.mount(element);
    return { setScene: value => { scene.value = value; }, dispose: () => app.unmount() };
}
