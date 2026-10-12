const API_URL_MISSING_MESSAGE = '【剧情规划】未配置API，请配置或关闭功能';

export function assertPlannerApiUrlConfigured(settings) {
    if (String(settings?.api?.baseUrl ?? '').trim()) return;
    const error = new Error(API_URL_MISSING_MESSAGE);
    error.code = 'ENA_API_URL_MISSING';
    throw error;
}
