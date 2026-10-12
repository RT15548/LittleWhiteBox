import type { MascotOutfit } from '../../../brand/mascot/outfit.js';

const C = { helmet: '#efbd50', highlight: '#ffe19a', denim: '#467c8d', seam: '#a7d0ce', leather: '#98653f', metal: '#d8e7e6' };

export const BUILDER_OUTFIT: MascotOutfit = [
    // A low, broad hard hat leaves both ears and the original face visible.
    { shape: 'ball', size: [.345, .12, .285], at: [0, .405, -.015], color: C.helmet },
    { shape: 'ball', size: [.375, .024, .31], at: [0, .365, .015], color: C.helmet },
    { shape: 'box', size: [.045, .025, .40], at: [0, .516, -.015], color: C.highlight },
    { shape: 'box', size: [.082, .055, .02], at: [0, .407, .278], color: C.highlight },
    // Rounded overalls, stitched bib and brass strap fasteners.
    { shape: 'ball', size: [.285, .165, .255], at: [0, -.14, 0], color: C.denim },
    { shape: 'box', size: [.26, .21, .05], at: [0, -.055, .252], color: C.denim },
    ...[-1, 1].map(side => ({ shape: 'box' as const, size: [.046, .19, .042] as const,
        at: [side * .17, -.007, .239] as const, color: C.denim, tilt: side * -.22 })),
    ...[-1, 1].map(side => ({ shape: 'ball' as const, size: [.023, .023, .012] as const,
        at: [side * .15, .035, .272] as const, color: C.helmet })),
    { shape: 'box', size: [.12, .073, .02], at: [0, -.055, .283], color: C.seam },
    { shape: 'ball', size: [.299, .035, .266], at: [0, -.155, 0], color: C.leather },
    { shape: 'box', size: [.065, .056, .02], at: [0, -.155, .274], color: C.helmet },
    // Tape measure and hammer stay on the belt, leaving hands free for home activities.
    { shape: 'box', size: [.125, .12, .115], at: [-.277, -.17, .12], color: C.leather },
    { shape: 'box', size: [.083, .075, .025], at: [-.277, -.155, .188], color: C.helmet },
    { shape: 'box', size: [.039, .19, .047], at: [.29, -.21, .13], color: C.leather, tilt: -.18 },
    { shape: 'box', size: [.15, .064, .079], at: [.31, -.11, .13], color: C.metal, tilt: -.18 },
];
