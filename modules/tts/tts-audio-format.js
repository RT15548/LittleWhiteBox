export const TTS_AUDIO_MIMES = Object.freeze({ mp3: 'audio/mpeg', wav: 'audio/wav', pcm: 'audio/pcm', ogg_opus: 'audio/ogg', opus: 'audio/opus' });
export function ttsAudioMime(format) { return TTS_AUDIO_MIMES[format]; }
