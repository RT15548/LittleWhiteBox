import { payloadText, type MessageContact, type PrivateMessage } from '../../../domains/messages/types.js';
import { escapePromptData as escape, escapePromptTags } from '../../../host/prompt-context/format.js';
import type { CommunicationStage } from '../application/communication-chronology.js';

export function threadLine(message: PrivateMessage): string {
    return `<message speaker="${escape(message.from)}" type="${message.payload.type}">${escape(payloadText(message.payload))}</message>`;
}

/** Pixels accompany their named messages; neither filenames nor captions stand in for vision. */
export function withMessageImages(text: string, messages: PrivateMessage[], images: ReadonlyMap<string, string>) {
    const attached = messages.filter(message => message.payload.type === 'image' && message.payload.attachment);
    if (!attached.length) {return text;}
    const parts: ({ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } })[] = [{ type: 'text', text }];
    for (const message of attached) {
        const data = images.get(message.id);
        if (!data) {throw new Error('messages_image_missing');}
        parts.push({ type: 'text', text: `<attached_image message="${escape(message.id)}" speaker="${escape(message.from)}">${escape(payloadText(message.payload))}</attached_image>` },
            { type: 'image_url', image_url: { url: data } });
    }
    return parts;
}

export function communicationBreak(stage: CommunicationStage): string {
    const gap = stage.breakBefore;
    if (!gap) {return '';}
    if (gap.kind === 'unplaced') {
        return '<communication_break kind="unplaced">这两段私信在剧情中的位置没有记全；记录挨着，不代表紧接着发生。</communication_break>';
    }
    return `<communication_break kind="story" from_story_floor="${gap.fromFloor}" through_story_floor="${gap.throughFloor}">前后两段私信之间，主剧情又往前走了；后一次联系发生在这些剧情之后。</communication_break>`;
}

export function communicationBlock(stage: CommunicationStage, content: string): string {
    const floor = stage.afterStoryFloor;
    const position = floor === null ? '在剧情中的位置没有记下。' : floor === 0 ? '这次联系之前，还没有主剧情记录。' : `在主剧情第${floor}楼之后。`;
    return `<communication after_story_floor="${floor ?? 'unknown'}">\n${position}\n${content}\n</communication>`;
}

export function communicationRecords(stages: readonly CommunicationStage[], records: PrivateMessage[], afterSeq: number,
    renderMessage: (message: PrivateMessage) => string = threadLine): string {
    let offset = 0;
    return stages.flatMap(stage => {
        const members: PrivateMessage[] = [];
        while (offset < records.length && records[offset].seq <= stage.throughSeq) {members.push(records[offset++]);}
        if (!members.length) {return [];}
        return [stage.firstSeq > afterSeq ? communicationBreak(stage) : '', communicationBlock(stage, members.map(renderMessage).join('\n'))];
    }).filter(Boolean).join('\n');
}

export function earlierSummary(summary: MessageContact['summary'], stages: readonly CommunicationStage[]): string {
    if (!summary) {return '';}
    const covered = stages.filter(stage => stage.firstSeq <= summary.throughSeq);
    const first = covered[0]; const last = covered.at(-1);
    // A summary's placement stays bounded; enumerating every archived stage would defeat compaction.
    const scope = `<covered_communications count="${covered.length}" first_after_story_floor="${first?.afterStoryFloor ?? 'unknown'}" last_after_story_floor="${last?.afterStoryFloor ?? 'unknown'}">起止位置是摘要里第一段和最后一段私信所在的位置，不表示最后那次联系已经聊完。</covered_communications>`;
    const lastBreak = covered.length > 1 && last ? `<last_summarized_transition>下面说明摘要里最后两段私信之间的情况。\n${communicationBreak(last)}\n</last_summarized_transition>` : '';
    return `<earlier_summary>\n较早的私信已经整理成下面的摘要。\n${scope}\n${lastBreak}\n<summary_text>${escapePromptTags(summary.text)}</summary_text>\n</earlier_summary>`;
}
