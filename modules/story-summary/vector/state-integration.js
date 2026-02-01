// ═══════════════════════════════════════════════════════════════════════════
// Story Summary - State Integration (L0)
// 事件监听 + 回滚钩子注册
// ═══════════════════════════════════════════════════════════════════════════

import { getContext } from '../../../../../../extensions.js';
import { xbLog } from '../../../core/debug-core.js';
import {
    saveStateAtoms,
    saveStateVectors,
    deleteStateAtomsFromFloor,
    deleteStateVectorsFromFloor,
    getStateAtoms,
    clearStateVectors,
} from './state-store.js';
import { embed, getEngineFingerprint } from './embedder.js';
import { getVectorConfig } from '../data/config.js';

const MODULE_ID = 'state-integration';

let initialized = false;

// ═══════════════════════════════════════════════════════════════════════════
// 初始化
// ═══════════════════════════════════════════════════════════════════════════

export function initStateIntegration() {
    if (initialized) return;
    initialized = true;

    // 监听变量团队的事件
    $(document).on('xiaobaix:variables:stateAtomsGenerated', handleStateAtomsGenerated);

    // 注册回滚钩子
    globalThis.LWB_StateRollbackHook = handleStateRollback;

    xbLog.info(MODULE_ID, 'L0 状态层集成已初始化');
}

// ═══════════════════════════════════════════════════════════════════════════
// 事件处理
// ═══════════════════════════════════════════════════════════════════════════

async function handleStateAtomsGenerated(e, data) {
    const { atoms } = data || {};
    if (!atoms?.length) return;

    const { chatId } = getContext();
    if (!chatId) return;

    const validAtoms = atoms.filter(a => a?.chatId === chatId);
    if (!validAtoms.length) {
        xbLog.warn(MODULE_ID, `atoms.chatId 不匹配，期望 ${chatId}，跳过`);
        return;
    }

    xbLog.info(MODULE_ID, `收到 ${validAtoms.length} 个 StateAtom`);

    // 1. 存入 chat_metadata（持久化）
    saveStateAtoms(validAtoms);

    // 2. 向量化并存入 IndexedDB
    const vectorCfg = getVectorConfig();
    if (!vectorCfg?.enabled) {
        xbLog.info(MODULE_ID, '向量未启用，跳过 L0 向量化');
        return;
    }

    await vectorizeAtoms(chatId, validAtoms, vectorCfg);
}

async function vectorizeAtoms(chatId, atoms, vectorCfg) {
    const texts = atoms.map(a => a.semantic);
    const fingerprint = getEngineFingerprint(vectorCfg);

    try {
        const vectors = await embed(texts, vectorCfg);

        const items = atoms.map((a, i) => ({
            atomId: a.atomId,
            floor: a.floor,
            vector: vectors[i],
        }));

        await saveStateVectors(chatId, items, fingerprint);
        xbLog.info(MODULE_ID, `L0 向量化完成: ${items.length} 个`);
    } catch (e) {
        xbLog.error(MODULE_ID, 'L0 向量化失败', e);
        // 不阻塞，向量可后续通过"生成向量"重建
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 回滚钩子
// ═══════════════════════════════════════════════════════════════════════════

async function handleStateRollback(floor) {
    xbLog.info(MODULE_ID, `收到回滚请求: floor >= ${floor}`);

    const { chatId } = getContext();

    // 1. 删除 chat_metadata 中的 atoms
    deleteStateAtomsFromFloor(floor);

    // 2. 删除 IndexedDB 中的 vectors
    if (chatId) {
        await deleteStateVectorsFromFloor(chatId, floor);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 重建向量（供"生成向量"按钮调用）
// ═══════════════════════════════════════════════════════════════════════════

export async function rebuildStateVectors(chatId, vectorCfg) {
    if (!chatId || !vectorCfg?.enabled) return { built: 0 };

    const atoms = getStateAtoms();
    if (!atoms.length) return { built: 0 };

    xbLog.info(MODULE_ID, `开始重建 L0 向量: ${atoms.length} 个 atom`);

    // 清空旧向量
    await clearStateVectors(chatId);

    // 重新向量化
    const fingerprint = getEngineFingerprint(vectorCfg);
    const batchSize = vectorCfg.engine === 'local' ? 5 : 25;
    let built = 0;

    for (let i = 0; i < atoms.length; i += batchSize) {
        const batch = atoms.slice(i, i + batchSize);
        const texts = batch.map(a => a.semantic);

        try {
            const vectors = await embed(texts, vectorCfg);

            const items = batch.map((a, j) => ({
                atomId: a.atomId,
                floor: a.floor,
                vector: vectors[j],
            }));

            await saveStateVectors(chatId, items, fingerprint);
            built += items.length;
        } catch (e) {
            xbLog.error(MODULE_ID, `L0 向量化批次失败: ${i}-${i + batchSize}`, e);
        }
    }

    xbLog.info(MODULE_ID, `L0 向量重建完成: ${built}/${atoms.length}`);
    return { built };
}
