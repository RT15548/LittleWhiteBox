// Local, static assets only. URLs are emitted as separate files by Vite.
import tableUrl from './assets/kenney/table.glb?url&no-inline';
import chairUrl from './assets/kenney/chairRounded.glb?url&no-inline';
import bedUrl from './assets/kenney/bedSingle.glb?url&no-inline';
import shelfUrl from './assets/kenney/bookcaseOpenLow.glb?url&no-inline';
import treeUrl from './assets/kenney/tree_oak.glb?url&no-inline';
import rockUrl from './assets/kenney/stone_largeE.glb?url&no-inline';
import stoolUrl from './assets/kenney/stoolBar.glb?url&no-inline';
import benchUrl from './assets/kenney/bench.glb?url&no-inline';
import sofaUrl from './assets/kenney/loungeSofa.glb?url&no-inline';
import cabinetUrl from './assets/kenney/kitchenCabinet.glb?url&no-inline';
import chestUrl from './assets/kenney/chest.glb?url&no-inline';
import barrelUrl from './assets/kenney/barrel.glb?url&no-inline';
import stoveUrl from './assets/kenney/kitchenStove.glb?url&no-inline';
import refrigeratorUrl from './assets/kenney/kitchenFridge.glb?url&no-inline';
import sinkUrl from './assets/kenney/kitchenSink.glb?url&no-inline';
import toiletUrl from './assets/kenney/toilet.glb?url&no-inline';
import bathtubUrl from './assets/kenney/bathtub.glb?url&no-inline';
import carUrl from './assets/kenney/sedan.glb?url&no-inline';
import statueUrl from './assets/kenney/statue_ring.glb?url&no-inline';
import tentUrl from './assets/kenney/tent-canvas.glb?url&no-inline';
import plantUrl from './assets/kenney/pottedPlant.glb?url&no-inline';
import lightUrl from './assets/kenney/lampRoundFloor.glb?url&no-inline';
import type { SceneAssetKind } from './scene3d-assets.js';

export const SCENE_ASSET_URLS: Record<SceneAssetKind, string> = {
    table: tableUrl, chair: chairUrl, bed: bedUrl, shelf: shelfUrl, tree: treeUrl, rock: rockUrl,
    stool: stoolUrl, bench: benchUrl, sofa: sofaUrl, cabinet: cabinetUrl, chest: chestUrl, barrel: barrelUrl,
    stove: stoveUrl, refrigerator: refrigeratorUrl, sink: sinkUrl, toilet: toiletUrl, bathtub: bathtubUrl,
    car: carUrl, statue: statueUrl, tent: tentUrl, 'potted-plant': plantUrl, light: lightUrl,
};
