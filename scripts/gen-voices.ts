/**
 * Génère les voix natives (Azure Speech, voix neuronales thaïes) pour tout le contenu de l'application :
 *   - homme : th-TH-NiwatNeural · femme : th-TH-PremwadeeNeural (modifiables par VOICE_M / VOICE_F)
 *   - un MP3 par texte et par voix dans public/voices/{m,f}/<clé>.mp3, et public/voices/manifest.json
 * Idempotent : les clips déjà présents ne sont pas régénérés (on peut relancer après un ajout de contenu).
 *
 * Usage :  AZURE_SPEECH_KEY=… AZURE_SPEECH_REGION=northeurope npx vite-node scripts/gen-voices.ts [--dry]
 * Volume : ≈ 28 000 caractères par voix, largement sous le palier gratuit (500 000 caractères par mois).
 * Débit : le palier gratuit F0 accepte 20 requêtes par minute, soit ≈ 4 h pour les deux voix ; le script
 * s'arrête proprement avant la limite du job GitHub (TIME_BUDGET_MIN, 330 min) et reprend au prochain lancement.
 */
import { mkdirSync, existsSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { collectVoiceTexts, voiceCharacterCount } from '../src/content/voiceTexts';
import { clipKey } from '../src/engine/audio/clipKey';

const KEY = process.env.AZURE_SPEECH_KEY ?? '';
const REGION = process.env.AZURE_SPEECH_REGION ?? '';
const VOICES: Record<'m' | 'f', string> = { m: process.env.VOICE_M ?? 'th-TH-NiwatNeural', f: process.env.VOICE_F ?? 'th-TH-PremwadeeNeural' };
const ONLY = (process.env.VOICES ?? 'm,f').split(',').map((s) => s.trim()).filter((s): s is 'm' | 'f' => s === 'm' || s === 'f');
const OUT = join(process.cwd(), 'public', 'voices');
const DRY = process.argv.includes('--dry');
const FORMAT = 'audio-24khz-48kbitrate-mono-mp3';

const texts = collectVoiceTexts();
console.log(`${texts.length} textes · ${voiceCharacterCount(texts)} caractères par voix · voix : ${ONLY.map((g) => VOICES[g]).join(', ')}`);
if (DRY) process.exit(0);
if (!KEY || !REGION) { console.error('AZURE_SPEECH_KEY et AZURE_SPEECH_REGION sont requis (secrets GitHub ou variables d’environnement).'); process.exit(1); }

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ssml = (voice: string, text: string) => `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="th-TH"><voice name="${voice}">${esc(text)}</voice></speak>`;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Palier gratuit F0 : 20 requêtes par minute. On respecte Retry-After et on patiente autant qu'il faut
// (plutôt que d'abandonner des clips) ; un compte S0 n'est presque jamais freiné.
const WORKERS = Number(process.env.WORKERS ?? 2);
const BUDGET_MS = Number(process.env.TIME_BUDGET_MIN ?? 330) * 60_000; // le job GitHub est coupé à 6 h : on s'arrête avant et on publie l'acquis
const started = Date.now();
const overBudget = () => Date.now() - started > BUDGET_MS;

async function synth(voice: string, text: string): Promise<Buffer> {
  let lastStatus = 0;
  for (let attempt = 0; attempt < 40; attempt++) {
    const r = await fetch(`https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: { 'Ocp-Apim-Subscription-Key': KEY, 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': FORMAT, 'User-Agent': 'langue-thai-voices' },
      body: ssml(voice, text),
    });
    if (r.ok) return Buffer.from(await r.arrayBuffer());
    lastStatus = r.status;
    if (r.status === 429 || r.status >= 500) {
      const retryAfter = Number(r.headers.get('retry-after')) * 1000;
      await sleep(retryAfter > 0 ? retryAfter + 250 : Math.min(60_000, 2000 * 2 ** Math.min(attempt, 5)));
      continue;
    }
    throw new Error(`Azure ${r.status} ${r.statusText} pour « ${text} » : ${await r.text()}`);
  }
  throw new Error(`Azure : trop de tentatives (dernier code ${lastStatus}) pour « ${text} »`);
}

async function run() {
  mkdirSync(OUT, { recursive: true });
  const manifestPath = join(OUT, 'manifest.json');
  const clips: Record<string, string> = existsSync(manifestPath) ? (JSON.parse(readFileSync(manifestPath, 'utf8')).clips ?? {}) : {};
  let made = 0, chars = 0;
  for (const g of ONLY) {
    const dir = join(OUT, g);
    mkdirSync(dir, { recursive: true });
    const present = new Set(readdirSync(dir).filter((f) => f.endsWith('.mp3')).map((f) => f.slice(0, -4)));
    const todo = texts.filter((t) => !present.has(clipKey(t)));
    console.log(`Voix ${g} (${VOICES[g]}) : ${present.size} clips présents, ${todo.length} à générer`);
    let i = 0, failed = 0;
    const worker = async () => {
      while (i < todo.length && !overBudget()) {
        const text = todo[i++];
        const key = clipKey(text);
        try {
          const buf = await synth(VOICES[g], text);
          writeFileSync(join(dir, key + '.mp3'), buf);
          made++; chars += text.length;
          if (made % 50 === 0) console.log(`  … ${made} clips, ${chars} caractères, ${Math.round((Date.now() - started) / 60_000)} min`);
        } catch (e) {
          failed++;
          console.error(String((e as Error).message));
          if (failed >= 5 && made === 0) throw new Error('Cinq échecs d’affilée sans aucun clip produit : vérifiez la clé et la région (secrets AZURE_SPEECH_KEY / AZURE_SPEECH_REGION).');
        }
      }
    };
    await Promise.all(Array.from({ length: Math.max(1, WORKERS) }, worker));
    if (i < todo.length) console.log(`Temps imparti écoulé : ${todo.length - i} clips restants pour la voix ${g}. Relancez le workflow, il reprendra où il s’est arrêté.`);
    // le manifeste reflète les fichiers réellement présents
    for (const f of readdirSync(dir)) if (f.endsWith('.mp3')) { const k = f.slice(0, -4); clips[k] = clips[k]?.includes(g) ? clips[k] : (clips[k] ?? '') + g; }
  }
  // nettoie le manifeste des entrées dont les fichiers manquent
  for (const [k, v] of Object.entries(clips)) {
    const keep = [...v].filter((g) => existsSync(join(OUT, g, k + '.mp3'))).join('');
    if (keep) clips[k] = keep; else delete clips[k];
  }
  writeFileSync(manifestPath, JSON.stringify({ version: Date.now(), voices: VOICES, clips }));
  console.log(`Terminé : ${made} nouveaux clips, ${chars} caractères synthétisés · manifeste : ${Object.keys(clips).length} textes.`);
}

run().catch((e) => { console.error(e); process.exit(1); });
