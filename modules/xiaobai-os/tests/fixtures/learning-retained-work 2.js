// One public evidence record whose still-current source was later edited with private story context.
export async function prepareRetainedLearningWork(h, { retire = false } = {}) {
    const call = (name, args) => ({ id: name, name, arguments: JSON.stringify(args) });
    const requestData = request => JSON.parse(request.messages.findLast(message => message.role === 'user'
        && message.content.includes('<learning_request>')).content.split('<learning_request>\n')[1].split('\n</learning_request>')[0]);
    await h.openLesson();
    const unit = h.profile().unit;
    await h.command('submit', { unitId: unit.id, exerciseId: unit.exercises[0].id, answer: { kind: 'choice', ids: ['a'] } });
    const evidence = structuredClone(h.profile().items[0].evidence[0]);
    const itemId = h.profile().items[0].id;
    const completions = structuredClone(h.profile().completions);
    h.flags.teacherResponse = (request, round) => requestData(request).delegation
        ? round === 1 ? { toolCalls: [call('LearningLessonEdit', { title: 'Story-specific lesson',
            materials: [{ key: 'private-extra', title: 'Private story material', kind: 'authored', text: 'A private conversation about the river.' }] })] }
            : { text: 'Course edited.' }
        : round === 1 ? { toolCalls: [call('LearningRequest', { task: 'Add our story context to this lesson.' })] } : { text: 'Task sent.' };
    await h.command('talk', { message: 'Add our story context to this lesson.' });
    const privateUnit = structuredClone(h.profile().unit);
    if (retire) { await h.command('abandon'); }
    await h.changeChat();
    await h.command('records', { id: itemId });
    h.flags.teacherResponse = (request, round) => round === 1
        ? { toolCalls: [call('LearningAssess', { attemptId: requestData(request).focus.attempt.id, review: true,
            verdict: 'partial', understanding: 'The original answer has been reconsidered.', expression: '', guidance: 'Compare the alternatives.' })] }
        : { text: 'Saved answer reviewed.' };
    return { evidence, itemId, completions, privateUnit };
}
