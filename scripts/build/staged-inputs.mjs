import fs from 'node:fs';
import path from 'node:path';
import { root } from './browser-entries.mjs';

export const stagedInputs = {
    name: 'staged-generated-inputs',
    setup(build) {
        build.onResolve({ filter: /^\./ }, args => {
            if (!process.env.LWB_BUILD_STAGE) return;
            const absolute = path.resolve(args.resolveDir, args.path);
            const relative = path.relative(root, absolute);
            if (relative.startsWith('..') || path.isAbsolute(relative) || fs.existsSync(absolute)) return;
            const staged = path.join(process.env.LWB_BUILD_STAGE, relative);
            if (fs.existsSync(staged)) return { path: staged };
        });
        build.onLoad({ filter: /\.(?:c?js|json)$/ }, args => {
            const relative = path.relative(root, args.path);
            if (!process.env.LWB_BUILD_STAGE || relative.startsWith('..') || path.isAbsolute(relative)) return;
            const staged = path.join(process.env.LWB_BUILD_STAGE, relative);
            if (fs.existsSync(staged)) return { contents: fs.readFileSync(staged, 'utf8'), loader: path.extname(staged) === '.json' ? 'json' : 'js', resolveDir: path.dirname(args.path) };
        });
    },
};
