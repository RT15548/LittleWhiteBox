import type { ProviderFailureReason } from '../../../capabilities/agent/provider-failure.js';
import { LearningValidationError } from '../../../domains/learning/profile.js';

export const LEARNING_STORAGE_COPY = {
    unconfirmed: '还没确认保存是否成功，请先查看保存结果，不要重复提交。',
    conflict: '发现另一份学习记录，请先核对再继续。', unloaded: '暂时打不开学习记录。',
    invalid: '学习数据无法使用，重置后即可重新开始。',
    failed: '这次没能保存，之前保存的内容都还在，请重试。',
};

export const LEARNING_REWARD_COPY = {
    paid: '奖励已到账', retired: '钱包已重置，这份奖励不再补发', saving: '正在保存学习成果…',
    pending: '学习已完成，奖励待领取', needsWallet: '开通钱包后即可领取', claim: '领取奖励', openWallet: '开通钱包并领取',
    unknown: '学习已完成，奖励到账情况还没确认。请查看钱包状态，不需要重新做练习。',
};

const providerCopy: Record<ProviderFailureReason, string> = {
    'provider-auth': 'AI 连接未通过验证，请检查连接设置中的密钥是否正确或已过期。',
    'provider-forbidden': '你使用的 AI 服务暂不允许访问，请检查账号权限。',
    'provider-request': 'AI 服务没能接受这次请求，请检查连接设置，或换一个模型再试。',
    'provider-not-found': '找不到所选的 AI 模型，请检查连接地址和模型名称。',
    'provider-too-large': '这次要看的内容太多，请分几次说，或换用能阅读更长内容的模型。',
    'provider-rate-limit': 'AI 服务暂时无法继续，请稍后重试，并检查剩余额度。',
    'provider-timeout': '等了有一会儿，还是没收到回复。请检查连接后重试。',
    'provider-unavailable': 'AI 服务暂时不可用，请稍后重试。',
    'provider-failed': '模型请求未完成，未提供具体错误。',
};

export interface LearningProgress {
    stage: 'context' | 'config' | 'session' | 'summary' | 'provider' | 'tools' | 'save' | 'action';
    round?: number;
    tool?: string;
}

export interface LearningFailureDetails extends LearningProgress {
    cause?: unknown;
    issues?: readonly { path: string; message: string }[];
}

const stages: Record<LearningProgress['stage'], string> = {
    context: '翻看学习资料', config: '连接 AI', session: '准备学习内容',
    summary: '整理之前聊过的内容',
    provider: '组织回复', tools: '整理学习内容', save: '保存学习内容', action: '准备学习内容',
};

export function learningProgressMessage(progress: LearningProgress): string {
    return `正在${stages[progress.stage]}…`;
}

