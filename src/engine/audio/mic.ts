/**
 * Microphone :
 *  - Recorder : enregistrement (MediaRecorder) pour se réécouter ;
 *  - Recognizer : reconnaissance vocale (Web Speech API) dans la langue cible — dit seulement si le moteur
 *    a COMPRIS le bon mot. Ne mesure ni l'accent ni les tons.
 *  - PronunciationScorer : point de branchement pour une future API d'évaluation phonétique.
 *    Tant que `available` est false, l'interface n'affiche AUCUN score.
 */
import { lev } from '../util';
import { normThai } from '../thai/script';

export class Recorder {
  supported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';
  private mr: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  url = '';
  blob: Blob | null = null;

  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.chunks = [];
    this.mr = new MediaRecorder(this.stream);
    this.mr.ondataavailable = (e) => { if (e.data && e.data.size) this.chunks.push(e.data); };
    this.mr.start();
  }

  stop(): Promise<string | null> {
    return new Promise((res) => {
      const mr = this.mr;
      if (!mr || mr.state === 'inactive') { this.release(); return res(null); }
      mr.onstop = () => {
        this.blob = new Blob(this.chunks, { type: mr.mimeType || 'audio/webm' });
        if (this.url) URL.revokeObjectURL(this.url);
        this.url = this.blob.size ? URL.createObjectURL(this.blob) : '';
        this.release();
        res(this.url);
      };
      mr.stop();
    });
  }

  release() {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }

  get active() { return !!(this.mr && this.mr.state === 'recording'); }
}

/** `confidence` : certitude du moteur sur sa première hypothèse (0–1), absente si le navigateur ne la donne pas. */
export type RecognitionEvent = { type: 'result'; alts: string[]; confidence?: number } | { type: 'error'; code: string } | { type: 'end' };

