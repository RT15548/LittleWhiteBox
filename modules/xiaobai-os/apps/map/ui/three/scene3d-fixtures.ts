import type { BufferGeometry } from 'three';
import type { MapElement, MapMaterial } from '../../../../domains/map/types.js';

export type FixtureKind = 'column' | 'partition' | 'ladder' | 'well' | 'fountain' | 'fire' | 'flag' | 'sign' | 'terminal' | 'machine' | 'vending-machine';
export type TemplatePart = (x: number, y: number, z: number, sx: number, sy: number, sz: number, tint?: number, geometry?: BufferGeometry, material?: MapMaterial) => void;

/** Normalized static fixtures. Screens/signs carry no invented text or operating state. */
export function buildFixture(kind: FixtureKind, element: MapElement, part: TemplatePart,
    shapes: { cylinder: BufferGeometry; ring: BufferGeometry; cone: BufferGeometry }): number {
    const { cylinder, ring, cone } = shapes;
    switch (kind) {
    case 'column': {
        const shape = element.shape === 'circle' ? cylinder : undefined;
        part(0, .08, 0, 1, .16, 1, -.12, shape);
        part(0, .91, 0, .68, 1.5, .68, .02, shape);
        part(0, 1.7, 0, .9, .12, .9, .12, shape);
        return 1.76;
    }
    case 'partition':
        for (const x of [-.4, .4]) {
            part(x, .055, 0, .15, .11, 1, -.18);
            part(x, .79, 0, .07, 1.5, .15, -.15);
        }
        part(0, .83, 0, .78, 1.27, .09, .08);
        part(0, 1.5, 0, .88, .06, .15, .14);
        return 1.54;
    case 'ladder':
        for (const x of [-.36, .36]) {part(x, .9, 0, .09, 1.8, .20, -.1);}
        for (let i = 0; i < 6; i++) {part(0, .18 + i * .29, 0, .7, .055, .16, .13);}
        return 1.8;
    case 'well':
        part(0, .21, 0, .94, .42, .94, -.08, ring, element.material || 'stone');
        part(0, .44, 0, 1, .08, 1, .12, ring, element.material || 'stone');
        return .48;
    case 'fountain':
        part(0, .03, 0, .92, .06, .92, -.20, cylinder, element.material || 'stone');
        part(0, .13, 0, 1, .20, 1, .1, ring, element.material || 'stone');
        part(0, .38, 0, .18, .7, .18, -.06, cylinder, element.material || 'stone');
        part(0, .72, 0, .48, .1, .48, .12, ring, element.material || 'stone');
        part(0, .85, 0, .08, .17, .08, -.12, cylinder, element.material || 'stone');
        return .935;
    case 'fire':
        part(0, .055, 0, .85, .11, .17, -.28, undefined, 'wood');
        part(0, .11, 0, .17, .11, .85, -.15, undefined, 'wood');
        part(0, .43, 0, .6, .62, .6, 0, cone, 'warm-light');
        part(.1, .31, .12, .32, .4, .32, .35, cone, 'warm-light');
        return .74;
    case 'flag':
        part(-.37, .035, 0, .25, .07, .7, -.22);
        part(-.37, .8, 0, .045, 1.6, .08, -.15);
        part(.04, 1.28, 0, .77, .46, .035, .1, undefined, element.material || 'fabric');
        return 1.6;
    case 'sign':
        for (const x of [-.3, .3]) {
            part(x, .055, 0, .18, .11, .85, -.22);
            part(x, .62, 0, .07, 1.2, .16, -.12);
        }
        part(0, .9, 0, 1, .64, .18, -.05);
        part(0, .9, .095, .9, .52, .025, .22);
        return 1.22;
    case 'terminal':
        part(0, .065, 0, .72, .13, .84, -.25);
        part(0, .54, -.09, .4, 1, .44, -.1);
        part(0, 1.1, -.12, 1, .7, .3, -.16);
        part(0, 1.11, .04, .86, .54, .025, -.6);
        part(0, .77, .21, .88, .06, .55, .12);
        return 1.45;
    case 'machine':
        part(0, .055, 0, 1, .11, 1, -.25);
        part(-.16, .39, 0, .62, .64, .82, 0);
        part(-.16, .79, 0, .54, .22, .72, .15);
        part(.34, .46, 0, .26, .76, .73, -.14);
        for (const x of [-.34, -.2, -.06, .08]) {part(x, .5, .421, .04, .30, .014, -.5);}
        return .90;
    case 'vending-machine':
        part(0, .10, 0, .94, .2, .86, -.25);
        part(0, .92, 0, 1, 1.68, .92, -.02);
        part(-.12, 1.11, .468, .64, 1.05, .018, -.5);
        part(.34, 1.05, .48, .17, .38, .03, -.18);
        part(0, .31, .468, .74, .18, .018, -.65);
        part(0, 1.73, 0, 1, .07, .98, .16);
        return 1.765;
    }
}
