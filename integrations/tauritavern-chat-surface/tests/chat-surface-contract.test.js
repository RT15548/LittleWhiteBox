import assert from 'node:assert/strict';
import test from 'node:test';

import { createMessageButtonOwnership } from '../../../core/message-button-ownership.js';
import { mountMessageDecorators } from '../decorator-lifecycle.js';
import {
    CHAT_SURFACE_PROTOCOL_VERSION,
    inspectTauriTavernChatSurface,
} from '../environment.js';
import {
    LITTLEWHITEBOX_PARTICIPANT_ID,
    getUnsupportedManagedFeatures,
    registerTauriTavernChatSurfaceParticipant,
} from '../participant.js';
import { claimIframeRuntimes } from '../runtime-claims.js';
import { applyTauriTavernChatSurfaceSettingsLock } from '../settings-ui.js';

function createSettings(overrides = {}) {
    return {
        enabled: true,
        immersive: { enabled: false },
        preview: { enabled: false },
        storyOutline: { enabled: false },
        tts: { enabled: false },
        fourthWall: { enabled: false },
        ...overrides,
    };
}

function createRegistrationInput(overrides = {}) {
    return {
        environment: { managed: false, api: null },
        settings: createSettings(),
        hasActiveCustomTemplate: () => false,
        isDrawProviderActive: () => false,
        prepareContent() {},
        didMount() {},
        ...overrides,
    };
}

test('missing and older TauriTavern APIs remain on the static renderer', () => {
    assert.deepEqual(inspectTauriTavernChatSurface(undefined), { managed: false, api: null });
    assert.deepEqual(inspectTauriTavernChatSurface({ api: {} }), { managed: false, api: null });

    const api = { isManagedOwnershipRequired: () => false };
    assert.deepEqual(inspectTauriTavernChatSurface({ api: { chatSurface: api } }), {
        managed: false,
        api: null,
    });
});

test('managed ownership is frozen together with the exact host API', () => {
    const api = { isManagedOwnershipRequired: () => true };
    const environment = inspectTauriTavernChatSurface({ api: { chatSurface: api } });

    assert.equal(environment.managed, true);
    assert.equal(environment.api, api);
    assert.equal(Object.isFrozen(environment), true);
});

test('static environments do not register a participant', () => {
    let registered = false;
    const result = registerTauriTavernChatSurfaceParticipant(createRegistrationInput({
        environment: {
            managed: false,
            api: { registerParticipant: () => { registered = true; } },
        },
    }));

    assert.equal(result, null);
    assert.equal(registered, false);
});

test('managed environments register the exact ChatSurface v1 participant', () => {
    const registration = { fault() {} };
    let definition;
    const api = {
        protocolVersion: CHAT_SURFACE_PROTOCOL_VERSION,
        registerParticipant(nextDefinition) {
            definition = nextDefinition;
            return registration;
        },
    };
    const prepareContent = () => {};
    const didMount = () => {};

    const result = registerTauriTavernChatSurfaceParticipant(createRegistrationInput({
        environment: { managed: true, api },
        prepareContent,
        didMount,
    }));

    assert.equal(result, registration);
    assert.deepEqual(definition, {
        id: LITTLEWHITEBOX_PARTICIPANT_ID,
        protocolVersion: CHAT_SURFACE_PROTOCOL_VERSION,
        prepareContent,
        didMount,
    });
});

test('unsupported enabled features reject managed ownership before registration', () => {
    let registered = false;
    const settings = createSettings({
        immersive: { enabled: true },
        preview: { enabled: true },
    });
    const unsupported = getUnsupportedManagedFeatures({
        settings,
        hasActiveCustomTemplate: () => true,
        isDrawProviderActive: () => true,
    });

    assert.deepEqual(unsupported, [
        'immersive mode',
        'message preview/purge',
        'draw provider',
        'custom template iframe',
    ]);
    assert.throws(() => registerTauriTavernChatSurfaceParticipant(createRegistrationInput({
        environment: {
            managed: true,
            api: {
                protocolVersion: CHAT_SURFACE_PROTOCOL_VERSION,
                registerParticipant() { registered = true; },
            },
        },
        settings,
        hasActiveCustomTemplate: () => true,
        isDrawProviderActive: () => true,
    })), /does not support: immersive mode, message preview\/purge, draw provider, custom template iframe/);
    assert.equal(registered, false);
});

