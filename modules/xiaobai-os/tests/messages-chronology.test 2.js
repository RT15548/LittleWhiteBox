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
import { normalizePromptContext } from '../host/prompt-context/normalize.js';
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
function finalText(request) {
    const content = request.messages.at(-1).content;
    return typeof content === 'string' ? content : content.filter(part => part.type === 'text').map(part => part.text).join('\n');
}
function stagesOf(request) {
    return [...documentOf(request).querySelectorAll('private_messages communication')].map(node => ({
        floor: node.getAttribute('after_story_floor'),
        texts: [...node.querySelectorAll('message')].map(message => message.textContent),
    }));
}
const incomingOf = request => documentOf(request).querySelector('incoming_message').textContent.trim().split('\n').slice(1).join('\n');
const currentOf = request => documentOf(request).querySelector('current_communication');
const containsMessage = (stage, payload) => stage.texts.some(text => text.includes(payload));

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
    assert.deepEqual(request.messages.map(message => message.role), ['user', 'assistant', 'user']);
    assert.ok(request.messages[0].content.startsWith('<setting>'));
    const final = finalText(request);
    const blocks = ['<contact>', '<story>', '<private_messages>', '<current_communication ', '<incoming_message>'].map(tag => final.indexOf(tag));
    assert.ok(blocks.every((value, index) => value >= 0 && (!index || value > blocks[index - 1])));
    const stages = stagesOf(request);
    assert.deepEqual(stages.map(stage => stage.floor), ['4', '500']);
    const gap = documentOf(request).querySelector('private_messages communication_break');
    assert.equal(gap.getAttribute('kind'), 'story');
    assert.equal(gap.getAttribute('from_story_floor'), '6');
    assert.equal(gap.getAttribute('through_story_floor'), '500');
    assert.equal(currentOf(request).getAttribute('kind'), 'continuing');
    assert.ok(containsMessage(stages[0], '初识时的第一条'));
    assert.ok(containsMessage(stages[0], '初识时的第二条'));
    assert.ok(!containsMessage(stages[0], '多年后重新联系'));
    assert.ok(containsMessage(stages[1], '多年后重新联系'));
    assert.equal(incomingOf(request), '这次接着聊');
    const all = [request.messages[0].content, final].join('\n');
    for (const material of ['三年共同生活的剧情记录', '关系已确立为终身伴侣', '初识时的第一条', '多年后重新联系', '这次接着聊']) {
        assert.equal(all.split(material).length - 1, 1);
    }
    const contact = h.service.current().contacts[0];
    const stats = estimateContext(request, contact, [], capturedContext);
    assert.equal(stats.backgroundTokens, estimateConversationTokens({ messages: [request.messages[0],
        { role: 'user', content: final.match(/<contact>[\s\S]*?<\/contact>/u)[0] },
        { role: 'user', content: final.match(/<story>[\s\S]*?<\/story>/u)[0] }] }));
    // Exercise a real provider boundary that hoists system messages, without any network call.
    const wire = new AnthropicAdapter({ model: 'claude-sonnet-4-5', apiKey: 'fixture' }).buildRequestBody(request);
    const ordered = wire.messages.flatMap(message => message.content.filter(part => part.type === 'text').map(part => part.text)).join('\n');
    const order = ['三年共同生活的剧情记录', '初识时的第一条', '多年后重新联系', '这次接着聊'].map(text => ordered.indexOf(text));
    assert.ok(order.every((value, index) => value >= 0 && (!index || value > order[index - 1])));
    assert.ok(!JSON.stringify(wire.system).includes('三年共同生活的剧情记录'));
});

