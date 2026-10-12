/** Shared user-facing wording; action IDs and saved state never depend on these labels. */

export const LEARNING_REQUEST_COPY = {
    busy: '上一件事还没做完，等它完成后再试一次吧。这次没有开始。',
    notSent: '这次没有发出去，输入的内容还在。请再试一次。',
    rejected: '这次操作未能完成，请查看最新状态后再继续。',
    unknown: '还没收到确认，操作可能仍在继续。请先查看最新状态，不要重复发送。',
    refresh: '查看最新状态',
};

export const LEARNING_TEACHER_STORAGE_COPY = {
    unconfirmed: '搭子的对话与设置尚未确认保存，已收到的回复保留。',
    conflict: '搭子的对话与设置有另一份已保存的版本，请先核对。',
    failed: '暂时没能打开搭子的对话与设置，请检查保存。',
    verify: '检查搭子记录', adopt: '使用已保存记录',
    adoptWarning: '放弃尚未确认的对话或设置，使用已保存的搭子记录？文章与作文会保留。',
};

export const LEARNING_PROCESS_COPY = {
    title: '学习动态', unknownTool: '准备下一步', stop: '停止本次操作', round: (count: number) => `第 ${count} 轮`,
    history: (count: number) => `${count} 个步骤`, received: (count: number) => `已收到 ${count} 字，正在整理`,
    preparing: '准备中', running: '进行中', done: '完成', failed: '未完成', cancelled: '已停止', 'not-run': '未执行', thinking: '正在思考…',
    results: (count: number) => `找到 ${count} 个候选网页`, extracted: (count: number) => `取回 ${count} 个网页的文字，待选材`,
    paragraphs: (count: number) => `读到 ${count} 段文字`,
    entries: (count: number) => `读到 ${count} 条记录`, sourcesFailed: (count: number) => `${count} 个网页未能用于本次取材`,
    proposedMaterials: (count: number) => `${count} 篇材料`, proposedExercises: (count: number) => `${count} 道练习`,
    outcomes: { finished: '本次已完成', failed: '本次未完成', cancelled: '本次已停止', unconfirmed: '等待确认保存', conflict: '需要核对保存结果' },
    tools: { LearningRead: '查看学习记录', LearningContextRead: '查看相关资料', LearningSearch: '寻找文章', LearningExtract: '读取网页',
        LearningProfileEdit: '调整学习目标', LearningLessonEdit: '准备练习', LearningRequest: '安排练习', LearningModelEssay: '准备范文',
        LearningArticle: '整理阅读正文', LearningReadingNotes: '整理本段知识', LearningEssayTask: '准备写作题',
        LearningAssess: '批改作答', LearningPresent: '打开练习', LearningReveal: '展示学习帮助', LearningSubmit: '保存原答', LearningComplete: '整理学习收获' } as Record<string, string>,
    sections: { overview: '学习概况', training: '本次阅读材料', unit: '本次练习', materials: '阅读材料', exercises: '练习题', attempts: '你的作答',
        notes: '笔记', listening: '听力记录', items: '知识点', review: '到期复习', evidence: '学习记录', completions: '已完成练习', sources: '文章来源' } as Record<string, string>,
};
export const LEARNING_MASTERY_LABELS = { unassessed: '还没练过', review: '待确认', independent: '已能独立使用', practised: '练过一次', strengthen: '再练练' };

export const LEARNING_EVIDENCE_LABEL = (count: number) => `${count} 次作答`;
export const LEARNING_DUE_LABEL = (count: number) => `${count} 个知识点可以温习了`;
export const LEARNING_VOICE_COPY = { settings: '声音设置', enable: '开启语音' };

export const LEARNING_FLOW_COPY = {
    navigation: '本篇学习', reading: '阅读与写作', feedback: '批改与修改', model: '范文', completed: '本篇完成',
    grading: '正在看你的作品…', reviewing: '正在复核修改稿…', modelling: '正在写范文…',
    grade: '批改已提交的作答', continue: '继续', stop: '停止', viewModel: '查看范文',
    review: '开始复习', resumeReview: '继续复习',
    original: '原稿与批注', revision: '修改稿', resolved: '这处已改对',
    setupTitle: '这次想学到哪里', setupSteps: 3, setupContinue: '继续', setupFinish: '确认目标',
    optionalSettings: '讲解语言与兴趣', saveSettings: '保存设置',
};

