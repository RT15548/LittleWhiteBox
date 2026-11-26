import { CARD_FIELDS, TEXT_FIELDS } from './files.js';

export const CARD_FILES = 'CardFiles';
export const CARD_ASSETS = 'CardAssets';
export const SET_CARD_AVATAR_ACTION = 'setAvatar';

export const CARD_SKILL = Object.freeze({
    id: 'builtin-card-files', title: '小白X角色卡制作',
    summary: 'CardFlow: keep design decisions and open questions in design.md while discussing, prototyping or building to the user\'s current goal. CardFiles edits character-card content and can set its cover (avatar) from a workspace image. Read builtin-card-frontend for presentation and builtin-state3 or builtin-state2 for gameplay state.',
    path: 'modules/card-workspace/skill/SKILL.md',
    tools: [CARD_FILES, CARD_ASSETS],
});

export const FRONTEND_SKILL = Object.freeze({
    id: 'builtin-card-frontend', title: '角色卡前端与交互',
    summary: 'Design story presentation, supporting panels or an integrated play interface. Connect scene entry, reading, player actions and feedback while reusing host chat, variable controls and image operations. Includes a complete integrated-card example; gameplay rules belong to the variable skills.',
    path: 'modules/card-workspace/skill/frontend/SKILL.md',
    tools: [CARD_FILES, CARD_ASSETS],
});

// Field names are derived from the same projection used by CardFiles.
const CARD_FILE_GUIDE = `# Character card files

## The card and its working copy
CardFiles open returns the selected card's root, avatar, name and a directory of files with their names and kinds. These names also appear in the user's workspace. Refer to entries, regexes and tasks by name when discussing edits. An existing folder is reused with its edits intact. The Assistant workspace persists across conversations and reloads. Workspace edits become live card changes only through CardFiles save.

## Edit files
Read and search with scope local. Write creates files; apply_patch changes parts of existing files. The same files are editable in the workspace UI, with original/current/diff views and a writeback button. Save receives file paths, not file contents. Work in the root returned by open.

## File locations
design.md is the card's CardFlow design document. It is stored in the user's SillyTavern files, separate from the card: it is available on every device of that SillyTavern account, never exported with the card, follows a card rename and is deleted with the card. Saving an empty design.md removes the stored document.
Opening checks the saved design for updates. A clean copy updates automatically; a local draft stays intact, and conflicting saved changes are reported. Preserve desired draft text before using refresh to replace it with saved content.
card.json contains ${CARD_FIELDS.join(', ')} and world (the primary linked lorebook name). Other extensions remain on the card untouched.
${TEXT_FIELDS.map(key => `${key}.md`).join(', ')} map to the corresponding card fields. Empty text fields are omitted on import; Write can create them at these paths.
message/0.md is the first greeting. Consecutive numbers starting at 1 are alternate greetings. Append at the next number to add a greeting.
world_book/<book-name>/<entry-name>.md contains one whole worldbook entry. A new book is created when its first entry is saved. Set world in card.json to link a primary book. Existing shared lorebook edits affect its other users too.
regex/<regex-name>.md contains one whole scoped regex, including its replacement text.
tasks/<task-name>.md contains one whole LittleWhiteBox task, including its complete commands and taskjs wrappers when used.
variables/definition.json, variables/functions/<name>.js, variables/tools/<name>.js and variables/scripts/{prepare,calculate,committed}.js hold the variable 3.0 rule bundle; ReadSkill builtin-state3 describes them. Saving or refreshing any variable file handles this complete package, including removed source files.
Card paths keep Chinese, other Unicode names and spaces readable. Reuse paths returned by the tools. Literal percent signs, path separators and control characters inside a name are percent-escaped; the same path works with Read, Write, apply_patch and CardFiles.

## Entry, regex and task documents
Each document starts with a JSON header between two lines containing exactly ---; the body begins on the next line and stays literal text. The header has id, name and settings. id is the saved entry's numeric UID for worldbooks or string ID for regexes/tasks. name is the entry comment, regex scriptName or task name. settings contains the other settings; the text after the header is content, replaceString or commands respectively.
Keep an existing id when renaming or editing. A new document uses an unused nonnegative integer id within its book, or a distinct string id for a regex/task. Omitted settings preserve saved values. One save submits both settings and body together. Edit name to rename an item; after writeback the returned path follows the name. Same-name items have distinct paths and IDs.

## Write back and continue
CardFiles save applies only named files and returns one result per file, including saved, unchanged and error. It does not execute task scripts or reset chat variables. Unfinished scripts can be saved. Missing workspace files do not delete card content. A partial failure leaves successful writes in place and failed files editable; retry only the failed files after correcting them.
If the same saved content changed elsewhere, save reports a conflict for that item. Preserve desired local edits, then use refresh with the specific paths to replace those files with saved content before reapplying the edit.

`;

export function cardSkillContent(body, pluginPath) {
    const directory = `${pluginPath}/${CARD_SKILL.path.slice(0, CARD_SKILL.path.lastIndexOf('/'))}`;
    return `${body.trim()}\n\n## Instance source paths\nSkill directory: ${directory}/\nPlugin source root: ${pluginPath}/\nRead these paths with project scope. Relative links resolve from the directory of the document containing them; drop any #anchor before reading the file.\n\n${CARD_FILE_GUIDE}`;
}

