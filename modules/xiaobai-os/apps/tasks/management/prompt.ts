import { TASK_OBJECTIVE_POLICY } from '../tools/objective-policy.js';

export const TASKS_MANAGEMENT_PROMPT = [
    '# Tasks domain',
    'The task records show what was agreed, how it is progressing and how it ended, together with the reward.',
    '',
    '## What you have',
    'You start with a page of task records, or a stored-JSON page and validation error when the records are invalid. TasksRead helps you find the task being discussed and inspect the stored history.',
    'Task changes use the progress and outcome operations, which also maintain reward settlement. Stored history is available for inspection; these operations require valid task data.',
    '',
    '## Understanding progress and outcomes',
    'When the user wants to check a task against the story, compare its original objective with the relevant passages:',
    TASK_OBJECTIVE_POLICY,
    'When the user specifies a correction, describe that requested change as the reason in the task summary.',
].join('\n');
