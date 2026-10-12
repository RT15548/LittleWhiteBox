import city from './assets/city-title.webp?url&no-inline';
import cityMobile from './assets/city-title-mobile.webp?url&no-inline';
import chapter from './assets/chapter-outpost.webp?url&no-inline';
import blade from './assets/weapon-blade.webp?url&no-inline';
import bow from './assets/weapon-bow.webp?url&no-inline';
import staff from './assets/weapon-staff.webp?url&no-inline';
import daggers from './assets/weapon-daggers.webp?url&no-inline';
import grimoire from './assets/weapon-grimoire.webp?url&no-inline';
import cannon from './assets/weapon-cannon.webp?url&no-inline';
import type { Weapon } from './types.js';
import type { CourtyardScene } from './content/world-types.js';
import camp from './assets/scene-camp.webp?url&no-inline';
import crossroads from './assets/scene-crossroads.webp?url&no-inline';
import gate from './assets/scene-gate.webp?url&no-inline';
import beacon from './assets/scene-beacon.webp?url&no-inline';
import waterway from './assets/scene-waterway.webp?url&no-inline';
import cells from './assets/scene-cells.webp?url&no-inline';
import hall from './assets/scene-hall.webp?url&no-inline';
import roots from './assets/scene-roots.webp?url&no-inline';
import arrival from './assets/cg-arrival.webp?url&no-inline';
import ending from './assets/cg-ending.webp?url&no-inline';

/** Presentation-only assets. Importing a URL never starts an image download. */
export const WORLD_ART = { city, cityMobile, chapter } as const;
export const WEAPON_ART = { blade, bow, staff, daggers, grimoire, cannon } satisfies Record<Weapon, string>;
export const SCENE_ART: Partial<Record<CourtyardScene, string>> = { camp, crossroads, gate, beacon, waterway, cells, hall, roots };
export const STORY_ART = { arrival, ending } as const;
