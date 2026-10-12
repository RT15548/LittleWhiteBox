import { MASCOT_COLORS, MASCOT_PARTS } from './design.js';
import type { MascotOutfit } from './outfit.js';

export function renderMascotSvg(view: 'portrait' | 'mark', outfit: MascotOutfit = []): string {
    const viewBox = view === 'mark' ? '132 56 248 305' : outfit.length ? '90 48 332 420' : '110 48 292 420';
    const ellipses = MASCOT_PARTS.map(part => {
        const x = 256 + part.center[0] * 360;
        const y = 300 - part.center[1] * 360;
        return `  <ellipse cx="${x}" cy="${y}" rx="${part.radius[0] * 360}" ry="${part.radius[1] * 360}" fill="${MASCOT_COLORS[part.color]}"/>`;
    });
    const clothing = outfit.map(part => {
        const x = 256 + part.at[0] * 360, y = 300 - part.at[1] * 360;
        const transform = part.tilt ? ` transform="rotate(${-part.tilt * 180 / Math.PI} ${x} ${y})"` : '';
        if (part.shape === 'ball') { return `  <ellipse cx="${x}" cy="${y}" rx="${part.size[0] * 360}" ry="${part.size[1] * 360}" fill="${part.color}"${transform}/>`; }
        const w = part.size[0] * 360, h = part.size[1] * 360;
        return `  <rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${Math.min(w, h) * .18}" fill="${part.color}"${transform}/>`;
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-labelledby="title">
  <title id="title">小白</title>
${[...ellipses, ...clothing].join('\n')}
</svg>
`;
}

export function mascotOutfitPortrait(outfit: MascotOutfit): string {
    return `data:image/svg+xml,${encodeURIComponent(renderMascotSvg('portrait', outfit))}`;
}
