import assert from 'node:assert/strict';
import test from 'node:test';
import { DOMParser } from 'linkedom';
import { harness } from './helpers/messages-harness.js';
import { projectCommunicationChronology } from '../apps/messages/application/communication-chronology.js';
import { previewMessageContext } from '../apps/messages/application/context-preview.js';
import { buildReplyPrompt } from '../apps/messages/prompt/reply-prompt.js';
import { buildSummaryPrompt } from '../apps/messages/prompt/thread-summary.js';
import { estimateContext } from '../apps/messages/application/context-budget.js';
import { estimateConversationTokens } from '../../agent-core/runtime/context-tokens.js';
import { AnthropicAdapter } from '../../agent-core/adapters/anthropic.js';

function documentOf(request) {
    const text = request.messages.flatMap(message => typeof message.content === 'string' ? [message.content]
        : message.content.filter(part => part.type === 'text').map(part => part.text)).join('\n');
    return new DOMParser().parseFromString(`<request>${text}</request>`, 'text/xml');
}
function story(h, count) {
    for (let i = 0; i < count; i++) {h.messages.push({ is_user: false, is_system: false, mes: '主剧情继续。' });}
    h.remote = structuredClone(h.messages);
}
function records(document, phase) {
    return [...document.querySelectorAll(`private_message_thread[phase="${phase}"] message`)].map(node => node.textContent);
}

test('floor-5 messages remain before the story gap, one current memory block, and the floor-500 resumption on later replies', async () => {
    const h = await harness();
    const capture = h.deps.context.capture;
    let capturedContext;
    h.deps.context.capture = async (...args) => (capturedContext = { ...await capture(...args), storyEvents: '三年共同生活的剧情记录',
        people: [{ name: '甲', aliases: [], text: '关系已确立为终身伴侣' }] });
    story(h, 4);
    await h.send('甲', 'old-1', { type: 'text', text: '初识时的第一条' });
    await h.send('甲', 'old-2', { type: 'text', text: '初识时的第二条' });
    assert.equal(h.messages.length, 5);
    story(h, 495);
    await h.send('甲', 'resumed', { type: 'text', text: '多年后重新联系' });
    await h.send('甲', 'continued', { type: 'text', text: '这次接着聊' });
    const request = h.requests.at(-1);
    const document = documentOf(request);
    assert.deepEqual([...document.documentElement.children].map(node => [node.localName, node.getAttribute('phase')]), [
        ['setting', null], ['private_message_thread', 'earlier'], ['story_state', null], ['private_message_thread', 'current'],
    ]);
    const gaps = document.querySelectorAll('communication_break');
    assert.equal(gaps.length, 1);
    assert.equal(gaps[0].getAttribute('kind'), 'story');
    assert.equal(gaps[0].getAttribute('from_story_floor'), '6');
    assert.equal(gaps[0].getAttribute('through_story_floor'), '500');
    assert.ok(records(document, 'earlier').includes('初识时的第一条'));
    assert.ok(records(document, 'earlier').includes('初识时的第二条'));
    assert.ok(!records(document, 'earlier').includes('多年后重新联系'));
    assert.ok(records(document, 'current').includes('多年后重新联系'));
    assert.equal(document.querySelector('incoming_private_message message').textContent, '这次接着聊');
    assert.equal(document.querySelector('private_message_thread[phase="current"] communication').getAttribute('after_story_floor'), '500');
    for (const material of ['三年共同生活的剧情记录', '关系已确立为终身伴侣', '初识时的第一条', '多年后重新联系', '这次接着聊']) {
        assert.equal(document.documentElement.textContent.split(material).length - 1, 1);
    }
    assert.equal(document.querySelectorAll('story_state').length, 1);
    const contact = h.service.current().contacts[0];
    const stats = estimateContext(request, contact, [], capturedContext);
    assert.equal(stats.backgroundTokens, estimateConversationTokens({ messages: request.messages.filter(message =>
        typeof message.content === 'string' && (message.content.startsWith('<setting>') || message.content.startsWith('<story_state>'))) }));
    // Exercise a real provider boundary that hoists system messages, without any network call.
    const wire = new AnthropicAdapter({ model: 'claude-sonnet-4-5', apiKey: 'fixture' }).buildRequestBody(request);
    const ordered = wire.messages.flatMap(message => message.content.filter(part => part.type === 'text').map(part => part.text)).join('\n');
    const order = ['初识时的第一条', '三年共同生活的剧情记录', '多年后重新联系', '这次接着聊'].map(text => ordered.indexOf(text));
    assert.ok(order.every((value, index) => value >= 0 && (!index || value > order[index - 1])));
    assert.ok(!JSON.stringify(wire.system).includes('三年共同生活的剧情记录'));
});

