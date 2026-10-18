import fs from 'node:fs';
import path from 'node:path';
import { root } from './browser-entries.mjs';

export const stagedInputs = {
    name: 'staged-generated-inputs',
    setup(build) {
        build.onLoad({ filter: /\.(?:js|json)$/ }, args => {
            const relative = path.relative(root, args.path);
            if (!process.env.LWB_BUILD_STAGE || relative.startsWith('..') || path.isAbsolute(relative)) return;
            const staged = path.join(process.env.LWB_BUILD_STAGE, relative);
            if (fs.existsSync(staged)) return { contents: fs.readFileSync(staged, 'utf8'), loader: path.extname(staged).slice(1), resolveDir: path.dirname(args.path) };
        });
    },
};
