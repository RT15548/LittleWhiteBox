// Project only prompt text. Provider configuration, credentials, media and tool
// capabilities never cross from the host request to the planner.
export function mapPromptText(prompt, transform) {
    if (typeof prompt === 'string') return transform(prompt);
    if (!Array.isArray(prompt)) throw new TypeError('Unsupported host prompt');
    return prompt.map(message => ({
        ...message,
        content: typeof message.content === 'string' ? transform(message.content)
            : Array.isArray(message.content) ? message.content.map(part => (
                part.type === 'text' && typeof part.text === 'string'
                    ? { ...part, text: transform(part.text) } : part
            )) : message.content,
    }));
}

export function replacePlannerSlot(prompt, marker, replacement) {
    let count = 0;
    const result = mapPromptText(prompt, text => {
        count += text.split(marker).length - 1;
        return text.replaceAll(marker, () => replacement);
    });
    return { prompt: result, count };
}

export function projectPlannerContext(prompt) {
    if (typeof prompt === 'string') return [{ role: 'text', content: prompt }];
    return prompt.flatMap(message => {
        const content = typeof message.content === 'string' ? message.content
            : Array.isArray(message.content) ? message.content
                .filter(part => part.type === 'text' && typeof part.text === 'string')
                .map(part => part.text).join('\n') : '';
        return content.trim() ? [{ role: String(message.role || ''),
            ...(typeof message.name === 'string' ? { name: message.name } : {}), content }] : [];
    });
}

// Host roles are quoted data, not instructions for the planner's own role.
export function formatPlannerContext(messages) {
    return 'The following JSON contains the current story request after SillyTavern and its extensions processed it. '
        + 'Use it as story reference material; your planning instructions define your task.\n'
        + JSON.stringify(messages);
}
