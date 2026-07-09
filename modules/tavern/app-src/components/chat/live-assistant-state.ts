import type { TavernActionCheckRuntimeEvent } from '../../../shared/runtime-events';

type ThoughtLike = { label?: string; text?: string };

export function hasRenderableLiveAssistantContent(input: {
    text?: unknown;
    thoughts?: ThoughtLike[] | unknown;
    actionCheckEvents?: TavernActionCheckRuntimeEvent[] | unknown;
}): boolean {
    const text = String(input.text || '');
    const thoughts = Array.isArray(input.thoughts) ? input.thoughts : [];
    const actionCheckEvents = Array.isArray(input.actionCheckEvents) ? input.actionCheckEvents : [];
    return !!text || thoughts.length > 0 || actionCheckEvents.length > 0;
}

export function hasRenderableLiveAssistantMarkdown(input: {
    text?: unknown;
    actionCheckEvents?: TavernActionCheckRuntimeEvent[] | unknown;
}): boolean {
    const text = String(input.text || '');
    const actionCheckEvents = Array.isArray(input.actionCheckEvents) ? input.actionCheckEvents : [];
    return !!text || actionCheckEvents.length > 0;
}
