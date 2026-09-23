/**
 * Synthèse vocale (Web Speech API) — indépendante du framework.
 * Règle : jamais de voix d'une autre langue pour lire la langue cible.
 *
 * Détection des voix — sur Chrome Android la liste arrive souvent APRÈS le chargement, parfois sans
 * événement. On combine : lectures espacées de getVoices(), l'événement voiceschanged, une relecture
 * au retour sur la page, au premier toucher et à chaque demande de lecture.
 *
 * Architecture : `SpeechProvider` est l'interface ; `WebSpeechProvider` l'implémentation native.
 * Un fournisseur distant (API TTS) pourra être ajouté en implémentant la même interface.
 */

export type TtsStatus = 'ok' | 'searching' | 'unknown' | 'none' | 'unsupported';

export interface VoiceInfo {
  id: string;
  name: string;
  lang: string;
  local: boolean;
  isTarget: boolean;
}

export interface SpeakOptions {
  slow?: boolean;
  slowRate?: number;
  force?: boolean; // essayer même sans voix cible listée
  voiceId?: string;
  onend?: () => void;
}

export interface SpeechProvider {
  readonly name: string;
  supported: boolean;
  status(): TtsStatus;
  voices(): VoiceInfo[];
  targetVoices(): VoiceInfo[];
  speak(text: string, opts?: SpeakOptions): boolean;
  cancel(): void;
  subscribe(fn: () => void): () => void;
  rescan(): void;
  diag(): string;
}

const DELAYS = [0, 120, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000];

/** Une voix est-elle dans la langue cible (ex. « th ») ? Tolère th, th-TH, th_TH, tha… et un nom explicite. */
export function matchesLang(v: { lang?: string; name?: string }, lang: string, nameRe: RegExp): boolean {
  const l = String(v.lang || '').trim().toLowerCase().replace(/_/g, '-');
  const base = lang.toLowerCase();
  if (l === base || l.startsWith(base + '-')) return true;
  const vague = !l || l === 'und' || !/^[a-z]{2,3}(-|$)/.test(l);
  return vague && nameRe.test(v.name || '');
}

export class WebSpeechProvider implements SpeechProvider {
  readonly name = 'Voix de l’appareil';
  supported = typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined';
  private list: SpeechSynthesisVoice[] = [];
  private target: SpeechSynthesisVoice[] = [];
  private subs = new Set<() => void>();
  private timers: ReturnType<typeof setTimeout>[] = [];
  private scanning = false;
  private tries = 0;
  private events = 0;
  private lastScan = 0;
  private lastError = '';
  private sig = '';
  private keep: SpeechSynthesisUtterance | null = null;
  private inited = false;

  constructor(
    private speechLang: string, // "th-TH"
    private langBase: string, // "th"
    private nameRe: RegExp, // /thai|thaï|ไทย/i
  ) {}

  private emit() { this.subs.forEach((f) => f()); }

  subscribe(fn: () => void) {
    this.subs.add(fn);
    this.init();
    return () => { this.subs.delete(fn); };
  }

  private scan(): boolean {
    if (!this.supported) return false;
    let list: SpeechSynthesisVoice[] = [];
    try { list = Array.from(speechSynthesis.getVoices() || []); } catch { list = []; }
    this.tries++;
    this.lastScan = Date.now();
    const sig = list.map((v) => v.name + '|' + v.lang).join('\n');
    const changed = sig !== this.sig;
    this.sig = sig;
    this.list = list;
    this.target = list.filter((v) => matchesLang(v, this.langBase, this.nameRe));
    if (changed) this.emit();
    return this.target.length > 0;
  }

