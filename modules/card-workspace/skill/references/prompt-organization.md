# How a card becomes a prompt

Use this reference when creating a card, splitting a lorebook, or changing its activation and placement. Host behavior is verified against SillyTavern 1.18.0 source; the content-organization advice supplies design choices, not host requirements. LittleWhiteBox-specific state and UI belong to the linked references below.

## Start from the player's first exchange

Read the existing greeting, character fields, linked lorebooks and relevant preset settings. Identify what the player sees first, what they can do, and which facts the model needs to respond correctly. Then assign each piece of information a home and an inclusion rule.

For each proposed entry, decide: what does this add, when is it needed, what does it depend on, and where should it be read? This is a drafting aid, not another form the user must complete.

## Organize the content before choosing files

Use this five-layer structure as the default content map. The Chinese terms below are the author's concepts; preserve their distinction when planning and discussing a card.

| 内容层 | 归属 |
| --- | --- |
| 世界规则 | 物理、生理、地理、超自然；不以任何人意志转移。 |
| 系统规则 | 法律、组织、经济、文化、习俗、禁忌；能改，但个人撼不动。 |
| 人物 | 事实、来路、策略（怎么做、换来、代价、失灵）、账本、暗面（已发生、梯度、底线、漏洞、说辞、痕迹）、如果……就……、亲密。 |
| 文风 / 注意事项 / 输出格式 | 怎样叙述、需要遵守什么、回复怎样组织。 |
| 开场时点 / 开场白 | 故事从哪个状态开始，玩家最先看到什么。 |

The first two layers separate impersonal world constraints from social systems; “系统规则” here means the latter, not an API system message or plugin settings. Character material describes how a particular person lives and acts within those conditions. Writing instructions govern the telling, while the opening selects the initial situation.

These are content categories, not five mandatory entries or a checklist of fields to fill. Develop the character dimensions relevant to this card; keep absent material absent. Place shared facts in their owning layer and describe a person's response without copying the shared rule into their profile. After assigning content, choose its file, activation and insertion settings using the sections below. An existing card can retain its working file layout while using these distinctions to resolve misplaced or conflicting content.

## Choose a home for each kind of information

| Information | Suitable home | Reason |
| --- | --- | --- |
| The main character's identity, stable traits and relationships | Character description/personality, or a compact always-on lore entry | These are baseline facts, not something the player should have to summon with a keyword |
| The starting situation | Scenario plus the greeting's actual scene | Scenario supplies context; the selected greeting starts the chat history |
| Setting rules needed to understand most scenes | A compact always-on world foundation | Local details can rely on this foundation being present |
| A location, supporting character or organization needed only when relevant | A keyword-triggered entry | Its full detail need not consume context in unrelated scenes |
| Current location, inventory, relationship stage | Current state, projected into the prompt | A static paragraph saying “currently” becomes stale; use LittleWhiteBox variables (ReadSkill builtin-state3, or builtin-state2 for simple counters) |
| Required output structure and illustrative dialogue | A concise format rule and `mes_example`, with a greeting consistent with that format | A rule states what must be produced; examples demonstrate it |
| Instructions for the player to install or enable something | Creator notes or accompanying instructions | Player instructions and model-facing setting facts serve different readers |

Choose one source for each fact. For instance, keep the current location in state and render it where needed; do not separately maintain a static “current location” in the character description. Split information when its activation or placement differs, not simply because it has a different heading. Short facts that are used together can share an entry. Separate a growing subsection when it has a distinct use condition; leave enough context in the parent to understand its role without repeating its detailed rules. Measure the likely simultaneous token load with the target tokenizer rather than imposing a fixed character count or copying another card's entry sizes.

Card `system_prompt` and `post_history_instructions` are override inputs, not guaranteed extra paragraphs. In Chat Completion, they depend on the corresponding preset prompt being enabled and allowing overrides. Ordinary setting information can live in character fields or lore entries without replacing the user's writing preset.

## Give rules and knowledge an explicit scope

Put a shared rule at the narrowest scope that actually shares it: setting-wide, an organization, a person or a temporary scene. A character's unusual behavior is not automatically a law of the whole world. For an alternate timeline, identify the changed premise and its consequences while retaining the ordinary setting needed outside those changes.

A scene-specific addition needs an entry condition, an exit condition and its relationship to the baseline. If it intentionally overrides a rule, name the affected rule and the scope of the exception. Otherwise it supplements the baseline. This prevents two simultaneously included blocks from giving incompatible instructions without a way to choose.

