import assert from 'node:assert/strict';
import test from 'node:test';

import { notifySillyTavernSuccess } from '../host/notifications.js';

test('success notices use the host toast with literal text and HTML escaping', t => {
    const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
    const calls = [];
    Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: { toastr: { success: (...args) => calls.push(args) } },
    });
    t.after(() => {
        if (previous) {Object.defineProperty(globalThis, 'window', previous);}
        else {delete globalThis.window;}
    });
    const notice = { title: '<b>title</b>', message: '{{user}} | /echo <img src=x onerror=alert(1)>' };
    notifySillyTavernSuccess(notice);
    // The external toastr contract must escape untrusted text, not execute HTML or STscript.
    assert.deepEqual(calls, [[notice.message, notice.title, { escapeHtml: true, timeOut: 8_000 }]]);
});
