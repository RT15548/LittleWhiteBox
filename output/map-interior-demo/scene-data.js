import { isAreaElement, isSceneObject, sceneElementBounds } from '../../modules/xiaobai-os/apps/map/ui/scene-geometry.ts';
import { MAP_CATEGORY_LABELS } from '../../modules/xiaobai-os/apps/map/ui/map-presentation.ts';

// A legal 2D icon is not automatically a 3D asset.
const templates = { table: ['rect', 'circle'], chair: ['rect'], sofa: ['rect'], shelf: ['rect'], counter: ['rect'], tree: ['rect', 'circle'] };
const names = { table: '桌子', chair: '椅子', sofa: '沙发', shelf: '书架', counter: '柜台', tree: '树木', bed: '床', bridge: '桥', rock: '岩石' };
export const kindNames = { model: '预设造型', footprint: '占地示意', marker: '位置标记', surface: '区域 / 线', wall: '墙线抬升' };
export function nameOf(element) { return element.label || names[element.icon] || MAP_CATEGORY_LABELS[element.category] || element.id; }
export function footprint(element) {
    const b = sceneElementBounds(element);
    return { x: b.x + b.width / 2, y: b.y + b.height / 2, width: b.width, depth: b.height };
}
export function presentationKind(element) {
    if (element.shape === 'icon' || element.shape === 'label') return 'marker';
    if (element.category === 'wall') return 'wall';
    if (templates[element.icon]?.includes(element.shape)) return 'model';
    if (isAreaElement(element) && (isSceneObject(element) || ['furniture', 'decoration', 'door'].includes(element.category))) return 'footprint';
    return 'surface';
}
export function explanation(element) {
    const kind = presentationKind(element);
    if (kind === 'model') return 'icon=' + element.icon + ' 命中本地模板；高度和细节是预设，不代表真实外观。';
    if (kind === 'footprint') return (element.icon ? 'icon=' + element.icon + ' 暂无三维模板' : '数据未指定造型图标') + '；只按原轮廓、朝向和材质画矮块，不按名称猜外观。';
    if (kind === 'wall') return '沿原墙线抬升；入口缺口保持原样，墙高只是展示约定。';
    if (kind === 'marker') return '只有位置，没有占地或高度；显示标记，不补成实体模型。';
    return '按原始区域或线条绘制；微小抬升仅用于区分叠层，不是空间高度。';
}
