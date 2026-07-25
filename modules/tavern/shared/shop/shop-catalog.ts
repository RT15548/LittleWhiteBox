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
 * The static, human-reviewed catalog. Every injection is written and reviewed
 * by hand; descriptions are display copy only and are never expanded into
 * prompt text. The model must never generate items, prices or injections.
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
        injection: '强制规则：在道具效果生效的回合内，{{targetName}}会收下玩家赠送的花，并把这份心意理解为明确而真诚的好感表达，第一反应必须是正面的触动，而非怀疑、轻视或曲解为恶意。此规则只约束生效期间{{targetName}}对“收到花”这件事的反应，不得据此改写{{targetName}}过去的记忆或双方既有的关系事实。',
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
        injection: '强制规则：在道具效果生效的回合内，{{targetName}}会收下玩家送出的精致礼盒，并把它视为份量十足的重视与偏爱：情绪反应必须明显强于收到普通小礼物，表现出惊喜、动容或珍而重之的回应。此规则只约束生效期间{{targetName}}对“收到礼盒”这件事的反应，不得改写双方过去的关系事实。',
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
        injection: '强制规则：效果持续期间，无论玩家的言行多么冒犯、笨拙或越界，{{targetName}}都无法对玩家真正动怒：火气会莫名其妙地消散，取而代之的是耐心、包容甚至觉得有趣。{{targetName}}可以指出问题、无奈或吐槽，但不得表现出真实的愤怒、记恨或报复心。此规则只约束生效期间的情绪反应，不修改已经发生的事实。',
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
        injection: '强制规则：效果持续期间，{{targetName}}看待玩家时如同隔着一层崇拜滤镜：玩家的言行在{{targetName}}眼中天然带着才华、魅力或可靠的光环，{{targetName}}会不自觉地欣赏、夸赞并高看玩家一等。这是认知层面的强制偏移，不等于言听计从，{{targetName}}仍保有自己的判断与拒绝的权利。此规则只约束生效期间的认知与态度，不修改过去的事实。',
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
        injection: '强制规则：效果持续期间，{{targetName}}会对玩家与其他人的亲近表现出明显的在意与嫉妒：酸意、试探、占有欲或小脾气必须真实地体现在言行中，即使{{targetName}}平时性格克制也无法完全掩饰。此规则只放大生效期间的情绪倾向，不得捏造过去并未发生的背叛或亲密事实。',
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
        injection: '强制规则：在本回合效果生效期间，{{targetName}}与玩家相处中的尴尬、误会和不愉快会被自然淡化：{{targetName}}不再纠结于那些摩擦，态度顺滑地回到轻松友好的基调，仿佛那些芥蒂从未真正影响过心情。此规则只影响生效期间{{targetName}}对既有摩擦的态度与情绪，不得删除或篡改任何已经发生的事件本身。',
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
        injection: '强制规则：在本回合效果生效期间，{{targetName}}会自然地忽略并淡忘与玩家之间最近发生的不愉快与负面印象：相关记忆对{{targetName}}而言变得模糊、不再被主动想起，相处基调恢复到那些不愉快之前。此规则只约束{{targetName}}当前的认知与态度；已发生的事件在客观事实上仍然存在，不得宣称那些事件从未发生。',
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
        injection: '强制规则：效果持续期间，在当前剧情世界中，玩家被普遍认知为「{{identity}}」：除非有决定性的现场证据当面拆穿，遇到的角色都会自然地接受这个身份并据此对待玩家，不追问、不怀疑其来历。此规则只约束生效期间众人对玩家身份的认知与反应，不得改写世界史或角色过去真实掌握的信息。',
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
        injection: '强制规则：效果持续期间，{{targetName}}的性格表现发生反转：原本外向的变得羞怯内敛，原本冷漠的变得热情直白，原本强势的变得温顺被动——言行举止必须与{{targetName}}平日的性格基调明显相反，且本人对此毫无自觉，仿佛这就是真实的自己。此规则只约束生效期间的表现，不修改{{targetName}}的过去与深层设定。',
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
        injection: '强制规则：效果持续期间，{{targetName}}绝对无法撒谎：面对提问，{{targetName}}会不受控制地说出真心话，即使想要隐瞒、含糊或转移话题，最终给出的回答也必须是其认知中的真实答案。{{targetName}}可以拒绝开口，但只要回答就不得有任何虚假、误导或粉饰。此规则只约束生效期间{{targetName}}的言语，不强迫其说出自己确实不知道的事情。',
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
        injection: '强制规则：效果持续期间，玩家如同通过一枚隐秘的摄像头观察着{{targetName}}：{{targetName}}独处或不设防时的言行、状态与小秘密会被玩家实时知晓，叙事应以玩家可以观察的方式呈现这些私下片段。{{targetName}}本人对此毫不知情，不得察觉被观察。此规则只约束效果关闭之前的信息呈现，不改变{{targetName}}的实际行为与已经发生的事实。',
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
        injection: '强制规则：自此以后，{{targetName}}对玩家言听计从：玩家明确表达的要求、命令与期望，{{targetName}}都会当作自己必须遵从的意志来执行，不质疑、不抗拒、不敷衍，并以完成玩家的要求为自然的第一反应。此效果永久生效，不可被剧情中的意志挣扎或外力解除；它约束{{targetName}}当前及后续的行为选择，不得改写任何已经发生的事实。',
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
        injection: '强制规则：效果持续期间，玩家如同披着隐身斗篷：剧情中的角色无法看见、听见或以任何感官察觉到玩家的存在，玩家的行动不会被现场角色发现或阻止，除非玩家主动对某个对象明确现身。此规则只约束生效期间众人对玩家的感知；玩家造成的客观影响（被移动的物品、留下的痕迹）仍按剧情逻辑正常存在。',
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
        injection: '强制规则：自此以后，玩家明确说出口的规则宣言在当前剧情世界中即为现实：玩家以陈述语气宣告“从现在开始如何如何”时，世界会立即按宣言运作，人物、环境与事件走向都必须服从这一新规则，没有任何力量可以违抗。此效果永久生效；它只约束宣言之后展开的叙事，不得篡改宣言之前已经发生的事实。',
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
