#!/usr/bin/env node
/**
 * scrape-danbooru-chars.js — 抓取 Danbooru top N 角色标签 + 关联外貌 tag
 *
 * Usage:
 *   node scrape-danbooru-chars.js --test     # 只拉 1 页角色，取前 3 个拉外貌 tag
 *   node scrape-danbooru-chars.js            # 全量 7000 角色 + 外貌 tag → .json + .dat
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Config ───────────────────────────────────────────────────
const API_BASE = 'https://danbooru.donmai.us';
const CATEGORY_CHARACTER = 4;
const PER_PAGE = 1000;
const TOTAL_PAGES = 7;
const PAGE_DELAY = 300;
const TAG_DELAY = 130;       // ~7.5 req/s, safe under 10 req/s limit
const CONCURRENCY = 5;       // 并发数（5 × ~7.5 ≈ 有效 ~8-9 req/s，留余量）
const FREQ_THRESHOLD = 0.35;
const MAX_TAGS_PER_CHAR = 20;

const OUTPUT_DIR = join(__dirname, '..', 'modules', 'novel-draw', 'data');
const OUTPUT_JSON = join(OUTPUT_DIR, 'danbooru-chars.json');
const OUTPUT_DAT = join(OUTPUT_DIR, 'danbooru-chars.dat');
const CHECKPOINT = join(OUTPUT_DIR, '_checkpoint.json');

const isTest = process.argv.includes('--test');

// ── Blocklist ────────────────────────────────────────────────
const BLOCKLIST = new Set([
    // 人数 / 构图
    '1girl', '1boy', 'solo', '2girls', 'multiple_girls', '2boys', 'multiple_boys',
    '1other', '3girls', '4girls', '5girls', '6+girls', '3boys', '4boys',
    'male_focus', 'female_focus',
    'upper_body', 'full_body', 'cowboy_shot', 'portrait', 'close-up',
    // 表情
    'smile', 'blush', 'open_mouth', 'closed_eyes', 'closed_mouth', ':d', ';d',
    // 视角
    'looking_at_viewer', 'looking_away', 'looking_back', 'looking_down', 'looking_up',
    'from_behind', 'from_above', 'from_below', 'from_side',
    // 姿势 / 动作
    'standing', 'sitting', 'lying', 'walking', 'running', 'holding',
    'arms_up', 'arms_behind_back', 'hand_up', 'v', 'peace_sign',
    // 背景 / 场景
    'simple_background', 'white_background', 'outdoors', 'indoors',
    // meta / 格式
    'highres', 'absurdres', 'commentary', 'commentary_request', 'tagme',
    'bad_id', 'bad_pixiv_id', 'translation_request', 'translated', 'annotated',
    'artist_name', 'character_name', 'copyright_name', 'watermark', 'signature',
    'comic', '4koma',
    'official_alternate_costume', 'alternate_costume',
    // 身体部位 (NSFW / 非外貌)
    'breasts', 'large_breasts', 'medium_breasts', 'small_breasts', 'huge_breasts',
    'ass', 'thighs', 'navel', 'collarbone', 'armpits', 'cleavage',
    'sweat', 'tears', 'saliva', 'blood',
    // NSFW 衣着
    'underwear', 'panties', 'black_panties', 'white_panties', 'striped_panties',
    'highleg', 'highleg_panties',
    // 关系
    'siblings', 'sisters', 'twins', 'brothers',
    // meta 角色标签
    'trap', 'otoko_no_ko', 'ghost',
]);

// ── Helpers ──────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchJSON(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(url, {
                headers: { 'User-Agent': 'LittleWhiteBox-DataScraper/1.0' },
            });
            if (res.status === 429) {
                console.warn(`  Rate limited, waiting 2s...`);
                await sleep(2000);
                continue;
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (e) {
            if (i === retries - 1) throw e;
            console.warn(`  Retry ${i + 1}/${retries}: ${e.message}`);
            await sleep(1000);
        }
    }
}

// ── Phase 1: Fetch character list ────────────────────────────
async function fetchCharacterList() {
    const pages = isTest ? 1 : TOTAL_PAGES;
    const all = [];
    for (let p = 1; p <= pages; p++) {
        const url = `${API_BASE}/tags.json?search[category]=${CATEGORY_CHARACTER}&search[order]=count&limit=${PER_PAGE}&page=${p}`;
        console.log(`  Page ${p}/${pages} ...`);
        const tags = await fetchJSON(url);
        for (const t of tags) {
            if (!t.is_deprecated) all.push(t.name);
        }
        console.log(`  → ${all.length} chars total`);
        if (p < pages) await sleep(PAGE_DELAY);
    }
    return all;
}

// ── Phase 2: Fetch related tags per character ────────────────
async function fetchRelatedTags(charName) {
    const url = `${API_BASE}/related_tag.json?query=${encodeURIComponent(charName)}&category=0`;
    const data = await fetchJSON(url);
    const tags = (data.related_tags || [])
        .filter(t => t.frequency >= FREQ_THRESHOLD && !BLOCKLIST.has(t.tag.name))
        .slice(0, MAX_TAGS_PER_CHAR)
        .map(t => t.tag.name);
    return tags;
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
    console.log(isTest
        ? '=== TEST MODE ==='
        : `=== Full scrape: ${TOTAL_PAGES * PER_PAGE} chars ===`);

    // Phase 1
    console.log('\n[Phase 1] Fetching character list...');
    mkdirSync(OUTPUT_DIR, { recursive: true });
    const charNames = await fetchCharacterList();
    console.log(`Got ${charNames.length} characters.\n`);

    // Phase 2 — resume from checkpoint if exists
    let results = [];
    let startIdx = 0;
    if (!isTest && existsSync(CHECKPOINT)) {
        try {
            results = JSON.parse(readFileSync(CHECKPOINT, 'utf-8'));
            startIdx = results.length;
            console.log(`Resuming from checkpoint: ${startIdx}/${charNames.length}\n`);
        } catch { /* ignore corrupt checkpoint */ }
    }

    const limit = isTest ? Math.min(3, charNames.length) : charNames.length;
    console.log(`[Phase 2] Fetching related tags (${startIdx}→${limit}, concurrency=${CONCURRENCY})...`);
    const t0 = Date.now();

    for (let i = startIdx; i < limit; i += CONCURRENCY) {
        const batch = charNames.slice(i, Math.min(i + CONCURRENCY, limit));
        const batchResults = await Promise.all(batch.map(async (name) => {
            const tags = await fetchRelatedTags(name);
            return [name, tags];
        }));
        results.push(...batchResults);

        // Progress
        const done = Math.min(i + CONCURRENCY, limit);
        if (isTest || done % 50 <= CONCURRENCY || done === limit) {
            const elapsed = ((Date.now() - t0) / 1000).toFixed(0);
            const rate = (done - startIdx) / ((Date.now() - t0) / 1000);
            const eta = rate > 0 ? ((limit - done) / rate / 60).toFixed(1) : '?';
            const last = batchResults[batchResults.length - 1];
            console.log(`  [${done}/${limit}] ${last[0]} → ${last[1].length} tags (${elapsed}s, ${rate.toFixed(1)} req/s, ETA ~${eta}min)`);
        }

        // Checkpoint every 200
        if (!isTest && done % 200 <= CONCURRENCY) {
            writeFileSync(CHECKPOINT, JSON.stringify(results), 'utf-8');
            console.log(`  ✓ Checkpoint saved (${results.length} entries)`);
        }

        if (i + CONCURRENCY < limit) await sleep(TAG_DELAY);
    }

    if (isTest) {
        console.log('\n--- Test Results ---');
        for (const [name, tags] of results) {
            console.log(`${name}:`);
            console.log(`  ${tags.join(', ') || '(no tags)'}`);
        }
        console.log('\nTest OK. Run without --test for full scrape.');
        return;
    }

    // Output
    mkdirSync(OUTPUT_DIR, { recursive: true });

    const jsonStr = JSON.stringify(results);
    writeFileSync(OUTPUT_JSON, jsonStr, 'utf-8');
    const jsonSize = Buffer.byteLength(jsonStr, 'utf-8');
    console.log(`\nJSON: ${OUTPUT_JSON} (${(jsonSize / 1024).toFixed(1)} KB)`);

    const compressed = deflateSync(Buffer.from(jsonStr, 'utf-8'), { level: 9 });
    writeFileSync(OUTPUT_DAT, compressed);
    console.log(`DAT:  ${OUTPUT_DAT} (${(compressed.length / 1024).toFixed(1)} KB)`);
    console.log(`Compression: ${((1 - compressed.length / jsonSize) * 100).toFixed(1)}%`);

    // Stats
    const withTags = results.filter(([, t]) => t.length > 0).length;
    const avgTags = (results.reduce((s, [, t]) => s + t.length, 0) / results.length).toFixed(1);
    console.log(`\nStats: ${results.length} chars, ${withTags} with tags (${(withTags/results.length*100).toFixed(0)}%), avg ${avgTags} tags/char`);

    // Cleanup checkpoint
    try { writeFileSync(CHECKPOINT, '', 'utf-8'); } catch {}
    console.log('Done!');
}

main().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
});
