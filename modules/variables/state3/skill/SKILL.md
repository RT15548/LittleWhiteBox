---
name: builtin-state3
description: Write variable 3.0 rules, model tools and stage scripts in the current card workspace; test, simulate and save the complete package to the card.
---

# Variable 3.0 rule authoring

## Why a card has variables

Prose models forget numbers, invent outcomes and let the player have whatever they ask for. Variables give a card the parts of a game that must hold: money that runs out, a room that needs three people, a deadline that arrives, a choice whose consequence lands three turns later. Use them when the player's decisions need consequences the story cannot quietly drop; a card without such decisions needs no variables.

Design in this order, and do not skip ahead to fields:

1. **The player's experience.** Who the player is, what they decide again and again, and why that decision is hard. A good decision trades one thing against another; a button that only adds a number is not a decision.
2. **The mechanics.** For each decision, its condition, its consequence and whether it can repeat. Include how the game can be lost or won, and where resources come from and go.
3. **The state.** Store a value only when a later rule or choice needs it and it cannot be computed from other values. For every stored field, be able to say why it exists in one sentence.
4. **Ownership and display.** Decide who makes each change — the player through a panel or typed action, the updater from the story, or a script — and what the player sees before and after deciding.

Explain these four steps to the author in plain terms before writing files. Start with the [雾港证物审理 card](<references/examples/wugang.md>) for ordinary chat: before actions, prose, then after observations, with a read-only panel. Use the [integrated 解铃会 card](<../../../card-workspace/skill/frontend/examples/jieling.md>) when the custom interface owns the player's operations. Each example is a complete project; choose by interaction ownership rather than mixing their files.

## What belongs to the card

The card defines the update stages, variable structure, initial values, write permissions, actions, derived values, corrections, constraints, triggers and model views. Current values live in SillyTavern's native chat variables, one top-level definition key per native variable. The original variable panel reads and edits these same values. All submitted changes are calculated together; current chat values change only if the whole submission succeeds. Preview and draft checks calculate results without changing the chat.

The variables mode (1.0, 2.0 or 3.0) is a player setting. A 3.0 definition runs while that setting is 3.0.

## Which files to edit

- `variables/definition.json` is the definition object. Its required fields and expression shapes are in [the current format](<../definition/format.ts>); a complete working equipment example is in [the starter definition](<../definition/example.ts>).
- `variables/functions/<name>.js` contains one JavaScript function expression. The matching `definition.functions[name]` contains `reads` and `description`. Names contain letters, digits, underscores or hyphens.
- `variables/tools/<name>.js` and `variables/scripts/{prepare,calculate,committed}.js` contain extension sources. Their declarations are in `definition.extensions`. Read [tools and stage scripts](<references/extensions.md>) when a card needs host data, model-selected tools, batch computation or post-settlement feedback.
- Worldbooks, greetings and display regex are ordinary CardFiles files. Use ReadSkill builtin-card-files for those file layouts and prompt organization.

CardFiles open returns the current card's local workspace root and preserves existing edits; `st.state3.openDraft()` returns the same root. Read the related files before changing them, and edit them with the local Read, Write and apply_patch tools.

Saving any variable file through CardFiles save writes the complete definition/functions/tools/scripts package. Removing an entry means removing its declaration and workspace file before saving the definition. CardFiles refresh of a variable file reloads the complete package, replacing those local edits.

Draft text can be incomplete. Subsequent updates, previews and descriptions use the rules saved on the card. Saving rules leaves current chat values unchanged and executes no action. Checking that rules work and confirming that they were saved are separate steps.

## How to design gameplay state

Gameplay comes before fields. For each mechanic, write out four things: the condition, its consequence, which state values change, and whether it can happen again. Fields follow from that list: a condition reads them, a consequence writes them, and a repeatable or one-time result needs its own record.

Also identify who submits each event: the independent updater, a player button, or a task. A button's completed action and a later narrative recap are one event, not two submissions. Put that ownership in the relevant `access[].update`; permissions alone do not distinguish a script from the model submitting the same action.

