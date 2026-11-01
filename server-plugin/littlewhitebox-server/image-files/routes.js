'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { resolveImageFolder, sanitizeSegment, toClientPath } = require('./paths.js');

const IMAGE_SAVE_CAPABILITY = 'image-save-v1';
const OPEN_FOLDER_CAPABILITY = 'open-folder-v1';
const IMAGE_FORMATS = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif']);
// 酒馆的 JSON 请求体上限是 500 MB；单张生成图远小于此，这里再收紧一道。
const MAX_IMAGE_BASE64_CHARS = 128 * 1024 * 1024;

function fail(res, status, code, error) {
    return res.status(status).send({ ok: false, code, error });
}

/** 浏览器与酒馆在同一台机器上：直连环回地址或本机网卡地址，且没有经过反向代理转发。 */
function isLocalRequest(req, listInterfaces = os.networkInterfaces) {
    const headers = req.headers || {};
    if (headers['x-forwarded-for'] || headers.forwarded || headers['x-real-ip']) return false;
    const address = String(req.socket?.remoteAddress || '').replace(/^::ffff:/i, '');
    if (!address) return false;
    if (address === '::1' || address.startsWith('127.')) return true;
    return Object.values(listInterfaces()).flat().some(item => item?.address === address);
}

/** 在系统文件管理器中打开目录：只传参数数组、不经 shell；进程启动后即脱离，不等待窗口关闭。 */
function launchFileManager(directory, { platform = process.platform, spawnImpl = spawn } = {}) {
    const command = platform === 'win32' ? 'explorer.exe' : platform === 'darwin' ? 'open' : 'xdg-open';
    return new Promise((resolve, reject) => {
        const child = spawnImpl(command, [directory], { detached: true, stdio: 'ignore' });
        child.once('error', reject);
        child.once('spawn', () => { child.unref(); resolve(); });
    });
}

async function findExistingDirectory(files, directory, imagesRoot) {
    for (let current = directory; ; current = path.dirname(current)) {
        const stat = await files.stat(current).catch(() => null);
        if (stat?.isDirectory()) return current;
        if (current === imagesRoot || current === path.dirname(current)) return null;
    }
}

function getImagesContext(req) {
    const directories = req.user?.directories;
    return req.user?.profile?.handle && directories?.userImages && directories.root ? directories : null;
}

function registerImageFileRoutes(router, { files = fs.promises, launch = launchFileManager, isLocal = isLocalRequest } = {}) {
    // 与酒馆 /api/images/upload 相同：写入用户图片目录，返回同形的相对路径；区别是允许两级文件夹。
    router.post('/v1/images/save', async (req, res) => {
        res.setHeader('Cache-Control', 'no-store');
        const directories = getImagesContext(req);
        if (!directories) return fail(res, 403, 'authenticated_profile_required', 'Authenticated user profile is required');
        const { image, format, filename, folder } = req.body || {};
        if (typeof image !== 'string' || !image || image.length > MAX_IMAGE_BASE64_CHARS) {
            return fail(res, 400, 'invalid_image', 'A base64 image within the size limit is required');
        }
        if (!IMAGE_FORMATS.has(format)) return fail(res, 400, 'invalid_format', 'Invalid image format');
        const target = resolveImageFolder(directories.userImages, folder);
        if (!target) return fail(res, 400, 'invalid_folder', 'folder must be one or two safe folder names');
        const name = filename === undefined ? String(Date.now()) : sanitizeSegment(String(filename).replace(/\./g, '_'));
        if (!name) return fail(res, 400, 'invalid_filename', 'filename is not usable');
        try {
            const file = path.join(target.directory, `${name}.${format}`);
            await files.mkdir(target.directory, { recursive: true });
            await files.writeFile(file, new Uint8Array(Buffer.from(image, 'base64')));
            const clientPath = toClientPath(directories.root, file);
            if (!clientPath) return fail(res, 500, 'path_outside_user_root', 'Saved image is outside the user directory');
            return res.status(200).send({ ok: true, path: clientPath });
        } catch (error) {
            console.error('[littlewhitebox-server] save image failed:', error);
            return fail(res, 500, 'save_failed', 'Failed to save the image');
        }
    });

    // 只在酒馆所在机器上打开：不带 folder 时打开用户图片根目录（user/images）；带 folder 时须是用户图片目录之内的
    // 一到两级安全名字，目录尚不存在则退到最近的上级。
    router.post('/v1/images/open-folder', async (req, res) => {
        res.setHeader('Cache-Control', 'no-store');
        const directories = getImagesContext(req);
        if (!directories) return fail(res, 403, 'authenticated_profile_required', 'Authenticated user profile is required');
        if (!isLocal(req)) return fail(res, 403, 'not_local', 'The folder can only be opened when the browser runs on the Tavern machine');
        const imagesRoot = path.resolve(directories.userImages);
        const folder = req.body?.folder;
        const target = folder === undefined ? { directory: imagesRoot } : resolveImageFolder(directories.userImages, folder);
        if (!target) return fail(res, 400, 'invalid_folder', 'folder must be one or two safe folder names');
        try {
            // 根目录是酒馆自己的用户目录，还没有图片时可能尚未创建。
            if (folder === undefined) await files.mkdir(imagesRoot, { recursive: true });
            const existing = await findExistingDirectory(files, target.directory, imagesRoot);
            if (!existing) return fail(res, 404, 'folder_missing', 'No image folder exists yet');
            await launch(existing);
            return res.status(200).send({ ok: true, path: toClientPath(directories.root, existing), exact: existing === target.directory });
        } catch (error) {
            console.error('[littlewhitebox-server] open folder failed:', error);
            return fail(res, 500, 'open_failed', 'The file manager could not be started');
        }
    });
}

module.exports = { IMAGE_SAVE_CAPABILITY, OPEN_FOLDER_CAPABILITY, isLocalRequest, launchFileManager, registerImageFileRoutes };
