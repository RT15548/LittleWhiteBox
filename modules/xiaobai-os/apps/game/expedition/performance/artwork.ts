import { SPRITES as s, ACTOR_STAGE } from './sprites.js';
import type { ActorExpression, Performance, Performer } from './catalog.js';

type Sprite = { src: string; x: number; y: number; width: number; height: number };
interface ActorArtwork {
    body: Sprite; arm: Sprite; heads: Partial<Record<Performance['expression'], Sprite>> & { neutral: Sprite };
    headOrigin: string; armOrigin: string; armDirection: 1 | -1;
}
type ArtworkCatalog = { [P in Performer]: Omit<ActorArtwork, 'heads'> & { heads: Record<ActorExpression<P>, Sprite> } };
export const ACTOR_ART: Record<Performer, ActorArtwork> = {
    sanniang: { body: s['sanniang-body'], arm: s['sanniang-arm'], heads: { neutral: s['sanniang-neutral'], smile: s['sanniang-smile'], teasing: s['sanniang-teasing'], blush: s['sanniang-blush'], rest: s['sanniang-relaxed'], serious: s['sanniang-serious'], worried: s['sanniang-worried'], sad: s['sanniang-sad'], displeased: s['sanniang-displeased'], fond: s['sanniang-fond'], laugh: s['sanniang-laugh'], surprised: s['sanniang-surprised'] }, headOrigin: '58% 34%', armOrigin: '34.6% 67%', armDirection: 1 },
    anian: { body: s['anian-body'], arm: s['anian-arm'], heads: { neutral: s['anian-neutral'], smile: s['anian-smile'], blush: s['anian-blush'], displeased: s['anian-displeased'], fond: s['anian-fond'], laugh: s['anian-laugh'], rest: s['anian-rest'], sad: s['anian-sad'], surprised: s['anian-surprised'], worried: s['anian-worried'] }, headOrigin: '58.140% 35.108%', armOrigin: '40.814% 67.258%', armDirection: 1 },
    kouzi: { body: s['kouzi-body'], arm: s['kouzi-arm'], heads: { neutral: s['kouzi-neutral'], blush: s['kouzi-blush'], displeased: s['kouzi-displeased'], fond: s['kouzi-fond'], laugh: s['kouzi-laugh'], sad: s['kouzi-sad'], serious: s['kouzi-serious'], smile: s['kouzi-smile'], surprised: s['kouzi-surprised'], teasing: s['kouzi-teasing'], worried: s['kouzi-worried'] }, headOrigin: '44.500% 34.677%', armOrigin: '74.625% 64.687%', armDirection: -1 },
    laobai: { body: s['laobai-body'], arm: s['laobai-arm'], heads: { neutral: s['laobai-neutral'], smile: s['laobai-smile'], teasing: s['laobai-teasing'], laugh: s['laobai-laugh'], blush: s['laobai-blush'], fond: s['laobai-fond'], serious: s['laobai-serious'], surprised: s['laobai-surprised'], worried: s['laobai-worried'], sad: s['laobai-sad'] }, headOrigin: '57.065% 33.026%', armOrigin: '25.543% 70.203%', armDirection: 1 },
    bajin: { body: s['bajin-body'], arm: s['bajin-arm'], heads: { neutral: s['bajin-neutral'], angry: s['bajin-angry'], relieved: s['bajin-relieved'], resigned: s['bajin-resigned'], suspicious: s['bajin-suspicious'], worried: s['bajin-worried'] }, headOrigin: '55.618% 32.031%', armOrigin: '89.888% 63.203%', armDirection: -1 },
    changyounian: { body: s['changyounian-body'], arm: s['changyounian-arm'], heads: { neutral: s['changyounian-neutral'], displeased: s['changyounian-displeased'], relieved: s['changyounian-relieved'], smile: s['changyounian-smile'], squint: s['changyounian-squint'], worried: s['changyounian-worried'] }, headOrigin: '56.559% 32.847%', armOrigin: '30.000% 70.620%', armDirection: 1 },
} satisfies ArtworkCatalog;

/** Cropping preserves stage placement and the existing gesture pivots. */
export function spriteStyle(sprite: Sprite, origin = '0% 0%') {
    const [ox, oy] = origin.split(' ').map(parseFloat);
    return {
        left: `${sprite.x / ACTOR_STAGE.width * 100}%`, top: `${sprite.y / ACTOR_STAGE.height * 100}%`,
        width: `${sprite.width / ACTOR_STAGE.width * 100}%`, height: `${sprite.height / ACTOR_STAGE.height * 100}%`,
        transformOrigin: `${(ox / 100 * ACTOR_STAGE.width - sprite.x) / sprite.width * 100}% ${(oy / 100 * ACTOR_STAGE.height - sprite.y) / sprite.height * 100}%`,
    };
}
