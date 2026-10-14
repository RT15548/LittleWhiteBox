import { CAST } from './content.js';
import type { EventPayload, PersonId } from './model.js';
import type { CooperationStatement } from './cooperation.js';
import { ERRORS } from './fault.js';
import { BLUEPRINTS, ITEMS, RECIPES, RESOURCE_RULES, WORK_NAMES } from './survival-content.js';
const dragBody = '搬动遗体';
export const COPY = {
    name: '荒岛', category: '生存 · 群像', tagline: '七个人，各自活下去', entry: '登岛',
    start: '开始旅程', resume: '回到岛上', restart: '重新开始', restartWarning: '重开会结束并替换这一局，无法返回。',
    opening: '海浪把你推上沙滩。六个人散落在不远处，有人咳嗽，有人还没站起来。你的衣服是湿的。',
    back: '返回', close: '关闭', yes: '确认重开', cancel: '取消', journal: '经历', inventory: '随身', craft: '制作', build: '营地', body: '身体',
    speak: '说话', sayPlaceholder: '说些什么……', send: '说出口', thinking: '有人正在作出决定…', stopGm: '停止本轮',
    action: '行动', actionPlaceholder: '想做什么？例如：脱下救生衣', interpretAction: '看看怎么做', interpreting: '正在理解行动…',
    proposedAction: '这一步', confirmAction: '执行这一步', dismissAction: '放弃这步', actionQuestion: '还需要确认',
    actionCost: '会调用当前模型理解意图；确认后才行动。',
    actionRoute: '经过位置', actionTarget: '对象', actionPosition: '位置', actionWater: '用水量', actionWords: '会说出口', actionTime: '预计耗时',
    actionQuantity: (count: number) => `× ${count}`, actionMl: (amount: number) => `${amount} 毫升`,
    actionReference: (reference: number) => `经历 #${reference}`,
    actionCoordinates: (point: { x: number; y: number }) => `东向 ${Math.round(point.x * 10) / 10}、南向 ${Math.round(point.y * 10) / 10} 米`,
    actionItem: (name: string, context: string) => `${name} · ${context}`,
    carried: '随身携带',
    actionAtFeet: '脚下当前位置', actionReliefNote: '在这里处理，周围的人仍可能看见。',
    actionMaterialsNote: '这些材料会被实际消耗；尚未执行。',
    alone: '交谈范围内无人', private: '两人交谈', group: '多人在场', nearby: '附近', nobody: '视线内没有人',
    continue: '继续行动', wait: '等一会儿', rest: '休息十分钟', pause: '停下', approach: '走近', take: '拾取', drop: '放下', wear: '穿上', unwear: '脱下',
    offer: '递给', offerTo: '递给谁', receive: '接过', incoming: '递到你面前', takeBack: '收回',
    offering: (person: PersonId) => `正递给${CAST[person].name}`,
    offeredBy: (person: PersonId) => `${CAST[person].name}递来的`,
    noRecipient: '附近没人能接过物品，先走近对方。',
    gather: '收集', eat: '吃', drink: '喝水', wash: '用水清洁', fill: '装水', relieveUrine: '小便', relieveFeces: '排便', cover: '掩埋',
    washSupply: '清洁用水', washAmount: '用水量（毫升）', washNote: '会消耗这些水；清洁身体不等于消毒、治伤或洗净衣物。',
    noWashWater: '手边没有可用的水。', groundTraces: '附近痕迹',
    wasteKind: { urine: '尿液湿痕', feces: '未掩埋的粪便', disturbed_ground: '翻动过的土面' },
    foodCondition: { unexamined: '还未凑近查看', no_obvious_spoilage: '没有明显异味，不代表食用安全', off_odor: '已有变质异味，食用会增加疾病负担' },
    eatDespiteSpoilage: '仍然吃', spoiledCooking: '材料已有异味，烤熟不会消除已累积的变质风险。',
    drinkDespiteSpoilage: '仍然喝', liquid: '液体', foodAndLiquid: '食物与液体', pour: WORK_NAMES.pour, emptyLiquid: WORK_NAMES.empty,
    pourFrom: '从这件容器', pourTo: '倒入', pourAmount: '倒入量（毫升）', emptyLiquidNote: '倒掉的液体无法取回，容器会保留。',
    water: '水', materials: '使用材料', make: '开始制作', place: '在这里搭建', work: '继续施工', empty: '没有可用物品',
    choose: '选择', quantity: '数量', ml: '毫升', untreated: '未处理', treated: '已处理', worn: '穿戴中', ground: '地面',
    hunger: '饥饿', thirst: '口渴', fatigue: '疲劳', bladder: '便意 · 小便', bowel: '便意 · 排便', wound: '脚伤', hygiene: '清洁',
    dead: '旅程到此为止', deadDetail: '你没能活下来。这一局已结束，只能重新开始。', remains: '遗体',
    dragBody, coverBody: WORK_NAMES.cover_body, covering: '遮盖在遗体上',
    dragDestination: (person: PersonId) => `搬动${CAST[person].name}的遗体：选择要走到的地面`,
    coverMaterial: '用来遮盖的衣物或枝叶', noCoverMaterial: '手边没有脱下的衣物、布片或棕榈叶。',
    bodyHandlingNote: '拖移较慢，也更耗体力；随身物件与遮盖物会一起移动。',
    recover: '确认保存状态', retry: '重新读取', error: '操作未完成', saved: '已保存', saving: '保存中',
    gmFailed: '人物回应未完成', retryGm: '重试人物回应', errorDetails: '查看原因', modelSettings: '模型设置',
    gmFailureDetail: '已保存的行动和说话仍保留。重试只重新请求人物回应，会使用当前模型。',
    renderError: '岛上画面暂时没能载入。可以重试，旅程进度仍保留。', loadingScene: '正在回到岛上…', reloadScene: '重新载入画面', mapLabel: '岛上现场，点击地面移动',
    noMaterials: '附近或随身没有适用材料', occupied: '进行中', waiting: '等待行动', storm: '阵雨', clear: '晴', night: '夜间',
    stairs: '行动', fire: '生火', fuel: '添柴', boil: '煮水', waterContainer: '容器', materialMissing: '材料不足',
    people: '人与立场', visiblePeople: '眼前的人', ownChoices: '我的选择', residence: '住处', settleHere: '决定住在这里',
    noResidence: '还没决定住处', declareResidence: '我打算住在这里。', stance: { with: '支持', against: '反对', neutral: '不站队' },
    declaration: (person: PersonId, stance: 'with' | 'against' | 'neutral') => ({ with: `我愿意支持${CAST[person].name}。`, against: `我不赞同${CAST[person].name}，不再站在同一边。`, neutral: `对${CAST[person].name}，我暂不站队。` })[stance],
    declarationNote: '这是你公开表达的选择。只有现场能听见的人会知道；不会替对方作出承诺。',
    knownChoices: '我知道的表态', noChoices: '还没有听到明确表态。', returnHome: '走回住处', look: '查看',
    agreements: '合作约定', propose: '提出约定', proposalTerms: '我愿意怎样合作', proposalPlaceholder: '说清各自做什么、物资怎么用……',
    noAgreements: '还没有听到合作提议。', agreementNote: '提出只代表你自己答应。其他人各自回应，交付与劳动仍需实际行动。',
    commitment: { accept: '愿意履行', decline: '不参与' }, noCommitment: '尚未回应', accept: '我愿意', decline: '不参与', withdraw: '退出约定',
    respondAgreement: (accept: boolean) => accept ? '这份约定，我愿意履行。' : '这份约定，我不参与。',
    relayTerms: '转述原提议', relayResponse: '转述这次回应', relayStatement: '我把听到的原话转述给你们。',
    proposalBy: (person: PersonId) => `${CAST[person].name}的提议`,
    through: (person: PersonId) => person === 'player' ? '本人' : `听自${CAST[person].name}`,
    quote: (statement: CooperationStatement) => `${CAST[statement.actor].name}的${statement.choice.kind === 'proposal' ? '提议' : '回应'}：「${statement.text}」`,
    earlier: '查看早期经历', nextPage: '下一页', recent: '近期', historyEmpty: '没有更早的经历。',
    zoomIn: '拉近', zoomOut: '拉远', inSight: '视线内', idle: '停留',
    dismantleWarning: (names: string[]) => `会拆用正在穿着的${names.join('、')}，拆用后不能再穿。`,
    tools: '工具条件', toolChoice: (names: string[]) => names.join('或'), nearbyFire: '附近的火', toolsKept: '工具不会消耗。',
    ready: '已具备', missingCondition: '缺少', produces: '得到', duration: (seconds: number) => `约 ${Math.ceil(seconds / 60)} 分钟`,
    feeling: { thirst: ['还不太渴', '口干，想喝水', '很渴，需要补水'], hunger: ['还不饿', '肚子饿了', '持续缺食，体力恢复变慢'],
        fatigue: ['尚有余力', '有些累', '很累，需要休息'], relief: ['不急', '需要找地方处理'], foot: ['行走无脚伤妨碍', '脚痛，行走变慢'], clean: ['还算清洁', '身上脏了，需要清洁'] },
    wetClothing: '身上的衣物还湿着，休息恢复较慢。',
    sip: WORK_NAMES.sip, rawWaterRisk: '水未经处理，直接饮用有生病风险。',
    gatherAvailable: (count: number) => `可收集 ${count} 份`,
    poolExposed: '当前水位较低，可以下池采集。', poolFlooded: '当前水位较高，暂不能下池采集。', sourceDepleted: '眼下没有可收集的东西。',
    repeated: (count: number) => `× ${count}`,
    materialAvailable: (count: number) => `有 ${count} 份`,
    places: '已知地点', knownPlacesNote: '记得的位置，不代表那里此刻的情况。', noKnownPlaces: '还没有记下地点。', firstObserved: '发现于', goThere: '走过去',
    contactPause: '遇见了人，行动暂歇',
    fireBurning: '火在燃烧', fireUnlit: '未点燃', fireNeedsFuel: '先添入燃料',
    fuelTime: (seconds: number) => `现有燃料约可燃烧 ${Math.ceil(seconds / 60)} 分钟`,
    active: { travel: '行走', drag: dragBody, rest: '休息', take: '拾取', work: '劳作', construct: '施工', offer: '递出物品，等对方接过' },
    terrain: { sand: '西岸沙滩', scrub: '岛中林地', reef: '东岸礁滩', mangrove: '南端红树林' },
    time: (clock: number) => { const local = clock + 9 * 3600; return `第 ${Math.floor(local / 86400) + 1} 天 · ${String(Math.floor(local / 3600) % 24).padStart(2, '0')}:${String(Math.floor(local / 60) % 60).padStart(2, '0')}`; },
    distance: (metres: number) => `${Math.round(metres)} 米`,
} as const;
const name = (id: PersonId) => CAST[id].name;
export function eventText(p: EventPayload, shared?: CooperationStatement): string {
    switch (p.kind) {
        case 'speech': return p.text;
        case 'declaration': return shared ? `${p.text}\n${COPY.quote(shared)}` : p.text;
        case 'intention': return p.text;
        case 'encounter': return `${name(p.actor)}看见了${name(p.subject)}。`;
        case 'started': return `${name(p.actor)}开始${COPY.active[p.activity]}。`;
        case 'departed': return `${name(p.actor)}动身离开。`;
        case 'arrived': return `${name(p.actor)}停下脚步。`;
        case 'rested': return `${name(p.actor)}结束了休息。`;
        case 'interrupted': return `${name(p.actor)}停下了手里的事。`;
        case 'taken': return `${name(p.actor)}拾起一件物品。`;
        case 'offered': return `${name(p.actor)}向${name(p.to)}递出${ITEMS[p.form].name} × ${p.units}。`;
        case 'received': return `${name(p.actor)}接过${name(p.from)}递来的${ITEMS[p.form].name} × ${p.units}。`;
        case 'poured': return p.to === null ? `${name(p.actor)}倒掉了 ${p.millilitres} ml 液体。` : `${name(p.actor)}把 ${p.millilitres} ml 液体倒入了另一只容器。`;
        case 'dropped': return `${name(p.actor)}放下一件物品。`;
        case 'worn': case 'unworn': return `${name(p.actor)}调整了穿戴。`;
        case 'take_unavailable': return `${name(p.actor)}没能拿到那件物品。`;
        case 'contested': case 'resource_contested': case 'site_contested': return `${p.actors.map(name).join('和')}同时伸手，事情暂时停了下来。`;
        case 'died': return `${name(p.actor)}没能撑过来。`;
        case 'noticed_body': return `${name(p.actor)}发现了${name(p.subject)}的遗体。`;
        case 'body_handling': return p.stage === 'started' ? `${name(p.actor)}开始搬动${name(p.subject)}的遗体。` : `${name(p.actor)}放下了${name(p.subject)}的遗体。`;
        case 'body_covered': return `${name(p.actor)}遮盖了${name(p.subject)}的遗体。`;
        case 'discovered': return `${name(p.actor)}发现了${p.subject.kind === 'resource' ? RESOURCE_RULES[p.subject.form].name : BLUEPRINTS[p.subject.form].name}。`;
        case 'worked': return `${name(p.actor)}完成了${p.task === 'craft' && p.target && Object.hasOwn(RECIPES, p.target) ? RECIPES[p.target as keyof typeof RECIPES].name : WORK_NAMES[p.task]}。`;
        case 'work_failed': return `${name(p.actor)}的工作停了下来：${errorText({ code: p.reason })}`;
        case 'need': return `${name(p.actor)}感到${({ thirst: COPY.thirst, hunger: COPY.hunger, fatigue: COPY.fatigue, bladder: '需要小便', bowel: '需要排便', wound: '脚痛' })[p.need]}。`;
        case 'accident': return `${name(p.actor)}没能及时处理便意，需要清洁。`;
    }
}
export function errorText(error: unknown): string {
    const e = error as { code?: string; message?: string };
    const key = e?.code?.replace(/^island_/, '') as keyof typeof ERRORS;
    return ERRORS[key] ?? e?.message ?? COPY.error;
}
