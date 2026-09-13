# Map scene assets

Author: Kenney. Retrieved 2026-09-13. All four packs are CC0 and permit modification and redistribution; attribution is optional. The original license files are preserved beside the models and copied into the production `dist/map-assets/` directory. Only 22 prepared models are shipped, not the full packs.

| Pack (version from archive) | Official source | Archive SHA-256 |
| --- | --- | --- |
| Furniture Kit 2.0 | https://kenney.nl/assets/furniture-kit | `E67652D0932CEE41683F74711C03D3E192A2AF9979EF8E6B237711F5482D46B0` |
| Nature Kit 2.1 | https://kenney.nl/assets/nature-kit | `FA7974A0D342BFE63C38664BA9F8EC1A4AAB8EA25F099BDC56870E33588C4D9D` |
| Car Kit 3.1 | https://kenney.nl/assets/car-kit | `FAC7DACAC5C7874348CF19729AF3EF205F3D366493EDAF0A827D93F4FDF3D0C4` |
| Survival Kit 2.0 | https://kenney.nl/assets/survival-kit | `C3586341B5932C87EB43D75D915434F47DAED168B17ED36A03E8CA9977C7443E` |

Archive downloads used:

- https://kenney.nl/media/pages/assets/furniture-kit/440e0608a4-1677580847/kenney_furniture-kit.zip
- https://kenney.nl/media/pages/assets/nature-kit/37ac38a37b-1677698939/kenney_nature-kit.zip

Download the other packs from the official pages above. Extract the four packs into `furniture/`, `nature/`, `car/`, and `survival/` under an offline working directory, then run from the repository root:

```sh
node scripts/prepare-map-scene-assets.mjs <working-directory>
```

The script bakes node transforms, centers the footprint, grounds the mesh, merges surfaces into semantic material roles, and generates local planar UVs. It removes source palette textures before decoding and classifies their surfaces offline: car body/window/wheel-and-trim; survival main/bands-and-hardware. It emits static GLBs without textures, external URIs, cameras, lights or animations. Runtime materials come from the existing map material tokens; foliage, glass, bedding and lamp shade receive limited role-specific surfaces. The source repository's `apps/map/ui/three/assets/kenney/manifest.json` records original filenames, original/prepared file hashes, bounds, decoded geometry bytes and geometry budgets. Production filenames add Vite content hashes.

| Pack | Original filename | Object token |
| --- | --- | --- |
| Furniture, `Models/GLTF format/` | `table.glb` | table |
| Furniture | `chairRounded.glb` | chair |
| Furniture | `bedSingle.glb` | bed |
| Furniture | `bookcaseOpenLow.glb` | shelf |
| Furniture | `stoolBar.glb` | stool |
| Furniture | `bench.glb` | bench |
| Furniture | `loungeSofa.glb` | sofa |
| Furniture | `kitchenCabinet.glb` | cabinet |
| Furniture | `kitchenStove.glb` | stove |
| Furniture | `kitchenFridge.glb` | refrigerator |
| Furniture | `kitchenSink.glb` | sink |
| Furniture | `toilet.glb` | toilet |
| Furniture | `bathtub.glb` | bathtub |
| Furniture | `pottedPlant.glb` | potted-plant |
| Furniture | `lampRoundFloor.glb` | light |
| Nature, `Models/GLTF format/` | `tree_oak.glb` | tree |
| Nature | `stone_largeE.glb` | rock |
| Nature | `statue_ring.glb` | statue (neutral abstract sculpture) |
| Survival, `Models/GLB format/` | `chest.glb` | chest |
| Survival | `barrel.glb` | barrel |
| Survival | `tent-canvas.glb` | tent (complete frame and canvas, not the bare `tent.glb` frame) |
| Car, `Models/GLB format/` | `sedan.glb` | car |

Zero rotation faces south (+Z): chair/sofa backs and bed headboard are north; car front and toilet bowl are south. The bathtub is rotated +90 degrees about Y during preparation so its long axis is north–south. Shelves repeat empty structural bays inside the authored footprint. Only a table's central top span is extended; legs retain their proportions. Other models scale uniformly, capped at a display height of 2.5 scene units (3 for trees); these are UI proportions, not saved height facts.

Each model's accepted rectangle aspect range is declared in `scene3d-asset-fit.ts`. Tree, rock, stool, barrel, potted-plant and light also support circles using the complete mesh's radial bound, not a square bounding box. Unsupported shapes/proportions and failed loads retain an existing procedural shape or the original footprint. Door/actor/point-marker semantics take precedence over models. The remaining 14 object types use local procedural geometry; door-open remains a marker.
