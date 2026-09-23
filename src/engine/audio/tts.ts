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

export type VoiceGender = 'm' | 'f';

export interface VoiceInfo {
  id: string;
  name: string;
  lang: string;
  local: boolean;
  isTarget: boolean;
  /** Genre deviné d'après le nom de la voix (absent si inconnu). */
  gender?: VoiceGender;
}

export interface SpeakOptions {
  slow?: boolean;
  slowRate?: number;
  /** Vitesse explicite (0.1–2) ; prime sur slow/slowRate. */
  rate?: number;
  force?: boolean; // essayer même sans voix cible listée
  voiceId?: string;
  /** Voix d'homme ou de femme souhaitée (dialogues, préférence de l'apprenant). */
  gender?: VoiceGender;
  /** Genre attribué à la main par l'utilisateur à certaines voix (id → genre). */
  voiceGenders?: Record<string, VoiceGender>;
  /** Quand aucune voix du genre voulu n'existe : rendre la voix plus grave / plus aiguë (approximation). */
  approxGender?: boolean;
  onend?: () => void;
}

/** Noms de voix thaïes connus (Apple, Google, Microsoft, Samsung…) → genre. */
const FEMALE_RE = /kanya|narisa|premwadee|achara|female|femme|หญิง|\bf\b|woman/i;
const MALE_RE = /niwat|pattara|(^|[^e])male\b|homme|ชาย|\bm\b|\bman\b/i;

/** Devine le genre d'une voix d'après son nom ; undefined si on ne sait pas. */
export function guessVoiceGender(name: string): VoiceGender | undefined {
  if (FEMALE_RE.test(name)) return 'f';
  if (MALE_RE.test(name)) return 'm';
  return undefined;
}

/**
 * Choisit une voix pour un genre voulu parmi les voix cibles : voix explicitement choisie d'abord,
 * puis une voix du bon genre (locale de préférence), sinon la meilleure voix disponible.
 * `approx` dit si la voix retenue devra être ajustée en hauteur pour approcher le genre voulu.
 */
export function chooseVoice<V extends { id: string; name: string; local: boolean; lang: string }>(
  voices: V[], want: { voiceId?: string; gender?: VoiceGender; voiceGenders?: Record<string, VoiceGender>; speechLang: string },
): { voice: V | null; gender?: VoiceGender; approx: boolean } {
  const genderOf = (v: V) => want.voiceGenders?.[v.id] ?? want.voiceGenders?.[v.name] ?? guessVoiceGender(v.name);
  const re = new RegExp('^' + want.speechLang.replace('-', '[-_]') + '$', 'i');
  const rank = (v: V) => (re.test(v.lang || '') ? 0 : 1) + (v.local ? 0 : 2);
  const sorted = [...voices].sort((a, b) => rank(a) - rank(b));
  const explicit = want.voiceId ? voices.find((v) => v.id === want.voiceId || v.name === want.voiceId) : undefined;
  if (explicit) { const g = genderOf(explicit); return { voice: explicit, gender: g, approx: !!want.gender && !!g && g !== want.gender }; }
  if (want.gender) {
    const same = sorted.find((v) => genderOf(v) === want.gender);
    if (same) return { voice: same, gender: want.gender, approx: false };
  }
  const v = sorted[0] ?? null;
  const g = v ? genderOf(v) : undefined;
  return { voice: v, gender: g, approx: !!v && !!want.gender && g !== want.gender };
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

  private info = (v: SpeechSynthesisVoice): VoiceInfo => ({ id: v.voiceURI || v.name, name: v.name, lang: v.lang, local: v.localService, isTarget: matchesLang(v, this.langBase, this.nameRe), gender: guessVoiceGender(v.name) });
  voices() { return this.list.map(this.info); }
  targetVoices() { return this.target.map(this.info); }

  private pick(opts: SpeakOptions): { voice: SpeechSynthesisVoice | null; approx: boolean } {
    const wrapped = this.target.map((v) => ({ id: v.voiceURI || v.name, name: v.name, local: v.localService, lang: v.lang, raw: v }));
    const r = chooseVoice(wrapped, { voiceId: opts.voiceId, gender: opts.gender, voiceGenders: opts.voiceGenders, speechLang: this.speechLang });
    return { voice: r.voice?.raw ?? null, approx: r.approx };
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
    const { voice, approx } = this.pick(opts);
    if (voice) u.voice = voice;
    u.rate = opts.rate ?? (opts.slow ? (opts.slowRate ?? 0.6) : 0.95);
    // Pas de voix du genre voulu : on assombrit (homme) ou éclaircit (femme) la voix disponible, si demandé.
    u.pitch = approx && opts.approxGender !== false ? (opts.gender === 'm' ? 0.72 : 1.25) : 1;
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
