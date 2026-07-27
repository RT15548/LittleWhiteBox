import {
    throwTavernShopError,
    type TavernShopInputDefinition,
    type TavernShopItem,
} from './shop-types';

const TARGET_NAME_INPUT: TavernShopInputDefinition = {
    key: 'targetName',
    label: '目标人物',
    placeholder: '输入对方的名字',
    required: true,
    maxLength: 40,
};

const IDENTITY_INPUT: TavernShopInputDefinition = {
    key: 'identity',
    label: '指定身份',
    placeholder: '例如：邻国王子的旧友',
    required: true,
    maxLength: 60,
};

const OBSERVER_INPUT: TavernShopInputDefinition = {
    ...TARGET_NAME_INPUT,
    label: '观察对象',
    placeholder: '输入要观察的对象',
};

/**
 * The static, human-reviewed catalog. Every narrative template is written and
 * reviewed by hand; descriptions are display copy only and are never expanded
 * into prompt text. The model must never generate items, prices or injections.
 */
export const TAVERN_SHOP_CATALOG: readonly TavernShopItem[] = Object.freeze([
    {
        id: 'flower',
        name: '花',
        icon: 'local_florist',
        category: 'emotion',
        price: 50,
        description: '一束新鲜的花。生效的一回合内，目标会正面接收你的心意。',
        duration: { kind: 'turns', rounds: 1 },
        inputs: [TARGET_NAME_INPUT],
        stacking: 'per-parameters',
        narration: 'event',
        injection: '玩家此刻将一束花递给[[targetName]]。[[targetName]]的第一反应必须是被这份心意正面触动——收下，并理解为真诚的好感，而不是怀疑、轻视或曲解。这是刚发生的赠花，只影响此刻起的反应，不改写两人过去的关系。',
    },
    {
        id: 'gift-box',
        name: '精致礼盒',
        icon: 'card_giftcard',
        category: 'emotion',
        price: 120,
        description: '包装讲究的礼盒。生效的一回合内，目标会感受到十足的重视。',
        duration: { kind: 'turns', rounds: 1 },
        inputs: [TARGET_NAME_INPUT],
        stacking: 'per-parameters',
        narration: 'event',
        injection: '玩家此刻将一只精致礼盒递给[[targetName]]。[[targetName]]会收下它，并清楚感到自己受到郑重的重视与偏爱；第一反应必须明显强于收到普通小礼物，表现出惊喜、动容或珍而重之。这是刚发生的赠礼，只影响此刻起的反应，不改写两人过去的关系。',
    },
    {
        id: 'no-anger-sticker',
        name: '不生气贴纸',
        icon: 'sentiment_satisfied',
        category: 'emotion',
        price: 80,
        description: '贴上后，目标五回合内对你生不起气。',
        duration: { kind: 'turns', rounds: 5 },
        inputs: [TARGET_NAME_INPUT],
        stacking: 'per-parameters',
        injection: '接下来几拍，无论玩家的言行多么冒犯、笨拙或越界，[[targetName]]都无法对玩家真正动怒：火气会自然消散，取而代之的是耐心、包容，甚至觉得有趣。[[targetName]]仍可以指出问题、无奈或吐槽，但不会真实地愤怒、记恨或报复。这只改变当前的情绪反应，不修改已经发生的事实。',
    },
    {
        id: 'worship-filter',
        name: '崇拜滤镜',
        icon: 'star',
        category: 'emotion',
        price: 200,
        description: '五回合内，目标看你的眼神自带崇拜光环。',
        duration: { kind: 'turns', rounds: 5 },
        inputs: [TARGET_NAME_INPUT],
        stacking: 'per-parameters',
        injection: '接下来几拍，[[targetName]]看玩家时始终隔着一层崇拜滤镜：会不自觉地欣赏、高看、夸赞玩家，觉得玩家的言行带着才华、魅力或可靠的光环，但仍保有自己的判断与拒绝权。这是当前的认知偏移，不改写过去的事实。',
    },
    {
        id: 'jealousy-seed',
        name: '嫉妒种子',
        icon: 'eco',
        category: 'emotion',
        price: 300,
        description: '五回合内，目标会明显在意你与他人的亲近。',
        duration: { kind: 'turns', rounds: 5 },
        inputs: [TARGET_NAME_INPUT],
        stacking: 'per-parameters',
        injection: '接下来几拍，[[targetName]]会明显在意玩家与其他人的亲近，酸意、试探、占有欲或想夺回注意力的小脾气会真实地流露出来，即使平时性格克制也无法完全掩饰。这只放大当前的情绪倾向，不捏造过去并未发生的背叛或亲密事实。',
    },
    {
        id: 'memory-smoother',
        name: '记忆顺滑剂',
        icon: 'healing',
        category: 'memory',
        price: 100,
        description: '一回合内，目标与你不愉快的摩擦被顺滑淡化。',
        duration: { kind: 'turns', rounds: 1 },
        inputs: [TARGET_NAME_INPUT],
        stacking: 'per-parameters',
        injection: '此刻，[[targetName]]与玩家相处中的尴尬、误会和不愉快被自然淡化，不再纠结于那些摩擦，态度顺滑地回到轻松友好的基调。已经发生的事件仍然存在，只是[[targetName]]当前不再让那些芥蒂左右心情。',
    },
    {
        id: 'memory-eraser',
        name: '记忆橡皮擦',
        icon: 'ink_eraser',
        category: 'memory',
        price: 300,
        description: '一回合内，目标淡忘最近与你的负面记忆。',
        duration: { kind: 'turns', rounds: 1 },
        inputs: [TARGET_NAME_INPUT],
        stacking: 'per-parameters',
        injection: '此刻，[[targetName]]与玩家最近发生的不愉快及其留下的负面印象变得模糊，不再被主动想起，相处基调恢复到那些不愉快之前。相关事件在客观事实上仍然存在，只是[[targetName]]当前无法清晰回忆。',
    },
    {
        id: 'identity-card',
        name: '身份卡',
        icon: 'badge',
        category: 'scene',
        price: 500,
        description: '十回合内，全世界都认定你是你指定的那个人。',
        duration: { kind: 'turns', rounds: 10 },
        inputs: [IDENTITY_INPUT],
        stacking: 'global-single',
        injection: '接下来几拍，当前剧情世界中的人物都会把玩家认作[[identity]]，自然地接受这个身份并据此对待玩家，不追问、不怀疑来历；只有决定性的现场证据才能当面拆穿。这改变的是当前的身份认知与反应，不改写世界史或人物过去真实掌握的信息。',
    },
    {
        id: 'personality-reversal',
        name: '反转贴纸',
        icon: 'theater_comedy',
        category: 'behavior',
        price: 250,
        description: '五回合内，目标的性格表现彻底反转。',
        duration: { kind: 'turns', rounds: 5 },
        inputs: [TARGET_NAME_INPUT],
        stacking: 'per-parameters',
        injection: '接下来几拍，[[targetName]]的性格表现完全反转：外向会变得羞怯内敛，冷漠会变得热情直白，强势会变得温顺被动；言行必须与平日的性格基调明显相反，而且[[targetName]]对此毫无自觉。这只改变当前的表达与行为，不修改过去和深层设定。',
    },
    {
        id: 'truth-serum',
        name: '吐真剂',
        icon: 'lab_research',
        category: 'information',
        price: 500,
        description: '三回合内，目标开口必说真话。',
        duration: { kind: 'turns', rounds: 3 },
        inputs: [TARGET_NAME_INPUT],
        stacking: 'per-parameters',
        injection: '接下来几拍，[[targetName]]绝对无法撒谎：面对提问，即使想要隐瞒、含糊或转移话题，最终给出的回答也必须是自己认知中的真实答案。[[targetName]]可以拒绝开口，但只要回答就不能虚假、误导或粉饰，也不会凭空知道自己原本不知道的事情。',
    },
    {
        id: 'privacy-camera',
        name: '隐私摄像头',
        icon: 'photo_camera',
        category: 'information',
        price: 300,
        description: '手动关闭前，你可以暗中观察目标的一举一动。',
        duration: { kind: 'manual' },
        inputs: [OBSERVER_INPUT],
        stacking: 'per-parameters',
        injection: '玩家正通过一枚隐秘的摄像头持续观察[[targetName]]。[[targetName]]独处或不设防时的言行、状态与小秘密都应以玩家能够看到的方式呈现，而[[targetName]]对此毫不知情，也不会察觉自己正在被观察。这改变的是信息呈现，不改变实际行为和已经发生的事实。',
    },
    {
        id: 'absolute-obedience',
        name: '言听计从',
        icon: 'handshake',
        category: 'ultimate',
        price: 1200,
        description: '永久生效：目标从此对你言听计从。',
        duration: { kind: 'permanent' },
        inputs: [TARGET_NAME_INPUT],
        stacking: 'per-parameters',
        injection: '从现在起，[[targetName]]对玩家言听计从：玩家明确表达的要求、命令与期望，[[targetName]]都会当作自己必须遵从的意志来执行，不质疑、不抗拒、不敷衍，并以完成玩家的要求为自然的第一反应。这改变此后的行为选择，不改写任何已经发生的事实。',
    },
    {
        id: 'invisibility-cloak',
        name: '隐身斗篷',
        icon: 'visibility_off',
        category: 'scene',
        price: 300,
        description: '五回合内，没有人能感知到你的存在。',
        duration: { kind: 'turns', rounds: 5 },
        inputs: [],
        stacking: 'global-single',
        injection: '接下来几拍，玩家如同披着隐身斗篷：剧情中的人物无法看见、听见或以任何感官察觉玩家，玩家的行动也不会被现场人物发现或阻止，除非玩家主动明确现身。玩家造成的客观影响，例如移动物品或留下痕迹，仍按剧情逻辑存在。',
    },
    {
        id: 'reality-decree',
        name: '言出法随',
        icon: 'gavel',
        category: 'ultimate',
        price: 2000,
        description: '限购一次，永久生效：你宣告的规则即世界法则。',
        duration: { kind: 'permanent' },
        inputs: [],
        stacking: 'global-single',
        purchaseLimit: 1,
        injection: '从现在起，玩家明确说出口的规则宣言会直接成为当前剧情世界的现实：当玩家以陈述语气宣告一条新规则，世界立即按宣言运作，人物、环境与事件走向都必须服从，没有任何力量可以违抗。宣言只改变此后展开的叙事，不篡改宣言之前已经发生的事实。',
    },
]);

const catalogById = new Map<string, TavernShopItem>(TAVERN_SHOP_CATALOG.map((item) => [item.id, item]));

export function getTavernShopItem(itemId = ''): TavernShopItem {
    const id = String(itemId || '').trim();
    const item = id ? catalogById.get(id) : undefined;
    if (!id) {throwTavernShopError('shop_item_id_required');}
    if (!item) {throwTavernShopError('shop_item_missing', id);}
    return item;
}

export function findTavernShopItem(itemId = ''): TavernShopItem | null {
    const id = String(itemId || '').trim();
    return id ? catalogById.get(id) || null : null;
}

export function listTavernShopCatalog(): readonly TavernShopItem[] {
    return TAVERN_SHOP_CATALOG;
}
