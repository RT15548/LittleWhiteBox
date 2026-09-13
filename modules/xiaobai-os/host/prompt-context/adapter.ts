import { getContext } from '../../../../../../../extensions.js';
import { getWorldInfoSettings } from '../../../../../../../world-info.js';
import { createHostPromptContextAdapter, type PromptHostContext } from './capture.js';
import type { PromptContextAdapter } from './types.js';

interface PromptContextAdapterDependencies {
    readonly readContext?: () => PromptHostContext;
    readonly readStoryEvents?: (throughMessageIndex: number) => string | Promise<string>;
    readonly cleanMessageText?: (text: string) => string;
    readonly report?: (error: unknown) => void;
}

async function defaultStoryEvents(throughMessageIndex: number): Promise<string> {
    const module = await import('../../../story-summary/story-summary.js') as {
        getStorySummaryL2EventText?: (options: {
            throughMessageIndex: number;
            maxCharacters: number;
        }) => string;
    };
    return module.getStorySummaryL2EventText?.({ throughMessageIndex, maxCharacters: 20_000 }) || '';
}

export function createPromptContextAdapter({
    readContext = () => ({
        ...(getContext() as unknown as PromptHostContext),
        worldInfoIncludeNames: getWorldInfoSettings().world_info_include_names === true,
    }),
    readStoryEvents = defaultStoryEvents,
    cleanMessageText,
    report = error => console.warn('[LittleWhiteBox] Prompt 背景读取失败', error),
}: PromptContextAdapterDependencies = {}): PromptContextAdapter {
    return createHostPromptContextAdapter({ readContext, readStoryEvents, cleanMessageText, report });
}
