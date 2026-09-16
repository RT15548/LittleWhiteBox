import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { XiaobaiOsPartitionRegistry } from '../../kernel/partition-registry.js';
import { createTransactionCoordinator } from '../../kernel/transaction-coordinator.js';
import { MESSAGES_PARTITION } from '../../apps/messages/partition.js';
import { createMessagesService } from '../../apps/messages/application/service.js';
import { createMessagesTimeline } from '../../apps/messages/application/timeline.js';
import { projectCommunicationChronology } from '../../apps/messages/application/communication-chronology.js';
import { sendPrivateMessage } from '../../apps/messages/application/send.js';
import { addContact } from '../../domains/messages/commands.js';
import { createMessagesModifications } from '../../apps/messages/application/modifications.js';
import { PRIVATE_MESSAGE_MARKER, projectionMarker } from '../../apps/messages/application/projection.js';
import { normalizePromptContext } from '../../host/prompt-context/normalize.js';
import { createMessagesRuntime } from '../../apps/messages/host/runtime.js';
import { createMessagesController } from '../../apps/messages/host/controller.js';
import { createMessageImages } from '../../apps/messages/host/image-attachments.js';
import { parseOutgoingMessage } from '../../apps/messages/application/image-upload.js';
import { createSettingsRepository } from '../../host/settings-repository.js';
import { estimateConversationTokens } from '../../../agent-core/runtime/context-tokens.js';

const clone = structuredClone;
export async function harness(seed) {
    const binding = { kind: 'character', ownerLocator: 'test.png', chatId: 'chat' };
    const h = { identity: 'chat', persisted: null, writes: 0, replace: null, read: null, messages: [], remote: [], publishes: 0, failProjection: false, apiCalls: 0, response: null,
        images: new Map(), uploads: 0, upload: null, publish: null, requests: [], releasedConfirmations: [] };
    h.persisted = { formatVersion: 1, osId: 'os', binding, revision: 0, commitId: 'initial', partitions: {} };
    if (seed) {h.persisted = clone(seed.persisted); h.messages = clone(seed.remote); h.remote = clone(seed.remote);}
    let serial = seed ? 100000 : 0; const id = () => `id-${++serial}`;
    const capture = () => ({ identityKey: h.identity, binding, reference: { formatVersion: 1, osId: 'os' } });
    const registry = new XiaobaiOsPartitionRegistry(); registry.register(MESSAGES_PARTITION);
    const coordinator = createTransactionCoordinator({ partitions: registry, createId: id,
        chatReferences: { capture, isCurrent: value => value.identityKey === h.identity, install: async () => ({ status: 'confirmed' }) },
        storage: {
            async read() {return h.read ? h.read() : clone(h.persisted);},
            async replace(input) {h.writes++; if (h.replace) {return h.replace(input);} h.persisted = clone(input.candidate); return { status: 'confirmed' };},
            async delete() {return 'deleted';},
        },
    });
    const service = createMessagesService(coordinator.createScopedStore(MESSAGES_PARTITION), coordinator);
    const preferences = {};
    const settings = createSettingsRepository({ getExtensionSettings: () => preferences, saveSettings() {} });
    await settings.prepare();
    const chat = {
        identity: () => h.identity, messages: () => h.messages,
        finalizedThrough: () => h.finalizedThrough ?? -1,
        async readSaved() {return clone(h.remote);},
        async rewrite({ identity, mutation, result, guard }) {
            if (result) {return chat.publish({ identity, index: mutation.index, ...result, guard });}
            h.messages.splice(mutation.index); h.publishes++;
            if (h.failProjection) {return false;}
            h.remote = clone(h.messages); return true;
        },
        releaseConfirmation(identity, marker) {h.releasedConfirmations.push({ identity, marker });},
        async confirm(identity, marker, text) {return identity === h.identity && h.remote.some(message => message.mes === text && projectionMarker(message)?.digest === marker.digest);},
        async publish({ index, text, marker, guard }) {
            assert.equal(guard(), true); h.publishes++;
            const message = { name: '私人信息', is_user: false, is_system: false, mes: text, extra: { swipeable: false, [PRIVATE_MESSAGE_MARKER]: marker } };
            if (index === null) {h.messages.push(message);} else {h.messages[index] = message;}
            if (h.publish) {await h.publish();}
            if (h.failProjection) {return false;}
            h.remote = clone(h.messages); return true;
        },
    };
    let timeline = createMessagesTimeline(service, chat, id);
    const images = createMessageImages(async (data, folder, name, format) => {
        h.uploads++;
        if (h.upload) {await h.upload();}
        const path = `/user/images/${folder}/${name}.${format}`;
        h.images.set(path, Buffer.from(data, 'base64'));
        return path;
    }, async path => h.images.has(path) ? new Response(h.images.get(path)) : new Response(null, { status: 404 }));
    const deps = { service, timeline, modifications: createMessagesModifications(service, timeline, chat, id), images,
        context: { capture: async (_contact, history, incoming) => ({ ...normalizePromptContext({}), people: [],
            chronology: projectCommunicationChronology(service.current().segments, h.messages, history, incoming) }) },
        countTokens: async options => ({ tokens: estimateConversationTokens(options), source: 'tokenizer' }),
        getSettings: () => settings.read().apps.messages,
        async saveSettings(value) {await settings.setMessagesCapabilities(value);}, subscribeSettings: settings.subscribe,
        agent: { loadConfig: async () => ({}), openSession: async () => ({ providerConfig: { model: 'fixture' }, run: async request => {
            h.requests.push(request);
            h.apiCalls++; if (h.response) {return h.response();}
            return { text: '{"replies":[{"type":"text","text":"马上到。"},{"type":"voice","transcript":"等我一下。"}]}' };
        } }) }, playerName: () => '玩家', id,
    };
    if (seed) {await service.refresh();} else {await service.change(state => {
        for (const name of ['甲', '乙']) {addContact(state, { id: name, name, note: '', createdAt: 0, summary: null });}
    });}
    const send = (contactId, messageId, payload = { type: 'text', text: '来吗？' }) => sendPrivateMessage(deps, { contactId, messageId, payload, guard: () => true, signal: new AbortController().signal, stage: () => undefined });
    return Object.assign(h, { service, deps, send, chat, coordinator, get timeline() {return timeline;}, restart() {timeline = createMessagesTimeline(service, chat, id); deps.timeline = timeline;} });
}

export const photo = parseOutgoingMessage({ type: 'image', description: '', upload: {
    name: '照片.png', dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a2XsAAAAASUVORK5CYII=',
} });

export async function controllerHarness(h) {
    const waiters = [];
    const runtime = createMessagesRuntime({ ...h.deps, identity: () => h.identity, isGenerating: () => false,
        changed() {if (!runtime.active) {waiters.splice(0).forEach(resolve => resolve());}} });
    const controller = createMessagesController({ ...h.deps, runtime, identity: () => h.identity,
        context: { ...h.deps.context, knownPeople: () => [] }, media: { capabilities: () => ({ image: false, voice: false }), stop() {}, cancelAll() {} },
        isGenerating: () => false, subscribeGeneration: () => () => {}, subscribeChat: () => () => {} });
    const activate = () => controller.activate({ isCurrent: () => true, post() {} });
    const command = (type, payload = {}) => controller.handleMessage({ type: `messages/${type}`, payload: { chatIdentity: h.identity, ...payload } });
    activate(); await command('refresh');
    return { controller, runtime, activate, command, idle: () => runtime.active ? new Promise(resolve => waiters.push(resolve)) : Promise.resolve() };
}
