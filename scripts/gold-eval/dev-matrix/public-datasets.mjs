/* global process, Buffer */
// Download and adapt official LongMemEval / LoCoMo data without model calls.

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { get as httpsGet } from 'node:https';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { HttpsProxyAgent } from 'https-proxy-agent';

import { validateCase } from '../lib/cases.mjs';

const LONGMEMEVAL_REVISION = '98d7416c24c778c2fee6e6f3006e7a073259d48f';
const LONGMEMEVAL_BASE = `https://huggingface.co/datasets/xiaowu0162/longmemeval-cleaned/resolve/${LONGMEMEVAL_REVISION}`;
const LONGMEMEVAL_ORACLE_URL = `${LONGMEMEVAL_BASE}/longmemeval_oracle.json`;
const LONGMEMEVAL_S_URL = `${LONGMEMEVAL_BASE}/longmemeval_s_cleaned.json`;
const LOCOMO_REVISION = '3eb6f2c585f5e1699204e3c3bdf7adc5c28cb376';
const LOCOMO_URL = `https://raw.githubusercontent.com/snap-research/locomo/${LOCOMO_REVISION}/data/locomo10.json`;

function proxyAgent() {
    const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;
    return proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
}

function openDownload(url, redirectsLeft = 5) {
    return new Promise((resolve, reject) => {
        const request = httpsGet(url, { agent: proxyAgent() }, response => {
            const status = Number(response.statusCode || 0);
            const location = response.headers.location;
            if (status >= 300 && status < 400 && location) {
                response.resume();
                if (redirectsLeft <= 0) {
                    reject(new Error(`下载重定向过多: ${url}`));
                    return;
                }
                openDownload(new URL(location, url), redirectsLeft - 1).then(resolve, reject);
                return;
            }
            if (status < 200 || status >= 300) {
                response.resume();
                reject(new Error(`下载失败 ${status}: ${url}`));
                return;
            }
            resolve(response);
        });
        request.setTimeout(30_000, () => request.destroy(new Error(`下载连接超时: ${url}`)));
        request.once('error', reject);
    });
}

function sha256(value) {
    return createHash('sha256').update(value).digest('hex');
}

async function sha256File(filePath) {
    const hash = createHash('sha256');
    await pipeline(fs.createReadStream(filePath), hash);
    return hash.digest('hex');
}

async function writeAtomic(filePath, content) {
    const temp = path.join(path.dirname(filePath), `.${path.basename(filePath)}.${process.pid}.tmp`);
    await fsp.mkdir(path.dirname(filePath), { recursive: true });
    await fsp.writeFile(temp, content);
    await fsp.rename(temp, filePath);
}

async function downloadFile(url, filePath) {
    try {
        const stat = await fsp.stat(filePath);
        if (stat.isFile() && stat.size > 0) {
            return { path: filePath, bytes: stat.size, sha256: await sha256File(filePath), reused: true };
        }
    } catch {}
    const response = await openDownload(url);
    const temp = `${filePath}.${process.pid}.download`;
    await fsp.mkdir(path.dirname(filePath), { recursive: true });
    try {
        await pipeline(response, fs.createWriteStream(temp, { flags: 'wx' }));
        await fsp.rename(temp, filePath);
    } catch (error) {
        await fsp.rm(temp, { force: true });
        throw error;
    }
    const stat = await fsp.stat(filePath);
    return {
        path: filePath,
        bytes: stat.size,
        sha256: await sha256File(filePath),
        reused: false,
        headers: {
            repoCommit: response.headers['x-repo-commit'] || null,
            etag: response.headers.etag || null,
        },
    };
}

