// 仅供测试：在当前进程里直接执行工具代码的宿主（实现与 custom-tool-sandbox.js 相同的 define / invoke / dispose 接口）。
// 产品代码里没有这种宿主——用户代码只在浏览器沙盒 iframe 里运行。
import { formatToolResult } from '../../custom-tools.js';

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

export function createInProcessToolHost() {
    const tools = new Map(); // 工具名 → { definition }
    const calls = [];
    return {
        calls,
        async define(_blockId, code) {
            const produced = await new AsyncFunction(code)();
            if (!produced || typeof produced.action !== 'function') throw new Error('代码返回的对象里缺少 action 函数');
            const definition = JSON.parse(JSON.stringify({
                name: produced.name,
                description: produced.description,
                parameters: produced.parameters,
                stealth: produced.stealth === true,
            }));
            tools.set(definition.name, produced);
            return definition;
        },
        async invoke(name, args) {
            const tool = tools.get(name);
            if (!tool) throw new Error(`没有名为 ${name} 的自定义工具`);
            calls.push({ name, args });
            const value = await tool.action(args);
            return formatToolResult(typeof value === 'string' || value === undefined ? value : JSON.stringify(value));
        },
        dispose() {
            tools.clear();
        },
    };
}
