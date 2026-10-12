import type { MascotOutfit } from '../../../brand/mascot/outfit.js';

const C = { cap: '#377f83', seam: '#9ed3cf', vest: '#e79258', stripe: '#fff0c6', pocket: '#ba6744', glove: '#f1eadb' };

export const MOVER_OUTFIT: MascotOutfit = [
    // Soft cap with a forward peak, distinct from the builder's hard hat.
    { shape: 'ball', size: [.32, .108, .275], at: [0, .405, -.025], color: C.cap },
    { shape: 'ball', size: [.29, .025, .20], at: [0, .36, .205], color: C.cap },
    { shape: 'box', size: [.06, .025, .28], at: [0, .508, -.025], color: C.seam },
    { shape: 'box', size: [.082, .055, .022], at: [0, .414, .256], color: C.stripe },
    // Open-front work vest; the white chest remains visible between the panels.
    ...[-1, 1].map(side => ({ shape: 'ball' as const, size: [.13, .17, .073] as const,
        at: [side * .16, -.075, .206] as const, color: C.vest })),
    ...[-1, 1].map(side => ({ shape: 'box' as const, size: [.11, .025, .026] as const,
        at: [side * .16, -.065, .277] as const, color: C.stripe })),
    ...[-1, 1].map(side => ({ shape: 'box' as const, size: [.075, .06, .022] as const,
        at: [side * .16, -.174, .263] as const, color: C.pocket })),
    // Mittens sit at the sides of the existing parcel, never replacing it.
    ...[-1, 1].map(side => ({ shape: 'ball' as const, size: [.068, .085, .074] as const,
        at: [side * .288, -.015, .295] as const, color: C.glove })),
    ...[-1, 1].map(side => ({ shape: 'ball' as const, size: [.06, .035, .065] as const,
        at: [side * .292, -.078, .272] as const, color: C.cap })),
];
