import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeCharacterLibrary } from '../character-library.js';
import { detectPresentCharacters } from '../present-characters.js';
import { buildContinuityBlockForRequest } from '../character-continuity.js';
import { createSubmitScenePlanTool, getScenePlanCharacterProperties } from '../scene-plan-tool.js';

// Acceptance contracts (cost: a character who took clothes off keeps being drawn in the old outfit):
// - The continuity block tells the planner to build on the remembered costume (keep it unless the body text changes it),
//   not to stack the clothing reference on top of it, and that a costume without clothes means "not wearing".
// - The costume field description holds the non-momentary state, including how taking clothes off is written (topless, bare chest),
//   while the action field is only for momentary things (anything that stays on the body goes to costume).
// - "Not wearing" is written into costume (not only action): in replay, a 'topless' costume replaces the remembered robe in the next block.

const SI = { id: 'c1', name: '司盈昃', aliases: ['渔行歌'], type: 'boy', appearance: 'tall man', outfits: [{ name: '灰袍', tags: 'grey robe' }] };
const present = text => detectPresentCharacters(text, normalizeCharacterLibrary({ characters: [SI], groups: [] }).characters);
const snapshot = (timestamp, costume) => ({ timestamp, continuityChars: [{ name: '司盈昃', form: '', appear: '', costume }] });

test('continuity block says that taking clothes off beats the remembered outfit', () => {
    const text = '渔行歌站在窗前。';
    const block = buildContinuityBlockForRequest({ records: [snapshot(1, 'grey robe')], presentCharacters: present(text), bodyText: text });
    assert.match(block, /着装优先级：正文写的穿搭 > 这里的 costume > 服装参考、世界书、数据表、角色卡里的穿搭描述/);
    assert.match(block, /正文没写变化时，这里的 costume 就是本图的起点，照抄它；正文写了变化才按正文改/);
    assert.match(block, /这里已经包含了服装参考里的衣物，不要再叠加一份参考/);
    assert.match(block, /只要本图正文出现穿上、换上、系好、套上、戴上、脱下、解开、拉开等着装变化，就必须显式写出这一刻的完整 costume/);
    assert.match(block, /世界书、数据表、角色卡里的穿搭描述不是本图发生的变化，不能拿来推翻这里的 costume/);
    assert.match(block, /costume 里没有衣服（只剩身体部件、非人特征或配饰，或写“（空＝没穿）”）的，上一张图里就是没穿衣服；这是正常状态，不是空字段/);
    assert.match(block, /形态和这里的 form 不同（例如兽形化成人形，男性变成女性），不要照抄这里的 costume/);
    assert.match(block, /正文写了穿什么就穿什么，没写就按该形态的服装参考自己挑/);
    assert.ok(!block.includes('这里只列衣服'), 'the block no longer claims it only lists clothes');
});

test('costume holds the non-momentary state (no clothes = not wearing), action only the momentary one', () => {
    const { costume, action } = getScenePlanCharacterProperties();
    assert.match(costume.description, /^持续状态：.*衣着及其穿戴状态.*身体部件、非人特征、配饰等/);
    assert.match(costume.description, /等。写画面里有的东西。脱掉的衣物不再写/);
    assert.ok(!costume.description.includes('不管之前写没写过'), 'costume no longer carries the old remember clause');
    assert.ok(!costume.description.includes('固定外貌里已有的不用重复写'), 'costume no longer carries the old dedupe clause');
    assert.match(costume.description, /脱掉的衣物不再写，露出的部位写明（topless、bare chest），其它身体部件、非人特征和配饰照旧保留；全部都没有才写 "costume": ""/);
    assert.match(costume.description, /要选衣服时（新角色、换了形态、或正文写了新的衣物），已录入角色有服装参考的，选一套或其变体，衣物以参考为准，只按画面调整状态，不要额外补充与参考里已有衣物重复或同义的内容，也不把多套参考拼在一起/);
    assert.match(costume.description, /这个字段必须提交：没有衣服（全裸、半裸、只剩配饰）是合法且常见的取值/);
    assert.match(costume.description, /取值优先级：正文写的穿搭 > 前文画面里这个角色的 costume > 服装参考、世界书、数据表里的穿搭描述/);
    assert.match(costume.description, /正文写到而参考里没有的衣物可以补上，正文穿的整套衣服参考里都没有可以直接整套写/);
    assert.match(action.description, /^只写瞬时内容：.*撩衣、握物这类一瞬间的动作也写这里。身上一直有的东西（身体部件、非人特征、配饰、穿着本身）不写在这里，写进 costume。/);
});

test('a "topless" costume replaces the remembered robe in the next block', () => {
    const text = '渔行歌泡在池里。';
    const block = buildContinuityBlockForRequest({
        records: [snapshot(1, 'grey robe, white underrobe'), snapshot(2, 'topless, bare chest, wet hair')],
        presentCharacters: present(text),
        bodyText: text,
    });
    assert.match(block, /^- 司盈昃｜costume: topless, bare chest, wet hair$/m);
    assert.ok(!block.includes('grey robe'), 'the robe is gone from the memory');
});

test('characters description carries the cross-field no-duplicate rule with its priority', () => {
    const tool = createSubmitScenePlanTool();
    const description = tool.function.parameters.properties.images.items.properties.characters.description;
    assert.ok(description.endsWith('同一个角色的外貌（已录入角色是角色清单里的固定外貌，未录入角色是你写的 appear）、costume、action 合起来就是这个角色的提示词：相同或同义的词只写一处，按 外貌 > costume > action 的优先级留在靠前的字段；属于某个角色的词不写进整图 scene；不同角色之间不受此限。'));
    assert.match(description, /^画面中出现的角色，按重要度排序。/);
});
