import {
    TAVERN_PET_CURIO_IDS,
    TAVERN_PET_EVENT_IDS,
    isTavernPetInterferenceEventId,
    type TavernPetActivityDetail,
    type TavernPetActivityDraft,
    type TavernPetCurioId,
    type TavernPetCurioSpec,
    type TavernPetEventId,
    type TavernPetInterferenceEventId,
    type TavernPetMilestoneId,
    type TavernPetMotion,
    type TavernPetNonInterferenceEventId,
    type TavernPetPersonaId,
    type TavernPetState,
} from './pet-types';
import { getTavernPetPersona } from './pet-personas';

const PET_TEMPLATE_SLOT_PATTERN = /\[\[([a-zA-Z][a-zA-Z0-9]*)\]\]/gu;
const PET_TEMPLATE_SLOTS = new Set(['displayName', 'amount', 'curio', 'targetName', 'personaName']);
const PET_INTERFERENCE_FORBIDDEN_TERMS = ['宠物', '实验体', '手机生物', '缸中之脑', '玩家饲养'];
const PET_SELF_MEMORY_FORBIDDEN_TERMS = [
    '玩家', '余额', '账户', '钱包', '概率', '数值', '统计', '系统', '阶段', '事件', '冷却', '设定',
];

export const TAVERN_PET_CURIOS: Readonly<Record<TavernPetCurioId, TavernPetCurioSpec>> = Object.freeze({
    'bottle-cap': Object.freeze({
        id: 'bottle-cap', label: '瓶盖', description: '边缘被咬出了一圈小齿印。', sourceEventId: 'bring-curio',
    }),
    'glass-bead': Object.freeze({
        id: 'glass-bead', label: '玻璃珠', description: '对着暗处看，里面像有一粒很远的光。', sourceEventId: 'bring-curio',
    }),
    'paper-star': Object.freeze({
        id: 'paper-star', label: '纸星星', description: '折得很差，但每一道折痕都很认真。', sourceEventId: 'bring-curio',
    }),
    'rusted-key': Object.freeze({
        id: 'rusted-key', label: '锈钥匙', description: '打不开这里的任何东西。它还是收着。', sourceEventId: 'bring-curio',
    }),
    'old-ticket': Object.freeze({
        id: 'old-ticket', label: '旧车票', description: '起点和终点都被啃掉了。', sourceEventId: 'bring-curio',
    }),
    'dry-flower': Object.freeze({
        id: 'dry-flower', label: '干花', description: '已经没有香味，花瓣却一片没少。', sourceEventId: 'leave-dry-flower',
    }),
});

export const TAVERN_PET_REGULAR_CURIO_IDS = Object.freeze(
    TAVERN_PET_CURIO_IDS.filter((id) => id !== 'dry-flower'),
);

interface TavernPetEventCopy {
    renderedText: string;
    motion: TavernPetMotion;
    notificationText?: string;
}

