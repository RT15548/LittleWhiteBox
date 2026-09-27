// The reported UI case: three regions, ten scenes in the current region, two empty regions.
export function mapBrowseFixture() {
    const scenes = Array.from({ length: 10 }, (_, index) => ({
        key: `harbor-${index}`, name: ['旧港酒馆', '钟楼广场', '海边书店', '灯塔', '码头', '鱼市', '面包坊', '船坞', '公园', '旅舍'][index],
        scale: index === 1 ? 'district' : 'building', status: index < 5 ? 'visited' : 'mentioned', parent: 'harbor',
        position: [160 + index % 4 * 210, 140 + Math.floor(index / 4) * 210],
    }));
    return {
        schemaVersion: 1, revision: 0,
        atlas: {
            locations: [
                { key: 'world', name: '群岛世界', scale: 'world', status: 'mentioned' },
                { key: 'harbor', name: '旧港区', scale: 'region', status: 'visited', parent: 'world', position: [280, 420], terrain: 'urban' },
                { key: 'mountains', name: '北境群山', scale: 'region', status: 'mentioned', parent: 'world', position: [600, 140], terrain: 'mountain' },
                { key: 'islands', name: '南方群岛', scale: 'region', status: 'mentioned', parent: 'world', position: [660, 700], terrain: 'water' },
                ...scenes,
            ],
            actors: [{ actorKey: 'player', displayName: '小白', locationKey: scenes[0].key }],
            links: [{ id: 'harbor-path', from: scenes[0].key, to: scenes[1].key, kind: 'road', bidirectional: true }],
        },
        scenes: {},
    };
}
