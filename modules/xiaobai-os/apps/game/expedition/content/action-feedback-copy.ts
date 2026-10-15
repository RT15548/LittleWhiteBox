const DEPARTURE_HINT = '关闭交谈后出发';

/** Player-facing outcomes, never instructions sent to the model. */
export const ACTION_FEEDBACK_COPY = {
    briefing: '已接下哨站救援 · 营地外路线已开放',
    receiving: '担架接应已安排',
    clinic: '共同经历已记入手记 · 整理诊棚药材',
    share_secret: '新情报已记入手记',
    follow: (name: string, pending: boolean) => pending ? `${name}将与你同行 · ${DEPARTURE_HINT}` : `${name}曾答应与你同行`,
    stay: (name: string) => `${name}留在原处`,
    go: (name: string, place: string, pending: boolean) => pending ? `${name}准备前往${place}等候 · ${DEPARTURE_HINT}` : `${name}曾约定前往${place}等候`,
    pass: (name: string, pending: boolean) => pending ? `${name}已同意放行 · 结束交谈后让路` : `${name}已让路`,
    attack: (pending: boolean) => pending ? '交涉破裂 · 准备迎战' : '交涉以战斗收场',
    finish: (pending: boolean) => pending ? '救援已核对 · 继续后结算' : '哨站救援已完成',
} as const;
