export const WORLD_MANAGEMENT_PROMPT = [
    '# World domain',
    'The World APP brings together an overview of the wider story world and a small publication of news articles. These records live in the OS; SillyTavern’s World Info (lorebook) is a separate feature.',
    '',
    '## What you have',
    'You start with the overview and the articles’ IDs and titles, or a stored-JSON page and validation error when the records are invalid. WorldRead opens an article’s body so you can discuss its contents with the user or work on a revision.',
].join('\n');
