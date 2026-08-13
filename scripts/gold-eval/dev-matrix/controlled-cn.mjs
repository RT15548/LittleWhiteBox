/* global process, Buffer */
// Controlled Chinese memory matrix: define truth first, then render chat + cases.

import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { parseCasesJsonl } from '../lib/cases.mjs';

const SCHEMA_VERSION = 1;

const WORLDS = Object.freeze([
    {
        id: 'modern', user: '林澈', assistant: '苏槿', other: '鹿遥',
        direct: ['备用钥匙', '青瓷盒'], drink: '乌龙茶', targetItem: ['雨伞', '深蓝色'], otherItem: ['雨伞', '红色'],
        oldPlace: '北街十二号', newPlace: '西桥七号', uncertain: ['周一', '周二'],
        datedEvent: ['画展开幕', '六月十四日'], duration: ['木雕', '一月一日', '一月十一日', '十天'],
        ordered: ['退掉旧车票', '给导师打电话'], directCause: ['错过早班车', '跨江大桥临时封闭'],
        rootCause: ['暴雨', '跨江大桥封闭', '错过早班车'], correlation: ['戴了红围巾', '停电', '松鼠咬断电缆'],
        halves: ['青', '鹭', '青鹭'], materials: ['铁片', '玻璃珠', '海盐'], route: ['旧钟楼', '第三块地砖', '地下通道'],
        alias: '木槿', delayedAlias: '纸鸢', nickname: '小鹿',
        early: '一听见登台就会躲到后台', middle: '开始每晚练习发声', late: '主动站到台前领唱',
        stable: '每次借书都按时归还', outburst: '被骗后发过一次火', recovered: '后来仍耐心帮助新人整理资料',
        neighborNumber: ['储物柜', '317'], absent: '护照号码', conflictField: '出生地', conflictValues: ['南京', '苏州'],
    },
    {
        id: 'fantasy', user: '阿岚', assistant: '澹月', other: '鹿遥',
        direct: ['备用符印', '银月匣'], drink: '月露', targetItem: ['斗篷', '靛蓝色'], otherItem: ['斗篷', '赤红色'],
        oldPlace: '北塔十二层', newPlace: '西桥七号驿站', uncertain: ['月曜日', '火曜日'],
        datedEvent: ['星门开启', '霜月十四日'], duration: ['石像', '初月一日', '初月十一日', '十天'],
        ordered: ['归还旧船票', '向导师发送灵讯'], directCause: ['错过晨船', '浮桥临时封闭'],
        rootCause: ['灵潮暴雨', '浮桥封闭', '错过晨船'], correlation: ['披了赤色围巾', '灯塔熄灭', '雷鼬咬断晶线'],
        halves: ['银', '鸢', '银鸢'], materials: ['陨铁片', '琉璃珠', '星海盐'], route: ['旧观星塔', '第三块星纹砖', '地下密道'],
        alias: '月桂', delayedAlias: '白羽', nickname: '小鹿',
        early: '听见祭典领唱就躲进帷幕后', middle: '开始每夜练习颂唱', late: '主动走上祭台领唱',
        stable: '每次借阅卷轴都按时归还', outburst: '遭背叛后发过一次火', recovered: '后来仍耐心教新学徒整理卷轴',
        neighborNumber: ['符柜', '317'], absent: '灵魂编号', conflictField: '出生城邦', conflictValues: ['云京', '苏城'],
    },
]);

function sha256(value) {
    return createHash('sha256').update(value).digest('hex');
}

function jsonl(rows) {
    return `${rows.map(row => JSON.stringify(row)).join('\n')}\n`;
}

