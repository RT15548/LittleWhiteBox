import OpenAI from 'openai';

export class OpenAICompatibleAdapter {
    constructor(config) {
        this.config = config;
        this.client = new OpenAI({
            apiKey: config.apiKey,
            baseURL: String(config.baseUrl || 'https://api.openai.com/v1').replace(/\/$/, ''),
            timeout: Number(config.timeoutMs) || 180000,
            maxRetries: 0,
            dangerouslyAllowBrowser: true,
        });
    }

    async chat(task) {
        const response = await this.client.chat.completions.create({
            model: this.config.model,
            messages: task.messages,
            tools: task.tools,
            tool_choice: task.toolChoice || 'auto',
            temperature: task.temperature,
            max_tokens: task.maxTokens,
        }, {
            signal: task.signal,
        });

        const choice = response.choices?.[0] || {};
        const message = choice.message || {};
        const toolCalls = (message.tool_calls || []).map((item) => ({
            id: item.id || `openai-tool-${Date.now()}`,
            name: item.function?.name || '',
            arguments: item.function?.arguments || '{}',
        })).filter((item) => item.name);

        return {
            text: message.content || '',
            toolCalls,
            finishReason: choice.finish_reason || 'stop',
            model: response.model || this.config.model,
            provider: 'openai-compatible',
        };
    }
}
