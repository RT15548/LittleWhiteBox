import { getRequestHeaders, syncMesToSwipe } from '../../../../../../../../script.js';
import { getContext } from '../../../../../../../extensions.js';
import { createModuleEvents, event_types } from '../../../../core/event-manager.js';
import { observeBackgroundTask } from '../../../../shared/common/async-errors.js';
import { MediaApiError } from '../../../../shared/media-api.js';
import { drawNotify } from '../../shared/draw-toast.js';
import {
    classifyError, ensureDrawImageStyles, findLastAIMessageId, isMessageBeingEdited,
    setImageTitleSettingsProvider, startSharedDrawPreviewRuntime, stopSharedDrawPreviewRuntime, toScenePlannerProgress,
} from '../../shared/draw-common.js';
import { getSharedDrawSettings, loadSharedDrawSettings } from '../../shared/draw-settings.js';
import { stripDrawImageSlots } from '../../shared/image-marker-syntax.js';
import { normalizeMessageSceneSourceText } from '../../shared/scene-source.js';
import { bindScenePlanSource } from '../../shared/scene-placement.js';
import { retryScenePlanning } from '../../shared/planner-retry.js';
import { requestDrawChatSave } from '../../shared/draw-chat-save.js';
import { DRAW_SLOT_COPY, DRAW_SLOT_ERRORS } from '../../shared/image-record.js';
import { getImageChatIdentity } from '../../shared/chat-image-persistence.js';
import { adaptUnplannedTask } from './direct-generation.js';
import { runTextImages } from './text-runtime.js';
import { prepareScenePlannerInput } from '../../shared/scene-planner.js';
import { submitProviderDrawRun } from '../../shared/draw-run-browser.js';
import { cancelFloorDrawWork, captureDrawCancellationTarget } from '../../shared/draw-run-controls.js';
import { getDrawRunAutomaticCompletion, listActiveSwipeDrawRunMarkers, setDrawRunAutomaticCompletion } from '../../shared/draw-run-markers.js';
import {
    acquireFloorImageJob, clearFloorImageJobs, failFloorImageJob, getFloorImageJob, getFloorImageJobs,
    getFloorImagePhase, getFloorImageState, observeFloorImageJob, rebaseFloorImageJobsAfterSwipeDeletion,
    releaseFloorImageJob, resolveFloorImageJobTarget,
} from '../../shared/floor-image-job.js';
import { createImageCardRedrawProvider } from '../../shared/image-card-redraw-provider.js';
import { bindMultimodalImageCards } from './image-card-runtime.js';
import { prepareImageInput } from '../../shared/prepared-image-input.js';
import { registerPreparedImageProvider, submitPreparedChatImages } from '../../shared/prepared-chat-images.js';
import { imageFilePrefix } from '../../shared/image-autosave.js';
import {
    createBackendItemError, createImageBackendJobMonitorRegistry, fetchImageBackendJobsStatus,
    hasImageBackendJobsCapability, IMAGE_JOBS_UNAVAILABLE_MESSAGE, readImageBackendResultBase64, reportImageBackendJobState,
} from '../../shared/backend-image-jobs.js';
import { submitRecoverableImageJob } from '../../shared/recoverable-image-jobs.js';
import { buildPlannerOptions, planDirectInput, runMultimodalScenePlan } from './planning.js';
import { compileMultimodalBatch, createGenerationRecipe, openAiImageMetadata } from './compiler.js';
import { getSizeOptions as providerSizeOptions, providerDefinition } from './settings-model.js';
import { getSettings, loadSettings, subscribeSettings, updateSettingsPersistent as updateProviderSettings } from './settings.js';
import { MULTIMODAL_COPY as COPY } from './copy.js';
import { createMultimodalFrontendTransport } from './frontend-transport.js';

