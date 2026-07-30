# Pet domain

This directory owns the complete Tavern unknown-resident domain. There is one
global companion for the whole Tavern database. A Tavern session is only an
input source: it supplies a Phone boundary, a wallet, story messages,
contacts, and the anchor at which an interference may be projected.

`shared/pet` is the only layer allowed to interpret private companion state,
lifecycle rules, personas, event selection, chat memory, pending evolution, or
Pet journal history.

Persistent facts are limited to three global Dexie tables:

- `petCompanion` has exactly one row, `id: 'companion'`. It owns the current
  `revision`, `versionId`, and private state.
- `petActions` is the compact, global idempotency journal. An action records
  its committed revision and source session/turn/anchor; that provenance never
  makes the session an owner or a foreign-key dependency.
- `petJournal` stores user-observable events, chats, statuses, and milestones
  with their source session/anchor. A deleted source session leaves these
  historical labels intact.

The global Pet clock is `state.petTurn`. Every distinct consumed main-story
source (`pet:story:{sessionId}:{turn}`) advances it once, including dormant
turns; dormant turns deliberately do not advance active-phase growth, hunger,
or cooldown facts. `phaseTurnCount` remains the active-growth clock. Source
turn numbers from different sessions are never compared.

Implemented module ownership:

- `pet-types.ts` — private companion state, global action/journal records,
  public view, input/result, and error contracts.
- `pet-rules.ts` — pure lifecycle, interaction, mood, satiety, personality,
  and global-clock transitions.
- `pet-personas.ts`, `pet-events.ts`, `pet-copy.ts`, `pet-random.ts` — static
  reviewed catalogues, copy, and synchronous deterministic random boundary.
- `pet-invariants.ts` — canonical companion/action/journal validation. Replay
  artifact checks stay at the mutation boundary; no session version-chain or
  standalone Pet-history replay exists.
- `pet-view.ts` — deep, redacted projection from the global companion to a
  Controller-safe DTO.
- `pet-service.ts` — atomic player actions, chat commits, evolution resolution,
  the one-transaction public `snapshot` projection, and the explicit
  irreversible “let it leave” reset.
- `pet-story-turn.ts` — the only main-RP registration point. It deduplicates a
  source session turn and advances the global companion in the Assistant
  transaction.
- `pet-prompt.ts` — source-session/anchor-aware projection of one-turn
  interference events. It rechecks the source Assistant floor; `nibble-sleeve`
  also requires its frozen contact to remain present in the pre-floor story
  context. Missing, rolled-back, or no-longer-valid source context is fail-open
  and injects nothing.
- `pet-chat.ts` — isolated model messages, tolerant external parsing, and
  strict canonical chat/evolution validation.

The Phone controller receives only the deep-redacted public view. It receives a
current session only when it must pay, validate a Phone boundary, or request a
source-local prompt projection. Private axes, cooldowns, chat memory, pending
snapshots, and global action internals never cross into Vue or Phone context.

Economy remains session-owned. Paid actions and autonomous Pet money events use
the source session's wallet and commit atomically with the global companion
CAS/action/journal write. Session rollback can refund Economy, but it never
rewinds companion growth, satiety, state, actions, or journal entries. This is
intentional; the domain accepts limited replayable space instead of adding a
compensation system.

Pet is deliberately absent from accepted rollback, branch, session delete, and
character archive. Those lifecycle paths must not copy, restore, delete, count,
or validate global Pet data. There is no old table reader, archive migration,
or compatibility alias: DB v28 drops the old session-owned Pet tables and their
contents. A future global Pet import/export feature must be independent of
character archives.

Model/network calls always finish before a short Dexie commit transaction; no
request lifecycle is persisted in a separate table. Deleting the feature means
deleting this directory and the Phone Pet directories, removing the small
story/Phone/Prompt registrations, dropping the three global Pet tables, and
rebuilding the Tavern bundle. The reset user action instead clears only the
three Pet tables after a second confirmation and never refunds money.

Specifications:

- [Target design](../../docs/pet-app-target-design.md)
- [Content specification](../../docs/pet-app-content-spec.md)
- [Implementation plan](../../docs/pet-app-implementation-plan.md)
- [Engineering handoff](../../docs/pet-app-handoff.md)
