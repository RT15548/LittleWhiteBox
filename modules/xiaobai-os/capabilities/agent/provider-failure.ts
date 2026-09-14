// Provider adapters expose HTTP status; response bodies/messages may contain private data.
export type ProviderFailureReason = 'provider-failed' | 'provider-auth' | 'provider-forbidden'
    | 'provider-request' | 'provider-not-found' | 'provider-too-large' | 'provider-rate-limit'
    | 'provider-timeout' | 'provider-unavailable';

export function classifyProviderFailure(error: unknown): ProviderFailureReason {
    const value = error && typeof error === 'object' ? error as { status?: unknown; name?: unknown } : {};
    const status = value.status;
    if (status === 401) { return 'provider-auth'; }
    if (status === 403) { return 'provider-forbidden'; }
    if (status === 400 || status === 422) { return 'provider-request'; }
    if (status === 404) { return 'provider-not-found'; }
    if (status === 413) { return 'provider-too-large'; }
    if (status === 429) { return 'provider-rate-limit'; }
    if (status === 408 || status === 504 || value.name === 'TimeoutError' || value.name === 'APIConnectionTimeoutError') {
        return 'provider-timeout';
    }
    if (typeof status === 'number' && status >= 500 && status <= 599) { return 'provider-unavailable'; }
    return 'provider-failed';
}

export function providerFailureMessage(reason: string): string {
    switch (reason) {
        case 'provider-auth': return 'API 验证失败，请检查密钥是否正确或已过期。';
        case 'provider-forbidden': return 'API 拒绝访问，请检查账号与所选模型的使用权限。';
        case 'provider-request': return 'API 不接受本次请求，请检查所选模型与接口是否匹配；反复出现时可更换模型。';
        case 'provider-not-found': return '未找到所选模型或接口，请检查 API 地址与模型名称。';
        case 'provider-too-large': return '请求内容超过 API 限制，请检查上下文长度或更换支持更长上下文的模型。';
        case 'provider-rate-limit': return 'API 请求过于频繁或额度不足，请稍后重试并检查剩余额度。';
        case 'provider-timeout': return '模型请求超时，请稍后重试；持续超时时请检查连接或更换模型。';
        case 'provider-unavailable': return '模型服务暂时不可用，请稍后重试。';
        case 'provider-failed': return '模型请求未完成，请检查 API 配置与连接后重试。';
        default: return '';
    }
}
