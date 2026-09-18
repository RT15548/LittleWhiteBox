import { is_send_press } from '../../../../../../../script.js';
import { is_group_generating } from '../../../../../../group-chats.js';

// ST 1.14 exposes these live flags but not the isGenerating helper added later.
// Keep this boundary while supporting hosts without that convenience export.
export function isGenerating(): boolean {
    return is_send_press || is_group_generating;
}
