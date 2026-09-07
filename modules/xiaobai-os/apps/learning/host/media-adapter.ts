export interface LearningVoice { id: string; name: string; source: string; available: boolean }
interface LearningPlayer {
    onStateChange: ((state: string, item: unknown, info?: { duration?: number; currentTime?: number } | null) => void) | null;
    activate(): boolean;
    playNow(item: { id: string; audioBlob: Blob }): boolean;
    pause(): void;
    resume(): boolean;
    seek(seconds: number): boolean;
    setPlaybackRate(rate: number): number;
    dispose(): void;
}
export interface LearningTtsFacade {
    isEnabled(): boolean;
    getVoices(): { voices: LearningVoice[]; defaultVoice: string };
    createPlayer(): LearningPlayer;
    synthesize(text: string, options: { speaker: string; language: string; speed: number; signal: AbortSignal }): Promise<Blob>;
    openSettings(): void;
}
export interface LearningSpeech {
    key: string; text: string; voiceId: string; language: string; speed: number;
}
export interface LearningMediaState {
    status: 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'blocked' | 'error' | 'unavailable';
    key: string | null; position: number; duration: number; rate: number; message: string;
}

const disabledMessage = '使用语音前，请先开启 TTS 模块';
const emptyState = (): LearningMediaState => ({ status: 'idle', key: null, position: 0, duration: 0, rate: 1, message: '' });

/** Host-only transport. Callers resolve permitted text and saved voice choices before playback. */
export function createLearningMedia(options: {
    getFacade?: () => LearningTtsFacade | undefined;
    isCurrent: () => boolean;
    onState: (state: LearningMediaState) => void;
    onPlayback?: (request: LearningSpeech, event: { started: boolean; slow: boolean }) => void;
}) {
    const getFacade = options.getFacade ?? (() => (window as Window & { xiaobaixTts?: LearningTtsFacade }).xiaobaixTts);
    let state = emptyState();
    let active: { request: LearningSpeech; facade: LearningTtsFacade; player: LearningPlayer; abort: AbortController; blob: Blob | null; started: boolean } | null = null;

    const snapshot = () => ({ ...state });
    function notify(patch: Partial<LearningMediaState>) {
        state = { ...state, ...patch };
        options.onState(snapshot());
    }
    function capabilities() {
        const facade = getFacade();
        if (!facade?.isEnabled()) { return { enabled: false, voices: [], defaultVoice: '', message: disabledMessage }; }
        return { enabled: true, ...facade.getVoices(), message: '' };
    }
    function stop() {
        const previous = active;
        active = null;
        previous?.abort.abort();
        previous?.player.dispose();
        state = emptyState();
        options.onState(snapshot());
    }
    function current(entry: NonNullable<typeof active>) {
        return active === entry && !entry.abort.signal.aborted && options.isCurrent()
            && getFacade() === entry.facade && entry.facade.isEnabled();
    }
    async function play(input: LearningSpeech) {
        stop();
        if (!options.isCurrent()) { return; }
        const facade = getFacade();
        if (!facade?.isEnabled()) { notify({ status: 'unavailable', message: disabledMessage }); return; }
        const voice = facade.getVoices().voices.find(voice => voice.id === input.voiceId);
        if (!voice?.available) {
            notify({ status: 'unavailable', message: '这个音色暂不可用，请在声音设置中选择可用音色。' }); return;
        }
        // This adapter never returns lesson text in media state (including hidden listening transcripts).
        const request = { ...input };
        const entry = { request, facade, player: facade.createPlayer(), abort: new AbortController(), blob: null as Blob | null, started: false };
        active = entry;
        entry.player.onStateChange = (event, _item, info) => {
            if (event === 'disposed' && active === entry) { stop(); return; }
            if (!current(entry)) { return; }
            if (event === 'paused' && !entry.blob) { stop(); return; }
            if (event === 'metadata' || event === 'progress') {
                notify({ duration: Number.isFinite(info?.duration) ? Math.max(0, info!.duration!) : state.duration,
                    position: Number.isFinite(info?.currentTime) ? Math.max(0, info!.currentTime!) : state.position });
            } else if (event === 'playing' || event === 'paused' || event === 'ended' || event === 'blocked' || event === 'error') {
                if (event === 'playing' && !entry.started) {
                    entry.started = true;
                    options.onPlayback?.(request, { started: true, slow: state.rate < 1 || request.speed < 1 });
                }
                notify({ status: event, message: event === 'blocked' ? '浏览器暂未允许播放，请点「继续播放」。'
                    : event === 'error' ? '这段声音未能播放，可以重试；原题和作答仍保留。' : '' });
            }
        };
        try {
            if (!entry.player.activate()) { stop(); return; }
            notify({ status: 'loading', key: request.key });
            const blob = await facade.synthesize(request.text, { speaker: request.voiceId, language: request.language,
                speed: request.speed, signal: entry.abort.signal });
            if (!current(entry)) { if (active === entry) { stop(); } return; }
            entry.blob = blob;
            entry.player.playNow({ id: request.key, audioBlob: blob });
        } catch {
            if (current(entry)) {
                stop();
                notify({ status: 'error', key: request.key, message: '声音生成失败，请重试；不会重新出题或修改作答。' });
            } else if (active === entry) { stop(); }
        }
    }
    function ready() {
        if (!active || !current(active)) { stop(); return null; }
        return active;
    }
    return {
        capabilities, snapshot, play, stop,
        pause() { ready()?.player.pause(); },
        resume() {
            const entry = ready();
            if (!entry?.blob) { return; }
            if (state.status === 'ended' || state.status === 'error') {
                entry.started = false;
                notify({ position: 0 });
                entry.player.playNow({ id: entry.request.key, audioBlob: entry.blob });
            } else { entry.player.resume(); }
        },
        seek(seconds: number) { return ready()?.player.seek(seconds) ?? false; },
        setRate(rate: number) {
            const entry = ready();
            if (entry) {
                notify({ rate: entry.player.setPlaybackRate(rate) });
                if (entry.started && state.rate < 1) { options.onPlayback?.(entry.request, { started: false, slow: true }); }
            }
        },
        openSettings() {
            const facade = getFacade();
            if (facade?.isEnabled()) { facade.openSettings(); }
            else { notify({ status: 'unavailable', message: '请在酒馆扩展设置 → 小白X → 渲染交互中，勾选「启用 TTS 语音」。开启后回到语伴即可使用。' }); }
        },
    };
}
