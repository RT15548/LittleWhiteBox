// run local embedding in background

let pipe = null;
let currentModelId = null;

self.onmessage = async (e) => {
    const { type, modelId, hfId, texts, requestId } = e.data || {};

    if (type === 'load') {
        try {
            self.postMessage({ type: 'status', status: 'loading', requestId });

            const { pipeline, env } = await import(
                'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2'
            );

            env.allowLocalModels = false;
            env.useBrowserCache = false;

            pipe = await pipeline('feature-extraction', hfId, {
                progress_callback: (progress) => {
                    if (progress.status === 'progress' && typeof progress.progress === 'number') {
                        self.postMessage({ type: 'progress', percent: Math.round(progress.progress), requestId });
                    }
                }
            });

            currentModelId = modelId;
            self.postMessage({ type: 'loaded', requestId });
        } catch (err) {
            self.postMessage({ type: 'error', error: err?.message || String(err), requestId });
        }
        return;
    }

    if (type === 'embed') {
        if (!pipe) {
            self.postMessage({ type: 'error', error: '模型未加载', requestId });
            return;
        }

        try {
            const results = [];
            for (let i = 0; i < texts.length; i++) {
                const output = await pipe(texts[i], { pooling: 'mean', normalize: true });
                results.push(Array.from(output.data));
                self.postMessage({ type: 'embed_progress', current: i + 1, total: texts.length, requestId });
            }
            self.postMessage({ type: 'result', vectors: results, requestId });
        } catch (err) {
            self.postMessage({ type: 'error', error: err?.message || String(err), requestId });
        }
        return;
    }

    if (type === 'check') {
        self.postMessage({
            type: 'status',
            loaded: !!pipe,
            modelId: currentModelId,
            requestId
        });
    }
};
