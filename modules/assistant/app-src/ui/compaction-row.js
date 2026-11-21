import { ACTIVITY_COPY as C } from './activity-copy.js';
import { formatContextCount } from '../runtime/context-stats.js';

export function compactionRow(index, record) {
    return {
        key: 'compaction:' + index,
        signature: record,
        build() {
            const complete = !!record?.summary;
            const row = document.createElement(complete ? 'details' : 'div');
            row.className = 'xb-assistant-compaction';
            if (complete) {
                const label = document.createElement('summary');
                label.textContent = C.compacted(formatContextCount(record.before), formatContextCount(record.after));
                const body = document.createElement('div');
                body.textContent = record.summary;
                row.append(label, body);
            } else {
                row.setAttribute('role', record?.error ? 'alert' : 'status');
                row.textContent = record?.skipped ? C.compactionSkipped : record?.error || C.compacting;
            }
            return row;
        },
    };
}