For example, "the first summit grants a relic" becomes: condition — the player reaches the summit; consequence — the relic is added; changes — inventory and a claimed flag; repeat — once, so the claimed flag is part of the condition.

Variables hold states, tiers and tags that later rules, choices or narration use: completion flags, counts, stages, deadlines, resources, relationship tiers and locations. Store an event's resulting state, such as a permission being granted, rather than its narration. The plot summary module records what happened.

Text fields default to names or short state labels. A field dedicated to describing what just happened is a story record, whether it holds one sentence or a paragraph, uses a string or an array, or replaces or appends its contents. Create such fields only when the user explicitly asks for them.

Each fact is stored once. A value that follows from other state, such as a status implied by current conditions, a location implied by the collection that holds a member, or a total over a list, is calculated rather than stored: a `derive` rule produces it, or the function that needs it computes it from the source. A second stored copy depends on every action remembering to update it; when one action misses it, structure checks and constraints still pass while the two fields disagree, and both models read the disagreement as fact.

For each resource, capacity and currency, list what adds to it and what removes it. One-way flows are easy to miss: a consumable with no way to obtain more, a slot that fills but never frees, money with nothing to spend it on. Players and the story will reach for the missing direction. Either provide an action for it, or state in the relevant description that the story cannot do it, so both models know the request has no settlement.

Read [state design and openings](<references/state-design.md>) when choosing dynamic people/inventory structures, paths, numeric limits, finite choices or alternate greetings. It explains the authoring decisions as well as the format; a valid schema alone does not settle those decisions.

## When should a result become known?

Decide with the author which outcomes must be known before the story is written and which changes require reading the completed story. The required `updates` array declares `before`, `after`, or both.

- `before`: the player's new message is resolved automatically before prose generation. A complete combat turn, check or exploration outcome can be settled first, so prose narrates its actual result.
- `after`: the model reads the completed AI reply. The player chooses automatic updates or the reply's update button.
- When both are enabled, every action and every `access` entry allowing `direct` declares `stages`. A single-stage card inherits that stage without repeating it on each entry. The available tools, writable fields and settlement permissions all follow this assignment. Ordinary calculations, corrections, constraints and triggers are one shared set, executed in both stages; they have no `stages` field.

