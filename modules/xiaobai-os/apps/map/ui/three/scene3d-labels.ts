import type { Camera, Vector3 } from 'three';
import type { MapScene } from '../../../../domains/map/types.js';
import { elementPresentation, MAP_CATEGORY_LABELS } from '../map-presentation.js';
import { isSceneMarker } from '../scene-geometry.js';
import { layoutSceneLabels, type ProjectedLabel } from './scene3d-label-layout.js';

export function createSceneLabels(container: HTMLElement, scene: MapScene, anchors: ReadonlyMap<string, Vector3>) {
    const items = scene.elements.filter(e => e.label || isSceneMarker(e)).map(element => {
        const hasGlyph = isSceneMarker(element) && element.shape !== 'label';
        const player = element.actorKey === 'player';
        const priority = player ? 0 : element.category === 'door' ? 1 : element.category === 'actor' ? 2 : hasGlyph ? 3 : 4;
        const name = element.label || MAP_CATEGORY_LABELS[element.category];
        const node = document.createElement('span');
        node.className = `map-3d-label is-${element.category}${player ? ' is-player' : ''}`;
        node.dataset.element = element.id;
        node.style.zIndex = String(10 - priority);
        if (hasGlyph) {node.setAttribute('role', 'img'); node.setAttribute('aria-label', name);}
        const recipe = elementPresentation(element, '');
        node.style.opacity = String(recipe.opacity);
        const glyph = document.createElement('span');
        glyph.className = 'map-3d-glyph';
        glyph.setAttribute('aria-hidden', 'true');
        const dot = document.createElement('span');
        dot.className = 'map-3d-anchor';
        dot.setAttribute('aria-hidden', 'true');
        const leader = document.createElement('span');
        leader.className = 'map-3d-leader';
        leader.setAttribute('aria-hidden', 'true');
        if (hasGlyph) {node.append(leader, dot, glyph);}
        const caption = document.createElement('span');
        caption.textContent = name;
        caption.className = 'map-3d-label-text';
        if (hasGlyph) {caption.setAttribute('aria-hidden', 'true');}
        node.append(caption);
        container.append(node);
        return { element, node, glyph, dot, leader, caption, recipe, hasGlyph, priority, anchor: anchors.get(element.id)! };
    });
    return {
        symbols(ready: boolean) {
            for (const item of items) {
                item.glyph.textContent = ready ? item.recipe.icon : item.recipe.fallback;
                item.glyph.classList.toggle('has-symbols', ready);
            }
        },
        update(camera: Camera, width: number, height: number, show: boolean) {
            const projected: ProjectedLabel[] = [];
            for (const { element, node, caption, glyph, anchor, hasGlyph, priority } of items) {
                node.style.visibility = 'hidden';
                caption.hidden = !show;
                const point = anchor.clone().project(camera);
                const x = (point.x + 1) * width / 2, y = (1 - point.y) * height / 2;
                if (point.z < -1 || point.z > 1 || x < 0 || x > width || y < 0 || y > height) {continue;}
                projected.push({
                    id: element.id, anchor: { x, y }, priority,
                    badge: hasGlyph ? { w: glyph.offsetWidth, h: glyph.offsetHeight } : undefined,
                    caption: show ? { w: caption.offsetWidth, h: caption.offsetHeight } : undefined,
                });
            }
            const controls = container.parentElement?.querySelector('.map-viewport-controls')?.getBoundingClientRect();
            const bounds = container.getBoundingClientRect();
            const reserved = controls ? [{ x: controls.x - bounds.x, y: controls.y - bounds.y, w: controls.width, h: controls.height }] : [];
            const layout = layoutSceneLabels(projected, width, height, reserved);
            for (const { element, node, caption, dot, leader } of items) {
                const result = layout.get(element.id);
                const rect = result?.badge || result?.caption;
                caption.style.visibility = result?.caption ? 'inherit' : 'hidden';
                if (!result || !rect) {continue;}
                node.style.visibility = 'visible';
                node.style.transform = `translate(${rect.x}px, ${rect.y}px)`;
                node.style.width = `${rect.w}px`; node.style.height = `${rect.h}px`;
                if (result.caption) {
                    caption.style.left = `${result.caption.x - rect.x}px`;
                    caption.style.top = `${result.caption.y - rect.y}px`;
                }
                if (result.badge) {
                    const x = result.anchor.x - rect.x, y = result.anchor.y - rect.y;
                    dot.style.transform = `translate(${x}px, ${y}px)`;
                    const endX = Math.max(0, Math.min(rect.w, x)), endY = Math.max(0, Math.min(rect.h, y));
                    leader.style.width = `${Math.hypot(endX - x, endY - y)}px`;
                    leader.style.transform = `translate(${x}px, ${y}px) rotate(${Math.atan2(endY - y, endX - x)}rad)`;
                }
            }
        },
        dispose() {for (const { node } of items) {node.remove();}},
    };
}
