/* eslint-disable -- generated from TypeScript source; run npm run build:tavern */
import { substituteParams } from "../../../../../../../script.js";
import { executeSlashCommandsWithOptions } from "../../../../../../../scripts/slash-commands.js";
function text(value) {
  return String(value ?? "");
}
function normalizePipeValue(value) {
  if (value === void 0 || value === null) {
    return "";
  }
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
async function runTavernSlashCommand(input) {
  const source = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  let command = text(source.command).trim();
  if (!command) {
    return {
      command: "",
      ok: false,
      pipe: "",
      error: "slash_command_required"
    };
  }
  if (!command.startsWith("/")) {
    command = `/${command}`;
  }
  const substitutedCommand = substituteParams(command);
  command = text(substitutedCommand || command).trim() || command;
  const result = await executeSlashCommandsWithOptions(command, {
    handleParserErrors: false,
    handleExecutionErrors: false,
    source: "littlewhitebox-tavern"
  });
  const pipe = normalizePipeValue(result?.pipe);
  const execution = {
    interrupt: result?.interrupt === true,
    isBreak: result?.isBreak === true,
    isAborted: result?.isAborted === true,
    isQuietlyAborted: result?.isQuietlyAborted === true,
    abortReason: text(result?.abortReason),
    isError: result?.isError === true,
    errorMessage: text(result?.errorMessage)
  };
  return {
    command,
    ok: execution.isError !== true && execution.isAborted !== true,
    pipe,
    execution
  };
}
export {
  runTavernSlashCommand
};