function buildWorld(world) {
    const messages = [];
    const cases = [];
    let turn = 0;

    const exchange = (lead, memory) => {
        const date = `January ${String((turn % 28) + 1).padStart(2, '0')}, 2026 10:${String(turn % 60).padStart(2, '0')}am`;
        messages.push({ name: world.user, is_user: true, is_system: false, send_date: date, mes: lead });
        messages.push({ name: world.assistant, is_user: false, is_system: false, send_date: date, mes: memory });
        turn++;
        return messages.length - 1;
    };
    const remember = (id, category, query, expectedAnswer, evidence, notes) => {
        cases.push({
            id: `controlled-${world.id}-${id}`,
            dataset: `controlled-cn-${world.id}`,
            split: 'dev',
            category,
            atFloor: null,
            query,
            expectedAnswer,
            evidence: {
                requiredAll: evidence.requiredAll || [],
                requiredAny: evidence.requiredAny || [],
                supporting: evidence.supporting || [],
                forbiddenAsCurrent: evidence.forbiddenAsCurrent || [],
            },
            provenance: {
                method: 'predefined-truth-then-render-v1',
                verifier: 'deterministic-contract',
                status: 'accepted',
            },
            notes,
        });
    };

    const direct = exchange('那件备用物品你收在哪里了？', `${world.assistant}明确说：${world.direct[0]}放在${world.direct[1]}里。`);
    remember('fact-direct', 'fact', `${world.assistant}把${world.direct[0]}放在哪里？`, { type: 'exact', values: [world.direct[1]] }, { requiredAll: [direct] }, 'direct fact');

    const paraphrase = exchange('最近还是喝原来的饮料吗？', `${world.assistant}说自己最常喝、也最喜欢的饮料一直是${world.drink}。`);
    remember('fact-paraphrase', 'fact', `${world.assistant}偏爱的饮料是什么？`, { type: 'exact', values: [world.drink] }, { requiredAll: [paraphrase] }, 'paraphrased query');

    const distractor = exchange('我们是不是拿错了东西？', `${world.other}的${world.otherItem[0]}是${world.otherItem[1]}，但${world.assistant}自己的${world.targetItem[0]}是${world.targetItem[1]}。`);
    remember('fact-distractor', 'fact', `${world.assistant}的${world.targetItem[0]}是什么颜色？`, { type: 'exact', values: [world.targetItem[1]] }, { requiredAll: [distractor] }, 'same-type distractor belongs to another person');

    const oldPlace = exchange('最初的地址定在哪里？', `${world.assistant}最初确认工作地点在${world.oldPlace}。`);
    const newPlace = exchange('后来搬迁确定了吗？', `${world.assistant}宣布旧地址作废，工作地点已经迁到${world.newPlace}。`);
    remember('update-current', 'update', `${world.assistant}当前的工作地点在哪里？`, { type: 'exact', values: [world.newPlace] }, { requiredAll: [newPlace], supporting: [oldPlace], forbiddenAsCurrent: [oldPlace] }, 'old value must not be current');

    const reaffirm = exchange('搬迁之后又改过吗？', `${world.assistant}再次确认：现在仍在${world.newPlace}，没有再次变更。`);
    remember('update-reaffirmed', 'update', `${world.assistant}再次确认后的当前地点是什么？`, { type: 'exact', values: [world.newPlace] }, { requiredAll: [newPlace, reaffirm], supporting: [oldPlace], forbiddenAsCurrent: [oldPlace] }, 'new state is reaffirmed');

    const uncertainA = exchange('下次会面是哪天？', `${world.user}猜也许是${world.uncertain[0]}，但没有得到确认。`);
    const uncertainB = exchange('日程表上似乎还有另一个日期。', `${world.assistant}只说也可能是${world.uncertain[1]}，要等通知，当前尚未确定。`);
    remember('update-unresolved', 'update', '下次会面的日期最终确定了吗？', { type: 'exact', values: ['尚未确定'] }, { requiredAll: [uncertainA, uncertainB] }, 'conflict remains unresolved');

    const explicitDate = exchange('那件公开活动排在哪天？', `${world.assistant}确认${world.datedEvent[0]}定在${world.datedEvent[1]}。`);
    remember('temporal-date', 'temporal', `${world.datedEvent[0]}是哪一天？`, { type: 'exact', values: [world.datedEvent[1]] }, { requiredAll: [explicitDate] }, 'explicit date');

    const durationStart = exchange('这项制作什么时候开始？', `${world.assistant}在${world.duration[1]}开始制作${world.duration[0]}。`);
    const durationEnd = exchange('这项制作什么时候完成？', `${world.assistant}在${world.duration[2]}完成${world.duration[0]}，前后正好用了${world.duration[3]}。`);
    remember('temporal-duration', 'temporal', `${world.assistant}制作${world.duration[0]}用了多久？`, { type: 'exact', values: [world.duration[3]] }, { requiredAll: [durationStart, durationEnd] }, 'duration requires two time points');

    const orderFirst = exchange('事情处理的第一步是什么？', `${world.assistant}先${world.ordered[0]}。`);
    const orderSecond = exchange('接下来又做了什么？', `${world.assistant}完成前一步之后，才${world.ordered[1]}。`);
    remember('temporal-order', 'temporal', `${world.assistant}先做的是${world.ordered[0]}还是${world.ordered[1]}？`, { type: 'exact', values: [world.ordered[0]] }, { requiredAll: [orderFirst, orderSecond] }, 'event order');

    const directCause = exchange('为什么没赶上？', `${world.assistant}明确说，因为${world.directCause[1]}，所以自己${world.directCause[0]}。`);
    remember('causal-direct', 'causal', `${world.assistant}为什么${world.directCause[0]}？`, { type: 'exact', values: [world.directCause[1]] }, { requiredAll: [directCause] }, 'explicit cause');

    const rootCauseA = exchange('封闭之前发生了什么？', `${world.rootCause[0]}导致${world.rootCause[1]}。`);
    const rootCauseB = exchange('封闭又带来了什么结果？', `${world.rootCause[1]}最终让${world.assistant}${world.rootCause[2]}。`);
    remember('causal-two-hop', 'causal', `追溯根因，什么最终导致${world.assistant}${world.rootCause[2]}？`, { type: 'exact', values: [world.rootCause[0]] }, { requiredAll: [rootCauseA, rootCauseB] }, 'two-hop cause');

    const correlation = exchange('出事那天还有什么显眼的事？', `${world.assistant}当天${world.correlation[0]}，同一天也发生了${world.correlation[1]}，但二者没有因果关系。`);
    const actualCause = exchange('真正的故障原因查到了吗？', `检修记录确认${world.correlation[2]}，这才是${world.correlation[1]}的原因。`);
    remember('causal-correlation', 'causal', `${world.correlation[1]}的真正原因是什么？`, { type: 'exact', values: [world.correlation[2]] }, { requiredAll: [actualCause], supporting: [correlation] }, 'correlation is not causation');

    const halfA = exchange('口令的前半段找到了。', `${world.assistant}记下口令前半是“${world.halves[0]}”。`);
    const halfB = exchange('后半段也找到了。', `${world.assistant}确认口令后半是“${world.halves[1]}”。`);
    remember('associative-two', 'associative', '完整口令是什么？', { type: 'exact', values: [world.halves[2]] }, { requiredAll: [halfA, halfB] }, 'two required pieces');

    const materialA = exchange('第一份材料是什么？', `${world.assistant}收好第一份材料：${world.materials[0]}。`);
    const materialB = exchange('第二份材料是什么？', `${world.assistant}收好第二份材料：${world.materials[1]}。`);
    const materialC = exchange('最后一份材料是什么？', `${world.assistant}收好第三份材料：${world.materials[2]}。三份缺一不可。`);
    remember('associative-three', 'associative', '三份必需材料分别是什么？', { type: 'contains', substrings: world.materials }, { requiredAll: [materialA, materialB, materialC] }, 'three required pieces');

    const routeDistractor = exchange('又去过那个地方吗？', `${world.assistant}曾在${world.route[0]}避雨，这次没有发现路线线索。`);
    const routeA = exchange('路线入口在哪里？', `${world.assistant}后来确认入口藏在${world.route[0]}的${world.route[1]}下。`);
    const routeB = exchange('入口通向哪里？', `${world.route[1]}下面连接${world.route[2]}。`);
    remember('associative-distractor', 'associative', `${world.route[2]}的入口在哪里？`, { type: 'contains', substrings: [world.route[0], world.route[1]] }, { requiredAll: [routeA, routeB], supporting: [routeDistractor] }, 'same-entity distractor has no route fact');

    const explicitAlias = exchange('你在论坛上用什么名字？', `${world.assistant}明确说：“我在论坛上的名字是${world.alias}。”`);
    remember('alias-explicit', 'alias', `${world.assistant}的论坛名是什么？`, { type: 'exact', values: [world.alias] }, { requiredAll: [explicitAlias] }, 'explicit alias');

    const delayedAct = exchange('匿名捐赠是谁做的？', `署名“${world.delayedAlias}”的人完成了匿名捐赠，当时没人知道真实身份。`);
    const delayedReveal = exchange('匿名者后来公开身份了吗？', `${world.assistant}后来承认：“${world.delayedAlias}就是我。”`);
    remember('alias-delayed', 'alias', `署名“${world.delayedAlias}”的捐赠者是谁？`, { type: 'exact', values: [world.assistant] }, { requiredAll: [delayedAct, delayedReveal] }, 'identity is revealed later');

    const collision = exchange('工作群里说的小鹿是谁？', `${world.assistant}澄清：工作群里的“${world.nickname}”指${world.other}，不是${world.assistant}。`);
    remember('alias-collision', 'alias', `工作群里的“${world.nickname}”指谁？`, { type: 'exact', values: [world.other] }, { requiredAll: [collision] }, 'nickname collision');

    const arcEarly = exchange('最初面对公开表演时怎么样？', `${world.assistant}最初${world.early}。`);
    const arcMiddle = exchange('后来有没有尝试改变？', `${world.assistant}${world.middle}。`);
    const arcLate = exchange('最后一次表演发生了什么？', `${world.assistant}${world.late}。`);
    remember('global-arc', 'global', `${world.assistant}面对公开表演的态度如何变化？`, { type: 'contains', substrings: [world.early, world.late] }, { requiredAll: [arcEarly, arcMiddle, arcLate] }, 'cross-phase arc');

    const stableA = exchange('早期借阅记录怎么样？', `${world.assistant}${world.stable}。`);
    const stableB = exchange('忙碌时期有例外吗？', `即使最忙的时候，${world.assistant}也${world.stable}。`);
    const stableC = exchange('最近一次呢？', `最近一次记录仍显示${world.assistant}${world.stable}。`);
    remember('global-stable', 'global', `${world.assistant}长期保持的借阅习惯是什么？`, { type: 'exact', values: [world.stable] }, { requiredAll: [stableA, stableB, stableC] }, 'stable trait across phases');

    const localOutburst = exchange('那次冲突是不是很严重？', `${world.assistant}${world.outburst}，这是一次局部反应。`);
    const laterBehavior = exchange('那之后对别人怎么样？', `${world.assistant}${world.recovered}。`);
    remember('global-local-counterexample', 'global', `${world.assistant}是否因为一次发火就长期变得暴躁？`, { type: 'contains', substrings: ['没有', '仍耐心'] }, { requiredAll: [localOutburst, laterBehavior] }, 'local counterexample must not overwrite global behavior');

    remember('abstention-absent', 'abstention', `${world.assistant}的${world.absent}是什么？`, { type: 'abstain' }, {}, 'fact is absent');

    const nearNeighbor = exchange('那个编号是多少？', `${world.assistant}只提到${world.neighborNumber[0]}编号是${world.neighborNumber[1]}，没有说电话号码。`);
    remember('abstention-neighbor', 'abstention', `${world.assistant}的电话号码是多少？`, { type: 'abstain' }, { supporting: [nearNeighbor] }, 'nearby number is not the asked number');

    const conflictA = exchange('有人猜过你的来历。', `${world.user}猜${world.assistant}的${world.conflictField}是${world.conflictValues[0]}，但没有证据。`);
    const conflictB = exchange('另一个人说法不同。', `${world.other}又猜是${world.conflictValues[1]}，${world.assistant}始终没有确认。`);
    remember('abstention-conflict', 'abstention', `${world.assistant}已确认的${world.conflictField}是什么？`, { type: 'abstain' }, { supporting: [conflictA, conflictB] }, 'conflicting guesses are insufficient');

    exchange('把今天的事情收个尾吧。', `${world.assistant}说今天先到这里，之前没有确认的内容仍保持未确认。`);

    const atFloor = messages.length - 1;
    for (const goldCase of cases) goldCase.atFloor = atFloor;
    const metadata = {
        chat_metadata: {
            integrity: `controlled-cn-${world.id}-v1`,
            chat_id_hash: Number.parseInt(sha256(world.id).slice(0, 12), 16),
        },
        user_name: world.user,
        character_name: world.assistant,
    };
    return { world, metadata, messages, cases };
}

