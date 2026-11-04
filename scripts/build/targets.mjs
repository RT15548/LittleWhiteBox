export const generators = [
    'modules/xiaobai-os/brand/mascot/build.mjs',
    'scripts/build-server-plugin.mjs',
    'scripts/build-novelai-vendor.mjs',
    'scripts/build-agent-core-node.mjs',
    'scripts/build-sha256-vendor.mjs',
    'scripts/build-material-symbols-names.mjs',
    'scripts/build-assistant-jsapi-manifest.mjs',
];
export const checks = [
    ['node', ['scripts/typecheck.mjs']],
];
