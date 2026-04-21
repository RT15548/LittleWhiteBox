# Assistant Frontend Architecture

## Goal

This assistant frontend is intentionally split into three layers so `iframe` shell code, iframe app code, and feature UI code do not collapse back into one file.

## Current Layers

### 1. Host Shell

Files:

- `assistant.js`
- `assistant-host-window.js`

Responsibilities:

- `assistant-host-window.js` owns the draggable overlay window, iframe shell DOM, minimize/fullscreen/sidebar layout, and mobile/desktop host-window behavior
- `assistant.js` owns host-side message bridging, tool dispatch, manifest/runtime loading, persistence, and caches such as `localSourcesCache`

This layer should not render assistant app internals.

### 2. Iframe App Shell

Files:

- `assistant-overlay.html`
- `app-src/main.js`
- `app-src/app-shell.js`
- `app-src/app-chrome.js`
- `app-src/styles.js`

Responsibilities:

- boot the assistant iframe app
- own top-level app state and module wiring
- render the root app layout shell
- render shell-level chrome state outside feature message content
- inject global app styles
- coordinate feature managers and render scheduling

Notes:

- `assistant-overlay.html` is intentionally tiny. It is only the iframe entry shell that mounts `dist/assistant-app.js`.
- `app-shell.js` owns the top-level app markup.
- `app-chrome.js` owns shell-level UI refresh for toolbar, sidebar, compose chrome, and workspace chrome.
- `styles.js` owns global iframe-app styles.
- `main.js` should stay the orchestrator, not the long-term home for giant layout/style blocks.

### 3. Feature Modules

Files today include:

- `app-src/chat-ui.js`
- `app-src/settings-panel.js`
- `app-src/local-sources.js`
- `app-src/local-workspace-ui.js`
- `app-src/local-workspace-tree.js`
- `app-src/local-workspace-diff.js`
- `app-src/runtime.js`

Responsibilities:

- feature-specific UI rendering
- feature-specific state transitions
- pure helpers and derived views

## Dependency Direction

Preferred direction:

- `assistant.js` -> host window controller + messaging/tool/runtime/storage only
- `main.js` -> app shell orchestration only
- feature UI modules -> pure helpers
- state/data modules should not depend back on host shell code

Avoid:

- host shell importing feature UI internals
- feature modules directly owning iframe boot logic
- host window DOM/layout code drifting back into `assistant.js`
- `main.js` growing back into host shell + app shell + feature UI at once

## What Was Moved In This Pass

- top-level iframe app markup moved from `main.js` to `app-shell.js`
- global iframe app style injection moved from `main.js` to `styles.js`
- host overlay/iframe shell window creation and layout behavior moved from `assistant.js` to `assistant-host-window.js`

This is a shell-level cleanup only. Feature CSS is still co-located in the global style sheet for now to avoid a risky visual regression pass.

## Next Safe Steps

1. Keep `main.js` focused on app orchestration and event binding.
2. Move feature-specific render/update glue behind smaller feature entry points.
3. Split global styles by feature only after shell boundaries are stable.
4. Preserve the rule that `assistant-overlay.html` stays a thin entry shell rather than becoming a second app file.
