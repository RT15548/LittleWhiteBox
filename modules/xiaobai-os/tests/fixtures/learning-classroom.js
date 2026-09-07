import { createLearningRuntime } from '../../apps/learning/host/runtime.js';
import { createLearningRepository } from '../../apps/learning/storage/repository.js';
import { LEARNING_PARTITION } from '../../apps/learning/partition.js';
import { createCapabilityRegistry } from '../../kernel/capability-registry.js';
import { createEconomyCapabilityRegistrations, ECONOMY_PARTITION, ECONOMY_READ_CAPABILITY, ECONOMY_TRANSACTION_CAPABILITY } from '../../capabilities/economy/index.js';
import { XiaobaiOsPartitionRegistry } from '../../kernel/partition-registry.js';
import { createTransactionCoordinator } from '../../kernel/transaction-coordinator.js';
import { XiaobaiOsExecutionScope } from '../../kernel/execution-scope.js';
import { XiaobaiOsStorageError } from '../../storage/storage-port.js';

// Fixed teaching responses at the Provider boundary. No network, account, key, or audio service.
export const fixtureLesson = {
    title: '城市的树，如何改变一个夏天', goal: '读懂一个清晰观点，再用自己的话说出来。', tier: 'short',
    materials: [{ key: 'text', title: 'A little shade goes a long way', kind: 'authored',
        text: 'A tree can make a street feel very different. On a hot afternoon, its shade gives people a place to rest.\n\nTrees do more than make a city look beautiful. They help cool the air, support wildlife, and bring neighbours together.' }],
    exercises: [{ key: 'q1', skill: 'reading', materialKeys: ['text'], prompt: 'What is the main idea of this passage?',
        response: { kind: 'choice', options: [{ id: 'a', text: 'Trees make city life more comfortable.' }, { id: 'b', text: 'Trees only make streets look beautiful.' }], multiple: false },
        rule: { kind: 'exact', answer: { kind: 'choice', ids: ['a'] }, explanation: '作者先用树荫举例，再解释树木能让城市生活更舒适。关键词是 do more than。' }, hint: '第二段的第一句，把视角从外观转向了作用。' }],
};

