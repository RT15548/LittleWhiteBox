import type { Campaign, ConversationTurn } from '../campaign/types.js';
import { isPerson, type Participant } from './participants.js';
import type { Performance } from '../performance/catalog.js';
import { hasReturned } from '../campaign/rescue.js';

type Greeting = { reply: string; performance: Performance };
/** Authored first speech, shared by the visible transcript and model history. */
const GREETINGS: Record<Participant, { initial: Greeting; returned?: Greeting }> = {
    sanniang: { initial: { reply: '我将拆下的绷带放到一旁，抬眼朝你轻轻一笑，伸手示意身边的座位。\n「先坐一坐。檐下不常见生面孔，身上可有哪里不舒服？路上受的凉、磕碰的小伤，都可以同我说。」', performance: { expression: 'smile', gesture: 'gesture' } } },
    laobai: { initial: { reply: '我合上签本，靠着门框朝你挑了挑眉。伤腿刚一使劲，嘴角的笑便顿了一下。\n「生面孔啊。找人，还是找路？找人我倒认得几个，找路嘛……我这条腿，眼下只能给你指指。」', performance: { expression: 'teasing', gesture: 'tilt' } } },
    anian: {
        initial: { reply: '我低头抚平货签翘起的边角，听见动静才抬起脸，愣愣地看着你。\n「嗯？……你不是这里的人。是来接我们的吗？这些货签我还留着，就是泡皱了。」', performance: { expression: 'surprised', gesture: 'tilt' } },
        returned: { reply: '我捏着衣角出神，听见动静才抬起脸，看了你好一会儿。\n「啊……找我吗？有什么事？」', performance: { expression: 'neutral', gesture: 'gesture' } },
    },
    kouzi: {
        initial: { reply: '我蹲在墙边，指尖沿着砖缝探进去。眼前一暗，便皱着眉偏过头。\n「哎，新来的。别站那儿挡光，我正看这道缝呢。……外头现在什么动静？」', performance: { expression: 'serious', gesture: 'tilt' } },
        returned: { reply: '我偏头看你，拍了拍袖口上的灰，目光在你脸上停了一下。\n「哎，找我？有话就说，别吞吞吐吐的。」', performance: { expression: 'neutral', gesture: 'gesture' } },
    },
    bajin: { initial: { reply: '我把盾沿往地上一顿，挺直腰背，摊开手等你递签，说话时特意拖长了腔调。\n「来人止步。此处是哨站正门，往来均须验签。把凭签拿出来，有什么事，一并说清楚。」', performance: { expression: 'neutral', gesture: 'gesture' } } },
    changyounian: { initial: { reply: '我略微侧过头，眯眼打量你，片刻后才慢慢转过身，手搭在火盆边沿。\n「这位，且留步。烽火台不是寻常走动的地方，不知是哪一位放你上来的？若有公事，不妨先说给我听。」', performance: { expression: 'neutral', gesture: 'tilt' } } },
};

export function greetingTurn(campaign: Campaign, person: Participant): ConversationTurn {
    const options = GREETINGS[person];
    const speech = isPerson(person) && hasReturned(campaign.facts, person) && options.returned ? options.returned : options.initial;
    return { id: `greeting-${person}`, kind: 'greeting', player: '', ...structuredClone(speech), action: null,
        scene: campaign.location.scene, facts: [...campaign.knowledge[person]] };
}
export function greet(campaign: Campaign, person: Participant) {
    if (!campaign.conversations[person].length) { campaign.conversations[person].push(greetingTurn(campaign, person)); }
}
