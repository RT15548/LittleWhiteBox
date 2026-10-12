import { createApp, h, shallowReactive } from 'vue';
import MapProjection from './MapProjection.vue';
import type { MapDomainV1 } from '../../../domains/map/types.js';
import type { MapProjectionSurface } from './projection-surface.js';
import { MAP_NAV_COPY, MAP_PROJECTION_COPY } from './map-copy.js';
import loadingCss from './projection-loading.css?inline';
import './projection.css';

/** No iframe navigation: one isolated Vue tree follows the last completed floor. */
export function mountMapProjection(container: HTMLElement): MapProjectionSurface {
    container.replaceChildren();
    const shadow = container.attachShadow({ mode: 'open' });
    const guard = document.createElement('style');
    guard.textContent = loadingCss;
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = new URL(/* @vite-ignore */ 'xiaobai-os-app.css', import.meta.url).href;
    const root = document.createElement('div');
    root.className = 'map-projection-root';
    const loading = document.createElement('div');
    loading.className = 'map-projection-loading';
    loading.setAttribute('role', 'status');
    loading.textContent = MAP_NAV_COPY.loading;
    // A retained <link> loses its sheet while reconnecting. The inline guard is
    // active immediately; the full sheet overrides it only when applied again.
    shadow.append(guard, style, loading, root);
    const state = shallowReactive({ map: null as MapDomainV1 | null, chatIdentity: '', message: '' });
    let mapSignature = '';
    const app = createApp({ render: () => h(MapProjection, state) });
    let mounted = true;
    const unmount = () => { if (mounted) { mounted = false; app.unmount(); } };
    const styleError = () => {
        unmount(); root.remove(); style.remove();
        loading.setAttribute('role', 'alert'); loading.textContent = MAP_PROJECTION_COPY.loadFailed;
    };
    // Keep the former iframe's input boundary. In particular, ST's document-level
    // touch recognizer must not turn map navigation into a reply swipe.
    const inputEvents = ['keydown', 'keyup', 'keypress', 'pointerdown', 'pointermove', 'pointerup',
        'mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend', 'click', 'dblclick', 'wheel', 'contextmenu'];
    const stopInput = (event: Event) => event.stopPropagation();
    for (const name of inputEvents) { root.addEventListener(name, stopInput); }
    style.addEventListener('error', styleError);
    app.mount(root);
    return {
        update(next, theme) {
            root.classList.toggle('theme-dark', theme === 'dark');
            const signature = JSON.stringify(next.map);
            // Host snapshots clone the map even for status-only updates. Keep its
            // reference stable so neither atlas layout nor scene rendering restarts.
            if (signature !== mapSignature) { state.map = next.map; mapSignature = signature; }
            state.chatIdentity = next.chatIdentity;
            state.message = next.message;
        },
        dispose() {
            style.removeEventListener('error', styleError);
            for (const name of inputEvents) { root.removeEventListener(name, stopInput); }
            unmount(); shadow.replaceChildren();
        },
    };
}
