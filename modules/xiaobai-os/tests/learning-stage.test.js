import assert from 'node:assert/strict';
import test from 'node:test';

import { parseLearningUnit, parseLearningData } from '../domains/learning/data.js';
import { learningUnitStage } from '../domains/learning/stage.js';
import { assessLearning, projectLearningEvidence } from '../domains/learning/assessment.js';
import { checkLearningAnnotations } from '../domains/learning/facts.js';
import { learningScheduleAt, newLearningSchedule } from '../domains/learning/schedule.js';
import { createLearningService } from '../apps/learning/application/service.js';
import { shareLearningCourse } from '../apps/learning/application/course-sharing.js';
import { buildLearningContext } from '../apps/learning/agent/context.js';
import { readLearning } from '../apps/learning/agent/data-projection.js';
import { createLearningLessonCompiler } from '../apps/learning/application/lesson.js';
import { learningClassView } from '../apps/learning/application/projection.js';
import { createLearningRepository } from '../apps/learning/storage/repository.js';
import { createSillyTavernUserJsonFilePort } from '../storage/sillytavern-file-storage.js';

const scope = { kind: 'public' };
const T0 = '2026-09-01T08:00:00.000Z';
const article = { id: 'm1', title: 'Parks', provenance: { kind: 'authored' }, transcriptRevealed: false,
    paragraphs: [{ id: 'p1', text: 'Parks cool cities in summer.' }, { id: 'p2', text: 'Trees give people shade.' }] };
const writing = (id, paragraphId) => ({ id, skill: 'writing', materialIds: ['m1'], prompt: paragraphId ? '概括这一段。' : '写一篇短文。',
    response: { kind: 'text' }, rule: { kind: 'semantic' }, hint: '', ...(paragraphId ? { paragraphId } : {}) });
const explanations = [
    { materialId: 'm1', paragraphId: 'p1', explanation: '公园让城市变凉。', terms: [{ text: 'cool', note: '使凉爽' }] },
    { materialId: 'm1', paragraphId: 'p2', explanation: '树提供阴凉。', terms: [] },
];
const rwUnit = (overrides = {}) => ({ id: 'u1', kind: 'reading-writing', title: '城市公园', goal: '概括并写作', scope, originOsId: 'story-a',
    reward: { tier: 'short', amount: 17 }, materials: [article], exercises: [writing('s1', 'p1'), writing('s2', 'p2'), writing('e1')],
    attempts: [], assessments: [], revealed: { answers: [], hints: [] }, explanations, modelEssay: null, skippedRevisionAttemptIds: [], ...overrides });
const help = { answer: false, hint: false, feedback: false, transcript: false, replays: 0, slowPlayback: false };
const attempt = (id, exerciseId, text, extra = {}) => ({ id, exerciseId, answer: { kind: 'text', text }, submittedAt: T0, help, scope, ...extra });
const assessment = (attemptId, extra = {}) => ({ attemptId, verdict: 'correct', understanding: '', expression: '', guidance: '清楚。', scope, ...extra });
const annotation = (id, extra = {}) => ({ ...(id ? { id } : {}), category: 'grammar', severity: 'error', paragraphIndex: 0, quote: 'is go', explanation: '时态', suggestion: 'went', ...extra });
const drafts = [attempt('a1', 's1', 'Parks cool cities.'), attempt('a2', 's2', 'Trees give shade.'), attempt('a3', 'e1', 'I like parks.\nYesterday he is go there.')];
const stage = unit => learningUnitStage(parseLearningUnit(unit), 'story-a').stage;

test('reading-writing stage is derived from saved drafts, feedback, revision and the model essay', () => {
    assert.equal(stage(rwUnit()), 'writing');
    assert.equal(stage(rwUnit({ attempts: drafts.slice(0, 2) })), 'writing');
    assert.equal(stage(rwUnit({ attempts: drafts, assessments: [assessment('a1')] })), 'grading');
    const clean = [assessment('a1'), assessment('a2'), assessment('a3')];
    assert.equal(stage(rwUnit({ attempts: drafts, assessments: clean })), 'model');
    const marked = [assessment('a1'), assessment('a2'), assessment('a3', { verdict: 'partial', annotations: [annotation('n1', { paragraphIndex: 1 })] })];
    const graded = rwUnit({ attempts: drafts, assessments: marked });
    const derived = learningUnitStage(parseLearningUnit(graded), 'story-a');
    assert.equal(derived.stage, 'revising');
    assert.deepEqual(derived.exercises.map(row => row.status), ['done', 'done', 'revising']);
    // Alternatives are offered, not demanded.
    const offered = [...marked.slice(0, 2), assessment('a3', { annotations: [annotation('n1', { paragraphIndex: 1, severity: 'alternative' })] })];
    assert.equal(stage(rwUnit({ attempts: drafts, assessments: offered })), 'model');
    assert.equal(stage({ ...graded, skippedRevisionAttemptIds: ['a3'] }), 'model');
    // Disputed feedback waits for a new judgement.
    assert.equal(stage(rwUnit({ attempts: drafts, assessments: [...marked.slice(0, 2), { ...marked[2], verdict: 'disputed' }] })), 'grading');
    const revision = attempt('a4', 'e1', 'I like parks.\nYesterday he went there.', { revisesAttemptId: 'a3', help: { ...help, feedback: true } });
    assert.equal(stage({ ...graded, attempts: [...drafts, revision] }), 'reviewing');
    const reviewed = { ...graded, attempts: [...drafts, revision], assessments: [...marked, assessment('a4', { resolvedAnnotationIds: ['n1'] })] };
    assert.equal(stage(reviewed), 'model');
    assert.equal(stage({ ...reviewed, modelEssay: { text: 'Parks matter.', level: 'B1' } }), 'complete');
});

