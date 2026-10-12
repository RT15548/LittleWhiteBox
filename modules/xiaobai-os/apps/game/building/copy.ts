import { BUILDING_POLICY as P, PARTS, TIER_RULES, PROJECT_WISH_TARGET, type Part, type Tier } from './policy.js';
import { SUPPLY_ROUNDS, SUPPLY_CHOICES, STARTER_ROOMS } from './supply.js';
import { MEMORY_IDS, MEMORY_MATERIALS, type MemoryId, type MemoryNeed } from './memories.js';
import type { SpaceActivity, SpaceIssue } from './spaces.js';
export const PART_NAMES = { hall: '过厅', entry: '门厅', room: '卧室', wide: '客厅', study: '阅读角', terrace: '露台', garden: '花园', path: '院路', roof: '屋顶' } as const;
export const TIER_NAMES = { courtyard: '小院平房', duplex: '两层小楼', terrace: '露台小屋', sunroom: '阳光书屋' } as const;
export const SPACE_ISSUES: Record<SpaceIssue, string> = { disconnected: '这里还没有接通', uncovered: '这里还没有封顶', noisy: '门口旁边和正上方都吵，隔开一格更安静', window: '两侧都被房间夹住了，要留一面朝户外的侧窗', shaded: '太阳被挡住了，向阳一侧要留空' };
export const ACTIVITIES: Record<SpaceActivity, string> = { read: '读一会儿书', sunbathe: '晒晒太阳', rest: '睡个午觉', relax: '坐下来喝杯茶', garden: '看看小院' };
export const ACTIVITY_STATUS: Record<SpaceActivity, string> = { read: '小白在翻书', sunbathe: '小白在晒太阳', rest: '小白睡着啦', relax: '小白在喝茶', garden: '小白在赏花' };
export const MEMORY_COPY: Record<MemoryId, { title: string; wish: string; gift: string; thanks: string }> = {
    gardenWalk: { title: '沿小路去赏花', wish: '想沿着院路，走到花园里。', gift: '小鸟浴台', thanks: '小路通到花园了，也给小鸟留一碗水。' },
    gardenReading: { title: '窗外就是花园', wish: '想在安静的阅读角，透过侧窗看花。', gift: '窗边花盆', thanks: '翻书的时候，抬头就能看见花。' },
    gardenTea: { title: '花园下午茶', wish: '想有一间出门就到花园的客厅。', gift: '薄荷茶具', thanks: '茶泡好啦，坐下来陪我一会儿吧。' },
    quietBedroom: { title: '不被打扰的午睡', wish: '想把卧室放安静些，不让大家从床边穿行。', gift: '暖绒小毯', thanks: '这回能安心睡个午觉啦。' },
    courtyard: { title: '屋子围着的小院', wish: '想让花园三面挨着屋子，头顶还能看见天。', gift: '庭院灯串', thanks: '窗里有家，窗外有花。这就是我们的小院啦。' },
};
export const MEMORY_NEEDS: Record<MemoryNeed, string> = {
    bedroom: '先留一间能住的卧室。', garden: '添一块露天花园。', path: '让院路直接接到花园边，拐角相碰不算。',
    study: '阅读角要远离门口，并留一面朝户外的侧窗。', gardenWindow: '花园要紧挨阅读角的左侧或右侧。',
    livingRoom: '添一间双格客厅。', gardenDoor: '让客厅与花园共用一条边，不隔着院路。',
    privacy: '卧室离门口至少两格；去其他地方不必穿过卧室。', enclosure: '花园的前后左右，至少三边紧挨地面房间。',
};
export const COPY = {
    name: '小白筑家', category: '3D · 小屋建造', tagline: '给小白造一个不一样的家。', entry: '随机建材 · 自由造家', mark: '⌂',
    description: '选房间，搭一个小白真正住得进去的家。',
    ledger: { fee: '小白筑家 · 开工', ready: '小白筑家 · 基础房屋', finished: '小白筑家 · 心愿交付' },
    start: `开工 · ${P.fee} 金币`,
    admission: (tier: Tier) => `开工扣 ${P.fee} 金币，先领 ${STARTER_ROOMS.length} 间卧室的建材。有卧室即返还 ${P.habitableAward}；配齐客厅和户外一角可交付。安静阅读角、向阳露台、三面围合小院，任选 ${PROJECT_WISH_TARGET} 项实现，交付再得 ${TIER_RULES[tier].award - P.habitableAward}。旧小屋会保留。`,
    construction: '给小白造个家', workbench: '建造与家园', newProject: '开始一栋新小屋', another: '再建一栋', resume: '继续建造',
    newBrief: `先选 ${SUPPLY_ROUNDS} 批随机建材，再动手造家。`,
    supplies: '建材配给', batch: (round: number) => `第 ${round + 1} / ${SUPPLY_ROUNDS} 批建材`,
    pickTerms: `每批独立随机，${SUPPLY_CHOICES} 选 1；不保证每种房型都有。`, takePack: '选这份',
    stock: (n: number) => `余 ${n}`, cost: (n: number) => `预算 ${n}`, freePath: '免费',
    commission: '委托详情', minimumTitle: '可以入住', minimumGoals: { bedroom: '卧室', lounge: '客厅', outdoor: '花园／向阳露台' } as const,
    bonusTitle: `额外心愿 · 任选 ${PROJECT_WISH_TARGET} 项`, bonusTerms: (tier: Tier) => `交付时满足任意 ${PROJECT_WISH_TARGET} 项，另得 ${TIER_RULES[tier].award - P.habitableAward} 金币。`,
    bonusProgress: (n: number) => `心愿 ${Math.min(n, PROJECT_WISH_TARGET)}/${PROJECT_WISH_TARGET} · 详情`,
    planningHelp: '房间的数字是预算花费，小字是剩余建材。拆下会退回建材和预算。阅读角需要远离门口、侧窗朝外；露台要在楼上，向阳处不受遮挡。建材不必用完，达标后也可继续建造。',
    deliver: '交付小屋', delivered: '小白的新家，交付啦！',
    deliveryTerms: (award: number, bonus: boolean) => `本次共得 ${award} 金币（含已发的 ${P.habitableAward}）。${bonus ? '额外心愿也达成了。' : '额外心愿还没齐，交付后不再补领本次奖金。'}交付后仍可在家园自由改建。`,
    deliveryIncomplete: '卧室、客厅和可用的花园或露台齐全后，即可交付。',
    goal: {
        courtyard: '露天花园三面紧挨地面房间',
        quietReading: '远离门口、侧窗通向户外的阅读角', sunTerrace: '向阳无遮挡的露台',
    },
    homes: '我的家园', homeMode: '自由改建',
    prepare: '正在检查地块…', loading: '正在找回你的小屋…', saving: '正在保存…',
    parts: '房间', remove: '拆下', undo: '撤销', menu: '更多', budget: (left: number) => `预算余 ${left}`,
    selected: (p: Part) => PART_NAMES[p.kind],
    cell: (x: number, y: number, z: number) => `第 ${y + 1} 层，第 ${z + 1} 排，第 ${x + 1} 列`,
    place: (p: Part) => `建${PART_NAMES[p.kind]}，第 ${p.y + 1} 层，第 ${p.z + 1} 排，第 ${p.x + 1} 列`,
    choice: (kind: Part['kind'], remaining: number | null = null) => `${PART_NAMES[kind]}，预算 ${PARTS[kind].cost}${remaining === null ? '' : `，剩余建材 ${remaining}`}`,
    refit: (kind: 'room' | 'study') => `改成${PART_NAMES[kind]}`,
    remodel: '改建家园', done: '结束改建', reside: '住回这里', floors: '查看楼层', whole: '全景', floor: (y: number) => y === 0 ? '一层 · 庭院' : `${y + 1} 层`,
    invited: (activity: SpaceActivity) => `好呀，去${ACTIVITIES[activity]}。`, focus: '看看小白',
    noPlace: '这里暂时放不下，换一种房间或拆改一下。',
    sun: (side: number) => `阳光从${side === -1 ? '左' : '右'}边来`,
    walking: (activity: SpaceActivity) => `小白正要${ACTIVITIES[activity]}`,
    useSpace: (activity: SpaceActivity) => `请小白${ACTIVITIES[activity]}`,
    archiveTitle: (tier: Tier, i: number) => `${TIER_NAMES[tier]} · ${i + 1}`,
    complete: '小白的家', abandoned: '工程已停工',
    earned: (n: number) => `已到账 ${n} 金币`, net: (n: number) => `净收益 ${n - P.fee >= 0 ? '+' : ''}${n - P.fee}`,
    memories: '小家回忆', memoryProgress: (n: number) => `${n} / ${MEMORY_IDS.length} 段生活`,
    memoryReward: (id: MemoryId) => `${MEMORY_COPY[id].gift} · 改建预算 +${MEMORY_MATERIALS}`,
    remember: '请小白来看看', memoryReady: '布置好了，叫小白来试试吧。',
    memoryComplete: '每个角落，都有一起住下来的回忆。', memoryFinished: '继续按你的心意改建，纪念物会一直留下。',
    memoryStored: '已收好，添回对应房间就会摆出来', memoryPlaced: (kind: Part['kind']) => `摆在${PART_NAMES[kind]}`,
    memoryLocked: '还没发生的生活', memoryCollection: '纪念物随对应用途房间自动摆放；拆改不丢失，也不重复领取。',
    collection: '作品册', collect: '收藏这栋', uncollect: '移出作品册',
    emptyCollection: '另建新小屋时，交付的旧屋会自动留在这里。', collectionCount: (n: number) => `${n} / ${P.collectionSize} 栋`,
    uncollectTitle: '移出作品册？', uncollectBody: '历史收益保留。若不是当前工程，移出后将不再保留这栋建筑，可先保存留影。',
    export: '保存留影', exportName: (tier: Tier) => `小白筑家-${TIER_NAMES[tier]}.png`, exportError: '留影未能保存，请重试。',
    abandon: '放弃工程', abandonTitle: '停止这次建造？', abandonBody: '已到账的奖励保留，开工费不退。未收藏的工程会在下一次开工时替换。',
    confirm: '确定', cancel: '再想想', close: '关闭', back: '返回当前工程',
    rules: '玩法', ruleItems: ['选楼层和房间，再点地面空位。可前后左右扩建，院路能连通花园和房间；门、楼梯和屋顶自动安排。',
        '每块地的轮廓和预算不同。小院留在地面，露台在楼上；阅读角要远离门口，至少一侧通向户外、小院或露台。点现有房间可以拆改或请小白试住。',
        `开工后连选 ${SUPPLY_ROUNDS} 批建材，每批独立随机 ${SUPPLY_CHOICES} 选 1，不按之前选择调整，也不保证都有露台。已出现的选项会保存，刷新不重抽。拆房退回建材，院路免费。`,
        `有卧室立即到账 ${P.habitableAward} 金币。卧室、客厅和户外一角齐全即可主动交付，也可继续实现额外心愿。`,
        '交付后奖金结清，家园可免费改建、发展生活纪念；不补发或重发本次金币。另建新屋前确认费用，旧屋自动保留。'],
    zoomIn: '放大', zoomOut: '缩小', resetView: '全屋', scene: '小白的建造场地',
    storyBusy: '故事生成中，施工暂歇', soundOn: '声音开', soundOff: '声音关', soundError: '声音设置未保存，请重试。',
    audioDispose: '[Building] Audio context disposal failed', noFunds: `开工需要 ${P.fee} 金币，当前余额不足。`,
    graphics: '画面暂停，工程仍在。请重新载入画面。', reload: '重载画面',
    saveProblem: '这次操作尚未确认，请复核原操作。', conflict: '工程有新版本，请重新读取。',
    recoveryProblem: '恢复记录无法读写，请允许本站存储后复核原操作。', recover: '复核原操作', refresh: '重新读取',
    retiredIntent: '旧版未完成的构件操作已取消，工程和到账记录保留，请按新布局继续。',
    balance: (n: number) => `钱包 ${n}`,
} as const;
export const ISSUES = { stock: '手头没有这类建材，可以拆回已有的同类房间。', bounds: '这里超出了地块或层高', occupied: '这里已经有房间', materials: '建造预算不够了',
    support: '楼上的每一格都要有房间承托', entrance: '要保留入口的位置', path: '院路只能铺在地面，楼上需要房间承托', garden: '小院要落在地面，上方留空',
    terrace: '露台需要建在楼上', connected: '房间之间要连通门厅' } as const;
const ERRORS: Record<string, string> = {
    ...Object.fromEntries(Object.entries(ISSUES).map(([key, text]) => [`building_${key}`, text])),
    building_invalid: '这次操作不合法，请重新读取工程。', building_identity: '操作身份不匹配，请重新读取。',
    building_stale: COPY.conflict, building_funds: COPY.noFunds, building_active: '先完成或放弃当前工程。',
    building_memory_incomplete: '这段生活还没布置好，或已经留过纪念了。',
    building_supply: '本轮建材不可领取，请重新读取工程。', building_finished: '这个工程不能进行此操作。', building_incomplete: COPY.deliveryIncomplete,
    building_collection_full: '作品册已满，请先移出一栋或保存留影。', building_generation: '地块检查未完成，没有扣费，请再试一次。',
    building_unavailable: '当前无法施工，请稍后再试。', building_recovery: COPY.recoveryProblem,
};
export function buildingErrorText(error: unknown) {
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : error instanceof Error ? error.message : '';
    return ERRORS[code] ?? COPY.saveProblem;
}
