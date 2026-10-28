/**
 * 通用/匿名角色名过滤：预编译为单一正则，避免每次调用迭代 30+ 个 pattern。
 * 角色学习与上镜锚点共用同一套判定，保证「不给路人建档、不记路人锚点」口径一致。
 */
const GENERIC_NAME_REGEX = new RegExp([
    // 中文通用/匿名
    '(?:^未知)', '(?:^路人)', '(?:^路边)', '(?:^陌生)', '(?:^无名)', '(?:^某[个位])',
    '(?:^女[人性孩][A-Za-z0-9]?$)', '(?:^男[人性孩][A-Za-z0-9]?$)',
    '(?:^少[女男年][A-Za-z0-9]?$)', '(?:^大[叔妈姐哥][A-Za-z0-9]?$)',
    '(?:^老[人头大妇][A-Za-z0-9]?$)',
    '(?:^[女男人]$)',
    '(?:^角色[0-9A-Za-z]*$)', '(?:^人物[0-9A-Za-z]*$)',
    '(?:^配角)', '(?:^(?:NPC|mob))',
    '(?:^[男女][0-9]+$)',
    // 中文关系/职业称呼
    '(?:^[哥姐弟妹]$)',
    '(?:^(?:哥哥|姐姐|弟弟|妹妹|老师|学长|学姐|前辈|老板|店员|医生|护士|主人|奴隶|仆人)$)',
    // 日语称呼
    '(?:^(?:お[兄姉]ちゃん|先輩|先生|マスター|お嬢様|ご主人様)$)',
    // 英文通用
    '(?:^(?:faceless|unnamed|unknown|random|stranger|passerby|bystander))',
    '(?:^(?:girl|boy|woman|man|person|male|female)\\s*[A-Za-z0-9]?$)',
    // 英文关系/职业称呼
    '(?:^(?:teacher|master|boss|doctor|nurse|brother|sister|senpai|sensei)$)',
].join('|'), 'i');

export function isGenericCharacterName(name) {
    if (!name || name.trim().length <= 1) return true;
    return GENERIC_NAME_REGEX.test(name.trim());
}
