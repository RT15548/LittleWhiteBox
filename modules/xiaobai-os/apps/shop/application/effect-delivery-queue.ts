import { parseShopEffectReceipt } from '../../../domains/shop/invariants.js';
import { deliverShopEffects, getShopCasToken } from '../../../domains/shop/timeline.js';
import type { ShopDeliveryResult, ShopDomainV2, ShopEffectReceipt } from '../../../domains/shop/types.js';
import { observeBackgroundTask } from '../../../../../shared/common/async-errors.js';


export interface ShopEffectDelivery {
    chatIdentity: string;
    actionId: string;
    receipt: ShopEffectReceipt;
}

interface ShopEffectDeliverySource {
    chatIdentity: string;
    domain: ShopDomainV2 | null;
}

interface ShopEffectDeliveryQueueDependencies {
    readCurrent: () => ShopEffectDeliverySource | null;
    persist: (delivery: ShopEffectDelivery) => Promise<unknown>;
    now?: () => number;
    onError?: (error: unknown, delivery: ShopEffectDelivery) => void;
}

export interface ShopEffectDeliveryQueue {
    readCurrent: (expectedChatIdentity: string) => ShopDomainV2 | null;
    enqueue: (delivery: ShopEffectDelivery) => void;
    resume: (chatIdentity: string) => void;
}

interface DeliveryTicket extends ShopEffectDelivery {
    projectedAt: number;
    projectedEventId: string;
}

interface DeliveryLane {
    tickets: DeliveryTicket[];
    draining: boolean;
    scheduled: boolean;
    paused: boolean;
}

function publicDelivery(ticket: DeliveryTicket): ShopEffectDelivery {
    return {
        chatIdentity: ticket.chatIdentity,
        actionId: ticket.actionId,
        receipt: structuredClone(ticket.receipt),
    };
}

export function createShopEffectDeliveryQueue({
    readCurrent,
    persist,
    now = Date.now,
    onError = (error, delivery) => console.error(
        '[LittleWhiteBox] 商店效果交付保存失败',
        { chatIdentity: delivery.chatIdentity, actionId: delivery.actionId },
        error,
    ),
}: ShopEffectDeliveryQueueDependencies): ShopEffectDeliveryQueue {
    const lanes = new Map<string, DeliveryLane>();
    let projectedEventSequence = 0;

    function getLane(chatIdentity: string): DeliveryLane {
        let lane = lanes.get(chatIdentity);
        if (!lane) {
            lane = { tickets: [], draining: false, scheduled: false, paused: false };
            lanes.set(chatIdentity, lane);
        }
        return lane;
    }

    function deliverTicket(domain: ShopDomainV2, ticket: DeliveryTicket): ShopDeliveryResult {
        return deliverShopEffects(domain, {
            ...getShopCasToken(domain),
            actionId: ticket.actionId,
            receipt: ticket.receipt,
        }, {
            now: () => ticket.projectedAt,
            createEventId: () => ticket.projectedEventId,
        });
    }

    function projectTicket(domain: ShopDomainV2, ticket: DeliveryTicket): ShopDomainV2 {
        return deliverTicket(domain, ticket).domain;
    }

    function projectLane(domain: ShopDomainV2, lane: DeliveryLane | undefined): ShopDomainV2 {
        return (lane?.tickets || []).reduce(projectTicket, structuredClone(domain));
    }

    function currentSource(expectedChatIdentity: string): ShopEffectDeliverySource | null {
        const source = readCurrent();
        return source?.chatIdentity === expectedChatIdentity ? source : null;
    }

    async function drain(chatIdentity: string, lane: DeliveryLane): Promise<void> {
        if (lane.draining || lane.paused) {return;}
        lane.draining = true;
        try {
            while (!lane.paused && lane.tickets.length > 0) {
                const ticket = lane.tickets[0];
                try {
                    await persist(publicDelivery(ticket));
                    lane.tickets.shift();
                } catch (error) {
                    lane.paused = true;
                    try {
                        onError(error, publicDelivery(ticket));
                    } catch (reportError) {
                        console.error('[LittleWhiteBox] 商店效果交付错误上报失败', reportError);
                    }
                }
            }
        } finally {
            lane.draining = false;
            if (lane.tickets.length === 0) {lanes.delete(chatIdentity);}
        }
    }

    function scheduleDrain(chatIdentity: string, lane: DeliveryLane): void {
        if (lane.scheduled || lane.draining || lane.paused || lane.tickets.length === 0) {return;}
        lane.scheduled = true;
        queueMicrotask(() => {
            lane.scheduled = false;
            observeBackgroundTask(drain(chatIdentity, lane), { source: import.meta.url, operation: "callback" });
        });
    }

    function readProjectedCurrent(expectedChatIdentity: string): ShopDomainV2 | null {
        const source = currentSource(expectedChatIdentity);
        if (!source) {return null;}
        const lane = lanes.get(expectedChatIdentity);
        if (!source.domain) {
            if (lane?.tickets.length) {throw new Error('shop_delivery_base_missing');}
            return null;
        }
        return projectLane(source.domain, lane);
    }

    function enqueue(input: ShopEffectDelivery): void {
        const chatIdentity = String(input.chatIdentity || '').trim();
        if (!chatIdentity) {throw new Error('shop_generation_chat_changed');}
        const source = currentSource(chatIdentity);
        if (!source?.domain) {throw new Error('shop_generation_chat_changed');}
        const receipt = parseShopEffectReceipt(input.receipt);
        const existingLane = lanes.get(chatIdentity);
        const projected = projectLane(source.domain, existingLane);
        let projectedEventId: string;
        do {
            projectedEventId = `shop-pending-${++projectedEventSequence}`;
        } while (projected.events.some(event => event.eventId === projectedEventId));
        const ticket: DeliveryTicket = {
            chatIdentity,
            actionId: String(input.actionId || '').trim(),
            receipt,
            projectedAt: now(),
            projectedEventId,
        };
        if (!deliverTicket(projected, ticket).created) {return;}
        const lane = existingLane || getLane(chatIdentity);
        lane.tickets.push(ticket);
        lane.paused = false;
        scheduleDrain(chatIdentity, lane);
    }

    function resume(chatIdentity: string): void {
        const lane = lanes.get(chatIdentity);
        if (!lane) {return;}
        lane.paused = false;
        scheduleDrain(chatIdentity, lane);
    }

    return Object.freeze({ readCurrent: readProjectedCurrent, enqueue, resume });
}
