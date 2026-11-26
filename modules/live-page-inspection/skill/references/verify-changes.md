# Verify a frontend-card change

## Identify the source and the live target

InspectPage returns the live floor, frameId, documentId and rendered content. CardFiles open returns the current card's workspace paths. These identify different objects: editing a workspace file does not change saved card data, and saving card data does not replace an already-running iframe.

Read the relevant card files to find where that page comes from. Each regex or task is one .md document: its JSON header holds settings, and its body holds the replacement text or task commands. ReadSkill builtin-card-files describes the file layout. An existing chat message does not change just because the card's greeting file changed.

Use RunJavaScriptApi to read the current chat identity and the target message when needed. Keep that identity for the rebuild and verify that the same chat and message are still selected before operating. Use the floor reported by InspectPage, not an assumed last message. Saving a file through CardFiles is separate from editing existing chat text.

## Write back

Edit only the relevant workspace files, then call CardFiles save with their paths. Check each result: saved must be true; hasUnsavedEdits means the newest workspace text is not necessarily the saved version.

CardFiles refresh replaces workspace files with saved content. It does not reload a frontend card and can overwrite a local draft; it is for resolving saved-file conflicts, not for refreshing the page.

## Rebuild through the existing JavaScript tool

RunJavaScriptApi exposes these existing APIs:

- ctx.updateMessageBlock(messageId, message, {rerenderMessage: true}) re-renders that message using the current host formatting and regex settings. Pass the existing ctx.chat[messageId] unchanged.
- st.iframeRenderer.processMessageById(messageId, forceFinal = true) processes that floor's rendered HTML code blocks with the LittleWhiteBox renderer. Call it after updateMessageBlock. Under TauriTavern, updateMessageBlock already recreates the iframes and this call leaves them as they are.

Both calls concern the selected floor's display. They neither save chat text nor execute task scripts. They do recreate the page, so the page's own initialization scripts run again. Read those scripts first if reinitialization could send requests, change variables, or grant rewards; use an isolated chat or ask for authorization for those effects.

These two calls are the refresh path. MESSAGE_UPDATED, MESSAGE_EDITED and generation events have other listeners that settle variables or run scheduled tasks, and reloading the whole chat reruns every floor.

When JS execution is disabled, InspectPage still works. Explain that writeback has completed but live rebuilding is pending, and point to the assistant's JavaScript API permission setting rather than claiming that the repair is verified.

## Verify the replacement

After rebuilding, use InspectPage list to locate the replacement iframe on the same floor. Previous frameId and elementId values belong to the old page.

frameId is an InspectPage identifier; iframeId is the actual iframe element's id. For a JavaScript interaction, use the replacement's iframeId and verify its floor. A button label or element id can recur across old floors, so choosing the first matching iframe in the whole document can operate on the wrong page. If another renderer supplies no iframeId, locate within the reported floor and confirm the observed page content before interacting.

Use inspect/dom/styles to verify that the expected code and layout are now present; read errors for the new document. A successful API return is not a page load-completion signal. If the document is still loading, check it again before drawing a conclusion.

Host hit tests run with the current app panels open. The assistant window can cover a correctly working card; the covering element's ancestors and iframe src identify that surface. An internal card hit test and a host overlay are different evidence. The assistant covering the chat is not a reason to edit the card's layout or remove host elements.

For controls, inspect disabled/inert state, pointer-events and hit-test results, and read the handler source and errors. Harmless local UI interactions can be exercised through RunJavaScriptApi. Buying, spending, receiving rewards, sending, deleting and other state-changing operations are not harmless verification clicks; ask for authorization or test in isolated state.

Report separately what was saved, what is visibly working in the replacement page, and any interaction not exercised. If the user's visual intent remains unclear, suggest a screenshot with the affected area circled.
