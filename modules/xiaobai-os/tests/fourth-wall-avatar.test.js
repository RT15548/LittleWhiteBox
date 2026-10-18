import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { build } from 'esbuild';

const nativeAvatarSource = readFileSync(new URL('./fixtures/sillytavern-1.14-avatar.js', import.meta.url), 'utf8');
const compiled = await build({
    stdin: {
        contents: `export { getSillyTavernChatSnapshot } from '../apps/fourth-wall/host/sillytavern-adapter.ts';
            export { host, selectAvatar } from 'avatar-test-host';`,
        resolveDir: fileURLToPath(new URL('.', import.meta.url)),
    },
    bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
    plugins: [{ name: 'native-avatar-fixture', setup(builder) {
        builder.onResolve({ filter: /(?:^avatar-test-host$|\/(?:extensions|script|personas)\.js$)/ },
            () => ({ path: 'host', namespace: 'fixture' }));
        builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: `${nativeAvatarSource}
            export const host = { context: null };
            export const getContext = () => host.context;
            export const extension_settings = {};
            export const saveSettingsDebounced = () => {};
            export const saveSettings = async () => {};
            export const getRequestHeaders = () => ({});
            export const eventSource = {};
            export const event_types = {};
            export function selectAvatar(value) { user_avatar = value; }
        ` }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Only repository adapters and the frozen native fixture are bundled.
const { getSillyTavernChatSnapshot, host, selectAvatar } = await import(
    `data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);

function setup(avatar = 'selected-user.png') {
    // Native getContext() supplies characters but no user_avatar or persona.avatar.
    host.context = {
        chatId: 'chat', characterId: 0, groupId: null,
        characters: [{ name: 'Character', avatar: 'character.png' }],
        name1: 'User', name2: 'Character', chat: [],
    };
    selectAvatar(avatar);
}

test('Fourth Wall uses the selected persona without context avatar fields', () => {
    setup();
    const snapshot = getSillyTavernChatSnapshot();
    assert.equal(snapshot.userAvatar, '/thumbnail?type=persona&file=selected-user.png');
    assert.equal(snapshot.characterAvatar, '/characters/character.png');
});

test('subsequent snapshots read the current persona and preserve special filename characters', () => {
    setup();
    const before = getSillyTavernChatSnapshot();
    selectAvatar('用户 头像 #&+%.png');
    const url = new URL(getSillyTavernChatSnapshot().userAvatar, 'http://localhost');
    assert.equal(url.pathname, '/thumbnail');
    assert.equal(url.searchParams.get('type'), 'persona');
    assert.equal(url.searchParams.get('file'), '用户 头像 #&+%.png');
    assert.equal(before.userAvatar, '/thumbnail?type=persona&file=selected-user.png');
});

test('no selected persona uses the default asset from the site root', () => {
    setup('');
    assert.equal(getSillyTavernChatSnapshot().userAvatar, '/img/user-default.png');
});

test('no active chat still produces no chat snapshot', () => {
    setup();
    host.context.chatId = '';
    assert.equal(getSillyTavernChatSnapshot(), null);
});
