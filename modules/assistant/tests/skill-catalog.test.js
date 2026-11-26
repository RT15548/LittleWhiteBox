import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { Buffer } from 'node:buffer';
import { parse } from 'acorn';
import { normalizeSlashSkillTrigger } from '../app-src/slash-command-policy.js';

// Exercise the real catalog reader and mutation guards with an in-memory file store.
// A damaged existing catalog must not become an empty catalog on the next save.
async function loadCatalogTools(content) {
    const source = await readFile(new URL('../assistant.js', import.meta.url), 'utf8');
    const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'module' });
    const functions = new Set([
        'normalizeSkillFileName', 'normalizeSkillCatalogEntry', 'normalizeSkillsCatalog',
        'serializeSkillsCatalog', 'parseSkillsCatalog', 'buildSkillsPromptSummary',
        'ensureUserFile', 'ensureSkillsCatalogFile', 'readSkillsCatalogData',
        'generateSkillTool', 'updateSkillTool', 'deleteSkillTool',
    ]);
    const constants = new Set(['WORKSPACE_PREFIX', 'DEFAULT_SKILLS_FILE', 'SKILL_FILE_PREFIX', 'EMPTY_SKILLS_CATALOG', 'MAX_SKILL_PROMPT_ITEMS']);
    const declarations = ast.body.filter(node => (
        node.type === 'FunctionDeclaration' && functions.has(node.id.name)
    ) || (
        node.type === 'VariableDeclaration' && node.declarations.some(item => constants.has(item.id.name))
    )).map(node => source.slice(node.start, node.end)).join('\n');
    const moduleSource = `export default function(readUserFile, writeUserFile, normalizeSlashSkillTrigger) {
        ${declarations}
        return { read: readSkillsCatalogData, generate: generateSkillTool, update: updateSkillTool, remove: deleteSkillTool };
    }`;
    // eslint-disable-next-line no-unsanitized/method -- Execute local production handlers, not supplied catalog text.
    const { default: createTools } = await import(`data:text/javascript;base64,${Buffer.from(moduleSource).toString('base64')}`);
    let stored = content;
    const writes = [];
    const tools = createTools(
        async name => ({ name, exists: stored !== undefined, content: stored ?? '' }),
        async (name, value) => { writes.push({ name, content: value }); stored = value; return { name, path: `user/files/${name}` }; },
        normalizeSlashSkillTrigger,
    );
    return { ...tools, writes, content: () => stored };
}

const entry = {
    id: 'skill-review', title: 'Review', filename: 'LittleWhiteBox_Assistant_Skill_review.md',
    summary: 'Review a change', triggers: ['review'], slashTriggers: ['/review'], enabled: true,
    updatedAt: '2026-01-01T00:00:00.000Z',
};
const catalog = skills => JSON.stringify({ version: 1, skills });

for (const [name, content] of [
    ['empty file', ''], ['whitespace', '  \n'], ['invalid JSON', '{broken'],
    ['array root', '[]'], ['null root', 'null'], ['missing skills', '{"version":1}'],
    ['wrong skills type', '{"version":1,"skills":"broken"}'],
    ['unversioned wrong skills type', '{"skills":"broken"}'],
    ['unsupported version', '{"version":2,"skills":[]}'],
    ['null entry', catalog([null])], ['missing identity', catalog([{}])],
    ['mixed valid and invalid entries', catalog([entry, {}])],
    ['wrong identity type', catalog([{ ...entry, id: 42 }])],
    ['wrong trigger type', catalog([{ ...entry, triggers: 'review' }])],
    ['wrong trigger member', catalog([{ ...entry, slashTriggers: [42] }])],
    ['wrong enabled type', catalog([{ ...entry, enabled: 'false' }])],
    ['duplicate id', catalog([entry, { ...entry, filename: 'LittleWhiteBox_Assistant_Skill_other.md' }])],
    ['duplicate filename', catalog([entry, { ...entry, id: 'skill-other' }])],
]) {
    test(`damaged catalog is preserved and blocks writes: ${name}`, async () => {
        const tools = await loadCatalogTools(content);
        const result = await tools.read();
        assert.equal(result.ok, false);
        assert.equal(result.error, 'skills_catalog_invalid');
        assert.equal(result.content, content);
        for (const attempt of [
            () => tools.generate({ action: 'propose', title: 'New', reason: 'Reusable', sourceSummary: 'Reviewed' }),
            () => tools.generate({ action: 'save', id: 'skill-new', approvalToken: 'test-token' }),
            () => tools.update({ id: entry.id, title: 'Changed' }),
            () => tools.remove({ id: entry.id }),
        ]) {
            const failed = await attempt();
            assert.equal(failed.ok, false);
            assert.equal(failed.error, 'skills_catalog_invalid');
        }
        assert.deepEqual(tools.writes, []);
        assert.equal(tools.content(), content);
    });
}

test('only a missing catalog is initialized, and subsequent reads preserve it', async () => {
    const tools = await loadCatalogTools(undefined);
    const first = await tools.read();
    assert.equal(first.ok, true);
    assert.deepEqual(first.catalog, { version: 1, skills: [] });
    assert.equal(tools.writes.length, 1);
    assert.deepEqual(JSON.parse(tools.content()), first.catalog);
    assert.deepEqual((await tools.read()).catalog, first.catalog);
    assert.equal(tools.writes.length, 1);
});

test('valid empty and populated catalogs are read without writing or losing entries', async () => {
    for (const skills of [[], [entry, { ...entry, id: 'skill-other', filename: 'LittleWhiteBox_Assistant_Skill_other.md', enabled: false }]]) {
        const text = catalog(skills);
        const tools = await loadCatalogTools(text);
        const result = await tools.read();
        assert.equal(result.ok, true);
        assert.deepEqual(result.catalog, { version: 1, skills });
        assert.deepEqual(tools.writes, []);
        assert.equal(tools.content(), text);
    }
});
