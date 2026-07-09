import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Ref } from 'vue';
import { preprocessTavernRoleplayMarkdown, useTavernMarkdownTools } from '../app-src/components/chat/useTavernMarkdownTools';

function makeRef<T>(value: T): Ref<T> {
    return { value } as Ref<T>;
}

test('roleplay markdown only substitutes display macros before shared ST-style sanitization', () => {
    const text = [
        '<maintext>',
        '办公楼下的旋转门不知疲倦地转动着。',
        '<user>走出大门，一眼就看到了<CHAR>。',
        '</maintext><Status_block>',
        '<details><summary>[角色状态]</summary>',
        '```',
        '- 👨 <user>的状态',
        '```',
        '</details>',
        '</Status_block>',
    ].join('\n');

    const rendered = preprocessTavernRoleplayMarkdown(text, {
        userName: '林舟',
        characterName: '许知夏',
    });

    assert.match(rendered, /<maintext>/i);
    assert.match(rendered, /<\/maintext><Status_block>/i);
    assert.match(rendered, /<\/Status_block>/i);
    assert.match(rendered, /办公楼下的旋转门/);
    assert.match(rendered, /林舟走出大门，一眼就看到了许知夏。/);
    assert.match(rendered, /<details><summary>\[角色状态\]<\/summary>/);
    assert.match(rendered, /```\n- 👨 林舟的状态\n```/);
});

test('roleplay markdown keeps fenced HTML renderable after macro substitution', () => {
    const rendered = preprocessTavernRoleplayMarkdown([
        '界面如下：',
        '```html',
        '<main><h1><user> / <bot></h1><section>内容</section></main>',
        '```',
    ].join('\n'), {
        userName: '林舟',
        characterName: '许知夏',
    });

    assert.match(rendered, /界面如下：/);
    assert.match(rendered, /```html\n<main><h1>林舟 \/ 许知夏<\/h1><section>内容<\/section><\/main>\n```/);
});

test('roleplay markdown keeps guidance details from swallowing following RP content', () => {
    const tools = useTavernMarkdownTools({
        chatScrollRef: makeRef<HTMLElement | null>(null),
        managerScrollRef: makeRef<HTMLElement | null>(null),
        htmlRenderEnabled: makeRef(true),
        htmlThemeDark: makeRef(true),
        alertDialog: async () => {},
        confirmDialog: async () => true,
        requestHost: async () => ({}),
    });
    const html = tools.renderChatMarkdown([
        '<details style="margin: 8px 0;">',
        '    <summary style="display: flex;">',
        '        <div class="xb-char-avatar"></div>',
        '        <span>深层思考中...</span>',
        '    </summary>',
        '    <div style="padding: 10px 12px;">',
        '## Phase 首要确认',
        '- 承诺：完全按照思考步骤进行思考。',
        '- 绝不歧视。中文是最优美的语言。',
        '    </div>',
        '</details>',
        '',
        '<fictional_scenarios>',
        '沈知意正低头看手机上的时间。',
        '</fictional_scenarios>',
        '',
        '```',
        '状态栏',
        '时间：周六 14:15',
        '```',
    ].join('\n'), { roleplay: true });

    assert.match(html, /<details[\s\S]*<h2 id="phase">Phase 首要确认<\/h2>[\s\S]*<\/details>/);
    assert.match(html, /<\/details>\s*<fictional_scenarios>\s*<p>沈知意正低头看手机上的时间。<\/p>\s*<\/fictional_scenarios>/);
    assert.match(html, /<pre><code>状态栏[\s\S]*周六 14:15[\s\S]*<\/code><\/pre>/);
    assert.doesNotMatch(html, /<details[\s\S]*<fictional_scenarios>[\s\S]*<\/details>/);
    assert.doesNotMatch(html, /<p>\s*<details/);
    assert.doesNotMatch(html, /<\/details>\s*<\/li>/);
});

