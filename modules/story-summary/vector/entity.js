// ═══════════════════════════════════════════════════════════════════════════
// Entity Recognition & Relation Graph
// 实体识别与关系扩散
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 从文本中匹配已知实体
 * @param {string} text - 待匹配文本
 * @param {Set<string>} knownEntities - 已知实体集合
 * @returns {string[]} - 匹配到的实体
 */
export function matchEntities(text, knownEntities) {
    if (!text || !knownEntities?.size) return [];
    
    const matched = new Set();
    
    for (const entity of knownEntities) {
        // 精确包含
        if (text.includes(entity)) {
            matched.add(entity);
            continue;
        }
        
        // 处理简称：如果实体是"林黛玉"，文本包含"黛玉"
        if (entity.length >= 3) {
            const shortName = entity.slice(-2); // 取后两字
            if (text.includes(shortName)) {
                matched.add(entity);
            }
        }
    }
    
    return Array.from(matched);
}

/**
 * 从角色数据和事件中收集所有已知实体
 */
export function collectKnownEntities(characters, events) {
    const entities = new Set();
    
    // 从主要角色
    (characters?.main || []).forEach(m => {
        const name = typeof m === 'string' ? m : m.name;
        if (name) entities.add(name);
    });
    
    // 从关系
    (characters?.relationships || []).forEach(r => {
        if (r.from) entities.add(r.from);
        if (r.to) entities.add(r.to);
    });
    
    // 从事件参与者
    (events || []).forEach(e => {
        (e.participants || []).forEach(p => {
            if (p) entities.add(p);
        });
    });
    
    return entities;
}

/**
 * 构建关系邻接表
 * @param {Array} relationships - 关系数组
 * @returns {Map<string, Array<{target: string, weight: number}>>}
 */
export function buildRelationGraph(relationships) {
    const graph = new Map();
    
    const trendWeight = {
        '交融': 1.0,
        '亲密': 0.9,
        '投缘': 0.7,
        '陌生': 0.3,
        '反感': 0.5,
        '厌恶': 0.6,
        '破裂': 0.7,
    };
    
    for (const rel of relationships || []) {
        if (!rel.from || !rel.to) continue;
        
        const weight = trendWeight[rel.trend] || 0.5;
        
        // 双向
        if (!graph.has(rel.from)) graph.set(rel.from, []);
        if (!graph.has(rel.to)) graph.set(rel.to, []);
        
        graph.get(rel.from).push({ target: rel.to, weight });
        graph.get(rel.to).push({ target: rel.from, weight });
    }
    
    return graph;
}

/**
 * 关系扩散（1跳）
 * @param {string[]} focusEntities - 焦点实体
 * @param {Map} graph - 关系图
 * @param {number} decayFactor - 衰减因子
 * @returns {Map<string, number>} - 实体 -> 激活分数
 */
export function spreadActivation(focusEntities, graph, decayFactor = 0.5) {
    const activation = new Map();
    
    // 焦点实体初始分数 1.0
    for (const entity of focusEntities) {
        activation.set(entity, 1.0);
    }
    
    // 1跳扩散
    for (const entity of focusEntities) {
        const neighbors = graph.get(entity) || [];
        
        for (const { target, weight } of neighbors) {
            const spreadScore = weight * decayFactor;
            const existing = activation.get(target) || 0;
            
            // 取最大值，不累加
            if (spreadScore > existing) {
                activation.set(target, spreadScore);
            }
        }
    }
    
    return activation;
}