test('lessons have no steps; a review is answered, graded, then complete', () => {
    const lesson = { ...rwUnit({ kind: 'lesson' }), exercises: [writing('q1')] };
    delete lesson.explanations; delete lesson.modelEssay; delete lesson.skippedRevisionAttemptIds;
    assert.equal(stage(lesson), 'lesson');
    const review = { ...lesson, kind: 'review', exercises: [{ ...writing('r1'), skill: 'vocabulary', itemId: 'i1' }, { ...writing('r2'), skill: 'vocabulary', itemId: 'i2' }] };
    assert.equal(stage(review), 'answering');
    const answered = { ...review, attempts: [attempt('b1', 'r1', 'cool'), attempt('b2', 'r2', 'shade')] };
    assert.equal(stage(answered), 'grading');
    assert.equal(stage({ ...answered, assessments: [assessment('b1', { signal: 'hesitant' }), assessment('b2')] }), 'complete');
    assert.equal(parseLearningUnit({ ...answered, attempts: [...answered.attempts, attempt('b3', 'r1', 'again')] }).attempts.length, 3);
    assert.throws(() => parseLearningUnit({ ...review, exercises: [review.exercises[0], { ...review.exercises[1], itemId: 'i1' }] }));
    assert.throws(() => parseLearningUnit({ ...lesson, exercises: [{ ...writing('q1'), itemId: 'i1' }] }));
    assert.throws(() => parseLearningUnit({ ...lesson, attempts: [attempt('c1', 'q1', 'x')], assessments: [assessment('c1', { signal: 'clean' })] }), /signal/);
});

test('reading-writing validates references without fixing the number or order of learning activities', () => {
    parseLearningUnit(rwUnit());
    const second = { ...article, id: 'm2' };
    for (const [change, bad] of [
        ['two articles', { materials: [article, second] }],
        ['objective summary', { exercises: [{ ...writing('s1', 'p1'), skill: 'reading' }, writing('s2', 'p2'), writing('e1')] }],
        ['revision of ungraded draft', { attempts: [...drafts, attempt('a4', 'e1', 'x', { revisesAttemptId: 'a3' })] }],
        ['resolved outside draft', { attempts: [...drafts, attempt('a4', 'e1', 'x', { revisesAttemptId: 'a3' })],
            assessments: [assessment('a3'), assessment('a4', { resolvedAnnotationIds: ['nope'] })] }],
        ['missing model essay key', { modelEssay: undefined }],
    ]) { assert.throws(() => parseLearningUnit(JSON.parse(JSON.stringify(rwUnit(bad)))), undefined, change); }
    const lesson = { ...rwUnit({ kind: 'lesson' }), exercises: [writing('q1')] };
    assert.throws(() => parseLearningUnit(lesson), /explanations|model essay/);
});

test('annotations quote the learner\'s own words inside the paragraph they name', () => {
    const essay = drafts[2];
    checkLearningAnnotations(assessment('a3', { annotations: [annotation('n1', { paragraphIndex: 1 })] }), essay);
    assert.throws(() => checkLearningAnnotations(assessment('a3', { annotations: [annotation('n1', { paragraphIndex: 0 })] }), essay), /exact words/);
    assert.throws(() => checkLearningAnnotations(assessment('a3', { annotations: [annotation('n1', { paragraphIndex: 1, quote: 'he was go' })] }), essay), /exact words/);
    assert.throws(() => checkLearningAnnotations(assessment('a3', { annotations: [annotation('n1', { paragraphIndex: 2 })] }), essay), /exact words/);
    // Blank lines do not count as paragraphs.
    checkLearningAnnotations(assessment('a3', { annotations: [annotation('n1', { paragraphIndex: 1 })] }), { ...essay, answer: { kind: 'text', text: 'I like parks.\r\n\r\nYesterday he is go there.' } });
    assert.throws(() => parseLearningUnit(rwUnit({ attempts: drafts, assessments: [assessment('a3', { annotations: [annotation('n1')] })] })), /exact words/);
    assert.throws(() => parseLearningUnit(rwUnit({ attempts: drafts,
        assessments: [assessment('a3', { annotations: [annotation('n1', { paragraphIndex: 1, category: 'content', itemId: 'i1' })] })] })), /itemId/);
});

