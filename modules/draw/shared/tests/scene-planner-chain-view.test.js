import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { renderScenePlannerChain } from '../scene-planner-chain-view.js';
import { buildScenePlannerChainPreview } from '../scene-planner-frame.js';

// Opening a long reference must expose the complete schema description while retaining its editor link.
test('expanded tool references show the full schema description, not a truncated or raw editor value', () => {
    const { document, Event } = parseHTML('<main></main><textarea></textarea>');
    const container = document.querySelector('main');
    const editor = document.querySelector('textarea');
    const guide = `${'guide text '.repeat(150)}END OF GUIDE`;
    editor.value = guide;
    const chain = buildScenePlannerChainPreview({ builtinTexts: { guide } });
    const description = chain.flatMap(item => item.sections).find(section => section.parameter === 'guidance').content;
    renderScenePlannerChain(container, chain, { getEditable: key => key === 'tagGuide' ? editor : null });

    const row = container.querySelector('[data-key="tagGuide"]');
    const content = row.querySelector('.chain-section-content');
    assert.ok(row.querySelector('button'));
    assert.equal(row.classList.contains('expanded'), false);
    row.dispatchEvent(new Event('click', { bubbles: true }));
    assert.equal(content.textContent, description);
    content.dispatchEvent(new Event('click', { bubbles: true }));
    assert.equal(row.classList.contains('expanded'), true);
});