export function frontendSkillContent(body, pluginPath) {
    const directory = `${pluginPath}/${FRONTEND_SKILL.path.slice(0, FRONTEND_SKILL.path.lastIndexOf('/'))}`;
    return `${body.trim()}\n\n## Instance source paths\nSkill directory: ${directory}/\nPlugin source root: ${pluginPath}/\nRead these paths with project scope. Relative links resolve from their containing document; omit #anchors when reading. For card file layouts and writeback, read builtin-card-files.`;
}

export const CARD_TOOL = Object.freeze({ type: 'function', function: {
    name: CARD_FILES,
    description: [
        'Work with the selected SillyTavern character card: open, save or refresh its workspace files, or set its cover image.',
        'Edit the opened files with Read, Write and apply_patch; ReadSkill builtin-card-files describes the file layout.',
        'open returns {root, avatar, name, files:[{path, name, kind, book?}], reused, warnings?:[{path,message}]}; each entry, regex or task occupies one named file. reused is true when an existing workspace copy was kept with its edits. warnings identify a design draft whose saved version also changed; the draft is retained and other files remain accessible.',
        'save returns {ok, results:[{path, fromPath?, saved, unchanged?, hasUnsavedEdits?, missingActivationConfig?, error?}]}. path is the current file path; fromPath identifies the previous path after a rename. unchanged marks a file already equal to the card. hasUnsavedEdits marks a newer edit or removal in the workspace; it remains intact.',
        'missingActivationConfig flags an enabled worldbook entry without constant, vector, keyword or a recognized @@activate decorator, including unchanged saves. Check its intended activation: external scripts can activate entries too. If ordinary worldbook triggering is intended, set keywords or constant in the document header settings and save.',
        'refresh replaces the named workspace files with the saved card content and returns {paths, refreshed:true}.',
        'setAvatar saves one workspace image as the selected card\'s cover and chat avatar. Returns {ok:true, avatar, name, sourcePath} after verifying the saved picture.',
        'previewRefreshFailed:true means the cover is saved but the page needs a refresh to display it.',
        'Use setAvatar when the user asks to apply a cover. Showing cover candidates leaves the card unchanged. For a newly drawn cover, open the target card before drawing and keep its avatar for the write.',
        'For “上一张” or “第二张”, use the workspace path and image order from the referenced result in this conversation. Ask which image when the reference is ambiguous.',
    ].join('\n'),
    parameters: { type: 'object', properties: {
        action: { type: 'string', enum: ['open', 'save', 'refresh', SET_CARD_AVATAR_ACTION] },
        paths: { type: 'array', items: { type: 'string' }, description: 'Exact local workspace file paths for save and refresh. Each save changes only the named files.' },
        avatar: { type: 'string', description: 'Target card identifier returned by open. Required for setAvatar; the card must still be selected.' },
        sourcePath: { type: 'string', description: 'Exact workspace image path (local/…). Required for setAvatar.' },
    }, required: ['action'], additionalProperties: false },
} });

export const CARD_ASSETS_TOOL = Object.freeze({ type: 'function', function: {
    name: CARD_ASSETS,
    description: [
        'Manage portable images for the current character card. Open its working copy with CardFiles first.',
        'list returns {ok,status,tasks:[{taskPath,name,runtime,assets}],errors:[{taskPath,error}]}. It checks all task files in the open root unless taskPath is provided. Malformed files appear in errors; status is partial when usable image tasks remain, failed when only errors remain, otherwise success.',
        'set copies a workspace image into the card draft, replacing the image at the same key. It creates a dedicated loader at a new taskPath. remove clears a key from its draft. Both return {ok,taskPath,runtime,asset?,unchanged,draft:true,requiresWriteback:true}; unchanged means the draft already matched the request. These are workspace-only receipts.',
        'read opens an existing key as an image for inspection and returns {ok,asset,runtime,images}. The images entries are workspace image references.',
        'An asset is {key,digest,mime,size}; size is in bytes. A runtime is {taskId,reference,readyEvent}; reference is a host-page JavaScript expression for the loader.',
        'CardFiles save of taskPath embeds the draft images in the card. The loader and images travel in the exported card.',
        'A damaged saved entry stays on the card while other keys are edited. Errors identify its task and position. Use set or remove for a unique key; for a missing or duplicate key, edit only the reported entry in the task document.',
    ].join('\n'),
    parameters: { type: 'object', properties: {
        action: { type: 'string', enum: ['list', 'set', 'remove', 'read'] },
        rootPath: { type: 'string', description: 'Root returned by CardFiles open.' },
        taskPath: { type: 'string', description: 'Dedicated image task path under tasks/ in that root. Required for set, remove and read; optional for list. For the first set, choose a new .md task path.' },
        key: { type: 'string', maxLength: 80, pattern: '^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$', description: 'Image key used by the card frontend. Required for set, remove and read.' },
        sourcePath: { type: 'string', description: 'Path to a workspace PNG, JPEG, WebP or GIF. Required for set.' },
    }, required: ['action', 'rootPath'], additionalProperties: false },
} });
