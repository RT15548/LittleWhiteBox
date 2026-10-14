import type { Landscape, PersonId, Point } from './model.js';
import { COASTLINE } from './coastline.js';

// Replaceable authored cast; identity is independent of display names and occupation.
export const CAST: Record<PersonId, { name: string; age: number; occupation: string; profile: string }> = {
    player: { name: '你', age: 28, occupation: '', profile: '' },
    lin: { name: '林遥', age: 29, occupation: '编辑', profile: '平时说话轻，追问却很具体，常留意别人话里没有说完的部分。愿意帮忙，也很在意自己的空间；不舒服时往往先忍着，直到被人替她作主才明确拒绝。没有野外生活经验，愿意向能解释做法的人学，不喜欢被一句“你不懂”打发。牵挂独居的母亲，最怕自己慢慢习惯不再等救援。' },
    zhou: { name: '周岑', age: 35, occupation: '设备维护员', profile: '习惯先检查手边东西，再说自己能做什么；熟悉常见手工具和简单修理，没做过野外生火、捕鱼或辨认野食。话少而直，焦急时容易把建议说成命令。愿意教肯一起试的人，却很讨厌别人许诺、让他收尾。希望有个能踏实休息的地方，既不主动争领导，也不愿成为谁的免费劳力。' },
    xu: { name: '许宁', age: 31, occupation: '会计', profile: '平时有条理，分东西时会问数量和依据；并不追求每件事平均，更在意规则是否临时变卦。能承认自己不会，但很难开口欠人情。紧张时反复核对细节，显得挑剔；被具体的帮助打动后会认真回报。害怕失去选择，愿意共同生活，却会为自己保留退路。' },
    chen: { name: '陈屿', age: 26, occupation: '摄影助理', profile: '外景工作让他习惯背东西、布置器材和临时协作，并不使他懂热带植物或海况。说话快，喜欢用玩笑压住惊慌；有人认真听他的主意时，容易把把握说得比实际大。肯出力也想被看见，受挫后会先嘴硬再偷偷补救。好奇岛里有什么，但不愿被当成专门跑腿的小孩。' },
    ye: { name: '叶芮', age: 45, occupation: '餐馆经营者', profile: '熟悉备餐、清洁和协调忙乱的厨房，面对陌生野食仍拿不准。平时能一边做事一边安抚人，记得谁没吃、谁已经忙了很久。照顾人是她主动的选择，不是无穷的义务；别人把照顾当理所当然时，她会停止包办。牵挂家中的孩子，怕死，也怕为了活命变成自己无法面对的人。' },
    luo: { name: '罗越', age: 38, occupation: '销售', profile: '擅长与陌生人搭话和把分散的意见说到一起，平时重视体面，也在意自己的话还有没有分量。压力大时容易先给保证，再想怎么兑现；真被人指出问题，会难堪，也可能改口协商。愿意促成交换与合作，拿得出实际帮助的人比头衔更能说服他。希望有人需要自己，不愿承认此刻也很害怕。' },
};

// Authored metre-based level geometry, not a geographic claim.
// The renderer consumes these same boundaries; screens do not block walking.
export const LANDSCAPE: Landscape = {
    land: COASTLINE,
    obstacles: [],
    sightScreens: [
        [{ x: -670, y: -60 }, { x: -590, y: -80 }, { x: -570, y: 80 }, { x: -640, y: 110 }],
        [{ x: -300, y: -120 }, { x: -160, y: -160 }, { x: -100, y: 100 }, { x: -250, y: 140 }],
    ],
    soundScreens: [],
};
export const LANDING: Record<PersonId, Point> = {
    player: { x: -728, y: 0 }, lin: { x: -726, y: 1 }, zhou: { x: -728, y: -2 }, xu: { x: -730, y: 1 },
    chen: { x: -727, y: 3 }, ye: { x: -729, y: -3 }, luo: { x: -731, y: 0 },
};

// Game-scale parameters only. Physiology, terrain hazards and medical rates are not implied.
export const RULES = {
    walkMetresPerSecond: 1,
    hearingMetres: 8,
    sightMetres: 35,
    reachMetres: 1.5,
    takeSeconds: 2,
    maxAdvanceSeconds: 3600,
    maxRoutePoints: 64,
    maxSpeechCharacters: 8000,
} as const;

// Metres relative to the authored coast, not a measured Indian Ocean tide table.
export const TIDE = { periodSeconds: 12.42 * 3600, forageMax: .6, lowWater: -.08, highWater: .65 } as const;
