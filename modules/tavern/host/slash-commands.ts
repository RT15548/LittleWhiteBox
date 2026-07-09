import { substituteParams } from '../../../../../../../script.js';
import { executeSlashCommandsWithOptions } from '../../../../../../../scripts/slash-commands.js';

function text(value: unknown): string {
    return String(value ?? '');
}

function normalizePipeValue(value: unknown): string {
    if (value === undefined || value === null) {return '';}
    if (typeof value === 'string') {return value.trim();}
    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
        return String(value);
    }
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
}

export async function runTavernSlashCommand(input: unknown): Promise<Record<string, unknown>> {
    const source = input && typeof input === 'object' && !Array.isArray(input)
        ? input as Record<string, unknown>
        : {};
    let command = text(source.command).trim();
    if (!command) {
        return {
            command: '',
            ok: false,
            pipe: '',
            error: 'slash_command_required',
        };
    }
    if (!command.startsWith('/')) {
        command = `/${command}`;
    }

    const substitutedCommand = substituteParams(command);
    command = text(substitutedCommand || command).trim() || command;
    const result = await executeSlashCommandsWithOptions(command, {
        handleParserErrors: false,
        handleExecutionErrors: false,
        source: 'littlewhitebox-tavern',
    });

    const pipe = normalizePipeValue(result?.pipe);
    const execution = {
        interrupt: result?.interrupt === true,
        isBreak: result?.isBreak === true,
        isAborted: result?.isAborted === true,
        isQuietlyAborted: result?.isQuietlyAborted === true,
        abortReason: text(result?.abortReason),
        isError: result?.isError === true,
        errorMessage: text(result?.errorMessage),
    };

    return {
        command,
        ok: execution.isError !== true && execution.isAborted !== true,
        pipe,
        execution,
    };
}