export async function* streamJsonArray(filePath) {
    const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
    let collecting = false;
    let depth = 0;
    let inString = false;
    let escaped = false;
    let buffer = '';
    for await (const chunk of stream) {
        for (const char of chunk) {
            if (!collecting) {
                if (char === '{') {
                    collecting = true;
                    depth = 1;
                    buffer = '{';
                    inString = false;
                    escaped = false;
                }
                continue;
            }
            buffer += char;
            if (inString) {
                if (escaped) escaped = false;
                else if (char === '\\') escaped = true;
                else if (char === '"') inString = false;
                continue;
            }
            if (char === '"') inString = true;
            else if (char === '{') depth++;
            else if (char === '}') {
                depth--;
                if (depth === 0) {
                    yield JSON.parse(buffer);
                    collecting = false;
                    buffer = '';
                }
            }
        }
    }
    if (collecting || depth !== 0 || inString) throw new Error(`JSON 顶层数组截断: ${filePath}`);
}

function longMemStratum(item) {
    const id = String(item?.question_id || '');
    const type = String(item?.question_type || '');
    if (id.endsWith('_abs')) return 'abstention';
    if (type === 'knowledge-update') return 'update';
    if (type === 'temporal-reasoning') return 'temporal';
    if (type === 'multi-session') return 'multi-session';
    if (type.startsWith('single-session-')) return 'extraction';
    return null;
}

export function selectLongMemEvalIds(metadata, { perStratum, offset = 0 }) {
    const groups = new Map();
    for (const item of metadata) {
        const stratum = longMemStratum(item);
        if (!stratum) continue;
        if (!groups.has(stratum)) groups.set(stratum, []);
        groups.get(stratum).push({
            id: String(item.question_id),
            order: sha256(`lwb-longmemeval-v1:${item.question_id}`),
        });
    }
    const selected = new Set();
    const counts = {};
    for (const stratum of ['extraction', 'multi-session', 'update', 'temporal', 'abstention']) {
        const rows = (groups.get(stratum) || []).sort((a, b) => a.order.localeCompare(b.order));
        const chosen = rows.slice(offset, offset + perStratum);
        if (chosen.length !== perStratum) throw new Error(`${stratum} 样本不足: ${chosen.length}/${perStratum}`);
        for (const row of chosen) selected.add(row.id);
        counts[stratum] = chosen.length;
    }
    return { selected, counts };
}

function toMessage({ role, content }, date, index) {
    const isUser = String(role || '').toLowerCase() === 'user';
    return {
        name: isUser ? 'User' : 'Assistant',
        is_user: isUser,
        is_system: false,
        send_date: String(date || ''),
        mes: `${index === 0 && date ? `[${date}]\n` : ''}${String(content || '')}`,
    };
}

function longMemCategory(item) {
    const stratum = longMemStratum(item);
    return {
        extraction: 'fact',
        'multi-session': 'associative',
        update: 'update',
        temporal: 'temporal',
        abstention: 'abstention',
    }[stratum];
}

export function adaptLongMemEvalItem(item, datasetId) {
    const sessions = (item.haystack_sessions || []).map((turns, index) => ({
        id: String(item.haystack_session_ids?.[index] ?? index),
        date: String(item.haystack_dates?.[index] || ''),
        turns: turns || [],
        index,
    })).sort((a, b) => {
        const ta = Date.parse(a.date);
        const tb = Date.parse(b.date);
        if (Number.isFinite(ta) && Number.isFinite(tb) && ta !== tb) return ta - tb;
        return a.index - b.index;
    });
    const messages = [];
    const evidenceFloors = [];
    const sessionFloorRanges = {};
    for (const session of sessions) {
        const start = messages.length;
        session.turns.forEach((turn, index) => {
            messages.push(toMessage(turn, session.date, index));
            if (turn?.has_answer === true) evidenceFloors.push(messages.length - 1);
        });
        sessionFloorRanges[session.id] = { start, end: messages.length - 1 };
    }
    const category = longMemCategory(item);
    if (!category) throw new Error(`不支持的 LongMemEval 类型: ${item.question_type}`);
    if (category !== 'abstention' && evidenceFloors.length === 0) {
        throw new Error(`LongMemEval 非 abstention 缺 has_answer floor: ${item.question_id}`);
    }
    const expectedAnswer = category === 'abstention'
        ? { type: 'abstain' }
        : { type: 'llm-judge', reference: String(item.answer || '') };
    const rawCase = {
        id: `longmemeval-${item.question_id}`,
        dataset: datasetId,
        split: 'dev',
        category,
        atFloor: messages.length - 1,
        query: String(item.question || ''),
        expectedAnswer,
        evidence: {
            requiredAll: category === 'abstention' ? [] : evidenceFloors,
            requiredAny: [],
            supporting: [],
            forbiddenAsCurrent: [],
        },
        provenance: {
            method: 'official-longmemeval-cleaned-adapter-v1',
            verifier: 'official-answer-and-has_answer',
            status: 'accepted',
        },
        notes: `question_type=${item.question_type}; answer_session_ids=${JSON.stringify(item.answer_session_ids || [])}`,
    };
    const validated = validateCase(rawCase);
    if (!validated.ok) throw new Error(validated.errors.join('\n'));
    return {
        id: String(item.question_id),
        clusterId: String(item.question_id),
        metadata: {
            chat_metadata: { integrity: `longmemeval-${item.question_id}` },
            user_name: 'User',
            character_name: 'Assistant',
        },
        messages,
        case: validated.case,
        official: {
            questionType: item.question_type,
            questionDate: item.question_date,
            answerSessionIds: item.answer_session_ids || [],
            sessionFloorRanges,
        },
    };
}

