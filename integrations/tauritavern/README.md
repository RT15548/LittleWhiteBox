# TauriTavern integration

## Compatibility and ownership

This optional integration targets **official TauriTavern v2.3.0 stable** and its
[ChatSurface v1 contract](https://github.com/Darkatse/TauriTavern/blob/v2.3.0/docs/API/ChatSurface.md).
Later TT releases are not validation targets. The host marker and managed-ownership
decision are read once by `environment.js`; a TT session without virtualization
is distinct from ordinary SillyTavern.

Feature business logic, prompts, panels and storage remain in their original
feature modules. This directory owns only TT host differences. It adds no
dependencies, persistent settings, caches or database schema.

## Structure

- `index.js`: the only entry imported by the extension; configures existing
  feature APIs and assembles activation. The extension retains its existing
  static-renderer lifecycle guards, using the ownership decision from this entry.
- `environment.js`: the sole host snapshot for the current page.
- `feature-policy.js`: the sole declaration of managed feature admission and
  setting mutability. These are separate facts: a feature may run at startup
  while its settings must remain frozen.
- `registration.js`: checks admission before passing hooks to the host protocol.
- `chat-surface/`: protocol validation and synchronous mount/dispose mechanics.
  No feature blacklist, summary logic or feature-module imports belong here.
- `message-decorators.js`: assembles message toolbar features and their cleanup.
  Settings changes reconcile resident controls; unmount releases their resources.
  Features that already expose suitable host-neutral mounts (including TTS and
  story outline) need no empty adapter directory. TTS content uses a content lease;
  its independent playback queue is not a message-DOM resource.
- `features/iframe-renderer/`: translates host claims to the existing leased
  iframe renderer, applying the existing rendering switch and recent-floor limit.
- `features/story-summary/`: summary-specific runtime options, save differences,
  and toggle-aware resident message buttons.
- `features/draw/`: resident drawing controls and content-lease image restoration.
  Provider requests and image persistence stay in Draw; no Node server-plugin
  transport is emulated by this integration.
- `settings-ui.js`: applies the locks derived from the feature policy.
- `diagnostics.js`: diagnostic copy and stable error codes; tests use codes and
  feature IDs rather than human-readable error messages.
- `tests/`: admission, ownership, resource lifetime and summary save contracts.

The policy is the source of truth for current admission; do not duplicate a feature
support table here or a lock/rejection list elsewhere. A local test deployment
may deliberately carry a different feature policy. Admission opens the feature's
frontend, not a claim that its provider/backend has passed native TT verification.

## Adding or removing an adaptation

1. Establish a concrete difference in the supported TT host; do not create
   adapters for hypothetical versions.
2. Put feature-specific behavior under `features/<feature>/`. Reuse the feature's
   host-neutral API rather than copying its domain model, storage or UI.
3. Wire it through this directory's composition entry/message decorators and
   update that feature's single policy record. Do not expose internal adapter
   imports to the extension entry or add TT detection to feature modules.
4. Use `chat-surface/` only for shared host mechanics. State tied to a mounted
   floor must be released with that floor; remounting is not a chat mutation.
5. Add only behavior tests for a real compatibility/lifetime failure. State the
   supported host and removal condition alongside each workaround.

Removing a feature adaptation removes its feature directory, composition entry,
policy record and associated tests. Removing TT support removes this directory,
the extension's TT imports/activation hook and ownership guards, restoring the
existing static defaults. No user-data migration or cleanup is required because
the integration owns no persistent data. Do not leave old-path re-export shims.

## Validation

```sh
npm test
npm run check
npm run build
```

Moving files requires rebuilding the assistant file manifest. The TT portable
copy lacks on-disk host source files: the filesystem-only import checker cannot
validate those packaged host URLs there. Run full import checking in the
SillyTavern source checkout instead.

Node tests do not replace native TT UI or disk-persistence verification. Native
checks must distinguish virtualization on/off and preserve the user's data.
