'use strict';
const path = require('node:path');
const { runtimeId } = require('../../../dist/server/runtime.json');
const bundlePath = path.resolve(__dirname, '../../../dist/server', `runtime-${runtimeId}.cjs`);
module.exports = { bundlePath, bundle: require(bundlePath) };
