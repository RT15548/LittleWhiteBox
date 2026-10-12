// Deliberately explicit tokens: labels are not used to infer these forms.
export const sceneCreatureInput = {
    scene: 'creatures', viewBox: [0, 0, 800, 620], lighting: { space: 'outdoor', natural: 'daylight', artificial: 'off' },
    elements: [
        { id: 'ground', cat: 'terrain', geo: { center: [400, 300], size: [730, 540] }, material: 'grass' },
        ...['vine', 'root', 'tentacle', 'pipe'].map((icon, i) => ({ id: icon, cat: 'decoration', shape: 'curve', icon, closed: false, geo: { curve: [[80 + i * 185, 80], [110 + i * 185, 140], [65 + i * 185, 210]] } })),
        ...['mushroom', 'crystal', 'slime', 'dragon', 'dwarf', 'elf'].map((icon, i) => ({ id: icon, cat: i < 2 ? 'decoration' : 'actor', ...(i >= 2 && { actorKey: icon }), shape: 'circle', icon, label: icon, geo: { at: [140 + i % 3 * 235, 330 + Math.floor(i / 3) * 170], radius: icon === 'dragon' ? 65 : 45 } })),
    ],
};

export function withOrganicSemantics(input) {
    const result = structuredClone(input);
    const additions = {
        ground: { material: 'flesh' }, walls: { material: 'flesh' },
        'tendril-a': { icon: 'vine' }, 'tendril-b': { icon: 'tentacle', material: 'flesh' },
        slime: { icon: 'slime', material: 'slime' },
    };
    result.elements.forEach(element => Object.assign(element, additions[element.id]));
    return result;
}
