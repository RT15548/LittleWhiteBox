import { MEMORY_COPY as copy } from './copy.js';
import { element } from './ui-elements.js';

/** A compact progress summary; exact ranges stay available without growing the page. */
export function createMaintenanceRangeView({ showPending = true } = {}) {
    const details = element('details', 'memory-ranges');
    const summary = element('summary');
    const body = element('dl', 'memory-range-list');
    body.tabIndex = 0;
    body.setAttribute('aria-label', copy.rangeDetails);
    const rows = (showPending ? ['completed', 'pending'] : ['completed']).map(key => {
        const label = key === 'completed' ? copy.completedRanges : copy.pendingRanges;
        const value = element('dd');
        body.append(element('dt', '', label), value);
        return { key, label, value };
    });
    details.append(summary, body);
    return {
        element: details,
        update(ranges) {
            const counts = rows.map(({ key, label, value }) => {
                const items = ranges[key] || [];
                const text = copy.ranges(items);
                if (value.textContent !== text) value.textContent = text;
                return copy.rangeCount(label, items.reduce((total, range) => total + range.to - range.from + 1, 0));
            });
            summary.textContent = counts.join(' · ');
        },
    };
}
