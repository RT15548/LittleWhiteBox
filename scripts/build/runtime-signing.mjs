import { createHash, createPrivateKey, createPublicKey, generateKeyPairSync, sign, verify } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import hostContract from '../../server-plugin/littlewhitebox-server/runtime-contract.js';

export const releaseKeyPath = () => process.env.LWB_RUNTIME_SIGNING_KEY || resolve(homedir(), '.config/littlewhitebox/runtime-release-key.pem');

// Explicit maintainer setup, never called by a user's build/check or server.
export async function provisionReleaseKey() {
    const path = releaseKeyPath();
    await mkdir(dirname(path), { recursive: true });
    let pem;
    try {
        pem = await readFile(path, 'utf8');
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        pem = generateKeyPairSync('ed25519').privateKey.export({ type: 'pkcs8', format: 'pem' });
        await writeFile(path, pem, { flag: 'wx', mode: 0o600 });
    }
    return createPublicKey(pem).export({ type: 'spki', format: 'pem' });
}

export function runtimeDescriptor(bytes) {
    return { abi: hostContract.RUNTIME_HOST_ABI, runtimeId: createHash('sha256').update(bytes).digest('hex') };
}

export async function signRuntime(bytes, publicKey, existing) {
    const descriptor = runtimeDescriptor(bytes);
    const message = Buffer.from(JSON.stringify(descriptor));
    if (existing?.runtimeId === descriptor.runtimeId && existing.abi === descriptor.abi
        && verify(null, message, publicKey, Buffer.from(existing.signature || '', 'base64'))) return existing;
    if (process.env.LWB_BUILD_CHECK === '1') throw new Error('Runtime differs from the signed release; build and sign before checking.');
    const privateKey = createPrivateKey(await readFile(releaseKeyPath(), 'utf8'));
    const signature = sign(null, message, privateKey).toString('base64');
    if (!verify(null, message, publicKey, Buffer.from(signature, 'base64'))) throw new Error('Runtime signing key does not match the installed public key.');
    return { ...descriptor, signature };
}