  private finish() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    if (this.scanning) { this.scanning = false; this.emit(); }
  }

  private detect() {
    if (!this.supported) return;
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.scanning = true;
    DELAYS.forEach((d, i) => this.timers.push(setTimeout(() => {
      if (!this.scanning) return;
      if (this.scan() || i === DELAYS.length - 1) this.finish();
    }, d)));
  }

  /** Réveille le moteur vocal d'Android au premier toucher si la liste est vide (énoncé muet). */
  private warm() {
    if (!this.supported || this.list.length) return;
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.lang = this.speechLang;
      u.volume = 0;
      speechSynthesis.speak(u);
    } catch { /* ignore */ }
  }

  init() {
    if (this.inited || !this.supported) return;
    this.inited = true;
    const onVC = () => { this.events++; if (this.scan()) this.finish(); };
    if (typeof speechSynthesis.addEventListener === 'function') speechSynthesis.addEventListener('voiceschanged', onVC);
    else speechSynthesis.onvoiceschanged = onVC;
    const again = () => { if (!this.target.length) this.detect(); };
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') again(); });
    window.addEventListener('pageshow', again);
    window.addEventListener('focus', again);
    document.addEventListener('pointerdown', () => { if (!this.target.length) { this.warm(); this.detect(); } }, { once: true, capture: true });
    this.detect();
  }

  rescan() { this.warm(); this.detect(); }

  status(): TtsStatus {
    return !this.supported ? 'unsupported' : this.target.length ? 'ok' : this.scanning ? 'searching' : this.list.length ? 'none' : 'unknown';
  }

  private info = (v: SpeechSynthesisVoice): VoiceInfo => ({ id: v.voiceURI || v.name, name: v.name, lang: v.lang, local: v.localService, isTarget: matchesLang(v, this.langBase, this.nameRe) });
  voices() { return this.list.map(this.info); }
  targetVoices() { return this.target.map(this.info); }

  private pick(voiceId?: string): SpeechSynthesisVoice | null {
    const t = this.target;
    const re = new RegExp('^' + this.speechLang.replace('-', '[-_]') + '$', 'i');
    return (voiceId && t.find((v) => v.voiceURI === voiceId || v.name === voiceId)) || t.find((v) => re.test(v.lang || '') && v.localService) || t.find((v) => v.localService) || t[0] || null;
  }

  speak(text: string, opts: SpeakOptions = {}): boolean {
    if (!this.supported) return false;
    if (!this.target.length) this.scan();
    if (!this.target.length && this.list.length && !opts.force) {
      if (!this.scanning) this.detect();
      return false;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = this.speechLang;
    const v = this.pick(opts.voiceId);
    if (v) u.voice = v;
    u.rate = opts.slow ? (opts.slowRate ?? 0.6) : 0.95;
    u.pitch = 1;
    u.volume = 1;
    let done = false;
    const fin = () => { if (!done) { done = true; opts.onend?.(); } };
    u.onend = fin;
    u.onerror = (e) => { this.lastError = (e && e.error) || 'inconnue'; fin(); };
    this.keep = u; // évite que Chrome libère l'objet avant la fin de la lecture
    try { speechSynthesis.cancel(); } catch { /* ignore */ }
    setTimeout(() => { try { speechSynthesis.speak(u); } catch (e) { this.lastError = String((e as Error)?.message || e); fin(); } }, 70);
    return true;
  }

  cancel() { try { speechSynthesis.cancel(); } catch { /* ignore */ } }

  diag() {
    return `tentatives : ${this.tries} · événements voiceschanged : ${this.events} · dernière lecture : ${this.lastScan ? new Date(this.lastScan).toLocaleTimeString('fr-FR') : '—'}${this.scanning ? ' · recherche en cours…' : ''}${this.lastError ? ' · dernière erreur : ' + this.lastError : ''}${this.keep ? '' : ''}`;
  }

  report() {
    return `Navigateur : ${navigator.userAgent}\nVoix listées : ${this.list.length} · voix cibles : ${this.target.length}\n${this.diag()}\n` +
      this.list.map((v) => (matchesLang(v, this.langBase, this.nameRe) ? '* ' : '  ') + v.name + ' — ' + v.lang + (v.localService ? ' (locale)' : ' (en ligne)') + (v.default ? ' [défaut]' : '')).join('\n');
  }
}

/** Fournisseur muet (tests, environnement sans Web Speech). */
export class NullSpeechProvider implements SpeechProvider {
  readonly name = 'Aucune';
  supported = false;
  status(): TtsStatus { return 'unsupported'; }
  voices() { return []; }
  targetVoices() { return []; }
  speak() { return false; }
  cancel() { /* rien */ }
  subscribe() { return () => { /* rien */ }; }
  rescan() { /* rien */ }
  diag() { return ''; }
}
