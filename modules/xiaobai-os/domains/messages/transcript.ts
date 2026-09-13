import { payloadText, type MessageSegment, type MessagesDomainV2 } from './types.js';

// The persisted private-message protocol must remain readable and inert to both
// XML and SillyTavern macro expansion. It is independent of Host prompt layout.
function escape(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&apos;').replace(/{/g, '&#123;').replace(/}/g, '&#125;');
}

export function projectionText(state: Pick<MessagesDomainV2, 'messages'>, segment: MessageSegment, throughSeq = Infinity): string {
    const messages = new Map(state.messages.map(message => [message.id, message]));
    return [
        '<私人信息>',
        ...(segment.recovered ? ['<补录说明>以下为此前已发生、尚未确认同步的通讯，现补录于此；每条日期为实际发送时间。</补录说明>'] : []),
        ...segment.messageIds.map(id => messages.get(id)!).filter(m => m.seq <= throughSeq).map(message =>
            `<消息 序号="${message.seq}" 发送者="${escape(message.from)}" 接收者="${escape(message.to)}" 方向="${message.sender === 'user' ? '发出' : '收到'}" 类型="${message.payload.type}" 时间="${new Date(message.createdAt).toISOString()}"${message.payload.type === 'image' && message.payload.attachment ? ` 附件="${escape(message.payload.attachment.path)}"` : ''}>${escape(payloadText(message.payload))}</消息>`),
        '</私人信息>',
    ].join('\n');
}
