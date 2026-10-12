import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import type { AdministratorRow } from '../domain/types.js';

export async function readAdministratorText(bridge: XiaobaiOsAppProps['bridge'], input: {
    chatIdentity: string; row: AdministratorRow; text: string; through: number; current(): boolean;
}): Promise<string> {
    let text = input.text;
    const { turnId, role, revision, totalChars } = input.row;
    while (text.length < Math.min(input.through, totalChars)) {
        const response = await bridge.request('administrator/text', {
            chatIdentity: input.chatIdentity, turnId, role, revision, offset: text.length,
        }) as { result: { text: string } };
        if (!input.current()) { throw new Error('administrator_context_changed'); }
        text += response.result.text;
    }
    return text;
}
