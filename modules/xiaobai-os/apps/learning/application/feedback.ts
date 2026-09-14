import { providerFailureMessage } from '../../../capabilities/agent/provider-failure.js';
import { LearningValidationError } from '../../../domains/learning/profile.js';

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
    context: '准备课堂资料', config: '加载 API 设置', session: '准备上课',
    summary: '整理课堂记忆',
    provider: '等待老师回复', tools: '整理学习内容', save: '保存学习内容', action: '处理你的请求',
};

export function learningProgressMessage(progress: LearningProgress): string {
    return `正在${stages[progress.stage]}${progress.round ? `（第 ${progress.round} 轮）` : ''}…`;
}

export function learningTeachingFailure(reason: string): string {
    const provider = providerFailureMessage(reason);
    if (provider) { return provider; }
    switch (reason) {
        case 'learning_context_failed': return '课堂资料加载失败，还没有调用模型，请重试。';
        case 'learning_config_failed': return '模型设置加载失败，还没有调用模型。请检查 API 设置后重试。';
        case 'learning_session_failed': return '暂时无法开始上课，请重试；若仍失败，请反馈下方错误码。';
        case 'learning_protocol_failed': return '老师回复的格式不正确，这次内容没有保存，请重试。';
        case 'learning_tool_failed': return '整理学习内容时出了问题，这次内容没有保存，请重试。';
        case 'learning_save_failed': return '保存学习内容时出了问题。请先重新加载，确认哪些内容已保存。';
        case 'learning_context_full': return '内容太长，当前模型处理不了，聊天记录也无法再缩短。已保存的课程和作答不变；请换用支持更长上下文的模型，或分几次提出要求。';
        case 'learning_summary_failed': return '课堂记忆整理失败，原对话和已保存的学习内容仍保留。请重试，或换用支持更长上下文的模型。';
        case 'learning_empty_response': return '老师没有返回有效回复，已有内容未改，可以重试。';
        case 'learning_stalled': return '老师一直在重复同一步，已停止本次请求。已保存的内容不变，可以换个说法再试。';
        case 'learning_unresolved_proposals': return '老师给出的学习内容不符合要求，这次没有保存，请重试。';
        case 'learning_assessment_missing': return '老师还没有批改这道题，你的作答已保留，可以重新请老师批改。';
        case 'learning_file_invalid': return '学习文件暂时无法读取，请检查文件；不会覆盖已有内容。';
        case 'learning_read_failed': return '读取学习记录失败，请检查连接后重试。';
        case 'learning_resolve_pending_first': return '还不确定上次是否保存成功，请先检查保存。';
        case 'learning_file_full': return '学习文件已达到容量上限，请整理不再需要的记录后重试。';
        case 'learning_write_rejected': return '服务器拒绝保存学习记录，请检查登录状态和存储权限后重试。';
        case 'learning_commit_id_reused': return '这次保存没有开始，请重试；若仍失败，请反馈下方错误码。';
        case 'learning_input_invalid': return '输入内容有误，请检查后重试，或重新加载课程。';
        default: return '这次操作出了问题，请反馈下方错误码；不要清空已有学习记录。';
    }
}

function diagnosticToken(value: unknown): string | undefined {
    return typeof value === 'string' && /^[a-zA-Z][\w.[\]-]{0,119}$/.test(value) ? value : undefined;
}

/** Keep local validation rules, not the user/model field values or a provider's response body. */
function diagnosticIssue(issue: { path: string; message: string }) {
    const rule = issue.message.startsWith(`${issue.path}: `) ? issue.message.slice(issue.path.length + 2) : issue.message;
    return { path: diagnosticToken(issue.path) ?? '(non-standard field)', rule: rule.slice(0, 240) };
}

/** One terminal diagnostic; raw errors, requests, tool arguments, settings and story text never enter it. */
export function reportLearningFailure(action: string, reason: string, details: LearningFailureDetails): string {
    const cause = details.cause && typeof details.cause === 'object'
        ? details.cause as { name?: unknown; code?: unknown; status?: unknown; httpStatus?: unknown; message?: unknown; stack?: unknown } : {};
    const status = cause.status ?? cause.httpStatus;
    const localCode = typeof cause.message === 'string' && /^learning_[a-z_]+$/.test(cause.message) ? cause.message : undefined;
    // Only source basenames and line/column positions: omit stack messages, URL queries, hosts and filesystem directories.
    const locations = typeof cause.stack === 'string' ? cause.stack.split('\n').slice(1, 9).flatMap(frame => {
        const location = frame.match(/([^/\\\s():?#]{1,100}\.(?:[cm]?js|ts|vue)):(\d+):(\d+)/);
        return location ? [`${location[1]}:${location[2]}:${location[3]}`] : [];
    }) : [];
    const issues = details.issues ?? (details.cause instanceof LearningValidationError ? [details.cause] : []);
    console.error('[LittleWhiteBox][Learning] 学习操作失败', {
        action: diagnosticToken(action), reason, stage: details.stage, round: details.round,
        tool: diagnosticToken(details.tool),
        httpStatus: typeof status === 'number' && status >= 100 && status <= 599 ? status : undefined,
        errorName: diagnosticToken(cause.name), errorCode: diagnosticToken(cause.code) ?? localCode,
        locations, issues: issues.slice(0, 16).map(diagnosticIssue),
    });
    return `${learningTeachingFailure(reason)}（错误码：${reason}）`;
}
