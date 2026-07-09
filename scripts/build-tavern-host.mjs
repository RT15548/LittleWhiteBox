import { build } from 'esbuild';

await build({
    entryPoints: [
        'modules/tavern/tavern.ts',
        'modules/tavern/host/agent-config.ts',
        'modules/tavern/host/chat-presets.ts',
        'modules/tavern/host/regex.ts',
        'modules/tavern/host/native-prompt.ts',
        'modules/tavern/host/sillytavern-context.ts',
        'modules/tavern/host/slash-commands.ts',
        'modules/tavern/host/substitute-params.ts',
        'modules/tavern/host/display-settings.ts',
        'modules/tavern/host/users.ts',
        'modules/tavern/host/worldbooks.ts',
        'modules/tavern/shared/message-assembler.ts',
        'modules/tavern/shared/settings.ts',
    ],
    outbase: 'modules/tavern',
    outdir: 'modules/tavern',
    format: 'esm',
    target: 'es2022',
    bundle: false,
    sourcemap: false,
    banner: {
        js: '/* eslint-disable -- generated from TypeScript source; run npm run build:tavern */',
    },
});
