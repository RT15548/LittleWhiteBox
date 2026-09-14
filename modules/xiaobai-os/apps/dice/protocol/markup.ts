export const ACTION_CHECK_OPEN = '<xb_action_check>';
export const ACTION_CHECK_CLOSE = '</xb_action_check>';

// The first capture preserves code/quotes for native regex replacement ($1).
// Backreferences belong to this entire expression, not separate regexes.
const ticks = '^ {0,3}(`{3,})[^\\n]*(?:\\n|$)[\\s\\S]*?(?:^ {0,3}\\2`*[ \\t]*(?:\\n|$)|(?![\\s\\S]))';
const tildes = '^ {0,3}(~{3,})[^\\n]*(?:\\n|$)[\\s\\S]*?(?:^ {0,3}\\3~*[ \\t]*(?:\\n|$)|(?![\\s\\S]))';
const inline = '(?:^|[^`])(`+)(?!`)(?:[^`]|(?!\\4(?!`))`+(?!`))*\\4(?!`)';
const quote = '^ {0,3}>[^\\n]*(?:\\n(?![ \\t]*(?:\\n|$))[^\\n]*)*';
const protectedMarkup = `(${ticks}|${tildes}|${inline}|${quote})`;

/** Only a complete opening tag starts display filtering. Partial tags stay ordinary text. */
export const ACTION_CHECK_DISPLAY_PATTERN = `${protectedMarkup}|^ {0,3}${ACTION_CHECK_OPEN}[\\s\\S]*$`;

/** Scan the whole body to retain Markdown context, but only return a newly generated invocation. */
export function findActionCheckStart(body: string, generatedFrom: number): number | null {
    const pattern = new RegExp(`${protectedMarkup}|^ {0,3}<xb_action_check(?:>|(?=[ \\t\\r\\n]|$))`, 'gm');
    for (const match of body.matchAll(pattern)) {
        if (match[1] === undefined && match.index >= generatedFrom) { return match.index; }
    }
    return null;
}