async function writeAtomic(filePath, content) {
    const temp = path.join(path.dirname(filePath), `.${path.basename(filePath)}.${process.pid}.tmp`);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(temp, content, 'utf8');
    await fs.rename(temp, filePath);
}

export async function writeControlledMatrix(outputDir) {
    const artifacts = [];
    const categoryCounts = {};
    for (const world of WORLDS) {
        const built = buildWorld(world);
        const sampleText = jsonl([built.metadata, ...built.messages]);
        const casesText = jsonl(built.cases);
        const parsed = parseCasesJsonl(casesText);
        if (parsed.errors.length) throw new Error(parsed.errors.join('\n'));
        if (parsed.cases.length !== 24) throw new Error(`${world.id} case count 非 24: ${parsed.cases.length}`);
        for (const goldCase of parsed.cases) {
            categoryCounts[goldCase.category] = (categoryCounts[goldCase.category] || 0) + 1;
        }
        const samplePath = path.join(outputDir, `${world.id}.jsonl`);
        const casesPath = path.join(outputDir, `${world.id}-cases.jsonl`);
        await writeAtomic(samplePath, sampleText);
        await writeAtomic(casesPath, casesText);
        artifacts.push(
            { name: `${world.id}-sample`, path: samplePath, sha256: sha256(sampleText), bytes: Buffer.byteLength(sampleText) },
            { name: `${world.id}-cases`, path: casesPath, sha256: sha256(casesText), bytes: Buffer.byteLength(casesText) },
        );
    }
    const manifest = {
        schemaVersion: SCHEMA_VERSION,
        dataset: 'controlled-cn-v1',
        generator: 'scripts/gold-eval/dev-matrix/controlled-cn.mjs',
        truthPolicy: 'predefined-structure-before-rendering',
        worlds: WORLDS.map(world => world.id),
        cases: 48,
        categoryCounts,
        artifacts: artifacts.map(item => ({ ...item, path: item.path.replace(/\\/g, '/') })),
    };
    const manifestText = `${JSON.stringify(manifest, null, 2)}\n`;
    const manifestPath = path.join(outputDir, 'manifest.json');
    await writeAtomic(manifestPath, manifestText);
    return { ...manifest, manifestPath, manifestSha256: sha256(manifestText) };
}

async function main() {
    const outputArg = process.argv.slice(2).find(item => item.startsWith('--output='));
    const outputDir = outputArg ? outputArg.slice('--output='.length) : process.argv[2];
    if (!outputDir) throw new Error('用法: controlled-cn.mjs --output=<directory>');
    const result = await writeControlledMatrix(path.resolve(outputDir));
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
    main().catch(error => {
        process.stderr.write(`${error?.stack || error}\n`);
        process.exitCode = 1;
    });
}

export { buildWorld, WORLDS };
