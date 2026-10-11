import type { CourtyardPerson, CourtyardScene, CourtyardSwitch, LivingScene } from './world-types.js';
import { PERSON_NAMES } from './people.js';
import { LIVING_SPACES } from './living-spaces.js';

export const WORLD_COPY = Object.freeze({
    artwork: { unavailable: '部分场景纹理未载入，不影响游玩。', retry: '重新载入', loading: '载入中…' },
    transition: (place: string) => `正在前往 · ${place}`,
    rested: '生命值已满',
    households: { anian_parents: '阿念的父母', innkeeper: '客店店家' },
    scenes: {
        camp: '檐下', crossroads: '外墙岔口', gate: '哨站正门', beacon: '烽火台',
        waterway: '旧水道', cells: '牢房', hall: '内堡门厅', roots: '根庭',
        ...Object.fromEntries(Object.entries(LIVING_SPACES).map(([id, space]) => [id, space.name])) as Record<LivingScene, string>,
    } satisfies Record<CourtyardScene, string>,
    people: PERSON_NAMES satisfies Record<CourtyardPerson, string>,
    switches: {
        sluice_opened: '升起水闸', captives_released: '打开牢门', postern_opened: '拉开小门',
    } satisfies Record<CourtyardSwitch, string>,
    passages: {
        warning: { title: '哨站的烽火', body: '墙上的传令管正通向烽火台。先熄灭烽火，能截住内堡的增援；若从水道先去救人，守军会在撤离途中或内堡集结。受困者不会因为你停下来查看道路而被处决。' },
        cargo: { title: '归还的货签', body: '货车上是药材和冷却管件。\n\n哨站随货送来的放还单：\n“冷却管件十二副，库中仅此，余者冻裂报损。”\n\n管件箱里夹着的出库签：\n“本箱原装二十四副，出十二，存十二，完好。”' },
        orders: { title: '主闸控制台', body: '封锁的闸齿停了下来，外墙的输送轨道正在逐段亮起。控制台上的旧命令只有“内城优先”四个字，没有撤销日期。' },
    },
    actions: { inspect: '查看', talk: '交谈', rest: '休整', travel: '前往', close: '返回', interact: '交互', next: '切换对象', map: '地图', resume: '继续', move: '移动', controls: 'WASD 或方向键移动，E 交互', paused: '已暂停' },
});