export function createMultimodalChatRuntime(provider, client, { openSettings, closeSettings }) {
    const label = providerDefinition(provider).label;
    const events = createModuleEvents(`${provider}Draw`);
    const monitors = createImageBackendJobMonitorRegistry({ active: false });
    const frontend = createMultimodalFrontendTransport(provider);
    const jobs = new Map();
    const settings = () => getSettings(provider);
    const adaptTask = (task, config, options) => adaptUnplannedTask(provider, task, config, { ...options, plan: planDirectInput });
    const filePrefix = imageFilePrefix(provider);
    let panel, unregisterPrepared, unbindCards, unsubscribeSettings;
    let lifecycle = 0;
    let loading = null;
    let ready = false;

    function createJob(messageId, options) {
        return acquireFloorImageJob(jobs, getContext(), messageId, () => ({ phase: 'starting',
            controller: new AbortController(), backendCancel: new AbortController(), abortReason: null }), options);
    }
    const releaseJob = job => releaseFloorImageJob(jobs, job);
    const getJob = messageId => getFloorImageJob(jobs, getContext(), messageId);
    const getGenerationState = messageId => getFloorImageState(jobs, getContext(), messageId);

    function cancelIfChatLeft(job, currentChat) {
        if (!job.nativeChat || job.nativeChat === currentChat || job.released) return;
        job.backendCancel.abort();
        job.controller.abort(new DOMException(DRAW_SLOT_ERRORS.interrupted.label, 'AbortError'));
    }

    function abortGeneration(messageId = null, { reason = 'user', target = captureDrawCancellationTarget(messageId) } = {}) {
        const selected = messageId == null ? [...jobs.values()] : getFloorImageJobs(jobs, getContext(), messageId, target);
        if (reason === 'user') return cancelFloorDrawWork(messageId, { target, jobs: selected });
        for (const job of selected) {
            job.abortReason ||= reason;
            job.controller.abort();
        }
        return selected.length > 0;
    }

    function runBatch(options) {
        return options.backend ? runBackendBatch(options) : frontend.runBatch(options);
    }

    async function runBackendBatch({ compiledBatch, recoverable, signal, backendCancel, monitorGeneration, checkChat, onStateChange, onItemReady, onItemSettled }) {
        signal?.throwIfAborted();
        const scope = monitors.createScope(backendCancel ? signal : null, monitorGeneration);
        try {
            const status = await fetchImageBackendJobsStatus({ getHeaders: getRequestHeaders, signal });
            checkChat?.();
            signal?.throwIfAborted();
            scope.signal.throwIfAborted();
            if (!hasImageBackendJobsCapability(status)) throw new Error(IMAGE_JOBS_UNAVAILABLE_MESSAGE);
            const { context, delay, items } = compiledBatch;
            return await submitRecoverableImageJob({ ...recoverable, client, provider,
                request: { provider, context, delay, items },
                cancelSignal: backendCancel || signal, detachSignal: scope.signal,
                onStateChange: (state, data) => reportImageBackendJobState(onStateChange, state, data),
                onItemReady: async ({ response, ...details }) => onItemReady?.({ ...details, base64: await readImageBackendResultBase64(response) }),
                onItemSettled: item => !item.alreadyDelivered && onItemSettled?.({ ...item,
                    error: item.source === 'frontend' ? item.error : createBackendItemError(item, context) }),
            });
        } finally { scope.dispose(); }
    }

    function recipeFor(config, options) {
        if (!config.apiKey) throw new MediaApiError('not_configured');
        return createGenerationRecipe(provider, config, options);
    }

    async function submitPrepared(input, tasks, recipe, monitorGeneration, backend) {
        const { job } = input;
        const { metadata, compiledBatch } = prepareImageInput(provider, tasks, recipe);
        job.phase = 'gen';
        return submitPreparedChatImages({ ...input, tasks, metadata, filePrefix,
            signal: job.controller.signal, backend,
            run: handlers => runBatch({ ...handlers, backend, compiledBatch, backendCancel: job.backendCancel.signal, monitorGeneration }),
        });
    }

    // Native tags and redraws are not scene-planner output. Preserve their
    // exact placement, and rewrite each complete request before any image job.
    async function runPrepared(input) {
        const monitorGeneration = monitors.captureGeneration();
        const { job, onStateChange } = input;
        const signal = job.controller.signal;
        const config = input.settings || settings();
        const backend = config.sendMode === 'backend';
        job.phase = 'llm';
        const adapt = (task, recipe) => adaptTask(task, config, {
            signal, onStateChange, promptOverride: input.promptOverride, negativePrompt: input.negativePromptOverride,
            referenceImages: recipe.referenceImages,
        });
        if (input.nativeMessage) {
            let recipe;
            const providerMetadata = provider === 'openai' ? openAiImageMetadata(config) : undefined;
            job.nativeChat = getImageChatIdentity(input.ctx);
            const checkChat = () => cancelIfChatLeft(job, getImageChatIdentity(getContext()));
            return submitPreparedChatImages({ ...input, filePrefix, signal, backend, followReloadedSlot: true,
                // The original input belongs to the chat slot, survives reload,
                // and stays editable even when the scene model fails.
                metadata: input.tasks.map(task => ({ tags: task.scene, providerMetadata })),
                prepareItem: index => {
                    checkChat();
                    signal.throwIfAborted();
                    if (!recipe) {
                        recipe = recipeFor(config, input);
                        if (providerMetadata) providerMetadata.requestedOutputFormat = recipe.params.outputFormat;
                    }
                    return adapt(input.tasks[index], recipe);
                },
                run: ({ preparedItems, ...handlers }) => {
                    const compiledBatch = compileMultimodalBatch(provider, preparedItems, recipe);
                    job.phase = 'gen';
                    return runBatch({ ...handlers, backend, compiledBatch, backendCancel: job.backendCancel.signal, monitorGeneration, checkChat });
                },
            });
        }
        const recipe = recipeFor(config, input);
        const tasks = [];
        for (const task of input.tasks) {
            tasks.push(await adapt(task, recipe));
        }
        return submitPrepared(input, tasks, recipe, monitorGeneration, backend);
    }

    async function generateAndInsertImages(input = {}) {
        const { promptOverride, negativePromptOverride, automatic = false, onStateChange } = input;
        const messageId = input.messageId == null ? findLastAIMessageId() : Number(input.messageId);
        const job = createJob(messageId);
        const signal = job.controller.signal;
        const monitorGeneration = monitors.captureGeneration();
        const report = observeFloorImageJob(job, { getCurrentContext: getContext, classifyError,
            onStateChange: onStateChange || ((state, data, id) => panel?.setStateForMessage(id, state, data)) });
        try {
            const [config, sharedSettings] = await Promise.all([loadSettings(provider), loadSharedDrawSettings()]);
            signal.throwIfAborted();
            const { ctx, message, messageId: liveId } = resolveFloorImageJobTarget(job, getContext());
            if (message.is_user) throw new Error(DRAW_SLOT_COPY.sourceChanged);
            const manual = sharedSettings.autoGenerateImages === false;
            const backend = config.sendMode === 'backend';
            const recipe = manual ? createGenerationRecipe(provider, config, input) : recipeFor(config, input);
            const planOptions = () => buildPlannerOptions(provider, { message, settings: config,
                sharedSettings, signal, onStateChange: report, negativePrompt: negativePromptOverride,
                referenceImages: recipe.referenceImages });
            const preparedInput = sourceText => ({ ctx, message, messageId: liveId, sourceText, job, onStateChange: report,
                swipeIndex: job.swipeIndex, manual, onPlacement: () => requestDrawChatSave(ctx) });
            if (promptOverride?.trim()) {
                const sourceText = message.mes;
                job.phase = 'llm';
                const task = await adaptTask({ scene: promptOverride, placement: { mode: 'tail' } }, config,
                    { signal, onStateChange: report, negativePrompt: negativePromptOverride, referenceImages: recipe.referenceImages });
                return await submitPrepared(preparedInput(sourceText), [task], recipe, monitorGeneration, backend);
            }
            if (!backend || manual) {
                job.phase = 'llm';
                report('llm', toScenePlannerProgress());
                const { sourceText, tasks } = await retryScenePlanning(async () => {
                    resolveFloorImageJobTarget(job, getContext());
                    const { sceneSource, plannerOptions } = await planOptions();
                    const planned = await runMultimodalScenePlan(plannerOptions);
                    signal.throwIfAborted();
                    resolveFloorImageJobTarget(job, getContext());
                    return { sourceText: message.mes,
                        tasks: bindScenePlanSource(planned, sceneSource, normalizeMessageSceneSourceText(message.mes)) };
                }, { maxRetries: sharedSettings.plannerMaxRetries, signal, onStateChange: report });
                return await submitPrepared(preparedInput(sourceText), tasks, recipe, monitorGeneration, false);
            }
            job.phase = 'submitting';
            return await submitProviderDrawRun({ ctx, message, messageId: liveId, provider, signal, automatic,
                async preparePlanner({ maxPlanImages }) {
                    const { plannerOptions } = await planOptions();
                    return prepareScenePlannerInput({ ...plannerOptions, maxPlanImages, executionTarget: 'server' });
                },
                createGenerationRecipe: () => recipe,
                getCurrentContext: getContext, syncActiveSwipe: syncMesToSwipe, isMessageBeingEdited, onStateChange: report,
            });
        } catch (error) {
            failFloorImageJob(job, error);
            throw error;
        } finally { releaseJob(job); }
    }

    async function generateImagesFromText(options = {}) {
        if (!ready) throw new Error(DRAW_SLOT_COPY.unavailable);
        const monitorGeneration = monitors.captureGeneration();
        const signal = options.signal;
        const config = await loadSettings(provider);
        const recipe = recipeFor(config, options);
        const text = String(options.text || '');
        if (!text.trim()) throw new Error(COPY.missingPrompt);
        let sceneSource, tasks;
        if (options.promptOverride?.trim()) {
            tasks = [await adaptTask({ scene: options.promptOverride, placement: { mode: 'tail' } }, config,
                { ...options, signal, negativePrompt: options.negativePromptOverride, referenceImages: recipe.referenceImages })];
        } else {
            options.onStateChange?.('llm', toScenePlannerProgress());
            const planned = await buildPlannerOptions(provider, { ...options, settings: config, message: { mes: text },
                useWorldbook: false, stripImageMarkers: false, negativePrompt: options.negativePromptOverride,
                referenceImages: recipe.referenceImages });
            sceneSource = planned.sceneSource;
            tasks = await runMultimodalScenePlan(planned.plannerOptions);
        }
        signal?.throwIfAborted();
        return runTextImages({ options, sceneSource, filePrefix, signal,
            ...prepareImageInput(provider, tasks, recipe), tasks,
            run: handlers => runBatch({ ...handlers, backend: config.sendMode === 'backend', signal, monitorGeneration }) });
    }

    const getSizeOptions = () => providerSizeOptions(provider);
    const panelSettings = (config = settings()) => ({ mode: config.mode, showFloatingButton: config.showFloatingButton,
        showFloorButton: config.showFloorButton, overrideSize: config.overrideSize, overrideMaxImages: config.overrideMaxImages,
        presets: config.paramsPresets.map(({ id, name, maxImages }) => ({ id, name, maxImages })),
        selectedPresetId: config.selectedParamsPresetId });
    async function updateSettingsPersistent(mutator, okText) {
        try {
            await updateProviderSettings(provider, config => {
                const view = panelSettings(config);
                mutator(view);
                const { selectedPresetId, mode, showFloorButton, showFloatingButton, overrideSize, overrideMaxImages } = view;
                Object.assign(config, { selectedParamsPresetId: selectedPresetId, mode, showFloorButton, showFloatingButton, overrideSize, overrideMaxImages });
            });
            if (okText) drawNotify.success(okText);
            return true;
        } catch (error) { drawNotify.error(error.message); return false; }
    }
    function getQuickSettings() {
        const config = panelSettings();
        return { provider, providerLabel: label, available: ready, auto: config.mode === 'auto',
            presets: config.presets.map(({ id, name }) => ({ value: id, label: name })),
            selectedPresetId: config.selectedPresetId, sizeOptions: getSizeOptions(), selectedSize: config.overrideSize || 'default' };
    }
    async function updateQuickSettings(patch = {}) {
        const ok = await updateSettingsPersistent(config => {
            if (Object.hasOwn(patch, 'selectedPresetId')) config.selectedPresetId = String(patch.selectedPresetId);
            if (Object.hasOwn(patch, 'selectedSize')) config.overrideSize = String(patch.selectedSize || 'default');
            if (Object.hasOwn(patch, 'auto')) config.mode = patch.auto === true ? 'auto' : 'manual';
        });
        if (!ok) throw new Error(COPY.invalidSettings);
        return getQuickSettings();
    }

    function watchPanelSettings() {
        let previous = settings();
        return subscribeSettings(provider, config => {
            const visibilityChanged = config.showFloorButton !== previous.showFloorButton || config.showFloatingButton !== previous.showFloatingButton;
            const showExistingFloors = config.showFloorButton && !previous.showFloorButton;
            previous = config;
            if (visibilityChanged) panel.updateButtonVisibility(config.showFloorButton, config.showFloatingButton);
            if (showExistingFloors) renderFloors();
            panel.updateAllPresetSelects();
            panel.updateAllSizeSelects();
            panel.updateAllMaxImagesInputs();
            panel.updateAutoModeUI();
        });
    }

    function mountFloor(element, id, options) {
        if (element && !getContext().chat?.[id]?.is_user) panel?.ensureDrawPanel(element, id, options);
    }
    function renderFloor(id) {
        if (id != null) mountFloor(document.querySelector(`.mes[mesid="${Number(id)}"]`), Number(id));
    }
    function renderFloors() {
        for (const element of document.querySelectorAll('.mes[mesid]')) mountFloor(element, Number(element.getAttribute('mesid')));
        panel?.refreshDrawRunUiState();
    }
    async function autoGenerate() {
        if (!ready || settings().mode !== 'auto') return;
        const ctx = getContext();
        const { chat } = ctx;
        const messageId = (chat?.length ?? 0) - 1;
        const message = chat?.[messageId];
        const swipeIndex = message?.swipe_id ?? 0;
        if (!message || message.is_user || stripDrawImageSlots(message.mes).trim().length < 50 || getJob(messageId)
            || getDrawRunAutomaticCompletion(message, swipeIndex, provider)
            || listActiveSwipeDrawRunMarkers(message).length) return;
        try {
            const result = await generateAndInsertImages({ messageId, automatic: true });
            const live = getContext();
            const liveId = live.chat?.indexOf(message) ?? -1;
            if (!result?.status && !result?.aborted && live.chat === chat && liveId >= 0 && (message.swipe_id ?? 0) === swipeIndex) {
                setDrawRunAutomaticCompletion({ message, messageId: liveId, swipeIndex, provider, completed: true, syncActiveSwipe: syncMesToSwipe });
                requestDrawChatSave(live);
            }
        }
        catch (error) { if (!error.drawTaskReported) drawNotify.error(error.message); }
    }

    async function init() {
        if (ready) return true;
        if (loading) return loading;
        const generation = ++lifecycle;
        const operation = (async () => {
            const [, , { createProviderFloatingPanel }] = await Promise.all([
                loadSettings(provider), loadSharedDrawSettings(), import('../../shared/provider-floating-panel.js'),
            ]);
            if (generation !== lifecycle || window.isXiaobaixEnabled === false) return false;
            panel = createProviderFloatingPanel({ provider, logLabel: label, getSettings: panelSettings, updateSettingsPersistent,
                getSizeOptions, openSettings, generateAndInsertImages, getGenerationState, findLastAIMessageId, abortGeneration });
            monitors.activate();
            setImageTitleSettingsProvider(getSharedDrawSettings);
            ensureDrawImageStyles();
            startSharedDrawPreviewRuntime();
            unbindCards = bindMultimodalImageCards(provider);
            unregisterPrepared = registerPreparedImageProvider(provider, runPrepared, createImageCardRedrawProvider({
                createJob, releaseJob, getCurrentContext: getContext, setStateForMessage: panel.setStateForMessage, classifyError,
            }));
            ready = true;
            panel.initFloatingPanel();
            unsubscribeSettings = watchPanelSettings();
            events.on(event_types.CHARACTER_MESSAGE_RENDERED, data => {
                renderFloor(typeof data === 'number' ? data : data?.messageId ?? data?.mesId);
                panel?.refreshDrawRunUiState();
            });
            events.on(event_types.CHAT_CHANGED, () => {
                const currentChat = getImageChatIdentity(getContext());
                for (const job of jobs.values()) cancelIfChatLeft(job, currentChat);
                renderFloors();
            });
            events.on(event_types.MESSAGE_SWIPED, () => panel?.refreshDrawRunUiState());
            events.on(event_types.MESSAGE_SWIPE_DELETED, detail => {
                rebaseFloorImageJobsAfterSwipeDeletion(jobs, getContext(), detail);
                panel?.refreshDrawRunUiState();
            });
            events.on(event_types.MORE_MESSAGES_LOADED, renderFloors);
            events.on(event_types.GENERATION_ENDED, autoGenerate);
            renderFloors();
            return true;
        })();
        loading = operation;
        try { return await operation; }
        finally { if (loading === operation) loading = null; }
    }

    function cleanup() {
        ++lifecycle;
        loading = null;
        if (!ready) return;
        ready = false;
        events.cleanup();
        unsubscribeSettings?.(); unsubscribeSettings = null;
        unregisterPrepared?.(); unregisterPrepared = null;
        unbindCards?.(); unbindCards = null;
        monitors.deactivate();
        observeBackgroundTask(abortGeneration(null, { reason: 'teardown' }), { source: import.meta.url, operation: 'cleanupDrawJobs' });
        clearFloorImageJobs(jobs);
        stopSharedDrawPreviewRuntime();
        panel.destroyDrawPanels();
        panel = null;
        observeBackgroundTask(closeSettings(), { source: import.meta.url, operation: 'closeSettings' });
    }

    return { init, cleanup, facade: {
        isEnabled: () => ready, getSettings: settings, getQuickSettings, updateQuickSettings,
        mountMessagePanel: mountFloor, releaseMessagePanel: (element, id) => panel?.releaseDrawPanel(element, id),
        isGenerating: messageId => messageId == null ? jobs.size > 0 : Boolean(getJob(messageId)),
        getGenerationPhase: messageId => getFloorImagePhase(getJob(messageId)), getGenerationState,
        generateAndInsertImages, generateImagesFromText, abortGeneration,
    } };
}
