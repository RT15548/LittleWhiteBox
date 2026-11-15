import { DRAW_LAYERS, ensureDrawVisuals } from './draw-visuals.js';
import { observeViewport } from '../../../shared/common/viewport.js';

const COLORS = { success: 'var(--draw-success)', error: 'var(--draw-danger)',
    warning: 'var(--draw-warning)', info: 'var(--draw-accent)' };
let layer;

function createLayer() {
    const container = document.createElement('div');
    container.id = 'xb-draw-toasts';
    container.style.cssText = `position:fixed;z-index:${DRAW_LAYERS.toast};display:flex;flex-direction:column;gap:8px;width:max-content;pointer-events:none`;
    document.body.append(container);
    const win = document.defaultView;
    const place = () => {
        const viewport = win.visualViewport;
        const width = viewport?.width ?? win.innerWidth;
        container.style.maxWidth = `${Math.max(0, width - 32)}px`;
        container.style.top = container.style.left = '0px';
        // SillyTavern transforms <html>, so fixed children follow its scroll.
        // Measure the containing origin rather than assuming viewport (0, 0).
        const rect = container.getBoundingClientRect();
        container.style.top = `${(viewport?.offsetTop ?? 0) + 20 - rect.top}px`;
        container.style.left = `${(viewport?.offsetLeft ?? 0) + (width - rect.width) / 2 - rect.left}px`;
    };
    const stopViewport = observeViewport(place, win);
    win.addEventListener('scroll', place);
    return { container, place, destroy() {
        stopViewport();
        win.removeEventListener('scroll', place);
        container.remove();
    } };
}

// Drawing owns its feedback layer. Host/other extensions' toastr settings and
// containers stay untouched. Nodes and timers live only until the notice closes.
function notify(type, message, title, { timeOut = 5000 } = {}) {
    ensureDrawVisuals();
    const current = layer ??= createLayer();
    const toast = document.createElement('div');
    toast.className = 'xb-draw-toast';
    toast.dataset.type = type;
    toast.setAttribute('role', type === 'error' || type === 'warning' ? 'alert' : 'status');
    toast.style.cssText = `box-sizing:border-box;padding:12px 16px;border:1px solid var(--draw-border);border-left:4px solid ${COLORS[type]};border-radius:8px;background:var(--draw-bg-secondary);color:var(--draw-text-primary);box-shadow:0 4px 16px rgba(0,0,0,.2);font:14px/1.5 system-ui,sans-serif;overflow-wrap:anywhere;white-space:pre-wrap;text-shadow:none`;
    if (title) {
        const heading = document.createElement('strong');
        heading.textContent = title;
        heading.style.cssText = 'display:block;text-shadow:none';
        toast.append(heading);
    }
    const text = document.createElement('div');
    text.textContent = message;
    text.style.textShadow = 'none';
    toast.append(text);
    current.container.append(toast);
    current.place();
    setTimeout(() => {
        toast.remove();
        if (!current.container.childElementCount) { current.destroy(); layer = null; }
        else current.place();
    }, timeOut);
}

export const drawNotify = Object.freeze(Object.fromEntries(Object.keys(COLORS).map(type => [
    type, (message, title, options) => notify(type, message, title, options),
])));
