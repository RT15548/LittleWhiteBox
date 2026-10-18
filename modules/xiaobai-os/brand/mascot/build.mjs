import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { outputRoot } from '../../../../scripts/build/output-root.mjs';
import { renderMascotSvg } from './svg.ts';

const directory = path.join(outputRoot, 'modules/xiaobai-os/brand/mascot');
await mkdir(directory, { recursive: true });
for (const [name, view] of [['portrait.svg', 'portrait'], ['mark.svg', 'mark']]) {
    await writeFile(path.join(directory, name), renderMascotSvg(view));
}
