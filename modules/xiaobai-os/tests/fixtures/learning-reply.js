/** Scripted teachers declare their known assistance through the real tool loop before returning text. */
export function declaredTeacher(handler, assistance = () => ({ exerciseIds: [], materialIds: [] })) {
    let pending;
    let step = 0;
    return async request => {
        if (pending) { const result = pending; pending = null; return result; }
        const result = await handler(request, ++step);
        if (!request.tools?.length || !result.text || result.toolCalls?.length || result.finishReason && result.finishReason !== 'completed') { return result; }
        pending = result;
        return { toolCalls: [{ id: `disclosure-${step}`, name: 'LearningHelp', arguments: JSON.stringify(assistance(request)) }] };
    };
}
