# Standard chat-driven card: 雾港证物审理

Use this example when the player types an action in ordinary chat, the update model resolves it before prose, and a second update carries changes in cooperation into later scenes. The panel only displays the case. For a custom interface that submits decisions itself, use the [integrated 解铃会 example](<../../../../../card-workspace/skill/frontend/examples/jieling.md>).

The [wugang folder](<wugang/>) is a complete CardFiles project: card fields, one opening, its linked worldbook, a display regex, and the variable package. Reading it installs nothing. Copy its files to the same relative paths under CardFiles open, check the draft, then save the card files. Its card and worldbook use the separate name 雾港证物审理·示例, so trying it need not replace the author's original card. Use a new isolated chat; there is no migration of an existing case.

## The player's journey

The player investigates a falsified cargo manifest in a harbour interrogation room. Three suspects shift blame while a witness and a clerk provide incomplete information. The case begins with a directory of five possible exhibits, not five already-collected exhibits.

1. **Choose in chat.** The player names the evidence to collect, seal or inspect, asks for a formal testimony, transfers custody, advances a stated amount of time, or makes an explicit final decision. Asking how an action works is not performing it.
2. **Resolve before narration.** The before updater maps the request to ordered actions. Settlement checks the whole batch. A refused condition leaves the case unchanged; prose can describe the failed attempt using the supplied reason.
3. **Read the result.** The prose describes the recorded actions and revealed evidence. The read-only panel shows the same current state. An unrecorded outcome is not a successful examination merely because it would make a good story.
4. **Record changes in cooperation.** After prose, the updater can change how willing individual people are to cooperate. It cannot change identities, testimony, evidence or the verdict. Cooperation affects how people respond in later scenes, not how the case is settled.
5. **Decide when to end.** The player can accuse with an explicit evidence list, choose to close without accusing, or reach the deadline. The settled verdict ends substantive case actions.

An extension error is not an in-story failed examination. The plugin's update controls handle execution retry, explicit skip and saving; the display panel does not submit a second operation to recover.

## Why each value exists

| State | Later use and owner |
| --- | --- |
| `clock` | `advance` spends the requested time; its limit stops further substantive actions. |
| `exhibits` | The fixed directory locates each object. Empty custody means uncollected; collection, transfer, sealing and examination establish persistent custody and findings. |
| `people.*.testified` | Formal testimony is once per person. |
| `people.*.trust` | The after updater preserves how the completed scene changed a person's attitude for later narration. Only these leaves are directly writable. |
| `claims` | The spoken account, including its literal `text`, must survive regeneration and reopening. A recorded claim is still a speaker's account, not a verdict. |
| `leads` | A successful examination can reveal a lead. Unopened titles are empty; newly revealed titles are stored with their opened flag. |
| `verdict` | The final decision, the actual submitted evidence and its reason persist across turns. |

The [definition](<wugang/variables/definition.json>) owns action conditions, parameter limits and writable stages. [Worldbook files](<wugang/world_book/雾港证物审理·示例/>) supply setting and characterisation, then expand `xbgetvar::docket` and `xbvardesc::case` for values and meanings. They do not contain the solution or repeat the mechanics. The native before outcome supplies actual changes and refusals; the card stores no second per-turn event history.

## Why both stages exist

The before stage must know whether evidence could be acquired, whether it matched, what a witness actually said, and whether a decision ended the case before prose writes those events. Its [access update instructions](<wugang/variables/definition.json>) distinguish explicit choices from questions and recap.

The after stage reads the completed conversation to judge whether each person's cooperation changed. It uses the `trust` fields to carry those changes into later scenes; the scene itself stays in chat. Both stages cost model requests. If an adaptation has no state that depends on the completed scene, it can omit after.

## Randomness and batch ownership

[prepare](<wugang/variables/scripts/prepare.js>) samples one raw roll for every possible exhibit in a run. It does not compute examination outcomes from the pre-batch state. [The examination function](<wugang/variables/functions/setExhibitState.js>) applies the roll using the state when that action executes, so sealing followed by examination works in the same batch as well as separate batches.

A correction may change the selected exhibit while reusing the same preparation. Preparing the complete finite set supports that correction without rerolling or treating missing data as failure. Missing or invalid supplied material rejects a trial. The successful examination's conclusion is stored in the case; regenerating prose and restoring a saved reply read that conclusion without drawing again. Explicitly recomputing an edited request is a new settlement, not a restoration.

## A staged trial from the opening

Read the draft with `st.state3.openDraft()`. Pass `before` below to `checkDraft` with `stage:'before'` and the supplied `prepared`. Pass that result's `state` to a second `checkDraft` with `after` and `stage:'after'`. Fixed rolls are for reproducible draft trials only; live settlement prepares its own material.

```json
{
  "prepared": { "rolls": { "EX-01": 0.1, "EX-02": 0.1, "EX-03": 0.1, "EX-04": 0.1, "EX-05": 0.1 } },
  "before": [
    { "action": "discover", "params": { "exhibitId": "EX-03" } },
    { "action": "seal", "params": { "exhibitId": "EX-03" } },
    { "action": "inspect", "params": { "exhibitId": "EX-03" } },
    { "action": "testify", "params": { "personCode": "witness" } }
  ],
  "after": [
    { "op": "set", "path": ["docket", "people", "witness", "trust"], "value": 6, "reason": "调查官耐心听完陈述，老陈愿意继续配合。" }
  ]
}
```

The first stage collects and seals the glove, records a matching examination, opens its lead and stores the witness's words. The second changes only the witness's cooperation. Trying the examination again, writing a person's identity directly, or submitting an examination in after must fail.

Continue routes from these results rather than hand-setting a winning state. Check distinct submitted evidence, irreversible custody damage, the deadline within a compound request, explicit closure and both accusation endings. The executable [rule and service tests](<../../../tests/wugang-example.test.ts>) also execute this trial; the [panel tests](<../../../tests/wugang-frontend.test.ts>) run the actual display script.

## Installing and playing

Save the complete variable package and the ordinary card files, then enable an isolated chat in variable 3.0 mode and allow its preparation script. Before updates run automatically; select automatic after updates or use the reply's update button for narrative bookkeeping. Nothing in the card changes that player preference.

A natural first request is “取来沾油手套，封存后检验，再请老陈正式作证。” Verify the actual model-selected actions, settled data and prose, then inspect an after update. A deterministic trial proves the submitted mechanics, not that a configured model interpreted this sentence correctly. Reopen and regenerate to verify result reuse; edit and recompute only when the player intends a different settlement.
