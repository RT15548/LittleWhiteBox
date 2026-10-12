// The portrait, the compact mark and the 3D performer share these same shapes.
// Props such as Moving's parcel are deliberately not part of Xiaobai's identity.
export const MASCOT_COLORS = {
    fur: '#fffaf2',
    feet: '#667486',
    eyes: '#354353',
    cheeks: '#f0afb0',
} as const;

export const MASCOT_PARTS = [
    { name: 'left-ear', center: [-.2, .48, 0], radius: [.09, .17, .085], color: 'fur' },
    { name: 'right-ear', center: [.2, .48, 0], radius: [.09, .17, .085], color: 'fur' },
    { name: 'left-foot', center: [-.15, -.28, .06], radius: [.065, .07, .1], color: 'feet' },
    { name: 'right-foot', center: [.15, -.28, .06], radius: [.065, .07, .1], color: 'feet' },
    { name: 'body', center: [0, .1, 0], radius: [.32, .4, .27], color: 'fur' },
    { name: 'left-eye', center: [-.1, .22, .252], radius: [.028, .039, .02], color: 'eyes' },
    { name: 'right-eye', center: [.1, .22, .252], radius: [.028, .039, .02], color: 'eyes' },
    { name: 'left-cheek', center: [-.16, .12, .242], radius: [.052, .028, .025], color: 'cheeks' },
    { name: 'right-cheek', center: [.16, .12, .242], radius: [.052, .028, .025], color: 'cheeks' },
] as const;
