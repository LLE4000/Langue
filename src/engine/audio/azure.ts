/**
 * Évaluation de prononciation Azure (facultative) pour la lecture à voix haute.
 *
 * Azure ne peut pas être appelé avec la clé du dépôt : elle reste secrète (elle ne sert qu'à générer les voix au
 * déploiement). L'apprenant qui le souhaite colle SA clé Azure Speech (niveau gratuit F0) dans Réglages › Voix :
 * elle reste sur cet appareil (stockage local, jamais dans les sauvegardes ni les profils).
 *
 * Ce qu'Azure mesure réellement en thaï (th-TH) : précision de prononciation par mot (0–100), mots omis ou ajoutés,
 * fluidité — en comparant l'audio au texte attendu (évaluation « scriptée », idéale pour la lecture). Ce qu'il NE
 * mesure PAS en thaï : les tons (l'évaluation prosodique n'existe qu'en anglais). Les tons restent jugés par la
 * reconnaissance (un ton faux donne souvent un autre mot) et par la courbe de la voix, présentée comme indicative.
 *
 * Le SDK (lourd) n'est chargé qu'au premier usage.
 */
import { toPcm16 } from './vad';

export interface AzureConfig { key: string; region: string }
export interface AzureWord { word: string; accuracy: number; errorType: string }
const KEY = 'langue.azure';

export function azureConfig(): AzureConfig | null {
  try { const c = JSON.parse(localStorage.getItem(KEY) ?? 'null'); return c?.key && c?.region ? c : null; } catch { return null; }
}
export function saveAzureConfig(c: AzureConfig | null) {
  try { if (c) localStorage.setItem(KEY, JSON.stringify({ key: c.key.trim(), region: c.region.trim().toLowerCase() })); else localStorage.removeItem(KEY); } catch { /* stockage indisponible */ }
}

/**
 * Évalue un bloc de lectures (audio 16 kHz mis bout à bout) par rapport au texte attendu (mots séparés par des espaces).
 * Renvoie les mots dans l'ordre du texte attendu, avec leur précision et leur type d'erreur (None, Mispronunciation,
 * Omission, Insertion…).
 */
export async function assessPronunciation(cfg: AzureConfig, samples: Float32Array, reference: string): Promise<AzureWord[]> {
  const sdk = await import('microsoft-cognitiveservices-speech-sdk');
  const speech = sdk.SpeechConfig.fromSubscription(cfg.key, cfg.region);
  speech.speechRecognitionLanguage = 'th-TH';
  const push = sdk.AudioInputStream.createPushStream(sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1));
  const pcm = toPcm16(samples);
  push.write(pcm.buffer.slice(pcm.byteOffset, pcm.byteOffset + pcm.byteLength) as ArrayBuffer);
  push.close();
  const rec = new sdk.SpeechRecognizer(speech, sdk.AudioConfig.fromStreamInput(push));
  const pa = new sdk.PronunciationAssessmentConfig(reference, sdk.PronunciationAssessmentGradingSystem.HundredMark, sdk.PronunciationAssessmentGranularity.Word, true);
  pa.applyTo(rec);
  const words: AzureWord[] = [];
  try {
    await new Promise<void>((resolve, reject) => {
      rec.recognized = (_s, e) => {
        if (e.result.reason !== sdk.ResultReason.RecognizedSpeech) return;
        const r = sdk.PronunciationAssessmentResult.fromResult(e.result);
        for (const w of r.detailResult?.Words ?? []) words.push({ word: w.Word, accuracy: w.PronunciationAssessment?.AccuracyScore ?? 0, errorType: w.PronunciationAssessment?.ErrorType ?? 'None' });
      };
      rec.canceled = (_s, e) => { if (e.reason === sdk.CancellationReason.Error) reject(new Error(e.errorDetails || 'Azure : erreur')); else resolve(); };
      rec.sessionStopped = () => resolve();
      rec.startContinuousRecognitionAsync(() => {}, (err) => reject(new Error(err)));
    });
  } finally {
    rec.stopContinuousRecognitionAsync(() => rec.close(), () => rec.close());
  }
  return words;
}

/** Vérifie la clé et la région (un demi-seconde de silence) : null si tout va bien, sinon le message d'erreur. */
export async function testAzure(cfg: AzureConfig): Promise<string | null> {
  try { await assessPronunciation(cfg, new Float32Array(8000), 'ดา'); return null; } catch (e) {
    const m = String((e as Error).message ?? e);
    return /401|403|auth|subscription|key/i.test(m) ? 'Clé ou région refusée par Azure.' : /network|websocket|1006/i.test(m) ? 'Azure injoignable (réseau).' : m.slice(0, 160);
  }
}