test('tavern html generate relay returns parent responses to the requesting iframe', () => {
    const host = globalThis as Record<string, unknown>;
    const previousWindow = host.window;
    const listeners = new Map<string, Array<(event: Record<string, unknown>) => void>>();
    const parentMessages: Array<{ payload: unknown; origin: string }> = [];
    const iframeMessages: Array<{ payload: unknown; origin: string }> = [];
    const timers = new Map<number, () => void>();
    let nextTimerId = 1;

    const parentWindow = {
        postMessage(payload: unknown, origin: string) {
            parentMessages.push({ payload, origin });
        },
    };
    const fakeWindow = {
        location: { origin: 'https://tavern.local' },
        parent: parentWindow,
        addEventListener(type: string, listener: (event: Record<string, unknown>) => void) {
            const bucket = listeners.get(type) || [];
            bucket.push(listener);
            listeners.set(type, bucket);
        },
        removeEventListener(type: string, listener: (event: Record<string, unknown>) => void) {
            const bucket = listeners.get(type) || [];
            listeners.set(type, bucket.filter((item) => item !== listener));
        },
        setTimeout(callback: () => void, delay: number) {
            assert.equal(delay, 300_000);
            const id = nextTimerId;
            nextTimerId += 1;
            timers.set(id, callback);
            return id;
        },
        clearTimeout(id: number) {
            timers.delete(id);
        },
    };
    const innerWindow = {
        postMessage(payload: unknown, origin: string) {
            iframeMessages.push({ payload, origin });
        },
    };
    const iframe = { contentWindow: innerWindow };
    const root = {
        querySelectorAll(selector: string) {
            assert.equal(selector, 'iframe.xb-tavern-html-iframe');
            return [iframe];
        },
    };

    host.window = fakeWindow;
    try {
        const tools = useTavernMarkdownTools({
            chatScrollRef: makeRef(root as unknown as HTMLElement | null),
            managerScrollRef: makeRef<HTMLElement | null>(null),
            htmlRenderEnabled: makeRef(true),
            htmlThemeDark: makeRef(true),
            alertDialog: async () => {},
            confirmDialog: async () => true,
            requestHost: async () => ({}),
        });
        const dispatchMessage = (event: Record<string, unknown>) => {
            for (const listener of listeners.get('message') || []) {
                listener(event);
            }
        };

        dispatchMessage({
            source: innerWindow,
            origin: 'https://preview.example',
            data: {
                type: 'generateRequest',
                id: 'relay-1',
                options: { prompt: 'hello' },
            },
        });

        assert.deepEqual(parentMessages, [{
            payload: {
                type: 'generateRequest',
                id: 'relay-1',
                options: { prompt: 'hello' },
            },
            origin: 'https://tavern.local',
        }]);
        assert.equal(timers.size, 1);

        dispatchMessage({
            source: parentWindow,
            origin: 'https://tavern.local',
            data: {
                source: 'xiaobaix-host',
                type: 'generateStreamChunk',
                id: 'relay-1',
                text: 'partial',
            },
        });
        dispatchMessage({
            source: parentWindow,
            origin: 'https://tavern.local',
            data: {
                source: 'xiaobaix-host',
                type: 'generateResult',
                id: 'relay-1',
                text: 'done',
            },
        });
        dispatchMessage({
            source: parentWindow,
            origin: 'https://tavern.local',
            data: {
                source: 'xiaobaix-host',
                type: 'generateStreamChunk',
                id: 'relay-1',
                text: 'too-late',
            },
        });

        assert.deepEqual(iframeMessages, [
            {
                payload: {
                    source: 'xiaobaix-host',
                    type: 'generateStreamChunk',
                    id: 'relay-1',
                    text: 'partial',
                },
                origin: 'https://preview.example',
            },
            {
                payload: {
                    source: 'xiaobaix-host',
                    type: 'generateResult',
                    id: 'relay-1',
                    text: 'done',
                },
                origin: 'https://preview.example',
            },
        ]);
        assert.equal(timers.size, 0);

        dispatchMessage({
            source: innerWindow,
            origin: 'null',
            data: {
                type: 'generateRequest',
                id: 'relay-2',
                options: {},
            },
        });
        assert.equal(timers.size, 1);
        dispatchMessage({
            source: parentWindow,
            origin: 'https://tavern.local',
            data: {
                source: 'xiaobaix-host',
                type: 'generateStreamChunk',
                id: 'relay-2',
                text: 'opaque-origin',
            },
        });
        assert.deepEqual(iframeMessages[2], {
            payload: {
                source: 'xiaobaix-host',
                type: 'generateStreamChunk',
                id: 'relay-2',
                text: 'opaque-origin',
            },
            origin: '*',
        });
        const [timeoutId, timeout] = [...timers.entries()][0];
        timers.delete(timeoutId);
        timeout();
        assert.equal(timers.size, 0);
        dispatchMessage({
            source: parentWindow,
            origin: 'https://tavern.local',
            data: {
                source: 'xiaobaix-host',
                type: 'generateResult',
                id: 'relay-2',
                text: 'after-timeout',
            },
        });
        assert.equal(iframeMessages.length, 3);

        tools.disposeMarkdownTools();
        assert.equal(listeners.get('message')?.length || 0, 0);
    } finally {
        if (previousWindow === undefined) {
            delete host.window;
        } else {
            host.window = previousWindow;
        }
    }
});

