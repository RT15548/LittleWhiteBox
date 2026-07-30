import { isTauriTavernChatSurfaceManaged } from './environment.js';

const LOCKED_CONTROL_IDS = Object.freeze([
    'xiaobaix_enabled', 'xiaobaix_recorded_enabled', 'xiaobaix_preview_enabled',
    'xiaobaix_template_enabled', 'xiaobaix_immersive_enabled',
    'xiaobaix_variables_panel_enabled', 'xiaobaix_story_summary_enabled',
    'xiaobaix_story_outline_enabled', 'xiaobaix_fourth_wall_open_settings',
    'xiaobaix_draw_provider', 'xiaobaix_draw_open_settings',
    'xiaobaix_tts_enabled', 'xiaobaix_tts_open_settings',
    'xiaobaix_render_enabled', 'xiaobaix_max_rendered', 'xiaobaix_reset_btn',
]);

export function lockTauriTavernChatSurfaceSettings(root = document) {
    if (!isTauriTavernChatSurfaceManaged()) return;

    const reason = 'TauriTavern bounded ChatSurface 当前会话已冻结此设置；请先关闭聊天虚拟化并重新加载。';
    for (const id of LOCKED_CONTROL_IDS) {
        const element = root.getElementById(id);
        if (!element) continue;
        element.setAttribute('aria-disabled', 'true');
        element.setAttribute('title', reason);
        element.disabled = true;
        element.classList.add('disabled-control');
    }
}