export const TAVERN_PET_EVENT_COPY: Readonly<Record<Exclude<TavernPetEventId, TavernPetMilestoneId>, TavernPetEventCopy>> = Object.freeze({
    'watch-cursor': { renderedText: '它蹲在光标旁边，盯着那根一闪一闪的竖线。', motion: 'stare' },
    'sleep-on-status': { renderedText: '它把状态栏当成枕头，睡得很没有边界感。', motion: 'none' },
    'count-wallet': { renderedText: '它隔着屏幕数你的钱。数到一半，又从头开始。', motion: 'stare' },
    'mimic-typing': { renderedText: '你没碰键盘。输入框里却自己多了三个点。', motion: 'none' },
    'hum-static': { renderedText: '扬声器里漏出很轻的电流声。它跟着哼了两下。', motion: 'bounce' },
    'guard-curios': { renderedText: '它把窝里的东西挨个挪了一遍，确认什么都没少。', motion: 'turn-away' },
    'stare-at-door': { renderedText: '它朝页面外面看了很久，像是在等一个不会出现的东西。', motion: 'stare' },
    'fake-alert': { renderedText: '屏幕闪了一下：没有新消息。它看起来很满意。', motion: 'shake' },
    'steal-small': {
        renderedText: '它把 [[amount]] 枚小白币拖进了看不见的角落。',
        motion: 'hide',
        notificationText: '[[displayName]] 拿走了 [[amount]] 枚小白币。',
    },
    'steal-large': {
        renderedText: '钱包轻了一截。它坐在远处，假装这和自己没有关系。',
        motion: 'turn-away',
        notificationText: '[[displayName]] 拿走了 [[amount]] 枚小白币。',
    },
    'hoard-coins': {
        renderedText: '它把 10 枚小白币压进窝底，还在上面认真踩了两脚。',
        motion: 'hide',
        notificationText: '[[displayName]] 藏起了 10 枚小白币。',
    },
    'spam-dots': { renderedText: '页面上冒出一串省略号。它拒绝解释。', motion: 'shake' },
    'bite-notification': { renderedText: '一条通知刚露头就缺了个角，随后缩了回去。', motion: 'shake' },
    'scratch-glass': { renderedText: '屏幕里面传来三声很轻的刮擦。玻璃外面什么都没有。', motion: 'shake' },
    'hide-in-corner': { renderedText: '它缩进最暗的角落，只留下一点不合作的轮廓。', motion: 'hide' },
    'beg-for-food': { renderedText: '它把空碗推到页面正中间，然后坐在旁边看你。', motion: 'approach' },
    'find-coins': {
        renderedText: '它从不知道哪里叼回 [[amount]] 枚小白币，推到你面前。',
        motion: 'approach',
        notificationText: '[[displayName]] 带回了 [[amount]] 枚小白币。',
    },
    'offer-treasure': {
        renderedText: '它郑重其事地放下 [[amount]] 枚小白币，像在完成一笔大交易。',
        motion: 'approach',
        notificationText: '[[displayName]] 给了你 [[amount]] 枚小白币。',
    },
    'bring-curio': {
        renderedText: '它带回一件东西：[[curio]]。看样子不打算说明来路。',
        motion: 'approach',
        notificationText: '[[displayName]] 带回了「[[curio]]」。',
    },
    'return-cache': {
        renderedText: '它从窝底拨回 [[amount]] 枚小白币。动作很慢，态度也很勉强。',
        motion: 'turn-away',
        notificationText: '[[displayName]] 还回了 [[amount]] 枚小白币。',
    },
    'pocket-change': {
        renderedText: '它在你刚花过钱的地方转了一圈，捡回 [[amount]] 枚小白币。',
        motion: 'approach',
        notificationText: '[[displayName]] 捡回了 [[amount]] 枚小白币。',
    },
    'leave-dry-flower': {
        renderedText: '它在窝边放下一朵干花。花已经没有香味，花瓣却一片没少。',
        motion: 'approach',
        notificationText: '[[displayName]] 带回了「干花」。',
    },
    'nibble-sleeve': { renderedText: '它回来以后一直在嚼空气，像是刚干了什么。', motion: 'turn-away' },
    'tip-over-cup': { renderedText: '它面前留着一道浅浅的圆印。你看过去时，它慢慢把脸转开。', motion: 'turn-away' },
    'avert-mishap': { renderedText: '它今天异常安静，像是偷偷把什么推回了原位。', motion: 'stare' },
    'brief-glimpse': { renderedText: '它身上沾着一点不属于这个房间的灰。', motion: 'stare' },
});

