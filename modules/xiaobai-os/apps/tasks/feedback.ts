import { providerFailureMessage } from '../../capabilities/agent/provider-failure.js';
import type { MaintenanceStatus } from '../../capabilities/maintenance/runner.js';

export function taskFailureMessage(reason: string): string {
    const providerMessage = providerFailureMessage(reason);
    if (providerMessage) { return providerMessage; }
    switch (reason) {
        case 'agent-not-configured': return '请先在 API 应用中设置模型和密钥。';
        case 'config-load-failed': return '模型设置加载失败，请到 API 应用中检查。';
        case 'agent-session-failed': return '连不上模型，请检查 API 设置后重试。';
        case 'empty-provider-response': return '模型没有返回内容，请重试；反复出现时可更换模型。';
        case 'invalid-response':
        case 'tool-errors-unresolved': return '这次生成的任务有误，请重试；如果反复出现，可以更换模型。';
        case 'response-truncated': return '模型回复不完整，请检查输出长度限制后重试。';
        case 'round-limit': return '这次没能完成全部更新，可以稍后再试。';
        case 'background-capture-failed': return '没有读到故事背景，请先打开聊天再试。';
        case 'session-creation-failed':
        case 'session-result-failed': return '任务暂时加载不了，请重新加载后再试。';
        case 'save-unconfirmed': return '还不确定是否保存成功，请先检查保存，不要重新生成。';
        case 'save-conflict': return '服务器上的存档与当前内容不同，请先使用已保存版本，不要重新生成。';
        case 'save-failed': return '这次没能保存，原来的任务还在。请检查连接后重试。';
        default: return '操作没能完成，请重试；如果一直失败，可查看控制台报错。';
    }
}

export function taskMaintenanceMessage(status: MaintenanceStatus, saveRecovered: boolean): string {
    if (status.state === 'running') { return ''; }
    if (saveRecovered && status.reason === 'save-unconfirmed') { return '已加载保存的任务。'; }
    switch (status.message) {
        case 'updated': return '任务已更新。';
        case 'unchanged': return '任务暂时没有新进展。';
        case 'partial': return '部分任务状态已保存，但本次更新未能全部完成。' + taskFailureMessage(status.reason);
        case 'failed': return '任务更新失败。' + taskFailureMessage(status.reason);
        case 'cancelled': return '已取消更新。';
        case 'skipped':
            switch (status.reason) {
                case 'no-work': return '任务暂时没有新进展。';
                case 'no-complete-assistant':
                case 'no-usable-messages': return '先和角色聊一轮，再来更新任务。';
                case 'generation-active': return '角色正在回复，等这次对话结束后再更新任务。';
                case 'chat-unavailable': return '请先进入聊天，再更新任务。';
                case 'participant-disabled': return '任务更新当前不可用，请重新打开 OS 后重试。';
                default: return '任务没能更新，请稍后重试。';
            }
        default: return '';
    }
}
