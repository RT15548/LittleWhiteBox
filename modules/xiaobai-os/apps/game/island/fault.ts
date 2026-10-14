export const ERRORS = {
    invalid: '荒岛数据或操作格式无效。',
    ended: '本次旅程已经结束，请重开。',
    dead: '死者不能行动。',
    authority: '这次操作不属于当前人物的控制范围。',
    stale_scene: '现场已经改变，需要重新确认在场者。',
    blocked: '这条路线无法通行。',
    occupied: '当前活动尚未结束。',
    body_held: '有人正在搬动这具遗体，需要先放下。',
    unavailable: '当前无法接触或使用这个物件。',
    stale: '旅程已更新，请读取当前状态。',
    identity: '操作身份与原请求不一致。',
    missing: '尚未开始旅程。',
    memory_unavailable: '这段经历不在当前可查阅范围内。',
    vector_space: '向量空间或维度不一致。',
    save_failed: '荒岛保存失败，完整候选仍待确认。',
    save_unconfirmed: '荒岛保存结果尚未确认。',
    save_conflict: '荒岛保存发生冲突。',
    busy: '请先处理正在保存的荒岛操作。',
    materials: '材料的数量或用途不满足这次加工。',
    capacity: '容器空间或携带能力不足。',
    conditions: '现场条件不满足这项活动。',
    tool_missing: '手边缺少适合这次加工的工具。',
    fire_missing: '附近没有可用的火。',
    material_wet: '引火材料还太湿，需要先晾干。',
    building_ground: '这里的地面不适合搭建，换到较高的沙地或林地。',
    building_overlap: '这里与已有设施太近，需要留出空间。',
    agent_empty: '模型没有提交有效结果，本次现场未改变。',
    intent_multiple: '模型同时提交了多个行动结果，本次没有选择或执行其中任何一个。',
    agent_limit: '模型本次处理达到上限，尚未提交现场。',
    agent_refused: '模型未能继续本次现场，已保留玩家操作。',
    context_full: '本次现场上下文达到上限，尚未提交。',
    embedding_config: '请先配置故事总结中的 Embedding 连接；荒岛只使用这项连接。',
    embedding_failed: '荒岛记忆向量请求失败，本次未自动重试。',
    memory_save: '荒岛记忆索引保存未确认，请先恢复保存。',
    cancelled: '本次模型处理已取消，已保存的操作不受影响。',
} as const;
export type FaultCode = keyof typeof ERRORS;
const ACTION_FAULTS: readonly FaultCode[] = ['blocked', 'occupied', 'body_held', 'unavailable', 'materials', 'capacity', 'conditions',
    'tool_missing', 'fire_missing', 'material_wet', 'building_ground', 'building_overlap'];
export function isActionFault(error: unknown): error is { code: string } {
    return !!error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
        && ACTION_FAULTS.some(code => error.code === `island_${code}`);
}
export function fail(code: FaultCode): never { throw Object.assign(new Error(ERRORS[code]), { code: `island_${code}` }); }
