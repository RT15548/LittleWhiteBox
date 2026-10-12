// Loopback-only real Learning UI and Host, with memory storage and scripted model responses.
import { createServer } from 'vite';
import process from 'node:process';
import vue from '@vitejs/plugin-vue';
import { createClassroomFixture, fixtureLesson } from './learning-classroom.js';
import { prepareRetainedLearningWork } from './learning-retained-work.js';
import { extractTaggedToolCalls } from '../../../agent-core/adapters/openai-compatible.js';

const retainedEvidence = process.argv.includes('--retained-evidence');
const resetConflict = process.argv.includes('--reset-conflict');
const resetStale = process.argv.includes('--reset-stale');
const resetPending = process.argv.includes('--reset-pending');
const resetHistory = process.argv.includes('--reset-history');
const resetCombined = process.argv.includes('--reset-combined');
const invalidFile = process.argv.includes('--invalid-file') || resetConflict;
const h = await createClassroomFixture({ initialLearningFile: invalidFile ? { schemaVersion: 99 } : null,
    lesson: { ...fixtureLesson, kind: process.argv.includes('--lesson') || retainedEvidence ? 'lesson' : 'reading-writing' } });
if (resetConflict) {
    h.flags.userFailure = true;
    await h.command('reset-learning');
    h.replaceUser({ schemaVersion: 100 });
    await h.command('verify');
    h.flags.userFailure = false;
}
const call = (name, args) => ({ id: name, name, arguments: JSON.stringify(args) });
if (retainedEvidence) {
    await prepareRetainedLearningWork(h);
} else if (process.argv.includes('--failure')) {
    await h.command('settings', { value: { level: 'B1' } });
    h.flags.teacherResponse = (request, round) => {
        if (round === 1) { return { toolCalls: [call('LearningArticle', { title: 'A short article' })] }; }
        request.onStreamProgress({ toolCalls: [call('LearningArticle', {})] });
        extractTaggedToolCalls('<｜DSML｜function_calls><｜DSML｜invoke name="LearningArticle"><｜DSML｜parameter name="text" string="true">unfinished');
    };
    await h.command('prepare', { kind: 'reading-writing', message: '准备一篇短文。' });
    await h.command('choose-original');
} else if (resetStale) {
    await h.openLesson();
    h.flags.providerFailure = true;
    await h.command('choose-original');
    h.flags.providerFailure = false;
    h.replaceUser({ schemaVersion: 1, revision: 1, commitId: 'unreadable-v1', data: { profiles: null } });
    await h.command('read');
} else if (!invalidFile) {
    await h.openLesson();
    if (h.state().sourceChoice) { await h.command('choose-original'); }
}
if (resetPending || resetHistory || resetCombined) {
    if (resetHistory || resetCombined) {
        await h.command('talk', { message: 'saved-before' });
        h.flags.teacherReceiptLost = true;
        await h.command('talk', { message: 'saved-with-lost-receipt' });
    }
    if (resetCombined) {
        await h.command('talk', { target: 'workbench', message: 'saved-workbench' });
        h.flags.ledgerUnknown = true;
        await h.command('talk', { target: 'workbench', message: 'workbench-with-lost-receipt' });
    }
    if (resetPending || resetCombined) {
        h.flags.userFailure = true;
        await h.command('settings', { value: { level: 'B2' } });
    }
    h.replaceUser({ schemaVersion: 1, revision: 1, commitId: 'unreadable-v1', data: { profiles: null } });
    await h.command(resetPending || resetCombined ? 'verify' : 'read');
    h.flags.userFailure = false; h.flags.teacherReceiptLost = false;
}
if (process.argv.includes('--review')) {
    h.flags.teacherResponse = (_request, round) => round === 1 ? { toolCalls: [call('LearningReadingNotes', {
        explanations: [{ paragraphId: 'p1', explanation: '注意 tree 在这段中的含义。', terms: [{ text: 'tree', note: '树' }] }],
    })] } : { text: '知识点已保存。' };
    await h.command('talk', { target: 'workbench', message: '讲解这个词。' });
    const unit = h.profile().unit;
    await h.command('bookmark', { unitId: unit.id, materialId: unit.materials[0].id, paragraphId: 'p1', termText: 'tree' });
    h.flags.teacherResponse = (_request, round) => round === 1 ? { toolCalls: [call('LearningLessonEdit', {
        kind: 'review', title: '词语复习', goal: '辨认词义', exercises: [{ key: 'tree', itemId: h.profile().items[0].id,
            skill: 'vocabulary', materialKeys: [], prompt: 'Which word means 树?', response: { kind: 'choice', options: [{ id: 'a', text: 'Tree' }, { id: 'b', text: 'Road' }], multiple: false },
            rule: { kind: 'exact', answer: { kind: 'choice', ids: ['a'] }, explanation: 'Tree 是树，road 是道路。' } }],
    })] } : { text: '复习已准备好。' };
    await h.command('talk', { target: 'workbench', message: '复习这个词。' });
}
if (!retainedEvidence && !resetStale && !resetPending && !resetHistory && !resetCombined) { h.flags.teacherResponse = (request, round) => {
    if (request.tools.some(tool => tool.function.name === 'LearningRequest')) {
        return round === 1 ? { toolCalls: [call('LearningRequest', { task: '按对方的要求处理当前课程，需要换课时先征求确认。' })] } : { text: '交给老师了，我们可以接着聊。' };
    }
    const user = request.messages.findLast(message => message.role === 'user' && message.content.includes('<learning_request>'));
    const text = user?.content.split('<learning_request>')[0] ?? '';
    if (round === 1 && text.includes('换')) {
        return { toolCalls: [call('LearningLessonEdit', { ...fixtureLesson, newLesson: true, kind: 'lesson', title: '新的专项练习' })] };
    }
    if (round === 1 && text.includes('加题')) {
        return { toolCalls: [call('LearningLessonEdit', { exercises: [{ key: 'extra', skill: 'reading', materialKeys: [],
            prompt: 'Choose the word for a place with trees.', response: { kind: 'choice', options: [{ id: 'a', text: 'Park' }, { id: 'b', text: 'Road' }], multiple: false },
            rule: { kind: 'exact', answer: { kind: 'choice', ids: ['a'] }, explanation: 'Park 是公园。' } }] })] };
    }
    if (round === 1 && (text.includes('批改') || text.includes('复核'))) {
        return { toolCalls: h.profile().unit.attempts.filter(attempt => !h.profile().unit.assessments.some(entry => entry.attemptId === attempt.id)).map(attempt =>
            call('LearningAssess', { attemptId: attempt.id, verdict: 'partial', understanding: '抓住了树荫的作用。', expression: '这里可以用更准确的动词。', guidance: '试着改写标记的词。',
                annotations: [{ category: 'vocabulary', severity: 'improve', paragraphIndex: 0, quote: attempt.answer.text.split(' ')[0], explanation: '可以选一个更具体的表达。', suggestion: 'Trees' }] })) };
    }
    return { text: '已经处理好了，保存的内容就在工作台。' };
}; }
if (process.argv.includes('--notification-failure')) {
    let failed = false;
    h.flags.notificationResponse = () => {
        if (!failed) { failed = true; throw Object.assign(new Error('Fixture notification connection failed'), { status: 503 }); }
        return { text: '老师把新课准备好了。刚才我们聊到的那点，也可以接着说。' };
    };
}