async function collectLongMemMetadata(filePath) {
    const metadata = [];
    for await (const item of streamJsonArray(filePath)) {
        metadata.push({ question_id: item.question_id, question_type: item.question_type });
    }
    return metadata;
}

async function buildLongMemCatalog(filePath, selectedIds, datasetId) {
    const items = [];
    for await (const item of streamJsonArray(filePath)) {
        if (selectedIds.has(String(item.question_id))) items.push(adaptLongMemEvalItem(item, datasetId));
    }
    items.sort((a, b) => a.id.localeCompare(b.id));
    if (items.length !== selectedIds.size) throw new Error(`${datasetId} 选中 ${selectedIds.size} 但只适配 ${items.length}`);
    return items;
}

function locomoCategory(value) {
    return { 1: 'fact', 2: 'temporal', 3: 'associative', 5: 'abstention' }[Number(value)] || null;
}

function flattenLocomoConversation(conversation) {
    const speakerA = String(conversation.speaker_a || 'Speaker A');
    const speakerB = String(conversation.speaker_b || 'Speaker B');
    const sessions = Object.keys(conversation)
        .map(key => key.match(/^session_(\d+)$/)?.[1])
        .filter(Boolean)
        .map(Number)
        .sort((a, b) => a - b);
    const messages = [];
    const floorByEvidenceId = {};
    for (const sessionNo of sessions) {
        const date = String(conversation[`session_${sessionNo}_date_time`] || '');
        const turns = conversation[`session_${sessionNo}`] || [];
        for (const [index, turn] of turns.entries()) {
            const speaker = String(turn?.speaker || '');
            const isUser = speaker === speakerA;
            messages.push({
                name: speaker || (isUser ? speakerA : speakerB),
                is_user: isUser,
                is_system: false,
                send_date: date,
                mes: `${index === 0 && date ? `[${date}]\n` : ''}${String(turn?.text || '')}`,
            });
            if (turn?.dia_id) floorByEvidenceId[String(turn.dia_id)] = messages.length - 1;
        }
    }
    return { speakerA, speakerB, messages, floorByEvidenceId };
}