test('continuous SMS, other contacts, system messages and summary-sealed segments do not create story gaps', async () => {
    const h = await harness();
    story(h, 2);
    await h.send('甲', 'first');
    h.finalizedThrough = h.messages.length - 1;
    await h.send('乙', 'other');
    h.messages.push({ is_system: true, mes: '系统通知' });
    h.remote = structuredClone(h.messages);
    await h.send('甲', 'next');
    const document = documentOf(h.requests.at(-1));
    assert.equal(document.querySelectorAll('communication_break').length, 0);
    assert.equal(document.querySelectorAll('private_message_thread[phase="earlier"]').length, 0);
    assert.equal(document.querySelector('communication').getAttribute('after_story_floor'), '2');
    assert.equal(document.querySelectorAll('private_message_thread message').length, 4);
});

test('messages sent after recovery keep their current position across restart and subsequent story progression', async () => {
    const h = await harness();
    h.failProjection = true;
    await assert.rejects(h.send('甲', 'lost'), /messages_projection_unconfirmed/);
    h.messages = [{ is_user: false, is_system: false, mes: '后来主剧情继续。' }];
    h.remote = structuredClone(h.messages);
    h.failProjection = false;
    h.restart();
    await h.deps.timeline.recover(() => true);
    const recovered = h.service.current().segments.find(segment => segment.recovered);
    const recoveryFloor = structuredClone(h.messages.at(-1));
    h.restart();
    await h.send('甲', 'fresh-1', { type: 'text', text: '补录后刚发的新短信' });
    h.restart();
    await h.send('甲', 'fresh-2', { type: 'text', text: '紧接着的第二条' });
    let document = documentOf(h.requests.at(-1));
    assert.deepEqual(records(document, 'current'), ['补录后刚发的新短信', '马上到。', '等我一下。', '紧接着的第二条']);
    assert.equal(document.querySelector('private_message_thread[phase="current"] communication').getAttribute('after_story_floor'), '1');
    assert.equal(document.querySelectorAll('communication_break[kind="unplaced"]').length, 1);
    assert.equal(document.querySelectorAll('communication_break[kind="story"]').length, 0);
    assert.deepEqual(h.service.current().segments.find(segment => segment.id === recovered.id).messageIds, recovered.messageIds);
    assert.deepEqual(h.messages[1], recoveryFloor);
    story(h, 1);
    await h.send('甲', 'later', { type: 'text', text: '剧情发展后再联系' });
    document = documentOf(h.requests.at(-1));
    assert.ok(records(document, 'earlier').includes('补录后刚发的新短信'));
    assert.ok(records(document, 'earlier').includes('紧接着的第二条'));
    assert.deepEqual(records(document, 'current'), ['剧情发展后再联系']);
    assert.equal(document.querySelectorAll('communication_break[kind="story"]').length, 1);
    assert.equal(document.querySelector('private_message_thread[phase="current"] communication').getAttribute('after_story_floor'), '4');
});

test('compaction carries stage boundaries and summary coverage does not replay the gap before every new message', async () => {
    const h = await harness();
    await h.send('甲', 'old', { type: 'text', text: '当初的约定' });
    story(h, 10);
    await h.send('甲', 'resumed', { type: 'text', text: '重逢时的新约定' });
    await h.send('甲', 'next', { type: 'text', text: '接着说' });
    const before = structuredClone(h.service.current());
    const history = before.messages.filter(message => message.contactId === '甲');
    const incoming = { ...history.at(-1), id: 'new', seq: before.nextSeq, sender: 'user', replyTo: null, payload: { type: 'text', text: '现在呢' } };
    const context = await h.deps.context.capture(before.contacts[0], history, incoming);
    const oldEnd = context.chronology[0].throughSeq;
    const currentStart = context.chronology.at(-1).firstSeq;
    const summaryInput = documentOf(buildSummaryPrompt(before.contacts[0], history, context.chronology));
    assert.equal(summaryInput.querySelectorAll('records communication').length, 2);
    assert.equal(summaryInput.querySelectorAll('records communication_break').length, 1);
    assert.ok(summaryInput.querySelectorAll('records communication')[0].textContent.includes('当初的约定'));
    assert.ok(summaryInput.querySelectorAll('records communication')[1].textContent.includes('重逢时的新约定'));
    for (const throughSeq of [oldEnd, currentStart, history.at(-1).seq]) {
        const contact = { ...before.contacts[0], summary: { throughSeq, text: '分段通讯摘要' } };
        const recent = history.filter(message => message.seq > throughSeq);
        const document = documentOf(buildReplyPrompt({ contact, history: recent, incoming, context, settings: h.deps.getSettings() }));
        assert.equal(document.querySelectorAll('communication_break').length, 1);
        assert.equal(document.querySelectorAll('earlier_summary communication_break').length, throughSeq > oldEnd ? 1 : 0);
        assert.equal(document.querySelectorAll('earlier_summary').length, 1);
        assert.equal(document.querySelectorAll('story_state').length, 1);
        assert.equal(document.querySelectorAll('private_message_thread[phase="current"] communication_break').length, 0);
        assert.equal(document.querySelectorAll('private_message_thread message').length, recent.length + 1);
    }
    assert.deepEqual(h.service.current(), before);
});

