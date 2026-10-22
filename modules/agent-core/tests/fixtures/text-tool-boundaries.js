// Shared offline samples for source adapters and their browser / Node bundles.
export const wrapCall = call => `<tool_call>${JSON.stringify(call)}</tool_call>`;
export const readCall = { name: 'Read', arguments: { filePath: 'local/a.md' } };
export const readBlock = wrapCall(readCall);
const deleteCall = { name: 'Delete', arguments: { filePath: 'local/example.md' } };
export const deleteExample = wrapCall(deleteCall);
const dsmlRead = '<｜DSML｜invoke name="Read"><｜DSML｜parameter name="filePath" string="true">local/a.md</｜DSML｜parameter></｜DSML｜invoke>';
const dsmlExample = '<｜DSML｜invoke name="Delete"><｜DSML｜parameter name="filePath" string="true">local/example.md</｜DSML｜parameter></｜DSML｜invoke>';
const fileContent = `</think> <think> '${deleteExample}' \`\`\`xml\n${deleteExample}\n\`\`\` \\ "quoted" </｜DSML｜invoke>`;
const writeCall = { name: 'Write', arguments: { filePath: 'local/a.md', content: fileContent } };
const writeBlock = wrapCall(writeCall);

// Examples use explicit code delimiters; natural-language quotes are not a second protocol.
const codeExamples = [
    `\`${deleteExample}\``,
    `\`example\n${deleteExample}\nend\``,
    `\`\`x\`${deleteExample}\`x\`\``,
    `\`\`\`xml\n${deleteExample}\n\`\`\``,
    `> \`\`\`xml\n> ${deleteExample}\n> \`\`\``,
    `    \`\`\`xml\n    ${deleteExample}\n    \`\`\``,
    `\`\`\`xml\n<tool_call>{broken</tool_call>\n\`\`\``,
    `~~~xml\n${deleteExample}\n~~~`,
    `\`\`\`xml\n<!-- literal fence: \`\`\` -->\n${deleteExample}\n\`\`\``,
    `~~~xml\n<!-- literal fence: ~~~ -->\n${deleteExample}\n~~~`,
    `\`\`\`xml\n\`\`\` not a closing fence\n${deleteExample}\n\`\`\``,
    `\`\`\`${deleteExample}\`\`\``,
];
const opaqueThought = `Unfinished quotes: " ' and code: \`\`\`json\n<tool_call>{broken\n${deleteExample}\n<｜DSML｜invoke name="Write"><｜DSML｜parameter>unfinished`;