export function selectLocomoQuestions(conversations, perCategory = 25) {
    const groups = new Map();
    for (const conversation of conversations) {
        const clusterId = String(conversation.sample_id);
        for (const question of conversation.qa || []) {
            const category = locomoCategory(question.category);
            if (!category) continue;
            const officialEvidence = Array.isArray(question.evidence)
                ? question.evidence.map(String).filter(Boolean)
                : [];
            if (category !== 'abstention' && officialEvidence.length === 0) continue;
            if (!groups.has(category)) groups.set(category, new Map());
            const byCluster = groups.get(category);
            if (!byCluster.has(clusterId)) byCluster.set(clusterId, []);
            byCluster.get(clusterId).push({
                conversation,
                question,
                order: sha256(`lwb-locomo-v1:${clusterId}:${question.question}:${JSON.stringify(question.evidence || [])}`),
            });
        }
    }
    const selected = [];
    for (const category of ['fact', 'temporal', 'associative', 'abstention']) {
        const byCluster = groups.get(category) || new Map();
        const queues = [...byCluster.entries()]
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([clusterId, rows]) => ({ clusterId, rows: rows.sort((a, b) => a.order.localeCompare(b.order)) }));
        let cursor = 0;
        while (selected.filter(item => item.category === category).length < perCategory) {
            let added = false;
            for (const queue of queues) {
                const row = queue.rows[cursor];
                if (!row) continue;
                selected.push({ ...row, category, clusterId: queue.clusterId });
                added = true;
                if (selected.filter(item => item.category === category).length === perCategory) break;
            }
            if (!added) throw new Error(`LoCoMo ${category} 样本不足`);
            cursor++;
        }
    }
    return selected;
}

export function buildLocomoCatalog(conversations, perCategory = 25) {
    const selected = selectLocomoQuestions(conversations, perCategory);
    const flattened = new Map(conversations.map(conversation => [
        String(conversation.sample_id),
        flattenLocomoConversation(conversation.conversation || {}),
    ]));
    const clusters = [...flattened.entries()].map(([clusterId, item]) => ({
        clusterId,
        metadata: {
            chat_metadata: { integrity: `locomo-${clusterId}` },
            user_name: item.speakerA,
            character_name: item.speakerB,
        },
        messages: item.messages,
    }));
    const cases = selected.map(item => {
        const flat = flattened.get(item.clusterId);
        const category = item.category;
        const evidenceIds = (item.question.evidence || []).map(String);
        const evidenceFloors = evidenceIds.map(id => flat.floorByEvidenceId[id]);
        if (category !== 'abstention' && evidenceFloors.some(floor => !Number.isInteger(floor))) {
            throw new Error(`LoCoMo evidence id 无楼层映射: ${item.clusterId} ${evidenceIds.join(',')}`);
        }
        const rawCase = {
            id: `locomo-${item.clusterId}-${sha256(`${item.question.question}:${JSON.stringify(evidenceIds)}`).slice(0, 12)}`,
            dataset: 'locomo10-dev-v1',
            split: 'dev',
            category,
            atFloor: flat.messages.length - 1,
            query: String(item.question.question || ''),
            expectedAnswer: category === 'abstention'
                ? { type: 'abstain' }
                : { type: 'llm-judge', reference: String(item.question.answer ?? '') },
            evidence: {
                requiredAll: category === 'abstention' ? [] : evidenceFloors,
                requiredAny: [],
                supporting: [],
                forbiddenAsCurrent: [],
            },
            provenance: {
                method: 'official-locomo-adapter-v1',
                verifier: 'official-answer-and-evidence',
                status: 'accepted',
            },
            notes: `cluster=${item.clusterId}; official_category=${item.question.category}; evidence=${JSON.stringify(evidenceIds)}`,
        };
        const validated = validateCase(rawCase);
        if (!validated.ok) throw new Error(validated.errors.join('\n'));
        return { clusterId: item.clusterId, case: validated.case, officialEvidenceIds: evidenceIds };
    });
    return { clusters, cases };
}

async function writeCatalog(outputDir, name, catalog, source) {
    const catalogText = `${JSON.stringify(catalog)}\n`;
    const catalogPath = path.join(outputDir, `${name}-catalog.json`);
    await writeAtomic(catalogPath, catalogText);
    const manifest = {
        schemaVersion: 1,
        dataset: name,
        source,
        catalog: {
            path: catalogPath.replace(/\\/g, '/'),
            sha256: sha256(catalogText),
            bytes: Buffer.byteLength(catalogText),
        },
    };
    const manifestText = `${JSON.stringify(manifest, null, 2)}\n`;
    const manifestPath = path.join(outputDir, `${name}-manifest.json`);
    await writeAtomic(manifestPath, manifestText);
    return {
        ...manifest,
        manifest: {
            path: manifestPath.replace(/\\/g, '/'),
            sha256: sha256(manifestText),
            bytes: Buffer.byteLength(manifestText),
        },
    };
}

