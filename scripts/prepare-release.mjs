import { execFileSync, spawnSync } from 'node:child_process';

// Assemble a local delivery commit. Never switch branches, rebuild, or push.
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
function ancestor(older, newer) {
    const result = spawnSync('git', ['merge-base', '--is-ancestor', older, newer]);
    if (result.status === 0 || result.status === 1) return result.status === 0;
    throw result.error || new Error(result.stderr.toString());
}
const lines = text => text.split('\n').filter(Boolean);
const title = process.argv[2]?.trim();
if (!title || process.argv.length !== 3) throw new Error('用法：npm run release:prepare -- "本版更新说明"');
if (git('status', '--porcelain')) throw new Error('请先提交并核对测试线的全部改动。');
const base = git('rev-parse', 'refs/remotes/upstream/main');
const tip = git('rev-parse', 'HEAD');
const tree = git('rev-parse', 'HEAD^{tree}');
const publicTree = git('rev-parse', base + '^{tree}');
if (tree === publicTree) throw new Error('与正式线内容相同，无须发布。');
const development = new Set(lines(git('rev-list', '--first-parent', tip, '^' + base)));
const previous = git('show', '-s', '--format=%(trailers:key=Development-tip,valueonly)', base);
const start = development.has(previous) && git('rev-parse', previous + '^{tree}') === publicTree ? previous : base;
if (!ancestor(start, tip)) throw new Error('正式线有尚未整合的改动，请先同步到测试线。');

// Keep integrated contributors' original commits as merge parents. A PR based
// on unpublished development builds needs a maintainer decision, not a squash.
const parents = new Set();
for (const merge of lines(git('rev-list', '--first-parent', '--merges', start + '..' + tip))) {
    for (const side of git('show', '-s', '--format=%P', merge).split(' ').slice(1)) {
        if (ancestor(side, base)) continue;
        if (lines(git('rev-list', side, '^' + base)).some(id => development.has(id))) {
            throw new Error('合并分支带有未发布的测试线历史，请单独核对该 PR：' + side);
        }
        parents.add(side);
    }
}
const args = [...parents].flatMap(id => ['-p', id]);
const candidate = git('commit-tree', tree, '-p', base, ...args, '-m', title, '-m', 'Development-tip: ' + tip);
const branch = 'codex/release-' + git('rev-parse', '--short', tip);
git('branch', branch, candidate);
console.log(`本地候选：${branch} (${candidate})\n正式线起点：${base}\n未推送。`);