export const boundaryCases = [
    ...codeExamples.map((quoted, index) => ({
        label: `code example ${index}`, content: `${quoted}\nReady.\n${readBlock}`,
        calls: [readCall], text: `${quoted}\nReady.`.trim(), thoughts: [],
    })),
    { label: 'quoted think name', content: `The marker "<think>" is text.\n${readBlock}`,
        calls: [readCall], text: 'The marker "<think>" is text.', thoughts: [] },
    { label: 'apostrophes', content: `I'll read the user's file.\n${readBlock}`,
        calls: [readCall], text: "I'll read the user's file.", thoughts: [] },
    { label: 'unmatched prose quote', content: `The marker " is unfinished.\n${readBlock}`,
        calls: [readCall], text: 'The marker " is unfinished.', thoughts: [] },
    { label: 'unmatched prose quote before a same-line call', content: `The marker " is unfinished. ${readBlock}`,
        calls: [readCall], text: 'The marker " is unfinished.', thoughts: [] },
    { label: 'unmatched prose quote before a same-line DSML call', content: `The marker " is unfinished. ${dsmlRead}`,
        calls: [readCall], text: 'The marker " is unfinished.', thoughts: [] },
    { label: 'unmatched prose quote before a formatted call', content: `The marker " is unfinished. ${readBlock.replace('{', '{\n')}`,
        calls: [readCall], text: 'The marker " is unfinished.', thoughts: [] },
    { label: 'thought after call', content: `Ready.${readBlock}<think>Example ${deleteExample}</think>Ignored.`,
        calls: [readCall], text: 'Ready.', thoughts: [`Example ${deleteExample}`] },
    { label: 'unfinished thought after call', content: `${readBlock}<think>Example ${deleteExample}`,
        calls: [readCall], text: '', thoughts: [`Example ${deleteExample}`] },
    { label: 'thought between calls', content: `${readBlock}<think>Example ${deleteExample}</think>${readBlock}`,
        calls: [readCall, readCall], text: '', thoughts: [`Example ${deleteExample}`] },
    { label: 'thought contents are not parsed', content: `<think>${opaqueThought}</think>Ready.${readBlock}`,
        calls: [readCall], text: 'Ready.', thoughts: [opaqueThought] },
    { label: 'malformed thought after tool', content: `${readBlock}<think>${opaqueThought}</think>`,
        calls: [readCall], text: '', thoughts: [opaqueThought] },
    { label: 'thought after abandoned opener', content: `<tool_call><think>${opaqueThought}</think>${readBlock}`,
        calls: [readCall], text: '', thoughts: [opaqueThought] },
    { label: 'unclosed code fence', content: `Example:\n\`\`\`xml\n${deleteExample}`,
        calls: [], text: `Example:\n\`\`\`xml\n${deleteExample}`, thoughts: [] },
    { label: 'ordinary trailing bracket', content: 'The comparison sign is <',
        calls: [], text: 'The comparison sign is <', thoughts: [] },
    { label: 'code DSML', content: `\`${dsmlExample}\`\n${dsmlRead}`,
        calls: [readCall], text: `\`${dsmlExample}\``, thoughts: [] },
    { label: 'DSML thought after call', content: `${dsmlRead}<think>Example ${dsmlExample}</think>`,
        calls: [readCall], text: '', thoughts: [`Example ${dsmlExample}`] },
    { label: 'mixed protocols', content: `${dsmlRead}<think>Example ${deleteExample}</think>${readBlock}`,
        calls: [readCall, readCall], text: '', thoughts: [`Example ${deleteExample}`] },
    { label: 'opaque JSON parameters', content: writeBlock,
        calls: [writeCall], text: '', thoughts: [] },
    { label: 'opaque DSML parameters', content: '<｜DSML｜invoke name="Write">'
        + '<｜DSML｜parameter name="filePath" string="true">local/a.md</｜DSML｜parameter>'
        + `<｜DSML｜parameter name="content" string="true">${fileContent}</｜DSML｜parameter></｜DSML｜invoke>`,
        calls: [writeCall], text: '', thoughts: [] },
    { label: 'array', content: `<tool_call>${JSON.stringify([readCall, readCall])}</tool_call>`,
        calls: [readCall, readCall], text: '', thoughts: [] },
    { label: 'sequence', content: `<tool_call>${JSON.stringify(readCall)},\n${JSON.stringify(readCall)}</tool_call>`,
        calls: [readCall, readCall], text: '', thoughts: [] },
    { label: 'inner fence and quoted markers',
        content: `<tool_call>Marker '<tool_call>' and \`<think>\`.\n\`\`\`json\n${JSON.stringify(readCall)}\n\`\`\`</tool_call>`,
        calls: [readCall], text: '', thoughts: [] },
    { label: 'unmatched inline backtick is text', content: `A lone \` marker. ${readBlock}`,
        calls: [readCall], text: 'A lone ` marker.', thoughts: [] },
    { label: 'nearest complete pair after abandoned opener', content: `<tool_call>abandoned\n${readBlock}`,
        calls: [readCall], text: '', thoughts: [] },
    ...['<tool_ca', '<tool_call>{"name":"Read","arguments":{', `<tool_call>${JSON.stringify(readCall)}`].map(tail => ({
        label: `two complete calls before unfinished tail ${tail}`, content: `Ready.${readBlock}${readBlock}${tail}`,
        calls: [readCall, readCall], text: 'Ready.', thoughts: [],
    })),
    { label: 'only an unfinished call', content: 'Ready.<tool_call>{"name":"Read","arguments":{',
        calls: [], text: 'Ready.', thoughts: [] },
    { label: 'complete JSON with a literal closer but no closing tool tag',
        content: readBlock + '<tool_call>{"name":"Write","arguments":{"filePath":"local/a.md","content":"literal </tool_call>"}}',
        calls: [readCall], text: '', thoughts: [] },
];

export const invalidBoundaryCases = [
    readBlock + '<tool_call>{"name": ,"arguments":{}}</tool_call>',
    readBlock + '<tool_call>{"name" "Read","arguments":{}}</tool_call>',
    readBlock + '<tool_call>{"name":null,"arguments":{}}</tool_call>',
    readBlock + '<tool_call>[{"name":"Read","arguments":{}},null]</tool_call>',
    '<tool_call>{"name":"Write}</tool_call>',
    readBlock + '<tool_call>{"name":"Write}</tool_call>' + readBlock,
    readBlock + '<tool_call>{"name":"Write","arguments":{"filePath":"local/a.md","content":"unfinished}}</tool_call>' + readBlock,
];
