import type { Participant } from '../content/participants.js';

const GESTURES = {
    none: '保持这一句的表情与姿态',
    nod: '轻轻点头一次',
    tilt: '略侧头打量，再回正',
    shake: '轻轻摇头一次',
    gesture: '抬起空着的手掌，作一个轻缓的示意',
    withdraw: '外伸的手略向内收，停一下再放松',
} as const;
/** Each actor's available artwork vocabulary, shared by projection, parsing and asset typing. */
export const PERFORMANCE_PROFILES = {
    sanniang: {
        expressions: {
            neutral: '平静倾听',
            smile: '真诚愉快地微笑',
            teasing: '从容、有一点逗弄的笑意',
            blush: '脸颊泛红，仍看向对方',
            rest: '安心合眼、短暂休憩',
            serious: '收起笑意，认真而冷静',
            worried: '眉间担忧，仍专注看着对方',
            sad: '垂眼含泪，流露难过',
            displeased: '收起客气，冷淡地表达不悦',
            fond: '眼帘半垂，仍看着对方，微张嘴温柔回应',
            laugh: '笑弯眼睛，自然地笑出声',
            surprised: '睁大眼，微张嘴，短暂失去从容',
        },
        gestures: GESTURES,
    },
    anian: {
        expressions: {
            neutral: '略带出神地听着',
            smile: '回过神来，露出自然坦率的微笑',
            laugh: '玩得高兴，放开地笑出声',
            blush: '脸颊明显泛红，有些迟疑地看着对方',
            fond: '眼帘半垂，带着柔和笑意回应对方',
            rest: '安心合眼，短暂休憩',
            surprised: '睁大眼，微张嘴，忽然回过神',
            worried: '眉间担忧，留神听着',
            displeased: '皱眉抿嘴，明显不高兴',
            sad: '垂眼难过，嘴角低下来',
        },
        gestures: GESTURES,
    },
    kouzi: {
        expressions: {
            neutral: '利落、直接地看着对方',
            blush: '脸颊泛红，别开目光，嘴上仍有些倔',
            smile: '办成事情后，露出利落得意的笑',
            teasing: '挑起一边眉梢，嘴角带着促狭的笑',
            laugh: '忘了绷着，痛快地笑出声',
            fond: '目光难得柔和下来，微张嘴想说真心话',
            serious: '收起玩笑，冷静专注',
            surprised: '睁大眼，微张嘴，有些不敢相信',
            worried: '眉间紧起来，尽量藏住担心',
            displeased: '目光变锐，明确表示不悦',
            sad: '垂下眼，咬住话头，不愿露出受伤的样子',
        },
        gestures: GESTURES,
    },
    laobai: {
        expressions: {
            neutral: '松松地站着，听对方说话',
            smile: '眉眼松开，好相处地笑了笑',
            teasing: '挑起一边眉梢，带着自嘲的促狭笑意',
            laugh: '没绷住，真心笑出声',
            blush: '脸颊泛红，目光躲开，有些措手不及',
            fond: '目光柔和下来，半垂眼帘，微张嘴回应',
            serious: '玩笑收住，目光安静而认真',
            surprised: '眉梢抬起，睁大眼，话停了一下',
            worried: '眉间微皱，藏不住担心',
            sad: '垂下目光，笑意消失，安静地难过',
        },
        gestures: GESTURES,
    },
    bajin: {
        expressions: {
            neutral: '绷着脸，警惕地审视来人',
            suspicious: '眯起眼，带着怀疑审视',
            angry: '眉头压紧，硬声发令',
            worried: '眉间露出紧张，眼神有些慌',
            relieved: '脸上稍松，仍然保持警惕',
            resigned: '垂下目光，不情愿地让步',
        },
        gestures: { ...GESTURES, gesture: '略抬拿签的手，作一个示意', withdraw: '拿签的手略向内收，再放松' },
    },
    changyounian: {
        expressions: {
            neutral: '眯着眼，保持克制的官家神色',
            smile: '带着分寸的客气微笑',
            squint: '眼睛眯得更紧，费力辨认',
            displeased: '客气收住，神色冷下来',
            worried: '眉间绷紧，露出一丝不安',
            relieved: '眉眼稍松，露出疲惫的淡笑',
        },
        gestures: GESTURES,
    },
} as const satisfies Record<Participant, { expressions: Record<string, string>; gestures: Record<keyof typeof GESTURES, string> }>;
export type Performer = keyof typeof PERFORMANCE_PROFILES;
export type ActorExpression<P extends Performer> = keyof typeof PERFORMANCE_PROFILES[P]['expressions'];
type Expression = { [P in Performer]: ActorExpression<P> }[Performer];
export interface Performance { expression: Expression; gesture: keyof typeof GESTURES }
export function performanceOptions(person: Participant) {
    return PERFORMANCE_PROFILES[person];
}
export function readPerformance(person: Participant, value: unknown): Performance | null {
    const options = performanceOptions(person);
    if (!value || typeof value !== 'object' || Array.isArray(value)) { return null; }
    const fields = value as Record<string, unknown>;
    if (typeof fields.expression !== 'string' || !Object.hasOwn(options.expressions, fields.expression)
        || typeof fields.gesture !== 'string' || !Object.hasOwn(options.gestures, fields.gesture)) { return null; }
    return { expression: fields.expression as Performance['expression'], gesture: fields.gesture as Performance['gesture'] };
}
