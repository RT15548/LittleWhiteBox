import type { ManagementTool } from '../../../capabilities/management/index.js';
import { MANAGEMENT_READ_CHARS } from '../../../capabilities/management/read-page.js';
import { ADMINISTRATOR_POLICY as POLICY } from '../domain/policy.js';

const floor = { type: 'integer', minimum: 0, description: 'SillyTavern floor number, counted from 0 without renumbering.' };
const chatScope = 'All floors in the current chat are available, including hidden and system messages; each floor uses its currently selected message version.';
export const ADMINISTRATOR_CHAT_TOOLS: readonly ManagementTool[] = [
    { effect: 'read', label: '搜索原文', target: a => String(a.query ?? ''), definition: { type: 'function', function: {
        name: 'ChatSearch', description: [
            'Find a literal, case-insensitive phrase in the current chat.',
            chatScope,
            'data contains items with floor, speaker, snippet and its text offset, plus next (continuation arguments) and complete.',
            'Use it to locate relevant passages before reading their surrounding context.',
            `Returns the first match on each matching floor, up to ${POLICY.chatSearchMatches} matches per call.`,
            'When next is present, pass those arguments to continue the search. A miss means the phrase was not found in the searched range, not that the event never happened.',
        ].join('\n'),
        parameters: { type: 'object', properties: {
            query: { type: 'string', minLength: 1, maxLength: POLICY.chatQueryChars, description: 'One name, object name or short phrase. Spaces and punctuation match literally. Search separate clues separately; if no match, shorten or reword the phrase.' },
            from: { ...floor, description: 'Inclusive start floor in SillyTavern’s zero-based numbering. Default 0.' },
            to: { ...floor, description: 'Inclusive end floor in the same numbering. Default last floor.' },
        }, required: ['query'], additionalProperties: false },
    } } },
    { effect: 'read', label: '读取原文', target: a => `#${a.from}${a.to !== undefined && a.to !== a.from ? `–#${a.to}` : ''}`, definition: { type: 'function', function: {
        name: 'ChatRead', description: [
            'Read an inclusive floor range of the current chat.',
            chatScope,
            'data contains items with floor, speaker, role, text, offset and totalChars; scanned gives the covered range.',
            'Use it for exact message text and context around a known floor.',
            `Each call covers at most ${POLICY.chatReadFloors} floors and returns at most ${MANAGEMENT_READ_CHARS} text characters.`,
            'When next is present, pass that whole object to ChatRead to continue: it contains from, to and offset. next is null and complete is true when the requested range is finished.',
            'Continuation requires the same message version. After an edit or swipe change, read that floor again from offset 0.',
        ].join('\n'),
        parameters: { type: 'object', properties: {
            from: floor,
            to: { ...floor, description: 'Inclusive end floor. Default from, which reads a single floor.' },
            offset: { type: 'integer', minimum: 0, description: 'Text offset within the starting floor. Default 0.' },
        }, required: ['from'], additionalProperties: false },
    } } },
];
