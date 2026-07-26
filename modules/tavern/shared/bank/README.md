# Bank domain

This directory is the ownership boundary for the Tavern Bank domain. It owns the current persistence model, pure game state machines, atomic Economy-backed mutations, structural history validation, accepted-history rollback and Controller-safe projections. Character archives and the Phone OS app consume these public contracts; they do not recreate Bank rules.

Responsibilities:

- `bank-types.ts` — private persistence, public view, activity, action, result and error contracts.
- `bank-products.ts` — the six reviewed static products and integer contract calculations.
- `bank-random.ts` — the injectable synchronous random source and deterministic draw helpers.
- `bank-invariants.ts` — shared canonical state and activity invariants.
- `bank-history.ts` — full version-chain replay across actions, private state, Economy debits and terminal Activities.
- `bank-view.ts` — deep, redacted projection from private Bank state to Controller-safe DTOs.
- `bank-service.ts` — lazy settlement and atomic Economy-backed commands.
- `bank-timeline.ts` — Bank-only impact and in-transaction restore helpers.
- `games/` — three independent pure state machines: Dice Bluff, Push Your Luck and Risk Ladder.

This layer may depend on Tavern sessions, Phone message boundaries and Economy services. Economy, generic prompt assembly, Shop, Tasks and Vue must not depend on Bank implementation details. Phone-specific presentation remains under `app-src/features/phone-os/apps/bank` and `app-src/components/phone-os/apps/bank`.

Persistent entities are limited to `bankStateVersions` and `bankActivities`. Bank has no Prompt registration and no model dependency.

Specifications:

- [Target design](../../docs/bank-app-target-design.md)
- [Implementation plan](../../docs/bank-app-implementation-plan.md)
