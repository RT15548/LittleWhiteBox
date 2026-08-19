# TauriTavern ChatSurface integration

This directory owns LittleWhiteBox's optional, community-maintained integration with TauriTavern ChatSurface v1.
The normal SillyTavern static renderer remains the primary runtime and is selected whenever the host API is absent or
does not request managed ownership.

## Boundary

- `environment.js` freezes host detection for the current page.
- `participant.js` owns protocol validation, the participant identity, and the supported-feature policy.
- `iframe-runtime.js` and `runtime-claims.js` translate ChatSurface claims to the generic leased iframe runtime.
- `message-decorators.js` and `decorator-lifecycle.js` compose lifecycle-safe message buttons and their disposers.
- `settings-ui.js` freezes settings that cannot change after ChatSurface takes ownership.

Feature modules do not know about TauriTavern. They expose generic mount/cleanup or runtime-configuration functions;
the extension entry point is the only composition root shared with this integration.

## Capability boundary

Managed ChatSurface currently supports the core iframe renderer, recorded-request history buttons, Variables Panel,
Story Summary buttons, and button collapsing. Immersive mode, message preview/purge, Story Outline floor tools, TTS
floor tools, Fourth Wall floor tools, draw providers, and custom template iframes are rejected before participant
registration.

The integration adds no persistent data. Removing it consists of deleting this directory, removing its manifest/entry
registration, and restoring the static-runtime defaults in `index.js`.
