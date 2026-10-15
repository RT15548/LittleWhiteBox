import { SERVER_PLUGIN_ID } from '../../../shared/server-plugin/identity.js';

export const DRAW_BACKEND_COPY = Object.freeze({
    checking: `正在检测 ${SERVER_PLUGIN_ID}…`,
});

export function createDrawBackendStatusCopy({ version, minimumVersion }) {
    const installed = version ? `v${version}` : '未知';
    return {
        outdated: `${SERVER_PLUGIN_ID} 版本过旧（当前 ${installed}，需要 v${minimumVersion}+）`,
        unreachable: `无法连接 ${SERVER_PLUGIN_ID}，请检查酒馆连接及 enableServerPlugins 设置`,
        notInstalled: `未检测到 ${SERVER_PLUGIN_ID}，请安装或启用后重启酒馆`,
        unavailable: `${SERVER_PLUGIN_ID} 未就绪`,
        backgroundUnsupported: `${SERVER_PLUGIN_ID} 缺少后台绘图能力（当前 ${installed}），请完整更新插件并重启酒馆`,
        v5Unsupported: `${SERVER_PLUGIN_ID} 缺少 NovelAI V5 支持（当前 ${installed}），请完整更新插件并重启酒馆`,
        ready: `${SERVER_PLUGIN_ID} 已就绪${version ? `（${installed}）` : ''}`,
    };
}