function harness() {
    let file = null; let id = 0; let date = T0; let osId = 'story-a';
    const files = createSillyTavernUserJsonFilePort({ fetch: async (_url, options) => {
        if (options.method === 'POST') {
            const body = JSON.parse(options.body);
            file = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(body.data), char => char.charCodeAt(0))));
            return new Response('{}');
        }
        return new Response(file === null ? '' : JSON.stringify(file), { status: file === null ? 404 : 200 });
    } });
    const createId = () => `id-${++id}`;
    const now = () => date;
    const repository = createLearningRepository(files, { createId, now });
    const service = createLearningService(repository, { createId, now });
    const read = () => repository.snapshot().document.data.profiles[0];
    const write = async change => {
        const document = repository.snapshot().document;
        const data = structuredClone(document.data);
        change(data.profiles[0]);
        assert.equal((await repository.save(document, data, () => true)).status, 'confirmed');
    };
    const submit = async (unitId, exerciseId, text, answerScope = scope) => {
        const pending = service.prepareAttempt({ language: 'en', unitId, exerciseId, answer: { kind: 'text', text }, scope: answerScope, osId, replays: 0, slowPlayback: false });
        assert.equal((await pending.save(() => true)).status, 'confirmed');
        return pending.attemptId;
    };
    const assess = (attemptId, args, review = false) => write(profile => {
        Object.assign(profile, assessLearning(profile, { attemptId, verdict: 'correct', understanding: '', expression: '', guidance: '好。', ...args },
            { attemptId, review, inputScope: scope, osId, createId, now }).profile);
    });
    return { repository, service, read, write, submit, assess, setDate: value => { date = value; }, setStory: value => { osId = value; }, createId };
}

function requestWork(h, osId, action) {
    const context = buildLearningContext({ data: h.repository.snapshot().document.data, language: 'en', osId,
        actor: 'workbench', teacher: null, context: null, action, message: '', asOf: T0 });
    return JSON.parse(context.messages[0].content.split('<learning_request>\n')[1].split('\n</learning_request>')[0]);
}

test('shared coursework runs submission, grading, revision and completion without removing another story’s drafts', async () => {
    const h = harness(); await h.repository.read(); await h.service.saveSettings('en', {}, () => true);
    const privateA = { kind: 'story', osId: 'story-a' };
    await h.write(profile => { profile.unit = rwUnit({ scope: privateA }); });
    await h.submit('u1', 's1', 'An original private summary.');
    await h.submit('u1', 'e1', 'An original private essay.');
    const originals = structuredClone(h.read().unit.attempts);
    await shareLearningCourse(h.repository, { language: 'en', unitId: 'u1', osId: 'story-a',
        commitId: h.repository.snapshot().document.commitId, approved: true }, () => true);
    h.setStory('story-b');
    assert.equal(learningUnitStage(h.read().unit, 'story-b').stage, 'writing');
    const replaced = await h.submit('u1', 'e1', 'My first try.');
    const essay = await h.submit('u1', 'e1', 'Yesterday he is go there.');
    const first = await h.submit('u1', 's1', 'Parks cool cities.');
    const second = await h.submit('u1', 's2', 'Trees give shade.');
    assert.equal(h.read().unit.attempts.some(entry => entry.id === replaced), false);
    assert.deepEqual(h.read().unit.attempts.filter(entry => entry.scope.kind === 'story'), originals);
    const visible = learningClassView(h.repository.snapshot().document.data, 'en', 'story-b').unit;
    const request = requestWork(h, 'story-b', { kind: 'grade', unitId: 'u1' });
    const expected = [essay, first, second];
    assert.deepEqual(visible.attempts.map(entry => entry.id), expected);
    assert.deepEqual(readLearning(h.repository.snapshot().document.data, 'en', 'story-b', { section: 'attempts' }).data.map(entry => entry.id), expected);
    assert.deepEqual(request.focus.drafts.map(entry => entry.attempt.id).sort(), [...expected].sort());
    assert.equal(visible.stage.stage, 'grading');
    await h.assess(first, {}); await h.assess(second, {});
    await h.assess(essay, { verdict: 'partial', annotations: [annotation()] });
    const mark = h.read().unit.assessments.find(entry => entry.attemptId === essay).annotations[0].id;
    assert.equal(learningUnitStage(h.read().unit, 'story-b').stage, 'revising');
    await h.service.submitRevision('en', 'u1', [{ attemptId: essay, text: 'Yesterday he went there.' }], 'story-b', () => true);
    const revision = h.read().unit.attempts.at(-1).id;
    assert.deepEqual(requestWork(h, 'story-b', { kind: 'revision-review', unitId: 'u1' }).focus.revisions.map(entry => entry.revision.id), [revision]);
    await h.assess(revision, { resolvedAnnotationIds: [mark] });
    assert.deepEqual(requestWork(h, 'story-b', { kind: 'model-essay', unitId: 'u1' }).focus.work.map(entry => entry.attempt.id), [essay, revision]);
    await h.service.saveModelEssay('en', 'u1', { text: 'Parks cool cities.', level: 'B1' }, 'story-b', () => true);
    assert.equal(learningUnitStage(h.read().unit, 'story-b').stage, 'complete');
    const completed = structuredClone(h.read().completions);
    assert.deepEqual(completed[0].attemptIds, [first, second, essay, revision]);
    assert.equal(completed[0].reward.originOsId, 'story-a');
    await h.repository.read(); h.setStory('story-a');
    assert.deepEqual(h.read().unit.attempts.filter(entry => originals.some(old => old.id === entry.id)), originals);
    await h.assess(originals[0].id, {});
    await h.service.saveModelEssay('en', 'u1', { text: 'Parks cool cities.', level: 'B1' }, 'story-a', () => true);
    assert.deepEqual(h.read().completions, completed);
});

