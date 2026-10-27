import { MEMORY_PAGE_SIZE, MEMORY_PAGE_CHARS } from './limits.js';
import { SOURCE_PAGE_CHARS } from './evidence.js';
import { EVENT_MEMORY_ROLES } from '../data/events.js';
import { RELATION_TRENDS } from '../data/fact-predicates.js';
import { MEMORY_COLLECTIONS } from './domain.js';
import { ARC_PROGRESS_MAX } from '../generate/arc-progress.js';
import { SUMMARY_DIAGNOSTIC_LIMIT, SUMMARY_DIAGNOSTIC_REASON_CHARS } from '../summary-diagnostics.js';

const string = { type: 'string' };
const integer = { type: 'integer', minimum: 0 };
const strings = { type: 'array', items: string };
const collection = { type: 'string', enum: MEMORY_COLLECTIONS, description: 'Memory section containing the record.' };
const object = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
const tool = (name, description, properties, required = []) => ({ type: 'function', function: { name, description, parameters: object(properties, required) } });
const fields = {
    events: {
        title: { ...string, description: 'Recognizable episode title.' }, timeLabel: { ...string, description: 'Supported date or established event-relative time.' },
        summary: { ...string, description: 'Concrete memory card ending with its (#X-Y) source-floor marker.' },
        participants: { ...strings, description: 'Main names of involved characters. When a merge omits it, the joined events\' participants are combined.' },
        causedBy: { ...strings, description: 'Complete list of existing event keys for direct causes or motives; [] clears causes. When a merge omits it, the joined events\' causes are combined.' },
        memoryRole: { type: 'string', enum: EVENT_MEMORY_ROLES },
    },
    facts: {
        s: { ...string, description: 'Subject whose property is recorded. Active facts have distinct subject/property pairs.' }, p: { ...string, description: 'Property; preserve established predicate vocabulary. A relationship property has the form 对X的看法, with X the main name of the character it concerns.' },
        o: { ...string, description: 'Complete current property value, not just an added fragment.' },
        isState: { type: 'boolean', description: 'Enduring constraint, not a confidence flag.' },
        trend: { type: 'string', enum: RELATION_TRENDS },
    },
    characters: { name: { ...string, description: 'Established main character name.' } },
    arcs: {
        name: { ...string, description: 'Main character name.' }, trajectory: { ...string, description: 'Concise current stage of this arc.' },
        progress: { type: 'integer', minimum: 0, maximum: ARC_PROGRESS_MAX, description: 'Arc completion, same scale as summary generation.' },
        moments: { ...strings, description: 'Complete ordered list of supported key moments, including earlier moments.' },
    },
    keywords: { text: { ...string, description: 'Story-wide keyword.' }, weight: { type: 'string', enum: ['核心', '重要', '一般'] } },
    characterAliases: {
        from: { ...string, description: 'One alternate written name.' }, to: { ...string, description: 'Established main name of the same person.' },
        evidence: { ...string, maxLength: 120, description: 'Short explanation of the identity match.' },
    },
    anchors: {
        semantic: { ...string, description: 'Concrete scene card for this assistant floor and its preceding user message.' },
        where: { ...string, description: 'Scene place; empty when unknown.' },
        edges: { type: 'array', maxItems: 3, items: object({
            s: { ...string, description: 'Acting character main name.' }, t: { ...string, description: 'Receiving character main name.' },
            r: { ...string, description: 'Directed action and object/result, without character names or evaluation.' },
        }, ['s', 't', 'r']) },
    },
};
const edit = { anyOf: Object.entries(fields).map(([name, patch]) => object({
    kind: { type: 'string', enum: name === 'events' ? ['edit', 'delete', 'merge'] : ['edit', 'delete'], default: 'edit', description: 'Default edit. Use delete to remove the record, or merge to join events.' },
    collection: { type: 'string', enum: [name] },
    key: { ...string, description: 'Record key as read.' },
    ...(name === 'events' ? { removeIds: { ...strings, description: 'For a merge: the other event keys joined with key. The oldest event keeps its identity, causedBy references to the others point to it, and floor anchors stay separate.' } } : {}),
    patch: { ...object(patch), description: 'Only changed fields; omitted for a deletion. A merge carries the combined summary.' },
}, ['collection', 'key'])) };

