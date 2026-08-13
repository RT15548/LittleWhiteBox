/* global process */
// Gold Eval study control plane CLI.

import path from 'node:path';

import {
    advanceStudy,
    auditStudy,
    loadStudy,
    renderStudyStatus,
    writeStudyStatus,
} from './study/store.mjs';

function readFlag(argv, name) {
    const prefix = `--${name}=`;
    const item = argv.find(value => value.startsWith(prefix));
    return item ? item.slice(prefix.length) : null;
}

function requireFlag(argv, name) {
    const value = readFlag(argv, name);
    if (!value) throw new Error(`缺少 --${name}=...`);
    return value;
}

async function main() {
    const argv = process.argv.slice(2);
    const command = String(argv[0] || 'status').toLowerCase();
    const studyPath = path.resolve(readFlag(argv, 'study') || String(argv[1] || '').trim() || requireFlag(argv, 'study'));
    const loaded = await loadStudy(studyPath);

    if (command === 'advance') {
        const result = await advanceStudy(studyPath, {
            expectedHash: readFlag(argv, 'expected-hash') || String(argv[2] || '').trim() || requireFlag(argv, 'expected-hash'),
            expectedPhase: readFlag(argv, 'expected-phase') || String(argv[3] || '').trim() || requireFlag(argv, 'expected-phase'),
            toPhase: readFlag(argv, 'to-phase') || String(argv[4] || '').trim() || requireFlag(argv, 'to-phase'),
            nextAction: readFlag(argv, 'next-action') || String(argv[5] || '').trim() || requireFlag(argv, 'next-action'),
        });
        process.stdout.write(`${JSON.stringify({ phase: result.study.phase, hash: result.hash }, null, 2)}\n`);
        return;
    }

    const audit = await auditStudy(loaded.study);
    if (command === 'audit') {
        process.stdout.write(`${JSON.stringify({ studyHash: loaded.hash, ...audit }, null, 2)}\n`);
    } else if (command === 'next') {
        if (!audit.ok) throw new Error('study audit 未通过，禁止执行下一步');
        process.stdout.write(`${JSON.stringify({
            studyId: loaded.study.studyId,
            phase: loaded.study.phase,
            hypothesisId: loaded.study.active.hypothesisId,
            nextAction: loaded.study.active.nextAction,
        }, null, 2)}\n`);
    } else if (command === 'status') {
        const statusPath = readFlag(argv, 'write-status') || String(argv[2] || '').trim();
        if (statusPath) {
            const written = await writeStudyStatus(path.resolve(statusPath), loaded.study, audit, { studyHash: loaded.hash });
            process.stdout.write(`${written}\n`);
        } else {
            process.stdout.write(renderStudyStatus(loaded.study, audit, { studyHash: loaded.hash }));
        }
    } else {
        throw new Error(`未知命令: ${command}。可用: audit | status | next | advance`);
    }

    if (!audit.ok) process.exitCode = 2;
}

main().catch(error => {
    process.stderr.write(`${error?.stack || error}\n`);
    process.exitCode = 1;
});
