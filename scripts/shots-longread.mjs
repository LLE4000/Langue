// Lecture longue avec un faux micro (WAV des phrases d'un texte lues par la voix native, voir fake-voice.mjs).
// Usage : BASE=… VOICE=texte.wav TEXT=r:r1 node scripts/shots-longread.mjs
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const BASE = process.env.BASE ?? 'http://localhost:4173', OUT = process.env.OUT ?? 'scripts/out/readaloud', TEXT = process.env.TEXT ?? 'r:r1';
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-audio-capture=${process.env.VOICE}`] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'fr-FR', permissions: ['microphone'], colorScheme: process.env.SCHEME ?? 'light' });
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
await p.goto(BASE + '/#/onboarding');
await p.getByPlaceholder('Prénom').fill('Lucien');
await p.getByRole('button', { name: /Un homme/ }).click();
await p.getByRole('button', { name: /Continuer/ }).click();
await p.getByRole('radio', { name: /Parler, lire et écrire/ }).click();
await p.getByRole('button', { name: /^Continuer$/ }).click();
await p.getByRole('button', { name: /Construire mon parcours/ }).click();
await p.waitForURL(/#\/$/);
await p.goto(`${BASE}/#/read/text/${encodeURIComponent(TEXT)}`); await p.waitForTimeout(500);
await p.screenshot({ path: `${OUT}/long-intro.png` });
await p.getByRole('button', { name: /Commencer la lecture/ }).click();
for (let k = 0; k < 12; k++) { await p.waitForTimeout(1500); console.log(`t=${(k + 1) * 1.5}s`, await p.locator('.ra-count').innerText().catch(() => 'fini')); if (k === 2) await p.screenshot({ path: `${OUT}/long-run.png` }); if (!(await p.locator('.ra-count').count())) break; }
if (await p.getByRole('button', { name: 'Terminer' }).count()) await p.getByRole('button', { name: 'Terminer' }).click();
await p.waitForTimeout(2500);
await p.screenshot({ path: `${OUT}/long-results.png`, fullPage: true });
await p.goto(BASE + '/#/read'); await p.waitForTimeout(500);
await p.screenshot({ path: `${OUT}/hub-texts.png`, fullPage: true });
await b.close();
