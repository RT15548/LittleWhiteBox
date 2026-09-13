import { projectionMarker, type ChatMessage } from '../application/projection.js';
import { createMessageRecordView } from './message-record-view.js';

// DOM-lifetime only: native message updates may replace the text node's contents.
const views = new WeakMap<HTMLElement, { segmentId: string; source: string; view: ReturnType<typeof createMessageRecordView> }>();

/** Display only: never reconstruct the sidecar from rendered markup. */
export function renderPrivateMessages(messages: readonly ChatMessage[], root: ParentNode = document): void {
    messages.forEach((message, index) => {
        const marker = projectionMarker(message);
        if (!marker || !message.mes) {return;}
        const target = root.querySelector<HTMLElement>(`.mes[mesid="${index}"] .mes_text`);
        if (!target || target.closest('.mes')?.querySelector('.edit_textarea')) {return;}
        const previous = views.get(target);
        const sameSegment = previous?.segmentId === marker.segmentId;
        if (sameSegment && previous.source === message.mes && previous.view.details.parentNode === target) {return;}
        const xml = new DOMParser().parseFromString(message.mes, 'application/xml');
        if (xml.querySelector('parsererror') || xml.documentElement.tagName !== '私人信息') {return;}
        const nodes = Array.from(xml.documentElement.children);
        if (nodes.some(node => node.tagName !== '消息' && node.tagName !== '补录说明')) {return;}
        const view = sameSegment ? previous.view : createMessageRecordView(target.ownerDocument);
        view.update(nodes, target);
        views.set(target, { segmentId: marker.segmentId, source: message.mes, view });
    });
}