/** Types minimaux de l'API Web Speech (reconnaissance), absents de lib.dom dans certaines versions. */
interface SRAlternative { transcript: string; confidence: number }
interface SRResult { readonly length: number; [i: number]: SRAlternative; item(i: number): SRAlternative }
interface SRResultList { readonly length: number; [i: number]: SRResult; item(i: number): SRResult }
interface SRInstance {
  lang: string; maxAlternatives: number; interimResults: boolean; continuous: boolean;
  onresult: ((e: { results: SRResultList }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void; stop(): void;
}
type SRCtor = new () => SRInstance;

export class Recognizer {
  private Ctor: SRCtor | null;
  private cur: SRInstance | null = null;
  constructor(private lang: string) {
    const w = globalThis as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
    this.Ctor = w.SpeechRecognition || w.webkitSpeechRecognition || null;
  }
  get supported() { return !!this.Ctor; }
  get active() { return !!this.cur; }

  start(cb: (e: RecognitionEvent) => void) {
    if (!this.Ctor) throw new Error('unsupported');
    const r = new this.Ctor();
    this.cur = r;
    let got = false;
    r.lang = this.lang;
    r.maxAlternatives = 5;
    r.interimResults = false;
    r.continuous = false;
    r.onresult = (e) => {
      got = true;
      const alts: string[] = [];
      let confidence: number | undefined;
      for (let i = 0; i < e.results.length; i++) { const res = e.results[i]; for (let j = 0; j < res.length; j++) { const a = res[j]; if (a?.transcript) { if (!alts.length && typeof a.confidence === 'number' && a.confidence > 0) confidence = a.confidence; alts.push(a.transcript.trim()); } } }
      cb({ type: 'result', alts, confidence });
    };
    r.onerror = (e) => { got = true; cb({ type: 'error', code: e.error }); };
    r.onend = () => { this.cur = null; if (!got) cb({ type: 'error', code: 'no-speech' }); cb({ type: 'end' }); };
    r.start();
  }

  stop() { try { this.cur?.stop(); } catch { /* ignore */ } }
}

/**
 * Reconnaissance CONTINUE (lecture à voix haute) : le moteur reste à l'écoute pendant toute la série et rend des
 * morceaux de texte au fil de l'eau (résultats définitifs seulement). Il se relance tout seul quand le navigateur
 * l'arrête (Chrome coupe après un silence ou au bout d'une minute). `onFatal` : micro refusé, service absent…
 */
export interface ContinuousResult { alts: string[]; t: number }
export class ContinuousRecognizer {
  private Ctor: SRCtor | null;
  private cur: SRInstance | null = null;
  private wanted = false;
  private restarts = 0;
  constructor(private lang: string) {
    const w = globalThis as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
    this.Ctor = w.SpeechRecognition || w.webkitSpeechRecognition || null;
  }
  get supported() { return !!this.Ctor; }

  start(onResult: (r: ContinuousResult) => void, onFatal: (code: string) => void) {
    if (!this.Ctor) return onFatal('unsupported');
    this.wanted = true;
    const run = () => {
      if (!this.wanted || !this.Ctor) return;
      const r = new this.Ctor();
      this.cur = r;
      r.lang = this.lang; r.maxAlternatives = 3; r.interimResults = false; r.continuous = true;
      let done = 0;
      r.onresult = (e) => {
        for (let i = done; i < e.results.length; i++) {
          const res = e.results[i];
          const alts: string[] = [];
          for (let j = 0; j < res.length; j++) if (res[j]?.transcript) alts.push(res[j].transcript.trim());
          if (alts.length) onResult({ alts, t: performance.now() });
        }
        done = e.results.length;
        this.restarts = 0;
      };
      r.onerror = (e) => { if (['not-allowed', 'service-not-allowed', 'language-not-supported', 'audio-capture'].includes(e.error)) { this.wanted = false; onFatal(e.error); } };
      r.onend = () => { this.cur = null; if (this.wanted && this.restarts++ < 50) setTimeout(run, 120); };
      try { r.start(); } catch { setTimeout(run, 400); }
    };
    run();
  }
  stop() { this.wanted = false; try { this.cur?.stop(); } catch { /* ignore */ } this.cur = null; }
}

export const RECOGNITION_ERRORS: Record<string, string> = {
  'not-allowed': 'Accès au micro refusé. Autorisez le micro pour cette page dans le navigateur.',
  'service-not-allowed': 'Le service de reconnaissance vocale est bloqué sur cet appareil.',
  'no-speech': 'Aucune voix détectée. Réessayez en parlant plus près du micro.',
  network: 'La reconnaissance vocale a besoin d’Internet sur cet appareil.',
  'language-not-supported': 'La reconnaissance de cette langue n’est pas disponible sur ce navigateur.',
  'audio-capture': 'Aucun micro trouvé.',
};

export interface PronunciationScorer {
  available: boolean;
  name: string;
  score(blob: Blob, target: string): Promise<{ overall: number; tones?: number[]; phonemes?: number[] } | null>;
}

/** Aucun service branché par défaut : l'interface n'affiche alors aucun score chiffré. */
export const noScorer: PronunciationScorer = { available: false, name: '', async score() { return null; } };

const POLITE_END = /(ครับ|คับ|ค่ะ|คะ|ค่า)$/;

export type Verdict = 'ok' | 'near' | 'ko';

/** Compare ce que le moteur a compris à une ou plusieurs cibles (la particule de politesse finale est facultative). */
export function judgeSpeech(alts: string[], targets: string[]): { sim: number; verdict: Verdict; heard: string } {
  let best = 0, heard = alts[0] || '';
  const forms = (x: string) => { const n = normThai(x), b = n.replace(POLITE_END, ''); return b && b !== n ? [n, b] : [n]; };
  for (const a of alts) for (const t of targets) for (const na of forms(a)) for (const nt of forms(t)) {
    if (!na || !nt) continue;
    const sim = na === nt ? 1 : 1 - lev(na, nt) / Math.max(na.length, nt.length);
    if (sim > best) { best = sim; heard = a; }
  }
  return { sim: best, verdict: best >= 0.999 ? 'ok' : best >= 0.7 ? 'near' : 'ko', heard };
}
