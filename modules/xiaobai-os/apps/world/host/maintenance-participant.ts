import type { MaintenanceParticipant } from '../../../capabilities/maintenance/registry.js';
import type { WorldService } from '../application/service.js';
import { createWorldMaintenanceSession } from '../maintenance/session.js';
import type { WorldSettings } from '../types.js';

export function createWorldMaintenanceParticipant(world: WorldService, readSettings: () => WorldSettings): MaintenanceParticipant {
    return {
        id: 'world',
        isEnabled: mode => mode !== 'automatic' || readSettings().subscribed,
        async createSession(source, mode) {
            const current = await world.refreshCurrent();
            if (!source.chatIdentity || current.chatIdentity !== source.chatIdentity) { throw new Error('world_chat_changed'); }
            if (mode === 'automatic' && !readSettings().subscribed) { return null; }
            return createWorldMaintenanceSession(world, mode);
        },
    };
}
