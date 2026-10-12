import { extensionFolderPath } from '../../core/constants.js';
import { SERVER_PLUGIN_ID } from './identity.js';
import { SERVER_PLUGIN_COPY } from './copy.js';

export const SERVER_PLUGIN_INSTALLATION = Object.freeze({
    open: '安装指引',
    close: '关闭',
    title: `${SERVER_PLUGIN_ID} 安装指引`,
    steps: [
        { text: '等正在运行的任务完成并保存结果，然后关闭酒馆。' },
        { text: `打开 ${SERVER_PLUGIN_COPY.installRoot}/。如果有下面这两个旧文件夹，删除它们；没有就跳过。`,
            code: 'littlewhitebox-image-jobs\nlittlewhitebox-nai' },
        { text: '找到下面这个文件夹：',
            code: `SillyTavern/public/${extensionFolderPath}/${SERVER_PLUGIN_COPY.sourceDirectory}/` },
        { text: `把 ${SERVER_PLUGIN_ID} 整个文件夹复制到下面的位置，里面的文件全部一起复制。提示有同名文件时，选择“全部替换”。`,
            code: `${SERVER_PLUGIN_COPY.installRoot}/` },
        { text: '用文本编辑器打开 SillyTavern/config.yaml，把 enableServerPlugins 改成下面这样；没有就新增一行：',
            code: 'enableServerPlugins: true' },
        { text: '重新启动酒馆，再刷新当前页面。' },
    ],
});