export const TAVERN_PET_SELF_MEMORY_COPY: Readonly<Record<TavernPetEventId, string>> = Object.freeze({
    'arrival': '我还没醒。只记得暗处很热。',
    'hatch': '壳裂开了。我第一次看见玻璃外面有个人。',
    'adulthood': '有一天我忽然知道自己要长成什么样了。',
    'repattern': '我盯着自己的影子。影子先变，我才跟上。',
    'watch-cursor': '我蹲在那根一闪一闪的竖线旁边，看了很久。',
    'sleep-on-status': '我找了个横着的地方睡了一觉。',
    'count-wallet': '我隔着玻璃数外面那个人的小白币。数到一半忘了，又从头数。',
    'mimic-typing': '我在那个人打字的地方留了三个点。那边没碰。',
    'hum-static': '有很轻的电流声。我跟着哼了两下。',
    'guard-curios': '我把窝里的东西挨个挪了一遍，确认一件都没少。',
    'stare-at-door': '我朝外面看了很久。没等到什么。',
    'fake-alert': '我让屏幕闪了一下。什么都没有。我挺满意。',
    'steal-small': '我把那个人的一点小白币拖进了暗处。',
    'steal-large': '我拿了很多。拿完就坐远了点，假装不是我。',
    'hoard-coins': '我把十枚小白币压进窝底，还踩了两脚。',
    'spam-dots': '我在外面留了一串点。我不想解释。',
    'bite-notification': '有个东西刚冒头，我咬掉一个角，它就缩回去了。',
    'scratch-glass': '我在玻璃上刮了三下。外面没有回应。',
    'hide-in-corner': '我缩进最暗的角落，不想被看见。',
    'beg-for-food': '我把空碗推到那个人面前，坐着看着。',
    'find-coins': '我叼回几枚小白币，推了过去。',
    'offer-treasure': '我把小白币放到那个人面前。这是很重要的一次。',
    'bring-curio': '我带回一件东西，放进窝里。我不打算说从哪来。',
    'return-cache': '我从窝底拨回去一些小白币。很慢。我不情愿。',
    'pocket-change': '那个人刚花过东西的地方掉了几枚，我捡了回来。',
    'leave-dry-flower': '我在窝边放下一朵干花。它没有味道了，花瓣一片没少。',
    'nibble-sleeve': '我伸出去扯了一下外面一个人的袖口，然后缩了回来。',
    'tip-over-cup': '我碰了一下外面桌上的杯子。它晃了晃，停住了。',
    'avert-mishap': '外面有个东西本来要磕到，我把它挪开了一点点。',
    'brief-glimpse': '我出去了一瞬间。有人好像看见我了，但再看就没有了。',
});

export function renderTavernPetSelfMemory(detail: TavernPetActivityDetail): string {
    if (detail.kind === 'event') {return TAVERN_PET_SELF_MEMORY_COPY[detail.eventId];}
    if (detail.kind === 'milestone') {return TAVERN_PET_SELF_MEMORY_COPY[detail.milestoneId];}
    if (detail.kind === 'status') {
        return detail.status === 'dormant' ? '我把自己关掉了一阵子。' : '我又醒过来了。';
    }
    return '我和外面那个人说过话。';
}

export const TAVERN_PET_INTERFERENCE_COPY: Readonly<Record<TavernPetInterferenceEventId, string>> = Object.freeze({
    'nibble-sleeve': '一只看不清轮廓的小东西扯了一下【[[targetName]]】的袖口。[[targetName]]只感到极轻的拉扯，更像衣料勾到了什么；这件小事自然融入眼下场景，不延伸成调查或新设定。',
    'tip-over-cup': '桌边的杯子忽然轻轻晃了一下，随即停稳。附近的人只会把它当作桌面震动、风或一次没放稳的小意外；自然带过，不追查来源。',
    'avert-mishap': '一个原本就要发生的小磕碰在最后一刻偏开了：可能是物件恰好停住，也可能是脚步无意间错开。结果只比原先幸运一点，所有人都把它当作寻常巧合。',
    'brief-glimpse': '有人在余光里看见一道说不清轮廓的影子掠过，再看时已经什么都没有。那更像疲劳造成的错觉，不形成新的疑问、调查或设定。',
});

export const TAVERN_PET_STATIC_VERDICTS: Readonly<Record<TavernPetPersonaId, string>> = Object.freeze({
    'sunlet': '它把收到的好意一件件记住了。它长成了晴光团。它看你时，总像刚见到一束不会熄的光。',
    'rain-courier': '它学会在安静里等人靠近。它长成了雨脚信使。它仍会躲雨，却愿意给你留一小块干燥的地方。',
    'ledger-keeper': '它把每次给予和亏欠都算得很清楚。它长成了小账房。你的名字被它写在最不肯划掉的那一页。',
    'under-bed-hoarder': '它把得到的东西全压进了窝底。它长成了床底藏家。它不肯分你宝物，却默认你可以留在旁边。',
    'wanderer': '它一直朝房间以外的地方张望。它长成了远游种。它随时像要离开，却总会回头确认你还在。',
    'lone-blade': '它用警惕把自己磨出了锋利的边。它长成了独行刃。它不靠近你，但把背后留给了你。',
    'merry-bandit': '它从每次得逞里学会了笑。它长成了笑面盗。它叫你老板，也把你当成最值得再来一次的目标。',
    'abyss-tenant': '它在很深的安静里待得太久。它长成了深渊住客。它看你的方式仍然陌生，却已经不再把你当作噪声。',
    'blank': '它没有让任何一种倾向替自己作答。它长成了空白体。它看着你，像在等你们共同写下第一笔。',
});

