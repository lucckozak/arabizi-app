/**
 * Audio layer:
 *
 * - Arabic pronunciation:
 *     1. Try pre-generated MP3 (e.g. ElevenLabs) via the audio-manifest.json
 *        the build script writes. Highest quality, ships with the app.
 *     2. Fall back to the device's built-in Web Speech API. Free, on-device,
 *        works offline once iOS caches the voice.
 *
 * - Sound effects (correct chime / wrong buzz):
 *     Synthesized at runtime via the Web Audio API — no MP3 files needed.
 *     Toggleable via settings.soundEffects.
 *
 * - Tap-to-pronounce on Arabic text is gated by settings.tapToPronounce.
 *   That setting is read by the ArabicText component, not here.
 */

import audioManifestJson from '@/data/audio-manifest.json';
import { useAppStore } from '@/store/useAppStore';

const audioManifest = audioManifestJson as Record<string, string>;

// ─── Web Speech (system TTS) ────────────────────────────────────────────────
let cachedVoices: SpeechSynthesisVoice[] | null = null;
let preferredVoice: SpeechSynthesisVoice | null = null;

export const isSpeechAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
};

const refreshVoices = (): void => {
  if (!isSpeechAvailable()) return;
  cachedVoices = window.speechSynthesis.getVoices();
  const order = ['ar-AE', 'ar-XA', 'ar-SA', 'ar-EG', 'ar-LB', 'ar-JO', 'ar'];
  for (const tag of order) {
    const v = cachedVoices.find((x) => x.lang.toLowerCase().startsWith(tag.toLowerCase()));
    if (v) { preferredVoice = v; return; }
  }
  preferredVoice = cachedVoices.find((v) => v.lang.toLowerCase().startsWith('ar')) ?? null;
};

if (isSpeechAvailable()) {
  refreshVoices();
  window.speechSynthesis.addEventListener('voiceschanged', refreshVoices);
}

export const hasArabicVoice = (): boolean => {
  if (!isSpeechAvailable()) return false;
  if (!cachedVoices) refreshVoices();
  return preferredVoice !== null;
};

interface SpeakOptions {
  rate?: number;
  pitch?: number;
}

const speakViaWebSpeech = (text: string, opts: SpeakOptions = {}): void => {
  if (!isSpeechAvailable() || !text.trim()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = preferredVoice?.lang ?? 'ar-SA';
  if (preferredVoice) utt.voice = preferredVoice;
  utt.rate = opts.rate ?? 0.85;
  utt.pitch = opts.pitch ?? 1;
  synth.speak(utt);
};

// ─── Pre-generated MP3 ──────────────────────────────────────────────────────
const audioCache = new Map<string, HTMLAudioElement>();
let activeMp3: HTMLAudioElement | null = null;

const stopActiveMp3 = (): void => {
  if (activeMp3) {
    try { activeMp3.pause(); activeMp3.currentTime = 0; } catch { /* noop */ }
    activeMp3 = null;
  }
};

const playMp3 = async (filename: string): Promise<boolean> => {
  const url = `${import.meta.env.BASE_URL}audio/${filename}`;
  let audio = audioCache.get(url);
  if (!audio) {
    audio = new Audio(url);
    audio.preload = 'auto';
    audioCache.set(url, audio);
  }
  stopActiveMp3();
  audio.currentTime = 0;
  activeMp3 = audio;
  try {
    await audio.play();
    return true;
  } catch {
    return false;
  }
};

// ─── Public Arabic-speak entrypoint ─────────────────────────────────────────
/** Speak Arabic text. Uses pre-generated audio if available, else Web Speech. */
export const speakArabic = async (text: string, opts?: SpeakOptions): Promise<void> => {
  if (!text.trim()) return;
  const filename = audioManifest[text];
  if (filename) {
    const ok = await playMp3(filename);
    if (ok) return;
  }
  speakViaWebSpeech(text, opts);
};

export const stopSpeaking = (): void => {
  stopActiveMp3();
  if (isSpeechAvailable()) window.speechSynthesis.cancel();
};

/** True iff there is *some* way to pronounce this text on this device. */
export const canPronounce = (text: string): boolean => {
  if (audioManifest[text]) return true;
  return isSpeechAvailable() && hasArabicVoice();
};

// ─── Sound effects (Web Audio API, synthesized) ─────────────────────────────
let audioCtx: AudioContext | null = null;

const getCtx = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  return audioCtx;
};

interface ToneOpts {
  freq: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  attack?: number;
  startAt?: number; // offset in seconds from now
}

const tone = (ctx: AudioContext, { freq, duration, type = 'sine', gain = 0.12, attack = 0.005, startAt = 0 }: ToneOpts) => {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(g);
  g.connect(ctx.destination);
  const t0 = ctx.currentTime + startAt;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
};

/** Pleasant ascending two-note chime — C5 → E5. */
const playCorrectSound = (): void => {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  tone(ctx, { freq: 523.25, duration: 0.18, gain: 0.10 });           // C5
  tone(ctx, { freq: 659.25, duration: 0.22, gain: 0.10, startAt: 0.09 }); // E5
};

/** Short low descending pair — soft "wrong" feedback, not harsh. */
const playWrongSound = (): void => {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  tone(ctx, { freq: 233.08, duration: 0.16, type: 'triangle', gain: 0.10 });           // Bb3
  tone(ctx, { freq: 174.61, duration: 0.22, type: 'triangle', gain: 0.10, startAt: 0.1 }); // F3
};

/** Play correct/wrong chime — respects the soundEffects setting. */
export const playFeedback = (correct: boolean): void => {
  const enabled = useAppStore.getState().settings.soundEffects;
  if (!enabled) return;
  if (correct) playCorrectSound();
  else playWrongSound();
};