export async function createClassroomFixture({ listening = false, lesson: lessonInput = fixtureLesson, getTtsFacade = () => undefined } = {}) {
    let chat = 'runtime-a'; let envelope = null; let userFile = null; let serial = 0;
    const flags = { userFailure: false, userRejected: false, heldUser: null, ledgerFailure: false, ledgerUnknown: false, heldLedger: null, providerFailure: false, providerGate: null, prepareReply: null, profileReply: null, talkTools: null, teacherResponse: null };
    const counts = { provider: 0, userWrites: 0, ledgerWrites: 0 };
    const failures = [];
    const reference = () => ({ identityKey: `storage-${chat}`, binding: { kind: 'character', ownerLocator: 'fixture.png', chatId: chat },
        reference: envelope ? { formatVersion: 1, osId: envelope.osId } : null });
    const capabilities = createCapabilityRegistry(createEconomyCapabilityRegistrations());
    const partitions = new XiaobaiOsPartitionRegistry(); partitions.register(LEARNING_PARTITION); partitions.register(ECONOMY_PARTITION);
    const coordinator = createTransactionCoordinator({ partitions, capabilityBinder: capabilities, createId: () => `ledger-${++serial}`,
        chatReferences: { capture: reference, isCurrent: captured => captured.identityKey === reference().identityKey, install: async () => ({ status: 'confirmed' }) },
        storage: { read: async () => structuredClone(envelope), delete: async () => 'missing', replace: async ({ candidate }) => {
            counts.ledgerWrites++;
            if (flags.ledgerFailure) { return { status: 'failed', error: { code: 'fixture', message: 'fixed failure', retryable: true } }; }
            if (flags.ledgerUnknown) { flags.heldLedger = structuredClone(candidate); return { status: 'unconfirmed', observed: structuredClone(envelope) }; }
            envelope = structuredClone(candidate); return { status: 'confirmed' };
        } },
    });
    await capabilities.install({ createStore: (registration, allowedCapabilities) => coordinator.createScopedStore(registration, { allowedCapabilities }), files: coordinator });
    const store = coordinator.createScopedStore(LEARNING_PARTITION, { allowedCapabilities: [ECONOMY_TRANSACTION_CAPABILITY] });
    const repository = createLearningRepository({ read: async () => structuredClone(userFile), replace: async (_name, value) => {
        counts.userWrites++;
        if (flags.userRejected) { throw new XiaobaiOsStorageError('fixture_rejected', 'fixed rejection', false, { httpStatus: 403 }); }
        if (flags.userFailure) { flags.heldUser = structuredClone(value); throw new Error('fixture response lost'); }
        userFile = structuredClone(value);
    } });
    const profile = () => repository.snapshot().document?.data.profiles[0];
    const call = (name, args) => ({ id: name, name, arguments: JSON.stringify(args) });
    const gateway = { loadConfig: async () => ({}), openSession: async () => {
        let round = 0;
        return { supportsSessionToolLoop: false, providerConfig: {}, run: async request => {
            counts.provider++;
            if (flags.providerGate) { await flags.providerGate; }
            if (flags.providerFailure) { throw Object.assign(new Error('fixture secret must stay hidden'), { status: 401 }); }
            round++;
            if (flags.teacherResponse) { return flags.teacherResponse(request, round); }
            if (round > 1) { return { text: '你已经抓住关键了。语言不用一次学完，今天多会一点点就很好。' }; }
            const message = request.messages.findLast(entry => entry.role === 'user');
            const input = JSON.parse(message.content.split('<learning_request>\n').at(-1).split('\n</learning_request>')[0]);
            const action = input.action;
            if (action.kind === 'profile') {
                if (flags.profileReply !== null) { return { text: flags.profileReply }; }
                return { toolCalls: [call('LearningProfileEdit', { explanationLanguage: 'zh-CN', selfAssessment: '有高中基础，听力需要练习。', goal: { description: '备考英语四级，读懂新闻，写出清晰的短文。' } })] };
            }
            if (action.kind === 'prepare') {
                if (flags.prepareReply !== null) { return { text: flags.prepareReply }; }
                const lesson = structuredClone(lessonInput);
                if (listening) { lesson.exercises[0].skill = 'listening'; }
                return { toolCalls: [call('LearningLessonEdit', lesson)] };
            }
            if (action.kind === 'explain') { return { text: '“do more than” 表示“不仅仅”。树木不只是好看，还能提供荫凉。试着用这个结构，写一句自己的话。' }; }
            if (action.kind === 'talk') {
                return flags.talkTools ? { toolCalls: flags.talkTools.map(entry => call(entry.name, entry.args)) }
                    : { text: '可以，我们先放慢一点。你最想弄清楚哪一部分？' };
            }
            const unit = profile().unit;
            const attempt = unit.attempts.at(-1);
            return { toolCalls: [call('LearningAssess', { attemptId: action.attemptId ?? attempt.id,
                ...(action.kind === 'assess' && (!input.focus?.assessment || action.review) ? { verdict: 'correct', understanding: '抓住了文章的中心。', expression: '', guidance: '下次试着用自己的句子说明原因。' } : {}),
                items: [{ label: '抓住段落中心观点' }] }),
            call('LearningComplete', { unitId: unit.id, attemptIds: [attempt.id], summary: '读懂了树荫与城市生活的关系，也练习了辨认文章主旨。' })] };
        } };
    } };
    let active = true; let state;
    const listeners = new Set(); const waiters = new Set();
    const execution = new XiaobaiOsExecutionScope(error => failures.push(error));
    const economy = capabilities.require(ECONOMY_READ_CAPABILITY);
    const runtime = createLearningRuntime({ repository, store, files: coordinator, economy, agent: gateway, execution,
        chatIdentity: () => chat, playerName: () => '小白', people: () => [{ name: '林老师', aliases: [], text: '温和而认真的老师' }],
        capture: async () => ({ teacherDetails: '熟悉你，也认真对待你的目标。', snapshot: { player: { displayName: '小白', persona: '' },
            characters: [], storyEvents: '一起看过城里的夏天。', recentMessages: [], worldInfo: { before: '', after: '', depth: [] } } }),
        getTtsFacade,
    });
    const context = () => ({ activationToken: 'fixture', isCurrent: () => active, post(type, payload) {
        state = type === 'learning/media' ? { ...state, media: payload.media } : payload.state;
        for (const listener of listeners) { listener({ type, payload }); }
        if (!state.busy) { for (const resolve of waiters) { resolve(); } waiters.clear(); }
        return true;
    } });
    state = await runtime.activate(context());
    const bridge = { subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener); },
        request: async (type, payload) => {
            const result = await runtime.handleMessage({ type, payload });
            if (result?.state) { state = result.state; }
            return { result };
        } };
    async function command(name, input = {}) {
        const response = await bridge.request(`learning/${name}`, { chatIdentity: chat, ...input });
        state = response.result.state;
        if (state.busy) { await new Promise(resolve => waiters.add(resolve)); }
        return structuredClone(state);
    }
    return { runtime, bridge, repository, store, coordinator, economy, flags, counts, failures, command, profile,
        state: () => structuredClone(state),
        async openLesson() { await command('teacher', { teacher: { name: '林老师', note: '' } }); await command('profile', { message: '想备考四级，当前高中基础。' }); await command('prepare', { message: '开始一课。' }); return state; },
        async reenter() { runtime.deactivate(); active = true; state = await runtime.activate(context()); return state; },
        async changeChat() { chat = 'runtime-b'; envelope = null; coordinator.invalidateCurrent(); runtime.handleChatChanged(); state = await runtime.activate(context()); return state; },
        confirmUser() { userFile = flags.heldUser; flags.userFailure = false; },
        replaceUser(value) { userFile = structuredClone(value); },
        confirmLedger() { envelope = flags.heldLedger; flags.ledgerUnknown = false; },
        async dispose() { active = false; await execution.dispose(); await capabilities.dispose(); },
    };
}