Separate what is true from what a character believes or has learned. For a mystery, decide whether the model should know the answer while portraying an uninformed character, or should not receive the answer before a reveal. In the first case, state who knows what and which actions that permits. In the second, keep the unrevealed answer outside active prompt sources until the reveal. A heading saying “secret” is still text the model reads. Disabling an entry removes it from future activation, not from earlier chat messages that already contain its contents.

Explain a rule's consequences and limits when these affect play; avoid turning an illustrative situation into a mandatory event sequence. The player's control over their character and the desired narrative style come from this card's requirements, not a universal card template.

## Separate hierarchy, activation and placement

“顶层世界观” describes a semantic relationship: the general rules explain how the later details work. To implement it, distinguish these controls:

| Decision | Control | What it actually means |
| --- | --- | --- |
| What is the parent context? | The text itself: headings, definitions, scope and references | A file name or entry title does not create a prompt hierarchy; the entry's `comment` is not automatically its model-facing heading |
| Does this entry qualify for this request? | Blue/green mode, keyword matches and other activation filters | Eligibility, not authority or prompt position |
| Which prompt region receives it? | `position`, and `depth`/`role` for in-chat entries | Placement relative to a host region or chat messages |
| In what order are entries read within that region? | `order` | Local sequence, not a universal rank across the entire request |
| Where is the region in the full request? | The active preset and generation pipeline | Inspect the actual request rather than inferring it from the lorebook editor |

For Chat Completion, World Info (↑Char), World Info (↓Char), description and other regions follow the prompt manager's order, enabled state and placement overrides. For Text Completion, the context template uses slots such as `wiBefore`, `description` and `wiAfter`. A lorebook setting alone cannot put text above every possible preset prompt.

The editor's custom list ordering uses `displayIndex`. Moving an entry in that list does not change its prompt `order`. Check the insertion settings when the intended change is reading sequence, and retain IDs when reorganizing existing material.

### Make “foundation before details” concrete

Common native worldbook positions are:

| `position` | Region | Use |
| --- | --- | --- |
| `0` | Before character / ↑Char | Setting foundation and supporting reference material, when this region has the intended placement in the preset |
| `1` | After character / ↓Char | Material intended for that region after checking the preset |
| `4` | At chat depth / @D | A short scene-local reminder; set `depth` and `role` deliberately |
| `2`, `3` | Before/after Author's Note | Content that belongs with an active Author's Note; it depends on that feature's placement and insertion conditions |
| `5`, `6` | Before/after dialogue examples | Material intended to be handled as part of the example section |

Within ↑Char or ↓Char, smaller `order` values appear earlier in the assembled text. In-chat entries follow that rule within the same **depth and role**. Author's Note and example entries also use ascending order within their respective regions. Outlet entries have a separate assembly path; this ordering rule is not a universal rule for every position or preset priority field.

Put foundation and dependent details in one suitable region, with explicit, distinct orders. If they must be in different regions, inspect the preset's region order as well. Use complete headings or tags inside each entry: a green entry might be absent, so splitting an opening tag and its closing tag across independently activated entries creates an incomplete structure.

For @D, depth counts backward from the end of chat messages, not conversational turns. Depth 0 is at the recent end; larger depths are earlier. Native `role` values are `0` system, `1` user, `2` assistant. Changing depth is a placement choice; it does not evaluate story conditions or guarantee that the model obeys a rule.

## Blue and green decide when information is available

**Blue / 蓝灯** is `constant: true`: keyword matching is bypassed. Use it for compact baseline facts or rules needed every exchange. Disabled entries, generation/character filters, timing, probability, inclusion groups and budget can still affect inclusion. Blue does not mean “always reaches the model.”

**Green / 绿灯** is `constant: false, vectorized: false`: a normal keyword-triggered entry. Any primary keyword in `key` can match. Use distinctive names and genuine aliases the player or narration will use; broad words such as “人” or “这里” activate unrelated material. A secondary list only matters when `selective` is true and `keysecondary` is non-empty:

| `selectiveLogic` | Secondary requirement after a primary match |
| --- | --- |
| `0` — AND ANY | At least one secondary keyword matches |
| `1` — NOT ALL | At least one secondary keyword does not match |
| `2` — NOT ANY | None of the secondary keywords match |
| `3` — AND ALL | All secondary keywords match |

These are text matches, not narrative reasoning. “We left the harbor” still contains “harbor.” Two alternative location names in recent messages can activate both entries. Keep canonical current location in state when the distinction matters; keyword entries can supply reference knowledge about places being discussed.