export const READ_MAINTENANCE_TOOL = tool('ReadMaintenance', 'Read current maintenance state, saved maintenance runs and recent summary-generation attempts for this chat. Use it to investigate a failed summary or maintenance run. Without runId, returns current summary/completed/pending ranges and a page of maintenance runs, newest first. With runId, returns that maintenance run and pages its recorded calls and operations using offset/limit; next follows the larger total. The run overview is always included. '
    + 'summaryGeneration is a separate page using the same offset/limit, with attempts, total and its own next offset. Each attempt has id, runId (grouping retries), automatic, attempt, startedAt/endedAt (epoch milliseconds), stage, inclusive one-based range or null, outcome, saveState and optional redacted reason/reasonTruncated. Stages identify preparation, history, request, save_confirmation, source_validation, response, parse, structure, merge, saving or followup. Outcomes are running, completed, failed, cancelled, stale (source changed), no_content or followup_failed. saveState is not_started, unconfirmed, not_saved or confirmed; a followup failure does not undo a confirmed summary. This is the save result observed at that attempt, not a later confirmation. '
    + `Summary diagnostics have scope page_session, startedAt, retentionLimit (${SUMMARY_DIAGNOSTIC_LIMIT} attempts across chats) and historyMayBeTruncated. They survive notice dismissal and retries, but not refresh or module teardown. Reasons are limited to ${SUMMARY_DIAGNOSTIC_REASON_CHARS} characters. Empty or missing records do not establish that no failure occurred. `
    + 'When this task starts with an unconfirmed save from an earlier task, the tool checks that save against the original chat without writing and includes saveState {state: confirmed|not_saved|unknown, error?}. This tool is read-only and does not start generation or maintenance.', {
    runId: { ...string, minLength: 1, description: 'Maintenance run identifier from runs; omit to list runs. Summary-generation runId values are grouping labels, not lookup arguments.' },
    offset: { ...integer, default: 0, description: 'Zero-based offset for both diagnostic pages. Default 0; each page returns its own next offset.' },
    limit: { type: 'integer', minimum: 1, maximum: 20, default: 10, description: 'Page size for each diagnostic page. Default 10, maximum 20.' },
});

export const RECOVER_MAINTENANCE_SAVE_TOOL = tool('RecoverMaintenanceSave', 'Inspect or recover the final save of this task. check performs read-only confirmation against the original chat; it never sends another save. retry submits the retained draft only when the previous attempt is known not to have saved. Returns state confirmed, not_saved, unknown or not_needed, with saved (confirmed operation count), staged (pending operation count), receiptIds and error details when available. Unknown results keep writes paused; inspect with check rather than replaying edits. This tool is available during save recovery, after the task first attempts to finish.', {
    action: { type: 'string', enum: ['check', 'retry'], description: 'check reads the save result; retry requires a previously confirmed not_saved state.' },
}, ['action']);

