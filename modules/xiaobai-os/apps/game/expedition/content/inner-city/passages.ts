import type { InnerCityFact } from './facts.js';
import type { Participant } from '../participants.js';
import { CITY_COPY } from './copy.js';

export interface CityPassage {
    title: string; body: string; fact: InnerCityFact; witnesses?: readonly Participant[];
    operation?: { setup: string; label: string };
}
export const CITY_PASSAGES = {
    heat_notice: { title: '铁闸响了一声', fact: 'heat_notice_read', body: '告示才贴上，分暖站里便响起试封的铜铃。沿墙伸向檐下的支管震了一下，压力表的针慢慢落到底。热水铺的水龙头却还在冒白气。\n\n有人追问门外怎么办。披着护肩的执闸长停在告示旁，手套上沾着阀油。\n\n「先保册上的。这口炉，不能人人都伸手。」\n\n铃停了。他转身回站里，封支的铁楔还堆在门边。' },
    pipe_receipt: { title: '管件冲号', fact: 'pipes_traced', body: '工场墙边排着十二副冷却管件，封蜡完整，冲号与哨站出库签相同。\n\n收料簿写着：“余存十二副，完好。调南坊分暖站封支工程。”\n\n管口没有冻裂。报给檐下的损耗，成了这里的实收。' },
    return_plan: { title: '图上被抹掉的路', fact: 'return_plan_found', body: '新闸的一道直线，把檐下涂成了灰色。程铁生没看那片灰，手指沿旧管线绕过去，停在闸后。\n\n「这截回水还热。换掉坏接头，就能接出去。不用抢街上正在烧的那口水。」\n\n哨站报损的完好件，恰好够用。他将一只试流阀柄放到图上，手却没有立刻松开。\n\n「封支是执闸长下的令，检修班不准过桥。我带人在这头接，你走通管廊，先试旧阀。表针稳得住，才知道这条路值不值得争。」' },
    return_trial: { title: '旧管里的水声', fact: 'return_flow_tested',
        operation: { setup: '试流阀就在脚边，表针贴着零刻度。闸桥上有人巡守，隔着水声，看不清这里。\n\n程铁生交给你的阀柄正好能卡进去。先试一小股回水，便能知道旧管是否承得住。', label: '扳开试流阀' },
        body: '阀柄转过最涩的半圈，脚下传来一阵低沉的水声。细针冲高，回落，终于停稳。管壁的接缝没有渗水。\n\n桥上传来铁靴声。执闸长看了表，又看向伸出城墙的旧管。\n\n「能流，不等于该给。册上的明冬还缺多少，谁敢保？把桥拦住。」\n\n闸桥的牵引链绷紧了。回水就在脚底，去主闸的路上却挡着人。' },
    wen_table: { title: '她原来的座位', fact: 'wen_terms_heard', witnesses: ['sanniang', 'wenshoutong'], body: '文守桐先把靠里的一张椅子拉开。茶杯的缺口朝墙，鱼腹上的细刺已挑净；做这些时，他没有问三娘一句。\n\n随后才给你添杯，放在桌角的客席。\n\n「芷娘，菜还是照你从前的口味。难得回来，今晚别急着走。」\n\n廊外有人叫了一声太太。漆柜旁搁着尚未拆封的药盒，领用纸上，仍写着文郑氏。门没有关，饭还热着。' },
    wen_walk: { title: '在廊下停一停', fact: 'wen_walk_shared', witnesses: ['sanniang'], body: '文宅门里的碗筷声渐渐远了。南街廊柱挡住风，灯光从纸罩里漏下来，在两个人脚边落成一小片暖色。\n\n隔壁铺面正在收摊，偶尔有人拎着水壶经过。这里没有那张饭桌，也没有为谁预先摆好的座位。\n\n回檐下的路还长。可以先在这里，和她说一会儿话。' },
    deep_gate: { title: '锈闸两边', fact: 'deep_gate_opened', witnesses: ['kouzi'],
        operation: { setup: '锈闸把墙里的灯火切成细条。下层绞柄一松手就回弹，上层的扣销又够不着。\n\n扣子试了试管架，回头看你。\n\n「我上去拔销。你压下面那个，等我过去了再松。一个人还真弄不开这破东西。」', label: '替她压住绞柄' },
        body: '你压下绞柄。扣子踩着管架侧身过去，鞋尖点过两处扣缝，攀到闸顶。\n\n扣销脱出的刹那，柄猛地往掌心一撞。上面传来一声短促的「稳住」，随即是铁链咬进齿槽的脆响。\n\n闸板擦着石槽升起，灯火沿水面照了进来。扣子从管架上落回你身旁，手里还拎着那根碍事的销子。\n\n「好了。现在谁也别想把咱们关在外头。」' },
    deep_receipt: { title: '有人走过她的路', fact: 'deep_trade_found', witnesses: ['kouzi'], body: '石洞里还有旧药瓶和换下的铜环。收条被水泡透了，背面几笔价钱却认得出。\n\n新的白色测量线越过石洞，连她带人绕开哨站的那处暗弯也标了。画线的人不是从大门进来的。\n\n前面是封堵班留下的铁楔，后面是两人刚走过的路。扣子的扳手碰到管壁，轻轻响了一下。' },
    anian_street: { title: '街口的风车', fact: 'anian_street_shared', witnesses: ['anian'], body: '烤饼摊的油纸一展开，芝麻香就追了过来。隔壁挂着一排薄铜片风车，小贩拨动其中一只，整排都细细地响。\n\n阿念停在架子前，看一只转慢了，伸手又拨一下。檐下每天登记的那扇门，原来里面还有这些东西。\n\n街上不缺赶路的人。此刻却没人催你们往前走。' },
    anian_bridge: { title: '桥洞里有回声', fact: 'anian_walk_finished', witnesses: ['anian'],
        operation: { setup: '工坊的锤声在桥洞里拐了个弯。阿念往栏外探了探，短短地「喂」了一声；隔了一息，桥下竟也回了她一声。\n\n她眼睛一下亮起来，又往旁边让出半步。\n\n「你也试试。往这边！」', label: '和她试试回声' },
        body: '你的声音落进桥洞，还没传回来，阿念就抢着又喊了一声。两个尾音撞在一起，她自己先笑出了声。\n\n「哎，你等它说完呀。」\n\n她说完才想起是谁先抢的，笑得伏在栏杆上，半天没直起腰。水面映着碎灯，锤声仍从街那头传来。这一次，她没有急着跟上赶路的人。' },
    anian_home: { title: '废签背面的小地图', fact: 'anian_home_shared', witnesses: ['anian'], body: '登记桌还是出门时那张。阿念坐下，把一张写废的签翻过来，先画了一个圆，又在旁边添上一道弯。\n\n「饼。桥。这个……风车怎么画？」\n\n铜片被她画成了几根歪杈，自己看了一会儿，也没擦。她把纸往你这边推了推，给你腾出桌角。\n\n「下回走这儿。我认得了。」\n\n街名和门牌都没写对，那两个地方倒挨得很近。她没有把这张纸夹进替别人记名的簿子，就留在了手边。' },
    gate_tea: { title: '老白的旧碗', fact: 'gate_tea_shared', witnesses: ['laobai'], body: '还没坐稳，掌柜便从炉边拎出一只豁口碗，往老白面前一推。\n\n「你的，赔不起新的。上回帮我看铺，茶钱没收几文，倒把客人都聊走了。」\n\n老白啧了一声，把碗转了半圈，让缺口背过去。掌柜又添一只完好的放到你手边，没问你从哪来。\n\n靠墙有张空凳，墙缝不漏风。这地方，他确实熟。' },
    gate_home: { title: '再坐一碗', fact: 'gate_home_shared', witnesses: ['laobai'], body: '查验房的门在身后合上。这一回，借签的人先走了，老白也终于能把一直夹在腋下的簿子放下来。\n\n热水铺的炉没熄。掌柜抬眼看了看，没追问，往两只碗里续上水。\n\n老白拉开先前那张凳子。街面还是那条街，坐在这里，却不只是来认个门路了。' },
    worker_bunk: { title: '点名声里的陈禾', fact: 'worker_found', witnesses: ['anian', 'chenhe'], body: '门外的点工铃响了。陈禾把针插回线团，拿起工牌走到门口；来点名的人看了一眼册子，让他去补昨夜那班。\n\n「又补？我家里的信呢？」\n\n册子上没有陈禾这个名字，只有挂着旧债的工号。他还在这里做工，外面的登记却说他早已遣返。被扣的工钱、送不出的信，都卡在同一个错字后面。\n\n他看向阿念，停了一下，没把工牌收回去。' },
    transfer_record: { title: '交接房底簿', fact: 'worker_record_checked', witnesses: ['anian', 'qinzhi'], body: '秦芷把原始交接簿摊在阿念面前：陈禾留用，旁边压着当日工牌的拓印。后来抄入遣返册时，名字落进了隔行。\n\n扣薪凭单上的债额都沿用了那条遣返登记，没有另一份借据。秦芷将更正页移到桌前，留出经手人说明的空处。陈禾还在寄工住处等消息。' },
    worker_result: { title: '把凭单交还陈禾', fact: 'worker_result_delivered', witnesses: ['anian', 'chenhe'], body: '陈禾把更正凭单看了两遍，拇指压住自己的名字。新签和退回的工钱放进同一只旧布袋，他把袋口系得很紧。\n\n「这回信能送出去了。」\n\n他没急着走，先把原来写废的那封信找了出来。阿念站在铺边，门外的街声一阵阵进来。还想说什么，可以就在这里说；想回街上走走，门也开着。' },
    gate_cases: { title: '这次谁先过门', fact: 'gate_cases_heard', witnesses: ['laobai', 'liangyoufang'], body: '查验房里坐满了人，药包、空水壶、换下来的工衣堆在脚边。梁有方把门簿翻到折角处，指尖停在老白的记号上。\n\n「这些签不是他们本人的。过门的人都追偿，还是经手的人留下说清？」\n\n有人抬头认出了老白。也有人把脸转了过去。\n\n梁有方将椅子往桌前推了推。老白可以留下担下自行放行的责任，让门外另找人轮值；也可以具名复核，把每一笔过门的缘由说清。两条路，都能先让这些人离开。' },
    gate_allowed: { title: '热水铺的旧签', fact: 'gate_allowed_seen', witnesses: ['laobai'], body: '热水铺掌柜将水壶拎离火口，从柜底取出一只空药包。旧门签夹在包纸里，边角已经磨软。\n\n“那晚你让我过门，我记得。家里的药，就差那几日。”\n\n掌柜给老白也倒了水。簿上一笔越例放行，在这里是烧水、守铺、还在过日子的一家人。' },
    gate_refused: { title: '补鞋人的手', fact: 'gate_refused_seen', witnesses: ['laobai'], body: '通铺边的老人用左手压着鞋底，右手夹针时，少掉的两根手指露了出来。门簿写他那夜证签不合，遣回。\n\n“那时我是去拿药。你说放我进去，你要担事。我就回去了。”\n\n他没有停下针。如今寄工住处一双补好的鞋，能抵一顿饭钱。老白站在他仍然需要借住的床铺前。' },
    heat_return: { title: '把火送回去', fact: 'heat_restored',
        operation: { setup: '执闸长留下的锁链松在脚边，通向檐下的管口仍然冰凉。闸轮已经没人看守。\n\n分暖站那头传来三下敲管声。程铁生的工班等在那里，接头已备好，就差你这边开闸。', label: '接通檐下回水' },
        body: '阀轮一圈圈转开，第一股锈水冲进沟里，随后是清水、白气，和越来越响的管鸣。\n\n三下敲击沿铜管传了回来。另一头的工班收到了水。\n\n压力表的针停稳，没有再落下去。沿墙伸向檐下的那根铜管，重新热了起来。\n\n回去的路已经通了。炉边那些空着的壶，该能装满了。' },
    camp_heat: { title: CITY_COPY.campHeatTitle, fact: 'warmth_seen_home', body: CITY_COPY.campHeat },
} as const satisfies Record<string, CityPassage>;
export type CityPassageId = keyof typeof CITY_PASSAGES;
