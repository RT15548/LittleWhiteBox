import path from 'node:path';
import fs from 'node:fs';
import { root } from './browser-entries.mjs';

if (!process.env.LWB_BUILD_STAGE) throw Object.assign(new Error('Internal build step: run npm run build or npm run check.'), { code: 'BUILD_STAGE_REQUIRED' });
export const outputRoot = fs.realpathSync(process.env.LWB_BUILD_STAGE);
const relative = path.relative(fs.realpathSync(path.join(root, 'output')), outputRoot);
if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw Object.assign(new Error('Build staging must be a child of plugin output/'), { code: 'BUILD_STAGE_OUTSIDE_OUTPUT' });
