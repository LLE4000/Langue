/**
 * Service audio de l'application : une instance du fournisseur de synthèse vocale pour la langue cible,
 * et des hooks React pour parler / observer l'état des voix.
 */
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { NullSpeechProvider, WebSpeechProvider, type SpeechProvider, type TtsStatus } from '@/engine/audio/tts';
import { Recognizer, Recorder } from '@/engine/audio/mic';
import { speakable } from '@/engine/tokens';
import { useStore } from '../store';
import { activePack } from '@/content/packs';

const pack = activePack();
export const tts: SpeechProvider =
  typeof window !== 'undefined' && 'speechSynthesis' in window ? new WebSpeechProvider(pack.speechLang, pack.langBase, pack.voiceNameRe) : new NullSpeechProvider();
export const recognizer = new Recognizer(pack.speechLang);
export const recorder = new Recorder();

let version = 0;
const listeners = new Set<() => void>();
tts.subscribe(() => { version++; listeners.forEach((l) => l()); });

/** État réactif des voix (statut, liste). */
export function useVoices(): { status: TtsStatus; version: number } {
  const v = useSyncExternalStore((cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; }, () => version, () => 0);
  return { status: tts.status(), version: v };
}

export interface Speaker {
  speak(text: string, opts?: { slow?: boolean; onend?: () => void }): boolean;
  cancel(): void;
  status: TtsStatus;
}

/** Parle dans la langue cible en résolvant les jetons de politesse selon le profil. */
export function useSpeaker(): Speaker {
  const profile = useStore((s) => s.profile);
  const settings = useStore((s) => s.settings);
  const { status } = useVoices();
  return useMemo(() => ({
    speak: (text, opts) => tts.speak(speakable(text, { gender: profile?.gender ?? 'm', name: profile?.name ?? '' }), { slow: opts?.slow, slowRate: settings.slowRate, voiceId: settings.voiceId, force: settings.forceTTS, onend: opts?.onend }),
    cancel: () => tts.cancel(),
    status,
  }), [profile?.gender, profile?.name, settings.slowRate, settings.voiceId, settings.forceTTS, status]);
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
