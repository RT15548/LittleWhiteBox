import { readFile } from 'node:fs/promises';
import { loadNarrativeCanon } from '../../apps/game/expedition/narrative/canon.ts';
import { estimateConversationTokens } from '../../../agent-core/runtime/context-tokens.js';
import { createMemoryJobs } from '../../apps/game/expedition/narrative/memory-jobs.ts';

export const loadCanon = (person, signal) => loadNarrativeCanon(person, signal,
    name => readFile(new URL(`../../docs/expedition-cards/${name}.md`, import.meta.url), 'utf8'));
export const countTokens = async options => ({ tokens: estimateConversationTokens(options), source: 'estimated' });
export const narrativeOptions = { loadCanon, countTokens, received() {}, memory: { read: () => null, compact: async () => { throw new Error('Fixture must provide memory storage for compaction'); } } };
export function conversationMemory(campaign, save = async () => {}) {
    const memories = structuredClone(campaign.memories);
    const jobs = createMemoryJobs({ countTokens, changed() {}, async save(snapshot, person, memory) { await save(memory); memories[person] = memory; } });
    return { read: () => memories.sanniang, compact: (session, snapshot) => jobs.start(session, snapshot, 'sanniang') };
}

// Inspect the actual model boundary, not source text or the wording of prompt paragraphs.
export function promptBlock(text, tag) {
    const start = text.indexOf(`<${tag}>\n`) + tag.length + 3;
    const end = text.indexOf(`\n</${tag}>`, start);
    if (start < tag.length + 3 || end < start) throw new Error(`Missing prompt block: ${tag}`);
    return text.slice(start, end);
}
export function inspectNarrativePrompt(prompt) {
    const player = promptBlock(prompt.systemPrompt, 'player');
    const first = prompt.messages[0].content, last = prompt.messages.at(-1).content;
    const storyStart = first.indexOf('<story>\n'), storyEnd = last.lastIndexOf('\n</story>');
    if (storyStart < 0 || storyEnd < 0) throw new Error('Missing story boundary');
    return {
        player: JSON.parse(player.slice(player.indexOf('{'))),
        operations: JSON.parse(promptBlock(first, 'operations')),
        story: JSON.parse(first.slice(storyStart + '<story>\n'.length)),
        input: last.slice(0, storyEnd),
        instruction: last.slice(storyEnd + '\n</story>'.length).trim(),
    };
}

// Scene tags are request framing, not part of the saved player's speech.
export function inspectHistoryMessage(message) {
    const match = /^<scene>\n([^]*?)\n<\/scene>\n/.exec(message.content);
    return { scene: match ? JSON.parse(match[1]) : null, input: match ? message.content.slice(match[0].length) : message.content };
}

// External response framing, shared by service fixtures. Boundary tests use literal wire samples.
export function narrativeReply({ reply, ...controls }) {
    return `<dialogue>\n${reply}\n</dialogue>\n${JSON.stringify(controls)}`;
}
