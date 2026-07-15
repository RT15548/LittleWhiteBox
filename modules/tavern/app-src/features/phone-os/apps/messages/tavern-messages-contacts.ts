import {
    getCharacterNameFromMemoryPath,
    isReservedUserMemoryCharacterName,
} from '../../../../../shared/memory-files';
import type { XbTavernContext } from '../../../../../shared/message-assembler';
import type { TavernMemoryFileRecord } from '../../../../../shared/session-db';

export interface TavernAutomaticCommunicationContact {
    name: string;
    memoryPath: string;
}

function contactNameKey(value: unknown): string {
    return String(value || '').normalize('NFKC').trim().toLocaleLowerCase('zh-CN');
}

export function buildTavernAutomaticCommunicationContacts(
    memoryFiles: Array<Pick<TavernMemoryFileRecord, 'path' | 'status'>>,
    context: XbTavernContext,
): TavernAutomaticCommunicationContact[] {
    const excludedNames = new Set([
        contactNameKey(context.character?.name),
        contactNameKey(context.user?.name),
    ].filter(Boolean));
    const seenNames = new Set<string>();
    const seenPaths = new Set<string>();
    const contacts: TavernAutomaticCommunicationContact[] = [];

    for (const file of memoryFiles) {
        if (file.status === 'stale') {continue;}
        const memoryPath = String(file.path || '').trim();
        const name = getCharacterNameFromMemoryPath(memoryPath);
        const nameKey = contactNameKey(name);
        if (
            !name
            || !nameKey
            || excludedNames.has(nameKey)
            || isReservedUserMemoryCharacterName(name)
            || seenNames.has(nameKey)
            || seenPaths.has(memoryPath)
        ) {continue;}
        seenNames.add(nameKey);
        seenPaths.add(memoryPath);
        contacts.push({ name, memoryPath });
    }

    return contacts.sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'));
}