Each executed stage makes at least one paid model request. Each round of custom tool calls adds another request, and a failed submission gets one correction request; [tools and stage scripts](<references/extensions.md#model-turns-and-testing>) gives the limits. Recommend a stage only when its job justifies that cost. A single health subtraction is usually an existing action effect, rule, panel operation or part of the other stage, not a reason to buy an extra model request. Explain this tradeoff to the author and review your own stage choices. Group a coherent gameplay decision into one update; extra fields or padding do not make a stage worthwhile. The equipment and camp examples use only `after`; their deterministic panel actions need no extra model stage.

Before results are written into the native variables and saved on the player's message before prose is assembled. Executed before actions retain their ids and complete parameters as used, including values produced by parameter conversions. Stop, prose failure, regeneration and reopening the chat reuse this saved result.

剧情规划 (the plot planner run before sending) previews do not settle; adopting the plan settles its final text and rebuilds the prose context. A failed action precondition can be narrated as failure; request, submission and execution errors stop prose and offer retry or explicit skip. Edited player text retains its previous result and offers recomputation, which replaces rather than adds to it. Undo retains an undone marker so regeneration does not silently apply it again.

The after updater receives the already settled before outcome with the current state. Give before and after distinct event ownership, including when an action is available in both. The result of a panel action is likewise an established fact, not a new event to submit again.

## How to express a rule

Definition format is `1`. JSON Schema describes structure; explicit conversions happen in action parameter conversions. Schema checks validate values as submitted: they insert no defaults, delete no unknown fields and coerce nothing.

Paths are string-segment arrays, such as `["hero", "health"]`. Each access entry has a `direct` boolean: `true` permits direct edits to that subtree, and `false` blocks them. Direct edits require a covering permission and obey restrictions on ancestors and descendants. Actions use their own declared effects, independently of this switch.

Rules have `kind: "derive"` or `kind: "correct"`, an output `path`, a `value` expression and a description. Expressions are `{literal}` constants, `{get}` for current state, `{before}` for the batch start, `{param}` for action parameters, `{op,args}` for the operators listed in the format, or `{call,args}` for a declared function. `{prepared}` is allowed only inside actions; see [tools and stage scripts](<references/extensions.md#preparation-and-calculation>). A correction must be stable after settlement; cycles and overlapping rule outputs are rejected.

An action declares its parameter schema, parameter conversions, condition (`requires`) and changes (`effects`). Every effect reads the values from before that action. Actions run in submitted order, with associated calculations between actions. Derived outputs are protected from both actions and direct edits. The final values must pass the structure checks and constraints before they replace the chat's current values.

Use `triggers` for state-dependent consequences such as a first reward, a threshold event or an unlocked stage. Each trigger has `id`, `description`, `when`, `effects`, and optional `timing`. The default `batch` observes the completed batch; `action` observes each action after associated calculations. Conditions are evaluated in definition order. A trigger fires only when `when` evaluates to exactly `true`; action `requires` has the same rule, so a truthy number or string does not pass. All effects of one trigger read the state before that trigger, and associated calculations rerun after each trigger that changed state. The same trigger can run again until stable. Put one-time claim flags in ordinary state and change them with the reward. A cycle or an unbounded chain rejects the whole batch and reports the involved rules.

Ordinary input is an array of `{op:"set",path,value}`, `{op:"remove",path}`, `{op:"inc",path,delta}` or `{action,params}` objects. Group related changes into one array. If any part fails, the chat stays unchanged.

`inc` adds a signed numeric `delta` to the current number when that item executes, including earlier edits in the batch. The field, delta and result must be finite numbers. Initialize counters in `initial`; create missing fields with an allowed set or action before incrementing. Direct-write permissions and derived protection apply. The final schema determines integer/range requirements.

For example, a separate sale already completed outside a card action can submit `{ "op": "inc", "path": ["hero", "coins"], "delta": 5, "reason": "Sold an item elsewhere." }`. When this card's `sell` action already grants those coins, submit that action instead of also submitting its income. A reward trigger supplies its own reward after its condition becomes true. A separate event may still justify another increment to the same field.

Recommend `reason` for numeric changes or changes requiring judgement: one short sentence citing the supporting passage event. Straightforward factual updates need no restatement. Use `old` only when an explicit comparison with the prior value helps explain a change, rather than copying entire objects or arrays. These optional annotations explain the latest live result; they do not execute, validate the previous value, or enter saved history. Changes are grouped by source; explanations appear once, and added or removed structures can be expanded to inspect their fields. For a routine equipment removal, `{ "action": "unequip", "params": {} }` is sufficient.

## Names and explanations players see

Every action has a required `title`: the short name players see in results and failure messages, such as “购买” or “休息”. Its `id` is the name submitted by code and the update model. Its `description` explains the complete action. Action titles are used by the interface, not added to the update model's action list. Card panels supply their own controls; the plugin settings do not contain an action form.

JSON Schema `title` gives a field or parameter a readable name. Use it where a name helps players understand a failure; it is optional, and an unnamed field displays its path. A parameter's `description` explains its range, format and a useful example. When making a panel form, show these facts beside its inputs.

Failed conditions show the relevant comparison and actual values. A condition inside a custom function can only show the function name and description, so describe what that function checks. Use short, familiar player-facing names and explain failures with the affected value and what is needed. On the 「制作规则」 page, authors describe gameplay through “助手制卡”; you construct trial inputs and run the tests. “检查规则” shows either opening variables or specific errors without changing the chat. “存入角色卡” saves the package. “编辑规则源码” contains manual editing and “保存草稿”; “规则包分享” contains “导入规则包到此卡” and “导出卡上规则包”.

## What the two models receive

The ordinary RP model writes the story. Worldbook macros supply state and its meaning:

- `{{xbgetvar::path}}` expands to the current value at that path. A scalar expands as is, such as `{{xbgetvar::hero.health}}` inside a sentence; an object or array expands as compact JSON, so `{{xbgetvar::hero}}` shows the whole subtree with its current values.
- `{{xbvardesc::view}}` expands to that view's meanings: the card name, the section descriptions, the selected fields, the descriptions of rules, actions, triggers and constraints that read or change those fields, and the descriptions of enabled stage scripts. It contains no current values. `{{xbvardesc}}` supplies all views; view names come from this card's `views`.

The RP model needs both: the values tell it what is true now, and the descriptions tell it what those values mean and how they change. A card whose story depends on inventory, people, time or progress shows those roots with `xbgetvar`. For the equipment starter, one character-after constant entry is:

```
The hero's current state, root path hero:
<hero>
{{xbgetvar::hero}}
</hero>

What these fields mean:
{{xbvardesc::character}}
```

Use worldbook conditions and activation to select further subpaths and groups when one constant entry would carry state the scene does not use.

Before results reach the RP model automatically when an action was executed, a value changed, or an action was rejected for an unmet precondition. An executed action still reaches prose when it changes no values. A successful before result with neither actions nor changes adds no reference block; skipped and undone results add none either.

This reference describes only the already resolved part of the latest player message; the rest remains for prose to develop. An unchanged before result says nothing about changes arising later in the reply. The RP model and the after updater read the same recorded outcome, including executed action parameters and rejection reasons. Raw JSON, field paths and outcome labels are reference data, not story text.

Local execution-environment failures retry the same submission once without another model request. If still failing, “重试结算” reuses it while its message, state and rules remain current. Script errors stop the update and need code repair, rather than another model submission.

The independent update model receives SillyTavern's assembled context, including activated worldbook entries, with the target passage marked, plus the starting state, structure and the definition facts listed below. It submits one batch.

Put each instruction where its reader needs it:

- `access[].description` and rule, action, trigger and constraint descriptions: how the world works, read by both models. Write them as facts of the world, such as "Wearing the amulet raises maximum health by 40." or "A healing spell restores 10 health."
- View descriptions: read only by the RP model through `xbvardesc`.
- `access[].update`: when the passage calls for a change and which field or action to submit, read only by the update model, and only in a stage where that field is directly writable or changed by an action. For example, "Submit heal when the passage casts a healing spell."
- The update model receives the card name, writable fields, each action's id, description and parameters for the current stage, each rule's id, kind, output path and description, each trigger's id, description and timing, each constraint's description, each function's id and description, and enabled stage scripts' descriptions. Its field-to-action list is generated from the actions' effect paths for the current stage. Expressions, requirements, effects and tests stay with the engine, so any judgement a model needs belongs in a description.
- Worldbook prose: story context for both models.

Descriptions are where both models learn how the world works. Every consequence a player can notice belongs in a description, including one calculated inside a function, such as deterioration, a cost or a stoppage. A consequence that exists only in code still happens, and the RP model can narrate the opposite.

Mechanics and their numbers reach the RP model through `xbvardesc`; card fields and worldbook prose carry setting, characters and tone. A rate, threshold or cost restated in prose is a second copy that keeps its old value when the rule is edited, after which the RP model reads two versions.

The RP model narrates with the same rules the settlement applies, while submission instructions stay out of its context, so it does not narrate them as story tasks. Saving or importing rules cancels any running model update and refreshes the description macros of an enabled chat. Macros expand before the host applies its worldbook budget; after enabling an isolated chat, `previewRequest` returns the exact update request (see [How to save and enable](#how-to-save-and-enable)). A story behaviour that changes managed state needs a corresponding allowed field or action before the card can offer it to players.

The current-chat settings show the card's declared stages. Before updates run automatically; after updates use the reply's button or the player's automatic-update choice. Custom interfaces can submit through the state API without a model stage.

## How a card panel follows current state

For a panel that displays current values, follow the card-files reference on [reading and refreshing variables](<../../../card-workspace/skill/references/xiaobaix-capabilities.md#state-panel-refresh>). The native variable names are the top-level keys of this card's `initial`; the equipment starter uses `hero`. A panel reads these values for display; initialization and player actions use their separate state APIs.

For a complete ordinary-chat route, read [雾港证物审理](<references/examples/wugang.md>): the updater submits before actions and after direct fields; its panel only displays state. For buttons and tasks, read [card-side settlement](<references/card-side.md>): the `window.LWB_StateV3` / `window.parent.LWB_StateV3` entry points, target reply, asynchronous results, save-only retry and one-time feedback. The [camp panel](<references/examples/camp/panel.html.txt>) and its [definition](<references/examples/camp/definition.json>) isolate that API journey; the [weekly 解铃会 mechanics tutorial](<references/examples/jieling.md>) adds derived rooms, prepared dice and a once-only reward. These mechanism examples are separate from the [integrated frontend card](<../../../card-workspace/skill/frontend/examples/jieling.md>). Sending ordinary player text follows the shared [message-button guidance](<../../../card-workspace/skill/references/xiaobaix-capabilities.md#message-buttons>). Reading any example installs nothing.

## From a design to a playable card

1. Read the current card files and ask only for missing gameplay choices. Describe what players see and list each mechanic as condition, consequence, changed state and repeatability.
2. Make the definition: structure and initial state, direct fields for story judgements, actions for calculated consequences, rules for derived/corrected values and triggers, constraints for whole-state checks.
3. Connect the RP views through worldbook macros, using the card-files skill for worldbook layout, activation and ordering. A 3.0 definition initializes its own state; a loop task is only needed for actual host automation or a persistent custom UI. Match each greeting to its starting values with [the opening workflow](<references/state-design.md#alternate-openings>).
4. Trial each mechanic with `checkDraft`: success, rejection, boundary values, repeated rewards and changed prerequisites. Inspect every changed field and its explanation. Verify failed batches leave the starting state unchanged. Repair the same draft and rerun the failing input.
5. Play routes from the initial state through consecutive `checkDraft` calls, passing each result's state to the next. Verify the intended goals and recovery paths are reachable; isolated hand-set test states cannot establish that.
6. Save the complete rule package and changed worldbook files; inspect each save result. In an authorized isolated chat, inspect `previewRequest` for actual state, descriptions and tool declarations. Play a key turn using the [story-to-state checks](#check-the-story-to-state-handoff) below.
7. Test the actual panel's submission/refresh journey and each alternate opening. Save/reopen and undo/swipe must restore state without repeating gameplay or host effects.
8. With before/after enabled, verify each stage's actions and direct fields by passing `stage` to the trials, regenerate and reopen to check reuse of the recorded before outcome, and edit/recompute to check replacement. After bookkeeping must not repeat events already settled before prose.

### Check the story-to-state handoff

For each managed fact affected by this work, trace what the RP model receives → what can happen in this passage → what evidence permits the updater to submit a change in its stage → what the engine actually settles → what the next RP request presents as current fact. Compare the relevant greeting, worldbook instructions, output format and variable definition along this route.

- **Timing:** If a person enters state only after their first appearance in prose, the output format must allow that appearance while their state entry is still absent. Check that introductions and their recording can occur in the declared order.
- **Meaning:** Identify the evidence that moves a proposal into an accepted agreement, an intention into a completed action, or an attempt into a successful outcome. Collection names, field descriptions, opening values and update instructions must use the same distinction; record only the transition supported by this passage or an already settled result.
- **Knowledge:** For required information that the passage leaves unknown, define a representation allowed by the schema and consistent with the field's meaning. Initial values need an author-defined basis. Keep the author's known setting facts distinct from what each character has learned, following the [card's knowledge scope](<../../../card-workspace/skill/references/prompt-organization.md#give-rules-and-knowledge-an-explicit-scope>).
- **Rule coverage:** Identify which conditions the definition enforces and which judgements depend on the updater reading the passage correctly. Compare the submitted evidence with the actual state difference; a structurally valid submission can still record the wrong story fact.

Review these relationships in the card text before live trials. During the isolated turn, inspect the actual model inputs, reply, submission and settled state, then the next RP request. For a transition the card uses, compare the passage that establishes it with one that leaves it pending or unknown; after correcting a mismatch, repeat the affected route. Keep text review, rule trials and observed model behaviour distinct in the report.

## When a custom function is useful

Use a function when the expression format does not express the calculation clearly. It receives `(input, {get, before})`; `input` is the evaluated `args` array. Return a synchronous JSON value for the calling expression.

Declare every state-read subtree in `reads`. `get(path)` and `before(path)` authorize that path and descendants, not undeclared ancestors. Both use the same declarations. Returned objects are copies. Missing fields read as undefined; returning undefined is not a JSON result.

Functions run in an isolated engine with their arguments and declared reads, returning synchronous JSON. Host access and randomness belong in prepare; action expressions pass those prepared facts as function arguments. Record facts needed by regenerated prose in action parameters or game state. Execution work and memory are bounded; browser scheduling delays do not consume work limits.

For a function named `health_bonus`, declare `reads: [["hero", "baseHealth"]]` and a description, then write this expression into its function file. It adds an explicitly supplied bonus to the declared base health:

```javascript
(input, {get}) => get(['hero', 'baseHealth']) + input[0]
```

## How to check the actual draft

RunJavaScriptApi exposes these methods as `st.state3.<name>`. Existing JavaScript API permissions apply.

- Reads: `checkDraft`, `tryDefinition`, `inspect`, `preview`, `previewRequest`, `exportRules`, `prepareRuleImport`, `settings`.
- Effects: `openDraft` (opens the card workspace), `saveCardDraft`, `importRules`, `enable`, `apply`, `undo`, `retrySave`, `saveSettings`, `testExtension` (single-entry execution).

After editing local files, open a fresh draft snapshot and check it. `openDraft()` returns `{root,avatar,name,paths,reused,files}`; `files` contains the path/content pairs under `variables/`. `checkDraft(draft,input=[],{state,opening,stage,prepared,checkOnly})` settles the draft's bundle from `state`, or from the selected opening's initialized values when `state` is omitted. It changes no chat values, executes no host code and saves nothing.

- `opening` selects the zero-based greeting position for a trial without explicit `state`; see [opening values and trials](<references/state-design.md#alternate-openings>).
- `stage: 'before' | 'after'` applies that stage's actions and direct-write permissions. Without it, every action and every `direct: true` field is accepted, so per-stage checks pass `stage`.
- `prepared` supplies simulated preparation. When an action reads `prepared` and the trial passes none, it fails with `prepared-missing`.
- `checkOnly: true` compiles the draft and checks the common start and all configured openings without input; “检查规则” uses this mode.

A successful result contains `ok:true`, `state`, `changes`, `provenance`, `actions` and `diagnostics`. Each change contains `path`, `before`, `after` and `removed`; a missing value is omitted. Array element paths include their indices; added and removed elements are separate changes. Objects recurse to changed fields. Each `provenance` entry is a change plus `source: {kind, id, title?, description?}` naming what caused it. Source titles and descriptions belong to this live result, not saved history. A failed result contains `ok:false` and `diagnostics` identifying the operation, path or rule; a failed batch also lists `items`, each input with status `passed`, `rejected` or `unchecked`. Results that ran a stage script or tool include `extensions.calls`. Return the trial result directly when inspecting it, or select these documented fields.

For the equipment starter, this trials unequipping the amulet from the current chat's real state with the edited draft rules:

```js
const draft = await st.state3.openDraft();
const current = await st.state3.inspect();
return await st.state3.checkDraft(draft, [{action:'unequip',params:{}}], {state: current.state});
```

`inspect()` reads the current chat's saved state, rule version and bundle, or returns `ok:false` with `not-enabled` diagnostics before the chat is enabled. `tryDefinition(bundle,input=[],{state,opening,stage,prepared})` settles any explicit `{definition,functions,tools?,scripts?}` bundle, such as one returned by `exportRules()`. It shares `state`, `opening`, `stage` and `prepared` with `checkDraft`; `checkOnly` is supported only by `checkDraft`.

For a current chat already using saved rules, preview uses that chat's real rules and history without changing chat values:

```js
return await st.state3.preview([{action:'unequip',params:{}}]);
```

## How to save and enable

Save the definition path with CardFiles save; its functions, tools and stage scripts are included automatically. `saveCardDraft(draft)` saves the same files after checking that the selected card matches the draft. Both validate the complete rule package before writing the workspace's current variable files, including edits made after the draft snapshot, and return `{ok, results:[{path, saved, unchanged?, hasUnsavedEdits?, error?}]}`. Invalid rules stay in the workspace; the saved card is unchanged. Inspect every result.

`enable()` fills missing native roots from the saved card's starting values and settles them with that definition; cards with per-greeting values follow [the opening workflow](<references/state-design.md#alternate-openings>). The managed roots are the top-level keys of `initial` at that moment, with all their descendants; a later settlement that would create another top-level key fails with `unowned-root`, and enabling an already enabled chat fails with `already-enabled`. A successful `enable()` also sets the player's variables mode to 3.0, and a card with extensions first asks the player to allow them. Get the user's agreement before initializing or changing their active chat or mode. A new non-group chat started in 3.0 mode with a card that has saved rules is enabled automatically.

`exportRules()` returns the saved card's complete `{definition,functions,tools?,scripts?}` bundle. `prepareRuleImport(text)` parses the JSON file text, checks the complete rule package and returns `{bundle,avatar,previous}` for the selected card. With the user's approval, `importRules(prepared)` replaces that card's whole bundle, including removal of absent sources, and returns `{ok:true}` after read-back confirmation. If the selected card or its rules changed during confirmation, prepare the import again. Import changes only the card's rule bundle: chat values, history, other card fields and workspace drafts stay as they are. Existing drafts keep their conflict baseline; CardFiles refresh loads the replacement bundle when the author chooses to discard those edits.

The [card-side API reference](<references/card-side.md#submission>) explains the `apply` / `preview` options and commit/save result handling. `undo({index})` removes the last gameplay settlement at that reply; `undo({index,all:true})` removes that reply's gameplay settlements when repairing stale text-derived results. Undo, replacement and recomputation preserve the selected opening's starting values.

Tail deletion and swipe selection restore the selected opening's starting values and the recorded progress for that position without running actions, corrections or triggers; later confirmed fields stay with the parent structure they require. Switching an earlier reply while keeping later settlements also checks the restored state's schema and constraints. Conflicts are shown with the author's rule and current field values; the selection and restored values remain in place. A subsequent update is accepted when its resulting state satisfies the rules. Editing, hiding, moving and middle deletion leave variables as they are. Copied replies carry prose, not executed settlements. When a changed passage needs a different result, the player updates it again; re-updating the current reply follows the same gameplay rollback and replacement described above.

`settings()` reads updater choices, defaulting to `{auto:false, source:'main'}`. `saveSettings({auto,source})` requires both fields. `auto` controls after updates only; sources are `main`, `delegate`. These are player preferences, separate from the card definition. `previewRequest()` and `previewRequest({stage:'after'})` preview the latest AI reply's update request; `previewRequest({stage:'before'})` previews the latest player message. Both fail with `target-missing` when that message is missing or empty.

## What to report

Report what rules changed, what you submitted in each trial, the actual results, and whether saving succeeded. Passing a draft check does not change the chat; saving rules does not start a chat. Keep failed trial diagnostics visible while repairing the draft, and leave unrelated card files and chat data unchanged.
