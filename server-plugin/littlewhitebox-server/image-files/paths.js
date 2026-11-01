'use strict';

const path = require('node:path');

const MAX_FOLDER_DEPTH = 2;
const MAX_SEGMENT_BYTES = 200;
// Windows 保留设备名（含带扩展名的写法），建文件夹会失败或指向设备。
const RESERVED_NAME = /^(con|prn|aux|nul|com\d|lpt\d)(\..*)?$/i;

/**
 * 与 SillyTavern 上传接口使用的 sanitize-filename 同一规则：删去非法字符、结尾的点与空格，
 * 并拒绝保留名；这样两级目录和 ST 自带的单级目录对同一个角色名得到同一个文件夹名。
 * 结果为空、`.`、`..` 时返回 null，调用方应拒绝请求，而不是退回上级目录。
 * @param {unknown} value
 * @returns {string|null}
 */
function sanitizeSegment(value) {
    if (typeof value !== 'string') return null;
    let name = value.replace(/[/\\?<>:*|"\u0000-\u001f\u0080-\u009f]/g, '').replace(/[. ]+$/, '');
    if (!name || /^\.+$/.test(name) || RESERVED_NAME.test(name)) return null;
    while (Buffer.byteLength(name) > MAX_SEGMENT_BYTES) name = name.slice(0, -1);
    return name.replace(/[. ]+$/, '') || null;
}

/**
 * 把前端给的 1~2 级文件夹名解析到用户图片目录之下；任何一级不合法都整体拒绝。
 * @param {string} imagesRoot request.user.directories.userImages
 * @param {unknown} folder
 * @returns {{ directory: string, segments: string[] }|null}
 */
function resolveImageFolder(imagesRoot, folder) {
    if (typeof imagesRoot !== 'string' || !imagesRoot) return null;
    if (!Array.isArray(folder) || folder.length < 1 || folder.length > MAX_FOLDER_DEPTH) return null;
    const segments = folder.map(sanitizeSegment);
    if (segments.some(segment => segment === null)) return null;
    const root = path.resolve(imagesRoot);
    const directory = path.resolve(root, ...segments);
    const relative = path.relative(root, directory);
    // 分隔符已被删掉，这里是第二道防线：解析结果必须仍在图片目录内。
    if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) return null;
    return { directory, segments };
}

/** 与酒馆 clientRelativePath 同形：以用户根目录为基准、正斜杠、以 / 开头（如 /user/images/角色/a.png）。 */
function toClientPath(userRoot, filePath) {
    const root = path.resolve(userRoot);
    const target = path.resolve(filePath);
    if (!target.startsWith(root + path.sep)) return null;
    return target.slice(root.length).split(path.sep).join('/');
}

module.exports = { MAX_FOLDER_DEPTH, resolveImageFolder, sanitizeSegment, toClientPath };
