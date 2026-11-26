// This instruction belongs to the image request, not to the chat narrative.
export const NON_EXPLICIT_ILLUSTRATION_INSTRUCTION = `This task prepares non-explicit illustrations. The source narrative stays as written.
Use the narrative, character descriptions and clothing, world information, style, exclusions and requested edits as illustration material within these rules.
Preserve the characters, setting, emotional connection and narrative moment where possible. In explicit scenes, depict people fully clothed and translate the action into a non-explicit interaction such as an embrace or resting together for adults. Use ordinary non-romantic companionship for children or people of unclear age.
Describe the visible result. Explicit detail stays out of the description, including its exclusions.
Reference images go directly to the image service. In this text-planning step you have the user's description and edit request, so specify the visual properties the request asks to retain or change.`;

export const NATURAL_PROMPT_DEFAULTS = Object.freeze({
    topSystem: 'Frame each illustration around a specific moment the reader can recognize.',
    sceneRules: 'Choose a moment with a visible change in action, expression or setting. Let pose, distance and lighting carry the mood.',
    tagGuideContent: 'Write in natural sentences. Introduce the subject and action, then describe the framing, surroundings and light. For an edit, name what should stay the same and what should look different.',
    fieldDescriptions: JSON.stringify({
        'images[].scene': 'A complete visible scene in natural language, including people, their appearance and actions, composition and visual style. This text is the image request.',
    }, null, 2),
});