Check shared keywords across entries: a place name may deliberately load a location and its residents, while two people with the same title may need a distinguishing name or secondary condition. Repeated keywords are a design decision, not automatically an error. Since `key` and `comment` are not inserted as body text, each simultaneously loaded entry needs its subject and scope in its own content.

`scanDepth` controls how many recent messages are searched; `null` inherits the global setting. It is unrelated to insertion `depth`. Additional match-source switches can include description, scenario or other selected text. A keyword in permanently scanned setting text can make a supposedly occasional entry activate repeatedly. Check `caseSensitive` and `matchWholeWords` against actual names, aliases and the language being used. Regex keywords use their regex flags and matching rules.

In an ordinary send, the newest scanned message can be the user's message. `scanDepth: 1` therefore does not mean “the previous assistant reply” or guarantee reading its stage marker. For Chinese/Japanese names without space-delimited words, substring matching via entry-level `matchWholeWords: false` is often appropriate; a whole-word switch is not a language-aware segmenter. Keep global matching preferences unchanged when an entry-level choice solves the need.

To park an entry, set `disable: true` and retain its keywords. Emptying `key` only removes the ordinary keyword route; blue mode, external activation or decorators can still activate it.

Vectorized mode uses a separate retrieval path. It is not the keyword mode described here; choose it only when that retrieval setup is part of the user's card environment.

## Keep dependencies available without pulling in the whole book

When global recursive scanning is enabled, lore content can trigger more lore entries. That can intentionally connect a location to its organization, or unintentionally activate a chain of unrelated detail.

- `excludeRecursion: true` prevents this entry from being activated in the ordinary recursive pass; it can still match the original scan. Sticky timing can bypass this exclusion.
- `preventRecursion: true` keeps this entry's content out of the recursive scan input; it can still be activated itself.

Choose these based on the intended dependency direction. If every scene needs a fact, keep it in the compact foundation instead of hiding it behind a multi-entry trigger chain. If an occasional entry needs another occasional entry, make that activation relationship explicit and check both the direct and recursive cases.

