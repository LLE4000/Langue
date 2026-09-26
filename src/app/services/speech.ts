/**
 * Service audio de l'application : une instance du fournisseur de synthèse vocale pour la langue cible,
 * les voix natives pré-générées (clips) quand elles existent, et des hooks React pour parler / observer l'état.
 */
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { NullSpeechProvider, WebSpeechProvider, type SpeechProvider, type TtsStatus, type VoiceGender } from '@/engine/audio/tts';
import { ClipPlayer } from '@/engine/audio/clips';
import { Recognizer, Recorder } from '@/engine/audio/mic';
import { speakable, type Gender } from '@/engine/tokens';
import { useStore } from '../store';
import { activePack } from '@/content/packs';

const pack = activePack();
export const tts: SpeechProvider =
  typeof window !== 'undefined' && 'speechSynthesis' in window ? new WebSpeechProvider(pack.speechLang, pack.langBase, pack.voiceNameRe) : new NullSpeechProvider();
export const recognizer = new Recognizer(pack.speechLang);
export const recorder = new Recorder();
/** Voix natives (Niwat / Premwadee) si elles ont été générées ; sinon le manifeste est absent et tout passe par l'appareil. */
export const clips = new ClipPlayer(typeof window !== 'undefined' ? import.meta.env.BASE_URL : '/');
if (typeof window !== 'undefined') clips.load();

let version = 0;
/** identifiant de la lecture en cours (une réplique jouée en plusieurs morceaux s'arrête si on en lance une autre) */
let chain = 0;
const listeners = new Set<() => void>();
tts.subscribe(() => { version++; listeners.forEach((l) => l()); });
clips.subscribe(() => { version++; listeners.forEach((l) => l()); });

/** État réactif des voix (statut, liste, voix natives). */
export function useVoices(): { status: TtsStatus; version: number; native: boolean } {
  const v = useSyncExternalStore((cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; }, () => version, () => 0);
  // Avec les voix natives, l'audio marche même sans voix thaïe installée sur l'appareil
  const status = tts.status();
  return { status: clips.ready && status !== 'ok' && status !== 'searching' ? 'ok' : status, version: v, native: clips.ready };
}

export interface SpeakOpts {
  slow?: boolean;
  /** Vitesse explicite (mode Écoute) ; prime sur slow. */
  rate?: number;
  /**
   * Qui parle : un autre locuteur (dialogues). Ses particules de politesse et sa voix suivent ce genre.
   * Absent = l'apprenant : particules selon le profil, voix selon la préférence des réglages.
   */
  speaker?: Gender;
  onend?: () => void;
}

export interface Speaker {
  speak(text: string, opts?: SpeakOpts): boolean;
  cancel(): void;
  status: TtsStatus;
  /** Voix effectivement souhaitée pour l'apprenant (préférence ou genre du profil). */
  gender: VoiceGender;
}

/** Parle dans la langue cible en résolvant les jetons de politesse selon le profil (ou le locuteur indiqué). */
export function useSpeaker(): Speaker {
  const profile = useStore((s) => s.profile);
  const settings = useStore((s) => s.settings);
  const { status } = useVoices();
  const me: Gender = profile?.gender ?? 'm';
  const pref: VoiceGender = settings.voiceGender === 'auto' || !settings.voiceGender ? me : settings.voiceGender;
  return useMemo(() => ({
    speak: (text, opts) => {
      const who = opts?.speaker ?? me;
      const voiceGender = opts?.speaker ?? pref;
      const rate = opts?.rate != null ? (opts.rate >= 0.9 ? 1 : opts.rate) : opts?.slow ? settings.slowRate : 1;
      const ttsOpts = { slow: opts?.slow, slowRate: settings.slowRate, rate: opts?.rate, voiceId: settings.voiceId, force: settings.forceTTS, gender: voiceGender, voiceGenders: settings.voiceGenders, approxGender: settings.voiceApprox !== false };
      /*
       * Une réplique avec le prénom ({N}) : aucun clip ne peut contenir un prénom. On joue les morceaux avec la voix
       * native et, entre eux, le prénom écrit en thaï (voix de l'appareil) s'il est connu — sinon une courte pause.
       * Jamais le prénom en lettres latines lu par une voix thaïe.
       */
      if (/\{N\}/.test(text)) {
        const run = ++chain;
        const parts = text.split(/\{N\}/);
        const thaiName = profile?.thaiName?.trim();
        const step = (i: number): void => {
          if (run !== chain) return;
          if (i >= parts.length * 2 - 1) { opts?.onend?.(); return; }
          const next = (): void => step(i + 1);
          if (i % 2) { if (thaiName) { if (!tts.speak(thaiName, { ...ttsOpts, onend: next })) setTimeout(next, 250); } else setTimeout(next, 250); return; }
          const part = speakable(parts[i / 2], { gender: who, name: '' }).trim();
          if (!part) { next(); return; }
          if (!clips.play(part, voiceGender, { rate, onend: next }) && !tts.speak(part, { ...ttsOpts, onend: next })) next();
        };
        tts.cancel(); clips.stop();
        step(0);
        return true;
      }
      chain++;
      const said = speakable(text, { gender: who, name: profile?.name ?? '' });
      // 1. Voix native pré-générée si elle existe
      tts.cancel();
      if (clips.play(said, voiceGender, { rate, onend: opts?.onend })) return true;
      // 2. Sinon, la voix de l'appareil
      return tts.speak(said, { ...ttsOpts, onend: opts?.onend });
    },
    cancel: () => { chain++; clips.stop(); tts.cancel(); },
    status,
    gender: pref,
  }), [me, pref, profile?.name, profile?.thaiName, settings.slowRate, settings.voiceId, settings.forceTTS, settings.voiceGenders, settings.voiceApprox, status]);
}

/** Lit un texte à l'affichage (si l'audio automatique est activé). */
export function useAutoSpeak(text: string | null | undefined, deps: unknown[] = []) {
  const auto = useStore((s) => s.settings.autoAudio);
  const sp = useSpeaker();
  useEffect(() => {
    if (!auto || !text) return;
    const t = setTimeout(() => sp.speak(text), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, text, ...deps]);
}
