import { getContext } from "../../../../extensions.js";
import { SlashCommandAbortController } from "../../../../slash-commands/SlashCommandAbortController.js";

/**
 * 执行 SillyTavern 斜杠命令
 * @param {string} command - 要执行的命令
 * @param {{signal?: AbortSignal}} [options] - 命令链的取消信号
 * @returns {Promise<any>} 命令执行结果
 */
export async function executeSlashCommand(command, { signal } = {}) {
    const controller = signal ? new SlashCommandAbortController() : null;
    const onAbort = () => controller.abort(String(signal.reason || 'Task stopped'), true);
    try {
        if (signal?.aborted) return '';
        signal?.addEventListener('abort', onAbort, { once: true });
        if (!command) return { error: "命令为空" };
        if (!command.startsWith('/')) command = '/' + command;
        const { executeSlashCommands, substituteParams } = getContext();
        if (typeof executeSlashCommands !== 'function') throw new Error("executeSlashCommands 函数不可用");
        command = substituteParams(command);
        const result = controller
            ? await executeSlashCommands(command, true, null, false, null, controller)
            : await executeSlashCommands(command, true);
        if (result && typeof result === 'object' && result.pipe !== undefined) {
            const pipeValue = result.pipe;
            if (typeof pipeValue === 'string') {
                try { return JSON.parse(pipeValue); } catch { return pipeValue; }
            }
            return pipeValue;
        }
        if (typeof result === 'string' && result.trim()) {
            try { return JSON.parse(result); } catch { return result; }
        }
        return result === undefined ? "" : result;
    } finally {
        signal?.removeEventListener('abort', onAbort);
    }
}
