# Choosing state structures and starting situations

This reference complements the definition format. Use the card's actual names and mechanics rather than adopting an example's categories.

Choose what belongs in state using [How to design gameplay state](<../SKILL.md#how-to-design-gameplay-state>) before choosing its structure. For each field, name the later rule, choice or portrayal that uses its current value, and check whether it can be computed from other fields. Write that purpose into the field's `access[].description` in terms the models can act on. When the reason is "the panel shows it", check whether the panel can derive it instead. The [解铃会 card](<examples/jieling.md#why-each-variable-exists>) lists the reason for each of its fields and the values it deliberately derives.

## Stable addresses, people and inventory

Root names and paths are shared addresses for the updater, macros, rules and panels. Keep them stable while maintaining a card; renaming a definition field does not migrate an existing chat's values.

Choose an object keyed by a stable name or id when the model needs to find a person or item by identity. Choose an array when order or duplicate entries matter. JSON current-state macros contain array values, not annotated indices; a model that must edit an array needs to locate its current index. Removing an array element shifts later indices, including operations later in the same batch.

In JSON Schema, a dictionary's `additionalProperties` can be the schema for each member. Its containing object can start as `{}`. Fixed objects use `properties`, `required` and, when appropriate, `additionalProperties:false`; declaring `properties` alone does not require those fields. The [camp definition](<examples/camp/definition.json>) includes a dynamic `camp.people` dictionary and an ordered `camp.inventory` array.

Create a missing person's complete object before editing its children. `set` does not create missing parents; it replaces the value at its path, rather than merging omitted siblings. All required fields must exist by final validation. Ordinary initial data supplies its required fields and empty collections explicitly; schema defaults fill nothing. Derived/corrected values are produced by their declared rules before final validation.

The following batch works with the camp definition:

```json
[
  {"op":"set","path":["camp","people","Lv.3"],"value":{"present":true,"mood":0}},
  {"op":"inc","path":["camp","people","Lv.3","mood"],"delta":2},
  {"op":"set","path":["camp","inventory","0"],"value":"map"}
]
```

Every path segment is a string: `"0"` indexes an array, while `"00"` can be an object key. `"Lv.3"` above is one literal key, not two levels. Array writes can address an existing index or the current length to append; they do not create gaps. `remove` deletes the field or the indexed element, not an element found by its value.

Permissions follow literal subtree prefixes. Setting `direct:true` at `["camp","people"]` covers dynamically named descendants, subject to any more specific restrictions. `"*"` is a literal key here, not a wildcard. Replacing a parent is also checked for changes to protected children. The same literal-path rule applies to rule outputs and function read declarations; a calculation over dynamic members can read the collection and use a pure function.

For changing collections, the executable [member rules example](<examples/member-rules.ts>) shows three independent choices: a constraint compares retained members' identities with `before`; a correction function clamps each member's mood separately; a `max(current,before)` correction makes reputation rise only. New members are accepted with their complete schema. A static `direct:false` child path cannot protect the same property under every future member key.

Submission paths and macro paths have different notation. The member above is addressed by `{{xbgetvar::camp.people["Lv.3"].mood}}`; an array item uses `{{xbgetvar::camp.inventory[0]}}`. Whole-root `{{xbgetvar::camp}}` avoids reconstructing a path for every field. Verify the actual expansion after initialization, including keys with punctuation. Native `{{getvar::name}}` addresses a native variable by name, not a nested path.

## Limits, gradual changes and free text

Choose the consequence of an invalid value before choosing a constraint:

| Gameplay intention | Definition choice | Result |
| --- | --- | --- |
| Reject an invalid final number or finite choice | JSON Schema bounds/types/`enum`, or a cross-field `constraint` | The whole submission fails; chat values stay unchanged |
| Cap a valid change at a fixed or changing limit | A `correct` rule, such as `min(current, maximum)` | The corrected value and its source appear in the result |
| Calculate a value such as maximum health | A `derive` rule | Inputs change its dependencies; the rule computes the result |
| Keep a base price, travel duration or other value fixed | A `derive` rule with a `literal` value, as in the camp's maximum stamina | Actions and direct edits cannot change it; the literal is defined only in the rule, not repeated in `initial` |
| Limit how fast a relationship can change | Decide whether this is advice, a per-action limit or a per-batch rule, then express that choice | An absolute range alone does not limit one turn's change |

Use `enum` for genuinely finite choices such as a fixed quest stage or participation tier. Open-ended names such as locations and nicknames need free text: an unlisted value would reject the batch. Give such fields a naming convention in `access[].update` and let the panel display unfamiliar values, rather than silently substituting a known location. For hierarchical locations, a panel can locate recognized segments and display an unfamiliar trailing segment literally.

For gradual narrative values, explain the evidence and typical change size in `update`. If the gameplay needs an enforced limit, an action's parameter schema can bound one submitted amount, or a constraint/correction can compare a field with `before`. `before` means the start of this entire batch, not the value before each operation; multiple actions in one batch are not multiple turns. A correction must reach a stable result. `inc` adds no implicit step limit, and a direct assignment is not an increment. Test the chosen rule with both assignments and increments instead of assuming the same limit applies to both.

Sources: `definition/compile.ts`, `engine/data.ts`, `engine/input.ts`, `engine/settle.ts`, `engine/validation.ts` and `definition/example.ts`, relative to `modules/variables/state3/`.

<a id="alternate-openings"></a>
## Alternate greetings and initial state

Start by listing each greeting's location, equipment, resources, people and active objectives. Put their common starting values in `initial` in `variables/definition.json`; optional `openings` entries contain only each greeting's differences.

The list follows native greeting swipe order. With a filled main greeting, `openings[0]` pairs with `message/0.md` (the main greeting), `openings[1]` with `message/1.md` (the first alternate), and so on. If the main greeting is empty, SillyTavern omits it, so `openings[0]` pairs with the first greeting actually displayed. Keep these entries together with their greetings when reordering the card. Greeting text is the story, not the selector; the selected swipe's position chooses its values.

Fields inside objects inherit the common values unless that opening supplies a replacement. Arrays, scalar values and `null` replace the whole value at that field. An empty entry `{}`, an absent entry or no `openings` list uses `initial` unchanged. All openings use the same `schema`, permissions, actions, calculations, triggers and constraints. Their top-level roots must already exist in `initial`.

For example, this fragment belongs inside an existing definition, not a complete rule package:

```json
{
  "initial": {
    "hero": { "place": "营地", "coins": 30, "items": ["背包"] }
  },
  "openings": [
    {},
    { "hero": { "place": "港口", "coins": 80, "items": ["船票"] } }
  ]
}
```

The main greeting starts at the camp with 30 coins and a backpack; the first alternate starts at the port with 80 coins and a ticket. An opening that changes only `hero.place` retains the other `hero` fields. A different inventory supplies the complete list of items.

Use `checkDraft(draft, [], {opening: 1})` or `tryDefinition(bundle, [], {opening: 1})` to start a trial at the first alternate. Without `opening`, trials start at the main greeting. An explicit `state` is the trial's starting point; `opening` selects starting values only when `state` is omitted. `checkDraft(draft, [], {checkOnly: true})` checks the main start and every configured opening. Play a route from each intended start by passing each result's state to the next trial.

Opening values are initialized by 3.0; a panel reads the current state on mount. First enabling a card with `openings` requires a chat containing only its greeting. Revisiting a recorded opening restores its progress without repeating rewards. A progressed chat is not initialized again when reopened.

Acceptance: start each greeting directly in an isolated fresh chat, switch A → B → A before the first player turn, confirm the intended starting values and no duplicated reward, then play a turn and save/reopen. Check the panel and both models' actual request data, not just the greeting prose.

Sources: `definition/openings.ts`, `definition/compile.ts`, `runtime/service.ts`, `runtime/api.ts`, `runtime/host.ts` and `index.ts`, relative to `modules/variables/state3/`.
