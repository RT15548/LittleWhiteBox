# Task domain

Task owns the generated board, accepted/published task versions, escrow settlement, rollback and archive facts. The generation Prompt lives under `app-src/features/phone-os/apps/tasks`; it proposes data, while this directory validates and persists the canonical result.

## Generated board contract

Each refresh asks for one task in each direction, in this order: 禁忌、接触、夹缝、窥秘、掠夺、怪癖. Direction determines the coin range. `grade` is derived from the chosen coin amount and never raises it.

Every generated listing also carries an intervention posture:

- 易介入: no separate time jump, travel sequence or scene rebuild; target quota 3.
- 中介入: one natural transition; target quota 2.
- 深介入: a deliberate new time, place, person or atmosphere; target quota 1.

The quota guides generation quality. It does not change `reward` and is not a settlement rule. A mismatch only emits a warning. Each malformed listing is discarded independently; one valid listing is enough to replace the board, while zero valid listings leave the previous board untouched.

`timing` is a world fact: `现在就行`, `任意时候`, or `特定时机：...`. An easy-intervention listing cannot require a special time. `location` has one meaning: the place where the objective actually begins, not a contact or publisher location. Text fields must be actual JSON strings and `reward` an actual JSON number. They remain short canonical facts at the parser boundary; `hook` is the only field allowed narrative flavor.

Generated listings have no publisher. The board Prompt does not request one, the parser discards any extra publisher-shaped field, and neither the UI nor main RP exposes an internal funding identity.

## Accepted tasks

Accepting a current generated listing copies its complete world information into the task version. The Task service creates an anonymous, task-scoped funding party only for escrow accounting; it is not a character and never enters task generation, presentation or RP context. The main RP receives the listing's world facts, including `timing`, but never receives `posture`: intervention cost is Task UI metadata, not something characters know.

Player-published tasks do not acquire a generated posture or timing. Older formal-line boards and task versions may also lack them; current generated responses must contain both.
