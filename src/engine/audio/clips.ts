/**
 * Voix natives pré-générées : des fichiers MP3 (une voix d'homme, une voix de femme) produits une fois pour
 * toutes par scripts/gen-voices.ts et servis avec l'application (public/voices/). Quand le clip d'un texte
 * existe, on le joue ; sinon la synthèse vocale de l'appareil prend le relais. La lecture lente se fait par
 * playbackRate (la hauteur est conservée par les navigateurs modernes).
 */
import { clipKey } from './clipKey';
import type { VoiceGender } from './tts';

export interface ClipManifest {
  version: number;
  voices: Partial<Record<VoiceGender, string>>;
  /** clé → voix disponibles : "m", "f" ou "mf" */
  clips: Record<string, string>;
}

export class ClipPlayer {
  manifest: ClipManifest | null = null;
  private audio: HTMLAudioElement | null = null;
  private subs = new Set<() => void>();
  private loading: Promise<void> | null = null;
  constructor(private base: string) {}

  subscribe(fn: () => void) { this.subs.add(fn); return () => { this.subs.delete(fn); }; }
  private emit() { this.subs.forEach((f) => f()); }

  /** Charge le manifeste (silencieux si les voix n'ont pas encore été générées). */
  load(): Promise<void> {
    if (this.loading) return this.loading;
    this.loading = (async () => {
      if (typeof fetch === 'undefined') return;
      try {
        const r = await fetch(`${this.base}voices/manifest.json`, { cache: 'no-cache' });
        if (!r.ok) return;
        const m = (await r.json()) as ClipManifest;
        if (m && m.clips && typeof m.clips === 'object') { this.manifest = m; this.emit(); }
      } catch { /* pas de voix natives : repli sur l'appareil */ }
    })();
    return this.loading;
  }

  get ready() { return !!this.manifest; }
  count(g: VoiceGender) { return this.manifest ? Object.values(this.manifest.clips).filter((v) => v.includes(g)).length : 0; }
  has(text: string, g: VoiceGender) { return !!this.manifest?.clips[clipKey(text)]?.includes(g); }
  url(text: string, g: VoiceGender) { return `${this.base}voices/${g}/${clipKey(text)}.mp3`; }

  /** Joue le clip s'il existe. Retourne faux sinon (le repli est à la charge de l'appelant). */
  play(text: string, g: VoiceGender, opts: { rate?: number; onend?: () => void } = {}): boolean {
    if (!this.has(text, g) || typeof Audio === 'undefined') return false;
    this.stop();
    const a = new Audio(this.url(text, g));
    const el = a as HTMLAudioElement & { preservesPitch?: boolean; mozPreservesPitch?: boolean };
    el.preservesPitch = true; el.mozPreservesPitch = true;
    a.playbackRate = Math.max(0.4, Math.min(1.5, opts.rate ?? 1));
    let done = false;
    const fin = () => { if (!done) { done = true; if (this.audio === a) this.audio = null; opts.onend?.(); } };
    a.onended = fin; a.onerror = fin;
    this.audio = a;
    a.play().catch(fin);
    return true;
  }

  stop() { if (this.audio) { try { this.audio.pause(); } catch { /* ignore */ } this.audio = null; } }

  /** Précharge tous les clips d'une voix (ils restent dans le cache du navigateur pour le hors-ligne). */
  async downloadAll(g: VoiceGender, onProgress?: (done: number, total: number) => void, signal?: AbortSignal): Promise<number> {
    if (!this.manifest) return 0;
    const keys = Object.entries(this.manifest.clips).filter(([, v]) => v.includes(g)).map(([k]) => k);
    let done = 0;
    const worker = async () => {
      while (keys.length && !signal?.aborted) {
        const k = keys.shift()!;
        try { await fetch(`${this.base}voices/${g}/${k}.mp3`, { signal }); } catch { /* on continue */ }
        done++; onProgress?.(done, done + keys.length);
      }
    };
    await Promise.all([worker(), worker(), worker(), worker()]);
    return done;
  }
}
