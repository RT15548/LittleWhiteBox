// ═══════════════════════════════════════════════════════════════════════════
// 配置保存队列
//
// 串行化配置写入，并把补丁的求值放到队列内部：需要基于当前值计算的改动（例如开关
// 翻转）必须传函数式补丁，否则连续两次操作会读到同一份保存前的旧配置、算出相同结
// 果，后一次的用户意图就被吞掉了。
//
// 生命周期（epoch）在每次 cleanup 时递增：过期的写入既不提交也不报错，直接返回
// false。依赖通过参数注入，便于在无浏览器环境下测试。
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @param {Object} deps
 * @param {() => any} deps.readConfig - 当前已提交配置
 * @param {() => boolean} deps.isConfigLoaded - 配置是否成功加载过
 * @param {(next: any) => void} deps.commitConfig - 持久化成功后写回运行态
 * @param {() => any} deps.currentEpoch - 当前生命周期标识
 * @param {(next: any) => Promise<any>} deps.persist - 实际落盘
 * @param {(current: any, patch: any) => any} [deps.mergePatch] - 合并策略，默认浅合并
 * @param {(error: Error) => void} [deps.onError]
 * @param {(value: any) => any} [deps.clone]
 * @returns {{save: (updates: Object|Function) => Promise<boolean>, whenIdle: () => Promise<void>}}
 */
export function createConfigSaveQueue({
    readConfig,
    isConfigLoaded,
    commitConfig,
    currentEpoch,
    persist,
    mergePatch,
    onError = () => {},
    clone = structuredClone,
}) {
    if (typeof readConfig !== 'function') throw new TypeError('readConfig 必须是函数');
    if (typeof commitConfig !== 'function') throw new TypeError('commitConfig 必须是函数');
    if (typeof currentEpoch !== 'function') throw new TypeError('currentEpoch 必须是函数');
    if (typeof persist !== 'function') throw new TypeError('persist 必须是函数');

    const loaded = typeof isConfigLoaded === 'function' ? isConfigLoaded : () => true;
    const merge = typeof mergePatch === 'function'
        ? mergePatch
        : (current, patch) => Object.assign(clone(current), patch);

    let queue = Promise.resolve();

    /**
     * @param {Object|Function} updates - 对象补丁，或 (currentConfig) => 补丁 的函数
     * @returns {Promise<boolean>} 是否已提交
     */
    async function save(updates) {
        const operationEpoch = currentEpoch();
        // 对象补丁在入队时冻结快照，函数补丁则推迟到队列内针对最新配置求值。
        const frozenPatch = typeof updates === 'function' ? null : clone(updates || {});
        const resolvePatch = typeof updates === 'function' ? updates : () => frozenPatch;

        const operation = async () => {
            try {
                if (currentEpoch() !== operationEpoch) return false;
                const current = readConfig();
                if (!loaded() || !current) throw new Error('配置尚未成功加载');

                const patch = clone(resolvePatch(clone(current)) || {});
                const next = merge(current, patch);

                await persist(next);
                if (currentEpoch() !== operationEpoch) return false;
                commitConfig(next);
                return true;
            } catch (error) {
                if (currentEpoch() !== operationEpoch) return false;
                onError(error);
                return false;
            }
        };

        const pending = queue.then(operation, operation);
        queue = pending.then(() => {}, () => {});
        return await pending;
    }

    async function whenIdle() {
        let previous;
        do {
            previous = queue;
            await previous.catch(() => {});
        } while (previous !== queue);
    }

    return { save, whenIdle };
}