test('completion never assembles private answers from different stories or overwrites private feedback', async () => {
    const h = harness(); await h.repository.read(); await h.service.saveSettings('en', {}, () => true);
    const privateA = { kind: 'story', osId: 'story-a' };
    const privateB = { kind: 'story', osId: 'story-b' };
    await h.write(profile => { profile.unit = rwUnit({ modelEssay: { text: 'A model.', level: 'B1' } }); });
    const first = await h.submit('u1', 's1', 'A private summary.', privateA);
    await h.assess(first, {});
    const essay = await h.submit('u1', 'e1', 'Public answer with private feedback.');
    await h.write(profile => { profile.unit.assessments.push(assessment(essay, { scope: privateA })); });
    const feedback = structuredClone(h.read().unit.assessments);
    h.setStory('story-b');
    const second = await h.submit('u1', 's2', 'B private summary.', privateB);
    await h.assess(second, {});
    assert.equal(h.read().completions.length, 0);
    assert.deepEqual(learningUnitStage(h.read().unit, 'story-b').exercises.map(row => row.status), ['writing', 'done', 'writing']);
    assert.deepEqual(requestWork(h, 'story-b', { kind: 'grade', unitId: 'u1' }).focus.drafts, []);
    assert.throws(() => assessLearning(h.read(), { attemptId: essay }, { attemptId: essay, review: true, inputScope: scope,
        osId: 'story-b', createId: h.createId }), error => error.path === 'attemptId');
    assert.throws(() => h.service.dispute('en', essay, 'story-b', () => true), error => error.path === 'attemptId');
    const newFirst = await h.submit('u1', 's1', 'B own first summary.', privateB); await h.assess(newFirst, {});
    const newEssay = await h.submit('u1', 'e1', 'B own essay.', privateB); await h.assess(newEssay, {});
    assert.deepEqual(h.read().completions[0].attemptIds, [second, newFirst, newEssay]);
    assert.deepEqual(h.read().completions[0].scope, privateB);
    assert.deepEqual(h.read().unit.assessments.slice(0, 2), feedback);
    assert.equal(learningUnitStage(h.read().unit, 'story-a').stage, 'writing');
});

