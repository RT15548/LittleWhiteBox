import type { MaintenanceStatus } from '../../../capabilities/maintenance/runner.js';
import type { XiaobaiOsFileState } from '../../../kernel/contracts.js';
import { providerFailureMessage } from '../../../capabilities/agent/provider-failure.js';

export function worldSkippedMessage(reason: string): string {
    switch (reason) {
        case 'no-usable-messages':
        case 'no-complete-assistant': return '先聊一会儿，再来看看新闻吧。';
        case 'generation-active': return '角色正在回复，等这次对话结束后再刷新。';
        case 'chat-unavailable': return '请先进入聊天。';
        case 'no-work': return '暂时没有新消息。';
        default: return '新闻没能更新，请稍后重试。';
    }
}

export function worldStatusMessage(write: XiaobaiOsFileState, status: MaintenanceStatus, pendingSave = false): string {
    switch (write) {
        case 'loading': return '正在加载新闻…';
        case 'saving': return '正在保存新闻…';
        case 'unconfirmed': return '还不确定是否保存成功，请先检查保存，不要重新生成。';
        case 'conflict': return '服务器上的存档与当前内容不同，请先使用已保存版本。';
        case 'failed': return pendingSave
            ? '暂时无法确认是否保存成功。新内容还在，请检查连接后再试，不要重新生成。'
            : '新闻暂时加载不了，请重试。';
    }
    if (status.state === 'running') { return '正在更新新闻…'; }
    if (status.message === 'updated') { return '新闻已更新。'; }
    if (status.message === 'unchanged') { return '暂时没有新消息。'; }
    if (status.message === 'cancelled') { return '已取消更新。'; }
    if (status.message === 'skipped') { return worldSkippedMessage(status.reason); }
    if (status.state !== 'error' && status.message !== 'failed') { return ''; }
    const detail: Record<string, string> = {
        'agent-not-configured': '请先在 API 应用中设置模型和密钥。',
        'config-load-failed': '模型设置加载失败，请到 API 应用中检查。',
        'agent-session-failed': '未能连接模型，请检查 API 配置。',
        'empty-provider-response': '模型没有返回内容，可以稍后重试。',
        'tool-errors-unresolved': '这次生成的新闻有误，请重试。',
        'round-limit': '这次更新还没完成，可以稍后再试。',
        'background-capture-failed': '没有读到故事背景，请先打开聊天。',
        'session-creation-failed': '新闻暂时加载不了，请重试。',
        'save-unconfirmed': '还不确定是否保存成功，请先检查保存。',
        'save-failed': '新闻没能保存，请检查连接后重试。',
    };
    return '本次更新未完成。' + (providerFailureMessage(status.reason)
        || detail[status.reason] || '请稍后重试；如果一直失败，可查看控制台报错。');
}
