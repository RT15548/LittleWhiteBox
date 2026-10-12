/** Only these public categories may cross from research results into the learner's frame. */
const researchFailures = {
    invalid_arguments: '这次没能正确选择或读取文章来源，可以重试准备。',
    learning_search_failed: '暂时连不上搜索服务，请检查联网取材设置后重试。',
    learning_search_timeout: '搜索文章等了太久，可以重试或先读原创文章。',
    learning_search_not_configured: '还没连接联网取材，请先设置，或改读原创文章。',
    learning_extract_http_failed: '联网服务没能读取正文，请检查联网取材设置后重试。',
    learning_extract_timeout: '读取正文等了太久，可以重试或改读原创文章。',
    learning_extract_failed: '读取正文时连接中断，请检查联网取材连接后重试。',
    learning_extract_invalid_response: '联网服务返回的内容无法作为正文读取，可以重试或改读原创文章。',
    learning_source_unavailable: '这个网页没有读到可用正文，可以换一个来源或改读原创文章。',
    learning_source_too_large: '这个网页内容太多，未能读入。可以换一个来源或改读原创文章。',
    learning_research_failed: '这次联网取材没有完成，可以重试或改读原创文章。',
} as const;
export type LearningResearchFailure = keyof typeof researchFailures;

export function learningResearchCode(value: unknown): LearningResearchFailure | undefined {
    return typeof value === 'string' && Object.hasOwn(researchFailures, value) ? value as LearningResearchFailure : undefined;
}

export function learningResearchFailure(code: LearningResearchFailure, httpStatus?: number): string {
    if (code === 'learning_extract_http_failed' || code === 'learning_search_failed') {
        if (httpStatus === 401) { return '联网取材的验证没有通过，请检查联网密钥是否有效。'; }
        if (httpStatus === 403) { return '联网服务拒绝了这次请求，请检查账号或接口权限；不一定是密钥填错。'; }
        if (httpStatus === 404 || httpStatus === 405) { return code === 'learning_extract_http_failed'
            ? '当前联网地址不支持读取正文，请检查联网取材地址，或改读原创文章。'
            : '当前联网地址不支持搜索，请检查联网取材地址，或改读原创文章。'; }
        if (httpStatus === 429) { return '联网服务暂时限制了请求，请稍后重试，并检查剩余额度。'; }
        if (httpStatus && httpStatus >= 500) { return '联网服务暂时不可用，请稍后重试，或先读原创文章。'; }
    }
    return researchFailures[code];
}