test('revision choices and answer deletion are local to the selected saved work', async () => {
    const h = harness(); await h.repository.read(); await h.service.saveSettings('en', {}, () => true);
    await h.write(profile => { profile.unit = rwUnit(); });
    const privateA = { kind: 'story', osId: 'story-a' }; const privateB = { kind: 'story', osId: 'story-b' };
    const a = await h.submit('u1', 'e1', 'Yesterday he is go there.', privateA);
    await h.assess(a, { annotations: [annotation()] });
    h.setStory('story-b');
    const b = await h.submit('u1', 'e1', 'Yesterday he is go there.', privateB);
    await h.assess(b, { annotations: [annotation()] });
    await h.service.skipRevision('en', 'u1', 'story-b', () => true);
    const row = story => learningUnitStage(h.read().unit, story).exercises.find(row => row.exerciseId === 'e1');
    assert.equal(row('story-a').status, 'revising'); assert.equal(row('story-b').status, 'done');
    await h.repository.read();
    assert.deepEqual(h.read().unit.skippedRevisionAttemptIds, [b]);
    await h.service.submitRevision('en', 'u1', [{ attemptId: b, text: 'Yesterday he is go home.' }], 'story-b', () => true);
    const revised = h.read().unit.attempts.at(-1).id;
    assert.deepEqual(h.read().unit.attempts.at(-1).scope, privateB);
    await h.assess(revised, { annotations: [annotation()] });
    assert.equal(row('story-b').status, 'revising');
    assert.throws(() => h.service.submitRevision('en', 'u1', [{ attemptId: a, text: 'Someone else’s edit.' }], 'story-b', () => true), error => error.path === 'revisions[0].attemptId');
    assert.throws(() => h.service.deleteAttempt('en', a, 'story-b', () => true), error => error.path === 'attemptId');
    await h.service.skipRevision('en', 'u1', 'story-b', () => true);
    await h.service.deleteAttempt('en', b, 'story-b', () => true);
    assert.deepEqual(h.read().unit.attempts.map(entry => entry.id), [a]);
    assert.deepEqual(h.read().unit.skippedRevisionAttemptIds, []);
    assert.equal(row('story-a').status, 'revising');
});

test('revision provenance is retained and deleting a shared ancestor cannot erase a hidden revision', async () => {
    const h = harness(); await h.repository.read(); await h.service.saveSettings('en', {}, () => true);
    const privateA = { kind: 'story', osId: 'story-a' }; const privateB = { kind: 'story', osId: 'story-b' };
    await h.write(profile => { profile.unit = rwUnit({ attempts: [attempt('public-draft', 'e1', 'Yesterday he is go there.')],
        assessments: [assessment('public-draft', { scope: privateA, annotations: [annotation('mark')] })] }); });
    await h.service.submitRevision('en', 'u1', [{ attemptId: 'public-draft', text: 'Yesterday he went there.' }], 'story-a', () => true);
    assert.deepEqual(h.read().unit.attempts.at(-1).scope, privateA);
    const invalid = structuredClone(h.read().unit); invalid.attempts.at(-1).scope = scope;
    assert.throws(() => parseLearningUnit(invalid), error => error.path === 'unit.attempts');
    await h.write(profile => { profile.unit = rwUnit({ attempts: [attempt('public-draft', 'e1', 'An original.'),
        attempt('private-revision', 'e1', 'A private revision.', { scope: privateB, revisesAttemptId: 'public-draft' })],
    assessments: [assessment('public-draft')] }); });
    const before = structuredClone(h.read());
    assert.throws(() => h.service.deleteAttempt('en', 'public-draft', 'story-a', () => true), error => error.path === 'attemptId');
    assert.deepEqual(h.read(), before);
    await h.service.deleteAttempt('en', 'private-revision', 'story-b', () => true);
    await h.service.deleteAttempt('en', 'public-draft', 'story-a', () => true);
    assert.deepEqual(h.read().unit.attempts, []);
});

for (const retired of [false, true]) {
    for (const hiddenRevision of [false, true]) {
        test(`retained revision dependencies govern buttons and mutations (retired: ${retired}, hidden revision: ${hiddenRevision})`, async () => {
            const h = harness(); await h.repository.read(); await h.service.saveSettings('en', {}, () => true);
            const privateScope = { kind: 'story', osId: 'story-b' };
            const revisionScope = hiddenRevision ? privateScope : scope;
            await h.write(profile => {
                const unit = rwUnit({ scope: privateScope,
                    attempts: [attempt('original', 'e1', 'An original.'),
                        attempt('revision', 'e1', 'A revision.', { scope: revisionScope, revisesAttemptId: 'original' })],
                    assessments: [assessment('original'), assessment('revision', { scope: revisionScope })] });
                profile.unit = retired ? null : unit;
                // Representative evidence can be stored in a different order than the original submissions.
                profile.items = [{ id: 'writing-record', label: 'Writing', skill: 'writing', scope,
                    evidence: ['revision', 'original'].map(id => projectLearningEvidence(unit, id)) }];
            });
            const before = structuredClone(h.read());
            const view = learningClassView(h.repository.snapshot().document.data, 'en', 'story-a', 0, 'writing-record');
            assert.equal(view.unit, null);
            assert.deepEqual(view.record.evidence.find(entry => entry.attempt.id === 'original').actions,
                { review: false, remove: !hiddenRevision });
            assert.throws(() => h.service.dispute('en', 'original', 'story-a', () => true), error => error.path === 'attemptId');
            assert.throws(() => assessLearning(h.read(), { attemptId: 'original', verdict: 'partial', understanding: '', expression: '', guidance: 'Compare the drafts.' },
                { attemptId: 'original', review: true, inputScope: scope, osId: 'story-a', createId: h.createId }), error => error.path === 'attemptId');
            if (hiddenRevision) {
                assert.throws(() => h.service.deleteAttempt('en', 'original', 'story-a', () => true), error => error.path === 'attemptId');
                assert.deepEqual(h.read(), before);
            } else {
                await h.service.deleteAttempt('en', 'original', 'story-a', () => true);
                assert.deepEqual(h.read().items[0].evidence, []);
                assert.deepEqual(h.read().unit?.attempts ?? [], []);
            }
        });
    }
}

