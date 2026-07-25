# Shop domain skeleton

This directory owns the Tavern Shop domain. Implementation is intentionally absent until the approved construction plan is executed.

Planned files:

- `shop-types.ts` — catalog, inventory, activation, version and error contracts.
- `shop-catalog.ts` — the 14 reviewed static products and their exact prompt injections.
- `shop-service.ts` — reads plus atomic purchase, activate and deactivate commands.
- `shop-timeline.ts` — Shop-only timeline impact and in-transaction restore helpers.
- `shop-prompt.ts` — pure active-effect projection for roleplay and private-message prompts.

This layer may depend on Tavern sessions and Economy services. Economy, generic prompt assembly and other domains must not depend on Shop implementation details.

Specifications:

- [Target design](../../docs/shop-app-target-design.md)
- [Implementation plan](../../docs/shop-app-implementation-plan.md)
