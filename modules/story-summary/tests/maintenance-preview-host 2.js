// Browser-only deterministic host fixture. It never calls a model or writes a user chat.
import { maintenanceFixture, joinedEventPatch } from './fixtures/memory-maintenance.js';
import { editMemory } from '../maintenance/domain.js';
import { projectMaintenanceReceipts } from '../maintenance/history.js';
import { presentMaintenanceReceipt } from '../maintenance/presentation.js';
import { readMaintenanceSource } from '../maintenance/source-view.js';
import { isTrustedMessage } from '../../../core/iframe-messaging.js';
import { maintenanceRanges } from '../maintenance/ranges.js';

const fixture = maintenanceFixture();
const merged = editMemory({ json: fixture.json, atoms: fixture.atoms }, {
    kind: 'merge', collection: 'events', key: 'evt-1', removeIds: ['evt-2'], patch: joinedEventPatch,
}, fixture.cutoff);
const deletedAnchor = editMemory({ json: fixture.json, atoms: fixture.atoms }, {
    kind: 'delete', collection: 'anchors', key: fixture.atoms[0].atomId,
}, fixture.cutoff);
const factCorrection = editMemory({ json: fixture.json, atoms: fixture.atoms }, {
    kind: 'edit', collection: 'facts', key: 'f-1', patch: { p: '关于回收原因的猜测', o: '夏实听说可能与看到机密有关，尚未确证' },
}, fixture.cutoff);
const anchorCorrection = editMemory({ json: fixture.json, atoms: fixture.atoms }, {
    kind: 'edit', collection: 'anchors', key: fixture.atoms[0].atomId,
    patch: { semantic: '夏实听说自己可能因为看到机密而被回收，但没有确证。', edges: [] },
}, fixture.cutoff);
const receipts = Array.from({ length: 24 }, (_, index) => ({
    version: 2, id: `preview-${index}`, runId: `preview-run-${Math.floor(index / 2)}`, cutoff: 24, createdAt: Date.UTC(2026, 8, 26, 9, index),
    summary: '跨批次的红山争吵已续接，青山的独立争吵保留。',
    operations: index % 2 ? [] : [{ kind: 'merge', collection: 'events', key: 'evt-1', changes: merged.changes }],
    outcome: index % 2 ? { status: 'completed' } : undefined,
    coverage: { supplied: [{ floor: 18, start: 0, end: 10, view: 'story' }],
        missingAnchors: [{ floor: 18, status: 'missing' }] },
}));
receipts.at(-1).operations.push({ kind: 'edit', collection: 'facts', key: 'f-1', changes: factCorrection.changes },
{ kind: 'edit', collection: 'anchors', key: fixture.atoms[0].atomId, changes: anchorCorrection.changes });
let store = { summaryHistory: [{ endMesId: 23, maintenance: receipts }] };
let config = { memoryMaintenanceEnabled: false };
let state = { status: 'idle' };
let indexState = { status: 'ready' };
const messages = [];
const send = data => document.getElementById('summary').contentWindow.postMessage({ source: 'LittleWhiteBox', ...data }, location.origin);
const results = (offset = 0) => {
    const page = projectMaintenanceReceipts(store, offset);
    page.items = page.items.map(receipt => presentMaintenanceReceipt(receipt, fixture));
    send({ type: 'MEMORY_MAINTENANCE_RESULTS', payload: { ...page, offset, state, index: indexState, chatId: fixture.chatId,
        ranges: maintenanceRanges(store.summaryHistory, store.summaryHistory.at(-1)?.endMesId ?? fixture.cutoff) } });
};
window.previewMemory = {
    messages,
    state(status, code) { state = { status, code, progress: { action: 'reading', saved: 2 } }; results(); },
    compacting() { state = { status: 'running', progress: { action: 'compacting', saved: 2 } }; results(); },
    partial() {
        const completion = { ...structuredClone(receipts.at(-1)), id: 'preview-completion', operations: [],
            outcome: undefined, summary: '', completion: { from: 1, to: 20 } };
        const outcome = { ...structuredClone(receipts.at(-1)), outcome: { status: 'partial' } };
        store = { summaryHistory: [{ endMesId: 23, maintenance: [completion, outcome] }] }; state = { status: 'partial' }; results();
    },
    empty() { store = { summaryHistory: [] }; results(); },
    noChanges() {
        const receipt = structuredClone(receipts.at(-1));
        receipt.operations = []; receipt.summary = '本次没有可确认的错误。';
        store = { summaryHistory: [{ endMesId: 23, maintenance: [receipt] }] }; results();
    },
    longSource() { fixture.chat[17].mes = fixture.chat[17].mes.repeat(600); },
    populated() { store = { summaryHistory: [{ endMesId: 243, maintenance: receipts }] }; results(); },
    retired() {
        const receipt = structuredClone(receipts.at(-1));
        receipt.operations.push({ kind: 'delete', collection: 'anchors', key: fixture.atoms[0].atomId,
            changes: deletedAnchor.changes.map(change => ({ ...change, retired: { reason: 'source_changed', at: Date.now() } })) });
        store = { summaryHistory: [{ endMesId: 243, maintenance: [receipt] }] }; results();
    },
    indexPending() { indexState = { status: 'pending' }; results(); },
    manyChanges(floors = 1000) {
        const edits = Array.from({ length: Math.floor(floors / 2) }, (_, index) => {
            const floor = index * 2 + 1;
            const before = { ...fixture.atoms[0], atomId: `preview-anchor-${floor}`, floor,
                semantic: '夏实确认自己因为看到机密而被回收。' };
            return { kind: 'edit', collection: 'anchors', key: before.atomId,
                changes: [{ collection: 'anchors', key: before.atomId, index,
                    before, after: { ...before, semantic: '夏实听说自己可能因为看到机密而被回收，但没有确证。' } }] };
        });
        const base = structuredClone(receipts.at(-1));
        const work = { ...base, id: 'long-work', runId: 'long-run', cutoff: floors, outcome: undefined,
            operations: [receipts[0].operations[0], ...base.operations.filter(item => item.collection !== 'anchors'), ...edits],
            summary: '这段过程说明不应出现在维护汇报中。', coverage: { supplied: [], missingAnchors: [] } };
        const final = { ...work, id: 'long-final', operations: [], outcome: { status: 'completed' },
            summary: '## 维护结果\n\n已修正传闻被写成确定事实的问题，**保留原有的不确定性**。\n\n- 大总结：续接红山争吵，保留青山的独立事件。\n- 锚点：统一恢复消息来源和说话人。\n\n| 内容 | 结果 |\n| --- | --- |\n| 事实归属 | 已核对 |\n| 独立经历 | 保留 |\n\n> 没有证据支持的推断，未改成确定事实。\n\n```json\n{"certainty":"unknown"}\n```' };
        const completion = { ...work, id: 'long-completion', operations: [], summary: '', completion: { from: 1, to: floors } };
        store = { summaryHistory: [{ endMesId: floors - 1, maintenance: [...receipts, work, completion, final] }] };
        state = { status: 'completed' }; results();
    },
    appendChange() {
        const final = store.summaryHistory.at(-1).maintenance.at(-1);
        const work = store.summaryHistory.at(-1).maintenance.find(item => item.id === 'long-work');
        const operation = structuredClone(work.operations.at(-1));
        operation.changes[0].after.where = '图书馆';
        work.operations.push(operation);
        final.summary += '\n\n补充核对了最后一处地点。';
        results();
    },
    longReport() {
        store.summaryHistory.at(-1).maintenance.at(-1).summary = Array.from({ length: 40 }, (_, index) =>
            `### 核对事项 ${index + 1}\n\n保持角色、归属与原文一致，不将传闻改成事实。`).join('\n\n');
        results();
    },
    newRun() {
        const previous = store.summaryHistory.at(-1).maintenance.at(-1);
        store.summaryHistory.at(-1).maintenance.push({ ...previous, id: 'new-final', runId: 'new-run',
            createdAt: previous.createdAt + 60000, operations: [], summary: '本轮没有需要修正的内容。' });
        results();
    },
};
// eslint-disable-next-line no-restricted-syntax -- isTrustedMessage validates both the preview origin and its only iframe.
window.addEventListener('message', event => {
    if (!isTrustedMessage(event, document.getElementById('summary'))) return;
    const data = event.data;
    messages.push(data);
    if (['FRAME_READY', 'REQUEST_PANEL_CONFIG'].includes(data.type)) {
        send({ type: 'LOAD_PANEL_CONFIG', config });
        send({ type: 'SUMMARY_FULL_DATA', payload: { ...fixture.json, totalFloors: 24, lastSummarizedMesId: 23, chatId: fixture.chatId } });
    }
    if (data.type === 'MEMORY_MAINTENANCE_QUERY') results(data.offset);
    if (data.type === 'MEMORY_MAINTENANCE_SOURCE') send({ type: 'MEMORY_MAINTENANCE_SOURCE_RESULT', payload: readMaintenanceSource({ ...fixture, store }, data) });
    if (data.type === 'MEMORY_MAINTENANCE_CANCEL') { state = { status: 'cancelled' }; results(); }
    if (data.type === 'MEMORY_MAINTENANCE_REPAIR') { indexState = { status: 'ready' }; results(); }
    if (data.type === 'SAVE_PANEL_CONFIG') {
        config = data.config;
        send({ type: 'PANEL_CONFIG_SAVE_RESULT', success: true, requestId: data.requestId, config });
    }
});
