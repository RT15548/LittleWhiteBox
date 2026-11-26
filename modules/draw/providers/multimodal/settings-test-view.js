import referenceContract from '../../shared/reference-image-contract.cjs';
import { formatScenePlannerProgress } from '../../shared/draw-capsule-copy.js';
import { observeAsyncCallback, observeBackgroundTask } from '../../../../shared/common/async-errors.js';
import { MULTIMODAL_COPY as COPY } from './copy.js';
import { naturalPlannerOptions } from './planning-input.js';

const { validateReferenceImages, MAX_REFERENCE_BYTES, MAX_REFERENCE_IMAGES, MIME_TYPES } = referenceContract;
const LIMIT_NOTE = COPY.referenceLimit(MAX_REFERENCE_IMAGES, MAX_REFERENCE_BYTES / 1024 ** 2);

export function bindTestView({ document, provider, getSettings, report, onPreviewChange, loadRuntime = () => import('./runtime.js'),
    readBlob = async blob => (await import('../../shared/gallery-cache.js')).blobToDataUrl(blob) }) {
    const $ = id => document.getElementById(id);
    const picker = $('mm-reference-files');
    const upload = $('mm-reference-upload');
    const clear = $('mm-reference-clear');
    const prompt = $('mm-prompt');
    const submit = $('mm-generate');
    const cancel = $('mm-cancel');
    const refList = $('mm-references');
    const resultList = $('mm-test-results');
    let references = [];
    let previewUrls = [];
    let adding = false;
    let active = null;
    let destroyed = false;
    let lastAgentRequest = null;
    const url = document.defaultView.URL;

    picker.accept = MIME_TYPES.join(',');
    $('mm-reference-limit').textContent = LIMIT_NOTE;
    const testStatus = (state, text) => report('mm-test-status', state, text);
    const referenceStatus = (state, text) => report('mm-reference-status', state, text);
    const countLabel = () => references.length ? COPY.referenceCount(references.length) : '';

    function action(label, handler) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-sm';
        button.textContent = label;
        button.addEventListener('click', handler);
        return button;
    }
    function tile(src, alt, actions) {
        const figure = document.createElement('figure');
        const image = document.createElement('img');
        image.className = 'gallery-slot-thumb';
        image.src = src;
        image.alt = alt;
        const bar = document.createElement('figcaption');
        bar.className = 'mm-image-actions';
        bar.append(...actions);
        figure.append(image, bar);
        return figure;
    }
    function setControls() {
        upload.disabled = adding;
        clear.hidden = references.length === 0;
        clear.disabled = adding;
        submit.disabled = adding || Boolean(active);
        cancel.hidden = !active;
        refList.querySelectorAll('button').forEach(button => { button.disabled = adding; });
        resultList.querySelectorAll('button').forEach(button => { button.disabled = adding; });
    }
    function redrawReferences() {
        refList.replaceChildren(...references.map(({ src }, index) => tile(src, COPY.referenceAlt(index + 1), [
            action(COPY.removeReference, () => {
                const [removed] = references.splice(index, 1);
                url.revokeObjectURL(removed.src);
                redrawReferences();
            }),
        ])));
        referenceStatus('', countLabel());
        setControls();
    }
    function resetReferences() {
        references.forEach(({ src }) => url.revokeObjectURL(src));
        references = [];
        redrawReferences();
    }
    async function addFiles(files) {
        if (adding || destroyed || !files.length) return;
        if (files.some(file => !MIME_TYPES.includes(file.type))) {
            referenceStatus('error', COPY.invalidReference);
            return;
        }
        if (files.length + references.length > MAX_REFERENCE_IMAGES
            || [...references.map(({ blob }) => blob), ...files].reduce((size, file) => size + file.size, 0) > MAX_REFERENCE_BYTES) {
            referenceStatus('error', LIMIT_NOTE);
            return;
        }
        adding = true;
        setControls();
        try {
            const next = await Promise.all(files.map(async blob => ({ blob, mimeType: blob.type, data: (await readBlob(blob)).split(',')[1] })));
            if (destroyed) return;
            validateReferenceImages([...references, ...next]);
            references.push(...next.map(item => ({ ...item, src: url.createObjectURL(item.blob) })));
            redrawReferences();
        } catch (error) {
            if (!destroyed) referenceStatus('error', COPY.invalidReference);
            console.warn({ source: import.meta.url, operation: 'readReferenceImages' }, error);
        } finally {
            adding = false;
            if (!destroyed) setControls();
        }
    }
    function clearResult() {
        previewUrls.forEach(src => url.revokeObjectURL(src));
        previewUrls = [];
        resultList.replaceChildren();
    }
    function showResults(images) {
        clearResult();
        resultList.append(...images.map((blob, index) => {
            const src = url.createObjectURL(blob);
            previewUrls.push(src);
            const download = document.createElement('a');
            download.className = 'btn btn-sm';
            download.href = src;
            download.download = `draw-${index + 1}.${referenceContract.MIME_EXTENSIONS[blob.type] || blob.type.split('/').at(-1)}`;
            download.textContent = COPY.download;
            return tile(src, COPY.imageAlt, [download, action(COPY.useReference, () => {
                observeBackgroundTask(addFiles([blob]).then(() => {
                    if (!destroyed) refList.scrollIntoView({ block: 'nearest' });
                }), { source: import.meta.url, operation: 'useGeneratedReference' });
            })]);
        }));
    }
    const getRequest = () => ({
        prompt: prompt.value.trim(),
        referenceImages: references.map(({ mimeType, data }) => ({ mimeType, data })),
    });
    // The scene Agent sees reference count, not bytes or image-service credentials.
    const previewKey = (input, settings) => JSON.stringify([input.prompt, naturalPlannerOptions(provider, settings, input)]);
    async function generate() {
        if (active || adding) return;
        if (!prompt.value.trim()) { testStatus('error', COPY.missingPrompt); prompt.focus(); return; }
        const controller = new AbortController();
        const { signal } = controller;
        active = controller;
        const settings = getSettings();
        const request = getRequest();
        const key = previewKey(request, settings);
        lastAgentRequest = null;
        onPreviewChange?.();
        setControls();
        testStatus('pending', COPY.analysis);
        try {
            const runtime = await loadRuntime();
            signal.throwIfAborted();
            const { images } = await runtime.generateTestImage(provider, {
                ...request, settings, signal,
                onAgentRequest: task => {
                    if (destroyed || signal.aborted) return;
                    lastAgentRequest = { key, task };
                    onPreviewChange?.();
                },
                onProgress: progress => {
                    if (destroyed || signal.aborted) return;
                    testStatus('pending', progress.state === 'llm' ? formatScenePlannerProgress(progress)
                        : progress.current && progress.total ? COPY.generatingCount(progress.current, progress.total) : COPY.generating);
                },
            });
            if (destroyed) return;
            showResults(images);
            testStatus('success', COPY.previewReady);
        } catch (error) {
            if (destroyed) return;
            const partial = error.partialResult?.images;
            if (partial?.length) showResults(partial);
            testStatus(signal.aborted ? '' : 'error', signal.aborted ? COPY.cancelled
                : partial?.length ? `${COPY.previewPartial} · ${error.message}` : error.message || COPY.testError);
        } finally {
            active = null;
            if (!destroyed) setControls();
        }
    }
    upload.addEventListener('click', () => picker.click());
    picker.addEventListener('change', () => {
        const files = Array.from(picker.files);
        picker.value = '';
        observeBackgroundTask(addFiles(files), { source: import.meta.url, operation: 'uploadReferenceImages' });
    });
    clear.addEventListener('click', resetReferences);
    submit.addEventListener('click', observeAsyncCallback(generate, { source: import.meta.url, operation: 'generateTestImage' }));
    cancel.addEventListener('click', () => active?.abort());
    return {
        getPreview(settings) {
            const input = getRequest();
            return { input, sentRequest: lastAgentRequest?.key === previewKey(input, settings) ? lastAgentRequest.task : null };
        },
        destroy() {
            destroyed = true;
            active?.abort();
            resetReferences();
            clearResult();
        },
    };
}
