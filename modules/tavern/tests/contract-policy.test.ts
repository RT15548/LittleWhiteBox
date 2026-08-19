import test from 'node:test';
import assert from 'node:assert/strict';

import {
    mergeTavernSessionContract,
    resolveTavernSessionContractRuntime,
} from '../shared/session-contract';
import {
    buildDeniedAutoManagerToolResult,
    isAutoManagerToolAllowed,
    resolveTavernAutoManagerToolPolicy,
} from '../app-src/runtime/contract-policy';
import { TAVERN_TASK_TOOL_NAMES } from '../shared/tasks/task-tools';

test('tavern contract runtime resolves module capabilities without leaking reserved toggles', () => {
    const memoryOnly = resolveTavernSessionContractRuntime(mergeTavernSessionContract(undefined, {
        memoryArchiving: true,
        cartographyEngine: false,
        statusPanel: false,
    }));
    assert.equal(memoryOnly.includeMemoryFiles, true);
    assert.equal(memoryOnly.includeStructuredStates, false);
    assert.equal(memoryOnly.includeStatusStates, false);
    assert.equal(memoryOnly.includeActionChecks, true);
    assert.equal(memoryOnly.includeRandomEncounters, true);
    assert.equal(memoryOnly.hasAutomaticManagerWork, true);
    assert.deepEqual(memoryOnly.managerPromptOptions, {
        includeMemory: true,
        includeCartography: false,
        includeStatus: false,
    });

    const mapOnly = resolveTavernSessionContractRuntime(mergeTavernSessionContract(undefined, {
        memoryArchiving: false,
        cartographyEngine: true,
        statusPanel: false,
    }));
    assert.equal(mapOnly.includeMemoryFiles, false);
    assert.equal(mapOnly.includeStructuredStates, true);
    assert.equal(mapOnly.includeStatusStates, false);
    assert.equal(mapOnly.includeActionChecks, true);
    assert.equal(mapOnly.includeRandomEncounters, true);
    assert.equal(mapOnly.hasAutomaticManagerWork, true);
    assert.deepEqual(mapOnly.managerPromptOptions, {
        includeMemory: false,
        includeCartography: true,
        includeStatus: false,
    });

    const statusOnly = resolveTavernSessionContractRuntime(mergeTavernSessionContract(undefined, {
        memoryArchiving: false,
        cartographyEngine: false,
        statusPanel: true,
    }));
    assert.equal(statusOnly.includeMemoryFiles, false);
    assert.equal(statusOnly.includeStructuredStates, false);
    assert.equal(statusOnly.includeStatusStates, true);
    assert.equal(statusOnly.hasAutomaticManagerWork, true);
    assert.deepEqual(statusOnly.managerPromptOptions, {
        includeMemory: false,
        includeCartography: false,
        includeStatus: true,
    });

    const disabled = resolveTavernSessionContractRuntime(mergeTavernSessionContract(undefined, {
        memoryArchiving: false,
        cartographyEngine: false,
        statusPanel: false,
    }));
    assert.equal(disabled.includeMemoryFiles, false);
    assert.equal(disabled.includeStructuredStates, false);
    assert.equal(disabled.includeStatusStates, false);
    assert.equal(disabled.includeActionChecks, true);
    assert.equal(disabled.includeRandomEncounters, true);
    assert.equal(disabled.hasAutomaticManagerWork, false);
    assert.deepEqual(disabled.managerPromptOptions, {
        includeMemory: false,
        includeCartography: false,
        includeStatus: false,
    });
});

