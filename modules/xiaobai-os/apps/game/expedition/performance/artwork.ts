import body from '../assets/performance/sanniang-body.webp?url&no-inline';
import arm from '../assets/performance/sanniang-arm.webp?url&no-inline';
import neutral from '../assets/performance/sanniang-neutral.webp?url&no-inline';
import smile from '../assets/performance/sanniang-smile.webp?url&no-inline';
import teasing from '../assets/performance/sanniang-teasing.webp?url&no-inline';
import blush from '../assets/performance/sanniang-blush.webp?url&no-inline';
import rest from '../assets/performance/sanniang-relaxed.webp?url&no-inline';
import serious from '../assets/performance/sanniang-serious.webp?url&no-inline';
import worried from '../assets/performance/sanniang-worried.webp?url&no-inline';
import sad from '../assets/performance/sanniang-sad.webp?url&no-inline';
import displeased from '../assets/performance/sanniang-displeased.webp?url&no-inline';
import fond from '../assets/performance/sanniang-fond.webp?url&no-inline';
import laugh from '../assets/performance/sanniang-laugh.webp?url&no-inline';
import surprised from '../assets/performance/sanniang-surprised.webp?url&no-inline';
import anianBody from '../assets/performance/anian-body.webp?url&no-inline';
import anianHead from '../assets/performance/anian-neutral.webp?url&no-inline';
import anianArm from '../assets/performance/anian-arm.webp?url&no-inline';
import anianBlush from '../assets/performance/anian-blush.webp?url&no-inline';
import anianDispleased from '../assets/performance/anian-displeased.webp?url&no-inline';
import anianFond from '../assets/performance/anian-fond.webp?url&no-inline';
import anianLaugh from '../assets/performance/anian-laugh.webp?url&no-inline';
import anianRest from '../assets/performance/anian-rest.webp?url&no-inline';
import anianSad from '../assets/performance/anian-sad.webp?url&no-inline';
import anianSurprised from '../assets/performance/anian-surprised.webp?url&no-inline';
import anianWorried from '../assets/performance/anian-worried.webp?url&no-inline';
import anianSmile from '../assets/performance/anian-smile.webp?url&no-inline';
import kouziBody from '../assets/performance/kouzi-body.webp?url&no-inline';
import kouziHead from '../assets/performance/kouzi-neutral.webp?url&no-inline';
import kouziArm from '../assets/performance/kouzi-arm.webp?url&no-inline';
import kouziDispleased from '../assets/performance/kouzi-displeased.webp?url&no-inline';
import kouziFond from '../assets/performance/kouzi-fond.webp?url&no-inline';
import kouziLaugh from '../assets/performance/kouzi-laugh.webp?url&no-inline';
import kouziSad from '../assets/performance/kouzi-sad.webp?url&no-inline';
import kouziSerious from '../assets/performance/kouzi-serious.webp?url&no-inline';
import kouziSmile from '../assets/performance/kouzi-smile.webp?url&no-inline';
import kouziSurprised from '../assets/performance/kouzi-surprised.webp?url&no-inline';
import kouziTeasing from '../assets/performance/kouzi-teasing.webp?url&no-inline';
import kouziWorried from '../assets/performance/kouzi-worried.webp?url&no-inline';
import kouziBlush from '../assets/performance/kouzi-blush.webp?url&no-inline';
import laobaiBody from '../assets/performance/laobai-body.webp?url&no-inline';
import laobaiArm from '../assets/performance/laobai-arm.webp?url&no-inline';
import laobaiNeutral from '../assets/performance/laobai-neutral.webp?url&no-inline';
import laobaiSmile from '../assets/performance/laobai-smile.webp?url&no-inline';
import laobaiTeasing from '../assets/performance/laobai-teasing.webp?url&no-inline';
import laobaiLaugh from '../assets/performance/laobai-laugh.webp?url&no-inline';
import laobaiBlush from '../assets/performance/laobai-blush.webp?url&no-inline';
import laobaiFond from '../assets/performance/laobai-fond.webp?url&no-inline';
import laobaiSerious from '../assets/performance/laobai-serious.webp?url&no-inline';
import laobaiSurprised from '../assets/performance/laobai-surprised.webp?url&no-inline';
import laobaiWorried from '../assets/performance/laobai-worried.webp?url&no-inline';
import laobaiSad from '../assets/performance/laobai-sad.webp?url&no-inline';
import bajinBody from '../assets/performance/bajin-body.webp?url&no-inline';
import bajinHead from '../assets/performance/bajin-neutral.webp?url&no-inline';
import bajinArm from '../assets/performance/bajin-arm.webp?url&no-inline';
import bajinAngry from '../assets/performance/bajin-angry.webp?url&no-inline';
import bajinRelieved from '../assets/performance/bajin-relieved.webp?url&no-inline';
import bajinResigned from '../assets/performance/bajin-resigned.webp?url&no-inline';
import bajinSuspicious from '../assets/performance/bajin-suspicious.webp?url&no-inline';
import bajinWorried from '../assets/performance/bajin-worried.webp?url&no-inline';
import changyounianBody from '../assets/performance/changyounian-body.webp?url&no-inline';
import changyounianHead from '../assets/performance/changyounian-neutral.webp?url&no-inline';
import changyounianArm from '../assets/performance/changyounian-arm.webp?url&no-inline';
import changyounianDispleased from '../assets/performance/changyounian-displeased.webp?url&no-inline';
import changyounianRelieved from '../assets/performance/changyounian-relieved.webp?url&no-inline';
import changyounianSmile from '../assets/performance/changyounian-smile.webp?url&no-inline';
import changyounianSquint from '../assets/performance/changyounian-squint.webp?url&no-inline';
import changyounianWorried from '../assets/performance/changyounian-worried.webp?url&no-inline';
import type { ActorExpression, Performance, Performer } from './catalog.js';

