import type { ManagementTool } from '../../../capabilities/management/index.js';
import { MANAGEMENT_READ_CHARS } from '../../../capabilities/management/read-page.js';
import { worldEditTool } from '../tools/tool-contract.js';
import { withDocumentEdit, withDocumentRead } from '../../../capabilities/management/document-tools.js';

export function createWorldManagementTools(): readonly ManagementTool[] {
    const tools: ManagementTool[] = [
        { effect: 'read', label: '查看世界记录', target: args => String(args.id ?? ''), definition: { type: 'function', function: {
            name: 'WorldRead',
            description: [
                'Read the current overview and news list as {overview,news:[{id,title}]}, or one complete article as {id,title,body}. A missing article reads as null.',
                `data contains a JSON text page with text, offset, nextOffset and totalChars, at most ${MANAGEMENT_READ_CHARS} characters.`,
                'Use it to read article bodies omitted from the initial data or refresh records before a change. Continue with nextOffset while it is not null.',
            ].join('\n'),
            parameters: { type: 'object', properties: {
                id: { type: 'string', description: 'Exact article ID. Omit to read the overview and article list.' },
                offset: { type: 'integer', minimum: 0, description: 'Character offset in the result JSON. Default 0; use nextOffset to continue.' },
            }, additionalProperties: false },
        } } },
        { effect: 'write', label: '修改世界记录', target: () => '', definition: worldEditTool([
            'This call saves the batch. Returns {ok,status,data?}; status is saved, unchanged or failed.',
            'A saved result includes data:{overview,news:[{id,title}]}; unchanged has no data; failed includes data:{errors:[{path,message}]}.',
        ].join('\n')) as ManagementTool['definition'] },
    ];
    withDocumentRead(tools[0].definition);
    withDocumentEdit(tools[1].definition);
    return tools;
}
