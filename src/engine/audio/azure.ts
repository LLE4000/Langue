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
 * Service de jetons : la clé ne doit jamais être dans l'application. Le serveur de Langue (server/, Worker Cloudflare)
 * garde la clé et délivre des jetons de 10 minutes ; l'application les demande à `<VITE_SERVER_URL>/azure-token`
 * (réponse JSON { token, region, expiresAt }), les garde jusqu'à leur échéance et n'a besoin d'aucune clé personnelle.
 * Une clé personnelle enregistrée sur l'appareil reste prioritaire (c'est un choix explicite de l'apprenant) et sert
 * aussi de secours si le service ne répond pas.
 *
 * Le SDK (lourd) n'est chargé qu'au premier usage.
 */
import { toPcm16 } from './vad';

export interface AzureConfig { key: string; region: string; tokenUrl?: string }
export interface AzureWord { word: string; accuracy: number; errorType: string }
const KEY = 'langue.azure';

/** Service de jetons configuré au déploiement : VITE_AZURE_TOKEN_URL, sinon le serveur de Langue (VITE_SERVER_URL). */
const SERVER_URL = ((import.meta.env.VITE_SERVER_URL as string | undefined) || '').replace(/\/+$/, '');
const TOKEN_URL = (import.meta.env.VITE_AZURE_TOKEN_URL as string | undefined) || (SERVER_URL ? `${SERVER_URL}/azure-token` : '');
const REGION = (import.meta.env.VITE_AZURE_REGION as string | undefined) || 'northeurope';

/** Clé personnelle enregistrée sur cet appareil (Réglages › Voix), sinon null. */
export function personalAzure(): AzureConfig | null {
  try { const c = JSON.parse(localStorage.getItem(KEY) ?? 'null'); return c?.key && c?.region ? { key: c.key, region: c.region } : null; } catch { return null; }
}
/** D'où vient l'évaluation Azure : clé personnelle, service de jetons de l'application, ou rien. */
export const azureSource = (): 'personal' | 'service' | null => (personalAzure() ? 'personal' : TOKEN_URL ? 'service' : null);

export function azureConfig(): AzureConfig | null {
  return personalAzure() ?? (TOKEN_URL ? { key: '', region: REGION, tokenUrl: TOKEN_URL } : null);
}

let tokenCache: { url: string; token: string; region: string; expiresAt: number } | null = null;
/** Jeton du service, gardé jusqu'à 30 s avant son échéance (un appel réseau toutes les ~9 minutes au plus). */
async function serviceToken(url: string): Promise<{ token: string; region: string }> {
  if (tokenCache && tokenCache.url === url && Date.now() < tokenCache.expiresAt - 30_000) return tokenCache;
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) throw new Error(r.status === 429 ? 'service de jetons saturé, réessayez plus tard' : r.status === 503 ? 'service Azure non configuré' : `jeton refusé (${r.status})`);
  const t = (await r.json()) as { token: string; region?: string; expiresAt?: number };
  tokenCache = { url, token: t.token, region: t.region || REGION, expiresAt: t.expiresAt && t.expiresAt > Date.now() ? t.expiresAt : Date.now() + 8 * 60_000 };
  return tokenCache;
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
  let speech;
  if (cfg.tokenUrl) {
    // service de jetons : la clé reste sur le serveur ; secours sur une clé personnelle s'il ne répond pas
    try {
      const { token, region } = await serviceToken(cfg.tokenUrl);
      speech = sdk.SpeechConfig.fromAuthorizationToken(token, region);
    } catch (e) {
      const own = personalAzure();
      if (!own) throw e;
      speech = sdk.SpeechConfig.fromSubscription(own.key, own.region);
    }
  } else speech = sdk.SpeechConfig.fromSubscription(cfg.key, cfg.region);
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
