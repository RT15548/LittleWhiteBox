import { MEMORY_PAGE_SIZE, MEMORY_PAGE_CHARS } from './limits.js';
import { SOURCE_PAGE_CHARS } from './evidence.js';
import { EVENT_MEMORY_ROLES } from '../data/events.js';
import { RELATION_TRENDS } from '../data/fact-predicates.js';
import { MEMORY_COLLECTIONS } from './domain.js';
import { ARC_PROGRESS_MAX } from '../generate/arc-progress.js';

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

export const MEMORY_TOOLS = [
    tool('ReadMemory', 'Read current memories. Returns items, total (matching record count) and next (complete arguments for continuation, or null). Items contain collection, key, value, maintenanceRange and generatedBy. One page holds up to '
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
    tool('EditMemory', 'Validate and save one complete edit list atomically. Edits run in list order; a renamed record uses its new key in later edits, and keys stay unique so each edit has one target. References are checked on the final result, so a deletion and the corrections to its references can be submitted together in either order. Returns status saved, changed (operation count) and receiptId after confirmed persistence; status unchanged with changed: 0 means an empty list or unchanged values. On validation failure returns status needs_fix and rejected:[{entry,field,code,message,expected?}] for independent problems. expected gives accepted fields, values or type and bounds. unchecked lists dependent record or reference checks that need valid input first. Nothing in that list takes effect; correct and resubmit the list. A memory_updated error lists changed records as {collection,key} in records. Multiple calls execute in order and return their own save results.', {
        edits: { type: 'array', items: edit, description: 'Corrections, deletions and complete event merges; [] when no changes.' },
        note: { ...string, description: 'Optional brief explanation of changes or unresolved issues, in the dialogue language.' },
    }, ['edits']),
    tool('CompleteMaintenance', 'Record that you have finished maintaining an inclusive floor range. Returns status saved, receiptId and task with current completed/pending ranges after confirmed persistence. Repeating a completed range returns unchanged without a new record. Completion records your declaration of work performed, not proof that every source floor was read or every memory is correct. Edits in the same response save before completion; a failed edit prevents that response from recording completion. This tool leaves the conversation open.', {
        from: { type: 'integer', minimum: 1, description: 'First floor maintained, inclusive.' },
        to: { type: 'integer', minimum: 1, description: 'Last floor maintained, inclusive, through task.cutoff.' },
    }, ['from', 'to']),
];
