import type { PromptContextSnapshot } from './types.js';

export function escapePromptData(value: unknown): string {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
        .replace(/{/g, '&#123;')
        .replace(/}/g, '&#125;');
}

/**
 * Keeps prose intact (quotes, braces, emoticons) and only defuses text that reads as a tag,
 * so supplied material cannot open or close the prompt's own blocks.
 */
export function escapePromptTags(value: unknown): string {
    return String(value ?? '').replace(/<(?=\/?[A-Za-z_])/g, '＜');
}

type Escape = (value: unknown) => string;

function characterBlock(character: PromptContextSnapshot['characters'][number], escape: Escape): string {
    return [
        '  <character>',
        `    <name>${escape(character.displayName)}</name>`,
        character.description ? `    <description>${escape(character.description)}</description>` : '',
        character.personality ? `    <personality>${escape(character.personality)}</personality>` : '',
        character.scenario ? `    <scenario>${escape(character.scenario)}</scenario>` : '',
        '  </character>',
    ].filter(Boolean).join('\n');
}

export function buildPromptSettingBlock(
    context: PromptContextSnapshot,
    { economyScale = '', escape = escapePromptData, exampleNote = '' }: {
        readonly economyScale?: string; readonly escape?: Escape;
        /** Shown only when the material carries dialogue examples. */
        readonly exampleNote?: string;
    } = {},
): string {
    const hasExamples = Boolean(context.exampleDialogue || context.worldInfo.extras?.exampleBefore.length
        || context.worldInfo.extras?.exampleAfter.length);
    return [
        '<setting>',
        '以下是人物与世界背景资料。',
        hasExamples && exampleNote ? exampleNote : '',
        economyScale ? `<economy_scale>\n${escape(economyScale)}\n</economy_scale>` : '',
        '<player>',
        `  <name>${escape(context.player.displayName)}</name>`,
        context.player.persona ? `  <persona>${escape(context.player.persona)}</persona>` : '',
        '</player>',
        ...(context.characters.length ? [
            '<characters>',
            ...context.characters.map(character => characterBlock(character, escape)),
            '</characters>',
        ] : []),
        context.characterNote ? `<character_note>${escape(context.characterNote)}</character_note>` : '',
        context.exampleDialogue ? `<example_dialogue>${escape(context.exampleDialogue)}</example_dialogue>` : '',
        context.worldInfo.before
            ? `<world_info_before>\n${escape(context.worldInfo.before)}\n</world_info_before>`
            : '',
        context.worldInfo.after
            ? `<world_info_after>\n${escape(context.worldInfo.after)}\n</world_info_after>`
            : '',
        context.worldInfo.depth.length
            ? `<world_info_at_depth>\n${context.worldInfo.depth.map(escape).join('\n\n')}\n</world_info_at_depth>`
            : '',
        context.worldInfo.extras?.exampleBefore.length
            ? `<world_info_example_before>\n${context.worldInfo.extras.exampleBefore.map(escape).join('\n\n')}\n</world_info_example_before>`
            : '',
        context.worldInfo.extras?.exampleAfter.length
            ? `<world_info_example_after>\n${context.worldInfo.extras.exampleAfter.map(escape).join('\n\n')}\n</world_info_example_after>`
            : '',
        context.worldInfo.extras?.authorNoteBefore.length
            ? `<world_info_author_note_before>\n${context.worldInfo.extras.authorNoteBefore.map(escape).join('\n\n')}\n</world_info_author_note_before>`
            : '',
        context.worldInfo.extras?.authorNoteAfter.length
            ? `<world_info_author_note_after>\n${context.worldInfo.extras.authorNoteAfter.map(escape).join('\n\n')}\n</world_info_author_note_after>`
            : '',
        '</setting>',
    ].filter(Boolean).join('\n');
}

function recentMessagesBlock(messages: PromptContextSnapshot['recentMessages']): string {
    if (!messages.length) {return '';}
    return [
        '<recent_messages>',
        ...messages.map(message => [
            `  <message role="${message.role}" speaker="${escapePromptData(message.speakerName)}">`,
            escapePromptData(message.text),
            '  </message>',
        ].join('\n')),
        '</recent_messages>',
    ].join('\n');
}

export function buildPromptCurrentStateBlock(
    context: PromptContextSnapshot,
    { additionalSections = [] }: { readonly additionalSections?: readonly string[] } = {},
): string {
    const sections = [
        context.storyEvents
            ? `<story_events>\n${escapePromptData(context.storyEvents)}\n</story_events>`
            : '',
        ...additionalSections,
        recentMessagesBlock(context.recentMessages),
    ].filter(section => typeof section === 'string' && section.length > 0);
    return [
        '<current_state>',
        '以下是截至捕获边界的剧情背景，只用于理解当前处境，不是本次需要续写的剧情正文。',
        ...sections,
        '</current_state>',
    ].join('\n');
}
