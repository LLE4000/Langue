// Capture pleine page de chaque écran (bibliothèque, profil, défis, entraînements), après quelques leçons
// simulées. Usage : BASE=http://localhost:4174 SCHEMES=light,dark node scripts/shots-routes.mjs
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:4173';
const OUT = process.env.OUT ?? 'scripts/out/routes';
mkdirSync(OUT, { recursive: true });
const ROUTES = [
  ['review', '/review'], ['play', '/play'], ['library', '/explore'], ['path', '/path'],
  ['alphabet', '/explore/alphabet'], ['vowels', '/explore/vowels'], ['tones', '/explore/tones'], ['numbers', '/explore/numbers'],
  ['vocab', '/explore/vocab'], ['vocab-theme', '/explore/vocab/sal'], ['dialogs', '/explore/dialogs'], ['dialog', '/explore/dialogs/d:market'],
  ['comprehension', '/explore/comprehension'], ['readings', '/explore/readings'], ['grammar', '/explore/grammar'], ['grammar-item', '/explore/grammar/g:neg'],
  ['classifiers', '/explore/classifiers'], ['phrasebook', '/explore/phrasebook'], ['writing', '/explore/writing'], ['transcription', '/explore/transcription'],
  ['search', '/explore/search?q=kin'], ['listen', '/explore/listen'],
  ['profile', '/profile'], ['progress', '/profile/progress'], ['stats', '/profile/stats'], ['share', '/profile/share'], ['settings', '/profile/settings'],
  ['settings-voice', '/profile/settings?tab=voice'], ['settings-ex', '/profile/settings?tab=exercises'], ['levels', '/profile/levels'], ['data', '/profile/data'], ['people', '/profile/people'],
  ['defi', '/play/defi'], ['duel', '/play/duel'], ['turns', '/play/turns'],
  ['train-flashcards', '/train/flashcards'], ['train-listening', '/train/listening'], ['train-quiz', '/train/quiz'], ['train-match', '/train/match'], ['train-review', '/train/review'],
];
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
for (const scheme of (process.env.SCHEMES ?? 'light,dark').split(',')) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'fr-FR', colorScheme: scheme });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
  await page.goto(BASE + '/#/onboarding');
  await page.getByPlaceholder('Prénom').fill('Lucien');
  await page.getByRole('button', { name: /Un homme/ }).click();
  await page.getByRole('button', { name: /Continuer/ }).click();
  await page.getByRole('radio', { name: /Parler, lire et écrire/ }).click();
  await page.getByRole('button', { name: /^Continuer$/ }).click();
  await page.getByRole('button', { name: /Construire mon parcours/ }).click();
  await page.waitForURL(/#\/$/);
  // Un apprenant de quelques jours : des lettres et des mots vus, deux leçons faites
  await page.evaluate(() => {
    const st = window.__langueStore.getState();
    st.updateSettings({ autoAdvance: false });
    for (const id of ['c:ก', 'c:ด', 'c:ต', 'c:บ', 'c:ป', 'v:–า', 'w:สวัสดี{P}', 'w:ขอบคุณ{P}', 'w:ขอโทษ{P}', 'w:ไม่เป็นไร{P}', 'w:ตา']) { st.answer(id, true); st.answer(id, id.length % 2 === 0); }
    st.recordActivity?.('comp:d:market', 4, 5);
  });
  for (const [name, route] of ROUTES) {
    await page.goto(BASE + '/#' + route);
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${OUT}/${scheme}-${name}.png`, fullPage: true });
  }
  console.log('✓', scheme, ROUTES.length);
  await ctx.close();
}
await browser.close();
