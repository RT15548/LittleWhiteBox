const VECTOR_REPAIR_ACTION = '「向量数据 → 补齐缺漏」';
const VECTOR_REBUILD_ACTION = '「向量数据 → 完整重建」';
const VECTOR_REBUILD_COST = '会调用 Embedding API';
export const VECTOR_REBUILD_ADVICE = `请执行${VECTOR_REBUILD_ACTION}（${VECTOR_REBUILD_COST}，不会重新提取 L0 锚点）。`;
const VECTOR_SOURCE_INVALID = '当前剧情记忆的条目标识或来源楼层无效。请确认打开的是对应聊天，必要时恢复聊天或剧情记忆备份；重建向量不能修复这类来源问题';

const VECTOR_RECOVERY_FAILURES = Object.freeze({
    credentials: 'Embedding 服务的凭据无效或无权限，请在向量设置中检查 API Key 和访问权限',
    endpoint: 'Embedding 服务地址无效，请在向量设置中填写完整的服务地址',
    quota: 'Embedding 服务限流或额度不足，请检查服务额度，或稍后重试',
    service: 'Embedding 服务暂时不可用，请待服务恢复后重试',
    request: 'Embedding 服务拒绝了请求，请检查向量设置中的模型和接口是否匹配',
    timeout: 'Embedding 请求超时，无法确认服务是否已完成或计费；不会自动重发，请确认服务状态后再决定是否重试',
    network: 'Embedding 连接中断或请求已取消，无法确认服务是否已完成或计费；不会自动重发，请检查连接后再决定是否重试',
    outcome_unknown: '上次向量请求的结果无法确认，也无法确认是否已计费；不会自动重发，重试可能再次计费',
    response: 'Embedding 服务没有返回有效向量，请检查所选模型是否支持向量接口',
    storage: '浏览器未能读取或保存记忆缓存，请保持页面打开，检查存储空间和网站存储权限后重试',
    request_record: '浏览器无法读取或更新向量请求记录，为避免重复计费，已暂停新的付费请求；请检查网站存储权限和可用空间',
    model_changed: '向量设置已变化，请使用当前设置重新生成向量',
    source_invalid: VECTOR_SOURCE_INVALID,
    unknown: '无法确定记忆更新失败的原因，请反馈本次操作和此处的错误信息，无需查找或修改代码',
});

