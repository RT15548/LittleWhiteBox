// 浮层菜单（角色卡“…”菜单、页头主题菜单）共用的两个小工具；不依赖酒馆宿主模块。

/** 记录 addEventListener，destroy 时一次性全部摘掉。 */
export function createListenerBag() {
    const removers = [];
    return {
        on(target, type, handler, capture) {
            target.addEventListener(type, handler, capture);
            removers.push(() => target.removeEventListener(type, handler, capture));
        },
        clear() {
            removers.splice(0).forEach(remove => remove());
        },
    };
}

/** 菜单项之间的方向键漫游：↓ / ↑ 循环，Home / End 跳到两端。index 是当前焦点所在项的下标（不在任何项上给 -1）；处理了按键返回 true。 */
export function roveMenuFocus(event, items, index) {
    let target;
    if (event.key === 'ArrowDown') target = index + 1;
    else if (event.key === 'ArrowUp') target = index < 0 ? items.length - 1 : index - 1;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = items.length - 1;
    else return false;
    event.preventDefault?.();
    items[(target + items.length) % items.length]?.focus?.();
    return true;
}
