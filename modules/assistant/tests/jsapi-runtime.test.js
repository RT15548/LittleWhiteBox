import test from 'node:test';
import assert from 'node:assert/strict';

import { analyzeJavaScriptApiRequest, runJavaScriptApi } from '../runtime-src/jsapi-runtime.js';

function createManifest() {
    return {
        allowedPaths: [
            'ctx',
            'ctx.variables',
            'ctx.variables.local',
            'ctx.variables.local.add',
            'st',
            'st.extensions',
            'st.extensions.getContext',
        ],
        callablePaths: [
            'ctx.variables.local.add',
            'st.extensions.getContext',
        ],
        apiSemantics: {
            'ctx.variables.local.add': 'write',
        },
    };
}

test('JSAPI analysis treats getContext alias writes as effect', () => {
    const analysis = analyzeJavaScriptApiRequest({
        code: `
const c = st.extensions.getContext();
return c.variables.local.add('lwbtestadd', '测试');
        `,
        apiPaths: ['st.extensions.getContext', 'ctx.variables.local.add'],
        manifest: createManifest(),
    });

    assert.equal(analysis.requestKind, 'effect');
    assert.deepEqual(analysis.validationErrors, []);
    assert(analysis.calledApis.includes('ctx.variables.local.add'));
  });

test('JSAPI execution keeps approval-visible semantics for getContext alias writes', async () => {
    const calls = [];
    const ctx = {
        variables: {
            local: {
                add(key, value) {
                    calls.push([key, value]);
                    return { ok: true, key, value };
                },
            },
        },
    };
    const st = {
        extensions: {
            getContext() {
                return ctx;
            },
        },
    };

    const result = await runJavaScriptApi({
        code: `
const c = st.extensions.getContext();
return c.variables.local.add('lwbtestadd', '测试');
        `,
        purpose: 'test alias effect classification',
        expectedOutput: 'result object',
        apiPaths: ['st.extensions.getContext', 'ctx.variables.local.add'],
        manifest: createManifest(),
        ctx,
        st,
    });

    assert.equal(result.ok, true);
    assert.equal(result.requestKind, 'effect');
    assert.deepEqual(calls, [['lwbtestadd', '测试']]);
    assert.deepEqual(result.calledApis, ['ctx.variables.local.add', 'st.extensions.getContext']);
});