test('tavern html iframe height updates ignore zero probes and apply measured heights on a frame', () => {
    const host = globalThis as Record<string, unknown>;
    const previousWindow = host.window;
    const listeners = new Map<string, Array<(event: Record<string, unknown>) => void>>();
    const frames = new Map<number, () => void>();
    let nextFrameId = 1;
    let preserveCalls = 0;

    const fakeWindow = {
        location: { origin: 'https://tavern.local' },
        parent: {},
        addEventListener(type: string, listener: (event: Record<string, unknown>) => void) {
            const bucket = listeners.get(type) || [];
            bucket.push(listener);
            listeners.set(type, bucket);
        },
        removeEventListener(type: string, listener: (event: Record<string, unknown>) => void) {
            const bucket = listeners.get(type) || [];
            listeners.set(type, bucket.filter((item) => item !== listener));
        },
        setTimeout(callback: () => void) {
            callback();
            return 1;
        },
        clearTimeout() {},
        requestAnimationFrame(callback: () => void) {
            const id = nextFrameId;
            nextFrameId += 1;
            frames.set(id, callback);
            return id;
        },
        cancelAnimationFrame(id: number) {
            frames.delete(id);
        },
    };
    const innerWindow = {};
    const iframe = {
        contentWindow: innerWindow,
        isConnected: true,
        style: { height: '' },
    };
    const root = {
        querySelectorAll(selector: string) {
            assert.equal(selector, 'iframe.xb-tavern-html-iframe');
            return [iframe];
        },
    };

    host.window = fakeWindow;
    try {
        useTavernMarkdownTools({
            chatScrollRef: makeRef(root as unknown as HTMLElement | null),
            managerScrollRef: makeRef<HTMLElement | null>(null),
            htmlRenderEnabled: makeRef(true),
            htmlThemeDark: makeRef(true),
            alertDialog: async () => {},
            confirmDialog: async () => true,
            requestHost: async () => ({}),
            preserveChatScroll: (mutation) => {
                preserveCalls += 1;
                return mutation();
            },
        });
        const dispatchMessage = (event: Record<string, unknown>) => {
            for (const listener of listeners.get('message') || []) {
                listener(event);
            }
        };

        dispatchMessage({
            source: innerWindow,
            origin: 'https://preview.example',
            data: { height: 0, force: true },
        });

        assert.equal(frames.size, 0);
        assert.equal(iframe.style.height, '');
        assert.equal(preserveCalls, 0);

        dispatchMessage({
            source: innerWindow,
            origin: 'https://preview.example',
            data: { height: 42.2, force: true },
        });

        assert.equal(frames.size, 1);
        for (const callback of frames.values()) {
            callback();
        }
        assert.equal(iframe.style.height, '43px');
        assert.equal(preserveCalls, 1);
    } finally {
        host.window = previousWindow;
    }
});
