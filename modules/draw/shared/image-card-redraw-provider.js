import { DRAW_SLOT_COPY } from './image-record.js';
import { observeFloorImageJob, failFloorImageJob } from './floor-image-job.js';

// Prepared cards and native tags enter the same batch registry as capsules.
export function createImageCardRedrawProvider({ execute, createJob, releaseJob,
    getCurrentContext, setStateForMessage, classifyError }) {
    return async input => {
        if (input.job) return execute(input);
        const { ctx, message } = input;
        const live = getCurrentContext(), messageId = live.chat?.indexOf(message) ?? -1;
        if (String(live.chatId) !== String(ctx.chatId) || messageId < 0
            || (message.swipe_id ?? 0) !== (input.swipeIndex ?? message.swipe_id ?? 0)) {
            throw new Error(DRAW_SLOT_COPY.sourceChanged);
        }
        // 同楼层已有任务时加入同一批次队列，不再报“该楼层已有任务进行中”；请求由 Provider 串行队列依次执行。
        const job = createJob(messageId, { join: true });
        job.total = input.tasks.length;
        const onStateChange = observeFloorImageJob(job, { getCurrentContext, classifyError,
            onStateChange: (state, data, id) => {
                setStateForMessage(id, state, data);
                input.onStateChange?.(state, data);
            } });
        try { return await execute({ ...input, messageId, job, onStateChange }); }
        catch (error) { failFloorImageJob(job, error); throw error; }
        finally { releaseJob(job); }
    };
}
