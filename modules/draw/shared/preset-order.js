// 预设排序的纯函数。页面和宿主各自持有一份预设数组，只用 id 对齐顺序，不搬运预设内容，
// 这样页面里尚未保存的编辑不会因为调整顺序而丢失，也不会覆盖宿主已保存的内容。

/** 把 id 在列表里移动一格（direction 为 -1 上移、1 下移）；已在边界或 id 不存在时原样返回副本。 */
export function movePresetId(ids, id, direction) {
    const list = [...ids];
    const from = list.indexOf(id);
    const to = from + (direction < 0 ? -1 : 1);
    if (from < 0 || to < 0 || to >= list.length) return list;
    [list[from], list[to]] = [list[to], list[from]];
    return list;
}

/**
 * 按给定的 id 顺序重排预设：不认识的 id 忽略，没出现在顺序里的预设保持原相对顺序排在最后，
 * 因此顺序只可能改变位置，不会增删预设。返回新数组，预设对象本身不复制。
 */
export function reorderPresetsByIds(presets, orderedIds) {
    const list = Array.isArray(presets) ? presets : [];
    const byId = new Map(list.map(preset => [preset?.id, preset]));
    const seen = new Set();
    const result = [];
    for (const id of Array.isArray(orderedIds) ? orderedIds : []) {
        if (!byId.has(id) || seen.has(id)) continue;
        seen.add(id);
        result.push(byId.get(id));
    }
    for (const preset of list) if (!seen.has(preset?.id)) result.push(preset);
    return result;
}

/** 删除后该选中谁：原位置上顶上来的那一个，删的是最后一个就选新的最后一个。 */
export function pickNeighborAfterRemoval(ids, removedId) {
    const index = ids.indexOf(removedId);
    const rest = ids.filter(id => id !== removedId);
    if (!rest.length) return null;
    return rest[Math.min(Math.max(index, 0), rest.length - 1)];
}