test('a disabled LittleWhiteBox still registers its required participant identity', () => {
    let registered = false;
    const settings = createSettings({
        enabled: false,
        immersive: { enabled: true },
    });
    const api = {
        protocolVersion: CHAT_SURFACE_PROTOCOL_VERSION,
        registerParticipant() {
            registered = true;
            return {};
        },
    };

    registerTauriTavernChatSurfaceParticipant(createRegistrationInput({
        environment: { managed: true, api },
        settings,
        hasActiveCustomTemplate: () => true,
        isDrawProviderActive: () => true,
    }));

    assert.equal(registered, true);
});

test('managed ownership rejects protocol mismatches', () => {
    assert.throws(() => registerTauriTavernChatSurfaceParticipant(createRegistrationInput({
        environment: {
            managed: true,
            api: { protocolVersion: CHAT_SURFACE_PROTOCOL_VERSION + 1, registerParticipant() {} },
        },
    })), /participant v1 API is unavailable/);
});

test('externally owned message buttons ignore module-wide cleanup', () => {
    const ownership = createMessageButtonOwnership();
    let cleanupCount = 0;

    assert.equal(ownership.runOwnedCleanup(() => { cleanupCount += 1; }), true);
    ownership.configure(false);
    assert.equal(ownership.ownsButtons(), false);
    assert.equal(ownership.runOwnedCleanup(() => { cleanupCount += 1; }), false);
    assert.equal(cleanupCount, 1);
});

test('message decorator disposer releases decorators and container exactly once', () => {
    const calls = [];
    const element = {};
    const release = mountMessageDecorators({
        element,
        mesid: 12,
        createContainerCleanup(receivedElement) {
            assert.equal(receivedElement, element);
            return () => calls.push('container:release');
        },
        decorators: [
            (_element, mesid) => { calls.push(`first:mount:${mesid}`); return () => calls.push('first:release'); },
            (_element, mesid) => { calls.push(`second:mount:${mesid}`); return () => calls.push('second:release'); },
        ],
    });

    assert.deepEqual(calls, ['first:mount:12', 'second:mount:12']);
    release();
    release();
    assert.deepEqual(calls, [
        'first:mount:12',
        'second:mount:12',
        'second:release',
        'first:release',
        'container:release',
    ]);
});

test('message decorator mount failure rolls back partial managed UI', () => {
    const calls = [];
    assert.throws(() => mountMessageDecorators({
        element: {},
        mesid: 7,
        createContainerCleanup: () => () => calls.push('container:release'),
        decorators: [
            () => () => calls.push('first:release'),
            () => { throw new Error('mount failed'); },
        ],
    }), /mount failed/);
    assert.deepEqual(calls, ['first:release', 'container:release']);
});

test('managed settings lock includes the X button position control', () => {
    const attributes = new Map();
    const classes = new Set();
    const requestedIds = [];
    const control = {
        disabled: false,
        setAttribute(name, value) { attributes.set(name, value); },
        classList: { add(name) { classes.add(name); } },
    };
    const root = {
        getElementById(id) {
            requestedIds.push(id);
            return id === 'xiaobaix_xposition_btn' ? control : null;
        },
    };

    applyTauriTavernChatSurfaceSettingsLock(root);

    assert.equal(requestedIds.includes('xiaobaix_xposition_btn'), true);
    assert.equal(control.disabled, true);
    assert.equal(attributes.get('aria-disabled'), 'true');
    assert.equal(classes.has('disabled-control'), true);
});

test('runtime claims include only renderable code blocks while rendering is enabled', () => {
    const mountRuntime = () => {};
    const codeBlocks = [
        { id: 'html', parentElement: { id: 'html-pre' } },
        { id: 'plain', parentElement: { id: 'plain-pre' } },
    ];
    const claimed = [];
    const content = {
        querySelectorAll(selector) {
            assert.equal(selector, 'pre > code');
            return codeBlocks;
        },
    };
    const claims = { claim(source, activate) { claimed.push({ source, activate }); } };

    claimIframeRuntimes({
        content,
        claims,
        settings: { enabled: true, renderEnabled: true },
        shouldRender: code => code.id === 'html',
        mountRuntime,
    });

    assert.deepEqual(claimed, [{ source: codeBlocks[0].parentElement, activate: mountRuntime }]);
});