test('story progress supplies narrative bounds, without treating a summary batch as event occurrence time', () => {
    const contact = { id: '甲', name: '甲', note: '', createdAt: 0, summary: null };
    const message = (seq, text) => ({ id: `m${seq}`, contactId: '甲', seq, sender: 'user', replyTo: null, createdAt: 0, payload: { type: 'text', text } });
    const history = [message(1, '明天见')];
    const incoming = message(2, '好久不见');
    const context = { ...normalizePromptContext({}), people: [],
        chronology: [{ firstSeq: 1, throughSeq: 1, afterStoryFloor: 5, breakBefore: null },
            { firstSeq: 2, throughSeq: 2, afterStoryFloor: 500, breakBefore: { kind: 'story', fromFloor: 6, throughFloor: 500 } }],
        storyEvents: '初识的经过\n十年间的变故' };
    const request = buildReplyPrompt({ contact, history, incoming, context, settings: { imagePrompt: false, voicePrompt: false } });
    assert.deepEqual(stagesOf(request).map(stage => stage.floor), ['5']);
    assert.equal(documentOf(request).querySelector('story_events').textContent.trim(), context.storyEvents);
    assert.equal(currentOf(request).getAttribute('kind'), 'story');
    const gap = currentOf(request).querySelector('communication_break');
    assert.equal(gap.getAttribute('from_story_floor'), '6');
    assert.equal(gap.getAttribute('through_story_floor'), '500');
    assert.equal(incomingOf(request), '好久不见');
    const uncovered = buildReplyPrompt({ contact, history, incoming, settings: { imagePrompt: false, voicePrompt: false },
        context: { ...context, storyEvents: '' } });
    assert.equal(documentOf(uncovered).querySelector('story_events'), null);
    assert.equal(currentOf(uncovered).getAttribute('kind'), 'story');
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
    const request = h.requests.at(-1);
    assert.deepEqual(stagesOf(request).map(stage => stage.floor), ['2']);
    assert.equal(stagesOf(request)[0].texts.length, 3);
    assert.equal(currentOf(request).getAttribute('kind'), 'continuing');
    assert.equal(documentOf(request).querySelector('communication_break'), null);
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
    let request = h.requests.at(-1);
    assert.deepEqual(stagesOf(request).map(stage => stage.floor), ['unknown', '1']);
    assert.equal(documentOf(request).querySelector('communication_break').getAttribute('kind'), 'unplaced');
    assert.equal(stagesOf(request)[1].texts.length, 3);
    for (const [index, payload] of ['补录后刚发的新短信', '马上到。', '等我一下。'].entries()) {
        assert.ok(stagesOf(request)[1].texts[index].includes(payload));
    }
    assert.equal(incomingOf(request), '紧接着的第二条');
    assert.equal(documentOf(request).querySelector('communication_break[kind="story"]'), null);
    assert.deepEqual(h.service.current().segments.find(segment => segment.id === recovered.id).messageIds, recovered.messageIds);
    assert.deepEqual(h.messages[1], recoveryFloor);
    story(h, 1);
    await h.send('甲', 'later', { type: 'text', text: '剧情发展后再联系' });
    request = h.requests.at(-1);
    assert.ok(containsMessage(stagesOf(request)[1], '补录后刚发的新短信'));
    assert.ok(containsMessage(stagesOf(request)[1], '紧接着的第二条'));
    assert.equal(incomingOf(request), '剧情发展后再联系');
    assert.equal(currentOf(request).getAttribute('kind'), 'story');
    const gap = currentOf(request).querySelector('communication_break');
    assert.equal(gap.getAttribute('from_story_floor'), gap.getAttribute('through_story_floor'));
});

test('compaction carries stage boundaries and summary coverage does not replay the gap before every new message', async () => {
    const h = await harness();
    await h.send('甲', 'old', { type: 'text', text: '当初的约定' });
    story(h, 10);
    await h.send('甲', 'resumed', { type: 'text', text: '重逢时的新约定' });
    const summarizedThrough = h.service.current().messages.at(-1).seq;
    for (let i = 0; i < 7; i++) {await h.send('甲', `next-${i}`, { type: 'text', text: `接着说${i}` });}
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
    for (const throughSeq of [oldEnd, currentStart, summarizedThrough]) {
        const contact = { ...before.contacts[0], summary: { throughSeq, text: '分段通讯摘要' } };
        const recent = history.filter(message => message.seq > throughSeq);
        const request = buildReplyPrompt({ contact, history: recent, incoming, context, settings: h.deps.getSettings() });
        const stages = stagesOf(request);
        const document = documentOf(request);
        const summary = document.querySelector('earlier_summary');
        assert.equal(summary.querySelector('summary_text').textContent, contact.summary.text);
        const scope = summary.querySelector('covered_communications');
        assert.equal(scope.getAttribute('count'), throughSeq > oldEnd ? '2' : '1');
        assert.equal(scope.getAttribute('first_after_story_floor'), '0');
        assert.equal(scope.getAttribute('last_after_story_floor'), throughSeq > oldEnd ? '11' : '0');
        // One break survives whether its messages are raw or already summarized.
        assert.equal(document.querySelectorAll('communication_break').length, 1);
        const gap = document.querySelector('communication_break');
        assert.equal(gap.getAttribute('from_story_floor'), '2');
        assert.equal(gap.getAttribute('through_story_floor'), '11');
        const summaryRequest = documentOf(buildSummaryPrompt(contact, recent, context.chronology));
        for (const attribute of ['count', 'first_after_story_floor', 'last_after_story_floor']) {
            assert.equal(summaryRequest.querySelector('covered_communications').getAttribute(attribute), scope.getAttribute(attribute));
        }
        assert.equal(currentOf(request).getAttribute('kind'), 'continuing');
        assert.equal(finalText(request).split('分段通讯摘要').length - 1, 1);
        assert.equal(stages.flatMap(stage => stage.texts).length, recent.length);
        assert.equal(incomingOf(request), '现在呢');
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
    const request = h.requests.at(-1);
    assert.equal(currentOf(request).getAttribute('kind'), 'story');
    const gap = currentOf(request).querySelector('communication_break');
    assert.equal(Number(gap.getAttribute('through_story_floor')) - Number(gap.getAttribute('from_story_floor')) + 1, 10);
    assert.equal(incomingOf(request), payload.text);
    assert.equal(finalText(request).split(payload.text).length - 1, 1);
    assert.ok(!stagesOf(request).some(stage => containsMessage(stage, payload.text)));
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
