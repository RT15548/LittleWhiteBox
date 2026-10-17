#!/usr/bin/env node
// Authoring step: write a NEW candidate directory, never alter source assets in place.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import validator from 'gltf-validator';
import { optimizeGlb, parseGlb, sha256 } from './island-glb-lossless.mjs';
import { compressGlbLosslessly, semanticSnapshot, viewBytes } from './island-glb-meshopt.mjs';

async function localImage(directory, uri) {
    assert(!/^[a-z][a-z\d+.-]*:|^[/\\]/i.test(uri), 'Only relative image URIs');
    const file = path.resolve(directory, decodeURIComponent(uri));
    assert(file.startsWith(directory + path.sep), 'Image must remain inside candidate directory');
    return fs.readFile(file);
}
async function validate(bytes, directory) {
    const report = await validator.validateBytes(new Uint8Array(bytes), {
        maxIssues: 100000, externalResourceFunction: uri => localImage(directory, uri),
    });
    assert(!report.issues.truncated, 'Validator output truncated');
    return {
        errors: report.issues.numErrors, warnings: report.issues.numWarnings, infos: report.issues.numInfos,
        warningCodes: report.issues.messages.filter(issue => issue.severity === 1).map(issue => issue.code).sort(),
    };
}
async function prospectiveRealPath(directory) {
    let ancestor = path.resolve(directory); const missing = [];
    for (;;) {
        try { return path.join(await fs.realpath(ancestor), ...missing); }
        catch (error) {
            if (error.code !== 'ENOENT') throw error;
            const parent = path.dirname(ancestor); assert(parent !== ancestor, 'No existing output ancestor');
            missing.unshift(path.basename(ancestor)); ancestor = parent;
        }
    }
}
function assertSeparate(source, output) {
    const a = process.platform === 'win32' ? source.toLowerCase() : source;
    const b = process.platform === 'win32' ? output.toLowerCase() : output;
    assert(a !== b && !b.startsWith(a + path.sep) && !a.startsWith(b + path.sep), 'Use a separate new output directory');
}
export async function optimizeCharacterDirectory(sourceDirectory, outputDirectory) {
    const source = await fs.realpath(sourceDirectory), output = path.resolve(outputDirectory);
    // Existing junctions/symlinks are resolved BEFORE creating anything.
    assertSeparate(source, await prospectiveRealPath(output));
    const files = (await fs.readdir(source)).filter(file => file.endsWith('.glb')).sort();
    assert(files.length > 0, 'No original GLBs');
    const inputs = [], images = new Map();
    for (const file of files) {
        const bytes = await fs.readFile(path.join(source, file)), document = parseGlb(bytes);
        inputs.push({ file, bytes, document });
        for (const image of document.json.images ?? []) {
            const data = viewBytes(document, image.bufferView), key = sha256(data), entry = images.get(key);
            if (entry) { assert(entry.bytes.equals(data), 'Image hash collision'); entry.references++; }
            else images.set(key, { bytes: Buffer.from(data), references: 1 });
        }
    }
    await fs.mkdir(path.dirname(output), { recursive: true });
    await fs.mkdir(output); // Intentionally fail rather than overwriting or mixing previous outputs.
    assertSeparate(source, await fs.realpath(output));
    const sharedImageHashes = new Set([...images].filter(([, entry]) => entry.references > 1).map(([hash]) => hash));
    const sharedFiles = new Map(), models = [];
    for (const { file, bytes, document } of inputs) {
        const outputGlbPath = path.join(output, file);
        const clean = optimizeGlb(bytes, { sharedImageHashes, outputGlbPath, sharedDir: path.join(output, 'shared') });
        for (const image of clean.sharedImages) {
            const previous = sharedFiles.get(image.path);
            if (previous) { assert(previous.equals(image.bytes), 'Shared path collision'); continue; }
            await fs.mkdir(path.dirname(image.path), { recursive: true });
            await fs.writeFile(image.path, image.bytes, { flag: 'wx' }); sharedFiles.set(image.path, image.bytes);
        }
        const readImage = uri => localImage(output, uri), original = await semanticSnapshot(bytes, readImage);
        assert.deepEqual(await semanticSnapshot(clean.glb, readImage), original, `${file}: clean semantics`);
        const encoded = await compressGlbLosslessly(clean.glb);
        assert.deepEqual(await semanticSnapshot(encoded.decodedGlb, readImage), original, `${file}: decoded semantics`);
        const originalValidation = await validate(bytes, source), decodedValidation = await validate(encoded.decodedGlb, output);
        assert.equal(originalValidation.errors, 0, `${file}: original validation errors`);
        assert.equal(decodedValidation.errors, 0, `${file}: decoded validation errors`);
        assert.deepEqual(decodedValidation.warningCodes, originalValidation.warningCodes, `${file}: new validation warnings`);
        assert(encoded.glb.length <= clean.glb.length, `${file}: encoded output expanded`);
        await fs.writeFile(outputGlbPath, encoded.glb, { flag: 'wx' });
        models.push({
            file, originalBytes: bytes.length, cleanBytes: clean.glb.length, outputBytes: encoded.glb.length,
            originalHash: sha256(bytes), outputHash: sha256(encoded.glb), compressedViews: encoded.compressedViews,
            clips: (document.json.animations ?? []).map(animation => ({ name: animation.name, channels: animation.channels.length })),
            cleanup: clean.stats, validation: { original: originalValidation, decoded: decodedValidation },
        });
    }
    // Source verification occurs again after all processing: this step is never in-place.
    for (const model of models) assert.equal(sha256(await fs.readFile(path.join(source, model.file))), model.originalHash);
    const shared = [...sharedFiles].map(([file, bytes]) => ({ file: path.relative(output, file).split(path.sep).join('/'), bytes: bytes.length, sha256: sha256(bytes) }));
    const sharedBytes = shared.reduce((sum, image) => sum + image.bytes, 0);
    const report = {
        codec: { encoder: 'meshoptimizer@1.3.0 / v0', decoder: 'three bundled MeshoptDecoder', filter: 'NONE', indexMode: 'INDICES' },
        source, models, shared,
        originalBytes: models.reduce((sum, model) => sum + model.originalBytes, 0),
        outputGlbBytes: models.reduce((sum, model) => sum + model.outputBytes, 0), sharedBytes,
        totalOutputBytes: models.reduce((sum, model) => sum + model.outputBytes, sharedBytes),
        guarantees: ['Exact decoded bufferView bytes', 'Preserved semantic scene/skin/material/image/animation references', 'No quantization, simplification or removed animation channels', 'Source files unchanged'],
        limitations: ['Requires runtime MeshoptDecoder', 'Does not certify visual quality, mobile compatibility or rendering performance', 'Size includes shared images but not runtime decoder bundle overhead'],
    };
    await fs.writeFile(path.join(output, 'asset-report.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
    return report;
}
async function main() {
    const { values } = parseArgs({ options: { source: { type: 'string' }, output: { type: 'string' } } });
    assert(values.source && values.output, 'Usage: node scripts/optimize-island-characters.mjs --source ORIGINAL_EXPORT_DIR --output NEW_CANDIDATE_DIR');
    const report = await optimizeCharacterDirectory(values.source, values.output);
    console.log(JSON.stringify({ models: report.models.length, originalBytes: report.originalBytes, outputGlbBytes: report.outputGlbBytes,
        sharedBytes: report.sharedBytes, totalOutputBytes: report.totalOutputBytes }, null, 2));
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    main().catch(error => { console.error(error); process.exitCode = 1; });
}
