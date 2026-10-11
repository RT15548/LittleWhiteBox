import type { CourtyardFact, CourtyardScene } from './world-types.js';
import type { Campaign } from '../campaign/types.js';
import { JOURNEY_COPY } from './journey-copy.js';

export const FACT_COPY: Record<CourtyardFact, string> = {
    bajin_intel: '老白向旅人讲出了八斤的事。',
    bajin_passed: '八斤侧过盾，给旅人让开了路。',
    changyounian_passed: '常有年眯着眼看了旅人一会儿，叫人把火绳收了。',
    changyounian_intel: '三娘向旅人讲出了常守长眼睛的事。',
    briefed: '旅人接下哨站救援，要把困在外墙牢房的扣子与阿念带回来。',
    crossroads_cleared: '岔口的巡兵散了，正门和旧水道都走得通。',
    patrol_cleared: '旅人通过了哨站正门。',
    sluice_opened: '旅人升起旧水闸，露出了通往牢房的检修路。',
    waterway_cleared: '水道看守躺下了。',
    alarm_raised: '守军接到了警报；烽火未熄时，内堡将有援军。',
    alarm_silenced: '烽火没点起来，内堡的援兵不会来。',
    captives_released: '旅人打开牢门，扣子与阿念暂留安全处等候接应。',
    postern_opened: '旅人打开牢房小门，营地与牢房之间的捷径永久畅通。',
    receiving_arranged: '老白带担架队守在营地小门，三娘留出了两张床。',
    captives_arrived: '两名受困者已由担架队接回营地。',
    warden_defeated: '门厅守卫倒了，主闸松开。',
    supplies_secured: '旅人核对并接收了哨站归还的药材和冷却管件。',
    roots_cleared: '旅人清除了根庭的荆棘之心，外墙旧庭恢复通行。',
    chapter_completed: '哨站救援结束。营火旁多了两个人，内堡深处的路仍未开启。',
    clinic_helped: '旅人与三娘整理诊棚和归还的药材，陪三娘在门边歇了一会儿。',
};
export const CAMPAIGN_COPY = Object.freeze({
    title: '余火', start: '走进檐下', resume: '继续旅程', pause: '菜单', map: '地图', journal: '手记', build: '行囊', wardrobe: '衣装',
    opening: '天刚亮，雾还挂在外墙上。老白拖着伤腿回来了，身后少了扣子和阿念。三娘的诊棚亮了一夜，哨站仍扣着药材和冷却管件。',
    beginning: '到诊棚找三娘，或向北门的老白了解情况。',
    prepare: '准备行装', close: '返回', retry: '重试这场战斗',
    fallen: '火还没有熄灭', fallenDetail: '从这场战斗开始的位置、生命和构筑重试。已完成的救援和已取得的奖励不会丢失。',
    retreat: '返回营地整备',
    reward: '拾起余烬', rewardDetail: '选择一件遗物收入收藏。营地可以重新搭配，已收集的遗物不会因卸下而消失。', skip: '暂不拾取',
    equipped: '已装配', stored: '收入收藏', emptyBuild: '战斗后可获得遗物。', safeBuild: '回到营地可调整装配。', safeWardrobe: '回到营地可更换衣装。',
    slots: (n: number, max: number) => `装配 ${n} / ${max}`, takeOff: '卸下', putOn: '装配',
    loadoutIssue: { capacity: '装配已满，先卸下一件遗物。', dependency: '这组搭配缺少触发条件；先调整依赖它的遗物。' },
    received: '小门外传来担架落地的轻响。三娘掀开诊棚的帘子。阿念抱着泡皱的货签坐下，扣子避开伸来的手，自己找了个高处。老白把门闩推回去，低头翻了翻那本没有看的签本。人回来了。',
    waiting: '牢门已开。他们暂时留在安全处，等小门打开、营地接应到位。',
    rescueAlarm: '牢门的锁链惊动了守军。烽火未熄，内堡将多出一队援兵；你仍可以回头截断信号。',
    alarm: '烽火传讯', alarmRaised: '内堡增援已集结', alarmSeconds: (n: number) => `距离传讯 ${n} 秒`,
    endingTitle: '归来的人', ending: '归还的药材堆在诊棚桌上。三娘一份份核对，没有按签上的户名把它们分开。阿念被安排在帘边坐着，有人叫她，她才抬起头。扣子蹲在管架上，伸手试了试新接头；老白仍站在小门边。\n\n这一次，两个人都回来了。可药签照旧按人头发，照旧会过期。檐下的名字依然不在内堡的册子里。门厅之后还有一扇门，古炉仍在变冷。',
    continued: `${JOURNEY_COPY.nextChapter}${JOURNEY_COPY.forthcoming}`, remain: '留在檐下', optional: '根庭仍可探索；营地的人也还有话想说。',
    talk: '交谈', send: '发送', cancel: '停止等待', input: '你想说什么？', player: '你',
    aiUnknown: '这次交谈的结果尚未确认，请先核对并恢复存档。',
    noAi: '请先在小白 OS 设置中配置 AI，再进行自由交谈。',
    aiAuth: 'AI 服务未通过身份验证。',
    aiFailed: 'AI 服务调用失败，未返回错误详情。',
    emptyReply: '这次没有取得有效对白，可查看交谈记录中的原文。', receivedReply: '查看未保存的回复原文',
    contextFull: '当前输入仍超出上下文预算。原记录完整保留，没有调用新的对话回复。',
    memoryFailed: '记忆整理未完成，原记忆与记录未替换。',
    narrativeFailed: '人物资料读取失败，请检查扩展文件是否完整。尚未调用对话模型。',
    dataInvalid: '余火存档不符合当前模型，未覆盖原文件。其他小游戏仍可使用。',
    rebuild: '丢弃旧测试旅程，重新开始', rebuildWarning: '这会清除无法读取的余火旅程和人物记录，不能撤销。不迁移旧剧情；共享钱包与账本中已确认的衣装、奖励权益保留。',
    saveFirst: '先保存当前行动，再继续。', recover: '核对并恢复存档', load: '读取存档', acknowledge: '知道了', noticeTitle: '旅程已暂停',
    controls: 'WASD / 方向键移动 · 空格闪避 · E 交互或技能 · Esc 暂停。靠近敌方警戒区会进入战斗，武器自动攻击。',
    touchControls: '左侧摇杆移动，靠近人物、机关或出口后点右侧交互。战斗中自动攻击，右侧按钮控制闪避和技能。',
    generation: '酒馆正在生成，旅程已暂停。', sound: '音效', renderError: '场景渲染中断。已暂停，请重新载入画面。', reload: '重新载入画面',
    unknownArea: '尚未抵达', here: '所在位置', objective: '当前行程',
    chapterMap: '区域总览', localMap: '当前区域', mapKey: '朱红：当前位置 · 蓝色：已抵达 · 浅色：未探索',
});

