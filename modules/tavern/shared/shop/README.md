# Shop domain

This directory owns the Tavern Shop domain. It owns the current catalog, inventory, active effects, atomic Economy-backed commands and timeline restoration.

Responsibilities:

- `shop-types.ts` — catalog, inventory, activation, version and error contracts.
- `shop-catalog.ts` — the 14 reviewed static products and their exact narrative templates.
- `shop-service.ts` — reads plus atomic purchase, activate and deactivate commands.
- `shop-timeline.ts` — Shop-only timeline impact and in-transaction restore helpers.
- `shop-prompt.ts` — pure active-effect projection for roleplay and private-message prompts.

This layer may depend on Tavern sessions and Economy services. Economy, generic prompt assembly and other domains must not depend on Shop implementation details.

Specifications:

- [Target design](../../docs/shop-app-target-design.md)