Mutually exclusive stages need a selection mechanism. An inclusion `group` selects among eligible entries, normally by weighted choice; group scoring, timing and `groupOverride` can change that selection. It does not compare variables. For a LittleWhiteBox relationship stage driven by a numeric value, use [the existing `<varevent>` stage mechanism](<xiaobaix-capabilities.md#varevent>) and its documented condition rules. Merely assigning all stage entries the character's name activates conflicting descriptions together.

An event that must happen only once needs a completion fact in the card's state and a condition that reads it. A keyword disappearing from the recent scan window is not a lasting record of completion. Keep that record in the existing variable system rather than creating a second state history in reply text.

## Distinguish saved text, display and model input

A reply has saved source text, a rendered display and a prompt-facing form. A display-only regex (`markdownOnly`) can hide or decorate a block without removing it from model input; prompt-only processing (`promptOnly`) acts on a different path. An HTML comment or hidden panel is not by itself evidence that the model or keyword scanner cannot see its text. Inspect the relevant transformed input.

Keep formatting instructions, greeting examples and the regex consumer consistent. If a tag changes, check the output rule and the rule that consumes it together. For variable cards, the front end reads current variables directly, rather than relying on a second full-state block in the story text. Authoring notes, unresolved research and editing rationale belong in workspace notes, not in text destined for the model.

## Budget is separate from reading order

The worldbook has a token budget, and the full request has its own context limit. Even an activated blue entry can be left out. Source strategy, sticky timing and descending `order` affect which entries are considered first for the worldbook budget; afterward the accepted entries are arranged for reading as described above.

Thus a small `order` puts the foundation earlier in its region but does not protect it from being dropped for budget. Keep the foundation short, reduce optional detail and inspect the crowded case. `ignoreBudget: true` exempts an entry from the worldbook budget check, not the model's context limit; use it for a specifically justified small essential entry, not the entire book.

## Worked example: a harbor setting

These examples use CardFiles worldbook documents. Fields such as `key`, `order`, `disable`, `scanDepth` and numeric `position` go in the header's `settings` object. Exported character books use `keys`, `insertion_order`, inverted `enabled` and an `extensions` object for many advanced fields; importing a book converts between these formats, but editing CardFiles settings is not that import step. Choose unused numeric entry IDs in the intended linked book. The first example is a complete .md file: the JSON header sits between two lines containing `---`, followed by the entry content. The later examples show header and content separately; use the same file format. The main skill describes file paths and saving.

Foundation document (complete file contents):

```markdown
---
{"id":0,"name":"港城基础","settings":{"constant":true,"vectorized":false,"position":0,"order":10,"disable":false,"useProbability":false,"preventRecursion":true}}
---
港城基础
雾港依靠潮汐安排航行。潮位表由港务署发布；出海手续由码头登记处办理。
```

Organization header:

```json
{"id":1,"name":"港务署","settings":{"constant":true,"vectorized":false,"position":0,"order":20,"disable":false,"useProbability":false,"preventRecursion":true}}
```

Organization content:

```text
港务署
港务署负责潮位公告，不办理出海登记。人物提到航行制度时，以这两个机构的分工为准。
```

Optional location header:

```json
{"id":2,"name":"东码头","settings":{"key":["东码头","旧渡口"],"constant":false,"vectorized":false,"position":0,"order":30,"disable":false,"useProbability":false,"scanDepth":2,"matchWholeWords":false,"excludeRecursion":true,"preventRecursion":true}}
```

Location content:

```text
东码头（旧渡口）
码头登记处在这里办公。登记队伍沿仓库外墙排开，货船在退潮前离港。
```

With sufficient budget, the ↑Char text reads foundation → organization. Mentioning either location alias within the scanned two messages adds the location after them. An unrelated exchange leaves that detail out. The headings express semantic nesting; the shared position and distinct order implement the reading sequence. These numbers are an example, not a numbering convention to impose on existing cards.

## Check what travels with a shared card

A book name in `data.extensions.world` is a link, while `data.character_book` contains embedded entries. The host can embed a linked primary book when saving the character, so inspect the exported card's actual entries and their latest content rather than inferring portability from the link alone. Additional books in `charLore[].extraBooks`, global book selection, chat/persona books and global regex settings live outside the card. A successful local run may depend on them.

For sharing, inventory only the dependencies this card actually uses: lorebooks, scoped regex, LittleWhiteBox tasks, assets and required extensions/settings. Check the export in a separate environment without the author's global books or regex. A recipient needs the embedded book imported and the relevant extension features available; they do not receive the author's current chat state just by importing a card.

## Verify what the model will actually receive

Locate the failure before changing prose: missing saved content or a missing book link is a writeback/link problem; a present but inactive entry is an activation problem; an active entry absent from its intended place is an assembly/budget/transformation problem; correctly included text with a poor reply calls for content/model evaluation. Check the relevant layer rather than making every entry blue or increasing all priorities.

Compare the intended content with the generated request, not just the editor's entry list:

- Each selectable greeting: are baseline facts, output rules and that opening's initial state consistent? Test an opening directly rather than relying on another greeting being read first.
- An alias appears, then leaves the scan window: does the optional entry enter and leave as intended?
- Two names appear, or an old location is mentioned: are these references or mutually exclusive current states?
- Several optional entries activate together: is the foundation still included, and are any wrappers incomplete?
- The user's actual preset: are the regions enabled, in the intended order and role, with macros expanded and prompt-side regex applied?
- A conditional module exits or a secret is revealed: do the applicable rules and character knowledge change without conflicting old descriptions or knowledge leaking from another active source?

The host's generated-prompt inspection and activation details provide evidence of assembly. The assistant's available tools may expose only part of that evidence; report what was actually inspected. A rendered request proves inclusion and ordering, while a model reply is needed to evaluate whether the content guides the desired behavior. Neither check is a prerequisite for saving a draft.

## Primary-source navigation

Use project Read/Grep with these indexed host paths when the running version differs or a setting needs deeper investigation:

- `scripts/world-info.js`: `newWorldInfoEntryDefinition`, `world_info_position`, `WorldInfoBuffer`, `getSortedEntries`, `checkWorldInfo`, `filterByInclusionGroups`, `convertCharacterBook`.
- `scripts/extensions/regex/engine.js`: `getRegexedString`, `getRegexScripts`.
- `scripts/openai.js`: `preparePromptsForChatCompletion`, `populateChatCompletion`, `populationInjectionPrompts`.
- `scripts/PromptManager.js`: `getPromptCollection`, `getPromptOrderForCharacter`.
- `script.js`: `Generate`, `storyStringParams`, `doChatInject`, `extension_prompt_roles`.

The card supplies information and intended activation/placement; the user's active preset and host assemble the final request.
