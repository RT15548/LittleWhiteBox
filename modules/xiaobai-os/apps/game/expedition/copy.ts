import { BOSSES, BOSS_SPECS, RELIC_RULES as R, RULES, WEAPON_LIST } from './content.js';
import type { EncounterKind, EnemyKind, Oath, Outfit, Relic, RouteKind, Weapon } from './types.js';
import { CAMPAIGN_COPY } from './content/campaign-copy.js';
import { JOURNEY_COPY } from './content/journey-copy.js';
import { expeditionFailure } from './failure.js';

const TITLE = ['余烬', '远征'];
export const COPY = {
    titleFirst: TITLE[0], titleSecond: TITLE[1], journey: '远征之路',
    dashKey: '空格', skillKey: 'E', moveKeys: 'W A S D / 方向键', lockedTag: '未解锁',
    unlockReward: (boss: string, reward: string) => `击败${boss}，解锁${reward}`,
    victory: '区域已肃清',
    chapter: (n: number) => `第 ${n + 1} 章`, bossDefeated: (name: string) => `${name}已被击败`,
    equipped: '已装备', noRelics: '击败敌人后，选择你的第一件遗物。',
    nextGoal: (name: string) => `下一位首领 · ${name}`,
    name: CAMPAIGN_COPY.title, category: '冒险', tagline: JOURNEY_COPY.city, entry: '探索 · 战斗 · 人物交谈',
    start: '启程', resume: '继续远征', pause: '暂停', paused: '远征已暂停', continue: '继续战斗',
    preparing: '正在打开远征…', saving: '正在保存', saved: '已保存', retry: '核实并恢复', refresh: '重新读取',
    saveError: '进度尚未确认，远征已暂停。核实保存后继续，不会重新抽取奖励。',
    invalid: '远征数据或操作不合法，未执行。', stale: '进度已经更新，请重新读取。',
    failure: (code: string) => `远征操作未完成${code ? `（${code}）` : ''}，请重新读取后再试。`,
    unavailable: '当前不能继续远征，请等保存或故事回复结束。', locked: '尚未解锁这项选择。',
    presentationError: { rendering: '战场画面无法显示，进度已保留。请重新打开游戏。', sound: '声音启动失败，可关闭声音后继续。' },
    story: '故事正在回复，战斗已暂停。', controls: '移动 WASD / 方向键 · 闪避 空格 · 技能 E · 暂停 Esc',
    touchMove: '移动摇杆', dash: '闪避', skill: '技能', autoAttack: '自动攻击最近的敌人',
    route: '选择路线', reward: '遗物与强化', equipment: '行囊', slots: (n: number) => `${n} / ${RULES.relicSlots} 遗物`,
    replace: '选择要替换的遗物', requiredRelic: '这件遗物是新遗物的触发来源，不能替换。', discard: '放弃奖励', cancel: '取消', confirm: '确认',
    rest: '休整', restDetail: (n: number) => `恢复 ${n} 生命`, shrine: '献祭',
    sacrifice: `献出 ${RULES.sacrificeHp} 生命，换取一件遗物`, merchant: '遗物商人',
    buy: (n: number) => `${n} 碎晶 · 购买`, shards: '碎晶', hp: '生命', leave: '继续前行',
    abandoned: '远征已结束', lost: '远征未完成', won: '王城的钟声再次响起',
    defeat: { fallen: '小白倒下了', beacon: '烽火被摧毁' },
    defeatDetail: { fallen: '生命耗尽，本次远征结束。', beacon: '守护目标的生命耗尽，本次远征结束。' },
    resultDetail: '解锁、发现和已到账奖励永久保留；本局遗物与碎晶不带入下一局。',
    restart: '再次启程', return: '返回营地', abandon: '结束本次远征',
    abandonBody: '放弃当前远征？本局构筑将结束，已经获得的解锁与奖励保留。',
    archive: '远征手记', back: '返回', discoveries: '发现的遗物', history: '最近远征',
    awardHistory: '奖励记录', totalEarned: (n: number) => `历次累计到账 ${n} 小白币`, noAwards: '完成首次成就后，到账记录会留在这里。',
    firstClear: (name: string) => `${name} · 首次击败`, firstMastery: (name: string) => `${name} · 首次通关`, firstOath: (name: string) => `${name} · 首次完成`, firstVictory: '首次完成远征', receipt: '到账编号',
    weapons: '职业', oaths: '难度与挑战', oathsLocked: '首次通关后开放挑战誓约', oathCount: (n: number) => `${n} 项誓约`,
    wardrobe: '时装与衣橱', wardrobeNote: '永久外观，不影响战斗能力', tryOn: '试穿', purchase: '购买', equip: '穿上', owned: '已拥有',
    rotate: '旋转预览', previewAction: '动作预览', nextRunOutfit: '已启程的远征保留原穿搭，新选择在下次启程生效。', buyOutfit: (name: string, price: number) => `花费 ${price} 小白币，永久拥有「${name}」？`,
    coins: (n: number) => `${n} 小白币`, noCoins: '小白币不足', wardrobeBought: '已购买，可在衣橱穿上',
    upgrade: (rank: number) => `强化至 ${rank} 阶`, rank: (rank: number) => `${rank} 阶`, newRelic: '新遗物',
    upgradeHint: '强化保留格子；下一章开放更高阶。', noOffers: '本次没有可选的遗物，可以继续前行。',
    supply: '购买补给', supplyDetail: (heal: number) => `恢复 ${heal} 生命`, normal: '普通远征',
    weaponUnlock: (n: number) => `击败 ${n} 位不同首领后解锁`, reached: (n: number) => `抵达第 ${n + 1} 章`,
    resource: '蓄势', ward: '护盾', achievement: '首胜奖励', ready: '就绪',
    contractPower: '契约之力', resonanceActive: '使魔强化', secondsLeft: (ticks: number) => `${(ticks / RULES.hz).toFixed(1)}秒`,
    wardValue: (n: number) => `护盾 ${Math.ceil(n)}`, guardActive: '格挡中',
    defenseFeedback: { block: '格挡', parry: '完美格挡', 'ward-hit': '护盾吸收', 'ward-break': '护盾破碎' },
    beaconName: '烽火', beaconDanger: '烽火危急', beaconRule: '烽火被摧毁即失败',
    objectiveProgress: (n: number, total: number) => `${Math.floor(n / total * 100)}%`,
    survive: (ticks: number) => `坚守 ${Math.ceil(ticks / RULES.hz)} 秒`,
    reinforcement: (ticks: number) => `增援 ${Math.ceil(ticks / RULES.hz)} 秒`,
    unlockWeapon: (name: string) => `击败${name}后解锁`, unlockCloak: (n: number) => `击败第 ${n} 位首领后解锁`,
    sound: '声音',
    help: '操作', close: '关闭', progress: (zone: string, step: number) => `${zone} · ${step + 1} / ${RULES.zoneSteps}`,
    wave: (n: number, total: number) => `第 ${n} / ${total} 波`, bossPhase: (n: number) => `阶段 ${n}`,
    gold: (n: number) => `本局累计到账 ${n} 小白币`, wallet: (n: number) => `小白币 ${n}`,
    earned: (n: number) => `获得 ${n} 小白币`, newUnlocks: (names: string[]) => `已解锁：${names.join(' · ')}`,
    stats: (kills: number, ticks: number) => `${kills} 击败 · ${Math.floor(ticks / RULES.hz / 60)}:${String(Math.floor(ticks / RULES.hz) % 60).padStart(2, '0')}`,
    journalEmpty: '完成一次远征后，战绩会留在这里。', unknown: '未发现',
    rewardRule: `首领首胜各 ${RULES.firstBossAward} 币 · 首次通关 ${RULES.firstVictoryAward} 币 · 每种武器首次通关 ${RULES.masteryAward} 币 · 每条誓约首次通关 ${RULES.oathAward} 币`,
    checkpoint: '战斗自动保存；意外关闭后，从最近一次已确认进度继续。',
    lootPool: `遗物按职业适配。最多携带 ${RULES.relicSlots} 件，同一遗物能逐章强化至 ${RULES.maxRelicRank} 阶；部分组合需要先获得基础遗物。`,
    mastered: '已通关', unlocked: '已解锁', healthCost: '生命不足，无法献祭', noShards: '碎晶不足',
};
export const ZONE_NAMES = ['风息庭院', '月潮回廊', '日冕王城', '赤铜熔炉', '霜潮遗港', '星隙书库'];
export const OUTFIT_COPY: Record<Outfit, { name: string; detail: string }> = {
    traveler: { name: '晨风旅人', detail: '蓝披风与金线，旅途最初的模样。' }, guardian: { name: '庭院守望', detail: '青绿战甲，重盔上抽出一枝新芽。' },
    moonweaver: { name: '织月祭司', detail: '银月长袍与月角冠，承接回廊的星光。' }, sovereign: { name: '日冕君主', detail: '金冠、绯红披风与王城肩甲。' },
    ranger: { name: '林间游侠', detail: '叶片兜帽、短披肩与斜挎箭袋。' }, paladin: { name: '白昼骑士', detail: '银白全甲，金边战袍与翼形肩饰。' },
    witch: { name: '午夜魔女', detail: '宽檐尖帽、星纹裙摆与随身药瓶。' }, assassin: { name: '绯影行者', detail: '暗色兜帽、绯红面巾与双层短衣。' },
    machinist: { name: '铜翼工匠', detail: '护目镜、皮革长衣与铜制动力背包。' }, beastcaller: { name: '森之契约', detail: '鹿角、叶羽披肩与发光的契约石。' },
    frostbound: { name: '霜海巡礼', detail: '晶冠、雪绒长衣与冰晶背饰。' }, stargazer: { name: '观星使徒', detail: '星环冠、层叠长袍与悬浮的星轨。' },
};
export const WEAPON_COPY: Record<Weapon, { name: string; equipment: string; detail: string; action: string; skill: string }> = {
    blade: { name: '破晓剑士', equipment: '剑与盾', detail: '近身横斩蓄势，三连击打断敌人。', action: '回旋斩', skill: '消耗蓄势重击，同时举盾格挡。接住攻击可回充蓄势，举盾瞬间接招为完美格挡。' },
    bow: { name: '逐风射手', equipment: '弓', detail: '长距离连射；射击时走位减慢。', action: '穿云箭', skill: '五束贯穿箭矢，后撤拉开距离。' },
    staff: { name: '星灯术士', equipment: '法杖', detail: '溅射星弹蓄能；施法时走位较慢。', action: '星落', skill: '消耗蓄能，在敌群中心落下三次冲击。' },
    daggers: { name: '绯影双刃', equipment: '双匕首', detail: '极近距离快攻，在敌人身后寻找破绽。', action: '影袭', skill: '突进目标背后重击，使其短暂易伤。' },
    grimoire: { name: '契约使', equipment: '魔导书', detail: '自动召出使魔缠斗，咒弹积攒契约之力。', action: '共鸣', skill: '恢复在场使魔生命，让所有使魔的伤害与攻速提高，并诅咒目标。契约之力越多，强化越久；期间补召同样生效。' },
    cannon: { name: '机巧炮手', equipment: '手炮', detail: '重炮范围爆破；开火时难以迅速转移。', action: '部署', skill: '放置可承伤的自动炮台，建立火力阵地。' },
};
export const skillDetail = (weapon: Weapon) => `${WEAPON_COPY[weapon].action}：${WEAPON_COPY[weapon].skill}`;
export const ENEMY_NAMES: Record<EnemyKind, string> = {
    keeper: '闸口看守',
    soldier: '失落卫兵', archer: '逐风射手', guard: '重盾守卫', priest: '月灯祭司', charger: '裂角兽',
    stalker: '影爪猎手', bomber: '熔火投弹手', wisp: '游灯',
    warden: '庭院守望者', thornheart: '棘心古树', weaver: '织月者', astrologer: '失明占星师', king: '空冠之王', phoenix: '灰烬不死鸟',
    forgemaster: '赤铜锻主', colossus: '裂炉巨像', frostqueen: '霜镜女王', leviathan: '沉潮巨兽', archivist: '无页典守', voidknight: '折光骑士',
};
export const ENCOUNTER_COPY: Record<EncounterKind, { name: string; detail: string }> = {
    skirmish: { name: '肃清', detail: '击败全部守军' }, pursuit: { name: '追猎', detail: '增援不会等待，尽快击破敌群' },
    siege: { name: '守护烽火', detail: `保护中央烽火，击败守军。${COPY.beaconRule}。` }, ritual: { name: '三重封印', detail: '清开敌人，站入封印逐个解除' },
    survival: { name: '长夜坚守', detail: '留在安全区域，坚守后清除余敌' }, crossfire: { name: '交叉火线', detail: '穿越交错射线，击败守军' },
};
export const ROUTE_COPY: Record<RouteKind, { name: string; detail: string; mark: string }> = {
    battle: { name: '遭遇战', detail: '击败守军 · 遗物与碎晶', mark: '⚔' },
    elite: { name: '精英据点', detail: '强化守军 · 更多碎晶与四选一遗物', mark: '◆' },
    camp: { name: '篝火', detail: '恢复生命 · 无战斗奖励', mark: '♨' },
    shrine: { name: '古老祭坛', detail: '以生命换取遗物', mark: '✧' },
    merchant: { name: '行商', detail: '碎晶强化 · 遗物与补给', mark: '◇' },
    boss: { name: '首领', detail: '赢下这一战，打开下一道城门', mark: '♛' },
};
export const OATH_COPY: Record<Oath, { name: string; detail: string }> = {
    haste: { name: '迅疾', detail: '敌人更快完成蓄力，行动间隔缩短。' },
    scarcity: { name: '孤旅', detail: '篝火恢复减半，首领战后不再恢复生命。' },
    legion: { name: '重围', detail: '每波增援，首领每次转阶段召来护卫。' },
};
export const RELIC_COPY: Record<Relic, { name: string; detail: string; family: string }> = {
    'storm-step': { name: '踏雷靴', detail: '闪避起点留下雷场，每次命中造成雷击。', family: '雷' },
    conductor: { name: '导雷针', detail: '雷击向附近敌人传导。强化增加传导目标。', family: '雷' },
    momentum: { name: '风暴轴心', detail: '雷击命中使闪避冷却缩短；闪避结束释放雷击。', family: '雷' },
    cinder: { name: '余烬', detail: '攻击点燃敌人。强化提高灼烧伤害与持续时间。', family: '火' },
    wildfire: { name: '野火瓶', detail: '燃烧敌人倒下时留下蔓延火场。强化提高范围与伤害。', family: '火' },
    'blood-price': { name: '赤誓', detail: `所有伤害提高，但受到伤害增加 ${Math.round((R.bloodHurt - 1) * 100)}%。强化继续提高输出。`, family: '险' },
    frost: { name: '霜铃', detail: '攻击使敌人减速；首领效果较弱。强化延长冰缓。', family: '霜' },
    shatter: { name: '碎冰棱', detail: '技能命中（炮手为炮台命中）消耗冰缓造成爆发，并炸伤附近敌人。强化提高爆发伤害。', family: '霜' },
    echo: { name: '回声', detail: '周期性追加一次普攻追击。强化提高追击频率。', family: '技' },
    hunter: { name: '猎星镜', detail: `距离超过 ${R.hunterRange} 步的远程命中伤害增加。强化提高远距伤害。`, family: '弓' },
    piercing: { name: '穿心羽', detail: '远程弹体穿透更多敌人；近战攻击范围扩大。强化增加穿透与范围。', family: '锋' },
    orbit: { name: '卫星', detail: '周期性向身边敌人释放雷击。强化提高威力并缩短间隔。', family: '雷' },
    thorns: { name: '荆棘银环', detail: '受伤时反击；格挡反击额外打断敌人。强化提升反击伤害。', family: '守' },
    aegis: { name: '镜盾', detail: '释放技能时生成护盾，并短暂举盾格挡、反射弹体；剑士延长原有格挡。强化增加护盾和格挡时长。', family: '守' },
    siphon: { name: '温血石', detail: `每击败 ${R.siphonEvery} 名敌人恢复生命；击败首领恢复更多。强化增加恢复量。`, family: '生' },
    focus: { name: '澄明', detail: `技能冷却缩短，但普攻间隔延长 ${Math.round((R.focusAttack - 1) * 100)}%。强化进一步缩短技能冷却。`, family: '技' },
    renewal: { name: '归途灯', detail: '取得或强化遗物时恢复生命，击败首领额外恢复。强化增加恢复量。', family: '生' },
    execution: { name: '断章', detail: `对生命低于 ${R.executeThreshold * 100}% 的敌人伤害提高。强化增加斩杀伤害。`, family: '锋' },
    'last-stand': { name: '不灭余火', detail: '每场战斗抵挡一次致命伤，恢复生命并短暂无敌。强化增加救回的生命。', family: '守' },
    quicksilver: { name: '流银扣', detail: '缩短闪避冷却，闪避后的短时间移动更快。强化进一步提速。', family: '技' },
    magnet: { name: '引力核', detail: '敌人倒下时牵引附近敌人，聚拢目标。强化扩大牵引范围。', family: '技' },
    wardstone: { name: '静谧石', detail: '一段时间未受伤便逐渐生成护盾。强化提高护盾上限。', family: '守' },
    pilgrim: { name: '远行针', detail: '持续移动积攒护盾，闪避也计入路程。强化增加获得的护盾。', family: '生' },
    gambit: { name: '孤注筹码', detail: '普攻更强，但受到伤害增加。强化继续提高普攻伤害。', family: '险' },
    riposte: { name: '回敬纹章', detail: '格挡向周围反击；起手完美格挡造成更强的破招反击。强化提高反击强度。', family: '剑' },
    'shield-break': { name: '裂盾楔', detail: '普攻削弱盾卫正面防御，技能使敌人易伤。强化延长易伤。', family: '剑' },
    'cleave-wave': { name: '破晓刃痕', detail: '每次三连击放出贯穿剑气。强化提高剑气伤害。', family: '剑' },
    duelist: { name: '决斗誓印', detail: '普攻造成失衡，打断普通敌人；首领需积累失衡。强化增强破招。', family: '剑' },
    'blood-dance': { name: '绯刃穗', detail: '攻击附加流血。强化提高流血伤害并延长时间。', family: '剑' },
    valor: { name: '无畏徽章', detail: '回旋斩把蓄势化为护盾，蓄势越足护盾越厚。强化提高护盾量。', family: '剑' },
    ricochet: { name: '回旋箭羽', detail: '箭矢命中后向附近新目标弹射。强化增加弹射次数。', family: '弓' },
    'split-arrow': { name: '三叶弦', detail: '每第三次射击追加两枚分裂箭。强化提高分裂箭伤害。', family: '弓' },
    pinning: { name: '缚足箭钉', detail: '箭矢减速，第三箭额外造成失衡。强化延长控制。', family: '弓' },
    'distance-draw': { name: '长风弓环', detail: '距离目标越远，箭矢威力越大。强化提高远距收益。', family: '弓' },
    'hunter-mark': { name: '追猎印记', detail: '穿云箭使命中的目标易伤。强化延长易伤时间。', family: '弓' },
    trapper: { name: '霜网匣', detail: '闪避留下冰霜陷阱，减速并伤害追兵。强化提高陷阱伤害。', family: '弓' },
    nova: { name: '寒星花', detail: '施放星落时在身边爆开冰环，减速并打断围攻者。强化扩大冰环。', family: '杖' },
    inferno: { name: '燃星页', detail: '技能击中燃烧敌人时生成火场。强化提高火场伤害与范围。', family: '杖' },
    fracture: { name: '霜裂冠', detail: '冰缓敌人倒下时迸出冰片，伤害周围敌人。强化增加冰片。', family: '杖' },
    overload: { name: '极昼棱镜', detail: '攻击同时燃烧、冰缓的敌人时消耗两种状态，引发强烈爆发。强化提高爆发伤害。', family: '杖' },
    orbitals: { name: '环星仪', detail: '周期性震击身边敌人并施加冰缓。强化提高范围和伤害。', family: '杖' },
    convergence: { name: '坠星锚', detail: '星落牵引目标周围的敌人，聚拢三次冲击。强化扩大牵引范围。', family: '杖' },
    backstab: { name: '背光刃', detail: '从敌人背后普攻伤害大增并施加易伤。强化提高背击威力。', family: '刃' },
    shadowstep: { name: '留影纱', detail: '影袭留下共同作战的影分身。强化提高分身伤害与持续时间。', family: '刃' },
    hemorrhage: { name: '血月齿', detail: '攻击造成流血。强化提高流血伤害与持续时间。', family: '刃' },
    'execution-chain': { name: '连诛结', detail: '击败敌人返还闪避与技能冷却。强化增加闪避返还。', family: '刃' },
    smoke: { name: '夜幕瓶', detail: '闪避在原地释放烟雾，打断并暴露周围敌人。强化扩大控制范围。', family: '刃' },
    venom: { name: '青毒针', detail: '攻击施加持续毒伤。强化提高毒伤并延长时间。', family: '刃' },
    'pack-bond': { name: '群星契环', detail: '增加同时作战的使魔。每次强化再增加一只。', family: '契' },
    martyr: { name: '归魂铃', detail: '使魔战死爆开冲击并恢复你的生命。强化提高伤害与恢复。', family: '契' },
    covenant: { name: '共生纹', detail: '使魔攻击更强，受到弹幕伤害更少。强化加深共生。', family: '契' },
    frenzy: { name: '猎群牙', detail: '使魔移动与攻击更快。强化提高追猎速度。', family: '契' },
    'soul-harvest': { name: '拾魂灯', detail: '击败敌人回充契约之力。强化提高每次回充。', family: '契' },
    command: { name: '敕令书签', detail: '共鸣在目标处唤出雷场，持续压制敌人。强化扩大雷场并提高伤害。', family: '契' },
    shrapnel: { name: '花火弹壳', detail: '重炮爆炸范围扩大。强化进一步扩大爆破。', family: '炮' },
    minefield: { name: '机雷箱', detail: '闪避留下机雷，追兵靠近后爆炸并造成失衡。强化提高爆炸威力。', family: '炮' },
    overclock: { name: '超频齿轮', detail: '炮台持续更久、射击更快更强；升至二阶可同时部署两座。', family: '炮' },
    bunker: { name: '堡垒铆钉', detail: '部署炮台时获得护盾。强化增加护盾量。', family: '炮' },
    salvage: { name: '拾荒扳手', detail: '炮台击败敌人时缩短部署冷却。强化提高返还。', family: '炮' },
    railgun: { name: '轨道导管', detail: '重炮弹体贯穿敌人，每次命中都能爆炸。强化增加贯穿数量。', family: '炮' },
};
export function errorText(cause: unknown) {
    const { code, message } = expeditionFailure(cause);
    if (code === 'expedition_agent_not_configured') { return CAMPAIGN_COPY.noAi; }
    if (code === 'expedition_agent_auth') { return message || CAMPAIGN_COPY.aiAuth; }
    if (code === 'expedition_agent_failed') { return message || CAMPAIGN_COPY.aiFailed; }
    if (code === 'expedition_context_capacity') { return message || CAMPAIGN_COPY.contextFull; }
    if (code === 'expedition_data_invalid') { return CAMPAIGN_COPY.dataInvalid; }
    if (code === 'expedition_narrative_unavailable') { return CAMPAIGN_COPY.narrativeFailed; }
    if (code.startsWith('expedition_memory_')) { return CAMPAIGN_COPY.memoryFailed; }
    if (code.startsWith('expedition_reply_')) { return CAMPAIGN_COPY.emptyReply; }
    if (code === 'expedition_stale') { return COPY.stale; }
    if (code === 'expedition_locked') { return COPY.locked; }
    if (code === 'expedition_funds') { return COPY.noCoins; }
    if (code === 'expedition_unavailable') { return COPY.unavailable; }
    if (code === 'expedition_invalid' || code === 'expedition_identity') { return COPY.invalid; }
    if (code.startsWith('expedition_save_') || code.startsWith('host_request_')) { return COPY.saveError; }
    return message || COPY.failure(code);
}
export function awardTitle(key: string): string {
    const boss = BOSSES.find(id => BOSS_SPECS[id].awardKey === key);
    if (boss) { return COPY.firstClear(ENEMY_NAMES[boss]); }
    const weapon = WEAPON_LIST.find(id => key === `mastery-${id}`);
    if (weapon) { return COPY.firstMastery(WEAPON_COPY[weapon].name); }
    const oath = (Object.keys(OATH_COPY) as Oath[]).find(id => key === `oath-${id}`);
    if (oath) { return COPY.firstOath(OATH_COPY[oath].name); }
    return COPY.firstVictory;
}