export const MEMORY_TOOLS = [
    tool('ReadMemory', 'Read current memories. Returns items, total (matching record count) and next (complete arguments for continuation, or null). Items contain collection, key, value and maintenanceRange. When a source summary batch is known, generatedBy contains its one-based floor range {from, to}. One page holds up to '
        + MEMORY_PAGE_SIZE + ' records and ' + MEMORY_PAGE_CHARS + ' characters; a longer item returns a serialized-item excerpt and nextTextOffset. Concatenate excerpts to recover the complete item. If a record changes between excerpts, memory_updated identifies it in records and the incomplete excerpts are not a complete current record.', {
        collection: { ...collection, description: 'Memory section to read; omit to search all sections.' },
        key: { ...string, description: 'One record in collection; with textOffset, continues from nextTextOffset.' },
        ranges: { type: 'array', description: 'Inclusive one-based maintenance ranges. Summary records match their latest responsible batch, even when it extends outside the requested floors; anchors match their own floor. Multiple ranges form a union. Omit for all ranges; [] selects none. Combined with other filters by intersection.',
            items: object({ from: { type: 'integer', minimum: 1, description: 'First floor, inclusive.' },
                to: { type: 'integer', minimum: 1, description: 'Last floor, inclusive, through task.cutoff.' } }, ['from', 'to']) },
        query: { ...string, description: 'Case-insensitive literal text in business values: names, places, titles or descriptions. Internal identifiers and recording metadata are not searched.' },
        cursor: { ...string, description: 'Opaque continuation returned by next. Omit to start reading.' },
        limit: { type: 'integer', minimum: 1, maximum: MEMORY_PAGE_SIZE, description: `Default and max ${MEMORY_PAGE_SIZE}.` },
        textOffset: { ...integer, description: 'Character offset within the first serialized item on this page. Default 0. Use returned next arguments to continue.' },
    }),
    tool('SearchSource', 'Find floors whose story text contains a literal phrase, case-insensitive, through task.cutoff. Returns hits {floor,role,name,excerpt} and next (the floor to continue from, or null). An excerpt helps choose floors to read; a miss is not proof of absence.', {
        query: { ...string, description: 'Literal phrase to find in filtered story text, case-insensitive; not a regular expression.' }, from: { type: 'integer', minimum: 1, description: 'First floor searched. Default 1.' },
        limit: { type: 'integer', minimum: 1, maximum: 20, description: 'Maximum hits. Default and max 20.' },
    }, ['query']),
    tool('ReadSource', 'Read floors floor through to, up to ' + SOURCE_PAGE_CHARS
        + ' text characters per call. Returns items {floor,name,role,view,text,excludedCharacters,complete,next} and next (arguments that continue the range, or null). The story view is filtered dialogue; the raw view is the whole message including removed blocks.', {
        floor: { type: 'integer', minimum: 1 }, to: { type: 'integer', minimum: 1, description: 'Last floor, inclusive. Default floor.' },
        offset: { ...integer, description: 'Character offset within the first floor. Default 0.' },
        view: { type: 'string', enum: ['story', 'raw'], description: 'Default story.' },
    }, ['floor']),
    tool('EditMemory', 'Validate and stage one complete edit list atomically for this task. Edits run in list order; a renamed record uses its new key in later edits, and keys stay unique so each edit has one target. References are checked on the final list, so a deletion and corrections to its references can be submitted together in either order. Returns status staged and changed (operation count); these changes are visible to later reads and tools in this task, but are not saved yet. status unchanged with changed: 0 means an empty list or unchanged values. On validation failure returns status needs_fix and rejected:[{entry,field,code,message,expected?}]. expected gives accepted fields, values or type and bounds; unchecked lists checks needing valid input first. The rejected list takes no effect; earlier valid lists remain staged. A memory_updated error lists conflicting records as {collection,key} in records. Read the current targets before correcting the affected edits. The application submits the accumulated valid work once when this task finishes.', {
        edits: { type: 'array', items: edit, description: 'Corrections, deletions and complete event merges; [] when no changes.' },
        note: { ...string, description: 'Optional brief explanation of changes or unresolved issues, in the dialogue language.' },
    }, ['edits']),
    tool('CompleteMaintenance', 'Stage completion of an inclusive floor range. Returns status staged, changed: 0 and task including this task\'s staged completed/pending ranges. Repeating a completed or already staged range returns unchanged. Completion is your declaration of work performed, not proof that every floor was read or every memory is correct. Edits in the same response are validated first; a failed edit prevents that response from staging completion. The application saves completion with the valid edits when this task finishes. This tool leaves the conversation open.', {
        from: { type: 'integer', minimum: 1, description: 'First floor maintained, inclusive.' },
        to: { type: 'integer', minimum: 1, description: 'Last floor maintained, inclusive, through task.cutoff.' },
    }, ['from', 'to']),
];
