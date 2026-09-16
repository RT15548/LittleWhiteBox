import { payloadText, type MessageContact, type PrivateMessage } from '../../../domains/messages/types.js';
import { escapePromptData as escape } from '../../../host/prompt-context/format.js';
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
        return '<communication_break kind="unplaced">前后通讯的原始剧情位置无法完整定位，记录相邻不代表故事中紧接着发生。</communication_break>';
    }
    return `<communication_break kind="story" from_story_floor="${gap.fromFloor}" through_story_floor="${gap.throughFloor}">上段通讯之后，主剧情继续发展；下面是在这些剧情之后重新联系。上段言行属于当时的关系与处境。楼层表示叙事顺序，具体相隔多久以剧情记忆为准。</communication_break>`;
}

export function communicationBlock(stage: CommunicationStage, content: string): string {
    const floor = stage.afterStoryFloor;
    const position = floor === null ? '原始剧情位置未知。' : floor === 0 ? '位于现有主剧情记录的起点。' : `发生在主剧情第${floor}楼之后。`;
    return `<communication after_story_floor="${floor ?? 'unknown'}">\n${position}\n${content}\n</communication>`;
}

export function communicationRecords(stages: readonly CommunicationStage[], records: PrivateMessage[], afterSeq: number): string {
    let offset = 0;
    return stages.flatMap(stage => {
        const members: PrivateMessage[] = [];
        while (offset < records.length && records[offset].seq <= stage.throughSeq) {members.push(records[offset++]);}
        if (!members.length) {return [];}
        return [stage.firstSeq > afterSeq ? communicationBreak(stage) : '', communicationBlock(stage, members.map(threadLine).join('\n'))];
    }).filter(Boolean).join('\n');
}

export function earlierSummary(summary: MessageContact['summary'], stages: readonly CommunicationStage[]): string {
    if (!summary) {return '';}
    const covered = stages.filter(stage => stage.firstSeq <= summary.throughSeq);
    const first = covered[0]; const last = covered.at(-1);
    // A summary's placement stays bounded; enumerating every archived stage would defeat compaction.
    const scope = `<covered_communications count="${covered.length}" first_after_story_floor="${first?.afterStoryFloor ?? 'unknown'}" last_after_story_floor="${last?.afterStoryFloor ?? 'unknown'}">摘要涵盖以上起止范围，末尾停在最后一个通讯时点内；各阶段的言行见摘要正文。</covered_communications>`;
    const lastBreak = covered.length > 1 && last ? `<last_summarized_transition>这是摘要进入末段通讯前的间隔。\n${communicationBreak(last)}\n</last_summarized_transition>` : '';
    return `<earlier_summary>\n以下摘要替代较早短信。\n${scope}\n${lastBreak}\n<summary_text>${escape(summary.text)}</summary_text>\n</earlier_summary>`;
}
