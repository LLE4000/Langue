// Tapis de lecture avec un faux micro (fichier WAV de syllabes lues en boucle) : captures du tapis en cours et du bilan.
// Usage : BASE=… VOICE=voice.wav SCHEME=light node scripts/shots-readaloud.mjs
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:4173', OUT = process.env.OUT ?? 'scripts/out/readaloud', SCHEME = process.env.SCHEME ?? 'light';
const SESSION = process.env.SESSION ?? 'ra-01', MODE = process.env.MODE ?? 'read', SECONDS = Number(process.env.SECONDS ?? 40);
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-audio-capture=${process.env.VOICE}`, '--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'fr-FR', colorScheme: SCHEME, permissions: ['microphone'] });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 200)); });
await page.goto(BASE + '/#/onboarding');
await page.getByPlaceholder('Prénom').fill('Lucien');
await page.getByRole('button', { name: /Un homme/ }).click();
await page.getByRole('button', { name: /Continuer/ }).click();
await page.getByRole('radio', { name: /Parler, lire et écrire/ }).click();
await page.getByRole('button', { name: /^Continuer$/ }).click();
await page.getByRole('button', { name: /Construire mon parcours/ }).click();
await page.waitForURL(/#\/$/);
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/${SCHEME}-home.png`, fullPage: true });
await page.goto(BASE + '/#/read'); await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/${SCHEME}-hub.png`, fullPage: true });
await page.goto(`${BASE}/#/read/${SESSION}?mode=${MODE}`); await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/${SCHEME}-${SESSION}-${MODE}-intro.png` });
await page.getByRole('button', { name: /Démarrer/ }).click();
const t0 = Date.now();
let k = 0;
while (Date.now() - t0 < SECONDS * 1000) {
  await page.waitForTimeout(3000);
  const pos = await page.locator('.ra-count').innerText().catch(() => '?');
  console.log(`t=${Math.round((Date.now() - t0) / 1000)}s  ${pos}  ${await page.locator('.ra-status').innerText().catch(() => '')}`.replace(/\n/g, ' | '));
  if (k < 4) await page.screenshot({ path: `${OUT}/${SCHEME}-${SESSION}-${MODE}-belt-${k++}.png` });
  if (!(await page.locator('.ra-count').count())) break;
}
if (await page.getByRole('button', { name: /Terminer et voir le bilan/ }).count()) await page.getByRole('button', { name: /Terminer et voir le bilan/ }).click();
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/${SCHEME}-${SESSION}-${MODE}-results.png`, fullPage: true });
await page.getByRole('button', { name: 'Tout' }).click().catch(() => {});
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/${SCHEME}-${SESSION}-${MODE}-results-all.png`, fullPage: true });
await page.goto(BASE + '/#/read'); await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/${SCHEME}-hub-after.png`, fullPage: true });
await browser.close();