const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Learning isolated verification</title>
<style>html,body,#app,.xiaobai-os-app-route{margin:0;height:100%;font:15px system-ui}body{--os-status-height:0px}button{font:inherit}</style></head><body><div id="app"></div>
<script type="module">
import { createApp, h, ref } from 'vue';
import LearningApp from '/modules/xiaobai-os/apps/learning/ui/LearningApp.vue';
import AppNavigationScope from '/modules/xiaobai-os/shell/app-src/components/AppNavigationScope.vue';
const listeners=new Set();
const bridge={subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)},async request(type,payload){return await(await fetch('/__learning/action',{method:'POST',body:JSON.stringify({type,payload})})).json()}};
const initialState=await(await fetch('/__learning/state')).json();
const navigation=ref(null);
const app=createApp({setup:()=>()=>h(AppNavigationScope,{ref:navigation,owner:'learning'},{default:()=>h(LearningApp,{initialState,bridge,app:{id:'learning'},chat:{},theme:'light'})})});app.mount('#app');
const stream=new EventSource('/__learning/events');stream.onmessage=e=>{const event=JSON.parse(e.data);for(const listener of listeners)listener(event)};
window.learningPreview={state:()=>fetch('/__learning/state').then(r=>r.json()),theme:dark=>document.body.classList.toggle('theme-dark',dark),back:()=>navigation.value.back()};
</script></body></html>`;
const clients = new Set();
h.bridge.subscribe(event => { for (const client of clients) { client.write(`data: ${JSON.stringify(event)}\n\n`); } });
const server = await createServer({ configFile: false, root: process.cwd(), plugins: [vue(), { name: 'learning-fixture', configureServer(vite) {
    vite.middlewares.use(async (req, res, next) => {
        try {
            if (req.url === '/') { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(await vite.transformIndexHtml('/', html)); return; }
            if (req.url === '/__learning/events') {
                res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
                res.write(': connected\n\n'); clients.add(res); req.on('close', () => clients.delete(res)); return;
            }
            if (req.url === '/__learning/state') { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(h.state())); return; }
            if (req.url === '/__learning/history') {
                res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify((await h.store.read()).value)); return;
            }
            if (req.url === '/__learning/stored') {
                res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(h.storedFiles())); return;
            }
            if (resetCombined && req.url === '/__learning/confirm-shared' && req.method === 'POST') {
                h.confirmLedger(); res.end('{}'); return;
            }
            if (req.url === '/__learning/action') {
                let body = ''; for await (const part of req) { body += part; }
                const { type, payload } = JSON.parse(body);
                const response = await h.bridge.request(type, payload);
                res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(response)); return;
            }
            next();
        } catch (error) { res.statusCode = 500; res.end(String(error)); }
    });
} }], optimizeDeps: { noDiscovery: true, include: ['vue', 'showdown'] }, server: { host: '127.0.0.1', port: 4319, strictPort: true } });
await server.listen();
console.log('Learning verification: http://127.0.0.1:4319');
process.on('SIGINT', async () => { await h.dispose(); await server.close(); process.exit(); });
