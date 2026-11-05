import { SillyTavernOpenAICompatibleAdapter } from './sillytavern-openai-compatible.js';
import {
    analyzeAssistantText,
    buildTaggedMessages,
    extractResponseTaggedToolCalls,
} from './openai-compatible.js';

// 跟随酒馆主 API：直接调用 ST 页内 generateRaw()，把整个生成流程交回 ST 后端。
// 主界面怎么连（Vertex SA JSON / Vertex API key / OpenAI / 其他），Agent 就跟着怎么连。
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

function flatten(content) {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
        return content.map((part) => (part && typeof part === 'object' && typeof part.text === 'string'
            ? part.text
            : '')).filter(Boolean).join('\n');
    }
    return '';
}

export class SillyTavernVertexAdapter extends SillyTavernOpenAICompatibleAdapter {
    async chat(task) {
        const ctx = getStContext();
        if (typeof ctx?.generateRaw !== 'function') {
            console.warn('[SillyTavernVertex] 页内 generateRaw 不可用，退回 HTTP chat-completions 路径');
            return super.chat(task);
        }

        // tagged-json：把工具规约嵌入消息，模型输出纯文字含 <tool_call> 标签
        const taggedMessages = buildTaggedMessages(task, this.config.model);
        // ST generateRaw 只吃 { role, content: string } 的纯字符串消息
        const messages = taggedMessages.map((message) => ({
            role: ['system', 'user', 'assistant'].includes(message.role) ? message.role : 'user',
            content: flatten(message.content),
        }));
        const promptText = messages.map((message) => `${message.role}: ${message.content}`).join('\n\n');
        console.debug('[SillyTavernVertex] 跟随主 API 生成，prompt 前 200 字：', promptText.slice(0, 200));
        try {
            const text = String((await ctx.generateRaw({
                prompt: messages,
                responseLength: MAIN_API_RESPONSE_LENGTH,
            }))?.trim?.() ?? '');
            if (!text) {
                console.warn('[SillyTavernVertex] generateRaw 回空。消息数：', messages.length,
                    '消息 role 序列：', messages.map((message) => message.role).join(','),
                    'prompt 尾 300 字：', promptText.slice(-300));
            }

            const requestInspection = {
                provider: this.config.provider || 'sillytavern-vertex',
                model: this.config.model,
                transport: 'sillytavern-generate-raw',
                request: { body: { prompt: messages, responseLength: MAIN_API_RESPONSE_LENGTH } },
            };

            const analysis = analyzeAssistantText(text);
            const toolCalls = extractResponseTaggedToolCalls(task, analysis, { role: 'assistant', content: text }, requestInspection);
            const displayText = analysis.text;

            if (typeof task.onStreamProgress === 'function') {
                task.onStreamProgress({ text: displayText });
            }
            return {
                text: displayText,
                toolCalls,
                thoughts: [],
                finishReason: 'stop',
                model: this.config.model,
                provider: this.config.provider || 'sillytavern-vertex',
                requestInspection,
            };
        } catch (error) {
            console.warn('[SillyTavernVertex] 跟随主 API 生成失败：', error?.message || error);
            throw error;
        }
    }
}