test('settings create a profile with defaults before any lesson', async () => {
    const h = harness(); await h.repository.read();
    await h.service.saveSettings('EN', { level: 'B1', exam: 'IELTS', interests: '城市和自然' }, () => true);
    const profile = h.read();
    assert.equal(profile.language, 'en');
    assert.equal(profile.explanationLanguage, 'zh-CN');
    assert.deepEqual([profile.level, profile.goal.exam, profile.goal.targetLevel, profile.interests], ['B1', 'IELTS', null, '城市和自然']);
    assert.deepEqual([profile.unit, profile.review, profile.items, profile.completions], [null, null, [], []]);
    await h.service.saveSettings('en', { level: null, explanationLanguage: null, targetLevel: 'C1' }, () => true);
    assert.deepEqual([h.read().level, h.read().explanationLanguage, h.read().goal.targetLevel, h.read().goal.exam], [null, 'zh-CN', 'C1', 'IELTS']);
    assert.throws(() => h.service.saveSettings('en', { teacher: 'x' }, () => true), /Unsupported/);
    assert.equal(learningClassView(h.repository.snapshot().document.data, 'en', 'story-a').profile.settings.targetLevel, 'C1');
});

test('a reading-writing unit runs draft, grading, revision, review and model essay, then completes by itself', async () => {
    const h = harness(); await h.repository.read();
    await h.service.saveSettings('en', {}, () => true);
    await h.write(profile => { profile.unit = rwUnit(); });
    const first = await h.submit('u1', 's1', 'Parks are cool.');
    await h.submit('u1', 's2', 'Trees give shade.');
    await h.assess(first, {});
    assert.equal(h.read().unit.assessments[0].attemptId, first);
    const resubmitted = await h.submit('u1', 's1', 'Parks cool cities.');
    assert.deepEqual(h.read().unit.attempts.map(entry => entry.exerciseId), ['s1', 's2', 's1']);
    const essay = await h.submit('u1', 'e1', 'I like parks.\nYesterday he is go there.');
    assert.equal(learningClassView(h.repository.snapshot().document.data, 'en', 'story-a').unit.stage.stage, 'grading');

    await h.service.bookmarkTerm('en', 'u1', 'm1', 'p1', 'cool', () => true);
    await h.service.bookmarkTerm('en', 'u1', 'm1', 'p1', 'cool', () => true);
    assert.throws(() => h.service.bookmarkTerm('en', 'u1', 'm1', 'p2', 'cool', () => true), /termText/);
    assert.deepEqual(h.read().items.map(item => [item.label, item.skill, item.evidence.length, item.schedule.dueAt]), [['cool', 'vocabulary', 0, newLearningSchedule(T0).dueAt]]);

    const draftIds = h.read().unit.attempts.map(entry => entry.id);
    await h.assess(resubmitted, {});
    await h.assess(draftIds[1], {});
    await h.assess(essay, { verdict: 'partial', annotations: [{ category: 'grammar', severity: 'error', paragraphIndex: 1, quote: 'is go',
        explanation: '过去的事用过去时', suggestion: 'went', item: { label: 'past simple' } }] });
    const grammar = h.read().items.find(item => item.label === 'past simple');
    assert.equal(grammar.skill, 'grammar');
    assert.ok(grammar.schedule);
    // An essay's evidence keeps the learner's text and feedback, not the article.
    assert.deepEqual(grammar.evidence[0].materials, []);
    const noteId = h.read().unit.assessments.find(entry => entry.attemptId === essay).annotations[0].id;
    assert.equal(h.read().unit.assessments.find(entry => entry.attemptId === essay).annotations[0].itemId, grammar.id);

    await h.service.submitRevision('en', 'u1', [{ attemptId: essay, text: 'I like parks.\nYesterday he went there.' }], 'story-a', () => true);
    const revision = h.read().unit.attempts.at(-1);
    assert.equal(revision.revisesAttemptId, essay);
    assert.equal(revision.help.feedback, true);
    assert.equal(learningUnitStage(h.read().unit, 'story-a').stage, 'reviewing');
    await h.assess(revision.id, { resolvedAnnotationIds: [noteId] });
    assert.equal(learningUnitStage(h.read().unit, 'story-a').stage, 'model');
    assert.equal(h.read().completions.length, 0);
    await h.service.saveModelEssay('en', 'u1', { text: 'Parks keep cities cool.', level: 'B1' }, 'story-a', () => true);
    assert.equal(learningUnitStage(h.read().unit, 'story-a').stage, 'complete');
    assert.deepEqual(h.read().completions.map(entry => [entry.unitId, entry.reward.amount, entry.attemptIds.length]), [['u1', 17, 4]]);
    assert.equal(h.read().completions[0].attemptIds.includes(first), false);

    // Deleting a graded draft takes its revision along; that exercise may then be written again.
    await h.service.deleteAttempt('en', essay, 'story-a', () => true);
    assert.equal(h.read().unit.attempts.some(entry => entry.exerciseId === 'e1'), false);
    assert.equal(h.read().items.find(item => item.id === grammar.id).evidence.length, 0);
    await h.submit('u1', 'e1', 'A new essay.');
});