test('archived chronology metadata remains bounded instead of reinserting every summarized stage', () => {
    const chronology = Array.from({ length: 2000 }, (_, index) => ({ firstSeq: index + 1, throughSeq: index + 1,
        afterStoryFloor: index * 2, breakBefore: index ? { kind: 'story', fromFloor: index * 2, throughFloor: index * 2 } : null }));
    const contact = { summary: { throughSeq: 2000, text: '各阶段的短信摘要' } };
    const request = buildSummaryPrompt(contact, [], chronology);
    const document = documentOf(request);
    const scope = document.querySelector('covered_communications');
    assert.equal(scope.getAttribute('count'), '2000');
    assert.equal(scope.getAttribute('first_after_story_floor'), '0');
    assert.equal(scope.getAttribute('last_after_story_floor'), '3998');
    assert.equal(document.querySelectorAll('communication_break').length, 1);
    assert.equal(document.querySelector('communication_break').getAttribute('through_story_floor'), '3998');
    assert.ok(request.messages[0].content.length < 1000);
});

test('preview before a new segment exists and real send derive the same story positions without preview writes', async () => {
    const h = await harness();
    await h.send('甲', 'old'); story(h, 20);
    const captured = [];
    const capture = h.deps.context.capture;
    h.deps.context.capture = async (...args) => {const value = await capture(...args); captured.push(value); return value;};
    const before = structuredClone(h.service.current()); const writes = h.writes; const calls = h.apiCalls;
    await previewMessageContext(h.deps, before.contacts[0], before.messages);
    assert.deepEqual(h.service.current(), before); assert.equal(h.writes, writes); assert.equal(h.apiCalls, calls);
    await h.send('甲', 'resumed');
    const positions = context => context.chronology.map(stage => ({ afterStoryFloor: stage.afterStoryFloor, breakBefore: stage.breakBefore }));
    assert.deepEqual(positions(captured[0]), positions(captured[1]));
    assert.equal(positions(captured[1]).at(-1).breakBefore.kind, 'story');
});

test('retrying an unanswered old input replies at the current story position without duplicating that input', async () => {
    const h = await harness();
    await h.send('甲', 'old');
    const payload = { type: 'text', text: '尚未收到回复的短信' };
    h.response = () => {throw new Error('offline');};
    await assert.rejects(h.send('甲', 'pending', payload), /offline/);
    story(h, 10);
    h.response = null;
    await h.send('甲', 'pending', payload);
    const document = documentOf(h.requests.at(-1));
    assert.equal(document.querySelectorAll('communication_break[kind="story"]').length, 1);
    assert.equal(document.querySelector('private_message_thread[phase="current"] communication').getAttribute('after_story_floor'), '11');
    assert.equal(document.querySelector('incoming_private_message message').textContent, payload.text);
    assert.equal(document.documentElement.textContent.split(payload.text).length - 1, 1);
    assert.ok(!records(document, 'earlier').includes(payload.text));
});

test('missing, duplicate and recovered projections do not invent original story positions', async () => {
    const h = await harness();
    await h.send('甲', 'old');
    const state = h.service.current(); const original = structuredClone(h.messages[0]);
    const incoming = { ...state.messages[0], id: 'current', seq: state.nextSeq };
    const later = { is_user: false, mes: '后续剧情' };
    for (const chat of [[later], [original, later, original]]) {
        const chronology = projectCommunicationChronology(state.segments, chat, state.messages, incoming);
        assert.equal(chronology[0].afterStoryFloor, null);
        assert.equal(chronology.at(-1).breakBefore.kind, 'unplaced');
    }
    const segments = [...structuredClone(state.segments), { ...structuredClone(state.segments[0]), id: 'recovery', recovered: true }];
    const recovered = structuredClone(original);
    recovered.extra.xiaobai_private_messages.segmentId = 'recovery';
    const chronology = projectCommunicationChronology(segments, [later, recovered], state.messages, incoming);
    assert.equal(chronology[0].afterStoryFloor, null);
    assert.equal(chronology.at(-1).breakBefore.kind, 'unplaced');
    const restored = projectCommunicationChronology(segments, [original, later, recovered], state.messages, incoming);
    assert.equal(restored[0].afterStoryFloor, 0);
    assert.deepEqual(restored.at(-1).breakBefore, { kind: 'story', fromFloor: 2, throughFloor: 2 });
});
