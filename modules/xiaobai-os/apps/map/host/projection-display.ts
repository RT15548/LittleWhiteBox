import { storyMessageRole } from '../../../host/story-message.js';
import type { XiaobaiOsChatSurface } from '../../../host/sillytavern-context.js';
import type { MapClientState } from '../types.js';
import { MAP_NAV_COPY, MAP_PROJECTION_COPY } from '../ui/map-copy.js';
import type { MapProjectionSurface, MountMapProjection } from '../ui/projection-surface.js';

interface ProjectionDisplayOptions {
    enabled(): boolean;
    isGenerationActive(): boolean;
    isReplyPaused?(message: unknown): boolean;
    readState(): MapClientState;
    captureChat(): Pick<XiaobaiOsChatSurface, 'identityKey' | 'messages'> | null;
    readTheme(): 'light' | 'dark';
    subscribe(handlers: { stateChanged(): void; messagesChanged(): void; chatChanged(): void; activityChanged(): void }): () => void;
    loadSurface(): Promise<MountMapProjection>;
}

function isPendingSwipe(message: unknown): boolean {
    if (!message || typeof message !== 'object') { return false; }
    const candidate = message as { swipe_id?: unknown; swipes?: unknown };
    // ST 1.14/1.18 select the next, not-yet-existing candidate before Generate('swipe').
    return typeof candidate.swipe_id === 'number' && Array.isArray(candidate.swipes)
        && candidate.swipe_id === candidate.swipes.length;
}

/** A single read-only surface; it never activates the APP or accepts model/storage commands. */
export function createMapProjectionDisplay({ enabled, isGenerationActive, isReplyPaused = () => false, readState, captureChat, readTheme, subscribe,
    loadSurface }: ProjectionDisplayOptions) {
    let dispose: (() => void) | null = null;
    let themeObserver: MutationObserver | null = null;
    let swipeObserver: MutationObserver | null = null;
    let scheduled: number | null = null;
    let container: HTMLElement | null = null;
    let surface: MapProjectionSurface | null = null;
    let mountSurface: MountMapProjection | null = null;
    let identity = '';
    // A run-local display snapshot, invalidated only by domain/settings/status events.
    let state: MapClientState | null = null;
    let stateDirty = true;
    let stateSignature = '';
    let publishedState: MapClientState | null = null;
    let publishedTheme = '';

    function clear(): void {
        surface?.dispose(); surface = null;
        mountSurface = null;
        container?.remove(); container = null;
        identity = '';
        publishedState = null;
        publishedTheme = '';
    }
    // Detaching ordinary DOM preserves Vue/canvas state. Unlike an iframe, moving
    // this view between floors does not navigate or recreate a WebGL context.
    function suspend(): void { container?.remove(); }
    function resetState(): void {
        state = null;
        stateSignature = '';
        stateDirty = true;
    }
    function observeTheme(): void {
        if (!enabled()) { return; }
        for (const element of [document.body, document.documentElement]) {
            themeObserver?.observe(element, { attributes: true, attributeFilter: ['class', 'style', 'data-theme'] });
        }
    }
    function render(): void {
        scheduled = null;
        themeObserver?.disconnect();
        swipeObserver?.disconnect();
        try {
            if (!enabled()) { clear(); resetState(); return; }
            if (isGenerationActive()) { suspend(); return; }
            const source = captureChat();
            if (!source) { clear(); resetState(); return; }
            let index = source.messages.length - 1;
            while (index >= 0 && storyMessageRole(source.messages[index]) !== 'assistant') { index -= 1; }
            if (index < 0) { clear(); return; }
            const message = source.messages[index];
            const floor = document.querySelector<HTMLElement>(`#chat .mes[mesid="${index}"]`);
            if (isPendingSwipe(message)) {
                suspend();
                // Failed preflight has no completion event. Native rollback replaces
                // floors (1.18) or rewrites swipeid (1.14), without streaming-text observation.
                const chat = document.getElementById('chat');
                if (chat) { swipeObserver?.observe(chat, { childList: true }); }
                if (floor) { swipeObserver?.observe(floor, { attributes: true, attributeFilter: ['swipeid'] }); }
                return;
            }
            if (isReplyPaused(message)) { suspend(); return; }
            if (stateDirty) {
                const next = readState();
                const signature = JSON.stringify(next);
                if (signature !== stateSignature) { state = next; stateSignature = signature; }
                stateDirty = false;
            }
            if (!state?.projectToChat || source.identityKey !== state.chatIdentity
                || !state.map?.atlas.locations.length) { clear(); return; }
            const body = floor?.querySelector('.mes_text');
            if (!body) { suspend(); return; }
            if (identity !== source.identityKey || !container) {
                clear();
                identity = source.identityKey;
                container = document.createElement('div');
                container.className = 'xb-map-projection';
                container.contentEditable = 'false';
                container.setAttribute('role', 'region');
                container.setAttribute('aria-label', MAP_PROJECTION_COPY.label);
                container.textContent = MAP_NAV_COPY.loading;
                const target = container;
                void loadSurface().then(mount => {
                    if (container !== target) { return; }
                    mountSurface = mount;
                    schedule();
                }).catch(error => {
                    console.error(MAP_PROJECTION_COPY.loadFailed, error);
                    if (container === target) { target.setAttribute('role', 'alert'); target.textContent = MAP_PROJECTION_COPY.loadFailed; }
                });
            }
            if (container.parentElement !== body.parentElement
                || !(body.compareDocumentPosition(container) & Node.DOCUMENT_POSITION_FOLLOWING)) {
                body.after(container);
            }
            if (!surface && mountSurface) { surface = mountSurface(container); }
            const theme = readTheme();
            if (surface && (state !== publishedState || theme !== publishedTheme)) {
                surface.update(state, theme);
                publishedState = state;
                publishedTheme = theme;
            }
        } finally { observeTheme(); }
    }
    function schedule(): void {
        if (dispose && !isGenerationActive() && scheduled === null) { scheduled = requestAnimationFrame(render); }
    }
    function cancelScheduled(): void {
        if (scheduled !== null) { cancelAnimationFrame(scheduled); scheduled = null; }
    }
    function activityChanged(): void {
        // Remove the occupied space before streaming without destroying the view.
        if (!enabled()) { cancelScheduled(); clear(); resetState(); }
        else if (isGenerationActive()) { cancelScheduled(); suspend(); }
        else { schedule(); }
    }
    function stateChanged(): void {
        stateDirty = true;
        if (!enabled()) { cancelScheduled(); clear(); resetState(); }
        else { schedule(); }
    }
    function chatChanged(): void { swipeObserver?.disconnect(); clear(); resetState(); schedule(); }
    return {
        stateChanged,
        messagesChanged: schedule,
        chatChanged,
        start() {
            if (dispose) { return; }
            dispose = subscribe({ stateChanged, messagesChanged: schedule, chatChanged, activityChanged });
            themeObserver = new MutationObserver(schedule);
            swipeObserver = new MutationObserver(schedule);
            observeTheme(); schedule();
        },
        stop() {
            dispose?.(); dispose = null;
            themeObserver?.disconnect(); themeObserver = null;
            swipeObserver?.disconnect(); swipeObserver = null;
            cancelScheduled();
            clear(); resetState();
        },
    };
}