export async function preparePublicDatasets(outputDir) {
    const rawDir = path.join(outputDir, 'raw');
    const oracleRaw = await downloadFile(LONGMEMEVAL_ORACLE_URL, path.join(rawDir, 'longmemeval_oracle.json'));
    const stressRaw = await downloadFile(LONGMEMEVAL_S_URL, path.join(rawDir, 'longmemeval_s_cleaned.json'));
    const locomoRaw = await downloadFile(LOCOMO_URL, path.join(rawDir, 'locomo10.json'));

    const [oracleMetadata, stressMetadata] = await Promise.all([
        collectLongMemMetadata(oracleRaw.path),
        collectLongMemMetadata(stressRaw.path),
    ]);
    const oracleSelection = selectLongMemEvalIds(oracleMetadata, { perStratum: 20, offset: 0 });
    const stressSelection = selectLongMemEvalIds(stressMetadata, { perStratum: 5, offset: 20 });
    const [oracleItems, stressItems, locomoText] = await Promise.all([
        buildLongMemCatalog(oracleRaw.path, oracleSelection.selected, 'longmemeval-oracle-dev-v1'),
        buildLongMemCatalog(stressRaw.path, stressSelection.selected, 'longmemeval-s-stress-dev-v1'),
        fsp.readFile(locomoRaw.path, 'utf8'),
    ]);
    const locomoConversations = JSON.parse(locomoText);
    const locomoCatalog = buildLocomoCatalog(locomoConversations, 25);

    const rawSource = item => ({
        url: item === oracleRaw ? LONGMEMEVAL_ORACLE_URL : (item === stressRaw ? LONGMEMEVAL_S_URL : LOCOMO_URL),
        revision: item === locomoRaw ? LOCOMO_REVISION : LONGMEMEVAL_REVISION,
        raw: {
            path: item.path.replace(/\\/g, '/'),
            sha256: item.sha256,
            bytes: item.bytes,
        },
    });
    const oracle = await writeCatalog(outputDir, 'longmemeval-oracle-v1', {
        selection: { seed: 'lwb-longmemeval-v1', perStratum: 20, offset: 0, counts: oracleSelection.counts },
        items: oracleItems,
    }, rawSource(oracleRaw));
    const stress = await writeCatalog(outputDir, 'longmemeval-s-stress-v1', {
        selection: { seed: 'lwb-longmemeval-v1', perStratum: 5, offset: 20, counts: stressSelection.counts },
        items: stressItems,
    }, rawSource(stressRaw));
    const locomo = await writeCatalog(outputDir, 'locomo10-v1', {
        selection: { seed: 'lwb-locomo-v1', includedCategories: [1, 2, 3, 5], perCategory: 25 },
        ...locomoCatalog,
    }, rawSource(locomoRaw));
    const index = {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        network: 'public dataset download only; no model API',
        datasets: [oracle, stress, locomo],
    };
    const indexText = `${JSON.stringify(index, null, 2)}\n`;
    const indexPath = path.join(outputDir, 'manifest.json');
    await writeAtomic(indexPath, indexText);
    return {
        ...index,
        manifest: {
            path: indexPath.replace(/\\/g, '/'),
            sha256: sha256(indexText),
            bytes: Buffer.byteLength(indexText),
        },
    };
}

async function main() {
    const outputArg = process.argv.slice(2).find(item => item.startsWith('--output='));
    const outputDir = outputArg ? outputArg.slice('--output='.length) : process.argv[2];
    if (!outputDir) throw new Error('用法: public-datasets.mjs <output-directory>');
    const result = await preparePublicDatasets(path.resolve(outputDir));
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
    main().catch(error => {
        process.stderr.write(`${error?.stack || error}\n`);
        process.exitCode = 1;
    });
}
