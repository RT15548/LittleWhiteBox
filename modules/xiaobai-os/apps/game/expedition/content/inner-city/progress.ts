import type { Campaign } from '../../campaign/types.js';
import type { CourtyardFact, CourtyardPerson } from '../world-types.js';
import { PERSON_NAMES } from '../people.js';
import { RESCUE_COMPLETE } from '../chapters.js';

interface PersonalThread {
    person: CourtyardPerson; title: string; accepted: CourtyardFact; resolved: readonly CourtyardFact[];
    invitation: string; steps: readonly { until: CourtyardFact; task: string }[]; conclusion: string;
    coda: { until: CourtyardFact; task: string };
}
export const CITY_THREADS: readonly PersonalThread[] = [
    { person: 'sanniang', title: '她的另一边', accepted: 'wen_visit_agreed', resolved: ['wen_marriage_ended', 'wen_independence_agreed', 'wen_departure_declared', 'wen_private_agreed'],
        invitation: '文家备了席。三娘想带你回去，看看她从前生活的地方。',
        steps: [{ until: 'wen_terms_heard', task: '陪三娘到南街文宅赴席。' }], conclusion: '席上的话可以当面说；南街廊下也有停步的地方，客舍里能私下谈。',
        coda: { until: 'wen_walk_shared', task: '离开文宅后，和三娘在南街廊下停一停。' } },
    { person: 'kouzi', title: '水下的门', accepted: 'deep_route_agreed', resolved: ['deep_route_private', 'deep_route_shared'],
        invitation: '扣子知道一条不用等人开门的路，想带你从那里看看内堡。',
        steps: [{ until: 'deep_gate_opened', task: '从管边小窝下深水道，和扣子一起扳开锈闸。' },
            { until: 'deep_trade_found', task: '看看水道石洞旁新刷的测量线。' }], conclusion: '路就在脚下，和扣子商量以后让谁走。',
        coda: { until: 'kouzi_entered_city', task: '和扣子穿过刚打开的水道出口，去看墙里的灯火。' } },
    { person: 'anian', title: '一起去看看', accepted: 'missing_name_agreed', resolved: ['anian_walk_finished'],
        invitation: '阿念想和你一起逛逛墙里的街面。她还没去过。',
        steps: [{ until: 'anian_street_shared', task: '和阿念去南街看看烤饼摊与风车。' },
            { until: 'anian_walk_finished', task: '工坊街桥洞里有回声，陪她去听听。' }], conclusion: '这段路是你们一起走的。',
        coda: { until: 'anian_home_shared', task: '回檐下时，和阿念在登记桌旁歇歇脚。' } },
    { person: 'laobai', title: '门的另一边', accepted: 'gate_book_agreed', resolved: ['gate_responsibility_taken', 'gate_review_agreed'],
        invitation: '老白约你去南街坐坐。他说有家铺子，熟人不用等水开。',
        steps: [{ until: 'gate_tea_shared', task: '随老白去南街热水铺，认认他的熟人。' },
            { until: 'gate_cases_heard', task: '查验房拦下了借签的人，陪老白去看看。' }], conclusion: '这一次怎么过门，听听老白自己的打算。',
        coda: { until: 'gate_home_shared', task: '事情告一段落，和老白回南街热水铺再坐一碗。' } },
];
export function cityThreads(campaign: Campaign) {
    const facts = new Set(campaign.facts);
    const rescued = RESCUE_COMPLETE.every(f => facts.has(f));
    return CITY_THREADS.flatMap(thread => {
        const accepted = facts.has(thread.accepted), resolved = thread.resolved.some(f => facts.has(f));
        if (!accepted && (!rescued || campaign.relationships[thread.person].highestBand < 4)) { return []; }
        return [{ person: thread.person, name: PERSON_NAMES[thread.person], title: thread.title, accepted, resolved,
            task: resolved ? facts.has(thread.coda.until) ? null : thread.coda.task
                : !accepted ? thread.invitation : thread.steps.find(step => !facts.has(step.until))?.task ?? thread.conclusion }];
    });
}
/** An optional unfinished errand stays visible without replacing Anian's shared outing. */
export function cityWorkerErrand(campaign: Campaign) {
    const facts = new Set(campaign.facts);
    if (!facts.has('missing_name_agreed') || facts.has('worker_result_delivered')) { return null; }
    const task = !facts.has('worker_found') ? '若想打听陈禾，工坊街的寄工住处有人认识他。'
        : !facts.has('worker_record_checked') ? '陈禾的工牌还在，去交接房能核对原始底簿。'
            : !facts.has('worker_record_corrected') ? '凭据已对上，可以请秦芷更正登记，拿回被扣的工钱。'
                : '更正凭单办好了，可以带回寄工住处交给陈禾。';
    return { title: '陈禾的下落', task };
}
export function cityProgress(campaign: Campaign) {
    const facts = new Set(campaign.facts);
    if (facts.has('warmth_seen_home')) { return { phase: 'home', task: '炉边又有了热水。尚未了结的人与事，可以慢慢走下去。' } as const; }
    if (facts.has('heat_restored')) { return { phase: 'restored', task: '回檐下炉边看看恢复的热水，或继续尚未了结的人与事。' } as const; }
    if (!facts.has('heat_notice_read')) { return { phase: 'arrival', task: '分暖站响起试封的铜铃。去热水铺旁看看发生了什么。' } as const; }
    if (!facts.has('pipes_traced')) { return { phase: 'investigate', task: '去工坊街核对管件冲号，查清哨站报损的十二副管件。' } as const; }
    if (!facts.has('return_plan_found')) { return { phase: 'plan', task: '去分暖站检修桌，核对旧回流图与现场管口。' } as const; }
    if (!facts.has('gallery_cleared')) { return { phase: 'gallery', task: '由分暖站进入检修管廊，打通通向闸桥的路。' } as const; }
    if (!facts.has('return_flow_tested') && !facts.has('bridge_cleared')) { return { phase: 'trial', task: '扳开管廊尽头的试流阀，看看这条旧管还能不能送热水。' } as const; }
    if (!facts.has('bridge_cleared')) { return { phase: 'bridge', task: '穿过闸桥，留意泄压线路，别被逼在桥墩之间。' } as const; }
    if (!facts.has('heatkeeper_defeated')) { return { phase: 'valve', task: '夺下回流主闸，给檐下保住一支热源。' } as const; }
    return { phase: 'repair', task: '到主闸后的回流管口接通旧管，再回檐下。' } as const;
}