export function learningTeachingFailure(reason: string, cause?: unknown): string {
    if (reason === 'learning_file_invalid') { return LEARNING_STORAGE_COPY.invalid; }
    const detail = learningFailureCause(cause);
    const metadata = [detail.httpStatus ? `HTTP ${detail.httpStatus}` : '', detail.errorCode, detail.responseReason].filter(Boolean);
    if (detail.errorMessage && detail.errorMessage !== reason || metadata.length) {
        return [detail.errorMessage && detail.errorMessage !== reason ? detail.errorMessage : learningTeachingFailure(reason),
            metadata.join(' · ')].filter(Boolean).join('\n');
    }
    const provider = providerCopy[reason as ProviderFailureReason];
    if (provider) { return provider; }
    switch (reason) {
        case 'learning_context_failed': return '没能打开学习资料，请重试。';
        case 'learning_config_failed': return '暂时连不上 AI，请检查 AI 连接设置后重试。';
        case 'learning_session_failed': return '这次没能开始，请重试。';
        case 'learning_protocol_failed': return '这次回复没能整理成学习内容。此前已保存的修改保留，请查看当前记录后继续。';
        case 'learning_tool_failed': return '整理学习内容时出了问题。此前已保存的修改保留，请查看当前记录后继续。';
        case 'learning_save_failed': return '保存学习内容时出了问题。请先重新加载，确认哪些内容已保存。';
        case 'learning_context_full': return '这次要看的内容太多了。已保存的练习和作答不变；可以分几次说，或在 AI 设置中换用能阅读更长内容的模型。';
        case 'learning_summary_failed': return '没能整理之前的聊天，原对话和已保存的学习内容都还在。请重试。';
        case 'learning_empty_response': return '没有收到有效回复。已保存的修改保留，可以继续。';
        case 'learning_response_truncated': return '这次回复太长，中途停下了。此前已保存的修改保留；可以继续未完成的工作，或在 AI 设置中调高回复长度。';
        case 'learning_round_limit': return '这次工具调用已到轮数上限。已保存的修改保留，可以继续未完成的工作。';
        case 'learning_read_failed': return '读取学习记录失败，请检查连接后重试。';
        case 'learning_resolve_pending_first': return LEARNING_STORAGE_COPY.unconfirmed;
        case 'learning_file_full': return '学习文件已达到容量上限，请整理不再需要的记录后重试。';
        case 'learning_write_rejected': return '服务器拒绝保存学习记录，请检查登录状态和存储权限后重试。';
        case 'learning_commit_id_reused': return '这次没能保存，请重试。';
        case 'learning_input_invalid': return '输入内容有误，请检查后重试，或重新加载课程。';
        default: return '这次没能完成。请先重新加载，确认学习记录；不需要清空数据。';
    }
}

function diagnosticToken(value: unknown): string | undefined {
    return typeof value === 'string' && /^[a-zA-Z][\w.[\]-]{0,119}$/.test(value) ? value : undefined;
}

/** Error messages explain the failure; request/response objects, headers and provider settings are not display data. */
function learningFailureCause(cause: unknown) {
    const value = cause && typeof cause === 'object'
        ? cause as { name?: unknown; code?: unknown; status?: unknown; httpStatus?: unknown; message?: unknown; reason?: unknown } : {};
    const status = value.status ?? value.httpStatus;
    const message = typeof cause === 'string' ? cause : typeof value.message === 'string' ? value.message : undefined;
    return { errorMessage: message, errorName: diagnosticToken(value.name),
        errorCode: typeof value.code === 'string' ? value.code : message && /^learning_[a-z_]+$/.test(message) ? message : undefined,
        httpStatus: typeof status === 'number' && status >= 100 && status <= 599 ? status : undefined,
        responseReason: typeof value.reason === 'string' ? value.reason : undefined };
}

/** Keep local validation rules, not the user/model field values or a provider's response body. */
function diagnosticIssue(issue: { path: string; message: string }) {
    const rule = issue.message.startsWith(`${issue.path}: `) ? issue.message.slice(issue.path.length + 2) : issue.message;
    return { path: diagnosticToken(issue.path) ?? '(non-standard field)', rule: rule.slice(0, 240) };
}

/** Preserve the actual error alongside its stage, without serializing request payloads or credentials. */
export function reportLearningFailure(action: string, reason: string, details: LearningFailureDetails): string {
    const cause = details.cause && typeof details.cause === 'object'
        ? details.cause as { stack?: unknown } : {};
    // Only source basenames and line/column positions: omit stack messages, URL queries, hosts and filesystem directories.
    const locations = typeof cause.stack === 'string' ? cause.stack.split('\n').slice(1, 9).flatMap(frame => {
        const location = frame.match(/([^/\\\s():?#]{1,100}\.(?:[cm]?js|ts|vue)):(\d+):(\d+)/);
        return location ? [`${location[1]}:${location[2]}:${location[3]}`] : [];
    }) : [];
    const issues = details.issues ?? (details.cause instanceof LearningValidationError ? [details.cause] : []);
    console.error('[LittleWhiteBox][Learning] 学习操作失败', {
        action: diagnosticToken(action), reason, stage: details.stage, round: details.round,
        tool: diagnosticToken(details.tool),
        ...learningFailureCause(details.cause),
        locations, issues: issues.slice(0, 16).map(diagnosticIssue),
    });
    return learningTeachingFailure(reason, details.cause);
}