test('tavern auto manager tool policy keeps read tools and module-specific write tools only', () => {
    const memoryOnly = resolveTavernAutoManagerToolPolicy(mergeTavernSessionContract(undefined, {
        memoryArchiving: true,
        cartographyEngine: false,
        statusPanel: false,
    }));
    assert.equal(memoryOnly.allowedToolNames.includes('Read'), true);
    assert.equal(memoryOnly.allowedToolNames.includes('Grep'), true);
    assert.equal(memoryOnly.allowedToolNames.includes('Write'), true);
    assert.equal(memoryOnly.allowedToolNames.includes('MapInspect'), false);
    assert.equal(memoryOnly.allowedToolNames.includes('MapSceneEdit'), false);
    assert.equal(memoryOnly.allowedToolNames.includes('StatusRead'), false);
    assert.equal(memoryOnly.allowedToolNames.includes('StatusPatch'), false);
    assert.equal(memoryOnly.deniedToolNames.includes('MapPatch'), true);
    assert.equal(memoryOnly.deniedToolNames.includes('MapSceneEdit'), true);

    const mapOnly = resolveTavernAutoManagerToolPolicy(mergeTavernSessionContract(undefined, {
        memoryArchiving: false,
        cartographyEngine: true,
        statusPanel: false,
    }));
    assert.equal(mapOnly.allowedToolNames.includes('Read'), true);
    assert.equal(mapOnly.allowedToolNames.includes('MapAtlasRead'), true);
    assert.equal(mapOnly.allowedToolNames.includes('MapSceneRead'), true);
    assert.equal(mapOnly.allowedToolNames.includes('MapSceneEdit'), true);
    assert.equal(mapOnly.allowedToolNames.includes('MapPatch'), false);
    assert.equal(mapOnly.allowedToolNames.includes('MapInspect'), false);
    assert.equal(mapOnly.allowedToolNames.includes('MapDocs'), false);
    assert.equal(mapOnly.allowedToolNames.includes('StatusPatch'), false);
    assert.equal(mapOnly.allowedToolNames.includes('Write'), false);
    assert.equal(mapOnly.deniedToolNames.includes('Edit'), true);
    assert.equal(mapOnly.deniedToolNames.includes('MapPatch'), true);

    const statusOnly = resolveTavernAutoManagerToolPolicy(mergeTavernSessionContract(undefined, {
        memoryArchiving: false,
        cartographyEngine: false,
        statusPanel: true,
    }));
    assert.equal(statusOnly.allowedToolNames.includes('Read'), true);
    assert.equal(statusOnly.allowedToolNames.includes('StatusRead'), true);
    assert.equal(statusOnly.allowedToolNames.includes('StatusPatch'), true);
    assert.equal(statusOnly.allowedToolNames.includes('Write'), false);
    assert.equal(statusOnly.allowedToolNames.includes('MapSceneEdit'), false);

    const disabled = resolveTavernAutoManagerToolPolicy(mergeTavernSessionContract(undefined, {
        memoryArchiving: false,
        cartographyEngine: false,
        statusPanel: false,
    }));
    assert.deepEqual(disabled.allowedToolNames, [
        'LS',
        'Grep',
        'Read',
        'web_search',
        ...Object.values(TAVERN_TASK_TOOL_NAMES),
    ]);
    assert.equal(isAutoManagerToolAllowed('Write', disabled.runtime.contract), false);
    assert.equal(isAutoManagerToolAllowed('MapPatch', disabled.runtime.contract), false);
    assert.equal(isAutoManagerToolAllowed('MapSceneEdit', disabled.runtime.contract), false);
    assert.equal(isAutoManagerToolAllowed('StatusPatch', disabled.runtime.contract), false);
    assert.equal(isAutoManagerToolAllowed('Read', disabled.runtime.contract), true);
    assert.equal(isAutoManagerToolAllowed('web_search', disabled.runtime.contract), true);
    Object.values(TAVERN_TASK_TOOL_NAMES).forEach((toolName) => {
        assert.equal(isAutoManagerToolAllowed(toolName, disabled.runtime.contract), true);
    });

    const memoryDenied = buildDeniedAutoManagerToolResult('Write', disabled.runtime.contract);
    assert.equal(memoryDenied.ok, false);
    assert.match(memoryDenied.summary, /契约未授权 记忆存档/);

    const stateDenied = buildDeniedAutoManagerToolResult('MapPatch', disabled.runtime.contract);
    assert.equal(stateDenied.ok, false);
    assert.match(stateDenied.summary, /契约未授权 制图引擎/);

    const statusDenied = buildDeniedAutoManagerToolResult('StatusPatch', disabled.runtime.contract);
    assert.equal(statusDenied.ok, false);
    assert.match(statusDenied.summary, /契约未授权 角色档案/);
});