const BATTLE_OBJECTIVE: Partial<Record<CourtyardScene, string>> = {
    crossroads: '岔口有巡兵守着。过了这里，正门和水道才走得通。',
    gate: '八斤的盾排开了。冲过去，烽火台就在后头。',
    beacon: '守军护着火盆。别让那堆火烧起来。',
    waterway: '看守蹲在闸门边。把闸抢回来。',
    hall: '门厅守卫守着主闸。药和管件都压在闸后。',
    roots: '荆棘之心在地底下动。地面鼓起来时，往旁边让。',
};
export function campaignObjective(c: Campaign): string {
    const encounter = BATTLE_OBJECTIVE[c.location.scene];
    if (c.phase === 'battle' && encounter) { return encounter; }
    const f = new Set(c.facts);
    if (!f.has('briefed')) { return CAMPAIGN_COPY.beginning; }
    if (f.has('chapter_completed')) { return CAMPAIGN_COPY.optional; }
    if (!f.has('crossroads_cleared')) { return '沿营地北路去外墙岔口。'; }
    if (!f.has('captives_released')) { return '走正门上烽火台，或者下旧水道直奔牢房。'; }
    if (!f.has('postern_opened')) { return '牢房东南角有扇小门，打开它，回营就不用绕。'; }
    if (!f.has('receiving_arranged')) { return '回营找老白，让他把担架摆到小门。'; }
    if (!f.has('captives_arrived')) { return '从小门回营，担架队会把人抬回来。'; }
    if (!f.has('warden_defeated')) { return '去内堡门厅。药和管件压在主闸后头。'; }
    if (!f.has('supplies_secured')) { return '回营，到诊棚东边的货车上点一点还回来的东西。'; }
    return '回三娘那儿，把这趟收尾。';
}
