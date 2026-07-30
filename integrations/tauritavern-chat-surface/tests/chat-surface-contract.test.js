import assert from 'node:assert/strict';
import test from 'node:test';

import {
    CHAT_SURFACE_PROTOCOL_VERSION,
    inspectTauriTavernChatSurface,
} from '../environment.js';
import {
    LITTLEWHITEBOX_PARTICIPANT_ID,
    getUnsupportedManagedFeatures,
    registerTauriTavernChatSurfaceParticipant,
} from '../participant.js';

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
