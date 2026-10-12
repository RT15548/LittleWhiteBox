import { SERVER_PLUGIN_ID } from './identity.js';

const sourceDirectory = `server-plugin/${SERVER_PLUGIN_ID}`;
const installRoot = 'SillyTavern/plugins';
const installDirectory = `${installRoot}/${SERVER_PLUGIN_ID}`;

export const SERVER_PLUGIN_COPY = Object.freeze({
    sourceDirectory,
    installRoot,
    installDirectory,
    install: `请将扩展内的 ${sourceDirectory} 整个文件夹复制到 ${installRoot}/，在 config.yaml 设置 enableServerPlugins: true，然后重启酒馆。`,
    update: `请将扩展内的 ${sourceDirectory} 整个文件夹复制到 ${installRoot}/，同名文件全部替换，然后重启酒馆。`,
});
