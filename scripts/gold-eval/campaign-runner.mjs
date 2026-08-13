/* global process */

import path from 'node:path';

import { campaignStatus, runCampaignStage } from './baseline/campaign.mjs';

function flags(argv) {
    return Object.fromEntries(argv.filter(item => item.startsWith('--')).map(item => {
        const [key, ...rest] = item.slice(2).split('=');
        return [key, rest.length ? rest.join('=') : true];
    }));
}

function required(input, name) {
    const value = String(input[name] || '').trim();
    if (!value) throw new Error(`缺少 --${name}=...`);
    return value;
}

async function main() {
    const command = String(process.argv[2] || '').toLowerCase();
    const input = flags(process.argv.slice(3));
    const planPath = path.resolve(required(input, 'plan'));
    const campaignDir = path.resolve(required(input, 'campaign'));
    if (command === 'status') {
        const result = await campaignStatus({ planPath, campaignDir, lane: input.lane || null });
        process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
        return;
    }
    if (command === 'run') {
        const result = await runCampaignStage({
            planPath,
            campaignDir,
            runsRoot: path.resolve(required(input, 'runs-root')),
            lane: required(input, 'lane'),
            stage: required(input, 'stage'),
            readerKeyEnv: String(input['reader-key-env'] || ''),
            summaryKeyEnv: String(input['summary-key-env'] || ''),
            all: input.all === true || String(input.all || '').toLowerCase() === 'true',
        });
        process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
        return;
    }
    throw new Error('用法: campaign-runner.mjs status --plan=... --campaign=... [--lane=screening] | run --plan=... --campaign=... --runs-root=... --lane=screening --stage=bootstrap|capture|reader [--summary-key-env=OPENAI_API_KEY] [--reader-key-env=NEW_API] [--all=true]');
}

main().catch(error => {
    process.stderr.write(`[gold-campaign] ${error?.stack || error}\n`);
    process.exitCode = 1;
});
