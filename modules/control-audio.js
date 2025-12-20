"use strict";

import { extension_settings } from "../../../../extensions.js";
import { eventSource, event_types } from "../../../../../script.js";
import { SlashCommandParser } from "../../../../slash-commands/SlashCommandParser.js";
import { SlashCommand } from "../../../../slash-commands/SlashCommand.js";
import { ARGUMENT_TYPE, SlashCommandArgument, SlashCommandNamedArgument } from "../../../../slash-commands/SlashCommandArgument.js";

const AudioHost = (() => {
    /** @typedef {{ audio: HTMLAudioElement|null, currentUrl: string }} AudioInstance */
    /** @type {Record<'primary'|'secondary', AudioInstance>} */
    const instances = {
        primary: { audio: null, currentUrl: "" },
        secondary: { audio: null, currentUrl: "" },
    };

    /**
     * @param {('primary'|'secondary')} area
     * @returns {HTMLAudioElement}
     */
    function getOrCreate(area) {
        const inst = instances[area] || (instances[area] = { audio: null, currentUrl: "" });
        if (!inst.audio) {
            inst.audio = new Audio();
            inst.audio.preload = "auto";
            try { inst.audio.crossOrigin = "anonymous"; } catch { }
        }
        return inst.audio;
    }

    /**
     * @param {string} url
     * @param {boolean} loop
     * @param {('primary'|'secondary')} area
     * @param {number} volume10 1-10
     */
    async function playUrl(url, loop = false, area = 'primary', volume10 = 5) {
        const u = String(url || "").trim();
        if (!/^https?:\/\//i.test(u)) throw new Error("仅支持 http/https 链接");
        const a = getOrCreate(area);
        a.loop = !!loop;

        let v = Number(volume10);
        if (!Number.isFinite(v)) v = 5;
        v = Math.max(1, Math.min(10, v));
        try { a.volume = v / 10; } catch { }

        const inst = instances[area];
        if (inst.currentUrl && u === inst.currentUrl) {
            if (a.paused) await a.play();
            return `继续播放: ${u}`;
        }

        inst.currentUrl = u;
        if (a.src !== u) {
            a.src = u;
            try { await a.play(); }
            catch (e) { throw new Error("播放失败"); }
        } else {
            try { a.currentTime = 0; await a.play(); } catch { }
        }
        return `播放: ${u}`;
    }

    /**
     * @param {('primary'|'secondary')} area
     */
    function stop(area = 'primary') {
        const inst = instances[area];
        if (inst?.audio) {
            try { inst.audio.pause(); } catch { }
        }
        return "已停止";
    }

    /**
     * @param {('primary'|'secondary')} area
     */
    function getCurrentUrl(area = 'primary') {
        const inst = instances[area];
        return inst?.currentUrl || "";
    }

    function reset() {
        for (const key of /** @type {('primary'|'secondary')[]} */(['primary','secondary'])) {
            const inst = instances[key];
            if (inst.audio) {
                try { inst.audio.pause(); } catch { }
                try { inst.audio.removeAttribute('src'); inst.audio.load(); } catch { }
            }
            inst.currentUrl = "";
        }
    }

    function stopAll() {
        for (const key of /** @type {('primary'|'secondary')[]} */(['primary','secondary'])) {
            const inst = instances[key];
            if (inst?.audio) {
                try { inst.audio.pause(); } catch { }
            }
        }
        return "已全部停止";
    }

    /**
     * 清除指定实例：停止并移除 src，清空 currentUrl
     * @param {('primary'|'secondary')} area
     */
    function clear(area = 'primary') {
        const inst = instances[area];
        if (inst?.audio) {
            try { inst.audio.pause(); } catch { }
            try { inst.audio.removeAttribute('src'); inst.audio.load(); } catch { }
        }
        inst.currentUrl = "";
        return "已清除";
    }

    return { playUrl, stop, stopAll, clear, getCurrentUrl, reset };
})();

let registeredCommand = null;
let chatChangedHandler = null;
let isRegistered = false;
let globalStateChangedHandler = null;

function registerSlash() {
    if (isRegistered) return;
    try {
        registeredCommand = SlashCommand.fromProps({
            name: "xbaudio",
            callback: async (args, value) => {
                try {
                    const action = String(args.play || "").toLowerCase();
                    const mode = String(args.mode || "loop").toLowerCase();
                        const rawArea = args.area;
                        const hasArea = typeof rawArea !== 'undefined' && rawArea !== null && String(rawArea).trim() !== '';
                        const area = hasArea && String(rawArea).toLowerCase() === 'secondary' ? 'secondary' : 'primary';
                        const volumeArg = args.volume;
                        let volume = Number(volumeArg);
                        if (!Number.isFinite(volume)) volume = 5;
                    const url = String(value || "").trim();
                    const loop = mode === "loop";

                        if (url.toLowerCase() === "list") {
                            return AudioHost.getCurrentUrl(area) || "";
                    }

                    if (action === "off") {
                            if (hasArea) {
                                return AudioHost.stop(area);
                            }
                            return AudioHost.stopAll();
                    }

                        if (action === "clear") {
                            if (hasArea) {
                                return AudioHost.clear(area);
                            }
                            AudioHost.reset();
                            return "已全部清除";
                        }

                    if (action === "on" || (!action && url)) {
                            return await AudioHost.playUrl(url, loop, area, volume);
                    }

                    if (!url && !action) {
                            const cur = AudioHost.getCurrentUrl(area);
                            return cur ? `当前播放(${area}): ${cur}` : "未在播放。用法: /xbaudio [play=on] [mode=loop] [area=primary/secondary] [volume=5] URL | /xbaudio list | /xbaudio play=off (未指定 area 将关闭全部)";
                    }

                        return "用法: /xbaudio play=off | /xbaudio play=off area=primary/secondary | /xbaudio play=clear | /xbaudio play=clear area=primary/secondary | /xbaudio [play=on] [mode=loop/once] [area=primary/secondary] [volume=1-10] URL | /xbaudio list (默认: play=on mode=loop area=primary volume=5；未指定 area 的 play=off 关闭全部；未指定 area 的 play=clear 清除全部)";
                } catch (e) {
                    return `错误: ${e.message || e}`;
                }
            },
            namedArgumentList: [
                SlashCommandNamedArgument.fromProps({ name: "play", description: "on/off/clear 或留空以默认播放", typeList: [ARGUMENT_TYPE.STRING], enumList: ["on", "off", "clear"] }),
                SlashCommandNamedArgument.fromProps({ name: "mode", description: "once/loop", typeList: [ARGUMENT_TYPE.STRING], enumList: ["once", "loop"] }),
                    SlashCommandNamedArgument.fromProps({ name: "area", description: "primary/secondary (play=off 未指定 area 关闭全部)", typeList: [ARGUMENT_TYPE.STRING], enumList: ["primary", "secondary"] }),
                    SlashCommandNamedArgument.fromProps({ name: "volume", description: "音量 1-10（默认 5）", typeList: [ARGUMENT_TYPE.NUMBER] }),
            ],
            unnamedArgumentList: [
                SlashCommandArgument.fromProps({ description: "音频URL (http/https) 或 list", typeList: [ARGUMENT_TYPE.STRING] }),
            ],
                helpString: "播放网络音频。示例: /xbaudio https://files.catbox.moe/0ryoa5.mp3 (默认: play=on mode=loop area=primary volume=5) | /xbaudio area=secondary volume=8 https://files.catbox.moe/0ryoa5.mp3 | /xbaudio list | /xbaudio play=off (未指定 area 关闭全部) | /xbaudio play=off area=primary | /xbaudio play=clear (未指定 area 清除全部)",
        });
        SlashCommandParser.addCommandObject(registeredCommand);
        if (event_types?.CHAT_CHANGED) {
            chatChangedHandler = () => { try { AudioHost.reset(); } catch { } };
            eventSource.on(event_types.CHAT_CHANGED, chatChangedHandler);
        }
        isRegistered = true;
    } catch (e) {
        console.error("[LittleWhiteBox][audio] 注册斜杠命令失败", e);
    }
}

function unregisterSlash() {
    if (!isRegistered) return;
    try {
        if (chatChangedHandler && event_types?.CHAT_CHANGED) {
            try { eventSource.removeListener(event_types.CHAT_CHANGED, chatChangedHandler); } catch { }
        }
        chatChangedHandler = null;
        try {
            const map = SlashCommandParser.commands || {};
            Object.keys(map).forEach((k) => { if (map[k] === registeredCommand) delete map[k]; });
        } catch { }
    } finally {
        registeredCommand = null;
        isRegistered = false;
    }
}

function enableFeature() {
    registerSlash();
}

function disableFeature() {
    try { AudioHost.reset(); } catch { }
    unregisterSlash();
}

export function initControlAudio() {
    try {
        try {
            const enabled = !!(extension_settings?.LittleWhiteBox?.audio?.enabled ?? true);
            if (enabled) enableFeature(); else disableFeature();
        } catch { enableFeature(); }

        const bind = () => {
            const cb = document.getElementById('xiaobaix_audio_enabled');
            if (!cb) { setTimeout(bind, 200); return; }
            const applyState = () => {
                const input = /** @type {HTMLInputElement} */(cb);
                const enabled = !!(input && input.checked);
                if (enabled) enableFeature(); else disableFeature();
            };
            cb.addEventListener('change', applyState);
            applyState();
        };
        bind();

        // 监听扩展全局开关，关闭时强制停止并清理两个实例
        try {
            if (!globalStateChangedHandler) {
                globalStateChangedHandler = (e) => {
                    try {
                        const enabled = !!(e && e.detail && e.detail.enabled);
                        if (!enabled) {
                            try { AudioHost.reset(); } catch { }
                            unregisterSlash();
                        } else {
                            // 重新根据子开关状态应用
                            const audioEnabled = !!(extension_settings?.LittleWhiteBox?.audio?.enabled ?? true);
                            if (audioEnabled) enableFeature(); else disableFeature();
                        }
                    } catch { }
                };
                document.addEventListener('xiaobaixEnabledChanged', globalStateChangedHandler);
            }
        } catch { }
    } catch (e) {
        console.error("[LittleWhiteBox][audio] 初始化失败", e);
    }
}
