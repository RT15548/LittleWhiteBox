'use strict';

const { createHash, verify } = require('node:crypto');
const { open, realpath } = require('node:fs/promises');
const path = require('node:path');
const { Script } = require('node:vm');
const { builtinModules } = require('node:module');
const { publicKey: releasePublicKey } = require('./runtime-public-key.json');

const { RUNTIME_HOST_ABI } = require('./runtime-contract.js');
const MAX_RUNTIME_BYTES = 32 * 1024 * 1024;
const builtins = new Set(builtinModules.flatMap(name => [name, `node:${name}`]));
const failure = (code, message) => Object.assign(new Error(message), { code, status: 503 });

async function readBounded(filename, limit) {
    const file = await open(filename, 'r');
    try {
        const stat = await file.stat();
        if (!stat.isFile() || stat.size > limit) throw failure('runtime_integrity_invalid', 'Runtime artifact exceeds its size limit');
        const bytes = Buffer.alloc(stat.size + 1);
        let offset = 0;
        for (;;) {
            const { bytesRead } = await file.read(bytes, offset, bytes.length - offset, null);
            if (!bytesRead) break;
            offset += bytesRead;
            if (offset === bytes.length) throw failure('runtime_integrity_invalid', 'Runtime artifact changed during loading');
        }
        return bytes.subarray(0, offset);
    } finally { await file.close(); }
}

function assertExtensionId(value) {
    if (typeof value !== 'string' || !value || value.length > 128 || value === '.' || value === '..' || /[\\/:\0]/.test(value)) {
        throw failure('runtime_extension_invalid', 'Invalid extension directory identifier');
    }
    return value;
}

function compileVerifiedRuntime(bytes, filename) {
    const module = { exports: {} };
    // This is signed maintainer code, not a sandbox for user tools. Compile the
    // verified bytes themselves: require(filename) would reopen a mutable file.
    const wrapper = new Script(`(function(require,module,exports,__filename,__dirname){\n${bytes.toString('utf8')}\n})`, { filename }).runInThisContext();
    wrapper(name => {
        if (!builtins.has(name)) throw failure('runtime_dependency_invalid', 'Runtime must contain all package dependencies');
        return require(name);
    }, module, module.exports, filename, path.dirname(filename));
    if (module.exports.abi !== RUNTIME_HOST_ABI || typeof module.exports.createRuntime !== 'function') {
        throw failure('runtime_abi_invalid', 'Runtime host interface does not match');
    }
    return module.exports.createRuntime();
}

function createRuntimeLoader({ publicKey = releasePublicKey,
    globalExtensions = path.resolve(process.cwd(), 'public/scripts/extensions/third-party') } = {}) {
    const records = new Map();
    const selected = new Map();
    const pending = new Map();

    function prune(record) {
        if (record.references === 0 && ![...selected.values()].includes(record)) records.delete(record.id);
    }

    async function locate(req, extensionId) {
        const roots = [req.user?.directories?.extensions, globalExtensions].filter(Boolean);
        for (const base of roots) {
            let root;
            let directory;
            try {
                root = await realpath(base);
                directory = await realpath(path.join(root, extensionId));
            } catch (error) {
                if (error.code === 'ENOENT') continue;
                throw error;
            }
            if (!directory.startsWith(root + path.sep)) throw failure('runtime_extension_invalid', 'Extension directory escapes its installation root');
            const artifactRoot = await realpath(path.join(directory, 'dist/server'));
            if (!artifactRoot.startsWith(directory + path.sep)) throw failure('runtime_extension_invalid', 'Runtime directory escapes its extension');
            return artifactRoot;
        }
        throw failure('runtime_not_installed', 'Drawing runtime is not installed with the extension');
    }

    async function load(req, { extensionId = 'LittleWhiteBox', runtimeId } = {}) {
        assertExtensionId(extensionId);
        if (runtimeId !== undefined && !/^[a-f0-9]{64}$/.test(runtimeId)) throw failure('runtime_id_invalid', 'Invalid runtime content digest');
        const directory = await locate(req, extensionId);
        const scope = directory;
        const key = `${scope}\0${runtimeId || ''}`;
        if (pending.has(key)) return pending.get(key);
        const operation = (async () => {
            let descriptor;
            const manifest = await readBounded(path.join(directory, 'runtime.json'), 4096);
            try { descriptor = JSON.parse(manifest.toString('utf8')); }
            catch { throw failure('runtime_integrity_invalid', 'Runtime manifest is incomplete or invalid'); }
            if (descriptor.abi !== RUNTIME_HOST_ABI || !/^[a-f0-9]{64}$/.test(descriptor.runtimeId)
                || (runtimeId && descriptor.runtimeId !== runtimeId)) {
                throw failure('runtime_build_changed', 'Extension build changed; reload the page before submitting new work');
            }
            const signed = Buffer.from(JSON.stringify({ abi: descriptor.abi, runtimeId: descriptor.runtimeId }));
            if (!verify(null, signed, publicKey, Buffer.from(descriptor.signature || '', 'base64'))) {
                throw failure('runtime_signature_invalid', 'Drawing runtime signature is invalid');
            }
            const filename = await realpath(path.join(directory, `runtime-${descriptor.runtimeId}.cjs`));
            if (!filename.startsWith(directory + path.sep)) throw failure('runtime_extension_invalid', 'Runtime file escapes its extension');
            const bytes = await readBounded(filename, MAX_RUNTIME_BYTES);
            if (bytes.length > MAX_RUNTIME_BYTES || createHash('sha256').update(bytes).digest('hex') !== descriptor.runtimeId) {
                throw failure('runtime_integrity_invalid', 'Drawing runtime is incomplete or modified');
            }
            let record = records.get(descriptor.runtimeId);
            if (!record) {
                record = { id: descriptor.runtimeId, api: compileVerifiedRuntime(bytes, filename), references: 0,
                    retain() { this.references += 1; },
                    release() { this.references -= 1; prune(this); } };
                records.set(record.id, record);
            }
            const previous = selected.get(scope);
            selected.set(scope, record);
            if (previous && previous !== record) prune(previous);
            return record;
        })();
        pending.set(key, operation);
        try { return await operation; }
        finally { pending.delete(key); }
    }

    return { load, close() { selected.clear(); records.clear(); } };
}

module.exports = { RUNTIME_HOST_ABI, createRuntimeLoader };
