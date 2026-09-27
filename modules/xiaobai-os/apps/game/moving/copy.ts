import type { MovingFault, challengeProgress } from './domain.js';
import type { ItemKind, MovingError, RoomTheme } from './types.js';
import { MOVING_POLICY as p, type ChallengeTier } from './policy.js';

export const CHALLENGE_NAMES: Record<ChallengeTier, string> = { hard: '高难', expert: '专家', extreme: '极限' };

export const MOVING_COPY = {
    name: '小白搬家', category: '收纳', tagline: '留点空位，把小屋慢慢搬空',
    description: '同类三件打包，空位留给下一步。', entry: '两章 · 3D 解谜', mark: '搬',
    chapters: '两间小屋', close: '收起', cancel: '取消', confirm: '确定',
    restart: '重新收拾', undo: '撤回一步', rules: '怎么玩', soundOn: '声音开', soundOff: '声音关',
    soundUnavailable: '当前浏览器不支持游戏声音。', soundFailed: '声音没能打开，可再次尝试。',
    soundSaveFailed: '声音设置没有保存，稍后再试。',
    rotateLeft: '向左转', rotateRight: '向右转', resetView: '回正视角', zoomIn: '近一点', zoomOut: '远一点',
    rotateHint: '从上往下拆垛 · 拖动转视角', tray: '待打包架', emptySlot: '空位',
    pickList: '看物件', pickListTitle: '从上往下收拾', noItems: '转个角度，看看最上面的物件。',
    progress: (packed: number, total: number) => `已搬 ${packed} / ${total} 箱`,
    progressLabel: '打包进度', stage: (index: number) => `第 ${index + 1} 关`,
    tierProgress: (progress: ReturnType<typeof challengeProgress>) => progress.nextTier
        ? `累计通关 ${progress.wins} 次 · 再赢 ${progress.winsToNext} 局升至${CHALLENGE_NAMES[progress.nextTier]}`
        : `累计通关 ${progress.wins} 次 · 最高档无限随机`,
    tierRule: `每累计通关 ${p.challengeWinsPerTier} 次升一档，升至最高档后保持。失败或放弃不降档。`,
    nextTier: (tier: ChallengeTier) => `下一局 · ${CHALLENGE_NAMES[tier]}`,
    item: (name: string, ordinal: number) => `收拾${name} ${ordinal}`,
    slot: (name: string, index: number) => `第 ${index + 1} 格：${name}`,
    slots: (count: number, capacity: number) => `暂存 ${count} / ${capacity}`,
    packed: (name: string) => `${name}打包好啦，空位腾出来了。`,
    selected: (name: string) => `${name}暂时放在架上。`,
    won: '这间屋子，收拾好啦！', lost: '暂存架满了', abandoned: '本次搬家已放弃',
    lostBody: '撤回一步，换个收拾顺序。', next: '下一关', chapterComplete: '去魔女的厨房',
    restartTitle: '从头收拾？', discard: '这一关从头开始，首通奖励不会重复发放。',
    sessionNote: '进度自动保存。关窗、刷新或换聊天，都可以回来继续。',
    instructions: [
        '物件一层层压着，先拿走最上面的，才能拿下一层。',
        '七格架子只做暂存；同类三件自动打包，把空位腾出来。',
        '拿第三件之前，先看看要清掉哪些杂物，空位够不够。',
        '填满架子仍凑不成三件，本局结束。转视角可以观察，但不能从下面抽物件。',
    ],
    loading: '正在取出搬家记录…', generating: '正在寻找一间够难的小屋…',
    graphicsFailed: '立体小屋没有成功打开。请检查浏览器的硬件加速，再重试。',
    contextLost: '三维画面连接中断了。当前局还在，重新打开画面即可继续。',
    retryGraphics: '重新打开画面', sceneLabel: '立体小屋，拖动旋转，从上方轻点物件；左右方向键旋转',
    lobby: '返回大厅', backChapters: '回到两间小屋', resume: '继续收拾', abandon: '放弃本局',
    abandonTitle: '确定放弃这次挑战？', abandonBody: `报名费 ${p.challengeFee} 不退还。只是暂时离开，可以关窗，下次接着玩。`,
    paidLost: `本局结束，报名费 ${p.challengeFee} 不退还。`,
    admissionTitle: (tier: ChallengeTier) => `报名${CHALLENGE_NAMES[tier]}挑战`, admission: `报名 ${p.challengeFee}`,
    admissionBody: `报名扣 ${p.challengeFee} 小白币；通关到账 ${p.challengePrize}，净赚 ${p.challengePrize - p.challengeFee}。失败或主动放弃不退费，无撤回、无免费重开。`,
    paidRule: '无撤回 · 关窗可续玩', challengeLocked: '完成第一章后开放', chapterOne: '第一章', chapterTwo: '第二章',
    firstReward: `每关首次通关 +${p.chapterReward}`, earned: '首通已领取',
    reward: (amount: number) => `小白币 +${amount}`, balance: (amount: number) => `余额 ¤ ${amount}`,
    challengeTerms: `报名 ${p.challengeFee} · 通关 ${p.challengePrize}`,
    paidActive: '先完成或放弃正在进行的挑战。', saved: '已保存', saving: '正在保存…',
    recover: '检查并恢复本次操作', refresh: '重新读取',
    saveProblem: '这一步还没确认保存，先检查结果。不会重复扣费或换题。',
    conflict: '存档存在冲突，暂时不能继续。请重新打开小白 OS 核对。',
    genericError: '这次操作没有完成，请检查结果后重试。',
    noFunds: `至少需要 ${p.challengeFee} 小白币才能报名。`,
    storyBusy: '故事正在回复，结束后可以继续收拾。',
    shelf: (index: number) => `第 ${index + 1} 垛`, underneath: '上面还有物件', available: '可搬走',
} as const;

export const ITEM_NAMES: Record<ItemKind, string> = {
    cat: '猫猫摆件', toast: '厚吐司', ufo: '小飞碟', cup: '胖杯子',
    duck: '小黄鸭', plant: '盆栽', potion: '魔药瓶', star: '小星星',
};
export const ROOM_NAMES: Record<RoomTheme, string> = { weekend: '猫咪的小屋', witch: '魔女的厨房' };
export const MOVING_ERRORS: Record<MovingError, string> = {
    finished: '这一局已经结束。', missing: '这件东西已经收走了。', blocked: '上面还压着物件，先从最上面收拾。',
};
const FAULTS: Record<MovingFault, string> = {
    ...MOVING_ERRORS, locked: MOVING_COPY.challengeLocked, active: MOVING_COPY.paidActive,
    noUndo: '还没有可以撤回的一步。', paidRule: MOVING_COPY.paidRule,
    stale: '这一局有了新变化，请重新读取。', identity: '页面已切换，请重新打开游戏。',
    invalid: '搬家记录未通过校验，请检查存档。', generation: '没有生成合格的挑战，本次未扣费，请重试。',
    funds: MOVING_COPY.noFunds, unavailable: '正在处理其他操作，请稍后再试。',
};
export function movingErrorText(error: unknown): string {
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : error instanceof Error ? error.message : '';
    if (code.startsWith('moving_save_') || code === 'host_request_timeout') { return MOVING_COPY.saveProblem; }
    if (code === 'moving_generation_exhausted') { return FAULTS.generation; }
    return FAULTS[code.replace(/^moving_/, '') as MovingFault] ?? MOVING_COPY.genericError;
}
