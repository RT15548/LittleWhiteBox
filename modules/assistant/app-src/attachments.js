import { AGENT_IMAGE_INPUT_COPY } from '../../agent-core/config.js';

export const ATTACHMENT_COPY = Object.freeze({
    imageInputDisabled: `当前 API 预设已关闭「${AGENT_IMAGE_INPUT_COPY.label}」。图片仍可预览，接下来的请求只发送文件名；需要模型看图时可在 API 预设中开启。`,
});
const OMITTED_IMAGES_NOTE = names => `Image attachments (filenames only; image input is off for this model preset): ${JSON.stringify(names)}`;
// Provider parts are transient. Let the meter remember a length against the chat
// attachment's lifetime without retaining a data URL or adding a protocol field.
export const uploadPartSources = new WeakMap();

export function createAttachmentsManager(deps) {
    const {
        state,
        showToast,
        render,
        acceptedImageMimeTypes,
        maxImageAttachments,
        maxImageFileBytes,
        isImageInputEnabled = () => true,
    } = deps;

    function normalizeAttachment(item) {
        if (item?.kind !== 'image') return null;
        const type = String(item.type || '').trim().toLowerCase();
        const dataUrl = typeof item.dataUrl === 'string' ? item.dataUrl.trim() : '';
        if (type && !acceptedImageMimeTypes.includes(type)) return null;
        return {
            kind: 'image', name: String(item.name || 'image').trim() || 'image', type: type || 'image/png',
            dataUrl: dataUrl.startsWith('data:image/') ? dataUrl : '', size: Math.max(0, Number(item.size) || 0),
        };
    }

    function normalizeAttachments(attachments) {
        return Array.isArray(attachments) ? attachments.map(normalizeAttachment).filter(Boolean) : [];
    }

    function buildAttachmentSummary(attachments) {
        const normalized = normalizeAttachments(attachments);
        if (!normalized.length) return '';
        const names = normalized.map((item) => item.name).join('、');
        return `[附图 ${normalized.length} 张：${names}]`;
    }

    function buildTextWithAttachmentSummary(text, attachments) {
        const summary = buildAttachmentSummary(attachments);
        const content = String(text || '').trim();
        if (!summary) return content;
        return [content, summary].filter(Boolean).join('\n');
    }

    function buildUserContentParts(message = {}, { imageInput = true } = {}) {
        const sources = Array.isArray(message.attachments) ? message.attachments : [];
        const parts = [];
        const contextPrefix = String(message.contextPrefix || '').trim();
        const contentText = String(message.content || '').trim();
        const finalText = [contextPrefix, contentText].filter(Boolean).join('\n\n');
        if (finalText) {
            parts.push({ type: 'text', text: finalText });
        }
        if (!imageInput && sources.length) {
            const attachments = normalizeAttachments(sources);
            if (attachments.length) parts.push({ type: 'text', text: OMITTED_IMAGES_NOTE(attachments.map(item => item.name)) });
        }
        for (const source of imageInput ? sources : []) {
            const attachment = normalizeAttachment(source);
            if (!attachment?.dataUrl) continue;
            const part = {
                type: 'image_url',
                image_url: { url: attachment.dataUrl },
                mimeType: attachment.type,
                name: attachment.name,
            };
            uploadPartSources.set(part, source);
            parts.push(part);
        }
        return parts.length ? parts : [{ type: 'text', text: '' }];
    }

    function createImageAttachmentFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error(`读取图片失败：${file.name || '未命名图片'}`));
            reader.onload = () => {
                resolve({
                    kind: 'image',
                    name: getImageAttachmentName(file),
                    type: file.type || 'image/png',
                    size: Number(file.size) || 0,
                    dataUrl: typeof reader.result === 'string' ? reader.result : '',
                });
            };
            reader.readAsDataURL(file);
        });
    }

    function getImageAttachmentName(file) {
        const name = typeof file?.name === 'string' ? file.name.trim() : '';
        if (name) return name;
        const ext = getImageExtensionFromMime(file?.type);
        return `clipboard-image-${Date.now()}.${ext}`;
    }

    function getImageExtensionFromMime(mimeType) {
        switch (String(mimeType || '').toLowerCase()) {
            case 'image/jpeg':
                return 'jpg';
            case 'image/webp':
                return 'webp';
            case 'image/gif':
                return 'gif';
            case 'image/png':
            default:
                return 'png';
        }
    }

    function validateImageFiles(files) {
        const normalizedFiles = Array.isArray(files) ? files.filter(Boolean) : [];
        const remainingSlots = Math.max(0, maxImageAttachments - state.draftAttachments.length);
        if (!remainingSlots) {
            return {
                validFiles: [],
                rejectedReason: `最多只能附 ${maxImageAttachments} 张图片`,
                reachedLimit: true,
                hadOverflow: false,
            };
        }

        const acceptedFiles = normalizedFiles.slice(0, remainingSlots);
        const validFiles = [];
        let rejectedReason = '';

        acceptedFiles.forEach((file) => {
            if (!acceptedImageMimeTypes.includes(file.type)) {
                rejectedReason = '只支持 PNG、JPG、WEBP、GIF 图片';
                return;
            }
            if ((Number(file.size) || 0) > maxImageFileBytes) {
                rejectedReason = `单张图片不能超过 ${Math.round(maxImageFileBytes / (1024 * 1024))}MB`;
                return;
            }
            validFiles.push(file);
        });

        return {
            validFiles,
            rejectedReason,
            reachedLimit: false,
            hadOverflow: normalizedFiles.length > remainingSlots,
        };
    }

    async function appendDraftImageFiles(files) {
        const normalizedFiles = Array.isArray(files) ? files.filter(Boolean) : [];
        if (!normalizedFiles.length) return false;

        const { validFiles, rejectedReason, reachedLimit, hadOverflow } = validateImageFiles(normalizedFiles);
        if (!validFiles.length) {
            showToast(rejectedReason || '没有可添加的图片');
            return reachedLimit || Boolean(rejectedReason);
        }

        try {
            const attachments = await Promise.all(validFiles.map((file) => createImageAttachmentFromFile(file)));
            state.draftAttachments = [...state.draftAttachments, ...attachments].slice(0, maxImageAttachments);
            render();
            if (rejectedReason || hadOverflow) {
                showToast(rejectedReason || `最多只能附 ${maxImageAttachments} 张图片`);
            }
            return true;
        } catch (error) {
            showToast(String(error?.message || '读取图片失败'));
            return true;
        }
    }

    function renderAttachmentGallery(container, attachments = [], options = {}) {
        const items = normalizeAttachments(attachments);
        container.replaceChildren();
        container.style.display = items.length ? '' : 'none';
        if (!items.length) return;

        if (!isImageInputEnabled()) {
            const notice = document.createElement('div');
            notice.className = 'xb-assistant-attachment-notice';
            notice.setAttribute('role', 'note');
            notice.textContent = ATTACHMENT_COPY.imageInputDisabled;
            container.appendChild(notice);
        }

        items.forEach((attachment, index) => {
            const card = document.createElement('div');
            card.className = options.compact ? 'xb-assistant-attachment-card compact' : 'xb-assistant-attachment-card';

            if (attachment.dataUrl) {
                const image = document.createElement('img');
                image.className = 'xb-assistant-attachment-image';
                image.src = attachment.dataUrl;
                image.alt = attachment.name;
                card.appendChild(image);
            } else {
                const placeholder = document.createElement('div');
                placeholder.className = 'xb-assistant-attachment-placeholder';
                placeholder.textContent = '图片';
                card.appendChild(placeholder);
            }

            const meta = document.createElement('div');
            meta.className = 'xb-assistant-attachment-name';
            meta.textContent = attachment.name;
            card.appendChild(meta);

            if (typeof options.onRemove === 'function') {
                const removeButton = document.createElement('button');
                removeButton.type = 'button';
                removeButton.className = 'xb-assistant-attachment-remove';
                removeButton.textContent = '×';
                removeButton.title = '移除图片';
                removeButton.addEventListener('click', () => options.onRemove(index));
                card.appendChild(removeButton);
            }

            container.appendChild(card);
        });
    }

    return {
        normalizeAttachments,
        buildAttachmentSummary,
        buildTextWithAttachmentSummary,
        buildUserContentParts,
        appendDraftImageFiles,
        renderAttachmentGallery,
    };
}
