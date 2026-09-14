import type { MaintenanceStatus } from '../../../capabilities/maintenance/runner.js';
import type { MapClientState } from '../types.js';
import { providerFailureMessage } from '../../../capabilities/agent/provider-failure.js';

// Only closed, application-owned categories cross into the UI; never provider errors or credentials.
function failureReason(reason: string): string {
    const providerMessage = providerFailureMessage(reason);
    if (providerMessage) { return providerMessage; }
    switch (reason) {
        case 'agent-not-configured': return '请先在 API 应用中设置模型和密钥。';
        case 'config-load-failed': return '模型设置加载失败，请到 API 应用中检查。';
        case 'agent-session-failed': return '连不上模型，请检查 API 设置后重试。';
        case 'empty-provider-response': return '模型返回了空内容，请稍后重试，或在 API 应用中更换模型。';
        case 'tool-errors-unresolved': return '这次生成的地图有误，请重试；如果反复出现，可以更换模型。';
        case 'round-limit': return '这次还没画完，可以稍后继续更新。';
        case 'background-capture-failed': return '没有读到角色或故事背景，请先打开聊天再试。';
        case 'session-creation-failed': return '地图暂时加载不了，请重新打开地图。';
        case 'session-result-failed': return '这次没能生成地图，请稍后重试。';
        case 'save-unconfirmed': return '还不确定是否保存成功，请先检查保存，不要再次更新。';
        case 'save-failed': return '地图没能保存，请检查连接后重试。';
        default: return '请稍后重试；如果一直失败，可查看控制台报错。';
    }
}

export function skippedMaintenanceMessage(reason: string): string {
    switch (reason) {
        case 'generation-active': return '角色正在回复，请等这轮对话结束后再更新地图。';
        case 'no-complete-assistant': return '还没有完整的角色回复，请完成一轮对话后再更新地图。';
        case 'no-usable-messages': return '当前没有可用于更新地图的对话内容。';
        case 'chat-unavailable': return '请先打开一个聊天，再更新地图。';
        case 'participant-disabled': return '地图更新当前不可用，请重新打开 OS 后重试。';
        case 'no-work': return '当前没有需要更新的地图内容。';
        default: return '未能开始地图更新，请确认聊天已加载后重试。';
    }
}

export function maintenanceState(status: MaintenanceStatus): Pick<MapClientState, 'maintenanceStatus' | 'maintenanceMessage'> {
    if (status.state === 'running') {
        return { maintenanceStatus: status.mode === 'rebuild' ? 'rebuilding' : 'maintaining', maintenanceMessage: '' };
    }
    let maintenanceMessage = '';
    if (status.message === 'updated') {
        maintenanceMessage = status.mode === 'rebuild' ? '地图已画好并保存。' : '地图已更新。';
    } else if (status.message === 'unchanged') {
        maintenanceMessage = status.mode === 'rebuild' ? '这次没有绘制出地图，可以补充世界设定后重试。' : '地图暂时没有变化。';
    } else if (status.message === 'partial') {
        maintenanceMessage = `部分地图已保存，但本次更新未能全部完成。${failureReason(status.reason)}`;
    } else if (status.message === 'cancelled') {
        maintenanceMessage = '已取消更新。';
    } else if (status.message === 'skipped') {
        maintenanceMessage = skippedMaintenanceMessage(status.reason);
    } else if (status.state === 'error' || status.message === 'failed') {
        maintenanceMessage = `地图更新未完成。${failureReason(status.reason)}`;
    }
    return {
        maintenanceStatus: status.state === 'error' || status.message === 'failed' ? 'error' : 'idle',
        maintenanceMessage,
    };
}
