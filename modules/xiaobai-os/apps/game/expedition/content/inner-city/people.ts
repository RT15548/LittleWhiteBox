import type { CourtyardScene } from '../world-types.js';
import type { Clothing } from '../clothing.js';

interface StoryResident {
    name: string; scene: CourtyardScene; anchor: string; coat: 'blue' | 'rose' | 'cream';
    greeting: string; clothing: Clothing;
}
/** Local story participants have conversations, not an affection track or follower state. */
export const STORY_PEOPLE = {
    wenshoutong: { name: '文守桐', scene: 'wen_house', anchor: 'host', coat: 'cream',
        greeting: '我将茶杯往你面前挪了挪，手在杯沿旁停住。\n「路上冷，先暖一暖。来找三娘的事，还是有别的事要同我说？」',
        clothing: { outer: '灰青细呢长衫，内搭米白立领衬衫，袖口熨平', lower: '深灰直筒呢长裤', inner: '本白细棉长袖汗衫', underpants: '本白细棉短平角内裤，侧腰系带', shoes: '黑色系带软皮鞋', socks: '深灰棉线中筒袜' } },
    chenhe: { name: '陈禾', scene: 'workers_lodging', anchor: 'worker', coat: 'blue',
        greeting: '我把针插回线团，拇指按住袖口还没收好的线。\n「找谁？我今天没在工场值班……要查工牌的话，就在铺边。」',
        clothing: { outer: '褪成灰蓝的短工衣，袖口有同色补布', lower: '深褐厚棉工裤，膝部磨白', inner: '本色棉布无袖汗衫', underpants: '灰白棉布短平角内裤，布带腰头', shoes: '旧褐色厚底工作鞋', socks: '深灰棉袜，后跟补过' } },
    qinzhi: { name: '秦芷', scene: 'transfer_office', anchor: 'clerk', coat: 'rose',
        greeting: '我把正抄着的那一行点了个墨记，搁下笔。\n「哪一年的工牌？先说名字，我翻底簿。要改记录，得把原凭据一道摆出来。」',
        clothing: { outer: '灰紫窄袖短袄，米白立领衫，袖口系护袖', lower: '深灰及踝长裙', inner: '本白细棉短背心，前襟小扣', underpants: '本白棉布短平角内裤，松紧腰头', shoes: '黑色一字带布鞋', socks: '浅灰棉线及膝袜' } },
    liangyoufang: { name: '梁有方', scene: 'audit_office', anchor: 'clerk', coat: 'cream',
        greeting: '我翻过门簿，留出桌前空着的一截，抬眼看你。\n「是来补签，还是查旧账？人名和过门的日子，记得多少说多少。」',
        clothing: { outer: '灰褐呢制服外套，内搭白色翻领衬衫', lower: '深褐直筒制服裤', inner: '本白棉布圆领汗衫', underpants: '本白棉布短平角内裤，抽带腰头', shoes: '黑色低帮皮鞋', socks: '深灰细棉中筒袜' } },
    chengtiesheng: { name: '程铁生', scene: 'heat_station', anchor: 'foreman', coat: 'blue',
        greeting: '我拿布擦去指节上的黑油，侧身给你让出看图的位置。\n「别靠那根热管。找管工？我就是。先说哪儿漏，哪儿不热。」',
        clothing: { outer: '靛蓝厚帆布工装，铜扣，袖口卷起', lower: '深蓝宽腿工裤，系牛皮工具腰带', inner: '本白棉布短袖汗衫', underpants: '深灰细棉短平角内裤', shoes: '棕色厚底系带工靴', socks: '灰褐厚棉袜' } },
} as const satisfies Record<string, StoryResident>;
export type StoryPerson = keyof typeof STORY_PEOPLE;
export const STORY_PERSON_IDS = Object.keys(STORY_PEOPLE) as StoryPerson[];