test('partial drafts accept separate revision batches and further revisions without completing missing work', async () => {
    const h = harness(); await h.repository.read(); await h.service.saveSettings('en', {}, () => true);
    await h.write(profile => { profile.unit = rwUnit(); });
    const first = await h.submit('u1', 's1', 'Parks good.');
    const second = await h.submit('u1', 's2', 'Trees good.');
    const mark = { annotations: [{ category: 'grammar', severity: 'improve', paragraphIndex: 0, quote: 'good', explanation: 'Add a verb.', suggestion: 'are good' }] };
    await h.assess(first, mark); await h.assess(second, mark);
    await h.service.submitRevision('en', 'u1', [{ attemptId: first, text: 'Parks are good.' }], 'story-a', () => true);
    const revision = h.read().unit.attempts.at(-1).id;
    await h.assess(revision, mark);
    await h.service.submitRevision('en', 'u1', [{ attemptId: second, text: 'Trees are helpful.' }], 'story-a', () => true);
    await h.service.submitRevision('en', 'u1', [{ attemptId: revision, text: 'Parks cool cities.' }], 'story-a', () => true);
    const latest = h.read().unit.attempts.at(-1);
    await h.assess(latest.id, {});
    const progress = learningUnitStage(h.read().unit, 'story-a');
    assert.equal(progress.stage, 'writing');
    assert.equal(progress.exercises[0].revisionAttemptId, latest.id);
    assert.deepEqual(progress.exercises.map(row => row.status), ['done', 'reviewing', 'writing']);
    assert.equal(h.read().unit.attempts.length, 5);
    assert.equal(h.read().completions.length, 0);
});

test('an early model essay helps future essay attempts without rewriting earlier conditions', async () => {
    const h = harness(); await h.repository.read(); await h.service.saveSettings('en', {}, () => true);
    await h.write(profile => { profile.unit = rwUnit(); });
    const earlier = await h.submit('u1', 'e1', 'Parks are good.'); await h.assess(earlier, {});
    const basis = { document: h.repository.snapshot().document, submittedAt: T0 };
    await h.service.saveModelEssay('en', 'u1', { text: 'Parks keep cities cool.', level: 'B1' }, 'story-a', () => true);
    const later = await h.submit('u1', 'e1', 'Parks keep cities cool.');
    assert.equal(h.read().unit.attempts.find(entry => entry.id === earlier).help.answer, false);
    assert.equal(h.read().unit.attempts.find(entry => entry.id === later).help.answer, true);
    const messageAnswer = h.service.prepareAttempt({ language: 'en', unitId: 'u1', exerciseId: 'e1', answer: { kind: 'text', text: 'My original message.' },
        scope, osId: 'story-a', replays: 0, slowPlayback: false }, basis);
    assert.equal((await messageAnswer.save(() => true)).status, 'confirmed');
    assert.equal(h.read().unit.attempts.at(-1).help.answer, false);
    assert.ok(h.read().unit.modelEssay);
    assert.equal(h.read().completions.length, 0);
});

test('skipping a revision goes straight to the model essay', async () => {
    const h = harness(); await h.repository.read();
    await h.service.saveSettings('en', {}, () => true);
    await h.write(profile => { profile.unit = rwUnit(); });
    const ids = [await h.submit('u1', 's1', 'Parks cool cities.'), await h.submit('u1', 's2', 'Trees give shade.'), await h.submit('u1', 'e1', 'He is go.')];
    await h.assess(ids[0], {}); await h.assess(ids[1], {});
    await h.assess(ids[2], { annotations: [{ category: 'content', severity: 'improve', paragraphIndex: 0, quote: 'He', explanation: '主语不清', suggestion: '' }] });
    await h.service.skipRevision('en', 'u1', 'story-a', () => true);
    assert.equal(learningUnitStage(h.read().unit, 'story-a').stage, 'model');
});

