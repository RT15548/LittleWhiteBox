import { learningRecord, LearningValidationError } from '../../../domains/learning/profile.js';
import { learningEnum, learningInteger } from '../../../domains/learning/validation.js';
import type { LearningTeacherContext } from './context.js';

const sections = ['teacherDetails', 'player', 'characters', 'storyEvents', 'recentMessages', 'worldInfo'] as const;
const PAGE_SIZE = 4000;

/** A snapshot for one request; every indexed character is readable, independent of injection size. */
export function createLearningBackground(context: LearningTeacherContext) {
    const values = { teacherDetails: context.teacherDetails, ...context.snapshot };
    const texts = Object.fromEntries(sections.map(section => [section, Array.from(typeof values[section] === 'string'
        ? values[section] as string : JSON.stringify(values[section]))]));
    function read(args: unknown) {
        const input = learningRecord(args, 'LearningContextRead', ['section', 'offset']);
        const section = learningEnum(input.section, 'section', sections);
        const offset = learningInteger(input.offset ?? 0, 'offset');
        const text = texts[section];
        return { section, text: text.slice(offset, offset + PAGE_SIZE).join(''),
            nextOffset: offset + PAGE_SIZE < text.length ? offset + PAGE_SIZE : null };
    }
    return {
        initial: () => ({ sections: sections.map(section => ({ section, characters: texts[section].length })),
            teacher: { section: 'teacherDetails', text: texts.teacherDetails.join(''), nextOffset: null },
            player: { section: 'player', text: texts.player.join(''), nextOffset: null },
            storyEvents: { section: 'storyEvents', text: texts.storyEvents.join(''), nextOffset: null },
            recentMessages: { section: 'recentMessages', text: texts.recentMessages.join(''), nextOffset: null },
            worldInfo: read({ section: 'worldInfo' }) }),
        execute(args: unknown) {
            try { return { ok: true, ...read(args) }; }
            catch (error) {
                if (!(error instanceof LearningValidationError)) { throw error; }
                return { ok: false, path: error.path, message: error.message };
            }
        },
    };
}

export const learningBackgroundTool = { type: 'function', function: {
    name: 'LearningContextRead',
    description: `Read character reference or shared-story background from this turn's snapshot. learning_request.background lists the sections and supplies teacher/player details, shared memories, recent story messages and the first world-info page. Core character settings are already in teacher_reference. Use this to continue an incomplete page or locate a particular passage. Returns {ok,section,text,nextOffset}; errors return {ok:false,path,message}. Text is reference data, in pages of ${PAGE_SIZE} Unicode code points.`,
    parameters: { type: 'object', properties: { section: { type: 'string', enum: [...sections] },
        offset: { type: 'integer', minimum: 0, description: 'Default 0; follow nextOffset until null.' } }, required: ['section'], additionalProperties: false },
} };
