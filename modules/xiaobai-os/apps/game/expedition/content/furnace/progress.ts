import type { Campaign } from '../../campaign/types.js';
import type { FurnaceFact } from './facts.js';
import { PERSON_NAMES } from '../people.js';
import type { CourtyardPerson, CourtyardScene } from '../world-types.js';

const MOMENTS: readonly { person: CourtyardPerson; title: string; available: FurnaceFact; shared: FurnaceFact; ended: FurnaceFact; task: string; home: string }[] = [
    { person: 'sanniang', title: '后间的灯', available: 'furnace_roster_seen', shared: 'sanniang_furnace_pause', ended: 'sanniang_afterglow', task: '若三娘同行，登炉前可以在值房的长凳旁歇歇脚。', home: '可以和三娘回诊棚后间坐坐。' },
    { person: 'anian', title: '山口往南', available: 'kilnheart_defeated', shared: 'anian_snow_view', ended: 'anian_afterglow', task: '旧驿西侧有避风台，可以带阿念去看看山谷。', home: '回阿念房里，还有山路上的事可以说。' },
    { person: 'kouzi', title: '上面还有地方', available: 'furnace_scaffold_cleared', shared: 'kouzi_furnace_crossing', ended: 'kouzi_afterglow', task: '检修架上段有片外台，可以和扣子并肩看看全城。', home: '管边小窝又响起水声，可以和扣子回去听听。' },
    { person: 'laobai', title: '给你留了凳子', available: 'division_works_started', shared: 'laobai_return_seat', ended: 'laobai_afterglow', task: '返城后，南街热水铺还有老白熟悉的位置。', home: '老白屋里留着茶和棋，可以去坐一会儿。' },
];
export function furnaceMoments(campaign: Campaign) {
    const f = new Set(campaign.facts);
    return MOMENTS.flatMap(item => {
        if (!f.has(item.available) || f.has(item.ended)) { return []; }
        const task = f.has(item.shared) ? f.has('long_night_ended') ? item.home : null
            : item.person === 'sanniang' && f.has('furnace_master_defeated') ? null : item.task;
        return task ? [{ person: item.person, name: PERSON_NAMES[item.person], title: item.title, task }] : [];
    });
}

const STEPS: readonly { until: FurnaceFact; task: string; here?: Partial<Record<CourtyardScene, string>> }[] = [
    { until: 'furnace_invited', task: '檐下炉边有人送来请帖，回去看看。', here: { camp: '炉边有人送来请帖，过去看看。' } },
    { until: 'furnace_offer_heard', task: '从分暖站的石阶登上炉城高台，赴掌炉官的席。', here: { furnace_terrace: '到高台北面的席前，听听裴肃的条件。' } },
    { until: 'division_plan_known', task: '回分暖站检修桌，和程铁生看看另一种烧法。', here: { heat_station: '去检修桌旁，和程铁生看看另一种烧法。' } },
    { until: 'snow_road_cleared', task: '从炉城高台西侧出城，沿雪线驿路去旧驿。', here: { snow_road: '沿雪道向北，清开旧管旁盘踞的荆棘衍生物。' } },
    { until: 'kilnheart_defeated', task: '清除旧驿炉房的荆棘晶结，让试验台能重新使用。' },
    { until: 'division_tested', task: '到旧驿炉后试验台，点起小炉，接入负载管。' },
    { until: 'furnace_cargo_loaded', task: '把炉件装上旧驿东侧运料台，启用返城索道。' },
    { until: 'furnace_convoy_secured', task: '突破雪谷桥头的拦截，把炉件带回南街。' },
    { until: 'division_works_started', task: '到南街卸料口交付炉件与实测记录。' },
    { until: 'furnace_roster_seen', task: '由炉城高台东路进入炉下旧城；南街与工坊也有人需要搭把手。', here: { furnace_quarter: '在街口名册旁看看这些住处，辨清登炉的两条路。' } },
    { until: 'furnace_approach_ready', task: '通过运输平台或炉外检修架，抵达炉前值房。两条路都能登炉。', here: { furnace_antechamber: '到值房中央听听炉内的动静，整备后再出发。' } },
    { until: 'furnace_master_defeated', task: '在值房整备后进入炉心，阻止裴肃将晶材投入强烧。', here: { furnace_heart: '沿进料轨道向前，夺下裴肃的承火架。' } },
    { until: 'furnace_stilled', task: '到炉心北侧控制台，关闭强烧并接通周转回路。' },
    { until: 'city_rekindled', task: '返回炉下旧城，在交接桌前见证各坊接管炉组。', here: { furnace_quarter: '去北侧交接桌，见证各坊接管炉组。' } },
    { until: 'long_night_ended', task: '回檐下炉边看看。这一次，街坊有了自己的火。', here: { camp: '到炉边看看。这一次，街坊有了自己的火。' } },
];
export function furnaceProgress(campaign: Campaign) {
    const step = STEPS.find(item => !campaign.facts.includes(item.until));
    return step?.here?.[campaign.location.scene] ?? step?.task ?? '长夜已尽。路仍通着，可以去见想见的人，也可以再去城外走走。';
}
export const FURNACE_BATTLE_COPY = {
    snow_road: '清开旧管旁的荆棘衍生物，留意两侧袭来的冷光。',
    old_kiln: '晶结护住了试验台。看清环形缺口，等根刺收回后反击。',
    return_bridge: '突破桥头拦截。炉件已经捆牢，先处理掩护盾排的远程。',
    furnace_lift: '打通运输平台，别让盾排把你逼到货箱之间。',
    furnace_scaffold: '穿过检修架。管口泄热时换到另一侧，栏外没有落脚处。',
    furnace_heart: '夺下承火架。避开泄压线，抓住重锤砸落后的破绽。',
} as const;
export const FURNACE_COMBAT_COPY = {
    connected: '承火架接入主炉 · 拆除两侧接入座可打断供热',
    burning: '装甲张开 · 过载后的破绽更长',
    couplerBroken: '接入座破裂 · 承火架暂时停顿',
};