test('a review asks about exactly the due items, moves each schedule once, and completes by itself', async () => {
    const h = harness(); await h.repository.read();
    await h.service.saveSettings('en', {}, () => true);
    const past = '2026-08-30T08:00:00.000Z';
    await h.write(profile => {
        profile.items = ['i1', 'i2', 'i3'].map((id, index) => ({ id, label: `word ${id}`, scope, skill: 'vocabulary', evidence: [],
            schedule: learningScheduleAt(index === 2 ? '2026-09-05T08:00:00.000Z' : past) }));
    });
    assert.deepEqual(h.service.reviewSelection('en'), { itemIds: ['i1', 'i2'], tier: 'short' });
    assert.equal(h.service.reviewSelection('en', '2026-08-01T00:00:00.000Z'), null);
    const compile = createLearningLessonCompiler({ osId: 'story-a', language: 'en', scope, prices: { short: 17, regular: 29, deep: 41 }, createId: h.createId, sources: { get: () => undefined } });
    const choice = (key, itemId) => ({ key, skill: 'vocabulary', materialKeys: [], prompt: `Which means ${itemId}?`, itemId,
        response: { kind: 'choice', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], multiple: false },
        rule: { kind: 'exact', answer: { kind: 'choice', ids: ['a'] }, explanation: '选 A。' } });
    const context = { profile: h.read(), now: T0 };
    assert.ok(compile({ kind: 'review', title: '复习', goal: '回忆', exercises: [choice('q1', 'i1')] }, null, null, context));
    assert.ok(compile({ kind: 'review', title: '复习', goal: '回忆', exercises: [choice('q1', 'i1'), choice('q2', 'i3')] }, null, null, context));
    const review = compile({ kind: 'review', title: '复习', goal: '回忆', tier: 'deep', exercises: [choice('q1', 'i1'), choice('q2', 'i2')] }, null, null, context);
    assert.equal(review.reward.tier, 'short');
    await h.write(profile => { profile.review = review; });
    const [q1, q2] = review.exercises;
    const pending = answer => h.service.prepareAttempt({ language: 'en', unitId: review.id, exerciseId: answer.exerciseId,
        answer: { kind: 'choice', ids: [answer.id] }, scope, osId: 'story-a', replays: 0, slowPlayback: false });
    await pending({ exerciseId: q1.id, id: 'a' }).save(() => true);
    assert.ok(pending({ exerciseId: q1.id, id: 'b' }).attemptId);
    const i1 = h.read().items.find(item => item.id === 'i1');
    assert.deepEqual([i1.schedule.repetitions, i1.schedule.lastQuality, i1.schedule.dueAt, i1.evidence.length], [1, 5, '2026-09-02T08:00:00.000Z', 1]);
    assert.equal(h.read().completions.length, 0);
    const wrong = pending({ exerciseId: q2.id, id: 'b' });
    await wrong.save(() => true);
    const i2 = h.read().items.find(item => item.id === 'i2');
    assert.deepEqual([i2.schedule.repetitions, i2.schedule.lastQuality, i2.schedule.intervalDays], [0, 1, 1]);
    assert.deepEqual(h.read().completions.map(entry => [entry.unitId, entry.reward.amount]), [[review.id, 17]]);
    const view = learningClassView(h.repository.snapshot().document.data, 'en', 'story-a', 0, '', undefined, '2026-09-10T00:00:00.000Z');
    assert.equal(view.review.stage.stage, 'complete');
    assert.equal(view.dueCount, 3);
    assert.equal(view.records.items.find(item => item.id === 'i1').scheduleReason, '上次独立答对，1 天后复习');

    // Disputing the judgement withdraws its schedule move; deleting an item removes its question.
    await h.service.dispute('en', wrong.attemptId, 'story-a', () => true);
    assert.deepEqual(h.read().items.find(item => item.id === 'i2').schedule, newLearningSchedule(T0));
    await h.service.deleteItem('en', 'i1', 'story-a', () => true);
    assert.deepEqual(h.read().review.exercises.map(exercise => exercise.itemId), ['i2']);
    await h.service.deleteItem('en', 'i2', 'story-a', () => true);
    assert.equal(h.read().review, null);
    await h.service.abandonReview('en', () => true);
    parseLearningData(h.repository.snapshot().document.data);
});
