/* global process */
// Gold Eval - two-generation operational recovery points for long natural runs.

import fs from 'node:fs/promises';
import path from 'node:path';

import { sha256File } from './run-store.mjs';

const RETAINED_RECOVERY_POINTS = 2;

function toPosix(input) {
    return String(input || '').replace(/\\/g, '/');
}

function recoveryFileName(resumeFloor) {
    return `${String(resumeFloor).padStart(6, '0')}-natural-recovery.json`;
}

function validateWrittenRecovery(snapshot, { resumeFloor, messageCount, preparation }) {
    if (snapshot?.kind !== 'natural-operational-recovery') {
        throw new Error('natural recovery snapshot类型无效');
    }
    if (snapshot?.boundary?.resumeFloor !== resumeFloor
        || snapshot?.boundary?.historyThroughFloor !== resumeFloor
        || snapshot?.sample?.messageCount !== messageCount) {
        throw new Error(`natural recovery snapshot边界无效: floor=${resumeFloor}`);
    }
    const stored = snapshot?.recovery?.preparation;
    if (!stored || stored.externalCalls !== preparation.externalCalls
        || stored.externalRequests !== preparation.externalRequests
        || stored.transportTrace?.length !== preparation.transportTrace.length
        || stored.steps?.length !== preparation.steps.length) {
        throw new Error(`natural recovery preparation不完整: floor=${resumeFloor}`);
    }
}

async function pruneRecoveryDirectory(recoveryDir, keepPath) {
    const entries = (await fs.readdir(recoveryDir, { withFileTypes: true }))
        .filter(entry => entry.isFile() && entry.name.endsWith('-natural-recovery.json'))
        .sort((left, right) => right.name.localeCompare(left.name));
    const keepNames = new Set([
        path.basename(keepPath),
        ...entries.slice(0, RETAINED_RECOVERY_POINTS).map(entry => entry.name),
    ]);
    const orderedKeep = [...keepNames].sort((left, right) => right.localeCompare(left))
        .slice(0, RETAINED_RECOVERY_POINTS);
    const retained = new Set(orderedKeep);
    await Promise.all(entries
        .filter(entry => !retained.has(entry.name))
        .map(entry => fs.rm(path.join(recoveryDir, entry.name), { force: true })));
}

export async function persistNaturalRecoveryPoint({
    runStore,
    floor,
    visibleMessages,
    preparation,
    writeRecoverySnapshot,
}) {
    const resumeFloor = floor - 1;
    const messageCount = visibleMessages.length;
    if (!Number.isInteger(resumeFloor) || resumeFloor < 0 || messageCount !== resumeFloor + 1) {
        throw new Error(`natural recovery floor/messageCount不一致: floor=${floor} messages=${messageCount}`);
    }
    const snapshotPath = path.join(runStore.paths.recovery, recoveryFileName(resumeFloor));
    await writeRecoverySnapshot({
        snapshotPath,
        floor,
        resumeFloor,
        visibleMessages,
        preparation: structuredClone(preparation),
    });
    const snapshot = JSON.parse(await fs.readFile(snapshotPath, 'utf8'));
    validateWrittenRecovery(snapshot, { resumeFloor, messageCount, preparation });
    const recoveryPoint = {
        kind: 'natural-operational-recovery',
        path: toPosix(snapshotPath),
        sha256: await sha256File(snapshotPath),
        resumeFloor,
        messageCount,
        preparationExternalCalls: preparation.externalCalls,
        preparationExternalRequests: preparation.externalRequests,
        generatedAt: snapshot.generatedAt || new Date().toISOString(),
    };
    await runStore.recordRecoveryPoint(recoveryPoint);
    await pruneRecoveryDirectory(runStore.paths.recovery, snapshotPath);
    return recoveryPoint;
}

export async function importNaturalRecoveryPoint({ runStore, sourcePoint }) {
    if (sourcePoint?.kind !== 'natural-operational-recovery') {
        throw new Error('只能导入natural operational recovery');
    }
    const sourcePath = path.resolve(String(sourcePoint.snapshotPath || ''));
    const destination = path.join(runStore.paths.recovery, path.basename(sourcePath));
    const bytes = await fs.readFile(sourcePath);
    const tempPath = `${destination}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tempPath, bytes);
    await fs.rename(tempPath, destination);
    const copiedHash = await sha256File(destination);
    if (copiedHash !== sourcePoint.snapshotHash) {
        throw new Error('导入natural recovery hash不匹配');
    }
    const recoveryPoint = {
        kind: 'natural-operational-recovery',
        path: toPosix(destination),
        sha256: copiedHash,
        resumeFloor: sourcePoint.resumeFloor,
        messageCount: sourcePoint.messageCount,
        preparationExternalCalls: sourcePoint.preparation?.externalCalls || 0,
        preparationExternalRequests: sourcePoint.preparation?.externalRequests || 0,
        generatedAt: sourcePoint.generatedAt || new Date().toISOString(),
    };
    await runStore.recordRecoveryPoint(recoveryPoint);
    await pruneRecoveryDirectory(runStore.paths.recovery, destination);
    return recoveryPoint;
}