interface ActorArtwork {
    body: string; arm: string; heads: Partial<Record<Performance['expression'], string>> & { neutral: string };
    headOrigin: string; armOrigin: string; armDirection: 1 | -1;
}
type ArtworkCatalog = { [P in Performer]: Omit<ActorArtwork, 'heads'> & { heads: Record<ActorExpression<P>, string> } };
export const ACTOR_ART: Record<Performer, ActorArtwork> = {
    sanniang: { body, arm, heads: { neutral, smile, teasing, blush, rest, serious, worried, sad, displeased, fond, laugh, surprised }, headOrigin: '58% 34%', armOrigin: '34.6% 67%', armDirection: 1 },
    anian: { body: anianBody, arm: anianArm, heads: { neutral: anianHead, smile: anianSmile, blush: anianBlush, displeased: anianDispleased, fond: anianFond, laugh: anianLaugh, rest: anianRest, sad: anianSad, surprised: anianSurprised, worried: anianWorried }, headOrigin: '58.140% 35.108%', armOrigin: '40.814% 67.258%', armDirection: 1 },
    kouzi: { body: kouziBody, arm: kouziArm, heads: { neutral: kouziHead, blush: kouziBlush, displeased: kouziDispleased, fond: kouziFond, laugh: kouziLaugh, sad: kouziSad, serious: kouziSerious, smile: kouziSmile, surprised: kouziSurprised, teasing: kouziTeasing, worried: kouziWorried }, headOrigin: '44.500% 34.677%', armOrigin: '74.625% 64.687%', armDirection: -1 },
    laobai: { body: laobaiBody, arm: laobaiArm, heads: { neutral: laobaiNeutral, smile: laobaiSmile, teasing: laobaiTeasing, laugh: laobaiLaugh, blush: laobaiBlush, fond: laobaiFond, serious: laobaiSerious, surprised: laobaiSurprised, worried: laobaiWorried, sad: laobaiSad }, headOrigin: '57.065% 33.026%', armOrigin: '25.543% 70.203%', armDirection: 1 },
    bajin: { body: bajinBody, arm: bajinArm, heads: { neutral: bajinHead, angry: bajinAngry, relieved: bajinRelieved, resigned: bajinResigned, suspicious: bajinSuspicious, worried: bajinWorried }, headOrigin: '55.618% 32.031%', armOrigin: '89.888% 63.203%', armDirection: -1 },
    changyounian: { body: changyounianBody, arm: changyounianArm, heads: { neutral: changyounianHead, displeased: changyounianDispleased, relieved: changyounianRelieved, smile: changyounianSmile, squint: changyounianSquint, worried: changyounianWorried }, headOrigin: '56.559% 32.847%', armOrigin: '30.000% 70.620%', armDirection: 1 },
} satisfies ArtworkCatalog;