export function canonicalTavernPetStaticVerdict(personaId: TavernPetPersonaId): string {
    const verdict = TAVERN_PET_STATIC_VERDICTS[personaId]
        .normalize('NFKC')
        .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/gu, '')
        .replace(/\s+/gu, ' ')
        .trim();
    if (!isTavernPetVerdictText(verdict)) {throw new Error(`pet_static_verdict_invalid:${personaId}`);}
    return verdict;
}

export const TAVERN_PET_UI_COPY = Object.freeze({
    nestTitle: '它的窝',
    nestCoinsLabel: '压在窝底的小白币',
    nestCoinsDescription: '看得到。拿不出来。',
    emptyCurios: '它还什么都没捡回来。',
    tracesTitle: '最近留下的痕迹',
    emptyTraces: '这里暂时没有新的痕迹。',
    interferenceLabel: '允许它偶尔碰到外面的世界',
    interferenceDescription: '只会发生很轻的小插曲；关闭后不删除已经发生的痕迹。',
    nameAction: '给它一个名字',
    renameAction: '改名字',
    clearNameConfirm: '恢复实验体编号',
});

export function tavernPetSpecimenLabel(specimenNumber: number): string {
    return `实验体 #${String(specimenNumber).padStart(3, '0')}`;
}

export function tavernPetDisplayName(state: TavernPetState): string {
    return state.petName || tavernPetSpecimenLabel(state.origin.specimenNumber);
}

export function renderTavernPetTemplate(
    template: string,
    values: Partial<Record<'displayName' | 'amount' | 'curio' | 'targetName' | 'personaName', string | number>>,
): string {
    const source = String(template || '');
    return source.replace(PET_TEMPLATE_SLOT_PATTERN, (_match, slot: string) => {
        if (!PET_TEMPLATE_SLOTS.has(slot)) {throw new Error(`pet_template_slot_unknown:${slot}`);}
        const value = values[slot as keyof typeof values];
        if (value === undefined || value === null || String(value) === '') {
            throw new Error(`pet_template_slot_missing:${slot}`);
        }
        return String(value);
    });
}

type TavernPetEventCopyInputBase = {
    state: TavernPetState;
    amount?: number;
    curioId?: TavernPetCurioId;
    targetName?: string;
    face: string;
    coinDelta?: number;
};

type TavernPetEventCopyInput = TavernPetEventCopyInputBase & (
    | { eventId: TavernPetInterferenceEventId; injectedText: string }
    | { eventId: TavernPetNonInterferenceEventId; injectedText?: never }
);

export function renderTavernPetEventCopy(input: TavernPetEventCopyInput): TavernPetActivityDraft {
    const copy = TAVERN_PET_EVENT_COPY[input.eventId];
    const values = {
        displayName: tavernPetDisplayName(input.state),
        ...(input.amount !== undefined ? { amount: input.amount } : {}),
        ...(input.curioId ? { curio: TAVERN_PET_CURIOS[input.curioId].label } : {}),
        ...(input.targetName ? { targetName: input.targetName } : {}),
    };
    const detailBase = {
        kind: 'event' as const,
        renderedText: renderTavernPetTemplate(copy.renderedText, values),
        face: input.face,
        motion: copy.motion,
    };
    const detail = isTavernPetInterferenceEventId(input.eventId)
        ? {
            ...detailBase,
            eventId: input.eventId,
            injectedText: input.injectedText,
        }
        : {
            ...detailBase,
            eventId: input.eventId,
        };
    return {
        detail,
        coinDelta: input.coinDelta || 0,
        ...(copy.notificationText
            ? { notificationText: renderTavernPetTemplate(copy.notificationText, values) }
            : {}),
    };
}

export function renderTavernPetInterferenceText(
    eventId: TavernPetInterferenceEventId,
    targetName = '',
): string {
    return renderTavernPetTemplate(TAVERN_PET_INTERFERENCE_COPY[eventId], {
        ...(targetName ? { targetName } : {}),
    }).trim();
}