export const SUMMARY_FEEDBACK_COPY = Object.freeze({
    title: '剧情总结',
    summaryStopped: '已停止',
    summaryFailed: '总结失败',
    summaryFailureReasons: Object.freeze({
        empty: '模型没有返回总结内容。',
        parse: '模型返回的内容不是有效的 JSON，无法读取总结。',
        summary_invalid: '总结历史不完整，无法继续总结；请先导出留存，再修正后导入。',
        unknown: '未收到具体错误信息。',
    }),
    summaryResultInvalid: '模型返回的总结格式不正确',
    summaryFollowupFailed: detail => `总结已保存，但后续处理失败：\n${detail}`,
    summaryCompleted: (floor, count) => `剧情总结完成：更新至 #${floor} 楼（新增 ${count} 个事件）`,
    summaryControls: Object.freeze({
        generate: '总结',
        stop: '停止',
        dismiss: '关闭提示',
        noChat: '请先打开一个聊天',
        changing: '正在同步当前聊天状态',
        disabled: '请先启用当前聊天的剧情总结',
    }),
    summaryAttempt: (attempt, total, text) => `自动总结 ${attempt}/${total}：${text}`,
    summaryRunEnded: ({ automatic, attempts, uncertain, stale, reason }) => {
        if (stale) return '对话或总结内容已变化，请重新总结。';
        const outcome = uncertain ? '暂时无法确认总结是否保存'
            : `${automatic ? '自动总结' : '总结'}失败${automatic ? `（已尝试 ${attempts} 次）` : ''}`;
        return `${outcome}：\n${reason}${uncertain ? '\n点击“总结”重新确认保存结果。' : ''}`;
    },
    embeddingTitle: 'Embedding 异常',
    connectionChecking: '连接中…',
    connectionReady: dims => `连接成功 (${dims}维)`,
    queryEmbeddingTimeout: Object.freeze({
        label: '请求超时重试（秒）',
        hint: '查询向量超过此时间未完成时重试。',
    }),
    rerankTimeout: Object.freeze({
        label: '请求超时（秒）',
        hint: '实际召回仍受上一级“召回超时”限制。',
        failed: seconds => `连接失败：请求超时（${seconds} 秒）`,
    }),
    vectorInitialization: Object.freeze({
        configuration: '无法读取已保存的配置，请重新读取配置后重试。',
        runtime: '本地向量运行态准备失败，请刷新后重试；仍失败时请查看日志。',
        embedding: 'Embedding 连接测试失败，请检查模型地址、Key 或网络。',
    }),
    connectionCancelled: '测试已取消。',
    configSaveCancelled: '本次保存已取消，配置未保存。请重试。',
    configLocalCacheUnavailable: '剧情总结本地配置缓存不可写，继续使用内存中的配置。',
    vectorConfigFailed: '向量配置未能保存，任务未开始。请重新保存配置后重试。',
    configLoad: Object.freeze({
        loading: '正在读取已保存的配置…',
        failed: '读取配置失败，请重试。',
        interrupted: '读取被新的配置操作中止。',
        waiting: '等待配置…',
        retry: '重新读取',
    }),
    statsRefreshFailed: '向量统计刷新失败。',
    embeddingRecall: detail => `记忆召回失败，本次生成已停止。${detail}`,
    recallRetrying: '记忆召回仍在等待向量服务，正在重试；不想继续等待可点击停止生成。',
    recallInterrupted: Object.freeze({
        configuration: '记忆设置已变更，本次生成已停止，请重新发送。',
        memory: '记忆数据已变更，本次生成已停止，请重新发送。',
    }),
    embeddingRecallReasons: Object.freeze({
        timeout: attempts => {
            const limits = attempts.map(({ attempt, timeoutMs }) => `第 ${attempt} 次限时 ${timeoutMs / 1000} 秒`).join('；');
            return `Embedding 请求超时${limits ? `（${limits}）` : ''}。请检查服务和网络后重试。`;
        },
        credentials: () => 'Embedding API Key 无效或没有权限，请检查 Key。',
        rate_limit: () => 'Embedding 服务限流（HTTP 429），请稍后重试；若 L0 共用同一限额，可降低 L0 并发。',
        server: status => `Embedding 服务暂时出错（HTTP ${status}），请稍后重试。`,
        request_timeout: () => 'Embedding 服务返回请求超时（HTTP 408），请稍后重试。',
        network: () => 'Embedding 网络请求失败，请检查 API 地址、代理或网络。',
        invalid_response: () => 'Embedding 返回的向量数据无效或与请求不匹配，请检查模型是否为 Embedding 模型及接口兼容性。',
        configuration: () => '未配置 Embedding API Key，请在向量设置中填写 Key。',
        configuration_url: () => 'Embedding API 地址无效，请检查向量设置中的 API 地址。',
        http: status => `Embedding 请求被拒绝（HTTP ${status}），请检查 API 地址、模型配置及召回日志。`,
        unknown: () => 'Embedding 请求失败，请查看召回日志中的错误详情。',
    }),
    recallEmbeddingRequestFailed: 'Embedding query request failed',
    queryActivityLog: '[Query Activity] 查询期间任务时间线：remaining 为本批剩余处理量，deferredUnits 为未纳入本批的待办，均非缓存校验结果；activeUnits 为处理中条目，非 HTTP 并发数；sameOrigin 仅表示同源，不代表共享限额。空 activities 仅表示所记录阶段未运行；dropped > 0 表示记录已截断。',
    recallHostTimeout: seconds => `剧情记忆等待本轮用户消息超过 ${seconds} 秒，尚未开始召回，本次生成已停止。请检查酒馆生成准备流程。`,
    recallComputeTimeout: seconds => `剧情记忆召回计算超过 ${seconds} 秒，本次生成已停止。请查看召回日志中的阶段和错误详情。`,
    recallFailed: '剧情记忆召回失败，本次生成已停止。请查看召回日志中的阶段和错误详情。',
    startupFailed: '剧情总结未能完成启动，请刷新页面重试；若仍失败，请反馈控制台中的错误。',
    vectorMaintenance: Object.freeze({
        loadFailed: '加载时记忆维护未完成',
        started: ({ chatId, floorsText, l0Pending, l0VectorMissing }) => `延迟向量维护开始 chat=${chatId} floors=${floorsText} l0Pending=${l0Pending} l0VectorMissing=${l0VectorMissing}；核对 L1/L2 缺口`,
        l1Failed: 'L1 增量构建或缺口补齐未完成',
        incomplete: ({ chunkResult, eventResult, l0Failed, l0VectorResult }) => `延迟向量维护未完成 l1=${chunkResult.success === false ? (chunkResult.code || 'unknown') : 'ok'} l2=${eventResult?.success === false ? (eventResult.code || 'unknown') : 'ok'} l0Failed=${l0Failed} l0Vector=${l0VectorResult?.code || 'ok'}，保留缺口并恢复完整性检查`,
        completed: ({ l0, l1, l2 }) => `延迟向量维护完成 l0=${l0} l1=${l1} l2=${l2}`,
    }),
    vectorIntegrity: Object.freeze({
        fingerprintMismatch: '向量引擎/模型已变更',
        cacheInconsistent: '部分记忆缓存需要更新',
        sourceInvalid: VECTOR_SOURCE_INVALID,
        failureReason: (failure = {}) => {
            const reason = Object.hasOwn(VECTOR_RECOVERY_FAILURES, failure.reason) ? failure.reason : 'unknown';
            const status = failure.httpStatus;
            const http = Number.isInteger(status) && status >= 100 && status <= 599 ? `（HTTP ${status}）` : '';
            return `${VECTOR_RECOVERY_FAILURES[reason]}${http}`;
        },
        recoveryFailure: failure => `记忆更新暂未完成：${SUMMARY_FEEDBACK_COPY.vectorIntegrity.failureReason(failure)}；本轮自动补齐已停止，已保存的更新会保留`,
        manualFailure: failure => `检索补齐未完成：${SUMMARY_FEEDBACK_COPY.vectorIntegrity.failureReason(failure)}。已保存的内容和已完成的检索更新都会保留。`,
        busy: '正在生成或更新记忆检索，请等当前任务结束后再重试。',
        disabled: '当前聊天未启用剧情总结，请先启用后再补齐检索。',
        preparationFailed: '暂时无法准备当前聊天的记忆检索，已保存的内容未被改动。请稍后重试。',
        repairing: '正在更新记忆缓存，已完成的部分会保留…',
        l1Gap: count => `${count} 层片段未向量化`,
        l0Gap: count => `${count} 个楼层的记忆锚点提取未完成`,
        l0VectorsMissing: count => `${count} 个楼层的锚点向量需要补齐或更新`,
        eventsMissing: count => `${count} 个事件未向量化`,
        checking: '正在检查向量状态…',
        pending: '等待当前任务结束后检查。',
        unavailable: '暂时无法读取本地记忆缓存，已保存的数据未被改动。请稍后重新打开面板；若持续出现，请检查浏览器存储空间和网站存储权限。',
        status: issues => {
            if (!issues.length) return '';
            const rebuild = issues.some(issue => issue.action === 'rebuild');
            const advice = rebuild ? VECTOR_REBUILD_ADVICE
                : issues.some(issue => issue.action === 'resolve_recovery' && issue.reason !== 'unknown')
                    ? `确认问题已解决后，可执行${VECTOR_REPAIR_ACTION}继续；重发未确认结果的请求可能再次计费。`
                    : issues.some(issue => issue.action === 'fill')
                        ? '可确认的向量缺口会在空闲时自动补齐。' : '';
            const anchors = issues.some(issue => issue.action === 'extract')
                ? '请在「记忆锚点」中生成/补齐未完成的锚点。' : '';
            return `${issues.map(issue => issue.message).join('、')}。${advice}${anchors}`;
        },
    }),
    anchors: Object.freeze({
        success: '记忆锚点已清空',
        failed: '记忆锚点未能完全清空，可能已有部分数据被清除。请重试。',
        refreshFailed: '记忆锚点已清空，但面板统计更新失败。请重新打开面板查看。',
    }),
    vectors: Object.freeze({
        success: '向量数据已清除。如需恢复，请点击“补齐缺漏”。',
        failed: '向量数据未能完全清空，可能已有部分数据被清除。请重试；如需恢复向量，请点击“补齐缺漏”。',
        refreshFailed: '向量数据已清空，但面板统计更新失败。请重新打开面板查看。',
    }),
});
