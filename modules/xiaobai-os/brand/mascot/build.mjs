import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { renderMascotSvg } from './svg.ts';

const check = process.argv.includes('--check');
for (const [name, view] of [['portrait.svg', 'portrait'], ['mark.svg', 'mark']]) {
    const path = fileURLToPath(new URL(name, import.meta.url));
    const expected = renderMascotSvg(view);
    if (check) {
        const actual = await readFile(path, 'utf8');
        if (actual !== expected) { throw new Error(`Mascot asset is stale: ${name}. Run node --import tsx modules/xiaobai-os/brand/mascot/build.mjs`); }
    } else {
        await writeFile(path, expected);
    }
}