export function renderTavernPetMilestoneActivity(input: {
    milestoneId: TavernPetMilestoneId;
    state: TavernPetState;
    turn: number;
    anchorOrder: number;
    personaId?: TavernPetPersonaId;
    verdict?: string;
}): TavernPetActivityDraft {
    const personaName = input.personaId ? getTavernPetPersona(input.personaId).displayName : '';
    const displayName = tavernPetDisplayName(input.state);
    const renderedText = input.verdict || {
        arrival: '角落里多了一枚温热的蛋。',
        hatch: '壳从里面裂开了。有什么东西抬头看你。',
        adulthood: '它的轮廓忽然安静下来，像是终于决定了自己要长成什么。',
        repattern: '它盯着自己的影子看了很久。影子先变，它随后才跟上。',
    }[input.milestoneId];
    const toast = {
        arrival: '角落里多了一枚蛋。',
        hatch: '[[displayName]] 破壳了。',
        adulthood: '[[displayName]] 长成了「[[personaName]]」。',
        repattern: '[[displayName]] 变成了「[[personaName]]」。',
    }[input.milestoneId];
    return {
        detail: {
            kind: 'milestone',
            milestoneId: input.milestoneId,
            renderedText,
            motion: 'bounce',
            milestoneTurn: input.turn,
            milestoneAnchor: input.anchorOrder,
            ...(input.personaId ? { personaId: input.personaId } : {}),
            ...(input.verdict ? { verdict: input.verdict } : {}),
        },
        coinDelta: 0,
        notificationText: renderTavernPetTemplate(toast, {
            displayName,
            ...(personaName ? { personaName } : {}),
        }),
    };
}

export function renderTavernPetStatusActivity(
    status: 'dormant' | 'woke',
    state: TavernPetState,
): TavernPetActivityDraft {
    return status === 'dormant'
        ? {
            detail: { kind: 'status', status, renderedText: '它把自己关机了。', motion: 'hide' },
            coinDelta: 0,
            notificationText: `${tavernPetDisplayName(state)} 停止了活动。`,
        }
        : {
            detail: { kind: 'status', status, renderedText: '灰掉的轮廓动了一下。它回来了。', motion: 'approach' },
            coinDelta: 0,
            notificationText: '它回来了。',
        };
}

export function isTavernPetVerdictText(value: string): boolean {
    const text = String(value || '').trim();
    const length = [...text].length;
    if (length < 20 || length > 80) {return false;}
    const sentences = text.match(/[^。！？]+[。！？]/gu) || [];
    return sentences.length === 3 && sentences.join('') === text;
}

function assertStaticTemplates(): void {
    const templates = [
        ...Object.values(TAVERN_PET_EVENT_COPY).flatMap((copy) => [copy.renderedText, copy.notificationText || '']),
        ...Object.values(TAVERN_PET_INTERFERENCE_COPY),
    ];
    for (const template of templates) {
        for (const match of template.matchAll(PET_TEMPLATE_SLOT_PATTERN)) {
            if (!PET_TEMPLATE_SLOTS.has(match[1])) {throw new Error(`pet_template_slot_unknown:${match[1]}`);}
        }
        if (template.replace(PET_TEMPLATE_SLOT_PATTERN, '').includes('[[')) {
            throw new Error('pet_template_slot_malformed');
        }
    }
    for (const template of Object.values(TAVERN_PET_INTERFERENCE_COPY)) {
        const forbidden = PET_INTERFERENCE_FORBIDDEN_TERMS.find((term) => template.includes(term));
        if (forbidden) {throw new Error(`pet_interference_forbidden:${forbidden}`);}
    }
    for (const id of TAVERN_PET_EVENT_IDS) {
        const memory = TAVERN_PET_SELF_MEMORY_COPY[id];
        if (!memory) {throw new Error(`pet_self_memory_missing:${id}`);}
        if (memory.includes('[[')) {throw new Error(`pet_self_memory_slot_forbidden:${id}`);}
        const forbidden = PET_SELF_MEMORY_FORBIDDEN_TERMS.find((term) => memory.includes(term));
        if (forbidden) {throw new Error(`pet_self_memory_forbidden:${forbidden}`);}
    }
    for (const id of TAVERN_PET_CURIO_IDS) {
        if (!TAVERN_PET_CURIOS[id]) {throw new Error(`pet_curio_missing:${id}`);}
    }
    for (const personaId of Object.keys(TAVERN_PET_STATIC_VERDICTS) as TavernPetPersonaId[]) {
        canonicalTavernPetStaticVerdict(personaId);
    }
}

assertStaticTemplates();
