import type { AdministratorData, AdministratorPage, AdministratorRow } from '../domain/types.js';
import { ADMINISTRATOR_POLICY as POLICY } from '../domain/policy.js';
import { administratorProcessCount } from './process.js';

export function administratorPage(data: AdministratorData, requestedStart?: number): AdministratorPage {
    // References only until the requested page is selected; large message strings are never cloned for frame projection.
    const rows = data.turns.flatMap(turn => [
        ...(turn.user ? [{ turn, role: 'user' as const }] : []),
        ...(turn.assistant !== null || turn.toolMessages.length || turn.operations.length || turn.status !== 'finished' ? [{ turn, role: 'assistant' as const }] : []),
    ]);
    const start = Math.max(0, Math.min(requestedStart ?? Math.max(0, rows.length - POLICY.pageSize), rows.length));
    return { start, total: rows.length, revision: data.revision, rows: rows.slice(start, start + POLICY.pageSize).map(({ turn, role }): AdministratorRow => {
        const text = role === 'user' ? turn.user!.text : turn.assistant ?? '';
        return { revision: data.revision, id: `${turn.id}:${role}`, turnId: turn.id, role, text: text.slice(0, POLICY.textBlock), totalChars: text.length,
            ...(role === 'user' && turn.user?.image ? { image: turn.user.image } : {}),
            processCount: role === 'assistant' ? administratorProcessCount(turn) : 0,
            status: turn.status, error: role === 'assistant' ? turn.error : '', canRegenerate: !!turn.user };
    }) };
}