const contextSwitchConfirmation = { title: '还有内容没提交', accept: '放弃并切换' };
export const LEARNING_CONFIRM_COPY: Record<string, { title: string; accept: string }> = {
    'share-course': { title: '允许这份课件跨故事使用？', accept: '允许跨故事使用' },
    language: contextSwitchConfirmation,
    teacher: contextSwitchConfirmation,
    'replace-lesson': { title: '换一篇练习？', accept: '换一篇' },
    abandon: { title: '放下这次练习？', accept: '放下练习' },
    'abandon-review': { title: '放下这组复习？', accept: '放下复习' },
    'skip-revision': { title: '跳过修改？', accept: '查看范文' },
    'adopt-server': { title: '使用已保存的学习记录？', accept: '使用已保存记录' },
    'adopt-wallet': { title: '使用已保存的钱包？', accept: '使用已保存钱包' },
    'adopt-workbench': { title: '使用已保存的教学对话？', accept: '使用已保存记录' },
    'adopt-teacher': { title: '使用已保存的搭子记录？', accept: '使用已保存记录' },
    'forget-conversation': { title: '清空这段对话？', accept: '清空对话' },
    'delete-language': { title: '删除这门语言的学习数据？', accept: '删除学习数据' },
    clear: { title: '清空所有学习数据？', accept: '清空学习数据' },
    'reset-learning': { title: '重置学习数据？', accept: '重置学习数据' },
    'delete-item': { title: '删除这条学习记录？', accept: '删除记录' },
    'delete-attempt': { title: '删除这次作答？', accept: '删除作答' },
};

export const LEARNING_DISCARD_COPY = {
    resetLearning: '将清空所有语言的目标、课程和学习记录，未领取奖励也将放弃。学习对话和已到账奖励保留。此操作无法撤销。',
    context: '切换后，尚未提交的输入会丢失。已提交的作答和学习记录会保留。',
    companion: '切换语伴会清空尚未发送的聊天内容，当前练习和作答会保留。',
    keepEditing: '继续编辑',
    lesson: '本次练习的材料、作答和笔记会删除；已收入学习本的记录和已获得的奖励会保留。',
    review: '这组已答的题会删除，复习时间安排不变。',
};

export const LEARNING_SHARING_COPY = {
    private: '仅当前故事', action: '跨故事使用',
    confirm: '这份课件、参考答案、讲解和笔记将可用于你的其他故事，里面可能有当前剧情。语伴私聊和原有作答不公开。',
};

export const LEARNING_REVIEW_COPY = {
    answer: '你的作答', saved: '已保存，答完这组再一起看看。', ready: '这组答完了', grade: '批改这组',
    ask: '问语伴',
    retry: '再试一次', cancelRetry: '取消重答',
    verdicts: { correct: '答对了', partial: '对了一部分', incorrect: '还没想起来', disputed: '等待复核' },
};
export const LEARNING_DIALOGUE_COPY = {
    send: '发送', stop: '停止回复', retry: '重试回复',
    assistant: '学习助手', assistantEmpty: '想调整学习安排，还是问问这次的批改？',
    assistantPlaceholder: '问学习助手…', closeAssistant: '回到读写', askAssessment: '问问这次批改',
    clearAssistant: '清空教学对话', clearCompanion: '清空搭子对话',
    clearAssistantConfirm: '清空当前语言的教学对话？文章、作文和学习记录都会保留。',
    clearCompanionConfirm: '清空和当前搭子的对话？文章、作文和学习记录都会保留。',
    assistantStorage: '学习助手的记录暂不可用，请检查保存。已收到的回复保留。',
    verify: '检查保存', adopt: '使用已保存记录',
    adoptConfirm: '放弃本次尚未保存的对话，使用服务器上的记录？',
    skipCompanion: '先自己学', listen: '听这段回复', saveNote: '保存笔记',
} as const;
export const LEARNING_APPROVAL_COPY = {
    title: '替换当前练习？',
    detail: '新内容保存成功后，替换这份课件、作答和笔记。学习本中的记录和已获得的奖励保留。',
    decline: '保留当前练习', accept: '替换并继续',
};
