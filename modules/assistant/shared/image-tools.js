export const READ_IMAGE = 'ReadImage';
export const READ_IMAGE_TOOL = { type: 'function', function: { name: READ_IMAGE,
    description: 'Show a workspace image to you and the user. Read and Grep cover text files; this covers PNG, JPEG, WebP and GIF files under local/, whether imported or generated. Returns {ok,images:[{path,name,kind,mimeType,sizeBytes,blobId}]}.',
    parameters: { type: 'object', properties: { path: { type: 'string', description: 'Workspace image path.' } }, required: ['path'], additionalProperties: false },
} };
const unavailable = '图片已删除或无法读取。';
export const IMAGE_ERRORS = Object.freeze({
    workspace_image_path_invalid: '图片路径无效，请使用 PNG、JPEG、WebP 或 GIF 文件名。',
    workspace_image_format_invalid: '图片内容为空，或图片格式与文件名不匹配。',
    workspace_image_blob_not_found: unavailable,
    workspace_image_required: '该文件不是图片，可以用文本查看器打开。',
    workspace_image_blob_required: '图片内容缺失，没有保存这次改动。',
    unsupported_text_file: '此操作用于文本文件；图片请导入工作区，或用绘图工具创建。',
});
export const IMAGE_COPY = Object.freeze({ read: '查看图片', unavailable, open: '在工作区打开',
    result: count => `已查看 ${count} 张图片`, preview: '图片预览', download: '下载图片' });

export function imageResultFiles(result) {
    return (Array.isArray(result?.images) ? result.images : []).filter(file => file?.kind === 'image'
        && typeof file.blobId === 'string' && typeof file.path === 'string' && file.path.startsWith('local/'));
}
export function messageImages(message) {
    if (message?.role !== 'tool') return [];
    try { return imageResultFiles(JSON.parse(message.content)); } catch { return []; }
}
