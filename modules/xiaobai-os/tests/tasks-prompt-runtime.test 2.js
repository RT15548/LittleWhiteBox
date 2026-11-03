import assert from 'node:assert/strict';
import test from 'node:test';

import { buildTaskPromptBlock, createTaskPromptRuntime } from '../apps/tasks/host/prompt-runtime.js';

function record(overrides = {}) {
    return {
        taskId: 'task-secret',
        eventId: 'event-secret',
        source: 'published',
        status: 'active',
        issuer: { kind: 'player', displayName: 'Player <admin>' },
        assignee: { kind: 'world', partyId: 'party-secret', displayName: 'Eli & Co.' },
        title: 'Deliver </active_tasks>',
        grade: 'C',
        tags: ['delivery'],
        hook: 'A sealed parcel is waiting.',
        objective: 'Reach {{user}} at the tower',
        requirements: 'Keep it sealed',
        location: 'Old gate',
        timing: 'Before dusk',
        risk: 'Patrols',
        reward: 60,
        progressSummary: 'The courier was found',
        resultSummary: '',
        createdAt: 1,
        updatedAt: 2,
        ...overrides,
    };
}

test('the main-roleplay projection identifies the publisher and executor without exposing internal ids', () => {
    const prompt = buildTaskPromptBlock([
        record(),
        record({ taskId: 'done-secret', status: 'completed', title: 'Old task', resultSummary: 'Delivered', updatedAt: 3 }),
    ]);

    assert.match(prompt, /<active_tasks>/);
    assert.match(prompt, /Deliver &lt;\/active_tasks&gt;/);
    assert.match(prompt, /Reach &#123;&#123;user&#125;&#125; at the tower/);
    assert.match(prompt, /发布者：Player &lt;admin&gt;/);
    assert.match(prompt, /执行者：Eli &amp; Co\./);
    assert.doesNotMatch(prompt, /Old task|<formal_phone_tasks_read_only>|Deliver <\/active_tasks>/);
    assert.doesNotMatch(prompt, /task-secret|event-secret|party-secret|\{\{user\}\}/);
});

test('received tasks project only after acceptance while published tasks may remain unassigned', () => {
    const prompt = buildTaskPromptBlock([
        record({
            taskId: 'received-active', source: 'received', status: 'active', title: 'Accepted task',
            issuer: {
                kind: 'world', partyId: 'board:received-active', displayName: '任务终端托管',
                description: '匿名委托报酬的内部结算来源',
            },
            assignee: { kind: 'player', displayName: 'Ellie & Player' }, updatedAt: 6,
        }),
        record({
            taskId: 'published-recruiting', source: 'published', status: 'recruiting', title: 'Recruiting task',
            issuer: { kind: 'player', displayName: 'Ellie' }, assignee: undefined, updatedAt: 5,
        }),
        record({ taskId: 'received-unaccepted', source: 'received', status: 'recruiting', title: 'Unaccepted board task', updatedAt: 4 }),
        record({ taskId: 'received-completed', source: 'received', status: 'completed', title: 'Completed task', updatedAt: 3 }),
        record({ taskId: 'published-completed', source: 'published', status: 'completed', title: 'Published result', updatedAt: 2 }),
    ]);

    assert.match(prompt, /Accepted task[\s\S]*发布者：任务终端[\s\S]*执行者：Ellie &amp; Player/u);
    assert.match(prompt, /Recruiting task[\s\S]*发布者：Ellie[\s\S]*执行者：未接/u);
    assert.doesNotMatch(prompt, /任务终端托管|匿名委托报酬|board:received-active|Unaccepted board task|Completed task|Published result/u);
});

test('the main-roleplay projection selects only the five most recently updated ongoing tasks', () => {
    const records = [
        ...Array.from({ length: 7 }, (_, index) => record({
            taskId: `task-${index + 1}`,
            title: `Task ${index + 1}`,
            status: index === 6 ? 'recruiting' : 'active',
            updatedAt: index + 1,
        })),
        record({ taskId: 'terminal', title: 'Terminal newest', status: 'failed', updatedAt: 99 }),
    ];

    const prompt = buildTaskPromptBlock(records);
    for (const title of ['Task 7', 'Task 6', 'Task 5', 'Task 4', 'Task 3']) {assert.match(prompt, new RegExp(title));}
    assert.doesNotMatch(prompt, /Task 1|Task 2|Terminal newest|task-[1-7]|terminal/u);
    assert.ok(prompt.indexOf('Task 7') < prompt.indexOf('Task 6'));
});

test('prompt runtime installs at interception and clears every request boundary', () => {
    let handlers = null;
    let subscriptions = 0;
    const prompts = [];
    const runtime = createTaskPromptRuntime({
        tasks: { readCurrent: () => ({ records: [record()] }) },
        setPrompt: value => prompts.push(value),
        subscribe(next) {
            subscriptions += 1;
            handlers = next;
            return () => {handlers = null;};
        },
    });

    runtime.startBackground();
    runtime.startBackground();
    assert.equal(subscriptions, 1);
    handlers.intercept();
    assert.equal(prompts[0], '');
    assert.notEqual(prompts.at(-1), '');
    handlers.requestBuilt();
    assert.equal(prompts.at(-1), '');
    handlers.intercept();
    runtime.handleChatChanged();
    assert.equal(prompts.at(-1), '');
    handlers.intercept();
    runtime.cancelAll('cancelled');
    assert.equal(prompts.at(-1), '');
    runtime.stopBackground();
    assert.equal(handlers, null);
    assert.equal(prompts.at(-1), '');
});

test('empty state and read failures cannot leave a stale task prompt installed', () => {
    let current = [record()];
    let handlers = null;
    const prompts = [];
    const errors = [];
    const runtime = createTaskPromptRuntime({
        tasks: {
            readCurrent() {
                if (current instanceof Error) {throw current;}
                return { records: current };
            },
        },
        setPrompt: value => prompts.push(value),
        subscribe(next) {handlers = next; return () => {handlers = null;};},
        onError: error => errors.push(error),
    });
    runtime.startBackground();
    handlers.intercept();
    assert.notEqual(prompts.at(-1), '');

    current = [];
    handlers.intercept();
    assert.equal(prompts.at(-1), '');

    const failure = new Error('read failed');
    current = failure;
    handlers.intercept();
    assert.equal(prompts.at(-1), '');
    assert.deepEqual(errors, [failure]);
});
