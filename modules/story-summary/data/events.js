export const EVENT_MEMORY_ROLES = Object.freeze([
    '状态变化',
    '约定承诺',
    '信息揭示',
    '偏好习惯',
    '具体经历',
]);

const EVENT_FIELDS = ['id', 'title', 'timeLabel', 'summary', 'participants', 'causedBy', '_addedAt'];

export function normalizeEventMemoryRole(value) {
    const role = typeof value === 'string' ? value.trim() : '';
    return EVENT_MEMORY_ROLES.includes(role) ? role : '';
}

/** Current event projection at generation, editing and stored-data boundaries. */
export function projectSummaryEvent(event) {
    const result = {};
    for (const field of EVENT_FIELDS) {
        if (Object.hasOwn(event, field)) result[field] = event[field];
    }
    result.memoryRole = normalizeEventMemoryRole(event.memoryRole);
    return result;
}

/** Project a complete edited collection and keep causal references within it. */
export function projectEditedSummaryEvents(events) {
    const eventIds = new Set(events.map(event => event.id));
    return events.map(event => {
        const projected = projectSummaryEvent(event);
        if (Array.isArray(projected.causedBy)) {
            projected.causedBy = projected.causedBy.filter(id => eventIds.has(id));
        }
        return projected;
    });
}
