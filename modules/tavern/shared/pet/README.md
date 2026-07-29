# Pet domain

This directory owns the complete Tavern unknown-resident domain. It is the only
layer allowed to interpret private Pet state, lifecycle rules, personas, event
selection, chat memory, pending evolution or Pet history.

Implemented modules:

- `pet-types.ts` — private persistence, public view, activity, action, result and error contracts.
- `pet-rules.ts` — pure lifecycle, interaction, mood, satiety and personality transitions.
- `pet-personas.ts` — the nine reviewed static persona cards and face whitelists.
- `pet-events.ts` — the complete 30-event catalog, conditions and structured effects.
- `pet-copy.ts` — frozen user-facing event, first-person memory, milestone and fallback-verdict copy.
- `pet-random.ts` — the injectable synchronous random boundary and deterministic draw helpers.
- `pet-invariants.ts` — canonical state, version and activity invariants.
- `pet-history.ts` — full version-chain replay and Activity/Economy causal validation.
- `pet-view.ts` — deep, redacted projection from private state to Controller-safe DTOs.
- `pet-service.ts` — atomic player actions, chat commits and evolution resolution.
- `pet-story-turn.ts` — the single registration point for atomic main-RP turn advancement.
- `pet-timeline.ts` — Pet-only impact and in-transaction restore helpers.
- `pet-prompt.ts` — floor-aware projection of one-turn interference events.
- `pet-chat.ts` — isolated model messages, tolerant external chat parsing and strict canonical/evolution validation.

Persistent facts are limited to two session-owned Dexie tables:

- `petStateVersions` is the canonical, append-only private state history. Exactly
  one row per discovered session is marked current.
- `petActivities` stores user-observable traces causally linked to actions and,
  where applicable, Economy transactions.

The Phone controller receives only the deep-redacted Public View from
`pet-view.ts`; private axes, cooldowns, chat memory and pending snapshots never
cross into Vue or the Phone context. Story turns enter through
`pet-story-turn.ts`, while player actions and parsed model results enter through
`pet-service.ts`. Both reuse the same canonical/history checks and Economy
transaction helpers.

The private chat snapshot projects the latest five non-chat Activities through
the reviewed first-person memory catalog. Persisted names, summaries and both
sides of chat history are escaped before entering the tagged system message;
static cognition wording is protected by tests, never by a runtime assertion
that could reject a player's chat.

This layer may depend on Tavern sessions/messages and public Economy primitives.
It must not mutate Shop, Bank, Tasks or structured world state. Curios belong to
Pet and have no Shop inventory or main Prompt effect. Model/network calls always
finish before a short Dexie commit transaction; no request lifecycle is
persisted in a separate table.

Runtime registration is intentionally small: the main story-turn wrapper, the
Phone app registry/domain sync, accepted rollback, session branch/delete and
character archive v8. Removing the feature means deleting this directory and
the Phone Pet directories, removing those registrations, dropping the two Pet
tables/archive fields and rebuilding the Tavern bundle; there is no legacy Pet
reader or compatibility branch.

Specifications:

- [Target design](../../docs/pet-app-target-design.md)
- [Content specification](../../docs/pet-app-content-spec.md)
- [Implementation plan](../../docs/pet-app-implementation-plan.md)
- [Engineering handoff](../../docs/pet-app-handoff.md)
