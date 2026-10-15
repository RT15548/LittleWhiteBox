import type { Item, RecipeId } from './model.js';
import type { FaultCode } from './fault.js';
import { ITEMS, RECIPES } from './survival-content.js';

// Items here are physically accessible to the actor, not everything in their sight.
export function craftBlocker(recipeId: RecipeId, accessible: readonly Pick<Item, 'kind' | 'quantity'>[], materials: readonly Pick<Item, 'wetness'>[], hasFire: boolean): FaultCode | null {
    const recipe = RECIPES[recipeId];
    if (recipe.toolOptions.length && !accessible.some(item => item.quantity > 0
        && ITEMS[item.kind].tools.some(tool => recipe.toolOptions.includes(tool)))) { return 'tool_missing'; }
    if (recipe.fire && !hasFire) { return 'fire_missing'; }
    if (recipeId === 'dry_tinder' && materials.some(item => item.wetness > 0.25)) { return 'material_wet'; }
    return null;
}
