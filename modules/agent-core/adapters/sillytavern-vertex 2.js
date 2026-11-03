import {
    HOST_CHAT_COMPLETIONS_SOURCE_OPENAI,
} from '../../../shared/host-llm/chat-completions/client.js';
import { SillyTavernOpenAICompatibleAdapter } from './sillytavern-openai-compatible.js';
import {
    buildTaggedMessages,
    extractResponseTaggedToolCalls,
    stripTaggedToolCallsForDisplay,
} from './openai-compatible.js';

// 跟隨酒館主 API：直接呼叫 ST 頁內 generateRaw()，把整個生成流程交回 ST 後端。
// 主界面怎麼連（Vertex SA JSON / Vertex API key / OpenAI / 其他），Agent 就跟著怎麼連。
//

const MAIN_API_RESPONSE_LENGTH = 65535;

function getStContext() {
    try {
        const st = (typeof globalThis !== 'undefined' && globalThis.SillyTavern)
            || (typeof window !== 'undefined' ? window.SillyTavern : null);
        return st?.getContext?.() || null;
    } catch {
        return null;
    }
}

export class SillyTavernVertexAdapter extends SillyTavernOpenAICompatibleAdapter {
    provider = 'sillytavern-vertex';
    source = HOST_CHAT_COMPLETIONS_SOURCE_OPENAI;

    async chat(task) {
        const ctx = getStContext();
        if (typeof ctx?.generateRaw !== 'function') {
            console.warn('[SillyTavernVertex] 頁內 generateRaw 不可用，退回 HTTP chat-completions 路徑');
            return super.chat(task);
        }

        // tagged-json：把工具規約嵌入訊息，模型輸出純文字含 <tool_call> 標籤
        const taggedMessages = buildTaggedMessages(task, this.config.model);
        // ST generateRaw 只吃 { role, content: string } 的純字串訊息
        const messages = taggedMessages.map((m) => ({
            role: m.role === 'system' || m.role === 'user' || m.role === 'assistant' ? m.role : 'user',
            content: flatten(m.content),
        }));
        const promptText = messages.map((m) => `${m.role}: ${m.content}`).join('\n\n');
        console.debug('[SillyTavernVertex] 跟隨主 API 生成，prompt 前 200 字：', promptText.slice(0, 200));
        try {
            const text = String((await ctx.generateRaw({
                prompt: messages,
                responseLength: MAIN_API_RESPONSE_LENGTH,
            }))?.trim?.() ?? '');
            if (!text) {
                console.warn('[SillyTavernVertex] generateRaw 回空。訊息數：', messages.length,
                    '訊息 role 序列：', messages.map((m) => m.role).join(','),
                    'prompt 尾 300 字：', promptText.slice(-300));
            }

            const requestInspection = {
                provider: this.provider,
                model: this.config.model,
                transport: 'sillytavern-generate-raw',
                request: { body: { prompt: messages, responseLength: MAIN_API_RESPONSE_LENGTH } },
            };

            // 從純文字回覆解析 <tool_call> 標籤
            const toolCalls = extractResponseTaggedToolCalls(task, text, {}, requestInspection);
            const displayText = stripTaggedToolCallsForDisplay(text);

            if (typeof task.onStreamProgress === 'function') {
                task.onStreamProgress({ text: displayText });
            }
            return {
                text: displayText,
                toolCalls,
                thoughts: [],
                finishReason: 'stop',
                model: this.config.model,
                provider: this.provider,
                requestInspection,
            };
        } catch (error) {
            console.warn('[SillyTavernVertex] 跟隨主 API 生成失敗：', error?.message || error);
            throw error;
        }
    }
}

function flatten(content) {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
        return content.map((p) => p && typeof p === 'object' && typeof p.text === 'string'
            ? p.text
            : '').filter(Boolean).join('\n');
    }
    return '';
}
